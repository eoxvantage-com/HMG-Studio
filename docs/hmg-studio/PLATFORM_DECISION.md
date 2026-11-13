# Platform decision needed for complete HMG-Studio delivery

Status: user selected existing Taruvi backend/functions on 2026-11-06. No alternate backend will be introduced. The atomic stock/payment contract remains unresolved and blocks only the affected posting workflows, not safe independent catalog/account work.

## Binding requirement

The supplied architecture and execution prompt require Python-owned, atomic stock/payment commands using Taruvi-native storage, with concurrency, rollback, idempotency and direct-write denial proved before posting. E02–E07 depend on these guarantees. The prompt explicitly requires an architecture decision when a required platform capability is unavailable; it does not permit silently changing the database or weakening consistency.

## Current primary-source evidence

The [official Database reliability guide](https://docs.taruvibase.com/docs/products/database/operations/reliability) documents transaction scope within a single record/bulk request, not across separate requests. It also documents no record version/ETag/If-Match precondition and potential lost updates. This narrows the prior unknown: wrapping independent SDK requests in Python does not establish the required cross-table commit. Its recommendation to use a server-side function is not a specified cross-table transaction API.

The [Functions reference](https://docs.taruvibase.com/docs/products/functions/reference) documents the exact Python entrypoint and caller-scoped injected SDK. Direct database drivers are not allowed in that sandbox. The [security/limits guide](https://docs.taruvibase.com/docs/products/functions/security-limits) documents no automatic execution retries. These public contracts still require verification against the selected deployed environment.

Missing MCP guide files are no longer a blanket documentation blocker: current official web documentation is available. The outstanding blocker is an executable supported transaction/identity contract, not finding a guide.

## Required platform response — recommended native path

Provide a supported Taruvi operation callable by the app's Python runtime that:

1. Authenticates the original caller and resolves authorized HMG business-organization/warehouse scope.
2. Locks or conditionally checks affected document/balance revisions.
3. Commits document changes, stock/money effects, idempotency result and audit records together across the required tables.
4. Rolls everything back on injected failure before commit.
5. Returns the original committed result for a duplicate request and rejects a conflicting reuse.
6. Prevents an ordinary client from bypassing the command through direct table writes.

Needed artifacts: callable name/signature, deployed version, request/result/error schemas, authorization and transaction semantics, and an approved QA invocation path. Validate with the two existing dedicated QA organizations and least-privileged QA identities; never use real operational records for fault injection.

No direct database credentials or secret values should be supplied in chat.

## Alternative decision

If Taruvi has no such supported facility, approve a revised transactional-backend architecture before implementing affected posting flows. A separately hosted Python process alone does not solve transactions across independent Taruvi HTTP calls. Any change to authoritative storage would change the supplied native-storage constraint and needs an explicit new design decision; no alternative database has been installed or provisioned.

## Independent identity findings

Installed SDK 1.5.4 and provider 1.3.7 expose tenant-wide user management, app-scoped role listing, and fixed-self preferences. They do not expose HMG business-organization membership. Do not confuse platform organization ownership with rows in `organizations`.

The [official policy guide](https://docs.taruvibase.com/docs/auth/guides/policy-management/) requires role **names** in Cerbos rules; role assignment APIs use slugs. Recover slugs through the native app-role API rather than guessing from MCP names. Existing deny policies remain unchanged. Any replacement needs an exact reviewed policy and explicit confirmation.

## Work that remains possible without this decision

Continue source-to-target field/action mapping, local pure-domain tests, and native self-service contract work. These are not substitutes for the requested finished application. Do not generate disabled business workflows or call metadata access end-to-end acceptance. Complete the shared authority phase before connecting business mutations.

No new application code, remote writes, users, policies or deployments were made during this investigation. Existing local tests were not rerun; the 21-test result remains the preceding foundation checkpoint.

## User decision and current progress

User explicitly chose Taruvi skills, existing backend/functions and Refine template. Native account preferences now persist through a private Python function with QA-session readback; see NATIVE_ACCOUNT_PLAN.md. This does not solve stock/payment atomicity. Continue shared category authority and catalog list/create/edit while retaining full workflow scope. No stock or financial writes will be enabled on assumed guarantees.

## Decision reaffirmed and independent master acceptance - 2026-11-09

The user explicitly retains **all-or-nothing stock updates** and chose to finish tests and release tooling first. The existing Taruvi-native architecture remains the decision; do not silently substitute eventual consistency, compensating HTTP calls, a second authoritative database, or unverified transaction semantics. Stock/receipt/payment posting gates remain in force until the callable guarantees above are demonstrated.

The earlier ordinary-customer-create 403 is not a general blocker to the standard app Admin model. Products/customers/suppliers now have retained standard-Admin API create/read/update/read/logical-delete acceptance, with roleless customer-create and both private-command execute denials (403), and QA role revocation. Three corresponding manifest write gates/command slugs are enabled. See [sanitized master acceptance evidence](evidence/master-crud-session-acceptance-20261109.json). The earlier conditional-policy discrepancy remains historical unresolved evidence, not proof that all native writes fail.

These safe independent master commands do not establish cross-table stock/payment atomicity or complete module parity. The user is performing manual UI testing; no browser acceptance is claimed. Existing history above is retained as evidence of its original investigation, not a statement that no subsequent deployment or master writes occurred.


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
