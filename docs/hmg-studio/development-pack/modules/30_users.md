# 30. Admin Users — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Admin Users as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Create/edit/list/detail; invitation/reset; role assignment; active state; warehouse assignments and protected self/admin rules.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Authentication, Profile and Account](../modules/32_auth_account.md), [Warehouses](../modules/20_warehouses.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Admin/Users/Create.vue` | Pending | Pending |
| `resources/js/Pages/Admin/Users/Edit.vue` | Pending | Pending |
| `resources/js/Pages/Admin/Users/Index.vue` | Pending | Pending |
| `resources/js/Pages/Admin/Users/Show.vue` | Pending | Pending |

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

- [ ] Cannot grant unheld privileges or cross-tenant roles.
- [ ] edit blank password retains existing credential.
- [ ] self/protected deletion restrictions work.
- [ ] invitation delivery is separately classified from account creation.

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

- [`resources/js/Pages/Admin/Users/Create.vue`](#e0303)
- [`resources/js/Pages/Admin/Users/Edit.vue`](#e0304)
- [`resources/js/Pages/Admin/Users/Index.vue`](#e0305)
- [`resources/js/Pages/Admin/Users/Show.vue`](#e0306)
- [`app/Http/Requests/Admin/User/StoreUserRequest.php`](#e0370)
- [`app/Http/Requests/Admin/User/UpdateUserRequest.php`](#e0371)
- [`app/Http/Requests/Api/User/StoreUserRequest.php`](#e0376)
- [`app/Http/Requests/Api/User/UpdateUserRequest.php`](#e0377)
- [`app/Http/Controllers/Admin/UserController.php`](#e0394)
- [`app/Http/Controllers/Auth/RegisteredUserController.php`](#e0402)
- [`app/Services/UserManagementService.php`](#e0450)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0303"></a>

> Audit provenance: `platform-source-catalog.md` lines 609–653. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/Users/Create.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Admin/Users/Create.vue:68`: `<input id="name" v-model="form.name" type="text" required autofocus autocomplete="name" />`
- `resources/js/Pages/Admin/Users/Create.vue:83`: `<input id="email" v-model="form.email" type="email" required autocomplete="username" />`
- `resources/js/Pages/Admin/Users/Create.vue:97`: `<input id="password" v-model="form.password" type="password" required autocomplete="new-password" />`
- `resources/js/Pages/Admin/Users/Create.vue:112`: `<input id="password_confirmation" v-model="form.password_confirmation" type="password" required autocomplete="new-password" />`
- `resources/js/Pages/Admin/Users/Create.vue:126`: `<select id="role" v-model="form.role" required >`
- `resources/js/Pages/Admin/Users/Create.vue:151`: `<input type="checkbox" :value="role.id" v-model="form.role_ids" />`

**Form initial state/defaults:**
```js
18: const form = useForm({
19:     name: '',
20:     email: '',
21:     password: '',
22:     password_confirmation: '',
23:     role: 'member',
24:     role_ids: [],
25: });
```

**Select option values/labels (dynamic options retain their source):**
```html
132: <option value="member">{{ t('admin.users.create.member') }}</option>
133: <option value="manager">{{ t('admin.users.create.manager') }}</option>
134: <option value="admin">{{ t('admin.users.create.administrator') }}</option>
```

**View filters, permission/action and navigation anchors:**
```js
28: form.post(route('users.store'), {
```

**Displayed data/value expressions:**
```text
77: form.errors.name
91: form.errors.email
105: form.errors.password
120: form.errors.password_confirmation
136: form.errors.role
158: roleName(role, i18n)
159: roleDescription(role, i18n)
```



<a id="e0304"></a>

> Audit provenance: `platform-source-catalog.md` lines 654–700. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/Users/Edit.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Admin/Users/Edit.vue:68`: `<input id="name" v-model="form.name" type="text" required autofocus />`
- `resources/js/Pages/Admin/Users/Edit.vue:82`: `<input id="email" v-model="form.email" type="email" required />`
- `resources/js/Pages/Admin/Users/Edit.vue:95`: `<input id="password" v-model="form.password" type="password" autocomplete="new-password" />`
- `resources/js/Pages/Admin/Users/Edit.vue:111`: `<input id="password_confirmation" v-model="form.password_confirmation" type="password" autocomplete="new-password" />`
- `resources/js/Pages/Admin/Users/Edit.vue:124`: `<select id="role" v-model="form.role" required >`
- `resources/js/Pages/Admin/Users/Edit.vue:154`: `<input type="checkbox" :value="role.id" v-model="form.role_ids" />`

**Form initial state/defaults:**
```js
20: const form = useForm({
21:     name: props.user.name,
22:     email: props.user.email,
23:     password: '',
24:     password_confirmation: '',
25:     role: props.user.role,
26:     role_ids: props.user.roles ? props.user.roles.map(r => r.id) : [],
27: });
```

**Select option values/labels (dynamic options retain their source):**
```html
130: <option value="">{{ t('admin.users.edit.selectRole') }}</option>
131: <option value="admin">{{ t('admin.users.edit.admin') }}</option>
132: <option value="manager">{{ t('admin.users.create.manager') }}</option>
133: <option value="member">{{ t('admin.users.create.member') }}</option>
```

**View filters, permission/action and navigation anchors:**
```js
30: form.put(route('users.update', props.user.id));
```

**Displayed data/value expressions:**
```text
76: form.errors.name
89: form.errors.email
102: form.errors.password
118: form.errors.password_confirmation
135: form.errors.role
161: roleName(role, i18n)
162: roleDescription(role, i18n)
170: form.errors.role_ids
```



<a id="e0305"></a>

> Audit provenance: `platform-source-catalog.md` lines 701–722. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/Users/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
54: {{ t('common.name') }}
55: {{ t('common.email') }}
56: {{ t('admin.users.role') }}
57: {{ t('common.actions') }}
```

**Displayed data/value expressions:**
```text
80: user.name
83: user.email
101: users.from
102: users.to
103: users.total
```



<a id="e0306"></a>

> Audit provenance: `platform-source-catalog.md` lines 723–760. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/Users/Show.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Admin/Users/Show.vue:131`: `<input id="permission-search" v-model="permissionSearch" type="search" />`

**Form initial state/defaults:**
```js
29: const deleteForm = useForm({});
```

**View filters, permission/action and navigation anchors:**
```js
17: const { canVisit, hasPermission } = usePermissions();
28: const showDeleteModal = ref(false);
30: const deleting = computed(() => deleteForm.processing);
31: const isOwnAccount = computed(() => props.user.id === page.props.auth.user.id);
33: const permissionSearch = ref('');
34: const filteredPermissions = computed(() => Object.entries(props.permissions)
35: .map(([category, permissions]) => [category, permissions.filter((permission) =>
39: .filter(([, permissions]) => permissions.length));
42: if (deleting.value || isOwnAccount.value || !hasPermission('delete_users')) return;
43: deleteForm.delete(route('users.destroy', props.user.id), {
```

**Displayed data/value expressions:**
```text
67: user.name
95: user.name
100: user.email
119: roleName(role, i18n)
135: permissionCategoryLabel(category, i18n)
138: permissionLabel(permission, i18n)
155: user.organization.name
160: user.organization.address
177: displayDate(user.created_at)
184: displayDate(user.updated_at)
```



<a id="e0370"></a>

> Audit provenance: `platform-source-catalog.md` lines 3139–3176. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Admin/User/StoreUserRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Admin\User;
6: 
7: use Illuminate\Database\Query\Builder;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: use Illuminate\Validation\Rules\Password;
11: 
12: /**
13:  * Validates creating a user and limits custom roles to the active
14:  * organization or shared system roles.
15:  */
16: final class StoreUserRequest extends FormRequest
17: {
18:     /**
19:      * @return array<string, mixed>
20:      */
21:     public function rules(): array
22:     {
23:         return [
24:             'name' => 'required|string|max:255',
25:             'email' => 'required|email|max:255|unique:users,email',
26:             'password' => ['required', 'confirmed', Password::defaults()],
27:             'role' => 'required|in:admin,manager,member',
28:             'role_ids' => 'nullable|array',
29:             'role_ids.*' => ['integer', Rule::exists('roles', 'id')->where(
30:                 fn (Builder $query) => $query->where('organization_id', $this->user()->organization_id)->orWhereNull('organization_id')
31:             )],
32:         ];
33:     }
34: }
```



<a id="e0371"></a>

> Audit provenance: `platform-source-catalog.md` lines 3177–3218. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Admin/User/UpdateUserRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Admin\User;
6: 
7: use App\Models\User;
8: use Illuminate\Database\Query\Builder;
9: use Illuminate\Foundation\Http\FormRequest;
10: use Illuminate\Validation\Rule;
11: use Illuminate\Validation\Rules\Password;
12: 
13: /**
14:  * Validates updating a user, including tenant-scoped custom roles.
15:  * The password is optional and email uniqueness ignores the bound user.
16:  */
17: final class UpdateUserRequest extends FormRequest
18: {
19:     /**
20:      * @return array<string, mixed>
21:      */
22:     public function rules(): array
23:     {
24:         /** @var User $user */
25:         $user = $this->route('user');
26: 
27:         return [
28:             'name' => 'required|string|max:255',
29:             'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
30:             'password' => ['nullable', 'confirmed', Password::defaults()],
31:             'role' => 'required|in:admin,manager,member',
32:             'role_ids' => 'nullable|array',
33:             'role_ids.*' => ['integer', Rule::exists('roles', 'id')->where(
34:                 fn (Builder $query) => $query->where('organization_id', $this->user()->organization_id)->orWhereNull('organization_id')
35:             )],
36:         ];
37:     }
38: }
```



<a id="e0376"></a>

> Audit provenance: `platform-source-catalog.md` lines 3378–3418. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/User/StoreUserRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\User;
6: 
7: use Illuminate\Database\Query\Builder;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: use Illuminate\Validation\Rules\Password;
11: 
12: /**
13:  * Validates creating a user via the REST API. Same fields as the web form;
14:  * custom roles must be the caller's organization's own or system roles. The
15:  * escalation guards themselves live in UserManagementService.
16:  */
17: final class StoreUserRequest extends FormRequest
18: {
19:     /**
20:      * @return array<string, mixed>
21:      */
22:     public function rules(): array
23:     {
24:         $organizationId = $this->user()->organization_id;
25: 
26:         return [
27:             'name' => ['required', 'string', 'max:255'],
28:             'email' => ['required', 'email', 'max:255', 'unique:users,email'],
29:             'password' => ['required', 'confirmed', Password::defaults()],
30:             'role' => ['required', 'in:admin,manager,member'],
31:             'role_ids' => ['nullable', 'array', 'max:100'],
32:             'role_ids.*' => ['integer', Rule::exists('roles', 'id')->where(
33:                 fn (Builder $q) => $q->where('organization_id', $organizationId)->orWhereNull('organization_id')
34:             )],
35:         ];
36:     }
37: }
```



<a id="e0377"></a>

> Audit provenance: `platform-source-catalog.md` lines 3419–3462. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Api/User/UpdateUserRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Api\User;
6: 
7: use App\Models\User;
8: use Illuminate\Database\Query\Builder;
9: use Illuminate\Foundation\Http\FormRequest;
10: use Illuminate\Validation\Rule;
11: use Illuminate\Validation\Rules\Password;
12: 
13: /**
14:  * Validates updating a user via the REST API. Same fields as the web form
15:  * (password optional); custom roles must be the caller's organization's own
16:  * or system roles. The escalation guards live in UserManagementService.
17:  */
18: final class UpdateUserRequest extends FormRequest
19: {
20:     /**
21:      * @return array<string, mixed>
22:      */
23:     public function rules(): array
24:     {
25:         /** @var User $user */
26:         $user = $this->route('user');
27:         $organizationId = $this->user()->organization_id;
28: 
29:         return [
30:             'name' => ['required', 'string', 'max:255'],
31:             'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
32:             'password' => ['nullable', 'confirmed', Password::defaults()],
33:             'role' => ['required', 'in:admin,manager,member'],
34:             'role_ids' => ['nullable', 'array', 'max:100'],
35:             'role_ids.*' => ['integer', Rule::exists('roles', 'id')->where(
36:                 fn (Builder $q) => $q->where('organization_id', $organizationId)->orWhereNull('organization_id')
37:             )],
38:         ];
39:     }
40: }
```



<a id="e0394"></a>

> Audit provenance: `platform-source-catalog.md` lines 3934–3955. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/UserController.php`
```php
33:     public function index(Request $request): Response
39:             ->when($request->input('search'), function ($query, $search) {
40:                 $query->where(function ($q) use ($search) {
45:             ->when($request->input('role'), function ($query, $role) {
53:         $roles = Role::where(function ($query) use ($user) {
58:         return Inertia::render('Admin/Users/Index', [
70:     public function create(Request $request): Response
80:         return Inertia::render('Admin/Users/Create', [
90:     public function store(StoreUserRequest $request, UserManagementService $users): RedirectResponse
92:         $users->create($request->user(), $request->validated());
104:     public function show(Request $request, User $user): Response
115:         return Inertia::render('Admin/Users/Show', [
128:     public function edit(Request $request, User $user): Response
145:         return Inertia::render('Admin/Users/Edit', [
157:     public function update(UpdateUserRequest $request, User $user, UserManagementService $users): RedirectResponse
166:         $users->update($currentUser, $user, $request->validated());
178:     public function destroy(Request $request, User $user): RedirectResponse
211:         $user->delete();
```



<a id="e0402"></a>

> Audit provenance: `platform-source-catalog.md` lines 4020–4033. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/RegisteredUserController.php`
```php
29:     public function create(): Response
31:         abort_unless((bool) config('auth.registration_enabled'), 404);
33:         return Inertia::render('Auth/Register');
43:     public function store(Request $request): RedirectResponse
45:         abort_unless((bool) config('auth.registration_enabled'), 404);
47:         $request->validate([
48:             'name' => 'required|string|max:255',
49:             'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
50:             'password' => ['required', 'confirmed', Rules\Password::defaults()],
51:         ]);
```



<a id="e0450"></a>

> Audit provenance: `platform-source-catalog.md` lines 7656–7804. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Services/UserManagementService.php`

```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Services;
6: 
7: use App\Enums\SecurityEvent;
8: use App\Models\Role;
9: use App\Models\User;
10: use App\Support\RoleAssignmentGuard;
11: use Illuminate\Support\Facades\DB;
12: use Illuminate\Support\Facades\Hash;
13: use Illuminate\Validation\ValidationException;
14: 
15: /**
16:  * Creates and updates organization users behind the privilege-escalation
17:  * guards. Shared by the web Admin\UserController and the REST API so a
18:  * delegated user manager cannot mint an admin through either surface.
19:  */
20: final class UserManagementService
21: {
22:     /**
23:      * Create a user in the actor's organization.
24:      *
25:      * @param  array{name: string, email: string, password: string, role: string, role_ids?: array<int, int|string>|null}  $data
26:      */
27:     public function create(User $actor, array $data): User
28:     {
29:         $this->assertCanAssignRoles($data['role_ids'] ?? [], $actor, $data['role']);
30: 
31:         return DB::transaction(function () use ($actor, $data) {
32:             $newUser = User::create([
33:                 'name' => $data['name'],
34:                 'email' => $data['email'],
35:                 'password' => Hash::make($data['password']),
36:                 'organization_id' => $actor->organization_id,
37:                 'role' => $data['role'],
38:             ]);
39: 
40:             // Assign additional custom roles if provided
41:             if (! empty($data['role_ids'])) {
42:                 $this->logRoleSync($newUser, $actor, $newUser->roles()->sync($data['role_ids']));
43:             }
44: 
45:             return $newUser;
46:         });
47:     }
48: 
49:     /**
50:      * Update a user in the actor's organization.
51:      *
52:      * @param  array{name: string, email: string, password?: string|null, role: string, role_ids?: array<int, int|string>|null}  $data
53:      *
54:      * @throws ValidationException when demoting the last administrator
55:      */
56:     public function update(User $actor, User $user, array $data): User
57:     {
58:         // Check the TARGET before anything is written: the role check below
59:         // only covers what is being assigned, so without this a delegated
60:         // user administrator could reset an admin's password or email.
61:         // Changing the email or password of an account that also works in
62:         // other organizations needs an administrator of each of them.
63:         $changesAccount = ! empty($data['password'])
64:             || mb_strtolower((string) $data['email']) !== mb_strtolower((string) $user->email);
65:         RoleAssignmentGuard::authorizeTarget($user, $actor, $changesAccount);
66: 
67:         $this->assertCanAssignRoles($data['role_ids'] ?? [], $actor, $data['role']);
68: 
69:         // Don't allow removing admin from the last admin
70:         if ($data['role'] !== 'admin' && $user->role === 'admin') {
71:             $adminCount = User::where('organization_id', $actor->organization_id)
72:                 ->where('role', 'admin')
73:                 ->count();
74: 
75:             if ($adminCount <= 1) {
76:                 throw ValidationException::withMessages([
77:                     'role' => 'Cannot remove admin role from the last administrator.',
78:                 ]);
79:             }
80:         }
81: 
82:         $updateData = [
83:             'name' => $data['name'],
84:             'email' => $data['email'],
85:             'role' => $data['role'],
86:         ];
87: 
88:         if (! empty($data['password'])) {
89:             $updateData['password'] = Hash::make($data['password']);
90:         }
91: 
92:         DB::transaction(function () use ($user, $actor, $updateData, $data) {
93:             $user->update($updateData);
94: 
95:             // Sync roles if provided
96:             if (isset($data['role_ids'])) {
97:                 $this->logRoleSync($user, $actor, $user->roles()->sync($data['role_ids']));
98:             }
99:         });
100: 
101:         return $user;
102:     }
103: 
104:     /**
105:      * Record custom role assignments to the security log. `roles()->sync()`
106:      * writes the pivot directly, so no model event reports it.
107:      *
108:      * @param  array{attached: array<int, int>, detached: array<int, int>, updated: array<int, int>}  $changes
109:      */
110:     private function logRoleSync(User $user, User $actor, array $changes): void
111:     {
112:         if ($changes['attached'] === [] && $changes['detached'] === []) {
113:             return;
114:         }
115: 
116:         $names = Role::whereIn('id', array_merge($changes['attached'], $changes['detached']))->pluck('name', 'id');
117: 
118:         app(SecurityEventLogger::class)->record(SecurityEvent::USER_ROLES_SYNCED, $user, $actor, [
119:             'roles_added' => array_values(array_map(fn ($id) => $names[$id] ?? $id, $changes['attached'])),
120:             'roles_removed' => array_values(array_map(fn ($id) => $names[$id] ?? $id, $changes['detached'])),
121:         ]);
122: 
123:         // Attaching the Administrator system role makes the user an admin
124:         // just like the base role does, so admins are alerted the same way.
125:         // A base-role promotion is alerted by UserSecurityObserver instead.
126:         $grantsAdmin = Role::whereIn('id', $changes['attached'])->where('slug', 'system-administrator')->exists();
127:         if ($grantsAdmin && $user->role !== 'admin') {
128:             app(UserActivityAlertService::class)->notifyPromotedToAdmin($user, $actor);
129:         }
130:     }
131: 
132:     /**
133:      * Prevent privilege escalation through role assignment. The rules live in
134:      * RoleAssignmentGuard, which the user CSV import also uses.
135:      *
136:      * @param  array<int|string>  $roleIds
137:      */
138:     public function assertCanAssignRoles(array $roleIds, User $actor, ?string $baseRole = null): void
139:     {
140:         RoleAssignmentGuard::authorize($roleIds, $actor, $baseRole);
141:     }
142: }
```

Portal invitation owner is `app/Services/Portal/PortalInvitationService.php` (included below); customer access ownership is in Portal controllers/middleware, not an inferred PortalAccessService.

