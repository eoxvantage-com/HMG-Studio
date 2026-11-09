# Transactional workflow implementation checklist

Current user priority (2026-11-08): complete one workflow end-to-end at a time in this order: **Product creation -> Purchase Order creation -> Receipt/stock update -> Invoice/order/payment dependencies**, then continue the 32-module parity ledger. Test acceptance as the existing Pradeep user only. Do not create users, change roles, seed live transactions, deploy, commit, push, or mutate HMG Stones without the separately required approval. Existing records, including apparent test data, must be retained pending explicit deletion approval.

## Current implementation and verification checkpoint (2026-11-08)

### Immediate create-entry request (2026-11-08)

| Request | Implemented locally | Verified | Persistence status / next step |
|---|---|---|---|
| Inventory product create entry | `Add product` is now exposed from the inventory list even though backend save remains guarded; direct `/inventory/create` reaches existing product master form. | List action and helper/form tests plus typecheck pass. No browser/CUA used per user instruction. | **Not persisted**: product write remains intentionally disabled pending scoped authorization + safe product/stock command. |
| New order form | Added `/orders/create` form with organization and permitted customer/product/variant lookup, one-off customer details, item lines, quantity/date/tax/shipping/currency/total validation and disabled commit. | Direct route and action tests; form render/guard tests; draft validation tests; typecheck pass. | **Not persisted**: no order/stock atomic server command proven; no live request sent. |
| New return form | Added `/returns/create` form with organization-scoped eligible shipped/delivered orders, remaining line quantity calculation from prior returns, type/reason/condition/restock inputs and damaged-item restock prevention. | Direct route and action tests; form render/guard tests; return-line validation tests; typecheck pass. | **Not persisted**: no atomic return header/lines/refund/stock command proven; no live request sent. |

This is form access only, not completed CRUD/business workflows. Do not describe these creates as working persistence until create-save-reload-reopen/edit is verified against Taruvi.

**Edit/status-save request:** Product list/create, order, purchase-order, return, and supplier records still do not have verified edit/status persistence for Pradeep. The current detail UI intentionally hides edit where `writeBlocker()` reports missing server authorization/verified write action; orders and returns additionally require transition commands rather than generic record updates. Do not unhide edit/enable submit as a workaround. Next implementation dependency is the correctly app-scoped Taruvi function/auth capability plus server-side transactional commands; without it a local button would falsely promise updates and could bypass stock/financial invariants.

| Workflow | Implemented locally | Local tests | Live create -> reload -> reopen -> edit | Business posting/dashboard | Exact next task |
|---|---|---|---|---|---|
| Product | Source-backed scalar create/edit form and undeployed zero-stock create/readback Python command; opening stock, images, variants, supplier links, alternate prices, and command wiring remain absent. Generic product writes are explicitly blocked even if manifest flags change. | Frontend focused 30/30 and typecheck pass after latest edit; backend command 25/25 and full backend 476/476 in isolated earlier run | **Not verified**; Save remains blocked and no live write occurred | Opening stock requires atomic ledger command; not implemented | Verify app-scoped policy/function contract, then wire/deploy product command and add atomic stock/child path before live acceptance (approval required for live posting/deploy) |
| Purchase order | Source-mapped header+line draft form and organization/supplier/product/variant/cost lookup wiring; direct URL and list navigation added. Lookup cache is identity-scoped; missing organization and inactive product are fail-closed; late supplier quote refreshes only untouched pending fields. Submit is deliberately blocked until an atomic server command exists. | Focused PO/ERP 30/30 and typecheck passed locally; no backend PO tests yet | **Not verified**; no save/reopen/edit | Receipt/stock command absent | Confirm app-scoped schema/policy and function-runtime transaction primitive; implement atomic draft command + readback, then enable save after authorization and approved live acceptance |
| Receipt/stock | No receive page or server posting command | Not started | **Not verified** | Atomic/CAS/idempotent posting absent | Implement and test one receipt command only after a supported transaction/lock primitive is confirmed |
| Invoice | Source treats customer invoice as an **order subflow**, not a standalone Create page; current app has fields but no issue/send command | Not started | **Not verified** | Payment ledger/void/refund and invoice numbering remain unproved | Map order/invoice dependency, implement server-owned numbering/issue and readback, then payment flow |
| All other modules | See 32-module CRUD table in `ERP_EXPANSION_PLAN.md` and source-level ledger in `development-pack/05_PARITY_AND_RESUME_LEDGER.md` | Historical tests are not workflow acceptance | **Not verified end-to-end** | Most actions incomplete | Continue in source dependency order after above vertical slices |

**Access evidence boundary:** this turn's bound MCP tool answers `Table not found` for both `orders` and `hmg_studio_orders`, and lists unrelated insurance functions despite the local MCP config targeting `siteId=insurance&appId=hmg-studio`. The 2026-11-06 schema snapshots confirm column names but do not verify today's live app scope, write authority, or transaction semantics. Do not deploy through this binding. The user stopped Computer Use this turn, so browser acceptance cannot be claimed. The separate `logs/frontend.ndjson` file is absent; no browser error capture is available. Continue local implementation and isolated tests.

**Safety gate:** no recorded Taruvi function-runtime transaction/CAS primitive has been verified. A function that performs sequential SDK `.create()`/`.update()` calls is not atomic. The MCP `raw_sql(transaction_mode="atomic")` reference describes a control-plane tool for audited one-off SQL, not a confirmed callable transaction API inside a deployed business function. No stock, receipt, payment, invoice numbering, or posted-document transition may be enabled on that assumption.

## Sales order creation - queued after Product, PO/Receipt and invoice dependency mapping

- [ ] **Create/save** order header and one or more validated line items through a server-owned command; derive totals server-side.
- [ ] **Stock guarantee**: implement the source-required initial stock effect, including the pending-approval path; prove atomicity, concurrency/CAS, rollback, idempotent retry, and no direct-write bypass before exposing a commit action.
- [ ] **Reopen/edit**: reload persisted header and lines; edit supported fields without allowing committed stock or payment state to be forged.
- [ ] **Business actions**: exercise approval, ship/deliver, cancel/reject, with no second stock deduction and correct restoration behavior.
- [ ] **Readback/dashboard**: fresh read after each command; verify order list/detail, stock, and dashboard aggregate deltas.
- [ ] **Evidence**: record test commands/results, Taruvi function release/version, request IDs, readback, and authenticated browser outcome.

### Existing source and contract findings

- Existing UI owner: `src/pages/erp/index.tsx` (`ErpModulePage`, `MasterForm`, `Detail`, `RecordList`). Generic master CRUD intentionally excludes `orders`; it cannot persist order lines or business effects.
- Exact known schema source: `backend/schema/erp-manifest.json`; order/line/payment/stock resources are `orders`, `order_items`, `order_payments`, `products`, and `product_location_stocks`. This manifest is a recorded schema snapshot, not proof of current deployed schema.
- Existing order requirements: `docs/hmg-studio/development-pack/modules/12_orders.md` states order creation must apply the source-accurate initial stock effect (including pending approval); shipping must not deduct again; payment/refund/void balances must reconcile; unauthorized/replayed commands cannot duplicate effects.
- Current local functions include dashboard and read-only stock preview only. No order-creation command or atomic transaction implementation is present under `backend/functions/`.
- The bundled Taruvi function SDK reference describes database reads and CRUD; it does not establish transaction, locking/CAS, or rollback semantics. Do not emulate atomicity by issuing multiple browser/API writes.
- The currently bound Taruvi MCP responds for the wrong app scope. App-scoped schema/function/policy mutation and Pradeep browser acceptance are **not verified in this turn**; see the current checkpoint above.

### Status

- **Implemented:** no order-create code change in this slice; existing generic CRUD deliberately blocks order creation rather than performing unsafe partial writes.
- **Locally verified:** source map and contract above inspected; `npm.cmd test -- --run src/services/erp.test.ts` passed (12 tests), confirming current write gating. These are guard tests, not order workflow tests.
- **Blocked for safe implementation/verification:** app-scoped Taruvi MCP access for the HMG-Studio site (schema, policies, function management/execution) and the platform's supported atomic transaction/idempotency primitive or an already-deployed transactional backend API. For browser acceptance also provide an authenticated Pradeep session/control path. These are required to create/execute and read back a real persisted order without violating stock guarantees.
- **Next:** continue only after the atomic command contract is available; then use Pradeep for create → reopen → edit → business actions → persistence/dashboard readback. After that proceed to purchase orders, then work orders/production.

## Purchase order creation / receiving — queued

- [ ] Create/edit order header and lines; derive totals and supplier/product scope server-side.
- [ ] Receive partial/full quantities once only; verify stock posting and balances atomically.
- [ ] Reopen and verify receipts, status, inventory, and dashboard after refresh.

## Production / work-order creation / completion — queued

- [ ] Create order and component requirements with server validation.
- [ ] Complete once only; atomically consume components and add output stock with rollback/retry protection.
- [ ] Reopen and verify order, stock, and dashboard after refresh.

## Continuation checkpoint - 2026-11-09

**Current boundary: schema alignment is verified; live master-write authorization and transactional workflow acceptance are not.** Earlier access/tool-binding findings above describe their original sessions.

- The read-only app-scoped audit (`.cache/crud-audit-20261109/schema-contract.md`) matched **all 62 manifest resources** against the **65 live tables**, with no schema drift. This does not prove safe create/edit or a callable transaction primitive.
- The user approved scoped **existing Admin master-record create/edit**, not stock, payment, order posting, or deletion. **No live grant was applied:** trusted Admin organization binding remains unverified, and historical stored-row-only update authorization allowed organization reassignment. `master-policy-plan.md` remains a local proposal only.
- Local ERP service/test hardening validates rating **0–5** and signed 32-bit integers. Local product-master command/test hardening supplies the full normalized create attributes to authorization and validates nonnegative signed 32-bit integers. These changes do not deploy or wire the product command, enable generic saves, or implement posting workflows.
- **Local evidence:** ERP service **32 passed**; shared ERP forms **27 passed**; product command **51 passed**; full backend **510 passed**; TypeScript passed. Scoped code and security reviews passed. The full frontend suite is still running at this checkpoint and is **not claimed green**.
- **Product:** remains undeployed/unwired, with save blocked. **Generic masters:** remain gated. Existing native Categories/preferences paths are separate and are not evidence that generic master saves are enabled. **PO/receipt/order/payment:** no new live persistence or posting acceptance is established. No deployment, live writes, or QA records occurred in this continuation; no module/chain is newly checked complete.
- **Next dependency:** confirm trusted server-owned Admin organization membership and safe checks on both existing and proposed organization values (or immutable organization enforcement), including same-organization allow and cross-organization/reassignment denial evidence. Only then apply a properly scoped approved master grant and proceed with separately authorized deployment/wiring and create → reload → reopen → edit readback. Continue Product → PO → receipt/stock → invoice/order/payment; do not enable stock or financial writes without proven atomicity, concurrency, rollback, and idempotency.

## Current checkpoint addendum - 2026-11-09 (non-platform QA in progress)

**This addendum supersedes stale current-state statements above, while retaining their historical evidence. No module or end-to-end chain is newly accepted.**

- **Scope and local fixes:** app-scoped MCP for `insurance/hmg-studio` is working; the audited **65 live tables** align with all **62 manifest resources** (`.cache/crud-audit-20261109/schema-contract.md`). Local changes include the Categories Controller save-validation fix, ERP rating **0–5** and signed 32-bit integer validation, and product-command authorization using normalized create attributes. These are local fixes, not deployed workflow acceptance.
- **Authorization decision:** the user approved the standard app **Admin** role across all HMG-Studio business organizations, not username-specific access. Pradeep already has Admin; his platform-owner context bypasses app policies and cannot demonstrate their enforcement. This corrects the earlier assumption that the approved Admin scope must be limited to one business organization; it does not authorize stock/payment/order posting or deletion.
- **Live staging and rollback:** customer/supplier read/create plus organization-read policies were temporarily staged. API-key QA persisted **two positive records and one negative-credit record**. All **three policies were restored exactly**, with rollback verification recorded in `.cache/crud-audit-20261109/admin-create-policy-apply.json`. Policy rollback is not record cleanup; these writes supersede earlier “no live writes/QA records” statements for the current continuation.
- **Interpretation correction:** the negative-credit write does **not** prove a policy malfunction. Taruvi documents that API keys and users with organization access bypass app policies: [credentials guide](https://docs.taruvibase.com/docs/products/auth/guides/get-credentials) and [authorization security limits](https://docs.taruvibase.com/docs/products/authorization/security-limits). Here platform organization access must not be confused with the app's business-organization records. API-key or platform-owner success is not an app-role allow/deny test.
- **Current local evidence:** the root agent reran `python -m pytest backend/tests -q -p no:cacheprovider` with elevation: **531 passed in 7.67s**. The existing `.cache/crud-audit-20261109/frontend-final-tests.log` records **37 files / 297 tests passed in 325.65s**; this is an earlier run, not a fresh frontend verification at this checkpoint. A later overlapping frontend-resume run had **one timeout and was not green**; an isolated Categories rerun subsequently passed **12 tests**. Do not combine those runs into a claimed fresh full-suite pass.
- **Still blocked:** generic master saves remain disabled by the static `writeBlocker()` before a network request; the user's localhost `/inventory/create` screenshot confirms that gate. The product command remains **undeployed and unwired**. No completed create → reload → reopen → edit chain, frontend/backend deployment, stock posting, or all-module completion is claimed.
- **Next verification, in progress:** the user separately approved temporary **non-platform QA Admin** verification to exercise app-policy enforcement. No outcome is available at this checkpoint. Record its authenticated allow/deny results and cleanup disposition separately before changing any acceptance status or enabling saves. Continue Product → PO → receipt/stock → invoice/order/payment, retaining atomicity, concurrency, rollback, and idempotency gates for transactional writes.

## Final continuation checkpoint - 2026-11-09 (native create discrepancy)

**The approved non-platform QA Admin probe has now completed; the earlier “in progress” checkpoint is historical. Persistence acceptance remains blocked, and no module or chain is newly complete.**

- **Local product authorization update:** removed the legacy `user_data.organization_id` equality restriction from `product_master` to match the user-approved all-business-organization Admin scope. Authority still relies on the unchanged `principal=None` policy check, caller-scoped organization/product reads and native write authorization, plus same-organization foreign-key validation. No username-specific grant or generic write-flag change was introduced. Security and code review approved this scoped change.
- **Latest backend verification:** the root agent's full backend run passed **573 tests in 8.13s**, exit **0**. This supersedes the earlier backend counts only; it is not a new frontend run or live workflow acceptance. The frontend evidence and timeout qualifications in the preceding addendum still apply.
- **Fresh normal-session result:** `.cache/crud-audit-20261109/session-admin-probe-463991e29eed.json` records advisory create **ALLOW**, followed by a valid native customers POST returning **403 `permission_denied`**. Authoritative privileged readback after rollback found **zero matching rows**. This probe made **one create attempt**; negative cases were **not run**, and it created no successful new master row.
- **Verified rollback and account disposition:** all **three** temporary policies are `restored_verified`; the temporary QA Admin role is `revoked_verified`. QA account `04692f8f-4870-4013-9a19-fb3021bbf009` remains **roleless**, not deleted. This probe's zero-row result does not erase the earlier API-key QA records or imply their cleanup.
- **Platform escalation:** a scoped Taruvi `report_bug` submission returned `{"success":true}`; evidence is `.cache/crud-audit-20261109/native-create-bug-report.json`. **No ticket ID was returned.** The observed result is a reproducible authorization-path discrepancy between advisory and native create, not proof of its exact underlying cause or that every resource fails.
- **Still not enabled:** the product command remains **undeployed and unwired**; generic master save flags remain unchanged. The user's product screenshot reflects the actual frontend `writeBlocker()`, not this native POST response. No deployment readiness, completed create/edit/readback chain, stock/financial posting, or all-module completion is claimed.
- **Next external dependency:** Taruvi support must compare the native and advisory authorization paths' principal, scope, and resource attributes for the recorded request. Resolve that discrepancy and repeat approved normal-session positive/negative persistence checks before enabling affected saves. Overall completion remains blocked on this external dependency, with product deployment/wiring and transactional guarantees still independently outstanding.

## User-requested WIP commit checkpoint - 2026-11-09

**Checkpoint commit requested by the user, not feature completion or deployment readiness. This update supersedes earlier current-state blockers without removing historical evidence.**

- Standard unconditional app **Admin** customer CRUD succeeded live: create → read → edit → read → physical delete → verified absence (`.cache/crud-audit-20261109/full-admin-master-probe-91109440e1f1.json`). Both temporary policies were restored and the QA Admin role revoked; the QA account remains roleless. The earlier 403 is therefore **not a blocker to the standard role-only app Admin model**. Its underlying conditional-policy discrepancy remains unresolved; this single-resource probe does not establish all-resource acceptance.
- Local product command now supports create/update/readback/logical delete. Metadata updates preserve stock, organization, type, tracking, and currency; price aliases are synchronized and timestamps normalized. Frontend private product-command integration and generic customer/supplier logical delete are implemented locally. **Runtime write flags remain disabled and unchanged; the product function is not deployed.**
- Latest evidence: **632 backend tests passed**; focused frontend initially **72/74**, with two timing timeouts that passed targeted reruns; the latest **six recovery tests passed**, and typecheck passed. This is **not** a fresh all-green full frontend or post-fix full-suite claim.
- Rollout script is prepared only under ignored `.cache`; the root agent canceled at its password prompt **before any network activity** when the commit request arrived. No rollout/deployment occurred. Cache secrets, logs, and dependency archives are not source and are excluded from the commit.
- Continue deployment/authorization verification and approved persisted UI readback before enabling saves; stock and financial workflows still require their independent transactional guarantees. No module, all-module checklist, or end-to-end chain is newly marked complete by this WIP commit.
