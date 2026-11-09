# 21. Stock Adjustments — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Stock Adjustments as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Adjustment list/create/detail; signed quantity delta; variant stock popup; reason/notes/location; optional approval; before/change/after history.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Inventory / Products](../modules/11_inventory.md), [Locations](../modules/19_locations.md), [Approvals](../modules/17_approvals.md), [Reservations](../modules/26_reservations.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/StockAdjustments/Create.vue` | Pending | Pending |
| `resources/js/Pages/StockAdjustments/Index.vue` | Pending | Pending |
| `resources/js/Pages/StockAdjustments/Show.vue` | Pending | Pending |

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

- [ ] Main form posts a signed nonzero delta.
- [ ] variant popup translates mode correctly including recount zero.
- [ ] pending approval is not shown as completed stock.
- [ ] insufficient available stock and stale concurrent requests fail safely.

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

- [Manual adjustment and variant popup](#e0007)
- [StockAdjustments/Create](#e0029)
- [StockAdjustments/Index](#e0030)
- [StockAdjustments/Show](#e0031)
- [Components/VariantStockAdjuster](#e0050)
- [StockAdjustment/StoreStockAdjustmentRequest.php](#e0066)
- [StockAdjustment](#e0104)
- [StockAdjustmentRequest](#e0105)
- [2025_10_13_213427_create_stock_adjustments_table.php](#e0123)
- [2025_12_28_000004_add_variant_support_to_stock_adjustments.php](#e0128)
- [2026_09_28_000002_add_location_id_to_stock_adjustments.php](#e0144)
- [2026_09_29_000002_create_stock_adjustment_requests_table.php](#e0147)
- [`app/Http/Requests/Api/StockAdjustment/StoreStockAdjustmentRequest.php`](#e0492)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0007"></a>

> Audit provenance: `inventory.md` lines 62–67. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Manual adjustment and variant popup

- Main form submits a **signed** `adjustment_quantity` (not a target total), nonzero integer; type manual/recount/damage/loss/return/correction; required reason; optional notes/location. Selecting a product sold by variants requires `product_variant_id`; changing product clears an incompatible variant. Live preview is current + delta.
- Variant popup instead accepts increase/decrease/recount/damage/return. Increase/return use positive amount; decrease/damage negative amount; recount sends entered counted quantity minus currently displayed variant stock. Recount may enter zero, other modes require at least 1; reason optional. Request uses `quantity`, not main-form `adjustment_quantity`. A 202 response means pending approval, not stock changed. [VariantStockAdjuster:24-111](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L24).
- Both flows pass through approval logic. Server locks/rechecks available stock; don't claim concurrency safety merely because the UI displayed enough stock. [StockAdjustmentController:162-205](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/StockAdjustmentController.php#L162).



<a id="e0029"></a>

> Audit provenance: `inventory.md` lines 1055–1113. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAdjustments/Create

GET /stock-adjustments/create; manage_stock. Product may be preselected from link. Variant select appears for has_variants. Current/new stock preview, zero initial delta is invalid for submit. Select type/location, signed delta, reason and notes. Scanned variant populates product+variant and focuses quantity. Positive/negative quantity can auto-fill empty reason. POST stock-adjustments may return pending approval rather than mutate immediately.

Source: [resources/js/Pages/StockAdjustments/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockAdjustments/Create.vue:24
const form = useForm({
    product_id: props.products?.some(p => p.id === props.preselectedProductId) ? props.preselectedProductId : '',
    product_variant_id: null,
    type: 'manual',
    adjustment_quantity: 0,
    location_id: null,
    reason: '',
    notes: '',
});
// resources/js/Pages/StockAdjustments/Create.vue:35
const showScannerModal = ref(false);
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.product_id — [resources/js/Pages/StockAdjustments/Create.vue:149](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L149) | Product * | select; props.products?.some(p =&gt; p.id === props.preselectedProductId) ? props.preselectedProductId : '' | v-model="form.product_id"; required | Always within this view/dialog; see component visibility |
| form.product_variant_id — [resources/js/Pages/StockAdjustments/Create.vue:180](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L180) | Variant * | select; null | ; v-model="form.product_variant_id"; required | v-if="selectedProduct?.has_variants" |
| form.type — [resources/js/Pages/StockAdjustments/Create.vue:225](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L225) | Type * | select; 'manual' | ; v-model="form.type"; required | Always within this view/dialog; see component visibility |
| form.location_id — [resources/js/Pages/StockAdjustments/Create.vue:240](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L240) | Location (Optional) | select; null | ; v-model="form.location_id" | v-if="locations.length" |
| form.adjustment_quantity — [resources/js/Pages/StockAdjustments/Create.vue:262](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L262) | Adjustment Quantity * | number; 0 | ; v-model="form.adjustment_quantity"; type="number"; required; step="1"; :placeholder="t('stockAdjustments.create.quantityPlaceholder')" | Always within this view/dialog; see component visibility |
| form.reason — [resources/js/Pages/StockAdjustments/Create.vue:283](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L283) | Reason * | text; '' | ; v-model="form.reason"; type="text"; required; maxlength="255"; :placeholder="t('stockAdjustments.create.reasonPlaceholder')" | Always within this view/dialog; see component visibility |
| form.notes — [resources/js/Pages/StockAdjustments/Create.vue:301](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L301) | Notes (Optional) | textarea; '' | ; v-model="form.notes"; rows="4"; :placeholder="t('stockAdjustments.create.notesPlaceholder')" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- form.product_id ([resources/js/Pages/StockAdjustments/Create.vue:149](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L149)): `&lt;option value=""&gt;{{ Select a product }}&lt;/option&gt; &lt;option v-for="product in products" :key="product.id" :value="product.id"&gt; {{ product.name }} ({{ product.sku }}) - {{ Current Stock: {stock} }} &lt;/option&gt;`
- form.product_variant_id ([resources/js/Pages/StockAdjustments/Create.vue:180](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L180)): `&lt;option :value="null"&gt;{{ Choose a variant... }}&lt;/option&gt; &lt;option v-for="variant in selectedProduct.variants" :key="variant.id" :value="variant.id"&gt; {{ variant.title }}&lt;template v-if="variant.sku"&gt; ({{ variant.sku }})&lt;/template&gt; - {{ Current Stock: {stock} }} &lt;/option&gt;`
- form.type ([resources/js/Pages/StockAdjustments/Create.vue:225](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L225)): `&lt;option v-for="(label, value) in types" :key="value" :value="value"&gt;{{ typeLabel(value, label) }}&lt;/option&gt;`
- form.location_id ([resources/js/Pages/StockAdjustments/Create.vue:240](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L240)): `&lt;option :value="null"&gt;{{ No specific location }}&lt;/option&gt; &lt;option v-for="location in locations" :key="location.id" :value="location.id"&gt; {{ location.name }}&lt;template v-if="location.code"&gt; ({{ location.code }})&lt;/template&gt; &lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: Adjustment Details — [resources/js/Pages/StockAdjustments/Create.vue:141](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L141)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/StockAdjustments/Create.vue:122](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L122) | :href="route('stock-adjustments.index')" | No ancestor condition |
| Stock Adjustments — [resources/js/Pages/StockAdjustments/Create.vue:124](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L124) | :href="route('stock-adjustments.index')" | No ancestor condition |
| Back to List — [resources/js/Pages/StockAdjustments/Create.vue:132](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L132) | variant="secondary"; size="sm"; as="Link"; :href="route('stock-adjustments.index')" | No ancestor condition |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/StockAdjustments/Create.vue:160](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L160) | v-if="$page.props.auth.permissions.includes('stock_adjustments.create')"; type="button"; @click="openScanner"; :title="t('stockAdjustments.create.scanBarcode')" | No ancestor condition |
| Cancel — [resources/js/Pages/StockAdjustments/Create.vue:328](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L328) | variant="secondary"; as="Link"; :href="route('stock-adjustments.index')" | No ancestor condition |
| form.processing ? Creating... : Create Adjustment — [resources/js/Pages/StockAdjustments/Create.vue:331](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L331) | type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing \|\| !form.product_id \|\| (selectedProduct?.has_variants && !form.product_variant_id) \|\| form.adjustment_quantity === 0" | No ancestor condition |

**Script endpoint names:** `stock-adjustments.store`. Match these to verb/path/permission in the route annex.



<a id="e0030"></a>

> Audit provenance: `inventory.md` lines 1114–1176. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAdjustments/Index

GET /stock-adjustments; manage_stock. Filters search/type/product/user/date_from/date_to. Table date/product/type/before/change/after/user/view. Paginated ledger; new-adjustment action. Type options include business-created adjustment types, not only manual form choices.

Source: [resources/js/Pages/StockAdjustments/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockAdjustments/Index.vue:24
const search = ref(props.filters?.search || '');
// resources/js/Pages/StockAdjustments/Index.vue:25
const selectedType = ref(props.filters?.type || '');
// resources/js/Pages/StockAdjustments/Index.vue:26
const selectedProduct = ref(props.filters?.product_id || '');
// resources/js/Pages/StockAdjustments/Index.vue:27
const selectedUser = ref(props.filters?.user_id || '');
// resources/js/Pages/StockAdjustments/Index.vue:28
const dateFrom = ref(props.filters?.date_from || '');
// resources/js/Pages/StockAdjustments/Index.vue:29
const dateTo = ref(props.filters?.date_to || '');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| search — [resources/js/Pages/StockAdjustments/Index.vue:106](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L106) | Search | text; props.filters?.search \|\| '' | ; v-model="search"; type="text"; :placeholder="t('stockAdjustments.searchPlaceholder')" | Always within this view/dialog; see component visibility |
| selectedType — [resources/js/Pages/StockAdjustments/Index.vue:115](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L115) | Type | select; props.filters?.type \|\| '' | ; v-model="selectedType" | Always within this view/dialog; see component visibility |
| selectedProduct — [resources/js/Pages/StockAdjustments/Index.vue:123](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L123) | Product | select; props.filters?.product_id \|\| '' | ; v-model="selectedProduct" | Always within this view/dialog; see component visibility |
| selectedUser — [resources/js/Pages/StockAdjustments/Index.vue:133](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L133) | User | select; props.filters?.user_id \|\| '' | ; v-model="selectedUser" | Always within this view/dialog; see component visibility |
| dateFrom — [resources/js/Pages/StockAdjustments/Index.vue:141](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L141) | Date From | date; props.filters?.date_from \|\| '' | ; v-model="dateFrom"; type="date" | Always within this view/dialog; see component visibility |
| dateTo — [resources/js/Pages/StockAdjustments/Index.vue:146](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L146) | Date To | date; props.filters?.date_to \|\| '' | ; v-model="dateTo"; type="date" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- selectedType ([resources/js/Pages/StockAdjustments/Index.vue:115](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L115)): `&lt;option value=""&gt;{{ All Types }}&lt;/option&gt; &lt;option v-for="(label, value) in types" :key="value" :value="value"&gt;{{ typeLabel(value, label) }}&lt;/option&gt;`
- selectedProduct ([resources/js/Pages/StockAdjustments/Index.vue:123](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L123)): `&lt;option value=""&gt;{{ All Products }}&lt;/option&gt; &lt;option v-for="product in products" :key="product.id" :value="product.id"&gt; {{ product.name }} ({{ product.sku }}) &lt;/option&gt;`
- selectedUser ([resources/js/Pages/StockAdjustments/Index.vue:133](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L133)): `&lt;option value=""&gt;{{ All Users }}&lt;/option&gt; &lt;option v-for="user in users" :key="user.id" :value="user.id"&gt;{{ user.name }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- th: Date — [resources/js/Pages/StockAdjustments/Index.vue:164](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L164)
- th: Product — [resources/js/Pages/StockAdjustments/Index.vue:165](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L165)
- th: Type — [resources/js/Pages/StockAdjustments/Index.vue:166](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L166)
- th: Before — [resources/js/Pages/StockAdjustments/Index.vue:167](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L167)
- th: Change — [resources/js/Pages/StockAdjustments/Index.vue:168](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L168)
- th: After — [resources/js/Pages/StockAdjustments/Index.vue:169](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L169)
- th: User — [resources/js/Pages/StockAdjustments/Index.vue:170](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L170)
- th: Actions — [resources/js/Pages/StockAdjustments/Index.vue:171](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L171)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| New Adjustment — [resources/js/Pages/StockAdjustments/Index.vue:94](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L94) | variant="default"; size="sm"; as="Link"; :href="route('stock-adjustments.create')" | No ancestor condition |
| Clear Filters — [resources/js/Pages/StockAdjustments/Index.vue:154](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L154) | type="button"; variant="secondary"; size="sm"; @click="clearFilters" | No ancestor condition |
| Create First Adjustment — [resources/js/Pages/StockAdjustments/Index.vue:180](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L180) | variant="default"; size="sm"; as="Link"; :href="route('stock-adjustments.create')" | v-if="!adjustments.data \|\| adjustments.data.length === 0" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/StockAdjustments/Index.vue:222](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L222) | :href="route('stock-adjustments.show', adjustment.id)"; :title="t('common.view')" | v-for="adjustment in adjustments.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/StockAdjustments/Index.vue:238](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L238) | v-if="link.url"; :href="link.url"; v-html="link.label" | v-if="adjustments.data && adjustments.data.length &gt; 0 && adjustments.links && adjustments.links.length &gt; 3" → v-for="link in adjustments.links" |

**Script endpoint names:** `stock-adjustments.index`. Match these to verb/path/permission in the route annex.



<a id="e0031"></a>

> Audit provenance: `inventory.md` lines 1177–1206. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAdjustments/Show

GET /stock-adjustments/{stockAdjustment}; manage_stock. No editable fields. Before/change/after tiles; product/type/actor/time/reason/notes/reference and timeline. Product/reference links where available, back to listing. Tenant and location authorization server-side.

Source: [resources/js/Pages/StockAdjustments/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L1).

**Input fields:** none in this page/component template.


**Read fields, columns and section headings:**

- h3: Adjustment Information — [resources/js/Pages/StockAdjustments/Show.vue:112](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L112)
- dt: Product — [resources/js/Pages/StockAdjustments/Show.vue:116](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L116)
- dt: Type — [resources/js/Pages/StockAdjustments/Show.vue:129](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L129)
- dt: Adjusted By — [resources/js/Pages/StockAdjustments/Show.vue:138](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L138)
- dt: Date & Time — [resources/js/Pages/StockAdjustments/Show.vue:146](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L146)
- dt: Reason — [resources/js/Pages/StockAdjustments/Show.vue:152](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L152)
- dt: Notes — [resources/js/Pages/StockAdjustments/Show.vue:157](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L157) — v-if="adjustment.notes"
- dt: Reference — [resources/js/Pages/StockAdjustments/Show.vue:162](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L162) — v-if="adjustment.reference_type"
- h3: Stock Change Timeline — [resources/js/Pages/StockAdjustments/Show.vue:175](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L175)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/StockAdjustments/Show.vue:57](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L57) | :href="route('stock-adjustments.index')" | No ancestor condition |
| Stock Adjustments — [resources/js/Pages/StockAdjustments/Show.vue:59](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L59) | :href="route('stock-adjustments.index')" | No ancestor condition |
| Back to List — [resources/js/Pages/StockAdjustments/Show.vue:71](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L71) | variant="secondary"; size="sm"; as="Link"; :href="route('stock-adjustments.index')" | No ancestor condition |
| adjustment.product.name — [resources/js/Pages/StockAdjustments/Show.vue:118](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L118) | :href="route('products.show', adjustment.product.id)" | No ancestor condition |



<a id="e0050"></a>

> Audit provenance: `inventory.md` lines 2284–2335. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/VariantStockAdjuster

Per-variant stock plus stock-state badge and +/- popover. Popup defaults type selected by opening action, quantity 1, reason blank; modes and signed delta semantics above. API 202 retained as approval notice. Endpoint also accepts received but popup does not offer it.

Source: [resources/js/Components/VariantStockAdjuster.vue:1](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Components/VariantStockAdjuster.vue:24
const showPopover = ref(false);
// resources/js/Components/VariantStockAdjuster.vue:25
const adjustType = ref('increase');
// resources/js/Components/VariantStockAdjuster.vue:26
const quantity = ref(1);
// resources/js/Components/VariantStockAdjuster.vue:27
const reason = ref('');
// resources/js/Components/VariantStockAdjuster.vue:28
const loading = ref(false);
// resources/js/Components/VariantStockAdjuster.vue:29
const error = ref('');
// resources/js/Components/VariantStockAdjuster.vue:32
const pendingNotice = ref('');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| adjustType — [resources/js/Components/VariantStockAdjuster.vue:183](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L183) | Adjustment Type | select; 'increase' | ; v-model="adjustType" | v-if="showPopover" |
| quantity — [resources/js/Components/VariantStockAdjuster.vue:198](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L198) | adjustType === 'recount' ? Counted quantity : Quantity | number; 1 | ; v-model.number="quantity"; type="number"; :min="adjustType === 'recount' ? 0 : 1" | v-if="showPopover" |
| reason — [resources/js/Components/VariantStockAdjuster.vue:211](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L211) | Reason (optional) | text; '' | ; v-model="reason"; type="text"; :placeholder="t('components.stockAdjuster.reasonPlaceholder')" | v-if="showPopover" |

**Select options and labels (exact source, including remote lists):**

- adjustType ([resources/js/Components/VariantStockAdjuster.vue:183](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L183)): `&lt;option v-for="type in adjustTypes" :key="type.value" :value="type.value"&gt; {{ type.label }} &lt;/option&gt;`

**Read fields, columns and section headings:**

- h4: Adjust Stock: {name} — [resources/js/Components/VariantStockAdjuster.vue:174](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L174) — v-if="showPopover"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| (icon-only; accessible label/title in attributes) — [resources/js/Components/VariantStockAdjuster.vue:141](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L141) | type="button"; @click="openPopover('increase')"; :title="t('components.stockAdjuster.increaseStock')" | No ancestor condition |
| (icon-only; accessible label/title in attributes) — [resources/js/Components/VariantStockAdjuster.vue:151](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L151) | type="button"; @click="openPopover('decrease')"; :title="t('components.stockAdjuster.decreaseStock')" | No ancestor condition |
| Cancel — [resources/js/Components/VariantStockAdjuster.vue:224](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L224) | type="button"; @click="closePopover" | v-if="showPopover" |
| ... Apply — [resources/js/Components/VariantStockAdjuster.vue:231](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L231) | type="button"; @click="adjustStock"; :disabled="loading" | v-if="showPopover" |

**Script endpoint names:** `products.variants.adjust-stock`. Match these to verb/path/permission in the route annex.



<a id="e0066"></a>

> Audit provenance: `inventory.md` lines 2947–3027. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAdjustment/StoreStockAdjustmentRequest.php

Source [app/Http/Requests/StockAdjustment/StoreStockAdjustmentRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/StockAdjustment/StoreStockAdjustmentRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\StockAdjustment;
6: 
7: use App\Support\VariantLineValidator;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: use Illuminate\Validation\Validator;
11: 
12: /**
13:  * Validates a new stock adjustment (web surface). location_id is an optional
14:  * addition so an adjustment can target a specific location bin; the rest is
15:  * unchanged from the previous inline validation in the controller.
16:  *
17:  * product_variant_id targets a variant (picked, or resolved from a scanned
18:  * variant barcode). A product sold by variant needs one, it must belong to
19:  * the product. An optional location targets that variant's bin.
20:  */
21: final class StoreStockAdjustmentRequest extends FormRequest
22: {
23:     /**
24:      * @return array<string, mixed>
25:      */
26:     public function rules(): array
27:     {
28:         $organizationId = $this->user()->organization_id;
29: 
30:         return [
31:             'product_id' => 'required|exists:products,id',
32:             'product_variant_id' => [
33:                 'nullable',
34:                 'integer',
35:                 Rule::exists('product_variants', 'id')
36:                     ->where('organization_id', $organizationId)
37:                     ->whereNull('deleted_at'),
38:             ],
39:             'type' => 'required|in:manual,recount,damage,loss,return,correction',
40:             'adjustment_quantity' => 'required|integer|not_in:0',
41:             'location_id' => [
42:                 'nullable',
43:                 'integer',
44:                 Rule::exists('product_locations', 'id')
45:                     ->where('organization_id', $organizationId)
46:                     ->whereNull('deleted_at'),
47:             ],
48:             'reason' => 'required|string|max:255',
49:             'notes' => 'nullable|string',
50:         ];
51:     }
52: 
53:     /**
54:      * @return array<int, \Closure(Validator): void>
55:      */
56:     public function after(): array
57:     {
58:         return [
59:             function (Validator $validator): void {
60:                 $errors = VariantLineValidator::errors(
61:                     [$this->only(['product_id', 'product_variant_id'])],
62:                     (int) $this->user()->organization_id,
63:                 );
64: 
65:                 if (isset($errors[0])) {
66:                     $validator->errors()->add('product_variant_id', $errors[0]);
67:                 }
68: 
69: 
70:             },
71:         ];
72:     }
73: }
74: 
```



<a id="e0104"></a>

> Audit provenance: `inventory.md` lines 4975–5013. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAdjustment
[app/Models/Inventory/StockAdjustment.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/StockAdjustment.php#L1)

```php
45:     protected $fillable = [
46:         'organization_id',
47:         'product_id',
48:         'product_variant_id',
49:         'location_id',
50:         'user_id',
51:         'type',
52:         'quantity_before',
53:         'quantity_after',
54:         'adjustment_quantity',
55:         'reason',
56:         'notes',
57:         'reference_type',
58:         'reference_id',
59:     ];
61:     protected $casts = [
62:         'quantity_before' => 'integer',
63:         'quantity_after' => 'integer',
64:         'adjustment_quantity' => 'integer',
65:         'created_at' => 'datetime',
66:         'updated_at' => 'datetime',
67:     ];
74:     public function organization(): BelongsTo
76:         return $this->belongsTo(Organization::class);
84:     public function location(): BelongsTo
86:         return $this->belongsTo(ProductLocation::class, 'location_id');
94:     public function product(): BelongsTo
96:         return $this->belongsTo(Product::class)->withTrashed();
104:     public function user(): BelongsTo
106:         return $this->belongsTo(User::class);
114:     public function variant(): BelongsTo
116:         return $this->belongsTo(ProductVariant::class, 'product_variant_id')->withTrashed();
126:         return $this->morphTo();
```



<a id="e0105"></a>

> Audit provenance: `inventory.md` lines 5014–5060. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAdjustmentRequest
[app/Models/Inventory/StockAdjustmentRequest.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/StockAdjustmentRequest.php#L1)

```php
52:     public const STATUS_PENDING = 'pending';
54:     public const STATUS_APPROVED = 'approved';
56:     public const STATUS_REJECTED = 'rejected';
58:     protected $fillable = [
59:         'organization_id',
60:         'product_id',
61:         'product_variant_id',
62:         'location_id',
63:         'requested_by',
64:         'type',
65:         'quantity',
66:         'value',
67:         'reason',
68:         'notes',
69:         'status',
70:         'approved_by',
71:         'approved_at',
72:         'approval_notes',
73:         'stock_adjustment_id',
74:     ];
76:     protected function casts(): array
77:     {
78:         return [
79:             'quantity' => 'integer',
80:             'value' => 'decimal:2',
81:             'approved_at' => 'datetime',
82:         ];
88:     public function organization(): BelongsTo
90:         return $this->belongsTo(Organization::class);
96:     public function product(): BelongsTo
98:         return $this->belongsTo(Product::class);
104:     public function variant(): BelongsTo
106:         return $this->belongsTo(ProductVariant::class, 'product_variant_id');
112:     public function location(): BelongsTo
114:         return $this->belongsTo(ProductLocation::class, 'location_id');
120:     public function requester(): BelongsTo
122:         return $this->belongsTo(User::class, 'requested_by');
128:     public function approver(): BelongsTo
130:         return $this->belongsTo(User::class, 'approved_by');
136:     public function stockAdjustment(): BelongsTo
138:         return $this->belongsTo(StockAdjustment::class);
```



<a id="e0123"></a>

> Audit provenance: `inventory.md` lines 5680–5702. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_10_13_213427_create_stock_adjustments_table.php
[database/migrations/2025_10_13_213427_create_stock_adjustments_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_10_13_213427_create_stock_adjustments_table.php#L1)

```php
14:         Schema::create('stock_adjustments', function (Blueprint $table) {
15:             $table->id();
16:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
17:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
18:             $table->foreignId('user_id')->constrained()->cascadeOnDelete();
21:             $table->string('type'); // increase, decrease, recount, damage, return
22:             $table->integer('quantity_before');
23:             $table->integer('quantity_after');
24:             $table->integer('adjustment_quantity'); // can be positive or negative
27:             $table->string('reason')->nullable(); // received_shipment, sold, damaged, expired, theft, recount
28:             $table->text('notes')->nullable();
31:             $table->string('reference_type')->nullable(); // Order, Purchase, etc.
32:             $table->unsignedBigInteger('reference_id')->nullable();
34:             $table->timestamps();
37:             $table->index(['product_id', 'created_at']);
38:             $table->index(['organization_id', 'created_at']);
39:             $table->index(['type', 'created_at']);
```



<a id="e0128"></a>

> Audit provenance: `inventory.md` lines 5771–5783. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_12_28_000004_add_variant_support_to_stock_adjustments.php
[database/migrations/2025_12_28_000004_add_variant_support_to_stock_adjustments.php:1](C:/Users/proj/Inventoros/database/migrations/2025_12_28_000004_add_variant_support_to_stock_adjustments.php#L1)

```php
14:         Schema::table('stock_adjustments', function (Blueprint $table) {
15:             $table->foreignId('product_variant_id')
21:             $table->index(['product_variant_id', 'created_at']);
30:         Schema::table('stock_adjustments', function (Blueprint $table) {
31:             $table->dropForeign(['product_variant_id']);
32:             $table->dropIndex(['product_variant_id', 'created_at']);
33:             $table->dropColumn('product_variant_id');
```



<a id="e0144"></a>

> Audit provenance: `inventory.md` lines 6062–6071. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_09_28_000002_add_location_id_to_stock_adjustments.php
[database/migrations/2026_09_28_000002_add_location_id_to_stock_adjustments.php:1](C:/Users/proj/Inventoros/database/migrations/2026_09_28_000002_add_location_id_to_stock_adjustments.php#L1)

```php
16:         Schema::table('stock_adjustments', function (Blueprint $table) {
17:             $table->foreignId('location_id')->nullable()->after('product_variant_id')
24:         Schema::table('stock_adjustments', function (Blueprint $table) {
25:             $table->dropConstrainedForeignId('location_id');
```



<a id="e0147"></a>

> Audit provenance: `inventory.md` lines 6104–6129. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_09_29_000002_create_stock_adjustment_requests_table.php
[database/migrations/2026_09_29_000002_create_stock_adjustment_requests_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_09_29_000002_create_stock_adjustment_requests_table.php#L1)

```php
20:         Schema::create('stock_adjustment_requests', function (Blueprint $table) {
21:             $table->id();
22:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
23:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
24:             $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
25:             $table->foreignId('location_id')->nullable()->constrained('product_locations')->nullOnDelete();
26:             $table->foreignId('requested_by')->nullable()->constrained('users')->nullOnDelete();
27:             $table->string('type', 50);
28:             $table->integer('quantity');
29:             $table->decimal('value', 15, 2)->nullable();
30:             $table->string('reason')->nullable();
31:             $table->text('notes')->nullable();
33:             $table->string('status', 20)->default('pending');
34:             $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
35:             $table->timestamp('approved_at')->nullable();
36:             $table->text('approval_notes')->nullable();
37:             $table->foreignId('stock_adjustment_id')->nullable()->constrained('stock_adjustments')->nullOnDelete();
38:             $table->timestamps();
40:             $table->index(['organization_id', 'status']);
41:             $table->index(['organization_id', 'requested_by']);
```



<a id="e0492"></a>

> Audit provenance: `additional-contracts.md` lines 869–955. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/StockAdjustment/StoreStockAdjustmentRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/StockAdjustment/StoreStockAdjustmentRequest.php#L1). SHA-256: `f196e39dade0a80b585301ef0b619e97d442e91dc7cfcde97544fa16dedd6c39`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\StockAdjustment;
6: 
7: use App\Support\VariantLineValidator;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: use Illuminate\Validation\Validator;
11: 
12: /**
13:  * Validates a new stock adjustment via the REST API. Rules unchanged from
14:  * Api\StockAdjustmentController::store; product existence is org-scoped.
15:  */
16: final class StoreStockAdjustmentRequest extends FormRequest
17: {
18:     /**
19:      * @return array<string, mixed>
20:      */
21:     public function rules(): array
22:     {
23:         $organizationId = $this->user()->organization_id;
24: 
25:         return [
26:             'product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
27:             // Optional: adjust one variant's stock (the variant ledger) rather
28:             // than the product total. Must belong to product_id.
29:             'product_variant_id' => [
30:                 'nullable',
31:                 'integer',
32:                 Rule::exists('product_variants', 'id')
33:                     ->where('organization_id', $organizationId)
34:                     ->whereNull('deleted_at'),
35:             ],
36:             'quantity' => ['required', 'integer'],
37:             'type' => ['required', 'string', 'in:manual,count,damage,return,transfer'],
38:             'reason' => ['nullable', 'string', 'max:255'],
39:             'notes' => ['nullable', 'string'],
40:             // Optional: apply the adjustment to a specific location bin so the
41:             // per-location breakdown stays in step with the total. Omitted =
42:             // adjust the total only (leaves the breakdown untouched).
43:             'location_id' => [
44:                 'nullable',
45:                 'integer',
46:                 Rule::exists('product_locations', 'id')
47:                     ->where('organization_id', $organizationId)
48:                     ->whereNull('deleted_at'),
49:             ],
50:         ];
51:     }
52: 
53:     /**
54:      * Same variant checks as the web form: the variant must belong to the
55:      * product; an optional location targets that variant's bin.
56:      *
57:      * @return array<int, \Closure(Validator): void>
58:      */
59:     public function after(): array
60:     {
61:         return [
62:             function (Validator $validator): void {
63:                 if (! $this->filled('product_variant_id')) {
64:                     return;
65:                 }
66: 
67:                 $errors = VariantLineValidator::errors(
68:                     [$this->only(['product_id', 'product_variant_id'])],
69:                     (int) $this->user()->organization_id,
70:                 );
71: 
72:                 if (isset($errors[0])) {
73:                     $validator->errors()->add('product_variant_id', $errors[0]);
74:                 }
75: 
76: 
77:             },
78:         ];
79:     }
80: }
```

