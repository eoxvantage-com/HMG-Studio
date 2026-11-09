# Complete workflow atlas: HMG-Studio verification

**Checked:** 7 November 2026. **Result: not all workflows are added or working.**

The 24 diagrams are the acceptance contract, not a description of the current target's capabilities. HMG-Studio has useful live read surfaces, bounded exports/reports, native identity integration and narrow commands. Its full stock/money/lifecycle workflows are not implemented. A seeded delivered order or received PO is historical data, not evidence that its transitions executed.

## Source and method

- User-supplied atlas: `C:\Users\pradeepk\AppData\Local\Temp\Inventoros_E2E_Audit\Inventoros_Complete_Workflow_Flowcharts.md`.
- SHA256: `4e8d6abd8828992c993130d84b5d402fe7985c25906ab8c682ef974470ff94be`.
- Reference source revision: `1f78e818d9aee025020fe7489955f4f0c448c53a`.
- All F01-F24 and the cross-workflow stock/money rules were read. Existing implementation owners, tests, manifest and previous evidence were inspected; no Inventoros code was copied.
- The detailed [32-module specification](development-pack/00_START_HERE.md) and [E01-E12 acceptance journeys](development-pack/04_END_TO_END_ACCEPTANCE.md) remain authoritative for individual fields and failure cases.
- **No complete F01-F24 workflow or E01-E12 journey is accepted end-to-end by this audit.** This does not mean none of the individual features work.

## Shared implementation owners

Paths below are relative to the repository root.

| Key | Existing implementation / tests |
|---|---|
| Registry | `src/erp/modules.ts`, `src/App.tsx`, `src/App.test.tsx` |
| Generic | `src/pages/erp/index.tsx`, `index.test.tsx`; guarded forms, lists, details, paginated lazy relations |
| Presentation | `src/components/ErpBusinessOverview.tsx`, `src/services/erpPresentation.ts` and matching tests |
| Inventory | `src/pages/erp/inventory.tsx`, `src/services/inventory.ts` and matching tests |
| Write gate | `src/services/erp.ts`, `backend/schema/erp-manifest.json`; action-specific backend verification required |
| Documents | `src/components/RecordExportActions.tsx`, `src/services/recordExport.ts` and matching tests |
| Reports | `src/pages/erp/reports.tsx`, `src/services/operationalReports.ts` and matching tests |
| Dashboard | `src/pages/home/index.tsx`, `src/services/dashboard.ts`, `src/services/dashboardCurrency.ts`, `backend/functions/dashboard.py`; Home/FX/Python tests |
| Native identity | `src/pages/erp/platform.tsx`, `platform.test.tsx`, existing user/app providers |

## All 24 flows: implemented versus missing

**Partial** means only the named portions are implemented. **Blocked** means the core operational effects require both implementation and a verified native persistence/authorization contract. Neither label is a passing E2E result.

| Flow | Current implementation | Missing behavior / next acceptance gate | State |
|---|---|---|---|
| **F01 Whole application** | Registry, protected shell, Generic/Presentation/Inventory and existing reads | Execute connected purchase-to-stock, order-to-cash and return-to-refund journeys; reconcile stock, ledger and financial facts. See E01-E12. | Partial |
| **F02 Login, organization, access** | Taruvi redirect login, authenticated routes, native identity; scoped read evidence | Organization/warehouse selection and propagation; recovery/2FA account-state tests; foreign organization/warehouse and revoked-session denial at every operation. | Partial |
| **F03 Master data** | Customer/supplier/location/warehouse lists and details; guarded master forms; dedicated Categories owner and narrow catalog command | Ordinary-user authorized CRUD, uniqueness/defaults, immutable ownership, reference-aware deletion, matching committed readback. Existing category command is not blanket CRUD proof. | Partial / blocked |
| **F04 Products and tracking** | Inventory search/details, private images, barcode/QR/print, lazy variants/BOM/supplier/tracking reads | Create with opening ledger; preserve variant IDs on edit; reconcile omitted variants; supplier/media mutations; batch/serial authority and tracking rules. Metadata edits must never overwrite stock. | Partial / blocked |
| **F05 Shared stock boundary** | Persisted stock/location reads and explicitly page-scoped chart; tables exist | One atomic product/variant/bin/tracking/ledger transaction; availability minus active holds; variant double-count prevention; concurrent competing stock requests and rollback tests. | Blocked |
| **F06 Replenishment** | Dashboard low-stock projection; stored warehouse thresholds and policy data | Inherited overrides, variant target/minimum/order quantities, outstanding-PO reconciliation, supplier grouping and draft-PO creation. Draft is not received stock. | Partial / blocked |
| **F07 Purchasing and receipt** | PO header/line/price-history read surfaces | Draft/edit, approval gate, send/cancel; partial/final receipt capped by remaining quantities; atomic bin/stock/ledger/price effects and duplicate-receipt protection. Email delivery remains separate. | Blocked |
| **F08 Sales orders** | Order header/lines and independent stored order/payment/approval fields | Authoritative discount/tax totals; ordinary creation deducts stock even before approval; edit reconciliation; rejection/cancellation restores eligible stock; shipped cancellation rejected. | Blocked |
| **F09 Payments and documents** | Payment history, currency/type/void-aware reporting, branded printable snapshots | Authorized receipt/refund/void ledger and order balance recalculation; refundable cap; cancelled receipt denial; immutable invoice issuance and actual email outcomes. Printed snapshots are not issued invoices or bank transfers. | Blocked |
| **F10 Shipping** | Shipment and shipment-item read surfaces | Manual shipment creation, remaining-line checks, partial/full coverage synchronization, carrier rates, explicit label purchase, label/dispatch/delivery distinction; no second sales stock deduction. | Blocked |
| **F11 Returns and refunds** | Return/line details and persisted status fields | Shipped/previous-claim eligibility; request/approve/reject; once-only receipt with selected restock; completion without automatic refund; separately authorized refund. Exchange must not imply replacement order. | Blocked |
| **F12 Approvals** | `src/pages/erp/approvals.tsx`: four correctly filtered pending queues and tests | My requests; assigned reviewer/organization/warehouse/self-approval checks; reject-note validation; atomic owning-workflow consequences. Approving PO/transfer must not receive/dispatch it automatically. | Partial / blocked |
| **F13 Stock adjustments** | Movement reads; `backend/functions/stock_adjustment_preview.py` and focused tests | Wire narrow read-only preview to UI; implement request/approval/posting only after F05. Signed nonzero delta versus variant recount semantics, holds and tracked stock need separate tests. Preview authorizes no commit. | Partial / blocked |
| **F14 Reservations** | Reservation list/details and recorded status | Owning-workflow creation, expiry, release and consumption; shared available-stock calculation; supported tracking combinations, serial quantity one, retained history. No generic create screen is required by source. | Blocked |
| **F15 Transfers** | Transfer header/items and recorded states | Prepare/hold; dispatch/source deduction; in-transit; destination-authorized receipt; same-warehouse direct completion; cancel before dispatch/reverse after receipt. Verify quantity conservation and retry safety. | Blocked |
| **F16 Stock audits** | Audit/item/count/review history reads | Start snapshot; organization/audit-scoped local drafts; revision conflicts; count/recount/review; explicit uncounted handling; once-only counted-minus-snapshot posting, not overwrite of current stock. | Blocked |
| **F17 Cycle counts** | `cycle_count_schedules` schema | Dedicated controls; due/manual execution, prior-open-audit/no-eligible suppression, never/least-recently-counted selection; manual run leaves regular schedule unchanged. Scheduler execution proof required. | Blocked |
| **F18 Assembly work orders** | Work order, BOM, allocation/output read surfaces | BOM expansion; start without hold/consumption; actual-output tracking validation; atomic component consumption/output receipt; below-plan output still closes; guarded cancellation/deletion. | Blocked |
| **F19 Import/export** | Formula-safe visible-page/record CSV and HMG print; complete bounded result exports for four reports | End-user product/order/native-user import templates and row outcomes; historical import suppresses stock/create hooks; full-filter queued exports and owner downloads. Admin fixture scripts are not end-user imports. | Partial |
| **F20 Dashboard and reports** | Caller-visible INR dashboard; indicative display FX; four bounded report generators, scoped CSV/print | Warehouse scope; remaining built-ins; saved builder/sharing; schedule and recipient reauthorization; real job/delivery evidence. Missing costs/values must not become invented zeros. | Partial |
| **F21 Customer portal** | Customer contacts read surface only | Separate customer-scoped session, invitation/recovery, own orders/documents and eligible return requests, staff follow-through; deny cross-customer access. No source portal sales checkout exists. | Blocked |
| **F22 Users, settings, activity** | Native username-based HMG directory/role reads; real team accounts; account date/time/timezone command; owner-scoped inbox, bell and activity reads | In-app native user/role administration, organization settings, notification mutations, event-generated activity/notifications; escalation/revocation/ownership tests. No parallel identity tables. | Partial |
| **F23 Integrations/storage/tax** | Private product-image reads; webhook/plugin configuration data; bounded approved media maintenance | General upload/file management; tokens; validated webhook delivery/retry; approved native plugin equivalents; immutable tax invoices. Configuration and metadata are not provider execution. | Partial / blocked |
| **F24 Reset and recovery** | Reset-run metadata and scoped maintenance/provisioning scripts | Reset preview/signature/password/confirmation/queue with locked recheck and write-off history; verified native backup/restore/update equivalents. Never execute reset merely to pass this audit. | Blocked |

## Blocking foundations — not cosmetic warnings

Fresh app-scoped MCP metadata confirms **six active private synchronous APP functions**: dashboard, stock preview, categories, account preferences and two profile validators. No deployed function owns a stock/payment/lifecycle posting command. Relevant transactional resources retain create/update/delete denials. The 25 exposed tools contain no documented transaction/CAS/locking primitive; this does **not** prove such a capability is absent inside the platform. See [live preflight](evidence/workflow-atlas-live-preflight.json).

1. **Native write authorization mismatch.** Previous ordinary customer-create advisory allowed the payload, but native POST denied it with 403 and exact-ID readback showed no row. Existing detailed [provider escalation](evidence/native-create-provider-escalation.md) records already-tested hypotheses. Do not repeat policy widening or put administrator credentials in the frontend. Native update/delete policies and generic verification flags also remain restrictive.
2. **Original/proposed-row isolation.** A valid new organization value must not authorize moving an existing foreign record. Verify original ownership and immutable scope at the actual write boundary, not only in form validation.
3. **Atomic persistence contract.** A Python function making sequential HTTP writes is not a database transaction. Before F05 and consumers, prove supported transaction/locking or equivalent conditional-write design, rollback, competing-request behavior and reconciliation after commit-timeout. An idempotency key must be durably and atomically bound to the business effect, not stored afterward.
4. **Direct-write bypass.** Stock, balances, approval and lifecycle fields cannot remain independently writable outside their authorized command. Verify normal actors, forbidden actors and foreign nested IDs on the native path.
5. **Operational providers.** Carrier, email, customer portal, report schedules and recovery require their own contracts and execution evidence. They cannot be accepted from row creation or a configured URL.

## Current native SDK and authorization findings

The native SDK already exposes record CRUD; missing end-to-end business commands are not evidence that CRUD support must be rebuilt. Reuse the existing providers and verify the native operation's authorization/persistence contract. The [database quickstart](https://test-docs.taruvi.cloud/docs/products/database/quickstart) documents record operations; the [request lifecycle](https://test-docs.taruvi.cloud/docs/concepts/request-lifecycle) separates authentication, validation and authorization.

Accounts with organization access that can use Console bypass record access policies; API keys also bypass them. This applies even when an organization-access account uses its session rather than an API key. Therefore a successful write using existing **Pradeep admin** credentials cannot establish that John/Kevin/Peeter or another ordinary team role is authorized. Use the existing Pradeep account for the administrative work the user requested, but keep ordinary-role positive/negative proof separate; **do not create new users in this follow-up**. Never place an administrative credential in frontend code to make a denied operation succeed. These boundaries are explicit in [database security and limits](https://test-docs.taruvi.cloud/docs/products/database/security-limits) and [authorization testing](https://test-docs.taruvi.cloud/docs/products/database/operations/authorization-testing).

`_allowed_actions` is a UI hint, not a write authorization receipt: native writes are checked again. An advisory ALLOW or visible Edit button cannot replace an actual ordinary-role write/readback and denial tests. The [fresh customer role-name check](evidence/workflow-atlas-customer-role-name-check.json) confirms the policy already names **HMG Synthetic Operator**, matching live role 1156; a role-name-versus-slug mismatch does not explain the earlier customer POST 403. This was read-only metadata inspection, not a new write probe or policy change.

## Correct stock and money timing to preserve

- Opening product quantity creates an opening movement; ordinary metadata edits do not change stock.
- PO receipt increases stock. Ordinary sales creation decreases stock, including pending approval; shipping does not deduct again.
- Eligible sales rejection/cancellation restores consumed stock, but does not automatically refund money.
- Reservation/transfer preparation affects available stock only; transfer dispatch reduces source and receipt increases destination.
- Return receipt restocks only eligible selected lines; return completion creates no automatic payment refund.
- Work order start does not consume/reserve; completion consumes components and receives actual output atomically. Underproduction still closes the job.
- Audit completion posts counted-minus-snapshot discrepancies, not a forced live-balance replacement.
- Payment/refund/void affects the financial ledger, not stock; historical order imports have no stock/create-hook effects.

## Ordered implementation and acceptance milestones

Do not build disconnected action buttons across all modules. Complete each vertical journey with evidence before opening its next consumer.

| Priority | Deliverable / owner | Must pass before acceptance |
|---|---|---|
| **P0** | Native platform authorization diagnostic, using the existing provider escalation | Matching deployed-version trace of principal, role, scope, policy hash and original/proposed attributes; ordinary create/readback and foreign/forged/revoked denial; action-specific edit/delete proof |
| **P0** | Shared stock command persistence contract (F05) | Supported transaction primitive; ordered competing updates; injected failures at each effect; durable replay/timeout reconciliation; direct-write denial |
| **P1** | Master/product setup (F03-F04, E01) | Valid forms, exact persisted values, relationship ownership, stable variants, opening ledger, image access and deletion dependencies |
| **P1** | Purchase-to-stock (F06-F07/F12, E02) | Draft/approval/send; partial then final receipt; over-receive and replay rejection; stock/bin/ledger/price reconciliation |
| **P2** | Order-to-cash and returns (F08-F12, E03-E04) | Authoritative totals; correct stock timing; partial/full shipping; receipt/refund/void reconciliation; eligible returns with selected restock; separate refund |
| **P3** | Internal stock operations (F13-F18, E05-E07) | Adjustment approval, hold expiry/release, transfer transit/receipt, revisioned audits, scheduler guards, atomic assembly and tracking |
| **P4** | Import/report/admin/integrations (F19-F24, E08-E12) | Row outcomes, historical suppression, scoped full exports, recipient reauthorization, customer isolation, native role revocation, provider outcomes and separately authorized recovery tests |

Each implementation should extend the owners above. Use existing notifications, authenticated providers and exact live-confirmed fields. No new replacement CRUD framework, identity schema or stock-writing frontend cascade is needed.

## E01-E12 crosswalk

| Acceptance journey | Atlas coverage | Current E2E result |
|---|---|---|
| E01 Setup and product | F02-F04, F22-F23 | Not accepted; reads/media/native identity subsets only |
| E02 Purchase receipt | F05-F07, F12 | Not executable end-to-end |
| E03 Order to cash | F05, F08-F10, F12 | Not executable end-to-end |
| E04 Return to refund | F09, F11 | Not executable end-to-end |
| E05 Warehouse transfer | F05, F12, F14-F15 | Not executable end-to-end |
| E06 Count to correction | F05, F16-F17 | Not executable end-to-end |
| E07 Components to assembly | F04-F05, F18 | Not executable end-to-end |
| E08 Reporting/delivery | F20, F22-F23 | Four bounded report generators verified separately; builder/schedules missing |
| E09 Import/export | F19 | Current exports only; import chain missing |
| E10 Customer self-service | F21 | Not implemented as a separate customer-authorized surface |
| E11 External provider actions | F09-F10, F23 | Not accepted; no sent email, carrier label or issued invoice proof |
| E12 Admin lifecycle, revocation and recovery | F02, F22-F24 | Native identity subsets only; role revocation must invalidate background-job/document access; lifecycle/recovery chain not accepted |

## Evidence boundaries

- Latest pre-audit deployed release: [currency/user release](CURRENCY_USERS_WRITE_FOLLOWUP.md), [deployment checks](evidence/currency-users-deployment.json). HTTP asset equality is not browser workflow execution.
- Existing successful ordinary read evidence: [four report generators](evidence/operational-reports-live.json), [HMG native team](evidence/hmg-team-ordinary-verification.json), [catalogue category readback](evidence/catalogue-category-ordinary-readback.json).
- Existing local tests: [251-test frontend checkpoint](evidence/currency-users-frontend-verification.json). New audit results are recorded separately; test counts do not imply missing transitions have been implemented.
- Fresh atlas verification and limitations: [audit evidence](evidence/workflow-atlas-verification.json). Live metadata, if obtained, is explicitly administrator/read-only, not ordinary-user CRUD proof.
- `logs/frontend.ndjson` was absent during this audit. No new browser acceptance or computer-control testing is claimed.

## Diagnosed and corrected during this check

The dashboard previously treated missing amounts as zero, assumed missing row currencies/activity flags, and substituted legacy `price` for missing `selling_price`. The existing Python projection now rejects those unknown facts through its existing `DATA_UNAVAILABLE` response, rather than reporting fabricated totals. Explicit zero remains valid. Known inactive catalogue references and cancelled orders are excluded before selected financial facts are required. No stock, prices, accounting history, schema, role or policy was changed by this correction.

The [fresh ordinary HMG-user data check](evidence/workflow-atlas-normal-counts.json) found 278 products, including 263 inactive website references, and 19 orders in the authorized demonstration organization. All 15 active INR products and all 19 non-cancelled INR orders have the required valuation/receivable fields; no legacy-price fallback was needed. [Before-update execution](evidence/workflow-dashboard-before.json) returned the current projection as that same ordinary user, not an administrator.

Independent review preceded the observed RED and final GREEN: 115 dashboard tests, 459 full backend tests, 251 frontend tests across 32 files and both TypeScript configurations passed. [Exact regression evidence](evidence/workflow-atlas-regressions.json).

The existing private synchronous APP function `hmg-dashboard-v1` was updated to **version 3**. Its [original deployment journal](evidence/workflow-atlas-dashboard-deploy.json) remains intact with `verified: false` because strict byte readback differed. The separate [read-only reconciliation](evidence/workflow-atlas-dashboard-reconciliation.json) found exactly one removed terminal LF (6,625 submitted versus 6,624 live bytes), identical Python AST and matching metadata; policy hashes remained unchanged. This is reconciled semantic equality, **not byte equality** or a replayed update.

Ordinary `hmg.john` [before](evidence/workflow-dashboard-before.json) and [after](evidence/workflow-dashboard-after.json) executions both returned HTTP 200 with the same recorded projection hash and metrics (15 active INR products, 19 orders, INR 3,430,050.00 indicative stock value and INR 217,525.00 receivables). No admin fallback was used. [Negative checks](evidence/workflow-dashboard-negative-checks.json) passed: unauthenticated HTTP 403; malformed currency and forged organization parameters rejected with `VALIDATION_ERROR`. No unknown-value data was inserted into the live business tables merely to test failure; those adversarial cases remain local regression proof.

This is the only production correction delivered by the audit. **All 24 atlas flows are accounted for; zero full workflows/E01-E12 journeys are accepted end-to-end.** Frontend deployment is unchanged and browser/visual acceptance is unperformed. No business data, policies, roles or stock/money workflow behavior was changed by the dashboard correction.
