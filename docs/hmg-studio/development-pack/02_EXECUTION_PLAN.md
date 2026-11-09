# End-to-End Implementation Plan

> **For agentic workers:** Use an available task-by-task execution workflow (for example `superpowers:executing-plans` if installed). Delegate only when authorized. Steps use checkboxes for progress. This plan authorizes no application changes by itself; execute after the user assigns implementation.

**Goal:** Rebuild every evidenced Inventoros module as HMG-Studio using Taruvi and Python services, with working end-to-end workflows.

**Architecture:** React/Refine frontend; native Taruvi data/storage/access controls; Python owns business commands. One shared stock ledger and one shared authorization boundary; no Laravel/PHP runtime.

**Tech stack:** Existing TypeScript/React/Vite/Refine/Tailwind project conventions; Python backend services; Taruvi native platform. Confirm installed versions and test runners before changing dependencies.

**Spec:** [Module index](00_START_HERE.md), [architecture](01_ARCHITECTURE_TARUVI_PYTHON.md), exact evidence inside each module.

## Global constraints

- Scope includes every screenshot module AND nested/admin/portal/integration surface inventoried in the source.
- Inspect existing target code before writing; preserve HMG Stones and unrelated user work.
- Confirm exact app-scoped schema before creating queries, fields or tables. No duplicate schema or parallel ledger implementations.
- No credentials in source/artifacts. Use confirmed native policies and parameterized/provider-native access. Authorization must hold under direct API bypass.
- No implementation, database changes, provider sends, paid labels, destructive resets, commits or deployment are authorized by this documentation task.

## Review focus and test ownership

1. Two near-identical records in different organizations: modules 31/32 and each module's direct backend denial tests.
2. Duplicate/stale requests after network failure: modules 12/15/21/23/24/25 and ledger/transaction tests.
3. Blank/null/zero and inherited defaults: modules 11/24/33/41 with exact source validator/default cases.
4. Changed permissions before asynchronous execution: modules 27/28/34/37 plus recipient/owner reauthorization tests.
5. Partial provider/storage failures: modules 35/36/37 with durable committed state and honest delivery/error evidence.

## Phase 0 — Discovery, exact target file map and safety gates

- [ ] Read destination AGENTS and inspect current frontend, providers, Python service folders, package manifests and deployment configuration. Do not print secrets.
- [ ] Produce a per-module exact create/modify/test file map based on existing owners; names below identify logical modules, not invented filesystem paths.
- [ ] Use explicitly `hmg-studio`-scoped read-only MCP to inventory datatables, fields, policies, storage and callable capabilities. Record proof limits.
- [ ] Confirm Python hosting, identity validation, transaction/concurrency and background-job capabilities; fill the schema/service ledger. A material missing capability blocks affected mutations, not unrelated discovery/UI contract work.
- [ ] Establish approved test organization/records and backup/recovery scope before any live verification writes. Existing records must not be repurposed destructively.

## Phase 1 — Shared authority and reusable foundations

- [ ] Establish identity/organization/access policies (31–33), shared shell/navigation/error states, typed service adapter and native storage (36).
- [ ] Define the shared Python command boundary, stock/money precision, document identities, idempotency and activity event contracts. Write failing authorization/transaction contract tests first.
- [ ] Build the minimum roles/users/settings flows needed to exercise authorized and denied paths. Finish their remaining views in Phase 6; do not postpone authorization until then.

## Phase 2 — Catalog and purchasing-to-stock vertical slice

- [ ] Categories (18), warehouses (20), locations (19), suppliers (16), inventory/products (11), stock view (22), reservations service (26).
- [ ] Approval policy/decision core (17), purchase orders and partial/final receipts (15), replenishment (41), adjustments (21).
- [ ] Verify supplier → product/variant → PO → approval → receipt → bin/stock/history/readback. Include failure/retry and negative authorization cases before continuing.

## Phase 3 — Order-to-cash and return vertical slice

- [ ] Customers (13), orders/payment/document flows (12), shipping (35), returns (14), remaining order approvals (17).
- [ ] Verify customer → order → source-accurate stock effect → approval → partial/full shipment → payment/receivables → return receipt → separately authorized refund.
- [ ] Verify no duplicate stock deduction at shipping and no automatic refund from return completion. External provider proof is separate from local command proof.

## Phase 4 — Warehouse control and manufacturing

- [ ] Transfers (23), full reservation UI/release behavior (26), stock audits/cycle schedules (24), work orders/BOM execution (25).
- [ ] Verify prepare → dispatch → receive with reservations/in-transit; revisioned count → review/recount → posting; components → actual output completion. Test rollback and stale writes.

## Phase 5 — Operational visibility and bulk processing

- [ ] Dashboard (10), reports/builders/schedules (28), import/export (27), activity log (29), notifications (34).
- [ ] Verify values against operations from Phases 2–4; test historical imports, row-level partial failures, exported filters, currencies and permission changes before queued delivery.

## Phase 6 — Complete administration, external access and portal

- [ ] Finish all users/roles/auth/account/org/email views (30–33); tokens/webhooks/API parity (37); customer portal (38).
- [ ] Implement approved extension/tax-document equivalents (39) and operations/provisioning/update/backup equivalents (40). Do not declare PHP plugin compatibility or full restore support without proof.
- [ ] Run full role/customer/organization denial matrix, mobile/accessibility states and authorized provider integration verification.

## Per-task cycle and exit gates

Each module uses: audit/reuse → exact schema/interface/file map → failing tests → Python/UI implementation → security and duplication review → tests → direct browser/readback → documentation/ledger. Record actual commands from the current project, not guessed commands. Stop shipping the affected workflow if critical review findings or transaction tests fail.

The scope is not complete until every page row and required field/action/transition in the module evidence has a target mapping and passed acceptance, or a clearly unresolved blocker. Approved native-platform replacements are recorded explicitly. A blocker is not a completed module.
