# HMG professional UI, notifications and CRUD continuation

## Compact inventory and bounded reports - 2026-11-07

**Implemented and locally/API verified; not full-module acceptance.** Earlier dated checkpoints remain historical.

- Inventory prioritizes stock-by-location and suppliers, adds capability-relevant variants/assembly/serial/batch sections, and keeps remaining relations behind **More related data**. Expanding a panel still owns its query; unloaded counts are unknown, not zero. The accessible stock chart reuses the displayed stock page and table, not another query or a page-derived product total.
- `/reports` now generates four fixed operational views: sales orders, purchase orders, customer payments and stock adjustments. An authorized organization is required; only organization lookup runs before **Generate**. Complete caller-visible results are bounded to **500 rows**, with stable ID ordering and fail-closed pagination checks. Saved definitions remain secondary at `/reports?view=definitions`; arbitrary saved configurations/SQL are not executed.
- Existing lists export mapped current-page/current-record values. Reports export the **complete generated bounded result**, not only its table preview page, using the existing CSV/HMG print-preview helper. Neither path claims an issued invoice, delivery/email, arbitrary all-database export, atomic snapshot or recognized revenue.
- **228 frontend tests /31 files passed (552.90s)**; both TypeScript configurations passed. [Frontend evidence](evidence/operational-frontend-verification.json). [Ordinary SDK/provider proof](evidence/operational-reports-live.json): all four report kinds succeeded over eight authorized reads, without admin fallback. Broader backend/enrichment/deployment status belongs to the [operational release record](OPERATIONAL_WORKSPACE_RELEASE.md).
- Native C/U/D, transaction atomicity and full 32-module/E01-E12 acceptance remain separate gates. This checkpoint makes no browser, visual, build, deployment or all-CRUD acceptance claim.

### Current UI/report boundary

Report status/type bars use the fully collected authorized bounded result; Inventory location bars use only their existing displayed stock page. Neither manufactures totals from a preview page. Monetary report summaries are currency-separated; payment currency comes from authorized orders and only explicitly non-voided rows enter payment sums. Unresolved/invalid amounts remain unavailable. Native users continue through the existing dedicated user provider; this slice does not alter users, roles or access authority. Reference presentation/security contracts are in [the current project spec](PROJECT_SPEC.md#report-contracts-and-owners).

## Latest sectioned workspace checkpoint - 2026-11-06

**Implemented/read-verified, not full-module acceptance.** This supersedes earlier detail-tab presentation and test totals; prior evidence remains historical.

- **UI:** grouped business details and persisted-value summary cards replace generic horizontal detail tabs/raw-field cards. Related accordions mount paginated queries only when expanded. Shared bounded FK name lookups, multi-field server search, semantic statuses and real registered-record links reuse existing Refine query owners. Inventory keeps its specialized overview; Categories adds cards/table views; Approvals remains read-only.
- **Exports:** mapped visible current-page/current-record CSV and HMG-branded print previews (including browser Print-to-PDF) cover generic views/related lists, Inventory/stock/suppliers, Categories and personal Notifications. Identity/error gates, formula escaping and size bounds apply. No hidden-field, all-filtered, issued-invoice, email or payment-proof claim.
- **Verified:** independent review followed by **187 frontend tests /29 files** (273.68s), **250 Python tests** (5.79s), and both TypeScript configurations exit 0. [Final verification](evidence/sectioned-workspace-verification.json). No browser/visual acceptance, build, deployment or commit.
- **Synthetic data:** **60 transaction headers +75 supporting rows =135 rows /19 tables**, May-October 2026. Six new fictional products comprise four illustrated slabs and two assemblies; existing catalogue references remain separate. Ordinary-session exact readback verified all 135 rows, four private JPEG downloads matched SHA, and 58/58 bounded advisory checks matched. These are historical snapshots, **not executed stock/payment/approval workflows**. [Readback](evidence/historical-60-normal-readback.json), [images](evidence/historical-60-normal-images.json), [policy checks](evidence/historical-60-normal-policy.json).
- **Remaining:** seven exact-ID child READ policy changes added no C/U/D authority. Native ordinary customer POST 403 remains a provider blocker; original-row authority, atomicity/concurrency/idempotency/rollback and full source parity remain unproved. Platform event subscriptions were empty, but physical database triggers were not verified. Full-filter export, operational workflows and all-module/E01-E12 acceptance remain open.

## Prior product workspace checkpoint - 2026-11-06

This checkpoint supersedes historical navy/blue styling, 122/107 test totals, pending JSON fixtures and storage-unavailable statements below. **No complete module or E01-E12 chain is accepted.**

- **Implemented:** scoped Ant Design 5 / ProComponents inventory pilot, retaining React 18, Refine 5, native session/auth/providers and existing mutation notifications. Controlled server search/filter/sort/pagination uses one products query. Product detail reuses the parent record for stock/price/cost/value and grouped metadata, image, explicitly labelled SKU barcode preview, QR and print; warehouse stock/supplier views resolve names. All generic related tabs are reachable and only the selected panel queries; unknown/partial totals are not zero. The shell uses shared olive/ivory tokens and the unmodified official website logo; palette inspiration is not an official brand specification.
- **Verified locally after independent review:** **152 frontend tests /25 files**, 320.92s (`.cache/product-workspace-vitest-final.log`); both TypeScript configurations exit 0 (`.cache/product-workspace-typecheck-final.log`); **208 Python tests**, 4.08s, exit 0 (`.cache/product-workspace-pytest-final.log`, `PYTEST_DISABLE_PLUGIN_AUTOLOAD=1 python -m pytest backend -q`). Python comprises 200 backend/tests plus 8 schema tests. Earlier 207/181/107 and focused counts are historical/subsets, not additive. [Persisted final verification](evidence/product-workspace-verification.json).
- **Live catalogue:** 263 deterministic `HMG-WEB-*` reference products imported with native create/readback and ordinary-session list HTTP 200/total 263. They are inactive public-catalogue references, not physical inventory; stock 0 and required legacy price 0 are technical placeholders, selling/purchase prices are null. UI suppresses reference stock/value and never treats legacy price 0 as a quotation. [Import evidence](evidence/hmg-catalogue-import.json), [normal read](evidence/hmg-catalogue-normal-read.json).
- **Targeted JSON repair:** four nullable native fields added without changing legacy TEXT/`any` columns: saved_reports `columns_json` (array of strings), `filters_json` (object with items array), `sort_json` (object), activity_logs `properties_json` (object). Existing synthetic report received only new fields; one missing deterministic activity fixture was inserted. Exact native types/values read back, including ordinary-session HTTP 200. Structured detail rendering is read-only, bounded and redacts sensitive values; it does not execute report configuration. Seeder maps only missing fixture writes and strictly compares both typed and present legacy values. [Migration](evidence/structured-json-20261106T184314271383Z.json), [normal read](evidence/structured-json-normal-read.json).
- **Accounting:** 62 business tables; prior verified 895 fields plus four additive fields = 899 (190 FKs/324 indexes unchanged by this patch). The separate QA diagnostic table is not a 63rd business resource. Seed scope now has 76 retained rows: prior 74 semantically verified plus repaired report 1 and new activity 1. The 263 catalogue references and diagnostic row are separate populations, not an asserted global database count. Historical frozen-plan readback is preserved; typed-wire acceptance supersedes only the two targeted JSON cases.
- **Private media:** authenticated private-image component is implemented with identity/revocation gates, raster MIME/size checks and object-URL cleanup. One ordinary QA object read returned 200, exact SHA and 53,083 bytes; anonymous 401. Existing storage policy permits authenticated reads, **not organization-scoped reads**. Final delivery verified **252 unique private products-bucket objects and 263 owned product image links** (last link run 262 updates  + 1 exact probe skip). Only `image` was patched; all other fields except server `updated_at` were preserved. Ordinary QA linked-prefix query returned HTTP 200/total 263; one linked product and its private bytes returned 200 with exact SHA. The separate `Images` bucket remains untouched/reserved. Storage collision atomicity and image-PATCH CAS remain unproved. [Delivery](evidence/hmg-catalogue-delivery-summary.json), [ordinary linked count](evidence/private-media-linked-normal-count.json), [linked byte proof](evidence/private-media-linked-normal-read.json). [Bounded session proof](evidence/private-media-normal-read.json).
- **Still blocked:** native customer POST 403 despite advisory ALLOW, including a bounded zero-string diagnostic; policy was restored exactly and readback remained empty. No frontend write gate was enabled. Original-row/update authority, generic deletion, stock/money atomicity/rollback/idempotency/concurrency, remaining module workflows and full source parity are unproved. [Provider escalation](evidence/native-create-provider-escalation.md), [diagnostic rollback](evidence/customer-zero-string-policy-test.json). No browser/computer use, build, deployment, commit or full-module completion in this slice.

## Historical continuation record

> Execute with the existing specialist agents, preserving the shared checkout. This is a continuation of the approved ERP plan, not a replacement or reduced scope.

## Design and reuse

Goal: improve the operational UI, expose a useful personal notification inbox, and evaluate every module's CRUD capability against real backend behavior. All 32 modules and their detailed specifications remain required.

Architecture: retain Refine v5, MUI, existing native Taruvi providers, redirect authentication and Python functions. Extend `themeOptions.ts`, `MuiSidenav`, `ErpWorkspaceHeader`, existing Home and generic ERP owners. Refine's existing notification provider owns mutation feedback; a persisted inbox is a separate data view, not a second toast system.

Visual decision: a restrained navy/slate workspace, blue primary actions, white cards and semantic green/amber/red statuses, with a warm stone accent only where contrast permits. Preserve dense usable tables and all navigation; improve hierarchy, whitespace, typography and focus indicators. No decorative motion or new font dependency. UI/UX Pro Max's `operations analytics dashboard` search returned the relevant Data-Dense Dashboard style; its marketing-oriented Enterprise Gateway layout is not applicable and will not be copied. Colors remain centralized tokens.

## Ordered checklist

- [x] CodeAuditor: inspect reusable owners and notification/CRUD contracts before implementation.
- [x] DBSchemaAgent: confirm notification fields and native policy contracts; diagnose structured JSON and create-403 without relaxing isolation.
- [x] UI: write failing theme/accessibility assertions; refine existing shell/dashboard with UI/UX Pro Max guidance.
- [x] Notifications: test personal filtering, unread count, search/status/type filters, pagination, empty/error/loading states and safe navigation; implement on existing providers.
- [x] CRUD assessment: recorded all 32 module dispositions and the 62-resource read/advisory scan; reviewed per-operation frontend guards and actual customer create denial/readback. See [disposition matrix](ERP_EXPANSION_PLAN.md#32-module-crud-disposition-and-bounded-qa-evaluation).
- [ ] CRUD completion: ordinary-session create/update/delete commit/readback, original-row authorization, destructive dependency/confirmation workflows, complete denial matrix and transactional acceptance remain blocked/unproved. Registered routes are not working operations.
- [x] Security review: review changed code and any proposed migration/policy change before final tests or live mutations.
- [x] TestEngineer: run full Vitest, Python and TypeScript suites; perform scoped normal-session API checks where possible.
- [x] DocWriter: update main checklist, spec, validation and parity ledger only after test results.

## Binding constraints and review focus

- No browser/window control; user performs visual acceptance. No dev-server/build commands, commits or pushes.
- Synthetic workspace only for probes; preserve business rows, all unrelated schemas and policies.
- Native permission checks are advisory until the actual operation and readback succeed. Existing 403 and JSON defects must not be hidden by client-side simulation.
- Mutation timeouts require reconciliation before retry; no blind replays.
- Notifications must not fetch another user's records, expose unsafe URLs, or fabricate unread totals on errors. Mark-read/delete remain unavailable unless backend ownership enforcement is proved.
- Updates/deletes and stock/money transitions remain closed until original-row authority, new-row validation, concurrency and transactional requirements are proven.
- Schema `any` is not evidence of successful JSON persistence. No blanket migration of the 31 fields; preserve full schemas and recorded values for any targeted change.
- No full-module, deployment or browser acceptance claim without corresponding evidence.

## Evidence boundaries

Previous checkpoint: 97 frontend tests, 85 Python tests, TypeScript pass; 62 business tables; 73 semantically verified sample rows/25 tables; one additional unaccepted saved-report row. These are historical starting facts to refresh, not final results for this continuation.

## Continuation result and exact remaining work

- **Completed local slice:** professional navy/slate UI on the existing theme/sidebar/Home, plus personal notification list/detail and bell/preview. Server search/read/type/pagination and owner guards; validated total unread; safe internal actions. No new provider, notification toast system, font or dependency. Notification create/update/delete, mark-read, preferences and delivery are not implemented or authorized.
- **Verification after review:** 122 frontend tests across 20 files passed (70.77s); both TypeScript configurations passed; 107 Python tests passed in 2.31s, exit 0 (`evidence/continuation-python-107.json`). UI 16 and notification 15 focused tests overlap the full suite. Logs: `.cache/erp-vitest-continuation.log`, `.cache/erp-typecheck-continuation.log`; old Python logs are not relabeled as 107.
- **Security corrections:** imperative invalid-ID refetch gate, detail pagination/filter isolation, owner-change/cached-denial handling, error rather than invented zero unread, and action-specific write verification. Semantic success green adjusted from 4.12:1 to 5.12:1; navy state text pairs meet 4.5:1. These checks are not browser/accessibility acceptance.
- **Live QA scope:** native principal username required exact two-user username-to-UUID notification owner mapping, within the synthetic organization and role 1156. Initial owner-policy 400 preserved as failed evidence; corrected policy readback plus own 200/foreign 403 and filtered-zero checks passed. New QA user and one extra owner notification retained; no notification C/U/D grant.
- **Accounting:** frozen fixture plan 75 rows/27 tables still 73 matches/25 tables. With the extra verified notification, 75 synthetic rows are present: 74 semantically verified plus 1 unverified report. Activity not inserted; structured JSON proposals were not applied.
- **Still blocked:** fresh correct-role customer check ALLOW -> native POST 403 -> empty readback (`evidence/erp-normal-create-v3.json`); general membership/original-versus-proposed-row update authority; JSON semantics; atomic stock/money commands. The 62-resource audit is read/advisory evidence only, not 62 successful CRUD workflows.
- Resume from the [matrix and priorities](ERP_EXPANSION_PLAN.md#32-module-crud-disposition-and-bounded-qa-evaluation) and [latest parity ledger](development-pack/05_PARITY_AND_RESUME_LEDGER.md#latest-continuation-resume). All 32 modules, source views and E01-E12 remain required. No browser/computer use, build, deployment, commit or full-module acceptance.
