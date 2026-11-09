# 39. Extensions, Plugins and Tax Documents — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Extensions, Plugins and Tax Documents as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Bundled plugin controls; slots/widgets/tabs and registered contract extensions; tax profile; confirmed immutable tax invoice; administration parity disposition.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Orders, Payments and Documents](../modules/12_orders.md), [Customers](../modules/13_customers.md), [Roles and Permission Sets](../modules/31_roles_permissions.md), [Organization, Email and Preferences](../modules/33_organization_settings.md), [Storage, Uploads and Downloads](../modules/36_storage.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Plugins/Index.vue` | Pending | Pending |

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

- [ ] Tax invoice uses validated source profile and item facts then freezes snapshot.
- [ ] later master-data edits do not alter issued document.
- [ ] no claim of legal/tax filing certification.
- [ ] arbitrary uploaded executable plugins are not enabled without an approved target design.

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

- [P11 Plugins/marketplace/tax billing](#e0267)
- [Tax profile](#e0268)
- [Tax invoice](#e0269)
- [`plugins/hello-world/ui/src/HelloWorldBanner.vue`](#e0280)
- [`plugins/hello-world/ui/src/HelloWorldPage.vue`](#e0281)
- [`plugins/hello-world/ui/src/HelloWorldTab.vue`](#e0282)
- [`plugins/hello-world/ui/src/HelloWorldWidget.vue`](#e0283)
- [`plugins/tax-billing/ui/src/CustomerFields.vue`](#e0284)
- [`plugins/tax-billing/ui/src/CustomerTaxDetails.vue`](#e0285)
- [`plugins/tax-billing/ui/src/Invoice.vue`](#e0286)
- [`plugins/tax-billing/ui/src/InvoiceLink.vue`](#e0287)
- [`plugins/tax-billing/ui/src/Settings.vue`](#e0288)
- [`resources/js/Pages/Plugins/Index.vue`](#e0324)
- [`app/Http/Controllers/Admin/PluginController.php`](#e0389)
- [`app/Http/Controllers/Admin/PluginMarketplaceController.php`](#e0390)
- [`plugins/tax-billing/src/Controller.php`](#e0426)
- [`plugins/tax-billing/src/Invoices.php`](#e0427)
- [`plugins/tax-billing/src/Profile.php`](#e0428)
- [Contract appendix `plugins/tax-billing/Plugin.php:1-88`](#e0439)
- [`plugins/tax-billing/src/Invoices.php`](#e0449)
- [Supplemental complete source `app/Support/PluginAdministration.php`](#e0459)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0267"></a>

> Audit provenance: `platform.md` lines 136–143. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P11 Plugins/marketplace/tax billing

Installation-wide mutation needs manage_plugins AND plugin-administrator organization (`routes/web/admin.php:49-72`). Installed metadata/state, upload ZIP where enabled, activate/deactivate/delete confirmations, marketplace browse/connect/disconnect/install/update. Inputs connection token blank, upload plugin file, install activate flag. Never copy live token.

Lifecycle manifest/version/slug/archive checks; activation hooks+assets then active row; deactivation persists inactive even if hook fails, reports failure; uninstall releases reservations/permissions; update restores previous files on activation failure (`PluginService.php:129-315,361-382,619-714`). Replica arbitrary-plugin execution needs approved security design.

Extension points hooks/filters, menus/pages/runtime Vue bundles, tabs/widgets/page slots, validation/data, reports, webhooks, MCP. Hello-world demonstration UI not ERP functionality. All bundled plugin view controls retained in catalog.



<a id="e0268"></a>

> Audit provenance: `platform.md` lines 144–147. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Tax profile

mode generic(default)|india_gst; country required2 uppercase letters; issuer_name required max255; issuer_address required max2000; issuer_tax_id/region_code optional max80; tax_id_label required max50(default Tax registration); size_option required max50(defaultSize); shipping_taxable required boolean(false); gst_rate numeric0..100,max4decimals(default0); local_tax_label SGST|UTGST(defaultSGST); components1..10,distinct label required max50,rate numeric0..100,max4decimals(default Tax/0). India additionally countryIN,two-digit region,valid GSTIN format+matching region prefix; tax label GSTIN (`plugins/tax-billing/src/Profile.php:15-61`).



<a id="e0269"></a>

> Audit provenance: `platform.md` lines 148–151. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Tax invoice

Issued snapshot OR issue form: confirmed false(must accepted); supply_country required2 uppercase; region_code optional max80; items keyed order item IDs, hsn_code optional max20 at controller but India service adds requirement; unit required alphanumeric max10(defaultNOS). Display snapshot number/date/total/components/download PDF. Validate identity/totals in service; don't recompute issued invoice on later download from changed live product/profile. Exact controls `plugins/tax-billing/ui/src/Invoice.vue:4-45`,server `src/Controller.php:56-69`,service Invoices.php in catalog. This is document generation, not verified tax filing/GST certification/e-invoicing integration.



<a id="e0280"></a>

> Audit provenance: `platform-source-catalog.md` lines 9–18. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/hello-world/ui/src/HelloWorldBanner.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
12: const dismissed = ref(false);
```



<a id="e0281"></a>

> Audit provenance: `platform-source-catalog.md` lines 19–34. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/hello-world/ui/src/HelloWorldPage.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
18: const pageTitle = computed(() => props.title === 'Hello World' ? t('title') : props.title);
```

**Displayed data/value expressions:**
```text
29: pageTitle
37: name ? t('pageGreeting', { name }) : t('anonymousGreeting')
```



<a id="e0282"></a>

> Audit provenance: `platform-source-catalog.md` lines 35–44. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/hello-world/ui/src/HelloWorldTab.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Displayed data/value expressions:**
```text
11: sku ? t('greeting', { name: sku }) : t('productGreeting')
```



<a id="e0283"></a>

> Audit provenance: `platform-source-catalog.md` lines 45–54. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/hello-world/ui/src/HelloWorldWidget.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Displayed data/value expressions:**
```text
16: formatNumber(productCount)
```



<a id="e0284"></a>

> Audit provenance: `platform-source-catalog.md` lines 55–70. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/tax-billing/ui/src/CustomerFields.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `plugins/tax-billing/ui/src/CustomerFields.vue:10`: `<input v-model="fields.region_code" :maxlength="mode === 'india_gst' ? 2 : 80" />`

**View filters, permission/action and navigation anchors:**
```js
5: const fields = computed(() => props.form.plugin_fields.tax_billing);
```

**Displayed data/value expressions:**
```text
9: mode === 'india_gst' ? t('customerGstHelp') : t('customerTaxHelp')
11: form.errors['plugin_fields.tax_billing.region_code']
```



<a id="e0285"></a>

> Audit provenance: `platform-source-catalog.md` lines 71–80. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/tax-billing/ui/src/CustomerTaxDetails.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Displayed data/value expressions:**
```text
5: customer.metadata.tax_billing.region_code
```



<a id="e0286"></a>

> Audit provenance: `platform-source-catalog.md` lines 81–107. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/tax-billing/ui/src/Invoice.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `plugins/tax-billing/ui/src/Invoice.vue:23`: `<input v-model="form.supply_country" maxlength="2" @input="form.supply_country = form.supply_country.toUpperCase()" />`
- `plugins/tax-billing/ui/src/Invoice.vue:24`: `<input v-model="form.region_code" />`
- `plugins/tax-billing/ui/src/Invoice.vue:33`: `<input v-model="form.items[item.id].hsn_code" :aria-label="t('hsnFor', { sku: item.sku })" />`
- `plugins/tax-billing/ui/src/Invoice.vue:34`: `<input v-model="form.items[item.id].unit" :aria-label="t('unitFor', { sku: item.sku })" />`
- `plugins/tax-billing/ui/src/Invoice.vue:39`: `<input v-model="form.confirmed" type="checkbox" />`

**Form initial state/defaults:**
```js
5: const form = useForm({ confirmed: false, region_code: props.regionCode || '', supply_country: props.supplyCountry || '', items: Object.fromEntries(props.items.map(item => [item.id, { hsn_code: '', unit: 'NOS' }])) });
```

**Displayed data/value expressions:**
```text
13: snapshot.number
16: component.label
16: formatMoney(component.amount, snapshot.currency)
31: item.product_name
31: item.sku
31: formatNumber(item.quantity)
31: formatMoney(item.unit_price, order.currency)
33: profile.mode === 'india_gst' ? t('hsnRequired') : t('hsnOptional')
38: error
```



<a id="e0287"></a>

> Audit provenance: `platform-source-catalog.md` lines 108–112. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/tax-billing/ui/src/InvoiceLink.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.



<a id="e0288"></a>

> Audit provenance: `platform-source-catalog.md` lines 113–147. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/tax-billing/ui/src/Settings.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `plugins/tax-billing/ui/src/Settings.vue:19`: `<select v-model="form.mode" @change="setMode">`
- `plugins/tax-billing/ui/src/Settings.vue:20`: `<input v-model="form.country" maxlength="2" placeholder="IN, GB, CA" @input="form.country = form.country.toUpperCase()" />`
- `plugins/tax-billing/ui/src/Settings.vue:21`: `<input v-model="form.issuer_name" autocomplete="organization" />`
- `plugins/tax-billing/ui/src/Settings.vue:22`: `<input v-model="form.issuer_tax_id" />`
- `plugins/tax-billing/ui/src/Settings.vue:23`: `<input v-model="form.region_code" />`
- `plugins/tax-billing/ui/src/Settings.vue:24`: `<input v-model="form.tax_id_label" :placeholder="t('taxIdentifierPlaceholder')" />`
- `plugins/tax-billing/ui/src/Settings.vue:25`: `<textarea v-model="form.issuer_address" rows="3" autocomplete="street-address" />`
- `plugins/tax-billing/ui/src/Settings.vue:26`: `<input v-model="form.size_option" />`
- `plugins/tax-billing/ui/src/Settings.vue:28`: `<input v-model="form.shipping_taxable" type="checkbox" />`
- `plugins/tax-billing/ui/src/Settings.vue:34`: `<input v-model="form.gst_rate" type="number" min="0" max="100" step="0.0001" />`
- `plugins/tax-billing/ui/src/Settings.vue:35`: `<select v-model="form.local_tax_label">`
- `plugins/tax-billing/ui/src/Settings.vue:42`: `<input v-model="component.label" />`
- `plugins/tax-billing/ui/src/Settings.vue:43`: `<input v-model="component.rate" type="number" min="0" max="100" step="0.0001" />`

**Form initial state/defaults:**
```js
5: const form = useForm(JSON.parse(JSON.stringify(props.profile)));
```

**Select option values/labels (dynamic options retain their source):**
```html
19: <option value="generic">{{ t('customCountryProfile') }}</option>
19: <option value="india_gst">{{ t('indiaProfile') }}</option>
35: <option>SGST</option>
35: <option>UTGST</option>
```

**Displayed data/value expressions:**
```text
48: error
```



<a id="e0324"></a>

> Audit provenance: `platform-source-catalog.md` lines 1282–1332. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Plugins/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Plugins/Index.vue:201`: `<Input v-model="connectForm.token" type="password" :invalid="!!connectForm.errors.token" />`
- `resources/js/Pages/Plugins/Index.vue:327`: `<input ref="fileInput" id="plugin-upload" type="file" accept=".zip" @change="handleFileSelect" />`

**Form initial state/defaults:**
```js
40: const connectForm = useForm({ token: '' });
86: const uploadForm = useForm({
87:     plugin: null,
88: });
```

**View filters, permission/action and navigation anchors:**
```js
23: const { hasPermission } = usePermissions();
24: const hasManagePermission = hasPermission('manage_plugins');
41: const busySlug = ref(null);
44: connectForm.post(route('plugins.marketplace.connect'), {
51: if (confirm(t('plugins.marketplace.confirmDisconnect'))) {
52: router.delete(route('plugins.marketplace.disconnect'), { preserveScroll: true });
58: router.post(route('plugins.marketplace.install', slug), { activate }, {
66: router.post(route('plugins.marketplace.update', slug), {}, {
90: const fileInput = ref(null);
91: const isDragging = ref(false);
111: uploadForm.post(route('plugins.upload'), {
123: router.post(route('plugins.activate', slug), {}, {
129: router.post(route('plugins.deactivate', slug), {}, {
135: if (confirm(t('plugins.confirmDelete', { name }))) {
136: router.delete(route('plugins.destroy', slug), {
```

**Displayed data/value expressions:**
```text
208: connectForm.processing ? t('plugins.marketplace.connecting') : t('plugins.marketplace.connect')
211: connectForm.errors.token
217: marketplace.error
231: item.name
232: priceLabel(item)
237: item.summary
241: item.requires
242: item.author
255: marketplace.connected ? t('plugins.marketplace.notOwned') : t('plugins.marketplace.needsPurchase')
353: plugin.name
356: plugin.is_active ? t('common.active') : t('common.inactive')
360: plugin.description
372: plugin.author
375: plugin.author
```



<a id="e0389"></a>

> Audit provenance: `platform-source-catalog.md` lines 3849–3863. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/PluginController.php`
```php
34:     public function __construct(PluginService $pluginService)
42:     public function index(): Response
46:         return Inertia::render('Plugins/Index', [
60:     public function upload(Request $request): RedirectResponse
67:         $request->validate([
68:             'plugin' => 'required|file|mimes:zip|mimetypes:application/zip,application/x-zip-compressed|max:'.config('limits.uploads.plugin_max_kb'),
69:             'signature' => 'nullable|string|max:1024',
70:         ]);
93:     public function activate(string $slug): RedirectResponse
116:     public function deactivate(string $slug): RedirectResponse
141:     public function destroy(string $slug): RedirectResponse
```



<a id="e0390"></a>

> Audit provenance: `platform-source-catalog.md` lines 3864–3882. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/PluginMarketplaceController.php`
```php
26:     public function __construct(
32:     public function index(Request $request): Response
53:         $plugins = array_map(function (array $entry) {
79:         return Inertia::render('Plugins/Index', [
95:     public function connect(Request $request): RedirectResponse
97:         $validated = $request->validate([
98:             'token' => ['required', 'string', 'max:255'],
99:         ]);
116:         ])->save();
126:     public function disconnect(Request $request): RedirectResponse
131:         ])->save();
138:     public function install(Request $request, string $slug): RedirectResponse
155:     public function update(Request $request, string $slug): RedirectResponse
158:             $result = $this->installer->update($request->user()->organization, $slug);
173:     private function safeUrl(mixed $url, bool $httpsOnly = false): ?string
```



<a id="e0426"></a>

> Audit provenance: `platform-source-catalog.md` lines 4652–4671. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/tax-billing/src/Controller.php`
```php
20:     public function save(Request $request): RedirectResponse
28:     public static function order(Request $request): Order
31:         abort_unless(ctype_digit($id), 404);
38:     public function edit(Request $request): InertiaResponse
43:         return Inertia::render('Plugin::tax-billing/Invoice', [
56:     public function issue(Request $request): RedirectResponse
58:         $input = $request->validate([
59:             'confirmed' => ['accepted'], 'region_code' => ['nullable', 'string', 'max:80'],
60:             'supply_country' => ['required', 'regex:/^[A-Z]{2}$/'],
61:             'items' => ['required', 'array'], 'items.*.hsn_code' => ['nullable', 'string', 'max:20'],
62:             'items.*.unit' => ['required', 'string', 'max:10', 'regex:/^[A-Za-z0-9]+$/'],
63:         ], [], array_replace(__('tax-billing::messages.attributes'), [
64:             'region_code' => __('tax-billing::messages.supplyRegionCode'),
65:         ]));
72:     public function download(Request $request): Response
76:         abort_unless(is_array($snapshot), 404);
```



<a id="e0427"></a>

> Audit provenance: `platform-source-catalog.md` lines 4672–4685. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/tax-billing/src/Invoices.php`
```php
15:     public const SNAPSHOT = 'tax_billing_invoice';
16: 
17:     public function issue(Order $order, array $input, int $userId): array
18:     {
19:         return DB::transaction(function () use ($order, $input, $userId) {
20:             $locked = Order::where('organization_id', $order->organization_id)->whereKey($order->id)->lockForUpdate()->firstOrFail();
21:             if (isset($locked->metadata[self::SNAPSHOT])) {
93:             $locked->forceFill(['metadata' => array_replace($locked->metadata ?? [], [self::SNAPSHOT => $snapshot, 'invoice_document_provider' => 'tax-billing'])])->save();
99:     private function rows(Order $order, array $profile, array $input): array
152:     private function allocateTax(array $components, string $tax, string $rate): array
```



<a id="e0428"></a>

> Audit provenance: `platform-source-catalog.md` lines 4686–4724. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/tax-billing/src/Profile.php`
```php
13:     public const KEY = 'tax-billing.profile';
14: 
15:     public const DEFAULTS = [
16:         'mode' => 'generic', 'country' => '', 'issuer_name' => '', 'issuer_address' => '',
17:         'issuer_tax_id' => '', 'region_code' => '', 'tax_id_label' => 'Tax registration',
18:         'gst_rate' => '0', 'size_option' => 'Size', 'shipping_taxable' => false,
19:         'local_tax_label' => 'SGST',
20:         'components' => [['label' => 'Tax', 'rate' => '0']],
21:     ];
23:     public static function get(int $organizationId): array
30:     public static function validate(array $data): array
32:         $validated = Validator::make($data, [
33:             'mode' => ['required', Rule::in(['generic', 'india_gst'])],
34:             'country' => ['required', 'regex:/^[A-Z]{2}$/'],
35:             'issuer_name' => ['required', 'string', 'max:255'],
36:             'issuer_address' => ['required', 'string', 'max:2000'],
37:             'issuer_tax_id' => ['nullable', 'string', 'max:80'],
38:             'region_code' => ['nullable', 'string', 'max:80'],
39:             'tax_id_label' => ['required', 'string', 'max:50'],
40:             'size_option' => ['required', 'string', 'max:50'],
41:             'shipping_taxable' => ['required', 'boolean'],
42:             'gst_rate' => ['required', 'numeric', 'decimal:0,4', 'between:0,100'],
43:             'local_tax_label' => ['required', Rule::in(['SGST', 'UTGST'])],
44:             'components' => ['required', 'array', 'min:1', 'max:10'],
45:             'components.*.label' => ['required', 'string', 'max:50', 'distinct'],
46:             'components.*.rate' => ['required', 'numeric', 'decimal:0,4', 'between:0,100'],
47:         ], [], __('tax-billing::messages.attributes'))->validate();
48: 
50:             Validator::make($validated, [
51:                 'country' => ['in:IN'],
52:                 'region_code' => ['required', 'regex:/^[0-9]{2}$/'],
53:                 'issuer_tax_id' => ['required', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/'],
54:             ], [], __('tax-billing::messages.attributes'))->after(function ($validator) use ($validated) {
58:             })->validate();
59:             $validated['tax_id_label'] = 'GSTIN';
```



<a id="e0439"></a>

> Audit provenance: `platform-source-catalog.md` lines 5462–5553. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `plugins/tax-billing/Plugin.php:1-88`
```php
1: <?php
2: 
3: use App\Http\Middleware\EnsurePluginActive;
4: use App\Models\Plugin;
5: use Illuminate\Support\Facades\Route;
6: use Inventoros\Plugins\TaxBilling\Controller;
7: use Inventoros\Plugins\TaxBilling\Invoices;
8: use Inventoros\Plugins\TaxBilling\Profile;
9: 
10: require_once __DIR__.'/src/Profile.php';
11: require_once __DIR__.'/src/Invoices.php';
12: require_once __DIR__.'/src/Controller.php';
13: 
14: return function (): void {
15:     app('view')->addNamespace('tax-billing', __DIR__.'/views');
16:     app('translator')->addNamespace('tax-billing', __DIR__.'/lang');
17:     foreach (['issue' => 'Issue tax invoices', 'manage' => 'Manage tax billing profiles'] as $ability => $label) {
18:         register_permission('tax-billing.'.$ability, $label, 'Tax billing');
19:     }
20: 
21:     Route::middleware(['web', 'auth', EnsurePluginActive::class.':tax-billing'])->group(function () {
22:         Route::post('/p/tax-billing/settings', [Controller::class, 'save'])->middleware('permission:tax-billing.manage')->name('plg.tax-billing.save');
23:         Route::get('/p/tax-billing/orders/{orderId}', [Controller::class, 'edit'])->whereNumber('orderId')->middleware('permission:view_orders')->name('plg.tax-billing.invoice');
24:         Route::post('/p/tax-billing/orders/{orderId}/issue', [Controller::class, 'issue'])->whereNumber('orderId')->middleware('permission:view_orders|tax-billing.issue,all')->name('plg.tax-billing.issue');
25:         Route::get('/p/tax-billing/orders/{orderId}/download', [Controller::class, 'download'])->whereNumber('orderId')->middleware('permission:view_orders')->name('plg.tax-billing.download');
26:     });
27: 
28:     register_page('plg.tax-billing.settings', 'Plugin::tax-billing/Settings', [
29:         'uri' => '/p/tax-billing/settings', 'title' => 'Tax billing', 'permission' => 'tax-billing.manage',
30:         'middleware' => [EnsurePluginActive::class.':tax-billing'],
31:         'props' => fn ($request, $user) => ['profile' => Profile::get((int) $user->organization_id), 'saveUrl' => route('plg.tax-billing.save')],
32:     ]);
33: 
34:     register_menu_item(['label' => 'Tax billing', 'label_key' => 'plugins.tax-billing.title', 'route' => 'plg.tax-billing.settings', 'icon' => 'FileText', 'permission' => 'tax-billing.manage', 'group' => 'settings']);
35:     add_page_component('orders.show', 'actions', [
36:         'plugin' => 'tax-billing', 'component' => 'InvoiceLink', 'permission' => 'view_orders',
37:         'data' => fn ($user) => ['url' => route('plg.tax-billing.invoice', ['orderId' => request()->route('order')?->id])],
38:     ]);
39: 
40:     foreach (['customers.create', 'customers.edit'] as $page) {
41:         add_page_component($page, 'business-details', ['plugin' => 'tax-billing', 'component' => 'CustomerFields', 'data' => fn ($user) => ['mode' => Profile::get((int) $user->organization_id)['mode']]]);
42:     }
43:     add_page_component('customers.show', 'business-details', ['plugin' => 'tax-billing', 'component' => 'CustomerTaxDetails']);
44:     add_filter('customer_form_data', function ($values, $customer) {
45:         return $values + ['tax_billing' => ['region_code' => $customer?->metadata['tax_billing']['region_code'] ?? '']];
46:     });
47:     foreach (['customer_store_validation_rules', 'customer_update_validation_rules'] as $hook) {
48:         add_filter($hook, function ($rules) {
49:             $profile = Profile::get((int) auth()->user()->organization_id);
50:             if ($profile['mode'] === 'india_gst') {
51:                 $rules['tax_id'] = ['nullable', 'regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i'];
52:             }
53: 
54:             return $rules + ['plugin_fields.tax_billing.region_code' => $profile['mode'] === 'india_gst'
55:                 ? ['nullable', 'regex:/^[0-9]{2}$/'] : ['nullable', 'string', 'max:80']];
56:         });
57:     }
58:     add_filter('customer_store_data', function ($data) {
59:         if (isset($data['tax_id']) && Profile::get((int) auth()->user()->organization_id)['mode'] === 'india_gst') {
60:             $data['tax_id'] = strtoupper(trim($data['tax_id']));
61:         }
62:         if (isset($data['plugin_fields']['tax_billing'])) {
63:             $data['metadata'] = array_replace($data['metadata'] ?? [], ['tax_billing' => $data['plugin_fields']['tax_billing']]);
64:         }
65: 
66:         return $data;
67:     });
68:     add_filter('customer_update_data', function ($data, $customer) {
69:         if (isset($data['tax_id']) && Profile::get((int) $customer->organization_id)['mode'] === 'india_gst') {
70:             $data['tax_id'] = strtoupper(trim($data['tax_id']));
71:         }
72:         if (isset($data['plugin_fields']['tax_billing'])) {
73:             $data['metadata'] = array_replace($customer->metadata ?? [], $data['metadata'] ?? [], ['tax_billing' => $data['plugin_fields']['tax_billing']]);
74:         }
75: 
76:         return $data;
77:     });
78: 
79:     add_filter('order_invoice_document', function ($document, $provider, $order) {
80:         if ($provider === 'tax-billing' && isset($order->metadata[Invoices::SNAPSHOT])
81:             && Plugin::where('slug', 'tax-billing')->where('is_active', true)->exists()) {
82:             return ['view' => 'tax-billing::invoice', 'data' => ['invoice' => $order->metadata[Invoices::SNAPSHOT]]];
83:         }
84: 
85:         return $document;
86:     });
87: 
88: };
```



<a id="e0449"></a>

> Audit provenance: `platform-source-catalog.md` lines 7475–7655. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `plugins/tax-billing/src/Invoices.php`

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace Inventoros\Plugins\TaxBilling;
6: 
7: use App\Models\Order\Order;
8: use App\Services\Documents\OrderInvoiceNumberService;
9: use App\Support\Money;
10: use Illuminate\Support\Facades\DB;
11: use Illuminate\Validation\ValidationException;
12: 
13: final class Invoices
14: {
15:     public const SNAPSHOT = 'tax_billing_invoice';
16: 
17:     public function issue(Order $order, array $input, int $userId): array
18:     {
19:         return DB::transaction(function () use ($order, $input, $userId) {
20:             $locked = Order::where('organization_id', $order->organization_id)->whereKey($order->id)->lockForUpdate()->firstOrFail();
21:             if (isset($locked->metadata[self::SNAPSHOT])) {
22:                 return $locked->metadata[self::SNAPSHOT];
23:             }
24:             if ($locked->status->value === 'cancelled' || in_array($locked->getRawOriginal('approval_status'), ['pending', 'rejected'], true)) {
25:                 throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.cancelledOrder')]);
26:             }
27:             $profile = Profile::validate(Profile::get((int) $locked->organization_id));
28:             $locked->load(['items.variant' => fn ($query) => $query->withTrashed(), 'customer' => fn ($query) => $query->withTrashed()]);
29:             if ($locked->items->isEmpty()) {
30:                 throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.noLines')]);
31:             }
32:             $rows = $this->rows($locked, $profile, $input);
33:             $region = trim((string) ($input['region_code'] ?? ''));
34:             $customerTaxId = trim((string) ($locked->customer?->tax_id ?? ''));
35:             $billingAddress = $locked->customer?->billing_address
36:                 ? implode("\n", array_filter([$locked->customer->billing_address, $locked->customer->billing_city, $locked->customer->billing_state, $locked->customer->billing_zip_code, $locked->customer->billing_country]))
37:                 : $locked->customer_address;
38:             $base = Money::subtract($locked->subtotal, $locked->discount_amount);
39:             if ($profile['shipping_taxable']) {
40:                 $base = Money::add($base, $locked->shipping);
41:             }
42:             if (Money::isNegative($base) || Money::isNegative($locked->tax) || Money::isNegative($locked->shipping)
43:                 || Money::compare(Money::add(Money::subtract($locked->subtotal, $locked->discount_amount), $locked->tax, $locked->shipping), $locked->total) !== 0
44:                 || Money::compare(Money::add(...array_column($rows, 'amount')), Money::subtract($locked->subtotal, $locked->discount_amount)) !== 0) {
45:                 throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.totalsMismatch')]);
46:             }
47:             $components = $profile['components'];
48:             if ($profile['mode'] === 'india_gst') {
49:                 if (blank($billingAddress)) {
50:                     throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.customerAddress')]);
51:                 }
52:                 if (($input['supply_country'] ?? '') !== 'IN') {
53:                     throw ValidationException::withMessages(['supply_country' => __('tax-billing::messages.domesticOnly')]);
54:                 }
55:                 if (! preg_match('/^[0-9]{2}$/', $region)) {
56:                     throw ValidationException::withMessages(['region_code' => __('tax-billing::messages.stateCode')]);
57:                 }
58:                 if ($customerTaxId !== '' && ! preg_match('/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/', $customerTaxId)) {
59:                     throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.customerGstin')]);
60:                 }
61:                 $half = bcdiv((string) $profile['gst_rate'], '2', 5);
62:                 $components = $region === $profile['region_code']
63:                     ? [['label' => 'CGST', 'rate' => $half], ['label' => $profile['local_tax_label'], 'rate' => $half]]
64:                     : [['label' => 'IGST', 'rate' => $profile['gst_rate']]];
65:             }
66:             $rate = '0';
67:             foreach ($components as $component) {
68:                 $rate = bcadd($rate, (string) $component['rate'], 5);
69:             }
70:             $expected = Money::percentOf($base, $rate);
71:             if (Money::compare(Money::subtract($locked->tax, $expected), '0.01') > 0
72:                 || Money::compare(Money::subtract($expected, $locked->tax), '0.01') > 0) {
73:                 throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.taxMismatch')]);
74:             }
75:             $components = $this->allocateTax($components, Money::of($locked->tax), $rate);
76:             $number = app(OrderInvoiceNumberService::class)->ensureAssigned($locked);
77:             if ($profile['mode'] === 'india_gst' && ! preg_match('/^[A-Za-z0-9\/-]{1,16}$/', $number)) {
78:                 throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.invoiceNumber')]);
79:             }
80:             $snapshot = [
81:                 'number' => $number, 'issued_at' => now()->toIso8601String(), 'issued_by' => $userId,
82:                 'issued_date' => now()->timezone($locked->organization?->timezone ?? 'UTC')->toDateString(),
83:                 'order_number' => $locked->order_number, 'profile' => $profile,
84:                 'customer_name' => $locked->customer_name, 'customer_address' => $billingAddress,
85:                 'delivery_address' => $locked->customer_address,
86:                 'customer_tax_id' => $customerTaxId, 'region_code' => $region,
87:                 'supply_country' => $input['supply_country'] ?? $profile['country'],
88:                 'currency' => $locked->currency, 'rows' => $rows, 'components' => $components,
89:                 'subtotal' => Money::of($locked->subtotal), 'discount' => Money::of($locked->discount_amount),
90:                 'taxable_value' => $base, 'tax' => Money::of($locked->tax),
91:                 'shipping' => Money::of($locked->shipping), 'total' => Money::of($locked->total),
92:             ];
93:             $locked->forceFill(['metadata' => array_replace($locked->metadata ?? [], [self::SNAPSHOT => $snapshot, 'invoice_document_provider' => 'tax-billing'])])->save();
94: 
95:             return $snapshot;
96:         });
97:     }
98: 
99:     private function rows(Order $order, array $profile, array $input): array
100:     {
101:         $rows = [];
102:         foreach ($order->items as $item) {
103:             $details = $input['items'][$item->id] ?? [];
104:             $hsn = trim((string) ($details['hsn_code'] ?? ''));
105:             if ($profile['mode'] === 'india_gst' && ! preg_match('/^(?:[0-9]{4}|[0-9]{6}|[0-9]{8})$/', $hsn)) {
106:                 throw ValidationException::withMessages(["items.{$item->id}.hsn_code" => __('tax-billing::messages.hsnCode')]);
107:             }
108:             if ($item->quantity < 1 || Money::isNegative($item->unit_price) || Money::isNegative($item->discount_amount)
109:                 || Money::compare($item->discount_amount, $item->subtotal) > 0
110:                 || Money::compare(Money::multiply($item->unit_price, $item->quantity), $item->subtotal) !== 0) {
111:                 throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.inconsistentLines')]);
112:             }
113:             $unit = trim((string) ($details['unit'] ?? 'NOS'));
114:             $size = '';
115:             $otherOptions = [];
116:             foreach ($item->variant?->option_values ?? [] as $key => $value) {
117:                 if (mb_strtolower($key) === mb_strtolower($profile['size_option'])) {
118:                     $size = (string) $value;
119:                 } else {
120:                     $otherOptions[$key] = $value;
121:                 }
122:             }
123:             ksort($otherOptions);
124:             $key = json_encode([$item->product_id ?? $item->id, $item->unit_price, $hsn, $unit, $otherOptions]);
125:             $rows[$key] ??= [
126:                 'name' => $item->product_name, 'hsn_code' => $hsn, 'unit' => $unit,
127:                 'options' => $otherOptions,
128:                 'unit_price' => $item->unit_price, 'quantity' => 0, 'amount' => '0.00', 'sizes' => [], 'skus' => [],
129:             ];
130:             $rows[$key]['quantity'] += $item->quantity;
131:             $rows[$key]['amount'] = Money::add($rows[$key]['amount'], Money::subtract($item->subtotal, $item->discount_amount));
132:             $rows[$key]['sizes'][$size ?: 'Standard'] = ($rows[$key]['sizes'][$size ?: 'Standard'] ?? 0) + $item->quantity;
133:             $rows[$key]['skus'][] = $item->sku;
134:         }
135: 
136:         $rows = array_values($rows);
137:         $discount = $order->orderDiscountAmount();
138:         if (! Money::isZero($discount)) {
139:             $net = Money::add(...array_column($rows, 'amount'));
140:             if (Money::compare($discount, $net) > 0 || Money::isNegative($discount)) {
141:                 throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.discountExceeded')]);
142:             }
143:             $allocations = $this->allocateTax(array_map(fn ($row) => ['rate' => $row['amount']], $rows), $discount, $net);
144:             foreach ($rows as $index => &$row) {
145:                 $row['amount'] = Money::subtract($row['amount'], $allocations[$index]['amount']);
146:             }
147:         }
148: 
149:         return $rows;
150:     }
151: 
152:     private function allocateTax(array $components, string $tax, string $rate): array
153:     {
154:         if (bccomp($rate, '0', 5) === 0 && ! Money::isZero($tax)) {
155:             throw ValidationException::withMessages(['invoice' => __('tax-billing::messages.zeroRate')]);
156:         }
157:         $remaining = (int) bcmul($tax, '100', 0);
158:         $shares = [];
159:         foreach ($components as $index => $component) {
160:             $raw = bccomp($rate, '0', 5) === 0 ? '0' : bcdiv(bcmul($tax, bcmul((string) $component['rate'], '100', 8), 8), $rate, 8);
161:             $whole = (int) $raw;
162:             $shares[$index] = ['cents' => $whole, 'fraction' => bcsub($raw, (string) $whole, 8)];
163:             $remaining -= $whole;
164:         }
165:         $indices = array_keys($shares);
166:         usort($indices, fn ($a, $b) => bccomp($shares[$b]['fraction'], $shares[$a]['fraction'], 8) ?: $a <=> $b);
167:         for ($index = 0; $index < $remaining; $index++) {
168:             $shares[$indices[$index % count($indices)]]['cents']++;
169:         }
170:         foreach ($components as $index => &$component) {
171:             $component['amount'] = bcdiv((string) $shares[$index]['cents'], '100', 2);
172:         }
173: 
174:         return $components;
175:     }
176: }
```



<a id="e0459"></a>

> Audit provenance: `platform-source-catalog.md` lines 10266–10324. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Supplemental complete source `app/Support/PluginAdministration.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Support;
6: 
7: use App\Models\Auth\Organization;
8: use App\Models\User;
9: 
10: /**
11:  * Who may change plugins on this installation.
12:  *
13:  * Plugins are installed for the whole installation: their files live in
14:  * /plugins, the `plugins` table has no organization, and an active plugin
15:  * runs PHP for every tenant. The manage_plugins permission, however, is
16:  * granted per organization. So on an installation with more than one
17:  * organization, plugin changes are limited to ONE organization, the plugin
18:  * administrator organization:
19:  *
20:  *  - INVENTOROS_PLUGIN_ADMIN_ORG (config plugins.admin_organization_id) when
21:  *    set, otherwise
22:  *  - the first organization created (the one the installer set up).
23:  *
24:  * Its users still need manage_plugins. Everyone else can browse plugins but
25:  * not install, update, activate, deactivate, upload or delete them.
26:  */
27: final class PluginAdministration
28: {
29:     public static function organizationId(): ?int
30:     {
31:         $configured = config('plugins.admin_organization_id');
32: 
33:         if (is_numeric($configured) && (int) $configured > 0) {
34:             return (int) $configured;
35:         }
36: 
37:         $first = Organization::query()->withoutGlobalScopes()->min('id');
38: 
39:         return $first === null ? null : (int) $first;
40:     }
41: 
42:     /**
43:      * Whether the user belongs to the plugin administrator organization.
44:      * The manage_plugins permission is checked separately.
45:      */
46:     public static function isAdministratorOrganization(?User $user): bool
47:     {
48:         $organizationId = self::organizationId();
49: 
50:         return $user !== null
51:             && $organizationId !== null
52:             && $user->organization_id !== null
53:             && (int) $user->organization_id === $organizationId;
54:     }
55: }
```

