import { useEffect, useRef, useState } from "react";
import { useCan, useCustomMutation, useNotification, useWarnAboutChange, type CrudFilters } from "@refinedev/core";
import { useAutocomplete, useDataGrid } from "@refinedev/mui";
import { Controller, useForm } from "react-hook-form";
import { Alert, Button, Card, Col, ConfigProvider, Flex, Form, Input, Modal, Pagination, Row, Select, Skeleton, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { DownloadOutlined, PlusOutlined, PrinterOutlined, SearchOutlined } from "@ant-design/icons";
import { useGetIdentity } from "@refinedev/core";
import { exportCsv, exportFilename, exportMatrix, type ExportColumn } from "../../services/recordExport";
import { CATALOG_FUNCTION, CATALOG_FUNCTION_META, CatalogError, decodeCategory, type Category } from "../../services/catalog";

const { Title, Text } = Typography;
const queryOptions = { retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false };
const permanent: CrudFilters = [{ field: "deleted_at", operator: "null", value: true }];
const sorters = [{ field: "name", order: "asc" as const }];
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" });
type Organization = { id: string; name: string };
type CategoryValues = { name: string; description: string; organization: Organization | null };
const organizationSearch = (value: string): CrudFilters => value ? [{ field: "name", operator: "contains", value }] : [];
const exportColumns: ExportColumn[] = [
  { key: "name", label: "Category" }, { key: "description", label: "Description" }, { key: "slug", label: "Identifier" },
  { key: "is_active", label: "Status" }, { key: "created_at", label: "Created" },
];
const columns: ColumnsType<Category> = [
  { title: "Category", dataIndex: "name", key: "name" },
  { title: "Description", dataIndex: "description", key: "description", render: value => value || "Not provided" },
  { title: "Identifier", dataIndex: "slug", key: "slug", render: value => value || "Not recorded" },
  { title: "Status", dataIndex: "is_active", key: "is_active", render: value => <Tag color={value ? "green" : "default"}>{value ? "Active" : "Inactive"}</Tag> },
  { title: "Created", dataIndex: "created_at", key: "created_at", render: value => value && Number.isFinite(Date.parse(value)) ? dateFormat.format(new Date(value)) : "Not recorded" },
];

function CategoryExports({ rows, view }: { rows: Category[]; view: string }) {
  const { open } = useNotification();
  const identity = useGetIdentity<{ id: string }>();
  const owner = !identity.isLoading && !identity.isFetching && !identity.isError && typeof identity.data?.id === "string" ? identity.data.id : "";
  const initialOwner = useRef("");
  if (owner && !initialOwner.current) initialOwner.current = owner;
  const allowed = !!owner && owner === initialOwner.current;
  const [preview, setPreview] = useState<string[][] | null>(null);
  const displayedColumns = view === "table" ? exportColumns : exportColumns.filter(column => column.key !== "created_at");
  const formatted = rows.map(row => ({ ...row, description: row.description || "Not provided", is_active: row.is_active ? "Active" : "Inactive", created_at: row.created_at && Number.isFinite(Date.parse(row.created_at)) ? dateFormat.format(new Date(row.created_at)) : "Not recorded" }));
  const fail = (error: unknown) => open?.({ type: "error", message: "Export unavailable", description: error instanceof Error ? error.message : "Please try again." });
  const download = () => {
    if (!allowed || !rows.length) return;
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([exportCsv(displayedColumns, formatted)], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = exportFilename("HMG-categories-current-page", "csv");
      document.body.appendChild(anchor); anchor.click(); anchor.remove();
      open?.({ type: "success", message: "Export prepared", description: `${rows.length} records — current category page only.` });
    } catch (error) { fail(error); } finally { if (url) window.setTimeout(() => URL.revokeObjectURL(url!), 1000); }
  };
  const show = () => { if (allowed) try { setPreview(exportMatrix(displayedColumns, formatted)); } catch (error) { fail(error); } };
  return <>
    <Space size={8} wrap>
      <Button aria-label="Export CSV" type="default" icon={<DownloadOutlined />} disabled={!allowed || !rows.length} onClick={download}>Export CSV</Button>
      <Button aria-label="Print / PDF" type="default" icon={<PrinterOutlined />} disabled={!allowed || !rows.length} onClick={show}>Print / PDF</Button>
    </Space>
    <Modal open={!!preview && allowed} title="Document preview" onCancel={() => setPreview(null)} footer={[
      <Button key="close" onClick={() => setPreview(null)}>Close</Button>,
      <Button key="print" type="default" icon={<PrinterOutlined />} onClick={() => window.print()}>Print / Save PDF</Button>,
    ]} width="min(1100px, calc(100vw - 48px))">
      {preview && <div className="hmg-category-export">
        <Alert type="info" showIcon message="Current category page only. Record snapshot, not an issued invoice or proof of payment." />
        <img src="/brand/hmg-stones-logo.webp" alt="HMG Stones" width={110} style={{ margin: "24px 0 8px" }} />
        <Title level={3}>Product categories</Title><Text>HMG-Studio · Current category page only · {preview.length - 1} records</Text>
        <Table size="small" pagination={false} dataSource={preview.slice(1).map(row => Object.fromEntries(preview[0].map((key, i) => [key, row[i]])))} columns={preview[0].map(key => ({ title: key, dataIndex: key, key }))} rowKey={(_, index) => String(index)} />
      </div>}
    </Modal>
  </>;
}

function CreateCategory({ close, saved }: { close: () => void; saved: () => void }) {
  const { control, handleSubmit, getValues, formState: { errors, isDirty, isSubmitting } } = useForm<CategoryValues>({ defaultValues: { name: "", description: "", organization: null } });
  const { autocompleteProps, query, onSearch } = useAutocomplete<Organization>({ resource: "organizations", pagination: { pageSize: 10 }, onSearch: organizationSearch, queryOptions });
  useEffect(() => () => { (onSearch as typeof onSearch & { cancel?: () => void }).cancel?.(); }, [onSearch]);
  const { mutateAsync, mutation } = useCustomMutation();
  const { open } = useNotification();
  const { setWarnWhen } = useWarnAboutChange();
  const requestId = useRef(crypto.randomUUID());
  const inFlight = useRef(false);
  const submitted = useRef<CategoryValues | null>(null);
  const [message, setMessage] = useState(""); const [uncertain, setUncertain] = useState(false); const [discard, setDiscard] = useState(false);
  const busy = isSubmitting || mutation.isPending;
  useEffect(() => { setWarnWhen?.(isDirty || uncertain); return () => setWarnWhen?.(false); }, [isDirty, uncertain, setWarnWhen]);
  const execute = async (action: "create" | "readback", values: CategoryValues) => {
    if (inFlight.current || !values.organization) return;
    inFlight.current = true; setMessage(""); if (action === "create") submitted.current = values;
    try {
      const response = await mutateAsync({ url: CATALOG_FUNCTION, method: "post", dataProviderName: "app", meta: CATALOG_FUNCTION_META,
        values: { action, organization_id: values.organization.id, request_id: requestId.current, ...(action === "create" ? { values: { name: values.name, description: values.description } } : {}) },
        successNotification: false, errorNotification: false });
      const record = decodeCategory(response.data); const expected = submitted.current ?? values;
      if (record.id !== requestId.current || record.organization_id !== expected.organization?.id || record.name !== expected.name.trim() || record.description !== (expected.description.trim() || null) || record.is_active !== true) throw new CatalogError("READBACK_FAILED");
      setWarnWhen?.(false); open?.({ type: "success", message: "Category saved", description: "Saved category verified from Taruvi." }); saved();
    } catch (error) {
      const failure = error instanceof CatalogError ? error : new CatalogError("WRITE_UNCONFIRMED"); setMessage(failure.message);
      if (!["VALIDATION_ERROR", "FORBIDDEN", "UNAUTHENTICATED", "VALIDATION_UNAVAILABLE", "LOAD_FAILED"].includes(failure.code)) setUncertain(true);
    } finally { inFlight.current = false; }
  };
  const cancel = () => { if (busy) return; if (isDirty || uncertain) setDiscard(true); else close(); };
  const options = autocompleteProps.options as Organization[];
  return <>
    <Modal open title="Create category" onCancel={cancel} getContainer={false} footer={[
      <Button key="cancel" disabled={busy} onClick={cancel}>Cancel</Button>,
      uncertain ? <Button key="check" type="primary" loading={busy} disabled={busy} onClick={() => execute("readback", submitted.current ?? getValues())}>Check saved record</Button> :
        <Button key="save" type="primary" htmlType="submit" form="create-category" loading={busy} disabled={busy}>Save category</Button>,
    ]} destroyOnHidden>
      <Form id="create-category" layout="vertical" onFinish={handleSubmit(values => uncertain ? undefined : execute("create", values))}>
        <Space direction="vertical" size={16} style={{ display: "flex" }}>
          {message && <Alert type="error" showIcon message={message} />}
          <Text type="secondary">Create a category in an organization you can access. New categories are active.</Text>
          <Controller name="organization" control={control} rules={{ required: "Choose an organization." }} render={({ field }) => <Form.Item label="Organization" required validateStatus={errors.organization || query.isError ? "error" : ""} help={query.isError ? "Unable to load organizations. Close and try again." : errors.organization?.message}>
            <Select aria-label="Organization" ref={field.ref} showSearch filterOption={false} value={field.value?.id} options={options.map(option => ({ value: option.id, label: option.name }))} loading={autocompleteProps.loading} disabled={busy || uncertain} onSearch={onSearch} onBlur={field.onBlur} onChange={id => field.onChange(options.find(option => option.id === id) ?? null)} onSelect={id => field.onChange(options.find(option => option.id === id) ?? null)} placeholder="Select an organization" />
          </Form.Item>} />
          <Form.Item label="Category name" required validateStatus={errors.name ? "error" : ""} help={errors.name?.message}>
            <Controller name="name" control={control} rules={{ required: "Enter a category name.", validate: value => !!value.trim() || "Enter a category name.", maxLength: { value: 255, message: "Use 255 characters or fewer." } }} render={({ field }) => <Input {...field} aria-label="Category name" autoFocus disabled={busy || uncertain} maxLength={255} />} />
          </Form.Item>
          <Form.Item label="Description"><Controller name="description" control={control} render={({ field }) => <Input.TextArea {...field} aria-label="Description" rows={3} disabled={busy || uncertain} />} /></Form.Item>
          {uncertain && <Alert type="warning" showIcon message="The save outcome is uncertain. Do not create a second category. Check this request before continuing." description={`Request: ${requestId.current}`} />}
        </Space>
      </Form>
    </Modal>
    <Modal open={discard} title="Discard category draft?" onCancel={() => setDiscard(false)} footer={[
      <Button key="keep" onClick={() => setDiscard(false)}>Keep draft</Button>, <Button key="discard" danger onClick={close}>Discard draft</Button>,
    ]}><Text>{uncertain ? "A save may already have committed. Closing this draft does not undo it; keep the request ID and verify before creating another category. " : "Unsaved category fields will be lost. "}This action cannot be undone.</Text></Modal>
  </>;
}

export function Categories() {
  const [view, setView] = useState("cards"); const [search, setSearch] = useState(""); const [status, setStatus] = useState(""); const [creating, setCreating] = useState(false);
  const { data: executeAccess } = useCan({ resource: `function:${CATALOG_FUNCTION}`, action: "execute" });
  const { dataGridProps, tableQuery, result, setFilters, setCurrentPage, setPageSize } = useDataGrid<Category>({ resource: "product_categories", pagination: { pageSize: 10, mode: "server" }, filters: { permanent }, sorters: { initial: sorters }, syncWithLocation: false, queryOptions });
  useEffect(() => { const timer = window.setTimeout(() => { const filters: CrudFilters = []; if (search.trim()) filters.push({ field: "name", operator: "contains", value: search.trim() }); if (status) filters.push({ field: "is_active", operator: "eq", value: status === "active" }); setFilters(filters, "replace"); setCurrentPage(1); }, 350); return () => window.clearTimeout(timer); }, [search, status, setFilters, setCurrentPage]);
  const emptyTitle = search.trim() ? "No results found" : status ? "No matching items" : "No categories yet";
  const categoryColumns = view === "table" ? columns : columns.filter(column => column.key !== "created_at");
  return <ConfigProvider theme={{ token: { fontSize: 14, controlHeight: 32, borderRadius: 8 } }}>
    <main style={{ padding: 24 }}>
      <Space direction="vertical" size={24} style={{ display: "flex" }}>
        <Flex justify="space-between" align="center" gap={16} wrap="wrap">
          <div><Title level={2} style={{ margin: 0 }}>Categories</Title><Text type="secondary">Organize your catalog using live Taruvi records.</Text></div>
          {executeAccess?.can && <Button aria-label="Create category" type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>Create category</Button>}
        </Flex>
        <Alert type="info" showIcon message="Category editing and deletion are not released. Product counts are not included; no totals are inferred from a partial inventory page." />
        <Row gutter={[16, 16]} align="middle">
          <Col flex="1 1 320px"><Input allowClear aria-label="Search categories" placeholder="Search categories" prefix={<SearchOutlined />} value={search} onChange={event => setSearch(event.target.value)} /></Col>
          <Col flex="0 1 180px"><Select aria-label="Status" value={status} onChange={setStatus} options={[{ value: "", label: "All statuses" }, { value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} style={{ width: "100%" }} /></Col>
          <Col flex="0 1 150px"><Select aria-label="Display" value={view} onChange={setView} onSelect={setView} options={[{ value: "cards", label: "Cards" }, { value: "table", label: "Table" }]} style={{ width: "100%" }} /></Col>
        </Row>
        {(search || status) && <Flex gap={8} wrap="wrap" align="center">{search && <Tag closable onClose={() => setSearch("")}>Search: {search}</Tag>}{status && <Tag closable onClose={() => setStatus("")}>Status: {status}</Tag>}{(search || status) && <Button type="link" onClick={() => { setSearch(""); setStatus(""); }}>Clear filters</Button>}</Flex>}
        <Flex justify="space-between" align="center" gap={16} wrap="wrap"><Text>{result.total} categories match your current access and filters.</Text>{!tableQuery.isFetching && <CategoryExports rows={result.data} view={view} />}</Flex>
        {tableQuery.isLoading ? <Skeleton active paragraph={{ rows: 4 }} /> : tableQuery.isError ? <Alert type="error" showIcon message="Unable to load categories" description="Check your access or try again. No data has been changed." action={<Button onClick={() => tableQuery.refetch()}>Try again</Button>} /> : view === "cards" ? <>
          <Row gutter={[16, 16]} aria-busy={tableQuery.isFetching}>
            {result.data.map(category => <Col key={category.id} xs={24} sm={12} lg={8} xl={6}><Card styles={{ body: { padding: 16 } }} style={{ height: "100%" }}>
              <Space direction="vertical" size={8} style={{ display: "flex" }}>
                <Flex justify="space-between" align="flex-start" gap={8}><Title level={5} style={{ margin: 0, fontSize: 16, overflowWrap: "anywhere" }}>{category.name}</Title><Tag color={category.is_active ? "green" : "default"}>{category.is_active ? "Active" : "Inactive"}</Tag></Flex>
                <Text type="secondary">{category.description || "No description provided"}</Text><Text type="secondary" style={{ fontSize: 12 }}>Identifier: {category.slug || "Not recorded"}</Text>
              </Space>
            </Card></Col>)}
          </Row>
          {!result.data.length && <Alert type="info" showIcon message={emptyTitle} description={search || status ? "Change your search or filters to see more categories." : "Create your first category when your organization grants access."} />}
          <Flex justify="flex-end"><Pagination showSizeChanger pageSizeOptions={[10, 20, 50, 100]} current={(dataGridProps.paginationModel?.page ?? 0) + 1} pageSize={dataGridProps.paginationModel?.pageSize ?? 10} total={result.total ?? 0} onChange={(page, size) => { if (size !== dataGridProps.paginationModel?.pageSize) { setPageSize(size); setCurrentPage(1); } else setCurrentPage(page); }} /></Flex>
        </> : <Table<Category> rowKey="id" columns={categoryColumns} dataSource={result.data} pagination={{ current: (dataGridProps.paginationModel?.page ?? 0) + 1, pageSize: dataGridProps.paginationModel?.pageSize ?? 10, total: result.total ?? 0, showSizeChanger: true, pageSizeOptions: [10, 20, 50, 100], onChange: (page, size) => { if (size !== dataGridProps.paginationModel?.pageSize) { setPageSize(size); setCurrentPage(1); } else setCurrentPage(page); } }} loading={tableQuery.isFetching} locale={{ emptyText: <div><Title level={5}>{emptyTitle}</Title><Text type="secondary">{search || status ? "Change your search or filters to see more categories." : "Create your first category when your organization grants access."}</Text></div> }} />}
      </Space>
      {creating && <CreateCategory close={() => setCreating(false)} saved={() => { setCreating(false); void tableQuery.refetch(); }} />}
    </main>
  </ConfigProvider>;
}
