# Shared contracts — inventory.md

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

Read only the relevant sections for the active module; this file owns mixed-module registers and common rules. Return to [START HERE](../00_START_HERE.md).

- [Catalog and inventory implementation specification](#e0001)
- [Evidence boundary and how to use this section](#e0002)
- [Non-negotiable data and transaction design](#e0003)
- [Source-confirmed schema/relationship register (not live DB introspection)](#e0004)
- [Workflow contracts and edge cases](#e0005)
- [Administrator stock reset (destructive, do not execute as an audit convenience)](#e0014)
- [Proposed acceptance scenarios (not executed by this investigator)](#e0015)
- [Owned page/component coverage checklist](#e0016)
- [Per-view and nested form specification](#e0017)
- [Exact server validation rules and payload contracts](#e0058)
- [Schema and enum source evidence](#e0093)
- [2026_05_18_000001_make_inventory_numbers_unique_per_organization.php](#e0137)
- [2026_05_18_000002_add_composite_indexes_for_hot_query_paths.php](#e0138)
- [2026_09_27_000001_widen_columns_rejected_by_mysql_and_postgres.php](#e0142)
- [Auxiliary source pointers / remaining verification](#e0161)

<a id="e0001"></a>

> Audit provenance: `inventory.md` lines 1–2. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

# Catalog and inventory implementation specification



<a id="e0002"></a>

> Audit provenance: `inventory.md` lines 3–12. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Evidence boundary and how to use this section

This section is a **source-confirmed implementation specification**, not a claim that workflows passed in a browser or that the current database matches migrations. Source root: `C:\Users\proj\Inventoros`. No app files were changed and no application tests/build were run by this investigator. Browser evidence belongs to the parent audit and must be overlaid separately. Do not mark untested actions verified from this document.

**Current task authorization: read-only audit/report; no new records or application mutations.** Acceptance scenarios are a future implementation checklist, not permission to execute them now. For the planned rebuild, use **Taruvi-native datatables and storage, with Python backend services**, not a separate Supabase backend. Laravel/Eloquent table names below describe the source product only. Map those identities and transaction/permission semantics into Taruvi after its exact schema/transaction capabilities are confirmed; do not copy ORM calls as though they were native Taruvi APIs.

The page register below covers all 28 Vue pages in the assigned inventory areas and 12 relevant nested components. Each page includes its exact bound field keys, visible English labels where statically resolvable, input type/constraints, conditional ancestry, select options, initial-state expressions, columns/read sections, actions and source lines. Repeated row controls use `item`, `variant`, `row` or `level` aliases: preserve their array indexes and IDs in requests. A field absent from the template must not be invented merely because a backend accepts it. Raw Vue conditions and initializer expressions are intentionally retained to distinguish blanks, null, false, zero and saved record values.

**Reading defaults:** `props.product.*` / `props.warehouse.*` / `props.audit.*` means the saved server-provided value. `ref` values are local UI state; `useForm` objects are submission payloads. `required` in a control is a browser constraint; the server-rule annex is authoritative and sometimes different. Attributes show UI validation exactly; server exceptions and ownership checks remain necessary. Labels associated by surrounding markup are source-derived; dynamic translation labels remain expressions, and the manual notes resolve important repeated fields.



<a id="e0003"></a>

> Audit provenance: `inventory.md` lines 13–21. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Non-negotiable data and transaction design

1. **Do not treat `products.stock` as the only stock record.** Products and variants have independent on-hand totals; location bins distribute those quantities. The shared stock view combines bins, unassigned residual quantities, active reservations and dispatched transfers. Parent rows with live variants are excluded from independent sellable balance rows. See [StockBalanceService:23-65](C:/Users/proj/Inventoros/app/Services/StockBalanceService.php#L23) and [target/bin queries:116-137](C:/Users/proj/Inventoros/app/Services/StockBalanceService.php#L116).
2. **One transactional stock ledger boundary.** `StockAdjustment::adjust` / `adjustVariant` lock product then variant rows, validate stock/reservations, record before/change/after, synchronize bins and preserve actor/reference. Product edits do not replace quantities. See [StockAdjustment:196-245](C:/Users/proj/Inventoros/app/Models/Inventory/StockAdjustment.php#L196), [variant path:325-370](C:/Users/proj/Inventoros/app/Models/Inventory/StockAdjustment.php#L325), [ProductService:35-43](C:/Users/proj/Inventoros/app/Services/ProductService.php#L35).
3. **Identity persists across edits.** Variant updates match existing records rather than regenerate IDs; a removed variant with stock/history is deactivated, otherwise soft-deleted. Existing variant stock stays untouched. [ProductService:533-568](C:/Users/proj/Inventoros/app/Services/ProductService.php#L533), [reference checks:635-660](C:/Users/proj/Inventoros/app/Services/ProductService.php#L635).
4. **Organization and warehouse access are distinct.** Validate tenant ownership of every selected object, then warehouse action authority. UI hiding is not authorization. Reproduce route middleware AND service authorization. Inventory routes use session-authenticated web endpoints; external API endpoints are separate contracts. [routes/web/inventory.php:108-119](C:/Users/proj/Inventoros/routes/web/inventory.php#L108).
5. **Opening stock is an accounting event.** New product/variant stock writes create `opening_stock` ledger records; existing stock changes use adjustments. [ProductService:192-239](C:/Users/proj/Inventoros/app/Services/ProductService.php#L192).
6. **Quantities are integers.** UI prices generally use decimal steps; server monetary constraints differ by feature. Preserve nullable inherited prices/thresholds rather than converting every blank to zero.



<a id="e0004"></a>

> Audit provenance: `inventory.md` lines 22–51. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Source-confirmed schema/relationship register (not live DB introspection)

| Model / table | Key relationships and operational columns |
|---|---|
| `Product` / `products` | `organization_id`, `category_id`, primary `location_id`; SKU/name/description/price/purchase_price/currency/price_in_currencies/stock/min_stock/max_stock/reorder_point/reorder_quantity/barcode/barcode_type/notes/images/image_disks/is_active/has_variants/tracking_type/type. Product has options, variants, suppliers, locationStocks, batches, serials, components and ledger adjustments. |
| `ProductCategory` / `product_categories` | Organization; name/description/is_active; products reference `category_id`. |
| `Warehouse` / `warehouses` | Organization; name/code/address/contact/manager/timezone/currency/priority/capacity/is_active/is_default; locations through `warehouse_id`; assigned users via warehouse access pivot. |
| `ProductLocation` / `product_locations` | Organization; nullable `warehouse_id`; name/code/description/is_active/capacity. |
| `ProductOption` / `product_options` | Product and organization; name, values, position. |
| `ProductVariant` / `product_variants` | Product and organization; option_values/title/SKU/barcode/price/purchase_price/stock/min_stock/is_active/position. |
| `ProductLocationStock` / `product_location_stocks` | Organization, product_id, location_id, quantity; unique product/location. |
| `VariantLocationStock` / `variant_location_stocks` | Organization, product_variant_id, location_id, quantity; unique variant/location. |
| `WarehouseReorderPoint` / `warehouse_reorder_points` | Product/warehouse/org with nullable min_stock/reorder_point/reorder_quantity/max_stock overrides. |
| `ProductBatch` / `product_batches` | Organization/product, batch_number, quantity, manufactured_date, expiry_date, notes. |
| `ProductSerial` / `product_serials` | Organization/product, serial_number, status, notes, order_item_id. Serial numbers unique per organization. Order association is not mass-assignable. |
| `StockAdjustment` / `stock_adjustments` | Organization/product/optional product_variant_id/location_id/user_id; type, adjustment_quantity, quantity_before, quantity_after, reason, notes, reference_type/reference_id. |
| `StockAdjustmentRequest` / `stock_adjustment_requests` | Pending approval document; requested product/variant/delta/location and submitter/approval data; does not mean stock has already moved. |
| `StockReservation` / `stock_reservations` | Organization/product/optional variant/location/serial/batch; positive quantity; owner_type/owner_reference/scope_key; expires_at/consumed_at/released_at/release_reason and consumer reference. Owner-scope tuple unique within organization. |
| `StockTransfer` / `stock_transfers` | Organization; from/to location and warehouse IDs; status, is_inter_warehouse, approval status, prepared/shipped/dispatch/completion timestamps, completer; shipping_method/tracking_number/estimated_arrival. |
| `StockTransferItem` / `stock_transfer_items` | Transfer/product/optional variant, quantity, notes. |
| `StockAudit` / `stock_audits` | Organization; number/name/type/status; warehouse_id and warehouse_location_id; creator/assignee/schedule; timestamps; require_variance_approval. |
| `StockAuditItem` / `stock_audit_items` | Audit/product/variant/location, system/count quantities, discrepancy/status/count actor/time/notes, review state. |
| `StockAuditCount` / `stock_audit_counts` | Append-only count evidence linked to audit item; system/count quantities and actor/time/notes. |
| `StockAuditReview` / `stock_audit_reviews` | Review decisions against specific count evidence; approver/recount-request notes and timestamps. |
| `CycleCountSchedule` / `cycle_count_schedules` | Organization/name/frequency/scope_type/scope_id/products_per_run/assigned_to/is_active/next_run_at/last_run_at/last_audit_id/created_by. |
| `VariantReplenishmentPolicy` / `variant_replenishment_policies` | Organization/variant/warehouse/location/supplier; reorder_point/target_stock/reorder_quantity/minimum_order_quantity/unit_cost/currency/supplier_sku/auto_reorder/managed_by. |
| `InventoryResetRun` / `inventory_reset_runs` | Organization/public_id/actor_id/status/signature/reason/counts/error_code/timestamps. |

Exact model fillable/cast/relation and migration declaration evidence is indexed in the final schema annex. This register is a relationship map, not an assertion that a row is present or a migration is applied. Product BOM/work-order execution and purchasing are specified in the commerce section; the Product Show BOM controls are retained here because they are part of this page.



<a id="e0005"></a>

> Audit provenance: `inventory.md` lines 52–53. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Workflow contracts and edge cases



<a id="e0014"></a>

> Audit provenance: `inventory.md` lines 113–118. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Administrator stock reset (destructive, do not execute as an audit convenience)

- Preview counts affected product/variant/bin/batch/available-serial rows; not simply sum of units. Blocks active holds, reserved serials, pending/prepared/in-transit transfers, in-progress audits/work orders, ownership mismatch, existing pending/running reset and resource limit.
- Requires admin + manage_stock, reason 3..500, current password, exact `ZERO STOCK`, session preview UUID/token with 10-minute expiry, and unchanged inventory signature. Queue rechecks preview; execution locks and rechecks. [InventoryResetController:19-47](C:/Users/proj/Inventoros/app/Http/Controllers/Inventory/InventoryResetController.php#L19), [InventoryResetService:26-158](C:/Users/proj/Inventoros/app/Services/InventoryResetService.php#L26).
- It is an audited write-off, not delete-products: zero balances/batches, available serials become written_off, retain catalogue/history. Dedicated queue inventory-resets; status pending/running/completed/failed, browser polls every 3 seconds only while pending/running. Never test on user stock without separate explicit authorization.



<a id="e0015"></a>

> Audit provenance: `inventory.md` lines 119–136. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Proposed acceptance scenarios (not executed by this investigator)

1. Create category/location/warehouse with unique audit prefix; exercise required/overlength errors and foreign-organization selection rejection.
2. Create standard product with opening stock; verify one opening ledger row and correct bin total. Edit name/price and confirm stock does not move. Try direct edit-stock payload and confirm contract enforcement.
3. Create two option dimensions and resulting combinations; edit preserving variant IDs and existing stock; deactivate omitted referenced variant; validate price inheritance.
4. Add supplier links, reject duplicate supplier and two primaries; confirm first primary fallback and blank optional costs preserve intended semantics.
5. Adjust +/− quantity; verify reason/user/location/before/after; insufficient available stock and held stock rejected; approval request does not change balance until approved.
6. Reserve stock via authorized core workflow; verify on-hand unchanged, available reduced; consume/release/expire and owner audit evidence correctly reflected.
7. Transfer pending→prepared→shipped→completed; verify held source, source deduction once, in-transit separately, destination receipt once; duplicate completion rejected; shipped cancel rejected; reverse-transfer recovery.
8. Transfer variant scan must retain exact variant; scan checklist cannot be claimed as saved proof after reload.
9. Audit draft/start; change stock before start and verify refreshed snapshot; count zero/nonzero with note; conflict using stale revision; retain local draft offline and reject false HTML acknowledgement.
10. Mandatory variance approval: reject self-approval when disabled, require recount reason, invalidate stale review, complete only resolved counts. Uncounted explicit completion skips them unchanged.
11. Cycle schedule scoped to location/category/warehouse; run twice and verify prior open audit suppresses second, manual run doesn't advance next run; least-recently-counted selection.
12. Batch/serial uniqueness/status/date validations; held serial mutation rejected; tracked coverage default vs strict setting demonstrated separately.
13. Stock filters/export show equivalent permission-scoped rows and formula-safe CSV; page sorting and include-zero/out-of-stock combinations.
14. Variant replenishment excludes duplicate outstanding demand, respects currency/cost change and receiving location, creates draft PO only.
15. Reset **preview only** in normal audit. In isolated explicitly authorized disposable organization, test wrong phrase/password/expired preview/changed signature/blockers and queue failure; verify write-off ledger/history retention. Do not execute against production merely to complete checklist.



<a id="e0016"></a>

> Audit provenance: `inventory.md` lines 137–179. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Owned page/component coverage checklist

- [x] Source fields/actions inspected: [resources/js/Pages/Categories/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Categories/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Inventory/VariantReplenishment.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Inventory/VariantReplenishment.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Locations/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Locations/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Products/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/Create.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Products/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/Edit.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Products/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Products/ResetStock.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStock.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Products/ResetStockStatus.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/ResetStockStatus.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Products/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Products/Show.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Reservations/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Reservations/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Stock/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Stock/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAdjustments/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Create.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAdjustments/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAdjustments/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAdjustments/Show.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAudits/CountHistory.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CountHistory.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAudits/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Create.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAudits/CycleCounts/Form.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Form.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAudits/CycleCounts/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/CycleCounts/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAudits/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Edit.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAudits/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockAudits/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockAudits/Show.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockTransfers/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Create.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockTransfers/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/StockTransfers/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/StockTransfers/Show.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Warehouses/Create.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Create.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Warehouses/Edit.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Edit.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Warehouses/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Index.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Pages/Warehouses/Show.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Warehouses/Show.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/BarcodeScannerModal.vue:1](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScannerModal.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/BatchList.vue:1](C:/Users/proj/Inventoros/resources/js/Components/BatchList.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/SerialList.vue:1](C:/Users/proj/Inventoros/resources/js/Components/SerialList.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/ProductVariantManager.vue:1](C:/Users/proj/Inventoros/resources/js/Components/ProductVariantManager.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/VariantStockAdjuster.vue:1](C:/Users/proj/Inventoros/resources/js/Components/VariantStockAdjuster.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/WarehouseStockLevels.vue:1](C:/Users/proj/Inventoros/resources/js/Components/WarehouseStockLevels.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/SKUGeneratorModal.vue:1](C:/Users/proj/Inventoros/resources/js/Components/SKUGeneratorModal.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/ProductSupplierManager.vue:1](C:/Users/proj/Inventoros/resources/js/Components/ProductSupplierManager.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/ImageUploader.vue:1](C:/Users/proj/Inventoros/resources/js/Components/ImageUploader.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/VariantsTable.vue:1](C:/Users/proj/Inventoros/resources/js/Components/VariantsTable.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/BarcodeScanner.vue:1](C:/Users/proj/Inventoros/resources/js/Components/BarcodeScanner.vue#L1). Browser: **not verified by this investigator**.
- [x] Source fields/actions inspected: [resources/js/Components/StockAuditReviewEvidence.vue:1](C:/Users/proj/Inventoros/resources/js/Components/StockAuditReviewEvidence.vue#L1). Browser: **not verified by this investigator**.



<a id="e0017"></a>

> Audit provenance: `inventory.md` lines 180–182. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Per-view and nested form specification




<a id="e0058"></a>

> Audit provenance: `inventory.md` lines 2527–2530. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Exact server validation rules and payload contracts

These are source rules, not proof of deployment. Browser required marks may be stricter or weaker; preserve both. IDs require service ownership/warehouse checks in addition to exists rules. `sometimes` means omitted keys preserve partial-update semantics; nullable does not mean zero.



<a id="e0093"></a>

> Audit provenance: `inventory.md` lines 4650–4653. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Schema and enum source evidence

Selected exact model declarations provide field spellings and relations. A fillable list is not the full SQL schema. Migration definitions below establish table/column changes in source; they do not establish applied database state.



<a id="e0137"></a>

> Audit provenance: `inventory.md` lines 5973–5990. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_05_18_000001_make_inventory_numbers_unique_per_organization.php
[database/migrations/2026_05_18_000001_make_inventory_numbers_unique_per_organization.php:1](C:/Users/proj/Inventoros/database/migrations/2026_05_18_000001_make_inventory_numbers_unique_per_organization.php#L1)

```php
20:         Schema::table('products', function (Blueprint $table) {
21:             $table->dropUnique(['sku']);
22:             $table->unique(['organization_id', 'sku']);
35:         Schema::table('stock_transfers', function (Blueprint $table) {
36:             $table->dropUnique(['transfer_number']);
37:             $table->unique(['organization_id', 'transfer_number']);
53:         Schema::table('stock_transfers', function (Blueprint $table) {
54:             $table->dropUnique(['organization_id', 'transfer_number']);
55:             $table->unique(['transfer_number']);
68:         Schema::table('products', function (Blueprint $table) {
69:             $table->dropUnique(['organization_id', 'sku']);
70:             $table->unique(['sku']);
```



<a id="e0138"></a>

> Audit provenance: `inventory.md` lines 5991–6004. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_05_18_000002_add_composite_indexes_for_hot_query_paths.php
[database/migrations/2026_05_18_000002_add_composite_indexes_for_hot_query_paths.php:1](C:/Users/proj/Inventoros/database/migrations/2026_05_18_000002_add_composite_indexes_for_hot_query_paths.php#L1)

```php
25:         Schema::table('products', function (Blueprint $table) {
26:             $table->index(['organization_id', 'is_active', 'created_at'], 'products_org_active_created_index');
27:             $table->index(['organization_id', 'category_id'], 'products_org_category_index');
28:             $table->index(['organization_id', 'location_id'], 'products_org_location_index');
50:         Schema::table('products', function (Blueprint $table) {
51:             $table->dropIndex('products_org_location_index');
52:             $table->dropIndex('products_org_category_index');
53:             $table->dropIndex('products_org_active_created_index');
```



<a id="e0142"></a>

> Audit provenance: `inventory.md` lines 6042–6051. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_09_27_000001_widen_columns_rejected_by_mysql_and_postgres.php
[database/migrations/2026_09_27_000001_widen_columns_rejected_by_mysql_and_postgres.php:1](C:/Users/proj/Inventoros/database/migrations/2026_09_27_000001_widen_columns_rejected_by_mysql_and_postgres.php#L1)

```php
25:         Schema::table('warehouses', function (Blueprint $table) {
26:             $table->string('province', 255)->nullable()->change();
27:             $table->string('postal_code', 255)->nullable()->change();
28:             $table->string('country', 255)->nullable()->default('CA')->change();
```



<a id="e0161"></a>

> Audit provenance: `inventory.md` lines 6366–6383. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Auxiliary source pointers / remaining verification

- [app/Services/StockAuditReadService.php:1](C:/Users/proj/Inventoros/app/Services/StockAuditReadService.php#L1)
- [app/Services/StockAuditReviewService.php:1](C:/Users/proj/Inventoros/app/Services/StockAuditReviewService.php#L1)
- [app/Services/StockAuditSnapshot.php:1](C:/Users/proj/Inventoros/app/Services/StockAuditSnapshot.php#L1)
- [resources/js/composables/useAuditCountDrafts.js:1](C:/Users/proj/Inventoros/resources/js/composables/useAuditCountDrafts.js#L1)
- [resources/js/lib/auditCountDrafts.js:1](C:/Users/proj/Inventoros/resources/js/lib/auditCountDrafts.js#L1)
- [resources/js/composables/useBarcodeWedge.js:1](C:/Users/proj/Inventoros/resources/js/composables/useBarcodeWedge.js#L1)
- [app/Services/WarehouseAccessService.php:1](C:/Users/proj/Inventoros/app/Services/WarehouseAccessService.php#L1)
- [app/Services/WarehouseDeletionService.php:1](C:/Users/proj/Inventoros/app/Services/WarehouseDeletionService.php#L1)
- [app/Services/ProductLocationStockService.php:1](C:/Users/proj/Inventoros/app/Services/ProductLocationStockService.php#L1)
- [app/Services/TrackedStockAllocationService.php:1](C:/Users/proj/Inventoros/app/Services/TrackedStockAllocationService.php#L1)
- [app/Services/InventoryResetService.php:1](C:/Users/proj/Inventoros/app/Services/InventoryResetService.php#L1)

- All listed page/component templates and source-defined inputs/actions are covered. Source confirmation does not prove each dynamic plugin slot, remote selector option, permission combination, camera, queue worker, export download or data mutation works in a running instance.
- Generic UI shell/dialog/notification behavior is owned by platform section. Purchasing, BOM server execution/work orders and import-export standalone screens are owned by commerce/platform sections; this inventory section includes only inventory-facing embedded controls and ledger dependencies.
- Backend-only fields are explicitly distinguished from form inputs. Public API validation may differ from web validators; API rules for embedded inventory controls are included, but this is not a complete independent REST/OpenAPI specification.
- Suggested acceptance scenarios above are **pending**, not passed tests.
