# Full-pack checklist maintenance plan

Goal: make every supplied specification discoverable and prevent unimplemented or unverified behavior from being marked complete.

Scope: the immutable user-supplied development pack (46 Markdown files, 32 modules, 123 views, 509 evidence sections), plus the 12 acceptance chains. Extend the existing parity ledger; do not replace it or create a second implementation-status authority.

Files:
- `IMPLEMENTATION_CHECKLIST.md`: entry point, all files/modules/phases/chains, completion rules and current blockers.
- `checklists/SOURCE_CONTRACTS.md`: stable source-section and field/default/validation/action reference checkboxes. Reference source code, never copy it into application code.
- `checklists/SPECIFICATION_GATES.md`: root instructions and module implementation/acceptance gates outside evidence sections.
- `checklists/coverage.json`: source paths, hashes, line ranges and stable IDs for independent completeness checks.
- `checklists/baseline/03_SCHEMA_AND_SERVICE_CONTRACTS.md` and `05_PARITY_AND_RESUME_LEDGER.md`: immutable original snapshots for exact source-line links where the working ledger has changed.
- Existing `development-pack/05_PARITY_AND_RESUME_LEDGER.md`: sole detailed implementation/test/backend/browser status owner; current checkpoint supersedes historical entries.
- Existing `CATALOG_PLAN.md`, `QA_FIXTURES.md`, schema ledger and evidence: correct stale authority/verification claims.

Checklist:
- [x] Inventory the original pack and compare all unmodified working specifications. Evidence: [coverage result](evidence/checklist-coverage-validation.json).
- [x] Index all module/page/evidence IDs and each source-contract clause without treating inventory as delivery. Evidence: [index](checklists/coverage.json).
- [x] Reconcile actual blockers and failed tests with the existing ledger. Evidence: [current ledger checkpoint](development-pack/05_PARITY_AND_RESUME_LEDGER.md#current-checkpoint-complete-scope-checklist-catalog-held-fail-closed).
- [x] Validate counts, unique IDs, source hashes, links and clause coverage. Evidence: [coverage result](evidence/checklist-coverage-validation.json).
- [x] Review for omissions and unsupported completion claims. Independent review found no critical/important omission in 46 files/32 modules/123 views/509 anchors/4029 clauses; fixed nine heading-only sections and required behavior-level expansion of code-reference blocks. Additional 2057 specification gates were coordinator-verified rather than independently reviewed.

Maintenance: update the ledger after each vertical slice. Check a contract only when its exact target mapping, validation/authorization, test result, live readback and browser evidence are linked, or an explicit approved native-equivalent decision covers it. Never bulk-check entries merely because a source file was read. Preserve original temporary files, HMG Stones and unrelated edits. No build, server start, deployment or commit.
