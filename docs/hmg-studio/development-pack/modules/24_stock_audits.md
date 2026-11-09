# 24. Stock Audits and Cycle Counts — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Stock Audits and Cycle Counts as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Draft/create/edit/start; scoped item snapshots; count/revision history; review/recount; offline count drafts; variance posting; cycle schedules.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Inventory / Products](../modules/11_inventory.md), [Locations](../modules/19_locations.md), [Warehouses](../modules/20_warehouses.md), [Stock Adjustments](../modules/21_stock_adjustments.md), [Roles and Permission Sets](../modules/31_roles_permissions.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/StockAudits/CountHistory.vue` | Pending | Pending |
| `resources/js/Pages/StockAudits/Create.vue` | Pending | Pending |
| `resources/js/Pages/StockAudits/CycleCounts/Form.vue` | Pending | Pending |
| `resources/js/Pages/StockAudits/CycleCounts/Index.vue` | Pending | Pending |
| `resources/js/Pages/StockAudits/Edit.vue` | Pending | Pending |
| `resources/js/Pages/StockAudits/Index.vue` | Pending | Pending |
| `resources/js/Pages/StockAudits/Show.vue` | Pending | Pending |

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

- [ ] Stale count revision is rejected.
- [ ] local draft survives network failure and remains tenant-scoped.
- [ ] required variance approval blocks completion.
- [ ] allow-uncounted leaves those lines unchanged.
- [ ] posted discrepancies apply once.
- [ ] due schedule avoids duplicate open audits.

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

- [Audits/count history/reviews/offline drafts](#e0010)
- [Cycle schedules](#e0011)
- [StockAudits/CountHistory](#e0032)
- [StockAudits/Create](#e0033)
- [StockAudits/CycleCounts/Form](#e0034)
- [StockAudits/CycleCounts/Index](#e0035)
- [StockAudits/Edit](#e0036)
- [StockAudits/Index](#e0037)
- [StockAudits/Show](#e0038)
- [Components/StockAuditReviewEvidence](#e0057)
- [StockAudit/ListStockAuditItemsRequest.php](#e0067)
- [StockAudit/ReviewStockAuditCountRequest.php](#e0068)
- [StockAudit/StoreStockAuditRequest.php](#e0069)
- [StockAudit/UpdateStockAuditRequest.php](#e0070)
- [CycleCountScheduleController.php — 72-199](#e0081)
- [StockAuditController.php — 385-440](#e0089)
- [StockAudit](#e0109)
- [StockAuditItem](#e0110)
- [StockAuditCount](#e0111)
- [StockAuditReview](#e0112)
- [CycleCountSchedule](#e0113)
- [2026_03_20_000001_create_stock_audits_table.php](#e0134)
- [2026_09_29_000003_create_cycle_count_schedules_table.php](#e0148)
- [2026_10_21_000002_add_stock_audit_warehouse_scope.php](#e0152)
- [2026_10_26_000002_create_stock_audit_counts.php](#e0157)
- [2026_10_27_000001_add_stock_audit_variance_reviews.php](#e0158)
- [2026_10_27_000002_index_stock_audit_item_pages.php](#e0159)
- [`app/Http/Requests/Api/StockAudit/RecordStockAuditCountRequest.php`](#e0493)
- [`app/Http/Requests/Api/StockAudit/StoreStockAuditRequest.php`](#e0494)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0010"></a>

> Audit provenance: `inventory.md` lines 82–92. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Audits/count history/reviews/offline drafts

- Create draft with type full/cycle/spot; optional warehouse/location; optional chosen products for non-full UI; require_variance_approval false default. Warehouse selection clears location and narrows choices. No `assigned_to` input exists on manual audit creation.
- Start only draft with at least one item; acquires organization workflow lock, refreshes system quantities at start, becomes in_progress. Existing loaded lines are invalidated. [StockAuditService:115-146](C:/Users/proj/Inventoros/app/Services/StockAuditService.php#L115).
- Draft editing changes metadata/type/location/review requirement, not product selection or warehouse ID. Start/edit/delete are draft-only; count/complete require in_progress and manage_stock_audits. [Show:160-164](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L160).
- Line edit sets quantity from retained local draft, existing count, or system quantity in that order. Count integer 0..2,147,483,647; notes <=500; optimistic `expected_revision` preserves stale-write distinction. Count history is a dedicated paged view with reviewer evidence. [Show:203-253](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L203).
- Local draft storage is scoped by audit/organization; close editor retains draft; explicit discard clears it. Send drafts sequentially, fetch missing paged line, keep draft on offline/network/server rejection or stale_count; only acknowledge exact audit/item/revision response. Changing organization during request must not remove another scope's draft. Completion disabled with unsent drafts, save/sync/pending scans, or offline. **This is count draft retention, not a fully offline application.** [Show:232-337](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L232), related composable/lib in auxiliary evidence.
- Review decisions approved/recount_requested require the exact 64-char hex count revision; recount notes required 3..500. Self-approval depends on canSelfApprove; manage counts and approve stock adjustments are separate permissions. Stale_count, already-decided, self-approval and invalid-state errors have user messages. [Show:62-94](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L62).
- Completion requires reviewed variances when configured; uncounted lines need explicit allow_uncounted and remain unchanged; plugin veto can block posting. For counted lines, discrepancy = counted - snapshot; post only nonzero discrepancy through recount ledger; complete once under row lock. [StockAuditService:227-333](C:/Users/proj/Inventoros/app/Services/StockAuditService.php#L227).
- Scanning must resolve a line in **this audit**, not blindly use global product inventory; warehouse audits may require selecting the location when multiple candidate bins exist. Parent/variant ambiguity and wrong-location outcomes are distinct; see lookup/action source lines in Show and StockAuditReadService.



<a id="e0011"></a>

> Audit provenance: `inventory.md` lines 93–98. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Cycle schedules

- `frequency`: daily/weekly/monthly; `scope_type`: all/location/warehouse/category. Scope ID required unless all, and reset when type changes. There is no ABC classification scope.
- Defaults weekly, all, products_per_run 20, active true, no assignee, blank first run. Server max 1,000 products/run; chosen assignee must be member of organization. Blank first run follows controller default; do not assume browser local timezone equals organization timezone.
- Hourly scheduler runs due active schedules; draft cycle audits include never-counted then least-recently-counted active products, stable ID order. Previous still-open audit prevents another run; nothing in scope also creates nothing. Manual run leaves regular next run unchanged. [CycleCountService:34-133](C:/Users/proj/Inventoros/app/Services/CycleCountService.php#L34), [routes/console.php:38](C:/Users/proj/Inventoros/routes/console.php#L38).



<a id="e0032"></a>

> Audit provenance: `inventory.md` lines 1207–1234. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudits/CountHistory

GET /stock-audits/{audit}/items/{item}/counts; view_stock_audits. No input. Read current system/count/discrepancy, review evidence, and paginated count events: sequence/date/actor/system/count/discrepancy/notes. Back to audit link. This is historical evidence, not editable count form.

Source: [resources/js/Pages/StockAudits/CountHistory.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L1).

**Input fields:** none in this page/component template.


**Read fields, columns and section headings:**

- dt: Counted Qty — [resources/js/Pages/StockAudits/CountHistory.vue:33](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L33) — v-for="count in counts.data"
- dt: System Qty — [resources/js/Pages/StockAudits/CountHistory.vue:34](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L34) — v-for="count in counts.data"
- dt: Discrepancy — [resources/js/Pages/StockAudits/CountHistory.vue:35](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L35) — v-for="count in counts.data"
- th: # — [resources/js/Pages/StockAudits/CountHistory.vue:45](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L45)
- th: Date — [resources/js/Pages/StockAudits/CountHistory.vue:45](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L45)
- th: Counted By — [resources/js/Pages/StockAudits/CountHistory.vue:46](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L46)
- th: System Qty — [resources/js/Pages/StockAudits/CountHistory.vue:47](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L47)
- th: Counted Qty — [resources/js/Pages/StockAudits/CountHistory.vue:48](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L48)
- th: Discrepancy — [resources/js/Pages/StockAudits/CountHistory.vue:49](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L49)
- th: Notes — [resources/js/Pages/StockAudits/CountHistory.vue:50](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L50)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Back — [resources/js/Pages/StockAudits/CountHistory.vue:21](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L21) | :href="route('stock-audits.show', audit.id)" | No ancestor condition |



<a id="e0033"></a>

> Audit provenance: `inventory.md` lines 1235–1298. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudits/Create

GET /stock-audits/create; create_stock_audits. Initial type cycle, no warehouse/location, no products, review false. Details fields + non-full product selector with local name/SKU search, select-all filtered products and individual checkboxes. Warehouse change clears location. Submit draft; snapshot item membership and quantities service-owned.

Source: [resources/js/Pages/StockAudits/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockAudits/Create.vue:21
const form = useForm({
    name: '',
    description: '',
    audit_type: 'cycle',
    warehouse_id: '',
    warehouse_location_id: '',
    notes: '',
    product_ids: [],
    require_variance_approval: false,
});
// resources/js/Pages/StockAudits/Create.vue:36
const productSearch = ref('');
// resources/js/Pages/StockAudits/Create.vue:37
const selectAllProducts = ref(false);
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.name — [resources/js/Pages/StockAudits/Create.vue:111](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L111) | Audit Name * | text; '' | ; v-model="form.name"; type="text"; required; maxlength="255"; :placeholder="t('stockAudits.fields.namePlaceholder')" | Always within this view/dialog; see component visibility |
| form.description — [resources/js/Pages/StockAudits/Create.vue:129](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L129) | Description | textarea; '' | ; v-model="form.description"; rows="3"; maxlength="1000"; :placeholder="t('stockAudits.fields.descriptionPlaceholder')" | Always within this view/dialog; see component visibility |
| form.audit_type — [resources/js/Pages/StockAudits/Create.vue:147](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L147) | Audit Type * | select; 'cycle' | ; v-model="form.audit_type"; required | Always within this view/dialog; see component visibility |
| form.warehouse_id — [resources/js/Pages/StockAudits/Create.vue:166](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L166) | Warehouse | select; '' | ; v-model="form.warehouse_id" | Always within this view/dialog; see component visibility |
| form.warehouse_location_id — [resources/js/Pages/StockAudits/Create.vue:177](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L177) | Warehouse Location | select; '' | ; v-model="form.warehouse_location_id" | Always within this view/dialog; see component visibility |
| form.notes — [resources/js/Pages/StockAudits/Create.vue:201](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L201) | Notes | textarea; '' | ; v-model="form.notes"; rows="2"; maxlength="2000"; :placeholder="t('stockAudits.create.notesPlaceholder')" | Always within this view/dialog; see component visibility |
| form.require_variance_approval — [resources/js/Pages/StockAudits/Create.vue:213](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L213) | Require variance approval Variances need review before this audit can finish. | checkbox; false | v-model="form.require_variance_approval"; type="checkbox" | Always within this view/dialog; see component visibility |
| productSearch — [resources/js/Pages/StockAudits/Create.vue:230](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L230) | No explicit label / see context | text; '' | ; v-model="productSearch"; type="text"; :placeholder="t('stockAudits.create.searchProducts')" | v-if="form.audit_type !== 'full'" |
| selectAllProducts — [resources/js/Pages/StockAudits/Create.vue:240](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L240) | No explicit label / see context | checkbox; false | ; type="checkbox"; v-model="selectAllProducts"; @change="toggleSelectAll" | v-if="form.audit_type !== 'full'" |
| (unbound) — [resources/js/Pages/StockAudits/Create.vue:261](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L261) | product.name SKU: product.sku product.stock in stock | checkbox; See :value / :checked and event handler; not a v-model field | type="checkbox"; :checked="form.product_ids.includes(product.id)"; @change="toggleProduct(product.id)" | v-if="form.audit_type !== 'full'" → v-for="product in filteredProducts" |

**Select options and labels (exact source, including remote lists):**

- form.audit_type ([resources/js/Pages/StockAudits/Create.vue:147](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L147)): `&lt;option v-for="(label, value) in auditTypes" :key="value" :value="value"&gt;{{ t(`stockAudits.types.${value}`) }}&lt;/option&gt;`
- form.warehouse_id ([resources/js/Pages/StockAudits/Create.vue:166](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L166)): `&lt;option value=""&gt;{{ All Warehouses }}&lt;/option&gt; &lt;option v-for="warehouse in page.props.warehouses \|\| []" :key="warehouse.id" :value="warehouse.id"&gt;{{ warehouse.name }}&lt;/option&gt;`
- form.warehouse_location_id ([resources/js/Pages/StockAudits/Create.vue:177](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L177)): `&lt;option value=""&gt;{{ All Locations }}&lt;/option&gt; &lt;option v-for="location in scopedLocations" :key="location.id" :value="location.id"&gt; {{ location.name }} &lt;span v-if="location.code"&gt;({{ location.code }})&lt;/span&gt; &lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: Audit Details — [resources/js/Pages/StockAudits/Create.vue:104](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L104)
- h3: Select Products — [resources/js/Pages/StockAudits/Create.vue:222](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L222) — v-if="form.audit_type !== 'full'"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/StockAudits/Create.vue:84](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L84) | :href="route('stock-audits.index')" | No ancestor condition |
| Stock Audits — [resources/js/Pages/StockAudits/Create.vue:86](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L86) | :href="route('stock-audits.index')" | No ancestor condition |
| Back to List — [resources/js/Pages/StockAudits/Create.vue:94](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L94) | variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.index')" | No ancestor condition |
| Cancel — [resources/js/Pages/StockAudits/Create.vue:298](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L298) | variant="secondary"; as="Link"; :href="route('stock-audits.index')" | No ancestor condition |
| form.processing ? Creating... : Create Audit — [resources/js/Pages/StockAudits/Create.vue:299](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L299) | type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing \|\| !form.name" | No ancestor condition |

**Script endpoint names:** `stock-audits.store`. Match these to verb/path/permission in the route annex.



<a id="e0034"></a>

> Audit provenance: `inventory.md` lines 1299–1352. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudits/CycleCounts/Form

GET /cycle-counts/create or /cycle-counts/{id}/edit; manage_stock_audits. Shared create/edit page with name/frequency/scope and conditional scope_id/products_per_run/assignee/next_run_at/active. Changing scope clears ID. Blank next_run_at serialized null. POST or PUT according to presence of schedule prop.

Source: [resources/js/Pages/StockAudits/CycleCounts/Form.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockAudits/CycleCounts/Form.vue:25
const form = useForm({
    name: props.schedule?.name ?? '',
    frequency: props.schedule?.frequency ?? 'weekly',
    scope_type: props.schedule?.scope_type ?? 'all',
    scope_id: props.schedule?.scope_id ?? null,
    products_per_run: props.schedule?.products_per_run ?? 20,
    assigned_to: props.schedule?.assigned_to ?? null,
    is_active: props.schedule?.is_active ?? true,
    next_run_at: props.schedule?.next_run_at ?? '',
});
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.name — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:90](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L90) | Name | text; props.schedule?.name ?? '' | ; v-model="form.name"; type="text"; maxlength="255"; required; :placeholder="t('cycleCounts.namePlaceholder')" | Always within this view/dialog; see component visibility |
| form.frequency — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:97](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L97) | Frequency | select; props.schedule?.frequency ?? 'weekly' | ; v-model="form.frequency" | Always within this view/dialog; see component visibility |
| form.products_per_run — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:104](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L104) | Products per run | number; props.schedule?.products_per_run ?? 20 | ; v-model.number="form.products_per_run"; type="number"; min="1"; max="1000"; inputmode="numeric"; required | Always within this view/dialog; see component visibility |
| form.scope_type — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:113](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L113) | Scope | select; props.schedule?.scope_type ?? 'all' | ; v-model="form.scope_type" | Always within this view/dialog; see component visibility |
| form.scope_id — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:120](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L120) | t(`cycleCounts.scopes.${form.scope_type}`) | select; props.schedule?.scope_id ?? null | ; v-model="form.scope_id"; required | v-if="form.scope_type !== 'all'" |
| form.assigned_to — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:131](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L131) | Assignee | select; props.schedule?.assigned_to ?? null | ; v-model="form.assigned_to" | Always within this view/dialog; see component visibility |
| form.next_run_at — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:139](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L139) | editing ? Next run : First run | datetime-local; props.schedule?.next_run_at ?? '' | ; v-model="form.next_run_at"; type="datetime-local" | Always within this view/dialog; see component visibility |
| form.is_active — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:146](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L146) | Active (runs on schedule) | checkbox; props.schedule?.is_active ?? true | v-model="form.is_active"; type="checkbox" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- form.frequency ([resources/js/Pages/StockAudits/CycleCounts/Form.vue:97](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L97)): `&lt;option v-for="f in frequencies" :key="f" :value="f"&gt;{{ t(`cycleCounts.frequencies.${f}`) }}&lt;/option&gt;`
- form.scope_type ([resources/js/Pages/StockAudits/CycleCounts/Form.vue:113](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L113)): `&lt;option v-for="s in scopes" :key="s" :value="s"&gt;{{ t(`cycleCounts.scopes.${s}`) }}&lt;/option&gt;`
- form.scope_id ([resources/js/Pages/StockAudits/CycleCounts/Form.vue:120](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L120)): `&lt;option :value="null" disabled&gt;{{ Choose one }}&lt;/option&gt; &lt;option v-for="o in scopeOptions" :key="o.id" :value="o.id"&gt;{{ o.code ? `${o.name} (${o.code})` : o.name }}&lt;/option&gt;`
- form.assigned_to ([resources/js/Pages/StockAudits/CycleCounts/Form.vue:131](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L131)): `&lt;option :value="null"&gt;{{ Unassigned }}&lt;/option&gt; &lt;option v-for="u in users" :key="u.id" :value="u.id"&gt;{{ u.name }}&lt;/option&gt;`

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Stock Audits — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:69](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L69) | :href="route('stock-audits.index')" | No ancestor condition |
| Cycle count schedules — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:71](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L71) | :href="route('cycle-counts.index')" | No ancestor condition |
| Back — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:79](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L79) | variant="secondary"; size="sm"; as="Link"; :href="route('cycle-counts.index')" | No ancestor condition |
| Cancel — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:151](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L151) | variant="secondary"; size="lg"; as="Link"; :href="route('cycle-counts.index')" | No ancestor condition |
| editing ? Save Changes : Create schedule — [resources/js/Pages/StockAudits/CycleCounts/Form.vue:152](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L152) | type="submit"; size="lg"; :loading="form.processing"; :disabled="form.processing" | No ancestor condition |

**Script endpoint names:** `cycle-counts.update`, `cycle-counts.store`. Match these to verb/path/permission in the route annex.



<a id="e0035"></a>

> Audit provenance: `inventory.md` lines 1353–1385. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudits/CycleCounts/Index

GET /cycle-counts; view_stock_audits. Schedule cards name/frequency/active/scope/products per run/assignee/next run/last audit; create/edit/run-now/delete require manage_stock_audits. Run-now disabled while processing; errors explain no audit when existing open or empty scope. No search/filter inputs on this page.

Source: [resources/js/Pages/StockAudits/CycleCounts/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L1).

**Input fields:** none in this page/component template.


**Read fields, columns and section headings:**

- h3: schedule.name — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:89](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L89) — v-for="schedule in schedules"
- dt: Scope : — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:96](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L96) — v-for="schedule in schedules"
- dt: Products per run : — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:97](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L97) — v-for="schedule in schedules"
- dt: Assignee : — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:98](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L98) — v-for="schedule in schedules"
- dt: Next run : — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:99](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L99) — v-for="schedule in schedules"
- dt: Last audit : — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:101](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L101) — v-for="schedule in schedules"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Stock Audits — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:50](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L50) | :href="route('stock-audits.index')" | No ancestor condition |
| Stock audits — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:58](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L58) | variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.index')" | No ancestor condition |
| New schedule — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:62](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L62) | v-if="(canManage) && canVisit('cycle-counts.create')"; size="sm"; as="Link"; :href="route('cycle-counts.create')" | No ancestor condition |
| New schedule — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:78](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L78) | v-if="(canManage) && canVisit('cycle-counts.create')"; size="lg"; as="Link"; :href="route('cycle-counts.create')" | v-if="schedules.length === 0" |
| schedule.last_audit.audit_number — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:103](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L103) | v-if="schedule.last_audit"; :href="route('stock-audits.show', schedule.last_audit.id)" | v-for="schedule in schedules" |
| Run now — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:114](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L114) | variant="secondary"; size="lg"; @click="runNow(schedule)" | v-for="schedule in schedules" → v-if="canManage" |
| Edit — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:118](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L118) | v-if="canVisit('cycle-counts.edit')"; variant="secondary"; size="lg"; as="Link"; :href="route('cycle-counts.edit', schedule.id)" | v-for="schedule in schedules" → v-if="canManage" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/StockAudits/CycleCounts/Index.vue:122](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L122) | variant="ghost"; size="lg"; :aria-label="t('common.delete')"; @click="destroy(schedule)" | v-for="schedule in schedules" → v-if="canManage" |

**Script endpoint names:** `cycle-counts.run`, `cycle-counts.destroy`. Match these to verb/path/permission in the route annex.



<a id="e0036"></a>

> Audit provenance: `inventory.md` lines 1386–1438. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudits/Edit

GET /stock-audits/{audit}/edit; manage_stock_audits and draft. Saved metadata defaults; fields name/description/type/location/notes/review toggle. No product set or warehouse selector. PUT update; links detail/back.

Source: [resources/js/Pages/StockAudits/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockAudits/Edit.vue:18
const form = useForm({
    name: props.audit.name || '',
    description: props.audit.description || '',
    audit_type: props.audit.audit_type || 'cycle',
    warehouse_location_id: props.audit.warehouse_location_id || '',
    notes: props.audit.notes || '',
    require_variance_approval: Boolean(props.audit.require_variance_approval),
});
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.name — [resources/js/Pages/StockAudits/Edit.vue:71](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L71) | Audit Name * | text; props.audit.name \|\| '' | ; v-model="form.name"; type="text"; required; maxlength="255" | Always within this view/dialog; see component visibility |
| form.description — [resources/js/Pages/StockAudits/Edit.vue:85](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L85) | Description | textarea; props.audit.description \|\| '' | ; v-model="form.description"; rows="3"; maxlength="1000"; :placeholder="t('stockAudits.fields.descriptionPlaceholder')" | Always within this view/dialog; see component visibility |
| form.audit_type — [resources/js/Pages/StockAudits/Edit.vue:100](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L100) | Audit Type * | select; props.audit.audit_type \|\| 'cycle' | ; v-model="form.audit_type"; required | Always within this view/dialog; see component visibility |
| form.warehouse_location_id — [resources/js/Pages/StockAudits/Edit.vue:114](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L114) | Warehouse Location | select; props.audit.warehouse_location_id \|\| '' | ; v-model="form.warehouse_location_id" | Always within this view/dialog; see component visibility |
| form.notes — [resources/js/Pages/StockAudits/Edit.vue:132](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L132) | Notes | textarea; props.audit.notes \|\| '' | ; v-model="form.notes"; rows="3"; maxlength="2000"; :placeholder="t('stockAudits.edit.notesPlaceholder')" | Always within this view/dialog; see component visibility |
| form.require_variance_approval — [resources/js/Pages/StockAudits/Edit.vue:145](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L145) | Require variance approval Variances need review before this audit can finish. | checkbox; Boolean(props.audit.require_variance_approval) | v-model="form.require_variance_approval"; type="checkbox" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- form.audit_type ([resources/js/Pages/StockAudits/Edit.vue:100](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L100)): `&lt;option v-for="(label, value) in auditTypes" :key="value" :value="value"&gt;{{ t(`stockAudits.types.${value}`) }}&lt;/option&gt;`
- form.warehouse_location_id ([resources/js/Pages/StockAudits/Edit.vue:114](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L114)): `&lt;option value=""&gt;{{ All Locations }}&lt;/option&gt; &lt;option v-for="location in locations" :key="location.id" :value="location.id"&gt; {{ location.name }} &lt;span v-if="location.code"&gt;({{ location.code }})&lt;/span&gt; &lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: Audit Details — [resources/js/Pages/StockAudits/Edit.vue:66](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L66)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/StockAudits/Edit.vue:43](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L43) | :href="route('stock-audits.index')" | No ancestor condition |
| Stock Audits — [resources/js/Pages/StockAudits/Edit.vue:45](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L45) | :href="route('stock-audits.index')" | No ancestor condition |
| Back to Audit — [resources/js/Pages/StockAudits/Edit.vue:53](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L53) | variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.show', audit.id)" | No ancestor condition |
| View — [resources/js/Pages/StockAudits/Edit.vue:57](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L57) | variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.show', audit.id)" | No ancestor condition |
| Cancel — [resources/js/Pages/StockAudits/Edit.vue:150](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L150) | variant="secondary"; as="Link"; :href="route('stock-audits.show', audit.id)" | No ancestor condition |
| form.processing ? Saving... : Update Audit — [resources/js/Pages/StockAudits/Edit.vue:151](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L151) | type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing \|\| !form.name" | No ancestor condition |

**Script endpoint names:** `stock-audits.update`. Match these to verb/path/permission in the route annex.



<a id="e0037"></a>

> Audit provenance: `inventory.md` lines 1439–1493. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudits/Index

GET /stock-audits; view_stock_audits. Search, status, type filters; columns number/name/type/status/location/item count/creator/date/view. New audit needs create_stock_audits; cycle-count link needs access. Plugin slots and pagination.

Source: [resources/js/Pages/StockAudits/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockAudits/Index.vue:28
const search = ref(props.filters?.search || '');
// resources/js/Pages/StockAudits/Index.vue:29
const selectedStatus = ref(props.filters?.status || '');
// resources/js/Pages/StockAudits/Index.vue:30
const selectedType = ref(props.filters?.audit_type || '');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| search — [resources/js/Pages/StockAudits/Index.vue:97](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L97) | Search | text; props.filters?.search \|\| '' | ; v-model="search"; type="text"; :placeholder="t('stockAudits.index.searchPlaceholder')" | Always within this view/dialog; see component visibility |
| selectedStatus — [resources/js/Pages/StockAudits/Index.vue:106](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L106) | Status | select; props.filters?.status \|\| '' | ; v-model="selectedStatus" | Always within this view/dialog; see component visibility |
| selectedType — [resources/js/Pages/StockAudits/Index.vue:113](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L113) | Audit Type | select; props.filters?.audit_type \|\| '' | ; v-model="selectedType" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- selectedStatus ([resources/js/Pages/StockAudits/Index.vue:106](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L106)): `&lt;option value=""&gt;{{ All Statuses }}&lt;/option&gt; &lt;option v-for="(label, value) in statuses" :key="value" :value="value"&gt;{{ t(`stockAudits.statuses.${value}`) }}&lt;/option&gt;`
- selectedType ([resources/js/Pages/StockAudits/Index.vue:113](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L113)): `&lt;option value=""&gt;{{ All Types }}&lt;/option&gt; &lt;option v-for="(label, value) in auditTypes" :key="value" :value="value"&gt;{{ t(`stockAudits.types.${value}`) }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- th: Audit # — [resources/js/Pages/StockAudits/Index.vue:134](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L134)
- th: Name — [resources/js/Pages/StockAudits/Index.vue:135](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L135)
- th: Type — [resources/js/Pages/StockAudits/Index.vue:136](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L136)
- th: Status — [resources/js/Pages/StockAudits/Index.vue:137](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L137)
- th: Location — [resources/js/Pages/StockAudits/Index.vue:138](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L138)
- th: Items — [resources/js/Pages/StockAudits/Index.vue:139](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L139)
- th: Created By — [resources/js/Pages/StockAudits/Index.vue:140](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L140)
- th: Date — [resources/js/Pages/StockAudits/Index.vue:141](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L141)
- th: Actions — [resources/js/Pages/StockAudits/Index.vue:142](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L142)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Cycle count schedules — [resources/js/Pages/StockAudits/Index.vue:78](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L78) | variant="secondary"; size="sm"; as="Link"; :href="route('cycle-counts.index')" | No ancestor condition |
| New Audit — [resources/js/Pages/StockAudits/Index.vue:82](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L82) | v-if="canVisit('stock-audits.create')"; variant="default"; size="sm"; as="Link"; :href="route('stock-audits.create')" | No ancestor condition |
| Clear Filters — [resources/js/Pages/StockAudits/Index.vue:124](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L124) | type="button"; variant="secondary"; size="sm"; @click="clearFilters" | No ancestor condition |
| Create First Audit — [resources/js/Pages/StockAudits/Index.vue:151](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L151) | v-if="canVisit('stock-audits.create')"; variant="default"; size="sm"; as="Link"; :href="route('stock-audits.create')" | v-if="!audits.data \|\| audits.data.length === 0" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/StockAudits/Index.vue:190](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L190) | :href="route('stock-audits.show', audit.id)"; :title="t('common.view')" | v-for="audit in audits.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/StockAudits/Index.vue:206](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L206) | v-if="link.url"; :href="link.url"; v-html="link.label" | v-if="audits.data && audits.data.length &gt; 0 && audits.links && audits.links.length &gt; 3" → v-for="link in audits.links" |

**Script endpoint names:** `stock-audits.index`. Match these to verb/path/permission in the route annex.



<a id="e0038"></a>

> Audit provenance: `inventory.md` lines 1494–1620. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudits/Show

GET /stock-audits/{audit}; view_stock_audits. Metadata/summary/progress/discrepancy totals; count table product/location/system/count/difference/status/counter/actions. Search/item_status/page-size 25/50/100 with paged results. Status filter all/pending/counted/variance/review. Draft start/edit/delete; in-progress count/complete; exact conditions described above. Count row quantity+notes, scan location selector for multiple bins, local draft send/discard, reviewer notes modal for approve/recount. A clicked review action supplies hidden decision and expected_revision. Scanner raw code targets audit lookup. Count-history link per item; review requirements prevent premature completion.

Source: [resources/js/Pages/StockAudits/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/StockAudits/Show.vue:49
const processing = ref(false);
// resources/js/Pages/StockAudits/Show.vue:50
const lineSearch = ref(props.itemFilters?.search || '');
// resources/js/Pages/StockAudits/Show.vue:51
const lineStatus = ref(props.itemFilters?.item_status || 'all');
// resources/js/Pages/StockAudits/Show.vue:52
const linePageSize = ref(props.itemFilters?.per_page || 25);
// resources/js/Pages/StockAudits/Show.vue:63
const reviewItem = ref(null);
// resources/js/Pages/StockAudits/Show.vue:64
const reviewDecision = ref('approved');
// resources/js/Pages/StockAudits/Show.vue:65
const reviewRevision = ref('');
// resources/js/Pages/StockAudits/Show.vue:66
const reviewNotes = ref('');
// resources/js/Pages/StockAudits/Show.vue:67
const reviewError = ref('');
// resources/js/Pages/StockAudits/Show.vue:68
const reviewing = ref(false);
// resources/js/Pages/StockAudits/Show.vue:96
const editingItemId = ref(null);
// resources/js/Pages/StockAudits/Show.vue:97
const countValue = ref(0);
// resources/js/Pages/StockAudits/Show.vue:98
const countNotes = ref('');
// resources/js/Pages/StockAudits/Show.vue:99
const savingCount = ref(false);
// resources/js/Pages/StockAudits/Show.vue:100
const editingRevision = ref(null);
// resources/js/Pages/StockAudits/Show.vue:101
const syncingDrafts = ref(false);
// resources/js/Pages/StockAudits/Show.vue:102
const pendingScans = ref(0);
// resources/js/Pages/StockAudits/Show.vue:103
const draftMessage = ref('');
// resources/js/Pages/StockAudits/Show.vue:104
const online = ref(typeof navigator === 'undefined' || navigator.onLine);
// resources/js/Pages/StockAudits/Show.vue:352
const showScanner = ref(false);
// resources/js/Pages/StockAudits/Show.vue:353
const scanLocationId = ref('');
// resources/js/Pages/StockAudits/Show.vue:355
const scanMode = ref('increment');
// resources/js/Pages/StockAudits/Show.vue:356
const scanMessage = ref('');
// resources/js/Pages/StockAudits/Show.vue:357
const scanMessageTone = ref('info');
// resources/js/Pages/StockAudits/Show.vue:358
const highlightedItemId = ref(null);
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| scanLocationId — [resources/js/Pages/StockAudits/Show.vue:637](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L637) | No explicit label / see context | select; '' | v-if="scanLocations.length &gt; 1"; v-model="scanLocationId"; :disabled="pendingScans &gt; 0 \|\| savingCount \|\| syncingDrafts" | v-if="canCount" |
| lineSearch — [resources/js/Pages/StockAudits/Show.vue:689](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L689) | No explicit label / see context | search; props.itemFilters?.search \|\| '' | v-model="lineSearch"; type="search"; :placeholder="t('auditPaging.search')"; maxlength="200"; :disabled="savingCount \|\| syncingDrafts \|\| pendingScans &gt; 0" | Always within this view/dialog; see component visibility |
| lineStatus — [resources/js/Pages/StockAudits/Show.vue:690](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L690) | No explicit label / see context | select; props.itemFilters?.item_status \|\| 'all' | v-model="lineStatus"; :disabled="savingCount \|\| syncingDrafts \|\| pendingScans &gt; 0"; @change="filterLines" | Always within this view/dialog; see component visibility |
| linePageSize — [resources/js/Pages/StockAudits/Show.vue:693](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L693) | Lines per page | select; props.itemFilters?.per_page \|\| 25 | ; v-model="linePageSize"; :disabled="savingCount \|\| syncingDrafts \|\| pendingScans &gt; 0"; @change="filterLines" | Always within this view/dialog; see component visibility |
| countValue — [resources/js/Pages/StockAudits/Show.vue:772](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L772) | No explicit label / see context | number; 0 | ; v-model.number="countValue"; type="number"; min="0"; max="2147483647"; step="1"; :disabled="savingCount \|\| syncingDrafts"; @keyup.enter="saveCount(item)"; @keyup.escape="cancelCounting" | v-for="item in audit.items" → v-else |
| countNotes — [resources/js/Pages/StockAudits/Show.vue:790](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L790) | No explicit label / see context | text; '' | v-model="countNotes"; type="text"; maxlength="500"; :disabled="savingCount \|\| syncingDrafts"; :placeholder="t('stockAudits.show.countNotesPlaceholder')"; @keyup.enter="saveCount(item)" | v-for="item in audit.items" → v-else |
| reviewNotes — [resources/js/Pages/StockAudits/Show.vue:921](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L921) | Review notes | textarea; '' | v-model="reviewNotes"; rows="3"; maxlength="500"; :minlength="reviewDecision === 'recount_requested' ? 3 : undefined"; :required="reviewDecision === 'recount_requested'" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- scanLocationId ([resources/js/Pages/StockAudits/Show.vue:637](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L637)): `1" v-model="scanLocationId" :disabled="pendingScans &gt; 0 \|\| savingCount \|\| syncingDrafts" :aria-label="Location" class="min-h-11 rounded-md border border-border-subtle bg-surface-canvas px-3 text-sm ds-focus-ring"&gt; &lt;option value=""&gt;{{ Select a location }}&lt;/option&gt; &lt;option v-for="location in scanLocations" :key="location.id" :value="location.id"&gt;{{ location.name }}&lt;/option&gt;`
- lineStatus ([resources/js/Pages/StockAudits/Show.vue:690](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L690)): `0" @change="filterLines"&gt; &lt;option v-for="status in ['all', 'pending', 'counted', 'variance', 'review']" :key="status" :value="status"&gt;{{ t(`auditPaging.${status}`) }}&lt;/option&gt;`
- linePageSize ([resources/js/Pages/StockAudits/Show.vue:693](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L693)): `0" @change="filterLines"&gt;&lt;option :value="25"&gt;25&lt;/option&gt;&lt;option :value="50"&gt;50&lt;/option&gt;&lt;option :value="100"&gt;100&lt;/option&gt;`

**Read fields, columns and section headings:**

- h2: Count drafts ({count}) — [resources/js/Pages/StockAudits/Show.vue:524](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L524) — v-if="draftCount &gt; 0 \|\| !online \|\| draftMessage"
- h3: Audit Details — [resources/js/Pages/StockAudits/Show.vue:581](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L581)
- h3: Audit Items ({counted} of {total} counted) — [resources/js/Pages/StockAudits/Show.vue:627](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L627)
- th: Product — [resources/js/Pages/StockAudits/Show.vue:700](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L700)
- th: Location — [resources/js/Pages/StockAudits/Show.vue:701](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L701)
- th: System Qty — [resources/js/Pages/StockAudits/Show.vue:702](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L702)
- th: Counted Qty — [resources/js/Pages/StockAudits/Show.vue:703](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L703)
- th: Discrepancy — [resources/js/Pages/StockAudits/Show.vue:704](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L704)
- th: Status — [resources/js/Pages/StockAudits/Show.vue:705](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L705)
- th: Counted By — [resources/js/Pages/StockAudits/Show.vue:706](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L706)
- th: Actions — [resources/js/Pages/StockAudits/Show.vue:707](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L707)
- h3: Actions — [resources/js/Pages/StockAudits/Show.vue:855](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L855) — v-if="canStart \|\| canComplete"
- h3: Danger Zone — [resources/js/Pages/StockAudits/Show.vue:889](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L889) — v-if="canDelete"
- h2: t(reviewDecision === 'approved' ? 'auditReview.approve' : 'auditReview.requestRecount') — [resources/js/Pages/StockAudits/Show.vue:918](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L918)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/StockAudits/Show.vue:491](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L491) | :href="route('stock-audits.index')" | No ancestor condition |
| Stock Audits — [resources/js/Pages/StockAudits/Show.vue:493](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L493) | :href="route('stock-audits.index')" | No ancestor condition |
| Edit — [resources/js/Pages/StockAudits/Show.vue:503](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L503) | v-if="(canEdit) && canVisit('stock-audits.edit')"; variant="default"; size="sm"; as="Link"; :href="route('stock-audits.edit', audit.id)" | No ancestor condition |
| Back to List — [resources/js/Pages/StockAudits/Show.vue:513](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L513) | variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.index')" | No ancestor condition |
| Send saved counts — [resources/js/Pages/StockAudits/Show.vue:530](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L530) | v-if="canCount"; size="sm"; :loading="syncingDrafts"; :disabled="!online \|\| savingCount \|\| syncingDrafts \|\| pendingScans &gt; 0"; @click="sendDrafts" | v-if="draftCount &gt; 0 \|\| !online \|\| draftMessage" → v-if="draftCount &gt; 0" |
| Discard all drafts — [resources/js/Pages/StockAudits/Show.vue:533](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L533) | variant="secondary"; size="sm"; :disabled="savingCount \|\| syncingDrafts \|\| pendingScans &gt; 0"; @click="discardAllDrafts" | v-if="draftCount &gt; 0 \|\| !online \|\| draftMessage" → v-if="draftCount &gt; 0" |
| Scan — [resources/js/Pages/StockAudits/Show.vue:641](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L641) | size="lg"; :disabled="pendingScans &gt; 0 \|\| savingCount \|\| syncingDrafts"; @click="showScanner = true" | v-if="canCount" |
| Add 1 per scan — [resources/js/Pages/StockAudits/Show.vue:646](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L646) | type="button"; role="radio"; :aria-checked="scanMode === 'increment'"; :disabled="pendingScans &gt; 0 \|\| savingCount \|\| syncingDrafts"; @click="scanMode = 'increment'" | v-if="canCount" |
| Enter count — [resources/js/Pages/StockAudits/Show.vue:657](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L657) | type="button"; role="radio"; :aria-checked="scanMode === 'enter'"; :disabled="pendingScans &gt; 0 \|\| savingCount \|\| syncingDrafts"; @click="scanMode = 'enter'" | v-if="canCount" |
| View count history — [resources/js/Pages/StockAudits/Show.vue:717](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L717) | v-if="item.counted_quantity !== null"; :href="route('stock-audits.items.counts', { stockAudit: audit.id, item: item.id })" | v-for="item in audit.items" → v-if="editingItemId !== item.id" |
| Approve count — [resources/js/Pages/StockAudits/Show.vue:740](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L740) | type="button"; :disabled="!mayApprove(item)"; :title="!mayApprove(item) ? t('auditReview.errors.self') : ''"; @click="openReview(item, 'approved')" | v-for="item in audit.items" → v-if="editingItemId !== item.id" → v-if="audit.require_variance_approval && item.counted_quantity !== null" → v-if="canReview && !['approved', 'recount_requested'].includes(item.review_status)" |
| Request recount — [resources/js/Pages/StockAudits/Show.vue:741](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L741) | type="button"; @click="openReview(item, 'recount_requested')" | v-for="item in audit.items" → v-if="editingItemId !== item.id" → v-if="audit.require_variance_approval && item.counted_quantity !== null" → v-if="canReview && !['approved', 'recount_requested'].includes(item.review_status)" |
| drafts[item.id] ? Review draft : item.counted_quantity !== null ? Recount : Count — [resources/js/Pages/StockAudits/Show.vue:749](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L749) | @click="startCounting(item)"; :disabled="savingCount \|\| syncingDrafts \|\| pendingScans &gt; 0" | v-for="item in audit.items" → v-if="editingItemId !== item.id" → v-if="canCount" |
| savingCount ? '...' : Save — [resources/js/Pages/StockAudits/Show.vue:803](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L803) | size="sm"; :loading="savingCount"; :disabled="savingCount \|\| syncingDrafts"; @click="saveCount(item)" | v-for="item in audit.items" → v-else → v-if="canCount" |
| Close and keep draft — [resources/js/Pages/StockAudits/Show.vue:811](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L811) | variant="secondary"; size="sm"; :disabled="savingCount \|\| syncingDrafts"; @click="cancelCounting" | v-for="item in audit.items" → v-else → v-if="canCount" |
| Discard draft — [resources/js/Pages/StockAudits/Show.vue:819](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L819) | v-if="drafts[item.id]"; variant="secondary"; size="sm"; :disabled="savingCount \|\| syncingDrafts"; @click="discardDraft(item)" | v-for="item in audit.items" → v-else → v-if="canCount" |
| I've reviewed the saved count — [resources/js/Pages/StockAudits/Show.vue:829](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L829) | variant="secondary"; size="sm"; :disabled="savingCount \|\| syncingDrafts"; @click="reviewLatestCount(item)" | v-for="item in audit.items" → v-if="editingItemId === item.id && editingRevision !== item.count_revision" |
| Previous — [resources/js/Pages/StockAudits/Show.vue:845](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L845) | v-if="itemPagination.prev_page_url"; :href="itemPagination.prev_page_url"; preserve-state; preserve-scroll; @click="cancelCounting" | v-if="itemPagination" |
| Next — [resources/js/Pages/StockAudits/Show.vue:847](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L847) | v-if="itemPagination.next_page_url"; :href="itemPagination.next_page_url"; preserve-state; preserve-scroll; @click="cancelCounting" | v-if="itemPagination" |
| processing ? Processing... : Start Audit — [resources/js/Pages/StockAudits/Show.vue:858](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L858) | v-if="canStart"; :loading="processing"; :disabled="processing"; @click="startAudit" | v-if="canStart \|\| canComplete" |
| processing ? Processing... : Complete Audit — [resources/js/Pages/StockAudits/Show.vue:867](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L867) | v-if="canComplete"; :loading="processing"; :disabled="processing \|\| savingCount \|\| syncingDrafts \|\| pendingScans &gt; 0 \|\| draftCount &gt; 0 \|\| !online \|\| reviewRemaining &gt; 0"; @click="completeAudit" | v-if="canStart \|\| canComplete" |
| processing ? Processing... : Delete Audit — [resources/js/Pages/StockAudits/Show.vue:891](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L891) | variant="danger"; :loading="processing"; :disabled="processing"; @click="deleteAudit" | v-if="canDelete" |
| Cancel — [resources/js/Pages/StockAudits/Show.vue:924](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L924) | variant="secondary"; :disabled="reviewing"; @click="reviewItem = null" | No ancestor condition |
| Save — [resources/js/Pages/StockAudits/Show.vue:924](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L924) | type="submit"; :loading="reviewing"; :disabled="reviewing" | No ancestor condition |

**Script endpoint names:** `stock-audits.show`, `stock-audits.items.review`, `stock-audits.start`, `stock-audits.complete`, `stock-audits.destroy`, `stock-audits.items.count`, `stock-audits.items.show`, `stock-audits.lookup`. Match these to verb/path/permission in the route annex.



<a id="e0057"></a>

> Audit provenance: `inventory.md` lines 2518–2526. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/StockAuditReviewEvidence

Read-only current count review state plus approval/recount request evidence and actor/notes; no controls. Embedded in CountHistory; review action form is in audit Show.

Source: [resources/js/Components/StockAuditReviewEvidence.vue:1](C:/Users/proj/Inventoros/resources/js/Components/StockAuditReviewEvidence.vue#L1).

**Input fields:** none in this page/component template.




<a id="e0067"></a>

> Audit provenance: `inventory.md` lines 3028–3051. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudit/ListStockAuditItemsRequest.php

Source [app/Http/Requests/StockAudit/ListStockAuditItemsRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/StockAudit/ListStockAuditItemsRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\StockAudit;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: final class ListStockAuditItemsRequest extends FormRequest
10: {
11:     public function rules(): array
12:     {
13:         return ['per_page' => ['sometimes', 'integer', 'in:25,50,100'], 'page' => ['sometimes', 'integer', 'min:1'],
14:             'search' => ['nullable', 'string', 'max:200'], 'item_status' => ['sometimes', 'in:all,pending,counted,variance,review']];
15:     }
16: }
17: 
```



<a id="e0068"></a>

> Audit provenance: `inventory.md` lines 3052–3079. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudit/ReviewStockAuditCountRequest.php

Source [app/Http/Requests/StockAudit/ReviewStockAuditCountRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/StockAudit/ReviewStockAuditCountRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\StockAudit;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: final class ReviewStockAuditCountRequest extends FormRequest
11: {
12:     public function rules(): array
13:     {
14:         return [
15:             'decision' => ['required', 'in:approved,recount_requested'],
16:             'expected_revision' => ['required', 'string', 'regex:/\A[a-f0-9]{64}\z/'],
17:             'notes' => ['required_if:decision,recount_requested', 'nullable', 'string', 'max:500', Rule::when($this->input('decision') === 'recount_requested', ['min:3'])],
18:         ];
19:     }
20: }
21: 
```



<a id="e0069"></a>

> Audit provenance: `inventory.md` lines 3080–3120. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudit/StoreStockAuditRequest.php

Source [app/Http/Requests/StockAudit/StoreStockAuditRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/StockAudit/StoreStockAuditRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\StockAudit;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a new stock audit (web surface). Rules unchanged from the previous
12:  * inline validation in Inventory\StockAuditController::store.
13:  */
14: final class StoreStockAuditRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, string>
18:      */
19:     public function rules(): array
20:     {
21:         return [
22:             'name' => 'required|string|max:255',
23:             'description' => 'nullable|string|max:1000',
24:             'audit_type' => 'required|in:full,cycle,spot',
25:             'warehouse_id' => ['nullable', 'integer', Rule::exists('warehouses', 'id')->where('organization_id', $this->user()->organization_id)->whereNull('deleted_at')],
26:             'warehouse_location_id' => 'nullable|exists:product_locations,id',
27:             'notes' => 'nullable|string|max:2000',
28:             'require_variance_approval' => ['sometimes', 'boolean'],
29:             'product_ids' => 'nullable|array',
30:             'product_ids.*' => 'exists:products,id',
31:         ];
32:     }
33: }
34: 
```



<a id="e0070"></a>

> Audit provenance: `inventory.md` lines 3121–3158. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudit/UpdateStockAuditRequest.php

Source [app/Http/Requests/StockAudit/UpdateStockAuditRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/StockAudit/UpdateStockAuditRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\StockAudit;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a stock audit edit (web surface). Rules unchanged from the previous
11:  * inline validation in Inventory\StockAuditController::update (draft audits
12:  * only; the status guard stays in the controller).
13:  */
14: final class UpdateStockAuditRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, string>
18:      */
19:     public function rules(): array
20:     {
21:         return [
22:             'name' => 'required|string|max:255',
23:             'description' => 'nullable|string|max:1000',
24:             'audit_type' => 'required|in:full,cycle,spot',
25:             'warehouse_location_id' => 'nullable|exists:product_locations,id',
26:             'notes' => 'nullable|string|max:2000',
27:             'require_variance_approval' => ['sometimes', 'boolean'],
28:         ];
29:     }
30: }
31: 
```



<a id="e0081"></a>

> Audit provenance: `inventory.md` lines 3724–3858. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### CycleCountScheduleController.php — 72-199

Source [app/Http/Controllers/Inventory/CycleCountScheduleController.php:72](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/CycleCountScheduleController.php#L72)

```php
72:     public function store(Request $request): RedirectResponse
73:     {
74:         $validated = $this->validated($request);
75: 
76:         CycleCountSchedule::create([
77:             'organization_id' => $request->user()->organization_id,
78:             'name' => $validated['name'],
79:             'frequency' => $validated['frequency'],
80:             'scope_type' => $validated['scope_type'],
81:             'scope_id' => $validated['scope_type'] === 'all' ? null : $validated['scope_id'],
82:             'products_per_run' => $validated['products_per_run'],
83:             'assigned_to' => $validated['assigned_to'] ?? null,
84:             'is_active' => $validated['is_active'] ?? true,
85:             'next_run_at' => isset($validated['next_run_at']) ? Carbon::parse($validated['next_run_at']) : now(),
86:             'created_by' => $request->user()->id,
87:         ]);
88: 
89:         return redirect()->route('cycle-counts.index')->with('success', __('Cycle count schedule created.'));
90:     }
91: 
92:     public function edit(Request $request, CycleCountSchedule $cycleCount): Response
93:     {
94:         return Inertia::render('StockAudits/CycleCounts/Form', [
95:             'schedule' => [
96:                 'id' => $cycleCount->id,
97:                 'name' => $cycleCount->name,
98:                 'frequency' => $cycleCount->frequency,
99:                 'scope_type' => $cycleCount->scope_type,
100:                 'scope_id' => $cycleCount->scope_id,
101:                 'products_per_run' => $cycleCount->products_per_run,
102:                 'assigned_to' => $cycleCount->assigned_to,
103:                 'is_active' => $cycleCount->is_active,
104:                 'next_run_at' => $cycleCount->next_run_at?->format('Y-m-d\TH:i'),
105:             ],
106:         ] + $this->options($request->user()->organization_id));
107:     }
108: 
109:     public function update(Request $request, CycleCountSchedule $cycleCount): RedirectResponse
110:     {
111:         $validated = $this->validated($request);
112: 
113:         $cycleCount->update([
114:             'name' => $validated['name'],
115:             'frequency' => $validated['frequency'],
116:             'scope_type' => $validated['scope_type'],
117:             'scope_id' => $validated['scope_type'] === 'all' ? null : $validated['scope_id'],
118:             'products_per_run' => $validated['products_per_run'],
119:             'assigned_to' => $validated['assigned_to'] ?? null,
120:             'is_active' => $validated['is_active'] ?? true,
121:             'next_run_at' => isset($validated['next_run_at'])
122:                 ? Carbon::parse($validated['next_run_at'])
123:                 : ($cycleCount->next_run_at ?? now()),
124:         ]);
125: 
126:         return redirect()->route('cycle-counts.index')->with('success', __('Cycle count schedule updated.'));
127:     }
128: 
129:     public function destroy(CycleCountSchedule $cycleCount): RedirectResponse
130:     {
131:         $cycleCount->delete();
132: 
133:         return redirect()->route('cycle-counts.index')->with('success', __('Cycle count schedule deleted.'));
134:     }
135: 
136:     /**
137:      * Create this schedule's audit now, leaving its regular run time alone.
138:      */
139:     public function run(CycleCountSchedule $cycleCount, CycleCountService $cycleCounts): RedirectResponse
140:     {
141:         $audit = $cycleCounts->run($cycleCount, advance: false);
142: 
143:         if (! $audit) {
144:             return redirect()->back()->with('error', __('No audit was created: the last one from this schedule is still open, or nothing is in scope.'));
145:         }
146: 
147:         return redirect()->route('stock-audits.show', $audit)
148:             ->with('success', "Cycle count {$audit->audit_number} created with {$audit->items()->count()} product(s).");
149:     }
150: 
151:     /**
152:      * @return array<string, mixed>
153:      */
154:     private function validated(Request $request): array
155:     {
156:         $orgId = $request->user()->organization_id;
157: 
158:         return $request->validate([
159:             'name' => ['required', 'string', 'max:255'],
160:             'frequency' => ['required', Rule::in(CycleCountSchedule::FREQUENCIES)],
161:             'scope_type' => ['required', Rule::in(CycleCountSchedule::SCOPES)],
162:             'scope_id' => [
163:                 'nullable',
164:                 'required_unless:scope_type,all',
165:                 'integer',
166:                 function (string $attribute, mixed $value, Closure $fail) use ($request, $orgId) {
167:                     if ($value === null || $request->input('scope_type') === 'all') {
168:                         return;
169:                     }
170: 
171:                     $model = match ($request->input('scope_type')) {
172:                         'location' => ProductLocation::class,
173:                         'warehouse' => Warehouse::class,
174:                         'category' => ProductCategory::class,
175:                         default => null,
176:                     };
177: 
178:                     if ($model && ! $model::query()->withoutGlobalScope(OrganizationScope::class)->where('organization_id', $orgId)->whereKey($value)->exists()) {
179:                         $fail('Choose a location, warehouse or category from your organization.');
180:                     }
181:                 },
182:             ],
183:             'products_per_run' => ['required', 'integer', 'min:1', 'max:1000'],
184:             'assigned_to' => ['nullable', 'integer', new OrganizationMember($orgId)],
185:             'is_active' => ['sometimes', 'boolean'],
186:             'next_run_at' => ['nullable', 'date'],
187:         ]);
188:     }
189: 
190:     /**
191:      * @return array<string, mixed>
192:      */
193:     private function options(int $organizationId): array
194:     {
195:         return [
196:             'locations' => ProductLocation::forOrganization($organizationId)->active()->orderBy('name')->get(['id', 'name', 'code']),
197:             'warehouses' => Warehouse::where('organization_id', $organizationId)->orderBy('name')->get(['id', 'name', 'code']),
198:             'categories' => ProductCategory::where('organization_id', $organizationId)->orderBy('name')->get(['id', 'name']),
199:             'users' => User::query()->memberOf($organizationId)->orderBy('name')->get(['id', 'name']),
```



<a id="e0089"></a>

> Audit provenance: `inventory.md` lines 4337–4388. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAuditController.php — 385-440

Source [app/Http/Controllers/Inventory/StockAuditController.php:385](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/StockAuditController.php#L385)

```php
385:     public function updateCount(Request $request, StockAudit $stockAudit, StockAuditItem $item, StockAuditService $audits): JsonResponse
386:     {
387:         if ($stockAudit->organization_id !== $request->user()->organization_id) {
388:             return response()->json(['message' => 'Unauthorized'], 403);
389:         }
390: 
391:         $this->warehouseAccess->authorizeStockAudit($request->user(), $stockAudit);
392: 
393:         if ($stockAudit->status !== 'in_progress') {
394:             return response()->json(['message' => 'Audit is not in progress'], 422);
395:         }
396: 
397:         if ($item->stock_audit_id !== $stockAudit->id) {
398:             return response()->json(['message' => 'Item does not belong to this audit'], 422);
399:         }
400: 
401:         $validated = $request->validate([
402:             'counted_quantity' => 'required|integer|min:0',
403:             'notes' => 'nullable|string|max:500',
404:             'expected_revision' => ['sometimes', 'string', 'regex:/\A[a-f0-9]{64}\z/'],
405:         ]);
406: 
407:         try {
408:             $audits->recordCount($stockAudit, $item, $request->user(), (int) $validated['counted_quantity'], $validated['notes'] ?? null, $validated['expected_revision'] ?? null);
409:         } catch (BusinessRuleException $e) {
410:             if ($e instanceof InvalidStateException && $e->errorCode === 'stale_count') {
411:                 return response()->json([
412:                     'message' => $e->getMessage(),
413:                     'error' => 'stale_count',
414:                     'item' => app(StockAuditReadService::class)->present($item->fresh()),
415:                     'summary' => app(StockAuditReadService::class)->summary($stockAudit),
416:                 ], 409);
417:             }
418: 
419:             return response()->json(['message' => $e->getMessage()], 422);
420:         }
421: 
422:         return response()->json([
423:             'message' => 'Count updated successfully',
424:             'item' => app(StockAuditReadService::class)->present($item->fresh()),
425:             'summary' => app(StockAuditReadService::class)->summary($stockAudit),
426:         ]);
427:     }
428: }
429: 
```



<a id="e0109"></a>

> Audit provenance: `inventory.md` lines 5183–5228. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAudit
[app/Models/Inventory/StockAudit.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/StockAudit.php#L1)

```php
46:     protected $fillable = [
47:         'organization_id',
48:         'audit_number',
49:         'name',
50:         'description',
51:         'status',
52:         'audit_type',
53:         'cycle_count_schedule_id',
54:         'warehouse_id',
55:         'warehouse_location_id',
56:         'started_at',
57:         'completed_at',
58:         'notes',
59:         'created_by',
60:         'assigned_to',
61:         'require_variance_approval',
62:     ];
64:     protected function casts(): array
65:     {
66:         return [
67:             'warehouse_id' => 'integer',
68:             'warehouse_location_id' => 'integer',
69:             'started_at' => 'datetime',
70:             'completed_at' => 'datetime',
71:             'require_variance_approval' => 'boolean',
72:         ];
80:     public function organization(): BelongsTo
82:         return $this->belongsTo(Organization::class);
85:     public function warehouse(): BelongsTo
87:         return $this->belongsTo(Warehouse::class);
95:     public function warehouseLocation(): BelongsTo
97:         return $this->belongsTo(ProductLocation::class, 'warehouse_location_id');
105:     public function creator(): BelongsTo
107:         return $this->belongsTo(User::class, 'created_by');
115:     public function assignee(): BelongsTo
117:         return $this->belongsTo(User::class, 'assigned_to');
125:     public function cycleCountSchedule(): BelongsTo
127:         return $this->belongsTo(CycleCountSchedule::class);
135:     public function items(): HasMany
137:         return $this->hasMany(StockAuditItem::class);
```



<a id="e0110"></a>

> Audit provenance: `inventory.md` lines 5229–5268. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAuditItem
[app/Models/Inventory/StockAuditItem.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/StockAuditItem.php#L1)

```php
39:     protected $fillable = [
40:         'stock_audit_id',
41:         'product_id',
42:         'product_variant_id',
43:         'location_id',
44:         'system_quantity',
45:         'counted_quantity',
46:         'discrepancy',
47:         'status',
48:         'counted_by',
49:         'counted_at',
50:         'notes',
51:     ];
53:     protected function casts(): array
54:     {
55:         return [
56:             'system_quantity' => 'integer',
57:             'counted_quantity' => 'integer',
58:             'discrepancy' => 'integer',
59:             'counted_at' => 'datetime',
60:             'count_sequence' => 'integer',
61:             'recount_generation' => 'integer',
62:             'reviewed_at' => 'datetime',
63:         ];
95:     public function stockAudit(): BelongsTo
97:         return $this->belongsTo(StockAudit::class);
105:     public function product(): BelongsTo
107:         return $this->belongsTo(Product::class);
115:     public function variant(): BelongsTo
117:         return $this->belongsTo(ProductVariant::class, 'product_variant_id');
125:     public function location(): BelongsTo
127:         return $this->belongsTo(ProductLocation::class, 'location_id');
135:     public function countedByUser(): BelongsTo
137:         return $this->belongsTo(User::class, 'counted_by');
```



<a id="e0111"></a>

> Audit provenance: `inventory.md` lines 5269–5279. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAuditCount
[app/Models/Inventory/StockAuditCount.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/StockAuditCount.php#L1)

```php
15:     protected $guarded = ['id'];
17:     protected function casts(): array
18:     {
19:         return ['sequence' => 'integer', 'system_quantity' => 'integer', 'counted_quantity' => 'integer',
20:             'discrepancy' => 'integer', 'is_snapshot' => 'boolean', 'counted_at' => 'datetime'];
```



<a id="e0112"></a>

> Audit provenance: `inventory.md` lines 5280–5289. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockAuditReview
[app/Models/Inventory/StockAuditReview.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/StockAuditReview.php#L1)

```php
14:     protected $guarded = ['id'];
16:     protected function casts(): array
17:     {
18:         return ['count_sequence' => 'integer', 'created_at' => 'datetime'];
```



<a id="e0113"></a>

> Audit provenance: `inventory.md` lines 5290–5330. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### CycleCountSchedule
[app/Models/Inventory/CycleCountSchedule.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/CycleCountSchedule.php#L1)

```php
43:     public const FREQUENCIES = ['daily', 'weekly', 'monthly'];
48:     public const SCOPES = ['all', 'location', 'warehouse', 'category'];
50:     protected $fillable = [
51:         'organization_id',
52:         'name',
53:         'frequency',
54:         'scope_type',
55:         'scope_id',
56:         'products_per_run',
57:         'assigned_to',
58:         'is_active',
59:         'next_run_at',
60:         'last_run_at',
61:         'last_audit_id',
62:         'created_by',
63:     ];
65:     protected function casts(): array
66:     {
67:         return [
68:             'scope_id' => 'integer',
69:             'products_per_run' => 'integer',
70:             'is_active' => 'boolean',
71:             'next_run_at' => 'datetime',
72:             'last_run_at' => 'datetime',
73:         ];
79:     public function organization(): BelongsTo
81:         return $this->belongsTo(Organization::class);
87:     public function assignee(): BelongsTo
89:         return $this->belongsTo(User::class, 'assigned_to');
95:     public function creator(): BelongsTo
97:         return $this->belongsTo(User::class, 'created_by');
103:     public function lastAudit(): BelongsTo
105:         return $this->belongsTo(StockAudit::class, 'last_audit_id');
111:     public function audits(): HasMany
113:         return $this->hasMany(StockAudit::class);
```



<a id="e0134"></a>

> Audit provenance: `inventory.md` lines 5866–5906. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_03_20_000001_create_stock_audits_table.php
[database/migrations/2026_03_20_000001_create_stock_audits_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_03_20_000001_create_stock_audits_table.php#L1)

```php
14:         Schema::create('stock_audits', function (Blueprint $table) {
15:             $table->id();
16:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
17:             $table->string('audit_number');
18:             $table->string('name');
19:             $table->text('description')->nullable();
20:             $table->string('status')->default('draft'); // draft, in_progress, completed, cancelled
21:             $table->string('audit_type'); // full, cycle, spot
22:             $table->foreignId('warehouse_location_id')->nullable()->constrained('product_locations')->nullOnDelete();
23:             $table->timestamp('started_at')->nullable();
24:             $table->timestamp('completed_at')->nullable();
25:             $table->text('notes')->nullable();
26:             $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
27:             $table->timestamps();
28:             $table->softDeletes();
31:             $table->unique(['organization_id', 'audit_number']);
32:             $table->index(['organization_id', 'status']);
33:             $table->index(['organization_id', 'audit_type']);
34:             $table->index(['organization_id', 'created_at']);
37:         Schema::create('stock_audit_items', function (Blueprint $table) {
38:             $table->id();
39:             $table->foreignId('stock_audit_id')->constrained()->cascadeOnDelete();
40:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
41:             $table->foreignId('product_variant_id')->nullable()->constrained()->nullOnDelete();
42:             $table->foreignId('location_id')->nullable()->constrained('product_locations')->nullOnDelete();
43:             $table->integer('system_quantity')->default(0);
44:             $table->integer('counted_quantity')->nullable();
45:             $table->integer('discrepancy')->default(0);
46:             $table->string('status')->default('pending'); // pending, counted, verified, adjusted
47:             $table->foreignId('counted_by')->nullable()->constrained('users')->nullOnDelete();
48:             $table->timestamp('counted_at')->nullable();
49:             $table->text('notes')->nullable();
50:             $table->timestamps();
53:             $table->index(['stock_audit_id', 'status']);
54:             $table->index(['stock_audit_id', 'product_id']);
```



<a id="e0148"></a>

> Audit provenance: `inventory.md` lines 6130–6159. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_09_29_000003_create_cycle_count_schedules_table.php
[database/migrations/2026_09_29_000003_create_cycle_count_schedules_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_09_29_000003_create_cycle_count_schedules_table.php#L1)

```php
16:         Schema::create('cycle_count_schedules', function (Blueprint $table) {
17:             $table->id();
18:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
19:             $table->string('name');
21:             $table->string('frequency', 20);
23:             $table->string('scope_type', 20)->default('all');
24:             $table->unsignedBigInteger('scope_id')->nullable();
25:             $table->unsignedInteger('products_per_run');
26:             $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
27:             $table->boolean('is_active')->default(true);
28:             $table->timestamp('next_run_at')->nullable();
29:             $table->timestamp('last_run_at')->nullable();
30:             $table->foreignId('last_audit_id')->nullable()->constrained('stock_audits')->nullOnDelete();
31:             $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
32:             $table->timestamps();
34:             $table->index(['is_active', 'next_run_at']);
35:             $table->index(['organization_id', 'is_active']);
38:         Schema::table('stock_audits', function (Blueprint $table) {
39:             $table->foreignId('cycle_count_schedule_id')->nullable()->after('audit_type')
41:             $table->foreignId('assigned_to')->nullable()->after('created_by')
48:         Schema::table('stock_audits', function (Blueprint $table) {
49:             $table->dropForeign(['cycle_count_schedule_id']);
50:             $table->dropForeign(['assigned_to']);
51:             $table->dropColumn(['cycle_count_schedule_id', 'assigned_to']);
```



<a id="e0152"></a>

> Audit provenance: `inventory.md` lines 6213–6221. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_21_000002_add_stock_audit_warehouse_scope.php
[database/migrations/2026_10_21_000002_add_stock_audit_warehouse_scope.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_21_000002_add_stock_audit_warehouse_scope.php#L1)

```php
13:         Schema::table('stock_audits', function (Blueprint $table): void {
14:             $table->foreignId('warehouse_id')->nullable()->constrained()->restrictOnDelete();
20:         Schema::table('stock_audits', fn (Blueprint $table) => $table->dropConstrainedForeignId('warehouse_id'));
```



<a id="e0157"></a>

> Audit provenance: `inventory.md` lines 6274–6298. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_26_000002_create_stock_audit_counts.php
[database/migrations/2026_10_26_000002_create_stock_audit_counts.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_26_000002_create_stock_audit_counts.php#L1)

```php
14:         Schema::table('stock_audit_items', function (Blueprint $table): void {
15:             $table->unsignedBigInteger('count_sequence')->default(0);
17:         Schema::create('stock_audit_counts', function (Blueprint $table): void {
18:             $table->id();
19:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
20:             $table->foreignId('stock_audit_id')->constrained()->cascadeOnDelete();
21:             $table->foreignId('stock_audit_item_id')->constrained()->cascadeOnDelete();
22:             $table->unsignedBigInteger('sequence');
23:             $table->integer('system_quantity');
24:             $table->integer('counted_quantity');
25:             $table->integer('discrepancy');
26:             $table->foreignId('counted_by')->nullable()->constrained('users')->nullOnDelete();
27:             $table->string('actor_name')->nullable();
28:             $table->text('notes')->nullable();
29:             $table->timestamp('counted_at');
30:             $table->boolean('is_snapshot')->default(false);
31:             $table->unique(['stock_audit_item_id', 'sequence']);
32:             $table->index(['organization_id', 'stock_audit_id']);
57:         Schema::table('stock_audit_items', fn (Blueprint $table) => $table->dropColumn('count_sequence'));
```



<a id="e0158"></a>

> Audit provenance: `inventory.md` lines 6299–6331. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_27_000001_add_stock_audit_variance_reviews.php
[database/migrations/2026_10_27_000001_add_stock_audit_variance_reviews.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_27_000001_add_stock_audit_variance_reviews.php#L1)

```php
13:         Schema::table('stock_audits', fn (Blueprint $table) => $table->boolean('require_variance_approval')->default(false));
14:         Schema::table('stock_audit_items', function (Blueprint $table): void {
15:             $table->string('review_status', 24)->default('not_required');
16:             $table->string('review_revision', 64)->nullable();
17:             $table->unsignedBigInteger('recount_generation')->default(0);
18:             $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
19:             $table->string('reviewer_name')->nullable();
20:             $table->timestamp('reviewed_at')->nullable();
21:             $table->text('review_notes')->nullable();
23:         Schema::create('stock_audit_reviews', function (Blueprint $table): void {
24:             $table->id();
25:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
26:             $table->foreignId('stock_audit_id')->constrained()->cascadeOnDelete();
27:             $table->foreignId('stock_audit_item_id')->constrained()->cascadeOnDelete();
28:             $table->unsignedBigInteger('count_sequence');
29:             $table->string('count_revision', 64);
30:             $table->string('decision', 24);
31:             $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
32:             $table->string('reviewer_name');
33:             $table->text('notes')->nullable();
34:             $table->timestamp('created_at');
35:             $table->unique(['stock_audit_item_id', 'count_sequence'], 'stock_audit_reviews_item_count_unique');
36:             $table->index(['organization_id', 'stock_audit_id']);
43:         Schema::table('stock_audit_items', function (Blueprint $table): void {
44:             $table->dropForeign(['reviewed_by']);
45:             $table->dropColumn(['review_status', 'review_revision', 'recount_generation', 'reviewed_by', 'reviewer_name', 'reviewed_at', 'review_notes']);
47:         Schema::table('stock_audits', fn (Blueprint $table) => $table->dropColumn('require_variance_approval'));
```



<a id="e0159"></a>

> Audit provenance: `inventory.md` lines 6332–6339. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_27_000002_index_stock_audit_item_pages.php
[database/migrations/2026_10_27_000002_index_stock_audit_item_pages.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_27_000002_index_stock_audit_item_pages.php#L1)

```php
13:         Schema::table('stock_audit_items', fn (Blueprint $table) => $table->index(['stock_audit_id', 'id'], 'audit_items_audit_page_index'));
18:         Schema::table('stock_audit_items', fn (Blueprint $table) => $table->dropIndex('audit_items_audit_page_index'));
```



<a id="e0493"></a>

> Audit provenance: `additional-contracts.md` lines 956–988. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/StockAudit/RecordStockAuditCountRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/StockAudit/RecordStockAuditCountRequest.php#L1). SHA-256: `9a79212c79aea77ba708ae28d09d611929e24fab92997e326882fb03d97c2fb6`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\StockAudit;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a physical count for one stock-audit item via the REST API.
11:  * Rules match the web updateCount endpoint.
12:  */
13: final class RecordStockAuditCountRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'counted_quantity' => ['required', 'integer', 'min:0'],
22:             'notes' => ['nullable', 'string', 'max:500'],
23:             'expected_revision' => ['sometimes', 'string', 'regex:/\A[a-f0-9]{64}\z/'],
24:         ];
25:     }
26: }
```



<a id="e0494"></a>

> Audit provenance: `additional-contracts.md` lines 989–1030. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/StockAudit/StoreStockAuditRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/StockAudit/StoreStockAuditRequest.php#L1). SHA-256: `72d316536762b7731cff5abb3dfb69b8f4655213b3752f6ddeb7afebee2cbfaf`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\StockAudit;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a new stock audit via the REST API. Same fields as the web form,
12:  * but the location and product ids must belong to the caller's organization.
13:  */
14: final class StoreStockAuditRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, mixed>
18:      */
19:     public function rules(): array
20:     {
21:         $organizationId = $this->user()->organization_id;
22: 
23:         return [
24:             'name' => ['required', 'string', 'max:255'],
25:             'description' => ['nullable', 'string', 'max:1000'],
26:             'audit_type' => ['required', 'in:full,cycle,spot'],
27:             'warehouse_id' => ['nullable', 'integer', Rule::exists('warehouses', 'id')->where('organization_id', $this->user()->organization_id)->whereNull('deleted_at')],
28:             'warehouse_location_id' => ['nullable', 'integer', Rule::exists('product_locations', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
29:             'notes' => ['nullable', 'string', 'max:2000'],
30:             'require_variance_approval' => ['sometimes', 'boolean'],
31:             'product_ids' => ['nullable', 'array', 'max:5000'],
32:             'product_ids.*' => ['integer', Rule::exists('products', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
33:         ];
34:     }
35: }
```

