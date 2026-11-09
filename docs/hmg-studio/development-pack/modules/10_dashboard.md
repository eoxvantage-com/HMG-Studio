# 10. Dashboard — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Dashboard as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Permission-aware KPI cards; warehouse and currency scope; widget preferences; replenishment; recent orders; financial watch and quick actions.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Organization, Email and Preferences](../modules/33_organization_settings.md), [Roles and Permission Sets](../modules/31_roles_permissions.md), [Reports, Builder and Schedules](../modules/28_reports.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Dashboard.vue` | Pending | Pending |

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

- [ ] Dashboard numbers reconcile to source records for the selected scope.
- [ ] forbidden financial data is absent from the response, not merely hidden.
- [ ] preference changes survive reload.

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

- [P02 Dashboard](#e0256)
- [`resources/js/Pages/Dashboard.vue`](#e0315)
- [`app/Http/Controllers/Admin/DashboardController.php`](#e0386)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0256"></a>

> Audit provenance: `platform.md` lines 17–22. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## P02 Dashboard

View: statistics, revenue, stock movement, low-stock, recent orders/products, top products, stock by category, reorder suggestions, plugin widgets, administrator scheduler warnings (`Admin/DashboardController.php:310-388`). Exact displayed expressions in catalog Dashboard.vue.

Personalization PATCH settings/dashboard-widgets: widgets boolean object keys stats_overview,revenue_chart,stock_movements,low_stock_alerts,recent_orders,recent_products,top_products,stock_by_category,reorder_suggestions. Defaults true; persisted preferences merge defaults; reject unknown keys. Preferences do NOT grant access. Product datasets view_products; order data view_orders; money view_reports; receivables also view_payments; activity view_activity_log. Values withheld at controller, not only CSS (`43-62,326-345`). Currency-separated aggregates must not become mixed-currency totals. Plugin slots header/beforeStats/afterStats/beforeContent/afterContent/widgets/footer.



<a id="e0315"></a>

> Audit provenance: `platform-source-catalog.md` lines 947–1046. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `resources/js/Pages/Dashboard.vue`

**Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- `resources/js/Pages/Dashboard.vue:695`: `<input v-model="widgetDraft[key]" type="checkbox" />`

**Visible table headers:**
```text
385: {{ t('nav.orders') }} / {{ t('nav.customers') }}
386: {{ t('common.status') }}
387: {{ t('common.date') }}
388: {{ t('common.total') }}
389: {{ t('common.actions') }}
556: 
566: {{ t('common.product') }}
567: {{ t('purchaseOrders.supplier') }}
568: {{ t('products.stock') }}
569: {{ t('dashboard.reorderSuggestions.reorderAt') }}
570: {{ t('quickReorder.suggestedQty') }}
571: {{ t('common.actions') }}
```

**View filters, permission/action and navigation anchors:**
```js
65: const widgetDraft = ref({});
66: const showCustomizeModal = ref(false);
67: const showSystemModal = ref(false);
68: const saving = ref(false);
69: const preferenceError = ref(false);
70: const selectedProduct = ref(null);
71: const widgetLabels = computed(() => ({
89: await axios.patch(route('settings.dashboard-widgets.update'), { widgets: { ...widgetDraft.value } });
103: .filter((row) => row.currency !== props.currency && Number(row.amount) !== 0)
108: const optionalRoute = (name, parameters) => (canVisit(name) ? route(name, parameters) : null);
109: const headlineMetrics = computed(() => {
115: .filter(Boolean)
160: ].filter(Boolean);
162: const financialStats = computed(() =>
177: ].filter(Boolean)
180: const categories = computed(() => categoryBreakdown(props.stockByCategory, props.stats.totalValue));
182: const categoryProductCount = computed(() => props.stockByCategory.reduce((sum, row) => sum + Number(row.count), 0));
189: const quickActions = computed(() =>
195: ].filter((action) => canVisit(action.route)),
206: const quickReorder = useQuickReorder(computed(() => props.reorderSuggestions));
207: const selectedSuggestion = computed(() => props.reorderSuggestions.find((row) => row.id === selectedProduct.value?.id));
```

**Displayed data/value expressions:**
```text
231: displayCalendarDate(generatedAt)
282: formatNumber(stats.lowStockProducts)
309: product.name
312: product.category?.name || t('products.show.uncategorized')
313: product.location.name
321: formatPlainNumber(stockLevel(product).stock)
324: formatPlainNumber(stockLevel(product).minimum)
368: formatNumber(recentOrders.length)
397: order.order_number
400: order.customer_name
406: orderStatusLabel(order.status, { t, te })
411: displayCalendarDate(order.order_date)
412: formatCurrency(order.total, order.currency)
426: formatNumber(recentOrders.length)
426: formatNumber(stats.totalOrders)
440: currency
451: categoryName(category)
452: formatCurrency(category.value)
453: formatShare(category.share)
456: plusOthers(category.values)
464: formatNumber(categoryProductCount)
464: currency
465: formatCurrency(stats.totalValue)
492: stat.label
493: formatCompactCurrency(stats[stat.key])
494: stat.context
494: currency
495: otherCurrencies(stat.key)
505: action.label
514: formatNumber(recentProducts.length)
522: product.name
523: product.category?.name || t('products.show.uncategorized')
526: formatCurrency(product.price, product.currency)
541: reorderSuggestions.length
594: row.name
596: row.sku
596: row.category
604: row.supplier
616: row.stock
618: row.reorder_point
620: row.suggested_quantity
694: label
722: systemWarningMessage(warning)
741: selectedProduct.name
745: formatPlainNumber(stockLevel(selectedProduct).stock)
749: formatPlainNumber(stockLevel(selectedProduct).minimum)
753: formatPlainNumber(stockLevel(selectedProduct).shortfall)
758: selectedSuggestion.supplier || t('quickReorder.noSupplier')
762: formatPlainNumber(selectedSuggestion.suggested_quantity)
766: selectedSuggestion ? t('dashboard.reorderSuggestions.subtitle') : t('dashboard.design.shortfallHelp')
```



<a id="e0386"></a>

> Audit provenance: `platform-source-catalog.md` lines 3766–3785. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### `app/Http/Controllers/Admin/DashboardController.php`
```php
41:     public function index()
113:         $money = function (string $key, iterable $amounts) use (&$stats, &$byCurrency, $currency): void {
206:             ->leftJoin('product_categories', function ($join) use ($orgId) {
217:             ->map(function ($rows) use ($currency) {
231:         $recentActivity = ! $canViewActivity ? collect() : ActivityLog::where('organization_id', $user->organization_id)
236:             ->map(function ($log) {
258:             ->map(function ($product) use ($reorder) {
285:             ->map(function ($movement) {
306:             ->each(function (Product $product) use ($currency) {
388:         return Inertia::render('Dashboard', $data);
396:     public function updateWidgets(Request $request): JsonResponse
410:         $request->validate([
411:             'widgets' => ['required', 'array'],
412:             'widgets.*' => ['boolean'],
413:         ]);
427:         $user->update([
```

