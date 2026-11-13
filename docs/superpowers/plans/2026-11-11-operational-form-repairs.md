# Operational form repair checkpoint

## Requested outcome

Repair normal HMG-Studio product, order, return, purchase-order and approval screens, not only the isolated QA ledger. Keep Taruvi-native Python functions and no partial or duplicate stock effects. Improve existing MUI forms, upload product images, and show readable organization-scoped lookups. Cleanup is LAST.

Latest user clarification retains THREE organizations: HMG Studio, Isolation A, Isolation B. Exact live IDs must be confirmed. Do not silently convert generated transactions into real business history. Preserve manual business records. Export and preview dependency-aware cleanup before deletion.

## Confirmed source findings

- MasterForm performs verified readback then clears the warning state and navigates in the same tick. UnsavedChangesDialog still intercepts the navigator; RHF dirty state is not reset.
- Product media is explicitly excluded from both form and function allowlists.
- Sales and return buttons are literally disabled, with no command handler.
- PurchaseOrderWorkspace omits the existing submission callback and retains its default blocker.
- Legacy approval tabs only list rows; only the separate QA tab has posting actions.
- Lookup filter encoding is not proven broken. Current scoped policies/data require read-only inspection; historical location/order policies excluded ordinary Admin outside QA.

## Implementation sequence

1. Code audit and current destination schema/policy/data audit.
2. Regression-tested verified-save navigation repair, preserving warnings on failure and uncertain writes.
3. Correct lookup authorization/data mismatches without weakening organization isolation; distinguish loading, denied, empty and search-no-match states.
4. Reuse native storage + product function for validated media attachment. Do not claim saved images before verified object and record readback.
5. Extend approved ledger authority into normal workflows: atomic document header/lines, pending/approved/rejected states, stock effects and return entitlements. Switch all associated readers consistently; no cosmetic enablement of buttons over missing backend commands.
6. Improve grouped forms, numeric input editing, names, error placement and action states using existing tokens/components.
7. Security review, failure/retry/concurrency tests and native API acceptance, then documentation and release.
8. Cleanup last: resolve retained organization IDs, export, identify generated records/dependencies, obtain deletion-preview confirmation, then API cleanup and separately identifiable scenario data.

## Acceptance

- A confirmed product/customer save navigates without an unsaved prompt; failed/uncertain saves retain the guard.
- Pradeep sees correct organization-specific location/customer options and can attach product media.
- Orders, POs, returns can be created, reloaded and reviewed through normal screens.
- Duplicate/retried/concurrent posting cannot create duplicate or partial stock effects.
- Production readiness is not inferred from passing local tests or QA-only gateway acceptance.

## Current live audit (read-only)

- Retain HMG Studio `55dcee2a-dea1-4dfc-83ee-9474f7b5815b` (active), Isolation A `616d839b-e107-4511-b12f-fd6ed301d999` and Isolation B `4166493b-ca74-4117-8a42-a3ec669bbfd0` (both inactive).
- HMG Studio has zero locations and zero orders. All existing locations identify themselves as synthetic fixtures; do not relabel them as genuine historical operations.
- Location policy also denies Admin read outside migration QA. Removing a frontend filter cannot repair the missing rows or this policy.
- The exact installed-provider customer query returns HTTP 200 and one active, undeleted Studio customer. This is owner-key API evidence, not proof of Pradeep's browser session. The diagnostic `__isnull` operator failed; the actual provider uses `__null`, which succeeded.
- Product schema has `image` string max255 and existing `images`, `image_disks`, `thumbnail` fields; no product_images table. Existing products bucket is private. Ordinary Admin upload acceptance remains required.

## Status

- Source and live schema/policy/data audits complete. Raw read-only evidence is in ignored `.cache/forms-audit-20261111/`.
- Verified-save/discard and product-media source reviewed: 186 product backend tests, 81 media/form frontend tests passed. Ordinary Admin native media acceptance found MEDIA_UNCONFIRMED; this is not accepted live yet. Native release agent owns investigation and rollback evidence.
- Commerce v2 domain/adapter reviewed: 108 tests passed, including pinned pagination and retained-organization authority freeze before credentials.
- Reader migration reviewed: 139 dashboard backend tests and 53 reader frontend tests passed. Full typecheck remains pending the normal commerce workspace implementation; do not imply whole-app success.
- Normal order/PO/return/list/detail/edit/approval route integration remains in progress with frontend worker; final security review and full suites are pending.
- Native stages 1–3 provisioned/read back scoped location access, zero-stock default locations and Studio/A empty genesis; B sentinel preserved. See ignored `.cache/commerce-release-20261111/provision-receipt.json` for exact evidence. Retained activation markers were not changed during these stages.
- User explicitly approved correcting the two active manually entered kit/assembly batch products to ordinary standard/no-tracking stone products; minimal API correction and unchanged-field readback are complete.
- No cleanup or frontend deployment completed yet. Studio authority activation remains gated on native acceptance and complete reader/route integration. Isolation A may be activated only for the approved isolated native API acceptance phase.

## Subsequent verification checkpoint

- Full backend suite: 930 passed; the initial sandbox run had a pytest temporary-directory permission error, resolved by an approved unrestricted rerun. One intentional duplicate-ZIP warning remains in an adversarial archive test.
- Native ordinary Admin product create/replay/edit/readback passed. Image upload initially returned an HTTP-success batch with a per-file permission denial. Preserved the existing private bucket read policy and added only Admin create for the exact three retained organization image prefixes; retained-path upload and exact-byte readback passed, foreign-prefix upload was denied. Actual product image update/readback passed without service-role bypass.
- Native commerce lifecycle passed 14 checks: approved PO does not move stock; receipt retries do not append twice; sales fulfillment and return restock are authoritative; competing approvals commit once; invalid multi-line commands do not partially mutate; changed request payloads conflict; direct Admin event mutations and writer-secret reads are denied; non-Admin HMG Team calls are denied. Isolation A account deactivated after acceptance. Evidence remains in ignored `.cache/commerce-release-20261111/`.
- Normal commerce screens passed their focused checkpoint, but stock movement/adjustment normal-route integration and authority-aware report exports are still being completed. No full frontend or deployed-UI acceptance claim yet.
- Product storage regression tests cover native batch denial, wrong returned path, and exact-byte success. Total product backend tests: 189. The content-hash readback reconciliation design is unchanged.
- No data cleanup has been performed. HMG Studio and Isolation B remain unactivated pending the complete release; Isolation A is the classified test scope.
