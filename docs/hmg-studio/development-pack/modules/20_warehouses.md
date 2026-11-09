# 20. Warehouses — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Warehouses as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Create/edit/list/detail; contacts/address/timezone/currency/priority/capacity/default/active; assigned users; linked locations and balances.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Warehouses/Create.vue` | Pending | Pending |
| `resources/js/Pages/Warehouses/Edit.vue` | Pending | Pending |
| `resources/js/Pages/Warehouses/Index.vue` | Pending | Pending |
| `resources/js/Pages/Warehouses/Show.vue` | Pending | Pending |

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

- [ ] Save/readback all fields.
- [ ] enforce default and assigned-user rules from source.
- [ ] source/destination warehouse access is distinct.
- [ ] switching warehouse updates scoped views without granting new authority.

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

- [Warehouses/Create](#e0042)
- [Warehouses/Edit](#e0043)
- [Warehouses/Index](#e0044)
- [Warehouses/Show](#e0045)
- [Warehouse/StoreWarehouseRequest.php](#e0073)
- [Warehouse/UpdateWarehouseRequest.php](#e0074)
- [WarehouseController.php — 69-83](#e0087)
- [WarehouseController.php — 294-354](#e0088)
- [Warehouse](#e0116)
- [2026_04_04_024204_create_warehouses_table.php](#e0135)
- [2026_09_28_000004_add_capacity_to_warehouses_and_locations.php](#e0146)
- [`resources/js/Components/WarehouseSwitcher.vue`](#e0296)
- [`app/Http/Requests/Api/Warehouse/StoreWarehouseRequest.php`](#e0499)
- [`app/Http/Requests/Api/Warehouse/UpdateWarehouseRequest.php`](#e0500)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0042"></a>

> Audit provenance: `inventory.md` lines 1802–1877. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Warehouses/Create

GET /warehouses/create; create_warehouses. General/address/contact/settings sections; payload includes all displayed fields in table below. Country default server defaults or Canada; timezone server defaults or America/Toronto; currency server default or organization currency; priority 0/capacity null/is_active true. UI requires code but server permits blank and may generate it—preserve distinction.

Source: [resources/js/Pages/Warehouses/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Warehouses/Create.vue:21
const form = useForm({
    name: '',
    code: '',
    description: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    province: '',
    postal_code: '',
    country: props.defaults.country || 'Canada',
    phone: '',
    email: '',
    manager_name: '',
    timezone: props.defaults.timezone || 'America/Toronto',
    currency: props.defaults.currency || organizationCurrency.value,
    priority: 0,
    capacity: null,
    is_active: true,
});
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.name — [resources/js/Pages/Warehouses/Create.vue:96](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L96) | Warehouse Name | text; '' | ; v-model="form.name"; type="text"; required; autofocus; :placeholder="t('warehouses.placeholders.name')" | Always within this view/dialog; see component visibility |
| form.code — [resources/js/Pages/Warehouses/Create.vue:110](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L110) | Warehouse Code | text; '' | ; v-model="form.code"; type="text"; required; :placeholder="t('warehouses.placeholders.code')" | Always within this view/dialog; see component visibility |
| form.description — [resources/js/Pages/Warehouses/Create.vue:123](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L123) | Description | textarea; '' | ; v-model="form.description"; rows="3"; :placeholder="t('warehouses.placeholders.description')" | Always within this view/dialog; see component visibility |
| form.address_line_1 — [resources/js/Pages/Warehouses/Create.vue:143](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L143) | Address Line 1 | text; '' | ; v-model="form.address_line_1"; type="text"; :placeholder="t('warehouses.placeholders.addressLine1')" | Always within this view/dialog; see component visibility |
| form.address_line_2 — [resources/js/Pages/Warehouses/Create.vue:155](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L155) | Address Line 2 | text; '' | ; v-model="form.address_line_2"; type="text"; :placeholder="t('warehouses.placeholders.addressLine2')" | Always within this view/dialog; see component visibility |
| form.city — [resources/js/Pages/Warehouses/Create.vue:167](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L167) | City | text; '' | ; v-model="form.city"; type="text" | Always within this view/dialog; see component visibility |
| form.province — [resources/js/Pages/Warehouses/Create.vue:178](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L178) | Province / State | text; '' | ; v-model="form.province"; type="text" | Always within this view/dialog; see component visibility |
| form.postal_code — [resources/js/Pages/Warehouses/Create.vue:189](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L189) | Postal Code | text; '' | ; v-model="form.postal_code"; type="text"; :placeholder="t('warehouses.placeholders.postalCode')" | Always within this view/dialog; see component visibility |
| form.country — [resources/js/Pages/Warehouses/Create.vue:201](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L201) | Country | text; props.defaults.country \|\| 'Canada' | ; v-model="form.country"; type="text" | Always within this view/dialog; see component visibility |
| form.phone — [resources/js/Pages/Warehouses/Create.vue:220](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L220) | Phone | text; '' | ; v-model="form.phone"; type="text" | Always within this view/dialog; see component visibility |
| form.email — [resources/js/Pages/Warehouses/Create.vue:231](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L231) | Email | email; '' | ; v-model="form.email"; type="email" | Always within this view/dialog; see component visibility |
| form.manager_name — [resources/js/Pages/Warehouses/Create.vue:242](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L242) | Manager Name | text; '' | ; v-model="form.manager_name"; type="text" | Always within this view/dialog; see component visibility |
| form.timezone — [resources/js/Pages/Warehouses/Create.vue:261](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L261) | Timezone | select; props.defaults.timezone \|\| 'America/Toronto' | ; v-model="form.timezone" | Always within this view/dialog; see component visibility |
| form.currency — [resources/js/Pages/Warehouses/Create.vue:275](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L275) | Currency | CurrencySelect; props.defaults.currency \|\| organizationCurrency.value | ; v-model="form.currency" | Always within this view/dialog; see component visibility |
| form.priority — [resources/js/Pages/Warehouses/Create.vue:285](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L285) | Priority | number; 0 | ; v-model="form.priority"; type="number"; min="0"; placeholder="0" | Always within this view/dialog; see component visibility |
| form.capacity — [resources/js/Pages/Warehouses/Create.vue:299](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L299) | Capacity (units) | number; null | ; v-model.number="form.capacity"; type="number"; min="0" | Always within this view/dialog; see component visibility |
| form.is_active — [resources/js/Pages/Warehouses/Create.vue:306](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L306) | Active | checkbox; true | type="checkbox"; v-model="form.is_active" | Always within this view/dialog; see component visibility |

**Select options and labels (exact source, including remote lists):**

- form.timezone ([resources/js/Pages/Warehouses/Create.vue:261](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L261)): `&lt;option v-for="tz in timezones" :key="tz.value" :value="tz.value"&gt; {{ tz.label }} &lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: General — [resources/js/Pages/Warehouses/Create.vue:91](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L91)
- h3: Address — [resources/js/Pages/Warehouses/Create.vue:138](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L138)
- h3: Contact — [resources/js/Pages/Warehouses/Create.vue:215](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L215)
- h3: Settings — [resources/js/Pages/Warehouses/Create.vue:256](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L256)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/Warehouses/Create.vue:71](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L71) | :href="route('warehouses.index')" | No ancestor condition |
| Warehouses — [resources/js/Pages/Warehouses/Create.vue:73](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L73) | :href="route('warehouses.index')" | No ancestor condition |
| Back to Warehouses — [resources/js/Pages/Warehouses/Create.vue:81](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L81) | variant="secondary"; size="sm"; as="Link"; :href="route('warehouses.index')" | No ancestor condition |
| Cancel — [resources/js/Pages/Warehouses/Create.vue:320](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L320) | variant="secondary"; as="Link"; :href="route('warehouses.index')" | No ancestor condition |
| Create Warehouse — [resources/js/Pages/Warehouses/Create.vue:321](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L321) | type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing" | No ancestor condition |

**Script endpoint names:** `warehouses.store`. Match these to verb/path/permission in the route annex.



<a id="e0043"></a>

> Audit provenance: `inventory.md` lines 1878–1963. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Warehouses/Edit

GET /warehouses/{warehouse}/edit; edit_warehouses OR manage_warehouse_users. Metadata form renders only edit_warehouses; separate users form only manage_warehouse_users. User search filters name/email locally; checkbox array user_ids default assigned IDs; All warehouses badge for unrestricted user. Saving assignments is independent POST, metadata PUT.

Source: [resources/js/Pages/Warehouses/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Warehouses/Edit.vue:26
const form = useForm({
    name: props.warehouse.name || '',
    code: props.warehouse.code || '',
    description: props.warehouse.description || '',
    address_line_1: props.warehouse.address_line_1 || '',
    address_line_2: props.warehouse.address_line_2 || '',
    city: props.warehouse.city || '',
    province: props.warehouse.province || '',
    postal_code: props.warehouse.postal_code || '',
    country: props.warehouse.country || 'Canada',
    phone: props.warehouse.phone || '',
    email: props.warehouse.email || '',
    manager_name: props.warehouse.manager_name || '',
    timezone: props.warehouse.timezone || 'America/Toronto',
    currency: props.warehouse.currency || organizationCurrency.value,
    priority: props.warehouse.priority ?? 0,
    capacity: props.warehouse.capacity ?? null,
    is_active: props.warehouse.is_active ?? true,
});
// resources/js/Pages/Warehouses/Edit.vue:48
const usersForm = useForm({
    user_ids: [...props.assignedUserIds],
});
// resources/js/Pages/Warehouses/Edit.vue:62
const userSearch = ref('');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| form.name — [resources/js/Pages/Warehouses/Edit.vue:130](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L130) | Warehouse Name | text; props.warehouse.name \|\| '' | ; v-model="form.name"; type="text"; required; :placeholder="t('warehouses.placeholders.name')" | v-if="hasPermission('edit_warehouses')" |
| form.code — [resources/js/Pages/Warehouses/Edit.vue:136](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L136) | Warehouse Code | text; props.warehouse.code \|\| '' | ; v-model="form.code"; type="text"; required; :placeholder="t('warehouses.placeholders.code')" | v-if="hasPermission('edit_warehouses')" |
| form.description — [resources/js/Pages/Warehouses/Edit.vue:142](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L142) | Description | textarea; props.warehouse.description \|\| '' | ; v-model="form.description"; rows="3"; :placeholder="t('warehouses.placeholders.description')" | v-if="hasPermission('edit_warehouses')" |
| form.address_line_1 — [resources/js/Pages/Warehouses/Edit.vue:156](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L156) | Address Line 1 | text; props.warehouse.address_line_1 \|\| '' | ; v-model="form.address_line_1"; type="text"; :placeholder="t('warehouses.placeholders.addressLine1')" | v-if="hasPermission('edit_warehouses')" |
| form.address_line_2 — [resources/js/Pages/Warehouses/Edit.vue:162](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L162) | Address Line 2 | text; props.warehouse.address_line_2 \|\| '' | ; v-model="form.address_line_2"; type="text"; :placeholder="t('warehouses.placeholders.addressLine2')" | v-if="hasPermission('edit_warehouses')" |
| form.city — [resources/js/Pages/Warehouses/Edit.vue:168](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L168) | City | text; props.warehouse.city \|\| '' | ; v-model="form.city"; type="text" | v-if="hasPermission('edit_warehouses')" |
| form.province — [resources/js/Pages/Warehouses/Edit.vue:174](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L174) | Province / State | text; props.warehouse.province \|\| '' | ; v-model="form.province"; type="text" | v-if="hasPermission('edit_warehouses')" |
| form.postal_code — [resources/js/Pages/Warehouses/Edit.vue:180](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L180) | Postal Code | text; props.warehouse.postal_code \|\| '' | ; v-model="form.postal_code"; type="text"; :placeholder="t('warehouses.placeholders.postalCode')" | v-if="hasPermission('edit_warehouses')" |
| form.country — [resources/js/Pages/Warehouses/Edit.vue:186](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L186) | Country | text; props.warehouse.country \|\| 'Canada' | ; v-model="form.country"; type="text" | v-if="hasPermission('edit_warehouses')" |
| form.phone — [resources/js/Pages/Warehouses/Edit.vue:200](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L200) | Phone | text; props.warehouse.phone \|\| '' | ; v-model="form.phone"; type="text" | v-if="hasPermission('edit_warehouses')" |
| form.email — [resources/js/Pages/Warehouses/Edit.vue:206](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L206) | Email | email; props.warehouse.email \|\| '' | ; v-model="form.email"; type="email" | v-if="hasPermission('edit_warehouses')" |
| form.manager_name — [resources/js/Pages/Warehouses/Edit.vue:212](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L212) | Manager Name | text; props.warehouse.manager_name \|\| '' | ; v-model="form.manager_name"; type="text" | v-if="hasPermission('edit_warehouses')" |
| form.timezone — [resources/js/Pages/Warehouses/Edit.vue:226](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L226) | Timezone | select; props.warehouse.timezone \|\| 'America/Toronto' | ; v-model="form.timezone" | v-if="hasPermission('edit_warehouses')" |
| form.currency — [resources/js/Pages/Warehouses/Edit.vue:236](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L236) | Currency | CurrencySelect; props.warehouse.currency \|\| organizationCurrency.value | ; v-model="form.currency" | v-if="hasPermission('edit_warehouses')" |
| form.priority — [resources/js/Pages/Warehouses/Edit.vue:242](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L242) | Priority | number; props.warehouse.priority ?? 0 | ; v-model="form.priority"; type="number"; min="0"; placeholder="0" | v-if="hasPermission('edit_warehouses')" |
| form.capacity — [resources/js/Pages/Warehouses/Edit.vue:249](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L249) | Capacity (units) | number; props.warehouse.capacity ?? null | ; v-model.number="form.capacity"; type="number"; min="0" | v-if="hasPermission('edit_warehouses')" |
| form.is_active — [resources/js/Pages/Warehouses/Edit.vue:256](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L256) | Active | checkbox; props.warehouse.is_active ?? true | type="checkbox"; v-model="form.is_active" | v-if="hasPermission('edit_warehouses')" |
| userSearch — [resources/js/Pages/Warehouses/Edit.vue:287](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L287) | No explicit label / see context | text; '' | v-model="userSearch"; type="text"; :placeholder="t('warehouses.users.searchPlaceholder')" | v-if="hasPermission('manage_warehouse_users')" |
| (unbound) — [resources/js/Pages/Warehouses/Edit.vue:302](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L302) | user.name user.email All warehouses | checkbox; See :value / :checked and event handler; not a v-model field | type="checkbox"; :checked="usersForm.user_ids.includes(user.id)"; @change="toggleUser(user.id)" | v-if="hasPermission('manage_warehouse_users')" → v-for="user in filteredUsers" |

**Select options and labels (exact source, including remote lists):**

- form.timezone ([resources/js/Pages/Warehouses/Edit.vue:226](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L226)): `&lt;option v-for="tz in timezones" :key="tz.value" :value="tz.value"&gt; {{ tz.label }} &lt;/option&gt;`

**Read fields, columns and section headings:**

- h3: General — [resources/js/Pages/Warehouses/Edit.vue:125](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L125) — v-if="hasPermission('edit_warehouses')"
- h3: Address — [resources/js/Pages/Warehouses/Edit.vue:151](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L151) — v-if="hasPermission('edit_warehouses')"
- h3: Contact — [resources/js/Pages/Warehouses/Edit.vue:195](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L195) — v-if="hasPermission('edit_warehouses')"
- h3: Settings — [resources/js/Pages/Warehouses/Edit.vue:221](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L221) — v-if="hasPermission('edit_warehouses')"
- h3: User access — [resources/js/Pages/Warehouses/Edit.vue:282](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L282) — v-if="hasPermission('manage_warehouse_users')"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/Warehouses/Edit.vue:105](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L105) | :href="route('warehouses.index')" | No ancestor condition |
| Warehouses — [resources/js/Pages/Warehouses/Edit.vue:107](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L107) | :href="route('warehouses.index')" | No ancestor condition |
| Back to Warehouses — [resources/js/Pages/Warehouses/Edit.vue:115](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L115) | variant="secondary"; size="sm"; as="Link"; :href="route('warehouses.index')" | No ancestor condition |
| Cancel — [resources/js/Pages/Warehouses/Edit.vue:270](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L270) | variant="secondary"; as="Link"; :href="route('warehouses.index')" | v-if="hasPermission('edit_warehouses')" |
| Update Warehouse — [resources/js/Pages/Warehouses/Edit.vue:273](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L273) | type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing" | v-if="hasPermission('edit_warehouses')" |
| Save user access — [resources/js/Pages/Warehouses/Edit.vue:324](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L324) | type="submit"; variant="default"; size="sm"; :loading="usersForm.processing"; :disabled="usersForm.processing" | v-if="hasPermission('manage_warehouse_users')" |

**Script endpoint names:** `warehouses.update`, `warehouses.users.update`. Match these to verb/path/permission in the route annex.



<a id="e0044"></a>

> Audit provenance: `inventory.md` lines 1964–2007. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Warehouses/Index

GET /warehouses; view_warehouses. Search; table name/code/city-province/location count/status/default/actions. Permission-specific create/view/edit/set-default/delete. Organization access-policy checkbox restrict_to_assigned posts immediately and is bound to existing server prop. Verify backend denies unauthorized policy updates even if control visible.

Source: [resources/js/Pages/Warehouses/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Pages/Warehouses/Index.vue:33
const search = ref(props.filters?.search || '');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| search — [resources/js/Pages/Warehouses/Index.vue:89](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L89) | Search Warehouses | text; props.filters?.search \|\| '' | ; v-model="search"; type="text"; :placeholder="t('warehouses.searchPlaceholder')" | Always within this view/dialog; see component visibility |
| (unbound) — [resources/js/Pages/Warehouses/Index.vue:94](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L94) | Restrict users to their assigned warehouses Users assigned to warehouses only see and move stock in those warehouses. Turn this on to also hide all warehouse stock from users with no assignment. Admins and roles with Access All Warehouses are never restricted. | checkbox; See :value / :checked and event handler; not a v-model field | type="checkbox"; :checked="restrictToAssigned"; @change="updateAccessPolicy" | Always within this view/dialog; see component visibility |

**Read fields, columns and section headings:**

- th: Name — [resources/js/Pages/Warehouses/Index.vue:107](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L107)
- th: Code — [resources/js/Pages/Warehouses/Index.vue:108](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L108)
- th: City / Province — [resources/js/Pages/Warehouses/Index.vue:109](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L109)
- th: Locations — [resources/js/Pages/Warehouses/Index.vue:110](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L110)
- th: Status — [resources/js/Pages/Warehouses/Index.vue:111](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L111)
- th: Default — [resources/js/Pages/Warehouses/Index.vue:112](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L112)
- th: Actions — [resources/js/Pages/Warehouses/Index.vue:113](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L113)

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Add Warehouse — [resources/js/Pages/Warehouses/Index.vue:74](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L74) | v-if="hasPermission('create_warehouses')"; variant="default"; size="sm"; as="Link"; :href="route('warehouses.create')" | No ancestor condition |
| Add Warehouse — [resources/js/Pages/Warehouses/Index.vue:123](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L123) | v-if="hasPermission('create_warehouses')"; variant="default"; size="sm"; as="Link"; :href="route('warehouses.create')" | v-if="warehouses.data.length === 0" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Warehouses/Index.vue:159](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L159) | :href="route('warehouses.show', warehouse.id)"; :title="t('common.view')" | v-for="warehouse in warehouses.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Warehouses/Index.vue:160](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L160) | v-if="hasPermission('edit_warehouses')"; :href="route('warehouses.edit', warehouse.id)"; :title="t('common.edit')" | v-for="warehouse in warehouses.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Warehouses/Index.vue:161](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L161) | v-if="hasPermission('edit_warehouses') && !warehouse.is_default"; type="button"; @click="makeDefault(warehouse)"; :title="t('warehouses.default.makeDefault')"; :aria-label="t('warehouses.default.makeDefault')" | v-for="warehouse in warehouses.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Warehouses/Index.vue:171](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L171) | v-if="hasPermission('delete_warehouses')"; @click="deleteWarehouse(warehouse)"; :title="t('common.delete')"; :disabled="warehouse.is_default" | v-for="warehouse in warehouses.data" |
| (icon-only; accessible label/title in attributes) — [resources/js/Pages/Warehouses/Index.vue:194](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L194) | v-if="link.url"; :href="link.url"; v-html="link.label" | v-if="warehouses.data.length &gt; 0" → v-for="link in warehouses.links" |

**Script endpoint names:** `warehouses.access-policy`, `warehouses.index`, `warehouses.set-default`, `warehouses.destroy`. Match these to verb/path/permission in the route annex.



<a id="e0045"></a>

> Audit provenance: `inventory.md` lines 2008–2053. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Warehouses/Show

GET /warehouses/{warehouse}; view_warehouses. Stats locations/on-hand/users/capacity, details/address, locations table name/code/products/on_hand/capacity and assigned user list. Make-default, edit, delete conditions/confirmation; no text inputs.

Source: [resources/js/Pages/Warehouses/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L1).

**Input fields:** none in this page/component template.


**Read fields, columns and section headings:**

- h3: Warehouse Details — [resources/js/Pages/Warehouses/Show.vue:124](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L124)
- dt: Manager — [resources/js/Pages/Warehouses/Show.vue:128](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L128)
- dt: Email — [resources/js/Pages/Warehouses/Show.vue:132](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L132)
- dt: Phone — [resources/js/Pages/Warehouses/Show.vue:141](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L141)
- dt: Timezone — [resources/js/Pages/Warehouses/Show.vue:145](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L145)
- dt: Currency — [resources/js/Pages/Warehouses/Show.vue:149](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L149)
- dt: Priority — [resources/js/Pages/Warehouses/Show.vue:153](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L153)
- dt: Description — [resources/js/Pages/Warehouses/Show.vue:157](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L157) — v-if="warehouse.description"
- h3: Address — [resources/js/Pages/Warehouses/Show.vue:166](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L166)
- h3: Locations ({count}) — [resources/js/Pages/Warehouses/Show.vue:186](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L186)
- th: Name — [resources/js/Pages/Warehouses/Show.vue:192](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L192) — v-if="locations && locations.length &gt; 0"
- th: Code — [resources/js/Pages/Warehouses/Show.vue:193](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L193) — v-if="locations && locations.length &gt; 0"
- th: Products — [resources/js/Pages/Warehouses/Show.vue:194](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L194) — v-if="locations && locations.length &gt; 0"
- th: On hand — [resources/js/Pages/Warehouses/Show.vue:195](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L195) — v-if="locations && locations.length &gt; 0"
- th: Capacity — [resources/js/Pages/Warehouses/Show.vue:196](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L196) — v-if="locations && locations.length &gt; 0"
- h3: Assigned users ({count}) — [resources/js/Pages/Warehouses/Show.vue:242](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L242)
- h3: Actions — [resources/js/Pages/Warehouses/Show.vue:276](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L276) — v-if="hasPermission('edit_warehouses') \|\| (hasPermission('delete_warehouses') && !warehouse.is_default)"
- h3: Danger Zone — [resources/js/Pages/Warehouses/Show.vue:300](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L300) — v-if="hasPermission('delete_warehouses') && !warehouse.is_default"

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| Workspace — [resources/js/Pages/Warehouses/Show.vue:47](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L47) | :href="route('warehouses.index')" | No ancestor condition |
| Warehouses — [resources/js/Pages/Warehouses/Show.vue:49](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L49) | :href="route('warehouses.index')" | No ancestor condition |
| Edit — [resources/js/Pages/Warehouses/Show.vue:64](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L64) | v-if="hasPermission('edit_warehouses')"; variant="default"; size="sm"; as="Link"; :href="route('warehouses.edit', warehouse.id)" | No ancestor condition |
| Back — [resources/js/Pages/Warehouses/Show.vue:74](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L74) | variant="secondary"; size="sm"; as="Link"; :href="route('warehouses.index')" | No ancestor condition |
| warehouse.email — [resources/js/Pages/Warehouses/Show.vue:134](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L134) | v-if="warehouse.email"; :href="`mailto:${warehouse.email}`" | No ancestor condition |
| Manage user access — [resources/js/Pages/Warehouses/Show.vue:260](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L260) | v-if="hasPermission('manage_warehouse_users')"; variant="secondary"; size="sm"; as="Link"; :href="`${route('warehouses.edit', warehouse.id)}#user-access`" | No ancestor condition |
| Edit Warehouse — [resources/js/Pages/Warehouses/Show.vue:278](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L278) | v-if="hasPermission('edit_warehouses')"; variant="default"; as="Link"; :href="route('warehouses.edit', warehouse.id)" | v-if="hasPermission('edit_warehouses') \|\| (hasPermission('delete_warehouses') && !warehouse.is_default)" |
| Make default — [resources/js/Pages/Warehouses/Show.vue:289](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L289) | variant="secondary"; @click="makeDefault" | v-if="hasPermission('edit_warehouses') \|\| (hasPermission('delete_warehouses') && !warehouse.is_default)" → v-if="hasPermission('edit_warehouses') && !warehouse.is_default" |
| Delete Warehouse — [resources/js/Pages/Warehouses/Show.vue:302](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L302) | variant="danger"; @click="deleteWarehouse" | v-if="hasPermission('delete_warehouses') && !warehouse.is_default" |

**Script endpoint names:** `warehouses.set-default`, `warehouses.destroy`. Match these to verb/path/permission in the route annex.



<a id="e0073"></a>

> Audit provenance: `inventory.md` lines 3240–3295. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Warehouse/StoreWarehouseRequest.php

Source [app/Http/Requests/Warehouse/StoreWarehouseRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Warehouse/StoreWarehouseRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Warehouse;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a new warehouse (web surface). Rules unchanged from the previous
12:  * WarehouseController::validationRules() used by store.
13:  */
14: final class StoreWarehouseRequest extends FormRequest
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
25:             'code' => [
26:                 'nullable',
27:                 'string',
28:                 'max:50',
29:                 Rule::unique('warehouses', 'code')->where('organization_id', $organizationId),
30:             ],
31:             'description' => ['nullable', 'string', 'max:1000'],
32:             'address_line_1' => ['nullable', 'string', 'max:255'],
33:             'address_line_2' => ['nullable', 'string', 'max:255'],
34:             'city' => ['nullable', 'string', 'max:255'],
35:             'province' => ['nullable', 'string', 'max:255'],
36:             'postal_code' => ['nullable', 'string', 'max:255'],
37:             'country' => ['nullable', 'string', 'max:255'],
38:             'phone' => ['nullable', 'string', 'max:30'],
39:             'email' => ['nullable', 'email', 'max:255'],
40:             'manager_name' => ['nullable', 'string', 'max:255'],
41:             'timezone' => ['nullable', 'string', 'max:50'],
42:             'currency' => ['nullable', 'string', 'max:3'],
43:             'is_active' => ['boolean'],
44:             'priority' => ['nullable', 'integer', 'min:0'],
45:             'capacity' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
46:         ];
47:     }
48: }
49: 
```



<a id="e0074"></a>

> Audit provenance: `inventory.md` lines 3296–3357. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Warehouse/UpdateWarehouseRequest.php

Source [app/Http/Requests/Warehouse/UpdateWarehouseRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Warehouse/UpdateWarehouseRequest.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Warehouse;
6: 
7: use App\Models\Warehouse;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates a warehouse edit (web surface). Rules unchanged from the previous
13:  * WarehouseController::validationRules($organizationId, $warehouse->id) used by
14:  * update — the unique-code rule ignores the bound warehouse.
15:  */
16: final class UpdateWarehouseRequest extends FormRequest
17: {
18:     /**
19:      * @return array<string, mixed>
20:      */
21:     public function rules(): array
22:     {
23:         $organizationId = $this->user()->organization_id;
24:         /** @var Warehouse $warehouse */
25:         $warehouse = $this->route('warehouse');
26: 
27:         return [
28:             'name' => ['required', 'string', 'max:255'],
29:             'code' => [
30:                 'nullable',
31:                 'string',
32:                 'max:50',
33:                 Rule::unique('warehouses', 'code')
34:                     ->where('organization_id', $organizationId)
35:                     ->ignore($warehouse->id),
36:             ],
37:             'description' => ['nullable', 'string', 'max:1000'],
38:             'address_line_1' => ['nullable', 'string', 'max:255'],
39:             'address_line_2' => ['nullable', 'string', 'max:255'],
40:             'city' => ['nullable', 'string', 'max:255'],
41:             'province' => ['nullable', 'string', 'max:255'],
42:             'postal_code' => ['nullable', 'string', 'max:255'],
43:             'country' => ['nullable', 'string', 'max:255'],
44:             'phone' => ['nullable', 'string', 'max:30'],
45:             'email' => ['nullable', 'email', 'max:255'],
46:             'manager_name' => ['nullable', 'string', 'max:255'],
47:             'timezone' => ['nullable', 'string', 'max:50'],
48:             'currency' => ['nullable', 'string', 'max:3'],
49:             'is_active' => ['boolean'],
50:             'priority' => ['nullable', 'integer', 'min:0'],
51:             'capacity' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
52:         ];
53:     }
54: }
55: 
```



<a id="e0087"></a>

> Audit provenance: `inventory.md` lines 4247–4268. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### WarehouseController.php — 69-83

Source [app/Http/Controllers/WarehouseController.php:69](C:/Users/proj/Inventoros/app/Http/Controllers/WarehouseController.php#L69)

```php
69:     public function updateAccessPolicy(Request $request)
70:     {
71:         $validated = $request->validate([
72:             'restrict_to_assigned' => ['required', 'boolean'],
73:         ]);
74: 
75:         $this->warehouseAccess->setOrganizationRestrictsToAssigned(
76:             (int) $request->user()->organization_id,
77:             (bool) $validated['restrict_to_assigned'],
78:         );
79: 
80:         return redirect()->back()->with('success', __('Warehouse access policy updated.'));
81:     }
82: 
83:     /**
```



<a id="e0088"></a>

> Audit provenance: `inventory.md` lines 4269–4336. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### WarehouseController.php — 294-354

Source [app/Http/Controllers/WarehouseController.php:294](C:/Users/proj/Inventoros/app/Http/Controllers/WarehouseController.php#L294)

```php
294:     public function updateUsers(Request $request, Warehouse $warehouse)
295:     {
296:         if ($warehouse->organization_id !== $request->user()->organization_id) {
297:             abort(403, 'Unauthorized action.');
298:         }
299: 
300:         $this->warehouseAccess->authorizeWarehouse($request->user(), $warehouse->id);
301: 
302:         // 'present' (not 'required') so an empty list clears every assignment.
303:         $validated = $request->validate([
304:             'user_ids' => ['present', 'array'],
305:             'user_ids.*' => ['integer', new OrganizationMember($request->user()->organization_id)],
306:         ]);
307: 
308:         $warehouse->users()->sync($validated['user_ids']);
309: 
310:         return redirect()->back()
311:             ->with('success', __('Warehouse user assignments updated successfully.'));
312:     }
313: 
314:     /**
315:      * Set the specified warehouse as the organization default.
316:      */
317:     public function setDefault(Request $request, Warehouse $warehouse)
318:     {
319:         if ($warehouse->organization_id !== $request->user()->organization_id) {
320:             abort(403, 'Unauthorized action.');
321:         }
322: 
323:         $this->warehouseAccess->authorizeWarehouse($request->user(), $warehouse->id);
324: 
325:         $organizationId = $request->user()->organization_id;
326: 
327:         // Remove default from all other warehouses in this org
328:         Warehouse::forOrganization($organizationId)
329:             ->where('is_default', true)
330:             ->update(['is_default' => false]);
331: 
332:         $warehouse->update(['is_default' => true]);
333: 
334:         return redirect()->back()
335:             ->with('success', __('Default warehouse updated successfully.'));
336:     }
337: 
338:     /**
339:      * Set the user's active warehouse in session.
340:      */
341:     public function setActiveWarehouse(Request $request)
342:     {
343:         $validated = $request->validate([
344:             'warehouse_id' => ['nullable', 'integer'],
345:         ]);
346: 
347:         $warehouseId = $validated['warehouse_id'] ?? null;
348: 
349:         if ($warehouseId !== null) {
350:             // Verify user has access to this warehouse
351:             if (! $request->user()->hasWarehouseAccess($warehouseId)) {
352:                 abort(403, 'You do not have access to this warehouse.');
353:             }
354: 
```



<a id="e0116"></a>

> Audit provenance: `inventory.md` lines 5362–5577. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Warehouse

Source [app/Models/Warehouse.php:44](C:/Users/proj/Inventoros/app/Models/Warehouse.php#L44)

```php
44:     protected $fillable = [
45:         'organization_id',
46:         'name',
47:         'code',
48:         'description',
49:         'address_line_1',
50:         'address_line_2',
51:         'city',
52:         'province',
53:         'postal_code',
54:         'country',
55:         'phone',
56:         'email',
57:         'manager_name',
58:         'timezone',
59:         'currency',
60:         'is_default',
61:         'is_active',
62:         'priority',
63:         'capacity',
64:     ];
```

Source [app/Enums/TrackingType.php:1](C:/Users/proj/Inventoros/app/Enums/TrackingType.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: /**
8:  * How stock is tracked for a given Product.
9:  *
10:  * Values match the existing tracking_type column shape so this enum
11:  * can be adopted by callsites incrementally.
12:  */
13: enum TrackingType: string
14: {
15:     case NONE = 'none';
16:     case BATCH = 'batch';
17:     case SERIAL = 'serial';
18: 
19:     /**
20:      * @return array<int, string>
21:      */
22:     public static function values(): array
23:     {
24:         return array_column(self::cases(), 'value');
25:     }
26: 
27:     /**
28:      * @return array<int, array{value: string, label: string}>
29:      */
30:     public static function options(): array
31:     {
32:         return array_map(
33:             fn (self $c) => ['value' => $c->value, 'label' => ucfirst($c->value)],
34:             self::cases()
35:         );
36:     }
37: }
38: 
```

Source [app/Enums/BarcodeType.php:1](C:/Users/proj/Inventoros/app/Enums/BarcodeType.php#L1)

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: use Picqer\Barcode\BarcodeGenerator;
8: 
9: /**
10:  * Linear barcode symbologies a product barcode can be printed as.
11:  *
12:  * Stored in `products.barcode_type`. Null there means "detect": a valid
13:  * EAN-13 or UPC-A value prints as that retail symbology, anything else as
14:  * Code 128.
15:  */
16: enum BarcodeType: string
17: {
18:     case CODE_128 = 'code128';
19:     case EAN_13 = 'ean13';
20:     case UPC_A = 'upca';
21:     case EAN_8 = 'ean8';
22:     case CODE_39 = 'code39';
23: 
24:     public function label(): string
25:     {
26:         return match ($this) {
27:             self::CODE_128 => 'Code 128',
28:             self::EAN_13 => 'EAN-13',
29:             self::UPC_A => 'UPC-A',
30:             self::EAN_8 => 'EAN-8',
31:             self::CODE_39 => 'Code 39',
32:         };
33:     }
34: 
35:     /**
36:      * The picqer generator type constant for this symbology.
37:      */
38:     public function generatorType(): string
39:     {
40:         return match ($this) {
41:             self::CODE_128 => BarcodeGenerator::TYPE_CODE_128,
42:             self::EAN_13 => BarcodeGenerator::TYPE_EAN_13,
43:             self::UPC_A => BarcodeGenerator::TYPE_UPC_A,
44:             self::EAN_8 => BarcodeGenerator::TYPE_EAN_8,
45:             self::CODE_39 => BarcodeGenerator::TYPE_CODE_39,
46:         };
47:     }
48: 
49:     /**
50:      * Human-readable rule shown when a value does not fit this symbology.
51:      */
52:     public function requirement(): string
53:     {
54:         return match ($this) {
55:             self::CODE_128 => 'printable ASCII characters (up to 80)',
56:             self::EAN_13 => '13 digits with a valid check digit',
57:             self::UPC_A => '12 digits with a valid check digit',
58:             self::EAN_8 => '8 digits with a valid check digit',
59:             self::CODE_39 => 'uppercase letters, digits, spaces and - . $ / + % (up to 43)',
60:         };
61:     }
62: 
63:     /**
64:      * Whether $value can be encoded in this symbology. Numeric retail codes
65:      * must carry their full length including a correct check digit, so a
66:      * mistyped code is rejected instead of silently getting a new digit.
67:      */
68:     public function isValid(string $value): bool
69:     {
70:         return match ($this) {
71:             self::CODE_128 => $value !== '' && strlen($value) <= 80 && preg_match('/^[\x20-\x7E]+$/', $value) === 1,
72:             self::EAN_13 => self::isGtin($value, 13),
73:             self::UPC_A => self::isGtin($value, 12),
74:             self::EAN_8 => self::isGtin($value, 8),
75:             self::CODE_39 => strlen($value) <= 43 && preg_match('/^[0-9A-Z\-. $\/+%]+$/', $value) === 1,
76:         };
77:     }
78: 
79:     /**
80:      * Pick a symbology for a value with no explicit type: valid EAN-13 and
81:      * UPC-A codes keep their retail symbology, everything else is Code 128.
82:      */
83:     public static function detect(string $value): self
84:     {
85:         if (self::EAN_13->isValid($value)) {
86:             return self::EAN_13;
87:         }
88: 
89:         if (self::UPC_A->isValid($value)) {
90:             return self::UPC_A;
91:         }
92: 
93:         return self::CODE_128;
94:     }
95: 
96:     /**
97:      * GS1 mod-10 check digit for the data digits (everything but the check
98:      * digit). Weights alternate 3,1 starting from the rightmost data digit,
99:      * which covers EAN-8, UPC-A and EAN-13 alike.
100:      */
101:     public static function gtinCheckDigit(string $data): int
102:     {
103:         $sum = 0;
104:         $digits = strrev($data);
105:         for ($i = 0, $n = strlen($digits); $i < $n; $i++) {
106:             $sum += (int) $digits[$i] * ($i % 2 === 0 ? 3 : 1);
107:         }
108: 
109:         return (10 - ($sum % 10)) % 10;
110:     }
111: 
112:     private static function isGtin(string $value, int $length): bool
113:     {
114:         if (strlen($value) !== $length || ! ctype_digit($value)) {
115:             return false;
116:         }
117: 
118:         return self::gtinCheckDigit(substr($value, 0, -1)) === (int) substr($value, -1);
119:     }
120: 
121:     /**
122:      * @return array<int, string>
123:      */
124:     public static function values(): array
125:     {
126:         return array_column(self::cases(), 'value');
127:     }
128: 
129:     /**
130:      * @return array<int, array{value: string, label: string}>
131:      */
132:     public static function options(): array
133:     {
134:         return array_map(
135:             fn (self $c) => ['value' => $c->value, 'label' => $c->label()],
136:             self::cases()
137:         );
138:     }
139: }
140: 
```



<a id="e0135"></a>

> Audit provenance: `inventory.md` lines 5907–5960. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_04_04_024204_create_warehouses_table.php
[database/migrations/2026_04_04_024204_create_warehouses_table.php:1](C:/Users/proj/Inventoros/database/migrations/2026_04_04_024204_create_warehouses_table.php#L1)

```php
11:         Schema::create('warehouses', function (Blueprint $table) {
12:             $table->id();
13:             $table->foreignId('organization_id')->constrained()->onDelete('cascade');
14:             $table->string('name');
15:             $table->string('code', 50)->nullable();
16:             $table->text('description')->nullable();
17:             $table->string('address_line_1')->nullable();
18:             $table->string('address_line_2')->nullable();
19:             $table->string('city')->nullable();
20:             $table->string('province', 100)->nullable();
21:             $table->string('postal_code', 20)->nullable();
22:             $table->string('country', 2)->default('CA');
23:             $table->string('phone', 30)->nullable();
24:             $table->string('email')->nullable();
25:             $table->string('manager_name')->nullable();
26:             $table->string('timezone', 50)->nullable();
27:             $table->string('currency', 3)->nullable();
28:             $table->boolean('is_default')->default(false);
29:             $table->boolean('is_active')->default(true);
30:             $table->integer('priority')->default(0);
31:             $table->timestamps();
32:             $table->softDeletes();
34:             $table->index(['organization_id', 'is_active']);
35:             $table->index(['organization_id', 'code']);
36:             $table->index(['organization_id', 'is_default']);
40:         Schema::create('warehouse_user', function (Blueprint $table) {
41:             $table->id();
42:             $table->foreignId('warehouse_id')->constrained()->onDelete('cascade');
43:             $table->foreignId('user_id')->constrained()->onDelete('cascade');
44:             $table->timestamps();
46:             $table->unique(['warehouse_id', 'user_id']);
50:         Schema::table('product_locations', function (Blueprint $table) {
51:             $table->foreignId('warehouse_id')->nullable()->after('organization_id')->constrained()->nullOnDelete();
52:             $table->index(['warehouse_id', 'is_active']);
61:         Schema::table('stock_transfers', function (Blueprint $table) {
62:             $table->foreignId('from_warehouse_id')->nullable()->after('organization_id')->constrained('warehouses')->nullOnDelete();
63:             $table->foreignId('to_warehouse_id')->nullable()->after('from_warehouse_id')->constrained('warehouses')->nullOnDelete();
64:             $table->boolean('is_inter_warehouse')->default(false)->after('status');
65:             $table->string('shipping_method')->nullable()->after('is_inter_warehouse');
66:             $table->string('tracking_number')->nullable()->after('shipping_method');
67:             $table->timestamp('shipped_at')->nullable()->after('tracking_number');
68:             $table->timestamp('estimated_arrival')->nullable()->after('shipped_at');
74:         Schema::table('stock_transfers', function (Blueprint $table) {
75:             $table->dropConstrainedForeignId('from_warehouse_id');
76:             $table->dropConstrainedForeignId('to_warehouse_id');
77:             $table->dropColumn(['is_inter_warehouse', 'shipping_method', 'tracking_number', 'shipped_at', 'estimated_arrival']);
84:         Schema::table('product_locations', function (Blueprint $table) {
85:             $table->dropConstrainedForeignId('warehouse_id');
```



<a id="e0146"></a>

> Audit provenance: `inventory.md` lines 6090–6103. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_09_28_000004_add_capacity_to_warehouses_and_locations.php
[database/migrations/2026_09_28_000004_add_capacity_to_warehouses_and_locations.php:1](C:/Users/proj/Inventoros/database/migrations/2026_09_28_000004_add_capacity_to_warehouses_and_locations.php#L1)

```php
15:         Schema::table('warehouses', function (Blueprint $table) {
16:             $table->unsignedInteger('capacity')->nullable()->after('priority');
19:         Schema::table('product_locations', function (Blueprint $table) {
20:             $table->unsignedInteger('capacity')->nullable()->after('bin');
26:         Schema::table('product_locations', function (Blueprint $table) {
27:             $table->dropColumn('capacity');
30:         Schema::table('warehouses', function (Blueprint $table) {
31:             $table->dropColumn('capacity');
```



<a id="e0296"></a>

> Audit provenance: `platform-source-catalog.md` lines 340–364. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Components/WarehouseSwitcher.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
10: const warehouses = computed(() => page.props.warehouses || []);
11: const activeWarehouseId = computed(() => page.props.activeWarehouseId || null);
13: const activeWarehouse = computed(() => {
18: const buttonLabel = computed(() => (activeWarehouse.value ? activeWarehouse.value.name : t('warehouses.allWarehouses')));
20: const isOpen = ref(false);
21: const dropdownRef = ref(null);
22: const triggerRef = ref(null);
31: router.post(route('warehouses.set-active'), {
```

**Displayed data/value expressions:**
```text
70: buttonLabel
102: $t('warehouses.allWarehouses')
129: warehouse.name
130: warehouse.code
```



<a id="e0499"></a>

> Audit provenance: `additional-contracts.md` lines 1209–1263. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/Warehouse/StoreWarehouseRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/Warehouse/StoreWarehouseRequest.php#L1). SHA-256: `073968a41da766de510c8cc150a4e6c23add16266a0ee4a09ead904f0227bf4c`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\Warehouse;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a new warehouse via the REST API. Rules unchanged from
12:  * Api\WarehouseController::store.
13:  */
14: final class StoreWarehouseRequest extends FormRequest
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
25:             'code' => [
26:                 'nullable',
27:                 'string',
28:                 'max:50',
29:                 Rule::unique('warehouses', 'code')->where('organization_id', $organizationId),
30:             ],
31:             'description' => ['nullable', 'string', 'max:1000'],
32:             'address_line_1' => ['nullable', 'string', 'max:255'],
33:             'address_line_2' => ['nullable', 'string', 'max:255'],
34:             'city' => ['nullable', 'string', 'max:255'],
35:             'province' => ['nullable', 'string', 'max:255'],
36:             'postal_code' => ['nullable', 'string', 'max:255'],
37:             'country' => ['nullable', 'string', 'max:255'],
38:             'phone' => ['nullable', 'string', 'max:30'],
39:             'email' => ['nullable', 'email', 'max:255'],
40:             'manager_name' => ['nullable', 'string', 'max:255'],
41:             'timezone' => ['nullable', 'string', 'max:50'],
42:             'currency' => ['nullable', 'string', 'max:3'],
43:             'is_active' => ['nullable', 'boolean'],
44:             'priority' => ['nullable', 'integer', 'min:0'],
45:             'capacity' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
46:         ];
47:     }
48: }
```



<a id="e0500"></a>

> Audit provenance: `additional-contracts.md` lines 1264–1324. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/Warehouse/UpdateWarehouseRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/Warehouse/UpdateWarehouseRequest.php#L1). SHA-256: `ea35f2326e5e28159d6e96db3af92c2ce9f9ac77f587adabdd0babf89dfe85f9`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\Warehouse;
6: 
7: use App\Models\Warehouse;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates a warehouse update via the REST API. Rules unchanged from
13:  * Api\WarehouseController::update (name `sometimes`; code uniqueness ignores
14:  * the bound warehouse).
15:  */
16: final class UpdateWarehouseRequest extends FormRequest
17: {
18:     /**
19:      * @return array<string, mixed>
20:      */
21:     public function rules(): array
22:     {
23:         $organizationId = $this->user()->organization_id;
24:         /** @var Warehouse $warehouse */
25:         $warehouse = $this->route('warehouse');
26: 
27:         return [
28:             'name' => ['sometimes', 'string', 'max:255'],
29:             'code' => [
30:                 'nullable',
31:                 'string',
32:                 'max:50',
33:                 Rule::unique('warehouses', 'code')
34:                     ->where('organization_id', $organizationId)
35:                     ->ignore($warehouse->id),
36:             ],
37:             'description' => ['nullable', 'string', 'max:1000'],
38:             'address_line_1' => ['nullable', 'string', 'max:255'],
39:             'address_line_2' => ['nullable', 'string', 'max:255'],
40:             'city' => ['nullable', 'string', 'max:255'],
41:             'province' => ['nullable', 'string', 'max:255'],
42:             'postal_code' => ['nullable', 'string', 'max:255'],
43:             'country' => ['nullable', 'string', 'max:255'],
44:             'phone' => ['nullable', 'string', 'max:30'],
45:             'email' => ['nullable', 'email', 'max:255'],
46:             'manager_name' => ['nullable', 'string', 'max:255'],
47:             'timezone' => ['nullable', 'string', 'max:50'],
48:             'currency' => ['nullable', 'string', 'max:3'],
49:             'is_active' => ['nullable', 'boolean'],
50:             'priority' => ['nullable', 'integer', 'min:0'],
51:             'capacity' => ['nullable', 'integer', 'min:0', 'max:2147483647'],
52:         ];
53:     }
54: }
```

