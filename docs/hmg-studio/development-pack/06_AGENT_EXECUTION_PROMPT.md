# Copyable Taruvi Agent Execution Prompt

Use the following after you authorize development and provide this complete folder to your agent:

---

Build the complete HMG-Studio app from this specification pack. Start with `00_START_HERE.md`, `01_ARCHITECTURE_TARUVI_PYTHON.md` and `02_EXECUTION_PLAN.md`. Scope includes every module file, all 123 inventoried source views, nested controls and required cross-module workflows—not just the visible sidebar.

**Target: React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; Python backend services. No Laravel/PHP/Eloquent/Artisan, and no separate Supabase backend.** PHP and Vue in evidence explain reference behavior only. Verify Python hosting and native transaction/concurrency capabilities before selecting deployment or implementing stock/payment posting. Ask for an architecture decision if a required capability is unavailable; do not silently change the target stack.

Read current destination code and its local instructions. Preserve unrelated work and the separate HMG Stones app. Extend existing owners; do not duplicate schemas, stock ledgers, components or business logic. Use explicitly hmg-studio-scoped MCP to confirm exact data names, field types, relationships and access policies before any change. Confirm the environment and authority for migrations, test records and provider actions. Never expose secrets.

Implement one complete vertical slice at a time in the documented order. Each module file contains scope, dependencies, source pages, implementation tasks, acceptance assertions and exact source field/view/validator evidence. Read relevant shared contracts. Write down exact target create/modify/test files and Python interfaces before coding, using existing architecture rather than invented paths. Follow source defaults and workflow effects; record any approved native equivalent or intentional deviation.

Use audit/reuse → schema/contracts → failing tests → implementation → security/duplication review → tests → browser/readback → documentation. Prove atomicity, concurrency, rollback, idempotency and direct-write access protection for compound stock/payment effects. Do not replace workflows with disabled buttons, mock data, local-only state, generic CRUD calls or success messages without committed readback.

Maintain `05_PARITY_AND_RESUME_LEDGER.md` continuously at page/field/action/state-transition granularity. Record actual verification evidence and exact resume point. Report completed, verified, remaining and blocked separately after each slice. Do not claim the app complete until all required module behaviors and cross-module acceptance chains pass, or report clearly why completion is blocked. Do not silently drop administration, portal, reports, imports, integration or recovery features. Do not commit/push/deploy or purchase/send external services without authorization.

---

The prompt is a handoff, not proof of delivered software. When resuming, start from the last verified ledger checkpoint rather than regenerating the project.
