# Admin and normal-user continuation

## Scope and reuse

User requested Pradeep as HMG-Studio admin, regular users, and continued transactional workflows. Reuse native Taruvi identity and the existing scoped MCP transport. No custom identity tables, password changes to existing users, tenant-wide privilege elevation, or customer-app mutations.

Live preflight found one active Pradeep account (`pradeep+taruvi`) already assigned the app's Super Admin role. Preserve that assignment. Add the existing HMG Synthetic Operator role to make the explicit synthetic data scope available; create two distinct non-staff test users for sales/warehouse verification using that existing role. These are test accounts, not invented real employees.

Backend audit found no established atomic multi-table commit owner. Next candidate milestone is stock-adjustment preview/pending request, not stock posting. Confirm live schema and caller authority before writing any implementation or policy.

## Checklist

- [x] Read current native identity/role helpers and workflow owners; do not rerun historical policy replacement scripts.
- [x] Verify exact Pradeep account and current app admin assignment via MCP.
- [x] Add operator assignment and preserve Super Admin; subsequently assign and verify the user's existing `hmg-studio-admin` role. All three memberships confirmed via scoped MCP.
- [x] Create two least-privilege normal test users with strong temporary passwords; verify dedicated-user API, role membership and login.
- [x] Run bounded normal-session authorization/read/create probes without admin fallback. Fresh customer create still returns 403; no customer was written.
- [x] Refresh transactional schema/policy/runtime contract and implement a read-only stock preview, not posting.
- [x] Independent security review, targeted tests and live readback. Private `hmg-stock-preview-v1` returns PREVIEW_ONLY for an ordinary warehouse user; zero, foreign organization and commit requests are rejected; anonymous call is 403; repeated preview leaves stock unchanged.
- [x] Record provider dependencies: native create authorization divergence remains unresolved; atomic multi-table posting, rollback, concurrency and direct-write protection are not established.

## Boundaries

Never log returned user attributes or credentials into evidence: user attributes may contain secrets. New-account credentials are delivered privately to the requesting user, not committed. Preserve existing accounts/roles and all organization isolation. Admin assignment is not proof of ordinary-user writes, atomicity, concurrency, rollback, idempotency or direct-write protection. The user's latest request authorizes build and Taruvi deployment after release checks; no commit/push or browser acceptance is claimed.

## Evidence

- `evidence/admin-normal-users-provision.json` and the two normal-user verification reports.
- `evidence/pradeep-admin-role-assignment.json` (Admin, Super Admin and operator memberships).
- `evidence/stock-adjustment-preview-deployment.json` and `stock-adjustment-preview-live.json`.
- `evidence/sample-enrichment-python-verification.json`: 345 backend tests passed, including the preview and enrichment suites.
