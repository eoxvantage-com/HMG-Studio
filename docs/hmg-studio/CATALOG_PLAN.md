# First business slice: Categories

Status: INCOMPLETE / BLOCKED. Local backend draft exists; frontend/service contracts remain RED. Native function registration was rejected. Final QA policy permits scoped reads only; create/update/delete are denied. See [current incident and resume requirements](CATALOG_SECURITY_FINDINGS.md) and [master checklist](IMPLEMENTATION_CHECKLIST.md). Earlier audit statements below are historical, not current authority.

## Scope and reuse

Implement Categories list, search, active-state filter, server pagination, create/edit dialogs and committed readback. Register the existing `product_categories` resource in `src/App.tsx`; the current sidenav already consumes Refine resources. Reuse PageContainer, native session client, app/database providers, existing notifications and dirty-navigation guard. No duplicate sidebar, identity database, generic CRUD framework or mock metrics.

Source: development-pack/modules/18_categories.md and shared inventory authority. CodeAuditor additionally inspected original controller/HasSlug behavior without copying source implementation. Required name <=255; description nullable; create active=true. Name is not unique. Generated slug is organization-scoped with numeric suffix and stays stable on rename. Source API-only slug/parent fields are not modal fields.

## Exact file map

- Create `src/pages/categories/index.tsx` and `index.test.tsx`.
- Create `src/services/catalog.ts` and `catalog.test.ts` for typed private-function requests/results.
- Create `backend/functions/catalog.py` and `backend/tests/test_catalog.py`; reuse the existing remote catalog input validator rather than duplicate its rules.
- Extend `src/App.tsx` and its route tests; existing sidenav derives menu automatically.
- Replace existing `src/pages/home/index.tsx` only with genuine authorized data and working navigation after the category flow works. No zero-filled sales/stock dashboard.
- Update schema/service ledger03 and page/field/action ledger05 after verification.

## Authority gate

DBSchemaAgent live read confirms product_categories and organizations currently deny all ordinary-role CRUD. Required organization_id UUID exists; current organization/slug index is not unique. Products/stock relations do not exist. Cloud/admin credential reads bypass row checks and do not establish RLS.

Smallest proposed initial native scope: dedicated app QA Catalog A role, authorized only for existing QA organization A. No shared user-attribute schema change or new identity table. Replace only organizations/category policies after explicit approval; all other roles remain denied, and delete remains denied. Disable any new auto-created wildcard role policy before assignment. Verify row-filtered list, foreign read/create/update and attempted organization reassignment through direct API before enabling the edit flow. Restore deny policies if these checks fail. Do not assume submitted-row versus stored-row policy semantics.

Preserve full schemas when adding a database uniqueness constraint, and first check for collisions without altering any existing records. Record the actual native contract before implementation.

### Refreshed DBSchemaAgent evidence

- Logical/physical: product_categories / hmg_studio_product_categories; flat_table. UUID id and organization_id required; name/slug required strings; description and UUID parent_id optional; is_active required default true; created_at/updated_at/deleted_at nullable datetimes. Generated search_vector must not be declared as a new field.
- Full category index idx_1 is organization_id+slug, without unique:true. Other indexes: parent_id, is_active, generated search GIN. Organization FK cascades; parent FK sets null; neither proves same-org parent scope.
- Complete category rows at audit:0; duplicate organization/slug groups:0. Recheck immediately before any schema mutation.
- Existing policy identifiers: resource.datatable_product_categories.vdefault/insurance_hmg-studio and resource.datatable_organizations.vdefault/insurance_hmg-studio. Both active wildcard read/create/update/delete DENY. Preserve scope/version and snapshot full bodies before an approved replacement.
- Native fixed-UUID role conditions are documented for flat-table list filters. Update old/new organization checking is NOT yet proved. Stage read/create first; expose edit only after controlled QA update denial tests. Parentless creation avoids unverified same-org parent enforcement.
- Existing validator version1 returns normalized `values` only when valid=true; supports category name/description only. It accepts runtime request/__function__ but not __method__, although HTTP execution documents __method__ injection. Verify actual function-to-function envelope before reuse. Its AGPL provenance was detected; no source copied into this checkout. Do not duplicate implementation or silently change licensing.
- Historical audit checkpoint: explicit QA-only policy replacement approval had been requested but not received. It was subsequently approved; controlled QA mutations and policy rollback are recorded below. Do not use this old checkpoint as current state.

## Current verification and authority checkpoint

- Approved QA role `HMG QA Catalog A` (ID1123); automatic wildcard role policy disabled before assignment. Native QA user remains nonstaff/nonsuperuser. Organization policy allows only QA A reads; organization writes denied.
- Initial category read/create/update QA policy failed a direct organization-reassignment test. Restored deny policies, then restored only the dedicated QA A category to its original organization. No existing business records changed.
- A narrower create-only experiment denied update and existing-record upsert (403). However, direct scalar-validation enforcement and runtime command registration remained unresolved. Final category policy now permits only QA A reads and denies all create/update/delete; fresh policy readback plus ordinary-session create/update/foreign-read 403 checks passed.
- Index-only schema update added unique `organization_id,slug` index metadata. A preceding varchar-length change failed on generated `search_vector` dependency. Do not claim physical uniqueness/concurrency proof from metadata, or silently drop generated columns.
- Existing catalog validator changed only to accept injected `__method__` metadata (version2); no copied source in application code. Its HTTP/function-to-function validation after this change remains pending.
- `backend/functions/catalog.py` is a local create/readback draft, not a registered command. Two registration attempts returned `Function code failed the security scan`; native get returned not found. Do not bypass the scan or grant public/elevated execution.
- Local catalog tests: 12 Python passed before this checkpoint; nine frontend/service assertions failed against deliberate unimplemented scaffolds. Independent backend review found no critical/high code issue but requested commit-then-throw and failed/mismatched-readback tests. These remain open.
- No Categories resource/route has been registered, no create/edit UI is delivered, no browser acceptance, no full-module completion.

## Test-first sequence

1. Exact confirmed schema, existing validator output, policy proposals and authority contract.
2. Python RED tests for missing caller, unsupported identity fields, required values, same-org lookup, slug conflict, stable rename, partial input and uncertain-write readback. No retry after ambiguous writes.
3. Frontend RED tests for live-provider list/pagination/search/filter, four empty/error states, create/edit field errors, double-submit protection, saved readback and retained input on failure.
4. Implementation through existing native SDK/providers; security/duplication review before full verification.
5. Dedicated QA sessions and records only: create, reload, edit, reload, direct-API denial, other-org denial. Existing business rows untouched.
6. Browser full workflow on user-started localhost:5173, keyboard/mobile checks and accurate evidence ledger.

## Not silently omitted

Category product counts/selection integration and soft-delete reference checks need the actual products owner; never fabricate products_count=0 or implement hard delete. These remain required module18 work. Warehouses/locations follow, with shared warehouse grants and source-specific deletion/stock rules. Stock/payment posting remains separately gated by transaction guarantees. Full32module/123view scope remains unchanged.
