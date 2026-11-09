# 33. Organization, Email and Preferences — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Organization, Email and Preferences as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Organization profile/logo/region/currency/timezone; approval policies; customer portal enablement; email configuration/test; notification preferences; organization switch.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Settings/Email.vue` | Pending | Pending |
| `resources/js/Pages/Settings/Index.vue` | Pending | Pending |
| `resources/js/Pages/Settings/Organization/Index.vue` | Pending | Pending |
| `resources/js/Pages/Settings/Partials/EmailConfiguration.vue` | Pending | Pending |
| `resources/js/Pages/Settings/Partials/NotificationPreferences.vue` | Pending | Pending |

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

- [ ] Independent settings updates preserve unrelated keys.
- [ ] blank secrets obey source retention without being returned to browser.
- [ ] currency/timezone persist.
- [ ] email test failure is not a successful configuration claim.
- [ ] switches require membership.

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

- [P05 Organization/account/email settings](#e0259)
- [`resources/js/Components/OrganizationSwitcher.vue`](#e0293)
- [`resources/js/Pages/Settings/Email.vue`](#e0358)
- [`resources/js/Pages/Settings/Index.vue`](#e0359)
- [`resources/js/Pages/Settings/Organization/Index.vue`](#e0360)
- [`resources/js/Pages/Settings/Partials/EmailConfiguration.vue`](#e0361)
- [`resources/js/Pages/Settings/Partials/NotificationPreferences.vue`](#e0362)
- [`app/Http/Controllers/Admin/OrganizationLogoController.php`](#e0387)
- [`app/Http/Controllers/Admin/OrganizationSettingsController.php`](#e0388)
- [`app/Http/Controllers/OrganizationSwitchController.php`](#e0408)
- [`app/Http/Controllers/SettingsController.php`](#e0423)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0259"></a>

> Audit provenance: `platform.md` lines 49–58. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P05 Organization/account/email settings

Organization general: name required max255; email optional email max255; phone optional max50; address optional string; city/state/country optional max255; zip optional max20. Values preload organization, blank fallback. Logo separate file form logo:null upload/remove; controller image/size rules retained in catalog OrganizationLogoController.

Regional: currency required server-allowed currency(current/configured, UI USD fallback); timezone required timezone:all(UTC); date_format/time_format nullable max50(Y-m-d/H:i). Approval booleans purchase_orders_enabled,stock_adjustments_enabled,stock_transfers_enabled,admins_can_self_approve,orders_enabled. Thresholds purchase_orders_threshold numeric0..999999999; stock_adjustments_quantity_threshold integer same range; stock_adjustments_value_threshold numeric same range; all nullable. Existing policy defaults; self-approve fallback true. Saved through ApprovalSettings into organization.settings, not unrelated toggles. Portal portal_enabled required boolean; read-only portal URL. Evidence OrganizationSettingsController85-188. View needs view_settings; changes manage_organization (`routes/web/admin.php:86-98`).

Account profile: name required max255,email valid unique except self max255. Password: current_password required string; password required string confirmed min8. Notification boolean fields email_notifications,low_stock_alerts,order_notifications,system_notifications,user_activity_alerts,email_low_stock,email_orders,email_approvals. Main four UI defaults true; activity alerts false/admin-surfaced; subtype defaults true. Merge changes, don't overwrite other keys. Preferences theme nullable light|dark|auto(account fallback dark), language supported locale(current locale then en), items_per_page integer10..100(default25). Stored under notification_preferences.preferences in this source. Dedicated locale update preserves other keys. Evidence AccountSettingsController93-152 and Pages/Settings/Account/Index.vue54-105.

Email provider smtp|phpmail|mailgun|sendgrid(smtp default); from_address required email/from_name required max255. SMTP host string, port integer1..65535(default587), encryption tls|ssl|none(defaulttls) required when SMTP; username/password optional. Mailgun domain/secret required in Mailgun mode; SendGrid api_key required in SendGrid mode. test_email required email. Save/test authority manage_organization plus controller gate. Preserve existing secrets on blank input as actual controller dictates; do not expose live secrets. Evidence SettingsController71-129,168-181; exact partial forms cataloged.



<a id="e0293"></a>

> Audit provenance: `platform-source-catalog.md` lines 259–279. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Components/OrganizationSwitcher.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
17: const isOpen = ref(false);
18: const dropdownRef = ref(null);
19: const triggerRef = ref(null);
22: const organizations = computed(() => page.props.auth?.organizations || []);
23: const active = computed(() => page.props.auth?.organization || null);
29: router.post(route('organizations.switch'), { organization_id: organization.id }, {
```

**Displayed data/value expressions:**
```text
57: active?.name
94: organization.name
```



<a id="e0358"></a>

> Audit provenance: `platform-source-catalog.md` lines 2606–2615. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Email.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
17: const activeTab = ref('configuration');
```



<a id="e0359"></a>

> Audit provenance: `platform-source-catalog.md` lines 2616–2649. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
30: const { hasPermission } = usePermissions();
36: const allSections = computed(() => ([
38: href: route('settings.storage.index'),
45: href: route('settings.account.index'),
52: href: route('settings.account.index', { tab: 'notifications' }),
59: href: route('two-factor.setup'),
66: href: route('settings.api-tokens.index'),
73: href: route('settings.organization.index'),
80: href: route('settings.email.index'),
87: href: route('settings.shipping.index'),
94: href: route('webhooks.index'),
101: href: route('admin.update.index'),
110: const settingsSections = computed(() =>
111: allSections.value.filter((s) => (!s.perm || hasPermission(s.perm)) && (!s.updatesOnly || page.props.auth?.canManageUpdates) && (!s.storageOnly || page.props.auth?.canManageStorage))
114: const settingsGroups = computed(() => [
115: { key: 'account', title: t('nav.account'), sections: settingsSections.value.filter(section => section.group === 'account') },
116: { key: 'workspace', title: t('nav.sections.workspace'), sections: settingsSections.value.filter(section => section.group !== 'account') },
117: ].filter(group => group.sections.length));
```

**Displayed data/value expressions:**
```text
143: group.title
153: section.title
154: section.description
```



<a id="e0360"></a>

> Audit provenance: `platform-source-catalog.md` lines 2650–2755. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Organization/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Settings/Organization/Index.vue:211`: `<input id="organization-logo" ref="logoInput" type="file" accept="image/png,image/jpeg,image/webp" :disabled="logoForm.processing" @change="logoForm.logo = $event.target.files[0] || null" />`
- `resources/js/Pages/Settings/Organization/Index.vue:229`: `<input id="name" v-model="generalForm.name" type="text" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:240`: `<input id="email" v-model="generalForm.email" type="email" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:251`: `<input id="phone" v-model="generalForm.phone" type="text" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:262`: `<input id="address" v-model="generalForm.address" type="text" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:273`: `<input id="city" v-model="generalForm.city" type="text" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:284`: `<input id="state" v-model="generalForm.state" type="text" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:295`: `<input id="zip" v-model="generalForm.zip" type="text" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:306`: `<input id="country" v-model="generalForm.country" type="text" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:338`: `<select id="currency" v-model="regionalForm.currency" :disabled="!canManage" >`
- `resources/js/Pages/Settings/Organization/Index.vue:350`: `<select id="timezone" v-model="regionalForm.timezone" :disabled="!canManage" >`
- `resources/js/Pages/Settings/Organization/Index.vue:362`: `<input id="date_format" v-model="regionalForm.date_format" type="text" :disabled="!canManage" placeholder="Y-m-d" />`
- `resources/js/Pages/Settings/Organization/Index.vue:374`: `<input id="time_format" v-model="regionalForm.time_format" type="text" :disabled="!canManage" placeholder="H:i" />`
- `resources/js/Pages/Settings/Organization/Index.vue:408`: `<input v-model="approvalsForm.purchase_orders_enabled" type="checkbox" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:416`: `<input id="po_threshold" v-model="approvalsForm.purchase_orders_threshold" type="number" min="0" step="0.01" inputmode="decimal" :disabled="!canManage" :placeholder="t('approvals.settings.everyOne')" />`
- `resources/js/Pages/Settings/Organization/Index.vue:424`: `<input v-model="approvalsForm.stock_adjustments_enabled" type="checkbox" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:433`: `<input id="adj_qty_threshold" v-model="approvalsForm.stock_adjustments_quantity_threshold" type="number" min="0" step="1" inputmode="numeric" :disabled="!canManage" :placeholder="t('approvals.settings.noLimit')" />`
- `resources/js/Pages/Settings/Organization/Index.vue:438`: `<input id="adj_value_threshold" v-model="approvalsForm.stock_adjustments_value_threshold" type="number" min="0" step="0.01" inputmode="decimal" :disabled="!canManage" :placeholder="t('approvals.settings.noLimit')" />`
- `resources/js/Pages/Settings/Organization/Index.vue:447`: `<input v-model="approvalsForm.stock_transfers_enabled" type="checkbox" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:456`: `<input v-model="approvalsForm.orders_enabled" type="checkbox" :disabled="!canManage" />`
- `resources/js/Pages/Settings/Organization/Index.vue:465`: `<input v-model="approvalsForm.admins_can_self_approve" type="checkbox" :disabled="!canManage" />`

**Form initial state/defaults:**
```js
30: const logoForm = useForm({ logo: null });
41: const generalForm = useForm({
42:     name: props.organization.name || '',
43:     email: props.organization.email || '',
44:     phone: props.organization.phone || '',
45:     address: props.organization.address || '',
46:     city: props.organization.city || '',
47:     state: props.organization.state || '',
48:     zip: props.organization.zip || '',
49:     country: props.organization.country || '',
50: });
59: const regionalForm = useForm({
60:     currency: props.organization.currency || 'USD',
61:     timezone: props.organization.timezone || 'UTC',
62:     date_format: props.organization.date_format || 'Y-m-d',
63:     time_format: props.organization.time_format || 'H:i',
64: });
89: const approvalsForm = useForm({
90:     purchase_orders_enabled: !!props.approvalSettings.purchase_orders_enabled,
91:     purchase_orders_threshold: props.approvalSettings.purchase_orders_threshold ?? '',
92:     stock_adjustments_enabled: !!props.approvalSettings.stock_adjustments_enabled,
93:     stock_adjustments_quantity_threshold: props.approvalSettings.stock_adjustments_quantity_threshold ?? '',
94:     stock_adjustments_value_threshold: props.approvalSettings.stock_adjustments_value_threshold ?? '',
95:     stock_transfers_enabled: !!props.approvalSettings.stock_transfers_enabled,
96:     admins_can_self_approve: props.approvalSettings.admins_can_self_approve ?? true,
97:     orders_enabled: !!props.approvalSettings.orders_enabled,
98: });
```

**Select option values/labels (dynamic options retain their source):**
```html
344: <option v-for="currency in currencies" :key="currency.code" :value="currency.code">{{ currency.code }} - {{ currency.name }}</option>
356: <option v-for="zone in timezones" :key="zone" :value="zone">{{ zone }}</option>
```

**View filters, permission/action and navigation anchors:**
```js
28: const activeTab = ref('general');
29: const logoInput = ref(null);
31: const uploadLogo = () => logoForm.post(route('settings.organization.logo.store'), {
38: const removeLogo = () => logoForm.delete(route('settings.organization.logo.destroy'), { preserveScroll: true });
53: generalForm.patch(route('settings.organization.update.general'), {
67: regionalForm.patch(route('settings.organization.update.regional'), {
74: const canManage = computed(() => !!(props.can?.manageOrganization ?? props.canManageOrganization));
75: const canViewUsers = computed(() => !!props.can?.viewUsers);
78: const portalSaving = ref(false);
80: router.patch(route('settings.organization.update.portal'), { portal_enabled: enabled }, {
108: .patch(route('settings.organization.update.approvals'), { preserveScroll: true });
119: const tabs = computed(() => ([
```

**Displayed data/value expressions:**
```text
212: logoForm.errors.logo
236: generalForm.errors.name
247: generalForm.errors.email
258: generalForm.errors.phone
269: generalForm.errors.address
280: generalForm.errors.city
291: generalForm.errors.state
302: generalForm.errors.zip
313: generalForm.errors.country
344: currency.code
344: currency.name
346: regionalForm.errors.currency
356: zone
358: regionalForm.errors.timezone
370: regionalForm.errors.date_format
382: regionalForm.errors.time_format
417: approvalsForm.errors.purchase_orders_threshold
434: approvalsForm.errors.stock_adjustments_quantity_threshold
439: approvalsForm.errors.stock_adjustments_value_threshold
491: portal.enabled ? t('common.active') : t('common.inactive')
496: portal.enabled ? t('portal.settings.enabled') : t('portal.settings.disabled')
507: portal.login_url
510: portal.login_url
521: portal.enabled ? t('portal.settings.turnOff') : t('portal.settings.turnOn')
```



<a id="e0361"></a>

> Audit provenance: `platform-source-catalog.md` lines 2756–2823. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Partials/EmailConfiguration.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:87`: `<select :id="fieldIdPrefix + '-1'" v-model="form.provider">`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:100`: `<input :id="fieldIdPrefix + '-2'" v-model="form.from_address" type="email" required placeholder="noreply@yourcompany.com" />`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:115`: `<input :id="fieldIdPrefix + '-3'" v-model="form.from_name" type="text" required :placeholder="t('settings.email.fromNamePlaceholder')" />`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:134`: `<input :id="fieldIdPrefix + '-4'" v-model="form.smtp.host" type="text" placeholder="smtp.gmail.com" />`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:146`: `<input :id="fieldIdPrefix + '-5'" v-model.number="form.smtp.port" type="number" placeholder="587" />`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:159`: `<input :id="fieldIdPrefix + '-6'" v-model="form.smtp.username" type="text" />`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:170`: `<input :id="fieldIdPrefix + '-7'" v-model="form.smtp.password" type="password" :placeholder="emailConfig.smtp?.password_set ? t('settings.email.secretSaved') : t('settings.email.passwordHint')" autocomplete="new-password" />`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:183`: `<select :id="fieldIdPrefix + '-8'" v-model="form.smtp.encryption">`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:199`: `<input :id="fieldIdPrefix + '-9'" v-model="form.mailgun.domain" type="text" placeholder="mg.yourcompany.com" />`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:211`: `<input :id="fieldIdPrefix + '-10'" v-model="form.mailgun.secret" type="password" :placeholder="emailConfig.mailgun?.secret_set ? t('settings.email.secretSaved') : 'key-...'" autocomplete="new-password" />`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:229`: `<input :id="fieldIdPrefix + '-11'" v-model="form.sendgrid.api_key" type="password" :placeholder="emailConfig.sendgrid?.api_key_set ? t('settings.email.secretSaved') : 'SG....'" autocomplete="new-password" />`
- `resources/js/Pages/Settings/Partials/EmailConfiguration.vue:243`: `<input v-model="testEmailAddress" type="email" placeholder="test@example.com" />`

**Form initial state/defaults:**
```js
16: const form = useForm({
17:     provider: props.emailConfig.provider || 'smtp',
18:     from_address: props.emailConfig.from_address || '',
19:     from_name: props.emailConfig.from_name || '',
20:     smtp: {
21:         host: props.emailConfig.smtp?.host || '',
22:         port: props.emailConfig.smtp?.port || 587,
23:         username: props.emailConfig.smtp?.username || '',
24:         password: props.emailConfig.smtp?.password || '',
25:         encryption: props.emailConfig.smtp?.encryption || 'tls',
26:     },
27:     mailgun: {
28:         domain: props.emailConfig.mailgun?.domain || '',
29:         secret: props.emailConfig.mailgun?.secret || '',
30:     },
31:     sendgrid: {
32:         api_key: props.emailConfig.sendgrid?.api_key || '',
33:     },
34: });
```

**Select option values/labels (dynamic options retain their source):**
```html
88: <option value="smtp">{{ t('settings.email.smtp') }}</option>
89: <option value="phpmail">{{ t('settings.email.phpMail') }}</option>
90: <option value="mailgun">{{ t('settings.email.mailgun') }}</option>
91: <option value="sendgrid">{{ t('settings.email.sendgrid') }}</option>
184: <option value="tls">{{ t('settings.email.tls') }}</option>
185: <option value="ssl">{{ t('settings.email.ssl') }}</option>
186: <option value="none">{{ t('settings.email.none') }}</option>
```

**View filters, permission/action and navigation anchors:**
```js
36: const testEmailAddress = ref('');
37: const sendingTest = ref(false);
38: const testResult = ref(null);
41: form.post(route('settings.email.update'), {
52: axios.post(route('settings.email.test'), {
```

**Displayed data/value expressions:**
```text
107: form.errors.from_address
122: form.errors.from_name
256: sendingTest ? t('settings.email.sending') : t('settings.email.sendTest')
260: testResult.message
272: form.processing ? t('common.saving') : t('settings.email.saveSettings')
```



<a id="e0362"></a>

> Audit provenance: `platform-source-catalog.md` lines 2824–2851. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Partials/NotificationPreferences.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Settings/Partials/NotificationPreferences.vue:44`: `<input v-model="form.email_notifications" type="checkbox" id="email_notifications" />`
- `resources/js/Pages/Settings/Partials/NotificationPreferences.vue:73`: `<input v-model="form.email_low_stock" type="checkbox" id="email_low_stock" :disabled="!form.email_notifications" />`
- `resources/js/Pages/Settings/Partials/NotificationPreferences.vue:94`: `<input v-model="form.email_orders" type="checkbox" id="email_orders" :disabled="!form.email_notifications" />`
- `resources/js/Pages/Settings/Partials/NotificationPreferences.vue:115`: `<input v-model="form.email_approvals" type="checkbox" id="email_approvals" :disabled="!form.email_notifications" />`

**Form initial state/defaults:**
```js
12: const form = useForm({
13:     email_notifications: props.preferences?.email_notifications ?? true,
14:     email_low_stock: props.preferences?.email_low_stock ?? true,
15:     email_orders: props.preferences?.email_orders ?? true,
16:     email_approvals: props.preferences?.email_approvals ?? true,
17: });
```

**View filters, permission/action and navigation anchors:**
```js
20: form.patch(route('settings.account.update.notifications'), {
```

**Displayed data/value expressions:**
```text
138: form.processing ? t('common.saving') : t('settings.account.savePreferences')
```



<a id="e0387"></a>

> Audit provenance: `platform-source-catalog.md` lines 3786–3804. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/OrganizationLogoController.php`
```php
18:     public function show(Request $request, Organization $organization): StreamedResponse
20:         abort_unless((int) $request->user()->organization_id === (int) $organization->id, 404);
22:         abort_unless($organization->logo_path && $disk->exists($organization->logo_path), 404);
32:     public function store(Request $request): RedirectResponse
34:         $request->validate([
35:             'logo' => ['required', 'image', 'mimes:png,jpg,jpeg,webp', 'max:2048', 'dimensions:max_width=2048,max_height=2048'],
36:         ]);
42:         $path = $request->file('logo')->store("organizations/{$organization->id}/logos", ['disk' => $disk, 'visibility' => 'private']);
43:         abort_unless($path, 500, 'Unable to save the organization logo.');
46:             $organization->forceFill(['logo_path' => $path, 'logo_disk' => $disk])->save();
48:             Storage::disk($disk)->delete($path);
53:             Storage::disk($oldDisk)->delete($oldPath);
59:     public function destroy(Request $request): RedirectResponse
64:         $organization->forceFill(['logo_path' => null, 'logo_disk' => null])->save();
67:             Storage::disk($oldDisk)->delete($oldPath);
```



<a id="e0388"></a>

> Audit provenance: `platform-source-catalog.md` lines 3805–3848. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/OrganizationSettingsController.php`
```php
30:     public function index(Request $request): Response
36:         return Inertia::render('Settings/Organization/Index', [
67:     private static function currencyCodes(?string $current): array
85:     public function updatePortal(Request $request): RedirectResponse
93:         $validated = $request->validate([
94:             'portal_enabled' => 'required|boolean',
95:         ]);
98:         $organization->forceFill(['portal_enabled' => (bool) $validated['portal_enabled']])->save();
112:     public function updateApprovals(Request $request): RedirectResponse
114:         $validated = $request->validate([
115:             'purchase_orders_enabled' => 'boolean',
116:             'purchase_orders_threshold' => 'nullable|numeric|min:0|max:999999999',
117:             'stock_adjustments_enabled' => 'boolean',
118:             'stock_adjustments_quantity_threshold' => 'nullable|integer|min:0|max:999999999',
119:             'stock_adjustments_value_threshold' => 'nullable|numeric|min:0|max:999999999',
120:             'stock_transfers_enabled' => 'boolean',
121:             'admins_can_self_approve' => 'boolean',
122:             'orders_enabled' => 'boolean',
123:         ]);
134:         $organization->update(['settings' => $settings]);
145:     public function updateGeneral(Request $request): RedirectResponse
153:         $validated = $request->validate([
154:             'name' => 'required|string|max:255',
155:             'email' => 'nullable|email|max:255',
156:             'phone' => 'nullable|string|max:50',
157:             'address' => 'nullable|string',
158:             'city' => 'nullable|string|max:255',
159:             'state' => 'nullable|string|max:255',
160:             'zip' => 'nullable|string|max:20',
161:             'country' => 'nullable|string|max:255',
162:         ]);
165:         $organization->update($validated);
176:     public function updateRegional(Request $request): RedirectResponse
184:         $validated = $request->validate([
185:             'currency' => ['required', 'string', \Illuminate\Validation\Rule::in(self::currencyCodes($user->organization?->currency))],
186:             'timezone' => ['required', 'string', 'timezone:all'],
187:             'date_format' => 'nullable|string|max:50',
188:             'time_format' => 'nullable|string|max:50',
189:         ]);
192:         $organization->update($validated);
```



<a id="e0408"></a>

> Audit provenance: `platform-source-catalog.md` lines 4266–4273. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/OrganizationSwitchController.php`
```php
21:     public function __invoke(Request $request, ActiveOrganization $organizations): RedirectResponse
23:         $validated = $request->validate([
24:             'organization_id' => ['required', 'integer', 'min:1'],
25:         ]);
```



<a id="e0423"></a>

> Audit provenance: `platform-source-catalog.md` lines 4574–4610. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/SettingsController.php`
```php
28:     private const SECRET_FIELDS = [
29:         ['smtp', 'password'],
30:         ['mailgun', 'secret'],
31:         ['sendgrid', 'api_key'],
32:     ];
38:     public function hub(): Response
40:         return Inertia::render('Settings/Index', [
48:     public function email(): Response
59:         return Inertia::render('Settings/Email', [
71:     public function updateEmail(Request $request)
75:         $validated = $request->validate([
76:             'provider' => 'required|in:smtp,phpmail,mailgun,sendgrid',
77:             'from_address' => 'required|email',
78:             'from_name' => 'required|string|max:255',
79: 
80:             'smtp.host' => 'required_if:provider,smtp|nullable|string',
81:             'smtp.port' => 'required_if:provider,smtp|nullable|integer|between:1,65535',
82:             'smtp.username' => 'nullable|string',
83:             'smtp.password' => 'nullable|string',
84:             'smtp.encryption' => 'required_if:provider,smtp|nullable|in:tls,ssl,none',
85: 
86:             'mailgun.domain' => 'required_if:provider,mailgun|nullable|string',
87:             'mailgun.secret' => 'required_if:provider,mailgun|nullable|string',
88: 
89:             'sendgrid.api_key' => 'required_if:provider,sendgrid|nullable|string',
90:         ]);
124:     public function testEmail(Request $request)
128:         $request->validate([
129:             'test_email' => 'required|email'
130:         ]);
137:             Mail::mailer($mailer)->to($request->test_email)->send(new TestEmail([
168:     private function setSecret(string $key, ?string $value): void
181:     private function authorizeEmailSettings(): void
```

