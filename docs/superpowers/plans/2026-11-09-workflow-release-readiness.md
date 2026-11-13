# HMG-Studio workflow and release readiness

> **For agentic workers:** Use superpowers:subagent-driven-development. Preserve existing source and run review before final verification.

**Goal:** Complete supported Taruvi workflows and repair reproducible release/test defects without claiming unsafe posting is production-ready.

**Architecture:** Existing React/Refine UI calls private caller-scoped Python functions. Continue using insurance / hmg-studio and existing schemas. Stock/return/approval commands must meet the existing atomicity contract; separate SDK calls are not a transaction.

**Tech Stack:** Existing TypeScript, React, Vite, Refine, Taruvi Python functions, Vitest and pytest.

**Spec:** `docs/hmg-studio/development-pack/modules/{14_returns,17_approvals,21_stock_adjustments}.md`, `docs/hmg-studio/PLATFORM_DECISION.md`.

## Constraints
- User will test the UI manually; no browser automation.
- Preserve verified product/customer/supplier commands and standard app Admin scope.
- No real stock, payment or operational records used for fault injection.
- No new database, invented SDK transaction API, fake approval status patch or silently weakened consistency.
- No push, commit or production upload in this continuation without a new request.

## Tasks
- [x] Reuse previous workflow audit; verify exact lock/journal schema and current native capability boundary.
- [x] Repair test isolation/query performance, preserving assertions and existing timeout limits; security/code review then targeted and complete regression verification (332 frontend tests, typecheck).
- [x] Repair existing deployment tooling/configuration/lockfile reproducibility; mocked release tests and secret-output checks; no real upload (8 deployment tests, local production build/package passed).
- [ ] Implement stock/return/approval posting only after a supported atomic cross-table contract or explicitly approved revised consistency design exists.
- [x] Update current checkpoint with live master-command evidence, exact test results and remaining release blockers (758 backend tests passed; stock safety decision retained).

## Review focus
- Duplicate and concurrent decisions must not move stock twice.
- A timeout after a committed write must not cause blind retries.
- API/Admin authorization is not proof of transaction safety.
- Test cache cleanup must not replace real components or weaken behavioral assertions.
- Release tooling must use the same public site/app configuration as the build and never report upload acceptance as activation.

## Current capability finding
The live-matched `inventory_workflow_locks` schema has only UUID `id` and unique UUID `organization_id`; there is no existing general durable command journal or fencing protocol. A non-expiring mutex plus manual recovery is not equivalent to the binding all-effects-or-none contract. The user confirmed custom Python functions are expected and supplied the official Functions overview; this does not itself change the required consistency contract.

**Explicit user decision (2026-11-09):** Keep all-or-nothing stock safety; finish tests and release tooling first. Do not implement a partially committed recoverable saga or enable stock-affecting returns/approvals in this slice.
