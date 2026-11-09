# Schema and Python Service Contract Ledger

## Status and authority

**Original pack baseline:** no target names or runtime capabilities were confirmed by documentation alone. The live 2026-11-06 evidence below supersedes that baseline only for the explicitly tested layers; transactions remain unverified. Source names in module evidence describe Inventoros only. Use MCP read-only discovery first, then propose additive changes and obtain implementation authority. Do not create a second organization/user/product table when an existing owner already satisfies the contract.

## Required capability record

| Capability | Evidence to record | Current status |
|---|---|---|
| Exact application identity | Explicit hmg-studio app/tenant scope and connector identity | Verified: insurance.taruvi.cloud, explicit hmg-studio MCP scope, Taruvi 3.4.11 |
| Python runtime/hosting | Supported version/dependencies/secrets/network/deployment/health | Partial: existing private APP Python validator executed; version/dependencies/network/deployment health unverified |
| Native identity | Verified token/session validation, membership and role/policy contract | Partial: installed SDK session contract tested locally; organization membership and live sessions unverified |
| Datatables | Actual names/IDs, columns/types/nullability/defaults, constraints/indexes, pagination | Verified metadata: six tables; see ../PROJECT_SPEC.md. Field/relation snapshots inspected; source-parity gaps remain |
| Access enforcement | Native tenant/row/object policy and direct-client bypass tests | Four active business deny policies observed; RLS and direct-client bypass tests unverified |
| Atomic command writes | Transaction/locking/conditional revision semantics and rollback proof | BLOCKED: official reliability docs specify independent HTTP requests and no record-version preconditions; supported cross-table Python command contract still required. See ../PLATFORM_DECISION.md |
| Idempotency | Unique effect identity and same-request retry semantics | BLOCKED: no effect-identity persistence/unique commit semantics verified |
| Storage | Buckets/purposes/object IDs/access/upload/download/limits | Zero buckets returned; native object access/upload/download proof pending |
| Background tasks | Durable jobs/schedules/retries/deduplication/monitoring | Async/schedule metadata interfaces present; durable retry/deduplication not proven |

## Field/relationship mapping template — expand for every source entity

| Module / source entity | Source field | UI vs persisted vs derived | Exact target table/column | Type/default/nullability | Uniqueness / relation / tenant keys | Policy | Migration/reuse evidence |
|---|---|---|---|---|---|---|---|
| Populate from module evidence | Exact source key | Explicit | Confirmed only | Exact | Explicit | Explicit | Pending |

Arrays and nested form aliases must not become guessed columns. Separate UI-only selection, pagination, confirmation flags and filters from persisted records. Preserve parent/variant IDs, owner references, snapshot documents and immutable history. Derive actor, tenant, numbers, totals and lifecycle timestamps server-side according to verified source behavior.

## Python command/query mapping template

| Source action | Existing target owner / exact file | Endpoint and request schema | Response / errors | Permission / tenant checks | Transaction writes | Idempotency / revision | Tests |
|---|---|---|---|---|---|---|---|
| Fill per action | Inspect first | Confirm then define | Field validation, denied, missing, conflict, provider failure | Server-authoritative | All effects or no effects | Explicit when applicable | Exact test names |

Use logical query/command separation: ordinary detail/list queries may use a verified scoped provider; compound stock/payment transitions must use the shared Python business command boundary. Do not expose writable totals or raw stock updates through a generic Refine CRUD mutation. The final transport paths and Python signatures must be chosen from the current target code, not the old Laravel routes.

## Required shared service ownership

- Identity/permission context and tenant-safe record lookup.
- Stock balances/reservations/movement ledger and atomic posting.
- Order/PO/return/work-order state machines and document numbering.
- Payment/refund/void ledger and decimal totals.
- Storage object validation/ownership and generated document snapshots.
- Report projections/import result ownership/job status.
- Post-commit events, notifications and outbound delivery attempts.

These are responsibilities, not a mandate to create seven independent microservices. Prefer a cohesive existing Python application with clear owners unless deployment requirements justify separation. Never duplicate the same calculation or transaction logic in browser, Python and native function wrappers.

## 2026-11-06 decision gates

- Exact logical resources: `organizations`, `product_categories`, `product_locations`, `warehouses`; physical names are prefixed `hmg_studio_`. System `auth_user` and `storage_objects` are not custom identity/storage replacements.
- Reuse private `validate-catalog-profile-v1` and `validate-contacts-profile-v1`; neither is an authorization or persistence boundary. Inspected catalog entrypoint is `main(params, user_data, sdk_client)`; it intentionally does not use caller/SDK context. Inputs are `resource` and `values`; outputs declare `validation_scope: input_only`, `persistence: false`, and unchecked authority/relationship/uniqueness/workflow checks.
- The existing shared user-attributes schema does not provide an established HMG organization membership field. It belongs to the whole tenant and includes other apps; do not overwrite it or introduce another identity table. No attribute values were fetched.
- The MCP SDK/policy guide files are missing on the server, but current official web documentation is available. [Platform decision evidence](../PLATFORM_DECISION.md) records the documented consistency boundary and exact native contract needed. Do not assume an older local quick reference proves an exposed API.
- User approved dedicated QA records/test users only. Two inactive QA organizations were created and read back; exact IDs, recovery limits and cleanup scope are in [QA fixtures](../QA_FIXTURES.md). No existing record or deny policy changed. User creation remains deferred: only Super Admin is listed, no role slug is returned, and native membership/required-attribute contracts remain unresolved. This is administrative fixture access, not end-user authorization or transaction proof.
- Future Python business owner paths/signatures stay unresolved until identity and transaction contracts are confirmed. This is an explicit Phase 0 gap, not a license to choose a new server/database or emulate transactions with independent requests.

## Native account contract verified 2026-11-06

Private `hmg-account-preferences-v1` uses `main(params,user_data,sdk_client)` and native `users.get_preferences`/`update_preferences`. Only date_format,time_format,timezone are editable; updates are partial, returned success requires fresh readback. Injected request/__function__/__method__ metadata is ignored as authority. Dedicated nonadmin QA session verified write/readback; anonymous execute and direct QA business reads403. No custom auth table or shared attribute-schema change. Business-org membership and row isolation remain separate unverified gates. See ../QA_FIXTURES.md and ../NATIVE_ACCOUNT_PLAN.md.

## Current catalog contract checkpoint (supersedes earlier no-mutation statements)

- Approved QA-scoped policy replacements and dedicated native role1123 are recorded in ../QA_FIXTURES.md. No custom identity schema. General business organization membership remains unresolved.
- Logical product_categories / physical hmg_studio_product_categories: preserved required UUID id/organization_id, required name/slug, nullable description/parent_id, active defaulttrue and generated search_vector. Unique index uq_hmg_category_org_slug added on organization_id+slug; physical duplicate/concurrent behavior not yet tested.
- Proposed varchar255 field narrowing FAILED due generated search_vector dependency; proposal file is not active schema. Final read-only QA policies block direct invalid creates while this is unresolved.
- Native stored/proposed row isolation test FAILED: an authorized category update changed organization A to B. Dedicated QA row restored. Category create/update/delete now denied; read only QA A. Organization mutations denied. Policy snapshots refreshed; ordinary-session final denial checks passed.
- Draft backend/functions/catalog.py signature main(params,user_data,sdk_client), actions create/readback only, request_id UUID, organization_id UUID, values name/description. Caller-scoped native SDK, no elevation, stable ID, one ambiguous-write readback, no repeated write. NOT a released service: registration rejected security scan; no route wired.
- Existing private validator v2 now tolerates injected __method__; rules unchanged. Post-change HTTP/function-to-function validation is still pending. Source licensing provenance remains explicit; no source code copied into application implementation.
- See ../CATALOG_SECURITY_FINDINGS.md and the latest parity-ledger checkpoint; these failures do not disappear because a local test or schema read succeeds.
