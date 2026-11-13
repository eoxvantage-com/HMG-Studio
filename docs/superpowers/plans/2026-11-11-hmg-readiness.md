# HMG readiness continuation — 2026-11-11

User requests posting completion, QA-separated analytics, dependency cleanup, and verification of API keys entered into database Host fields. UI acceptance remains manual. Continue existing Taruvi architecture and all-or-nothing stock requirement; no source Insurance changes, broad role grants, secrets in logs, or dirty Stones ERP deployment.

## Execution order
1. Reuse audit: inspect existing dashboard, stock gate, secret consumers and both dependency trees. Verify exact schema/secret-type contracts before mutation.
2. Dashboard: explicit organization `settings.dataset_kind` classification (`production` or `test`). Preserve other settings; classify only verified existing organizations. Default production, separate selectable QA view; exclude unclassified organizations and explain scope. Filter every source before aggregation, preserving caller authorization and currency semantics. No guessed production revenue from imported reference products.
3. Secrets: metadata only, never use Host as URL. Provision an appropriate private/sensitive API-key type if unavailable; fix scope/names through secure mechanisms or request correct reentry if values cannot safely be migrated. No broad cross-app secret exposure.
4. Dependencies: minimal compatible fixes/removals, no force-major upgrade. Preserve dirty work in both repos. Build migrated Stones baseline in isolation; record exact lockfile changes and audit output.
5. Security review → tests/typechecks/build → live deployment/readback of verified destination artifacts → documentation/manual handoff.

## Stock decision
Fresh official-doc review on2026-11-11 still finds only per-record/per-table-bulk transactions, no cross-table runtime commit/CAS contract; direct drivers forbidden. Do not fake success through compensating requests or merely enable buttons. Posting remains blocked until a supported native transaction primitive is provided or the user approves a different authoritative-storage architecture. Continue independent work without repeatedly asking the same question.

## Completion evidence
- Unit regressions for QA exclusion across counts, prices, pipeline, monthly totals, recent rows/categories/locations; default production, QA mode, invalid mode, denied classification reads, and unclassified exclusion.
- Frontend test verifies changing dataset updates the function request and does not display a previous dataset's totals.
- Live production and QA projections read back separately; existing QA records preserved.
- Both dependency trees audited and exact remaining advisories disclosed; production acceptance not inferred from a static build.
- AI secrets only readiness booleans/metadata reported; no sensitive values or keyed requests in logs.
