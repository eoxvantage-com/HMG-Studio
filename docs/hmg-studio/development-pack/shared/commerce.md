# Shared contracts — commerce.md

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

Read only the relevant sections for the active module; this file owns mixed-module registers and common rules. Return to [START HERE](../00_START_HERE.md).

- [Inventoros commerce: field-level implementation specification](#e0162)
- [Evidence and scope](#e0163)
- [1. Workflow architecture and invariant rules](#e0164)
- [Customers and suppliers](#e0165)
- [2. Agent implementation and acceptance contract](#e0173)
- [List/filter/pagination contracts](#e0174)
- [3. Complete page/control inventory](#e0175)
- [4. Authoritative request validation](#e0210)
- [ValidatesVariantLines.php](#e0227)
- [Nested endpoint rules not in dedicated request classes](#e0228)
- [routes/web/sales.php](#e0230)
- [routes/web/inventory.php](#e0232)
- [6. Data ownership and relationships](#e0233)
- [7. Owned page coverage checklist and source integrity](#e0251)
- [8. Remaining evidence boundaries](#e0252)

<a id="e0162"></a>

> Audit provenance: `commerce.md` lines 1–2. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

# Inventoros commerce: field-level implementation specification



<a id="e0163"></a>

> Audit provenance: `commerce.md` lines 3–11. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Evidence and scope

- Audit date: 2026-11-06. Source checkout: `C:\Users\proj\Inventoros`, commit `1f78e818d9aee025020fe7489955f4f0c448c53a`.
- **Source-derived specification, not runtime acceptance.** This audit did not run the app, transactions, tests, carriers or email. Parent browser evidence is a separate layer. No source changes were made.
- Owns all 25 Vue pages in Customers (4), Suppliers (4), Orders (4), PurchaseOrders (5), Returns (4), WorkOrders (3), Approvals (1), plus nested customer picker, portal-contact invite, payment/refund/void, approval, document email, shipment, tax/discount controls.
- Target Taruvi-native datatable schemas must be confirmed independently. Source keys below are authoritative **source contracts**, not instructions to blindly create target tables. Server-generated identity, organization, document numbers, actors, totals and lifecycle timestamps are not browser-editable authority.
- Read the human workflow rules first, then each page's control inventory and exact initializer, then server rules and relationships. Initializers distinguish create defaults from edit hydration. `nullable`, `sometimes`, HTML `required` and conditional requiredness are deliberately separate.
- English labels resolve from `resources/js/i18n/locales/en.json`. Dynamic labels/loop expressions are retained, not invented. Repeated item bindings (`item.quantity`) mean the relevant `items[]` row; UI-only selectors, filters and previews are not automatically persisted columns.



<a id="e0164"></a>

> Audit provenance: `commerce.md` lines 12–13. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## 1. Workflow architecture and invariant rules



<a id="e0165"></a>

> Audit provenance: `commerce.md` lines 14–23. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Customers and suppliers

Customers have 22 core editable fields plus plugin-defined fields: name, code, company/contact identity, email/phone, billing and shipping addresses (five each), tax ID, payment terms, credit limit, currency, notes, active. Supplier has 16: name, code, contact name, email/phone, address/city/state/ZIP/country, website, payment terms, currency, notes, active, rating.

Create defaults: strings blank, active true, currency from organization; supplier rating null; customer credit limit blank. SupplierRating offers 1..5 stars and clicking the selected rating again clears it to null. CurrencySelect retains organization, configured supported and existing record currency options, deduplicated; it does not silently discard a legacy record currency. Edit hydrates from record, mostly normalizing nullable values to blank. Supplier active uses nullish fallback true. Customer credit limit uses `value || ''`, so a stored zero displays blank: preserve observation rather than silently claim exact zero roundtrip. Name is required on create; update request uses `sometimes|string|max:255`, not the same rule as create. Codes are organization-scoped unique even across soft-deleted rows; update ignores the same record.

Customer “same as billing” switch copies five billing values into shipping once on toggle. It is not a continuously linked address; toggling off must not erase values. Edit initializes switch by equality of the five address pairs. Plugin payload is `plugin_fields`, based on supplied plugin definitions; the core rules are filter-extendable and do not enumerate plugin fields. Agent must discover enabled plugins separately.

Customer Show includes recent orders, total spend derived from supplied orders, business detail and portal access. Portal invitation fields are `name` and `email`; both required/max255, email normalized lowercase/trimmed and unique within organization's customer contacts. Portal must be enabled; permission `edit_customers`; invite/resend throttled 30/min. Resend/revoke are separate actions, not customer deletion. Supplier Show includes related products and pivot Supplier SKU/Cost Price. Contact deletion is confirmed and must preserve business-record dependencies according to backend behavior, not cascade by guess.



<a id="e0173"></a>

> Audit provenance: `commerce.md` lines 100–116. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## 2. Agent implementation and acceptance contract

For each page below implement: accessible layout, actual data loading, server filters/paging, empty/no-result/denied/error/loading states, exact form semantics, backend-enforced ownership and constraints, invalidation and persisted readback. Do not implement decorative buttons or report persistence from a mocked callback.

Acceptance scenarios (not executed by this source audit):

1. Customer/Supplier create/edit/reload, null/zero values, duplicate code across orgs, same record code update, address copy on toggle only, invalid email/rating/currency/credit; portal invite/resend/revoke and disabled-portal refusal.
2. Order customer selection/unlink and currency repricing, missing foreign-currency price, same product two variants, inactive saved variant edit, duplicate merged line, decimal/percent/fixed-discount boundaries, server total vs preview, approval pending stock deduction, illegal shipped status, cancelled edit refusal.
3. Two orders competing for last units; single-winner stock or clean rollback. Cancel/reject/delete retry must not double-restock. Shipping then cancellation/returns must preserve exact eligible quantities.
4. Partial/full payment, explicit overpayment, invalid decimal, payment on cancelled order, refund beyond receipts, void receipt after refund, concurrent payment/refund, audit preservation. Legacy paid-mark action requires separately approved test scope.
5. PO create supplier/variant defaults, expected date validation, approval submit/edit invalidation, queued vs delivered email, split receipts, overreceipt capped, wrong PO line not credited, duplicate concurrent receipt, correct bin + supplier history.
6. Return only shipped/available quantity, mixed restock flags, damaged default, discounted refund rounding, duplicate line, edit pre-receive and reject-after-approve refusal, double receive, cancellation after return creation, complete without payment refund.
7. WO assembly/kit rejection, nested kit explosion, variant identity, stale availability between start and complete, serial duplication, expired/foreign lot, exact partial-output proportional consumption, output creation collision rollback, double complete, concurrent cancel vs complete, completed deletion refusal.
8. Shipment manual/quoted route, no lines, over-shipment, wrong order-item, approval denial, multiple partial shipments, no second stock deduction, rate resume, failure preserving pending shipment. Carrier charge/label purchase only with explicit test budget/authorization.
9. Viewer/editor/approver/warehouse-restricted/foreign-org cases through both UI and direct API; stale permission revoked during draft, hidden protected totals, server-generated ownership fields tampering; failed command preserves draft and no false success.
10. Each accepted operation must demonstrate reload persistence, expected stock/payment ledger deltas, corresponding audit metadata, exact final status and browser evidence. Source-only tables below do not establish those outcomes.



<a id="e0174"></a>

> Audit provenance: `commerce.md` lines 117–131. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### List/filter/pagination contracts

| Page | Submitted filter keys | Source paging | Behavior |
|---|---|---|---|
| Customers Index | search; controller also accepts is_active though core page exposes search only | default15 | explicit search/clear, retain query on page navigation |
| Suppliers Index | search; backend is_active not a visible core filter |15| explicit search/clear |
| Orders Index | search, status, source, payment_status only if canViewPayments |default15| explicit search/clear; hide payment data/filter/column when denied |
| PurchaseOrders Index | search, status, supplier_id |15| explicit search/clear; supplier selection from scoped props |
| Returns Index | search, status, type |default15| search debounce300ms, status/type immediately requery |
| Returns SelectOrder | search |default15| debounce300ms; only eligible order result links enter creation |
| WorkOrders Index | search, status |20| explicit search/clear; active warehouse filters backend query |
| Approvals Index | local tab pending/mine | supplied arrays, no paginated table in this Vue | tab affects displayed request list, not independent authority |

All filter refs initialize incoming server filters or blank. Source backend page-size configuration is `config/limits.php:19-22`; controller pagination call sites: CustomerController.php:45, Inventory/SupplierController.php:53, Order/OrderController.php:93, Purchasing/PurchaseOrderController.php:60, Order/ReturnOrderController.php:55,112, Inventory/WorkOrderController.php:70. These are source behaviors; Taruvi implementation should use native server pagination rather than loading all rows.



<a id="e0175"></a>

> Audit provenance: `commerce.md` lines 132–136. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## 3. Complete page/control inventory

Each row provides actual model binding, resolved label, control type, HTML constraints/events and option evidence. Server request tables later override weak client checks. Initializer blocks are exact source expressions and define defaults/hydration, including hidden payload fields. Action rows retain conditional expressions so unavailable-state handling can be implemented.




<a id="e0210"></a>

> Audit provenance: `commerce.md` lines 3201–3205. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## 4. Authoritative request validation

Every rule block below is source evidence. Rules inherited by `ValidatesVariantLines`, service state guards, organization/warehouse authorization and database uniqueness still apply. A rule allowing an identifier is not proof its related record belongs to the selected parent.




<a id="e0227"></a>

> Audit provenance: `commerce.md` lines 3938–3986. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ValidatesVariantLines.php

[app/Http/Requests/Concerns/ValidatesVariantLines.php:1](C:/Users/proj/Inventoros/app/Http/Requests/Concerns/ValidatesVariantLines.php#L1)

```php
9: 
10: /**
11:  * Adds the variant pairing checks from VariantLineValidator to a form
12:  * request's `items` array, reported as items.N.product_variant_id errors
13:  * (instead of letting the service throw a flash error after the fact).
14:  *
15:  * Requests serving existing API clients override requiresVariantForVariantProducts()
16:  * to keep the variant optional there.
17:  */
18: trait ValidatesVariantLines
19: {
20:     /**
21:      * @return array<int, \Closure(Validator): void>
22:      */
23:     public function after(): array
24:     {
25:         return [
26:             function (Validator $validator): void {
27:                 $items = $this->input('items');
28:                 if (! is_array($items)) {
29:                     return;
30:                 }
31: 
32:                 $errors = VariantLineValidator::errors(
33:                     $items,
34:                     (int) $this->user()->organization_id,
35:                     $this->requiresVariantForVariantProducts(),
36:                 );
37: 
38:                 foreach ($errors as $index => $message) {
39:                     $validator->errors()->add("items.{$index}.product_variant_id", $message);
40:                 }
41:             },
42:         ];
43:     }
44: 
45:     protected function requiresVariantForVariantProducts(): bool
46:     {
47:         return true;
48:     }
49: }
```




<a id="e0228"></a>

> Audit provenance: `commerce.md` lines 3987–4210. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Nested endpoint rules not in dedicated request classes


[app/Http/Controllers/CustomerContactController.php:22](C:/Users/proj/Inventoros/app/Http/Controllers/CustomerContactController.php#L22)

```php
22:     public function store(Request $request, Customer $customer): RedirectResponse
23:     {
24:         $this->authorizeCustomer($request, $customer);
25: 
26:         if (! $customer->organization->portal_enabled) {
27:             return back()->with('error', __('Turn on the customer portal in organization settings before inviting contacts.'));
28:         }
29: 
30:         $request->merge(['email' => mb_strtolower(trim((string) $request->input('email')))]);
31: 
32:         $validated = $request->validate([
33:             'name' => ['required', 'string', 'max:255'],
34:             'email' => [
35:                 'required',
36:                 'string',
37:                 'email',
38:                 'max:255',
39:                 Rule::unique('customer_contacts', 'email')->where('organization_id', $customer->organization_id),
40:             ],
41:         ], [
42:             'email.unique' => __('This email already has portal access for a customer in your organization.'),
43:         ]);
44: 
45:         $contact = $this->invitations->invite($customer, $validated['name'], $validated['email'], $request->user());
46: 
47:         return back()->with('success', "Invitation sent to {$contact->email}.");
```


[app/Http/Controllers/Order/ShipmentController.php:36](C:/Users/proj/Inventoros/app/Http/Controllers/Order/ShipmentController.php#L36)

```php
36:     public function store(Request $request, Order $order): Response
37:     {
38:         $this->assertSameOrganization($request, $order->organization_id);
39: 
40:         $organizationId = (int) $request->user()->organization_id;
41: 
42:         $validated = $request->validate([
43:             'carrier' => ['required', 'string', Rule::in($this->carriers->available($organizationId))],
44:             'carrier_name' => ['nullable', 'string', 'max:100'],
45:             'service' => ['nullable', 'string', 'max:100'],
46:             'tracking_number' => ['nullable', 'string', 'max:100'],
47:             'tracking_url' => ['nullable', 'url:https,http', 'max:2048'],
48:             'cost' => ['nullable', 'numeric', 'min:0', 'max:999999'],
49:             'currency' => ['nullable', 'string', 'size:3'],
50:             'warehouse_id' => ['nullable', 'integer', Rule::exists('warehouses', 'id')->where('organization_id', $organizationId)],
51:             'weight_oz' => ['nullable', 'numeric', 'min:0', 'max:100000'],
52:             'length_in' => ['nullable', 'numeric', 'min:0', 'max:10000'],
53:             'width_in' => ['nullable', 'numeric', 'min:0', 'max:10000'],
54:             'height_in' => ['nullable', 'numeric', 'min:0', 'max:10000'],
55:             'notify_customer' => ['nullable', 'boolean'],
56:             'mark_shipped' => ['nullable', 'boolean'],
57:             'items' => ['nullable', 'array', 'max:500'],
58:             'items.*.order_item_id' => ['required', 'integer'],
59:             'items.*.quantity' => ['required', 'integer', 'min:0'],
60:             'to_address' => ['nullable', 'array'],
61:             'to_address.*' => ['nullable', 'string', 'max:255'],
62:         ]);
63: 
64:         $shipment = null;
```


[app/Http/Controllers/Order/ShipmentController.php:115](C:/Users/proj/Inventoros/app/Http/Controllers/Order/ShipmentController.php#L115)

```php
115:     public function buy(Request $request, Shipment $shipment): JsonResponse
116:     {
117:         $this->assertSameOrganization($request, $shipment->organization_id);
118: 
119:         $validated = $request->validate([
120:             'rate_id' => ['required', 'string', 'max:100'],
121:         ]);
122: 
```


[app/Http/Controllers/Order/OrderPaymentController.php:40](C:/Users/proj/Inventoros/app/Http/Controllers/Order/OrderPaymentController.php#L40)

```php
40:     public function void(Request $request, Order $order, OrderPayment $payment): RedirectResponse
41:     {
42:         $this->authorizeOrder($request, $order);
43: 
44:         if ($payment->order_id !== $order->id) {
45:             abort(404);
46:         }
47: 
48:         $validated = $request->validate([
49:             'reason' => ['nullable', 'string', 'max:255'],
50:         ]);
51: 
52:         $this->payments->void($payment, $request->user(), $validated['reason'] ?? null);
```


[app/Http/Controllers/Order/OrderPaymentController.php:63](C:/Users/proj/Inventoros/app/Http/Controllers/Order/OrderPaymentController.php#L63)

```php
63:     public function markPreTrackingPaid(Request $request): RedirectResponse
64:     {
65:         $validated = $request->validate([
66:             'before' => ['required', 'date_format:Y-m-d'],
67:         ]);
68: 
69:         $count = $this->payments->markPreTrackingOrdersPaid(
70:             (int) $request->user()->organization_id,
```


[app/Http/Controllers/Order/OrderController.php:442](C:/Users/proj/Inventoros/app/Http/Controllers/Order/OrderController.php#L442)

```php
442:     public function approve(Request $request, Order $order)
443:     {
444:         // Ensure user can only approve orders from their organization
445:         if ($order->organization_id !== $request->user()->organization_id) {
446:             abort(403, 'Unauthorized action.');
447:         }
448: 
449:         // Check if order is pending approval
450:         if (! $order->isPendingApproval()) {
451:             return redirect()->back()->with('error', __('Order has already been processed.'));
452:         }
453: 
454:         $validated = $request->validate([
455:             'notes' => 'nullable|string|max:500',
456:         ]);
```


[app/Http/Controllers/Order/OrderController.php:474](C:/Users/proj/Inventoros/app/Http/Controllers/Order/OrderController.php#L474)

```php
474:     public function reject(Request $request, Order $order)
475:     {
476:         // Ensure user can only reject orders from their organization
477:         if ($order->organization_id !== $request->user()->organization_id) {
478:             abort(403, 'Unauthorized action.');
479:         }
480: 
481:         // Check if order is pending approval
482:         if (! $order->isPendingApproval()) {
483:             return redirect()->back()->with('error', __('Order has already been processed.'));
484:         }
485: 
486:         $validated = $request->validate([
487:             'notes' => 'required|string|max:500',
488:         ]);
```


[app/Http/Controllers/ApprovalController.php:35](C:/Users/proj/Inventoros/app/Http/Controllers/ApprovalController.php#L35)

```php
35:     public function approve(Request $request, string $type, int $id): RedirectResponse
36:     {
37:         $validated = $request->validate([
38:             'notes' => 'nullable|string|max:1000',
39:         ]);
40: 
41:         return $this->decide(fn () => $this->approvals->approve($request->user(), $type, $id, $validated['notes'] ?? null), 'Request approved.');
42:     }
43: 
44:     public function reject(Request $request, string $type, int $id): RedirectResponse
45:     {
46:         $validated = $request->validate([
47:             'notes' => 'required|string|max:1000',
48:         ], [
49:             'notes.required' => __('Give a reason for rejecting this request.'),
50:         ]);
51: 
```


[app/Services/WorkOrderService.php:68](C:/Users/proj/Inventoros/app/Services/WorkOrderService.php#L68)

```php
68:     public static function creationRules(): array
69:     {
70:         return [
71:             'product_variant_id' => ['nullable', 'integer'],
72:             'component_variants' => ['nullable', 'array', 'max:500'],
73:             'component_variants.*.product_id' => ['required', 'integer'],
74:             'component_variants.*.product_variant_id' => ['required', 'integer'],
75:         ];
76:     }
77: 
78:     /**
79:      * Validation rules for completing a work order, shared by the web and
80:      * REST controllers.
81:      *
82:      * @return array<string, mixed>
83:      */
84:     public static function completionRules(int $maxQuantity): array
85:     {
86:         return [
87:             'quantity_produced' => ['nullable', 'integer', 'min:1', 'max:'.$maxQuantity],
88:             'allocations' => ['nullable', 'array', 'max:500'],
89:             'allocations.*.work_order_item_id' => ['required', 'integer'],
90:             'allocations.*.serial_ids' => ['nullable', 'array', 'max:10000'],
91:             'allocations.*.serial_ids.*' => ['integer'],
92:             'allocations.*.batches' => ['nullable', 'array', 'max:500'],
93:             'allocations.*.batches.*.product_batch_id' => ['required', 'integer'],
94:             'allocations.*.batches.*.quantity' => ['required', 'integer', 'min:1'],
95:             'output' => ['nullable', 'array'],
96:             'output.serial_numbers' => ['nullable', 'array', 'max:10000'],
97:             'output.serial_numbers.*' => ['required', 'string', 'max:255'],
98:             'output.batch_number' => ['nullable', 'string', 'max:255'],
99:             'output.expiry_date' => ['nullable', 'date'],
100:             'output.manufactured_date' => ['nullable', 'date'],
101:         ];
102:     }
103: 
```




<a id="e0230"></a>

> Audit provenance: `commerce.md` lines 4216–4290. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### routes/web/sales.php

[routes/web/sales.php:1](C:/Users/proj/Inventoros/routes/web/sales.php#L1)

```php
24: Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index')->middleware('permission:view_suppliers');
25: Route::get('/suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create')->middleware('permission:create_suppliers');
26: Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store')->middleware('permission:create_suppliers');
27: Route::get('/suppliers/{supplier}', [SupplierController::class, 'show'])->name('suppliers.show')->middleware('permission:view_suppliers');
28: Route::get('/suppliers/{supplier}/edit', [SupplierController::class, 'edit'])->name('suppliers.edit')->middleware('permission:edit_suppliers');
29: Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update')->middleware('permission:edit_suppliers');
30: Route::patch('/suppliers/{supplier}', [SupplierController::class, 'update'])->middleware('permission:edit_suppliers');
31: Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy')->middleware('permission:delete_suppliers');
34: Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index')->middleware('permission:view_customers');
35: Route::get('/customers/create', [CustomerController::class, 'create'])->name('customers.create')->middleware('permission:create_customers');
36: Route::post('/customers', [CustomerController::class, 'store'])->name('customers.store')->middleware('permission:create_customers');
37: Route::get('/customers/{customer}', [CustomerController::class, 'show'])->name('customers.show')->middleware('permission:view_customers');
38: Route::get('/customers/{customer}/edit', [CustomerController::class, 'edit'])->name('customers.edit')->middleware('permission:edit_customers');
39: Route::put('/customers/{customer}', [CustomerController::class, 'update'])->name('customers.update')->middleware('permission:edit_customers');
40: Route::patch('/customers/{customer}', [CustomerController::class, 'update'])->middleware('permission:edit_customers');
41: Route::delete('/customers/{customer}', [CustomerController::class, 'destroy'])->name('customers.destroy')->middleware('permission:delete_customers');
44: Route::post('/customers/{customer}/contacts', [CustomerContactController::class, 'store'])->name('customers.contacts.store')->middleware(['permission:edit_customers', 'throttle:30,1']);
45: Route::post('/customers/{customer}/contacts/{contact}/resend', [CustomerContactController::class, 'resend'])->name('customers.contacts.resend')->middleware(['permission:edit_customers', 'throttle:30,1']);
46: Route::delete('/customers/{customer}/contacts/{contact}', [CustomerContactController::class, 'destroy'])->name('customers.contacts.destroy')->middleware('permission:edit_customers');
49: Route::get('/purchase-orders', [PurchaseOrderController::class, 'index'])->name('purchase-orders.index')->middleware('permission:view_purchase_orders');
50: Route::get('/purchase-orders/create', [PurchaseOrderController::class, 'create'])->name('purchase-orders.create')->middleware('permission:create_purchase_orders');
51: Route::post('/purchase-orders', [PurchaseOrderController::class, 'store'])->name('purchase-orders.store')->middleware('permission:create_purchase_orders');
52: Route::post('/purchase-orders/quick-reorder', [QuickReorderController::class, 'store'])->name('purchase-orders.quick-reorder')->middleware('permission:create_purchase_orders');
53: Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show'])->name('purchase-orders.show')->middleware('permission:view_purchase_orders');
54: Route::get('/purchase-orders/{purchaseOrder}/edit', [PurchaseOrderController::class, 'edit'])->name('purchase-orders.edit')->middleware('permission:edit_purchase_orders');
55: Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update'])->name('purchase-orders.update')->middleware('permission:edit_purchase_orders');
56: Route::patch('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update'])->middleware('permission:edit_purchase_orders');
57: Route::delete('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'destroy'])->name('purchase-orders.destroy')->middleware('permission:delete_purchase_orders');
58: Route::get('/purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'receive'])->name('purchase-orders.receive')->middleware('permission:receive_purchase_orders');
59: Route::post('/purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'processReceiving'])->name('purchase-orders.process-receiving')->middleware('permission:receive_purchase_orders');
60: Route::post('/purchase-orders/{purchaseOrder}/send', [PurchaseOrderController::class, 'sendToSupplier'])->name('purchase-orders.send')->middleware('permission:edit_purchase_orders');
61: Route::post('/purchase-orders/{purchaseOrder}/submit-for-approval', [PurchaseOrderController::class, 'submitForApproval'])->name('purchase-orders.submit-approval')->middleware('permission:edit_purchase_orders');
62: Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel'])->name('purchase-orders.cancel')->middleware('permission:edit_purchase_orders');
65: Route::get('/purchase-orders/{purchaseOrder}/invoice/download', [PurchaseOrderInvoiceController::class, 'download'])->name('purchase-orders.invoice.download')->middleware('permission:view_purchase_orders');
66: Route::get('/purchase-orders/{purchaseOrder}/invoice/preview', [PurchaseOrderInvoiceController::class, 'preview'])->name('purchase-orders.invoice.preview')->middleware('permission:view_purchase_orders');
69: Route::get('/orders', [OrderController::class, 'index'])->name('orders.index')->middleware('permission:view_orders');
70: Route::get('/orders/create', [OrderController::class, 'create'])->name('orders.create')->middleware('permission:create_orders');
71: Route::post('/orders', [OrderController::class, 'store'])->name('orders.store')->middleware('permission:create_orders');
72: Route::get('/orders/customer-lookup', [OrderController::class, 'customerLookup'])->name('orders.customer-lookup')->middleware('permission:view_orders');
73: Route::get('/orders/{order}/edit', [OrderController::class, 'edit'])->name('orders.edit')->middleware('permission:edit_orders');
74: Route::put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update')->middleware('permission:edit_orders');
75: Route::patch('/orders/{order}', [OrderController::class, 'update'])->middleware('permission:edit_orders');
76: Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show')->middleware('permission:view_orders');
77: Route::delete('/orders/{order}', [OrderController::class, 'destroy'])->name('orders.destroy')->middleware('permission:delete_orders');
78: Route::post('/orders/{order}/approve', [OrderController::class, 'approve'])->name('orders.approve')->middleware('permission:approve_orders');
79: Route::post('/orders/{order}/reject', [OrderController::class, 'reject'])->name('orders.reject')->middleware('permission:approve_orders');
82: Route::post('/orders/payments/mark-pre-tracking-paid', [OrderPaymentController::class, 'markPreTrackingPaid'])->name('orders.payments.mark-pre-tracking-paid')->middleware('permission:record_payments');
83: Route::post('/orders/{order}/payments', [OrderPaymentController::class, 'store'])->name('orders.payments.store')->middleware('permission:record_payments');
84: Route::post('/orders/{order}/payments/{payment}/void', [OrderPaymentController::class, 'void'])->name('orders.payments.void')->middleware('permission:record_payments');
87: Route::get('/orders/{order}/invoice/download', [InvoiceController::class, 'download'])->name('orders.invoice.download')->middleware('permission:view_orders');
88: Route::get('/orders/{order}/invoice/preview', [InvoiceController::class, 'preview'])->name('orders.invoice.preview')->middleware('permission:view_orders');
89: Route::post('/orders/{order}/invoice/email', [InvoiceController::class, 'email'])->name('orders.invoice.email')->middleware('permission:edit_orders');
92: Route::post('/orders/{order}/shipments', [ShipmentController::class, 'store'])->name('orders.shipments.store')->middleware('permission:create_shipments');
93: Route::post('/shipments/{shipment}/rates', [ShipmentController::class, 'rates'])->name('shipments.rates')->middleware('permission:create_shipments');
94: Route::post('/shipments/{shipment}/buy', [ShipmentController::class, 'buy'])->name('shipments.buy')->middleware('permission:create_shipments');
95: Route::post('/shipments/{shipment}/ship', [ShipmentController::class, 'ship'])->name('shipments.ship')->middleware('permission:create_shipments');
96: Route::post('/shipments/{shipment}/cancel', [ShipmentController::class, 'cancel'])->name('shipments.cancel')->middleware('permission:create_shipments');
97: Route::get('/shipments/{shipment}/label', [ShipmentController::class, 'label'])->name('shipments.label')->middleware('permission:view_shipments');
100: Route::get('/returns', [ReturnOrderController::class, 'index'])->name('returns.index')->middleware('permission:manage_returns');
101: Route::get('/returns/create', [ReturnOrderController::class, 'create'])->name('returns.create')->middleware('permission:manage_returns');
102: Route::post('/returns', [ReturnOrderController::class, 'store'])->name('returns.store')->middleware('permission:manage_returns');
103: Route::get('/returns/{returnOrder}', [ReturnOrderController::class, 'show'])->name('returns.show')->middleware('permission:manage_returns');
104: Route::patch('/returns/{returnOrder}/items', [ReturnOrderController::class, 'updateLines'])->name('returns.items.update')->middleware('permission:manage_returns');
105: Route::post('/returns/{returnOrder}/approve', [ReturnOrderController::class, 'approve'])->name('returns.approve')->middleware('permission:manage_returns');
106: Route::post('/returns/{returnOrder}/receive', [ReturnOrderController::class, 'receive'])->name('returns.receive')->middleware('permission:manage_returns');
107: Route::post('/returns/{returnOrder}/complete', [ReturnOrderController::class, 'complete'])->name('returns.complete')->middleware('permission:manage_returns');
108: Route::post('/returns/{returnOrder}/reject', [ReturnOrderController::class, 'reject'])->name('returns.reject')->middleware('permission:manage_returns');
```




<a id="e0232"></a>

> Audit provenance: `commerce.md` lines 4306–4317. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### routes/web/inventory.php

[routes/web/inventory.php:1](C:/Users/proj/Inventoros/routes/web/inventory.php#L1)

```php
122: Route::resource('work-orders', WorkOrderController::class)->except(['edit', 'update'])->middleware('permission:manage_stock');
123: Route::post('work-orders/{workOrder}/start', [WorkOrderController::class, 'start'])->name('work-orders.start')->middleware('permission:manage_stock');
124: Route::post('work-orders/{workOrder}/complete', [WorkOrderController::class, 'complete'])->name('work-orders.complete')->middleware('permission:manage_stock');
125: Route::post('work-orders/{workOrder}/cancel', [WorkOrderController::class, 'cancel'])->name('work-orders.cancel')->middleware('permission:manage_stock');
```




<a id="e0233"></a>

> Audit provenance: `commerce.md` lines 4318–4322. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## 6. Data ownership and relationships

Source model fields/casts and relation declarations below identify storage concepts. Do not copy `fillable` as a browser allowlist: it includes server-owned identifiers/totals/state. Soft deletes, organization scopes, generated values and constraints must be preserved through target commands. Target DBSchemaAgent must confirm actual target table/column names before implementation.




<a id="e0251"></a>

> Audit provenance: `commerce.md` lines 4981–5056. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## 7. Owned page coverage checklist and source integrity

`[x]` means source controls/initializers/action/validation mapping recorded in this document, **not browser-tested or implemented**. Every module acceptance remains open until the stated end-to-end scenarios pass. Shared dependency components are included separately.

| Source surface | Source-mapped | Editable control bindings | Lines | SHA256 |
|---|---|---:|---:|---|

| `resources/js/Pages/Customers/Create.vue` | [x] | 23 | 276 | `47a6002eef2311350e349c74ddfc507b67b0a96c0b6b71f9782b7fc52333781f` |

| `resources/js/Pages/Customers/Edit.vue` | [x] | 23 | 260 | `ab612bb7af2386452fabc083d4e4c59bd5ed5eae099e526fd7bcb8e25a46eeb8` |

| `resources/js/Pages/Customers/Index.vue` | [x] | 1 | 185 | `f1ba7c1e6998a1c2815c8534c758d033d89c2801da13da9377061b0316aeb487` |

| `resources/js/Pages/Customers/Show.vue` | [x] | 2 | 446 | `f330f3aad7fe328dd3ad778fa587b60f852a7a4286049660947a7d811dc03c72` |

| `resources/js/Pages/Suppliers/Create.vue` | [x] | 16 | 214 | `bc5edddbabc6aec8b0a2edd6fd2efe4ea55b314650102e863c14472a0dfed322` |

| `resources/js/Pages/Suppliers/Edit.vue` | [x] | 16 | 217 | `2a659faec4fa83dc859027ef2ef4ee46d1a9d138e444d4038ff36582fddd4b95` |

| `resources/js/Pages/Suppliers/Index.vue` | [x] | 1 | 190 | `fa0b481bb033c5b68080716ec7e4e93b8476a7c4cc0fe5ea174c36185db3c9fa` |

| `resources/js/Pages/Suppliers/Show.vue` | [x] | 0 | 228 | `6edd525493667fae0e13b91710e9c1798ce5be876955803860c4783e48d0f951` |

| `resources/js/Pages/Orders/Create.vue` | [x] | 18 | 515 | `7b3fc70af5aae790f62a32da49448c7123992f406b47a85a8a7e811623cf1d01` |

| `resources/js/Pages/Orders/Edit.vue` | [x] | 16 | 409 | `e06532251c63257d3c62d8ebc8f31a55eb689b14552113012b6bb710e603f476` |

| `resources/js/Pages/Orders/Index.vue` | [x] | 5 | 293 | `5145cc1b9614d3c09c8ac7705ae8ced490b7dd25f27bba65176228896c013ba8` |

| `resources/js/Pages/Orders/Show.vue` | [x] | 8 | 864 | `07ebbfcdb738a2d505f2683dd28ca1397d6d081fabc3daff7f2a145ea3ea4a15` |

| `resources/js/Pages/PurchaseOrders/Create.vue` | [x] | 14 | 385 | `b41b7a756ba27d522f288e5f1c5f610ce3aed7c68aed75f0ff679c04b485e3d7` |

| `resources/js/Pages/PurchaseOrders/Edit.vue` | [x] | 15 | 425 | `680ac4ac1b679b4da19f933bfcf14a3fe95988a378b588056a356853925a5fae` |

| `resources/js/Pages/PurchaseOrders/Index.vue` | [x] | 3 | 234 | `f3fd0ba51b3aa01f75f631784f2b2fcec339645d906e4c3ea8a1f0d1292bebc8` |

| `resources/js/Pages/PurchaseOrders/Receive.vue` | [x] | 1 | 302 | `1abe7abaea56d5145483f3b6d5cff95a1de8bec7edcdc02ccbec40f5ac9c7e80` |

| `resources/js/Pages/PurchaseOrders/Show.vue` | [x] | 0 | 500 | `32a4cc90534901543441bcbaa5f1e0ac135bf043faf2056571f49e6e57786f07` |

| `resources/js/Pages/Returns/Create.vue` | [x] | 7 | 295 | `6c485483b5963a0b61a6b8a383c7cd469c8f3be9d917d6e64cc1f52ea302c63e` |

| `resources/js/Pages/Returns/Index.vue` | [x] | 3 | 219 | `2b34165c72c961403e3f1c1caddda0381e84e5199a16bfde7d9f654e9dbaaade` |

| `resources/js/Pages/Returns/SelectOrder.vue` | [x] | 1 | 140 | `8139d2b6fcc890871672465f62ce909a20a8067d19e62b8fa013edbfed9e51b1` |

| `resources/js/Pages/Returns/Show.vue` | [x] | 3 | 440 | `069082103e5924e94e0176657db344407c17727c44eefd5e8faca25ac1daaa6a` |

| `resources/js/Pages/WorkOrders/Create.vue` | [x] | 6 | 325 | `f85f85b83d3e218546e49f94649f1354b68aa9264243e7cfcc1aa1feee82fe39` |

| `resources/js/Pages/WorkOrders/Index.vue` | [x] | 2 | 226 | `9857464f0aa42d81d9e717383c7780ff4076efcb1daa4af7a7ff48c857493099` |

| `resources/js/Pages/WorkOrders/Show.vue` | [x] | 6 | 633 | `499fefeb1d350c52c94772c4ea532128efdc1381057aabe697b33a19c6c4d162` |

| `resources/js/Pages/Approvals/Index.vue` | [x] | 1 | 185 | `f78d3400c19e564a44e9862ff824f36346bc5dd0bbabdcc757c4cee4d3bb58da` |

| `resources/js/Components/ApprovalPanel.vue` | [x] | 1 | 151 | `81d95a50bde716584f40f010e23d1ca1aeb84193d80d7edb8b8e2bd2cc07e425` |

| `resources/js/Components/CustomerPicker.vue` | [x] | 1 | 157 | `be4b78123094961254bcadec4e0edbc23675c4870e78899b906e4672b8a26108` |

| `resources/js/Components/SendDocumentModal.vue` | [x] | 3 | 147 | `de94dde1bea912f9c4733bd4e33a298df9f6c4bac22f201fd9e9a3edfe5a8049` |

| `resources/js/Components/Shipping/ShipOrderModal.vue` | [x] | 14 | 411 | `ff3dd4ae9ab0a3f5981892c796790e034c937ec2f593afd40e5bbf71c1a0412d` |

| `resources/js/Components/Shipping/ShipmentsPanel.vue` | [x] | 0 | 199 | `076d15612449d09800c211f5b8554af937fa65fadf976856830019ec46294104` |

| `resources/js/Components/TaxInput.vue` | [x] | 2 | 70 | `8b0f406def37b284cbec2efe25e841abeaff2f996c19b0ad3ff99c583916078c` |

| `resources/js/Components/DiscountInput.vue` | [x] | 2 | 52 | `2bc38679c785be9281966ff28da443ac686f05a1134cbce74cc04854caba0062` |

| `resources/js/Components/SupplierRating.vue` | [x] | 0 | 70 | `b656c7de02ef1a25786191b330d05455aba67e7cf41cafd5f04edecc6e14b471` |

| `resources/js/Components/CurrencySelect.vue` | [x] | 1 | 17 | `f45a07ec144d85dd9f3dbaa09c636dd18588b7057caddc79319f76805b33cd84` |




<a id="e0252"></a>

> Audit provenance: `commerce.md` lines 5057–5063. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## 8. Remaining evidence boundaries

- Browser interaction and live create/edit/receipt/shipment/refund/production evidence must be supplied separately; no claim here that any transaction succeeded live.
- Plugin-defined fields/tabs/actions depend on installed/enabled plugins and remain explicitly external to the 25 core pages. Core PluginSlot/PluginTabs extension locations appear in the source; payload validation must be reconciled with actual plugins, not discarded.
- Carrier contracts, email delivery and PDF rendering need provider/render verification. Source presence is not configured availability, successful purchase or delivered email.
- Model excerpts identify source fields/relations, not exhaustive SQL DDL or verified target RLS. Audit target migrations/indexes/constraints separately; preserve exact-money arithmetic and immutable organization ownership.
- No new HMG names, table migrations, policies or service credentials are authorized by this report. All frontend checks must be backed by command-side authorization/integrity. For multi-row stock commands, prove atomicity/concurrency/rollback/idempotency/direct-write resistance before operational activation.
