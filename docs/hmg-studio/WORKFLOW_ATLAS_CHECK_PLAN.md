# Workflow atlas verification plan

## Request and source

Check all 24 workflows in the supplied `Inventoros_Complete_Workflow_Flowcharts.md` against HMG-Studio and ensure missing functionality is not mistaken for completed implementation.

- Source: `C:\Users\pradeepk\AppData\Local\Temp\Inventoros_E2E_Audit\Inventoros_Complete_Workflow_Flowcharts.md`
- SHA256: `4e8d6abd8828992c993130d84b5d402fe7985c25906ab8c682ef974470ff94be`
- Source revision named by atlas: `1f78e818d9aee025020fe7489955f4f0c448c53a`.
- Target: existing HMG-Studio only; preserve HMG Stones and unrelated work.

## Architecture and reuse

Use the existing module registry, generic ERP pages, specialized inventory/categories/approvals, native user provider, operational reports and Python functions. The existing 32-module development pack and E01-E12 acceptance journeys remain the detailed contracts; this check adds an F01-F24 crosswalk, not a competing implementation framework. Schema presence, fixture history and local tests do not prove execution of a business workflow.

Installed Taruvi skills are under `.agents/skills`; the older `.codex/skills/taruvi-app-developer` path is absent, as already recorded in the sectioned workspace execution plan.

## Ordered work

- [x] Read all 24 supplied flowcharts and cross-workflow stock/money rules.
- [x] Read current release evidence, existing acceptance journeys and resume ledger.
- [x] CodeAuditor maps current executable owners and missing transitions, without repeating previous live probes.
- [x] DBSchemaAgent checks current app-scoped function/policy capability and exact schema dependencies where needed, read-only.
- [x] Produce a complete workflow gap/acceptance crosswalk, with existing source and evidence links, priority and owning dependency for every gap.
- [x] Apply only a diagnosed, safely implementable correction if identified; never enable unsupported multi-record financial/stock writes or create fake success states.
- [x] Independently review correctness/security and evidence claims.
- [x] Run frontend/backend regression and type checks; record new results separately from previous release evidence.
- [x] Update the persistent resume pointer after tests, with completed/remaining/blocked clearly separated.

## Acceptance criteria

All F01-F24 and E01-E12 accounted for. Every flow names implemented portions, missing actions, and its next acceptance test. Whole-workflow acceptance requires native authorized positive/negative execution, committed readback, relevant ledger reconciliation and applicable concurrency/replay/failure tests. UI/browser/provider/deployment proof is separate. No reset, outbound email, payment, label purchase, destructive cleanup, role widening, or fixture mutations merely to make a diagram appear complete.

## Intended artifacts

- `docs/hmg-studio/WORKFLOW_ATLAS_VERIFICATION.md`: source crosswalk and ordered implementation gaps.
- `docs/hmg-studio/evidence/workflow-atlas-verification.json`: source hash, current checks, scope and limitations.
- Existing parity/resume ledger: short pointer to this newest workflow audit, not another duplicate historical summary.

No production code or deployment is required for an audit-only result; if the current native persistence/authorization contract cannot safely support missing transitions, leave them explicitly blocked and identify the required platform capability.

## Diagnosed correction: dashboard unknown values

The code audit found `amount(None)` returning zero, missing currency/active flags being assumed, and a legacy `price` fallback when `selling_price` is unknown. These can misrepresent valuation and receivables. Extend the existing `backend/functions/dashboard.py` only: validate explicit currency/active/status discriminators and selected-row numeric facts; return the existing `DATA_UNAVAILABLE` failure envelope for missing/invalid facts rather than fabricated totals. Keep explicit zero valid, exclude known inactive references/cancelled orders, preserve caller-only reads and the existing success envelope. No UI or schema changes and no business data backfill.

Tests belong in existing `backend/tests/test_dashboard.py`. Preserve chronology/pagination tests with explicit valid fixtures; add missing/null/malformed discriminators and numeric facts, zero, inactive reference, cancelled order and no-write checks. Independent test review precedes RED run; implementation/security review precedes final GREEN/full suites. Ordinary-session completeness evidence confirms the current 15 active INR products and 19 non-cancelled INR orders have these required facts. Only after fresh schema confirmation and regression/live execution proof may the existing private dashboard function be updated; no unrelated function or policy replacement.

## Local regression checkpoint - 2026-11-07

Independent review preceded the observed dashboard RED (64 failed /51 passed) and production GREEN (115 passed). Full backend: **459 passed**, full frontend: **251 passed /32 files**, both TypeScript configurations exit 0. [Exact commands, logs and hashes](evidence/workflow-atlas-regressions.json). Focused tests overlap the full backend count. Only the dashboard unknown-value correction is implemented in this audit; local regression success does not accept a full workflow, deploy a function or establish browser execution.

## Private dashboard release acceptance - 2026-11-07

The existing private synchronous APP function `hmg-dashboard-v1` is now **version 3**. The [original deployment journal](evidence/workflow-atlas-dashboard-deploy.json) intentionally retains `verified: false`: byte-exact readback differed. A separate [read-only reconciliation](evidence/workflow-atlas-dashboard-reconciliation.json) proved the sole change was removal of the final LF (6,625 submitted bytes versus 6,624 live), with identical parsed Python AST, preserved private/function metadata and unchanged policy. No update replay or journal rewrite was used to manufacture a success flag.

Ordinary `hmg.john` [before](evidence/workflow-dashboard-before.json) and [after](evidence/workflow-dashboard-after.json) executions returned HTTP 200 and identical recorded projection hashes/metrics: 15 active INR products and 19 orders; no admin fallback. [Negative checks](evidence/workflow-dashboard-negative-checks.json) denied unauthenticated execution (HTTP 403), malformed currency and forged organization parameters (both `VALIDATION_ERROR`). This accepts the bounded read-only dashboard correction, not a full workflow. Frontend deployment is unchanged; no browser/visual acceptance. Continue with the existing Pradeep account for requested administrative work; no new users are authorized by this audit follow-up.

Current primary-documentation findings and credential boundaries are summarized in the [native SDK/authorization section](WORKFLOW_ATLAS_VERIFICATION.md#current-native-sdk-and-authorization-findings). Existing SDK CRUD is supported; Console/organization-access success and `_allowed_actions` hints are not ordinary-team write proof. The customer policy already uses the confirmed role name; do not retry a disproved slug fix or create new users.
