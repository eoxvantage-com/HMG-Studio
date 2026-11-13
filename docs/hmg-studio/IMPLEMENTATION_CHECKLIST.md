# HMG-Studio implementation checklist

## Display currency and native team directory - 2026-11-07

**Implemented, independently reviewed and locally/API verified; no browser or deployment acceptance claimed here.** Earlier checkpoints remain historical.

- Dashboard now requests the fixed **INR ledger** regardless of the **Display currency** selector. INR/USD/EUR presentation preserves all source counts, rows and category shares. USD/EUR monetary values use public Frankfurter ECB reference rates, with source/date and indicative-only, non-accounting wording. Loading/error hides converted amounts rather than relabelling INR values; retry and stale-response/unmount cancellation are covered.
- The fixed public request sends only the currency pair: no credentials, session header, business data or referrer; redirects are rejected. Eight-second timeout, 4 KiB response bound, strict base/quote/positive finite rate checks, real UTC dates, seven-calendar-day freshness and future-date rejection apply. A five-minute public-only cache is revalidated on reuse; the open dashboard refreshes rates periodically. [Actual service/rate proof](evidence/currency-display-live-rates.json) verified both pairs dated November 6, separately from browser CORS/visual acceptance.
- Native Users stays on the dedicated Taruvi `user` provider. View uses an encoded **username**, not the row UUID, and rejects mismatched returned identity. A permanent server-side `roles=hmg-studio-hmg-team` directory filter remains alongside search/pagination. This is explicit membership grouping, not proof that an app header scopes the tenant directory or a replacement authorization boundary. [Native ordinary contract](evidence/native-user-ordinary-contract.json).
- John, Kevin and Peeter were created through native APIs as standard accounts; all three fresh logins, username detail reads, three-member directory results and product reads passed. They have the membership tag and existing operator role; no new financial-write grant is claimed. Pradeep's existing staff/admin status was preserved and membership read back. [Provisioning](evidence/hmg-team-provisioning.json), [ordinary checks](evidence/hmg-team-ordinary-verification.json). No invitation email was sent; credentials are not copied into docs/evidence.
- **251 frontend tests /32 files passed (352.03s)**, both TypeScript configurations exit 0. [Exact frontend verification](evidence/currency-users-frontend-verification.json). Native product/customer/supplier update policy remains DENY; no frontend edit gate was enabled. Catalogue metadata enrichment and build/deployment are separate root-owned work, not acceptance inferred from these tests. Full CRUD, atomic stock/money workflows and browser/visual acceptance remain unproved.

## Compact inventory and bounded reports - 2026-11-07

**Implemented and locally/API verified; not full-module acceptance.** Earlier dated checkpoints remain historical.

- Inventory prioritizes stock-by-location and suppliers, adds capability-relevant variants/assembly/serial/batch sections, and keeps remaining relations behind **More related data**. Expanding a panel still owns its query; unloaded counts are unknown, not zero. The accessible stock chart reuses the displayed stock page and table, not another query or a page-derived product total.
- `/reports` now generates four fixed operational views: sales orders, purchase orders, customer payments and stock adjustments. An authorized organization is required; only organization lookup runs before **Generate**. Complete caller-visible results are bounded to **500 rows**, with stable ID ordering and fail-closed pagination checks. Saved definitions remain secondary at `/reports?view=definitions`; arbitrary saved configurations/SQL are not executed.
- Existing lists export mapped current-page/current-record values. Reports export the **complete generated bounded result**, not only its table preview page, using the existing CSV/HMG print-preview helper. Neither path claims an issued invoice, delivery/email, arbitrary all-database export, atomic snapshot or recognized revenue.
- **228 frontend tests /31 files passed (552.90s)**; both TypeScript configurations passed. [Frontend evidence](evidence/operational-frontend-verification.json). [Ordinary SDK/provider proof](evidence/operational-reports-live.json): all four report kinds succeeded over eight authorized reads, without admin fallback. Broader backend/enrichment/deployment status belongs to the [operational release record](OPERATIONAL_WORKSPACE_RELEASE.md).
- Native C/U/D, transaction atomicity and full 32-module/E01-E12 acceptance remain separate gates. This checkpoint makes no browser, visual, build, deployment or all-CRUD acceptance claim.

### Current delivered / remaining checklist

- [x] Compact relevant product relations, explicit More control, lazy queries and honest unknown counts.
- [x] Same-page accessible stock chart with table fallback and caller-visible completeness qualification.
- [x] Four fixed authorized report generators; explicit organization, UTC dates, complete 500-row cap and invalidation on identity/scope/error changes.
- [x] Currency-separated money, authorized payment-order currency, visible void state and non-voided-only payment summaries.
- [x] Bounded complete generated-report CSV/HMG print preview, distinct from existing current-page exports.
- [x] Independent review, 228 frontend tests, both TypeScript checks and four ordinary-session report probes.
- [ ] General all-filtered export outside these four bounded report generators; report scheduling, arbitrary report builders and delivery.
- [ ] Browser/visual/print-output acceptance, native write authority, atomic workflows and full-module acceptance.

## Latest sectioned workspace checkpoint - 2026-11-06

**Implemented/read-verified, not full-module acceptance.** This supersedes earlier detail-tab presentation and test totals; prior evidence remains historical.

- **UI:** grouped business details and persisted-value summary cards replace generic horizontal detail tabs/raw-field cards. Related accordions mount paginated queries only when expanded. Shared bounded FK name lookups, multi-field server search, semantic statuses and real registered-record links reuse existing Refine query owners. Inventory keeps its specialized overview; Categories adds cards/table views; Approvals remains read-only.
- **Exports:** mapped visible current-page/current-record CSV and HMG-branded print previews (including browser Print-to-PDF) cover generic views/related lists, Inventory/stock/suppliers, Categories and personal Notifications. Identity/error gates, formula escaping and size bounds apply. No hidden-field, all-filtered, issued-invoice, email or payment-proof claim.
- **Verified:** independent review followed by **187 frontend tests /29 files** (273.68s), **250 Python tests** (5.79s), and both TypeScript configurations exit 0. [Final verification](evidence/sectioned-workspace-verification.json). No browser/visual acceptance, build, deployment or commit.
- **Synthetic data:** **60 transaction headers +75 supporting rows =135 rows /19 tables**, May-October 2026. Six new fictional products comprise four illustrated slabs and two assemblies; existing catalogue references remain separate. Ordinary-session exact readback verified all 135 rows, four private JPEG downloads matched SHA, and 58/58 bounded advisory checks matched. These are historical snapshots, **not executed stock/payment/approval workflows**. [Readback](evidence/historical-60-normal-readback.json), [images](evidence/historical-60-normal-images.json), [policy checks](evidence/historical-60-normal-policy.json).
- **Remaining:** seven exact-ID child READ policy changes added no C/U/D authority. Native ordinary customer POST 403 remains a provider blocker; original-row authority, atomicity/concurrency/idempotency/rollback and full source parity remain unproved. Platform event subscriptions were empty, but physical database triggers were not verified. Full-filter export, operational workflows and all-module/E01-E12 acceptance remain open.

### Sectioned-slice acceptance checklist

- [x] Grouped business details/summaries, lazy paginated relationships, bounded name resolution and server multi-field search implemented and locally tested.
- [x] Categories cards/table and Approvals real-document links; no unverified decision action enabled.
- [x] Visible-page/record mapped CSV and HMG print-preview exports; identity/refetch/error guards and formula/size limits tested.
- [x] 60 synthetic headers plus 75 support rows provisioned and verified by ordinary native readback; four illustrative image downloads and 58 bounded advisory cases verified.
- [x] Independent review, final 187 frontend/250 Python and both TypeScript configs; evidence linked above.
- [ ] Full-filter export and browser print/PDF/visual/mobile/keyboard acceptance.
- [ ] Native create/update/delete and original-row isolation proof; atomic transactional workflows and full 32-module/E01-E12 acceptance.

## Prior product workspace checkpoint - 2026-11-06

This checkpoint supersedes historical navy/blue styling, 122/107 test totals, pending JSON fixtures and storage-unavailable statements below. **No complete module or E01-E12 chain is accepted.**

- **Implemented:** scoped Ant Design 5 / ProComponents inventory pilot, retaining React 18, Refine 5, native session/auth/providers and existing mutation notifications. Controlled server search/filter/sort/pagination uses one products query. Product detail reuses the parent record for stock/price/cost/value and grouped metadata, image, explicitly labelled SKU barcode preview, QR and print; warehouse stock/supplier views resolve names. All generic related tabs are reachable and only the selected panel queries; unknown/partial totals are not zero. The shell uses shared olive/ivory tokens and the unmodified official website logo; palette inspiration is not an official brand specification.
- **Verified locally after independent review:** **152 frontend tests /25 files**, 320.92s (`.cache/product-workspace-vitest-final.log`); both TypeScript configurations exit 0 (`.cache/product-workspace-typecheck-final.log`); **208 Python tests**, 4.08s, exit 0 (`.cache/product-workspace-pytest-final.log`, `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend -q`). Python comprises 200 backend/tests plus 8 schema tests. Earlier 207/181/107 and focused counts are historical/subsets, not additive. [Persisted final verification](evidence/product-workspace-verification.json).
- **Live catalogue:** 263 deterministic `HMG-WEB-*` reference products imported with native create/readback and ordinary-session list HTTP 200/total 263. They are inactive public-catalogue references, not physical inventory; stock 0 and required legacy price 0 are technical placeholders, selling/purchase prices are null. UI suppresses reference stock/value and never treats legacy price 0 as a quotation. [Import evidence](evidence/hmg-catalogue-import.json), [normal read](evidence/hmg-catalogue-normal-read.json).
- **Targeted JSON repair:** four nullable native fields added without changing legacy TEXT/`any` columns: saved_reports `columns_json` (array of strings), `filters_json` (object with items array), `sort_json` (object), activity_logs `properties_json` (object). Existing synthetic report received only new fields; one missing deterministic activity fixture was inserted. Exact native types/values read back, including ordinary-session HTTP 200. Structured detail rendering is read-only, bounded and redacts sensitive values; it does not execute report configuration. Seeder maps only missing fixture writes and strictly compares both typed and present legacy values. [Migration](evidence/structured-json-20261106T184314271383Z.json), [normal read](evidence/structured-json-normal-read.json).
- **Accounting:** 62 business tables; prior verified 895 fields plus four additive fields = 899 (190 FKs/324 indexes unchanged by this patch). The separate QA diagnostic table is not a 63rd business resource. Seed scope now has 76 retained rows: prior 74 semantically verified plus repaired report 1 and new activity 1. The 263 catalogue references and diagnostic row are separate populations, not an asserted global database count. Historical frozen-plan readback is preserved; typed-wire acceptance supersedes only the two targeted JSON cases.
- **Private media:** authenticated private-image component is implemented with identity/revocation gates, raster MIME/size checks and object-URL cleanup. One ordinary QA object read returned 200, exact SHA and 53,083 bytes; anonymous 401. Existing storage policy permits authenticated reads, **not organization-scoped reads**. Final delivery verified **252 unique private products-bucket objects and 263 owned product image links** (last link run 262 updates  + 1 exact probe skip). Only `image` was patched; all other fields except server `updated_at` were preserved. Ordinary QA linked-prefix query returned HTTP 200/total 263; one linked product and its private bytes returned 200 with exact SHA. The separate `Images` bucket remains untouched/reserved. Storage collision atomicity and image-PATCH CAS remain unproved. [Delivery](evidence/hmg-catalogue-delivery-summary.json), [ordinary linked count](evidence/private-media-linked-normal-count.json), [linked byte proof](evidence/private-media-linked-normal-read.json). [Bounded session proof](evidence/private-media-normal-read.json).
- **Still blocked:** native customer POST 403 despite advisory ALLOW, including a bounded zero-string diagnostic; policy was restored exactly and readback remained empty. No frontend write gate was enabled. Original-row/update authority, generic deletion, stock/money atomicity/rollback/idempotency/concurrency, remaining module workflows and full source parity are unproved. [Provider escalation](evidence/native-create-provider-escalation.md), [diagnostic rollback](evidence/customer-zero-string-policy-test.json). No browser/computer use, build, deployment, commit or full-module completion in this slice.

## Historical checkpoints (superseded where noted above)

Updated: 2026-11-06. **App completion: NOT complete. No module is fully accepted yet.**

The [parity/resume ledger](development-pack/05_PARITY_AND_RESUME_LEDGER.md) owns implementation status. This checklist is the complete scope and acceptance index, not a substitute for that ledger. The original temporary development pack is unchanged.

Coverage: **46 Markdown files -- 32 modules -- 123 source views -- 509 source sections -- 4029 source clauses -- 2057 specification gates -- 12 cross-module chains**. Clause count is a syntactic index, not a count of independently understood features.

## Professional UI and personal inbox continuation - 2026-11-06

- Extended existing theme/sidebar/Home owners: navy/slate navigation, warm stone accents, white padded cards, responsive KPI links, clearer headings and semantic statuses. No new provider, font, asset or dependency. Global visible focus and reduced-motion rules added. Token contrast tests pass (white text: primary 6.18:1, complete 5.12:1, amber 5.61:1, error 5.87:1); sidebar text/state pairs meet 4.5:1. This is code/local-test proof, not visual or keyboard/browser acceptance.
- Personal notifications now have a dedicated list/detail inbox and header bell/preview through the existing provider. Server-side owner/search/read-status/type filters and pagination; backend unread total; verified identity/response ownership; safe internal read destinations; loading/error/empty states. Notification resources advertise list/show only. Mark-read, delete, preferences, event generation and delivery remain unavailable.
- Notification security review caught imperative `refetch` bypassing a disabled invalid-ID query and detail navigation retaining list pagination. Guarded refetch, retained owner filters, required detail ID, first-page detail queries and response-ID checks resolve those findings. Tests also cover owner changes, cached-data denial and unread-count failure after success; they do not substitute for live policy proof.
- New normal-session owner proof passed: own/unfiltered list and own detail HTTP 200, foreign-owner filtered list zero, foreign detail HTTP403, unread total 1. This is bounded QA ownership proof, not general production membership or notification write authorization.
- Latest broad audit covers 62 resources: 54 read HTTP 200, 8 HTTP403; advisory C/U/D evaluated in bounded batches of 50 + 12 after the 62-item request hit the limit. Only customers/suppliers create were advisory ALLOW for the supplied payloads; all update/delete decisions DENY. Actual customer POST still 403. See the 32-module CRUD disposition matrix in [ERP_EXPANSION_PLAN.md](ERP_EXPANSION_PLAN.md#32-module-crud-disposition-and-bounded-qa-evaluation).
- **Still incomplete:** all 32 modules/source views and E01-E12 chains; native create/proposed-versus-original-row authority, JSON persistence, atomic stock/money commands, remaining nontransaction workflows. No browser/computer use, build, deployment or commit in this continuation.

## Working rules

- [ ] Read the exact specification and shared owners before implementing each slice; record its exact create/modify/test file map.
- [ ] Confirm exact live app-scoped schema, relationships and authority through DBSchemaAgent/MCP; never infer a target column from source UI.
- [ ] Follow audit/reuse -- schema/contracts -- failing tests -- implementation -- security/duplication review -- tests -- browser/readback -- documentation.
- [ ] Reuse native identity/providers/functions, Refine v5, shared design tokens and existing MUI owners (user-approved Ant inventory pilot only); no replacement identity tables, duplicated business owners or fabricated metrics.
- [ ] Maintain the source field/default/validation/action/transition mapping in the ledger using the stable clause IDs below.
- [ ] Preserve QA-only mutation scope; no existing business-record changes, secrets in source, commits, builds or deployment without separate authorization.

## When an item may be checked

A check means the entire stated behavior is implemented AND accepted, not merely inspected. Link evidence for: exact target mapping; schema/authority; local tests; direct backend authorization/readback/failure tests; browser loading/error/empty/filter/keyboard/mobile states; provider/deployment/recovery proof when applicable. Record an explicitly approved native equivalent or justified non-applicability instead of silently dropping a contract. A blocked item remains unchecked. Keep local, backend, browser, external-provider and deployment statuses separate.

## Current expansion checkpoint (supersedes historical test/route counts)

- **No full module is accepted.** All 32 modules, 123 source views and E01-E12 chains remain in scope. Sidebar/schema/read-page coverage does not check off source behavior.
- Final schema: **62 business tables (58 new +4 existing), 895 fields, 190 foreign keys, 324 indexes**; exact metadata readback is separate from write authority.
- Implemented: authenticated 32-entry shell, generic server search/filter/pagination/detail and guarded typed forms, native user/role reads, pending-only approval queues and validated dashboard projection. Categories/account retain their existing owners.
- Current continuation verification: **122/122 frontend tests across 20 files** (70.77s) and both TypeScript configurations passed after independent review; logs `.cache/erp-vitest-continuation.log` and `.cache/erp-typecheck-continuation.log`. Latest full Python run **107 passed in 2.31s, exit 0**, recorded in `evidence/continuation-python-107.json` (`PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend -q`); the older `.cache/erp-pytest-final.log` contains 63 and is historical, not the 107-test evidence. UI focused 16 and notification focused 15 overlap the full suite; do not add them to 122.
- 58 new-resource policies and four lookup exceptions retain recorded native readback. QA role **1156** now includes the new dedicated `qa_hmg_inbox_20261106` user (`1bbbcad2-46c3-480f-92d6-acdf566b510a`) alongside the previous retained QA user; its wildcard policy remains disabled. Notification reads now require the synthetic organization, role and one of **two exact username-to-user-UUID pairs**, because native `P.id` is a username, not the notification FK UUID. The earlier UUID assumption produced HTTP400 and was corrected with full policy readback: `evidence/notification-owner-policy-20261106T171755374062Z.json`. No notification C/U/D grants or general membership grants were added.
- Fixture accounting: the **frozen plan remains 75 rows /27 tables, with 73 semantically matched rows across 25 tables**. An additional owner-specific notification `275aeb92-a8ae-5021-b639-7a0fc9050631`, outside that frozen plan, is now verified. Therefore **75 synthetic rows are present: 74 semantically verified across 25 tables plus one unverified saved-report row**. Report JSON still reads as strings; activity was not inserted. Do not confuse present rows with accepted frozen-plan rows or claim all 27 tables accepted. Evidence: `evidence/erp-normal-session-readback.json`, `evidence/notification-owner-probe-before-correction.json`, `evidence/notification-normal-session.json`.
- Normal-session dashboard execution now returned **HTTP 200** (`evidence/dashboard-normal-session.json`): **9 products, INR 3,106,300 inventory valuation, 3 pending orders, INR 209,400 receivables, zero current-month revenue, 6 visible categories and 3 locations**. The category count includes an older QA organization A category; this is caller-visible scope, not exclusively the new synthetic organization. Earlier pre-seed MCP values remain historical. This is API/session evidence, not browser acceptance.
- Latest normal-role customer create proof is `evidence/erp-normal-create-v3.json`: after the correct QA role assignment, advisory check **ALLOW**, actual native **POST 403**, exact-ID readback **HTTP 200 with zero rows**. v2 predates the correct assignment and is not the final result. No ordinary-user create acceptance is claimed. Generic writes remain closed; `writeBlocker` now additionally requires action-specific `verifiedWriteActions`, so create proof cannot unlock update, and delete is unconditionally blocked. No manifest write-verification flag was enabled.
- Final normal-session readback (`evidence/erp-normal-session-readback.json`): **all 27 HTTP 200; 25 tables/73 rows semantically exact; saved_reports one visible but mismatched; activity_logs zero visible**. HTTP 200 does not accept the mismatched report. Existing category B01-B03 restrictions and compound stock/money B04 atomicity/rollback/idempotency gates remain.
- User accepted the supplied shell screenshot and forbids computer use. No new automated browser E2E/mobile/accessibility proof, build, deployment or full acceptance.
- Exact next actions: targeted shape audit and reviewed native JSON migration preserving full schema/probe, then structured write/readback for report/activity. There are 31 `any` fields; documented native array/object alternatives are not runtime-proven and must not be blanket-applied; the additive provisioner does not change field types. Then fix actual persistence authorization before master writes; continue every remaining workflow in [ERP_EXPANSION_PLAN.md](ERP_EXPANSION_PLAN.md#implemented-boundaries-and-next-gates), with source/transaction/provider gates intact.

## All supplied files

Checks below mean every applicable contract in the file is accepted, NOT merely that the file has been indexed.
- [ ] **FILE:00_START_HERE.md** -- [specification](development-pack/00_START_HERE.md)
- [ ] **FILE:01_ARCHITECTURE_TARUVI_PYTHON.md** -- [specification](development-pack/01_ARCHITECTURE_TARUVI_PYTHON.md)
- [ ] **FILE:02_EXECUTION_PLAN.md** -- [specification](development-pack/02_EXECUTION_PLAN.md)
- [ ] **FILE:03_SCHEMA_AND_SERVICE_CONTRACTS.md** -- [specification](development-pack/03_SCHEMA_AND_SERVICE_CONTRACTS.md)
- [ ] **FILE:04_END_TO_END_ACCEPTANCE.md** -- [specification](development-pack/04_END_TO_END_ACCEPTANCE.md)
- [ ] **FILE:05_PARITY_AND_RESUME_LEDGER.md** -- [specification](development-pack/05_PARITY_AND_RESUME_LEDGER.md)
- [ ] **FILE:06_AGENT_EXECUTION_PROMPT.md** -- [specification](development-pack/06_AGENT_EXECUTION_PROMPT.md)
- [ ] **FILE:07_EVIDENCE_AND_LIMITATIONS.md** -- [specification](development-pack/07_EVIDENCE_AND_LIMITATIONS.md)
- [ ] **FILE:modules/10_dashboard.md** -- [specification](development-pack/modules/10_dashboard.md)
- [ ] **FILE:modules/11_inventory.md** -- [specification](development-pack/modules/11_inventory.md)
- [ ] **FILE:modules/12_orders.md** -- [specification](development-pack/modules/12_orders.md)
- [ ] **FILE:modules/13_customers.md** -- [specification](development-pack/modules/13_customers.md)
- [ ] **FILE:modules/14_returns.md** -- [specification](development-pack/modules/14_returns.md)
- [ ] **FILE:modules/15_purchase_orders.md** -- [specification](development-pack/modules/15_purchase_orders.md)
- [ ] **FILE:modules/16_suppliers.md** -- [specification](development-pack/modules/16_suppliers.md)
- [ ] **FILE:modules/17_approvals.md** -- [specification](development-pack/modules/17_approvals.md)
- [ ] **FILE:modules/18_categories.md** -- [specification](development-pack/modules/18_categories.md)
- [ ] **FILE:modules/19_locations.md** -- [specification](development-pack/modules/19_locations.md)
- [ ] **FILE:modules/20_warehouses.md** -- [specification](development-pack/modules/20_warehouses.md)
- [ ] **FILE:modules/21_stock_adjustments.md** -- [specification](development-pack/modules/21_stock_adjustments.md)
- [ ] **FILE:modules/22_stock_by_warehouse.md** -- [specification](development-pack/modules/22_stock_by_warehouse.md)
- [ ] **FILE:modules/23_stock_transfers.md** -- [specification](development-pack/modules/23_stock_transfers.md)
- [ ] **FILE:modules/24_stock_audits.md** -- [specification](development-pack/modules/24_stock_audits.md)
- [ ] **FILE:modules/25_work_orders.md** -- [specification](development-pack/modules/25_work_orders.md)
- [ ] **FILE:modules/26_reservations.md** -- [specification](development-pack/modules/26_reservations.md)
- [ ] **FILE:modules/27_import_export.md** -- [specification](development-pack/modules/27_import_export.md)
- [ ] **FILE:modules/28_reports.md** -- [specification](development-pack/modules/28_reports.md)
- [ ] **FILE:modules/29_activity_log.md** -- [specification](development-pack/modules/29_activity_log.md)
- [ ] **FILE:modules/30_users.md** -- [specification](development-pack/modules/30_users.md)
- [ ] **FILE:modules/31_roles_permissions.md** -- [specification](development-pack/modules/31_roles_permissions.md)
- [ ] **FILE:modules/32_auth_account.md** -- [specification](development-pack/modules/32_auth_account.md)
- [ ] **FILE:modules/33_organization_settings.md** -- [specification](development-pack/modules/33_organization_settings.md)
- [ ] **FILE:modules/34_notifications.md** -- [specification](development-pack/modules/34_notifications.md)
- [ ] **FILE:modules/35_shipping.md** -- [specification](development-pack/modules/35_shipping.md)
- [ ] **FILE:modules/36_storage.md** -- [specification](development-pack/modules/36_storage.md)
- [ ] **FILE:modules/37_api_webhooks.md** -- [specification](development-pack/modules/37_api_webhooks.md)
- [ ] **FILE:modules/38_customer_portal.md** -- [specification](development-pack/modules/38_customer_portal.md)
- [ ] **FILE:modules/39_plugins_tax.md** -- [specification](development-pack/modules/39_plugins_tax.md)
- [ ] **FILE:modules/40_operations.md** -- [specification](development-pack/modules/40_operations.md)
- [ ] **FILE:modules/41_replenishment.md** -- [specification](development-pack/modules/41_replenishment.md)
- [ ] **FILE:shared/additional-contracts.md** -- [specification](development-pack/shared/additional-contracts.md)
- [ ] **FILE:shared/commerce.md** -- [specification](development-pack/shared/commerce.md)
- [ ] **FILE:shared/inventory.md** -- [specification](development-pack/shared/inventory.md)
- [ ] **FILE:shared/platform-source-catalog.md** -- [specification](development-pack/shared/platform-source-catalog.md)
- [ ] **FILE:shared/platform.md** -- [specification](development-pack/shared/platform.md)
- [ ] **FILE:shared/shared-gaps.md** -- [specification](development-pack/shared/shared-gaps.md)

## Module completion gates

For EVERY module require: **A** reuse/file map; **S** schema/service/auth; **I** all page/field/action/state implementation; **T** local tests; **B** backend/direct-bypass/concurrency; **U** browser/accessibility; **X** applicable external delivery/deployment/recovery; **D** evidence and ledger. Partial sub-gates belong in the existing ledger. The module checkbox closes only after all applicable gates pass.

- [ ] **MOD:10 -- [Dashboard](development-pack/modules/10_dashboard.md)** (1 source views).
  - Required scope: Permission-aware KPI cards; warehouse and currency scope; widget preferences; replenishment; recent orders; financial watch and quick actions
  - Acceptance: Dashboard numbers reconcile to source records for the selected scope; forbidden financial data is absent from the response, not merely hidden; preference changes survive reload
- [ ] **MOD:11 -- [Inventory / Products](development-pack/modules/11_inventory.md)** (6 source views).
  - Required scope: List/filter/search/view/create/edit; SKU and barcode; prices/currencies; options/variants; images; supplier links; BOM; batch/serial tracking; stock history; privileged reset as a separate guarded operation
  - Acceptance: Create and reload a product with variants and images; preserve variant IDs on edit; edit cannot overwrite stock; removal of referenced variants follows source deactivation rules; opening quantities create ledger events
- [ ] **MOD:12 -- [Orders, Payments and Documents](development-pack/modules/12_orders.md)** (4 source views).
  - Required scope: Sales order create/edit/detail/list; line discounts and order totals; approval; payment/refund/void ledger; invoices; shipment links; cancel and stock consequences
  - Acceptance: Create order and verify source-accurate initial stock effect including pending approval; shipping must not deduct again; partial payments/refunds/voids reconcile outstanding balance; unauthorized/replayed commands cannot post duplicate effects
- [ ] **MOD:13 -- [Customers](development-pack/modules/13_customers.md)** (4 source views).
  - Required scope: Customer create/edit/list/detail; addresses and contact data; order history; contact invitations and portal relationship
  - Acceptance: Save and reload all editable fields; reject cross-organization identities; contact invitation belongs to the correct customer; customer detail links show only authorized related records
- [ ] **MOD:14 -- [Returns / RMA](development-pack/modules/14_returns.md)** (4 source views).
  - Required scope: Select eligible order; create return/exchange request; approval/rejection; line condition and restock choice; receive; complete; separate refund linkage
  - Acceptance: Reject quantities above eligible shipped/remaining quantities; receipt restocks only selected eligible lines; repeated receipt does not duplicate stock; completing a return does not silently refund payment
- [ ] **MOD:15 -- [Purchase Orders](development-pack/modules/15_purchase_orders.md)** (5 source views).
  - Required scope: Create/edit/list/detail; supplier lines and totals; approval/send lifecycle; partial receiving; warehouse/bin updates; quick reorder; price history
  - Acceptance: Receive a PO partially then finally; reject over-receiving and foreign line IDs; stock/bin/movement/price history agree; retry cannot receive twice; quick reorder creates a draft rather than purchasing goods
- [ ] **MOD:16 -- [Suppliers](development-pack/modules/16_suppliers.md)** (4 source views).
  - Required scope: Supplier create/edit/list/detail; supplier ratings and product associations; contact/address fields; purchasing history
  - Acceptance: Create and reload supplier; product association keeps supplier SKU/cost/lead time/minimum quantity; primary supplier rule is enforced; supplier detail/PO navigation respects permissions
- [ ] **MOD:17 -- [Approvals](development-pack/modules/17_approvals.md)** (1 source views).
  - Required scope: Unified approval queue; embedded approval panels; order/PO/adjustment/transfer decisions; thresholds; reviewer/self-approval rules; notes and history
  - Acceptance: Each configured workflow enters the correct queue; reject unauthorized/self decisions when prohibited; enforce each endpoint note limit; stale/repeated decisions cannot apply stock twice; approval status is not confused with document status
- [ ] **MOD:18 -- [Categories](development-pack/modules/18_categories.md)** (1 source views).
  - Required scope: Category listing and modal create/edit; description and active state; related products and selection options
  - Acceptance: Required/unique/scoped fields follow source rules; save/reload reflects changes in product selectors; deletion and referenced-record restrictions match source rather than silently cascade
- [ ] **MOD:19 -- [Locations](development-pack/modules/19_locations.md)** (1 source views).
  - Required scope: Locations/bins; optional warehouse association; code/name/description/capacity/active state; filter and inline forms
  - Acceptance: Location belongs to the selected organization/warehouse; save persists every field; referenced-stock behavior is preserved; product primary location is not mistaken for physical stock balance
- [ ] **MOD:20 -- [Warehouses](development-pack/modules/20_warehouses.md)** (4 source views).
  - Required scope: Create/edit/list/detail; contacts/address/timezone/currency/priority/capacity/default/active; assigned users; linked locations and balances
  - Acceptance: Save/readback all fields; enforce default and assigned-user rules from source; source/destination warehouse access is distinct; switching warehouse updates scoped views without granting new authority
- [ ] **MOD:21 -- [Stock Adjustments](development-pack/modules/21_stock_adjustments.md)** (3 source views).
  - Required scope: Adjustment list/create/detail; signed quantity delta; variant stock popup; reason/notes/location; optional approval; before/change/after history
  - Acceptance: Main form posts a signed nonzero delta; variant popup translates mode correctly including recount zero; pending approval is not shown as completed stock; insufficient available stock and stale concurrent requests fail safely
- [ ] **MOD:22 -- [Stock by Warehouse](development-pack/modules/22_stock_by_warehouse.md)** (1 source views).
  - Required scope: Warehouse/bin stock view; parent-versus-variant identity; on-hand/held/available; unassigned quantities; in-transit interpretation; filters and drilldowns
  - Acceptance: Reconcile bins plus unassigned balances to on-hand; available equals on-hand less active holds; do not double count parent and variants or dispatched stock; foreign warehouse data is denied
- [ ] **MOD:23 -- [Stock Transfers](development-pack/modules/23_stock_transfers.md)** (3 source views).
  - Required scope: Create/list/detail; prepare/reserve; dispatch; in-transit; receipt/completion; cancellation; scanning verification
  - Acceptance: Prepare reserves; dispatch consumes holds and deducts source; receive increments destination once; shipped transfer cannot cancel; source scan checklist is client-only unless an approved enhancement changes that contract
- [ ] **MOD:24 -- [Stock Audits and Cycle Counts](development-pack/modules/24_stock_audits.md)** (7 source views).
  - Required scope: Draft/create/edit/start; scoped item snapshots; count/revision history; review/recount; offline count drafts; variance posting; cycle schedules
  - Acceptance: Stale count revision is rejected; local draft survives network failure and remains tenant-scoped; required variance approval blocks completion; allow-uncounted leaves those lines unchanged; posted discrepancies apply once; due schedule avoids duplicate open audits
- [ ] **MOD:25 -- [Work Orders / Assembly](development-pack/modules/25_work_orders.md)** (3 source views).
  - Required scope: Assembly/BOM relationship; create/list/detail/start; component availability and allocation; actual output; complete/cancel
  - Acceptance: Starting does not invent a reservation absent in source; completion consumes components and produces output atomically; insufficient components roll back; source underproduction closure behavior is preserved and disclosed
- [ ] **MOD:26 -- [Reservations](development-pack/modules/26_reservations.md)** (1 source views).
  - Required scope: Active/expired/consumed/released listing; owner/reference filters; authorized release; holds created by owning workflows rather than an invented generic form
  - Acceptance: Available stock falls while hold is active; expiration/release removes availability commitment but preserves history; serial quantity and unsupported combinations follow source; repeat consume/release cannot double-apply
- [ ] **MOD:27 -- [Import / Export](development-pack/modules/27_import_export.md)** (1 source views).
  - Required scope: Product/order/user templates; file validation; row-level results; partial failures; historical order mode; invitation/integration flags; scoped downloads
  - Acceptance: Reject invalid file/headers/foreign identities; preserve exact accepted/rejected/skipped counts; historical order import changes no stock and emits no order-created hook; exports and downloads enforce current owner/permission scope
- [ ] **MOD:28 -- [Reports, Builder and Schedules](development-pack/modules/28_reports.md)** (17 source views).
  - Required scope: Built-in inventory/sales/receivables/analytics; period and grouping filters; saved report builder; preview/chart/share; export; scheduled delivery
  - Acceptance: Totals reconcile with underlying operations and currencies; capped displayed rows do not cap headline totals; shared report rechecks viewer access; scheduled recipients are reauthorized at send time; filter/export asymmetries remain explicit
- [ ] **MOD:29 -- [Activity Log](development-pack/modules/29_activity_log.md)** (1 source views).
  - Required scope: Actor/category/action/subject/date/search filters; security events; before/after expansion; export; append-only event history
  - Acceptance: Relevant mutations record actor/tenant/subject and outcomes; users cannot edit audit events; field redaction follows policy; source export omission of search/subject_type is an explicit parity decision rather than an undocumented fix
- [ ] **MOD:30 -- [Admin Users](development-pack/modules/30_users.md)** (4 source views).
  - Required scope: Create/edit/list/detail; invitation/reset; role assignment; active state; warehouse assignments and protected self/admin rules
  - Acceptance: Cannot grant unheld privileges or cross-tenant roles; edit blank password retains existing credential; self/protected deletion restrictions work; invitation delivery is separately classified from account creation
- [ ] **MOD:31 -- [Roles and Permission Sets](development-pack/modules/31_roles_permissions.md)** (4 source views).
  - Required scope: Roles create/edit/list/detail; direct and effective permissions; permission-set API contracts; system/protected restrictions; service authorization matrix
  - Acceptance: No role grants unauthorized permissions; system roles retain protection; role create includes permission_set_ids while source edit omits it; denied direct API/datatable access remains denied even when UI is bypassed
- [ ] **MOD:32 -- [Authentication, Profile and Account](development-pack/modules/32_auth_account.md)** (14 source views).
  - Required scope: Staff login/reset/verification/confirm password; two-factor setup/challenge/recovery; profile/password; preferences and account deletion
  - Acceptance: Native identity lifecycle satisfies the documented user flows; one-use recovery/reset and revoked access work; organization switching/stale tab requests cannot cross scope; unsupported native auth features are explicit blockers, not insecure custom workarounds
- [ ] **MOD:33 -- [Organization, Email and Preferences](development-pack/modules/33_organization_settings.md)** (5 source views).
  - Required scope: Organization profile/logo/region/currency/timezone; approval policies; customer portal enablement; email configuration/test; notification preferences; organization switch
  - Acceptance: Independent settings updates preserve unrelated keys; blank secrets obey source retention without being returned to browser; currency/timezone persist; email test failure is not a successful configuration claim; switches require membership
- [ ] **MOD:34 -- [Notifications](development-pack/modules/34_notifications.md)** (1 source views).
  - Required scope: Notification list/dropdown; read/unread/type state; mark one/all; delete/clear read; action navigation; preferences
  - Acceptance: Only owner notifications are readable/mutable; mark-read completes before redirect; errors remain visible and retryable; duplicate clicks do not race state; delivery evidence distinguishes in-app creation from email delivery
- [ ] **MOD:35 -- [Shipping and Carrier Services](development-pack/modules/35_shipping.md)** (1 source views).
  - Required scope: Shipping settings; sender address; parcel units; manual/provider shipments; rate/label flow; tracking/delivery updates; shipment items and partial fulfillment
  - Acceptance: Manual shipment persists and does not rededuct order stock; provider test mode is distinct from paid purchase; parcel units remain ounces/inches; purchased/provider status requires actual provider evidence; webhook replay cannot duplicate fulfillment
- [ ] **MOD:36 -- [Storage, Uploads and Downloads](development-pack/modules/36_storage.md)** (1 source views).
  - Required scope: Taruvi-native images/attachments/generated documents; upload validation and ownership; purpose mapping; authorized retrieval and cleanup
  - Acceptance: Enforce size/type/count and tenant ownership on server; readback after reload succeeds; inaccessible object cannot be fetched by guessed ID; failed uploads do not create false success or orphaned record references; durable identifiers are not expiring URLs
- [ ] **MOD:37 -- [API Tokens, Webhooks and External Interfaces](development-pack/modules/37_api_webhooks.md)** (3 source views).
  - Required scope: Scoped token creation/revocation; show secret once; webhook definitions/events/delivery/retry/rotation; REST/MCP/GraphQL source parity disposition
  - Acceptance: Tokens cannot exceed issuing user scope; secrets do not reappear in lists/logs; private/reserved webhook destinations rejected; retries reuse effect identity; external interfaces call the same Python command authorization instead of privileged bypass
- [ ] **MOD:38 -- [Customer Portal](development-pack/modules/38_customer_portal.md)** (10 source views).
  - Required scope: Customer login/invite/reset; portal enablement; dashboard; own-order detail/invoice; own returns/request lifecycle
  - Acceptance: Wrong customer or organization cannot read records/documents; no invented portal checkout/create-order flow; only eligible delivered-order returns accepted; pending return causes no stock movement until authorized staff receipt
- [ ] **MOD:39 -- [Extensions, Plugins and Tax Documents](development-pack/modules/39_plugins_tax.md)** (1 source views).
  - Required scope: Bundled plugin controls; slots/widgets/tabs and registered contract extensions; tax profile; confirmed immutable tax invoice; administration parity disposition
  - Acceptance: Tax invoice uses validated source profile and item facts then freezes snapshot; later master-data edits do not alter issued document; no claim of legal/tax filing certification; arbitrary uploaded executable plugins are not enabled without an approved target design
- [ ] **MOD:40 -- [Provisioning, Updates, Backups and Recovery](development-pack/modules/40_operations.md)** (6 source views).
  - Required scope: Source installer/update/backup screens mapped to Taruvi provisioning/deployment/backup equivalents; operational permissions; restore/recovery evidence
  - Acceptance: No Laravel/PHP installer, artisan command or runtime is delivered; each source admin function has an explicit target equivalent or blocker; backup proves database/files/config scope and actual restore in approved isolated environment; no destructive recovery without approval
- [ ] **MOD:41 -- [Replenishment and Reorder Policies](development-pack/modules/41_replenishment.md)** (1 source views).
  - Required scope: Product and warehouse thresholds; variant replenishment policies; supplier/cost/currency/quantity; suggested reorder; draft PO linkage
  - Acceptance: Preserve nullable inherited thresholds; policy scope distinguishes variant/warehouse/location; suggestion uses available source inputs; repeated quick reorder behavior follows source; policy must not imply an automatic purchase without an implemented authorized workflow

## Execution sequence checklist

These are the original plan gates. Read [the full execution plan](development-pack/02_EXECUTION_PLAN.md) for shared constraints.

### Phase 0 — Discovery, exact target file map and safety gates
- [ ] Read destination AGENTS and inspect current frontend, providers, Python service folders, package manifests and deployment configuration. Do not print secrets.
- [ ] Produce a per-module exact create/modify/test file map based on existing owners; names below identify logical modules, not invented filesystem paths.
- [ ] Use explicitly `hmg-studio`-scoped read-only MCP to inventory datatables, fields, policies, storage and callable capabilities. Record proof limits.
- [ ] Confirm Python hosting, identity validation, transaction/concurrency and background-job capabilities; fill the schema/service ledger. A material missing capability blocks affected mutations, not unrelated discovery/UI contract work.
- [ ] Establish approved test organization/records and backup/recovery scope before any live verification writes. Existing records must not be repurposed destructively.

### Phase 1 — Shared authority and reusable foundations
- [ ] Establish identity/organization/access policies (31–33), shared shell/navigation/error states, typed service adapter and native storage (36).
- [ ] Define the shared Python command boundary, stock/money precision, document identities, idempotency and activity event contracts. Write failing authorization/transaction contract tests first.
- [ ] Build the minimum roles/users/settings flows needed to exercise authorized and denied paths. Finish their remaining views in Phase 6; do not postpone authorization until then.

### Phase 2 — Catalog and purchasing-to-stock vertical slice
- [ ] Categories (18), warehouses (20), locations (19), suppliers (16), inventory/products (11), stock view (22), reservations service (26).
- [ ] Approval policy/decision core (17), purchase orders and partial/final receipts (15), replenishment (41), adjustments (21).
- [ ] Verify supplier → product/variant → PO → approval → receipt → bin/stock/history/readback. Include failure/retry and negative authorization cases before continuing.

### Phase 3 — Order-to-cash and return vertical slice
- [ ] Customers (13), orders/payment/document flows (12), shipping (35), returns (14), remaining order approvals (17).
- [ ] Verify customer → order → source-accurate stock effect → approval → partial/full shipment → payment/receivables → return receipt → separately authorized refund.
- [ ] Verify no duplicate stock deduction at shipping and no automatic refund from return completion. External provider proof is separate from local command proof.

### Phase 4 — Warehouse control and manufacturing
- [ ] Transfers (23), full reservation UI/release behavior (26), stock audits/cycle schedules (24), work orders/BOM execution (25).
- [ ] Verify prepare → dispatch → receive with reservations/in-transit; revisioned count → review/recount → posting; components → actual output completion. Test rollback and stale writes.

### Phase 5 — Operational visibility and bulk processing
- [ ] Dashboard (10), reports/builders/schedules (28), import/export (27), activity log (29), notifications (34).
- [ ] Verify values against operations from Phases 2–4; test historical imports, row-level partial failures, exported filters, currencies and permission changes before queued delivery.

### Phase 6 — Complete administration, external access and portal
- [ ] Finish all users/roles/auth/account/org/email views (30–33); tokens/webhooks/API parity (37); customer portal (38).
- [ ] Implement approved extension/tax-document equivalents (39) and operations/provisioning/update/backup equivalents (40). Do not declare PHP plugin compatibility or full restore support without proof.
- [ ] Run full role/customer/organization denial matrix, mobile/accessibility states and authorized provider integration verification.

## End-to-end chains

All 12 remain pending. Each needs role, fixture IDs, steps, expected vs actual committed readback, denial/failure/concurrency coverage, command result, browser evidence and cleanup disposition.
- [ ] **E01** -- Role/organization → warehouse/location → supplier → category → product/variant → image. Proof: Exact form/default/validation persistence; stable identities; scoped lookup; authorized object read
- [ ] **E02** -- PO → approval → partial receipt → final receipt. Proof: Capped line receipts, atomic stock/bin/ledger/price effects and retry protection
- [ ] **E03** -- Customer → order → approval → shipment → payment. Proof: Source-accurate stock timing; no shipment rededuction; payment balance and receivable reconciliation
- [ ] **E04** -- Shipped order → return → receipt → complete → separate refund. Proof: Eligible quantity cap; selected restock only; separate payment effect; repeated actions cannot duplicate
- [ ] **E05** -- Transfer → prepare → dispatch → receive. Proof: Holds, available, source decrement, in-transit, destination increment and actor authority agree
- [ ] **E06** -- Audit draft → start → count → stale revision → review/recount → complete. Proof: Snapshot/revision semantics, retained offline draft, review authority and once-only discrepancy posting
- [ ] **E07** -- Assembly/BOM → work order → actual output → complete. Proof: Atomic component/output changes; source underproduction behavior; failure leaves no partial stock
- [ ] **E08** -- Operations → dashboard/report → saved report → export/schedule. Proof: Totals/currency/filter/source permissions; viewer and recipient access rechecked
- [ ] **E09** -- Product/order/user import → partial result → export. Proof: Exact headers/row validation/result ownership; historical order mode has no stock or create-hook effects
- [ ] **E10** -- Customer invitation → portal login → own order → return request. Proof: Cross-customer/organization denial; no unauthorized order creation; pending request no stock movement
- [ ] **E11** -- Provider configuration → document/email/shipment/webhook action. Proof: Secret-safe configuration; committed operation vs actual provider success separated; retry/delivery evidence
- [ ] **E12** -- Admin lifecycle → role revocation → background job/document access. Proof: Revocation enforced on backend; audit continuity; safe approved native equivalents for source operations

## Detailed field/default/action/state checklist

Also follow [SPECIFICATION_GATES.md](checklists/SPECIFICATION_GATES.md): 2057 original instructions, implementation tasks, acceptance assertions and reference/disposition rows. These cover the portions outside the 509 source-evidence blocks.

Open [SOURCE_CONTRACTS.md](checklists/SOURCE_CONTRACTS.md): all 509 source evidence sections and 4029 source-linked clauses. Each table row, prose/list condition and fenced validator/default block has a stable ID and exact line range. Source code blocks may contain multiple related rules; all must be mapped and tested before checking the clause.

All 123 individual page rows remain in the [existing page ledger](development-pack/05_PARITY_AND_RESUME_LEDGER.md#source-page-traceability); do not create another competing page-status list. [coverage.json](checklists/coverage.json) preserves original file hashes, section IDs, clause hashes/line ranges and the manifest page list for omission checks.

## Required negative and UI matrix

- [ ] Authorized, read-only, forbidden and revoked/stale actors.
- [ ] Foreign organization/warehouse/customer and missing/foreign nested IDs.
- [ ] Blank/null/zero/false/default/decimal/date/currency fidelity.
- [ ] Duplicate/stale/concurrent requests; timeout after commit; reconciliation without duplicate effects.
- [ ] Provider/storage failures; post-commit delivery and background recipient reauthorization.
- [ ] Every list: server search/filter/sort/pagination; active chips; four empty/error states.
- [ ] Every detail: breadcrumb, title, status, actions, metadata, grouped sections and lazy related accordions/counts (latest user-approved sectioned direction).
- [ ] Forms: labels/types/required markers/errors/focus/keyboard/dirty cancel; pending/double-submit protection.
- [ ] Destructive confirmation; selected-row bulk toolbar; skeleton/refetch/button loading; responsive 44px mobile targets.

## Verification evidence

- [Coverage and source integrity](evidence/checklist-coverage-validation.json).
- [Current local suite: 39 frontend pass / 9 fail; 35 Python pass](evidence/checklist-session-validation.json).
- [Security findings and exact containment](CATALOG_SECURITY_FINDINGS.md).
- Original versions of the two editable ledgers are retained under checklists/baseline so source-line references do not drift as working status changes.

## Maintenance procedure

1. Begin each slice at the latest ledger checkpoint; read its module and linked shared contracts.
2. Add exact target/test/evidence mapping using MOD/page/evidence-clause IDs; do not invent field names.
3. After review and verification, update the ledger with actual results and blockers. Link evidence beside any checked clause.
4. Check the module/file/phase/chain only when EVERY relevant child contract is accepted. Keep unresolved items open.
5. Preserve the original temporary pack. If its contents change, compare coverage.json hashes, reconcile changed clauses explicitly, and invalidate affected old acceptance; never regenerate over checked progress.
6. Report completed, verified, remaining and blocked separately. No blanket finished-work claim until all applicable checks close.

## Create/edit/save recheck - 2026-11-08

**Status: locally checked; live Taruvi CRUD remains unverified and intentionally blocked. No business data was changed.**

- Current tool inventory for this conversation exposes **no `mcp__taruvi*` tools**. The configured project MCP record is enabled and points to `siteId=insurance&appId=hmg-studio`, but the read-only `codex exec` connection probe exited before tools could be used: MCP worker reported `AuthRequired` with OAuth protected-resource metadata. A second CLI error reported the selected `gpt-5.4` model is unsupported for this ChatGPT account; this does not prove the user's login/session is invalid. No datatable/function names or counts were retrieved in this run.
- Code/schema manifest inspection: **62 logical resources** are registered; none has `writeAuthorizationVerified=true` or verified generic `create/update/delete` actions. `writeBlocker()` therefore intentionally prevents writes, and `products` additionally requires the verified product command. This safety gate must not be bypassed by elevating UI/admin access.
- Existing route/page coverage and known gaps are in [ERP_EXPANSION_PLAN.md](ERP_EXPANSION_PLAN.md), especially the 32-module CRUD disposition and implementation parity matrix. Routes/forms for core create/edit surfaces exist, including product/order/return and PO create, but route presence/form preview is not persistence acceptance. Workflow queues and derived ledgers need server commands, not direct generic CRUD.
- **TypeScript:** `npm run typecheck` passed (`tsc --noEmit` and `tsc --noEmit -p tsconfig.node.json`).
- **Focused CRUD-workspace regression tests:** 41/41 passed across `src/pages/erp/{index,inventory,commerceCreate,purchaseOrderWorkspace,purchaseOrderCreate}.test.*` (198.07s; `--maxWorkers=1 --testTimeout=20000`). These test local UI/data contracts only; no live save/reopen was performed.
- **Full frontend suite attempt:** 271 passed, 7 failed across 37 files (314.32s). Failures: provider/categories/PO tests timed out at 5s under full-suite load; one Categories assertion expected `.ant-select-item-option-selected`; no evidence these indicate the generic database writes are enabled. Rerun affected tests individually after resolving load/selector issues before treating suite as green.
- **Exact resume step:** expose a working authenticated Taruvi MCP session to this Codex conversation (or supply an approved read-only schema/function export and authenticated test path); re-read exact schemas and function contracts, then complete one isolated, approved non-production write chain (create -> reload -> reopen -> edit -> persisted readback) before approving any module. For live HMG, first obtain explicit approval for the specific records/actions; no live transactions were created here. Continue through the module inventory without claiming acceptance from test results alone.

### Recheck addendum (2026-11-08)

- Reran the provider, Categories and PO-create files serially with a 20-second test timeout: **20 passed / 2 failed**. Taruvi provider and PO-create tests passed when isolated. Two reproducible Categories UI test failures remain: switching card/table view cannot find an accessible `role="table"`, and the create-dialog assertion relies on a stale Ant Select DOM selector (`.ant-select-item-option-selected`). These are local Categories UI/test-contract defects to fix before calling the full suite green; no backend write was attempted.

## Continuation checkpoint - 2026-11-09

**Status: read-only live schema audit and local validation hardening completed; generic master saves remain blocked. This is not all-module or end-to-end acceptance.** Earlier checkpoints above remain historical evidence, not current access findings.

- The app-scoped schema audit in `.cache/crud-audit-20261109/schema-contract.md` confirms that all **62 manifest resources** match the corresponding tables in the **65-table live inventory**; no schema drift was found. Schema alignment does not establish mutation authority or transactional safety.
- Local changes are limited to the ERP service and its tests (rating range **0–5** and signed 32-bit integer validation), plus the product-master Python command and its tests (authorization receives the full normalized create attributes; nonnegative signed 32-bit integer validation). Existing native Categories/preferences paths remain separate from the generic ERP save gate.
- **Verified locally:** ERP service tests **32 passed**; shared ERP form tests **27 passed**; product-command tests **51 passed**; full backend suite **510 passed**; TypeScript passed. Code review and security review passed for this scoped change. The full frontend suite is still running at this checkpoint; no full-suite pass is claimed.
- The user approved scoped create/edit for the **existing Admin role on master records**, excluding stock/payment/order posting and deletion. **No live grant was applied.** A trusted Admin-to-organization binding has not been verified, and the historical stored-row-only update policy permitted organization reassignment. The local `master-policy-plan.md` proposal is not a deployed policy or authorization proof.
- The product command remains **undeployed and unwired**; generic saves remain intentionally blocked. No deployment, live writes, or QA records were created in this continuation. Passing local tests does not prove create → reload → reopen → edit persistence.
- **Exact next dependency:** verify a trusted server-owned Admin organization binding and a backend authorization mechanism that checks both stored and proposed organization values (or enforces organization immutability). Validate same-organization allow, foreign-organization deny, and reassignment deny before applying any scoped master grant. Then separately satisfy product-command deployment/wiring and approved persisted readback prerequisites; stock/payment/order posting still requires the previously documented atomicity/idempotency guarantees.

## Current checkpoint addendum - 2026-11-09 (non-platform QA in progress)

**This addendum supersedes stale current-state statements above, while retaining their historical evidence. No module or end-to-end chain is newly accepted.**

- **Scope and local fixes:** app-scoped MCP for `insurance/hmg-studio` is working; the audited **65 live tables** align with all **62 manifest resources** (`.cache/crud-audit-20261109/schema-contract.md`). Local changes include the Categories Controller save-validation fix, ERP rating **0–5** and signed 32-bit integer validation, and product-command authorization using normalized create attributes. These are local fixes, not deployed workflow acceptance.
- **Authorization decision:** the user approved the standard app **Admin** role across all HMG-Studio business organizations, not username-specific access. Pradeep already has Admin; his platform-owner context bypasses app policies and cannot demonstrate their enforcement. This corrects the earlier assumption that the approved Admin scope must be limited to one business organization; it does not authorize stock/payment/order posting or deletion.
- **Live staging and rollback:** customer/supplier read/create plus organization-read policies were temporarily staged. API-key QA persisted **two positive records and one negative-credit record**. All **three policies were restored exactly**, with rollback verification recorded in `.cache/crud-audit-20261109/admin-create-policy-apply.json`. Policy rollback is not record cleanup; these writes supersede earlier “no live writes/QA records” statements for the current continuation.
- **Interpretation correction:** the negative-credit write does **not** prove a policy malfunction. Taruvi documents that API keys and users with organization access bypass app policies: [credentials guide](https://docs.taruvibase.com/docs/products/auth/guides/get-credentials) and [authorization security limits](https://docs.taruvibase.com/docs/products/authorization/security-limits). Here platform organization access must not be confused with the app's business-organization records. API-key or platform-owner success is not an app-role allow/deny test.
- **Current local evidence:** the root agent reran `python -m pytest backend/tests -q -p no:cacheprovider` with elevation: **531 passed in 7.67s**. The existing `.cache/crud-audit-20261109/frontend-final-tests.log` records **37 files / 297 tests passed in 325.65s**; this is an earlier run, not a fresh frontend verification at this checkpoint. A later overlapping frontend-resume run had **one timeout and was not green**; an isolated Categories rerun subsequently passed **12 tests**. Do not combine those runs into a claimed fresh full-suite pass.
- **Still blocked:** generic master saves remain disabled by the static `writeBlocker()` before a network request; the user's localhost `/inventory/create` screenshot confirms that gate. The product command remains **undeployed and unwired**. No completed create → reload → reopen → edit chain, frontend/backend deployment, stock posting, or all-module completion is claimed.
- **Next verification, in progress:** the user separately approved temporary **non-platform QA Admin** verification to exercise app-policy enforcement. No outcome is available at this checkpoint. Record its authenticated allow/deny results and cleanup disposition separately before changing any acceptance status or enabling saves. Continue Product → PO → receipt/stock → invoice/order/payment, retaining atomicity, concurrency, rollback, and idempotency gates for transactional writes.

## Final continuation checkpoint - 2026-11-09 (native create discrepancy)

**The approved non-platform QA Admin probe has now completed; the earlier “in progress” checkpoint is historical. Persistence acceptance remains blocked, and no module or chain is newly complete.**

- **Local product authorization update:** removed the legacy `user_data.organization_id` equality restriction from `product_master` to match the user-approved all-business-organization Admin scope. Authority still relies on the unchanged `principal=None` policy check, caller-scoped organization/product reads and native write authorization, plus same-organization foreign-key validation. No username-specific grant or generic write-flag change was introduced. Security and code review approved this scoped change.
- **Latest backend verification:** the root agent's full backend run passed **573 tests in 8.13s**, exit **0**. This supersedes the earlier backend counts only; it is not a new frontend run or live workflow acceptance. The frontend evidence and timeout qualifications in the preceding addendum still apply.
- **Fresh normal-session result:** `.cache/crud-audit-20261109/session-admin-probe-463991e29eed.json` records advisory create **ALLOW**, followed by a valid native customers POST returning **403 `permission_denied`**. Authoritative privileged readback after rollback found **zero matching rows**. This probe made **one create attempt**; negative cases were **not run**, and it created no successful new master row.
- **Verified rollback and account disposition:** all **three** temporary policies are `restored_verified`; the temporary QA Admin role is `revoked_verified`. QA account `04692f8f-4870-4013-9a19-fb3021bbf009` remains **roleless**, not deleted. This probe's zero-row result does not erase the earlier API-key QA records or imply their cleanup.
- **Platform escalation:** a scoped Taruvi `report_bug` submission returned `{"success":true}`; evidence is `.cache/crud-audit-20261109/native-create-bug-report.json`. **No ticket ID was returned.** The observed result is a reproducible authorization-path discrepancy between advisory and native create, not proof of its exact underlying cause or that every resource fails.
- **Still not enabled:** the product command remains **undeployed and unwired**; generic master save flags remain unchanged. The user's product screenshot reflects the actual frontend `writeBlocker()`, not this native POST response. No deployment readiness, completed create/edit/readback chain, stock/financial posting, or all-module completion is claimed.
- **Next external dependency:** Taruvi support must compare the native and advisory authorization paths' principal, scope, and resource attributes for the recorded request. Resolve that discrepancy and repeat approved normal-session positive/negative persistence checks before enabling affected saves. Overall completion remains blocked on this external dependency, with product deployment/wiring and transactional guarantees still independently outstanding.

## User-requested WIP commit checkpoint - 2026-11-09

**Checkpoint commit requested by the user, not feature completion or deployment readiness. This update supersedes earlier current-state blockers without removing historical evidence.**

- Standard unconditional app **Admin** customer CRUD succeeded live: create → read → edit → read → physical delete → verified absence (`.cache/crud-audit-20261109/full-admin-master-probe-91109440e1f1.json`). Both temporary policies were restored and the QA Admin role revoked; the QA account remains roleless. The earlier 403 is therefore **not a blocker to the standard role-only app Admin model**. Its underlying conditional-policy discrepancy remains unresolved; this single-resource probe does not establish all-resource acceptance.
- Local product command now supports create/update/readback/logical delete. Metadata updates preserve stock, organization, type, tracking, and currency; price aliases are synchronized and timestamps normalized. Frontend private product-command integration and generic customer/supplier logical delete are implemented locally. **Runtime write flags remain disabled and unchanged; the product function is not deployed.**
- Latest evidence: **632 backend tests passed**; focused frontend initially **72/74**, with two timing timeouts that passed targeted reruns; the latest **six recovery tests passed**, and typecheck passed. This is **not** a fresh all-green full frontend or post-fix full-suite claim.
- Rollout script is prepared only under ignored `.cache`; the root agent canceled at its password prompt **before any network activity** when the commit request arrived. No rollout/deployment occurred. Cache secrets, logs, and dependency archives are not source and are excluded from the commit.
- Continue deployment/authorization verification and approved persisted UI readback before enabling saves; stock and financial workflows still require their independent transactional guarantees. No module, all-module checklist, or end-to-end chain is newly marked complete by this WIP commit.

## Live master API acceptance and release preparation - 2026-11-09

This checkpoint supersedes earlier “undeployed/disabled” master-record statements, not the remaining workflow acceptance gates. [Sanitized durable evidence](evidence/master-crud-session-acceptance-20261109.json) preserves only action results, statuses and source hashes from the retained live audit.

- Standard app Admin session verified **products, customers and suppliers** through create → read → update → read → logical delete. The deployment audit reports `passed=true`, `retained=true`; the three corresponding manifest write gates and command slugs are now enabled. Roleless customer create returned **403**, as did both private master-command execution attempts. The temporary QA Admin role was revoked. This is API-level master acceptance, not full catalog/contact feature parity.
- Browser/UI acceptance is **not claimed**: the user is testing the UI manually. No all-module checklist or E01–E12 chain is newly marked complete from these API probes.
- The user explicitly retained **all-or-nothing stock behavior on 2026-11-09** and prioritized finishing tests and release tooling. Stock, receipts, payments and other posting remain blocked pending supported atomic transaction, concurrency, rollback, idempotency and direct-write isolation proof. No compensating multi-request write sequence is accepted as an atomic substitute.
- Local release tooling defaults to dry-run, prepares artifacts locally only on request, and requires explicit live upload. Accepted upload returns exit **2**, requiring independent deployment verification rather than claiming release success. **Eight mocked release tests passed**. The generated/tracked dependency lock matches installed package versions with **zero mismatches**; this is not proof of a fresh clean install.
- Test checkpoint: the three previously failing frontend files passed targeted reruns (**44 + 12 + 11 tests**, not a separate full-suite claim). The fresh full frontend run is still pending at this checkpoint. Backend last full run had **753 passed**, followed by **98 passing contact-metadata tests**; the fresh full backend result remains pending. Do not sum overlapping counts or treat prior runs as validation of every later edit.
- No new commit or frontend upload was performed for this documentation/release-preparation checkpoint. See [the existing release document](OPERATIONAL_WORKSPACE_RELEASE.md) for the dry-run/prepare/upload boundary; user manual UI testing and posting guarantees remain separate release gates.

## Verified local release-candidate checkpoint - 2026-11-09

This supersedes the preceding pending-test status, while preserving earlier failures and their chronology. It establishes a tested local build/package, **not complete application production readiness**.

- Full frontend: **37/37 files, 332/332 tests passed in 643.78s**, `FULL_SUITE_EXIT=0`. Typecheck exited **0**. Full backend: **758 passed in 8.80s**, process exit **0**. Release tooling: **8/8 mocked Node tests passed**, exit **0**. Counts overlap earlier targeted runs and must not be added together. Whitespace validation (`git diff --check`) exited **0**.
- Explicit local `--prepare` completed build and packaging with exit **0** for **insurance/hmg-studio**: Vite **6.4.5**, **6719 modules**, **40.25s**. Prepared archive: `.cache/releases/hmg-studio-1794235299723.zip`. Target identity, exact configured-key exclusion and artifact guards passed. **No frontend upload occurred**; the archive is local and is not evidence of live frontend activation or UI acceptance.
- The build reports a **4.05 MB minified main JavaScript chunk (1.18 MB gzip)**. This warning remains open; passing build/package checks does not establish browser performance acceptance.
- Lock/install comparison found **zero existing-dependency version mismatches**; **47 new archiver dependencies** were installed with scripts disabled. This is not a clean-environment reproducibility guarantee.
- The user is performing manual UI testing. **Stock, returns, approval and other business posting remain intentionally blocked** under the user's all-or-nothing requirement; the native transaction, concurrency, rollback, idempotency and direct-write isolation gates still apply. No all-module/chain acceptance, new commit, or full-production-ready claim follows from these local results.

## HMG Stones-site migration test handoff — 2026-11-10

Both apps remain separate on `https://hmg-stones.taruvibase.cloud`. Destination previews:
- HMG-Studio: https://hmg-studio-hmg-site.taruvibase.app/
- HMG Stones: https://hmg-stones-hmg-site.taruvibase.app/

Both workers are app-associated defaults with completed active builds and all served file hashes verified. Source Insurance deployments are unchanged. Pradeep has the existing scoped administrator role in each destination app; assignment readback passed. Browser-session acceptance is for the user, not inferred from API-key tests.

Copied953 original business rows and verified456 original media files. Reused110 official Stones references,9categories and108 unique privately copied images in Studio. Reference products are inactive with unknown prices/zero stock, not fabricated saleable inventory. Added40 labelled QA input records across15tables; no stock/financial posting effects. Four historical placeholders remain inactive with zero native app access.

Dashboard additions are deployed: six-month shipped/delivered order totals, status pipeline and catalogue completeness. Live function checks passed; visible metrics include accessible synthetic/test workspaces and are not production-only KPIs.

Validation: Studio335frontend tests/37files and770backend tests; Stones42tests/4files; both typechecks/builds passed. One expected duplicate-ZIP backend warning. Static Stones preview security reviewed; dependency remediation still open. No Node server or node_modules deployed.

**Remaining:** user manual acceptance; AI secrets deferred by user; all-or-nothing stock/return/approval posting remains gated; production/test dashboard filters; dependency remediation; final source-write-frozen delta reconciliation before retiring Insurance. This is a migration preview handoff, not all-module production acceptance.

Sanitized evidence: `evidence/site-migration-20261110.json`. Migration receipts and rollback/source archives remain in ignored `.cache/migration-20261110/`. No commit or push in this continuation.


## Readiness continuation — 2026-11-11

Production dashboard totals now exclude QA/test and unclassified workspaces. Explicit organization `settings.dataset_kind` classification preserves existing settings; all metrics use the same caller-visible subset. The selector switches between production and QA without stale cross-dataset values. Live production: 110 inactive catalogue references with images, zero active products/orders/inventory value. QA: 23 active products and 22 orders. Imported references remain unpriced, not invented stock.

Both destination workers were updated and served assets matched the exact uploaded archive manifests (Studio and Stones build IDs in `evidence/readiness-20261111.json`). Insurance remains unchanged. Stones was built from the isolated migrated baseline, not the dirty ERP working tree. UI acceptance remains manual.

Dependency cleanup: removed unused Refine CLI/devtools/simple-rest, retained Taruvi pins, added the SDK's explicit Axios peer, updated Vite/Vitest and affected transitive dependencies. Studio uses Archiver 8's named ZipArchive API with an actual ZIP regression. All three audited trees report zero known advisories. Existing upstream package deprecation and large-chunk warnings remain, not vulnerability or full production-readiness guarantees. Development/build/preview scripts now invoke Vite directly. Studio clean installation exposed an upstream Navkit React 19 component type conflict; importing only its declared menu types avoids compiling unrelated components in this React 18 app. Lockfiles must be retained.

Validation: 340 Studio frontend tests, 780 backend tests, 12 deployment tests, 42 isolated Stones release tests passed; typechecks/builds passed. Dirty Stones previously had two transport collection errors after dependency removal; the explicit Axios peer fixed both and the focused 31-test recheck passed, but that dirty tree is not the deployed release.

Created sensitive `hmg-api-key` secret type. No credential values were read or migrated. AI consumers live in `hmg_stones`: re-enter `openai_key` and `G_API_key` into `api_key`, not database Host or `g-key` in sibling Studio. AI functionality is not verified; preview-provider contract/verification gates remain.

**Still blocked:** stock movements, return posting and approval posting require a documented Taruvi-native cross-table atomic command/transaction. Separate Python SDK calls do not supply all-or-nothing rollback; no compensating-write substitute or unsafe enablement was shipped. Manual acceptance and source-write-frozen delta reconciliation remain before retiring Insurance. No commit or push performed.


## Isolated stock ledger QA checkpoint — 2026-11-11

The approved single-event Taruvi-native ledger now passes 16 live QA acceptance checks, including concurrency, same-ID replay, unique conflicts and denied bypasses. Only organization `5d61a85e-d8e4-5a2a-a861-0c1dabe2a352` is enabled; legacy/global stock remains unchanged. No production cutover, Sales/PO approval posting, dynamic product registration or new entitlement issuance. This narrows the earlier blocker only for the isolated QA ledger.

840 backend tests and 356 frontend tests/39 files passed; typecheck/build passed. Studio destination build `e043d171-b88a-40f8-8d32-1c950986d9d6` completed and six served files matched the archive. No browser acceptance, commit or push. See [QA handoff and manual steps](STOCK_LEDGER_QA.md) and [sanitized evidence](evidence/stock-ledger-qa-20261111.json), including permission-probe limitations and remaining migration/all-reader/capacity gates.
