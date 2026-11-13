# Commerce ledger integration implementation plan

> **For agentic workers:** Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` task-by-task. Security/code review precedes final green tests; documentation follows passing tests. Preserve existing dirty work; do not commit or deploy without root coordination.

**Goal:** Make the existing product, order, purchase-order, return, stock and approvals routes functional against one Taruvi-native stock/document authority, not another QA-only screen.

**Architecture:** Extend the immutable ledger domain and existing single-append gateway. Each committed event contains the complete command, document changes and associated stock/reservation/entitlement transition. Legacy datatables are migration inputs and catalogue/reference sources, not a second writable stock or document authority after activation.

**Tech stack:** Taruvi Python functions and managed `stock_ledger_events`; existing React/Refine routes, pytest/Vitest. No external backend, SQL database or compensating writes.

**Spec:** User-approved Taruvi ledger direction in this chat; this document proposes the concrete v2 integration contract for root approval before workers implement it. Physical schema remains the DBSchemaAgent-confirmed event envelope; proposed JSON keys below are internal payload fields, not invented table columns.

## Scope and invariants

- Scope is the destination HMG Stones site's `hmg-studio` app only. Per-organization enablement is explicit server configuration, not a client flag or hardcoded QA constant. Root owns the retained-organization list; no organization/data cleanup is part of this implementation step.
- Existing v1 events remain byte-for-byte immutable and replayable. New v2 events use the same physical unique predecessor/request constraints. Version-aware projection upgrades v1 state in memory without rewriting its history.
- No order/PO header-plus-lines sequence of SDK writes. No follow-up write to legacy product stock, balances, reservations, returns or approval status.
- Authenticate caller and authorize organization/action before service credentials; resolve all referenced products/customers/suppliers/locations as caller, not service. Ordinary callers cannot insert/update/delete event rows.
- Exact retries reuse request UUID and frozen payload. A changed payload under the UUID is a conflict. An ambiguous result never permits a replacement UUID. Successful responses require native append readback and full chain projection.
- Prices, tax, shipping and totals are canonical nonnegative decimal strings with exactly two fractional digits in API/state. Parse with `Decimal`, convert to bounded integer minor units for arithmetic, reject NaN/infinity, exponent notation, excess precision and total overflow. Maximum minor units: `9007199254740991`. Never trust client totals; calculate them on the server. Currency is one uppercase three-letter code per document, no implicit exchange conversion.
- Quantities are positive integers bounded by existing `MAX_INT`; no floats, booleans or fractional quantities. Same product/bin deltas are aggregated before validating the complete command, not applied incrementally.
- **Variant boundary:** initial v2 explicitly rejects any non-null `product_variant_id` and any product with `has_variants=true`, with `VARIANT_UNSUPPORTED`. Do not silently charge parent stock or advertise variant support. Supporting variants requires a separately reviewed stock-key migration to `(product, variant, location)`; root decides whether that is required before production readiness.
- Financial approval is not payment; order approval is not shipment; PO approval is not receipt. No refund/payment/invoice side effects are inferred.

## API and exact command shapes

Retain the existing private gateway entrypoint and envelope:

```text
request: {action:"command", organization_id:UUID, command:Command}
read:    {action:"state", organization_id:UUID}
success: {ok:true, code:"STATE"|"COMMITTED", state:State,
          committed:boolean, replay:boolean, request_id:UUID|null}
failure: {ok:false, code:string, state:null, committed:false,
          replay:false, request_id:UUID|null}
```

All commands have `request_id:UUID`, `action:string`, `reason:string` (nonempty, <=2000). Exact field allowlists; reject unknown fields. Existing v1 movement/adjustment/reservation commands remain accepted under their established contract. New commands:

```text
create_order: {request_id,action,reason,document:SalesDraft}
create_purchase_order: {request_id,action,reason,document:PurchaseDraft}
amend_document: {request_id,action,reason,document_id,expected_revision,document:Draft}
approve_document: {request_id,action,reason,document_id,expected_revision,allocations:Allocation[]}
reject_document: {request_id,action,reason,document_id,expected_revision}
cancel_document: {request_id,action,reason,document_id,expected_revision}
fulfill_order: {request_id,action,reason,document_id,expected_revision,lines:Fulfillment[]}
receive_purchase_order: {request_id,action,reason,document_id,expected_revision,lines:Receipt[]}
submit_return: {request_id,action,reason,document_id,lines:ReturnLine[]}
approve_return: {request_id,action,reason,target_request_id}
reject_return: {request_id,action,reason,target_request_id}

SalesDraft: {customer_id:UUID|null,customer_name,customer_email,customer_address,
            order_date:"YYYY-MM-DD",currency,notes,tax,shipping,items:SalesLine[]}
SalesLine: {line_id:UUID,product_id:UUID,product_variant_id:null,quantity:int,unit_price:decimal}
PurchaseDraft: {supplier_id:UUID,order_date:"YYYY-MM-DD",expected_date:date|null,
                currency,notes,tax,shipping,items:PurchaseLine[]}
PurchaseLine: {line_id:UUID,product_id:UUID,product_variant_id:null,quantity:int,
               unit_cost:decimal,supplier_sku:string|null}
Allocation: {line_id:UUID,location_id:UUID,quantity:int}
Fulfillment: {line_id:UUID,location_id:UUID,quantity:int}
Receipt: {line_id:UUID,location_id:UUID,quantity:int}
ReturnLine: {entitlement_id:UUID,location_id:UUID,quantity:int,
             condition:"new"|"used"|"damaged",restock:boolean}
```

`document_id` on create equals its create `request_id`; business number is server-derived from document UUID (never count+1). Line IDs are generated once by the draft and unique within its document; backend validates UUID and rejects duplicates. No client product names/SKUs/totals: server snapshots readable catalogue names/SKUs and computes totals. For saved customer, server snapshots canonical customer details/currency; one-off customer fields remain supported. Unit prices/costs are explicit authorized Admin-entered quoted values; do not silently recalculate from a different currency or catalogue revision on retry. Event hashes bind the complete accepted draft and snapshots.

For create replay, compare frozen client command before resolving potentially changed catalogue data. Store normalized command and reference snapshots separately in the event so catalogue edits cannot change replay identity. Reference authorization must still be checked for reads/replay disclosure.

## State and lifecycle

V2 sealed event keys are exactly `version`, `organization_id`, `sequence`, `predecessor`, `actor_id`, `command`, `recorded_at`, `reference_snapshots`, `event_hash`. `recorded_at` is an adapter-generated UTC ISO timestamp. `reference_snapshots` is a server-built dictionary keyed by `products`, `customers`, `suppliers`, `locations`, each containing UUID-keyed minimal display/business attributes; never accept it from the caller. Hash the complete envelope except `event_hash`. Replay identity compares canonical normalized `command`, not timestamp or snapshots. Existing v1 envelope validation is unchanged. Initial document revision is 1; each successful document transition increments revision.

Extend verified state, preserving existing keys:

```text
State = existing organization_id,sequence,head,balances,reservations,requests,entitlements
        + documents:Record<UUID,Document>
Document = {id,kind:"sales_order"|"purchase_order",number,revision:int,
            status:"pending"|"approved"|"partially_fulfilled"|"fulfilled"|
                   "partially_received"|"received"|"rejected"|"cancelled",
            approval_status:"pending"|"approved"|"rejected",
            draft:SalesDraft|PurchaseDraft, snapshots:object,
            subtotal:decimal,total:decimal,created_by,created_at,updated_at,
            allocations:Allocation[], fulfilled:Record<lineBinKey,int>,
            received:Record<lineBinKey,int>}
EntitlementV2 = {id,document_id,line_id,product_id,quantity:int,returned:int,
                 source_fulfillment_request_id,source_location_id}
```

Timestamps are generated once by the adapter and included in the sealed event, never recalculated by projection. Exclude full events from regular response. Structured projections are validated at frontend boundaries; resolve named options from authorized catalogue records, not UUID-only UX.

- Create commits one complete pending document with all lines, no stock change; it immediately appears in its normal list and approvals queue.
- Amend only pending/rejected documents with matching revision; replace whole draft, validate references, increment revision, set pending. Approved/partially fulfilled/received documents cannot be generically edited.
- Sales approval requires allocations covering every line exactly, in same-org bins. Reserve all quantities plus approval state in the same event; reject all if any bin lacks available stock. Reject/review requires matching pending revision; repeated reviews cannot both commit.
- PO approval requires `allocations:[]`; only approval state changes. Receipt remains a separate user action.
- Fulfillment requires approved/partially fulfilled sales document, consumes its own reservations, debits bins, increments fulfillment counters and creates deterministic entitlement per fulfillment-line/bin in **one event**. It cannot consume another order's reservation. Cumulative fulfillment cannot exceed ordered quantity.
- PO receipt requires approved/partially received document; credits explicit same-org bins and increments received quantities in **one event**. Cumulative receipts cannot exceed ordered quantities. No artificial stock credit during PO approval.
- Cancel pending/rejected documents without stock effects. Cancel approved sales documents only before any fulfillment; release all own reservations in the cancellation event. Reject partially fulfilled/received cancellation until an explicit residual-cancellation contract is implemented. Do not erase history.
- Return submission validates document/entitlements and stores pending request, no stock effect. Approval rechecks cumulative entitlement across all posted returns, consumes entitlement and optionally restocks explicit authorized same-org destination in one event. Damaged+restock is rejected. Non-restock consumes entitlement without credit. Do not infer any refund.
- Register previously unseen product/location bins as zero only through an explicit authorized v2 event/reference registration, never fabricate legacy stock. PO receipt may create a validated zero bin in the same event before credit. Sales approval cannot invent a funded bin.

## Integration ownership and reuse

Backend: extend `backend/functions/stock_ledger_domain.py`, `stock_ledger.py`, `backend/scripts/bundle_stock_ledger.py` and their tests; keep native envelope/unique indexes. Generalize every QA_ORG use together (history, projection, references, auth, service policy), not only input validation. Reuse caller-scoped catalogue reads, money validation patterns, and existing append/reconcile loop.

Frontend: extend `src/services/stockLedger.ts` state/command parsing and same-ID persistence. Wire existing `commerceCreate.tsx`, `purchaseOrderWorkspace.tsx`/`purchaseOrderCreate.tsx`, and `approvals.tsx`; replace disabled submit paths and legacy-only queues, not add a parallel QA route. Existing master form/image work stays independent.

All readers: `src/pages/erp/index.tsx` document list/show/edit dispatch; `inventory.tsx` on-hand/bin views; `src/services/inventory.ts`; `operationalReports.ts`; `backend/functions/dashboard.py` and dashboard service. For enabled organizations, project ledger documents/balances exclusively. Legacy records may appear only in an explicitly historical section, never summed with ledger authority or used to authorize new returns. Server-side projection filtering/pagination must preserve a pinned head; exports use same authority. Do not hand callers the service credential.

## Implementation and proof gates

- [ ] Root confirms exact enabled organizations and variant scope. DBSchemaAgent validates unchanged envelope plus live catalogue/ref schemas; no guesses from historical cache.
- [ ] Domain red tests: full lifecycle order->approve->fulfill->return and PO->approve->receive; all lines atomic; simultaneous insufficient allocations, duplicate approval/receipt/fulfillment/return, wrong revision, changed request payload, foreign references, money rounding/overflow, unsupported variants.
- [ ] Implement v2 pure domain and append adapter; preserve v1 chain replay. Security/code review before green tests. Sandbox compilation forbids unsupported expansions/private helper names as established runtime requires.
- [ ] Wire existing routes and named options with dirty-state protection, stored request UUID, actionable correlated failures, readback before success, and real list/approval invalidation. Add integration tests proving new documents appear and workflow state changes, not just mocked buttons becoming enabled.
- [ ] Freeze legacy stock writers and record complete per-org baseline manifest: totals, physical bins, reservations, delivered/returned quantities, existing pending documents. Reconcile differences; never allocate product totals to guessed locations. Seed immutable opening event only after review; verify projection and rollback/freeze boundary before activation.
- [ ] Provision least-privileged service append/read for exact enabled orgs; verify ordinary Admin direct event create/update/delete denied and foreign-org reads denied. Existing QA test identity/baseline is not production proof.
- [ ] Live isolated lifecycle/fault/concurrency tests through the same API routes normal forms use; read back every result. Keep test classification out of production totals.
- [ ] Switch every stock/document reader listed above together; confirm no legacy dual-writes. Only then remove read-only blockers for enabled orgs. Manual UI acceptance remains user's responsibility.
- [ ] **Capacity gate:** current 200-event/1MiB full-history/output bound is QA-scale and cannot silently be removed. Implement and verify a bounded production strategy (pinned pagination, monotonic immutable checkpoints with independently validated provenance/full chain rules and safe archive retention), or explicitly publish a limited capacity and block production readiness. Never truncate a history to fit and report zero/partial balances.
- [ ] Security review -> full pytest/Vitest/typecheck -> docs/evidence -> authorized deployment. Organization cleanup last, separately backed up and dependency reviewed. No fabricated production transactions or removal of user-entered business records without classification/confirmation.

## Review focus

1. Approval reserves but does not ship; PO approval does not receive.
2. Fulfillment debit+reservation release+return entitlement are inseparable.
3. Independent requests cannot oversell or return/receive twice, including lost replies.
4. A success in the API must show in the normal list/dashboard at the same authority, not only a QA tab.
5. No claim of full production readiness with unresolved baseline, variants, capacity, permissions or legacy-reader divergence.
