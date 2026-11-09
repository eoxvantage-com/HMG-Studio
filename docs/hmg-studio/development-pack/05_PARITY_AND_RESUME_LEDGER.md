# Persistent Parity and Resume Ledger

## Latest workflow-atlas resume - 2026-11-07

See the [complete F01-F24 crosswalk](../WORKFLOW_ATLAS_VERIFICATION.md): **all 24 flows accounted for, zero full E2E workflows accepted**. Existing partial read/report/native-identity features are not stock/money/lifecycle execution proof. The only production correction in this audit is the dashboard's fail-closed handling of missing/invalid facts (no assumed currency/active state, null-to-zero money or legacy-price fallback). Explicit zero and excluded inactive/cancelled rows remain valid.

Independent review and RED/GREEN evidence are preserved: dashboard 115 tests, full backend 459, frontend 251/32 and both TypeScript configurations passed. [Regression evidence](../evidence/workflow-atlas-regressions.json). Resume from the crosswalk's ordered platform/authorization/transaction gates; do not enable unsupported commands or infer live deployment/browser acceptance from local tests. The private dashboard function is now version 3: ordinary hmg.john before/after projection hashes match and negative checks pass. Preserve the [original byte-mismatch journal](../evidence/workflow-atlas-dashboard-deploy.json) alongside its [terminal-LF/identical-AST reconciliation](../evidence/workflow-atlas-dashboard-reconciliation.json), [after execution](../evidence/workflow-dashboard-after.json) and [negative proof](../evidence/workflow-dashboard-negative-checks.json). Frontend deployment is unchanged; no browser acceptance. Use the existing Pradeep account for requested admin work; do not create new users in this follow-up or treat admin success as team-role authorization proof. Existing SDK CRUD is supported; Console/org-access accounts and API keys bypass row policies, and `_allowed_actions` is only a display hint with writes rechecked. See the [current primary-doc findings](../WORKFLOW_ATLAS_VERIFICATION.md#current-native-sdk-and-authorization-findings) before further authorization work. Earlier checkpoints below remain historical.

## Compact inventory and bounded reports - 2026-11-07

**Implemented and locally/API verified; not full-module acceptance.** Earlier dated checkpoints remain historical.

- Inventory prioritizes stock-by-location and suppliers, adds capability-relevant variants/assembly/serial/batch sections, and keeps remaining relations behind **More related data**. Expanding a panel still owns its query; unloaded counts are unknown, not zero. The accessible stock chart reuses the displayed stock page and table, not another query or a page-derived product total.
- `/reports` now generates four fixed operational views: sales orders, purchase orders, customer payments and stock adjustments. An authorized organization is required; only organization lookup runs before **Generate**. Complete caller-visible results are bounded to **500 rows**, with stable ID ordering and fail-closed pagination checks. Saved definitions remain secondary at `/reports?view=definitions`; arbitrary saved configurations/SQL are not executed.
- Existing lists export mapped current-page/current-record values. Reports export the **complete generated bounded result**, not only its table preview page, using the existing CSV/HMG print-preview helper. Neither path claims an issued invoice, delivery/email, arbitrary all-database export, atomic snapshot or recognized revenue.
- **228 frontend tests /31 files passed (552.90s)**; both TypeScript configurations passed. [Frontend evidence](../evidence/operational-frontend-verification.json). [Ordinary SDK/provider proof](../evidence/operational-reports-live.json): all four report kinds succeeded over eight authorized reads, without admin fallback. Broader backend/enrichment/deployment status belongs to the [operational release record](../OPERATIONAL_WORKSPACE_RELEASE.md).
- Native C/U/D, transaction atomicity and full 32-module/E01-E12 acceptance remain separate gates. This checkpoint makes no browser, visual, build, deployment or all-CRUD acceptance claim.

### Current resume point

1. Preserve compact inventory and the four bounded report generators; keep existing current-page exports distinct from complete generated-report exports. Do not reintroduce hidden relation queries or page-derived overall totals.
2. Preserve the 228-test/typecheck baseline and explicit ordinary-provider read evidence. Native user identity still uses the dedicated provider; no role/source switch occurred.
3. Follow the operational release record for separately owned enrichment, backend and deployment evidence. Historical/sample records are not executed business workflows.
4. Continue native write authorization, transactional guarantees, source parity, custom reports/schedules/delivery and general all-filtered export without weakening current gates. Browser/full-module acceptance remains unproved.

## Latest sectioned workspace checkpoint - 2026-11-06

**Implemented/read-verified, not full-module acceptance.** This supersedes earlier detail-tab presentation and test totals; prior evidence remains historical.

- **UI:** grouped business details and persisted-value summary cards replace generic horizontal detail tabs/raw-field cards. Related accordions mount paginated queries only when expanded. Shared bounded FK name lookups, multi-field server search, semantic statuses and real registered-record links reuse existing Refine query owners. Inventory keeps its specialized overview; Categories adds cards/table views; Approvals remains read-only.
- **Exports:** mapped visible current-page/current-record CSV and HMG-branded print previews (including browser Print-to-PDF) cover generic views/related lists, Inventory/stock/suppliers, Categories and personal Notifications. Identity/error gates, formula escaping and size bounds apply. No hidden-field, all-filtered, issued-invoice, email or payment-proof claim.
- **Verified:** independent review followed by **187 frontend tests /29 files** (273.68s), **250 Python tests** (5.79s), and both TypeScript configurations exit 0. [Final verification](../evidence/sectioned-workspace-verification.json). No browser/visual acceptance, build, deployment or commit.
- **Synthetic data:** **60 transaction headers +75 supporting rows =135 rows /19 tables**, May-October 2026. Six new fictional products comprise four illustrated slabs and two assemblies; existing catalogue references remain separate. Ordinary-session exact readback verified all 135 rows, four private JPEG downloads matched SHA, and 58/58 bounded advisory checks matched. These are historical snapshots, **not executed stock/payment/approval workflows**. [Readback](../evidence/historical-60-normal-readback.json), [images](../evidence/historical-60-normal-images.json), [policy checks](../evidence/historical-60-normal-policy.json).
- **Remaining:** seven exact-ID child READ policy changes added no C/U/D authority. Native ordinary customer POST 403 remains a provider blocker; original-row authority, atomicity/concurrency/idempotency/rollback and full source parity remain unproved. Platform event subscriptions were empty, but physical database triggers were not verified. Full-filter export, operational workflows and all-module/E01-E12 acceptance remain open.

### Latest sectioned resume

1. Preserve 135 ordinary-verified historical rows, four illustrative private images and seven exact-ID read-only policy changes; never relabel snapshots as executed commands. Prior 76 sample rows and 263 catalogue references remain separately accounted.
2. Resolve ordinary customer POST 403 through the native provider contract; do not repeat disproven policy widening or bypass with admin browser credentials. Keep create/update/delete gates closed until operation-specific proof.
3. Prove native transaction authorization, original/proposed-row invariants, direct-write protection, idempotency, concurrency and rollback before stock/money, approval or fulfillment commands.
4. Complete full source-field/action parity, all-filtered exports and operational documents/delivery. Current CSV/print is visible-page/record snapshot only. Native user/role admin, portal, carrier/email, reports/schedules, storage lifecycle and remaining 32-module requirements are still open.
5. Browser/visual/accessibility/E2E, build/deployment and full module/E01-E12 acceptance were not performed. Resume from [sectioned execution plan](../SECTIONED_WORKSPACE_EXECUTION_PLAN.md), not older historical blockers already repaired by typed JSON additions.

## Prior product workspace checkpoint - 2026-11-06

This checkpoint supersedes historical navy/blue styling, 122/107 test totals, pending JSON fixtures and storage-unavailable statements below. **No complete module or E01-E12 chain is accepted.**

- **Implemented:** scoped Ant Design 5 / ProComponents inventory pilot, retaining React 18, Refine 5, native session/auth/providers and existing mutation notifications. Controlled server search/filter/sort/pagination uses one products query. Product detail reuses the parent record for stock/price/cost/value and grouped metadata, image, explicitly labelled SKU barcode preview, QR and print; warehouse stock/supplier views resolve names. All generic related tabs are reachable and only the selected panel queries; unknown/partial totals are not zero. The shell uses shared olive/ivory tokens and the unmodified official website logo; palette inspiration is not an official brand specification.
- **Verified locally after independent review:** **152 frontend tests /25 files**, 320.92s (`.cache/product-workspace-vitest-final.log`); both TypeScript configurations exit 0 (`.cache/product-workspace-typecheck-final.log`); **208 Python tests**, 4.08s, exit 0 (`.cache/product-workspace-pytest-final.log`, `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend -q`). Python comprises 200 backend/tests plus 8 schema tests. Earlier 207/181/107 and focused counts are historical/subsets, not additive. [Persisted final verification](../evidence/product-workspace-verification.json).
- **Live catalogue:** 263 deterministic `HMG-WEB-*` reference products imported with native create/readback and ordinary-session list HTTP 200/total 263. They are inactive public-catalogue references, not physical inventory; stock 0 and required legacy price 0 are technical placeholders, selling/purchase prices are null. UI suppresses reference stock/value and never treats legacy price 0 as a quotation. [Import evidence](../evidence/hmg-catalogue-import.json), [normal read](../evidence/hmg-catalogue-normal-read.json).
- **Targeted JSON repair:** four nullable native fields added without changing legacy TEXT/`any` columns: saved_reports `columns_json` (array of strings), `filters_json` (object with items array), `sort_json` (object), activity_logs `properties_json` (object). Existing synthetic report received only new fields; one missing deterministic activity fixture was inserted. Exact native types/values read back, including ordinary-session HTTP 200. Structured detail rendering is read-only, bounded and redacts sensitive values; it does not execute report configuration. Seeder maps only missing fixture writes and strictly compares both typed and present legacy values. [Migration](../evidence/structured-json-20261106T184314271383Z.json), [normal read](../evidence/structured-json-normal-read.json).
- **Accounting:** 62 business tables; prior verified 895 fields plus four additive fields = 899 (190 FKs/324 indexes unchanged by this patch). The separate QA diagnostic table is not a 63rd business resource. Seed scope now has 76 retained rows: prior 74 semantically verified plus repaired report 1 and new activity 1. The 263 catalogue references and diagnostic row are separate populations, not an asserted global database count. Historical frozen-plan readback is preserved; typed-wire acceptance supersedes only the two targeted JSON cases.
- **Private media:** authenticated private-image component is implemented with identity/revocation gates, raster MIME/size checks and object-URL cleanup. One ordinary QA object read returned 200, exact SHA and 53,083 bytes; anonymous 401. Existing storage policy permits authenticated reads, **not organization-scoped reads**. Final delivery verified **252 unique private products-bucket objects and 263 owned product image links** (last link run 262 updates  + 1 exact probe skip). Only `image` was patched; all other fields except server `updated_at` were preserved. Ordinary QA linked-prefix query returned HTTP 200/total 263; one linked product and its private bytes returned 200 with exact SHA. The separate `Images` bucket remains untouched/reserved. Storage collision atomicity and image-PATCH CAS remain unproved. [Delivery](../evidence/hmg-catalogue-delivery-summary.json), [ordinary linked count](../evidence/private-media-linked-normal-count.json), [linked byte proof](../evidence/private-media-linked-normal-read.json). [Bounded session proof](../evidence/private-media-normal-read.json).
- **Still blocked:** native customer POST 403 despite advisory ALLOW, including a bounded zero-string diagnostic; policy was restored exactly and readback remained empty. No frontend write gate was enabled. Original-row/update authority, generic deletion, stock/money atomicity/rollback/idempotency/concurrency, remaining module workflows and full source parity are unproved. [Provider escalation](../evidence/native-create-provider-escalation.md), [diagnostic rollback](../evidence/customer-zero-string-policy-test.json). No browser/computer use, build, deployment, commit or full-module completion in this slice.

## Historical continuation record

Working implementation ledger, updated 2026-11-06. This is not a completion claim. Expand each source page into field, modal, validation, permission, action and transition subrows while implementing. Preserve IDs across sessions.

**Scope checklist:** [all files/modules/phases/chains](../IMPLEMENTATION_CHECKLIST.md), [source contracts](../checklists/SOURCE_CONTRACTS.md), [specification gates](../checklists/SPECIFICATION_GATES.md). This ledger remains the status authority. Earlier checkpoints below are historical; the latest sectioned workspace checkpoint at the top supersedes them. No module is fully accepted.

## Module status

| ID | Specification | Implementation | Local tests | Backend readback | Browser | Remaining / blocker | Next action |
|---|---|---|---|---|---|---|---|
| 10 | [Dashboard](modules/10_dashboard.md) | Partial: Existing responsive dashboard + private projection; no new live totals claimed | Full187 frontend/250 Python; focused counts overlap | Private v2 normal-session HTTP 200; no browser acceptance | No module E2E acceptance | Remaining dashboard source filters/KPIs and full-data authorization proof | Follow latest sectioned resume below |
| 11 | [Inventory / Products](modules/11_inventory.md) | Partial: Specialized Inventory overview, lazy related sections and mapped page exports; guarded forms | 24 shared integration tests; full187 frontend | 263 reference imports retained; six separate fictional products and four image reads verified; ordinary writes blocked | No module E2E acceptance | Variants/options/BOM/tracking/full fields, replenishment, reset and lifecycle parity | Follow latest sectioned resume below |
| 12 | [Orders, Payments and Documents](modules/12_orders.md) | Partial: Sectioned order details, summaries, lazy lines/payments and scoped exports | Shared engine tests | Ordinary reads:16 historical orders +14 payments; not executed commands | No module E2E acceptance | Order creation/edit/status, payment/refund, documents, atomic stock and financial effects | Follow latest sectioned resume below |
| 13 | [Customers](modules/13_customers.md) | Partial: Grouped customer details, related orders, server search and scoped exports; guarded forms | Shared engine tests | Six new historical customer reads verified; ordinary customer POST403 remains blocked | No module E2E acceptance | Full fields, related orders, credit/account workflows and portal contracts | Follow latest sectioned resume below |
| 14 | [Returns / RMA](modules/14_returns.md) | Partial: Grouped return details/related lines and scoped exports | Shared engine tests | Four historical return snapshots read back; operational eligibility/receipt not executed | No module E2E acceptance | Shipped eligibility, request/approval/receive/restock/complete and separate refunds | Follow latest sectioned resume below |
| 15 | [Purchase Orders](modules/15_purchase_orders.md) | Partial: Sectioned PO details/related lines and scoped exports | Shared engine tests | Ten historical POs read back; no send/receipt execution | No module E2E acceptance | Draft line editing, approval/send/receive, cost/stock/receipt atomicity | Follow latest sectioned resume below |
| 16 | [Suppliers](modules/16_suppliers.md) | Partial: Grouped supplier details/related terms and scoped exports; guarded forms | Shared engine tests | Three historical suppliers read back; actual ordinary create unproved/blocked | No module E2E acceptance | Full contact/product/supplier history, purchase integration and acceptance | Follow latest sectioned resume below |
| 17 | [Approvals](modules/17_approvals.md) | Partial: Four pending-only read queues, real-document View links and scoped exports | Approval/integration regressions in full187 | Schema confirmed; no decision authority claimed | No module E2E acceptance | Reviewer-assigned queue, My requests, submit/approve/reject/self-approval rules | Follow latest sectioned resume below |
| 18 | [Categories](modules/18_categories.md) | Partial: Existing category cards/table, search/filter/pagination and displayed-field exports | Category/export regressions in full187 | Historical read-only containment; mutations blocked | No module E2E acceptance | B01-B03 isolation/scanner/direct validation, counts, edits/deletes and concurrency | Follow latest sectioned resume below |
| 19 | [Locations](modules/19_locations.md) | Partial: Grouped location details, lazy relations and scoped exports; guarded form | Shared engine tests | Reused schema confirmed; write gate closed | No module E2E acceptance | Warehouse/bin scope, complete fields and safe authorized mutations | Follow latest sectioned resume below |
| 20 | [Warehouses](modules/20_warehouses.md) | Partial: Warehouse list/detail + disabled/guarded master form | Shared engine tests | Reused schema confirmed; write gate closed | No module E2E acceptance | Warehouse access, defaults and safe authorized mutations | Follow latest sectioned resume below |
| 21 | [Stock Adjustments](modules/21_stock_adjustments.md) | Partial: Grouped adjustment history and scoped exports; pending requests stay distinct | Shared engine + approval tests | Eight historical adjustment snapshots read back; no posting execution | No module E2E acceptance | Request/approve/post adjustment, tracking and atomic reconciliation | Follow latest sectioned resume below |
| 22 | [Stock by Warehouse](modules/22_stock_by_warehouse.md) | Partial: Resolved location/warehouse stock views and scoped exports | Shared engine tests | Twelve synthetic location-stock snapshots read back; no all-stock completeness claim | No module E2E acceptance | Warehouse aggregation, variants, reservations and full availability projection | Follow latest sectioned resume below |
| 23 | [Stock Transfers](modules/23_stock_transfers.md) | Partial: Grouped transfer detail, lazy lines and scoped exports | Shared engine + approval tests | Four historical transfer snapshots read back; no stock movement command | No module E2E acceptance | Draft line edit/approval/send/receive/cancel and atomic reservation/stock movement | Follow latest sectioned resume below |
| 24 | [Stock Audits and Cycle Counts](modules/24_stock_audits.md) | Partial: Audit list/detail read-only | Shared engine tests | Schema confirmed only | No module E2E acceptance | Count entry/history/revisions, review/recount, reconciliation and scheduling | Follow latest sectioned resume below |
| 25 | [Work Orders / Assembly](modules/25_work_orders.md) | Partial: Grouped work-order detail/related lines and scoped exports | Shared engine + seed tests | Four historical work orders plus items/outputs read back; no consumption command | No module E2E acceptance | BOM/variant selection, allocation, start/complete/cancel and atomic consumption/output | Follow latest sectioned resume below |
| 26 | [Reservations](modules/26_reservations.md) | Partial: Reservation list/detail read-only | Shared engine tests | Schema confirmed only | No module E2E acceptance | Expiry/allocation/release and concurrency-safe available stock | Follow latest sectioned resume below |
| 27 | [Import / Export](modules/27_import_export.md) | Partial: Generic export-history reads plus visible-page/record CSV and branded print previews | Export security/mapping regressions in full187 | Schema confirmed only | No module E2E acceptance | Full-filter exports, upload/import preview/validation/commit, issued documents and durable jobs | Follow latest sectioned resume below |
| 28 | [Reports, Builder and Schedules](modules/28_reports.md) | Partial: Typed saved-report configuration read-only; dashboard projection separate | Bounded decoder/redaction tests | Four-field additive repair; report native typed readback 200 | No module E2E acceptance | Report builder/preview, all analytics, sharing/export and schedules | Follow latest sectioned resume below |
| 29 | [Activity Log](modules/29_activity_log.md) | Partial: Typed activity properties read-only | Strict typed-wire/decoder tests | Synthetic activity typed readback 200; not a business event | No module E2E acceptance | Complete filters/actor resolution/before-after, append-only service events and export | Follow latest sectioned resume below |
| 30 | [Admin Users](modules/30_users.md) | Partial: Native user provider list/detail, no credentials or mutations | 5 native management tests (shared with roles) | Native provider contract; live administration not proven | No module E2E acceptance | User invite/create/edit/status/security actions and native role assignments | Follow latest sectioned resume below |
| 31 | [Roles and Permission Sets](modules/31_roles_permissions.md) | Partial: Native app roles read-only; unsupported query controls disclosed | 5 native management tests (shared with users) | Scoped QA policies/role 1156 verified; general membership unverified | No module E2E acceptance | Role/policy editing, assignment/revocation, complete denial matrix and admin parity | Follow latest sectioned resume below |
| 32 | [Authentication, Profile and Account](modules/32_auth_account.md) | Partial: Session foundation + native preference editing retained | Existing account/foundation tests | Prior dedicated QA preference save/readback passed | No module E2E acceptance | Profile/MFA/password/language/notifications and full account-flow acceptance | Follow latest sectioned resume below |
| 33 | [Organization, Email and Preferences](modules/33_organization_settings.md) | Partial: Organization records read-only; app-settings context retained | Shared engine tests | Reused schema confirmed; general membership unresolved | No module E2E acceptance | Organization preferences/email/branding/admin and complete settings validation | Follow latest sectioned resume below |
| 34 | [Notifications](modules/34_notifications.md) | Partial: Personal inbox/bell plus displayed-field page export; existing owner gates | Notification regressions included in full187 | Own list/detail 200, foreign list 0/detail 403; exact two-QA owner policy | No module E2E acceptance | Mark read/delete, preferences, committed-event generation and delivery/outbox proof; no C/U/D grant | Follow latest sectioned resume below |
| 35 | [Shipping and Carrier Services](modules/35_shipping.md) | Partial: Shipment list/detail read-only | Shared engine + inert fixture tests | Schema and synthetic manual shipment readback verified | No module E2E acceptance | Shipment actions, labels/carrier/rates/tracking and provider/email integration | Follow latest sectioned resume below |
| 36 | [Storage, Uploads and Downloads](modules/36_storage.md) | Partial: Authenticated private product-image reads; generic file manager remains unavailable | Private-image9 regressions; media helper tests | 252 private catalogue objects retained; four new sample slab downloads200/exactSHA; no new storage authority | No module E2E acceptance | Buckets, authorized upload/download, attachment ownership and file lifecycle | Follow latest sectioned resume below |
| 37 | [API Tokens, Webhooks and External Interfaces](modules/37_api_webhooks.md) | Partial: Webhook configuration rows read-only | Shared engine tests | Schema confirmed only | No module E2E acceptance | API credentials, webhook registration/signatures/retry/delivery; no active integrations | Follow latest sectioned resume below |
| 38 | [Customer Portal](modules/38_customer_portal.md) | Partial: Customer contact records read-only | Shared engine tests | Schema confirmed only | No module E2E acceptance | Invitations, native customer-scoped login/authorization and portal workflows | Follow latest sectioned resume below |
| 39 | [Extensions, Plugins and Tax Documents](modules/39_plugins_tax.md) | Partial: Plugin records read-only | Shared engine tests | Schema confirmed only | No module E2E acceptance | Explicitly approved plugin activation/settings/tax and external-provider behavior | Follow latest sectioned resume below |
| 40 | [Provisioning, Updates, Backups and Recovery](modules/40_operations.md) | Partial: Inventory-reset history rows read-only | Shared engine tests | Schema confirmed only | No module E2E acceptance | Provisioning/update/backup/restore/health/recovery; no destructive commands | Follow latest sectioned resume below |
| 41 | [Replenishment and Reorder Policies](modules/41_replenishment.md) | Partial: Warehouse reorder-point rows read-only | Shared engine + fixture tests | Schema confirmed only | No module E2E acceptance | Variant/supplier/location policies, suggestions and authorized draft PO linkage | Follow latest sectioned resume below |



## Source page traceability

| Source page | Module | Exact target route/file | Fields/actions mapped | Acceptance evidence | Status |
|---|---|---|---|---|---|
| `resources/js/Pages/Dashboard.vue` | 10 | Pending | Pending | None | Pending |
| `resources/js/Pages/Products/Create.vue` | 11 | Pending | Pending | None | Pending |
| `resources/js/Pages/Products/Edit.vue` | 11 | Pending | Pending | None | Pending |
| `resources/js/Pages/Products/Index.vue` | 11 | `/inventory`; `src/pages/erp/inventory.tsx` | Server search/status/sort/page, reference semantics; full parity pending | Inventory 22 focused; full152 frontend | Partial; no browser acceptance |
| `resources/js/Pages/Products/ResetStock.vue` | 11 | Pending | Pending | None | Pending |
| `resources/js/Pages/Products/ResetStockStatus.vue` | 11 | Pending | Pending | None | Pending |
| `resources/js/Pages/Products/Show.vue` | 11 | `/inventory/show/:id`; existing generic parent + inventory.tsx | Grouped pricing/stock/media/identity, lazy relations; full parity pending | Inventory 22 focused; private-image 9 | Partial; writes/browser acceptance pending |
| `resources/js/Pages/Orders/Create.vue` | 12 | Pending | Pending | None | Pending |
| `resources/js/Pages/Orders/Edit.vue` | 12 | Pending | Pending | None | Pending |
| `resources/js/Pages/Orders/Index.vue` | 12 | Pending | Pending | None | Pending |
| `resources/js/Pages/Orders/Show.vue` | 12 | Pending | Pending | None | Pending |
| `resources/js/Pages/Customers/Create.vue` | 13 | Pending | Pending | None | Pending |
| `resources/js/Pages/Customers/Edit.vue` | 13 | Pending | Pending | None | Pending |
| `resources/js/Pages/Customers/Index.vue` | 13 | Pending | Pending | None | Pending |
| `resources/js/Pages/Customers/Show.vue` | 13 | Pending | Pending | None | Pending |
| `resources/js/Pages/Returns/Create.vue` | 14 | Pending | Pending | None | Pending |
| `resources/js/Pages/Returns/Index.vue` | 14 | Pending | Pending | None | Pending |
| `resources/js/Pages/Returns/SelectOrder.vue` | 14 | Pending | Pending | None | Pending |
| `resources/js/Pages/Returns/Show.vue` | 14 | Pending | Pending | None | Pending |
| `resources/js/Pages/PurchaseOrders/Create.vue` | 15 | Pending | Pending | None | Pending |
| `resources/js/Pages/PurchaseOrders/Edit.vue` | 15 | Pending | Pending | None | Pending |
| `resources/js/Pages/PurchaseOrders/Index.vue` | 15 | Pending | Pending | None | Pending |
| `resources/js/Pages/PurchaseOrders/Receive.vue` | 15 | Pending | Pending | None | Pending |
| `resources/js/Pages/PurchaseOrders/Show.vue` | 15 | Pending | Pending | None | Pending |
| `resources/js/Pages/Suppliers/Create.vue` | 16 | Pending | Pending | None | Pending |
| `resources/js/Pages/Suppliers/Edit.vue` | 16 | Pending | Pending | None | Pending |
| `resources/js/Pages/Suppliers/Index.vue` | 16 | Pending | Pending | None | Pending |
| `resources/js/Pages/Suppliers/Show.vue` | 16 | Pending | Pending | None | Pending |
| `resources/js/Pages/Approvals/Index.vue` | 17 | Pending | Pending | None | Pending |
| `resources/js/Pages/Categories/Index.vue` | 18 | Planned src/pages/categories/index.tsx; not routed | Draft create/readback contract only | 12 Python pass; 9 frontend/service RED; registration rejected | Incomplete/blocked; no business UI delivered |
| `resources/js/Pages/Locations/Index.vue` | 19 | Pending | Pending | None | Pending |
| `resources/js/Pages/Warehouses/Create.vue` | 20 | Pending | Pending | None | Pending |
| `resources/js/Pages/Warehouses/Edit.vue` | 20 | Pending | Pending | None | Pending |
| `resources/js/Pages/Warehouses/Index.vue` | 20 | Pending | Pending | None | Pending |
| `resources/js/Pages/Warehouses/Show.vue` | 20 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAdjustments/Create.vue` | 21 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAdjustments/Index.vue` | 21 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAdjustments/Show.vue` | 21 | Pending | Pending | None | Pending |
| `resources/js/Pages/Stock/Index.vue` | 22 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockTransfers/Create.vue` | 23 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockTransfers/Index.vue` | 23 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockTransfers/Show.vue` | 23 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAudits/CountHistory.vue` | 24 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAudits/Create.vue` | 24 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAudits/CycleCounts/Form.vue` | 24 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAudits/CycleCounts/Index.vue` | 24 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAudits/Edit.vue` | 24 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAudits/Index.vue` | 24 | Pending | Pending | None | Pending |
| `resources/js/Pages/StockAudits/Show.vue` | 24 | Pending | Pending | None | Pending |
| `resources/js/Pages/WorkOrders/Create.vue` | 25 | Pending | Pending | None | Pending |
| `resources/js/Pages/WorkOrders/Index.vue` | 25 | Pending | Pending | None | Pending |
| `resources/js/Pages/WorkOrders/Show.vue` | 25 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reservations/Index.vue` | 26 | Pending | Pending | None | Pending |
| `resources/js/Pages/ImportExport/Index.vue` | 27 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/AbcAnalysis.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/BatchExpiry.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/Builder/Create.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/Builder/Edit.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/Builder/Index.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/Builder/Show.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/CategoryPerformance.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/DeadStock.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/Index.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/InventoryTurnover.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/InventoryValuation.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/LowStock.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/ProfitMargin.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/Receivables.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/SalesAnalysis.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/SalesByLocation.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Reports/StockMovement.vue` | 28 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/ActivityLog/Index.vue` | 29 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/Users/Create.vue` | 30 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/Users/Edit.vue` | 30 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/Users/Index.vue` | 30 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/Users/Show.vue` | 30 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/Roles/Create.vue` | 31 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/Roles/Edit.vue` | 31 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/Roles/Index.vue` | 31 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/Roles/Show.vue` | 31 | Pending | Pending | None | Pending |
| `resources/js/Pages/Auth/ConfirmPassword.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Auth/ForgotPassword.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Auth/Login.vue` | 32 | `src/pages/login/index.tsx`, `src/components/auth/LoginRedirect.tsx`, `src/App.tsx`, `src/taruviClient.ts` | Partial native hosted-sign-in foundation | Local auth shell/provider tests only | Live hosted login and remaining source-account behaviors |
| `resources/js/Pages/Auth/Register.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Auth/ResetPassword.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Auth/TwoFactorChallenge.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Auth/TwoFactorSetup.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Auth/VerifyEmail.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Errors/403.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Profile/Edit.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Profile/Partials/DeleteUserForm.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Account/Index.vue` | 32 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Email.vue` | 33 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Index.vue` | 33 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Organization/Index.vue` | 33 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Partials/EmailConfiguration.vue` | 33 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Partials/NotificationPreferences.vue` | 33 | Pending | Pending | None | Pending |
| `resources/js/Pages/Notifications/Index.vue` | 34 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Shipping.vue` | 35 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Storage.vue` | 36 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/ApiTokens/Index.vue` | 37 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Webhooks/Index.vue` | 37 | Pending | Pending | None | Pending |
| `resources/js/Pages/Settings/Webhooks/Show.vue` | 37 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Auth/AcceptInvitation.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Auth/ForgotPassword.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Auth/Login.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Auth/ResetPassword.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Dashboard.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Orders/Index.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Orders/Show.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Returns/Create.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Returns/Index.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Portal/Returns/Show.vue` | 38 | Pending | Pending | None | Pending |
| `resources/js/Pages/Plugins/Index.vue` | 39 | Pending | Pending | None | Pending |
| `resources/js/Pages/Admin/Update/Index.vue` | 40 | Pending | Pending | None | Pending |
| `resources/js/Pages/Install/Admin.vue` | 40 | Pending | Pending | None | Pending |
| `resources/js/Pages/Install/Complete.vue` | 40 | Pending | Pending | None | Pending |
| `resources/js/Pages/Install/Database.vue` | 40 | Pending | Pending | None | Pending |
| `resources/js/Pages/Install/Requirements.vue` | 40 | Pending | Pending | None | Pending |
| `resources/js/Pages/Install/Welcome.vue` | 40 | Pending | Pending | None | Pending |
| `resources/js/Pages/Inventory/VariantReplenishment.vue` | 41 | Pending | Pending | None | Pending |

## Intentional deviation / native equivalent register

| Source behavior | Reason for deviation | Target equivalent | Approval | Test / evidence | Residual gap |
|---|---|---|---|---|---|
| Populate only when required | Explicit | Explicit | Pending | Pending | Explicit |

## Foundation field/action/state subledger

| Stable ID | Contract | Exact owner | Verification | Status / remaining |
|---|---|---|---|---|
| FND-01 | Browser credentials: server API key must not enter SDK config | `src/taruviClient.ts` | Absent-key and real SDK `getConfig()` tests | Local pass; deployment bundle audit not run |
| FND-02 | Public build configuration: legacy VITE credential variables cannot auto-export | `vite.config.ts`, `src/vite-env.d.ts` | Sentinel-only config allowlist regression; no real secrets in test inputs | Local pass; existing deployed assets not inspected |
| FND-03 | Unauthenticated root/login: no protected navigation/settings mount | `src/App.tsx` | Actual Refine guard with controlled auth provider at `/` and `/login` | Local pass; live browser pending |
| FND-04 | Pending auth: visible loading state, no protected fetch/early login | `src/App.tsx` | Actual guard pending-promise test | Local pass |
| FND-05 | Accepted session: existing shell mounts | `src/App.tsx` | Actual guard accepted-session test | Local pass; provider mocked at transport boundary |
| FND-06 | Missing/server-rejected token denied; 403 preserves session | existing `src/providers/refineProviders.ts` | Installed provider contract tests; no new auth owner | Local pass; cross-role remote tests pending |
| FND-07 | Existing access-control provider wired into Refine | `src/App.tsx` | Provider identity assertion | Local pass; does not prove RLS/direct-client protection |
| FND-08 | Native Python input validation executes without persistence | existing remote `validate-catalog-profile-v1` | Empty envelope invalid; category name valid; both `persistence:false` | Live validation only; NOT authoritative business command |

## Session checkpoint

- Current phase/module/task: Phase 0 discovery partially complete; Phase 1 session-security prerequisite implemented locally; independent review findings fixed and regression-tested. No complete business vertical slice.
- Last verified result: 21 Vitest tests across five files pass; `npm.cmd run typecheck` passes both frontend/config checks; initial `git diff --check` passes. Reviewed installed SDK/provider source and native runtime validation results.
- Exact next action: resolve native organization membership and obtain current SDK/policy/transaction contracts from the Taruvi platform owner; do not replace existing deny policies or create stock/payment commands from guessed APIs. Two approved inactive QA organizations now exist; establish least-privileged QA users before session-level write/denial tests. Then finish Phase 1 roles/users/settings/native-storage authority before module 18 catalog work.
- Files/records touched: local foundation source/tests/config plus `docs/hmg-studio/`; 16 missing tracked skill files restored with explicit approval. Original temporary pack, HMG Stones, existing `.cache/` preserved. Two new inactive QA organizations created/read back after explicit approval; see [exact IDs and cleanup scope](../QA_FIXTURES.md). No existing business records, users, schema, policies, buckets or functions changed; existing pure validator invoked twice.
- Completed: pack copied and all 47 source/copy hashes matched before working-ledger edits; local reuse audit; scoped live table/policy/role/function/storage discovery; security prerequisite code.
- Verified: six datatables (four business/two system), 25 MCP tools, two private validation-only functions, zero buckets, four active business deny policies, one listed role; native validation executes. These are bounded metadata/runtime results, not product readiness.
- Remaining: every business module, all E01-E12 chains, full 123-view/field/action parity, persisted Python business commands, least-privileged QA users and operational fixtures, browser/visual/accessibility acceptance, deployment and provider proofs.
- Blocked: supported cross-table transaction/conditional-write/rollback/idempotent commit contract is missing; official web docs now clarify independent HTTP requests and absence of record-version preconditions. See [platform decision and exact unblock requirements](../PLATFORM_DECISION.md). HMG organization membership is unconfirmed; existing deny policies need reviewed replacement and direct-client denial tests; running dev-server URL/session is not established (repo prohibits starting dev/build).
- Workspace: user explicitly selected this checkout; local branch `codex/hmg-studio-foundation-20261106`, no commits/push/deploy. No isolated worktree created. Baseline `.cache/` remains untouched.
- Ruling: execute the user-supplied architecture and phased plan rather than invent another product design; this foundation is deliberately not represented as completion of module 31 or 32.
- Ruling: retain and pin installed React 18.3.1 / SDK 1.5.4 / provider 1.3.7 instead of upgrading to manifest's stale React 19 request. Security behavior verified against installed code; other dependency reproducibility remains a separate gate.
- Ruling: no business CRUD pages or disabled workflow placeholders are added while authoritative persistence/tenant contracts remain unknown. Safety gates block affected mutations, not discovery and session-security work.

- Final evidence: [validation report](../VALIDATION_REPORT.md). Independent review identified two Important regressions; both received failing tests and fixes. Final suite is 21/21; frontend/config typechecks pass. Browser acceptance remains pending.

## Full-delivery resumption investigation

- User reaffirmed full development under all supplied Markdown files; no modules removed from scope.
- Re-read binding start/architecture/execution/acceptance documents and current checkpoint. Narrow read-only Explore audit confirmed installed native user/app-role/self-preference contracts; existing owners were not reimplemented.
- Found official public platform documentation despite missing MCP guide files. The stock/payment gate is now tied to documented request boundaries, not a generic missing-document claim.
- Ruling: request the platform-supported atomic command contract or an explicit architecture revision, as required by `06_AGENT_EXECUTION_PROMPT.md`; do not substitute unrelated preferences work, disabled workflow pages, or unsafe multi-request posting for the requested finished app.
- No new application-code or live-data changes in this investigation. Prior local test results are historical for this checkpoint, not rerun evidence.

## Current resume checkpoint: native account + catalog audit

- Completed locally: protected /settings/account, existing profile-menu link, native partial preference load/edit/cancel/save with verified readback and uncertain-write recovery. Python source backend/functions/account_preferences.py; tests backend/tests/test_account_preferences.py; frontend src/pages/account/index.tsx + src/services/accountPreferences.ts and tests.
- Field parity: date_format,time_format,timezone use native account-wide equivalent. Not organization settings. Theme remains owned by Navkit; source language, notifications, profile/MFA and other module32 views remain pending.
- Verified:39 Vitest tests across7files,23pytest, frontend/config typechecks and diff check. Two review regressions RED->GREEN. Private function1915/version4 and QA identity established; exact fixture IDs in ../QA_FIXTURES.md. Existing business deny policies preserved.
- Browser: user started localhost:5173; agent directly observed starter screen only. User correctly reports no app modules. Do not claim completion or a dashboard.
- Exact next action: Categories is first business slice. CodeAuditor map confirms existing product_categories and shared providers/sidenav reuse. DBSchemaAgent refreshes fields/constraints/row policy and native organization authority before writes; request exact scoped policy replacement approval when contract is known. Then real list/create/edit/readback, followed by warehouses/locations/products.
- Ruling: user selected existing Taruvi backend/functions, not alternative storage. Compound stock/payment gates stay targeted; do not use them to stop independent safe catalog work. Full32module/123view scope retained.
- No commits,push,frontend deployment,build,or agent-started server. QA native function registration is the explicitly recorded backend change, not frontend deployment.

## Current checkpoint: complete scope checklist, catalog held fail-closed

This checkpoint supersedes earlier authority, testing and resume statements above.

- Completed this checklist task: indexed all 46 original Markdown files, 32 modules, 123 views, 509 evidence sections, 4,029 source clauses and 2,057 specification/reference gates. No body source line omitted or assigned twice; headings/provenance/separators remain context. Original pack hashes preserved. The counts are traceability, NOT delivered app features.
- Verified now: checklist coverage assertions pass; independent review found no critical/important checklist omission. Nine empty heading-only sections labeled reference-only. Large code-reference clauses require per-rule ledger expansion before acceptance.
- Current full local suite: 39 Vitest pass, 9 fail (unimplemented catalog frontend/service scaffolds); 35 Python tests pass (23 preferences  + 12 catalog); frontend/config typechecks pass. Do not repeat the old all-green claim against this current worktree.
- Live category state: QA role only reads organization A; category create/update/delete denied. Final ordinary-session list 200/create403/update403/foreign-read 403 checks pass. Existing business data untouched. See ../CATALOG_SECURITY_FINDINGS.md for the failed reassignment, exact containment, source scan rejection and evidence paths.
- Backend draft registration failed security scan; no runnable hmg-categories-v1 command. Existing validator v2 metadata compatibility change still needs HTTP/function-to-function verification. Unique index is metadata-confirmed, not concurrency-proved.
- Browser: previously observed starter only; no new browser acceptance this task. No Categories resource/route wired. User's running server is not proof of a functional app.
- Exact resume: obtain specific native scanner diagnostic/supported runtime; fix without bypass; add commit-then-throw and failed-readback tests; establish direct validation/immutable organization guards and unique constraint concurrency proof under QA identity. Then finish frontend RED tests, review, register verified resource, and browser-test. Keep unsupported category edits/deletes and compound stock/payment actions unshipped.
- All 32 modules,123 views and E01-E12 remain in scope. Account native date/time/timezone is partial; not full module32. No full module accepted.
- No build, dev-server start, frontend deployment, commit or push. All changes local except explicitly recorded QA policy narrowing/read-only verification. Existing temporary pack and HMG Stones untouched.

### Catalog field/action/state checkpoint

| Stable ID / source clause | Required behavior | Target owner | Current result | Remaining |
|---|---|---|---|---|
| CAT-01 / e0018 | List/search/pagination and actual category fields | planned src/pages/categories/index.tsx | Frontend RED; not routed | UI states, real provider/browser tests |
| CAT-02 / e0062 | Name/description source validation | existing validate-catalog-profile-v1; draft backend/functions/catalog.py | Validator metadata v2 changed; draft12 tests | Live v2 validation and direct-write bounds |
| CAT-03 / e0095 | Organization-scoped slug/identity and creation defaults | native product_categories + draft command | Unique index metadata; QA defaults inspected | Concurrent UUID/slug and native command tests |
| CAT-04 / e0063 | Authorized edit, stable slug, persisted readback | no released edit owner | Direct organization reassignment FAILED | Supported proposed-row/immutable org enforcement |
| CAT-05 / e0018 | Product count/selection/reference-aware deletion | products owner absent | Not implemented; no fake count | Confirm products schema and soft-delete contract |
| CAT-06 | Successful committed readback; timeout reconciliation | draft backend/functions/catalog.py | Offline create/readback tests only | Commit-then-throw, mismatched/failed readback, live command |

Expand each referenced source clause into all constituent field/default/action rules before checking it complete. No clause above is fully accepted.


## Current expansion resume checkpoint - 2026-11-06

This checkpoint supersedes earlier route, inventory, testing and authority snapshots. No full module or clause is accepted. The source-page/field traceability tables above remain an uncompleted acceptance map, not a claim that generic views implement every source control.

### Implemented and locally verified

- 32-entry protected workspace registry, grouped sidebar/header/theme and real schema-backed module reads. Owners: `src/App.tsx`, `src/erp/modules.ts`, existing shell components and `src/pages/erp/index.tsx` / `src/services/erp.ts`. Categories/account reuse their existing owners; do not create parallel replacements.
- Generic list server search/filter/pagination and explicit loading/empty/error states; selected master typed form fields, scoped FK inputs, required/null/decimal checks, immutable organization on edit, native permission checks and fresh matching save readback. Uncertain writes freeze resubmission pending read-only reconciliation. These controls do not replace backend authority.
- Native user/role reads: `src/pages/erp/platform.tsx`; users use the dedicated user provider, roles the app provider. Roles SDK does not expose server filtering/pagination and the UI says so. No custom auth datatables or credential forms.
- Approvals: `src/pages/erp/approvals.tsx`, callback reuse of the existing list, `approval_status=pending` for orders/PO/transfers, `status=pending` for adjustment requests; one selected tab mounted. No reviewer assignment/My requests/decision authority claim, no approve/reject controls.
- Dashboard: `src/pages/home/index.tsx`, `src/services/dashboard.ts`, `backend/functions/dashboard.py`; caller-scoped complete bounded projection, exact currency grouping, fail-closed response checks, parsed UTC ordering/month boundaries. Private v2 update/readback and pre-seed MCP execution passed; subsequent normal-session HTTP 200 returned live metrics. See final backend evidence below; no browser acceptance is inferred.
- Previous expansion run (historical; superseded below): approvals + generic ERP **13/13 passed** and frontend `tsc --noEmit -p tsconfig.json` exit 0. Final whole frontend suite **97/97 passed across 18 files** (`npm.cmd test -- --maxWorkers=2`), both TypeScript configs passed, and latest orchestrator full Python suite **85 passed**. Frontend/typecheck logs: `.cache/erp-vitest-final.log` and `.cache/erp-typecheck-final.log`; `.cache/erp-pytest-final.log` retains the earlier historical 63-test /4.84s run, not the latest 85. Python dashboard **9/9** and seed **4/4** focused counts overlap; do not add them to suite totals. Full details: [validation report](../VALIDATION_REPORT.md).
- Review corrections: category resource registration is list-only, not broken nested URLs; Approvals no longer masquerades as ordinary unfiltered orders; money cells qualify actual row currency; no authentication/SDK envelope/query-loop regression found in reviewed integration.

### Backend checkpoint and evidence boundaries

- `backend/schema/final-verification.json`: **62 business tables (58 new +4 existing), 895 fields, 190 FKs, 324 indexes**, no failed metadata readback. This does not prove mutation authority.
- 58 new-resource policies and four lookup exceptions retain recorded native readback. QA role **1156** now includes the new dedicated `qa_hmg_inbox_20261106` user (`1bbbcad2-46c3-480f-92d6-acdf566b510a`) alongside the previous retained QA user; its wildcard policy remains disabled. Notification reads now require the synthetic organization, role and one of **two exact username-to-user-UUID pairs**, because native `P.id` is a username, not the notification FK UUID. The earlier UUID assumption produced HTTP400 and was corrected with full policy readback: `evidence/notification-owner-policy-20261106T171755374062Z.json`. No notification C/U/D grants or general membership grants were added.
- Fixture accounting: the **frozen plan remains 75 rows /27 tables, with 73 semantically matched rows across 25 tables**. An additional owner-specific notification `275aeb92-a8ae-5021-b639-7a0fc9050631`, outside that frozen plan, is now verified. Therefore **75 synthetic rows are present: 74 semantically verified across 25 tables plus one unverified saved-report row**. Report JSON still reads as strings; activity was not inserted. Do not confuse present rows with accepted frozen-plan rows or claim all 27 tables accepted. Evidence: `evidence/erp-normal-session-readback.json`, `evidence/notification-owner-probe-before-correction.json`, `evidence/notification-normal-session.json`.
- Normal-session dashboard execution now returned **HTTP 200** (`evidence/dashboard-normal-session.json`): **9 products, INR 3,106,300 inventory valuation, 3 pending orders, INR 209,400 receivables, zero current-month revenue, 6 visible categories and 3 locations**. The category count includes an older QA organization A category; this is caller-visible scope, not exclusively the new synthetic organization. Earlier pre-seed MCP values remain historical. This is API/session evidence, not browser acceptance.
- Latest normal-role customer create proof is `evidence/erp-normal-create-v3.json`: after the correct QA role assignment, advisory check **ALLOW**, actual native **POST 403**, exact-ID readback **HTTP 200 with zero rows**. v2 predates the correct assignment and is not the final result. No ordinary-user create acceptance is claimed. Generic writes remain closed; `writeBlocker` now additionally requires action-specific `verifiedWriteActions`, so create proof cannot unlock update, and delete is unconditionally blocked. No manifest write-verification flag was enabled.
- Final normal-session readback is complete (`evidence/erp-normal-session-readback.json`): **all 27 HTTP 200; 25 tables/73 rows semantically exact (`values_match:true`); saved_reports one visible but mismatched; activity_logs zero visible**. Transport success does not imply semantic acceptance for all 27. Catalog function slug correction remains read-back only, not accepted ordinary category creation. General organization/warehouse membership and compound stock/money protection remain separate.
- Fixture safety remains: valid zero-stock assembly/BOM draft has zero consumption/output; transfer/audit/shipment drafts have no posted effects or outbound notification. Returns omitted because there is no draft state or eligible shipped coverage. No active integrations/email jobs/payment transitions were added.
- User accepted a supplied shell screenshot and prohibited computer use. No new browser/module E2E/mobile/accessibility proof, build/deployment or full module acceptance. Original temporary specification and HMG Stones checkout are preserved.

### Exact next actions and remaining workflows

1. Preserve the completed 27-table read evidence: all HTTP 200, only 25 tables/73 rows semantically accepted. Policy metadata, advisory ALLOW and HTTP 200 do not prove native writes or accept malformed JSON.
2. Resolve the native JSON contract with a targeted shape audit: 31 manifest `any` fields came from blanket JSON/JSONB mapping. Native array/object are documented migration candidates, not runtime-proven fixes. The additive provisioner will not change existing types; do not blanket-convert 31 fields. Prepare a reviewed migration preserving each full schema and the controlled probe, test structured write/readback, then reconcile the existing deterministic saved report without duplicate insertion/false semantic success and insert activity only after proof. Target remains 75 rows/27 tables; current accepted result is 73 rows/25 tables, not 75.
3. Resolve customer permission-check ALLOW versus actual POST 403 using the existing native provider/policy path; preserve all generic write blockers until ordinary-session commit/readback and denial tests pass. Do not broaden grants or use a privileged frontend fallback. Unsupported category/location/warehouse edits remain closed.
4. Preserve latest evidence: frontend 122/20 plus both configs; latest full Python 107 in 2.31s (`../evidence/continuation-python-107.json`); historical Python63 log remains labeled historical. No computer use, build or deployment under current instructions.
5. Complete safe master/source-field/nested-view parity and actual normal-role CRUD acceptance. Resolve supported native atomicity, conditional writes, rollback, idempotency, locking and direct-write-bypass proof before order/payment/refund, return receipt/restock, PO receipt, approval decisions, adjustment posting, transfer/reservation, audit reconciliation or work-order consumption/output workflows are enabled.
6. Finish imports/export, analytics/report builder/sharing/schedules, audit details/export, native user/role administration, account/organization/email settings, notification delivery, carriers/storage/webhooks, customer portal, approved plugins/tax, backup/recovery and full variant/supplier replenishment. All 32 module rows and E01-E12 remain in scope; none is accepted by schema/read UI presence alone.

Historical checkpoints above remain preserved. This final checkpoint supersedes their pending-assignment/unseeded/ordinary-dashboard statements without rewriting their historical test evidence.

## Historical inbox continuation resume

This section supersedes the preceding historical current-checkpoint labels. All 32 modules and 123 source views remain required; no module is accepted.

- **Implemented:** existing shell/Home restyled with UI/UX Pro Max guidance, token contrast/focus/reduced-motion coverage and responsive panels; personal notification list/detail/bell/preview using existing providers; read-only notification resource registration; action-specific generic CRUD verification guards.
- **Verified locally:** frontend 122 tests/20 files in 70.77s (`.cache/erp-vitest-continuation.log`), both TypeScript configurations (`.cache/erp-typecheck-continuation.log`), latest Python 107 passed in 2.31s, exit 0 (`../evidence/continuation-python-107.json`, `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend -q`). Focused UI 16 and notifications 15 are subsets, not additional totals. No browser/computer-use verification.
- **Security:** invalid-ID imperative refetch could bypass `enabled:false`; fixed with hook-boundary guards and retained owner filters. Detail pagination/filter carryover fixed; required/returned ID checks, owner-switch, cached denial and count-error tests added. New action-specific `verifiedWriteActions` cannot let create verification enable update; all deletes stay blocked. No manifest C/U/D grant enabled.
- **Normal-session notifications:** own/unfiltered list 200, own detail 200, foreign-owner list 0, foreign detail 403, unread total 1. Native principal is username, not UUID; initial P.id-to-UUID policy caused 400. Corrected exact two-QA username/UUID pairs within role 1156 and the synthetic organization, full policy readback; no writes granted. Evidence under `../evidence/notification-owner-policy-20261106T171755374062Z.json` and `../evidence/notification-normal-session.json`.
- **New QA fixture:** `qa_hmg_inbox_20261106` / UUID `1bbbcad2-46c3-480f-92d6-acdf566b510a`, role 1156; previous user retained. Added notification `275aeb92-a8ae-5021-b639-7a0fc9050631` verified outside the frozen plan. Present 75 = accepted 74 + unaccepted report 1 across 25 accepted tables; frozen 75/27 plan still has only 73 accepted matches. Activity is not inserted. Account/password/session material is not documented here.
- **CRUD evidence:** 62-resource audit 54 read 200/8 read 403; bounded advisory batches 50 + 12, only customers/suppliers create ALLOW for tested payloads, all updates/deletes DENY. Fresh correctly assigned QA customer actual POST 403/readback 0 remains a blocker (`../evidence/erp-normal-create-v3.json`); earlier v2 is pre-correct-role evidence, not final. See [32-module disposition matrix](../ERP_EXPANSION_PLAN.md#32-module-crud-disposition-and-bounded-qa-evaluation).
- **Exact resume:** native proposed/original-row authority and customer create mismatch; targeted JSON report/activity persistence; safe master and nested-view parity; notification mutations/preferences/outbox separately; verified transactional stock/money commands and remaining reporting/import/admin/portal/provider/recovery workflows. No type migration has been applied; proposals are not runtime proof. No computer use, build, frontend deployment, commit or full-module/E01-E12 acceptance.
