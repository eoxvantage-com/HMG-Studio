# ERP schema contract

## Latest sectioned workspace checkpoint - 2026-11-06

**Implemented/read-verified, not full-module acceptance.** This supersedes earlier detail-tab presentation and test totals; prior evidence remains historical.

- **UI:** grouped business details and persisted-value summary cards replace generic horizontal detail tabs/raw-field cards. Related accordions mount paginated queries only when expanded. Shared bounded FK name lookups, multi-field server search, semantic statuses and real registered-record links reuse existing Refine query owners. Inventory keeps its specialized overview; Categories adds cards/table views; Approvals remains read-only.
- **Exports:** mapped visible current-page/current-record CSV and HMG-branded print previews (including browser Print-to-PDF) cover generic views/related lists, Inventory/stock/suppliers, Categories and personal Notifications. Identity/error gates, formula escaping and size bounds apply. No hidden-field, all-filtered, issued-invoice, email or payment-proof claim.
- **Verified:** independent review followed by **187 frontend tests /29 files** (273.68s), **250 Python tests** (5.79s), and both TypeScript configurations exit 0. [Final verification](evidence/sectioned-workspace-verification.json). No browser/visual acceptance, build, deployment or commit.
- **Synthetic data:** **60 transaction headers +75 supporting rows =135 rows /19 tables**, May-October 2026. Six new fictional products comprise four illustrated slabs and two assemblies; existing catalogue references remain separate. Ordinary-session exact readback verified all 135 rows, four private JPEG downloads matched SHA, and 58/58 bounded advisory checks matched. These are historical snapshots, **not executed stock/payment/approval workflows**. [Readback](evidence/historical-60-normal-readback.json), [images](evidence/historical-60-normal-images.json), [policy checks](evidence/historical-60-normal-policy.json).
- **Remaining:** seven exact-ID child READ policy changes added no C/U/D authority. Native ordinary customer POST 403 remains a provider blocker; original-row authority, atomicity/concurrency/idempotency/rollback and full source parity remain unproved. Platform event subscriptions were empty, but physical database triggers were not verified. Full-filter export, operational workflows and all-module/E01-E12 acceptance remain open.

### Sectioned-slice schema and permission boundary

Fresh 26-resource field/relationship confirmation is recorded in [historical60 live schema](../../backend/schema/historical-60-live-schema.json). No new business table or field was added in this slice; the existing 62-table/899-field contract and four targeted typed additions below remain the schema baseline.

Seven reviewed policies added exact synthetic fixture-ID READ exceptions only: `product_supplier`, `product_components`, `order_items`, `purchase_order_items`, `return_order_items`, `stock_transfer_items`, `work_order_items`. They are not general parent-derived membership or C/U/D grants. [Full before/after policy evidence](evidence/historical-60-policies.json) and [58 ordinary advisory cases](evidence/historical-60-normal-policy.json) preserve the bounded positive/negative results. The initial 58-item request exceeded the API bound and returned 400; smaller batches returned all 58 expected decisions. Native ordinary reads independently verified 135 rows, not merely advisory permission responses.

Empty platform event subscriptions before staging/publication do not establish absent physical database triggers. The attempted trigger-inspection diagnostic did not establish trigger visibility; its exact prior query definition was restored and policy unchanged. [Trigger audit](evidence/historical-60-trigger-audit.json). No concurrency, atomic rollback, native ordinary mutation or transaction command acceptance follows from these administrative fixtures.

## Prior targeted typed-field checkpoint - 2026-11-06

The business contract remains **62 tables**. The previous fully verified 895 fields plus four reviewed nullable additions now total 899; the patch adds no FK/index, preserving the prior 190 FKs/324 indexes. `backend/schema/erp-manifest.json` contains the four additive descriptors. The separate `qa_json_types_20261106` diagnostic table is not a business module/resource and is excluded from these totals.

| Table | New field | Native type / shape |
|---|---|---|
| saved_reports | columns_json | array, string items |
| saved_reports | filters_json | object, `items` array |
| saved_reports | sort_json | object, `field` and `direction` |
| activity_logs | properties_json | object |

Legacy `columns`, `filters`, `sort`, `properties` remain unchanged. Earlier blanket `any` mapping resulted in physical TEXT and did not prove JSON semantics. The isolated in-place TEXT-to-object attempt failed; the planned array step was explicitly not attempted after that failure. No blanket conversion of 31 fields was applied. The additive helper preserves complete live schemas and compares fresh state before any write. It records mutation intent and reconciles ambiguous outcomes once without replay; read-before-write is not atomic CAS.

The existing deterministic saved report received only the three new typed fields. One missing synthetic activity fixture was created using native `properties_json`, not legacy `properties`. Typed values were verified through admin native API and ordinary-session reads. No report execution, event generation, policy grant or generic CUD enablement follows from this proof. Seeder `fixture_wire` maps only missing-row writes; existing fixtures are not rewritten. `can_skip_fixture` rejects mismatched typed or present legacy JSON and distinguishes booleans from numbers.

Evidence: [reviewed plan](../../backend/schema/structured-json-additive-proposal.json), [applied migration/readback](evidence/structured-json-20261106T184314271383Z.json), [ordinary typed reads](evidence/structured-json-normal-read.json), [final152 frontend/208 Python/typecheck proof](evidence/product-workspace-verification.json). Other JSON fields and full reporting/activity workflows remain unaccepted.

### Private catalogue media is not a schema expansion

The approved catalogue delivery verified 252 private `products` objects and 263 product `image` URI links, preserving every other field except server `updated_at`. No bucket/policy configuration or storage ownership table was added; `Images` remains untouched/reserved. Existing authenticated-read policy is not organization-scoped. Admin upload/link proof and ordinary read proof do not establish normal-user CUD, atomic no-overwrite or PATCH CAS. See [delivery summary](evidence/hmg-catalogue-delivery-summary.json) and [ordinary linked count](evidence/private-media-linked-normal-count.json).

## Historical schema checkpoint

## Scope and authority

`backend/schema/erp-manifest.json` is the machine-readable contract: 62 business
resources mapped to all 32 development-pack modules. It is independently authored
from declarative source schema facts, not copied application implementation.
`source_evidence` gives the migration filenames used for each table. The old
application is never executed or imported.

The 2026-11-06 MCP read used explicit `hmg-studio` scope on
`insurance.taruvi.cloud`. Four business owners already exist: `organizations`,
`product_categories`, `product_locations`, `warehouses`. Native `auth_user` and
`storage_objects` are reference targets only. Native identity, roles, user
preferences, sessions, credentials and storage remain platform-managed.

## Exact contracts

- Logical provider names are `resources[].name`; physical tables use
  `hmg_studio_` prefix. Existing FK readback may contain that physical prefix.
- `schema.fields` declares names, types, nullability (`constraints.required`),
  defaults, enums and bounds. A persisted column is **not** an editable field.
- All new IDs and FK targets are UUID. Native user FKs must be resolved through
  the user provider, never through `auth_user` datatable queries.
- Source JSON columns are `any`, preserving both JSON arrays and objects.
- Source decimal columns use Taruvi `number`/NUMERIC; currency rounding and
  source decimal scale must be enforced by the authoritative business service.
  `orders.order_date` is a required timestamp supplied by that service, rather
  than replaying the legacy database `useCurrent()` expression.
- Every parsed FK has an index; explicit source indexes/uniqueness are retained.
- New FKs use restrictive deletion, except nullable references with SET NULL.
  Existing FK behavior is preserved unchanged.
- Existing live field definitions are never replaced. Only missing nullable or
  defaulted columns are added, including optional organization settings fields.
- Password/token/API-key columns are deliberately omitted. Shipping/webhook
  credentials require native secret storage and private backend operations.
- `modules[]` maps every module to shared resources. Dashboard, approvals, stock
  views and reports reuse domain tables rather than duplicate data.

## Provisioning

```powershell
python -X utf8 backend/scripts/provision_erp.py            # offline dry run
python -X utf8 backend/scripts/provision_erp.py --inspect  # live read only
python -X utf8 backend/scripts/provision_erp.py --apply    # additive MCP DDL
python -m unittest discover -s backend/schema -p 'test_*.py'
python -X utf8 backend/schema/verify_live.py               # complete live readback
python -X utf8 backend/schema/verify_live.py --apply-indexes # reviewed additive indexes
```

The CLI validates the exact app/site, refuses identity resources, reads before
writing, creates FK dependencies in order and defers cyclic FKs until targets
exist. Reruns preserve every live field/index/FK. No delete, row mutation, policy
replacement, frontend credential exposure, commit or deployment occurs.

`backend/schema/provision-report.json` records actual created/existing/updated/
failed/verified results. `liveVerified` means schema readback only, not ordinary
user authorization, RLS, browser acceptance or transaction safety.

## Completed schema checkpoint — 2026-11-06

`backend/schema/final-verification.json` is the cumulative checkpoint:
**58 new + 4 reused = 62 materialized business tables; 895 fields, 190 foreign
keys, 324 indexes; zero current verification failures.** All field types, UUID
formats, declared defaults/constraints, FK targets and index definitions matched
the live metadata. Full readback is `backend/schema/final-live-schema.json`.

The main run reported two transient dependency-lookup failures despite the
supplier table already existing. Fresh app-scoped sessions successfully created
the same unchanged purchase-order and supplier-history payloads; the two retry
evidence files preserve that sequence. Thus the main report's historical two
errors are resolved, not outstanding failures. Eight local contract tests and
Python compilation passed. No business rows or policies were written by this
schema task. Physical constraint enforcement, RLS and ordinary-user behavior
remain separate from schema metadata verification.

## Explicit remaining gates

All resources default to `writeMode: readOnly` in the contract. Frontend editable
allowlists and policies need independent authority/security review. Stock, money,
approval and workflow transitions are not enabled by schema creation. No database
RLS guarantee, direct-client bypass protection, cross-table transaction,
idempotency/concurrency or normal-role access is claimed by metadata readback.
Provisioning does not weaken any pre-existing policy. Dedicated synthetic seeding
is separate from schema work and must not update existing business records.

**Observed platform default differs from the local skill:** the newly created
`customers` resource auto-generated an app-scoped `read` ALLOW for roles `*`,
with no organization condition (writes are absent/default denied). Evidence:
`backend/schema/new-table-policy-evidence.json`. New tables must remain empty
until root-owned approved policies restrict reads to the intended synthetic
organization/test role. Table creation alone does not establish row isolation.

The three extractor warnings are dynamic index-maintenance loops, not missing
business fields. The three list-sort indexes and two inline transfer indexes
are independently declared in `index-supplement.json`; relationship indexes
are already covered by the FK index rule. Legacy duplicate-index deletion is
not replayed. Native runtime infrastructure tables are excluded. Re-extraction
writes a draft, never replaces the reviewed/live manifest.
