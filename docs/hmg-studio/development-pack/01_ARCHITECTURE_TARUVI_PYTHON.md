# Architecture: Taruvi + Python services; no Laravel

## Binding product decision

The new HMG-Studio application uses the existing React/TypeScript/Refine frontend and Taruvi-native data, storage and identity/access controls. **Python services own backend validation, calculations and workflows.** Do not deliver Laravel, PHP, Eloquent, Artisan, a PHP installer, or a separate Supabase backend. The historical audit describes how the reference app works; it does not prescribe its runtime.

```text
React / Refine
    | authenticated request with verified identity context
    v
Python service boundary: permissions + validation + business commands
    | confirmed Taruvi API/SDK; transaction primitive where required
    +--> Taruvi datatables / native access policies
    +--> Taruvi storage (authorized object references)
    +--> approved email / carrier integrations
    +--> durable scheduled/background processing where verified
```

This is the required logical architecture, not a claim about an available Taruvi Python hosting service. First verify whether the selected Taruvi environment can host the required Python runtime. If not, propose and obtain approval for a separately hosted Python service connected through documented Taruvi interfaces. Do not quietly replace Python business services with JavaScript functions. Taruvi-native function wrappers may be used only as an explicitly approved integration bridge, not a second business-rule owner.

## Ownership rules

| Concern | Owner / required behavior |
|---|---|
| Identity | Native identity provider; Python validates caller/session/token using confirmed provider contracts. Never trust a caller-supplied organization or role without membership/policy checks. |
| Frontend | React/Refine for views, forms, interaction state and query invalidation. Do not assume its default data provider safely implements compound business commands. |
| Validation/calculation | Python service boundary. Mirror helpful checks in browser; server remains authoritative. |
| Ordinary data | Taruvi datatables with confirmed schema and row/object access enforcement; typed mapping layer rather than raw table calls scattered through components. |
| Stock | One Python-owned command boundary for opening stock, adjustment, receipt, order effects, return receipt, transfer and work-order completion. All use the same identity, balance and ledger rules. |
| Payments | Python-owned ledger and totals; historical payment/refund/void entries preserved. No invented bank processing. |
| Storage | Taruvi objects with tenant ownership, purpose, content constraints, durable object identity and authorized download. Never store secrets or expiring URLs as permanent document identifiers. |
| External delivery | Durable committed event/retry identity; only after business commit. A notification queued is not proof of email/carrier delivery. |
| Reporting | Permission-aware Python projections and source-derived totals, preserving currency and filter semantics. |
| Audit | Server-recorded actor/organization/subject/change/outcome; ordinary clients cannot rewrite audit history. |

## Non-negotiable capability gates

- **Python hosting:** verify supported runtime, dependency installation, networking, secrets, logs, timeouts, deployment and health checks. Runtime choice remains unconfirmed until evidence is recorded.
- **Transactions:** confirm a native transaction/atomic command facility can commit all affected documents, stock balances and ledger entries together. Independent HTTP updates plus a Python lock are not a cross-process transaction.
- **Concurrency:** prove the supported conditional-write/locking/revision contract and idempotent retry behavior. If unavailable, block affected stock/payment posting and request an architecture decision; do not claim consistency from happy-path tests.
- **Authorization:** confirm policy enforcement across browser reads, Python writes, exports and direct datatable access. Elevated credentials stay server-side; they do not excuse missing tenant checks.
- **Workers/schedules:** confirm durable retry, deduplication, timeout and schedule ownership for imports, reports, notifications, cycle counts and webhooks. Do not use request-local timers as durable jobs.

## PHP/Vue-to-target translation

| Reference artifact | Target equivalent |
|---|---|
| Vue page / Inertia form | Existing React/Refine page, form and typed query/mutation boundary |
| Laravel FormRequest | Python request validation plus source-equivalent business validation |
| Controller / service | Python endpoint/application command with explicit permission and transaction boundary |
| Eloquent relationship/cast/migration | Confirmed Taruvi field/relation/type/index/policy map; no ORM name assumed |
| Laravel middleware/session/Sanctum | Confirmed native identity/token verification and Python authorization |
| Queue / scheduler | Verified durable worker/scheduling mechanism executing Python commands |
| PHP plugin / installer / updater | Explicit approved native/Python equivalent or blocker; never uploaded PHP execution |

No exact Python web framework, file layout or SDK signature is asserted by this pack. Inspect the current destination first and document those decisions in the schema/service contract ledger. Do not install a new framework merely because it is popular.
