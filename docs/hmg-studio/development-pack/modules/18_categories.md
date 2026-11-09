# 18. Categories — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Categories as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Category listing and modal create/edit; description and active state; related products and selection options.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Categories/Index.vue` | Pending | Pending |

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

- [ ] Required/unique/scoped fields follow source rules.
- [ ] save/reload reflects changes in product selectors.
- [ ] deletion and referenced-record restrictions match source rather than silently cascade.

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

- [Categories/Index](#e0018)
- [ProductCategory/StoreProductCategoryRequest.php](#e0062)
- [ProductCategory/UpdateProductCategoryRequest.php](#e0063)
- [ProductCategoryController.php — 113-137](#e0090)
- [ProductCategory](#e0095)
- [2025_10_12_034229_create_product_categories_table.php](#e0118)
- [`app/Http/Requests/Api/ProductCategory/StoreProductCategoryRequest.php`](#e0478)
- [`app/Http/Requests/Api/ProductCategory/UpdateProductCategoryRequest.php`](#e0479)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0018"></a>

> Audit provenance: `inventory.md` lines 183–239. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Categories/Index

GET /categories; manage_categories. Search by text, paginated cards show name, description and products_count. Create/Edit dialogs share name and description. Delete asks confirmation and UI disables while products_count > 0. Both forms show server errors and focus first invalid field.

Source: [resources/js/Pages/Categories/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Categories/Index.vue:24
const search = ref(props.filters?.search || '');
// resources/js/Pages/Categories/Index.vue:25
const showCreateModal = ref(false);
// resources/js/Pages/Categories/Index.vue:26
const showEditModal = ref(false);
// resources/js/Pages/Categories/Index.vue:27
const editingCategory = ref(null);
// resources/js/Pages/Categories/Index.vue:28
const categoryForm = useForm({ name: '', description: '' });
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| search — [resources/js/Pages/Categories/Index.vue:125](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L125) | Search | text; props.filters?.search \|\| '' | ; v-model="search"; type="text"; :placeholder="t('categories.searchPlaceholder')" | Always within this view/dialog; see component visibility |
| categoryForm.name — [resources/js/Pages/Categories/Index.vue:249](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L249) | Category Name * | text; '' | ; v-model="categoryForm.name"; type="text"; :placeholder="t('categories.namePlaceholder')"; required | v-if="showCreateModal" |
| categoryForm.description — [resources/js/Pages/Categories/Index.vue:262](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L262) | Description | textarea; '' | ; v-model="categoryForm.description"; rows="3"; :placeholder="t('categories.descPlaceholder')" | v-if="showCreateModal" |
| categoryForm.name — [resources/js/Pages/Categories/Index.vue:306](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L306) | Category Name * | text; '' | ; v-model="categoryForm.name"; type="text"; required | v-if="showEditModal" |
| categoryForm.description — [resources/js/Pages/Categories/Index.vue:318](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L318) | Description | textarea; '' | ; v-model="categoryForm.description"; rows="3" | v-if="showEditModal" |

**Read fields, columns and section headings:**

- h3: category.name — [resources/js/Pages/Categories/Index.vue:149](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L149) — v-for="category in categories.data"
- h3: Create Category — [resources/js/Pages/Categories/Index.vue:228](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L228) — v-if="showCreateModal"
- h3: Edit Category — [resources/js/Pages/Categories/Index.vue:285](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L285) — v-if="showEditModal"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Add Category — [resources/js/Pages/Categories/Index.vue:111](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L111) | variant="default"; size="sm"; @click="openCreateModal" | No ancestor condition |
| Search — [resources/js/Pages/Categories/Index.vue:135](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L135) | :loading="categoryForm.processing"; type="submit"; variant="default"; size="sm" | No ancestor condition |
| Clear — [resources/js/Pages/Categories/Index.vue:139](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L139) | type="button"; variant="secondary"; size="sm"; @click="clearFilters" | No ancestor condition |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Categories/Index.vue:160](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L160) | type="button"; @click="openEditModal(category)"; :aria-label="t('common.edit')" | v-for="category in categories.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Categories/Index.vue:168](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L168) | type="button"; @click="deleteCategory(category)"; :disabled="category.products_count &gt; 0"; :aria-label="t('common.delete')" | v-for="category in categories.data" |
| Create Your First Category — [resources/js/Pages/Categories/Index.vue:186](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L186) | variant="default"; size="sm"; @click="openCreateModal" | v-if="categories.data.length === 0" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Categories/Index.vue:204](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L204) | v-if="link.url"; :href="link.url"; v-html="link.label" | v-if="categories.data.length &gt; 0" → v-for="link in categories.links" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Categories/Index.vue:231](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L231) | type="button"; @click="showCreateModal = false"; :aria-label="t('common.cancel')" | v-if="showCreateModal" |
| Cancel — [resources/js/Pages/Categories/Index.vue:271](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L271) | type="button"; variant="secondary"; size="sm"; @click="showCreateModal = false" | v-if="showCreateModal" |
| Create Category — [resources/js/Pages/Categories/Index.vue:272](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L272) | :loading="categoryForm.processing"; type="submit"; variant="default"; size="sm" | v-if="showCreateModal" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Categories/Index.vue:288](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L288) | type="button"; @click="showEditModal = false"; :aria-label="t('common.cancel')" | v-if="showEditModal" |
| Cancel — [resources/js/Pages/Categories/Index.vue:326](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L326) | type="button"; variant="secondary"; size="sm"; @click="showEditModal = false" | v-if="showEditModal" |
| Update Category — [resources/js/Pages/Categories/Index.vue:327](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L327) | :loading="categoryForm.processing"; type="submit"; variant="default"; size="sm" | v-if="showEditModal" |

**Script endpoint names:** `categories.index`, `categories.store`, `categories.update`, `categories.destroy`. Match these to verb/path/permission in the route annex.



<a id="e0062"></a>

> Audit provenance: `inventory.md` lines 2781–2814. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductCategory/StoreProductCategoryRequest.php

Source [app/Http/Requests/ProductCategory/StoreProductCategoryRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/ProductCategory/StoreProductCategoryRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\ProductCategory;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a new product category (web surface). Rules unchanged from the
11:  * previous inline validation in Inventory\ProductCategoryController::store.
12:  */
13: final class StoreProductCategoryRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, string>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'name' => 'required|string|max:255',
22:             'description' => 'nullable|string',
23:             'is_active' => 'boolean',
24:         ];
25:     }
26: }
27: 
```



<a id="e0063"></a>

> Audit provenance: `inventory.md` lines 2815–2848. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductCategory/UpdateProductCategoryRequest.php

Source [app/Http/Requests/ProductCategory/UpdateProductCategoryRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/ProductCategory/UpdateProductCategoryRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\ProductCategory;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates a product category edit (web surface). Rules unchanged from the
11:  * previous inline validation in Inventory\ProductCategoryController::update.
12:  */
13: final class UpdateProductCategoryRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, string>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'name' => 'required|string|max:255',
22:             'description' => 'nullable|string',
23:             'is_active' => 'boolean',
24:         ];
25:     }
26: }
27: 
```



<a id="e0090"></a>

> Audit provenance: `inventory.md` lines 4389–4415. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductCategoryController.php — 113-137

Source [app/Http/Controllers/Inventory/ProductCategoryController.php:113](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/ProductCategoryController.php#L113)

```php
113:     public function destroy(Request $request, ProductCategory $category)
114:     {
115:         // Ensure user can only delete categories from their organization
116:         if ($category->organization_id !== $request->user()->organization_id) {
117:             abort(403, 'Unauthorized action.');
118:         }
119: 
120:         // Check if category has products
121:         if ($category->products()->count() > 0) {
122:             return redirect()->back()
123:                 ->withErrors(['category' => __('Cannot delete category with associated products.')]);
124:         }
125: 
126:         $category->delete();
127: 
128:         return redirect()->route('categories.index')
129:             ->with('success', __('Category deleted successfully.'));
130:     }
131: }
132: 
```



<a id="e0095"></a>

> Audit provenance: `inventory.md` lines 4730–4756. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProductCategory
[app/Models/Inventory/ProductCategory.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/ProductCategory.php#L1)

```php
49:     protected $fillable = [
50:         'organization_id',
51:         'name',
52:         'slug',
53:         'description',
54:         'parent_id',
55:         'is_active',
56:     ];
63:     protected function casts(): array
64:     {
65:         return [
66:             'is_active' => 'boolean',
67:         ];
75:     public function organization(): BelongsTo
77:         return $this->belongsTo(Organization::class);
85:     public function parent(): BelongsTo
87:         return $this->belongsTo(ProductCategory::class, 'parent_id');
95:     public function children(): HasMany
97:         return $this->hasMany(ProductCategory::class, 'parent_id');
105:     public function products(): HasMany
107:         return $this->hasMany(Product::class, 'category_id');
```



<a id="e0118"></a>

> Audit provenance: `inventory.md` lines 5608–5626. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2025_10_12_034229_create_product_categories_table.php
[database/migrations/2025_10_12_034229_create_product_categories_table.php:1](C:/Users/proj/Inventoros/database/migrations/2025_10_12_034229_create_product_categories_table.php#L1)

```php
15:             Schema::create('product_categories', function (Blueprint $table) {
16:                 $table->id();
17:                 $table->foreignId('organization_id')->constrained()->cascadeOnDelete();
18:                 $table->string('name');
19:                 $table->string('slug');
20:                 $table->text('description')->nullable();
21:                 $table->foreignId('parent_id')->nullable()->constrained('product_categories')->nullOnDelete();
22:                 $table->boolean('is_active')->default(true);
23:                 $table->timestamps();
24:                 $table->softDeletes();
26:                 $table->index(['organization_id', 'slug']);
27:                 $table->index('parent_id');
28:                 $table->index('is_active');
```



<a id="e0478"></a>

> Audit provenance: `additional-contracts.md` lines 246–283. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductCategory/StoreProductCategoryRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductCategory/StoreProductCategoryRequest.php#L1). SHA-256: `a9e4bf0acdad47579cee1d91a872aea52c87b91146cf4ee99663d8500990b805`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductCategory;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a new product category via the REST API. Rules unchanged from
12:  * Api\ProductCategoryController::store.
13:  */
14: final class StoreProductCategoryRequest extends FormRequest
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
25:             'slug' => ['nullable', 'string', 'max:255'],
26:             'description' => ['nullable', 'string'],
27:             'parent_id' => ['nullable', 'integer', Rule::exists('product_categories', 'id')->where('organization_id', $organizationId)],
28:             'is_active' => ['nullable', 'boolean'],
29:         ];
30:     }
31: }
```



<a id="e0479"></a>

> Audit provenance: `additional-contracts.md` lines 284–321. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ProductCategory/UpdateProductCategoryRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ProductCategory/UpdateProductCategoryRequest.php#L1). SHA-256: `5104c5774006f07cdc31e7061ae638dcdbbf1dccafc9b5ba46014f8fe23a649f`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ProductCategory;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a product category update via the REST API. Rules unchanged from
12:  * Api\ProductCategoryController::update (name is `sometimes`).
13:  */
14: final class UpdateProductCategoryRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, mixed>
18:      */
19:     public function rules(): array
20:     {
21:         $organizationId = $this->user()->organization_id;
22: 
23:         return [
24:             'name' => ['sometimes', 'string', 'max:255'],
25:             'slug' => ['nullable', 'string', 'max:255'],
26:             'description' => ['nullable', 'string'],
27:             'parent_id' => ['nullable', 'integer', Rule::exists('product_categories', 'id')->where('organization_id', $organizationId)],
28:             'is_active' => ['nullable', 'boolean'],
29:         ];
30:     }
31: }
```

