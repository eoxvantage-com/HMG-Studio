# End-to-End Acceptance and Evidence

All tests in this pack are **planned, not executed**. Application changes and test records require the implementation task's authorization. This document does not approve mutation of existing reference records.

## Required scenario evidence format

Record scenario ID, module, build/revision, environment/app scope, role, approved fixture IDs, preconditions, steps, expected result, actual readback, relevant history/ledger entries, screenshots or traces, test command/result, cleanup disposition and remaining limitations. Never include passwords, tokens or full secrets. A toast is not readback. A successful schema call is not policy/write proof.

## Cross-module acceptance chains

| ID | Chain | Required proof |
|---|---|---|
| E01 | Role/organization → warehouse/location → supplier → category → product/variant → image | Exact form/default/validation persistence; stable identities; scoped lookup; authorized object read |
| E02 | PO → approval → partial receipt → final receipt | Capped line receipts, atomic stock/bin/ledger/price effects and retry protection |
| E03 | Customer → order → approval → shipment → payment | Source-accurate stock timing; no shipment rededuction; payment balance and receivable reconciliation |
| E04 | Shipped order → return → receipt → complete → separate refund | Eligible quantity cap; selected restock only; separate payment effect; repeated actions cannot duplicate |
| E05 | Transfer → prepare → dispatch → receive | Holds, available, source decrement, in-transit, destination increment and actor authority agree |
| E06 | Audit draft → start → count → stale revision → review/recount → complete | Snapshot/revision semantics, retained offline draft, review authority and once-only discrepancy posting |
| E07 | Assembly/BOM → work order → actual output → complete | Atomic component/output changes; source underproduction behavior; failure leaves no partial stock |
| E08 | Operations → dashboard/report → saved report → export/schedule | Totals/currency/filter/source permissions; viewer and recipient access rechecked |
| E09 | Product/order/user import → partial result → export | Exact headers/row validation/result ownership; historical order mode has no stock or create-hook effects |
| E10 | Customer invitation → portal login → own order → return request | Cross-customer/organization denial; no unauthorized order creation; pending request no stock movement |
| E11 | Provider configuration → document/email/shipment/webhook action | Secret-safe configuration; committed operation vs actual provider success separated; retry/delivery evidence |
| E12 | Admin lifecycle → role revocation → background job/document access | Revocation enforced on backend; audit continuity; safe approved native equivalents for source operations |

## Permission, failure and concurrency matrix

For each applicable module: authorized actor; read-only actor; actor without permission; foreign organization; wrong warehouse/customer; revoked/stale session; missing/foreign nested ID; malformed/duplicate input; stale revision; repeated same request; simultaneous competing request; provider unavailable; storage failure; network timeout after commit; retry/readback. Assert both response and absence/presence of effects, not only HTTP status.

Do not claim full transactional correctness by testing two browser clicks alone. Use the actual target persistence primitive to test competing writes and injected failure before/after each material effect. Record unsupported cases as blockers.

## Visual and accessibility acceptance

Recreate the screenshot's grouped navigation with all required modules, appropriate permissions and responsive behavior. Audit each page's heading, actions, tables, filter state, nested forms, error location, loading/empty states, keyboard focus and usable narrow layouts. Equivalent styling is permitted only without losing source interactions; static screenshot similarity does not replace functional parity.

## Completion rule

Every module-specific checkbox, page row and field/action/state contract needs evidence. Local tests, backend integration, browser readback, provider operations and deployment/recovery are distinct proof layers. Mark unavailable layers honestly; do not replace them with assumptions. A native-platform replacement must name the old behavior, chosen equivalent, approval and validation evidence.
