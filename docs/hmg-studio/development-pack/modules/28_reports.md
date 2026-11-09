# 28. Reports, Builder and Schedules — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Reports, Builder and Schedules as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Built-in inventory/sales/receivables/analytics; period and grouping filters; saved report builder; preview/chart/share; export; scheduled delivery.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Orders, Payments and Documents](../modules/12_orders.md), [Purchase Orders](../modules/15_purchase_orders.md), [Stock Adjustments](../modules/21_stock_adjustments.md), [Stock by Warehouse](../modules/22_stock_by_warehouse.md), [Organization, Email and Preferences](../modules/33_organization_settings.md), [API Tokens, Webhooks and External Interfaces](../modules/37_api_webhooks.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Reports/AbcAnalysis.vue` | Pending | Pending |
| `resources/js/Pages/Reports/BatchExpiry.vue` | Pending | Pending |
| `resources/js/Pages/Reports/Builder/Create.vue` | Pending | Pending |
| `resources/js/Pages/Reports/Builder/Edit.vue` | Pending | Pending |
| `resources/js/Pages/Reports/Builder/Index.vue` | Pending | Pending |
| `resources/js/Pages/Reports/Builder/Show.vue` | Pending | Pending |
| `resources/js/Pages/Reports/CategoryPerformance.vue` | Pending | Pending |
| `resources/js/Pages/Reports/DeadStock.vue` | Pending | Pending |
| `resources/js/Pages/Reports/Index.vue` | Pending | Pending |
| `resources/js/Pages/Reports/InventoryTurnover.vue` | Pending | Pending |
| `resources/js/Pages/Reports/InventoryValuation.vue` | Pending | Pending |
| `resources/js/Pages/Reports/LowStock.vue` | Pending | Pending |
| `resources/js/Pages/Reports/ProfitMargin.vue` | Pending | Pending |
| `resources/js/Pages/Reports/Receivables.vue` | Pending | Pending |
| `resources/js/Pages/Reports/SalesAnalysis.vue` | Pending | Pending |
| `resources/js/Pages/Reports/SalesByLocation.vue` | Pending | Pending |
| `resources/js/Pages/Reports/StockMovement.vue` | Pending | Pending |

The exact target filenames and schema identifiers must be filled from destination discovery. These are intentionally not guessed from the Vue/PHP source. A missing target map blocks the relevant implementation task; it does not authorize a placeholder.

## Implementation tasks

1. **Audit/reuse:** inspect the current HMG-Studio module, existing React components, Refine providers and Python service boundaries. Record exact target files to modify/create/test; extend existing owners instead of duplicating them.
2. **Confirm schema/contracts:** map source fields and relationships to explicitly app-scoped Taruvi metadata. Record types, nullability, defaults, uniqueness, tenant/warehouse/customer keys, read/write policies and storage ownership. Define exact Python request/response/error contracts and which facts are server-derived.
3. **Write failing contract tests:** use each source validator/default/state transition below and the module acceptance assertions. Confirm the tests fail for the intended missing behavior, not setup failure. Name each test and affected target file in the ledger before coding.
4. **Implement Python authority:** validate verified caller scope; use parameterized/provider-native data access; compute authoritative values; enforce lifecycle and transactional effects. Return field errors, conflict/forbidden outcomes and committed identities without false success.
5. **Implement the React/Refine views:** reproduce evidenced forms, tables, filters, dialogs and actions using existing UI primitives. Wire queries/mutations to the confirmed service contract; refresh related records and dependent totals after commit.
6. **Review and verify:** security/duplication review first, then run focused tests and authorized integration checks; exercise the entire browser workflow and reload/readback. Record commands, results, record IDs and before/after facts without secrets. Test production-like transaction failure and retries where this module writes stock or money.
7. **Finish the handoff:** update page/field/action coverage, documentation and the persistent progress ledger. List verified, remaining and blocked separately. Do not commit/push/deploy without the execution task's authorization.

## Module-specific acceptance assertions — not yet executed

- [ ] Totals reconcile with underlying operations and currencies.
- [ ] capped displayed rows do not cap headline totals.
- [ ] shared report rechecks viewer access.
- [ ] scheduled recipients are reauthorized at send time.
- [ ] filter/export asymmetries remain explicit.

## Common acceptance gates

- [ ] Every evidenced page, nested modal/drawer/tab, field, default, option source, conditional requirement, view column, filter, action and transition has a target mapping.
- [ ] Server validation and authorization reject invalid/foreign IDs even if the browser is bypassed. UI validation is not the trust boundary.
- [ ] Successful save is followed by fresh readback and reload; failure does not display success. Preserve meaningful null/blank/zero/false differences.
- [ ] Decimal money, quantity precision, dates/timezones and currency boundaries follow the source contract; authoritative calculations run in Python.
- [ ] Loading, empty, filtered-empty, error/retry, permission-denied, keyboard/focus and narrow-screen states work.
- [ ] Security review precedes execution of the verification suite; then local tests, backend integration checks and browser acceptance each have recorded results.
- [ ] Update the parity ledger, record unresolved source/target differences, and document the exact next action. Do not claim full completion from a passing build.

## Evidence reading rules

The source contracts below are authoritative for parity, not for target infrastructure. `props`, Vue form state and PHP request/model code must be translated into equivalent React/Python behavior. A database column is not automatically an editable field. List and edit defaults can differ. An inherited API validator may reuse a parent web contract; follow both. Source anomalies require an explicit decision, not silent correction.

Shared route/permission registers, mixed-module relationships, generic UI primitives and global invariants are retained once rather than duplicated:

- [inventory.md](../shared/inventory.md)
- [commerce.md](../shared/commerce.md)
- [platform.md](../shared/platform.md)
- [platform-source-catalog.md](../shared/platform-source-catalog.md)
- [shared-gaps.md](../shared/shared-gaps.md)
- [additional-contracts.md](../shared/additional-contracts.md)

### Detailed evidence index

- [P08 Reports/analytics](#e0262)
- [Saved reports](#e0263)
- [`resources/js/Components/Reports/PeriodFilter.vue`](#e0294)
- [`resources/js/Components/Reports/ReportSchedules.vue`](#e0295)
- [`resources/js/Pages/Reports/AbcAnalysis.vue`](#e0339)
- [`resources/js/Pages/Reports/BatchExpiry.vue`](#e0340)
- [`resources/js/Pages/Reports/Builder/Create.vue`](#e0341)
- [`resources/js/Pages/Reports/Builder/Edit.vue`](#e0342)
- [`resources/js/Pages/Reports/Builder/Index.vue`](#e0343)
- [`resources/js/Pages/Reports/Builder/Show.vue`](#e0344)
- [`resources/js/Pages/Reports/CategoryPerformance.vue`](#e0345)
- [`resources/js/Pages/Reports/DeadStock.vue`](#e0346)
- [`resources/js/Pages/Reports/Index.vue`](#e0347)
- [`resources/js/Pages/Reports/InventoryTurnover.vue`](#e0348)
- [`resources/js/Pages/Reports/InventoryValuation.vue`](#e0349)
- [`resources/js/Pages/Reports/LowStock.vue`](#e0350)
- [`resources/js/Pages/Reports/ProfitMargin.vue`](#e0351)
- [`resources/js/Pages/Reports/Receivables.vue`](#e0352)
- [`resources/js/Pages/Reports/SalesAnalysis.vue`](#e0353)
- [`resources/js/Pages/Reports/SalesByLocation.vue`](#e0354)
- [`resources/js/Pages/Reports/StockMovement.vue`](#e0355)
- [`app/Http/Requests/Api/SavedReport/StoreSavedReportRequest.php`](#e0374)
- [`app/Http/Requests/Api/SavedReport/UpdateSavedReportRequest.php`](#e0375)
- [`app/Http/Controllers/Reports/AnalyticsReportController.php`](#e0417)
- [`app/Http/Controllers/Reports/BatchExpiryReportController.php`](#e0418)
- [`app/Http/Controllers/Reports/ReportBuilderController.php`](#e0419)
- [`app/Http/Controllers/Reports/ReportController.php`](#e0420)
- [`app/Http/Controllers/Reports/ReportScheduleController.php`](#e0421)
- [Contract appendix `app/Services/ReportDataService.php:40-175`](#e0429)
- [Contract appendix `app/Services/ReportDataService.php:245-300`](#e0430)
- [Contract appendix `app/Models/ReportSchedule.php:25-75`](#e0431)
- [Contract appendix `routes/web/reports.php:1-60`](#e0435)
- [`app/Services/Reports/ReportPeriod.php`](#e0447)
- [`app/Services/Reports/ReportExporter.php`](#e0448)
- [Complete source contract `app/Services/ReportDataService.php`](#e0451)
- [Supplemental complete source `app/Http/Controllers/Reports/ReportScheduleController.php`](#e0460)
- [G03 Report export links — omitted functional navigation](#e0465)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0262"></a>

> Audit provenance: `platform.md` lines 75–95. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P08 Reports/analytics

Routes `routes/web/reports.php:17-58`: all view_reports plus source permissions. Exact filters/defaults/options/columns in source catalog for every report, including shared PeriodFilter and ReportSchedules.

| View | Main breakdown |
|---|---|
| Inventory valuation | Product/category/stock/price/stock value/profit potential; location+warehouse/count/quantity/cost value/retail value. |
| Stock movement | Date/product/type/before/change/after/user. |
| Sales analysis | Payment status/order count/total/paid/balance; daily date/order count/revenue. |
| Low stock | Status/product/category/current/min/max/deficit/reorder cost/supplier/suggested qty/actions; quick reorder reuses purchase rules. |
| Category performance | Category/products/stock/value/average per product/low count. |
| Receivables | Customer/order count/aging buckets/total; order/customer/date/age/total/paid/balance. |
| Batch expiry | Dynamic batch columns/status and server date/status filtering. |
| Dead stock | Product/category/location/on-hand/current-cost/tied-up-value/last-sale/last-outbound. Days30/60/90/180; basis both|sales|movement. |
| Turnover | Category/product units sold/opening/closing/average inventory/COGS/turnover/days inventory. |
| Margin | Product/category/units/revenue/COGS/margin/margin%; category summary. |
| Sales by location | Warehouse/order count/sales/previous/change; location/warehouse/units/sales/previous/change. |
| ABC | Rank/product/units/revenue/share/cumulative/class. A cumulative80%, B95%, rest C. |

Source `Services/Reports/InventoryAnalyticsService.php:18-77`: sales noncancelled/nondeleted order lines; cost-at-sale, explicitly flag backfilled estimates/missing costs. List cap reports.max_rows does not cap headline aggregate set. Do not derive completeness from visible rows. Money currencies kept separate. Dead stock excludes products created inside the no-activity window. Analytics export csv/xlsx/pdf with selected alternate group/period (`AnalyticsReportController.php:23-24,75-226`). Default90-day period turnover/ABC; others ReportPeriod default, not assumed global constant.



<a id="e0263"></a>

> Audit provenance: `platform.md` lines 96–109. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Saved reports

name required max255; description nullable max1000; data_source required max50 and valid registered source; columns nonempty valid column array; filters nullable array with field(required-with,max100),operator(required-with,max20),value nullable string max500; sort nullable object field max100,direction asc|desc; chart_type nullable bar|line|pie; chart_field nullable max100; is_shared boolean. Defaults empty text/arrays, sort empty field asc, chart null,shared false; Edit preloads. Evidence `Reports/Builder/Create.vue:22-32`,`ReportBuilderController.php:90-108`; full exact server contract cataloged.

Built-in data sources (`ReportDataService.php:45-132`):
- products: name,sku,stock,price,purchase_price,category_name,location_name,type,is_active,created_at.
- orders: order_number,customer_name,status,total,subtotal,tax,order_date,created_at.
- stock_adjustments: product_name,product_sku,type,quantity,reason,created_at.
- customers: name,email,phone,company,orders_count,created_at.
- suppliers: name,email,phone,products_count,created_at.
- purchase_orders: po_number,supplier_name,status,total,order_date,created_at.

Catalog preserves each column type and source contract. Plugins may register source with matching handler/permission. Actions source/column/filter/sort/chart selection, preview, save, share, show table/chart, export, edit/delete. Shared reports recheck VIEWER access, not only author's access (`ReportDataService.php:150-175`).



<a id="e0294"></a>

> Audit provenance: `platform-source-catalog.md` lines 280–292. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Components/Reports/PeriodFilter.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Components/Reports/PeriodFilter.vue:38`: `<input :id="&#96;${routeName}-from&#96;" v-model="dateFrom" type="date" />`
- `resources/js/Components/Reports/PeriodFilter.vue:42`: `<input :id="&#96;${routeName}-to&#96;" v-model="dateTo" type="date" />`

**View filters, permission/action and navigation anchors:**
```js
18: const dateFrom = ref(props.filters?.date_from || '');
19: const dateTo = ref(props.filters?.date_to || '');
22: router.get(route(props.routeName), {
```



<a id="e0295"></a>

> Audit provenance: `platform-source-catalog.md` lines 293–339. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Components/Reports/ReportSchedules.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Components/Reports/ReportSchedules.vue:137`: `<select id="schedule-frequency" v-model="form.frequency">`
- `resources/js/Components/Reports/ReportSchedules.vue:144`: `<select id="schedule-dow" v-model.number="form.day_of_week">`
- `resources/js/Components/Reports/ReportSchedules.vue:151`: `<input id="schedule-dom" v-model.number="form.day_of_month" type="number" min="1" max="31" />`
- `resources/js/Components/Reports/ReportSchedules.vue:157`: `<input id="schedule-time" v-model="form.time_of_day" type="time" step="900" />`
- `resources/js/Components/Reports/ReportSchedules.vue:163`: `<select id="schedule-format" v-model="form.format">`
- `resources/js/Components/Reports/ReportSchedules.vue:179`: `<input v-model="form.recipients" type="checkbox" :value="person.email.toLowerCase()" />`

**Form initial state/defaults:**
```js
36: const form = useForm(blank());
```

**Select option values/labels (dynamic options retain their source):**
```html
138: <option v-for="f in options.frequencies" :key="f" :value="f">{{ t(`reportBuilder.schedules.frequencies.${f}`) }}</option>
145: <option v-for="d in [1, 2, 3, 4, 5, 6, 0]" :key="d" :value="d">{{ t(`reportBuilder.schedules.days.${d}`) }}</option>
164: <option v-for="f in options.formats" :key="f" :value="f">{{ t(`reports.export.${f}`) }}</option>
```

**View filters, permission/action and navigation anchors:**
```js
24: const showForm = ref(false);
25: const editingId = ref(null);
66: form.put(route('reports.builder.schedules.update', [props.reportId, editingId.value]), options);
68: form.post(route('reports.builder.schedules.store', props.reportId), options);
84: router.put(
85: route('reports.builder.schedules.update', [props.reportId, schedule.id]),
92: if (confirm(t('reportBuilder.schedules.confirmDelete'))) {
93: router.delete(route('reports.builder.schedules.destroy', [props.reportId, schedule.id]), { preserveScroll: true });
112: const recipientErrors = computed(() => form.errors.recipients || Object.entries(form.errors).find(([k]) => k.startsWith('recipients.'))?.[1]);
```

**Displayed data/value expressions:**
```text
180: person.name
181: person.email
204: describe(schedule)
207: schedule.is_active ? t('reportBuilder.schedules.active') : t('reportBuilder.schedules.paused')
210: schedule.recipients.join(', ')
212: schedule.is_active ? formatDateTime(schedule.next_run_at) : '-'
214: formatDateTime(schedule.last_run_at)
224: schedule.is_active ? t('reportBuilder.schedules.pause') : t('reportBuilder.schedules.resume')
```



<a id="e0339"></a>

> Audit provenance: `platform-source-catalog.md` lines 1702–1729. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/AbcAnalysis.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
89: {{ t('reports.abcAnalysis.rank') }}
90: {{ t('reports.common.product') }}
91: {{ t('reports.common.units') }}
92: {{ t('reports.abcAnalysis.revenue') }}
93: {{ t('reports.abcAnalysis.share') }}
94: {{ t('reports.abcAnalysis.cumulative') }}
95: {{ t('reports.abcAnalysis.class') }}
```

**Displayed data/value expressions:**
```text
104: index + 1
106: row.name
107: row.sku
109: formatNumber(row.units)
110: formatCurrency(row.revenue)
111: formatPercent(row.share_pct)
112: formatPercent(row.cumulative_pct)
113: row.class
```



<a id="e0340"></a>

> Audit provenance: `platform-source-catalog.md` lines 1730–1763. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/BatchExpiry.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Reports/BatchExpiry.vue:63`: `<input id="batch-expiry-search" v-model="form.search" type="search" maxlength="200" />`
- `resources/js/Pages/Reports/BatchExpiry.vue:67`: `<select id="batch-expiry-window" v-model="form.window">`

**Select option values/labels (dynamic options retain their source):**
```html
68: <option v-for="window in windows" :key="window" :value="window">{{ t(`batchExpiryReport.windows.${window}`) }}</option>
```

**Visible table headers:**
```text
90: {{ t(column.label) }}
95: {{ t('batchExpiryReport.status') }}
```

**View filters, permission/action and navigation anchors:**
```js
33: const exportUrl = computed(() => route('reports.batch-expiry', { ...props.filters, export: 'csv' }));
34: const apply = () => router.get(route('reports.batch-expiry'), { ...props.filters, ...form }, { preserveState: true, preserveScroll: true });
35: const sort = (key) => router.get(route('reports.batch-expiry'), {
```

**Displayed data/value expressions:**
```text
101: batch.product_name
102: batch.product_name
103: batch.sku
106: batch.batch_number
107: formatNumber(batch.quantity)
108: formatDay(batch.expiry_date)
```



<a id="e0341"></a>

> Audit provenance: `platform-source-catalog.md` lines 1764–1850. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/Builder/Create.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Reports/Builder/Create.vue:207`: `<input :id="fieldIdPrefix + '-1'" v-model="form.name" type="text" maxlength="255" :placeholder="t('reportBuilder.placeholders.name')" />`
- `resources/js/Pages/Reports/Builder/Create.vue:218`: `<textarea :id="fieldIdPrefix + '-2'" v-model="form.description" rows="2" maxlength="1000" :placeholder="t('reportBuilder.placeholders.description')" >`
- `resources/js/Pages/Reports/Builder/Create.vue:233`: `<select :aria-label="t('reportBuilder.sections.dataSource')" v-model="form.data_source" >`
- `resources/js/Pages/Reports/Builder/Create.vue:316`: `<select :aria-label="t('reportBuilder.placeholders.filterField')" v-model="filter.field" >`
- `resources/js/Pages/Reports/Builder/Create.vue:323`: `<select :aria-label="t('reportBuilder.fields.operator')" v-model="filter.operator" >`
- `resources/js/Pages/Reports/Builder/Create.vue:329`: `<input :aria-label="t('reportBuilder.placeholders.filterValue')" v-if="!noValueOperators.includes(filter.operator)" v-model="filter.value" :type="getColumnType(filter.field) === 'number' || getColumnType(filter.field) === 'currency' ? 'number' : getColumnType(filter.field) === 'date' ? 'date' : 'text'" :placeholder="t('reportBuilder.placeholders.filterValue')" />`
- `resources/js/Pages/Reports/Builder/Create.vue:357`: `<select :aria-label="t('reportBuilder.fields.sortField')" v-model="form.sort.field" >`
- `resources/js/Pages/Reports/Builder/Create.vue:364`: `<select :aria-label="t('reportBuilder.fields.sortDirection')" v-model="form.sort.direction" >`
- `resources/js/Pages/Reports/Builder/Create.vue:382`: `<select :id="fieldIdPrefix + '-3'" v-model="form.chart_type" >`
- `resources/js/Pages/Reports/Builder/Create.vue:391`: `<select :id="fieldIdPrefix + '-4'" v-model="form.chart_field" >`
- `resources/js/Pages/Reports/Builder/Create.vue:456`: `<input v-model="form.is_shared" type="checkbox" />`

**Form initial state/defaults:**
```js
22: const form = useForm({
23:     name: '',
24:     description: '',
25:     data_source: '',
26:     columns: [],
27:     filters: [],
28:     sort: { field: '', direction: 'asc' },
29:     chart_type: null,
30:     chart_field: null,
31:     is_shared: false,
32: });
```

**Select option values/labels (dynamic options retain their source):**
```html
237: <option value="" disabled>{{ t('reportBuilder.placeholders.dataSource') }}</option>
238: <option v-for="(source, key) in dataSources" :key="key" :value="key">{{ source.label }}</option>
320: <option value="" disabled>{{ t('reportBuilder.placeholders.filterField') }}</option>
321: <option v-for="col in availableColumns" :key="col.key" :value="col.key">{{ col.label }}</option>
327: <option v-for="op in operators" :key="op.value" :value="op.value">{{ op.label }}</option>
361: <option value="">{{ t('reportBuilder.placeholders.sortField') }}</option>
362: <option v-for="col in availableColumns" :key="col.key" :value="col.key">{{ col.label }}</option>
368: <option value="asc">{{ t('reportBuilder.sortAsc') }}</option>
369: <option value="desc">{{ t('reportBuilder.sortDesc') }}</option>
386: <option v-for="ct in chartTypes" :key="ct.value" :value="ct.value">{{ ct.label }}</option>
395: <option value="">{{ t('reportBuilder.placeholders.chartField') }}</option>
396: <option v-for="col in availableColumns" :key="col.key" :value="col.key">{{ col.label }}</option>
```

**Visible table headers:**
```text
423: {{ previewData.columnLabels?.[col] || columnLabel(col) }}
```

**View filters, permission/action and navigation anchors:**
```js
35: const previewData = ref(null);
36: const previewLoading = ref(false);
37: const previewError = ref('');
40: const availableColumns = computed(() => {
98: const operators = computed(() => ([
114: const chartTypes = computed(() => ([
138: filters: form.filters.filter(f => f.field && f.operator),
141: const response = await axios.post(route('reports.builder.preview'), payload);
154: data.filters = data.filters.filter(f => f.field && f.operator);
161: form.transform(() => data).post(route('reports.builder.store'));
```

**Displayed data/value expressions:**
```text
214: form.errors.name
238: source.label
240: form.errors.data_source
267: col.label
268: col.type
281: index + 1
282: columnLabel(colKey)
302: form.errors.columns
321: col.label
327: op.label
362: col.label
386: ct.label
396: col.label
409: previewLoading ? t('reportBuilder.previewing') : t('reportBuilder.previewReport')
413: previewError
428: previewData.columnLabels?.[col] || columnLabel(col)
439: row[col] ?? '-'
472: form.processing ? t('reportBuilder.saving') : t('reportBuilder.saveReport')
```



<a id="e0342"></a>

> Audit provenance: `platform-source-catalog.md` lines 1851–1937. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/Builder/Edit.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Reports/Builder/Edit.vue:202`: `<input :id="fieldIdPrefix + '-1'" v-model="form.name" type="text" maxlength="255" :placeholder="t('reportBuilder.placeholders.name')" />`
- `resources/js/Pages/Reports/Builder/Edit.vue:213`: `<textarea :id="fieldIdPrefix + '-2'" v-model="form.description" rows="2" maxlength="1000" :placeholder="t('reportBuilder.placeholders.description')" >`
- `resources/js/Pages/Reports/Builder/Edit.vue:228`: `<select :aria-label="t('reportBuilder.sections.dataSource')" v-model="form.data_source" >`
- `resources/js/Pages/Reports/Builder/Edit.vue:311`: `<select :aria-label="t('reportBuilder.placeholders.filterField')" v-model="filter.field" >`
- `resources/js/Pages/Reports/Builder/Edit.vue:318`: `<select :aria-label="t('reportBuilder.fields.operator')" v-model="filter.operator" >`
- `resources/js/Pages/Reports/Builder/Edit.vue:324`: `<input :aria-label="t('reportBuilder.placeholders.filterValue')" v-if="!noValueOperators.includes(filter.operator)" v-model="filter.value" :type="getColumnType(filter.field) === 'number' || getColumnType(filter.field) === 'currency' ? 'number' : getColumnType(filter.field) === 'date' ? 'date' : 'text'" :placeholder="t('reportBuilder.placeholders.filterValue')" />`
- `resources/js/Pages/Reports/Builder/Edit.vue:352`: `<select :aria-label="t('reportBuilder.fields.sortField')" v-model="form.sort.field" >`
- `resources/js/Pages/Reports/Builder/Edit.vue:359`: `<select :aria-label="t('reportBuilder.fields.sortDirection')" v-model="form.sort.direction" >`
- `resources/js/Pages/Reports/Builder/Edit.vue:377`: `<select :id="fieldIdPrefix + '-3'" v-model="form.chart_type" >`
- `resources/js/Pages/Reports/Builder/Edit.vue:386`: `<select :id="fieldIdPrefix + '-4'" v-model="form.chart_field" >`
- `resources/js/Pages/Reports/Builder/Edit.vue:451`: `<input v-model="form.is_shared" type="checkbox" />`

**Form initial state/defaults:**
```js
23: const form = useForm({
24:     name: props.report.name,
25:     description: props.report.description || '',
26:     data_source: props.report.data_source,
27:     columns: props.report.columns || [],
28:     filters: props.report.filters || [],
29:     sort: props.report.sort || { field: '', direction: 'asc' },
30:     chart_type: props.report.chart_type || null,
31:     chart_field: props.report.chart_field || null,
32:     is_shared: props.report.is_shared || false,
33: });
```

**Select option values/labels (dynamic options retain their source):**
```html
232: <option value="" disabled>{{ t('reportBuilder.placeholders.dataSource') }}</option>
233: <option v-for="(source, key) in dataSources" :key="key" :value="key">{{ source.label }}</option>
315: <option value="" disabled>{{ t('reportBuilder.placeholders.filterField') }}</option>
316: <option v-for="col in availableColumns" :key="col.key" :value="col.key">{{ col.label }}</option>
322: <option v-for="op in operators" :key="op.value" :value="op.value">{{ op.label }}</option>
356: <option value="">{{ t('reportBuilder.placeholders.sortField') }}</option>
357: <option v-for="col in availableColumns" :key="col.key" :value="col.key">{{ col.label }}</option>
363: <option value="asc">{{ t('reportBuilder.sortAsc') }}</option>
364: <option value="desc">{{ t('reportBuilder.sortDesc') }}</option>
381: <option v-for="ct in chartTypes" :key="ct.value" :value="ct.value">{{ ct.label }}</option>
390: <option value="">{{ t('reportBuilder.placeholders.chartField') }}</option>
391: <option v-for="col in availableColumns" :key="col.key" :value="col.key">{{ col.label }}</option>
```

**Visible table headers:**
```text
418: {{ previewData.columnLabels?.[col] || columnLabel(col) }}
```

**View filters, permission/action and navigation anchors:**
```js
36: const previewData = ref(null);
37: const previewLoading = ref(false);
38: const previewError = ref('');
40: const availableColumns = computed(() => {
94: const operators = computed(() => ([
110: const chartTypes = computed(() => ([
132: filters: form.filters.filter(f => f.field && f.operator),
135: const response = await axios.post(route('reports.builder.preview'), payload);
146: data.filters = data.filters.filter(f => f.field && f.operator);
153: form.transform(() => data).put(route('reports.builder.update', props.report.id));
```

**Displayed data/value expressions:**
```text
209: form.errors.name
233: source.label
235: form.errors.data_source
262: col.label
263: col.type
276: index + 1
277: columnLabel(colKey)
297: form.errors.columns
316: col.label
322: op.label
357: col.label
381: ct.label
391: col.label
404: previewLoading ? t('reportBuilder.previewing') : t('reportBuilder.previewReport')
408: previewError
423: previewData.columnLabels?.[col] || columnLabel(col)
434: row[col] ?? '-'
467: form.processing ? t('reportBuilder.saving') : t('reportBuilder.updateReport')
```



<a id="e0343"></a>

> Audit provenance: `platform-source-catalog.md` lines 1938–1971. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/Builder/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Reports/Builder/Index.vue:80`: `<input v-model="search" :aria-label="t('common.search')" type="text" :placeholder="t('reportBuilder.searchPlaceholder')" />`

**Visible table headers:**
```text
95: {{ t('reportBuilder.columns.name') }}
96: {{ t('reportBuilder.columns.dataSource') }}
97: {{ t('reportBuilder.columns.createdBy') }}
98: {{ t('reportBuilder.columns.shared') }}
99: {{ t('reportBuilder.columns.created') }}
100: {{ t('reportBuilder.columns.actions') }}
```

**View filters, permission/action and navigation anchors:**
```js
20: const search = ref('');
22: const filteredReports = computed(() => {
25: return props.reports.filter(r =>
37: if (confirm(t('reportBuilder.confirmDelete'))) {
38: router.delete(route('reports.builder.destroy', report.id));
43: window.location.href = route('reports.builder.export', report.id);
```

**Displayed data/value expressions:**
```text
124: report.name
126: report.description
129: dataSourceLabel(report.data_source)
132: report.creator?.name || '-'
139: displayDate(report.created_at)
```



<a id="e0344"></a>

> Audit provenance: `platform-source-catalog.md` lines 1972–2003. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/Builder/Show.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
162: #
163: {{ columnLabels[col] || col }}
```

**View filters, permission/action and navigation anchors:**
```js
34: if (confirm(t('reportBuilder.confirmDelete'))) {
35: router.delete(route('reports.builder.destroy', props.report.id));
```

**Displayed data/value expressions:**
```text
67: report.name
126: dataSourceLabel(report.data_source)
127: report.columns.length
128: report.filters.length
129: columnLabels[report.sort.field] || report.sort.field
129: report.sort.direction
146: report.name
147: data.length
168: columnLabels[col] || col
178: idx + 1
184: formatValue(row[col], col)
```



<a id="e0345"></a>

> Audit provenance: `platform-source-catalog.md` lines 2004–2041. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/CategoryPerformance.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
162: {{ t('reports.categoryPerformance.title') }}
163: {{ t('common.products') }}
164: {{ t('reports.categoryPerformance.totalStock') }}
165: {{ t('reports.categoryPerformance.totalValue') }}
166: {{ t('reports.categoryPerformance.avgPerProduct') }}
167: {{ t('reports.categoryPerformance.low') }}
```

**View filters, permission/action and navigation anchors:**
```js
40: const maxValue = computed(() =>
```

**Displayed data/value expressions:**
```text
113: category.category_name
115: category.low_stock_items
120: formatCurrency(category.total_value)
122: plusOthers(category.values)
135: category.product_count
139: category.total_stock
146: average(category)
176: category.category_name
177: category.product_count
178: category.total_stock
180: formatCurrency(category.total_value)
181: plusOthers(category.values)
183: average(category)
185: category.low_stock_items
```



<a id="e0346"></a>

> Audit provenance: `platform-source-catalog.md` lines 2042–2086. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/DeadStock.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Reports/DeadStock.vue:72`: `<select id="dead-days" v-model.number="days">`
- `resources/js/Pages/Reports/DeadStock.vue:78`: `<select id="dead-basis" v-model="basis">`

**Select option values/labels (dynamic options retain their source):**
```html
73: <option v-for="d in options.days" :key="d" :value="d">{{ t('reports.deadStock.days', { n: d }) }}</option>
79: <option v-for="b in options.bases" :key="b" :value="b">{{ t(`reports.deadStock.bases.${b}`) }}</option>
```

**Visible table headers:**
```text
122: {{ t('reports.common.product') }}
123: {{ t('reports.common.category') }}
124: {{ t('reports.common.location') }}
125: {{ t('reports.deadStock.onHand') }}
126: {{ t('reports.deadStock.unitCost') }}
127: {{ t('reports.deadStock.value') }}
128: {{ t('reports.deadStock.lastSale') }}
129: {{ t('reports.deadStock.lastOutbound') }}
```

**View filters, permission/action and navigation anchors:**
```js
29: const otherValues = computed(() => otherCurrencyTotals(props.summary.values_by_currency, props.summary.currency));
31: const days = ref(props.filters.days);
32: const basis = ref(props.filters.basis);
35: router.get(route('reports.dead-stock'), { days: days.value, basis: basis.value }, { preserveState: true, preserveScroll: true });
```

**Displayed data/value expressions:**
```text
139: row.name
140: row.sku
142: row.category || t('reports.common.uncategorized')
143: row.location || '-'
144: formatNumber(row.stock)
147: formatCurrency(row.unit_cost, row.currency)
149: formatCurrency(row.tied_up_value, row.currency)
150: row.last_sale_at ? formatDay(row.last_sale_at) : t('reports.deadStock.never')
151: row.last_outbound_at ? formatTimestampDate(row.last_outbound_at) : t('reports.deadStock.never')
```



<a id="e0347"></a>

> Audit provenance: `platform-source-catalog.md` lines 2087–2131. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
187: {{ t('reportBuilder.columns.name') }}
188: {{ t('reportBuilder.columns.dataSource') }}
189: {{ t('reportBuilder.columns.createdBy') }}
190: {{ t('reportBuilder.columns.created') }}
191: 
```

**View filters, permission/action and navigation anchors:**
```js
32: const { hasAllPermissions } = usePermissions();
41: const reportCards = computed(() => ([
43: href: route('reports.inventory-valuation'),
50: href: route('reports.stock-movement'),
56: href: route('reports.sales-analysis'),
63: href: route('reports.low-stock'),
70: href: route('reports.category-performance'),
79: href: route('reports.dead-stock'),
86: href: route('reports.inventory-turnover'),
93: href: route('reports.profit-margin'),
100: href: route('reports.sales-by-location'),
107: href: route('reports.abc-analysis'),
115: href: route('reports.receivables'),
122: href: route('reports.batch-expiry'),
129: href: route('reports.builder.index'),
136: const visibleReportCards = computed(() =>
137: reportCards.value.filter((card) => !card.requires || hasAllPermissions(card.requires))
```

**Displayed data/value expressions:**
```text
164: report.title
165: report.description
198: report.name
202: te(`reports.index.dataSources.${report.data_source}`) ? t(`reports.index.dataSources.${report.data_source}`) : report.data_source
204: report.creator?.name || '-'
205: displayDate(report.created_at)
```



<a id="e0348"></a>

> Audit provenance: `platform-source-catalog.md` lines 2132–2173. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/InventoryTurnover.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
107: {{ t('reports.common.category') }}
108: {{ t('reports.inventoryTurnover.unitsSold') }}
109: {{ t('reports.inventoryTurnover.avgInventory') }}
110: {{ t('reports.inventoryTurnover.cogs') }}
111: {{ t('reports.inventoryTurnover.turnover') }}
112: {{ t('reports.inventoryTurnover.daysOfInventory') }}
148: {{ t('reports.common.product') }}
149: {{ t('reports.inventoryTurnover.unitsSold') }}
150: {{ t('reports.inventoryTurnover.opening') }}
151: {{ t('reports.inventoryTurnover.closing') }}
152: {{ t('reports.inventoryTurnover.avgInventory') }}
153: {{ t('reports.inventoryTurnover.cogs') }}
154: {{ t('reports.inventoryTurnover.turnover') }}
155: {{ t('reports.inventoryTurnover.daysOfInventory') }}
```

**Displayed data/value expressions:**
```text
121: row.category || t('reports.common.uncategorized')
122: formatNumber(row.units_sold)
123: formatCurrency(row.average_value)
124: formatCurrency(row.cogs)
125: ratio(row.turnover)
126: daysOf(row.days_of_inventory)
165: row.name
166: row.sku
168: formatNumber(row.units_sold)
169: formatNumber(row.opening_units)
170: formatNumber(row.closing_units)
171: formatCurrency(row.average_value)
172: formatCurrency(row.cogs)
173: ratio(row.turnover)
174: daysOf(row.days_of_inventory)
```



<a id="e0349"></a>

> Audit provenance: `platform-source-catalog.md` lines 2174–2217. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/InventoryValuation.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
161: {{ t('reports.common.location') }}
162: {{ t('reports.common.warehouse') }}
163: {{ t('reports.valuationByLocation.products') }}
164: {{ t('common.quantity') }}
165: {{ t('reports.valuationByLocation.costValue') }}
166: {{ t('reports.valuationByLocation.retailValue') }}
209: {{ t('common.product') }}
210: {{ t('products.category') }}
211: {{ t('products.stock') }}
212: {{ t('common.price') }}
213: {{ t('reports.inventoryValuation.stockValue') }}
214: {{ t('reports.inventoryValuation.profitPotential') }}
```

**Displayed data/value expressions:**
```text
126: cat.category
130: cat.items
134: cat.quantity
138: money(cat.value)
140: plusOthers(cat.values)
176: loc.location || t('reports.valuationByLocation.unallocated')
179: loc.warehouse || '-'
180: loc.products
181: loc.quantity
182: money(loc.cost_value)
184: money(loc.retail_value)
185: plusOthers(loc.values, 'retail_value')
224: product.name
225: product.sku
228: product.category || t('reports.inventoryValuation.uncategorized')
231: product.stock
234: formatCurrency(product.price, product.currency)
237: formatCurrency(product.stock_value, product.currency)
240: formatCurrency(product.profit_potential, product.currency)
```



<a id="e0350"></a>

> Audit provenance: `platform-source-catalog.md` lines 2218–2258. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/LowStock.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
131: 
141: {{ t('common.status') }}
142: {{ t('common.product') }}
143: {{ t('products.category') }}
144: {{ t('reports.lowStock.current') }}
145: {{ t('reports.lowStock.min') }}
146: {{ t('reports.lowStock.max') }}
147: {{ t('reports.lowStock.deficit') }}
148: {{ t('reports.lowStock.reorderCost') }}
149: {{ t('productSuppliers.supplier') }}
150: {{ t('quickReorder.suggestedQty') }}
151: {{ t('common.actions') }}
```

**View filters, permission/action and navigation anchors:**
```js
38: const quickReorder = useQuickReorder(computed(() => props.products || []));
```

**Displayed data/value expressions:**
```text
172: product.status.replace('_', ' ')
176: product.name
177: product.sku
180: product.category || t('reports.inventoryValuation.uncategorized')
185: product.current_stock
190: product.min_stock
191: product.max_stock || '-'
192: product.deficit
193: formatCurrency(product.reorder_cost)
195: product.supplier
201: product.suggested_quantity
```



<a id="e0351"></a>

> Audit provenance: `platform-source-catalog.md` lines 2259–2298. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/ProfitMargin.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
105: {{ t('reports.common.category') }}
106: {{ t('reports.common.units') }}
107: {{ t('reports.profitMargin.revenue') }}
108: {{ t('reports.profitMargin.cogs') }}
109: {{ t('reports.profitMargin.margin') }}
110: {{ t('reports.profitMargin.marginPct') }}
146: {{ t('reports.common.product') }}
147: {{ t('reports.common.category') }}
148: {{ t('reports.common.units') }}
149: {{ t('reports.profitMargin.revenue') }}
150: {{ t('reports.profitMargin.cogs') }}
151: {{ t('reports.profitMargin.margin') }}
152: {{ t('reports.profitMargin.marginPct') }}
```

**Displayed data/value expressions:**
```text
119: row.category || t('reports.common.uncategorized')
120: formatNumber(row.units)
121: formatCurrency(row.revenue)
122: formatCurrency(row.cogs)
123: formatCurrency(row.margin)
124: formatPercent(row.margin_pct)
163: row.name
167: row.sku
169: row.category || t('reports.common.uncategorized')
170: formatNumber(row.units)
171: formatCurrency(row.revenue)
172: formatCurrency(row.cogs)
173: formatCurrency(row.margin)
174: formatPercent(row.margin_pct)
```



<a id="e0352"></a>

> Audit provenance: `platform-source-catalog.md` lines 2299–2339. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/Receivables.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
161: {{ t('receivables.customer') }}
162: {{ t('receivables.orders') }}
163: {{ bucketLabel(key) }}
164: {{ t('receivables.total') }}
197: {{ t('orders.orderCol') }}
198: {{ t('receivables.customer') }}
199: {{ t('receivables.orderDate') }}
200: {{ t('receivables.age') }}
201: {{ t('receivables.orderTotal') }}
202: {{ t('receivables.paid') }}
203: {{ t('receivables.balance') }}
```

**Displayed data/value expressions:**
```text
108: row.currency
108: formatCurrency(row.total_outstanding, row.currency)
131: bucketLabel(bucket.key)
132: formatCurrency(bucket.amount)
163: bucketLabel(key)
170: row.customer
171: row.customer
173: row.orders
175: parseFloat(row[key]) > 0 ? formatCurrency(row[key]) : '-'
177: formatCurrency(row.total)
209: order.order_number
210: order.order_number
212: order.customer || '-'
213: displayCalendarDate(order.order_date)
217: formatCurrency(order.total)
218: formatCurrency(order.amount_paid)
219: formatCurrency(order.balance_due)
```



<a id="e0353"></a>

> Audit provenance: `platform-source-catalog.md` lines 2340–2386. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/SalesAnalysis.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Reports/SalesAnalysis.vue:129`: `<input id="date_from" v-model="dateFrom" type="date" />`
- `resources/js/Pages/Reports/SalesAnalysis.vue:133`: `<input id="date_to" v-model="dateTo" type="date" />`

**Visible table headers:**
```text
256: {{ t('payments.paymentStatus') }}
257: {{ t('nav.orders') }}
258: {{ t('common.total') }}
259: {{ t('payments.amountPaid') }}
260: {{ t('payments.balanceDue') }}
296: {{ t('common.date') }}
297: {{ t('nav.orders') }}
298: {{ t('reports.salesAnalysis.revenue') }}
```

**View filters, permission/action and navigation anchors:**
```js
51: const dateFrom = ref(props.filters?.date_from || '');
52: const dateTo = ref(props.filters?.date_to || '');
55: router.get(route('reports.sales-analysis'), {
67: const baseCurrency = computed(() => props.summary?.currency);
84: const maxStatusRevenue = computed(() =>
```

**Displayed data/value expressions:**
```text
198: formatCurrency(item.revenue)
208: item.count
209: plusOthers(item.by_currency, 'revenue')
228: product.product_name
231: formatCurrency(product.revenue, product.currency)
248: formatCurrency(summary.total_outstanding)
249: plusOthers(summary.outstanding_by_currency, 'amount')
272: row.count
273: formatCurrency(row.total)
274: formatCurrency(row.amount_paid)
276: formatCurrency(row.balance_due)
277: plusOthers(row.by_currency, 'balance_due')
307: displayCalendarDate(day.date)
308: day.orders
310: formatCurrency(day.revenue)
311: plusOthers(day.by_currency, 'revenue')
```



<a id="e0354"></a>

> Audit provenance: `platform-source-catalog.md` lines 2387–2421. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/SalesByLocation.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
76: {{ t('reports.common.warehouse') }}
77: {{ t('reports.common.orders') }}
78: {{ t('reports.salesByLocation.sales') }}
79: {{ t('reports.salesByLocation.previous') }}
80: {{ t('reports.salesByLocation.change') }}
117: {{ t('reports.common.location') }}
118: {{ t('reports.common.warehouse') }}
119: {{ t('reports.common.units') }}
120: {{ t('reports.salesByLocation.sales') }}
121: {{ t('reports.salesByLocation.previous') }}
122: {{ t('reports.salesByLocation.change') }}
```

**Displayed data/value expressions:**
```text
89: row.name || t('reports.salesByLocation.noWarehouse')
90: formatNumber(row.orders)
91: formatCurrency(row.revenue)
92: formatCurrency(row.previous_revenue)
93: formatDelta(row.delta_pct)
131: row.name || t('reports.salesByLocation.noLocation')
132: row.warehouse || '-'
133: formatNumber(row.units)
134: formatCurrency(row.revenue)
135: formatCurrency(row.previous_revenue)
136: formatDelta(row.delta_pct)
```



<a id="e0355"></a>

> Audit provenance: `platform-source-catalog.md` lines 2422–2477. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Reports/StockMovement.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Reports/StockMovement.vue:138`: `<input :id="fieldIdPrefix + '-1'" v-model="dateFrom" type="date" />`
- `resources/js/Pages/Reports/StockMovement.vue:142`: `<input :id="fieldIdPrefix + '-2'" v-model="dateTo" type="date" />`
- `resources/js/Pages/Reports/StockMovement.vue:146`: `<select :id="fieldIdPrefix + '-3'" v-model="productId">`
- `resources/js/Pages/Reports/StockMovement.vue:155`: `<select :id="fieldIdPrefix + '-4'" v-model="type">`

**Select option values/labels (dynamic options retain their source):**
```html
147: <option value="">{{ t('reports.stockMovement.allProducts') }}</option>
148: <option v-for="product in products" :key="product.id" :value="product.id"> {{ product.name }} ({{ product.sku }}) </option>
156: <option value="">{{ t('common.allTypes') }}</option>
157: <option value="manual">{{ t('reports.adjustmentTypes.manual') }}</option>
158: <option value="recount">{{ t('reports.adjustmentTypes.recount') }}</option>
159: <option value="damage">{{ t('reports.adjustmentTypes.damage') }}</option>
160: <option value="loss">{{ t('reports.adjustmentTypes.loss') }}</option>
161: <option value="return">{{ t('reports.adjustmentTypes.return') }}</option>
162: <option value="correction">{{ t('reports.adjustmentTypes.correction') }}</option>
```

**Visible table headers:**
```text
178: {{ t('common.date') }}
179: {{ t('common.product') }}
180: {{ t('common.type') }}
181: {{ t('reports.stockMovement.before') }}
182: {{ t('reports.stockMovement.change') }}
183: {{ t('reports.stockMovement.after') }}
184: {{ t('common.user') }}
```

**View filters, permission/action and navigation anchors:**
```js
34: const dateFrom = ref(props.filters?.date_from || '');
35: const dateTo = ref(props.filters?.date_to || '');
36: const productId = ref(props.filters?.product_id || '');
37: const type = ref(props.filters?.type || '');
40: router.get(route('reports.stock-movement'), {
```

**Displayed data/value expressions:**
```text
149: product.name
149: product.sku
194: displayDate(adj.created_at)
197: adj.product.name
198: adj.product.sku
201: te(`stockAdjustments.types.${adj.type}`) ? t(`stockAdjustments.types.${adj.type}`) : adj.type
204: adj.quantity_before
210: adj.adjustment_quantity >= 0 ? '+' : ''
210: adj.adjustment_quantity
213: adj.quantity_after
216: adj.user?.name || t('common.system')
```



<a id="e0374"></a>

> Audit provenance: `platform-source-catalog.md` lines 3294–3335. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/SavedReport/StoreSavedReportRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\SavedReport;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a new saved report via the REST API. Rules unchanged from
11:  * Api\SavedReportController::store.
12:  */
13: final class StoreSavedReportRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'name' => ['required', 'string', 'max:255'],
22:             'description' => ['nullable', 'string', 'max:1000'],
23:             'data_source' => ['required', 'string', 'max:50'],
24:             'columns' => ['required', 'array', 'min:1'],
25:             'columns.*' => ['string', 'max:100'],
26:             'filters' => ['nullable', 'array'],
27:             'filters.*.field' => ['required_with:filters', 'string', 'max:100'],
28:             'filters.*.operator' => ['required_with:filters', 'string', 'max:20'],
29:             'filters.*.value' => ['nullable', 'string', 'max:500'],
30:             'sort' => ['nullable', 'array'],
31:             'sort.field' => ['required_with:sort', 'string', 'max:100'],
32:             'sort.direction' => ['required_with:sort', 'string', 'in:asc,desc'],
33:             'chart_type' => ['nullable', 'string', 'in:bar,line,pie'],
34:             'chart_field' => ['nullable', 'string', 'max:100'],
35:             'is_shared' => ['nullable', 'boolean'],
36:         ];
37:     }
38: }
```



<a id="e0375"></a>

> Audit provenance: `platform-source-catalog.md` lines 3336–3377. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/SavedReport/UpdateSavedReportRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\SavedReport;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a saved report update via the REST API. Rules unchanged from
11:  * Api\SavedReportController::update (name/data_source/columns are `sometimes`).
12:  */
13: final class UpdateSavedReportRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'name' => ['sometimes', 'string', 'max:255'],
22:             'description' => ['nullable', 'string', 'max:1000'],
23:             'data_source' => ['sometimes', 'string', 'max:50'],
24:             'columns' => ['sometimes', 'array', 'min:1'],
25:             'columns.*' => ['string', 'max:100'],
26:             'filters' => ['nullable', 'array'],
27:             'filters.*.field' => ['required_with:filters', 'string', 'max:100'],
28:             'filters.*.operator' => ['required_with:filters', 'string', 'max:20'],
29:             'filters.*.value' => ['nullable', 'string', 'max:500'],
30:             'sort' => ['nullable', 'array'],
31:             'sort.field' => ['required_with:sort', 'string', 'max:100'],
32:             'sort.direction' => ['required_with:sort', 'string', 'in:asc,desc'],
33:             'chart_type' => ['nullable', 'string', 'in:bar,line,pie'],
34:             'chart_field' => ['nullable', 'string', 'max:100'],
35:             'is_shared' => ['nullable', 'boolean'],
36:         ];
37:     }
38: }
```



<a id="e0417"></a>

> Audit provenance: `platform-source-catalog.md` lines 4414–4428. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Reports/AnalyticsReportController.php`
```php
28:     public function __construct(
33:     public function deadStock(Request $request): Response|HttpResponse
66:         return Inertia::render('Reports/DeadStock', [
75:     public function inventoryTurnover(Request $request): Response|HttpResponse
112:         return Inertia::render('Reports/InventoryTurnover', $result + [
117:     public function profitMargin(Request $request): Response|HttpResponse
151:         return Inertia::render('Reports/ProfitMargin', [
161:     public function salesByLocation(Request $request): Response|HttpResponse
200:         return Inertia::render('Reports/SalesByLocation', $result + [
205:     public function abcAnalysis(Request $request): Response|HttpResponse
225:         return Inertia::render('Reports/AbcAnalysis', $result + [
```



<a id="e0418"></a>

> Audit provenance: `platform-source-catalog.md` lines 4429–4443. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Reports/BatchExpiryReportController.php`
```php
19:     public function __invoke(Request $request, ReportExporter $exporter): Response|StreamedResponse
21:         $validated = $request->validate([
22:             'window' => ['sometimes', Rule::in(['7', '30', '90', 'expired', 'all'])],
23:             'search' => ['nullable', 'string', 'max:200'],
24:             'sort_by' => ['sometimes', Rule::in(['expiry_date', 'quantity', 'product_name', 'batch_number'])],
25:             'sort_dir' => ['sometimes', Rule::in(['asc', 'desc'])],
26:             'export' => ['sometimes', Rule::in(['csv'])],
27:         ]);
40:             ->join('products as p', function ($join): void {
55:             $query->where(function ($search) use ($filters): void {
107:         return Inertia::render('Reports/BatchExpiry', [
```



<a id="e0419"></a>

> Audit provenance: `platform-source-catalog.md` lines 4444–4512. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Reports/ReportBuilderController.php`
```php
32:     public function __construct(
40:     public function index(Request $request): Response
48:             ->map(function (SavedReport $report) use ($user) {
67:         return Inertia::render('Reports/Builder/Index', [
76:     public function create(Request $request): Response
80:         return Inertia::render('Reports/Builder/Create', [
90:     public function store(Request $request)
94:         $validated = $request->validate([
95:             'name' => 'required|string|max:255',
96:             'description' => 'nullable|string|max:1000',
97:             'data_source' => 'required|string|max:50',
98:             'columns' => 'required|array|min:1',
99:             'columns.*' => 'string|max:100',
100:             'filters' => 'nullable|array',
101:             'filters.*.field' => 'required_with:filters|string|max:100',
102:             'filters.*.operator' => 'required_with:filters|string|max:20',
103:             'filters.*.value' => 'nullable|string|max:500',
104:             'sort' => 'nullable|array',
105:             'sort.field' => 'required_with:sort|string|max:100',
106:             'sort.direction' => 'required_with:sort|string|in:asc,desc',
107:             'chart_type' => 'nullable|string|in:bar,line,pie',
108:             'chart_field' => 'nullable|string|max:100',
109:             'is_shared' => 'boolean',
110:         ]);
146:     public function show(Request $request, SavedReport $savedReport): Response
178:         return Inertia::render('Reports/Builder/Show', [
206:     private function scheduleProps(SavedReport $savedReport, User $user): array
248:     public function edit(Request $request, SavedReport $savedReport): Response
259:         return Inertia::render('Reports/Builder/Edit', [
281:     public function update(Request $request, SavedReport $savedReport)
290:         $validated = $request->validate([
291:             'name' => 'required|string|max:255',
292:             'description' => 'nullable|string|max:1000',
293:             'data_source' => 'required|string|max:50',
294:             'columns' => 'required|array|min:1',
295:             'columns.*' => 'string|max:100',
296:             'filters' => 'nullable|array',
297:             'filters.*.field' => 'required_with:filters|string|max:100',
298:             'filters.*.operator' => 'required_with:filters|string|max:20',
299:             'filters.*.value' => 'nullable|string|max:500',
300:             'sort' => 'nullable|array',
301:             'sort.field' => 'required_with:sort|string|max:100',
302:             'sort.direction' => 'required_with:sort|string|in:asc,desc',
303:             'chart_type' => 'nullable|string|in:bar,line,pie',
304:             'chart_field' => 'nullable|string|max:100',
305:             'is_shared' => 'boolean',
306:         ]);
318:         $savedReport->update([
340:     public function destroy(Request $request, SavedReport $savedReport)
349:         $savedReport->delete();
362:     public function export(Request $request, SavedReport $savedReport): StreamedResponse
384:         return response()->streamDownload(function () use ($rendered): void {
395:     public function preview(Request $request): JsonResponse
399:         $validated = $request->validate([
400:             'data_source' => 'required|string|max:50',
401:             'columns' => 'required|array|min:1',
402:             'columns.*' => 'string|max:100',
403:             'filters' => 'nullable|array',
404:             'filters.*.field' => 'required_with:filters|string|max:100',
405:             'filters.*.operator' => 'required_with:filters|string|max:20',
406:             'filters.*.value' => 'nullable|string|max:500',
407:             'sort' => 'nullable|array',
408:             'sort.field' => 'required_with:sort|string|max:100',
409:             'sort.direction' => 'required_with:sort|string|in:asc,desc',
410:         ]);
```



<a id="e0420"></a>

> Audit provenance: `platform-source-catalog.md` lines 4513–4544. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Reports/ReportController.php`
```php
39:     public function __construct(
47:     public function index(Request $request): Response
56:         return Inertia::render('Reports/Index', [
72:     public function inventoryValuation(Request $request): Response|HttpResponse
126:             ->map(function ($product) use ($currency) {
176:             ->map(function ($rows) use ($currency) {
230:         return Inertia::render('Reports/InventoryValuation', [
244:     public function stockMovement(Request $request): Response|HttpResponse
310:         return Inertia::render('Reports/StockMovement', [
323:     public function salesAnalysis(Request $request): Response|HttpResponse
385:         $perCurrency = function ($rows, string $key, array $money, array $counts) use ($currency) {
388:                 ->map(function ($group, $value) use ($key, $money, $counts, $currency) {
529:         return Inertia::render('Reports/SalesAnalysis', array_filter([
548:     public function receivables(Request $request, ReceivablesAgingService $aging): Response|HttpResponse
597:         return Inertia::render('Reports/Receivables', $report);
603:     private const RECEIVABLES_BUCKET_LABELS = [
604:         'current' => 'Current',
605:         '1_30' => '1-30 days',
606:         '31_60' => '31-60 days',
607:         '61_90' => '61-90 days',
608:         'over_90' => 'Over 90 days',
609:     ];
616:     public function lowStock(Request $request): Response|HttpResponse
658:         $products = $products->map(function ($product) use ($reorder, $warehouseOnHand) {
701:         return Inertia::render('Reports/LowStock', [
715:     public function categoryPerformance(Request $request): Response|HttpResponse
767:             ->map(function ($rows) use ($currency) {
793:         return Inertia::render('Reports/CategoryPerformance', [
```



<a id="e0421"></a>

> Audit provenance: `platform-source-catalog.md` lines 4545–4566. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Reports/ReportScheduleController.php`
```php
30:     public function store(Request $request, SavedReport $savedReport): RedirectResponse
43:         $schedule->save();
48:     public function update(Request $request, SavedReport $savedReport, ReportSchedule $schedule): RedirectResponse
61:         $schedule->save();
66:     public function destroy(Request $request, SavedReport $savedReport, ReportSchedule $schedule): RedirectResponse
71:         $schedule->delete();
76:     private function authorizeOwner(Request $request, SavedReport $savedReport): void
85:     private function ensureBelongs(SavedReport $savedReport, ReportSchedule $schedule): void
99:     private function validated(Request $request, SavedReport $savedReport): array
101:         $validated = $request->validate([
102:             'frequency' => ['required', 'string', Rule::in(ReportSchedule::FREQUENCIES)],
103:             'day_of_week' => ['nullable', 'required_if:frequency,weekly', 'integer', 'between:0,6'],
104:             'day_of_month' => ['nullable', 'required_if:frequency,monthly', 'integer', 'between:1,31'],
105:             'time_of_day' => ['required', 'date_format:H:i'],
106:             'format' => ['required', 'string', Rule::in(ReportExporter::FORMATS)],
107:             'recipients' => ['required', 'array', 'min:1', 'max:'.ReportSchedule::MAX_RECIPIENTS],
108:             'recipients.*' => ['required', 'email', 'max:255'],
109:         ]);
```



<a id="e0429"></a>

> Audit provenance: `platform-source-catalog.md` lines 4725–4864. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `app/Services/ReportDataService.php:40-175`
```php
40:     /**
41:      * Get all available data sources with their column definitions.
42:      *
43:      * @return array<string, array{label: string, columns: array<string, array{label: string, type: string}>}>
44:      */
45:     public function getAvailableDataSources(): array
46:     {
47:         $sources = [
48:             'products' => [
49:                 'label' => 'Products',
50:                 'columns' => [
51:                     'name' => ['label' => 'Name', 'type' => 'string'],
52:                     'sku' => ['label' => 'SKU', 'type' => 'string'],
53:                     'stock' => ['label' => 'Stock', 'type' => 'number'],
54:                     'price' => ['label' => 'Price', 'type' => 'currency'],
55:                     'purchase_price' => ['label' => 'Purchase Price', 'type' => 'currency'],
56:                     'category_name' => ['label' => 'Category', 'type' => 'string'],
57:                     'location_name' => ['label' => 'Location', 'type' => 'string'],
58:                     'type' => ['label' => 'Type', 'type' => 'string'],
59:                     'is_active' => ['label' => 'Active', 'type' => 'boolean'],
60:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
61:                 ],
62:             ],
63:             'orders' => [
64:                 'label' => 'Orders',
65:                 'columns' => [
66:                     'order_number' => ['label' => 'Order Number', 'type' => 'string'],
67:                     'customer_name' => ['label' => 'Customer', 'type' => 'string'],
68:                     'status' => ['label' => 'Status', 'type' => 'string'],
69:                     'total' => ['label' => 'Total', 'type' => 'currency'],
70:                     'subtotal' => ['label' => 'Subtotal', 'type' => 'currency'],
71:                     'tax' => ['label' => 'Tax', 'type' => 'currency'],
72:                     'order_date' => ['label' => 'Order Date', 'type' => 'date'],
73:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
74:                 ],
75:             ],
76:             'stock_adjustments' => [
77:                 'label' => 'Stock Adjustments',
78:                 'columns' => [
79:                     'product_name' => ['label' => 'Product', 'type' => 'string'],
80:                     'product_sku' => ['label' => 'SKU', 'type' => 'string'],
81:                     'type' => ['label' => 'Type', 'type' => 'string'],
82:                     'quantity' => ['label' => 'Quantity', 'type' => 'number'],
83:                     'reason' => ['label' => 'Reason', 'type' => 'string'],
84:                     'created_at' => ['label' => 'Date', 'type' => 'date'],
85:                 ],
86:             ],
87:             'customers' => [
88:                 'label' => 'Customers',
89:                 'columns' => [
90:                     'name' => ['label' => 'Name', 'type' => 'string'],
91:                     'email' => ['label' => 'Email', 'type' => 'string'],
92:                     'phone' => ['label' => 'Phone', 'type' => 'string'],
93:                     'company' => ['label' => 'Company', 'type' => 'string'],
94:                     'orders_count' => ['label' => 'Orders', 'type' => 'number'],
95:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
96:                 ],
97:             ],
98:             'suppliers' => [
99:                 'label' => 'Suppliers',
100:                 'columns' => [
101:                     'name' => ['label' => 'Name', 'type' => 'string'],
102:                     'email' => ['label' => 'Email', 'type' => 'string'],
103:                     'phone' => ['label' => 'Phone', 'type' => 'string'],
104:                     'products_count' => ['label' => 'Products', 'type' => 'number'],
105:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
106:                 ],
107:             ],
108:             'purchase_orders' => [
109:                 'label' => 'Purchase Orders',
110:                 'columns' => [
111:                     'po_number' => ['label' => 'PO Number', 'type' => 'string'],
112:                     'supplier_name' => ['label' => 'Supplier', 'type' => 'string'],
113:                     'status' => ['label' => 'Status', 'type' => 'string'],
114:                     'total' => ['label' => 'Total', 'type' => 'currency'],
115:                     'order_date' => ['label' => 'Order Date', 'type' => 'date'],
116:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
117:                 ],
118:             ],
119:         ];
120: 
121:         // Hook: let plugins register additional report data sources. Each entry
122:         // is keyed by source slug with {label, columns} matching the built-in
123:         // shape; a matching `report_query_{source}` handler (see executeReport)
124:         // supplies the rows.
125:         return apply_filters('report_data_sources', $sources);
126:     }
127: 
128:     /**
129:      * Execute a report query based on configuration.
130:      *
131:      *
132:      * @throws \InvalidArgumentException
133:      */
134:     public function executeReport(
135:         User $user,
136:         int $organizationId,
137:         string $dataSource,
138:         array $columns,
139:         ?array $filters = null,
140:         ?array $sort = null
141:     ): Collection {
142:         // Enforce the per-source view permission on top of view_reports, so a
143:         // reporting role can't export customer PII / supplier contacts /
144:         // financials it isn't otherwise allowed to read. Checked against the
145:         // acting (viewing) user, so a SHARED report re-checks each viewer.
146:         $this->authorizeDataSource($user, $dataSource);
147: 
148:         if (! $this->isValidDataSource($dataSource)) {
149:             throw new \InvalidArgumentException("Invalid data source: {$dataSource}");
150:         }
151: 
152:         $rows = match ($dataSource) {
153:             'products' => $this->queryProducts($organizationId, $columns, $filters, $sort),
154:             'orders' => $this->queryOrders($organizationId, $columns, $filters, $sort),
155:             'stock_adjustments' => $this->queryStockAdjustments($user, $organizationId, $columns, $filters, $sort),
156:             'customers' => $this->queryCustomers($organizationId, $columns, $filters, $sort),
157:             'suppliers' => $this->querySuppliers($organizationId, $columns, $filters, $sort),
158:             'purchase_orders' => $this->queryPurchaseOrders($organizationId, $columns, $filters, $sort),
159:             // Plugin-registered source: a plugin that added it via the
160:             // report_data_sources filter resolves the rows here. The filter
161:             // returns null when no handler is registered.
162:             default => $this->executePluginDataSource($organizationId, $dataSource, $columns, $filters, $sort),
163:         };
164: 
165:         // Built-in sources cap in SQL; this also bounds plugin sources that
166:         // ignore the limit.
167:         return $rows->take($this->maxRows())->values();
168:     }
169: 
170:     /**
171:      * The view permission each tenant data source requires beyond view_reports.
172:      * Sources without an entry (e.g. stock_adjustments, plugin sources) remain
173:      * gated by view_reports alone.
174:      */
175:     private const SOURCE_PERMISSION = [
```



<a id="e0430"></a>

> Audit provenance: `platform-source-catalog.md` lines 4865–4924. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `app/Services/ReportDataService.php:245-300`
```php
245: 
246:     /**
247:      * Check if a data source is valid.
248:      */
249:     public function isValidDataSource(string $dataSource): bool
250:     {
251:         // Includes plugin-registered sources via the report_data_sources filter.
252:         return array_key_exists($dataSource, $this->getAvailableDataSources());
253:     }
254: 
255:     /**
256:      * Get valid columns for a data source.
257:      *
258:      * @return array<string>
259:      */
260:     public function getValidColumns(string $dataSource): array
261:     {
262:         $sources = $this->getAvailableDataSources();
263: 
264:         return array_keys($sources[$dataSource]['columns'] ?? []);
265:     }
266: 
267:     /**
268:      * Query products data source.
269:      */
270:     private function queryProducts(int $organizationId, array $columns, ?array $filters, ?array $sort): Collection
271:     {
272:         // Expose the computed quantity as a numeric column so selections,
273:         // bound filters and sorting use exactly the same stock definition.
274:         $integerType = in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true) ? 'SIGNED' : 'INTEGER';
275:         $stock = DB::table('products')->select('products.*')
276:             ->selectRaw('CAST('.Product::effectiveStockSql()." AS {$integerType}) AS report_stock");
277:         $query = DB::query()->fromSub($stock, 'products')
278:             ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
279:             ->leftJoin('product_locations', 'products.location_id', '=', 'product_locations.id')
280:             ->where('products.organization_id', $organizationId)
281:             ->whereNull('products.deleted_at');
282: 
283:         // Map report columns to database columns
284:         $columnMap = [
285:             'name' => 'products.name',
286:             'sku' => 'products.sku',
287:             'stock' => 'products.report_stock as stock',
288:             'price' => 'products.price',
289:             'purchase_price' => 'products.purchase_price',
290:             'category_name' => 'product_categories.name as category_name',
291:             'location_name' => 'product_locations.name as location_name',
292:             'type' => 'products.tracking_type as type',
293:             'is_active' => 'products.is_active',
294:             'created_at' => 'products.created_at',
295:         ];
296: 
297:         // Map for filters/sort (raw column references without aliases)
298:         $filterMap = [
299:             'name' => 'products.name',
300:             'sku' => 'products.sku',
```



<a id="e0431"></a>

> Audit provenance: `platform-source-catalog.md` lines 4925–4979. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `app/Models/ReportSchedule.php:25-75`
```php
25:  * @property string $frequency
26:  * @property int|null $day_of_week
27:  * @property int|null $day_of_month
28:  * @property string $time_of_day
29:  * @property string $format
30:  * @property array<int, string> $recipients
31:  * @property bool $is_active
32:  * @property CarbonImmutable|null $next_run_at
33:  * @property CarbonImmutable|null $last_run_at
34:  * @property string|null $last_status
35:  */
36: class ReportSchedule extends Model
37: {
38:     use BelongsToOrganization;
39: 
40:     public const FREQUENCIES = ['daily', 'weekly', 'monthly'];
41: 
42:     public const MAX_RECIPIENTS = 50;
43: 
44:     protected $fillable = [
45:         'organization_id',
46:         'saved_report_id',
47:         'created_by',
48:         'frequency',
49:         'day_of_week',
50:         'day_of_month',
51:         'time_of_day',
52:         'format',
53:         'recipients',
54:         'is_active',
55:         'next_run_at',
56:         'last_run_at',
57:         'last_status',
58:     ];
59: 
60:     protected function casts(): array
61:     {
62:         return [
63:             'recipients' => 'array',
64:             'is_active' => 'boolean',
65:             'day_of_week' => 'integer',
66:             'day_of_month' => 'integer',
67:             'next_run_at' => 'immutable_datetime',
68:             'last_run_at' => 'immutable_datetime',
69:         ];
70:     }
71: 
72:     public function organization(): BelongsTo
73:     {
74:         return $this->belongsTo(Organization::class);
75:     }
```



<a id="e0435"></a>

> Audit provenance: `platform-source-catalog.md` lines 5239–5302. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `routes/web/reports.php:1-60`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: use App\Http\Controllers\Reports\AnalyticsReportController;
6: use App\Http\Controllers\Reports\BatchExpiryReportController;
7: use App\Http\Controllers\Reports\ReportBuilderController;
8: use App\Http\Controllers\Reports\ReportController;
9: use App\Http\Controllers\Reports\ReportScheduleController;
10: use Illuminate\Support\Facades\Route;
11: 
12: /*
13:  * Reports + custom report builder. Loaded inside the `auth` group in
14:  * routes/web.php.
15:  */
16: 
17: Route::prefix('reports')->name('reports.')->middleware('permission:view_reports')->group(function () {
18:     Route::get('/', [ReportController::class, 'index'])->name('index');
19:     Route::get('/inventory-valuation', [ReportController::class, 'inventoryValuation'])->middleware('permission:view_products')->name('inventory-valuation');
20:     Route::get('/stock-movement', [ReportController::class, 'stockMovement'])->name('stock-movement');
21:     Route::get('/sales-analysis', [ReportController::class, 'salesAnalysis'])->middleware('permission:view_orders')->name('sales-analysis');
22:     Route::get('/low-stock', [ReportController::class, 'lowStock'])->middleware('permission:view_products')->name('low-stock');
23:     Route::get('/category-performance', [ReportController::class, 'categoryPerformance'])->middleware('permission:view_products')->name('category-performance');
24:     // Outstanding balances: a report (view_reports, from the group) built
25:     // from payments, so it also needs view_payments.
26:     Route::get('/receivables', [ReportController::class, 'receivables'])->name('receivables')->middleware('permission:view_payments');
27:     Route::get('/batch-expiry', BatchExpiryReportController::class)->name('batch-expiry')->middleware('permission:view_products');
28: 
29:     // Analytics reports. Each also needs the view permission of every data
30:     // source it reads (the report builder's per-source rule): products for
31:     // stock and cost, orders for sales. ?export=csv|xlsx|pdf downloads.
32:     Route::get('/dead-stock', [AnalyticsReportController::class, 'deadStock'])
33:         ->middleware('permission:view_products|view_orders,all')->name('dead-stock');
34:     Route::get('/inventory-turnover', [AnalyticsReportController::class, 'inventoryTurnover'])
35:         ->middleware('permission:view_products|view_orders,all')->name('inventory-turnover');
36:     Route::get('/profit-margin', [AnalyticsReportController::class, 'profitMargin'])
37:         ->middleware('permission:view_products|view_orders,all')->name('profit-margin');
38:     Route::get('/sales-by-location', [AnalyticsReportController::class, 'salesByLocation'])
39:         ->middleware('permission:view_orders')->name('sales-by-location');
40:     Route::get('/abc-analysis', [AnalyticsReportController::class, 'abcAnalysis'])
41:         ->middleware('permission:view_orders')->name('abc-analysis');
42: 
43:     // Custom Report Builder
44:     Route::prefix('builder')->name('builder.')->group(function () {
45:         Route::get('/', [ReportBuilderController::class, 'index'])->name('index');
46:         Route::get('/create', [ReportBuilderController::class, 'create'])->name('create');
47:         Route::post('/', [ReportBuilderController::class, 'store'])->name('store');
48:         Route::post('/preview', [ReportBuilderController::class, 'preview'])->name('preview');
49:         Route::get('/{saved_report}', [ReportBuilderController::class, 'show'])->name('show');
50:         Route::get('/{saved_report}/edit', [ReportBuilderController::class, 'edit'])->name('edit');
51:         Route::put('/{saved_report}', [ReportBuilderController::class, 'update'])->name('update');
52:         Route::delete('/{saved_report}', [ReportBuilderController::class, 'destroy'])->name('destroy');
53:         Route::get('/{saved_report}/export', [ReportBuilderController::class, 'export'])->name('export');
54: 
55:         // Scheduled email delivery (report owner only; see ReportScheduleController).
56:         Route::post('/{saved_report}/schedules', [ReportScheduleController::class, 'store'])->name('schedules.store');
57:         Route::put('/{saved_report}/schedules/{schedule}', [ReportScheduleController::class, 'update'])->name('schedules.update');
58:         Route::delete('/{saved_report}/schedules/{schedule}', [ReportScheduleController::class, 'destroy'])->name('schedules.destroy');
59:     });
60: });
```



<a id="e0447"></a>

> Audit provenance: `platform-source-catalog.md` lines 7202–7290. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Services/Reports/ReportPeriod.php`

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Services\Reports;
6: 
7: use Carbon\CarbonImmutable;
8: use Illuminate\Http\Request;
9: 
10: /**
11:  * An inclusive whole-day date range for a report, plus the equal-length
12:  * period immediately before it (for period-over-period comparison).
13:  */
14: final class ReportPeriod
15: {
16:     public function __construct(
17:         public readonly CarbonImmutable $from,
18:         public readonly CarbonImmutable $to,
19:     ) {}
20: 
21:     /**
22:      * Read date_from / date_to (Y-m-d) from the request. Missing or malformed
23:      * values fall back to the last $defaultDays days ending today, and a
24:      * reversed range is swapped rather than rejected.
25:      */
26:     public static function fromRequest(Request $request, int $defaultDays = 30): self
27:     {
28:         $to = self::parse($request->query('date_to')) ?? CarbonImmutable::now();
29:         $from = self::parse($request->query('date_from')) ?? $to->subDays($defaultDays);
30: 
31:         if ($from->greaterThan($to)) {
32:             [$from, $to] = [$to, $from];
33:         }
34: 
35:         return new self($from->startOfDay(), $to->endOfDay());
36:     }
37: 
38:     public static function fromDates(string $from, string $to): self
39:     {
40:         return new self(
41:             CarbonImmutable::parse($from)->startOfDay(),
42:             CarbonImmutable::parse($to)->endOfDay(),
43:         );
44:     }
45: 
46:     /** Number of calendar days covered, inclusive of both ends. */
47:     public function days(): int
48:     {
49:         return (int) $this->from->startOfDay()->diffInDays($this->to->startOfDay()) + 1;
50:     }
51: 
52:     /** The equal-length period ending the day before this one starts. */
53:     public function previous(): self
54:     {
55:         $to = $this->from->subDay()->endOfDay();
56: 
57:         return new self($to->subDays($this->days() - 1)->startOfDay(), $to);
58:     }
59: 
60:     /** @return array{date_from: string, date_to: string} */
61:     public function toFilters(): array
62:     {
63:         return [
64:             'date_from' => $this->from->format('Y-m-d'),
65:             'date_to' => $this->to->format('Y-m-d'),
66:         ];
67:     }
68: 
69:     public function label(): string
70:     {
71:         return $this->from->format('Y-m-d').' to '.$this->to->format('Y-m-d');
72:     }
73: 
74:     private static function parse(mixed $value): ?CarbonImmutable
75:     {
76:         if (! is_string($value) || ! preg_match('/^\d{4}-\d{2}-\d{2}$/', $value)) {
77:             return null;
78:         }
79: 
80:         $date = CarbonImmutable::createFromFormat('!Y-m-d', $value);
81: 
82:         return $date !== false && $date->format('Y-m-d') === $value ? $date : null;
83:     }
84: }
```



<a id="e0448"></a>

> Audit provenance: `platform-source-catalog.md` lines 7291–7474. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Services/Reports/ReportExporter.php`

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Services\Reports;
6: 
7: use App\Exports\ReportSheetExport;
8: use App\Support\SpreadsheetSafety;
9: use Barryvdh\DomPDF\Facade\Pdf;
10: use Illuminate\Http\Request;
11: use Illuminate\Support\Str;
12: use Maatwebsite\Excel\DefaultValueBinder;
13: use Maatwebsite\Excel\Excel as ExcelWriter;
14: use Maatwebsite\Excel\Facades\Excel;
15: use PhpOffice\PhpSpreadsheet\Cell\Cell;
16: use Symfony\Component\HttpFoundation\StreamedResponse;
17: 
18: /**
19:  * Renders any tabular report (fixed reports and saved builder reports) as
20:  * CSV, XLSX or PDF. Used by the download routes and by scheduled report
21:  * emails, so an attachment is byte-for-byte what a download would give.
22:  *
23:  * Callers pass native ints/floats for numeric cells: strings are treated as
24:  * text and neutralised against formula injection in CSV and XLSX.
25:  */
26: class ReportExporter
27: {
28:     public const FORMATS = ['csv', 'xlsx', 'pdf'];
29: 
30:     private const MIME = [
31:         'csv' => 'text/csv; charset=UTF-8',
32:         'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
33:         'pdf' => 'application/pdf',
34:     ];
35: 
36:     public static function isValidFormat(?string $format): bool
37:     {
38:         return $format !== null && in_array($format, self::FORMATS, true);
39:     }
40: 
41:     /**
42:      * The format a report page was asked to export in (?export=csv|xlsx|pdf),
43:      * or null to render the page.
44:      */
45:     public static function requestedFormat(Request $request): ?string
46:     {
47:         $format = $request->query('export');
48: 
49:         return is_string($format) && self::isValidFormat($format) ? $format : null;
50:     }
51: 
52:     /**
53:      * @param  array<int, string>  $headers
54:      * @param  iterable<int, array<int, mixed>>  $rows
55:      * @param  array<int, string>  $notes  Context lines printed above the PDF table (period, caveats).
56:      */
57:     public function render(string $format, string $title, array $headers, iterable $rows, array $notes = []): RenderedReport
58:     {
59:         if (! self::isValidFormat($format)) {
60:             throw new \InvalidArgumentException("Unsupported report export format: {$format}");
61:         }
62: 
63:         $rows = $this->normaliseRows($rows);
64: 
65:         $content = match ($format) {
66:             'csv' => $this->csv($headers, $rows),
67:             'xlsx' => $this->xlsx($title, $headers, $rows),
68:             'pdf' => $this->pdf($title, $headers, $rows, $notes),
69:         };
70: 
71:         return new RenderedReport($content, self::MIME[$format], $this->filename($title, $format));
72:     }
73: 
74:     /**
75:      * @param  array<int, string>  $headers
76:      * @param  iterable<int, array<int, mixed>>  $rows
77:      * @param  array<int, string>  $notes
78:      */
79:     public function download(string $format, string $title, array $headers, iterable $rows, array $notes = []): StreamedResponse
80:     {
81:         $rendered = $this->render($format, $title, $headers, $rows, $notes);
82: 
83:         // Streamed like the builder's original CSV export, so every report
84:         // download behaves (and tests) the same way.
85:         return response()->streamDownload(function () use ($rendered): void {
86:             echo $rendered->content;
87:         }, $rendered->filename, [
88:             'Content-Type' => $rendered->mimeType,
89:             'X-Content-Type-Options' => 'nosniff',
90:         ]);
91:     }
92: 
93:     public function filename(string $title, string $format): string
94:     {
95:         $slug = Str::slug($title) ?: 'report';
96: 
97:         return $slug.'_'.now()->format('Y-m-d').'.'.$format;
98:     }
99: 
100:     /**
101:      * @param  iterable<int, mixed>  $rows
102:      * @return array<int, array<int, mixed>>
103:      */
104:     private function normaliseRows(iterable $rows): array
105:     {
106:         $out = [];
107:         foreach ($rows as $row) {
108:             $out[] = array_values(is_array($row) ? $row : (array) $row);
109:         }
110: 
111:         return $out;
112:     }
113: 
114:     /**
115:      * @param  array<int, string>  $headers
116:      * @param  array<int, array<int, mixed>>  $rows
117:      */
118:     private function csv(array $headers, array $rows): string
119:     {
120:         $handle = fopen('php://temp', 'r+');
121: 
122:         // UTF-8 BOM so Excel opens accented names correctly.
123:         fwrite($handle, "\xEF\xBB\xBF");
124:         fputcsv($handle, SpreadsheetSafety::neutraliseRow($headers), escape: '');
125: 
126:         foreach ($rows as $row) {
127:             fputcsv($handle, SpreadsheetSafety::neutraliseRow($row), escape: '');
128:         }
129: 
130:         rewind($handle);
131:         $content = (string) stream_get_contents($handle);
132:         fclose($handle);
133: 
134:         return $content;
135:     }
136: 
137:     /**
138:      * The sheet installs its string-typing value binder on PhpSpreadsheet's
139:      * process-wide Cell binder; restore the configured default afterwards so
140:      * it never leaks into a later import or export in the same worker.
141:      *
142:      * @param  array<int, string>  $headers
143:      * @param  array<int, array<int, mixed>>  $rows
144:      */
145:     private function xlsx(string $title, array $headers, array $rows): string
146:     {
147:         try {
148:             return Excel::raw(new ReportSheetExport($headers, $rows, $title), ExcelWriter::XLSX);
149:         } finally {
150:             $binder = config('excel.value_binder.default', DefaultValueBinder::class);
151:             Cell::setValueBinder(app($binder));
152:         }
153:     }
154: 
155:     /**
156:      * A PDF of tens of thousands of rows is neither readable nor cheap to
157:      * render, so the PDF is capped at reports.pdf_max_rows and says so; CSV and
158:      * XLSX carry the full (reports.max_rows bounded) set.
159:      *
160:      * @param  array<int, string>  $headers
161:      * @param  array<int, array<int, mixed>>  $rows
162:      * @param  array<int, string>  $notes
163:      */
164:     private function pdf(string $title, array $headers, array $rows, array $notes): string
165:     {
166:         $cap = max(1, (int) config('reports.pdf_max_rows', 1000));
167:         $truncated = count($rows) > $cap;
168: 
169:         return Pdf::loadView('pdf.report', [
170:             'title' => $title,
171:             'headers' => $headers,
172:             'rows' => array_slice($rows, 0, $cap),
173:             'notes' => $notes,
174:             'truncatedAt' => $truncated ? $cap : null,
175:             'totalRows' => count($rows),
176:             'generatedDate' => now()->format('F j, Y H:i'),
177:         ])->setPaper('a4', count($headers) > 5 ? 'landscape' : 'portrait')->output();
178:     }
179: }
```



<a id="e0451"></a>

> Audit provenance: `platform-source-catalog.md` lines 7805–8512. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Complete source contract `app/Services/ReportDataService.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Services;
6: 
7: use App\Models\Inventory\Product;
8: use App\Models\User;
9: use Illuminate\Auth\Access\AuthorizationException;
10: use Illuminate\Database\Query\Builder;
11: use Illuminate\Database\Query\Expression;
12: use Illuminate\Support\Collection;
13: use Illuminate\Support\Facades\DB;
14: 
15: /**
16:  * Service for executing custom report queries.
17:  *
18:  * Builds and executes database queries based on report configuration,
19:  * supporting multiple data sources, column selection, filtering, and sorting.
20:  */
21: class ReportDataService
22: {
23:     /**
24:      * Valid filter operators.
25:      */
26:     private const VALID_OPERATORS = [
27:         'eq',
28:         'neq',
29:         'gt',
30:         'lt',
31:         'gte',
32:         'lte',
33:         'contains',
34:         'starts_with',
35:         'ends_with',
36:         'is_null',
37:         'is_not_null',
38:     ];
39: 
40:     /**
41:      * Get all available data sources with their column definitions.
42:      *
43:      * @return array<string, array{label: string, columns: array<string, array{label: string, type: string}>}>
44:      */
45:     public function getAvailableDataSources(): array
46:     {
47:         $sources = [
48:             'products' => [
49:                 'label' => 'Products',
50:                 'columns' => [
51:                     'name' => ['label' => 'Name', 'type' => 'string'],
52:                     'sku' => ['label' => 'SKU', 'type' => 'string'],
53:                     'stock' => ['label' => 'Stock', 'type' => 'number'],
54:                     'price' => ['label' => 'Price', 'type' => 'currency'],
55:                     'purchase_price' => ['label' => 'Purchase Price', 'type' => 'currency'],
56:                     'category_name' => ['label' => 'Category', 'type' => 'string'],
57:                     'location_name' => ['label' => 'Location', 'type' => 'string'],
58:                     'type' => ['label' => 'Type', 'type' => 'string'],
59:                     'is_active' => ['label' => 'Active', 'type' => 'boolean'],
60:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
61:                 ],
62:             ],
63:             'orders' => [
64:                 'label' => 'Orders',
65:                 'columns' => [
66:                     'order_number' => ['label' => 'Order Number', 'type' => 'string'],
67:                     'customer_name' => ['label' => 'Customer', 'type' => 'string'],
68:                     'status' => ['label' => 'Status', 'type' => 'string'],
69:                     'total' => ['label' => 'Total', 'type' => 'currency'],
70:                     'subtotal' => ['label' => 'Subtotal', 'type' => 'currency'],
71:                     'tax' => ['label' => 'Tax', 'type' => 'currency'],
72:                     'order_date' => ['label' => 'Order Date', 'type' => 'date'],
73:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
74:                 ],
75:             ],
76:             'stock_adjustments' => [
77:                 'label' => 'Stock Adjustments',
78:                 'columns' => [
79:                     'product_name' => ['label' => 'Product', 'type' => 'string'],
80:                     'product_sku' => ['label' => 'SKU', 'type' => 'string'],
81:                     'type' => ['label' => 'Type', 'type' => 'string'],
82:                     'quantity' => ['label' => 'Quantity', 'type' => 'number'],
83:                     'reason' => ['label' => 'Reason', 'type' => 'string'],
84:                     'created_at' => ['label' => 'Date', 'type' => 'date'],
85:                 ],
86:             ],
87:             'customers' => [
88:                 'label' => 'Customers',
89:                 'columns' => [
90:                     'name' => ['label' => 'Name', 'type' => 'string'],
91:                     'email' => ['label' => 'Email', 'type' => 'string'],
92:                     'phone' => ['label' => 'Phone', 'type' => 'string'],
93:                     'company' => ['label' => 'Company', 'type' => 'string'],
94:                     'orders_count' => ['label' => 'Orders', 'type' => 'number'],
95:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
96:                 ],
97:             ],
98:             'suppliers' => [
99:                 'label' => 'Suppliers',
100:                 'columns' => [
101:                     'name' => ['label' => 'Name', 'type' => 'string'],
102:                     'email' => ['label' => 'Email', 'type' => 'string'],
103:                     'phone' => ['label' => 'Phone', 'type' => 'string'],
104:                     'products_count' => ['label' => 'Products', 'type' => 'number'],
105:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
106:                 ],
107:             ],
108:             'purchase_orders' => [
109:                 'label' => 'Purchase Orders',
110:                 'columns' => [
111:                     'po_number' => ['label' => 'PO Number', 'type' => 'string'],
112:                     'supplier_name' => ['label' => 'Supplier', 'type' => 'string'],
113:                     'status' => ['label' => 'Status', 'type' => 'string'],
114:                     'total' => ['label' => 'Total', 'type' => 'currency'],
115:                     'order_date' => ['label' => 'Order Date', 'type' => 'date'],
116:                     'created_at' => ['label' => 'Created', 'type' => 'date'],
117:                 ],
118:             ],
119:         ];
120: 
121:         // Hook: let plugins register additional report data sources. Each entry
122:         // is keyed by source slug with {label, columns} matching the built-in
123:         // shape; a matching `report_query_{source}` handler (see executeReport)
124:         // supplies the rows.
125:         return apply_filters('report_data_sources', $sources);
126:     }
127: 
128:     /**
129:      * Execute a report query based on configuration.
130:      *
131:      *
132:      * @throws \InvalidArgumentException
133:      */
134:     public function executeReport(
135:         User $user,
136:         int $organizationId,
137:         string $dataSource,
138:         array $columns,
139:         ?array $filters = null,
140:         ?array $sort = null
141:     ): Collection {
142:         // Enforce the per-source view permission on top of view_reports, so a
143:         // reporting role can't export customer PII / supplier contacts /
144:         // financials it isn't otherwise allowed to read. Checked against the
145:         // acting (viewing) user, so a SHARED report re-checks each viewer.
146:         $this->authorizeDataSource($user, $dataSource);
147: 
148:         if (! $this->isValidDataSource($dataSource)) {
149:             throw new \InvalidArgumentException("Invalid data source: {$dataSource}");
150:         }
151: 
152:         $rows = match ($dataSource) {
153:             'products' => $this->queryProducts($organizationId, $columns, $filters, $sort),
154:             'orders' => $this->queryOrders($organizationId, $columns, $filters, $sort),
155:             'stock_adjustments' => $this->queryStockAdjustments($user, $organizationId, $columns, $filters, $sort),
156:             'customers' => $this->queryCustomers($organizationId, $columns, $filters, $sort),
157:             'suppliers' => $this->querySuppliers($organizationId, $columns, $filters, $sort),
158:             'purchase_orders' => $this->queryPurchaseOrders($organizationId, $columns, $filters, $sort),
159:             // Plugin-registered source: a plugin that added it via the
160:             // report_data_sources filter resolves the rows here. The filter
161:             // returns null when no handler is registered.
162:             default => $this->executePluginDataSource($organizationId, $dataSource, $columns, $filters, $sort),
163:         };
164: 
165:         // Built-in sources cap in SQL; this also bounds plugin sources that
166:         // ignore the limit.
167:         return $rows->take($this->maxRows())->values();
168:     }
169: 
170:     /**
171:      * The view permission each tenant data source requires beyond view_reports.
172:      * Sources without an entry (e.g. stock_adjustments, plugin sources) remain
173:      * gated by view_reports alone.
174:      */
175:     private const SOURCE_PERMISSION = [
176:         'products' => 'view_products',
177:         'orders' => 'view_orders',
178:         'customers' => 'view_customers',
179:         'suppliers' => 'view_suppliers',
180:         'purchase_orders' => 'view_purchase_orders',
181:     ];
182: 
183:     /**
184:      * Every permission needed to see a report over this data source:
185:      * view_reports plus the source's own view permission, if it has one.
186:      *
187:      * @return array<int, string>
188:      */
189:     public static function viewPermissionsFor(string $dataSource): array
190:     {
191:         return array_values(array_filter(['view_reports', self::SOURCE_PERMISSION[$dataSource] ?? null]));
192:     }
193: 
194:     /**
195:      * Hard row cap applied to every report query, so a report over a huge
196:      * tenant can't materialise an unbounded result set into memory (OOM) or
197:      * time out. Configurable via reports.max_rows.
198:      */
199:     private function maxRows(): int
200:     {
201:         return (int) config('reports.max_rows', 10000);
202:     }
203: 
204:     /**
205:      * @throws AuthorizationException When the user lacks the source's view permission.
206:      */
207:     private function authorizeDataSource(User $user, string $dataSource): void
208:     {
209:         $permission = self::SOURCE_PERMISSION[$dataSource] ?? null;
210: 
211:         if ($permission !== null && ! $user->hasPermission($permission)) {
212:             throw new AuthorizationException(
213:                 "You do not have permission to report on the {$dataSource} data source."
214:             );
215:         }
216:     }
217: 
218:     /**
219:      * Resolve a plugin-registered data source through its query hook.
220:      *
221:      * @throws \InvalidArgumentException When no plugin handler is registered.
222:      */
223:     private function executePluginDataSource(
224:         int $organizationId,
225:         string $dataSource,
226:         array $columns,
227:         ?array $filters,
228:         ?array $sort
229:     ): Collection {
230:         $result = apply_filters(
231:             "report_query_{$dataSource}",
232:             null,
233:             $organizationId,
234:             $columns,
235:             $filters,
236:             $sort
237:         );
238: 
239:         if (! $result instanceof Collection) {
240:             throw new \InvalidArgumentException("No query handler registered for data source: {$dataSource}");
241:         }
242: 
243:         return $result;
244:     }
245: 
246:     /**
247:      * Check if a data source is valid.
248:      */
249:     public function isValidDataSource(string $dataSource): bool
250:     {
251:         // Includes plugin-registered sources via the report_data_sources filter.
252:         return array_key_exists($dataSource, $this->getAvailableDataSources());
253:     }
254: 
255:     /**
256:      * Get valid columns for a data source.
257:      *
258:      * @return array<string>
259:      */
260:     public function getValidColumns(string $dataSource): array
261:     {
262:         $sources = $this->getAvailableDataSources();
263: 
264:         return array_keys($sources[$dataSource]['columns'] ?? []);
265:     }
266: 
267:     /**
268:      * Query products data source.
269:      */
270:     private function queryProducts(int $organizationId, array $columns, ?array $filters, ?array $sort): Collection
271:     {
272:         // Expose the computed quantity as a numeric column so selections,
273:         // bound filters and sorting use exactly the same stock definition.
274:         $integerType = in_array(DB::connection()->getDriverName(), ['mysql', 'mariadb'], true) ? 'SIGNED' : 'INTEGER';
275:         $stock = DB::table('products')->select('products.*')
276:             ->selectRaw('CAST('.Product::effectiveStockSql()." AS {$integerType}) AS report_stock");
277:         $query = DB::query()->fromSub($stock, 'products')
278:             ->leftJoin('product_categories', 'products.category_id', '=', 'product_categories.id')
279:             ->leftJoin('product_locations', 'products.location_id', '=', 'product_locations.id')
280:             ->where('products.organization_id', $organizationId)
281:             ->whereNull('products.deleted_at');
282: 
283:         // Map report columns to database columns
284:         $columnMap = [
285:             'name' => 'products.name',
286:             'sku' => 'products.sku',
287:             'stock' => 'products.report_stock as stock',
288:             'price' => 'products.price',
289:             'purchase_price' => 'products.purchase_price',
290:             'category_name' => 'product_categories.name as category_name',
291:             'location_name' => 'product_locations.name as location_name',
292:             'type' => 'products.tracking_type as type',
293:             'is_active' => 'products.is_active',
294:             'created_at' => 'products.created_at',
295:         ];
296: 
297:         // Map for filters/sort (raw column references without aliases)
298:         $filterMap = [
299:             'name' => 'products.name',
300:             'sku' => 'products.sku',
301:             'stock' => 'products.report_stock',
302:             'price' => 'products.price',
303:             'purchase_price' => 'products.purchase_price',
304:             'category_name' => 'product_categories.name',
305:             'location_name' => 'product_locations.name',
306:             'type' => 'products.tracking_type',
307:             'is_active' => 'products.is_active',
308:             'created_at' => 'products.created_at',
309:         ];
310: 
311:         $selectColumns = $this->buildSelectColumns($columns, $columnMap);
312:         $query->select($selectColumns);
313: 
314:         $this->applyFilters($query, $filters, $filterMap);
315:         $this->applySorting($query, $sort, $filterMap);
316: 
317:         return $query->limit($this->maxRows())->get();
318:     }
319: 
320:     /**
321:      * Query orders data source.
322:      */
323:     private function queryOrders(int $organizationId, array $columns, ?array $filters, ?array $sort): Collection
324:     {
325:         $query = DB::table('orders')
326:             ->where('orders.organization_id', $organizationId)
327:             ->whereNull('orders.deleted_at');
328: 
329:         $columnMap = [
330:             'order_number' => 'orders.order_number',
331:             'customer_name' => 'orders.customer_name',
332:             'status' => 'orders.status',
333:             'total' => 'orders.total',
334:             'subtotal' => 'orders.subtotal',
335:             'tax' => 'orders.tax',
336:             'order_date' => 'orders.order_date',
337:             'created_at' => 'orders.created_at',
338:         ];
339: 
340:         $filterMap = [
341:             'order_number' => 'orders.order_number',
342:             'customer_name' => 'orders.customer_name',
343:             'status' => 'orders.status',
344:             'total' => 'orders.total',
345:             'subtotal' => 'orders.subtotal',
346:             'tax' => 'orders.tax',
347:             'order_date' => 'orders.order_date',
348:             'created_at' => 'orders.created_at',
349:         ];
350: 
351:         $selectColumns = $this->buildSelectColumns($columns, $columnMap);
352:         $query->select($selectColumns);
353: 
354:         $this->applyFilters($query, $filters, $filterMap);
355:         $this->applySorting($query, $sort, $filterMap);
356: 
357:         return $query->limit($this->maxRows())->get();
358:     }
359: 
360:     /**
361:      * Query stock adjustments data source.
362:      */
363:     private function queryStockAdjustments(User $user, int $organizationId, array $columns, ?array $filters, ?array $sort): Collection
364:     {
365:         $query = DB::table('stock_adjustments')
366:             ->leftJoin('products', 'stock_adjustments.product_id', '=', 'products.id')
367:             ->where('stock_adjustments.organization_id', $organizationId);
368: 
369:         app(WarehouseAccessService::class)->scopeByLocation($query, $user, 'stock_adjustments.location_id');
370: 
371:         $columnMap = [
372:             'product_name' => 'products.name as product_name',
373:             'product_sku' => 'products.sku as product_sku',
374:             'type' => 'stock_adjustments.type',
375:             'quantity' => 'stock_adjustments.adjustment_quantity as quantity',
376:             'reason' => 'stock_adjustments.reason',
377:             'created_at' => 'stock_adjustments.created_at',
378:         ];
379: 
380:         $filterMap = [
381:             'product_name' => 'products.name',
382:             'product_sku' => 'products.sku',
383:             'type' => 'stock_adjustments.type',
384:             'quantity' => 'stock_adjustments.adjustment_quantity',
385:             'reason' => 'stock_adjustments.reason',
386:             'created_at' => 'stock_adjustments.created_at',
387:         ];
388: 
389:         $selectColumns = $this->buildSelectColumns($columns, $columnMap);
390:         $query->select($selectColumns);
391: 
392:         $this->applyFilters($query, $filters, $filterMap);
393:         $this->applySorting($query, $sort, $filterMap);
394: 
395:         return $query->limit($this->maxRows())->get();
396:     }
397: 
398:     /**
399:      * Query customers data source.
400:      */
401:     private function queryCustomers(int $organizationId, array $columns, ?array $filters, ?array $sort): Collection
402:     {
403:         $needsOrdersCount = in_array('orders_count', $columns, true);
404: 
405:         $query = DB::table('customers')
406:             ->where('customers.organization_id', $organizationId)
407:             ->whereNull('customers.deleted_at');
408: 
409:         if ($needsOrdersCount) {
410:             $query->leftJoin('orders', function ($join) {
411:                 $join->on('customers.id', '=', 'orders.customer_id')
412:                     ->whereNull('orders.deleted_at');
413:             })
414:                 ->groupBy('customers.id');
415:         }
416: 
417:         $columnMap = [
418:             'name' => 'customers.name',
419:             'email' => 'customers.email',
420:             'phone' => 'customers.phone',
421:             'company' => 'customers.company_name as company',
422:             'orders_count' => DB::raw('COUNT(orders.id) as orders_count'),
423:             'created_at' => 'customers.created_at',
424:         ];
425: 
426:         $filterMap = [
427:             'name' => 'customers.name',
428:             'email' => 'customers.email',
429:             'phone' => 'customers.phone',
430:             'company' => 'customers.company_name',
431:             'orders_count' => DB::raw('COUNT(orders.id)'),
432:             'created_at' => 'customers.created_at',
433:         ];
434: 
435:         $selectColumns = $this->buildSelectColumns($columns, $columnMap);
436: 
437:         // When grouping, ensure primary columns are in the group by
438:         if ($needsOrdersCount) {
439:             $groupByColumns = [];
440:             foreach ($columns as $col) {
441:                 if ($col !== 'orders_count' && isset($filterMap[$col])) {
442:                     $groupByColumns[] = $filterMap[$col];
443:                 }
444:             }
445:             if (! empty($groupByColumns)) {
446:                 $query->groupBy(array_merge(['customers.id'], $groupByColumns));
447:             }
448:         }
449: 
450:         $query->select($selectColumns);
451: 
452:         // For aggregate columns, apply having instead of where
453:         if ($filters) {
454:             $aggregateFilters = [];
455:             $normalFilters = [];
456:             foreach ($filters as $filter) {
457:                 if (($filter['field'] ?? '') === 'orders_count') {
458:                     $aggregateFilters[] = $filter;
459:                 } else {
460:                     $normalFilters[] = $filter;
461:                 }
462:             }
463:             $this->applyFilters($query, $normalFilters, $filterMap);
464:             $this->applyHavingFilters($query, $aggregateFilters, $filterMap);
465:         }
466: 
467:         $this->applySorting($query, $sort, $filterMap);
468: 
469:         return $query->limit($this->maxRows())->get();
470:     }
471: 
472:     /**
473:      * Query suppliers data source.
474:      */
475:     private function querySuppliers(int $organizationId, array $columns, ?array $filters, ?array $sort): Collection
476:     {
477:         $needsProductsCount = in_array('products_count', $columns, true);
478: 
479:         $query = DB::table('suppliers')
480:             ->where('suppliers.organization_id', $organizationId)
481:             ->whereNull('suppliers.deleted_at');
482: 
483:         if ($needsProductsCount) {
484:             $query->leftJoin('product_supplier', 'suppliers.id', '=', 'product_supplier.supplier_id')
485:                 ->groupBy('suppliers.id');
486:         }
487: 
488:         $columnMap = [
489:             'name' => 'suppliers.name',
490:             'email' => 'suppliers.email',
491:             'phone' => 'suppliers.phone',
492:             'products_count' => DB::raw('COUNT(product_supplier.product_id) as products_count'),
493:             'created_at' => 'suppliers.created_at',
494:         ];
495: 
496:         $filterMap = [
497:             'name' => 'suppliers.name',
498:             'email' => 'suppliers.email',
499:             'phone' => 'suppliers.phone',
500:             'products_count' => DB::raw('COUNT(product_supplier.product_id)'),
501:             'created_at' => 'suppliers.created_at',
502:         ];
503: 
504:         $selectColumns = $this->buildSelectColumns($columns, $columnMap);
505: 
506:         if ($needsProductsCount) {
507:             $groupByColumns = [];
508:             foreach ($columns as $col) {
509:                 if ($col !== 'products_count' && isset($filterMap[$col])) {
510:                     $groupByColumns[] = $filterMap[$col];
511:                 }
512:             }
513:             if (! empty($groupByColumns)) {
514:                 $query->groupBy(array_merge(['suppliers.id'], $groupByColumns));
515:             }
516:         }
517: 
518:         $query->select($selectColumns);
519: 
520:         if ($filters) {
521:             $aggregateFilters = [];
522:             $normalFilters = [];
523:             foreach ($filters as $filter) {
524:                 if (($filter['field'] ?? '') === 'products_count') {
525:                     $aggregateFilters[] = $filter;
526:                 } else {
527:                     $normalFilters[] = $filter;
528:                 }
529:             }
530:             $this->applyFilters($query, $normalFilters, $filterMap);
531:             $this->applyHavingFilters($query, $aggregateFilters, $filterMap);
532:         }
533: 
534:         $this->applySorting($query, $sort, $filterMap);
535: 
536:         return $query->limit($this->maxRows())->get();
537:     }
538: 
539:     /**
540:      * Query purchase orders data source.
541:      */
542:     private function queryPurchaseOrders(int $organizationId, array $columns, ?array $filters, ?array $sort): Collection
543:     {
544:         $query = DB::table('purchase_orders')
545:             // Constrain the supplier join to the same organization so a PO whose
546:             // supplier_id was set to another tenant's id (defence in depth
547:             // alongside the org-scoped request rule) resolves supplier_name to
548:             // null rather than leaking the foreign supplier's name.
549:             ->leftJoin('suppliers', function ($join) use ($organizationId) {
550:                 $join->on('purchase_orders.supplier_id', '=', 'suppliers.id')
551:                     ->where('suppliers.organization_id', '=', $organizationId);
552:             })
553:             ->where('purchase_orders.organization_id', $organizationId)
554:             ->whereNull('purchase_orders.deleted_at');
555: 
556:         $columnMap = [
557:             'po_number' => 'purchase_orders.po_number',
558:             'supplier_name' => 'suppliers.name as supplier_name',
559:             'status' => 'purchase_orders.status',
560:             'total' => 'purchase_orders.total',
561:             'order_date' => 'purchase_orders.order_date',
562:             'created_at' => 'purchase_orders.created_at',
563:         ];
564: 
565:         $filterMap = [
566:             'po_number' => 'purchase_orders.po_number',
567:             'supplier_name' => 'suppliers.name',
568:             'status' => 'purchase_orders.status',
569:             'total' => 'purchase_orders.total',
570:             'order_date' => 'purchase_orders.order_date',
571:             'created_at' => 'purchase_orders.created_at',
572:         ];
573: 
574:         $selectColumns = $this->buildSelectColumns($columns, $columnMap);
575:         $query->select($selectColumns);
576: 
577:         $this->applyFilters($query, $filters, $filterMap);
578:         $this->applySorting($query, $sort, $filterMap);
579: 
580:         return $query->limit($this->maxRows())->get();
581:     }
582: 
583:     /**
584:      * Build SELECT column expressions from requested columns.
585:      */
586:     private function buildSelectColumns(array $columns, array $columnMap): array
587:     {
588:         $selectColumns = [];
589: 
590:         foreach ($columns as $column) {
591:             if (isset($columnMap[$column])) {
592:                 $selectColumns[] = $columnMap[$column];
593:             }
594:         }
595: 
596:         return $selectColumns;
597:     }
598: 
599:     /**
600:      * Apply WHERE filters to a query.
601:      *
602:      * @param  Builder  $query
603:      */
604:     private function applyFilters($query, ?array $filters, array $filterMap): void
605:     {
606:         if (empty($filters)) {
607:             return;
608:         }
609: 
610:         foreach ($filters as $filter) {
611:             $field = $filter['field'] ?? null;
612:             $operator = $filter['operator'] ?? null;
613:             $value = $filter['value'] ?? null;
614: 
615:             if (! $field || ! $operator || ! isset($filterMap[$field])) {
616:                 continue;
617:             }
618: 
619:             if (! in_array($operator, self::VALID_OPERATORS, true)) {
620:                 continue;
621:             }
622: 
623:             $dbColumn = $filterMap[$field];
624: 
625:             // Skip DB::raw expressions (aggregate columns) — handled by applyHavingFilters
626:             if ($dbColumn instanceof Expression) {
627:                 continue;
628:             }
629: 
630:             $this->applyFilterCondition($query, $dbColumn, $operator, $value, 'where');
631:         }
632:     }
633: 
634:     /**
635:      * Apply HAVING filters for aggregate columns.
636:      *
637:      * @param  Builder  $query
638:      */
639:     private function applyHavingFilters($query, array $filters, array $filterMap): void
640:     {
641:         foreach ($filters as $filter) {
642:             $field = $filter['field'] ?? null;
643:             $operator = $filter['operator'] ?? null;
644:             $value = $filter['value'] ?? null;
645: 
646:             if (! $field || ! $operator || ! isset($filterMap[$field])) {
647:                 continue;
648:             }
649: 
650:             if (! in_array($operator, self::VALID_OPERATORS, true)) {
651:                 continue;
652:             }
653: 
654:             $dbColumn = $filterMap[$field];
655: 
656:             $this->applyFilterCondition($query, $dbColumn, $operator, $value, 'having');
657:         }
658:     }
659: 
660:     /**
661:      * Apply a single filter condition to a query.
662:      *
663:      * @param  Builder  $query
664:      * @param  mixed  $dbColumn
665:      * @param  mixed  $value
666:      * @param  string  $method  'where' or 'having'
667:      */
668:     private function applyFilterCondition($query, $dbColumn, string $operator, $value, string $method): void
669:     {
670:         match ($operator) {
671:             'eq' => $query->$method($dbColumn, '=', $value),
672:             'neq' => $query->$method($dbColumn, '!=', $value),
673:             'gt' => $query->$method($dbColumn, '>', $value),
674:             'lt' => $query->$method($dbColumn, '<', $value),
675:             'gte' => $query->$method($dbColumn, '>=', $value),
676:             'lte' => $query->$method($dbColumn, '<=', $value),
677:             'contains' => $query->$method($dbColumn, 'like', '%'.$value.'%'),
678:             'starts_with' => $query->$method($dbColumn, 'like', $value.'%'),
679:             'ends_with' => $query->$method($dbColumn, 'like', '%'.$value),
680:             'is_null' => $query->{$method.'Null'}($dbColumn),
681:             'is_not_null' => $query->{$method.'NotNull'}($dbColumn),
682:             default => null,
683:         };
684:     }
685: 
686:     /**
687:      * Apply sorting to a query.
688:      *
689:      * @param  Builder  $query
690:      */
691:     private function applySorting($query, ?array $sort, array $filterMap): void
692:     {
693:         if (empty($sort) || ! isset($sort['field']) || ! isset($filterMap[$sort['field']])) {
694:             return;
695:         }
696: 
697:         $direction = in_array($sort['direction'] ?? 'asc', ['asc', 'desc'], true)
698:             ? $sort['direction']
699:             : 'asc';
700: 
701:         $dbColumn = $filterMap[$sort['field']];
702:         $query->orderBy($dbColumn, $direction);
703:     }
704: }
```



<a id="e0460"></a>

> Audit provenance: `platform-source-catalog.md` lines 10325–10478. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Supplemental complete source `app/Http/Controllers/Reports/ReportScheduleController.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Controllers\Reports;
6: 
7: use App\Http\Controllers\Controller;
8: use App\Models\ReportSchedule;
9: use App\Models\SavedReport;
10: use App\Models\User;
11: use App\Services\Organizations\ActiveOrganization;
12: use App\Services\ReportDataService;
13: use App\Services\Reports\ReportExporter;
14: use Illuminate\Http\RedirectResponse;
15: use Illuminate\Http\Request;
16: use Illuminate\Support\Facades\DB;
17: use Illuminate\Validation\Rule;
18: use Illuminate\Validation\ValidationException;
19: 
20: /**
21:  * Manage the email delivery schedules of a saved report.
22:  *
23:  * Only the report's owner may manage its schedules: the report is sent with
24:  * the owner's permissions, so nobody else may point it at recipients.
25:  * Recipients must be users of the same organization who may view the report
26:  * themselves (view_reports plus the data source's view permission).
27:  */
28: class ReportScheduleController extends Controller
29: {
30:     public function store(Request $request, SavedReport $savedReport): RedirectResponse
31:     {
32:         $this->authorizeOwner($request, $savedReport);
33: 
34:         $validated = $this->validated($request, $savedReport);
35: 
36:         $schedule = new ReportSchedule($validated + [
37:             'organization_id' => $savedReport->organization_id,
38:             'saved_report_id' => $savedReport->id,
39:             'created_by' => $request->user()->id,
40:             'is_active' => true,
41:         ]);
42:         $schedule->next_run_at = $schedule->computeNextRunAt(now());
43:         $schedule->save();
44: 
45:         return back()->with('success', __('Report schedule created.'));
46:     }
47: 
48:     public function update(Request $request, SavedReport $savedReport, ReportSchedule $schedule): RedirectResponse
49:     {
50:         $this->authorizeOwner($request, $savedReport);
51:         $this->ensureBelongs($savedReport, $schedule);
52: 
53:         $validated = $this->validated($request, $savedReport) + [
54:             'is_active' => $request->boolean('is_active', $schedule->is_active),
55:         ];
56: 
57:         $schedule->fill($validated);
58:         // Re-anchor from now whenever the timing changes or it is resumed, so
59:         // a paused schedule does not fire immediately for a missed slot.
60:         $schedule->next_run_at = $schedule->computeNextRunAt(now());
61:         $schedule->save();
62: 
63:         return back()->with('success', __('Report schedule updated.'));
64:     }
65: 
66:     public function destroy(Request $request, SavedReport $savedReport, ReportSchedule $schedule): RedirectResponse
67:     {
68:         $this->authorizeOwner($request, $savedReport);
69:         $this->ensureBelongs($savedReport, $schedule);
70: 
71:         $schedule->delete();
72: 
73:         return back()->with('success', __('Report schedule deleted.'));
74:     }
75: 
76:     private function authorizeOwner(Request $request, SavedReport $savedReport): void
77:     {
78:         $user = $request->user();
79: 
80:         if ($savedReport->organization_id !== $user->organization_id || $savedReport->created_by !== $user->id) {
81:             abort(403);
82:         }
83:     }
84: 
85:     private function ensureBelongs(SavedReport $savedReport, ReportSchedule $schedule): void
86:     {
87:         // Route binding already applies OrganizationScope; this pins the
88:         // schedule to the report named in the URL as well.
89:         if ($schedule->saved_report_id !== $savedReport->id) {
90:             abort(404);
91:         }
92:     }
93: 
94:     /**
95:      * @return array<string, mixed>
96:      *
97:      * @throws ValidationException
98:      */
99:     private function validated(Request $request, SavedReport $savedReport): array
100:     {
101:         $validated = $request->validate([
102:             'frequency' => ['required', 'string', Rule::in(ReportSchedule::FREQUENCIES)],
103:             'day_of_week' => ['nullable', 'required_if:frequency,weekly', 'integer', 'between:0,6'],
104:             'day_of_month' => ['nullable', 'required_if:frequency,monthly', 'integer', 'between:1,31'],
105:             'time_of_day' => ['required', 'date_format:H:i'],
106:             'format' => ['required', 'string', Rule::in(ReportExporter::FORMATS)],
107:             'recipients' => ['required', 'array', 'min:1', 'max:'.ReportSchedule::MAX_RECIPIENTS],
108:             'recipients.*' => ['required', 'email', 'max:255'],
109:         ]);
110: 
111:         $recipients = array_values(array_unique(array_map(
112:             fn ($email) => mb_strtolower(trim((string) $email)),
113:             $validated['recipients']
114:         )));
115: 
116:         // Members of the report's organization (added ones included), each
117:         // loaded into it so their permissions there are checked below.
118:         $members = app(ActiveOrganization::class)
119:             ->membersIn((int) $savedReport->organization_id, [], fn ($query) => $query->whereIn(DB::raw('LOWER(email)'), $recipients));
120: 
121:         $outsiders = array_diff($recipients, $members->map(fn (User $u) => mb_strtolower((string) $u->email))->all());
122:         if ($outsiders !== []) {
123:             throw ValidationException::withMessages([
124:                 'recipients' => __('Recipients must be members of your organization: :recipients', ['recipients' => implode(', ', $outsiders)]),
125:             ]);
126:         }
127: 
128:         // The report is sent with the owner's access, so each recipient must
129:         // be allowed to see it themselves (re-checked at send time too).
130:         $required = ReportDataService::viewPermissionsFor((string) $savedReport->data_source);
131:         $withoutAccess = $members
132:             ->reject(fn (User $u): bool => $u->hasAllPermissions($required))
133:             ->map(fn (User $u) => mb_strtolower((string) $u->email))
134:             ->values()
135:             ->all();
136:         if ($withoutAccess !== []) {
137:             throw ValidationException::withMessages([
138:                 'recipients' => __('Recipients must be able to view this report (:permissions): :recipients', ['permissions' => implode(', ', $required), 'recipients' => implode(', ', $withoutAccess)]),
139:             ]);
140:         }
141: 
142:         return [
143:             'frequency' => $validated['frequency'],
144:             'day_of_week' => $validated['frequency'] === 'weekly' ? (int) $validated['day_of_week'] : null,
145:             'day_of_month' => $validated['frequency'] === 'monthly' ? (int) $validated['day_of_month'] : null,
146:             'time_of_day' => $validated['time_of_day'],
147:             'format' => $validated['format'],
148:             'recipients' => $recipients,
149:         ];
150:     }
151: }
```


<a id="e0465"></a>

> Audit provenance: `shared-gaps.md` lines 31–40. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## G03 Report export links — omitted functional navigation

Source `resources/js/Components/Reports/ExportMenu.vue:9-34,43-50`.

- Props routeName:String required; params:Object default{}; group:String defaultnull; size:String defaultsm; formatParam:String defaultexport.
- Fixed formats csv/xlsx/pdf. Href query copies params, assigns `[formatParam]`, adds group only when supplied. Named route generator creates ordinary download anchors, NOT Inertia mutation.
- Standard report uses `?export=`, saved report download can supply `formatParam='format'`. Alternate breakdown e.g.category is `?group=`.
- No new business form field/server validator here. Parent decides permission and valid params; endpoint validates export.
- Acceptance: current filters preserved, format query key correct, alternate grouping retained, forbidden source denied on direct download.

