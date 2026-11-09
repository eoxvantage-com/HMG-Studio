# Native account preferences execution slice

User decision: retain the existing Taruvi backend/functions and Refine template. No alternate database or server. Full module scope remains unchanged.

This Phase 1 task implements the native self-service date/time/timezone portion of account settings. It does not complete module 32, replace organization regional settings, or implement source notification/language/auto-theme preferences.

## Audit and contracts

- Reuse the SDK singleton, app provider, Refine notifications, PageContainer, authenticated route, and Navkit profile-menu extension.
- Native Python SDK owner: `sdk_client.users.get_preferences()` / `update_preferences(partial_dict)`. No custom identity table. User identity is resolved by the injected client, never by request parameters.
- Existing remote catalog/contact validators are unrelated; do not duplicate or modify them.
- New source owner: `backend/functions/account_preferences.py`; tests `backend/tests/test_account_preferences.py`.
- New private synchronous native function: `hmg-account-preferences-v1`, only after collision inspection. Function registration is authorized backend work; no frontend deployment.
- Input: empty object or `{action:"get"}`; update `{action:"update",values:{date_format?,time_format?,timezone?}}`. Reject caller identity/organization/role fields and unsupported preference fields. Permit runtime `__function__` metadata without trusting it.
- Result: `{ok:true,preferences:{date_format,time_format,timezone},verified:true}` after a successful native read. Errors carry a stable code/field errors; failed post-write verification must not claim success or repeat a write automatically.
- Native formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, DD-MMM-YYYY; 24h/12h; IANA timezone. Preserve theme, widget_config and all other account data by omitting them from writes.
- UI files: `src/pages/account/index.tsx`, its test, and `src/services/accountPreferences.ts` with its test. Modify `src/App.tsx`, existing profile-menu hook and route tests.
- The service adapter calls existing `taruviAppProvider.custom` with provider payload/meta; use a narrow custom-operation adapter through the existing provider, not a new auth/data stack.

## Tasks

- [x] Python failing tests: anonymous/foreign-field denial, formats/timezones, projection, partial update, readback mismatch/failure, backend error redaction.
- [x] Implement native function and run pytest after security review.
- [x] Register private function; inspect response; execute only validation-only requests or approved dedicated-QA identity operations. Do not read/write existing users' preferences with the admin key (first GET can create a record).
- [x] Frontend failing tests; implement live load/edit/cancel/save/readback, inline errors, Refine notification, protected route and menu. No fake successful saves.
- [ ] Security/duplication review, full Vitest/typechecks/pytest, independent review, durable evidence. Browser requires existing running URL/session; do not start dev/build.

## Evidence boundaries

Local stubs are not live session or policy proof. QA identities require native least-privilege roles; never fall back to Super Admin. Creating a new QA role does not authorize replacing the existing business deny policies. Stock/payment posting still requires its own verified guarantees; it does not block this independent single-record native preference operation.

## Verification checkpoint (2026-11-06)

- Local: 39 Vitest tests in 7 files, frontend/config typechecks, 23 pytest tests and diff check pass.
- Independent reviewer found reconnect data loss and interactive pending MUI selectors. Both reproduced with failing tests then fixed; focused 10/10 and full suite pass.
- Private native function version 4: QA login, read, partial timezone update and fresh readback passed; other native preference fields preserved. Anonymous function and QA organization access returned 403.
- Browser: user started localhost:5173; direct native Chrome observation confirms the starter home remains. Account form browser workflow is not yet verified.
- Native hosted logout navigates to a new document; Refine itself does not clear all preference queries. Two-account back/forward cache behavior remains untested.
- Ruling: this is partial module32 only, not a substitute for the business app. Proceed with Categories authority/schema, then catalog screens. No business module is complete.
