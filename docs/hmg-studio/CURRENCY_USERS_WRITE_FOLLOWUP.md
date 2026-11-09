# Currency, native users and write-access follow-up

## Scope / decisions — 2026-11-07

Continue the existing operational workspace; preserve all unrelated edits and the separate HMG Stones app. Screenshot failures are the acceptance cases.

- Dashboard currently filters records by currency. Keep the existing caller-authorized INR projection, and make the selector a **display currency** conversion, preserving counts/rows. Fetch only public currency-pair reference rates, never business data, from Frankfurter; show source/date and indicative-only wording. Do not change recorded prices, payments or accounting currency. Fail visibly if rates are unavailable; never relabel INR as USD. Non-INR ledgers remain outside this explicitly labelled projection.
- Native user list already uses Taruvi, not fixtures. Verify the username detail contract and HMG membership filter before repairing View/scoping. Keep UUID row identity separate from the API lookup key. No identity datatables or unrelated account changes.
- User supplied John, Kevin and Peeter, all @hmg.com. Check exact username/email collisions before creating three standard native accounts. Pradeep stays admin. Do not invent employee roles or broaden financial-write permissions.
- Edit/activation must be enabled only after action-specific native authorization and organization-isolation checks. Never turn inactive website references into purported priced physical inventory by filling guessed values.

## Existing owners / dependencies

`src/pages/home/index.tsx`, `src/services/dashboard.ts`, `backend/functions/dashboard.py`; `src/pages/erp/platform.tsx` and native user provider; generic master forms and `writeBlocker` in ERP services. CodeAuditor confirmed no existing FX utility and a UUID/username mismatch. No schema change is needed for display conversion or native user lookup.

## Ordered checklist

- [x] CodeAuditor read-only reuse audit and screenshot diagnosis.
- [x] DBSchemaAgent native endpoint/filter contracts, identity duplicate check and metadata write capability review.
- [x] Implement display conversion and native user repair using existing owners; draft regression tests.
- [x] Independent correctness/security review before running tests or live writes.
- [x] Run regression/type checks and ordinary-session positive/negative probes.
- [x] Create authorized real team accounts using native APIs, read back roles and identity without logging credentials.
- [x] Update scoped verification docs after 251 frontend tests and both TypeScript configurations pass.
- [x] Build/deploy Studio only and verify deployed routes/assets (root-owned release gate; not inferred from local tests).

## Display currency and native team directory - 2026-11-07

**Implemented, independently reviewed and locally/API verified; no browser or deployment acceptance claimed here.** Earlier checkpoints remain historical.

- Dashboard now requests the fixed **INR ledger** regardless of the **Display currency** selector. INR/USD/EUR presentation preserves all source counts, rows and category shares. USD/EUR monetary values use public Frankfurter ECB reference rates, with source/date and indicative-only, non-accounting wording. Loading/error hides converted amounts rather than relabelling INR values; retry and stale-response/unmount cancellation are covered.
- The fixed public request sends only the currency pair: no credentials, session header, business data or referrer; redirects are rejected. Eight-second timeout, 4 KiB response bound, strict base/quote/positive finite rate checks, real UTC dates, seven-calendar-day freshness and future-date rejection apply. A five-minute public-only cache is revalidated on reuse; the open dashboard refreshes rates periodically. [Actual service/rate proof](evidence/currency-display-live-rates.json) verified both pairs dated November 6, separately from browser CORS/visual acceptance.
- Native Users stays on the dedicated Taruvi `user` provider. View uses an encoded **username**, not the row UUID, and rejects mismatched returned identity. A permanent server-side `roles=hmg-studio-hmg-team` directory filter remains alongside search/pagination. This is explicit membership grouping, not proof that an app header scopes the tenant directory or a replacement authorization boundary. [Native ordinary contract](evidence/native-user-ordinary-contract.json).
- John, Kevin and Peeter were created through native APIs as standard accounts; all three fresh logins, username detail reads, three-member directory results and product reads passed. They have the membership tag and existing operator role; no new financial-write grant is claimed. Pradeep's existing staff/admin status was preserved and membership read back. [Provisioning](evidence/hmg-team-provisioning.json), [ordinary checks](evidence/hmg-team-ordinary-verification.json). No invitation email was sent; credentials are not copied into docs/evidence.
- **251 frontend tests /32 files passed (352.03s)**, both TypeScript configurations exit 0. [Exact frontend verification](evidence/currency-users-frontend-verification.json). Native product/customer/supplier update policy remains DENY; no frontend edit gate was enabled. Catalogue metadata enrichment and build/deployment are separate root-owned work, not acceptance inferred from these tests. Full CRUD, atomic stock/money workflows and browser/visual acceptance remain unproved.

## Remaining honesty boundaries

Generated demonstration history is not actual HMG accounting history. Public catalogue photographs do not establish stock, prices, bin assignments, invoice issuance or approvals. Native 403 cannot be fixed by a frontend capability flag or hidden warning. No browser/visual acceptance is implied by HTTP probes.

## Deployed release

- URL: https://hmg-studio.taruvibase.app/
- Active build: `d4bb237c-f3fe-4e76-b01a-631a8863c24f`.
- Production build succeeded (93 seconds); nine route/asset HTTP checks returned 200 with exact local/deployed SHA256 matches. Configured secret-value scan passed. Existing `hmgstones` worker/build unchanged. [Deployment evidence](evidence/currency-users-deployment.json).
- Upload used the existing Studio worker. The documented POST activation returned 405 without activating; live OPTIONS established PATCH, which activated the already-uploaded build. No duplicate upload or worker was created.
- Main JS remains approximately 3.99 MB uncompressed; this release does not claim bundle-size/performance or browser visual acceptance.

## Verified catalogue data correction

Assigned the missing `category_id` on 185 owned HMG website catalogue references using their preserved source category: Marble 69, Quartzite 39, Onyx 28, Granite 25, Travertine 24. The screenshot's Onyx product now references the existing Onyx category. No new category, business transaction, stock, price, location, SKU or activation change was made. The 78 references without an existing matching category remain unmapped rather than guessed.

Fresh schema/policy/event checks, full before-row and target-category hashes, one-field PATCH, immediate and final 185-record readback all passed. An ordinary HMG team session independently read all 185 products and five target categories with exact non-timestamp field preservation. This is bounded administrator data maintenance, **not** proof that user-facing edit authorization or physical inventory workflows are ready. Physical triggers remain unverified; read-before-write is not atomic CAS.

- [Reviewed plan](../../backend/schema/catalogue-category-plan.json)
- [Apply and final readback](evidence/catalogue-category-apply.json)
- [Ordinary-session verification](evidence/catalogue-category-ordinary-readback.json)
