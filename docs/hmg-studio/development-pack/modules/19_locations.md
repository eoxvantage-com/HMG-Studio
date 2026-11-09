# 19. Locations — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Locations as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Locations/bins; optional warehouse association; code/name/description/capacity/active state; filter and inline forms.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Warehouses](../modules/20_warehouses.md), [Roles and Permission Sets](../modules/31_roles_permissions.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Locations/Index.vue` | Pending | Pending |

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

- [ ] Location belongs to the selected organization/warehouse.
- [ ] save persists every field.
- [ ] referenced-stock behavior is preserved.
- [ ] product primary location is not mistaken for physical stock balance.

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

- [Locations/Index](#e0020)
- [ProductLocation/StoreProductLocationRequest.php](#e0064)
- [ProductLocation/UpdateProductLocationRequest.php](#e0065)
- [ProductLocationController.php — 145-185](#e0091)
- [ProductLocation](#e0096)
- [2025_10_12_034229_create_product_locations_table.php](#e0119)
- [`app/Http/Requests/Api/ProductLocation/StoreProductLocationRequest.php`](#e0482)
- [`app/Http/Requests/Api/ProductLocation/UpdateProductLocationRequest.php`](#e0483)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0020"></a>

> Audit provenance: `inventory.md` lines 321–392. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Locations/Index

GET /locations; manage_locations. Search, paginated cards show name/code/warehouse/description/capacity/product count. Create/Edit dialogs share name/code/description/warehouse_id/capacity. Print individual/all QR labels; delete asks confirmation and is disabled for products_count > 0. Initial warehouse inherits active warehouse or default warehouse when available.

Source: [resources/js/Pages/Locations/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Locations/Index.vue:25
const search = ref(props.filters?.search || '');
// resources/js/Pages/Locations/Index.vue:26
const showCreateModal = ref(false);
// resources/js/Pages/Locations/Index.vue:27
const showEditModal = ref(false);
// resources/js/Pages/Locations/Index.vue:28
const editingLocation = ref(null);
// resources/js/Pages/Locations/Index.vue:37
const locationForm = useForm(blankLocation());
// resources/js/Pages/Locations/Index.vue:38
const formMode = ref('create');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| search — [resources/js/Pages/Locations/Index.vue:145](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L145) | Search | text; props.filters?.search \|\| '' | ; v-model="search"; type="text"; :placeholder="t('locations.searchPlaceholder')" | Always within this view/dialog; see component visibility |
| locationForm.name — [resources/js/Pages/Locations/Index.vue:291](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L291) | Location Name * | text; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.name"; type="text"; :placeholder="t('locations.namePlaceholder')"; required | v-if="showCreateModal" |
| locationForm.code — [resources/js/Pages/Locations/Index.vue:304](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L304) | Location Code * | text; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.code"; type="text"; :placeholder="t('locations.codePlaceholder')"; required | v-if="showCreateModal" |
| locationForm.description — [resources/js/Pages/Locations/Index.vue:317](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L317) | Description | textarea; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.description"; rows="3"; :placeholder="t('locations.descPlaceholder')" | v-if="showCreateModal" |
| locationForm.warehouse_id — [resources/js/Pages/Locations/Index.vue:327](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L327) | Warehouse | select; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.warehouse_id" | v-if="showCreateModal" |
| locationForm.capacity — [resources/js/Pages/Locations/Index.vue:337](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L337) | Capacity (units) | number; Derived/repeating value; see initial payload / owning child notes | ; v-model.number="locationForm.capacity"; type="number"; min="0" | v-if="showCreateModal" |
| locationForm.name — [resources/js/Pages/Locations/Index.vue:382](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L382) | Location Name * | text; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.name"; type="text"; required | v-if="showEditModal" |
| locationForm.code — [resources/js/Pages/Locations/Index.vue:394](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L394) | Location Code * | text; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.code"; type="text"; required | v-if="showEditModal" |
| locationForm.description — [resources/js/Pages/Locations/Index.vue:406](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L406) | Description | textarea; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.description"; rows="3" | v-if="showEditModal" |
| locationForm.warehouse_id — [resources/js/Pages/Locations/Index.vue:415](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L415) | Warehouse | select; Derived/repeating value; see initial payload / owning child notes | ; v-model="locationForm.warehouse_id" | v-if="showEditModal" |
| locationForm.capacity — [resources/js/Pages/Locations/Index.vue:425](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L425) | Capacity (units) | number; Derived/repeating value; see initial payload / owning child notes | ; v-model.number="locationForm.capacity"; type="number"; min="0" | v-if="showEditModal" |

**Select options and labels (exact source, including remote lists):**

- locationForm.warehouse_id ([resources/js/Pages/Locations/Index.vue:327](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L327)): `&lt;option :value="null"&gt;{{ No warehouse }}&lt;/option&gt; &lt;option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id"&gt; {{ warehouse.name }}{{ warehouse.code ? ` (${warehouse.code})` : '' }} &lt;/option&gt;`
- locationForm.warehouse_id ([resources/js/Pages/Locations/Index.vue:415](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L415)): `&lt;option :value="null"&gt;{{ No warehouse }}&lt;/option&gt; &lt;option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id"&gt; {{ warehouse.name }}{{ warehouse.code ? ` (${warehouse.code})` : '' }} &lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: location.name — [resources/js/Pages/Locations/Index.vue:174](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L174) — v-for="location in locations.data"
- h3: Create Location — [resources/js/Pages/Locations/Index.vue:271](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L271) — v-if="showCreateModal"
- h3: Edit Location — [resources/js/Pages/Locations/Index.vue:362](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L362) — v-if="showEditModal"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Print QR Labels — [resources/js/Pages/Locations/Index.vue:127](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L127) | v-if="locations.data.length &gt; 0"; variant="secondary"; size="sm"; as="a"; :href="route('locations.qr.bulk-print')"; target="_blank" | No ancestor condition |
| Add Location — [resources/js/Pages/Locations/Index.vue:131](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L131) | variant="default"; size="sm"; @click="openCreateModal" | No ancestor condition |
| Search — [resources/js/Pages/Locations/Index.vue:155](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L155) | :loading="locationForm.processing"; type="submit"; variant="default"; size="sm" | No ancestor condition |
| Clear — [resources/js/Pages/Locations/Index.vue:159](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L159) | type="button"; variant="secondary"; size="sm"; @click="clearFilters" | No ancestor condition |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Locations/Index.vue:195](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L195) | :href="route('locations.qr.print', location.id)"; target="_blank"; :aria-label="t('locations.printQrLabel')"; :title="t('locations.printQrLabel')" | v-for="location in locations.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Locations/Index.vue:204](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L204) | @click="openEditModal(location)"; :aria-label="t('common.edit')"; :title="t('common.edit')" | v-for="location in locations.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Locations/Index.vue:212](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L212) | @click="deleteLocation(location)"; :disabled="location.products_count &gt; 0"; :aria-label="t('common.delete')"; :title="t('common.delete')" | v-for="location in locations.data" |
| Create Your First Location — [resources/js/Pages/Locations/Index.vue:230](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L230) | variant="default"; size="sm"; @click="openCreateModal" | v-if="locations.data.length === 0" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Locations/Index.vue:246](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L246) | v-if="link.url"; :href="link.url"; v-html="link.label" | v-if="locations.data.length &gt; 0" → v-for="link in locations.links" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Locations/Index.vue:274](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L274) | @click="showCreateModal = false"; :aria-label="t('locations.close')" | v-if="showCreateModal" |
| Cancel — [resources/js/Pages/Locations/Index.vue:348](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L348) | type="button"; variant="secondary"; size="sm"; @click="showCreateModal = false" | v-if="showCreateModal" |
| Create Location — [resources/js/Pages/Locations/Index.vue:349](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L349) | :loading="locationForm.processing"; type="submit"; variant="default"; size="sm" | v-if="showCreateModal" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Locations/Index.vue:365](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L365) | @click="showEditModal = false"; :aria-label="t('locations.close')" | v-if="showEditModal" |
| Cancel — [resources/js/Pages/Locations/Index.vue:436](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L436) | type="button"; variant="secondary"; size="sm"; @click="showEditModal = false" | v-if="showEditModal" |
| Update Location — [resources/js/Pages/Locations/Index.vue:437](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L437) | :loading="locationForm.processing"; type="submit"; variant="default"; size="sm" | v-if="showEditModal" |

**Script endpoint names:** `locations.index`, `locations.store`, `locations.update`, `locations.destroy`. Match these to verb/path/permission in the route annex.



<a id="e0064"></a>

> Audit provenance: `inventory.md` lines 2849–2897. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductLocation/StoreProductLocationRequest.php

Source [app/Http/Requests/ProductLocation/StoreProductLocationRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/ProductLocation/StoreProductLocationRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\ProductLocation;
6: 
7: use App\Models\Warehouse;
8: use Illuminate\Foundation\Http\FormRequest;
9: 
10: /**
11:  * Validates a new product location (web surface). Rules unchanged from the
12:  * previous inline validation in Inventory\ProductLocationController::store,
13:  * including the org-ownership check on the optional warehouse_id.
14:  */
15: final class StoreProductLocationRequest extends FormRequest
16: {
17:     /**
18:      * @return array<string, mixed>
19:      */
20:     public function rules(): array
21:     {
22:         $organizationId = $this->user()->organization_id;
23: 
24:         return [
25:             'name' => 'required|string|max:255',
26:             'code' => 'required|string|max:50',
27:             'description' => 'nullable|string',
28:             'is_active' => 'boolean',
29:             'capacity' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
30:             'warehouse_id' => [
31:                 'nullable',
32:                 'exists:warehouses,id',
33:                 function ($attribute, $value, $fail) use ($organizationId) {
34:                     if ($value && ! Warehouse::where('id', $value)->where('organization_id', $organizationId)->exists()) {
35:                         $fail('The selected warehouse does not belong to your organization.');
36:                     }
37:                 },
38:             ],
39:         ];
40:     }
41: }
42: 
```



<a id="e0065"></a>

> Audit provenance: `inventory.md` lines 2898–2946. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductLocation/UpdateProductLocationRequest.php

Source [app/Http/Requests/ProductLocation/UpdateProductLocationRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/ProductLocation/UpdateProductLocationRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\ProductLocation;
6: 
7: use App\Models\Warehouse;
8: use Illuminate\Foundation\Http\FormRequest;
9: 
10: /**
11:  * Validates a product location edit (web surface). Rules unchanged from the
12:  * previous inline validation in Inventory\ProductLocationController::update,
13:  * including the org-ownership check on the optional warehouse_id.
14:  */
15: final class UpdateProductLocationRequest extends FormRequest
16: {
17:     /**
18:      * @return array<string, mixed>
19:      */
20:     public function rules(): array
21:     {
22:         $organizationId = $this->user()->organization_id;
23: 
24:         return [
25:             'name' => 'required|string|max:255',
26:             'code' => 'required|string|max:50',
27:             'description' => 'nullable|string',
28:             'is_active' => 'boolean',
29:             'capacity' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
30:             'warehouse_id' => [
31:                 'nullable',
32:                 'exists:warehouses,id',
33:                 function ($attribute, $value, $fail) use ($organizationId) {
34:                     if ($value && ! Warehouse::where('id', $value)->where('organization_id', $organizationId)->exists()) {
35:                         $fail('The selected warehouse does not belong to your organization.');
36:                     }
37:                 },
38:             ],
39:         ];
40:     }
41: }
42: 
```



<a id="e0091"></a>

> Audit provenance: `inventory.md` lines 4416–4461. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductLocationController.php — 145-185

Source [app/Http/Controllers/Inventory/ProductLocationController.php:145](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/ProductLocationController.php#L145)

```php
145:     public function destroy(Request $request, ProductLocation $location)
146:     {
147:         // Ensure user can only delete locations from their organization
148:         if ($location->organization_id !== $request->user()->organization_id) {
149:             abort(403, 'Unauthorized action.');
150:         }
151: 
152:         $this->warehouseAccess->authorizeLocation($request->user(), $location);
153: 
154:         // Check if location has products (as their primary location)
155:         if ($location->products()->count() > 0) {
156:             return redirect()->back()
157:                 ->withErrors(['location' => __('Cannot delete location with associated products.')]);
158:         }
159: 
160:         // Check if the location still holds stock in a bin. Locations are
161:         // soft-deleted, so the product_location_stocks cascade never fires —
162:         // deleting a location that holds stock (common after a transfer moved
163:         // stock here from a product whose primary location is elsewhere) would
164:         // strand that stock against a trashed location.
165:         if (ProductLocationStock::query()
166:             ->where('location_id', $location->id)
167:             ->where('quantity', '>', 0)
168:             ->exists()) {
169:             return redirect()->back()
170:                 ->withErrors(['location' => __('Cannot delete a location that still holds stock. Transfer its stock elsewhere first.')]);
171:         }
172: 
173:         if (\App\Models\Inventory\VariantLocationStock::query()->where('location_id', $location->id)->where('quantity', '>', 0)->exists()) {
174:             return redirect()->back()->withErrors(['location' => __('Cannot delete a location that still holds variant stock. Transfer its stock elsewhere first.')]);
175:         }
176: 
177:         $location->delete();
178: 
179:         return redirect()->route('locations.index')
180:             ->with('success', __('Location deleted successfully.'));
181:     }
182: }
183: 
```



<a id="e0096"></a>

> Audit provenance: `inventory.md` lines 4757–4786. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductLocation
[app/Models/Inventory/ProductLocation.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/ProductLocation.php#L1)

```php
54:     protected $fillable = [
55:         'organization_id',
56:         'warehouse_id',
57:         'name',
58:         'code',
59:         'description',
60:         'aisle',
61:         'shelf',
62:         'bin',
63:         'capacity',
64:         'is_active',
65:     ];
72:     protected function casts(): array
73:     {
74:         return [
75:             'is_active' => 'boolean',
76:             'capacity' => 'integer',
77:         ];
85:     public function organization(): BelongsTo
87:         return $this->belongsTo(Organization::class);
90:     public function warehouse(): BelongsTo
92:         return $this->belongsTo(Warehouse::class);
100:     public function products(): HasMany
102:         return $this->hasMany(Product::class, 'location_id');
```



<a id="e0119"></a>

> Audit provenance: `inventory.md` lines 5627–5646. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_10_12_034229_create_product_locations_table.php
[database/migrations/2025_10_12_034229_create_product_locations_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_10_12_034229_create_product_locations_table.php#L1)

```php
15:             Schema::create('product_locations', function (Blueprint $table) {
16:                 $table->id();
17:                 $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
18:                 $table->string('name');
19:                 $table->string('code')->nullable();
20:                 $table->text('description')->nullable();
21:                 $table->string('aisle')->nullable();
22:                 $table->string('shelf')->nullable();
23:                 $table->string('bin')->nullable();
24:                 $table->boolean('is_active')->default(true);
25:                 $table->timestamps();
26:                 $table->softDeletes();
28:                 $table->index(['organization_id', 'code']);
29:                 $table->index('is_active');
```



<a id="e0482"></a>

> Audit provenance: `additional-contracts.md` lines 419–459. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductLocation/StoreProductLocationRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductLocation/StoreProductLocationRequest.php#L1). SHA-256: `a1d9a777ebd3bed1ba6dd1146e2fb293ba2b14f731a89e896df2b8f97819efcf`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductLocation;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a new product location via the REST API. Rules unchanged from
12:  * Api\ProductLocationController::store.
13:  */
14: final class StoreProductLocationRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, array<int, mixed>>
18:      */
19:     public function rules(): array
20:     {
21:         return [
22:             'name' => ['required', 'string', 'max:255'],
23:             'code' => ['nullable', 'string', 'max:255'],
24:             'description' => ['nullable', 'string'],
25:             'aisle' => ['nullable', 'string', 'max:255'],
26:             'shelf' => ['nullable', 'string', 'max:255'],
27:             'bin' => ['nullable', 'string', 'max:255'],
28:             'is_active' => ['nullable', 'boolean'],
29:             'capacity' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
30:             // Optional: the warehouse this location belongs to (same org).
31:             'warehouse_id' => ['nullable', 'integer', Rule::exists('warehouses', 'id')->where('organization_id', $this->user()->organization_id)->whereNull('deleted_at')],
32:         ];
33:     }
34: }
```



<a id="e0483"></a>

> Audit provenance: `additional-contracts.md` lines 460–500. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductLocation/UpdateProductLocationRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductLocation/UpdateProductLocationRequest.php#L1). SHA-256: `4def152f63b44dfa57f112ec1ce82e23ecabe2eb11975abdf1f855cdfef1e2d4`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductLocation;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a product location update via the REST API. Rules unchanged from
12:  * Api\ProductLocationController::update (name is `sometimes`).
13:  */
14: final class UpdateProductLocationRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, array<int, mixed>>
18:      */
19:     public function rules(): array
20:     {
21:         return [
22:             'name' => ['sometimes', 'string', 'max:255'],
23:             'code' => ['nullable', 'string', 'max:255'],
24:             'description' => ['nullable', 'string'],
25:             'aisle' => ['nullable', 'string', 'max:255'],
26:             'shelf' => ['nullable', 'string', 'max:255'],
27:             'bin' => ['nullable', 'string', 'max:255'],
28:             'is_active' => ['nullable', 'boolean'],
29:             'capacity' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
30:             // Optional: the warehouse this location belongs to (same org).
31:             'warehouse_id' => ['nullable', 'integer', Rule::exists('warehouses', 'id')->where('organization_id', $this->user()->organization_id)->whereNull('deleted_at')],
32:         ];
33:     }
34: }
```

