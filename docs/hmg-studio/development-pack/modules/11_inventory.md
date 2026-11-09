# 11. Inventory / Products — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Inventory / Products as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

List/filter/search/view/create/edit; SKU and barcode; prices/currencies; options/variants; images; supplier links; BOM; batch/serial tracking; stock history; privileged reset as a separate guarded operation.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Categories](../modules/18_categories.md), [Locations](../modules/19_locations.md), [Warehouses](../modules/20_warehouses.md), [Suppliers](../modules/16_suppliers.md), [Storage, Uploads and Downloads](../modules/36_storage.md), [Roles and Permission Sets](../modules/31_roles_permissions.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Products/Create.vue` | Pending | Pending |
| `resources/js/Pages/Products/Edit.vue` | Pending | Pending |
| `resources/js/Pages/Products/Index.vue` | Pending | Pending |
| `resources/js/Pages/Products/ResetStock.vue` | Pending | Pending |
| `resources/js/Pages/Products/ResetStockStatus.vue` | Pending | Pending |
| `resources/js/Pages/Products/Show.vue` | Pending | Pending |

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

- [ ] Create and reload a product with variants and images.
- [ ] preserve variant IDs on edit.
- [ ] edit cannot overwrite stock.
- [ ] removal of referenced variants follows source deactivation rules.
- [ ] opening quantities create ledger events.

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

- [Catalogue and variants](#e0006)
- [Batches/serials/barcodes](#e0012)
- [Products/Create](#e0021)
- [Products/Edit](#e0022)
- [Products/Index](#e0023)
- [Products/ResetStock](#e0024)
- [Products/ResetStockStatus](#e0025)
- [Products/Show](#e0026)
- [Components/BarcodeScannerModal](#e0046)
- [Components/BatchList](#e0047)
- [Components/SerialList](#e0048)
- [Components/ProductVariantManager](#e0049)
- [Components/SKUGeneratorModal](#e0052)
- [Components/VariantsTable](#e0055)
- [Components/BarcodeScanner](#e0056)
- [Product/StoreProductRequest.php](#e0059)
- [Product/UpdateProductRequest.php](#e0060)
- [BatchTrackingController.php — 38-79](#e0076)
- [SerialTrackingController.php — 47-87](#e0077)
- [SerialTrackingController.php — 117-202](#e0078)
- [ProductVariantController.php — 187-248](#e0079)
- [InventoryResetController.php — 19-58](#e0080)
- [BulkProductController.php — 29-140](#e0082)
- [SKUController.php — 1](#e0083)
- [Product](#e0094)
- [ProductOption](#e0097)
- [ProductVariant](#e0098)
- [ProductBatch](#e0102)
- [ProductSerial](#e0103)
- [InventoryResetRun](#e0115)
- [2025_10_12_034201_create_products_table.php](#e0117)
- [2025_10_13_015319_add_currency_support_to_products_and_organizations.php](#e0120)
- [2025_10_13_020934_add_notes_to_products_table.php](#e0121)
- [2025_10_13_023000_add_purchase_price_to_products_table.php](#e0122)
- [2025_10_13_213806_add_images_to_products_table.php](#e0124)
- [2025_12_28_000001_create_product_options_table.php](#e0125)
- [2025_12_28_000002_create_product_variants_table.php](#e0126)
- [2025_12_28_000003_add_has_variants_to_products_table.php](#e0127)
- [2026_03_12_000001_add_tracking_type_to_products_table.php](#e0130)
- [2026_03_12_000002_create_product_batches_table.php](#e0131)
- [2026_03_12_000003_create_product_serials_table.php](#e0132)
- [2026_07_25_000002_add_order_item_id_to_product_serials.php](#e0140)
- [2026_09_27_000002_add_barcode_type_to_products_table.php](#e0143)
- [2026_10_24_000001_index_batch_expiry_by_organization.php](#e0155)
- [2026_10_26_000001_create_inventory_reset_runs.php](#e0156)
- [`app/Http/Requests/Api/Product/StoreProductRequest.php`](#e0476)
- [`app/Http/Requests/Api/Product/UpdateProductRequest.php`](#e0477)
- [`app/Http/Requests/Api/ProductComponent/StoreProductComponentRequest.php`](#e0480)
- [`app/Http/Requests/Api/ProductComponent/UpdateProductComponentRequest.php`](#e0481)
- [`app/Http/Requests/Api/ProductOption/StoreProductOptionRequest.php`](#e0484)
- [`app/Http/Requests/Api/ProductOption/UpdateProductOptionRequest.php`](#e0485)
- [`app/Http/Requests/Api/ProductVariant/StoreProductVariantRequest.php`](#e0486)
- [`app/Http/Requests/Api/ProductVariant/UpdateProductVariantRequest.php`](#e0487)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0006"></a>

> Audit provenance: `inventory.md` lines 54–61. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Catalogue and variants

- Create basic product → optional category/location quick-add → prices/stock → optional options/variant combinations → supplier links/images → save. `type` is standard/kit/assembly, `tracking_type` none/batch/serial. UI does not expose every accepted model attribute.
- Create form has a currency selector and additional currency prices; Edit form **does not** expose currency/additional-currency editing and does not send stock. Edit Current Stock is readonly with an adjustment link. Preserve this distinction instead of assuming the two forms are identical.
- Product variant manager takes up to 3 option dimensions and shows a 2,048-combination UI limit. It generates Cartesian combinations, keeps matching rows by option-values serialization, and defaults new rows to `{sku:'', barcode:'', price:null, purchase_price:null, stock:0, min_stock:0, is_active:true}` plus title/position. Its visible grid edits SKU, price, stock and active—not every latent field. Existing saved variant stock is readonly on Edit. [ProductVariantManager:49-160](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L49).
- Image uploader accepts multiple image files, max 5 images / 5 MB each in these pages; inspect backend image validation before porting. Supplier links form one array with at most one primary (server promotes first when none). Supplier row controls: supplier_id, supplier_sku, cost_price, lead_time_days, minimum_order_quantity, is_primary. No duplicated supplier identities.
- Product catalogue filters primary location / active warehouse association, whereas Stock view exposes actual bins. They are not interchangeable inventory scopes. [ProductController:48-96](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/ProductController.php#L48).



<a id="e0012"></a>

> Audit provenance: `inventory.md` lines 99–106. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Batches/serials/barcodes

- Batch add stores batch_number (autogenerate if omitted), quantity >=0, optional manufactured/expiry dates and notes; expiry >= manufactured date. It creates tracked metadata, not a PO receipt or generic stock-adjustment form. Product must use batch tracking.
- Serial add requires organization-unique serial_number; status available(default)/sold/reserved/damaged, optional notes. Consumed/transferred/written_off are system-only terminal labels, not choices for arbitrary creation. Updating sold/reserved cannot allocate twice except reserved→sold. Held available serial cannot move out until hold released. Terminal serials reject mutation. [SerialTrackingController:117-202](C:/Users/proj/Inventoros/app/Http/Controllers/Api/SerialTrackingController.php#L117).
- Order allocation consumes batches FEFO (undated last) or available serials. **Order tracking is best-effort by default** (`inventory.strict_tracked_stock=false`): incomplete tracked records can leave tracking untouched. Do not promise strict lot/serial traceability unless enabled and verified. [TrackedStockAllocationService:551-557](C:/Users/proj/Inventoros/app/Services/TrackedStockAllocationService.php#L551).
- Scanner modal defaults camera, supports manual barcode/SKU input; camera starts only when enabled, uses rear-facing mode, 10 fps and 1.5-second scan debounce, stops on close/unmount. Manual lookup can return product+variant or location. Raw mode emits code for audit-specific lookup. Camera permission/hardware success is unverified. [BarcodeScanner:31-100](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScanner.vue#L31).
- SKU generator fetches presets/variables, previews pattern + current product name/category, applies generated SKU only when preview valid; it does not create a product. Backend generation and check-unique contracts in annex.



<a id="e0021"></a>

> Audit provenance: `inventory.md` lines 393–532. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Products/Create

GET /products/create; create_products. New product blank defaults except currency, type, tracking, variant flag and arrays. Sections basic information, pricing/inventory, classification, images, variants, suppliers, notes. Inline quick-add category and location, SKU generator, dynamic currencies. Dynamic variant fields are defined by ProductVariantManager; suppliers/images by child components. Submit POST /products; backend create rules apply. No active toggle or max_stock control despite accepted server attributes.

Source: [resources/js/Pages/Products/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Products/Create.vue:35
const form = useForm({
    name: '',
    description: '',
    sku: '',
    price: '',
    purchase_price: '',
    currency: props.defaultCurrency || 'USD',
    price_in_currencies: [],
    stock: '',
    min_stock: '',
    reorder_point: '',
    reorder_quantity: '',
    category_id: '',
    location_id: '',
    barcode: '',
    barcode_type: '',
    notes: '',
    images: [],
    has_variants: false,
    tracking_type: 'none',
    type: 'standard',
    options: [],
    variants: [],
    suppliers: [],
});
// resources/js/Pages/Products/Create.vue:62
const showVariantSection = ref(false);
// resources/js/Pages/Products/Create.vue:63
const variantData = ref({ options: [], variants: [] });
// resources/js/Pages/Products/Create.vue:77
const additionalCurrencies = ref([]);
// resources/js/Pages/Products/Create.vue:78
const showCurrencySelect = ref(false);
// resources/js/Pages/Products/Create.vue:79
const selectedNewCurrency = ref('');
// resources/js/Pages/Products/Create.vue:108
const showCategoryModal = ref(false);
// resources/js/Pages/Products/Create.vue:109
const showLocationModal = ref(false);
// resources/js/Pages/Products/Create.vue:110
const categoryForm = ref({ name: '', description: '' });
// resources/js/Pages/Products/Create.vue:118
const locationForm = ref(newLocationForm());
// resources/js/Pages/Products/Create.vue:119
const locationErrors = ref({});
// resources/js/Pages/Products/Create.vue:120
const categoryLoading = ref(false);
// resources/js/Pages/Products/Create.vue:121
const locationLoading = ref(false);
// resources/js/Pages/Products/Create.vue:124
const showSKUGenerator = ref(false);
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.name — [resources/js/Pages/Products/Create.vue:233](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L233) | Product Name * | text; '' | ; v-model="form.name"; type="text"; required | Always within this view/dialog; see component visibility |
| form.sku — [resources/js/Pages/Products/Create.vue:252](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L252) | SKU * | text; '' | ; v-model="form.sku"; type="text"; required | Always within this view/dialog; see component visibility |
| form.barcode — [resources/js/Pages/Products/Create.vue:259](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L259) | Barcode | text; '' | ; v-model="form.barcode"; type="text" | Always within this view/dialog; see component visibility |
| form.barcode_type — [resources/js/Pages/Products/Create.vue:266](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L266) | Barcode Type | select; '' | ; v-model="form.barcode_type" | Always within this view/dialog; see component visibility |
| form.type — [resources/js/Pages/Products/Create.vue:276](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L276) | Product Type | select; 'standard' | ; v-model="form.type" | Always within this view/dialog; see component visibility |
| form.description — [resources/js/Pages/Products/Create.vue:290](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L290) | Description | textarea; '' | ; v-model="form.description"; rows="4" | Always within this view/dialog; see component visibility |
| form.currency — [resources/js/Pages/Products/Create.vue:305](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L305) | Currency * | select; props.defaultCurrency \|\| 'USD' | ; v-model="form.currency"; required | Always within this view/dialog; see component visibility |
| form.purchase_price — [resources/js/Pages/Products/Create.vue:319](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L319) | Purchase Price (Cost) | number; '' | ; v-model="form.purchase_price"; type="number"; step="0.01"; min="0" | Always within this view/dialog; see component visibility |
| form.price — [resources/js/Pages/Products/Create.vue:334](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L334) | Selling Price * | number; '' | ; v-model="form.price"; type="number"; step="0.01"; min="0"; required | Always within this view/dialog; see component visibility |
| currencyPrice.currency — [resources/js/Pages/Products/Create.vue:361](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L361) | Additional Currencies | select; Derived/repeating value; see initial payload / owning child notes | ; v-model="currencyPrice.currency"; disabled | v-if="additionalCurrencies.length &gt; 0 \|\| showCurrencySelect" → v-for="(currencyPrice, index) in additionalCurrencies" |
| currencyPrice.price — [resources/js/Pages/Products/Create.vue:370](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L370) | No explicit label / see context | number; Derived/repeating value; see initial payload / owning child notes | ; v-model="currencyPrice.price"; type="number"; step="0.01"; min="0" | v-if="additionalCurrencies.length &gt; 0 \|\| showCurrencySelect" → v-for="(currencyPrice, index) in additionalCurrencies" |
| selectedNewCurrency — [resources/js/Pages/Products/Create.vue:379](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L379) | No explicit label / see context | select; '' | ; v-model="selectedNewCurrency" | v-if="additionalCurrencies.length &gt; 0 \|\| showCurrencySelect" → v-if="showCurrencySelect" |
| form.stock — [resources/js/Pages/Products/Create.vue:404](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L404) | Current Stock * | number; '' | ; v-model="form.stock"; type="number"; min="0"; required | Always within this view/dialog; see component visibility |
| form.min_stock — [resources/js/Pages/Products/Create.vue:413](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L413) | Minimum Stock Level * | number; '' | ; v-model="form.min_stock"; type="number"; min="0"; required | Always within this view/dialog; see component visibility |
| form.reorder_point — [resources/js/Pages/Products/Create.vue:421](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L421) | Reorder Point | number; '' | ; v-model="form.reorder_point"; type="number"; min="0"; :placeholder="t('products.form.leaveEmptyToDisable')" | Always within this view/dialog; see component visibility |
| form.reorder_quantity — [resources/js/Pages/Products/Create.vue:429](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L429) | Reorder Quantity | number; '' | ; v-model="form.reorder_quantity"; type="number"; min="0"; :placeholder="t('products.form.leaveEmptyToDisable')" | Always within this view/dialog; see component visibility |
| form.category_id — [resources/js/Pages/Products/Create.vue:444](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L444) | Category | select; '' | ; v-model="form.category_id" | Always within this view/dialog; see component visibility |
| form.location_id — [resources/js/Pages/Products/Create.vue:463](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L463) | Location | select; '' | ; v-model="form.location_id" | Always within this view/dialog; see component visibility |
| form.tracking_type — [resources/js/Pages/Products/Create.vue:475](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L475) | Inventory Tracking | select; 'none' | ; v-model="form.tracking_type" | Always within this view/dialog; see component visibility |
| form.images — [resources/js/Pages/Products/Create.vue:491](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L491) | No explicit label / see context | ImageUploader; [] | v-model="form.images"; :max-images="5"; :max-size-in-m-b="5" | Always within this view/dialog; see component visibility |
| form.suppliers — [resources/js/Pages/Products/Create.vue:542](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L542) | No explicit label / see context | ProductSupplierManager; [] | v-model="form.suppliers"; :suppliers="suppliers"; :errors="form.errors"; :currency-symbol="getCurrencySymbol(form.currency)" | Always within this view/dialog; see component visibility |
| form.notes — [resources/js/Pages/Products/Create.vue:557](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L557) | No explicit label / see context | textarea; '' | ; v-model="form.notes"; rows="3"; :placeholder="t('products.create.notesPlaceholder')" | Always within this view/dialog; see component visibility |
| categoryForm.name — [resources/js/Pages/Products/Create.vue:593](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L593) | Category Name * | text; '' | ; v-model="categoryForm.name"; type="text"; :placeholder="t('products.quickAddCategory.placeholder')"; required | Always within this view/dialog; see component visibility |
| categoryForm.description — [resources/js/Pages/Products/Create.vue:603](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L603) | Description | textarea; '' | ; v-model="categoryForm.description"; rows="3"; :placeholder="t('products.quickAddCategory.descPlaceholder')" | Always within this view/dialog; see component visibility |
| locationForm.warehouse_id — [resources/js/Pages/Products/Create.vue:636](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L636) | Warehouse | select; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.warehouse_id" | Always within this view/dialog; see component visibility |
| locationForm.name — [resources/js/Pages/Products/Create.vue:646](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L646) | Location Name * | text; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.name"; type="text"; :placeholder="t('products.quickAddLocation.namePlaceholder')"; required | Always within this view/dialog; see component visibility |
| locationForm.code — [resources/js/Pages/Products/Create.vue:658](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L658) | Location Code * | text; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.code"; type="text"; :placeholder="t('products.quickAddLocation.codePlaceholder')"; required | Always within this view/dialog; see component visibility |
| locationForm.description — [resources/js/Pages/Products/Create.vue:668](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L668) | Description | textarea; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.description"; rows="3"; :placeholder="t('products.quickAddLocation.descPlaceholder')" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- form.barcode_type ([resources/js/Pages/Products/Create.vue:266](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L266)): `&lt;option value=""&gt;{{ Detect automatically }}&lt;/option&gt; &lt;option v-for="bt in barcodeTypes" :key="bt.value" :value="bt.value"&gt;{{ bt.label }}&lt;/option&gt;`
- form.type ([resources/js/Pages/Products/Create.vue:276](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L276)): `&lt;option value="standard"&gt;{{ Standard }}&lt;/option&gt; &lt;option value="kit"&gt;{{ Kit }}&lt;/option&gt; &lt;option value="assembly"&gt;{{ Assembly }}&lt;/option&gt;`
- form.currency ([resources/js/Pages/Products/Create.vue:305](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L305)): `&lt;option v-for="(data, code) in currencies" :key="code" :value="code"&gt; {{ code }} ({{ data.symbol }}) - {{ data.name }} &lt;/option&gt;`
- currencyPrice.currency ([resources/js/Pages/Products/Create.vue:361](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L361)): `&lt;option :value="currencyPrice.currency"&gt;{{ currencyPrice.currency }} ({{ getCurrencySymbol(currencyPrice.currency) }})&lt;/option&gt;`
- selectedNewCurrency ([resources/js/Pages/Products/Create.vue:379](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L379)): `&lt;option value=""&gt;{{ Select currency... }}&lt;/option&gt; &lt;option v-for="curr in availableCurrencies" :key="curr.code" :value="curr.code"&gt; {{ curr.code }} ({{ curr.symbol }}) - {{ curr.name }} &lt;/option&gt;`
- form.category_id ([resources/js/Pages/Products/Create.vue:444](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L444)): `&lt;option value=""&gt;{{ Select a category }}&lt;/option&gt; &lt;option v-for="category in categories" :key="category.id" :value="category.id"&gt; {{ category.name }} &lt;/option&gt;`
- form.location_id ([resources/js/Pages/Products/Create.vue:463](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L463)): `&lt;option value=""&gt;{{ Select a location }}&lt;/option&gt; &lt;option v-for="location in locations" :key="location.id" :value="location.id"&gt; {{ location.name }} &lt;/option&gt;`
- form.tracking_type ([resources/js/Pages/Products/Create.vue:475](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L475)): `&lt;option value="none"&gt;{{ No Tracking }}&lt;/option&gt; &lt;option value="batch"&gt;{{ Batch Tracking }}&lt;/option&gt; &lt;option value="serial"&gt;{{ Serial Number Tracking }}&lt;/option&gt;`
- locationForm.warehouse_id ([resources/js/Pages/Products/Create.vue:636](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L636)): `&lt;option value=""&gt;{{ No warehouse }}&lt;/option&gt; &lt;option v-for="warehouse in locationWarehouses" :key="warehouse.id" :value="warehouse.id"&gt;{{ warehouse.name }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: Basic Information — [resources/js/Pages/Products/Create.vue:226](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L226)
- h3: Pricing & Inventory — [resources/js/Pages/Products/Create.vue:298](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L298)
- h3: Product Images — [resources/js/Pages/Products/Create.vue:489](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L489)
- h3: Suppliers — [resources/js/Pages/Products/Create.vue:540](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L540)
- h3: Notes — [resources/js/Pages/Products/Create.vue:555](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L555)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/Products/Create.vue:199](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L199) | :href="route('products.index')" | No ancestor condition |
| Inventory — [resources/js/Pages/Products/Create.vue:201](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L201) | :href="route('products.index')" | No ancestor condition |
| Back to Inventory — [resources/js/Pages/Products/Create.vue:209](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L209) | variant="secondary"; size="sm"; as="Link"; :href="route('products.index')" | No ancestor condition |
| Generate SKU — [resources/js/Pages/Products/Create.vue:243](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L243) | type="button"; @click="showSKUGenerator = true" | No ancestor condition |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Create.vue:372](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L372) | type="button"; variant="danger"; size="icon"; @click="removeCurrency(index)" | v-if="additionalCurrencies.length &gt; 0 \|\| showCurrencySelect" → v-for="(currencyPrice, index) in additionalCurrencies" |
| Add — [resources/js/Pages/Products/Create.vue:385](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L385) | type="button"; variant="default"; @click="addCurrency" | v-if="additionalCurrencies.length &gt; 0 \|\| showCurrencySelect" → v-if="showCurrencySelect" |
| Cancel — [resources/js/Pages/Products/Create.vue:386](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L386) | type="button"; variant="secondary"; @click="showCurrencySelect = false" | v-if="additionalCurrencies.length &gt; 0 \|\| showCurrencySelect" → v-if="showCurrencySelect" |
| + Add price in another currency — [resources/js/Pages/Products/Create.vue:390](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L390) | v-if="!showCurrencySelect && availableCurrencies.length &gt; 0"; type="button"; @click="showCurrencySelect = true" | No ancestor condition |
| + Quick Add — [resources/js/Pages/Products/Create.vue:440](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L440) | type="button"; @click="showCategoryModal = true" | No ancestor condition |
| + Quick Add — [resources/js/Pages/Products/Create.vue:459](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L459) | type="button"; @click="showLocationModal = true" | No ancestor condition |
| Product Variants {count} variant \| {count} variants — [resources/js/Pages/Products/Create.vue:504](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L504) | type="button"; @click="toggleVariants" | No ancestor condition |
| Cancel — [resources/js/Pages/Products/Create.vue:572](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L572) | variant="secondary"; as="Link"; :href="route('products.index')" | No ancestor condition |
| Create Product — [resources/js/Pages/Products/Create.vue:573](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L573) | type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing" | No ancestor condition |
| Cancel — [resources/js/Pages/Products/Create.vue:611](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L611) | type="button"; variant="secondary"; @click="showCategoryModal = false" | No ancestor condition |
| Creating... Create Category — [resources/js/Pages/Products/Create.vue:614](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L614) | type="button"; variant="default"; :loading="categoryLoading"; :disabled="categoryLoading \|\| !categoryForm.name"; @click="createCategory" | No ancestor condition |
| Cancel — [resources/js/Pages/Products/Create.vue:676](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L676) | type="button"; variant="secondary"; @click="showLocationModal = false" | No ancestor condition |
| Creating... Create Location — [resources/js/Pages/Products/Create.vue:679](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L679) | type="button"; variant="default"; :loading="locationLoading"; :disabled="locationLoading \|\| !locationForm.name \|\| !locationForm.code"; @click="createLocation" | No ancestor condition |

**Script endpoint names:** `categories.store`, `locations.store`, `products.store`. Match these to verb/path/permission in the route annex.



<a id="e0022"></a>

> Audit provenance: `inventory.md` lines 533–667. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Products/Edit

GET /products/{product}/edit; edit_products. Same main catalogue sections with saved defaults, but stock readonly and a stock-adjustment link; currency and additional prices are not editable here. Existing images represented by authenticated image URLs/previews. Product options/variants maintain IDs; lockExistingStock enabled for saved variants. PUT product and preserve scroll. No active toggle or max_stock control. Quick-add fields are same as Create.

Source: [resources/js/Pages/Products/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Products/Edit.vue:78
const form = useForm({
    name: props.product.name,
    description: props.product.description,
    sku: props.product.sku,
    price: props.product.price,
    purchase_price: props.product.purchase_price || '',
    // No `stock`: on-hand changes only through stock adjustments.
    min_stock: props.product.min_stock,
    reorder_point: props.product.reorder_point || '',
    reorder_quantity: props.product.reorder_quantity || '',
    category_id: props.product.category_id,
    location_id: props.product.location_id,
    barcode: props.product.barcode || '',
    barcode_type: props.product.barcode_type || '',
    notes: props.product.notes || '',
    images: (props.product.images || []).map((path, index) => ({
        url: props.product.image_urls[index],
        preview: props.product.image_urls[index],
        name: path.split('/').pop(),
        size: 0
    })),
    has_variants: props.product.has_variants || false,
    tracking_type: props.product.tracking_type || 'none',
    type: props.product.type || 'standard',
    options: prepareExistingOptions(),
    variants: prepareExistingVariants(),
    suppliers: prepareExistingSuppliers(),
});
// resources/js/Pages/Products/Edit.vue:108
const showVariantSection = ref(props.product.has_variants || false);
// resources/js/Pages/Products/Edit.vue:109
const variantData = ref({
    options: prepareExistingOptions(),
    variants: prepareExistingVariants()
});
// resources/js/Pages/Products/Edit.vue:147
const showCategoryModal = ref(false);
// resources/js/Pages/Products/Edit.vue:148
const showLocationModal = ref(false);
// resources/js/Pages/Products/Edit.vue:149
const categoryForm = ref({ name: '', description: '' });
// resources/js/Pages/Products/Edit.vue:157
const locationForm = ref(newLocationForm());
// resources/js/Pages/Products/Edit.vue:158
const locationErrors = ref({});
// resources/js/Pages/Products/Edit.vue:159
const categoryLoading = ref(false);
// resources/js/Pages/Products/Edit.vue:160
const locationLoading = ref(false);
// resources/js/Pages/Products/Edit.vue:163
const showSKUGenerator = ref(false);
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.name — [resources/js/Pages/Products/Edit.vue:271](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L271) | Product Name * | text; props.product.name | ; v-model="form.name"; type="text"; required | Always within this view/dialog; see component visibility |
| form.sku — [resources/js/Pages/Products/Edit.vue:290](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L290) | SKU * | text; props.product.sku | ; v-model="form.sku"; type="text"; required | Always within this view/dialog; see component visibility |
| form.barcode — [resources/js/Pages/Products/Edit.vue:297](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L297) | Barcode | text; props.product.barcode \|\| '' | ; v-model="form.barcode"; type="text" | Always within this view/dialog; see component visibility |
| form.barcode_type — [resources/js/Pages/Products/Edit.vue:304](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L304) | Barcode Type | select; props.product.barcode_type \|\| '' | ; v-model="form.barcode_type" | Always within this view/dialog; see component visibility |
| form.type — [resources/js/Pages/Products/Edit.vue:314](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L314) | Product Type | select; props.product.type \|\| 'standard' | ; v-model="form.type" | Always within this view/dialog; see component visibility |
| form.description — [resources/js/Pages/Products/Edit.vue:328](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L328) | Description | textarea; props.product.description | ; v-model="form.description"; rows="4" | Always within this view/dialog; see component visibility |
| form.purchase_price — [resources/js/Pages/Products/Edit.vue:345](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L345) | Purchase Price (Cost) | number; props.product.purchase_price \|\| '' | ; v-model="form.purchase_price"; type="number"; step="0.01"; min="0" | Always within this view/dialog; see component visibility |
| form.price — [resources/js/Pages/Products/Edit.vue:360](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L360) | Selling Price * | number; props.product.price | ; v-model="form.price"; type="number"; step="0.01"; min="0"; required | Always within this view/dialog; see component visibility |
| (unbound) — [resources/js/Pages/Products/Edit.vue:387](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L387) | Current Stock | number; See :value / :checked and event handler; not a v-model field | ; :value="product.stock"; type="number"; readonly | Always within this view/dialog; see component visibility |
| form.min_stock — [resources/js/Pages/Products/Edit.vue:403](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L403) | Minimum Stock Level * | number; props.product.min_stock | ; v-model="form.min_stock"; type="number"; min="0"; required | Always within this view/dialog; see component visibility |
| form.reorder_point — [resources/js/Pages/Products/Edit.vue:411](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L411) | Reorder Point | number; props.product.reorder_point \|\| '' | ; v-model="form.reorder_point"; type="number"; min="0"; :placeholder="t('products.form.leaveEmptyToDisable')" | Always within this view/dialog; see component visibility |
| form.reorder_quantity — [resources/js/Pages/Products/Edit.vue:419](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L419) | Reorder Quantity | number; props.product.reorder_quantity \|\| '' | ; v-model="form.reorder_quantity"; type="number"; min="0"; :placeholder="t('products.form.leaveEmptyToDisable')" | Always within this view/dialog; see component visibility |
| form.category_id — [resources/js/Pages/Products/Edit.vue:438](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L438) | Category | select; props.product.category_id | ; v-model="form.category_id" | Always within this view/dialog; see component visibility |
| form.location_id — [resources/js/Pages/Products/Edit.vue:461](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L461) | Location | select; props.product.location_id | ; v-model="form.location_id" | Always within this view/dialog; see component visibility |
| form.tracking_type — [resources/js/Pages/Products/Edit.vue:473](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L473) | Inventory Tracking | select; props.product.tracking_type \|\| 'none' | ; v-model="form.tracking_type" | Always within this view/dialog; see component visibility |
| form.images — [resources/js/Pages/Products/Edit.vue:488](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L488) | No explicit label / see context | ImageUploader; (props.product.images \|\| []).map((path, index) =&gt; ({&lt;br&gt;        url: props.product.image_urls[index],&lt;br&gt;        preview: props.product.image_urls[index],&lt;br&gt;        name: path.split('/').pop(),&lt;br&gt;        size: 0&lt;br&gt;    })) | v-model="form.images"; :max-images="5"; :max-size-in-m-b="5" | Always within this view/dialog; see component visibility |
| form.suppliers — [resources/js/Pages/Products/Edit.vue:547](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L547) | No explicit label / see context | ProductSupplierManager; prepareExistingSuppliers() | v-model="form.suppliers"; :suppliers="suppliers"; :linked="product.suppliers \|\| []"; :errors="form.errors"; :currency-symbol="getCurrencySymbol(product.currency \|\| defaultCurrency)" | Always within this view/dialog; see component visibility |
| form.notes — [resources/js/Pages/Products/Edit.vue:561](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L561) | No explicit label / see context | textarea; props.product.notes \|\| '' | ; v-model="form.notes"; rows="3"; :placeholder="t('products.create.notesPlaceholder')" | Always within this view/dialog; see component visibility |
| categoryForm.name — [resources/js/Pages/Products/Edit.vue:610](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L610) | Category Name * | text; '' | ; v-model="categoryForm.name"; type="text"; :placeholder="t('products.quickAddCategory.placeholder')"; required | v-if="showCategoryModal" |
| categoryForm.description — [resources/js/Pages/Products/Edit.vue:621](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L621) | Description | textarea; '' | ; v-model="categoryForm.description"; rows="3"; :placeholder="t('products.quickAddCategory.descPlaceholder')" | v-if="showCategoryModal" |
| locationForm.warehouse_id — [resources/js/Pages/Products/Edit.vue:669](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L669) | Warehouse | select; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.warehouse_id" | v-if="showLocationModal" |
| locationForm.name — [resources/js/Pages/Products/Edit.vue:679](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L679) | Location Name * | text; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.name"; type="text"; :placeholder="t('products.quickAddLocation.namePlaceholder')"; required | v-if="showLocationModal" |
| locationForm.code — [resources/js/Pages/Products/Edit.vue:692](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L692) | Location Code * | text; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.code"; type="text"; :placeholder="t('products.quickAddLocation.codePlaceholder')"; required | v-if="showLocationModal" |
| locationForm.description — [resources/js/Pages/Products/Edit.vue:703](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L703) | Description | textarea; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.description"; rows="3"; :placeholder="t('products.quickAddLocation.descPlaceholder')" | v-if="showLocationModal" |

**Select options and labels (exact source, including remote lists):**

- form.barcode_type ([resources/js/Pages/Products/Edit.vue:304](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L304)): `&lt;option value=""&gt;{{ Detect automatically }}&lt;/option&gt; &lt;option v-for="bt in barcodeTypes" :key="bt.value" :value="bt.value"&gt;{{ bt.label }}&lt;/option&gt;`
- form.type ([resources/js/Pages/Products/Edit.vue:314](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L314)): `&lt;option value="standard"&gt;{{ Standard }}&lt;/option&gt; &lt;option value="kit"&gt;{{ Kit }}&lt;/option&gt; &lt;option value="assembly"&gt;{{ Assembly }}&lt;/option&gt;`
- form.category_id ([resources/js/Pages/Products/Edit.vue:438](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L438)): `&lt;option value=""&gt;{{ Select a category }}&lt;/option&gt; &lt;option v-for="category in categories" :key="category.id" :value="category.id"&gt; {{ category.name }} &lt;/option&gt;`
- form.location_id ([resources/js/Pages/Products/Edit.vue:461](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L461)): `&lt;option value=""&gt;{{ Select a location }}&lt;/option&gt; &lt;option v-for="location in locations" :key="location.id" :value="location.id"&gt; {{ location.name }} &lt;/option&gt;`
- form.tracking_type ([resources/js/Pages/Products/Edit.vue:473](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L473)): `&lt;option value="none"&gt;{{ No Tracking }}&lt;/option&gt; &lt;option value="batch"&gt;{{ Batch Tracking }}&lt;/option&gt; &lt;option value="serial"&gt;{{ Serial Number Tracking }}&lt;/option&gt;`
- locationForm.warehouse_id ([resources/js/Pages/Products/Edit.vue:669](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L669)): `&lt;option value=""&gt;{{ No warehouse }}&lt;/option&gt; &lt;option v-for="warehouse in locationWarehouses" :key="warehouse.id" :value="warehouse.id"&gt;{{ warehouse.name }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: Basic Information — [resources/js/Pages/Products/Edit.vue:264](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L264)
- h3: Pricing & Inventory — [resources/js/Pages/Products/Edit.vue:336](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L336)
- h3: Product Images — [resources/js/Pages/Products/Edit.vue:486](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L486)
- h3: Suppliers — [resources/js/Pages/Products/Edit.vue:545](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L545)
- h3: Notes — [resources/js/Pages/Products/Edit.vue:559](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L559)
- h3: Quick Add Category — [resources/js/Pages/Products/Edit.vue:594](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L594) — v-if="showCategoryModal"
- h3: Quick Add Location — [resources/js/Pages/Products/Edit.vue:655](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L655) — v-if="showLocationModal"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/Products/Edit.vue:233](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L233) | :href="route('products.index')" | No ancestor condition |
| Inventory — [resources/js/Pages/Products/Edit.vue:235](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L235) | :href="route('products.index')" | No ancestor condition |
| View — [resources/js/Pages/Products/Edit.vue:243](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L243) | variant="secondary"; size="sm"; as="Link"; :href="route('products.show', product.id)" | No ancestor condition |
| Back to Inventory — [resources/js/Pages/Products/Edit.vue:247](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L247) | variant="secondary"; size="sm"; as="Link"; :href="route('products.index')" | No ancestor condition |
| Generate SKU — [resources/js/Pages/Products/Edit.vue:281](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L281) | type="button"; @click="showSKUGenerator = true" | No ancestor condition |
| Adjust stock — [resources/js/Pages/Products/Edit.vue:390](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L390) | v-if="hasPermission('manage_stock')"; :href="route('stock-adjustments.create', { product_id: product.id })" | No ancestor condition |
| + Quick Add — [resources/js/Pages/Products/Edit.vue:430](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L430) | type="button"; @click="showCategoryModal = true" | No ancestor condition |
| + Quick Add — [resources/js/Pages/Products/Edit.vue:453](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L453) | type="button"; @click="showLocationModal = true" | No ancestor condition |
| Product Variants {count} variant \| {count} variants — [resources/js/Pages/Products/Edit.vue:499](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L499) | type="button"; @click="toggleVariants" | No ancestor condition |
| Cancel — [resources/js/Pages/Products/Edit.vue:575](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L575) | variant="secondary"; as="Link"; :href="route('products.index')" | No ancestor condition |
| Update Product — [resources/js/Pages/Products/Edit.vue:578](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L578) | type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing" | No ancestor condition |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Edit.vue:597](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L597) | @click="showCategoryModal = false" | v-if="showCategoryModal" |
| Cancel — [resources/js/Pages/Products/Edit.vue:630](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L630) | type="button"; variant="secondary"; @click="showCategoryModal = false" | v-if="showCategoryModal" |
| categoryLoading ? Creating... : Create Category — [resources/js/Pages/Products/Edit.vue:633](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L633) | type="button"; variant="default"; @click="createCategory"; :loading="categoryLoading"; :disabled="categoryLoading \|\| !categoryForm.name" | v-if="showCategoryModal" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Edit.vue:658](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L658) | @click="showLocationModal = false" | v-if="showLocationModal" |
| Cancel — [resources/js/Pages/Products/Edit.vue:712](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L712) | type="button"; variant="secondary"; @click="showLocationModal = false" | v-if="showLocationModal" |
| locationLoading ? Creating... : Create Location — [resources/js/Pages/Products/Edit.vue:715](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L715) | type="button"; variant="default"; @click="createLocation"; :loading="locationLoading"; :disabled="locationLoading \|\| !locationForm.name \|\| !locationForm.code" | v-if="showLocationModal" |

**Script endpoint names:** `categories.store`, `locations.store`, `products.update`. Match these to verb/path/permission in the route annex.



<a id="e0023"></a>

> Audit provenance: `inventory.md` lines 668–769. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Products/Index

GET /products; view_products. Search product/name/SKU/barcode including variants; filters category, location, low_stock (query-carried), per_page 15/25/50/100. Table has checkbox, product/image, SKU/barcode, category, primary location, effective stock, price, actions. Create/edit/delete/export permissions gate respective actions. Row view/duplicate/edit/delete/print and multi-select bulk delete/change category/adjust price/export/print barcodes/QR. Selected IDs survive page selection but clear when filters change. Bulk price type percentage(default) or fixed, signed value default 0; UI does not submit zero. Ctrl/Cmd+B toggles scanner. Reset link only canResetStock. Scanner product opens detail, location opens its products_url.

Source: [resources/js/Pages/Products/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Products/Index.vue:38
const search = ref(props.filters?.search || '');
// resources/js/Pages/Products/Index.vue:39
const category = ref(props.filters?.category || '');
// resources/js/Pages/Products/Index.vue:40
const location = ref(props.filters?.location || '');
// resources/js/Pages/Products/Index.vue:41
const perPage = ref(Number(props.filters?.per_page) || 15);
// resources/js/Pages/Products/Index.vue:44
const selectedProducts = ref([]);
// resources/js/Pages/Products/Index.vue:51
const showBulkCategoryModal = ref(false);
// resources/js/Pages/Products/Index.vue:52
const showBulkPriceModal = ref(false);
// resources/js/Pages/Products/Index.vue:53
const bulkCategoryId = ref('');
// resources/js/Pages/Products/Index.vue:54
const bulkPriceType = ref('percentage');
// resources/js/Pages/Products/Index.vue:55
const bulkPriceValue = ref(0);
// resources/js/Pages/Products/Index.vue:56
const bulkProcessing = ref(false);
// resources/js/Pages/Products/Index.vue:59
const showScannerModal = ref(false);
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| search — [resources/js/Pages/Products/Index.vue:251](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L251) | Search Products | search; props.filters?.search \|\| '' | ; v-model="search"; type="search"; :placeholder="t('products.searchPlaceholder')" | Always within this view/dialog; see component visibility |
| category — [resources/js/Pages/Products/Index.vue:259](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L259) | Category | select; props.filters?.category \|\| '' | ; v-model="category" | Always within this view/dialog; see component visibility |
| location — [resources/js/Pages/Products/Index.vue:266](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L266) | Location | select; props.filters?.location \|\| '' | ; v-model="location" | Always within this view/dialog; see component visibility |
| (unbound) — [resources/js/Pages/Products/Index.vue:303](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L303) | No explicit label / see context | checkbox; See :value / :checked and event handler; not a v-model field | ; type="checkbox"; :checked="selectAll"; @change="toggleSelectAll" | Always within this view/dialog; see component visibility |
| (unbound) — [resources/js/Pages/Products/Index.vue:326](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L326) | No explicit label / see context | checkbox; See :value / :checked and event handler; not a v-model field | type="checkbox"; :checked="isSelected(product.id)"; @change="toggleSelect(product.id)" | v-for="product in products.data" |
| perPage — [resources/js/Pages/Products/Index.vue:363](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L363) | Products per page | select; Number(props.filters?.per_page) \|\| 15 | ; v-model="perPage"; :title="t('inventoryCleanup.selectionHint')"; @change="searchProducts" | v-if="products.data.length &gt; 0" |
| bulkCategoryId — [resources/js/Pages/Products/Index.vue:399](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L399) | No explicit label / see context | select; '' | ; v-model="bulkCategoryId" | v-if="showBulkCategoryModal" |
| bulkPriceType — [resources/js/Pages/Products/Index.vue:421](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L421) | Adjustment type | select; 'percentage' | ; v-model="bulkPriceType" | v-if="showBulkPriceModal" |
| bulkPriceValue — [resources/js/Pages/Products/Index.vue:428](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L428) | Value (use negative to decrease) | number; 0 | ; v-model.number="bulkPriceValue"; type="number"; step="0.01"; :placeholder="bulkPriceType === 'percentage' ? t('products.bulk.percentagePlaceholder') : t('products.bulk.fixedPlaceholder')" | v-if="showBulkPriceModal" |

**Select options and labels (exact source, including remote lists):**

- category ([resources/js/Pages/Products/Index.vue:259](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L259)): `&lt;option value=""&gt;{{ All Categories }}&lt;/option&gt; &lt;option v-for="cat in categories" :key="cat.id" :value="cat.id"&gt;{{ cat.name }}&lt;/option&gt;`
- location ([resources/js/Pages/Products/Index.vue:266](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L266)): `&lt;option value=""&gt;{{ All Locations }}&lt;/option&gt; &lt;option v-for="loc in locations" :key="loc.id" :value="loc.id"&gt;{{ loc.name }}&lt;/option&gt;`
- perPage ([resources/js/Pages/Products/Index.vue:363](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L363)): `&lt;option v-for="size in [15, 25, 50, 100]" :key="size" :value="size"&gt;{{ size }}&lt;/option&gt;`
- bulkCategoryId ([resources/js/Pages/Products/Index.vue:399](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L399)): `&lt;option value=""&gt;{{ Select a category... }}&lt;/option&gt; &lt;option v-for="cat in categories" :key="cat.id" :value="cat.id"&gt;{{ cat.name }}&lt;/option&gt;`
- bulkPriceType ([resources/js/Pages/Products/Index.vue:421](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L421)): `&lt;option value="percentage"&gt;{{ Percentage (%) }}&lt;/option&gt; &lt;option value="fixed"&gt;{{ Fixed Amount ($) }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- th: (selection/action column) — [resources/js/Pages/Products/Index.vue:302](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L302)
- th: Product — [resources/js/Pages/Products/Index.vue:305](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L305)
- th: SKU / Barcode — [resources/js/Pages/Products/Index.vue:306](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L306)
- th: Category — [resources/js/Pages/Products/Index.vue:307](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L307)
- th: Location — [resources/js/Pages/Products/Index.vue:308](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L308)
- th: Stock — [resources/js/Pages/Products/Index.vue:309](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L309)
- th: Price — [resources/js/Pages/Products/Index.vue:310](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L310)
- th: Actions — [resources/js/Pages/Products/Index.vue:311](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L311)
- h3: Change category — [resources/js/Pages/Products/Index.vue:397](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L397) — v-if="showBulkCategoryModal"
- h3: Adjust price — [resources/js/Pages/Products/Index.vue:416](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L416) — v-if="showBulkPriceModal"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Variant replenishment — [resources/js/Pages/Products/Index.vue:236](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L236) | v-if="canVisit('variant-replenishment.index')"; variant="secondary"; size="sm"; as="Link"; :href="route('variant-replenishment.index')" | No ancestor condition |
| Reset stock to zero — [resources/js/Pages/Products/Index.vue:237](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L237) | v-if="canResetStock"; variant="secondary"; size="sm"; as="Link"; :href="route('products.stock-reset.preview')" | No ancestor condition |
| Add Product — [resources/js/Pages/Products/Index.vue:238](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L238) | v-if="canVisit('products.create')"; variant="default"; size="sm"; as="Link"; :href="route('products.create')" | No ancestor condition |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Index.vue:252](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L252) | type="submit"; :aria-label="t('common.search')" | No ancestor condition |
| Clear Filters — [resources/js/Pages/Products/Index.vue:274](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L274) | type="button"; variant="secondary"; size="sm"; @click="clearFilters" | No ancestor condition |
| Clear selection — [resources/js/Pages/Products/Index.vue:285](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L285) | @click="selectedProducts = []" | v-if="selectedProducts.length &gt; 0" |
| Print Barcodes — [resources/js/Pages/Products/Index.vue:288](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L288) | variant="default"; size="sm"; @click="printSelectedBarcodes" | v-if="selectedProducts.length &gt; 0" |
| Print QR Labels — [resources/js/Pages/Products/Index.vue:289](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L289) | variant="secondary"; size="sm"; @click="printSelectedQrLabels" | v-if="selectedProducts.length &gt; 0" |
| Change category — [resources/js/Pages/Products/Index.vue:290](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L290) | variant="secondary"; size="sm"; :disabled="bulkProcessing"; @click="showBulkCategoryModal = true" | v-if="selectedProducts.length &gt; 0" |
| Adjust price — [resources/js/Pages/Products/Index.vue:291](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L291) | variant="secondary"; size="sm"; :disabled="bulkProcessing"; @click="showBulkPriceModal = true" | v-if="selectedProducts.length &gt; 0" |
| Export — [resources/js/Pages/Products/Index.vue:292](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L292) | variant="secondary"; size="sm"; :disabled="bulkProcessing"; @click="bulkExport" | v-if="selectedProducts.length &gt; 0" |
| Delete — [resources/js/Pages/Products/Index.vue:293](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L293) | variant="danger"; size="sm"; :disabled="bulkProcessing"; @click="bulkDelete" | v-if="selectedProducts.length &gt; 0" |
| Add Your First Product — [resources/js/Pages/Products/Index.vue:320](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L320) | v-if="canVisit('products.create')"; variant="default"; size="sm"; as="Link"; :href="route('products.create')" | v-if="products.data.length === 0" |
| product.display_name ?? product.name — [resources/js/Pages/Products/Index.vue:329](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L329) | :href="route('products.show', product.id)" | v-for="product in products.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Index.vue:348](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L348) | :href="route('products.show', product.id)"; :title="t('common.view')" | v-for="product in products.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Index.vue:349](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L349) | v-if="product.barcode \|\| product.sku"; @click="printBarcode(product.id)"; :title="t('products.printBarcode')" | v-for="product in products.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Index.vue:350](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L350) | @click="duplicateProduct(product)"; :title="t('products.duplicate')" | v-for="product in products.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Index.vue:351](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L351) | v-if="canVisit('products.edit')"; :href="route('products.edit', product.id)"; :title="t('common.edit')" | v-for="product in products.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Index.vue:352](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L352) | v-if="hasPermission('delete_products')"; @click="deleteProduct(product)"; :title="t('common.delete')" | v-for="product in products.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Index.vue:375](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L375) | v-if="link.url"; preserve-state; preserve-scroll; :href="link.url"; v-html="link.label" | v-if="products.data.length &gt; 0" → v-for="link in products.links" |
| Cancel — [resources/js/Pages/Products/Index.vue:404](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L404) | variant="secondary"; size="sm"; @click="showBulkCategoryModal = false" | v-if="showBulkCategoryModal" |
| Update category — [resources/js/Pages/Products/Index.vue:405](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L405) | variant="default"; size="sm"; :disabled="!bulkCategoryId \|\| bulkProcessing"; @click="bulkUpdateCategory" | v-if="showBulkCategoryModal" |
| Cancel — [resources/js/Pages/Products/Index.vue:434](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L434) | variant="secondary"; size="sm"; @click="showBulkPriceModal = false" | v-if="showBulkPriceModal" |
| Apply price change — [resources/js/Pages/Products/Index.vue:435](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L435) | variant="default"; size="sm"; :disabled="!bulkPriceValue \|\| bulkProcessing"; @click="bulkUpdatePrice" | v-if="showBulkPriceModal" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Products/Index.vue:442](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L442) | v-if="$page.props.auth.permissions.includes('products.view')"; @click="openScanner"; :title="t('products.scanBarcode')" | No ancestor condition |

**Script endpoint names:** `products.show`, `products.barcode.bulk-print`, `products.qr.bulk-print`, `products.barcode.print`, `products.index`, `products.destroy`, `products.bulk.delete`, `products.bulk.update-category`, `products.bulk.update-price`, `products.bulk.export`, `products.duplicate`. Match these to verb/path/permission in the route annex.



<a id="e0024"></a>

> Audit provenance: `inventory.md` lines 770–806. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Products/ResetStock

GET /products/stock-reset; admin + manage_stock. Preview summary and blocker links, no mutation until confirmation form submitted. Hidden payload token from server, reason/current password/exact phrase. No form while blocked. POST reset queues operation; refresh obtains new preview. Never run on user stock without explicit destructive-action approval.

Source: [resources/js/Pages/Products/ResetStock.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Products/ResetStock.vue:12
const form = useForm({ token: props.token, confirmation: '', reason: '', password: '' });
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.reason — [resources/js/Pages/Products/ResetStock.vue:59](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L59) | Reason | textarea; '' | v-model="form.reason"; rows="2"; required; minlength="3"; maxlength="500" | v-else |
| form.password — [resources/js/Pages/Products/ResetStock.vue:60](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L60) | Current password | password; '' | v-model="form.password"; type="password"; autocomplete="current-password"; required | v-else |
| form.confirmation — [resources/js/Pages/Products/ResetStock.vue:61](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L61) | Type {phrase} to confirm | input; '' | v-model="form.confirmation"; required; autocomplete="off" | v-else |

**Read fields, columns and section headings:**

- dt: t(`stockReset.${label}`) — [resources/js/Pages/Products/ResetStock.vue:42](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L42) — v-for="[label, count] in rows"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| t(label) — [resources/js/Pages/Products/ResetStock.vue:49](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L49) | v-if="destination"; :href="route(destination)" | v-if="preview.blocked" → v-if="blockers.length" → v-for="[key, label, destination] in blockers" |
| View current reset — [resources/js/Pages/Products/ResetStock.vue:55](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L55) | v-if="pendingRun"; :href="route('products.stock-reset.show', pendingRun)" | v-if="preview.blocked" |
| Reset stock to zero — [resources/js/Pages/Products/ResetStock.vue:63](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L63) | variant="danger"; type="submit"; :disabled="form.processing \|\| form.confirmation !== 'ZERO STOCK'" | v-else |
| Refresh preview — [resources/js/Pages/Products/ResetStock.vue:67](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L67) | :href="route('products.stock-reset.preview')" | No ancestor condition |
| Cancel — [resources/js/Pages/Products/ResetStock.vue:68](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L68) | :href="route('products.index')" | No ancestor condition |

**Script endpoint names:** `products.stock-reset.store`. Match these to verb/path/permission in the route annex.



<a id="e0025"></a>

> Audit provenance: `inventory.md` lines 807–829. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Products/ResetStockStatus

GET /products/stock-reset/status/{public_id}; admin + manage_stock. Read-only pending/running/completed/failed, summary counts, reset reference, reason, finish date/error recovery. Poll only run prop every 3000ms while pending/running. Failed run links new preview, all states link inventory.

Source: [resources/js/Pages/Products/ResetStockStatus.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStockStatus.vue#L1).

**Input fields:** none in this page/component template.


**Read fields, columns and section headings:**

- dt: t(`stockReset.${label}`) — [resources/js/Pages/Products/ResetStockStatus.vue:37](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStockStatus.vue#L37) — v-for="[label, count] in rows"
- dt: Reset reference — [resources/js/Pages/Products/ResetStockStatus.vue:41](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStockStatus.vue#L41)
- dt: Reason — [resources/js/Pages/Products/ResetStockStatus.vue:42](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStockStatus.vue#L42)
- dt: Date — [resources/js/Pages/Products/ResetStockStatus.vue:43](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStockStatus.vue#L43) — v-if="run.finished_at"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Inventory — [resources/js/Pages/Products/ResetStockStatus.vue:46](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStockStatus.vue#L46) | :href="route('products.index')" | No ancestor condition |
| Refresh preview — [resources/js/Pages/Products/ResetStockStatus.vue:47](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStockStatus.vue#L47) | v-if="run.status === 'failed'"; :href="route('products.stock-reset.preview')" | No ancestor condition |



<a id="e0026"></a>

> Audit provenance: `inventory.md` lines 830–960. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Products/Show

GET /products/{product}; view_products. Read-only detail includes stock/value tiles, name/SKU/type/description/notes/category/location, product and variant bins, sell/purchase prices and profit figures, alternate currencies, suppliers and cost history, variants with availability, BOM for kit/assembly, tracked batches/serials, images, barcode, QR, stock thresholds/status and activity history. Actions duplicate/edit/back, stock adjustment, label print, random/from-SKU barcode generation, QR sku/link toggle. BOM child form searches component_product_id and quantity default 1; excludes self and kit candidates client-side; add/edit/remove require product edit. Child tables and permissions below are normative. Product stock calculations use active variants and inherited prices.

Source: [resources/js/Pages/Products/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Products/Show.vue:62
const barcodeImage = ref(null);
// resources/js/Pages/Products/Show.vue:63
const barcodeTypeLabel = ref('');
// resources/js/Pages/Products/Show.vue:64
const barcodeLoading = ref(false);
// resources/js/Pages/Products/Show.vue:67
const qrMode = ref('sku');
// resources/js/Pages/Products/Show.vue:68
const qrImage = ref(null);
// resources/js/Pages/Products/Show.vue:69
const qrPayload = ref('');
// resources/js/Pages/Products/Show.vue:174
const variants = ref(props.product.variants || []);
// resources/js/Pages/Products/Show.vue:194
const components = ref(props.product.components || []);
// resources/js/Pages/Products/Show.vue:195
const showAddComponent = ref(false);
// resources/js/Pages/Products/Show.vue:196
const componentSearch = ref('');
// resources/js/Pages/Products/Show.vue:197
const componentSearchResults = ref([]);
// resources/js/Pages/Products/Show.vue:198
const componentSearching = ref(false);
// resources/js/Pages/Products/Show.vue:199
const newComponentQty = ref(1);
// resources/js/Pages/Products/Show.vue:200
const selectedComponent = ref(null);
// resources/js/Pages/Products/Show.vue:201
const editingComponentId = ref(null);
// resources/js/Pages/Products/Show.vue:202
const editingComponentQty = ref(1);
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| componentSearch — [resources/js/Pages/Products/Show.vue:678](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L678) | Search Product | text; '' | ; v-model="componentSearch"; type="text"; :placeholder="t('products.show.bom.searchPlaceholder')"; @input="searchComponents" | v-if="isKitOrAssembly" → v-if="showAddComponent" |
| newComponentQty — [resources/js/Pages/Products/Show.vue:705](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L705) | Quantity | number; 1 | ; v-model.number="newComponentQty"; type="number"; min="1" | v-if="isKitOrAssembly" → v-if="showAddComponent" |
| editingComponentQty — [resources/js/Pages/Products/Show.vue:745](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L745) | No explicit label / see context | number; 1 | v-model.number="editingComponentQty"; type="number"; min="1" | v-if="isKitOrAssembly" → v-if="components.length &gt; 0" → v-for="comp in components" → v-if="editingComponentId === comp.id" |

**Read fields, columns and section headings:**

- h3: product.display_name ?? product.name — [resources/js/Pages/Products/Show.vue:368](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L368)
- h4: Description — [resources/js/Pages/Products/Show.vue:381](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L381) — v-if="product.description"
- h4: Notes — [resources/js/Pages/Products/Show.vue:386](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L386) — v-if="product.notes"
- h4: Category — [resources/js/Pages/Products/Show.vue:392](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L392)
- h4: Location — [resources/js/Pages/Products/Show.vue:398](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L398)
- h4: Stock by location — [resources/js/Pages/Products/Show.vue:404](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L404) — v-if="locationBreakdown.length"
- h3: Pricing Information — [resources/js/Pages/Products/Show.vue:425](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L425)
- h4: Selling Price — [resources/js/Pages/Products/Show.vue:429](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L429)
- h4: Purchase Price — [resources/js/Pages/Products/Show.vue:438](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L438) — v-if="product.purchase_price"
- h4: Profit per Unit — [resources/js/Pages/Products/Show.vue:451](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L451) — v-if="product.purchase_price && product.price"
- h4: Profit Margin — [resources/js/Pages/Products/Show.vue:457](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L457) — v-if="product.purchase_price && product.price"
- h4: Total Profit in Stock — [resources/js/Pages/Products/Show.vue:463](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L463) — v-if="product.purchase_price && product.price"
- h4: Alternative Currencies — [resources/js/Pages/Products/Show.vue:472](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L472) — v-if="product.price_in_currencies && Object.keys(product.price_in_currencies).length &gt; 0"
- h3: Stock by location — [resources/js/Pages/Products/Show.vue:490](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L490) — v-if="product.has_variants && variantLocationBreakdown.length"
- th: SKU — [resources/js/Pages/Products/Show.vue:494](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L494) — v-if="product.has_variants && variantLocationBreakdown.length"
- th: Warehouse — [resources/js/Pages/Products/Show.vue:495](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L495) — v-if="product.has_variants && variantLocationBreakdown.length"
- th: Location — [resources/js/Pages/Products/Show.vue:496](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L496) — v-if="product.has_variants && variantLocationBreakdown.length"
- th: Stock — [resources/js/Pages/Products/Show.vue:497](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L497) — v-if="product.has_variants && variantLocationBreakdown.length"
- h3: Suppliers — [resources/js/Pages/Products/Show.vue:526](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L526)
- th: Supplier — [resources/js/Pages/Products/Show.vue:537](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L537) — v-if="productSuppliers.length &gt; 0"
- th: Supplier SKU — [resources/js/Pages/Products/Show.vue:538](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L538) — v-if="productSuppliers.length &gt; 0"
- th: Cost price — [resources/js/Pages/Products/Show.vue:539](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L539) — v-if="productSuppliers.length &gt; 0"
- th: Lead time (days) — [resources/js/Pages/Products/Show.vue:540](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L540) — v-if="productSuppliers.length &gt; 0"
- th: Min order qty — [resources/js/Pages/Products/Show.vue:541](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L541) — v-if="productSuppliers.length &gt; 0"
- h3: Supplier price history — [resources/js/Pages/Products/Show.vue:573](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L573) — v-if="priceHistory.length &gt; 0"
- th: Date — [resources/js/Pages/Products/Show.vue:579](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L579) — v-if="priceHistory.length &gt; 0"
- th: Supplier — [resources/js/Pages/Products/Show.vue:580](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L580) — v-if="priceHistory.length &gt; 0"
- th: Cost price — [resources/js/Pages/Products/Show.vue:581](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L581) — v-if="priceHistory.length &gt; 0"
- th: Source — [resources/js/Pages/Products/Show.vue:582](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L582) — v-if="priceHistory.length &gt; 0"
- th: By — [resources/js/Pages/Products/Show.vue:583](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L583) — v-if="priceHistory.length &gt; 0"
- h3: Product Variants — [resources/js/Pages/Products/Show.vue:616](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L616) — v-if="product.has_variants && variants.length &gt; 0"
- h3: Bill of Materials — [resources/js/Pages/Products/Show.vue:644](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L644) — v-if="isKitOrAssembly"
- h4: Add Component — [resources/js/Pages/Products/Show.vue:674](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L674) — v-if="isKitOrAssembly" → v-if="showAddComponent"
- th: Product — [resources/js/Pages/Products/Show.vue:726](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L726) — v-if="isKitOrAssembly" → v-if="components.length &gt; 0"
- th: SKU — [resources/js/Pages/Products/Show.vue:727](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L727) — v-if="isKitOrAssembly" → v-if="components.length &gt; 0"
- th: Qty Required — [resources/js/Pages/Products/Show.vue:728](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L728) — v-if="isKitOrAssembly" → v-if="components.length &gt; 0"
- th: Available Stock — [resources/js/Pages/Products/Show.vue:729](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L729) — v-if="isKitOrAssembly" → v-if="components.length &gt; 0"
- th: Actions — [resources/js/Pages/Products/Show.vue:730](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L730) — v-if="isKitOrAssembly" → v-if="components.length &gt; 0"
- h3: Product Images — [resources/js/Pages/Products/Show.vue:814](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L814)
- h3: Barcode — [resources/js/Pages/Products/Show.vue:825](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L825) — v-if="product.barcode \|\| product.sku"
- h3: QR Code — [resources/js/Pages/Products/Show.vue:870](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L870)
- h3: Stock Information — [resources/js/Pages/Products/Show.vue:903](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L903)
- h3: Status — [resources/js/Pages/Products/Show.vue:966](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L966)
- h3: Activity History — [resources/js/Pages/Products/Show.vue:995](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L995)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/Products/Show.vue:301](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L301) | :href="route('products.index')" | No ancestor condition |
| Inventory — [resources/js/Pages/Products/Show.vue:303](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L303) | :href="route('products.index')" | No ancestor condition |
| Duplicate — [resources/js/Pages/Products/Show.vue:312](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L312) | variant="secondary"; size="sm"; @click="duplicateProduct" | No ancestor condition |
| Edit — [resources/js/Pages/Products/Show.vue:316](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L316) | v-if="canVisit('products.edit')"; variant="default"; size="sm"; as="Link"; :href="route('products.edit', product.id)" | No ancestor condition |
| Back to Inventory — [resources/js/Pages/Products/Show.vue:320](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L320) | variant="secondary"; size="sm"; as="Link"; :href="route('products.index')" | No ancestor condition |
| Edit — [resources/js/Pages/Products/Show.vue:527](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L527) | v-if="(hasPermission('edit_products')) && canVisit('products.edit')"; variant="ghost"; size="sm"; as="Link"; :href="route('products.edit', product.id)" | No ancestor condition |
| supplier.name — [resources/js/Pages/Products/Show.vue:548](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L548) | v-if="canVisit('suppliers.show')"; :href="route('suppliers.show', supplier.id)" | v-if="productSuppliers.length &gt; 0" → v-for="supplier in productSuppliers" |
| Add supplier — [resources/js/Pages/Products/Show.vue:564](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L564) | v-if="(hasPermission('edit_products')) && canVisit('products.edit')"; :href="route('products.edit', product.id)" | v-else |
| PO {number} — [resources/js/Pages/Products/Show.vue:595](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L595) | v-if="entry.source === 'purchase_order' && entry.purchase_order_id && canVisit('purchase-orders.show')"; :href="route('purchase-orders.show', entry.purchase_order_id)" | v-if="priceHistory.length &gt; 0" → v-for="entry in priceHistory" |
| Add Component — [resources/js/Pages/Products/Show.vue:649](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L649) | variant="default"; size="sm"; @click="showAddComponent = !showAddComponent" | v-if="isKitOrAssembly" |
| Create Work Order — [resources/js/Pages/Products/Show.vue:666](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L666) | v-if="canVisit('work-orders.create')"; variant="default"; size="md"; as="Link"; :href="route('work-orders.create', { product_id: product.id })" | v-if="isKitOrAssembly" → v-if="product.type === 'assembly' && components.length &gt; 0" |
| result.name result.sku (Stock: {count}) — [resources/js/Pages/Products/Show.vue:687](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L687) | v-for="result in componentSearchResults"; :key="result.id"; type="button"; @click="selectComponent(result)" | v-if="isKitOrAssembly" → v-if="showAddComponent" → v-if="componentSearchResults.length &gt; 0" |
| Add — [resources/js/Pages/Products/Show.vue:712](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L712) | type="button"; variant="default"; @click="addComponent"; :disabled="!selectedComponent" | v-if="isKitOrAssembly" → v-if="showAddComponent" |
| Cancel — [resources/js/Pages/Products/Show.vue:715](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L715) | type="button"; variant="secondary"; @click="showAddComponent = false" | v-if="isKitOrAssembly" → v-if="showAddComponent" |
| comp.component?.name \|\| Unknown — [resources/js/Pages/Products/Show.vue:736](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L736) | :href="route('products.show', comp.component?.id \|\| comp.component_product_id)" | v-if="isKitOrAssembly" → v-if="components.length &gt; 0" → v-for="comp in components" |
| Save — [resources/js/Pages/Products/Show.vue:767](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L767) | @click="saveComponentQty(comp)" | v-if="isKitOrAssembly" → v-if="components.length &gt; 0" → v-for="comp in components" → v-if="editingComponentId === comp.id" |
| Cancel — [resources/js/Pages/Products/Show.vue:768](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L768) | @click="editingComponentId = null" | v-if="isKitOrAssembly" → v-if="components.length &gt; 0" → v-for="comp in components" → v-if="editingComponentId === comp.id" |
| Edit — [resources/js/Pages/Products/Show.vue:771](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L771) | @click="startEditComponent(comp)" | v-if="isKitOrAssembly" → v-if="components.length &gt; 0" → v-for="comp in components" → v-else |
| Remove — [resources/js/Pages/Products/Show.vue:772](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L772) | @click="removeComponent(comp)" | v-if="isKitOrAssembly" → v-if="components.length &gt; 0" → v-for="comp in components" → v-else |
| Print Barcodes — [resources/js/Pages/Products/Show.vue:843](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L843) | variant="default"; @click="printBarcode" | v-if="product.barcode \|\| product.sku" → v-else-if="barcodeImage" |
| Generate New Random — [resources/js/Pages/Products/Show.vue:849](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L849) | variant="secondary"; @click="generateRandomBarcode" | v-if="product.barcode \|\| product.sku" → v-else-if="barcodeImage" |
| Generate from SKU — [resources/js/Pages/Products/Show.vue:852](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L852) | variant="secondary"; @click="generateFromSKU" | v-if="product.barcode \|\| product.sku" → v-else-if="barcodeImage" |
| Generate Barcode — [resources/js/Pages/Products/Show.vue:860](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L860) | variant="default"; @click="generateRandomBarcode" | v-if="product.barcode \|\| product.sku" → v-else |
| option.label — [resources/js/Pages/Products/Show.vue:872](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L872) | v-for="option in [{ value: 'sku', label: t('products.show.qrModeSku') }, { value: 'url', label: t('products.show.qrModeUrl') }]"; :key="option.value"; type="button"; role="radio"; :aria-checked="qrMode === option.value"; @click="qrMode = option.value" | No ancestor condition |
| Print QR Label — [resources/js/Pages/Products/Show.vue:894](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L894) | variant="secondary"; @click="printQrLabel" | No ancestor condition |
| View reservations — [resources/js/Pages/Products/Show.vue:933](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L933) | v-if="canVisit('reservations.index')"; :href="route('reservations.index', { product_id: product.id })" | v-if="stockAvailability" → v-if="stockAvailability.reserved &gt; 0" |

**Script endpoint names:** `products.qr.generate`, `products.qr.print`, `products.barcode.generate`, `products.barcode.print`, `products.barcode.generate-random`, `products.barcode.generate-from-sku`, `products.index`, `products.components.store`, `products.components.update`, `products.components.destroy`, `products.duplicate`. Match these to verb/path/permission in the route annex.



<a id="e0046"></a>

> Audit provenance: `inventory.md` lines 2054–2109. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/BarcodeScannerModal

Camera/manual modes, manualCode, camera status/error, product/variant/location result summaries. Emits product-found/location-found or raw code-scanned; close stops camera. Manual submit trims code; camera default. Distinguish not-found/401/failure.

Source: [resources/js/Components/BarcodeScannerModal.vue:1](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Components/BarcodeScannerModal.vue:22
const manualCode = ref('');
// resources/js/Components/BarcodeScannerModal.vue:23
const isLoading = ref(false);
// resources/js/Components/BarcodeScannerModal.vue:24
const scannerEnabled = ref(false);
// resources/js/Components/BarcodeScannerModal.vue:25
const errorMessage = ref('');
// resources/js/Components/BarcodeScannerModal.vue:26
const foundProduct = ref(null);
// resources/js/Components/BarcodeScannerModal.vue:29
const foundVariant = ref(null);
// resources/js/Components/BarcodeScannerModal.vue:30
const foundLocation = ref(null);
// resources/js/Components/BarcodeScannerModal.vue:31
const scannerMode = ref('camera');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| manualCode — [resources/js/Components/BarcodeScannerModal.vue:200](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L200) | Enter Barcode or SKU | text; '' | ; v-model="manualCode"; type="text"; :placeholder="t('components.barcodeScanner.inputPlaceholder')"; @keyup.enter="submitManualCode" | v-if="show" → v-else |

**Read fields, columns and section headings:**

- h3: Scan barcode to find product — [resources/js/Components/BarcodeScannerModal.vue:139](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L139) — v-if="show"
- h4: Product Found — [resources/js/Components/BarcodeScannerModal.vue:236](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L236) — v-if="show" → v-if="foundProduct"
- dt: Name : — [resources/js/Components/BarcodeScannerModal.vue:239](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L239) — v-if="show" → v-if="foundProduct"
- dt: Variant : — [resources/js/Components/BarcodeScannerModal.vue:243](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L243) — v-if="show" → v-if="foundProduct" → v-if="foundVariant"
- dt: SKU: — [resources/js/Components/BarcodeScannerModal.vue:247](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L247) — v-if="show" → v-if="foundProduct"
- dt: Stock : — [resources/js/Components/BarcodeScannerModal.vue:251](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L251) — v-if="show" → v-if="foundProduct"
- h4: Location Found — [resources/js/Components/BarcodeScannerModal.vue:265](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L265) — v-if="show" → v-if="foundLocation"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| (icon-only; accessible label/title in attributes) — [resources/js/Components/BarcodeScannerModal.vue:142](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L142) | @click="close" | v-if="show" |
| Camera — [resources/js/Components/BarcodeScannerModal.vue:153](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L153) | @click="toggleMode" | v-if="show" |
| Manual Entry — [resources/js/Components/BarcodeScannerModal.vue:168](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L168) | @click="toggleMode" | v-if="show" |
| Lookup — [resources/js/Components/BarcodeScannerModal.vue:207](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L207) | @click="submitManualCode"; :disabled="!manualCode.trim() \|\| isLoading" | v-if="show" → v-else |
| Select Product — [resources/js/Components/BarcodeScannerModal.vue:255](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L255) | @click="selectProduct" | v-if="show" → v-if="foundProduct" |
| View Products Here — [resources/js/Components/BarcodeScannerModal.vue:272](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L272) | :href="foundLocation.products_url" | v-if="show" → v-if="foundLocation" |

**Script endpoint names:** `barcode.lookup`. Match these to verb/path/permission in the route annex.



<a id="e0047"></a>

> Audit provenance: `inventory.md` lines 2110–2164. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/BatchList

Product detail batch-tracking child. Add form blank defaults; list batch_number/quantity/manufactured_date/expiry_date/notes with expiration indication. Optional batch number/date/notes omitted when blank; quantity integer parsed. Add POST products/{id}/batches then unshift response locally and emit batch-created. No batch edit/delete UI.

Source: [resources/js/Components/BatchList.vue:1](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Components/BatchList.vue:24
const localBatches = ref([...props.batches]);
// resources/js/Components/BatchList.vue:25
const showForm = ref(false);
// resources/js/Components/BatchList.vue:26
const loading = ref(false);
// resources/js/Components/BatchList.vue:27
const error = ref(null);
// resources/js/Components/BatchList.vue:29
const form = ref({
    batch_number: '',
    quantity: '',
    manufactured_date: '',
    expiry_date: '',
    notes: '',
});
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.batch_number — [resources/js/Components/BatchList.vue:115](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L115) | Batch Number (auto-generated if empty) | text; '' | ; v-model="form.batch_number"; type="text"; placeholder="BATCH-20260312-0001" | v-if="showForm" |
| form.quantity — [resources/js/Components/BatchList.vue:124](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L124) | Quantity * | number; '' | ; v-model="form.quantity"; type="number"; min="0"; required | v-if="showForm" |
| form.manufactured_date — [resources/js/Components/BatchList.vue:134](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L134) | Manufactured Date | date; '' | ; v-model="form.manufactured_date"; type="date" | v-if="showForm" |
| form.expiry_date — [resources/js/Components/BatchList.vue:142](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L142) | Expiry Date | date; '' | ; v-model="form.expiry_date"; type="date" | v-if="showForm" |
| form.notes — [resources/js/Components/BatchList.vue:151](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L151) | Notes | textarea; '' | ; v-model="form.notes"; rows="2" | v-if="showForm" |

**Read fields, columns and section headings:**

- h3: Batch Tracking — [resources/js/Components/BatchList.vue:93](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L93)
- th: Batch # — [resources/js/Components/BatchList.vue:171](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L171) — v-if="localBatches.length &gt; 0"
- th: Qty — [resources/js/Components/BatchList.vue:172](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L172) — v-if="localBatches.length &gt; 0"
- th: Manufactured — [resources/js/Components/BatchList.vue:173](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L173) — v-if="localBatches.length &gt; 0"
- th: Expiry — [resources/js/Components/BatchList.vue:174](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L174) — v-if="localBatches.length &gt; 0"
- th: Notes — [resources/js/Components/BatchList.vue:175](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L175) — v-if="localBatches.length &gt; 0"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| showForm ? Cancel : Add Batch — [resources/js/Components/BatchList.vue:96](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L96) | @click="showForm = !showForm" | No ancestor condition |
| loading ? Creating... : Create Batch — [resources/js/Components/BatchList.vue:157](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L157) | @click="createBatch"; :disabled="loading \|\| !form.quantity" | v-if="showForm" |

**Script endpoint names:** `products.batches.store`. Match these to verb/path/permission in the route annex.



<a id="e0048"></a>

> Audit provenance: `inventory.md` lines 2165–2226. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/SerialList

Product detail serial-tracking child. Filter buttons all/status counts (transferred/written_off only when present). Add fields serial_number/status/notes. Row actions mark sold/reserved/available where offered; terminal statuses read-only. API is authoritative for illegal transitions; reload not assumed.

Source: [resources/js/Components/SerialList.vue:1](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Components/SerialList.vue:21
const localSerials = ref([...props.serials]);
// resources/js/Components/SerialList.vue:22
const showForm = ref(false);
// resources/js/Components/SerialList.vue:23
const loading = ref(false);
// resources/js/Components/SerialList.vue:24
const error = ref(null);
// resources/js/Components/SerialList.vue:25
const statusFilter = ref('all');
// resources/js/Components/SerialList.vue:27
const form = ref({
    serial_number: '',
    status: 'available',
    notes: '',
});
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.serial_number — [resources/js/Components/SerialList.vue:162](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L162) | Serial Number * | text; '' | ; v-model="form.serial_number"; type="text"; required; placeholder="e.g. SN-2026-00001" | v-if="showForm" |
| form.status — [resources/js/Components/SerialList.vue:172](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L172) | Status | select; 'available' | ; v-model="form.status" | v-if="showForm" |
| form.notes — [resources/js/Components/SerialList.vue:185](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L185) | Notes | textarea; '' | ; v-model="form.notes"; rows="2" | v-if="showForm" |

**Select options and labels (exact source, including remote lists):**

- form.status ([resources/js/Components/SerialList.vue:172](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L172)): `&lt;option value="available"&gt;{{ Available }}&lt;/option&gt; &lt;option value="sold"&gt;{{ Sold }}&lt;/option&gt; &lt;option value="reserved"&gt;{{ Reserved }}&lt;/option&gt; &lt;option value="damaged"&gt;{{ Damaged }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: Serial Number Tracking — [resources/js/Components/SerialList.vue:112](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L112)
- th: Serial # — [resources/js/Components/SerialList.vue:205](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L205) — v-if="filteredSerials.length &gt; 0"
- th: Status — [resources/js/Components/SerialList.vue:206](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L206) — v-if="filteredSerials.length &gt; 0"
- th: Notes — [resources/js/Components/SerialList.vue:207](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L207) — v-if="filteredSerials.length &gt; 0"
- th: Actions — [resources/js/Components/SerialList.vue:208](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L208) — v-if="filteredSerials.length &gt; 0"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| showForm ? Cancel : Add Serial — [resources/js/Components/SerialList.vue:115](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L115) | @click="showForm = !showForm" | No ancestor condition |
| All ( localSerials.length ) — [resources/js/Components/SerialList.vue:128](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L128) | @click="statusFilter = 'all'" | v-if="localSerials.length &gt; 0" |
| status === 'written_off' ? Written off : t(`components.serialList.statuses.${status}`) ( count ) — [resources/js/Components/SerialList.vue:139](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L139) | v-for="(count, status) in statusCounts"; :key="status"; @click="statusFilter = status" | v-if="localSerials.length &gt; 0" |
| loading ? Creating... : Create Serial — [resources/js/Components/SerialList.vue:191](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L191) | @click="createSerial"; :disabled="loading \|\| !form.serial_number" | v-if="showForm" |
| Sold — [resources/js/Components/SerialList.vue:227](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L227) | v-if="serial.status === 'available'"; @click="updateStatus(serial, 'sold')"; :title="t('components.serialList.markAsSold')" | v-if="filteredSerials.length &gt; 0" → v-for="serial in filteredSerials" → v-else |
| Reserve — [resources/js/Components/SerialList.vue:235](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L235) | v-if="serial.status === 'available'"; @click="updateStatus(serial, 'reserved')"; :title="t('components.serialList.markAsReserved')" | v-if="filteredSerials.length &gt; 0" → v-for="serial in filteredSerials" → v-else |
| Damaged — [resources/js/Components/SerialList.vue:243](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L243) | v-if="serial.status !== 'damaged'"; @click="updateStatus(serial, 'damaged')"; :title="t('components.serialList.markAsDamaged')" | v-if="filteredSerials.length &gt; 0" → v-for="serial in filteredSerials" → v-else |
| Available — [resources/js/Components/SerialList.vue:251](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L251) | v-if="serial.status !== 'available'"; @click="updateStatus(serial, 'available')"; :title="t('components.serialList.markAsAvailable')" | v-if="filteredSerials.length &gt; 0" → v-for="serial in filteredSerials" → v-else |

**Script endpoint names:** `products.serials.store`, `products.serials.update`. Match these to verb/path/permission in the route annex.



<a id="e0049"></a>

> Audit provenance: `inventory.md` lines 2227–2283. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/ProductVariantManager

Child options editor: option name and comma-separated values, add value by Enter, remove option/value, generate combinations. Grid variant title/SKU/price/stock/active. New variant defaults documented above; options limited 3, displayed variant-limit warning at >2048. Existing stock readonly when lockExistingStock true. Empty own price inherits parent.

Source: [resources/js/Components/ProductVariantManager.vue:1](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Components/ProductVariantManager.vue:42
const options = ref(props.modelValue.options || []);
// resources/js/Components/ProductVariantManager.vue:43
const variants = ref(props.modelValue.variants || []);
// resources/js/Components/ProductVariantManager.vue:44
const showAddOption = ref(false);
// resources/js/Components/ProductVariantManager.vue:45
const newOptionName = ref('');
// resources/js/Components/ProductVariantManager.vue:46
const newOptionValues = ref('');
// resources/js/Components/ProductVariantManager.vue:47
const editingVariant = ref(null);
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| (unbound) — [resources/js/Components/ProductVariantManager.vue:265](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L265) | No explicit label / see context | text; See :value / :checked and event handler; not a v-model field | type="text"; :placeholder="t('components.variantManager.addValuePlaceholder')"; :disabled="disabled"; @keyup.enter="addValueToOption(optIndex, $event.target.value); $event.target.value = ''" | v-if="options.length &gt; 0" → v-for="(option, optIndex) in options" |
| newOptionName — [resources/js/Components/ProductVariantManager.vue:283](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L283) | Option Name | text; '' | ; v-model="newOptionName"; type="text"; :placeholder="t('components.variantManager.optionNamePlaceholder')"; :disabled="disabled" | v-if="showAddOption && canAddOption" |
| newOptionValues — [resources/js/Components/ProductVariantManager.vue:295](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L295) | Option Values (comma-separated) | text; '' | ; v-model="newOptionValues"; type="text"; :placeholder="t('components.variantManager.optionValuesPlaceholder')"; :disabled="disabled" | v-if="showAddOption && canAddOption" |
| (unbound) — [resources/js/Components/ProductVariantManager.vue:384](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L384) | No explicit label / see context | text; See :value / :checked and event handler; not a v-model field | :value="variant.sku"; @input="updateVariant(index, 'sku', $event.target.value)"; type="text"; :placeholder="t('components.variantManager.autoGenerate')"; :disabled="disabled" | v-if="hasOptions && !exceedsVariantLimit" → v-for="(variant, index) in variants" |
| (unbound) — [resources/js/Components/ProductVariantManager.vue:398](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L398) | No explicit label / see context | number; See :value / :checked and event handler; not a v-model field | :value="variant.price"; @input="updateVariant(index, 'price', $event.target.value ? parseFloat($event.target.value) : null)"; type="number"; step="0.01"; :placeholder="productPrice?.toString() \|\| '0.00'"; :disabled="disabled" | v-if="hasOptions && !exceedsVariantLimit" → v-for="(variant, index) in variants" |
| (unbound) — [resources/js/Components/ProductVariantManager.vue:410](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L410) | No explicit label / see context | number; See :value / :checked and event handler; not a v-model field | :value="variant.stock"; @input="updateVariant(index, 'stock', parseInt($event.target.value) \|\| 0)"; type="number"; min="0"; :disabled="disabled"; :readonly="lockExistingStock && !!variant.id"; :title="lockExistingStock && variant.id ? t('products.edit.variantStockReadOnlyHint') : undefined" | v-if="hasOptions && !exceedsVariantLimit" → v-for="(variant, index) in variants" |
| (unbound) — [resources/js/Components/ProductVariantManager.vue:423](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L423) |  | checkbox; See :value / :checked and event handler; not a v-model field | type="checkbox"; :checked="variant.is_active"; @change="updateVariant(index, 'is_active', $event.target.checked)"; :disabled="disabled" | v-if="hasOptions && !exceedsVariantLimit" → v-for="(variant, index) in variants" |

**Read fields, columns and section headings:**

- h4: Product Options — [resources/js/Components/ProductVariantManager.vue:216](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L216)
- h4: Variants ( variants.length ) — [resources/js/Components/ProductVariantManager.vue:349](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L349) — v-if="hasOptions && !exceedsVariantLimit"
- th: Variant — [resources/js/Components/ProductVariantManager.vue:359](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L359) — v-if="hasOptions && !exceedsVariantLimit"
- th: SKU — [resources/js/Components/ProductVariantManager.vue:362](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L362) — v-if="hasOptions && !exceedsVariantLimit"
- th: Price — [resources/js/Components/ProductVariantManager.vue:365](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L365) — v-if="hasOptions && !exceedsVariantLimit"
- th: Stock — [resources/js/Components/ProductVariantManager.vue:368](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L368) — v-if="hasOptions && !exceedsVariantLimit"
- th: Active — [resources/js/Components/ProductVariantManager.vue:371](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L371) — v-if="hasOptions && !exceedsVariantLimit"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| (icon-only; accessible label/title in attributes) — [resources/js/Components/ProductVariantManager.vue:233](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L233) | type="button"; @click="removeOption(optIndex)"; :disabled="disabled" | v-if="options.length &gt; 0" → v-for="(option, optIndex) in options" |
| (icon-only; accessible label/title in attributes) — [resources/js/Components/ProductVariantManager.vue:252](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L252) | type="button"; @click="removeValueFromOption(optIndex, valIndex)"; :disabled="disabled" | v-if="options.length &gt; 0" → v-for="(option, optIndex) in options" → v-for="(value, valIndex) in option.values" |
| Add Option — [resources/js/Components/ProductVariantManager.vue:304](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L304) | type="button"; @click="addOption"; :disabled="disabled \|\| !newOptionName \|\| !newOptionValues" | v-if="showAddOption && canAddOption" |
| Cancel — [resources/js/Components/ProductVariantManager.vue:312](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L312) | type="button"; @click="showAddOption = false; newOptionName = ''; newOptionValues = ''" | v-if="showAddOption && canAddOption" |
| Add Option (e.g., Size, Color) — [resources/js/Components/ProductVariantManager.vue:324](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L324) | v-if="!showAddOption && canAddOption"; type="button"; @click="showAddOption = true"; :disabled="disabled" | No ancestor condition |
| Enable All — [resources/js/Components/ProductVariantManager.vue:440](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L440) | type="button"; @click="bulkUpdateVariants('is_active', true)"; :disabled="disabled" | v-if="hasOptions && !exceedsVariantLimit" |
| Disable All — [resources/js/Components/ProductVariantManager.vue:448](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L448) | type="button"; @click="bulkUpdateVariants('is_active', false)"; :disabled="disabled" | v-if="hasOptions && !exceedsVariantLimit" |



<a id="e0052"></a>

> Audit provenance: `inventory.md` lines 2378–2416. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/SKUGeneratorModal

QuickAddModal with preset selection buttons, customPattern input, variables/pattern preview, generate/apply/close. customPattern and selectedPattern mutually clear. API payload pattern/product_name/category_id; apply emits SKU and closes, never saves parent product itself.

Source: [resources/js/Components/SKUGeneratorModal.vue:1](C:/Users/proj/Inventoros/resources/js/Components/SKUGeneratorModal.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Components/SKUGeneratorModal.vue:28
const skuPatterns = ref({ variables: [], presets: [] });
// resources/js/Components/SKUGeneratorModal.vue:29
const selectedPattern = ref('');
// resources/js/Components/SKUGeneratorModal.vue:30
const customPattern = ref('');
// resources/js/Components/SKUGeneratorModal.vue:31
const skuPreview = ref('');
// resources/js/Components/SKUGeneratorModal.vue:32
const skuGenerating = ref(false);
// resources/js/Components/SKUGeneratorModal.vue:33
const loading = ref(false);
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| customPattern — [resources/js/Components/SKUGeneratorModal.vue:151](C:/Users/proj/Inventoros/resources/js/Components/SKUGeneratorModal.vue#L151) | Custom Pattern | text; '' | ; v-model="customPattern"; @input="onCustomPatternInput"; type="text"; :placeholder="t('components.skuGenerator.patternExample', { example: '{category}-{year}-{number}' })" | Always within this view/dialog; see component visibility |

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| preset.name preset.example — [resources/js/Components/SKUGeneratorModal.vue:119](C:/Users/proj/Inventoros/resources/js/Components/SKUGeneratorModal.vue#L119) | v-for="preset in skuPatterns.presets"; :key="preset.pattern"; type="button"; @click="selectPreset(preset)" | No ancestor condition |
| Cancel — [resources/js/Components/SKUGeneratorModal.vue:183](C:/Users/proj/Inventoros/resources/js/Components/SKUGeneratorModal.vue#L183) | type="button"; @click="close" | No ancestor condition |
| Apply SKU — [resources/js/Components/SKUGeneratorModal.vue:190](C:/Users/proj/Inventoros/resources/js/Components/SKUGeneratorModal.vue#L190) | type="button"; @click="applySKU"; :disabled="!skuPreview \|\| skuPreview === t('components.skuGenerator.previewError')" | No ancestor condition |

**Script endpoint names:** `sku.patterns`, `sku.generate`. Match these to verb/path/permission in the route annex.



<a id="e0055"></a>

> Audit provenance: `inventory.md` lines 2479–2497. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/VariantsTable

Read-only variant title/barcode/SKU/effective price/status with optional per-variant adjustment child; availability prop adds reserved/available. Summary counts variants and total stock. Parent showStockAdjust permission controls mutator presence.

Source: [resources/js/Components/VariantsTable.vue:1](C:/Users/proj/Inventoros/resources/js/Components/VariantsTable.vue#L1).

**Input fields:** none in this page/component template.


**Read fields, columns and section headings:**

- th: Variant — [resources/js/Components/VariantsTable.vue:70](C:/Users/proj/Inventoros/resources/js/Components/VariantsTable.vue#L70)
- th: SKU — [resources/js/Components/VariantsTable.vue:73](C:/Users/proj/Inventoros/resources/js/Components/VariantsTable.vue#L73)
- th: Price — [resources/js/Components/VariantsTable.vue:76](C:/Users/proj/Inventoros/resources/js/Components/VariantsTable.vue#L76)
- th: Stock — [resources/js/Components/VariantsTable.vue:79](C:/Users/proj/Inventoros/resources/js/Components/VariantsTable.vue#L79)
- th: Reserved — [resources/js/Components/VariantsTable.vue:82](C:/Users/proj/Inventoros/resources/js/Components/VariantsTable.vue#L82)
- th: Available — [resources/js/Components/VariantsTable.vue:85](C:/Users/proj/Inventoros/resources/js/Components/VariantsTable.vue#L85)
- th: Status — [resources/js/Components/VariantsTable.vue:88](C:/Users/proj/Inventoros/resources/js/Components/VariantsTable.vue#L88)



<a id="e0056"></a>

> Audit provenance: `inventory.md` lines 2498–2517. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/BarcodeScanner

Camera engine only, no application form fields. Lazy html5-qrcode load; rear camera, fps 10, scan debounce 1500ms, enable/disable watcher, stop/clear on unmount; emits started/stopped/scan/error.

Source: [resources/js/Components/BarcodeScanner.vue:1](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScanner.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Components/BarcodeScanner.vue:29
const html5QrCode = ref(null);
// resources/js/Components/BarcodeScanner.vue:30
const isScanning = ref(false);
// resources/js/Components/BarcodeScanner.vue:31
const lastScanTime = ref(0);
```

**Input fields:** none in this page/component template.




<a id="e0059"></a>

> Audit provenance: `inventory.md` lines 2531–2614. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Product/StoreProductRequest.php

Source [app/Http/Requests/Product/StoreProductRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Product/StoreProductRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Product;
6: 
7: use App\Enums\BarcodeType;
8: use App\Http\Requests\Concerns\ValidatesProductSuppliers;
9: use App\Rules\BarcodeMatchesType;
10: use Illuminate\Foundation\Http\FormRequest;
11: use Illuminate\Validation\Rule;
12: 
13: /**
14:  * Validates a new product created through the web (Inertia) surface.
15:  *
16:  * Rules are unchanged from the previous inline validation in
17:  * Inventory\ProductController::store, including the
18:  * `product_store_validation_rules` plugin filter so plugins can still adjust
19:  * the ruleset.
20:  */
21: final class StoreProductRequest extends FormRequest
22: {
23:     use ValidatesProductSuppliers;
24: 
25:     /**
26:      * @return array<string, mixed>
27:      */
28:     public function rules(): array
29:     {
30:         $organizationId = $this->user()->organization_id;
31: 
32:         // Hook: Modify validation rules before validation
33:         return apply_filters('product_store_validation_rules', [
34:             'type' => 'sometimes|string|in:standard,kit,assembly',
35:             'sku' => ['required', 'string', 'max:255', Rule::unique('products', 'sku')->where('organization_id', $organizationId)],
36:             'name' => 'required|string|max:255',
37:             'description' => 'nullable|string',
38:             'price' => 'required|numeric|min:0',
39:             'purchase_price' => 'nullable|numeric|min:0',
40:             'currency' => 'required|string|max:3',
41:             'price_in_currencies' => 'nullable|array',
42:             'price_in_currencies.*.currency' => 'required|string|max:3',
43:             'price_in_currencies.*.price' => 'required|numeric|min:0',
44:             'stock' => 'required|integer|min:0',
45:             'min_stock' => 'required|integer|min:0',
46:             'max_stock' => 'nullable|integer|min:0',
47:             'reorder_point' => 'nullable|integer|min:0',
48:             'reorder_quantity' => 'nullable|integer|min:0',
49:             'barcode' => ['nullable', 'string', 'max:255', new BarcodeMatchesType($this->input('barcode_type'))],
50:             'barcode_type' => ['nullable', Rule::enum(BarcodeType::class)],
51:             'notes' => 'nullable|string',
52:             'category_id' => ['nullable', Rule::exists('product_categories', 'id')->where('organization_id', $organizationId)],
53:             'location_id' => ['nullable', Rule::exists('product_locations', 'id')->where('organization_id', $organizationId)],
54:             'is_active' => 'boolean',
55:             'images' => 'nullable|array|max:5',
56:             'images.*.file' => 'nullable',
57:             'images.*.preview' => 'nullable|string',
58:             'images.*.name' => 'nullable|string',
59:             'has_variants' => 'boolean',
60:             'tracking_type' => 'nullable|string|in:none,batch,serial',
61:             'options' => 'nullable|array|max:3',
62:             'options.*.name' => 'required_with:options|string|max:255',
63:             'options.*.values' => 'required_with:options|array|min:1',
64:             'options.*.values.*' => 'string|max:255',
65:             'variants' => 'nullable|array',
66:             'variants.*.option_values' => 'required_with:variants|array',
67:             'variants.*.sku' => 'nullable|string|max:255',
68:             'variants.*.barcode' => 'nullable|string|max:255',
69:             'variants.*.price' => 'nullable|numeric|min:0',
70:             'variants.*.purchase_price' => 'nullable|numeric|min:0',
71:             'variants.*.stock' => 'nullable|integer|min:0',
72:             'variants.*.min_stock' => 'nullable|integer|min:0',
73:             'variants.*.is_active' => 'boolean',
74:         ] + $this->productSupplierRules($organizationId), $this);
75:     }
76: }
77: 
```



<a id="e0060"></a>

> Audit provenance: `inventory.md` lines 2615–2702. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Product/UpdateProductRequest.php

Source [app/Http/Requests/Product/UpdateProductRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Product/UpdateProductRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Product;
6: 
7: use App\Enums\BarcodeType;
8: use App\Http\Requests\Concerns\ValidatesProductSuppliers;
9: use App\Models\Inventory\Product;
10: use App\Rules\BarcodeMatchesType;
11: use Illuminate\Foundation\Http\FormRequest;
12: use Illuminate\Validation\Rule;
13: 
14: /**
15:  * Validates a product edit through the web (Inertia) surface.
16:  *
17:  * Rules are unchanged from the previous inline validation in
18:  * Inventory\ProductController::update, including the
19:  * `product_update_validation_rules` plugin filter. The bound product is read
20:  * from the route so the SKU uniqueness rule can ignore it.
21:  */
22: final class UpdateProductRequest extends FormRequest
23: {
24:     use ValidatesProductSuppliers;
25: 
26:     /**
27:      * @return array<string, mixed>
28:      */
29:     public function rules(): array
30:     {
31:         $organizationId = $this->user()->organization_id;
32:         /** @var Product $product */
33:         $product = $this->route('product');
34: 
35:         // Hook: Modify validation rules
36:         return apply_filters('product_update_validation_rules', [
37:             'type' => 'sometimes|string|in:standard,kit,assembly',
38:             'sku' => ['required', 'string', 'max:255', Rule::unique('products', 'sku')->where('organization_id', $organizationId)->ignore($product->id)],
39:             'name' => 'required|string|max:255',
40:             'description' => 'nullable|string',
41:             'price' => 'required|numeric|min:0',
42:             'purchase_price' => 'nullable|numeric|min:0',
43:             // No `stock`: on-hand only moves through stock adjustments, so a
44:             // stale edit form cannot put sold units back. A submitted value is
45:             // dropped (ProductService::update ignores it too).
46:             'min_stock' => 'required|integer|min:0',
47:             'max_stock' => 'nullable|integer|min:0',
48:             'reorder_point' => 'nullable|integer|min:0',
49:             'reorder_quantity' => 'nullable|integer|min:0',
50:             'barcode' => ['nullable', 'string', 'max:255', new BarcodeMatchesType($this->exists('barcode_type') ? $this->input('barcode_type') : $product->barcode_type)],
51:             'barcode_type' => ['nullable', Rule::enum(BarcodeType::class)],
52:             'notes' => 'nullable|string',
53:             'category_id' => ['nullable', Rule::exists('product_categories', 'id')->where('organization_id', $organizationId)],
54:             'location_id' => ['nullable', Rule::exists('product_locations', 'id')->where('organization_id', $organizationId)],
55:             'is_active' => 'boolean',
56:             'images' => 'nullable|array|max:5',
57:             'images.*.file' => 'nullable',
58:             'images.*.preview' => 'nullable|string',
59:             'images.*.url' => 'nullable|string',
60:             'images.*.name' => 'nullable|string',
61:             'has_variants' => 'boolean',
62:             'tracking_type' => 'nullable|string|in:none,batch,serial',
63:             'options' => 'nullable|array|max:3',
64:             'options.*.id' => 'nullable|integer',
65:             'options.*.name' => 'required_with:options|string|max:255',
66:             'options.*.values' => 'required_with:options|array|min:1',
67:             'options.*.values.*' => 'string|max:255',
68:             'variants' => 'nullable|array',
69:             'variants.*.id' => 'nullable|integer',
70:             'variants.*.option_values' => 'required_with:variants|array',
71:             'variants.*.sku' => 'nullable|string|max:255',
72:             'variants.*.barcode' => 'nullable|string|max:255',
73:             'variants.*.price' => 'nullable|numeric|min:0',
74:             'variants.*.purchase_price' => 'nullable|numeric|min:0',
75:             'variants.*.stock' => 'nullable|integer|min:0',
76:             'variants.*.min_stock' => 'nullable|integer|min:0',
77:             'variants.*.is_active' => 'boolean',
78:         ] + $this->productSupplierRules($organizationId), $product, $this);
79:     }
80: }
81: 
```



<a id="e0076"></a>

> Audit provenance: `inventory.md` lines 3426–3474. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### BatchTrackingController.php — 38-79

Source [app/Http/Controllers/Api/BatchTrackingController.php:38](C:/Users/proj/Inventoros/app/Http/Controllers/Api/BatchTrackingController.php#L38)

```php
38:      * Create a new batch for a product.
39:      */
40:     public function store(Request $request, Product $product): JsonResponse
41:     {
42:         if ($product->organization_id !== $request->user()->organization_id) {
43:             return response()->json(['message' => 'Product not found'], 404);
44:         }
45: 
46:         if ($product->tracking_type !== TrackingType::BATCH) {
47:             return response()->json([
48:                 'message' => 'This product does not use batch tracking.',
49:                 'errors' => ['tracking_type' => ['This product does not use batch tracking.']],
50:             ], 422);
51:         }
52: 
53:         $validated = $request->validate([
54:             'batch_number' => ['nullable', 'string', 'max:255'],
55:             'quantity' => ['required', 'integer', 'min:0'],
56:             'manufactured_date' => ['nullable', 'date'],
57:             'expiry_date' => ['nullable', 'date', 'after_or_equal:manufactured_date'],
58:             'notes' => ['nullable', 'string'],
59:         ]);
60: 
61:         $organizationId = $request->user()->organization_id;
62: 
63:         // Auto-generate batch number if not provided
64:         if (empty($validated['batch_number'])) {
65:             $validated['batch_number'] = ProductBatch::generateBatchNumber($organizationId);
66:         }
67: 
68:         $validated['organization_id'] = $organizationId;
69:         $validated['product_id'] = $product->id;
70: 
71:         $batch = ProductBatch::create($validated);
72: 
73:         return response()->json([
74:             'message' => 'Batch created successfully',
75:             'data' => new ProductBatchResource($batch),
76:         ], 201);
77:     }
78: 
79:     /**
```



<a id="e0077"></a>

> Audit provenance: `inventory.md` lines 3475–3522. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### SerialTrackingController.php — 47-87

Source [app/Http/Controllers/Api/SerialTrackingController.php:47](C:/Users/proj/Inventoros/app/Http/Controllers/Api/SerialTrackingController.php#L47)

```php
47:     public function store(Request $request, Product $product): JsonResponse
48:     {
49:         if ($product->organization_id !== $request->user()->organization_id) {
50:             return response()->json(['message' => 'Product not found'], 404);
51:         }
52: 
53:         if ($product->tracking_type !== TrackingType::SERIAL) {
54:             return response()->json([
55:                 'message' => 'This product does not use serial tracking.',
56:                 'errors' => ['tracking_type' => ['This product does not use serial tracking.']],
57:             ], 422);
58:         }
59: 
60:         $organizationId = $request->user()->organization_id;
61: 
62:         $validated = $request->validate([
63:             'serial_number' => [
64:                 'required',
65:                 'string',
66:                 'max:255',
67:                 Rule::unique('product_serials')->where(function ($query) use ($organizationId) {
68:                     return $query->where('organization_id', $organizationId);
69:                 }),
70:             ],
71:             'status' => ['nullable', 'string', Rule::in(ProductSerial::VALID_STATUSES)],
72:             'notes' => ['nullable', 'string'],
73:         ]);
74: 
75:         $validated['organization_id'] = $organizationId;
76:         $validated['product_id'] = $product->id;
77:         $validated['status'] = $validated['status'] ?? ProductSerial::STATUS_AVAILABLE;
78: 
79:         $serial = ProductSerial::create($validated);
80: 
81:         return response()->json([
82:             'message' => 'Serial number created successfully',
83:             'data' => new ProductSerialResource($serial),
84:         ], 201);
85:     }
86: 
87:     /**
```



<a id="e0078"></a>

> Audit provenance: `inventory.md` lines 3523–3607. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### SerialTrackingController.php — 117-202

Source [app/Http/Controllers/Api/SerialTrackingController.php:117](C:/Users/proj/Inventoros/app/Http/Controllers/Api/SerialTrackingController.php#L117)

```php
117: 
118:         $validated = $request->validate([
119:             'status' => ['required', 'string', Rule::in(ProductSerial::VALID_STATUSES)],
120:             'notes' => ['nullable', 'string'],
121:         ]);
122: 
123:         return DB::transaction(function () use ($serial, $validated) {
124:             // Lock and re-read so two concurrent requests can't both allocate
125:             // the same physical serial to different orders.
126:             $locked = ProductSerial::whereKey($serial->getKey())->lockForUpdate()->firstOrFail();
127: 
128:             // The unit now belongs to another organization: changing this row
129:             // back would count it in both.
130:             if ($locked->status === ProductSerial::STATUS_TRANSFERRED) {
131:                 return response()->json([
132:                     'message' => 'This serial number was transferred to another organization.',
133:                     'error' => 'transferred',
134:                 ], 409);
135:             }
136: 
137:             // A serial built into a product by a work order is part of that
138:             // work order's record; freeing it here would leave the unit
139:             // counted both inside the assembly and on the shelf.
140:             if ($locked->status === ProductSerial::STATUS_WRITTEN_OFF) {
141:                 return response()->json(['message' => 'This serial was written off by an administrator stock reset.', 'error' => 'written_off'], 409);
142:             }
143:             if ($locked->status === ProductSerial::STATUS_CONSUMED) {
144:                 return response()->json([
145:                     'message' => 'This serial was consumed by a work order and cannot change status.',
146:                     'error' => 'consumed',
147:                 ], 409);
148:             }
149: 
150:             $target = $validated['status'];
151: 
152:             // A serial held by a stock reservation stays available until its
153:             // owner consumes or releases the hold.
154:             if ($locked->status === ProductSerial::STATUS_AVAILABLE
155:                 && $target !== ProductSerial::STATUS_AVAILABLE
156:                 && app(StockReservationService::class)->isSerialHeld((int) $locked->id)) {
157:                 return response()->json([
158:                     'message' => 'This serial number is reserved. Release its reservation first.',
159:                     'error' => 'serial_reserved',
160:                 ], 409);
161:             }
162: 
163:             $allocating = in_array($target, [ProductSerial::STATUS_SOLD, ProductSerial::STATUS_RESERVED], true);
164:             $alreadyAllocated = in_array($locked->status, [ProductSerial::STATUS_SOLD, ProductSerial::STATUS_RESERVED], true);
165:             // reserved -> sold is the legitimate completion of a reservation.
166:             $completingReservation = $locked->status === ProductSerial::STATUS_RESERVED
167:                 && $target === ProductSerial::STATUS_SOLD;
168: 
169:             if ($allocating && $alreadyAllocated && ! $completingReservation) {
170:                 return response()->json([
171:                     'message' => 'This serial number is already allocated.',
172:                     'error' => 'already_allocated',
173:                 ], 409);
174:             }
175: 
176:             $locked->update($validated);
177: 
178:             // Moving a serial OUT of an allocated state (sold/reserved) frees it.
179:             // Clear the order-line pin so a stale link can't make release skip it
180:             // or let it be silently re-allocated to a second order. order_item_id
181:             // is not fillable, so it is cleared explicitly here.
182:             if ($alreadyAllocated && ! $allocating) {
183:                 $locked->order_item_id = null;
184:                 $locked->save();
185:             }
186: 
187:             return response()->json([
188:                 'message' => 'Serial number updated successfully',
189:                 'data' => new ProductSerialResource($locked),
190:             ]);
191:         });
192:     }
193: }
194: 
```



<a id="e0079"></a>

> Audit provenance: `inventory.md` lines 3608–3676. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductVariantController.php — 187-248

Source [app/Http/Controllers/Api/ProductVariantController.php:187](C:/Users/proj/Inventoros/app/Http/Controllers/Api/ProductVariantController.php#L187)

```php
187:     public function adjustStock(Request $request, Product $product, ProductVariant $variant, ApprovalService $approvals): JsonResponse
188:     {
189:         if ($product->organization_id !== $request->user()->organization_id) {
190:             return response()->json(['message' => 'Product not found', 'error' => 'not_found'], 404);
191:         }
192: 
193:         if ($variant->product_id !== $product->id) {
194:             return response()->json(['message' => 'Variant not found', 'error' => 'not_found'], 404);
195:         }
196: 
197:         $validated = $request->validate([
198:             'quantity' => ['required', 'integer'],
199:             'location_id' => ['nullable', 'integer', \Illuminate\Validation\Rule::exists('product_locations', 'id')->where('organization_id', $product->organization_id)->whereNull('deleted_at')],
200:             'type' => ['required', 'string', 'in:increase,decrease,recount,damage,return,received'],
201:             'reason' => ['nullable', 'string', 'max:255'],
202:             'notes' => ['nullable', 'string'],
203:         ]);
204: 
205:         $locationId = isset($validated['location_id']) ? (int) $validated['location_id'] : $product->location_id;
206:         app(WarehouseAccessService::class)->authorizeLocation($request->user(), $locationId);
207: 
208:         // Applied now, or held for approval (202) when the organization's
209:         // approval rules cover it: the same path every other manual
210:         // adjustment surface takes.
211:         try {
212:             $adjustment = $approvals->submitStockAdjustment(
213:                 user: $request->user(),
214:                 product: $product,
215:                 variant: $variant,
216:                 quantity: (int) $validated['quantity'],
217:                 type: $validated['type'],
218:                 reason: $validated['reason'] ?? null,
219:                 notes: $validated['notes'] ?? null,
220:                 locationId: $locationId,
221:             );
222:         } catch (InsufficientStockException $e) {
223:             return response()->json([
224:                 'message' => $e->getMessage(),
225:                 'errors' => ['quantity' => [$e->getMessage()]],
226:             ], 422);
227:         }
228: 
229:         if ($adjustment instanceof StockAdjustmentRequest) {
230:             return response()->json([
231:                 'message' => 'Stock adjustment submitted for approval; stock changes once it is approved',
232:                 'status' => 'pending_approval',
233:                 'data' => new ProductVariantResource($variant->refresh()),
234:                 'request' => $approvals->describe(ApprovalService::STOCK_ADJUSTMENT, $adjustment->load(['product', 'variant', 'requester'])),
235:             ], 202);
236:         }
237: 
238:         $variant->refresh();
239: 
240:         return response()->json([
241:             'message' => 'Stock adjusted successfully',
242:             'data' => new ProductVariantResource($variant),
243:             'adjustment' => [
244:                 'id' => $adjustment->id,
245:                 'quantity_before' => $adjustment->quantity_before,
246:                 'quantity_after' => $adjustment->quantity_after,
247:                 'adjustment_quantity' => $adjustment->adjustment_quantity,
248:             ],
```



<a id="e0080"></a>

> Audit provenance: `inventory.md` lines 3677–3723. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### InventoryResetController.php — 19-58

Source [app/Http/Controllers/Inventory/InventoryResetController.php:19](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/InventoryResetController.php#L19)

```php
19:     {
20:         $preview = $reset->preview($request->user());
21:         $token = (string) Str::uuid();
22:         $request->session()->put('stock_reset_preview', [
23:             'token' => $token, 'signature' => $preview['signature'], 'organization_id' => $request->user()->organization_id,
24:             'expires' => now()->addMinutes(10)->timestamp,
25:         ]);
26: 
27:         return Inertia::render('Products/ResetStock', [
28:             'preview' => $preview, 'token' => $token, 'organizationName' => $request->user()->organization->name,
29:             'pendingRun' => InventoryResetRun::where('organization_id', $request->user()->organization_id)
30:                 ->whereIn('status', ['pending', 'running'])->value('public_id'),
31:         ]);
32:     }
33: 
34:     public function store(Request $request, InventoryResetService $reset)
35:     {
36:         $data = $request->validate([
37:             'token' => ['required', 'uuid'], 'confirmation' => ['required', Rule::in(['ZERO STOCK'])],
38:             'password' => ['required', 'current_password'], 'reason' => ['required', 'string', 'min:3', 'max:500'],
39:         ]);
40:         $preview = $request->session()->get('stock_reset_preview');
41:         if (! $preview || ! hash_equals($preview['token'], $data['token'])
42:             || (int) $preview['organization_id'] !== (int) $request->user()->organization_id || $preview['expires'] <= now()->timestamp) {
43:             throw ValidationException::withMessages(['reset' => 'stockReset.errors.expired']);
44:         }
45:         $run = $reset->queue($request->user(), $preview['signature'], $data['reason']);
46:         $request->session()->forget('stock_reset_preview');
47: 
48:         return redirect()->route('products.stock-reset.show', $run->public_id);
49:     }
50: 
51:     public function show(Request $request, InventoryResetRun $resetRun)
52:     {
53:         abort_unless((int) $resetRun->organization_id === (int) $request->user()->organization_id, 404);
54: 
55:         return Inertia::render('Products/ResetStockStatus', ['run' => $resetRun->only([
56:             'public_id', 'status', 'counts', 'reason', 'error_code', 'created_at', 'finished_at',
57:         ])]);
58:     }
```



<a id="e0082"></a>

> Audit provenance: `inventory.md` lines 3859–3977. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### BulkProductController.php — 29-140

Source [app/Http/Controllers/Inventory/BulkProductController.php:29](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/BulkProductController.php#L29)

```php
29:     public function bulkDelete(Request $request)
30:     {
31:         $validated = $request->validate([
32:             'ids' => 'required|array|min:1',
33:             'ids.*' => 'integer|exists:products,id',
34:         ]);
35: 
36:         $organizationId = $request->user()->organization_id;
37: 
38:         $products = Product::forOrganization($organizationId)
39:             ->whereIn('id', $validated['ids'])
40:             ->get();
41:         $count = $products->count();
42: 
43:         // One model at a time, so each deletion fires product_deleted (and is
44:         // logged) like a single delete does.
45:         DB::transaction(fn () => $products->each->delete());
46: 
47:         return redirect()->route('products.index')
48:             ->with('success', "{$count} product(s) deleted successfully.");
49:     }
50: 
51:     /**
52:      * Bulk update category for selected products.
53:      *
54:      * @return RedirectResponse
55:      */
56:     public function bulkUpdateCategory(Request $request)
57:     {
58:         $organizationId = $request->user()->organization_id;
59: 
60:         $validated = $request->validate([
61:             'ids' => 'required|array|min:1',
62:             'ids.*' => 'integer|exists:products,id',
63:             // Org-scope the category like every other FK reference, so a user
64:             // can't point their products at another organization's category
65:             // (which then leaks that category's name into their lists/exports).
66:             'category_id' => ['required', 'integer', Rule::exists('product_categories', 'id')->where('organization_id', $organizationId)],
67:         ]);
68: 
69:         $products = Product::forOrganization($organizationId)
70:             ->whereIn('id', $validated['ids'])
71:             ->get();
72:         $count = $products->count();
73: 
74:         // Saved model by model so each change fires product_updated.
75:         DB::transaction(fn () => $products->each->update(['category_id' => $validated['category_id']]));
76: 
77:         return redirect()->route('products.index')
78:             ->with('success', "{$count} product(s) category updated successfully.");
79:     }
80: 
81:     /**
82:      * Bulk update price for selected products.
83:      *
84:      * Supports percentage (multiply) and fixed (add/subtract) adjustments.
85:      *
86:      * @return RedirectResponse
87:      */
88:     public function bulkUpdatePrice(Request $request)
89:     {
90:         $validated = $request->validate([
91:             'ids' => 'required|array|min:1',
92:             'ids.*' => 'integer|exists:products,id',
93:             'type' => 'required|in:percentage,fixed',
94:             'value' => 'required|numeric',
95:         ]);
96: 
97:         $organizationId = $request->user()->organization_id;
98: 
99:         $products = Product::forOrganization($organizationId)
100:             ->whereIn('id', $validated['ids'])
101:             ->get();
102: 
103:         DB::transaction(function () use ($products, $validated) {
104:             foreach ($products as $product) {
105:                 $currentPrice = (float) $product->price;
106: 
107:                 if ($validated['type'] === 'percentage') {
108:                     $newPrice = $currentPrice * (1 + ($validated['value'] / 100));
109:                 } else {
110:                     $newPrice = $currentPrice + $validated['value'];
111:                 }
112: 
113:                 // Ensure price does not go below zero
114:                 $product->price = max(0, round($newPrice, 2));
115:                 $product->save();
116:             }
117:         });
118: 
119:         return redirect()->route('products.index')
120:             ->with('success', "{$products->count()} product(s) price updated successfully.");
121:     }
122: 
123:     /**
124:      * Bulk export selected products as CSV.
125:      */
126:     public function bulkExport(Request $request): StreamedResponse
127:     {
128:         $validated = $request->validate([
129:             'ids' => 'required|array|min:1',
130:             'ids.*' => 'integer|exists:products,id',
131:         ]);
132: 
133:         $organizationId = $request->user()->organization_id;
134: 
135:         $products = Product::with(['category', 'location'])
136:             ->forOrganization($organizationId)
137:             ->whereIn('id', $validated['ids'])
138:             ->get();
139: 
140:         $headers = [
```



<a id="e0083"></a>

> Audit provenance: `inventory.md` lines 3978–4081. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### SKUController.php — 1

Source [app/Http/Controllers/Inventory/SKUController.php:1](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/SKUController.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Controllers\Inventory;
6: 
7: use App\Http\Controllers\Controller;
8: use App\Services\SKUGeneratorService;
9: use Illuminate\Http\Request;
10: 
11: /**
12:  * Controller for SKU generation and validation.
13:  *
14:  * Handles generating unique SKUs based on patterns,
15:  * checking SKU uniqueness, and retrieving available patterns.
16:  */
17: class SKUController extends Controller
18: {
19:     /**
20:      * @var SKUGeneratorService The SKU generator service instance
21:      */
22:     protected $skuGenerator;
23: 
24:     /**
25:      * Create a new controller instance.
26:      *
27:      * @param SKUGeneratorService $skuGenerator The SKU generator service instance
28:      */
29:     public function __construct(SKUGeneratorService $skuGenerator)
30:     {
31:         $this->skuGenerator = $skuGenerator;
32:     }
33: 
34:     /**
35:      * Generate SKU based on pattern.
36:      *
37:      * @param Request $request The incoming HTTP request containing pattern data
38:      * @return \Illuminate\Http\JsonResponse
39:      */
40:     public function generate(Request $request)
41:     {
42:         $request->validate([
43:             'pattern' => 'required|string',
44:             'product_name' => 'nullable|string',
45:             'category_id' => 'nullable|integer',
46:         ]);
47: 
48:         $sku = $this->skuGenerator->generateUnique(
49:             $request->pattern,
50:             $request->user()->organization_id,
51:             $request->product_name,
52:             $request->category_id
53:         );
54: 
55:         return response()->json([
56:             'sku' => $sku,
57:         ]);
58:     }
59: 
60:     /**
61:      * Check if SKU is unique.
62:      *
63:      * @param Request $request The incoming HTTP request containing SKU to check
64:      * @return \Illuminate\Http\JsonResponse
65:      */
66:     public function checkUnique(Request $request)
67:     {
68:         $request->validate([
69:             'sku' => 'required|string',
70:             'product_id' => 'nullable|integer',
71:         ]);
72: 
73:         $isUnique = $this->skuGenerator->isUnique(
74:             $request->sku,
75:             $request->user()->organization_id,
76:             $request->product_id
77:         );
78: 
79:         return response()->json([
80:             'unique' => $isUnique,
81:         ]);
82:     }
83: 
84:     /**
85:      * Get available patterns.
86:      *
87:      * @return \Illuminate\Http\JsonResponse
88:      */
89:     public function patterns()
90:     {
91:         return response()->json([
92:             'variables' => SKUGeneratorService::getAvailablePatterns(),
93:             'presets' => SKUGeneratorService::getPresetPatterns(),
94:         ]);
95:     }
96: }
97: 
```



<a id="e0094"></a>

> Audit provenance: `inventory.md` lines 4654–4729. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Product
[app/Models/Inventory/Product.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/Product.php#L1)

```php
92:     protected $fillable = [
93:         'organization_id',
94:         'type',
95:         'sku',
96:         'name',
97:         'description',
98:         'price',
99:         'selling_price',
100:         'currency',
101:         'price_in_currencies',
102:         'purchase_price',
103:         'stock',
104:         'min_stock',
105:         'max_stock',
106:         'reorder_point',
107:         'reorder_quantity',
108:         'barcode',
109:         'barcode_type',
110:         'notes',
111:         'image',
112:         'images',
113:         'image_disks',
114:         'thumbnail',
115:         'category_id',
116:         'location_id',
117:         'is_active',
118:         'has_variants',
119:         'tracking_type',
120:         'metadata',
121:     ];
140:     protected function casts(): array
141:     {
142:         return [
143:             'price' => 'decimal:2',
144:             'selling_price' => 'decimal:2',
145:             'purchase_price' => 'decimal:2',
146:             'stock' => 'integer',
147:             // Selected by withEffectiveStock(); SUM() is a string on MySQL.
148:             'effective_stock' => 'integer',
149:             'min_stock' => 'integer',
150:             'max_stock' => 'integer',
151:             'reorder_point' => 'integer',
152:             'reorder_quantity' => 'integer',
153:             'is_active' => 'boolean',
154:             'has_variants' => 'boolean',
155:             'tracking_type' => TrackingType::class,
156:             'metadata' => 'array',
157:             'price_in_currencies' => 'array',
158:             'images' => 'array',
159:             'image_disks' => 'array',
160:         ];
168:     public function organization(): BelongsTo
170:         return $this->belongsTo(Organization::class);
192:     public function category(): BelongsTo
194:         return $this->belongsTo(ProductCategory::class, 'category_id');
202:     public function location(): BelongsTo
204:         return $this->belongsTo(ProductLocation::class, 'location_id');
213:     public function locationStocks(): HasMany
215:         return $this->hasMany(ProductLocationStock::class);
223:     public function warehouseReorderPoints(): HasMany
225:         return $this->hasMany(WarehouseReorderPoint::class);
235:         return $this->hasMany(StockAdjustment::class)->latest();
243:     public function suppliers(): BelongsToMany
245:         return $this->belongsToMany(Supplier::class, 'product_supplier')
266:     public function supplierPriceHistory(): HasMany
268:         return $this->hasMany(SupplierPriceHistory::class)->latest('recorded_at')->latest('id');
276:     public function batches(): HasMany
278:         return $this->hasMany(ProductBatch::class)->latest();
286:     public function serials(): HasMany
288:         return $this->hasMany(ProductSerial::class)->latest();
```



<a id="e0097"></a>

> Audit provenance: `inventory.md` lines 4787–4806. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductOption
[app/Models/Inventory/ProductOption.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/ProductOption.php#L1)

```php
33:     protected $fillable = [
34:         'product_id',
35:         'name',
36:         'position',
37:         'values',
38:     ];
45:     protected function casts(): array
46:     {
47:         return [
48:             'values' => 'array',
49:             'position' => 'integer',
50:         ];
58:     public function product(): BelongsTo
60:         return $this->belongsTo(Product::class);
```



<a id="e0098"></a>

> Audit provenance: `inventory.md` lines 4807–4855. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductVariant
[app/Models/Inventory/ProductVariant.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/ProductVariant.php#L1)

```php
59:     protected $fillable = [
60:         'product_id',
61:         'organization_id',
62:         'sku',
63:         'barcode',
64:         'title',
65:         'option_values',
66:         'price',
67:         'purchase_price',
68:         'compare_at_price',
69:         'stock',
70:         'min_stock',
71:         'image',
72:         'weight',
73:         'weight_unit',
74:         'is_active',
75:         'requires_shipping',
76:         'position',
77:         'metadata',
78:     ];
85:     protected function casts(): array
86:     {
87:         return [
88:             'option_values' => 'array',
89:             'price' => 'decimal:2',
90:             'purchase_price' => 'decimal:2',
91:             'compare_at_price' => 'decimal:2',
92:             'stock' => 'integer',
93:             'min_stock' => 'integer',
94:             'weight' => 'decimal:3',
95:             'is_active' => 'boolean',
96:             'requires_shipping' => 'boolean',
97:             'position' => 'integer',
98:             'metadata' => 'array',
99:         ];
107:     public function product(): BelongsTo
109:         return $this->belongsTo(Product::class);
117:     public function organization(): BelongsTo
119:         return $this->belongsTo(Organization::class);
122:     public function locationStocks(): HasMany
124:         return $this->hasMany(VariantLocationStock::class, 'product_variant_id');
132:     public function stockAdjustments(): HasMany
134:         return $this->hasMany(StockAdjustment::class, 'product_variant_id')->latest();
```



<a id="e0102"></a>

> Audit provenance: `inventory.md` lines 4919–4944. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductBatch
[app/Models/Inventory/ProductBatch.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/ProductBatch.php#L1)

```php
42:     protected $fillable = [
43:         'organization_id',
44:         'product_id',
45:         'batch_number',
46:         'quantity',
47:         'manufactured_date',
48:         'expiry_date',
49:         'notes',
50:     ];
57:     protected function casts(): array
58:     {
59:         return [
60:             'quantity' => 'integer',
61:             'manufactured_date' => 'date',
62:             'expiry_date' => 'date',
63:         ];
71:     public function organization(): BelongsTo
73:         return $this->belongsTo(Organization::class);
81:     public function product(): BelongsTo
83:         return $this->belongsTo(Product::class);
```



<a id="e0103"></a>

> Audit provenance: `inventory.md` lines 4945–4974. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductSerial
[app/Models/Inventory/ProductSerial.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/ProductSerial.php#L1)

```php
33:     public const STATUS_AVAILABLE = 'available';
36:     public const STATUS_WRITTEN_OFF = 'written_off';
38:     public const STATUS_SOLD = 'sold';
40:     public const STATUS_RESERVED = 'reserved';
42:     public const STATUS_DAMAGED = 'damaged';
51:     public const STATUS_TRANSFERRED = 'transferred';
58:     public const STATUS_CONSUMED = 'consumed';
60:     public const VALID_STATUSES = [
61:         self::STATUS_AVAILABLE,
62:         self::STATUS_SOLD,
63:         self::STATUS_RESERVED,
64:         self::STATUS_DAMAGED,
65:     ];
72:     protected $fillable = [
73:         'organization_id',
74:         'product_id',
75:         'serial_number',
76:         'status',
77:         'notes',
78:     ];
90:     public function organization(): BelongsTo
92:         return $this->belongsTo(Organization::class);
100:     public function product(): BelongsTo
102:         return $this->belongsTo(Product::class);
```



<a id="e0115"></a>

> Audit provenance: `inventory.md` lines 5352–5361. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### InventoryResetRun
[app/Models/Inventory/InventoryResetRun.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/InventoryResetRun.php#L1)

```php
11:     protected $guarded = ['id'];
13:     protected function casts(): array
14:     {
15:         return ['counts' => 'array', 'started_at' => 'datetime', 'finished_at' => 'datetime'];
```



<a id="e0117"></a>

> Audit provenance: `inventory.md` lines 5578–5607. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_10_12_034201_create_products_table.php
[database/migrations/2025_10_12_034201_create_products_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_10_12_034201_create_products_table.php#L1)

```php
27:             Schema::create('products', function (Blueprint $table) {
28:                 $table->id();
29:                 $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
30:                 $table->string('sku')->unique();
31:                 $table->string('name');
32:                 $table->text('description')->nullable();
33:                 $table->decimal('price', 10, 2)->default(0);
34:                 $table->decimal('cost', 10, 2)->nullable();
35:                 $table->integer('stock')->default(0);
36:                 $table->integer('min_stock')->default(0);
37:                 $table->integer('max_stock')->nullable();
38:                 $table->string('barcode')->nullable();
39:                 $table->string('image')->nullable();
40:                 $table->foreignId('category_id')->nullable()->constrained('product_categories')->nullOnDelete();
41:                 $table->foreignId('location_id')->nullable()->constrained('product_locations')->nullOnDelete();
42:                 $table->boolean('is_active')->default(true);
43:                 $table->json('metadata')->nullable();
44:                 $table->timestamps();
45:                 $table->softDeletes();
47:                 $table->index(['organization_id', 'sku']);
48:                 $table->index('category_id');
49:                 $table->index('location_id');
50:                 $table->index('is_active');
51:                 $table->index('barcode');
```



<a id="e0120"></a>

> Audit provenance: `inventory.md` lines 5647–5657. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_10_13_015319_add_currency_support_to_products_and_organizations.php
[database/migrations/2025_10_13_015319_add_currency_support_to_products_and_organizations.php:1](C:/Users/proj/Inventoros/database/migrations/2025_10_13_015319_add_currency_support_to_products_and_organizations.php#L1)

```php
21:         Schema::table('products', function (Blueprint $table) {
22:             $table->string('currency', 3)->default('USD')->after('price');
23:             $table->json('price_in_currencies')->nullable()->after('currency');
36:         Schema::table('products', function (Blueprint $table) {
37:             $table->dropColumn(['currency', 'price_in_currencies']);
```



<a id="e0121"></a>

> Audit provenance: `inventory.md` lines 5658–5667. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_10_13_020934_add_notes_to_products_table.php
[database/migrations/2025_10_13_020934_add_notes_to_products_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_10_13_020934_add_notes_to_products_table.php#L1)

```php
14:         Schema::table('products', function (Blueprint $table) {
15:             $table->text('notes')->nullable()->after('barcode');
24:         Schema::table('products', function (Blueprint $table) {
25:             $table->dropColumn('notes');
```



<a id="e0122"></a>

> Audit provenance: `inventory.md` lines 5668–5679. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_10_13_023000_add_purchase_price_to_products_table.php
[database/migrations/2025_10_13_023000_add_purchase_price_to_products_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_10_13_023000_add_purchase_price_to_products_table.php#L1)

```php
14:         Schema::table('products', function (Blueprint $table) {
16:             $table->renameColumn('cost', 'purchase_price');
20:             $table->decimal('selling_price', 10, 2)->nullable()->after('price');
29:         Schema::table('products', function (Blueprint $table) {
30:             $table->renameColumn('purchase_price', 'cost');
31:             $table->dropColumn('selling_price');
```



<a id="e0124"></a>

> Audit provenance: `inventory.md` lines 5703–5713. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_10_13_213806_add_images_to_products_table.php
[database/migrations/2025_10_13_213806_add_images_to_products_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_10_13_213806_add_images_to_products_table.php#L1)

```php
14:         Schema::table('products', function (Blueprint $table) {
15:             $table->json('images')->nullable()->after('image'); // Array of image paths
16:             $table->text('thumbnail')->nullable()->after('images'); // Thumbnail image path
25:         Schema::table('products', function (Blueprint $table) {
26:             $table->dropColumn(['images', 'thumbnail']);
```



<a id="e0125"></a>

> Audit provenance: `inventory.md` lines 5714–5728. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_12_28_000001_create_product_options_table.php
[database/migrations/2025_12_28_000001_create_product_options_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_12_28_000001_create_product_options_table.php#L1)

```php
14:         Schema::create('product_options', function (Blueprint $table) {
15:             $table->id();
16:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
17:             $table->string('name'); // e.g., "Size", "Color", "Material"
18:             $table->integer('position')->default(0); // Display order
19:             $table->json('values'); // e.g., ["Small", "Medium", "Large"]
20:             $table->timestamps();
22:             $table->index(['product_id', 'position']);
23:             $table->unique(['product_id', 'name']);
```



<a id="e0126"></a>

> Audit provenance: `inventory.md` lines 5729–5760. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_12_28_000002_create_product_variants_table.php
[database/migrations/2025_12_28_000002_create_product_variants_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_12_28_000002_create_product_variants_table.php#L1)

```php
14:         Schema::create('product_variants', function (Blueprint $table) {
15:             $table->id();
16:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
17:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
18:             $table->string('sku')->nullable();
19:             $table->string('barcode')->nullable();
20:             $table->string('title')->nullable(); // e.g., "Small / Red" - auto-generated from options
21:             $table->json('option_values'); // e.g., {"Size": "Small", "Color": "Red"}
22:             $table->decimal('price', 10, 2)->nullable(); // Override product price
23:             $table->decimal('purchase_price', 10, 2)->nullable(); // Override product cost
24:             $table->decimal('compare_at_price', 10, 2)->nullable(); // Original price for discounts
25:             $table->integer('stock')->default(0);
26:             $table->integer('min_stock')->default(0);
27:             $table->string('image')->nullable(); // Variant-specific image
28:             $table->decimal('weight', 10, 3)->nullable(); // Weight in default unit
29:             $table->string('weight_unit', 10)->default('kg'); // kg, lb, oz, g
30:             $table->boolean('is_active')->default(true);
31:             $table->boolean('requires_shipping')->default(true);
32:             $table->integer('position')->default(0); // Display order
33:             $table->json('metadata')->nullable();
34:             $table->timestamps();
35:             $table->softDeletes();
37:             $table->index(['organization_id', 'sku']);
38:             $table->index(['product_id', 'position']);
39:             $table->index('barcode');
40:             $table->index('is_active');
```



<a id="e0127"></a>

> Audit provenance: `inventory.md` lines 5761–5770. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_12_28_000003_add_has_variants_to_products_table.php
[database/migrations/2025_12_28_000003_add_has_variants_to_products_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_12_28_000003_add_has_variants_to_products_table.php#L1)

```php
14:         Schema::table('products', function (Blueprint $table) {
15:             $table->boolean('has_variants')->default(false)->after('is_active');
24:         Schema::table('products', function (Blueprint $table) {
25:             $table->dropColumn('has_variants');
```



<a id="e0130"></a>

> Audit provenance: `inventory.md` lines 5795–5804. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_03_12_000001_add_tracking_type_to_products_table.php
[database/migrations/2026_03_12_000001_add_tracking_type_to_products_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_03_12_000001_add_tracking_type_to_products_table.php#L1)

```php
14:         Schema::table('products', function (Blueprint $table) {
15:             $table->string('tracking_type', 10)->default('none')->after('has_variants');
24:         Schema::table('products', function (Blueprint $table) {
25:             $table->dropColumn('tracking_type');
```



<a id="e0131"></a>

> Audit provenance: `inventory.md` lines 5805–5822. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_03_12_000002_create_product_batches_table.php
[database/migrations/2026_03_12_000002_create_product_batches_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_03_12_000002_create_product_batches_table.php#L1)

```php
14:         Schema::create('product_batches', function (Blueprint $table) {
15:             $table->id();
16:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
17:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
18:             $table->string('batch_number');
19:             $table->integer('quantity')->default(0);
20:             $table->date('manufactured_date')->nullable();
21:             $table->date('expiry_date')->nullable();
22:             $table->text('notes')->nullable();
23:             $table->timestamps();
25:             $table->index(['organization_id', 'product_id']);
26:             $table->index('batch_number');
```



<a id="e0132"></a>

> Audit provenance: `inventory.md` lines 5823–5839. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_03_12_000003_create_product_serials_table.php
[database/migrations/2026_03_12_000003_create_product_serials_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_03_12_000003_create_product_serials_table.php#L1)

```php
14:         Schema::create('product_serials', function (Blueprint $table) {
15:             $table->id();
16:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
17:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
18:             $table->string('serial_number');
19:             $table->string('status', 20)->default('available');
20:             $table->text('notes')->nullable();
21:             $table->timestamps();
23:             $table->unique(['organization_id', 'serial_number']);
24:             $table->index(['organization_id', 'product_id']);
25:             $table->index('status');
```



<a id="e0140"></a>

> Audit provenance: `inventory.md` lines 6021–6031. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_07_25_000002_add_order_item_id_to_product_serials.php
[database/migrations/2026_07_25_000002_add_order_item_id_to_product_serials.php:1](C:/Users/proj/Inventoros/database/migrations/2026_07_25_000002_add_order_item_id_to_product_serials.php#L1)

```php
19:         Schema::table('product_serials', function (Blueprint $table) {
20:             $table->foreignId('order_item_id')
26:             $table->index('order_item_id');
32:         Schema::table('product_serials', function (Blueprint $table) {
33:             $table->dropConstrainedForeignId('order_item_id');
```



<a id="e0143"></a>

> Audit provenance: `inventory.md` lines 6052–6061. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_09_27_000002_add_barcode_type_to_products_table.php
[database/migrations/2026_09_27_000002_add_barcode_type_to_products_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_09_27_000002_add_barcode_type_to_products_table.php#L1)

```php
16:         Schema::table('products', function (Blueprint $table) {
17:             $table->string('barcode_type', 16)->nullable()->after('barcode');
23:         Schema::table('products', function (Blueprint $table) {
24:             $table->dropColumn('barcode_type');
```



<a id="e0155"></a>

> Audit provenance: `inventory.md` lines 6244–6253. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_24_000001_index_batch_expiry_by_organization.php
[database/migrations/2026_10_24_000001_index_batch_expiry_by_organization.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_24_000001_index_batch_expiry_by_organization.php#L1)

```php
13:         Schema::table('product_batches', function (Blueprint $table): void {
14:             $table->index(['organization_id', 'expiry_date'], 'product_batches_org_expiry_index');
20:         Schema::table('product_batches', function (Blueprint $table): void {
21:             $table->dropIndex('product_batches_org_expiry_index');
```



<a id="e0156"></a>

> Audit provenance: `inventory.md` lines 6254–6273. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_26_000001_create_inventory_reset_runs.php
[database/migrations/2026_10_26_000001_create_inventory_reset_runs.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_26_000001_create_inventory_reset_runs.php#L1)

```php
18:         Schema::create('inventory_reset_runs', function (Blueprint $table): void {
19:             $table->id();
20:             $table->uuid('public_id')->unique();
21:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
22:             $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
23:             $table->string('status', 20)->default('pending');
24:             $table->string('signature', 64);
25:             $table->string('reason', 500);
26:             $table->json('counts');
27:             $table->string('error_code')->nullable();
28:             $table->timestamp('started_at')->nullable();
29:             $table->timestamp('finished_at')->nullable();
30:             $table->timestamps();
31:             $table->index(['organization_id', 'status']);
```



<a id="e0476"></a>

> Audit provenance: `additional-contracts.md` lines 69–144. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/Product/StoreProductRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/Product/StoreProductRequest.php#L1). SHA-256: `14c27022f640f9bec84aea019ffb1e61779baa5351779ec0b2e9e040e7e40192`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\Product;
6: 
7: use App\Enums\BarcodeType;
8: use App\Http\Requests\Concerns\ValidatesProductSuppliers;
9: use App\Rules\BarcodeMatchesType;
10: use Illuminate\Foundation\Http\FormRequest;
11: use Illuminate\Validation\Rule;
12: 
13: /**
14:  * Validates a new product via the REST API. Rules unchanged from the previous
15:  * inline validation in Api\ProductController::store.
16:  */
17: final class StoreProductRequest extends FormRequest
18: {
19:     use ValidatesProductSuppliers;
20: 
21:     /**
22:      * @return array<string, mixed>
23:      */
24:     public function rules(): array
25:     {
26:         $organizationId = $this->user()->organization_id;
27: 
28:         return [
29:             'sku' => ['required', 'string', 'max:255'],
30:             'name' => ['required', 'string', 'max:255'],
31:             'description' => ['nullable', 'string'],
32:             'price' => ['nullable', 'numeric', 'min:0'],
33:             'selling_price' => ['nullable', 'numeric', 'min:0'],
34:             'purchase_price' => ['nullable', 'numeric', 'min:0'],
35:             'currency' => ['nullable', 'string', 'max:3'],
36:             'stock' => ['nullable', 'integer', 'min:0'],
37:             'min_stock' => ['nullable', 'integer', 'min:0'],
38:             'max_stock' => ['nullable', 'integer', 'min:0'],
39:             'barcode' => ['nullable', 'string', 'max:255', new BarcodeMatchesType($this->input('barcode_type'))],
40:             'barcode_type' => ['nullable', Rule::enum(BarcodeType::class)],
41:             'notes' => ['nullable', 'string'],
42:             'category_id' => ['nullable', 'integer', Rule::exists('product_categories', 'id')->where('organization_id', $organizationId)],
43:             'location_id' => ['nullable', 'integer', Rule::exists('product_locations', 'id')->where('organization_id', $organizationId)],
44:             'is_active' => ['nullable', 'boolean'],
45:             'tracking_type' => ['nullable', 'string', 'in:none,batch,serial'],
46:             'metadata' => ['nullable', 'array'],
47: 
48:             // Variants, options, and base64 images are processed by
49:             // ProductService (shared with the web surface).
50:             'images' => ['nullable', 'array', 'max:5'],
51:             'images.*.preview' => ['nullable', 'string'],
52:             'images.*.name' => ['nullable', 'string'],
53:             'has_variants' => ['boolean'],
54:             'options' => ['nullable', 'array', 'max:3'],
55:             'options.*.name' => ['required_with:options', 'string', 'max:255'],
56:             'options.*.values' => ['required_with:options', 'array', 'min:1'],
57:             'options.*.values.*' => ['string', 'max:255'],
58:             'variants' => ['nullable', 'array'],
59:             'variants.*.option_values' => ['required_with:variants', 'array'],
60:             'variants.*.sku' => ['nullable', 'string', 'max:255'],
61:             'variants.*.barcode' => ['nullable', 'string', 'max:255'],
62:             'variants.*.price' => ['nullable', 'numeric', 'min:0'],
63:             'variants.*.purchase_price' => ['nullable', 'numeric', 'min:0'],
64:             'variants.*.stock' => ['nullable', 'integer', 'min:0'],
65:             'variants.*.min_stock' => ['nullable', 'integer', 'min:0'],
66:             'variants.*.is_active' => ['boolean'],
67:         ] + $this->productSupplierRules($organizationId);
68:     }
69: }
```



<a id="e0477"></a>

> Audit provenance: `additional-contracts.md` lines 145–245. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/Product/UpdateProductRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/Product/UpdateProductRequest.php#L1). SHA-256: `9e6d92fce3ba319cbd82ce9f2e4e5d8cdbf80a520d46ccd1868177f067273804`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\Product;
6: 
7: use App\Enums\BarcodeType;
8: use App\Http\Requests\Concerns\ValidatesProductSuppliers;
9: use App\Rules\BarcodeMatchesType;
10: use App\Services\ProductService;
11: use Illuminate\Foundation\Http\FormRequest;
12: use Illuminate\Validation\Rule;
13: 
14: /**
15:  * Validates a product update via the REST API. Rules unchanged from the
16:  * previous inline validation in Api\ProductController::update (sku/name are
17:  * `sometimes`).
18:  */
19: final class UpdateProductRequest extends FormRequest
20: {
21:     use ValidatesProductSuppliers;
22: 
23:     /**
24:      * @return array<string, mixed>
25:      */
26:     public function rules(): array
27:     {
28:         $organizationId = $this->user()->organization_id;
29: 
30:         return [
31:             'sku' => ['sometimes', 'string', 'max:255'],
32:             'name' => ['sometimes', 'string', 'max:255'],
33:             'description' => ['nullable', 'string'],
34:             'price' => ['nullable', 'numeric', 'min:0'],
35:             'selling_price' => ['nullable', 'numeric', 'min:0'],
36:             'purchase_price' => ['nullable', 'numeric', 'min:0'],
37:             'currency' => ['nullable', 'string', 'max:3'],
38:             // On-hand stock only moves through the audited ledger; a product
39:             // edit that wrote it straight to the row could put sold units back.
40:             'stock' => ['prohibited'],
41:             'min_stock' => ['nullable', 'integer', 'min:0'],
42:             'max_stock' => ['nullable', 'integer', 'min:0'],
43:             'barcode' => ['nullable', 'string', 'max:255', new BarcodeMatchesType($this->exists('barcode_type') ? $this->input('barcode_type') : $this->route('product')?->barcode_type)],
44:             'barcode_type' => ['nullable', Rule::enum(BarcodeType::class)],
45:             'notes' => ['nullable', 'string'],
46:             'category_id' => ['nullable', 'integer', Rule::exists('product_categories', 'id')->where('organization_id', $organizationId)],
47:             'location_id' => ['nullable', 'integer', Rule::exists('product_locations', 'id')->where('organization_id', $organizationId)],
48:             'is_active' => ['nullable', 'boolean'],
49:             'tracking_type' => ['nullable', 'string', 'in:none,batch,serial'],
50:             'metadata' => ['nullable', 'array'],
51: 
52:             // Variants, options, and base64 images are processed by
53:             // ProductService (shared with the web surface). Omitting variants
54:             // leaves any existing ones untouched.
55:             'images' => ['nullable', 'array', 'max:5'],
56:             'images.*.preview' => ['nullable', 'string'],
57:             'images.*.url' => ['nullable', 'string'],
58:             'images.*.name' => ['nullable', 'string'],
59:             'has_variants' => ['boolean'],
60:             'options' => ['nullable', 'array', 'max:3'],
61:             'options.*.id' => ['nullable', 'integer'],
62:             'options.*.name' => ['required_with:options', 'string', 'max:255'],
63:             'options.*.values' => ['required_with:options', 'array', 'min:1'],
64:             'options.*.values.*' => ['string', 'max:255'],
65:             'variants' => ['nullable', 'array'],
66:             'variants.*.id' => ['nullable', 'integer'],
67:             'variants.*.option_values' => ['required_with:variants', 'array'],
68:             'variants.*.sku' => ['nullable', 'string', 'max:255'],
69:             'variants.*.barcode' => ['nullable', 'string', 'max:255'],
70:             'variants.*.price' => ['nullable', 'numeric', 'min:0'],
71:             'variants.*.purchase_price' => ['nullable', 'numeric', 'min:0'],
72:             // Opening stock for a NEW variant (no id) is booked as a ledger
73:             // row; an existing variant's stock cannot be set here.
74:             'variants.*.stock' => ['nullable', 'integer', 'min:0', function (string $attribute, mixed $value, \Closure $fail): void {
75:                 $index = explode('.', $attribute)[1] ?? null;
76:                 if ($index !== null && ! empty($this->input("variants.{$index}.id"))) {
77:                     $fail(ProductService::STOCK_EDIT_MESSAGE);
78:                 }
79:             }],
80:             'variants.*.min_stock' => ['nullable', 'integer', 'min:0'],
81:             'variants.*.is_active' => ['boolean'],
82:         ] + $this->productSupplierRules($organizationId);
83:     }
84: 
85:     /**
86:      * @return array<string, string>
87:      */
88:     public function messages(): array
89:     {
90:         return [
91:             'stock.prohibited' => ProductService::STOCK_EDIT_MESSAGE,
92:         ];
93:     }
94: }
```



<a id="e0480"></a>

> Audit provenance: `additional-contracts.md` lines 322–386. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductComponent/StoreProductComponentRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductComponent/StoreProductComponentRequest.php#L1). SHA-256: `7727313d7049d647a2a3d97d6cdb3abd3ad2b95229f1434ffca833747eb6e263`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductComponent;
6: 
7: use App\Models\Inventory\Product;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates adding a component to a kit/assembly via the REST API. Rules
13:  * unchanged from Api\ProductComponentController::store: the component product
14:  * must belong to the org, must not be the parent itself, and must be unique
15:  * within the parent. The deeper circular-reference check stays in the
16:  * controller.
17:  */
18: final class StoreProductComponentRequest extends FormRequest
19: {
20:     /**
21:      * @return array<string, mixed>
22:      */
23:     public function rules(): array
24:     {
25:         $organizationId = $this->user()->organization_id;
26:         /** @var Product $product */
27:         $product = $this->route('product');
28: 
29:         return [
30:             'component_product_id' => [
31:                 'required',
32:                 'integer',
33:                 Rule::exists('products', 'id')->where('organization_id', $organizationId),
34:                 function ($attribute, $value, $fail) use ($product) {
35:                     if ((int) $value === $product->id) {
36:                         $fail('A product cannot be a component of itself.');
37:                     }
38:                 },
39:                 function ($attribute, $value, $fail) use ($organizationId) {
40:                     // Variant-tracked products keep stock on ProductVariant, but
41:                     // work-order consumption decrements the parent's (unused)
42:                     // stock — forbid them as components until variant-level BOM
43:                     // support lands.
44:                     $component = Product::where('id', $value)
45:                         ->where('organization_id', $organizationId)
46:                         ->first();
47:                     if ($component && $component->has_variants) {
48:                         $fail('Variant-tracked products cannot be used as components.');
49:                     }
50:                 },
51:                 Rule::unique('product_components')
52:                     ->where('parent_product_id', $product->id),
53:             ],
54:             'quantity' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
55:             'notes' => ['nullable', 'string', 'max:1000'],
56:         ];
57:     }
58: }
```



<a id="e0481"></a>

> Audit provenance: `additional-contracts.md` lines 387–418. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductComponent/UpdateProductComponentRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductComponent/UpdateProductComponentRequest.php#L1). SHA-256: `c76f08627d4fd52a64695b5008685655f50b8be0d4736087d4fa78beba7ae98b`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductComponent;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates updating a kit/assembly component via the REST API. Rules
11:  * unchanged from Api\ProductComponentController::update.
12:  */
13: final class UpdateProductComponentRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'quantity' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
22:             'notes' => ['nullable', 'string', 'max:1000'],
23:         ];
24:     }
25: }
```



<a id="e0484"></a>

> Audit provenance: `additional-contracts.md` lines 501–534. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductOption/StoreProductOptionRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductOption/StoreProductOptionRequest.php#L1). SHA-256: `ddc7bc25aa8a0e19f0f94d56a96c1e757ea2f7f3a0acf6f238e0e447d7a393e7`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductOption;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a new product option via the REST API. Rules unchanged from
11:  * Api\ProductOptionController::store.
12:  */
13: final class StoreProductOptionRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'name' => ['required', 'string', 'max:255'],
22:             'values' => ['required', 'array', 'min:1'],
23:             'values.*' => ['required', 'string', 'max:255'],
24:             'position' => ['nullable', 'integer', 'min:0'],
25:         ];
26:     }
27: }
```



<a id="e0485"></a>

> Audit provenance: `additional-contracts.md` lines 535–568. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductOption/UpdateProductOptionRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductOption/UpdateProductOptionRequest.php#L1). SHA-256: `67a733bc704f0686bf9bdf52f28eddf8875a602dfc1eb3656c112deea388c4cb`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductOption;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a product option update via the REST API. Rules unchanged from
11:  * Api\ProductOptionController::update (name/values are `sometimes`).
12:  */
13: final class UpdateProductOptionRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'name' => ['sometimes', 'string', 'max:255'],
22:             'values' => ['sometimes', 'array', 'min:1'],
23:             'values.*' => ['required', 'string', 'max:255'],
24:             'position' => ['nullable', 'integer', 'min:0'],
25:         ];
26:     }
27: }
```



<a id="e0486"></a>

> Audit provenance: `additional-contracts.md` lines 569–614. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductVariant/StoreProductVariantRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductVariant/StoreProductVariantRequest.php#L1). SHA-256: `e236868bd1f0092fe249174c50bd1b6b74bc2f13b13a45b56d39757d3032d070`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductVariant;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a new product variant via the REST API. Rules unchanged from
11:  * Api\ProductVariantController::store.
12:  */
13: final class StoreProductVariantRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'sku' => ['nullable', 'string', 'max:255'],
22:             'barcode' => ['nullable', 'string', 'max:255'],
23:             'title' => ['nullable', 'string', 'max:255'],
24:             'option_values' => ['required', 'array'],
25:             'price' => ['nullable', 'numeric', 'min:0'],
26:             'purchase_price' => ['nullable', 'numeric', 'min:0'],
27:             'compare_at_price' => ['nullable', 'numeric', 'min:0'],
28:             'stock' => ['nullable', 'integer', 'min:0'],
29:             'min_stock' => ['nullable', 'integer', 'min:0'],
30:             'image' => ['nullable', 'string', 'max:255'],
31:             'weight' => ['nullable', 'numeric', 'min:0'],
32:             'weight_unit' => ['nullable', 'string', 'in:kg,lb,oz,g'],
33:             'is_active' => ['nullable', 'boolean'],
34:             'requires_shipping' => ['nullable', 'boolean'],
35:             'position' => ['nullable', 'integer', 'min:0'],
36:             'metadata' => ['nullable', 'array'],
37:         ];
38:     }
39: }
```



<a id="e0487"></a>

> Audit provenance: `additional-contracts.md` lines 615–672. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductVariant/UpdateProductVariantRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductVariant/UpdateProductVariantRequest.php#L1). SHA-256: `3e9f482e18572889ff0f40e21101adec1f478dc3757b2b1e149279765c4d07c3`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductVariant;
6: 
7: use App\Services\ProductService;
8: use Illuminate\Foundation\Http\FormRequest;
9: 
10: /**
11:  * Validates a product variant update via the REST API. Rules unchanged from
12:  * Api\ProductVariantController::update (option_values is `sometimes`).
13:  */
14: final class UpdateProductVariantRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, array<int, string>>
18:      */
19:     public function rules(): array
20:     {
21:         return [
22:             'sku' => ['nullable', 'string', 'max:255'],
23:             'barcode' => ['nullable', 'string', 'max:255'],
24:             'title' => ['nullable', 'string', 'max:255'],
25:             'option_values' => ['sometimes', 'array'],
26:             'price' => ['nullable', 'numeric', 'min:0'],
27:             'purchase_price' => ['nullable', 'numeric', 'min:0'],
28:             'compare_at_price' => ['nullable', 'numeric', 'min:0'],
29:             // Variant stock moves only through the ledger (adjust-stock).
30:             'stock' => ['prohibited'],
31:             'min_stock' => ['nullable', 'integer', 'min:0'],
32:             'image' => ['nullable', 'string', 'max:255'],
33:             'weight' => ['nullable', 'numeric', 'min:0'],
34:             'weight_unit' => ['nullable', 'string', 'in:kg,lb,oz,g'],
35:             'is_active' => ['nullable', 'boolean'],
36:             'requires_shipping' => ['nullable', 'boolean'],
37:             'position' => ['nullable', 'integer', 'min:0'],
38:             'metadata' => ['nullable', 'array'],
39:         ];
40:     }
41: 
42:     /**
43:      * @return array<string, string>
44:      */
45:     public function messages(): array
46:     {
47:         return [
48:             'stock.prohibited' => ProductService::STOCK_EDIT_MESSAGE,
49:         ];
50:     }
51: }
```

