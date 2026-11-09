# 15. Purchase Orders — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Purchase Orders as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Create/edit/list/detail; supplier lines and totals; approval/send lifecycle; partial receiving; warehouse/bin updates; quick reorder; price history.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Suppliers](../modules/16_suppliers.md), [Inventory / Products](../modules/11_inventory.md), [Approvals](../modules/17_approvals.md), [Warehouses](../modules/20_warehouses.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/PurchaseOrders/Create.vue` | Pending | Pending |
| `resources/js/Pages/PurchaseOrders/Edit.vue` | Pending | Pending |
| `resources/js/Pages/PurchaseOrders/Index.vue` | Pending | Pending |
| `resources/js/Pages/PurchaseOrders/Receive.vue` | Pending | Pending |
| `resources/js/Pages/PurchaseOrders/Show.vue` | Pending | Pending |

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

- [ ] Receive a PO partially then finally.
- [ ] reject over-receiving and foreign line IDs.
- [ ] stock/bin/movement/price history agree.
- [ ] retry cannot receive twice.
- [ ] quick reorder creates a draft rather than purchasing goods.

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

- [Purchasing and receiving](#e0169)
- [resources/js/Pages/PurchaseOrders/Create.vue](#e0188)
- [resources/js/Pages/PurchaseOrders/Edit.vue](#e0189)
- [resources/js/Pages/PurchaseOrders/Index.vue](#e0190)
- [resources/js/Pages/PurchaseOrders/Receive.vue](#e0191)
- [resources/js/Pages/PurchaseOrders/Show.vue](#e0192)
- [ProcessReceivingRequest.php](#e0218)
- [QuickReorderRequest.php](#e0219)
- [StorePurchaseOrderRequest.php](#e0220)
- [UpdatePurchaseOrderRequest.php](#e0221)
- [app/Models/Purchasing/PurchaseOrder.php](#e0247)
- [app/Models/Purchasing/PurchaseOrderItem.php](#e0248)
- [`app/Http/Requests/Api/PurchaseOrder/ReceivePurchaseOrderRequest.php`](#e0488)
- [`app/Http/Requests/Api/PurchaseOrder/StorePurchaseOrderRequest.php`](#e0489)
- [`app/Http/Requests/Api/PurchaseOrder/UpdatePurchaseOrderRequest.php`](#e0490)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0169"></a>

> Audit provenance: `commerce.md` lines 59–68. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Purchasing and receiving

Draft → (submit approval → approved, if required) → send → sent → partial → received; cancellation is distinct. PO is editable only while draft and not pending approval; cancellation only draft/sent (not partial/received); material approved-content edits invalidate approval. Send/resend allowed draft/sent/partial when not awaiting approval. Recipient email workflow as above; queued_at/sent_at separately exposed.

PO form: supplier required; order_date today required; expected_date blank and >=order_date when set; currency organization default then selected supplier currency; tax/shipping zero; notes blank; lines empty. Each line product required, variant required for variant products, quantity>=1 integer, unit_cost nonnegative max2 decimals, supplier_sku optional max255. Existing edit lines carry IDs. Supplier-linked cost/SKU defaults take precedence through purchaseOrderLine helper, otherwise product/variant purchase price. Re-adding product+variant increments quantity and updates cost. Scanner selects variant by barcode; product-only variant scan requires explicit variant choice.

Receive page preserves item id, product/variant identity, designated receiving location and ordered/received/remaining counts. Editable `quantity_to_receive` starts0, integer UI min0/maxremaining. “Receive all” per row or whole PO; Clear all resets0; scan increments matched row while below remaining. UI submits only when some positive quantity. Server locks PO and item rows, rechecks receivable state, scopes item to PO; item receive caps quantity at remaining. Stock, location balance, movement and supplier-price history update together in transaction. The web receive form does not include a freely editable destination-location or tracking lot/serial input; do not invent such parity fields.

Evidence: [PO receive](C:/Users/proj/Inventoros/app/Services/PurchaseOrderService.php#L158), [item receive side effects](C:/Users/proj/Inventoros/app/Models/Purchasing/PurchaseOrderItem.php#L195). Quick reorder is separate: 1..100 distinct product_ids in caller organization, grouped into draft POs by supplier; not automatic purchasing.



<a id="e0188"></a>

> Audit provenance: `commerce.md` lines 1532–1642. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/PurchaseOrders/Create.vue

Source: [resources/js/Pages/PurchaseOrders/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L1).


**Named routes referenced:** `purchase-orders.index`, `purchase-orders.store`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Order Details (L213)
- h3: Add Items (L257)
- h3: Order Items ({count}) (L316)


**UI state/filter defaults:**

```text
43: const showScanner = ref(false);
44: const selectedProductId = ref('');
45: const selectedVariantId = ref(null);
46: const variantError = ref('');
47: const quantity = ref(1);
48: const unitCost = ref(0);
49: const supplierSku = ref('');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.supplier_id` | Supplier * | select | HTML required | : Select a supplier; supplier.id: supplier.name [repeat supplier in suppliers] | [resources/js/Pages/PurchaseOrders/Create.vue:218](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L218) |

| `form.currency` | Currency | CurrencySelect | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Create.vue:229](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L229) |

| `form.order_date` | Order Date * | input / date | HTML required | — | [resources/js/Pages/PurchaseOrders/Create.vue:235](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L235) |

| `form.expected_date` | Expected Delivery Date | input / date | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Create.vue:241](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L241) |

| `form.notes` | Notes | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Create.vue:248](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L248) |

| `selectedProductId` | Product | select | @change=onProductSelected | : Select a product; product.id: product.name ( product.sku \\|\\| No SKU ) [repeat product in products] | [resources/js/Pages/PurchaseOrders/Create.vue:268](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L268) |

| `selectedVariantId` | Variant | select | @change=onVariantSelected | null: Choose a variant...; variant.id: variant.title ( variant.sku ) - Stock: {count} [repeat variant in chosenVariants] | [resources/js/Pages/PurchaseOrders/Create.vue:278](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L278) |

| `quantity` | Quantity | input / number | min=1 | — | [resources/js/Pages/PurchaseOrders/Create.vue:289](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L289) |

| `unitCost` | Unit Cost | input / number | min=0; step=0.01 | — | [resources/js/Pages/PurchaseOrders/Create.vue:294](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L294) |

| `supplierSku` | Supplier SKU | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Create.vue:299](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L299) |

| `item.quantity` | Quantity | input / number | min=1; @input=updateItemQuantity(index, parseInt($event.target.value)) | — | [resources/js/Pages/PurchaseOrders/Create.vue:331](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L331) |

| `item.unit_cost` | Unit Cost | input / number | min=0; step=0.01; @input=updateItemCost(index, $event.target.value) | — | [resources/js/Pages/PurchaseOrders/Create.vue:335](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L335) |

| `form.tax` | (dynamic/unlabelled; see source) | TaxInput | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Create.vue:352](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L352) |

| `form.shipping` | Shipping | input / number | min=0; step=0.01 | — | [resources/js/Pages/PurchaseOrders/Create.vue:355](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L355) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/PurchaseOrders/Create.vue:32](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L32)

```text
32: const form = useForm({
33:     supplier_id: '',
34:     order_date: todayIsoDate(),
35:     expected_date: '',
36:     currency: organizationCurrency.value,
37:     shipping: 0,
38:     tax: 0,
39:     notes: '',
40:     items: [],
41: });
42: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Create.vue:190](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L190) |

| Purchase Orders | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Create.vue:192](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L192) |

| Back to Purchase Orders | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Create.vue:200](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L200) |

| Scan Barcode | `type=button; @click=showScanner = true` | [resources/js/Pages/PurchaseOrders/Create.vue:258](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L258) |

| Add | `type=button; :disabled=!selectedProductId; @click=addItem` | [resources/js/Pages/PurchaseOrders/Create.vue:303](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L303) |

| t('common.delete') | `type=button; @click=removeItem(index)` | [resources/js/Pages/PurchaseOrders/Create.vue:341](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L341) |

| Cancel | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Create.vue:368](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L368) |

| Create Purchase Order | `type=submit; :loading=form.processing; :disabled=form.processing \|\| form.items.length === 0` | [resources/js/Pages/PurchaseOrders/Create.vue:369](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Create.vue#L369) |


**Conditional sections / submit boundaries (source expressions):**

```text
210: <form @submit.prevent="submit" class="mt-6 space-y-4">
276: <div v-if="chosenProduct?.has_variants" class="md:col-span-2">
281: {{ variant.title }}<template v-if="variant.sku"> ({{ variant.sku }})</template> - {{ t('orders.create.stockCount', { count: variant.stock }) }}
315: <Card v-if="form.items.length > 0" :padded="false">
```




<a id="e0189"></a>

> Audit provenance: `commerce.md` lines 1643–1766. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/PurchaseOrders/Edit.vue

Source: [resources/js/Pages/PurchaseOrders/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L1).


**Named routes referenced:** `purchase-orders.index`, `purchase-orders.show`, `purchase-orders.update`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Order Details - purchaseOrder.po_number (L211)
- h3: Add Items (L256)
- h3: Order Items ({count}) (L312)


**UI state/filter defaults:**

```text
50: const selectedProductId = ref('');
51: const selectedVariantId = ref(null);
52: const variantError = ref('');
53: const quantity = ref(1);
54: const unitCost = ref(0);
55: const supplierSku = ref('');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.supplier_id` | Supplier * | select | HTML required | : Select a supplier; supplier.id: supplier.name [repeat supplier in suppliers] | [resources/js/Pages/PurchaseOrders/Edit.vue:217](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L217) |

| `form.currency` | Currency | CurrencySelect | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Edit.vue:228](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L228) |

| `form.order_date` | Order Date * | input / date | HTML required | — | [resources/js/Pages/PurchaseOrders/Edit.vue:234](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L234) |

| `form.expected_date` | Expected Delivery Date | input / date | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Edit.vue:240](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L240) |

| `form.notes` | Notes | textarea | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Edit.vue:247](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L247) |

| `selectedProductId` | Product | select | @change=onProductSelected | : Select a product; product.id: product.name ( product.sku \\|\\| No SKU ) [repeat product in products] | [resources/js/Pages/PurchaseOrders/Edit.vue:263](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L263) |

| `selectedVariantId` | Variant | select | @change=onVariantSelected | null: Choose a variant...; variant.id: variant.title ( variant.sku ) - Stock: {count} [repeat variant in chosenVariants] | [resources/js/Pages/PurchaseOrders/Edit.vue:273](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L273) |

| `quantity` | Quantity | input / number | min=1 | — | [resources/js/Pages/PurchaseOrders/Edit.vue:284](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L284) |

| `unitCost` | Unit Cost | input / number | min=0; step=0.01 | — | [resources/js/Pages/PurchaseOrders/Edit.vue:289](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L289) |

| `supplierSku` | Supplier SKU | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Edit.vue:294](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L294) |

| `item.product_variant_id` | Variant | select | HTML required; @change=onLineVariantChange(index) | null: Choose a variant...; variant.id: variant.title ( variant.sku ) [repeat variant in lineVariants(item)] | [resources/js/Pages/PurchaseOrders/Edit.vue:328](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L328) |

| `item.quantity` | Quantity | input / number | min=1; @input=updateItemQuantity(index, parseInt($event.target.value)) | — | [resources/js/Pages/PurchaseOrders/Edit.vue:340](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L340) |

| `item.unit_cost` | Unit Cost | input / number | min=0; step=0.01; @input=updateItemCost(index, $event.target.value) | — | [resources/js/Pages/PurchaseOrders/Edit.vue:352](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L352) |

| `form.tax` | (dynamic/unlabelled; see source) | TaxInput | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Edit.vue:392](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L392) |

| `form.shipping` | Shipping | input / number | min=0; step=0.01 | — | [resources/js/Pages/PurchaseOrders/Edit.vue:395](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L395) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/PurchaseOrders/Edit.vue:29](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L29)

```text
29: const form = useForm({
30:     supplier_id: props.purchaseOrder.supplier_id,
31:     order_date: toIsoDate(props.purchaseOrder.order_date),
32:     expected_date: toIsoDate(props.purchaseOrder.expected_date),
33:     currency: props.purchaseOrder.currency || organizationCurrency.value,
34:     shipping: props.purchaseOrder.shipping || 0,
35:     tax: props.purchaseOrder.tax || 0,
36:     notes: props.purchaseOrder.notes || '',
37:     items: props.purchaseOrder.items?.map(item => ({
38:         id: item.id,
39:         product_id: item.product_id,
40:         product_variant_id: item.product_variant_id ?? null,
41:         product_name: item.product_name,
42:         sku: item.sku,
43:         receiving_location: item.receiving_location,
44:         quantity: item.quantity_ordered,
45:         unit_cost: item.unit_cost,
46:         supplier_sku: item.supplier_sku || '',
47:     })) || [],
48: });
49: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Edit.vue:183](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L183) |

| Purchase Orders | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Edit.vue:185](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L185) |

| View Details | `:href=route('purchase-orders.show', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Edit.vue:195](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L195) |

| Back to Purchase Orders | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Edit.vue:198](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L198) |

| Add | `type=button; :disabled=!selectedProductId; @click=addItem` | [resources/js/Pages/PurchaseOrders/Edit.vue:298](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L298) |

| t('common.delete') | `type=button; @click=removeItem(index)` | [resources/js/Pages/PurchaseOrders/Edit.vue:373](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L373) |

| Cancel | `:href=route('purchase-orders.show', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Edit.vue:408](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L408) |

| Update Purchase Order | `type=submit; :loading=form.processing; :disabled=form.processing \|\| form.items.length === 0` | [resources/js/Pages/PurchaseOrders/Edit.vue:411](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Edit.vue#L411) |


**Conditional sections / submit boundaries (source expressions):**

```text
207: <form @submit.prevent="submit" class="mt-6 space-y-4">
271: <div v-if="chosenProduct?.has_variants" class="md:col-span-2">
276: {{ variant.title }}<template v-if="variant.sku"> ({{ variant.sku }})</template> - {{ t('orders.create.stockCount', { count: variant.stock }) }}
310: <Card v-if="form.items.length > 0" :padded="false">
326: <template v-if="productFor(item.product_id)?.has_variants">
331: {{ variant.title }}<template v-if="variant.sku"> ({{ variant.sku }})</template>
```




<a id="e0190"></a>

> Audit provenance: `commerce.md` lines 1767–1847. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/PurchaseOrders/Index.vue

Source: [resources/js/Pages/PurchaseOrders/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L1).


**Named routes referenced:** `purchase-orders.create`, `purchase-orders.destroy`, `purchase-orders.edit`, `purchase-orders.index`, `purchase-orders.receive`, `purchase-orders.show`.


**Permission/route-capability checks:** `delete_purchase_orders`, `purchase-orders.create`, `purchase-orders.edit`, `purchase-orders.receive`.


**Sections / displayed fields / table columns:**

- column `po_number`: PO Number (L77)
- column `supplier`: Supplier (L78)
- column `order_date`: Order Date (L79)
- column `expected_date`: Expected (L80)
- column `quantity`: items (L81)
- column `total`: Total (L82)
- column `status`: Status (L83)
- column `actions`: Actions (L84)


**UI state/filter defaults:**

```text
29: const search = ref(props.filters?.search || '');
30: const selectedStatus = ref(props.filters?.status || '');
31: const selectedSupplierId = ref(props.filters?.supplier_id || '');
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `search` | Search | input / text | No extra control attribute; server rules below | — | [resources/js/Pages/PurchaseOrders/Index.vue:119](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L119) |

| `selectedStatus` | Status | select | No extra control attribute; server rules below | : All Statuses; status: statusLabels[status] \\|\\| status [repeat status in statuses] | [resources/js/Pages/PurchaseOrders/Index.vue:128](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L128) |

| `selectedSupplierId` | Supplier | select | No extra control attribute; server rules below | : All Suppliers; supplier.id: supplier.name [repeat supplier in suppliers] | [resources/js/Pages/PurchaseOrders/Index.vue:137](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L137) |


| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Create Purchase Order | `v-if=canVisit('purchase-orders.create'); :href=route('purchase-orders.create')` | [resources/js/Pages/PurchaseOrders/Index.vue:107](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L107) |

| Search | `type=submit` | [resources/js/Pages/PurchaseOrders/Index.vue:120](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L120) |

| Search | `type=submit` | [resources/js/Pages/PurchaseOrders/Index.vue:145](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L145) |

| Clear | `type=button; @click=clearFilters` | [resources/js/Pages/PurchaseOrders/Index.vue:149](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L149) |

| row.po_number | `:href=route('purchase-orders.show', row.id)` | [resources/js/Pages/PurchaseOrders/Index.vue:161](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L161) |

| t('common.view') | `:href=route('purchase-orders.show', row.id)` | [resources/js/Pages/PurchaseOrders/Index.vue:183](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L183) |

| t('common.edit') | `v-if=(row.status === 'draft') && canVisit('purchase-orders.edit'); :href=route('purchase-orders.edit', row.id)` | [resources/js/Pages/PurchaseOrders/Index.vue:184](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L184) |

| Icon action | `v-if=(row.status === 'sent' \|\| row.status === 'partial') && canVisit('purchase-orders.receive'); :href=route('purchase-orders.receive', row.id)` | [resources/js/Pages/PurchaseOrders/Index.vue:185](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L185) |

| t('common.delete') | `v-if=row.status === 'draft' && hasPermission('delete_purchase_orders'); type=button; @click=deletePO(row)` | [resources/js/Pages/PurchaseOrders/Index.vue:186](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L186) |

| Create Purchase Order | `v-if=canVisit('purchase-orders.create'); :href=route('purchase-orders.create')` | [resources/js/Pages/PurchaseOrders/Index.vue:194](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Index.vue#L194) |


**Conditional sections / submit boundaries (source expressions):**

```text
107: <Button v-if="canVisit('purchase-orders.create')" variant="default" size="sm" as="Link" :href="route('purchase-orders.create')">
117: <form class="table-quick-search" @submit.prevent="searchPOs">
123: <form @submit.prevent="searchPOs" class="space-y-4">
184: <Link v-if="(row.status === 'draft') && canVisit('purchase-orders.edit')" :href="route('purchase-orders.edit', row.id)" class="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-status-success" :aria-label="t('common.edit')" :title="t('common.edit')"><Pencil :size="16" /></Link>
185: <Link v-if="(row.status === 'sent' || row.status === 'partial') && canVisit('purchase-orders.receive')" :href="route('purchase-orders.receive', row.id)" class="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-status-success" :title="t('purchaseOrders.receive.receive')"><PackageCheck :size="16" /></Link>
186: <button v-if="row.status === 'draft' && hasPermission('delete_purchase_orders')" type="button" @click="deletePO(row)" class="rounded-md p-1.5 text-text-tertiary transition-colors hover:bg-surface-overlay hover:text-status-danger" :aria-label="t('common.delete')" :title="t('common.delete')"><Trash2 :size="16" /></button>
194: <Button v-if="canVisit('purchase-orders.create')" variant="default" size="sm" as="Link" :href="route('purchase-orders.create')">
202: <div v-if="purchaseOrders.data.length > 0" class="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row table-pagination">
211: v-if="link.url"
```




<a id="e0191"></a>

> Audit provenance: `commerce.md` lines 1848–1940. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/PurchaseOrders/Receive.vue

Source: [resources/js/Pages/PurchaseOrders/Receive.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L1).


**Named routes referenced:** `purchase-orders.index`, `purchase-orders.process-receiving`, `purchase-orders.show`.


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: purchaseOrder.supplier?.name (L154)
- h3: Items to Receive (L171)
- th: Product (L186)
- th: SKU (L187)
- th: Ordered (L188)
- th: Already Received (L189)
- th: Remaining (L190)
- th: Receive Now (L191)
- th: Actions (L192)


**UI state/filter defaults:**

```text
24: const showScanner = ref(false);
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `item.quantity_to_receive` | Receive Now | input / number | min=0; :max=item.remaining; v-if=item.remaining > 0 | — | [resources/js/Pages/PurchaseOrders/Receive.vue:234](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L234) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/PurchaseOrders/Receive.vue:26](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L26)

```text
26: const form = useForm({
27:     items: props.purchaseOrder.items?.map(item => ({
28:         id: item.id,
29:         product_id: item.product_id,
30:         product_variant_id: item.product_variant_id ?? null,
31:         variant_title: item.variant?.title ?? null,
32:         product_name: item.product_name,
33:         sku: item.sku,
34:         receiving_location: item.receiving_location,
35:         quantity_ordered: item.quantity_ordered,
36:         quantity_received: item.quantity_received,
37:         remaining: item.quantity_ordered - item.quantity_received,
38:         quantity_to_receive: 0,
39:     })) || [],
40: });
41: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Receive.vue:121](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L121) |

| Purchase Orders | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Receive.vue:123](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L123) |

| purchaseOrder.po_number | `:href=route('purchase-orders.show', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Receive.vue:125](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L125) |

| Scan Barcode | `@click=showScanner = true` | [resources/js/Pages/PurchaseOrders/Receive.vue:136](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L136) |

| Back | `:href=route('purchase-orders.show', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Receive.vue:140](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L140) |

| Receive All | `type=button; @click=receiveAllItems` | [resources/js/Pages/PurchaseOrders/Receive.vue:173](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L173) |

| Clear | `type=button; @click=clearAll` | [resources/js/Pages/PurchaseOrders/Receive.vue:176](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L176) |

| Receive All | `v-if=item.remaining > 0; type=button; @click=receiveAll(index)` | [resources/js/Pages/PurchaseOrders/Receive.vue:247](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L247) |

| Cancel | `:href=route('purchase-orders.show', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Receive.vue:275](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L275) |

| Receive | `type=submit; :loading=form.processing; :disabled=form.processing \|\| !hasItemsToReceive` | [resources/js/Pages/PurchaseOrders/Receive.vue:278](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Receive.vue#L278) |


**Conditional sections / submit boundaries (source expressions):**

```text
168: <form @submit.prevent="submit" class="mt-4">
235: v-if="item.remaining > 0"
248: v-if="item.remaining > 0"
```




<a id="e0192"></a>

> Audit provenance: `commerce.md` lines 1941–2053. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/PurchaseOrders/Show.vue

Source: [resources/js/Pages/PurchaseOrders/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L1).


**Named routes referenced:** `products.show`, `purchase-orders.cancel`, `purchase-orders.destroy`, `purchase-orders.edit`, `purchase-orders.index`, `purchase-orders.invoice.download`, `purchase-orders.invoice.preview`, `purchase-orders.receive`, `purchase-orders.send`, `purchase-orders.submit-approval`, `suppliers.show`.


**Permission/route-capability checks:** `products.show`, `purchase-orders.edit`, `purchase-orders.receive`, `suppliers.show`.


**Sections / displayed fields / table columns:**

- h3: Order Details (L198)
- dt: Supplier (L202)
- dt: Created By (L212)
- dt: Order Date (L216)
- dt: Expected Delivery (L220)
- dt: Received Date (L224)
- dt: Currency (L228)
- dt: Notes (L233)
- h3: Items ({count}) (L241)
- dt: Ordered (L261)
- dt: Received (L265)
- dt: Unit Cost (L272)
- dt: Total (L276)
- dt: Subtotal (L284)
- dt: Tax (L288)
- dt: Shipping (L292)
- dt: Total (L296)
- th: Product (L305)
- th: SKU (L306)
- th: Ordered (L307)
- th: Received (L308)
- th: Unit Cost (L309)
- th: Total (L310)
- h3: Status (L383)
- h3: Order Summary (L394)
- dt: Subtotal (L398)
- dt: Tax (L402)
- dt: Shipping (L406)
- dt: Total (L411)
- h3: Actions (L424)
- h3: Danger Zone (L472)


**UI state/filter defaults:**

```text
69: const showSendModal = ref(false);
```


No editable model-bound controls in this file; navigation and action-only controls listed below.



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Workspace | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Show.vue:112](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L112) |

| Purchase Orders | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Show.vue:114](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L114) |

| Download PDF | `:href=route('purchase-orders.invoice.download', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Show.vue:129](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L129) |

| Preview PDF | `:href=route('purchase-orders.invoice.preview', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Show.vue:138](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L138) |

| Edit | `v-if=(purchaseOrder.status === 'draft' && !lockedForApproval) && canVisit('purchase-orders.edit'); :href=route('purchase-orders.edit', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Show.vue:148](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L148) |

| Receive Items | `v-if=(purchaseOrder.status === 'sent' \|\| purchaseOrder.status === 'partial') && canVisit('purchase-orders.receive'); :href=route('purchase-orders.receive', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Show.vue:158](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L158) |

| Back | `:href=route('purchase-orders.index')` | [resources/js/Pages/PurchaseOrders/Show.vue:168](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L168) |

| purchaseOrder.supplier.name | `:href=route('suppliers.show', purchaseOrder.supplier.id)` | [resources/js/Pages/PurchaseOrders/Show.vue:205](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L205) |

| item.product_name | `:href=route('products.show', item.product.id)` | [resources/js/Pages/PurchaseOrders/Show.vue:252](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L252) |

| item.product_name | `:href=route('products.show', item.product.id)` | [resources/js/Pages/PurchaseOrders/Show.vue:317](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L317) |

| isResend ? Resend to Supplier : Send to Supplier | `v-if=canSend; @click=showSendModal = true` | [resources/js/Pages/PurchaseOrders/Show.vue:426](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L426) |

| Receive Items | `v-if=(purchaseOrder.status === 'sent' \|\| purchaseOrder.status === 'partial') && canVisit('purchase-orders.receive'); :href=route('purchase-orders.receive', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Show.vue:438](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L438) |

| Edit Purchase Order | `v-if=(purchaseOrder.status === 'draft' && !lockedForApproval) && canVisit('purchase-orders.edit'); :href=route('purchase-orders.edit', purchaseOrder.id)` | [resources/js/Pages/PurchaseOrders/Show.vue:448](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L448) |

| Cancel Order | `v-if=purchaseOrder.status === 'draft' \|\| purchaseOrder.status === 'sent'; @click=cancelPO` | [resources/js/Pages/PurchaseOrders/Show.vue:458](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L458) |

| Delete Order | `@click=deletePO` | [resources/js/Pages/PurchaseOrders/Show.vue:474](C:/Users/proj/Inventoros/resources/js/Pages/PurchaseOrders/Show.vue#L474) |


**Conditional sections / submit boundaries (source expressions):**

```text
149: v-if="(purchaseOrder.status === 'draft' && !lockedForApproval) && canVisit('purchase-orders.edit')"
159: v-if="(purchaseOrder.status === 'sent' || purchaseOrder.status === 'partial') && canVisit('purchase-orders.receive')"
223: <div v-if="purchaseOrder.received_date">
232: <div v-if="purchaseOrder.notes" class="mt-6">
287: <div v-if="purchaseOrder.tax > 0" class="flex justify-between">
291: <div v-if="purchaseOrder.shipping > 0" class="flex justify-between">
357: <tr v-if="purchaseOrder.tax > 0">
361: <tr v-if="purchaseOrder.shipping > 0">
401: <div v-if="purchaseOrder.tax > 0" class="flex justify-between text-sm">
405: <div v-if="purchaseOrder.shipping > 0" class="flex justify-between text-sm">
421: v-if="purchaseOrder.status === 'draft' || purchaseOrder.status === 'sent' || purchaseOrder.status === 'partial'"
427: v-if="canSend"
439: v-if="(purchaseOrder.status === 'sent' || purchaseOrder.status === 'partial') && canVisit('purchase-orders.receive')"
449: v-if="(purchaseOrder.status === 'draft' && !lockedForApproval) && canVisit('purchase-orders.edit')"
459: v-if="purchaseOrder.status === 'draft' || purchaseOrder.status === 'sent'"
471: <Card v-if="purchaseOrder.status === 'draft'" :padded="false">
```




<a id="e0218"></a>

> Audit provenance: `commerce.md` lines 3569–3594. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### ProcessReceivingRequest.php

[app/Http/Requests/PurchaseOrder/ProcessReceivingRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/PurchaseOrder/ProcessReceivingRequest.php#L1)

```php
9: /**
10:  * Validates the receiving form for a purchase order (web surface). Rules
11:  * unchanged from Purchasing\PurchaseOrderController::processReceiving.
12:  */
13: final class ProcessReceivingRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, string>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'items' => 'required|array',
22:             'items.*.id' => 'required|exists:purchase_order_items,id',
23:             'items.*.quantity_to_receive' => 'required|integer|min:0',
24:         ];
25:     }
26: }
```




<a id="e0219"></a>

> Audit provenance: `commerce.md` lines 3595–3640. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### QuickReorderRequest.php

[app/Http/Requests/PurchaseOrder/QuickReorderRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/PurchaseOrder/QuickReorderRequest.php#L1)

```php
9: 
10: /**
11:  * Products selected for a quick draft purchase order. Every id must be a live
12:  * product of the caller's organization.
13:  */
14: final class QuickReorderRequest extends FormRequest
15: {
16:     /**
17:      * @return array<string, mixed>
18:      */
19:     public function rules(): array
20:     {
21:         $organizationId = $this->user()->organization_id;
22: 
23:         return [
24:             'product_ids' => ['required', 'array', 'min:1', 'max:100'],
25:             'product_ids.*' => [
26:                 'required',
27:                 'integer',
28:                 'distinct',
29:                 Rule::exists('products', 'id')
30:                     ->where('organization_id', $organizationId)
31:                     ->whereNull('deleted_at'),
32:             ],
33:         ];
34:     }
35: 
36:     /**
37:      * @return array<string, string>
38:      */
39:     public function messages(): array
40:     {
41:         return [
42:             'product_ids.required' => 'Select at least one product to reorder.',
43:             'product_ids.*.exists' => 'One of the selected products could not be found.',
44:         ];
45:     }
46: }
```




<a id="e0220"></a>

> Audit provenance: `commerce.md` lines 3641–3682. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### StorePurchaseOrderRequest.php

[app/Http/Requests/PurchaseOrder/StorePurchaseOrderRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/PurchaseOrder/StorePurchaseOrderRequest.php#L1)

```php
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates a new purchase order (web surface). supplier_id and product_id are
13:  * org-scoped so a PO can't reference another tenant's supplier/product.
14:  */
15: final class StorePurchaseOrderRequest extends FormRequest
16: {
17:     use ValidatesVariantLines;
18: 
19:     /**
20:      * @return array<string, mixed>
21:      */
22:     public function rules(): array
23:     {
24:         $organizationId = $this->user()->organization_id;
25: 
26:         return [
27:             'supplier_id' => ['required', Rule::exists('suppliers', 'id')->where('organization_id', $organizationId)],
28:             'order_date' => 'required|date',
29:             'expected_date' => 'nullable|date|after_or_equal:order_date',
30:             'currency' => 'required|string|max:3',
31:             'shipping' => 'nullable|numeric|decimal:0,2|min:0',
32:             'tax' => 'nullable|numeric|decimal:0,2|min:0',
33:             'notes' => 'nullable|string',
34:             'items' => 'required|array|min:1',
35:             'items.*.product_id' => ['required', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
36:             'items.*.product_variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
37:             'items.*.quantity' => 'required|integer|min:1',
38:             'items.*.unit_cost' => 'required|numeric|decimal:0,2|min:0',
39:             'items.*.supplier_sku' => 'nullable|string|max:255',
40:         ];
41:     }
42: }
```




<a id="e0221"></a>

> Audit provenance: `commerce.md` lines 3683–3727. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### UpdatePurchaseOrderRequest.php

[app/Http/Requests/PurchaseOrder/UpdatePurchaseOrderRequest.php:1](C:/Users/proj/Inventoros/app/Http/Requests/PurchaseOrder/UpdatePurchaseOrderRequest.php#L1)

```php
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates a purchase order edit (web surface). supplier_id and product_id are
13:  * org-scoped so an edit can't point a PO at another tenant's supplier/product
14:  * (the web store path re-fetched via forOrganization, but update wrote the id
15:  * directly — a cross-tenant supplier could then be read via a PO report).
16:  */
17: final class UpdatePurchaseOrderRequest extends FormRequest
18: {
19:     use ValidatesVariantLines;
20: 
21:     /**
22:      * @return array<string, mixed>
23:      */
24:     public function rules(): array
25:     {
26:         $organizationId = $this->user()->organization_id;
27: 
28:         return [
29:             'supplier_id' => ['required', Rule::exists('suppliers', 'id')->where('organization_id', $organizationId)],
30:             'order_date' => 'required|date',
31:             'expected_date' => 'nullable|date|after_or_equal:order_date',
32:             'currency' => 'required|string|max:3',
33:             'shipping' => 'nullable|numeric|decimal:0,2|min:0',
34:             'tax' => 'nullable|numeric|decimal:0,2|min:0',
35:             'notes' => 'nullable|string',
36:             'items' => 'required|array|min:1',
37:             'items.*.id' => 'nullable|exists:purchase_order_items,id',
38:             'items.*.product_id' => ['required', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
39:             'items.*.product_variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
40:             'items.*.quantity' => 'required|integer|min:1',
41:             'items.*.unit_cost' => 'required|numeric|decimal:0,2|min:0',
42:             'items.*.supplier_sku' => 'nullable|string|max:255',
43:         ];
44:     }
45: }
```




<a id="e0247"></a>

> Audit provenance: `commerce.md` lines 4780–4851. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Purchasing/PurchaseOrder.php

[app/Models/Purchasing/PurchaseOrder.php:1](C:/Users/proj/Inventoros/app/Models/Purchasing/PurchaseOrder.php#L1)


```php
protected $fillable = [
        'organization_id',
        'supplier_id',
        'created_by',
        'po_number',
        'status',
        'order_date',
        'expected_date',
        'received_date',
        'sent_at',
        'sent_to',
        'queued_at',
        'approval_status',
        'approval_requested_by',
        'approval_requested_at',
        'approved_by',
        'approved_at',
        'approval_notes',
        'subtotal',
        'tax',
        'shipping',
        'total',
        'currency',
        'notes',
        'metadata',
    ];
```


```php
protected $casts = [
        'order_date' => 'date',
        'expected_date' => 'date',
        'received_date' => 'date',
        'sent_at' => 'datetime',
        'queued_at' => 'datetime',
        'approval_requested_at' => 'datetime',
        'approved_at' => 'datetime',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'shipping' => 'decimal:2',
        'total' => 'decimal:2',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
```


```php
23: use Illuminate\Database\Eloquent\SoftDeletes;
70: use BelongsToOrganization, LogsActivity, SoftDeletes;
107: 'subtotal' => 'decimal:2',
108: 'tax' => 'decimal:2',
109: 'shipping' => 'decimal:2',
110: 'total' => 'decimal:2',
178: return $this->belongsTo(Organization::class);
188: return $this->belongsTo(Supplier::class);
198: return $this->belongsTo(User::class, 'created_by');
208: return $this->belongsTo(User::class, 'approved_by');
218: return $this->belongsTo(User::class, 'approval_requested_by');
228: return $this->hasMany(PurchaseOrderItem::class);
```




<a id="e0248"></a>

> Audit provenance: `commerce.md` lines 4852–4905. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### app/Models/Purchasing/PurchaseOrderItem.php

[app/Models/Purchasing/PurchaseOrderItem.php:1](C:/Users/proj/Inventoros/app/Models/Purchasing/PurchaseOrderItem.php#L1)


```php
protected $fillable = [
        'purchase_order_id',
        'product_id',
        'product_variant_id',
        'product_name',
        'sku',
        'supplier_sku',
        'quantity_ordered',
        'quantity_received',
        'unit_cost',
        'subtotal',
        'tax',
        'total',
        'notes',
        'metadata',
        'replenishment_policy_id',
        'receiving_location_id',
    ];
```


```php
protected $casts = [
        'quantity_ordered' => 'integer',
        'quantity_received' => 'integer',
        'unit_cost' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];
```


```php
87: 'unit_cost' => 'decimal:2',
88: 'subtotal' => 'decimal:2',
89: 'tax' => 'decimal:2',
90: 'total' => 'decimal:2',
103: return $this->belongsTo(PurchaseOrder::class);
113: return $this->belongsTo(Product::class);
123: return $this->belongsTo(ProductVariant::class, 'product_variant_id');
128: return $this->belongsTo(ProductLocation::class, 'receiving_location_id')->withTrashed();
```




<a id="e0488"></a>

> Audit provenance: `additional-contracts.md` lines 673–705. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/PurchaseOrder/ReceivePurchaseOrderRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/PurchaseOrder/ReceivePurchaseOrderRequest.php#L1). SHA-256: `c3bd0dd28dc4ae24d1ca970a0b8d80a6b2ebf37828823b8ce6957cfe315f297b`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\PurchaseOrder;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates the receiving payload for a purchase order via the REST API. Rules
11:  * unchanged from Api\PurchaseOrderController::receive.
12:  */
13: final class ReceivePurchaseOrderRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, array<int, string>>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'items' => ['required', 'array'],
22:             'items.*.id' => ['required', 'exists:purchase_order_items,id'],
23:             'items.*.quantity_to_receive' => ['required', 'integer', 'min:0'],
24:         ];
25:     }
26: }
```



<a id="e0489"></a>

> Audit provenance: `additional-contracts.md` lines 706–763. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/PurchaseOrder/StorePurchaseOrderRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/PurchaseOrder/StorePurchaseOrderRequest.php#L1). SHA-256: `abcd08ccbc482e550cd56dad219effc674df03da6b649ff6f23c0b31c6b21448`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\PurchaseOrder;
6: 
7: use App\Http\Requests\Concerns\ValidatesVariantLines;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates a new purchase order via the REST API. Rules unchanged from
13:  * Api\PurchaseOrderController::store.
14:  */
15: final class StorePurchaseOrderRequest extends FormRequest
16: {
17:     use ValidatesVariantLines;
18: 
19:     /**
20:      * @return array<string, mixed>
21:      */
22:     public function rules(): array
23:     {
24:         $organizationId = $this->user()->organization_id;
25: 
26:         return [
27:             'supplier_id' => ['required', Rule::exists('suppliers', 'id')->where('organization_id', $organizationId)],
28:             'order_date' => ['required', 'date'],
29:             'expected_date' => ['nullable', 'date', 'after_or_equal:order_date'],
30:             'currency' => ['required', 'string', 'max:3'],
31:             'shipping' => ['nullable', 'numeric', 'decimal:0,2', 'min:0'],
32:             'tax' => ['nullable', 'numeric', 'decimal:0,2', 'min:0'],
33:             'notes' => ['nullable', 'string'],
34:             'items' => ['required', 'array', 'min:1'],
35:             'items.*.product_id' => ['required', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
36:             'items.*.product_variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
37:             'items.*.quantity' => ['required', 'integer', 'min:1'],
38:             'items.*.unit_cost' => ['required', 'numeric', 'decimal:0,2', 'min:0'],
39:             'items.*.supplier_sku' => ['nullable', 'string', 'max:255'],
40:         ];
41:     }
42: 
43:     /**
44:      * The variant stays optional on the REST API so existing clients that
45:      * send product-only lines keep working; when sent it must still match.
46:      */
47:     protected function requiresVariantForVariantProducts(): bool
48:     {
49:         return false;
50:     }
51: }
```



<a id="e0490"></a>

> Audit provenance: `additional-contracts.md` lines 764–823. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/PurchaseOrder/UpdatePurchaseOrderRequest.php`

[Source evidence](C:/Users/proj/Inventoros/app/Http/Requests/Api/PurchaseOrder/UpdatePurchaseOrderRequest.php#L1). SHA-256: `163f8fef07ad8a8681b7173106539d37caec25dd05d96ba1ea1b8b524fa582ce`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\PurchaseOrder;
6: 
7: use App\Http\Requests\Concerns\ValidatesVariantLines;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates a purchase order update via the REST API. Rules unchanged from
13:  * Api\PurchaseOrderController::update (header fields + items are `sometimes`).
14:  */
15: final class UpdatePurchaseOrderRequest extends FormRequest
16: {
17:     use ValidatesVariantLines;
18: 
19:     /**
20:      * @return array<string, mixed>
21:      */
22:     public function rules(): array
23:     {
24:         $organizationId = $this->user()->organization_id;
25: 
26:         return [
27:             'supplier_id' => ['sometimes', Rule::exists('suppliers', 'id')->where('organization_id', $organizationId)],
28:             'order_date' => ['sometimes', 'date'],
29:             'expected_date' => ['nullable', 'date', 'after_or_equal:order_date'],
30:             'currency' => ['sometimes', 'string', 'max:3'],
31:             'shipping' => ['nullable', 'numeric', 'decimal:0,2', 'min:0'],
32:             'tax' => ['nullable', 'numeric', 'decimal:0,2', 'min:0'],
33:             'notes' => ['nullable', 'string'],
34:             'items' => ['sometimes', 'array', 'min:1'],
35:             // parent purchase_order is already org-scoped via route-model binding
36:             'items.*.id' => ['nullable', 'exists:purchase_order_items,id'],
37:             'items.*.product_id' => ['required_with:items', Rule::exists('products', 'id')->where('organization_id', $organizationId)],
38:             'items.*.product_variant_id' => ['nullable', 'integer', Rule::exists('product_variants', 'id')->where('organization_id', $organizationId)->whereNull('deleted_at')],
39:             'items.*.quantity' => ['required_with:items', 'integer', 'min:1'],
40:             'items.*.unit_cost' => ['required_with:items', 'numeric', 'decimal:0,2', 'min:0'],
41:             'items.*.supplier_sku' => ['nullable', 'string', 'max:255'],
42:         ];
43:     }
44: 
45:     /**
46:      * The variant stays optional on the REST API so existing clients that
47:      * send product-only lines keep working; when sent it must still match.
48:      */
49:     protected function requiresVariantForVariantProducts(): bool
50:     {
51:         return false;
52:     }
53: }
```

