# Schema and Python Service Contract Ledger

## Status and authority

**No target datatable names, deployed Python endpoints, or transaction capability are confirmed by this pack.** Source names in module evidence describe Inventoros only. Use MCP read-only discovery first, then propose additive changes and obtain implementation authority. Do not create a second organization/user/product table when an existing owner already satisfies the contract.

## Required capability record

| Capability | Evidence to record | Current status |
|---|---|---|
| Exact application identity | Explicit hmg-studio app/tenant scope and connector identity | Pending |
| Python runtime/hosting | Supported version/dependencies/secrets/network/deployment/health | Pending |
| Native identity | Verified token/session validation, membership and role/policy contract | Pending |
| Datatables | Actual names/IDs, columns/types/nullability/defaults, constraints/indexes, pagination | Pending |
| Access enforcement | Native tenant/row/object policy and direct-client bypass tests | Pending |
| Atomic command writes | Transaction/locking/conditional revision semantics and rollback proof | Pending |
| Idempotency | Unique effect identity and same-request retry semantics | Pending |
| Storage | Buckets/purposes/object IDs/access/upload/download/limits | Pending |
| Background tasks | Durable jobs/schedules/retries/deduplication/monitoring | Pending |

## Field/relationship mapping template — expand for every source entity

| Module / source entity | Source field | UI vs persisted vs derived | Exact target table/column | Type/default/nullability | Uniqueness / relation / tenant keys | Policy | Migration/reuse evidence |
|---|---|---|---|---|---|---|---|
| Populate from module evidence | Exact source key | Explicit | Confirmed only | Exact | Explicit | Explicit | Pending |

Arrays and nested form aliases must not become guessed columns. Separate UI-only selection, pagination, confirmation flags and filters from persisted records. Preserve parent/variant IDs, owner references, snapshot documents and immutable history. Derive actor, tenant, numbers, totals and lifecycle timestamps server-side according to verified source behavior.

## Python command/query mapping template

| Source action | Existing target owner / exact file | Endpoint and request schema | Response / errors | Permission / tenant checks | Transaction writes | Idempotency / revision | Tests |
|---|---|---|---|---|---|---|---|
| Fill per action | Inspect first | Confirm then define | Field validation, denied, missing, conflict, provider failure | Server-authoritative | All effects or no effects | Explicit when applicable | Exact test names |

Use logical query/command separation: ordinary detail/list queries may use a verified scoped provider; compound stock/payment transitions must use the shared Python business command boundary. Do not expose writable totals or raw stock updates through a generic Refine CRUD mutation. The final transport paths and Python signatures must be chosen from the current target code, not the old Laravel routes.

## Required shared service ownership

- Identity/permission context and tenant-safe record lookup.
- Stock balances/reservations/movement ledger and atomic posting.
- Order/PO/return/work-order state machines and document numbering.
- Payment/refund/void ledger and decimal totals.
- Storage object validation/ownership and generated document snapshots.
- Report projections/import result ownership/job status.
- Post-commit events, notifications and outbound delivery attempts.

These are responsibilities, not a mandate to create seven independent microservices. Prefer a cohesive existing Python application with clear owners unless deployment requirements justify separation. Never duplicate the same calculation or transaction logic in browser, Python and native function wrappers.
