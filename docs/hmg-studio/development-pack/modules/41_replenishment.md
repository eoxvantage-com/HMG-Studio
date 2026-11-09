# 41. Replenishment and Reorder Policies — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Replenishment and Reorder Policies as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Product and warehouse thresholds; variant replenishment policies; supplier/cost/currency/quantity; suggested reorder; draft PO linkage.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Inventory / Products](../modules/11_inventory.md), [Purchase Orders](../modules/15_purchase_orders.md), [Suppliers](../modules/16_suppliers.md), [Warehouses](../modules/20_warehouses.md), [Stock by Warehouse](../modules/22_stock_by_warehouse.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Inventory/VariantReplenishment.vue` | Pending | Pending |

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

- [ ] Preserve nullable inherited thresholds.
- [ ] policy scope distinguishes variant/warehouse/location.
- [ ] suggestion uses available source inputs.
- [ ] repeated quick reorder behavior follows source.
- [ ] policy must not imply an automatic purchase without an implemented authorized workflow.

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

- [Replenishment and warehouse thresholds](#e0013)
- [Inventory/VariantReplenishment](#e0019)
- [Components/WarehouseStockLevels](#e0051)
- [Product/UpdateWarehouseStockLevelsRequest.php](#e0061)
- [VariantReplenishmentService.php — 30-81](#e0084)
- [WarehouseReorderPoint](#e0101)
- [VariantReplenishmentPolicy](#e0114)
- [2026_03_12_000001_add_reorder_columns_to_products_table.php](#e0129)
- [2026_09_28_000003_create_warehouse_reorder_points_table.php](#e0145)
- [2026_10_27_000003_create_variant_replenishment_policies.php](#e0160)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0013"></a>

> Audit provenance: `inventory.md` lines 107–112. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Replenishment and warehouse thresholds

- Product-level warehouse table shows warehouse/on-hand plus min_stock/reorder_point/reorder_quantity/max_stock; blanks inherit product defaults; max cannot be below a provided min/reorder point. Up to 500 distinct tenant warehouse rows.
- Variant policy requires active non-kit variant parent, active warehouse/supplier/receiving location; receiving location belongs to chosen warehouse. Variant and warehouse cannot change on existing policy. Changing supplier updates currency and clears unit cost. Auto reorder needs create_purchase_orders permission in addition to product edit/view.
- Policy forecast = on-hand bins plus outstanding eligible draft/sent/partial PO quantity. Generates a **draft PO**, not automatically received inventory. Target must exceed reorder point; minimum order and optional multiple control suggestion. [VariantReplenishmentService:30-81,98-186,239-252](C:/Users/proj/Inventoros/app/Services/VariantReplenishmentService.php#L30).



<a id="e0019"></a>

> Audit provenance: `inventory.md` lines 240–320. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Inventory/VariantReplenishment

GET /variant-replenishment; view_products. Search paginated policy cards. Show product/variant, warehouse/location/supplier and forecast values on_hand, incoming, projected, suggested. New/Edit require edit_products, draft requires create_purchase_orders. Dialog searches variant/supplier/location choices remotely; changing warehouse clears receiving location; variant/warehouse disabled on Edit. Dynamic numeric controls expand to reorder_point, target_stock, reorder_quantity, minimum_order_quantity; defaults 5/10/blank/1. Currency is payload/display derived from supplier, not independently editable. Unit cost cleared after supplier change. Delete confirmation; draft creates draft purchase order.

Source: [resources/js/Pages/Inventory/VariantReplenishment.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Inventory/VariantReplenishment.vue:16
const search = ref(props.filters.search);
// resources/js/Pages/Inventory/VariantReplenishment.vue:17
const show = ref(false);
// resources/js/Pages/Inventory/VariantReplenishment.vue:18
const editing = ref(null);
// resources/js/Pages/Inventory/VariantReplenishment.vue:19
const loading = ref(false);
// resources/js/Pages/Inventory/VariantReplenishment.vue:20
const optionsError = ref(false);
// resources/js/Pages/Inventory/VariantReplenishment.vue:21
const options = ref({ variants: [], suppliers: [], warehouses: [], locations: [] });
// resources/js/Pages/Inventory/VariantReplenishment.vue:22
const variantSearch = ref('');
// resources/js/Pages/Inventory/VariantReplenishment.vue:23
const supplierSearch = ref('');
// resources/js/Pages/Inventory/VariantReplenishment.vue:24
const locationSearch = ref('');
// resources/js/Pages/Inventory/VariantReplenishment.vue:25
const processingId = ref(null);
// resources/js/Pages/Inventory/VariantReplenishment.vue:27
const form = useForm({ product_variant_id: '', warehouse_id: '', location_id: '', supplier_id: '',
    reorder_point: 5, target_stock: 10, reorder_quantity: '', minimum_order_quantity: 1,
    unit_cost: '', currency: props.defaultCurrency, supplier_sku: '', auto_reorder: false });
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| search — [resources/js/Pages/Inventory/VariantReplenishment.vue:109](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L109) | Search | search; props.filters.search | v-model="search"; type="search"; maxlength="200" | Always within this view/dialog; see component visibility |
| variantSearch — [resources/js/Pages/Inventory/VariantReplenishment.vue:148](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L148) | Variant | search; '' | v-model="variantSearch"; type="search"; maxlength="100"; :disabled="Boolean(editing)"; @change="loadOptions" | Always within this view/dialog; see component visibility |
| form.product_variant_id — [resources/js/Pages/Inventory/VariantReplenishment.vue:149](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L149) | Variant | select; '' | ; v-model.number="form.product_variant_id"; required; :disabled="Boolean(editing) \|\| loading" | Always within this view/dialog; see component visibility |
| form.warehouse_id — [resources/js/Pages/Inventory/VariantReplenishment.vue:152](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L152) | Warehouses | select; '' | ; v-model.number="form.warehouse_id"; required; :disabled="Boolean(editing) \|\| loading"; @change="form.location_id = ''; loadOptions()" | Always within this view/dialog; see component visibility |
| locationSearch — [resources/js/Pages/Inventory/VariantReplenishment.vue:155](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L155) | Location | search; '' | v-model="locationSearch"; type="search"; maxlength="100"; @change="loadOptions" | Always within this view/dialog; see component visibility |
| form.location_id — [resources/js/Pages/Inventory/VariantReplenishment.vue:156](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L156) | Location | select; '' | ; v-model.number="form.location_id"; required; :disabled="loading" | Always within this view/dialog; see component visibility |
| supplierSearch — [resources/js/Pages/Inventory/VariantReplenishment.vue:159](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L159) | Supplier | search; '' | v-model="supplierSearch"; type="search"; maxlength="100"; @change="loadOptions" | Always within this view/dialog; see component visibility |
| form.supplier_id — [resources/js/Pages/Inventory/VariantReplenishment.vue:160](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L160) | Supplier | select; '' | ; v-model.number="form.supplier_id"; required; :disabled="loading"; @change="supplierChanged" | Always within this view/dialog; see component visibility |
| form[field.key] — [resources/js/Pages/Inventory/VariantReplenishment.vue:163](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L163) | t(field.label) | number; Derived/repeating value; see initial payload / owning child notes | v-model.number="form[field.key]"; type="number"; step="1"; :min="field.min"; :max="field.max"; :required="!field.optional" | v-for="field in fields" |
| form.unit_cost — [resources/js/Pages/Inventory/VariantReplenishment.vue:166](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L166) | Unit Cost ( form.currency ) | number; '' | v-model="form.unit_cost"; type="number"; min="0"; max="9999999999.99"; step="0.01"; required | Always within this view/dialog; see component visibility |
| form.supplier_sku — [resources/js/Pages/Inventory/VariantReplenishment.vue:169](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L169) | Supplier SKU | input; '' | v-model="form.supplier_sku"; maxlength="255" | Always within this view/dialog; see component visibility |
| form.auto_reorder — [resources/js/Pages/Inventory/VariantReplenishment.vue:172](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L172) | Create drafts automatically each day | checkbox; false | v-model="form.auto_reorder"; type="checkbox" | v-if="hasPermission('create_purchase_orders')" |

**Select options and labels (exact source, including remote lists):**

- form.product_variant_id ([resources/js/Pages/Inventory/VariantReplenishment.vue:149](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L149)): `&lt;option value="" disabled&gt;-&lt;/option&gt;&lt;option v-for="v in options.variants" :key="v.id" :value="v.id"&gt;{{ v.label }}&lt;/option&gt;`
- form.warehouse_id ([resources/js/Pages/Inventory/VariantReplenishment.vue:152](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L152)): `&lt;option value="" disabled&gt;-&lt;/option&gt;&lt;option v-for="w in options.warehouses" :key="w.id" :value="w.id"&gt;{{ w.name }}&lt;/option&gt;`
- form.location_id ([resources/js/Pages/Inventory/VariantReplenishment.vue:156](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L156)): `&lt;option value="" disabled&gt;-&lt;/option&gt;&lt;option v-for="l in options.locations" :key="l.id" :value="l.id"&gt;{{ l.name }} {{ l.code }}&lt;/option&gt;`
- form.supplier_id ([resources/js/Pages/Inventory/VariantReplenishment.vue:160](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L160)): `&lt;option value="" disabled&gt;-&lt;/option&gt;&lt;option v-for="s in options.suppliers" :key="s.id" :value="s.id"&gt;{{ s.name }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- h2: policy.product_name · policy.variant?.title — [resources/js/Pages/Inventory/VariantReplenishment.vue:117](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L117) — v-for="policy in policies.data"
- dt: t(`variantReplenishment.${key}`) — [resources/js/Pages/Inventory/VariantReplenishment.vue:121](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L121) — v-for="policy in policies.data" → v-for="key in ['on_hand', 'incoming', 'position', 'suggested_quantity']"
- h2: Add replenishment rule — [resources/js/Pages/Inventory/VariantReplenishment.vue:144](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L144)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Add replenishment rule — [resources/js/Pages/Inventory/VariantReplenishment.vue:103](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L103) | v-if="hasPermission('edit_products')"; @click="open()" | No ancestor condition |
| Create draft PO — [resources/js/Pages/Inventory/VariantReplenishment.vue:131](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L131) | v-if="hasPermission('create_purchase_orders')"; size="sm"; :disabled="!policy.available \|\| !policy.forecast.suggested_quantity \|\| processingId !== null"; :loading="processingId === policy.id"; @click="draft(policy)" | v-for="policy in policies.data" |
| Edit — [resources/js/Pages/Inventory/VariantReplenishment.vue:132](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L132) | v-if="hasPermission('edit_products')"; size="sm"; variant="secondary"; @click="open(policy)" | v-for="policy in policies.data" |
| Delete — [resources/js/Pages/Inventory/VariantReplenishment.vue:133](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L133) | v-if="hasPermission('edit_products')"; size="sm"; variant="danger"; @click="remove(policy)" | v-for="policy in policies.data" |
| Previous — [resources/js/Pages/Inventory/VariantReplenishment.vue:138](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L138) | v-if="policies.prev_page_url"; :href="policies.prev_page_url" | v-if="policies.last_page &gt; 1" |
| Next — [resources/js/Pages/Inventory/VariantReplenishment.vue:140](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L140) | v-if="policies.next_page_url"; :href="policies.next_page_url" | v-if="policies.last_page &gt; 1" |
| Search options — [resources/js/Pages/Inventory/VariantReplenishment.vue:173](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L173) | variant="secondary"; :loading="loading"; @click="loadOptions" | No ancestor condition |
| Cancel — [resources/js/Pages/Inventory/VariantReplenishment.vue:176](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L176) | variant="secondary"; :disabled="form.processing"; @click="show = false" | No ancestor condition |
| Save — [resources/js/Pages/Inventory/VariantReplenishment.vue:176](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L176) | type="submit"; :disabled="form.processing \|\| loading"; :loading="form.processing" | No ancestor condition |

**Script endpoint names:** `variant-replenishment.options`, `variant-replenishment.update`, `variant-replenishment.store`, `variant-replenishment.draft`, `variant-replenishment.destroy`. Match these to verb/path/permission in the route annex.



<a id="e0051"></a>

> Audit provenance: `inventory.md` lines 2336–2377. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/WarehouseStockLevels

Per-product warehouse thresholds with optional editing. Dynamic field loop expands min_stock/reorder_point/reorder_quantity/max_stock for every warehouse row. Blank transforms to null (inherit); stored defaults come from props.levels. Shows on-hand and low/due indicator. PUT products/{id}/warehouse-levels.

Source: [resources/js/Components/WarehouseStockLevels.vue:1](C:/Users/proj/Inventoros/resources/js/Components/WarehouseStockLevels.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Components/WarehouseStockLevels.vue:20
const form = useForm({
    levels: props.levels.map((level) => ({
        warehouse_id: level.warehouse_id,
        min_stock: level.min_stock,
        reorder_point: level.reorder_point,
        reorder_quantity: level.reorder_quantity,
        max_stock: level.max_stock,
    })),
});
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.levels[index][field] — [resources/js/Components/WarehouseStockLevels.vue:84](C:/Users/proj/Inventoros/resources/js/Components/WarehouseStockLevels.vue#L84) | No explicit label / see context | number; Derived/repeating value; see initial payload / owning child notes | v-if="canEdit"; v-model.number="form.levels[index][field]"; type="number"; min="0"; :placeholder="productLevels[field] ?? ''" | v-else → v-for="(level, index) in levels" → v-for="field in fields" |

**Read fields, columns and section headings:**

- h3: Stock by warehouse — [resources/js/Components/WarehouseStockLevels.vue:53](C:/Users/proj/Inventoros/resources/js/Components/WarehouseStockLevels.vue#L53)
- th: Warehouse — [resources/js/Components/WarehouseStockLevels.vue:64](C:/Users/proj/Inventoros/resources/js/Components/WarehouseStockLevels.vue#L64) — v-else
- th: On hand — [resources/js/Components/WarehouseStockLevels.vue:65](C:/Users/proj/Inventoros/resources/js/Components/WarehouseStockLevels.vue#L65) — v-else
- th: t(`warehouses.stockLevels.${field}`) — [resources/js/Components/WarehouseStockLevels.vue:66](C:/Users/proj/Inventoros/resources/js/Components/WarehouseStockLevels.vue#L66) — v-else

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Save warehouse levels — [resources/js/Components/WarehouseStockLevels.vue:103](C:/Users/proj/Inventoros/resources/js/Components/WarehouseStockLevels.vue#L103) | type="submit"; variant="default"; size="sm"; :loading="form.processing"; :disabled="form.processing" | v-else → v-if="canEdit" |

**Script endpoint names:** `products.warehouse-levels.update`. Match these to verb/path/permission in the route annex.



<a id="e0061"></a>

> Audit provenance: `inventory.md` lines 2703–2780. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Product/UpdateWarehouseStockLevelsRequest.php

Source [app/Http/Requests/Product/UpdateWarehouseStockLevelsRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Product/UpdateWarehouseStockLevelsRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Product;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Per-warehouse thresholds for one product, one entry per warehouse.
12:  * A blank field inherits the product-level value.
13:  */
14: class UpdateWarehouseStockLevelsRequest extends FormRequest
15: {
16:     public function authorize(): bool
17:     {
18:         return true;
19:     }
20: 
21:     /**
22:      * @return array<string, mixed>
23:      */
24:     public function rules(): array
25:     {
26:         $organizationId = $this->user()->organization_id;
27: 
28:         return [
29:             'levels' => ['present', 'array', 'max:500'],
30:             'levels.*.warehouse_id' => [
31:                 'required',
32:                 'integer',
33:                 'distinct',
34:                 Rule::exists('warehouses', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at'),
35:             ],
36:             'levels.*.min_stock' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
37:             'levels.*.reorder_point' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
38:             'levels.*.reorder_quantity' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
39:             'levels.*.max_stock' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
40:         ];
41:     }
42: 
43:     /**
44:      * A warehouse's max cannot sit below its own min or reorder point.
45:      */
46:     public function after(): array
47:     {
48:         return [
49:             function ($validator) {
50:                 foreach ((array) $this->input('levels', []) as $index => $level) {
51:                     $max = $level['max_stock'] ?? null;
52: 
53:                     if ($max === null || $max === '') {
54:                         continue;
55:                     }
56: 
57:                     foreach (['min_stock', 'reorder_point'] as $floor) {
58:                         $value = $level[$floor] ?? null;
59: 
60:                         if ($value !== null && $value !== '' && (int) $max < (int) $value) {
61:                             $validator->errors()->add("levels.{$index}.max_stock", 'Max stock must be at least the warehouse\'s '.str_replace('_', ' ', $floor).'.');
62: 
63:                             break;
64:                         }
65:                     }
66:                 }
67:             },
68:         ];
69:     }
70: }
71: 
```



<a id="e0084"></a>

> Audit provenance: `inventory.md` lines 4082–4140. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### VariantReplenishmentService.php — 30-81

Source [app/Services/VariantReplenishmentService.php:30](C:/Users/proj/Inventoros/app/Services/VariantReplenishmentService.php#L30)

```php
30:     public static function rules(): array
31:     {
32:         return ['product_variant_id' => ['required', 'integer'], 'warehouse_id' => ['required', 'integer'],
33:             'location_id' => ['required', 'integer'], 'supplier_id' => ['required', 'integer'],
34:             'reorder_point' => ['required', 'integer', 'min:0', 'max:2147483647'],
35:             'target_stock' => ['required', 'integer', 'gt:reorder_point', 'max:2147483647'],
36:             'reorder_quantity' => ['nullable', 'integer', 'min:1', 'max:2147483647'],
37:             'minimum_order_quantity' => ['required', 'integer', 'min:1', 'max:2147483647'],
38:             'unit_cost' => ['required', 'numeric', 'min:0', 'decimal:0,2', 'max:9999999999.99'],
39:             'currency' => ['required', 'string', 'regex:/\A[A-Z]{3}\z/'], 'supplier_sku' => ['nullable', 'string', 'max:255'],
40:             'auto_reorder' => ['sometimes', 'boolean']];
41:     }
42: 
43:     public function save(User $actor, array $data, ?VariantReplenishmentPolicy $policy = null): VariantReplenishmentPolicy
44:     {
45:         $data = Validator::make($data, self::rules())->validate();
46:         abort_unless($actor->hasPermission('view_products') && $actor->hasPermission('edit_products'), 403);
47:         if ($data['auto_reorder'] ?? false) {
48:             abort_unless($actor->hasPermission('create_purchase_orders'), 403);
49:         }
50:         if ($policy !== null) {
51:             abort_unless((int) $policy->organization_id === (int) $actor->organization_id, 404);
52:             if ((int) $data['product_variant_id'] !== (int) $policy->product_variant_id || (int) $data['warehouse_id'] !== (int) $policy->warehouse_id) {
53:                 throw ValidationException::withMessages(['product_variant_id' => 'Create a new policy to change its variant or warehouse.']);
54:             }
55:         }
56:         $org = (int) $actor->organization_id;
57:         $variant = ProductVariant::where('organization_id', $org)->where('is_active', true)->findOrFail($data['product_variant_id']);
58:         Product::forOrganization($org)->active()->where('has_variants', true)->where('type', '<>', 'kit')->findOrFail($variant->product_id);
59:         $warehouse = Warehouse::forOrganization($org)->where('is_active', true)->findOrFail($data['warehouse_id']);
60:         $this->warehouseAccess->authorizeWarehouse($actor, (int) $warehouse->id);
61:         ProductLocation::forOrganization($org)->active()->where('warehouse_id', $warehouse->id)->findOrFail($data['location_id']);
62:         $supplier = Supplier::forOrganization($org)->where('is_active', true)->findOrFail($data['supplier_id']);
63:         $currency = $supplier->currency ?: Organization::currencyFor($org);
64:         if (strtoupper($data['currency'] ?? '') !== strtoupper($currency)) {
65:             throw ValidationException::withMessages(['currency' => 'The supplier currency changed. Review the unit cost before saving.']);
66:         }
67: 
68:         return DB::transaction(function () use ($actor, $data, $org, $variant, $warehouse, $supplier, $currency, $policy): VariantReplenishmentPolicy {
69:             $saved = $policy ?? VariantReplenishmentPolicy::withTrashed()->firstOrCreate([
70:                 'organization_id' => $org, 'product_variant_id' => $variant->id, 'warehouse_id' => $warehouse->id,
71:             ], ['location_id' => $data['location_id'], 'supplier_id' => $supplier->id, 'reorder_point' => $data['reorder_point'],
72:                 'target_stock' => $data['target_stock'], 'unit_cost' => Money::of($data['unit_cost']), 'currency' => $currency]);
73:             $saved = VariantReplenishmentPolicy::withTrashed()->where('organization_id', $org)->whereKey($saved->id)->lockForUpdate()->firstOrFail();
74:             $old = $saved->getAttributes();
75:             $saved->fill(collect($data)->only(['location_id', 'reorder_point', 'target_stock', 'reorder_quantity', 'minimum_order_quantity', 'supplier_sku'])->all());
76:             $saved->fill(['supplier_id' => $supplier->id, 'unit_cost' => Money::of($data['unit_cost']), 'currency' => strtoupper($currency),
77:                 'auto_reorder' => (bool) ($data['auto_reorder'] ?? false), 'managed_by' => $actor->id, 'deleted_at' => null])->save();
78:             $this->log($saved, $actor, 'replenishment_policy_saved', $old, $saved->getAttributes());
79: 
80:             return $saved;
81:         }, 3);
```



<a id="e0101"></a>

> Audit provenance: `inventory.md` lines 4889–4918. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### WarehouseReorderPoint
[app/Models/Inventory/WarehouseReorderPoint.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/WarehouseReorderPoint.php#L1)

```php
39:     public const LEVELS = ['min_stock', 'reorder_point', 'reorder_quantity', 'max_stock'];
41:     protected $fillable = [
42:         'organization_id',
43:         'product_id',
44:         'warehouse_id',
45:         'reorder_point',
46:         'reorder_quantity',
47:         'min_stock',
48:         'max_stock',
49:     ];
51:     protected function casts(): array
52:     {
53:         return [
54:             'reorder_point' => 'integer',
55:             'reorder_quantity' => 'integer',
56:             'min_stock' => 'integer',
57:             'max_stock' => 'integer',
58:         ];
64:     public function organization(): BelongsTo
66:         return $this->belongsTo(Organization::class);
72:     public function product(): BelongsTo
74:         return $this->belongsTo(Product::class);
80:     public function warehouse(): BelongsTo
82:         return $this->belongsTo(Warehouse::class);
```



<a id="e0114"></a>

> Audit provenance: `inventory.md` lines 5331–5351. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### VariantReplenishmentPolicy
[app/Models/Inventory/VariantReplenishmentPolicy.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/VariantReplenishmentPolicy.php#L1)

```php
18:     protected $guarded = ['id'];
20:     protected function casts(): array
21:     {
22:         return ['reorder_point' => 'integer', 'target_stock' => 'integer', 'reorder_quantity' => 'integer',
23:             'minimum_order_quantity' => 'integer', 'unit_cost' => 'decimal:2', 'auto_reorder' => 'boolean'];
26:     public function variant(): BelongsTo
28:         return $this->belongsTo(ProductVariant::class, 'product_variant_id')->withTrashed();
31:     public function warehouse(): BelongsTo
33:         return $this->belongsTo(Warehouse::class)->withTrashed();
36:     public function location(): BelongsTo
38:         return $this->belongsTo(ProductLocation::class)->withTrashed();
41:     public function supplier(): BelongsTo
43:         return $this->belongsTo(Supplier::class)->withTrashed();
46:     public function manager(): BelongsTo
48:         return $this->belongsTo(User::class, 'managed_by');
```



<a id="e0129"></a>

> Audit provenance: `inventory.md` lines 5784–5794. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_03_12_000001_add_reorder_columns_to_products_table.php
[database/migrations/2026_03_12_000001_add_reorder_columns_to_products_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_03_12_000001_add_reorder_columns_to_products_table.php#L1)

```php
14:         Schema::table('products', function (Blueprint $table) {
15:             $table->unsignedInteger('reorder_point')->nullable()->after('max_stock');
16:             $table->unsignedInteger('reorder_quantity')->nullable()->after('reorder_point');
25:         Schema::table('products', function (Blueprint $table) {
26:             $table->dropColumn(['reorder_point', 'reorder_quantity']);
```



<a id="e0145"></a>

> Audit provenance: `inventory.md` lines 6072–6089. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_09_28_000003_create_warehouse_reorder_points_table.php
[database/migrations/2026_09_28_000003_create_warehouse_reorder_points_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_09_28_000003_create_warehouse_reorder_points_table.php#L1)

```php
17:         Schema::create('warehouse_reorder_points', function (Blueprint $table) {
18:             $table->id();
19:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
20:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
21:             $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
22:             $table->unsignedInteger('reorder_point')->nullable();
23:             $table->unsignedInteger('reorder_quantity')->nullable();
24:             $table->unsignedInteger('min_stock')->nullable();
25:             $table->unsignedInteger('max_stock')->nullable();
26:             $table->timestamps();
28:             $table->unique(['product_id', 'warehouse_id']);
29:             $table->index(['organization_id', 'warehouse_id']);
```



<a id="e0160"></a>

> Audit provenance: `inventory.md` lines 6340–6365. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_27_000003_create_variant_replenishment_policies.php
[database/migrations/2026_10_27_000003_create_variant_replenishment_policies.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_27_000003_create_variant_replenishment_policies.php#L1)

```php
13:         Schema::create('variant_replenishment_policies', function (Blueprint $table): void {
14:             $table->id();
15:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
16:             $table->foreignId('product_variant_id')->constrained()->cascadeOnDelete();
17:             $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
18:             $table->foreignId('location_id')->constrained('product_locations');
19:             $table->foreignId('supplier_id')->constrained();
20:             $table->foreignId('managed_by')->nullable()->constrained('users')->nullOnDelete();
21:             $table->unsignedInteger('reorder_point');
22:             $table->unsignedInteger('target_stock');
23:             $table->unsignedInteger('reorder_quantity')->nullable();
24:             $table->unsignedInteger('minimum_order_quantity')->default(1);
25:             $table->decimal('unit_cost', 16, 2);
26:             $table->char('currency', 3);
27:             $table->string('supplier_sku')->nullable();
28:             $table->boolean('auto_reorder')->default(false);
29:             $table->timestamps();
30:             $table->softDeletes();
31:             $table->unique(['product_variant_id', 'warehouse_id'], 'variant_replenishment_variant_warehouse_unique');
32:             $table->index(['organization_id', 'auto_reorder', 'id'], 'variant_replenishment_auto_index');
```

