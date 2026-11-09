# 16. Suppliers — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Suppliers as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Supplier create/edit/list/detail; supplier ratings and product associations; contact/address fields; purchasing history.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Suppliers/Create.vue` | Pending | Pending |
| `resources/js/Pages/Suppliers/Edit.vue` | Pending | Pending |
| `resources/js/Pages/Suppliers/Index.vue` | Pending | Pending |
| `resources/js/Pages/Suppliers/Show.vue` | Pending | Pending |

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

- [ ] Create and reload supplier.
- [ ] product association keeps supplier SKU/cost/lead time/minimum quantity.
- [ ] primary supplier rule is enforced.
- [ ] supplier detail/PO navigation respects permissions.

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

- [Components/ProductSupplierManager](#e0053)
- [Shared product supplier link rules](#e0075)
- [resources/js/Pages/Suppliers/Create.vue](#e0180)
- [resources/js/Pages/Suppliers/Edit.vue](#e0181)
- [resources/js/Pages/Suppliers/Index.vue](#e0182)
- [resources/js/Pages/Suppliers/Show.vue](#e0183)
- [resources/js/Components/SupplierRating.vue](#e0208)
- [StoreSupplierRequest.php](#e0213)
- [UpdateSupplierRequest.php](#e0214)
- [app/Models/Inventory/Supplier.php](#e0236)
- [app/Models/Inventory/SupplierPriceHistory.php](#e0237)
- [`app/Http/Requests/Api/Supplier/StoreSupplierRequest.php`](#e0497)
- [`app/Http/Requests/Api/Supplier/UpdateSupplierRequest.php`](#e0498)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0053"></a>

> Audit provenance: `inventory.md` lines 2417–2445. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/ProductSupplierManager

Repeating suppliers[] link editor; unbound value handlers are real fields, not omitted data. Defaults add supplier_id blank, supplier_sku blank, cost_price blank, lead_time_days blank, minimum_order_quantity blank, first is_primary=true. Choose supplier; optional supplier SKU/cost/lead/min-order; primary radio; remove row. Server rule shared by product web/API.

Source: [resources/js/Components/ProductSupplierManager.vue:1](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L1).

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| (unbound) — [resources/js/Components/ProductSupplierManager.vue:93](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L93) | Supplier | select; See :value / :checked and event handler; not a v-model field | ; :value="row.supplier_id"; @change="setField(index, 'supplier_id', $event.target.value ? Number($event.target.value) : '')" | v-for="(row, index) in rows" |
| (unbound) — [resources/js/Components/ProductSupplierManager.vue:114](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L114) | Supplier SKU | text; See :value / :checked and event handler; not a v-model field | ; :value="row.supplier_sku"; type="text"; maxlength="255"; @input="setField(index, 'supplier_sku', $event.target.value)" | v-for="(row, index) in rows" |
| (unbound) — [resources/js/Components/ProductSupplierManager.vue:131](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L131) | Cost price | number; See :value / :checked and event handler; not a v-model field | ; :value="row.cost_price"; type="number"; step="0.01"; min="0"; @input="setField(index, 'cost_price', $event.target.value)" | v-for="(row, index) in rows" |
| (unbound) — [resources/js/Components/ProductSupplierManager.vue:146](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L146) | Lead time (days) | number; See :value / :checked and event handler; not a v-model field | ; :value="row.lead_time_days"; type="number"; min="0"; step="1"; @input="setField(index, 'lead_time_days', $event.target.value)" | v-for="(row, index) in rows" |
| (unbound) — [resources/js/Components/ProductSupplierManager.vue:160](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L160) | Min order qty | number; See :value / :checked and event handler; not a v-model field | ; :value="row.minimum_order_quantity"; type="number"; min="1"; step="1"; :placeholder="t('productSuppliers.minimumOrderPlaceholder')"; @input="setField(index, 'minimum_order_quantity', $event.target.value)" | v-for="(row, index) in rows" |
| (unbound) — [resources/js/Components/ProductSupplierManager.vue:175](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L175) | Primary | radio; See :value / :checked and event handler; not a v-model field | type="radio"; name="primary-supplier"; :checked="row.is_primary"; @change="makePrimary(index)" | v-for="(row, index) in rows" |

**Select options and labels (exact source, including remote lists):**

- (unbound) ([resources/js/Components/ProductSupplierManager.vue:93](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L93)): `&lt;option value=""&gt;{{ Select a supplier }}&lt;/option&gt; &lt;option v-for="supplier in options" :key="supplier.id" :value="supplier.id" :disabled="isTaken(supplier.id, index)" &gt; {{ supplier.name }}&lt;template v-if="supplier.code"&gt; ({{ supplier.code }})&lt;/template&gt; &lt;/option&gt;`

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| (icon-only; accessible label/title in attributes) — [resources/js/Components/ProductSupplierManager.vue:184](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L184) | type="button"; :aria-label="t('productSuppliers.remove')"; :title="t('productSuppliers.remove')"; @click="removeRow(index)" | v-for="(row, index) in rows" |
| Create a supplier — [resources/js/Components/ProductSupplierManager.vue:202](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L202) | :href="route('suppliers.create')" | v-if="options.length === 0" |
| Add supplier — [resources/js/Components/ProductSupplierManager.vue:208](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L208) | type="button"; variant="secondary"; size="sm"; :disabled="rows.length &gt;= options.length"; @click="addRow" | v-else |



<a id="e0075"></a>

> Audit provenance: `inventory.md` lines 3358–3425. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Shared product supplier link rules

Source [app/Http/Requests/Concerns/ValidatesProductSuppliers.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Concerns/ValidatesProductSuppliers.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Concerns;
6: 
7: use Closure;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * The `suppliers[]` rules shared by every product write surface (web store and
12:  * update, REST store and update) so they validate a supplier link identically.
13:  *
14:  * Every supplier_id must be a live supplier of the caller's organization; a
15:  * foreign id fails validation rather than linking another tenant's supplier.
16:  * At most one entry may be flagged primary (ProductService promotes the first
17:  * entry when none is).
18:  */
19: trait ValidatesProductSuppliers
20: {
21:     /**
22:      * @return array<string, mixed>
23:      */
24:     protected function productSupplierRules(int $organizationId): array
25:     {
26:         return [
27:             'suppliers' => [
28:                 'sometimes',
29:                 'array',
30:                 'max:50',
31:                 function (string $attribute, mixed $value, Closure $fail): void {
32:                     if (! is_array($value)) {
33:                         return;
34:                     }
35: 
36:                     $primaries = collect($value)
37:                         ->filter(fn ($row) => is_array($row) && filter_var($row['is_primary'] ?? false, FILTER_VALIDATE_BOOLEAN))
38:                         ->count();
39: 
40:                     if ($primaries > 1) {
41:                         $fail('Only one supplier can be the primary supplier.');
42:                     }
43:                 },
44:             ],
45:             'suppliers.*.supplier_id' => [
46:                 'required',
47:                 'integer',
48:                 'distinct',
49:                 Rule::exists('suppliers', 'id')
50:                     ->where('organization_id', $organizationId)
51:                     ->whereNull('deleted_at'),
52:             ],
53:             'suppliers.*.supplier_sku' => ['nullable', 'string', 'max:255'],
54:             'suppliers.*.cost_price' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
55:             'suppliers.*.lead_time_days' => ['nullable', 'integer', 'min:0', 'max:3650'],
56:             'suppliers.*.minimum_order_quantity' => ['nullable', 'integer', 'min:1', 'max:1000000'],
57:             'suppliers.*.is_primary' => ['nullable', 'boolean'],
58:         ];
59:     }
60: }
61: 
```



<a id="e0180"></a>

> Audit provenance: `commerce.md` lines 587–687. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Suppliers/Create.vue

Source: [resources/js/Pages/Suppliers/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L1).


**Named routes referenced:** `suppliers.index`, `suppliers.store`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Basic Information (L80)
- h3: Address (L124)
- h3: Business Details (L162)


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.name` | Supplier Name * | input / text | HTML required | — | [resources/js/Pages/Suppliers/Create.vue:85](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L85) |

| `form.code` | Supplier Code | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:91](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L91) |

| `form.contact_name` | Contact Person | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:97](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L97) |

| `form.email` | Email | input / email | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:103](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L103) |

| `form.phone` | Phone | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:109](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L109) |

| `form.website` | Website | input / url | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:115](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L115) |

| `form.address` | Street Address | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:129](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L129) |

| `form.city` | City | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:135](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L135) |

| `form.state` | State/Province | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:141](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L141) |

| `form.zip_code` | ZIP/Postal Code | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:147](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L147) |

| `form.country` | Country | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:153](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L153) |

| `form.payment_terms` | Payment Terms | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:167](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L167) |

| `form.currency` | Currency | CurrencySelect | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:173](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L173) |

| `form.rating` | Rating | SupplierRating | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:179](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L179) |

| `form.notes` | Notes | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:186](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L186) |

| `form.is_active` | Active | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Create.vue:192](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L192) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/Suppliers/Create.vue:22](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L22)

```text
22: const form = useForm({
23:     name: '',
24:     code: '',
25:     contact_name: '',
26:     email: '',
27:     phone: '',
28:     address: '',
29:     city: '',
30:     state: '',
31:     zip_code: '',
32:     country: '',
33:     website: '',
34:     payment_terms: '',
35:     currency: organizationCurrency.value,
36:     notes: '',
37:     is_active: true,
38:     rating: null,
39: });
40: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Create.vue:57](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L57) |

| Suppliers | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Create.vue:59](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L59) |

| Back to Suppliers | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Create.vue:67](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L67) |

| Cancel | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Create.vue:202](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L202) |

| Create Supplier | `type=submit; :loading=form.processing; :disabled=form.processing` | [resources/js/Pages/Suppliers/Create.vue:205](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Create.vue#L205) |


**Conditional sections / submit boundaries (source expressions):**

```text
77: <form @submit.prevent="submit" class="mt-6 space-y-4">
```




<a id="e0181"></a>

> Audit provenance: `commerce.md` lines 688–790. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Suppliers/Edit.vue

Source: [resources/js/Pages/Suppliers/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L1).


**Named routes referenced:** `suppliers.index`, `suppliers.show`, `suppliers.update`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Basic Information (L85)
- h3: Address (L129)
- h3: Business Details (L167)


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.name` | Supplier Name * | input / text | HTML required | — | [resources/js/Pages/Suppliers/Edit.vue:90](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L90) |

| `form.code` | Supplier Code | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:96](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L96) |

| `form.contact_name` | Contact Person | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:102](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L102) |

| `form.email` | Email | input / email | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:108](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L108) |

| `form.phone` | Phone | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:114](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L114) |

| `form.website` | Website | input / url | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:120](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L120) |

| `form.address` | Street Address | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:134](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L134) |

| `form.city` | City | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:140](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L140) |

| `form.state` | State/Province | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:146](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L146) |

| `form.zip_code` | ZIP/Postal Code | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:152](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L152) |

| `form.country` | Country | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:158](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L158) |

| `form.payment_terms` | Payment Terms | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:172](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L172) |

| `form.currency` | Currency | CurrencySelect | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:178](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L178) |

| `form.rating` | Rating | SupplierRating | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:184](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L184) |

| `form.notes` | Notes | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:191](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L191) |

| `form.is_active` | Active | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Edit.vue:197](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L197) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/Suppliers/Edit.vue:23](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L23)

```text
23: const form = useForm({
24:     name: props.supplier.name || '',
25:     code: props.supplier.code || '',
26:     contact_name: props.supplier.contact_name || '',
27:     email: props.supplier.email || '',
28:     phone: props.supplier.phone || '',
29:     address: props.supplier.address || '',
30:     city: props.supplier.city || '',
31:     state: props.supplier.state || '',
32:     zip_code: props.supplier.zip_code || '',
33:     country: props.supplier.country || '',
34:     website: props.supplier.website || '',
35:     payment_terms: props.supplier.payment_terms || '',
36:     currency: props.supplier.currency || organizationCurrency.value,
37:     notes: props.supplier.notes || '',
38:     is_active: props.supplier.is_active ?? true,
39:     rating: props.supplier.rating ?? null,
40: });
41: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Edit.vue:58](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L58) |

| Suppliers | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Edit.vue:60](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L60) |

| View | `:href=route('suppliers.show', supplier.id)` | [resources/js/Pages/Suppliers/Edit.vue:68](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L68) |

| Back to Suppliers | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Edit.vue:72](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L72) |

| Cancel | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Edit.vue:207](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L207) |

| Update Supplier | `type=submit; :loading=form.processing; :disabled=form.processing` | [resources/js/Pages/Suppliers/Edit.vue:208](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Edit.vue#L208) |


**Conditional sections / submit boundaries (source expressions):**

```text
82: <form @submit.prevent="submit" class="mt-6 space-y-4">
```




<a id="e0182"></a>

> Audit provenance: `commerce.md` lines 791–863. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Suppliers/Index.vue

Source: [resources/js/Pages/Suppliers/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L1).


**Named routes referenced:** `suppliers.create`, `suppliers.destroy`, `suppliers.edit`, `suppliers.index`, `suppliers.show`.


**Permission/route-capability checks:** `delete_suppliers`, `suppliers.create`, `suppliers.edit`.


**Sections / displayed fields / table columns:**

- th: Name (L105)
- th: Contact (L106)
- th: Email (L107)
- th: Phone (L108)
- th: products (L109)
- th: Rating (L110)
- th: Status (L111)
- th: Actions (L112)


**UI state/filter defaults:**

```text
26: const search = ref(props.filters?.search || '');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `search` | Search Suppliers | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Suppliers/Index.vue:80](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L80) |


| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Add Supplier | `v-if=canVisit('suppliers.create'); :href=route('suppliers.create')` | [resources/js/Pages/Suppliers/Index.vue:68](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L68) |

| Search | `type=submit` | [resources/js/Pages/Suppliers/Index.vue:81](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L81) |

| Search | `type=submit` | [resources/js/Pages/Suppliers/Index.vue:89](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L89) |

| Clear | `type=button; @click=clearFilters` | [resources/js/Pages/Suppliers/Index.vue:93](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L93) |

| Add Supplier | `v-if=canVisit('suppliers.create'); :href=route('suppliers.create')` | [resources/js/Pages/Suppliers/Index.vue:122](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L122) |

| Icon action | `:href=route('suppliers.show', supplier.id)` | [resources/js/Pages/Suppliers/Index.vue:157](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L157) |

| Icon action | `v-if=canVisit('suppliers.edit'); :href=route('suppliers.edit', supplier.id)` | [resources/js/Pages/Suppliers/Index.vue:158](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L158) |

| Icon action | `v-if=hasPermission('delete_suppliers'); @click=deleteSupplier(supplier)` | [resources/js/Pages/Suppliers/Index.vue:159](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Index.vue#L159) |


**Conditional sections / submit boundaries (source expressions):**

```text
68: <Button v-if="canVisit('suppliers.create')" variant="default" size="sm" as="Link" :href="route('suppliers.create')">
78: <form class="table-quick-search" @submit.prevent="searchSuppliers">
84: <form @submit.prevent="searchSuppliers" class="space-y-4">
116: <tr v-if="suppliers.data.length === 0">
122: <Button v-if="canVisit('suppliers.create')" variant="default" size="sm" as="Link" :href="route('suppliers.create')">
132: <div v-if="supplier.code" class="text-xs text-text-tertiary">{{ supplier.code }}</div>
138: <a v-if="supplier.email" :href="`mailto:${supplier.email}`" class="text-brand hover:underline">{{ supplier.email }}</a>
158: <Link v-if="canVisit('suppliers.edit')" :href="route('suppliers.edit', supplier.id)" class="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-status-success" :title="t('common.edit')"><Pencil :size="16" /></Link>
159: <button v-if="hasPermission('delete_suppliers')" @click="deleteSupplier(supplier)" class="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-status-danger" :title="t('common.delete')"><Trash2 :size="16" /></button>
167: <div v-if="suppliers.data.length > 0" class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row table-pagination">
173: <Link v-if="link.url" :href="link.url"
```




<a id="e0183"></a>

> Audit provenance: `commerce.md` lines 864–929. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Suppliers/Show.vue

Source: [resources/js/Pages/Suppliers/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Show.vue#L1).


**Named routes referenced:** `products.show`, `suppliers.destroy`, `suppliers.edit`, `suppliers.index`.


**Permission/route-capability checks:** `products.show`, `suppliers.edit`.


**Sections / displayed fields / table columns:**

- h3: Contact Information (L79)
- dt: Contact Person (L83)
- dt: Email (L87)
- dt: Phone (L96)
- dt: Website (L100)
- h3: Address (L114)
- h3: Products (L134)
- th: Product (L142)
- th: SKU (L143)
- th: Supplier SKU (L144)
- th: Cost Price (L145)
- h3: Business Details (L178)
- dt: Rating (L182)
- dt: Supplier Code (L186)
- dt: Payment Terms (L190)
- dt: Currency (L194)
- h3: Notes (L203)
- h3: Danger Zone (L211)


No editable model-bound controls in this file; navigation and action-only controls listed below.



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Show.vue:47](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Show.vue#L47) |

| Suppliers | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Show.vue:49](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Show.vue#L49) |

| Edit | `v-if=canVisit('suppliers.edit'); :href=route('suppliers.edit', supplier.id)` | [resources/js/Pages/Suppliers/Show.vue:60](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Show.vue#L60) |

| Back | `:href=route('suppliers.index')` | [resources/js/Pages/Suppliers/Show.vue:64](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Show.vue#L64) |

| product.name | `v-if=canVisit('products.show'); :href=route('products.show', product.id)` | [resources/js/Pages/Suppliers/Show.vue:152](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Show.vue#L152) |

| Delete Supplier | `@click=deleteSupplier` | [resources/js/Pages/Suppliers/Show.vue:213](C:/Users/proj/Inventoros/resources/js/Pages/Suppliers/Show.vue#L213) |


**Conditional sections / submit boundaries (source expressions):**

```text
60: <Button v-if="canVisit('suppliers.edit')" variant="default" size="sm" as="Link" :href="route('suppliers.edit', supplier.id)">
89: <a v-if="supplier.email" :href="`mailto:${supplier.email}`" class="text-brand hover:underline">
102: <a v-if="supplier.website" :href="supplier.website" target="_blank" class="text-brand hover:underline">
117: <template v-if="supplier.address || supplier.city || supplier.state || supplier.zip_code || supplier.country">
138: <TableViewport v-if="supplier.products?.length > 0" class="w-full overflow-x-auto rounded-lg border border-border-subtle">
152: <Link v-if="canVisit('products.show')" :href="route('products.show', product.id)" class="text-sm font-medium text-brand hover:underline">
202: <Card v-if="supplier.notes" :padded="false">
```




<a id="e0208"></a>

> Audit provenance: `commerce.md` lines 3157–3184. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Components/SupplierRating.vue

Source: [resources/js/Components/SupplierRating.vue:1](C:/Users/proj/Inventoros/resources/js/Components/SupplierRating.vue#L1).


**Named routes referenced:** Dynamic/component props; see action expressions..


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


No editable model-bound controls in this file; navigation and action-only controls listed below.



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| t('suppliers.rating.stars', { count: n }) | `type=button; @click=pick(n)` | [resources/js/Components/SupplierRating.vue:37](C:/Users/proj/Inventoros/resources/js/Components/SupplierRating.vue#L37) |


**Conditional sections / submit boundaries (source expressions):**

```text
32: v-if="editable"
```




<a id="e0213"></a>

> Audit provenance: `commerce.md` lines 3302–3345. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StoreSupplierRequest.php

[app/Http/Requests/Supplier/StoreSupplierRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Supplier/StoreSupplierRequest.php#L1)

```php
9: 
10: /**
11:  * Validates a new supplier (web surface). `code` is org-scoped unique so a
12:  * duplicate (or reusing a soft-deleted supplier's code) returns a friendly
13:  * validation error instead of hitting the DB unique(organization_id, code)
14:  * index and 500ing.
15:  */
16: final class StoreSupplierRequest extends FormRequest
17: {
18:     /**
19:      * @return array<string, mixed>
20:      */
21:     public function rules(): array
22:     {
23:         $organizationId = $this->user()->organization_id;
24: 
25:         return [
26:             'name' => ['required', 'string', 'max:255'],
27:             'code' => ['nullable', 'string', 'max:255', Rule::unique('suppliers', 'code')->where('organization_id', $organizationId)],
28:             'contact_name' => ['nullable', 'string', 'max:255'],
29:             'email' => ['nullable', 'email', 'max:255'],
30:             'phone' => ['nullable', 'string', 'max:255'],
31:             'address' => ['nullable', 'string'],
32:             'city' => ['nullable', 'string', 'max:255'],
33:             'state' => ['nullable', 'string', 'max:255'],
34:             'zip_code' => ['nullable', 'string', 'max:255'],
35:             'country' => ['nullable', 'string', 'max:255'],
36:             'website' => ['nullable', 'url', 'max:255'],
37:             'payment_terms' => ['nullable', 'string', 'max:255'],
38:             'currency' => ['nullable', 'string', 'max:3'],
39:             'notes' => ['nullable', 'string'],
40:             'is_active' => ['nullable', 'boolean'],
41:             'rating' => ['nullable', 'integer', 'between:1,5'],
42:         ];
43:     }
44: }
```




<a id="e0214"></a>

> Audit provenance: `commerce.md` lines 3346–3387. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### UpdateSupplierRequest.php

[app/Http/Requests/Supplier/UpdateSupplierRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Supplier/UpdateSupplierRequest.php#L1)

```php
9: 
10: /**
11:  * Validates a supplier edit (web surface). `code` is org-scoped unique
12:  * (ignoring this supplier) so it can't collide with another supplier's code.
13:  */
14: final class UpdateSupplierRequest extends FormRequest
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
25:             'code' => ['nullable', 'string', 'max:255', Rule::unique('suppliers', 'code')->where('organization_id', $organizationId)->ignore($this->route('supplier'))],
26:             'contact_name' => ['nullable', 'string', 'max:255'],
27:             'email' => ['nullable', 'email', 'max:255'],
28:             'phone' => ['nullable', 'string', 'max:255'],
29:             'address' => ['nullable', 'string'],
30:             'city' => ['nullable', 'string', 'max:255'],
31:             'state' => ['nullable', 'string', 'max:255'],
32:             'zip_code' => ['nullable', 'string', 'max:255'],
33:             'country' => ['nullable', 'string', 'max:255'],
34:             'website' => ['nullable', 'url', 'max:255'],
35:             'payment_terms' => ['nullable', 'string', 'max:255'],
36:             'currency' => ['nullable', 'string', 'max:3'],
37:             'notes' => ['nullable', 'string'],
38:             'is_active' => ['nullable', 'boolean'],
39:             'rating' => ['nullable', 'integer', 'between:1,5'],
40:         ];
41:     }
42: }
```




<a id="e0236"></a>

> Audit provenance: `commerce.md` lines 4396–4433. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Inventory/Supplier.php

[app/Models/Inventory/Supplier.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/Supplier.php#L1)


```php
protected $fillable = [
        'organization_id',
        'name',
        'code',
        'contact_name',
        'email',
        'phone',
        'address',
        'city',
        'state',
        'zip_code',
        'country',
        'website',
        'payment_terms',
        'currency',
        'notes',
        'metadata',
        'is_active',
        'rating',
    ];
```


```php
18: use Illuminate\Database\Eloquent\SoftDeletes;
52: use BelongsToOrganization, HasFactory, LogsActivity, SoftDeletes;
112: return $this->belongsTo(Organization::class);
122: return $this->belongsToMany(Product::class, 'product_supplier')
135: return $this->hasMany(PurchaseOrder::class);
```




<a id="e0237"></a>

> Audit provenance: `commerce.md` lines 4434–4465. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Inventory/SupplierPriceHistory.php

[app/Models/Inventory/SupplierPriceHistory.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/SupplierPriceHistory.php#L1)


```php
protected $fillable = [
        'organization_id',
        'product_id',
        'product_variant_id',
        'supplier_id',
        'purchase_order_id',
        'cost_price',
        'source',
        'user_id',
        'recorded_at',
    ];
```


```php
42: protected $table = 'supplier_price_history';
65: 'cost_price' => 'decimal:2',
99: return $this->belongsTo(Organization::class);
107: return $this->belongsTo(Product::class);
115: return $this->belongsTo(ProductVariant::class, 'product_variant_id');
123: return $this->belongsTo(Supplier::class)->withTrashed();
131: return $this->belongsTo(PurchaseOrder::class);
139: return $this->belongsTo(User::class);
```




<a id="e0497"></a>

> Audit provenance: `additional-contracts.md` lines 1109–1158. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/Supplier/StoreSupplierRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/Supplier/StoreSupplierRequest.php#L1). SHA-256: `e734b3df8c51bfe36f550d2721690e75b8387804f37550ec849d8047974f9f70`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\Supplier;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a new supplier via the REST API. Rules unchanged from
12:  * Api\SupplierController::store.
13:  */
14: final class StoreSupplierRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, array<int, string>>
18:      */
19:     public function rules(): array
20:     {
21:         $organizationId = $this->user()->organization_id;
22: 
23:         return [
24:             'name' => ['required', 'string', 'max:255'],
25:             'code' => ['nullable', 'string', 'max:255', Rule::unique('suppliers', 'code')->where('organization_id', $organizationId)],
26:             'contact_name' => ['nullable', 'string', 'max:255'],
27:             'email' => ['nullable', 'email', 'max:255'],
28:             'phone' => ['nullable', 'string', 'max:255'],
29:             'address' => ['nullable', 'string'],
30:             'city' => ['nullable', 'string', 'max:255'],
31:             'state' => ['nullable', 'string', 'max:255'],
32:             'zip_code' => ['nullable', 'string', 'max:255'],
33:             'country' => ['nullable', 'string', 'max:255'],
34:             'website' => ['nullable', 'url', 'max:255'],
35:             'payment_terms' => ['nullable', 'string', 'max:255'],
36:             'currency' => ['nullable', 'string', 'max:3'],
37:             'notes' => ['nullable', 'string'],
38:             'metadata' => ['nullable', 'array'],
39:             'is_active' => ['nullable', 'boolean'],
40:             'rating' => ['nullable', 'integer', 'between:1,5'],
41:         ];
42:     }
43: }
```



<a id="e0498"></a>

> Audit provenance: `additional-contracts.md` lines 1159–1208. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/Supplier/UpdateSupplierRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/Supplier/UpdateSupplierRequest.php#L1). SHA-256: `5a8bac2a6b15c6235a8494d134de03fdfc19f782599e020211e4b1b7e62dae82`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\Supplier;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a supplier update via the REST API. Rules unchanged from
12:  * Api\SupplierController::update (name is `sometimes`).
13:  */
14: final class UpdateSupplierRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, array<int, string>>
18:      */
19:     public function rules(): array
20:     {
21:         $organizationId = $this->user()->organization_id;
22: 
23:         return [
24:             'name' => ['sometimes', 'string', 'max:255'],
25:             'code' => ['nullable', 'string', 'max:255', Rule::unique('suppliers', 'code')->where('organization_id', $organizationId)->ignore($this->route('supplier'))],
26:             'contact_name' => ['nullable', 'string', 'max:255'],
27:             'email' => ['nullable', 'email', 'max:255'],
28:             'phone' => ['nullable', 'string', 'max:255'],
29:             'address' => ['nullable', 'string'],
30:             'city' => ['nullable', 'string', 'max:255'],
31:             'state' => ['nullable', 'string', 'max:255'],
32:             'zip_code' => ['nullable', 'string', 'max:255'],
33:             'country' => ['nullable', 'string', 'max:255'],
34:             'website' => ['nullable', 'url', 'max:255'],
35:             'payment_terms' => ['nullable', 'string', 'max:255'],
36:             'currency' => ['nullable', 'string', 'max:3'],
37:             'notes' => ['nullable', 'string'],
38:             'metadata' => ['nullable', 'array'],
39:             'is_active' => ['nullable', 'boolean'],
40:             'rating' => ['nullable', 'integer', 'between:1,5'],
41:         ];
42:     }
43: }
```

