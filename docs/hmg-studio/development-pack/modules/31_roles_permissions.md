# 31. Roles and Permission Sets — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Roles and Permission Sets as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Roles create/edit/list/detail; direct and effective permissions; permission-set API contracts; system/protected restrictions; service authorization matrix.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Admin/Roles/Create.vue` | Pending | Pending |
| `resources/js/Pages/Admin/Roles/Edit.vue` | Pending | Pending |
| `resources/js/Pages/Admin/Roles/Index.vue` | Pending | Pending |
| `resources/js/Pages/Admin/Roles/Show.vue` | Pending | Pending |

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

- [ ] No role grants unauthorized permissions.
- [ ] system roles retain protection.
- [ ] role create includes permission_set_ids while source edit omits it.
- [ ] denied direct API/datatable access remains denied even when UI is bypassed.

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

- [Routes, HTTP verbs and permission middleware](#e0092)
- [5. Exact routes and permission middleware](#e0229)
- [P15 Per-page route and permission ledger](#e0274)
- [`resources/js/Pages/Admin/Roles/Create.vue`](#e0298)
- [`resources/js/Pages/Admin/Roles/Edit.vue`](#e0299)
- [`resources/js/Pages/Admin/Roles/Index.vue`](#e0300)
- [`resources/js/Pages/Admin/Roles/Show.vue`](#e0301)
- [`app/Http/Requests/Admin/Role/StoreRoleRequest.php`](#e0368)
- [`app/Http/Requests/Admin/Role/UpdateRoleRequest.php`](#e0369)
- [`app/Http/Requests/Api/PermissionSet/StorePermissionSetRequest.php`](#e0372)
- [`app/Http/Requests/Api/PermissionSet/UpdatePermissionSetRequest.php`](#e0373)
- [`app/Http/Controllers/Admin/RoleController.php`](#e0391)
- [Complete source contract `app/Enums/Permission.php`](#e0454)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0092"></a>

> Audit provenance: `inventory.md` lines 4462–4649. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Routes, HTTP verbs and permission middleware

Laravel resource declarations expand conventional index/create/store/show/edit/update/destroy verbs; only/except restrictions below are authoritative. Parent web group middleware also applies and is documented in platform section.

Source [routes/web/inventory.php:34](C:/Users/proj/Inventoros/routes/web/inventory.php#L34)

```php
34:  */
35: 
36: Route::get('/stock', [StockBalanceController::class, 'index'])->name('stock.index')->middleware('permission:view_products');
37: Route::get('/stock/export', [StockBalanceController::class, 'export'])->name('stock.export')->middleware(['permission:view_products', 'permission:export_data']);
38: 
39: Route::get('/products/stock-reset', [InventoryResetController::class, 'preview'])->name('products.stock-reset.preview')->middleware(['admin', 'permission:manage_stock']);
40: Route::post('/products/stock-reset', [InventoryResetController::class, 'store'])->name('products.stock-reset.store')->middleware(['admin', 'permission:manage_stock']);
41: Route::get('/products/stock-reset/status/{resetRun:public_id}', [InventoryResetController::class, 'show'])->name('products.stock-reset.show')->middleware(['admin', 'permission:manage_stock']);
42: 
43: // Inventory Management - Permission based
44: Route::get('/products', [ProductController::class, 'index'])->name('products.index')->middleware('permission:view_products');
45: Route::get('/products/create', [ProductController::class, 'create'])->name('products.create')->middleware('permission:create_products');
46: Route::post('/products', [ProductController::class, 'store'])->name('products.store')->middleware('permission:create_products');
47: Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show')->middleware('permission:view_products');
48: Route::get('/products/{product}/edit', [ProductController::class, 'edit'])->name('products.edit')->middleware('permission:edit_products');
49: Route::get('/products/{product}/images/{index}', ProductImageController::class)->whereNumber('index')->name('products.images.show')->middleware('permission:view_products|edit_products');
50: Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update')->middleware('permission:edit_products');
51: Route::patch('/products/{product}', [ProductController::class, 'update'])->middleware('permission:edit_products');
52: Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy')->middleware('permission:delete_products');
53: Route::post('/products/{product}/duplicate', [ProductController::class, 'duplicate'])->name('products.duplicate')->middleware('permission:create_products');
54: Route::put('/products/{product}/warehouse-levels', [ProductWarehouseLevelController::class, 'update'])->name('products.warehouse-levels.update')->middleware('permission:edit_products');
55: 
56: // Bulk Product Operations
57: Route::prefix('products/bulk')->name('products.bulk.')->middleware('permission:edit_products')->group(function () {
58:     Route::post('/delete', [BulkProductController::class, 'bulkDelete'])->middleware('permission:delete_products')->name('delete');
59:     Route::post('/update-category', [BulkProductController::class, 'bulkUpdateCategory'])->name('update-category');
60:     Route::post('/update-price', [BulkProductController::class, 'bulkUpdatePrice'])->name('update-price');
61:     Route::post('/export', [BulkProductController::class, 'bulkExport'])->middleware('permission:export_data')->name('export');
62: });
63: 
64: // Barcode Management
65: Route::prefix('products/{product}/barcode')->name('products.barcode.')->middleware('permission:view_products')->group(function () {
66:     Route::get('/generate', [BarcodeController::class, 'generate'])->name('generate');
67:     Route::get('/print', [BarcodeController::class, 'print'])->name('print');
68:     Route::post('/generate-random', [BarcodeController::class, 'generateRandom'])->middleware('permission:edit_products')->name('generate-random');
69:     Route::post('/generate-from-sku', [BarcodeController::class, 'generateFromSKU'])->middleware('permission:edit_products')->name('generate-from-sku');
70: });
71: 
72: // Bulk Barcode Printing
73: Route::get('/products/barcode/bulk-print', [BarcodeController::class, 'bulkPrint'])
74:     ->name('products.barcode.bulk-print')
75:     ->middleware('permission:view_products');
76: 
77: // QR Codes: products encode their SKU or a deep link; locations their code
78: Route::get('/products/qr/bulk-print', [QrCodeController::class, 'bulkPrint'])
79:     ->name('products.qr.bulk-print')
80:     ->middleware('permission:view_products');
81: Route::prefix('products/{product}/qr')->name('products.qr.')->middleware('permission:view_products')->group(function () {
82:     Route::get('/', [QrCodeController::class, 'generate'])->name('generate');
83:     Route::get('/print', [QrCodeController::class, 'print'])->name('print');
84: });
85: Route::get('/locations/qr/bulk-print', [QrCodeController::class, 'bulkPrintLocations'])
86:     ->name('locations.qr.bulk-print')
87:     ->middleware('permission:manage_locations');
88: Route::get('/locations/{location}/qr/print', [QrCodeController::class, 'printLocation'])
89:     ->name('locations.qr.print')
90:     ->middleware('permission:manage_locations');
91: 
92: // SKU Management
93: Route::prefix('sku')->name('sku.')->middleware('permission:view_products')->group(function () {
94:     Route::get('/patterns', [SKUController::class, 'patterns'])->name('patterns');
95:     Route::post('/generate', [SKUController::class, 'generate'])->name('generate');
96:     Route::post('/check-unique', [SKUController::class, 'checkUnique'])->name('check-unique');
97: });
98: 
99: // Product Components (BOM) for Kits & Assemblies
100: Route::prefix('products/{product}/components')->middleware('permission:edit_products')->group(function () {
101:     Route::get('/', [ProductComponentController::class, 'index'])->name('products.components.index');
102:     Route::post('/', [ProductComponentController::class, 'store'])->name('products.components.store');
103:     Route::put('/{component}', [ProductComponentController::class, 'update'])->name('products.components.update');
104:     Route::delete('/{component}', [ProductComponentController::class, 'destroy'])->name('products.components.destroy');
105:     Route::post('/reorder', [ProductComponentController::class, 'reorder'])->name('products.components.reorder');
106: });
107: 
108: // In-app JSON endpoints called with axios by product-page components
109: // (BatchList, SerialList, VariantStockAdjuster, BarcodeScannerModal). They
110: // reuse the REST API controllers but ride the web session: CSRF via the
111: // XSRF-TOKEN cookie, two-factor enforcement, and no stateful-domain config.
112: // The /api/v1 routes stay bearer-token only for external clients.
113: Route::prefix('products/{product}')->name('products.')->group(function () {
114:     Route::post('/batches', [ApiBatchTrackingController::class, 'store'])->name('batches.store')->middleware('permission:edit_products');
115:     Route::post('/serials', [ApiSerialTrackingController::class, 'store'])->name('serials.store')->middleware('permission:edit_products');
116:     Route::put('/serials/{serial}', [ApiSerialTrackingController::class, 'update'])->name('serials.update')->middleware('permission:edit_products');
117:     Route::post('/variants/{variant}/adjust-stock', [ApiProductVariantController::class, 'adjustStock'])->name('variants.adjust-stock')->middleware('permission:manage_stock');
118: });
119: Route::get('/barcode/lookup', [ApiBarcodeLookupController::class, 'lookupByQuery'])->name('barcode.lookup')->middleware('permission:view_products');
120: 
121: // Work Orders
122: Route::resource('work-orders', WorkOrderController::class)->except(['edit', 'update'])->middleware('permission:manage_stock');
123: Route::post('work-orders/{workOrder}/start', [WorkOrderController::class, 'start'])->name('work-orders.start')->middleware('permission:manage_stock');
124: Route::post('work-orders/{workOrder}/complete', [WorkOrderController::class, 'complete'])->name('work-orders.complete')->middleware('permission:manage_stock');
125: Route::post('work-orders/{workOrder}/cancel', [WorkOrderController::class, 'cancel'])->name('work-orders.cancel')->middleware('permission:manage_stock');
126: 
127: // Categories - Permission based
128: Route::resource('categories', ProductCategoryController::class)
129:     ->except(['create', 'show', 'edit'])
130:     ->middleware('permission:manage_categories');
131: 
132: // Locations - Permission based
133: Route::resource('locations', ProductLocationController::class)
134:     ->except(['create', 'show', 'edit'])
135:     ->middleware('permission:manage_locations');
136: 
137: // Warehouses - Permission based
138: // Each verb has its own permission, matching the REST API. A single
139: // view_warehouses middleware used to guard store, update and destroy too.
140: // create is registered before show so /warehouses/create is not read as {warehouse}.
141: Route::resource('warehouses', WarehouseController::class)->only(['create', 'store'])->middleware('permission:create_warehouses');
142: Route::resource('warehouses', WarehouseController::class)->only(['index', 'show'])->middleware('permission:view_warehouses');
143: // The edit page also holds the user-access form, which has its own permission.
144: Route::resource('warehouses', WarehouseController::class)->only(['edit'])->middleware('permission:edit_warehouses|manage_warehouse_users');
145: Route::resource('warehouses', WarehouseController::class)->only(['update'])->middleware('permission:edit_warehouses');
146: Route::resource('warehouses', WarehouseController::class)->only(['destroy'])->middleware('permission:delete_warehouses');
147: Route::post('warehouses/access-policy', [WarehouseController::class, 'updateAccessPolicy'])->name('warehouses.access-policy')->middleware('permission:manage_warehouse_users');
148: Route::post('warehouses/{warehouse}/users', [WarehouseController::class, 'updateUsers'])->name('warehouses.users.update')->middleware('permission:manage_warehouse_users');
149: Route::post('warehouses/{warehouse}/set-default', [WarehouseController::class, 'setDefault'])->name('warehouses.set-default')->middleware('permission:edit_warehouses');
150: Route::post('/set-warehouse', [WarehouseController::class, 'setActiveWarehouse'])->name('warehouses.set-active');
151: 
152: // Stock Transfers - Permission based
153: Route::get('/stock-transfers', [StockTransferController::class, 'index'])->name('stock-transfers.index')->middleware('permission:transfer_stock');
154: Route::get('/stock-transfers/create', [StockTransferController::class, 'create'])->name('stock-transfers.create')->middleware('permission:transfer_stock');
155: Route::post('/stock-transfers', [StockTransferController::class, 'store'])->name('stock-transfers.store')->middleware('permission:transfer_stock');
156: Route::get('/stock-transfers/{stockTransfer}', [StockTransferController::class, 'show'])->name('stock-transfers.show')->middleware('permission:transfer_stock');
157: Route::put('/stock-transfers/{stockTransfer}', [StockTransferController::class, 'update'])->name('stock-transfers.update')->middleware('permission:transfer_stock');
158: Route::post('/stock-transfers/{stockTransfer}/prepare', [StockTransferController::class, 'prepare'])->name('stock-transfers.prepare')->middleware('permission:transfer_stock');
159: Route::post('/stock-transfers/{stockTransfer}/ship', [StockTransferController::class, 'ship'])->name('stock-transfers.ship')->middleware('permission:transfer_stock');
160: Route::post('/stock-transfers/{stockTransfer}/complete', [StockTransferController::class, 'complete'])->name('stock-transfers.complete')->middleware('permission:transfer_stock');
161: Route::post('/stock-transfers/{stockTransfer}/cancel', [StockTransferController::class, 'cancel'])->name('stock-transfers.cancel')->middleware('permission:transfer_stock');
162: 
163: // Stock Audits - Permission based
164: Route::get('/stock-audits', [StockAuditController::class, 'index'])->name('stock-audits.index')->middleware('permission:view_stock_audits');
165: Route::get('/stock-audits/create', [StockAuditController::class, 'create'])->name('stock-audits.create')->middleware('permission:create_stock_audits');
166: Route::post('/stock-audits', [StockAuditController::class, 'store'])->name('stock-audits.store')->middleware('permission:create_stock_audits');
167: Route::get('/stock-audits/{stockAudit}', [StockAuditController::class, 'show'])->name('stock-audits.show')->middleware('permission:view_stock_audits');
168: Route::get('/stock-audits/{stockAudit}/edit', [StockAuditController::class, 'edit'])->name('stock-audits.edit')->middleware('permission:manage_stock_audits');
169: Route::put('/stock-audits/{stockAudit}', [StockAuditController::class, 'update'])->name('stock-audits.update')->middleware('permission:manage_stock_audits');
170: Route::delete('/stock-audits/{stockAudit}', [StockAuditController::class, 'destroy'])->name('stock-audits.destroy')->middleware('permission:manage_stock_audits');
171: Route::post('/stock-audits/{stockAudit}/start', [StockAuditController::class, 'start'])->name('stock-audits.start')->middleware('permission:manage_stock_audits');
172: Route::post('/stock-audits/{stockAudit}/complete', [StockAuditController::class, 'complete'])->name('stock-audits.complete')->middleware('permission:manage_stock_audits');
173: Route::post('/stock-audits/{stockAudit}/items/{item}/count', [StockAuditController::class, 'updateCount'])->name('stock-audits.items.count')->middleware('permission:manage_stock_audits');
174: Route::get('/stock-audits/{stockAudit}/items/{item}/counts', [StockAuditController::class, 'countHistory'])->name('stock-audits.items.counts')->middleware('permission:view_stock_audits');
175: Route::get('/stock-audits/{stockAudit}/lookup', [StockAuditItemsController::class, 'lookup'])->name('stock-audits.lookup')->middleware('permission:view_stock_audits');
176: Route::get('/stock-audits/{stockAudit}/items/{item}', [StockAuditItemsController::class, 'show'])->name('stock-audits.items.show')->middleware('permission:view_stock_audits');
177: Route::post('/stock-audits/{stockAudit}/items/{item}/review', [StockAuditController::class, 'reviewCount'])->name('stock-audits.items.review')->middleware(['permission:view_stock_audits', 'permission:approve_stock_adjustments']);
178: 
179: // Stock reservations (holds): anyone who can see products sees what is
180: // promised; releasing a hold is a stock change.
181: Route::get('/reservations', [StockReservationController::class, 'index'])->name('reservations.index')->middleware('permission:view_products');
182: Route::post('/reservations/{reservation}/release', [StockReservationController::class, 'release'])->name('reservations.release')->middleware('permission:manage_stock');
183: 
184: // Stock Adjustments - Permission based
185: Route::get('/stock-adjustments', [StockAdjustmentController::class, 'index'])->name('stock-adjustments.index')->middleware('permission:manage_stock');
186: Route::get('/stock-adjustments/create', [StockAdjustmentController::class, 'create'])->name('stock-adjustments.create')->middleware('permission:manage_stock');
187: Route::post('/stock-adjustments', [StockAdjustmentController::class, 'store'])->name('stock-adjustments.store')->middleware('permission:manage_stock');
188: Route::get('/stock-adjustments/{stockAdjustment}', [StockAdjustmentController::class, 'show'])->name('stock-adjustments.show')->middleware('permission:manage_stock');
189: 
190: // Explicit variant demand and receiving destination per warehouse.
191: Route::prefix('variant-replenishment')->name('variant-replenishment.')->group(function () {
192:     Route::get('/', [VariantReplenishmentController::class, 'index'])->name('index')->middleware('permission:view_products');
193:     Route::get('/options', [VariantReplenishmentController::class, 'options'])->name('options')->middleware(['permission:view_products', 'permission:edit_products']);
194:     Route::post('/', [VariantReplenishmentController::class, 'store'])->name('store')->middleware(['permission:view_products', 'permission:edit_products']);
195:     Route::put('/{policy}', [VariantReplenishmentController::class, 'update'])->name('update')->middleware(['permission:view_products', 'permission:edit_products']);
196:     Route::delete('/{policy}', [VariantReplenishmentController::class, 'destroy'])->name('destroy')->middleware(['permission:view_products', 'permission:edit_products']);
197:     Route::post('/{policy}/draft', [VariantReplenishmentController::class, 'draft'])->name('draft')->middleware(['permission:view_products', 'permission:create_purchase_orders']);
198: });
199: 
```

Source [routes/web/cycle-counts.php:16](C:/Users/proj/Inventoros/routes/web/cycle-counts.php#L16)

```php
16: Route::get('/cycle-counts', [CycleCountScheduleController::class, 'index'])->name('cycle-counts.index')->middleware('permission:view_stock_audits');
17: Route::get('/cycle-counts/create', [CycleCountScheduleController::class, 'create'])->name('cycle-counts.create')->middleware('permission:manage_stock_audits');
18: Route::post('/cycle-counts', [CycleCountScheduleController::class, 'store'])->name('cycle-counts.store')->middleware('permission:manage_stock_audits');
19: Route::get('/cycle-counts/{cycleCount}/edit', [CycleCountScheduleController::class, 'edit'])->name('cycle-counts.edit')->middleware('permission:manage_stock_audits');
20: Route::put('/cycle-counts/{cycleCount}', [CycleCountScheduleController::class, 'update'])->name('cycle-counts.update')->middleware('permission:manage_stock_audits');
21: Route::delete('/cycle-counts/{cycleCount}', [CycleCountScheduleController::class, 'destroy'])->name('cycle-counts.destroy')->middleware('permission:manage_stock_audits');
22: Route::post('/cycle-counts/{cycleCount}/run', [CycleCountScheduleController::class, 'run'])->name('cycle-counts.run')->middleware('permission:manage_stock_audits');
23: 
```



<a id="e0229"></a>

> Audit provenance: `commerce.md` lines 4211–4215. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## 5. Exact routes and permission middleware

These are source web routes. Rebuild logical commands, not Laravel URLs blindly. Authenticated route context and service checks supplement middleware.




<a id="e0274"></a>

> Audit provenance: `platform.md` lines 184–221. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P15 Per-page route and permission ledger

Paths below are source routes; page-local links/actions and exact named routes are in catalog. Authentication is inherited from routes/web.php except installer, guest auth and portal guard. Child fields/views never replace endpoint permission checks.

| Page group (all Vue files in group inventoried) | Entry/CRUD routes | Access |
|---|---|---|
| Dashboard.vue | /dashboard;PATCH /settings/dashboard-widgets | auth+verified dashboard;per-data permissions;own widget preferences |
| Auth Login/Register/Forgot/Reset | /login,/register,/forgot-password,/reset-password/{token} | guest;validation/throttle/token |
| Auth Confirm/Verify/2FA | /confirm-password,/verify-email,/email/verification-notification,/two-factor-challenge,/settings/two-factor/setup,enable,disable | auth;signed verification;2FA/password gates |
| Profile/Edit and 3 partials | GET/PATCH/DELETE /profile;PUT /password | authenticated self/current-password guard |
| Admin/Users Index/Create/Edit/Show | /users,/users/create,/users/{user},/users/{user}/edit | view_users/create_users/edit_users/delete_users by operation |
| Admin/Roles Index/Create/Edit/Show | /roles,/roles/create,/roles/{role},/roles/{role}/edit | view_roles/create_roles/edit_roles/delete_roles plus protection/org checks |
| Settings/Index | /settings | any authenticated user;hub hides admin destinations |
| Settings/Organization/Index | /settings/organization;logo/general/regional/approvals/portal subactions | view_settings;changes manage_organization |
| Settings/Account/Index | /settings/account;profile/password/notifications/preferences/locale subactions | authenticated self |
| Settings/Email and 2 settings partials | /settings/email,/settings/email/test;account notifications endpoint | manage_organization for email;own preference update |
| Settings/ApiTokens/Index | /settings/api-tokens;DELETE /{tokenId} | self;grant only held abilities;organization-token ownership |
| Settings/Shipping | /settings/shipping;webhook-token rotation | manage_organization |
| Settings/Storage | /settings/storage;POST /check | StorageAdministration::canManage;not merely authenticated |
| Settings/Webhooks Index/Show | /webhooks/{webhook};regenerate-secret/test;webhook-deliveries/{delivery}/retry | manage_organization + owned record |
| Notifications/Index | /notifications;read/unread/mark-all/delete/clear | authenticated own notifications |
| Admin/ActivityLog/Index | /activity-log;/activity-log/export | view_activity_log |
| Reports/Index | /reports | view_reports;cards further source permissions |
| Reports InventoryValuation/LowStock/CategoryPerformance/BatchExpiry | /reports/inventory-valuation,low-stock,category-performance,batch-expiry | view_reports + view_products |
| Reports StockMovement | /reports/stock-movement | view_reports and service warehouse/source constraints |
| Reports SalesAnalysis/SalesByLocation/AbcAnalysis | /reports/sales-analysis,sales-by-location,abc-analysis | view_reports + view_orders |
| Reports Receivables | /reports/receivables | view_reports + view_payments |
| Reports DeadStock/InventoryTurnover/ProfitMargin | /reports/dead-stock,inventory-turnover,profit-margin | view_reports + view_products AND view_orders |
| Reports/Builder Index/Create/Edit/Show | /reports/builder,/create,/{saved_report},/edit,/preview,/export | view_reports;per-source view permission;owner rules for changes/schedules |
| ImportExport/Index | /import-export;export-products/export-orders/export-users;import-products/import-orders/import-users;templates;downloads/{dataExport} | export_data or import_data entry;separate operation permission;user view/create and order create additions |
| Portal Dashboard/Auth/Orders/Returns | /portal/{organization}/...;exact routes/portal.php in catalog | customer guard;organization enabled;own customer;return delivered-only |
| Plugins/Index | /plugins;marketplace;upload;activate/deactivate/delete | view_plugins;manage_plugins+plugin-admin org for changes |
| Admin/Update/Index | /admin/update;/check,/perform,/backup,/backups,/restore,DELETE /backup | manage_organization+EnsureUpdateAdministrator;additional controller is_admin |
| Install Welcome/Requirements/Database/Admin/Complete | /install,/requirements,/database,/database/test,/database/install,/admin,/complete | installation-state guards;not ordinary staff page |
| Errors/403 | controller rendered denied GET page | denied request, no CRUD |
| Tax billing Settings/Invoice and components | /p/tax-billing/settings;/orders/{orderId};/issue;/download | plugin active;tax-billing.manage;view_orders;issue additionally tax-billing.issue |
| Hello-world plugin sample | registered plugin pages/menu via plugin owner | plugin activation/registered permission;not promised active in current app |



<a id="e0298"></a>

> Audit provenance: `platform-source-catalog.md` lines 436–472. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/Roles/Create.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Admin/Roles/Create.vue:126`: `<input id="name" v-model="form.name" type="text" required autofocus :placeholder="t('admin.roles.create.namePlaceholder')" />`
- `resources/js/Pages/Admin/Roles/Create.vue:140`: `<textarea id="description" v-model="form.description" rows="3" :placeholder="t('admin.roles.create.descriptionPlaceholder')" >`
- `resources/js/Pages/Admin/Roles/Create.vue:232`: `<input type="checkbox" :value="permission.value" v-model="form.permissions" />`

**Form initial state/defaults:**
```js
20: const form = useForm({
21:     name: '',
22:     description: '',
23:     permissions: [],
24:     permission_set_ids: [],
25: });
```

**View filters, permission/action and navigation anchors:**
```js
41: .filter(set => form.permission_set_ids.includes(set.id))
66: form.post(route('roles.store'), {
77: form.permissions = form.permissions.filter(p => !categoryPermissions.includes(p));
```

**Displayed data/value expressions:**
```text
135: form.errors.name
147: form.errors.description
181: permissionSetName(set, i18n)
182: permissionSetDescription(set, i18n)
210: permissionCategoryLabel(category, i18n)
221: isCategorySelected(category) ? t('admin.roles.create.deselectAll') : t('admin.roles.create.selectAll')
239: permissionLabel(permission, i18n)
240: permissionDescription(permission, i18n)
247: form.errors.permissions
```



<a id="e0299"></a>

> Audit provenance: `platform-source-catalog.md` lines 473–505. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/Roles/Edit.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Admin/Roles/Edit.vue:92`: `<input id="name" v-model="form.name" type="text" :disabled="role.is_system" required />`
- `resources/js/Pages/Admin/Roles/Edit.vue:109`: `<textarea id="description" v-model="form.description" rows="3" :disabled="role.is_system" >`
- `resources/js/Pages/Admin/Roles/Edit.vue:159`: `<input type="checkbox" :value="permission.value" v-model="form.permissions" />`

**Form initial state/defaults:**
```js
19: const form = useForm({
20:     name: props.role.name,
21:     description: props.role.description || '',
22:     permissions: props.role.permissions || [],
23: });
```

**View filters, permission/action and navigation anchors:**
```js
26: form.put(route('roles.update', props.role.id));
35: form.permissions = form.permissions.filter(p => !categoryPermissions.includes(p));
```

**Displayed data/value expressions:**
```text
100: form.errors.name
116: form.errors.description
139: permissionCategoryLabel(category, i18n)
148: isCategorySelected(category) ? t('admin.roles.create.deselectAll') : t('admin.roles.create.selectAll')
166: permissionLabel(permission, i18n)
167: permissionDescription(permission, i18n)
174: form.errors.permissions
```



<a id="e0300"></a>

> Audit provenance: `platform-source-catalog.md` lines 506–516. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/Roles/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Displayed data/value expressions:**
```text
53: roleName(role, i18n)
54: roleDescription(role, i18n)
```



<a id="e0301"></a>

> Audit provenance: `platform-source-catalog.md` lines 517–554. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/Roles/Show.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Form initial state/defaults:**
```js
27: const deleteForm = useForm({});
```

**View filters, permission/action and navigation anchors:**
```js
17: const { canVisit, hasPermission } = usePermissions();
26: const showDeleteModal = ref(false);
28: const deleting = computed(() => deleteForm.processing);
31: const isProtected = computed(() => props.role.is_system || props.role.slug === 'system-administrator');
33: const groupedPermissions = computed(() => {
49: if (deleting.value || !hasPermission('delete_roles')) return;
50: deleteForm.delete(route('roles.destroy', props.role.id), {
```

**Displayed data/value expressions:**
```text
67: roleName(role, i18n)
101: roleName(role, i18n)
106: roleDescription(role, i18n)
113: role.is_system ? t('admin.roles.show.systemRole') : t('admin.roles.show.customRole')
127: user.name.charAt(0).toUpperCase()
130: user.name
131: user.email
150: permissionCategoryLabel(category, i18n)
160: permissionLabel(permission, i18n)
161: permissionDescription(permission, i18n)
184: formatDate(role.created_at)
189: formatDate(role.updated_at)
196: role.slug
```



<a id="e0368"></a>

> Audit provenance: `platform-source-catalog.md` lines 3073–3105. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Admin/Role/StoreRoleRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Admin\Role;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates creating a role (admin). Rules unchanged from
11:  * Admin\RoleController::store.
12:  */
13: final class StoreRoleRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, string>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'name' => 'required|string|max:255',
22:             'description' => 'nullable|string',
23:             'permissions' => 'nullable|array',
24:             'permissions.*' => 'string',
25:             'permission_set_ids' => 'nullable|array',
26:             'permission_set_ids.*' => 'integer|exists:permission_sets,id',
27:         ];
28:     }
29: }
```



<a id="e0369"></a>

> Audit provenance: `platform-source-catalog.md` lines 3106–3138. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Admin/Role/UpdateRoleRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Admin\Role;
6: 
7: use Illuminate\Foundation\Http\FormRequest;
8: 
9: /**
10:  * Validates updating a role (admin). Rules unchanged from
11:  * Admin\RoleController::update.
12:  */
13: final class UpdateRoleRequest extends FormRequest
14: {
15:     /**
16:      * @return array<string, string>
17:      */
18:     public function rules(): array
19:     {
20:         return [
21:             'name' => 'required|string|max:255',
22:             'description' => 'nullable|string',
23:             'permissions' => 'nullable|array',
24:             'permissions.*' => 'string',
25:             'permission_set_ids' => 'nullable|array',
26:             'permission_set_ids.*' => 'integer|exists:permission_sets,id',
27:         ];
28:     }
29: }
```



<a id="e0372"></a>

> Audit provenance: `platform-source-catalog.md` lines 3219–3257. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/PermissionSet/StorePermissionSetRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\PermissionSet;
6: 
7: use App\Enums\Permission;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: use Illuminate\Validation\Rules\In;
11: 
12: /**
13:  * Validates a new permission set via the REST API. permissions.* is allowlisted
14:  * against the Permission enum so a caller can't persist arbitrary/garbage or
15:  * privileged strings that later merge into effective role permissions; the
16:  * controller additionally checks a non-admin only includes permissions they
17:  * themselves hold.
18:  */
19: final class StorePermissionSetRequest extends FormRequest
20: {
21:     /**
22:      * @return array<string, array<int, string|In>>
23:      */
24:     public function rules(): array
25:     {
26:         return [
27:             'name' => ['required', 'string', 'max:255'],
28:             'description' => ['nullable', 'string'],
29:             'category' => ['nullable', 'string', 'max:50'],
30:             'icon' => ['nullable', 'string', 'max:50'],
31:             'permissions' => ['required', 'array', 'min:1'],
32:             'permissions.*' => ['string', Rule::in(Permission::values())],
33:         ];
34:     }
35: }
```



<a id="e0373"></a>

> Audit provenance: `platform-source-catalog.md` lines 3258–3293. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/PermissionSet/UpdatePermissionSetRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\PermissionSet;
6: 
7: use App\Enums\Permission;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Validates a permission set update via the REST API. Rules unchanged from
13:  * Api\PermissionSetController::update (name/permissions are `sometimes`).
14:  */
15: final class UpdatePermissionSetRequest extends FormRequest
16: {
17:     /**
18:      * @return array<string, array<int, string>>
19:      */
20:     public function rules(): array
21:     {
22:         return [
23:             'name' => ['sometimes', 'string', 'max:255'],
24:             'description' => ['nullable', 'string'],
25:             'category' => ['nullable', 'string', 'max:50'],
26:             'icon' => ['nullable', 'string', 'max:50'],
27:             'permissions' => ['sometimes', 'array', 'min:1'],
28:             'permissions.*' => ['string', Rule::in(Permission::values())],
29:             'is_active' => ['sometimes', 'boolean'],
30:         ];
31:     }
32: }
```



<a id="e0391"></a>

> Audit provenance: `platform-source-catalog.md` lines 3883–3901. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/RoleController.php`
```php
34:     public function index(Request $request): Response
40:             ->where(function ($query) use ($user) {
44:             ->when($request->input('search'), function ($query, $search) {
51:         return Inertia::render('Admin/Roles/Index', [
62:     public function create(Request $request): Response
83:         return Inertia::render('Admin/Roles/Create', [
94:     public function store(StoreRoleRequest $request): RedirectResponse
124:     public function show(Request $request, Role $role): Response
158:         return Inertia::render('Admin/Roles/Show', [
178:     public function edit(Request $request, Role $role): Response|RedirectResponse
215:         return Inertia::render('Admin/Roles/Edit', [
229:     public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
252:         $role->update([
289:     public function destroy(Request $request, Role $role): RedirectResponse
310:         $role->delete();
```



<a id="e0454"></a>

> Audit provenance: `platform-source-catalog.md` lines 9074–9443. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Complete source contract `app/Enums/Permission.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: use App\Services\Plugins\PluginPermissionRegistry;
8: 
9: /**
10:  * Enum defining all available permissions in the system.
11:  *
12:  * Permissions are organized into categories: User Management, Role Management,
13:  * Inventory Management, Customer Management, Supplier Management,
14:  * Purchase Order Management, Order Management, Payments, Settings, Plugins, and Reports & Data.
15:  */
16: enum Permission: string
17: {
18:     // User Management
19:     case VIEW_USERS = 'view_users';
20:     case CREATE_USERS = 'create_users';
21:     case EDIT_USERS = 'edit_users';
22:     case DELETE_USERS = 'delete_users';
23: 
24:     // Role Management
25:     case VIEW_ROLES = 'view_roles';
26:     case CREATE_ROLES = 'create_roles';
27:     case EDIT_ROLES = 'edit_roles';
28:     case DELETE_ROLES = 'delete_roles';
29: 
30:     // Product Management
31:     case VIEW_PRODUCTS = 'view_products';
32:     case CREATE_PRODUCTS = 'create_products';
33:     case EDIT_PRODUCTS = 'edit_products';
34:     case DELETE_PRODUCTS = 'delete_products';
35:     case MANAGE_STOCK = 'manage_stock';
36:     case TRANSFER_STOCK = 'transfer_stock';
37:     case MANAGE_CATEGORIES = 'manage_categories';
38:     case MANAGE_LOCATIONS = 'manage_locations';
39: 
40:     // Customer Management
41:     case VIEW_CUSTOMERS = 'view_customers';
42:     case CREATE_CUSTOMERS = 'create_customers';
43:     case EDIT_CUSTOMERS = 'edit_customers';
44:     case DELETE_CUSTOMERS = 'delete_customers';
45: 
46:     // Supplier Management
47:     case VIEW_SUPPLIERS = 'view_suppliers';
48:     case CREATE_SUPPLIERS = 'create_suppliers';
49:     case EDIT_SUPPLIERS = 'edit_suppliers';
50:     case DELETE_SUPPLIERS = 'delete_suppliers';
51: 
52:     // Purchase Order Management
53:     case VIEW_PURCHASE_ORDERS = 'view_purchase_orders';
54:     case CREATE_PURCHASE_ORDERS = 'create_purchase_orders';
55:     case EDIT_PURCHASE_ORDERS = 'edit_purchase_orders';
56:     case DELETE_PURCHASE_ORDERS = 'delete_purchase_orders';
57:     case RECEIVE_PURCHASE_ORDERS = 'receive_purchase_orders';
58:     case APPROVE_PURCHASE_ORDERS = 'approve_purchase_orders';
59: 
60:     // Order Management
61:     case VIEW_ORDERS = 'view_orders';
62:     case CREATE_ORDERS = 'create_orders';
63:     case EDIT_ORDERS = 'edit_orders';
64:     case DELETE_ORDERS = 'delete_orders';
65:     case APPROVE_ORDERS = 'approve_orders';
66: 
67:     // Payments
68:     case VIEW_PAYMENTS = 'view_payments';
69:     case RECORD_PAYMENTS = 'record_payments';
70: 
71:     // Settings
72:     case VIEW_SETTINGS = 'view_settings';
73:     case EDIT_SETTINGS = 'edit_settings';
74:     case MANAGE_ORGANIZATION = 'manage_organization';
75: 
76:     // Plugins
77:     case VIEW_PLUGINS = 'view_plugins';
78:     case MANAGE_PLUGINS = 'manage_plugins';
79: 
80:     // Stock Audits
81:     case VIEW_STOCK_AUDITS = 'view_stock_audits';
82:     case CREATE_STOCK_AUDITS = 'create_stock_audits';
83:     case MANAGE_STOCK_AUDITS = 'manage_stock_audits';
84: 
85:     // Stock Approvals
86:     case APPROVE_STOCK_ADJUSTMENTS = 'approve_stock_adjustments';
87:     case APPROVE_STOCK_TRANSFERS = 'approve_stock_transfers';
88: 
89:     // Warehouse Management
90:     case VIEW_WAREHOUSES = 'view_warehouses';
91:     case CREATE_WAREHOUSES = 'create_warehouses';
92:     case EDIT_WAREHOUSES = 'edit_warehouses';
93:     case DELETE_WAREHOUSES = 'delete_warehouses';
94:     case MANAGE_WAREHOUSE_USERS = 'manage_warehouse_users';
95:     case ACCESS_ALL_WAREHOUSES = 'access_all_warehouses';
96: 
97:     // Returns Management
98:     case MANAGE_RETURNS = 'manage_returns';
99: 
100:     // Shipping
101:     case VIEW_SHIPMENTS = 'view_shipments';
102:     case CREATE_SHIPMENTS = 'create_shipments';
103: 
104:     // Reports & Data
105:     case VIEW_REPORTS = 'view_reports';
106:     case EXPORT_DATA = 'export_data';
107:     case IMPORT_DATA = 'import_data';
108:     case VIEW_ACTIVITY_LOG = 'view_activity_log';
109: 
110:     /**
111:      * Get permission label for display.
112:      *
113:      * @return string
114:      */
115:     public function label(): string
116:     {
117:         return match($this) {
118:             self::VIEW_USERS => 'View Users',
119:             self::CREATE_USERS => 'Create Users',
120:             self::EDIT_USERS => 'Edit Users',
121:             self::DELETE_USERS => 'Delete Users',
122: 
123:             self::VIEW_ROLES => 'View Roles',
124:             self::CREATE_ROLES => 'Create Roles',
125:             self::EDIT_ROLES => 'Edit Roles',
126:             self::DELETE_ROLES => 'Delete Roles',
127: 
128:             self::VIEW_PRODUCTS => 'View Products',
129:             self::CREATE_PRODUCTS => 'Create Products',
130:             self::EDIT_PRODUCTS => 'Edit Products',
131:             self::DELETE_PRODUCTS => 'Delete Products',
132:             self::MANAGE_STOCK => 'Manage Stock',
133:             self::TRANSFER_STOCK => 'Transfer Stock',
134:             self::MANAGE_CATEGORIES => 'Manage Categories',
135:             self::MANAGE_LOCATIONS => 'Manage Locations',
136: 
137:             self::VIEW_CUSTOMERS => 'View Customers',
138:             self::CREATE_CUSTOMERS => 'Create Customers',
139:             self::EDIT_CUSTOMERS => 'Edit Customers',
140:             self::DELETE_CUSTOMERS => 'Delete Customers',
141: 
142:             self::VIEW_SUPPLIERS => 'View Suppliers',
143:             self::CREATE_SUPPLIERS => 'Create Suppliers',
144:             self::EDIT_SUPPLIERS => 'Edit Suppliers',
145:             self::DELETE_SUPPLIERS => 'Delete Suppliers',
146: 
147:             self::VIEW_PURCHASE_ORDERS => 'View Purchase Orders',
148:             self::CREATE_PURCHASE_ORDERS => 'Create Purchase Orders',
149:             self::EDIT_PURCHASE_ORDERS => 'Edit Purchase Orders',
150:             self::DELETE_PURCHASE_ORDERS => 'Delete Purchase Orders',
151:             self::RECEIVE_PURCHASE_ORDERS => 'Receive Purchase Orders',
152:             self::APPROVE_PURCHASE_ORDERS => 'Approve Purchase Orders',
153: 
154:             self::VIEW_ORDERS => 'View Orders',
155:             self::CREATE_ORDERS => 'Create Orders',
156:             self::EDIT_ORDERS => 'Edit Orders',
157:             self::DELETE_ORDERS => 'Delete Orders',
158:             self::APPROVE_ORDERS => 'Approve Orders',
159: 
160:             self::VIEW_PAYMENTS => 'View Payments',
161:             self::RECORD_PAYMENTS => 'Record Payments',
162: 
163:             self::VIEW_STOCK_AUDITS => 'View Stock Audits',
164:             self::CREATE_STOCK_AUDITS => 'Create Stock Audits',
165:             self::MANAGE_STOCK_AUDITS => 'Manage Stock Audits',
166:             self::APPROVE_STOCK_ADJUSTMENTS => 'Approve Stock Adjustments',
167:             self::APPROVE_STOCK_TRANSFERS => 'Approve Stock Transfers',
168: 
169:             self::VIEW_SETTINGS => 'View Settings',
170:             self::EDIT_SETTINGS => 'Edit Settings',
171:             self::MANAGE_ORGANIZATION => 'Manage Organization',
172: 
173:             self::VIEW_PLUGINS => 'View Plugins',
174:             self::MANAGE_PLUGINS => 'Manage Plugins',
175: 
176:             self::VIEW_WAREHOUSES => 'View Warehouses',
177:             self::CREATE_WAREHOUSES => 'Create Warehouses',
178:             self::EDIT_WAREHOUSES => 'Edit Warehouses',
179:             self::DELETE_WAREHOUSES => 'Delete Warehouses',
180:             self::MANAGE_WAREHOUSE_USERS => 'Manage Warehouse Users',
181:             self::ACCESS_ALL_WAREHOUSES => 'Access All Warehouses',
182: 
183:             self::MANAGE_RETURNS => 'Manage Returns',
184: 
185:             self::VIEW_SHIPMENTS => 'View Shipments',
186:             self::CREATE_SHIPMENTS => 'Create Shipments',
187: 
188:             self::VIEW_REPORTS => 'View Reports',
189:             self::EXPORT_DATA => 'Export Data',
190:             self::IMPORT_DATA => 'Import Data',
191:             self::VIEW_ACTIVITY_LOG => 'View Activity Log',
192:         };
193:     }
194: 
195:     /**
196:      * Get permission description.
197:      *
198:      * @return string
199:      */
200:     public function description(): string
201:     {
202:         return match($this) {
203:             self::VIEW_USERS => 'Can view user list and details',
204:             self::CREATE_USERS => 'Can create new users',
205:             self::EDIT_USERS => 'Can edit existing users',
206:             self::DELETE_USERS => 'Can delete users',
207: 
208:             self::VIEW_ROLES => 'Can view roles and permissions',
209:             self::CREATE_ROLES => 'Can create new roles',
210:             self::EDIT_ROLES => 'Can edit existing roles',
211:             self::DELETE_ROLES => 'Can delete roles',
212: 
213:             self::VIEW_PRODUCTS => 'Can view product inventory',
214:             self::CREATE_PRODUCTS => 'Can add new products',
215:             self::EDIT_PRODUCTS => 'Can modify product details',
216:             self::DELETE_PRODUCTS => 'Can remove products',
217:             self::MANAGE_STOCK => 'Can adjust stock levels and manage stock movements',
218:             self::TRANSFER_STOCK => 'Can create and manage stock transfers between locations',
219:             self::MANAGE_CATEGORIES => 'Can create and manage product categories',
220:             self::MANAGE_LOCATIONS => 'Can create and manage storage locations',
221: 
222:             self::VIEW_CUSTOMERS => 'Can view customer list and details',
223:             self::CREATE_CUSTOMERS => 'Can create new customers',
224:             self::EDIT_CUSTOMERS => 'Can edit existing customers',
225:             self::DELETE_CUSTOMERS => 'Can delete customers',
226: 
227:             self::VIEW_SUPPLIERS => 'Can view supplier list and details',
228:             self::CREATE_SUPPLIERS => 'Can create new suppliers',
229:             self::EDIT_SUPPLIERS => 'Can edit existing suppliers',
230:             self::DELETE_SUPPLIERS => 'Can delete suppliers',
231: 
232:             self::VIEW_PURCHASE_ORDERS => 'Can view purchase orders',
233:             self::CREATE_PURCHASE_ORDERS => 'Can create new purchase orders',
234:             self::EDIT_PURCHASE_ORDERS => 'Can edit purchase orders',
235:             self::DELETE_PURCHASE_ORDERS => 'Can delete purchase orders',
236:             self::RECEIVE_PURCHASE_ORDERS => 'Can receive items from purchase orders',
237:             self::APPROVE_PURCHASE_ORDERS => 'Can approve or reject purchase orders that need approval before they are sent',
238: 
239:             self::VIEW_ORDERS => 'Can view orders',
240:             self::CREATE_ORDERS => 'Can create new orders',
241:             self::EDIT_ORDERS => 'Can modify orders',
242:             self::DELETE_ORDERS => 'Can delete orders',
243:             self::APPROVE_ORDERS => 'Can approve or reject orders',
244: 
245:             self::VIEW_PAYMENTS => 'Can view order payments, balances due, and receivables',
246:             self::RECORD_PAYMENTS => 'Can record, void, and refund order payments',
247: 
248:             self::VIEW_STOCK_AUDITS => 'Can view stock audits and cycle counts',
249:             self::CREATE_STOCK_AUDITS => 'Can create new stock audits',
250:             self::MANAGE_STOCK_AUDITS => 'Can manage stock audits, start, complete, and adjust counts',
251:             self::APPROVE_STOCK_ADJUSTMENTS => 'Can approve or reject stock adjustments that need approval before stock changes',
252:             self::APPROVE_STOCK_TRANSFERS => 'Can approve or reject stock transfers that need approval before they ship',
253: 
254:             self::VIEW_SETTINGS => 'Can view system settings',
255:             self::EDIT_SETTINGS => 'Can modify system settings',
256:             self::MANAGE_ORGANIZATION => 'Can manage organization details',
257: 
258:             self::VIEW_PLUGINS => 'Can view installed plugins',
259:             self::MANAGE_PLUGINS => 'Can install, activate, and delete plugins',
260: 
261:             self::VIEW_WAREHOUSES => 'Can view warehouse list and details',
262:             self::CREATE_WAREHOUSES => 'Can create new warehouses',
263:             self::EDIT_WAREHOUSES => 'Can edit warehouse settings',
264:             self::DELETE_WAREHOUSES => 'Can delete warehouses',
265:             self::MANAGE_WAREHOUSE_USERS => 'Can assign and remove users from warehouses',
266:             self::ACCESS_ALL_WAREHOUSES => 'Can view and act on stock in every warehouse, even when assigned to specific ones',
267: 
268:             self::MANAGE_RETURNS => 'Can create and manage returns and exchanges',
269: 
270:             self::VIEW_SHIPMENTS => 'Can view order shipments, tracking, and shipping labels',
271:             self::CREATE_SHIPMENTS => 'Can create shipments, buy and void shipping labels, and mark orders shipped',
272: 
273:             self::VIEW_REPORTS => 'Can view system reports',
274:             self::EXPORT_DATA => 'Can export data from the system',
275:             self::IMPORT_DATA => 'Can import data into the system',
276:             self::VIEW_ACTIVITY_LOG => 'Can view activity and audit logs',
277:         };
278:     }
279: 
280:     /**
281:      * Get permission category.
282:      *
283:      * @return string
284:      */
285:     public function category(): string
286:     {
287:         return match($this) {
288:             self::VIEW_USERS, self::CREATE_USERS, self::EDIT_USERS, self::DELETE_USERS => 'User Management',
289:             self::VIEW_ROLES, self::CREATE_ROLES, self::EDIT_ROLES, self::DELETE_ROLES => 'Role Management',
290:             self::VIEW_PRODUCTS, self::CREATE_PRODUCTS, self::EDIT_PRODUCTS, self::DELETE_PRODUCTS,
291:             self::MANAGE_STOCK, self::TRANSFER_STOCK, self::MANAGE_CATEGORIES, self::MANAGE_LOCATIONS,
292:             self::VIEW_STOCK_AUDITS, self::CREATE_STOCK_AUDITS, self::MANAGE_STOCK_AUDITS,
293:             self::APPROVE_STOCK_ADJUSTMENTS, self::APPROVE_STOCK_TRANSFERS => 'Inventory Management',
294:             self::VIEW_CUSTOMERS, self::CREATE_CUSTOMERS, self::EDIT_CUSTOMERS, self::DELETE_CUSTOMERS => 'Customer Management',
295:             self::VIEW_SUPPLIERS, self::CREATE_SUPPLIERS, self::EDIT_SUPPLIERS, self::DELETE_SUPPLIERS => 'Supplier Management',
296:             self::VIEW_PURCHASE_ORDERS, self::CREATE_PURCHASE_ORDERS, self::EDIT_PURCHASE_ORDERS,
297:             self::DELETE_PURCHASE_ORDERS, self::RECEIVE_PURCHASE_ORDERS,
298:             self::APPROVE_PURCHASE_ORDERS => 'Purchase Order Management',
299:             self::VIEW_ORDERS, self::CREATE_ORDERS, self::EDIT_ORDERS, self::DELETE_ORDERS,
300:             self::APPROVE_ORDERS => 'Order Management',
301:             self::VIEW_PAYMENTS, self::RECORD_PAYMENTS => 'Payments',
302:             self::VIEW_WAREHOUSES, self::CREATE_WAREHOUSES, self::EDIT_WAREHOUSES,
303:             self::DELETE_WAREHOUSES, self::MANAGE_WAREHOUSE_USERS, self::ACCESS_ALL_WAREHOUSES => 'Warehouse Management',
304:             self::MANAGE_RETURNS => 'Returns Management',
305:             self::VIEW_SHIPMENTS, self::CREATE_SHIPMENTS => 'Shipping',
306:             self::VIEW_SETTINGS, self::EDIT_SETTINGS, self::MANAGE_ORGANIZATION => 'Settings',
307:             self::VIEW_PLUGINS, self::MANAGE_PLUGINS => 'Plugins',
308:             self::VIEW_REPORTS, self::EXPORT_DATA, self::IMPORT_DATA, self::VIEW_ACTIVITY_LOG => 'Reports & Data',
309:         };
310:     }
311: 
312:     /**
313:      * Get all permissions grouped by category.
314:      *
315:      * @return array<string, array<int, array{value: string, label: string, description: string}>>
316:      */
317:     public static function grouped(): array
318:     {
319:         $grouped = [];
320:         foreach (self::cases() as $permission) {
321:             $category = $permission->category();
322:             $grouped[$category][] = [
323:                 'value' => $permission->value,
324:                 'label' => $permission->label(),
325:                 'description' => $permission->description(),
326:             ];
327:         }
328: 
329:         // Permissions registered by active plugins (register_permission()),
330:         // after the core ones; a plugin's own category becomes a new group.
331:         foreach (self::pluginRegistry()?->grouped() ?? [] as $category => $permissions) {
332:             $grouped[$category] = [...($grouped[$category] ?? []), ...$permissions];
333:         }
334: 
335:         return $grouped;
336:     }
337: 
338:     /**
339:      * Every grantable permission name: the core cases, then the permissions
340:      * registered by active plugins.
341:      *
342:      * @return array<int, string>
343:      */
344:     public static function values(): array
345:     {
346:         return [
347:             ...array_column(self::cases(), 'value'),
348:             ...(self::pluginRegistry()?->names() ?? []),
349:         ];
350:     }
351: 
352:     /**
353:      * Whether a name is a core permission or one an active plugin registered.
354:      */
355:     public static function isKnown(string $name): bool
356:     {
357:         return self::tryFrom($name) !== null || (self::pluginRegistry()?->has($name) ?? false);
358:     }
359: 
360:     private static function pluginRegistry(): ?PluginPermissionRegistry
361:     {
362:         return function_exists('app') && app()->bound(PluginPermissionRegistry::class)
363:             ? app(PluginPermissionRegistry::class)
364:             : null;
365:     }
366: }
```

