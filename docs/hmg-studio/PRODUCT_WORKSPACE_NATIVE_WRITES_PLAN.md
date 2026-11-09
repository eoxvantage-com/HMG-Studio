# Product workspace and native writes continuation

## Compact inventory and bounded reports - 2026-11-07

**Implemented and locally/API verified; not full-module acceptance.** Earlier dated checkpoints remain historical.

- Inventory prioritizes stock-by-location and suppliers, adds capability-relevant variants/assembly/serial/batch sections, and keeps remaining relations behind **More related data**. Expanding a panel still owns its query; unloaded counts are unknown, not zero. The accessible stock chart reuses the displayed stock page and table, not another query or a page-derived product total.
- `/reports` now generates four fixed operational views: sales orders, purchase orders, customer payments and stock adjustments. An authorized organization is required; only organization lookup runs before **Generate**. Complete caller-visible results are bounded to **500 rows**, with stable ID ordering and fail-closed pagination checks. Saved definitions remain secondary at `/reports?view=definitions`; arbitrary saved configurations/SQL are not executed.
- Existing lists export mapped current-page/current-record values. Reports export the **complete generated bounded result**, not only its table preview page, using the existing CSV/HMG print-preview helper. Neither path claims an issued invoice, delivery/email, arbitrary all-database export, atomic snapshot or recognized revenue.
- **228 frontend tests /31 files passed (552.90s)**; both TypeScript configurations passed. [Frontend evidence](evidence/operational-frontend-verification.json). [Ordinary SDK/provider proof](evidence/operational-reports-live.json): all four report kinds succeeded over eight authorized reads, without admin fallback. Broader backend/enrichment/deployment status belongs to the [operational release record](OPERATIONAL_WORKSPACE_RELEASE.md).
- Native C/U/D, transaction atomicity and full 32-module/E01-E12 acceptance remain separate gates. This checkpoint makes no browser, visual, build, deployment or all-CRUD acceptance claim.

### Compact product follow-up

Stock-by-location and suppliers remain primary; product capability fields determine additional primary variant/component/serial/batch sections. Other relationships are reachable through More rather than dozens of initial headings. No hidden query, duplicate parent read, aggregate endpoint or media/barcode rewrite was added. The chart's complete heading is caller-visible-only and requires distinct valid IDs and exact provider-total equality; otherwise it is explicitly page-scoped. No native write gate is unlocked by these read improvements.

## Latest sectioned workspace checkpoint - 2026-11-06

**Implemented/read-verified, not full-module acceptance.** This supersedes earlier detail-tab presentation and test totals; prior evidence remains historical.

- **UI:** grouped business details and persisted-value summary cards replace generic horizontal detail tabs/raw-field cards. Related accordions mount paginated queries only when expanded. Shared bounded FK name lookups, multi-field server search, semantic statuses and real registered-record links reuse existing Refine query owners. Inventory keeps its specialized overview; Categories adds cards/table views; Approvals remains read-only.
- **Exports:** mapped visible current-page/current-record CSV and HMG-branded print previews (including browser Print-to-PDF) cover generic views/related lists, Inventory/stock/suppliers, Categories and personal Notifications. Identity/error gates, formula escaping and size bounds apply. No hidden-field, all-filtered, issued-invoice, email or payment-proof claim.
- **Verified:** independent review followed by **187 frontend tests /29 files** (273.68s), **250 Python tests** (5.79s), and both TypeScript configurations exit 0. [Final verification](evidence/sectioned-workspace-verification.json). No browser/visual acceptance, build, deployment or commit.
- **Synthetic data:** **60 transaction headers +75 supporting rows =135 rows /19 tables**, May-October 2026. Six new fictional products comprise four illustrated slabs and two assemblies; existing catalogue references remain separate. Ordinary-session exact readback verified all 135 rows, four private JPEG downloads matched SHA, and 58/58 bounded advisory checks matched. These are historical snapshots, **not executed stock/payment/approval workflows**. [Readback](evidence/historical-60-normal-readback.json), [images](evidence/historical-60-normal-images.json), [policy checks](evidence/historical-60-normal-policy.json).
- **Remaining:** seven exact-ID child READ policy changes added no C/U/D authority. Native ordinary customer POST 403 remains a provider blocker; original-row authority, atomicity/concurrency/idempotency/rollback and full source parity remain unproved. Platform event subscriptions were empty, but physical database triggers were not verified. Full-filter export, operational workflows and all-module/E01-E12 acceptance remain open.

Date: 2026-11-06. Status: implemented/tested read slice; approved private-media copy/link fully reconciled. Native write repair remains blocked. Does not supersede the full 32-module acceptance ledger.

## Design and architecture

Implement the user's supplied product-list/detail references as an internal HMG ERP workspace, not a public storefront. Use an incremental Ant Design 5 / ProComponents pilot for inventory, retaining React 18, Refine 5, native Taruvi providers, redirect authentication and the existing Refine notification integration. Latest direct Ant Design request overrides the earlier MUI-only preference for this pilot. Shared tokens remain in `themeOptions.ts`; implemented olive/ivory styling is inspired by the supplied customer-app screenshot, not claimed official brand specifications. The official website logo is stored unchanged with provenance at `public/brand/PROVENANCE.md`.

Alternatives: a whole-app library replacement risks auth/form regressions; styling the existing field-per-card dump leaves the information architecture broken. The selected incremental approach provides compact product/price/stock summaries, grouped commercial metadata, verified image sources, barcode/QR identity, and lazy paginated related sections, while preserving other modules.

Installed Taruvi skills are in `.agents/skills`; `.codex/skills` references in the repository guide are stale. Read actual installed skill references rather than implementing from memory. No copying Inventoros source.

## Ownership and order

- [x] CodeAuditor: existing generic list/detail and schema manifest reuse audit. No product-specific owner exists; hidden related panels currently fetch, and arbitrary first-eight truncation omits important relations.
- [x] DBSchemaAgent: fresh Studio-scoped schema confirmed; native create divergence traced to a provider escalation, not bypassed; four additive typed fields and exact report/activity readbacks verified. No stock mutation or transaction claim.
- [x] Frontend: test then implement Inventory ProTable and product-specific detail using existing record/query owners; lazy related panels, complete relation navigation, formatted money and honest missing values.
- [x] Root catalogue: test a deterministic import planner against the public HMG feed; validate same-site source/image URLs, duplicates and exact field mapping; import only new reference rows in the dedicated workspace, never invent prices, stock or physical slab codes.
- [x] Root branding/dependencies: compatible pinned Ant5/ProComponents and barcode package; official logo; shared olive/ivory tokens; no alternate toast provider.
- [ ] Native write repair: only after a specific root cause is reproduced. Test normal-user create/readback and denial paths; update/delete/stock posting require their own verified authority and atomicity.
- [x] Independent security/correctness review before final tests and each approved live change; findings have regression tests.
- [x] Vitest 152 /25 files, Python 208, both TypeScript configurations exit 0; scoped ordinary-session readback. No browser control, dev-server start or build.
- [x] Update implementation checklist, validation report, schema/QA records and parity ledger after tests; explicitly retain unfinished workflows.
- [x] Final private-media reconciliation: 252 objects/263 image links verified; ordinary QA linked count 263 and one exact private byte read passed. `Images` bucket untouched/reserved.

## Files and contracts

- UI owner: `src/pages/erp/index.tsx`, new focused inventory presentation/query helpers and tests under `src/pages/erp` and `src/services`; existing route registrations stay intact.
- Brand owner: `themeOptions.ts`, `src/components/sidenav/MuiSidenav.tsx`, `public` official logo asset and provenance.
- Backend owner: existing `backend/scripts` helpers and schema evidence; new bounded probes/tests only as justified by discovery.
- Catalogue owner: `backend/scripts` import planner, `backend/tests` and sanitized `docs/hmg-studio/evidence` source/readback evidence.

## Acceptance hazards

- Never infer product identity from a gallery photo; preserve catalogue source names/URLs. Duplicate source URLs require reconciliation, not duplicate imports.
- Website catalogue rows are reference data, not physical inventory. Unknown price/cost remains unknown, not zero; no generated barcode may claim to be an existing physical stone code.
- Parent stock and bin stock are not additive. Missing or partial pages do not become stock totals; no margin calculation from absent values.
- Ant ProTable is controlled by one Refine query owner, not an additional `request` fetch; backend pagination/search/sort and clear errors remain required.
- Scoped normal-session write success, not advisory ALLOW or admin seeding, is the criterion for enabling writes. Cross-resource HTTP calls are not an atomic transaction.
- `.env` currently has duplicate Studio/Stones targets. Explicit process-scoped Studio metadata is required; do not print secrets or mutate the customer app.

## Verified implementation and exact resume

- Inventory: controlled ProTable on the existing Refine provider; server OR search over name/SKU/barcode, active filter, pagination and sorting. Product detail uses the existing parent record, grouped price/stock/margin metadata, official/private media, CODE128 only for supported stored barcode types (or explicit SKU preview), QR and safe browser print. Stock/supplier relations load on demand with readable names and honest unknown counts. Generic relations no longer stop at the first eight or query inactive panels.
- Brand: shared olive/ivory tokens, official logo provenance, scoped Ant adapter derives MUI theme values. Ant 5.29.3, ProComponents 2.8.10 and jsbarcode 3.12.3 are pinned; no replacement auth/client/notification stack.
- Catalogue: 263 deterministic public-reference imports/readbacks; ordinary-session total 263. No physical inventory or verified commercial price is implied; no generated product barcode persisted. `price=0` is required legacy storage only; unknown selling/purchase prices stay null.
- Structured JSON: nullable saved_reports.columns_json/filters_json/sort_json and activity_logs.properties_json added; existing TEXT/any fields unchanged. Native and ordinary reads prove the two targeted typed shapes. Bounded/redacted structured details never execute stored configuration. Missing-fixture wire adaptation is strict and does not rewrite existing rows.
- Security findings fixed: private-image stale identity/revocation and synchronous storage errors; structured sort-type confusion, nested sensitive-filter redaction and render budgets; media URL/mapping ownership validation; unknown mutation reconciliation; full non-image snapshot preservation with strict boolean/number distinctions. Read-before-write and content hashes are not atomic CAS/no-overwrite guarantees.
- Tests: [persisted final verification](evidence/product-workspace-verification.json) records 152 frontend/208 Python and both TypeScript passes. Inventory 22, private-image 9, brand 7 and catalogue/media/link 73 are overlapping focused runs, not additional totals. [Catalogue focused evidence](evidence/hmg-catalogue-final-tests.json).
- Native write repair remains blocked: valid advisory ALLOW, actual customer 403, exact readback 0; bounded diagnostic policy restored exactly. See [provider escalation](evidence/native-create-provider-escalation.md). No manifest action verification flag was enabled; delete, stock/money and workflow commands remain closed.
- Next: provider-side native authorization investigation, full product/nested-view parity and source workflows. User visual acceptance remains pending; no CUA/browser, build, deployment or complete module/E01-E12 claim.

## Final private-media delivery

[Delivery evidence](evidence/hmg-catalogue-delivery-summary.json): 265 public feed entries produced 263 verified reference products; two conflicting-name entries for the same source URL were quarantined, not arbitrarily merged. Their 263 image mappings deduplicate to 252 content-hash objects in private `products` bucket 662/app 694. Last copy run 247 uploads  + 5 exact-SHA skips; last link run 262 image-only updates  + 1 exact owned skip. Full non-image fresh snapshots were preserved except server `updated_at`. No writes remain in this approved batch, no storage policy/config changed, and `Images` remains untouched/reserved.

Ordinary QA [linked-prefix query](evidence/private-media-linked-normal-count.json) returned HTTP 200/total 263. A [linked product/private-byte check](evidence/private-media-linked-normal-read.json) returned 200/200 with matching SHA; separate anonymous byte request was 401. Existing storage read permission applies to authenticated users, not organization-specific ownership. Atomic collision prevention and PATCH CAS remain unproved; these bounded administrative writes do not authorize application CRUD. No browser-rendered image acceptance is claimed.
