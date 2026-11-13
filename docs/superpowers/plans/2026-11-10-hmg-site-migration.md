# HMG Stones Site Migration Implementation Plan

> Use executing-plans for implementation, with specialist schema/security/test review gates. Do not run source-pinned scripts against the destination.

## Approved design and scope

Keep HMG Stones and HMG-Studio separate apps in the HMG_Stones site. Reuse existing products, images and locations in Studio; add isolated end-to-end test fixtures and live dashboard analytics. Keep Insurance deployments intact until destination acceptance. User performs manual UI acceptance.

Source: https://insurance.taruvi.cloud; app slugs `hmg_stones` and `hmg-studio`. Destination: https://hmg-stones.taruvibase.cloud. Both destination app identities, schemas, copied records/media, private functions and frontend artifact identities have now been verified. Source deployments remain intact.

## Resolved access gate

The initial destination401 was resolved by updated local credentials. Explicitly destination-scoped REST/stateless MCP succeeded; the chat's native Taruvi binding still addressed Insurance Agents and was not used for migration writes. Credentials stayed process-local and out of artifacts.

## Architecture and reuse map

- Preserve deployed configuration separately from dirty local worktrees in both repos. Do not blindly ship HMG_Stones pending ERP work as part of migration.
- Reuse pure identity/deduplication/reconcile routines in `backend/scripts/import_hmg_catalogue.py`.
- Reuse content hashes, MIME validation and readback in `copy_hmg_catalogue_media.py`; its source app/bucket IDs and Insurance scope are not portable.
- Reuse image-only preservation checks in `link_hmg_catalogue_media.py`.
- Reuse fixture generators in `seed_erp.py` and `generate_historical_60.py`; destination identity/FK mappings must be confirmed first.
- Extend `backend/functions/dashboard.py`, `backend/tests/test_dashboard.py`, `src/services/dashboard.ts` and tests, and `src/pages/home/index.tsx` and tests. Keep caller authorization and strict response validation.
- Inspect HMG_Stones `backend/hmg/functions/commands.py` embedded storage prefix before migration. Do not globally replace URLs or IDs.

## Execution checklist

- [x] Read-only code reuse audit and source access checks.
- [x] Save and inspect configuration archives for both source apps (secrets excluded); take separate complete paginated record and storage backups. Configuration ZIPs alone are not full recoverable data backups.
- [x] Authenticate destination; DBSchemaAgent confirms app identities, exact schema/column names, policies, roles, storage and existing records. Snapshot destination before merges.
- [x] Create an explicit source-to-destination manifest: site/app identities, schema digests, record IDs, user/role mapping, bucket/object mapping and collision decisions. Never overwrite unknown existing resources.
- [ ] Implement dry-run-first migration by extending existing utilities. Tests cover wrong target, duplicate reruns, conflicting IDs, FK ordering, pagination loss, partial failures and media integrity. Read before writing; checkpoint and verify each batch. No blind mutation retries.
- [x] Security review before test execution; review role scope, credential handling, bucket access and event/cron side effects. Keep policies enabled. Configure destination secrets through secure platform mechanisms separately.
- [x] Copy approved configuration then records dependency-first, with subscribers/jobs controlled to avoid replay side effects. Verify counts, relationships and semantic equivalence.
- [x] Copy actual media bytes to destination storage; verify SHA256 and access. Rebind stored URLs and frontend origins. Do not assume app export contains attachment files.
- [x] Reuse Stones catalogue and location data in Studio using provenance and stable IDs. Reconcile already-imported catalogue records. Catalogue references are not stock balances.
- [ ] Create deterministic, isolated, clearly labelled QA fixtures for all supported modules. Map platform user references; do not invent real financial transactions. Historical fixture rows do not prove successful posting functions.
- [ ] Extend live server-side dashboard with date/organization filters and explicit test-data separation, then schema-supported purchasing, order, return, approval and location summaries. Preserve currency semantics; unknown values remain unknown. No client-only sample totals.
- [ ] Automated tests, schema/policy readback, ordinary-user allowed/denied permission checks and readback of approved QA master CRUD.
- [x] Build and deploy both destination frontends with verified site/app configuration and rollback artifacts; verify public build hashes and destination API identity.
- [ ] User manual acceptance, final sync/cutover with source writes paused if necessary. Retain source deployments until explicitly approved for retirement.

## Safety and completion boundaries

### Destination access and backup checkpoint (2026-11-10)

- Updated local credentials verify HMG Stones destination HMG-Studio via HTTP 200. Native `mcp__taruvi` still returns Insurance Agents schemas; do not use that binding for this migration.
- Destination read-only schema audit: zero business tables/functions/analytics; native `auth_user` and `storage_objects` only. Existing empty private `stones` bucket and its policy must survive. Scope `hmg_stones_hmg-studio` verified.
- Destination pre-import configuration archived as `.cache/migration-20261110/destination-before-import.zip` (3,264 bytes, SHA256 `27b8bba84ac5dd6304cbeb4a871d54cb2c7f417ee54e8e8aa3619be608d825fe`).
- Complete source business-record snapshots: Studio 492 rows / 63 tables; Stones 461 rows / 8 tables. Files and checksum manifest are in ignored `.cache/migration-20261110/`. Stable pagination and duplicate-ID/count guards passed. These are read-time snapshots, not a final write-frozen cutover snapshot.
- Schema audit found no missing internal business FK references. Native identity references still require destination validation. Never silently reattribute historical records to Pradeep.
- Stones has zero `hmg_warehouses`/`hmg_locations` rows; Studio already has three warehouses and three product locations. Preserve these rather than claim new Stones location data.
- Source includes 110 Stones material URLs pointing to Insurance, and Studio storage-relative product images. Rebind only after byte verification.
- Security review conditionally approved config-only staging import with no frontend cutover, function execution or role-assignment rollout. Runtime hardcoded Insurance media prefixes and missing destination AI secrets remain activation gates.
- Official import endpoint confirmed from Taruvi-ai/taruvi-action `scripts/import-backend.sh`: multipart POST `/api/apps/imports/`. Import attempt receipts are kept in the ignored migration folder; a started/timeout receipt is not success and must be reconciled by readback before retry.

Source configuration packages saved in ignored `.cache/migration-20261110/`, with checksums in `manifest.json`: Studio 26,493,307 bytes; Stones 33,578,206 bytes. Export requested `include_secrets:false`. These archives are migration inputs, not proof of complete record/media backup or restore readiness.

Retain the all-or-nothing stock posting requirement. Migration, fixtures and charts do not resolve the missing verified cross-record transaction boundary. Do not enable partial stock, return or approval posting or seed fictitious live ledger effects. Pradeep's app-admin scope is HMG apps only; do not modify unrelated Insurance apps.

## Manual-test deployment checkpoint (2026-11-10)

- Both configuration imports and953 business-record readbacks completed: Studio492/63tables and Stones461/8tables. Original IDs retained except explicit historical native-user mappings.
-456 source media objects verified. Studio importer failed252files; all252 were separately repaired and product links rebound. Stones204files verified independently.
- Four approved inactive historical identities created; their native app-access listings are empty. They received no login credentials or business access.
- Added110 official Stones catalogue references and9categories to the existing HMG Studio organization.108 unique image bodies copied into Studio's private products bucket, SHA256/byte readback verified. References remain inactive with unknown commercial prices and zero stock; no name-only merge into synthetic legacy catalogue.
- Added40 isolated, deterministic QA input records across15tables. Orders/transfers pending; purchase orders/audits draft. No payments, opening balances, adjustments or outbound schedules created.
- Dashboard adds six-month shipped/delivered order totals, order-status pipeline and catalogue completeness. Live function execution passed after data import; frontend deployed. Metrics explicitly include accessible test workspaces.
- Pradeep's existing destination app roles assigned and role-filtered readbacks verified: `hmg-studio-admin` and `hmg_stones-hmg-administrator`. No unrelated roles/policies changed. API-key execution is not ordinary browser-session acceptance.
- Studio: https://hmg-studio-hmg-site.taruvibase.app/ —6served artifact hashes verified.
- Stones: https://hmg-stones-hmg-site.taruvibase.app/ —24served artifact hashes verified. Built from isolated clean source commit `fd399964eb9ad328c1982ee4112187fbd940ead5`, not the dirty ERP working tree.
- Both app defaults point to their new app-associated workers. Neither Insurance worker changed.
- Validation: Studio335frontend tests/37files,770backend tests, typecheck/build; Stones42tests/4files, typecheck/build. One expected duplicate-ZIP warning in backend tests. Static Stones dependency review found no reachable critical/high path in published artifact, but dependency remediation remains open; no server/node_modules shipped.

Ruling: this is a migration-test handoff, not final production cutover. Date/organization filters and explicit production/test exclusion remain deferred rather than presenting mixed fixtures as production KPIs. AI secrets are explicitly deferred by the user. Atomic stock/return/approval posting remains gated. Manual UI acceptance and a source-write-frozen final delta reconciliation are still required before retiring Insurance.

Sanitized durable evidence: `docs/hmg-studio/evidence/site-migration-20261110.json`. Detailed private receipts/backups remain in ignored `.cache/migration-20261110/`.

