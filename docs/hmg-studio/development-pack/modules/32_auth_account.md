# 32. Authentication, Profile and Account — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Authentication, Profile and Account as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Staff login/reset/verification/confirm password; two-factor setup/challenge/recovery; profile/password; preferences and account deletion.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Organization, Email and Preferences](../modules/33_organization_settings.md), [Roles and Permission Sets](../modules/31_roles_permissions.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Auth/ConfirmPassword.vue` | Pending | Pending |
| `resources/js/Pages/Auth/ForgotPassword.vue` | Pending | Pending |
| `resources/js/Pages/Auth/Login.vue` | Pending | Pending |
| `resources/js/Pages/Auth/Register.vue` | Pending | Pending |
| `resources/js/Pages/Auth/ResetPassword.vue` | Pending | Pending |
| `resources/js/Pages/Auth/TwoFactorChallenge.vue` | Pending | Pending |
| `resources/js/Pages/Auth/TwoFactorSetup.vue` | Pending | Pending |
| `resources/js/Pages/Auth/VerifyEmail.vue` | Pending | Pending |
| `resources/js/Pages/Errors/403.vue` | Pending | Pending |
| `resources/js/Pages/Profile/Edit.vue` | Pending | Pending |
| `resources/js/Pages/Profile/Partials/DeleteUserForm.vue` | Pending | Pending |
| `resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue` | Pending | Pending |
| `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.vue` | Pending | Pending |
| `resources/js/Pages/Settings/Account/Index.vue` | Pending | Pending |

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

- [ ] Native identity lifecycle satisfies the documented user flows.
- [ ] one-use recovery/reset and revoked access work.
- [ ] organization switching/stale tab requests cannot cross scope.
- [ ] unsupported native auth features are explicit blockers, not insecure custom workarounds.

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

- [P03 Staff auth/profile](#e0257)
- [`resources/js/Pages/Auth/ConfirmPassword.vue`](#e0307)
- [`resources/js/Pages/Auth/ForgotPassword.vue`](#e0308)
- [`resources/js/Pages/Auth/Login.vue`](#e0309)
- [`resources/js/Pages/Auth/Register.vue`](#e0310)
- [`resources/js/Pages/Auth/ResetPassword.vue`](#e0311)
- [`resources/js/Pages/Auth/TwoFactorChallenge.vue`](#e0312)
- [`resources/js/Pages/Auth/TwoFactorSetup.vue`](#e0313)
- [`resources/js/Pages/Auth/VerifyEmail.vue`](#e0314)
- [`resources/js/Pages/Profile/Edit.vue`](#e0335)
- [`resources/js/Pages/Profile/Partials/DeleteUserForm.vue`](#e0336)
- [`resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue`](#e0337)
- [`resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.vue`](#e0338)
- [`resources/js/Pages/Settings/Account/Index.vue`](#e0356)
- [`app/Http/Requests/Auth/LoginRequest.php`](#e0378)
- [`app/Http/Requests/ProfileUpdateRequest.php`](#e0379)
- [`app/Http/Controllers/Admin/AccountSettingsController.php`](#e0383)
- [`app/Http/Controllers/Auth/AuthenticatedSessionController.php`](#e0395)
- [`app/Http/Controllers/Auth/ConfirmablePasswordController.php`](#e0396)
- [`app/Http/Controllers/Auth/EmailVerificationPromptController.php`](#e0398)
- [`app/Http/Controllers/Auth/NewPasswordController.php`](#e0399)
- [`app/Http/Controllers/Auth/PasswordController.php`](#e0400)
- [`app/Http/Controllers/Auth/PasswordResetLinkController.php`](#e0401)
- [`app/Http/Controllers/Auth/TwoFactorController.php`](#e0403)
- [`app/Http/Controllers/Auth/VerifyEmailController.php`](#e0404)
- [`app/Http/Controllers/ProfileController.php`](#e0416)
- [Contract appendix `routes/auth.php:1-61`](#e0436)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0257"></a>

> Audit provenance: `platform.md` lines 23–40. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P03 Staff auth/profile

| Screen | Exact input shape/default | Behavior |
|---|---|---|
| Login | email:'',password:'',remember:false | Authenticate, rate-limit, regenerate session, intended dashboard redirect. |
| Register | name:'',email:'',password:'',password_confirmation:'' | Required name max255, valid unique email, confirmed configured-password rule. Do not assume new registration grants organization/admin access. |
| Forgot | email:'' | Required email; throttled reset mail request. |
| Reset | token:props.token,email:props.email,password:'',password_confirmation:'' | Broker checks token; confirmed new password. |
| Confirm | password:'' | Current-password confirmation session. |
| Verify email | no fields | Resend signed verification link, logout; signed/throttled verification route. |
| 2FA setup | enable code:''; disable password:'' | QR/secret/recovery codes, valid TOTP enable, current-password disable. |
| 2FA challenge | code:'',recovery_code:'' | TOTP or single-use recovery code, 5/min route throttle. |
| Profile | name/email preloaded | ProfileUpdateRequest; verification-state effects owned by controller. |
| Password | current_password/password/password_confirmation | Validate old password and confirmed new password; clear sensitive fields after submission. |
| Delete account | password | Destructive authenticated action; invalidate session. |

Evidence: routes/auth.php14-60; routes/web/account.php27-39; AuthenticatedSessionController43-64; TwoFactorController84-132,178-234. Secret encrypted, recovery codes hashed/encrypted. All eight Auth pages, Profile partials, LoginRequest/ProfileUpdateRequest and inline validators included in catalog. UI confirmation is not backend authentication.



<a id="e0307"></a>

> Audit provenance: `platform-source-catalog.md` lines 761–777. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Auth/ConfirmPassword.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Auth/ConfirmPassword.vue:36`: `<TextInput id="password" type="password" v-model="form.password" required autocomplete="current-password" autofocus />`

**Form initial state/defaults:**
```js
12: const form = useForm({
13:     password: '',
14: });
```

**View filters, permission/action and navigation anchors:**
```js
17: form.post(route('password.confirm'), {
```



<a id="e0308"></a>

> Audit provenance: `platform-source-catalog.md` lines 778–799. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Auth/ForgotPassword.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Auth/ForgotPassword.vue:47`: `<TextInput id="email" type="email" v-model="form.email" required autofocus autocomplete="username" />`

**Form initial state/defaults:**
```js
18: const form = useForm({
19:     email: '',
20: });
```

**View filters, permission/action and navigation anchors:**
```js
23: form.post(route('password.email'));
```

**Displayed data/value expressions:**
```text
40: status
```



<a id="e0309"></a>

> Audit provenance: `platform-source-catalog.md` lines 800–825. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Auth/Login.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Auth/Login.vue:48`: `<TextInput id="email" type="email" v-model="form.email" required autofocus autocomplete="username" />`
- `resources/js/Pages/Auth/Login.vue:64`: `<TextInput id="password" type="password" v-model="form.password" required autocomplete="current-password" />`
- `resources/js/Pages/Auth/Login.vue:78`: `<Checkbox name="remember" v-model:checked="form.remember" />`

**Form initial state/defaults:**
```js
22: const form = useForm({
23:     email: '',
24:     password: '',
25:     remember: false,
26: });
```

**View filters, permission/action and navigation anchors:**
```js
29: form.post(route('login'), {
```

**Displayed data/value expressions:**
```text
41: status
```



<a id="e0310"></a>

> Audit provenance: `platform-source-catalog.md` lines 826–848. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Auth/Register.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Auth/Register.vue:35`: `<TextInput id="name" type="text" v-model="form.name" required autofocus autocomplete="name" />`
- `resources/js/Pages/Auth/Register.vue:51`: `<TextInput id="email" type="email" v-model="form.email" required autocomplete="username" />`
- `resources/js/Pages/Auth/Register.vue:66`: `<TextInput id="password" type="password" v-model="form.password" required autocomplete="new-password" />`
- `resources/js/Pages/Auth/Register.vue:84`: `<TextInput id="password_confirmation" type="password" v-model="form.password_confirmation" required autocomplete="new-password" />`

**Form initial state/defaults:**
```js
12: const form = useForm({
13:     name: '',
14:     email: '',
15:     password: '',
16:     password_confirmation: '',
17: });
```

**View filters, permission/action and navigation anchors:**
```js
20: form.post(route('register'), {
```



<a id="e0311"></a>

> Audit provenance: `platform-source-catalog.md` lines 849–870. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Auth/ResetPassword.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Auth/ResetPassword.vue:46`: `<TextInput id="email" type="email" v-model="form.email" required autofocus autocomplete="username" />`
- `resources/js/Pages/Auth/ResetPassword.vue:62`: `<TextInput id="password" type="password" v-model="form.password" required autocomplete="new-password" />`
- `resources/js/Pages/Auth/ResetPassword.vue:80`: `<TextInput id="password_confirmation" type="password" v-model="form.password_confirmation" required autocomplete="new-password" />`

**Form initial state/defaults:**
```js
23: const form = useForm({
24:     token: props.token,
25:     email: props.email,
26:     password: '',
27:     password_confirmation: '',
28: });
```

**View filters, permission/action and navigation anchors:**
```js
31: form.post(route('password.store'), {
```



<a id="e0312"></a>

> Audit provenance: `platform-source-catalog.md` lines 871–895. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Auth/TwoFactorChallenge.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Auth/TwoFactorChallenge.vue:55`: `<TextInput id="code" v-model="form.code" type="text" required maxlength="6" :placeholder="t('auth.twoFactorChallenge.codePlaceholder')" autocomplete="one-time-code" autofocus />`
- `resources/js/Pages/Auth/TwoFactorChallenge.vue:72`: `<TextInput id="recovery_code" v-model="form.recovery_code" type="text" required :placeholder="t('auth.twoFactorChallenge.recoveryPlaceholder')" autofocus />`

**Form initial state/defaults:**
```js
15: const form = useForm({
16:     code: '',
17:     recovery_code: '',
18: });
```

**View filters, permission/action and navigation anchors:**
```js
13: const useRecoveryCode = ref(false);
21: form.post(route('two-factor.challenge.verify'), {
```

**Displayed data/value expressions:**
```text
90: useRecoveryCode ? t('auth.twoFactorChallenge.useCode') : t('auth.twoFactorChallenge.useRecovery')
```



<a id="e0313"></a>

> Audit provenance: `platform-source-catalog.md` lines 896–930. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Auth/TwoFactorSetup.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Auth/TwoFactorSetup.vue:91`: `<input id="password" v-model="disableForm.password" type="password" required autocomplete="current-password" />`
- `resources/js/Pages/Auth/TwoFactorSetup.vue:140`: `<input id="code" v-model="enableForm.code" type="text" required maxlength="6" :placeholder="t('auth.twoFactorChallenge.codePlaceholder')" autocomplete="one-time-code" />`

**Form initial state/defaults:**
```js
22: const enableForm = useForm({
23:     code: '',
24: });
26: const disableForm = useForm({
27:     password: '',
28: });
```

**View filters, permission/action and navigation anchors:**
```js
20: const showRecoveryCodes = ref(false);
31: enableForm.post(route('two-factor.enable'), {
40: disableForm.post(route('two-factor.disable'), {
```

**Displayed data/value expressions:**
```text
59: $t('nav.sections.workspace')
61: $t('nav.settings')
63: $t('nav.twoFactor')
99: disableForm.errors.password
132: secret
150: enableForm.errors.code
161: showRecoveryCodes ? t('auth.twoFactor.hideRecoveryCodes') : t('auth.twoFactor.showRecoveryCodes')
174: code
```



<a id="e0314"></a>

> Audit provenance: `platform-source-catalog.md` lines 931–946. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Auth/VerifyEmail.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**Form initial state/defaults:**
```js
16: const form = useForm({});
```

**View filters, permission/action and navigation anchors:**
```js
19: form.post(route('verification.send'));
22: const verificationLinkSent = computed(
```



<a id="e0335"></a>

> Audit provenance: `platform-source-catalog.md` lines 1641–1645. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Profile/Edit.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.



<a id="e0336"></a>

> Audit provenance: `platform-source-catalog.md` lines 1646–1664. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Profile/Partials/DeleteUserForm.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Profile/Partials/DeleteUserForm.vue:80`: `<TextInput id="password" ref="passwordInput" v-model="form.password" type="password" :placeholder="t('profile.deleteAccount.password')" @keyup.enter="deleteUser" />`

**Form initial state/defaults:**
```js
17: const form = useForm({
18:     password: '',
19: });
```

**View filters, permission/action and navigation anchors:**
```js
14: const confirmingUserDeletion = ref(false);
15: const passwordInput = ref(null);
28: form.delete(route('profile.destroy'), {
```



<a id="e0337"></a>

> Audit provenance: `platform-source-catalog.md` lines 1665–1687. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue:55`: `<TextInput id="current_password" ref="currentPasswordInput" v-model="form.current_password" type="password" autocomplete="current-password" />`
- `resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue:73`: `<TextInput id="password" ref="passwordInput" v-model="form.password" type="password" autocomplete="new-password" />`
- `resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue:91`: `<TextInput id="password_confirmation" v-model="form.password_confirmation" type="password" autocomplete="new-password" />`

**Form initial state/defaults:**
```js
15: const form = useForm({
16:     current_password: '',
17:     password: '',
18:     password_confirmation: '',
19: });
```

**View filters, permission/action and navigation anchors:**
```js
12: const passwordInput = ref(null);
13: const currentPasswordInput = ref(null);
22: form.put(route('password.update'), {
```



<a id="e0338"></a>

> Audit provenance: `platform-source-catalog.md` lines 1688–1701. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.vue:47`: `<TextInput id="name" type="text" v-model="form.name" required autofocus autocomplete="name" />`
- `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.vue:63`: `<TextInput id="email" type="email" v-model="form.email" required autocomplete="username" />`

**Form initial state/defaults:**
```js
22: const form = useForm({
23:     name: user.name,
24:     email: user.email,
25: });
```



<a id="e0356"></a>

> Audit provenance: `platform-source-catalog.md` lines 2478–2552. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Account/Index.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Settings/Account/Index.vue:167`: `<input id="name" :aria-invalid="!!profileForm.errors.name" :aria-describedby="profileForm.errors.name ? 'account-name-error' : undefined" v-model="profileForm.name" type="text" autocomplete="name" required />`
- `resources/js/Pages/Settings/Account/Index.vue:181`: `<input id="email" :aria-invalid="!!profileForm.errors.email" :aria-describedby="profileForm.errors.email ? 'account-email-error' : undefined" v-model="profileForm.email" type="email" autocomplete="email" required />`
- `resources/js/Pages/Settings/Account/Index.vue:216`: `<input id="current_password" :aria-invalid="!!passwordForm.errors.current_password" :aria-describedby="passwordForm.errors.current_password ? 'account-current_password-error' : undefined" v-model="passwordForm.current_password" type="password" required autocomplete="current-password" />`
- `resources/js/Pages/Settings/Account/Index.vue:230`: `<input id="password" :aria-invalid="!!passwordForm.errors.password" :aria-describedby="passwordForm.errors.password ? 'account-password-error' : undefined" v-model="passwordForm.password" type="password" required autocomplete="new-password" />`
- `resources/js/Pages/Settings/Account/Index.vue:244`: `<input id="password_confirmation" :aria-invalid="!!passwordForm.errors.password_confirmation" :aria-describedby="passwordForm.errors.password_confirmation ? 'account-password_confirmation-error' : undefined" v-model="passwordForm.password_confirmation" type="password" required autocomplete="new-password" />`
- `resources/js/Pages/Settings/Account/Index.vue:325`: `<select id="theme" :aria-invalid="!!preferencesForm.errors.theme" :aria-describedby="preferencesForm.errors.theme ? 'account-theme-error' : undefined" v-model="preferencesForm.theme" >`
- `resources/js/Pages/Settings/Account/Index.vue:340`: `<select id="language" :aria-invalid="!!preferencesForm.errors.language" :aria-describedby="preferencesForm.errors.language ? 'account-language-error' : undefined" v-model="preferencesForm.language" >`
- `resources/js/Pages/Settings/Account/Index.vue:353`: `<input id="items_per_page" :aria-invalid="!!preferencesForm.errors.items_per_page" :aria-describedby="preferencesForm.errors.items_per_page ? 'account-items_per_page-error' : undefined" v-model="preferencesForm.items_per_page" type="number" min="10" max="100" />`

**Form initial state/defaults:**
```js
54: const profileForm = useForm({
55:     name: props.user.name || '',
56:     email: props.user.email || '',
57: });
66: const passwordForm = useForm({
67:     current_password: '',
68:     password: '',
69:     password_confirmation: '',
70: });
83: const notificationForm = useForm({
84:     email_notifications: notificationPrefs.email_notifications ?? true,
85:     low_stock_alerts: notificationPrefs.low_stock_alerts ?? true,
86:     order_notifications: notificationPrefs.order_notifications ?? true,
87:     system_notifications: notificationPrefs.system_notifications ?? true,
88:     // Admin-only, opt-in: email about new users, promotions to admin, and
89:     // repeated failed sign-ins.
90:     user_activity_alerts: notificationPrefs.user_activity_alerts ?? false,
91: });
101: const preferencesForm = useForm({
102:     theme: userPrefs.theme || 'dark',
103:     language: userPrefs.language || usePage().props.locale || 'en',
104:     items_per_page: userPrefs.items_per_page || 25,
105: });
```

**Select option values/labels (dynamic options retain their source):**
```html
332: <option value="light">{{ t('settings.account.light') }}</option>
333: <option value="dark">{{ t('settings.account.dark') }}</option>
334: <option value="auto">{{ t('settings.account.auto') }}</option>
347: <option v-for="loc in availableLocales" :key="loc.code" :value="loc.code">{{ loc.name }}</option>
```

**View filters, permission/action and navigation anchors:**
```js
20: const requestedTab = new URLSearchParams(window.location.search).get('tab');
21: const activeTab = ref(tabs.includes(requestedTab) ? requestedTab : 'profile');
23: const tabButtons = ref({});
24: const verticalTabs = ref(false);
33: const tabItems = computed(() => [
60: profileForm.patch(route('settings.account.update.profile'), {
73: passwordForm.patch(route('settings.account.update.password'), {
94: notificationForm.patch(route('settings.account.update.notifications'), {
108: preferencesForm.patch(route('settings.account.update.preferences'), {
```

**Displayed data/value expressions:**
```text
150: tab.label
177: profileForm.errors.name
191: profileForm.errors.email
226: passwordForm.errors.current_password
240: passwordForm.errors.password
254: passwordForm.errors.password_confirmation
287: notificationForm.errors[toggle.key]
336: preferencesForm.errors.theme
347: loc.name
349: preferencesForm.errors.language
363: preferencesForm.errors.items_per_page
```



<a id="e0378"></a>

> Audit provenance: `platform-source-catalog.md` lines 3463–3559. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/Auth/LoginRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests\Auth;
6: 
7: use Illuminate\Auth\Events\Lockout;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Support\Facades\Auth;
10: use Illuminate\Support\Facades\RateLimiter;
11: use Illuminate\Support\Str;
12: use Illuminate\Validation\ValidationException;
13: 
14: /**
15:  * Form request for handling user authentication.
16:  *
17:  * Validates credentials and manages rate limiting for login attempts.
18:  */
19: final class LoginRequest extends FormRequest
20: {
21:     public const MAX_LOGIN_ATTEMPTS = 5;
22:     /**
23:      * Determine if the user is authorized to make this request.
24:      */
25:     public function authorize(): bool
26:     {
27:         return true;
28:     }
29: 
30:     /**
31:      * Get the validation rules that apply to the request.
32:      *
33:      * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
34:      */
35:     public function rules(): array
36:     {
37:         return [
38:             'email' => ['required', 'string', 'email'],
39:             'password' => ['required', 'string'],
40:         ];
41:     }
42: 
43:     /**
44:      * Attempt to authenticate the request's credentials.
45:      *
46:      * @throws \Illuminate\Validation\ValidationException
47:      */
48:     public function authenticate(): void
49:     {
50:         $this->ensureIsNotRateLimited();
51: 
52:         if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
53:             RateLimiter::hit($this->throttleKey());
54: 
55:             throw ValidationException::withMessages([
56:                 'email' => trans('auth.failed'),
57:             ]);
58:         }
59: 
60:         RateLimiter::clear($this->throttleKey());
61:     }
62: 
63:     /**
64:      * Ensure the login request is not rate limited.
65:      *
66:      * @throws \Illuminate\Validation\ValidationException
67:      */
68:     public function ensureIsNotRateLimited(): void
69:     {
70:         if (! RateLimiter::tooManyAttempts($this->throttleKey(), self::MAX_LOGIN_ATTEMPTS)) {
71:             return;
72:         }
73: 
74:         event(new Lockout($this));
75: 
76:         $seconds = RateLimiter::availableIn($this->throttleKey());
77: 
78:         throw ValidationException::withMessages([
79:             'email' => trans('auth.throttle', [
80:                 'seconds' => $seconds,
81:                 'minutes' => ceil($seconds / 60),
82:             ]),
83:         ]);
84:     }
85: 
86:     /**
87:      * Get the rate limiting throttle key for the request.
88:      */
89:     public function throttleKey(): string
90:     {
91:         return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
92:     }
93: }
```



<a id="e0379"></a>

> Audit provenance: `platform-source-catalog.md` lines 3560–3600. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Requests/ProfileUpdateRequest.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Http\Requests;
6: 
7: use App\Models\User;
8: use Illuminate\Foundation\Http\FormRequest;
9: use Illuminate\Validation\Rule;
10: 
11: /**
12:  * Form request for validating user profile updates.
13:  *
14:  * Ensures name and email are valid and email remains unique.
15:  */
16: final class ProfileUpdateRequest extends FormRequest
17: {
18:     /**
19:      * Get the validation rules that apply to the request.
20:      *
21:      * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
22:      */
23:     public function rules(): array
24:     {
25:         return [
26:             'name' => ['required', 'string', 'max:255'],
27:             'email' => [
28:                 'required',
29:                 'string',
30:                 'lowercase',
31:                 'email',
32:                 'max:255',
33:                 Rule::unique(User::class)->ignore($this->user()->id),
34:             ],
35:         ];
36:     }
37: }
```



<a id="e0383"></a>

> Audit provenance: `platform-source-catalog.md` lines 3692–3734. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/AccountSettingsController.php`
```php
31:     public function index(Request $request): Response
35:         return Inertia::render('Settings/Account/Index', [
46:     public function updateProfile(Request $request): RedirectResponse
50:         $validated = $request->validate([
51:             'name' => 'required|string|max:255',
52:             'email' => 'required|email|max:255|unique:users,email,' . $user->id,
53:         ]);
55:         $user->update($validated);
66:     public function updatePassword(Request $request): RedirectResponse
70:         $validated = $request->validate([
71:             'current_password' => 'required|string',
72:             'password' => ['required', 'string', 'confirmed', Password::min(8)],
73:         ]);
80:         $user->update([
93:     public function updateNotifications(Request $request): RedirectResponse
97:         $validated = $request->validate([
98:             'email_notifications' => 'boolean',
99:             'low_stock_alerts' => 'boolean',
100:             'order_notifications' => 'boolean',
101:             'system_notifications' => 'boolean',
102:             'user_activity_alerts' => 'boolean',
103:             // Per-type email choices from the email settings page.
104:             'email_low_stock' => 'boolean',
105:             'email_orders' => 'boolean',
106:             'email_approvals' => 'boolean',
107:         ]);
112:         $user->save();
123:     public function updatePreferences(Request $request): RedirectResponse
127:         $validated = $request->validate([
128:             'theme' => 'nullable|in:light,dark,auto',
129:             'language' => ['nullable', 'string', Rule::in(SetLocale::SUPPORTED_LOCALES)],
130:             'items_per_page' => 'nullable|integer|min:10|max:100',
131:         ]);
136:         $user->save();
149:     public function updateLocale(Request $request): RedirectResponse
151:         $validated = $request->validate([
152:             'locale' => ['required', 'string', Rule::in(SetLocale::SUPPORTED_LOCALES)],
153:         ]);
159:         $user->save();
```



<a id="e0395"></a>

> Audit provenance: `platform-source-catalog.md` lines 3956–3963. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/AuthenticatedSessionController.php`
```php
29:     public function create(): Response
31:         return Inertia::render('Auth/Login', [
43:     public function store(LoginRequest $request): RedirectResponse
58:     public function destroy(Request $request): RedirectResponse
```



<a id="e0396"></a>

> Audit provenance: `platform-source-catalog.md` lines 3964–3974. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/ConfirmablePasswordController.php`
```php
28:     public function show(): Response
30:         return Inertia::render('Auth/ConfirmPassword');
40:     public function store(Request $request): RedirectResponse
42:         if (! Auth::guard('web')->validate([
43:             'email' => $request->user()->email,
44:             'password' => $request->password,
45:         ])) {
```



<a id="e0398"></a>

> Audit provenance: `platform-source-catalog.md` lines 3980–3985. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/EmailVerificationPromptController.php`
```php
26:     public function __invoke(Request $request): RedirectResponse|Response
30:                     : Inertia::render('Auth/VerifyEmail', ['status' => session('status')]);
```



<a id="e0399"></a>

> Audit provenance: `platform-source-catalog.md` lines 3986–3999. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/NewPasswordController.php`
```php
33:     public function create(Request $request): Response
35:         return Inertia::render('Auth/ResetPassword', [
48:     public function store(Request $request): RedirectResponse
50:         $request->validate([
51:             'token' => 'required',
52:             'email' => 'required|email',
53:             'password' => ['required', 'confirmed', Rules\Password::defaults()],
54:         ]);
61:             function ($user) use ($request) {
65:                 ])->save();
```



<a id="e0400"></a>

> Audit provenance: `platform-source-catalog.md` lines 4000–4009. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/PasswordController.php`
```php
26:     public function update(Request $request): RedirectResponse
28:         $validated = $request->validate([
29:             'current_password' => ['required', 'current_password'],
30:             'password' => ['required', Password::defaults(), 'confirmed'],
31:         ]);
33:         $request->user()->update([
```



<a id="e0401"></a>

> Audit provenance: `platform-source-catalog.md` lines 4010–4019. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/PasswordResetLinkController.php`
```php
28:     public function create(): Response
30:         return Inertia::render('Auth/ForgotPassword', [
42:     public function store(Request $request): RedirectResponse
44:         $request->validate([
45:             'email' => 'required|email',
46:         ]);
```



<a id="e0403"></a>

> Audit provenance: `platform-source-catalog.md` lines 4034–4067. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/TwoFactorController.php`
```php
33:     public function __construct()
41:     public function setup(Request $request): Response
48:             return Inertia::render('Auth/TwoFactorSetup', [
73:         return Inertia::render('Auth/TwoFactorSetup', [
84:     public function enable(Request $request): RedirectResponse
86:         $request->validate([
87:             'code' => 'required|string|size:6',
88:         ]);
108:         $enabledUser = DB::transaction(function () use ($request, $secret, $recoveryCodes) {
109:             $user = $request->user()->newQuery()->lockForUpdate()->findOrFail($request->user()->getKey());
117:             $user->update([
142:     public function disable(Request $request): RedirectResponse
144:         $request->validate([
145:             'password' => 'required|string',
146:         ]);
153:         $request->user()->update([
170:     public function challenge(Request $request): Response
172:         return Inertia::render('Auth/TwoFactorChallenge');
178:     public function verifyChallenge(Request $request): RedirectResponse
187:         $request->validate([
188:             'code' => 'required|string|size:6',
189:         ]);
209:     protected function verifyRecoveryCode(Request $request, $user): RedirectResponse
214:             DB::transaction(function () use ($user, $recoveryCode) {
215:                 $locked = $user->newQuery()->lockForUpdate()->findOrFail($user->getKey());
225:                 ])->save();
242:     protected function generateQrCodeSvg(string $url): string
259:     protected function generateRecoveryCodes(): array
279:     public static function hashRecoveryCodes(array $codes): array
295:     public static function findAndConsumeRecoveryCode(string $input, array &$storedCodes): ?int
```



<a id="e0404"></a>

> Audit provenance: `platform-source-catalog.md` lines 4068–4072. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Auth/VerifyEmailController.php`
```php
26:     public function __invoke(EmailVerificationRequest $request): RedirectResponse
```



<a id="e0416"></a>

> Audit provenance: `platform-source-catalog.md` lines 4401–4413. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/ProfileController.php`
```php
30:     public function edit(Request $request): Response
32:         return Inertia::render('Profile/Edit', [
44:     public function update(ProfileUpdateRequest $request): RedirectResponse
52:         $request->user()->save();
63:     public function destroy(Request $request): RedirectResponse
65:         $request->validate([
66:             'password' => ['required', 'current_password'],
67:         ]);
73:         $user->delete();
```



<a id="e0436"></a>

> Audit provenance: `platform-source-catalog.md` lines 5303–5367. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Contract appendix `routes/auth.php:1-61`
```php
1: <?php
2: 
3: use App\Http\Controllers\Auth\AuthenticatedSessionController;
4: use App\Http\Controllers\Auth\ConfirmablePasswordController;
5: use App\Http\Controllers\Auth\EmailVerificationNotificationController;
6: use App\Http\Controllers\Auth\EmailVerificationPromptController;
7: use App\Http\Controllers\Auth\NewPasswordController;
8: use App\Http\Controllers\Auth\PasswordController;
9: use App\Http\Controllers\Auth\PasswordResetLinkController;
10: use App\Http\Controllers\Auth\RegisteredUserController;
11: use App\Http\Controllers\Auth\VerifyEmailController;
12: use Illuminate\Support\Facades\Route;
13: 
14: Route::middleware('guest')->group(function () {
15:     Route::get('register', [RegisteredUserController::class, 'create'])
16:         ->name('register');
17: 
18:     Route::post('register', [RegisteredUserController::class, 'store']);
19: 
20:     Route::get('login', [AuthenticatedSessionController::class, 'create'])
21:         ->name('login');
22: 
23:     Route::post('login', [AuthenticatedSessionController::class, 'store']);
24: 
25:     Route::get('forgot-password', [PasswordResetLinkController::class, 'create'])
26:         ->name('password.request');
27: 
28:     Route::post('forgot-password', [PasswordResetLinkController::class, 'store'])
29:         ->middleware('throttle:5,1')
30:         ->name('password.email');
31: 
32:     Route::get('reset-password/{token}', [NewPasswordController::class, 'create'])
33:         ->name('password.reset');
34: 
35:     Route::post('reset-password', [NewPasswordController::class, 'store'])
36:         ->middleware('throttle:5,1')
37:         ->name('password.store');
38: });
39: 
40: Route::middleware('auth')->group(function () {
41:     Route::get('verify-email', EmailVerificationPromptController::class)
42:         ->name('verification.notice');
43: 
44:     Route::get('verify-email/{id}/{hash}', VerifyEmailController::class)
45:         ->middleware(['signed', 'throttle:6,1'])
46:         ->name('verification.verify');
47: 
48:     Route::post('email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
49:         ->middleware('throttle:6,1')
50:         ->name('verification.send');
51: 
52:     Route::get('confirm-password', [ConfirmablePasswordController::class, 'show'])
53:         ->name('password.confirm');
54: 
55:     Route::post('confirm-password', [ConfirmablePasswordController::class, 'store']);
56: 
57:     Route::put('password', [PasswordController::class, 'update'])->name('password.update');
58: 
59:     Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
60:         ->name('logout');
61: });
```

