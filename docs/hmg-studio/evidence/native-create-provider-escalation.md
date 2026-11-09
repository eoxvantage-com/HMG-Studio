# Native create authorization divergence — provider escalation

## Scope and reproducible result

- Site: `https://insurance.taruvi.cloud`; app: `hmg-studio`; policy scope: `insurance_hmg-studio`.
- Ordinary site principal: `qa_hmg_inbox_20261106`, assigned only `HMG Synthetic Operator`. No API-key fallback was used for the create probes.
- Resource: `datatable:customers`; native POST: `/api/apps/hmg-studio/datatables/customers/data/`.
- The exact JSON payload and ordinary-session responses are recorded in `native-create-zero-string-result.json`. Synthetic UUID: `ac82036c-7f82-574e-8606-de36246d010f`.
- Advisory `create` returned ALLOW for numeric zero and canonical zero string. Foreign organization, blank name, and negative credit limit returned DENY. Update/delete remained DENY.
- Native POST returned HTTP 403, `FORBIDDEN`, `Permission denied: 1 record(s) not authorized for creation`.
- Exact-ID readback returned HTTP 200 with zero records. No customer was created.

## Controls already checked

- Installed SDK 1.5.4 and deployed OpenAPI both specify a raw object (or object array), not a nested data envelope.
  - Installed `node_modules/@taruvi/sdk/dist/lib/database/DatabaseClient.js:169-170`: `create(body)` passes `body` unchanged to the POST operation; lines `267-268` call `httpClient.post(url, this.body)`.
  - `dist/lib-internal/http/HttpClient.js:99-101` passes that same body to Axios: `axiosInstance.post('/' + endpoint, body)`; it adds no `data` or `records` envelope and does not wrap a single object in an array.
  - `dist/lib-internal/routes/DatabaseRoutes.js:2-3` plus `DatabaseClient.js:249-255` resolve `/api/apps/hmg-studio/datatables/customers/data/`.
  - `DatabaseClient.d.ts:62` accepts `Partial<T> | Partial<T>[]` (also edge request arrays for the edge API). Thus single-record raw JSON used by the probe is the SDK wire shape. Bulk creation uses an array only when the caller supplies one.
- Advisory IDs `new`, `new:0`, and a concrete UUID all allowed the same valid raw payload.
- Missing, null, and numeric-zero credit-limit values were tested. The current stored `credit_limit` descriptor is `type:number` with **no default**.
- A separately approved diagnostic changed only the credit-limit condition to accept bounded canonical zero strings, while preserving organization/name/deletion restrictions, role, read rule, and update/delete denials.
- That diagnostic did not fix the native POST. It was rolled back, with exact original-policy readback verified in `customer-zero-string-policy-test.json`.
- Decimal-to-string conversion alone is therefore not a sufficient explanation. No further authorization broadening is planned.

## Provider investigation requested

Compare the actual authorization inputs and decision path for the advisory and native POST: principal ID/roles, scope, resource kind/version/ID, transformed proposed attributes, default/null handling, and cache/policy hash. Check whether native validation transforms UUID or numeric values before policy evaluation. Do not change application policies as a substitute for identifying the divergence.

Latest advisory request ID: `4f56b22c-6b51-4d7d-890d-4e01aead502b`. The native response did not expose a correlation ID in the captured body.

Additional sanitized evidence: `erp-normal-create-v3.json`, `native-create-advisory-normalization.json`, `native-create-explicit-defaults.json`, and `native-create-zero-string-result.json`. No credentials or session tokens are included.

This issue remains an ordinary-user native-write blocker. Admin schema changes and synthetic fixture writes do not prove ordinary-user CRUD authorization.
