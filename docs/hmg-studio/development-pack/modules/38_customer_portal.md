# 38. Customer Portal — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Customer Portal as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Customer login/invite/reset; portal enablement; dashboard; own-order detail/invoice; own returns/request lifecycle.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Customers](../modules/13_customers.md), [Orders, Payments and Documents](../modules/12_orders.md), [Returns / RMA](../modules/14_returns.md), [Authentication, Profile and Account](../modules/32_auth_account.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Portal/Auth/AcceptInvitation.vue` | Pending | Pending |
| `resources/js/Pages/Portal/Auth/ForgotPassword.vue` | Pending | Pending |
| `resources/js/Pages/Portal/Auth/Login.vue` | Pending | Pending |
| `resources/js/Pages/Portal/Auth/ResetPassword.vue` | Pending | Pending |
| `resources/js/Pages/Portal/Dashboard.vue` | Pending | Pending |
| `resources/js/Pages/Portal/Orders/Index.vue` | Pending | Pending |
| `resources/js/Pages/Portal/Orders/Show.vue` | Pending | Pending |
| `resources/js/Pages/Portal/Returns/Create.vue` | Pending | Pending |
| `resources/js/Pages/Portal/Returns/Index.vue` | Pending | Pending |
| `resources/js/Pages/Portal/Returns/Show.vue` | Pending | Pending |

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

- [ ] Wrong customer or organization cannot read records/documents.
- [ ] no invented portal checkout/create-order flow.
- [ ] only eligible delivered-order returns accepted.
- [ ] pending return causes no stock movement until authorized staff receipt.

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

- [P10 Customer portal](#e0266)
- [`resources/js/Pages/Portal/Auth/AcceptInvitation.vue`](#e0325)
- [`resources/js/Pages/Portal/Auth/ForgotPassword.vue`](#e0326)
- [`resources/js/Pages/Portal/Auth/Login.vue`](#e0327)
- [`resources/js/Pages/Portal/Auth/ResetPassword.vue`](#e0328)
- [`resources/js/Pages/Portal/Dashboard.vue`](#e0329)
- [`resources/js/Pages/Portal/Orders/Index.vue`](#e0330)
- [`resources/js/Pages/Portal/Orders/Show.vue`](#e0331)
- [`resources/js/Pages/Portal/Returns/Create.vue`](#e0332)
- [`resources/js/Pages/Portal/Returns/Index.vue`](#e0333)
- [`resources/js/Pages/Portal/Returns/Show.vue`](#e0334)
- [`app/Http/Controllers/Portal/Auth/PortalInvitationController.php`](#e0409)
- [`app/Http/Controllers/Portal/Auth/PortalLoginController.php`](#e0410)
- [`app/Http/Controllers/Portal/Auth/PortalPasswordResetController.php`](#e0411)
- [`app/Http/Controllers/Portal/PortalController.php`](#e0412)
- [`app/Http/Controllers/Portal/PortalDashboardController.php`](#e0413)
- [`app/Http/Controllers/Portal/PortalOrderController.php`](#e0414)
- [`app/Http/Controllers/Portal/PortalReturnController.php`](#e0415)
- [Contract appendix `routes/portal.php:1-63`](#e0437)
- [Supplemental complete source `app/Services/Portal/PortalInvitationService.php`](#e0457)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0266"></a>

> Audit provenance: `platform.md` lines 126–135. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P10 Customer portal

`/portal/{organization}` dedicated customer guard/props; unknown/off org404; staff session isn't customer authority (`bootstrap/app.php:49-52,108-127`). Dashboard/login/forgot/reset/accept invitation; orders index/detail; returns index/create/detail. **No create-order/checkout route** in inspected portal routes.

Login email/password; reset token/email/password/confirmation; invitation fixed email+password/confirmation and signed expiring URL checked GET/POST (`routes/portal.php:20-45`).

Orders columns number/date/status/items/total/view. Detail product/variant/SKU/quantity/unit-price/line-total, totals, controller-permitted address/shipment/payment facts, invoice download, eligible return. Return list number/order/type/requested/status/refund; detail reason/notes/product/condition/quantity.

Return: type return|exchange(default return); reason required max1000; notes optional max2000; items1..200; distinct order_item_id integers; quantity integer1..1000000 further constrained by shared ReturnOrderService; condition new|used|damaged. Only own delivered orders. Submit positive selections, no zero lines. Creates pending request, **no stock movement**; staff approve/receive. Damaged defaults restock false. Service owns line identity/pricing/caps. Logs portal.return_requested+staff notification (`PortalReturnController.php:80-186`).



<a id="e0325"></a>

> Audit provenance: `platform-source-catalog.md` lines 1333–1352. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Auth/AcceptInvitation.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Portal/Auth/AcceptInvitation.vue:51`: `<TextInput id="password" v-model="form.password" type="password" required autofocus autocomplete="new-password" />`
- `resources/js/Pages/Portal/Auth/AcceptInvitation.vue:65`: `<TextInput id="password_confirmation" v-model="form.password_confirmation" type="password" required autocomplete="new-password" />`

**Form initial state/defaults:**
```js
23: const form = useForm({
24:     password: '',
25:     password_confirmation: '',
26: });
```

**View filters, permission/action and navigation anchors:**
```js
21: const orgName = computed(() => page.props.portal?.organization?.name ?? '');
29: form.post(props.acceptUrl, {
```



<a id="e0326"></a>

> Audit provenance: `platform-source-catalog.md` lines 1353–1374. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Auth/ForgotPassword.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Portal/Auth/ForgotPassword.vue:38`: `<TextInput id="email" v-model="form.email" type="email" required autofocus autocomplete="username" />`

**Form initial state/defaults:**
```js
17: const form = useForm({
18:     email: '',
19: });
```

**View filters, permission/action and navigation anchors:**
```js
22: form.post(route('portal.password.email'));
```

**Displayed data/value expressions:**
```text
32: status
```



<a id="e0327"></a>

> Audit provenance: `platform-source-catalog.md` lines 1375–1399. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Auth/Login.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Portal/Auth/Login.vue:44`: `<TextInput id="email" v-model="form.email" type="email" required autofocus autocomplete="username" />`
- `resources/js/Pages/Portal/Auth/Login.vue:58`: `<TextInput id="password" v-model="form.password" type="password" required autocomplete="current-password" />`

**Form initial state/defaults:**
```js
20: const form = useForm({
21:     email: '',
22:     password: '',
23: });
```

**View filters, permission/action and navigation anchors:**
```js
18: const orgName = computed(() => page.props.portal?.organization?.name ?? '');
26: form.post(route('portal.login.store'), {
```

**Displayed data/value expressions:**
```text
38: status
```



<a id="e0328"></a>

> Audit provenance: `platform-source-catalog.md` lines 1400–1421. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Auth/ResetPassword.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Portal/Auth/ResetPassword.vue:40`: `<TextInput id="email" v-model="form.email" type="email" required autocomplete="username" />`
- `resources/js/Pages/Portal/Auth/ResetPassword.vue:53`: `<TextInput id="password" v-model="form.password" type="password" required autofocus autocomplete="new-password" />`
- `resources/js/Pages/Portal/Auth/ResetPassword.vue:67`: `<TextInput id="password_confirmation" v-model="form.password_confirmation" type="password" required autocomplete="new-password" />`

**Form initial state/defaults:**
```js
18: const form = useForm({
19:     token: props.token,
20:     email: props.email,
21:     password: '',
22:     password_confirmation: '',
23: });
```

**View filters, permission/action and navigation anchors:**
```js
26: form.post(route('portal.password.store'), {
```



<a id="e0329"></a>

> Audit provenance: `platform-source-catalog.md` lines 1422–1447. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Dashboard.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
62: {{ t('portal.orders.number') }}
63: {{ t('portal.orders.date') }}
64: {{ t('portal.orders.status') }}
65: {{ t('portal.orders.total') }}
```

**View filters, permission/action and navigation anchors:**
```js
21: const contact = computed(() => page.props.portal?.contact ?? {});
22: const orgName = computed(() => page.props.portal?.organization?.name ?? '');
```

**Displayed data/value expressions:**
```text
76: order.order_number
79: formatDay(order.order_date)
82: formatMoney(order.total, order.currency)
```



<a id="e0330"></a>

> Audit provenance: `platform-source-catalog.md` lines 1448–1475. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Orders/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
35: {{ t('portal.orders.number') }}
36: {{ t('portal.orders.date') }}
37: {{ t('portal.orders.status') }}
38: {{ t('portal.orders.items') }}
39: {{ t('portal.orders.total') }}
40: {{ t('portal.orders.view') }}
```

**View filters, permission/action and navigation anchors:**
```js
19: const orgName = computed(() => page.props.portal?.organization?.name ?? '');
```

**Displayed data/value expressions:**
```text
51: order.order_number
54: formatDay(order.order_date)
56: order.items_count
58: formatMoney(order.total, order.currency)
```



<a id="e0331"></a>

> Audit provenance: `platform-source-catalog.md` lines 1476–1533. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Orders/Show.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
101: {{ t('portal.order.product') }}
102: {{ t('portal.order.quantity') }}
103: {{ t('portal.order.unitPrice') }}
104: {{ t('portal.order.lineTotal') }}
```

**View filters, permission/action and navigation anchors:**
```js
24: const shipments = computed(() => props.order.shipments || []);
40: const hasDiscount = computed(() => Number(props.order.discount_amount || 0) > 0);
42: const paymentStatusLabel = computed(() => {
47: const progress = computed(() => [
```

**Displayed data/value expressions:**
```text
110: item.product_name
111: item.variant_title
112: money(item.unit_price)
114: item.sku
119: item.quantity
120: money(item.unit_price)
121: money(item.total)
130: money(order.subtotal)
135: Number(order.discount_value)
137: money(order.discount_amount)
141: money(order.tax)
145: money(order.shipping)
149: money(order.total)
166: [shipment.carrier_name, shipment.service].filter(Boolean).join(' ')
170: shipment.tracking_number
181: shipmentStatusLabel(shipment)
197: line.quantity
197: line.product_name
197: line.variant_title
197: line.sku
209: ret.return_number
211: formatDate(ret.created_at)
226: step.label
227: step.day ? formatDay(step.date) : formatDate(step.date)
236: paymentStatusLabel
242: formatDay(payment.paid_at)
243: payment.type === 'refund' ? t('portal.order.refund') : payment.method_label
245: payment.type === 'refund' ? '-' : ''
245: money(payment.amount)
252: money(order.amount_paid)
256: money(order.balance_due)
266: order.invoice_number
281: order.customer_address
```



<a id="e0332"></a>

> Audit provenance: `platform-source-catalog.md` lines 1534–1584. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Returns/Create.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Portal/Returns/Create.vue:105`: `<input v-model.number="lines[item.id].quantity" type="number" min="0" :max="item.returnable_quantity" :aria-label="&#96;${t('portal.returnForm.quantity')} ${item.product_name}&#96;" />`
- `resources/js/Pages/Portal/Returns/Create.vue:116`: `<select v-model="lines[item.id].condition" :aria-label="&#96;${t('portal.returnForm.condition')} ${item.product_name}&#96;" >`
- `resources/js/Pages/Portal/Returns/Create.vue:138`: `<select id="type" v-model="form.type">`
- `resources/js/Pages/Portal/Returns/Create.vue:146`: `<textarea id="reason" v-model="form.reason" rows="3" maxlength="1000" required :placeholder="t('portal.returnForm.reasonPlaceholder')" />`
- `resources/js/Pages/Portal/Returns/Create.vue:159`: `<textarea id="notes" v-model="form.notes" rows="2" maxlength="2000" :placeholder="t('portal.returnForm.notesPlaceholder')" />`

**Form initial state/defaults:**
```js
26: const form = useForm({
27:     type: 'return',
28:     reason: '',
29:     notes: '',
30:     items: [],
31: });
```

**Select option values/labels (dynamic options retain their source):**
```html
121: <option value="new">{{ t('portal.returnForm.conditions.new') }}</option>
122: <option value="used">{{ t('portal.returnForm.conditions.used') }}</option>
123: <option value="damaged">{{ t('portal.returnForm.conditions.damaged') }}</option>
139: <option value="return">{{ t('portal.returns.types.return') }}</option>
140: <option value="exchange">{{ t('portal.returns.types.exchange') }}</option>
```

**Visible table headers:**
```text
90: {{ t('portal.order.product') }}
91: {{ t('portal.returnForm.quantity') }}
92: {{ t('portal.returnForm.condition') }}
```

**View filters, permission/action and navigation anchors:**
```js
19: const returnable = computed(() => props.order.items.filter((item) => item.returnable_quantity > 0));
33: const selectionError = ref(null);
37: .filter((item) => Number(lines[item.id].quantity) > 0)
51: form.post(route('portal.returns.store', { order: props.order.id }));
```

**Displayed data/value expressions:**
```text
76: order.order_number
98: item.product_name
99: item.variant_title
101: item.sku
```



<a id="e0333"></a>

> Audit provenance: `platform-source-catalog.md` lines 1585–1608. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Returns/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
34: {{ t('portal.returns.number') }}
35: {{ t('portal.returns.order') }}
36: {{ t('portal.returns.type') }}
37: {{ t('portal.returns.requested') }}
38: {{ t('portal.returns.status') }}
39: {{ t('portal.returns.refund') }}
```

**Displayed data/value expressions:**
```text
50: ret.return_number
59: ret.order.order_number
62: typeLabel(ret.type)
63: formatDate(ret.created_at)
66: formatMoney(ret.refund_amount, ret.order?.currency)
```



<a id="e0334"></a>

> Audit provenance: `platform-source-catalog.md` lines 1609–1640. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Portal/Returns/Show.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
67: {{ t('portal.order.product') }}
68: {{ t('portal.returnShow.condition') }}
69: {{ t('portal.order.quantity') }}
```

**View filters, permission/action and navigation anchors:**
```js
19: const nextStep = computed(() => {
24: const typeLabel = computed(() => {
```

**Displayed data/value expressions:**
```text
75: item.product_name
76: item.variant_title
77: item.sku
79: conditionLabel(item.condition)
80: item.quantity
91: returnOrder.reason
94: returnOrder.notes
104: nextStep
108: formatDate(returnOrder.created_at)
112: formatMoney(returnOrder.refund_amount, returnOrder.order?.currency)
```



<a id="e0409"></a>

> Audit provenance: `platform-source-catalog.md` lines 4274–4289. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Portal/Auth/PortalInvitationController.php`
```php
31:     public function __construct(
36:     public function show(Request $request, string $contact): Response
40:         return Inertia::render('Portal/Auth/AcceptInvitation', [
47:     public function accept(Request $request, string $contact): RedirectResponse
51:         $validated = $request->validate([
52:             'password' => ['required', 'confirmed', Rules\Password::defaults()],
53:         ]);
59:         ])->save();
77:     private function resolve(Request $request, string $contactId): CustomerContact
81:         abort_unless($request->hasValidSignature(), 403, 'This invitation link is invalid or has expired.');
82:         abort_unless(ctype_digit($contactId), 403, 'This invitation link is invalid or has expired.');
88:         abort_unless(
```



<a id="e0410"></a>

> Audit provenance: `platform-source-catalog.md` lines 4290–4316. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Portal/Auth/PortalLoginController.php`
```php
35:     public const MAX_ATTEMPTS = 5;
36: 
37:     public const DECAY_SECONDS = 60;
38: 
39:     public function __construct(private readonly SecurityEventLogger $security) {}
40: 
41:     public function create(Request $request): Response
42:     {
43:         return Inertia::render('Portal/Auth/Login', [
44:             'status' => session('status'),
45:         ]);
48:     public function store(Request $request): RedirectResponse
52:         $credentials = $request->validate([
53:             'email' => ['required', 'string', 'email', 'max:255'],
54:             'password' => ['required', 'string', 'max:255'],
55:         ]);
95:     public function destroy(Request $request): RedirectResponse
111:     public static function recordLogin(SecurityEventLogger $security, CustomerContact $contact, string $via = 'password'): void
113:         $contact->forceFill(['last_login_at' => now()])->save();
128:     private function eligible(Builder $query, Organization $organization): void
138:     private function recordFailure(Organization $organization, string $email): void
162:     private function intended(Request $request, Organization $organization): string
174:     private function throttleKey(Organization $organization, string $email, string $ip): string
```



<a id="e0411"></a>

> Audit provenance: `platform-source-catalog.md` lines 4317–4343. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Portal/Auth/PortalPasswordResetController.php`
```php
31:     private const GENERIC_STATUS = 'If that email belongs to a portal account, we have emailed a password reset link.';
32: 
33:     public function request(): Response
34:     {
35:         return Inertia::render('Portal/Auth/ForgotPassword', [
36:             'status' => session('status'),
37:         ]);
40:     public function email(Request $request): RedirectResponse
44:         $validated = $request->validate([
45:             'email' => ['required', 'string', 'email', 'max:255'],
46:         ]);
55:     public function edit(Request $request, string $token): Response
57:         return Inertia::render('Portal/Auth/ResetPassword', [
63:     public function update(Request $request): RedirectResponse
67:         $validated = $request->validate([
68:             'token' => ['required', 'string'],
69:             'email' => ['required', 'string', 'email', 'max:255'],
70:             'password' => ['required', 'confirmed', Rules\Password::defaults()],
71:         ]);
79:             function (CustomerContact $contact, string $password) {
83:                 ])->save();
98:     private function broker(): PasswordBroker
110:     private function credentials(Organization $organization, string $email): array
```



<a id="e0412"></a>

> Audit provenance: `platform-source-catalog.md` lines 4344–4355. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Portal/PortalController.php`
```php
30:     protected function contact(Request $request): CustomerContact
40:     protected function orders(CustomerContact $contact): Builder
47:     protected function findOrder(CustomerContact $contact, int|string $id): Order
61:     protected function returns(CustomerContact $contact): Builder
74:     protected function invoiceAvailable(Order $order): bool
90:     protected function orderSummary(Order $order): array
108:     protected function returnSummary(ReturnOrder $returnOrder): array
129:     protected function lineSummary(OrderItem $item, int $alreadyReturned, int $shippedQuantity): array
```



<a id="e0413"></a>

> Audit provenance: `platform-source-catalog.md` lines 4356–4361. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Portal/PortalDashboardController.php`
```php
18:     public function __invoke(Request $request): Response
24:         return Inertia::render('Portal/Dashboard', [
```



<a id="e0414"></a>

> Audit provenance: `platform-source-catalog.md` lines 4362–4373. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Portal/PortalOrderController.php`
```php
31:     public function index(Request $request): Response
43:         return Inertia::render('Portal/Orders/Index', [
48:     public function show(Request $request, string $order, ReturnOrderService $returnsService): Response
83:         return Inertia::render('Portal/Orders/Show', [
119:     private function shipments(Order $order): array
156:     private function safeTrackingUrl(?string $url): ?string
171:     public function invoice(Request $request, string $order, DocumentPdfService $pdfs): HttpResponse
176:         abort_unless($this->invoiceAvailable($order), 404);
```



<a id="e0415"></a>

> Audit provenance: `platform-source-catalog.md` lines 4374–4400. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Portal/PortalReturnController.php`
```php
32:     public function index(Request $request): Response
43:         return Inertia::render('Portal/Returns/Index', [
48:     public function show(Request $request, string $returnOrder): Response
52:         abort_unless(ctype_digit($returnOrder), 404);
59:         return Inertia::render('Portal/Returns/Show', [
75:     public function create(Request $request, string $order, ReturnOrderService $returns): Response|RedirectResponse
89:         return Inertia::render('Portal/Returns/Create', [
102:     public function store(Request $request, string $order, ReturnOrderService $returns): RedirectResponse
111:         $validated = $request->validate([
112:             'type' => ['required', 'in:return,exchange'],
113:             'reason' => ['required', 'string', 'max:1000'],
114:             'notes' => ['nullable', 'string', 'max:2000'],
115:             'items' => ['required', 'array', 'min:1', 'max:200'],
116:             'items.*.order_item_id' => ['required', 'integer', 'distinct'],
117:             'items.*.quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
118:             'items.*.condition' => ['required', 'in:new,used,damaged'],
119:         ]);
130:         $returnOrder = $returns->create((int) $contact->organization_id, null, $validated + ['order_id' => $record->id]);
133:         NotificationService::createPortalReturnRequestedNotification($returnOrder, $record, $contact);
140:     private function notReturnable(Order $order): RedirectResponse
147:     private function recordRequest(Request $request, ReturnOrder $returnOrder, Order $order): void
151:         ActivityLog::create([
154:             'category' => ActivityLog::CATEGORY_AUDIT,
```



<a id="e0437"></a>

> Audit provenance: `platform-source-catalog.md` lines 5368–5434. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `routes/portal.php:1-63`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: use App\Http\Controllers\Portal\Auth\PortalInvitationController;
6: use App\Http\Controllers\Portal\Auth\PortalLoginController;
7: use App\Http\Controllers\Portal\Auth\PortalPasswordResetController;
8: use App\Http\Controllers\Portal\PortalDashboardController;
9: use App\Http\Controllers\Portal\PortalOrderController;
10: use App\Http\Controllers\Portal\PortalReturnController;
11: use Illuminate\Support\Facades\Route;
12: 
13: /*
14:  * Customer portal routes. Registered in bootstrap/app.php under the `portal`
15:  * middleware group with the prefix /portal/{organization} and the name
16:  * prefix `portal.`. The group resolves {organization} (404 when unknown or
17:  * the portal is off) and switches the default guard to `customer`.
18:  */
19: 
20: Route::middleware('portal.guest')->group(function () {
21:     Route::get('login', [PortalLoginController::class, 'create'])->name('login');
22:     Route::post('login', [PortalLoginController::class, 'store'])
23:         ->middleware('throttle:20,1')
24:         ->name('login.store');
25: 
26:     Route::get('forgot-password', [PortalPasswordResetController::class, 'request'])->name('password.request');
27:     Route::post('forgot-password', [PortalPasswordResetController::class, 'email'])
28:         ->middleware('throttle:5,1')
29:         ->name('password.email');
30:     Route::get('reset-password/{token}', [PortalPasswordResetController::class, 'edit'])->name('password.reset');
31:     Route::post('reset-password', [PortalPasswordResetController::class, 'update'])
32:         ->middleware('throttle:5,1')
33:         ->name('password.store');
34: });
35: 
36: // Invitation links are signed and expiring; the controller checks the
37: // signature itself so it can refuse with a 403 on both GET and POST.
38: Route::get('invitation/{contact}', [PortalInvitationController::class, 'show'])
39:     ->whereNumber('contact')
40:     ->middleware('throttle:30,1')
41:     ->name('invitation.show');
42: Route::post('invitation/{contact}', [PortalInvitationController::class, 'accept'])
43:     ->whereNumber('contact')
44:     ->middleware('throttle:10,1')
45:     ->name('invitation.accept');
46: 
47: Route::middleware('portal.auth')->group(function () {
48:     Route::get('/', PortalDashboardController::class)->name('dashboard');
49: 
50:     Route::get('orders', [PortalOrderController::class, 'index'])->name('orders.index');
51:     Route::get('orders/{order}', [PortalOrderController::class, 'show'])->whereNumber('order')->name('orders.show');
52:     Route::get('orders/{order}/invoice', [PortalOrderController::class, 'invoice'])->whereNumber('order')->name('orders.invoice');
53: 
54:     Route::get('orders/{order}/return', [PortalReturnController::class, 'create'])->whereNumber('order')->name('returns.create');
55:     Route::post('orders/{order}/return', [PortalReturnController::class, 'store'])
56:         ->whereNumber('order')
57:         ->middleware('throttle:10,1')
58:         ->name('returns.store');
59:     Route::get('returns', [PortalReturnController::class, 'index'])->name('returns.index');
60:     Route::get('returns/{returnOrder}', [PortalReturnController::class, 'show'])->whereNumber('returnOrder')->name('returns.show');
61: 
62:     Route::post('logout', [PortalLoginController::class, 'destroy'])->name('logout');
63: });
```



<a id="e0457"></a>

> Audit provenance: `platform-source-catalog.md` lines 10099–10242. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Supplemental complete source `app/Services/Portal/PortalInvitationService.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Services\Portal;
6: 
7: use App\Enums\SecurityEvent;
8: use App\Mail\PortalInvitationEmail;
9: use App\Models\Customer;
10: use App\Models\CustomerContact;
11: use App\Models\User;
12: use App\Services\SecurityEventLogger;
13: use Illuminate\Support\Facades\Mail;
14: use Illuminate\Support\Facades\URL;
15: use Illuminate\Support\Str;
16: 
17: /**
18:  * Invites customer contacts to the portal, and revokes them.
19:  *
20:  * The invitation link is a temporary signed URL that also carries the
21:  * contact's invited_at timestamp (`v`). Resending moves invited_at, so every
22:  * earlier link stops matching; accepting sets a password, after which the
23:  * link is refused; revoking sets revoked_at, which is refused too. The
24:  * signature covers the contact id, so a link cannot be pointed at another
25:  * contact.
26:  */
27: final class PortalInvitationService
28: {
29:     public const EXPIRES_IN_DAYS = 7;
30: 
31:     public function __construct(private readonly SecurityEventLogger $security) {}
32: 
33:     /**
34:      * Create (or re-invite) a contact for $customer and email them a link.
35:      */
36:     public function invite(Customer $customer, string $name, string $email, User $inviter): CustomerContact
37:     {
38:         $contact = CustomerContact::create([
39:             'organization_id' => $customer->organization_id,
40:             'customer_id' => $customer->id,
41:             'name' => $name,
42:             'email' => $email,
43:         ]);
44: 
45:         return $this->send($contact, $inviter);
46:     }
47: 
48:     /**
49:      * Issue a fresh invitation to an existing contact. Any earlier link stops
50:      * working. A revoked contact is reinstated as invited (no password) and
51:      * must set a new password through the link.
52:      */
53:     public function send(CustomerContact $contact, User $inviter): CustomerContact
54:     {
55:         $invitedAt = now()->startOfSecond();
56:         // A resend inside the same second as the previous invite would keep
57:         // the old link valid; step past it.
58:         if ($contact->invited_at !== null && $invitedAt->lessThanOrEqualTo($contact->invited_at)) {
59:             $invitedAt = $contact->invited_at->copy()->addSecond();
60:         }
61: 
62:         $wasRevoked = $contact->revoked_at !== null;
63: 
64:         $contact->forceFill([
65:             'invited_at' => $invitedAt,
66:             'invited_by' => $inviter->id,
67:             'revoked_at' => null,
68:             'password' => $wasRevoked ? null : $contact->password,
69:             'activated_at' => $wasRevoked ? null : $contact->activated_at,
70:             'remember_token' => $wasRevoked ? Str::random(60) : $contact->remember_token,
71:         ])->save();
72: 
73:         Mail::to($contact->email)->queue(new PortalInvitationEmail(
74:             $contact,
75:             $this->acceptUrl($contact),
76:             self::EXPIRES_IN_DAYS,
77:         ));
78: 
79:         $this->security->record(
80:             SecurityEvent::PORTAL_INVITE_SENT,
81:             $contact,
82:             $inviter,
83:             ['customer_id' => $contact->customer_id, 'email' => $contact->email],
84:         );
85: 
86:         return $contact;
87:     }
88: 
89:     /**
90:      * Revoke portal access: the contact can no longer sign in, any session
91:      * they hold ends on their next request, and outstanding invitation or
92:      * reset links stop working. The row is kept for the audit trail.
93:      */
94:     public function revoke(CustomerContact $contact, User $actor): void
95:     {
96:         $contact->forceFill([
97:             'revoked_at' => now(),
98:             'password' => null,
99:             'activated_at' => null,
100:             'remember_token' => Str::random(60),
101:         ])->save();
102: 
103:         $this->security->record(
104:             SecurityEvent::PORTAL_ACCESS_REVOKED,
105:             $contact,
106:             $actor,
107:             ['customer_id' => $contact->customer_id, 'email' => $contact->email],
108:         );
109:     }
110: 
111:     /**
112:      * The signed, expiring set-password link for the contact's current
113:      * invitation.
114:      */
115:     public function acceptUrl(CustomerContact $contact): string
116:     {
117:         return URL::temporarySignedRoute(
118:             'portal.invitation.show',
119:             ($contact->invited_at ?? now())->copy()->addDays(self::EXPIRES_IN_DAYS),
120:             [
121:                 'organization' => $contact->organization->slug,
122:                 'contact' => $contact->id,
123:                 'v' => $contact->invited_at?->getTimestamp(),
124:             ],
125:         );
126:     }
127: 
128:     /**
129:      * Whether $version (the `v` of a correctly signed link) is the contact's
130:      * current, still-acceptable invitation.
131:      */
132:     public function isCurrentInvitation(CustomerContact $contact, mixed $version): bool
133:     {
134:         return $contact->revoked_at === null
135:             && $contact->password === null
136:             && $contact->invited_at !== null
137:             && is_numeric($version)
138:             && (int) $version === $contact->invited_at->getTimestamp();
139:     }
140: }
```

