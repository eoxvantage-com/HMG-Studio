# Shared contracts — shared-gaps.md

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

Read only the relevant sections for the active module; this file owns mixed-module registers and common rules. Return to [START HERE](../00_START_HERE.md).

- [Shared-component completeness gap audit](#e0461)
- [Method and result](#e0462)
- [G01 Import file picker — substantive omitted control](#e0463)
- [G02 Import result — substantive result-state ownership](#e0464)
- [G04 Generic filter disclosure — owns state, not filter values](#e0466)
- [G05 Primitive input contracts — not additional domain fields](#e0467)
- [G06 Generic modal/table — not hidden creation workflows](#e0468)
- [G07 Plugin render hosts — omitted dynamic-control boundary](#e0469)
- [G08 Image viewer — read-only interactive behavior](#e0470)
- [Proposed acceptance and boundary](#e0471)
- [Complete shared-component ledger](#e0472)

<a id="e0461"></a>

> Audit provenance: `shared-gaps.md` lines 1–2. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

# Shared-component completeness gap audit



<a id="e0462"></a>

> Audit provenance: `shared-gaps.md` lines 3–8. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Method and result

Read-only final comparison against the platform source contracts distributed across this pack, the commerce contracts distributed across this pack, the original inventory extraction (its contracts are embedded in this pack); no module re-audit or mutations. Compared exact normalized repository paths, then examined previously unlisted shared components owning inputs/emits/actions. Source root `C:/Users/proj/Inventoros`. Presence proves inventory traceability, not every runtime branch or visual state.

**All123 Vue Page paths appear across the three reports. No missing Page paths.** The scan is path coverage, not a claim of behavioral completeness. Below closes omitted shared-control ownership, and distinguishes generic primitives from business forms.



<a id="e0463"></a>

> Audit provenance: `shared-gaps.md` lines 9–20. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## G01 Import file picker — substantive omitted control

Source `resources/js/Components/ImportExport/FileDrop.vue:10-48,61-98`.

- Props `modelValue: Object|null`, default null; `inputId:String`, required.
- Native file input `type=file`, id=inputId, accept `.csv,.xlsx,.xls`; no multiple attribute. Browse invokes native picker; selection or drop uses ONLY first File. Drop accept is not enforced by this component.
- Emit `update:modelValue(File|null)` on change/drop/clear. No endpoint submission or business validation; parent import form owns send and backend rule.
- Internal input ref null/isDragging false. Dragover true, dragleave/drop false. Existing selection displays `modelValue.name` and ready-to-import message; remove emits null.
- Watch clearing parent model resets native input.value so same file can be selected again.
- **Intentional evidence distinction:** backend import rules also allow txt, whereas browse accept does not list txt. UI accept is not MIME/size validation. Source backend `app/Http/Controllers/Import/ImportExportController.php:46`.
- Acceptance: select/drop first of several; clear/reselect same file; spoof extension rejected backend; failed upload retains actionable error; no server record is created merely by selection.



<a id="e0464"></a>

> Audit provenance: `shared-gaps.md` lines 21–30. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## G02 Import result — substantive result-state ownership

Source `resources/js/Components/ImportExport/ImportResult.vue:3-9,16-36,40-95`.

- Required `result:Object`: `{type,message,stats:{imported,updated?,skipped?,failed?,errors:[{row,errors}],warnings:[{row,warnings}]}}`.
- stats fallback `{}`,errors/warnings fallback `[]`. Render counts only if corresponding value is numeric (zero is valid), not truthy-only.
- Render result.message; imported/updated/skipped/failed summary; separate scrollable row-error and row-warning lists with original row numbers; errors/warnings arrays joined for display.
- Emit `dismiss` from close button; no database deletion. Global flash strings are not a substitute for this structured partial-result view.
- Acceptance: zero counts, mixed successes/errors, warnings-only duplicate SKU skips, dismiss without losing persisted import results elsewhere.



<a id="e0466"></a>

> Audit provenance: `shared-gaps.md` lines 41–50. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## G04 Generic filter disclosure — owns state, not filter values

Source `resources/js/Components/ui/TableFilters.vue:7-41,48-74`.

- Props padded:Boolean true,label:String null,enabled:Boolean true; expanded false,panel null.
- Named quick slot and default filter-content slot. Does NOT own business search/date/status bindings; parent pages already specify them.
- Active count from page.props.filters excludes per_page/page/sort_by/sort_dir and null/undefined/empty/'all'. Boolean-like out_of_stock/include_zero/low_stock count only true,1,'1','true'. Literal search text 'false' remains real filter.
- Details toggle synchronizes expanded; submit closes; Escape closes and focuses summary; outside pointer closes; listener removed on unmount. enabled=false hides disclosure, not quick slot.
- Acceptance: count switches correctly; Escape/focus; outside click; form submit closes without changing submitted values.



<a id="e0467"></a>

> Audit provenance: `shared-gaps.md` lines 51–56. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## G05 Primitive input contracts — not additional domain fields

- `resources/js/Components/Checkbox.vue:4-24,28-33`: required checked:Array|Boolean; value defaultnull; proxy native checkbox emits **update:checked**, not update:modelValue. Parent array selection and booleans supported; no backend validation.
- `resources/js/Components/TextInput.vue:4-17,21-24`: defineModel String required; native input inherits caller attributes; mounted autofocus honored; exposes focus(). Required component model is not an assertion HTML required attribute exists on every caller.
- `resources/js/Components/ui/Input.vue:4-19,33-40`: modelValue:String|Number default'',type=text,placeholder='',disabled=false,invalid=false,size=md validator sm|md|lg. Explicit attrs forwarded to input; invalid aria-invalid; emits update:modelValue with **event.target.value string**, even number-type display unless caller normalizes. Prefix/suffix presentation slots. No database writes.



<a id="e0468"></a>

> Audit provenance: `shared-gaps.md` lines 57–61. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## G06 Generic modal/table — not hidden creation workflows

- `resources/js/Components/QuickAddModal.vue:5-38,42-95`: show=false,title required String,loading=false,maxWidth=md (mapped sm/md/lg/xl/2xl); emits close via backdrop/header/cancel; content/actions slots; loading overlay. **No owned create fields, validator, API call or submit handler**. Parent modal slot owns business form already inventoried. Avoid inventing a standalone QuickAdd datatable.
- `resources/js/Components/ui/DataTable.vue:17-41,65-104`: required columns/rows arrays; columns shape key,label,align?,class?,width?; rowHref optional function; rowKey String|Function defaultid (fallback index); loading=false,dense=false. Emits row-click(row); rowHref wraps cells in navigation Link; cell-{key}/empty/footer slots. No sort/paging mutation internally. loading prop exists but template does not itself render a loading state; don't promise spinner from this prop alone.



<a id="e0469"></a>

> Audit provenance: `shared-gaps.md` lines 62–69. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## G07 Plugin render hosts — omitted dynamic-control boundary

These hosts do not own fixed input schemas; plugin implementations supply them. Existing bundled plugin controls already cataloged; future arbitrary plugins cannot be exhaustively specified from today's files.

- `resources/js/Components/PluginSlot.vue:6-50,55-60`: required slot:String,context:Object default{},components:Array default[],page:String null default current Inertia-derived page ID. Merge server placements and runtime registrations, resolve component, filter unavailable, sort position(default server100). Runtime registration wins over build-time resolve; props `entry.data||{}` merged with context (context takes precedence). Context can intentionally share mutable form/plugin_fields state; not merely static markup.
- `resources/js/Components/PluginTabs.vue:20-77`: components[]/page null; Overview active by default. Resolve+merge server/runtime tab definitions, label via localization fallback, order by position. Missing active tab resets Overview. ArrowLeft/Right wraps through keys and focuses selected tab. Without tabs render core content unchanged. Permissions on supplied server tabs are producer-owned, not invented by tab renderer.
- `resources/js/Components/PluginWidgets.vue:15-39,44-55`: widgets[]; resolve runtime component, omit unavailable until loaded; localized heading; widths full/half/third/quarter,unknown→full; data props default{}. Server supplies authorized widgets. No fixed user-input fields/mutations here.



<a id="e0470"></a>

> Audit provenance: `shared-gaps.md` lines 70–73. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## G08 Image viewer — read-only interactive behavior

Source `resources/js/Components/ImageGallery.vue:6-72,79-212`. images:Array default[],productName:String default''; currentIndex0/showLightboxfalse; no images→current null. Thumbnail changes current index; lightbox opens selected image; next/previous wrap. Escape closes; arrows navigate only while lightbox open; listener cleaned on unmount. No upload/delete mutation (ImageUploader was already covered). Preserve alt productName and dismiss keyboard behavior.



<a id="e0471"></a>

> Audit provenance: `shared-gaps.md` lines 74–77. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Proposed acceptance and boundary

No tests executed. These gap notes add field/state/emission fidelity without creating records or altering source. Generic presentational primitives below are inventoried but are not additional domain modules. Final handoff should concatenate this note after existing platform/catalog/inventory/commerce sections. Target remains Taruvi native datatables/storage plus Python backend services; no Supabase project or new backend created.



<a id="e0472"></a>

> Audit provenance: `shared-gaps.md` lines 78–150. Source-confirmed evidence, not runtime verification. Any PHP/Vue is reference material only; implement behavior in React and Python.

## Complete shared-component ledger

67 components: 29 previously referenced; 13 supplemental contracts above; 25 remaining primitives. All123 Page paths present; missing list: []. Exact-path coverage is deliberately distinct from runtime acceptance.

| Component | Coverage disposition |
|---|---|
| `resources/js/Components/ActionError.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ActivityTimeline.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ApplicationLogo.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ApprovalPanel.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/BarcodeScanner.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/BarcodeScannerModal.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/BatchList.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/Checkbox.vue` | Gap contract added above |
| `resources/js/Components/CurrencySelect.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/CustomerPicker.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/DangerButton.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/Dashboard/MetricCard.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/DialogSurface.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/DiscountInput.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/Dropdown.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ImageGallery.vue` | Gap contract added above |
| `resources/js/Components/ImageUploader.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/ImportExport/FileDrop.vue` | Gap contract added above |
| `resources/js/Components/ImportExport/ImportResult.vue` | Gap contract added above |
| `resources/js/Components/InputError.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/InputLabel.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/LanguageSwitcher.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/Layout/FlashMessages.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/Layout/GlobalSearch.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/Layout/NotificationDropdown.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/Layout/ThemeToggle.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/LegalFooter.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/Modal.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/OrganizationSwitcher.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/PluginSlot.vue` | Gap contract added above |
| `resources/js/Components/PluginTabs.vue` | Gap contract added above |
| `resources/js/Components/PluginWidgets.vue` | Gap contract added above |
| `resources/js/Components/Portal/PortalAuthCard.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/Portal/PortalPagination.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/Portal/PortalStatusBadge.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/PrimaryButton.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ProductSupplierManager.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/ProductVariantManager.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/QuickAddModal.vue` | Gap contract added above |
| `resources/js/Components/Reports/ExportMenu.vue` | Gap contract added above |
| `resources/js/Components/Reports/PeriodFilter.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/Reports/ReportSchedules.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/SecondaryButton.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/SendDocumentModal.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/SerialList.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/Shipping/ShipmentsPanel.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/Shipping/ShipOrderModal.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/SKUGeneratorModal.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/StockAuditReviewEvidence.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/SupplierRating.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/TaxInput.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/TextInput.vue` | Gap contract added above |
| `resources/js/Components/ui/Badge.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ui/Button.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ui/Card.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ui/CardHeader.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ui/DataTable.vue` | Gap contract added above |
| `resources/js/Components/ui/Input.vue` | Gap contract added above |
| `resources/js/Components/ui/PageHeader.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ui/Pagination.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ui/StatTile.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/ui/TableFilters.vue` | Gap contract added above |
| `resources/js/Components/ui/TableViewport.vue` | Presentational/layout/status primitive; no additional owned domain form found by control-marker scan |
| `resources/js/Components/VariantsTable.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/VariantStockAdjuster.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/WarehouseStockLevels.vue` | Referenced in prior domain/platform evidence |
| `resources/js/Components/WarehouseSwitcher.vue` | Referenced in prior domain/platform evidence |
