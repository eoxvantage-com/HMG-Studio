import { useEffect, useMemo, useRef, useState } from "react";
import { useList, type CrudFilters, type CrudSorting } from "@refinedev/core";
import { Link } from "react-router";
import { Alert, Breadcrumb, Button, Card, Col, Descriptions, Empty, Image, Input, QRCode, Row, Select, Skeleton, Space, Statistic, Tag, Typography } from "antd";
import { ProTable, type ProColumns } from "@ant-design/pro-components";
import JsBarcode from "jsbarcode";
import { useTheme } from "@mui/material/styles";
import { RecordExportActions } from "../../components/RecordExportActions";
import { HmgAntProvider } from "../../components/HmgAntProvider";
import { useRecordNames as useNames, recordIds as idsFor } from "../../hooks/useRecordNames";
import { PrivateProductImage } from "../../components/PrivateProductImage";
import type { ErpModule } from "../../erp/modules";
import { ERP_QUERY_OPTIONS, displayValue, getErpResource, writeBlocker, type ErpRecord, type ErpResource } from "../../services/erp";
import { presentationValue } from "../../services/erpPresentation";
import { barcodeIdentity, finiteNumber, inventoryFilters, inventoryMetrics, money, productImageUrl, stockLocationChart } from "../../services/inventory";

const { Text, Title, Paragraph } = Typography;
const text = (value: unknown) => typeof value === "string" && value.trim() ? value : "Not available";
export function InventoryList({ resource, module }: { resource: ErpResource; module: ErpModule }) {
  const [search, setSearch] = useState("");
  const [term, setTerm] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sorters, setSorters] = useState<CrudSorting>([{ field: "name", order: "asc" }]);
  useEffect(() => { const timer = window.setTimeout(() => { setPage(1); setTerm(search); }, 350); return () => window.clearTimeout(timer); }, [search]);
  const filters = useMemo(() => inventoryFilters(term, active), [term, active]);
  // Ant is controlled presentation only: Refine owns the sole products request.
  const { result, query } = useList<ErpRecord>({ resource: "products", filters, sorters, pagination: { currentPage: page, pageSize: size, mode: "server" }, queryOptions: ERP_QUERY_OPTIONS, errorNotification: false });
  const rows = query.isError ? [] : result.data;
  const categories = useNames("product_categories", idsFor(rows, "category_id"));
  const locations = useNames("product_locations", idsFor(rows, "location_id"));
  const blocker = writeBlocker(resource, "create");
  const columns: ProColumns<ErpRecord>[] = [
    { title: "Product", dataIndex: "name", sorter: true, sortOrder: sorters[0]?.field === "name" ? sorters[0].order === "asc" ? "ascend" : "descend" : null, render: (_, row) => <Space direction="vertical" size={0}><Link to={`${module.path}/show/${encodeURIComponent(row.id)}`}>{text(row.name)}</Link><Text type="secondary">{text(row.sku)} · {categories.label(row.category_id)}</Text></Space> },
    { title: "Location", dataIndex: "location_id", render: (_, row) => locations.label(row.location_id) },
    { title: "On hand", dataIndex: "stock", align: "right", sorter: true, render: (_, row) => inventoryMetrics(row).stock?.toLocaleString() ?? "Not available" },
    { title: "Selling price", dataIndex: "selling_price", align: "right", sorter: true, render: (_, row) => presentationValue(resource, { name: "selling_price", type: "number" }, row.selling_price, { currency: typeof row.currency === "string" ? row.currency : undefined }) },
    { title: "Status", dataIndex: "is_active", render: (_, row) => <Tag color={row.is_active === true ? "success" : "default"}>{row.is_active === true ? "Active" : row.is_active === false ? "Inactive" : "Unknown"}</Tag> },
    { title: "Actions", valueType: "option", align: "right", render: (_, row) => <Link aria-label={`View ${text(row.name)}`} to={`${module.path}/show/${encodeURIComponent(row.id)}`}>View</Link> },
  ];
  const empty = term.trim() ? "No results found" : active ? "No matching items" : "No products yet";
  return <HmgAntProvider><Space direction="vertical" size="large" style={{ width: "100%" }}>
    <Breadcrumb items={[{ title: <Link to="/">Workspace</Link> }, { title: "Inventory" }]} />
    <Row justify="space-between" align="middle" gutter={[16, 16]}><Col><Title level={2} style={{ margin: 0 }}>Inventory</Title><Text type="secondary">Product catalogue, stock and commercial information</Text></Col><Col><Link to={`${module.path}/create`}><Button type="primary">Add product</Button></Link></Col></Row>
    {blocker && <Alert type="info" showIcon message="Read-only catalogue" description={blocker} />}
    <Space wrap align="end"><Space direction="vertical" size={4}><label htmlFor="inventory-search">Search products</label><Input id="inventory-search" placeholder="Name, SKU or barcode" value={search} onChange={event => setSearch(event.target.value)} allowClear style={{ width: 280, maxWidth: "100%" }} /></Space><Space direction="vertical" size={4}><label htmlFor="inventory-status">Status</label><Select id="inventory-status" aria-label="Filter active" value={active} onChange={value => { setPage(1); setActive(value); }} style={{ minWidth: 170 }} options={[{ value: "", label: "All statuses" }, { value: "true", label: "Active" }, { value: "false", label: "Inactive" }]} /></Space><Button loading={query.isFetching} onClick={() => query.refetch()}>Refresh</Button></Space>
    {!query.isFetching && !query.isError && rows.length > 0 && <RecordExportActions title="Inventory" columns={[{ key: "product", label: "Product / SKU / Category" }, { key: "location", label: "Location" }, { key: "stock", label: "On-hand stock" }, { key: "selling", label: "Selling price" }, { key: "status", label: "Status" }]} rows={rows.map(row => ({ product: `${text(row.name)} / ${text(row.sku)} / ${categories.label(row.category_id)}`, location: locations.label(row.location_id), stock: inventoryMetrics(row).stock?.toLocaleString() ?? "Not available", selling: presentationValue(resource, { name: "selling_price", type: "number" }, row.selling_price, { currency: typeof row.currency === "string" ? row.currency : undefined }), status: row.is_active === true ? "Active" : row.is_active === false ? "Inactive" : "Unknown" }))} scopeLabel="Current visible inventory page only; active filters applied" filename="inventory-current-page" />}
    {(search || active) && <Space wrap>{search && <Tag closable onClose={() => setSearch("")}>Search: {search}</Tag>}{active && <Tag closable onClose={() => { setPage(1); setActive(""); }}>Status: {active === "true" ? "Active" : "Inactive"}</Tag>}<Button type="link" onClick={() => { setPage(1); setSearch(""); setActive(""); }}>Clear all filters</Button></Space>}
    {query.isLoading ? <Card role="status" aria-label="Loading inventory"><Skeleton active /></Card> : query.isError ? <Alert type="error" showIcon message="Unable to load products" description="Check your access or try again. No data has been changed." action={<Button onClick={() => query.refetch()}>Try again</Button>} /> : <>
      {result.total === undefined && <Alert type="warning" message="Total count unavailable; pagination cannot be confirmed." />}
      <ProTable<ErpRecord> rowKey="id" columns={columns} dataSource={rows} loading={query.isFetching} search={false} options={false} toolBarRender={false} scroll={{ x: 760 }}
        locale={{ emptyText: <Empty description={<><strong>{empty}</strong><Paragraph>{term || active ? "Try adjusting your search or filters." : "No records are available in your current scope."}</Paragraph></>} /> }}
        pagination={result.total === undefined ? false : { current: page, pageSize: size, total: result.total, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100], showTotal: total => `${total} products` }}
        onChange={(pagination, _filters, sorter) => { setPage(pagination.current ?? 1); setSize(pagination.pageSize ?? 10); const selected = Array.isArray(sorter) ? sorter[0] : sorter; const field = String(selected.field ?? "name"); setSorters([{ field: ["name", "stock", "selling_price"].includes(field) ? field : "name", order: selected.order === "descend" ? "desc" : "asc" }]); }} />
    </>}
  </Space></HmgAntProvider>;
}

function ProductCodes({ record }: { record: ErpRecord }) {
  const identity = barcodeIdentity(record);
  const svg = useRef<SVGSVGElement>(null);
  const [barcodeError, setBarcodeError] = useState(false);
  const [qrMode, setQrMode] = useState("sku");
  useEffect(() => {
    setBarcodeError(false);
    if (!svg.current || !identity.format) return;
    try { JsBarcode(svg.current, identity.value, { format: identity.format, displayValue: true, height: 52, margin: 8, width: 1.5 }); }
    catch { setBarcodeError(true); }
  }, [identity.value, identity.format]);
  const qr = qrMode === "sku" ? typeof record.sku === "string" ? record.sku : "" : `${window.location.origin}/inventory/show/${encodeURIComponent(record.id)}`;
  return <Card title="Product identity" className="inventory-codes">
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      <Text strong>{identity.preview ? "SKU barcode preview — not a saved physical barcode" : "Stored barcode"}</Text>
      {identity.format && !barcodeError ? <svg ref={svg} role="img" aria-label={`${identity.preview ? "SKU preview" : "Barcode"}: ${identity.value}`} style={{ maxWidth: "100%" }} /> : <Alert type="info" message={identity.value ? "Barcode format is unavailable or unsupported; stored value is shown unchanged." : "No barcode or SKU available."} description={identity.value || undefined} />}
      <Text type="secondary">Preview and print do not save or assign a code.</Text>
      <Select className="inventory-no-print" aria-label="QR code content" value={qrMode} onChange={setQrMode} options={[{ value: "sku", label: "QR: SKU" }, { value: "link", label: "QR: Product link" }]} />
      {qr && qr.length <= 1024 ? <div aria-label={`QR code for ${qrMode === "sku" ? "SKU" : "product link"}`}><QRCode type="svg" value={qr} size={144} /></div> : <Text>QR content unavailable</Text>}
      <Text type="secondary">{qrMode === "link" ? "Product link requires an authorized app session." : "Encodes the SKU only."}</Text>
      <Button className="inventory-no-print" onClick={() => window.print()}>Print product identity</Button>
    </Space>
    <style>{`@media print { body * { visibility: hidden !important; } body:not(:has(.hmg-export-document)) .inventory-codes, body:not(:has(.hmg-export-document)) .inventory-codes * { visibility: visible !important; } .inventory-codes { position: absolute; inset: 0 auto auto 0; width: 100%; box-shadow: none; } .inventory-no-print, .inventory-no-print * { display: none !important; } }`}</style>
  </Card>;
}

function ProductMedia({ record }: { record: ErpRecord }) {
  const url = productImageUrl(record.image) ?? productImageUrl(record.thumbnail);
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [url]);
  if (typeof record.image === "string" && record.image.startsWith("storage://")) return <Card title="Product image"><PrivateProductImage source={record.image} alt={text(record.name)} /></Card>;
  return <Card title="Product image">{url && !failed ? <Image src={url} alt={text(record.name)} width="100%" height={260} style={{ objectFit: "cover" }} preview={false} onError={() => setFailed(true)} loading="lazy" referrerPolicy="no-referrer" /> : <Empty description={failed ? "Product image could not be loaded" : "No verified product image available"} />}</Card>;
}

export function ProductOverview({ record }: { record: ErpRecord }) {
  const metrics = inventoryMetrics(record);
  const categories = useNames("product_categories", idsFor([record], "category_id"));
  const locations = useNames("product_locations", idsFor([record], "location_id"));
  const minimum = finiteNumber(record.min_stock);
  const stockStatus = metrics.stock === null ? "Stock not confirmed" : metrics.stock <= 0 ? "Out of stock" : minimum !== null && metrics.stock <= minimum ? "Low stock" : "In stock";
  return <HmgAntProvider><Space direction="vertical" size="large" style={{ width: "100%" }}>
    {metrics.catalogue && <Alert type="info" showIcon message="Catalogue reference — physical stock not verified" description="This website catalogue entry is not a physical slab record. Prices, costs and quantities must be verified before operational use." />}
    <Row gutter={[16, 16]}>{[
      ["On-hand stock", metrics.stock?.toLocaleString() ?? "Not available", record.has_variants === true ? "Variant totals require a verified aggregate" : stockStatus],
      ["Selling price", money(metrics.selling, record.currency), "Per recorded unit"],
      ["Purchase cost", money(metrics.purchase, record.currency), "Per recorded unit"],
      ["Indicative selling value", money(metrics.value, record.currency), "On hand × selling price; not an accounting valuation"],
    ].map(([title, value, note]) => <Col xs={24} sm={12} xl={6} key={title}><Card style={{ height: "100%" }}><Statistic title={title} value={value} /><Text type="secondary">{note}</Text></Card></Col>)}</Row>
    <Row gutter={[24, 24]}><Col xs={24} lg={16}><Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Card title="Product overview"><Descriptions column={{ xs: 1, sm: 2 }} items={[
        { key: "sku", label: "SKU", children: text(record.sku) }, { key: "category", label: "Category", children: categories.label(record.category_id) },
        { key: "location", label: "Default location", children: locations.label(record.location_id) }, { key: "type", label: "Product type", children: text(record.type) },
        { key: "tracking", label: "Tracking", children: text(record.tracking_type) }, { key: "variants", label: "Variants", children: record.has_variants === true ? "Variant managed" : record.has_variants === false ? "No variants" : "Not available" },
        { key: "description", label: "Description", children: text(record.description), span: "filled" }, { key: "notes", label: "Notes", children: text(record.notes), span: "filled" },
      ]} /></Card>
      <Card title="Pricing and replenishment"><Descriptions column={{ xs: 1, sm: 2 }} items={[
        { key: "currency", label: "Currency", children: text(record.currency) }, { key: "margin", label: "Indicative gross margin", children: metrics.margin === null ? "Not available" : `${metrics.margin.toFixed(1)}%` },
        ...["min_stock", "max_stock", "reorder_point", "reorder_quantity"].map(field => ({ key: field, label: ({ min_stock: "Minimum stock", max_stock: "Maximum stock", reorder_point: "Reorder point", reorder_quantity: "Reorder quantity" })[field], children: finiteNumber(record[field])?.toLocaleString() ?? "Not available" })),
        { key: "updated", label: "Last updated", children: displayValue({ name: "updated_at", type: "datetime" }, record.updated_at) },
      ]} /><Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 16 }}>On-hand quantities do not represent available-to-promise stock. Reservations, transfers and variant totals are not inferred from partial pages.</Paragraph></Card>
    </Space></Col><Col xs={24} lg={8}><Space direction="vertical" size="large" style={{ width: "100%" }}><ProductMedia record={record} /><ProductCodes record={record} /></Space></Col></Row>
  </Space></HmgAntProvider>;
}

/** Accessible page-scoped bars; the existing stock table remains the exact-value fallback. */
function LocationStockChart({ rows, total, label }: { rows: ErpRecord[]; total: number | undefined; label: (id: unknown) => string }) {
  const theme = useTheme();
  const chart = stockLocationChart(rows, total);
  const max = Math.max(1, ...chart.points.map(point => Math.abs(point.quantity)));
  const signed = chart.points.some(point => point.quantity < 0);
  const origin = signed ? 250 : 0;
  const width = signed ? 250 : 500;
  const summary = chart.points.map(point => `${label(point.location)}: ${point.quantity.toLocaleString()}`).join("; ");
  return <Card size="small" title={chart.complete ? "All accessible recorded locations" : "Locations on this page"}>
    <Text type="secondary">Recorded location quantities only, not an available-stock total. Exact values are in the table below.</Text>
    {chart.omitted > 0 && <Paragraph type="secondary">Some location quantities cannot be charted; see the table for unavailable or duplicate records.</Paragraph>}
    {chart.points.length > 0 ? <div role="img" aria-label={`Location quantities: ${summary}`}>
      {chart.points.map(point => {
        const bar = Math.abs(point.quantity) / max * width;
        return <div key={point.id} style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}><Text style={{ overflowWrap: "anywhere" }}>{label(point.location)}</Text><Text strong style={{ flexShrink: 0 }}>{point.quantity.toLocaleString()}</Text></div>
          <svg aria-hidden="true" viewBox="0 0 500 24" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: 24 }}>
            <line x1={origin} x2={origin} y1={0} y2={24} stroke={theme.palette.divider} />
            <rect x={point.quantity < 0 ? origin - bar : origin} y={2} width={bar} height={20} rx={3} fill={point.quantity < 0 ? theme.palette.error.main : theme.palette.primary.main} />
          </svg>
        </div>;
      })}
    </div> : <Paragraph>No valid quantities available to chart.</Paragraph>}
  </Card>;
}

/** Mounted only for an expanded related section; page-level quantities are never summed as totals. */
export function InventoryRelated({ kind, record, onCount }: { kind: "stock" | "suppliers"; record: ErpRecord; onCount: (total: number | undefined) => void }) {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const filters = useMemo<CrudFilters>(() => [{ field: "product_id", operator: "eq", value: record.id }], [record.id]);
  const sorters = useMemo<CrudSorting>(() => [{ field: "id", order: "asc" }], []);
  const { result, query } = useList<ErpRecord>({ resource: kind === "stock" ? "product_location_stocks" : "product_supplier", filters, sorters, pagination: { currentPage: page, pageSize: size, mode: "server" }, queryOptions: ERP_QUERY_OPTIONS, errorNotification: false });
  const rows = query.isError ? [] : result.data;
  const refs = useNames(kind === "stock" ? "product_locations" : "suppliers", idsFor(rows, kind === "stock" ? "location_id" : "supplier_id"));
  const warehouses = useNames("warehouses", kind === "stock" ? idsFor(refs.rows, "warehouse_id") : []);
  useEffect(() => onCount(query.isLoading || query.isError ? undefined : result.total), [query.isLoading, query.isError, result.total, onCount]);
  const columns: ProColumns<ErpRecord>[] = kind === "stock" ? [
    { title: "Warehouse", render: (_, row) => warehouses.label(refs.rows.find(location => location.id === row.location_id)?.warehouse_id) },
    { title: "Location", dataIndex: "location_id", render: (_, row) => refs.label(row.location_id) },
    { title: "On-hand quantity", dataIndex: "quantity", align: "right", render: (_, row) => finiteNumber(row.quantity)?.toLocaleString() ?? "Not available" },
  ] : [
    { title: "Supplier", dataIndex: "supplier_id", render: (_, row) => refs.label(row.supplier_id) },
    { title: "Supplier SKU", dataIndex: "supplier_sku", render: (_, row) => text(row.supplier_sku) },
    { title: "Cost", dataIndex: "cost_price", align: "right", render: (_, row) => cost(row) },
    { title: "Lead time (days)", dataIndex: "lead_time_days", align: "right", render: (_, row) => finiteNumber(row.lead_time_days)?.toLocaleString() ?? "Not available" },
    { title: "Minimum order", dataIndex: "minimum_order_quantity", align: "right", render: (_, row) => finiteNumber(row.minimum_order_quantity)?.toLocaleString() ?? "Not available" },
    { title: "Primary", dataIndex: "is_primary", render: (_, row) => row.is_primary === true ? "Yes" : row.is_primary === false ? "No" : "Not available" },
  ];
  const cost = (row: ErpRecord) => {
    const currency = refs.rows.find(supplier => supplier.id === row.supplier_id)?.currency;
    return presentationValue(getErpResource("product_supplier")!, { name: "cost_price", type: "number" }, row.cost_price, { currency: typeof currency === "string" ? currency : undefined });
  };
  const exportColumns = kind === "stock" ? [{ key: "warehouse", label: "Warehouse" }, { key: "location", label: "Location" }, { key: "quantity", label: "On-hand quantity" }] : [{ key: "supplier", label: "Supplier" }, { key: "sku", label: "Supplier SKU" }, { key: "cost", label: "Cost" }, { key: "lead", label: "Lead time (days)" }, { key: "minimum", label: "Minimum order" }, { key: "primary", label: "Primary" }];
  const exportRows = rows.map(row => kind === "stock" ? { warehouse: warehouses.label(refs.rows.find(location => location.id === row.location_id)?.warehouse_id), location: refs.label(row.location_id), quantity: finiteNumber(row.quantity)?.toLocaleString() ?? "Not available" } : { supplier: refs.label(row.supplier_id), sku: text(row.supplier_sku), cost: cost(row), lead: finiteNumber(row.lead_time_days)?.toLocaleString() ?? "Not available", minimum: finiteNumber(row.minimum_order_quantity)?.toLocaleString() ?? "Not available", primary: row.is_primary === true ? "Yes" : row.is_primary === false ? "No" : "Not available" });
  return <HmgAntProvider><Space direction="vertical" size="middle" style={{ width: "100%" }}><Text type="secondary">{kind === "stock" ? "Recorded product quantities by warehouse and location. These are not added to the product total; variant stock is separate." : "Linked suppliers and recorded purchasing terms."}</Text>
    {kind === "stock" && !query.isLoading && !query.isFetching && !query.isError && rows.length > 0 && <LocationStockChart rows={rows} total={result.total} label={refs.label} />}
    {!query.isFetching && !query.isError && rows.length > 0 && <RecordExportActions title={kind === "stock" ? "Stock by location" : "Supplier terms"} columns={exportColumns} rows={exportRows} scopeLabel={`Current visible ${kind === "stock" ? "location-stock" : "supplier"} page only; product constrained`} filename={`product-${kind}-current-page`} />}
    {query.isLoading ? <Skeleton active /> : query.isError ? <Alert type="error" message={`Unable to load ${kind}`} action={<Button onClick={() => query.refetch()}>Try again</Button>} /> : <ProTable<ErpRecord> rowKey="id" columns={columns} dataSource={rows} loading={query.isFetching} search={false} options={false} toolBarRender={false} scroll={{ x: kind === "stock" ? 500 : 800 }} locale={{ emptyText: <Empty description={`No ${kind === "stock" ? "location stock" : "supplier links"} recorded`} /> }} pagination={result.total === undefined ? false : { current: page, pageSize: size, total: result.total, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100], onChange: (next, nextSize) => { setPage(next); setSize(nextSize); } }} />}
  </Space></HmgAntProvider>;
}
