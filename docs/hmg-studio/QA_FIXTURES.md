# Dedicated QA fixture scope — 2026-11-06

## Latest sectioned workspace checkpoint - 2026-11-06

**Implemented/read-verified, not full-module acceptance.** This supersedes earlier detail-tab presentation and test totals; prior evidence remains historical.

- **UI:** grouped business details and persisted-value summary cards replace generic horizontal detail tabs/raw-field cards. Related accordions mount paginated queries only when expanded. Shared bounded FK name lookups, multi-field server search, semantic statuses and real registered-record links reuse existing Refine query owners. Inventory keeps its specialized overview; Categories adds cards/table views; Approvals remains read-only.
- **Exports:** mapped visible current-page/current-record CSV and HMG-branded print previews (including browser Print-to-PDF) cover generic views/related lists, Inventory/stock/suppliers, Categories and personal Notifications. Identity/error gates, formula escaping and size bounds apply. No hidden-field, all-filtered, issued-invoice, email or payment-proof claim.
- **Verified:** independent review followed by **187 frontend tests /29 files** (273.68s), **250 Python tests** (5.79s), and both TypeScript configurations exit 0. [Final verification](evidence/sectioned-workspace-verification.json). No browser/visual acceptance, build, deployment or commit.
- **Synthetic data:** **60 transaction headers +75 supporting rows =135 rows /19 tables**, May-October 2026. Six new fictional products comprise four illustrated slabs and two assemblies; existing catalogue references remain separate. Ordinary-session exact readback verified all 135 rows, four private JPEG downloads matched SHA, and 58/58 bounded advisory checks matched. These are historical snapshots, **not executed stock/payment/approval workflows**. [Readback](evidence/historical-60-normal-readback.json), [images](evidence/historical-60-normal-images.json), [policy checks](evidence/historical-60-normal-policy.json).
- **Remaining:** seven exact-ID child READ policy changes added no C/U/D authority. Native ordinary customer POST 403 remains a provider blocker; original-row authority, atomicity/concurrency/idempotency/rollback and full source parity remain unproved. Platform event subscriptions were empty, but physical database triggers were not verified. Full-filter export, operational workflows and all-module/E01-E12 acceptance remain open.

### New historical fixture population (separate from prior 76 samples and 263 catalogue references)

| Business headers | Count |
|---|---:|
| Orders |16|
| Purchase orders |10|
| Returns |4|
| Stock adjustments |8|
| Stock transfers |4|
| Work orders |4|
| Order payments |14|
| **Total** |**60**|

The 75 support rows are `customers` 6, `suppliers` 3, `products` 6, `product_components` 2, `product_supplier` 4, `order_items` 16, `purchase_order_items` 10, `return_order_items` 4, `stock_transfer_items` 4, `work_order_items` 4, `work_order_outputs` 4 and `product_location_stocks` 12. All 135 rows were independently read through the ordinary QA native session across 19 tables. This is a scoped population count, not a global database total.

The six newly owned fictional products were staged inactive then published active after linked-row verification; four slabs reuse verified catalogue photographs with explicit illustrative provenance, while two are assemblies. No existing `HMG-WEB-*` reference was turned into physical stock. Their historical quantities/payments are synthetic snapshots, not proof that stock commands or external payments executed. Four private-image HTTP 200 downloads matched JPEG MIME/bytes/SHA; existing authenticated storage reads are still not organization-scoped.

[Create/readback summary](evidence/historical-60-summary.json), [ordinary 135-row proof](evidence/historical-60-normal-readback.json), [image proof](evidence/historical-60-normal-images.json). Native import had no write replays; six explicit product publications are distinct from the 135 create attempts. Physical triggers remain unverified despite empty platform subscriptions. Cleanup is not authorized or performed by this checkpoint.

## Prior retained QA/reference scope - 2026-11-06

This accounting supersedes historical no-products/no-activity statements below, without replacing their evidence.

- Seed/owner-notification population: **76 retained sample rows**, comprising prior 74 semantically verified rows, the existing report now verified through additive typed fields, and one newly inserted deterministic activity. This is not a global database row count. Original frozen plan 75/27 and its historical 73/25 readback remain preserved; typed-wire acceptance is separately evidenced for the two targeted JSON cases.
- Repaired saved-report ID `00bff3cd-654c-5330-95c5-10728e7fbf4c`; new activity ID `4c58cf88-ba30-531a-ad21-c2fe5de13805`. Ordinary reads 200 and typed values match; activity is explicitly a synthetic read-only sample, not an operational event. [Typed normal readback](evidence/structured-json-normal-read.json).
- Owner-specific notification ID `275aeb92-a8ae-5021-b639-7a0fc9050631` is outside the original frozen plan. Retained QA user `qa_hmg_inbox_20261106`, ID `1bbbcad2-46c3-480f-92d6-acdf566b510a`, role 1156; previous QA users retained. No credentials are documented. Exact two-QA username-to-UUID owner policy remains read-only.
- **263 public HMG catalogue references** are a separate approved population under organization `913d46eb-585d-5a5c-b1d4-b9d22052a8d6`. Deterministic UUID5/source URLs and `HMG-WEB-*` SKUs; inactive, stock 0, required legacy price 0 placeholder, selling/purchase prices null. They are not physical stock or quotations. Native create/readback and ordinary-session count 263 passed. [Import](evidence/hmg-catalogue-import.json), [ordinary read](evidence/hmg-catalogue-normal-read.json).
- Separate diagnostic `qa_json_types_20261106` table/row and bounded `hmg-qa-json-types-20261106` analytics diagnostic are not business seed totals. They are retained, not silently cleaned up. Existing business schemas/policies were not broadly migrated.
- Private media final reconciliation verified 252 unique private `products` objects and 263 owned image links (last run 262 updated  + 1 exact probe skip). Only `image` changed, with all non-image fields preserved except server `updated_at`; `Images` bucket untouched/reserved. Ordinary QA linked-prefix query HTTP 200/total 263 and one linked product/private-byte read 200 with exact SHA. [Delivery](evidence/hmg-catalogue-delivery-summary.json), [linked count](evidence/private-media-linked-normal-count.json), [linked byte proof](evidence/private-media-linked-normal-read.json). One private object ordinary-session read 200/exact SHA and anonymous 401 passed; existing authenticated-read policy is not organization-scoped. No storage policy weakening. [Proof](evidence/private-media-normal-read.json).
- Customer diagnostic UUID `ac82036c-7f82-574e-8606-de36246d010f` was **not created**: POST 403 and exact-ID readback 0. Temporary bounded zero-string policy test was rolled back and exact policy restored. [Escalation and evidence](evidence/native-create-provider-escalation.md).

Cleanup remains a separate explicitly authorized operation: exact owned IDs/paths, dependency checks and preserved evidence, never broad deletion. No cleanup was executed here. Administrative sample provisioning is not ordinary-user CRUD or atomic rollback proof.

## Historical QA checkpoints

User approvals: use this checkout; create dedicated QA records/test users only. Existing business records must not be modified. A later explicit confirmation approved only the proposed QA-scoped Categories/Organizations policy replacements; no shared identity-schema change, public/elevated function workaround or frontend deployment is authorized. Historical checkpoints below are superseded by the final catalog checkpoint.

## Planned organization fixtures

Use the verified native `organizations` table, not a new schema. Create only:

- `qa-hmg-studio-20261106-a` / `QA ONLY - HMG-Studio Isolation A - 20261106`
- `qa-hmg-studio-20261106-b` / `QA ONLY - HMG-Studio Isolation B - 20261106`

Both remain `is_active: false`, timezone `UTC`, currency/default_currency `USD`, with a QA-only description. No contact information or operational records. Fresh UUID primary keys; query exact slugs before writes and stop on a collision rather than overwriting it. Schema validation stays enabled. Read back only the exact new IDs.

These are administrative MCP fixture writes, not an application persistence implementation or proof of end-user authorization. Existing deny policies remain unchanged. Do not attach operational child records or activate the organizations before the membership/policy contract is verified.

## Recovery and cleanup

No existing record is updated or deleted, so no existing business-data restoration is part of this operation. Retain the fixtures inactive by default. Record returned IDs here; any future deletion must be restricted to those IDs after checking their exact QA slugs and dependent records. No broad cleanup, automatic retries after ambiguous write results, or claimed backup/restore proof.

## Test users (initial checkpoint, superseded below)

Deferred: live `manage_roles` lists only Super Admin (ID 1024), with no role slug returned. Creating a full-access user or guessing the slug is not an appropriate least-privilege QA default. The shared tenant attributes schema also requires `api_key` without an established HMG membership contract. Do not fabricate this attribute or replace the shared schema. No QA credentials have been generated.

## Execution evidence

Created and read back successfully through explicitly `hmg-studio`-scoped MCP. Exact-slug preflight returned zero records; schema-validated upsert returned `success: true`, count 2; exact-ID readback returned total 2 with both inactive and the planned values.

| Slug | ID | State |
|---|---|---|
| `qa-hmg-studio-20261106-a` | `616d839b-e107-4511-b12f-fd6ed301d999` | Inactive |
| `qa-hmg-studio-20261106-b` | `4166493b-ca74-4117-8a42-a3ec669bbfd0` | Inactive |

The native response left optional `created_at` and `updated_at` null; automatic lifecycle timestamps are not established by this fixture write. No contacts, child records, users, roles, policies or existing records were changed. Read-only lookup for username prefix `qa_hmg_studio_` returned zero matches; this is not a global user inventory. Administrative API-key access succeeding while deny policies exist does not prove ordinary-session access or isolation.

## Native preferences QA execution (historical checkpoint)

- New native user `qa_hmg_preferences_20261106`, email `qa_hmg_preferences_20261106@example.invalid`, ID `bb17fd27-1f5e-4691-b2c7-e9745883e54f`, active, nonstaff, verified nonsuperuser.
- New role `HMG QA Preferences 20261106`, ID1090, slug `hmg-studio-hmg-qa-preferences-20261106`. Native parent default is Super Admin; child membership did not confer that parent role in tested identity.
- Creation auto-generated wildcard role policy. Disabled only that new policy BEFORE user assignment: `role.HMG QA Preferences 20261106.vdefault/insurance_hmg-studio`; readback confirmed disabled. Existing business policies unchanged.
- Created user without attributes successfully; required shared api_key schema did not block this omission. Shared schema untouched. Password generated securely, retained only in ephemeral execution memory, never source/documents.
- New private synchronous function `hmg-account-preferences-v1`, ID1915, app694, version4. Source: `backend/functions/account_preferences.py`; normalized remote source matched. Auto-created function execute policy allows authenticated roles; the function's fixed-self SDK never accepts caller-selected identity.
- QA credential login returned authenticated session. Function read/update/read and direct native preference readback agreed on Asia/Kolkata, YYYY-MM-DD,24h. Theme light/widget_config empty preserved.
- QA direct organizations access returned403. Anonymous function access returned403. No business records changed.
- Cleanup: deactivate this exact QA user through native user API after validation, or rotate through native credential flow. Do not delete unrelated roles/users. QA-only role policy remains disabled.

## Final catalog QA checkpoint

- Added native role `HMG QA Catalog A`, ID1123, slug `hmg-studio-hmg-qa-catalog-a`, to the same dedicated QA user. Auto-generated wildcard role policy `role.HMG QA Catalog A.vdefault/insurance_hmg-studio` was disabled before assignment.
- Category A: `4e91a149-78a0-5284-a611-d076442b9e5a`, slug `qa-hmg-studio-category-a-20261106`, organization A, name `QA ONLY - Category A edited 20261106`, active, parent null.
- Category B: `61148090-a6ea-5e1d-b8c8-188dce27f744`, slug `qa-hmg-studio-category-b-20261106`, organization B, name `QA ONLY - Foreign category B 20261106`, inactive. Isolation fixture only.
- Failed test temporarily moved category A to B. Policies were rolled back immediately; only that exact QA record was restored to A using its preserved full row. Partial restore attempt failed NOT NULL before changing data; full preserved-row restore/readback succeeded.
- Current category policy is QA A scoped READ ONLY; create/update/delete denied. Organizations likewise scoped QA A read only. Latest ordinary-session checks: list200, create403, update403, foreign read403. See `evidence/catalog-final-readonly-qa.json` and current policy snapshots.
- No existing business record was changed. No products or stock transactions created. Test UUID `db7b2a41-2e66-4a52-8374-d1c489be2ea9` was used for a denied-create request, not an accepted fixture.
- Cleanup requires exact QA IDs, dependency inspection and native APIs. Preserve fixtures until validation/incident review is complete. Password/token values are absent from repository artifacts.
