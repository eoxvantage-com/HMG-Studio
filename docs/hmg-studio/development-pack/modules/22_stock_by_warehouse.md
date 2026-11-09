# 22. Stock by Warehouse — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Stock by Warehouse as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Warehouse/bin stock view; parent-versus-variant identity; on-hand/held/available; unassigned quantities; in-transit interpretation; filters and drilldowns.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Inventory / Products](../modules/11_inventory.md), [Locations](../modules/19_locations.md), [Warehouses](../modules/20_warehouses.md), [Reservations](../modules/26_reservations.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Stock/Index.vue` | Pending | Pending |

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

- [ ] Reconcile bins plus unassigned balances to on-hand.
- [ ] available equals on-hand less active holds.
- [ ] do not double count parent and variants or dispatched stock.
- [ ] foreign warehouse data is denied.

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

- [Stock/Index](#e0028)
- [StockBalanceController.php — 17-49](#e0086)
- [ProductLocationStock](#e0099)
- [VariantLocationStock](#e0100)
- [2026_07_25_000001_create_product_location_stocks_table.php](#e0139)
- [2026_07_26_000002_make_product_location_stocks_quantity_unsigned.php](#e0141)
- [2026_10_21_000001_create_variant_location_stocks.php](#e0151)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0028"></a>

> Audit provenance: `inventory.md` lines 1013–1054. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Stock/Index

GET /stock; view_products. Search, warehouse, out_of_stock/include_zero controls; sort_by=sku and sort_dir=asc default. Sort any displayed column; repeat toggles direction. Columns SKU/product/variant/warehouse/location/on_hand/reserved/available/in_transit. Export URL reflects current form values and requires export_data. Server also supports location_id/page/per_page although not exposed controls here. Missing warehouse filter inherits session active warehouse.

Source: [resources/js/Pages/Stock/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Stock/Index.vue:18
const form = useForm({ search: props.filters.search || '', warehouse_id: props.filters.warehouse_id || '', out_of_stock: enabled(props.filters.out_of_stock), include_zero: enabled(props.filters.include_zero), sort_by: props.filters.sort_by || 'sku', sort_dir: props.filters.sort_dir || 'asc' });
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.search — [resources/js/Pages/Stock/Index.vue:46](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L46) | Search | input; props.filters.search \|\| '' | ; v-model="form.search"; :placeholder="t('products.searchPlaceholder')" | Always within this view/dialog; see component visibility |
| form.warehouse_id — [resources/js/Pages/Stock/Index.vue:51](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L51) | Warehouse | select; props.filters.warehouse_id \|\| '' | v-model="form.warehouse_id" | Always within this view/dialog; see component visibility |
| form.out_of_stock — [resources/js/Pages/Stock/Index.vue:55](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L55) | Out of Stock | checkbox; enabled(props.filters.out_of_stock) | v-model="form.out_of_stock"; type="checkbox" | Always within this view/dialog; see component visibility |
| form.include_zero — [resources/js/Pages/Stock/Index.vue:56](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L56) | Include zero balances | checkbox; enabled(props.filters.include_zero) | v-model="form.include_zero"; type="checkbox" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- form.warehouse_id ([resources/js/Pages/Stock/Index.vue:51](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L51)): `&lt;option value=""&gt;{{ All Warehouses }}&lt;/option&gt; &lt;option v-for="warehouse in page.props.warehouses \|\| []" :key="warehouse.id" :value="warehouse.id"&gt;{{ warehouse.name }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- th: label form.sort_dir === 'asc' ? '↑' : '↓' — [resources/js/Pages/Stock/Index.vue:63](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L63)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Export CSV — [resources/js/Pages/Stock/Index.vue:39](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L39) | v-if="hasPermission('export_data')"; as="a"; :href="exportUrl"; variant="secondary" | No ancestor condition |
| Search — [resources/js/Pages/Stock/Index.vue:57](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L57) | type="submit"; :loading="form.processing" | No ancestor condition |
| label form.sort_dir === 'asc' ? '↑' : '↓' — [resources/js/Pages/Stock/Index.vue:64](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L64) | type="button"; :aria-label="label"; @click="sort(key)" | v-for="[key, label] in columns" |
| row.sku — [resources/js/Pages/Stock/Index.vue:69](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L69) | :href="route('products.show', row.product_id)" | v-for="row in balances.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Stock/Index.vue:80](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L80) | v-if="link.url"; :href="link.url"; v-html="link.label" | v-for="link in balances.links" |

**Script endpoint names:** `stock.index`, `stock.export`. Match these to verb/path/permission in the route annex.



<a id="e0086"></a>

> Audit provenance: `inventory.md` lines 4207–4246. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockBalanceController.php — 17-49

Source [app/Http/Controllers/Inventory/StockBalanceController.php:17](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/StockBalanceController.php#L17)

```php
17: {
18:     private const FILTERS = ['search', 'warehouse_id', 'location_id', 'out_of_stock', 'include_zero', 'sort_by', 'sort_dir', 'per_page', 'page'];
19: 
20:     public function index(Request $request, StockBalanceService $stock): Response
21:     {
22:         $filters = $request->only(self::FILTERS);
23:         if (! array_key_exists('warehouse_id', $filters)) {
24:             $filters['warehouse_id'] = $request->session()->get('active_warehouse_id');
25:         }
26: 
27:         return Inertia::render('Stock/Index', ['balances' => $stock->paginate($request->user(), $filters), 'filters' => $filters]);
28:     }
29: 
30:     public function api(Request $request, StockBalanceService $stock): JsonResponse
31:     {
32:         return response()->json($stock->paginate($request->user(), $request->only(self::FILTERS)));
33:     }
34: 
35:     public function export(Request $request, StockBalanceService $stock): StreamedResponse
36:     {
37:         $query = $stock->query($request->user(), $request->only(self::FILTERS));
38: 
39:         return response()->streamDownload(function () use ($query): void {
40:             $output = fopen('php://output', 'w');
41:             fputcsv($output, ['SKU', 'Product', 'Variant', 'Warehouse', 'Location', 'On hand', 'Reserved', 'Available', 'In transit'], escape: '');
42:             foreach ($query->cursor() as $row) {
43:                 $cells = [$row->sku, $row->product_name, $row->variant_title, $row->warehouse_name, $row->location_name, (int) $row->on_hand, (int) $row->reserved, (int) $row->available, (int) $row->in_transit];
44:                 fputcsv($output, array_map(SpreadsheetSafety::neutralise(...), $cells), escape: '');
45:             }
46:             fclose($output);
47:         }, 'warehouse-stock-'.now()->format('Y-m-d').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
48:     }
49: }
```



<a id="e0099"></a>

> Audit provenance: `inventory.md` lines 4856–4876. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductLocationStock
[app/Models/Inventory/ProductLocationStock.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/ProductLocationStock.php#L1)

```php
39:     protected $fillable = [
40:         'organization_id',
41:         'product_id',
42:         'location_id',
43:         'quantity',
44:     ];
49:     protected $casts = [
50:         'quantity' => 'integer',
51:     ];
56:     public function organization(): BelongsTo
58:         return $this->belongsTo(Organization::class);
64:     public function product(): BelongsTo
66:         return $this->belongsTo(Product::class);
72:     public function location(): BelongsTo
74:         return $this->belongsTo(ProductLocation::class, 'location_id');
```



<a id="e0100"></a>

> Audit provenance: `inventory.md` lines 4877–4888. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### VariantLocationStock
[app/Models/Inventory/VariantLocationStock.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/VariantLocationStock.php#L1)

```php
16:     protected $fillable = ['organization_id', 'product_variant_id', 'location_id', 'quantity'];
18:     protected $casts = ['quantity' => 'integer'];
20:     public function variant(): BelongsTo
22:         return $this->belongsTo(ProductVariant::class, 'product_variant_id');
25:     public function location(): BelongsTo
27:         return $this->belongsTo(ProductLocation::class, 'location_id');
```



<a id="e0139"></a>

> Audit provenance: `inventory.md` lines 6005–6020. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_07_25_000001_create_product_location_stocks_table.php
[database/migrations/2026_07_25_000001_create_product_location_stocks_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_07_25_000001_create_product_location_stocks_table.php#L1)

```php
21:         Schema::create('product_location_stocks', function (Blueprint $table) {
22:             $table->id();
23:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
24:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
25:             $table->foreignId('location_id')->constrained('product_locations')->cascadeOnDelete();
26:             $table->integer('quantity')->default(0);
27:             $table->timestamps();
30:             $table->unique(['product_id', 'location_id']);
31:             $table->index(['organization_id', 'product_id']);
32:             $table->index(['organization_id', 'location_id']);
```



<a id="e0141"></a>

> Audit provenance: `inventory.md` lines 6032–6041. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_07_26_000002_make_product_location_stocks_quantity_unsigned.php
[database/migrations/2026_07_26_000002_make_product_location_stocks_quantity_unsigned.php:1](C:/Users/proj/Inventoros/database/migrations/2026_07_26_000002_make_product_location_stocks_quantity_unsigned.php#L1)

```php
18:         Schema::table('product_location_stocks', function (Blueprint $table) {
19:             $table->unsignedInteger('quantity')->default(0)->change();
25:         Schema::table('product_location_stocks', function (Blueprint $table) {
26:             $table->integer('quantity')->default(0)->change();
```



<a id="e0151"></a>

> Audit provenance: `inventory.md` lines 6198–6212. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_21_000001_create_variant_location_stocks.php
[database/migrations/2026_10_21_000001_create_variant_location_stocks.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_21_000001_create_variant_location_stocks.php#L1)

```php
14:         Schema::create('variant_location_stocks', function (Blueprint $table): void {
15:             $table->id();
16:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
17:             $table->foreignId('product_variant_id')->constrained('product_variants')->cascadeOnDelete();
18:             $table->foreignId('location_id')->constrained('product_locations')->cascadeOnDelete();
19:             $table->integer('quantity')->default(0);
20:             $table->timestamps();
21:             $table->unique(['product_variant_id', 'location_id'], 'variant_location_unique');
22:             $table->index(['organization_id', 'location_id']);
```

