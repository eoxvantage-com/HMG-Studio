# Sectioned ERP workspace implementation plan

## Compact inventory and bounded reports - 2026-11-07

**Implemented and locally/API verified; not full-module acceptance.** Earlier dated checkpoints remain historical.

- Inventory prioritizes stock-by-location and suppliers, adds capability-relevant variants/assembly/serial/batch sections, and keeps remaining relations behind **More related data**. Expanding a panel still owns its query; unloaded counts are unknown, not zero. The accessible stock chart reuses the displayed stock page and table, not another query or a page-derived product total.
- `/reports` now generates four fixed operational views: sales orders, purchase orders, customer payments and stock adjustments. An authorized organization is required; only organization lookup runs before **Generate**. Complete caller-visible results are bounded to **500 rows**, with stable ID ordering and fail-closed pagination checks. Saved definitions remain secondary at `/reports?view=definitions`; arbitrary saved configurations/SQL are not executed.
- Existing lists export mapped current-page/current-record values. Reports export the **complete generated bounded result**, not only its table preview page, using the existing CSV/HMG print-preview helper. Neither path claims an issued invoice, delivery/email, arbitrary all-database export, atomic snapshot or recognized revenue.
- **228 frontend tests /31 files passed (552.90s)**; both TypeScript configurations passed. [Frontend evidence](evidence/operational-frontend-verification.json). [Ordinary SDK/provider proof](evidence/operational-reports-live.json): all four report kinds succeeded over eight authorized reads, without admin fallback. Broader backend/enrichment/deployment status belongs to the [operational release record](OPERATIONAL_WORKSPACE_RELEASE.md).
- Native C/U/D, transaction atomicity and full 32-module/E01-E12 acceptance remain separate gates. This checkpoint makes no browser, visual, build, deployment or all-CRUD acceptance claim.

### Follow-up acceptance checklist

- [x] Compact inventory priority relations and capability-aware progressive disclosure; remaining relations reachable and lazy.
- [x] Stock page chart reuses existing rows with accessible labels/table fallback; no partial-total claims.
- [x] Four fixed report kinds query only on Generate after authorized organization selection.
- [x] Complete bounded report result export (maximum 500), strict scope/pagination/identity checks and explicit monetary/void semantics.
- [x] Independent review followed by 228 frontend tests and both TypeScript configurations; ordinary provider probes succeed for all four reports.
- [ ] General all-filtered export outside these four generators, browser-generated document acceptance, write workflows and full-module parity.

> For agentic workers: use the subagent-driven-development workflow, preserve unrelated edits, test changes before release, and update this checklist with evidence.

## Spec and decisions

The supplied November 6 screenshots and existing 32 module specifications are the contract. Extend the current HMG-Studio app, not a new application. Use compact grouped sections, business summaries and related records instead of field-per-card dumps and horizontal detail tabs. Preserve olive/ivory tokens, HMG logo, Refine 5 native session providers and notifications. The latest direct request for sectioned detail pages supersedes the older mandatory horizontal-tab presentation rule.

Selected approach: extend the existing generic route/query owner with reusable module descriptors and section cards. Separate bespoke pages for every table would duplicate authentication, query and export logic; another whole-app framework rewrite would delay functional work. Inventory's existing specialized overview stays reusable. Existing Categories and Approvals owners remain distinct.

User clarified **60 business transactions total**, covering six months, with supporting line items/logs separate and verified stone catalogue photographs. These are explicitly synthetic historical fixtures, not evidence that real payments, stock posting, approvals or shipments executed. Existing catalogue reference rows must not be converted silently into physical stock. A new fictional sample slab can reuse a verified catalogue photograph only with an illustration/provenance note.

## Architecture / ownership

- CodeAuditor completed reuse map: `src/pages/erp/index.tsx` owns routing, sole parent `useOne`, guarded forms and related filters; `inventory.tsx` has reusable bounded name lookups; Categories/Approvals have separate owners.
- Schema agent: fresh exact field confirmation, backend authorization/transaction evidence, deterministic synthetic history generator and tests. No policy widening or live seed until reviewed.
- UI integration owner: generic detail/list presentation and shared lookup reuse; no duplicate parent or hidden-section queries.
- Module presentation owner: pure grouped detail descriptors and presentation, no parallel query owner or route edits.
- Root: shared scoped CSV/print/export helpers, orchestration, independent security review, normal-session verification and integration.

## Checklist

- [x] Read screenshots and existing route/query/provider owners; identify separate Categories route and missing export implementation.
- [x] Confirm data volume: 60 business transactions total, six months, synthetic workspace only.
- [x] Confirm 26 live resource schemas/relationships in `backend/schema/historical-60-live-schema.json`; record native customer 403 and unproved transaction/trigger prerequisites without weakening gates.
- [x] Implement tested grouped details and section navigation for all generic modules, specialized summaries for Orders, Customers, Returns, POs, Suppliers, Locations and Adjustments. Related sections load on demand and remain paginated.
- [x] Improve list labels, grouped business columns, multi-field server search and semantic status badges; unknown values stay unknown.
- [x] Shared CSV export of mapped visible current-page/current-record fields only, with identity gates, formula-safe values and bounded size; no hidden fields. Generic/related, Inventory/stock/suppliers, Categories and personal Notifications integrated.
- [ ] General full-filter/all-pages export outside the four fixed report generators. Reports now deliver a complete bounded result (maximum 500); existing list export remains current-page only.
- [x] HMG-branded printable record documents with mapped business labels, currency and honest document type. Print-to-PDF is not an issued tax invoice or immutable invoice snapshot.
- [x] Update separate Categories/Approvals presentation without activating unverified mutation paths.
- [x] Generate/review/provision 60 synthetic transaction headers plus 75 supporting rows; exact admin and ordinary-session 135-row readback passed. Six fictional sample products were staged then explicitly published; no operational workflow was executed.
- [ ] Resolve native CUD only from a reproduced cause and verified normal-session positive/negative checks. Preserve current safeguards otherwise.
- [ ] Prove each transactional command's authorization, direct-write protections, concurrency, idempotency and rollback before enabling it. No sequential HTTP writes presented as an atomic transaction.
- [x] Independent security/correctness review, Vitest/Python/type checks, permitted live verification; no computer/browser control, dev server or build.
- [x] Update main checklist, schema/data contract, validation report and resume ledger with implemented/verified/remaining separately.

## Acceptance hazards

Never calculate all-time totals from one page, combine currencies, invent party names, treat missing values as zero, or query hidden relation panels. Resolve foreign keys with bounded batched name lookups. Refund documents and actual payment refunds are distinct. Posted synthetic history must be labelled as fixtures, not actual executed audit events. Any external delivery/email/payment/shipping integrations remain inactive. Export only fields/rows the current session is permitted to read; guard identity changes and formula injection. Do not claim browser acceptance, all-module completion or deployment from unit tests alone.

The repository guide's old `.codex/skills/taruvi-app-developer` path is absent; current installed and developer-registered skill files are under `.agents/skills`. Use these current files; no unrequested skill relocation. Context7 is not exposed in this session; use installed package contracts and official documentation as fallback.

## Verified delivery and remaining gates - 2026-11-06

- Final full suites: 187 frontend tests /29 files, 250 Python tests, both TypeScript configurations exit 0. [Persisted verification](evidence/sectioned-workspace-verification.json). Focused counts overlap and are not additive.
- [Historical provisioning summary](evidence/historical-60-summary.json): 60 business headers and 75 support rows across 19 tables, May-October 2026. Ordinary native reads verified all 135; four private slab images matched SHA; 58 advisory checks matched expected READ/denials. Seven child policies gained only exact fixture-ID reads; C/U/D remains denied.
- Delivered export scope is the visible page or record, not all filtered rows. Documents are branded snapshots, not issued invoices, tax records, payment receipts or sent email. Print-to-PDF is a browser dialog capability, not a verified browser-generated artifact.
- Native customer create 403 remains blocked despite advisory ALLOW. Physical triggers, direct-write protections and transactional atomicity remain unproved; empty platform subscriptions are not proof of absent database triggers. No browser/build/deployment/commit or complete module/E01-E12 acceptance.
