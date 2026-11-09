# Catalog blockers and controlled QA evidence

Status: unresolved; Categories is NOT released. App scope: `hmg-studio`, Taruvi insurance tenant. Date: 2026-11-06. Dedicated fixtures only; no existing business data modified.

## B01: proposed-row organization isolation failed

Precondition: dedicated ordinary QA user, nonstaff/nonsuperuser, role `HMG QA Catalog A`. Automatic wildcard role policy disabled. Resource policy allowed category update only when `R.attr.organization_id` equaled QA organization A; read/create also scoped to A, delete denied.

Steps/results:
1. Unfiltered organization/category reads returned authorized scope. QA A category creation/read/name edit succeeded.
2. QA B category read/update returned403 as expected.
3. PATCH QA A category `organization_id` to B unexpectedly returned200. Expected403 and unchanged organization.

Inference: this tested update path checked stored-row authority without preventing the proposed organization change. This is a reproduced behavior, not proof of all platform update paths. Hiding the organization field in React is not an acceptable fix.

Containment: immediately restored deny policies; restored the exact QA A row to A using preserved data. Retested a narrower create-only policy: ordinary update403 and upsert-existing403. Then closed create too because direct scalar enforcement and runtime registration remain unresolved. **Final state: QA A read only; all category create/update/delete denied.** Organization writes remain denied. Final ordinary-session read200/create403/update403/foreign-read403 checks passed.

Evidence: [initial HTTP results](evidence/catalog-qa-http.json), [intermediate create-only denial](evidence/catalog-create-only-qa.json), [final read-only checks](evidence/catalog-final-readonly-qa.json), [current category policy](evidence/product_categories-qa-policy.json), [current organization policy](evidence/organizations-qa-policy.json), [exact QA identities](QA_FIXTURES.md).

Unblock: documented supported proposed-row/immutable organization enforcement, then direct PATCH/bulk/upsert/reassignment/foreign nested-ID tests under ordinary roles with readback proving no forbidden effects. Do not grant update until this passes.

## B02: runtime security scan rejected the draft

`hmg-categories-v1` registration returned `Function code failed the security scan`; the subsequent get found no function. Repeated once for full diagnostic capture; same rejection, no detailed cause supplied. See [registration response](evidence/catalog-function-registration.json). Draft source remains local, not available to the app.

Unblock: obtain the platform's specific scanner diagnostic/supported-runtime contract, correct the identified issue, re-review, register privately, verify exact source and execute end-to-end under the ordinary QA session. Do not evade the scan, make the function public or introduce elevated credentials.

## B03: schema constraints and uncertain writes

- Unique organization/slug index addition succeeded in schema metadata: [schema after](evidence/categories-schema.after.json). Actual duplicate/concurrent writes were not verified; metadata is not enforcement proof.
- Earlier `name`/`slug` length narrowing failed because generated `search_vector` depends on `name`. [Proposed constraints](evidence/category-constraints.proposed.json) are a FAILED proposal, not active schema. Do not remove generated search fields to force this without a reviewed migration.
- Wrapper validation alone does not cover direct datatable writes. Scalar bounds, null-parent constraints and authorization must hold on direct paths before create grants return.
- Review requires tests for commit-then-throw reconciliation, no second write, missing/mismatched/error readback and simultaneous UUID/slug requests. Current local fake-SDK tests are not native concurrency evidence.

## Exact next actions

1. Resolve B02 with the platform diagnostic; retain fail-closed native policies.
2. Add the review-requested Python tests and prove native validation/constraint/isolation behavior with dedicated fixtures only.
3. Finish currently RED frontend/service contracts, register routes/resources only when their callable backend is verified, then run security review and the full suite.
4. Browser-verify list/create/readback and accessibility using QA identity. Editing, deletion/product-reference checks and full module acceptance stay open until their contracts pass.

Stock/payment atomicity remains a separate [platform gate](PLATFORM_DECISION.md), not a reason to omit independent safe work. All 32 modules/123 views remain in the [master checklist](IMPLEMENTATION_CHECKLIST.md).
