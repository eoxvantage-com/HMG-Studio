# 25. Work Orders / Assembly — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Work Orders / Assembly as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Assembly/BOM relationship; create/list/detail/start; component availability and allocation; actual output; complete/cancel.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Inventory / Products](../modules/11_inventory.md), [Warehouses](../modules/20_warehouses.md), [Stock Adjustments](../modules/21_stock_adjustments.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/WorkOrders/Create.vue` | Pending | Pending |
| `resources/js/Pages/WorkOrders/Index.vue` | Pending | Pending |
| `resources/js/Pages/WorkOrders/Show.vue` | Pending | Pending |

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

- [ ] Starting does not invent a reservation absent in source.
- [ ] completion consumes components and produces output atomically.
- [ ] insufficient components roll back.
- [ ] source underproduction closure behavior is preserved and disclosed.

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

- [2026_04_04_030000_add_kitting_and_assembly_support.php](#e0136)
- [Assembly work orders](#e0171)
- [resources/js/Pages/WorkOrders/Create.vue](#e0197)
- [resources/js/Pages/WorkOrders/Index.vue](#e0198)
- [resources/js/Pages/WorkOrders/Show.vue](#e0199)
- [StoreWorkOrderRequest.php](#e0225)
- [app/Models/Inventory/WorkOrder.php](#e0238)
- [app/Models/Inventory/WorkOrderItem.php](#e0239)
- [app/Models/Inventory/WorkOrderAllocation.php](#e0240)
- [app/Models/Inventory/WorkOrderOutput.php](#e0241)
- [`app/Http/Requests/Api/WorkOrder/StoreWorkOrderRequest.php`](#e0501)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0136"></a>

> Audit provenance: `inventory.md` lines 5961–5972. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_04_04_030000_add_kitting_and_assembly_support.php
[database/migrations/2026_04_04_030000_add_kitting_and_assembly_support.php:1](C:/Users/proj/Inventoros/database/migrations/2026_04_04_030000_add_kitting_and_assembly_support.php#L1)

```php
15:         Schema::table('products', function (Blueprint $table) {
16:             $table->string('type', 20)->default('standard')->after('organization_id');
17:             $table->index(['organization_id', 'type']);
76:         Schema::table('products', function (Blueprint $table) {
77:             $table->dropIndex(['organization_id', 'type']);
78:             $table->dropColumn('type');
```



<a id="e0171"></a>

> Audit provenance: `commerce.md` lines 81–91. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Assembly work orders

- Source creates **assembly** output only, not virtual kit. Product selection optionally preselected; output variant null until chosen; quantity1; warehouse blank; notes blank. Quantity integer1..999999, notes max2000. Output variant required semantically for variant output. BOM component variants are per product via `component_variants[]` (product_id, product_variant_id), max500. Changing product clears output/component selections. Kits inside BOM explode into underlying components; do not manufacture stock into a virtual kit.
- Draft/pending → start → in_progress → complete → completed. Cancel allowed draft/pending/in_progress. Delete allowed draft/cancelled only. Start checks availability **but reserves/consumes nothing**. Completion rechecks under lock.
- Completion quantity_produced defaults planned and accepts1..planned (nullable API means default planned). Per-item required consumption is ceil(required * produced/planned) minus already consumed. **An under-plan completion still closes the work order**, not a reusable partial-progress state.
- Tracked component allocation: per work_order_item_id choose serial_ids (<=10000) or batches (<=500, each product_batch_id + integer quantity>=1). UI shows available serials/lot quantities; refresh retains only still-offered identities. Omitted explicit allocation can follow server selection rules; must preserve exact tracking ownership.
- Serial output: newline textarea → trimmed nonempty serial_numbers[], <=10000 each max255. Batch output: batch_number optional max255, expiry_date optional date. Service additionally accepts manufactured_date but source Show form does not expose it: API-only capability, not a missing copied UI field.
- Completion consumes component stock, records tracked allocations, receives product/variant/serial/batch output, movement records, updates quantity/status/time in **one transaction**. Global lock order work order → ascending products → ascending variants → tracking rows. Cancel normally has no stock to reverse; legacy consumed rows reverse exact recorded allocation. Completed WO cannot cancel.

Evidence: [WO request](C:/Users/proj/Inventoros/app/Http/Requests/WorkOrder/StoreWorkOrderRequest.php#L27), [shared create/complete rules](C:/Users/proj/Inventoros/app/Services/WorkOrderService.php#L68), [create](C:/Users/proj/Inventoros/app/Services/WorkOrderService.php#L114), [start](C:/Users/proj/Inventoros/app/Services/WorkOrderService.php#L184), [complete](C:/Users/proj/Inventoros/app/Services/WorkOrderService.php#L236), [cancel](C:/Users/proj/Inventoros/app/Services/WorkOrderService.php#L298).



<a id="e0197"></a>

> Audit provenance: `commerce.md` lines 2392–2490. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/WorkOrders/Create.vue

Source: [resources/js/Pages/WorkOrders/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L1).


**Named routes referenced:** `work-orders.index`, `work-orders.store`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Required Components (L222)
- th: Component (L233)
- th: SKU (L234)
- th: Variant (L235)
- th: Required (L236)
- th: Available (L237)
- th: Status (L238)


**UI state/filter defaults:**

```text
30: const componentVariants = reactive({});
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.product_id` | Assembly Product * | select | HTML required | : Select an assembly product...; product.id: product.name ( product.sku ) [repeat product in assemblyProducts] | [resources/js/Pages/WorkOrders/Create.vue:127](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L127) |

| `form.product_variant_id` | Variant to produce * | select | HTML required | null: Choose a variant...; variant.id: variant.title ( variant.sku ) [repeat variant in selectedProduct.variants] | [resources/js/Pages/WorkOrders/Create.vue:148](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L148) |

| `form.quantity` | Quantity to Produce * | input / number | HTML required; min=1 | — | [resources/js/Pages/WorkOrders/Create.vue:169](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L169) |

| `form.warehouse_id` | Warehouse | select | No extra control attribute; server rules below | : No specific warehouse; warehouse.id: warehouse.name [repeat warehouse in warehouses] | [resources/js/Pages/WorkOrders/Create.vue:187](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L187) |

| `form.notes` | Notes | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/WorkOrders/Create.vue:207](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L207) |

| `componentVariants[comp.product_id]` | Variant of {name} | select | HTML required; v-if=comp.needsVariant && isFirstLineOf(comp) | undefined: Choose a variant...; variant.id: variant.title ( variant.sku ) [repeat variant in comp.variants] | [resources/js/Pages/WorkOrders/Create.vue:258](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L258) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/WorkOrders/Create.vue:21](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L21)

```text
21: const form = useForm({
22:     product_id: props.preselectedProductId || '',
23:     product_variant_id: null,
24:     quantity: 1,
25:     warehouse_id: '',
26:     notes: '',
27: });
28: 
```



**Exact `componentVariants` defaults / hydration / hidden payload** — [resources/js/Pages/WorkOrders/Create.vue:30](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L30)

```text
30: const componentVariants = reactive({});
31: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('work-orders.index')` | [resources/js/Pages/WorkOrders/Create.vue:102](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L102) |

| Work Orders | `:href=route('work-orders.index')` | [resources/js/Pages/WorkOrders/Create.vue:104](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L104) |

| Back to Work Orders | `:href=route('work-orders.index')` | [resources/js/Pages/WorkOrders/Create.vue:112](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L112) |

| Cancel | `:href=route('work-orders.index')` | [resources/js/Pages/WorkOrders/Create.vue:315](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L315) |

| Create Work Order | `type=submit; :loading=form.processing; :disabled=form.processing` | [resources/js/Pages/WorkOrders/Create.vue:318](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Create.vue#L318) |


**Conditional sections / submit boundaries (source expressions):**

```text
119: <form @submit.prevent="submit" class="mt-6">
144: <div v-if="selectedProduct && selectedProduct.variants.length > 0">
156: {{ variant.title }}<template v-if="variant.sku"> ({{ variant.sku }})</template>
183: <div v-if="warehouses && warehouses.length > 0">
220: <div v-if="selectedProduct && requiredComponents.length > 0" class="overflow-hidden rounded-lg border border-border-subtle">
259: v-if="comp.needsVariant && isFirstLineOf(comp)"
267: {{ variant.title }}<template v-if="variant.sku"> ({{ variant.sku }})</template>
276: <td v-if="comp.awaitingVariant" class="px-4 py-3 text-center text-sm text-text-tertiary">-</td>
296: <div v-if="!allComponentsSufficient" class="border-t border-border-subtle bg-status-danger/10 px-4 py-3">
305: <div v-if="selectedProduct && requiredComponents.length === 0" class="rounded-lg border border-status-warning/40 bg-status-warning/10 p-4">
```




<a id="e0198"></a>

> Audit provenance: `commerce.md` lines 2491–2558. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/WorkOrders/Index.vue

Source: [resources/js/Pages/WorkOrders/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L1).


**Named routes referenced:** `work-orders.create`, `work-orders.index`, `work-orders.show`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- th: WO Number (L134)
- th: Assembly Product (L135)
- th: Quantity (L136)
- th: Produced (L137)
- th: Status (L138)
- th: Created By (L139)
- th: Date (L140)
- th: Actions (L141)


**UI state/filter defaults:**

```text
23: const search = ref(props.filters?.search || '');
24: const selectedStatus = ref(props.filters?.status || '');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `search` | Search | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/WorkOrders/Index.vue:100](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L100) |

| `selectedStatus` | Status | select | @change=applyFilters | : All Statuses; draft: Draft; pending: Pending; in_progress: In Progress; completed: Completed; cancelled: Cancelled | [resources/js/Pages/WorkOrders/Index.vue:109](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L109) |


| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Create Work Order | `:href=route('work-orders.create')` | [resources/js/Pages/WorkOrders/Index.vue:85](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L85) |

| Search | `type=submit` | [resources/js/Pages/WorkOrders/Index.vue:101](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L101) |

| Filter | `type=submit` | [resources/js/Pages/WorkOrders/Index.vue:120](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L120) |

| Clear | `type=button; @click=clearFilters` | [resources/js/Pages/WorkOrders/Index.vue:124](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L124) |

| Create Work Order | `:href=route('work-orders.create')` | [resources/js/Pages/WorkOrders/Index.vue:152](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L152) |

| wo.work_order_number | `:href=route('work-orders.show', wo.id)` | [resources/js/Pages/WorkOrders/Index.vue:161](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L161) |

| Icon action | `:href=route('work-orders.show', wo.id)` | [resources/js/Pages/WorkOrders/Index.vue:188](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Index.vue#L188) |


**Conditional sections / submit boundaries (source expressions):**

```text
98: <form class="table-quick-search" @submit.prevent="applyFilters">
104: <form @submit.prevent="applyFilters" class="space-y-4">
146: <tr v-if="!workOrders.data || workOrders.data.length === 0">
196: <div v-if="workOrders.links && workOrders.links.length > 3" class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row table-pagination">
203: v-if="link.url"
```




<a id="e0199"></a>

> Audit provenance: `commerce.md` lines 2559–2710. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/WorkOrders/Show.vue

Source: [resources/js/Pages/WorkOrders/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L1).


**Named routes referenced:** `products.show`, `work-orders.cancel`, `work-orders.complete`, `work-orders.destroy`, `work-orders.index`, `work-orders.start`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Production Progress (L274)
- h3: Work Order Details (L336)
- dt: Assembly Product (L340)
- dt: Status (L353)
- dt: Variant to produce (L359)
- dt: Output (L363)
- dt: Quantity to Produce (L367)
- dt: Quantity Produced (L371)
- dt: Warehouse (L377)
- dt: Notes (L381)
- h3: Required Components (L390)
- th: Component (L396)
- th: SKU (L397)
- th: Required Qty (L398)
- th: Consumed (L399)
- th: Available (L400)
- th: Status (L401)
- h3: Produced (L461)
- h3: Complete Production (L481)
- h3: Information (L587)
- dt: Created By (L591)
- dt: Created (L595)
- dt: Production Started (L599)
- dt: Completed (L603)
- dt: Last Updated (L607)
- h3: Danger Zone (L616)
- column `draft`: Draft (L30)
- column `pending`: Pending (L31)
- column `in_progress`: In Progress (L32)
- column `completed`: Completed (L33)


**UI state/filter defaults:**

```text
26: const processing = ref(false);
27: const quantityProduced = ref(props.workOrder.quantity);
112: const chosenSerials = reactive({});
114: const chosenBatches = reactive({});
140: const output = reactive({ serialNumbers: '', batchNumber: '', expiryDate: '' });
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `quantityProduced` | Quantity Produced | input / number | min=1; :max=workOrder.quantity | — | [resources/js/Pages/WorkOrders/Show.vue:487](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L487) |

| `chosenSerials[item.id]` | serial.serial_number | input / checkbox | No extra control attribute; server rules below | — | [resources/js/Pages/WorkOrders/Show.vue:510](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L510) |

| `chosenBatches[item.id][batch.id]` | Quantity to take from batch {batch} | input / number | min=0; :max=batch.quantity | — | [resources/js/Pages/WorkOrders/Show.vue:534](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L534) |

| `output.serialNumbers` | Serial numbers of the units produced | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/WorkOrders/Show.vue:551](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L551) |

| `output.batchNumber` | Batch number | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/WorkOrders/Show.vue:564](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L564) |

| `output.expiryDate` | Expiry date | input / date | No extra control attribute; server rules below | — | [resources/js/Pages/WorkOrders/Show.vue:569](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L569) |


**Exact `chosenSerials` defaults / hydration / hidden payload** — [resources/js/Pages/WorkOrders/Show.vue:112](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L112)

```text
112: const chosenSerials = reactive({});
113: // item id -> { batch id: quantity }
```



**Exact `chosenBatches` defaults / hydration / hidden payload** — [resources/js/Pages/WorkOrders/Show.vue:114](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L114)

```text
114: const chosenBatches = reactive({});
115: 
```



**Exact `output` defaults / hydration / hidden payload** — [resources/js/Pages/WorkOrders/Show.vue:140](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L140)

```text
140: const output = reactive({ serialNumbers: '', batchNumber: '', expiryDate: '' });
141: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('work-orders.index')` | [resources/js/Pages/WorkOrders/Show.vue:220](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L220) |

| Work Orders | `:href=route('work-orders.index')` | [resources/js/Pages/WorkOrders/Show.vue:222](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L222) |

| Start Production | `v-if=canStart; :disabled=processing; @click=startProduction` | [resources/js/Pages/WorkOrders/Show.vue:232](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L232) |

| Cancel Work Order | `v-if=canCancel; :disabled=processing; @click=cancelWorkOrder` | [resources/js/Pages/WorkOrders/Show.vue:242](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L242) |

| Delete | `v-if=canDelete; :disabled=processing; @click=deleteWorkOrder` | [resources/js/Pages/WorkOrders/Show.vue:252](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L252) |

| Back to Work Orders | `:href=route('work-orders.index')` | [resources/js/Pages/WorkOrders/Show.vue:262](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L262) |

| workOrder.product.name | `v-if=workOrder.product; :href=route('products.show', workOrder.product.id)` | [resources/js/Pages/WorkOrders/Show.vue:342](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L342) |

| item.product.name | `v-if=item.product; :href=route('products.show', item.product.id)` | [resources/js/Pages/WorkOrders/Show.vue:407](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L407) |

| Complete Production | `:disabled=processing; @click=completeProduction` | [resources/js/Pages/WorkOrders/Show.vue:573](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L573) |

| Cancel Work Order | `:disabled=processing; @click=cancelWorkOrder` | [resources/js/Pages/WorkOrders/Show.vue:618](C:/Users/proj/Inventoros/resources/js/Pages/WorkOrders/Show.vue#L618) |


**Conditional sections / submit boundaries (source expressions):**

```text
233: v-if="canStart"
243: v-if="canCancel"
253: v-if="canDelete"
273: <Card v-if="workOrder.status !== 'cancelled'" :padded="false" class="mt-6">
285: <Check v-if="isStepCompleted(step.key) && !isStepCurrent(step.key)" :size="16" />
296: v-if="index < statusSteps.length - 1"
306: <Card v-if="workOrder.status === 'cancelled'" class="mt-6 border-status-danger/20 bg-status-danger-soft">
343: v-if="workOrder.product"
358: <div v-if="workOrder.variant">
362: <div v-if="trackingLabel(outputTrackingType)">
376: <div v-if="workOrder.warehouse">
380: <div v-if="workOrder.notes">
408: v-if="item.product"
448: <tr v-if="items.length === 0">
460: <Card v-if="workOrder.outputs && workOrder.outputs.length" :padded="false">
466: <template v-if="row.serial">{{ row.serial.serial_number }}</template>
480: <Card v-if="!isReadOnly && canComplete" :padded="false">
501: <template v-if="item.tracking_type === 'serial'">
549: <div v-if="outputTrackingType === 'serial'" class="space-y-2 border-t border-border-subtle pt-4">
561: <div v-if="outputTrackingType === 'batch'" class="space-y-3 border-t border-border-subtle pt-4">
598: <div v-if="workOrder.started_at">
602: <div v-if="workOrder.completed_at">
615: <Card v-if="canCancel" :padded="false">
```




<a id="e0225"></a>

> Audit provenance: `commerce.md` lines 3813–3852. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StoreWorkOrderRequest.php

[app/Http/Requests/WorkOrder/StoreWorkOrderRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/WorkOrder/StoreWorkOrderRequest.php#L1)

```php
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates a new work order (web surface). Rules unchanged from the previous
13:  * inline validation in Inventory\WorkOrderController::store; the product and
14:  * warehouse existence checks are scoped to the authenticated user's org.
15:  */
16: final class StoreWorkOrderRequest extends FormRequest
17: {
18:     /**
19:      * @return array<string, mixed>
20:      */
21:     public function rules(): array
22:     {
23:         $organizationId = $this->user()->organization_id;
24: 
25:         return [
26:             'product_id' => [
27:                 'required',
28:                 'integer',
29:                 Rule::exists('products', 'id')->where('organization_id', $organizationId),
30:             ],
31:             'quantity' => 'required|integer|min:1|max:999999',
32:             'warehouse_id' => [
33:                 'nullable',
34:                 'integer',
35:                 Rule::exists('warehouses', 'id')->where('organization_id', $organizationId),
36:             ],
37:             'notes' => 'nullable|string|max:2000',
38:         ] + WorkOrderService::creationRules();
39:     }
40: }
```




<a id="e0238"></a>

> Audit provenance: `commerce.md` lines 4466–4500. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Inventory/WorkOrder.php

[app/Models/Inventory/WorkOrder.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/WorkOrder.php#L1)


```php
protected $fillable = [
        'organization_id',
        'product_id',
        'product_variant_id',
        'created_by',
        'warehouse_id',
        'work_order_number',
        'quantity',
        'quantity_produced',
        'status',
        'started_at',
        'completed_at',
        'notes',
    ];
```


```php
88: return $this->belongsTo(Organization::class);
98: return $this->belongsTo(Product::class);
108: return $this->belongsTo(ProductVariant::class, 'product_variant_id');
118: return $this->hasMany(WorkOrderOutput::class);
128: return $this->hasMany(WorkOrderAllocation::class);
138: return $this->belongsTo(User::class, 'created_by');
148: return $this->belongsTo(Warehouse::class);
158: return $this->hasMany(WorkOrderItem::class)->orderBy('work_order_items.id');
```




<a id="e0239"></a>

> Audit provenance: `commerce.md` lines 4501–4528. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Inventory/WorkOrderItem.php

[app/Models/Inventory/WorkOrderItem.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/WorkOrderItem.php#L1)


```php
protected $fillable = [
        'work_order_id',
        'product_id',
        'product_variant_id',
        'kit_product_id',
        'quantity_required',
        'quantity_consumed',
    ];
```


```php
55: 'quantity_required' => 'decimal:2',
56: 'quantity_consumed' => 'decimal:2',
67: return $this->belongsTo(WorkOrder::class);
77: return $this->belongsTo(Product::class);
87: return $this->belongsTo(ProductVariant::class, 'product_variant_id');
97: return $this->belongsTo(Product::class, 'kit_product_id');
107: return $this->hasMany(WorkOrderAllocation::class);
```




<a id="e0240"></a>

> Audit provenance: `commerce.md` lines 4529–4554. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Inventory/WorkOrderAllocation.php

[app/Models/Inventory/WorkOrderAllocation.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/WorkOrderAllocation.php#L1)


```php
protected $fillable = [
        'organization_id',
        'work_order_id',
        'work_order_item_id',
        'product_id',
        'product_serial_id',
        'product_batch_id',
        'quantity',
    ];
```


```php
57: return $this->belongsTo(WorkOrder::class);
65: return $this->belongsTo(WorkOrderItem::class, 'work_order_item_id');
73: return $this->belongsTo(ProductSerial::class, 'product_serial_id');
81: return $this->belongsTo(ProductBatch::class, 'product_batch_id');
```




<a id="e0241"></a>

> Audit provenance: `commerce.md` lines 4555–4580. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Inventory/WorkOrderOutput.php

[app/Models/Inventory/WorkOrderOutput.php:1](C:/Users/proj/Inventoros/app/Models/Inventory/WorkOrderOutput.php#L1)


```php
protected $fillable = [
        'organization_id',
        'work_order_id',
        'product_id',
        'product_variant_id',
        'product_serial_id',
        'product_batch_id',
        'quantity',
    ];
```


```php
57: return $this->belongsTo(WorkOrder::class);
65: return $this->belongsTo(ProductVariant::class, 'product_variant_id');
73: return $this->belongsTo(ProductSerial::class, 'product_serial_id');
81: return $this->belongsTo(ProductBatch::class, 'product_batch_id');
```




<a id="e0501"></a>

> Audit provenance: `additional-contracts.md` lines 1325–1370. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/WorkOrder/StoreWorkOrderRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/WorkOrder/StoreWorkOrderRequest.php#L1). SHA-256: `7707a23aa3df5e5d119ab8273eda23adb8646e9cc279b796ac3712f651de2a6e`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\WorkOrder;
6: 
7: use App\Services\WorkOrderService;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates a new work order via the REST API. Rules unchanged from
13:  * Api\WorkOrderController::store; product/warehouse existence is org-scoped.
14:  */
15: final class StoreWorkOrderRequest extends FormRequest
16: {
17:     /**
18:      * @return array<string, mixed>
19:      */
20:     public function rules(): array
21:     {
22:         $organizationId = $this->user()->organization_id;
23: 
24:         return [
25:             'product_id' => [
26:                 'required',
27:                 'integer',
28:                 Rule::exists('products', 'id')->where('organization_id', $organizationId),
29:             ],
30:             'quantity' => ['required', 'integer', 'min:1', 'max:999999'],
31:             'warehouse_id' => [
32:                 'nullable',
33:                 'integer',
34:                 Rule::exists('warehouses', 'id')->where('organization_id', $organizationId),
35:             ],
36:             'notes' => ['nullable', 'string', 'max:2000'],
37:         ] + WorkOrderService::creationRules();
38:     }
39: }
```

