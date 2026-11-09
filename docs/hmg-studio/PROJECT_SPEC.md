# HMG-Studio implementation: discovery and ownership

## Current execution contract - 2026-11-08

This checkout, **not HMG Stones**, is the sole implementation target. The user prioritizes complete vertical workflows in order: Product -> Purchase Order -> Receipt/stock -> Invoice (an order subflow in Inventoros), then the remaining 32-module functionality matrix in [ERP_EXPANSION_PLAN.md](ERP_EXPANSION_PLAN.md#implementation-level-parity-matrix-2026-11-08-active-checkpoint). Route/button presence and historic local tests do not prove a working workflow. Acceptance requires Pradeep-authenticated create -> reload -> reopen -> edit -> applicable business action -> persisted related-row/stock/money/dashboard readback, invalid/duplicate/denied/failure cases, and no browser/API errors.

Source owner: `C:/Users/proj/Inventoros` and the copied `development-pack/modules/*.md` annexes. Target UI owners: `src/App.tsx`, `src/erp/modules.ts`, `src/pages/erp/index.tsx`, specialized `inventory.tsx`, `src/services/erp.ts`, existing Refine/Taruvi providers and theme. Target backend owners: `backend/functions/` with exact schemas from dated `backend/schema/historical-60-live-schema.json` pending renewed app-scoped MCP confirmation. Tests stay in `src/**/*.test.ts*` and `backend/tests/`, not live Taruvi rows. The existing HMG app is untouched. No fake production records, user onboarding, broad role assignment, live transaction mutation, deploy, commit or push is authorized by this phase.

**Current Product slice:** source-confirmed scalar form fields/validation are implemented in the existing generic owner, while `backend/functions/product_master.py` implements offline-tested, zero-stock, single-row create/readback only. It rejects variants, suppliers, images and positive opening stock. That function is **not registered or deployed**; the UI write gate remains closed even if manifest flags change. Focused frontend tests (30/30), TypeScript typecheck and earlier isolated backend tests (25/25) pass locally. This is progress, **not a complete Product workflow**. A source-mapped PO header-and-lines draft form now has a route and organization-scoped live lookup owner, but no save command is deployed or wired. PO receiving/stock, invoice issue/payment and posted-document corrections need a verified server transaction/CAS/idempotency primitive and explicit authorization/organization proof before their commit actions can be enabled. The current MCP binding responds for another app scope despite local config; no current live schema/write/browser acceptance is claimed. The user stopped Computer Use during this turn.

## Compact inventory and bounded reports - 2026-11-07

**Implemented and locally/API verified; not full-module acceptance.** Earlier dated checkpoints remain historical.

- Inventory prioritizes stock-by-location and suppliers, adds capability-relevant variants/assembly/serial/batch sections, and keeps remaining relations behind **More related data**. Expanding a panel still owns its query; unloaded counts are unknown, not zero. The accessible stock chart reuses the displayed stock page and table, not another query or a page-derived product total.
- `/reports` now generates four fixed operational views: sales orders, purchase orders, customer payments and stock adjustments. An authorized organization is required; only organization lookup runs before **Generate**. Complete caller-visible results are bounded to **500 rows**, with stable ID ordering and fail-closed pagination checks. Saved definitions remain secondary at `/reports?view=definitions`; arbitrary saved configurations/SQL are not executed.
- Existing lists export mapped current-page/current-record values. Reports export the **complete generated bounded result**, not only its table preview page, using the existing CSV/HMG print-preview helper. Neither path claims an issued invoice, delivery/email, arbitrary all-database export, atomic snapshot or recognized revenue.
- **228 frontend tests /31 files passed (552.90s)**; both TypeScript configurations passed. [Frontend evidence](evidence/operational-frontend-verification.json). [Ordinary SDK/provider proof](evidence/operational-reports-live.json): all four report kinds succeeded over eight authorized reads, without admin fallback. Broader backend/enrichment/deployment status belongs to the [operational release record](OPERATIONAL_WORKSPACE_RELEASE.md).
- Native C/U/D, transaction atomicity and full 32-module/E01-E12 acceptance remain separate gates. This checkpoint makes no browser, visual, build, deployment or all-CRUD acceptance claim.

### Report contracts and owners

`src/pages/erp/reports.tsx` owns organization selection, scope controls and explicit generation; `src/services/operationalReports.ts` owns the four fixed definitions, bounded provider reads and validated display projection. The existing dispatcher only selects this workspace. Existing native auth/data providers and safe export components are reused; no new identity table, client, mutation or saved-report execution engine is introduced.

Organization lookup uses the current session and only auto-selects a single valid authorized row when the response proves exactly one complete result. Report date boundaries are UTC, including native timezone-less datetimes; date-only purchase-order values are strictly validated. Server filters apply organization, date and optional status/type, with a currency filter only for sales/purchase orders. Results are invalidated on identity change, identity refresh/error, scope change and failed generation; late responses cannot restore old-owner exports.

Each report reads pages of at most 100 up to the 500-row limit, requires stable totals and increasing unique valid IDs, rejects foreign-scope or malformed rows, and proves exhaustion. It fails rather than publishes a partial result on overflow, incomplete pages, duplicate IDs or changing totals. Sequential reads are not a transactionally consistent snapshot. Status/type counts summarize the completed result, not the visible preview page.

Money is validated as exact decimal minor units, never coerced from booleans/objects or unsafe JS numbers. Sums remain separate per currency. Payments have no native currency column: exact authorized parent-order lookups provide it; unavailable currency suppresses the monetary summary instead of assuming INR. Payment rows show void state; only explicit `voided_at: null` enters clearly labelled non-voided summaries, with voided/unknown states disclosed. Stock-adjustment quantities are not summed across products/units.

Stock charts say **Locations on this page** unless all returned row/location IDs are valid and unique (case-insensitive) and the valid row count exactly matches the provider total; only then **All accessible recorded locations** is used. Unknown/invalid values are omitted with disclosure, valid zero and signed quantities remain distinct, and the existing table remains the exact-value fallback. This is caller-visible coverage, not proof of all organization stock.

## Latest sectioned workspace checkpoint - 2026-11-06

**Implemented/read-verified, not full-module acceptance.** This supersedes earlier detail-tab presentation and test totals; prior evidence remains historical.

- **UI:** grouped business details and persisted-value summary cards replace generic horizontal detail tabs/raw-field cards. Related accordions mount paginated queries only when expanded. Shared bounded FK name lookups, multi-field server search, semantic statuses and real registered-record links reuse existing Refine query owners. Inventory keeps its specialized overview; Categories adds cards/table views; Approvals remains read-only.
- **Exports:** mapped visible current-page/current-record CSV and HMG-branded print previews (including browser Print-to-PDF) cover generic views/related lists, Inventory/stock/suppliers, Categories and personal Notifications. Identity/error gates, formula escaping and size bounds apply. No hidden-field, all-filtered, issued-invoice, email or payment-proof claim.
- **Verified:** independent review followed by **187 frontend tests /29 files** (273.68s), **250 Python tests** (5.79s), and both TypeScript configurations exit 0. [Final verification](evidence/sectioned-workspace-verification.json). No browser/visual acceptance, build, deployment or commit.
- **Synthetic data:** **60 transaction headers +75 supporting rows =135 rows /19 tables**, May-October 2026. Six new fictional products comprise four illustrated slabs and two assemblies; existing catalogue references remain separate. Ordinary-session exact readback verified all 135 rows, four private JPEG downloads matched SHA, and 58/58 bounded advisory checks matched. These are historical snapshots, **not executed stock/payment/approval workflows**. [Readback](evidence/historical-60-normal-readback.json), [images](evidence/historical-60-normal-images.json), [policy checks](evidence/historical-60-normal-policy.json).
- **Remaining:** seven exact-ID child READ policy changes added no C/U/D authority. Native ordinary customer POST 403 remains a provider blocker; original-row authority, atomicity/concurrency/idempotency/rollback and full source parity remain unproved. Platform event subscriptions were empty, but physical database triggers were not verified. Full-filter export, operational workflows and all-module/E01-E12 acceptance remain open.

### Current reuse/ownership map

`src/pages/erp/index.tsx` remains the generic list/detail/guarded-form owner, with one parent record query and conditional related-list queries. Pure `src/components/ErpBusinessOverview.tsx` and `src/services/erpPresentation.ts` provide grouped fields, summaries, statuses and display formatting without another data owner. `src/hooks/useRecordNames.ts` reuses bounded batched business-reference lookups; it never queries native identity tables. Existing `inventory.tsx`, Categories and personal Notifications retain their specialized owners. `src/components/RecordExportActions.tsx` / `src/services/recordExport.ts` map only displayed authorized values into bounded CSV/print snapshots. Native auth/providers/notifications and action-specific write blockers remain unchanged.

## Prior product workspace checkpoint - 2026-11-06

This checkpoint supersedes historical navy/blue styling, 122/107 test totals, pending JSON fixtures and storage-unavailable statements below. **No complete module or E01-E12 chain is accepted.**

- **Implemented:** scoped Ant Design 5 / ProComponents inventory pilot, retaining React 18, Refine 5, native session/auth/providers and existing mutation notifications. Controlled server search/filter/sort/pagination uses one products query. Product detail reuses the parent record for stock/price/cost/value and grouped metadata, image, explicitly labelled SKU barcode preview, QR and print; warehouse stock/supplier views resolve names. All generic related tabs are reachable and only the selected panel queries; unknown/partial totals are not zero. The shell uses shared olive/ivory tokens and the unmodified official website logo; palette inspiration is not an official brand specification.
- **Verified locally after independent review:** **152 frontend tests /25 files**, 320.92s (`.cache/product-workspace-vitest-final.log`); both TypeScript configurations exit 0 (`.cache/product-workspace-typecheck-final.log`); **208 Python tests**, 4.08s, exit 0 (`.cache/product-workspace-pytest-final.log`, `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend -q`). Python comprises 200 backend/tests plus 8 schema tests. Earlier 207/181/107 and focused counts are historical/subsets, not additive. [Persisted final verification](evidence/product-workspace-verification.json).
- **Live catalogue:** 263 deterministic `HMG-WEB-*` reference products imported with native create/readback and ordinary-session list HTTP 200/total 263. They are inactive public-catalogue references, not physical inventory; stock 0 and required legacy price 0 are technical placeholders, selling/purchase prices are null. UI suppresses reference stock/value and never treats legacy price 0 as a quotation. [Import evidence](evidence/hmg-catalogue-import.json), [normal read](evidence/hmg-catalogue-normal-read.json).
- **Dashboard source boundary:** `backend/functions/dashboard.py` excludes inactive products before valuation, low-stock, recent-product and count calculations, so the inactive catalogue references do not enter that source projection. This is source inspection, not a new live deployment/hash audit or refreshed dashboard totals.
- **Targeted JSON repair:** four nullable native fields added without changing legacy TEXT/`any` columns: saved_reports `columns_json` (array of strings), `filters_json` (object with items array), `sort_json` (object), activity_logs `properties_json` (object). Existing synthetic report received only new fields; one missing deterministic activity fixture was inserted. Exact native types/values read back, including ordinary-session HTTP 200. Structured detail rendering is read-only, bounded and redacts sensitive values; it does not execute report configuration. Seeder maps only missing fixture writes and strictly compares both typed and present legacy values. [Migration](evidence/structured-json-20261106T184314271383Z.json), [normal read](evidence/structured-json-normal-read.json).
- **Accounting:** 62 business tables; prior verified 895 fields plus four additive fields = 899 (190 FKs/324 indexes unchanged by this patch). The separate QA diagnostic table is not a 63rd business resource. Seed scope now has 76 retained rows: prior 74 semantically verified plus repaired report 1 and new activity 1. The 263 catalogue references and diagnostic row are separate populations, not an asserted global database count. Historical frozen-plan readback is preserved; typed-wire acceptance supersedes only the two targeted JSON cases.
- **Private media:** authenticated private-image component is implemented with identity/revocation gates, raster MIME/size checks and object-URL cleanup. One ordinary QA object read returned 200, exact SHA and 53,083 bytes; anonymous 401. Existing storage policy permits authenticated reads, **not organization-scoped reads**. Final delivery verified **252 unique private products-bucket objects and 263 owned product image links** (last link run 262 updates  + 1 exact probe skip). Only `image` was patched; all other fields except server `updated_at` were preserved. Ordinary QA linked-prefix query returned HTTP 200/total 263; one linked product and its private bytes returned 200 with exact SHA. The separate `Images` bucket remains untouched/reserved. Storage collision atomicity and image-PATCH CAS remain unproved. [Delivery](evidence/hmg-catalogue-delivery-summary.json), [ordinary linked count](evidence/private-media-linked-normal-count.json), [linked byte proof](evidence/private-media-linked-normal-read.json). [Bounded session proof](evidence/private-media-normal-read.json).
- **Still blocked:** native customer POST 403 despite advisory ALLOW, including a bounded zero-string diagnostic; policy was restored exactly and readback remained empty. No frontend write gate was enabled. Original-row/update authority, generic deletion, stock/money atomicity/rollback/idempotency/concurrency, remaining module workflows and full source parity are unproved. [Provider escalation](evidence/native-create-provider-escalation.md), [diagnostic rollback](evidence/customer-zero-string-policy-test.json). No browser/computer use, build, deployment, commit or full-module completion in this slice.

## Historical checkpoints (superseded where noted above)

Date: 2026-11-06. Destination: `C:/Users/proj/HMG-Studio` only.

## Professional UI and personal inbox continuation - 2026-11-06

- Extended existing theme/sidebar/Home owners: navy/slate navigation, warm stone accents, white padded cards, responsive KPI links, clearer headings and semantic statuses. No new provider, font, asset or dependency. Global visible focus and reduced-motion rules added. Token contrast tests pass (white text: primary 6.18:1, complete 5.12:1, amber 5.61:1, error 5.87:1); sidebar text/state pairs meet 4.5:1. This is code/local-test proof, not visual or keyboard/browser acceptance.
- Personal notifications now have a dedicated list/detail inbox and header bell/preview through the existing provider. Server-side owner/search/read-status/type filters and pagination; backend unread total; verified identity/response ownership; safe internal read destinations; loading/error/empty states. Notification resources advertise list/show only. Mark-read, delete, preferences, event generation and delivery remain unavailable.
- Notification security review caught imperative `refetch` bypassing a disabled invalid-ID query and detail navigation retaining list pagination. Guarded refetch, retained owner filters, required detail ID, first-page detail queries and response-ID checks resolve those findings. Tests also cover owner changes, cached-data denial and unread-count failure after success; they do not substitute for live policy proof.
- New normal-session owner proof passed: own/unfiltered list and own detail HTTP 200, foreign-owner filtered list zero, foreign detail HTTP403, unread total 1. This is bounded QA ownership proof, not general production membership or notification write authorization.
- Latest broad audit covers 62 resources: 54 read HTTP 200, 8 HTTP403; advisory C/U/D evaluated in bounded batches of 50 + 12 after the 62-item request hit the limit. Only customers/suppliers create were advisory ALLOW for the supplied payloads; all update/delete decisions DENY. Actual customer POST still 403. See the 32-module CRUD disposition matrix in [ERP_EXPANSION_PLAN.md](ERP_EXPANSION_PLAN.md#32-module-crud-disposition-and-bounded-qa-evaluation).
- **Still incomplete:** all 32 modules/source views and E01-E12 chains; native create/proposed-versus-original-row authority, JSON persistence, atomic stock/money commands, remaining nontransaction workflows. No browser/computer use, build, deployment or commit in this continuation.

## Current expansion checkpoint (supersedes historical discovery below)

- Existing React18 / Refine5 / MUI / Taruvi provider architecture is retained. Session-only browser client, native ACL and real `Authenticated` boundary protect settings/navigation/data. No replacement identity table or browser API key.
- **62 business tables: 58 new +4 existing; 895 fields, 190 FKs, 324 indexes** verified in `backend/schema/final-verification.json`. `liveVerified` is metadata proof, not mutation authorization.
- `src/erp/modules.ts` / `src/App.tsx` own the 32-entry protected registry. `src/pages/erp/index.tsx` / `src/services/erp.ts` own reusable reads/guarded forms; categories/account retain existing owners. `approvals.tsx` mounts one pending-only read queue at a time with no decisions; `platform.tsx` uses native user/app providers only.
- `src/pages/home/index.tsx`, `src/services/dashboard.ts` and `backend/functions/dashboard.py` own validated caller-scoped live projection, currency separation, parsed UTC dates and fail-closed completeness. Normal-session dashboard execution now returned **HTTP 200** (`evidence/dashboard-normal-session.json`): **9 products, INR 3,106,300 inventory valuation, 3 pending orders, INR 209,400 receivables, zero current-month revenue, 6 visible categories and 3 locations**. The category count includes an older QA organization A category; this is caller-visible scope, not exclusively the new synthetic organization. Earlier pre-seed MCP values remain historical. This is API/session evidence, not browser acceptance.
- 58 new-resource policies and four lookup exceptions retain recorded native readback. QA role **1156** now includes the new dedicated `qa_hmg_inbox_20261106` user (`1bbbcad2-46c3-480f-92d6-acdf566b510a`) alongside the previous retained QA user; its wildcard policy remains disabled. Notification reads now require the synthetic organization, role and one of **two exact username-to-user-UUID pairs**, because native `P.id` is a username, not the notification FK UUID. The earlier UUID assumption produced HTTP400 and was corrected with full policy readback: `evidence/notification-owner-policy-20261106T171755374062Z.json`. No notification C/U/D grants or general membership grants were added.
- Fixture accounting: the **frozen plan remains 75 rows /27 tables, with 73 semantically matched rows across 25 tables**. An additional owner-specific notification `275aeb92-a8ae-5021-b639-7a0fc9050631`, outside that frozen plan, is now verified. Therefore **75 synthetic rows are present: 74 semantically verified across 25 tables plus one unverified saved-report row**. Report JSON still reads as strings; activity was not inserted. Do not confuse present rows with accepted frozen-plan rows or claim all 27 tables accepted. Evidence: `evidence/erp-normal-session-readback.json`, `evidence/notification-owner-probe-before-correction.json`, `evidence/notification-normal-session.json`.
- Latest normal-role customer create proof is `evidence/erp-normal-create-v3.json`: after the correct QA role assignment, advisory check **ALLOW**, actual native **POST 403**, exact-ID readback **HTTP 200 with zero rows**. v2 predates the correct assignment and is not the final result. No ordinary-user create acceptance is claimed. Generic writes remain closed; `writeBlocker` now additionally requires action-specific `verifiedWriteActions`, so create proof cannot unlock update, and delete is unconditionally blocked. No manifest write-verification flag was enabled.
- Current continuation verification: **122/122 frontend tests across 20 files** (70.77s) and both TypeScript configurations passed after independent review; logs `.cache/erp-vitest-continuation.log` and `.cache/erp-typecheck-continuation.log`. Latest full Python run **107 passed in 2.31s, exit 0**, recorded in `evidence/continuation-python-107.json` (`PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend -q`); the older `.cache/erp-pytest-final.log` contains 63 and is historical, not the 107-test evidence. UI focused 16 and notification focused 15 overlap the full suite; do not add them to 122.
- Final normal-session readback is complete: all 27 tables HTTP 200, 25 tables/73 rows `values_match:true`, one saved report visible but mismatched and activity empty (`evidence/erp-normal-session-readback.json`). Audit found 31 `any` fields from blanket JSON/JSONB mapping; native array/object migration candidates are documented but not runtime-proven. Next is a targeted shape audit and reviewed full-schema-preserving migration/probe, not blanket conversion; the additive provisioner will not change existing types. Catalog function slug correction was read back, without ordinary-user category create acceptance. General membership, transactional stock/money effects and all source nested-view/field parity remain separate gates.
- User accepted the shell screenshot, then prohibited computer use. No automated browser/full workflow acceptance, build or deployment. Original temporary specification and HMG Stones checkout are untouched. No module or E01-E12 chain is complete; use the [working ledger](development-pack/05_PARITY_AND_RESUME_LEDGER.md) and [validation report](VALIDATION_REPORT.md). Earlier sections below are historical discovery, not current counts or implementation paths.

## Binding specification and execution authority

The user assigned implementation of the supplied [development pack](development-pack/00_START_HERE.md). Its 32 modules and 123 inventoried source views remain in scope. The complete 47-file pack (46 Markdown files plus manifest) was copied here with SHA-256 equality checks; the original temporary-folder pack remains untouched. The working progress record is [05_PARITY_AND_RESUME_LEDGER.md](development-pack/05_PARITY_AND_RESUME_LEDGER.md).

Use the supplied Phase 0 -> Phase 1 -> catalog/purchasing -> commerce -> warehouse/manufacturing -> reporting -> administration/portal sequence. No redesign, PHP runtime, second identity system, second stock ledger, or separate database is proposed. No commit, push, deployment, provider send, paid action or modification of HMG Stones is authorized. Live fixtures require an explicit approved scope; existing records must be preserved.

## CodeAuditor / reuse record

- `src/App.tsx`: existing React/Refine shell, four registered data providers, notification integration and route authentication. Resources are empty; access control is exported but not connected. No business pages exist.
- `src/providers/refineProviders.ts`: existing database/storage/app/user/auth/access-control providers. Extend this owner, not a replacement provider stack.
- `src/taruviClient.ts`: single SDK client; currently requires and receives an API key from browser-injected constants. Installed SDK 1.5.4 supports explicit `authMode: "session"` without an API key. Remove key injection before exposing workflows.
- `src/components/auth/LoginRedirect.tsx` and `src/pages/login/index.tsx`: existing hosted login redirect. Preserve; do not create local credentials forms.
- `src/contexts/app-settings/index.tsx`: skips its settings request without a session token; currently mounted outside the authenticated route. Keep protection and test it.
- `src/components/PageContainer.tsx`, `src/components/sidenav/*`, `src/navkit/useNavkitProfileMenuItems.tsx`, `themeOptions.ts`: reuse layout/navigation/design system owners. UI preflight remains required for every page.
- `src/pages/home/index.tsx`: template design-system cover, not an operational dashboard.
- No Python application, local business tests or test configuration exists in tracked source. Two remote Python validators already exist; do not recreate them as new rule owners.
- Installed React/ReactDOM are 18.3.1; package.json incorrectly requests 19.1.0. Installed Refine core 5.0.12, provider 1.3.7, SDK 1.5.4, Vitest 3.2.7. Reconcile the manifest to the React 18 runtime rather than an unrequested React upgrade.
- Initial `tsc --noEmit --pretty false` passed. `npm ls --depth=0 --offline` exits nonzero with dependency drift/extraneous packages; it is not a clean reproducible install.
- No listener observed on ports 3000/5173/5174/8000/8080; no frontend log exists. This does not prove there is no server elsewhere. Do not start dev/build under the repo's prohibition.

## Live schema/contracts discovery

Verified with a fresh MCP client at `https://insurance.taruvi.cloud/mcp/`, explicitly `X-App-Slug: hmg-studio`, using credentials in process only. Taruvi 3.4.11; 25 exposed tools. The session's built-in tool inventory does not expose Taruvi/Context7; explicit MCP access is distinct from a configured native connector. Local MCP config still targets localhost and was not changed.

| Logical datatable | Physical name | Primary/tenant/relationship keys |
|---|---|---|
| `organizations` | `hmg_studio_organizations` | UUID `id`; unique required `slug` |
| `product_categories` | `hmg_studio_product_categories` | UUID `id`; required `organization_id`; nullable `parent_id` |
| `product_locations` | `hmg_studio_product_locations` | UUID `id`; required `organization_id`; nullable `warehouse_id` |
| `warehouses` | `hmg_studio_warehouses` | UUID `id`; required `organization_id` |
| `auth_user` | platform identity | System metadata only; use native user APIs, never datatable identity CRUD |
| `storage_objects` | platform storage | System metadata only; use storage APIs |

Schema metadata is not runtime tenant enforcement. Category `(organization_id, slug)` and location `(organization_id, code)` indexes were returned without a uniqueness flag; do not assume uniqueness. `warehouses.country` defaults to `CA`; organization timezone is `UTC`, currencies `USD`; source-default reconciliation is still required.

### Safety gates, not readiness claims

- Four active Cerbos datatable policies explicitly deny read/create/update/delete to all roles. One disabled legacy build-lock policy remains. Do not silently replace these policies. Database RLS and direct-client bypass enforcement are unverified.
- One app role is listed: Super Admin. Native organization membership, warehouse grants and ordinary user session behavior remain unverified.
- Two active private APP-mode Python functions exist: `validate-catalog-profile-v1`, `validate-contacts-profile-v1`. Their descriptions explicitly disclaim persistence and authorization. Catalog source inspected: 151 lines, `re` import, no SDK/network/persistence calls. SHA-256: `b51bb449851e665f79710bf90176fc095a8caac62debb2f5f2832131abac1163`.
- Zero storage buckets returned. Upload limits, object authorization and download proof remain pending.
- MCP `get_ai_docs` for SDK and policies returns `success: false`, `File not found`. The local skill references are guidance, not proof of all deployed capabilities. The live 25-tool inventory has no `execute_raw_sql` tool despite older local quick-reference material mentioning it.
- No documented/proven cross-resource transaction, conditional write, row lock, idempotent commit, rollback, or durable job/retry facility has been established. Stock/payment mutations are blocked until that contract and tests exist. Do not emulate atomicity with several SDK calls or a process lock.
- Native Python execution can be probed using the existing side-effect-free validator; that cannot prove privileged write context, package installation, network/secret access, transaction behavior or job durability.

## Initial implementation boundary

First local deliverable: session-only browser configuration, authenticated shell gating, existing Cerbos provider wiring, regression tests and a durable execution ledger. This is a prerequisite slice of modules 31/32, not a claim that users, roles, catalog, stock or any business module is finished.

The supplied pack is the selected architecture/plan; this document records destination-specific findings, not an alternate product design. Missing platform capabilities require an explicit architecture decision before affected business writes. Provider/library examples that expose API keys are superseded by the pack's security requirements and installed SDK's server-only key contract.

## Whole-app file ownership map (planned, not implemented)

Existing owners above always take precedence. Paths below are concrete proposed homes based on this repo's `src/pages/{resource}` convention, not claims that APIs/tables already exist. Each module must expand its own source fields/actions into the ledger before coding.

| Module | Frontend owner | Backend/acceptance owner |
|---|---|---|
| 10 Dashboard | existing `src/pages/home/index.tsx` | permission-aware projections; E08 |
| 11 Inventory | `src/pages/inventory/` | shared catalog + stock commands; E01 |
| 12 Orders | `src/pages/orders/` | shared order/payment/document boundary; E03 |
| 13 Customers | `src/pages/customers/` | inspect existing contacts validator; E03 |
| 14 Returns | `src/pages/returns/` | shared stock + separate refund; E04 |
| 15 Purchase orders | `src/pages/purchase-orders/` | shared receipt/stock boundary; E02 |
| 16 Suppliers | `src/pages/suppliers/` | inspect existing contacts validator; E01 |
| 17 Approvals | `src/pages/approvals/` | shared authority/state machine; E02/E03 |
| 18 Categories | `src/pages/categories/` | reuse `product_categories` + existing catalog validator; E01 |
| 19 Locations | `src/pages/locations/` | reuse `product_locations` + existing catalog validator; E01 |
| 20 Warehouses | `src/pages/warehouses/` | reuse `warehouses` + existing catalog validator; E01 |
| 21 Adjustments | `src/pages/stock-adjustments/` | shared atomic stock owner; E02 |
| 22 Warehouse stock | `src/pages/stock/` | scoped balance projection; E02/E05 |
| 23 Transfers | `src/pages/stock-transfers/` | shared atomic stock/reservation owner; E05 |
| 24 Audits/counts | `src/pages/stock-audits/` | shared revisioned count/stock owner; E06 |
| 25 Work orders | `src/pages/work-orders/` | shared atomic component/output owner; E07 |
| 26 Reservations | `src/pages/reservations/` | same stock/reservation owner; E05 |
| 27 Import/export | `src/pages/import-export/` | validated durable jobs; E09 |
| 28 Reports | `src/pages/reports/` | permission-aware projections/jobs; E08 |
| 29 Activity | `src/pages/activity-log/` | immutable server activity owner; E12 |
| 30 Users | `src/pages/users/` | existing native user provider/APIs; E12 |
| 31 Roles | `src/pages/roles/` + existing provider | native roles/policies, not auth tables; E12 |
| 32 Auth/account | existing login/redirect, `src/pages/account/` | native session authority; E12 |
| 33 Organization/settings | `src/pages/settings/` + existing app settings context | reuse organizations/native user attributes; E12 |
| 34 Notifications | `src/pages/notifications/` | committed events/delivery jobs; E11 |
| 35 Shipping | `src/pages/settings/shipping/` | approved provider adapter; E11 |
| 36 Storage | `src/pages/settings/storage/` + existing storage utilities | native bucket/object authorization; E01/E11 |
| 37 APIs/webhooks | `src/pages/settings/api-tokens/`, `src/pages/settings/webhooks/` | native identity + durable delivery; E11 |
| 38 Portal | `src/pages/portal/` | native customer-scoped authority; E10 |
| 39 Extensions/tax | `src/pages/extensions/` | approved Python/native equivalents; E11 |
| 40 Operations | `src/pages/operations/` | approved native recovery/provisioning; E12 |
| 41 Replenishment | `src/pages/inventory/replenishment/` | shared stock/PO policy owner; E02 |

Backend files/endpoints for persistence are deliberately not invented while transport/transaction/membership contracts remain unknown. The Phase 0 exact per-action create/modify/test map is incomplete beyond the foundation slice. Each future module gets co-located `*.test.tsx` and Python contract tests once its existing backend owner and transport are confirmed.

## Documentation consulted

Installed SDK/provider source is the exact version contract. Context7 skill read, but connector unavailable. Official fallback references: [Refine authentication](https://refine.dev/core/docs/guides-concepts/authentication/), [Refine access control](https://refine.dev/core/docs/authorization/access-control-provider/), [Vitest configuration](https://vitest.dev/config/). New APIs must not be guessed from those generic examples.
