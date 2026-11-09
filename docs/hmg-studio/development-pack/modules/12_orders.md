# 12. Orders, Payments and Documents — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Orders, Payments and Documents as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Sales order create/edit/detail/list; line discounts and order totals; approval; payment/refund/void ledger; invoices; shipment links; cancel and stock consequences.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Inventory / Products](../modules/11_inventory.md), [Customers](../modules/13_customers.md), [Approvals](../modules/17_approvals.md), [Stock by Warehouse](../modules/22_stock_by_warehouse.md), [Shipping and Carrier Services](../modules/35_shipping.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Orders/Create.vue` | Pending | Pending |
| `resources/js/Pages/Orders/Edit.vue` | Pending | Pending |
| `resources/js/Pages/Orders/Index.vue` | Pending | Pending |
| `resources/js/Pages/Orders/Show.vue` | Pending | Pending |

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

- [ ] Create order and verify source-accurate initial stock effect including pending approval.
- [ ] shipping must not deduct again.
- [ ] partial payments/refunds/voids reconcile outstanding balance.
- [ ] unauthorized/replayed commands cannot post duplicate effects.

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

- [Sales orders: exact source behavior](#e0166)
- [Payment/refund/void and invoice subflows](#e0167)
- [resources/js/Pages/Orders/Create.vue](#e0184)
- [resources/js/Pages/Orders/Edit.vue](#e0185)
- [resources/js/Pages/Orders/Index.vue](#e0186)
- [resources/js/Pages/Orders/Show.vue](#e0187)
- [resources/js/Components/SendDocumentModal.vue](#e0203)
- [resources/js/Components/TaxInput.vue](#e0206)
- [resources/js/Components/DiscountInput.vue](#e0207)
- [resources/js/Components/CurrencySelect.vue](#e0209)
- [RecordOrderPaymentRequest.php](#e0215)
- [StoreOrderRequest.php](#e0216)
- [UpdateOrderRequest.php](#e0217)
- [SendDocumentEmailRequest.php](#e0226)
- [app/Models/Order/Order.php](#e0242)
- [app/Models/Order/OrderItem.php](#e0243)
- [app/Models/Order/OrderPayment.php](#e0244)
- [`app/Http/Requests/Api/Order/ApproveOrderRequest.php`](#e0474)
- [`app/Http/Requests/Api/Order/RejectOrderRequest.php`](#e0475)
- [`app/Enums/DiscountType.php`](#e0502)
- [`app/Enums/OrderApprovalStatus.php`](#e0503)
- [`app/Enums/OrderStatus.php`](#e0504)
- [`app/Enums/PaymentMethod.php`](#e0505)
- [`app/Enums/PaymentStatus.php`](#e0506)
- [`app/Enums/PaymentType.php`](#e0507)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0166"></a>

> Audit provenance: `commerce.md` lines 24–35. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Sales orders: exact source behavior

1. Choose saved customer with `CustomerPicker` or type a one-off name/email/address. Saved selection sets `customer_id`, fills values; clearing unlinks only, retaining editable details. Create changes currency to the customer's currency and reprices existing lines; Edit does not change currency.
2. Add product and variant (required when product uses variants). Create picker offers active variants with stock; scanner reconciles against form product data. Duplicate product+variant merges quantity. New line price comes from product/variant catalog in order currency; unavailable price remains blank, not zero. Edit retains already-selected inactive variant as a permitted display choice; product change resets variant.
3. `items[]` requires >=1 row. Quantity integer >=1; price decimal<=2 places >=0. Item identity, product/variant relationship and stock are server checked. Create order status defaults `pending`; date defaults today; shipping/tax zero; discounts absent; notes blank.
4. Order and line discounts each have type none/percent/fixed and value. None clears value; percent UI max100; fixed discounts cannot make line/order negative. Server computes exact-money totals. Tax control stores **amount only**; optional UI-only rate 0..100 step.001 recalculates amount as taxable base changes; entering amount clears rate. Line discounts apply before order discount, then tax and shipping.
5. **Ordinary order creation immediately deducts stock, including pending-approval orders. Shipment does not deduct the same stock again.** Do not silently implement reserve-on-order/deduct-on-ship and call it parity. If HMG chooses that alternate policy, document it as an approved deviation.
6. Approval-dependent create/edit must block shipped/delivered while awaiting approval. Order cancellation/rejection restores only stock actually consumed and still eligible for release, under locks. Shipped/delivered cancellation is refused; return workflow is separate. Cancelled line replacement is refused. Delete is not permission to restore already-returned stock twice. Edit replacing items must reconcile stock through shared service, not direct row updates.
7. Source order status, approval status, payment status and shipment status are independent dimensions. Never collapse them into one field. Order edit does not offer a currency field; backend update contract also omits currency.

Evidence: [Order creation](C:/Users/proj/Inventoros/app/Services/OrderService.php#L73), [creation transaction](C:/Users/proj/Inventoros/app/Services/OrderService.php#L126), [stock movement](C:/Users/proj/Inventoros/app/Services/OrderService.php#L287), [cancel](C:/Users/proj/Inventoros/app/Services/OrderService.php#L375), [reject](C:/Users/proj/Inventoros/app/Services/OrderService.php#L447), [replace items](C:/Users/proj/Inventoros/app/Services/OrderService.php#L771).



<a id="e0167"></a>

> Audit provenance: `commerce.md` lines 36–45. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Payment/refund/void and invoice subflows

- Record payment modal: `type=payment` (refund action sets `refund`); amount defaults balance due, refund amount defaults currently paid; method defaults card, choices cash/card/bank_transfer/cheque/other; reference blank; paid_at today; notes blank; allow_overpayment false and only shown for payment. Amount >0, <=99999999, maximum 2 decimals; reference max255; notes max2000.
- `record_payments` required; backend order lock recalculates balance. Overpayment rejected unless explicitly allowed; cancelled order refuses new receipts but can refund. Refund capped by net paid. No automatic card/bank movement proven: this records a ledger entry.
- Void uses `reason` optional string max255. Existing payment row is retained with void actor/time/reason. Cannot void a receipt if that leaves refunds greater than receipts; void refunds first. Concurrent submissions serialize on order, but this does **not** prove every endpoint has explicit idempotency keys.
- Legacy bulk “Mark older orders as paid” has `before` required `Y-m-d` default configured cutoff or today, separate permission/action and confirmation. Do not ship accidental historical mass mutations.
- Invoice preview/download, email, queued/sent/issued metadata are separate. SendDocument fields `to` defaults customer/supplier email, `cc` blank, `message` blank. Modal requires recipient email, max255; server recipient is nullable and falls back to record. CC comma-separated string or array, max5 addresses; raw string max1000; each email max255; message max2000. Queued email is not delivered-email proof.

Evidence: [Payment invariants](C:/Users/proj/Inventoros/app/Services/OrderPaymentService.php#L21), [payment request](C:/Users/proj/Inventoros/app/Http/Requests/Order/RecordOrderPaymentRequest.php#L27), [email rules](C:/Users/proj/Inventoros/app/Http/Requests/SendDocumentEmailRequest.php#L30), [recipient limits](C:/Users/proj/Inventoros/app/Services/Documents/DocumentRecipients.php#L20).



<a id="e0184"></a>

> Audit provenance: `commerce.md` lines 930–1059. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Orders/Create.vue

Source: [resources/js/Pages/Orders/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L1).


**Named routes referenced:** `orders.index`, `orders.store`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Customer Information (L291)
- h3: Order Items (L316)
- h3: Order Details (L423)
- h3: Order Summary (L459)


**UI state/filter defaults:**

```text
51: const selectedCustomer = ref(null);
72: const selectedProduct = ref(null);
73: const selectedVariant = ref(null);
74: const quantity = ref(1);
75: const variantError = ref('');
135: const showScanner = ref(false);
136: const scanMessage = ref('');
137: const scanMessageTone = ref('info');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.customer_name` | Customer Name * | input / text | HTML required | — | [resources/js/Pages/Orders/Create.vue:297](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L297) |

| `form.customer_email` | Customer Email | input / email | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Create.vue:302](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L302) |

| `form.customer_address` | Shipping Address | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Create.vue:307](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L307) |

| `selectedProduct` | Select Product | select | @change=onProductChange | null: Choose a product...; product.id: product.name ( product.sku ) product.name ( product.sku ) - Stock: {count} - formatMoney(product.price, product.currency) [repeat product in availableProducts] | [resources/js/Pages/Orders/Create.vue:344](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L344) |

| `selectedVariant` | Variant | select | @change=variantError = '' | null: Choose a variant...; variant.id: variant.title ( variant.sku ) - Stock: {count} - formatMoney(variant.price, chosenProduct?.currency) [repeat variant in availableVariants] | [resources/js/Pages/Orders/Create.vue:354](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L354) |

| `quantity` | Quantity | input / number | min=1 | — | [resources/js/Pages/Orders/Create.vue:364](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L364) |

| `item.quantity` | Qty * | input / number | min=1; @input=updateItemQuantity(index, parseInt($event.target.value)) | — | [resources/js/Pages/Orders/Create.vue:387](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L387) |

| `item.unit_price` | Unit Price | input / number | min=0; step=0.01; @input=updateItemPrice(index, $event.target.value) | — | [resources/js/Pages/Orders/Create.vue:391](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L391) |

| `item.discount_type` | Line discount | DiscountInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Create.vue:400](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L400) |

| `item.discount_value` | Line discount | DiscountInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Create.vue:400](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L400) |

| `form.order_date` | Order Date * | input / date | HTML required | — | [resources/js/Pages/Orders/Create.vue:427](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L427) |

| `form.currency` | Currency | select | @change=repriceLines | currency.code: currency.code - currency.name [repeat currency in currencies] | [resources/js/Pages/Orders/Create.vue:432](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L432) |

| `form.status` | Status * | select | HTML required | pending: Pending; processing: Processing; shipped: Shipped; delivered: Delivered; cancelled: Cancelled | [resources/js/Pages/Orders/Create.vue:440](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L440) |

| `form.notes` | Notes | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Create.vue:452](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L452) |

| `form.discount_type` | Order discount | DiscountInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Create.vue:470](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L470) |

| `form.discount_value` | Order discount | DiscountInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Create.vue:470](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L470) |

| `form.tax` | (dynamic/unlabelled; see source) | TaxInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Create.vue:483](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L483) |

| `form.shipping` | Shipping | input / number | min=0; step=0.01 | — | [resources/js/Pages/Orders/Create.vue:486](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L486) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/Orders/Create.vue:35](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L35)

```text
35: const form = useForm({
36:     customer_id: null,
37:     customer_name: '',
38:     customer_email: '',
39:     customer_address: '',
40:     currency: props.defaultCurrency,
41:     status: 'pending',
42:     order_date: todayIsoDate(),
43:     shipping: 0,
44:     tax: 0,
45:     discount_type: '',
46:     discount_value: null,
47:     notes: '',
48:     items: [],
49: });
50: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('orders.index')` | [resources/js/Pages/Orders/Create.vue:268](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L268) |

| Orders | `:href=route('orders.index')` | [resources/js/Pages/Orders/Create.vue:270](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L270) |

| Back to Orders | `:href=route('orders.index')` | [resources/js/Pages/Orders/Create.vue:278](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L278) |

| Scan | `type=button; @click=showScanner = true` | [resources/js/Pages/Orders/Create.vue:317](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L317) |

| Add | `type=button; @click=addItem` | [resources/js/Pages/Orders/Create.vue:367](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L367) |

| t('common.delete') | `type=button; @click=removeItem(index)` | [resources/js/Pages/Orders/Create.vue:397](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L397) |

| form.processing ? Creating Order... : Create Order | `type=submit; :loading=form.processing; :disabled=form.processing \|\| form.items.length === 0` | [resources/js/Pages/Orders/Create.vue:499](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L499) |

| Cancel | `:href=route('orders.index')` | [resources/js/Pages/Orders/Create.vue:502](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Create.vue#L502) |


**Conditional sections / submit boundaries (source expressions):**

```text
285: <form @submit.prevent="submit" class="mt-6">
325: v-if="scanMessage"
347: <template v-if="product.has_variants">{{ product.name }} ({{ product.sku }})</template>
352: <div v-if="chosenProduct?.has_variants" class="md:col-span-3">
357: {{ variant.title }}<template v-if="variant.sku"> ({{ variant.sku }})</template> - {{ t('orders.create.stockCount', { count: variant.stock }) }} - {{ formatMoney(variant.price, chosenProduct?.currency) }}
375: <div v-if="form.items.length > 0" class="space-y-3">
465: <div v-if="totals.lineDiscounts > 0" class="flex justify-between text-sm">
479: <div v-if="totals.orderDiscount > 0" class="flex justify-between text-sm">
```




<a id="e0185"></a>

> Audit provenance: `commerce.md` lines 1060–1188. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Orders/Edit.vue

Source: [resources/js/Pages/Orders/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L1).


**Named routes referenced:** `orders.index`, `orders.show`, `orders.update`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Customer Information (L155)
- h3: Order Items (L180)
- h3: Order Details (L318)
- h3: Order Summary (L358)


**UI state/filter defaults:**

```text
49: const selectedCustomer = ref(props.order.customer ?? null);
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.customer_name` | Customer Name * | input / text | HTML required | — | [resources/js/Pages/Orders/Edit.vue:161](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L161) |

| `form.customer_email` | Customer Email | input / email | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Edit.vue:166](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L166) |

| `form.customer_address` | Shipping Address | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Edit.vue:171](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L171) |

| `item.product_id` | Product | select | HTML required; @change=onProductChange(index) | : Select a product; product.id: product.name ( product.sku ) product.name ( product.sku ) - Stock: {count} [repeat product in products] | [resources/js/Pages/Orders/Edit.vue:206](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L206) |

| `item.product_variant_id` | Variant | select | HTML required; @change=onVariantChange(index) | null: Choose a variant...; variant.id: variant.title ( variant.sku ) - Stock: {count} - formatMoney(variant.price, order.currency) [repeat variant in variantsFor(item)] | [resources/js/Pages/Orders/Edit.vue:224](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L224) |

| `item.quantity` | Qty * | input / number | HTML required; min=1; step=1 | — | [resources/js/Pages/Orders/Edit.vue:245](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L245) |

| `item.unit_price` | Unit Price * | input / number | HTML required; min=0; step=0.01 | — | [resources/js/Pages/Orders/Edit.vue:262](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L262) |

| `item.discount_type` | Line discount | DiscountInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Edit.vue:299](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L299) |

| `item.discount_value` | Line discount | DiscountInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Edit.vue:299](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L299) |

| `form.order_date` | Order Date * | input / date | HTML required | — | [resources/js/Pages/Orders/Edit.vue:322](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L322) |

| `form.status` | Status * | select | HTML required | pending: Pending; processing: Processing; shipped: Shipped; delivered: Delivered; cancelled: Cancelled | [resources/js/Pages/Orders/Edit.vue:327](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L327) |

| `form.notes` | Notes | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Edit.vue:350](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L350) |

| `form.discount_type` | Order discount | DiscountInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Edit.vue:369](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L369) |

| `form.discount_value` | Order discount | DiscountInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Edit.vue:369](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L369) |

| `form.tax` | (dynamic/unlabelled; see source) | TaxInput | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Edit.vue:382](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L382) |

| `form.shipping` | Shipping | input / number | min=0; step=0.01 | — | [resources/js/Pages/Orders/Edit.vue:385](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L385) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/Orders/Edit.vue:26](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L26)

```text
26: const form = useForm({
27:     customer_id: props.order.customer_id ?? null,
28:     customer_name: props.order.customer_name,
29:     customer_email: props.order.customer_email,
30:     customer_address: props.order.customer_address,
31:     status: props.order.status,
32:     order_date: toIsoDate(props.order.order_date),
33:     shipping: props.order.shipping || 0,
34:     tax: props.order.tax || 0,
35:     discount_type: props.order.discount_type ?? '',
36:     discount_value: props.order.discount_value != null ? parseFloat(props.order.discount_value) : null,
37:     notes: props.order.notes || '',
38:     items: props.order.items.map(item => ({
39:         id: item.id,
40:         product_id: item.product_id,
41:         product_variant_id: item.product_variant_id ?? null,
42:         quantity: item.quantity,
43:         unit_price: parseFloat(item.unit_price),
44:         discount_type: item.discount_type ?? '',
45:         discount_value: item.discount_value != null ? parseFloat(item.discount_value) : null,
46:     })),
47: });
48: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('orders.index')` | [resources/js/Pages/Orders/Edit.vue:132](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L132) |

| Orders | `:href=route('orders.index')` | [resources/js/Pages/Orders/Edit.vue:134](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L134) |

| Back to Orders | `:href=route('orders.index')` | [resources/js/Pages/Orders/Edit.vue:142](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L142) |

| Add Item | `type=button; @click=addItem` | [resources/js/Pages/Orders/Edit.vue:181](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L181) |

| Add First Item | `type=button; @click=addItem` | [resources/js/Pages/Orders/Edit.vue:191](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L191) |

| t('common.delete') | `type=button; @click=removeItem(index)` | [resources/js/Pages/Orders/Edit.vue:288](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L288) |

| form.processing ? Updating Order... : Update Order | `type=submit; :loading=form.processing; :disabled=form.processing` | [resources/js/Pages/Orders/Edit.vue:399](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L399) |

| View Order Details | `:href=route('orders.show', order.id)` | [resources/js/Pages/Orders/Edit.vue:402](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L402) |

| Cancel | `:href=route('orders.index')` | [resources/js/Pages/Orders/Edit.vue:403](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Edit.vue#L403) |


**Conditional sections / submit boundaries (source expressions):**

```text
149: <form @submit.prevent="submit" class="mt-6">
188: <div v-if="form.items.length === 0" class="flex flex-col items-center gap-3 py-8 text-center">
215: <template v-if="product.has_variants">{{ product.name }} ({{ product.sku }})</template>
222: <template v-if="productFor(item.product_id)?.has_variants">
233: {{ variant.title }}<template v-if="variant.sku"> ({{ variant.sku }})</template> - {{ t('orders.create.stockCount', { count: variant.stock }) }} - {{ formatMoney(variant.price, order.currency) }}
338: <div v-if="order.shipped_at" class="text-sm">
343: <div v-if="order.delivered_at" class="text-sm">
364: <div v-if="totals.lineDiscounts > 0" class="flex justify-between text-sm">
378: <div v-if="totals.orderDiscount > 0" class="flex justify-between text-sm">
```




<a id="e0186"></a>

> Audit provenance: `commerce.md` lines 1189–1295. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Orders/Index.vue

Source: [resources/js/Pages/Orders/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L1).


**Named routes referenced:** `orders.create`, `orders.destroy`, `orders.edit`, `orders.index`, `orders.payments.mark-pre-tracking-paid`, `orders.show`.


**Permission/route-capability checks:** `delete_orders`, `orders.create`, `orders.edit`.


**Sections / displayed fields / table columns:**

- h3: Mark older orders as paid (L269)
- column `order_number`: Order (L86)
- column `customer_name`: Customer (L87)
- column `items`: Items (L88)
- column `total`: Total (L89)
- column `status`: Status (L90)
- column `payment_status`: Payment status (L92)
- column `source`: Source (L93)
- column `order_date`: Date (L94)
- column `actions`: Actions (L95)


**UI state/filter defaults:**

```text
40: const showMarkPaidModal = ref(false);
49: const search = ref(props.filters?.search || '');
50: const status = ref(props.filters?.status || '');
51: const source = ref(props.filters?.source || '');
52: const paymentStatus = ref(props.filters?.payment_status || '');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `search` | Search Orders | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Index.vue:139](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L139) |

| `status` | Status | select | No extra control attribute; server rules below | : All Statuses; stat: statusText(stat) [repeat stat in statuses] | [resources/js/Pages/Orders/Index.vue:148](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L148) |

| `source` | Source | select | No extra control attribute; server rules below | : All Sources; src: sourceText(src) [repeat src in sources] | [resources/js/Pages/Orders/Index.vue:155](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L155) |

| `paymentStatus` | Payment status | select | No extra control attribute; server rules below | : All payment statuses; ps: t(`payments.status.${ps}`) [repeat ps in paymentStatuses] | [resources/js/Pages/Orders/Index.vue:162](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L162) |

| `markPaidForm.before` | Placed before | input / date | HTML required | — | [resources/js/Pages/Orders/Index.vue:276](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L276) |


**Exact `markPaidForm` defaults / hydration / hidden payload** — [resources/js/Pages/Orders/Index.vue:41](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L41)

```text
41: const markPaidForm = useForm({ before: props.markPaidBefore || todayIsoDate() });
42: const submitMarkPaid = () => {
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Mark older orders paid | `v-if=canRecordPayments && untrackedOrderCount > 0; @click=showMarkPaidModal = true` | [resources/js/Pages/Orders/Index.vue:118](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L118) |

| Create Order | `v-if=canVisit('orders.create'); :href=route('orders.create')` | [resources/js/Pages/Orders/Index.vue:127](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L127) |

| Search | `type=submit` | [resources/js/Pages/Orders/Index.vue:140](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L140) |

| Search | `type=submit` | [resources/js/Pages/Orders/Index.vue:169](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L169) |

| Clear Filters | `type=button; @click=clearFilters` | [resources/js/Pages/Orders/Index.vue:173](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L173) |

| row.order_number | `:href=route('orders.show', row.id)` | [resources/js/Pages/Orders/Index.vue:184](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L184) |

| t('common.view') | `:href=route('orders.show', row.id)` | [resources/js/Pages/Orders/Index.vue:213](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L213) |

| t('common.edit') | `v-if=canVisit('orders.edit'); :href=route('orders.edit', row.id)` | [resources/js/Pages/Orders/Index.vue:214](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L214) |

| t('common.delete') | `v-if=hasPermission('delete_orders'); type=button; @click=deleteOrder(row)` | [resources/js/Pages/Orders/Index.vue:215](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L215) |

| Create Your First Order | `v-if=canVisit('orders.create'); :href=route('orders.create')` | [resources/js/Pages/Orders/Index.vue:222](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L222) |

| Icon action | `type=button; @click=showMarkPaidModal = false` | [resources/js/Pages/Orders/Index.vue:270](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L270) |

| Cancel | `type=button; :disabled=markPaidForm.processing; @click=showMarkPaidModal = false` | [resources/js/Pages/Orders/Index.vue:286](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L286) |

| Mark as paid | `type=submit; :loading=markPaidForm.processing; :disabled=markPaidForm.processing` | [resources/js/Pages/Orders/Index.vue:287](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Index.vue#L287) |


**Conditional sections / submit boundaries (source expressions):**

```text
119: v-if="canRecordPayments && untrackedOrderCount > 0"
127: <Button v-if="canVisit('orders.create')" variant="default" size="sm" as="Link" :href="route('orders.create')">
137: <form class="table-quick-search" @submit.prevent="searchOrders">
143: <form @submit.prevent="searchOrders" class="space-y-4">
160: <div v-if="canViewPayments">
214: <Link v-if="canVisit('orders.edit')" :href="route('orders.edit', row.id)" class="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-status-success" :aria-label="t('common.edit')"><Pencil :size="16" /></Link>
215: <button v-if="hasPermission('delete_orders')" type="button" @click="deleteOrder(row)" class="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-status-danger" :aria-label="t('common.delete')"><Trash2 :size="16" /></button>
222: <Button v-if="canVisit('orders.create')" variant="default" size="sm" as="Link" :href="route('orders.create')">
230: <div v-if="orders.data.length > 0" class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row table-pagination">
239: v-if="link.url"
264: <div v-if="showMarkPaidModal" class="fixed inset-0 z-50 flex items-center justify-center" @click="showMarkPaidModal = false">
267: <form class="relative mx-4 w-full max-w-md rounded-xl border border-border-subtle bg-surface-raised p-6 shadow-lg" @click.stop @submit.prevent="submitMarkPaid">
```




<a id="e0187"></a>

> Audit provenance: `commerce.md` lines 1296–1531. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Orders/Show.vue

Source: [resources/js/Pages/Orders/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L1).


**Named routes referenced:** `orders.destroy`, `orders.edit`, `orders.index`, `orders.invoice.download`, `orders.invoice.email`, `orders.invoice.preview`, `orders.payments.store`, `orders.payments.void`, `products.show`, `returns.create`.


**Permission/route-capability checks:** `delete_orders`, `edit_orders`, `manage_returns`, `products.show`, `view_orders`.


**Sections / displayed fields / table columns:**

- h3: Order Items (L264)
- h3: Payments (L318)
- h3: Customer Information (L392)
- dt: Customer Name (L396)
- dt: Email (L401)
- dt: Shipping Address (L410)
- h3: Order Timeline (L419)
- h3: Internal Notes (L451)
- h3: Order Summary (L465)
- dt: Subtotal (L469)
- dt: Line discounts (L474)
- dt: Order discount ( parseFloat(order.discount_value) %) (L479)
- dt: Tax (L486)
- dt: Shipping (L491)
- dt: Total (L497)
- dt: Amount paid (L504)
- dt: Balance due (L508)
- h3: Order Details (L518)
- dt: Order Number (L522)
- dt: Channel order number (L527)
- dt: Source (L532)
- dt: Status (L539)
- dt: Order Date (L546)
- dt: Currency (L551)
- h3: Invoice (L561)
- dt: Invoice number (L567)
- h3: Approval Status (L584)
- dt: Status (L588)
- dt: Created By (L595)
- dt: order.approval_status === 'approved' ? Approved : Rejected By (L600)
- dt: Decision Date (L605)
- dt: Notes (L610)
- h3: Danger Zone (L629)
- h3: paymentForm.type === 'refund' ? Record refund : Record payment (L664)
- h3: Void payment (L729)
- h3: Delete Order (L760)
- h3: approvalAction === 'approve' ? Approve Order : Reject Order (L809)


**UI state/filter defaults:**

```text
52: const showPaymentModal = ref(false);
86: const voidingPayment = ref(null);
106: const showDeleteModal = ref(false);
109: const showInvoiceModal = ref(false);
121: const showApprovalModal = ref(false);
122: const approvalAction = ref('approve');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `paymentForm.amount` | Amount | input / number | HTML required; min=0.01; step=0.01 | — | [resources/js/Pages/Orders/Show.vue:678](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L678) |

| `paymentForm.method` | Method | select | HTML required | method.value: method.label [repeat method in paymentMethods] | [resources/js/Pages/Orders/Show.vue:682](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L682) |

| `paymentForm.paid_at` | Date | input / date | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Show.vue:693](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L693) |

| `paymentForm.reference` | Reference | input / text | maxlength=255 | — | [resources/js/Pages/Orders/Show.vue:697](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L697) |

| `paymentForm.notes` | Notes | textarea | maxlength=2000 | — | [resources/js/Pages/Orders/Show.vue:705](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L705) |

| `paymentForm.allow_overpayment` | Allow an overpayment (the order will be marked overpaid) | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Pages/Orders/Show.vue:709](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L709) |

| `voidForm.reason` | Reason (optional) | input / text | maxlength=255 | — | [resources/js/Pages/Orders/Show.vue:741](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L741) |

| `approvalForm.notes` | Notes approvalAction === 'reject' ? Notes (Required) : (Optional) | textarea | :required=approvalAction === 'reject' | — | [resources/js/Pages/Orders/Show.vue:834](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L834) |


**Exact `paymentForm` defaults / hydration / hidden payload** — [resources/js/Pages/Orders/Show.vue:53](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L53)

```text
53: const paymentForm = useForm({
54:     type: 'payment',
55:     amount: '',
56:     method: 'card',
57:     reference: '',
58:     paid_at: todayIsoDate(),
59:     notes: '',
60:     allow_overpayment: false,
61: });
62: 
```



**Exact `voidForm` defaults / hydration / hidden payload** — [resources/js/Pages/Orders/Show.vue:87](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L87)

```text
87: const voidForm = useForm({ reason: '' });
88: 
```



**Exact `deleteForm` defaults / hydration / hidden payload** — [resources/js/Pages/Orders/Show.vue:116](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L116)

```text
116: const deleteForm = useForm({});
117: const deleting = computed(() => deleteForm.processing);
```



**Exact `approvalForm` defaults / hydration / hidden payload** — [resources/js/Pages/Orders/Show.vue:123](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L123)

```text
123: const approvalForm = useForm({ notes: '' });
124: const processing = computed(() => approvalForm.processing);
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('orders.index')` | [resources/js/Pages/Orders/Show.vue:175](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L175) |

| Orders | `:href=route('orders.index')` | [resources/js/Pages/Orders/Show.vue:177](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L177) |

| Download Invoice | `v-if=hasPermission('view_orders'); :href=route('orders.invoice.download', order.id)` | [resources/js/Pages/Orders/Show.vue:192](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L192) |

| Preview Invoice | `v-if=hasPermission('view_orders'); :href=route('orders.invoice.preview', order.id)` | [resources/js/Pages/Orders/Show.vue:202](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L202) |

| Email Invoice | `v-if=hasPermission('edit_orders'); @click=showInvoiceModal = true` | [resources/js/Pages/Orders/Show.vue:213](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L213) |

| Create Return | `v-if=hasPermission('manage_returns'); :href=route('returns.create', { order_id: order.id })` | [resources/js/Pages/Orders/Show.vue:222](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L222) |

| Edit Order | `v-if=hasPermission('edit_orders'); :href=route('orders.edit', order.id)` | [resources/js/Pages/Orders/Show.vue:232](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L232) |

| Back to Orders | `:href=route('orders.index')` | [resources/js/Pages/Orders/Show.vue:242](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L242) |

| View Product → | `v-if=item.product && canVisit('products.show'); :href=route('products.show', item.product_id)` | [resources/js/Pages/Orders/Show.vue:279](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L279) |

| Record refund | `v-if=parseFloat(order.amount_paid) > 0; @click=openPaymentModal('refund')` | [resources/js/Pages/Orders/Show.vue:322](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L322) |

| Record payment | `v-if=order.status !== 'cancelled'; @click=openPaymentModal('payment')` | [resources/js/Pages/Orders/Show.vue:331](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L331) |

| Void | `v-if=canRecordPayments && !payment.voided_at; type=button; @click=openVoidModal(payment)` | [resources/js/Pages/Orders/Show.vue:370](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L370) |

| Approve Order | `@click=openApprovalModal('approve')` | [resources/js/Pages/Orders/Show.vue:617](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L617) |

| Reject Order | `@click=openApprovalModal('reject')` | [resources/js/Pages/Orders/Show.vue:620](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L620) |

| Delete Order | `@click=showDeleteModal = true` | [resources/js/Pages/Orders/Show.vue:631](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L631) |

| Icon action | `type=button; @click=closePaymentModal` | [resources/js/Pages/Orders/Show.vue:667](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L667) |

| Cancel | `type=button; :disabled=paymentForm.processing; @click=closePaymentModal` | [resources/js/Pages/Orders/Show.vue:715](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L715) |

| Save | `type=submit; :loading=paymentForm.processing; :disabled=paymentForm.processing` | [resources/js/Pages/Orders/Show.vue:716](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L716) |

| Icon action | `type=button; @click=voidingPayment = null` | [resources/js/Pages/Orders/Show.vue:730](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L730) |

| Cancel | `type=button; :disabled=voidForm.processing; @click=voidingPayment = null` | [resources/js/Pages/Orders/Show.vue:746](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L746) |

| Void | `type=submit; :loading=voidForm.processing; :disabled=voidForm.processing` | [resources/js/Pages/Orders/Show.vue:747](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L747) |

| t('common.close') | `type=button; @click=showDeleteModal = false` | [resources/js/Pages/Orders/Show.vue:763](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L763) |

| Cancel | `@click=showDeleteModal = false; :disabled=deleting` | [resources/js/Pages/Orders/Show.vue:790](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L790) |

| Deleting... Delete Order | `:loading=deleting; :disabled=deleting; @click=deleteOrder` | [resources/js/Pages/Orders/Show.vue:793](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L793) |

| t('common.close') | `type=button; @click=showApprovalModal = false` | [resources/js/Pages/Orders/Show.vue:812](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L812) |

| Cancel | `@click=showApprovalModal = false; :disabled=processing` | [resources/js/Pages/Orders/Show.vue:847](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L847) |

| Loading... approvalAction === 'approve' ? Approve : Reject | `:loading=processing; :disabled=processing \|\| (approvalAction === 'reject' && !approvalForm.notes.trim()); @click=submitApproval` | [resources/js/Pages/Orders/Show.vue:850](C:/Users/proj/Inventoros/resources/js/Pages/Orders/Show.vue#L850) |


**Conditional sections / submit boundaries (source expressions):**

```text
193: v-if="hasPermission('view_orders')"
203: v-if="hasPermission('view_orders')"
214: v-if="hasPermission('edit_orders')"
223: v-if="hasPermission('manage_returns')"
233: v-if="hasPermission('edit_orders')"
252: <div v-if="awaitingApproval" class="mt-4 flex items-start gap-2 rounded-lg border border-status-warning/20 bg-status-warning-soft p-3">
266: <div v-if="order.items && order.items.length > 0" class="space-y-3">
277: {{ t('discounts.discount') }}<template v-if="item.discount_type === 'percent'"> ({{ parseFloat(item.discount_value) }}%)</template>: -{{ money(item.discount_amount) }}
280: v-if="item.product && canVisit('products.show')"
315: <Card v-if="order.payments !== undefined" :padded="false">
321: <div v-if="canRecordPayments" class="flex flex-wrap items-center gap-2">
323: v-if="parseFloat(order.amount_paid) > 0"
332: v-if="order.status !== 'cancelled'"
346: <ul v-if="order.payments.length > 0" class="divide-y divide-border-subtle rounded-lg border border-border-subtle">
361: <template v-if="payment.reference"> · {{ payment.reference }}</template>
362: <template v-if="payment.recorded_by"> · {{ t('payments.recordedBy', { name: payment.recorded_by.name }) }}</template>
371: v-if="canRecordPayments && !payment.voided_at"
388: <ShipmentsPanel v-if="shipping" :order="order" :shipments="shipments || []" :shipping="shipping" />
400: <div v-if="order.customer_email">
409: <div v-if="order.customer_address">
430: <div v-if="order.shipped_at" class="flex items-start gap-3">
438: <div v-if="order.delivered_at" class="flex items-start gap-3">
450: <Card v-if="order.notes" :padded="false">
473: <div v-if="parseFloat(order.line_discount_total) > 0" class="flex justify-between text-sm">
478: <div v-if="parseFloat(order.order_discount_amount) > 0" class="flex justify-between text-sm">
480: {{ t('discounts.orderDiscount') }}<template v-if="order.discount_type === 'percent'"> ({{ parseFloat(order.discount_value) }}%)</template>
502: <template v-if="order.amount_paid !== undefined && order.payment_status !== 'untracked'">
526: <div v-if="order.channel_order_number">
550: <div v-if="order.currency">
565: <dl v-if="order.invoice_number" class="space-y-4">
583: <Card v-if="approvalRequired && order.approval_status" :padded="false">
594: <div v-if="order.creator">
599: <div v-if="order.approver">
604: <div v-if="order.approved_at">
609: <div v-if="order.approval_notes">
616: <div v-if="canApprove && order.approval_status === 'pending' && order.status !== 'cancelled'" class="mt-4 space-y-2 border-t border-border-subtle pt-4">
628: <Card v-if="hasPermission('delete_orders')" :padded="false">
659: <div v-if="showPaymentModal" class="fixed inset-0 z-50 flex items-center justify-center" @click="closePaymentModal">
662: <form class="relative mx-4 w-full max-w-md rounded-xl border border-border-subtle bg-surface-raised p-6 shadow-lg" @click.stop @submit.prevent="submitPayment">
708: <label v-if="paymentForm.type === 'payment'" class="flex items-start gap-2 text-sm text-text-secondary">
724: <div v-if="voidingPayment" class="fixed inset-0 z-50 flex items-center justify-center" @click="voidingPayment = null">
727: <form class="relative mx-4 w-full max-w-md rounded-xl border border-border-subtle bg-surface-raised p-6 shadow-lg" @click.stop @submit.prevent="submitVoid">
755: <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center" @click="showDeleteModal = false">
804: <div v-if="showApprovalModal" class="fixed inset-0 z-50 flex items-center justify-center" @click="showApprovalModal = false">
```




<a id="e0203"></a>

> Audit provenance: `commerce.md` lines 2886–2942. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Components/SendDocumentModal.vue

Source: [resources/js/Components/SendDocumentModal.vue:1](C:/Users/proj/Inventoros/resources/js/Components/SendDocumentModal.vue#L1).


**Named routes referenced:** Dynamic/component props; see action expressions..


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: title (L76)


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.to` | To | input / email | HTML required; maxlength=255 | — | [resources/js/Components/SendDocumentModal.vue:92](C:/Users/proj/Inventoros/resources/js/Components/SendDocumentModal.vue#L92) |

| `form.cc` | CC | input / text | maxlength=1000 | — | [resources/js/Components/SendDocumentModal.vue:106](C:/Users/proj/Inventoros/resources/js/Components/SendDocumentModal.vue#L106) |

| `form.message` | Message | textarea | maxlength=2000 | — | [resources/js/Components/SendDocumentModal.vue:119](C:/Users/proj/Inventoros/resources/js/Components/SendDocumentModal.vue#L119) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Components/SendDocumentModal.vue:27](C:/Users/proj/Inventoros/resources/js/Components/SendDocumentModal.vue#L27)

```text
27: const form = useForm({
28:     to: props.defaultTo || '',
29:     cc: '',
30:     message: '',
31: });
32: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| t('common.cancel') | `type=button; @click=close` | [resources/js/Components/SendDocumentModal.vue:77](C:/Users/proj/Inventoros/resources/js/Components/SendDocumentModal.vue#L77) |

| Cancel | `:disabled=form.processing; @click=close` | [resources/js/Components/SendDocumentModal.vue:137](C:/Users/proj/Inventoros/resources/js/Components/SendDocumentModal.vue#L137) |

| form.processing ? Sending... : (submitLabel \\|\\| Send) | `type=submit; :loading=form.processing; :disabled=form.processing \|\| !form.to` | [resources/js/Components/SendDocumentModal.vue:140](C:/Users/proj/Inventoros/resources/js/Components/SendDocumentModal.vue#L140) |


**Conditional sections / submit boundaries (source expressions):**

```text
67: <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center" @click="close">
73: @submit.prevent="submit"
```




<a id="e0206"></a>

> Audit provenance: `commerce.md` lines 3106–3130. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Components/TaxInput.vue

Source: [resources/js/Components/TaxInput.vue:1](C:/Users/proj/Inventoros/resources/js/Components/TaxInput.vue#L1).


**Named routes referenced:** Dynamic/component props; see action expressions..


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**UI state/filter defaults:**

```text
20: const rate = ref(null);
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `amount` | Tax amount | input / number | min=0; step=0.01; @input=rate = null | — | [resources/js/Components/TaxInput.vue:42](C:/Users/proj/Inventoros/resources/js/Components/TaxInput.vue#L42) |

| `rate ?? ''` | Rate | input / number | min=0; max=100; step=0.001; @input=onRateInput | — | [resources/js/Components/TaxInput.vue:52](C:/Users/proj/Inventoros/resources/js/Components/TaxInput.vue#L52) |



<a id="e0207"></a>

> Audit provenance: `commerce.md` lines 3131–3156. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Components/DiscountInput.vue

Source: [resources/js/Components/DiscountInput.vue:1](C:/Users/proj/Inventoros/resources/js/Components/DiscountInput.vue#L1).


**Named routes referenced:** Dynamic/component props; see action expressions..


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `type ?? ''` | label | select | @change=onTypeChange | : No discount; percent: Percent (%); fixed: Fixed amount | [resources/js/Components/DiscountInput.vue:33](C:/Users/proj/Inventoros/resources/js/Components/DiscountInput.vue#L33) |

| `value` | Discount value | input / number | min=0; :max=type === 'percent' ? 100 : undefined; step=0.01; :disabled=!type | — | [resources/js/Components/DiscountInput.vue:38](C:/Users/proj/Inventoros/resources/js/Components/DiscountInput.vue#L38) |


**Conditional sections / submit boundaries (source expressions):**

```text
31: <label v-if="label" :for="`${id}_type`" :class="compact ? 'mb-1 block text-[11px] text-text-tertiary' : 'mb-1 block text-sm text-text-secondary'">{{ label }}</label>
```




<a id="e0209"></a>

> Audit provenance: `commerce.md` lines 3185–3200. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Components/CurrencySelect.vue

Source: [resources/js/Components/CurrencySelect.vue:1](C:/Users/proj/Inventoros/resources/js/Components/CurrencySelect.vue#L1).


**Named routes referenced:** Dynamic/component props; see action expressions..


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `model` | (dynamic/unlabelled; see source) | select | No extra control attribute; server rules below | currency: currency [repeat currency in currencies] | [resources/js/Components/CurrencySelect.vue:14](C:/Users/proj/Inventoros/resources/js/Components/CurrencySelect.vue#L14) |



<a id="e0215"></a>

> Audit provenance: `commerce.md` lines 3388–3438. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### RecordOrderPaymentRequest.php

[app/Http/Requests/Order/RecordOrderPaymentRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Order/RecordOrderPaymentRequest.php#L1)

```php
9: use Illuminate\Contracts\Validation\ValidationRule;
10: use Illuminate\Foundation\Http\FormRequest;
11: use Illuminate\Validation\Rule;
12: 
13: /**
14:  * Validates a payment or refund recorded against an order (web and REST).
15:  * Balance rules (overpayment, refund ceiling, cancelled orders) are enforced
16:  * by OrderPaymentService under the order's row lock, not here.
17:  */
18: final class RecordOrderPaymentRequest extends FormRequest
19: {
20:     /**
21:      * @return array<string, ValidationRule|array<mixed>|string>
22:      */
23:     public function rules(): array
24:     {
25:         return [
26:             'type' => ['sometimes', Rule::in(PaymentType::values())],
27:             'amount' => ['required', 'numeric', 'decimal:0,2', 'gt:0', 'max:99999999'],
28:             'method' => ['required', Rule::in(PaymentMethod::values())],
29:             'reference' => ['nullable', 'string', 'max:255'],
30:             'paid_at' => ['nullable', 'date'],
31:             'notes' => ['nullable', 'string', 'max:2000'],
32:             'allow_overpayment' => ['sometimes', 'boolean'],
33:         ];
34:     }
35: 
36:     /**
37:      * @return array<string, mixed>
38:      */
39:     public function paymentData(): array
40:     {
41:         $data = $this->validated();
42:         $data['allow_overpayment'] = $this->boolean('allow_overpayment');
43: 
44:         return $data;
45:     }
46: 
47:     public function isRefund(): bool
48:     {
49:         return $this->input('type') === PaymentType::REFUND->value;
50:     }
51: }
```




<a id="e0216"></a>

> Audit provenance: `commerce.md` lines 3439–3515. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StoreOrderRequest.php

[app/Http/Requests/Order/StoreOrderRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Order/StoreOrderRequest.php#L1)

```php
9: use App\Models\Auth\Organization;
10: use Illuminate\Contracts\Validation\ValidationRule;
11: use Illuminate\Foundation\Http\FormRequest;
12: use Illuminate\Validation\Rule;
13: 
14: /**
15:  * Validates a new sales order created through the web (Inertia) surface.
16:  *
17:  * Rules are unchanged from the previous inline validation in
18:  * Order\OrderController::store; org-scoped existence checks read the
19:  * authenticated user's organization.
20:  */
21: final class StoreOrderRequest extends FormRequest
22: {
23:     use ValidatesVariantLines;
24: 
25:     /**
26:      * The currencies an order can be placed in: the supported list plus the
27:      * organization's own, whatever it is.
28:      *
29:      * @return array<int, string>
30:      */
31:     public static function currencyCodes(int $organizationId): array
32:     {
33:         return array_values(array_unique(array_merge(
34:             [Organization::currencyFor($organizationId)],
35:             array_keys((array) config('currencies.supported', [])),
36:         )));
37:     }
38: 
39:     protected function prepareForValidation(): void
40:     {
41:         if (is_string($this->input('currency'))) {
42:             $this->merge(['currency' => strtoupper(trim($this->input('currency')))]);
43:         }
44:     }
45: 
46:     /**
47:      * @return array<string, ValidationRule|array<mixed>|string>
48:      */
49:     public function rules(): array
50:     {
51:         $organizationId = $this->user()->organization_id;
52: 
53:         return [
54:             'customer_id' => ['nullable', 'integer', Rule::exists('customers', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
55:             // Blank means the organization's currency (OrderService).
56:             'currency' => ['nullable', 'string', Rule::in(self::currencyCodes((int) $organizationId))],
57:             'customer_name' => 'required|string|max:255',
58:             'customer_email' => 'nullable|email|max:255',
59:             'customer_address' => 'nullable|string',
60:             'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
61:             'order_date' => 'required|date',
62:             'shipping' => 'nullable|numeric|decimal:0,2|min:0',
63:             'tax' => 'nullable|numeric|decimal:0,2|min:0',
64:             'discount_type' => ['nullable', Rule::in(DiscountType::values())],
65:             'discount_value' => 'nullable|numeric|decimal:0,2|min:0|max:99999999',
66:             'notes' => 'nullable|string',
67:             'warehouse_id' => ['nullable', Rule::exists('warehouses', 'id')->where('organization_id', $organizationId)],
68:             'items' => 'required|array|min:1',
69:             'items.*.product_id' => ['required', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
70:             'items.*.product_variant_id' => ['nullable', Rule::exists('product_variants', 'id')->where('organization_id', $organizationId)],
71:             'items.*.quantity' => 'required|integer|min:1',
72:             'items.*.unit_price' => 'required|numeric|decimal:0,2|min:0',
73:             'items.*.discount_type' => ['nullable', Rule::in(DiscountType::values())],
74:             'items.*.discount_value' => 'nullable|numeric|decimal:0,2|min:0|max:99999999',
75:         ];
76:     }
77: }
```




<a id="e0217"></a>

> Audit provenance: `commerce.md` lines 3516–3568. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### UpdateOrderRequest.php

[app/Http/Requests/Order/UpdateOrderRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Order/UpdateOrderRequest.php#L1)

```php
9: use Illuminate\Contracts\Validation\ValidationRule;
10: use Illuminate\Foundation\Http\FormRequest;
11: use Illuminate\Validation\Rule;
12: 
13: /**
14:  * Validates an order edit through the web (Inertia) surface.
15:  *
16:  * Rules are unchanged from the previous inline validation in
17:  * Order\OrderController::update; org-scoped existence checks read the
18:  * authenticated user's organization.
19:  */
20: final class UpdateOrderRequest extends FormRequest
21: {
22:     use ValidatesVariantLines;
23: 
24:     /**
25:      * @return array<string, ValidationRule|array<mixed>|string>
26:      */
27:     public function rules(): array
28:     {
29:         $organizationId = $this->user()->organization_id;
30: 
31:         return [
32:             'customer_id' => ['nullable', 'integer', Rule::exists('customers', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
33:             'customer_name' => 'required|string|max:255',
34:             'customer_email' => 'nullable|email|max:255',
35:             'customer_address' => 'nullable|string',
36:             'status' => 'required|in:pending,processing,shipped,delivered,cancelled',
37:             'order_date' => 'required|date',
38:             'shipping' => 'nullable|numeric|decimal:0,2|min:0',
39:             'tax' => 'nullable|numeric|decimal:0,2|min:0',
40:             'discount_type' => ['nullable', Rule::in(DiscountType::values())],
41:             'discount_value' => 'nullable|numeric|decimal:0,2|min:0|max:99999999',
42:             'notes' => 'nullable|string',
43:             'items' => 'required|array|min:1',
44:             'items.*.id' => 'nullable|exists:order_items,id',
45:             'items.*.product_id' => ['required', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
46:             'items.*.product_variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')->where('organization_id', $organizationId)],
47:             'items.*.quantity' => 'required|integer|min:1',
48:             'items.*.unit_price' => 'required|numeric|decimal:0,2|min:0',
49:             'items.*.discount_type' => ['nullable', Rule::in(DiscountType::values())],
50:             'items.*.discount_value' => 'nullable|numeric|decimal:0,2|min:0|max:99999999',
51:         ];
52:     }
53: }
```




<a id="e0226"></a>

> Audit provenance: `commerce.md` lines 3853–3937. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### SendDocumentEmailRequest.php

[app/Http/Requests/SendDocumentEmailRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/SendDocumentEmailRequest.php#L1)

```php
9: use Illuminate\Foundation\Http\FormRequest;
10: 
11: /**
12:  * Optional overrides when emailing a document (purchase order to a supplier,
13:  * invoice to a customer): a different recipient, CC addresses and a short
14:  * message. Everything is optional; with no input the document goes to the
15:  * address on file. Access is enforced by the route's permission middleware.
16:  *
17:  * `cc` accepts a comma separated string (web form) or an array (API).
18:  */
19: class SendDocumentEmailRequest extends FormRequest
20: {
21:     public function authorize(): bool
22:     {
23:         return true;
24:     }
25: 
26:     /**
27:      * @return array<string, mixed>
28:      */
29:     public function rules(): array
30:     {
31:         return [
32:             'to' => ['nullable', 'string', 'email', 'max:255'],
33:             'cc' => ['nullable', function (string $attribute, mixed $value, Closure $fail) {
34:                 if (! is_string($value) && ! is_array($value)) {
35:                     $fail('The CC field must be a list of email addresses.');
36: 
37:                     return;
38:                 }
39: 
40:                 if (is_string($value) && strlen($value) > 1000) {
41:                     $fail('The CC field is too long.');
42: 
43:                     return;
44:                 }
45: 
46:                 $addresses = DocumentRecipients::split($value);
47: 
48:                 if (count($addresses) > DocumentRecipients::MAX_CC) {
49:                     $fail('You can CC at most '.DocumentRecipients::MAX_CC.' addresses.');
50: 
51:                     return;
52:                 }
53: 
54:                 foreach ($addresses as $address) {
55:                     if (strlen($address) > 255 || filter_var($address, FILTER_VALIDATE_EMAIL) === false) {
56:                         $fail("{$address} is not a valid email address.");
57: 
58:                         return;
59:                     }
60:                 }
61:             }],
62:             'message' => ['nullable', 'string', 'max:'.DocumentRecipients::MAX_MESSAGE_LENGTH],
63:         ];
64:     }
65: 
66:     public function recipient(): ?string
67:     {
68:         $to = $this->validated('to');
69: 
70:         return is_string($to) && trim($to) !== '' ? trim($to) : null;
71:     }
72: 
73:     /**
74:      * @return array<int, string>
75:      */
76:     public function ccList(): array
77:     {
78:         return DocumentRecipients::split($this->validated('cc'));
79:     }
80: 
81:     public function customMessage(): ?string
82:     {
83:         return DocumentRecipients::message($this->validated('message'));
84:     }
85: }
```




<a id="e0242"></a>

> Audit provenance: `commerce.md` lines 4581–4649. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Order/Order.php

[app/Models/Order/Order.php:1](C:/Users/proj/Inventoros/app/Models/Order/Order.php#L1)


```php
protected $fillable = [
        'organization_id',
        'warehouse_id',
        'customer_id',
        'created_by',
        'order_number',
        'invoice_number',
        'invoice_issued_at',
        'invoice_sent_at',
        'invoice_sent_to',
        'invoice_queued_at',
        'source',
        'external_id',
        'external_reference',
        'customer_name',
        'customer_email',
        'customer_address',
        'status',
        'approval_status',
        'approved_by',
        'approved_at',
        'approval_notes',
        'subtotal',
        'discount_type',
        'discount_value',
        'discount_amount',
        'tax',
        'shipping',
        'total',
        'amount_paid',
        'payment_status',
        'currency',
        'order_date',
        'shipped_at',
        'delivered_at',
        'notes',
        'metadata',
    ];
```


```php
26: use Illuminate\Database\Eloquent\SoftDeletes;
86: use BelongsToOrganization, HasFactory, LogsActivity, SoftDeletes;
153: 'subtotal' => 'decimal:2',
155: 'discount_value' => 'decimal:2',
156: 'discount_amount' => 'decimal:2',
157: 'tax' => 'decimal:2',
158: 'shipping' => 'decimal:2',
159: 'total' => 'decimal:2',
160: 'amount_paid' => 'decimal:2',
180: return $this->belongsTo(Organization::class);
185: return $this->belongsTo(Customer::class);
190: return $this->belongsTo(Warehouse::class);
200: return $this->belongsTo(User::class, 'created_by');
210: return $this->belongsTo(User::class, 'approved_by');
220: return $this->hasMany(OrderItem::class);
230: return $this->hasMany(OrderPayment::class);
325: return $this->hasMany(ReturnOrder::class);
335: return $this->hasMany(\App\Models\Shipping\Shipment::class);
```




<a id="e0243"></a>

> Audit provenance: `commerce.md` lines 4650–4690. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Order/OrderItem.php

[app/Models/Order/OrderItem.php:1](C:/Users/proj/Inventoros/app/Models/Order/OrderItem.php#L1)


```php
protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'product_name',
        'sku',
        'quantity',
        'unit_price',
        'unit_cost',
        'unit_cost_backfilled_at',
        'subtotal',
        'discount_type',
        'discount_value',
        'discount_amount',
        'tax',
        'total',
        'metadata',
    ];
```


```php
77: 'unit_price' => 'decimal:2',
78: 'unit_cost' => 'decimal:2',
80: 'subtotal' => 'decimal:2',
82: 'discount_value' => 'decimal:2',
83: 'discount_amount' => 'decimal:2',
84: 'tax' => 'decimal:2',
85: 'total' => 'decimal:2',
109: return $this->belongsTo(Order::class);
119: return $this->belongsTo(Product::class);
129: return $this->belongsTo(ProductVariant::class, 'product_variant_id');
```




<a id="e0244"></a>

> Audit provenance: `commerce.md` lines 4691–4721. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Order/OrderPayment.php

[app/Models/Order/OrderPayment.php:1](C:/Users/proj/Inventoros/app/Models/Order/OrderPayment.php#L1)


```php
protected $fillable = [
        'organization_id',
        'order_id',
        'user_id',
        'type',
        'amount',
        'method',
        'reference',
        'paid_at',
        'notes',
        'voided_at',
        'voided_by',
        'void_reason',
    ];
```


```php
63: 'amount' => 'decimal:2',
75: return $this->belongsTo(Order::class);
83: return $this->belongsTo(User::class);
91: return $this->belongsTo(User::class, 'voided_by');
```




<a id="e0474"></a>

> Audit provenance: `additional-contracts.md` lines 7–37. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/Order/ApproveOrderRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/Order/ApproveOrderRequest.php#L1). SHA-256: `501255455f9faa8a4a25b39f4f309665ddb75bf67cf2326fd56828d82089c00b`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\Order;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates approving an order via the REST API. Rules match the web
11:  * OrderController::approve action.
12:  */
13: final class ApproveOrderRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'notes' => ['nullable', 'string', 'max:500'],
22:         ];
23:     }
24: }
```



<a id="e0475"></a>

> Audit provenance: `additional-contracts.md` lines 38–68. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/Order/RejectOrderRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/Order/RejectOrderRequest.php#L1). SHA-256: `b0e502f7966e5a5194cf31f6d1ebf534c282ca88711b19c8f1f023e7044bf9cc`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\Order;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates rejecting an order via the REST API. A reason is required, as on
11:  * the web OrderController::reject action.
12:  */
13: final class RejectOrderRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'notes' => ['required', 'string', 'max:500'],
22:         ];
23:     }
24: }
```



<a id="e0502"></a>

> Audit provenance: `additional-contracts.md` lines 1371–1400. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Enums/DiscountType.php`

[Source evidence](C:/Users/proj/Inventoros/app/Enums/DiscountType.php#L1). SHA-256: `a6d7f5e8eb60b1ecb37c4f74125fe5580698cd5a2b263e5035bae3cdeb0adeb6`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: /**
8:  * How a line or order discount is expressed: a percentage of the amount it
9:  * applies to, or a fixed money amount off it.
10:  */
11: enum DiscountType: string
12: {
13:     case PERCENT = 'percent';
14:     case FIXED = 'fixed';
15: 
16:     /**
17:      * @return array<int, string>
18:      */
19:     public static function values(): array
20:     {
21:         return array_column(self::cases(), 'value');
22:     }
23: }
```



<a id="e0503"></a>

> Audit provenance: `additional-contracts.md` lines 1401–1457. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Enums/OrderApprovalStatus.php`

[Source evidence](C:/Users/proj/Inventoros/app/Enums/OrderApprovalStatus.php#L1). SHA-256: `621394be5656c1fb927907a58e63217c156d06edae95c34feb00188a552afdee`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: /**
8:  * The approval state of an Order, independent of its fulfilment status.
9:  *
10:  * NOT_REQUIRED is what an order gets when its organization does not require
11:  * sales order approval (the default): there is nothing to decide and nothing
12:  * waits on it. PENDING only happens when approval is required, and blocks
13:  * shipping until the order is APPROVED (or REJECTED, which cancels it).
14:  */
15: enum OrderApprovalStatus: string
16: {
17:     case NOT_REQUIRED = 'not_required';
18:     case PENDING = 'pending';
19:     case APPROVED = 'approved';
20:     case REJECTED = 'rejected';
21: 
22:     /**
23:      * @return array<int, string>
24:      */
25:     public static function values(): array
26:     {
27:         return array_column(self::cases(), 'value');
28:     }
29: 
30:     /**
31:      * @return array<int, array{value: string, label: string}>
32:      */
33:     public static function options(): array
34:     {
35:         return array_map(
36:             fn (self $c) => ['value' => $c->value, 'label' => $c->label()],
37:             self::cases()
38:         );
39:     }
40: 
41:     public function label(): string
42:     {
43:         return match ($this) {
44:             self::NOT_REQUIRED => 'Not required',
45:             self::PENDING => 'Pending approval',
46:             self::APPROVED => 'Approved',
47:             self::REJECTED => 'Rejected',
48:         };
49:     }
50: }
```



<a id="e0504"></a>

> Audit provenance: `additional-contracts.md` lines 1458–1517. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Enums/OrderStatus.php`

[Source evidence](C:/Users/proj/Inventoros/app/Enums/OrderStatus.php#L1). SHA-256: `68f6f082c58b9909048c938c55ab13fc46d229334fad46fa88aeaf7a1febbbf6`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: /**
8:  * The lifecycle state of an Order.
9:  *
10:  * The string values match the existing column shape so this enum can be
11:  * adopted by callsites incrementally:
12:  *
13:  *   - Validation rules: Rule::enum(OrderStatus::class) instead of
14:  *     'in:pending,processing,shipped,delivered,cancelled'.
15:  *   - Model casts: $casts['status'] = OrderStatus::class.
16:  *   - Inertia props: pass OrderStatus::options() instead of a hardcoded
17:  *     array.
18:  *
19:  * Until those adoptions land, equality against the legacy string values
20:  * still works via $status === OrderStatus::PENDING->value.
21:  */
22: enum OrderStatus: string
23: {
24:     case PENDING = 'pending';
25:     case PROCESSING = 'processing';
26:     case SHIPPED = 'shipped';
27:     case DELIVERED = 'delivered';
28:     case CANCELLED = 'cancelled';
29: 
30:     /**
31:      * Bare string values, suitable for validation 'in:' rules or
32:      * front-end dropdown payloads.
33:      *
34:      * @return array<int, string>
35:      */
36:     public static function values(): array
37:     {
38:         return array_column(self::cases(), 'value');
39:     }
40: 
41:     /**
42:      * Label/value pairs for front-end form options.
43:      *
44:      * @return array<int, array{value: string, label: string}>
45:      */
46:     public static function options(): array
47:     {
48:         return array_map(
49:             fn (self $c) => ['value' => $c->value, 'label' => ucfirst($c->value)],
50:             self::cases()
51:         );
52:     }
53: }
```



<a id="e0505"></a>

> Audit provenance: `additional-contracts.md` lines 1518–1560. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Enums/PaymentMethod.php`

[Source evidence](C:/Users/proj/Inventoros/app/Enums/PaymentMethod.php#L1). SHA-256: `bb7e43d4e204e89961cc5f5cb5ee72a1ca578d8e14e468aea5f4653372a6ecf6`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: /**
8:  * How a customer paid (or was refunded) for an order.
9:  */
10: enum PaymentMethod: string
11: {
12:     case CASH = 'cash';
13:     case CARD = 'card';
14:     case BANK_TRANSFER = 'bank_transfer';
15:     case CHEQUE = 'cheque';
16:     case OTHER = 'other';
17: 
18:     /**
19:      * @return array<int, string>
20:      */
21:     public static function values(): array
22:     {
23:         return array_column(self::cases(), 'value');
24:     }
25: 
26:     public function label(): string
27:     {
28:         return match ($this) {
29:             self::CASH => 'Cash',
30:             self::CARD => 'Card',
31:             self::BANK_TRANSFER => 'Bank transfer',
32:             self::CHEQUE => 'Cheque',
33:             self::OTHER => 'Other',
34:         };
35:     }
36: }
```



<a id="e0506"></a>

> Audit provenance: `additional-contracts.md` lines 1561–1629. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Enums/PaymentStatus.php`

[Source evidence](C:/Users/proj/Inventoros/app/Enums/PaymentStatus.php#L1). SHA-256: `13da24664382b842de5237d815c3caeb1bb8b4b54a3ae947f510d499e4359eec`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: use App\Support\Money;
8: 
9: /**
10:  * An order's payment position, derived from its total and the net of its
11:  * non-voided payments and refunds.
12:  *
13:  * UNTRACKED is the exception: orders that existed before payment tracking was
14:  * added carry no payment rows, so nothing is known about whether they were
15:  * paid. They are never counted as money owed, and recording a payment moves
16:  * them into normal tracking. derive() never returns it.
17:  */
18: enum PaymentStatus: string
19: {
20:     case UNPAID = 'unpaid';
21:     case PARTIAL = 'partial';
22:     case PAID = 'paid';
23:     case OVERPAID = 'overpaid';
24:     case REFUNDED = 'refunded';
25:     case UNTRACKED = 'untracked';
26: 
27:     /**
28:      * @return array<int, string>
29:      */
30:     public static function values(): array
31:     {
32:         return array_column(self::cases(), 'value');
33:     }
34: 
35:     /**
36:      * Derive the status.
37:      *
38:      *  - refunded: something was refunded and nothing is left paid;
39:      *  - unpaid:   nothing paid on an order that costs something;
40:      *  - partial:  paid, but less than the total;
41:      *  - paid:     paid exactly the total (a zero-total order is paid);
42:      *  - overpaid: paid more than the total.
43:      */
44:     public static function derive(string $total, string $netPaid, string $refunded): self
45:     {
46:         if (Money::compare($refunded, 0) > 0 && Money::compare($netPaid, 0) <= 0) {
47:             return self::REFUNDED;
48:         }
49: 
50:         $cmp = Money::compare($netPaid, $total);
51: 
52:         if ($cmp > 0) {
53:             return self::OVERPAID;
54:         }
55: 
56:         if ($cmp === 0) {
57:             return self::PAID;
58:         }
59: 
60:         return Money::compare($netPaid, 0) > 0 ? self::PARTIAL : self::UNPAID;
61:     }
62: }
```



<a id="e0507"></a>

> Audit provenance: `additional-contracts.md` lines 1630–1659. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Enums/PaymentType.php`

[Source evidence](C:/Users/proj/Inventoros/app/Enums/PaymentType.php#L1). SHA-256: `a0b4c864375318155e79a5c8c9d9019ce65486a71ccf5c35a999bddc0e93c1ae`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: /**
8:  * A payment row is money received; a refund row is money given back and
9:  * counts against what was paid.
10:  */
11: enum PaymentType: string
12: {
13:     case PAYMENT = 'payment';
14:     case REFUND = 'refund';
15: 
16:     /**
17:      * @return array<int, string>
18:      */
19:     public static function values(): array
20:     {
21:         return array_column(self::cases(), 'value');
22:     }
23: }
```

