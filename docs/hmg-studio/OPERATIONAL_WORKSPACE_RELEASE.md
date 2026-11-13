# Operational workspace release

## Scope

Extends the existing HMG-Studio Refine application. HMG Stones customer-app data,
users, frontend worker and storage configuration remain separate. The requested
deployment targets only the `hmg-studio` app on the `insurance` site.

## Inventory and shared presentation

- Inventory prioritizes stock by location, suppliers and applicable tracking or
  assembly relationships. Other relationships remain available under **More
  related data**, without mounting hidden queries.
- The accessible location chart reuses the existing stock table response. A page
  is labelled as a page; complete accessible coverage is claimed only when row
  totals, identities and quantities validate. Unknown counts are not zero.
- Shared business detail sections, status badges, mapped CSV and HMG print
  snapshots remain reusable across modules.
- The environment is labelled **Demonstration workspace**; generated business
  records are not represented as actual HMG transactions.

## Reports

`/reports` offers four fixed read-only projections: sales orders, purchase orders,
customer payments and stock adjustments. Saved definitions remain available at
`/reports?view=definitions`; these metadata records do not execute arbitrary SQL.

Choose a permitted organization, period and applicable filters, then **Generate
report**. Only the organization lookup runs before generation. Reads are scoped,
sequential, sorted and limited to 500 complete rows. Oversized, inconsistent,
duplicate or incomplete responses fail without publishing partial results.

Charts, tables and exports use that same generated result. Monetary summaries
are separated by currency; payments resolve currency from authorized parent
orders. Voided payments and unknown void states are excluded from non-voided
summaries and displayed explicitly. Missing/invalid amounts suppress a summary;
stock snapshots are not added together. These are non-atomic recorded snapshots,
not accounting revenue, issued invoices, tax documents or proof of payment.

Changing identity or scope invalidates generated results. CSV values retain
formula-injection protection; printed snapshots carry the HMG logo. Generic list
exports outside this workspace still export the current page, not every page.

## Data enrichment

Reviewed plan `sample-enrichment-plan.json` applied 139 exact-ID metadata patches
and created four report definitions. It preserved the existing 60 historical
business transactions, all financial/stock values, lifecycle states, business
dates and foreign keys. No transaction was posted by this enrichment.

Contacts, addresses, terms, descriptions, supplier references and synchronized
display names were enriched where applicable. Demonstration provenance remains
in notes; non-deliverable contact emails are intentional. Approval identities,
tracking fields and unavailable exact-material photographs were not fabricated.
Four verified existing private slab images were reused for thumbnails. The 263
website catalogue references were not converted to physical stock.

All 143 changed/new records were read back under a normal sales session, without
an admin fallback. Evidence: `evidence/sample-enrichment-apply.json` and
`evidence/sample-enrichment-normal-readback.json`.

## Identity and workflow boundaries

Pradeep's existing account has verified Admin, Super Admin and operator app-role
memberships. Two normal non-admin QA accounts were provisioned through native
Taruvi user APIs. The Users screen continues to use the actual native directory,
not a custom identity table; directory scope may be tenant-wide.

Private function `hmg-stock-preview-v1` validates a caller-visible adjustment
preview. Ordinary-session positive/negative tests and unchanged-stock readback
passed. It never creates a request, posts stock or authorizes a commit.

**Not complete:** ordinary native customer creation still returns 403 despite an
advisory ALLOW. Multi-table transactional atomicity, locking/CAS, rollback,
idempotency and direct-write bypass protection have not been proven. Therefore
order/payment/stock posting and broad generic CRUD are not enabled by this
release. Do not remove these gates merely to make action buttons appear.

## Release checklist

- Independent security/correctness reviews cleared inventory, reports, enrichment,
  stock preview and category-search cleanup.
- Backend suite: 345 passed. Reports focused suite: 35 passed. Inventory focused:
  34 passed. Categories cleanup regression suite: 9 passed. Counts overlap other
  suites and must not be added as unique coverage.
- Full frontend, final TypeScript, production build, secret scan and deployment
  evidence are recorded separately in `evidence/operational-release-verification.json`.
- Deployment must inspect all workers, avoid the separate `hmgstones` worker,
  upload only a successful fresh build, activate its returned build UUID and
  verify exact app/build identity plus served HTML/assets.
- HTTP verification is not browser/visual acceptance or all-module workflow
  acceptance. No commit or push is included.

## Deployed checkpoint — November 7, 2026

- URL: https://hmg-studio.taruvibase.app/
- Worker: `hmg-studio`, app: `hmg-studio`, site: `insurance`.
- Active build: `38068a60-226a-4658-8e08-8591fa18bde4`.
- 228 frontend tests across 31 files, 345 backend tests and both TypeScript
  configurations passed. Production build succeeded; no matches for the three
  configured credential values were found in its output.
- Five SPA routes, both hashed JS/CSS assets and the HMG logo returned HTTP 200
  with hashes matching the local production build. The separate HMG Stones
  worker and its active build were read back unchanged.
- The create endpoint activated the new worker despite `set_active=false`.
  Exact active-build readback was confirmed; no upload or activation was replayed.
  Detail lookup uses the worker slug (UUID lookup returned 404).
- Performance is not accepted as complete: the main JavaScript chunk is about
  3.99 MB uncompressed. Code splitting and browser performance measurements remain
  pending, alongside the workflow blockers above.

## Master acceptance and safer release tooling checkpoint — November 9, 2026

The older “ordinary native customer creation still returns 403” statement is historical. Retained standard app Admin API verification now covers products/customers/suppliers create/read/update/read/logical delete; three manifest write gates and command slugs are enabled. Roleless customer create and both private master-command executes returned 403, and the temporary QA role was revoked. [Durable sanitized evidence](evidence/master-crud-session-acceptance-20261109.json) contains only statuses/actions/source hashes, not raw records, policies, credentials or user attributes. This does not establish UI acceptance; the user is testing manually.

Current release commands (only the explicit upload mode contacts the live deployment API):

- `npm run deploy` or `npm run deploy -- --dry-run`: validates target configuration and reports intent; no build/upload.
- `npm run deploy -- --prepare`: creates and checks a fresh local production artifact and archive; **no upload**.
- `npm run deploy -- --upload`: explicit live replacement of the verified app-default worker, **not non-live staging**. Do not run without approval. Accepted upload returns **exit 2** / `upload_accepted_needs_verification`; independently verify completed active build, exact target identity and served app before calling deployment successful. Never blindly retry an uncertain upload.
- `npm run test:deploy`: eight mocked tests passed; mocks do not prove live deployment behavior. Generated/tracked dependency lock has zero installed-version mismatches, not a verified clean-install result.

No new frontend upload or commit is claimed for this preparation checkpoint. Full frontend/backend reruns are pending in the latest implementation checkpoint; targeted test success is not a full-release pass. No current build or live asset acceptance is inferred from the historical November 7 release.

Per the user's explicit November 9 decision, keep stock updates all-or-nothing and finish verification/release tooling first. Master metadata acceptance does not authorize stock/receipt/payment posting without proven native atomicity, concurrency, rollback, idempotency and direct-write isolation.

## Verified local release-candidate checkpoint - 2026-11-09

This supersedes the preceding pending-test status, while preserving earlier failures and their chronology. It establishes a tested local build/package, **not complete application production readiness**.

- Full frontend: **37/37 files, 332/332 tests passed in 643.78s**, `FULL_SUITE_EXIT=0`. Typecheck exited **0**. Full backend: **758 passed in 8.80s**, process exit **0**. Release tooling: **8/8 mocked Node tests passed**, exit **0**. Counts overlap earlier targeted runs and must not be added together. Whitespace validation (`git diff --check`) exited **0**.
- Explicit local `--prepare` completed build and packaging with exit **0** for **insurance/hmg-studio**: Vite **6.4.5**, **6719 modules**, **40.25s**. Prepared archive: `.cache/releases/hmg-studio-1794235299723.zip`. Target identity, exact configured-key exclusion and artifact guards passed. **No frontend upload occurred**; the archive is local and is not evidence of live frontend activation or UI acceptance.
- The build reports a **4.05 MB minified main JavaScript chunk (1.18 MB gzip)**. This warning remains open; passing build/package checks does not establish browser performance acceptance.
- Lock/install comparison found **zero existing-dependency version mismatches**; **47 new archiver dependencies** were installed with scripts disabled. This is not a clean-environment reproducibility guarantee.
- The user is performing manual UI testing. **Stock, returns, approval and other business posting remain intentionally blocked** under the user's all-or-nothing requirement; the native transaction, concurrency, rollback, idempotency and direct-write isolation gates still apply. No all-module/chain acceptance, new commit, or full-production-ready claim follows from these local results.

## User-authorized deployment - 2026-11-09

Deployed the tested frontend to https://hmg-studio.taruvibase.app/ (insurance / hmg-studio). The app default-worker setting was null; an explicit existing worker was used only after verifying its slug and app association. No duplicate worker was created. Deployment helper regression tests: 10 passed.

Active build 1385c6ff-b7f6-4946-99f7-c0f0c52c5954 reports completed. Public release manifest and all six served file SHA-256 hashes matched the local production build. See evidence/frontend-deployment-20261109.json. This is deployment verification, not browser/UI acceptance; the user will test manually. Stock movements, returns and approval posting remain disabled under the retained all-or-nothing safety requirement. No Git commit or push was made.


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
