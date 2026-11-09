# 36. Storage, Uploads and Downloads — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Storage, Uploads and Downloads as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Taruvi-native images/attachments/generated documents; upload validation and ownership; purpose mapping; authorized retrieval and cleanup.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Settings/Storage.vue` | Pending | Pending |

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

- [ ] Enforce size/type/count and tenant ownership on server.
- [ ] readback after reload succeeds.
- [ ] inaccessible object cannot be fetched by guessed ID.
- [ ] failed uploads do not create false success or orphaned record references.
- [ ] durable identifiers are not expiring URLs.

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

- [Components/ImageUploader](#e0054)
- [2026_10_21_230000_record_upload_storage_disks.php](#e0154)
- [`resources/js/Pages/Settings/Storage.vue`](#e0364)
- [`app/Http/Controllers/Admin/StorageSettingsController.php`](#e0392)
- [Supplemental complete source `app/Support/StorageAdministration.php`](#e0458)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0054"></a>

> Audit provenance: `inventory.md` lines 2446–2478. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Components/ImageUploader

Product form image collection. File chooser multiple image/*; accepts image file MIME, per-file 5MB and max 5 supplied by parent. Uses FileReader data URLs for previews; remove by index. Existing image URL previews carried on edit; backend verifies existing image belongs to product. No server upload occurs until product save in these forms.

Source: [resources/js/Components/ImageUploader.vue:1](C:/Users/proj/Inventoros/resources/js/Components/ImageUploader.vue#L1).

**Initial payload and local-state defaults (exact source expressions):**

```js
// resources/js/Components/ImageUploader.vue:25
const images = ref([...props.modelValue]);
// resources/js/Components/ImageUploader.vue:26
const isDragging = ref(false);
// resources/js/Components/ImageUploader.vue:27
const fileInput = ref(null);
// resources/js/Components/ImageUploader.vue:28
const error = ref('');
```

**Every input/bound component, including dialogs and row fields:**

| Key / source | Visible label | Control and initial value | Required / constraints / dependencies (exact UI attributes) | Ancestor condition / repetition |
|---|---|---|---|---|
| (unbound) — [resources/js/Components/ImageUploader.vue:116](C:/Users/proj/Inventoros/resources/js/Components/ImageUploader.vue#L116) | No explicit label / see context | file; See :value / :checked and event handler; not a v-model field | ref="fileInput"; type="file"; accept="image/*"; multiple; @change="handleFileSelect" | v-if="canAddMore" |

**Actions/navigation, visibility and disabling conditions:**

| Label / source | Handler / route / exact constraints | Conditional ancestry |
|---|---|---|
| (icon-only; accessible label/title in attributes) — [resources/js/Components/ImageUploader.vue:165](C:/Users/proj/Inventoros/resources/js/Components/ImageUploader.vue#L165) | v-if="index &gt; 0"; @click="moveImage(index, index - 1)"; type="button"; :title="t('components.imageUploader.moveLeft')" | v-if="images.length &gt; 0" → v-for="(image, index) in images" |
| (icon-only; accessible label/title in attributes) — [resources/js/Components/ImageUploader.vue:178](C:/Users/proj/Inventoros/resources/js/Components/ImageUploader.vue#L178) | @click="removeImage(index)"; type="button"; :title="t('components.imageUploader.remove')" | v-if="images.length &gt; 0" → v-for="(image, index) in images" |
| (icon-only; accessible label/title in attributes) — [resources/js/Components/ImageUploader.vue:190](C:/Users/proj/Inventoros/resources/js/Components/ImageUploader.vue#L190) | v-if="index &lt; images.length - 1"; @click="moveImage(index, index + 1)"; type="button"; :title="t('components.imageUploader.moveRight')" | v-if="images.length &gt; 0" → v-for="(image, index) in images" |



<a id="e0154"></a>

> Audit provenance: `inventory.md` lines 6236–6243. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### 2026_10_21_230000_record_upload_storage_disks.php
[database/migrations/2026_10_21_230000_record_upload_storage_disks.php:1](C:/Users/proj/Inventoros/database/migrations/2026_10_21_230000_record_upload_storage_disks.php#L1)

```php
11:         Schema::table('products', fn (Blueprint $table) => $table->json('image_disks')->nullable());
18:         Schema::table('products', fn (Blueprint $table) => $table->dropColumn('image_disks'));
```



<a id="e0364"></a>

> Audit provenance: `platform-source-catalog.md` lines 2910–2932. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Settings/Storage.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
No bound editable control found in this page; actions/data may be delegated to imported components.

**View filters, permission/action and navigation anchors:**
```js
13: const results = ref(Object.fromEntries(props.disks.map(disk => [disk.name, disk.last_check])));
14: const checking = ref(null);
15: const requestError = ref(null);
22: const response = await axios.post(route('settings.storage.check'), { disk });
```

**Displayed data/value expressions:**
```text
46: disk.name
48: disk.driver || t('storage.notConfigured')
49: disk.purposes.map(purpose => t(`storage.purposes.${purpose}`)).join(', ')
50: disk.bucket
51: disk.region
61: checking === disk.name ? t('storage.checking') : t('storage.check')
```



<a id="e0392"></a>

> Audit provenance: `platform-source-catalog.md` lines 3902–3913. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/StorageSettingsController.php`
```php
18:     public function index(Request $request, FileStorageService $storage): Response
20:         abort_unless(StorageAdministration::canManage($request->user()), 403);
22:         return Inertia::render('Settings/Storage', ['disks' => $storage->disks()]);
25:     public function check(Request $request, FileStorageService $storage): JsonResponse
27:         abort_unless(StorageAdministration::canManage($request->user()), 403);
28:         $data = $request->validate([
29:             'disk' => ['required', 'string', Rule::in(array_values($storage->purposes()))],
30:         ]);
```



<a id="e0458"></a>

> Audit provenance: `platform-source-catalog.md` lines 10243–10265. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Supplemental complete source `app/Support/StorageAdministration.php`
```php
1: <?php
2: 
3: declare(strict_types=1);
4: 
5: namespace App\Support;
6: 
7: use App\Models\User;
8: 
9: final class StorageAdministration
10: {
11:     public static function canManage(?User $user): bool
12:     {
13:         // Storage configuration and connection probes affect every tenant.
14:         return $user !== null
15:             && $user->is_admin
16:             && $user->hasPermission('manage_organization')
17:             && PluginAdministration::isAdministratorOrganization($user);
18:     }
19: }
```

