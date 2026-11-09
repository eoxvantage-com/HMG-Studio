# Shared contracts — platform-source-catalog.md

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

Read only the relevant sections for the active module; this file owns mixed-module registers and common rules. Return to [START HERE](../00_START_HERE.md).

- [Platform: field, view, workflow and validation evidence](#e0278)
- [Page/control completeness ledger](#e0279)
- [`resources/js/Components/LanguageSwitcher.vue`](#e0289)
- [`resources/js/Components/Layout/GlobalSearch.vue`](#e0290)
- [`resources/js/Components/Layout/ThemeToggle.vue`](#e0292)
- [`resources/js/Pages/Errors/403.vue`](#e0316)
- [Backend request contracts (authoritative rules, including conditional and organization-scoped validation)](#e0367)
- [Inline controller rules and workflow evidence](#e0382)
- [`app/Http/Controllers/SearchController.php`](#e0422)
- [Contract appendix `app/Http/Middleware/SetLocale.php:17-36`](#e0432)
- [Contract appendix `routes/web/admin.php:1-160`](#e0433)
- [Contract appendix `routes/web/account.php:1-67`](#e0434)
- [Supplemental owner-level rule and workflow evidence](#e0443)

<a id="e0278"></a>

> Audit provenance: `platform-source-catalog.md` lines 1–4. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

# Platform: field, view, workflow and validation evidence

Source root: `C:/Users/proj/Inventoros`. Audit is source-derived; no mutation, backend test, provider test or browser verification by this agent. Browser observations are supplied separately by the parent audit. Source snippets below are specifications of the inspected revision, not a claim that all paths execute successfully. Literal field names/default expressions are preserved; `props` values come from the controller and are not invented static defaults.



<a id="e0279"></a>

> Audit provenance: `platform-source-catalog.md` lines 5–8. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Page/control completeness ledger

Includes every platform-owned Vue page, platform shared controls, both bundled plugin UIs. A page with no editable control is deliberately retained. Inventory and commerce pages belong to their separate sections. Source metadata: 123 total page files; 67 shared component files; 76 request files; 107 controllers; 13 route files.



<a id="e0289"></a>

> Audit provenance: `platform-source-catalog.md` lines 148–170. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Components/LanguageSwitcher.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
18: const isOpen = ref(false);
19: const dropdownRef = ref(null);
20: const triggerRef = ref(null);
22: const isLoading = ref(false);
23: const failedLocale = ref(null);
52: const current = computed(() => availableLocales.find((l) => l.code === locale.value) || availableLocales[0]);
66: router.patch(route('settings.account.update.locale'), { locale: code }, {
```

**Displayed data/value expressions:**
```text
107: current.code
110: isLoading ? t('common.loading') : ''
155: loc.name
```



<a id="e0290"></a>

> Audit provenance: `platform-source-catalog.md` lines 171–212. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Components/Layout/GlobalSearch.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Components/Layout/GlobalSearch.vue:238`: `<input ref="searchInput" :aria-label="$t('nav.globalSearch.placeholder')" v-model="query" type="text" :placeholder="$t('nav.globalSearch.placeholder')" />`

**View filters, permission/action and navigation anchors:**
```js
7: const isOpen = ref(false);
8: const query = ref('');
9: const results = ref({
16: const isLoading = ref(false);
17: const selectedIndex = ref(-1);
18: const searchInput = ref(null);
19: const recentSearches = ref([]);
20: const showRecent = ref(true);
26: const flatResults = computed(() => {
48: const selectableResults = computed(() => {
49: return flatResults.value.filter(item => item.kind === 'result');
52: const hasResults = computed(() => {
56: const hasQuery = computed(() => {
73: const existing = recentSearches.value.filter(r => !(r.id === item.id && r.type === item.type));
99: const response = await axios.get('/search', { params: { q: val.trim() } });
131: router.visit(item.url);
```

**Displayed data/value expressions:**
```text
264: $t('nav.globalSearch.recent')
276: item.title
277: item.subtitle
287: $t(item.label)
306: item.title
307: item.subtitle
327: $t('nav.globalSearch.noResults', { query })
328: $t('nav.globalSearch.tryDifferent')
336: $t('nav.globalSearch.startTyping')
337: $t('nav.globalSearch.hint')
347: $t('nav.globalSearch.navigate')
351: $t('nav.globalSearch.open')
355: $t('nav.globalSearch.close')
```



<a id="e0292"></a>

> Audit provenance: `platform-source-catalog.md` lines 249–258. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Components/Layout/ThemeToggle.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
8: const isDark = ref(true);
```



<a id="e0316"></a>

> Audit provenance: `platform-source-catalog.md` lines 1047–1051. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Errors/403.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.



<a id="e0367"></a>

> Audit provenance: `platform-source-catalog.md` lines 3071–3072. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Backend request contracts (authoritative rules, including conditional and organization-scoped validation)



<a id="e0382"></a>

> Audit provenance: `platform-source-catalog.md` lines 3688–3691. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Inline controller rules and workflow evidence

Each validation block retains source context. Method signatures and concrete mutation/response anchors identify operations for implementation. These excerpts complement, not replace, the explanatory workflow specification.



<a id="e0422"></a>

> Audit provenance: `platform-source-catalog.md` lines 4567–4573. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/SearchController.php`
```php
22:     public function search(Request $request): JsonResponse
43:             ->where(function ($q) use ($query, $variantMatch) {
138:     private function productSubtitle(Product $product): string
```



<a id="e0432"></a>

> Audit provenance: `platform-source-catalog.md` lines 4980–5003. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `app/Http/Middleware/SetLocale.php:17-36`
```php
17:  * HandleInertiaRequests shares the result with the frontend as `locale`.
18:  * Also runs on the REST API, so validation messages there are localized.
19:  */
20: class SetLocale
21: {
22:     public const SUPPORTED_LOCALES = [
23:         'en', 'es', 'fr', 'de', 'pt-BR', 'it',
24:         'ja', 'ko', 'zh-CN', 'ar', 'ru', 'nl', 'tr', 'pl',
25:     ];
26: 
27:     /**
28:      * The cookie the frontend language switcher writes. It is set from
29:      * JavaScript, so it is excluded from cookie encryption in bootstrap/app.php.
30:      */
31:     public const COOKIE = 'locale';
32: 
33:     public function handle(Request $request, Closure $next): Response
34:     {
35:         // REST requests authenticate with a bearer token in route
36:         // middleware, after this runs, so resolve that user here too.
```



<a id="e0433"></a>

> Audit provenance: `platform-source-catalog.md` lines 5004–5167. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `routes/web/admin.php:1-160`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: use App\Http\Controllers\Admin\AccountSettingsController;
6: use App\Http\Controllers\Admin\ActivityLogController;
7: use App\Http\Controllers\Admin\ApiTokenController;
8: use App\Http\Controllers\Admin\DashboardController;
9: use App\Http\Controllers\Admin\OrganizationLogoController;
10: use App\Http\Controllers\Admin\OrganizationSettingsController;
11: use App\Http\Controllers\Admin\PluginController;
12: use App\Http\Controllers\Admin\PluginMarketplaceController;
13: use App\Http\Controllers\Admin\RoleController;
14: use App\Http\Controllers\Admin\StorageSettingsController;
15: use App\Http\Controllers\Admin\UpdateController;
16: use App\Http\Controllers\Admin\UserController;
17: use App\Http\Controllers\SettingsController;
18: use App\Http\Controllers\ShippingSettingsController;
19: use App\Http\Controllers\WebhookController;
20: use App\Http\Middleware\EnsurePluginAdministrator;
21: use App\Http\Middleware\EnsureUpdateAdministrator;
22: use Illuminate\Support\Facades\Route;
23: 
24: /*
25:  * Users, roles, plugins, settings, webhooks, activity log, and system update.
26:  * Loaded inside the `auth` group in routes/web.php.
27:  */
28: 
29: // User Management - Permission based
30: Route::get('/users', [UserController::class, 'index'])->name('users.index')->middleware('permission:view_users');
31: Route::get('/users/create', [UserController::class, 'create'])->name('users.create')->middleware('permission:create_users');
32: Route::post('/users', [UserController::class, 'store'])->name('users.store')->middleware('permission:create_users');
33: Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show')->middleware('permission:view_users');
34: Route::get('/users/{user}/edit', [UserController::class, 'edit'])->name('users.edit')->middleware('permission:edit_users');
35: Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update')->middleware('permission:edit_users');
36: Route::patch('/users/{user}', [UserController::class, 'update'])->middleware('permission:edit_users');
37: Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy')->middleware('permission:delete_users');
38: 
39: // Role Management - Permission based
40: Route::get('/roles', [RoleController::class, 'index'])->name('roles.index')->middleware('permission:view_roles');
41: Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create')->middleware('permission:create_roles');
42: Route::post('/roles', [RoleController::class, 'store'])->name('roles.store')->middleware('permission:create_roles');
43: Route::get('/roles/{role}', [RoleController::class, 'show'])->name('roles.show')->middleware('permission:view_roles');
44: Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit')->middleware('permission:edit_roles');
45: Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update')->middleware('permission:edit_roles');
46: Route::patch('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:edit_roles');
47: Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy')->middleware('permission:delete_roles');
48: 
49: // Plugins - Permission based. Plugins are installation-wide, so every change
50: // also needs the plugin administrator organization (see PluginAdministration).
51: Route::prefix('plugins')->name('plugins.')->middleware('permission:view_plugins')->group(function () {
52:     Route::get('/', [PluginController::class, 'index'])->name('index');
53: 
54:     // Marketplace: browse inventoros.com and install signed plugins in one click.
55:     Route::get('/marketplace', [PluginMarketplaceController::class, 'index'])->name('marketplace');
56: 
57:     Route::middleware(['permission:manage_plugins', EnsurePluginAdministrator::class])->group(function () {
58:         Route::post('/upload', [PluginController::class, 'upload'])->name('upload');
59: 
60:         Route::prefix('marketplace')->name('marketplace')->group(function () {
61:             Route::post('/connect', [PluginMarketplaceController::class, 'connect'])->middleware('throttle:10,1')->name('.connect');
62:             Route::delete('/connect', [PluginMarketplaceController::class, 'disconnect'])->name('.disconnect');
63:             Route::post('/{slug}/install', [PluginMarketplaceController::class, 'install'])
64:                 ->where('slug', '[A-Za-z0-9][A-Za-z0-9_-]*')->middleware('throttle:10,1')->name('.install');
65:             Route::post('/{slug}/update', [PluginMarketplaceController::class, 'update'])
66:                 ->where('slug', '[A-Za-z0-9][A-Za-z0-9_-]*')->middleware('throttle:10,1')->name('.update');
67:         });
68: 
69:         Route::post('/{plugin}/activate', [PluginController::class, 'activate'])->name('activate');
70:         Route::post('/{plugin}/deactivate', [PluginController::class, 'deactivate'])->name('deactivate');
71:         Route::delete('/{plugin}', [PluginController::class, 'destroy'])->name('destroy');
72:     });
73: });
74: 
75: // Settings - Permission based
76: Route::get('/organizations/{organization}/logo', [OrganizationLogoController::class, 'show'])->name('organization.logo');
77: 
78: Route::prefix('settings')->name('settings.')->group(function () {
79:     // Settings hub. Open to every signed-in user: it links to account
80:     // settings and two-factor (everyone) and hides the admin-only sections.
81:     Route::get('/', [SettingsController::class, 'hub'])->name('index');
82: 
83:     Route::get('/storage', [StorageSettingsController::class, 'index'])->name('storage.index');
84:     Route::post('/storage/check', [StorageSettingsController::class, 'check'])->middleware('throttle:6,1')->name('storage.check');
85: 
86:     // Organization Settings
87:     Route::prefix('organization')->name('organization.')->middleware('permission:view_settings')->group(function () {
88:         Route::get('/', [OrganizationSettingsController::class, 'index'])->name('index');
89:         Route::post('/logo', [OrganizationLogoController::class, 'store'])->middleware('permission:manage_organization')->name('logo.store');
90:         Route::delete('/logo', [OrganizationLogoController::class, 'destroy'])->middleware('permission:manage_organization')->name('logo.destroy');
91:         Route::patch('/general', [OrganizationSettingsController::class, 'updateGeneral'])->middleware('permission:manage_organization')->name('update.general');
92:         Route::patch('/regional', [OrganizationSettingsController::class, 'updateRegional'])->middleware('permission:manage_organization')->name('update.regional');
93:         Route::patch('/approvals', [OrganizationSettingsController::class, 'updateApprovals'])->middleware('permission:manage_organization')->name('update.approvals');
94:         Route::patch('/portal', [OrganizationSettingsController::class, 'updatePortal'])->middleware('permission:manage_organization')->name('update.portal');
95: 
96:         // Organization users are managed in /users; keep old links working.
97:         Route::redirect('/users', '/users', 301);
98:     });
99: 
100:     // Dashboard Widget Preferences (accessible by all authenticated users)
101:     Route::patch('/dashboard-widgets', [DashboardController::class, 'updateWidgets'])
102:         ->name('dashboard-widgets.update');
103: 
104:     // Account Settings (accessible by all authenticated users)
105:     Route::prefix('account')->name('account.')->group(function () {
106:         Route::get('/', [AccountSettingsController::class, 'index'])->name('index');
107:         Route::patch('/profile', [AccountSettingsController::class, 'updateProfile'])->name('update.profile');
108:         Route::patch('/password', [AccountSettingsController::class, 'updatePassword'])->name('update.password');
109:         Route::patch('/notifications', [AccountSettingsController::class, 'updateNotifications'])->name('update.notifications');
110:         Route::patch('/preferences', [AccountSettingsController::class, 'updatePreferences'])->name('update.preferences');
111:         Route::patch('/locale', [AccountSettingsController::class, 'updateLocale'])->name('update.locale');
112:     });
113: 
114:     // API tokens (every signed-in user manages their own)
115:     Route::prefix('api-tokens')->name('api-tokens.')->group(function () {
116:         Route::get('/', [ApiTokenController::class, 'index'])->name('index');
117:         Route::post('/', [ApiTokenController::class, 'store'])->name('store');
118:         Route::delete('/{tokenId}', [ApiTokenController::class, 'destroy'])->whereNumber('tokenId')->name('destroy');
119:     });
120: 
121:     // Email Settings (admin only)
122:     Route::middleware('permission:manage_organization')->group(function () {
123:         Route::get('/email', [SettingsController::class, 'email'])->name('email.index');
124:         Route::post('/email', [SettingsController::class, 'updateEmail'])->name('email.update');
125:         Route::post('/email/test', [SettingsController::class, 'testEmail'])->name('email.test');
126: 
127:         // Shipping (EasyPost credentials, ship-from defaults)
128:         Route::get('/shipping', [ShippingSettingsController::class, 'index'])->name('shipping.index');
129:         Route::patch('/shipping', [ShippingSettingsController::class, 'update'])->name('shipping.update');
130:         Route::post('/shipping/webhook-token', [ShippingSettingsController::class, 'rotateWebhookToken'])->name('shipping.webhook-token');
131:     });
132: });
133: 
134: // Webhooks
135: Route::middleware('permission:manage_organization')->group(function () {
136:     // Create and edit are modals on the index and show pages.
137:     Route::resource('webhooks', WebhookController::class)->except(['create', 'edit']);
138:     Route::post('webhooks/{webhook}/regenerate-secret', [WebhookController::class, 'regenerateSecret'])->name('webhooks.regenerate-secret');
139:     Route::post('webhooks/{webhook}/test', [WebhookController::class, 'test'])->name('webhooks.test');
140:     Route::post('webhook-deliveries/{delivery}/retry', [WebhookController::class, 'retryDelivery'])->name('webhook-deliveries.retry');
141: });
142: 
143: // Activity Log - Permission based
144: Route::get('/activity-log', [ActivityLogController::class, 'index'])
145:     ->middleware('permission:view_activity_log')
146:     ->name('activity-log.index');
147: Route::get('/activity-log/export', [ActivityLogController::class, 'export'])
148:     ->middleware('permission:view_activity_log')
149:     ->name('activity-log.export');
150: 
151: // System Update - Admin only
152: Route::prefix('admin/update')->name('admin.update.')->middleware(['permission:manage_organization', EnsureUpdateAdministrator::class])->group(function () {
153:     Route::get('/', [UpdateController::class, 'index'])->name('index');
154:     Route::get('/check', [UpdateController::class, 'check'])->name('check');
155:     Route::post('/perform', [UpdateController::class, 'update'])->name('perform');
156:     Route::post('/backup', [UpdateController::class, 'backup'])->name('backup');
157:     Route::get('/backups', [UpdateController::class, 'listBackups'])->name('backups.list');
158:     Route::post('/restore', [UpdateController::class, 'restore'])->name('restore');
159:     Route::delete('/backup', [UpdateController::class, 'deleteBackup'])->name('backup.delete');
160: });
```



<a id="e0434"></a>

> Audit provenance: `platform-source-catalog.md` lines 5168–5238. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `routes/web/account.php:1-67`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: use App\Http\Controllers\Auth\TwoFactorController;
6: use App\Http\Controllers\Import\ImportExportController;
7: use App\Http\Controllers\NotificationController;
8: use App\Http\Controllers\OrganizationSwitchController;
9: use App\Http\Controllers\ProfileController;
10: use App\Http\Controllers\SearchController;
11: use Illuminate\Support\Facades\Route;
12: 
13: /*
14:  * Per-user routes: organization switcher, search, two-factor, profile,
15:  * notifications, import/export. Loaded inside the `auth` group in
16:  * routes/web.php.
17:  */
18: 
19: // Organization switcher (users who belong to more than one organization)
20: Route::post('/organizations/switch', OrganizationSwitchController::class)
21:     ->middleware('throttle:30,1')
22:     ->name('organizations.switch');
23: 
24: // Global Search
25: Route::get('/search', [SearchController::class, 'search'])->name('search');
26: 
27: // Two-Factor Authentication
28: Route::get('/two-factor-challenge', [TwoFactorController::class, 'challenge'])->name('two-factor.challenge');
29: Route::post('/two-factor-challenge', [TwoFactorController::class, 'verifyChallenge'])->name('two-factor.challenge.verify')->middleware('throttle:5,1');
30: 
31: Route::prefix('settings/two-factor')->name('two-factor.')->group(function () {
32:     Route::get('/setup', [TwoFactorController::class, 'setup'])->name('setup');
33:     Route::post('/enable', [TwoFactorController::class, 'enable'])->name('enable');
34:     Route::post('/disable', [TwoFactorController::class, 'disable'])->name('disable');
35: });
36: 
37: Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
38: Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
39: Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
40: 
41: // Notifications
42: Route::prefix('notifications')->name('notifications.')->group(function () {
43:     Route::get('/', [NotificationController::class, 'index'])->name('index');
44:     Route::get('/unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
45:     Route::post('/{notification}/read', [NotificationController::class, 'markAsRead'])->name('mark-as-read');
46:     Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead'])->name('mark-all-read');
47:     Route::delete('/{notification}', [NotificationController::class, 'destroy'])->name('destroy');
48:     Route::delete('/clear/read', [NotificationController::class, 'clearRead'])->name('clear-read');
49: });
50: 
51: // Import/Export - Permission based
52: Route::prefix('import-export')->name('import-export.')->group(function () {
53:     Route::get('/', [ImportExportController::class, 'index'])->middleware('permission:export_data|import_data')->name('index');
54:     Route::get('/export-products', [ImportExportController::class, 'exportProducts'])->middleware('permission:export_data')->name('export-products');
55:     Route::get('/export-orders', [ImportExportController::class, 'exportOrders'])->middleware('permission:export_data')->name('export-orders');
56:     // The user list (emails, roles) is only for people who may view users.
57:     Route::get('/export-users', [ImportExportController::class, 'exportUsers'])->middleware(['permission:export_data', 'permission:view_users'])->name('export-users');
58:     Route::get('/downloads/{dataExport}', [ImportExportController::class, 'download'])->middleware('permission:export_data')->name('download');
59:     Route::get('/download-template', [ImportExportController::class, 'downloadTemplate'])->middleware('permission:import_data')->name('download-template');
60:     Route::post('/import-products', [ImportExportController::class, 'importProducts'])->middleware('permission:import_data')->name('import-products');
61:     // Order import creates orders (and customers), so it needs create_orders too.
62:     Route::get('/download-order-template', [ImportExportController::class, 'downloadOrderTemplate'])->middleware(['permission:import_data', 'permission:create_orders'])->name('download-order-template');
63:     Route::post('/import-orders', [ImportExportController::class, 'importOrders'])->middleware(['permission:import_data', 'permission:create_orders'])->name('import-orders');
64:     // User import creates accounts, so it needs create_users too.
65:     Route::get('/download-user-template', [ImportExportController::class, 'downloadUserTemplate'])->middleware(['permission:import_data', 'permission:create_users'])->name('download-user-template');
66:     Route::post('/import-users', [ImportExportController::class, 'importUsers'])->middleware(['permission:import_data', 'permission:create_users'])->name('import-users');
67: });
```



<a id="e0443"></a>

> Audit provenance: `platform-source-catalog.md` lines 5617–5618. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Supplemental owner-level rule and workflow evidence

