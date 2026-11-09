# 37. API Tokens, Webhooks and External Interfaces — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver API Tokens, Webhooks and External Interfaces as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Scoped token creation/revocation; show secret once; webhook definitions/events/delivery/retry/rotation; REST/MCP/GraphQL source parity disposition.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Settings/ApiTokens/Index.vue` | Pending | Pending |
| `resources/js/Pages/Settings/Webhooks/Index.vue` | Pending | Pending |
| `resources/js/Pages/Settings/Webhooks/Show.vue` | Pending | Pending |

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

- [ ] Tokens cannot exceed issuing user scope.
- [ ] secrets do not reappear in lists/logs.
- [ ] private/reserved webhook destinations rejected.
- [ ] retries reuse effect identity.
- [ ] external interfaces call the same Python command authorization instead of privileged bypass.

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

- [P13 External interface contracts](#e0271)
- [`resources/js/Pages/Settings/ApiTokens/Index.vue`](#e0357)
- [`resources/js/Pages/Settings/Webhooks/Index.vue`](#e0365)
- [`resources/js/Pages/Settings/Webhooks/Show.vue`](#e0366)
- [`app/Http/Requests/Webhook/StoreWebhookRequest.php`](#e0380)
- [`app/Http/Requests/Webhook/UpdateWebhookRequest.php`](#e0381)
- [`app/Http/Controllers/Admin/ApiTokenController.php`](#e0385)
- [`app/Http/Controllers/WebhookController.php`](#e0425)
- [Contract appendix `routes/ai.php:1-23`](#e0438)
- [Complete source contract `app/Mcp/Servers/InventorosServer.php`](#e0452)
- [Complete source contract `routes/api.php`](#e0453)
- [Complete source contract `app/Services/WebhookService.php`](#e0455)
- [Complete source contract `config/graphql.php`](#e0456)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0271"></a>

> Audit provenance: `platform.md` lines 158–161. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P13 External interface contracts

REST /api/v1 Sanctum bearer; GraphQL schema auth; MCP /mcp auth+throttle. Same user permissions and organization scopes; share workflow services, never privileged bypass. MCP selected identity/catalog/stock/order/payment/shipment/purchasing/approval/work-order reads+writes; don't assume every UI operation exposed. Registry `Mcp/Servers/InventorosServer.php:78-127`; `routes/ai.php:22-23`; REST `routes/api.php:77-89`; GraphQL `config/graphql.php:184`. UI/API differences explicit, not normalized by assumption.



<a id="e0357"></a>

> Audit provenance: `platform-source-catalog.md` lines 2553–2605. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/ApiTokens/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Settings/ApiTokens/Index.vue:227`: `<input id="api-token-name" v-model="form.name" type="text" maxlength="255" :placeholder="t('settings.apiTokens.namePlaceholder')" required />`
- `resources/js/Pages/Settings/ApiTokens/Index.vue:268`: `<input v-model="form.abilities" type="checkbox" :value="permission.value" />`

**Form initial state/defaults:**
```js
45: const form = useForm({
46:     name: '',
47:     abilities: [],
48: });
```

**Visible table headers:**
```text
160: {{ t('settings.apiTokens.name') }}
161: {{ t('settings.apiTokens.abilities') }}
162: {{ t('settings.apiTokens.lastUsed') }}
163: {{ t('settings.apiTokens.created') }}
164: {{ t('common.actions') }}
```

**View filters, permission/action and navigation anchors:**
```js
24: const revealedToken = computed(() => page.props.flash?.newApiToken ?? null);
25: const copied = ref(false);
39: const allAbilityValues = computed(() =>
42: const hasAbilities = computed(() => allAbilityValues.value.length > 0);
44: const showCreateModal = ref(false);
62: form.post(route('settings.api-tokens.store'), {
72: ? form.abilities.filter((value) => !values.includes(value))
87: const abilityErrors = computed(() =>
89: .filter(([key]) => key === 'abilities' || key.startsWith('abilities.'))
94: if (confirm(t('settings.apiTokens.revokeConfirm', { name: token.name }))) {
95: router.delete(route('settings.api-tokens.destroy', token.id), { preserveScroll: true });
```

**Displayed data/value expressions:**
```text
145: revealedToken
147: copied ? t('settings.apiTokens.copied') : t('settings.apiTokens.copy')
181: token.name
183: abilitySummary(token)
185: formatDate(token.last_used_at)
186: formatDate(token.created_at)
236: form.errors.name
259: group
275: permission.label
276: permission.value
282: message
```



<a id="e0365"></a>

> Audit provenance: `platform-source-catalog.md` lines 2933–3003. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Webhooks/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Settings/Webhooks/Index.vue:305`: `<input id="create-name" v-model="createForm.name" type="text" :placeholder="t('settings.webhooks.namePlaceholder')" />`
- `resources/js/Pages/Settings/Webhooks/Index.vue:318`: `<input id="create-url" v-model="createForm.url" type="url" placeholder="https://example.com/webhook" />`
- `resources/js/Pages/Settings/Webhooks/Index.vue:371`: `<input id="create-active" v-model="createForm.is_active" type="checkbox" />`
- `resources/js/Pages/Settings/Webhooks/Index.vue:418`: `<input id="edit-name" v-model="editForm.name" type="text" :placeholder="t('settings.webhooks.namePlaceholder')" />`
- `resources/js/Pages/Settings/Webhooks/Index.vue:431`: `<input id="edit-url" v-model="editForm.url" type="url" placeholder="https://example.com/webhook" />`
- `resources/js/Pages/Settings/Webhooks/Index.vue:484`: `<input id="edit-active" v-model="editForm.is_active" type="checkbox" />`

**Form initial state/defaults:**
```js
47: const createForm = useForm({
48:     name: '',
49:     url: '',
50:     events: [],
51:     is_active: true,
52: });
55: const editForm = useForm({
56:     name: '',
57:     url: '',
58:     events: [],
59:     is_active: true,
60: });
```

**Visible table headers:**
```text
235: {{ t('common.name') }}
236: {{ t('settings.webhooks.url') }}
237: {{ t('settings.webhooks.events') }}
238: {{ t('common.status') }}
239: {{ t('settings.webhooks.deliveries') }}
240: {{ t('common.actions') }}
```

**View filters, permission/action and navigation anchors:**
```js
26: const revealedSecret = computed(() => page.props.flash?.newWebhookSecret ?? null);
27: const copiedSecret = ref(false);
42: const showCreateModal = ref(false);
43: const showEditModal = ref(false);
44: const editingWebhook = ref(null);
89: createForm.post(route('webhooks.store'), {
97: editForm.put(route('webhooks.update', editingWebhook.value.id), {
105: if (confirm(t('settings.webhooks.confirmDelete', { name: webhook.name }))) {
106: router.delete(route('webhooks.destroy', webhook.id));
157: const selectedCount = groupEvents.filter(event => form.events.includes(event)).length;
```

**Displayed data/value expressions:**
```text
210: revealedSecret
212: copiedSecret ? t('common.copied') : t('common.copy')
258: webhook.name
262: truncateUrl(webhook.url)
269: webhook.is_active ? t('common.active') : t('common.inactive')
312: createForm.errors.name
325: createForm.errors.url
346: group
359: event
360: description
366: createForm.errors.events
425: editForm.errors.name
438: editForm.errors.url
459: group
472: event
473: description
479: editForm.errors.events
```



<a id="e0366"></a>

> Audit provenance: `platform-source-catalog.md` lines 3004–3070. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Webhooks/Show.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Settings/Webhooks/Show.vue:524`: `<input id="edit-name" v-model="editForm.name" type="text" :placeholder="t('settings.webhooks.namePlaceholder')" />`
- `resources/js/Pages/Settings/Webhooks/Show.vue:537`: `<input id="edit-url" v-model="editForm.url" type="url" placeholder="https://example.com/webhook" />`
- `resources/js/Pages/Settings/Webhooks/Show.vue:590`: `<input id="show-edit-active" v-model="editForm.is_active" type="checkbox" />`

**Form initial state/defaults:**
```js
35: const editForm = useForm({
36:     name: props.webhook.name,
37:     url: props.webhook.url,
38:     events: [...props.webhook.events],
39:     is_active: props.webhook.is_active,
40: });
```

**Visible table headers:**
```text
329: {{ t('settings.webhooks.show.event') }}
330: {{ t('common.status') }}
331: {{ t('settings.webhooks.show.attempts') }}
332: {{ t('settings.webhooks.show.response') }}
333: {{ t('common.createdAt') }}
334: {{ t('common.actions') }}
```

**View filters, permission/action and navigation anchors:**
```js
29: const revealedSecret = computed(() => page.props.flash?.newWebhookSecret ?? null);
30: const copiedSecret = ref(false);
31: const showEditModal = ref(false);
32: const expandedDelivery = ref(null);
55: editForm.put(route('webhooks.update', props.webhook.id), {
63: if (confirm(t('settings.webhooks.show.confirmDelete', { name: props.webhook.name }))) {
64: router.delete(route('webhooks.destroy', props.webhook.id));
69: if (confirm(t('settings.webhooks.show.confirmRegenerate'))) {
70: router.post(route('webhooks.regenerate-secret', props.webhook.id));
75: router.post(route('webhooks.test', props.webhook.id));
79: router.post(route('webhook-deliveries.retry', delivery.id));
190: const selectedCount = groupEvents.filter(event => form.events.includes(event)).length;
```

**Displayed data/value expressions:**
```text
212: webhook.name
219: webhook.is_active ? t('common.active') : t('common.inactive')
247: webhook.url
258: copiedSecret ? t('common.copied') : t('common.copy')
265: revealedSecret
283: webhook.creator?.name || t('settings.webhooks.unknownCreator')
289: formatDate(webhook.created_at)
312: event
355: delivery.event
363: delivery.attempts
367: delivery.response_status || '-'
371: formatDate(delivery.created_at)
399: formatJson(delivery.payload)
403: delivery.response_body || t('settings.webhooks.show.noResponseBody')
531: editForm.errors.name
544: editForm.errors.url
565: group
578: event
579: description
585: editForm.errors.events
```



<a id="e0380"></a>

> Audit provenance: `platform-source-catalog.md` lines 3601–3644. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Webhook/StoreWebhookRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Webhook;
6: 
7: use App\Services\WebhookService;
8: use Illuminate\Foundation\Http\FormRequest;
9: 
10: /**
11:  * Validates creating a webhook (web). Rules unchanged from
12:  * WebhookController::store, including the SSRF guard rejecting local/metadata
13:  * and private/reserved IP targets.
14:  */
15: final class StoreWebhookRequest extends FormRequest
16: {
17:     /**
18:      * @return array<string, mixed>
19:      */
20:     public function rules(): array
21:     {
22:         return [
23:             'name' => 'required|string|max:255',
24:             'url' => ['required', 'url', 'max:2048', function ($attribute, $value, $fail) {
25:                 $host = parse_url($value, PHP_URL_HOST);
26:                 if (in_array($host, ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'])) {
27:                     $fail('Webhook URL must not point to a local or metadata address.');
28:                 }
29:                 if ($host && filter_var($host, FILTER_VALIDATE_IP)) {
30:                     if (! filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
31:                         $fail('Webhook URL must not point to a private or reserved IP address.');
32:                     }
33:                 }
34:             }],
35:             'events' => 'required|array|min:1',
36:             'events.*' => 'string|in:'.implode(',', WebhookService::availableEvents()),
37:             'is_active' => 'boolean',
38:         ];
39:     }
40: }
```



<a id="e0381"></a>

> Audit provenance: `platform-source-catalog.md` lines 3645–3687. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Webhook/UpdateWebhookRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Webhook;
6: 
7: use App\Services\WebhookService;
8: use Illuminate\Foundation\Http\FormRequest;
9: 
10: /**
11:  * Validates updating a webhook (web). Rules unchanged from
12:  * WebhookController::update, including the SSRF guard.
13:  */
14: final class UpdateWebhookRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, mixed>
18:      */
19:     public function rules(): array
20:     {
21:         return [
22:             'name' => 'required|string|max:255',
23:             'url' => ['required', 'url', 'max:2048', function ($attribute, $value, $fail) {
24:                 $host = parse_url($value, PHP_URL_HOST);
25:                 if (in_array($host, ['localhost', '127.0.0.1', '0.0.0.0', '::1', '169.254.169.254'])) {
26:                     $fail('Webhook URL must not point to a local or metadata address.');
27:                 }
28:                 if ($host && filter_var($host, FILTER_VALIDATE_IP)) {
29:                     if (! filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
30:                         $fail('Webhook URL must not point to a private or reserved IP address.');
31:                     }
32:                 }
33:             }],
34:             'events' => 'required|array|min:1',
35:             'events.*' => 'string|in:'.implode(',', WebhookService::availableEvents()),
36:             'is_active' => 'boolean',
37:         ];
38:     }
39: }
```



<a id="e0385"></a>

> Audit provenance: `platform-source-catalog.md` lines 3748–3765. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/ApiTokenController.php`
```php
26:     public function index(Request $request): Response
46:         return Inertia::render('Settings/ApiTokens/Index', [
52:     public function store(Request $request): RedirectResponse
56:         $validated = $request->validate([
57:             'name' => ['required', 'string', 'max:255'],
58:             'abilities' => ['required', 'array', 'min:1'],
59:             'abilities.*' => ['string', 'distinct', Rule::in($held)],
60:         ], [
61:             'abilities.*.in' => __('You can only grant permissions you hold.'),
62:         ]);
71:     public function destroy(Request $request, int $tokenId): RedirectResponse
75:         abort_if($token === null, 404);
77:         $token->delete();
88:     private function grantableAbilities(Request $request): array
```



<a id="e0425"></a>

> Audit provenance: `platform-source-catalog.md` lines 4635–4651. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/WebhookController.php`
```php
33:     public function index(): Response
45:         return Inertia::render('Settings/Webhooks/Index', [
57:     public function store(StoreWebhookRequest $request): RedirectResponse
80:     public function show(Webhook $webhook): Response
92:         return Inertia::render('Settings/Webhooks/Show', [
105:     public function update(UpdateWebhookRequest $request, Webhook $webhook): RedirectResponse
114:         $webhook->update($validated);
122:     public function destroy(Webhook $webhook): RedirectResponse
129:         $webhook->delete();
137:     public function regenerateSecret(Webhook $webhook): RedirectResponse
155:     public function test(Webhook $webhook): RedirectResponse
176:     public function retryDelivery(WebhookDelivery $delivery): RedirectResponse
185:         $delivery->update([
```



<a id="e0438"></a>

> Audit provenance: `platform-source-catalog.md` lines 5435–5461. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `routes/ai.php:1-23`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: use App\Mcp\Servers\InventorosServer;
6: use Laravel\Mcp\Facades\Mcp;
7: 
8: /*
9: |--------------------------------------------------------------------------
10: | MCP Routes
11: |--------------------------------------------------------------------------
12: |
13: | The Inventoros MCP server is exposed over HTTP at /mcp. Every request must
14: | present a Sanctum bearer token (Authorization: Bearer ...). The token's
15: | user provides the organization scope and permissions used by every tool.
16: |
17: | Rate limit reuses the existing 'api' throttle (60/min/user) so MCP calls
18: | share quota with the REST API instead of bypassing it.
19: |
20: */
21: 
22: Mcp::web('/mcp', InventorosServer::class)
23:     ->middleware(['auth:sanctum', 'throttle:api']);
```



<a id="e0452"></a>

> Audit provenance: `platform-source-catalog.md` lines 8513–8677. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Complete source contract `app/Mcp/Servers/InventorosServer.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Mcp\Servers;
6: 
7: use App\Mcp\Prompts\ReorderHelperPrompt;
8: use App\Mcp\Resources\LowStockResource;
9: use App\Mcp\Resources\RecentOrdersResource;
10: use App\Mcp\Tools\AdjustStockTool;
11: use App\Mcp\Tools\CreateOrderTool;
12: use App\Mcp\Tools\RecordPaymentTool;
13: use App\Mcp\Tools\CreateProductTool;
14: use App\Mcp\Tools\CreatePurchaseOrderTool;
15: use App\Mcp\Tools\DecideApprovalTool;
16: use App\Mcp\Tools\DeleteWorkOrderTool;
17: use App\Mcp\Tools\EmailOrderInvoiceTool;
18: use App\Mcp\Tools\CreateShipmentTool;
19: use App\Mcp\Tools\GetOrderTool;
20: use App\Mcp\Tools\GetProductTool;
21: use App\Mcp\Tools\GetPurchaseOrderTool;
22: use App\Mcp\Tools\ListCategoriesTool;
23: use App\Mcp\Tools\ListLocationsTool;
24: use App\Mcp\Tools\ListLowStockTool;
25: use App\Mcp\Tools\ListOrdersTool;
26: use App\Mcp\Tools\ListPendingApprovalsTool;
27: use App\Mcp\Tools\ListProductsTool;
28: use App\Mcp\Tools\ListPurchaseOrdersTool;
29: use App\Mcp\Tools\ListShipmentsTool;
30: use App\Mcp\Tools\ListSuppliersTool;
31: use App\Mcp\Tools\ListWarehousesTool;
32: use App\Mcp\Tools\ListWorkOrdersTool;
33: use App\Mcp\Tools\LookupBarcodeTool;
34: use App\Mcp\Tools\ReceivePurchaseOrderTool;
35: use App\Mcp\Tools\SearchProductsTool;
36: use App\Mcp\Tools\SendPurchaseOrderTool;
37: use App\Mcp\Tools\StartWorkOrderTool;
38: use App\Mcp\Tools\SubmitPurchaseOrderForApprovalTool;
39: use App\Mcp\Tools\WhoAmITool;
40: use App\Services\Plugins\PluginMcpToolRegistry;
41: use Laravel\Mcp\Server;
42: use Laravel\Mcp\Server\ServerContext;
43: 
44: class InventorosServer extends Server
45: {
46:     protected string $name = 'Inventoros MCP';
47: 
48:     protected string $version = '1.0.0';
49: 
50:     protected string $instructions = <<<'MARKDOWN'
51:         # Inventoros MCP Server
52: 
53:         This server lets AI agents read and act on inventory data scoped to a single
54:         Inventoros organization. Every request authenticates with a Sanctum bearer
55:         token; the agent inherits the user's permissions and organization scope.
56: 
57:         ## Capabilities
58: 
59:         - **Read** products, low-stock items, orders, shipments, suppliers,
60:           purchase orders, warehouses, locations, categories, and work orders.
61:         - **Write** stock adjustments, new products, new orders, new purchase
62:           orders, and shipments with manual tracking.
63:         - **Transition** purchase orders (send, receive) and work orders (start).
64: 
65:         ## Conventions
66: 
67:         - Quantities are integers. Money values are decimal strings.
68:         - Every list tool accepts `per_page` (max 100) and `page` for pagination.
69:         - Tools that mutate state include a `confirm` style description that
70:           encourages the AI client to confirm before invocation.
71:         - Errors return `isError: true` with a human-readable message.
72: 
73:         Start with `who_am_i` if you want to inspect the active token's identity and
74:         permissions.
75:         MARKDOWN;
76: 
77:     /** @var array<int, class-string> */
78:     protected array $tools = [
79:         WhoAmITool::class,
80: 
81:         // Catalog reads
82:         ListProductsTool::class,
83:         SearchProductsTool::class,
84:         GetProductTool::class,
85:         LookupBarcodeTool::class,
86:         ListCategoriesTool::class,
87:         ListLocationsTool::class,
88:         ListWarehousesTool::class,
89: 
90:         // Stock
91:         ListLowStockTool::class,
92:         \App\Mcp\Tools\ListStockBalancesTool::class,
93:         AdjustStockTool::class,
94:         \App\Mcp\Tools\TransitionStockTransferTool::class,
95: 
96:         // Sales
97:         ListOrdersTool::class,
98:         GetOrderTool::class,
99:         CreateOrderTool::class,
100:         EmailOrderInvoiceTool::class,
101:         RecordPaymentTool::class,
102: 
103:         // Shipping
104:         ListShipmentsTool::class,
105:         CreateShipmentTool::class,
106: 
107:         // Purchasing
108:         ListSuppliersTool::class,
109:         ListPurchaseOrdersTool::class,
110:         GetPurchaseOrderTool::class,
111:         CreatePurchaseOrderTool::class,
112:         SendPurchaseOrderTool::class,
113:         ReceivePurchaseOrderTool::class,
114:         SubmitPurchaseOrderForApprovalTool::class,
115: 
116:         // Approvals
117:         ListPendingApprovalsTool::class,
118:         DecideApprovalTool::class,
119: 
120:         // Manufacturing
121:         ListWorkOrdersTool::class,
122:         StartWorkOrderTool::class,
123:         DeleteWorkOrderTool::class,
124: 
125:         // Catalog writes
126:         CreateProductTool::class,
127:     ];
128: 
129:     /**
130:      * The tools core ships, without plugin tools.
131:      *
132:      * @return array<int, class-string>
133:      */
134:     public static function coreTools(): array
135:     {
136:         return (new \ReflectionClass(self::class))->getDefaultProperties()['tools'];
137:     }
138: 
139:     /**
140:      * Plugin tools (register_mcp_tool()) are added per request, after the
141:      * core ones; each is listed and callable only for users and tokens that
142:      * hold its permission.
143:      */
144:     public function createContext(): ServerContext
145:     {
146:         $this->tools = [...self::coreTools(), ...app(PluginMcpToolRegistry::class)->tools()];
147: 
148:         return parent::createContext();
149:     }
150: 
151:     /** @var array<int, class-string> */
152:     protected array $resources = [
153:         LowStockResource::class,
154:         RecentOrdersResource::class,
155:     ];
156: 
157:     /** @var array<int, class-string> */
158:     protected array $prompts = [
159:         ReorderHelperPrompt::class,
160:     ];
161: }
```



<a id="e0453"></a>

> Audit provenance: `platform-source-catalog.md` lines 8678–9073. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Complete source contract `routes/api.php`
```php
1: <?php
2: 
3: use App\Http\Controllers\Api\ApprovalController;
4: use App\Http\Controllers\Api\AuthController;
5: use App\Http\Controllers\Api\BarcodeLookupController;
6: use App\Http\Controllers\Api\BatchTrackingController;
7: use App\Http\Controllers\Api\CustomerController;
8: use App\Http\Controllers\Api\OrderController;
9: use App\Http\Controllers\Api\OrderPaymentController;
10: use App\Http\Controllers\Api\PermissionSetController;
11: use App\Http\Controllers\Api\ProductCategoryController;
12: use App\Http\Controllers\Api\ProductComponentController;
13: use App\Http\Controllers\Api\ProductController;
14: use App\Http\Controllers\Api\ProductLocationController;
15: use App\Http\Controllers\Api\ProductOptionController;
16: use App\Http\Controllers\Api\ProductVariantController;
17: use App\Http\Controllers\Api\PurchaseOrderController;
18: use App\Http\Controllers\Api\ReturnOrderController;
19: use App\Http\Controllers\Api\SavedReportController;
20: use App\Http\Controllers\Api\SerialTrackingController;
21: use App\Http\Controllers\Api\ShipmentController;
22: use App\Http\Controllers\Api\StockAdjustmentController;
23: use App\Http\Controllers\Api\StockAuditController as ApiStockAuditController;
24: use App\Http\Controllers\Api\StockTransferController;
25: use App\Http\Controllers\Api\SupplierController;
26: use App\Http\Controllers\Api\UserController;
27: use App\Http\Controllers\Api\WarehouseController;
28: use App\Http\Controllers\Api\WebhookController;
29: use App\Http\Controllers\Api\WorkOrderController;
30: use App\Http\Controllers\Inventory\ProductImageController;
31: use App\Http\Controllers\Inventory\StockAuditItemsController;
32: use App\Http\Controllers\Inventory\StockBalanceController;
33: use App\Http\Controllers\Inventory\VariantReplenishmentController;
34: use App\Services\ApprovalService;
35: use Illuminate\Support\Facades\Route;
36: 
37: /*
38: |--------------------------------------------------------------------------
39: | API Routes
40: |--------------------------------------------------------------------------
41: |
42: | Here is where you can register API routes for your application. These
43: | routes are loaded by the RouteServiceProvider and all of them will
44: | be assigned to the "api" middleware group.
45: |
46: */
47: 
48: /*
49: |--------------------------------------------------------------------------
50: | GraphQL API
51: |--------------------------------------------------------------------------
52: |
53: | The GraphQL endpoint is available at /graphql and is handled by the
54: | rebing/graphql-laravel package. Authentication is enforced via Sanctum
55: | middleware configured in config/graphql.php on the default schema.
56: |
57: | Endpoint: POST /graphql
58: | Auth: Bearer token (Sanctum)
59: |
60: */
61: 
62: /*
63: | Authorization note:
64: | Write verbs (store/update/destroy) are gated by the per-verb
65: | create_/edit_/delete_ permission, while read verbs (index/show) use
66: | view_. The previous single `view_X|manage_X` gate on the whole
67: | apiResource let a read-only user perform writes: `manage_products`,
68: | `manage_orders`, `manage_suppliers`, `manage_purchase_orders`,
69: | `manage_roles` and `manage_warehouses` are NOT real permissions
70: | (see App\Enums\Permission), so the OR collapsed to the read
71: | permission alone. Nested product sub-resources (options, variants,
72: | batches, serials, components) are product edits, so their writes use
73: | edit_products; a variant stock adjustment uses manage_stock.
74: */
75: 
76: // API Version 1
77: Route::prefix('v1')->as('api.')->middleware('throttle:api')->group(function () {
78:     // Public routes (rate limited)
79:     Route::middleware('throttle:5,1')->group(function () {
80:         Route::post('/login', [AuthController::class, 'login']);
81:     });
82: 
83:     // Protected routes
84:     Route::middleware(['auth:sanctum'])->group(function () {
85:         // Auth
86:         Route::post('/logout', [AuthController::class, 'logout']);
87:         Route::get('/user', [AuthController::class, 'user']);
88:         Route::post('/tokens', [AuthController::class, 'createToken']);
89:         Route::delete('/tokens/{tokenId}', [AuthController::class, 'revokeToken']);
90: 
91:         Route::prefix('variant-replenishment')->name('variant-replenishment.')->group(function () {
92:             Route::get('/', [VariantReplenishmentController::class, 'index'])->name('index')->middleware('api.permission:view_products');
93:             Route::get('/options', [VariantReplenishmentController::class, 'options'])->name('options')->middleware('api.permission:view_products|edit_products,all');
94:             Route::post('/', [VariantReplenishmentController::class, 'store'])->name('store')->middleware('api.permission:view_products|edit_products,all');
95:             Route::put('/{policy}', [VariantReplenishmentController::class, 'update'])->name('update')->middleware('api.permission:view_products|edit_products,all');
96:             Route::delete('/{policy}', [VariantReplenishmentController::class, 'destroy'])->name('destroy')->middleware('api.permission:view_products|edit_products,all');
97:             Route::post('/{policy}/draft', [VariantReplenishmentController::class, 'draft'])->name('draft')->middleware('api.permission:view_products|create_purchase_orders,all');
98:         });
99: 
100:         // Products
101:         Route::get('products/{product}/images/{index}', ProductImageController::class)
102:             ->whereNumber('index')->name('products.images.show')->middleware('api.permission:view_products');
103:         Route::apiResource('products', ProductController::class)->only(['index', 'show'])
104:             ->middleware('api.permission:view_products');
105:         Route::apiResource('products', ProductController::class)->only(['store'])
106:             ->middleware('api.permission:create_products');
107:         Route::apiResource('products', ProductController::class)->only(['update'])
108:             ->middleware('api.permission:edit_products');
109:         Route::apiResource('products', ProductController::class)->only(['destroy'])
110:             ->middleware('api.permission:delete_products');
111: 
112:         // Product Options (nested under products)
113:         Route::prefix('products/{product}')->group(function () {
114:             Route::apiResource('options', ProductOptionController::class)->only(['index', 'show'])
115:                 ->middleware('api.permission:view_products');
116:             Route::apiResource('options', ProductOptionController::class)->only(['store', 'update', 'destroy'])
117:                 ->middleware('api.permission:edit_products');
118:             Route::post('options/reorder', [ProductOptionController::class, 'reorder'])
119:                 ->middleware('api.permission:edit_products');
120:         });
121: 
122:         // Product Variants (nested under products)
123:         Route::prefix('products/{product}')->group(function () {
124:             Route::apiResource('variants', ProductVariantController::class)->only(['index', 'show'])
125:                 ->middleware('api.permission:view_products');
126:             Route::apiResource('variants', ProductVariantController::class)->only(['store', 'update', 'destroy'])
127:                 ->middleware('api.permission:edit_products');
128:             Route::post('variants/{variant}/adjust-stock', [ProductVariantController::class, 'adjustStock'])
129:                 ->middleware('api.permission:manage_stock');
130:             Route::post('variants/bulk', [ProductVariantController::class, 'bulkCreate'])
131:                 ->middleware('api.permission:edit_products');
132:         });
133: 
134:         // Batch Tracking (nested under products)
135:         Route::prefix('products/{product}')->group(function () {
136:             Route::get('batches', [BatchTrackingController::class, 'index'])
137:                 ->middleware('api.permission:view_products');
138:             Route::post('batches', [BatchTrackingController::class, 'store'])
139:                 ->middleware('api.permission:edit_products');
140:             Route::get('batches/{batch}', [BatchTrackingController::class, 'show'])
141:                 ->middleware('api.permission:view_products');
142:         });
143: 
144:         // Serial Tracking (nested under products)
145:         Route::prefix('products/{product}')->group(function () {
146:             Route::get('serials', [SerialTrackingController::class, 'index'])
147:                 ->middleware('api.permission:view_products');
148:             Route::post('serials', [SerialTrackingController::class, 'store'])
149:                 ->middleware('api.permission:edit_products');
150:             Route::get('serials/{serial}', [SerialTrackingController::class, 'show'])
151:                 ->middleware('api.permission:view_products');
152:             Route::put('serials/{serial}', [SerialTrackingController::class, 'update'])
153:                 ->middleware('api.permission:edit_products');
154:         });
155: 
156:         // Product Categories
157:         Route::apiResource('categories', ProductCategoryController::class)
158:             ->middleware('api.permission:manage_categories');
159: 
160:         // Product Locations
161:         Route::apiResource('locations', ProductLocationController::class)
162:             ->middleware('api.permission:manage_locations');
163: 
164:         // Orders
165:         Route::apiResource('orders', OrderController::class)->only(['index', 'show'])
166:             ->middleware('api.permission:view_orders');
167:         Route::apiResource('orders', OrderController::class)->only(['store'])
168:             ->middleware('api.permission:create_orders');
169:         Route::apiResource('orders', OrderController::class)->only(['update'])
170:             ->middleware('api.permission:edit_orders');
171:         Route::apiResource('orders', OrderController::class)->only(['destroy'])
172:             ->middleware('api.permission:delete_orders');
173: 
174:         // Order payments and refunds
175:         Route::get('orders/{order}/payments', [OrderPaymentController::class, 'index'])
176:             ->middleware('api.permission:view_payments');
177:         Route::post('orders/{order}/payments', [OrderPaymentController::class, 'store'])
178:             ->middleware('api.permission:record_payments');
179:         Route::post('orders/{order}/refunds', [OrderPaymentController::class, 'refund'])
180:             ->middleware('api.permission:record_payments');
181:         Route::post('orders/{order}/payments/{payment}/void', [OrderPaymentController::class, 'void'])
182:             ->middleware('api.permission:record_payments');
183: 
184:         // Shipments
185:         Route::get('orders/{order}/shipments', [ShipmentController::class, 'forOrder'])
186:             ->middleware('api.permission:view_shipments');
187:         Route::post('orders/{order}/shipments', [ShipmentController::class, 'store'])
188:             ->middleware('api.permission:create_shipments');
189:         Route::get('shipments', [ShipmentController::class, 'index'])
190:             ->middleware('api.permission:view_shipments');
191:         Route::get('shipments/{shipment}', [ShipmentController::class, 'show'])
192:             ->middleware('api.permission:view_shipments');
193:         Route::post('shipments/{shipment}/ship', [ShipmentController::class, 'ship'])
194:             ->middleware('api.permission:create_shipments');
195:         Route::post('shipments/{shipment}/rates', [ShipmentController::class, 'rates'])
196:             ->middleware('api.permission:create_shipments');
197:         Route::post('shipments/{shipment}/buy-label', [ShipmentController::class, 'buyLabel'])
198:             ->middleware('api.permission:create_shipments');
199:         Route::post('shipments/{shipment}/void-label', [ShipmentController::class, 'voidLabel'])
200:             ->middleware('api.permission:create_shipments');
201: 
202:         Route::get('stock-balances', [StockBalanceController::class, 'api'])->middleware('api.permission:view_products');
203: 
204:         // Stock Audits
205:         Route::get('stock-audits/{stockAudit}/items', [StockAuditItemsController::class, 'index'])
206:             ->middleware('api.permission:view_stock_audits|manage_stock_audits');
207:         Route::get('stock-audits/{stockAudit}/items/{item}', [StockAuditItemsController::class, 'show'])
208:             ->middleware('api.permission:view_stock_audits|manage_stock_audits');
209:         Route::get('stock-audits/{stockAudit}/lookup', [StockAuditItemsController::class, 'lookup'])
210:             ->middleware('api.permission:view_stock_audits|manage_stock_audits');
211:         Route::apiResource('stock-audits', ApiStockAuditController::class)
212:             ->only(['index', 'show'])
213:             ->middleware('api.permission:view_stock_audits|manage_stock_audits');
214: 
215:         // Stock Adjustments
216:         Route::apiResource('stock-adjustments', StockAdjustmentController::class)
217:             ->only(['index', 'show'])
218:             ->middleware('api.permission:manage_stock');
219:         Route::apiResource('stock-adjustments', StockAdjustmentController::class)
220:             ->only(['store'])
221:             ->middleware('api.permission:manage_stock');
222: 
223:         // Suppliers (will be available after Supplier model is created)
224:         Route::apiResource('suppliers', SupplierController::class)->only(['index', 'show'])
225:             ->middleware('api.permission:view_suppliers');
226:         Route::apiResource('suppliers', SupplierController::class)->only(['store'])
227:             ->middleware('api.permission:create_suppliers');
228:         Route::apiResource('suppliers', SupplierController::class)->only(['update'])
229:             ->middleware('api.permission:edit_suppliers');
230:         Route::apiResource('suppliers', SupplierController::class)->only(['destroy'])
231:             ->middleware('api.permission:delete_suppliers');
232: 
233:         // Purchase Orders
234:         Route::apiResource('purchase-orders', PurchaseOrderController::class)->only(['index', 'show'])
235:             ->middleware('api.permission:view_purchase_orders');
236:         Route::apiResource('purchase-orders', PurchaseOrderController::class)->only(['store'])
237:             ->middleware('api.permission:create_purchase_orders');
238:         Route::apiResource('purchase-orders', PurchaseOrderController::class)->only(['update'])
239:             ->middleware('api.permission:edit_purchase_orders');
240:         Route::apiResource('purchase-orders', PurchaseOrderController::class)->only(['destroy'])
241:             ->middleware('api.permission:delete_purchase_orders');
242:         Route::post('purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receive'])
243:             ->middleware('api.permission:receive_purchase_orders');
244:         Route::post('purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'send'])
245:             ->middleware('api.permission:edit_purchase_orders');
246:         Route::post('purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel'])
247:             ->middleware('api.permission:edit_purchase_orders');
248:         Route::post('purchase-orders/{purchaseOrder}/submit-for-approval', [PurchaseOrderController::class, 'submitForApproval'])
249:             ->middleware('api.permission:edit_purchase_orders');
250: 
251:         // Approvals. Listing is open to every user (it only shows what they
252:         // may decide, or their own requests, limited to the kinds of request
253:         // a scoped token has an ability for); deciding needs an approve_*
254:         // permission, checked per type by ApprovalService.
255:         Route::get('approvals', [ApprovalController::class, 'index']);
256:         Route::get('approvals/mine', [ApprovalController::class, 'mine']);
257:         Route::post('approvals/{type}/{id}/approve', [ApprovalController::class, 'approve'])
258:             ->whereIn('type', ApprovalService::TYPES)->whereNumber('id')
259:             ->middleware('api.permission:approve_purchase_orders|approve_stock_adjustments|approve_stock_transfers|approve_orders');
260:         Route::post('approvals/{type}/{id}/reject', [ApprovalController::class, 'reject'])
261:             ->whereIn('type', ApprovalService::TYPES)->whereNumber('id')
262:             ->middleware('api.permission:approve_purchase_orders|approve_stock_adjustments|approve_stock_transfers|approve_orders');
263: 
264:         // Barcode Lookup
265:         Route::get('barcode/{code}', [BarcodeLookupController::class, 'lookup'])
266:             ->middleware('api.permission:view_products');
267: 
268:         // Permission Sets
269:         Route::get('permission-sets/categories', [PermissionSetController::class, 'categories'])
270:             ->middleware('api.permission:view_roles');
271:         Route::apiResource('permission-sets', PermissionSetController::class)->only(['index', 'show'])
272:             ->middleware('api.permission:view_roles');
273:         Route::apiResource('permission-sets', PermissionSetController::class)->only(['store'])
274:             ->middleware('api.permission:create_roles');
275:         Route::apiResource('permission-sets', PermissionSetController::class)->only(['update'])
276:             ->middleware('api.permission:edit_roles');
277:         Route::apiResource('permission-sets', PermissionSetController::class)->only(['destroy'])
278:             ->middleware('api.permission:delete_roles');
279: 
280:         // Warehouses
281:         Route::apiResource('warehouses', WarehouseController::class)->only(['index', 'show'])
282:             ->middleware('api.permission:view_warehouses');
283:         Route::apiResource('warehouses', WarehouseController::class)->only(['store'])
284:             ->middleware('api.permission:create_warehouses');
285:         Route::apiResource('warehouses', WarehouseController::class)->only(['update'])
286:             ->middleware('api.permission:edit_warehouses');
287:         Route::apiResource('warehouses', WarehouseController::class)->only(['destroy'])
288:             ->middleware('api.permission:delete_warehouses');
289: 
290:         // Work Orders
291:         Route::apiResource('work-orders', WorkOrderController::class)
292:             ->only(['index', 'store', 'show', 'destroy'])
293:             ->middleware('api.permission:manage_stock');
294:         Route::post('work-orders/{workOrder}/start', [WorkOrderController::class, 'start'])
295:             ->middleware('api.permission:manage_stock');
296:         Route::post('work-orders/{workOrder}/complete', [WorkOrderController::class, 'complete'])
297:             ->middleware('api.permission:manage_stock');
298:         Route::post('work-orders/{workOrder}/cancel', [WorkOrderController::class, 'cancel'])
299:             ->middleware('api.permission:manage_stock');
300: 
301:         // Product Components (nested under products)
302:         Route::prefix('products/{product}')->group(function () {
303:             Route::get('components', [ProductComponentController::class, 'index'])
304:                 ->middleware('api.permission:view_products');
305:             Route::post('components', [ProductComponentController::class, 'store'])
306:                 ->middleware('api.permission:edit_products');
307:             Route::put('components/{component}', [ProductComponentController::class, 'update'])
308:                 ->middleware('api.permission:edit_products');
309:             Route::delete('components/{component}', [ProductComponentController::class, 'destroy'])
310:                 ->middleware('api.permission:edit_products');
311:         });
312: 
313:         // Parity endpoints. api.tenant answers 404 for any route-bound model
314:         // owned by another organization before validation can run.
315:         Route::middleware('api.tenant')->group(function () {
316:             // Order approval workflow
317:             Route::post('orders/{order}/approve', [OrderController::class, 'approve'])
318:                 ->middleware('api.permission:approve_orders');
319:             Route::post('orders/{order}/reject', [OrderController::class, 'reject'])
320:                 ->middleware('api.permission:approve_orders');
321:             Route::post('orders/{order}/invoice/email', [OrderController::class, 'emailInvoice'])
322:                 ->middleware('api.permission:edit_orders');
323: 
324:             // Customers
325:             Route::apiResource('customers', CustomerController::class)->only(['index', 'show'])
326:                 ->middleware('api.permission:view_customers');
327:             Route::apiResource('customers', CustomerController::class)->only(['store'])
328:                 ->middleware('api.permission:create_customers');
329:             Route::apiResource('customers', CustomerController::class)->only(['update'])
330:                 ->middleware('api.permission:edit_customers');
331:             Route::apiResource('customers', CustomerController::class)->only(['destroy'])
332:                 ->middleware('api.permission:delete_customers');
333:             Route::get('customers/{customer}/orders', [CustomerController::class, 'orders'])
334:                 ->middleware('api.permission:view_customers|view_orders,all');
335: 
336:             // Returns (RMA) - one permission covers the whole lifecycle, as on the web
337:             Route::middleware('api.permission:manage_returns')->group(function () {
338:                 Route::apiResource('returns', ReturnOrderController::class)
339:                     ->only(['index', 'show', 'store'])
340:                     ->parameters(['returns' => 'returnOrder']);
341:                 Route::patch('returns/{returnOrder}/items', [ReturnOrderController::class, 'updateLines']);
342:                 Route::post('returns/{returnOrder}/approve', [ReturnOrderController::class, 'approve']);
343:                 Route::post('returns/{returnOrder}/receive', [ReturnOrderController::class, 'receive']);
344:                 Route::post('returns/{returnOrder}/complete', [ReturnOrderController::class, 'complete']);
345:                 Route::post('returns/{returnOrder}/reject', [ReturnOrderController::class, 'reject']);
346:             });
347: 
348:             // Stock Transfers
349:             Route::middleware('api.permission:transfer_stock')->group(function () {
350:                 Route::apiResource('stock-transfers', StockTransferController::class)
351:                     ->only(['index', 'show', 'store']);
352:                 Route::post('stock-transfers/{stockTransfer}/prepare', [StockTransferController::class, 'prepare']);
353:                 Route::post('stock-transfers/{stockTransfer}/ship', [StockTransferController::class, 'ship']);
354:                 Route::post('stock-transfers/{stockTransfer}/complete', [StockTransferController::class, 'complete']);
355:                 Route::post('stock-transfers/{stockTransfer}/cancel', [StockTransferController::class, 'cancel']);
356:             });
357: 
358:             // Stock Audits (write)
359:             Route::post('stock-audits', [ApiStockAuditController::class, 'store'])
360:                 ->middleware('api.permission:create_stock_audits');
361:             Route::post('stock-audits/{stockAudit}/start', [ApiStockAuditController::class, 'start'])
362:                 ->middleware('api.permission:manage_stock_audits');
363:             Route::post('stock-audits/{stockAudit}/items/{item}/count', [ApiStockAuditController::class, 'recordCount'])
364:                 ->middleware('api.permission:manage_stock_audits');
365:             Route::post('stock-audits/{stockAudit}/items/{item}/review', [ApiStockAuditController::class, 'reviewCount'])
366:                 ->middleware(['api.permission:view_stock_audits', 'api.permission:approve_stock_adjustments']);
367:             Route::post('stock-audits/{stockAudit}/complete', [ApiStockAuditController::class, 'complete'])
368:                 ->middleware('api.permission:manage_stock_audits');
369: 
370:             // Webhooks - organization administration, as on the web
371:             Route::middleware('api.permission:manage_organization')->group(function () {
372:                 Route::apiResource('webhooks', WebhookController::class);
373:                 Route::post('webhooks/{webhook}/regenerate-secret', [WebhookController::class, 'regenerateSecret']);
374:                 Route::get('webhooks/{webhook}/deliveries', [WebhookController::class, 'deliveries']);
375:             });
376: 
377:             // Users
378:             Route::apiResource('users', UserController::class)->only(['index', 'show'])
379:                 ->middleware('api.permission:view_users');
380:             Route::apiResource('users', UserController::class)->only(['store'])
381:                 ->middleware('api.permission:create_users');
382:             Route::apiResource('users', UserController::class)->only(['update'])
383:                 ->middleware('api.permission:edit_users');
384:         });
385: 
386:         // Saved Reports
387:         Route::apiResource('reports', SavedReportController::class)
388:             ->middleware('api.permission:view_reports');
389:         Route::get('reports/{report}/export', [SavedReportController::class, 'export'])
390:             ->middleware('api.permission:view_reports');
391:     });
392: });
```



<a id="e0455"></a>

> Audit provenance: `platform-source-catalog.md` lines 9444–9750. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Complete source contract `app/Services/WebhookService.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Services;
6: 
7: use App\Jobs\WebhookDeliveryJob;
8: use App\Models\Webhook;
9: use App\Models\WebhookDelivery;
10: use App\Services\Plugins\PluginWebhookEventRegistry;
11: use Illuminate\Support\Facades\DB;
12: use Illuminate\Support\Facades\Log;
13: use Illuminate\Support\Str;
14: 
15: /**
16:  * Service for managing webhook dispatching and delivery.
17:  *
18:  * Provides static methods for dispatching webhooks to subscribed endpoints,
19:  * generating and verifying HMAC signatures, and managing event definitions.
20:  */
21: final class WebhookService
22: {
23:     public const SIGNATURE_ALGORITHM = 'sha256';
24:     public const STATUS_PENDING = 'pending';
25:     /**
26:      * Dispatch webhook for an event to all subscribed webhooks.
27:      *
28:      * @param string $event The event name (e.g., 'order.created')
29:      * @param array $data The event data to send
30:      * @param int $organizationId The organization ID
31:      * @return void
32:      */
33:     public static function dispatch(string $event, array $data, int $organizationId): void
34:     {
35:         $webhooks = Webhook::forOrganization($organizationId)
36:             ->active()
37:             ->subscribedTo($event)
38:             ->get();
39: 
40:         foreach ($webhooks as $webhook) {
41:             $payload = [
42:                 'id' => 'wh_' . Str::random(24),
43:                 'event' => $event,
44:                 'timestamp' => now()->toIso8601String(),
45:                 'organization_id' => $organizationId,
46:                 'data' => $data,
47:             ];
48: 
49:             // HOOK: let plugins skip this endpoint for this event (filters,
50:             // pauses). Nothing is logged or sent for a skipped endpoint.
51:             if (! self::shouldDeliver($webhook, $event, $payload)) {
52:                 continue;
53:             }
54: 
55:             $delivery = WebhookDelivery::create([
56:                 'webhook_id' => $webhook->id,
57:                 'event' => $event,
58:                 'payload' => $payload,
59:                 'status' => 'pending',
60:             ]);
61: 
62:             WebhookDeliveryJob::dispatch($delivery);
63:         }
64:     }
65: 
66:     /**
67:      * Ask the webhook_should_deliver filter whether this endpoint receives
68:      * this event. A filter that throws is logged and ignored: a broken plugin
69:      * must not silently stop core deliveries.
70:      *
71:      * @param  array<string, mixed>  $payload
72:      */
73:     private static function shouldDeliver(Webhook $webhook, string $event, array $payload): bool
74:     {
75:         try {
76:             return apply_filters('webhook_should_deliver', true, $webhook, $event, $payload) !== false;
77:         } catch (\Throwable $e) {
78:             Log::warning('webhook_should_deliver filter failed; delivering anyway', [
79:                 'webhook_id' => $webhook->id,
80:                 'event' => $event,
81:                 'error' => $e->getMessage(),
82:             ]);
83: 
84:             return true;
85:         }
86:     }
87: 
88:     /**
89:      * Generate HMAC signature for a webhook payload.
90:      *
91:      * @param string $payload The JSON-encoded payload
92:      * @param string $secret The webhook secret
93:      * @return string The HMAC-SHA256 signature
94:      */
95:     public static function sign(string $payload, string $secret): string
96:     {
97:         return hash_hmac('sha256', $payload, $secret);
98:     }
99: 
100:     /**
101:      * Verify a webhook signature.
102:      *
103:      * @param string $payload The JSON-encoded payload
104:      * @param string $secret The webhook secret
105:      * @param string $signature The signature to verify
106:      * @return bool True if the signature is valid
107:      */
108:     public static function verifySignature(string $payload, string $secret, string $signature): bool
109:     {
110:         $expectedSignature = self::sign($payload, $secret);
111: 
112:         return hash_equals($expectedSignature, $signature);
113:     }
114: 
115:     /**
116:      * Send a plugin's own event (register_webhook_event()) to the
117:      * organization's subscribed webhooks, after the surrounding transaction
118:      * commits, through the same signed, retried, SSRF-checked delivery as
119:      * core events.
120:      *
121:      * @param  array<string, mixed>  $data
122:      *
123:      * @throws \InvalidArgumentException When the event is not registered by an active plugin
124:      */
125:     public static function dispatchPluginEvent(string $event, array $data, int $organizationId): void
126:     {
127:         if (! app(PluginWebhookEventRegistry::class)->has($event)) {
128:             throw new \InvalidArgumentException("Webhook event \"{$event}\" is not registered. Call register_webhook_event() first.");
129:         }
130: 
131:         DB::afterCommit(fn () => self::dispatch($event, $data, $organizationId));
132:     }
133: 
134:     /**
135:      * Get the list of all available webhook events: core events, then those
136:      * registered by active plugins.
137:      *
138:      * @return array<string> List of event names
139:      */
140:     public static function availableEvents(): array
141:     {
142:         return [...self::coreEvents(), ...app(PluginWebhookEventRegistry::class)->names()];
143:     }
144: 
145:     /**
146:      * The first segment of every core event name ("product", "order", ...),
147:      * which plugin events may not use.
148:      *
149:      * @return array<int, string>
150:      */
151:     public static function corePrefixes(): array
152:     {
153:         return array_values(array_unique(array_map(fn (string $event) => explode('.', $event)[0], self::coreEvents())));
154:     }
155: 
156:     /**
157:      * @return array<string>
158:      */
159:     private static function coreEvents(): array
160:     {
161:         return [
162:             // Product events
163:             'product.created',
164:             'product.updated',
165:             'product.deleted',
166:             'product.low_stock',
167:             'product.out_of_stock',
168: 
169:             // Order events
170:             'order.created',
171:             'order.updated',
172:             'order.status_changed',
173:             'order.approved',
174:             'order.rejected',
175: 
176:             // Payment events
177:             'payment.recorded',
178:             'payment.voided',
179: 
180:             // Shipment events
181:             'shipment.created',
182:             'shipment.delivered',
183: 
184:             // Stock events
185:             'stock.adjusted',
186: 
187:             // Purchase order events
188:             'purchase_order.created',
189:             'purchase_order.received',
190:             'purchase_order.cancelled',
191: 
192:             // Customer events
193:             'customer.created',
194:             'customer.updated',
195:             'customer.deleted',
196: 
197:             // Return (RMA) events
198:             'return.created',
199:             'return.received',
200: 
201:             // Stock transfer events
202:             'transfer.created',
203:             'transfer.completed',
204: 
205:             // Work order events
206:             'work_order.completed',
207: 
208:             // Stock audit events
209:             'stock_audit.completed',
210:         ];
211:     }
212: 
213:     /**
214:      * Get event groups for UI display: the core groups, then plugin groups.
215:      *
216:      * @return array<string, array<string, string>> Grouped events with descriptions
217:      */
218:     public static function eventGroups(): array
219:     {
220:         $groups = self::coreEventGroups();
221: 
222:         foreach (app(PluginWebhookEventRegistry::class)->groups() as $group => $events) {
223:             $groups[$group] = ($groups[$group] ?? []) + $events;
224:         }
225: 
226:         return $groups;
227:     }
228: 
229:     /**
230:      * @return array<string, array<string, string>>
231:      */
232:     private static function coreEventGroups(): array
233:     {
234:         return [
235:             'Product' => [
236:                 'product.created' => 'When a new product is created',
237:                 'product.updated' => 'When a product is updated',
238:                 'product.deleted' => 'When a product is deleted',
239:                 'product.low_stock' => 'When product stock falls below minimum',
240:                 'product.out_of_stock' => 'When product stock reaches zero',
241:             ],
242:             'Order' => [
243:                 'order.created' => 'When a new order is created',
244:                 'order.updated' => 'When an order is updated',
245:                 'order.status_changed' => 'When order status changes',
246:                 'order.approved' => 'When an order is approved',
247:                 'order.rejected' => 'When an order is rejected',
248:             ],
249:             'Payment' => [
250:                 'payment.recorded' => 'When a payment or refund is recorded against an order',
251:                 'payment.voided' => 'When a payment or refund is voided',
252:             ],
253:             'Shipment' => [
254:                 'shipment.created' => 'When a shipment is created for an order',
255:                 'shipment.delivered' => 'When the carrier reports a shipment delivered',
256:             ],
257:             'Stock' => [
258:                 'stock.adjusted' => 'When stock is manually adjusted',
259:             ],
260:             'Purchase Order' => [
261:                 'purchase_order.created' => 'When a purchase order is created',
262:                 'purchase_order.received' => 'When a purchase order is received',
263:                 'purchase_order.cancelled' => 'When a purchase order is cancelled',
264:             ],
265:             'Customer' => [
266:                 'customer.created' => 'When a new customer is created',
267:                 'customer.updated' => 'When a customer is updated',
268:                 'customer.deleted' => 'When a customer is deleted',
269:             ],
270:             'Return' => [
271:                 'return.created' => 'When a return (RMA) is requested',
272:                 'return.received' => 'When returned items are received',
273:             ],
274:             'Stock Transfer' => [
275:                 'transfer.created' => 'When a stock transfer is created',
276:                 'transfer.completed' => 'When a stock transfer is completed',
277:             ],
278:             'Work Order' => [
279:                 'work_order.completed' => 'When a work order is completed',
280:             ],
281:             'Stock Audit' => [
282:                 'stock_audit.completed' => 'When a stock audit is completed',
283:             ],
284:         ];
285:     }
286: 
287:     /**
288:      * Get a description for an event.
289:      *
290:      * @param string $event The event name
291:      * @return string|null The event description
292:      */
293:     public static function getEventDescription(string $event): ?string
294:     {
295:         foreach (self::eventGroups() as $group => $events) {
296:             if (isset($events[$event])) {
297:                 return $events[$event];
298:             }
299:         }
300: 
301:         return null;
302:     }
303: }
```



<a id="e0456"></a>

> Audit provenance: `platform-source-catalog.md` lines 9751–10098. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Complete source contract `config/graphql.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: use App\GraphQL\Mutations\ApproveReturnOrderMutation;
6: use App\GraphQL\Mutations\CompleteStockTransferMutation;
7: use App\GraphQL\Mutations\TransitionStockTransferMutation;
8: use App\GraphQL\Mutations\CreateCustomerMutation;
9: use App\GraphQL\Mutations\CreateOrderMutation;
10: use App\GraphQL\Mutations\CreateProductMutation;
11: use App\GraphQL\Mutations\CreatePurchaseOrderMutation;
12: use App\GraphQL\Mutations\CreateReturnOrderMutation;
13: use App\GraphQL\Mutations\CreateStockAdjustmentMutation;
14: use App\GraphQL\Mutations\CreateStockTransferMutation;
15: use App\GraphQL\Mutations\CreateSupplierMutation;
16: use App\GraphQL\Mutations\DecideApprovalMutation;
17: use App\GraphQL\Mutations\DeleteProductMutation;
18: use App\GraphQL\Mutations\ReceivePurchaseOrderMutation;
19: use App\GraphQL\Mutations\ReceiveReturnOrderMutation;
20: use App\GraphQL\Mutations\RequestStockAdjustmentApprovalMutation;
21: use App\GraphQL\Mutations\UpdateCustomerMutation;
22: use App\GraphQL\Mutations\UpdateOrderMutation;
23: use App\GraphQL\Mutations\UpdateProductMutation;
24: use App\GraphQL\Mutations\UpdatePurchaseOrderMutation;
25: use App\GraphQL\Mutations\UpdateSupplierMutation;
26: use App\GraphQL\Queries\CategoriesQuery;
27: use App\GraphQL\Queries\CustomerQuery;
28: use App\GraphQL\Queries\CustomersQuery;
29: use App\GraphQL\Queries\LocationsQuery;
30: use App\GraphQL\Queries\OrderQuery;
31: use App\GraphQL\Queries\OrdersQuery;
32: use App\GraphQL\Queries\PendingApprovalsQuery;
33: use App\GraphQL\Queries\ProductQuery;
34: use App\GraphQL\Queries\ProductsQuery;
35: use App\GraphQL\Queries\ProductVariantsQuery;
36: use App\GraphQL\Queries\PurchaseOrderQuery;
37: use App\GraphQL\Queries\PurchaseOrdersQuery;
38: use App\GraphQL\Queries\ReturnOrderQuery;
39: use App\GraphQL\Queries\ReturnOrdersQuery;
40: use App\GraphQL\Queries\ShipmentsQuery;
41: use App\GraphQL\Queries\StockAdjustmentsQuery;
42: use App\GraphQL\Queries\StockTransferQuery;
43: use App\GraphQL\Queries\StockTransfersQuery;
44: use App\GraphQL\Queries\SupplierQuery;
45: use App\GraphQL\Queries\SuppliersQuery;
46: use App\GraphQL\Queries\UserQuery;
47: use App\GraphQL\Queries\UsersQuery;
48: use App\GraphQL\Types\ApprovalItemType;
49: use App\GraphQL\Types\CustomerType;
50: use App\GraphQL\Types\LocationType;
51: use App\GraphQL\Types\OrderItemInputType;
52: use App\GraphQL\Types\OrderItemType;
53: use App\GraphQL\Types\OrderPaymentType;
54: use App\GraphQL\Types\OrderType;
55: use App\GraphQL\Types\ProductCategoryType;
56: use App\GraphQL\Types\ProductSupplierInputType;
57: use App\GraphQL\Types\ProductType;
58: use App\GraphQL\Types\ProductVariantType;
59: use App\GraphQL\Types\PurchaseOrderItemInputType;
60: use App\GraphQL\Types\PurchaseOrderItemType;
61: use App\GraphQL\Types\PurchaseOrderReceiveItemInputType;
62: use App\GraphQL\Types\PurchaseOrderType;
63: use App\GraphQL\Types\ReturnOrderItemInputType;
64: use App\GraphQL\Types\ReturnOrderItemType;
65: use App\GraphQL\Types\ReturnOrderType;
66: use App\GraphQL\Types\RoleType;
67: use App\GraphQL\Types\StockAdjustmentType;
68: use App\GraphQL\Types\StockTransferItemInputType;
69: use App\GraphQL\Types\StockTransferItemType;
70: use App\GraphQL\Types\ShipmentItemType;
71: use App\GraphQL\Types\ShipmentType;
72: use App\GraphQL\Types\StockTransferType;
73: use App\GraphQL\Types\SupplierType;
74: use App\GraphQL\Types\UserType;
75: 
76: return [
77: 
78:     // The prefix for routes; set to 'api/graphql' so it uses the api middleware
79:     // The package registers its own routes, but we also add an explicit route in routes/api.php
80:     'prefix' => 'graphql',
81: 
82:     // The routes to make GraphQL request. Either a string that will apply
83:     // to both query and mutation or an array containing the key 'query' and/or
84:     // 'mutation' with the according Route
85:     //
86:     // Example:
87:     //
88:     // Same route for both query and mutation
89:     //
90:     // 'routes' => 'path/to/query/{graphql_schema?}',
91:     //
92:     // or define each route
93:     //
94:     // 'routes' => [
95:     //     'query' => 'query/{graphql_schema?}',
96:     //     'mutation' => 'mutation/{graphql_schema?}',
97:     // ]
98:     //
99:     'routes' => '{graphql_schema?}',
100: 
101:     // The controller to use in GraphQL request. Either a string that will apply
102:     // to both query and mutation or an array containing the key 'query' and/or
103:     // 'mutation' with the according Controller and method
104:     //
105:     // Example:
106:     //
107:     // 'controllers' => \Rebing\GraphQL\GraphQLController::class . '@query',
108:     //
109:     // or
110:     //
111:     // 'controllers' => [
112:     //     'query' => \Rebing\GraphQL\GraphQLController::class . '@query',
113:     //     'mutation' => \Rebing\GraphQL\GraphQLController::class . '@query',
114:     // ]
115:     //
116:     'controllers' => \Rebing\GraphQL\GraphQLController::class . '@query',
117: 
118:     // Any middleware for the graphql route group
119:     // This middleware will apply to all schemas
120:     'middleware' => [],
121: 
122:     // Additional route group attributes
123:     //
124:     // Example:
125:     //
126:     // 'route_group_attributes' => ['guard' => 'api']
127:     //
128:     'route_group_attributes' => [],
129: 
130:     // The name of the default schema
131:     // Used when the route is used without specifying a schema
132:     'default_schema' => 'default',
133: 
134:     'schemas' => [
135:         'default' => [
136:             'query' => [
137:                 'products' => ProductsQuery::class,
138:                 'product' => ProductQuery::class,
139:                 'orders' => OrdersQuery::class,
140:                 'order' => OrderQuery::class,
141:                 'suppliers' => SuppliersQuery::class,
142:                 'supplier' => SupplierQuery::class,
143:                 'purchaseOrders' => PurchaseOrdersQuery::class,
144:                 'purchaseOrder' => PurchaseOrderQuery::class,
145:                 'stockAdjustments' => StockAdjustmentsQuery::class,
146:                 'locations' => LocationsQuery::class,
147:                 'categories' => CategoriesQuery::class,
148:                 'pendingApprovals' => PendingApprovalsQuery::class,
149:                 'customers' => CustomersQuery::class,
150:                 'customer' => CustomerQuery::class,
151:                 'returnOrders' => ReturnOrdersQuery::class,
152:                 'returnOrder' => ReturnOrderQuery::class,
153:                 'stockTransfers' => StockTransfersQuery::class,
154:                 'stockTransfer' => StockTransferQuery::class,
155:                 'users' => UsersQuery::class,
156:                 'user' => UserQuery::class,
157:                 'productVariants' => ProductVariantsQuery::class,
158:                 'shipments' => ShipmentsQuery::class,
159:             ],
160:             'mutation' => [
161:                 'createProduct' => CreateProductMutation::class,
162:                 'updateProduct' => UpdateProductMutation::class,
163:                 'deleteProduct' => DeleteProductMutation::class,
164:                 'createOrder' => CreateOrderMutation::class,
165:                 'updateOrder' => UpdateOrderMutation::class,
166:                 'createStockAdjustment' => CreateStockAdjustmentMutation::class,
167:                 'createSupplier' => CreateSupplierMutation::class,
168:                 'updateSupplier' => UpdateSupplierMutation::class,
169:                 'requestStockAdjustmentApproval' => RequestStockAdjustmentApprovalMutation::class,
170:                 'decideApproval' => DecideApprovalMutation::class,
171:                 'createCustomer' => CreateCustomerMutation::class,
172:                 'updateCustomer' => UpdateCustomerMutation::class,
173:                 'createReturnOrder' => CreateReturnOrderMutation::class,
174:                 'approveReturnOrder' => ApproveReturnOrderMutation::class,
175:                 'receiveReturnOrder' => ReceiveReturnOrderMutation::class,
176:                 'createStockTransfer' => CreateStockTransferMutation::class,
177:                 'completeStockTransfer' => CompleteStockTransferMutation::class,
178:                 'transitionStockTransfer' => TransitionStockTransferMutation::class,
179:                 'createPurchaseOrder' => CreatePurchaseOrderMutation::class,
180:                 'updatePurchaseOrder' => UpdatePurchaseOrderMutation::class,
181:                 'receivePurchaseOrder' => ReceivePurchaseOrderMutation::class,
182:             ],
183:             // Same named limiter as the REST API (60/min per user, or per IP).
184:             'middleware' => ['throttle:api', 'auth:sanctum'],
185:             'method' => ['GET', 'POST'],
186:         ],
187:     ],
188: 
189:     // The types available in the application. You can then access it from the
190:     // @param TypeRegistry $registry facade like this: GraphQL::type('user')
191:     //
192:     // Example:
193:     //
194:     // 'types' => [
195:     //     App\GraphQL\Types\UserType::class,
196:     // ]
197:     //
198:     'types' => [
199:         'Product' => ProductType::class,
200:         'ProductCategory' => ProductCategoryType::class,
201:         'ProductVariant' => ProductVariantType::class,
202:         'Order' => OrderType::class,
203:         'OrderItem' => OrderItemType::class,
204:         'OrderPayment' => OrderPaymentType::class,
205:         'Supplier' => SupplierType::class,
206:         'PurchaseOrder' => PurchaseOrderType::class,
207:         'PurchaseOrderItem' => PurchaseOrderItemType::class,
208:         'StockAdjustment' => StockAdjustmentType::class,
209:         'Location' => LocationType::class,
210:         'OrderItemInput' => OrderItemInputType::class,
211:         'Customer' => CustomerType::class,
212:         'ReturnOrder' => ReturnOrderType::class,
213:         'ReturnOrderItem' => ReturnOrderItemType::class,
214:         'ReturnOrderItemInput' => ReturnOrderItemInputType::class,
215:         'StockTransfer' => StockTransferType::class,
216:         'StockTransferItem' => StockTransferItemType::class,
217:         'StockTransferItemInput' => StockTransferItemInputType::class,
218:         'User' => UserType::class,
219:         'Role' => RoleType::class,
220:         'PurchaseOrderItemInput' => PurchaseOrderItemInputType::class,
221:         'PurchaseOrderReceiveItemInput' => PurchaseOrderReceiveItemInputType::class,
222:         'ProductSupplierInput' => ProductSupplierInputType::class,
223:         'ApprovalItem' => ApprovalItemType::class,
224:         'Shipment' => ShipmentType::class,
225:         'ShipmentItem' => ShipmentItemType::class,
226:     ],
227: 
228:     // The types will be loaded on demand. Default is to load all types on each request
229:     // Can increase performance on schemes with many types
230:     // Presupposes the config type key matches the type class name property
231:     'lazyload_types' => true,
232: 
233:     // This callable will be passed the Error object for each errors GraphQL catch.
234:     // The method should return an array representing the error.
235:     // Typically:
236:     // [
237:     //     'message' => '',
238:     //     'locations' => []
239:     // ]
240:     'error_formatter' => [\Rebing\GraphQL\GraphQL::class, 'formatError'],
241: 
242:     /*
243:      * Custom Error Handling
244:      *
245:      * Expected handler signature is: function (array $errors, callable $formatter): array
246:      *
247:      * The default handler will pass exceptions to laravel and return
248:      * @see \Rebing\GraphQL\GraphQL::handleErrors()
249:      * $errors is an array of \GraphQL\Error\Error
250:      * $formatter is the default error formatter from the library
251:      */
252:     'errors_handler' => [\Rebing\GraphQL\GraphQL::class, 'handleErrors'],
253: 
254:     /*
255:      * Options to limit the query complexity and depth. See the doc
256:      * @ https://webonyx.github.io/graphql-php/security
257:      * for details. Defaults to 0 (disabled).
258:      */
259:     'security' => [
260:         'query_max_complexity' => 200,
261:         'query_max_depth' => 10,
262:         'disable_introspection' => env('APP_ENV') === 'production',
263:     ],
264: 
265:     /*
266:      * You can define your own pagination type.
267:      * Reference \Rebing\GraphQL\Support\PaginationType::class
268:      */
269:     'pagination_type' => \Rebing\GraphQL\Support\PaginationType::class,
270: 
271:     /*
272:      * You can define your own simple pagination type.
273:      * Reference \Rebing\GraphQL\Support\SimplePaginationType::class
274:      */
275:     'simple_pagination_type' => \Rebing\GraphQL\Support\SimplePaginationType::class,
276: 
277:     /*
278:      * Config for GraphiQL (see (https://github.com/graphql/graphiql).
279:      */
280:     'graphiql' => [
281:         'prefix' => '/graphiql',
282:         'controller' => \Rebing\GraphQL\GraphQLController::class . '@graphiql',
283:         'middleware' => [],
284:         'view' => 'graphql::graphiql',
285:         'display' => env('ENABLE_GRAPHIQL', false),
286:     ],
287: 
288:     /*
289:      * Overrides the default field resolver
290:      * See http://webonyx.github.io/graphql-php/data-fetching/#default-field-resolver
291:      *
292:      * Example:
293:      *
294:      * 'defaultFieldResolver' => function ($root, $args, $context, $info) {
295:      * },
296:      */
297:     'defaultFieldResolver' => null,
298: 
299:     /*
300:      * Any headers that will be added to the response returned by the default controller
301:      */
302:     'headers' => [],
303: 
304:     /*
305:      * Any JSON encoding options when returning a response from the default controller
306:      * See http://php.net/manual/function.json-encode.php for the full list of options
307:      */
308:     'json_encoding_options' => 0,
309: 
310:     /*
311:      * Automatic Persisted Queries (APQ)
312:      * See https://www.apollographql.com/docs/apollo-server/performance/apq/
313:      *
314:      * Note 1: this requires the `AutomaticPersistedQueriesMiddleware` being enabled
315:      *
316:      * Note 2: even if APQ is disabled per configuration and also the middleware
317:      *         itself is not added, the hash will still be extracted from the request,
318:      *         as it is done in the `GraphQLUploadMiddleware` already.
319:      */
320:     'apq' => [
321:         // Enable/Disable APQ - See https://www.apollographql.com/docs/apollo-server/performance/apq/#disabling-apq
322:         'enable' => env('GRAPHQL_APQ_ENABLE', false),
323: 
324:         // The cache driver to use for APQ
325:         'cache_driver' => env('GRAPHQL_APQ_CACHE_DRIVER', config('cache.default')),
326: 
327:         // The cache prefix
328:         'cache_prefix' => config('cache.prefix') . ':graphql:apq:',
329: 
330:         // The cache ttl in seconds - See https://www.apollographql.com/docs/apollo-server/performance/apq/#adjusting-cache-time-to-live-ttl
331:         'cache_ttl' => 300,
332:     ],
333: 
334:     /*
335:      * Execution middlewares
336:      */
337:     'execution_middleware' => [
338:         \Rebing\GraphQL\Support\ExecutionMiddleware\ValidateOperationParamsMiddleware::class,
339:         // AutomaticPersistedQueriesMiddleware listed even if APQ is disabled, as the
340:         // temporary parsed request data is also used by the GraphQLUploadMiddleware
341:         \Rebing\GraphQL\Support\ExecutionMiddleware\AutomaticPersistedQueriesMiddleware::class,
342:         \Rebing\GraphQL\Support\ExecutionMiddleware\AddAuthUserContextValueMiddleware::class,
343:     ],
344: ];
```

