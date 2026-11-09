# 26. Reservations — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Reservations as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Active/expired/consumed/released listing; owner/reference filters; authorized release; holds created by owning workflows rather than an invented generic form.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Inventory / Products](../modules/11_inventory.md), [Locations](../modules/19_locations.md), [Warehouses](../modules/20_warehouses.md), [Roles and Permission Sets](../modules/31_roles_permissions.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Reservations/Index.vue` | Pending | Pending |

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

- [ ] Available stock falls while hold is active.
- [ ] expiration/release removes availability commitment but preserves history.
- [ ] serial quantity and unsupported combinations follow source.
- [ ] repeat consume/release cannot double-apply.

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

- [Reservations](#e0008)
- [Reservations/Index](#e0027)
- [StockReservationController.php — 26-84](#e0085)
- [StockReservation](#e0106)
- [2026_10_12_000001_create_stock_reservations_table.php](#e0150)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0008"></a>

> Audit provenance: `inventory.md` lines 68–73. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Reservations

- There is a listing/release UI, **not a generic create-reservation form**. Core/plugin workflows create holds. Listing filters status active(default)/expired/consumed/released/all, owner and reference search; optional product_id stays in query.
- Reserve requires positive integer, future optional expiry; serial exactly 1; no serial+batch, variant+serial/batch, or location+serial/batch combination. Variant parent must resolve to variant. Available = on hand minus active held quantities. Consumed and released holds remain evidence; expired holds no longer represent active promises. [StockReservationService:80-143](C:/Users/proj/Inventoros/app/Services/StockReservationService.php#L80).
- Release requires manage_stock plus active hold; confirmation identifies owner/reference and activity is logged. See [StockReservationController:96-123](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/StockReservationController.php#L96).



<a id="e0027"></a>

> Audit provenance: `inventory.md` lines 961–1012. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Reservations/Index

GET /reservations; view_products. Status default active, owner, reference search and optional product chip. Columns product(+variant), held, held-in location/serial/batch or product-total, owner, reference, expires, status, actions. Release only active + canRelease, confirmation then POST; there is no create-hold dialog. Pagination 25 server-side.

Source: [resources/js/Pages/Reservations/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Reservations/Index.vue:24
const search = ref(props.filters?.search || '');
// resources/js/Pages/Reservations/Index.vue:25
const status = ref(props.filters?.status || 'active');
// resources/js/Pages/Reservations/Index.vue:26
const owner = ref(props.filters?.owner || '');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| search — [resources/js/Pages/Reservations/Index.vue:100](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L100) | Search | text; props.filters?.search \|\| '' | ; v-model="search"; type="text"; :placeholder="t('reservations.searchPlaceholder')" | Always within this view/dialog; see component visibility |
| status — [resources/js/Pages/Reservations/Index.vue:109](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L109) | Status | select; props.filters?.status \|\| 'active' | ; v-model="status"; @change="applyFilters" | Always within this view/dialog; see component visibility |
| owner — [resources/js/Pages/Reservations/Index.vue:119](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L119) | Owner | select; props.filters?.owner \|\| '' | ; v-model="owner"; @change="applyFilters" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- status ([resources/js/Pages/Reservations/Index.vue:109](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L109)): `&lt;option value="active"&gt;{{ Active }}&lt;/option&gt; &lt;option value="expired"&gt;{{ Expired }}&lt;/option&gt; &lt;option value="consumed"&gt;{{ Consumed }}&lt;/option&gt; &lt;option value="released"&gt;{{ Released }}&lt;/option&gt; &lt;option value="all"&gt;{{ All }}&lt;/option&gt;`
- owner ([resources/js/Pages/Reservations/Index.vue:119](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L119)): `&lt;option value=""&gt;{{ All owners }}&lt;/option&gt; &lt;option v-for="name in owners" :key="name" :value="name"&gt;{{ name }}&lt;/option&gt;`

**Read fields, columns and section headings:**

- th: Product — [resources/js/Pages/Reservations/Index.vue:138](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L138)
- th: Held — [resources/js/Pages/Reservations/Index.vue:139](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L139)
- th: Held in — [resources/js/Pages/Reservations/Index.vue:140](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L140)
- th: Owner — [resources/js/Pages/Reservations/Index.vue:141](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L141)
- th: Reference — [resources/js/Pages/Reservations/Index.vue:142](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L142)
- th: Expires — [resources/js/Pages/Reservations/Index.vue:143](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L143)
- th: Status — [resources/js/Pages/Reservations/Index.vue:144](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L144)
- th: Actions — [resources/js/Pages/Reservations/Index.vue:145](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L145)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| All products — [resources/js/Pages/Reservations/Index.vue:90](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L90) | type="button"; @click="clearProduct" | v-if="product" |
| reservation.product.name — [resources/js/Pages/Reservations/Index.vue:159](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L159) | v-if="reservation.product"; :href="route('products.show', reservation.product.id)" | v-for="reservation in reservations.data" |
| Release — [resources/js/Pages/Reservations/Index.vue:176](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L176) | v-if="reservation.status === 'active'"; variant="secondary"; size="sm"; @click="release(reservation)" | v-for="reservation in reservations.data" → v-if="canRelease" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Reservations/Index.vue:193](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L193) | v-if="link.url"; :href="link.url"; v-html="link.label" | v-if="reservations.links && reservations.links.length &gt; 3" → v-for="link in reservations.links" |

**Script endpoint names:** `reservations.index`, `reservations.release`. Match these to verb/path/permission in the route annex.



<a id="e0085"></a>

> Audit provenance: `inventory.md` lines 4141–4206. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockReservationController.php — 26-84

Source [app/Http/Controllers/Inventory/StockReservationController.php:26](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/StockReservationController.php#L26)

```php
26:     private const STATUSES = ['active', 'expired', 'consumed', 'released', 'all'];
27: 
28:     public function index(Request $request): Response
29:     {
30:         $validated = $request->validate([
31:             'status' => ['nullable', 'string', 'in:'.implode(',', self::STATUSES)],
32:             'owner' => ['nullable', 'string', 'max:100'],
33:             'product_id' => ['nullable', 'integer'],
34:             'search' => ['nullable', 'string', 'max:191'],
35:         ]);
36: 
37:         $status = $validated['status'] ?? 'active';
38: 
39:         $reservations = StockReservation::query()
40:             ->with([
41:                 'product:id,name,sku',
42:                 'variant:id,title,sku',
43:                 'location:id,name,code',
44:                 'serial:id,serial_number',
45:                 'batch:id,batch_number',
46:             ])
47:             ->tap(fn (Builder $query) => $this->filterStatus($query, $status))
48:             ->when($validated['owner'] ?? null, fn (Builder $q, string $owner) => $q->where('owner_type', $owner))
49:             ->when($validated['product_id'] ?? null, fn (Builder $q, int $productId) => $q->where('product_id', $productId))
50:             ->when($validated['search'] ?? null, fn (Builder $q, string $search) => $q->where('owner_reference', 'like', "%{$search}%"))
51:             ->orderByRaw('expires_at is null')
52:             ->orderBy('expires_at')
53:             ->orderByDesc('id')
54:             ->paginate(25)
55:             ->withQueryString()
56:             ->through(fn (StockReservation $reservation) => [
57:                 'id' => $reservation->id,
58:                 'product' => $reservation->product?->only(['id', 'name', 'sku']),
59:                 'variant' => $reservation->variant?->only(['id', 'title', 'sku']),
60:                 'location' => $reservation->location?->only(['id', 'name', 'code']),
61:                 'serial_number' => $reservation->serial?->serial_number,
62:                 'batch_number' => $reservation->batch?->batch_number,
63:                 'quantity' => $reservation->quantity,
64:                 'owner_type' => $reservation->owner_type,
65:                 'owner_reference' => $reservation->owner_reference,
66:                 'status' => $reservation->status(),
67:                 'expires_at' => $reservation->expires_at?->toIso8601String(),
68:                 'consumed_at' => $reservation->consumed_at?->toIso8601String(),
69:                 'released_at' => $reservation->released_at?->toIso8601String(),
70:                 'release_reason' => $reservation->release_reason,
71:                 'created_at' => $reservation->created_at?->toIso8601String(),
72:             ]);
73: 
74:         $product = isset($validated['product_id'])
75:             ? Product::query()->whereKey($validated['product_id'])->first(['id', 'name', 'sku'])
76:             : null;
77: 
78:         return Inertia::render('Reservations/Index', [
79:             'reservations' => $reservations,
80:             'filters' => [
81:                 'status' => $status,
82:                 'owner' => $validated['owner'] ?? null,
83:                 'product_id' => $validated['product_id'] ?? null,
84:                 'search' => $validated['search'] ?? null,
```



<a id="e0106"></a>

> Audit provenance: `inventory.md` lines 5061–5093. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StockReservation
[app/Models/Inventory/StockReservation.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/StockReservation.php#L1)

```php
53:     public const RELEASED = 'released';
55:     public const EXPIRED = 'expired';
57:     public const UNINSTALLED = 'uninstalled';
59:     public const ADMIN = 'admin';
64:     public const CORE_OWNER = 'core';
72:     protected $fillable = [];
74:     protected function casts(): array
75:     {
76:         return [
77:             'quantity' => 'integer',
78:             'expires_at' => 'datetime',
79:             'consumed_at' => 'datetime',
80:             'released_at' => 'datetime',
81:         ];
133:     public function organization(): BelongsTo
135:         return $this->belongsTo(Organization::class);
141:     public function product(): BelongsTo
143:         return $this->belongsTo(Product::class);
149:     public function variant(): BelongsTo
151:         return $this->belongsTo(ProductVariant::class, 'product_variant_id');
157:     public function location(): BelongsTo
159:         return $this->belongsTo(ProductLocation::class, 'location_id');
165:     public function serial(): BelongsTo
167:         return $this->belongsTo(ProductSerial::class, 'product_serial_id');
173:     public function batch(): BelongsTo
175:         return $this->belongsTo(ProductBatch::class, 'product_batch_id');
185:         return $this->morphTo('consumed_by');
```



<a id="e0150"></a>

> Audit provenance: `inventory.md` lines 6170–6197. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_12_000001_create_stock_reservations_table.php
[database/migrations/2026_10_12_000001_create_stock_reservations_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_12_000001_create_stock_reservations_table.php#L1)

```php
29:         Schema::create('stock_reservations', function (Blueprint $table) {
30:             $table->id();
31:             $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
32:             $table->foreignId('product_id')->constrained()->cascadeOnDelete();
33:             $table->foreignId('product_variant_id')->nullable()->constrained()->cascadeOnDelete();
34:             $table->foreignId('location_id')->nullable()->constrained('product_locations')->nullOnDelete();
35:             $table->foreignId('product_serial_id')->nullable()->constrained()->cascadeOnDelete();
36:             $table->foreignId('product_batch_id')->nullable()->constrained()->cascadeOnDelete();
37:             $table->unsignedInteger('quantity');
38:             $table->string('owner_type', 100);
39:             $table->string('owner_reference', 191);
40:             $table->string('scope_key', 100);
41:             $table->timestamp('expires_at')->nullable();
42:             $table->timestamp('consumed_at')->nullable();
43:             $table->nullableMorphs('consumed_by');
44:             $table->timestamp('released_at')->nullable();
45:             $table->string('release_reason', 30)->nullable();
46:             $table->timestamps();
49:             $table->index(['organization_id', 'product_id', 'product_variant_id'], 'stock_reservations_product_index');
51:             $table->unique(['organization_id', 'owner_type', 'owner_reference', 'scope_key'], 'stock_reservations_owner_scope_unique');
52:             $table->index(['owner_type', 'owner_reference'], 'stock_reservations_owner_index');
53:             $table->index('expires_at');
```

