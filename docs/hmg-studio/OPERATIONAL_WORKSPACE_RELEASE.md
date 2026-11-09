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
