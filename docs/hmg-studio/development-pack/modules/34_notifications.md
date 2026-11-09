# 34. Notifications — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Notifications as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Notification list/dropdown; read/unread/type state; mark one/all; delete/clear read; action navigation; preferences.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Authentication, Profile and Account](../modules/32_auth_account.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Notifications/Index.vue` | Pending | Pending |

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

- [ ] Only owner notifications are readable/mutable.
- [ ] mark-read completes before redirect.
- [ ] errors remain visible and retryable.
- [ ] duplicate clicks do not race state.
- [ ] delivery evidence distinguishes in-app creation from email delivery.

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

- [`resources/js/Components/Layout/NotificationDropdown.vue`](#e0291)
- [`resources/js/Pages/Notifications/Index.vue`](#e0323)
- [`app/Http/Controllers/Auth/EmailVerificationNotificationController.php`](#e0397)
- [`app/Http/Controllers/NotificationController.php`](#e0407)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0291"></a>

> Audit provenance: `platform-source-catalog.md` lines 213–248. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Components/Layout/NotificationDropdown.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
11: const unreadCount = ref(0);
12: const notificationsOpen = ref(false);
13: const notifications = ref([]);
14: const loadingNotifications = ref(false);
15: const loadError = ref(false);
16: const actionError = ref(false);
17: const pendingAction = ref(null);
18: const trigger = ref(null);
19: const dropdown = ref(null);
30: unreadRequest = axios.get(route('notifications.unread-count'), { signal: requests.signal })
45: recentRequest = axios.get(route('notifications.index'), {
66: if (!disposed && !axios.isCancel(error)) loadError.value = true;
107: // A separate Axios redirect followed by router.visit loads the destination twice.
108: router.post(route('notifications.mark-as-read', notification.id), {}, {
119: await axios.post(route('notifications.mark-as-read', notification.id), {}, { signal: requests.signal });
123: notifications.value = notifications.value.filter(({ id }) => id !== notification.id);
127: if (!disposed && !axios.isCancel(error)) actionError.value = true;
139: await axios.post(route('notifications.mark-all-read'), {}, { signal: requests.signal });
146: if (!disposed && !axios.isCancel(error)) actionError.value = true;
```

**Displayed data/value expressions:**
```text
232: unreadCount > 9 ? '9+' : unreadCount
311: notification.title
312: notification.message
313: formatDate(notification.created_at)
```



<a id="e0323"></a>

> Audit provenance: `platform-source-catalog.md` lines 1251–1281. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Notifications/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
29: const pendingAction = ref(null);
30: const actionError = ref(null);
56: router.get(route('notifications.index'), { filter }, visitOptions(`filter:${filter}`));
61: router.post(route('notifications.mark-as-read', notification.id), {}, visitOptions(`read:${notification.id}`));
69: else router.visit(notification.action_url);
74: if (confirm(t('notifications.confirmMarkAllRead'))) {
75: router.post(route('notifications.mark-all-read'), {}, visitOptions('all'));
81: if (confirm(t('notifications.confirmDelete'))) {
82: router.delete(route('notifications.destroy', notification.id), visitOptions(`delete:${notification.id}`));
88: if (confirm(t('notifications.confirmClearRead'))) {
89: router.delete(route('notifications.clear-read'), visitOptions('clear'));
```

**Displayed data/value expressions:**
```text
172: stats.total
176: stats.unread
180: stats.read
219: notification.title
222: notification.message
226: notification.priority && t(`notifications.priorities.${notification.priority}`)
232: formatDate(notification.created_at)
```



<a id="e0397"></a>

> Audit provenance: `platform-source-catalog.md` lines 3975–3979. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/EmailVerificationNotificationController.php`
```php
24:     public function store(Request $request): RedirectResponse
```



<a id="e0407"></a>

> Audit provenance: `platform-source-catalog.md` lines 4250–4265. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/NotificationController.php`
```php
27:     public function index(Request $request): Response
52:         return Inertia::render('Notifications/Index', [
65:     public function unreadCount(Request $request): \Illuminate\Http\JsonResponse
84:     public function markAsRead(Request $request, Notification $notification): RedirectResponse
95:         abort_if((int) $notification->organization_id !== (int) $user->organization_id, 404);
113:     public function markAllAsRead(Request $request): RedirectResponse
120:             ->update(['read_at' => now()]);
132:     public function destroy(Request $request, Notification $notification): RedirectResponse
143:         abort_if((int) $notification->organization_id !== (int) $user->organization_id, 404);
145:         $notification->delete();
156:     public function clearRead(Request $request): RedirectResponse
163:             ->delete();
```

