# Taruvi atomic stock ledger implementation plan

> **For agentic workers:** Use superpowers:subagent-driven-development task-by-task, with security review before validation and final review before deployment.

**Goal:** Native Taruvi Python functions provide atomic stock movements, returns and approval posting without cross-request stock mutations or duplicate effects.

**Architecture:** One immutable event contains every line and associated workflow transition. Database-enforced unique organization/predecessor and organization/request keys serialize appends and prevent duplicate requests. Stock and posted statuses are projections of a verified chain, not independent writes to legacy balances.

**Tech stack:** Existing Taruvi managed datatables and Python functions; existing React/Refine frontend; pytest and Vitest.

**Spec:** User-approved ledger design in this chat, 2026-11-11. No external database/backend, no compensation-as-atomicity, preserve business organizations and existing data.

## Constraints and acceptance gates

- No production cutover until live unique-conflict, append-only permission, replay and concurrent posting checks pass with isolated QA data.
- A caller must not forge, modify or delete authoritative events. Injected SDK retains caller identity; do not assume functions elevate table permissions. Prove a supported function-only boundary or use a separate least-privileged native service identity whose credential remains in sensitive Taruvi Secrets; never reauthenticate the injected SDK.
- Read authorization is checked with the actual caller before using any service identity. No cross-organization data leakage.
- Fail closed on incomplete history, invalid chain, ambiguous writes, missing baselines, unverified reference types, over-returns or insufficient available stock.
- Retry the same request identifier after uncertainty. Different payload under the same request identifier is a conflict.
- All stock readers must use the same ledger projection after cutover; legacy tables are historical input only. Do not refresh authoritative balances through follow-up writes.
- Reservations and return entitlement must be represented in the same authority; independent mutable legacy rows cannot authorize posting after cutover.
- Posted records are reversed with an explicit linked event, never edited/deleted.
- Preserve dirty work and both app boundaries. No source Insurance writes, blanket Stones deployment, commits or pushes. User owns browser acceptance.

## Pipeline

- [x] CodeAuditor reuse map: existing return workspace, approval queues, inventory reader, dashboard, stock preview, manifest and command envelopes.
- [x] DBSchemaAgent confirms live scope, exact schemas, unique enforcement and native authorization options; root provisions only reviewed isolated resources.
- [x] Domain implementation: deterministic chain projection, immutable request/review transitions, movement/return validation, one-event atomic effect, duplicate and conflict behavior. Red tests before code.
- [x] Taruvi adapter: bounded complete reads, native caller authorization, one create, readback reconciliation; no legacy balance mutations. Live concurrent create and denied bypass tests.
- [ ] Controlled baseline and cutover: immutable opening balances/reservations/return entitlement, freeze legacy writers, reject inconsistent sources, verify before activation.
- [ ] Frontend integration: extend existing stock/returns/approval screens and shared stock projections; preserve pending request IDs through retries. Readiness is per-organization, not a global boolean.
- [x] SecurityAuditor and CodeReviewer review; TestEngineer runs pytest, Vitest, typecheck, build and fault/concurrency acceptance. Fix findings before release.
- [x] DocWriter records evidence after passing tests; deploy verified destination artifact only and provide manual test steps.

## Review focus

1. Two commands spend the same available stock: only one valid successor commits; loser reloads/revalidates.
2. Response lost after commit: readback returns original result, no second stock change.
3. Simultaneous duplicate request on different stale heads: unique request key prevents double effects.
4. Return approval reserves/consumes entitlement on the same chain; no partial restock or excess cumulative return.
5. Unauthorized direct inserts/updates/deletes and cross-org reads are denied; administrator platform control is not evidence of ordinary role enforcement.

## Execution notes

- The legacy skill path is a Git symlink stored as a Windows pointer; resolved `.agents/skills/taruvi-app-developer` is the installed repository skill.
- Opening migration must not infer physical bin allocations from product totals, or count existing historical returns twice.
- If a release gate fails, retain the implementation and exact failing evidence, but do not label workflows test-ready or replace existing authority.


## QA delivery checkpoint — 2026-11-11

Completed checks above refer to the isolated QA implementation and deployment only. Controlled baseline exists for the QA organization; the combined baseline/cutover task remains unchecked because production writer freeze, source reconciliation and activation are not performed. Frontend integration remains unchecked as a full task: the existing Approvals workspace has a Stock ledger (QA) tab and same-ID retry support, but legacy stock/returns/global readers are not cut over.

Final validation: 840 backend and 356 frontend tests (39 files), typecheck/build passed. Six deployed assets verified for Studio build `e043d171-b88a-40f8-8d32-1c950986d9d6`. Live acceptance: 16 checks, 12 events, sequence 11. See `docs/hmg-studio/STOCK_LEDGER_QA.md` for scope, manual steps, evidence limitations and remaining gates. Browser acceptance is outstanding; no production enablement or commit/push.
