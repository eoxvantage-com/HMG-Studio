# 14. Returns / RMA — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Returns / RMA as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Select eligible order; create return/exchange request; approval/rejection; line condition and restock choice; receive; complete; separate refund linkage.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Orders, Payments and Documents](../modules/12_orders.md), [Approvals](../modules/17_approvals.md), [Stock Adjustments](../modules/21_stock_adjustments.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Returns/Create.vue` | Pending | Pending |
| `resources/js/Pages/Returns/Index.vue` | Pending | Pending |
| `resources/js/Pages/Returns/SelectOrder.vue` | Pending | Pending |
| `resources/js/Pages/Returns/Show.vue` | Pending | Pending |

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

- [ ] Reject quantities above eligible shipped/remaining quantities.
- [ ] receipt restocks only selected eligible lines.
- [ ] repeated receipt does not duplicate stock.
- [ ] completing a return does not silently refund payment.

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

- [Returns/RMA](#e0170)
- [resources/js/Pages/Returns/Create.vue](#e0193)
- [resources/js/Pages/Returns/Index.vue](#e0194)
- [resources/js/Pages/Returns/SelectOrder.vue](#e0195)
- [resources/js/Pages/Returns/Show.vue](#e0196)
- [RejectReturnOrderRequest.php](#e0222)
- [StoreReturnOrderRequest.php](#e0223)
- [UpdateReturnLinesRequest.php](#e0224)
- [app/Models/Order/ReturnOrder.php](#e0245)
- [app/Models/Order/ReturnOrderItem.php](#e0246)
- [`app/Http/Requests/Api/ReturnOrder/StoreReturnOrderRequest.php`](#e0491)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0170"></a>

> Audit provenance: `commerce.md` lines 69–80. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Returns/RMA

Select eligible order → choose lines → pending → approve → received → completed; only pending may reject. Type return or exchange. Exchange type does not by itself prove a new replacement sales order is automatically created.

- order_id is supplied by selected order; type defaults return; reason required max1000; notes optional max2000.
- Each source order line has hidden order_item_id/product_id and displayed name/variant/SKU/ordered/already-returned/returnable. Checkbox selected=false, quantity0, condition=new, restock=true. Selecting starts min(1,returnable); deselect resets quantity0/condition/restock. Damaged sets restock false; new sets true; used preserves current restock choice. Only selected positive rows submitted.
- Quantity 1..server returnable, no duplicate order_item_id; condition new/used/damaged; restock boolean required. Server verifies shipped coverage, prior claims and real order-line/product ownership; request exists rules alone are insufficient.
- Estimated refund uses discounted line paid net and prior refunds/balance; server total authoritative. Show edits only condition/restock before receive (pending/approved); edit request max500 items. Reject notes optional max2000.
- **Receive restocks marked lines**, including variant/bin/tracking release, under lock and rechecks shipped quantities. Complete sets completed/processor/time but **does not record payment refund**. Payment refund is a separate order action. Double receive must not duplicate stock. Cancelled source order blocks receiving.

Evidence: [return lines](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L34), [receive](C:/Users/proj/Inventoros/app/Services/ReturnOrderService.php#L567), [receive recheck](C:/Users/proj/Inventoros/app/Services/ReturnOrderService.php#L723), [complete](C:/Users/proj/Inventoros/app/Services/ReturnOrderService.php#L772).



<a id="e0193"></a>

> Audit provenance: `commerce.md` lines 2054–2139. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Returns/Create.vue

Source: [resources/js/Pages/Returns/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L1).


**Named routes referenced:** `orders.index`, `orders.show`, `returns.index`, `returns.store`.


**Permission/route-capability checks:** `orders.show`.


**Sections / displayed fields / table columns:**

- h3: Return Details (L142)
- h3: Select Items to Return (L180)


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.type` | Type | select | No extra control attribute; server rules below | return: Return (Refund); exchange: Exchange | [resources/js/Pages/Returns/Create.vue:147](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L147) |

| `form.reason` | Reason * | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Returns/Create.vue:157](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L157) |

| `form.notes` | Notes (optional) | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Returns/Create.vue:168](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L168) |

| `item.selected` | item.product_name | input / checkbox | :disabled=maxReturnable(item) <= 0; @change=toggleItem(item) | — | [resources/js/Pages/Returns/Create.vue:191](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L191) |

| `item.quantity` | Qty | input / number | :min=1; :max=maxReturnable(item) | — | [resources/js/Pages/Returns/Create.vue:218](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L218) |

| `item.condition` | Condition | select | @change=updateCondition(item) | new: New (Unopened); used: Used (Opened); damaged: Damaged | [resources/js/Pages/Returns/Create.vue:230](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L230) |

| `item.restock` | Restock | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Pages/Returns/Create.vue:244](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L244) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/Returns/Create.vue:34](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L34)

```text
34: const form = useForm({
35:     order_id: props.order.id,
36:     type: 'return',
37:     reason: '',
38:     notes: '',
39:     items: props.order.items.map(item => ({
40:         order_item_id: item.id,
41:         product_id: item.product_id,
42:         product_name: item.product_name,
43:         // A variant line shows its variant, as it was sold.
44:         variant_title: item.variant?.title ?? null,
45:         sku: item.variant?.sku || item.sku,
46:         ordered_quantity: item.quantity,
47:         returnable_quantity: Number(props.returnableQuantities?.[item.id] ?? 0),
48:         already_returned: props.returnedQuantities?.[item.id] || 0,
49:         quantity: 0,
50:         condition: 'new',
51:         restock: true,
52:         selected: false,
53:     })),
54: });
55: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('orders.index')` | [resources/js/Pages/Returns/Create.vue:122](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L122) |

| Returns | `:href=route('returns.index')` | [resources/js/Pages/Returns/Create.vue:124](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L124) |

| Back to Order | `:href=backHref` | [resources/js/Pages/Returns/Create.vue:132](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L132) |

| Cancel | `:href=backHref` | [resources/js/Pages/Returns/Create.vue:277](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L277) |

| form.processing ? Processing... : Submit Return Request | `type=submit; :loading=form.processing; :disabled=form.processing \|\| selectedItems.length === 0` | [resources/js/Pages/Returns/Create.vue:280](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Create.vue#L280) |


**Conditional sections / submit boundaries (source expressions):**

```text
139: <form @submit.prevent="submit" class="mt-6 space-y-4">
214: <div v-if="item.selected" class="flex w-full flex-wrap items-center gap-4 sm:w-auto">
```




<a id="e0194"></a>

> Audit provenance: `commerce.md` lines 2140–2204. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Returns/Index.vue

Source: [resources/js/Pages/Returns/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Index.vue#L1).


**Named routes referenced:** `orders.show`, `returns.create`, `returns.index`, `returns.show`.


**Permission/route-capability checks:** `orders.show`.


**Sections / displayed fields / table columns:**

- th: Return # (L135)
- th: Order # (L136)
- th: Type (L137)
- th: Status (L138)
- th: Items (L139)
- th: Refund (L140)
- th: Date (L141)
- th: Actions (L142)


**UI state/filter defaults:**

```text
29: const search = ref(props.filters?.search || '');
30: const statusFilter = ref(props.filters?.status || '');
31: const typeFilter = ref(props.filters?.type || '');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `search` | Search | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/Returns/Index.vue:101](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Index.vue#L101) |

| `statusFilter` | Status | select | No extra control attribute; server rules below | : All Statuses; status: t(`portal.statuses.${status}`) [repeat status in statuses] | [resources/js/Pages/Returns/Index.vue:110](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Index.vue#L110) |

| `typeFilter` | Type | select | No extra control attribute; server rules below | : All Types; type: t(`portal.returns.types.${type}`) [repeat type in types] | [resources/js/Pages/Returns/Index.vue:119](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Index.vue#L119) |


| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| New Return | `:href=route('returns.create')` | [resources/js/Pages/Returns/Index.vue:86](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Index.vue#L86) |

| Search | `type=submit` | [resources/js/Pages/Returns/Index.vue:102](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Index.vue#L102) |

| returnOrder.order.order_number | `:href=route('orders.show', returnOrder.order_id)` | [resources/js/Pages/Returns/Index.vue:160](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Index.vue#L160) |

| Icon action | `:href=route('returns.show', returnOrder.id)` | [resources/js/Pages/Returns/Index.vue:182](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Index.vue#L182) |


**Conditional sections / submit boundaries (source expressions):**

```text
99: <form class="table-quick-search" @submit.prevent="applyFilters">
105: <form @submit.prevent="applyFilters" class="space-y-4">
146: <tr v-if="!returns.data || returns.data.length === 0">
190: <div v-if="returns.links && returns.links.length > 3" class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row table-pagination">
197: v-if="link.url"
```




<a id="e0195"></a>

> Audit provenance: `commerce.md` lines 2205–2258. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Returns/SelectOrder.vue

Source: [resources/js/Pages/Returns/SelectOrder.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Returns/SelectOrder.vue#L1).


**Named routes referenced:** `returns.create`, `returns.index`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- th: Order # (L79)
- th: Customer (L80)
- th: Order date (L81)
- th: Status (L82)
- th: Total (L83)
- th: Start return (L84)


**UI state/filter defaults:**

```text
24: const search = ref(props.filters?.search || '');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `search` | Search | input / search | No extra control attribute; server rules below | — | [resources/js/Pages/Returns/SelectOrder.vue:64](C:/Users/proj/Inventoros/resources/js/Pages/Returns/SelectOrder.vue#L64) |


| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Returns | `:href=route('returns.index')` | [resources/js/Pages/Returns/SelectOrder.vue:45](C:/Users/proj/Inventoros/resources/js/Pages/Returns/SelectOrder.vue#L45) |

| Back to Returns | `:href=route('returns.index')` | [resources/js/Pages/Returns/SelectOrder.vue:53](C:/Users/proj/Inventoros/resources/js/Pages/Returns/SelectOrder.vue#L53) |

| Start return | `:href=route('returns.create', { order_id: order.id })` | [resources/js/Pages/Returns/SelectOrder.vue:110](C:/Users/proj/Inventoros/resources/js/Pages/Returns/SelectOrder.vue#L110) |


**Conditional sections / submit boundaries (source expressions):**

```text
88: <tr v-if="!orders.data || orders.data.length === 0">
102: <div v-if="order.customer_email" class="text-xs text-text-tertiary">{{ order.customer_email }}</div>
120: <div v-if="orders.links && orders.links.length > 3" class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
125: v-if="link.url"
```




<a id="e0196"></a>

> Audit provenance: `commerce.md` lines 2259–2391. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Returns/Show.vue

Source: [resources/js/Pages/Returns/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L1).


**Named routes referenced:** `orders.show`, `returns.index`, `returns.items.update`, `returns.reject`.


**Permission/route-capability checks:** `manage_returns`, `orders.show`.


**Sections / displayed fields / table columns:**

- h3: Return Items (L185)
- th: Product (L200)
- th: SKU (L201)
- th: Qty (L202)
- th: Condition (L203)
- th: Restock (L204)
- h3: Details (L265)
- dt: Reason (L269)
- dt: Notes (L273)
- dt: For Order (L277)
- h3: Summary (L294)
- dt: Return Number (L298)
- dt: Type (L302)
- dt: Status (L308)
- dt: Created (L314)
- dt: Completed (L318)
- dt: Processed By (L322)
- dt: Refund Amount (L327)
- h3: Actions (L337)
- h3: Danger Zone (L385)
- h3: Reject Return (L405)


**UI state/filter defaults:**

```text
28: const processing = ref(false);
29: const showRejectModal = ref(false);
30: const rejectNotes = ref('');
80: const editingLines = ref(false);
81: const lineEdits = reactive({});
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `lineEdits[item.id].condition` | Condition {name} | select | v-if=editingLines && lineEdits[item.id] | new: getConditionLabel('new'); used: getConditionLabel('used'); damaged: getConditionLabel('damaged') | [resources/js/Pages/Returns/Show.vue:224](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L224) |

| `lineEdits[item.id].restock` | Restock {name} | input / checkbox | v-if=editingLines && lineEdits[item.id] | — | [resources/js/Pages/Returns/Show.vue:239](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L239) |

| `rejectNotes` | Reason for rejection | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/Returns/Show.vue:416](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L416) |


**Exact `lineEdits` defaults / hydration / hidden payload** — [resources/js/Pages/Returns/Show.vue:81](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L81)

```text
81: const lineEdits = reactive({});
82: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('returns.index')` | [resources/js/Pages/Returns/Show.vue:112](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L112) |

| Returns | `:href=route('returns.index')` | [resources/js/Pages/Returns/Show.vue:114](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L114) |

| Approve Return | `v-if=returnOrder.status === 'pending'; :disabled=processing; @click=performAction('approve')` | [resources/js/Pages/Returns/Show.vue:129](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L129) |

| Mark as Received | `v-if=returnOrder.status === 'approved'; :disabled=processing; @click=performAction('receive')` | [resources/js/Pages/Returns/Show.vue:139](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L139) |

| Complete Return | `v-if=returnOrder.status === 'received'; :disabled=processing; @click=performAction('complete')` | [resources/js/Pages/Returns/Show.vue:149](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L149) |

| Reject Return | `v-if=returnOrder.status === 'pending'; :disabled=processing; @click=showRejectModal = true` | [resources/js/Pages/Returns/Show.vue:159](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L159) |

| Back to Returns | `:href=route('returns.index')` | [resources/js/Pages/Returns/Show.vue:169](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L169) |

| Cancel | `:disabled=processing; @click=editingLines = false` | [resources/js/Pages/Returns/Show.vue:188](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L188) |

| Save lines | `:loading=processing; :disabled=processing; @click=saveLines` | [resources/js/Pages/Returns/Show.vue:189](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L189) |

| Edit lines | `@click=startEditingLines` | [resources/js/Pages/Returns/Show.vue:191](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L191) |

| # returnOrder.order.order_number | `v-if=canVisit('orders.show'); :href=route('orders.show', returnOrder.order_id)` | [resources/js/Pages/Returns/Show.vue:279](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L279) |

| Approve Return | `v-if=returnOrder.status === 'pending'; :disabled=processing; @click=performAction('approve')` | [resources/js/Pages/Returns/Show.vue:340](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L340) |

| Mark as Received | `v-if=returnOrder.status === 'approved'; :disabled=processing; @click=performAction('receive')` | [resources/js/Pages/Returns/Show.vue:349](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L349) |

| Complete Return | `v-if=returnOrder.status === 'received'; :disabled=processing; @click=performAction('complete')` | [resources/js/Pages/Returns/Show.vue:358](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L358) |

| Reject Return | `:disabled=processing; @click=showRejectModal = true` | [resources/js/Pages/Returns/Show.vue:387](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L387) |

| Icon action | `@click=showRejectModal = false` | [resources/js/Pages/Returns/Show.vue:406](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L406) |

| Cancel | `:disabled=processing; @click=showRejectModal = false` | [resources/js/Pages/Returns/Show.vue:425](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L425) |

| Rejecting... Reject Return | `:loading=processing; :disabled=processing; @click=submitReject` | [resources/js/Pages/Returns/Show.vue:428](C:/Users/proj/Inventoros/resources/js/Pages/Returns/Show.vue#L428) |


**Conditional sections / submit boundaries (source expressions):**

```text
130: v-if="returnOrder.status === 'pending'"
140: v-if="returnOrder.status === 'approved'"
150: v-if="returnOrder.status === 'received'"
160: v-if="returnOrder.status === 'pending'"
186: <div v-if="canEditLines" class="flex gap-2">
187: <template v-if="editingLines">
196: <TableViewport v-if="returnOrder.items && returnOrder.items.length > 0" class="w-full overflow-x-auto rounded-lg border border-border-subtle">
225: v-if="editingLines && lineEdits[item.id]"
240: v-if="editingLines && lineEdits[item.id]"
272: <div v-if="returnOrder.notes">
276: <div v-if="returnOrder.order">
279: <Link v-if="canVisit('orders.show')" :href="route('orders.show', returnOrder.order_id)" class="text-brand hover:underline">
317: <div v-if="returnOrder.completed_at" class="flex justify-between text-sm">
321: <div v-if="returnOrder.processor" class="flex justify-between text-sm">
336: <Card v-if="returnOrder.status !== 'completed' && returnOrder.status !== 'rejected'" :padded="false">
341: v-if="returnOrder.status === 'pending'"
350: v-if="returnOrder.status === 'approved'"
359: v-if="returnOrder.status === 'received'"
370: <template v-if="returnOrder.status === 'pending'">
384: <Card v-if="returnOrder.status === 'pending'" :padded="false">
400: <div v-if="showRejectModal" class="fixed inset-0 z-50 flex items-center justify-center" @click="showRejectModal = false">
```




<a id="e0222"></a>

> Audit provenance: `commerce.md` lines 3728–3751. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### RejectReturnOrderRequest.php

[app/Http/Requests/ReturnOrder/RejectReturnOrderRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/ReturnOrder/RejectReturnOrderRequest.php#L1)

```php
9: /**
10:  * Validates rejecting a return order (web surface). Rules unchanged from
11:  * Order\ReturnOrderController::reject.
12:  */
13: final class RejectReturnOrderRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, string>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'notes' => 'nullable|string|max:2000',
22:         ];
23:     }
24: }
```




<a id="e0223"></a>

> Audit provenance: `commerce.md` lines 3752–3784. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StoreReturnOrderRequest.php

[app/Http/Requests/ReturnOrder/StoreReturnOrderRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/ReturnOrder/StoreReturnOrderRequest.php#L1)

```php
9: /**
10:  * Validates a new return order (web surface). Rules unchanged from the previous
11:  * inline validation in Order\ReturnOrderController::store.
12:  */
13: final class StoreReturnOrderRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, string>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'order_id' => 'required|exists:orders,id',
22:             'type' => 'required|in:return,exchange',
23:             'reason' => 'required|string|max:1000',
24:             'notes' => 'nullable|string|max:2000',
25:             'items' => 'required|array|min:1',
26:             'items.*.order_item_id' => 'required|distinct|exists:order_items,id',
27:             'items.*.product_id' => 'required|exists:products,id',
28:             'items.*.quantity' => 'required|integer|min:1',
29:             'items.*.condition' => 'required|in:new,used,damaged',
30:             'items.*.restock' => 'required|boolean',
31:         ];
32:     }
33: }
```




<a id="e0224"></a>

> Audit provenance: `commerce.md` lines 3785–3812. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### UpdateReturnLinesRequest.php

[app/Http/Requests/ReturnOrder/UpdateReturnLinesRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/ReturnOrder/UpdateReturnLinesRequest.php#L1)

```php
9: /**
10:  * Validates changing the restock flag and/or condition of return lines
11:  * before the return is received (web and REST). Whether each line belongs
12:  * to the return is checked by ReturnOrderService::updateLines().
13:  */
14: final class UpdateReturnLinesRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, array<int, string>|string>
18:      */
19:     public function rules(): array
20:     {
21:         return [
22:             'items' => 'required|array|min:1|max:500',
23:             'items.*.id' => 'required|integer',
24:             'items.*.restock' => 'nullable|boolean',
25:             'items.*.condition' => 'nullable|in:new,used,damaged',
26:         ];
27:     }
28: }
```




<a id="e0245"></a>

> Audit provenance: `commerce.md` lines 4722–4751. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Order/ReturnOrder.php

[app/Models/Order/ReturnOrder.php:1](C:/Users/proj/Inventoros/app/Models/Order/ReturnOrder.php#L1)


```php
protected $fillable = [
        'organization_id',
        'order_id',
        'return_number',
        'type',
        'status',
        'reason',
        'notes',
        'refund_amount',
        'processed_by',
        'completed_at',
    ];
```


```php
53: 'refund_amount' => 'decimal:2',
65: return $this->belongsTo(Organization::class);
75: return $this->belongsTo(Order::class);
85: return $this->belongsTo(User::class, 'processed_by');
95: return $this->hasMany(ReturnOrderItem::class);
```




<a id="e0246"></a>

> Audit provenance: `commerce.md` lines 4752–4779. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Order/ReturnOrderItem.php

[app/Models/Order/ReturnOrderItem.php:1](C:/Users/proj/Inventoros/app/Models/Order/ReturnOrderItem.php#L1)


```php
protected $fillable = [
        'return_order_id',
        'order_item_id',
        'product_id',
        'product_variant_id',
        'quantity',
        'refund_amount',
        'condition',
        'restock',
    ];
```


```php
63: 'refund_amount' => 'decimal:2',
75: return $this->belongsTo(ReturnOrder::class);
85: return $this->belongsTo(OrderItem::class);
95: return $this->belongsTo(Product::class);
105: return $this->belongsTo(ProductVariant::class, 'product_variant_id');
```




<a id="e0491"></a>

> Audit provenance: `additional-contracts.md` lines 824–868. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/ReturnOrder/StoreReturnOrderRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/ReturnOrder/StoreReturnOrderRequest.php#L1). SHA-256: `baab014e5558047239d107a4506d3cd57479ca7f8ec62308fd1f46c7684af255`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\ReturnOrder;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: use Illuminate\Validation\Rule;
9: 
10: /**
11:  * Validates a new return order via the REST API.
12:  *
13:  * The order must belong to the caller's organization (a foreign id is a 422,
14:  * never a lookup). Each line names an order item; the product is derived from
15:  * that line by ReturnOrderService, so no product_id is accepted.
16:  */
17: final class StoreReturnOrderRequest extends FormRequest
18: {
19:     /**
20:      * @return array<string, mixed>
21:      */
22:     public function rules(): array
23:     {
24:         $organizationId = $this->user()->organization_id;
25: 
26:         return [
27:             'order_id' => ['required', 'integer', Rule::exists('orders', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
28:             'type' => ['required', 'in:return,exchange'],
29:             'reason' => ['required', 'string', 'max:1000'],
30:             'notes' => ['nullable', 'string', 'max:2000'],
31:             'items' => ['required', 'array', 'min:1', 'max:500'],
32:             'items.*.order_item_id' => ['required', 'integer', 'distinct', Rule::exists('order_items', 'id')->where('order_id', (int) $this->input('order_id'))],
33:             'items.*.quantity' => ['required', 'integer', 'min:1'],
34:             'items.*.condition' => ['required', 'in:new,used,damaged'],
35:             'items.*.restock' => ['required', 'boolean'],
36:         ];
37:     }
38: }
```

