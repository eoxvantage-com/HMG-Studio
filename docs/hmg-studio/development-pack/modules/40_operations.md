# 40. Provisioning, Updates, Backups and Recovery — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Provisioning, Updates, Backups and Recovery as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Source installer/update/backup screens mapped to Taruvi provisioning/deployment/backup equivalents; operational permissions; restore/recovery evidence.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Organization, Email and Preferences](../modules/33_organization_settings.md), [Storage, Uploads and Downloads](../modules/36_storage.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Admin/Update/Index.vue` | Pending | Pending |
| `resources/js/Pages/Install/Admin.vue` | Pending | Pending |
| `resources/js/Pages/Install/Complete.vue` | Pending | Pending |
| `resources/js/Pages/Install/Database.vue` | Pending | Pending |
| `resources/js/Pages/Install/Requirements.vue` | Pending | Pending |
| `resources/js/Pages/Install/Welcome.vue` | Pending | Pending |

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

- [ ] No Laravel/PHP installer, artisan command or runtime is delivered.
- [ ] each source admin function has an explicit target equivalent or blocker.
- [ ] backup proves database/files/config scope and actual restore in approved isolated environment.
- [ ] no destructive recovery without approval.

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

- [P12 Install/update/backups](#e0270)
- [`resources/js/Pages/Admin/Update/Index.vue`](#e0302)
- [`resources/js/Pages/Install/Admin.vue`](#e0318)
- [`resources/js/Pages/Install/Complete.vue`](#e0319)
- [`resources/js/Pages/Install/Database.vue`](#e0320)
- [`resources/js/Pages/Install/Requirements.vue`](#e0321)
- [`resources/js/Pages/Install/Welcome.vue`](#e0322)
- [`app/Http/Controllers/Admin/UpdateController.php`](#e0393)
- [`app/Http/Controllers/Install/InstallerController.php`](#e0406)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0270"></a>

> Audit provenance: `platform.md` lines 152–157. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P12 Install/update/backups

Installer welcome→requirements→DB→organization/admin→complete. driver mysql|pgsql,host(localhost),port(3306/5432),database,username required;password optional. Connection test then installation;reset_database nullable boolean DESTRUCTIVE confirmation. Admin organization_name/admin_name required max255,admin_email valid unique max255,admin_password min8 confirmed. Preserve already-installed and step-state guards (`InstallerController.php:136-148,200-213,400-410`), five Install pages cataloged. No installer changes executed.

Update view current/latest/release info;check,backup,list,perform,restore/delete backup. Table filename/size/created/actions. restore/delete backup_file required basename /^[A-Za-z0-9._-]+\.zip$/; privileged routes+controller admin gate. Database backup method can explicitly none under opt-in configuration—do not label complete DB backup (`UpdateController.php:100-155,176-230`). Separate destructive confirmations/progress/recovery from ordinary CRUD.



<a id="e0302"></a>

> Audit provenance: `platform-source-catalog.md` lines 555–608. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Admin/Update/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Visible table headers:**
```text
361: {{ t('admin.update.filename') }}
362: {{ t('admin.update.size') }}
363: {{ t('common.createdAt') }}
364: {{ t('common.actions') }}
```

**View filters, permission/action and navigation anchors:**
```js
33: const isUpdating = ref(false);
34: const isCheckingUpdate = ref(false);
35: const isCreatingBackup = ref(false);
36: const updateProgress = ref([]);
37: const updateResult = ref(null);
38: const showBackups = ref(false);
39: const selectedBackup = ref(null);
40: const isRestoring = ref(false);
57: const response = await axios.get(route('admin.update.check'));
59: router.reload();
70: if (!confirm(t('admin.update.confirmUpdate'))) {
79: const response = await axios.post(route('admin.update.perform'), {}, {
102: if (!confirm(t('admin.update.confirmBackup'))) {
109: const response = await axios.post(route('admin.update.backup'));
113: router.reload();
124: if (!confirm(t('admin.update.confirmRestore', { file: backupFile }))) {
131: const response = await axios.post(route('admin.update.restore'), {
154: if (!confirm(t('admin.update.confirmDeleteBackup', { file: backupFile }))) {
159: const response = await axios.delete(route('admin.update.backup.delete'), {
164: router.reload();
```

**Displayed data/value expressions:**
```text
201: isCheckingUpdate ? t('admin.update.checking') : t('admin.update.checkForUpdates')
215: currentVersion
217: updateAvailable ? t('admin.update.updateAvailable') : t('admin.update.upToDateBadge')
237: latestRelease.version
241: latestRelease.name
246: latestRelease.body
267: isUpdating ? t('admin.update.updating') : t('admin.update.installUpdate')
311: updateResult.message
325: updateResult.message
349: isCreatingBackup ? t('admin.update.creatingBackup') : t('admin.update.createBackup')
373: backup.filename
374: formatBytes(backup.size)
375: formatDate(backup.created_at)
```



<a id="e0318"></a>

> Audit provenance: `platform-source-catalog.md` lines 1149–1181. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Install/Admin.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Install/Admin.vue:88`: `<input id="organization_name" v-model="form.organization_name" type="text" required :placeholder="t('install.admin.orgNamePlaceholder')" />`
- `resources/js/Pages/Install/Admin.vue:107`: `<input id="admin_name" v-model="form.admin_name" type="text" required :placeholder="t('install.admin.fullNamePlaceholder')" />`
- `resources/js/Pages/Install/Admin.vue:122`: `<input id="admin_email" v-model="form.admin_email" type="email" required placeholder="admin@example.com" />`
- `resources/js/Pages/Install/Admin.vue:137`: `<input id="admin_password" v-model="form.admin_password" type="password" required minlength="8" :placeholder="t('install.admin.passwordHint')" />`
- `resources/js/Pages/Install/Admin.vue:153`: `<input id="admin_password_confirmation" v-model="form.admin_password_confirmation" type="password" required minlength="8" :placeholder="t('install.admin.confirmPasswordHint')" />`

**Form initial state/defaults:**
```js
14: const form = useForm({
15:     organization_name: '',
16:     admin_name: '',
17:     admin_email: '',
18:     admin_password: '',
19:     admin_password_confirmation: '',
20: });
```

**View filters, permission/action and navigation anchors:**
```js
22: const creating = ref(false);
23: const error = ref(null);
32: const response = await fetch(route('install.admin.create'), {
45: window.location.href = route('install.complete');
```

**Displayed data/value expressions:**
```text
77: error
```



<a id="e0319"></a>

> Audit provenance: `platform-source-catalog.md` lines 1182–1186. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Install/Complete.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.



<a id="e0320"></a>

> Audit provenance: `platform-source-catalog.md` lines 1187–1233. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Install/Database.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Install/Database.vue:160`: `<input v-model="confirmReset" type="checkbox" />`
- `resources/js/Pages/Install/Database.vue:185`: `<select id="driver" v-model="form.driver" required >`
- `resources/js/Pages/Install/Database.vue:201`: `<input id="host" v-model="form.host" type="text" required placeholder="localhost" />`
- `resources/js/Pages/Install/Database.vue:216`: `<input id="port" v-model.number="form.port" type="number" required :placeholder="String(DEFAULT_PORTS[form.driver])" />`
- `resources/js/Pages/Install/Database.vue:231`: `<input id="database" v-model="form.database" type="text" required placeholder="inventoros" />`
- `resources/js/Pages/Install/Database.vue:246`: `<input id="username" v-model="form.username" type="text" required placeholder="root" />`
- `resources/js/Pages/Install/Database.vue:261`: `<input id="password" v-model="form.password" type="password" :placeholder="t('install.database.passwordHint')" />`

**Form initial state/defaults:**
```js
25: const form = useForm({
26:     driver: initialDriver,
27:     host: props.currentConfig.host || 'localhost',
28:     port: Number(props.currentConfig.port) || DEFAULT_PORTS[initialDriver],
29:     database: props.currentConfig.database || '',
30:     username: props.currentConfig.username || '',
31:     password: '',
32: });
```

**Select option values/labels (dynamic options retain their source):**
```html
191: <option value="mysql">{{ t('install.database.drivers.mysql') }}</option>
192: <option value="pgsql">{{ t('install.database.drivers.pgsql') }}</option>
```

**View filters, permission/action and navigation anchors:**
```js
34: const testing = ref(false);
35: const testResult = ref(null);
36: const installing = ref(false);
39: const confirmReset = ref(false);
57: const response = await fetch(route('install.database.test'), {
85: const response = await fetch(route('install.database.install'), {
98: window.location.href = route('install.admin');
```

**Displayed data/value expressions:**
```text
138: testResult.message
152: testResult.message
173: installing ? t('install.database.installing') : t('install.database.resetAndInstall')
```



<a id="e0321"></a>

> Audit provenance: `platform-source-catalog.md` lines 1234–1245. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Install/Requirements.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Displayed data/value expressions:**
```text
83: requirement.name
87: requirement.current
91: requirement.required
```



<a id="e0322"></a>

> Audit provenance: `platform-source-catalog.md` lines 1246–1250. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Install/Welcome.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.



<a id="e0393"></a>

> Audit provenance: `platform-source-catalog.md` lines 3914–3933. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/UpdateController.php`
```php
33:     public function __construct(UpdateService $updateService)
44:     public function index(Request $request): Response
58:         return Inertia::render('Admin/Update/Index', [
73:     public function check(Request $request): JsonResponse
100:     public function update(Request $request): JsonResponse
111:         $result = $this->updateService->update();
122:     public function backup(Request $request): JsonResponse
160:     public function listBackups(): JsonResponse
176:     public function restore(Request $request): JsonResponse
185:         $validated = $request->validate([
186:             'backup_file' => ['required', 'string', 'regex:/^[A-Za-z0-9._-]+\.zip$/'],
187:         ]);
220:     public function deleteBackup(Request $request): JsonResponse
229:         $validated = $request->validate([
230:             'backup_file' => ['required', 'string', 'regex:/^[A-Za-z0-9._-]+\.zip$/'],
231:         ]);
```



<a id="e0406"></a>

> Audit provenance: `platform-source-catalog.md` lines 4136–4249. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Install/InstallerController.php`
```php
32:     public const PHP_MIN = '8.4.1';
33: 
34:     /**
35:      * First PHP version that is NOT supported, or null for no ceiling.
36:      * Must match the lowest upper bound in composer.lock (phpoffice/phpspreadsheet
37:      * 1.x capped PHP below 8.5; 5.x has no ceiling).
38:      */
39:     public const PHP_MAX_EXCLUSIVE = null;
40: 
41:     /**
42:      * Whether the given PHP version can run this release.
43:      */
44:     public static function phpVersionSupported(string $version): bool
45:     {
46:         if (version_compare($version, self::PHP_MIN, '<')) {
47:             return false;
48:         }
49: 
50:         return self::PHP_MAX_EXCLUSIVE === null || version_compare($version, self::PHP_MAX_EXCLUSIVE, '<');
51:     }
52: 
53:     /**
54:      * The PHP requirement as shown on the requirements step.
55:      */
56:     private static function phpRequirementLabel(): string
57:     {
58:         if (self::PHP_MAX_EXCLUSIVE === null) {
59:             return self::PHP_MIN.' or newer';
60:         }
61: 
62:         $ceiling = implode('.', array_slice(explode('.', self::PHP_MAX_EXCLUSIVE), 0, 2));
63: 
64:         return self::PHP_MIN.' or newer, below '.$ceiling;
65:     }
66: 
67:     /**
68:      * Show the installer welcome page.
69:      *
70:      * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
71:      */
72:     public function index()
73:     {
74:         if ($this->isInstalled()) {
75:             return redirect('/login');
76:         }
77: 
78:         return Inertia::render('Install/Welcome');
79:     }
80: 
81:     /**
82:      * Check system requirements.
83:      *
84:      * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
85:      */
86:     public function requirements()
87:     {
88:         if ($this->isInstalled()) {
89:             return redirect('/login');
90:         }
91: 
92:         $requirements = $this->checkRequirements();
93: 
94:         return Inertia::render('Install/Requirements', [
95:             'requirements' => $requirements,
96:             'allMet' => !in_array(false, array_column($requirements, 'met')),
97:         ]);
105:     public function database()
119:         return Inertia::render('Install/Database', [
136:     public function testDatabase(Request $request)
142:         $request->validate([
143:             'driver' => 'required|string|in:mysql,pgsql',
144:             'host' => 'required|string',
145:             'port' => 'required|integer',
146:             'database' => 'required|string',
147:             'username' => 'required|string',
148:             'password' => 'nullable|string',
149:         ]);
179:     protected function buildDsn(string $driver, string $host, int $port, string $database): string
200:     public function installDatabase(Request $request)
206:         $request->validate([
207:             'driver' => 'required|string|in:mysql,pgsql',
208:             'host' => 'required|string',
209:             'port' => 'required|integer',
210:             'database' => 'required|string',
211:             'username' => 'required|string',
212:             'password' => 'nullable|string',
213:             'reset_database' => 'nullable|boolean',
214:         ]);
299:     protected function prepareDatabase(string $driver, array $input, bool $reset): void
328:     protected function connectionSettings(string $driver, array $input): array
349:     protected function answer(bool $success, string $key, string $message, int $status = 200, ?string $error = null, array $extra = []): \Illuminate\Http\JsonResponse
363:     protected function servedOverHttps(Request $request): bool
371:     protected function databaseHasTables(): bool
385:     public function admin()
391:         return Inertia::render('Install/Admin');
400:     public function createAdmin(Request $request)
406:         $validated = $request->validate([
407:             'organization_name' => 'required|string|max:255',
408:             'admin_name' => 'required|string|max:255',
409:             'admin_email' => 'required|string|email|max:255|unique:users,email',
410:             'admin_password' => 'required|string|min:8|confirmed',
411:         ]);
470:     public function complete()
476:         return Inertia::render('Install/Complete');
484:     protected function isInstalled(): bool
498:     protected function checkRequirements(): array
563:     protected function describeAvailableDbDrivers(): string
579:     protected function updateEnvFile(array $data): void
625:     protected function envFilePath(): string
638:     public static function quoteEnvValue(string $value): string
```

