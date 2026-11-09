# 35. Shipping and Carrier Services — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Shipping and Carrier Services as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Shipping settings; sender address; parcel units; manual/provider shipments; rate/label flow; tracking/delivery updates; shipment items and partial fulfillment.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Orders, Payments and Documents](../modules/12_orders.md), [Warehouses](../modules/20_warehouses.md), [Organization, Email and Preferences](../modules/33_organization_settings.md), [API Tokens, Webhooks and External Interfaces](../modules/37_api_webhooks.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Settings/Shipping.vue` | Pending | Pending |

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

- [ ] Manual shipment persists and does not rededuct order stock.
- [ ] provider test mode is distinct from paid purchase.
- [ ] parcel units remain ounces/inches.
- [ ] purchased/provider status requires actual provider evidence.
- [ ] webhook replay cannot duplicate fulfillment.

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

- [Shipping nested workflow](#e0168)
- [resources/js/Components/Shipping/ShipOrderModal.vue](#e0204)
- [resources/js/Components/Shipping/ShipmentsPanel.vue](#e0205)
- [app/Models/Shipping/Shipment.php](#e0249)
- [app/Models/Shipping/ShipmentItem.php](#e0250)
- [`resources/js/Pages/Settings/Shipping.vue`](#e0363)
- [`app/Http/Controllers/ShippingSettingsController.php`](#e0424)
- [`app/Enums/ShipmentStatus.php`](#e0509)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0168"></a>

> Audit provenance: `commerce.md` lines 46–58. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Shipping nested workflow

Details → (manual save/optional shipped) OR (EasyPost pending shipment → rates → buy label → download/print). Existing pending carrier shipment can resume rates. External label purchase has money/side effects; exclude from unapproved test runs.

- Line quantities default all remaining per order item; only >0 submitted. At least one selected in UI. Backend membership and remaining quantities remain authoritative.
- Carrier defaults EasyPost if available, else manual. Warehouse defaults configured defaultWarehouseId or blank. Parcel weight_oz/length_in/width_in/height_in from suggested parcel or blank. Units are ounces/inches, not kilograms/centimeters.
- Manual carrier fields: carrier_name, service, tracking_number, tracking_url, cost, mark_shipped=true. Notify customer defaults enabled only when settings permit and customer email exists. Manual payload does not send to_address.
- EasyPost address fields: name, company, street1, street2, city, state, zip, country, phone; prefilled from shipping context. Rates returns selectable rate ID; buy submits `rate_id`.
- Validation: carrier from configured available carriers; carrier/service/tracking max100; tracking_url http/https max2048; nonnegative cost max999999; optional currency size3 (API-only; no visible modal currency); warehouse exists in organization; weight max100000, dimensions max10000; items <=500, integer nonnegative quantities; address values nullable strings max255. Provider can impose stronger address/parcel rules.
- ShipmentsPanel exposes mark shipped, cancel, rates/resume and label download conditionally by status/capability. Partial shipment changes order toward processing, full to shipped, carrier delivery can complete delivered state. Treat paid label vs physical shipment separately.

Evidence: [shipment request](C:/Users/proj/Inventoros/app/Http/Controllers/Order/ShipmentController.php#L36), [shipping command](C:/Users/proj/Inventoros/app/Services/Shipping/ShipmentService.php#L79), [order synchronization](C:/Users/proj/Inventoros/app/Services/Shipping/ShipmentService.php#L451).



<a id="e0204"></a>

> Audit provenance: `commerce.md` lines 2943–3045. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Components/Shipping/ShipOrderModal.vue

Source: [resources/js/Components/Shipping/ShipOrderModal.vue:1](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L1).


**Named routes referenced:** `orders.shipments.store`, `shipments.buy`, `shipments.label`, `shipments.rates`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: step === 'rates' ? Choose a rate : Ship items (L225)


**UI state/filter defaults:**

```text
36: const step = ref('details');
37: const busy = ref(false);
38: const error = ref('');
39: const errors = ref({});
40: const shipment = ref(null);
41: const rates = ref([]);
42: const selectedRate = ref('');
43: const changed = ref(false);
45: const form = reactive({});
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.carrier` | option.label | input / radio | No extra control attribute; server rules below | — | [resources/js/Components/Shipping/ShipOrderModal.vue:255](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L255) |

| `form.quantities[line.order_item_id]` | Qty | input / number | min=0; :max=line.remaining; :disabled=line.remaining === 0 | — | [resources/js/Components/Shipping/ShipOrderModal.vue:271](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L271) |

| `form.warehouse_id` | Ship from | select | No extra control attribute; server rules below | : None; warehouse.id: warehouse.name [repeat warehouse in shipping.warehouses] | [resources/js/Components/Shipping/ShipOrderModal.vue:288](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L288) |

| `form.weight_oz` | Weight (oz) | input / number | min=0; step=0.1 | — | [resources/js/Components/Shipping/ShipOrderModal.vue:295](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L295) |

| `form[field]` | t(`shipping.${label}`) | input / number | min=0; step=0.1 | — | [resources/js/Components/Shipping/ShipOrderModal.vue:302](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L302) |

| `form.to_address[field]` | t(`shipping.address.${field}`) | input / text | :maxlength=field === 'country' ? 2 : 255 | — | [resources/js/Components/Shipping/ShipOrderModal.vue:312](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L312) |

| `form.carrier_name` | Carrier | input / text | maxlength=100 | — | [resources/js/Components/Shipping/ShipOrderModal.vue:322](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L322) |

| `form.service` | Service | input / text | maxlength=100 | — | [resources/js/Components/Shipping/ShipOrderModal.vue:326](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L326) |

| `form.tracking_number` | Tracking number | input / text | maxlength=100 | — | [resources/js/Components/Shipping/ShipOrderModal.vue:330](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L330) |

| `form.cost` | Shipping cost | input / number | min=0; step=0.01 | — | [resources/js/Components/Shipping/ShipOrderModal.vue:334](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L334) |

| `form.tracking_url` | Tracking link | input / url | maxlength=2048 | — | [resources/js/Components/Shipping/ShipOrderModal.vue:339](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L339) |

| `form.mark_shipped` | Mark as shipped now | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Components/Shipping/ShipOrderModal.vue:344](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L344) |

| `form.notify_customer` | Email tracking details to {email} | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Components/Shipping/ShipOrderModal.vue:350](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L350) |

| `selectedRate` | rate.carrier rate.service Est. {count} day \\| Est. {count} days formatMoney(rate.amount, rate.currency) | input / radio | No extra control attribute; server rules below | — | [resources/js/Components/Shipping/ShipOrderModal.vue:375](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L375) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Components/Shipping/ShipOrderModal.vue:45](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L45)

```text
45: const form = reactive({});
46: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| t('shipping.close') | `type=button; @click=close` | [resources/js/Components/Shipping/ShipOrderModal.vue:228](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L228) |

| Cancel | `:disabled=busy; @click=close` | [resources/js/Components/Shipping/ShipOrderModal.vue:355](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L355) |

| isManual ? Save shipment : Create shipment and get rates | `type=submit; :loading=busy; :disabled=busy \|\| selectedTotal === 0` | [resources/js/Components/Shipping/ShipOrderModal.vue:356](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L356) |

| Get rates | `:disabled=busy; @click=fetchRates` | [resources/js/Components/Shipping/ShipOrderModal.vue:385](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L385) |

| Buy label | `:loading=busy; :disabled=busy \|\| !selectedRate; @click=buyLabel` | [resources/js/Components/Shipping/ShipOrderModal.vue:386](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L386) |

| Download label | `v-if=shipment?.has_label; :href=route('shipments.label', shipment.id)` | [resources/js/Components/Shipping/ShipOrderModal.vue:394](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L394) |

| Close | `@click=close` | [resources/js/Components/Shipping/ShipOrderModal.vue:405](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipOrderModal.vue#L405) |


**Conditional sections / submit boundaries (source expressions):**

```text
217: <div v-if="show" class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8" @click="close">
238: <div v-if="error" class="mb-4 rounded-lg border border-status-danger/20 bg-status-danger-soft px-4 py-3 text-sm text-status-danger" role="alert">
243: <form v-if="step === 'details'" class="space-y-6" @submit.prevent="submitDetails">
244: <div v-if="hasEasyPost">
307: <div v-if="!isManual">
349: <label v-if="shipping.customerEmail" class="flex items-center gap-2 text-sm text-text-primary">
395: v-if="shipment?.has_label"
```




<a id="e0205"></a>

> Audit provenance: `commerce.md` lines 3046–3105. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Components/Shipping/ShipmentsPanel.vue

Source: [resources/js/Components/Shipping/ShipmentsPanel.vue:1](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipmentsPanel.vue#L1).


**Named routes referenced:** `shipments.label`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Shipments (L69)


**UI state/filter defaults:**

```text
24: const showModal = ref(false);
25: const resumeShipment = ref(null);
26: const acting = ref(null);
```


No editable model-bound controls in this file; navigation and action-only controls listed below.



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Ship | `v-if=canShip; @click=openShip()` | [resources/js/Components/Shipping/ShipmentsPanel.vue:70](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipmentsPanel.vue#L70) |

| Download label | `v-if=shipment.has_label && shipment.status !== 'cancelled'; :href=route('shipments.label', shipment.id)` | [resources/js/Components/Shipping/ShipmentsPanel.vue:130](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipmentsPanel.vue#L130) |

| Get rates | `v-if=shipment.status === 'pending' && shipment.carrier !== 'manual'; @click=openShip(shipment)` | [resources/js/Components/Shipping/ShipmentsPanel.vue:143](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipmentsPanel.vue#L143) |

| Mark shipped | `v-if=['pending', 'label_created'].includes(shipment.status); :loading=acting === shipment.id; @click=post('shipments.ship', shipment)` | [resources/js/Components/Shipping/ShipmentsPanel.vue:151](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipmentsPanel.vue#L151) |

| Void label | `v-if=shipment.status === 'label_created' && shipment.carrier !== 'manual'; :disabled=acting === shipment.id; @click=post('shipments.cancel', shipment, t('shipping.confirmVoid'))` | [resources/js/Components/Shipping/ShipmentsPanel.vue:161](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipmentsPanel.vue#L161) |

| Cancel shipment | `:disabled=acting === shipment.id; @click=post('shipments.cancel', shipment, t('shipping.confirmCancel'))` | [resources/js/Components/Shipping/ShipmentsPanel.vue:170](C:/Users/proj/Inventoros/resources/js/Components/Shipping/ShipmentsPanel.vue#L170) |


**Conditional sections / submit boundaries (source expressions):**

```text
70: <Button v-if="canShip" size="sm" @click="openShip()">
80: <div v-if="shipments.length" class="space-y-3">
95: v-if="shipment.tracking_url"
127: v-if="shipment.has_label || (shipping.canCreate && ['pending', 'label_created'].includes(shipment.status))"
131: v-if="shipment.has_label && shipment.status !== 'cancelled'"
142: <template v-if="shipping.canCreate">
144: v-if="shipment.status === 'pending' && shipment.carrier !== 'manual'"
152: v-if="['pending', 'label_created'].includes(shipment.status)"
162: v-if="shipment.status === 'label_created' && shipment.carrier !== 'manual'"
```




<a id="e0249"></a>

> Audit provenance: `commerce.md` lines 4906–4960. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Shipping/Shipment.php

[app/Models/Shipping/Shipment.php:1](C:/Users/proj/Inventoros/app/Models/Shipping/Shipment.php#L1)


```php
protected $fillable = [
        'organization_id',
        'order_id',
        'warehouse_id',
        'created_by',
        'carrier',
        'carrier_name',
        'service',
        'tracking_number',
        'tracking_url',
        'to_address',
        'from_address',
        'label_path',
        'label_url',
        'carrier_shipment_id',
        'carrier_tracker_id',
        'carrier_rates',
        'carrier_response',
        'cost',
        'currency',
        'weight_oz',
        'length_in',
        'width_in',
        'height_in',
        'status',
        'tracking_status_detail',
        'notify_customer',
        'customer_notified_at',
        'customer_notification_queued_at',
        'shipped_at',
        'delivered_at',
        'last_tracked_at',
    ];
```


```php
114: 'cost' => 'decimal:2',
115: 'weight_oz' => 'decimal:2',
116: 'length_in' => 'decimal:2',
117: 'width_in' => 'decimal:2',
118: 'height_in' => 'decimal:2',
133: return $this->belongsTo(Order::class);
143: return $this->belongsTo(Warehouse::class);
151: return $this->belongsTo(User::class, 'created_by');
159: return $this->hasMany(ShipmentItem::class);
```




<a id="e0250"></a>

> Audit provenance: `commerce.md` lines 4961–4980. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Shipping/ShipmentItem.php

[app/Models/Shipping/ShipmentItem.php:1](C:/Users/proj/Inventoros/app/Models/Shipping/ShipmentItem.php#L1)


```php
protected $fillable = [
        'shipment_id',
        'order_item_id',
        'quantity',
    ];
```


```php
39: return $this->belongsTo(Shipment::class);
47: return $this->belongsTo(OrderItem::class);
```




<a id="e0363"></a>

> Audit provenance: `platform-source-catalog.md` lines 2852–2909. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Shipping.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Settings/Shipping.vue:105`: `<input v-model="form.easypost_enabled" type="checkbox" />`
- `resources/js/Pages/Settings/Shipping.vue:111`: `<input v-model="form.easypost_test_mode" type="checkbox" />`
- `resources/js/Pages/Settings/Shipping.vue:120`: `<input id="easypost_test_api_key" v-model="form.easypost_test_api_key" type="password" autocomplete="new-password" :placeholder="settings.easypost_test_api_key_set ? t('shipping.settings.secretSaved') : 'EZTK...'" />`
- `resources/js/Pages/Settings/Shipping.vue:132`: `<input id="easypost_api_key" v-model="form.easypost_api_key" type="password" autocomplete="new-password" :placeholder="settings.easypost_api_key_set ? t('shipping.settings.secretSaved') : 'EZAK...'" />`
- `resources/js/Pages/Settings/Shipping.vue:164`: `<input id="easypost_webhook_secret" v-model="form.easypost_webhook_secret" type="password" autocomplete="new-password" :placeholder="settings.easypost_webhook_secret_set ? t('shipping.settings.secretSaved') : ''" />`
- `resources/js/Pages/Settings/Shipping.vue:184`: `<select id="default_warehouse_id" v-model="form.default_warehouse_id">`
- `resources/js/Pages/Settings/Shipping.vue:197`: `<input :id="&#96;from_${field}&#96;" v-model="form.from_address[field]" :type="field === 'email' ? 'email' : 'text'" :maxlength="field === 'country' ? 2 : 255" />`
- `resources/js/Pages/Settings/Shipping.vue:214`: `<input :id="&#96;parcel_${field}&#96;" v-model="form.default_parcel[field]" type="number" min="0" step="0.1" />`
- `resources/js/Pages/Settings/Shipping.vue:220`: `<input v-model="form.notify_customers" type="checkbox" />`

**Form initial state/defaults:**
```js
22: const form = useForm({
23:     easypost_enabled: !!props.settings.easypost_enabled,
24:     easypost_test_mode: !!props.settings.easypost_test_mode,
25:     easypost_api_key: '',
26:     easypost_test_api_key: '',
27:     easypost_webhook_secret: '',
28:     default_warehouse_id: props.settings.default_warehouse_id ?? '',
29:     from_address: Object.fromEntries(addressFields.map((f) => [f, props.settings.from_address?.[f] ?? ''])),
30:     default_parcel: {
31:         weight_oz: props.settings.default_parcel?.weight_oz ?? '',
32:         length_in: props.settings.default_parcel?.length_in ?? '',
33:         width_in: props.settings.default_parcel?.width_in ?? '',
34:         height_in: props.settings.default_parcel?.height_in ?? '',
35:     },
36:     notify_customers: !!props.settings.notify_customers,
37: });
```

**Select option values/labels (dynamic options retain their source):**
```html
185: <option value="">{{ t('shipping.settings.none') }}</option>
186: <option v-for="warehouse in warehouses" :key="warehouse.id" :value="warehouse.id">{{ warehouse.name }}</option>
```

**View filters, permission/action and navigation anchors:**
```js
42: .patch(route('settings.shipping.update'), {
48: const copied = ref(false);
59: const rotating = ref(false);
62: router.post(route('settings.shipping.webhook-token'), {}, {
```

**Displayed data/value expressions:**
```text
128: form.errors.easypost_test_api_key
140: form.errors.easypost_api_key
151: copied ? t('shipping.settings.copied') : t('shipping.settings.copy')
172: form.errors.easypost_webhook_secret
186: warehouse.name
188: form.errors.default_warehouse_id
204: form.errors[`from_address.${field}`]
```



<a id="e0424"></a>

> Audit provenance: `platform-source-catalog.md` lines 4611–4634. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/ShippingSettingsController.php`
```php
24:     private const SECRETS = ['easypost_api_key', 'easypost_test_api_key', 'easypost_webhook_secret'];
25: 
26:     public function index(Request $request): Response
31:         return Inertia::render('Settings/Shipping', [
51:     public function update(Request $request): RedirectResponse
84:         $validator->after(function (Validator $v) use ($request, $settings) {
98:         $validated = $validator->validate();
99: 
100:         $settings->fill([
101:             'easypost_enabled' => (bool) $validated['easypost_enabled'],
102:             'easypost_test_mode' => (bool) $validated['easypost_test_mode'],
103:             'default_warehouse_id' => $validated['default_warehouse_id'] ?? null,
104:             'from_address' => $this->filled($validated['from_address'] ?? []),
105:             'default_parcel' => $this->filled($validated['default_parcel'] ?? []),
106:             'notify_customers' => (bool) $validated['notify_customers'],
107:         ]);
115:         $settings->save();
123:     public function rotateWebhookToken(Request $request): RedirectResponse
126:         $settings->forceFill(['webhook_token' => ShippingSetting::newWebhookToken()])->save();
135:     private function filled(array $values): ?array
```



<a id="e0509"></a>

> Audit provenance: `additional-contracts.md` lines 1759–1840. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Enums/ShipmentStatus.php`

[Source evidence](C:/Users/proj/Inventoros/app/Enums/ShipmentStatus.php#L1). SHA-256: `139d1a5f9da5c108bfd6c3f4062c9f473e7f871f12f1932195d4c23a6049ff6e`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: /**
8:  * The lifecycle of a Shipment.
9:  *
10:  *   pending        created, lines allocated, nothing bought or sent yet
11:  *   label_created  a carrier label has been bought (it can still be voided)
12:  *   shipped        handed to the carrier
13:  *   in_transit     the carrier has scanned it on its way
14:  *   delivered      the carrier reports delivery
15:  *   exception      the carrier reports a problem (returned, failed, lost)
16:  *   cancelled      voided or abandoned before it left; frees its quantities
17:  */
18: enum ShipmentStatus: string
19: {
20:     case PENDING = 'pending';
21:     case LABEL_CREATED = 'label_created';
22:     case SHIPPED = 'shipped';
23:     case IN_TRANSIT = 'in_transit';
24:     case DELIVERED = 'delivered';
25:     case EXCEPTION = 'exception';
26:     case CANCELLED = 'cancelled';
27: 
28:     /**
29:      * Whether the goods in this shipment have physically left the warehouse.
30:      */
31:     public function hasLeft(): bool
32:     {
33:         return in_array($this, [self::SHIPPED, self::IN_TRANSIT, self::DELIVERED, self::EXCEPTION], true);
34:     }
35: 
36:     /**
37:      * Whether the shipment can still be cancelled (or its label voided).
38:      */
39:     public function isCancellable(): bool
40:     {
41:         return in_array($this, [self::PENDING, self::LABEL_CREATED], true);
42:     }
43: 
44:     public function label(): string
45:     {
46:         return match ($this) {
47:             self::PENDING => 'Pending',
48:             self::LABEL_CREATED => 'Label created',
49:             self::SHIPPED => 'Shipped',
50:             self::IN_TRANSIT => 'In transit',
51:             self::DELIVERED => 'Delivered',
52:             self::EXCEPTION => 'Exception',
53:             self::CANCELLED => 'Cancelled',
54:         };
55:     }
56: 
57:     /**
58:      * Statuses whose goods have left the warehouse, as plain values.
59:      *
60:      * @return array<int, string>
61:      */
62:     public static function leftValues(): array
63:     {
64:         return [self::SHIPPED->value, self::IN_TRANSIT->value, self::DELIVERED->value, self::EXCEPTION->value];
65:     }
66: 
67:     /**
68:      * @return array<int, string>
69:      */
70:     public static function values(): array
71:     {
72:         return array_column(self::cases(), 'value');
73:     }
74: }
```


