# 27. Import / Export — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Import / Export as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Product/order/user templates; file validation; row-level results; partial failures; historical order mode; invitation/integration flags; scoped downloads.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Inventory / Products](../modules/11_inventory.md), [Orders, Payments and Documents](../modules/12_orders.md), [Admin Users](../modules/30_users.md), [Storage, Uploads and Downloads](../modules/36_storage.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/ImportExport/Index.vue` | Pending | Pending |

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

- [ ] Reject invalid file/headers/foreign identities.
- [ ] preserve exact accepted/rejected/skipped counts.
- [ ] historical order import changes no stock and emits no order-created hook.
- [ ] exports and downloads enforce current owner/permission scope.

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

- [P09 Import/export](#e0265)
- [`resources/js/Pages/ImportExport/Index.vue`](#e0317)
- [`app/Http/Controllers/Import/ImportExportController.php`](#e0405)
- [Contract appendix `app/Http/Controllers/Import/ImportExportController.php:109-135`](#e0440)
- [Contract appendix `app/Http/Controllers/Import/ImportExportController.php:235-247`](#e0441)
- [Contract appendix `app/Http/Controllers/Import/ImportExportController.php:298-308`](#e0442)
- [`app/Imports/ProductsImport.php`](#e0444)
- [`app/Imports/OrdersImport.php`](#e0445)
- [`app/Imports/UsersImport.php`](#e0446)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0265"></a>

> Audit provenance: `platform.md` lines 114–125. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P09 Import/export

Products import file; users file+send_invites true; orders file+historical false+notify_integrations true. Required file extensions/MIME csv/txt/xlsx/xls,max10240KB (`ImportExportController.php:46`). Templates CSV. Preserve row accepted/rejected/skipped stats, server row rules, queue errors; don't claim all-or-nothing import without actual importer behavior.

Product columns name,sku,barcode,description,category,location,price,currency,purchase_price,stock,min_stock,status,notes,supplier_code,supplier_name,supplier_sku,supplier_cost plus price_{currency-code} per extra org currency (`111-135`). Product export filters category_id/location_id/status/low_stock.

User columns name,email,role,roles; provided example semicolon-separated custom role names. send_invites true sends set-password link; false leaves pending invitation and password-reset recovery. Same escalation guard as interactive user assignment (`235-269`).

Order columns external_reference,order_date,status,customer_name,customer_email,product_sku,variant_sku,quantity,unit_price,line_tax,unit_cost,order_tax,order_shipping,currency,shipped_at,delivered_at,notes. One row per line/grouped order identity. **Historical mode does not adjust stock and never fires order.created webhooks.** notify_integrations controls normal import hooks/webhooks; UI and backend enforce historical suppression (`298-344`).

Exports products/orders/users with filters/formats; queued download record when needed, owner-scoped download. User export additionally view_users; order/user import additionally create_orders/create_users beyond import_data (`routes/web/account.php:51-66`). Exact importer rules and owner methods in catalog appendix: `app/Imports/ProductsImport.php`,`OrdersImport.php`,`UsersImport.php`. Template columns alone do not prove every legacy/header behavior.



<a id="e0317"></a>

> Audit provenance: `platform-source-catalog.md` lines 1052–1148. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/ImportExport/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/ImportExport/Index.vue:266`: `<select id="export_category" v-model="exportFilters.category_id">`
- `resources/js/Pages/ImportExport/Index.vue:274`: `<select id="export_location" v-model="exportFilters.location_id">`
- `resources/js/Pages/ImportExport/Index.vue:282`: `<select id="export_status" v-model="exportFilters.status">`
- `resources/js/Pages/ImportExport/Index.vue:291`: `<input id="low_stock" v-model="exportFilters.low_stock" type="checkbox" />`
- `resources/js/Pages/ImportExport/Index.vue:353`: `<FileDrop v-model="productImport.file" input-id="product_import_file" />`
- `resources/js/Pages/ImportExport/Index.vue:464`: `<input v-model="orderExport.mode" type="radio" value="orders" />`
- `resources/js/Pages/ImportExport/Index.vue:471`: `<input v-model="orderExport.mode" type="radio" value="lines" />`
- `resources/js/Pages/ImportExport/Index.vue:483`: `<select id="order_export_status" v-model="orderExport.status">`
- `resources/js/Pages/ImportExport/Index.vue:490`: `<input id="order_export_from" v-model="orderExport.date_from" type="date" />`
- `resources/js/Pages/ImportExport/Index.vue:494`: `<input id="order_export_to" v-model="orderExport.date_to" type="date" />`
- `resources/js/Pages/ImportExport/Index.vue:517`: `<FileDrop v-model="orderImport.file" input-id="order_import_file" />`
- `resources/js/Pages/ImportExport/Index.vue:524`: `<input v-model="orderImport.historical" type="checkbox" />`
- `resources/js/Pages/ImportExport/Index.vue:535`: `<input v-model="orderImport.notify_integrations" type="checkbox" />`
- `resources/js/Pages/ImportExport/Index.vue:628`: `<FileDrop v-model="userImport.file" input-id="user_import_file" />`
- `resources/js/Pages/ImportExport/Index.vue:635`: `<input v-model="userImport.send_invites" type="checkbox" />`

**Form initial state/defaults:**
```js
96: const productImport = useForm({ file: null });
153: const orderImport = useForm({ file: null, historical: false, notify_integrations: true });
175: const userImport = useForm({ file: null, send_invites: true });
```

**Select option values/labels (dynamic options retain their source):**
```html
267: <option value="">{{ t('products.allCategories') }}</option>
268: <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
275: <option value="">{{ t('products.allLocations') }}</option>
276: <option v-for="location in locations" :key="location.id" :value="location.id">{{ location.name }}</option>
283: <option value="">{{ t('common.allStatuses') }}</option>
284: <option value="active">{{ t('common.active') }}</option>
285: <option value="inactive">{{ t('common.inactive') }}</option>
286: <option value="discontinued">{{ t('importExport.export.discontinued') }}</option>
484: <option value="">{{ t('common.allStatuses') }}</option>
485: <option v-for="status in orderStatuses" :key="status" :value="status">{{ t(`orders.status.${status}`) }}</option>
```

**Visible table headers:**
```text
691: {{ t('importExport.exports.file') }}
692: {{ t('common.type') }}
693: {{ t('importExport.exports.rows') }}
694: {{ t('common.status') }}
695: {{ t('importExport.exports.action') }}
```

**View filters, permission/action and navigation anchors:**
```js
44: const { hasPermission, canVisit } = usePermissions();
46: const canExport = computed(() => hasPermission('export_data'));
47: const canExportUsers = computed(() => canExport.value && hasPermission('view_users'));
48: const canImport = computed(() => hasPermission('import_data'));
49: const canImportOrders = computed(() => canImport.value && hasPermission('create_orders'));
50: const canImportUsers = computed(() => canImport.value && hasPermission('create_users'));
54: const tabs = computed(() => [
58: ].filter((tab) => tab.visible));
60: const tabKeys = computed(() => tabs.value.map((tab) => tab.key));
65: const importResult = ref(page.props.flash?.warning && typeof page.props.flash.warning === 'object'
76: const requestedTab = new URLSearchParams(window.location.search).get('tab') || importResult.value?.type;
77: const activeTab = ref(tabKeys.value.includes(requestedTab) ? requestedTab : 'products');
79: const exportTypeLabels = computed(() => ({
88: Object.entries(params).filter(([, value]) => value !== '' && value !== false && value != null),
91: window.location.href = route(routeName) + (query ? `?${query}` : '');
98: const exportFilters = ref({
105: const showExportFilters = ref(false);
108: productImport.post(route('import-export.import-products'), {
130: const hasActiveFilters = computed(() => {
139: const orderExport = ref({
163: .post(route('import-export.import-orders'), {
180: .post(route('import-export.import-users'), {
```

**Displayed data/value expressions:**
```text
227: tab.label
259: showExportFilters ? t('importExport.export.hideFilters') : t('importExport.export.showFilters')
260: Object.values(exportFilters).filter(v => v).length
268: category.name
276: location.name
356: productImport.errors.file
393: 'name'
397: 'sku'
401: 'price'
405: 'stock'
431: column
520: orderImport.errors.file
550: orderImport.processing ? t('importExport.import.importing') : t('importExport.orders.importButton')
631: userImport.errors.file
650: userImport.processing ? t('importExport.import.importing') : t('importExport.users.importButton')
703: e.filename
706: exportTypeLabels[e.type] || e.type
707: e.row_count != null ? formatNumber(e.row_count) : '-'
```



<a id="e0405"></a>

> Audit provenance: `platform-source-catalog.md` lines 4073–4135. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Import/ImportExportController.php`
```php
46:     private const IMPORT_FILE_RULE = 'required|file|extensions:csv,txt,xlsx,xls|mimes:csv,txt,xlsx,xls|mimetypes:text/csv,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel|max:10240'; // 10MB max
47: 
48:     /**
49:      * Display the import/export page.
50:      *
51:      * @param  Request  $request  The incoming HTTP request
52:      */
53:     public function index(Request $request): Response
54:     {
55:         $organizationId = $request->user()->organization_id;
56: 
57:         $categories = ProductCategory::forOrganization($organizationId)
58:             ->select('id', 'name')
59:             ->orderBy('name')
60:             ->get();
61: 
62:         $locations = ProductLocation::forOrganization($organizationId)
63:             ->select('id', 'name')
64:             ->orderBy('name')
65:             ->get();
66: 
67:         $exports = DataExport::where('user_id', $request->user()->id)
68:             ->latest()
69:             ->limit(15)
70:             ->get(['id', 'type', 'filename', 'status', 'row_count', 'completed_at', 'created_at'])
77:         return Inertia::render('ImportExport/Index', [
96:     public function exportProducts(Request $request)
109:     public function downloadTemplate(Request $request)
139:         $callback = function () use ($headers, $currencies) {
180:     public function importProducts(Request $request)
182:         $request->validate([
183:             'file' => self::IMPORT_FILE_RULE,
184:         ]);
195:                 $path = $file->store('imports/'.$organizationId, $disk);
235:     public function downloadUserTemplate(): StreamedResponse
237:         return response()->stream(function () {
256:     public function importUsers(Request $request): RedirectResponse
258:         $request->validate([
259:             'file' => self::IMPORT_FILE_RULE,
260:             'send_invites' => 'nullable|boolean',
261:         ]);
298:     public function downloadOrderTemplate(): StreamedResponse
312:         return response()->stream(function () use ($headers, $examples) {
333:     public function importOrders(Request $request): RedirectResponse
335:         $request->validate([
336:             'file' => self::IMPORT_FILE_RULE,
337:             'historical' => 'nullable|boolean',
338:             'notify_integrations' => 'nullable|boolean',
339:         ]);
351:                 $path = $file->store('imports/'.$user->organization_id, $disk);
391:     private function announceImport(string $type, ?User $user, string $status, array $stats = []): void
413:     private function redirectWithImportResult(string $type, array $stats, string $successMessage): RedirectResponse
437:     public function exportOrders(Request $request)
454:     public function exportUsers(Request $request)
472:     private function streamOrQueueExport(Request $request, string $type, array $filters)
509:     public function download(Request $request, DataExport $dataExport)
517:         abort_if(
525:         abort_unless((int) $dataExport->user_id === (int) $user->id || $user->isAdmin(), 404);
539:         abort_unless($dataExport->isDownloadable(), 404);
```



<a id="e0440"></a>

> Audit provenance: `platform-source-catalog.md` lines 5554–5584. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `app/Http/Controllers/Import/ImportExportController.php:109-135`
```php
109:     public function downloadTemplate(Request $request)
110:     {
111:         $headers = [
112:             'name',
113:             'sku',
114:             'barcode',
115:             'description',
116:             'category',
117:             'location',
118:             'price',
119:             'currency',
120:             'purchase_price',
121:             'stock',
122:             'min_stock',
123:             'status',
124:             'notes',
125:             'supplier_code',
126:             'supplier_name',
127:             'supplier_sku',
128:             'supplier_cost',
129:         ];
130: 
131:         // One price column per additional currency the organization uses.
132:         $currencies = ProductCurrencyColumns::currenciesFor($request->user()->organization_id);
133:         foreach ($currencies as $code) {
134:             $headers[] = 'price_'.$code;
135:         }
```



<a id="e0441"></a>

> Audit provenance: `platform-source-catalog.md` lines 5585–5601. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `app/Http/Controllers/Import/ImportExportController.php:235-247`
```php
235:     public function downloadUserTemplate(): StreamedResponse
236:     {
237:         return response()->stream(function () {
238:             $file = fopen('php://output', 'w');
239:             fputcsv($file, ['name', 'email', 'role', 'roles'], escape: '');
240:             fputcsv($file, ['Example Member', 'member@example.com', 'member', 'Picker; Packer'], escape: '');
241:             fputcsv($file, ['Example Manager', 'manager@example.com', 'manager', ''], escape: '');
242:             fclose($file);
243:         }, 200, [
244:             'Content-Type' => 'text/csv',
245:             'Content-Disposition' => 'attachment; filename="user_import_template.csv"',
246:         ]);
247:     }
```



<a id="e0442"></a>

> Audit provenance: `platform-source-catalog.md` lines 5602–5616. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `app/Http/Controllers/Import/ImportExportController.php:298-308`
```php
298:     public function downloadOrderTemplate(): StreamedResponse
299:     {
300:         $headers = [
301:             'external_reference', 'order_date', 'status', 'customer_name', 'customer_email',
302:             'product_sku', 'variant_sku', 'quantity', 'unit_price', 'line_tax', 'unit_cost',
303:             'order_tax', 'order_shipping', 'currency', 'shipped_at', 'delivered_at', 'notes',
304:         ];
305: 
306:         $examples = [
307:             ['SHOP-1001', '2026-01-15', 'delivered', 'Example Customer', 'customer@example.com', 'SKU-001', '', '2', '19.99', '', '8.50', '4.00', '5.00', 'USD', '2026-01-16', '2026-01-18', 'Imported from old shop'],
308:             ['SHOP-1001', '', '', '', '', '', 'SKU-002-L', '1', '29.99', '', '', '', '', '', '', '', ''],
```



<a id="e0444"></a>

> Audit provenance: `platform-source-catalog.md` lines 5619–6175. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Imports/ProductsImport.php`

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Imports;
6: 
7: use App\Models\Inventory\Product;
8: use App\Models\Inventory\ProductCategory;
9: use App\Models\Inventory\ProductLocation;
10: use App\Models\Inventory\StockAdjustment;
11: use App\Models\Inventory\Supplier;
12: use App\Models\User;
13: use App\Services\ProductLocationStockService;
14: use App\Services\ProductService;
15: use App\Support\ProductCurrencyColumns;
16: use App\Support\ProductSpreadsheetText;
17: use App\Support\ProductSpreadsheetValueBinder;
18: use App\Support\SpreadsheetSafety;
19: use Illuminate\Database\QueryException;
20: use Illuminate\Support\Arr;
21: use Illuminate\Support\Collection;
22: use Illuminate\Support\Facades\DB;
23: use Illuminate\Support\Facades\Log;
24: use Illuminate\Support\Facades\Validator;
25: use InvalidArgumentException;
26: use Maatwebsite\Excel\Concerns\SkipsFailures;
27: use Maatwebsite\Excel\Concerns\SkipsOnFailure;
28: use Maatwebsite\Excel\Concerns\ToCollection;
29: use Maatwebsite\Excel\Concerns\WithChunkReading;
30: use Maatwebsite\Excel\Concerns\WithCustomValueBinder;
31: use Maatwebsite\Excel\Concerns\WithEvents;
32: use Maatwebsite\Excel\Concerns\WithHeadingRow;
33: use Maatwebsite\Excel\Events\BeforeImport;
34: 
35: /**
36:  * Import class for processing product data from Excel files.
37:  *
38:  * Handles importing and updating products from spreadsheet data,
39:  * including automatic creation of categories and locations.
40:  */
41: final class ProductsImport extends ProductSpreadsheetValueBinder implements SkipsOnFailure, ToCollection, WithChunkReading, WithCustomValueBinder, WithEvents, WithHeadingRow
42: {
43:     use SkipsFailures;
44: 
45:     /**
46:      * The organization ID to import products into.
47:      *
48:      * @var int
49:      */
50:     protected $organizationId;
51: 
52:     /**
53:      * Count of newly imported products.
54:      *
55:      * @var int
56:      */
57:     protected $imported = 0;
58: 
59:     /**
60:      * Count of updated existing products.
61:      *
62:      * @var int
63:      */
64:     protected $updated = 0;
65: 
66:     /**
67:      * Array of errors encountered during import.
68:      *
69:      * @var array
70:      */
71:     protected $errors = [];
72: 
73:     /**
74:      * Non-fatal warnings (e.g. duplicate SKUs collapsed within one file).
75:      *
76:      * @var array
77:      */
78:     protected $warnings = [];
79: 
80:     /**
81:      * SKUs already processed in this import, to detect intra-file duplicates.
82:      *
83:      * @var array<string, true>
84:      */
85:     protected $seenSkus = [];
86: 
87:     /**
88:      * Rows processed so far, so error/warning row numbers stay absolute across
89:      * chunks (WithChunkReading re-indexes each chunk from 0).
90:      */
91:     protected int $rowOffset = 0;
92: 
93:     /**
94:      * Whether unknown price_xxx columns have already been reported, so the
95:      * warning is raised once per file rather than once per row.
96:      */
97:     protected bool $unknownCurrenciesReported = false;
98: 
99:     /**
100:      * Create a new import instance.
101:      *
102:      * @param  int  $organizationId  The organization to import products into
103:      */
104:     /**
105:      * @param  User|null  $actor  who the stock ledger rows are attributed to
106:      *                            (the importing user; falls back to the signed-in user)
107:      */
108:     public function __construct($organizationId, private readonly ?User $actor = null)
109:     {
110:         $this->organizationId = $organizationId;
111:     }
112: 
113:     /**
114:      * Process each row in the collection
115:      */
116:     /**
117:      * Set an existing product's on-hand to the imported figure through the
118:      * stock ledger: a `recount` adjustment for the difference, under the
119:      * product row lock, with the location bins moved in step. A sheet
120:      * exported before a sale and re-imported after it therefore shows up as
121:      * an audited recount rather than silently overwriting the count.
122:      */
123:     private function bookImportedStock(Product $product, int $target): void
124:     {
125:         DB::transaction(function () use ($product, $target) {
126:             $locked = Product::withoutGlobalScopes()->whereKey($product->id)->lockForUpdate()->firstOrFail();
127:             $delta = $target - (int) $locked->stock;
128: 
129:             if ($delta === 0) {
130:                 return;
131:             }
132: 
133:             $bins = app(ProductLocationStockService::class);
134: 
135:             // Draw bins down before the total falls (the lazy seed reads the
136:             // pre-change stock); book them up after it rises.
137:             if ($delta < 0) {
138:                 $bins->consume($locked, -$delta);
139:             }
140: 
141:             StockAdjustment::adjust(
142:                 $locked,
143:                 $delta,
144:                 'recount',
145:                 'Product import',
146:                 "Stock set to {$target} by import",
147:                 actor: $this->actor,
148:                 // The bins move just above and below.
149:                 syncBins: false,
150:             );
151: 
152:             if ($delta > 0) {
153:                 $bins->receive($locked, $delta);
154:             }
155: 
156:             $product->setRawAttributes(array_merge($product->getAttributes(), ['stock' => $target]));
157:             $product->syncOriginal();
158:         });
159:     }
160: 
161:     public function registerEvents(): array
162:     {
163:         return [BeforeImport::class => [$this, 'configureTextReader']];
164:     }
165: 
166:     public function configureTextReader(BeforeImport $event): void
167:     {
168:         // XLSX readers set values explicitly; their workbook binder must be
169:         // configured before loading, including when the file is chunked.
170:         $event->reader->getPhpSpreadsheetReader()->setValueBinder($this);
171:     }
172: 
173:     public function collection(Collection $rows): void
174:     {
175:         foreach ($rows as $index => $row) {
176:             // Absolute row number across chunks (+2 for the header row and the
177:             // 0-based index).
178:             $rowNumber = $this->rowOffset + $index + 2;
179: 
180:             try {
181:                 $row = clone $row;
182:                 ProductSpreadsheetText::decodeRow($row);
183: 
184:                 // Validate the row
185:                 $currencyColumns = $this->currencyColumns($row->keys()->all(), $rowNumber);
186: 
187:                 // Spreadsheet rows do not pass through HTTP's empty-string
188:                 // normalization. Blank optional costs are null, not SQL strings.
189:                 if (is_string($row->get('purchase_price')) && trim($row->get('purchase_price')) === '') {
190:                     $row->put('purchase_price', null);
191:                 }
192: 
193:                 $rules = [
194:                     'name' => 'required|string|max:255',
195:                     'sku' => 'required|string|max:255',
196:                     'price' => 'required|numeric|min:0',
197:                     'purchase_price' => 'nullable|numeric|min:0',
198:                     'stock' => 'required|integer|min:0',
199:                     'min_stock' => 'nullable|integer|min:0',
200:                 ];
201:                 foreach (array_keys($currencyColumns) as $key) {
202:                     $rules[$key] = 'nullable|numeric|min:0';
203:                 }
204: 
205:                 $validator = Validator::make($row->toArray(), $rules);
206: 
207:                 if ($validator->fails()) {
208:                     $this->errors[] = [
209:                         'row' => $rowNumber,
210:                         'errors' => $validator->errors()->all(),
211:                     ];
212: 
213:                     continue;
214:                 }
215: 
216:                 // Collapse intra-file duplicate SKUs: keep the first occurrence
217:                 // and warn, rather than silently letting a later row overwrite
218:                 // the product created earlier in the same file.
219:                 $sku = (string) $row['sku'];
220:                 if (! ProductSpreadsheetText::isEncoded($row) && str_starts_with($sku, "'")
221:                     && SpreadsheetSafety::neutralise(substr($sku, 1)) === $sku
222:                     && ! Product::withTrashed()->where('organization_id', $this->organizationId)->where('sku', $sku)->exists()
223:                     && Product::withTrashed()->where('organization_id', $this->organizationId)->where('sku', substr($sku, 1))->exists()) {
224:                     throw new InvalidArgumentException('This SKU is ambiguous with an escaped value from an older export. Export the products again and retain the Inventoros Text Encoding column.');
225:                 }
226: 
227:                 if (isset($this->seenSkus[$sku])) {
228:                     $this->warnings[] = [
229:                         'row' => $rowNumber,
230:                         'warnings' => ["Duplicate SKU '{$sku}' in this file; row skipped (first occurrence kept)."],
231:                     ];
232: 
233:                     continue;
234:                 }
235:                 $this->seenSkus[$sku] = true;
236: 
237:                 // Everything this row writes runs in its own (nested)
238:                 // transaction. Laravel Excel wraps each chunk in a
239:                 // transaction; on PostgreSQL one failed statement would abort
240:                 // it, failing every later row and rolling back the earlier
241:                 // ones at commit. Rolling back just this row's savepoint keeps
242:                 // the rest of the file importing.
243:                 $created = DB::transaction(fn () => $this->saveRow($row, $rowNumber, $currencyColumns));
244:                 $created ? $this->imported++ : $this->updated++;
245:             } catch (\Exception $e) {
246:                 $this->errors[] = [
247:                     'row' => $rowNumber,
248:                     'errors' => [$e instanceof QueryException ? 'The row could not be saved due to a database error.' : $e->getMessage()],
249:                 ];
250: 
251:                 if ($e instanceof QueryException) {
252:                     Log::error('Product import row failed with database error', [
253:                         'organization_id' => $this->organizationId,
254:                         'row' => $rowNumber,
255:                         'error' => $e->getMessage(),
256:                     ]);
257:                 }
258:             }
259:         }
260: 
261:         // Advance the absolute-row offset for the next chunk.
262:         $this->rowOffset += $rows->count();
263:     }
264: 
265:     /**
266:      * Create or update one validated row's product (with its category,
267:      * location and supplier link).
268:      *
269:      * @param  Collection<string, mixed>  $row
270:      * @param  array<string, string>  $currencyColumns
271:      * @return bool true when a product was created, false when one was updated
272:      */
273:     private function saveRow(Collection $row, int $rowNumber, array $currencyColumns): bool
274:     {
275:         // Find or create category
276:         $categoryId = null;
277:         if (! empty($row['category'])) {
278:             $category = ProductCategory::firstOrCreate(
279:                 [
280:                     'name' => $row['category'],
281:                     'organization_id' => $this->organizationId,
282:                 ]
283:             );
284:             $categoryId = $category->id;
285:         }
286: 
287:         // Find or create location. Generate a unique 3-char-derived
288:         // code so importing "Toronto Main" and later "Toronto Backup"
289:         // doesn't produce two locations sharing code='TOR'.
290:         $locationId = null;
291:         if (! empty($row['location'])) {
292:             $location = ProductLocation::firstOrCreate(
293:                 [
294:                     'name' => $row['location'],
295:                     'organization_id' => $this->organizationId,
296:                 ],
297:                 [
298:                     'code' => $this->uniqueLocationCode($row['location']),
299:                 ]
300:             );
301:             $locationId = $location->id;
302:         }
303: 
304:         // Check if product exists (by SKU) — include soft-deleted rows:
305:         // the SKU unique index counts them, so a plain lookup would miss
306:         // a trashed product and then collide on create. Restore + update
307:         // instead.
308:         $product = Product::withTrashed()
309:             ->where('sku', $row['sku'])
310:             ->where('organization_id', $this->organizationId)
311:             ->first();
312: 
313:         // Convert status string to is_active boolean
314:         $status = $row['status'] ?? 'active';
315:         $isActive = strtolower($status) === 'active';
316: 
317:         // Marked exports have already been decoded without losing literal
318:         // identifiers. Every subsequent export still escapes formula cells.
319:         // Unmarked third-party files retain their existing input sanitization.
320:         $sanitise = fn ($value) => ProductSpreadsheetText::isEncoded($row) ? $value : SpreadsheetSafety::sanitiseImport($value);
321: 
322:         $productData = [
323:             'name' => $sanitise($row['name']),
324:             'sku' => $sanitise($row['sku']),
325:             'barcode' => $sanitise($row['barcode'] ?? null),
326:             'description' => $sanitise($row['description'] ?? null),
327:             'category_id' => $categoryId,
328:             'location_id' => $locationId,
329:             'price' => $row['price'],
330:             // Blank keeps an existing product's currency; a new product gets
331:             // the organization's (Product::booted).
332:             'currency' => $row['currency'] ?? $product?->currency,
333:             'purchase_price' => $row['purchase_price'] ?? null,
334:             'stock' => $row['stock'],
335:             'min_stock' => $row['min_stock'] ?? 0,
336:             'is_active' => $isActive,
337:             'notes' => $sanitise($row['notes'] ?? null),
338:             'organization_id' => $this->organizationId,
339:         ];
340: 
341:         if ($currencyColumns !== []) {
342:             $productData['price_in_currencies'] = $this->mergeCurrencyPrices(
343:                 $product?->price_in_currencies,
344:                 $row,
345:                 $currencyColumns,
346:             );
347:         }
348: 
349:         if ($product) {
350:             // Update existing product, restoring it first if it was
351:             // soft-deleted so re-importing a deleted SKU brings it back.
352:             if ($product->trashed()) {
353:                 $product->restore();
354:             }
355:             // The sheet's stock is booked as a ledgered recount
356:             // (locked, audited, binned), never written to the row.
357:             $product->update(Arr::except($productData, ['stock']));
358:             $this->bookImportedStock($product, (int) $row['stock']);
359:             $created = false;
360:         } else {
361:             // Create new product; its stock is an opening ledger row.
362:             $product = Product::create($productData);
363:             app(ProductService::class)->recordOpeningStock($product, $this->actor);
364:             $created = true;
365:         }
366: 
367:         $this->applyPrimarySupplier($product, $row, $rowNumber);
368: 
369:         return $created;
370:     }
371: 
372:     /**
373:      * Link the row's primary supplier (supplier_code, else supplier_name) with
374:      * its supplier_sku and supplier_cost. An unknown supplier or a bad cost is
375:      * a row warning, never a failed row: the product itself is already saved.
376:      *
377:      * @param  Collection<string, mixed>|array<string, mixed>  $row
378:      */
379:     protected function applyPrimarySupplier(Product $product, $row, int $rowNumber): void
380:     {
381:         $text = fn ($value) => ProductSpreadsheetText::isEncoded($row) ? (string) $value : trim((string) $value);
382:         $code = $text($row['supplier_code'] ?? '');
383:         $name = $text($row['supplier_name'] ?? '');
384:         $sku = $text($row['supplier_sku'] ?? '');
385:         $cost = trim((string) ($row['supplier_cost'] ?? ''));
386: 
387:         if ($code === '' && $name === '') {
388:             if ($sku !== '' || $cost !== '') {
389:                 $this->warn($rowNumber, 'supplier_sku/supplier_cost ignored: add a supplier_code or supplier_name to link a supplier.');
390:             }
391: 
392:             return;
393:         }
394: 
395:         $suppliers = Supplier::withoutGlobalScopes()
396:             ->where('organization_id', $this->organizationId)
397:             ->whereNull('deleted_at');
398: 
399:         $supplier = $code !== ''
400:             ? (clone $suppliers)->where('code', $code)->first()
401:             : null;
402: 
403:         if (! $supplier && $name !== '') {
404:             $supplier = (clone $suppliers)->whereRaw('LOWER(name) = ?', [mb_strtolower($name)])->first();
405:         }
406: 
407:         if (! $supplier) {
408:             $label = $code !== '' ? $code : $name;
409:             $this->warn($rowNumber, "Supplier '{$label}' not found; the product was imported without a supplier link.");
410: 
411:             return;
412:         }
413: 
414:         $costPrice = null;
415:         if ($cost !== '') {
416:             if (is_numeric($cost) && (float) $cost >= 0) {
417:                 $costPrice = round((float) $cost, 2);
418:             } else {
419:                 $this->warn($rowNumber, "Invalid supplier_cost '{$cost}' ignored.");
420:             }
421:         }
422: 
423:         app(ProductService::class)->setPrimarySupplier($product, $supplier->id, [
424:             'supplier_sku' => $sku !== '' ? mb_substr((string) (ProductSpreadsheetText::isEncoded($row) ? $sku : SpreadsheetSafety::sanitiseImport($sku)), 0, 255) : null,
425:             'cost_price' => $costPrice,
426:         ]);
427:     }
428: 
429:     /**
430:      * The row's per-currency price columns (price_eur => EUR), limited to the
431:      * supported currencies. Unknown price_xxx columns are reported once.
432:      *
433:      * @param  array<int, int|string>  $keys
434:      * @return array<string, string>
435:      */
436:     protected function currencyColumns(array $keys, int $rowNumber): array
437:     {
438:         $columns = [];
439:         $unknown = [];
440: 
441:         foreach ($keys as $key) {
442:             $code = ProductCurrencyColumns::currencyFromImportKey((string) $key);
443:             if ($code === null) {
444:                 continue;
445:             }
446: 
447:             if (ProductCurrencyColumns::isSupported($code)) {
448:                 $columns[(string) $key] = $code;
449:             } else {
450:                 $unknown[] = (string) $key;
451:             }
452:         }
453: 
454:         if ($unknown !== [] && ! $this->unknownCurrenciesReported) {
455:             $this->unknownCurrenciesReported = true;
456:             $this->warn($rowNumber, 'Unknown currency column(s) ignored: '.implode(', ', $unknown).'.');
457:         }
458: 
459:         return $columns;
460:     }
461: 
462:     /**
463:      * Apply the row's currency columns over the product's existing prices. A
464:      * filled cell sets that currency, a blank cell removes it, and currencies
465:      * without a column in the file are left untouched.
466:      *
467:      * @param  array<string, mixed>|null  $existing
468:      * @param  Collection<string, mixed>|array<string, mixed>  $row
469:      * @param  array<string, string>  $columns
470:      * @return array<string, float>|null
471:      */
472:     protected function mergeCurrencyPrices(?array $existing, $row, array $columns): ?array
473:     {
474:         $prices = array_change_key_case($existing ?? [], CASE_UPPER);
475: 
476:         foreach ($columns as $key => $code) {
477:             $value = $row[$key] ?? null;
478: 
479:             if ($value === null || trim((string) $value) === '') {
480:                 unset($prices[$code]);
481:             } else {
482:                 $prices[$code] = round((float) $value, 2);
483:             }
484:         }
485: 
486:         return $prices === [] ? null : $prices;
487:     }
488: 
489:     /**
490:      * Add a non-fatal warning for a row, merging with any it already has.
491:      */
492:     protected function warn(int $rowNumber, string $message): void
493:     {
494:         foreach ($this->warnings as $index => $warning) {
495:             if ($warning['row'] === $rowNumber) {
496:                 $this->warnings[$index]['warnings'][] = $message;
497: 
498:                 return;
499:             }
500:         }
501: 
502:         $this->warnings[] = ['row' => $rowNumber, 'warnings' => [$message]];
503:     }
504: 
505:     /**
506:      * Read the file in chunks so large uploads don't materialise the whole
507:      * sheet in memory and OOM the import worker.
508:      */
509:     public function chunkSize(): int
510:     {
511:         return 500;
512:     }
513: 
514:     /**
515:      * Get import statistics
516:      */
517:     public function getStats(): array
518:     {
519:         return [
520:             'imported' => $this->imported,
521:             'updated' => $this->updated,
522:             'errors' => $this->errors,
523:             'warnings' => $this->warnings,
524:         ];
525:     }
526: 
527:     /**
528:      * Generate a 3-character-derived location code that does not collide
529:      * with any existing location code in the same organisation. On
530:      * collision, append a numeric suffix until a free code is found.
531:      */
532:     protected function uniqueLocationCode(string $name): string
533:     {
534:         $base = mb_strtoupper(mb_substr($name, 0, 3));
535:         if ($base === '') {
536:             $base = 'LOC';
537:         }
538: 
539:         $code = $base;
540:         $suffix = 1;
541:         while (
542:             ProductLocation::where('organization_id', $this->organizationId)
543:                 ->where('code', $code)
544:                 ->exists()
545:         ) {
546:             $suffix++;
547:             $code = $base.'-'.$suffix;
548:         }
549: 
550:         return $code;
551:     }
552: }
```



<a id="e0445"></a>

> Audit provenance: `platform-source-catalog.md` lines 6176–6888. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Imports/OrdersImport.php`

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Imports;
6: 
7: use App\Enums\OrderStatus;
8: use App\Models\Customer;
9: use App\Models\Inventory\Product;
10: use App\Models\Inventory\ProductVariant;
11: use App\Models\Order\Order;
12: use App\Models\Scopes\OrganizationScope;
13: use App\Models\User;
14: use App\Models\Warehouse;
15: use App\Services\OrderService;
16: use App\Support\SequenceNumberRetry;
17: use App\Support\SpreadsheetSafety;
18: use Carbon\CarbonImmutable;
19: use Illuminate\Http\UploadedFile;
20: use Illuminate\Support\Collection;
21: use Illuminate\Support\Facades\DB;
22: use Illuminate\Support\Facades\Log;
23: use Illuminate\Support\Facades\Validator;
24: use Illuminate\Validation\Rule;
25: use Maatwebsite\Excel\Concerns\ToCollection;
26: use Maatwebsite\Excel\Concerns\WithHeadingRow;
27: use Maatwebsite\Excel\Facades\Excel;
28: use PhpOffice\PhpSpreadsheet\Shared\Date as ExcelDate;
29: use Throwable;
30: 
31: /**
32:  * Imports sales orders (e.g. when migrating from another system).
33:  *
34:  * File format: one row per order LINE. Rows sharing an external_reference
35:  * form one order; they need not be adjacent. Order-level columns (order_date,
36:  * status, customer_name, customer_email, order_tax, order_shipping, currency,
37:  * shipped_at, delivered_at, notes) are read from the first non-blank value
38:  * among the order's rows, so they may be repeated on every line or given only
39:  * once. Line columns: product_sku and/or variant_sku, quantity, unit_price
40:  * (blank = the product's price in the order currency), line_tax, unit_cost
41:  * (see below). The
42:  * line-items order export uses the same column names, so its file can be
43:  * imported elsewhere once external_reference is filled in.
44:  *
45:  * Import a file with importFile(), not Excel::import(): see importFile().
46:  *
47:  * Processing:
48:  *  1. Every row is validated and every SKU resolved BEFORE any order is
49:  *     created. Problems are reported per row.
50:  *  2. Each order is all-or-nothing: if any of its rows is invalid, or
51:  *     creation fails (e.g. insufficient stock), none of its lines are kept
52:  *     and nothing it touched (customer, stock) is committed.
53:  *  3. An external_reference already present on one of this organization's
54:  *     orders is skipped with a warning, so re-importing a file never
55:  *     duplicates orders.
56:  *  4. Orders are created through OrderService, so stock is decremented, bins
57:  *     consumed, serials allocated and variant stock used exactly like an
58:  *     order entered by hand; insufficient stock fails that order.
59:  *
60:  * Historical mode records the orders and their lines WITHOUT touching
61:  * inventory (no availability check, no decrement, no ledger rows, no serial
62:  * allocation). Use it for past orders whose goods left long ago, where
63:  * current stock already reflects them. Cancelled orders never move stock in
64:  * either mode.
65:  *
66:  * Integrations (the `order_created` action: order.created webhooks and plugin
67:  * listeners):
68:  *  - Historical imports NEVER announce their orders. They are records of
69:  *    sales that already happened, often long ago; firing order.created would
70:  *    make a downstream system (fulfilment, accounting, a shop) act on them as
71:  *    new sales.
72:  *  - Stock-adjusting imports announce each order by default, because they
73:  *    behave like orders entered by hand (stock moves, so integrations that
74:  *    track orders or stock should hear about them). $notifyIntegrations =
75:  *    false turns this off, e.g. when migrating live-but-already-synced
76:  *    orders.
77:  *
78:  * Unit cost (order_items.unit_cost, which margin and turnover reports use):
79:  *  - An optional unit_cost column is recorded as-is and is not an estimate.
80:  *  - Without it, the line gets the cost OrderService captures (the variant's
81:  *    or product's current purchase price). On a HISTORICAL import that cost
82:  *    is marked as an estimate (unit_cost_backfilled_at), because the goods
83:  *    were sold at some earlier, unknown cost. On a stock-adjusting import it
84:  *    is not: the order behaves like one entered by hand today.
85:  *
86:  * Customers are matched to an existing customer of this organization by
87:  * email (case-insensitive); otherwise a customer record is created (named by
88:  * customer_name, or the email when no name is given). Orders with neither a
89:  * name nor an email are recorded without a customer record.
90:  */
91: final class OrdersImport implements ToCollection, WithHeadingRow
92: {
93:     private const ORDER_FIELDS = [
94:         'order_date', 'status', 'customer_name', 'customer_email', 'order_tax',
95:         'order_shipping', 'currency', 'shipped_at', 'delivered_at', 'notes',
96:     ];
97: 
98:     private int $organizationId;
99: 
100:     private int $imported = 0;
101: 
102:     private int $skipped = 0;
103: 
104:     private int $failed = 0;
105: 
106:     /** @var array<int, array{row: int, errors: array<int, string>}> */
107:     private array $errors = [];
108: 
109:     /** @var array<int, array{row: int, warnings: array<int, string>}> */
110:     private array $warnings = [];
111: 
112:     /** @var array<string, Product|null> */
113:     private array $productsBySku = [];
114: 
115:     /** @var array<string, ProductVariant|null> */
116:     private array $variantsBySku = [];
117: 
118:     /** @var array<string, int> Customers created or matched in this run, by lowercased email or name. */
119:     private array $customerIds = [];
120: 
121:     public function __construct(
122:         private readonly User $importer,
123:         private readonly bool $historical = false,
124:         private readonly bool $notifyIntegrations = true,
125:     ) {
126:         $this->organizationId = (int) $importer->organization_id;
127:     }
128: 
129:     /**
130:      * @param  Collection<int, Collection<string, mixed>>  $rows
131:      */
132:     public function collection(Collection $rows): void
133:     {
134:         /** @var array<string, array<int, array{row: int, data: array<string, mixed>}>> $groups */
135:         $groups = [];
136: 
137:         foreach ($rows as $index => $row) {
138:             $rowNumber = $index + 2; // header row + 0-based index
139:             $data = $this->normalise($row->toArray());
140: 
141:             if ($this->isBlank($data)) {
142:                 continue;
143:             }
144: 
145:             $reference = $data['external_reference'] ?? null;
146:             if ($reference === null) {
147:                 $this->error($rowNumber, 'The external reference field is required.');
148: 
149:                 continue;
150:             }
151: 
152:             $groups[$reference][] = ['row' => $rowNumber, 'data' => $data];
153:         }
154: 
155:         $existing = $this->existingReferences(array_map('strval', array_keys($groups)));
156: 
157:         // Phase 1: validate every order before creating any.
158:         $valid = [];
159:         foreach ($groups as $reference => $lines) {
160:             $reference = (string) $reference;
161: 
162:             if (isset($existing[$reference])) {
163:                 $this->skipped++;
164:                 $this->warn($lines[0]['row'], "Order '{$reference}' already exists; skipped.");
165: 
166:                 continue;
167:             }
168: 
169:             $order = $this->validateOrder($reference, $lines);
170:             if ($order === null) {
171:                 $this->failed++;
172: 
173:                 continue;
174:             }
175: 
176:             $valid[] = $order;
177:         }
178: 
179:         // Phase 2: create each valid order in its own transaction.
180:         foreach ($valid as $order) {
181:             $this->createOrder($order);
182:         }
183:     }
184: 
185:     /**
186:      * Read a file and import it. Use this, not Excel::import().
187:      *
188:      * Excel::import() runs the whole file inside one database transaction
189:      * (Laravel Excel's default transaction handler), which would wrap every
190:      * order's transaction. Each order must commit on its own, and its number
191:      * retry must be able to restart the order's outermost transaction (see
192:      * createOrder), so the rows are read without that wrapper.
193:      */
194:     public function importFile(string|UploadedFile $file, ?string $disk = null, ?string $readerType = null): self
195:     {
196:         $this->collection(Excel::toCollection($this, $file, $disk, $readerType)->first() ?? collect());
197: 
198:         return $this;
199:     }
200: 
201:     /**
202:      * @return array{imported: int, skipped: int, failed: int, errors: array<int, mixed>, warnings: array<int, mixed>}
203:      */
204:     public function getStats(): array
205:     {
206:         usort($this->errors, fn ($a, $b) => $a['row'] <=> $b['row']);
207:         usort($this->warnings, fn ($a, $b) => $a['row'] <=> $b['row']);
208: 
209:         return [
210:             'imported' => $this->imported,
211:             'skipped' => $this->skipped,
212:             'failed' => $this->failed,
213:             'errors' => $this->errors,
214:             'warnings' => $this->warnings,
215:         ];
216:     }
217: 
218:     /**
219:      * Validate one order's rows and resolve its SKUs.
220:      *
221:      * @param  array<int, array{row: int, data: array<string, mixed>}>  $lines
222:      * @return array<string, mixed>|null The order payload, or null when invalid.
223:      */
224:     private function validateOrder(string $reference, array $lines): ?array
225:     {
226:         $header = [];
227:         foreach (self::ORDER_FIELDS as $field) {
228:             foreach ($lines as $line) {
229:                 if (($line['data'][$field] ?? null) !== null) {
230:                     $header[$field] = $line['data'][$field];
231: 
232:                     break;
233:                 }
234:             }
235:         }
236: 
237:         $ok = true;
238:         $items = [];
239:         $costs = [];
240: 
241:         foreach ($lines as $index => $line) {
242:             // Order-level rules are checked on the first row with the resolved
243:             // header, so a missing order_date is reported once.
244:             $data = $index === 0 ? array_merge($line['data'], $header) : $line['data'];
245:             $messages = $this->validateRow($data, $index === 0);
246: 
247:             if ($messages === []) {
248:                 [$item, $message] = $this->resolveLine($data);
249:                 if ($message !== null) {
250:                     $messages[] = $message;
251:                 } else {
252:                     $items[] = $item;
253:                     $costs[] = ($data['unit_cost'] ?? null) === null ? null : round((float) $data['unit_cost'], 2);
254:                 }
255:             }
256: 
257:             if ($messages !== []) {
258:                 $ok = false;
259:                 foreach ($messages as $message) {
260:                     $this->error($line['row'], $message);
261:                 }
262:             }
263:         }
264: 
265:         if (! $ok) {
266:             return null;
267:         }
268: 
269:         return [
270:             'reference' => $reference,
271:             'row' => $lines[0]['row'],
272:             'header' => $header,
273:             'items' => $items,
274:             'costs' => $costs,
275:         ];
276:     }
277: 
278:     /**
279:      * @param  array<string, mixed>  $data
280:      * @return array<int, string>
281:      */
282:     private function validateRow(array $data, bool $withOrderRules): array
283:     {
284:         $rules = [
285:             'product_sku' => 'nullable|string|max:255|required_without:variant_sku',
286:             'variant_sku' => 'nullable|string|max:255',
287:             'quantity' => 'required|integer|min:1',
288:             'unit_price' => 'nullable|numeric|decimal:0,2|min:0',
289:             'line_tax' => 'nullable|numeric|decimal:0,2|min:0',
290:             'unit_cost' => 'nullable|numeric|decimal:0,2|min:0',
291:         ];
292: 
293:         if ($withOrderRules) {
294:             $rules += [
295:                 'external_reference' => 'required|string|max:255',
296:                 'order_date' => 'required|date',
297:                 'status' => ['nullable', Rule::in(OrderStatus::values())],
298:                 'customer_name' => 'nullable|string|max:255',
299:                 'customer_email' => 'nullable|email|max:255',
300:                 'order_tax' => 'nullable|numeric|decimal:0,2|min:0',
301:                 'order_shipping' => 'nullable|numeric|decimal:0,2|min:0',
302:                 'currency' => ['nullable', 'string', Rule::in(array_keys(config('currencies.supported', [])))],
303:                 'shipped_at' => 'nullable|date',
304:                 'delivered_at' => 'nullable|date',
305:                 'notes' => 'nullable|string|max:65535',
306:             ];
307:         }
308: 
309:         return Validator::make($data, $rules, [
310:             'product_sku.required_without' => 'Each line needs a product_sku or a variant_sku.',
311:         ])->errors()->all();
312:     }
313: 
314:     /**
315:      * Resolve a line's SKUs to this organization's product (and variant).
316:      *
317:      * @param  array<string, mixed>  $data
318:      * @return array{0: array<string, mixed>|null, 1: string|null}
319:      */
320:     private function resolveLine(array $data): array
321:     {
322:         $productSku = $data['product_sku'] ?? null;
323:         $variantSku = $data['variant_sku'] ?? null;
324:         $variant = null;
325: 
326:         if ($variantSku !== null) {
327:             $variant = $this->variant($variantSku);
328:             if ($variant === null) {
329:                 return [null, "Unknown variant SKU '{$variantSku}'."];
330:             }
331:             $product = $variant->product()->withoutGlobalScope(OrganizationScope::class)->first();
332:             if ($product === null || $product->organization_id !== $this->organizationId) {
333:                 return [null, "Unknown variant SKU '{$variantSku}'."];
334:             }
335:             if ($productSku !== null && $product->sku !== $productSku) {
336:                 return [null, "Variant SKU '{$variantSku}' does not belong to product SKU '{$productSku}'."];
337:             }
338:         } else {
339:             $product = $this->product((string) $productSku);
340: 
341:             if ($product === null) {
342:                 // A variant SKU in the product_sku column is accepted too.
343:                 $variant = $this->variant((string) $productSku);
344:                 $product = $variant?->product()->withoutGlobalScope(OrganizationScope::class)->first();
345: 
346:                 if ($product === null || $product->organization_id !== $this->organizationId) {
347:                     return [null, "Unknown SKU '{$productSku}'."];
348:                 }
349:             } elseif ($product->has_variants) {
350:                 return [null, "Product '{$productSku}' is sold by variant; add a variant_sku."];
351:             }
352:         }
353: 
354:         $item = [
355:             'product_id' => $product->id,
356:             'product_variant_id' => $variant?->id,
357:             'quantity' => (int) $data['quantity'],
358:         ];
359:         if (($data['unit_price'] ?? null) !== null) {
360:             $item['unit_price'] = round((float) $data['unit_price'], 2);
361:         }
362:         if (($data['line_tax'] ?? null) !== null) {
363:             $item['tax'] = round((float) $data['line_tax'], 2);
364:         }
365: 
366:         return [$item, null];
367:     }
368: 
369:     /**
370:      * Create one validated order (and its customer, if new) atomically.
371:      *
372:      * @param  array<string, mixed>  $order
373:      */
374:     private function createOrder(array $order): void
375:     {
376:         $header = $order['header'];
377:         $status = $header['status'] ?? OrderStatus::PENDING->value;
378:         $adjustStock = ! $this->historical && $status !== OrderStatus::CANCELLED->value;
379: 
380:         $attempts = 0;
381: 
382:         try {
383:             // The retry loop owns the order's transaction (not the other way
384:             // round), and OrderService's own SequenceNumberRetry defers to
385:             // it: an order-number collision rolls back the WHOLE order and
386:             // re-runs it in a fresh transaction. Retrying inside a transaction
387:             // that is still open would, under MySQL's REPEATABLE READ, re-read
388:             // the same snapshot and collide on every attempt. The closure may
389:             // run more than once, so counters and warnings are applied only
390:             // after it returns.
391:             $outcome = SequenceNumberRetry::create(fn () => DB::transaction(function () use ($order, $header, $status, $adjustStock, &$attempts) {
392:                 if ($attempts++ > 0) {
393:                     // The per-run customer cache may point at a customer the
394:                     // rolled-back attempt created.
395:                     $this->customerIds = [];
396:                 }
397: 
398:                 // Re-check under the transaction: another import may have
399:                 // created this reference since phase 1.
400:                 if ($this->existingReferences([$order['reference']]) !== []) {
401:                     return 'skipped';
402:                 }
403: 
404:                 [$customerId, $customerName, $customerEmail] = $this->resolveCustomer(
405:                     $header['customer_name'] ?? null,
406:                     $header['customer_email'] ?? null,
407:                 );
408: 
409:                 $created = app(OrderService::class)->create([
410:                     'external_reference' => $order['reference'],
411:                     'customer_id' => $customerId,
412:                     'customer_name' => $customerName,
413:                     'customer_email' => $customerEmail,
414:                     'status' => $status,
415:                     // A historical order (stock untouched) records a sale that
416:                     // already happened: there is nothing left to approve.
417:                     'approval_status' => $adjustStock ? null : 'not_required',
418:                     'order_date' => $header['order_date'],
419:                     'shipped_at' => $header['shipped_at'] ?? null,
420:                     'delivered_at' => $header['delivered_at'] ?? null,
421:                     'tax' => $header['order_tax'] ?? 0,
422:                     'shipping' => $header['order_shipping'] ?? 0,
423:                     'currency' => $header['currency'] ?? $this->organizationCurrency(),
424:                     'notes' => $header['notes'] ?? null,
425:                     'warehouse_id' => $this->defaultWarehouseId(),
426:                     'items' => $order['items'],
427:                 ], $this->importer, 'import', $adjustStock, $this->announcesOrders());
428: 
429:                 $this->applyUnitCosts($created, $order['costs']);
430: 
431:                 return 'imported';
432:             }));
433: 
434:             if ($outcome === 'skipped') {
435:                 $this->skipped++;
436:                 $this->warn($order['row'], "Order '{$order['reference']}' already exists; skipped.");
437:             } else {
438:                 $this->imported++;
439:             }
440:         } catch (Throwable $e) {
441:             $this->failed++;
442:             // The per-run customer cache may point at a customer that the
443:             // rollback just removed.
444:             $this->customerIds = [];
445: 
446:             $message = $e instanceof \Illuminate\Database\QueryException
447:                 ? 'The order could not be saved due to a database error.'
448:                 : $e->getMessage();
449: 
450:             if ($e instanceof \Illuminate\Database\QueryException) {
451:                 Log::error('Order import row failed with database error', [
452:                     'organization_id' => $this->organizationId,
453:                     'external_reference' => $order['reference'],
454:                     'error' => $e->getMessage(),
455:                 ]);
456:             }
457: 
458:             $this->error($order['row'], "Order '{$order['reference']}' was not imported: {$message}");
459:         }
460:     }
461: 
462:     /**
463:      * Record each line's unit cost: the file's value when given (as-is, not an
464:      * estimate), otherwise keep the cost OrderService captured and, on a
465:      * historical import, mark it as an estimate. Lines are matched to the
466:      * file's rows by creation order (OrderService inserts them in order).
467:      *
468:      * @param  array<int, float|null>  $costs
469:      */
470:     private function applyUnitCosts(Order $order, array $costs): void
471:     {
472:         $items = $order->items()->orderBy('id')->get(['id', 'unit_cost']);
473: 
474:         foreach ($items as $index => $item) {
475:             $cost = $costs[$index] ?? null;
476: 
477:             if ($cost !== null) {
478:                 $item->newQuery()->whereKey($item->id)->update([
479:                     'unit_cost' => $cost,
480:                     'unit_cost_backfilled_at' => null,
481:                 ]);
482:             } elseif ($this->historical && $item->unit_cost !== null) {
483:                 $item->newQuery()->whereKey($item->id)->update(['unit_cost_backfilled_at' => now()]);
484:             }
485:         }
486:     }
487: 
488:     /**
489:      * Match the customer by email, else create one. Returns the customer id
490:      * and the name/email to snapshot on the order.
491:      *
492:      * @return array{0: int|null, 1: string, 2: string|null}
493:      */
494:     private function resolveCustomer(?string $name, ?string $email): array
495:     {
496:         if ($name === null && $email === null) {
497:             return [null, 'Imported customer', null];
498:         }
499: 
500:         $key = $email !== null ? 'e:'.mb_strtolower($email) : 'n:'.mb_strtolower($name);
501:         $customers = Customer::withoutGlobalScope(OrganizationScope::class)
502:             ->where('organization_id', $this->organizationId);
503: 
504:         $customer = null;
505:         if (isset($this->customerIds[$key])) {
506:             $customer = (clone $customers)->find($this->customerIds[$key]);
507:         }
508:         if ($customer === null && $email !== null) {
509:             $customer = (clone $customers)->whereRaw('LOWER(email) = ?', [mb_strtolower($email)])->first();
510:         }
511:         if ($customer === null && $email === null) {
512:             $customer = (clone $customers)->whereRaw('LOWER(name) = ?', [mb_strtolower((string) $name)])->whereNull('email')->first();
513:         }
514: 
515:         if ($customer === null) {
516:             $customer = Customer::create([
517:                 'organization_id' => $this->organizationId,
518:                 'name' => mb_substr((string) SpreadsheetSafety::sanitiseImport($name ?? $email), 0, 255),
519:                 'email' => $email,
520:                 'is_active' => true,
521:             ]);
522:         }
523: 
524:         $this->customerIds[$key] = $customer->id;
525: 
526:         return [$customer->id, $name ?? $customer->name, $email ?? $customer->email];
527:     }
528: 
529:     private function product(string $sku): ?Product
530:     {
531:         if (! array_key_exists($sku, $this->productsBySku)) {
532:             $this->productsBySku[$sku] = Product::withoutGlobalScope(OrganizationScope::class)
533:                 ->where('organization_id', $this->organizationId)
534:                 ->where('sku', $sku)
535:                 ->first();
536:         }
537: 
538:         return $this->productsBySku[$sku];
539:     }
540: 
541:     private function variant(string $sku): ?ProductVariant
542:     {
543:         if (! array_key_exists($sku, $this->variantsBySku)) {
544:             $this->variantsBySku[$sku] = ProductVariant::query()
545:                 ->where('organization_id', $this->organizationId)
546:                 ->where('sku', $sku)
547:                 ->first();
548:         }
549: 
550:         return $this->variantsBySku[$sku];
551:     }
552: 
553:     /**
554:      * Whether created orders fire `order_created` (webhooks + plugins).
555:      * Historical imports never do; see the class docblock.
556:      */
557:     private function announcesOrders(): bool
558:     {
559:         return ! $this->historical && $this->notifyIntegrations;
560:     }
561: 
562:     private function organizationCurrency(): string
563:     {
564:         return $this->importer->organization?->currency
565:             ?? config('currencies.default', 'USD');
566:     }
567: 
568:     private function defaultWarehouseId(): ?int
569:     {
570:         $id = Warehouse::withoutGlobalScope(OrganizationScope::class)
571:             ->where('organization_id', $this->organizationId)
572:             ->where('is_default', true)
573:             ->value('id');
574: 
575:         return $id === null ? null : (int) $id;
576:     }
577: 
578:     /**
579:      * The given references that already exist on this organization's orders,
580:      * including soft-deleted ones (they still hold the unique reference).
581:      *
582:      * @param  array<int, string>  $references
583:      * @return array<string, true>
584:      */
585:     private function existingReferences(array $references): array
586:     {
587:         $found = [];
588: 
589:         foreach (array_chunk($references, 500) as $chunk) {
590:             Order::withoutGlobalScopes()
591:                 ->where('organization_id', $this->organizationId)
592:                 ->whereIn('external_reference', $chunk)
593:                 ->pluck('external_reference')
594:                 ->each(function ($reference) use (&$found) {
595:                     $found[(string) $reference] = true;
596:                 });
597:         }
598: 
599:         return $found;
600:     }
601: 
602:     /**
603:      * Trim cells, turn blanks into null, stringify identifiers, convert
604:      * spreadsheet serial dates, and strip formula triggers from free text.
605:      *
606:      * @param  array<string, mixed>  $row
607:      * @return array<string, mixed>
608:      */
609:     private function normalise(array $row): array
610:     {
611:         $data = [];
612: 
613:         foreach ($row as $key => $value) {
614:             if (is_string($value)) {
615:                 $value = trim($value);
616:             }
617:             if ($value === '' || $value === null) {
618:                 $value = null;
619:             } elseif (is_float($value) || is_int($value)) {
620:                 if (in_array($key, ['external_reference', 'product_sku', 'variant_sku'], true)) {
621:                     $value = (string) $value;
622:                 }
623:             }
624: 
625:             $data[(string) $key] = $value;
626:         }
627: 
628:         foreach (['order_date', 'shipped_at', 'delivered_at'] as $key) {
629:             $data[$key] = $this->parseDate($data[$key] ?? null);
630:         }
631: 
632:         foreach (['customer_name', 'notes'] as $key) {
633:             if (isset($data[$key])) {
634:                 $data[$key] = SpreadsheetSafety::sanitiseImport((string) $data[$key]);
635:             }
636:         }
637: 
638:         if (isset($data['status']) && is_string($data['status'])) {
639:             $data['status'] = strtolower($data['status']);
640:         }
641:         if (isset($data['currency']) && is_string($data['currency'])) {
642:             $data['currency'] = strtoupper($data['currency']);
643:         }
644: 
645:         return $data;
646:     }
647: 
648:     /**
649:      * Accept ISO-ish date strings and spreadsheet serial numbers. Anything
650:      * unparseable is passed through for the `date` rule to reject.
651:      */
652:     private function parseDate(mixed $value): mixed
653:     {
654:         if ($value === null) {
655:             return null;
656:         }
657: 
658:         if (is_int($value) || is_float($value)) {
659:             try {
660:                 return CarbonImmutable::instance(ExcelDate::excelToDateTimeObject((float) $value))->format('Y-m-d H:i:s');
661:             } catch (Throwable) {
662:                 return (string) $value;
663:             }
664:         }
665: 
666:         return (string) $value;
667:     }
668: 
669:     /**
670:      * @param  array<string, mixed>  $data
671:      */
672:     private function isBlank(array $data): bool
673:     {
674:         foreach ($data as $value) {
675:             if ($value !== null) {
676:                 return false;
677:             }
678:         }
679: 
680:         return true;
681:     }
682: 
683:     private function error(int $row, string $message): void
684:     {
685:         foreach ($this->errors as $i => $entry) {
686:             if ($entry['row'] === $row) {
687:                 $this->errors[$i]['errors'][] = $message;
688: 
689:                 return;
690:             }
691:         }
692: 
693:         $this->errors[] = ['row' => $row, 'errors' => [$message]];
694:     }
695: 
696:     private function warn(int $row, string $message): void
697:     {
698:         foreach ($this->warnings as $i => $entry) {
699:             if ($entry['row'] === $row) {
700:                 $this->warnings[$i]['warnings'][] = $message;
701: 
702:                 return;
703:             }
704:         }
705: 
706:         $this->warnings[] = ['row' => $row, 'warnings' => [$message]];
707:     }
708: }
```



<a id="e0446"></a>

> Audit provenance: `platform-source-catalog.md` lines 6889–7201. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Imports/UsersImport.php`

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Imports;
6: 
7: use App\Enums\SecurityEvent;
8: use App\Models\Role;
9: use App\Models\User;
10: use App\Notifications\AccountInvitation;
11: use App\Services\SecurityEventLogger;
12: use App\Services\UserActivityAlertService;
13: use App\Support\RoleAssignmentGuard;
14: use App\Support\SpreadsheetSafety;
15: use Illuminate\Database\QueryException;
16: use Illuminate\Support\Collection;
17: use Illuminate\Support\Facades\DB;
18: use Illuminate\Support\Facades\Hash;
19: use Illuminate\Support\Facades\Log;
20: use Illuminate\Support\Facades\Password;
21: use Illuminate\Support\Facades\Validator;
22: use Illuminate\Support\Str;
23: use Maatwebsite\Excel\Concerns\ToCollection;
24: use Maatwebsite\Excel\Concerns\WithHeadingRow;
25: use Throwable;
26: 
27: /**
28:  * Imports users into the importer's organization.
29:  *
30:  * Columns: name, email, role (base role: member, manager or admin; blank =
31:  * member), roles (custom role names or slugs, separated by ";" or ","). The
32:  * same columns the user export writes, so an export can be re-imported.
33:  *
34:  * Passwords never travel in the file: any password column is ignored (with a
35:  * warning). Each new user gets a long random password nobody knows and, by
36:  * default, an email with a set-password link. With invitations off, the
37:  * account is created and left pending: the user signs in by requesting a
38:  * link via "Forgot your password?".
39:  *
40:  * Every row goes through RoleAssignmentGuard, the same privilege-escalation
41:  * check as the user form: a non-admin importer can only create plain members
42:  * with roles no wider than their own permissions. A violation rejects that
43:  * row. An email that already belongs to any account, or repeats earlier in
44:  * the file, is skipped with a warning.
45:  */
46: final class UsersImport implements ToCollection, WithHeadingRow
47: {
48:     private const BASE_ROLES = ['member', 'manager', 'admin'];
49: 
50:     private int $imported = 0;
51: 
52:     private int $skipped = 0;
53: 
54:     /** @var array<int, array{row: int, errors: array<int, string>}> */
55:     private array $errors = [];
56: 
57:     /** @var array<int, array{row: int, warnings: array<int, string>}> */
58:     private array $warnings = [];
59: 
60:     /** @var array<string, true> */
61:     private array $seenEmails = [];
62: 
63:     /** @var array<int, User> Accounts created by this import, for the admin summary. */
64:     private array $created = [];
65: 
66:     private bool $passwordColumnReported = false;
67: 
68:     public function __construct(
69:         private readonly User $importer,
70:         private readonly bool $sendInvites = true,
71:     ) {}
72: 
73:     /**
74:      * @param  Collection<int, Collection<string, mixed>>  $rows
75:      */
76:     public function collection(Collection $rows): void
77:     {
78:         // One "N users imported" admin alert for the whole file rather than
79:         // a "new user" email per row. The security log still records each
80:         // account (UserSecurityObserver).
81:         UserActivityAlertService::withoutUserCreatedAlerts(fn () => $this->importRows($rows));
82: 
83:         app(UserActivityAlertService::class)->notifyUsersImported(
84:             (int) $this->importer->organization_id,
85:             $this->created,
86:             $this->importer,
87:         );
88:         $this->created = [];
89:     }
90: 
91:     /**
92:      * @param  Collection<int, Collection<string, mixed>>  $rows
93:      */
94:     private function importRows(Collection $rows): void
95:     {
96:         foreach ($rows as $index => $row) {
97:             $rowNumber = $index + 2;
98:             $data = $row->toArray();
99: 
100:             if (! $this->passwordColumnReported && array_key_exists('password', $data)) {
101:                 $this->passwordColumnReported = true;
102:                 $this->warn($rowNumber, 'The password column was ignored: passwords are never imported. New users set their own via the emailed link.');
103:             }
104: 
105:             $name = trim((string) ($data['name'] ?? ''));
106:             $email = mb_strtolower(trim((string) ($data['email'] ?? '')));
107:             $baseRole = mb_strtolower(trim((string) ($data['role'] ?? ''))) ?: 'member';
108:             $roleNames = $this->splitRoles((string) ($data['roles'] ?? ''));
109: 
110:             if ($name === '' && $email === '' && $roleNames === []) {
111:                 continue;
112:             }
113: 
114:             $validator = Validator::make(
115:                 ['name' => $name, 'email' => $email, 'role' => $baseRole],
116:                 [
117:                     'name' => 'required|string|max:255',
118:                     'email' => 'required|email|max:255',
119:                     'role' => 'required|in:'.implode(',', self::BASE_ROLES),
120:                 ],
121:             );
122: 
123:             if ($validator->fails()) {
124:                 $this->error($rowNumber, $validator->errors()->all());
125: 
126:                 continue;
127:             }
128: 
129:             if (isset($this->seenEmails[$email])) {
130:                 $this->skipped++;
131:                 $this->warn($rowNumber, "Email '{$email}' appears earlier in this file; row skipped.");
132: 
133:                 continue;
134:             }
135:             $this->seenEmails[$email] = true;
136: 
137:             if (User::whereRaw('LOWER(email) = ?', [$email])->exists()) {
138:                 $this->skipped++;
139:                 $this->warn($rowNumber, "A user with email '{$email}' already exists; row skipped.");
140: 
141:                 continue;
142:             }
143: 
144:             [$roleIds, $unknown] = $this->resolveRoles($roleNames);
145:             if ($unknown !== []) {
146:                 $this->error($rowNumber, array_map(fn ($r) => "Unknown role '{$r}'.", $unknown));
147: 
148:                 continue;
149:             }
150: 
151:             $violation = RoleAssignmentGuard::violation($roleIds, $this->importer, $baseRole);
152:             if ($violation !== null) {
153:                 $this->error($rowNumber, [$violation]);
154: 
155:                 continue;
156:             }
157: 
158:             try {
159:                 $this->createUser($rowNumber, $name, $email, $baseRole, $roleIds);
160:             } catch (QueryException $e) {
161:                 // createUser's transaction (a savepoint inside Laravel
162:                 // Excel's import transaction) has rolled back just this row,
163:                 // so on PostgreSQL the rest of the file still imports.
164:                 Log::error('User import row failed with database error', [
165:                     'organization_id' => $this->importer->organization_id,
166:                     'row' => $rowNumber,
167:                     'error' => $e->getMessage(),
168:                 ]);
169:                 $this->error($rowNumber, ['The user could not be saved due to a database error.']);
170:             }
171:         }
172:     }
173: 
174:     /**
175:      * @return array{imported: int, skipped: int, errors: array<int, mixed>, warnings: array<int, mixed>}
176:      */
177:     public function getStats(): array
178:     {
179:         return [
180:             'imported' => $this->imported,
181:             'skipped' => $this->skipped,
182:             'errors' => $this->errors,
183:             'warnings' => $this->warnings,
184:         ];
185:     }
186: 
187:     /**
188:      * @param  array<int, int>  $roleIds
189:      */
190:     private function createUser(int $rowNumber, string $name, string $email, string $baseRole, array $roleIds): void
191:     {
192:         $user = DB::transaction(function () use ($name, $email, $baseRole, $roleIds) {
193:             $user = User::create([
194:                 'name' => mb_substr((string) SpreadsheetSafety::sanitiseImport($name), 0, 255),
195:                 'email' => $email,
196:                 // Random and never revealed: the user sets their own password
197:                 // through the invitation / reset link.
198:                 'password' => Hash::make(Str::password(40)),
199:                 'organization_id' => $this->importer->organization_id,
200:                 'role' => $baseRole,
201:             ]);
202: 
203:             if ($roleIds !== []) {
204:                 // sync() writes the pivot directly, so log it like the user
205:                 // form does (the account creation itself is logged by
206:                 // UserSecurityObserver).
207:                 $changes = $user->roles()->sync($roleIds);
208:                 $names = Role::whereIn('id', $changes['attached'])->pluck('name')->all();
209: 
210:                 app(SecurityEventLogger::class)->record(SecurityEvent::USER_ROLES_SYNCED, $user, $this->importer, [
211:                     'roles_added' => $names,
212:                     'roles_removed' => [],
213:                     'source' => 'import',
214:                 ]);
215:             }
216: 
217:             return $user;
218:         });
219: 
220:         $this->imported++;
221:         $this->created[] = $user;
222: 
223:         if (! $this->sendInvites) {
224:             return;
225:         }
226: 
227:         try {
228:             $token = Password::broker()->createToken($user);
229:             $user->notify(new AccountInvitation($token, (string) ($this->importer->organization?->name ?? config('app.name'))));
230:         } catch (Throwable $e) {
231:             Log::warning('User import invitation could not be sent', [
232:                 'organization_id' => $this->importer->organization_id,
233:                 'user_id' => $user->id,
234:                 'error' => $e->getMessage(),
235:             ]);
236:             $this->warn($rowNumber, "User created, but the invitation email to '{$email}' could not be sent. They can use \"Forgot your password?\" to sign in.");
237:         }
238:     }
239: 
240:     /**
241:      * Match role names/slugs against this organization's roles and the
242:      * system roles (never another organization's).
243:      *
244:      * @param  array<int, string>  $names
245:      * @return array{0: array<int, int>, 1: array<int, string>}
246:      */
247:     private function resolveRoles(array $names): array
248:     {
249:         if ($names === []) {
250:             return [[], []];
251:         }
252: 
253:         $roles = Role::query()
254:             ->where(function ($q) {
255:                 $q->where('organization_id', $this->importer->organization_id)
256:                     ->orWhereNull('organization_id');
257:             })
258:             ->get(['id', 'name', 'slug', 'organization_id']);
259: 
260:         $ids = [];
261:         $unknown = [];
262:         foreach ($names as $name) {
263:             $needle = mb_strtolower($name);
264:             $match = $roles->first(fn (Role $role) => mb_strtolower((string) $role->name) === $needle && $role->organization_id !== null)
265:                 ?? $roles->first(fn (Role $role) => mb_strtolower((string) $role->name) === $needle || mb_strtolower((string) $role->slug) === $needle);
266: 
267:             if ($match === null) {
268:                 $unknown[] = $name;
269:             } else {
270:                 $ids[] = $match->id;
271:             }
272:         }
273: 
274:         return [array_values(array_unique($ids)), $unknown];
275:     }
276: 
277:     /**
278:      * @return array<int, string>
279:      */
280:     private function splitRoles(string $value): array
281:     {
282:         return array_values(array_filter(
283:             array_map('trim', preg_split('/[;,]/', $value) ?: []),
284:             fn (string $name) => $name !== '',
285:         ));
286:     }
287: 
288:     /**
289:      * @param  array<int, string>  $messages
290:      */
291:     private function error(int $row, array $messages): void
292:     {
293:         $this->errors[] = ['row' => $row, 'errors' => $messages];
294:     }
295: 
296:     private function warn(int $row, string $message): void
297:     {
298:         foreach ($this->warnings as $i => $entry) {
299:             if ($entry['row'] === $row) {
300:                 $this->warnings[$i]['warnings'][] = $message;
301: 
302:                 return;
303:             }
304:         }
305: 
306:         $this->warnings[] = ['row' => $row, 'warnings' => [$message]];
307:     }
308: }
```

