import { useEffect, useMemo, useState } from "react";
import { useList, useOne, useWarnAboutChange, type CrudFilters } from "@refinedev/core";
import { useSessionOwner } from "../../hooks/useSessionOwner";
import { useNavigate } from "react-router";
import { useCommerceLedger } from "../../hooks/useCommerceLedger";
import { CommerceWorkflowStatus } from "../../components/CommerceWorkflowStatus";
import { useDefaultOrganization } from "../../hooks/useDefaultOrganization";
import { canonicalMoney, hasCommerceAuthority, isTestOrganization, newCommerceCommand, type CommerceCommand, type CommerceState } from "../../services/stockLedger";
import { Autocomplete, TextField } from "@mui/material";
import { ERP_QUERY_OPTIONS, type ErpRecord } from "../../services/erp";
import { reportUuid } from "../../services/operationalReports";
import { PurchaseOrderCreate } from "./purchaseOrderCreate";
import type { PurchaseOrderProduct, PurchaseOrderSupplier, PurchaseOrderVariant } from "./purchaseOrderDraft";

const SORT_NAME = [{ field: "name", order: "asc" as const }];
const PAGE = { mode: "server" as const, currentPage: 1, pageSize: 20 };
const CHILD_PAGE = { mode: "server" as const, currentPage: 1, pageSize: 100 };
const NONE = "00000000-0000-4000-8000-000000000000";
type Organization = { owner: string; id: string; name: string; currency: string; authority: boolean };
const text = (value: unknown) => typeof value === "string" ? value : "";
const money = (value: unknown) => typeof value === "string" || typeof value === "number" ? value : null;

/** Read-only lookup owner; a transactional command must be supplied separately before any draft can be saved. */
export function PurchaseOrderWorkspace() {
  const { identity, owner } = useSessionOwner();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationInput, setOrganizationInput] = useState("");
  const [supplierInput, setSupplierInput] = useState("");
  const [productInput, setProductInput] = useState("");
  const [organizationTerm, setOrganizationTerm] = useState("");
  const [supplierTerm, setSupplierTerm] = useState("");
  const [productTerm, setProductTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setOrganizationTerm(organizationInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [organizationInput]);
  useEffect(() => {
    const timer = window.setTimeout(() => setSupplierTerm(supplierInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [supplierInput]);
  useEffect(() => {
    const timer = window.setTimeout(() => setProductTerm(productInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [productInput]);

  const orgFilters = useMemo<CrudFilters>(() => organizationTerm ? [{ field: "name", operator: "contains", value: organizationTerm }] : [], [organizationTerm]);
  const orgMeta = useMemo(() => ({ lookupOwner: owner }), [owner]);
  const organizations = useList<ErpRecord>({ resource: "organizations", filters: orgFilters, sorters: SORT_NAME, pagination: PAGE, meta: orgMeta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!owner }, errorNotification: false });
  const orgOptions = (owner && !organizations.query.isError ? organizations.result.data : []).filter(row => row.is_active !== false && !row.deleted_at && reportUuid(row.id) && text(row.name).trim() && !isTestOrganization(row)).map(row => ({ owner, id: row.id, name: text(row.name), currency: text(row.default_currency) || text(row.currency), authority: hasCommerceAuthority(row) }));
  const selected = organization?.owner === owner && owner ? organization : null;
  // Prefer organizations that can save purchase orders; otherwise still preselect so lookups load.
  const defaultCandidates = orgOptions.some(option => option.authority) ? orgOptions.filter(option => option.authority) : orgOptions;
  useDefaultOrganization(selected?.id ?? "", defaultCandidates.map(option => option.id), id => { const match = defaultCandidates.find(option => option.id === id); if (match) setOrganization(match); }, !!owner && !organizationTerm && !organizations.query.isLoading && !organizations.query.isFetching && !organizations.query.isError);
  const orgId = selected?.id ?? "";
  const ledger = useCommerceLedger(orgId, !!selected?.authority && !organizations.query.isFetching && !organizations.query.isError && orgOptions.some(option => option.id === orgId && option.authority));
  const [dirty, setDirty] = useState(false);
  const [exitPath, setExitPath] = useState("");
  const navigate = useNavigate();
  const {warnWhen, setWarnWhen} = useWarnAboutChange();
  useEffect(() => { setWarnWhen(dirty || !!ledger.pending); return () => setWarnWhen(false); }, [dirty, ledger.pending, setWarnWhen]);
  useEffect(() => { if (exitPath && !dirty && !ledger.pending && !warnWhen) void navigate(exitPath); }, [exitPath, dirty, ledger.pending, warnWhen, navigate]);
  const complete = (state: CommerceState, command: CommerceCommand) => {
    if (command.action !== "create_purchase_order" || !state.documents[command.request_id]) return;
    setDirty(false); setExitPath(`/purchase-orders/show/${command.request_id}?organization=${orgId}`);
  };

  useEffect(() => { setSelectedProductId(null); setSelectedSupplierId(null); }, [owner, orgId]);
  const supplierFilters = useMemo<CrudFilters>(() => [
    { field: "organization_id", operator: "eq", value: orgId },
    { field: "is_active", operator: "eq", value: true },
    { field: "deleted_at", operator: "null", value: true },
    ...(supplierTerm ? [{ field: "name", operator: "contains" as const, value: supplierTerm }] : []),
  ], [orgId, supplierTerm]);
  const productFilters = useMemo<CrudFilters>(() => [
    { field: "organization_id", operator: "eq", value: orgId },
    { field: "is_active", operator: "eq", value: true },
    { field: "deleted_at", operator: "null", value: true },
    ...(productTerm ? [{ field: "name", operator: "contains" as const, value: productTerm }] : []),
  ], [orgId, productTerm]);
  const suppliersQuery = useList<ErpRecord>({ resource: "suppliers", filters: supplierFilters, sorters: SORT_NAME, pagination: PAGE, meta: orgMeta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orgId }, errorNotification: false });
  const productsQuery = useList<ErpRecord>({ resource: "products", filters: productFilters, sorters: SORT_NAME, pagination: PAGE, meta: orgMeta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orgId }, errorNotification: false });

  const productDetail = useOne<ErpRecord>({ resource: "products", id: selectedProductId ?? NONE, meta: orgMeta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orgId && !!selectedProductId }, errorNotification: false });
  const variantFilters = useMemo<CrudFilters>(() => [
    { field: "organization_id", operator: "eq", value: orgId },
    { field: "product_id", operator: "eq", value: selectedProductId ?? NONE },
    { field: "is_active", operator: "eq", value: true },
    { field: "deleted_at", operator: "null", value: true },
  ], [orgId, selectedProductId]);
  const supplierLinkFilters = useMemo<CrudFilters>(() => [
    { field: "product_id", operator: "eq", value: selectedProductId ?? NONE },
    { field: "supplier_id", operator: "eq", value: selectedSupplierId ?? NONE },
  ], [selectedProductId, selectedSupplierId]);
  const variantsQuery = useList<ErpRecord>({ resource: "product_variants", filters: variantFilters, pagination: CHILD_PAGE, meta: orgMeta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orgId && !!selectedProductId }, errorNotification: false });
  const linksQuery = useList<ErpRecord>({ resource: "product_supplier", filters: supplierLinkFilters, pagination: CHILD_PAGE, meta: orgMeta, queryOptions: { ...ERP_QUERY_OPTIONS, enabled: !!orgId && !!selectedProductId && !!selectedSupplierId }, errorNotification: false });

  const suppliers: PurchaseOrderSupplier[] = suppliersQuery.result.data.filter(row => row.organization_id === orgId && reportUuid(row.id) && text(row.name)).map(row => ({ id: row.id, name: text(row.name), currency: text(row.currency) || null }));
  const variants: PurchaseOrderVariant[] = variantsQuery.result.data.filter(row => row.organization_id === orgId && row.product_id === selectedProductId && row.is_active !== false && !row.deleted_at && reportUuid(row.id)).map(row => ({ id: row.id, title: text(row.title), sku: text(row.sku), purchase_price: money(row.purchase_price), is_active: true, deleted_at: null }));
  const links = linksQuery.result.data.filter(row => row.product_id === selectedProductId && row.supplier_id === selectedSupplierId).map(row => ({ supplier_id: text(row.supplier_id), cost_price: money(row.cost_price), supplier_sku: text(row.supplier_sku) }));
  const productRows = [...productsQuery.result.data];
  if (selectedProductId && productDetail.result?.id === selectedProductId && productDetail.result.organization_id === orgId && productDetail.result.is_active !== false && !productDetail.result.deleted_at && !productRows.some(row => row.id === selectedProductId)) productRows.push(productDetail.result);
  const products: PurchaseOrderProduct[] = productRows.filter(row => row.type === "standard" && row.tracking_type === "none" && row.has_variants !== true && row.organization_id === orgId && row.is_active !== false && !row.deleted_at && reportUuid(row.id) && text(row.name)).map(row => ({
    id: row.id, name: text(row.name), sku: text(row.sku), price: money(row.price), purchase_price: money(row.purchase_price), has_variants: row.has_variants === true,
    variants: row.id === selectedProductId ? variants : [], supplier_costs: row.id === selectedProductId ? links : [],
  }));
  const childError = !!selectedProductId && (productDetail.query.isError || variantsQuery.query.isError || (variantsQuery.result.total ?? 0) > CHILD_PAGE.pageSize || (productDetail.result && (productDetail.result.organization_id !== orgId || productDetail.result.id !== selectedProductId || productDetail.result.is_active === false || !!productDetail.result.deleted_at)));
  const linkError = !!selectedProductId && !!selectedSupplierId && (linksQuery.query.isError || (linksQuery.result.total ?? 0) > CHILD_PAGE.pageSize);
  const noOrganizations = !!owner && !organizationTerm && !organizations.query.isLoading && !organizations.query.isFetching && !organizations.query.isError && organizations.result.total === 0;
  const failed = (!owner && !identity.isLoading && !identity.isFetching) || noOrganizations || organizations.query.isError || suppliersQuery.query.isError || productsQuery.query.isError || childError || linkError;
  const loading = identity.isLoading || identity.isFetching || organizations.query.isLoading || organizations.query.isFetching || !selected || suppliersQuery.query.isLoading || productsQuery.query.isLoading || (!!selectedProductId && (productDetail.query.isLoading || variantsQuery.query.isLoading)) || (!!selectedProductId && !!selectedSupplierId && linksQuery.query.isLoading);
  const status = failed ? "error" : loading ? "loading" : "ready";
  const options = selected && !orgOptions.some(option => option.id === selected.id) ? [selected, ...orgOptions] : orgOptions;
  const selector = <Autocomplete options={options} value={selected} filterOptions={items => items} isOptionEqualToValue={(a, b) => a.id === b.id && a.owner === b.owner} getOptionLabel={item => item.name} loading={organizations.query.isFetching} disabled={!owner || dirty || !!ledger.pending || ledger.busy} onInputChange={(_, value, reason) => { if (reason === "input") setOrganizationInput(value); }} onChange={(_, value) => { setOrganization(value); setSelectedProductId(null); setSelectedSupplierId(null); }} renderInput={params => <TextField {...params} label="Organization" required helperText="Choose a permitted organization before adding a purchase order." error={organizations.query.isError} />} />;
  return <PurchaseOrderCreate key={`${owner}:${orgId}`} scopeKey={`${owner}:${orgId}`} organizationSelector={selector} suppliers={suppliers} products={products.filter(product => !product.has_variants)} confirmBeforeSubmit onDirtyChange={setDirty} externalLocked={ledger.busy || !!ledger.pending || !!exitPath} workflowStatus={<CommerceWorkflowStatus ledger={ledger} onRecovered={complete} />} writeBlocker={ledger.enabled ? "" : "The reconciled purchase workflow is not available for this organization."} onSubmit={async draft => {
    const command = newCommerceCommand({action:"create_purchase_order", reason:"Create purchase order", document:{ supplier_id:draft.supplier_id, order_date:draft.order_date, expected_date:draft.expected_date || null, currency:draft.currency, notes:draft.notes, tax:canonicalMoney(draft.tax), shipping:canonicalMoney(draft.shipping), items:draft.items.map(line => ({line_id:crypto.randomUUID(),product_id:line.product_id,product_variant_id:null,quantity:line.quantity,unit_cost:canonicalMoney(line.unit_cost),supplier_sku:line.supplier_sku || null})) }});
    const state = await ledger.execute(command);
    if (!state) throw new Error("Save not confirmed. Follow the workflow request status before trying again.");
    complete(state, command);
  }} lookupStatus={status} lookupError={noOrganizations ? "No permitted organizations are available for this account." : failed ? "The permitted catalogue could not be completely verified; retry after access is restored." : !selected ? "Select an organization." : undefined} organizationCurrency={selected?.currency ?? ""} onSupplierSearch={setSupplierInput} onProductSearch={setProductInput} onProductSelected={setSelectedProductId} onSupplierSelected={setSelectedSupplierId} />;
}
