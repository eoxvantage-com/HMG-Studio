# Shared contracts — platform.md

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

Read only the relevant sections for the active module; this file owns mixed-module registers and common rules. Return to [START HERE](../00_START_HERE.md).

- [Inventoros platform specification](#e0253)
- [Authority and handoff](#e0254)
- [P01 Foundation and shell](#e0255)
- [P04 Users/roles/permission sets](#e0258)
- [P06 Tokens/webhooks/shipping/storage](#e0260)
- [P07 Notifications/activity](#e0261)
- [Schedules](#e0264)
- [P14 Proposed acceptance tests — not executed](#e0272)
- [Evidence boundaries](#e0273)
- [Schedule detail not captured by simple validation-list reading](#e0275)
- [P16 Taruvi-native destination boundary](#e0276)
- [Coverage ledger and explicit gaps](#e0277)

<a id="e0253"></a>

> Audit provenance: `platform.md` lines 1–2. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

# Inventoros platform specification



<a id="e0254"></a>

> Audit provenance: `platform.md` lines 3–8. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Authority and handoff

Source root: `C:/Users/proj/Inventoros`. Use this explanation WITH the platform source contracts distributed across this pack, inventory and commerce specifications. The catalog is required: it records 87 platform Vue pages/shared controls/plugin views with exact field bindings/types/required attributes/limits/options/default expressions/table headers/displayed properties/action targets and source line evidence; 14 full request contracts; 46 controller validation/workflow excerpts; routes and report-source schemas. `props.*` defaults are existing server values, not invented constants. HTML requirements never replace server rules.

Evidence: source-derived only in this section. No source edits, tests/builds, server launches, imports, sends, backups, plugin mutations or tax issuance performed. Parent browser evidence is separate. Configured integrations do not prove delivery. Do not discard source catalog when handing to another implementation agent.



<a id="e0255"></a>

> Audit provenance: `platform.md` lines 9–16. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P01 Foundation and shell

Laravel/PHP controllers/services/Eloquent, Vue3/Inertia, Vite/Tailwind (`composer.json:12-27`, `package.json:22-45`, `resources/js/app.js:20-82`). React/TypeScript/Taruvi + Python-services rebuild must translate contracts rather than copy PHP/Vue.

Shell: organization/warehouse switchers, global search, notification dropdown, language, theme, account/logout, responsive sidebar/mobile focus-contained drawer. Menu `Layouts/AppLayout.vue:135-200`, filtering228-239, mobile lifecycle80-123. Exact shared controls cataloged. Tenant model OrganizationScope and auto-stamp `Models/Concerns/BelongsToOrganization.php:26-40`; scoped identity without org gets no rows `Models/Scopes/OrganizationScope.php:32-53`. This is Laravel application scoping, NOT proof of database RLS. Active organization is sent with writes (`resources/js/app.js:66-72`); stale tab must not write into a different selected organization.

Locales: en/es/fr/de/pt-BR/it/ja/ko/zh-CN/ar/ru/nl/tr/pl (`Http/Middleware/SetLocale.php:22-25`), including RTL. Organization regional settings own money/date formatting. Search, downloads and dashboards must enforce permissions and tenant context before serializing data.



<a id="e0258"></a>

> Audit provenance: `platform.md` lines 41–48. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P04 Users/roles/permission sets

Users pages Index/Create/Edit/Show. Index columns name,email,role,actions; exact filters in catalog. Show effective-permission search, role details, edit and delete confirmation; own-account delete prevented by UI and requires backend protections.

Create: name required string max255; email required email max255 globally unique users.email; password required confirmed Password::defaults(); password_confirmation; role required admin|manager|member(default member); role_ids nullable array(default []), each integer existing own-org or shared role. Edit preloads name/email/role/custom IDs; blank optional password is not a password overwrite. Exact contracts catalog Admin/User Store/Update requests. Permissions view_users/create_users/edit_users/delete_users (`routes/web/admin.php:29-37`). UserManagementService owns escalation and account changes; role select alone does not authorize admin escalation.

Role create: name required string max255; description nullable string; permissions nullable string array(default []); permission_set_ids nullable integer array referencing permission_sets(default []). Sets contribute inherited union. New role generated slug, organization, is_system:false (`Admin/RoleController.php:94-118`). Edit form contains name/description/direct permissions but NOT permission_set_ids (`Pages/Admin/Roles/Create.vue:20-25`,Edit.vue19-23)—do not promise set-editing parity. Show groups direct/effective permissions, sets and users. Preserve protected/system role restrictions. Route permissions view_roles/create_roles/edit_roles/delete_roles (`admin.php:39-47`). API PermissionSet contracts exist without a standalone sidebar CRUD screen; catalog includes them.



<a id="e0260"></a>

> Audit provenance: `platform.md` lines 59–68. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P06 Tokens/webhooks/shipping/storage

Token: name required max255(default''),abilities required nonempty distinct array of held permissions(default[]). Show newly created token ONCE with copy affordance; lists thereafter metadata only. Revoke own organization token, else404 (`Admin/ApiTokenController.php:52-100`). Never place live token in artifact.

Webhook: name required max255; url required URL max2048; events required nonempty allowed-event array; is_active boolean(defaulttrue). Request validator rejects local/metadata/private/reserved IP endpoints. Index/show modal edit; delivery history; create/edit/delete, secret rotate, test, retry. manage_organization. Dispatch queued, plugin events after commit (`WebhookService.php:33-62,125-131`). Provider failure remains failure.

Shipping settings: easypost_enabled/easypost_test_mode/notify_customers required booleans; easypost_api_key/easypost_test_api_key/easypost_webhook_secret optional max255 initialized blank. default_warehouse_id optional integer own org. from_address optional map name/company/street1/street2/city max255,state max100,zip max20,country size2,phone max50,email email max255. default_parcel weight_oz numeric0..100000,length_in/width_in/height_in0..10000. Additional enabled-mode credential cross-validation (`ShippingSettingsController.php:51-98`). Separate webhook-token rotation. External label purchase belongs commerce, not audit.

Storage: status/purpose mapping and check disk required string from FileStorageService purposes (`Admin/StorageSettingsController.php:18-29`). Not arbitrary filesystem access. Existing config isn't verified storage behavior; no storage check run.



<a id="e0261"></a>

> Audit provenance: `platform.md` lines 69–74. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P07 Notifications/activity

Notification stats/read-unread filters, type/title/message/time/read state/action link. Mark-one-read redirects to target only after successful write; confirm mark-all/delete/clear-read. Pending action serializes requests; explicit HTTP/network failure UI (`Pages/Notifications/Index.vue:29-91`). Backend constrains ownership.

Activity filters search,user_id,category,action,subject_type,date_from,date_to; security shortcut; expanded before/after values and recorded security context. Warning actions auth.failed/auth.lockout/two_factor.failed/two_factor.disabled/authz.denied/portal.failed. Permission view_activity_log. **Source asymmetry:** applyFilters sends search and subject_type but exportUrl omits both (`Pages/Admin/ActivityLog/Index.vue:34-68`). Record as parity decision/gap, do not promise matching export filters. Audit events not editable transaction rows.



<a id="e0264"></a>

> Audit provenance: `platform.md` lines 110–113. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Schedules

frequency required daily|weekly|monthly; day_of_week nullable/required weekly integer0..6; day_of_month nullable/required monthly1..31; time_of_day required H:i; format csv|xlsx|pdf; recipients required email array1..50 each max255. Normalize/dedupe emails. Only report owner manages; recipients must be organization members with source permissions, rechecked when sending (`ReportScheduleController.php:76-160`; `Models/ReportSchedule.php:40-42`). Scheduler, queue, mail require operational verification.



<a id="e0272"></a>

> Audit provenance: `platform.md` lines 162–179. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P14 Proposed acceptance tests — not executed

1. Login invalid/valid/throttle/session;2FA enable/challenge/recovery once;reset/verify with mail fixture.
2. Two organizations, same-looking records: detail/list/search/export/API/MCP scoped. Stale tab write rejected on org switch.
3. Permission-limited dashboard payload excludes money/PII; token cannot grant unheld ability; direct backend denial beyond hidden UI.
4. User uniqueness/roles/escalation/self-delete;protected role guards;edit blank password retention.
5. Independent settings saves retain unrelated keys;blank secret safe;locale/RTL/date/currency persist.
6. Widget preferences persist but do not grant data;currency totals isolated.
7. Webhook private/unreachable/failure/retry/postcommit delivery;attempt evidence accurate.
8. Reports filter/sort/chart/preview/save/share/export;revoked access;missing/backfilled cost;empty/capped/full datasets;ABC boundaries.
9. Schedule bad time/day/outsider/permission recipient rejected;send-time revocation enforced.
10. Imports MIME/size/malformed/missing headers/row conflicts/foreign SKU or role/partial failures/queue failure;historical zero stock+zero integration side effects.
11. Portal cross-customer/org access denied;non-delivered/excess/repeated return rejected;pending no stock;staff receipt expected effects.
12. Tax generic/India invalid GSTIN/region/HSN/totals/duplicate issue;issued snapshot PDF stable after master-data changes.
13. Plugin hook failure/deactivation/uninstall/update rollback/inactive-route denial/no orphan reservations;marketplace auth failure explicit.
14. Installer already-installed/nonempty reset/wrong DB/recovery;backup failure not success;restore traversal rejected.
15. Desktop/mobile/focus/table overflow/empty/loading/error/i18n/validation accessibility, separate screenshot and functional evidence.



<a id="e0273"></a>

> Audit provenance: `platform.md` lines 180–183. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Evidence boundaries

This handoff is narrative+exact source catalog+sibling modules, not a menu mockup. All mutation/permission/provider/queue/backup/API transport acceptance requires dedicated validation. No exhaustive test coverage, production readiness or security certification claimed. Where source UI behavior differs from backend (role-set editing, ActivityLog export filter asymmetry), preserve as an explicit rebuild decision, not silent correction.



<a id="e0275"></a>

> Audit provenance: `platform.md` lines 222–225. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Schedule detail not captured by simple validation-list reading

Schedule creation sets is_active=true. Update reads is_active boolean(default existing), recomputes next_run_at from now after timing change/resume so missed paused slots do not immediately fire. Child schedule must belong to selected report; owner + organization required (`ReportScheduleController.php:30-92`). This is in addition to the required timing/recipient fields above.



<a id="e0276"></a>

> Audit provenance: `platform.md` lines 226–229. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P16 Taruvi-native destination boundary

User-selected destination is **Taruvi native datatables and native storage, with Python backend services**, not a separate Supabase backend. Laravel tables/models/services are evidence of business contracts, not a mandate to copy the infrastructure. Map organization ownership/role permissions into confirmed Taruvi table/access contracts and Python service interfaces, move files/documents into native storage, and enforce all state-changing invariants in Python backend services. Confirm exact destination names/capabilities before implementation. Do not create a Supabase project/schema, seed records or write target data during this read-only audit. UI parity does not prove Taruvi transaction/locking/idempotency/authorization parity; those require explicit later verification.



<a id="e0277"></a>

> Audit provenance: `platform.md` lines 230–234. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Coverage ledger and explicit gaps

Platform page files: **70** (Dashboard1,Admin10,Auth8,Profile4,Settings11,Install5,ImportExport1,Reports17,Portal10,Plugins1,Notifications1,Errors1), plus **8** shared platform controls and **9** bundled plugin Vue files =87 frontend evidence entries. Repository-wide inventory:123 page files,67 shared components,76 request files,107 controllers,13 route files. Every platform page appears in source catalog, including non-form/error pages. Additional exact API routes/MCP tools/GraphQL registry/Permission enum and owner-level importer/tax-invoice/report code are attached as source contracts.

Coverage is **exhaustive file/control inventory for the owned platform page set**, NOT a claim every runtime branch, plugin extension supplied in future, derived SQL formula, external provider protocol or all API request combinations was behaviorally verified. Source extraction isn't test execution. API routes/catalog schemas establish advertised operations only; permission enforcement/JSON schema compatibility/live MCP/GraphQL/REST calls remain unverified. Parent source+browser+inventory+commerce consolidation must retain that distinction. No records created, no mutations tested, no production integrations exercised.
