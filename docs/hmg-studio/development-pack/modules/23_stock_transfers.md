# 23. Stock Transfers — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Stock Transfers as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Create/list/detail; prepare/reserve; dispatch; in-transit; receipt/completion; cancellation; scanning verification.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Inventory / Products](../modules/11_inventory.md), [Locations](../modules/19_locations.md), [Warehouses](../modules/20_warehouses.md), [Reservations](../modules/26_reservations.md), [Approvals](../modules/17_approvals.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/StockTransfers/Create.vue` | Pending | Pending |
| `resources/js/Pages/StockTransfers/Index.vue` | Pending | Pending |
| `resources/js/Pages/StockTransfers/Show.vue` | Pending | Pending |

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

- [ ] Prepare reserves.
- [ ] dispatch consumes holds and deducts source.
- [ ] receive increments destination once.
- [ ] shipped transfer cannot cancel.
- [ ] source scan checklist is client-only unless an approved enhancement changes that contract.

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

- [Transfers](#e0009)
- [StockTransfers/Create](#e0039)
- [StockTransfers/Index](#e0040)
- [StockTransfers/Show](#e0041)
- [StockTransfer/StoreStockTransferRequest.php](#e0071)
- [StockTransfer/UpdateStockTransferRequest.php](#e0072)
- [StockTransfer](#e0107)
- [StockTransferItem](#e0108)
- [2026_03_12_100000_create_stock_transfers_table.php](#e0133)
- [2026_09_30_142347_add_completed_by_to_stock_transfers_table.php](#e0149)
- [2026_10_21_000003_add_prepared_variant_transfers.php](#e0153)
- [`app/Http/Requests/Api/StockTransfer/ShipStockTransferRequest.php`](#e0495)
- [`app/Http/Requests/Api/StockTransfer/StoreStockTransferRequest.php`](#e0496)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0009"></a>

> Audit provenance: `inventory.md` lines 74–81. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Transfers

- Create requires distinct source/destination locations and at least one line. Each line: product_id, variant when required, positive integer quantity, optional notes. Source options can be limited to assigned warehouses; destination excludes selected source. Scanning variant preserves variant identity and increments a matching line, otherwise fills first empty row/adds row.
- Server initial state pending; prepare reserves source quantities and becomes prepared; ship consumes reservations/decrements source and becomes in_transit with stock_dispatched_at; receive/completion increments destination and becomes completed. Direct same-warehouse completion from pending/prepared is exposed in UI. Source/destination authority differs. [StockTransferService:120-234](C:/Users/proj/Inventoros/app/Services/StockTransferService.php#L120).
- UI prepare = canDispatch + pending + approval not pending/rejected; ship = canDispatch + prepared + approval clear; complete = approval clear + (in_transit & canReceive OR same-warehouse pending/prepared); cancel = pending/prepared/in_transit with no stock_dispatched_at. These are **UI conditions**, not substitutes for server authorization. [Show:29-62](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L29).
- Shipped transfers cannot be cancelled; receive then reverse-transfer goods instead. Cancel releases holds. [StockTransferService:315-331](C:/Users/proj/Inventoros/app/Services/StockTransferService.php#L315).
- Scan-to-verify on Show is explicitly **client-side only and not saved**. It counts per line, warns for not-on-transfer/over-scans/ambiguous parent variant, supports reset; normal completion remains available without persistent scan proof. [Show:87-154](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L87).



<a id="e0039"></a>

> Audit provenance: `inventory.md` lines 1621–1685. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockTransfers/Create

GET /stock-transfers/create; transfer_stock. Source/destination distinct, notes and repeating items. One blank row initially, cannot remove last row. Product change clears variant. Total units sums line quantities. Scan camera/wedge increments matching product+variant or adds line. Submit POST pending transfer. shipping_method/tracking_number/estimated_arrival accepted by backend create request but no create-page controls.

Source: [resources/js/Pages/StockTransfers/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockTransfers/Create.vue:31
const form = useForm({
    from_location_id: '',
    to_location_id: '',
    notes: '',
    items: [
        { product_id: '', product_variant_id: '', quantity: 1, notes: '' },
    ],
});
// resources/js/Pages/StockTransfers/Create.vue:70
const showScanner = ref(false);
// resources/js/Pages/StockTransfers/Create.vue:71
const scanMessage = ref('');
// resources/js/Pages/StockTransfers/Create.vue:72
const scanMessageTone = ref('info');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.from_location_id — [resources/js/Pages/StockTransfers/Create.vue:168](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L168) | From Location * | select; '' | ; v-model="form.from_location_id"; required | Always within this view/dialog; see component visibility |
| form.to_location_id — [resources/js/Pages/StockTransfers/Create.vue:186](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L186) | To Location * | select; '' | ; v-model="form.to_location_id"; required | Always within this view/dialog; see component visibility |
| form.notes — [resources/js/Pages/StockTransfers/Create.vue:214](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L214) | Notes (Optional) | textarea; '' | ; v-model="form.notes"; rows="3"; :placeholder="t('stockTransfers.create.notesPlaceholder')" | Always within this view/dialog; see component visibility |
| item.product_id — [resources/js/Pages/StockTransfers/Create.vue:272](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L272) | Product * | select; '' (new transfer line) | ; v-model="item.product_id"; @change="item.product_variant_id = ''"; required | v-for="(item, index) in form.items" |
| item.product_variant_id — [resources/js/Pages/StockTransfers/Create.vue:290](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L290) | Variant | select; '' (new transfer line) | ; v-model="item.product_variant_id"; required | v-for="(item, index) in form.items" → v-if="getProduct(item.product_id)?.active_variants?.length" |
| item.quantity — [resources/js/Pages/StockTransfers/Create.vue:299](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L299) | Qty * | number; 1 (new transfer line) | ; v-model="item.quantity"; type="number"; min="1"; required | v-for="(item, index) in form.items" |
| item.notes — [resources/js/Pages/StockTransfers/Create.vue:317](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L317) | Notes | text; '' (new transfer line) | ; v-model="item.notes"; type="text"; :placeholder="t('stockTransfers.create.itemNotesPlaceholder')" | v-for="(item, index) in form.items" |

**Select options and labels (exact source, including remote lists):**

- form.from_location_id ([resources/js/Pages/StockTransfers/Create.vue:168](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L168)): `&lt;option value=""&gt;{{ Select source location }}&lt;/option&gt; &lt;option v-for="location in availableFromLocations" :key="location.id" :value="location.id"&gt; {{ location.name }} {{ location.code ? `(${location.code})` : '' }} &lt;/option&gt;`
- form.to_location_id ([resources/js/Pages/StockTransfers/Create.vue:186](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L186)): `&lt;option value=""&gt;{{ Select destination location }}&lt;/option&gt; &lt;option v-for="location in availableToLocations" :key="location.id" :value="location.id"&gt; {{ location.name }} {{ location.code ? `(${location.code})` : '' }} &lt;/option&gt;`
- item.product_id ([resources/js/Pages/StockTransfers/Create.vue:272](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L272)): `&lt;option value=""&gt;{{ Select product }}&lt;/option&gt; &lt;option v-for="product in products" :key="product.id" :value="product.id"&gt; {{ {name} ({sku}) - Stock: {stock} }} &lt;/option&gt;`
- item.product_variant_id ([resources/js/Pages/StockTransfers/Create.vue:290](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L290)): `&lt;option value=""&gt;{{ Choose a variant... }}&lt;/option&gt; &lt;option v-for="variant in getProduct(item.product_id).active_variants" :key="variant.id" :value="variant.id"&gt;{{ variant.sku \|\| variant.title }} ({{ variant.stock }})&lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: Transfer Details — [resources/js/Pages/StockTransfers/Create.vue:162](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L162)
- h3: Transfer Items — [resources/js/Pages/StockTransfers/Create.vue:230](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L230)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/StockTransfers/Create.vue:142](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L142) | :href="route('stock-transfers.index')" | No ancestor condition |
| Stock Transfers — [resources/js/Pages/StockTransfers/Create.vue:144](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L144) | :href="route('stock-transfers.index')" | No ancestor condition |
| Back to List — [resources/js/Pages/StockTransfers/Create.vue:152](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L152) | variant="secondary"; size="sm"; as="Link"; :href="route('stock-transfers.index')" | No ancestor condition |
| Scan — [resources/js/Pages/StockTransfers/Create.vue:232](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L232) | type="button"; variant="secondary"; size="lg"; @click="showScanner = true" | No ancestor condition |
| Add Item — [resources/js/Pages/StockTransfers/Create.vue:236](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L236) | type="button"; variant="default"; size="lg"; @click="addItem" | No ancestor condition |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/StockTransfers/Create.vue:327](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L327) | :aria-label="t('common.delete')"; type="button"; @click="removeItem(index)"; :disabled="form.items.length &lt;= 1" | v-for="(item, index) in form.items" |
| Cancel — [resources/js/Pages/StockTransfers/Create.vue:355](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L355) | variant="secondary"; as="Link"; :href="route('stock-transfers.index')" | No ancestor condition |
| form.processing ? Creating... : Create Transfer — [resources/js/Pages/StockTransfers/Create.vue:356](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L356) | type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing \|\| !form.from_location_id \|\| !form.to_location_id \|\| !hasValidItems" | No ancestor condition |

**Script endpoint names:** `stock-transfers.store`. Match these to verb/path/permission in the route annex.



<a id="e0040"></a>

> Audit provenance: `inventory.md` lines 1686–1734. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockTransfers/Index

GET /stock-transfers; transfer_stock. Search and status filter; number/from/to/status/items/date/view columns; new action and pagination. Status pending/prepared/in_transit/completed/cancelled.

Source: [resources/js/Pages/StockTransfers/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockTransfers/Index.vue:23
const search = ref(props.filters?.search || '');
// resources/js/Pages/StockTransfers/Index.vue:24
const selectedStatus = ref(props.filters?.status || '');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| search — [resources/js/Pages/StockTransfers/Index.vue:93](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L93) | Search | text; props.filters?.search \|\| '' | ; v-model="search"; type="text"; :placeholder="t('stockTransfers.index.searchPlaceholder')" | Always within this view/dialog; see component visibility |
| selectedStatus — [resources/js/Pages/StockTransfers/Index.vue:102](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L102) | Status | select; props.filters?.status \|\| '' | ; v-model="selectedStatus"; @change="applyFilters" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- selectedStatus ([resources/js/Pages/StockTransfers/Index.vue:102](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L102)): `&lt;option value=""&gt;{{ All Statuses }}&lt;/option&gt; &lt;option value="pending"&gt;{{ Pending }}&lt;/option&gt; &lt;option value="prepared"&gt;{{ Prepared }}&lt;/option&gt; &lt;option value="in_transit"&gt;{{ In Transit }}&lt;/option&gt; &lt;option value="completed"&gt;{{ Completed }}&lt;/option&gt; &lt;option value="cancelled"&gt;{{ Cancelled }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- th: Transfer # — [resources/js/Pages/StockTransfers/Index.vue:127](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L127)
- th: From — [resources/js/Pages/StockTransfers/Index.vue:128](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L128)
- th: To — [resources/js/Pages/StockTransfers/Index.vue:129](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L129)
- th: Status — [resources/js/Pages/StockTransfers/Index.vue:130](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L130)
- th: Items — [resources/js/Pages/StockTransfers/Index.vue:131](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L131)
- th: Date — [resources/js/Pages/StockTransfers/Index.vue:132](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L132)
- th: Actions — [resources/js/Pages/StockTransfers/Index.vue:133](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L133)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| New Transfer — [resources/js/Pages/StockTransfers/Index.vue:78](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L78) | variant="default"; size="sm"; as="Link"; :href="route('stock-transfers.create')" | No ancestor condition |
| Clear — [resources/js/Pages/StockTransfers/Index.vue:117](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L117) | type="button"; variant="secondary"; size="sm"; @click="clearFilters" | No ancestor condition |
| New Transfer — [resources/js/Pages/StockTransfers/Index.vue:142](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L142) | variant="default"; size="sm"; as="Link"; :href="route('stock-transfers.create')" | v-if="!transfers.data?.length" |
| transfer.transfer_number — [resources/js/Pages/StockTransfers/Index.vue:151](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L151) | :href="route('stock-transfers.show', transfer.id)" | v-for="transfer in transfers.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/StockTransfers/Index.vue:172](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L172) | :href="route('stock-transfers.show', transfer.id)"; :title="t('common.view')" | v-for="transfer in transfers.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/StockTransfers/Index.vue:186](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L186) | v-if="link.url"; :href="link.url"; v-html="link.label" | v-if="transfers.links && transfers.links.length &gt; 3" → v-for="link in transfers.links" |

**Script endpoint names:** `stock-transfers.index`. Match these to verb/path/permission in the route annex.



<a id="e0041"></a>

> Audit provenance: `inventory.md` lines 1735–1801. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockTransfers/Show

GET /stock-transfers/{transfer}; transfer_stock. Header status, approval panel, transfer meta, item product/SKU/qty/notes, local scan-verification checklist. Conditional prepare/ship/complete/cancel described above. Prepared ship controls shipping_method and tracking_number from saved values; no estimated_arrival control. Confirmation before complete/cancel. Scan counts not persisted.

Source: [resources/js/Pages/StockTransfers/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockTransfers/Show.vue:32
const processing = ref(false);
// resources/js/Pages/StockTransfers/Show.vue:63
const shipping = ref({ shipping_method: props.transfer.shipping_method || '', tracking_number: props.transfer.tracking_number || '' });
// resources/js/Pages/StockTransfers/Show.vue:91
const verifying = ref(false);
// resources/js/Pages/StockTransfers/Show.vue:92
const showScanner = ref(false);
// resources/js/Pages/StockTransfers/Show.vue:93
const scanned = ref({});
// resources/js/Pages/StockTransfers/Show.vue:94
const scanMessage = ref('');
// resources/js/Pages/StockTransfers/Show.vue:95
const scanMessageTone = ref('info');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| shipping.shipping_method — [resources/js/Pages/StockTransfers/Show.vue:370](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L370) | Service | input; props.transfer.shipping_method \|\| '' | v-model="shipping.shipping_method" | v-if="canPrepare \|\| canShip \|\| canComplete \|\| canCancel" → v-if="canShip" |
| shipping.tracking_number — [resources/js/Pages/StockTransfers/Show.vue:371](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L371) | Tracking number | input; props.transfer.tracking_number \|\| '' | v-model="shipping.tracking_number" | v-if="canPrepare \|\| canShip \|\| canComplete \|\| canCancel" → v-if="canShip" |

**Read fields, columns and section headings:**

- h3: Transfer Details — [resources/js/Pages/StockTransfers/Show.vue:201](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L201)
- dt: Transfer Number — [resources/js/Pages/StockTransfers/Show.vue:207](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L207)
- dt: Transferred By — [resources/js/Pages/StockTransfers/Show.vue:211](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L211)
- dt: From Location — [resources/js/Pages/StockTransfers/Show.vue:215](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L215)
- dt: To Location — [resources/js/Pages/StockTransfers/Show.vue:222](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L222)
- dt: Created — [resources/js/Pages/StockTransfers/Show.vue:229](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L229)
- dt: Completed — [resources/js/Pages/StockTransfers/Show.vue:233](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L233) — v-if="transfer.completed_at"
- dt: Completed by — [resources/js/Pages/StockTransfers/Show.vue:237](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L237) — v-if="transfer.completer"
- h3: Transfer Items — [resources/js/Pages/StockTransfers/Show.vue:251](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L251)
- th: Product — [resources/js/Pages/StockTransfers/Show.vue:257](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L257)
- th: SKU — [resources/js/Pages/StockTransfers/Show.vue:258](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L258)
- th: Quantity — [resources/js/Pages/StockTransfers/Show.vue:259](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L259)
- th: Notes — [resources/js/Pages/StockTransfers/Show.vue:260](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L260)
- h3: Scan to verify — [resources/js/Pages/StockTransfers/Show.vue:296](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L296) — v-if="canComplete"
- h3: Actions — [resources/js/Pages/StockTransfers/Show.vue:367](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L367) — v-if="canPrepare \|\| canShip \|\| canComplete \|\| canCancel"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/StockTransfers/Show.vue:165](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L165) | :href="route('stock-transfers.index')" | No ancestor condition |
| Stock Transfers — [resources/js/Pages/StockTransfers/Show.vue:167](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L167) | :href="route('stock-transfers.index')" | No ancestor condition |
| Back to List — [resources/js/Pages/StockTransfers/Show.vue:177](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L177) | variant="secondary"; size="sm"; as="Link"; :href="route('stock-transfers.index')" | No ancestor condition |
| Start scanning — [resources/js/Pages/StockTransfers/Show.vue:304](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L304) | v-if="!verifying"; variant="secondary"; size="lg"; @click="verifying = true" | v-if="canComplete" |
| Scan — [resources/js/Pages/StockTransfers/Show.vue:315](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L315) | size="lg"; @click="showScanner = true" | v-if="canComplete" → v-else |
| Reset — [resources/js/Pages/StockTransfers/Show.vue:319](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L319) | variant="secondary"; size="lg"; @click="resetVerification" | v-if="canComplete" → v-else |
| Prepare stock — [resources/js/Pages/StockTransfers/Show.vue:374](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L374) | v-if="canPrepare"; :loading="processing"; :disabled="processing"; @click="prepareTransfer" | v-if="canPrepare \|\| canShip \|\| canComplete \|\| canCancel" |
| Ship transfer — [resources/js/Pages/StockTransfers/Show.vue:375](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L375) | v-if="canShip"; :loading="processing"; :disabled="processing"; @click="shipTransfer" | v-if="canPrepare \|\| canShip \|\| canComplete \|\| canCancel" |
| processing ? Processing... : transfer.stock_dispatched_at ? Receive transfer : Complete Transfer — [resources/js/Pages/StockTransfers/Show.vue:376](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L376) | v-if="canComplete"; variant="default"; :loading="processing"; :disabled="processing"; @click="completeTransfer" | v-if="canPrepare \|\| canShip \|\| canComplete \|\| canCancel" |
| processing ? Processing... : Cancel Transfer — [resources/js/Pages/StockTransfers/Show.vue:386](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L386) | v-if="canCancel"; variant="danger"; :loading="processing"; :disabled="processing"; @click="cancelTransfer" | v-if="canPrepare \|\| canShip \|\| canComplete \|\| canCancel" |

**Script endpoint names:** `stock-transfers.${action}`, `stock-transfers.complete`, `stock-transfers.cancel`. Match these to verb/path/permission in the route annex.



<a id="e0071"></a>

> Audit provenance: `inventory.md` lines 3159–3204. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockTransfer/StoreStockTransferRequest.php

Source [app/Http/Requests/StockTransfer/StoreStockTransferRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/StockTransfer/StoreStockTransferRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\StockTransfer;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a new stock transfer (web surface). Rules unchanged from the
11:  * previous inline validation in Inventory\StockTransferController::store.
12:  */
13: final class StoreStockTransferRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, mixed>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'from_location_id' => 'required|exists:product_locations,id',
22:             'to_location_id' => [
23:                 'required',
24:                 'exists:product_locations,id',
25:                 'different:from_location_id',
26:             ],
27:             'notes' => 'nullable|string|max:1000',
28:             'shipping_method' => 'nullable|string|max:255',
29:             'tracking_number' => 'nullable|string|max:255',
30:             'estimated_arrival' => 'nullable|date',
31:             'items' => 'required|array|min:1',
32:             'items.*.product_id' => 'required|exists:products,id',
33:             'items.*.product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
34:             'items.*.quantity' => 'required|integer|min:1',
35:             'items.*.notes' => 'nullable|string|max:500',
36:         ];
37:     }
38: }
39: 
```



<a id="e0072"></a>

> Audit provenance: `inventory.md` lines 3205–3239. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockTransfer/UpdateStockTransferRequest.php

Source [app/Http/Requests/StockTransfer/UpdateStockTransferRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/StockTransfer/UpdateStockTransferRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\StockTransfer;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a stock transfer edit (web surface). Rules unchanged from the
11:  * previous inline validation in Inventory\StockTransferController::update.
12:  */
13: final class UpdateStockTransferRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, string>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'status' => 'sometimes|string|in:in_transit',
22:             'shipping_method' => 'nullable|string|max:255',
23:             'tracking_number' => 'nullable|string|max:255',
24:             'estimated_arrival' => 'nullable|date',
25:         ];
26:     }
27: }
28: 
```



<a id="e0107"></a>

> Audit provenance: `inventory.md` lines 5094–5158. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockTransfer
[app/Models/Inventory/StockTransfer.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/StockTransfer.php#L1)

```php
40:     protected $fillable = [
41:         'organization_id',
42:         'from_warehouse_id',
43:         'to_warehouse_id',
44:         'transfer_number',
45:         'from_location_id',
46:         'to_location_id',
47:         'transferred_by',
48:         'status',
49:         'is_inter_warehouse',
50:         'shipping_method',
51:         'tracking_number',
52:         'shipped_at',
53:         'prepared_at',
54:         'stock_dispatched_at',
55:         'estimated_arrival',
56:         'notes',
57:         'completed_at',
58:         'completed_by',
59:         'approval_status',
60:         'approval_requested_by',
61:         'approval_requested_at',
62:         'approved_by',
63:         'approved_at',
64:         'approval_notes',
65:     ];
70:     public const APPROVAL_PENDING = 'pending';
72:     public const APPROVAL_APPROVED = 'approved';
74:     public const APPROVAL_REJECTED = 'rejected';
76:     protected function casts(): array
77:     {
78:         return [
79:             'is_inter_warehouse' => 'boolean',
80:             'prepared_at' => 'datetime',
81:             'stock_dispatched_at' => 'datetime',
82:             'shipped_at' => 'datetime',
83:             'estimated_arrival' => 'datetime',
84:             'completed_at' => 'datetime',
85:             'approval_requested_at' => 'datetime',
86:             'approved_at' => 'datetime',
87:         ];
95:     public function organization(): BelongsTo
97:         return $this->belongsTo(Organization::class);
100:     public function fromWarehouse(): BelongsTo
102:         return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
105:     public function toWarehouse(): BelongsTo
107:         return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
115:     public function fromLocation(): BelongsTo
117:         return $this->belongsTo(ProductLocation::class, 'from_location_id');
125:     public function toLocation(): BelongsTo
127:         return $this->belongsTo(ProductLocation::class, 'to_location_id');
135:     public function transferredBy(): BelongsTo
137:         return $this->belongsTo(User::class, 'transferred_by');
147:     public function completer(): BelongsTo
149:         return $this->belongsTo(User::class, 'completed_by');
157:     public function approver(): BelongsTo
159:         return $this->belongsTo(User::class, 'approved_by');
175:     public function items(): HasMany
177:         return $this->hasMany(StockTransferItem::class);
```



<a id="e0108"></a>

> Audit provenance: `inventory.md` lines 5159–5182. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockTransferItem
[app/Models/Inventory/StockTransferItem.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/StockTransferItem.php#L1)

```php
25:     protected $fillable = [
26:         'stock_transfer_id',
27:         'product_id',
28:         'product_variant_id',
29:         'quantity',
30:         'notes',
31:     ];
33:     protected function casts(): array
34:     {
35:         return [
36:             'quantity' => 'integer',
37:         ];
45:     public function stockTransfer(): BelongsTo
47:         return $this->belongsTo(StockTransfer::class);
55:     public function product(): BelongsTo
57:         return $this->belongsTo(Product::class);
59:     public function variant(): BelongsTo
61:         return $this->belongsTo(ProductVariant::class, 'product_variant_id');
```



<a id="e0133"></a>

> Audit provenance: `inventory.md` lines 5840–5865. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_03_12_100000_create_stock_transfers_table.php
[database/migrations/2026_03_12_100000_create_stock_transfers_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_03_12_100000_create_stock_transfers_table.php#L1)

```php
11:         Schema::create('stock_transfers', function (Blueprint $table) {
12:             $table->id();
13:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
14:             $table->string('transfer_number')->unique();
15:             $table->foreignId('from_location_id')->constrained('product_locations')->cascadeOnDelete();
16:             $table->foreignId('to_location_id')->constrained('product_locations')->cascadeOnDelete();
17:             $table->foreignId('transferred_by')->constrained('users')->cascadeOnDelete();
18:             $table->enum('status', ['pending', 'in_transit', 'completed', 'cancelled'])->default('pending');
19:             $table->text('notes')->nullable();
20:             $table->timestamp('completed_at')->nullable();
21:             $table->timestamps();
23:             $table->index(['organization_id', 'status']);
24:             $table->index(['organization_id', 'transfer_number']);
27:         Schema::create('stock_transfer_items', function (Blueprint $table) {
28:             $table->id();
29:             $table->foreignId('stock_transfer_id')->constrained('stock_transfers')->cascadeOnDelete();
30:             $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
31:             $table->integer('quantity');
32:             $table->text('notes')->nullable();
33:             $table->timestamps();
```



<a id="e0149"></a>

> Audit provenance: `inventory.md` lines 6160–6169. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_09_30_142347_add_completed_by_to_stock_transfers_table.php
[database/migrations/2026_09_30_142347_add_completed_by_to_stock_transfers_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_09_30_142347_add_completed_by_to_stock_transfers_table.php#L1)

```php
17:         Schema::table('stock_transfers', function (Blueprint $table) {
18:             $table->foreignId('completed_by')->nullable()->after('completed_at')->constrained('users')->nullOnDelete();
24:         Schema::table('stock_transfers', function (Blueprint $table) {
25:             $table->dropConstrainedForeignId('completed_by');
```



<a id="e0153"></a>

> Audit provenance: `inventory.md` lines 6222–6235. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_21_000003_add_prepared_variant_transfers.php
[database/migrations/2026_10_21_000003_add_prepared_variant_transfers.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_21_000003_add_prepared_variant_transfers.php#L1)

```php
18:         Schema::table('stock_transfers', function (Blueprint $table): void {
19:             $table->string('status')->default('pending')->change();
20:             $table->timestamp('prepared_at')->nullable();
21:             $table->timestamp('stock_dispatched_at')->nullable();
23:         Schema::table('stock_transfer_items', function (Blueprint $table): void {
24:             $table->foreignId('product_variant_id')->nullable()->constrained('product_variants')->restrictOnDelete();
37:         Schema::table('stock_transfer_items', fn (Blueprint $table) => $table->dropConstrainedForeignId('product_variant_id'));
38:         Schema::table('stock_transfers', fn (Blueprint $table) => $table->dropColumn(['prepared_at', 'stock_dispatched_at']));
```



<a id="e0495"></a>

> Audit provenance: `additional-contracts.md` lines 1031–1062. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/StockTransfer/ShipStockTransferRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/StockTransfer/ShipStockTransferRequest.php#L1). SHA-256: `589033c813cbc4dec67f610a8828a8550bb90c084ac93b470e16dd90bb7cef2a`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\StockTransfer;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates marking a stock transfer as shipped (in transit) via the REST API.
11:  */
12: final class ShipStockTransferRequest extends FormRequest
13: {
14:     /**
15:      * @return array<string, array<int, string>>
16:      */
17:     public function rules(): array
18:     {
19:         return [
20:             'shipping_method' => ['nullable', 'string', 'max:255'],
21:             'tracking_number' => ['nullable', 'string', 'max:255'],
22:             'estimated_arrival' => ['nullable', 'date'],
23:         ];
24:     }
25: }
```



<a id="e0496"></a>

> Audit provenance: `additional-contracts.md` lines 1063–1108. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/StockTransfer/StoreStockTransferRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/StockTransfer/StoreStockTransferRequest.php#L1). SHA-256: `13a7cc4cf7c7654ba54b54b772dd3ff746c3c3e357a211d1dca31b566ec082f3`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\StockTransfer;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a new stock transfer via the REST API. Same fields as the web
12:  * form, but every location and product id must belong to the caller's
13:  * organization so a foreign id is a 422 rather than a lookup failure.
14:  */
15: final class StoreStockTransferRequest extends FormRequest
16: {
17:     /**
18:      * @return array<string, mixed>
19:      */
20:     public function rules(): array
21:     {
22:         $organizationId = $this->user()->organization_id;
23:         $ownLocation = Rule::exists('product_locations', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at');
24: 
25:         return [
26:             'from_location_id' => ['required', 'integer', $ownLocation],
27:             'to_location_id' => ['required', 'integer', $ownLocation, 'different:from_location_id'],
28:             'notes' => ['nullable', 'string', 'max:1000'],
29:             'shipping_method' => ['nullable', 'string', 'max:255'],
30:             'tracking_number' => ['nullable', 'string', 'max:255'],
31:             'estimated_arrival' => ['nullable', 'date'],
32:             'items' => ['required', 'array', 'min:1', 'max:500'],
33:             'items.*.product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
34:             'items.*.product_variant_id' => ['nullable', 'integer', 'exists:product_variants,id'],
35:             'items.*.quantity' => ['required', 'integer', 'min:1'],
36:             'items.*.notes' => ['nullable', 'string', 'max:500'],
37:         ];
38:     }
39: }
```

