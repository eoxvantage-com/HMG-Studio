# 13. Customers — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Customers as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Customer create/edit/list/detail; addresses and contact data; order history; contact invitations and portal relationship.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Customers/Create.vue` | Pending | Pending |
| `resources/js/Pages/Customers/Edit.vue` | Pending | Pending |
| `resources/js/Pages/Customers/Index.vue` | Pending | Pending |
| `resources/js/Pages/Customers/Show.vue` | Pending | Pending |

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

- [ ] Save and reload all editable fields.
- [ ] reject cross-organization identities.
- [ ] contact invitation belongs to the correct customer.
- [ ] customer detail links show only authorized related records.

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

- [resources/js/Pages/Customers/Create.vue](#e0176)
- [resources/js/Pages/Customers/Edit.vue](#e0177)
- [resources/js/Pages/Customers/Index.vue](#e0178)
- [resources/js/Pages/Customers/Show.vue](#e0179)
- [resources/js/Components/CustomerPicker.vue](#e0202)
- [StoreCustomerRequest.php](#e0211)
- [UpdateCustomerRequest.php](#e0212)
- [app/Models/Customer.php](#e0234)
- [app/Models/CustomerContact.php](#e0235)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0176"></a>

> Audit provenance: `commerce.md` lines 137–266. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Customers/Create.vue

Source: [resources/js/Pages/Customers/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L1).


**Named routes referenced:** `customers.index`, `customers.store`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Basic Information (L96)
- h3: Billing Address (L140)
- h3: Shipping Address (L179)
- h3: Business Details (L222)


**UI state/filter defaults:**

```text
46: const sameAsShipping = ref(false);
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.name` | Customer Name * | input / text | HTML required | — | [resources/js/Pages/Customers/Create.vue:101](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L101) |

| `form.code` | Customer Code | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:107](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L107) |

| `form.company_name` | Company Name | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:113](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L113) |

| `form.contact_name` | Contact Person | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:119](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L119) |

| `form.email` | Email | input / email | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:125](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L125) |

| `form.phone` | Phone | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:131](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L131) |

| `form.billing_address` | Street Address | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:145](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L145) |

| `form.billing_city` | City | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:151](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L151) |

| `form.billing_state` | State/Province | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:157](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L157) |

| `form.billing_zip_code` | ZIP/Postal Code | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:163](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L163) |

| `form.billing_country` | Country | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:169](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L169) |

| `sameAsShipping` | Same as billing | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:181](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L181) |

| `form.shipping_address` | Street Address | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Create.vue:189](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L189) |

| `form.shipping_city` | City | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Create.vue:195](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L195) |

| `form.shipping_state` | State/Province | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Create.vue:201](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L201) |

| `form.shipping_zip_code` | ZIP/Postal Code | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Create.vue:207](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L207) |

| `form.shipping_country` | Country | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Create.vue:213](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L213) |

| `form.tax_id` | Tax ID / VAT Number | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:227](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L227) |

| `form.payment_terms` | Payment Terms | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:233](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L233) |

| `form.credit_limit` | Credit Limit | input / number | min=0; step=0.01 | — | [resources/js/Pages/Customers/Create.vue:239](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L239) |

| `form.currency` | Currency | CurrencySelect | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:245](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L245) |

| `form.notes` | Notes | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:251](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L251) |

| `form.is_active` | Active | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Create.vue:257](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L257) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/Customers/Create.vue:20](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L20)

```text
20: const form = useForm({
21:     plugin_fields: props.pluginFields,
22:     name: '',
23:     code: '',
24:     company_name: '',
25:     contact_name: '',
26:     email: '',
27:     phone: '',
28:     billing_address: '',
29:     billing_city: '',
30:     billing_state: '',
31:     billing_zip_code: '',
32:     billing_country: '',
33:     shipping_address: '',
34:     shipping_city: '',
35:     shipping_state: '',
36:     shipping_zip_code: '',
37:     shipping_country: '',
38:     tax_id: '',
39:     payment_terms: '',
40:     credit_limit: '',
41:     currency: organizationCurrency.value,
42:     notes: '',
43:     is_active: true,
44: });
45: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('customers.index')` | [resources/js/Pages/Customers/Create.vue:74](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L74) |

| Customers | `:href=route('customers.index')` | [resources/js/Pages/Customers/Create.vue:76](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L76) |

| Back to Customers | `:href=route('customers.index')` | [resources/js/Pages/Customers/Create.vue:84](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L84) |

| Cancel | `:href=route('customers.index')` | [resources/js/Pages/Customers/Create.vue:269](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L269) |

| Create Customer | `type=submit; :loading=form.processing; :disabled=form.processing` | [resources/js/Pages/Customers/Create.vue:270](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Create.vue#L270) |


**Conditional sections / submit boundaries (source expressions):**

```text
92: <form @submit.prevent="submit" class="mt-6 space-y-4">
```




<a id="e0177"></a>

> Audit provenance: `commerce.md` lines 267–398. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Customers/Edit.vue

Source: [resources/js/Pages/Customers/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L1).


**Named routes referenced:** `customers.index`, `customers.show`, `customers.update`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Basic Information (L112)
- h3: Billing Address (L151)
- h3: Shipping Address (L182)
- h3: Business Details (L216)


**UI state/filter defaults:**

```text
58: const sameAsShipping = ref(addressesMatch.value);
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.name` | Customer Name * | input / text | HTML required | — | [resources/js/Pages/Customers/Edit.vue:117](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L117) |

| `form.code` | Customer Code | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:122](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L122) |

| `form.company_name` | Company Name | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:127](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L127) |

| `form.contact_name` | Contact Person | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:132](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L132) |

| `form.email` | Email | input / email | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:137](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L137) |

| `form.phone` | Phone | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:142](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L142) |

| `form.billing_address` | Street Address | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:156](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L156) |

| `form.billing_city` | City | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:161](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L161) |

| `form.billing_state` | State/Province | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:165](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L165) |

| `form.billing_zip_code` | ZIP/Postal Code | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:169](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L169) |

| `form.billing_country` | Country | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:173](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L173) |

| `sameAsShipping` | Same as billing | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:184](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L184) |

| `form.shipping_address` | Street Address | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Edit.vue:192](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L192) |

| `form.shipping_city` | City | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Edit.vue:196](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L196) |

| `form.shipping_state` | State/Province | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Edit.vue:200](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L200) |

| `form.shipping_zip_code` | ZIP/Postal Code | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Edit.vue:204](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L204) |

| `form.shipping_country` | Country | input / text | :disabled=sameAsShipping | — | [resources/js/Pages/Customers/Edit.vue:208](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L208) |

| `form.tax_id` | Tax ID / VAT Number | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:221](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L221) |

| `form.payment_terms` | Payment Terms | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:225](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L225) |

| `form.credit_limit` | Credit Limit | input / number | min=0; step=0.01 | — | [resources/js/Pages/Customers/Edit.vue:229](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L229) |

| `form.currency` | Currency | CurrencySelect | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:233](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L233) |

| `form.notes` | Notes | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:237](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L237) |

| `form.is_active` | Active | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Edit.vue:241](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L241) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/Customers/Edit.vue:24](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L24)

```text
24: const form = useForm({
25:     plugin_fields: props.pluginFields,
26:     name: props.customer.name,
27:     code: props.customer.code || '',
28:     company_name: props.customer.company_name || '',
29:     contact_name: props.customer.contact_name || '',
30:     email: props.customer.email || '',
31:     phone: props.customer.phone || '',
32:     billing_address: props.customer.billing_address || '',
33:     billing_city: props.customer.billing_city || '',
34:     billing_state: props.customer.billing_state || '',
35:     billing_zip_code: props.customer.billing_zip_code || '',
36:     billing_country: props.customer.billing_country || '',
37:     shipping_address: props.customer.shipping_address || '',
38:     shipping_city: props.customer.shipping_city || '',
39:     shipping_state: props.customer.shipping_state || '',
40:     shipping_zip_code: props.customer.shipping_zip_code || '',
41:     shipping_country: props.customer.shipping_country || '',
42:     tax_id: props.customer.tax_id || '',
43:     payment_terms: props.customer.payment_terms || '',
44:     credit_limit: props.customer.credit_limit || '',
45:     currency: props.customer.currency || organizationCurrency.value,
46:     notes: props.customer.notes || '',
47:     is_active: props.customer.is_active,
48: });
49: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('customers.index')` | [resources/js/Pages/Customers/Edit.vue:86](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L86) |

| Customers | `:href=route('customers.index')` | [resources/js/Pages/Customers/Edit.vue:88](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L88) |

| Back to Customers | `:href=route('customers.index')` | [resources/js/Pages/Customers/Edit.vue:96](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L96) |

| View | `:href=route('customers.show', props.customer.id)` | [resources/js/Pages/Customers/Edit.vue:100](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L100) |

| Cancel | `:href=route('customers.index')` | [resources/js/Pages/Customers/Edit.vue:253](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L253) |

| Update Customer | `type=submit; :loading=form.processing; :disabled=form.processing` | [resources/js/Pages/Customers/Edit.vue:254](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Edit.vue#L254) |


**Conditional sections / submit boundaries (source expressions):**

```text
108: <form @submit.prevent="submit" class="mt-6 space-y-4">
```




<a id="e0178"></a>

> Audit provenance: `commerce.md` lines 399–470. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Customers/Index.vue

Source: [resources/js/Pages/Customers/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L1).


**Named routes referenced:** `customers.create`, `customers.destroy`, `customers.edit`, `customers.index`, `customers.show`.


**Permission/route-capability checks:** `customers.create`, `customers.edit`, `delete_customers`.


**Sections / displayed fields / table columns:**

- th: Name (L103)
- th: Company (L104)
- th: Email (L105)
- th: Phone (L106)
- th: Orders (L107)
- th: Status (L108)
- th: Actions (L109)


**UI state/filter defaults:**

```text
25: const search = ref(props.filters?.search || '');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `search` | Search Customers | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Customers/Index.vue:80](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L80) |


| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Add Customer | `v-if=canVisit('customers.create'); :href=route('customers.create')` | [resources/js/Pages/Customers/Index.vue:65](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L65) |

| Search | `type=submit` | [resources/js/Pages/Customers/Index.vue:81](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L81) |

| Search | `type=submit` | [resources/js/Pages/Customers/Index.vue:89](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L89) |

| Clear | `type=button; @click=clearFilters` | [resources/js/Pages/Customers/Index.vue:93](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L93) |

| Add Customer | `v-if=canVisit('customers.create'); :href=route('customers.create')` | [resources/js/Pages/Customers/Index.vue:119](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L119) |

| Icon action | `:href=route('customers.show', customer.id)` | [resources/js/Pages/Customers/Index.vue:151](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L151) |

| Icon action | `v-if=canVisit('customers.edit'); :href=route('customers.edit', customer.id)` | [resources/js/Pages/Customers/Index.vue:152](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L152) |

| Icon action | `v-if=hasPermission('delete_customers'); @click=deleteCustomer(customer)` | [resources/js/Pages/Customers/Index.vue:153](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Index.vue#L153) |


**Conditional sections / submit boundaries (source expressions):**

```text
65: <Button v-if="canVisit('customers.create')" variant="default" size="sm" as="Link" :href="route('customers.create')">
78: <form class="table-quick-search" @submit.prevent="searchCustomers">
84: <form @submit.prevent="searchCustomers" class="space-y-4">
113: <tr v-if="customers.data.length === 0">
119: <Button v-if="canVisit('customers.create')" variant="default" size="sm" as="Link" :href="route('customers.create')">
129: <div v-if="customer.code" class="text-xs text-text-tertiary">{{ customer.code }}</div>
135: <a v-if="customer.email" :href="`mailto:${customer.email}`" class="text-brand hover:underline">{{ customer.email }}</a>
152: <Link v-if="canVisit('customers.edit')" :href="route('customers.edit', customer.id)" class="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-status-success" :title="t('common.edit')"><Pencil :size="16" /></Link>
153: <button v-if="hasPermission('delete_customers')" @click="deleteCustomer(customer)" class="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-status-danger" :title="t('common.delete')"><Trash2 :size="16" /></button>
161: <div v-if="customers.data.length > 0" class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row table-pagination">
167: <Link v-if="link.url" :href="link.url"
```




<a id="e0179"></a>

> Audit provenance: `commerce.md` lines 471–586. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Customers/Show.vue

Source: [resources/js/Pages/Customers/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L1).


**Named routes referenced:** `customers.contacts.destroy`, `customers.contacts.resend`, `customers.contacts.store`, `customers.destroy`, `customers.edit`, `customers.index`, `orders.show`.


**Permission/route-capability checks:** `customers.edit`, `orders.show`.


**Sections / displayed fields / table columns:**

- h3: Basic Information (L166)
- dt: Customer Name (L170)
- dt: Company Name (L174)
- dt: Contact Person (L178)
- dt: Email (L182)
- dt: Phone (L191)
- h3: Billing Address (L202)
- h3: Shipping Address (L219)
- h3: Recent Orders (L237)
- th: Order Number (L243)
- th: Order Date (L244)
- th: Status (L245)
- th: Total (L246)
- th: Actions (L247)
- h3: Business Details (L293)
- dt: Tax ID / VAT Number (L297)
- dt: Payment Terms (L301)
- dt: Credit Limit (L305)
- dt: Currency (L311)
- dt: Notes (L315)
- h3: Portal access (L327)
- h3: Danger Zone (L432)


**UI state/filter defaults:**

```text
54: const showInvite = ref(false);
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `inviteForm.name` | Name | input / text | HTML required; maxlength=255 | — | [resources/js/Pages/Customers/Show.vue:348](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L348) |

| `inviteForm.email` | Email | input / email | HTML required; maxlength=255 | — | [resources/js/Pages/Customers/Show.vue:360](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L360) |


**Exact `inviteForm` defaults / hydration / hidden payload** — [resources/js/Pages/Customers/Show.vue:55](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L55)

```text
55: const inviteForm = useForm({ name: '', email: '' });
56: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('customers.index')` | [resources/js/Pages/Customers/Show.vue:111](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L111) |

| Customers | `:href=route('customers.index')` | [resources/js/Pages/Customers/Show.vue:113](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L113) |

| Edit | `v-if=canVisit('customers.edit'); :href=route('customers.edit', customer.id)` | [resources/js/Pages/Customers/Show.vue:128](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L128) |

| Back to Customers | `:href=route('customers.index')` | [resources/js/Pages/Customers/Show.vue:132](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L132) |

| order.order_number | `v-if=canVisit('orders.show'); :href=route('orders.show', order.id)` | [resources/js/Pages/Customers/Show.vue:257](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L257) |

| View | `v-if=canVisit('orders.show'); :href=route('orders.show', order.id)` | [resources/js/Pages/Customers/Show.vue:273](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L273) |

| Invite contact | `v-if=portal.enabled && portal.canManageContacts && !showInvite; @click=showInvite = true` | [resources/js/Pages/Customers/Show.vue:330](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L330) |

| Cancel | `@click=cancelInvite` | [resources/js/Pages/Customers/Show.vue:371](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L371) |

| Send invitation | `type=submit; :loading=inviteForm.processing; :disabled=inviteForm.processing` | [resources/js/Pages/Customers/Show.vue:374](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L374) |

| Resend invitation | `v-if=portal.enabled && contact.status !== 'active'; @click=resendInvite(contact)` | [resources/js/Pages/Customers/Show.vue:394](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L394) |

| Revoke access | `v-if=contact.status !== 'revoked'; @click=revokeContact(contact)` | [resources/js/Pages/Customers/Show.vue:403](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L403) |

| Delete Customer | `@click=deleteCustomer` | [resources/js/Pages/Customers/Show.vue:434](C:/Users/proj/Inventoros/resources/js/Pages/Customers/Show.vue#L434) |


**Conditional sections / submit boundaries (source expressions):**

```text
128: <Button v-if="canVisit('customers.edit')" variant="default" size="sm" as="Link" :href="route('customers.edit', customer.id)">
184: <a v-if="customer.email" :href="`mailto:${customer.email}`" class="text-brand hover:underline">
205: <template v-if="customer.billing_address || customer.billing_city">
206: <div v-if="customer.billing_address">{{ customer.billing_address }}</div>
207: <div v-if="customer.billing_city || customer.billing_state || customer.billing_zip_code">
210: <div v-if="customer.billing_country">{{ customer.billing_country }}</div>
222: <template v-if="customer.shipping_address || customer.shipping_city">
223: <div v-if="customer.shipping_address">{{ customer.shipping_address }}</div>
224: <div v-if="customer.shipping_city || customer.shipping_state || customer.shipping_zip_code">
227: <div v-if="customer.shipping_country">{{ customer.shipping_country }}</div>
239: <TableViewport v-if="orders.length > 0" class="w-full overflow-x-auto rounded-lg border border-border-subtle">
257: <Link v-if="canVisit('orders.show')" :href="route('orders.show', order.id)" class="font-medium text-brand hover:underline">
273: <Link v-if="canVisit('orders.show')" :href="route('orders.show', order.id)" class="text-sm text-brand hover:underline">
314: <div v-if="customer.notes" class="border-t border-border-subtle pt-3">
331: v-if="portal.enabled && portal.canManageContacts && !showInvite"
345: <form v-if="showInvite" class="space-y-3 rounded-md border border-border-subtle p-3" @submit.prevent="sendInvite">
381: <ul v-if="contacts.length" class="divide-y divide-border-subtle">
393: <div v-if="portal.canManageContacts" class="mt-1.5 flex flex-wrap gap-1">
395: v-if="portal.enabled && contact.status !== 'active'"
404: v-if="contact.status !== 'revoked'"
418: v-if="portal.enabled && portal.login_url"
```




<a id="e0202"></a>

> Audit provenance: `commerce.md` lines 2843–2885. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Components/CustomerPicker.vue

Source: [resources/js/Components/CustomerPicker.vue:1](C:/Users/proj/Inventoros/resources/js/Components/CustomerPicker.vue#L1).


**Named routes referenced:** `orders.customer-lookup`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**UI state/filter defaults:**

```text
22: const query = ref('');
23: const results = ref([]);
24: const open = ref(false);
25: const loading = ref(false);
26: const highlighted = ref(-1);
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `query` | Saved customer | input / text | No extra control attribute; server rules below | — | [resources/js/Components/CustomerPicker.vue:112](C:/Users/proj/Inventoros/resources/js/Components/CustomerPicker.vue#L112) |


| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Use a one-off customer | `type=button; @click=emit('clear')` | [resources/js/Components/CustomerPicker.vue:101](C:/Users/proj/Inventoros/resources/js/Components/CustomerPicker.vue#L101) |


**Conditional sections / submit boundaries (source expressions):**

```text
94: v-if="props.selected"
128: v-if="open && (results.length || loading || query.trim())"
133: <li v-if="loading && !results.length" class="px-3 py-2 text-sm text-text-tertiary">{{ t('orders.create.searchingCustomers') }}</li>
```




<a id="e0211"></a>

> Audit provenance: `commerce.md` lines 3206–3253. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StoreCustomerRequest.php

[app/Http/Requests/Customer/StoreCustomerRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Customer/StoreCustomerRequest.php#L1)

```php
9: 
10: /**
11:  * Validates a new customer (web surface). Rules unchanged from the previous
12:  * inline validation in CustomerController::store.
13:  */
14: final class StoreCustomerRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, array<int, string>>
18:      */
19:     public function rules(): array
20:     {
21:         $organizationId = $this->user()->organization_id;
22: 
23:         return apply_filters('customer_store_validation_rules', [
24:             'name' => ['required', 'string', 'max:255'],
25:             'code' => ['nullable', 'string', 'max:255', Rule::unique('customers', 'code')->where('organization_id', $organizationId)],
26:             'company_name' => ['nullable', 'string', 'max:255'],
27:             'contact_name' => ['nullable', 'string', 'max:255'],
28:             'email' => ['nullable', 'email', 'max:255'],
29:             'phone' => ['nullable', 'string', 'max:255'],
30:             'billing_address' => ['nullable', 'string'],
31:             'billing_city' => ['nullable', 'string', 'max:255'],
32:             'billing_state' => ['nullable', 'string', 'max:255'],
33:             'billing_zip_code' => ['nullable', 'string', 'max:255'],
34:             'billing_country' => ['nullable', 'string', 'max:255'],
35:             'shipping_address' => ['nullable', 'string'],
36:             'shipping_city' => ['nullable', 'string', 'max:255'],
37:             'shipping_state' => ['nullable', 'string', 'max:255'],
38:             'shipping_zip_code' => ['nullable', 'string', 'max:255'],
39:             'shipping_country' => ['nullable', 'string', 'max:255'],
40:             'tax_id' => ['nullable', 'string', 'max:255'],
41:             'payment_terms' => ['nullable', 'string', 'max:255'],
42:             'credit_limit' => ['nullable', 'numeric', 'min:0'],
43:             'currency' => ['nullable', 'string', 'max:3'],
44:             'notes' => ['nullable', 'string'],
45:             'is_active' => ['nullable', 'boolean'],
46:         ], $this);
47:     }
48: }
```




<a id="e0212"></a>

> Audit provenance: `commerce.md` lines 3254–3301. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### UpdateCustomerRequest.php

[app/Http/Requests/Customer/UpdateCustomerRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Customer/UpdateCustomerRequest.php#L1)

```php
9: 
10: /**
11:  * Validates a customer edit (web surface). Rules unchanged from the previous
12:  * inline validation in CustomerController::update (name is `sometimes`).
13:  */
14: final class UpdateCustomerRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, array<int, string>>
18:      */
19:     public function rules(): array
20:     {
21:         $organizationId = $this->user()->organization_id;
22: 
23:         return apply_filters('customer_update_validation_rules', [
24:             'name' => ['sometimes', 'string', 'max:255'],
25:             'code' => ['nullable', 'string', 'max:255', Rule::unique('customers', 'code')->where('organization_id', $organizationId)->ignore($this->route('customer'))],
26:             'company_name' => ['nullable', 'string', 'max:255'],
27:             'contact_name' => ['nullable', 'string', 'max:255'],
28:             'email' => ['nullable', 'email', 'max:255'],
29:             'phone' => ['nullable', 'string', 'max:255'],
30:             'billing_address' => ['nullable', 'string'],
31:             'billing_city' => ['nullable', 'string', 'max:255'],
32:             'billing_state' => ['nullable', 'string', 'max:255'],
33:             'billing_zip_code' => ['nullable', 'string', 'max:255'],
34:             'billing_country' => ['nullable', 'string', 'max:255'],
35:             'shipping_address' => ['nullable', 'string'],
36:             'shipping_city' => ['nullable', 'string', 'max:255'],
37:             'shipping_state' => ['nullable', 'string', 'max:255'],
38:             'shipping_zip_code' => ['nullable', 'string', 'max:255'],
39:             'shipping_country' => ['nullable', 'string', 'max:255'],
40:             'tax_id' => ['nullable', 'string', 'max:255'],
41:             'payment_terms' => ['nullable', 'string', 'max:255'],
42:             'credit_limit' => ['nullable', 'numeric', 'min:0'],
43:             'currency' => ['nullable', 'string', 'max:3'],
44:             'notes' => ['nullable', 'string'],
45:             'is_active' => ['nullable', 'boolean'],
46:         ], $this->route('customer'), $this);
47:     }
48: }
```




<a id="e0234"></a>

> Audit provenance: `commerce.md` lines 4323–4367. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Customer.php

[app/Models/Customer.php:1](C:/Users/proj/Inventoros/app/Models/Customer.php#L1)


```php
protected $fillable = [
        'organization_id',
        'name',
        'code',
        'company_name',
        'contact_name',
        'email',
        'phone',
        'billing_address',
        'billing_city',
        'billing_state',
        'billing_zip_code',
        'billing_country',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_zip_code',
        'shipping_country',
        'tax_id',
        'payment_terms',
        'credit_limit',
        'currency',
        'notes',
        'metadata',
        'is_active',
    ];
```


```php
17: use Illuminate\Database\Eloquent\SoftDeletes;
59: use BelongsToOrganization, HasFactory, LogsActivity, SoftDeletes;
103: 'credit_limit' => 'decimal:2',
125: return $this->belongsTo(Organization::class);
135: return $this->hasMany(Order::class);
146: return $this->hasMany(CustomerContact::class)
```




<a id="e0235"></a>

> Audit provenance: `commerce.md` lines 4368–4395. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/CustomerContact.php

[app/Models/CustomerContact.php:1](C:/Users/proj/Inventoros/app/Models/CustomerContact.php#L1)


```php
protected $fillable = [
        'organization_id',
        'customer_id',
        'name',
        'email',
        'password',
        'invited_at',
        'invited_by',
        'activated_at',
        'last_login_at',
        'revoked_at',
    ];
```


```php
94: return $this->belongsTo(Organization::class);
106: return $this->belongsTo(Customer::class)->withoutGlobalScope(OrganizationScope::class);
114: return $this->belongsTo(User::class, 'invited_by');
```


