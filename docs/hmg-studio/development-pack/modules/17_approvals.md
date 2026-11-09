# 17. Approvals — End-to-End Development Specification

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

**Status:** Specification prepared; implementation and runtime verification pending.  
**Source audit:** 6 November 2026, revision `1f78e818d9aee025020fe7489955f4f0c448c53a`.  
**Goal:** Deliver Approvals as a persistent, authorized, working module—not just sidebar navigation.

## Required scope

Unified approval queue; embedded approval panels; order/PO/adjustment/transfer decisions; thresholds; reviewer/self-approval rules; notes and history.

## Dependencies and shared ownership

Read [architecture](../01_ARCHITECTURE_TARUVI_PYTHON.md), [schema/capability gates](../03_SCHEMA_AND_SERVICE_CONTRACTS.md), and [execution sequence](../02_EXECUTION_PLAN.md) before implementing. Related modules: [Roles and Permission Sets](../modules/31_roles_permissions.md), [Organization, Email and Preferences](../modules/33_organization_settings.md).

Dependencies describe integration contracts, not a requirement to finish every related screen first. Build shared authority/identity/ledger interfaces first, then use the sequenced vertical slices. Never create a separate stock, money, permissions or identity implementation inside this module.

## Owned source views

| Source view | Target route/component | Evidence / disposition |
|---|---|---|
| `resources/js/Pages/Approvals/Index.vue` | Pending | Pending |

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

- [ ] Each configured workflow enters the correct queue.
- [ ] reject unauthorized/self decisions when prohibited.
- [ ] enforce each endpoint note limit.
- [ ] stale/repeated decisions cannot apply stock twice.
- [ ] approval status is not confused with document status.

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

- [Approval center and embedded panel](#e0172)
- [resources/js/Pages/Approvals/Index.vue](#e0200)
- [resources/js/Components/ApprovalPanel.vue](#e0201)
- [routes/web/approvals.php](#e0231)

---

## Detailed fields, views, validators and workflow evidence

<a id="e0172"></a>

> Audit provenance: `commerce.md` lines 92–99. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### Approval center and embedded panel

Queue has Pending and My requests tabs (choose Pending when any pending or no own requests). Types purchase_order, stock_adjustment, stock_transfer, sales_order. Inline approve/reject `notes` starts blank; approve optional max1000, reject required max1000. Panel visible only when approval status exists or approval needed; server canDecide/canSubmit gates actions. Submission has no editable payload. Sales order's dedicated approval modal uses dedicated order routes with notes max500 (approval optional, rejection required), unlike the shared queue's max1000. Preserve this source distinction rather than silently merge limits.

Permission mapping: approve_purchase_orders, approve_stock_adjustments, approve_stock_transfers, approve_orders. Server enforces organization, warehouse access, one decision under lock, self-approval disabled except configured admin allowance. UI-only disabling is not enforcement. Sales-order rejection must restore stock through OrderService, whereas approving a held stock-adjustment executes its pending movement.

Evidence: [Approval types/permission ownership](C:/Users/proj/Inventoros/app/Services/ApprovalService.php#L46), [decision authorization](C:/Users/proj/Inventoros/app/Services/ApprovalService.php#L479), [decision field validation](C:/Users/proj/Inventoros/app/Http/Controllers/ApprovalController.php#L35).



<a id="e0200"></a>

> Audit provenance: `commerce.md` lines 2711–2771. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Pages/Approvals/Index.vue

Source: [resources/js/Pages/Approvals/Index.vue:1](C:/Users/proj/Inventoros/resources/js/Pages/Approvals/Index.vue#L1).


**Named routes referenced:** Dynamic/component props; see action expressions..


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**UI state/filter defaults:**

```text
20: const tab = ref(props.pending.length > 0 || props.mine.length === 0 ? 'pending' : 'mine');
40: const open = ref(null);
41: const mode = ref(null);
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `form.notes` | mode === 'reject' ? Reason for rejecting (required) : Note for the requester (optional) | textarea | :required=mode === 'reject'; maxlength=1000 | — | [resources/js/Pages/Approvals/Index.vue:159](C:/Users/proj/Inventoros/resources/js/Pages/Approvals/Index.vue#L159) |


**Exact `form` defaults / hydration / hidden payload** — [resources/js/Pages/Approvals/Index.vue:42](C:/Users/proj/Inventoros/resources/js/Pages/Approvals/Index.vue#L42)

```text
42: const form = useForm({ notes: '' });
43: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| key === 'pending' ? Waiting for me : My requests pending.length | `type=button; @click=tab = key` | [resources/js/Pages/Approvals/Index.vue:84](C:/Users/proj/Inventoros/resources/js/Pages/Approvals/Index.vue#L84) |

| Open | `v-if=item.type !== 'stock_adjustment'; :href=item.url` | [resources/js/Pages/Approvals/Index.vue:137](C:/Users/proj/Inventoros/resources/js/Pages/Approvals/Index.vue#L137) |

| Approve | `@click=start(item, 'approve')` | [resources/js/Pages/Approvals/Index.vue:149](C:/Users/proj/Inventoros/resources/js/Pages/Approvals/Index.vue#L149) |

| Reject | `@click=start(item, 'reject')` | [resources/js/Pages/Approvals/Index.vue:150](C:/Users/proj/Inventoros/resources/js/Pages/Approvals/Index.vue#L150) |

| mode === 'reject' ? Confirm rejection : Confirm approval | `type=submit; :loading=form.processing; :disabled=form.processing` | [resources/js/Pages/Approvals/Index.vue:169](C:/Users/proj/Inventoros/resources/js/Pages/Approvals/Index.vue#L169) |

| Cancel | `@click=cancel` | [resources/js/Pages/Approvals/Index.vue:179](C:/Users/proj/Inventoros/resources/js/Pages/Approvals/Index.vue#L179) |


**Conditional sections / submit boundaries (source expressions):**

```text
100: <Card v-if="items.length === 0">
138: v-if="item.type !== 'stock_adjustment'"
148: <template v-if="tab === 'pending' && item.can_decide && open !== keyOf(item)">
155: <form v-if="open === keyOf(item)" class="mt-4 border-t border-border-subtle pt-4" @submit.prevent="decide(item)">
```




<a id="e0201"></a>

> Audit provenance: `commerce.md` lines 2772–2842. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### resources/js/Components/ApprovalPanel.vue

Source: [resources/js/Components/ApprovalPanel.vue:1](C:/Users/proj/Inventoros/resources/js/Components/ApprovalPanel.vue#L1).


**Named routes referenced:** Dynamic/component props; see action expressions..


**Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..


**Sections / displayed fields / table columns:**

- h3: Approval (L86)


**UI state/filter defaults:**

```text
36: const mode = ref(null); // null | 'approve' | 'reject'
```


| Binding / key | Label | Control | Constraints / dependencies | Options | Evidence |
|---|---|---|---|---|---|

| `decision.notes` | mode === 'reject' ? Reason for rejecting (required) : Note for the requester (optional) | textarea | :required=mode === 'reject'; maxlength=1000 | — | [resources/js/Components/ApprovalPanel.vue:125](C:/Users/proj/Inventoros/resources/js/Components/ApprovalPanel.vue#L125) |


**Exact `decision` defaults / hydration / hidden payload** — [resources/js/Components/ApprovalPanel.vue:37](C:/Users/proj/Inventoros/resources/js/Components/ApprovalPanel.vue#L37)

```text
37: const decision = useForm({ notes: '' });
38: const submission = useForm({});
```



**Exact `submission` defaults / hydration / hidden payload** — [resources/js/Components/ApprovalPanel.vue:38](C:/Users/proj/Inventoros/resources/js/Components/ApprovalPanel.vue#L38)

```text
38: const submission = useForm({});
39: 
```



| Action label | Route / handler / visibility / busy condition | Evidence |
|---|---|---|

| Submit for approval | `v-if=canSubmit && submitUrl; :loading=submission.processing; :disabled=submission.processing; @click=submit` | [resources/js/Components/ApprovalPanel.vue:103](C:/Users/proj/Inventoros/resources/js/Components/ApprovalPanel.vue#L103) |

| Approve | `@click=mode = 'approve'` | [resources/js/Components/ApprovalPanel.vue:115](C:/Users/proj/Inventoros/resources/js/Components/ApprovalPanel.vue#L115) |

| Reject | `@click=mode = 'reject'` | [resources/js/Components/ApprovalPanel.vue:116](C:/Users/proj/Inventoros/resources/js/Components/ApprovalPanel.vue#L116) |

| mode === 'reject' ? Confirm rejection : Confirm approval | `type=submit; :loading=decision.processing; :disabled=decision.processing` | [resources/js/Components/ApprovalPanel.vue:135](C:/Users/proj/Inventoros/resources/js/Components/ApprovalPanel.vue#L135) |

| Cancel | `@click=mode = null; decision.reset(); decision.clearErrors()` | [resources/js/Components/ApprovalPanel.vue:145](C:/Users/proj/Inventoros/resources/js/Components/ApprovalPanel.vue#L145) |


**Conditional sections / submit boundaries (source expressions):**

```text
80: <Card v-if="visible">
104: v-if="canSubmit && submitUrl"
114: <template v-if="canDecide && status === 'pending' && !mode">
121: <form v-if="mode" class="mt-4 border-t border-border-subtle pt-4" @submit.prevent="decide">
```




<a id="e0231"></a>

> Audit provenance: `commerce.md` lines 4291–4305. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

### routes/web/approvals.php

[routes/web/approvals.php:1](C:/Users/proj/Inventoros/routes/web/approvals.php#L1)

```php
19: Route::get('/approvals', [ApprovalController::class, 'index'])->name('approvals.index');
20: Route::post('/approvals/{type}/{id}/approve', [ApprovalController::class, 'approve'])
21:     ->whereIn('type', \App\Services\ApprovalService::TYPES)->whereNumber('id')
22:     ->name('approvals.approve');
23: Route::post('/approvals/{type}/{id}/reject', [ApprovalController::class, 'reject'])
24:     ->whereIn('type', \App\Services\ApprovalService::TYPES)->whereNumber('id')
25:     ->name('approvals.reject');
```


