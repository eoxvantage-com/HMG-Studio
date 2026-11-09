# 29. Activity Log — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Activity Log as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Actor/category/action/subject/date/search filters; security events; before/after expansion; export; append-only event history.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Authentication, Profile and Account](../modules/32_auth_account.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Admin/ActivityLog/Index.vue` | Pending | Pending |

The exact target filenames and schema identifiers must be filled from destination discovery. These are intentionally not guessed from the Vue/PHP source. A missing target map blocks the relevant implementation task; it does not authorize a placeholder.

## Implementation tasks

1. **Audit/reuse:** inspect the current HMG-Studio module, existing React components, Refine providers and Python service boundaries. Record exact target files to modify/create/test; extend existing owners instead of duplicating them.
2. **Confirm schema/contracts:** map source fields and relationships to explicitly app-scoped Taruvi metadata. Record types, nullability, defaults, uniqueness, tenant/warehouse/customer keys, read/write policies and storage ownership. Define exact Python request/response/error contracts and which facts are server-derived.
3. **Write failing contract tests:** use each source validator/default/state transition below and the module acceptance assertions. Confirm the tests fail for the intended missing behavior, not setup failure. Name each test and affected target file in the ledger before coding.
4. **Implement Python authority:** validate verified caller scope; use parameterized/provider-native data access; compute authoritative values; enforce lifecycle and transactional effects. Return field errors, conflict/forbidden outcomes and committed identities without false success.
5. **Implement the React/Refine views:** reproduce evidenced forms, tables, filters, dialogs and actions using existing UI primitives. Wire queries/mutations to the confirmed service contract; refresh related records and dependent totals after commit.
6. **Review and verify:** security/duplication review first, then run focused tests and authorized integration checks; exercise the entire browser workflow and reload/readback. Record commands, results, record IDs and before/after facts without secrets. Test production-like transaction failure and retries where this module writes stock or money.
7. **Finish the handoff:** update page/field/action coverage, documentation and the persistent progress ledger. List verified, remaining and blocked separately. Do not commit/push/deploy without the execution task's authorization.

## Module-specific acceptance assertions — not yet executed

- [ ] Relevant mutations record actor/tenant/subject and outcomes.
- [ ] users cannot edit audit events.
- [ ] field redaction follows policy.
- [ ] source export omission of search/subject_type is an explicit parity decision rather than an undocumented fix.

## Common acceptance gates

- [ ] Every evidenced page, nested modal/drawer/tab, field, default, option source, conditional requirement, view column, filter, action and transition has a target mapping.
- [ ] Server validation and authorization reject invalid/foreign IDs even if the browser is bypassed. UI validation is not the trust boundary.
- [ ] Successful save is followed by fresh readback and reload; failure does not display success. Preserve meaningful null/blank/zero/false differences.
- [ ] Decimal money, quantity precision, dates/timezones and currency boundaries follow the source contract; authoritative calculations run in Python.
- [ ] Loading, empty, filtered-empty, error/retry, permission-denied, keyboard/focus and narrow-screen states work.
- [ ] Security review precedes execution of the verification suite; then local tests, backend integration checks and browser acceptance each have recorded results.
- [ ] Update the parity ledger, record unresolved source/target differences, and document the exact next action. Do not claim full completion from a passing build.

## Evidence reading rules

The source contracts below are authoritative for parity, not for target infrastructure. `props`, Vue form state and PHP request/model code must be translated into equivalent React/Python behavior. A database column is not automatically an editable field. List and edit defaults can differ. An inherited API validator may reuse a parent web contract; follow both. Source anomalies require an explicit decision, not silent correction.

Shared route/permission registers, mixed-module relationships, generic UI primitives and global invariants are retained once rather than duplicated:

- [inventory.md](../shared/inventory.md)
- [commerce.md](../shared/commerce.md)
- [platform.md](../shared/platform.md)
- [platform-source-catalog.md](../shared/platform-source-catalog.md)
- [shared-gaps.md](../shared/shared-gaps.md)
- [additional-contracts.md](../shared/additional-contracts.md)

### Detailed evidence index

- [`resources/js/Pages/Admin/ActivityLog/Index.vue`](#e0297)
- [`app/Http/Controllers/Admin/ActivityLogController.php`](#e0384)
- [`app/Enums/SecurityEvent.php`](#e0508)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0297"></a>

> Audit provenance: `platform-source-catalog.md` lines 365–435. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/ActivityLog/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Admin/ActivityLog/Index.vue:205`: `<input id="search" v-model="search" type="text" :placeholder="t('admin.activityLog.searchPlaceholder')" />`
- `resources/js/Pages/Admin/ActivityLog/Index.vue:218`: `<select id="user_id" v-model="user_id">`
- `resources/js/Pages/Admin/ActivityLog/Index.vue:227`: `<select id="category" v-model="category">`
- `resources/js/Pages/Admin/ActivityLog/Index.vue:236`: `<select id="action" v-model="action">`
- `resources/js/Pages/Admin/ActivityLog/Index.vue:245`: `<select id="subject_type" v-model="subject_type">`
- `resources/js/Pages/Admin/ActivityLog/Index.vue:254`: `<input id="date_from" v-model="date_from" type="date" />`
- `resources/js/Pages/Admin/ActivityLog/Index.vue:260`: `<input id="date_to" v-model="date_to" type="date" />`

**Select option values/labels (dynamic options retain their source):**
```html
219: <option value="">{{ t('admin.activityLog.allUsers') }}</option>
220: <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
228: <option value="">{{ t('admin.activityLog.allCategories') }}</option>
229: <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
237: <option value="">{{ t('admin.activityLog.allActions') }}</option>
238: <option v-for="act in actionOptions" :key="act.value" :value="act.value">{{ act.label }}</option>
246: <option value="">{{ t('common.allTypes') }}</option>
247: <option v-for="type in subjectOptions" :key="type.value" :value="type.value">{{ type.label }}</option>
```

**Visible table headers:**
```text
344: {{ t('admin.activityLog.field') }}
345: {{ t('stockAdjustments.show.stockBefore') }}
346: {{ t('stockAdjustments.show.stockAfter') }}
```

**View filters, permission/action and navigation anchors:**
```js
27: const search = ref(props.filters.search || '');
28: const user_id = ref(props.filters.user_id || '');
29: const category = ref(props.filters.category || '');
30: const action = ref(props.filters.action || '');
31: const subject_type = ref(props.filters.subject_type || '');
32: const date_from = ref(props.filters.date_from || '');
33: const date_to = ref(props.filters.date_to || '');
36: router.get(route('activity-log.index'), {
58: router.get(route('activity-log.index'));
69: return route('activity-log.export') + '?' + params.toString();
84: const actionOptions = computed(() =>
87: const subjectOptions = computed(() =>
111: .filter(([, value]) => value !== null && value !== '' && !(Array.isArray(value) && value.length === 0))
```

**Displayed data/value expressions:**
```text
220: user.name
229: cat.label
238: act.label
247: type.label
300: activity.description
304: activity.user?.name || t('admin.activityLog.unknownUser')
307: actionLabel(activity.action)
313: subjectTypeLabel(activity.subject_type)
315: activity.ip_address
326: formatFieldName(detail.field)
327: formatValue(detail.value)
330: activity.user_agent
351: formatFieldName(change.field)
353: formatValue(change.old)
356: formatValue(change.new)
368: formatRelativeTime(activity.created_at)
369: formatDate(activity.created_at)
388: activities.from
389: activities.to
390: activities.total
```



<a id="e0384"></a>

> Audit provenance: `platform-source-catalog.md` lines 3735–3747. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/ActivityLogController.php`
```php
29:     public function index(Request $request): Response
31:         $query = ActivityLog::query()
80:         $actions = ActivityLog::forOrganization($request->user()->organization_id)
85:         $subjectTypes = ActivityLog::forOrganization($request->user()->organization_id)
89:             ->map(function ($type) {
96:         return Inertia::render('Admin/ActivityLog/Index', [
100:                 ['value' => ActivityLog::CATEGORY_AUDIT, 'label' => 'Record changes'],
101:                 ['value' => ActivityLog::CATEGORY_SECURITY, 'label' => 'Security'],
116:     public function export(Request $request)
```



<a id="e0508"></a>

> Audit provenance: `additional-contracts.md` lines 1660–1758. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Enums/SecurityEvent.php`

[Source evidence](C:/Users/proj/Inventoros/app/Enums/SecurityEvent.php#L1). SHA-256: `7de3802c52d5d8006d54d732c356d00ab5edf2b6865bdaa86fb916044bf7969a`.

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Enums;
6: 
7: /**
8:  * Security-relevant events recorded to the activity log.
9:  *
10:  * Every entry is written with `category = security` so the activity log page
11:  * can separate the security audit trail from ordinary record changes. The
12:  * enum value is stored in the `action` column.
13:  */
14: enum SecurityEvent: string
15: {
16:     public const CATEGORY = 'security';
17: 
18:     case LOGIN = 'auth.login';
19:     case LOGOUT = 'auth.logout';
20:     case LOGIN_FAILED = 'auth.failed';
21:     case LOCKOUT = 'auth.lockout';
22:     case PASSWORD_RESET_REQUESTED = 'auth.password_reset_requested';
23:     case PASSWORD_RESET = 'auth.password_reset';
24:     case TWO_FACTOR_ENABLED = 'two_factor.enabled';
25:     case TWO_FACTOR_DISABLED = 'two_factor.disabled';
26:     case TWO_FACTOR_FAILED = 'two_factor.failed';
27:     case API_TOKEN_CREATED = 'api_token.created';
28:     case API_TOKEN_REVOKED = 'api_token.revoked';
29:     case PERMISSION_DENIED = 'authz.denied';
30:     case USER_CREATED = 'user.created';
31:     case USER_ROLE_CHANGED = 'user.role_changed';
32:     case USER_ROLES_SYNCED = 'user.roles_synced';
33:     case ROLE_CREATED = 'role.created';
34:     case ROLE_UPDATED = 'role.updated';
35:     case ROLE_DELETED = 'role.deleted';
36:     case PORTAL_LOGIN = 'portal.login';
37:     case PORTAL_LOGIN_FAILED = 'portal.failed';
38:     case PORTAL_INVITE_SENT = 'portal.invite_sent';
39:     case PORTAL_ACCESS_REVOKED = 'portal.access_revoked';
40:     case ORGANIZATION_SWITCHED = 'organization.switched';
41:     case MEMBERSHIP_ADDED = 'membership.added';
42:     case MEMBERSHIP_ROLE_CHANGED = 'membership.role_changed';
43:     case MEMBERSHIP_REMOVED = 'membership.removed';
44: 
45:     /**
46:      * Human-readable label for display.
47:      */
48:     public function label(): string
49:     {
50:         return match ($this) {
51:             self::LOGIN => 'Signed in',
52:             self::LOGOUT => 'Signed out',
53:             self::LOGIN_FAILED => 'Failed sign-in',
54:             self::LOCKOUT => 'Sign-in locked out',
55:             self::PASSWORD_RESET_REQUESTED => 'Password reset requested',
56:             self::PASSWORD_RESET => 'Password reset completed',
57:             self::TWO_FACTOR_ENABLED => 'Two-factor enabled',
58:             self::TWO_FACTOR_DISABLED => 'Two-factor disabled',
59:             self::TWO_FACTOR_FAILED => 'Two-factor challenge failed',
60:             self::API_TOKEN_CREATED => 'API token created',
61:             self::API_TOKEN_REVOKED => 'API token revoked',
62:             self::PERMISSION_DENIED => 'Permission denied',
63:             self::USER_CREATED => 'User created',
64:             self::USER_ROLE_CHANGED => 'User role changed',
65:             self::USER_ROLES_SYNCED => 'User custom roles changed',
66:             self::ROLE_CREATED => 'Role created',
67:             self::ROLE_UPDATED => 'Role updated',
68:             self::ROLE_DELETED => 'Role deleted',
69:             self::PORTAL_LOGIN => 'Customer portal sign-in',
70:             self::PORTAL_LOGIN_FAILED => 'Failed customer portal sign-in',
71:             self::PORTAL_INVITE_SENT => 'Customer portal invitation sent',
72:             self::PORTAL_ACCESS_REVOKED => 'Customer portal access revoked',
73:             self::ORGANIZATION_SWITCHED => 'Switched organization',
74:             self::MEMBERSHIP_ADDED => 'Organization member added',
75:             self::MEMBERSHIP_ROLE_CHANGED => 'Organization member role changed',
76:             self::MEMBERSHIP_REMOVED => 'Organization member removed',
77:         };
78:     }
79: 
80:     /**
81:      * Label/value pairs for front-end filter options.
82:      *
83:      * @return array<int, array{value: string, label: string}>
84:      */
85:     public static function options(): array
86:     {
87:         return array_map(
88:             fn (self $c) => ['value' => $c->value, 'label' => $c->label()],
89:             self::cases()
90:         );
91:     }
92: }
```

