# Stock ledger QA handoff — 2026-11-11

## Scope and authority

**QA only, not production inventory cutover or full workflow acceptance.** The approved revised design keeps Taruvi native storage and functions, but replaces multiple stock writes with one immutable event holding every movement line and workflow transition. The private `hmg-stock-ledger-v1` gateway appends to `stock_ledger_events`; database-enforced organization/predecessor and organization/request uniqueness serialize appends and prevent duplicate effects. Balances, reservations, return entitlement and review state are chain projections. No separate backend/database or compensating-write atomicity claim is involved.

Only QA organization `5d61a85e-d8e4-5a2a-a861-0c1dabe2a352` is enabled. Legacy balances, global stock readers and existing queues remain unchanged. Sales and Purchase order approval posting, dynamic registration of new products, and issuance of new return entitlement are not enabled. This checkpoint supersedes the earlier blanket blocker only for this isolated ledger authority, not production operations.

The caller is authorized before a separate scoped native service identity is used. Its credential is held in the sensitive Taruvi secret `hmg_ledger_writer_qa`; no API key is used in ledger runtime and no credential values belong in source, evidence or chat. The injected caller SDK is not reauthenticated. Read history is bounded at 200 events / 1 MiB and fails closed before commit; this is not a production capacity strategy.

## Verified evidence

- 16 live acceptance checks passed: secret/direct-ledger denials, lost-response replay, duplicate concurrent commands, competing movement, multiline failure, concurrent approvals, rejection, restock/non-restock returns, over-return denial, changed-payload replay denial, cross-organization denial, both unique-key conflicts (409), and roleless execute denial (403).
- Readback after acceptance: 12 QA events, sequence 11. These are a checkpoint, not a permanent expected count after manual testing.
- Scoped service probes denied legacy data and function access, upsert/update/bulk update, delete probes, and a structurally valid cross-organization insert. Other-organization reads returned no rows; other-app lookup returned 404.
- Backend: 840 passed (one expected duplicate-ZIP warning). Frontend: 356 passed across 39 files. Typecheck and production build passed; large-chunk warning remains.
- Destination Studio worker completed build `e043d171-b88a-40f8-8d32-1c950986d9d6`; all six served files matched the uploaded archive manifest. No Stones or Insurance deployment is implied by this checkpoint. No commit/push or browser acceptance was performed.

Sanitized evidence: [stock-ledger-qa-20261111.json](evidence/stock-ledger-qa-20261111.json). Raw local receipts stay in ignored `.cache/ledger-20261111/`; do not publish raw payloads.

**Qualifications:** service `staff=null` is unknown, not proof of false. DELETE probes targeted missing IDs, so they are permission-denial evidence, not an existing-row deletion test. The historical diagnostic `NameError` retained in the acceptance receipt is from older diagnostic code; the actual gateway passed all 16 checks. Final full gateway code readback matches the local source (SHA-256 recorded in the sanitized evidence). Both temporary diagnostic functions are disabled.

## Manual acceptance (Pradeep)

1. Sign in to [Studio approvals](https://hmg-studio-hmg-site.taruvibase.app/approvals), choose **Stock ledger (QA)**, then **Refresh QA ledger**. Confirm the QA organization warning and verified balances/sequence. Labels deliberately show UUIDs, not resolved business names.
2. For a transfer, select **movement**, a baseline product, source and distinct destination; enter a small available quantity and command reason. **Review request**, inspect the immutable payload, then **Confirm submit**. Confirm pending status, not a completed stock movement. Approve with a reason and confirm the transition; refresh and compare both locations. Try a separate pending request with **Reject** and confirm no movement.
3. Select **adjustment**, a baseline product/location, signed nonzero quantity and reason. Submit and approve; verify the resulting balance. Negative adjustments must not consume unavailable stock.
4. Select **return** and a verified order-item entitlement. Product, destination and condition are fixed by its snapshot. Use a small quantity and test **Restock returned units** selected and unselected on separate requests, submitting and approving each. Both consume entitlement; only restock adds stock. Damaged entitlement cannot restock. The existing fixture began with entitlement 6 and has 3 already returned, leaving 3 at the automated checkpoint; refresh before testing and do not exceed the current remaining quantity.
5. On a posted movement or adjustment, provide a reason and **Reverse**, inspect and confirm. Expect a linked inverse event and reversed status, never record editing/deletion. Return reversal is intentionally unavailable. Reversal still validates available stock and may reject an unsafe inverse.
6. For an uncertain response, keep the displayed request ID and this browser tab. **Retry same request** sends the identical retained command; **Refresh QA ledger** only reads state and does not reconcile the pending command. Do not create a replacement ID or change its payload. Reload in the same tab retains the request; unreadable pending storage blocks submission. Only a correlated definitive rejection releases it for a corrected new request. Authorization, incomplete history, insufficient stock and over-return failures are not successes.

Manual tests intentionally modify only isolated QA ledger events and consume remaining capacity/entitlement. Record results separately; deployment and API checks are not browser acceptance.

## Operations and remaining production gates

Keep the writer credential in native sensitive Secrets. For rotation, pause QA submissions, rotate the scoped native account credential and matching secret together, verify private-gateway readback and denials, then resume. Deactivation is an emergency disable switch and makes gateway service access unavailable; do not deactivate the persistent writer as if it were a temporary acceptance user. Preserve ledger events and same-ID reconciliation evidence. Credential rotation/deactivation is guidance, not a claim it was executed here.

Final runtime readback confirms zero active temporary QA users and both `hmg-ledger-access-probe` and `hmg-ledger-diagnostic` disabled. The persistent writer remains active with only the `HMG Ledger Writer QA` app role and `is_superuser=false`; `is_staff=null` remains unknown. Before production: freeze source writers, reconcile source balances/reservations/historical returns, approve a controlled opening migration, switch every authoritative reader to the ledger, provide a bounded-history capacity/archival strategy with preserved correctness, and complete manual acceptance. No production enablement is authorized by these QA results.
