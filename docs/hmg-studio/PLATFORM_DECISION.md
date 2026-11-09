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
