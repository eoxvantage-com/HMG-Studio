# Source-contract checklist

> Coverage index, NOT completed implementation. All unchecked items remain open. Source code is reference evidence only, not permission to copy it into the app.

Use the [master checklist](../IMPLEMENTATION_CHECKLIST.md) and [status ledger](../development-pack/05_PARITY_AND_RESUME_LEDGER.md). For each checked clause add `Evidence: [ledger/test/readback](relative-path)` on the same line. A clause may contain several related conditions: all must pass. Where a clause is reference-only or not applicable, link an explicit disposition; do not silently skip it.

Stable IDs are source anchor plus clause sequence. Table rows are individually indexed; fenced defaults/validators are indexed as whole reference blocks; remaining prose and list statements retain exact source line ranges. The index is syntactic coverage, not an assertion that every requirement has been interpreted or implemented. Before checking ANY code-reference block, expand its individual fields, rules, actions and transitions into behavior-level ledger rows and link each to tests/readback. This is mandatory even for large blocks; one passing test cannot close a whole source file.

## modules/10_dashboard.md

### e0256: e0256

Source: [exact contract](../development-pack/modules/10_dashboard.md#e0256). Complete every clause below before closing this section in the ledger.

- [ ] **e0256-c001** [prose, lines 82-82](../development-pack/modules/10_dashboard.md#L82) -- View: statistics, revenue, stock movement, low-stock, recent orders/products, top products, stock by category, reorder suggestions, plugin widgets, administrator scheduler warnings (Admin/Da...
- [ ] **e0256-c002** [prose, lines 84-84](../development-pack/modules/10_dashboard.md#L84) -- Personalization PATCH settings/dashboard-widgets: widgets boolean object keys stats_overview,revenue_chart,stock_movements,low_stock_alerts,recent_orders,recent_products,top_products,stock_b...

### e0315: `resources/js/Pages/Dashboard.vue`

Source: [exact contract](../development-pack/modules/10_dashboard.md#e0315). Complete every clause below before closing this section in the ledger.

- [ ] **e0315-c001** [prose, lines 94-94](../development-pack/modules/10_dashboard.md#L94) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0315-c002** [statement, lines 95-95](../development-pack/modules/10_dashboard.md#L95) -- - resources/js/Pages/Dashboard.vue:695: &lt;input v-model="widgetDraft&#91;key&#93;" type="checkbox" /&gt;
- [ ] **e0315-c003** [prose, lines 97-97](../development-pack/modules/10_dashboard.md#L97) -- **Visible table headers:**
- [ ] **e0315-c004** [source-code reference, lines 98-111](../development-pack/modules/10_dashboard.md#L98) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0315-c005** [prose, lines 113-113](../development-pack/modules/10_dashboard.md#L113) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0315-c006** [source-code reference, lines 114-136](../development-pack/modules/10_dashboard.md#L114) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0315-c007** [prose, lines 138-138](../development-pack/modules/10_dashboard.md#L138) -- **Displayed data/value expressions:**
- [ ] **e0315-c008** [source-code reference, lines 139-190](../development-pack/modules/10_dashboard.md#L139) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0386: `app/Http/Controllers/Admin/DashboardController.php`

Source: [exact contract](../development-pack/modules/10_dashboard.md#e0386). Complete every clause below before closing this section in the ledger.

- [ ] **e0386-c001** [source-code reference, lines 199-216](../development-pack/modules/10_dashboard.md#L199) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/11_inventory.md

### e0006: Catalogue and variants

Source: [exact contract](../development-pack/modules/11_inventory.md#e0006). Complete every clause below before closing this section in the ledger.

- [ ] **e0006-c001** [statement, lines 139-139](../development-pack/modules/11_inventory.md#L139) -- - Create basic product → optional category/location quick-add → prices/stock → optional options/variant combinations → supplier links/images → save. type is standard/kit/assembly, tracking_t...
- [ ] **e0006-c002** [statement, lines 140-140](../development-pack/modules/11_inventory.md#L140) -- - Create form has a currency selector and additional currency prices; Edit form **does not** expose currency/additional-currency editing and does not send stock. Edit Current Stock is readon...
- [ ] **e0006-c003** [statement, lines 141-141](../development-pack/modules/11_inventory.md#L141) -- - Product variant manager takes up to 3 option dimensions and shows a 2,048-combination UI limit. It generates Cartesian combinations, keeps matching rows by option-values serialization, and...
- [ ] **e0006-c004** [statement, lines 142-142](../development-pack/modules/11_inventory.md#L142) -- - Image uploader accepts multiple image files, max 5 images / 5 MB each in these pages; inspect backend image validation before porting. Supplier links form one array with at most one primar...
- [ ] **e0006-c005** [statement, lines 143-143](../development-pack/modules/11_inventory.md#L143) -- - Product catalogue filters primary location / active warehouse association, whereas Stock view exposes actual bins. They are not interchangeable inventory scopes. ProductController:48-96.

### e0012: Batches/serials/barcodes

Source: [exact contract](../development-pack/modules/11_inventory.md#e0012). Complete every clause below before closing this section in the ledger.

- [ ] **e0012-c001** [statement, lines 153-153](../development-pack/modules/11_inventory.md#L153) -- - Batch add stores batch_number (autogenerate if omitted), quantity &gt;=0, optional manufactured/expiry dates and notes; expiry &gt;= manufactured date. It creates tracked metadata, not a PO rece...
- [ ] **e0012-c002** [statement, lines 154-154](../development-pack/modules/11_inventory.md#L154) -- - Serial add requires organization-unique serial_number; status available(default)/sold/reserved/damaged, optional notes. Consumed/transferred/written_off are system-only terminal labels, no...
- [ ] **e0012-c003** [statement, lines 155-155](../development-pack/modules/11_inventory.md#L155) -- - Order allocation consumes batches FEFO (undated last) or available serials. **Order tracking is best-effort by default** (inventory.strict_tracked_stock=false): incomplete tracked records ...
- [ ] **e0012-c004** [statement, lines 156-156](../development-pack/modules/11_inventory.md#L156) -- - Scanner modal defaults camera, supports manual barcode/SKU input; camera starts only when enabled, uses rear-facing mode, 10 fps and 1.5-second scan debounce, stops on close/unmount. Manua...
- [ ] **e0012-c005** [statement, lines 157-157](../development-pack/modules/11_inventory.md#L157) -- - SKU generator fetches presets/variables, previews pattern + current product name/category, applies generated SKU only when preview valid; it does not create a product. Backend generation a...

### e0021: Products/Create

Source: [exact contract](../development-pack/modules/11_inventory.md#e0021). Complete every clause below before closing this section in the ledger.

- [ ] **e0021-c001** [prose, lines 167-167](../development-pack/modules/11_inventory.md#L167) -- GET /products/create; create_products. New product blank defaults except currency, type, tracking, variant flag and arrays. Sections basic information, pricing/inventory, classification, ima...
- [ ] **e0021-c002** [prose, lines 169-169](../development-pack/modules/11_inventory.md#L169) -- Source: resources/js/Pages/Products/Create.vue:1.
- [ ] **e0021-c003** [prose, lines 171-171](../development-pack/modules/11_inventory.md#L171) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0021-c004** [source-code reference, lines 173-226](../development-pack/modules/11_inventory.md#L173) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0021-c005** [prose, lines 228-228](../development-pack/modules/11_inventory.md#L228) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0021-c006** [table row, lines 230-230](../development-pack/modules/11_inventory.md#L230) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0021-c007** [table row, lines 232-232](../development-pack/modules/11_inventory.md#L232) -- form.name — resources/js/Pages/Products/Create.vue:233  /  Product Name *  /  text; ''  /  ; v-model="form.name"; type="text"; required  /  Always within this view/dialog; see component visi...
- [ ] **e0021-c008** [table row, lines 233-233](../development-pack/modules/11_inventory.md#L233) -- form.sku — resources/js/Pages/Products/Create.vue:252  /  SKU *  /  text; ''  /  ; v-model="form.sku"; type="text"; required  /  Always within this view/dialog; see component visibility
- [ ] **e0021-c009** [table row, lines 234-234](../development-pack/modules/11_inventory.md#L234) -- form.barcode — resources/js/Pages/Products/Create.vue:259  /  Barcode  /  text; ''  /  ; v-model="form.barcode"; type="text"  /  Always within this view/dialog; see component visibility
- [ ] **e0021-c010** [table row, lines 235-235](../development-pack/modules/11_inventory.md#L235) -- form.barcode_type — resources/js/Pages/Products/Create.vue:266  /  Barcode Type  /  select; ''  /  ; v-model="form.barcode_type"  /  Always within this view/dialog; see component visibility
- [ ] **e0021-c011** [table row, lines 236-236](../development-pack/modules/11_inventory.md#L236) -- form.type — resources/js/Pages/Products/Create.vue:276  /  Product Type  /  select; 'standard'  /  ; v-model="form.type"  /  Always within this view/dialog; see component visibility
- [ ] **e0021-c012** [table row, lines 237-237](../development-pack/modules/11_inventory.md#L237) -- form.description — resources/js/Pages/Products/Create.vue:290  /  Description  /  textarea; ''  /  ; v-model="form.description"; rows="4"  /  Always within this view/dialog; see component vi...
- [ ] **e0021-c013** [table row, lines 238-238](../development-pack/modules/11_inventory.md#L238) -- form.currency — resources/js/Pages/Products/Create.vue:305  /  Currency *  /  select; props.defaultCurrency \ / \ /  'USD'  /  ; v-model="form.currency"; required  /  Always within this view...
- [ ] **e0021-c014** [table row, lines 239-239](../development-pack/modules/11_inventory.md#L239) -- form.purchase_price — resources/js/Pages/Products/Create.vue:319  /  Purchase Price (Cost)  /  number; ''  /  ; v-model="form.purchase_price"; type="number"; step="0.01"; min="0"  /  Always ...
- [ ] **e0021-c015** [table row, lines 240-240](../development-pack/modules/11_inventory.md#L240) -- form.price — resources/js/Pages/Products/Create.vue:334  /  Selling Price *  /  number; ''  /  ; v-model="form.price"; type="number"; step="0.01"; min="0"; required  /  Always within this vi...
- [ ] **e0021-c016** [table row, lines 241-241](../development-pack/modules/11_inventory.md#L241) -- currencyPrice.currency — resources/js/Pages/Products/Create.vue:361  /  Additional Currencies  /  select; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="cur...
- [ ] **e0021-c017** [table row, lines 242-242](../development-pack/modules/11_inventory.md#L242) -- currencyPrice.price — resources/js/Pages/Products/Create.vue:370  /  No explicit label / see context  /  number; Derived/repeating value; see initial payload / owning child notes  /  ; v-mod...
- [ ] **e0021-c018** [table row, lines 243-243](../development-pack/modules/11_inventory.md#L243) -- selectedNewCurrency — resources/js/Pages/Products/Create.vue:379  /  No explicit label / see context  /  select; ''  /  ; v-model="selectedNewCurrency"  /  v-if="additionalCurrencies.length ...
- [ ] **e0021-c019** [table row, lines 244-244](../development-pack/modules/11_inventory.md#L244) -- form.stock — resources/js/Pages/Products/Create.vue:404  /  Current Stock *  /  number; ''  /  ; v-model="form.stock"; type="number"; min="0"; required  /  Always within this view/dialog; se...
- [ ] **e0021-c020** [table row, lines 245-245](../development-pack/modules/11_inventory.md#L245) -- form.min_stock — resources/js/Pages/Products/Create.vue:413  /  Minimum Stock Level *  /  number; ''  /  ; v-model="form.min_stock"; type="number"; min="0"; required  /  Always within this v...
- [ ] **e0021-c021** [table row, lines 246-246](../development-pack/modules/11_inventory.md#L246) -- form.reorder_point — resources/js/Pages/Products/Create.vue:421  /  Reorder Point  /  number; ''  /  ; v-model="form.reorder_point"; type="number"; min="0"; :placeholder="t('products.form.le...
- [ ] **e0021-c022** [table row, lines 247-247](../development-pack/modules/11_inventory.md#L247) -- form.reorder_quantity — resources/js/Pages/Products/Create.vue:429  /  Reorder Quantity  /  number; ''  /  ; v-model="form.reorder_quantity"; type="number"; min="0"; :placeholder="t('product...
- [ ] **e0021-c023** [table row, lines 248-248](../development-pack/modules/11_inventory.md#L248) -- form.category_id — resources/js/Pages/Products/Create.vue:444  /  Category  /  select; ''  /  ; v-model="form.category_id"  /  Always within this view/dialog; see component visibility
- [ ] **e0021-c024** [table row, lines 249-249](../development-pack/modules/11_inventory.md#L249) -- form.location_id — resources/js/Pages/Products/Create.vue:463  /  Location  /  select; ''  /  ; v-model="form.location_id"  /  Always within this view/dialog; see component visibility
- [ ] **e0021-c025** [table row, lines 250-250](../development-pack/modules/11_inventory.md#L250) -- form.tracking_type — resources/js/Pages/Products/Create.vue:475  /  Inventory Tracking  /  select; 'none'  /  ; v-model="form.tracking_type"  /  Always within this view/dialog; see component...
- [ ] **e0021-c026** [table row, lines 251-251](../development-pack/modules/11_inventory.md#L251) -- form.images — resources/js/Pages/Products/Create.vue:491  /  No explicit label / see context  /  ImageUploader; &#91;&#93;  /  v-model="form.images"; :max-images="5"; :max-size-in-m-b="5"  /  Always...
- [ ] **e0021-c027** [table row, lines 252-252](../development-pack/modules/11_inventory.md#L252) -- form.suppliers — resources/js/Pages/Products/Create.vue:542  /  No explicit label / see context  /  ProductSupplierManager; &#91;&#93;  /  v-model="form.suppliers"; :suppliers="suppliers"; :errors="...
- [ ] **e0021-c028** [table row, lines 253-253](../development-pack/modules/11_inventory.md#L253) -- form.notes — resources/js/Pages/Products/Create.vue:557  /  No explicit label / see context  /  textarea; ''  /  ; v-model="form.notes"; rows="3"; :placeholder="t('products.create.notesPlace...
- [ ] **e0021-c029** [table row, lines 254-254](../development-pack/modules/11_inventory.md#L254) -- categoryForm.name — resources/js/Pages/Products/Create.vue:593  /  Category Name *  /  text; ''  /  ; v-model="categoryForm.name"; type="text"; :placeholder="t('products.quickAddCategory.pla...
- [ ] **e0021-c030** [table row, lines 255-255](../development-pack/modules/11_inventory.md#L255) -- categoryForm.description — resources/js/Pages/Products/Create.vue:603  /  Description  /  textarea; ''  /  ; v-model="categoryForm.description"; rows="3"; :placeholder="t('products.quickAddC...
- [ ] **e0021-c031** [table row, lines 256-256](../development-pack/modules/11_inventory.md#L256) -- locationForm.warehouse_id — resources/js/Pages/Products/Create.vue:636  /  Warehouse  /  select; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm...
- [ ] **e0021-c032** [table row, lines 257-257](../development-pack/modules/11_inventory.md#L257) -- locationForm.name — resources/js/Pages/Products/Create.vue:646  /  Location Name *  /  text; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm.nam...
- [ ] **e0021-c033** [table row, lines 258-258](../development-pack/modules/11_inventory.md#L258) -- locationForm.code — resources/js/Pages/Products/Create.vue:658  /  Location Code *  /  text; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm.cod...
- [ ] **e0021-c034** [table row, lines 259-259](../development-pack/modules/11_inventory.md#L259) -- locationForm.description — resources/js/Pages/Products/Create.vue:668  /  Description  /  textarea; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationF...
- [ ] **e0021-c035** [prose, lines 261-261](../development-pack/modules/11_inventory.md#L261) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0021-c036** [statement, lines 263-263](../development-pack/modules/11_inventory.md#L263) -- - form.barcode_type (resources/js/Pages/Products/Create.vue:266): &amp;lt;option value=""&amp;gt;{{ Detect automatically }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="bt in barcodeTypes" :key="bt.value" :valu...
- [ ] **e0021-c037** [statement, lines 264-264](../development-pack/modules/11_inventory.md#L264) -- - form.type (resources/js/Pages/Products/Create.vue:276): &amp;lt;option value="standard"&amp;gt;{{ Standard }}&amp;lt;/option&amp;gt; &amp;lt;option value="kit"&amp;gt;{{ Kit }}&amp;lt;/option&amp;gt; &amp;lt;option value="as...
- [ ] **e0021-c038** [statement, lines 265-265](../development-pack/modules/11_inventory.md#L265) -- - form.currency (resources/js/Pages/Products/Create.vue:305): &amp;lt;option v-for="(data, code) in currencies" :key="code" :value="code"&amp;gt; {{ code }} ({{ data.symbol }}) - {{ data.name }} &amp;lt...
- [ ] **e0021-c039** [statement, lines 266-266](../development-pack/modules/11_inventory.md#L266) -- - currencyPrice.currency (resources/js/Pages/Products/Create.vue:361): &amp;lt;option :value="currencyPrice.currency"&amp;gt;{{ currencyPrice.currency }} ({{ getCurrencySymbol(currencyPrice.currency...
- [ ] **e0021-c040** [statement, lines 267-267](../development-pack/modules/11_inventory.md#L267) -- - selectedNewCurrency (resources/js/Pages/Products/Create.vue:379): &amp;lt;option value=""&amp;gt;{{ Select currency... }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="curr in availableCurrencies" :key="curr.c...
- [ ] **e0021-c041** [statement, lines 268-268](../development-pack/modules/11_inventory.md#L268) -- - form.category_id (resources/js/Pages/Products/Create.vue:444): &amp;lt;option value=""&amp;gt;{{ Select a category }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="category in categories" :key="category.id" :v...
- [ ] **e0021-c042** [statement, lines 269-269](../development-pack/modules/11_inventory.md#L269) -- - form.location_id (resources/js/Pages/Products/Create.vue:463): &amp;lt;option value=""&amp;gt;{{ Select a location }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="location in locations" :key="location.id" :va...
- [ ] **e0021-c043** [statement, lines 270-270](../development-pack/modules/11_inventory.md#L270) -- - form.tracking_type (resources/js/Pages/Products/Create.vue:475): &amp;lt;option value="none"&amp;gt;{{ No Tracking }}&amp;lt;/option&amp;gt; &amp;lt;option value="batch"&amp;gt;{{ Batch Tracking }}&amp;lt;/option&amp;gt;...
- [ ] **e0021-c044** [statement, lines 271-271](../development-pack/modules/11_inventory.md#L271) -- - locationForm.warehouse_id (resources/js/Pages/Products/Create.vue:636): &amp;lt;option value=""&amp;gt;{{ No warehouse }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="warehouse in locationWarehouses" :key="wa...
- [ ] **e0021-c045** [prose, lines 273-273](../development-pack/modules/11_inventory.md#L273) -- **Read fields, columns and section headings:**
- [ ] **e0021-c046** [statement, lines 275-275](../development-pack/modules/11_inventory.md#L275) -- - h3: Basic Information — resources/js/Pages/Products/Create.vue:226
- [ ] **e0021-c047** [statement, lines 276-276](../development-pack/modules/11_inventory.md#L276) -- - h3: Pricing &amp; Inventory — resources/js/Pages/Products/Create.vue:298
- [ ] **e0021-c048** [statement, lines 277-277](../development-pack/modules/11_inventory.md#L277) -- - h3: Product Images — resources/js/Pages/Products/Create.vue:489
- [ ] **e0021-c049** [statement, lines 278-278](../development-pack/modules/11_inventory.md#L278) -- - h3: Suppliers — resources/js/Pages/Products/Create.vue:540
- [ ] **e0021-c050** [statement, lines 279-279](../development-pack/modules/11_inventory.md#L279) -- - h3: Notes — resources/js/Pages/Products/Create.vue:555
- [ ] **e0021-c051** [prose, lines 281-281](../development-pack/modules/11_inventory.md#L281) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0021-c052** [table row, lines 283-283](../development-pack/modules/11_inventory.md#L283) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0021-c053** [table row, lines 285-285](../development-pack/modules/11_inventory.md#L285) -- Workspace — resources/js/Pages/Products/Create.vue:199  /  :href="route('products.index')"  /  No ancestor condition
- [ ] **e0021-c054** [table row, lines 286-286](../development-pack/modules/11_inventory.md#L286) -- Inventory — resources/js/Pages/Products/Create.vue:201  /  :href="route('products.index')"  /  No ancestor condition
- [ ] **e0021-c055** [table row, lines 287-287](../development-pack/modules/11_inventory.md#L287) -- Back to Inventory — resources/js/Pages/Products/Create.vue:209  /  variant="secondary"; size="sm"; as="Link"; :href="route('products.index')"  /  No ancestor condition
- [ ] **e0021-c056** [table row, lines 288-288](../development-pack/modules/11_inventory.md#L288) -- Generate SKU — resources/js/Pages/Products/Create.vue:243  /  type="button"; @click="showSKUGenerator = true"  /  No ancestor condition
- [ ] **e0021-c057** [table row, lines 289-289](../development-pack/modules/11_inventory.md#L289) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Create.vue:372  /  type="button"; variant="danger"; size="icon"; @click="removeCurrency(index)"  /  v-if="addi...
- [ ] **e0021-c058** [table row, lines 290-290](../development-pack/modules/11_inventory.md#L290) -- Add — resources/js/Pages/Products/Create.vue:385  /  type="button"; variant="default"; @click="addCurrency"  /  v-if="additionalCurrencies.length &amp;gt; 0 \ / \ /  showCurrencySelect" → v-if="...
- [ ] **e0021-c059** [table row, lines 291-291](../development-pack/modules/11_inventory.md#L291) -- Cancel — resources/js/Pages/Products/Create.vue:386  /  type="button"; variant="secondary"; @click="showCurrencySelect = false"  /  v-if="additionalCurrencies.length &amp;gt; 0 \ / \ /  showCurr...
- [ ] **e0021-c060** [table row, lines 292-292](../development-pack/modules/11_inventory.md#L292) -- + Add price in another currency — resources/js/Pages/Products/Create.vue:390  /  v-if="!showCurrencySelect &amp;&amp; availableCurrencies.length &amp;gt; 0"; type="button"; @click="showCurrencySelect = ...
- [ ] **e0021-c061** [table row, lines 293-293](../development-pack/modules/11_inventory.md#L293) -- + Quick Add — resources/js/Pages/Products/Create.vue:440  /  type="button"; @click="showCategoryModal = true"  /  No ancestor condition
- [ ] **e0021-c062** [table row, lines 294-294](../development-pack/modules/11_inventory.md#L294) -- + Quick Add — resources/js/Pages/Products/Create.vue:459  /  type="button"; @click="showLocationModal = true"  /  No ancestor condition
- [ ] **e0021-c063** [table row, lines 295-295](../development-pack/modules/11_inventory.md#L295) -- Product Variants {count} variant \ /  {count} variants — resources/js/Pages/Products/Create.vue:504  /  type="button"; @click="toggleVariants"  /  No ancestor condition
- [ ] **e0021-c064** [table row, lines 296-296](../development-pack/modules/11_inventory.md#L296) -- Cancel — resources/js/Pages/Products/Create.vue:572  /  variant="secondary"; as="Link"; :href="route('products.index')"  /  No ancestor condition
- [ ] **e0021-c065** [table row, lines 297-297](../development-pack/modules/11_inventory.md#L297) -- Create Product — resources/js/Pages/Products/Create.vue:573  /  type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing"  /  No ancestor condition
- [ ] **e0021-c066** [table row, lines 298-298](../development-pack/modules/11_inventory.md#L298) -- Cancel — resources/js/Pages/Products/Create.vue:611  /  type="button"; variant="secondary"; @click="showCategoryModal = false"  /  No ancestor condition
- [ ] **e0021-c067** [table row, lines 299-299](../development-pack/modules/11_inventory.md#L299) -- Creating... Create Category — resources/js/Pages/Products/Create.vue:614  /  type="button"; variant="default"; :loading="categoryLoading"; :disabled="categoryLoading \ / \ /  !categoryForm.n...
- [ ] **e0021-c068** [table row, lines 300-300](../development-pack/modules/11_inventory.md#L300) -- Cancel — resources/js/Pages/Products/Create.vue:676  /  type="button"; variant="secondary"; @click="showLocationModal = false"  /  No ancestor condition
- [ ] **e0021-c069** [table row, lines 301-301](../development-pack/modules/11_inventory.md#L301) -- Creating... Create Location — resources/js/Pages/Products/Create.vue:679  /  type="button"; variant="default"; :loading="locationLoading"; :disabled="locationLoading \ / \ /  !locationForm.n...
- [ ] **e0021-c070** [prose, lines 303-303](../development-pack/modules/11_inventory.md#L303) -- **Script endpoint names:** categories.store, locations.store, products.store. Match these to verb/path/permission in the route annex.

### e0022: Products/Edit

Source: [exact contract](../development-pack/modules/11_inventory.md#e0022). Complete every clause below before closing this section in the ledger.

- [ ] **e0022-c001** [prose, lines 313-313](../development-pack/modules/11_inventory.md#L313) -- GET /products/{product}/edit; edit_products. Same main catalogue sections with saved defaults, but stock readonly and a stock-adjustment link; currency and additional prices are not editable...
- [ ] **e0022-c002** [prose, lines 315-315](../development-pack/modules/11_inventory.md#L315) -- Source: resources/js/Pages/Products/Edit.vue:1.
- [ ] **e0022-c003** [prose, lines 317-317](../development-pack/modules/11_inventory.md#L317) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0022-c004** [source-code reference, lines 319-372](../development-pack/modules/11_inventory.md#L319) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0022-c005** [prose, lines 374-374](../development-pack/modules/11_inventory.md#L374) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0022-c006** [table row, lines 376-376](../development-pack/modules/11_inventory.md#L376) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0022-c007** [table row, lines 378-378](../development-pack/modules/11_inventory.md#L378) -- form.name — resources/js/Pages/Products/Edit.vue:271  /  Product Name *  /  text; props.product.name  /  ; v-model="form.name"; type="text"; required  /  Always within this view/dialog; see ...
- [ ] **e0022-c008** [table row, lines 379-379](../development-pack/modules/11_inventory.md#L379) -- form.sku — resources/js/Pages/Products/Edit.vue:290  /  SKU *  /  text; props.product.sku  /  ; v-model="form.sku"; type="text"; required  /  Always within this view/dialog; see component vi...
- [ ] **e0022-c009** [table row, lines 380-380](../development-pack/modules/11_inventory.md#L380) -- form.barcode — resources/js/Pages/Products/Edit.vue:297  /  Barcode  /  text; props.product.barcode \ / \ /  ''  /  ; v-model="form.barcode"; type="text"  /  Always within this view/dialog; ...
- [ ] **e0022-c010** [table row, lines 381-381](../development-pack/modules/11_inventory.md#L381) -- form.barcode_type — resources/js/Pages/Products/Edit.vue:304  /  Barcode Type  /  select; props.product.barcode_type \ / \ /  ''  /  ; v-model="form.barcode_type"  /  Always within this view...
- [ ] **e0022-c011** [table row, lines 382-382](../development-pack/modules/11_inventory.md#L382) -- form.type — resources/js/Pages/Products/Edit.vue:314  /  Product Type  /  select; props.product.type \ / \ /  'standard'  /  ; v-model="form.type"  /  Always within this view/dialog; see com...
- [ ] **e0022-c012** [table row, lines 383-383](../development-pack/modules/11_inventory.md#L383) -- form.description — resources/js/Pages/Products/Edit.vue:328  /  Description  /  textarea; props.product.description  /  ; v-model="form.description"; rows="4"  /  Always within this view/dia...
- [ ] **e0022-c013** [table row, lines 384-384](../development-pack/modules/11_inventory.md#L384) -- form.purchase_price — resources/js/Pages/Products/Edit.vue:345  /  Purchase Price (Cost)  /  number; props.product.purchase_price \ / \ /  ''  /  ; v-model="form.purchase_price"; type="numbe...
- [ ] **e0022-c014** [table row, lines 385-385](../development-pack/modules/11_inventory.md#L385) -- form.price — resources/js/Pages/Products/Edit.vue:360  /  Selling Price *  /  number; props.product.price  /  ; v-model="form.price"; type="number"; step="0.01"; min="0"; required  /  Always...
- [ ] **e0022-c015** [table row, lines 386-386](../development-pack/modules/11_inventory.md#L386) -- (unbound) — resources/js/Pages/Products/Edit.vue:387  /  Current Stock  /  number; See :value / :checked and event handler; not a v-model field  /  ; :value="product.stock"; type="number"; r...
- [ ] **e0022-c016** [table row, lines 387-387](../development-pack/modules/11_inventory.md#L387) -- form.min_stock — resources/js/Pages/Products/Edit.vue:403  /  Minimum Stock Level *  /  number; props.product.min_stock  /  ; v-model="form.min_stock"; type="number"; min="0"; required  /  A...
- [ ] **e0022-c017** [table row, lines 388-388](../development-pack/modules/11_inventory.md#L388) -- form.reorder_point — resources/js/Pages/Products/Edit.vue:411  /  Reorder Point  /  number; props.product.reorder_point \ / \ /  ''  /  ; v-model="form.reorder_point"; type="number"; min="0"...
- [ ] **e0022-c018** [table row, lines 389-389](../development-pack/modules/11_inventory.md#L389) -- form.reorder_quantity — resources/js/Pages/Products/Edit.vue:419  /  Reorder Quantity  /  number; props.product.reorder_quantity \ / \ /  ''  /  ; v-model="form.reorder_quantity"; type="numb...
- [ ] **e0022-c019** [table row, lines 390-390](../development-pack/modules/11_inventory.md#L390) -- form.category_id — resources/js/Pages/Products/Edit.vue:438  /  Category  /  select; props.product.category_id  /  ; v-model="form.category_id"  /  Always within this view/dialog; see compon...
- [ ] **e0022-c020** [table row, lines 391-391](../development-pack/modules/11_inventory.md#L391) -- form.location_id — resources/js/Pages/Products/Edit.vue:461  /  Location  /  select; props.product.location_id  /  ; v-model="form.location_id"  /  Always within this view/dialog; see compon...
- [ ] **e0022-c021** [table row, lines 392-392](../development-pack/modules/11_inventory.md#L392) -- form.tracking_type — resources/js/Pages/Products/Edit.vue:473  /  Inventory Tracking  /  select; props.product.tracking_type \ / \ /  'none'  /  ; v-model="form.tracking_type"  /  Always wit...
- [ ] **e0022-c022** [table row, lines 393-393](../development-pack/modules/11_inventory.md#L393) -- form.images — resources/js/Pages/Products/Edit.vue:488  /  No explicit label / see context  /  ImageUploader; (props.product.images \ / \ /  &#91;&#93;).map((path, index) =&amp;gt; ({&amp;lt;br&amp;gt;        u...
- [ ] **e0022-c023** [table row, lines 394-394](../development-pack/modules/11_inventory.md#L394) -- form.suppliers — resources/js/Pages/Products/Edit.vue:547  /  No explicit label / see context  /  ProductSupplierManager; prepareExistingSuppliers()  /  v-model="form.suppliers"; :suppliers=...
- [ ] **e0022-c024** [table row, lines 395-395](../development-pack/modules/11_inventory.md#L395) -- form.notes — resources/js/Pages/Products/Edit.vue:561  /  No explicit label / see context  /  textarea; props.product.notes \ / \ /  ''  /  ; v-model="form.notes"; rows="3"; :placeholder="t(...
- [ ] **e0022-c025** [table row, lines 396-396](../development-pack/modules/11_inventory.md#L396) -- categoryForm.name — resources/js/Pages/Products/Edit.vue:610  /  Category Name *  /  text; ''  /  ; v-model="categoryForm.name"; type="text"; :placeholder="t('products.quickAddCategory.place...
- [ ] **e0022-c026** [table row, lines 397-397](../development-pack/modules/11_inventory.md#L397) -- categoryForm.description — resources/js/Pages/Products/Edit.vue:621  /  Description  /  textarea; ''  /  ; v-model="categoryForm.description"; rows="3"; :placeholder="t('products.quickAddCat...
- [ ] **e0022-c027** [table row, lines 398-398](../development-pack/modules/11_inventory.md#L398) -- locationForm.warehouse_id — resources/js/Pages/Products/Edit.vue:669  /  Warehouse  /  select; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm.w...
- [ ] **e0022-c028** [table row, lines 399-399](../development-pack/modules/11_inventory.md#L399) -- locationForm.name — resources/js/Pages/Products/Edit.vue:679  /  Location Name *  /  text; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm.name"...
- [ ] **e0022-c029** [table row, lines 400-400](../development-pack/modules/11_inventory.md#L400) -- locationForm.code — resources/js/Pages/Products/Edit.vue:692  /  Location Code *  /  text; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm.code"...
- [ ] **e0022-c030** [table row, lines 401-401](../development-pack/modules/11_inventory.md#L401) -- locationForm.description — resources/js/Pages/Products/Edit.vue:703  /  Description  /  textarea; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationFor...
- [ ] **e0022-c031** [prose, lines 403-403](../development-pack/modules/11_inventory.md#L403) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0022-c032** [statement, lines 405-405](../development-pack/modules/11_inventory.md#L405) -- - form.barcode_type (resources/js/Pages/Products/Edit.vue:304): &amp;lt;option value=""&amp;gt;{{ Detect automatically }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="bt in barcodeTypes" :key="bt.value" :value=...
- [ ] **e0022-c033** [statement, lines 406-406](../development-pack/modules/11_inventory.md#L406) -- - form.type (resources/js/Pages/Products/Edit.vue:314): &amp;lt;option value="standard"&amp;gt;{{ Standard }}&amp;lt;/option&amp;gt; &amp;lt;option value="kit"&amp;gt;{{ Kit }}&amp;lt;/option&amp;gt; &amp;lt;option value="asse...
- [ ] **e0022-c034** [statement, lines 407-407](../development-pack/modules/11_inventory.md#L407) -- - form.category_id (resources/js/Pages/Products/Edit.vue:438): &amp;lt;option value=""&amp;gt;{{ Select a category }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="category in categories" :key="category.id" :val...
- [ ] **e0022-c035** [statement, lines 408-408](../development-pack/modules/11_inventory.md#L408) -- - form.location_id (resources/js/Pages/Products/Edit.vue:461): &amp;lt;option value=""&amp;gt;{{ Select a location }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="location in locations" :key="location.id" :valu...
- [ ] **e0022-c036** [statement, lines 409-409](../development-pack/modules/11_inventory.md#L409) -- - form.tracking_type (resources/js/Pages/Products/Edit.vue:473): &amp;lt;option value="none"&amp;gt;{{ No Tracking }}&amp;lt;/option&amp;gt; &amp;lt;option value="batch"&amp;gt;{{ Batch Tracking }}&amp;lt;/option&amp;gt; &amp;...
- [ ] **e0022-c037** [statement, lines 410-410](../development-pack/modules/11_inventory.md#L410) -- - locationForm.warehouse_id (resources/js/Pages/Products/Edit.vue:669): &amp;lt;option value=""&amp;gt;{{ No warehouse }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="warehouse in locationWarehouses" :key="ware...
- [ ] **e0022-c038** [prose, lines 412-412](../development-pack/modules/11_inventory.md#L412) -- **Read fields, columns and section headings:**
- [ ] **e0022-c039** [statement, lines 414-414](../development-pack/modules/11_inventory.md#L414) -- - h3: Basic Information — resources/js/Pages/Products/Edit.vue:264
- [ ] **e0022-c040** [statement, lines 415-415](../development-pack/modules/11_inventory.md#L415) -- - h3: Pricing &amp; Inventory — resources/js/Pages/Products/Edit.vue:336
- [ ] **e0022-c041** [statement, lines 416-416](../development-pack/modules/11_inventory.md#L416) -- - h3: Product Images — resources/js/Pages/Products/Edit.vue:486
- [ ] **e0022-c042** [statement, lines 417-417](../development-pack/modules/11_inventory.md#L417) -- - h3: Suppliers — resources/js/Pages/Products/Edit.vue:545
- [ ] **e0022-c043** [statement, lines 418-418](../development-pack/modules/11_inventory.md#L418) -- - h3: Notes — resources/js/Pages/Products/Edit.vue:559
- [ ] **e0022-c044** [statement, lines 419-419](../development-pack/modules/11_inventory.md#L419) -- - h3: Quick Add Category — resources/js/Pages/Products/Edit.vue:594 — v-if="showCategoryModal"
- [ ] **e0022-c045** [statement, lines 420-420](../development-pack/modules/11_inventory.md#L420) -- - h3: Quick Add Location — resources/js/Pages/Products/Edit.vue:655 — v-if="showLocationModal"
- [ ] **e0022-c046** [prose, lines 422-422](../development-pack/modules/11_inventory.md#L422) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0022-c047** [table row, lines 424-424](../development-pack/modules/11_inventory.md#L424) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0022-c048** [table row, lines 426-426](../development-pack/modules/11_inventory.md#L426) -- Workspace — resources/js/Pages/Products/Edit.vue:233  /  :href="route('products.index')"  /  No ancestor condition
- [ ] **e0022-c049** [table row, lines 427-427](../development-pack/modules/11_inventory.md#L427) -- Inventory — resources/js/Pages/Products/Edit.vue:235  /  :href="route('products.index')"  /  No ancestor condition
- [ ] **e0022-c050** [table row, lines 428-428](../development-pack/modules/11_inventory.md#L428) -- View — resources/js/Pages/Products/Edit.vue:243  /  variant="secondary"; size="sm"; as="Link"; :href="route('products.show', product.id)"  /  No ancestor condition
- [ ] **e0022-c051** [table row, lines 429-429](../development-pack/modules/11_inventory.md#L429) -- Back to Inventory — resources/js/Pages/Products/Edit.vue:247  /  variant="secondary"; size="sm"; as="Link"; :href="route('products.index')"  /  No ancestor condition
- [ ] **e0022-c052** [table row, lines 430-430](../development-pack/modules/11_inventory.md#L430) -- Generate SKU — resources/js/Pages/Products/Edit.vue:281  /  type="button"; @click="showSKUGenerator = true"  /  No ancestor condition
- [ ] **e0022-c053** [table row, lines 431-431](../development-pack/modules/11_inventory.md#L431) -- Adjust stock — resources/js/Pages/Products/Edit.vue:390  /  v-if="hasPermission('manage_stock')"; :href="route('stock-adjustments.create', { product_id: product.id })"  /  No ancestor condit...
- [ ] **e0022-c054** [table row, lines 432-432](../development-pack/modules/11_inventory.md#L432) -- + Quick Add — resources/js/Pages/Products/Edit.vue:430  /  type="button"; @click="showCategoryModal = true"  /  No ancestor condition
- [ ] **e0022-c055** [table row, lines 433-433](../development-pack/modules/11_inventory.md#L433) -- + Quick Add — resources/js/Pages/Products/Edit.vue:453  /  type="button"; @click="showLocationModal = true"  /  No ancestor condition
- [ ] **e0022-c056** [table row, lines 434-434](../development-pack/modules/11_inventory.md#L434) -- Product Variants {count} variant \ /  {count} variants — resources/js/Pages/Products/Edit.vue:499  /  type="button"; @click="toggleVariants"  /  No ancestor condition
- [ ] **e0022-c057** [table row, lines 435-435](../development-pack/modules/11_inventory.md#L435) -- Cancel — resources/js/Pages/Products/Edit.vue:575  /  variant="secondary"; as="Link"; :href="route('products.index')"  /  No ancestor condition
- [ ] **e0022-c058** [table row, lines 436-436](../development-pack/modules/11_inventory.md#L436) -- Update Product — resources/js/Pages/Products/Edit.vue:578  /  type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing"  /  No ancestor condition
- [ ] **e0022-c059** [table row, lines 437-437](../development-pack/modules/11_inventory.md#L437) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Edit.vue:597  /  @click="showCategoryModal = false"  /  v-if="showCategoryModal"
- [ ] **e0022-c060** [table row, lines 438-438](../development-pack/modules/11_inventory.md#L438) -- Cancel — resources/js/Pages/Products/Edit.vue:630  /  type="button"; variant="secondary"; @click="showCategoryModal = false"  /  v-if="showCategoryModal"
- [ ] **e0022-c061** [table row, lines 439-439](../development-pack/modules/11_inventory.md#L439) -- categoryLoading ? Creating... : Create Category — resources/js/Pages/Products/Edit.vue:633  /  type="button"; variant="default"; @click="createCategory"; :loading="categoryLoading"; :disable...
- [ ] **e0022-c062** [table row, lines 440-440](../development-pack/modules/11_inventory.md#L440) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Edit.vue:658  /  @click="showLocationModal = false"  /  v-if="showLocationModal"
- [ ] **e0022-c063** [table row, lines 441-441](../development-pack/modules/11_inventory.md#L441) -- Cancel — resources/js/Pages/Products/Edit.vue:712  /  type="button"; variant="secondary"; @click="showLocationModal = false"  /  v-if="showLocationModal"
- [ ] **e0022-c064** [table row, lines 442-442](../development-pack/modules/11_inventory.md#L442) -- locationLoading ? Creating... : Create Location — resources/js/Pages/Products/Edit.vue:715  /  type="button"; variant="default"; @click="createLocation"; :loading="locationLoading"; :disable...
- [ ] **e0022-c065** [prose, lines 444-444](../development-pack/modules/11_inventory.md#L444) -- **Script endpoint names:** categories.store, locations.store, products.update. Match these to verb/path/permission in the route annex.

### e0023: Products/Index

Source: [exact contract](../development-pack/modules/11_inventory.md#e0023). Complete every clause below before closing this section in the ledger.

- [ ] **e0023-c001** [prose, lines 454-454](../development-pack/modules/11_inventory.md#L454) -- GET /products; view_products. Search product/name/SKU/barcode including variants; filters category, location, low_stock (query-carried), per_page 15/25/50/100. Table has checkbox, product/im...
- [ ] **e0023-c002** [prose, lines 456-456](../development-pack/modules/11_inventory.md#L456) -- Source: resources/js/Pages/Products/Index.vue:1.
- [ ] **e0023-c003** [prose, lines 458-458](../development-pack/modules/11_inventory.md#L458) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0023-c004** [source-code reference, lines 460-485](../development-pack/modules/11_inventory.md#L460) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0023-c005** [prose, lines 487-487](../development-pack/modules/11_inventory.md#L487) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0023-c006** [table row, lines 489-489](../development-pack/modules/11_inventory.md#L489) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0023-c007** [table row, lines 491-491](../development-pack/modules/11_inventory.md#L491) -- search — resources/js/Pages/Products/Index.vue:251  /  Search Products  /  search; props.filters?.search \ / \ /  ''  /  ; v-model="search"; type="search"; :placeholder="t('products.searchPl...
- [ ] **e0023-c008** [table row, lines 492-492](../development-pack/modules/11_inventory.md#L492) -- category — resources/js/Pages/Products/Index.vue:259  /  Category  /  select; props.filters?.category \ / \ /  ''  /  ; v-model="category"  /  Always within this view/dialog; see component v...
- [ ] **e0023-c009** [table row, lines 493-493](../development-pack/modules/11_inventory.md#L493) -- location — resources/js/Pages/Products/Index.vue:266  /  Location  /  select; props.filters?.location \ / \ /  ''  /  ; v-model="location"  /  Always within this view/dialog; see component v...
- [ ] **e0023-c010** [table row, lines 494-494](../development-pack/modules/11_inventory.md#L494) -- (unbound) — resources/js/Pages/Products/Index.vue:303  /  No explicit label / see context  /  checkbox; See :value / :checked and event handler; not a v-model field  /  ; type="checkbox"; :c...
- [ ] **e0023-c011** [table row, lines 495-495](../development-pack/modules/11_inventory.md#L495) -- (unbound) — resources/js/Pages/Products/Index.vue:326  /  No explicit label / see context  /  checkbox; See :value / :checked and event handler; not a v-model field  /  type="checkbox"; :che...
- [ ] **e0023-c012** [table row, lines 496-496](../development-pack/modules/11_inventory.md#L496) -- perPage — resources/js/Pages/Products/Index.vue:363  /  Products per page  /  select; Number(props.filters?.per_page) \ / \ /  15  /  ; v-model="perPage"; :title="t('inventoryCleanup.selecti...
- [ ] **e0023-c013** [table row, lines 497-497](../development-pack/modules/11_inventory.md#L497) -- bulkCategoryId — resources/js/Pages/Products/Index.vue:399  /  No explicit label / see context  /  select; ''  /  ; v-model="bulkCategoryId"  /  v-if="showBulkCategoryModal"
- [ ] **e0023-c014** [table row, lines 498-498](../development-pack/modules/11_inventory.md#L498) -- bulkPriceType — resources/js/Pages/Products/Index.vue:421  /  Adjustment type  /  select; 'percentage'  /  ; v-model="bulkPriceType"  /  v-if="showBulkPriceModal"
- [ ] **e0023-c015** [table row, lines 499-499](../development-pack/modules/11_inventory.md#L499) -- bulkPriceValue — resources/js/Pages/Products/Index.vue:428  /  Value (use negative to decrease)  /  number; 0  /  ; v-model.number="bulkPriceValue"; type="number"; step="0.01"; :placeholder=...
- [ ] **e0023-c016** [prose, lines 501-501](../development-pack/modules/11_inventory.md#L501) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0023-c017** [statement, lines 503-503](../development-pack/modules/11_inventory.md#L503) -- - category (resources/js/Pages/Products/Index.vue:259): &amp;lt;option value=""&amp;gt;{{ All Categories }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="cat in categories" :key="cat.id" :value="cat.id"&amp;gt;{{ ca...
- [ ] **e0023-c018** [statement, lines 504-504](../development-pack/modules/11_inventory.md#L504) -- - location (resources/js/Pages/Products/Index.vue:266): &amp;lt;option value=""&amp;gt;{{ All Locations }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="loc in locations" :key="loc.id" :value="loc.id"&amp;gt;{{ loc....
- [ ] **e0023-c019** [statement, lines 505-505](../development-pack/modules/11_inventory.md#L505) -- - perPage (resources/js/Pages/Products/Index.vue:363): &amp;lt;option v-for="size in &#91;15, 25, 50, 100&#93;" :key="size" :value="size"&amp;gt;{{ size }}&amp;lt;/option&amp;gt;
- [ ] **e0023-c020** [statement, lines 506-506](../development-pack/modules/11_inventory.md#L506) -- - bulkCategoryId (resources/js/Pages/Products/Index.vue:399): &amp;lt;option value=""&amp;gt;{{ Select a category... }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="cat in categories" :key="cat.id" :value="cat....
- [ ] **e0023-c021** [statement, lines 507-507](../development-pack/modules/11_inventory.md#L507) -- - bulkPriceType (resources/js/Pages/Products/Index.vue:421): &amp;lt;option value="percentage"&amp;gt;{{ Percentage (%) }}&amp;lt;/option&amp;gt; &amp;lt;option value="fixed"&amp;gt;{{ Fixed Amount ($) }}&amp;lt;/optio...
- [ ] **e0023-c022** [prose, lines 509-509](../development-pack/modules/11_inventory.md#L509) -- **Read fields, columns and section headings:**
- [ ] **e0023-c023** [statement, lines 511-511](../development-pack/modules/11_inventory.md#L511) -- - th: (selection/action column) — resources/js/Pages/Products/Index.vue:302
- [ ] **e0023-c024** [statement, lines 512-512](../development-pack/modules/11_inventory.md#L512) -- - th: Product — resources/js/Pages/Products/Index.vue:305
- [ ] **e0023-c025** [statement, lines 513-513](../development-pack/modules/11_inventory.md#L513) -- - th: SKU / Barcode — resources/js/Pages/Products/Index.vue:306
- [ ] **e0023-c026** [statement, lines 514-514](../development-pack/modules/11_inventory.md#L514) -- - th: Category — resources/js/Pages/Products/Index.vue:307
- [ ] **e0023-c027** [statement, lines 515-515](../development-pack/modules/11_inventory.md#L515) -- - th: Location — resources/js/Pages/Products/Index.vue:308
- [ ] **e0023-c028** [statement, lines 516-516](../development-pack/modules/11_inventory.md#L516) -- - th: Stock — resources/js/Pages/Products/Index.vue:309
- [ ] **e0023-c029** [statement, lines 517-517](../development-pack/modules/11_inventory.md#L517) -- - th: Price — resources/js/Pages/Products/Index.vue:310
- [ ] **e0023-c030** [statement, lines 518-518](../development-pack/modules/11_inventory.md#L518) -- - th: Actions — resources/js/Pages/Products/Index.vue:311
- [ ] **e0023-c031** [statement, lines 519-519](../development-pack/modules/11_inventory.md#L519) -- - h3: Change category — resources/js/Pages/Products/Index.vue:397 — v-if="showBulkCategoryModal"
- [ ] **e0023-c032** [statement, lines 520-520](../development-pack/modules/11_inventory.md#L520) -- - h3: Adjust price — resources/js/Pages/Products/Index.vue:416 — v-if="showBulkPriceModal"
- [ ] **e0023-c033** [prose, lines 522-522](../development-pack/modules/11_inventory.md#L522) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0023-c034** [table row, lines 524-524](../development-pack/modules/11_inventory.md#L524) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0023-c035** [table row, lines 526-526](../development-pack/modules/11_inventory.md#L526) -- Variant replenishment — resources/js/Pages/Products/Index.vue:236  /  v-if="canVisit('variant-replenishment.index')"; variant="secondary"; size="sm"; as="Link"; :href="route('variant-repleni...
- [ ] **e0023-c036** [table row, lines 527-527](../development-pack/modules/11_inventory.md#L527) -- Reset stock to zero — resources/js/Pages/Products/Index.vue:237  /  v-if="canResetStock"; variant="secondary"; size="sm"; as="Link"; :href="route('products.stock-reset.preview')"  /  No ance...
- [ ] **e0023-c037** [table row, lines 528-528](../development-pack/modules/11_inventory.md#L528) -- Add Product — resources/js/Pages/Products/Index.vue:238  /  v-if="canVisit('products.create')"; variant="default"; size="sm"; as="Link"; :href="route('products.create')"  /  No ancestor cond...
- [ ] **e0023-c038** [table row, lines 529-529](../development-pack/modules/11_inventory.md#L529) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Index.vue:252  /  type="submit"; :aria-label="t('common.search')"  /  No ancestor condition
- [ ] **e0023-c039** [table row, lines 530-530](../development-pack/modules/11_inventory.md#L530) -- Clear Filters — resources/js/Pages/Products/Index.vue:274  /  type="button"; variant="secondary"; size="sm"; @click="clearFilters"  /  No ancestor condition
- [ ] **e0023-c040** [table row, lines 531-531](../development-pack/modules/11_inventory.md#L531) -- Clear selection — resources/js/Pages/Products/Index.vue:285  /  @click="selectedProducts = &#91;&#93;"  /  v-if="selectedProducts.length &amp;gt; 0"
- [ ] **e0023-c041** [table row, lines 532-532](../development-pack/modules/11_inventory.md#L532) -- Print Barcodes — resources/js/Pages/Products/Index.vue:288  /  variant="default"; size="sm"; @click="printSelectedBarcodes"  /  v-if="selectedProducts.length &amp;gt; 0"
- [ ] **e0023-c042** [table row, lines 533-533](../development-pack/modules/11_inventory.md#L533) -- Print QR Labels — resources/js/Pages/Products/Index.vue:289  /  variant="secondary"; size="sm"; @click="printSelectedQrLabels"  /  v-if="selectedProducts.length &amp;gt; 0"
- [ ] **e0023-c043** [table row, lines 534-534](../development-pack/modules/11_inventory.md#L534) -- Change category — resources/js/Pages/Products/Index.vue:290  /  variant="secondary"; size="sm"; :disabled="bulkProcessing"; @click="showBulkCategoryModal = true"  /  v-if="selectedProducts.l...
- [ ] **e0023-c044** [table row, lines 535-535](../development-pack/modules/11_inventory.md#L535) -- Adjust price — resources/js/Pages/Products/Index.vue:291  /  variant="secondary"; size="sm"; :disabled="bulkProcessing"; @click="showBulkPriceModal = true"  /  v-if="selectedProducts.length ...
- [ ] **e0023-c045** [table row, lines 536-536](../development-pack/modules/11_inventory.md#L536) -- Export — resources/js/Pages/Products/Index.vue:292  /  variant="secondary"; size="sm"; :disabled="bulkProcessing"; @click="bulkExport"  /  v-if="selectedProducts.length &amp;gt; 0"
- [ ] **e0023-c046** [table row, lines 537-537](../development-pack/modules/11_inventory.md#L537) -- Delete — resources/js/Pages/Products/Index.vue:293  /  variant="danger"; size="sm"; :disabled="bulkProcessing"; @click="bulkDelete"  /  v-if="selectedProducts.length &amp;gt; 0"
- [ ] **e0023-c047** [table row, lines 538-538](../development-pack/modules/11_inventory.md#L538) -- Add Your First Product — resources/js/Pages/Products/Index.vue:320  /  v-if="canVisit('products.create')"; variant="default"; size="sm"; as="Link"; :href="route('products.create')"  /  v-if=...
- [ ] **e0023-c048** [table row, lines 539-539](../development-pack/modules/11_inventory.md#L539) -- product.display_name ?? product.name — resources/js/Pages/Products/Index.vue:329  /  :href="route('products.show', product.id)"  /  v-for="product in products.data"
- [ ] **e0023-c049** [table row, lines 540-540](../development-pack/modules/11_inventory.md#L540) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Index.vue:348  /  :href="route('products.show', product.id)"; :title="t('common.view')"  /  v-for="product in ...
- [ ] **e0023-c050** [table row, lines 541-541](../development-pack/modules/11_inventory.md#L541) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Index.vue:349  /  v-if="product.barcode \ / \ /  product.sku"; @click="printBarcode(product.id)"; :title="t('p...
- [ ] **e0023-c051** [table row, lines 542-542](../development-pack/modules/11_inventory.md#L542) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Index.vue:350  /  @click="duplicateProduct(product)"; :title="t('products.duplicate')"  /  v-for="product in p...
- [ ] **e0023-c052** [table row, lines 543-543](../development-pack/modules/11_inventory.md#L543) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Index.vue:351  /  v-if="canVisit('products.edit')"; :href="route('products.edit', product.id)"; :title="t('com...
- [ ] **e0023-c053** [table row, lines 544-544](../development-pack/modules/11_inventory.md#L544) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Index.vue:352  /  v-if="hasPermission('delete_products')"; @click="deleteProduct(product)"; :title="t('common....
- [ ] **e0023-c054** [table row, lines 545-545](../development-pack/modules/11_inventory.md#L545) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Index.vue:375  /  v-if="link.url"; preserve-state; preserve-scroll; :href="link.url"; v-html="link.label"  /  ...
- [ ] **e0023-c055** [table row, lines 546-546](../development-pack/modules/11_inventory.md#L546) -- Cancel — resources/js/Pages/Products/Index.vue:404  /  variant="secondary"; size="sm"; @click="showBulkCategoryModal = false"  /  v-if="showBulkCategoryModal"
- [ ] **e0023-c056** [table row, lines 547-547](../development-pack/modules/11_inventory.md#L547) -- Update category — resources/js/Pages/Products/Index.vue:405  /  variant="default"; size="sm"; :disabled="!bulkCategoryId \ / \ /  bulkProcessing"; @click="bulkUpdateCategory"  /  v-if="showB...
- [ ] **e0023-c057** [table row, lines 548-548](../development-pack/modules/11_inventory.md#L548) -- Cancel — resources/js/Pages/Products/Index.vue:434  /  variant="secondary"; size="sm"; @click="showBulkPriceModal = false"  /  v-if="showBulkPriceModal"
- [ ] **e0023-c058** [table row, lines 549-549](../development-pack/modules/11_inventory.md#L549) -- Apply price change — resources/js/Pages/Products/Index.vue:435  /  variant="default"; size="sm"; :disabled="!bulkPriceValue \ / \ /  bulkProcessing"; @click="bulkUpdatePrice"  /  v-if="showB...
- [ ] **e0023-c059** [table row, lines 550-550](../development-pack/modules/11_inventory.md#L550) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Products/Index.vue:442  /  v-if="$page.props.auth.permissions.includes('products.view')"; @click="openScanner"; :title=...
- [ ] **e0023-c060** [prose, lines 552-552](../development-pack/modules/11_inventory.md#L552) -- **Script endpoint names:** products.show, products.barcode.bulk-print, products.qr.bulk-print, products.barcode.print, products.index, products.destroy, products.bulk.delete, products.bulk.u...

### e0024: Products/ResetStock

Source: [exact contract](../development-pack/modules/11_inventory.md#e0024). Complete every clause below before closing this section in the ledger.

- [ ] **e0024-c001** [prose, lines 562-562](../development-pack/modules/11_inventory.md#L562) -- GET /products/stock-reset; admin + manage_stock. Preview summary and blocker links, no mutation until confirmation form submitted. Hidden payload token from server, reason/current password/e...
- [ ] **e0024-c002** [prose, lines 564-564](../development-pack/modules/11_inventory.md#L564) -- Source: resources/js/Pages/Products/ResetStock.vue:1.
- [ ] **e0024-c003** [prose, lines 566-566](../development-pack/modules/11_inventory.md#L566) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0024-c004** [source-code reference, lines 568-571](../development-pack/modules/11_inventory.md#L568) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0024-c005** [prose, lines 573-573](../development-pack/modules/11_inventory.md#L573) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0024-c006** [table row, lines 575-575](../development-pack/modules/11_inventory.md#L575) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0024-c007** [table row, lines 577-577](../development-pack/modules/11_inventory.md#L577) -- form.reason — resources/js/Pages/Products/ResetStock.vue:59  /  Reason  /  textarea; ''  /  v-model="form.reason"; rows="2"; required; minlength="3"; maxlength="500"  /  v-else
- [ ] **e0024-c008** [table row, lines 578-578](../development-pack/modules/11_inventory.md#L578) -- form.password — resources/js/Pages/Products/ResetStock.vue:60  /  Current password  /  password; ''  /  v-model="form.password"; type="password"; autocomplete="current-password"; required  /...
- [ ] **e0024-c009** [table row, lines 579-579](../development-pack/modules/11_inventory.md#L579) -- form.confirmation — resources/js/Pages/Products/ResetStock.vue:61  /  Type {phrase} to confirm  /  input; ''  /  v-model="form.confirmation"; required; autocomplete="off"  /  v-else
- [ ] **e0024-c010** [prose, lines 581-581](../development-pack/modules/11_inventory.md#L581) -- **Read fields, columns and section headings:**
- [ ] **e0024-c011** [statement, lines 583-583](../development-pack/modules/11_inventory.md#L583) -- - dt: t(stockReset.${label}) — resources/js/Pages/Products/ResetStock.vue:42 — v-for="&#91;label, count&#93; in rows"
- [ ] **e0024-c012** [prose, lines 585-585](../development-pack/modules/11_inventory.md#L585) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0024-c013** [table row, lines 587-587](../development-pack/modules/11_inventory.md#L587) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0024-c014** [table row, lines 589-589](../development-pack/modules/11_inventory.md#L589) -- t(label) — resources/js/Pages/Products/ResetStock.vue:49  /  v-if="destination"; :href="route(destination)"  /  v-if="preview.blocked" → v-if="blockers.length" → v-for="&#91;key, label, destinat...
- [ ] **e0024-c015** [table row, lines 590-590](../development-pack/modules/11_inventory.md#L590) -- View current reset — resources/js/Pages/Products/ResetStock.vue:55  /  v-if="pendingRun"; :href="route('products.stock-reset.show', pendingRun)"  /  v-if="preview.blocked"
- [ ] **e0024-c016** [table row, lines 591-591](../development-pack/modules/11_inventory.md#L591) -- Reset stock to zero — resources/js/Pages/Products/ResetStock.vue:63  /  variant="danger"; type="submit"; :disabled="form.processing \ / \ /  form.confirmation !== 'ZERO STOCK'"  /  v-else
- [ ] **e0024-c017** [table row, lines 592-592](../development-pack/modules/11_inventory.md#L592) -- Refresh preview — resources/js/Pages/Products/ResetStock.vue:67  /  :href="route('products.stock-reset.preview')"  /  No ancestor condition
- [ ] **e0024-c018** [table row, lines 593-593](../development-pack/modules/11_inventory.md#L593) -- Cancel — resources/js/Pages/Products/ResetStock.vue:68  /  :href="route('products.index')"  /  No ancestor condition
- [ ] **e0024-c019** [prose, lines 595-595](../development-pack/modules/11_inventory.md#L595) -- **Script endpoint names:** products.stock-reset.store. Match these to verb/path/permission in the route annex.

### e0025: Products/ResetStockStatus

Source: [exact contract](../development-pack/modules/11_inventory.md#e0025). Complete every clause below before closing this section in the ledger.

- [ ] **e0025-c001** [prose, lines 605-605](../development-pack/modules/11_inventory.md#L605) -- GET /products/stock-reset/status/{public_id}; admin + manage_stock. Read-only pending/running/completed/failed, summary counts, reset reference, reason, finish date/error recovery. Poll only...
- [ ] **e0025-c002** [prose, lines 607-607](../development-pack/modules/11_inventory.md#L607) -- Source: resources/js/Pages/Products/ResetStockStatus.vue:1.
- [ ] **e0025-c003** [prose, lines 609-609](../development-pack/modules/11_inventory.md#L609) -- **Input fields:** none in this page/component template.
- [ ] **e0025-c004** [prose, lines 612-612](../development-pack/modules/11_inventory.md#L612) -- **Read fields, columns and section headings:**
- [ ] **e0025-c005** [statement, lines 614-614](../development-pack/modules/11_inventory.md#L614) -- - dt: t(stockReset.${label}) — resources/js/Pages/Products/ResetStockStatus.vue:37 — v-for="&#91;label, count&#93; in rows"
- [ ] **e0025-c006** [statement, lines 615-615](../development-pack/modules/11_inventory.md#L615) -- - dt: Reset reference — resources/js/Pages/Products/ResetStockStatus.vue:41
- [ ] **e0025-c007** [statement, lines 616-616](../development-pack/modules/11_inventory.md#L616) -- - dt: Reason — resources/js/Pages/Products/ResetStockStatus.vue:42
- [ ] **e0025-c008** [statement, lines 617-617](../development-pack/modules/11_inventory.md#L617) -- - dt: Date — resources/js/Pages/Products/ResetStockStatus.vue:43 — v-if="run.finished_at"
- [ ] **e0025-c009** [prose, lines 619-619](../development-pack/modules/11_inventory.md#L619) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0025-c010** [table row, lines 621-621](../development-pack/modules/11_inventory.md#L621) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0025-c011** [table row, lines 623-623](../development-pack/modules/11_inventory.md#L623) -- Inventory — resources/js/Pages/Products/ResetStockStatus.vue:46  /  :href="route('products.index')"  /  No ancestor condition
- [ ] **e0025-c012** [table row, lines 624-624](../development-pack/modules/11_inventory.md#L624) -- Refresh preview — resources/js/Pages/Products/ResetStockStatus.vue:47  /  v-if="run.status === 'failed'"; :href="route('products.stock-reset.preview')"  /  No ancestor condition

### e0026: Products/Show

Source: [exact contract](../development-pack/modules/11_inventory.md#e0026). Complete every clause below before closing this section in the ledger.

- [ ] **e0026-c001** [prose, lines 634-634](../development-pack/modules/11_inventory.md#L634) -- GET /products/{product}; view_products. Read-only detail includes stock/value tiles, name/SKU/type/description/notes/category/location, product and variant bins, sell/purchase prices and pro...
- [ ] **e0026-c002** [prose, lines 636-636](../development-pack/modules/11_inventory.md#L636) -- Source: resources/js/Pages/Products/Show.vue:1.
- [ ] **e0026-c003** [prose, lines 638-638](../development-pack/modules/11_inventory.md#L638) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0026-c004** [source-code reference, lines 640-673](../development-pack/modules/11_inventory.md#L640) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0026-c005** [prose, lines 675-675](../development-pack/modules/11_inventory.md#L675) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0026-c006** [table row, lines 677-677](../development-pack/modules/11_inventory.md#L677) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0026-c007** [table row, lines 679-679](../development-pack/modules/11_inventory.md#L679) -- componentSearch — resources/js/Pages/Products/Show.vue:678  /  Search Product  /  text; ''  /  ; v-model="componentSearch"; type="text"; :placeholder="t('products.show.bom.searchPlaceholder'...
- [ ] **e0026-c008** [table row, lines 680-680](../development-pack/modules/11_inventory.md#L680) -- newComponentQty — resources/js/Pages/Products/Show.vue:705  /  Quantity  /  number; 1  /  ; v-model.number="newComponentQty"; type="number"; min="1"  /  v-if="isKitOrAssembly" → v-if="showAd...
- [ ] **e0026-c009** [table row, lines 681-681](../development-pack/modules/11_inventory.md#L681) -- editingComponentQty — resources/js/Pages/Products/Show.vue:745  /  No explicit label / see context  /  number; 1  /  v-model.number="editingComponentQty"; type="number"; min="1"  /  v-if="is...
- [ ] **e0026-c010** [prose, lines 683-683](../development-pack/modules/11_inventory.md#L683) -- **Read fields, columns and section headings:**
- [ ] **e0026-c011** [statement, lines 685-685](../development-pack/modules/11_inventory.md#L685) -- - h3: product.display_name ?? product.name — resources/js/Pages/Products/Show.vue:368
- [ ] **e0026-c012** [statement, lines 686-686](../development-pack/modules/11_inventory.md#L686) -- - h4: Description — resources/js/Pages/Products/Show.vue:381 — v-if="product.description"
- [ ] **e0026-c013** [statement, lines 687-687](../development-pack/modules/11_inventory.md#L687) -- - h4: Notes — resources/js/Pages/Products/Show.vue:386 — v-if="product.notes"
- [ ] **e0026-c014** [statement, lines 688-688](../development-pack/modules/11_inventory.md#L688) -- - h4: Category — resources/js/Pages/Products/Show.vue:392
- [ ] **e0026-c015** [statement, lines 689-689](../development-pack/modules/11_inventory.md#L689) -- - h4: Location — resources/js/Pages/Products/Show.vue:398
- [ ] **e0026-c016** [statement, lines 690-690](../development-pack/modules/11_inventory.md#L690) -- - h4: Stock by location — resources/js/Pages/Products/Show.vue:404 — v-if="locationBreakdown.length"
- [ ] **e0026-c017** [statement, lines 691-691](../development-pack/modules/11_inventory.md#L691) -- - h3: Pricing Information — resources/js/Pages/Products/Show.vue:425
- [ ] **e0026-c018** [statement, lines 692-692](../development-pack/modules/11_inventory.md#L692) -- - h4: Selling Price — resources/js/Pages/Products/Show.vue:429
- [ ] **e0026-c019** [statement, lines 693-693](../development-pack/modules/11_inventory.md#L693) -- - h4: Purchase Price — resources/js/Pages/Products/Show.vue:438 — v-if="product.purchase_price"
- [ ] **e0026-c020** [statement, lines 694-694](../development-pack/modules/11_inventory.md#L694) -- - h4: Profit per Unit — resources/js/Pages/Products/Show.vue:451 — v-if="product.purchase_price &amp;&amp; product.price"
- [ ] **e0026-c021** [statement, lines 695-695](../development-pack/modules/11_inventory.md#L695) -- - h4: Profit Margin — resources/js/Pages/Products/Show.vue:457 — v-if="product.purchase_price &amp;&amp; product.price"
- [ ] **e0026-c022** [statement, lines 696-696](../development-pack/modules/11_inventory.md#L696) -- - h4: Total Profit in Stock — resources/js/Pages/Products/Show.vue:463 — v-if="product.purchase_price &amp;&amp; product.price"
- [ ] **e0026-c023** [statement, lines 697-697](../development-pack/modules/11_inventory.md#L697) -- - h4: Alternative Currencies — resources/js/Pages/Products/Show.vue:472 — v-if="product.price_in_currencies &amp;&amp; Object.keys(product.price_in_currencies).length &amp;gt; 0"
- [ ] **e0026-c024** [statement, lines 698-698](../development-pack/modules/11_inventory.md#L698) -- - h3: Stock by location — resources/js/Pages/Products/Show.vue:490 — v-if="product.has_variants &amp;&amp; variantLocationBreakdown.length"
- [ ] **e0026-c025** [statement, lines 699-699](../development-pack/modules/11_inventory.md#L699) -- - th: SKU — resources/js/Pages/Products/Show.vue:494 — v-if="product.has_variants &amp;&amp; variantLocationBreakdown.length"
- [ ] **e0026-c026** [statement, lines 700-700](../development-pack/modules/11_inventory.md#L700) -- - th: Warehouse — resources/js/Pages/Products/Show.vue:495 — v-if="product.has_variants &amp;&amp; variantLocationBreakdown.length"
- [ ] **e0026-c027** [statement, lines 701-701](../development-pack/modules/11_inventory.md#L701) -- - th: Location — resources/js/Pages/Products/Show.vue:496 — v-if="product.has_variants &amp;&amp; variantLocationBreakdown.length"
- [ ] **e0026-c028** [statement, lines 702-702](../development-pack/modules/11_inventory.md#L702) -- - th: Stock — resources/js/Pages/Products/Show.vue:497 — v-if="product.has_variants &amp;&amp; variantLocationBreakdown.length"
- [ ] **e0026-c029** [statement, lines 703-703](../development-pack/modules/11_inventory.md#L703) -- - h3: Suppliers — resources/js/Pages/Products/Show.vue:526
- [ ] **e0026-c030** [statement, lines 704-704](../development-pack/modules/11_inventory.md#L704) -- - th: Supplier — resources/js/Pages/Products/Show.vue:537 — v-if="productSuppliers.length &amp;gt; 0"
- [ ] **e0026-c031** [statement, lines 705-705](../development-pack/modules/11_inventory.md#L705) -- - th: Supplier SKU — resources/js/Pages/Products/Show.vue:538 — v-if="productSuppliers.length &amp;gt; 0"
- [ ] **e0026-c032** [statement, lines 706-706](../development-pack/modules/11_inventory.md#L706) -- - th: Cost price — resources/js/Pages/Products/Show.vue:539 — v-if="productSuppliers.length &amp;gt; 0"
- [ ] **e0026-c033** [statement, lines 707-707](../development-pack/modules/11_inventory.md#L707) -- - th: Lead time (days) — resources/js/Pages/Products/Show.vue:540 — v-if="productSuppliers.length &amp;gt; 0"
- [ ] **e0026-c034** [statement, lines 708-708](../development-pack/modules/11_inventory.md#L708) -- - th: Min order qty — resources/js/Pages/Products/Show.vue:541 — v-if="productSuppliers.length &amp;gt; 0"
- [ ] **e0026-c035** [statement, lines 709-709](../development-pack/modules/11_inventory.md#L709) -- - h3: Supplier price history — resources/js/Pages/Products/Show.vue:573 — v-if="priceHistory.length &amp;gt; 0"
- [ ] **e0026-c036** [statement, lines 710-710](../development-pack/modules/11_inventory.md#L710) -- - th: Date — resources/js/Pages/Products/Show.vue:579 — v-if="priceHistory.length &amp;gt; 0"
- [ ] **e0026-c037** [statement, lines 711-711](../development-pack/modules/11_inventory.md#L711) -- - th: Supplier — resources/js/Pages/Products/Show.vue:580 — v-if="priceHistory.length &amp;gt; 0"
- [ ] **e0026-c038** [statement, lines 712-712](../development-pack/modules/11_inventory.md#L712) -- - th: Cost price — resources/js/Pages/Products/Show.vue:581 — v-if="priceHistory.length &amp;gt; 0"
- [ ] **e0026-c039** [statement, lines 713-713](../development-pack/modules/11_inventory.md#L713) -- - th: Source — resources/js/Pages/Products/Show.vue:582 — v-if="priceHistory.length &amp;gt; 0"
- [ ] **e0026-c040** [statement, lines 714-714](../development-pack/modules/11_inventory.md#L714) -- - th: By — resources/js/Pages/Products/Show.vue:583 — v-if="priceHistory.length &amp;gt; 0"
- [ ] **e0026-c041** [statement, lines 715-715](../development-pack/modules/11_inventory.md#L715) -- - h3: Product Variants — resources/js/Pages/Products/Show.vue:616 — v-if="product.has_variants &amp;&amp; variants.length &amp;gt; 0"
- [ ] **e0026-c042** [statement, lines 716-716](../development-pack/modules/11_inventory.md#L716) -- - h3: Bill of Materials — resources/js/Pages/Products/Show.vue:644 — v-if="isKitOrAssembly"
- [ ] **e0026-c043** [statement, lines 717-717](../development-pack/modules/11_inventory.md#L717) -- - h4: Add Component — resources/js/Pages/Products/Show.vue:674 — v-if="isKitOrAssembly" → v-if="showAddComponent"
- [ ] **e0026-c044** [statement, lines 718-718](../development-pack/modules/11_inventory.md#L718) -- - th: Product — resources/js/Pages/Products/Show.vue:726 — v-if="isKitOrAssembly" → v-if="components.length &amp;gt; 0"
- [ ] **e0026-c045** [statement, lines 719-719](../development-pack/modules/11_inventory.md#L719) -- - th: SKU — resources/js/Pages/Products/Show.vue:727 — v-if="isKitOrAssembly" → v-if="components.length &amp;gt; 0"
- [ ] **e0026-c046** [statement, lines 720-720](../development-pack/modules/11_inventory.md#L720) -- - th: Qty Required — resources/js/Pages/Products/Show.vue:728 — v-if="isKitOrAssembly" → v-if="components.length &amp;gt; 0"
- [ ] **e0026-c047** [statement, lines 721-721](../development-pack/modules/11_inventory.md#L721) -- - th: Available Stock — resources/js/Pages/Products/Show.vue:729 — v-if="isKitOrAssembly" → v-if="components.length &amp;gt; 0"
- [ ] **e0026-c048** [statement, lines 722-722](../development-pack/modules/11_inventory.md#L722) -- - th: Actions — resources/js/Pages/Products/Show.vue:730 — v-if="isKitOrAssembly" → v-if="components.length &amp;gt; 0"
- [ ] **e0026-c049** [statement, lines 723-723](../development-pack/modules/11_inventory.md#L723) -- - h3: Product Images — resources/js/Pages/Products/Show.vue:814
- [ ] **e0026-c050** [statement, lines 724-724](../development-pack/modules/11_inventory.md#L724) -- - h3: Barcode — resources/js/Pages/Products/Show.vue:825 — v-if="product.barcode \|\| product.sku"
- [ ] **e0026-c051** [statement, lines 725-725](../development-pack/modules/11_inventory.md#L725) -- - h3: QR Code — resources/js/Pages/Products/Show.vue:870
- [ ] **e0026-c052** [statement, lines 726-726](../development-pack/modules/11_inventory.md#L726) -- - h3: Stock Information — resources/js/Pages/Products/Show.vue:903
- [ ] **e0026-c053** [statement, lines 727-727](../development-pack/modules/11_inventory.md#L727) -- - h3: Status — resources/js/Pages/Products/Show.vue:966
- [ ] **e0026-c054** [statement, lines 728-728](../development-pack/modules/11_inventory.md#L728) -- - h3: Activity History — resources/js/Pages/Products/Show.vue:995
- [ ] **e0026-c055** [prose, lines 730-730](../development-pack/modules/11_inventory.md#L730) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0026-c056** [table row, lines 732-732](../development-pack/modules/11_inventory.md#L732) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0026-c057** [table row, lines 734-734](../development-pack/modules/11_inventory.md#L734) -- Workspace — resources/js/Pages/Products/Show.vue:301  /  :href="route('products.index')"  /  No ancestor condition
- [ ] **e0026-c058** [table row, lines 735-735](../development-pack/modules/11_inventory.md#L735) -- Inventory — resources/js/Pages/Products/Show.vue:303  /  :href="route('products.index')"  /  No ancestor condition
- [ ] **e0026-c059** [table row, lines 736-736](../development-pack/modules/11_inventory.md#L736) -- Duplicate — resources/js/Pages/Products/Show.vue:312  /  variant="secondary"; size="sm"; @click="duplicateProduct"  /  No ancestor condition
- [ ] **e0026-c060** [table row, lines 737-737](../development-pack/modules/11_inventory.md#L737) -- Edit — resources/js/Pages/Products/Show.vue:316  /  v-if="canVisit('products.edit')"; variant="default"; size="sm"; as="Link"; :href="route('products.edit', product.id)"  /  No ancestor cond...
- [ ] **e0026-c061** [table row, lines 738-738](../development-pack/modules/11_inventory.md#L738) -- Back to Inventory — resources/js/Pages/Products/Show.vue:320  /  variant="secondary"; size="sm"; as="Link"; :href="route('products.index')"  /  No ancestor condition
- [ ] **e0026-c062** [table row, lines 739-739](../development-pack/modules/11_inventory.md#L739) -- Edit — resources/js/Pages/Products/Show.vue:527  /  v-if="(hasPermission('edit_products')) &amp;&amp; canVisit('products.edit')"; variant="ghost"; size="sm"; as="Link"; :href="route('products.edit',...
- [ ] **e0026-c063** [table row, lines 740-740](../development-pack/modules/11_inventory.md#L740) -- supplier.name — resources/js/Pages/Products/Show.vue:548  /  v-if="canVisit('suppliers.show')"; :href="route('suppliers.show', supplier.id)"  /  v-if="productSuppliers.length &amp;gt; 0" → v-for...
- [ ] **e0026-c064** [table row, lines 741-741](../development-pack/modules/11_inventory.md#L741) -- Add supplier — resources/js/Pages/Products/Show.vue:564  /  v-if="(hasPermission('edit_products')) &amp;&amp; canVisit('products.edit')"; :href="route('products.edit', product.id)"  /  v-else
- [ ] **e0026-c065** [table row, lines 742-742](../development-pack/modules/11_inventory.md#L742) -- PO {number} — resources/js/Pages/Products/Show.vue:595  /  v-if="entry.source === 'purchase_order' &amp;&amp; entry.purchase_order_id &amp;&amp; canVisit('purchase-orders.show')"; :href="route('purchase-ord...
- [ ] **e0026-c066** [table row, lines 743-743](../development-pack/modules/11_inventory.md#L743) -- Add Component — resources/js/Pages/Products/Show.vue:649  /  variant="default"; size="sm"; @click="showAddComponent = !showAddComponent"  /  v-if="isKitOrAssembly"
- [ ] **e0026-c067** [table row, lines 744-744](../development-pack/modules/11_inventory.md#L744) -- Create Work Order — resources/js/Pages/Products/Show.vue:666  /  v-if="canVisit('work-orders.create')"; variant="default"; size="md"; as="Link"; :href="route('work-orders.create', { product_...
- [ ] **e0026-c068** [table row, lines 745-745](../development-pack/modules/11_inventory.md#L745) -- result.name result.sku (Stock: {count}) — resources/js/Pages/Products/Show.vue:687  /  v-for="result in componentSearchResults"; :key="result.id"; type="button"; @click="selectComponent(resu...
- [ ] **e0026-c069** [table row, lines 746-746](../development-pack/modules/11_inventory.md#L746) -- Add — resources/js/Pages/Products/Show.vue:712  /  type="button"; variant="default"; @click="addComponent"; :disabled="!selectedComponent"  /  v-if="isKitOrAssembly" → v-if="showAddComponent...
- [ ] **e0026-c070** [table row, lines 747-747](../development-pack/modules/11_inventory.md#L747) -- Cancel — resources/js/Pages/Products/Show.vue:715  /  type="button"; variant="secondary"; @click="showAddComponent = false"  /  v-if="isKitOrAssembly" → v-if="showAddComponent"
- [ ] **e0026-c071** [table row, lines 748-748](../development-pack/modules/11_inventory.md#L748) -- comp.component?.name \ / \ /  Unknown — resources/js/Pages/Products/Show.vue:736  /  :href="route('products.show', comp.component?.id \ / \ /  comp.component_product_id)"  /  v-if="isKitOrAs...
- [ ] **e0026-c072** [table row, lines 749-749](../development-pack/modules/11_inventory.md#L749) -- Save — resources/js/Pages/Products/Show.vue:767  /  @click="saveComponentQty(comp)"  /  v-if="isKitOrAssembly" → v-if="components.length &amp;gt; 0" → v-for="comp in components" → v-if="editingC...
- [ ] **e0026-c073** [table row, lines 750-750](../development-pack/modules/11_inventory.md#L750) -- Cancel — resources/js/Pages/Products/Show.vue:768  /  @click="editingComponentId = null"  /  v-if="isKitOrAssembly" → v-if="components.length &amp;gt; 0" → v-for="comp in components" → v-if="edi...
- [ ] **e0026-c074** [table row, lines 751-751](../development-pack/modules/11_inventory.md#L751) -- Edit — resources/js/Pages/Products/Show.vue:771  /  @click="startEditComponent(comp)"  /  v-if="isKitOrAssembly" → v-if="components.length &amp;gt; 0" → v-for="comp in components" → v-else
- [ ] **e0026-c075** [table row, lines 752-752](../development-pack/modules/11_inventory.md#L752) -- Remove — resources/js/Pages/Products/Show.vue:772  /  @click="removeComponent(comp)"  /  v-if="isKitOrAssembly" → v-if="components.length &amp;gt; 0" → v-for="comp in components" → v-else
- [ ] **e0026-c076** [table row, lines 753-753](../development-pack/modules/11_inventory.md#L753) -- Print Barcodes — resources/js/Pages/Products/Show.vue:843  /  variant="default"; @click="printBarcode"  /  v-if="product.barcode \ / \ /  product.sku" → v-else-if="barcodeImage"
- [ ] **e0026-c077** [table row, lines 754-754](../development-pack/modules/11_inventory.md#L754) -- Generate New Random — resources/js/Pages/Products/Show.vue:849  /  variant="secondary"; @click="generateRandomBarcode"  /  v-if="product.barcode \ / \ /  product.sku" → v-else-if="barcodeIma...
- [ ] **e0026-c078** [table row, lines 755-755](../development-pack/modules/11_inventory.md#L755) -- Generate from SKU — resources/js/Pages/Products/Show.vue:852  /  variant="secondary"; @click="generateFromSKU"  /  v-if="product.barcode \ / \ /  product.sku" → v-else-if="barcodeImage"
- [ ] **e0026-c079** [table row, lines 756-756](../development-pack/modules/11_inventory.md#L756) -- Generate Barcode — resources/js/Pages/Products/Show.vue:860  /  variant="default"; @click="generateRandomBarcode"  /  v-if="product.barcode \ / \ /  product.sku" → v-else
- [ ] **e0026-c080** [table row, lines 757-757](../development-pack/modules/11_inventory.md#L757) -- option.label — resources/js/Pages/Products/Show.vue:872  /  v-for="option in &#91;{ value: 'sku', label: t('products.show.qrModeSku') }, { value: 'url', label: t('products.show.qrModeUrl') }&#93;"; ...
- [ ] **e0026-c081** [table row, lines 758-758](../development-pack/modules/11_inventory.md#L758) -- Print QR Label — resources/js/Pages/Products/Show.vue:894  /  variant="secondary"; @click="printQrLabel"  /  No ancestor condition
- [ ] **e0026-c082** [table row, lines 759-759](../development-pack/modules/11_inventory.md#L759) -- View reservations — resources/js/Pages/Products/Show.vue:933  /  v-if="canVisit('reservations.index')"; :href="route('reservations.index', { product_id: product.id })"  /  v-if="stockAvailab...
- [ ] **e0026-c083** [prose, lines 761-761](../development-pack/modules/11_inventory.md#L761) -- **Script endpoint names:** products.qr.generate, products.qr.print, products.barcode.generate, products.barcode.print, products.barcode.generate-random, products.barcode.generate-from-sku, p...

### e0046: Components/BarcodeScannerModal

Source: [exact contract](../development-pack/modules/11_inventory.md#e0046). Complete every clause below before closing this section in the ledger.

- [ ] **e0046-c001** [prose, lines 771-771](../development-pack/modules/11_inventory.md#L771) -- Camera/manual modes, manualCode, camera status/error, product/variant/location result summaries. Emits product-found/location-found or raw code-scanned; close stops camera. Manual submit tri...
- [ ] **e0046-c002** [prose, lines 773-773](../development-pack/modules/11_inventory.md#L773) -- Source: resources/js/Components/BarcodeScannerModal.vue:1.
- [ ] **e0046-c003** [prose, lines 775-775](../development-pack/modules/11_inventory.md#L775) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0046-c004** [source-code reference, lines 777-794](../development-pack/modules/11_inventory.md#L777) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0046-c005** [prose, lines 796-796](../development-pack/modules/11_inventory.md#L796) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0046-c006** [table row, lines 798-798](../development-pack/modules/11_inventory.md#L798) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0046-c007** [table row, lines 800-800](../development-pack/modules/11_inventory.md#L800) -- manualCode — resources/js/Components/BarcodeScannerModal.vue:200  /  Enter Barcode or SKU  /  text; ''  /  ; v-model="manualCode"; type="text"; :placeholder="t('components.barcodeScanner.inp...
- [ ] **e0046-c008** [prose, lines 802-802](../development-pack/modules/11_inventory.md#L802) -- **Read fields, columns and section headings:**
- [ ] **e0046-c009** [statement, lines 804-804](../development-pack/modules/11_inventory.md#L804) -- - h3: Scan barcode to find product — resources/js/Components/BarcodeScannerModal.vue:139 — v-if="show"
- [ ] **e0046-c010** [statement, lines 805-805](../development-pack/modules/11_inventory.md#L805) -- - h4: Product Found — resources/js/Components/BarcodeScannerModal.vue:236 — v-if="show" → v-if="foundProduct"
- [ ] **e0046-c011** [statement, lines 806-806](../development-pack/modules/11_inventory.md#L806) -- - dt: Name : — resources/js/Components/BarcodeScannerModal.vue:239 — v-if="show" → v-if="foundProduct"
- [ ] **e0046-c012** [statement, lines 807-807](../development-pack/modules/11_inventory.md#L807) -- - dt: Variant : — resources/js/Components/BarcodeScannerModal.vue:243 — v-if="show" → v-if="foundProduct" → v-if="foundVariant"
- [ ] **e0046-c013** [statement, lines 808-808](../development-pack/modules/11_inventory.md#L808) -- - dt: SKU: — resources/js/Components/BarcodeScannerModal.vue:247 — v-if="show" → v-if="foundProduct"
- [ ] **e0046-c014** [statement, lines 809-809](../development-pack/modules/11_inventory.md#L809) -- - dt: Stock : — resources/js/Components/BarcodeScannerModal.vue:251 — v-if="show" → v-if="foundProduct"
- [ ] **e0046-c015** [statement, lines 810-810](../development-pack/modules/11_inventory.md#L810) -- - h4: Location Found — resources/js/Components/BarcodeScannerModal.vue:265 — v-if="show" → v-if="foundLocation"
- [ ] **e0046-c016** [prose, lines 812-812](../development-pack/modules/11_inventory.md#L812) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0046-c017** [table row, lines 814-814](../development-pack/modules/11_inventory.md#L814) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0046-c018** [table row, lines 816-816](../development-pack/modules/11_inventory.md#L816) -- (icon-only; accessible label/title in attributes) — resources/js/Components/BarcodeScannerModal.vue:142  /  @click="close"  /  v-if="show"
- [ ] **e0046-c019** [table row, lines 817-817](../development-pack/modules/11_inventory.md#L817) -- Camera — resources/js/Components/BarcodeScannerModal.vue:153  /  @click="toggleMode"  /  v-if="show"
- [ ] **e0046-c020** [table row, lines 818-818](../development-pack/modules/11_inventory.md#L818) -- Manual Entry — resources/js/Components/BarcodeScannerModal.vue:168  /  @click="toggleMode"  /  v-if="show"
- [ ] **e0046-c021** [table row, lines 819-819](../development-pack/modules/11_inventory.md#L819) -- Lookup — resources/js/Components/BarcodeScannerModal.vue:207  /  @click="submitManualCode"; :disabled="!manualCode.trim() \ / \ /  isLoading"  /  v-if="show" → v-else
- [ ] **e0046-c022** [table row, lines 820-820](../development-pack/modules/11_inventory.md#L820) -- Select Product — resources/js/Components/BarcodeScannerModal.vue:255  /  @click="selectProduct"  /  v-if="show" → v-if="foundProduct"
- [ ] **e0046-c023** [table row, lines 821-821](../development-pack/modules/11_inventory.md#L821) -- View Products Here — resources/js/Components/BarcodeScannerModal.vue:272  /  :href="foundLocation.products_url"  /  v-if="show" → v-if="foundLocation"
- [ ] **e0046-c024** [prose, lines 823-823](../development-pack/modules/11_inventory.md#L823) -- **Script endpoint names:** barcode.lookup. Match these to verb/path/permission in the route annex.

### e0047: Components/BatchList

Source: [exact contract](../development-pack/modules/11_inventory.md#e0047). Complete every clause below before closing this section in the ledger.

- [ ] **e0047-c001** [prose, lines 833-833](../development-pack/modules/11_inventory.md#L833) -- Product detail batch-tracking child. Add form blank defaults; list batch_number/quantity/manufactured_date/expiry_date/notes with expiration indication. Optional batch number/date/notes omit...
- [ ] **e0047-c002** [prose, lines 835-835](../development-pack/modules/11_inventory.md#L835) -- Source: resources/js/Components/BatchList.vue:1.
- [ ] **e0047-c003** [prose, lines 837-837](../development-pack/modules/11_inventory.md#L837) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0047-c004** [source-code reference, lines 839-856](../development-pack/modules/11_inventory.md#L839) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0047-c005** [prose, lines 858-858](../development-pack/modules/11_inventory.md#L858) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0047-c006** [table row, lines 860-860](../development-pack/modules/11_inventory.md#L860) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0047-c007** [table row, lines 862-862](../development-pack/modules/11_inventory.md#L862) -- form.batch_number — resources/js/Components/BatchList.vue:115  /  Batch Number (auto-generated if empty)  /  text; ''  /  ; v-model="form.batch_number"; type="text"; placeholder="BATCH-20260...
- [ ] **e0047-c008** [table row, lines 863-863](../development-pack/modules/11_inventory.md#L863) -- form.quantity — resources/js/Components/BatchList.vue:124  /  Quantity *  /  number; ''  /  ; v-model="form.quantity"; type="number"; min="0"; required  /  v-if="showForm"
- [ ] **e0047-c009** [table row, lines 864-864](../development-pack/modules/11_inventory.md#L864) -- form.manufactured_date — resources/js/Components/BatchList.vue:134  /  Manufactured Date  /  date; ''  /  ; v-model="form.manufactured_date"; type="date"  /  v-if="showForm"
- [ ] **e0047-c010** [table row, lines 865-865](../development-pack/modules/11_inventory.md#L865) -- form.expiry_date — resources/js/Components/BatchList.vue:142  /  Expiry Date  /  date; ''  /  ; v-model="form.expiry_date"; type="date"  /  v-if="showForm"
- [ ] **e0047-c011** [table row, lines 866-866](../development-pack/modules/11_inventory.md#L866) -- form.notes — resources/js/Components/BatchList.vue:151  /  Notes  /  textarea; ''  /  ; v-model="form.notes"; rows="2"  /  v-if="showForm"
- [ ] **e0047-c012** [prose, lines 868-868](../development-pack/modules/11_inventory.md#L868) -- **Read fields, columns and section headings:**
- [ ] **e0047-c013** [statement, lines 870-870](../development-pack/modules/11_inventory.md#L870) -- - h3: Batch Tracking — resources/js/Components/BatchList.vue:93
- [ ] **e0047-c014** [statement, lines 871-871](../development-pack/modules/11_inventory.md#L871) -- - th: Batch # — resources/js/Components/BatchList.vue:171 — v-if="localBatches.length &amp;gt; 0"
- [ ] **e0047-c015** [statement, lines 872-872](../development-pack/modules/11_inventory.md#L872) -- - th: Qty — resources/js/Components/BatchList.vue:172 — v-if="localBatches.length &amp;gt; 0"
- [ ] **e0047-c016** [statement, lines 873-873](../development-pack/modules/11_inventory.md#L873) -- - th: Manufactured — resources/js/Components/BatchList.vue:173 — v-if="localBatches.length &amp;gt; 0"
- [ ] **e0047-c017** [statement, lines 874-874](../development-pack/modules/11_inventory.md#L874) -- - th: Expiry — resources/js/Components/BatchList.vue:174 — v-if="localBatches.length &amp;gt; 0"
- [ ] **e0047-c018** [statement, lines 875-875](../development-pack/modules/11_inventory.md#L875) -- - th: Notes — resources/js/Components/BatchList.vue:175 — v-if="localBatches.length &amp;gt; 0"
- [ ] **e0047-c019** [prose, lines 877-877](../development-pack/modules/11_inventory.md#L877) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0047-c020** [table row, lines 879-879](../development-pack/modules/11_inventory.md#L879) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0047-c021** [table row, lines 881-881](../development-pack/modules/11_inventory.md#L881) -- showForm ? Cancel : Add Batch — resources/js/Components/BatchList.vue:96  /  @click="showForm = !showForm"  /  No ancestor condition
- [ ] **e0047-c022** [table row, lines 882-882](../development-pack/modules/11_inventory.md#L882) -- loading ? Creating... : Create Batch — resources/js/Components/BatchList.vue:157  /  @click="createBatch"; :disabled="loading \ / \ /  !form.quantity"  /  v-if="showForm"
- [ ] **e0047-c023** [prose, lines 884-884](../development-pack/modules/11_inventory.md#L884) -- **Script endpoint names:** products.batches.store. Match these to verb/path/permission in the route annex.

### e0048: Components/SerialList

Source: [exact contract](../development-pack/modules/11_inventory.md#e0048). Complete every clause below before closing this section in the ledger.

- [ ] **e0048-c001** [prose, lines 894-894](../development-pack/modules/11_inventory.md#L894) -- Product detail serial-tracking child. Filter buttons all/status counts (transferred/written_off only when present). Add fields serial_number/status/notes. Row actions mark sold/reserved/avai...
- [ ] **e0048-c002** [prose, lines 896-896](../development-pack/modules/11_inventory.md#L896) -- Source: resources/js/Components/SerialList.vue:1.
- [ ] **e0048-c003** [prose, lines 898-898](../development-pack/modules/11_inventory.md#L898) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0048-c004** [source-code reference, lines 900-917](../development-pack/modules/11_inventory.md#L900) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0048-c005** [prose, lines 919-919](../development-pack/modules/11_inventory.md#L919) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0048-c006** [table row, lines 921-921](../development-pack/modules/11_inventory.md#L921) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0048-c007** [table row, lines 923-923](../development-pack/modules/11_inventory.md#L923) -- form.serial_number — resources/js/Components/SerialList.vue:162  /  Serial Number *  /  text; ''  /  ; v-model="form.serial_number"; type="text"; required; placeholder="e.g. SN-2026-00001"  ...
- [ ] **e0048-c008** [table row, lines 924-924](../development-pack/modules/11_inventory.md#L924) -- form.status — resources/js/Components/SerialList.vue:172  /  Status  /  select; 'available'  /  ; v-model="form.status"  /  v-if="showForm"
- [ ] **e0048-c009** [table row, lines 925-925](../development-pack/modules/11_inventory.md#L925) -- form.notes — resources/js/Components/SerialList.vue:185  /  Notes  /  textarea; ''  /  ; v-model="form.notes"; rows="2"  /  v-if="showForm"
- [ ] **e0048-c010** [prose, lines 927-927](../development-pack/modules/11_inventory.md#L927) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0048-c011** [statement, lines 929-929](../development-pack/modules/11_inventory.md#L929) -- - form.status (resources/js/Components/SerialList.vue:172): &amp;lt;option value="available"&amp;gt;{{ Available }}&amp;lt;/option&amp;gt; &amp;lt;option value="sold"&amp;gt;{{ Sold }}&amp;lt;/option&amp;gt; &amp;lt;option val...
- [ ] **e0048-c012** [prose, lines 931-931](../development-pack/modules/11_inventory.md#L931) -- **Read fields, columns and section headings:**
- [ ] **e0048-c013** [statement, lines 933-933](../development-pack/modules/11_inventory.md#L933) -- - h3: Serial Number Tracking — resources/js/Components/SerialList.vue:112
- [ ] **e0048-c014** [statement, lines 934-934](../development-pack/modules/11_inventory.md#L934) -- - th: Serial # — resources/js/Components/SerialList.vue:205 — v-if="filteredSerials.length &amp;gt; 0"
- [ ] **e0048-c015** [statement, lines 935-935](../development-pack/modules/11_inventory.md#L935) -- - th: Status — resources/js/Components/SerialList.vue:206 — v-if="filteredSerials.length &amp;gt; 0"
- [ ] **e0048-c016** [statement, lines 936-936](../development-pack/modules/11_inventory.md#L936) -- - th: Notes — resources/js/Components/SerialList.vue:207 — v-if="filteredSerials.length &amp;gt; 0"
- [ ] **e0048-c017** [statement, lines 937-937](../development-pack/modules/11_inventory.md#L937) -- - th: Actions — resources/js/Components/SerialList.vue:208 — v-if="filteredSerials.length &amp;gt; 0"
- [ ] **e0048-c018** [prose, lines 939-939](../development-pack/modules/11_inventory.md#L939) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0048-c019** [table row, lines 941-941](../development-pack/modules/11_inventory.md#L941) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0048-c020** [table row, lines 943-943](../development-pack/modules/11_inventory.md#L943) -- showForm ? Cancel : Add Serial — resources/js/Components/SerialList.vue:115  /  @click="showForm = !showForm"  /  No ancestor condition
- [ ] **e0048-c021** [table row, lines 944-944](../development-pack/modules/11_inventory.md#L944) -- All ( localSerials.length ) — resources/js/Components/SerialList.vue:128  /  @click="statusFilter = 'all'"  /  v-if="localSerials.length &amp;gt; 0"
- [ ] **e0048-c022** [table row, lines 945-945](../development-pack/modules/11_inventory.md#L945) -- status === 'written_off' ? Written off : t(components.serialList.statuses.${status}) ( count ) — resources/js/Components/SerialList.vue:139  /  v-for="(count, status) in statusCounts"; :key=...
- [ ] **e0048-c023** [table row, lines 946-946](../development-pack/modules/11_inventory.md#L946) -- loading ? Creating... : Create Serial — resources/js/Components/SerialList.vue:191  /  @click="createSerial"; :disabled="loading \ / \ /  !form.serial_number"  /  v-if="showForm"
- [ ] **e0048-c024** [table row, lines 947-947](../development-pack/modules/11_inventory.md#L947) -- Sold — resources/js/Components/SerialList.vue:227  /  v-if="serial.status === 'available'"; @click="updateStatus(serial, 'sold')"; :title="t('components.serialList.markAsSold')"  /  v-if="fi...
- [ ] **e0048-c025** [table row, lines 948-948](../development-pack/modules/11_inventory.md#L948) -- Reserve — resources/js/Components/SerialList.vue:235  /  v-if="serial.status === 'available'"; @click="updateStatus(serial, 'reserved')"; :title="t('components.serialList.markAsReserved')"  ...
- [ ] **e0048-c026** [table row, lines 949-949](../development-pack/modules/11_inventory.md#L949) -- Damaged — resources/js/Components/SerialList.vue:243  /  v-if="serial.status !== 'damaged'"; @click="updateStatus(serial, 'damaged')"; :title="t('components.serialList.markAsDamaged')"  /  v...
- [ ] **e0048-c027** [table row, lines 950-950](../development-pack/modules/11_inventory.md#L950) -- Available — resources/js/Components/SerialList.vue:251  /  v-if="serial.status !== 'available'"; @click="updateStatus(serial, 'available')"; :title="t('components.serialList.markAsAvailable'...
- [ ] **e0048-c028** [prose, lines 952-952](../development-pack/modules/11_inventory.md#L952) -- **Script endpoint names:** products.serials.store, products.serials.update. Match these to verb/path/permission in the route annex.

### e0049: Components/ProductVariantManager

Source: [exact contract](../development-pack/modules/11_inventory.md#e0049). Complete every clause below before closing this section in the ledger.

- [ ] **e0049-c001** [prose, lines 962-962](../development-pack/modules/11_inventory.md#L962) -- Child options editor: option name and comma-separated values, add value by Enter, remove option/value, generate combinations. Grid variant title/SKU/price/stock/active. New variant defaults ...
- [ ] **e0049-c002** [prose, lines 964-964](../development-pack/modules/11_inventory.md#L964) -- Source: resources/js/Components/ProductVariantManager.vue:1.
- [ ] **e0049-c003** [prose, lines 966-966](../development-pack/modules/11_inventory.md#L966) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0049-c004** [source-code reference, lines 968-981](../development-pack/modules/11_inventory.md#L968) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0049-c005** [prose, lines 983-983](../development-pack/modules/11_inventory.md#L983) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0049-c006** [table row, lines 985-985](../development-pack/modules/11_inventory.md#L985) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0049-c007** [table row, lines 987-987](../development-pack/modules/11_inventory.md#L987) -- (unbound) — resources/js/Components/ProductVariantManager.vue:265  /  No explicit label / see context  /  text; See :value / :checked and event handler; not a v-model field  /  type="text"; ...
- [ ] **e0049-c008** [table row, lines 988-988](../development-pack/modules/11_inventory.md#L988) -- newOptionName — resources/js/Components/ProductVariantManager.vue:283  /  Option Name  /  text; ''  /  ; v-model="newOptionName"; type="text"; :placeholder="t('components.variantManager.opti...
- [ ] **e0049-c009** [table row, lines 989-989](../development-pack/modules/11_inventory.md#L989) -- newOptionValues — resources/js/Components/ProductVariantManager.vue:295  /  Option Values (comma-separated)  /  text; ''  /  ; v-model="newOptionValues"; type="text"; :placeholder="t('compon...
- [ ] **e0049-c010** [table row, lines 990-990](../development-pack/modules/11_inventory.md#L990) -- (unbound) — resources/js/Components/ProductVariantManager.vue:384  /  No explicit label / see context  /  text; See :value / :checked and event handler; not a v-model field  /  :value="varia...
- [ ] **e0049-c011** [table row, lines 991-991](../development-pack/modules/11_inventory.md#L991) -- (unbound) — resources/js/Components/ProductVariantManager.vue:398  /  No explicit label / see context  /  number; See :value / :checked and event handler; not a v-model field  /  :value="var...
- [ ] **e0049-c012** [table row, lines 992-992](../development-pack/modules/11_inventory.md#L992) -- (unbound) — resources/js/Components/ProductVariantManager.vue:410  /  No explicit label / see context  /  number; See :value / :checked and event handler; not a v-model field  /  :value="var...
- [ ] **e0049-c013** [table row, lines 993-993](../development-pack/modules/11_inventory.md#L993) -- (unbound) — resources/js/Components/ProductVariantManager.vue:423  /    /  checkbox; See :value / :checked and event handler; not a v-model field  /  type="checkbox"; :checked="variant.is_ac...
- [ ] **e0049-c014** [prose, lines 995-995](../development-pack/modules/11_inventory.md#L995) -- **Read fields, columns and section headings:**
- [ ] **e0049-c015** [statement, lines 997-997](../development-pack/modules/11_inventory.md#L997) -- - h4: Product Options — resources/js/Components/ProductVariantManager.vue:216
- [ ] **e0049-c016** [statement, lines 998-998](../development-pack/modules/11_inventory.md#L998) -- - h4: Variants ( variants.length ) — resources/js/Components/ProductVariantManager.vue:349 — v-if="hasOptions &amp;&amp; !exceedsVariantLimit"
- [ ] **e0049-c017** [statement, lines 999-999](../development-pack/modules/11_inventory.md#L999) -- - th: Variant — resources/js/Components/ProductVariantManager.vue:359 — v-if="hasOptions &amp;&amp; !exceedsVariantLimit"
- [ ] **e0049-c018** [statement, lines 1000-1000](../development-pack/modules/11_inventory.md#L1000) -- - th: SKU — resources/js/Components/ProductVariantManager.vue:362 — v-if="hasOptions &amp;&amp; !exceedsVariantLimit"
- [ ] **e0049-c019** [statement, lines 1001-1001](../development-pack/modules/11_inventory.md#L1001) -- - th: Price — resources/js/Components/ProductVariantManager.vue:365 — v-if="hasOptions &amp;&amp; !exceedsVariantLimit"
- [ ] **e0049-c020** [statement, lines 1002-1002](../development-pack/modules/11_inventory.md#L1002) -- - th: Stock — resources/js/Components/ProductVariantManager.vue:368 — v-if="hasOptions &amp;&amp; !exceedsVariantLimit"
- [ ] **e0049-c021** [statement, lines 1003-1003](../development-pack/modules/11_inventory.md#L1003) -- - th: Active — resources/js/Components/ProductVariantManager.vue:371 — v-if="hasOptions &amp;&amp; !exceedsVariantLimit"
- [ ] **e0049-c022** [prose, lines 1005-1005](../development-pack/modules/11_inventory.md#L1005) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0049-c023** [table row, lines 1007-1007](../development-pack/modules/11_inventory.md#L1007) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0049-c024** [table row, lines 1009-1009](../development-pack/modules/11_inventory.md#L1009) -- (icon-only; accessible label/title in attributes) — resources/js/Components/ProductVariantManager.vue:233  /  type="button"; @click="removeOption(optIndex)"; :disabled="disabled"  /  v-if="o...
- [ ] **e0049-c025** [table row, lines 1010-1010](../development-pack/modules/11_inventory.md#L1010) -- (icon-only; accessible label/title in attributes) — resources/js/Components/ProductVariantManager.vue:252  /  type="button"; @click="removeValueFromOption(optIndex, valIndex)"; :disabled="di...
- [ ] **e0049-c026** [table row, lines 1011-1011](../development-pack/modules/11_inventory.md#L1011) -- Add Option — resources/js/Components/ProductVariantManager.vue:304  /  type="button"; @click="addOption"; :disabled="disabled \ / \ /  !newOptionName \ / \ /  !newOptionValues"  /  v-if="sho...
- [ ] **e0049-c027** [table row, lines 1012-1012](../development-pack/modules/11_inventory.md#L1012) -- Cancel — resources/js/Components/ProductVariantManager.vue:312  /  type="button"; @click="showAddOption = false; newOptionName = ''; newOptionValues = ''"  /  v-if="showAddOption &amp;&amp; canAddOp...
- [ ] **e0049-c028** [table row, lines 1013-1013](../development-pack/modules/11_inventory.md#L1013) -- Add Option (e.g., Size, Color) — resources/js/Components/ProductVariantManager.vue:324  /  v-if="!showAddOption &amp;&amp; canAddOption"; type="button"; @click="showAddOption = true"; :disabled="dis...
- [ ] **e0049-c029** [table row, lines 1014-1014](../development-pack/modules/11_inventory.md#L1014) -- Enable All — resources/js/Components/ProductVariantManager.vue:440  /  type="button"; @click="bulkUpdateVariants('is_active', true)"; :disabled="disabled"  /  v-if="hasOptions &amp;&amp; !exceedsVar...
- [ ] **e0049-c030** [table row, lines 1015-1015](../development-pack/modules/11_inventory.md#L1015) -- Disable All — resources/js/Components/ProductVariantManager.vue:448  /  type="button"; @click="bulkUpdateVariants('is_active', false)"; :disabled="disabled"  /  v-if="hasOptions &amp;&amp; !exceedsV...

### e0052: Components/SKUGeneratorModal

Source: [exact contract](../development-pack/modules/11_inventory.md#e0052). Complete every clause below before closing this section in the ledger.

- [ ] **e0052-c001** [prose, lines 1025-1025](../development-pack/modules/11_inventory.md#L1025) -- QuickAddModal with preset selection buttons, customPattern input, variables/pattern preview, generate/apply/close. customPattern and selectedPattern mutually clear. API payload pattern/produ...
- [ ] **e0052-c002** [prose, lines 1027-1027](../development-pack/modules/11_inventory.md#L1027) -- Source: resources/js/Components/SKUGeneratorModal.vue:1.
- [ ] **e0052-c003** [prose, lines 1029-1029](../development-pack/modules/11_inventory.md#L1029) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0052-c004** [source-code reference, lines 1031-1044](../development-pack/modules/11_inventory.md#L1031) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0052-c005** [prose, lines 1046-1046](../development-pack/modules/11_inventory.md#L1046) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0052-c006** [table row, lines 1048-1048](../development-pack/modules/11_inventory.md#L1048) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0052-c007** [table row, lines 1050-1050](../development-pack/modules/11_inventory.md#L1050) -- customPattern — resources/js/Components/SKUGeneratorModal.vue:151  /  Custom Pattern  /  text; ''  /  ; v-model="customPattern"; @input="onCustomPatternInput"; type="text"; :placeholder="t('...
- [ ] **e0052-c008** [prose, lines 1052-1052](../development-pack/modules/11_inventory.md#L1052) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0052-c009** [table row, lines 1054-1054](../development-pack/modules/11_inventory.md#L1054) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0052-c010** [table row, lines 1056-1056](../development-pack/modules/11_inventory.md#L1056) -- preset.name preset.example — resources/js/Components/SKUGeneratorModal.vue:119  /  v-for="preset in skuPatterns.presets"; :key="preset.pattern"; type="button"; @click="selectPreset(preset)" ...
- [ ] **e0052-c011** [table row, lines 1057-1057](../development-pack/modules/11_inventory.md#L1057) -- Cancel — resources/js/Components/SKUGeneratorModal.vue:183  /  type="button"; @click="close"  /  No ancestor condition
- [ ] **e0052-c012** [table row, lines 1058-1058](../development-pack/modules/11_inventory.md#L1058) -- Apply SKU — resources/js/Components/SKUGeneratorModal.vue:190  /  type="button"; @click="applySKU"; :disabled="!skuPreview \ / \ /  skuPreview === t('components.skuGenerator.previewError')" ...
- [ ] **e0052-c013** [prose, lines 1060-1060](../development-pack/modules/11_inventory.md#L1060) -- **Script endpoint names:** sku.patterns, sku.generate. Match these to verb/path/permission in the route annex.

### e0055: Components/VariantsTable

Source: [exact contract](../development-pack/modules/11_inventory.md#e0055). Complete every clause below before closing this section in the ledger.

- [ ] **e0055-c001** [prose, lines 1070-1070](../development-pack/modules/11_inventory.md#L1070) -- Read-only variant title/barcode/SKU/effective price/status with optional per-variant adjustment child; availability prop adds reserved/available. Summary counts variants and total stock. Par...
- [ ] **e0055-c002** [prose, lines 1072-1072](../development-pack/modules/11_inventory.md#L1072) -- Source: resources/js/Components/VariantsTable.vue:1.
- [ ] **e0055-c003** [prose, lines 1074-1074](../development-pack/modules/11_inventory.md#L1074) -- **Input fields:** none in this page/component template.
- [ ] **e0055-c004** [prose, lines 1077-1077](../development-pack/modules/11_inventory.md#L1077) -- **Read fields, columns and section headings:**
- [ ] **e0055-c005** [statement, lines 1079-1079](../development-pack/modules/11_inventory.md#L1079) -- - th: Variant — resources/js/Components/VariantsTable.vue:70
- [ ] **e0055-c006** [statement, lines 1080-1080](../development-pack/modules/11_inventory.md#L1080) -- - th: SKU — resources/js/Components/VariantsTable.vue:73
- [ ] **e0055-c007** [statement, lines 1081-1081](../development-pack/modules/11_inventory.md#L1081) -- - th: Price — resources/js/Components/VariantsTable.vue:76
- [ ] **e0055-c008** [statement, lines 1082-1082](../development-pack/modules/11_inventory.md#L1082) -- - th: Stock — resources/js/Components/VariantsTable.vue:79
- [ ] **e0055-c009** [statement, lines 1083-1083](../development-pack/modules/11_inventory.md#L1083) -- - th: Reserved — resources/js/Components/VariantsTable.vue:82
- [ ] **e0055-c010** [statement, lines 1084-1084](../development-pack/modules/11_inventory.md#L1084) -- - th: Available — resources/js/Components/VariantsTable.vue:85
- [ ] **e0055-c011** [statement, lines 1085-1085](../development-pack/modules/11_inventory.md#L1085) -- - th: Status — resources/js/Components/VariantsTable.vue:88

### e0056: Components/BarcodeScanner

Source: [exact contract](../development-pack/modules/11_inventory.md#e0056). Complete every clause below before closing this section in the ledger.

- [ ] **e0056-c001** [prose, lines 1095-1095](../development-pack/modules/11_inventory.md#L1095) -- Camera engine only, no application form fields. Lazy html5-qrcode load; rear camera, fps 10, scan debounce 1500ms, enable/disable watcher, stop/clear on unmount; emits started/stopped/scan/e...
- [ ] **e0056-c002** [prose, lines 1097-1097](../development-pack/modules/11_inventory.md#L1097) -- Source: resources/js/Components/BarcodeScanner.vue:1.
- [ ] **e0056-c003** [prose, lines 1099-1099](../development-pack/modules/11_inventory.md#L1099) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0056-c004** [source-code reference, lines 1101-1108](../development-pack/modules/11_inventory.md#L1101) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0056-c005** [prose, lines 1110-1110](../development-pack/modules/11_inventory.md#L1110) -- **Input fields:** none in this page/component template.

### e0059: Product/StoreProductRequest.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0059). Complete every clause below before closing this section in the ledger.

- [ ] **e0059-c001** [prose, lines 1121-1121](../development-pack/modules/11_inventory.md#L1121) -- Source app/Http/Requests/Product/StoreProductRequest.php:1
- [ ] **e0059-c002** [source-code reference, lines 1123-1201](../development-pack/modules/11_inventory.md#L1123) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0060: Product/UpdateProductRequest.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0060). Complete every clause below before closing this section in the ledger.

- [ ] **e0060-c001** [prose, lines 1211-1211](../development-pack/modules/11_inventory.md#L1211) -- Source app/Http/Requests/Product/UpdateProductRequest.php:1
- [ ] **e0060-c002** [source-code reference, lines 1213-1295](../development-pack/modules/11_inventory.md#L1213) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0076: BatchTrackingController.php — 38-79

Source: [exact contract](../development-pack/modules/11_inventory.md#e0076). Complete every clause below before closing this section in the ledger.

- [ ] **e0076-c001** [prose, lines 1305-1305](../development-pack/modules/11_inventory.md#L1305) -- Source app/Http/Controllers/Api/BatchTrackingController.php:38
- [ ] **e0076-c002** [source-code reference, lines 1307-1350](../development-pack/modules/11_inventory.md#L1307) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0077: SerialTrackingController.php — 47-87

Source: [exact contract](../development-pack/modules/11_inventory.md#e0077). Complete every clause below before closing this section in the ledger.

- [ ] **e0077-c001** [prose, lines 1360-1360](../development-pack/modules/11_inventory.md#L1360) -- Source app/Http/Controllers/Api/SerialTrackingController.php:47
- [ ] **e0077-c002** [source-code reference, lines 1362-1404](../development-pack/modules/11_inventory.md#L1362) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0078: SerialTrackingController.php — 117-202

Source: [exact contract](../development-pack/modules/11_inventory.md#e0078). Complete every clause below before closing this section in the ledger.

- [ ] **e0078-c001** [prose, lines 1414-1414](../development-pack/modules/11_inventory.md#L1414) -- Source app/Http/Controllers/Api/SerialTrackingController.php:117
- [ ] **e0078-c002** [source-code reference, lines 1416-1495](../development-pack/modules/11_inventory.md#L1416) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0079: ProductVariantController.php — 187-248

Source: [exact contract](../development-pack/modules/11_inventory.md#e0079). Complete every clause below before closing this section in the ledger.

- [ ] **e0079-c001** [prose, lines 1505-1505](../development-pack/modules/11_inventory.md#L1505) -- Source app/Http/Controllers/Api/ProductVariantController.php:187
- [ ] **e0079-c002** [source-code reference, lines 1507-1570](../development-pack/modules/11_inventory.md#L1507) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0080: InventoryResetController.php — 19-58

Source: [exact contract](../development-pack/modules/11_inventory.md#e0080). Complete every clause below before closing this section in the ledger.

- [ ] **e0080-c001** [prose, lines 1580-1580](../development-pack/modules/11_inventory.md#L1580) -- Source app/Http/Controllers/Inventory/InventoryResetController.php:19
- [ ] **e0080-c002** [source-code reference, lines 1582-1623](../development-pack/modules/11_inventory.md#L1582) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0082: BulkProductController.php — 29-140

Source: [exact contract](../development-pack/modules/11_inventory.md#e0082). Complete every clause below before closing this section in the ledger.

- [ ] **e0082-c001** [prose, lines 1633-1633](../development-pack/modules/11_inventory.md#L1633) -- Source app/Http/Controllers/Inventory/BulkProductController.php:29
- [ ] **e0082-c002** [source-code reference, lines 1635-1748](../development-pack/modules/11_inventory.md#L1635) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0083: SKUController.php — 1

Source: [exact contract](../development-pack/modules/11_inventory.md#e0083). Complete every clause below before closing this section in the ledger.

- [ ] **e0083-c001** [prose, lines 1758-1758](../development-pack/modules/11_inventory.md#L1758) -- Source app/Http/Controllers/Inventory/SKUController.php:1
- [ ] **e0083-c002** [source-code reference, lines 1760-1858](../development-pack/modules/11_inventory.md#L1760) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0094: Product

Source: [exact contract](../development-pack/modules/11_inventory.md#e0094). Complete every clause below before closing this section in the ledger.

- [ ] **e0094-c001** [prose, lines 1867-1867](../development-pack/modules/11_inventory.md#L1867) -- app/Models/Inventory/Product.php:1
- [ ] **e0094-c002** [source-code reference, lines 1869-1940](../development-pack/modules/11_inventory.md#L1869) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0097: ProductOption

Source: [exact contract](../development-pack/modules/11_inventory.md#e0097). Complete every clause below before closing this section in the ledger.

- [ ] **e0097-c001** [prose, lines 1949-1949](../development-pack/modules/11_inventory.md#L1949) -- app/Models/Inventory/ProductOption.php:1
- [ ] **e0097-c002** [source-code reference, lines 1951-1966](../development-pack/modules/11_inventory.md#L1951) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0098: ProductVariant

Source: [exact contract](../development-pack/modules/11_inventory.md#e0098). Complete every clause below before closing this section in the ledger.

- [ ] **e0098-c001** [prose, lines 1975-1975](../development-pack/modules/11_inventory.md#L1975) -- app/Models/Inventory/ProductVariant.php:1
- [ ] **e0098-c002** [source-code reference, lines 1977-2021](../development-pack/modules/11_inventory.md#L1977) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0102: ProductBatch

Source: [exact contract](../development-pack/modules/11_inventory.md#e0102). Complete every clause below before closing this section in the ledger.

- [ ] **e0102-c001** [prose, lines 2030-2030](../development-pack/modules/11_inventory.md#L2030) -- app/Models/Inventory/ProductBatch.php:1
- [ ] **e0102-c002** [source-code reference, lines 2032-2053](../development-pack/modules/11_inventory.md#L2032) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0103: ProductSerial

Source: [exact contract](../development-pack/modules/11_inventory.md#e0103). Complete every clause below before closing this section in the ledger.

- [ ] **e0103-c001** [prose, lines 2062-2062](../development-pack/modules/11_inventory.md#L2062) -- app/Models/Inventory/ProductSerial.php:1
- [ ] **e0103-c002** [source-code reference, lines 2064-2089](../development-pack/modules/11_inventory.md#L2064) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0115: InventoryResetRun

Source: [exact contract](../development-pack/modules/11_inventory.md#e0115). Complete every clause below before closing this section in the ledger.

- [ ] **e0115-c001** [prose, lines 2098-2098](../development-pack/modules/11_inventory.md#L2098) -- app/Models/Inventory/InventoryResetRun.php:1
- [ ] **e0115-c002** [source-code reference, lines 2100-2105](../development-pack/modules/11_inventory.md#L2100) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0117: 2025_10_12_034201_create_products_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0117). Complete every clause below before closing this section in the ledger.

- [ ] **e0117-c001** [prose, lines 2114-2114](../development-pack/modules/11_inventory.md#L2114) -- database/migrations/2025_10_12_034201_create_products_table.php:1
- [ ] **e0117-c002** [source-code reference, lines 2116-2141](../development-pack/modules/11_inventory.md#L2116) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0120: 2025_10_13_015319_add_currency_support_to_products_and_organizations.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0120). Complete every clause below before closing this section in the ledger.

- [ ] **e0120-c001** [prose, lines 2150-2150](../development-pack/modules/11_inventory.md#L2150) -- database/migrations/2025_10_13_015319_add_currency_support_to_products_and_organizations.php:1
- [ ] **e0120-c002** [source-code reference, lines 2152-2158](../development-pack/modules/11_inventory.md#L2152) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0121: 2025_10_13_020934_add_notes_to_products_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0121). Complete every clause below before closing this section in the ledger.

- [ ] **e0121-c001** [prose, lines 2167-2167](../development-pack/modules/11_inventory.md#L2167) -- database/migrations/2025_10_13_020934_add_notes_to_products_table.php:1
- [ ] **e0121-c002** [source-code reference, lines 2169-2174](../development-pack/modules/11_inventory.md#L2169) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0122: 2025_10_13_023000_add_purchase_price_to_products_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0122). Complete every clause below before closing this section in the ledger.

- [ ] **e0122-c001** [prose, lines 2183-2183](../development-pack/modules/11_inventory.md#L2183) -- database/migrations/2025_10_13_023000_add_purchase_price_to_products_table.php:1
- [ ] **e0122-c002** [source-code reference, lines 2185-2192](../development-pack/modules/11_inventory.md#L2185) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0124: 2025_10_13_213806_add_images_to_products_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0124). Complete every clause below before closing this section in the ledger.

- [ ] **e0124-c001** [prose, lines 2201-2201](../development-pack/modules/11_inventory.md#L2201) -- database/migrations/2025_10_13_213806_add_images_to_products_table.php:1
- [ ] **e0124-c002** [source-code reference, lines 2203-2209](../development-pack/modules/11_inventory.md#L2203) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0125: 2025_12_28_000001_create_product_options_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0125). Complete every clause below before closing this section in the ledger.

- [ ] **e0125-c001** [prose, lines 2218-2218](../development-pack/modules/11_inventory.md#L2218) -- database/migrations/2025_12_28_000001_create_product_options_table.php:1
- [ ] **e0125-c002** [source-code reference, lines 2220-2230](../development-pack/modules/11_inventory.md#L2220) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0126: 2025_12_28_000002_create_product_variants_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0126). Complete every clause below before closing this section in the ledger.

- [ ] **e0126-c001** [prose, lines 2239-2239](../development-pack/modules/11_inventory.md#L2239) -- database/migrations/2025_12_28_000002_create_product_variants_table.php:1
- [ ] **e0126-c002** [source-code reference, lines 2241-2268](../development-pack/modules/11_inventory.md#L2241) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0127: 2025_12_28_000003_add_has_variants_to_products_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0127). Complete every clause below before closing this section in the ledger.

- [ ] **e0127-c001** [prose, lines 2277-2277](../development-pack/modules/11_inventory.md#L2277) -- database/migrations/2025_12_28_000003_add_has_variants_to_products_table.php:1
- [ ] **e0127-c002** [source-code reference, lines 2279-2284](../development-pack/modules/11_inventory.md#L2279) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0130: 2026_03_12_000001_add_tracking_type_to_products_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0130). Complete every clause below before closing this section in the ledger.

- [ ] **e0130-c001** [prose, lines 2293-2293](../development-pack/modules/11_inventory.md#L2293) -- database/migrations/2026_03_12_000001_add_tracking_type_to_products_table.php:1
- [ ] **e0130-c002** [source-code reference, lines 2295-2300](../development-pack/modules/11_inventory.md#L2295) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0131: 2026_03_12_000002_create_product_batches_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0131). Complete every clause below before closing this section in the ledger.

- [ ] **e0131-c001** [prose, lines 2309-2309](../development-pack/modules/11_inventory.md#L2309) -- database/migrations/2026_03_12_000002_create_product_batches_table.php:1
- [ ] **e0131-c002** [source-code reference, lines 2311-2324](../development-pack/modules/11_inventory.md#L2311) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0132: 2026_03_12_000003_create_product_serials_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0132). Complete every clause below before closing this section in the ledger.

- [ ] **e0132-c001** [prose, lines 2333-2333](../development-pack/modules/11_inventory.md#L2333) -- database/migrations/2026_03_12_000003_create_product_serials_table.php:1
- [ ] **e0132-c002** [source-code reference, lines 2335-2347](../development-pack/modules/11_inventory.md#L2335) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0140: 2026_07_25_000002_add_order_item_id_to_product_serials.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0140). Complete every clause below before closing this section in the ledger.

- [ ] **e0140-c001** [prose, lines 2356-2356](../development-pack/modules/11_inventory.md#L2356) -- database/migrations/2026_07_25_000002_add_order_item_id_to_product_serials.php:1
- [ ] **e0140-c002** [source-code reference, lines 2358-2364](../development-pack/modules/11_inventory.md#L2358) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0143: 2026_09_27_000002_add_barcode_type_to_products_table.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0143). Complete every clause below before closing this section in the ledger.

- [ ] **e0143-c001** [prose, lines 2373-2373](../development-pack/modules/11_inventory.md#L2373) -- database/migrations/2026_09_27_000002_add_barcode_type_to_products_table.php:1
- [ ] **e0143-c002** [source-code reference, lines 2375-2380](../development-pack/modules/11_inventory.md#L2375) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0155: 2026_10_24_000001_index_batch_expiry_by_organization.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0155). Complete every clause below before closing this section in the ledger.

- [ ] **e0155-c001** [prose, lines 2389-2389](../development-pack/modules/11_inventory.md#L2389) -- database/migrations/2026_10_24_000001_index_batch_expiry_by_organization.php:1
- [ ] **e0155-c002** [source-code reference, lines 2391-2396](../development-pack/modules/11_inventory.md#L2391) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0156: 2026_10_26_000001_create_inventory_reset_runs.php

Source: [exact contract](../development-pack/modules/11_inventory.md#e0156). Complete every clause below before closing this section in the ledger.

- [ ] **e0156-c001** [prose, lines 2405-2405](../development-pack/modules/11_inventory.md#L2405) -- database/migrations/2026_10_26_000001_create_inventory_reset_runs.php:1
- [ ] **e0156-c002** [source-code reference, lines 2407-2422](../development-pack/modules/11_inventory.md#L2407) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0476: `app/Http/Requests/Api/Product/StoreProductRequest.php`

Source: [exact contract](../development-pack/modules/11_inventory.md#e0476). Complete every clause below before closing this section in the ledger.

- [ ] **e0476-c001** [prose, lines 2432-2432](../development-pack/modules/11_inventory.md#L2432) -- Source evidence. SHA-256: 14c27022f640f9bec84aea019ffb1e61779baa5351779ec0b2e9e040e7e40192.
- [ ] **e0476-c002** [source-code reference, lines 2434-2504](../development-pack/modules/11_inventory.md#L2434) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0477: `app/Http/Requests/Api/Product/UpdateProductRequest.php`

Source: [exact contract](../development-pack/modules/11_inventory.md#e0477). Complete every clause below before closing this section in the ledger.

- [ ] **e0477-c001** [prose, lines 2514-2514](../development-pack/modules/11_inventory.md#L2514) -- Source evidence. SHA-256: 9e6d92fce3ba319cbd82ce9f2e4e5d8cdbf80a520d46ccd1868177f067273804.
- [ ] **e0477-c002** [source-code reference, lines 2516-2611](../development-pack/modules/11_inventory.md#L2516) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0480: `app/Http/Requests/Api/ProductComponent/StoreProductComponentRequest.php`

Source: [exact contract](../development-pack/modules/11_inventory.md#e0480). Complete every clause below before closing this section in the ledger.

- [ ] **e0480-c001** [prose, lines 2621-2621](../development-pack/modules/11_inventory.md#L2621) -- Source evidence. SHA-256: 7727313d7049d647a2a3d97d6cdb3abd3ad2b95229f1434ffca833747eb6e263.
- [ ] **e0480-c002** [source-code reference, lines 2623-2682](../development-pack/modules/11_inventory.md#L2623) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0481: `app/Http/Requests/Api/ProductComponent/UpdateProductComponentRequest.php`

Source: [exact contract](../development-pack/modules/11_inventory.md#e0481). Complete every clause below before closing this section in the ledger.

- [ ] **e0481-c001** [prose, lines 2692-2692](../development-pack/modules/11_inventory.md#L2692) -- Source evidence. SHA-256: c76f08627d4fd52a64695b5008685655f50b8be0d4736087d4fa78beba7ae98b.
- [ ] **e0481-c002** [source-code reference, lines 2694-2720](../development-pack/modules/11_inventory.md#L2694) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0484: `app/Http/Requests/Api/ProductOption/StoreProductOptionRequest.php`

Source: [exact contract](../development-pack/modules/11_inventory.md#e0484). Complete every clause below before closing this section in the ledger.

- [ ] **e0484-c001** [prose, lines 2730-2730](../development-pack/modules/11_inventory.md#L2730) -- Source evidence. SHA-256: ddc7bc25aa8a0e19f0f94d56a96c1e757ea2f7f3a0acf6f238e0e447d7a393e7.
- [ ] **e0484-c002** [source-code reference, lines 2732-2760](../development-pack/modules/11_inventory.md#L2732) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0485: `app/Http/Requests/Api/ProductOption/UpdateProductOptionRequest.php`

Source: [exact contract](../development-pack/modules/11_inventory.md#e0485). Complete every clause below before closing this section in the ledger.

- [ ] **e0485-c001** [prose, lines 2770-2770](../development-pack/modules/11_inventory.md#L2770) -- Source evidence. SHA-256: 67a733bc704f0686bf9bdf52f28eddf8875a602dfc1eb3656c112deea388c4cb.
- [ ] **e0485-c002** [source-code reference, lines 2772-2800](../development-pack/modules/11_inventory.md#L2772) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0486: `app/Http/Requests/Api/ProductVariant/StoreProductVariantRequest.php`

Source: [exact contract](../development-pack/modules/11_inventory.md#e0486). Complete every clause below before closing this section in the ledger.

- [ ] **e0486-c001** [prose, lines 2810-2810](../development-pack/modules/11_inventory.md#L2810) -- Source evidence. SHA-256: e236868bd1f0092fe249174c50bd1b6b74bc2f13b13a45b56d39757d3032d070.
- [ ] **e0486-c002** [source-code reference, lines 2812-2852](../development-pack/modules/11_inventory.md#L2812) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0487: `app/Http/Requests/Api/ProductVariant/UpdateProductVariantRequest.php`

Source: [exact contract](../development-pack/modules/11_inventory.md#e0487). Complete every clause below before closing this section in the ledger.

- [ ] **e0487-c001** [prose, lines 2862-2862](../development-pack/modules/11_inventory.md#L2862) -- Source evidence. SHA-256: 3e9f482e18572889ff0f40e21101adec1f478dc3757b2b1e149279765c4d07c3.
- [ ] **e0487-c002** [source-code reference, lines 2864-2916](../development-pack/modules/11_inventory.md#L2864) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/12_orders.md

### e0166: Sales orders: exact source behavior

Source: [exact contract](../development-pack/modules/12_orders.md#e0166). Complete every clause below before closing this section in the ledger.

- [ ] **e0166-c001** [statement, lines 108-108](../development-pack/modules/12_orders.md#L108) -- 1. Choose saved customer with CustomerPicker or type a one-off name/email/address. Saved selection sets customer_id, fills values; clearing unlinks only, retaining editable details. Create c...
- [ ] **e0166-c002** [statement, lines 109-109](../development-pack/modules/12_orders.md#L109) -- 2. Add product and variant (required when product uses variants). Create picker offers active variants with stock; scanner reconciles against form product data. Duplicate product+variant mer...
- [ ] **e0166-c003** [statement, lines 110-110](../development-pack/modules/12_orders.md#L110) -- 3. items&#91;&#93; requires &gt;=1 row. Quantity integer &gt;=1; price decimal&lt;=2 places &gt;=0. Item identity, product/variant relationship and stock are server checked. Create order status defaults pending...
- [ ] **e0166-c004** [statement, lines 111-111](../development-pack/modules/12_orders.md#L111) -- 4. Order and line discounts each have type none/percent/fixed and value. None clears value; percent UI max100; fixed discounts cannot make line/order negative. Server computes exact-money to...
- [ ] **e0166-c005** [statement, lines 112-112](../development-pack/modules/12_orders.md#L112) -- 5. **Ordinary order creation immediately deducts stock, including pending-approval orders. Shipment does not deduct the same stock again.** Do not silently implement reserve-on-order/deduct-...
- [ ] **e0166-c006** [statement, lines 113-113](../development-pack/modules/12_orders.md#L113) -- 6. Approval-dependent create/edit must block shipped/delivered while awaiting approval. Order cancellation/rejection restores only stock actually consumed and still eligible for release, und...
- [ ] **e0166-c007** [statement, lines 114-114](../development-pack/modules/12_orders.md#L114) -- 7. Source order status, approval status, payment status and shipment status are independent dimensions. Never collapse them into one field. Order edit does not offer a currency field; backen...
- [ ] **e0166-c008** [prose, lines 116-116](../development-pack/modules/12_orders.md#L116) -- Evidence: Order creation, creation transaction, stock movement, cancel, reject, replace items.

### e0167: Payment/refund/void and invoice subflows

Source: [exact contract](../development-pack/modules/12_orders.md#e0167). Complete every clause below before closing this section in the ledger.

- [ ] **e0167-c001** [statement, lines 126-126](../development-pack/modules/12_orders.md#L126) -- - Record payment modal: type=payment (refund action sets refund); amount defaults balance due, refund amount defaults currently paid; method defaults card, choices cash/card/bank_transfer/ch...
- [ ] **e0167-c002** [statement, lines 127-127](../development-pack/modules/12_orders.md#L127) -- - record_payments required; backend order lock recalculates balance. Overpayment rejected unless explicitly allowed; cancelled order refuses new receipts but can refund. Refund capped by net...
- [ ] **e0167-c003** [statement, lines 128-128](../development-pack/modules/12_orders.md#L128) -- - Void uses reason optional string max255. Existing payment row is retained with void actor/time/reason. Cannot void a receipt if that leaves refunds greater than receipts; void refunds firs...
- [ ] **e0167-c004** [statement, lines 129-129](../development-pack/modules/12_orders.md#L129) -- - Legacy bulk “Mark older orders as paid” has before required Y-m-d default configured cutoff or today, separate permission/action and confirmation. Do not ship accidental historical mass mu...
- [ ] **e0167-c005** [statement, lines 130-130](../development-pack/modules/12_orders.md#L130) -- - Invoice preview/download, email, queued/sent/issued metadata are separate. SendDocument fields to defaults customer/supplier email, cc blank, message blank. Modal requires recipient email,...
- [ ] **e0167-c006** [prose, lines 132-132](../development-pack/modules/12_orders.md#L132) -- Evidence: Payment invariants, payment request, email rules, recipient limits.

### e0184: resources/js/Pages/Orders/Create.vue

Source: [exact contract](../development-pack/modules/12_orders.md#e0184). Complete every clause below before closing this section in the ledger.

- [ ] **e0184-c001** [prose, lines 142-142](../development-pack/modules/12_orders.md#L142) -- Source: resources/js/Pages/Orders/Create.vue:1.
- [ ] **e0184-c002** [prose, lines 145-145](../development-pack/modules/12_orders.md#L145) -- **Named routes referenced:** orders.index, orders.store.
- [ ] **e0184-c003** [prose, lines 148-148](../development-pack/modules/12_orders.md#L148) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0184-c004** [prose, lines 151-151](../development-pack/modules/12_orders.md#L151) -- **Sections / displayed fields / table columns:**
- [ ] **e0184-c005** [statement, lines 153-153](../development-pack/modules/12_orders.md#L153) -- - h3: Customer Information (L291)
- [ ] **e0184-c006** [statement, lines 154-154](../development-pack/modules/12_orders.md#L154) -- - h3: Order Items (L316)
- [ ] **e0184-c007** [statement, lines 155-155](../development-pack/modules/12_orders.md#L155) -- - h3: Order Details (L423)
- [ ] **e0184-c008** [statement, lines 156-156](../development-pack/modules/12_orders.md#L156) -- - h3: Order Summary (L459)
- [ ] **e0184-c009** [prose, lines 159-159](../development-pack/modules/12_orders.md#L159) -- **UI state/filter defaults:**
- [ ] **e0184-c010** [source-code reference, lines 161-170](../development-pack/modules/12_orders.md#L161) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0184-c011** [table row, lines 173-173](../development-pack/modules/12_orders.md#L173) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0184-c012** [table row, lines 176-176](../development-pack/modules/12_orders.md#L176) -- form.customer_name  /  Customer Name *  /  input / text  /  HTML required  /  —  /  resources/js/Pages/Orders/Create.vue:297
- [ ] **e0184-c013** [table row, lines 178-178](../development-pack/modules/12_orders.md#L178) -- form.customer_email  /  Customer Email  /  input / email  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Create.vue:302
- [ ] **e0184-c014** [table row, lines 180-180](../development-pack/modules/12_orders.md#L180) -- form.customer_address  /  Shipping Address  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Create.vue:307
- [ ] **e0184-c015** [table row, lines 182-182](../development-pack/modules/12_orders.md#L182) -- selectedProduct  /  Select Product  /  select  /  @change=onProductChange  /  null: Choose a product...; product.id: product.name ( product.sku ) product.name ( product.sku ) - Stock: {count...
- [ ] **e0184-c016** [table row, lines 184-184](../development-pack/modules/12_orders.md#L184) -- selectedVariant  /  Variant  /  select  /  @change=variantError = ''  /  null: Choose a variant...; variant.id: variant.title ( variant.sku ) - Stock: {count} - formatMoney(variant.price, ch...
- [ ] **e0184-c017** [table row, lines 186-186](../development-pack/modules/12_orders.md#L186) -- quantity  /  Quantity  /  input / number  /  min=1  /  —  /  resources/js/Pages/Orders/Create.vue:364
- [ ] **e0184-c018** [table row, lines 188-188](../development-pack/modules/12_orders.md#L188) -- item.quantity  /  Qty *  /  input / number  /  min=1; @input=updateItemQuantity(index, parseInt($event.target.value))  /  —  /  resources/js/Pages/Orders/Create.vue:387
- [ ] **e0184-c019** [table row, lines 190-190](../development-pack/modules/12_orders.md#L190) -- item.unit_price  /  Unit Price  /  input / number  /  min=0; step=0.01; @input=updateItemPrice(index, $event.target.value)  /  —  /  resources/js/Pages/Orders/Create.vue:391
- [ ] **e0184-c020** [table row, lines 192-192](../development-pack/modules/12_orders.md#L192) -- item.discount_type  /  Line discount  /  DiscountInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Create.vue:400
- [ ] **e0184-c021** [table row, lines 194-194](../development-pack/modules/12_orders.md#L194) -- item.discount_value  /  Line discount  /  DiscountInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Create.vue:400
- [ ] **e0184-c022** [table row, lines 196-196](../development-pack/modules/12_orders.md#L196) -- form.order_date  /  Order Date *  /  input / date  /  HTML required  /  —  /  resources/js/Pages/Orders/Create.vue:427
- [ ] **e0184-c023** [table row, lines 198-198](../development-pack/modules/12_orders.md#L198) -- form.currency  /  Currency  /  select  /  @change=repriceLines  /  currency.code: currency.code - currency.name &#91;repeat currency in currencies&#93;  /  resources/js/Pages/Orders/Create.vue:432
- [ ] **e0184-c024** [table row, lines 200-200](../development-pack/modules/12_orders.md#L200) -- form.status  /  Status *  /  select  /  HTML required  /  pending: Pending; processing: Processing; shipped: Shipped; delivered: Delivered; cancelled: Cancelled  /  resources/js/Pages/Orders...
- [ ] **e0184-c025** [table row, lines 202-202](../development-pack/modules/12_orders.md#L202) -- form.notes  /  Notes  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Create.vue:452
- [ ] **e0184-c026** [table row, lines 204-204](../development-pack/modules/12_orders.md#L204) -- form.discount_type  /  Order discount  /  DiscountInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Create.vue:470
- [ ] **e0184-c027** [table row, lines 206-206](../development-pack/modules/12_orders.md#L206) -- form.discount_value  /  Order discount  /  DiscountInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Create.vue:470
- [ ] **e0184-c028** [table row, lines 208-208](../development-pack/modules/12_orders.md#L208) -- form.tax  /  (dynamic/unlabelled; see source)  /  TaxInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Create.vue:483
- [ ] **e0184-c029** [table row, lines 210-210](../development-pack/modules/12_orders.md#L210) -- form.shipping  /  Shipping  /  input / number  /  min=0; step=0.01  /  —  /  resources/js/Pages/Orders/Create.vue:486
- [ ] **e0184-c030** [prose, lines 213-213](../development-pack/modules/12_orders.md#L213) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/Orders/Create.vue:35
- [ ] **e0184-c031** [source-code reference, lines 215-232](../development-pack/modules/12_orders.md#L215) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0184-c032** [table row, lines 236-236](../development-pack/modules/12_orders.md#L236) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0184-c033** [table row, lines 239-239](../development-pack/modules/12_orders.md#L239) -- Workspace  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Create.vue:268
- [ ] **e0184-c034** [table row, lines 241-241](../development-pack/modules/12_orders.md#L241) -- Orders  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Create.vue:270
- [ ] **e0184-c035** [table row, lines 243-243](../development-pack/modules/12_orders.md#L243) -- Back to Orders  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Create.vue:278
- [ ] **e0184-c036** [table row, lines 245-245](../development-pack/modules/12_orders.md#L245) -- Scan  /  type=button; @click=showScanner = true  /  resources/js/Pages/Orders/Create.vue:317
- [ ] **e0184-c037** [table row, lines 247-247](../development-pack/modules/12_orders.md#L247) -- Add  /  type=button; @click=addItem  /  resources/js/Pages/Orders/Create.vue:367
- [ ] **e0184-c038** [table row, lines 249-249](../development-pack/modules/12_orders.md#L249) -- t('common.delete')  /  type=button; @click=removeItem(index)  /  resources/js/Pages/Orders/Create.vue:397
- [ ] **e0184-c039** [table row, lines 251-251](../development-pack/modules/12_orders.md#L251) -- form.processing ? Creating Order... : Create Order  /  type=submit; :loading=form.processing; :disabled=form.processing \ / \ /  form.items.length === 0  /  resources/js/Pages/Orders/Create....
- [ ] **e0184-c040** [table row, lines 253-253](../development-pack/modules/12_orders.md#L253) -- Cancel  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Create.vue:502
- [ ] **e0184-c041** [prose, lines 256-256](../development-pack/modules/12_orders.md#L256) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0184-c042** [source-code reference, lines 258-267](../development-pack/modules/12_orders.md#L258) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0185: resources/js/Pages/Orders/Edit.vue

Source: [exact contract](../development-pack/modules/12_orders.md#e0185). Complete every clause below before closing this section in the ledger.

- [ ] **e0185-c001** [prose, lines 278-278](../development-pack/modules/12_orders.md#L278) -- Source: resources/js/Pages/Orders/Edit.vue:1.
- [ ] **e0185-c002** [prose, lines 281-281](../development-pack/modules/12_orders.md#L281) -- **Named routes referenced:** orders.index, orders.show, orders.update.
- [ ] **e0185-c003** [prose, lines 284-284](../development-pack/modules/12_orders.md#L284) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0185-c004** [prose, lines 287-287](../development-pack/modules/12_orders.md#L287) -- **Sections / displayed fields / table columns:**
- [ ] **e0185-c005** [statement, lines 289-289](../development-pack/modules/12_orders.md#L289) -- - h3: Customer Information (L155)
- [ ] **e0185-c006** [statement, lines 290-290](../development-pack/modules/12_orders.md#L290) -- - h3: Order Items (L180)
- [ ] **e0185-c007** [statement, lines 291-291](../development-pack/modules/12_orders.md#L291) -- - h3: Order Details (L318)
- [ ] **e0185-c008** [statement, lines 292-292](../development-pack/modules/12_orders.md#L292) -- - h3: Order Summary (L358)
- [ ] **e0185-c009** [prose, lines 295-295](../development-pack/modules/12_orders.md#L295) -- **UI state/filter defaults:**
- [ ] **e0185-c010** [source-code reference, lines 297-299](../development-pack/modules/12_orders.md#L297) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0185-c011** [table row, lines 302-302](../development-pack/modules/12_orders.md#L302) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0185-c012** [table row, lines 305-305](../development-pack/modules/12_orders.md#L305) -- form.customer_name  /  Customer Name *  /  input / text  /  HTML required  /  —  /  resources/js/Pages/Orders/Edit.vue:161
- [ ] **e0185-c013** [table row, lines 307-307](../development-pack/modules/12_orders.md#L307) -- form.customer_email  /  Customer Email  /  input / email  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Edit.vue:166
- [ ] **e0185-c014** [table row, lines 309-309](../development-pack/modules/12_orders.md#L309) -- form.customer_address  /  Shipping Address  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Edit.vue:171
- [ ] **e0185-c015** [table row, lines 311-311](../development-pack/modules/12_orders.md#L311) -- item.product_id  /  Product  /  select  /  HTML required; @change=onProductChange(index)  /  : Select a product; product.id: product.name ( product.sku ) product.name ( product.sku ) - Stock...
- [ ] **e0185-c016** [table row, lines 313-313](../development-pack/modules/12_orders.md#L313) -- item.product_variant_id  /  Variant  /  select  /  HTML required; @change=onVariantChange(index)  /  null: Choose a variant...; variant.id: variant.title ( variant.sku ) - Stock: {count} - f...
- [ ] **e0185-c017** [table row, lines 315-315](../development-pack/modules/12_orders.md#L315) -- item.quantity  /  Qty *  /  input / number  /  HTML required; min=1; step=1  /  —  /  resources/js/Pages/Orders/Edit.vue:245
- [ ] **e0185-c018** [table row, lines 317-317](../development-pack/modules/12_orders.md#L317) -- item.unit_price  /  Unit Price *  /  input / number  /  HTML required; min=0; step=0.01  /  —  /  resources/js/Pages/Orders/Edit.vue:262
- [ ] **e0185-c019** [table row, lines 319-319](../development-pack/modules/12_orders.md#L319) -- item.discount_type  /  Line discount  /  DiscountInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Edit.vue:299
- [ ] **e0185-c020** [table row, lines 321-321](../development-pack/modules/12_orders.md#L321) -- item.discount_value  /  Line discount  /  DiscountInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Edit.vue:299
- [ ] **e0185-c021** [table row, lines 323-323](../development-pack/modules/12_orders.md#L323) -- form.order_date  /  Order Date *  /  input / date  /  HTML required  /  —  /  resources/js/Pages/Orders/Edit.vue:322
- [ ] **e0185-c022** [table row, lines 325-325](../development-pack/modules/12_orders.md#L325) -- form.status  /  Status *  /  select  /  HTML required  /  pending: Pending; processing: Processing; shipped: Shipped; delivered: Delivered; cancelled: Cancelled  /  resources/js/Pages/Orders...
- [ ] **e0185-c023** [table row, lines 327-327](../development-pack/modules/12_orders.md#L327) -- form.notes  /  Notes  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Edit.vue:350
- [ ] **e0185-c024** [table row, lines 329-329](../development-pack/modules/12_orders.md#L329) -- form.discount_type  /  Order discount  /  DiscountInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Edit.vue:369
- [ ] **e0185-c025** [table row, lines 331-331](../development-pack/modules/12_orders.md#L331) -- form.discount_value  /  Order discount  /  DiscountInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Edit.vue:369
- [ ] **e0185-c026** [table row, lines 333-333](../development-pack/modules/12_orders.md#L333) -- form.tax  /  (dynamic/unlabelled; see source)  /  TaxInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Edit.vue:382
- [ ] **e0185-c027** [table row, lines 335-335](../development-pack/modules/12_orders.md#L335) -- form.shipping  /  Shipping  /  input / number  /  min=0; step=0.01  /  —  /  resources/js/Pages/Orders/Edit.vue:385
- [ ] **e0185-c028** [prose, lines 338-338](../development-pack/modules/12_orders.md#L338) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/Orders/Edit.vue:26
- [ ] **e0185-c029** [source-code reference, lines 340-364](../development-pack/modules/12_orders.md#L340) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0185-c030** [table row, lines 368-368](../development-pack/modules/12_orders.md#L368) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0185-c031** [table row, lines 371-371](../development-pack/modules/12_orders.md#L371) -- Workspace  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Edit.vue:132
- [ ] **e0185-c032** [table row, lines 373-373](../development-pack/modules/12_orders.md#L373) -- Orders  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Edit.vue:134
- [ ] **e0185-c033** [table row, lines 375-375](../development-pack/modules/12_orders.md#L375) -- Back to Orders  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Edit.vue:142
- [ ] **e0185-c034** [table row, lines 377-377](../development-pack/modules/12_orders.md#L377) -- Add Item  /  type=button; @click=addItem  /  resources/js/Pages/Orders/Edit.vue:181
- [ ] **e0185-c035** [table row, lines 379-379](../development-pack/modules/12_orders.md#L379) -- Add First Item  /  type=button; @click=addItem  /  resources/js/Pages/Orders/Edit.vue:191
- [ ] **e0185-c036** [table row, lines 381-381](../development-pack/modules/12_orders.md#L381) -- t('common.delete')  /  type=button; @click=removeItem(index)  /  resources/js/Pages/Orders/Edit.vue:288
- [ ] **e0185-c037** [table row, lines 383-383](../development-pack/modules/12_orders.md#L383) -- form.processing ? Updating Order... : Update Order  /  type=submit; :loading=form.processing; :disabled=form.processing  /  resources/js/Pages/Orders/Edit.vue:399
- [ ] **e0185-c038** [table row, lines 385-385](../development-pack/modules/12_orders.md#L385) -- View Order Details  /  :href=route('orders.show', order.id)  /  resources/js/Pages/Orders/Edit.vue:402
- [ ] **e0185-c039** [table row, lines 387-387](../development-pack/modules/12_orders.md#L387) -- Cancel  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Edit.vue:403
- [ ] **e0185-c040** [prose, lines 390-390](../development-pack/modules/12_orders.md#L390) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0185-c041** [source-code reference, lines 392-402](../development-pack/modules/12_orders.md#L392) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0186: resources/js/Pages/Orders/Index.vue

Source: [exact contract](../development-pack/modules/12_orders.md#e0186). Complete every clause below before closing this section in the ledger.

- [ ] **e0186-c001** [prose, lines 413-413](../development-pack/modules/12_orders.md#L413) -- Source: resources/js/Pages/Orders/Index.vue:1.
- [ ] **e0186-c002** [prose, lines 416-416](../development-pack/modules/12_orders.md#L416) -- **Named routes referenced:** orders.create, orders.destroy, orders.edit, orders.index, orders.payments.mark-pre-tracking-paid, orders.show.
- [ ] **e0186-c003** [prose, lines 419-419](../development-pack/modules/12_orders.md#L419) -- **Permission/route-capability checks:** delete_orders, orders.create, orders.edit.
- [ ] **e0186-c004** [prose, lines 422-422](../development-pack/modules/12_orders.md#L422) -- **Sections / displayed fields / table columns:**
- [ ] **e0186-c005** [statement, lines 424-424](../development-pack/modules/12_orders.md#L424) -- - h3: Mark older orders as paid (L269)
- [ ] **e0186-c006** [statement, lines 425-425](../development-pack/modules/12_orders.md#L425) -- - column order_number: Order (L86)
- [ ] **e0186-c007** [statement, lines 426-426](../development-pack/modules/12_orders.md#L426) -- - column customer_name: Customer (L87)
- [ ] **e0186-c008** [statement, lines 427-427](../development-pack/modules/12_orders.md#L427) -- - column items: Items (L88)
- [ ] **e0186-c009** [statement, lines 428-428](../development-pack/modules/12_orders.md#L428) -- - column total: Total (L89)
- [ ] **e0186-c010** [statement, lines 429-429](../development-pack/modules/12_orders.md#L429) -- - column status: Status (L90)
- [ ] **e0186-c011** [statement, lines 430-430](../development-pack/modules/12_orders.md#L430) -- - column payment_status: Payment status (L92)
- [ ] **e0186-c012** [statement, lines 431-431](../development-pack/modules/12_orders.md#L431) -- - column source: Source (L93)
- [ ] **e0186-c013** [statement, lines 432-432](../development-pack/modules/12_orders.md#L432) -- - column order_date: Date (L94)
- [ ] **e0186-c014** [statement, lines 433-433](../development-pack/modules/12_orders.md#L433) -- - column actions: Actions (L95)
- [ ] **e0186-c015** [prose, lines 436-436](../development-pack/modules/12_orders.md#L436) -- **UI state/filter defaults:**
- [ ] **e0186-c016** [source-code reference, lines 438-444](../development-pack/modules/12_orders.md#L438) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0186-c017** [table row, lines 447-447](../development-pack/modules/12_orders.md#L447) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0186-c018** [table row, lines 450-450](../development-pack/modules/12_orders.md#L450) -- search  /  Search Orders  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Index.vue:139
- [ ] **e0186-c019** [table row, lines 452-452](../development-pack/modules/12_orders.md#L452) -- status  /  Status  /  select  /  No extra control attribute; server rules below  /  : All Statuses; stat: statusText(stat) &#91;repeat stat in statuses&#93;  /  resources/js/Pages/Orders/Index.vue:1...
- [ ] **e0186-c020** [table row, lines 454-454](../development-pack/modules/12_orders.md#L454) -- source  /  Source  /  select  /  No extra control attribute; server rules below  /  : All Sources; src: sourceText(src) &#91;repeat src in sources&#93;  /  resources/js/Pages/Orders/Index.vue:155
- [ ] **e0186-c021** [table row, lines 456-456](../development-pack/modules/12_orders.md#L456) -- paymentStatus  /  Payment status  /  select  /  No extra control attribute; server rules below  /  : All payment statuses; ps: t(payments.status.${ps}) &#91;repeat ps in paymentStatuses&#93;  /  res...
- [ ] **e0186-c022** [table row, lines 458-458](../development-pack/modules/12_orders.md#L458) -- markPaidForm.before  /  Placed before  /  input / date  /  HTML required  /  —  /  resources/js/Pages/Orders/Index.vue:276
- [ ] **e0186-c023** [prose, lines 461-461](../development-pack/modules/12_orders.md#L461) -- **Exact markPaidForm defaults / hydration / hidden payload** — resources/js/Pages/Orders/Index.vue:41
- [ ] **e0186-c024** [source-code reference, lines 463-466](../development-pack/modules/12_orders.md#L463) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0186-c025** [table row, lines 470-470](../development-pack/modules/12_orders.md#L470) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0186-c026** [table row, lines 473-473](../development-pack/modules/12_orders.md#L473) -- Mark older orders paid  /  v-if=canRecordPayments &amp;&amp; untrackedOrderCount &gt; 0; @click=showMarkPaidModal = true  /  resources/js/Pages/Orders/Index.vue:118
- [ ] **e0186-c027** [table row, lines 475-475](../development-pack/modules/12_orders.md#L475) -- Create Order  /  v-if=canVisit('orders.create'); :href=route('orders.create')  /  resources/js/Pages/Orders/Index.vue:127
- [ ] **e0186-c028** [table row, lines 477-477](../development-pack/modules/12_orders.md#L477) -- Search  /  type=submit  /  resources/js/Pages/Orders/Index.vue:140
- [ ] **e0186-c029** [table row, lines 479-479](../development-pack/modules/12_orders.md#L479) -- Search  /  type=submit  /  resources/js/Pages/Orders/Index.vue:169
- [ ] **e0186-c030** [table row, lines 481-481](../development-pack/modules/12_orders.md#L481) -- Clear Filters  /  type=button; @click=clearFilters  /  resources/js/Pages/Orders/Index.vue:173
- [ ] **e0186-c031** [table row, lines 483-483](../development-pack/modules/12_orders.md#L483) -- row.order_number  /  :href=route('orders.show', row.id)  /  resources/js/Pages/Orders/Index.vue:184
- [ ] **e0186-c032** [table row, lines 485-485](../development-pack/modules/12_orders.md#L485) -- t('common.view')  /  :href=route('orders.show', row.id)  /  resources/js/Pages/Orders/Index.vue:213
- [ ] **e0186-c033** [table row, lines 487-487](../development-pack/modules/12_orders.md#L487) -- t('common.edit')  /  v-if=canVisit('orders.edit'); :href=route('orders.edit', row.id)  /  resources/js/Pages/Orders/Index.vue:214
- [ ] **e0186-c034** [table row, lines 489-489](../development-pack/modules/12_orders.md#L489) -- t('common.delete')  /  v-if=hasPermission('delete_orders'); type=button; @click=deleteOrder(row)  /  resources/js/Pages/Orders/Index.vue:215
- [ ] **e0186-c035** [table row, lines 491-491](../development-pack/modules/12_orders.md#L491) -- Create Your First Order  /  v-if=canVisit('orders.create'); :href=route('orders.create')  /  resources/js/Pages/Orders/Index.vue:222
- [ ] **e0186-c036** [table row, lines 493-493](../development-pack/modules/12_orders.md#L493) -- Icon action  /  type=button; @click=showMarkPaidModal = false  /  resources/js/Pages/Orders/Index.vue:270
- [ ] **e0186-c037** [table row, lines 495-495](../development-pack/modules/12_orders.md#L495) -- Cancel  /  type=button; :disabled=markPaidForm.processing; @click=showMarkPaidModal = false  /  resources/js/Pages/Orders/Index.vue:286
- [ ] **e0186-c038** [table row, lines 497-497](../development-pack/modules/12_orders.md#L497) -- Mark as paid  /  type=submit; :loading=markPaidForm.processing; :disabled=markPaidForm.processing  /  resources/js/Pages/Orders/Index.vue:287
- [ ] **e0186-c039** [prose, lines 500-500](../development-pack/modules/12_orders.md#L500) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0186-c040** [source-code reference, lines 502-515](../development-pack/modules/12_orders.md#L502) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0187: resources/js/Pages/Orders/Show.vue

Source: [exact contract](../development-pack/modules/12_orders.md#e0187). Complete every clause below before closing this section in the ledger.

- [ ] **e0187-c001** [prose, lines 526-526](../development-pack/modules/12_orders.md#L526) -- Source: resources/js/Pages/Orders/Show.vue:1.
- [ ] **e0187-c002** [prose, lines 529-529](../development-pack/modules/12_orders.md#L529) -- **Named routes referenced:** orders.destroy, orders.edit, orders.index, orders.invoice.download, orders.invoice.email, orders.invoice.preview, orders.payments.store, orders.payments.void, pr...
- [ ] **e0187-c003** [prose, lines 532-532](../development-pack/modules/12_orders.md#L532) -- **Permission/route-capability checks:** delete_orders, edit_orders, manage_returns, products.show, view_orders.
- [ ] **e0187-c004** [prose, lines 535-535](../development-pack/modules/12_orders.md#L535) -- **Sections / displayed fields / table columns:**
- [ ] **e0187-c005** [statement, lines 537-537](../development-pack/modules/12_orders.md#L537) -- - h3: Order Items (L264)
- [ ] **e0187-c006** [statement, lines 538-538](../development-pack/modules/12_orders.md#L538) -- - h3: Payments (L318)
- [ ] **e0187-c007** [statement, lines 539-539](../development-pack/modules/12_orders.md#L539) -- - h3: Customer Information (L392)
- [ ] **e0187-c008** [statement, lines 540-540](../development-pack/modules/12_orders.md#L540) -- - dt: Customer Name (L396)
- [ ] **e0187-c009** [statement, lines 541-541](../development-pack/modules/12_orders.md#L541) -- - dt: Email (L401)
- [ ] **e0187-c010** [statement, lines 542-542](../development-pack/modules/12_orders.md#L542) -- - dt: Shipping Address (L410)
- [ ] **e0187-c011** [statement, lines 543-543](../development-pack/modules/12_orders.md#L543) -- - h3: Order Timeline (L419)
- [ ] **e0187-c012** [statement, lines 544-544](../development-pack/modules/12_orders.md#L544) -- - h3: Internal Notes (L451)
- [ ] **e0187-c013** [statement, lines 545-545](../development-pack/modules/12_orders.md#L545) -- - h3: Order Summary (L465)
- [ ] **e0187-c014** [statement, lines 546-546](../development-pack/modules/12_orders.md#L546) -- - dt: Subtotal (L469)
- [ ] **e0187-c015** [statement, lines 547-547](../development-pack/modules/12_orders.md#L547) -- - dt: Line discounts (L474)
- [ ] **e0187-c016** [statement, lines 548-548](../development-pack/modules/12_orders.md#L548) -- - dt: Order discount ( parseFloat(order.discount_value) %) (L479)
- [ ] **e0187-c017** [statement, lines 549-549](../development-pack/modules/12_orders.md#L549) -- - dt: Tax (L486)
- [ ] **e0187-c018** [statement, lines 550-550](../development-pack/modules/12_orders.md#L550) -- - dt: Shipping (L491)
- [ ] **e0187-c019** [statement, lines 551-551](../development-pack/modules/12_orders.md#L551) -- - dt: Total (L497)
- [ ] **e0187-c020** [statement, lines 552-552](../development-pack/modules/12_orders.md#L552) -- - dt: Amount paid (L504)
- [ ] **e0187-c021** [statement, lines 553-553](../development-pack/modules/12_orders.md#L553) -- - dt: Balance due (L508)
- [ ] **e0187-c022** [statement, lines 554-554](../development-pack/modules/12_orders.md#L554) -- - h3: Order Details (L518)
- [ ] **e0187-c023** [statement, lines 555-555](../development-pack/modules/12_orders.md#L555) -- - dt: Order Number (L522)
- [ ] **e0187-c024** [statement, lines 556-556](../development-pack/modules/12_orders.md#L556) -- - dt: Channel order number (L527)
- [ ] **e0187-c025** [statement, lines 557-557](../development-pack/modules/12_orders.md#L557) -- - dt: Source (L532)
- [ ] **e0187-c026** [statement, lines 558-558](../development-pack/modules/12_orders.md#L558) -- - dt: Status (L539)
- [ ] **e0187-c027** [statement, lines 559-559](../development-pack/modules/12_orders.md#L559) -- - dt: Order Date (L546)
- [ ] **e0187-c028** [statement, lines 560-560](../development-pack/modules/12_orders.md#L560) -- - dt: Currency (L551)
- [ ] **e0187-c029** [statement, lines 561-561](../development-pack/modules/12_orders.md#L561) -- - h3: Invoice (L561)
- [ ] **e0187-c030** [statement, lines 562-562](../development-pack/modules/12_orders.md#L562) -- - dt: Invoice number (L567)
- [ ] **e0187-c031** [statement, lines 563-563](../development-pack/modules/12_orders.md#L563) -- - h3: Approval Status (L584)
- [ ] **e0187-c032** [statement, lines 564-564](../development-pack/modules/12_orders.md#L564) -- - dt: Status (L588)
- [ ] **e0187-c033** [statement, lines 565-565](../development-pack/modules/12_orders.md#L565) -- - dt: Created By (L595)
- [ ] **e0187-c034** [statement, lines 566-566](../development-pack/modules/12_orders.md#L566) -- - dt: order.approval_status === 'approved' ? Approved : Rejected By (L600)
- [ ] **e0187-c035** [statement, lines 567-567](../development-pack/modules/12_orders.md#L567) -- - dt: Decision Date (L605)
- [ ] **e0187-c036** [statement, lines 568-568](../development-pack/modules/12_orders.md#L568) -- - dt: Notes (L610)
- [ ] **e0187-c037** [statement, lines 569-569](../development-pack/modules/12_orders.md#L569) -- - h3: Danger Zone (L629)
- [ ] **e0187-c038** [statement, lines 570-570](../development-pack/modules/12_orders.md#L570) -- - h3: paymentForm.type === 'refund' ? Record refund : Record payment (L664)
- [ ] **e0187-c039** [statement, lines 571-571](../development-pack/modules/12_orders.md#L571) -- - h3: Void payment (L729)
- [ ] **e0187-c040** [statement, lines 572-572](../development-pack/modules/12_orders.md#L572) -- - h3: Delete Order (L760)
- [ ] **e0187-c041** [statement, lines 573-573](../development-pack/modules/12_orders.md#L573) -- - h3: approvalAction === 'approve' ? Approve Order : Reject Order (L809)
- [ ] **e0187-c042** [prose, lines 576-576](../development-pack/modules/12_orders.md#L576) -- **UI state/filter defaults:**
- [ ] **e0187-c043** [source-code reference, lines 578-585](../development-pack/modules/12_orders.md#L578) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0187-c044** [table row, lines 588-588](../development-pack/modules/12_orders.md#L588) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0187-c045** [table row, lines 591-591](../development-pack/modules/12_orders.md#L591) -- paymentForm.amount  /  Amount  /  input / number  /  HTML required; min=0.01; step=0.01  /  —  /  resources/js/Pages/Orders/Show.vue:678
- [ ] **e0187-c046** [table row, lines 593-593](../development-pack/modules/12_orders.md#L593) -- paymentForm.method  /  Method  /  select  /  HTML required  /  method.value: method.label &#91;repeat method in paymentMethods&#93;  /  resources/js/Pages/Orders/Show.vue:682
- [ ] **e0187-c047** [table row, lines 595-595](../development-pack/modules/12_orders.md#L595) -- paymentForm.paid_at  /  Date  /  input / date  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Orders/Show.vue:693
- [ ] **e0187-c048** [table row, lines 597-597](../development-pack/modules/12_orders.md#L597) -- paymentForm.reference  /  Reference  /  input / text  /  maxlength=255  /  —  /  resources/js/Pages/Orders/Show.vue:697
- [ ] **e0187-c049** [table row, lines 599-599](../development-pack/modules/12_orders.md#L599) -- paymentForm.notes  /  Notes  /  textarea  /  maxlength=2000  /  —  /  resources/js/Pages/Orders/Show.vue:705
- [ ] **e0187-c050** [table row, lines 601-601](../development-pack/modules/12_orders.md#L601) -- paymentForm.allow_overpayment  /  Allow an overpayment (the order will be marked overpaid)  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Page...
- [ ] **e0187-c051** [table row, lines 603-603](../development-pack/modules/12_orders.md#L603) -- voidForm.reason  /  Reason (optional)  /  input / text  /  maxlength=255  /  —  /  resources/js/Pages/Orders/Show.vue:741
- [ ] **e0187-c052** [table row, lines 605-605](../development-pack/modules/12_orders.md#L605) -- approvalForm.notes  /  Notes approvalAction === 'reject' ? Notes (Required) : (Optional)  /  textarea  /  :required=approvalAction === 'reject'  /  —  /  resources/js/Pages/Orders/Show.vue:8...
- [ ] **e0187-c053** [prose, lines 608-608](../development-pack/modules/12_orders.md#L608) -- **Exact paymentForm defaults / hydration / hidden payload** — resources/js/Pages/Orders/Show.vue:53
- [ ] **e0187-c054** [source-code reference, lines 610-621](../development-pack/modules/12_orders.md#L610) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0187-c055** [prose, lines 625-625](../development-pack/modules/12_orders.md#L625) -- **Exact voidForm defaults / hydration / hidden payload** — resources/js/Pages/Orders/Show.vue:87
- [ ] **e0187-c056** [source-code reference, lines 627-630](../development-pack/modules/12_orders.md#L627) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0187-c057** [prose, lines 634-634](../development-pack/modules/12_orders.md#L634) -- **Exact deleteForm defaults / hydration / hidden payload** — resources/js/Pages/Orders/Show.vue:116
- [ ] **e0187-c058** [source-code reference, lines 636-639](../development-pack/modules/12_orders.md#L636) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0187-c059** [prose, lines 643-643](../development-pack/modules/12_orders.md#L643) -- **Exact approvalForm defaults / hydration / hidden payload** — resources/js/Pages/Orders/Show.vue:123
- [ ] **e0187-c060** [source-code reference, lines 645-648](../development-pack/modules/12_orders.md#L645) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0187-c061** [table row, lines 652-652](../development-pack/modules/12_orders.md#L652) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0187-c062** [table row, lines 655-655](../development-pack/modules/12_orders.md#L655) -- Workspace  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Show.vue:175
- [ ] **e0187-c063** [table row, lines 657-657](../development-pack/modules/12_orders.md#L657) -- Orders  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Show.vue:177
- [ ] **e0187-c064** [table row, lines 659-659](../development-pack/modules/12_orders.md#L659) -- Download Invoice  /  v-if=hasPermission('view_orders'); :href=route('orders.invoice.download', order.id)  /  resources/js/Pages/Orders/Show.vue:192
- [ ] **e0187-c065** [table row, lines 661-661](../development-pack/modules/12_orders.md#L661) -- Preview Invoice  /  v-if=hasPermission('view_orders'); :href=route('orders.invoice.preview', order.id)  /  resources/js/Pages/Orders/Show.vue:202
- [ ] **e0187-c066** [table row, lines 663-663](../development-pack/modules/12_orders.md#L663) -- Email Invoice  /  v-if=hasPermission('edit_orders'); @click=showInvoiceModal = true  /  resources/js/Pages/Orders/Show.vue:213
- [ ] **e0187-c067** [table row, lines 665-665](../development-pack/modules/12_orders.md#L665) -- Create Return  /  v-if=hasPermission('manage_returns'); :href=route('returns.create', { order_id: order.id })  /  resources/js/Pages/Orders/Show.vue:222
- [ ] **e0187-c068** [table row, lines 667-667](../development-pack/modules/12_orders.md#L667) -- Edit Order  /  v-if=hasPermission('edit_orders'); :href=route('orders.edit', order.id)  /  resources/js/Pages/Orders/Show.vue:232
- [ ] **e0187-c069** [table row, lines 669-669](../development-pack/modules/12_orders.md#L669) -- Back to Orders  /  :href=route('orders.index')  /  resources/js/Pages/Orders/Show.vue:242
- [ ] **e0187-c070** [table row, lines 671-671](../development-pack/modules/12_orders.md#L671) -- View Product →  /  v-if=item.product &amp;&amp; canVisit('products.show'); :href=route('products.show', item.product_id)  /  resources/js/Pages/Orders/Show.vue:279
- [ ] **e0187-c071** [table row, lines 673-673](../development-pack/modules/12_orders.md#L673) -- Record refund  /  v-if=parseFloat(order.amount_paid) &gt; 0; @click=openPaymentModal('refund')  /  resources/js/Pages/Orders/Show.vue:322
- [ ] **e0187-c072** [table row, lines 675-675](../development-pack/modules/12_orders.md#L675) -- Record payment  /  v-if=order.status !== 'cancelled'; @click=openPaymentModal('payment')  /  resources/js/Pages/Orders/Show.vue:331
- [ ] **e0187-c073** [table row, lines 677-677](../development-pack/modules/12_orders.md#L677) -- Void  /  v-if=canRecordPayments &amp;&amp; !payment.voided_at; type=button; @click=openVoidModal(payment)  /  resources/js/Pages/Orders/Show.vue:370
- [ ] **e0187-c074** [table row, lines 679-679](../development-pack/modules/12_orders.md#L679) -- Approve Order  /  @click=openApprovalModal('approve')  /  resources/js/Pages/Orders/Show.vue:617
- [ ] **e0187-c075** [table row, lines 681-681](../development-pack/modules/12_orders.md#L681) -- Reject Order  /  @click=openApprovalModal('reject')  /  resources/js/Pages/Orders/Show.vue:620
- [ ] **e0187-c076** [table row, lines 683-683](../development-pack/modules/12_orders.md#L683) -- Delete Order  /  @click=showDeleteModal = true  /  resources/js/Pages/Orders/Show.vue:631
- [ ] **e0187-c077** [table row, lines 685-685](../development-pack/modules/12_orders.md#L685) -- Icon action  /  type=button; @click=closePaymentModal  /  resources/js/Pages/Orders/Show.vue:667
- [ ] **e0187-c078** [table row, lines 687-687](../development-pack/modules/12_orders.md#L687) -- Cancel  /  type=button; :disabled=paymentForm.processing; @click=closePaymentModal  /  resources/js/Pages/Orders/Show.vue:715
- [ ] **e0187-c079** [table row, lines 689-689](../development-pack/modules/12_orders.md#L689) -- Save  /  type=submit; :loading=paymentForm.processing; :disabled=paymentForm.processing  /  resources/js/Pages/Orders/Show.vue:716
- [ ] **e0187-c080** [table row, lines 691-691](../development-pack/modules/12_orders.md#L691) -- Icon action  /  type=button; @click=voidingPayment = null  /  resources/js/Pages/Orders/Show.vue:730
- [ ] **e0187-c081** [table row, lines 693-693](../development-pack/modules/12_orders.md#L693) -- Cancel  /  type=button; :disabled=voidForm.processing; @click=voidingPayment = null  /  resources/js/Pages/Orders/Show.vue:746
- [ ] **e0187-c082** [table row, lines 695-695](../development-pack/modules/12_orders.md#L695) -- Void  /  type=submit; :loading=voidForm.processing; :disabled=voidForm.processing  /  resources/js/Pages/Orders/Show.vue:747
- [ ] **e0187-c083** [table row, lines 697-697](../development-pack/modules/12_orders.md#L697) -- t('common.close')  /  type=button; @click=showDeleteModal = false  /  resources/js/Pages/Orders/Show.vue:763
- [ ] **e0187-c084** [table row, lines 699-699](../development-pack/modules/12_orders.md#L699) -- Cancel  /  @click=showDeleteModal = false; :disabled=deleting  /  resources/js/Pages/Orders/Show.vue:790
- [ ] **e0187-c085** [table row, lines 701-701](../development-pack/modules/12_orders.md#L701) -- Deleting... Delete Order  /  :loading=deleting; :disabled=deleting; @click=deleteOrder  /  resources/js/Pages/Orders/Show.vue:793
- [ ] **e0187-c086** [table row, lines 703-703](../development-pack/modules/12_orders.md#L703) -- t('common.close')  /  type=button; @click=showApprovalModal = false  /  resources/js/Pages/Orders/Show.vue:812
- [ ] **e0187-c087** [table row, lines 705-705](../development-pack/modules/12_orders.md#L705) -- Cancel  /  @click=showApprovalModal = false; :disabled=processing  /  resources/js/Pages/Orders/Show.vue:847
- [ ] **e0187-c088** [table row, lines 707-707](../development-pack/modules/12_orders.md#L707) -- Loading... approvalAction === 'approve' ? Approve : Reject  /  :loading=processing; :disabled=processing \ / \ /  (approvalAction === 'reject' &amp;&amp; !approvalForm.notes.trim()); @click=submitAp...
- [ ] **e0187-c089** [prose, lines 710-710](../development-pack/modules/12_orders.md#L710) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0187-c090** [source-code reference, lines 712-757](../development-pack/modules/12_orders.md#L712) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0203: resources/js/Components/SendDocumentModal.vue

Source: [exact contract](../development-pack/modules/12_orders.md#e0203). Complete every clause below before closing this section in the ledger.

- [ ] **e0203-c001** [prose, lines 768-768](../development-pack/modules/12_orders.md#L768) -- Source: resources/js/Components/SendDocumentModal.vue:1.
- [ ] **e0203-c002** [prose, lines 771-771](../development-pack/modules/12_orders.md#L771) -- **Named routes referenced:** Dynamic/component props; see action expressions..
- [ ] **e0203-c003** [prose, lines 774-774](../development-pack/modules/12_orders.md#L774) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0203-c004** [prose, lines 777-777](../development-pack/modules/12_orders.md#L777) -- **Sections / displayed fields / table columns:**
- [ ] **e0203-c005** [statement, lines 779-779](../development-pack/modules/12_orders.md#L779) -- - h3: title (L76)
- [ ] **e0203-c006** [table row, lines 782-782](../development-pack/modules/12_orders.md#L782) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0203-c007** [table row, lines 785-785](../development-pack/modules/12_orders.md#L785) -- form.to  /  To  /  input / email  /  HTML required; maxlength=255  /  —  /  resources/js/Components/SendDocumentModal.vue:92
- [ ] **e0203-c008** [table row, lines 787-787](../development-pack/modules/12_orders.md#L787) -- form.cc  /  CC  /  input / text  /  maxlength=1000  /  —  /  resources/js/Components/SendDocumentModal.vue:106
- [ ] **e0203-c009** [table row, lines 789-789](../development-pack/modules/12_orders.md#L789) -- form.message  /  Message  /  textarea  /  maxlength=2000  /  —  /  resources/js/Components/SendDocumentModal.vue:119
- [ ] **e0203-c010** [prose, lines 792-792](../development-pack/modules/12_orders.md#L792) -- **Exact form defaults / hydration / hidden payload** — resources/js/Components/SendDocumentModal.vue:27
- [ ] **e0203-c011** [source-code reference, lines 794-801](../development-pack/modules/12_orders.md#L794) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0203-c012** [table row, lines 805-805](../development-pack/modules/12_orders.md#L805) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0203-c013** [table row, lines 808-808](../development-pack/modules/12_orders.md#L808) -- t('common.cancel')  /  type=button; @click=close  /  resources/js/Components/SendDocumentModal.vue:77
- [ ] **e0203-c014** [table row, lines 810-810](../development-pack/modules/12_orders.md#L810) -- Cancel  /  :disabled=form.processing; @click=close  /  resources/js/Components/SendDocumentModal.vue:137
- [ ] **e0203-c015** [table row, lines 812-812](../development-pack/modules/12_orders.md#L812) -- form.processing ? Sending... : (submitLabel \\ / \\ /  Send)  /  type=submit; :loading=form.processing; :disabled=form.processing \ / \ /  !form.to  /  resources/js/Components/SendDocumentMo...
- [ ] **e0203-c016** [prose, lines 815-815](../development-pack/modules/12_orders.md#L815) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0203-c017** [source-code reference, lines 817-820](../development-pack/modules/12_orders.md#L817) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0206: resources/js/Components/TaxInput.vue

Source: [exact contract](../development-pack/modules/12_orders.md#e0206). Complete every clause below before closing this section in the ledger.

- [ ] **e0206-c001** [prose, lines 831-831](../development-pack/modules/12_orders.md#L831) -- Source: resources/js/Components/TaxInput.vue:1.
- [ ] **e0206-c002** [prose, lines 834-834](../development-pack/modules/12_orders.md#L834) -- **Named routes referenced:** Dynamic/component props; see action expressions..
- [ ] **e0206-c003** [prose, lines 837-837](../development-pack/modules/12_orders.md#L837) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0206-c004** [prose, lines 840-840](../development-pack/modules/12_orders.md#L840) -- **UI state/filter defaults:**
- [ ] **e0206-c005** [source-code reference, lines 842-844](../development-pack/modules/12_orders.md#L842) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0206-c006** [table row, lines 847-847](../development-pack/modules/12_orders.md#L847) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0206-c007** [table row, lines 850-850](../development-pack/modules/12_orders.md#L850) -- amount  /  Tax amount  /  input / number  /  min=0; step=0.01; @input=rate = null  /  —  /  resources/js/Components/TaxInput.vue:42
- [ ] **e0206-c008** [table row, lines 852-852](../development-pack/modules/12_orders.md#L852) -- rate ?? ''  /  Rate  /  input / number  /  min=0; max=100; step=0.001; @input=onRateInput  /  —  /  resources/js/Components/TaxInput.vue:52

### e0207: resources/js/Components/DiscountInput.vue

Source: [exact contract](../development-pack/modules/12_orders.md#e0207). Complete every clause below before closing this section in the ledger.

- [ ] **e0207-c001** [prose, lines 862-862](../development-pack/modules/12_orders.md#L862) -- Source: resources/js/Components/DiscountInput.vue:1.
- [ ] **e0207-c002** [prose, lines 865-865](../development-pack/modules/12_orders.md#L865) -- **Named routes referenced:** Dynamic/component props; see action expressions..
- [ ] **e0207-c003** [prose, lines 868-868](../development-pack/modules/12_orders.md#L868) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0207-c004** [table row, lines 871-871](../development-pack/modules/12_orders.md#L871) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0207-c005** [table row, lines 874-874](../development-pack/modules/12_orders.md#L874) -- type ?? ''  /  label  /  select  /  @change=onTypeChange  /  : No discount; percent: Percent (%); fixed: Fixed amount  /  resources/js/Components/DiscountInput.vue:33
- [ ] **e0207-c006** [table row, lines 876-876](../development-pack/modules/12_orders.md#L876) -- value  /  Discount value  /  input / number  /  min=0; :max=type === 'percent' ? 100 : undefined; step=0.01; :disabled=!type  /  —  /  resources/js/Components/DiscountInput.vue:38
- [ ] **e0207-c007** [prose, lines 879-879](../development-pack/modules/12_orders.md#L879) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0207-c008** [source-code reference, lines 881-883](../development-pack/modules/12_orders.md#L881) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0209: resources/js/Components/CurrencySelect.vue

Source: [exact contract](../development-pack/modules/12_orders.md#e0209). Complete every clause below before closing this section in the ledger.

- [ ] **e0209-c001** [prose, lines 894-894](../development-pack/modules/12_orders.md#L894) -- Source: resources/js/Components/CurrencySelect.vue:1.
- [ ] **e0209-c002** [prose, lines 897-897](../development-pack/modules/12_orders.md#L897) -- **Named routes referenced:** Dynamic/component props; see action expressions..
- [ ] **e0209-c003** [prose, lines 900-900](../development-pack/modules/12_orders.md#L900) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0209-c004** [table row, lines 903-903](../development-pack/modules/12_orders.md#L903) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0209-c005** [table row, lines 906-906](../development-pack/modules/12_orders.md#L906) -- model  /  (dynamic/unlabelled; see source)  /  select  /  No extra control attribute; server rules below  /  currency: currency &#91;repeat currency in currencies&#93;  /  resources/js/Components/Cu...

### e0215: RecordOrderPaymentRequest.php

Source: [exact contract](../development-pack/modules/12_orders.md#e0215). Complete every clause below before closing this section in the ledger.

- [ ] **e0215-c001** [prose, lines 916-916](../development-pack/modules/12_orders.md#L916) -- app/Http/Requests/Order/RecordOrderPaymentRequest.php:1
- [ ] **e0215-c002** [source-code reference, lines 918-962](../development-pack/modules/12_orders.md#L918) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0216: StoreOrderRequest.php

Source: [exact contract](../development-pack/modules/12_orders.md#e0216). Complete every clause below before closing this section in the ledger.

- [ ] **e0216-c001** [prose, lines 973-973](../development-pack/modules/12_orders.md#L973) -- app/Http/Requests/Order/StoreOrderRequest.php:1
- [ ] **e0216-c002** [source-code reference, lines 975-1045](../development-pack/modules/12_orders.md#L975) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0217: UpdateOrderRequest.php

Source: [exact contract](../development-pack/modules/12_orders.md#e0217). Complete every clause below before closing this section in the ledger.

- [ ] **e0217-c001** [prose, lines 1056-1056](../development-pack/modules/12_orders.md#L1056) -- app/Http/Requests/Order/UpdateOrderRequest.php:1
- [ ] **e0217-c002** [source-code reference, lines 1058-1104](../development-pack/modules/12_orders.md#L1058) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0226: SendDocumentEmailRequest.php

Source: [exact contract](../development-pack/modules/12_orders.md#e0226). Complete every clause below before closing this section in the ledger.

- [ ] **e0226-c001** [prose, lines 1115-1115](../development-pack/modules/12_orders.md#L1115) -- app/Http/Requests/SendDocumentEmailRequest.php:1
- [ ] **e0226-c002** [source-code reference, lines 1117-1195](../development-pack/modules/12_orders.md#L1117) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0242: app/Models/Order/Order.php

Source: [exact contract](../development-pack/modules/12_orders.md#e0242). Complete every clause below before closing this section in the ledger.

- [ ] **e0242-c001** [prose, lines 1206-1206](../development-pack/modules/12_orders.md#L1206) -- app/Models/Order/Order.php:1
- [ ] **e0242-c002** [source-code reference, lines 1209-1248](../development-pack/modules/12_orders.md#L1209) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0242-c003** [source-code reference, lines 1251-1270](../development-pack/modules/12_orders.md#L1251) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0243: app/Models/Order/OrderItem.php

Source: [exact contract](../development-pack/modules/12_orders.md#e0243). Complete every clause below before closing this section in the ledger.

- [ ] **e0243-c001** [prose, lines 1281-1281](../development-pack/modules/12_orders.md#L1281) -- app/Models/Order/OrderItem.php:1
- [ ] **e0243-c002** [source-code reference, lines 1284-1303](../development-pack/modules/12_orders.md#L1284) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0243-c003** [source-code reference, lines 1306-1317](../development-pack/modules/12_orders.md#L1306) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0244: app/Models/Order/OrderPayment.php

Source: [exact contract](../development-pack/modules/12_orders.md#e0244). Complete every clause below before closing this section in the ledger.

- [ ] **e0244-c001** [prose, lines 1328-1328](../development-pack/modules/12_orders.md#L1328) -- app/Models/Order/OrderPayment.php:1
- [ ] **e0244-c002** [source-code reference, lines 1331-1346](../development-pack/modules/12_orders.md#L1331) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0244-c003** [source-code reference, lines 1349-1354](../development-pack/modules/12_orders.md#L1349) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0474: `app/Http/Requests/Api/Order/ApproveOrderRequest.php`

Source: [exact contract](../development-pack/modules/12_orders.md#e0474). Complete every clause below before closing this section in the ledger.

- [ ] **e0474-c001** [prose, lines 1365-1365](../development-pack/modules/12_orders.md#L1365) -- Source evidence. SHA-256: 501255455f9faa8a4a25b39f4f309665ddb75bf67cf2326fd56828d82089c00b.
- [ ] **e0474-c002** [source-code reference, lines 1367-1392](../development-pack/modules/12_orders.md#L1367) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0475: `app/Http/Requests/Api/Order/RejectOrderRequest.php`

Source: [exact contract](../development-pack/modules/12_orders.md#e0475). Complete every clause below before closing this section in the ledger.

- [ ] **e0475-c001** [prose, lines 1402-1402](../development-pack/modules/12_orders.md#L1402) -- Source evidence. SHA-256: b0e502f7966e5a5194cf31f6d1ebf534c282ca88711b19c8f1f023e7044bf9cc.
- [ ] **e0475-c002** [source-code reference, lines 1404-1429](../development-pack/modules/12_orders.md#L1404) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0502: `app/Enums/DiscountType.php`

Source: [exact contract](../development-pack/modules/12_orders.md#e0502). Complete every clause below before closing this section in the ledger.

- [ ] **e0502-c001** [prose, lines 1439-1439](../development-pack/modules/12_orders.md#L1439) -- Source evidence. SHA-256: a6d7f5e8eb60b1ecb37c4f74125fe5580698cd5a2b263e5035bae3cdeb0adeb6.
- [ ] **e0502-c002** [source-code reference, lines 1441-1465](../development-pack/modules/12_orders.md#L1441) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0503: `app/Enums/OrderApprovalStatus.php`

Source: [exact contract](../development-pack/modules/12_orders.md#e0503). Complete every clause below before closing this section in the ledger.

- [ ] **e0503-c001** [prose, lines 1475-1475](../development-pack/modules/12_orders.md#L1475) -- Source evidence. SHA-256: 621394be5656c1fb927907a58e63217c156d06edae95c34feb00188a552afdee.
- [ ] **e0503-c002** [source-code reference, lines 1477-1528](../development-pack/modules/12_orders.md#L1477) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0504: `app/Enums/OrderStatus.php`

Source: [exact contract](../development-pack/modules/12_orders.md#e0504). Complete every clause below before closing this section in the ledger.

- [ ] **e0504-c001** [prose, lines 1538-1538](../development-pack/modules/12_orders.md#L1538) -- Source evidence. SHA-256: 68f6f082c58b9909048c938c55ab13fc46d229334fad46fa88aeaf7a1febbbf6.
- [ ] **e0504-c002** [source-code reference, lines 1540-1594](../development-pack/modules/12_orders.md#L1540) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0505: `app/Enums/PaymentMethod.php`

Source: [exact contract](../development-pack/modules/12_orders.md#e0505). Complete every clause below before closing this section in the ledger.

- [ ] **e0505-c001** [prose, lines 1604-1604](../development-pack/modules/12_orders.md#L1604) -- Source evidence. SHA-256: bb7e43d4e204e89961cc5f5cb5ee72a1ca578d8e14e468aea5f4653372a6ecf6.
- [ ] **e0505-c002** [source-code reference, lines 1606-1643](../development-pack/modules/12_orders.md#L1606) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0506: `app/Enums/PaymentStatus.php`

Source: [exact contract](../development-pack/modules/12_orders.md#e0506). Complete every clause below before closing this section in the ledger.

- [ ] **e0506-c001** [prose, lines 1653-1653](../development-pack/modules/12_orders.md#L1653) -- Source evidence. SHA-256: 13da24664382b842de5237d815c3caeb1bb8b4b54a3ae947f510d499e4359eec.
- [ ] **e0506-c002** [source-code reference, lines 1655-1718](../development-pack/modules/12_orders.md#L1655) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0507: `app/Enums/PaymentType.php`

Source: [exact contract](../development-pack/modules/12_orders.md#e0507). Complete every clause below before closing this section in the ledger.

- [ ] **e0507-c001** [prose, lines 1728-1728](../development-pack/modules/12_orders.md#L1728) -- Source evidence. SHA-256: a0b4c864375318155e79a5c8c9d9019ce65486a71ccf5c35a999bddc0e93c1ae.
- [ ] **e0507-c002** [source-code reference, lines 1730-1754](../development-pack/modules/12_orders.md#L1730) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/13_customers.md

### e0176: resources/js/Pages/Customers/Create.vue

Source: [exact contract](../development-pack/modules/13_customers.md#e0176). Complete every clause below before closing this section in the ledger.

- [ ] **e0176-c001** [prose, lines 92-92](../development-pack/modules/13_customers.md#L92) -- Source: resources/js/Pages/Customers/Create.vue:1.
- [ ] **e0176-c002** [prose, lines 95-95](../development-pack/modules/13_customers.md#L95) -- **Named routes referenced:** customers.index, customers.store.
- [ ] **e0176-c003** [prose, lines 98-98](../development-pack/modules/13_customers.md#L98) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0176-c004** [prose, lines 101-101](../development-pack/modules/13_customers.md#L101) -- **Sections / displayed fields / table columns:**
- [ ] **e0176-c005** [statement, lines 103-103](../development-pack/modules/13_customers.md#L103) -- - h3: Basic Information (L96)
- [ ] **e0176-c006** [statement, lines 104-104](../development-pack/modules/13_customers.md#L104) -- - h3: Billing Address (L140)
- [ ] **e0176-c007** [statement, lines 105-105](../development-pack/modules/13_customers.md#L105) -- - h3: Shipping Address (L179)
- [ ] **e0176-c008** [statement, lines 106-106](../development-pack/modules/13_customers.md#L106) -- - h3: Business Details (L222)
- [ ] **e0176-c009** [prose, lines 109-109](../development-pack/modules/13_customers.md#L109) -- **UI state/filter defaults:**
- [ ] **e0176-c010** [source-code reference, lines 111-113](../development-pack/modules/13_customers.md#L111) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0176-c011** [table row, lines 116-116](../development-pack/modules/13_customers.md#L116) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0176-c012** [table row, lines 119-119](../development-pack/modules/13_customers.md#L119) -- form.name  /  Customer Name *  /  input / text  /  HTML required  /  —  /  resources/js/Pages/Customers/Create.vue:101
- [ ] **e0176-c013** [table row, lines 121-121](../development-pack/modules/13_customers.md#L121) -- form.code  /  Customer Code  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:107
- [ ] **e0176-c014** [table row, lines 123-123](../development-pack/modules/13_customers.md#L123) -- form.company_name  /  Company Name  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:113
- [ ] **e0176-c015** [table row, lines 125-125](../development-pack/modules/13_customers.md#L125) -- form.contact_name  /  Contact Person  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:119
- [ ] **e0176-c016** [table row, lines 127-127](../development-pack/modules/13_customers.md#L127) -- form.email  /  Email  /  input / email  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:125
- [ ] **e0176-c017** [table row, lines 129-129](../development-pack/modules/13_customers.md#L129) -- form.phone  /  Phone  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:131
- [ ] **e0176-c018** [table row, lines 131-131](../development-pack/modules/13_customers.md#L131) -- form.billing_address  /  Street Address  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:145
- [ ] **e0176-c019** [table row, lines 133-133](../development-pack/modules/13_customers.md#L133) -- form.billing_city  /  City  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:151
- [ ] **e0176-c020** [table row, lines 135-135](../development-pack/modules/13_customers.md#L135) -- form.billing_state  /  State/Province  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:157
- [ ] **e0176-c021** [table row, lines 137-137](../development-pack/modules/13_customers.md#L137) -- form.billing_zip_code  /  ZIP/Postal Code  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:163
- [ ] **e0176-c022** [table row, lines 139-139](../development-pack/modules/13_customers.md#L139) -- form.billing_country  /  Country  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:169
- [ ] **e0176-c023** [table row, lines 141-141](../development-pack/modules/13_customers.md#L141) -- sameAsShipping  /  Same as billing  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:181
- [ ] **e0176-c024** [table row, lines 143-143](../development-pack/modules/13_customers.md#L143) -- form.shipping_address  /  Street Address  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Create.vue:189
- [ ] **e0176-c025** [table row, lines 145-145](../development-pack/modules/13_customers.md#L145) -- form.shipping_city  /  City  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Create.vue:195
- [ ] **e0176-c026** [table row, lines 147-147](../development-pack/modules/13_customers.md#L147) -- form.shipping_state  /  State/Province  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Create.vue:201
- [ ] **e0176-c027** [table row, lines 149-149](../development-pack/modules/13_customers.md#L149) -- form.shipping_zip_code  /  ZIP/Postal Code  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Create.vue:207
- [ ] **e0176-c028** [table row, lines 151-151](../development-pack/modules/13_customers.md#L151) -- form.shipping_country  /  Country  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Create.vue:213
- [ ] **e0176-c029** [table row, lines 153-153](../development-pack/modules/13_customers.md#L153) -- form.tax_id  /  Tax ID / VAT Number  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:227
- [ ] **e0176-c030** [table row, lines 155-155](../development-pack/modules/13_customers.md#L155) -- form.payment_terms  /  Payment Terms  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:233
- [ ] **e0176-c031** [table row, lines 157-157](../development-pack/modules/13_customers.md#L157) -- form.credit_limit  /  Credit Limit  /  input / number  /  min=0; step=0.01  /  —  /  resources/js/Pages/Customers/Create.vue:239
- [ ] **e0176-c032** [table row, lines 159-159](../development-pack/modules/13_customers.md#L159) -- form.currency  /  Currency  /  CurrencySelect  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:245
- [ ] **e0176-c033** [table row, lines 161-161](../development-pack/modules/13_customers.md#L161) -- form.notes  /  Notes  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:251
- [ ] **e0176-c034** [table row, lines 163-163](../development-pack/modules/13_customers.md#L163) -- form.is_active  /  Active  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Create.vue:257
- [ ] **e0176-c035** [prose, lines 166-166](../development-pack/modules/13_customers.md#L166) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/Customers/Create.vue:20
- [ ] **e0176-c036** [source-code reference, lines 168-195](../development-pack/modules/13_customers.md#L168) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0176-c037** [table row, lines 199-199](../development-pack/modules/13_customers.md#L199) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0176-c038** [table row, lines 202-202](../development-pack/modules/13_customers.md#L202) -- Workspace  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Create.vue:74
- [ ] **e0176-c039** [table row, lines 204-204](../development-pack/modules/13_customers.md#L204) -- Customers  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Create.vue:76
- [ ] **e0176-c040** [table row, lines 206-206](../development-pack/modules/13_customers.md#L206) -- Back to Customers  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Create.vue:84
- [ ] **e0176-c041** [table row, lines 208-208](../development-pack/modules/13_customers.md#L208) -- Cancel  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Create.vue:269
- [ ] **e0176-c042** [table row, lines 210-210](../development-pack/modules/13_customers.md#L210) -- Create Customer  /  type=submit; :loading=form.processing; :disabled=form.processing  /  resources/js/Pages/Customers/Create.vue:270
- [ ] **e0176-c043** [prose, lines 213-213](../development-pack/modules/13_customers.md#L213) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0176-c044** [source-code reference, lines 215-217](../development-pack/modules/13_customers.md#L215) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0177: resources/js/Pages/Customers/Edit.vue

Source: [exact contract](../development-pack/modules/13_customers.md#e0177). Complete every clause below before closing this section in the ledger.

- [ ] **e0177-c001** [prose, lines 228-228](../development-pack/modules/13_customers.md#L228) -- Source: resources/js/Pages/Customers/Edit.vue:1.
- [ ] **e0177-c002** [prose, lines 231-231](../development-pack/modules/13_customers.md#L231) -- **Named routes referenced:** customers.index, customers.show, customers.update.
- [ ] **e0177-c003** [prose, lines 234-234](../development-pack/modules/13_customers.md#L234) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0177-c004** [prose, lines 237-237](../development-pack/modules/13_customers.md#L237) -- **Sections / displayed fields / table columns:**
- [ ] **e0177-c005** [statement, lines 239-239](../development-pack/modules/13_customers.md#L239) -- - h3: Basic Information (L112)
- [ ] **e0177-c006** [statement, lines 240-240](../development-pack/modules/13_customers.md#L240) -- - h3: Billing Address (L151)
- [ ] **e0177-c007** [statement, lines 241-241](../development-pack/modules/13_customers.md#L241) -- - h3: Shipping Address (L182)
- [ ] **e0177-c008** [statement, lines 242-242](../development-pack/modules/13_customers.md#L242) -- - h3: Business Details (L216)
- [ ] **e0177-c009** [prose, lines 245-245](../development-pack/modules/13_customers.md#L245) -- **UI state/filter defaults:**
- [ ] **e0177-c010** [source-code reference, lines 247-249](../development-pack/modules/13_customers.md#L247) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0177-c011** [table row, lines 252-252](../development-pack/modules/13_customers.md#L252) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0177-c012** [table row, lines 255-255](../development-pack/modules/13_customers.md#L255) -- form.name  /  Customer Name *  /  input / text  /  HTML required  /  —  /  resources/js/Pages/Customers/Edit.vue:117
- [ ] **e0177-c013** [table row, lines 257-257](../development-pack/modules/13_customers.md#L257) -- form.code  /  Customer Code  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:122
- [ ] **e0177-c014** [table row, lines 259-259](../development-pack/modules/13_customers.md#L259) -- form.company_name  /  Company Name  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:127
- [ ] **e0177-c015** [table row, lines 261-261](../development-pack/modules/13_customers.md#L261) -- form.contact_name  /  Contact Person  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:132
- [ ] **e0177-c016** [table row, lines 263-263](../development-pack/modules/13_customers.md#L263) -- form.email  /  Email  /  input / email  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:137
- [ ] **e0177-c017** [table row, lines 265-265](../development-pack/modules/13_customers.md#L265) -- form.phone  /  Phone  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:142
- [ ] **e0177-c018** [table row, lines 267-267](../development-pack/modules/13_customers.md#L267) -- form.billing_address  /  Street Address  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:156
- [ ] **e0177-c019** [table row, lines 269-269](../development-pack/modules/13_customers.md#L269) -- form.billing_city  /  City  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:161
- [ ] **e0177-c020** [table row, lines 271-271](../development-pack/modules/13_customers.md#L271) -- form.billing_state  /  State/Province  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:165
- [ ] **e0177-c021** [table row, lines 273-273](../development-pack/modules/13_customers.md#L273) -- form.billing_zip_code  /  ZIP/Postal Code  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:169
- [ ] **e0177-c022** [table row, lines 275-275](../development-pack/modules/13_customers.md#L275) -- form.billing_country  /  Country  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:173
- [ ] **e0177-c023** [table row, lines 277-277](../development-pack/modules/13_customers.md#L277) -- sameAsShipping  /  Same as billing  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:184
- [ ] **e0177-c024** [table row, lines 279-279](../development-pack/modules/13_customers.md#L279) -- form.shipping_address  /  Street Address  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Edit.vue:192
- [ ] **e0177-c025** [table row, lines 281-281](../development-pack/modules/13_customers.md#L281) -- form.shipping_city  /  City  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Edit.vue:196
- [ ] **e0177-c026** [table row, lines 283-283](../development-pack/modules/13_customers.md#L283) -- form.shipping_state  /  State/Province  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Edit.vue:200
- [ ] **e0177-c027** [table row, lines 285-285](../development-pack/modules/13_customers.md#L285) -- form.shipping_zip_code  /  ZIP/Postal Code  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Edit.vue:204
- [ ] **e0177-c028** [table row, lines 287-287](../development-pack/modules/13_customers.md#L287) -- form.shipping_country  /  Country  /  input / text  /  :disabled=sameAsShipping  /  —  /  resources/js/Pages/Customers/Edit.vue:208
- [ ] **e0177-c029** [table row, lines 289-289](../development-pack/modules/13_customers.md#L289) -- form.tax_id  /  Tax ID / VAT Number  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:221
- [ ] **e0177-c030** [table row, lines 291-291](../development-pack/modules/13_customers.md#L291) -- form.payment_terms  /  Payment Terms  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:225
- [ ] **e0177-c031** [table row, lines 293-293](../development-pack/modules/13_customers.md#L293) -- form.credit_limit  /  Credit Limit  /  input / number  /  min=0; step=0.01  /  —  /  resources/js/Pages/Customers/Edit.vue:229
- [ ] **e0177-c032** [table row, lines 295-295](../development-pack/modules/13_customers.md#L295) -- form.currency  /  Currency  /  CurrencySelect  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:233
- [ ] **e0177-c033** [table row, lines 297-297](../development-pack/modules/13_customers.md#L297) -- form.notes  /  Notes  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:237
- [ ] **e0177-c034** [table row, lines 299-299](../development-pack/modules/13_customers.md#L299) -- form.is_active  /  Active  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Edit.vue:241
- [ ] **e0177-c035** [prose, lines 302-302](../development-pack/modules/13_customers.md#L302) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/Customers/Edit.vue:24
- [ ] **e0177-c036** [source-code reference, lines 304-331](../development-pack/modules/13_customers.md#L304) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0177-c037** [table row, lines 335-335](../development-pack/modules/13_customers.md#L335) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0177-c038** [table row, lines 338-338](../development-pack/modules/13_customers.md#L338) -- Workspace  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Edit.vue:86
- [ ] **e0177-c039** [table row, lines 340-340](../development-pack/modules/13_customers.md#L340) -- Customers  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Edit.vue:88
- [ ] **e0177-c040** [table row, lines 342-342](../development-pack/modules/13_customers.md#L342) -- Back to Customers  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Edit.vue:96
- [ ] **e0177-c041** [table row, lines 344-344](../development-pack/modules/13_customers.md#L344) -- View  /  :href=route('customers.show', props.customer.id)  /  resources/js/Pages/Customers/Edit.vue:100
- [ ] **e0177-c042** [table row, lines 346-346](../development-pack/modules/13_customers.md#L346) -- Cancel  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Edit.vue:253
- [ ] **e0177-c043** [table row, lines 348-348](../development-pack/modules/13_customers.md#L348) -- Update Customer  /  type=submit; :loading=form.processing; :disabled=form.processing  /  resources/js/Pages/Customers/Edit.vue:254
- [ ] **e0177-c044** [prose, lines 351-351](../development-pack/modules/13_customers.md#L351) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0177-c045** [source-code reference, lines 353-355](../development-pack/modules/13_customers.md#L353) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0178: resources/js/Pages/Customers/Index.vue

Source: [exact contract](../development-pack/modules/13_customers.md#e0178). Complete every clause below before closing this section in the ledger.

- [ ] **e0178-c001** [prose, lines 366-366](../development-pack/modules/13_customers.md#L366) -- Source: resources/js/Pages/Customers/Index.vue:1.
- [ ] **e0178-c002** [prose, lines 369-369](../development-pack/modules/13_customers.md#L369) -- **Named routes referenced:** customers.create, customers.destroy, customers.edit, customers.index, customers.show.
- [ ] **e0178-c003** [prose, lines 372-372](../development-pack/modules/13_customers.md#L372) -- **Permission/route-capability checks:** customers.create, customers.edit, delete_customers.
- [ ] **e0178-c004** [prose, lines 375-375](../development-pack/modules/13_customers.md#L375) -- **Sections / displayed fields / table columns:**
- [ ] **e0178-c005** [statement, lines 377-377](../development-pack/modules/13_customers.md#L377) -- - th: Name (L103)
- [ ] **e0178-c006** [statement, lines 378-378](../development-pack/modules/13_customers.md#L378) -- - th: Company (L104)
- [ ] **e0178-c007** [statement, lines 379-379](../development-pack/modules/13_customers.md#L379) -- - th: Email (L105)
- [ ] **e0178-c008** [statement, lines 380-380](../development-pack/modules/13_customers.md#L380) -- - th: Phone (L106)
- [ ] **e0178-c009** [statement, lines 381-381](../development-pack/modules/13_customers.md#L381) -- - th: Orders (L107)
- [ ] **e0178-c010** [statement, lines 382-382](../development-pack/modules/13_customers.md#L382) -- - th: Status (L108)
- [ ] **e0178-c011** [statement, lines 383-383](../development-pack/modules/13_customers.md#L383) -- - th: Actions (L109)
- [ ] **e0178-c012** [prose, lines 386-386](../development-pack/modules/13_customers.md#L386) -- **UI state/filter defaults:**
- [ ] **e0178-c013** [source-code reference, lines 388-390](../development-pack/modules/13_customers.md#L388) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0178-c014** [table row, lines 393-393](../development-pack/modules/13_customers.md#L393) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0178-c015** [table row, lines 396-396](../development-pack/modules/13_customers.md#L396) -- search  /  Search Customers  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Customers/Index.vue:80
- [ ] **e0178-c016** [table row, lines 399-399](../development-pack/modules/13_customers.md#L399) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0178-c017** [table row, lines 402-402](../development-pack/modules/13_customers.md#L402) -- Add Customer  /  v-if=canVisit('customers.create'); :href=route('customers.create')  /  resources/js/Pages/Customers/Index.vue:65
- [ ] **e0178-c018** [table row, lines 404-404](../development-pack/modules/13_customers.md#L404) -- Search  /  type=submit  /  resources/js/Pages/Customers/Index.vue:81
- [ ] **e0178-c019** [table row, lines 406-406](../development-pack/modules/13_customers.md#L406) -- Search  /  type=submit  /  resources/js/Pages/Customers/Index.vue:89
- [ ] **e0178-c020** [table row, lines 408-408](../development-pack/modules/13_customers.md#L408) -- Clear  /  type=button; @click=clearFilters  /  resources/js/Pages/Customers/Index.vue:93
- [ ] **e0178-c021** [table row, lines 410-410](../development-pack/modules/13_customers.md#L410) -- Add Customer  /  v-if=canVisit('customers.create'); :href=route('customers.create')  /  resources/js/Pages/Customers/Index.vue:119
- [ ] **e0178-c022** [table row, lines 412-412](../development-pack/modules/13_customers.md#L412) -- Icon action  /  :href=route('customers.show', customer.id)  /  resources/js/Pages/Customers/Index.vue:151
- [ ] **e0178-c023** [table row, lines 414-414](../development-pack/modules/13_customers.md#L414) -- Icon action  /  v-if=canVisit('customers.edit'); :href=route('customers.edit', customer.id)  /  resources/js/Pages/Customers/Index.vue:152
- [ ] **e0178-c024** [table row, lines 416-416](../development-pack/modules/13_customers.md#L416) -- Icon action  /  v-if=hasPermission('delete_customers'); @click=deleteCustomer(customer)  /  resources/js/Pages/Customers/Index.vue:153
- [ ] **e0178-c025** [prose, lines 419-419](../development-pack/modules/13_customers.md#L419) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0178-c026** [source-code reference, lines 421-433](../development-pack/modules/13_customers.md#L421) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0179: resources/js/Pages/Customers/Show.vue

Source: [exact contract](../development-pack/modules/13_customers.md#e0179). Complete every clause below before closing this section in the ledger.

- [ ] **e0179-c001** [prose, lines 444-444](../development-pack/modules/13_customers.md#L444) -- Source: resources/js/Pages/Customers/Show.vue:1.
- [ ] **e0179-c002** [prose, lines 447-447](../development-pack/modules/13_customers.md#L447) -- **Named routes referenced:** customers.contacts.destroy, customers.contacts.resend, customers.contacts.store, customers.destroy, customers.edit, customers.index, orders.show.
- [ ] **e0179-c003** [prose, lines 450-450](../development-pack/modules/13_customers.md#L450) -- **Permission/route-capability checks:** customers.edit, orders.show.
- [ ] **e0179-c004** [prose, lines 453-453](../development-pack/modules/13_customers.md#L453) -- **Sections / displayed fields / table columns:**
- [ ] **e0179-c005** [statement, lines 455-455](../development-pack/modules/13_customers.md#L455) -- - h3: Basic Information (L166)
- [ ] **e0179-c006** [statement, lines 456-456](../development-pack/modules/13_customers.md#L456) -- - dt: Customer Name (L170)
- [ ] **e0179-c007** [statement, lines 457-457](../development-pack/modules/13_customers.md#L457) -- - dt: Company Name (L174)
- [ ] **e0179-c008** [statement, lines 458-458](../development-pack/modules/13_customers.md#L458) -- - dt: Contact Person (L178)
- [ ] **e0179-c009** [statement, lines 459-459](../development-pack/modules/13_customers.md#L459) -- - dt: Email (L182)
- [ ] **e0179-c010** [statement, lines 460-460](../development-pack/modules/13_customers.md#L460) -- - dt: Phone (L191)
- [ ] **e0179-c011** [statement, lines 461-461](../development-pack/modules/13_customers.md#L461) -- - h3: Billing Address (L202)
- [ ] **e0179-c012** [statement, lines 462-462](../development-pack/modules/13_customers.md#L462) -- - h3: Shipping Address (L219)
- [ ] **e0179-c013** [statement, lines 463-463](../development-pack/modules/13_customers.md#L463) -- - h3: Recent Orders (L237)
- [ ] **e0179-c014** [statement, lines 464-464](../development-pack/modules/13_customers.md#L464) -- - th: Order Number (L243)
- [ ] **e0179-c015** [statement, lines 465-465](../development-pack/modules/13_customers.md#L465) -- - th: Order Date (L244)
- [ ] **e0179-c016** [statement, lines 466-466](../development-pack/modules/13_customers.md#L466) -- - th: Status (L245)
- [ ] **e0179-c017** [statement, lines 467-467](../development-pack/modules/13_customers.md#L467) -- - th: Total (L246)
- [ ] **e0179-c018** [statement, lines 468-468](../development-pack/modules/13_customers.md#L468) -- - th: Actions (L247)
- [ ] **e0179-c019** [statement, lines 469-469](../development-pack/modules/13_customers.md#L469) -- - h3: Business Details (L293)
- [ ] **e0179-c020** [statement, lines 470-470](../development-pack/modules/13_customers.md#L470) -- - dt: Tax ID / VAT Number (L297)
- [ ] **e0179-c021** [statement, lines 471-471](../development-pack/modules/13_customers.md#L471) -- - dt: Payment Terms (L301)
- [ ] **e0179-c022** [statement, lines 472-472](../development-pack/modules/13_customers.md#L472) -- - dt: Credit Limit (L305)
- [ ] **e0179-c023** [statement, lines 473-473](../development-pack/modules/13_customers.md#L473) -- - dt: Currency (L311)
- [ ] **e0179-c024** [statement, lines 474-474](../development-pack/modules/13_customers.md#L474) -- - dt: Notes (L315)
- [ ] **e0179-c025** [statement, lines 475-475](../development-pack/modules/13_customers.md#L475) -- - h3: Portal access (L327)
- [ ] **e0179-c026** [statement, lines 476-476](../development-pack/modules/13_customers.md#L476) -- - h3: Danger Zone (L432)
- [ ] **e0179-c027** [prose, lines 479-479](../development-pack/modules/13_customers.md#L479) -- **UI state/filter defaults:**
- [ ] **e0179-c028** [source-code reference, lines 481-483](../development-pack/modules/13_customers.md#L481) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0179-c029** [table row, lines 486-486](../development-pack/modules/13_customers.md#L486) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0179-c030** [table row, lines 489-489](../development-pack/modules/13_customers.md#L489) -- inviteForm.name  /  Name  /  input / text  /  HTML required; maxlength=255  /  —  /  resources/js/Pages/Customers/Show.vue:348
- [ ] **e0179-c031** [table row, lines 491-491](../development-pack/modules/13_customers.md#L491) -- inviteForm.email  /  Email  /  input / email  /  HTML required; maxlength=255  /  —  /  resources/js/Pages/Customers/Show.vue:360
- [ ] **e0179-c032** [prose, lines 494-494](../development-pack/modules/13_customers.md#L494) -- **Exact inviteForm defaults / hydration / hidden payload** — resources/js/Pages/Customers/Show.vue:55
- [ ] **e0179-c033** [source-code reference, lines 496-499](../development-pack/modules/13_customers.md#L496) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0179-c034** [table row, lines 503-503](../development-pack/modules/13_customers.md#L503) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0179-c035** [table row, lines 506-506](../development-pack/modules/13_customers.md#L506) -- Workspace  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Show.vue:111
- [ ] **e0179-c036** [table row, lines 508-508](../development-pack/modules/13_customers.md#L508) -- Customers  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Show.vue:113
- [ ] **e0179-c037** [table row, lines 510-510](../development-pack/modules/13_customers.md#L510) -- Edit  /  v-if=canVisit('customers.edit'); :href=route('customers.edit', customer.id)  /  resources/js/Pages/Customers/Show.vue:128
- [ ] **e0179-c038** [table row, lines 512-512](../development-pack/modules/13_customers.md#L512) -- Back to Customers  /  :href=route('customers.index')  /  resources/js/Pages/Customers/Show.vue:132
- [ ] **e0179-c039** [table row, lines 514-514](../development-pack/modules/13_customers.md#L514) -- order.order_number  /  v-if=canVisit('orders.show'); :href=route('orders.show', order.id)  /  resources/js/Pages/Customers/Show.vue:257
- [ ] **e0179-c040** [table row, lines 516-516](../development-pack/modules/13_customers.md#L516) -- View  /  v-if=canVisit('orders.show'); :href=route('orders.show', order.id)  /  resources/js/Pages/Customers/Show.vue:273
- [ ] **e0179-c041** [table row, lines 518-518](../development-pack/modules/13_customers.md#L518) -- Invite contact  /  v-if=portal.enabled &amp;&amp; portal.canManageContacts &amp;&amp; !showInvite; @click=showInvite = true  /  resources/js/Pages/Customers/Show.vue:330
- [ ] **e0179-c042** [table row, lines 520-520](../development-pack/modules/13_customers.md#L520) -- Cancel  /  @click=cancelInvite  /  resources/js/Pages/Customers/Show.vue:371
- [ ] **e0179-c043** [table row, lines 522-522](../development-pack/modules/13_customers.md#L522) -- Send invitation  /  type=submit; :loading=inviteForm.processing; :disabled=inviteForm.processing  /  resources/js/Pages/Customers/Show.vue:374
- [ ] **e0179-c044** [table row, lines 524-524](../development-pack/modules/13_customers.md#L524) -- Resend invitation  /  v-if=portal.enabled &amp;&amp; contact.status !== 'active'; @click=resendInvite(contact)  /  resources/js/Pages/Customers/Show.vue:394
- [ ] **e0179-c045** [table row, lines 526-526](../development-pack/modules/13_customers.md#L526) -- Revoke access  /  v-if=contact.status !== 'revoked'; @click=revokeContact(contact)  /  resources/js/Pages/Customers/Show.vue:403
- [ ] **e0179-c046** [table row, lines 528-528](../development-pack/modules/13_customers.md#L528) -- Delete Customer  /  @click=deleteCustomer  /  resources/js/Pages/Customers/Show.vue:434
- [ ] **e0179-c047** [prose, lines 531-531](../development-pack/modules/13_customers.md#L531) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0179-c048** [source-code reference, lines 533-555](../development-pack/modules/13_customers.md#L533) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0202: resources/js/Components/CustomerPicker.vue

Source: [exact contract](../development-pack/modules/13_customers.md#e0202). Complete every clause below before closing this section in the ledger.

- [ ] **e0202-c001** [prose, lines 566-566](../development-pack/modules/13_customers.md#L566) -- Source: resources/js/Components/CustomerPicker.vue:1.
- [ ] **e0202-c002** [prose, lines 569-569](../development-pack/modules/13_customers.md#L569) -- **Named routes referenced:** orders.customer-lookup.
- [ ] **e0202-c003** [prose, lines 572-572](../development-pack/modules/13_customers.md#L572) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0202-c004** [prose, lines 575-575](../development-pack/modules/13_customers.md#L575) -- **UI state/filter defaults:**
- [ ] **e0202-c005** [source-code reference, lines 577-583](../development-pack/modules/13_customers.md#L577) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0202-c006** [table row, lines 586-586](../development-pack/modules/13_customers.md#L586) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0202-c007** [table row, lines 589-589](../development-pack/modules/13_customers.md#L589) -- query  /  Saved customer  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Components/CustomerPicker.vue:112
- [ ] **e0202-c008** [table row, lines 592-592](../development-pack/modules/13_customers.md#L592) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0202-c009** [table row, lines 595-595](../development-pack/modules/13_customers.md#L595) -- Use a one-off customer  /  type=button; @click=emit('clear')  /  resources/js/Components/CustomerPicker.vue:101
- [ ] **e0202-c010** [prose, lines 598-598](../development-pack/modules/13_customers.md#L598) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0202-c011** [source-code reference, lines 600-604](../development-pack/modules/13_customers.md#L600) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0211: StoreCustomerRequest.php

Source: [exact contract](../development-pack/modules/13_customers.md#e0211). Complete every clause below before closing this section in the ledger.

- [ ] **e0211-c001** [prose, lines 615-615](../development-pack/modules/13_customers.md#L615) -- app/Http/Requests/Customer/StoreCustomerRequest.php:1
- [ ] **e0211-c002** [source-code reference, lines 617-658](../development-pack/modules/13_customers.md#L617) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0212: UpdateCustomerRequest.php

Source: [exact contract](../development-pack/modules/13_customers.md#e0212). Complete every clause below before closing this section in the ledger.

- [ ] **e0212-c001** [prose, lines 669-669](../development-pack/modules/13_customers.md#L669) -- app/Http/Requests/Customer/UpdateCustomerRequest.php:1
- [ ] **e0212-c002** [source-code reference, lines 671-712](../development-pack/modules/13_customers.md#L671) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0234: app/Models/Customer.php

Source: [exact contract](../development-pack/modules/13_customers.md#e0234). Complete every clause below before closing this section in the ledger.

- [ ] **e0234-c001** [prose, lines 723-723](../development-pack/modules/13_customers.md#L723) -- app/Models/Customer.php:1
- [ ] **e0234-c002** [source-code reference, lines 726-753](../development-pack/modules/13_customers.md#L726) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0234-c003** [source-code reference, lines 756-763](../development-pack/modules/13_customers.md#L756) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0235: app/Models/CustomerContact.php

Source: [exact contract](../development-pack/modules/13_customers.md#e0235). Complete every clause below before closing this section in the ledger.

- [ ] **e0235-c001** [prose, lines 774-774](../development-pack/modules/13_customers.md#L774) -- app/Models/CustomerContact.php:1
- [ ] **e0235-c002** [source-code reference, lines 777-790](../development-pack/modules/13_customers.md#L777) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0235-c003** [source-code reference, lines 793-797](../development-pack/modules/13_customers.md#L793) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/14_returns.md

### e0170: Returns/RMA

Source: [exact contract](../development-pack/modules/14_returns.md#e0170). Complete every clause below before closing this section in the ledger.

- [ ] **e0170-c001** [prose, lines 94-94](../development-pack/modules/14_returns.md#L94) -- Select eligible order → choose lines → pending → approve → received → completed; only pending may reject. Type return or exchange. Exchange type does not by itself prove a new replacement sa...
- [ ] **e0170-c002** [statement, lines 96-96](../development-pack/modules/14_returns.md#L96) -- - order_id is supplied by selected order; type defaults return; reason required max1000; notes optional max2000.
- [ ] **e0170-c003** [statement, lines 97-97](../development-pack/modules/14_returns.md#L97) -- - Each source order line has hidden order_item_id/product_id and displayed name/variant/SKU/ordered/already-returned/returnable. Checkbox selected=false, quantity0, condition=new, restock=tr...
- [ ] **e0170-c004** [statement, lines 98-98](../development-pack/modules/14_returns.md#L98) -- - Quantity 1..server returnable, no duplicate order_item_id; condition new/used/damaged; restock boolean required. Server verifies shipped coverage, prior claims and real order-line/product ...
- [ ] **e0170-c005** [statement, lines 99-99](../development-pack/modules/14_returns.md#L99) -- - Estimated refund uses discounted line paid net and prior refunds/balance; server total authoritative. Show edits only condition/restock before receive (pending/approved); edit request max5...
- [ ] **e0170-c006** [statement, lines 100-100](../development-pack/modules/14_returns.md#L100) -- - **Receive restocks marked lines**, including variant/bin/tracking release, under lock and rechecks shipped quantities. Complete sets completed/processor/time but **does not record payment ...
- [ ] **e0170-c007** [prose, lines 102-102](../development-pack/modules/14_returns.md#L102) -- Evidence: return lines, receive, receive recheck, complete.

### e0193: resources/js/Pages/Returns/Create.vue

Source: [exact contract](../development-pack/modules/14_returns.md#e0193). Complete every clause below before closing this section in the ledger.

- [ ] **e0193-c001** [prose, lines 112-112](../development-pack/modules/14_returns.md#L112) -- Source: resources/js/Pages/Returns/Create.vue:1.
- [ ] **e0193-c002** [prose, lines 115-115](../development-pack/modules/14_returns.md#L115) -- **Named routes referenced:** orders.index, orders.show, returns.index, returns.store.
- [ ] **e0193-c003** [prose, lines 118-118](../development-pack/modules/14_returns.md#L118) -- **Permission/route-capability checks:** orders.show.
- [ ] **e0193-c004** [prose, lines 121-121](../development-pack/modules/14_returns.md#L121) -- **Sections / displayed fields / table columns:**
- [ ] **e0193-c005** [statement, lines 123-123](../development-pack/modules/14_returns.md#L123) -- - h3: Return Details (L142)
- [ ] **e0193-c006** [statement, lines 124-124](../development-pack/modules/14_returns.md#L124) -- - h3: Select Items to Return (L180)
- [ ] **e0193-c007** [table row, lines 127-127](../development-pack/modules/14_returns.md#L127) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0193-c008** [table row, lines 130-130](../development-pack/modules/14_returns.md#L130) -- form.type  /  Type  /  select  /  No extra control attribute; server rules below  /  return: Return (Refund); exchange: Exchange  /  resources/js/Pages/Returns/Create.vue:147
- [ ] **e0193-c009** [table row, lines 132-132](../development-pack/modules/14_returns.md#L132) -- form.reason  /  Reason *  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Returns/Create.vue:157
- [ ] **e0193-c010** [table row, lines 134-134](../development-pack/modules/14_returns.md#L134) -- form.notes  /  Notes (optional)  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Returns/Create.vue:168
- [ ] **e0193-c011** [table row, lines 136-136](../development-pack/modules/14_returns.md#L136) -- item.selected  /  item.product_name  /  input / checkbox  /  :disabled=maxReturnable(item) &lt;= 0; @change=toggleItem(item)  /  —  /  resources/js/Pages/Returns/Create.vue:191
- [ ] **e0193-c012** [table row, lines 138-138](../development-pack/modules/14_returns.md#L138) -- item.quantity  /  Qty  /  input / number  /  :min=1; :max=maxReturnable(item)  /  —  /  resources/js/Pages/Returns/Create.vue:218
- [ ] **e0193-c013** [table row, lines 140-140](../development-pack/modules/14_returns.md#L140) -- item.condition  /  Condition  /  select  /  @change=updateCondition(item)  /  new: New (Unopened); used: Used (Opened); damaged: Damaged  /  resources/js/Pages/Returns/Create.vue:230
- [ ] **e0193-c014** [table row, lines 142-142](../development-pack/modules/14_returns.md#L142) -- item.restock  /  Restock  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Returns/Create.vue:244
- [ ] **e0193-c015** [prose, lines 145-145](../development-pack/modules/14_returns.md#L145) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/Returns/Create.vue:34
- [ ] **e0193-c016** [source-code reference, lines 147-170](../development-pack/modules/14_returns.md#L147) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0193-c017** [table row, lines 174-174](../development-pack/modules/14_returns.md#L174) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0193-c018** [table row, lines 177-177](../development-pack/modules/14_returns.md#L177) -- Workspace  /  :href=route('orders.index')  /  resources/js/Pages/Returns/Create.vue:122
- [ ] **e0193-c019** [table row, lines 179-179](../development-pack/modules/14_returns.md#L179) -- Returns  /  :href=route('returns.index')  /  resources/js/Pages/Returns/Create.vue:124
- [ ] **e0193-c020** [table row, lines 181-181](../development-pack/modules/14_returns.md#L181) -- Back to Order  /  :href=backHref  /  resources/js/Pages/Returns/Create.vue:132
- [ ] **e0193-c021** [table row, lines 183-183](../development-pack/modules/14_returns.md#L183) -- Cancel  /  :href=backHref  /  resources/js/Pages/Returns/Create.vue:277
- [ ] **e0193-c022** [table row, lines 185-185](../development-pack/modules/14_returns.md#L185) -- form.processing ? Processing... : Submit Return Request  /  type=submit; :loading=form.processing; :disabled=form.processing \ / \ /  selectedItems.length === 0  /  resources/js/Pages/Return...
- [ ] **e0193-c023** [prose, lines 188-188](../development-pack/modules/14_returns.md#L188) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0193-c024** [source-code reference, lines 190-193](../development-pack/modules/14_returns.md#L190) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0194: resources/js/Pages/Returns/Index.vue

Source: [exact contract](../development-pack/modules/14_returns.md#e0194). Complete every clause below before closing this section in the ledger.

- [ ] **e0194-c001** [prose, lines 204-204](../development-pack/modules/14_returns.md#L204) -- Source: resources/js/Pages/Returns/Index.vue:1.
- [ ] **e0194-c002** [prose, lines 207-207](../development-pack/modules/14_returns.md#L207) -- **Named routes referenced:** orders.show, returns.create, returns.index, returns.show.
- [ ] **e0194-c003** [prose, lines 210-210](../development-pack/modules/14_returns.md#L210) -- **Permission/route-capability checks:** orders.show.
- [ ] **e0194-c004** [prose, lines 213-213](../development-pack/modules/14_returns.md#L213) -- **Sections / displayed fields / table columns:**
- [ ] **e0194-c005** [statement, lines 215-215](../development-pack/modules/14_returns.md#L215) -- - th: Return # (L135)
- [ ] **e0194-c006** [statement, lines 216-216](../development-pack/modules/14_returns.md#L216) -- - th: Order # (L136)
- [ ] **e0194-c007** [statement, lines 217-217](../development-pack/modules/14_returns.md#L217) -- - th: Type (L137)
- [ ] **e0194-c008** [statement, lines 218-218](../development-pack/modules/14_returns.md#L218) -- - th: Status (L138)
- [ ] **e0194-c009** [statement, lines 219-219](../development-pack/modules/14_returns.md#L219) -- - th: Items (L139)
- [ ] **e0194-c010** [statement, lines 220-220](../development-pack/modules/14_returns.md#L220) -- - th: Refund (L140)
- [ ] **e0194-c011** [statement, lines 221-221](../development-pack/modules/14_returns.md#L221) -- - th: Date (L141)
- [ ] **e0194-c012** [statement, lines 222-222](../development-pack/modules/14_returns.md#L222) -- - th: Actions (L142)
- [ ] **e0194-c013** [prose, lines 225-225](../development-pack/modules/14_returns.md#L225) -- **UI state/filter defaults:**
- [ ] **e0194-c014** [source-code reference, lines 227-231](../development-pack/modules/14_returns.md#L227) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0194-c015** [table row, lines 234-234](../development-pack/modules/14_returns.md#L234) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0194-c016** [table row, lines 237-237](../development-pack/modules/14_returns.md#L237) -- search  /  Search  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Returns/Index.vue:101
- [ ] **e0194-c017** [table row, lines 239-239](../development-pack/modules/14_returns.md#L239) -- statusFilter  /  Status  /  select  /  No extra control attribute; server rules below  /  : All Statuses; status: t(portal.statuses.${status}) &#91;repeat status in statuses&#93;  /  resources/js/Pa...
- [ ] **e0194-c018** [table row, lines 241-241](../development-pack/modules/14_returns.md#L241) -- typeFilter  /  Type  /  select  /  No extra control attribute; server rules below  /  : All Types; type: t(portal.returns.types.${type}) &#91;repeat type in types&#93;  /  resources/js/Pages/Returns...
- [ ] **e0194-c019** [table row, lines 244-244](../development-pack/modules/14_returns.md#L244) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0194-c020** [table row, lines 247-247](../development-pack/modules/14_returns.md#L247) -- New Return  /  :href=route('returns.create')  /  resources/js/Pages/Returns/Index.vue:86
- [ ] **e0194-c021** [table row, lines 249-249](../development-pack/modules/14_returns.md#L249) -- Search  /  type=submit  /  resources/js/Pages/Returns/Index.vue:102
- [ ] **e0194-c022** [table row, lines 251-251](../development-pack/modules/14_returns.md#L251) -- returnOrder.order.order_number  /  :href=route('orders.show', returnOrder.order_id)  /  resources/js/Pages/Returns/Index.vue:160
- [ ] **e0194-c023** [table row, lines 253-253](../development-pack/modules/14_returns.md#L253) -- Icon action  /  :href=route('returns.show', returnOrder.id)  /  resources/js/Pages/Returns/Index.vue:182
- [ ] **e0194-c024** [prose, lines 256-256](../development-pack/modules/14_returns.md#L256) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0194-c025** [source-code reference, lines 258-264](../development-pack/modules/14_returns.md#L258) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0195: resources/js/Pages/Returns/SelectOrder.vue

Source: [exact contract](../development-pack/modules/14_returns.md#e0195). Complete every clause below before closing this section in the ledger.

- [ ] **e0195-c001** [prose, lines 275-275](../development-pack/modules/14_returns.md#L275) -- Source: resources/js/Pages/Returns/SelectOrder.vue:1.
- [ ] **e0195-c002** [prose, lines 278-278](../development-pack/modules/14_returns.md#L278) -- **Named routes referenced:** returns.create, returns.index.
- [ ] **e0195-c003** [prose, lines 281-281](../development-pack/modules/14_returns.md#L281) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0195-c004** [prose, lines 284-284](../development-pack/modules/14_returns.md#L284) -- **Sections / displayed fields / table columns:**
- [ ] **e0195-c005** [statement, lines 286-286](../development-pack/modules/14_returns.md#L286) -- - th: Order # (L79)
- [ ] **e0195-c006** [statement, lines 287-287](../development-pack/modules/14_returns.md#L287) -- - th: Customer (L80)
- [ ] **e0195-c007** [statement, lines 288-288](../development-pack/modules/14_returns.md#L288) -- - th: Order date (L81)
- [ ] **e0195-c008** [statement, lines 289-289](../development-pack/modules/14_returns.md#L289) -- - th: Status (L82)
- [ ] **e0195-c009** [statement, lines 290-290](../development-pack/modules/14_returns.md#L290) -- - th: Total (L83)
- [ ] **e0195-c010** [statement, lines 291-291](../development-pack/modules/14_returns.md#L291) -- - th: Start return (L84)
- [ ] **e0195-c011** [prose, lines 294-294](../development-pack/modules/14_returns.md#L294) -- **UI state/filter defaults:**
- [ ] **e0195-c012** [source-code reference, lines 296-298](../development-pack/modules/14_returns.md#L296) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0195-c013** [table row, lines 301-301](../development-pack/modules/14_returns.md#L301) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0195-c014** [table row, lines 304-304](../development-pack/modules/14_returns.md#L304) -- search  /  Search  /  input / search  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Returns/SelectOrder.vue:64
- [ ] **e0195-c015** [table row, lines 307-307](../development-pack/modules/14_returns.md#L307) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0195-c016** [table row, lines 310-310](../development-pack/modules/14_returns.md#L310) -- Returns  /  :href=route('returns.index')  /  resources/js/Pages/Returns/SelectOrder.vue:45
- [ ] **e0195-c017** [table row, lines 312-312](../development-pack/modules/14_returns.md#L312) -- Back to Returns  /  :href=route('returns.index')  /  resources/js/Pages/Returns/SelectOrder.vue:53
- [ ] **e0195-c018** [table row, lines 314-314](../development-pack/modules/14_returns.md#L314) -- Start return  /  :href=route('returns.create', { order_id: order.id })  /  resources/js/Pages/Returns/SelectOrder.vue:110
- [ ] **e0195-c019** [prose, lines 317-317](../development-pack/modules/14_returns.md#L317) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0195-c020** [source-code reference, lines 319-324](../development-pack/modules/14_returns.md#L319) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0196: resources/js/Pages/Returns/Show.vue

Source: [exact contract](../development-pack/modules/14_returns.md#e0196). Complete every clause below before closing this section in the ledger.

- [ ] **e0196-c001** [prose, lines 335-335](../development-pack/modules/14_returns.md#L335) -- Source: resources/js/Pages/Returns/Show.vue:1.
- [ ] **e0196-c002** [prose, lines 338-338](../development-pack/modules/14_returns.md#L338) -- **Named routes referenced:** orders.show, returns.index, returns.items.update, returns.reject.
- [ ] **e0196-c003** [prose, lines 341-341](../development-pack/modules/14_returns.md#L341) -- **Permission/route-capability checks:** manage_returns, orders.show.
- [ ] **e0196-c004** [prose, lines 344-344](../development-pack/modules/14_returns.md#L344) -- **Sections / displayed fields / table columns:**
- [ ] **e0196-c005** [statement, lines 346-346](../development-pack/modules/14_returns.md#L346) -- - h3: Return Items (L185)
- [ ] **e0196-c006** [statement, lines 347-347](../development-pack/modules/14_returns.md#L347) -- - th: Product (L200)
- [ ] **e0196-c007** [statement, lines 348-348](../development-pack/modules/14_returns.md#L348) -- - th: SKU (L201)
- [ ] **e0196-c008** [statement, lines 349-349](../development-pack/modules/14_returns.md#L349) -- - th: Qty (L202)
- [ ] **e0196-c009** [statement, lines 350-350](../development-pack/modules/14_returns.md#L350) -- - th: Condition (L203)
- [ ] **e0196-c010** [statement, lines 351-351](../development-pack/modules/14_returns.md#L351) -- - th: Restock (L204)
- [ ] **e0196-c011** [statement, lines 352-352](../development-pack/modules/14_returns.md#L352) -- - h3: Details (L265)
- [ ] **e0196-c012** [statement, lines 353-353](../development-pack/modules/14_returns.md#L353) -- - dt: Reason (L269)
- [ ] **e0196-c013** [statement, lines 354-354](../development-pack/modules/14_returns.md#L354) -- - dt: Notes (L273)
- [ ] **e0196-c014** [statement, lines 355-355](../development-pack/modules/14_returns.md#L355) -- - dt: For Order (L277)
- [ ] **e0196-c015** [statement, lines 356-356](../development-pack/modules/14_returns.md#L356) -- - h3: Summary (L294)
- [ ] **e0196-c016** [statement, lines 357-357](../development-pack/modules/14_returns.md#L357) -- - dt: Return Number (L298)
- [ ] **e0196-c017** [statement, lines 358-358](../development-pack/modules/14_returns.md#L358) -- - dt: Type (L302)
- [ ] **e0196-c018** [statement, lines 359-359](../development-pack/modules/14_returns.md#L359) -- - dt: Status (L308)
- [ ] **e0196-c019** [statement, lines 360-360](../development-pack/modules/14_returns.md#L360) -- - dt: Created (L314)
- [ ] **e0196-c020** [statement, lines 361-361](../development-pack/modules/14_returns.md#L361) -- - dt: Completed (L318)
- [ ] **e0196-c021** [statement, lines 362-362](../development-pack/modules/14_returns.md#L362) -- - dt: Processed By (L322)
- [ ] **e0196-c022** [statement, lines 363-363](../development-pack/modules/14_returns.md#L363) -- - dt: Refund Amount (L327)
- [ ] **e0196-c023** [statement, lines 364-364](../development-pack/modules/14_returns.md#L364) -- - h3: Actions (L337)
- [ ] **e0196-c024** [statement, lines 365-365](../development-pack/modules/14_returns.md#L365) -- - h3: Danger Zone (L385)
- [ ] **e0196-c025** [statement, lines 366-366](../development-pack/modules/14_returns.md#L366) -- - h3: Reject Return (L405)
- [ ] **e0196-c026** [prose, lines 369-369](../development-pack/modules/14_returns.md#L369) -- **UI state/filter defaults:**
- [ ] **e0196-c027** [source-code reference, lines 371-377](../development-pack/modules/14_returns.md#L371) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0196-c028** [table row, lines 380-380](../development-pack/modules/14_returns.md#L380) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0196-c029** [table row, lines 383-383](../development-pack/modules/14_returns.md#L383) -- lineEdits&#91;item.id&#93;.condition  /  Condition {name}  /  select  /  v-if=editingLines &amp;&amp; lineEdits&#91;item.id&#93;  /  new: getConditionLabel('new'); used: getConditionLabel('used'); damaged: getCondi...
- [ ] **e0196-c030** [table row, lines 385-385](../development-pack/modules/14_returns.md#L385) -- lineEdits&#91;item.id&#93;.restock  /  Restock {name}  /  input / checkbox  /  v-if=editingLines &amp;&amp; lineEdits&#91;item.id&#93;  /  —  /  resources/js/Pages/Returns/Show.vue:239
- [ ] **e0196-c031** [table row, lines 387-387](../development-pack/modules/14_returns.md#L387) -- rejectNotes  /  Reason for rejection  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Returns/Show.vue:416
- [ ] **e0196-c032** [prose, lines 390-390](../development-pack/modules/14_returns.md#L390) -- **Exact lineEdits defaults / hydration / hidden payload** — resources/js/Pages/Returns/Show.vue:81
- [ ] **e0196-c033** [source-code reference, lines 392-395](../development-pack/modules/14_returns.md#L392) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0196-c034** [table row, lines 399-399](../development-pack/modules/14_returns.md#L399) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0196-c035** [table row, lines 402-402](../development-pack/modules/14_returns.md#L402) -- Workspace  /  :href=route('returns.index')  /  resources/js/Pages/Returns/Show.vue:112
- [ ] **e0196-c036** [table row, lines 404-404](../development-pack/modules/14_returns.md#L404) -- Returns  /  :href=route('returns.index')  /  resources/js/Pages/Returns/Show.vue:114
- [ ] **e0196-c037** [table row, lines 406-406](../development-pack/modules/14_returns.md#L406) -- Approve Return  /  v-if=returnOrder.status === 'pending'; :disabled=processing; @click=performAction('approve')  /  resources/js/Pages/Returns/Show.vue:129
- [ ] **e0196-c038** [table row, lines 408-408](../development-pack/modules/14_returns.md#L408) -- Mark as Received  /  v-if=returnOrder.status === 'approved'; :disabled=processing; @click=performAction('receive')  /  resources/js/Pages/Returns/Show.vue:139
- [ ] **e0196-c039** [table row, lines 410-410](../development-pack/modules/14_returns.md#L410) -- Complete Return  /  v-if=returnOrder.status === 'received'; :disabled=processing; @click=performAction('complete')  /  resources/js/Pages/Returns/Show.vue:149
- [ ] **e0196-c040** [table row, lines 412-412](../development-pack/modules/14_returns.md#L412) -- Reject Return  /  v-if=returnOrder.status === 'pending'; :disabled=processing; @click=showRejectModal = true  /  resources/js/Pages/Returns/Show.vue:159
- [ ] **e0196-c041** [table row, lines 414-414](../development-pack/modules/14_returns.md#L414) -- Back to Returns  /  :href=route('returns.index')  /  resources/js/Pages/Returns/Show.vue:169
- [ ] **e0196-c042** [table row, lines 416-416](../development-pack/modules/14_returns.md#L416) -- Cancel  /  :disabled=processing; @click=editingLines = false  /  resources/js/Pages/Returns/Show.vue:188
- [ ] **e0196-c043** [table row, lines 418-418](../development-pack/modules/14_returns.md#L418) -- Save lines  /  :loading=processing; :disabled=processing; @click=saveLines  /  resources/js/Pages/Returns/Show.vue:189
- [ ] **e0196-c044** [table row, lines 420-420](../development-pack/modules/14_returns.md#L420) -- Edit lines  /  @click=startEditingLines  /  resources/js/Pages/Returns/Show.vue:191
- [ ] **e0196-c045** [table row, lines 422-422](../development-pack/modules/14_returns.md#L422) -- # returnOrder.order.order_number  /  v-if=canVisit('orders.show'); :href=route('orders.show', returnOrder.order_id)  /  resources/js/Pages/Returns/Show.vue:279
- [ ] **e0196-c046** [table row, lines 424-424](../development-pack/modules/14_returns.md#L424) -- Approve Return  /  v-if=returnOrder.status === 'pending'; :disabled=processing; @click=performAction('approve')  /  resources/js/Pages/Returns/Show.vue:340
- [ ] **e0196-c047** [table row, lines 426-426](../development-pack/modules/14_returns.md#L426) -- Mark as Received  /  v-if=returnOrder.status === 'approved'; :disabled=processing; @click=performAction('receive')  /  resources/js/Pages/Returns/Show.vue:349
- [ ] **e0196-c048** [table row, lines 428-428](../development-pack/modules/14_returns.md#L428) -- Complete Return  /  v-if=returnOrder.status === 'received'; :disabled=processing; @click=performAction('complete')  /  resources/js/Pages/Returns/Show.vue:358
- [ ] **e0196-c049** [table row, lines 430-430](../development-pack/modules/14_returns.md#L430) -- Reject Return  /  :disabled=processing; @click=showRejectModal = true  /  resources/js/Pages/Returns/Show.vue:387
- [ ] **e0196-c050** [table row, lines 432-432](../development-pack/modules/14_returns.md#L432) -- Icon action  /  @click=showRejectModal = false  /  resources/js/Pages/Returns/Show.vue:406
- [ ] **e0196-c051** [table row, lines 434-434](../development-pack/modules/14_returns.md#L434) -- Cancel  /  :disabled=processing; @click=showRejectModal = false  /  resources/js/Pages/Returns/Show.vue:425
- [ ] **e0196-c052** [table row, lines 436-436](../development-pack/modules/14_returns.md#L436) -- Rejecting... Reject Return  /  :loading=processing; :disabled=processing; @click=submitReject  /  resources/js/Pages/Returns/Show.vue:428
- [ ] **e0196-c053** [prose, lines 439-439](../development-pack/modules/14_returns.md#L439) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0196-c054** [source-code reference, lines 441-463](../development-pack/modules/14_returns.md#L441) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0222: RejectReturnOrderRequest.php

Source: [exact contract](../development-pack/modules/14_returns.md#e0222). Complete every clause below before closing this section in the ledger.

- [ ] **e0222-c001** [prose, lines 474-474](../development-pack/modules/14_returns.md#L474) -- app/Http/Requests/ReturnOrder/RejectReturnOrderRequest.php:1
- [ ] **e0222-c002** [source-code reference, lines 476-493](../development-pack/modules/14_returns.md#L476) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0223: StoreReturnOrderRequest.php

Source: [exact contract](../development-pack/modules/14_returns.md#e0223). Complete every clause below before closing this section in the ledger.

- [ ] **e0223-c001** [prose, lines 504-504](../development-pack/modules/14_returns.md#L504) -- app/Http/Requests/ReturnOrder/StoreReturnOrderRequest.php:1
- [ ] **e0223-c002** [source-code reference, lines 506-532](../development-pack/modules/14_returns.md#L506) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0224: UpdateReturnLinesRequest.php

Source: [exact contract](../development-pack/modules/14_returns.md#e0224). Complete every clause below before closing this section in the ledger.

- [ ] **e0224-c001** [prose, lines 543-543](../development-pack/modules/14_returns.md#L543) -- app/Http/Requests/ReturnOrder/UpdateReturnLinesRequest.php:1
- [ ] **e0224-c002** [source-code reference, lines 545-566](../development-pack/modules/14_returns.md#L545) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0245: app/Models/Order/ReturnOrder.php

Source: [exact contract](../development-pack/modules/14_returns.md#e0245). Complete every clause below before closing this section in the ledger.

- [ ] **e0245-c001** [prose, lines 577-577](../development-pack/modules/14_returns.md#L577) -- app/Models/Order/ReturnOrder.php:1
- [ ] **e0245-c002** [source-code reference, lines 580-593](../development-pack/modules/14_returns.md#L580) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0245-c003** [source-code reference, lines 596-602](../development-pack/modules/14_returns.md#L596) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0246: app/Models/Order/ReturnOrderItem.php

Source: [exact contract](../development-pack/modules/14_returns.md#e0246). Complete every clause below before closing this section in the ledger.

- [ ] **e0246-c001** [prose, lines 613-613](../development-pack/modules/14_returns.md#L613) -- app/Models/Order/ReturnOrderItem.php:1
- [ ] **e0246-c002** [source-code reference, lines 616-627](../development-pack/modules/14_returns.md#L616) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0246-c003** [source-code reference, lines 630-636](../development-pack/modules/14_returns.md#L630) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0491: `app/Http/Requests/Api/ReturnOrder/StoreReturnOrderRequest.php`

Source: [exact contract](../development-pack/modules/14_returns.md#e0491). Complete every clause below before closing this section in the ledger.

- [ ] **e0491-c001** [prose, lines 647-647](../development-pack/modules/14_returns.md#L647) -- Source evidence. SHA-256: baab014e5558047239d107a4506d3cd57479ca7f8ec62308fd1f46c7684af255.
- [ ] **e0491-c002** [source-code reference, lines 649-688](../development-pack/modules/14_returns.md#L649) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/15_purchase_orders.md

### e0169: Purchasing and receiving

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0169). Complete every clause below before closing this section in the ledger.

- [ ] **e0169-c001** [prose, lines 100-100](../development-pack/modules/15_purchase_orders.md#L100) -- Draft → (submit approval → approved, if required) → send → sent → partial → received; cancellation is distinct. PO is editable only while draft and not pending approval; cancellation only dr...
- [ ] **e0169-c002** [prose, lines 102-102](../development-pack/modules/15_purchase_orders.md#L102) -- PO form: supplier required; order_date today required; expected_date blank and &gt;=order_date when set; currency organization default then selected supplier currency; tax/shipping zero; notes ...
- [ ] **e0169-c003** [prose, lines 104-104](../development-pack/modules/15_purchase_orders.md#L104) -- Receive page preserves item id, product/variant identity, designated receiving location and ordered/received/remaining counts. Editable quantity_to_receive starts0, integer UI min0/maxremain...
- [ ] **e0169-c004** [prose, lines 106-106](../development-pack/modules/15_purchase_orders.md#L106) -- Evidence: PO receive, item receive side effects. Quick reorder is separate: 1..100 distinct product_ids in caller organization, grouped into draft POs by supplier; not automatic purchasing.

### e0188: resources/js/Pages/PurchaseOrders/Create.vue

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0188). Complete every clause below before closing this section in the ledger.

- [ ] **e0188-c001** [prose, lines 116-116](../development-pack/modules/15_purchase_orders.md#L116) -- Source: resources/js/Pages/PurchaseOrders/Create.vue:1.
- [ ] **e0188-c002** [prose, lines 119-119](../development-pack/modules/15_purchase_orders.md#L119) -- **Named routes referenced:** purchase-orders.index, purchase-orders.store.
- [ ] **e0188-c003** [prose, lines 122-122](../development-pack/modules/15_purchase_orders.md#L122) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0188-c004** [prose, lines 125-125](../development-pack/modules/15_purchase_orders.md#L125) -- **Sections / displayed fields / table columns:**
- [ ] **e0188-c005** [statement, lines 127-127](../development-pack/modules/15_purchase_orders.md#L127) -- - h3: Order Details (L213)
- [ ] **e0188-c006** [statement, lines 128-128](../development-pack/modules/15_purchase_orders.md#L128) -- - h3: Add Items (L257)
- [ ] **e0188-c007** [statement, lines 129-129](../development-pack/modules/15_purchase_orders.md#L129) -- - h3: Order Items ({count}) (L316)
- [ ] **e0188-c008** [prose, lines 132-132](../development-pack/modules/15_purchase_orders.md#L132) -- **UI state/filter defaults:**
- [ ] **e0188-c009** [source-code reference, lines 134-142](../development-pack/modules/15_purchase_orders.md#L134) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0188-c010** [table row, lines 145-145](../development-pack/modules/15_purchase_orders.md#L145) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0188-c011** [table row, lines 148-148](../development-pack/modules/15_purchase_orders.md#L148) -- form.supplier_id  /  Supplier *  /  select  /  HTML required  /  : Select a supplier; supplier.id: supplier.name &#91;repeat supplier in suppliers&#93;  /  resources/js/Pages/PurchaseOrders/Create.v...
- [ ] **e0188-c012** [table row, lines 150-150](../development-pack/modules/15_purchase_orders.md#L150) -- form.currency  /  Currency  /  CurrencySelect  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:229
- [ ] **e0188-c013** [table row, lines 152-152](../development-pack/modules/15_purchase_orders.md#L152) -- form.order_date  /  Order Date *  /  input / date  /  HTML required  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:235
- [ ] **e0188-c014** [table row, lines 154-154](../development-pack/modules/15_purchase_orders.md#L154) -- form.expected_date  /  Expected Delivery Date  /  input / date  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:241
- [ ] **e0188-c015** [table row, lines 156-156](../development-pack/modules/15_purchase_orders.md#L156) -- form.notes  /  Notes  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:248
- [ ] **e0188-c016** [table row, lines 158-158](../development-pack/modules/15_purchase_orders.md#L158) -- selectedProductId  /  Product  /  select  /  @change=onProductSelected  /  : Select a product; product.id: product.name ( product.sku \\ / \\ /  No SKU ) &#91;repeat product in products&#93;  /  res...
- [ ] **e0188-c017** [table row, lines 160-160](../development-pack/modules/15_purchase_orders.md#L160) -- selectedVariantId  /  Variant  /  select  /  @change=onVariantSelected  /  null: Choose a variant...; variant.id: variant.title ( variant.sku ) - Stock: {count} &#91;repeat variant in chosenVari...
- [ ] **e0188-c018** [table row, lines 162-162](../development-pack/modules/15_purchase_orders.md#L162) -- quantity  /  Quantity  /  input / number  /  min=1  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:289
- [ ] **e0188-c019** [table row, lines 164-164](../development-pack/modules/15_purchase_orders.md#L164) -- unitCost  /  Unit Cost  /  input / number  /  min=0; step=0.01  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:294
- [ ] **e0188-c020** [table row, lines 166-166](../development-pack/modules/15_purchase_orders.md#L166) -- supplierSku  /  Supplier SKU  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:299
- [ ] **e0188-c021** [table row, lines 168-168](../development-pack/modules/15_purchase_orders.md#L168) -- item.quantity  /  Quantity  /  input / number  /  min=1; @input=updateItemQuantity(index, parseInt($event.target.value))  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:331
- [ ] **e0188-c022** [table row, lines 170-170](../development-pack/modules/15_purchase_orders.md#L170) -- item.unit_cost  /  Unit Cost  /  input / number  /  min=0; step=0.01; @input=updateItemCost(index, $event.target.value)  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:335
- [ ] **e0188-c023** [table row, lines 172-172](../development-pack/modules/15_purchase_orders.md#L172) -- form.tax  /  (dynamic/unlabelled; see source)  /  TaxInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:352
- [ ] **e0188-c024** [table row, lines 174-174](../development-pack/modules/15_purchase_orders.md#L174) -- form.shipping  /  Shipping  /  input / number  /  min=0; step=0.01  /  —  /  resources/js/Pages/PurchaseOrders/Create.vue:355
- [ ] **e0188-c025** [prose, lines 177-177](../development-pack/modules/15_purchase_orders.md#L177) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/PurchaseOrders/Create.vue:32
- [ ] **e0188-c026** [source-code reference, lines 179-191](../development-pack/modules/15_purchase_orders.md#L179) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0188-c027** [table row, lines 195-195](../development-pack/modules/15_purchase_orders.md#L195) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0188-c028** [table row, lines 198-198](../development-pack/modules/15_purchase_orders.md#L198) -- Workspace  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Create.vue:190
- [ ] **e0188-c029** [table row, lines 200-200](../development-pack/modules/15_purchase_orders.md#L200) -- Purchase Orders  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Create.vue:192
- [ ] **e0188-c030** [table row, lines 202-202](../development-pack/modules/15_purchase_orders.md#L202) -- Back to Purchase Orders  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Create.vue:200
- [ ] **e0188-c031** [table row, lines 204-204](../development-pack/modules/15_purchase_orders.md#L204) -- Scan Barcode  /  type=button; @click=showScanner = true  /  resources/js/Pages/PurchaseOrders/Create.vue:258
- [ ] **e0188-c032** [table row, lines 206-206](../development-pack/modules/15_purchase_orders.md#L206) -- Add  /  type=button; :disabled=!selectedProductId; @click=addItem  /  resources/js/Pages/PurchaseOrders/Create.vue:303
- [ ] **e0188-c033** [table row, lines 208-208](../development-pack/modules/15_purchase_orders.md#L208) -- t('common.delete')  /  type=button; @click=removeItem(index)  /  resources/js/Pages/PurchaseOrders/Create.vue:341
- [ ] **e0188-c034** [table row, lines 210-210](../development-pack/modules/15_purchase_orders.md#L210) -- Cancel  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Create.vue:368
- [ ] **e0188-c035** [table row, lines 212-212](../development-pack/modules/15_purchase_orders.md#L212) -- Create Purchase Order  /  type=submit; :loading=form.processing; :disabled=form.processing \ / \ /  form.items.length === 0  /  resources/js/Pages/PurchaseOrders/Create.vue:369
- [ ] **e0188-c036** [prose, lines 215-215](../development-pack/modules/15_purchase_orders.md#L215) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0188-c037** [source-code reference, lines 217-222](../development-pack/modules/15_purchase_orders.md#L217) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0189: resources/js/Pages/PurchaseOrders/Edit.vue

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0189). Complete every clause below before closing this section in the ledger.

- [ ] **e0189-c001** [prose, lines 233-233](../development-pack/modules/15_purchase_orders.md#L233) -- Source: resources/js/Pages/PurchaseOrders/Edit.vue:1.
- [ ] **e0189-c002** [prose, lines 236-236](../development-pack/modules/15_purchase_orders.md#L236) -- **Named routes referenced:** purchase-orders.index, purchase-orders.show, purchase-orders.update.
- [ ] **e0189-c003** [prose, lines 239-239](../development-pack/modules/15_purchase_orders.md#L239) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0189-c004** [prose, lines 242-242](../development-pack/modules/15_purchase_orders.md#L242) -- **Sections / displayed fields / table columns:**
- [ ] **e0189-c005** [statement, lines 244-244](../development-pack/modules/15_purchase_orders.md#L244) -- - h3: Order Details - purchaseOrder.po_number (L211)
- [ ] **e0189-c006** [statement, lines 245-245](../development-pack/modules/15_purchase_orders.md#L245) -- - h3: Add Items (L256)
- [ ] **e0189-c007** [statement, lines 246-246](../development-pack/modules/15_purchase_orders.md#L246) -- - h3: Order Items ({count}) (L312)
- [ ] **e0189-c008** [prose, lines 249-249](../development-pack/modules/15_purchase_orders.md#L249) -- **UI state/filter defaults:**
- [ ] **e0189-c009** [source-code reference, lines 251-258](../development-pack/modules/15_purchase_orders.md#L251) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0189-c010** [table row, lines 261-261](../development-pack/modules/15_purchase_orders.md#L261) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0189-c011** [table row, lines 264-264](../development-pack/modules/15_purchase_orders.md#L264) -- form.supplier_id  /  Supplier *  /  select  /  HTML required  /  : Select a supplier; supplier.id: supplier.name &#91;repeat supplier in suppliers&#93;  /  resources/js/Pages/PurchaseOrders/Edit.vue...
- [ ] **e0189-c012** [table row, lines 266-266](../development-pack/modules/15_purchase_orders.md#L266) -- form.currency  /  Currency  /  CurrencySelect  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:228
- [ ] **e0189-c013** [table row, lines 268-268](../development-pack/modules/15_purchase_orders.md#L268) -- form.order_date  /  Order Date *  /  input / date  /  HTML required  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:234
- [ ] **e0189-c014** [table row, lines 270-270](../development-pack/modules/15_purchase_orders.md#L270) -- form.expected_date  /  Expected Delivery Date  /  input / date  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:240
- [ ] **e0189-c015** [table row, lines 272-272](../development-pack/modules/15_purchase_orders.md#L272) -- form.notes  /  Notes  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:247
- [ ] **e0189-c016** [table row, lines 274-274](../development-pack/modules/15_purchase_orders.md#L274) -- selectedProductId  /  Product  /  select  /  @change=onProductSelected  /  : Select a product; product.id: product.name ( product.sku \\ / \\ /  No SKU ) &#91;repeat product in products&#93;  /  res...
- [ ] **e0189-c017** [table row, lines 276-276](../development-pack/modules/15_purchase_orders.md#L276) -- selectedVariantId  /  Variant  /  select  /  @change=onVariantSelected  /  null: Choose a variant...; variant.id: variant.title ( variant.sku ) - Stock: {count} &#91;repeat variant in chosenVari...
- [ ] **e0189-c018** [table row, lines 278-278](../development-pack/modules/15_purchase_orders.md#L278) -- quantity  /  Quantity  /  input / number  /  min=1  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:284
- [ ] **e0189-c019** [table row, lines 280-280](../development-pack/modules/15_purchase_orders.md#L280) -- unitCost  /  Unit Cost  /  input / number  /  min=0; step=0.01  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:289
- [ ] **e0189-c020** [table row, lines 282-282](../development-pack/modules/15_purchase_orders.md#L282) -- supplierSku  /  Supplier SKU  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:294
- [ ] **e0189-c021** [table row, lines 284-284](../development-pack/modules/15_purchase_orders.md#L284) -- item.product_variant_id  /  Variant  /  select  /  HTML required; @change=onLineVariantChange(index)  /  null: Choose a variant...; variant.id: variant.title ( variant.sku ) &#91;repeat variant ...
- [ ] **e0189-c022** [table row, lines 286-286](../development-pack/modules/15_purchase_orders.md#L286) -- item.quantity  /  Quantity  /  input / number  /  min=1; @input=updateItemQuantity(index, parseInt($event.target.value))  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:340
- [ ] **e0189-c023** [table row, lines 288-288](../development-pack/modules/15_purchase_orders.md#L288) -- item.unit_cost  /  Unit Cost  /  input / number  /  min=0; step=0.01; @input=updateItemCost(index, $event.target.value)  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:352
- [ ] **e0189-c024** [table row, lines 290-290](../development-pack/modules/15_purchase_orders.md#L290) -- form.tax  /  (dynamic/unlabelled; see source)  /  TaxInput  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:392
- [ ] **e0189-c025** [table row, lines 292-292](../development-pack/modules/15_purchase_orders.md#L292) -- form.shipping  /  Shipping  /  input / number  /  min=0; step=0.01  /  —  /  resources/js/Pages/PurchaseOrders/Edit.vue:395
- [ ] **e0189-c026** [prose, lines 295-295](../development-pack/modules/15_purchase_orders.md#L295) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/PurchaseOrders/Edit.vue:29
- [ ] **e0189-c027** [source-code reference, lines 297-319](../development-pack/modules/15_purchase_orders.md#L297) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0189-c028** [table row, lines 323-323](../development-pack/modules/15_purchase_orders.md#L323) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0189-c029** [table row, lines 326-326](../development-pack/modules/15_purchase_orders.md#L326) -- Workspace  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Edit.vue:183
- [ ] **e0189-c030** [table row, lines 328-328](../development-pack/modules/15_purchase_orders.md#L328) -- Purchase Orders  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Edit.vue:185
- [ ] **e0189-c031** [table row, lines 330-330](../development-pack/modules/15_purchase_orders.md#L330) -- View Details  /  :href=route('purchase-orders.show', purchaseOrder.id)  /  resources/js/Pages/PurchaseOrders/Edit.vue:195
- [ ] **e0189-c032** [table row, lines 332-332](../development-pack/modules/15_purchase_orders.md#L332) -- Back to Purchase Orders  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Edit.vue:198
- [ ] **e0189-c033** [table row, lines 334-334](../development-pack/modules/15_purchase_orders.md#L334) -- Add  /  type=button; :disabled=!selectedProductId; @click=addItem  /  resources/js/Pages/PurchaseOrders/Edit.vue:298
- [ ] **e0189-c034** [table row, lines 336-336](../development-pack/modules/15_purchase_orders.md#L336) -- t('common.delete')  /  type=button; @click=removeItem(index)  /  resources/js/Pages/PurchaseOrders/Edit.vue:373
- [ ] **e0189-c035** [table row, lines 338-338](../development-pack/modules/15_purchase_orders.md#L338) -- Cancel  /  :href=route('purchase-orders.show', purchaseOrder.id)  /  resources/js/Pages/PurchaseOrders/Edit.vue:408
- [ ] **e0189-c036** [table row, lines 340-340](../development-pack/modules/15_purchase_orders.md#L340) -- Update Purchase Order  /  type=submit; :loading=form.processing; :disabled=form.processing \ / \ /  form.items.length === 0  /  resources/js/Pages/PurchaseOrders/Edit.vue:411
- [ ] **e0189-c037** [prose, lines 343-343](../development-pack/modules/15_purchase_orders.md#L343) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0189-c038** [source-code reference, lines 345-352](../development-pack/modules/15_purchase_orders.md#L345) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0190: resources/js/Pages/PurchaseOrders/Index.vue

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0190). Complete every clause below before closing this section in the ledger.

- [ ] **e0190-c001** [prose, lines 363-363](../development-pack/modules/15_purchase_orders.md#L363) -- Source: resources/js/Pages/PurchaseOrders/Index.vue:1.
- [ ] **e0190-c002** [prose, lines 366-366](../development-pack/modules/15_purchase_orders.md#L366) -- **Named routes referenced:** purchase-orders.create, purchase-orders.destroy, purchase-orders.edit, purchase-orders.index, purchase-orders.receive, purchase-orders.show.
- [ ] **e0190-c003** [prose, lines 369-369](../development-pack/modules/15_purchase_orders.md#L369) -- **Permission/route-capability checks:** delete_purchase_orders, purchase-orders.create, purchase-orders.edit, purchase-orders.receive.
- [ ] **e0190-c004** [prose, lines 372-372](../development-pack/modules/15_purchase_orders.md#L372) -- **Sections / displayed fields / table columns:**
- [ ] **e0190-c005** [statement, lines 374-374](../development-pack/modules/15_purchase_orders.md#L374) -- - column po_number: PO Number (L77)
- [ ] **e0190-c006** [statement, lines 375-375](../development-pack/modules/15_purchase_orders.md#L375) -- - column supplier: Supplier (L78)
- [ ] **e0190-c007** [statement, lines 376-376](../development-pack/modules/15_purchase_orders.md#L376) -- - column order_date: Order Date (L79)
- [ ] **e0190-c008** [statement, lines 377-377](../development-pack/modules/15_purchase_orders.md#L377) -- - column expected_date: Expected (L80)
- [ ] **e0190-c009** [statement, lines 378-378](../development-pack/modules/15_purchase_orders.md#L378) -- - column quantity: items (L81)
- [ ] **e0190-c010** [statement, lines 379-379](../development-pack/modules/15_purchase_orders.md#L379) -- - column total: Total (L82)
- [ ] **e0190-c011** [statement, lines 380-380](../development-pack/modules/15_purchase_orders.md#L380) -- - column status: Status (L83)
- [ ] **e0190-c012** [statement, lines 381-381](../development-pack/modules/15_purchase_orders.md#L381) -- - column actions: Actions (L84)
- [ ] **e0190-c013** [prose, lines 384-384](../development-pack/modules/15_purchase_orders.md#L384) -- **UI state/filter defaults:**
- [ ] **e0190-c014** [source-code reference, lines 386-390](../development-pack/modules/15_purchase_orders.md#L386) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0190-c015** [table row, lines 393-393](../development-pack/modules/15_purchase_orders.md#L393) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0190-c016** [table row, lines 396-396](../development-pack/modules/15_purchase_orders.md#L396) -- search  /  Search  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/PurchaseOrders/Index.vue:119
- [ ] **e0190-c017** [table row, lines 398-398](../development-pack/modules/15_purchase_orders.md#L398) -- selectedStatus  /  Status  /  select  /  No extra control attribute; server rules below  /  : All Statuses; status: statusLabels&#91;status&#93; \\ / \\ /  status &#91;repeat status in statuses&#93;  /  res...
- [ ] **e0190-c018** [table row, lines 400-400](../development-pack/modules/15_purchase_orders.md#L400) -- selectedSupplierId  /  Supplier  /  select  /  No extra control attribute; server rules below  /  : All Suppliers; supplier.id: supplier.name &#91;repeat supplier in suppliers&#93;  /  resources/js/...
- [ ] **e0190-c019** [table row, lines 403-403](../development-pack/modules/15_purchase_orders.md#L403) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0190-c020** [table row, lines 406-406](../development-pack/modules/15_purchase_orders.md#L406) -- Create Purchase Order  /  v-if=canVisit('purchase-orders.create'); :href=route('purchase-orders.create')  /  resources/js/Pages/PurchaseOrders/Index.vue:107
- [ ] **e0190-c021** [table row, lines 408-408](../development-pack/modules/15_purchase_orders.md#L408) -- Search  /  type=submit  /  resources/js/Pages/PurchaseOrders/Index.vue:120
- [ ] **e0190-c022** [table row, lines 410-410](../development-pack/modules/15_purchase_orders.md#L410) -- Search  /  type=submit  /  resources/js/Pages/PurchaseOrders/Index.vue:145
- [ ] **e0190-c023** [table row, lines 412-412](../development-pack/modules/15_purchase_orders.md#L412) -- Clear  /  type=button; @click=clearFilters  /  resources/js/Pages/PurchaseOrders/Index.vue:149
- [ ] **e0190-c024** [table row, lines 414-414](../development-pack/modules/15_purchase_orders.md#L414) -- row.po_number  /  :href=route('purchase-orders.show', row.id)  /  resources/js/Pages/PurchaseOrders/Index.vue:161
- [ ] **e0190-c025** [table row, lines 416-416](../development-pack/modules/15_purchase_orders.md#L416) -- t('common.view')  /  :href=route('purchase-orders.show', row.id)  /  resources/js/Pages/PurchaseOrders/Index.vue:183
- [ ] **e0190-c026** [table row, lines 418-418](../development-pack/modules/15_purchase_orders.md#L418) -- t('common.edit')  /  v-if=(row.status === 'draft') &amp;&amp; canVisit('purchase-orders.edit'); :href=route('purchase-orders.edit', row.id)  /  resources/js/Pages/PurchaseOrders/Index.vue:184
- [ ] **e0190-c027** [table row, lines 420-420](../development-pack/modules/15_purchase_orders.md#L420) -- Icon action  /  v-if=(row.status === 'sent' \ / \ /  row.status === 'partial') &amp;&amp; canVisit('purchase-orders.receive'); :href=route('purchase-orders.receive', row.id)  /  resources/js/Pages/P...
- [ ] **e0190-c028** [table row, lines 422-422](../development-pack/modules/15_purchase_orders.md#L422) -- t('common.delete')  /  v-if=row.status === 'draft' &amp;&amp; hasPermission('delete_purchase_orders'); type=button; @click=deletePO(row)  /  resources/js/Pages/PurchaseOrders/Index.vue:186
- [ ] **e0190-c029** [table row, lines 424-424](../development-pack/modules/15_purchase_orders.md#L424) -- Create Purchase Order  /  v-if=canVisit('purchase-orders.create'); :href=route('purchase-orders.create')  /  resources/js/Pages/PurchaseOrders/Index.vue:194
- [ ] **e0190-c030** [prose, lines 427-427](../development-pack/modules/15_purchase_orders.md#L427) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0190-c031** [source-code reference, lines 429-439](../development-pack/modules/15_purchase_orders.md#L429) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0191: resources/js/Pages/PurchaseOrders/Receive.vue

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0191). Complete every clause below before closing this section in the ledger.

- [ ] **e0191-c001** [prose, lines 450-450](../development-pack/modules/15_purchase_orders.md#L450) -- Source: resources/js/Pages/PurchaseOrders/Receive.vue:1.
- [ ] **e0191-c002** [prose, lines 453-453](../development-pack/modules/15_purchase_orders.md#L453) -- **Named routes referenced:** purchase-orders.index, purchase-orders.process-receiving, purchase-orders.show.
- [ ] **e0191-c003** [prose, lines 456-456](../development-pack/modules/15_purchase_orders.md#L456) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0191-c004** [prose, lines 459-459](../development-pack/modules/15_purchase_orders.md#L459) -- **Sections / displayed fields / table columns:**
- [ ] **e0191-c005** [statement, lines 461-461](../development-pack/modules/15_purchase_orders.md#L461) -- - h3: purchaseOrder.supplier?.name (L154)
- [ ] **e0191-c006** [statement, lines 462-462](../development-pack/modules/15_purchase_orders.md#L462) -- - h3: Items to Receive (L171)
- [ ] **e0191-c007** [statement, lines 463-463](../development-pack/modules/15_purchase_orders.md#L463) -- - th: Product (L186)
- [ ] **e0191-c008** [statement, lines 464-464](../development-pack/modules/15_purchase_orders.md#L464) -- - th: SKU (L187)
- [ ] **e0191-c009** [statement, lines 465-465](../development-pack/modules/15_purchase_orders.md#L465) -- - th: Ordered (L188)
- [ ] **e0191-c010** [statement, lines 466-466](../development-pack/modules/15_purchase_orders.md#L466) -- - th: Already Received (L189)
- [ ] **e0191-c011** [statement, lines 467-467](../development-pack/modules/15_purchase_orders.md#L467) -- - th: Remaining (L190)
- [ ] **e0191-c012** [statement, lines 468-468](../development-pack/modules/15_purchase_orders.md#L468) -- - th: Receive Now (L191)
- [ ] **e0191-c013** [statement, lines 469-469](../development-pack/modules/15_purchase_orders.md#L469) -- - th: Actions (L192)
- [ ] **e0191-c014** [prose, lines 472-472](../development-pack/modules/15_purchase_orders.md#L472) -- **UI state/filter defaults:**
- [ ] **e0191-c015** [source-code reference, lines 474-476](../development-pack/modules/15_purchase_orders.md#L474) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0191-c016** [table row, lines 479-479](../development-pack/modules/15_purchase_orders.md#L479) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0191-c017** [table row, lines 482-482](../development-pack/modules/15_purchase_orders.md#L482) -- item.quantity_to_receive  /  Receive Now  /  input / number  /  min=0; :max=item.remaining; v-if=item.remaining &gt; 0  /  —  /  resources/js/Pages/PurchaseOrders/Receive.vue:234
- [ ] **e0191-c018** [prose, lines 485-485](../development-pack/modules/15_purchase_orders.md#L485) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/PurchaseOrders/Receive.vue:26
- [ ] **e0191-c019** [source-code reference, lines 487-504](../development-pack/modules/15_purchase_orders.md#L487) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0191-c020** [table row, lines 508-508](../development-pack/modules/15_purchase_orders.md#L508) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0191-c021** [table row, lines 511-511](../development-pack/modules/15_purchase_orders.md#L511) -- Workspace  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Receive.vue:121
- [ ] **e0191-c022** [table row, lines 513-513](../development-pack/modules/15_purchase_orders.md#L513) -- Purchase Orders  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Receive.vue:123
- [ ] **e0191-c023** [table row, lines 515-515](../development-pack/modules/15_purchase_orders.md#L515) -- purchaseOrder.po_number  /  :href=route('purchase-orders.show', purchaseOrder.id)  /  resources/js/Pages/PurchaseOrders/Receive.vue:125
- [ ] **e0191-c024** [table row, lines 517-517](../development-pack/modules/15_purchase_orders.md#L517) -- Scan Barcode  /  @click=showScanner = true  /  resources/js/Pages/PurchaseOrders/Receive.vue:136
- [ ] **e0191-c025** [table row, lines 519-519](../development-pack/modules/15_purchase_orders.md#L519) -- Back  /  :href=route('purchase-orders.show', purchaseOrder.id)  /  resources/js/Pages/PurchaseOrders/Receive.vue:140
- [ ] **e0191-c026** [table row, lines 521-521](../development-pack/modules/15_purchase_orders.md#L521) -- Receive All  /  type=button; @click=receiveAllItems  /  resources/js/Pages/PurchaseOrders/Receive.vue:173
- [ ] **e0191-c027** [table row, lines 523-523](../development-pack/modules/15_purchase_orders.md#L523) -- Clear  /  type=button; @click=clearAll  /  resources/js/Pages/PurchaseOrders/Receive.vue:176
- [ ] **e0191-c028** [table row, lines 525-525](../development-pack/modules/15_purchase_orders.md#L525) -- Receive All  /  v-if=item.remaining &gt; 0; type=button; @click=receiveAll(index)  /  resources/js/Pages/PurchaseOrders/Receive.vue:247
- [ ] **e0191-c029** [table row, lines 527-527](../development-pack/modules/15_purchase_orders.md#L527) -- Cancel  /  :href=route('purchase-orders.show', purchaseOrder.id)  /  resources/js/Pages/PurchaseOrders/Receive.vue:275
- [ ] **e0191-c030** [table row, lines 529-529](../development-pack/modules/15_purchase_orders.md#L529) -- Receive  /  type=submit; :loading=form.processing; :disabled=form.processing \ / \ /  !hasItemsToReceive  /  resources/js/Pages/PurchaseOrders/Receive.vue:278
- [ ] **e0191-c031** [prose, lines 532-532](../development-pack/modules/15_purchase_orders.md#L532) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0191-c032** [source-code reference, lines 534-538](../development-pack/modules/15_purchase_orders.md#L534) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0192: resources/js/Pages/PurchaseOrders/Show.vue

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0192). Complete every clause below before closing this section in the ledger.

- [ ] **e0192-c001** [prose, lines 549-549](../development-pack/modules/15_purchase_orders.md#L549) -- Source: resources/js/Pages/PurchaseOrders/Show.vue:1.
- [ ] **e0192-c002** [prose, lines 552-552](../development-pack/modules/15_purchase_orders.md#L552) -- **Named routes referenced:** products.show, purchase-orders.cancel, purchase-orders.destroy, purchase-orders.edit, purchase-orders.index, purchase-orders.invoice.download, purchase-orders.in...
- [ ] **e0192-c003** [prose, lines 555-555](../development-pack/modules/15_purchase_orders.md#L555) -- **Permission/route-capability checks:** products.show, purchase-orders.edit, purchase-orders.receive, suppliers.show.
- [ ] **e0192-c004** [prose, lines 558-558](../development-pack/modules/15_purchase_orders.md#L558) -- **Sections / displayed fields / table columns:**
- [ ] **e0192-c005** [statement, lines 560-560](../development-pack/modules/15_purchase_orders.md#L560) -- - h3: Order Details (L198)
- [ ] **e0192-c006** [statement, lines 561-561](../development-pack/modules/15_purchase_orders.md#L561) -- - dt: Supplier (L202)
- [ ] **e0192-c007** [statement, lines 562-562](../development-pack/modules/15_purchase_orders.md#L562) -- - dt: Created By (L212)
- [ ] **e0192-c008** [statement, lines 563-563](../development-pack/modules/15_purchase_orders.md#L563) -- - dt: Order Date (L216)
- [ ] **e0192-c009** [statement, lines 564-564](../development-pack/modules/15_purchase_orders.md#L564) -- - dt: Expected Delivery (L220)
- [ ] **e0192-c010** [statement, lines 565-565](../development-pack/modules/15_purchase_orders.md#L565) -- - dt: Received Date (L224)
- [ ] **e0192-c011** [statement, lines 566-566](../development-pack/modules/15_purchase_orders.md#L566) -- - dt: Currency (L228)
- [ ] **e0192-c012** [statement, lines 567-567](../development-pack/modules/15_purchase_orders.md#L567) -- - dt: Notes (L233)
- [ ] **e0192-c013** [statement, lines 568-568](../development-pack/modules/15_purchase_orders.md#L568) -- - h3: Items ({count}) (L241)
- [ ] **e0192-c014** [statement, lines 569-569](../development-pack/modules/15_purchase_orders.md#L569) -- - dt: Ordered (L261)
- [ ] **e0192-c015** [statement, lines 570-570](../development-pack/modules/15_purchase_orders.md#L570) -- - dt: Received (L265)
- [ ] **e0192-c016** [statement, lines 571-571](../development-pack/modules/15_purchase_orders.md#L571) -- - dt: Unit Cost (L272)
- [ ] **e0192-c017** [statement, lines 572-572](../development-pack/modules/15_purchase_orders.md#L572) -- - dt: Total (L276)
- [ ] **e0192-c018** [statement, lines 573-573](../development-pack/modules/15_purchase_orders.md#L573) -- - dt: Subtotal (L284)
- [ ] **e0192-c019** [statement, lines 574-574](../development-pack/modules/15_purchase_orders.md#L574) -- - dt: Tax (L288)
- [ ] **e0192-c020** [statement, lines 575-575](../development-pack/modules/15_purchase_orders.md#L575) -- - dt: Shipping (L292)
- [ ] **e0192-c021** [statement, lines 576-576](../development-pack/modules/15_purchase_orders.md#L576) -- - dt: Total (L296)
- [ ] **e0192-c022** [statement, lines 577-577](../development-pack/modules/15_purchase_orders.md#L577) -- - th: Product (L305)
- [ ] **e0192-c023** [statement, lines 578-578](../development-pack/modules/15_purchase_orders.md#L578) -- - th: SKU (L306)
- [ ] **e0192-c024** [statement, lines 579-579](../development-pack/modules/15_purchase_orders.md#L579) -- - th: Ordered (L307)
- [ ] **e0192-c025** [statement, lines 580-580](../development-pack/modules/15_purchase_orders.md#L580) -- - th: Received (L308)
- [ ] **e0192-c026** [statement, lines 581-581](../development-pack/modules/15_purchase_orders.md#L581) -- - th: Unit Cost (L309)
- [ ] **e0192-c027** [statement, lines 582-582](../development-pack/modules/15_purchase_orders.md#L582) -- - th: Total (L310)
- [ ] **e0192-c028** [statement, lines 583-583](../development-pack/modules/15_purchase_orders.md#L583) -- - h3: Status (L383)
- [ ] **e0192-c029** [statement, lines 584-584](../development-pack/modules/15_purchase_orders.md#L584) -- - h3: Order Summary (L394)
- [ ] **e0192-c030** [statement, lines 585-585](../development-pack/modules/15_purchase_orders.md#L585) -- - dt: Subtotal (L398)
- [ ] **e0192-c031** [statement, lines 586-586](../development-pack/modules/15_purchase_orders.md#L586) -- - dt: Tax (L402)
- [ ] **e0192-c032** [statement, lines 587-587](../development-pack/modules/15_purchase_orders.md#L587) -- - dt: Shipping (L406)
- [ ] **e0192-c033** [statement, lines 588-588](../development-pack/modules/15_purchase_orders.md#L588) -- - dt: Total (L411)
- [ ] **e0192-c034** [statement, lines 589-589](../development-pack/modules/15_purchase_orders.md#L589) -- - h3: Actions (L424)
- [ ] **e0192-c035** [statement, lines 590-590](../development-pack/modules/15_purchase_orders.md#L590) -- - h3: Danger Zone (L472)
- [ ] **e0192-c036** [prose, lines 593-593](../development-pack/modules/15_purchase_orders.md#L593) -- **UI state/filter defaults:**
- [ ] **e0192-c037** [source-code reference, lines 595-597](../development-pack/modules/15_purchase_orders.md#L595) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0192-c038** [prose, lines 600-600](../development-pack/modules/15_purchase_orders.md#L600) -- No editable model-bound controls in this file; navigation and action-only controls listed below.
- [ ] **e0192-c039** [table row, lines 604-604](../development-pack/modules/15_purchase_orders.md#L604) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0192-c040** [table row, lines 607-607](../development-pack/modules/15_purchase_orders.md#L607) -- Workspace  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Show.vue:112
- [ ] **e0192-c041** [table row, lines 609-609](../development-pack/modules/15_purchase_orders.md#L609) -- Purchase Orders  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Show.vue:114
- [ ] **e0192-c042** [table row, lines 611-611](../development-pack/modules/15_purchase_orders.md#L611) -- Download PDF  /  :href=route('purchase-orders.invoice.download', purchaseOrder.id)  /  resources/js/Pages/PurchaseOrders/Show.vue:129
- [ ] **e0192-c043** [table row, lines 613-613](../development-pack/modules/15_purchase_orders.md#L613) -- Preview PDF  /  :href=route('purchase-orders.invoice.preview', purchaseOrder.id)  /  resources/js/Pages/PurchaseOrders/Show.vue:138
- [ ] **e0192-c044** [table row, lines 615-615](../development-pack/modules/15_purchase_orders.md#L615) -- Edit  /  v-if=(purchaseOrder.status === 'draft' &amp;&amp; !lockedForApproval) &amp;&amp; canVisit('purchase-orders.edit'); :href=route('purchase-orders.edit', purchaseOrder.id)  /  resources/js/Pages/Purch...
- [ ] **e0192-c045** [table row, lines 617-617](../development-pack/modules/15_purchase_orders.md#L617) -- Receive Items  /  v-if=(purchaseOrder.status === 'sent' \ / \ /  purchaseOrder.status === 'partial') &amp;&amp; canVisit('purchase-orders.receive'); :href=route('purchase-orders.receive', purchaseOr...
- [ ] **e0192-c046** [table row, lines 619-619](../development-pack/modules/15_purchase_orders.md#L619) -- Back  /  :href=route('purchase-orders.index')  /  resources/js/Pages/PurchaseOrders/Show.vue:168
- [ ] **e0192-c047** [table row, lines 621-621](../development-pack/modules/15_purchase_orders.md#L621) -- purchaseOrder.supplier.name  /  :href=route('suppliers.show', purchaseOrder.supplier.id)  /  resources/js/Pages/PurchaseOrders/Show.vue:205
- [ ] **e0192-c048** [table row, lines 623-623](../development-pack/modules/15_purchase_orders.md#L623) -- item.product_name  /  :href=route('products.show', item.product.id)  /  resources/js/Pages/PurchaseOrders/Show.vue:252
- [ ] **e0192-c049** [table row, lines 625-625](../development-pack/modules/15_purchase_orders.md#L625) -- item.product_name  /  :href=route('products.show', item.product.id)  /  resources/js/Pages/PurchaseOrders/Show.vue:317
- [ ] **e0192-c050** [table row, lines 627-627](../development-pack/modules/15_purchase_orders.md#L627) -- isResend ? Resend to Supplier : Send to Supplier  /  v-if=canSend; @click=showSendModal = true  /  resources/js/Pages/PurchaseOrders/Show.vue:426
- [ ] **e0192-c051** [table row, lines 629-629](../development-pack/modules/15_purchase_orders.md#L629) -- Receive Items  /  v-if=(purchaseOrder.status === 'sent' \ / \ /  purchaseOrder.status === 'partial') &amp;&amp; canVisit('purchase-orders.receive'); :href=route('purchase-orders.receive', purchaseOr...
- [ ] **e0192-c052** [table row, lines 631-631](../development-pack/modules/15_purchase_orders.md#L631) -- Edit Purchase Order  /  v-if=(purchaseOrder.status === 'draft' &amp;&amp; !lockedForApproval) &amp;&amp; canVisit('purchase-orders.edit'); :href=route('purchase-orders.edit', purchaseOrder.id)  /  resources...
- [ ] **e0192-c053** [table row, lines 633-633](../development-pack/modules/15_purchase_orders.md#L633) -- Cancel Order  /  v-if=purchaseOrder.status === 'draft' \ / \ /  purchaseOrder.status === 'sent'; @click=cancelPO  /  resources/js/Pages/PurchaseOrders/Show.vue:458
- [ ] **e0192-c054** [table row, lines 635-635](../development-pack/modules/15_purchase_orders.md#L635) -- Delete Order  /  @click=deletePO  /  resources/js/Pages/PurchaseOrders/Show.vue:474
- [ ] **e0192-c055** [prose, lines 638-638](../development-pack/modules/15_purchase_orders.md#L638) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0192-c056** [source-code reference, lines 640-657](../development-pack/modules/15_purchase_orders.md#L640) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0218: ProcessReceivingRequest.php

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0218). Complete every clause below before closing this section in the ledger.

- [ ] **e0218-c001** [prose, lines 668-668](../development-pack/modules/15_purchase_orders.md#L668) -- app/Http/Requests/PurchaseOrder/ProcessReceivingRequest.php:1
- [ ] **e0218-c002** [source-code reference, lines 670-689](../development-pack/modules/15_purchase_orders.md#L670) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0219: QuickReorderRequest.php

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0219). Complete every clause below before closing this section in the ledger.

- [ ] **e0219-c001** [prose, lines 700-700](../development-pack/modules/15_purchase_orders.md#L700) -- app/Http/Requests/PurchaseOrder/QuickReorderRequest.php:1
- [ ] **e0219-c002** [source-code reference, lines 702-741](../development-pack/modules/15_purchase_orders.md#L702) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0220: StorePurchaseOrderRequest.php

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0220). Complete every clause below before closing this section in the ledger.

- [ ] **e0220-c001** [prose, lines 752-752](../development-pack/modules/15_purchase_orders.md#L752) -- app/Http/Requests/PurchaseOrder/StorePurchaseOrderRequest.php:1
- [ ] **e0220-c002** [source-code reference, lines 754-789](../development-pack/modules/15_purchase_orders.md#L754) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0221: UpdatePurchaseOrderRequest.php

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0221). Complete every clause below before closing this section in the ledger.

- [ ] **e0221-c001** [prose, lines 800-800](../development-pack/modules/15_purchase_orders.md#L800) -- app/Http/Requests/PurchaseOrder/UpdatePurchaseOrderRequest.php:1
- [ ] **e0221-c002** [source-code reference, lines 802-840](../development-pack/modules/15_purchase_orders.md#L802) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0247: app/Models/Purchasing/PurchaseOrder.php

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0247). Complete every clause below before closing this section in the ledger.

- [ ] **e0247-c001** [prose, lines 851-851](../development-pack/modules/15_purchase_orders.md#L851) -- app/Models/Purchasing/PurchaseOrder.php:1
- [ ] **e0247-c002** [source-code reference, lines 854-881](../development-pack/modules/15_purchase_orders.md#L854) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0247-c003** [source-code reference, lines 884-902](../development-pack/modules/15_purchase_orders.md#L884) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0247-c004** [source-code reference, lines 905-918](../development-pack/modules/15_purchase_orders.md#L905) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0248: app/Models/Purchasing/PurchaseOrderItem.php

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0248). Complete every clause below before closing this section in the ledger.

- [ ] **e0248-c001** [prose, lines 929-929](../development-pack/modules/15_purchase_orders.md#L929) -- app/Models/Purchasing/PurchaseOrderItem.php:1
- [ ] **e0248-c002** [source-code reference, lines 932-951](../development-pack/modules/15_purchase_orders.md#L932) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0248-c003** [source-code reference, lines 954-966](../development-pack/modules/15_purchase_orders.md#L954) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0248-c004** [source-code reference, lines 969-978](../development-pack/modules/15_purchase_orders.md#L969) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0488: `app/Http/Requests/Api/PurchaseOrder/ReceivePurchaseOrderRequest.php`

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0488). Complete every clause below before closing this section in the ledger.

- [ ] **e0488-c001** [prose, lines 989-989](../development-pack/modules/15_purchase_orders.md#L989) -- Source evidence. SHA-256: c3bd0dd28dc4ae24d1ca970a0b8d80a6b2ebf37828823b8ce6957cfe315f297b.
- [ ] **e0488-c002** [source-code reference, lines 991-1018](../development-pack/modules/15_purchase_orders.md#L991) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0489: `app/Http/Requests/Api/PurchaseOrder/StorePurchaseOrderRequest.php`

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0489). Complete every clause below before closing this section in the ledger.

- [ ] **e0489-c001** [prose, lines 1028-1028](../development-pack/modules/15_purchase_orders.md#L1028) -- Source evidence. SHA-256: abcd08ccbc482e550cd56dad219effc674df03da6b649ff6f23c0b31c6b21448.
- [ ] **e0489-c002** [source-code reference, lines 1030-1082](../development-pack/modules/15_purchase_orders.md#L1030) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0490: `app/Http/Requests/Api/PurchaseOrder/UpdatePurchaseOrderRequest.php`

Source: [exact contract](../development-pack/modules/15_purchase_orders.md#e0490). Complete every clause below before closing this section in the ledger.

- [ ] **e0490-c001** [prose, lines 1092-1092](../development-pack/modules/15_purchase_orders.md#L1092) -- Source evidence. SHA-256: 163f8fef07ad8a8681b7173106539d37caec25dd05d96ba1ea1b8b524fa582ce.
- [ ] **e0490-c002** [source-code reference, lines 1094-1148](../development-pack/modules/15_purchase_orders.md#L1094) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/16_suppliers.md

### e0053: Components/ProductSupplierManager

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0053). Complete every clause below before closing this section in the ledger.

- [ ] **e0053-c001** [prose, lines 96-96](../development-pack/modules/16_suppliers.md#L96) -- Repeating suppliers&#91;&#93; link editor; unbound value handlers are real fields, not omitted data. Defaults add supplier_id blank, supplier_sku blank, cost_price blank, lead_time_days blank, minim...
- [ ] **e0053-c002** [prose, lines 98-98](../development-pack/modules/16_suppliers.md#L98) -- Source: resources/js/Components/ProductSupplierManager.vue:1.
- [ ] **e0053-c003** [prose, lines 100-100](../development-pack/modules/16_suppliers.md#L100) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0053-c004** [table row, lines 102-102](../development-pack/modules/16_suppliers.md#L102) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0053-c005** [table row, lines 104-104](../development-pack/modules/16_suppliers.md#L104) -- (unbound) — resources/js/Components/ProductSupplierManager.vue:93  /  Supplier  /  select; See :value / :checked and event handler; not a v-model field  /  ; :value="row.supplier_id"; @chang...
- [ ] **e0053-c006** [table row, lines 105-105](../development-pack/modules/16_suppliers.md#L105) -- (unbound) — resources/js/Components/ProductSupplierManager.vue:114  /  Supplier SKU  /  text; See :value / :checked and event handler; not a v-model field  /  ; :value="row.supplier_sku"; ty...
- [ ] **e0053-c007** [table row, lines 106-106](../development-pack/modules/16_suppliers.md#L106) -- (unbound) — resources/js/Components/ProductSupplierManager.vue:131  /  Cost price  /  number; See :value / :checked and event handler; not a v-model field  /  ; :value="row.cost_price"; type...
- [ ] **e0053-c008** [table row, lines 107-107](../development-pack/modules/16_suppliers.md#L107) -- (unbound) — resources/js/Components/ProductSupplierManager.vue:146  /  Lead time (days)  /  number; See :value / :checked and event handler; not a v-model field  /  ; :value="row.lead_time_d...
- [ ] **e0053-c009** [table row, lines 108-108](../development-pack/modules/16_suppliers.md#L108) -- (unbound) — resources/js/Components/ProductSupplierManager.vue:160  /  Min order qty  /  number; See :value / :checked and event handler; not a v-model field  /  ; :value="row.minimum_order_...
- [ ] **e0053-c010** [table row, lines 109-109](../development-pack/modules/16_suppliers.md#L109) -- (unbound) — resources/js/Components/ProductSupplierManager.vue:175  /  Primary  /  radio; See :value / :checked and event handler; not a v-model field  /  type="radio"; name="primary-supplie...
- [ ] **e0053-c011** [prose, lines 111-111](../development-pack/modules/16_suppliers.md#L111) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0053-c012** [statement, lines 113-113](../development-pack/modules/16_suppliers.md#L113) -- - (unbound) (resources/js/Components/ProductSupplierManager.vue:93): &amp;lt;option value=""&amp;gt;{{ Select a supplier }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="supplier in options" :key="supplier.id" :...
- [ ] **e0053-c013** [prose, lines 115-115](../development-pack/modules/16_suppliers.md#L115) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0053-c014** [table row, lines 117-117](../development-pack/modules/16_suppliers.md#L117) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0053-c015** [table row, lines 119-119](../development-pack/modules/16_suppliers.md#L119) -- (icon-only; accessible label/title in attributes) — resources/js/Components/ProductSupplierManager.vue:184  /  type="button"; :aria-label="t('productSuppliers.remove')"; :title="t('productSu...
- [ ] **e0053-c016** [table row, lines 120-120](../development-pack/modules/16_suppliers.md#L120) -- Create a supplier — resources/js/Components/ProductSupplierManager.vue:202  /  :href="route('suppliers.create')"  /  v-if="options.length === 0"
- [ ] **e0053-c017** [table row, lines 121-121](../development-pack/modules/16_suppliers.md#L121) -- Add supplier — resources/js/Components/ProductSupplierManager.vue:208  /  type="button"; variant="secondary"; size="sm"; :disabled="rows.length &amp;gt;= options.length"; @click="addRow"  /  v-e...

### e0075: Shared product supplier link rules

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0075). Complete every clause below before closing this section in the ledger.

- [ ] **e0075-c001** [prose, lines 131-131](../development-pack/modules/16_suppliers.md#L131) -- Source app/Http/Requests/Concerns/ValidatesProductSuppliers.php:1
- [ ] **e0075-c002** [source-code reference, lines 133-195](../development-pack/modules/16_suppliers.md#L133) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0180: resources/js/Pages/Suppliers/Create.vue

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0180). Complete every clause below before closing this section in the ledger.

- [ ] **e0180-c001** [prose, lines 205-205](../development-pack/modules/16_suppliers.md#L205) -- Source: resources/js/Pages/Suppliers/Create.vue:1.
- [ ] **e0180-c002** [prose, lines 208-208](../development-pack/modules/16_suppliers.md#L208) -- **Named routes referenced:** suppliers.index, suppliers.store.
- [ ] **e0180-c003** [prose, lines 211-211](../development-pack/modules/16_suppliers.md#L211) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0180-c004** [prose, lines 214-214](../development-pack/modules/16_suppliers.md#L214) -- **Sections / displayed fields / table columns:**
- [ ] **e0180-c005** [statement, lines 216-216](../development-pack/modules/16_suppliers.md#L216) -- - h3: Basic Information (L80)
- [ ] **e0180-c006** [statement, lines 217-217](../development-pack/modules/16_suppliers.md#L217) -- - h3: Address (L124)
- [ ] **e0180-c007** [statement, lines 218-218](../development-pack/modules/16_suppliers.md#L218) -- - h3: Business Details (L162)
- [ ] **e0180-c008** [table row, lines 221-221](../development-pack/modules/16_suppliers.md#L221) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0180-c009** [table row, lines 224-224](../development-pack/modules/16_suppliers.md#L224) -- form.name  /  Supplier Name *  /  input / text  /  HTML required  /  —  /  resources/js/Pages/Suppliers/Create.vue:85
- [ ] **e0180-c010** [table row, lines 226-226](../development-pack/modules/16_suppliers.md#L226) -- form.code  /  Supplier Code  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:91
- [ ] **e0180-c011** [table row, lines 228-228](../development-pack/modules/16_suppliers.md#L228) -- form.contact_name  /  Contact Person  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:97
- [ ] **e0180-c012** [table row, lines 230-230](../development-pack/modules/16_suppliers.md#L230) -- form.email  /  Email  /  input / email  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:103
- [ ] **e0180-c013** [table row, lines 232-232](../development-pack/modules/16_suppliers.md#L232) -- form.phone  /  Phone  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:109
- [ ] **e0180-c014** [table row, lines 234-234](../development-pack/modules/16_suppliers.md#L234) -- form.website  /  Website  /  input / url  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:115
- [ ] **e0180-c015** [table row, lines 236-236](../development-pack/modules/16_suppliers.md#L236) -- form.address  /  Street Address  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:129
- [ ] **e0180-c016** [table row, lines 238-238](../development-pack/modules/16_suppliers.md#L238) -- form.city  /  City  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:135
- [ ] **e0180-c017** [table row, lines 240-240](../development-pack/modules/16_suppliers.md#L240) -- form.state  /  State/Province  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:141
- [ ] **e0180-c018** [table row, lines 242-242](../development-pack/modules/16_suppliers.md#L242) -- form.zip_code  /  ZIP/Postal Code  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:147
- [ ] **e0180-c019** [table row, lines 244-244](../development-pack/modules/16_suppliers.md#L244) -- form.country  /  Country  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:153
- [ ] **e0180-c020** [table row, lines 246-246](../development-pack/modules/16_suppliers.md#L246) -- form.payment_terms  /  Payment Terms  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:167
- [ ] **e0180-c021** [table row, lines 248-248](../development-pack/modules/16_suppliers.md#L248) -- form.currency  /  Currency  /  CurrencySelect  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:173
- [ ] **e0180-c022** [table row, lines 250-250](../development-pack/modules/16_suppliers.md#L250) -- form.rating  /  Rating  /  SupplierRating  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:179
- [ ] **e0180-c023** [table row, lines 252-252](../development-pack/modules/16_suppliers.md#L252) -- form.notes  /  Notes  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:186
- [ ] **e0180-c024** [table row, lines 254-254](../development-pack/modules/16_suppliers.md#L254) -- form.is_active  /  Active  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Create.vue:192
- [ ] **e0180-c025** [prose, lines 257-257](../development-pack/modules/16_suppliers.md#L257) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/Suppliers/Create.vue:22
- [ ] **e0180-c026** [source-code reference, lines 259-279](../development-pack/modules/16_suppliers.md#L259) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0180-c027** [table row, lines 283-283](../development-pack/modules/16_suppliers.md#L283) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0180-c028** [table row, lines 286-286](../development-pack/modules/16_suppliers.md#L286) -- Workspace  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Create.vue:57
- [ ] **e0180-c029** [table row, lines 288-288](../development-pack/modules/16_suppliers.md#L288) -- Suppliers  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Create.vue:59
- [ ] **e0180-c030** [table row, lines 290-290](../development-pack/modules/16_suppliers.md#L290) -- Back to Suppliers  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Create.vue:67
- [ ] **e0180-c031** [table row, lines 292-292](../development-pack/modules/16_suppliers.md#L292) -- Cancel  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Create.vue:202
- [ ] **e0180-c032** [table row, lines 294-294](../development-pack/modules/16_suppliers.md#L294) -- Create Supplier  /  type=submit; :loading=form.processing; :disabled=form.processing  /  resources/js/Pages/Suppliers/Create.vue:205
- [ ] **e0180-c033** [prose, lines 297-297](../development-pack/modules/16_suppliers.md#L297) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0180-c034** [source-code reference, lines 299-301](../development-pack/modules/16_suppliers.md#L299) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0181: resources/js/Pages/Suppliers/Edit.vue

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0181). Complete every clause below before closing this section in the ledger.

- [ ] **e0181-c001** [prose, lines 312-312](../development-pack/modules/16_suppliers.md#L312) -- Source: resources/js/Pages/Suppliers/Edit.vue:1.
- [ ] **e0181-c002** [prose, lines 315-315](../development-pack/modules/16_suppliers.md#L315) -- **Named routes referenced:** suppliers.index, suppliers.show, suppliers.update.
- [ ] **e0181-c003** [prose, lines 318-318](../development-pack/modules/16_suppliers.md#L318) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0181-c004** [prose, lines 321-321](../development-pack/modules/16_suppliers.md#L321) -- **Sections / displayed fields / table columns:**
- [ ] **e0181-c005** [statement, lines 323-323](../development-pack/modules/16_suppliers.md#L323) -- - h3: Basic Information (L85)
- [ ] **e0181-c006** [statement, lines 324-324](../development-pack/modules/16_suppliers.md#L324) -- - h3: Address (L129)
- [ ] **e0181-c007** [statement, lines 325-325](../development-pack/modules/16_suppliers.md#L325) -- - h3: Business Details (L167)
- [ ] **e0181-c008** [table row, lines 328-328](../development-pack/modules/16_suppliers.md#L328) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0181-c009** [table row, lines 331-331](../development-pack/modules/16_suppliers.md#L331) -- form.name  /  Supplier Name *  /  input / text  /  HTML required  /  —  /  resources/js/Pages/Suppliers/Edit.vue:90
- [ ] **e0181-c010** [table row, lines 333-333](../development-pack/modules/16_suppliers.md#L333) -- form.code  /  Supplier Code  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:96
- [ ] **e0181-c011** [table row, lines 335-335](../development-pack/modules/16_suppliers.md#L335) -- form.contact_name  /  Contact Person  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:102
- [ ] **e0181-c012** [table row, lines 337-337](../development-pack/modules/16_suppliers.md#L337) -- form.email  /  Email  /  input / email  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:108
- [ ] **e0181-c013** [table row, lines 339-339](../development-pack/modules/16_suppliers.md#L339) -- form.phone  /  Phone  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:114
- [ ] **e0181-c014** [table row, lines 341-341](../development-pack/modules/16_suppliers.md#L341) -- form.website  /  Website  /  input / url  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:120
- [ ] **e0181-c015** [table row, lines 343-343](../development-pack/modules/16_suppliers.md#L343) -- form.address  /  Street Address  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:134
- [ ] **e0181-c016** [table row, lines 345-345](../development-pack/modules/16_suppliers.md#L345) -- form.city  /  City  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:140
- [ ] **e0181-c017** [table row, lines 347-347](../development-pack/modules/16_suppliers.md#L347) -- form.state  /  State/Province  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:146
- [ ] **e0181-c018** [table row, lines 349-349](../development-pack/modules/16_suppliers.md#L349) -- form.zip_code  /  ZIP/Postal Code  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:152
- [ ] **e0181-c019** [table row, lines 351-351](../development-pack/modules/16_suppliers.md#L351) -- form.country  /  Country  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:158
- [ ] **e0181-c020** [table row, lines 353-353](../development-pack/modules/16_suppliers.md#L353) -- form.payment_terms  /  Payment Terms  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:172
- [ ] **e0181-c021** [table row, lines 355-355](../development-pack/modules/16_suppliers.md#L355) -- form.currency  /  Currency  /  CurrencySelect  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:178
- [ ] **e0181-c022** [table row, lines 357-357](../development-pack/modules/16_suppliers.md#L357) -- form.rating  /  Rating  /  SupplierRating  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:184
- [ ] **e0181-c023** [table row, lines 359-359](../development-pack/modules/16_suppliers.md#L359) -- form.notes  /  Notes  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:191
- [ ] **e0181-c024** [table row, lines 361-361](../development-pack/modules/16_suppliers.md#L361) -- form.is_active  /  Active  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Edit.vue:197
- [ ] **e0181-c025** [prose, lines 364-364](../development-pack/modules/16_suppliers.md#L364) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/Suppliers/Edit.vue:23
- [ ] **e0181-c026** [source-code reference, lines 366-386](../development-pack/modules/16_suppliers.md#L366) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0181-c027** [table row, lines 390-390](../development-pack/modules/16_suppliers.md#L390) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0181-c028** [table row, lines 393-393](../development-pack/modules/16_suppliers.md#L393) -- Workspace  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Edit.vue:58
- [ ] **e0181-c029** [table row, lines 395-395](../development-pack/modules/16_suppliers.md#L395) -- Suppliers  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Edit.vue:60
- [ ] **e0181-c030** [table row, lines 397-397](../development-pack/modules/16_suppliers.md#L397) -- View  /  :href=route('suppliers.show', supplier.id)  /  resources/js/Pages/Suppliers/Edit.vue:68
- [ ] **e0181-c031** [table row, lines 399-399](../development-pack/modules/16_suppliers.md#L399) -- Back to Suppliers  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Edit.vue:72
- [ ] **e0181-c032** [table row, lines 401-401](../development-pack/modules/16_suppliers.md#L401) -- Cancel  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Edit.vue:207
- [ ] **e0181-c033** [table row, lines 403-403](../development-pack/modules/16_suppliers.md#L403) -- Update Supplier  /  type=submit; :loading=form.processing; :disabled=form.processing  /  resources/js/Pages/Suppliers/Edit.vue:208
- [ ] **e0181-c034** [prose, lines 406-406](../development-pack/modules/16_suppliers.md#L406) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0181-c035** [source-code reference, lines 408-410](../development-pack/modules/16_suppliers.md#L408) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0182: resources/js/Pages/Suppliers/Index.vue

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0182). Complete every clause below before closing this section in the ledger.

- [ ] **e0182-c001** [prose, lines 421-421](../development-pack/modules/16_suppliers.md#L421) -- Source: resources/js/Pages/Suppliers/Index.vue:1.
- [ ] **e0182-c002** [prose, lines 424-424](../development-pack/modules/16_suppliers.md#L424) -- **Named routes referenced:** suppliers.create, suppliers.destroy, suppliers.edit, suppliers.index, suppliers.show.
- [ ] **e0182-c003** [prose, lines 427-427](../development-pack/modules/16_suppliers.md#L427) -- **Permission/route-capability checks:** delete_suppliers, suppliers.create, suppliers.edit.
- [ ] **e0182-c004** [prose, lines 430-430](../development-pack/modules/16_suppliers.md#L430) -- **Sections / displayed fields / table columns:**
- [ ] **e0182-c005** [statement, lines 432-432](../development-pack/modules/16_suppliers.md#L432) -- - th: Name (L105)
- [ ] **e0182-c006** [statement, lines 433-433](../development-pack/modules/16_suppliers.md#L433) -- - th: Contact (L106)
- [ ] **e0182-c007** [statement, lines 434-434](../development-pack/modules/16_suppliers.md#L434) -- - th: Email (L107)
- [ ] **e0182-c008** [statement, lines 435-435](../development-pack/modules/16_suppliers.md#L435) -- - th: Phone (L108)
- [ ] **e0182-c009** [statement, lines 436-436](../development-pack/modules/16_suppliers.md#L436) -- - th: products (L109)
- [ ] **e0182-c010** [statement, lines 437-437](../development-pack/modules/16_suppliers.md#L437) -- - th: Rating (L110)
- [ ] **e0182-c011** [statement, lines 438-438](../development-pack/modules/16_suppliers.md#L438) -- - th: Status (L111)
- [ ] **e0182-c012** [statement, lines 439-439](../development-pack/modules/16_suppliers.md#L439) -- - th: Actions (L112)
- [ ] **e0182-c013** [prose, lines 442-442](../development-pack/modules/16_suppliers.md#L442) -- **UI state/filter defaults:**
- [ ] **e0182-c014** [source-code reference, lines 444-446](../development-pack/modules/16_suppliers.md#L444) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0182-c015** [table row, lines 449-449](../development-pack/modules/16_suppliers.md#L449) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0182-c016** [table row, lines 452-452](../development-pack/modules/16_suppliers.md#L452) -- search  /  Search Suppliers  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/Suppliers/Index.vue:80
- [ ] **e0182-c017** [table row, lines 455-455](../development-pack/modules/16_suppliers.md#L455) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0182-c018** [table row, lines 458-458](../development-pack/modules/16_suppliers.md#L458) -- Add Supplier  /  v-if=canVisit('suppliers.create'); :href=route('suppliers.create')  /  resources/js/Pages/Suppliers/Index.vue:68
- [ ] **e0182-c019** [table row, lines 460-460](../development-pack/modules/16_suppliers.md#L460) -- Search  /  type=submit  /  resources/js/Pages/Suppliers/Index.vue:81
- [ ] **e0182-c020** [table row, lines 462-462](../development-pack/modules/16_suppliers.md#L462) -- Search  /  type=submit  /  resources/js/Pages/Suppliers/Index.vue:89
- [ ] **e0182-c021** [table row, lines 464-464](../development-pack/modules/16_suppliers.md#L464) -- Clear  /  type=button; @click=clearFilters  /  resources/js/Pages/Suppliers/Index.vue:93
- [ ] **e0182-c022** [table row, lines 466-466](../development-pack/modules/16_suppliers.md#L466) -- Add Supplier  /  v-if=canVisit('suppliers.create'); :href=route('suppliers.create')  /  resources/js/Pages/Suppliers/Index.vue:122
- [ ] **e0182-c023** [table row, lines 468-468](../development-pack/modules/16_suppliers.md#L468) -- Icon action  /  :href=route('suppliers.show', supplier.id)  /  resources/js/Pages/Suppliers/Index.vue:157
- [ ] **e0182-c024** [table row, lines 470-470](../development-pack/modules/16_suppliers.md#L470) -- Icon action  /  v-if=canVisit('suppliers.edit'); :href=route('suppliers.edit', supplier.id)  /  resources/js/Pages/Suppliers/Index.vue:158
- [ ] **e0182-c025** [table row, lines 472-472](../development-pack/modules/16_suppliers.md#L472) -- Icon action  /  v-if=hasPermission('delete_suppliers'); @click=deleteSupplier(supplier)  /  resources/js/Pages/Suppliers/Index.vue:159
- [ ] **e0182-c026** [prose, lines 475-475](../development-pack/modules/16_suppliers.md#L475) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0182-c027** [source-code reference, lines 477-489](../development-pack/modules/16_suppliers.md#L477) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0183: resources/js/Pages/Suppliers/Show.vue

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0183). Complete every clause below before closing this section in the ledger.

- [ ] **e0183-c001** [prose, lines 500-500](../development-pack/modules/16_suppliers.md#L500) -- Source: resources/js/Pages/Suppliers/Show.vue:1.
- [ ] **e0183-c002** [prose, lines 503-503](../development-pack/modules/16_suppliers.md#L503) -- **Named routes referenced:** products.show, suppliers.destroy, suppliers.edit, suppliers.index.
- [ ] **e0183-c003** [prose, lines 506-506](../development-pack/modules/16_suppliers.md#L506) -- **Permission/route-capability checks:** products.show, suppliers.edit.
- [ ] **e0183-c004** [prose, lines 509-509](../development-pack/modules/16_suppliers.md#L509) -- **Sections / displayed fields / table columns:**
- [ ] **e0183-c005** [statement, lines 511-511](../development-pack/modules/16_suppliers.md#L511) -- - h3: Contact Information (L79)
- [ ] **e0183-c006** [statement, lines 512-512](../development-pack/modules/16_suppliers.md#L512) -- - dt: Contact Person (L83)
- [ ] **e0183-c007** [statement, lines 513-513](../development-pack/modules/16_suppliers.md#L513) -- - dt: Email (L87)
- [ ] **e0183-c008** [statement, lines 514-514](../development-pack/modules/16_suppliers.md#L514) -- - dt: Phone (L96)
- [ ] **e0183-c009** [statement, lines 515-515](../development-pack/modules/16_suppliers.md#L515) -- - dt: Website (L100)
- [ ] **e0183-c010** [statement, lines 516-516](../development-pack/modules/16_suppliers.md#L516) -- - h3: Address (L114)
- [ ] **e0183-c011** [statement, lines 517-517](../development-pack/modules/16_suppliers.md#L517) -- - h3: Products (L134)
- [ ] **e0183-c012** [statement, lines 518-518](../development-pack/modules/16_suppliers.md#L518) -- - th: Product (L142)
- [ ] **e0183-c013** [statement, lines 519-519](../development-pack/modules/16_suppliers.md#L519) -- - th: SKU (L143)
- [ ] **e0183-c014** [statement, lines 520-520](../development-pack/modules/16_suppliers.md#L520) -- - th: Supplier SKU (L144)
- [ ] **e0183-c015** [statement, lines 521-521](../development-pack/modules/16_suppliers.md#L521) -- - th: Cost Price (L145)
- [ ] **e0183-c016** [statement, lines 522-522](../development-pack/modules/16_suppliers.md#L522) -- - h3: Business Details (L178)
- [ ] **e0183-c017** [statement, lines 523-523](../development-pack/modules/16_suppliers.md#L523) -- - dt: Rating (L182)
- [ ] **e0183-c018** [statement, lines 524-524](../development-pack/modules/16_suppliers.md#L524) -- - dt: Supplier Code (L186)
- [ ] **e0183-c019** [statement, lines 525-525](../development-pack/modules/16_suppliers.md#L525) -- - dt: Payment Terms (L190)
- [ ] **e0183-c020** [statement, lines 526-526](../development-pack/modules/16_suppliers.md#L526) -- - dt: Currency (L194)
- [ ] **e0183-c021** [statement, lines 527-527](../development-pack/modules/16_suppliers.md#L527) -- - h3: Notes (L203)
- [ ] **e0183-c022** [statement, lines 528-528](../development-pack/modules/16_suppliers.md#L528) -- - h3: Danger Zone (L211)
- [ ] **e0183-c023** [prose, lines 531-531](../development-pack/modules/16_suppliers.md#L531) -- No editable model-bound controls in this file; navigation and action-only controls listed below.
- [ ] **e0183-c024** [table row, lines 535-535](../development-pack/modules/16_suppliers.md#L535) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0183-c025** [table row, lines 538-538](../development-pack/modules/16_suppliers.md#L538) -- Workspace  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Show.vue:47
- [ ] **e0183-c026** [table row, lines 540-540](../development-pack/modules/16_suppliers.md#L540) -- Suppliers  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Show.vue:49
- [ ] **e0183-c027** [table row, lines 542-542](../development-pack/modules/16_suppliers.md#L542) -- Edit  /  v-if=canVisit('suppliers.edit'); :href=route('suppliers.edit', supplier.id)  /  resources/js/Pages/Suppliers/Show.vue:60
- [ ] **e0183-c028** [table row, lines 544-544](../development-pack/modules/16_suppliers.md#L544) -- Back  /  :href=route('suppliers.index')  /  resources/js/Pages/Suppliers/Show.vue:64
- [ ] **e0183-c029** [table row, lines 546-546](../development-pack/modules/16_suppliers.md#L546) -- product.name  /  v-if=canVisit('products.show'); :href=route('products.show', product.id)  /  resources/js/Pages/Suppliers/Show.vue:152
- [ ] **e0183-c030** [table row, lines 548-548](../development-pack/modules/16_suppliers.md#L548) -- Delete Supplier  /  @click=deleteSupplier  /  resources/js/Pages/Suppliers/Show.vue:213
- [ ] **e0183-c031** [prose, lines 551-551](../development-pack/modules/16_suppliers.md#L551) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0183-c032** [source-code reference, lines 553-561](../development-pack/modules/16_suppliers.md#L553) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0208: resources/js/Components/SupplierRating.vue

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0208). Complete every clause below before closing this section in the ledger.

- [ ] **e0208-c001** [prose, lines 572-572](../development-pack/modules/16_suppliers.md#L572) -- Source: resources/js/Components/SupplierRating.vue:1.
- [ ] **e0208-c002** [prose, lines 575-575](../development-pack/modules/16_suppliers.md#L575) -- **Named routes referenced:** Dynamic/component props; see action expressions..
- [ ] **e0208-c003** [prose, lines 578-578](../development-pack/modules/16_suppliers.md#L578) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0208-c004** [prose, lines 581-581](../development-pack/modules/16_suppliers.md#L581) -- No editable model-bound controls in this file; navigation and action-only controls listed below.
- [ ] **e0208-c005** [table row, lines 585-585](../development-pack/modules/16_suppliers.md#L585) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0208-c006** [table row, lines 588-588](../development-pack/modules/16_suppliers.md#L588) -- t('suppliers.rating.stars', { count: n })  /  type=button; @click=pick(n)  /  resources/js/Components/SupplierRating.vue:37
- [ ] **e0208-c007** [prose, lines 591-591](../development-pack/modules/16_suppliers.md#L591) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0208-c008** [source-code reference, lines 593-595](../development-pack/modules/16_suppliers.md#L593) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0213: StoreSupplierRequest.php

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0213). Complete every clause below before closing this section in the ledger.

- [ ] **e0213-c001** [prose, lines 606-606](../development-pack/modules/16_suppliers.md#L606) -- app/Http/Requests/Supplier/StoreSupplierRequest.php:1
- [ ] **e0213-c002** [source-code reference, lines 608-645](../development-pack/modules/16_suppliers.md#L608) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0214: UpdateSupplierRequest.php

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0214). Complete every clause below before closing this section in the ledger.

- [ ] **e0214-c001** [prose, lines 656-656](../development-pack/modules/16_suppliers.md#L656) -- app/Http/Requests/Supplier/UpdateSupplierRequest.php:1
- [ ] **e0214-c002** [source-code reference, lines 658-693](../development-pack/modules/16_suppliers.md#L658) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0236: app/Models/Inventory/Supplier.php

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0236). Complete every clause below before closing this section in the ledger.

- [ ] **e0236-c001** [prose, lines 704-704](../development-pack/modules/16_suppliers.md#L704) -- app/Models/Inventory/Supplier.php:1
- [ ] **e0236-c002** [source-code reference, lines 707-728](../development-pack/modules/16_suppliers.md#L707) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0236-c003** [source-code reference, lines 731-737](../development-pack/modules/16_suppliers.md#L731) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0237: app/Models/Inventory/SupplierPriceHistory.php

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0237). Complete every clause below before closing this section in the ledger.

- [ ] **e0237-c001** [prose, lines 748-748](../development-pack/modules/16_suppliers.md#L748) -- app/Models/Inventory/SupplierPriceHistory.php:1
- [ ] **e0237-c002** [source-code reference, lines 751-763](../development-pack/modules/16_suppliers.md#L751) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0237-c003** [source-code reference, lines 766-775](../development-pack/modules/16_suppliers.md#L766) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0497: `app/Http/Requests/Api/Supplier/StoreSupplierRequest.php`

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0497). Complete every clause below before closing this section in the ledger.

- [ ] **e0497-c001** [prose, lines 786-786](../development-pack/modules/16_suppliers.md#L786) -- Source evidence. SHA-256: e734b3df8c51bfe36f550d2721690e75b8387804f37550ec849d8047974f9f70.
- [ ] **e0497-c002** [source-code reference, lines 788-832](../development-pack/modules/16_suppliers.md#L788) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0498: `app/Http/Requests/Api/Supplier/UpdateSupplierRequest.php`

Source: [exact contract](../development-pack/modules/16_suppliers.md#e0498). Complete every clause below before closing this section in the ledger.

- [ ] **e0498-c001** [prose, lines 842-842](../development-pack/modules/16_suppliers.md#L842) -- Source evidence. SHA-256: 5a8bac2a6b15c6235a8494d134de03fdfc19f782599e020211e4b1b7e62dae82.
- [ ] **e0498-c002** [source-code reference, lines 844-888](../development-pack/modules/16_suppliers.md#L844) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/17_approvals.md

### e0172: Approval center and embedded panel

Source: [exact contract](../development-pack/modules/17_approvals.md#e0172). Complete every clause below before closing this section in the ledger.

- [ ] **e0172-c001** [prose, lines 85-85](../development-pack/modules/17_approvals.md#L85) -- Queue has Pending and My requests tabs (choose Pending when any pending or no own requests). Types purchase_order, stock_adjustment, stock_transfer, sales_order. Inline approve/reject notes ...
- [ ] **e0172-c002** [prose, lines 87-87](../development-pack/modules/17_approvals.md#L87) -- Permission mapping: approve_purchase_orders, approve_stock_adjustments, approve_stock_transfers, approve_orders. Server enforces organization, warehouse access, one decision under lock, self...
- [ ] **e0172-c003** [prose, lines 89-89](../development-pack/modules/17_approvals.md#L89) -- Evidence: Approval types/permission ownership, decision authorization, decision field validation.

### e0200: resources/js/Pages/Approvals/Index.vue

Source: [exact contract](../development-pack/modules/17_approvals.md#e0200). Complete every clause below before closing this section in the ledger.

- [ ] **e0200-c001** [prose, lines 99-99](../development-pack/modules/17_approvals.md#L99) -- Source: resources/js/Pages/Approvals/Index.vue:1.
- [ ] **e0200-c002** [prose, lines 102-102](../development-pack/modules/17_approvals.md#L102) -- **Named routes referenced:** Dynamic/component props; see action expressions..
- [ ] **e0200-c003** [prose, lines 105-105](../development-pack/modules/17_approvals.md#L105) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0200-c004** [prose, lines 108-108](../development-pack/modules/17_approvals.md#L108) -- **UI state/filter defaults:**
- [ ] **e0200-c005** [source-code reference, lines 110-114](../development-pack/modules/17_approvals.md#L110) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0200-c006** [table row, lines 117-117](../development-pack/modules/17_approvals.md#L117) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0200-c007** [table row, lines 120-120](../development-pack/modules/17_approvals.md#L120) -- form.notes  /  mode === 'reject' ? Reason for rejecting (required) : Note for the requester (optional)  /  textarea  /  :required=mode === 'reject'; maxlength=1000  /  —  /  resources/js/Pag...
- [ ] **e0200-c008** [prose, lines 123-123](../development-pack/modules/17_approvals.md#L123) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/Approvals/Index.vue:42
- [ ] **e0200-c009** [source-code reference, lines 125-128](../development-pack/modules/17_approvals.md#L125) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0200-c010** [table row, lines 132-132](../development-pack/modules/17_approvals.md#L132) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0200-c011** [table row, lines 135-135](../development-pack/modules/17_approvals.md#L135) -- key === 'pending' ? Waiting for me : My requests pending.length  /  type=button; @click=tab = key  /  resources/js/Pages/Approvals/Index.vue:84
- [ ] **e0200-c012** [table row, lines 137-137](../development-pack/modules/17_approvals.md#L137) -- Open  /  v-if=item.type !== 'stock_adjustment'; :href=item.url  /  resources/js/Pages/Approvals/Index.vue:137
- [ ] **e0200-c013** [table row, lines 139-139](../development-pack/modules/17_approvals.md#L139) -- Approve  /  @click=start(item, 'approve')  /  resources/js/Pages/Approvals/Index.vue:149
- [ ] **e0200-c014** [table row, lines 141-141](../development-pack/modules/17_approvals.md#L141) -- Reject  /  @click=start(item, 'reject')  /  resources/js/Pages/Approvals/Index.vue:150
- [ ] **e0200-c015** [table row, lines 143-143](../development-pack/modules/17_approvals.md#L143) -- mode === 'reject' ? Confirm rejection : Confirm approval  /  type=submit; :loading=form.processing; :disabled=form.processing  /  resources/js/Pages/Approvals/Index.vue:169
- [ ] **e0200-c016** [table row, lines 145-145](../development-pack/modules/17_approvals.md#L145) -- Cancel  /  @click=cancel  /  resources/js/Pages/Approvals/Index.vue:179
- [ ] **e0200-c017** [prose, lines 148-148](../development-pack/modules/17_approvals.md#L148) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0200-c018** [source-code reference, lines 150-155](../development-pack/modules/17_approvals.md#L150) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0201: resources/js/Components/ApprovalPanel.vue

Source: [exact contract](../development-pack/modules/17_approvals.md#e0201). Complete every clause below before closing this section in the ledger.

- [ ] **e0201-c001** [prose, lines 166-166](../development-pack/modules/17_approvals.md#L166) -- Source: resources/js/Components/ApprovalPanel.vue:1.
- [ ] **e0201-c002** [prose, lines 169-169](../development-pack/modules/17_approvals.md#L169) -- **Named routes referenced:** Dynamic/component props; see action expressions..
- [ ] **e0201-c003** [prose, lines 172-172](../development-pack/modules/17_approvals.md#L172) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0201-c004** [prose, lines 175-175](../development-pack/modules/17_approvals.md#L175) -- **Sections / displayed fields / table columns:**
- [ ] **e0201-c005** [statement, lines 177-177](../development-pack/modules/17_approvals.md#L177) -- - h3: Approval (L86)
- [ ] **e0201-c006** [prose, lines 180-180](../development-pack/modules/17_approvals.md#L180) -- **UI state/filter defaults:**
- [ ] **e0201-c007** [source-code reference, lines 182-184](../development-pack/modules/17_approvals.md#L182) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0201-c008** [table row, lines 187-187](../development-pack/modules/17_approvals.md#L187) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0201-c009** [table row, lines 190-190](../development-pack/modules/17_approvals.md#L190) -- decision.notes  /  mode === 'reject' ? Reason for rejecting (required) : Note for the requester (optional)  /  textarea  /  :required=mode === 'reject'; maxlength=1000  /  —  /  resources/js...
- [ ] **e0201-c010** [prose, lines 193-193](../development-pack/modules/17_approvals.md#L193) -- **Exact decision defaults / hydration / hidden payload** — resources/js/Components/ApprovalPanel.vue:37
- [ ] **e0201-c011** [source-code reference, lines 195-198](../development-pack/modules/17_approvals.md#L195) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0201-c012** [prose, lines 202-202](../development-pack/modules/17_approvals.md#L202) -- **Exact submission defaults / hydration / hidden payload** — resources/js/Components/ApprovalPanel.vue:38
- [ ] **e0201-c013** [source-code reference, lines 204-207](../development-pack/modules/17_approvals.md#L204) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0201-c014** [table row, lines 211-211](../development-pack/modules/17_approvals.md#L211) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0201-c015** [table row, lines 214-214](../development-pack/modules/17_approvals.md#L214) -- Submit for approval  /  v-if=canSubmit &amp;&amp; submitUrl; :loading=submission.processing; :disabled=submission.processing; @click=submit  /  resources/js/Components/ApprovalPanel.vue:103
- [ ] **e0201-c016** [table row, lines 216-216](../development-pack/modules/17_approvals.md#L216) -- Approve  /  @click=mode = 'approve'  /  resources/js/Components/ApprovalPanel.vue:115
- [ ] **e0201-c017** [table row, lines 218-218](../development-pack/modules/17_approvals.md#L218) -- Reject  /  @click=mode = 'reject'  /  resources/js/Components/ApprovalPanel.vue:116
- [ ] **e0201-c018** [table row, lines 220-220](../development-pack/modules/17_approvals.md#L220) -- mode === 'reject' ? Confirm rejection : Confirm approval  /  type=submit; :loading=decision.processing; :disabled=decision.processing  /  resources/js/Components/ApprovalPanel.vue:135
- [ ] **e0201-c019** [table row, lines 222-222](../development-pack/modules/17_approvals.md#L222) -- Cancel  /  @click=mode = null; decision.reset(); decision.clearErrors()  /  resources/js/Components/ApprovalPanel.vue:145
- [ ] **e0201-c020** [prose, lines 225-225](../development-pack/modules/17_approvals.md#L225) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0201-c021** [source-code reference, lines 227-232](../development-pack/modules/17_approvals.md#L227) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0231: routes/web/approvals.php

Source: [exact contract](../development-pack/modules/17_approvals.md#e0231). Complete every clause below before closing this section in the ledger.

- [ ] **e0231-c001** [prose, lines 243-243](../development-pack/modules/17_approvals.md#L243) -- routes/web/approvals.php:1
- [ ] **e0231-c002** [source-code reference, lines 245-253](../development-pack/modules/17_approvals.md#L245) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/18_categories.md

### e0018: Categories/Index

Source: [exact contract](../development-pack/modules/18_categories.md#e0018). Complete every clause below before closing this section in the ledger.

- [ ] **e0018-c001** [prose, lines 87-87](../development-pack/modules/18_categories.md#L87) -- GET /categories; manage_categories. Search by text, paginated cards show name, description and products_count. Create/Edit dialogs share name and description. Delete asks confirmation and UI...
- [ ] **e0018-c002** [prose, lines 89-89](../development-pack/modules/18_categories.md#L89) -- Source: resources/js/Pages/Categories/Index.vue:1.
- [ ] **e0018-c003** [prose, lines 91-91](../development-pack/modules/18_categories.md#L91) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0018-c004** [source-code reference, lines 93-104](../development-pack/modules/18_categories.md#L93) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0018-c005** [prose, lines 106-106](../development-pack/modules/18_categories.md#L106) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0018-c006** [table row, lines 108-108](../development-pack/modules/18_categories.md#L108) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0018-c007** [table row, lines 110-110](../development-pack/modules/18_categories.md#L110) -- search — resources/js/Pages/Categories/Index.vue:125  /  Search  /  text; props.filters?.search \ / \ /  ''  /  ; v-model="search"; type="text"; :placeholder="t('categories.searchPlaceholder...
- [ ] **e0018-c008** [table row, lines 111-111](../development-pack/modules/18_categories.md#L111) -- categoryForm.name — resources/js/Pages/Categories/Index.vue:249  /  Category Name *  /  text; ''  /  ; v-model="categoryForm.name"; type="text"; :placeholder="t('categories.namePlaceholder')...
- [ ] **e0018-c009** [table row, lines 112-112](../development-pack/modules/18_categories.md#L112) -- categoryForm.description — resources/js/Pages/Categories/Index.vue:262  /  Description  /  textarea; ''  /  ; v-model="categoryForm.description"; rows="3"; :placeholder="t('categories.descPl...
- [ ] **e0018-c010** [table row, lines 113-113](../development-pack/modules/18_categories.md#L113) -- categoryForm.name — resources/js/Pages/Categories/Index.vue:306  /  Category Name *  /  text; ''  /  ; v-model="categoryForm.name"; type="text"; required  /  v-if="showEditModal"
- [ ] **e0018-c011** [table row, lines 114-114](../development-pack/modules/18_categories.md#L114) -- categoryForm.description — resources/js/Pages/Categories/Index.vue:318  /  Description  /  textarea; ''  /  ; v-model="categoryForm.description"; rows="3"  /  v-if="showEditModal"
- [ ] **e0018-c012** [prose, lines 116-116](../development-pack/modules/18_categories.md#L116) -- **Read fields, columns and section headings:**
- [ ] **e0018-c013** [statement, lines 118-118](../development-pack/modules/18_categories.md#L118) -- - h3: category.name — resources/js/Pages/Categories/Index.vue:149 — v-for="category in categories.data"
- [ ] **e0018-c014** [statement, lines 119-119](../development-pack/modules/18_categories.md#L119) -- - h3: Create Category — resources/js/Pages/Categories/Index.vue:228 — v-if="showCreateModal"
- [ ] **e0018-c015** [statement, lines 120-120](../development-pack/modules/18_categories.md#L120) -- - h3: Edit Category — resources/js/Pages/Categories/Index.vue:285 — v-if="showEditModal"
- [ ] **e0018-c016** [prose, lines 122-122](../development-pack/modules/18_categories.md#L122) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0018-c017** [table row, lines 124-124](../development-pack/modules/18_categories.md#L124) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0018-c018** [table row, lines 126-126](../development-pack/modules/18_categories.md#L126) -- Add Category — resources/js/Pages/Categories/Index.vue:111  /  variant="default"; size="sm"; @click="openCreateModal"  /  No ancestor condition
- [ ] **e0018-c019** [table row, lines 127-127](../development-pack/modules/18_categories.md#L127) -- Search — resources/js/Pages/Categories/Index.vue:135  /  :loading="categoryForm.processing"; type="submit"; variant="default"; size="sm"  /  No ancestor condition
- [ ] **e0018-c020** [table row, lines 128-128](../development-pack/modules/18_categories.md#L128) -- Clear — resources/js/Pages/Categories/Index.vue:139  /  type="button"; variant="secondary"; size="sm"; @click="clearFilters"  /  No ancestor condition
- [ ] **e0018-c021** [table row, lines 129-129](../development-pack/modules/18_categories.md#L129) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Categories/Index.vue:160  /  type="button"; @click="openEditModal(category)"; :aria-label="t('common.edit')"  /  v-for=...
- [ ] **e0018-c022** [table row, lines 130-130](../development-pack/modules/18_categories.md#L130) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Categories/Index.vue:168  /  type="button"; @click="deleteCategory(category)"; :disabled="category.products_count &amp;gt; ...
- [ ] **e0018-c023** [table row, lines 131-131](../development-pack/modules/18_categories.md#L131) -- Create Your First Category — resources/js/Pages/Categories/Index.vue:186  /  variant="default"; size="sm"; @click="openCreateModal"  /  v-if="categories.data.length === 0"
- [ ] **e0018-c024** [table row, lines 132-132](../development-pack/modules/18_categories.md#L132) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Categories/Index.vue:204  /  v-if="link.url"; :href="link.url"; v-html="link.label"  /  v-if="categories.data.length &amp;g...
- [ ] **e0018-c025** [table row, lines 133-133](../development-pack/modules/18_categories.md#L133) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Categories/Index.vue:231  /  type="button"; @click="showCreateModal = false"; :aria-label="t('common.cancel')"  /  v-if...
- [ ] **e0018-c026** [table row, lines 134-134](../development-pack/modules/18_categories.md#L134) -- Cancel — resources/js/Pages/Categories/Index.vue:271  /  type="button"; variant="secondary"; size="sm"; @click="showCreateModal = false"  /  v-if="showCreateModal"
- [ ] **e0018-c027** [table row, lines 135-135](../development-pack/modules/18_categories.md#L135) -- Create Category — resources/js/Pages/Categories/Index.vue:272  /  :loading="categoryForm.processing"; type="submit"; variant="default"; size="sm"  /  v-if="showCreateModal"
- [ ] **e0018-c028** [table row, lines 136-136](../development-pack/modules/18_categories.md#L136) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Categories/Index.vue:288  /  type="button"; @click="showEditModal = false"; :aria-label="t('common.cancel')"  /  v-if="...
- [ ] **e0018-c029** [table row, lines 137-137](../development-pack/modules/18_categories.md#L137) -- Cancel — resources/js/Pages/Categories/Index.vue:326  /  type="button"; variant="secondary"; size="sm"; @click="showEditModal = false"  /  v-if="showEditModal"
- [ ] **e0018-c030** [table row, lines 138-138](../development-pack/modules/18_categories.md#L138) -- Update Category — resources/js/Pages/Categories/Index.vue:327  /  :loading="categoryForm.processing"; type="submit"; variant="default"; size="sm"  /  v-if="showEditModal"
- [ ] **e0018-c031** [prose, lines 140-140](../development-pack/modules/18_categories.md#L140) -- **Script endpoint names:** categories.index, categories.store, categories.update, categories.destroy. Match these to verb/path/permission in the route annex.

### e0062: ProductCategory/StoreProductCategoryRequest.php

Source: [exact contract](../development-pack/modules/18_categories.md#e0062). Complete every clause below before closing this section in the ledger.

- [ ] **e0062-c001** [prose, lines 150-150](../development-pack/modules/18_categories.md#L150) -- Source app/Http/Requests/ProductCategory/StoreProductCategoryRequest.php:1
- [ ] **e0062-c002** [source-code reference, lines 152-180](../development-pack/modules/18_categories.md#L152) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0063: ProductCategory/UpdateProductCategoryRequest.php

Source: [exact contract](../development-pack/modules/18_categories.md#e0063). Complete every clause below before closing this section in the ledger.

- [ ] **e0063-c001** [prose, lines 190-190](../development-pack/modules/18_categories.md#L190) -- Source app/Http/Requests/ProductCategory/UpdateProductCategoryRequest.php:1
- [ ] **e0063-c002** [source-code reference, lines 192-220](../development-pack/modules/18_categories.md#L192) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0090: ProductCategoryController.php — 113-137

Source: [exact contract](../development-pack/modules/18_categories.md#e0090). Complete every clause below before closing this section in the ledger.

- [ ] **e0090-c001** [prose, lines 230-230](../development-pack/modules/18_categories.md#L230) -- Source app/Http/Controllers/Inventory/ProductCategoryController.php:113
- [ ] **e0090-c002** [source-code reference, lines 232-253](../development-pack/modules/18_categories.md#L232) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0095: ProductCategory

Source: [exact contract](../development-pack/modules/18_categories.md#e0095). Complete every clause below before closing this section in the ledger.

- [ ] **e0095-c001** [prose, lines 262-262](../development-pack/modules/18_categories.md#L262) -- app/Models/Inventory/ProductCategory.php:1
- [ ] **e0095-c002** [source-code reference, lines 264-286](../development-pack/modules/18_categories.md#L264) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0118: 2025_10_12_034229_create_product_categories_table.php

Source: [exact contract](../development-pack/modules/18_categories.md#e0118). Complete every clause below before closing this section in the ledger.

- [ ] **e0118-c001** [prose, lines 295-295](../development-pack/modules/18_categories.md#L295) -- database/migrations/2025_10_12_034229_create_product_categories_table.php:1
- [ ] **e0118-c002** [source-code reference, lines 297-311](../development-pack/modules/18_categories.md#L297) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0478: `app/Http/Requests/Api/ProductCategory/StoreProductCategoryRequest.php`

Source: [exact contract](../development-pack/modules/18_categories.md#e0478). Complete every clause below before closing this section in the ledger.

- [ ] **e0478-c001** [prose, lines 321-321](../development-pack/modules/18_categories.md#L321) -- Source evidence. SHA-256: a9e4bf0acdad47579cee1d91a872aea52c87b91146cf4ee99663d8500990b805.
- [ ] **e0478-c002** [source-code reference, lines 323-355](../development-pack/modules/18_categories.md#L323) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0479: `app/Http/Requests/Api/ProductCategory/UpdateProductCategoryRequest.php`

Source: [exact contract](../development-pack/modules/18_categories.md#e0479). Complete every clause below before closing this section in the ledger.

- [ ] **e0479-c001** [prose, lines 365-365](../development-pack/modules/18_categories.md#L365) -- Source evidence. SHA-256: 5104c5774006f07cdc31e7061ae638dcdbbf1dccafc9b5ba46014f8fe23a649f.
- [ ] **e0479-c002** [source-code reference, lines 367-399](../development-pack/modules/18_categories.md#L367) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/19_locations.md

### e0020: Locations/Index

Source: [exact contract](../development-pack/modules/19_locations.md#e0020). Complete every clause below before closing this section in the ledger.

- [ ] **e0020-c001** [prose, lines 88-88](../development-pack/modules/19_locations.md#L88) -- GET /locations; manage_locations. Search, paginated cards show name/code/warehouse/description/capacity/product count. Create/Edit dialogs share name/code/description/warehouse_id/capacity. ...
- [ ] **e0020-c002** [prose, lines 90-90](../development-pack/modules/19_locations.md#L90) -- Source: resources/js/Pages/Locations/Index.vue:1.
- [ ] **e0020-c003** [prose, lines 92-92](../development-pack/modules/19_locations.md#L92) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0020-c004** [source-code reference, lines 94-107](../development-pack/modules/19_locations.md#L94) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0020-c005** [prose, lines 109-109](../development-pack/modules/19_locations.md#L109) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0020-c006** [table row, lines 111-111](../development-pack/modules/19_locations.md#L111) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0020-c007** [table row, lines 113-113](../development-pack/modules/19_locations.md#L113) -- search — resources/js/Pages/Locations/Index.vue:145  /  Search  /  text; props.filters?.search \ / \ /  ''  /  ; v-model="search"; type="text"; :placeholder="t('locations.searchPlaceholder')...
- [ ] **e0020-c008** [table row, lines 114-114](../development-pack/modules/19_locations.md#L114) -- locationForm.name — resources/js/Pages/Locations/Index.vue:291  /  Location Name *  /  text; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm.nam...
- [ ] **e0020-c009** [table row, lines 115-115](../development-pack/modules/19_locations.md#L115) -- locationForm.code — resources/js/Pages/Locations/Index.vue:304  /  Location Code *  /  text; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm.cod...
- [ ] **e0020-c010** [table row, lines 116-116](../development-pack/modules/19_locations.md#L116) -- locationForm.description — resources/js/Pages/Locations/Index.vue:317  /  Description  /  textarea; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationF...
- [ ] **e0020-c011** [table row, lines 117-117](../development-pack/modules/19_locations.md#L117) -- locationForm.warehouse_id — resources/js/Pages/Locations/Index.vue:327  /  Warehouse  /  select; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm...
- [ ] **e0020-c012** [table row, lines 118-118](../development-pack/modules/19_locations.md#L118) -- locationForm.capacity — resources/js/Pages/Locations/Index.vue:337  /  Capacity (units)  /  number; Derived/repeating value; see initial payload / owning child notes  /  ; v-model.number="lo...
- [ ] **e0020-c013** [table row, lines 119-119](../development-pack/modules/19_locations.md#L119) -- locationForm.name — resources/js/Pages/Locations/Index.vue:382  /  Location Name *  /  text; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm.nam...
- [ ] **e0020-c014** [table row, lines 120-120](../development-pack/modules/19_locations.md#L120) -- locationForm.code — resources/js/Pages/Locations/Index.vue:394  /  Location Code *  /  text; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm.cod...
- [ ] **e0020-c015** [table row, lines 121-121](../development-pack/modules/19_locations.md#L121) -- locationForm.description — resources/js/Pages/Locations/Index.vue:406  /  Description  /  textarea; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationF...
- [ ] **e0020-c016** [table row, lines 122-122](../development-pack/modules/19_locations.md#L122) -- locationForm.warehouse_id — resources/js/Pages/Locations/Index.vue:415  /  Warehouse  /  select; Derived/repeating value; see initial payload / owning child notes  /  ; v-model="locationForm...
- [ ] **e0020-c017** [table row, lines 123-123](../development-pack/modules/19_locations.md#L123) -- locationForm.capacity — resources/js/Pages/Locations/Index.vue:425  /  Capacity (units)  /  number; Derived/repeating value; see initial payload / owning child notes  /  ; v-model.number="lo...
- [ ] **e0020-c018** [prose, lines 125-125](../development-pack/modules/19_locations.md#L125) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0020-c019** [statement, lines 127-127](../development-pack/modules/19_locations.md#L127) -- - locationForm.warehouse_id (resources/js/Pages/Locations/Index.vue:327): &amp;lt;option :value="null"&amp;gt;{{ No warehouse }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="warehouse in warehouses" :key="wareh...
- [ ] **e0020-c020** [statement, lines 128-128](../development-pack/modules/19_locations.md#L128) -- - locationForm.warehouse_id (resources/js/Pages/Locations/Index.vue:415): &amp;lt;option :value="null"&amp;gt;{{ No warehouse }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="warehouse in warehouses" :key="wareh...
- [ ] **e0020-c021** [prose, lines 130-130](../development-pack/modules/19_locations.md#L130) -- **Read fields, columns and section headings:**
- [ ] **e0020-c022** [statement, lines 132-132](../development-pack/modules/19_locations.md#L132) -- - h3: location.name — resources/js/Pages/Locations/Index.vue:174 — v-for="location in locations.data"
- [ ] **e0020-c023** [statement, lines 133-133](../development-pack/modules/19_locations.md#L133) -- - h3: Create Location — resources/js/Pages/Locations/Index.vue:271 — v-if="showCreateModal"
- [ ] **e0020-c024** [statement, lines 134-134](../development-pack/modules/19_locations.md#L134) -- - h3: Edit Location — resources/js/Pages/Locations/Index.vue:362 — v-if="showEditModal"
- [ ] **e0020-c025** [prose, lines 136-136](../development-pack/modules/19_locations.md#L136) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0020-c026** [table row, lines 138-138](../development-pack/modules/19_locations.md#L138) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0020-c027** [table row, lines 140-140](../development-pack/modules/19_locations.md#L140) -- Print QR Labels — resources/js/Pages/Locations/Index.vue:127  /  v-if="locations.data.length &amp;gt; 0"; variant="secondary"; size="sm"; as="a"; :href="route('locations.qr.bulk-print')"; target...
- [ ] **e0020-c028** [table row, lines 141-141](../development-pack/modules/19_locations.md#L141) -- Add Location — resources/js/Pages/Locations/Index.vue:131  /  variant="default"; size="sm"; @click="openCreateModal"  /  No ancestor condition
- [ ] **e0020-c029** [table row, lines 142-142](../development-pack/modules/19_locations.md#L142) -- Search — resources/js/Pages/Locations/Index.vue:155  /  :loading="locationForm.processing"; type="submit"; variant="default"; size="sm"  /  No ancestor condition
- [ ] **e0020-c030** [table row, lines 143-143](../development-pack/modules/19_locations.md#L143) -- Clear — resources/js/Pages/Locations/Index.vue:159  /  type="button"; variant="secondary"; size="sm"; @click="clearFilters"  /  No ancestor condition
- [ ] **e0020-c031** [table row, lines 144-144](../development-pack/modules/19_locations.md#L144) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Locations/Index.vue:195  /  :href="route('locations.qr.print', location.id)"; target="_blank"; :aria-label="t('location...
- [ ] **e0020-c032** [table row, lines 145-145](../development-pack/modules/19_locations.md#L145) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Locations/Index.vue:204  /  @click="openEditModal(location)"; :aria-label="t('common.edit')"; :title="t('common.edit')"...
- [ ] **e0020-c033** [table row, lines 146-146](../development-pack/modules/19_locations.md#L146) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Locations/Index.vue:212  /  @click="deleteLocation(location)"; :disabled="location.products_count &amp;gt; 0"; :aria-label=...
- [ ] **e0020-c034** [table row, lines 147-147](../development-pack/modules/19_locations.md#L147) -- Create Your First Location — resources/js/Pages/Locations/Index.vue:230  /  variant="default"; size="sm"; @click="openCreateModal"  /  v-if="locations.data.length === 0"
- [ ] **e0020-c035** [table row, lines 148-148](../development-pack/modules/19_locations.md#L148) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Locations/Index.vue:246  /  v-if="link.url"; :href="link.url"; v-html="link.label"  /  v-if="locations.data.length &amp;gt;...
- [ ] **e0020-c036** [table row, lines 149-149](../development-pack/modules/19_locations.md#L149) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Locations/Index.vue:274  /  @click="showCreateModal = false"; :aria-label="t('locations.close')"  /  v-if="showCreateMo...
- [ ] **e0020-c037** [table row, lines 150-150](../development-pack/modules/19_locations.md#L150) -- Cancel — resources/js/Pages/Locations/Index.vue:348  /  type="button"; variant="secondary"; size="sm"; @click="showCreateModal = false"  /  v-if="showCreateModal"
- [ ] **e0020-c038** [table row, lines 151-151](../development-pack/modules/19_locations.md#L151) -- Create Location — resources/js/Pages/Locations/Index.vue:349  /  :loading="locationForm.processing"; type="submit"; variant="default"; size="sm"  /  v-if="showCreateModal"
- [ ] **e0020-c039** [table row, lines 152-152](../development-pack/modules/19_locations.md#L152) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Locations/Index.vue:365  /  @click="showEditModal = false"; :aria-label="t('locations.close')"  /  v-if="showEditModal"
- [ ] **e0020-c040** [table row, lines 153-153](../development-pack/modules/19_locations.md#L153) -- Cancel — resources/js/Pages/Locations/Index.vue:436  /  type="button"; variant="secondary"; size="sm"; @click="showEditModal = false"  /  v-if="showEditModal"
- [ ] **e0020-c041** [table row, lines 154-154](../development-pack/modules/19_locations.md#L154) -- Update Location — resources/js/Pages/Locations/Index.vue:437  /  :loading="locationForm.processing"; type="submit"; variant="default"; size="sm"  /  v-if="showEditModal"
- [ ] **e0020-c042** [prose, lines 156-156](../development-pack/modules/19_locations.md#L156) -- **Script endpoint names:** locations.index, locations.store, locations.update, locations.destroy. Match these to verb/path/permission in the route annex.

### e0064: ProductLocation/StoreProductLocationRequest.php

Source: [exact contract](../development-pack/modules/19_locations.md#e0064). Complete every clause below before closing this section in the ledger.

- [ ] **e0064-c001** [prose, lines 166-166](../development-pack/modules/19_locations.md#L166) -- Source app/Http/Requests/ProductLocation/StoreProductLocationRequest.php:1
- [ ] **e0064-c002** [source-code reference, lines 168-211](../development-pack/modules/19_locations.md#L168) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0065: ProductLocation/UpdateProductLocationRequest.php

Source: [exact contract](../development-pack/modules/19_locations.md#e0065). Complete every clause below before closing this section in the ledger.

- [ ] **e0065-c001** [prose, lines 221-221](../development-pack/modules/19_locations.md#L221) -- Source app/Http/Requests/ProductLocation/UpdateProductLocationRequest.php:1
- [ ] **e0065-c002** [source-code reference, lines 223-266](../development-pack/modules/19_locations.md#L223) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0091: ProductLocationController.php — 145-185

Source: [exact contract](../development-pack/modules/19_locations.md#e0091). Complete every clause below before closing this section in the ledger.

- [ ] **e0091-c001** [prose, lines 276-276](../development-pack/modules/19_locations.md#L276) -- Source app/Http/Controllers/Inventory/ProductLocationController.php:145
- [ ] **e0091-c002** [source-code reference, lines 278-318](../development-pack/modules/19_locations.md#L278) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0096: ProductLocation

Source: [exact contract](../development-pack/modules/19_locations.md#e0096). Complete every clause below before closing this section in the ledger.

- [ ] **e0096-c001** [prose, lines 327-327](../development-pack/modules/19_locations.md#L327) -- app/Models/Inventory/ProductLocation.php:1
- [ ] **e0096-c002** [source-code reference, lines 329-354](../development-pack/modules/19_locations.md#L329) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0119: 2025_10_12_034229_create_product_locations_table.php

Source: [exact contract](../development-pack/modules/19_locations.md#e0119). Complete every clause below before closing this section in the ledger.

- [ ] **e0119-c001** [prose, lines 363-363](../development-pack/modules/19_locations.md#L363) -- database/migrations/2025_10_12_034229_create_product_locations_table.php:1
- [ ] **e0119-c002** [source-code reference, lines 365-380](../development-pack/modules/19_locations.md#L365) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0482: `app/Http/Requests/Api/ProductLocation/StoreProductLocationRequest.php`

Source: [exact contract](../development-pack/modules/19_locations.md#e0482). Complete every clause below before closing this section in the ledger.

- [ ] **e0482-c001** [prose, lines 390-390](../development-pack/modules/19_locations.md#L390) -- Source evidence. SHA-256: a1d9a777ebd3bed1ba6dd1146e2fb293ba2b14f731a89e896df2b8f97819efcf.
- [ ] **e0482-c002** [source-code reference, lines 392-427](../development-pack/modules/19_locations.md#L392) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0483: `app/Http/Requests/Api/ProductLocation/UpdateProductLocationRequest.php`

Source: [exact contract](../development-pack/modules/19_locations.md#e0483). Complete every clause below before closing this section in the ledger.

- [ ] **e0483-c001** [prose, lines 437-437](../development-pack/modules/19_locations.md#L437) -- Source evidence. SHA-256: 4def152f63b44dfa57f112ec1ce82e23ecabe2eb11975abdf1f855cdfef1e2d4.
- [ ] **e0483-c002** [source-code reference, lines 439-474](../development-pack/modules/19_locations.md#L439) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/20_warehouses.md

### e0042: Warehouses/Create

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0042). Complete every clause below before closing this section in the ledger.

- [ ] **e0042-c001** [prose, lines 97-97](../development-pack/modules/20_warehouses.md#L97) -- GET /warehouses/create; create_warehouses. General/address/contact/settings sections; payload includes all displayed fields in table below. Country default server defaults or Canada; timezon...
- [ ] **e0042-c002** [prose, lines 99-99](../development-pack/modules/20_warehouses.md#L99) -- Source: resources/js/Pages/Warehouses/Create.vue:1.
- [ ] **e0042-c003** [prose, lines 101-101](../development-pack/modules/20_warehouses.md#L101) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0042-c004** [source-code reference, lines 103-124](../development-pack/modules/20_warehouses.md#L103) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0042-c005** [prose, lines 126-126](../development-pack/modules/20_warehouses.md#L126) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0042-c006** [table row, lines 128-128](../development-pack/modules/20_warehouses.md#L128) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0042-c007** [table row, lines 130-130](../development-pack/modules/20_warehouses.md#L130) -- form.name — resources/js/Pages/Warehouses/Create.vue:96  /  Warehouse Name  /  text; ''  /  ; v-model="form.name"; type="text"; required; autofocus; :placeholder="t('warehouses.placeholders....
- [ ] **e0042-c008** [table row, lines 131-131](../development-pack/modules/20_warehouses.md#L131) -- form.code — resources/js/Pages/Warehouses/Create.vue:110  /  Warehouse Code  /  text; ''  /  ; v-model="form.code"; type="text"; required; :placeholder="t('warehouses.placeholders.code')"  /...
- [ ] **e0042-c009** [table row, lines 132-132](../development-pack/modules/20_warehouses.md#L132) -- form.description — resources/js/Pages/Warehouses/Create.vue:123  /  Description  /  textarea; ''  /  ; v-model="form.description"; rows="3"; :placeholder="t('warehouses.placeholders.descript...
- [ ] **e0042-c010** [table row, lines 133-133](../development-pack/modules/20_warehouses.md#L133) -- form.address_line_1 — resources/js/Pages/Warehouses/Create.vue:143  /  Address Line 1  /  text; ''  /  ; v-model="form.address_line_1"; type="text"; :placeholder="t('warehouses.placeholders....
- [ ] **e0042-c011** [table row, lines 134-134](../development-pack/modules/20_warehouses.md#L134) -- form.address_line_2 — resources/js/Pages/Warehouses/Create.vue:155  /  Address Line 2  /  text; ''  /  ; v-model="form.address_line_2"; type="text"; :placeholder="t('warehouses.placeholders....
- [ ] **e0042-c012** [table row, lines 135-135](../development-pack/modules/20_warehouses.md#L135) -- form.city — resources/js/Pages/Warehouses/Create.vue:167  /  City  /  text; ''  /  ; v-model="form.city"; type="text"  /  Always within this view/dialog; see component visibility
- [ ] **e0042-c013** [table row, lines 136-136](../development-pack/modules/20_warehouses.md#L136) -- form.province — resources/js/Pages/Warehouses/Create.vue:178  /  Province / State  /  text; ''  /  ; v-model="form.province"; type="text"  /  Always within this view/dialog; see component vi...
- [ ] **e0042-c014** [table row, lines 137-137](../development-pack/modules/20_warehouses.md#L137) -- form.postal_code — resources/js/Pages/Warehouses/Create.vue:189  /  Postal Code  /  text; ''  /  ; v-model="form.postal_code"; type="text"; :placeholder="t('warehouses.placeholders.postalCod...
- [ ] **e0042-c015** [table row, lines 138-138](../development-pack/modules/20_warehouses.md#L138) -- form.country — resources/js/Pages/Warehouses/Create.vue:201  /  Country  /  text; props.defaults.country \ / \ /  'Canada'  /  ; v-model="form.country"; type="text"  /  Always within this vi...
- [ ] **e0042-c016** [table row, lines 139-139](../development-pack/modules/20_warehouses.md#L139) -- form.phone — resources/js/Pages/Warehouses/Create.vue:220  /  Phone  /  text; ''  /  ; v-model="form.phone"; type="text"  /  Always within this view/dialog; see component visibility
- [ ] **e0042-c017** [table row, lines 140-140](../development-pack/modules/20_warehouses.md#L140) -- form.email — resources/js/Pages/Warehouses/Create.vue:231  /  Email  /  email; ''  /  ; v-model="form.email"; type="email"  /  Always within this view/dialog; see component visibility
- [ ] **e0042-c018** [table row, lines 141-141](../development-pack/modules/20_warehouses.md#L141) -- form.manager_name — resources/js/Pages/Warehouses/Create.vue:242  /  Manager Name  /  text; ''  /  ; v-model="form.manager_name"; type="text"  /  Always within this view/dialog; see componen...
- [ ] **e0042-c019** [table row, lines 142-142](../development-pack/modules/20_warehouses.md#L142) -- form.timezone — resources/js/Pages/Warehouses/Create.vue:261  /  Timezone  /  select; props.defaults.timezone \ / \ /  'America/Toronto'  /  ; v-model="form.timezone"  /  Always within this ...
- [ ] **e0042-c020** [table row, lines 143-143](../development-pack/modules/20_warehouses.md#L143) -- form.currency — resources/js/Pages/Warehouses/Create.vue:275  /  Currency  /  CurrencySelect; props.defaults.currency \ / \ /  organizationCurrency.value  /  ; v-model="form.currency"  /  Al...
- [ ] **e0042-c021** [table row, lines 144-144](../development-pack/modules/20_warehouses.md#L144) -- form.priority — resources/js/Pages/Warehouses/Create.vue:285  /  Priority  /  number; 0  /  ; v-model="form.priority"; type="number"; min="0"; placeholder="0"  /  Always within this view/dia...
- [ ] **e0042-c022** [table row, lines 145-145](../development-pack/modules/20_warehouses.md#L145) -- form.capacity — resources/js/Pages/Warehouses/Create.vue:299  /  Capacity (units)  /  number; null  /  ; v-model.number="form.capacity"; type="number"; min="0"  /  Always within this view/di...
- [ ] **e0042-c023** [table row, lines 146-146](../development-pack/modules/20_warehouses.md#L146) -- form.is_active — resources/js/Pages/Warehouses/Create.vue:306  /  Active  /  checkbox; true  /  type="checkbox"; v-model="form.is_active"  /  Always within this view/dialog; see component vi...
- [ ] **e0042-c024** [prose, lines 148-148](../development-pack/modules/20_warehouses.md#L148) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0042-c025** [statement, lines 150-150](../development-pack/modules/20_warehouses.md#L150) -- - form.timezone (resources/js/Pages/Warehouses/Create.vue:261): &amp;lt;option v-for="tz in timezones" :key="tz.value" :value="tz.value"&amp;gt; {{ tz.label }} &amp;lt;/option&amp;gt;
- [ ] **e0042-c026** [prose, lines 152-152](../development-pack/modules/20_warehouses.md#L152) -- **Read fields, columns and section headings:**
- [ ] **e0042-c027** [statement, lines 154-154](../development-pack/modules/20_warehouses.md#L154) -- - h3: General — resources/js/Pages/Warehouses/Create.vue:91
- [ ] **e0042-c028** [statement, lines 155-155](../development-pack/modules/20_warehouses.md#L155) -- - h3: Address — resources/js/Pages/Warehouses/Create.vue:138
- [ ] **e0042-c029** [statement, lines 156-156](../development-pack/modules/20_warehouses.md#L156) -- - h3: Contact — resources/js/Pages/Warehouses/Create.vue:215
- [ ] **e0042-c030** [statement, lines 157-157](../development-pack/modules/20_warehouses.md#L157) -- - h3: Settings — resources/js/Pages/Warehouses/Create.vue:256
- [ ] **e0042-c031** [prose, lines 159-159](../development-pack/modules/20_warehouses.md#L159) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0042-c032** [table row, lines 161-161](../development-pack/modules/20_warehouses.md#L161) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0042-c033** [table row, lines 163-163](../development-pack/modules/20_warehouses.md#L163) -- Workspace — resources/js/Pages/Warehouses/Create.vue:71  /  :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0042-c034** [table row, lines 164-164](../development-pack/modules/20_warehouses.md#L164) -- Warehouses — resources/js/Pages/Warehouses/Create.vue:73  /  :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0042-c035** [table row, lines 165-165](../development-pack/modules/20_warehouses.md#L165) -- Back to Warehouses — resources/js/Pages/Warehouses/Create.vue:81  /  variant="secondary"; size="sm"; as="Link"; :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0042-c036** [table row, lines 166-166](../development-pack/modules/20_warehouses.md#L166) -- Cancel — resources/js/Pages/Warehouses/Create.vue:320  /  variant="secondary"; as="Link"; :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0042-c037** [table row, lines 167-167](../development-pack/modules/20_warehouses.md#L167) -- Create Warehouse — resources/js/Pages/Warehouses/Create.vue:321  /  type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing"  /  No ancestor condition
- [ ] **e0042-c038** [prose, lines 169-169](../development-pack/modules/20_warehouses.md#L169) -- **Script endpoint names:** warehouses.store. Match these to verb/path/permission in the route annex.

### e0043: Warehouses/Edit

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0043). Complete every clause below before closing this section in the ledger.

- [ ] **e0043-c001** [prose, lines 179-179](../development-pack/modules/20_warehouses.md#L179) -- GET /warehouses/{warehouse}/edit; edit_warehouses OR manage_warehouse_users. Metadata form renders only edit_warehouses; separate users form only manage_warehouse_users. User search filters ...
- [ ] **e0043-c002** [prose, lines 181-181](../development-pack/modules/20_warehouses.md#L181) -- Source: resources/js/Pages/Warehouses/Edit.vue:1.
- [ ] **e0043-c003** [prose, lines 183-183](../development-pack/modules/20_warehouses.md#L183) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0043-c004** [source-code reference, lines 185-212](../development-pack/modules/20_warehouses.md#L185) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0043-c005** [prose, lines 214-214](../development-pack/modules/20_warehouses.md#L214) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0043-c006** [table row, lines 216-216](../development-pack/modules/20_warehouses.md#L216) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0043-c007** [table row, lines 218-218](../development-pack/modules/20_warehouses.md#L218) -- form.name — resources/js/Pages/Warehouses/Edit.vue:130  /  Warehouse Name  /  text; props.warehouse.name \ / \ /  ''  /  ; v-model="form.name"; type="text"; required; :placeholder="t('wareho...
- [ ] **e0043-c008** [table row, lines 219-219](../development-pack/modules/20_warehouses.md#L219) -- form.code — resources/js/Pages/Warehouses/Edit.vue:136  /  Warehouse Code  /  text; props.warehouse.code \ / \ /  ''  /  ; v-model="form.code"; type="text"; required; :placeholder="t('wareho...
- [ ] **e0043-c009** [table row, lines 220-220](../development-pack/modules/20_warehouses.md#L220) -- form.description — resources/js/Pages/Warehouses/Edit.vue:142  /  Description  /  textarea; props.warehouse.description \ / \ /  ''  /  ; v-model="form.description"; rows="3"; :placeholder="...
- [ ] **e0043-c010** [table row, lines 221-221](../development-pack/modules/20_warehouses.md#L221) -- form.address_line_1 — resources/js/Pages/Warehouses/Edit.vue:156  /  Address Line 1  /  text; props.warehouse.address_line_1 \ / \ /  ''  /  ; v-model="form.address_line_1"; type="text"; :pl...
- [ ] **e0043-c011** [table row, lines 222-222](../development-pack/modules/20_warehouses.md#L222) -- form.address_line_2 — resources/js/Pages/Warehouses/Edit.vue:162  /  Address Line 2  /  text; props.warehouse.address_line_2 \ / \ /  ''  /  ; v-model="form.address_line_2"; type="text"; :pl...
- [ ] **e0043-c012** [table row, lines 223-223](../development-pack/modules/20_warehouses.md#L223) -- form.city — resources/js/Pages/Warehouses/Edit.vue:168  /  City  /  text; props.warehouse.city \ / \ /  ''  /  ; v-model="form.city"; type="text"  /  v-if="hasPermission('edit_warehouses')"
- [ ] **e0043-c013** [table row, lines 224-224](../development-pack/modules/20_warehouses.md#L224) -- form.province — resources/js/Pages/Warehouses/Edit.vue:174  /  Province / State  /  text; props.warehouse.province \ / \ /  ''  /  ; v-model="form.province"; type="text"  /  v-if="hasPermiss...
- [ ] **e0043-c014** [table row, lines 225-225](../development-pack/modules/20_warehouses.md#L225) -- form.postal_code — resources/js/Pages/Warehouses/Edit.vue:180  /  Postal Code  /  text; props.warehouse.postal_code \ / \ /  ''  /  ; v-model="form.postal_code"; type="text"; :placeholder="t...
- [ ] **e0043-c015** [table row, lines 226-226](../development-pack/modules/20_warehouses.md#L226) -- form.country — resources/js/Pages/Warehouses/Edit.vue:186  /  Country  /  text; props.warehouse.country \ / \ /  'Canada'  /  ; v-model="form.country"; type="text"  /  v-if="hasPermission('e...
- [ ] **e0043-c016** [table row, lines 227-227](../development-pack/modules/20_warehouses.md#L227) -- form.phone — resources/js/Pages/Warehouses/Edit.vue:200  /  Phone  /  text; props.warehouse.phone \ / \ /  ''  /  ; v-model="form.phone"; type="text"  /  v-if="hasPermission('edit_warehouses...
- [ ] **e0043-c017** [table row, lines 228-228](../development-pack/modules/20_warehouses.md#L228) -- form.email — resources/js/Pages/Warehouses/Edit.vue:206  /  Email  /  email; props.warehouse.email \ / \ /  ''  /  ; v-model="form.email"; type="email"  /  v-if="hasPermission('edit_warehous...
- [ ] **e0043-c018** [table row, lines 229-229](../development-pack/modules/20_warehouses.md#L229) -- form.manager_name — resources/js/Pages/Warehouses/Edit.vue:212  /  Manager Name  /  text; props.warehouse.manager_name \ / \ /  ''  /  ; v-model="form.manager_name"; type="text"  /  v-if="ha...
- [ ] **e0043-c019** [table row, lines 230-230](../development-pack/modules/20_warehouses.md#L230) -- form.timezone — resources/js/Pages/Warehouses/Edit.vue:226  /  Timezone  /  select; props.warehouse.timezone \ / \ /  'America/Toronto'  /  ; v-model="form.timezone"  /  v-if="hasPermission(...
- [ ] **e0043-c020** [table row, lines 231-231](../development-pack/modules/20_warehouses.md#L231) -- form.currency — resources/js/Pages/Warehouses/Edit.vue:236  /  Currency  /  CurrencySelect; props.warehouse.currency \ / \ /  organizationCurrency.value  /  ; v-model="form.currency"  /  v-i...
- [ ] **e0043-c021** [table row, lines 232-232](../development-pack/modules/20_warehouses.md#L232) -- form.priority — resources/js/Pages/Warehouses/Edit.vue:242  /  Priority  /  number; props.warehouse.priority ?? 0  /  ; v-model="form.priority"; type="number"; min="0"; placeholder="0"  /  v...
- [ ] **e0043-c022** [table row, lines 233-233](../development-pack/modules/20_warehouses.md#L233) -- form.capacity — resources/js/Pages/Warehouses/Edit.vue:249  /  Capacity (units)  /  number; props.warehouse.capacity ?? null  /  ; v-model.number="form.capacity"; type="number"; min="0"  /  ...
- [ ] **e0043-c023** [table row, lines 234-234](../development-pack/modules/20_warehouses.md#L234) -- form.is_active — resources/js/Pages/Warehouses/Edit.vue:256  /  Active  /  checkbox; props.warehouse.is_active ?? true  /  type="checkbox"; v-model="form.is_active"  /  v-if="hasPermission('...
- [ ] **e0043-c024** [table row, lines 235-235](../development-pack/modules/20_warehouses.md#L235) -- userSearch — resources/js/Pages/Warehouses/Edit.vue:287  /  No explicit label / see context  /  text; ''  /  v-model="userSearch"; type="text"; :placeholder="t('warehouses.users.searchPlaceh...
- [ ] **e0043-c025** [table row, lines 236-236](../development-pack/modules/20_warehouses.md#L236) -- (unbound) — resources/js/Pages/Warehouses/Edit.vue:302  /  user.name user.email All warehouses  /  checkbox; See :value / :checked and event handler; not a v-model field  /  type="checkbox";...
- [ ] **e0043-c026** [prose, lines 238-238](../development-pack/modules/20_warehouses.md#L238) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0043-c027** [statement, lines 240-240](../development-pack/modules/20_warehouses.md#L240) -- - form.timezone (resources/js/Pages/Warehouses/Edit.vue:226): &amp;lt;option v-for="tz in timezones" :key="tz.value" :value="tz.value"&amp;gt; {{ tz.label }} &amp;lt;/option&amp;gt;
- [ ] **e0043-c028** [prose, lines 242-242](../development-pack/modules/20_warehouses.md#L242) -- **Read fields, columns and section headings:**
- [ ] **e0043-c029** [statement, lines 244-244](../development-pack/modules/20_warehouses.md#L244) -- - h3: General — resources/js/Pages/Warehouses/Edit.vue:125 — v-if="hasPermission('edit_warehouses')"
- [ ] **e0043-c030** [statement, lines 245-245](../development-pack/modules/20_warehouses.md#L245) -- - h3: Address — resources/js/Pages/Warehouses/Edit.vue:151 — v-if="hasPermission('edit_warehouses')"
- [ ] **e0043-c031** [statement, lines 246-246](../development-pack/modules/20_warehouses.md#L246) -- - h3: Contact — resources/js/Pages/Warehouses/Edit.vue:195 — v-if="hasPermission('edit_warehouses')"
- [ ] **e0043-c032** [statement, lines 247-247](../development-pack/modules/20_warehouses.md#L247) -- - h3: Settings — resources/js/Pages/Warehouses/Edit.vue:221 — v-if="hasPermission('edit_warehouses')"
- [ ] **e0043-c033** [statement, lines 248-248](../development-pack/modules/20_warehouses.md#L248) -- - h3: User access — resources/js/Pages/Warehouses/Edit.vue:282 — v-if="hasPermission('manage_warehouse_users')"
- [ ] **e0043-c034** [prose, lines 250-250](../development-pack/modules/20_warehouses.md#L250) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0043-c035** [table row, lines 252-252](../development-pack/modules/20_warehouses.md#L252) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0043-c036** [table row, lines 254-254](../development-pack/modules/20_warehouses.md#L254) -- Workspace — resources/js/Pages/Warehouses/Edit.vue:105  /  :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0043-c037** [table row, lines 255-255](../development-pack/modules/20_warehouses.md#L255) -- Warehouses — resources/js/Pages/Warehouses/Edit.vue:107  /  :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0043-c038** [table row, lines 256-256](../development-pack/modules/20_warehouses.md#L256) -- Back to Warehouses — resources/js/Pages/Warehouses/Edit.vue:115  /  variant="secondary"; size="sm"; as="Link"; :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0043-c039** [table row, lines 257-257](../development-pack/modules/20_warehouses.md#L257) -- Cancel — resources/js/Pages/Warehouses/Edit.vue:270  /  variant="secondary"; as="Link"; :href="route('warehouses.index')"  /  v-if="hasPermission('edit_warehouses')"
- [ ] **e0043-c040** [table row, lines 258-258](../development-pack/modules/20_warehouses.md#L258) -- Update Warehouse — resources/js/Pages/Warehouses/Edit.vue:273  /  type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing"  /  v-if="hasPermission('edit_ware...
- [ ] **e0043-c041** [table row, lines 259-259](../development-pack/modules/20_warehouses.md#L259) -- Save user access — resources/js/Pages/Warehouses/Edit.vue:324  /  type="submit"; variant="default"; size="sm"; :loading="usersForm.processing"; :disabled="usersForm.processing"  /  v-if="has...
- [ ] **e0043-c042** [prose, lines 261-261](../development-pack/modules/20_warehouses.md#L261) -- **Script endpoint names:** warehouses.update, warehouses.users.update. Match these to verb/path/permission in the route annex.

### e0044: Warehouses/Index

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0044). Complete every clause below before closing this section in the ledger.

- [ ] **e0044-c001** [prose, lines 271-271](../development-pack/modules/20_warehouses.md#L271) -- GET /warehouses; view_warehouses. Search; table name/code/city-province/location count/status/default/actions. Permission-specific create/view/edit/set-default/delete. Organization access-po...
- [ ] **e0044-c002** [prose, lines 273-273](../development-pack/modules/20_warehouses.md#L273) -- Source: resources/js/Pages/Warehouses/Index.vue:1.
- [ ] **e0044-c003** [prose, lines 275-275](../development-pack/modules/20_warehouses.md#L275) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0044-c004** [source-code reference, lines 277-280](../development-pack/modules/20_warehouses.md#L277) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0044-c005** [prose, lines 282-282](../development-pack/modules/20_warehouses.md#L282) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0044-c006** [table row, lines 284-284](../development-pack/modules/20_warehouses.md#L284) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0044-c007** [table row, lines 286-286](../development-pack/modules/20_warehouses.md#L286) -- search — resources/js/Pages/Warehouses/Index.vue:89  /  Search Warehouses  /  text; props.filters?.search \ / \ /  ''  /  ; v-model="search"; type="text"; :placeholder="t('warehouses.searchP...
- [ ] **e0044-c008** [table row, lines 287-287](../development-pack/modules/20_warehouses.md#L287) -- (unbound) — resources/js/Pages/Warehouses/Index.vue:94  /  Restrict users to their assigned warehouses Users assigned to warehouses only see and move stock in those warehouses. Turn this on ...
- [ ] **e0044-c009** [prose, lines 289-289](../development-pack/modules/20_warehouses.md#L289) -- **Read fields, columns and section headings:**
- [ ] **e0044-c010** [statement, lines 291-291](../development-pack/modules/20_warehouses.md#L291) -- - th: Name — resources/js/Pages/Warehouses/Index.vue:107
- [ ] **e0044-c011** [statement, lines 292-292](../development-pack/modules/20_warehouses.md#L292) -- - th: Code — resources/js/Pages/Warehouses/Index.vue:108
- [ ] **e0044-c012** [statement, lines 293-293](../development-pack/modules/20_warehouses.md#L293) -- - th: City / Province — resources/js/Pages/Warehouses/Index.vue:109
- [ ] **e0044-c013** [statement, lines 294-294](../development-pack/modules/20_warehouses.md#L294) -- - th: Locations — resources/js/Pages/Warehouses/Index.vue:110
- [ ] **e0044-c014** [statement, lines 295-295](../development-pack/modules/20_warehouses.md#L295) -- - th: Status — resources/js/Pages/Warehouses/Index.vue:111
- [ ] **e0044-c015** [statement, lines 296-296](../development-pack/modules/20_warehouses.md#L296) -- - th: Default — resources/js/Pages/Warehouses/Index.vue:112
- [ ] **e0044-c016** [statement, lines 297-297](../development-pack/modules/20_warehouses.md#L297) -- - th: Actions — resources/js/Pages/Warehouses/Index.vue:113
- [ ] **e0044-c017** [prose, lines 299-299](../development-pack/modules/20_warehouses.md#L299) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0044-c018** [table row, lines 301-301](../development-pack/modules/20_warehouses.md#L301) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0044-c019** [table row, lines 303-303](../development-pack/modules/20_warehouses.md#L303) -- Add Warehouse — resources/js/Pages/Warehouses/Index.vue:74  /  v-if="hasPermission('create_warehouses')"; variant="default"; size="sm"; as="Link"; :href="route('warehouses.create')"  /  No a...
- [ ] **e0044-c020** [table row, lines 304-304](../development-pack/modules/20_warehouses.md#L304) -- Add Warehouse — resources/js/Pages/Warehouses/Index.vue:123  /  v-if="hasPermission('create_warehouses')"; variant="default"; size="sm"; as="Link"; :href="route('warehouses.create')"  /  v-i...
- [ ] **e0044-c021** [table row, lines 305-305](../development-pack/modules/20_warehouses.md#L305) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Warehouses/Index.vue:159  /  :href="route('warehouses.show', warehouse.id)"; :title="t('common.view')"  /  v-for="wareh...
- [ ] **e0044-c022** [table row, lines 306-306](../development-pack/modules/20_warehouses.md#L306) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Warehouses/Index.vue:160  /  v-if="hasPermission('edit_warehouses')"; :href="route('warehouses.edit', warehouse.id)"; :...
- [ ] **e0044-c023** [table row, lines 307-307](../development-pack/modules/20_warehouses.md#L307) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Warehouses/Index.vue:161  /  v-if="hasPermission('edit_warehouses') &amp;&amp; !warehouse.is_default"; type="button"; @click="m...
- [ ] **e0044-c024** [table row, lines 308-308](../development-pack/modules/20_warehouses.md#L308) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Warehouses/Index.vue:171  /  v-if="hasPermission('delete_warehouses')"; @click="deleteWarehouse(warehouse)"; :title="t(...
- [ ] **e0044-c025** [table row, lines 309-309](../development-pack/modules/20_warehouses.md#L309) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Warehouses/Index.vue:194  /  v-if="link.url"; :href="link.url"; v-html="link.label"  /  v-if="warehouses.data.length &amp;g...
- [ ] **e0044-c026** [prose, lines 311-311](../development-pack/modules/20_warehouses.md#L311) -- **Script endpoint names:** warehouses.access-policy, warehouses.index, warehouses.set-default, warehouses.destroy. Match these to verb/path/permission in the route annex.

### e0045: Warehouses/Show

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0045). Complete every clause below before closing this section in the ledger.

- [ ] **e0045-c001** [prose, lines 321-321](../development-pack/modules/20_warehouses.md#L321) -- GET /warehouses/{warehouse}; view_warehouses. Stats locations/on-hand/users/capacity, details/address, locations table name/code/products/on_hand/capacity and assigned user list. Make-defaul...
- [ ] **e0045-c002** [prose, lines 323-323](../development-pack/modules/20_warehouses.md#L323) -- Source: resources/js/Pages/Warehouses/Show.vue:1.
- [ ] **e0045-c003** [prose, lines 325-325](../development-pack/modules/20_warehouses.md#L325) -- **Input fields:** none in this page/component template.
- [ ] **e0045-c004** [prose, lines 328-328](../development-pack/modules/20_warehouses.md#L328) -- **Read fields, columns and section headings:**
- [ ] **e0045-c005** [statement, lines 330-330](../development-pack/modules/20_warehouses.md#L330) -- - h3: Warehouse Details — resources/js/Pages/Warehouses/Show.vue:124
- [ ] **e0045-c006** [statement, lines 331-331](../development-pack/modules/20_warehouses.md#L331) -- - dt: Manager — resources/js/Pages/Warehouses/Show.vue:128
- [ ] **e0045-c007** [statement, lines 332-332](../development-pack/modules/20_warehouses.md#L332) -- - dt: Email — resources/js/Pages/Warehouses/Show.vue:132
- [ ] **e0045-c008** [statement, lines 333-333](../development-pack/modules/20_warehouses.md#L333) -- - dt: Phone — resources/js/Pages/Warehouses/Show.vue:141
- [ ] **e0045-c009** [statement, lines 334-334](../development-pack/modules/20_warehouses.md#L334) -- - dt: Timezone — resources/js/Pages/Warehouses/Show.vue:145
- [ ] **e0045-c010** [statement, lines 335-335](../development-pack/modules/20_warehouses.md#L335) -- - dt: Currency — resources/js/Pages/Warehouses/Show.vue:149
- [ ] **e0045-c011** [statement, lines 336-336](../development-pack/modules/20_warehouses.md#L336) -- - dt: Priority — resources/js/Pages/Warehouses/Show.vue:153
- [ ] **e0045-c012** [statement, lines 337-337](../development-pack/modules/20_warehouses.md#L337) -- - dt: Description — resources/js/Pages/Warehouses/Show.vue:157 — v-if="warehouse.description"
- [ ] **e0045-c013** [statement, lines 338-338](../development-pack/modules/20_warehouses.md#L338) -- - h3: Address — resources/js/Pages/Warehouses/Show.vue:166
- [ ] **e0045-c014** [statement, lines 339-339](../development-pack/modules/20_warehouses.md#L339) -- - h3: Locations ({count}) — resources/js/Pages/Warehouses/Show.vue:186
- [ ] **e0045-c015** [statement, lines 340-340](../development-pack/modules/20_warehouses.md#L340) -- - th: Name — resources/js/Pages/Warehouses/Show.vue:192 — v-if="locations &amp;&amp; locations.length &amp;gt; 0"
- [ ] **e0045-c016** [statement, lines 341-341](../development-pack/modules/20_warehouses.md#L341) -- - th: Code — resources/js/Pages/Warehouses/Show.vue:193 — v-if="locations &amp;&amp; locations.length &amp;gt; 0"
- [ ] **e0045-c017** [statement, lines 342-342](../development-pack/modules/20_warehouses.md#L342) -- - th: Products — resources/js/Pages/Warehouses/Show.vue:194 — v-if="locations &amp;&amp; locations.length &amp;gt; 0"
- [ ] **e0045-c018** [statement, lines 343-343](../development-pack/modules/20_warehouses.md#L343) -- - th: On hand — resources/js/Pages/Warehouses/Show.vue:195 — v-if="locations &amp;&amp; locations.length &amp;gt; 0"
- [ ] **e0045-c019** [statement, lines 344-344](../development-pack/modules/20_warehouses.md#L344) -- - th: Capacity — resources/js/Pages/Warehouses/Show.vue:196 — v-if="locations &amp;&amp; locations.length &amp;gt; 0"
- [ ] **e0045-c020** [statement, lines 345-345](../development-pack/modules/20_warehouses.md#L345) -- - h3: Assigned users ({count}) — resources/js/Pages/Warehouses/Show.vue:242
- [ ] **e0045-c021** [statement, lines 346-346](../development-pack/modules/20_warehouses.md#L346) -- - h3: Actions — resources/js/Pages/Warehouses/Show.vue:276 — v-if="hasPermission('edit_warehouses') \|\| (hasPermission('delete_warehouses') &amp;&amp; !warehouse.is_default)"
- [ ] **e0045-c022** [statement, lines 347-347](../development-pack/modules/20_warehouses.md#L347) -- - h3: Danger Zone — resources/js/Pages/Warehouses/Show.vue:300 — v-if="hasPermission('delete_warehouses') &amp;&amp; !warehouse.is_default"
- [ ] **e0045-c023** [prose, lines 349-349](../development-pack/modules/20_warehouses.md#L349) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0045-c024** [table row, lines 351-351](../development-pack/modules/20_warehouses.md#L351) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0045-c025** [table row, lines 353-353](../development-pack/modules/20_warehouses.md#L353) -- Workspace — resources/js/Pages/Warehouses/Show.vue:47  /  :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0045-c026** [table row, lines 354-354](../development-pack/modules/20_warehouses.md#L354) -- Warehouses — resources/js/Pages/Warehouses/Show.vue:49  /  :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0045-c027** [table row, lines 355-355](../development-pack/modules/20_warehouses.md#L355) -- Edit — resources/js/Pages/Warehouses/Show.vue:64  /  v-if="hasPermission('edit_warehouses')"; variant="default"; size="sm"; as="Link"; :href="route('warehouses.edit', warehouse.id)"  /  No a...
- [ ] **e0045-c028** [table row, lines 356-356](../development-pack/modules/20_warehouses.md#L356) -- Back — resources/js/Pages/Warehouses/Show.vue:74  /  variant="secondary"; size="sm"; as="Link"; :href="route('warehouses.index')"  /  No ancestor condition
- [ ] **e0045-c029** [table row, lines 357-357](../development-pack/modules/20_warehouses.md#L357) -- warehouse.email — resources/js/Pages/Warehouses/Show.vue:134  /  v-if="warehouse.email"; :href="mailto:${warehouse.email}"  /  No ancestor condition
- [ ] **e0045-c030** [table row, lines 358-358](../development-pack/modules/20_warehouses.md#L358) -- Manage user access — resources/js/Pages/Warehouses/Show.vue:260  /  v-if="hasPermission('manage_warehouse_users')"; variant="secondary"; size="sm"; as="Link"; :href="${route('warehouses.edit...
- [ ] **e0045-c031** [table row, lines 359-359](../development-pack/modules/20_warehouses.md#L359) -- Edit Warehouse — resources/js/Pages/Warehouses/Show.vue:278  /  v-if="hasPermission('edit_warehouses')"; variant="default"; as="Link"; :href="route('warehouses.edit', warehouse.id)"  /  v-if...
- [ ] **e0045-c032** [table row, lines 360-360](../development-pack/modules/20_warehouses.md#L360) -- Make default — resources/js/Pages/Warehouses/Show.vue:289  /  variant="secondary"; @click="makeDefault"  /  v-if="hasPermission('edit_warehouses') \ / \ /  (hasPermission('delete_warehouses'...
- [ ] **e0045-c033** [table row, lines 361-361](../development-pack/modules/20_warehouses.md#L361) -- Delete Warehouse — resources/js/Pages/Warehouses/Show.vue:302  /  variant="danger"; @click="deleteWarehouse"  /  v-if="hasPermission('delete_warehouses') &amp;&amp; !warehouse.is_default"
- [ ] **e0045-c034** [prose, lines 363-363](../development-pack/modules/20_warehouses.md#L363) -- **Script endpoint names:** warehouses.set-default, warehouses.destroy. Match these to verb/path/permission in the route annex.

### e0073: Warehouse/StoreWarehouseRequest.php

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0073). Complete every clause below before closing this section in the ledger.

- [ ] **e0073-c001** [prose, lines 373-373](../development-pack/modules/20_warehouses.md#L373) -- Source app/Http/Requests/Warehouse/StoreWarehouseRequest.php:1
- [ ] **e0073-c002** [source-code reference, lines 375-425](../development-pack/modules/20_warehouses.md#L375) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0074: Warehouse/UpdateWarehouseRequest.php

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0074). Complete every clause below before closing this section in the ledger.

- [ ] **e0074-c001** [prose, lines 435-435](../development-pack/modules/20_warehouses.md#L435) -- Source app/Http/Requests/Warehouse/UpdateWarehouseRequest.php:1
- [ ] **e0074-c002** [source-code reference, lines 437-493](../development-pack/modules/20_warehouses.md#L437) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0087: WarehouseController.php — 69-83

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0087). Complete every clause below before closing this section in the ledger.

- [ ] **e0087-c001** [prose, lines 503-503](../development-pack/modules/20_warehouses.md#L503) -- Source app/Http/Controllers/WarehouseController.php:69
- [ ] **e0087-c002** [source-code reference, lines 505-521](../development-pack/modules/20_warehouses.md#L505) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0088: WarehouseController.php — 294-354

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0088). Complete every clause below before closing this section in the ledger.

- [ ] **e0088-c001** [prose, lines 531-531](../development-pack/modules/20_warehouses.md#L531) -- Source app/Http/Controllers/WarehouseController.php:294
- [ ] **e0088-c002** [source-code reference, lines 533-595](../development-pack/modules/20_warehouses.md#L533) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0116: Warehouse

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0116). Complete every clause below before closing this section in the ledger.

- [ ] **e0116-c001** [prose, lines 605-605](../development-pack/modules/20_warehouses.md#L605) -- Source app/Models/Warehouse.php:44
- [ ] **e0116-c002** [source-code reference, lines 607-629](../development-pack/modules/20_warehouses.md#L607) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0116-c003** [prose, lines 631-631](../development-pack/modules/20_warehouses.md#L631) -- Source app/Enums/TrackingType.php:1
- [ ] **e0116-c004** [source-code reference, lines 633-672](../development-pack/modules/20_warehouses.md#L633) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0116-c005** [prose, lines 674-674](../development-pack/modules/20_warehouses.md#L674) -- Source app/Enums/BarcodeType.php:1
- [ ] **e0116-c006** [source-code reference, lines 676-817](../development-pack/modules/20_warehouses.md#L676) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0135: 2026_04_04_024204_create_warehouses_table.php

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0135). Complete every clause below before closing this section in the ledger.

- [ ] **e0135-c001** [prose, lines 826-826](../development-pack/modules/20_warehouses.md#L826) -- database/migrations/2026_04_04_024204_create_warehouses_table.php:1
- [ ] **e0135-c002** [source-code reference, lines 828-877](../development-pack/modules/20_warehouses.md#L828) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0146: 2026_09_28_000004_add_capacity_to_warehouses_and_locations.php

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0146). Complete every clause below before closing this section in the ledger.

- [ ] **e0146-c001** [prose, lines 886-886](../development-pack/modules/20_warehouses.md#L886) -- database/migrations/2026_09_28_000004_add_capacity_to_warehouses_and_locations.php:1
- [ ] **e0146-c002** [source-code reference, lines 888-897](../development-pack/modules/20_warehouses.md#L888) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0296: `resources/js/Components/WarehouseSwitcher.vue`

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0296). Complete every clause below before closing this section in the ledger.

- [ ] **e0296-c001** [prose, lines 907-908](../development-pack/modules/20_warehouses.md#L907) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0296-c002** [prose, lines 910-910](../development-pack/modules/20_warehouses.md#L910) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0296-c003** [source-code reference, lines 911-920](../development-pack/modules/20_warehouses.md#L911) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0296-c004** [prose, lines 922-922](../development-pack/modules/20_warehouses.md#L922) -- **Displayed data/value expressions:**
- [ ] **e0296-c005** [source-code reference, lines 923-928](../development-pack/modules/20_warehouses.md#L923) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0499: `app/Http/Requests/Api/Warehouse/StoreWarehouseRequest.php`

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0499). Complete every clause below before closing this section in the ledger.

- [ ] **e0499-c001** [prose, lines 938-938](../development-pack/modules/20_warehouses.md#L938) -- Source evidence. SHA-256: 073968a41da766de510c8cc150a4e6c23add16266a0ee4a09ead904f0227bf4c.
- [ ] **e0499-c002** [source-code reference, lines 940-989](../development-pack/modules/20_warehouses.md#L940) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0500: `app/Http/Requests/Api/Warehouse/UpdateWarehouseRequest.php`

Source: [exact contract](../development-pack/modules/20_warehouses.md#e0500). Complete every clause below before closing this section in the ledger.

- [ ] **e0500-c001** [prose, lines 999-999](../development-pack/modules/20_warehouses.md#L999) -- Source evidence. SHA-256: ea35f2326e5e28159d6e96db3af92c2ce9f9ac77f587adabdd0babf89dfe85f9.
- [ ] **e0500-c002** [source-code reference, lines 1001-1056](../development-pack/modules/20_warehouses.md#L1001) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/21_stock_adjustments.md

### e0007: Manual adjustment and variant popup

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0007). Complete every clause below before closing this section in the ledger.

- [ ] **e0007-c001** [statement, lines 95-95](../development-pack/modules/21_stock_adjustments.md#L95) -- - Main form submits a **signed** adjustment_quantity (not a target total), nonzero integer; type manual/recount/damage/loss/return/correction; required reason; optional notes/location. Selec...
- [ ] **e0007-c002** [statement, lines 96-96](../development-pack/modules/21_stock_adjustments.md#L96) -- - Variant popup instead accepts increase/decrease/recount/damage/return. Increase/return use positive amount; decrease/damage negative amount; recount sends entered counted quantity minus cu...
- [ ] **e0007-c003** [statement, lines 97-97](../development-pack/modules/21_stock_adjustments.md#L97) -- - Both flows pass through approval logic. Server locks/rechecks available stock; don't claim concurrency safety merely because the UI displayed enough stock. StockAdjustmentController:162-20...

### e0029: StockAdjustments/Create

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0029). Complete every clause below before closing this section in the ledger.

- [ ] **e0029-c001** [prose, lines 107-107](../development-pack/modules/21_stock_adjustments.md#L107) -- GET /stock-adjustments/create; manage_stock. Product may be preselected from link. Variant select appears for has_variants. Current/new stock preview, zero initial delta is invalid for submi...
- [ ] **e0029-c002** [prose, lines 109-109](../development-pack/modules/21_stock_adjustments.md#L109) -- Source: resources/js/Pages/StockAdjustments/Create.vue:1.
- [ ] **e0029-c003** [prose, lines 111-111](../development-pack/modules/21_stock_adjustments.md#L111) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0029-c004** [source-code reference, lines 113-126](../development-pack/modules/21_stock_adjustments.md#L113) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0029-c005** [prose, lines 128-128](../development-pack/modules/21_stock_adjustments.md#L128) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0029-c006** [table row, lines 130-130](../development-pack/modules/21_stock_adjustments.md#L130) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0029-c007** [table row, lines 132-132](../development-pack/modules/21_stock_adjustments.md#L132) -- form.product_id — resources/js/Pages/StockAdjustments/Create.vue:149  /  Product *  /  select; props.products?.some(p =&amp;gt; p.id === props.preselectedProductId) -- props.preselectedProductId ...
- [ ] **e0029-c008** [table row, lines 133-133](../development-pack/modules/21_stock_adjustments.md#L133) -- form.product_variant_id — resources/js/Pages/StockAdjustments/Create.vue:180  /  Variant *  /  select; null  /  ; v-model="form.product_variant_id"; required  /  v-if="selectedProduct?.has_v...
- [ ] **e0029-c009** [table row, lines 134-134](../development-pack/modules/21_stock_adjustments.md#L134) -- form.type — resources/js/Pages/StockAdjustments/Create.vue:225  /  Type *  /  select; 'manual'  /  ; v-model="form.type"; required  /  Always within this view/dialog; see component visibilit...
- [ ] **e0029-c010** [table row, lines 135-135](../development-pack/modules/21_stock_adjustments.md#L135) -- form.location_id — resources/js/Pages/StockAdjustments/Create.vue:240  /  Location (Optional)  /  select; null  /  ; v-model="form.location_id"  /  v-if="locations.length"
- [ ] **e0029-c011** [table row, lines 136-136](../development-pack/modules/21_stock_adjustments.md#L136) -- form.adjustment_quantity — resources/js/Pages/StockAdjustments/Create.vue:262  /  Adjustment Quantity *  /  number; 0  /  ; v-model="form.adjustment_quantity"; type="number"; required; step=...
- [ ] **e0029-c012** [table row, lines 137-137](../development-pack/modules/21_stock_adjustments.md#L137) -- form.reason — resources/js/Pages/StockAdjustments/Create.vue:283  /  Reason *  /  text; ''  /  ; v-model="form.reason"; type="text"; required; maxlength="255"; :placeholder="t('stockAdjustme...
- [ ] **e0029-c013** [table row, lines 138-138](../development-pack/modules/21_stock_adjustments.md#L138) -- form.notes — resources/js/Pages/StockAdjustments/Create.vue:301  /  Notes (Optional)  /  textarea; ''  /  ; v-model="form.notes"; rows="4"; :placeholder="t('stockAdjustments.create.notesPlac...
- [ ] **e0029-c014** [prose, lines 140-140](../development-pack/modules/21_stock_adjustments.md#L140) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0029-c015** [statement, lines 142-142](../development-pack/modules/21_stock_adjustments.md#L142) -- - form.product_id (resources/js/Pages/StockAdjustments/Create.vue:149): &amp;lt;option value=""&amp;gt;{{ Select a product }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="product in products" :key="product.id" ...
- [ ] **e0029-c016** [statement, lines 143-143](../development-pack/modules/21_stock_adjustments.md#L143) -- - form.product_variant_id (resources/js/Pages/StockAdjustments/Create.vue:180): &amp;lt;option :value="null"&amp;gt;{{ Choose a variant... }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="variant in selectedProd...
- [ ] **e0029-c017** [statement, lines 144-144](../development-pack/modules/21_stock_adjustments.md#L144) -- - form.type (resources/js/Pages/StockAdjustments/Create.vue:225): &amp;lt;option v-for="(label, value) in types" :key="value" :value="value"&amp;gt;{{ typeLabel(value, label) }}&amp;lt;/option&amp;gt;
- [ ] **e0029-c018** [statement, lines 145-145](../development-pack/modules/21_stock_adjustments.md#L145) -- - form.location_id (resources/js/Pages/StockAdjustments/Create.vue:240): &amp;lt;option :value="null"&amp;gt;{{ No specific location }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="location in locations" :key="...
- [ ] **e0029-c019** [prose, lines 147-147](../development-pack/modules/21_stock_adjustments.md#L147) -- **Read fields, columns and section headings:**
- [ ] **e0029-c020** [statement, lines 149-149](../development-pack/modules/21_stock_adjustments.md#L149) -- - h3: Adjustment Details — resources/js/Pages/StockAdjustments/Create.vue:141
- [ ] **e0029-c021** [prose, lines 151-151](../development-pack/modules/21_stock_adjustments.md#L151) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0029-c022** [table row, lines 153-153](../development-pack/modules/21_stock_adjustments.md#L153) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0029-c023** [table row, lines 155-155](../development-pack/modules/21_stock_adjustments.md#L155) -- Workspace — resources/js/Pages/StockAdjustments/Create.vue:122  /  :href="route('stock-adjustments.index')"  /  No ancestor condition
- [ ] **e0029-c024** [table row, lines 156-156](../development-pack/modules/21_stock_adjustments.md#L156) -- Stock Adjustments — resources/js/Pages/StockAdjustments/Create.vue:124  /  :href="route('stock-adjustments.index')"  /  No ancestor condition
- [ ] **e0029-c025** [table row, lines 157-157](../development-pack/modules/21_stock_adjustments.md#L157) -- Back to List — resources/js/Pages/StockAdjustments/Create.vue:132  /  variant="secondary"; size="sm"; as="Link"; :href="route('stock-adjustments.index')"  /  No ancestor condition
- [ ] **e0029-c026** [table row, lines 158-158](../development-pack/modules/21_stock_adjustments.md#L158) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/StockAdjustments/Create.vue:160  /  v-if="$page.props.auth.permissions.includes('stock_adjustments.create')"; type="but...
- [ ] **e0029-c027** [table row, lines 159-159](../development-pack/modules/21_stock_adjustments.md#L159) -- Cancel — resources/js/Pages/StockAdjustments/Create.vue:328  /  variant="secondary"; as="Link"; :href="route('stock-adjustments.index')"  /  No ancestor condition
- [ ] **e0029-c028** [table row, lines 160-160](../development-pack/modules/21_stock_adjustments.md#L160) -- form.processing ? Creating... : Create Adjustment — resources/js/Pages/StockAdjustments/Create.vue:331  /  type="submit"; variant="default"; :loading="form.processing"; :disabled="form.proce...
- [ ] **e0029-c029** [prose, lines 162-162](../development-pack/modules/21_stock_adjustments.md#L162) -- **Script endpoint names:** stock-adjustments.store. Match these to verb/path/permission in the route annex.

### e0030: StockAdjustments/Index

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0030). Complete every clause below before closing this section in the ledger.

- [ ] **e0030-c001** [prose, lines 172-172](../development-pack/modules/21_stock_adjustments.md#L172) -- GET /stock-adjustments; manage_stock. Filters search/type/product/user/date_from/date_to. Table date/product/type/before/change/after/user/view. Paginated ledger; new-adjustment action. Type...
- [ ] **e0030-c002** [prose, lines 174-174](../development-pack/modules/21_stock_adjustments.md#L174) -- Source: resources/js/Pages/StockAdjustments/Index.vue:1.
- [ ] **e0030-c003** [prose, lines 176-176](../development-pack/modules/21_stock_adjustments.md#L176) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0030-c004** [source-code reference, lines 178-191](../development-pack/modules/21_stock_adjustments.md#L178) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0030-c005** [prose, lines 193-193](../development-pack/modules/21_stock_adjustments.md#L193) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0030-c006** [table row, lines 195-195](../development-pack/modules/21_stock_adjustments.md#L195) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0030-c007** [table row, lines 197-197](../development-pack/modules/21_stock_adjustments.md#L197) -- search — resources/js/Pages/StockAdjustments/Index.vue:106  /  Search  /  text; props.filters?.search \ / \ /  ''  /  ; v-model="search"; type="text"; :placeholder="t('stockAdjustments.searc...
- [ ] **e0030-c008** [table row, lines 198-198](../development-pack/modules/21_stock_adjustments.md#L198) -- selectedType — resources/js/Pages/StockAdjustments/Index.vue:115  /  Type  /  select; props.filters?.type \ / \ /  ''  /  ; v-model="selectedType"  /  Always within this view/dialog; see com...
- [ ] **e0030-c009** [table row, lines 199-199](../development-pack/modules/21_stock_adjustments.md#L199) -- selectedProduct — resources/js/Pages/StockAdjustments/Index.vue:123  /  Product  /  select; props.filters?.product_id \ / \ /  ''  /  ; v-model="selectedProduct"  /  Always within this view/...
- [ ] **e0030-c010** [table row, lines 200-200](../development-pack/modules/21_stock_adjustments.md#L200) -- selectedUser — resources/js/Pages/StockAdjustments/Index.vue:133  /  User  /  select; props.filters?.user_id \ / \ /  ''  /  ; v-model="selectedUser"  /  Always within this view/dialog; see ...
- [ ] **e0030-c011** [table row, lines 201-201](../development-pack/modules/21_stock_adjustments.md#L201) -- dateFrom — resources/js/Pages/StockAdjustments/Index.vue:141  /  Date From  /  date; props.filters?.date_from \ / \ /  ''  /  ; v-model="dateFrom"; type="date"  /  Always within this view/di...
- [ ] **e0030-c012** [table row, lines 202-202](../development-pack/modules/21_stock_adjustments.md#L202) -- dateTo — resources/js/Pages/StockAdjustments/Index.vue:146  /  Date To  /  date; props.filters?.date_to \ / \ /  ''  /  ; v-model="dateTo"; type="date"  /  Always within this view/dialog; se...
- [ ] **e0030-c013** [prose, lines 204-204](../development-pack/modules/21_stock_adjustments.md#L204) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0030-c014** [statement, lines 206-206](../development-pack/modules/21_stock_adjustments.md#L206) -- - selectedType (resources/js/Pages/StockAdjustments/Index.vue:115): &amp;lt;option value=""&amp;gt;{{ All Types }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="(label, value) in types" :key="value" :value="valu...
- [ ] **e0030-c015** [statement, lines 207-207](../development-pack/modules/21_stock_adjustments.md#L207) -- - selectedProduct (resources/js/Pages/StockAdjustments/Index.vue:123): &amp;lt;option value=""&amp;gt;{{ All Products }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="product in products" :key="product.id" :valu...
- [ ] **e0030-c016** [statement, lines 208-208](../development-pack/modules/21_stock_adjustments.md#L208) -- - selectedUser (resources/js/Pages/StockAdjustments/Index.vue:133): &amp;lt;option value=""&amp;gt;{{ All Users }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="user in users" :key="user.id" :value="user.id"&amp;gt;...
- [ ] **e0030-c017** [prose, lines 210-210](../development-pack/modules/21_stock_adjustments.md#L210) -- **Read fields, columns and section headings:**
- [ ] **e0030-c018** [statement, lines 212-212](../development-pack/modules/21_stock_adjustments.md#L212) -- - th: Date — resources/js/Pages/StockAdjustments/Index.vue:164
- [ ] **e0030-c019** [statement, lines 213-213](../development-pack/modules/21_stock_adjustments.md#L213) -- - th: Product — resources/js/Pages/StockAdjustments/Index.vue:165
- [ ] **e0030-c020** [statement, lines 214-214](../development-pack/modules/21_stock_adjustments.md#L214) -- - th: Type — resources/js/Pages/StockAdjustments/Index.vue:166
- [ ] **e0030-c021** [statement, lines 215-215](../development-pack/modules/21_stock_adjustments.md#L215) -- - th: Before — resources/js/Pages/StockAdjustments/Index.vue:167
- [ ] **e0030-c022** [statement, lines 216-216](../development-pack/modules/21_stock_adjustments.md#L216) -- - th: Change — resources/js/Pages/StockAdjustments/Index.vue:168
- [ ] **e0030-c023** [statement, lines 217-217](../development-pack/modules/21_stock_adjustments.md#L217) -- - th: After — resources/js/Pages/StockAdjustments/Index.vue:169
- [ ] **e0030-c024** [statement, lines 218-218](../development-pack/modules/21_stock_adjustments.md#L218) -- - th: User — resources/js/Pages/StockAdjustments/Index.vue:170
- [ ] **e0030-c025** [statement, lines 219-219](../development-pack/modules/21_stock_adjustments.md#L219) -- - th: Actions — resources/js/Pages/StockAdjustments/Index.vue:171
- [ ] **e0030-c026** [prose, lines 221-221](../development-pack/modules/21_stock_adjustments.md#L221) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0030-c027** [table row, lines 223-223](../development-pack/modules/21_stock_adjustments.md#L223) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0030-c028** [table row, lines 225-225](../development-pack/modules/21_stock_adjustments.md#L225) -- New Adjustment — resources/js/Pages/StockAdjustments/Index.vue:94  /  variant="default"; size="sm"; as="Link"; :href="route('stock-adjustments.create')"  /  No ancestor condition
- [ ] **e0030-c029** [table row, lines 226-226](../development-pack/modules/21_stock_adjustments.md#L226) -- Clear Filters — resources/js/Pages/StockAdjustments/Index.vue:154  /  type="button"; variant="secondary"; size="sm"; @click="clearFilters"  /  No ancestor condition
- [ ] **e0030-c030** [table row, lines 227-227](../development-pack/modules/21_stock_adjustments.md#L227) -- Create First Adjustment — resources/js/Pages/StockAdjustments/Index.vue:180  /  variant="default"; size="sm"; as="Link"; :href="route('stock-adjustments.create')"  /  v-if="!adjustments.data...
- [ ] **e0030-c031** [table row, lines 228-228](../development-pack/modules/21_stock_adjustments.md#L228) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/StockAdjustments/Index.vue:222  /  :href="route('stock-adjustments.show', adjustment.id)"; :title="t('common.view')"  /...
- [ ] **e0030-c032** [table row, lines 229-229](../development-pack/modules/21_stock_adjustments.md#L229) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/StockAdjustments/Index.vue:238  /  v-if="link.url"; :href="link.url"; v-html="link.label"  /  v-if="adjustments.data &amp;&amp;...
- [ ] **e0030-c033** [prose, lines 231-231](../development-pack/modules/21_stock_adjustments.md#L231) -- **Script endpoint names:** stock-adjustments.index. Match these to verb/path/permission in the route annex.

### e0031: StockAdjustments/Show

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0031). Complete every clause below before closing this section in the ledger.

- [ ] **e0031-c001** [prose, lines 241-241](../development-pack/modules/21_stock_adjustments.md#L241) -- GET /stock-adjustments/{stockAdjustment}; manage_stock. No editable fields. Before/change/after tiles; product/type/actor/time/reason/notes/reference and timeline. Product/reference links wh...
- [ ] **e0031-c002** [prose, lines 243-243](../development-pack/modules/21_stock_adjustments.md#L243) -- Source: resources/js/Pages/StockAdjustments/Show.vue:1.
- [ ] **e0031-c003** [prose, lines 245-245](../development-pack/modules/21_stock_adjustments.md#L245) -- **Input fields:** none in this page/component template.
- [ ] **e0031-c004** [prose, lines 248-248](../development-pack/modules/21_stock_adjustments.md#L248) -- **Read fields, columns and section headings:**
- [ ] **e0031-c005** [statement, lines 250-250](../development-pack/modules/21_stock_adjustments.md#L250) -- - h3: Adjustment Information — resources/js/Pages/StockAdjustments/Show.vue:112
- [ ] **e0031-c006** [statement, lines 251-251](../development-pack/modules/21_stock_adjustments.md#L251) -- - dt: Product — resources/js/Pages/StockAdjustments/Show.vue:116
- [ ] **e0031-c007** [statement, lines 252-252](../development-pack/modules/21_stock_adjustments.md#L252) -- - dt: Type — resources/js/Pages/StockAdjustments/Show.vue:129
- [ ] **e0031-c008** [statement, lines 253-253](../development-pack/modules/21_stock_adjustments.md#L253) -- - dt: Adjusted By — resources/js/Pages/StockAdjustments/Show.vue:138
- [ ] **e0031-c009** [statement, lines 254-254](../development-pack/modules/21_stock_adjustments.md#L254) -- - dt: Date &amp; Time — resources/js/Pages/StockAdjustments/Show.vue:146
- [ ] **e0031-c010** [statement, lines 255-255](../development-pack/modules/21_stock_adjustments.md#L255) -- - dt: Reason — resources/js/Pages/StockAdjustments/Show.vue:152
- [ ] **e0031-c011** [statement, lines 256-256](../development-pack/modules/21_stock_adjustments.md#L256) -- - dt: Notes — resources/js/Pages/StockAdjustments/Show.vue:157 — v-if="adjustment.notes"
- [ ] **e0031-c012** [statement, lines 257-257](../development-pack/modules/21_stock_adjustments.md#L257) -- - dt: Reference — resources/js/Pages/StockAdjustments/Show.vue:162 — v-if="adjustment.reference_type"
- [ ] **e0031-c013** [statement, lines 258-258](../development-pack/modules/21_stock_adjustments.md#L258) -- - h3: Stock Change Timeline — resources/js/Pages/StockAdjustments/Show.vue:175
- [ ] **e0031-c014** [prose, lines 260-260](../development-pack/modules/21_stock_adjustments.md#L260) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0031-c015** [table row, lines 262-262](../development-pack/modules/21_stock_adjustments.md#L262) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0031-c016** [table row, lines 264-264](../development-pack/modules/21_stock_adjustments.md#L264) -- Workspace — resources/js/Pages/StockAdjustments/Show.vue:57  /  :href="route('stock-adjustments.index')"  /  No ancestor condition
- [ ] **e0031-c017** [table row, lines 265-265](../development-pack/modules/21_stock_adjustments.md#L265) -- Stock Adjustments — resources/js/Pages/StockAdjustments/Show.vue:59  /  :href="route('stock-adjustments.index')"  /  No ancestor condition
- [ ] **e0031-c018** [table row, lines 266-266](../development-pack/modules/21_stock_adjustments.md#L266) -- Back to List — resources/js/Pages/StockAdjustments/Show.vue:71  /  variant="secondary"; size="sm"; as="Link"; :href="route('stock-adjustments.index')"  /  No ancestor condition
- [ ] **e0031-c019** [table row, lines 267-267](../development-pack/modules/21_stock_adjustments.md#L267) -- adjustment.product.name — resources/js/Pages/StockAdjustments/Show.vue:118  /  :href="route('products.show', adjustment.product.id)"  /  No ancestor condition

### e0050: Components/VariantStockAdjuster

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0050). Complete every clause below before closing this section in the ledger.

- [ ] **e0050-c001** [prose, lines 277-277](../development-pack/modules/21_stock_adjustments.md#L277) -- Per-variant stock plus stock-state badge and +/- popover. Popup defaults type selected by opening action, quantity 1, reason blank; modes and signed delta semantics above. API 202 retained a...
- [ ] **e0050-c002** [prose, lines 279-279](../development-pack/modules/21_stock_adjustments.md#L279) -- Source: resources/js/Components/VariantStockAdjuster.vue:1.
- [ ] **e0050-c003** [prose, lines 281-281](../development-pack/modules/21_stock_adjustments.md#L281) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0050-c004** [source-code reference, lines 283-298](../development-pack/modules/21_stock_adjustments.md#L283) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0050-c005** [prose, lines 300-300](../development-pack/modules/21_stock_adjustments.md#L300) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0050-c006** [table row, lines 302-302](../development-pack/modules/21_stock_adjustments.md#L302) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0050-c007** [table row, lines 304-304](../development-pack/modules/21_stock_adjustments.md#L304) -- adjustType — resources/js/Components/VariantStockAdjuster.vue:183  /  Adjustment Type  /  select; 'increase'  /  ; v-model="adjustType"  /  v-if="showPopover"
- [ ] **e0050-c008** [table row, lines 305-305](../development-pack/modules/21_stock_adjustments.md#L305) -- quantity — resources/js/Components/VariantStockAdjuster.vue:198  /  adjustType === 'recount' ? Counted quantity : Quantity  /  number; 1  /  ; v-model.number="quantity"; type="number"; :min=...
- [ ] **e0050-c009** [table row, lines 306-306](../development-pack/modules/21_stock_adjustments.md#L306) -- reason — resources/js/Components/VariantStockAdjuster.vue:211  /  Reason (optional)  /  text; ''  /  ; v-model="reason"; type="text"; :placeholder="t('components.stockAdjuster.reasonPlacehol...
- [ ] **e0050-c010** [prose, lines 308-308](../development-pack/modules/21_stock_adjustments.md#L308) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0050-c011** [statement, lines 310-310](../development-pack/modules/21_stock_adjustments.md#L310) -- - adjustType (resources/js/Components/VariantStockAdjuster.vue:183): &amp;lt;option v-for="type in adjustTypes" :key="type.value" :value="type.value"&amp;gt; {{ type.label }} &amp;lt;/option&amp;gt;
- [ ] **e0050-c012** [prose, lines 312-312](../development-pack/modules/21_stock_adjustments.md#L312) -- **Read fields, columns and section headings:**
- [ ] **e0050-c013** [statement, lines 314-314](../development-pack/modules/21_stock_adjustments.md#L314) -- - h4: Adjust Stock: {name} — resources/js/Components/VariantStockAdjuster.vue:174 — v-if="showPopover"
- [ ] **e0050-c014** [prose, lines 316-316](../development-pack/modules/21_stock_adjustments.md#L316) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0050-c015** [table row, lines 318-318](../development-pack/modules/21_stock_adjustments.md#L318) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0050-c016** [table row, lines 320-320](../development-pack/modules/21_stock_adjustments.md#L320) -- (icon-only; accessible label/title in attributes) — resources/js/Components/VariantStockAdjuster.vue:141  /  type="button"; @click="openPopover('increase')"; :title="t('components.stockAdjus...
- [ ] **e0050-c017** [table row, lines 321-321](../development-pack/modules/21_stock_adjustments.md#L321) -- (icon-only; accessible label/title in attributes) — resources/js/Components/VariantStockAdjuster.vue:151  /  type="button"; @click="openPopover('decrease')"; :title="t('components.stockAdjus...
- [ ] **e0050-c018** [table row, lines 322-322](../development-pack/modules/21_stock_adjustments.md#L322) -- Cancel — resources/js/Components/VariantStockAdjuster.vue:224  /  type="button"; @click="closePopover"  /  v-if="showPopover"
- [ ] **e0050-c019** [table row, lines 323-323](../development-pack/modules/21_stock_adjustments.md#L323) -- ... Apply — resources/js/Components/VariantStockAdjuster.vue:231  /  type="button"; @click="adjustStock"; :disabled="loading"  /  v-if="showPopover"
- [ ] **e0050-c020** [prose, lines 325-325](../development-pack/modules/21_stock_adjustments.md#L325) -- **Script endpoint names:** products.variants.adjust-stock. Match these to verb/path/permission in the route annex.

### e0066: StockAdjustment/StoreStockAdjustmentRequest.php

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0066). Complete every clause below before closing this section in the ledger.

- [ ] **e0066-c001** [prose, lines 335-335](../development-pack/modules/21_stock_adjustments.md#L335) -- Source app/Http/Requests/StockAdjustment/StoreStockAdjustmentRequest.php:1
- [ ] **e0066-c002** [source-code reference, lines 337-412](../development-pack/modules/21_stock_adjustments.md#L337) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0104: StockAdjustment

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0104). Complete every clause below before closing this section in the ledger.

- [ ] **e0104-c001** [prose, lines 421-421](../development-pack/modules/21_stock_adjustments.md#L421) -- app/Models/Inventory/StockAdjustment.php:1
- [ ] **e0104-c002** [source-code reference, lines 423-457](../development-pack/modules/21_stock_adjustments.md#L423) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0105: StockAdjustmentRequest

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0105). Complete every clause below before closing this section in the ledger.

- [ ] **e0105-c001** [prose, lines 466-466](../development-pack/modules/21_stock_adjustments.md#L466) -- app/Models/Inventory/StockAdjustmentRequest.php:1
- [ ] **e0105-c002** [source-code reference, lines 468-510](../development-pack/modules/21_stock_adjustments.md#L468) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0123: 2025_10_13_213427_create_stock_adjustments_table.php

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0123). Complete every clause below before closing this section in the ledger.

- [ ] **e0123-c001** [prose, lines 519-519](../development-pack/modules/21_stock_adjustments.md#L519) -- database/migrations/2025_10_13_213427_create_stock_adjustments_table.php:1
- [ ] **e0123-c002** [source-code reference, lines 521-539](../development-pack/modules/21_stock_adjustments.md#L521) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0128: 2025_12_28_000004_add_variant_support_to_stock_adjustments.php

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0128). Complete every clause below before closing this section in the ledger.

- [ ] **e0128-c001** [prose, lines 548-548](../development-pack/modules/21_stock_adjustments.md#L548) -- database/migrations/2025_12_28_000004_add_variant_support_to_stock_adjustments.php:1
- [ ] **e0128-c002** [source-code reference, lines 550-558](../development-pack/modules/21_stock_adjustments.md#L550) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0144: 2026_09_28_000002_add_location_id_to_stock_adjustments.php

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0144). Complete every clause below before closing this section in the ledger.

- [ ] **e0144-c001** [prose, lines 567-567](../development-pack/modules/21_stock_adjustments.md#L567) -- database/migrations/2026_09_28_000002_add_location_id_to_stock_adjustments.php:1
- [ ] **e0144-c002** [source-code reference, lines 569-574](../development-pack/modules/21_stock_adjustments.md#L569) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0147: 2026_09_29_000002_create_stock_adjustment_requests_table.php

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0147). Complete every clause below before closing this section in the ledger.

- [ ] **e0147-c001** [prose, lines 583-583](../development-pack/modules/21_stock_adjustments.md#L583) -- database/migrations/2026_09_29_000002_create_stock_adjustment_requests_table.php:1
- [ ] **e0147-c002** [source-code reference, lines 585-606](../development-pack/modules/21_stock_adjustments.md#L585) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0492: `app/Http/Requests/Api/StockAdjustment/StoreStockAdjustmentRequest.php`

Source: [exact contract](../development-pack/modules/21_stock_adjustments.md#e0492). Complete every clause below before closing this section in the ledger.

- [ ] **e0492-c001** [prose, lines 616-616](../development-pack/modules/21_stock_adjustments.md#L616) -- Source evidence. SHA-256: f196e39dade0a80b585301ef0b619e97d442e91dc7cfcde97544fa16dedd6c39.
- [ ] **e0492-c002** [source-code reference, lines 618-699](../development-pack/modules/21_stock_adjustments.md#L618) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/22_stock_by_warehouse.md

### e0028: Stock/Index

Source: [exact contract](../development-pack/modules/22_stock_by_warehouse.md#e0028). Complete every clause below before closing this section in the ledger.

- [ ] **e0028-c001** [prose, lines 87-87](../development-pack/modules/22_stock_by_warehouse.md#L87) -- GET /stock; view_products. Search, warehouse, out_of_stock/include_zero controls; sort_by=sku and sort_dir=asc default. Sort any displayed column; repeat toggles direction. Columns SKU/produ...
- [ ] **e0028-c002** [prose, lines 89-89](../development-pack/modules/22_stock_by_warehouse.md#L89) -- Source: resources/js/Pages/Stock/Index.vue:1.
- [ ] **e0028-c003** [prose, lines 91-91](../development-pack/modules/22_stock_by_warehouse.md#L91) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0028-c004** [source-code reference, lines 93-96](../development-pack/modules/22_stock_by_warehouse.md#L93) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0028-c005** [prose, lines 98-98](../development-pack/modules/22_stock_by_warehouse.md#L98) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0028-c006** [table row, lines 100-100](../development-pack/modules/22_stock_by_warehouse.md#L100) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0028-c007** [table row, lines 102-102](../development-pack/modules/22_stock_by_warehouse.md#L102) -- form.search — resources/js/Pages/Stock/Index.vue:46  /  Search  /  input; props.filters.search \ / \ /  ''  /  ; v-model="form.search"; :placeholder="t('products.searchPlaceholder')"  /  Alw...
- [ ] **e0028-c008** [table row, lines 103-103](../development-pack/modules/22_stock_by_warehouse.md#L103) -- form.warehouse_id — resources/js/Pages/Stock/Index.vue:51  /  Warehouse  /  select; props.filters.warehouse_id \ / \ /  ''  /  v-model="form.warehouse_id"  /  Always within this view/dialog;...
- [ ] **e0028-c009** [table row, lines 104-104](../development-pack/modules/22_stock_by_warehouse.md#L104) -- form.out_of_stock — resources/js/Pages/Stock/Index.vue:55  /  Out of Stock  /  checkbox; enabled(props.filters.out_of_stock)  /  v-model="form.out_of_stock"; type="checkbox"  /  Always withi...
- [ ] **e0028-c010** [table row, lines 105-105](../development-pack/modules/22_stock_by_warehouse.md#L105) -- form.include_zero — resources/js/Pages/Stock/Index.vue:56  /  Include zero balances  /  checkbox; enabled(props.filters.include_zero)  /  v-model="form.include_zero"; type="checkbox"  /  Alw...
- [ ] **e0028-c011** [prose, lines 107-107](../development-pack/modules/22_stock_by_warehouse.md#L107) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0028-c012** [statement, lines 109-109](../development-pack/modules/22_stock_by_warehouse.md#L109) -- - form.warehouse_id (resources/js/Pages/Stock/Index.vue:51): &amp;lt;option value=""&amp;gt;{{ All Warehouses }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="warehouse in page.props.warehouses \|\| &#91;&#93;" :key="wa...
- [ ] **e0028-c013** [prose, lines 111-111](../development-pack/modules/22_stock_by_warehouse.md#L111) -- **Read fields, columns and section headings:**
- [ ] **e0028-c014** [statement, lines 113-113](../development-pack/modules/22_stock_by_warehouse.md#L113) -- - th: label form.sort_dir === 'asc' ? '↑' : '↓' — resources/js/Pages/Stock/Index.vue:63
- [ ] **e0028-c015** [prose, lines 115-115](../development-pack/modules/22_stock_by_warehouse.md#L115) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0028-c016** [table row, lines 117-117](../development-pack/modules/22_stock_by_warehouse.md#L117) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0028-c017** [table row, lines 119-119](../development-pack/modules/22_stock_by_warehouse.md#L119) -- Export CSV — resources/js/Pages/Stock/Index.vue:39  /  v-if="hasPermission('export_data')"; as="a"; :href="exportUrl"; variant="secondary"  /  No ancestor condition
- [ ] **e0028-c018** [table row, lines 120-120](../development-pack/modules/22_stock_by_warehouse.md#L120) -- Search — resources/js/Pages/Stock/Index.vue:57  /  type="submit"; :loading="form.processing"  /  No ancestor condition
- [ ] **e0028-c019** [table row, lines 121-121](../development-pack/modules/22_stock_by_warehouse.md#L121) -- label form.sort_dir === 'asc' ? '↑' : '↓' — resources/js/Pages/Stock/Index.vue:64  /  type="button"; :aria-label="label"; @click="sort(key)"  /  v-for="&#91;key, label&#93; in columns"
- [ ] **e0028-c020** [table row, lines 122-122](../development-pack/modules/22_stock_by_warehouse.md#L122) -- row.sku — resources/js/Pages/Stock/Index.vue:69  /  :href="route('products.show', row.product_id)"  /  v-for="row in balances.data"
- [ ] **e0028-c021** [table row, lines 123-123](../development-pack/modules/22_stock_by_warehouse.md#L123) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Stock/Index.vue:80  /  v-if="link.url"; :href="link.url"; v-html="link.label"  /  v-for="link in balances.links"
- [ ] **e0028-c022** [prose, lines 125-125](../development-pack/modules/22_stock_by_warehouse.md#L125) -- **Script endpoint names:** stock.index, stock.export. Match these to verb/path/permission in the route annex.

### e0086: StockBalanceController.php — 17-49

Source: [exact contract](../development-pack/modules/22_stock_by_warehouse.md#e0086). Complete every clause below before closing this section in the ledger.

- [ ] **e0086-c001** [prose, lines 135-135](../development-pack/modules/22_stock_by_warehouse.md#L135) -- Source app/Http/Controllers/Inventory/StockBalanceController.php:17
- [ ] **e0086-c002** [source-code reference, lines 137-171](../development-pack/modules/22_stock_by_warehouse.md#L137) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0099: ProductLocationStock

Source: [exact contract](../development-pack/modules/22_stock_by_warehouse.md#e0099). Complete every clause below before closing this section in the ledger.

- [ ] **e0099-c001** [prose, lines 180-180](../development-pack/modules/22_stock_by_warehouse.md#L180) -- app/Models/Inventory/ProductLocationStock.php:1
- [ ] **e0099-c002** [source-code reference, lines 182-198](../development-pack/modules/22_stock_by_warehouse.md#L182) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0100: VariantLocationStock

Source: [exact contract](../development-pack/modules/22_stock_by_warehouse.md#e0100). Complete every clause below before closing this section in the ledger.

- [ ] **e0100-c001** [prose, lines 207-207](../development-pack/modules/22_stock_by_warehouse.md#L207) -- app/Models/Inventory/VariantLocationStock.php:1
- [ ] **e0100-c002** [source-code reference, lines 209-216](../development-pack/modules/22_stock_by_warehouse.md#L209) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0139: 2026_07_25_000001_create_product_location_stocks_table.php

Source: [exact contract](../development-pack/modules/22_stock_by_warehouse.md#e0139). Complete every clause below before closing this section in the ledger.

- [ ] **e0139-c001** [prose, lines 225-225](../development-pack/modules/22_stock_by_warehouse.md#L225) -- database/migrations/2026_07_25_000001_create_product_location_stocks_table.php:1
- [ ] **e0139-c002** [source-code reference, lines 227-238](../development-pack/modules/22_stock_by_warehouse.md#L227) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0141: 2026_07_26_000002_make_product_location_stocks_quantity_unsigned.php

Source: [exact contract](../development-pack/modules/22_stock_by_warehouse.md#e0141). Complete every clause below before closing this section in the ledger.

- [ ] **e0141-c001** [prose, lines 247-247](../development-pack/modules/22_stock_by_warehouse.md#L247) -- database/migrations/2026_07_26_000002_make_product_location_stocks_quantity_unsigned.php:1
- [ ] **e0141-c002** [source-code reference, lines 249-254](../development-pack/modules/22_stock_by_warehouse.md#L249) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0151: 2026_10_21_000001_create_variant_location_stocks.php

Source: [exact contract](../development-pack/modules/22_stock_by_warehouse.md#e0151). Complete every clause below before closing this section in the ledger.

- [ ] **e0151-c001** [prose, lines 263-263](../development-pack/modules/22_stock_by_warehouse.md#L263) -- database/migrations/2026_10_21_000001_create_variant_location_stocks.php:1
- [ ] **e0151-c002** [source-code reference, lines 265-275](../development-pack/modules/22_stock_by_warehouse.md#L265) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/23_stock_transfers.md

### e0009: Transfers

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0009). Complete every clause below before closing this section in the ledger.

- [ ] **e0009-c001** [statement, lines 96-96](../development-pack/modules/23_stock_transfers.md#L96) -- - Create requires distinct source/destination locations and at least one line. Each line: product_id, variant when required, positive integer quantity, optional notes. Source options can be ...
- [ ] **e0009-c002** [statement, lines 97-97](../development-pack/modules/23_stock_transfers.md#L97) -- - Server initial state pending; prepare reserves source quantities and becomes prepared; ship consumes reservations/decrements source and becomes in_transit with stock_dispatched_at; receive...
- [ ] **e0009-c003** [statement, lines 98-98](../development-pack/modules/23_stock_transfers.md#L98) -- - UI prepare = canDispatch + pending + approval not pending/rejected; ship = canDispatch + prepared + approval clear; complete = approval clear + (in_transit &amp; canReceive OR same-warehouse p...
- [ ] **e0009-c004** [statement, lines 99-99](../development-pack/modules/23_stock_transfers.md#L99) -- - Shipped transfers cannot be cancelled; receive then reverse-transfer goods instead. Cancel releases holds. StockTransferService:315-331.
- [ ] **e0009-c005** [statement, lines 100-100](../development-pack/modules/23_stock_transfers.md#L100) -- - Scan-to-verify on Show is explicitly **client-side only and not saved**. It counts per line, warns for not-on-transfer/over-scans/ambiguous parent variant, supports reset; normal completio...

### e0039: StockTransfers/Create

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0039). Complete every clause below before closing this section in the ledger.

- [ ] **e0039-c001** [prose, lines 110-110](../development-pack/modules/23_stock_transfers.md#L110) -- GET /stock-transfers/create; transfer_stock. Source/destination distinct, notes and repeating items. One blank row initially, cannot remove last row. Product change clears variant. Total uni...
- [ ] **e0039-c002** [prose, lines 112-112](../development-pack/modules/23_stock_transfers.md#L112) -- Source: resources/js/Pages/StockTransfers/Create.vue:1.
- [ ] **e0039-c003** [prose, lines 114-114](../development-pack/modules/23_stock_transfers.md#L114) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0039-c004** [source-code reference, lines 116-132](../development-pack/modules/23_stock_transfers.md#L116) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0039-c005** [prose, lines 134-134](../development-pack/modules/23_stock_transfers.md#L134) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0039-c006** [table row, lines 136-136](../development-pack/modules/23_stock_transfers.md#L136) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0039-c007** [table row, lines 138-138](../development-pack/modules/23_stock_transfers.md#L138) -- form.from_location_id — resources/js/Pages/StockTransfers/Create.vue:168  /  From Location *  /  select; ''  /  ; v-model="form.from_location_id"; required  /  Always within this view/dialog...
- [ ] **e0039-c008** [table row, lines 139-139](../development-pack/modules/23_stock_transfers.md#L139) -- form.to_location_id — resources/js/Pages/StockTransfers/Create.vue:186  /  To Location *  /  select; ''  /  ; v-model="form.to_location_id"; required  /  Always within this view/dialog; see ...
- [ ] **e0039-c009** [table row, lines 140-140](../development-pack/modules/23_stock_transfers.md#L140) -- form.notes — resources/js/Pages/StockTransfers/Create.vue:214  /  Notes (Optional)  /  textarea; ''  /  ; v-model="form.notes"; rows="3"; :placeholder="t('stockTransfers.create.notesPlacehol...
- [ ] **e0039-c010** [table row, lines 141-141](../development-pack/modules/23_stock_transfers.md#L141) -- item.product_id — resources/js/Pages/StockTransfers/Create.vue:272  /  Product *  /  select; '' (new transfer line)  /  ; v-model="item.product_id"; @change="item.product_variant_id = ''"; r...
- [ ] **e0039-c011** [table row, lines 142-142](../development-pack/modules/23_stock_transfers.md#L142) -- item.product_variant_id — resources/js/Pages/StockTransfers/Create.vue:290  /  Variant  /  select; '' (new transfer line)  /  ; v-model="item.product_variant_id"; required  /  v-for="(item, ...
- [ ] **e0039-c012** [table row, lines 143-143](../development-pack/modules/23_stock_transfers.md#L143) -- item.quantity — resources/js/Pages/StockTransfers/Create.vue:299  /  Qty *  /  number; 1 (new transfer line)  /  ; v-model="item.quantity"; type="number"; min="1"; required  /  v-for="(item,...
- [ ] **e0039-c013** [table row, lines 144-144](../development-pack/modules/23_stock_transfers.md#L144) -- item.notes — resources/js/Pages/StockTransfers/Create.vue:317  /  Notes  /  text; '' (new transfer line)  /  ; v-model="item.notes"; type="text"; :placeholder="t('stockTransfers.create.itemN...
- [ ] **e0039-c014** [prose, lines 146-146](../development-pack/modules/23_stock_transfers.md#L146) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0039-c015** [statement, lines 148-148](../development-pack/modules/23_stock_transfers.md#L148) -- - form.from_location_id (resources/js/Pages/StockTransfers/Create.vue:168): &amp;lt;option value=""&amp;gt;{{ Select source location }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="location in availableFromLoca...
- [ ] **e0039-c016** [statement, lines 149-149](../development-pack/modules/23_stock_transfers.md#L149) -- - form.to_location_id (resources/js/Pages/StockTransfers/Create.vue:186): &amp;lt;option value=""&amp;gt;{{ Select destination location }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="location in availableToLoc...
- [ ] **e0039-c017** [statement, lines 150-150](../development-pack/modules/23_stock_transfers.md#L150) -- - item.product_id (resources/js/Pages/StockTransfers/Create.vue:272): &amp;lt;option value=""&amp;gt;{{ Select product }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="product in products" :key="product.id" :val...
- [ ] **e0039-c018** [statement, lines 151-151](../development-pack/modules/23_stock_transfers.md#L151) -- - item.product_variant_id (resources/js/Pages/StockTransfers/Create.vue:290): &amp;lt;option value=""&amp;gt;{{ Choose a variant... }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="variant in getProduct(item.pro...
- [ ] **e0039-c019** [prose, lines 153-153](../development-pack/modules/23_stock_transfers.md#L153) -- **Read fields, columns and section headings:**
- [ ] **e0039-c020** [statement, lines 155-155](../development-pack/modules/23_stock_transfers.md#L155) -- - h3: Transfer Details — resources/js/Pages/StockTransfers/Create.vue:162
- [ ] **e0039-c021** [statement, lines 156-156](../development-pack/modules/23_stock_transfers.md#L156) -- - h3: Transfer Items — resources/js/Pages/StockTransfers/Create.vue:230
- [ ] **e0039-c022** [prose, lines 158-158](../development-pack/modules/23_stock_transfers.md#L158) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0039-c023** [table row, lines 160-160](../development-pack/modules/23_stock_transfers.md#L160) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0039-c024** [table row, lines 162-162](../development-pack/modules/23_stock_transfers.md#L162) -- Workspace — resources/js/Pages/StockTransfers/Create.vue:142  /  :href="route('stock-transfers.index')"  /  No ancestor condition
- [ ] **e0039-c025** [table row, lines 163-163](../development-pack/modules/23_stock_transfers.md#L163) -- Stock Transfers — resources/js/Pages/StockTransfers/Create.vue:144  /  :href="route('stock-transfers.index')"  /  No ancestor condition
- [ ] **e0039-c026** [table row, lines 164-164](../development-pack/modules/23_stock_transfers.md#L164) -- Back to List — resources/js/Pages/StockTransfers/Create.vue:152  /  variant="secondary"; size="sm"; as="Link"; :href="route('stock-transfers.index')"  /  No ancestor condition
- [ ] **e0039-c027** [table row, lines 165-165](../development-pack/modules/23_stock_transfers.md#L165) -- Scan — resources/js/Pages/StockTransfers/Create.vue:232  /  type="button"; variant="secondary"; size="lg"; @click="showScanner = true"  /  No ancestor condition
- [ ] **e0039-c028** [table row, lines 166-166](../development-pack/modules/23_stock_transfers.md#L166) -- Add Item — resources/js/Pages/StockTransfers/Create.vue:236  /  type="button"; variant="default"; size="lg"; @click="addItem"  /  No ancestor condition
- [ ] **e0039-c029** [table row, lines 167-167](../development-pack/modules/23_stock_transfers.md#L167) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/StockTransfers/Create.vue:327  /  :aria-label="t('common.delete')"; type="button"; @click="removeItem(index)"; :disable...
- [ ] **e0039-c030** [table row, lines 168-168](../development-pack/modules/23_stock_transfers.md#L168) -- Cancel — resources/js/Pages/StockTransfers/Create.vue:355  /  variant="secondary"; as="Link"; :href="route('stock-transfers.index')"  /  No ancestor condition
- [ ] **e0039-c031** [table row, lines 169-169](../development-pack/modules/23_stock_transfers.md#L169) -- form.processing ? Creating... : Create Transfer — resources/js/Pages/StockTransfers/Create.vue:356  /  type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processin...
- [ ] **e0039-c032** [prose, lines 171-171](../development-pack/modules/23_stock_transfers.md#L171) -- **Script endpoint names:** stock-transfers.store. Match these to verb/path/permission in the route annex.

### e0040: StockTransfers/Index

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0040). Complete every clause below before closing this section in the ledger.

- [ ] **e0040-c001** [prose, lines 181-181](../development-pack/modules/23_stock_transfers.md#L181) -- GET /stock-transfers; transfer_stock. Search and status filter; number/from/to/status/items/date/view columns; new action and pagination. Status pending/prepared/in_transit/completed/cancell...
- [ ] **e0040-c002** [prose, lines 183-183](../development-pack/modules/23_stock_transfers.md#L183) -- Source: resources/js/Pages/StockTransfers/Index.vue:1.
- [ ] **e0040-c003** [prose, lines 185-185](../development-pack/modules/23_stock_transfers.md#L185) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0040-c004** [source-code reference, lines 187-192](../development-pack/modules/23_stock_transfers.md#L187) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0040-c005** [prose, lines 194-194](../development-pack/modules/23_stock_transfers.md#L194) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0040-c006** [table row, lines 196-196](../development-pack/modules/23_stock_transfers.md#L196) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0040-c007** [table row, lines 198-198](../development-pack/modules/23_stock_transfers.md#L198) -- search — resources/js/Pages/StockTransfers/Index.vue:93  /  Search  /  text; props.filters?.search \ / \ /  ''  /  ; v-model="search"; type="text"; :placeholder="t('stockTransfers.index.sear...
- [ ] **e0040-c008** [table row, lines 199-199](../development-pack/modules/23_stock_transfers.md#L199) -- selectedStatus — resources/js/Pages/StockTransfers/Index.vue:102  /  Status  /  select; props.filters?.status \ / \ /  ''  /  ; v-model="selectedStatus"; @change="applyFilters"  /  Always wi...
- [ ] **e0040-c009** [prose, lines 201-201](../development-pack/modules/23_stock_transfers.md#L201) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0040-c010** [statement, lines 203-203](../development-pack/modules/23_stock_transfers.md#L203) -- - selectedStatus (resources/js/Pages/StockTransfers/Index.vue:102): &amp;lt;option value=""&amp;gt;{{ All Statuses }}&amp;lt;/option&amp;gt; &amp;lt;option value="pending"&amp;gt;{{ Pending }}&amp;lt;/option&amp;gt; &amp;lt;op...
- [ ] **e0040-c011** [prose, lines 205-205](../development-pack/modules/23_stock_transfers.md#L205) -- **Read fields, columns and section headings:**
- [ ] **e0040-c012** [statement, lines 207-207](../development-pack/modules/23_stock_transfers.md#L207) -- - th: Transfer # — resources/js/Pages/StockTransfers/Index.vue:127
- [ ] **e0040-c013** [statement, lines 208-208](../development-pack/modules/23_stock_transfers.md#L208) -- - th: From — resources/js/Pages/StockTransfers/Index.vue:128
- [ ] **e0040-c014** [statement, lines 209-209](../development-pack/modules/23_stock_transfers.md#L209) -- - th: To — resources/js/Pages/StockTransfers/Index.vue:129
- [ ] **e0040-c015** [statement, lines 210-210](../development-pack/modules/23_stock_transfers.md#L210) -- - th: Status — resources/js/Pages/StockTransfers/Index.vue:130
- [ ] **e0040-c016** [statement, lines 211-211](../development-pack/modules/23_stock_transfers.md#L211) -- - th: Items — resources/js/Pages/StockTransfers/Index.vue:131
- [ ] **e0040-c017** [statement, lines 212-212](../development-pack/modules/23_stock_transfers.md#L212) -- - th: Date — resources/js/Pages/StockTransfers/Index.vue:132
- [ ] **e0040-c018** [statement, lines 213-213](../development-pack/modules/23_stock_transfers.md#L213) -- - th: Actions — resources/js/Pages/StockTransfers/Index.vue:133
- [ ] **e0040-c019** [prose, lines 215-215](../development-pack/modules/23_stock_transfers.md#L215) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0040-c020** [table row, lines 217-217](../development-pack/modules/23_stock_transfers.md#L217) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0040-c021** [table row, lines 219-219](../development-pack/modules/23_stock_transfers.md#L219) -- New Transfer — resources/js/Pages/StockTransfers/Index.vue:78  /  variant="default"; size="sm"; as="Link"; :href="route('stock-transfers.create')"  /  No ancestor condition
- [ ] **e0040-c022** [table row, lines 220-220](../development-pack/modules/23_stock_transfers.md#L220) -- Clear — resources/js/Pages/StockTransfers/Index.vue:117  /  type="button"; variant="secondary"; size="sm"; @click="clearFilters"  /  No ancestor condition
- [ ] **e0040-c023** [table row, lines 221-221](../development-pack/modules/23_stock_transfers.md#L221) -- New Transfer — resources/js/Pages/StockTransfers/Index.vue:142  /  variant="default"; size="sm"; as="Link"; :href="route('stock-transfers.create')"  /  v-if="!transfers.data?.length"
- [ ] **e0040-c024** [table row, lines 222-222](../development-pack/modules/23_stock_transfers.md#L222) -- transfer.transfer_number — resources/js/Pages/StockTransfers/Index.vue:151  /  :href="route('stock-transfers.show', transfer.id)"  /  v-for="transfer in transfers.data"
- [ ] **e0040-c025** [table row, lines 223-223](../development-pack/modules/23_stock_transfers.md#L223) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/StockTransfers/Index.vue:172  /  :href="route('stock-transfers.show', transfer.id)"; :title="t('common.view')"  /  v-fo...
- [ ] **e0040-c026** [table row, lines 224-224](../development-pack/modules/23_stock_transfers.md#L224) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/StockTransfers/Index.vue:186  /  v-if="link.url"; :href="link.url"; v-html="link.label"  /  v-if="transfers.links &amp;&amp; tr...
- [ ] **e0040-c027** [prose, lines 226-226](../development-pack/modules/23_stock_transfers.md#L226) -- **Script endpoint names:** stock-transfers.index. Match these to verb/path/permission in the route annex.

### e0041: StockTransfers/Show

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0041). Complete every clause below before closing this section in the ledger.

- [ ] **e0041-c001** [prose, lines 236-236](../development-pack/modules/23_stock_transfers.md#L236) -- GET /stock-transfers/{transfer}; transfer_stock. Header status, approval panel, transfer meta, item product/SKU/qty/notes, local scan-verification checklist. Conditional prepare/ship/complet...
- [ ] **e0041-c002** [prose, lines 238-238](../development-pack/modules/23_stock_transfers.md#L238) -- Source: resources/js/Pages/StockTransfers/Show.vue:1.
- [ ] **e0041-c003** [prose, lines 240-240](../development-pack/modules/23_stock_transfers.md#L240) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0041-c004** [source-code reference, lines 242-257](../development-pack/modules/23_stock_transfers.md#L242) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0041-c005** [prose, lines 259-259](../development-pack/modules/23_stock_transfers.md#L259) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0041-c006** [table row, lines 261-261](../development-pack/modules/23_stock_transfers.md#L261) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0041-c007** [table row, lines 263-263](../development-pack/modules/23_stock_transfers.md#L263) -- shipping.shipping_method — resources/js/Pages/StockTransfers/Show.vue:370  /  Service  /  input; props.transfer.shipping_method \ / \ /  ''  /  v-model="shipping.shipping_method"  /  v-if="c...
- [ ] **e0041-c008** [table row, lines 264-264](../development-pack/modules/23_stock_transfers.md#L264) -- shipping.tracking_number — resources/js/Pages/StockTransfers/Show.vue:371  /  Tracking number  /  input; props.transfer.tracking_number \ / \ /  ''  /  v-model="shipping.tracking_number"  / ...
- [ ] **e0041-c009** [prose, lines 266-266](../development-pack/modules/23_stock_transfers.md#L266) -- **Read fields, columns and section headings:**
- [ ] **e0041-c010** [statement, lines 268-268](../development-pack/modules/23_stock_transfers.md#L268) -- - h3: Transfer Details — resources/js/Pages/StockTransfers/Show.vue:201
- [ ] **e0041-c011** [statement, lines 269-269](../development-pack/modules/23_stock_transfers.md#L269) -- - dt: Transfer Number — resources/js/Pages/StockTransfers/Show.vue:207
- [ ] **e0041-c012** [statement, lines 270-270](../development-pack/modules/23_stock_transfers.md#L270) -- - dt: Transferred By — resources/js/Pages/StockTransfers/Show.vue:211
- [ ] **e0041-c013** [statement, lines 271-271](../development-pack/modules/23_stock_transfers.md#L271) -- - dt: From Location — resources/js/Pages/StockTransfers/Show.vue:215
- [ ] **e0041-c014** [statement, lines 272-272](../development-pack/modules/23_stock_transfers.md#L272) -- - dt: To Location — resources/js/Pages/StockTransfers/Show.vue:222
- [ ] **e0041-c015** [statement, lines 273-273](../development-pack/modules/23_stock_transfers.md#L273) -- - dt: Created — resources/js/Pages/StockTransfers/Show.vue:229
- [ ] **e0041-c016** [statement, lines 274-274](../development-pack/modules/23_stock_transfers.md#L274) -- - dt: Completed — resources/js/Pages/StockTransfers/Show.vue:233 — v-if="transfer.completed_at"
- [ ] **e0041-c017** [statement, lines 275-275](../development-pack/modules/23_stock_transfers.md#L275) -- - dt: Completed by — resources/js/Pages/StockTransfers/Show.vue:237 — v-if="transfer.completer"
- [ ] **e0041-c018** [statement, lines 276-276](../development-pack/modules/23_stock_transfers.md#L276) -- - h3: Transfer Items — resources/js/Pages/StockTransfers/Show.vue:251
- [ ] **e0041-c019** [statement, lines 277-277](../development-pack/modules/23_stock_transfers.md#L277) -- - th: Product — resources/js/Pages/StockTransfers/Show.vue:257
- [ ] **e0041-c020** [statement, lines 278-278](../development-pack/modules/23_stock_transfers.md#L278) -- - th: SKU — resources/js/Pages/StockTransfers/Show.vue:258
- [ ] **e0041-c021** [statement, lines 279-279](../development-pack/modules/23_stock_transfers.md#L279) -- - th: Quantity — resources/js/Pages/StockTransfers/Show.vue:259
- [ ] **e0041-c022** [statement, lines 280-280](../development-pack/modules/23_stock_transfers.md#L280) -- - th: Notes — resources/js/Pages/StockTransfers/Show.vue:260
- [ ] **e0041-c023** [statement, lines 281-281](../development-pack/modules/23_stock_transfers.md#L281) -- - h3: Scan to verify — resources/js/Pages/StockTransfers/Show.vue:296 — v-if="canComplete"
- [ ] **e0041-c024** [statement, lines 282-282](../development-pack/modules/23_stock_transfers.md#L282) -- - h3: Actions — resources/js/Pages/StockTransfers/Show.vue:367 — v-if="canPrepare \|\| canShip \|\| canComplete \|\| canCancel"
- [ ] **e0041-c025** [prose, lines 284-284](../development-pack/modules/23_stock_transfers.md#L284) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0041-c026** [table row, lines 286-286](../development-pack/modules/23_stock_transfers.md#L286) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0041-c027** [table row, lines 288-288](../development-pack/modules/23_stock_transfers.md#L288) -- Workspace — resources/js/Pages/StockTransfers/Show.vue:165  /  :href="route('stock-transfers.index')"  /  No ancestor condition
- [ ] **e0041-c028** [table row, lines 289-289](../development-pack/modules/23_stock_transfers.md#L289) -- Stock Transfers — resources/js/Pages/StockTransfers/Show.vue:167  /  :href="route('stock-transfers.index')"  /  No ancestor condition
- [ ] **e0041-c029** [table row, lines 290-290](../development-pack/modules/23_stock_transfers.md#L290) -- Back to List — resources/js/Pages/StockTransfers/Show.vue:177  /  variant="secondary"; size="sm"; as="Link"; :href="route('stock-transfers.index')"  /  No ancestor condition
- [ ] **e0041-c030** [table row, lines 291-291](../development-pack/modules/23_stock_transfers.md#L291) -- Start scanning — resources/js/Pages/StockTransfers/Show.vue:304  /  v-if="!verifying"; variant="secondary"; size="lg"; @click="verifying = true"  /  v-if="canComplete"
- [ ] **e0041-c031** [table row, lines 292-292](../development-pack/modules/23_stock_transfers.md#L292) -- Scan — resources/js/Pages/StockTransfers/Show.vue:315  /  size="lg"; @click="showScanner = true"  /  v-if="canComplete" → v-else
- [ ] **e0041-c032** [table row, lines 293-293](../development-pack/modules/23_stock_transfers.md#L293) -- Reset — resources/js/Pages/StockTransfers/Show.vue:319  /  variant="secondary"; size="lg"; @click="resetVerification"  /  v-if="canComplete" → v-else
- [ ] **e0041-c033** [table row, lines 294-294](../development-pack/modules/23_stock_transfers.md#L294) -- Prepare stock — resources/js/Pages/StockTransfers/Show.vue:374  /  v-if="canPrepare"; :loading="processing"; :disabled="processing"; @click="prepareTransfer"  /  v-if="canPrepare \ / \ /  ca...
- [ ] **e0041-c034** [table row, lines 295-295](../development-pack/modules/23_stock_transfers.md#L295) -- Ship transfer — resources/js/Pages/StockTransfers/Show.vue:375  /  v-if="canShip"; :loading="processing"; :disabled="processing"; @click="shipTransfer"  /  v-if="canPrepare \ / \ /  canShip ...
- [ ] **e0041-c035** [table row, lines 296-296](../development-pack/modules/23_stock_transfers.md#L296) -- processing ? Processing... : transfer.stock_dispatched_at ? Receive transfer : Complete Transfer — resources/js/Pages/StockTransfers/Show.vue:376  /  v-if="canComplete"; variant="default"; :...
- [ ] **e0041-c036** [table row, lines 297-297](../development-pack/modules/23_stock_transfers.md#L297) -- processing ? Processing... : Cancel Transfer — resources/js/Pages/StockTransfers/Show.vue:386  /  v-if="canCancel"; variant="danger"; :loading="processing"; :disabled="processing"; @click="c...
- [ ] **e0041-c037** [prose, lines 299-299](../development-pack/modules/23_stock_transfers.md#L299) -- **Script endpoint names:** stock-transfers.${action}, stock-transfers.complete, stock-transfers.cancel. Match these to verb/path/permission in the route annex.

### e0071: StockTransfer/StoreStockTransferRequest.php

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0071). Complete every clause below before closing this section in the ledger.

- [ ] **e0071-c001** [prose, lines 309-309](../development-pack/modules/23_stock_transfers.md#L309) -- Source app/Http/Requests/StockTransfer/StoreStockTransferRequest.php:1
- [ ] **e0071-c002** [source-code reference, lines 311-351](../development-pack/modules/23_stock_transfers.md#L311) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0072: StockTransfer/UpdateStockTransferRequest.php

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0072). Complete every clause below before closing this section in the ledger.

- [ ] **e0072-c001** [prose, lines 361-361](../development-pack/modules/23_stock_transfers.md#L361) -- Source app/Http/Requests/StockTransfer/UpdateStockTransferRequest.php:1
- [ ] **e0072-c002** [source-code reference, lines 363-392](../development-pack/modules/23_stock_transfers.md#L363) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0107: StockTransfer

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0107). Complete every clause below before closing this section in the ledger.

- [ ] **e0107-c001** [prose, lines 401-401](../development-pack/modules/23_stock_transfers.md#L401) -- app/Models/Inventory/StockTransfer.php:1
- [ ] **e0107-c002** [source-code reference, lines 403-463](../development-pack/modules/23_stock_transfers.md#L403) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0108: StockTransferItem

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0108). Complete every clause below before closing this section in the ledger.

- [ ] **e0108-c001** [prose, lines 472-472](../development-pack/modules/23_stock_transfers.md#L472) -- app/Models/Inventory/StockTransferItem.php:1
- [ ] **e0108-c002** [source-code reference, lines 474-493](../development-pack/modules/23_stock_transfers.md#L474) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0133: 2026_03_12_100000_create_stock_transfers_table.php

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0133). Complete every clause below before closing this section in the ledger.

- [ ] **e0133-c001** [prose, lines 502-502](../development-pack/modules/23_stock_transfers.md#L502) -- database/migrations/2026_03_12_100000_create_stock_transfers_table.php:1
- [ ] **e0133-c002** [source-code reference, lines 504-525](../development-pack/modules/23_stock_transfers.md#L504) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0149: 2026_09_30_142347_add_completed_by_to_stock_transfers_table.php

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0149). Complete every clause below before closing this section in the ledger.

- [ ] **e0149-c001** [prose, lines 534-534](../development-pack/modules/23_stock_transfers.md#L534) -- database/migrations/2026_09_30_142347_add_completed_by_to_stock_transfers_table.php:1
- [ ] **e0149-c002** [source-code reference, lines 536-541](../development-pack/modules/23_stock_transfers.md#L536) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0153: 2026_10_21_000003_add_prepared_variant_transfers.php

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0153). Complete every clause below before closing this section in the ledger.

- [ ] **e0153-c001** [prose, lines 550-550](../development-pack/modules/23_stock_transfers.md#L550) -- database/migrations/2026_10_21_000003_add_prepared_variant_transfers.php:1
- [ ] **e0153-c002** [source-code reference, lines 552-561](../development-pack/modules/23_stock_transfers.md#L552) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0495: `app/Http/Requests/Api/StockTransfer/ShipStockTransferRequest.php`

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0495). Complete every clause below before closing this section in the ledger.

- [ ] **e0495-c001** [prose, lines 571-571](../development-pack/modules/23_stock_transfers.md#L571) -- Source evidence. SHA-256: 589033c813cbc4dec67f610a8828a8550bb90c084ac93b470e16dd90bb7cef2a.
- [ ] **e0495-c002** [source-code reference, lines 573-599](../development-pack/modules/23_stock_transfers.md#L573) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0496: `app/Http/Requests/Api/StockTransfer/StoreStockTransferRequest.php`

Source: [exact contract](../development-pack/modules/23_stock_transfers.md#e0496). Complete every clause below before closing this section in the ledger.

- [ ] **e0496-c001** [prose, lines 609-609](../development-pack/modules/23_stock_transfers.md#L609) -- Source evidence. SHA-256: 13a7cc4cf7c7654ba54b54b772dd3ff746c3c3e357a211d1dca31b566ec082f3.
- [ ] **e0496-c002** [source-code reference, lines 611-651](../development-pack/modules/23_stock_transfers.md#L611) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/24_stock_audits.md

### e0010: Audits/count history/reviews/offline drafts

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0010). Complete every clause below before closing this section in the ledger.

- [ ] **e0010-c001** [statement, lines 117-117](../development-pack/modules/24_stock_audits.md#L117) -- - Create draft with type full/cycle/spot; optional warehouse/location; optional chosen products for non-full UI; require_variance_approval false default. Warehouse selection clears location ...
- [ ] **e0010-c002** [statement, lines 118-118](../development-pack/modules/24_stock_audits.md#L118) -- - Start only draft with at least one item; acquires organization workflow lock, refreshes system quantities at start, becomes in_progress. Existing loaded lines are invalidated. StockAuditSe...
- [ ] **e0010-c003** [statement, lines 119-119](../development-pack/modules/24_stock_audits.md#L119) -- - Draft editing changes metadata/type/location/review requirement, not product selection or warehouse ID. Start/edit/delete are draft-only; count/complete require in_progress and manage_stoc...
- [ ] **e0010-c004** [statement, lines 120-120](../development-pack/modules/24_stock_audits.md#L120) -- - Line edit sets quantity from retained local draft, existing count, or system quantity in that order. Count integer 0..2,147,483,647; notes &lt;=500; optimistic expected_revision preserves sta...
- [ ] **e0010-c005** [statement, lines 121-121](../development-pack/modules/24_stock_audits.md#L121) -- - Local draft storage is scoped by audit/organization; close editor retains draft; explicit discard clears it. Send drafts sequentially, fetch missing paged line, keep draft on offline/netwo...
- [ ] **e0010-c006** [statement, lines 122-122](../development-pack/modules/24_stock_audits.md#L122) -- - Review decisions approved/recount_requested require the exact 64-char hex count revision; recount notes required 3..500. Self-approval depends on canSelfApprove; manage counts and approve ...
- [ ] **e0010-c007** [statement, lines 123-123](../development-pack/modules/24_stock_audits.md#L123) -- - Completion requires reviewed variances when configured; uncounted lines need explicit allow_uncounted and remain unchanged; plugin veto can block posting. For counted lines, discrepancy = ...
- [ ] **e0010-c008** [statement, lines 124-124](../development-pack/modules/24_stock_audits.md#L124) -- - Scanning must resolve a line in **this audit**, not blindly use global product inventory; warehouse audits may require selecting the location when multiple candidate bins exist. Parent/var...

### e0011: Cycle schedules

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0011). Complete every clause below before closing this section in the ledger.

- [ ] **e0011-c001** [statement, lines 134-134](../development-pack/modules/24_stock_audits.md#L134) -- - frequency: daily/weekly/monthly; scope_type: all/location/warehouse/category. Scope ID required unless all, and reset when type changes. There is no ABC classification scope.
- [ ] **e0011-c002** [statement, lines 135-135](../development-pack/modules/24_stock_audits.md#L135) -- - Defaults weekly, all, products_per_run 20, active true, no assignee, blank first run. Server max 1,000 products/run; chosen assignee must be member of organization. Blank first run follows...
- [ ] **e0011-c003** [statement, lines 136-136](../development-pack/modules/24_stock_audits.md#L136) -- - Hourly scheduler runs due active schedules; draft cycle audits include never-counted then least-recently-counted active products, stable ID order. Previous still-open audit prevents anothe...

### e0032: StockAudits/CountHistory

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0032). Complete every clause below before closing this section in the ledger.

- [ ] **e0032-c001** [prose, lines 146-146](../development-pack/modules/24_stock_audits.md#L146) -- GET /stock-audits/{audit}/items/{item}/counts; view_stock_audits. No input. Read current system/count/discrepancy, review evidence, and paginated count events: sequence/date/actor/system/cou...
- [ ] **e0032-c002** [prose, lines 148-148](../development-pack/modules/24_stock_audits.md#L148) -- Source: resources/js/Pages/StockAudits/CountHistory.vue:1.
- [ ] **e0032-c003** [prose, lines 150-150](../development-pack/modules/24_stock_audits.md#L150) -- **Input fields:** none in this page/component template.
- [ ] **e0032-c004** [prose, lines 153-153](../development-pack/modules/24_stock_audits.md#L153) -- **Read fields, columns and section headings:**
- [ ] **e0032-c005** [statement, lines 155-155](../development-pack/modules/24_stock_audits.md#L155) -- - dt: Counted Qty — resources/js/Pages/StockAudits/CountHistory.vue:33 — v-for="count in counts.data"
- [ ] **e0032-c006** [statement, lines 156-156](../development-pack/modules/24_stock_audits.md#L156) -- - dt: System Qty — resources/js/Pages/StockAudits/CountHistory.vue:34 — v-for="count in counts.data"
- [ ] **e0032-c007** [statement, lines 157-157](../development-pack/modules/24_stock_audits.md#L157) -- - dt: Discrepancy — resources/js/Pages/StockAudits/CountHistory.vue:35 — v-for="count in counts.data"
- [ ] **e0032-c008** [statement, lines 158-158](../development-pack/modules/24_stock_audits.md#L158) -- - th: # — resources/js/Pages/StockAudits/CountHistory.vue:45
- [ ] **e0032-c009** [statement, lines 159-159](../development-pack/modules/24_stock_audits.md#L159) -- - th: Date — resources/js/Pages/StockAudits/CountHistory.vue:45
- [ ] **e0032-c010** [statement, lines 160-160](../development-pack/modules/24_stock_audits.md#L160) -- - th: Counted By — resources/js/Pages/StockAudits/CountHistory.vue:46
- [ ] **e0032-c011** [statement, lines 161-161](../development-pack/modules/24_stock_audits.md#L161) -- - th: System Qty — resources/js/Pages/StockAudits/CountHistory.vue:47
- [ ] **e0032-c012** [statement, lines 162-162](../development-pack/modules/24_stock_audits.md#L162) -- - th: Counted Qty — resources/js/Pages/StockAudits/CountHistory.vue:48
- [ ] **e0032-c013** [statement, lines 163-163](../development-pack/modules/24_stock_audits.md#L163) -- - th: Discrepancy — resources/js/Pages/StockAudits/CountHistory.vue:49
- [ ] **e0032-c014** [statement, lines 164-164](../development-pack/modules/24_stock_audits.md#L164) -- - th: Notes — resources/js/Pages/StockAudits/CountHistory.vue:50
- [ ] **e0032-c015** [prose, lines 166-166](../development-pack/modules/24_stock_audits.md#L166) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0032-c016** [table row, lines 168-168](../development-pack/modules/24_stock_audits.md#L168) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0032-c017** [table row, lines 170-170](../development-pack/modules/24_stock_audits.md#L170) -- Back — resources/js/Pages/StockAudits/CountHistory.vue:21  /  :href="route('stock-audits.show', audit.id)"  /  No ancestor condition

### e0033: StockAudits/Create

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0033). Complete every clause below before closing this section in the ledger.

- [ ] **e0033-c001** [prose, lines 180-180](../development-pack/modules/24_stock_audits.md#L180) -- GET /stock-audits/create; create_stock_audits. Initial type cycle, no warehouse/location, no products, review false. Details fields + non-full product selector with local name/SKU search, se...
- [ ] **e0033-c002** [prose, lines 182-182](../development-pack/modules/24_stock_audits.md#L182) -- Source: resources/js/Pages/StockAudits/Create.vue:1.
- [ ] **e0033-c003** [prose, lines 184-184](../development-pack/modules/24_stock_audits.md#L184) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0033-c004** [source-code reference, lines 186-202](../development-pack/modules/24_stock_audits.md#L186) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0033-c005** [prose, lines 204-204](../development-pack/modules/24_stock_audits.md#L204) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0033-c006** [table row, lines 206-206](../development-pack/modules/24_stock_audits.md#L206) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0033-c007** [table row, lines 208-208](../development-pack/modules/24_stock_audits.md#L208) -- form.name — resources/js/Pages/StockAudits/Create.vue:111  /  Audit Name *  /  text; ''  /  ; v-model="form.name"; type="text"; required; maxlength="255"; :placeholder="t('stockAudits.fields...
- [ ] **e0033-c008** [table row, lines 209-209](../development-pack/modules/24_stock_audits.md#L209) -- form.description — resources/js/Pages/StockAudits/Create.vue:129  /  Description  /  textarea; ''  /  ; v-model="form.description"; rows="3"; maxlength="1000"; :placeholder="t('stockAudits.f...
- [ ] **e0033-c009** [table row, lines 210-210](../development-pack/modules/24_stock_audits.md#L210) -- form.audit_type — resources/js/Pages/StockAudits/Create.vue:147  /  Audit Type *  /  select; 'cycle'  /  ; v-model="form.audit_type"; required  /  Always within this view/dialog; see compone...
- [ ] **e0033-c010** [table row, lines 211-211](../development-pack/modules/24_stock_audits.md#L211) -- form.warehouse_id — resources/js/Pages/StockAudits/Create.vue:166  /  Warehouse  /  select; ''  /  ; v-model="form.warehouse_id"  /  Always within this view/dialog; see component visibility
- [ ] **e0033-c011** [table row, lines 212-212](../development-pack/modules/24_stock_audits.md#L212) -- form.warehouse_location_id — resources/js/Pages/StockAudits/Create.vue:177  /  Warehouse Location  /  select; ''  /  ; v-model="form.warehouse_location_id"  /  Always within this view/dialog...
- [ ] **e0033-c012** [table row, lines 213-213](../development-pack/modules/24_stock_audits.md#L213) -- form.notes — resources/js/Pages/StockAudits/Create.vue:201  /  Notes  /  textarea; ''  /  ; v-model="form.notes"; rows="2"; maxlength="2000"; :placeholder="t('stockAudits.create.notesPlaceho...
- [ ] **e0033-c013** [table row, lines 214-214](../development-pack/modules/24_stock_audits.md#L214) -- form.require_variance_approval — resources/js/Pages/StockAudits/Create.vue:213  /  Require variance approval Variances need review before this audit can finish.  /  checkbox; false  /  v-mod...
- [ ] **e0033-c014** [table row, lines 215-215](../development-pack/modules/24_stock_audits.md#L215) -- productSearch — resources/js/Pages/StockAudits/Create.vue:230  /  No explicit label / see context  /  text; ''  /  ; v-model="productSearch"; type="text"; :placeholder="t('stockAudits.create...
- [ ] **e0033-c015** [table row, lines 216-216](../development-pack/modules/24_stock_audits.md#L216) -- selectAllProducts — resources/js/Pages/StockAudits/Create.vue:240  /  No explicit label / see context  /  checkbox; false  /  ; type="checkbox"; v-model="selectAllProducts"; @change="toggleS...
- [ ] **e0033-c016** [table row, lines 217-217](../development-pack/modules/24_stock_audits.md#L217) -- (unbound) — resources/js/Pages/StockAudits/Create.vue:261  /  product.name SKU: product.sku product.stock in stock  /  checkbox; See :value / :checked and event handler; not a v-model field ...
- [ ] **e0033-c017** [prose, lines 219-219](../development-pack/modules/24_stock_audits.md#L219) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0033-c018** [statement, lines 221-221](../development-pack/modules/24_stock_audits.md#L221) -- - form.audit_type (resources/js/Pages/StockAudits/Create.vue:147): &amp;lt;option v-for="(label, value) in auditTypes" :key="value" :value="value"&amp;gt;{{ t(stockAudits.types.${value}) }}&amp;lt;/opti...
- [ ] **e0033-c019** [statement, lines 222-222](../development-pack/modules/24_stock_audits.md#L222) -- - form.warehouse_id (resources/js/Pages/StockAudits/Create.vue:166): &amp;lt;option value=""&amp;gt;{{ All Warehouses }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="warehouse in page.props.warehouses \|\| &#91;&#93;" ...
- [ ] **e0033-c020** [statement, lines 223-223](../development-pack/modules/24_stock_audits.md#L223) -- - form.warehouse_location_id (resources/js/Pages/StockAudits/Create.vue:177): &amp;lt;option value=""&amp;gt;{{ All Locations }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="location in scopedLocations" :key="l...
- [ ] **e0033-c021** [prose, lines 225-225](../development-pack/modules/24_stock_audits.md#L225) -- **Read fields, columns and section headings:**
- [ ] **e0033-c022** [statement, lines 227-227](../development-pack/modules/24_stock_audits.md#L227) -- - h3: Audit Details — resources/js/Pages/StockAudits/Create.vue:104
- [ ] **e0033-c023** [statement, lines 228-228](../development-pack/modules/24_stock_audits.md#L228) -- - h3: Select Products — resources/js/Pages/StockAudits/Create.vue:222 — v-if="form.audit_type !== 'full'"
- [ ] **e0033-c024** [prose, lines 230-230](../development-pack/modules/24_stock_audits.md#L230) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0033-c025** [table row, lines 232-232](../development-pack/modules/24_stock_audits.md#L232) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0033-c026** [table row, lines 234-234](../development-pack/modules/24_stock_audits.md#L234) -- Workspace — resources/js/Pages/StockAudits/Create.vue:84  /  :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0033-c027** [table row, lines 235-235](../development-pack/modules/24_stock_audits.md#L235) -- Stock Audits — resources/js/Pages/StockAudits/Create.vue:86  /  :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0033-c028** [table row, lines 236-236](../development-pack/modules/24_stock_audits.md#L236) -- Back to List — resources/js/Pages/StockAudits/Create.vue:94  /  variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0033-c029** [table row, lines 237-237](../development-pack/modules/24_stock_audits.md#L237) -- Cancel — resources/js/Pages/StockAudits/Create.vue:298  /  variant="secondary"; as="Link"; :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0033-c030** [table row, lines 238-238](../development-pack/modules/24_stock_audits.md#L238) -- form.processing ? Creating... : Create Audit — resources/js/Pages/StockAudits/Create.vue:299  /  type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing \ / ...
- [ ] **e0033-c031** [prose, lines 240-240](../development-pack/modules/24_stock_audits.md#L240) -- **Script endpoint names:** stock-audits.store. Match these to verb/path/permission in the route annex.

### e0034: StockAudits/CycleCounts/Form

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0034). Complete every clause below before closing this section in the ledger.

- [ ] **e0034-c001** [prose, lines 250-250](../development-pack/modules/24_stock_audits.md#L250) -- GET /cycle-counts/create or /cycle-counts/{id}/edit; manage_stock_audits. Shared create/edit page with name/frequency/scope and conditional scope_id/products_per_run/assignee/next_run_at/act...
- [ ] **e0034-c002** [prose, lines 252-252](../development-pack/modules/24_stock_audits.md#L252) -- Source: resources/js/Pages/StockAudits/CycleCounts/Form.vue:1.
- [ ] **e0034-c003** [prose, lines 254-254](../development-pack/modules/24_stock_audits.md#L254) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0034-c004** [source-code reference, lines 256-268](../development-pack/modules/24_stock_audits.md#L256) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0034-c005** [prose, lines 270-270](../development-pack/modules/24_stock_audits.md#L270) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0034-c006** [table row, lines 272-272](../development-pack/modules/24_stock_audits.md#L272) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0034-c007** [table row, lines 274-274](../development-pack/modules/24_stock_audits.md#L274) -- form.name — resources/js/Pages/StockAudits/CycleCounts/Form.vue:90  /  Name  /  text; props.schedule?.name ?? ''  /  ; v-model="form.name"; type="text"; maxlength="255"; required; :placehold...
- [ ] **e0034-c008** [table row, lines 275-275](../development-pack/modules/24_stock_audits.md#L275) -- form.frequency — resources/js/Pages/StockAudits/CycleCounts/Form.vue:97  /  Frequency  /  select; props.schedule?.frequency ?? 'weekly'  /  ; v-model="form.frequency"  /  Always within this ...
- [ ] **e0034-c009** [table row, lines 276-276](../development-pack/modules/24_stock_audits.md#L276) -- form.products_per_run — resources/js/Pages/StockAudits/CycleCounts/Form.vue:104  /  Products per run  /  number; props.schedule?.products_per_run ?? 20  /  ; v-model.number="form.products_pe...
- [ ] **e0034-c010** [table row, lines 277-277](../development-pack/modules/24_stock_audits.md#L277) -- form.scope_type — resources/js/Pages/StockAudits/CycleCounts/Form.vue:113  /  Scope  /  select; props.schedule?.scope_type ?? 'all'  /  ; v-model="form.scope_type"  /  Always within this vie...
- [ ] **e0034-c011** [table row, lines 278-278](../development-pack/modules/24_stock_audits.md#L278) -- form.scope_id — resources/js/Pages/StockAudits/CycleCounts/Form.vue:120  /  t(cycleCounts.scopes.${form.scope_type})  /  select; props.schedule?.scope_id ?? null  /  ; v-model="form.scope_id...
- [ ] **e0034-c012** [table row, lines 279-279](../development-pack/modules/24_stock_audits.md#L279) -- form.assigned_to — resources/js/Pages/StockAudits/CycleCounts/Form.vue:131  /  Assignee  /  select; props.schedule?.assigned_to ?? null  /  ; v-model="form.assigned_to"  /  Always within thi...
- [ ] **e0034-c013** [table row, lines 280-280](../development-pack/modules/24_stock_audits.md#L280) -- form.next_run_at — resources/js/Pages/StockAudits/CycleCounts/Form.vue:139  /  editing ? Next run : First run  /  datetime-local; props.schedule?.next_run_at ?? ''  /  ; v-model="form.next_r...
- [ ] **e0034-c014** [table row, lines 281-281](../development-pack/modules/24_stock_audits.md#L281) -- form.is_active — resources/js/Pages/StockAudits/CycleCounts/Form.vue:146  /  Active (runs on schedule)  /  checkbox; props.schedule?.is_active ?? true  /  v-model="form.is_active"; type="che...
- [ ] **e0034-c015** [prose, lines 283-283](../development-pack/modules/24_stock_audits.md#L283) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0034-c016** [statement, lines 285-285](../development-pack/modules/24_stock_audits.md#L285) -- - form.frequency (resources/js/Pages/StockAudits/CycleCounts/Form.vue:97): &amp;lt;option v-for="f in frequencies" :key="f" :value="f"&amp;gt;{{ t(cycleCounts.frequencies.${f}) }}&amp;lt;/option&amp;gt;
- [ ] **e0034-c017** [statement, lines 286-286](../development-pack/modules/24_stock_audits.md#L286) -- - form.scope_type (resources/js/Pages/StockAudits/CycleCounts/Form.vue:113): &amp;lt;option v-for="s in scopes" :key="s" :value="s"&amp;gt;{{ t(cycleCounts.scopes.${s}) }}&amp;lt;/option&amp;gt;
- [ ] **e0034-c018** [statement, lines 287-287](../development-pack/modules/24_stock_audits.md#L287) -- - form.scope_id (resources/js/Pages/StockAudits/CycleCounts/Form.vue:120): &amp;lt;option :value="null" disabled&amp;gt;{{ Choose one }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="o in scopeOptions" :key="o.i...
- [ ] **e0034-c019** [statement, lines 288-288](../development-pack/modules/24_stock_audits.md#L288) -- - form.assigned_to (resources/js/Pages/StockAudits/CycleCounts/Form.vue:131): &amp;lt;option :value="null"&amp;gt;{{ Unassigned }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="u in users" :key="u.id" :value="u....
- [ ] **e0034-c020** [prose, lines 290-290](../development-pack/modules/24_stock_audits.md#L290) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0034-c021** [table row, lines 292-292](../development-pack/modules/24_stock_audits.md#L292) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0034-c022** [table row, lines 294-294](../development-pack/modules/24_stock_audits.md#L294) -- Stock Audits — resources/js/Pages/StockAudits/CycleCounts/Form.vue:69  /  :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0034-c023** [table row, lines 295-295](../development-pack/modules/24_stock_audits.md#L295) -- Cycle count schedules — resources/js/Pages/StockAudits/CycleCounts/Form.vue:71  /  :href="route('cycle-counts.index')"  /  No ancestor condition
- [ ] **e0034-c024** [table row, lines 296-296](../development-pack/modules/24_stock_audits.md#L296) -- Back — resources/js/Pages/StockAudits/CycleCounts/Form.vue:79  /  variant="secondary"; size="sm"; as="Link"; :href="route('cycle-counts.index')"  /  No ancestor condition
- [ ] **e0034-c025** [table row, lines 297-297](../development-pack/modules/24_stock_audits.md#L297) -- Cancel — resources/js/Pages/StockAudits/CycleCounts/Form.vue:151  /  variant="secondary"; size="lg"; as="Link"; :href="route('cycle-counts.index')"  /  No ancestor condition
- [ ] **e0034-c026** [table row, lines 298-298](../development-pack/modules/24_stock_audits.md#L298) -- editing ? Save Changes : Create schedule — resources/js/Pages/StockAudits/CycleCounts/Form.vue:152  /  type="submit"; size="lg"; :loading="form.processing"; :disabled="form.processing"  /  N...
- [ ] **e0034-c027** [prose, lines 300-300](../development-pack/modules/24_stock_audits.md#L300) -- **Script endpoint names:** cycle-counts.update, cycle-counts.store. Match these to verb/path/permission in the route annex.

### e0035: StockAudits/CycleCounts/Index

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0035). Complete every clause below before closing this section in the ledger.

- [ ] **e0035-c001** [prose, lines 310-310](../development-pack/modules/24_stock_audits.md#L310) -- GET /cycle-counts; view_stock_audits. Schedule cards name/frequency/active/scope/products per run/assignee/next run/last audit; create/edit/run-now/delete require manage_stock_audits. Run-no...
- [ ] **e0035-c002** [prose, lines 312-312](../development-pack/modules/24_stock_audits.md#L312) -- Source: resources/js/Pages/StockAudits/CycleCounts/Index.vue:1.
- [ ] **e0035-c003** [prose, lines 314-314](../development-pack/modules/24_stock_audits.md#L314) -- **Input fields:** none in this page/component template.
- [ ] **e0035-c004** [prose, lines 317-317](../development-pack/modules/24_stock_audits.md#L317) -- **Read fields, columns and section headings:**
- [ ] **e0035-c005** [statement, lines 319-319](../development-pack/modules/24_stock_audits.md#L319) -- - h3: schedule.name — resources/js/Pages/StockAudits/CycleCounts/Index.vue:89 — v-for="schedule in schedules"
- [ ] **e0035-c006** [statement, lines 320-320](../development-pack/modules/24_stock_audits.md#L320) -- - dt: Scope : — resources/js/Pages/StockAudits/CycleCounts/Index.vue:96 — v-for="schedule in schedules"
- [ ] **e0035-c007** [statement, lines 321-321](../development-pack/modules/24_stock_audits.md#L321) -- - dt: Products per run : — resources/js/Pages/StockAudits/CycleCounts/Index.vue:97 — v-for="schedule in schedules"
- [ ] **e0035-c008** [statement, lines 322-322](../development-pack/modules/24_stock_audits.md#L322) -- - dt: Assignee : — resources/js/Pages/StockAudits/CycleCounts/Index.vue:98 — v-for="schedule in schedules"
- [ ] **e0035-c009** [statement, lines 323-323](../development-pack/modules/24_stock_audits.md#L323) -- - dt: Next run : — resources/js/Pages/StockAudits/CycleCounts/Index.vue:99 — v-for="schedule in schedules"
- [ ] **e0035-c010** [statement, lines 324-324](../development-pack/modules/24_stock_audits.md#L324) -- - dt: Last audit : — resources/js/Pages/StockAudits/CycleCounts/Index.vue:101 — v-for="schedule in schedules"
- [ ] **e0035-c011** [prose, lines 326-326](../development-pack/modules/24_stock_audits.md#L326) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0035-c012** [table row, lines 328-328](../development-pack/modules/24_stock_audits.md#L328) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0035-c013** [table row, lines 330-330](../development-pack/modules/24_stock_audits.md#L330) -- Stock Audits — resources/js/Pages/StockAudits/CycleCounts/Index.vue:50  /  :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0035-c014** [table row, lines 331-331](../development-pack/modules/24_stock_audits.md#L331) -- Stock audits — resources/js/Pages/StockAudits/CycleCounts/Index.vue:58  /  variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0035-c015** [table row, lines 332-332](../development-pack/modules/24_stock_audits.md#L332) -- New schedule — resources/js/Pages/StockAudits/CycleCounts/Index.vue:62  /  v-if="(canManage) &amp;&amp; canVisit('cycle-counts.create')"; size="sm"; as="Link"; :href="route('cycle-counts.create')"  ...
- [ ] **e0035-c016** [table row, lines 333-333](../development-pack/modules/24_stock_audits.md#L333) -- New schedule — resources/js/Pages/StockAudits/CycleCounts/Index.vue:78  /  v-if="(canManage) &amp;&amp; canVisit('cycle-counts.create')"; size="lg"; as="Link"; :href="route('cycle-counts.create')"  ...
- [ ] **e0035-c017** [table row, lines 334-334](../development-pack/modules/24_stock_audits.md#L334) -- schedule.last_audit.audit_number — resources/js/Pages/StockAudits/CycleCounts/Index.vue:103  /  v-if="schedule.last_audit"; :href="route('stock-audits.show', schedule.last_audit.id)"  /  v-f...
- [ ] **e0035-c018** [table row, lines 335-335](../development-pack/modules/24_stock_audits.md#L335) -- Run now — resources/js/Pages/StockAudits/CycleCounts/Index.vue:114  /  variant="secondary"; size="lg"; @click="runNow(schedule)"  /  v-for="schedule in schedules" → v-if="canManage"
- [ ] **e0035-c019** [table row, lines 336-336](../development-pack/modules/24_stock_audits.md#L336) -- Edit — resources/js/Pages/StockAudits/CycleCounts/Index.vue:118  /  v-if="canVisit('cycle-counts.edit')"; variant="secondary"; size="lg"; as="Link"; :href="route('cycle-counts.edit', schedul...
- [ ] **e0035-c020** [table row, lines 337-337](../development-pack/modules/24_stock_audits.md#L337) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/StockAudits/CycleCounts/Index.vue:122  /  variant="ghost"; size="lg"; :aria-label="t('common.delete')"; @click="destroy...
- [ ] **e0035-c021** [prose, lines 339-339](../development-pack/modules/24_stock_audits.md#L339) -- **Script endpoint names:** cycle-counts.run, cycle-counts.destroy. Match these to verb/path/permission in the route annex.

### e0036: StockAudits/Edit

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0036). Complete every clause below before closing this section in the ledger.

- [ ] **e0036-c001** [prose, lines 349-349](../development-pack/modules/24_stock_audits.md#L349) -- GET /stock-audits/{audit}/edit; manage_stock_audits and draft. Saved metadata defaults; fields name/description/type/location/notes/review toggle. No product set or warehouse selector. PUT u...
- [ ] **e0036-c002** [prose, lines 351-351](../development-pack/modules/24_stock_audits.md#L351) -- Source: resources/js/Pages/StockAudits/Edit.vue:1.
- [ ] **e0036-c003** [prose, lines 353-353](../development-pack/modules/24_stock_audits.md#L353) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0036-c004** [source-code reference, lines 355-365](../development-pack/modules/24_stock_audits.md#L355) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0036-c005** [prose, lines 367-367](../development-pack/modules/24_stock_audits.md#L367) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0036-c006** [table row, lines 369-369](../development-pack/modules/24_stock_audits.md#L369) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0036-c007** [table row, lines 371-371](../development-pack/modules/24_stock_audits.md#L371) -- form.name — resources/js/Pages/StockAudits/Edit.vue:71  /  Audit Name *  /  text; props.audit.name \ / \ /  ''  /  ; v-model="form.name"; type="text"; required; maxlength="255"  /  Always wi...
- [ ] **e0036-c008** [table row, lines 372-372](../development-pack/modules/24_stock_audits.md#L372) -- form.description — resources/js/Pages/StockAudits/Edit.vue:85  /  Description  /  textarea; props.audit.description \ / \ /  ''  /  ; v-model="form.description"; rows="3"; maxlength="1000"; ...
- [ ] **e0036-c009** [table row, lines 373-373](../development-pack/modules/24_stock_audits.md#L373) -- form.audit_type — resources/js/Pages/StockAudits/Edit.vue:100  /  Audit Type *  /  select; props.audit.audit_type \ / \ /  'cycle'  /  ; v-model="form.audit_type"; required  /  Always within...
- [ ] **e0036-c010** [table row, lines 374-374](../development-pack/modules/24_stock_audits.md#L374) -- form.warehouse_location_id — resources/js/Pages/StockAudits/Edit.vue:114  /  Warehouse Location  /  select; props.audit.warehouse_location_id \ / \ /  ''  /  ; v-model="form.warehouse_locati...
- [ ] **e0036-c011** [table row, lines 375-375](../development-pack/modules/24_stock_audits.md#L375) -- form.notes — resources/js/Pages/StockAudits/Edit.vue:132  /  Notes  /  textarea; props.audit.notes \ / \ /  ''  /  ; v-model="form.notes"; rows="3"; maxlength="2000"; :placeholder="t('stockA...
- [ ] **e0036-c012** [table row, lines 376-376](../development-pack/modules/24_stock_audits.md#L376) -- form.require_variance_approval — resources/js/Pages/StockAudits/Edit.vue:145  /  Require variance approval Variances need review before this audit can finish.  /  checkbox; Boolean(props.aud...
- [ ] **e0036-c013** [prose, lines 378-378](../development-pack/modules/24_stock_audits.md#L378) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0036-c014** [statement, lines 380-380](../development-pack/modules/24_stock_audits.md#L380) -- - form.audit_type (resources/js/Pages/StockAudits/Edit.vue:100): &amp;lt;option v-for="(label, value) in auditTypes" :key="value" :value="value"&amp;gt;{{ t(stockAudits.types.${value}) }}&amp;lt;/option...
- [ ] **e0036-c015** [statement, lines 381-381](../development-pack/modules/24_stock_audits.md#L381) -- - form.warehouse_location_id (resources/js/Pages/StockAudits/Edit.vue:114): &amp;lt;option value=""&amp;gt;{{ All Locations }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="location in locations" :key="location....
- [ ] **e0036-c016** [prose, lines 383-383](../development-pack/modules/24_stock_audits.md#L383) -- **Read fields, columns and section headings:**
- [ ] **e0036-c017** [statement, lines 385-385](../development-pack/modules/24_stock_audits.md#L385) -- - h3: Audit Details — resources/js/Pages/StockAudits/Edit.vue:66
- [ ] **e0036-c018** [prose, lines 387-387](../development-pack/modules/24_stock_audits.md#L387) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0036-c019** [table row, lines 389-389](../development-pack/modules/24_stock_audits.md#L389) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0036-c020** [table row, lines 391-391](../development-pack/modules/24_stock_audits.md#L391) -- Workspace — resources/js/Pages/StockAudits/Edit.vue:43  /  :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0036-c021** [table row, lines 392-392](../development-pack/modules/24_stock_audits.md#L392) -- Stock Audits — resources/js/Pages/StockAudits/Edit.vue:45  /  :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0036-c022** [table row, lines 393-393](../development-pack/modules/24_stock_audits.md#L393) -- Back to Audit — resources/js/Pages/StockAudits/Edit.vue:53  /  variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.show', audit.id)"  /  No ancestor condition
- [ ] **e0036-c023** [table row, lines 394-394](../development-pack/modules/24_stock_audits.md#L394) -- View — resources/js/Pages/StockAudits/Edit.vue:57  /  variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.show', audit.id)"  /  No ancestor condition
- [ ] **e0036-c024** [table row, lines 395-395](../development-pack/modules/24_stock_audits.md#L395) -- Cancel — resources/js/Pages/StockAudits/Edit.vue:150  /  variant="secondary"; as="Link"; :href="route('stock-audits.show', audit.id)"  /  No ancestor condition
- [ ] **e0036-c025** [table row, lines 396-396](../development-pack/modules/24_stock_audits.md#L396) -- form.processing ? Saving... : Update Audit — resources/js/Pages/StockAudits/Edit.vue:151  /  type="submit"; variant="default"; :loading="form.processing"; :disabled="form.processing \ / \ / ...
- [ ] **e0036-c026** [prose, lines 398-398](../development-pack/modules/24_stock_audits.md#L398) -- **Script endpoint names:** stock-audits.update. Match these to verb/path/permission in the route annex.

### e0037: StockAudits/Index

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0037). Complete every clause below before closing this section in the ledger.

- [ ] **e0037-c001** [prose, lines 408-408](../development-pack/modules/24_stock_audits.md#L408) -- GET /stock-audits; view_stock_audits. Search, status, type filters; columns number/name/type/status/location/item count/creator/date/view. New audit needs create_stock_audits; cycle-count li...
- [ ] **e0037-c002** [prose, lines 410-410](../development-pack/modules/24_stock_audits.md#L410) -- Source: resources/js/Pages/StockAudits/Index.vue:1.
- [ ] **e0037-c003** [prose, lines 412-412](../development-pack/modules/24_stock_audits.md#L412) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0037-c004** [source-code reference, lines 414-421](../development-pack/modules/24_stock_audits.md#L414) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0037-c005** [prose, lines 423-423](../development-pack/modules/24_stock_audits.md#L423) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0037-c006** [table row, lines 425-425](../development-pack/modules/24_stock_audits.md#L425) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0037-c007** [table row, lines 427-427](../development-pack/modules/24_stock_audits.md#L427) -- search — resources/js/Pages/StockAudits/Index.vue:97  /  Search  /  text; props.filters?.search \ / \ /  ''  /  ; v-model="search"; type="text"; :placeholder="t('stockAudits.index.searchPlac...
- [ ] **e0037-c008** [table row, lines 428-428](../development-pack/modules/24_stock_audits.md#L428) -- selectedStatus — resources/js/Pages/StockAudits/Index.vue:106  /  Status  /  select; props.filters?.status \ / \ /  ''  /  ; v-model="selectedStatus"  /  Always within this view/dialog; see ...
- [ ] **e0037-c009** [table row, lines 429-429](../development-pack/modules/24_stock_audits.md#L429) -- selectedType — resources/js/Pages/StockAudits/Index.vue:113  /  Audit Type  /  select; props.filters?.audit_type \ / \ /  ''  /  ; v-model="selectedType"  /  Always within this view/dialog; ...
- [ ] **e0037-c010** [prose, lines 431-431](../development-pack/modules/24_stock_audits.md#L431) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0037-c011** [statement, lines 433-433](../development-pack/modules/24_stock_audits.md#L433) -- - selectedStatus (resources/js/Pages/StockAudits/Index.vue:106): &amp;lt;option value=""&amp;gt;{{ All Statuses }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="(label, value) in statuses" :key="value" :value="v...
- [ ] **e0037-c012** [statement, lines 434-434](../development-pack/modules/24_stock_audits.md#L434) -- - selectedType (resources/js/Pages/StockAudits/Index.vue:113): &amp;lt;option value=""&amp;gt;{{ All Types }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="(label, value) in auditTypes" :key="value" :value="valu...
- [ ] **e0037-c013** [prose, lines 436-436](../development-pack/modules/24_stock_audits.md#L436) -- **Read fields, columns and section headings:**
- [ ] **e0037-c014** [statement, lines 438-438](../development-pack/modules/24_stock_audits.md#L438) -- - th: Audit # — resources/js/Pages/StockAudits/Index.vue:134
- [ ] **e0037-c015** [statement, lines 439-439](../development-pack/modules/24_stock_audits.md#L439) -- - th: Name — resources/js/Pages/StockAudits/Index.vue:135
- [ ] **e0037-c016** [statement, lines 440-440](../development-pack/modules/24_stock_audits.md#L440) -- - th: Type — resources/js/Pages/StockAudits/Index.vue:136
- [ ] **e0037-c017** [statement, lines 441-441](../development-pack/modules/24_stock_audits.md#L441) -- - th: Status — resources/js/Pages/StockAudits/Index.vue:137
- [ ] **e0037-c018** [statement, lines 442-442](../development-pack/modules/24_stock_audits.md#L442) -- - th: Location — resources/js/Pages/StockAudits/Index.vue:138
- [ ] **e0037-c019** [statement, lines 443-443](../development-pack/modules/24_stock_audits.md#L443) -- - th: Items — resources/js/Pages/StockAudits/Index.vue:139
- [ ] **e0037-c020** [statement, lines 444-444](../development-pack/modules/24_stock_audits.md#L444) -- - th: Created By — resources/js/Pages/StockAudits/Index.vue:140
- [ ] **e0037-c021** [statement, lines 445-445](../development-pack/modules/24_stock_audits.md#L445) -- - th: Date — resources/js/Pages/StockAudits/Index.vue:141
- [ ] **e0037-c022** [statement, lines 446-446](../development-pack/modules/24_stock_audits.md#L446) -- - th: Actions — resources/js/Pages/StockAudits/Index.vue:142
- [ ] **e0037-c023** [prose, lines 448-448](../development-pack/modules/24_stock_audits.md#L448) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0037-c024** [table row, lines 450-450](../development-pack/modules/24_stock_audits.md#L450) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0037-c025** [table row, lines 452-452](../development-pack/modules/24_stock_audits.md#L452) -- Cycle count schedules — resources/js/Pages/StockAudits/Index.vue:78  /  variant="secondary"; size="sm"; as="Link"; :href="route('cycle-counts.index')"  /  No ancestor condition
- [ ] **e0037-c026** [table row, lines 453-453](../development-pack/modules/24_stock_audits.md#L453) -- New Audit — resources/js/Pages/StockAudits/Index.vue:82  /  v-if="canVisit('stock-audits.create')"; variant="default"; size="sm"; as="Link"; :href="route('stock-audits.create')"  /  No ances...
- [ ] **e0037-c027** [table row, lines 454-454](../development-pack/modules/24_stock_audits.md#L454) -- Clear Filters — resources/js/Pages/StockAudits/Index.vue:124  /  type="button"; variant="secondary"; size="sm"; @click="clearFilters"  /  No ancestor condition
- [ ] **e0037-c028** [table row, lines 455-455](../development-pack/modules/24_stock_audits.md#L455) -- Create First Audit — resources/js/Pages/StockAudits/Index.vue:151  /  v-if="canVisit('stock-audits.create')"; variant="default"; size="sm"; as="Link"; :href="route('stock-audits.create')"  /...
- [ ] **e0037-c029** [table row, lines 456-456](../development-pack/modules/24_stock_audits.md#L456) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/StockAudits/Index.vue:190  /  :href="route('stock-audits.show', audit.id)"; :title="t('common.view')"  /  v-for="audit ...
- [ ] **e0037-c030** [table row, lines 457-457](../development-pack/modules/24_stock_audits.md#L457) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/StockAudits/Index.vue:206  /  v-if="link.url"; :href="link.url"; v-html="link.label"  /  v-if="audits.data &amp;&amp; audits.da...
- [ ] **e0037-c031** [prose, lines 459-459](../development-pack/modules/24_stock_audits.md#L459) -- **Script endpoint names:** stock-audits.index. Match these to verb/path/permission in the route annex.

### e0038: StockAudits/Show

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0038). Complete every clause below before closing this section in the ledger.

- [ ] **e0038-c001** [prose, lines 469-469](../development-pack/modules/24_stock_audits.md#L469) -- GET /stock-audits/{audit}; view_stock_audits. Metadata/summary/progress/discrepancy totals; count table product/location/system/count/difference/status/counter/actions. Search/item_status/pa...
- [ ] **e0038-c002** [prose, lines 471-471](../development-pack/modules/24_stock_audits.md#L471) -- Source: resources/js/Pages/StockAudits/Show.vue:1.
- [ ] **e0038-c003** [prose, lines 473-473](../development-pack/modules/24_stock_audits.md#L473) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0038-c004** [source-code reference, lines 475-526](../development-pack/modules/24_stock_audits.md#L475) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0038-c005** [prose, lines 528-528](../development-pack/modules/24_stock_audits.md#L528) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0038-c006** [table row, lines 530-530](../development-pack/modules/24_stock_audits.md#L530) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0038-c007** [table row, lines 532-532](../development-pack/modules/24_stock_audits.md#L532) -- scanLocationId — resources/js/Pages/StockAudits/Show.vue:637  /  No explicit label / see context  /  select; ''  /  v-if="scanLocations.length &amp;gt; 1"; v-model="scanLocationId"; :disabled="p...
- [ ] **e0038-c008** [table row, lines 533-533](../development-pack/modules/24_stock_audits.md#L533) -- lineSearch — resources/js/Pages/StockAudits/Show.vue:689  /  No explicit label / see context  /  search; props.itemFilters?.search \ / \ /  ''  /  v-model="lineSearch"; type="search"; :place...
- [ ] **e0038-c009** [table row, lines 534-534](../development-pack/modules/24_stock_audits.md#L534) -- lineStatus — resources/js/Pages/StockAudits/Show.vue:690  /  No explicit label / see context  /  select; props.itemFilters?.item_status \ / \ /  'all'  /  v-model="lineStatus"; :disabled="sa...
- [ ] **e0038-c010** [table row, lines 535-535](../development-pack/modules/24_stock_audits.md#L535) -- linePageSize — resources/js/Pages/StockAudits/Show.vue:693  /  Lines per page  /  select; props.itemFilters?.per_page \ / \ /  25  /  ; v-model="linePageSize"; :disabled="savingCount \ / \ /...
- [ ] **e0038-c011** [table row, lines 536-536](../development-pack/modules/24_stock_audits.md#L536) -- countValue — resources/js/Pages/StockAudits/Show.vue:772  /  No explicit label / see context  /  number; 0  /  ; v-model.number="countValue"; type="number"; min="0"; max="2147483647"; step="...
- [ ] **e0038-c012** [table row, lines 537-537](../development-pack/modules/24_stock_audits.md#L537) -- countNotes — resources/js/Pages/StockAudits/Show.vue:790  /  No explicit label / see context  /  text; ''  /  v-model="countNotes"; type="text"; maxlength="500"; :disabled="savingCount \ / \...
- [ ] **e0038-c013** [table row, lines 538-538](../development-pack/modules/24_stock_audits.md#L538) -- reviewNotes — resources/js/Pages/StockAudits/Show.vue:921  /  Review notes  /  textarea; ''  /  v-model="reviewNotes"; rows="3"; maxlength="500"; :minlength="reviewDecision === 'recount_requ...
- [ ] **e0038-c014** [prose, lines 540-540](../development-pack/modules/24_stock_audits.md#L540) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0038-c015** [statement, lines 542-542](../development-pack/modules/24_stock_audits.md#L542) -- - scanLocationId (resources/js/Pages/StockAudits/Show.vue:637): 1" v-model="scanLocationId" :disabled="pendingScans &amp;gt; 0 \|\| savingCount \|\| syncingDrafts" :aria-label="Location" class="...
- [ ] **e0038-c016** [statement, lines 543-543](../development-pack/modules/24_stock_audits.md#L543) -- - lineStatus (resources/js/Pages/StockAudits/Show.vue:690): 0" @change="filterLines"&amp;gt; &amp;lt;option v-for="status in &#91;'all', 'pending', 'counted', 'variance', 'review'&#93;" :key="status" :value...
- [ ] **e0038-c017** [statement, lines 544-544](../development-pack/modules/24_stock_audits.md#L544) -- - linePageSize (resources/js/Pages/StockAudits/Show.vue:693): 0" @change="filterLines"&amp;gt;&amp;lt;option :value="25"&amp;gt;25&amp;lt;/option&amp;gt;&amp;lt;option :value="50"&amp;gt;50&amp;lt;/option&amp;gt;&amp;lt;option :va...
- [ ] **e0038-c018** [prose, lines 546-546](../development-pack/modules/24_stock_audits.md#L546) -- **Read fields, columns and section headings:**
- [ ] **e0038-c019** [statement, lines 548-548](../development-pack/modules/24_stock_audits.md#L548) -- - h2: Count drafts ({count}) — resources/js/Pages/StockAudits/Show.vue:524 — v-if="draftCount &amp;gt; 0 \|\| !online \|\| draftMessage"
- [ ] **e0038-c020** [statement, lines 549-549](../development-pack/modules/24_stock_audits.md#L549) -- - h3: Audit Details — resources/js/Pages/StockAudits/Show.vue:581
- [ ] **e0038-c021** [statement, lines 550-550](../development-pack/modules/24_stock_audits.md#L550) -- - h3: Audit Items ({counted} of {total} counted) — resources/js/Pages/StockAudits/Show.vue:627
- [ ] **e0038-c022** [statement, lines 551-551](../development-pack/modules/24_stock_audits.md#L551) -- - th: Product — resources/js/Pages/StockAudits/Show.vue:700
- [ ] **e0038-c023** [statement, lines 552-552](../development-pack/modules/24_stock_audits.md#L552) -- - th: Location — resources/js/Pages/StockAudits/Show.vue:701
- [ ] **e0038-c024** [statement, lines 553-553](../development-pack/modules/24_stock_audits.md#L553) -- - th: System Qty — resources/js/Pages/StockAudits/Show.vue:702
- [ ] **e0038-c025** [statement, lines 554-554](../development-pack/modules/24_stock_audits.md#L554) -- - th: Counted Qty — resources/js/Pages/StockAudits/Show.vue:703
- [ ] **e0038-c026** [statement, lines 555-555](../development-pack/modules/24_stock_audits.md#L555) -- - th: Discrepancy — resources/js/Pages/StockAudits/Show.vue:704
- [ ] **e0038-c027** [statement, lines 556-556](../development-pack/modules/24_stock_audits.md#L556) -- - th: Status — resources/js/Pages/StockAudits/Show.vue:705
- [ ] **e0038-c028** [statement, lines 557-557](../development-pack/modules/24_stock_audits.md#L557) -- - th: Counted By — resources/js/Pages/StockAudits/Show.vue:706
- [ ] **e0038-c029** [statement, lines 558-558](../development-pack/modules/24_stock_audits.md#L558) -- - th: Actions — resources/js/Pages/StockAudits/Show.vue:707
- [ ] **e0038-c030** [statement, lines 559-559](../development-pack/modules/24_stock_audits.md#L559) -- - h3: Actions — resources/js/Pages/StockAudits/Show.vue:855 — v-if="canStart \|\| canComplete"
- [ ] **e0038-c031** [statement, lines 560-560](../development-pack/modules/24_stock_audits.md#L560) -- - h3: Danger Zone — resources/js/Pages/StockAudits/Show.vue:889 — v-if="canDelete"
- [ ] **e0038-c032** [statement, lines 561-561](../development-pack/modules/24_stock_audits.md#L561) -- - h2: t(reviewDecision === 'approved' ? 'auditReview.approve' : 'auditReview.requestRecount') — resources/js/Pages/StockAudits/Show.vue:918
- [ ] **e0038-c033** [prose, lines 563-563](../development-pack/modules/24_stock_audits.md#L563) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0038-c034** [table row, lines 565-565](../development-pack/modules/24_stock_audits.md#L565) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0038-c035** [table row, lines 567-567](../development-pack/modules/24_stock_audits.md#L567) -- Workspace — resources/js/Pages/StockAudits/Show.vue:491  /  :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0038-c036** [table row, lines 568-568](../development-pack/modules/24_stock_audits.md#L568) -- Stock Audits — resources/js/Pages/StockAudits/Show.vue:493  /  :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0038-c037** [table row, lines 569-569](../development-pack/modules/24_stock_audits.md#L569) -- Edit — resources/js/Pages/StockAudits/Show.vue:503  /  v-if="(canEdit) &amp;&amp; canVisit('stock-audits.edit')"; variant="default"; size="sm"; as="Link"; :href="route('stock-audits.edit', audit.id)...
- [ ] **e0038-c038** [table row, lines 570-570](../development-pack/modules/24_stock_audits.md#L570) -- Back to List — resources/js/Pages/StockAudits/Show.vue:513  /  variant="secondary"; size="sm"; as="Link"; :href="route('stock-audits.index')"  /  No ancestor condition
- [ ] **e0038-c039** [table row, lines 571-571](../development-pack/modules/24_stock_audits.md#L571) -- Send saved counts — resources/js/Pages/StockAudits/Show.vue:530  /  v-if="canCount"; size="sm"; :loading="syncingDrafts"; :disabled="!online \ / \ /  savingCount \ / \ /  syncingDrafts \ / \...
- [ ] **e0038-c040** [table row, lines 572-572](../development-pack/modules/24_stock_audits.md#L572) -- Discard all drafts — resources/js/Pages/StockAudits/Show.vue:533  /  variant="secondary"; size="sm"; :disabled="savingCount \ / \ /  syncingDrafts \ / \ /  pendingScans &amp;gt; 0"; @click="disc...
- [ ] **e0038-c041** [table row, lines 573-573](../development-pack/modules/24_stock_audits.md#L573) -- Scan — resources/js/Pages/StockAudits/Show.vue:641  /  size="lg"; :disabled="pendingScans &amp;gt; 0 \ / \ /  savingCount \ / \ /  syncingDrafts"; @click="showScanner = true"  /  v-if="canCount"
- [ ] **e0038-c042** [table row, lines 574-574](../development-pack/modules/24_stock_audits.md#L574) -- Add 1 per scan — resources/js/Pages/StockAudits/Show.vue:646  /  type="button"; role="radio"; :aria-checked="scanMode === 'increment'"; :disabled="pendingScans &amp;gt; 0 \ / \ /  savingCount \ ...
- [ ] **e0038-c043** [table row, lines 575-575](../development-pack/modules/24_stock_audits.md#L575) -- Enter count — resources/js/Pages/StockAudits/Show.vue:657  /  type="button"; role="radio"; :aria-checked="scanMode === 'enter'"; :disabled="pendingScans &amp;gt; 0 \ / \ /  savingCount \ / \ /  ...
- [ ] **e0038-c044** [table row, lines 576-576](../development-pack/modules/24_stock_audits.md#L576) -- View count history — resources/js/Pages/StockAudits/Show.vue:717  /  v-if="item.counted_quantity !== null"; :href="route('stock-audits.items.counts', { stockAudit: audit.id, item: item.id })...
- [ ] **e0038-c045** [table row, lines 577-577](../development-pack/modules/24_stock_audits.md#L577) -- Approve count — resources/js/Pages/StockAudits/Show.vue:740  /  type="button"; :disabled="!mayApprove(item)"; :title="!mayApprove(item) -- t('auditReview.errors.self') : ''"; @click="openRevi...
- [ ] **e0038-c046** [table row, lines 578-578](../development-pack/modules/24_stock_audits.md#L578) -- Request recount — resources/js/Pages/StockAudits/Show.vue:741  /  type="button"; @click="openReview(item, 'recount_requested')"  /  v-for="item in audit.items" → v-if="editingItemId !== item...
- [ ] **e0038-c047** [table row, lines 579-579](../development-pack/modules/24_stock_audits.md#L579) -- drafts&#91;item.id&#93; ? Review draft : item.counted_quantity !== null ? Recount : Count — resources/js/Pages/StockAudits/Show.vue:749  /  @click="startCounting(item)"; :disabled="savingCount \ / \...
- [ ] **e0038-c048** [table row, lines 580-580](../development-pack/modules/24_stock_audits.md#L580) -- savingCount ? '...' : Save — resources/js/Pages/StockAudits/Show.vue:803  /  size="sm"; :loading="savingCount"; :disabled="savingCount \ / \ /  syncingDrafts"; @click="saveCount(item)"  /  v...
- [ ] **e0038-c049** [table row, lines 581-581](../development-pack/modules/24_stock_audits.md#L581) -- Close and keep draft — resources/js/Pages/StockAudits/Show.vue:811  /  variant="secondary"; size="sm"; :disabled="savingCount \ / \ /  syncingDrafts"; @click="cancelCounting"  /  v-for="item...
- [ ] **e0038-c050** [table row, lines 582-582](../development-pack/modules/24_stock_audits.md#L582) -- Discard draft — resources/js/Pages/StockAudits/Show.vue:819  /  v-if="drafts&#91;item.id&#93;"; variant="secondary"; size="sm"; :disabled="savingCount \ / \ /  syncingDrafts"; @click="discardDraft(i...
- [ ] **e0038-c051** [table row, lines 583-583](../development-pack/modules/24_stock_audits.md#L583) -- I've reviewed the saved count — resources/js/Pages/StockAudits/Show.vue:829  /  variant="secondary"; size="sm"; :disabled="savingCount \ / \ /  syncingDrafts"; @click="reviewLatestCount(item...
- [ ] **e0038-c052** [table row, lines 584-584](../development-pack/modules/24_stock_audits.md#L584) -- Previous — resources/js/Pages/StockAudits/Show.vue:845  /  v-if="itemPagination.prev_page_url"; :href="itemPagination.prev_page_url"; preserve-state; preserve-scroll; @click="cancelCounting"...
- [ ] **e0038-c053** [table row, lines 585-585](../development-pack/modules/24_stock_audits.md#L585) -- Next — resources/js/Pages/StockAudits/Show.vue:847  /  v-if="itemPagination.next_page_url"; :href="itemPagination.next_page_url"; preserve-state; preserve-scroll; @click="cancelCounting"  / ...
- [ ] **e0038-c054** [table row, lines 586-586](../development-pack/modules/24_stock_audits.md#L586) -- processing ? Processing... : Start Audit — resources/js/Pages/StockAudits/Show.vue:858  /  v-if="canStart"; :loading="processing"; :disabled="processing"; @click="startAudit"  /  v-if="canSt...
- [ ] **e0038-c055** [table row, lines 587-587](../development-pack/modules/24_stock_audits.md#L587) -- processing ? Processing... : Complete Audit — resources/js/Pages/StockAudits/Show.vue:867  /  v-if="canComplete"; :loading="processing"; :disabled="processing \ / \ /  savingCount \ / \ /  s...
- [ ] **e0038-c056** [table row, lines 588-588](../development-pack/modules/24_stock_audits.md#L588) -- processing ? Processing... : Delete Audit — resources/js/Pages/StockAudits/Show.vue:891  /  variant="danger"; :loading="processing"; :disabled="processing"; @click="deleteAudit"  /  v-if="ca...
- [ ] **e0038-c057** [table row, lines 589-589](../development-pack/modules/24_stock_audits.md#L589) -- Cancel — resources/js/Pages/StockAudits/Show.vue:924  /  variant="secondary"; :disabled="reviewing"; @click="reviewItem = null"  /  No ancestor condition
- [ ] **e0038-c058** [table row, lines 590-590](../development-pack/modules/24_stock_audits.md#L590) -- Save — resources/js/Pages/StockAudits/Show.vue:924  /  type="submit"; :loading="reviewing"; :disabled="reviewing"  /  No ancestor condition
- [ ] **e0038-c059** [prose, lines 592-592](../development-pack/modules/24_stock_audits.md#L592) -- **Script endpoint names:** stock-audits.show, stock-audits.items.review, stock-audits.start, stock-audits.complete, stock-audits.destroy, stock-audits.items.count, stock-audits.items.show, s...

### e0057: Components/StockAuditReviewEvidence

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0057). Complete every clause below before closing this section in the ledger.

- [ ] **e0057-c001** [prose, lines 602-602](../development-pack/modules/24_stock_audits.md#L602) -- Read-only current count review state plus approval/recount request evidence and actor/notes; no controls. Embedded in CountHistory; review action form is in audit Show.
- [ ] **e0057-c002** [prose, lines 604-604](../development-pack/modules/24_stock_audits.md#L604) -- Source: resources/js/Components/StockAuditReviewEvidence.vue:1.
- [ ] **e0057-c003** [prose, lines 606-606](../development-pack/modules/24_stock_audits.md#L606) -- **Input fields:** none in this page/component template.

### e0067: StockAudit/ListStockAuditItemsRequest.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0067). Complete every clause below before closing this section in the ledger.

- [ ] **e0067-c001** [prose, lines 617-617](../development-pack/modules/24_stock_audits.md#L617) -- Source app/Http/Requests/StockAudit/ListStockAuditItemsRequest.php:1
- [ ] **e0067-c002** [source-code reference, lines 619-637](../development-pack/modules/24_stock_audits.md#L619) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0068: StockAudit/ReviewStockAuditCountRequest.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0068). Complete every clause below before closing this section in the ledger.

- [ ] **e0068-c001** [prose, lines 647-647](../development-pack/modules/24_stock_audits.md#L647) -- Source app/Http/Requests/StockAudit/ReviewStockAuditCountRequest.php:1
- [ ] **e0068-c002** [source-code reference, lines 649-671](../development-pack/modules/24_stock_audits.md#L649) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0069: StockAudit/StoreStockAuditRequest.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0069). Complete every clause below before closing this section in the ledger.

- [ ] **e0069-c001** [prose, lines 681-681](../development-pack/modules/24_stock_audits.md#L681) -- Source app/Http/Requests/StockAudit/StoreStockAuditRequest.php:1
- [ ] **e0069-c002** [source-code reference, lines 683-718](../development-pack/modules/24_stock_audits.md#L683) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0070: StockAudit/UpdateStockAuditRequest.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0070). Complete every clause below before closing this section in the ledger.

- [ ] **e0070-c001** [prose, lines 728-728](../development-pack/modules/24_stock_audits.md#L728) -- Source app/Http/Requests/StockAudit/UpdateStockAuditRequest.php:1
- [ ] **e0070-c002** [source-code reference, lines 730-762](../development-pack/modules/24_stock_audits.md#L730) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0081: CycleCountScheduleController.php — 72-199

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0081). Complete every clause below before closing this section in the ledger.

- [ ] **e0081-c001** [prose, lines 772-772](../development-pack/modules/24_stock_audits.md#L772) -- Source app/Http/Controllers/Inventory/CycleCountScheduleController.php:72
- [ ] **e0081-c002** [source-code reference, lines 774-903](../development-pack/modules/24_stock_audits.md#L774) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0089: StockAuditController.php — 385-440

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0089). Complete every clause below before closing this section in the ledger.

- [ ] **e0089-c001** [prose, lines 913-913](../development-pack/modules/24_stock_audits.md#L913) -- Source app/Http/Controllers/Inventory/StockAuditController.php:385
- [ ] **e0089-c002** [source-code reference, lines 915-961](../development-pack/modules/24_stock_audits.md#L915) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0109: StockAudit

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0109). Complete every clause below before closing this section in the ledger.

- [ ] **e0109-c001** [prose, lines 970-970](../development-pack/modules/24_stock_audits.md#L970) -- app/Models/Inventory/StockAudit.php:1
- [ ] **e0109-c002** [source-code reference, lines 972-1013](../development-pack/modules/24_stock_audits.md#L972) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0110: StockAuditItem

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0110). Complete every clause below before closing this section in the ledger.

- [ ] **e0110-c001** [prose, lines 1022-1022](../development-pack/modules/24_stock_audits.md#L1022) -- app/Models/Inventory/StockAuditItem.php:1
- [ ] **e0110-c002** [source-code reference, lines 1024-1059](../development-pack/modules/24_stock_audits.md#L1024) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0111: StockAuditCount

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0111). Complete every clause below before closing this section in the ledger.

- [ ] **e0111-c001** [prose, lines 1068-1068](../development-pack/modules/24_stock_audits.md#L1068) -- app/Models/Inventory/StockAuditCount.php:1
- [ ] **e0111-c002** [source-code reference, lines 1070-1076](../development-pack/modules/24_stock_audits.md#L1070) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0112: StockAuditReview

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0112). Complete every clause below before closing this section in the ledger.

- [ ] **e0112-c001** [prose, lines 1085-1085](../development-pack/modules/24_stock_audits.md#L1085) -- app/Models/Inventory/StockAuditReview.php:1
- [ ] **e0112-c002** [source-code reference, lines 1087-1092](../development-pack/modules/24_stock_audits.md#L1087) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0113: CycleCountSchedule

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0113). Complete every clause below before closing this section in the ledger.

- [ ] **e0113-c001** [prose, lines 1101-1101](../development-pack/modules/24_stock_audits.md#L1101) -- app/Models/Inventory/CycleCountSchedule.php:1
- [ ] **e0113-c002** [source-code reference, lines 1103-1139](../development-pack/modules/24_stock_audits.md#L1103) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0134: 2026_03_20_000001_create_stock_audits_table.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0134). Complete every clause below before closing this section in the ledger.

- [ ] **e0134-c001** [prose, lines 1148-1148](../development-pack/modules/24_stock_audits.md#L1148) -- database/migrations/2026_03_20_000001_create_stock_audits_table.php:1
- [ ] **e0134-c002** [source-code reference, lines 1150-1186](../development-pack/modules/24_stock_audits.md#L1150) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0148: 2026_09_29_000003_create_cycle_count_schedules_table.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0148). Complete every clause below before closing this section in the ledger.

- [ ] **e0148-c001** [prose, lines 1195-1195](../development-pack/modules/24_stock_audits.md#L1195) -- database/migrations/2026_09_29_000003_create_cycle_count_schedules_table.php:1
- [ ] **e0148-c002** [source-code reference, lines 1197-1222](../development-pack/modules/24_stock_audits.md#L1197) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0152: 2026_10_21_000002_add_stock_audit_warehouse_scope.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0152). Complete every clause below before closing this section in the ledger.

- [ ] **e0152-c001** [prose, lines 1231-1231](../development-pack/modules/24_stock_audits.md#L1231) -- database/migrations/2026_10_21_000002_add_stock_audit_warehouse_scope.php:1
- [ ] **e0152-c002** [source-code reference, lines 1233-1237](../development-pack/modules/24_stock_audits.md#L1233) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0157: 2026_10_26_000002_create_stock_audit_counts.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0157). Complete every clause below before closing this section in the ledger.

- [ ] **e0157-c001** [prose, lines 1246-1246](../development-pack/modules/24_stock_audits.md#L1246) -- database/migrations/2026_10_26_000002_create_stock_audit_counts.php:1
- [ ] **e0157-c002** [source-code reference, lines 1248-1268](../development-pack/modules/24_stock_audits.md#L1248) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0158: 2026_10_27_000001_add_stock_audit_variance_reviews.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0158). Complete every clause below before closing this section in the ledger.

- [ ] **e0158-c001** [prose, lines 1277-1277](../development-pack/modules/24_stock_audits.md#L1277) -- database/migrations/2026_10_27_000001_add_stock_audit_variance_reviews.php:1
- [ ] **e0158-c002** [source-code reference, lines 1279-1307](../development-pack/modules/24_stock_audits.md#L1279) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0159: 2026_10_27_000002_index_stock_audit_item_pages.php

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0159). Complete every clause below before closing this section in the ledger.

- [ ] **e0159-c001** [prose, lines 1316-1316](../development-pack/modules/24_stock_audits.md#L1316) -- database/migrations/2026_10_27_000002_index_stock_audit_item_pages.php:1
- [ ] **e0159-c002** [source-code reference, lines 1318-1321](../development-pack/modules/24_stock_audits.md#L1318) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0493: `app/Http/Requests/Api/StockAudit/RecordStockAuditCountRequest.php`

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0493). Complete every clause below before closing this section in the ledger.

- [ ] **e0493-c001** [prose, lines 1331-1331](../development-pack/modules/24_stock_audits.md#L1331) -- Source evidence. SHA-256: 9a79212c79aea77ba708ae28d09d611929e24fab92997e326882fb03d97c2fb6.
- [ ] **e0493-c002** [source-code reference, lines 1333-1360](../development-pack/modules/24_stock_audits.md#L1333) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0494: `app/Http/Requests/Api/StockAudit/StoreStockAuditRequest.php`

Source: [exact contract](../development-pack/modules/24_stock_audits.md#e0494). Complete every clause below before closing this section in the ledger.

- [ ] **e0494-c001** [prose, lines 1370-1370](../development-pack/modules/24_stock_audits.md#L1370) -- Source evidence. SHA-256: 72d316536762b7731cff5abb3dfb69b8f4655213b3752f6ddeb7afebee2cbfaf.
- [ ] **e0494-c002** [source-code reference, lines 1372-1408](../development-pack/modules/24_stock_audits.md#L1372) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/25_work_orders.md

### e0136: 2026_04_04_030000_add_kitting_and_assembly_support.php

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0136). Complete every clause below before closing this section in the ledger.

- [ ] **e0136-c001** [prose, lines 92-92](../development-pack/modules/25_work_orders.md#L92) -- database/migrations/2026_04_04_030000_add_kitting_and_assembly_support.php:1
- [ ] **e0136-c002** [source-code reference, lines 94-101](../development-pack/modules/25_work_orders.md#L94) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0171: Assembly work orders

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0171). Complete every clause below before closing this section in the ledger.

- [ ] **e0171-c001** [statement, lines 111-111](../development-pack/modules/25_work_orders.md#L111) -- - Source creates **assembly** output only, not virtual kit. Product selection optionally preselected; output variant null until chosen; quantity1; warehouse blank; notes blank. Quantity inte...
- [ ] **e0171-c002** [statement, lines 112-112](../development-pack/modules/25_work_orders.md#L112) -- - Draft/pending → start → in_progress → complete → completed. Cancel allowed draft/pending/in_progress. Delete allowed draft/cancelled only. Start checks availability **but reserves/consumes...
- [ ] **e0171-c003** [statement, lines 113-113](../development-pack/modules/25_work_orders.md#L113) -- - Completion quantity_produced defaults planned and accepts1..planned (nullable API means default planned). Per-item required consumption is ceil(required * produced/planned) minus already c...
- [ ] **e0171-c004** [statement, lines 114-114](../development-pack/modules/25_work_orders.md#L114) -- - Tracked component allocation: per work_order_item_id choose serial_ids (&lt;=10000) or batches (&lt;=500, each product_batch_id + integer quantity&gt;=1). UI shows available serials/lot quantities;...
- [ ] **e0171-c005** [statement, lines 115-115](../development-pack/modules/25_work_orders.md#L115) -- - Serial output: newline textarea → trimmed nonempty serial_numbers&#91;&#93;, &lt;=10000 each max255. Batch output: batch_number optional max255, expiry_date optional date. Service additionally accept...
- [ ] **e0171-c006** [statement, lines 116-116](../development-pack/modules/25_work_orders.md#L116) -- - Completion consumes component stock, records tracked allocations, receives product/variant/serial/batch output, movement records, updates quantity/status/time in **one transaction**. Globa...
- [ ] **e0171-c007** [prose, lines 118-118](../development-pack/modules/25_work_orders.md#L118) -- Evidence: WO request, shared create/complete rules, create, start, complete, cancel.

### e0197: resources/js/Pages/WorkOrders/Create.vue

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0197). Complete every clause below before closing this section in the ledger.

- [ ] **e0197-c001** [prose, lines 128-128](../development-pack/modules/25_work_orders.md#L128) -- Source: resources/js/Pages/WorkOrders/Create.vue:1.
- [ ] **e0197-c002** [prose, lines 131-131](../development-pack/modules/25_work_orders.md#L131) -- **Named routes referenced:** work-orders.index, work-orders.store.
- [ ] **e0197-c003** [prose, lines 134-134](../development-pack/modules/25_work_orders.md#L134) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0197-c004** [prose, lines 137-137](../development-pack/modules/25_work_orders.md#L137) -- **Sections / displayed fields / table columns:**
- [ ] **e0197-c005** [statement, lines 139-139](../development-pack/modules/25_work_orders.md#L139) -- - h3: Required Components (L222)
- [ ] **e0197-c006** [statement, lines 140-140](../development-pack/modules/25_work_orders.md#L140) -- - th: Component (L233)
- [ ] **e0197-c007** [statement, lines 141-141](../development-pack/modules/25_work_orders.md#L141) -- - th: SKU (L234)
- [ ] **e0197-c008** [statement, lines 142-142](../development-pack/modules/25_work_orders.md#L142) -- - th: Variant (L235)
- [ ] **e0197-c009** [statement, lines 143-143](../development-pack/modules/25_work_orders.md#L143) -- - th: Required (L236)
- [ ] **e0197-c010** [statement, lines 144-144](../development-pack/modules/25_work_orders.md#L144) -- - th: Available (L237)
- [ ] **e0197-c011** [statement, lines 145-145](../development-pack/modules/25_work_orders.md#L145) -- - th: Status (L238)
- [ ] **e0197-c012** [prose, lines 148-148](../development-pack/modules/25_work_orders.md#L148) -- **UI state/filter defaults:**
- [ ] **e0197-c013** [source-code reference, lines 150-152](../development-pack/modules/25_work_orders.md#L150) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0197-c014** [table row, lines 155-155](../development-pack/modules/25_work_orders.md#L155) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0197-c015** [table row, lines 158-158](../development-pack/modules/25_work_orders.md#L158) -- form.product_id  /  Assembly Product *  /  select  /  HTML required  /  : Select an assembly product...; product.id: product.name ( product.sku ) &#91;repeat product in assemblyProducts&#93;  /  res...
- [ ] **e0197-c016** [table row, lines 160-160](../development-pack/modules/25_work_orders.md#L160) -- form.product_variant_id  /  Variant to produce *  /  select  /  HTML required  /  null: Choose a variant...; variant.id: variant.title ( variant.sku ) &#91;repeat variant in selectedProduct.vari...
- [ ] **e0197-c017** [table row, lines 162-162](../development-pack/modules/25_work_orders.md#L162) -- form.quantity  /  Quantity to Produce *  /  input / number  /  HTML required; min=1  /  —  /  resources/js/Pages/WorkOrders/Create.vue:169
- [ ] **e0197-c018** [table row, lines 164-164](../development-pack/modules/25_work_orders.md#L164) -- form.warehouse_id  /  Warehouse  /  select  /  No extra control attribute; server rules below  /  : No specific warehouse; warehouse.id: warehouse.name &#91;repeat warehouse in warehouses&#93;  /  r...
- [ ] **e0197-c019** [table row, lines 166-166](../development-pack/modules/25_work_orders.md#L166) -- form.notes  /  Notes  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/WorkOrders/Create.vue:207
- [ ] **e0197-c020** [table row, lines 168-168](../development-pack/modules/25_work_orders.md#L168) -- componentVariants&#91;comp.product_id&#93;  /  Variant of {name}  /  select  /  HTML required; v-if=comp.needsVariant &amp;&amp; isFirstLineOf(comp)  /  undefined: Choose a variant...; variant.id: variant.t...
- [ ] **e0197-c021** [prose, lines 171-171](../development-pack/modules/25_work_orders.md#L171) -- **Exact form defaults / hydration / hidden payload** — resources/js/Pages/WorkOrders/Create.vue:21
- [ ] **e0197-c022** [source-code reference, lines 173-182](../development-pack/modules/25_work_orders.md#L173) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0197-c023** [prose, lines 186-186](../development-pack/modules/25_work_orders.md#L186) -- **Exact componentVariants defaults / hydration / hidden payload** — resources/js/Pages/WorkOrders/Create.vue:30
- [ ] **e0197-c024** [source-code reference, lines 188-191](../development-pack/modules/25_work_orders.md#L188) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0197-c025** [table row, lines 195-195](../development-pack/modules/25_work_orders.md#L195) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0197-c026** [table row, lines 198-198](../development-pack/modules/25_work_orders.md#L198) -- Workspace  /  :href=route('work-orders.index')  /  resources/js/Pages/WorkOrders/Create.vue:102
- [ ] **e0197-c027** [table row, lines 200-200](../development-pack/modules/25_work_orders.md#L200) -- Work Orders  /  :href=route('work-orders.index')  /  resources/js/Pages/WorkOrders/Create.vue:104
- [ ] **e0197-c028** [table row, lines 202-202](../development-pack/modules/25_work_orders.md#L202) -- Back to Work Orders  /  :href=route('work-orders.index')  /  resources/js/Pages/WorkOrders/Create.vue:112
- [ ] **e0197-c029** [table row, lines 204-204](../development-pack/modules/25_work_orders.md#L204) -- Cancel  /  :href=route('work-orders.index')  /  resources/js/Pages/WorkOrders/Create.vue:315
- [ ] **e0197-c030** [table row, lines 206-206](../development-pack/modules/25_work_orders.md#L206) -- Create Work Order  /  type=submit; :loading=form.processing; :disabled=form.processing  /  resources/js/Pages/WorkOrders/Create.vue:318
- [ ] **e0197-c031** [prose, lines 209-209](../development-pack/modules/25_work_orders.md#L209) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0197-c032** [source-code reference, lines 211-222](../development-pack/modules/25_work_orders.md#L211) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0198: resources/js/Pages/WorkOrders/Index.vue

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0198). Complete every clause below before closing this section in the ledger.

- [ ] **e0198-c001** [prose, lines 233-233](../development-pack/modules/25_work_orders.md#L233) -- Source: resources/js/Pages/WorkOrders/Index.vue:1.
- [ ] **e0198-c002** [prose, lines 236-236](../development-pack/modules/25_work_orders.md#L236) -- **Named routes referenced:** work-orders.create, work-orders.index, work-orders.show.
- [ ] **e0198-c003** [prose, lines 239-239](../development-pack/modules/25_work_orders.md#L239) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0198-c004** [prose, lines 242-242](../development-pack/modules/25_work_orders.md#L242) -- **Sections / displayed fields / table columns:**
- [ ] **e0198-c005** [statement, lines 244-244](../development-pack/modules/25_work_orders.md#L244) -- - th: WO Number (L134)
- [ ] **e0198-c006** [statement, lines 245-245](../development-pack/modules/25_work_orders.md#L245) -- - th: Assembly Product (L135)
- [ ] **e0198-c007** [statement, lines 246-246](../development-pack/modules/25_work_orders.md#L246) -- - th: Quantity (L136)
- [ ] **e0198-c008** [statement, lines 247-247](../development-pack/modules/25_work_orders.md#L247) -- - th: Produced (L137)
- [ ] **e0198-c009** [statement, lines 248-248](../development-pack/modules/25_work_orders.md#L248) -- - th: Status (L138)
- [ ] **e0198-c010** [statement, lines 249-249](../development-pack/modules/25_work_orders.md#L249) -- - th: Created By (L139)
- [ ] **e0198-c011** [statement, lines 250-250](../development-pack/modules/25_work_orders.md#L250) -- - th: Date (L140)
- [ ] **e0198-c012** [statement, lines 251-251](../development-pack/modules/25_work_orders.md#L251) -- - th: Actions (L141)
- [ ] **e0198-c013** [prose, lines 254-254](../development-pack/modules/25_work_orders.md#L254) -- **UI state/filter defaults:**
- [ ] **e0198-c014** [source-code reference, lines 256-259](../development-pack/modules/25_work_orders.md#L256) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0198-c015** [table row, lines 262-262](../development-pack/modules/25_work_orders.md#L262) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0198-c016** [table row, lines 265-265](../development-pack/modules/25_work_orders.md#L265) -- search  /  Search  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/WorkOrders/Index.vue:100
- [ ] **e0198-c017** [table row, lines 267-267](../development-pack/modules/25_work_orders.md#L267) -- selectedStatus  /  Status  /  select  /  @change=applyFilters  /  : All Statuses; draft: Draft; pending: Pending; in_progress: In Progress; completed: Completed; cancelled: Cancelled  /  res...
- [ ] **e0198-c018** [table row, lines 270-270](../development-pack/modules/25_work_orders.md#L270) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0198-c019** [table row, lines 273-273](../development-pack/modules/25_work_orders.md#L273) -- Create Work Order  /  :href=route('work-orders.create')  /  resources/js/Pages/WorkOrders/Index.vue:85
- [ ] **e0198-c020** [table row, lines 275-275](../development-pack/modules/25_work_orders.md#L275) -- Search  /  type=submit  /  resources/js/Pages/WorkOrders/Index.vue:101
- [ ] **e0198-c021** [table row, lines 277-277](../development-pack/modules/25_work_orders.md#L277) -- Filter  /  type=submit  /  resources/js/Pages/WorkOrders/Index.vue:120
- [ ] **e0198-c022** [table row, lines 279-279](../development-pack/modules/25_work_orders.md#L279) -- Clear  /  type=button; @click=clearFilters  /  resources/js/Pages/WorkOrders/Index.vue:124
- [ ] **e0198-c023** [table row, lines 281-281](../development-pack/modules/25_work_orders.md#L281) -- Create Work Order  /  :href=route('work-orders.create')  /  resources/js/Pages/WorkOrders/Index.vue:152
- [ ] **e0198-c024** [table row, lines 283-283](../development-pack/modules/25_work_orders.md#L283) -- wo.work_order_number  /  :href=route('work-orders.show', wo.id)  /  resources/js/Pages/WorkOrders/Index.vue:161
- [ ] **e0198-c025** [table row, lines 285-285](../development-pack/modules/25_work_orders.md#L285) -- Icon action  /  :href=route('work-orders.show', wo.id)  /  resources/js/Pages/WorkOrders/Index.vue:188
- [ ] **e0198-c026** [prose, lines 288-288](../development-pack/modules/25_work_orders.md#L288) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0198-c027** [source-code reference, lines 290-296](../development-pack/modules/25_work_orders.md#L290) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0199: resources/js/Pages/WorkOrders/Show.vue

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0199). Complete every clause below before closing this section in the ledger.

- [ ] **e0199-c001** [prose, lines 307-307](../development-pack/modules/25_work_orders.md#L307) -- Source: resources/js/Pages/WorkOrders/Show.vue:1.
- [ ] **e0199-c002** [prose, lines 310-310](../development-pack/modules/25_work_orders.md#L310) -- **Named routes referenced:** products.show, work-orders.cancel, work-orders.complete, work-orders.destroy, work-orders.index, work-orders.start.
- [ ] **e0199-c003** [prose, lines 313-313](../development-pack/modules/25_work_orders.md#L313) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0199-c004** [prose, lines 316-316](../development-pack/modules/25_work_orders.md#L316) -- **Sections / displayed fields / table columns:**
- [ ] **e0199-c005** [statement, lines 318-318](../development-pack/modules/25_work_orders.md#L318) -- - h3: Production Progress (L274)
- [ ] **e0199-c006** [statement, lines 319-319](../development-pack/modules/25_work_orders.md#L319) -- - h3: Work Order Details (L336)
- [ ] **e0199-c007** [statement, lines 320-320](../development-pack/modules/25_work_orders.md#L320) -- - dt: Assembly Product (L340)
- [ ] **e0199-c008** [statement, lines 321-321](../development-pack/modules/25_work_orders.md#L321) -- - dt: Status (L353)
- [ ] **e0199-c009** [statement, lines 322-322](../development-pack/modules/25_work_orders.md#L322) -- - dt: Variant to produce (L359)
- [ ] **e0199-c010** [statement, lines 323-323](../development-pack/modules/25_work_orders.md#L323) -- - dt: Output (L363)
- [ ] **e0199-c011** [statement, lines 324-324](../development-pack/modules/25_work_orders.md#L324) -- - dt: Quantity to Produce (L367)
- [ ] **e0199-c012** [statement, lines 325-325](../development-pack/modules/25_work_orders.md#L325) -- - dt: Quantity Produced (L371)
- [ ] **e0199-c013** [statement, lines 326-326](../development-pack/modules/25_work_orders.md#L326) -- - dt: Warehouse (L377)
- [ ] **e0199-c014** [statement, lines 327-327](../development-pack/modules/25_work_orders.md#L327) -- - dt: Notes (L381)
- [ ] **e0199-c015** [statement, lines 328-328](../development-pack/modules/25_work_orders.md#L328) -- - h3: Required Components (L390)
- [ ] **e0199-c016** [statement, lines 329-329](../development-pack/modules/25_work_orders.md#L329) -- - th: Component (L396)
- [ ] **e0199-c017** [statement, lines 330-330](../development-pack/modules/25_work_orders.md#L330) -- - th: SKU (L397)
- [ ] **e0199-c018** [statement, lines 331-331](../development-pack/modules/25_work_orders.md#L331) -- - th: Required Qty (L398)
- [ ] **e0199-c019** [statement, lines 332-332](../development-pack/modules/25_work_orders.md#L332) -- - th: Consumed (L399)
- [ ] **e0199-c020** [statement, lines 333-333](../development-pack/modules/25_work_orders.md#L333) -- - th: Available (L400)
- [ ] **e0199-c021** [statement, lines 334-334](../development-pack/modules/25_work_orders.md#L334) -- - th: Status (L401)
- [ ] **e0199-c022** [statement, lines 335-335](../development-pack/modules/25_work_orders.md#L335) -- - h3: Produced (L461)
- [ ] **e0199-c023** [statement, lines 336-336](../development-pack/modules/25_work_orders.md#L336) -- - h3: Complete Production (L481)
- [ ] **e0199-c024** [statement, lines 337-337](../development-pack/modules/25_work_orders.md#L337) -- - h3: Information (L587)
- [ ] **e0199-c025** [statement, lines 338-338](../development-pack/modules/25_work_orders.md#L338) -- - dt: Created By (L591)
- [ ] **e0199-c026** [statement, lines 339-339](../development-pack/modules/25_work_orders.md#L339) -- - dt: Created (L595)
- [ ] **e0199-c027** [statement, lines 340-340](../development-pack/modules/25_work_orders.md#L340) -- - dt: Production Started (L599)
- [ ] **e0199-c028** [statement, lines 341-341](../development-pack/modules/25_work_orders.md#L341) -- - dt: Completed (L603)
- [ ] **e0199-c029** [statement, lines 342-342](../development-pack/modules/25_work_orders.md#L342) -- - dt: Last Updated (L607)
- [ ] **e0199-c030** [statement, lines 343-343](../development-pack/modules/25_work_orders.md#L343) -- - h3: Danger Zone (L616)
- [ ] **e0199-c031** [statement, lines 344-344](../development-pack/modules/25_work_orders.md#L344) -- - column draft: Draft (L30)
- [ ] **e0199-c032** [statement, lines 345-345](../development-pack/modules/25_work_orders.md#L345) -- - column pending: Pending (L31)
- [ ] **e0199-c033** [statement, lines 346-346](../development-pack/modules/25_work_orders.md#L346) -- - column in_progress: In Progress (L32)
- [ ] **e0199-c034** [statement, lines 347-347](../development-pack/modules/25_work_orders.md#L347) -- - column completed: Completed (L33)
- [ ] **e0199-c035** [prose, lines 350-350](../development-pack/modules/25_work_orders.md#L350) -- **UI state/filter defaults:**
- [ ] **e0199-c036** [source-code reference, lines 352-358](../development-pack/modules/25_work_orders.md#L352) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0199-c037** [table row, lines 361-361](../development-pack/modules/25_work_orders.md#L361) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0199-c038** [table row, lines 364-364](../development-pack/modules/25_work_orders.md#L364) -- quantityProduced  /  Quantity Produced  /  input / number  /  min=1; :max=workOrder.quantity  /  —  /  resources/js/Pages/WorkOrders/Show.vue:487
- [ ] **e0199-c039** [table row, lines 366-366](../development-pack/modules/25_work_orders.md#L366) -- chosenSerials&#91;item.id&#93;  /  serial.serial_number  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/WorkOrders/Show.vue:510
- [ ] **e0199-c040** [table row, lines 368-368](../development-pack/modules/25_work_orders.md#L368) -- chosenBatches&#91;item.id&#93;&#91;batch.id&#93;  /  Quantity to take from batch {batch}  /  input / number  /  min=0; :max=batch.quantity  /  —  /  resources/js/Pages/WorkOrders/Show.vue:534
- [ ] **e0199-c041** [table row, lines 370-370](../development-pack/modules/25_work_orders.md#L370) -- output.serialNumbers  /  Serial numbers of the units produced  /  textarea  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/WorkOrders/Show.vue:551
- [ ] **e0199-c042** [table row, lines 372-372](../development-pack/modules/25_work_orders.md#L372) -- output.batchNumber  /  Batch number  /  input / text  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/WorkOrders/Show.vue:564
- [ ] **e0199-c043** [table row, lines 374-374](../development-pack/modules/25_work_orders.md#L374) -- output.expiryDate  /  Expiry date  /  input / date  /  No extra control attribute; server rules below  /  —  /  resources/js/Pages/WorkOrders/Show.vue:569
- [ ] **e0199-c044** [prose, lines 377-377](../development-pack/modules/25_work_orders.md#L377) -- **Exact chosenSerials defaults / hydration / hidden payload** — resources/js/Pages/WorkOrders/Show.vue:112
- [ ] **e0199-c045** [source-code reference, lines 379-382](../development-pack/modules/25_work_orders.md#L379) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0199-c046** [prose, lines 386-386](../development-pack/modules/25_work_orders.md#L386) -- **Exact chosenBatches defaults / hydration / hidden payload** — resources/js/Pages/WorkOrders/Show.vue:114
- [ ] **e0199-c047** [source-code reference, lines 388-391](../development-pack/modules/25_work_orders.md#L388) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0199-c048** [prose, lines 395-395](../development-pack/modules/25_work_orders.md#L395) -- **Exact output defaults / hydration / hidden payload** — resources/js/Pages/WorkOrders/Show.vue:140
- [ ] **e0199-c049** [source-code reference, lines 397-400](../development-pack/modules/25_work_orders.md#L397) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0199-c050** [table row, lines 404-404](../development-pack/modules/25_work_orders.md#L404) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0199-c051** [table row, lines 407-407](../development-pack/modules/25_work_orders.md#L407) -- Workspace  /  :href=route('work-orders.index')  /  resources/js/Pages/WorkOrders/Show.vue:220
- [ ] **e0199-c052** [table row, lines 409-409](../development-pack/modules/25_work_orders.md#L409) -- Work Orders  /  :href=route('work-orders.index')  /  resources/js/Pages/WorkOrders/Show.vue:222
- [ ] **e0199-c053** [table row, lines 411-411](../development-pack/modules/25_work_orders.md#L411) -- Start Production  /  v-if=canStart; :disabled=processing; @click=startProduction  /  resources/js/Pages/WorkOrders/Show.vue:232
- [ ] **e0199-c054** [table row, lines 413-413](../development-pack/modules/25_work_orders.md#L413) -- Cancel Work Order  /  v-if=canCancel; :disabled=processing; @click=cancelWorkOrder  /  resources/js/Pages/WorkOrders/Show.vue:242
- [ ] **e0199-c055** [table row, lines 415-415](../development-pack/modules/25_work_orders.md#L415) -- Delete  /  v-if=canDelete; :disabled=processing; @click=deleteWorkOrder  /  resources/js/Pages/WorkOrders/Show.vue:252
- [ ] **e0199-c056** [table row, lines 417-417](../development-pack/modules/25_work_orders.md#L417) -- Back to Work Orders  /  :href=route('work-orders.index')  /  resources/js/Pages/WorkOrders/Show.vue:262
- [ ] **e0199-c057** [table row, lines 419-419](../development-pack/modules/25_work_orders.md#L419) -- workOrder.product.name  /  v-if=workOrder.product; :href=route('products.show', workOrder.product.id)  /  resources/js/Pages/WorkOrders/Show.vue:342
- [ ] **e0199-c058** [table row, lines 421-421](../development-pack/modules/25_work_orders.md#L421) -- item.product.name  /  v-if=item.product; :href=route('products.show', item.product.id)  /  resources/js/Pages/WorkOrders/Show.vue:407
- [ ] **e0199-c059** [table row, lines 423-423](../development-pack/modules/25_work_orders.md#L423) -- Complete Production  /  :disabled=processing; @click=completeProduction  /  resources/js/Pages/WorkOrders/Show.vue:573
- [ ] **e0199-c060** [table row, lines 425-425](../development-pack/modules/25_work_orders.md#L425) -- Cancel Work Order  /  :disabled=processing; @click=cancelWorkOrder  /  resources/js/Pages/WorkOrders/Show.vue:618
- [ ] **e0199-c061** [prose, lines 428-428](../development-pack/modules/25_work_orders.md#L428) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0199-c062** [source-code reference, lines 430-454](../development-pack/modules/25_work_orders.md#L430) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0225: StoreWorkOrderRequest.php

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0225). Complete every clause below before closing this section in the ledger.

- [ ] **e0225-c001** [prose, lines 465-465](../development-pack/modules/25_work_orders.md#L465) -- app/Http/Requests/WorkOrder/StoreWorkOrderRequest.php:1
- [ ] **e0225-c002** [source-code reference, lines 467-500](../development-pack/modules/25_work_orders.md#L467) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0238: app/Models/Inventory/WorkOrder.php

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0238). Complete every clause below before closing this section in the ledger.

- [ ] **e0238-c001** [prose, lines 511-511](../development-pack/modules/25_work_orders.md#L511) -- app/Models/Inventory/WorkOrder.php:1
- [ ] **e0238-c002** [source-code reference, lines 514-529](../development-pack/modules/25_work_orders.md#L514) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0238-c003** [source-code reference, lines 532-541](../development-pack/modules/25_work_orders.md#L532) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0239: app/Models/Inventory/WorkOrderItem.php

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0239). Complete every clause below before closing this section in the ledger.

- [ ] **e0239-c001** [prose, lines 552-552](../development-pack/modules/25_work_orders.md#L552) -- app/Models/Inventory/WorkOrderItem.php:1
- [ ] **e0239-c002** [source-code reference, lines 555-564](../development-pack/modules/25_work_orders.md#L555) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0239-c003** [source-code reference, lines 567-575](../development-pack/modules/25_work_orders.md#L567) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0240: app/Models/Inventory/WorkOrderAllocation.php

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0240). Complete every clause below before closing this section in the ledger.

- [ ] **e0240-c001** [prose, lines 586-586](../development-pack/modules/25_work_orders.md#L586) -- app/Models/Inventory/WorkOrderAllocation.php:1
- [ ] **e0240-c002** [source-code reference, lines 589-599](../development-pack/modules/25_work_orders.md#L589) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0240-c003** [source-code reference, lines 602-607](../development-pack/modules/25_work_orders.md#L602) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0241: app/Models/Inventory/WorkOrderOutput.php

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0241). Complete every clause below before closing this section in the ledger.

- [ ] **e0241-c001** [prose, lines 618-618](../development-pack/modules/25_work_orders.md#L618) -- app/Models/Inventory/WorkOrderOutput.php:1
- [ ] **e0241-c002** [source-code reference, lines 621-631](../development-pack/modules/25_work_orders.md#L621) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0241-c003** [source-code reference, lines 634-639](../development-pack/modules/25_work_orders.md#L634) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0501: `app/Http/Requests/Api/WorkOrder/StoreWorkOrderRequest.php`

Source: [exact contract](../development-pack/modules/25_work_orders.md#e0501). Complete every clause below before closing this section in the ledger.

- [ ] **e0501-c001** [prose, lines 650-650](../development-pack/modules/25_work_orders.md#L650) -- Source evidence. SHA-256: 7707a23aa3df5e5d119ab8273eda23adb8646e9cc279b796ac3712f651de2a6e.
- [ ] **e0501-c002** [source-code reference, lines 652-692](../development-pack/modules/25_work_orders.md#L652) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/26_reservations.md

### e0008: Reservations

Source: [exact contract](../development-pack/modules/26_reservations.md#e0008). Complete every clause below before closing this section in the ledger.

- [ ] **e0008-c001** [statement, lines 85-85](../development-pack/modules/26_reservations.md#L85) -- - There is a listing/release UI, **not a generic create-reservation form**. Core/plugin workflows create holds. Listing filters status active(default)/expired/consumed/released/all, owner an...
- [ ] **e0008-c002** [statement, lines 86-86](../development-pack/modules/26_reservations.md#L86) -- - Reserve requires positive integer, future optional expiry; serial exactly 1; no serial+batch, variant+serial/batch, or location+serial/batch combination. Variant parent must resolve to var...
- [ ] **e0008-c003** [statement, lines 87-87](../development-pack/modules/26_reservations.md#L87) -- - Release requires manage_stock plus active hold; confirmation identifies owner/reference and activity is logged. See StockReservationController:96-123.

### e0027: Reservations/Index

Source: [exact contract](../development-pack/modules/26_reservations.md#e0027). Complete every clause below before closing this section in the ledger.

- [ ] **e0027-c001** [prose, lines 97-97](../development-pack/modules/26_reservations.md#L97) -- GET /reservations; view_products. Status default active, owner, reference search and optional product chip. Columns product(+variant), held, held-in location/serial/batch or product-total, o...
- [ ] **e0027-c002** [prose, lines 99-99](../development-pack/modules/26_reservations.md#L99) -- Source: resources/js/Pages/Reservations/Index.vue:1.
- [ ] **e0027-c003** [prose, lines 101-101](../development-pack/modules/26_reservations.md#L101) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0027-c004** [source-code reference, lines 103-110](../development-pack/modules/26_reservations.md#L103) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0027-c005** [prose, lines 112-112](../development-pack/modules/26_reservations.md#L112) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0027-c006** [table row, lines 114-114](../development-pack/modules/26_reservations.md#L114) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0027-c007** [table row, lines 116-116](../development-pack/modules/26_reservations.md#L116) -- search — resources/js/Pages/Reservations/Index.vue:100  /  Search  /  text; props.filters?.search \ / \ /  ''  /  ; v-model="search"; type="text"; :placeholder="t('reservations.searchPlaceho...
- [ ] **e0027-c008** [table row, lines 117-117](../development-pack/modules/26_reservations.md#L117) -- status — resources/js/Pages/Reservations/Index.vue:109  /  Status  /  select; props.filters?.status \ / \ /  'active'  /  ; v-model="status"; @change="applyFilters"  /  Always within this vi...
- [ ] **e0027-c009** [table row, lines 118-118](../development-pack/modules/26_reservations.md#L118) -- owner — resources/js/Pages/Reservations/Index.vue:119  /  Owner  /  select; props.filters?.owner \ / \ /  ''  /  ; v-model="owner"; @change="applyFilters"  /  Always within this view/dialog;...
- [ ] **e0027-c010** [prose, lines 120-120](../development-pack/modules/26_reservations.md#L120) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0027-c011** [statement, lines 122-122](../development-pack/modules/26_reservations.md#L122) -- - status (resources/js/Pages/Reservations/Index.vue:109): &amp;lt;option value="active"&amp;gt;{{ Active }}&amp;lt;/option&amp;gt; &amp;lt;option value="expired"&amp;gt;{{ Expired }}&amp;lt;/option&amp;gt; &amp;lt;option value...
- [ ] **e0027-c012** [statement, lines 123-123](../development-pack/modules/26_reservations.md#L123) -- - owner (resources/js/Pages/Reservations/Index.vue:119): &amp;lt;option value=""&amp;gt;{{ All owners }}&amp;lt;/option&amp;gt; &amp;lt;option v-for="name in owners" :key="name" :value="name"&amp;gt;{{ name }}&amp;lt;/...
- [ ] **e0027-c013** [prose, lines 125-125](../development-pack/modules/26_reservations.md#L125) -- **Read fields, columns and section headings:**
- [ ] **e0027-c014** [statement, lines 127-127](../development-pack/modules/26_reservations.md#L127) -- - th: Product — resources/js/Pages/Reservations/Index.vue:138
- [ ] **e0027-c015** [statement, lines 128-128](../development-pack/modules/26_reservations.md#L128) -- - th: Held — resources/js/Pages/Reservations/Index.vue:139
- [ ] **e0027-c016** [statement, lines 129-129](../development-pack/modules/26_reservations.md#L129) -- - th: Held in — resources/js/Pages/Reservations/Index.vue:140
- [ ] **e0027-c017** [statement, lines 130-130](../development-pack/modules/26_reservations.md#L130) -- - th: Owner — resources/js/Pages/Reservations/Index.vue:141
- [ ] **e0027-c018** [statement, lines 131-131](../development-pack/modules/26_reservations.md#L131) -- - th: Reference — resources/js/Pages/Reservations/Index.vue:142
- [ ] **e0027-c019** [statement, lines 132-132](../development-pack/modules/26_reservations.md#L132) -- - th: Expires — resources/js/Pages/Reservations/Index.vue:143
- [ ] **e0027-c020** [statement, lines 133-133](../development-pack/modules/26_reservations.md#L133) -- - th: Status — resources/js/Pages/Reservations/Index.vue:144
- [ ] **e0027-c021** [statement, lines 134-134](../development-pack/modules/26_reservations.md#L134) -- - th: Actions — resources/js/Pages/Reservations/Index.vue:145
- [ ] **e0027-c022** [prose, lines 136-136](../development-pack/modules/26_reservations.md#L136) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0027-c023** [table row, lines 138-138](../development-pack/modules/26_reservations.md#L138) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0027-c024** [table row, lines 140-140](../development-pack/modules/26_reservations.md#L140) -- All products — resources/js/Pages/Reservations/Index.vue:90  /  type="button"; @click="clearProduct"  /  v-if="product"
- [ ] **e0027-c025** [table row, lines 141-141](../development-pack/modules/26_reservations.md#L141) -- reservation.product.name — resources/js/Pages/Reservations/Index.vue:159  /  v-if="reservation.product"; :href="route('products.show', reservation.product.id)"  /  v-for="reservation in rese...
- [ ] **e0027-c026** [table row, lines 142-142](../development-pack/modules/26_reservations.md#L142) -- Release — resources/js/Pages/Reservations/Index.vue:176  /  v-if="reservation.status === 'active'"; variant="secondary"; size="sm"; @click="release(reservation)"  /  v-for="reservation in re...
- [ ] **e0027-c027** [table row, lines 143-143](../development-pack/modules/26_reservations.md#L143) -- (icon-only; accessible label/title in attributes) — resources/js/Pages/Reservations/Index.vue:193  /  v-if="link.url"; :href="link.url"; v-html="link.label"  /  v-if="reservations.links &amp;&amp; r...
- [ ] **e0027-c028** [prose, lines 145-145](../development-pack/modules/26_reservations.md#L145) -- **Script endpoint names:** reservations.index, reservations.release. Match these to verb/path/permission in the route annex.

### e0085: StockReservationController.php — 26-84

Source: [exact contract](../development-pack/modules/26_reservations.md#e0085). Complete every clause below before closing this section in the ledger.

- [ ] **e0085-c001** [prose, lines 155-155](../development-pack/modules/26_reservations.md#L155) -- Source app/Http/Controllers/Inventory/StockReservationController.php:26
- [ ] **e0085-c002** [source-code reference, lines 157-217](../development-pack/modules/26_reservations.md#L157) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0106: StockReservation

Source: [exact contract](../development-pack/modules/26_reservations.md#e0106). Complete every clause below before closing this section in the ledger.

- [ ] **e0106-c001** [prose, lines 226-226](../development-pack/modules/26_reservations.md#L226) -- app/Models/Inventory/StockReservation.php:1
- [ ] **e0106-c002** [source-code reference, lines 228-256](../development-pack/modules/26_reservations.md#L228) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0150: 2026_10_12_000001_create_stock_reservations_table.php

Source: [exact contract](../development-pack/modules/26_reservations.md#e0150). Complete every clause below before closing this section in the ledger.

- [ ] **e0150-c001** [prose, lines 265-265](../development-pack/modules/26_reservations.md#L265) -- database/migrations/2026_10_12_000001_create_stock_reservations_table.php:1
- [ ] **e0150-c002** [source-code reference, lines 267-290](../development-pack/modules/26_reservations.md#L267) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/27_import_export.md

### e0265: e0265

Source: [exact contract](../development-pack/modules/27_import_export.md#e0265). Complete every clause below before closing this section in the ledger.

- [ ] **e0265-c001** [prose, lines 89-89](../development-pack/modules/27_import_export.md#L89) -- Products import file; users file+send_invites true; orders file+historical false+notify_integrations true. Required file extensions/MIME csv/txt/xlsx/xls,max10240KB (ImportExportController.p...
- [ ] **e0265-c002** [prose, lines 91-91](../development-pack/modules/27_import_export.md#L91) -- Product columns name,sku,barcode,description,category,location,price,currency,purchase_price,stock,min_stock,status,notes,supplier_code,supplier_name,supplier_sku,supplier_cost plus price_{c...
- [ ] **e0265-c003** [prose, lines 93-93](../development-pack/modules/27_import_export.md#L93) -- User columns name,email,role,roles; provided example semicolon-separated custom role names. send_invites true sends set-password link; false leaves pending invitation and password-reset reco...
- [ ] **e0265-c004** [prose, lines 95-95](../development-pack/modules/27_import_export.md#L95) -- Order columns external_reference,order_date,status,customer_name,customer_email,product_sku,variant_sku,quantity,unit_price,line_tax,unit_cost,order_tax,order_shipping,currency,shipped_at,de...
- [ ] **e0265-c005** [prose, lines 97-97](../development-pack/modules/27_import_export.md#L97) -- Exports products/orders/users with filters/formats; queued download record when needed, owner-scoped download. User export additionally view_users; order/user import additionally create_orde...

### e0317: `resources/js/Pages/ImportExport/Index.vue`

Source: [exact contract](../development-pack/modules/27_import_export.md#e0317). Complete every clause below before closing this section in the ledger.

- [ ] **e0317-c001** [prose, lines 107-107](../development-pack/modules/27_import_export.md#L107) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0317-c002** [statement, lines 108-108](../development-pack/modules/27_import_export.md#L108) -- - resources/js/Pages/ImportExport/Index.vue:266: &lt;select id="export_category" v-model="exportFilters.category_id"&gt;
- [ ] **e0317-c003** [statement, lines 109-109](../development-pack/modules/27_import_export.md#L109) -- - resources/js/Pages/ImportExport/Index.vue:274: &lt;select id="export_location" v-model="exportFilters.location_id"&gt;
- [ ] **e0317-c004** [statement, lines 110-110](../development-pack/modules/27_import_export.md#L110) -- - resources/js/Pages/ImportExport/Index.vue:282: &lt;select id="export_status" v-model="exportFilters.status"&gt;
- [ ] **e0317-c005** [statement, lines 111-111](../development-pack/modules/27_import_export.md#L111) -- - resources/js/Pages/ImportExport/Index.vue:291: &lt;input id="low_stock" v-model="exportFilters.low_stock" type="checkbox" /&gt;
- [ ] **e0317-c006** [statement, lines 112-112](../development-pack/modules/27_import_export.md#L112) -- - resources/js/Pages/ImportExport/Index.vue:353: &lt;FileDrop v-model="productImport.file" input-id="product_import_file" /&gt;
- [ ] **e0317-c007** [statement, lines 113-113](../development-pack/modules/27_import_export.md#L113) -- - resources/js/Pages/ImportExport/Index.vue:464: &lt;input v-model="orderExport.mode" type="radio" value="orders" /&gt;
- [ ] **e0317-c008** [statement, lines 114-114](../development-pack/modules/27_import_export.md#L114) -- - resources/js/Pages/ImportExport/Index.vue:471: &lt;input v-model="orderExport.mode" type="radio" value="lines" /&gt;
- [ ] **e0317-c009** [statement, lines 115-115](../development-pack/modules/27_import_export.md#L115) -- - resources/js/Pages/ImportExport/Index.vue:483: &lt;select id="order_export_status" v-model="orderExport.status"&gt;
- [ ] **e0317-c010** [statement, lines 116-116](../development-pack/modules/27_import_export.md#L116) -- - resources/js/Pages/ImportExport/Index.vue:490: &lt;input id="order_export_from" v-model="orderExport.date_from" type="date" /&gt;
- [ ] **e0317-c011** [statement, lines 117-117](../development-pack/modules/27_import_export.md#L117) -- - resources/js/Pages/ImportExport/Index.vue:494: &lt;input id="order_export_to" v-model="orderExport.date_to" type="date" /&gt;
- [ ] **e0317-c012** [statement, lines 118-118](../development-pack/modules/27_import_export.md#L118) -- - resources/js/Pages/ImportExport/Index.vue:517: &lt;FileDrop v-model="orderImport.file" input-id="order_import_file" /&gt;
- [ ] **e0317-c013** [statement, lines 119-119](../development-pack/modules/27_import_export.md#L119) -- - resources/js/Pages/ImportExport/Index.vue:524: &lt;input v-model="orderImport.historical" type="checkbox" /&gt;
- [ ] **e0317-c014** [statement, lines 120-120](../development-pack/modules/27_import_export.md#L120) -- - resources/js/Pages/ImportExport/Index.vue:535: &lt;input v-model="orderImport.notify_integrations" type="checkbox" /&gt;
- [ ] **e0317-c015** [statement, lines 121-121](../development-pack/modules/27_import_export.md#L121) -- - resources/js/Pages/ImportExport/Index.vue:628: &lt;FileDrop v-model="userImport.file" input-id="user_import_file" /&gt;
- [ ] **e0317-c016** [statement, lines 122-122](../development-pack/modules/27_import_export.md#L122) -- - resources/js/Pages/ImportExport/Index.vue:635: &lt;input v-model="userImport.send_invites" type="checkbox" /&gt;
- [ ] **e0317-c017** [prose, lines 124-124](../development-pack/modules/27_import_export.md#L124) -- **Form initial state/defaults:**
- [ ] **e0317-c018** [source-code reference, lines 125-129](../development-pack/modules/27_import_export.md#L125) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0317-c019** [prose, lines 131-131](../development-pack/modules/27_import_export.md#L131) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0317-c020** [source-code reference, lines 132-143](../development-pack/modules/27_import_export.md#L132) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0317-c021** [prose, lines 145-145](../development-pack/modules/27_import_export.md#L145) -- **Visible table headers:**
- [ ] **e0317-c022** [source-code reference, lines 146-152](../development-pack/modules/27_import_export.md#L146) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0317-c023** [prose, lines 154-154](../development-pack/modules/27_import_export.md#L154) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0317-c024** [source-code reference, lines 155-178](../development-pack/modules/27_import_export.md#L155) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0317-c025** [prose, lines 180-180](../development-pack/modules/27_import_export.md#L180) -- **Displayed data/value expressions:**
- [ ] **e0317-c026** [source-code reference, lines 181-200](../development-pack/modules/27_import_export.md#L181) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0405: `app/Http/Controllers/Import/ImportExportController.php`

Source: [exact contract](../development-pack/modules/27_import_export.md#e0405). Complete every clause below before closing this section in the ledger.

- [ ] **e0405-c001** [source-code reference, lines 209-269](../development-pack/modules/27_import_export.md#L209) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0440: Contract appendix `app/Http/Controllers/Import/ImportExportController.php:109-135`

Source: [exact contract](../development-pack/modules/27_import_export.md#e0440). Complete every clause below before closing this section in the ledger.

- [ ] **e0440-c001** [source-code reference, lines 278-306](../development-pack/modules/27_import_export.md#L278) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0441: Contract appendix `app/Http/Controllers/Import/ImportExportController.php:235-247`

Source: [exact contract](../development-pack/modules/27_import_export.md#e0441). Complete every clause below before closing this section in the ledger.

- [ ] **e0441-c001** [source-code reference, lines 315-329](../development-pack/modules/27_import_export.md#L315) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0442: Contract appendix `app/Http/Controllers/Import/ImportExportController.php:298-308`

Source: [exact contract](../development-pack/modules/27_import_export.md#e0442). Complete every clause below before closing this section in the ledger.

- [ ] **e0442-c001** [source-code reference, lines 338-350](../development-pack/modules/27_import_export.md#L338) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0444: `app/Imports/ProductsImport.php`

Source: [exact contract](../development-pack/modules/27_import_export.md#e0444). Complete every clause below before closing this section in the ledger.

- [ ] **e0444-c001** [source-code reference, lines 360-913](../development-pack/modules/27_import_export.md#L360) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0445: `app/Imports/OrdersImport.php`

Source: [exact contract](../development-pack/modules/27_import_export.md#e0445). Complete every clause below before closing this section in the ledger.

- [ ] **e0445-c001** [source-code reference, lines 923-1632](../development-pack/modules/27_import_export.md#L923) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0446: `app/Imports/UsersImport.php`

Source: [exact contract](../development-pack/modules/27_import_export.md#e0446). Complete every clause below before closing this section in the ledger.

- [ ] **e0446-c001** [source-code reference, lines 1642-1951](../development-pack/modules/27_import_export.md#L1642) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/28_reports.md

### e0262: e0262

Source: [exact contract](../development-pack/modules/28_reports.md#e0262). Complete every clause below before closing this section in the ledger.

- [ ] **e0262-c001** [prose, lines 134-134](../development-pack/modules/28_reports.md#L134) -- Routes routes/web/reports.php:17-58: all view_reports plus source permissions. Exact filters/defaults/options/columns in source catalog for every report, including shared PeriodFilter and Re...
- [ ] **e0262-c002** [table row, lines 136-136](../development-pack/modules/28_reports.md#L136) -- View  /  Main breakdown
- [ ] **e0262-c003** [table row, lines 138-138](../development-pack/modules/28_reports.md#L138) -- Inventory valuation  /  Product/category/stock/price/stock value/profit potential; location+warehouse/count/quantity/cost value/retail value.
- [ ] **e0262-c004** [table row, lines 139-139](../development-pack/modules/28_reports.md#L139) -- Stock movement  /  Date/product/type/before/change/after/user.
- [ ] **e0262-c005** [table row, lines 140-140](../development-pack/modules/28_reports.md#L140) -- Sales analysis  /  Payment status/order count/total/paid/balance; daily date/order count/revenue.
- [ ] **e0262-c006** [table row, lines 141-141](../development-pack/modules/28_reports.md#L141) -- Low stock  /  Status/product/category/current/min/max/deficit/reorder cost/supplier/suggested qty/actions; quick reorder reuses purchase rules.
- [ ] **e0262-c007** [table row, lines 142-142](../development-pack/modules/28_reports.md#L142) -- Category performance  /  Category/products/stock/value/average per product/low count.
- [ ] **e0262-c008** [table row, lines 143-143](../development-pack/modules/28_reports.md#L143) -- Receivables  /  Customer/order count/aging buckets/total; order/customer/date/age/total/paid/balance.
- [ ] **e0262-c009** [table row, lines 144-144](../development-pack/modules/28_reports.md#L144) -- Batch expiry  /  Dynamic batch columns/status and server date/status filtering.
- [ ] **e0262-c010** [table row, lines 145-145](../development-pack/modules/28_reports.md#L145) -- Dead stock  /  Product/category/location/on-hand/current-cost/tied-up-value/last-sale/last-outbound. Days30/60/90/180; basis both / sales / movement.
- [ ] **e0262-c011** [table row, lines 146-146](../development-pack/modules/28_reports.md#L146) -- Turnover  /  Category/product units sold/opening/closing/average inventory/COGS/turnover/days inventory.
- [ ] **e0262-c012** [table row, lines 147-147](../development-pack/modules/28_reports.md#L147) -- Margin  /  Product/category/units/revenue/COGS/margin/margin%; category summary.
- [ ] **e0262-c013** [table row, lines 148-148](../development-pack/modules/28_reports.md#L148) -- Sales by location  /  Warehouse/order count/sales/previous/change; location/warehouse/units/sales/previous/change.
- [ ] **e0262-c014** [table row, lines 149-149](../development-pack/modules/28_reports.md#L149) -- ABC  /  Rank/product/units/revenue/share/cumulative/class. A cumulative80%, B95%, rest C.
- [ ] **e0262-c015** [prose, lines 151-151](../development-pack/modules/28_reports.md#L151) -- Source Services/Reports/InventoryAnalyticsService.php:18-77: sales noncancelled/nondeleted order lines; cost-at-sale, explicitly flag backfilled estimates/missing costs. List cap reports.max...

### e0263: Saved reports

Source: [exact contract](../development-pack/modules/28_reports.md#e0263). Complete every clause below before closing this section in the ledger.

- [ ] **e0263-c001** [prose, lines 161-161](../development-pack/modules/28_reports.md#L161) -- name required max255; description nullable max1000; data_source required max50 and valid registered source; columns nonempty valid column array; filters nullable array with field(required-wi...
- [ ] **e0263-c002** [prose, lines 163-163](../development-pack/modules/28_reports.md#L163) -- Built-in data sources (ReportDataService.php:45-132):
- [ ] **e0263-c003** [statement, lines 164-164](../development-pack/modules/28_reports.md#L164) -- - products: name,sku,stock,price,purchase_price,category_name,location_name,type,is_active,created_at.
- [ ] **e0263-c004** [statement, lines 165-165](../development-pack/modules/28_reports.md#L165) -- - orders: order_number,customer_name,status,total,subtotal,tax,order_date,created_at.
- [ ] **e0263-c005** [statement, lines 166-166](../development-pack/modules/28_reports.md#L166) -- - stock_adjustments: product_name,product_sku,type,quantity,reason,created_at.
- [ ] **e0263-c006** [statement, lines 167-167](../development-pack/modules/28_reports.md#L167) -- - customers: name,email,phone,company,orders_count,created_at.
- [ ] **e0263-c007** [statement, lines 168-168](../development-pack/modules/28_reports.md#L168) -- - suppliers: name,email,phone,products_count,created_at.
- [ ] **e0263-c008** [statement, lines 169-169](../development-pack/modules/28_reports.md#L169) -- - purchase_orders: po_number,supplier_name,status,total,order_date,created_at.
- [ ] **e0263-c009** [prose, lines 171-171](../development-pack/modules/28_reports.md#L171) -- Catalog preserves each column type and source contract. Plugins may register source with matching handler/permission. Actions source/column/filter/sort/chart selection, preview, save, share,...

### e0294: `resources/js/Components/Reports/PeriodFilter.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0294). Complete every clause below before closing this section in the ledger.

- [ ] **e0294-c001** [prose, lines 181-181](../development-pack/modules/28_reports.md#L181) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0294-c002** [statement, lines 182-182](../development-pack/modules/28_reports.md#L182) -- - resources/js/Components/Reports/PeriodFilter.vue:38: &lt;input :id="&amp;#96;${routeName}-from&amp;#96;" v-model="dateFrom" type="date" /&gt;
- [ ] **e0294-c003** [statement, lines 183-183](../development-pack/modules/28_reports.md#L183) -- - resources/js/Components/Reports/PeriodFilter.vue:42: &lt;input :id="&amp;#96;${routeName}-to&amp;#96;" v-model="dateTo" type="date" /&gt;
- [ ] **e0294-c004** [prose, lines 185-185](../development-pack/modules/28_reports.md#L185) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0294-c005** [source-code reference, lines 186-190](../development-pack/modules/28_reports.md#L186) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0295: `resources/js/Components/Reports/ReportSchedules.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0295). Complete every clause below before closing this section in the ledger.

- [ ] **e0295-c001** [prose, lines 200-200](../development-pack/modules/28_reports.md#L200) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0295-c002** [statement, lines 201-201](../development-pack/modules/28_reports.md#L201) -- - resources/js/Components/Reports/ReportSchedules.vue:137: &lt;select id="schedule-frequency" v-model="form.frequency"&gt;
- [ ] **e0295-c003** [statement, lines 202-202](../development-pack/modules/28_reports.md#L202) -- - resources/js/Components/Reports/ReportSchedules.vue:144: &lt;select id="schedule-dow" v-model.number="form.day_of_week"&gt;
- [ ] **e0295-c004** [statement, lines 203-203](../development-pack/modules/28_reports.md#L203) -- - resources/js/Components/Reports/ReportSchedules.vue:151: &lt;input id="schedule-dom" v-model.number="form.day_of_month" type="number" min="1" max="31" /&gt;
- [ ] **e0295-c005** [statement, lines 204-204](../development-pack/modules/28_reports.md#L204) -- - resources/js/Components/Reports/ReportSchedules.vue:157: &lt;input id="schedule-time" v-model="form.time_of_day" type="time" step="900" /&gt;
- [ ] **e0295-c006** [statement, lines 205-205](../development-pack/modules/28_reports.md#L205) -- - resources/js/Components/Reports/ReportSchedules.vue:163: &lt;select id="schedule-format" v-model="form.format"&gt;
- [ ] **e0295-c007** [statement, lines 206-206](../development-pack/modules/28_reports.md#L206) -- - resources/js/Components/Reports/ReportSchedules.vue:179: &lt;input v-model="form.recipients" type="checkbox" :value="person.email.toLowerCase()" /&gt;
- [ ] **e0295-c008** [prose, lines 208-208](../development-pack/modules/28_reports.md#L208) -- **Form initial state/defaults:**
- [ ] **e0295-c009** [source-code reference, lines 209-211](../development-pack/modules/28_reports.md#L209) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0295-c010** [prose, lines 213-213](../development-pack/modules/28_reports.md#L213) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0295-c011** [source-code reference, lines 214-218](../development-pack/modules/28_reports.md#L214) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0295-c012** [prose, lines 220-220](../development-pack/modules/28_reports.md#L220) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0295-c013** [source-code reference, lines 221-231](../development-pack/modules/28_reports.md#L221) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0295-c014** [prose, lines 233-233](../development-pack/modules/28_reports.md#L233) -- **Displayed data/value expressions:**
- [ ] **e0295-c015** [source-code reference, lines 234-243](../development-pack/modules/28_reports.md#L234) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0339: `resources/js/Pages/Reports/AbcAnalysis.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0339). Complete every clause below before closing this section in the ledger.

- [ ] **e0339-c001** [prose, lines 253-254](../development-pack/modules/28_reports.md#L253) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0339-c002** [prose, lines 256-256](../development-pack/modules/28_reports.md#L256) -- **Visible table headers:**
- [ ] **e0339-c003** [source-code reference, lines 257-265](../development-pack/modules/28_reports.md#L257) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0339-c004** [prose, lines 267-267](../development-pack/modules/28_reports.md#L267) -- **Displayed data/value expressions:**
- [ ] **e0339-c005** [source-code reference, lines 268-277](../development-pack/modules/28_reports.md#L268) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0340: `resources/js/Pages/Reports/BatchExpiry.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0340). Complete every clause below before closing this section in the ledger.

- [ ] **e0340-c001** [prose, lines 287-287](../development-pack/modules/28_reports.md#L287) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0340-c002** [statement, lines 288-288](../development-pack/modules/28_reports.md#L288) -- - resources/js/Pages/Reports/BatchExpiry.vue:63: &lt;input id="batch-expiry-search" v-model="form.search" type="search" maxlength="200" /&gt;
- [ ] **e0340-c003** [statement, lines 289-289](../development-pack/modules/28_reports.md#L289) -- - resources/js/Pages/Reports/BatchExpiry.vue:67: &lt;select id="batch-expiry-window" v-model="form.window"&gt;
- [ ] **e0340-c004** [prose, lines 291-291](../development-pack/modules/28_reports.md#L291) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0340-c005** [source-code reference, lines 292-294](../development-pack/modules/28_reports.md#L292) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0340-c006** [prose, lines 296-296](../development-pack/modules/28_reports.md#L296) -- **Visible table headers:**
- [ ] **e0340-c007** [source-code reference, lines 297-300](../development-pack/modules/28_reports.md#L297) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0340-c008** [prose, lines 302-302](../development-pack/modules/28_reports.md#L302) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0340-c009** [source-code reference, lines 303-307](../development-pack/modules/28_reports.md#L303) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0340-c010** [prose, lines 309-309](../development-pack/modules/28_reports.md#L309) -- **Displayed data/value expressions:**
- [ ] **e0340-c011** [source-code reference, lines 310-317](../development-pack/modules/28_reports.md#L310) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0341: `resources/js/Pages/Reports/Builder/Create.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0341). Complete every clause below before closing this section in the ledger.

- [ ] **e0341-c001** [prose, lines 327-327](../development-pack/modules/28_reports.md#L327) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0341-c002** [statement, lines 328-328](../development-pack/modules/28_reports.md#L328) -- - resources/js/Pages/Reports/Builder/Create.vue:207: &lt;input :id="fieldIdPrefix + '-1'" v-model="form.name" type="text" maxlength="255" :placeholder="t('reportBuilder.placeholders.name')" /&gt;
- [ ] **e0341-c003** [statement, lines 329-329](../development-pack/modules/28_reports.md#L329) -- - resources/js/Pages/Reports/Builder/Create.vue:218: &lt;textarea :id="fieldIdPrefix + '-2'" v-model="form.description" rows="2" maxlength="1000" :placeholder="t('reportBuilder.placeholders.des...
- [ ] **e0341-c004** [statement, lines 330-330](../development-pack/modules/28_reports.md#L330) -- - resources/js/Pages/Reports/Builder/Create.vue:233: &lt;select :aria-label="t('reportBuilder.sections.dataSource')" v-model="form.data_source" &gt;
- [ ] **e0341-c005** [statement, lines 331-331](../development-pack/modules/28_reports.md#L331) -- - resources/js/Pages/Reports/Builder/Create.vue:316: &lt;select :aria-label="t('reportBuilder.placeholders.filterField')" v-model="filter.field" &gt;
- [ ] **e0341-c006** [statement, lines 332-332](../development-pack/modules/28_reports.md#L332) -- - resources/js/Pages/Reports/Builder/Create.vue:323: &lt;select :aria-label="t('reportBuilder.fields.operator')" v-model="filter.operator" &gt;
- [ ] **e0341-c007** [statement, lines 333-333](../development-pack/modules/28_reports.md#L333) -- - resources/js/Pages/Reports/Builder/Create.vue:329: &lt;input :aria-label="t('reportBuilder.placeholders.filterValue')" v-if="!noValueOperators.includes(filter.operator)" v-model="filter.value...
- [ ] **e0341-c008** [statement, lines 334-334](../development-pack/modules/28_reports.md#L334) -- - resources/js/Pages/Reports/Builder/Create.vue:357: &lt;select :aria-label="t('reportBuilder.fields.sortField')" v-model="form.sort.field" &gt;
- [ ] **e0341-c009** [statement, lines 335-335](../development-pack/modules/28_reports.md#L335) -- - resources/js/Pages/Reports/Builder/Create.vue:364: &lt;select :aria-label="t('reportBuilder.fields.sortDirection')" v-model="form.sort.direction" &gt;
- [ ] **e0341-c010** [statement, lines 336-336](../development-pack/modules/28_reports.md#L336) -- - resources/js/Pages/Reports/Builder/Create.vue:382: &lt;select :id="fieldIdPrefix + '-3'" v-model="form.chart_type" &gt;
- [ ] **e0341-c011** [statement, lines 337-337](../development-pack/modules/28_reports.md#L337) -- - resources/js/Pages/Reports/Builder/Create.vue:391: &lt;select :id="fieldIdPrefix + '-4'" v-model="form.chart_field" &gt;
- [ ] **e0341-c012** [statement, lines 338-338](../development-pack/modules/28_reports.md#L338) -- - resources/js/Pages/Reports/Builder/Create.vue:456: &lt;input v-model="form.is_shared" type="checkbox" /&gt;
- [ ] **e0341-c013** [prose, lines 340-340](../development-pack/modules/28_reports.md#L340) -- **Form initial state/defaults:**
- [ ] **e0341-c014** [source-code reference, lines 341-353](../development-pack/modules/28_reports.md#L341) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0341-c015** [prose, lines 355-355](../development-pack/modules/28_reports.md#L355) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0341-c016** [source-code reference, lines 356-369](../development-pack/modules/28_reports.md#L356) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0341-c017** [prose, lines 371-371](../development-pack/modules/28_reports.md#L371) -- **Visible table headers:**
- [ ] **e0341-c018** [source-code reference, lines 372-374](../development-pack/modules/28_reports.md#L372) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0341-c019** [prose, lines 376-376](../development-pack/modules/28_reports.md#L376) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0341-c020** [source-code reference, lines 377-388](../development-pack/modules/28_reports.md#L377) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0341-c021** [prose, lines 390-390](../development-pack/modules/28_reports.md#L390) -- **Displayed data/value expressions:**
- [ ] **e0341-c022** [source-code reference, lines 391-410](../development-pack/modules/28_reports.md#L391) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0342: `resources/js/Pages/Reports/Builder/Edit.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0342). Complete every clause below before closing this section in the ledger.

- [ ] **e0342-c001** [prose, lines 420-420](../development-pack/modules/28_reports.md#L420) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0342-c002** [statement, lines 421-421](../development-pack/modules/28_reports.md#L421) -- - resources/js/Pages/Reports/Builder/Edit.vue:202: &lt;input :id="fieldIdPrefix + '-1'" v-model="form.name" type="text" maxlength="255" :placeholder="t('reportBuilder.placeholders.name')" /&gt;
- [ ] **e0342-c003** [statement, lines 422-422](../development-pack/modules/28_reports.md#L422) -- - resources/js/Pages/Reports/Builder/Edit.vue:213: &lt;textarea :id="fieldIdPrefix + '-2'" v-model="form.description" rows="2" maxlength="1000" :placeholder="t('reportBuilder.placeholders.descr...
- [ ] **e0342-c004** [statement, lines 423-423](../development-pack/modules/28_reports.md#L423) -- - resources/js/Pages/Reports/Builder/Edit.vue:228: &lt;select :aria-label="t('reportBuilder.sections.dataSource')" v-model="form.data_source" &gt;
- [ ] **e0342-c005** [statement, lines 424-424](../development-pack/modules/28_reports.md#L424) -- - resources/js/Pages/Reports/Builder/Edit.vue:311: &lt;select :aria-label="t('reportBuilder.placeholders.filterField')" v-model="filter.field" &gt;
- [ ] **e0342-c006** [statement, lines 425-425](../development-pack/modules/28_reports.md#L425) -- - resources/js/Pages/Reports/Builder/Edit.vue:318: &lt;select :aria-label="t('reportBuilder.fields.operator')" v-model="filter.operator" &gt;
- [ ] **e0342-c007** [statement, lines 426-426](../development-pack/modules/28_reports.md#L426) -- - resources/js/Pages/Reports/Builder/Edit.vue:324: &lt;input :aria-label="t('reportBuilder.placeholders.filterValue')" v-if="!noValueOperators.includes(filter.operator)" v-model="filter.value" ...
- [ ] **e0342-c008** [statement, lines 427-427](../development-pack/modules/28_reports.md#L427) -- - resources/js/Pages/Reports/Builder/Edit.vue:352: &lt;select :aria-label="t('reportBuilder.fields.sortField')" v-model="form.sort.field" &gt;
- [ ] **e0342-c009** [statement, lines 428-428](../development-pack/modules/28_reports.md#L428) -- - resources/js/Pages/Reports/Builder/Edit.vue:359: &lt;select :aria-label="t('reportBuilder.fields.sortDirection')" v-model="form.sort.direction" &gt;
- [ ] **e0342-c010** [statement, lines 429-429](../development-pack/modules/28_reports.md#L429) -- - resources/js/Pages/Reports/Builder/Edit.vue:377: &lt;select :id="fieldIdPrefix + '-3'" v-model="form.chart_type" &gt;
- [ ] **e0342-c011** [statement, lines 430-430](../development-pack/modules/28_reports.md#L430) -- - resources/js/Pages/Reports/Builder/Edit.vue:386: &lt;select :id="fieldIdPrefix + '-4'" v-model="form.chart_field" &gt;
- [ ] **e0342-c012** [statement, lines 431-431](../development-pack/modules/28_reports.md#L431) -- - resources/js/Pages/Reports/Builder/Edit.vue:451: &lt;input v-model="form.is_shared" type="checkbox" /&gt;
- [ ] **e0342-c013** [prose, lines 433-433](../development-pack/modules/28_reports.md#L433) -- **Form initial state/defaults:**
- [ ] **e0342-c014** [source-code reference, lines 434-446](../development-pack/modules/28_reports.md#L434) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0342-c015** [prose, lines 448-448](../development-pack/modules/28_reports.md#L448) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0342-c016** [source-code reference, lines 449-462](../development-pack/modules/28_reports.md#L449) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0342-c017** [prose, lines 464-464](../development-pack/modules/28_reports.md#L464) -- **Visible table headers:**
- [ ] **e0342-c018** [source-code reference, lines 465-467](../development-pack/modules/28_reports.md#L465) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0342-c019** [prose, lines 469-469](../development-pack/modules/28_reports.md#L469) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0342-c020** [source-code reference, lines 470-481](../development-pack/modules/28_reports.md#L470) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0342-c021** [prose, lines 483-483](../development-pack/modules/28_reports.md#L483) -- **Displayed data/value expressions:**
- [ ] **e0342-c022** [source-code reference, lines 484-503](../development-pack/modules/28_reports.md#L484) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0343: `resources/js/Pages/Reports/Builder/Index.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0343). Complete every clause below before closing this section in the ledger.

- [ ] **e0343-c001** [prose, lines 513-513](../development-pack/modules/28_reports.md#L513) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0343-c002** [statement, lines 514-514](../development-pack/modules/28_reports.md#L514) -- - resources/js/Pages/Reports/Builder/Index.vue:80: &lt;input v-model="search" :aria-label="t('common.search')" type="text" :placeholder="t('reportBuilder.searchPlaceholder')" /&gt;
- [ ] **e0343-c003** [prose, lines 516-516](../development-pack/modules/28_reports.md#L516) -- **Visible table headers:**
- [ ] **e0343-c004** [source-code reference, lines 517-524](../development-pack/modules/28_reports.md#L517) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0343-c005** [prose, lines 526-526](../development-pack/modules/28_reports.md#L526) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0343-c006** [source-code reference, lines 527-534](../development-pack/modules/28_reports.md#L527) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0343-c007** [prose, lines 536-536](../development-pack/modules/28_reports.md#L536) -- **Displayed data/value expressions:**
- [ ] **e0343-c008** [source-code reference, lines 537-543](../development-pack/modules/28_reports.md#L537) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0344: `resources/js/Pages/Reports/Builder/Show.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0344). Complete every clause below before closing this section in the ledger.

- [ ] **e0344-c001** [prose, lines 553-554](../development-pack/modules/28_reports.md#L553) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0344-c002** [prose, lines 556-556](../development-pack/modules/28_reports.md#L556) -- **Visible table headers:**
- [ ] **e0344-c003** [source-code reference, lines 557-560](../development-pack/modules/28_reports.md#L557) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0344-c004** [prose, lines 562-562](../development-pack/modules/28_reports.md#L562) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0344-c005** [source-code reference, lines 563-566](../development-pack/modules/28_reports.md#L563) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0344-c006** [prose, lines 568-568](../development-pack/modules/28_reports.md#L568) -- **Displayed data/value expressions:**
- [ ] **e0344-c007** [source-code reference, lines 569-581](../development-pack/modules/28_reports.md#L569) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0345: `resources/js/Pages/Reports/CategoryPerformance.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0345). Complete every clause below before closing this section in the ledger.

- [ ] **e0345-c001** [prose, lines 591-592](../development-pack/modules/28_reports.md#L591) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0345-c002** [prose, lines 594-594](../development-pack/modules/28_reports.md#L594) -- **Visible table headers:**
- [ ] **e0345-c003** [source-code reference, lines 595-602](../development-pack/modules/28_reports.md#L595) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0345-c004** [prose, lines 604-604](../development-pack/modules/28_reports.md#L604) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0345-c005** [source-code reference, lines 605-607](../development-pack/modules/28_reports.md#L605) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0345-c006** [prose, lines 609-609](../development-pack/modules/28_reports.md#L609) -- **Displayed data/value expressions:**
- [ ] **e0345-c007** [source-code reference, lines 610-625](../development-pack/modules/28_reports.md#L610) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0346: `resources/js/Pages/Reports/DeadStock.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0346). Complete every clause below before closing this section in the ledger.

- [ ] **e0346-c001** [prose, lines 635-635](../development-pack/modules/28_reports.md#L635) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0346-c002** [statement, lines 636-636](../development-pack/modules/28_reports.md#L636) -- - resources/js/Pages/Reports/DeadStock.vue:72: &lt;select id="dead-days" v-model.number="days"&gt;
- [ ] **e0346-c003** [statement, lines 637-637](../development-pack/modules/28_reports.md#L637) -- - resources/js/Pages/Reports/DeadStock.vue:78: &lt;select id="dead-basis" v-model="basis"&gt;
- [ ] **e0346-c004** [prose, lines 639-639](../development-pack/modules/28_reports.md#L639) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0346-c005** [source-code reference, lines 640-643](../development-pack/modules/28_reports.md#L640) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0346-c006** [prose, lines 645-645](../development-pack/modules/28_reports.md#L645) -- **Visible table headers:**
- [ ] **e0346-c007** [source-code reference, lines 646-655](../development-pack/modules/28_reports.md#L646) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0346-c008** [prose, lines 657-657](../development-pack/modules/28_reports.md#L657) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0346-c009** [source-code reference, lines 658-663](../development-pack/modules/28_reports.md#L658) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0346-c010** [prose, lines 665-665](../development-pack/modules/28_reports.md#L665) -- **Displayed data/value expressions:**
- [ ] **e0346-c011** [source-code reference, lines 666-676](../development-pack/modules/28_reports.md#L666) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0347: `resources/js/Pages/Reports/Index.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0347). Complete every clause below before closing this section in the ledger.

- [ ] **e0347-c001** [prose, lines 686-687](../development-pack/modules/28_reports.md#L686) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0347-c002** [prose, lines 689-689](../development-pack/modules/28_reports.md#L689) -- **Visible table headers:**
- [ ] **e0347-c003** [source-code reference, lines 690-696](../development-pack/modules/28_reports.md#L690) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0347-c004** [prose, lines 698-698](../development-pack/modules/28_reports.md#L698) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0347-c005** [source-code reference, lines 699-717](../development-pack/modules/28_reports.md#L699) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0347-c006** [prose, lines 719-719](../development-pack/modules/28_reports.md#L719) -- **Displayed data/value expressions:**
- [ ] **e0347-c007** [source-code reference, lines 720-727](../development-pack/modules/28_reports.md#L720) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0348: `resources/js/Pages/Reports/InventoryTurnover.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0348). Complete every clause below before closing this section in the ledger.

- [ ] **e0348-c001** [prose, lines 737-738](../development-pack/modules/28_reports.md#L737) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0348-c002** [prose, lines 740-740](../development-pack/modules/28_reports.md#L740) -- **Visible table headers:**
- [ ] **e0348-c003** [source-code reference, lines 741-756](../development-pack/modules/28_reports.md#L741) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0348-c004** [prose, lines 758-758](../development-pack/modules/28_reports.md#L758) -- **Displayed data/value expressions:**
- [ ] **e0348-c005** [source-code reference, lines 759-775](../development-pack/modules/28_reports.md#L759) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0349: `resources/js/Pages/Reports/InventoryValuation.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0349). Complete every clause below before closing this section in the ledger.

- [ ] **e0349-c001** [prose, lines 785-786](../development-pack/modules/28_reports.md#L785) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0349-c002** [prose, lines 788-788](../development-pack/modules/28_reports.md#L788) -- **Visible table headers:**
- [ ] **e0349-c003** [source-code reference, lines 789-802](../development-pack/modules/28_reports.md#L789) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0349-c004** [prose, lines 804-804](../development-pack/modules/28_reports.md#L804) -- **Displayed data/value expressions:**
- [ ] **e0349-c005** [source-code reference, lines 805-825](../development-pack/modules/28_reports.md#L805) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0350: `resources/js/Pages/Reports/LowStock.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0350). Complete every clause below before closing this section in the ledger.

- [ ] **e0350-c001** [prose, lines 835-836](../development-pack/modules/28_reports.md#L835) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0350-c002** [prose, lines 838-838](../development-pack/modules/28_reports.md#L838) -- **Visible table headers:**
- [ ] **e0350-c003** [source-code reference, lines 839-852](../development-pack/modules/28_reports.md#L839) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0350-c004** [prose, lines 854-854](../development-pack/modules/28_reports.md#L854) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0350-c005** [source-code reference, lines 855-857](../development-pack/modules/28_reports.md#L855) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0350-c006** [prose, lines 859-859](../development-pack/modules/28_reports.md#L859) -- **Displayed data/value expressions:**
- [ ] **e0350-c007** [source-code reference, lines 860-872](../development-pack/modules/28_reports.md#L860) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0351: `resources/js/Pages/Reports/ProfitMargin.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0351). Complete every clause below before closing this section in the ledger.

- [ ] **e0351-c001** [prose, lines 882-883](../development-pack/modules/28_reports.md#L882) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0351-c002** [prose, lines 885-885](../development-pack/modules/28_reports.md#L885) -- **Visible table headers:**
- [ ] **e0351-c003** [source-code reference, lines 886-900](../development-pack/modules/28_reports.md#L886) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0351-c004** [prose, lines 902-902](../development-pack/modules/28_reports.md#L902) -- **Displayed data/value expressions:**
- [ ] **e0351-c005** [source-code reference, lines 903-918](../development-pack/modules/28_reports.md#L903) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0352: `resources/js/Pages/Reports/Receivables.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0352). Complete every clause below before closing this section in the ledger.

- [ ] **e0352-c001** [prose, lines 928-929](../development-pack/modules/28_reports.md#L928) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0352-c002** [prose, lines 931-931](../development-pack/modules/28_reports.md#L931) -- **Visible table headers:**
- [ ] **e0352-c003** [source-code reference, lines 932-944](../development-pack/modules/28_reports.md#L932) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0352-c004** [prose, lines 946-946](../development-pack/modules/28_reports.md#L946) -- **Displayed data/value expressions:**
- [ ] **e0352-c005** [source-code reference, lines 947-965](../development-pack/modules/28_reports.md#L947) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0353: `resources/js/Pages/Reports/SalesAnalysis.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0353). Complete every clause below before closing this section in the ledger.

- [ ] **e0353-c001** [prose, lines 975-975](../development-pack/modules/28_reports.md#L975) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0353-c002** [statement, lines 976-976](../development-pack/modules/28_reports.md#L976) -- - resources/js/Pages/Reports/SalesAnalysis.vue:129: &lt;input id="date_from" v-model="dateFrom" type="date" /&gt;
- [ ] **e0353-c003** [statement, lines 977-977](../development-pack/modules/28_reports.md#L977) -- - resources/js/Pages/Reports/SalesAnalysis.vue:133: &lt;input id="date_to" v-model="dateTo" type="date" /&gt;
- [ ] **e0353-c004** [prose, lines 979-979](../development-pack/modules/28_reports.md#L979) -- **Visible table headers:**
- [ ] **e0353-c005** [source-code reference, lines 980-989](../development-pack/modules/28_reports.md#L980) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0353-c006** [prose, lines 991-991](../development-pack/modules/28_reports.md#L991) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0353-c007** [source-code reference, lines 992-998](../development-pack/modules/28_reports.md#L992) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0353-c008** [prose, lines 1000-1000](../development-pack/modules/28_reports.md#L1000) -- **Displayed data/value expressions:**
- [ ] **e0353-c009** [source-code reference, lines 1001-1018](../development-pack/modules/28_reports.md#L1001) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0354: `resources/js/Pages/Reports/SalesByLocation.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0354). Complete every clause below before closing this section in the ledger.

- [ ] **e0354-c001** [prose, lines 1028-1029](../development-pack/modules/28_reports.md#L1028) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0354-c002** [prose, lines 1031-1031](../development-pack/modules/28_reports.md#L1031) -- **Visible table headers:**
- [ ] **e0354-c003** [source-code reference, lines 1032-1044](../development-pack/modules/28_reports.md#L1032) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0354-c004** [prose, lines 1046-1046](../development-pack/modules/28_reports.md#L1046) -- **Displayed data/value expressions:**
- [ ] **e0354-c005** [source-code reference, lines 1047-1059](../development-pack/modules/28_reports.md#L1047) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0355: `resources/js/Pages/Reports/StockMovement.vue`

Source: [exact contract](../development-pack/modules/28_reports.md#e0355). Complete every clause below before closing this section in the ledger.

- [ ] **e0355-c001** [prose, lines 1069-1069](../development-pack/modules/28_reports.md#L1069) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0355-c002** [statement, lines 1070-1070](../development-pack/modules/28_reports.md#L1070) -- - resources/js/Pages/Reports/StockMovement.vue:138: &lt;input :id="fieldIdPrefix + '-1'" v-model="dateFrom" type="date" /&gt;
- [ ] **e0355-c003** [statement, lines 1071-1071](../development-pack/modules/28_reports.md#L1071) -- - resources/js/Pages/Reports/StockMovement.vue:142: &lt;input :id="fieldIdPrefix + '-2'" v-model="dateTo" type="date" /&gt;
- [ ] **e0355-c004** [statement, lines 1072-1072](../development-pack/modules/28_reports.md#L1072) -- - resources/js/Pages/Reports/StockMovement.vue:146: &lt;select :id="fieldIdPrefix + '-3'" v-model="productId"&gt;
- [ ] **e0355-c005** [statement, lines 1073-1073](../development-pack/modules/28_reports.md#L1073) -- - resources/js/Pages/Reports/StockMovement.vue:155: &lt;select :id="fieldIdPrefix + '-4'" v-model="type"&gt;
- [ ] **e0355-c006** [prose, lines 1075-1075](../development-pack/modules/28_reports.md#L1075) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0355-c007** [source-code reference, lines 1076-1086](../development-pack/modules/28_reports.md#L1076) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0355-c008** [prose, lines 1088-1088](../development-pack/modules/28_reports.md#L1088) -- **Visible table headers:**
- [ ] **e0355-c009** [source-code reference, lines 1089-1097](../development-pack/modules/28_reports.md#L1089) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0355-c010** [prose, lines 1099-1099](../development-pack/modules/28_reports.md#L1099) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0355-c011** [source-code reference, lines 1100-1106](../development-pack/modules/28_reports.md#L1100) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0355-c012** [prose, lines 1108-1108](../development-pack/modules/28_reports.md#L1108) -- **Displayed data/value expressions:**
- [ ] **e0355-c013** [source-code reference, lines 1109-1121](../development-pack/modules/28_reports.md#L1109) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0374: `app/Http/Requests/Api/SavedReport/StoreSavedReportRequest.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0374). Complete every clause below before closing this section in the ledger.

- [ ] **e0374-c001** [source-code reference, lines 1130-1169](../development-pack/modules/28_reports.md#L1130) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0375: `app/Http/Requests/Api/SavedReport/UpdateSavedReportRequest.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0375). Complete every clause below before closing this section in the ledger.

- [ ] **e0375-c001** [source-code reference, lines 1178-1217](../development-pack/modules/28_reports.md#L1178) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0417: `app/Http/Controllers/Reports/AnalyticsReportController.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0417). Complete every clause below before closing this section in the ledger.

- [ ] **e0417-c001** [source-code reference, lines 1226-1238](../development-pack/modules/28_reports.md#L1226) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0418: `app/Http/Controllers/Reports/BatchExpiryReportController.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0418). Complete every clause below before closing this section in the ledger.

- [ ] **e0418-c001** [source-code reference, lines 1247-1259](../development-pack/modules/28_reports.md#L1247) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0419: `app/Http/Controllers/Reports/ReportBuilderController.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0419). Complete every clause below before closing this section in the ledger.

- [ ] **e0419-c001** [source-code reference, lines 1268-1334](../development-pack/modules/28_reports.md#L1268) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0420: `app/Http/Controllers/Reports/ReportController.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0420). Complete every clause below before closing this section in the ledger.

- [ ] **e0420-c001** [source-code reference, lines 1343-1372](../development-pack/modules/28_reports.md#L1343) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0421: `app/Http/Controllers/Reports/ReportScheduleController.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0421). Complete every clause below before closing this section in the ledger.

- [ ] **e0421-c001** [source-code reference, lines 1381-1400](../development-pack/modules/28_reports.md#L1381) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0429: Contract appendix `app/Services/ReportDataService.php:40-175`

Source: [exact contract](../development-pack/modules/28_reports.md#e0429). Complete every clause below before closing this section in the ledger.

- [ ] **e0429-c001** [source-code reference, lines 1409-1546](../development-pack/modules/28_reports.md#L1409) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0430: Contract appendix `app/Services/ReportDataService.php:245-300`

Source: [exact contract](../development-pack/modules/28_reports.md#e0430). Complete every clause below before closing this section in the ledger.

- [ ] **e0430-c001** [source-code reference, lines 1555-1612](../development-pack/modules/28_reports.md#L1555) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0431: Contract appendix `app/Models/ReportSchedule.php:25-75`

Source: [exact contract](../development-pack/modules/28_reports.md#e0431). Complete every clause below before closing this section in the ledger.

- [ ] **e0431-c001** [source-code reference, lines 1621-1673](../development-pack/modules/28_reports.md#L1621) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0435: Contract appendix `routes/web/reports.php:1-60`

Source: [exact contract](../development-pack/modules/28_reports.md#e0435). Complete every clause below before closing this section in the ledger.

- [ ] **e0435-c001** [source-code reference, lines 1682-1743](../development-pack/modules/28_reports.md#L1682) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0447: `app/Services/Reports/ReportPeriod.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0447). Complete every clause below before closing this section in the ledger.

- [ ] **e0447-c001** [source-code reference, lines 1753-1838](../development-pack/modules/28_reports.md#L1753) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0448: `app/Services/Reports/ReportExporter.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0448). Complete every clause below before closing this section in the ledger.

- [ ] **e0448-c001** [source-code reference, lines 1848-2028](../development-pack/modules/28_reports.md#L1848) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0451: Complete source contract `app/Services/ReportDataService.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0451). Complete every clause below before closing this section in the ledger.

- [ ] **e0451-c001** [source-code reference, lines 2037-2742](../development-pack/modules/28_reports.md#L2037) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0460: Supplemental complete source `app/Http/Controllers/Reports/ReportScheduleController.php`

Source: [exact contract](../development-pack/modules/28_reports.md#e0460). Complete every clause below before closing this section in the ledger.

- [ ] **e0460-c001** [source-code reference, lines 2751-2903](../development-pack/modules/28_reports.md#L2751) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0465: e0465

Source: [exact contract](../development-pack/modules/28_reports.md#e0465). Complete every clause below before closing this section in the ledger.

- [ ] **e0465-c001** [prose, lines 2912-2912](../development-pack/modules/28_reports.md#L2912) -- Source resources/js/Components/Reports/ExportMenu.vue:9-34,43-50.
- [ ] **e0465-c002** [statement, lines 2914-2914](../development-pack/modules/28_reports.md#L2914) -- - Props routeName:String required; params:Object default{}; group:String defaultnull; size:String defaultsm; formatParam:String defaultexport.
- [ ] **e0465-c003** [statement, lines 2915-2915](../development-pack/modules/28_reports.md#L2915) -- - Fixed formats csv/xlsx/pdf. Href query copies params, assigns &#91;formatParam&#93;, adds group only when supplied. Named route generator creates ordinary download anchors, NOT Inertia mutation.
- [ ] **e0465-c004** [statement, lines 2916-2916](../development-pack/modules/28_reports.md#L2916) -- - Standard report uses ?export=, saved report download can supply formatParam='format'. Alternate breakdown e.g.category is ?group=.
- [ ] **e0465-c005** [statement, lines 2917-2917](../development-pack/modules/28_reports.md#L2917) -- - No new business form field/server validator here. Parent decides permission and valid params; endpoint validates export.
- [ ] **e0465-c006** [statement, lines 2918-2918](../development-pack/modules/28_reports.md#L2918) -- - Acceptance: current filters preserved, format query key correct, alternate grouping retained, forbidden source denied on direct download.

## modules/29_activity_log.md

### e0297: `resources/js/Pages/Admin/ActivityLog/Index.vue`

Source: [exact contract](../development-pack/modules/29_activity_log.md#e0297). Complete every clause below before closing this section in the ledger.

- [ ] **e0297-c001** [prose, lines 83-83](../development-pack/modules/29_activity_log.md#L83) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0297-c002** [statement, lines 84-84](../development-pack/modules/29_activity_log.md#L84) -- - resources/js/Pages/Admin/ActivityLog/Index.vue:205: &lt;input id="search" v-model="search" type="text" :placeholder="t('admin.activityLog.searchPlaceholder')" /&gt;
- [ ] **e0297-c003** [statement, lines 85-85](../development-pack/modules/29_activity_log.md#L85) -- - resources/js/Pages/Admin/ActivityLog/Index.vue:218: &lt;select id="user_id" v-model="user_id"&gt;
- [ ] **e0297-c004** [statement, lines 86-86](../development-pack/modules/29_activity_log.md#L86) -- - resources/js/Pages/Admin/ActivityLog/Index.vue:227: &lt;select id="category" v-model="category"&gt;
- [ ] **e0297-c005** [statement, lines 87-87](../development-pack/modules/29_activity_log.md#L87) -- - resources/js/Pages/Admin/ActivityLog/Index.vue:236: &lt;select id="action" v-model="action"&gt;
- [ ] **e0297-c006** [statement, lines 88-88](../development-pack/modules/29_activity_log.md#L88) -- - resources/js/Pages/Admin/ActivityLog/Index.vue:245: &lt;select id="subject_type" v-model="subject_type"&gt;
- [ ] **e0297-c007** [statement, lines 89-89](../development-pack/modules/29_activity_log.md#L89) -- - resources/js/Pages/Admin/ActivityLog/Index.vue:254: &lt;input id="date_from" v-model="date_from" type="date" /&gt;
- [ ] **e0297-c008** [statement, lines 90-90](../development-pack/modules/29_activity_log.md#L90) -- - resources/js/Pages/Admin/ActivityLog/Index.vue:260: &lt;input id="date_to" v-model="date_to" type="date" /&gt;
- [ ] **e0297-c009** [prose, lines 92-92](../development-pack/modules/29_activity_log.md#L92) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0297-c010** [source-code reference, lines 93-102](../development-pack/modules/29_activity_log.md#L93) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0297-c011** [prose, lines 104-104](../development-pack/modules/29_activity_log.md#L104) -- **Visible table headers:**
- [ ] **e0297-c012** [source-code reference, lines 105-109](../development-pack/modules/29_activity_log.md#L105) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0297-c013** [prose, lines 111-111](../development-pack/modules/29_activity_log.md#L111) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0297-c014** [source-code reference, lines 112-126](../development-pack/modules/29_activity_log.md#L112) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0297-c015** [prose, lines 128-128](../development-pack/modules/29_activity_log.md#L128) -- **Displayed data/value expressions:**
- [ ] **e0297-c016** [source-code reference, lines 129-150](../development-pack/modules/29_activity_log.md#L129) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0384: `app/Http/Controllers/Admin/ActivityLogController.php`

Source: [exact contract](../development-pack/modules/29_activity_log.md#e0384). Complete every clause below before closing this section in the ledger.

- [ ] **e0384-c001** [source-code reference, lines 159-169](../development-pack/modules/29_activity_log.md#L159) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0508: `app/Enums/SecurityEvent.php`

Source: [exact contract](../development-pack/modules/29_activity_log.md#e0508). Complete every clause below before closing this section in the ledger.

- [ ] **e0508-c001** [prose, lines 179-179](../development-pack/modules/29_activity_log.md#L179) -- Source evidence. SHA-256: 7de3802c52d5d8006d54d732c356d00ab5edf2b6865bdaa86fb916044bf7969a.
- [ ] **e0508-c002** [source-code reference, lines 181-274](../development-pack/modules/29_activity_log.md#L181) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/30_users.md

### e0303: `resources/js/Pages/Admin/Users/Create.vue`

Source: [exact contract](../development-pack/modules/30_users.md#e0303). Complete every clause below before closing this section in the ledger.

- [ ] **e0303-c001** [prose, lines 94-94](../development-pack/modules/30_users.md#L94) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0303-c002** [statement, lines 95-95](../development-pack/modules/30_users.md#L95) -- - resources/js/Pages/Admin/Users/Create.vue:68: &lt;input id="name" v-model="form.name" type="text" required autofocus autocomplete="name" /&gt;
- [ ] **e0303-c003** [statement, lines 96-96](../development-pack/modules/30_users.md#L96) -- - resources/js/Pages/Admin/Users/Create.vue:83: &lt;input id="email" v-model="form.email" type="email" required autocomplete="username" /&gt;
- [ ] **e0303-c004** [statement, lines 97-97](../development-pack/modules/30_users.md#L97) -- - resources/js/Pages/Admin/Users/Create.vue:97: &lt;input id="password" v-model="form.password" type="password" required autocomplete="new-password" /&gt;
- [ ] **e0303-c005** [statement, lines 98-98](../development-pack/modules/30_users.md#L98) -- - resources/js/Pages/Admin/Users/Create.vue:112: &lt;input id="password_confirmation" v-model="form.password_confirmation" type="password" required autocomplete="new-password" /&gt;
- [ ] **e0303-c006** [statement, lines 99-99](../development-pack/modules/30_users.md#L99) -- - resources/js/Pages/Admin/Users/Create.vue:126: &lt;select id="role" v-model="form.role" required &gt;
- [ ] **e0303-c007** [statement, lines 100-100](../development-pack/modules/30_users.md#L100) -- - resources/js/Pages/Admin/Users/Create.vue:151: &lt;input type="checkbox" :value="role.id" v-model="form.role_ids" /&gt;
- [ ] **e0303-c008** [prose, lines 102-102](../development-pack/modules/30_users.md#L102) -- **Form initial state/defaults:**
- [ ] **e0303-c009** [source-code reference, lines 103-112](../development-pack/modules/30_users.md#L103) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0303-c010** [prose, lines 114-114](../development-pack/modules/30_users.md#L114) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0303-c011** [source-code reference, lines 115-119](../development-pack/modules/30_users.md#L115) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0303-c012** [prose, lines 121-121](../development-pack/modules/30_users.md#L121) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0303-c013** [source-code reference, lines 122-124](../development-pack/modules/30_users.md#L122) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0303-c014** [prose, lines 126-126](../development-pack/modules/30_users.md#L126) -- **Displayed data/value expressions:**
- [ ] **e0303-c015** [source-code reference, lines 127-135](../development-pack/modules/30_users.md#L127) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0304: `resources/js/Pages/Admin/Users/Edit.vue`

Source: [exact contract](../development-pack/modules/30_users.md#e0304). Complete every clause below before closing this section in the ledger.

- [ ] **e0304-c001** [prose, lines 145-145](../development-pack/modules/30_users.md#L145) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0304-c002** [statement, lines 146-146](../development-pack/modules/30_users.md#L146) -- - resources/js/Pages/Admin/Users/Edit.vue:68: &lt;input id="name" v-model="form.name" type="text" required autofocus /&gt;
- [ ] **e0304-c003** [statement, lines 147-147](../development-pack/modules/30_users.md#L147) -- - resources/js/Pages/Admin/Users/Edit.vue:82: &lt;input id="email" v-model="form.email" type="email" required /&gt;
- [ ] **e0304-c004** [statement, lines 148-148](../development-pack/modules/30_users.md#L148) -- - resources/js/Pages/Admin/Users/Edit.vue:95: &lt;input id="password" v-model="form.password" type="password" autocomplete="new-password" /&gt;
- [ ] **e0304-c005** [statement, lines 149-149](../development-pack/modules/30_users.md#L149) -- - resources/js/Pages/Admin/Users/Edit.vue:111: &lt;input id="password_confirmation" v-model="form.password_confirmation" type="password" autocomplete="new-password" /&gt;
- [ ] **e0304-c006** [statement, lines 150-150](../development-pack/modules/30_users.md#L150) -- - resources/js/Pages/Admin/Users/Edit.vue:124: &lt;select id="role" v-model="form.role" required &gt;
- [ ] **e0304-c007** [statement, lines 151-151](../development-pack/modules/30_users.md#L151) -- - resources/js/Pages/Admin/Users/Edit.vue:154: &lt;input type="checkbox" :value="role.id" v-model="form.role_ids" /&gt;
- [ ] **e0304-c008** [prose, lines 153-153](../development-pack/modules/30_users.md#L153) -- **Form initial state/defaults:**
- [ ] **e0304-c009** [source-code reference, lines 154-163](../development-pack/modules/30_users.md#L154) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0304-c010** [prose, lines 165-165](../development-pack/modules/30_users.md#L165) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0304-c011** [source-code reference, lines 166-171](../development-pack/modules/30_users.md#L166) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0304-c012** [prose, lines 173-173](../development-pack/modules/30_users.md#L173) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0304-c013** [source-code reference, lines 174-176](../development-pack/modules/30_users.md#L174) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0304-c014** [prose, lines 178-178](../development-pack/modules/30_users.md#L178) -- **Displayed data/value expressions:**
- [ ] **e0304-c015** [source-code reference, lines 179-188](../development-pack/modules/30_users.md#L179) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0305: `resources/js/Pages/Admin/Users/Index.vue`

Source: [exact contract](../development-pack/modules/30_users.md#e0305). Complete every clause below before closing this section in the ledger.

- [ ] **e0305-c001** [prose, lines 198-199](../development-pack/modules/30_users.md#L198) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0305-c002** [prose, lines 201-201](../development-pack/modules/30_users.md#L201) -- **Visible table headers:**
- [ ] **e0305-c003** [source-code reference, lines 202-207](../development-pack/modules/30_users.md#L202) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0305-c004** [prose, lines 209-209](../development-pack/modules/30_users.md#L209) -- **Displayed data/value expressions:**
- [ ] **e0305-c005** [source-code reference, lines 210-216](../development-pack/modules/30_users.md#L210) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0306: `resources/js/Pages/Admin/Users/Show.vue`

Source: [exact contract](../development-pack/modules/30_users.md#e0306). Complete every clause below before closing this section in the ledger.

- [ ] **e0306-c001** [prose, lines 226-226](../development-pack/modules/30_users.md#L226) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0306-c002** [statement, lines 227-227](../development-pack/modules/30_users.md#L227) -- - resources/js/Pages/Admin/Users/Show.vue:131: &lt;input id="permission-search" v-model="permissionSearch" type="search" /&gt;
- [ ] **e0306-c003** [prose, lines 229-229](../development-pack/modules/30_users.md#L229) -- **Form initial state/defaults:**
- [ ] **e0306-c004** [source-code reference, lines 230-232](../development-pack/modules/30_users.md#L230) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0306-c005** [prose, lines 234-234](../development-pack/modules/30_users.md#L234) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0306-c006** [source-code reference, lines 235-246](../development-pack/modules/30_users.md#L235) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0306-c007** [prose, lines 248-248](../development-pack/modules/30_users.md#L248) -- **Displayed data/value expressions:**
- [ ] **e0306-c008** [source-code reference, lines 249-260](../development-pack/modules/30_users.md#L249) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0370: `app/Http/Requests/Admin/User/StoreUserRequest.php`

Source: [exact contract](../development-pack/modules/30_users.md#e0370). Complete every clause below before closing this section in the ledger.

- [ ] **e0370-c001** [source-code reference, lines 269-304](../development-pack/modules/30_users.md#L269) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0371: `app/Http/Requests/Admin/User/UpdateUserRequest.php`

Source: [exact contract](../development-pack/modules/30_users.md#e0371). Complete every clause below before closing this section in the ledger.

- [ ] **e0371-c001** [source-code reference, lines 313-352](../development-pack/modules/30_users.md#L313) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0376: `app/Http/Requests/Api/User/StoreUserRequest.php`

Source: [exact contract](../development-pack/modules/30_users.md#e0376). Complete every clause below before closing this section in the ledger.

- [ ] **e0376-c001** [source-code reference, lines 361-399](../development-pack/modules/30_users.md#L361) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0377: `app/Http/Requests/Api/User/UpdateUserRequest.php`

Source: [exact contract](../development-pack/modules/30_users.md#e0377). Complete every clause below before closing this section in the ledger.

- [ ] **e0377-c001** [source-code reference, lines 408-449](../development-pack/modules/30_users.md#L408) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0394: `app/Http/Controllers/Admin/UserController.php`

Source: [exact contract](../development-pack/modules/30_users.md#e0394). Complete every clause below before closing this section in the ledger.

- [ ] **e0394-c001** [source-code reference, lines 458-477](../development-pack/modules/30_users.md#L458) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0402: `app/Http/Controllers/Auth/RegisteredUserController.php`

Source: [exact contract](../development-pack/modules/30_users.md#e0402). Complete every clause below before closing this section in the ledger.

- [ ] **e0402-c001** [source-code reference, lines 486-497](../development-pack/modules/30_users.md#L486) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0450: `app/Services/UserManagementService.php`

Source: [exact contract](../development-pack/modules/30_users.md#e0450). Complete every clause below before closing this section in the ledger.

- [ ] **e0450-c001** [source-code reference, lines 507-650](../development-pack/modules/30_users.md#L507) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0450-c002** [prose, lines 652-652](../development-pack/modules/30_users.md#L652) -- Portal invitation owner is app/Services/Portal/PortalInvitationService.php (included below); customer access ownership is in Portal controllers/middleware, not an inferred PortalAccessServic...

## modules/31_roles_permissions.md

### e0092: e0092

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0092). Complete every clause below before closing this section in the ledger.

- [ ] **e0092-c001** [prose, lines 96-96](../development-pack/modules/31_roles_permissions.md#L96) -- Laravel resource declarations expand conventional index/create/store/show/edit/update/destroy verbs; only/except restrictions below are authoritative. Parent web group middleware also applie...
- [ ] **e0092-c002** [prose, lines 98-98](../development-pack/modules/31_roles_permissions.md#L98) -- Source routes/web/inventory.php:34
- [ ] **e0092-c003** [source-code reference, lines 100-267](../development-pack/modules/31_roles_permissions.md#L100) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0092-c004** [prose, lines 269-269](../development-pack/modules/31_roles_permissions.md#L269) -- Source routes/web/cycle-counts.php:16
- [ ] **e0092-c005** [source-code reference, lines 271-280](../development-pack/modules/31_roles_permissions.md#L271) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0229: e0229

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0229). Complete every clause below before closing this section in the ledger.

- [ ] **e0229-c001** [prose, lines 290-290](../development-pack/modules/31_roles_permissions.md#L290) -- These are source web routes. Rebuild logical commands, not Laravel URLs blindly. Authenticated route context and service checks supplement middleware.

### e0274: e0274

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0274). Complete every clause below before closing this section in the ledger.

- [ ] **e0274-c001** [prose, lines 301-301](../development-pack/modules/31_roles_permissions.md#L301) -- Paths below are source routes; page-local links/actions and exact named routes are in catalog. Authentication is inherited from routes/web.php except installer, guest auth and portal guard. ...
- [ ] **e0274-c002** [table row, lines 303-303](../development-pack/modules/31_roles_permissions.md#L303) -- Page group (all Vue files in group inventoried)  /  Entry/CRUD routes  /  Access
- [ ] **e0274-c003** [table row, lines 305-305](../development-pack/modules/31_roles_permissions.md#L305) -- Dashboard.vue  /  /dashboard;PATCH /settings/dashboard-widgets  /  auth+verified dashboard;per-data permissions;own widget preferences
- [ ] **e0274-c004** [table row, lines 306-306](../development-pack/modules/31_roles_permissions.md#L306) -- Auth Login/Register/Forgot/Reset  /  /login,/register,/forgot-password,/reset-password/{token}  /  guest;validation/throttle/token
- [ ] **e0274-c005** [table row, lines 307-307](../development-pack/modules/31_roles_permissions.md#L307) -- Auth Confirm/Verify/2FA  /  /confirm-password,/verify-email,/email/verification-notification,/two-factor-challenge,/settings/two-factor/setup,enable,disable  /  auth;signed verification;2FA/...
- [ ] **e0274-c006** [table row, lines 308-308](../development-pack/modules/31_roles_permissions.md#L308) -- Profile/Edit and 3 partials  /  GET/PATCH/DELETE /profile;PUT /password  /  authenticated self/current-password guard
- [ ] **e0274-c007** [table row, lines 309-309](../development-pack/modules/31_roles_permissions.md#L309) -- Admin/Users Index/Create/Edit/Show  /  /users,/users/create,/users/{user},/users/{user}/edit  /  view_users/create_users/edit_users/delete_users by operation
- [ ] **e0274-c008** [table row, lines 310-310](../development-pack/modules/31_roles_permissions.md#L310) -- Admin/Roles Index/Create/Edit/Show  /  /roles,/roles/create,/roles/{role},/roles/{role}/edit  /  view_roles/create_roles/edit_roles/delete_roles plus protection/org checks
- [ ] **e0274-c009** [table row, lines 311-311](../development-pack/modules/31_roles_permissions.md#L311) -- Settings/Index  /  /settings  /  any authenticated user;hub hides admin destinations
- [ ] **e0274-c010** [table row, lines 312-312](../development-pack/modules/31_roles_permissions.md#L312) -- Settings/Organization/Index  /  /settings/organization;logo/general/regional/approvals/portal subactions  /  view_settings;changes manage_organization
- [ ] **e0274-c011** [table row, lines 313-313](../development-pack/modules/31_roles_permissions.md#L313) -- Settings/Account/Index  /  /settings/account;profile/password/notifications/preferences/locale subactions  /  authenticated self
- [ ] **e0274-c012** [table row, lines 314-314](../development-pack/modules/31_roles_permissions.md#L314) -- Settings/Email and 2 settings partials  /  /settings/email,/settings/email/test;account notifications endpoint  /  manage_organization for email;own preference update
- [ ] **e0274-c013** [table row, lines 315-315](../development-pack/modules/31_roles_permissions.md#L315) -- Settings/ApiTokens/Index  /  /settings/api-tokens;DELETE /{tokenId}  /  self;grant only held abilities;organization-token ownership
- [ ] **e0274-c014** [table row, lines 316-316](../development-pack/modules/31_roles_permissions.md#L316) -- Settings/Shipping  /  /settings/shipping;webhook-token rotation  /  manage_organization
- [ ] **e0274-c015** [table row, lines 317-317](../development-pack/modules/31_roles_permissions.md#L317) -- Settings/Storage  /  /settings/storage;POST /check  /  StorageAdministration::canManage;not merely authenticated
- [ ] **e0274-c016** [table row, lines 318-318](../development-pack/modules/31_roles_permissions.md#L318) -- Settings/Webhooks Index/Show  /  /webhooks/{webhook};regenerate-secret/test;webhook-deliveries/{delivery}/retry  /  manage_organization + owned record
- [ ] **e0274-c017** [table row, lines 319-319](../development-pack/modules/31_roles_permissions.md#L319) -- Notifications/Index  /  /notifications;read/unread/mark-all/delete/clear  /  authenticated own notifications
- [ ] **e0274-c018** [table row, lines 320-320](../development-pack/modules/31_roles_permissions.md#L320) -- Admin/ActivityLog/Index  /  /activity-log;/activity-log/export  /  view_activity_log
- [ ] **e0274-c019** [table row, lines 321-321](../development-pack/modules/31_roles_permissions.md#L321) -- Reports/Index  /  /reports  /  view_reports;cards further source permissions
- [ ] **e0274-c020** [table row, lines 322-322](../development-pack/modules/31_roles_permissions.md#L322) -- Reports InventoryValuation/LowStock/CategoryPerformance/BatchExpiry  /  /reports/inventory-valuation,low-stock,category-performance,batch-expiry  /  view_reports + view_products
- [ ] **e0274-c021** [table row, lines 323-323](../development-pack/modules/31_roles_permissions.md#L323) -- Reports StockMovement  /  /reports/stock-movement  /  view_reports and service warehouse/source constraints
- [ ] **e0274-c022** [table row, lines 324-324](../development-pack/modules/31_roles_permissions.md#L324) -- Reports SalesAnalysis/SalesByLocation/AbcAnalysis  /  /reports/sales-analysis,sales-by-location,abc-analysis  /  view_reports + view_orders
- [ ] **e0274-c023** [table row, lines 325-325](../development-pack/modules/31_roles_permissions.md#L325) -- Reports Receivables  /  /reports/receivables  /  view_reports + view_payments
- [ ] **e0274-c024** [table row, lines 326-326](../development-pack/modules/31_roles_permissions.md#L326) -- Reports DeadStock/InventoryTurnover/ProfitMargin  /  /reports/dead-stock,inventory-turnover,profit-margin  /  view_reports + view_products AND view_orders
- [ ] **e0274-c025** [table row, lines 327-327](../development-pack/modules/31_roles_permissions.md#L327) -- Reports/Builder Index/Create/Edit/Show  /  /reports/builder,/create,/{saved_report},/edit,/preview,/export  /  view_reports;per-source view permission;owner rules for changes/schedules
- [ ] **e0274-c026** [table row, lines 328-328](../development-pack/modules/31_roles_permissions.md#L328) -- ImportExport/Index  /  /import-export;export-products/export-orders/export-users;import-products/import-orders/import-users;templates;downloads/{dataExport}  /  export_data or import_data en...
- [ ] **e0274-c027** [table row, lines 329-329](../development-pack/modules/31_roles_permissions.md#L329) -- Portal Dashboard/Auth/Orders/Returns  /  /portal/{organization}/...;exact routes/portal.php in catalog  /  customer guard;organization enabled;own customer;return delivered-only
- [ ] **e0274-c028** [table row, lines 330-330](../development-pack/modules/31_roles_permissions.md#L330) -- Plugins/Index  /  /plugins;marketplace;upload;activate/deactivate/delete  /  view_plugins;manage_plugins+plugin-admin org for changes
- [ ] **e0274-c029** [table row, lines 331-331](../development-pack/modules/31_roles_permissions.md#L331) -- Admin/Update/Index  /  /admin/update;/check,/perform,/backup,/backups,/restore,DELETE /backup  /  manage_organization+EnsureUpdateAdministrator;additional controller is_admin
- [ ] **e0274-c030** [table row, lines 332-332](../development-pack/modules/31_roles_permissions.md#L332) -- Install Welcome/Requirements/Database/Admin/Complete  /  /install,/requirements,/database,/database/test,/database/install,/admin,/complete  /  installation-state guards;not ordinary staff p...
- [ ] **e0274-c031** [table row, lines 333-333](../development-pack/modules/31_roles_permissions.md#L333) -- Errors/403  /  controller rendered denied GET page  /  denied request, no CRUD
- [ ] **e0274-c032** [table row, lines 334-334](../development-pack/modules/31_roles_permissions.md#L334) -- Tax billing Settings/Invoice and components  /  /p/tax-billing/settings;/orders/{orderId};/issue;/download  /  plugin active;tax-billing.manage;view_orders;issue additionally tax-billing.iss...
- [ ] **e0274-c033** [table row, lines 335-335](../development-pack/modules/31_roles_permissions.md#L335) -- Hello-world plugin sample  /  registered plugin pages/menu via plugin owner  /  plugin activation/registered permission;not promised active in current app

### e0298: `resources/js/Pages/Admin/Roles/Create.vue`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0298). Complete every clause below before closing this section in the ledger.

- [ ] **e0298-c001** [prose, lines 345-345](../development-pack/modules/31_roles_permissions.md#L345) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0298-c002** [statement, lines 346-346](../development-pack/modules/31_roles_permissions.md#L346) -- - resources/js/Pages/Admin/Roles/Create.vue:126: &lt;input id="name" v-model="form.name" type="text" required autofocus :placeholder="t('admin.roles.create.namePlaceholder')" /&gt;
- [ ] **e0298-c003** [statement, lines 347-347](../development-pack/modules/31_roles_permissions.md#L347) -- - resources/js/Pages/Admin/Roles/Create.vue:140: &lt;textarea id="description" v-model="form.description" rows="3" :placeholder="t('admin.roles.create.descriptionPlaceholder')" &gt;
- [ ] **e0298-c004** [statement, lines 348-348](../development-pack/modules/31_roles_permissions.md#L348) -- - resources/js/Pages/Admin/Roles/Create.vue:232: &lt;input type="checkbox" :value="permission.value" v-model="form.permissions" /&gt;
- [ ] **e0298-c005** [prose, lines 350-350](../development-pack/modules/31_roles_permissions.md#L350) -- **Form initial state/defaults:**
- [ ] **e0298-c006** [source-code reference, lines 351-358](../development-pack/modules/31_roles_permissions.md#L351) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0298-c007** [prose, lines 360-360](../development-pack/modules/31_roles_permissions.md#L360) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0298-c008** [source-code reference, lines 361-365](../development-pack/modules/31_roles_permissions.md#L361) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0298-c009** [prose, lines 367-367](../development-pack/modules/31_roles_permissions.md#L367) -- **Displayed data/value expressions:**
- [ ] **e0298-c010** [source-code reference, lines 368-378](../development-pack/modules/31_roles_permissions.md#L368) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0299: `resources/js/Pages/Admin/Roles/Edit.vue`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0299). Complete every clause below before closing this section in the ledger.

- [ ] **e0299-c001** [prose, lines 388-388](../development-pack/modules/31_roles_permissions.md#L388) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0299-c002** [statement, lines 389-389](../development-pack/modules/31_roles_permissions.md#L389) -- - resources/js/Pages/Admin/Roles/Edit.vue:92: &lt;input id="name" v-model="form.name" type="text" :disabled="role.is_system" required /&gt;
- [ ] **e0299-c003** [statement, lines 390-390](../development-pack/modules/31_roles_permissions.md#L390) -- - resources/js/Pages/Admin/Roles/Edit.vue:109: &lt;textarea id="description" v-model="form.description" rows="3" :disabled="role.is_system" &gt;
- [ ] **e0299-c004** [statement, lines 391-391](../development-pack/modules/31_roles_permissions.md#L391) -- - resources/js/Pages/Admin/Roles/Edit.vue:159: &lt;input type="checkbox" :value="permission.value" v-model="form.permissions" /&gt;
- [ ] **e0299-c005** [prose, lines 393-393](../development-pack/modules/31_roles_permissions.md#L393) -- **Form initial state/defaults:**
- [ ] **e0299-c006** [source-code reference, lines 394-400](../development-pack/modules/31_roles_permissions.md#L394) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0299-c007** [prose, lines 402-402](../development-pack/modules/31_roles_permissions.md#L402) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0299-c008** [source-code reference, lines 403-406](../development-pack/modules/31_roles_permissions.md#L403) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0299-c009** [prose, lines 408-408](../development-pack/modules/31_roles_permissions.md#L408) -- **Displayed data/value expressions:**
- [ ] **e0299-c010** [source-code reference, lines 409-417](../development-pack/modules/31_roles_permissions.md#L409) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0300: `resources/js/Pages/Admin/Roles/Index.vue`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0300). Complete every clause below before closing this section in the ledger.

- [ ] **e0300-c001** [prose, lines 427-428](../development-pack/modules/31_roles_permissions.md#L427) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0300-c002** [prose, lines 430-430](../development-pack/modules/31_roles_permissions.md#L430) -- **Displayed data/value expressions:**
- [ ] **e0300-c003** [source-code reference, lines 431-434](../development-pack/modules/31_roles_permissions.md#L431) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0301: `resources/js/Pages/Admin/Roles/Show.vue`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0301). Complete every clause below before closing this section in the ledger.

- [ ] **e0301-c001** [prose, lines 444-445](../development-pack/modules/31_roles_permissions.md#L444) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0301-c002** [prose, lines 447-447](../development-pack/modules/31_roles_permissions.md#L447) -- **Form initial state/defaults:**
- [ ] **e0301-c003** [source-code reference, lines 448-450](../development-pack/modules/31_roles_permissions.md#L448) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0301-c004** [prose, lines 452-452](../development-pack/modules/31_roles_permissions.md#L452) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0301-c005** [source-code reference, lines 453-461](../development-pack/modules/31_roles_permissions.md#L453) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0301-c006** [prose, lines 463-463](../development-pack/modules/31_roles_permissions.md#L463) -- **Displayed data/value expressions:**
- [ ] **e0301-c007** [source-code reference, lines 464-478](../development-pack/modules/31_roles_permissions.md#L464) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0368: `app/Http/Requests/Admin/Role/StoreRoleRequest.php`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0368). Complete every clause below before closing this section in the ledger.

- [ ] **e0368-c001** [source-code reference, lines 487-517](../development-pack/modules/31_roles_permissions.md#L487) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0369: `app/Http/Requests/Admin/Role/UpdateRoleRequest.php`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0369). Complete every clause below before closing this section in the ledger.

- [ ] **e0369-c001** [source-code reference, lines 526-556](../development-pack/modules/31_roles_permissions.md#L526) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0372: `app/Http/Requests/Api/PermissionSet/StorePermissionSetRequest.php`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0372). Complete every clause below before closing this section in the ledger.

- [ ] **e0372-c001** [source-code reference, lines 565-601](../development-pack/modules/31_roles_permissions.md#L565) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0373: `app/Http/Requests/Api/PermissionSet/UpdatePermissionSetRequest.php`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0373). Complete every clause below before closing this section in the ledger.

- [ ] **e0373-c001** [source-code reference, lines 610-643](../development-pack/modules/31_roles_permissions.md#L610) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0391: `app/Http/Controllers/Admin/RoleController.php`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0391). Complete every clause below before closing this section in the ledger.

- [ ] **e0391-c001** [source-code reference, lines 652-668](../development-pack/modules/31_roles_permissions.md#L652) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0454: Complete source contract `app/Enums/Permission.php`

Source: [exact contract](../development-pack/modules/31_roles_permissions.md#e0454). Complete every clause below before closing this section in the ledger.

- [ ] **e0454-c001** [source-code reference, lines 677-1044](../development-pack/modules/31_roles_permissions.md#L677) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/32_auth_account.md

### e0257: e0257

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0257). Complete every clause below before closing this section in the ledger.

- [ ] **e0257-c001** [table row, lines 120-120](../development-pack/modules/32_auth_account.md#L120) -- Screen  /  Exact input shape/default  /  Behavior
- [ ] **e0257-c002** [table row, lines 122-122](../development-pack/modules/32_auth_account.md#L122) -- Login  /  email:'',password:'',remember:false  /  Authenticate, rate-limit, regenerate session, intended dashboard redirect.
- [ ] **e0257-c003** [table row, lines 123-123](../development-pack/modules/32_auth_account.md#L123) -- Register  /  name:'',email:'',password:'',password_confirmation:''  /  Required name max255, valid unique email, confirmed configured-password rule. Do not assume new registration grants org...
- [ ] **e0257-c004** [table row, lines 124-124](../development-pack/modules/32_auth_account.md#L124) -- Forgot  /  email:''  /  Required email; throttled reset mail request.
- [ ] **e0257-c005** [table row, lines 125-125](../development-pack/modules/32_auth_account.md#L125) -- Reset  /  token:props.token,email:props.email,password:'',password_confirmation:''  /  Broker checks token; confirmed new password.
- [ ] **e0257-c006** [table row, lines 126-126](../development-pack/modules/32_auth_account.md#L126) -- Confirm  /  password:''  /  Current-password confirmation session.
- [ ] **e0257-c007** [table row, lines 127-127](../development-pack/modules/32_auth_account.md#L127) -- Verify email  /  no fields  /  Resend signed verification link, logout; signed/throttled verification route.
- [ ] **e0257-c008** [table row, lines 128-128](../development-pack/modules/32_auth_account.md#L128) -- 2FA setup  /  enable code:''; disable password:''  /  QR/secret/recovery codes, valid TOTP enable, current-password disable.
- [ ] **e0257-c009** [table row, lines 129-129](../development-pack/modules/32_auth_account.md#L129) -- 2FA challenge  /  code:'',recovery_code:''  /  TOTP or single-use recovery code, 5/min route throttle.
- [ ] **e0257-c010** [table row, lines 130-130](../development-pack/modules/32_auth_account.md#L130) -- Profile  /  name/email preloaded  /  ProfileUpdateRequest; verification-state effects owned by controller.
- [ ] **e0257-c011** [table row, lines 131-131](../development-pack/modules/32_auth_account.md#L131) -- Password  /  current_password/password/password_confirmation  /  Validate old password and confirmed new password; clear sensitive fields after submission.
- [ ] **e0257-c012** [table row, lines 132-132](../development-pack/modules/32_auth_account.md#L132) -- Delete account  /  password  /  Destructive authenticated action; invalidate session.
- [ ] **e0257-c013** [prose, lines 134-134](../development-pack/modules/32_auth_account.md#L134) -- Evidence: routes/auth.php14-60; routes/web/account.php27-39; AuthenticatedSessionController43-64; TwoFactorController84-132,178-234. Secret encrypted, recovery codes hashed/encrypted. All ei...

### e0307: `resources/js/Pages/Auth/ConfirmPassword.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0307). Complete every clause below before closing this section in the ledger.

- [ ] **e0307-c001** [prose, lines 144-144](../development-pack/modules/32_auth_account.md#L144) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0307-c002** [statement, lines 145-145](../development-pack/modules/32_auth_account.md#L145) -- - resources/js/Pages/Auth/ConfirmPassword.vue:36: &lt;TextInput id="password" type="password" v-model="form.password" required autocomplete="current-password" autofocus /&gt;
- [ ] **e0307-c003** [prose, lines 147-147](../development-pack/modules/32_auth_account.md#L147) -- **Form initial state/defaults:**
- [ ] **e0307-c004** [source-code reference, lines 148-152](../development-pack/modules/32_auth_account.md#L148) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0307-c005** [prose, lines 154-154](../development-pack/modules/32_auth_account.md#L154) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0307-c006** [source-code reference, lines 155-157](../development-pack/modules/32_auth_account.md#L155) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0308: `resources/js/Pages/Auth/ForgotPassword.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0308). Complete every clause below before closing this section in the ledger.

- [ ] **e0308-c001** [prose, lines 167-167](../development-pack/modules/32_auth_account.md#L167) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0308-c002** [statement, lines 168-168](../development-pack/modules/32_auth_account.md#L168) -- - resources/js/Pages/Auth/ForgotPassword.vue:47: &lt;TextInput id="email" type="email" v-model="form.email" required autofocus autocomplete="username" /&gt;
- [ ] **e0308-c003** [prose, lines 170-170](../development-pack/modules/32_auth_account.md#L170) -- **Form initial state/defaults:**
- [ ] **e0308-c004** [source-code reference, lines 171-175](../development-pack/modules/32_auth_account.md#L171) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0308-c005** [prose, lines 177-177](../development-pack/modules/32_auth_account.md#L177) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0308-c006** [source-code reference, lines 178-180](../development-pack/modules/32_auth_account.md#L178) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0308-c007** [prose, lines 182-182](../development-pack/modules/32_auth_account.md#L182) -- **Displayed data/value expressions:**
- [ ] **e0308-c008** [source-code reference, lines 183-185](../development-pack/modules/32_auth_account.md#L183) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0309: `resources/js/Pages/Auth/Login.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0309). Complete every clause below before closing this section in the ledger.

- [ ] **e0309-c001** [prose, lines 195-195](../development-pack/modules/32_auth_account.md#L195) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0309-c002** [statement, lines 196-196](../development-pack/modules/32_auth_account.md#L196) -- - resources/js/Pages/Auth/Login.vue:48: &lt;TextInput id="email" type="email" v-model="form.email" required autofocus autocomplete="username" /&gt;
- [ ] **e0309-c003** [statement, lines 197-197](../development-pack/modules/32_auth_account.md#L197) -- - resources/js/Pages/Auth/Login.vue:64: &lt;TextInput id="password" type="password" v-model="form.password" required autocomplete="current-password" /&gt;
- [ ] **e0309-c004** [statement, lines 198-198](../development-pack/modules/32_auth_account.md#L198) -- - resources/js/Pages/Auth/Login.vue:78: &lt;Checkbox name="remember" v-model:checked="form.remember" /&gt;
- [ ] **e0309-c005** [prose, lines 200-200](../development-pack/modules/32_auth_account.md#L200) -- **Form initial state/defaults:**
- [ ] **e0309-c006** [source-code reference, lines 201-207](../development-pack/modules/32_auth_account.md#L201) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0309-c007** [prose, lines 209-209](../development-pack/modules/32_auth_account.md#L209) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0309-c008** [source-code reference, lines 210-212](../development-pack/modules/32_auth_account.md#L210) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0309-c009** [prose, lines 214-214](../development-pack/modules/32_auth_account.md#L214) -- **Displayed data/value expressions:**
- [ ] **e0309-c010** [source-code reference, lines 215-217](../development-pack/modules/32_auth_account.md#L215) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0310: `resources/js/Pages/Auth/Register.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0310). Complete every clause below before closing this section in the ledger.

- [ ] **e0310-c001** [prose, lines 227-227](../development-pack/modules/32_auth_account.md#L227) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0310-c002** [statement, lines 228-228](../development-pack/modules/32_auth_account.md#L228) -- - resources/js/Pages/Auth/Register.vue:35: &lt;TextInput id="name" type="text" v-model="form.name" required autofocus autocomplete="name" /&gt;
- [ ] **e0310-c003** [statement, lines 229-229](../development-pack/modules/32_auth_account.md#L229) -- - resources/js/Pages/Auth/Register.vue:51: &lt;TextInput id="email" type="email" v-model="form.email" required autocomplete="username" /&gt;
- [ ] **e0310-c004** [statement, lines 230-230](../development-pack/modules/32_auth_account.md#L230) -- - resources/js/Pages/Auth/Register.vue:66: &lt;TextInput id="password" type="password" v-model="form.password" required autocomplete="new-password" /&gt;
- [ ] **e0310-c005** [statement, lines 231-231](../development-pack/modules/32_auth_account.md#L231) -- - resources/js/Pages/Auth/Register.vue:84: &lt;TextInput id="password_confirmation" type="password" v-model="form.password_confirmation" required autocomplete="new-password" /&gt;
- [ ] **e0310-c006** [prose, lines 233-233](../development-pack/modules/32_auth_account.md#L233) -- **Form initial state/defaults:**
- [ ] **e0310-c007** [source-code reference, lines 234-241](../development-pack/modules/32_auth_account.md#L234) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0310-c008** [prose, lines 243-243](../development-pack/modules/32_auth_account.md#L243) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0310-c009** [source-code reference, lines 244-246](../development-pack/modules/32_auth_account.md#L244) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0311: `resources/js/Pages/Auth/ResetPassword.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0311). Complete every clause below before closing this section in the ledger.

- [ ] **e0311-c001** [prose, lines 256-256](../development-pack/modules/32_auth_account.md#L256) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0311-c002** [statement, lines 257-257](../development-pack/modules/32_auth_account.md#L257) -- - resources/js/Pages/Auth/ResetPassword.vue:46: &lt;TextInput id="email" type="email" v-model="form.email" required autofocus autocomplete="username" /&gt;
- [ ] **e0311-c003** [statement, lines 258-258](../development-pack/modules/32_auth_account.md#L258) -- - resources/js/Pages/Auth/ResetPassword.vue:62: &lt;TextInput id="password" type="password" v-model="form.password" required autocomplete="new-password" /&gt;
- [ ] **e0311-c004** [statement, lines 259-259](../development-pack/modules/32_auth_account.md#L259) -- - resources/js/Pages/Auth/ResetPassword.vue:80: &lt;TextInput id="password_confirmation" type="password" v-model="form.password_confirmation" required autocomplete="new-password" /&gt;
- [ ] **e0311-c005** [prose, lines 261-261](../development-pack/modules/32_auth_account.md#L261) -- **Form initial state/defaults:**
- [ ] **e0311-c006** [source-code reference, lines 262-269](../development-pack/modules/32_auth_account.md#L262) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0311-c007** [prose, lines 271-271](../development-pack/modules/32_auth_account.md#L271) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0311-c008** [source-code reference, lines 272-274](../development-pack/modules/32_auth_account.md#L272) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0312: `resources/js/Pages/Auth/TwoFactorChallenge.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0312). Complete every clause below before closing this section in the ledger.

- [ ] **e0312-c001** [prose, lines 284-284](../development-pack/modules/32_auth_account.md#L284) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0312-c002** [statement, lines 285-285](../development-pack/modules/32_auth_account.md#L285) -- - resources/js/Pages/Auth/TwoFactorChallenge.vue:55: &lt;TextInput id="code" v-model="form.code" type="text" required maxlength="6" :placeholder="t('auth.twoFactorChallenge.codePlaceholder')" a...
- [ ] **e0312-c003** [statement, lines 286-286](../development-pack/modules/32_auth_account.md#L286) -- - resources/js/Pages/Auth/TwoFactorChallenge.vue:72: &lt;TextInput id="recovery_code" v-model="form.recovery_code" type="text" required :placeholder="t('auth.twoFactorChallenge.recoveryPlacehol...
- [ ] **e0312-c004** [prose, lines 288-288](../development-pack/modules/32_auth_account.md#L288) -- **Form initial state/defaults:**
- [ ] **e0312-c005** [source-code reference, lines 289-294](../development-pack/modules/32_auth_account.md#L289) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0312-c006** [prose, lines 296-296](../development-pack/modules/32_auth_account.md#L296) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0312-c007** [source-code reference, lines 297-300](../development-pack/modules/32_auth_account.md#L297) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0312-c008** [prose, lines 302-302](../development-pack/modules/32_auth_account.md#L302) -- **Displayed data/value expressions:**
- [ ] **e0312-c009** [source-code reference, lines 303-305](../development-pack/modules/32_auth_account.md#L303) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0313: `resources/js/Pages/Auth/TwoFactorSetup.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0313). Complete every clause below before closing this section in the ledger.

- [ ] **e0313-c001** [prose, lines 315-315](../development-pack/modules/32_auth_account.md#L315) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0313-c002** [statement, lines 316-316](../development-pack/modules/32_auth_account.md#L316) -- - resources/js/Pages/Auth/TwoFactorSetup.vue:91: &lt;input id="password" v-model="disableForm.password" type="password" required autocomplete="current-password" /&gt;
- [ ] **e0313-c003** [statement, lines 317-317](../development-pack/modules/32_auth_account.md#L317) -- - resources/js/Pages/Auth/TwoFactorSetup.vue:140: &lt;input id="code" v-model="enableForm.code" type="text" required maxlength="6" :placeholder="t('auth.twoFactorChallenge.codePlaceholder')" au...
- [ ] **e0313-c004** [prose, lines 319-319](../development-pack/modules/32_auth_account.md#L319) -- **Form initial state/defaults:**
- [ ] **e0313-c005** [source-code reference, lines 320-327](../development-pack/modules/32_auth_account.md#L320) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0313-c006** [prose, lines 329-329](../development-pack/modules/32_auth_account.md#L329) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0313-c007** [source-code reference, lines 330-334](../development-pack/modules/32_auth_account.md#L330) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0313-c008** [prose, lines 336-336](../development-pack/modules/32_auth_account.md#L336) -- **Displayed data/value expressions:**
- [ ] **e0313-c009** [source-code reference, lines 337-346](../development-pack/modules/32_auth_account.md#L337) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0314: `resources/js/Pages/Auth/VerifyEmail.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0314). Complete every clause below before closing this section in the ledger.

- [ ] **e0314-c001** [prose, lines 356-357](../development-pack/modules/32_auth_account.md#L356) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0314-c002** [prose, lines 359-359](../development-pack/modules/32_auth_account.md#L359) -- **Form initial state/defaults:**
- [ ] **e0314-c003** [source-code reference, lines 360-362](../development-pack/modules/32_auth_account.md#L360) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0314-c004** [prose, lines 364-364](../development-pack/modules/32_auth_account.md#L364) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0314-c005** [source-code reference, lines 365-368](../development-pack/modules/32_auth_account.md#L365) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0335: `resources/js/Pages/Profile/Edit.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0335). Complete every clause below before closing this section in the ledger.

- [ ] **e0335-c001** [prose, lines 378-379](../development-pack/modules/32_auth_account.md#L378) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.

### e0336: `resources/js/Pages/Profile/Partials/DeleteUserForm.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0336). Complete every clause below before closing this section in the ledger.

- [ ] **e0336-c001** [prose, lines 389-389](../development-pack/modules/32_auth_account.md#L389) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0336-c002** [statement, lines 390-390](../development-pack/modules/32_auth_account.md#L390) -- - resources/js/Pages/Profile/Partials/DeleteUserForm.vue:80: &lt;TextInput id="password" ref="passwordInput" v-model="form.password" type="password" :placeholder="t('profile.deleteAccount.passw...
- [ ] **e0336-c003** [prose, lines 392-392](../development-pack/modules/32_auth_account.md#L392) -- **Form initial state/defaults:**
- [ ] **e0336-c004** [source-code reference, lines 393-397](../development-pack/modules/32_auth_account.md#L393) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0336-c005** [prose, lines 399-399](../development-pack/modules/32_auth_account.md#L399) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0336-c006** [source-code reference, lines 400-404](../development-pack/modules/32_auth_account.md#L400) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0337: `resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0337). Complete every clause below before closing this section in the ledger.

- [ ] **e0337-c001** [prose, lines 414-414](../development-pack/modules/32_auth_account.md#L414) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0337-c002** [statement, lines 415-415](../development-pack/modules/32_auth_account.md#L415) -- - resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue:55: &lt;TextInput id="current_password" ref="currentPasswordInput" v-model="form.current_password" type="password" autocomplete="cur...
- [ ] **e0337-c003** [statement, lines 416-416](../development-pack/modules/32_auth_account.md#L416) -- - resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue:73: &lt;TextInput id="password" ref="passwordInput" v-model="form.password" type="password" autocomplete="new-password" /&gt;
- [ ] **e0337-c004** [statement, lines 417-417](../development-pack/modules/32_auth_account.md#L417) -- - resources/js/Pages/Profile/Partials/UpdatePasswordForm.vue:91: &lt;TextInput id="password_confirmation" v-model="form.password_confirmation" type="password" autocomplete="new-password" /&gt;
- [ ] **e0337-c005** [prose, lines 419-419](../development-pack/modules/32_auth_account.md#L419) -- **Form initial state/defaults:**
- [ ] **e0337-c006** [source-code reference, lines 420-426](../development-pack/modules/32_auth_account.md#L420) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0337-c007** [prose, lines 428-428](../development-pack/modules/32_auth_account.md#L428) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0337-c008** [source-code reference, lines 429-433](../development-pack/modules/32_auth_account.md#L429) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0338: `resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0338). Complete every clause below before closing this section in the ledger.

- [ ] **e0338-c001** [prose, lines 443-443](../development-pack/modules/32_auth_account.md#L443) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0338-c002** [statement, lines 444-444](../development-pack/modules/32_auth_account.md#L444) -- - resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.vue:47: &lt;TextInput id="name" type="text" v-model="form.name" required autofocus autocomplete="name" /&gt;
- [ ] **e0338-c003** [statement, lines 445-445](../development-pack/modules/32_auth_account.md#L445) -- - resources/js/Pages/Profile/Partials/UpdateProfileInformationForm.vue:63: &lt;TextInput id="email" type="email" v-model="form.email" required autocomplete="username" /&gt;
- [ ] **e0338-c004** [prose, lines 447-447](../development-pack/modules/32_auth_account.md#L447) -- **Form initial state/defaults:**
- [ ] **e0338-c005** [source-code reference, lines 448-453](../development-pack/modules/32_auth_account.md#L448) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0356: `resources/js/Pages/Settings/Account/Index.vue`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0356). Complete every clause below before closing this section in the ledger.

- [ ] **e0356-c001** [prose, lines 463-463](../development-pack/modules/32_auth_account.md#L463) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0356-c002** [statement, lines 464-464](../development-pack/modules/32_auth_account.md#L464) -- - resources/js/Pages/Settings/Account/Index.vue:167: &lt;input id="name" :aria-invalid="!!profileForm.errors.name" :aria-describedby="profileForm.errors.name ? 'account-name-error' : undefined"...
- [ ] **e0356-c003** [statement, lines 465-465](../development-pack/modules/32_auth_account.md#L465) -- - resources/js/Pages/Settings/Account/Index.vue:181: &lt;input id="email" :aria-invalid="!!profileForm.errors.email" :aria-describedby="profileForm.errors.email ? 'account-email-error' : undefi...
- [ ] **e0356-c004** [statement, lines 466-466](../development-pack/modules/32_auth_account.md#L466) -- - resources/js/Pages/Settings/Account/Index.vue:216: &lt;input id="current_password" :aria-invalid="!!passwordForm.errors.current_password" :aria-describedby="passwordForm.errors.current_passwo...
- [ ] **e0356-c005** [statement, lines 467-467](../development-pack/modules/32_auth_account.md#L467) -- - resources/js/Pages/Settings/Account/Index.vue:230: &lt;input id="password" :aria-invalid="!!passwordForm.errors.password" :aria-describedby="passwordForm.errors.password ? 'account-password-e...
- [ ] **e0356-c006** [statement, lines 468-468](../development-pack/modules/32_auth_account.md#L468) -- - resources/js/Pages/Settings/Account/Index.vue:244: &lt;input id="password_confirmation" :aria-invalid="!!passwordForm.errors.password_confirmation" :aria-describedby="passwordForm.errors.pass...
- [ ] **e0356-c007** [statement, lines 469-469](../development-pack/modules/32_auth_account.md#L469) -- - resources/js/Pages/Settings/Account/Index.vue:325: &lt;select id="theme" :aria-invalid="!!preferencesForm.errors.theme" :aria-describedby="preferencesForm.errors.theme ? 'account-theme-error'...
- [ ] **e0356-c008** [statement, lines 470-470](../development-pack/modules/32_auth_account.md#L470) -- - resources/js/Pages/Settings/Account/Index.vue:340: &lt;select id="language" :aria-invalid="!!preferencesForm.errors.language" :aria-describedby="preferencesForm.errors.language ? 'account-lan...
- [ ] **e0356-c009** [statement, lines 471-471](../development-pack/modules/32_auth_account.md#L471) -- - resources/js/Pages/Settings/Account/Index.vue:353: &lt;input id="items_per_page" :aria-invalid="!!preferencesForm.errors.items_per_page" :aria-describedby="preferencesForm.errors.items_per_pa...
- [ ] **e0356-c010** [prose, lines 473-473](../development-pack/modules/32_auth_account.md#L473) -- **Form initial state/defaults:**
- [ ] **e0356-c011** [source-code reference, lines 474-498](../development-pack/modules/32_auth_account.md#L474) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0356-c012** [prose, lines 500-500](../development-pack/modules/32_auth_account.md#L500) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0356-c013** [source-code reference, lines 501-506](../development-pack/modules/32_auth_account.md#L501) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0356-c014** [prose, lines 508-508](../development-pack/modules/32_auth_account.md#L508) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0356-c015** [source-code reference, lines 509-519](../development-pack/modules/32_auth_account.md#L509) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0356-c016** [prose, lines 521-521](../development-pack/modules/32_auth_account.md#L521) -- **Displayed data/value expressions:**
- [ ] **e0356-c017** [source-code reference, lines 522-534](../development-pack/modules/32_auth_account.md#L522) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0378: `app/Http/Requests/Auth/LoginRequest.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0378). Complete every clause below before closing this section in the ledger.

- [ ] **e0378-c001** [source-code reference, lines 543-637](../development-pack/modules/32_auth_account.md#L543) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0379: `app/Http/Requests/ProfileUpdateRequest.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0379). Complete every clause below before closing this section in the ledger.

- [ ] **e0379-c001** [source-code reference, lines 646-684](../development-pack/modules/32_auth_account.md#L646) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0383: `app/Http/Controllers/Admin/AccountSettingsController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0383). Complete every clause below before closing this section in the ledger.

- [ ] **e0383-c001** [source-code reference, lines 693-733](../development-pack/modules/32_auth_account.md#L693) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0395: `app/Http/Controllers/Auth/AuthenticatedSessionController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0395). Complete every clause below before closing this section in the ledger.

- [ ] **e0395-c001** [source-code reference, lines 742-747](../development-pack/modules/32_auth_account.md#L742) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0396: `app/Http/Controllers/Auth/ConfirmablePasswordController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0396). Complete every clause below before closing this section in the ledger.

- [ ] **e0396-c001** [source-code reference, lines 756-764](../development-pack/modules/32_auth_account.md#L756) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0398: `app/Http/Controllers/Auth/EmailVerificationPromptController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0398). Complete every clause below before closing this section in the ledger.

- [ ] **e0398-c001** [source-code reference, lines 773-776](../development-pack/modules/32_auth_account.md#L773) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0399: `app/Http/Controllers/Auth/NewPasswordController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0399). Complete every clause below before closing this section in the ledger.

- [ ] **e0399-c001** [source-code reference, lines 785-796](../development-pack/modules/32_auth_account.md#L785) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0400: `app/Http/Controllers/Auth/PasswordController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0400). Complete every clause below before closing this section in the ledger.

- [ ] **e0400-c001** [source-code reference, lines 805-812](../development-pack/modules/32_auth_account.md#L805) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0401: `app/Http/Controllers/Auth/PasswordResetLinkController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0401). Complete every clause below before closing this section in the ledger.

- [ ] **e0401-c001** [source-code reference, lines 821-828](../development-pack/modules/32_auth_account.md#L821) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0403: `app/Http/Controllers/Auth/TwoFactorController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0403). Complete every clause below before closing this section in the ledger.

- [ ] **e0403-c001** [source-code reference, lines 837-868](../development-pack/modules/32_auth_account.md#L837) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0404: `app/Http/Controllers/Auth/VerifyEmailController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0404). Complete every clause below before closing this section in the ledger.

- [ ] **e0404-c001** [source-code reference, lines 877-879](../development-pack/modules/32_auth_account.md#L877) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0416: `app/Http/Controllers/ProfileController.php`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0416). Complete every clause below before closing this section in the ledger.

- [ ] **e0416-c001** [source-code reference, lines 888-898](../development-pack/modules/32_auth_account.md#L888) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0436: Contract appendix `routes/auth.php:1-61`

Source: [exact contract](../development-pack/modules/32_auth_account.md#e0436). Complete every clause below before closing this section in the ledger.

- [ ] **e0436-c001** [source-code reference, lines 907-969](../development-pack/modules/32_auth_account.md#L907) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/33_organization_settings.md

### e0259: e0259

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0259). Complete every clause below before closing this section in the ledger.

- [ ] **e0259-c001** [prose, lines 96-96](../development-pack/modules/33_organization_settings.md#L96) -- Organization general: name required max255; email optional email max255; phone optional max50; address optional string; city/state/country optional max255; zip optional max20. Values preload...
- [ ] **e0259-c002** [prose, lines 98-98](../development-pack/modules/33_organization_settings.md#L98) -- Regional: currency required server-allowed currency(current/configured, UI USD fallback); timezone required timezone:all(UTC); date_format/time_format nullable max50(Y-m-d/H:i). Approval boo...
- [ ] **e0259-c003** [prose, lines 100-100](../development-pack/modules/33_organization_settings.md#L100) -- Account profile: name required max255,email valid unique except self max255. Password: current_password required string; password required string confirmed min8. Notification boolean fields ...
- [ ] **e0259-c004** [prose, lines 102-102](../development-pack/modules/33_organization_settings.md#L102) -- Email provider smtp|phpmail|mailgun|sendgrid(smtp default); from_address required email/from_name required max255. SMTP host string, port integer1..65535(default587), encryption tls|ssl|none...

### e0293: `resources/js/Components/OrganizationSwitcher.vue`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0293). Complete every clause below before closing this section in the ledger.

- [ ] **e0293-c001** [prose, lines 112-113](../development-pack/modules/33_organization_settings.md#L112) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0293-c002** [prose, lines 115-115](../development-pack/modules/33_organization_settings.md#L115) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0293-c003** [source-code reference, lines 116-123](../development-pack/modules/33_organization_settings.md#L116) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0293-c004** [prose, lines 125-125](../development-pack/modules/33_organization_settings.md#L125) -- **Displayed data/value expressions:**
- [ ] **e0293-c005** [source-code reference, lines 126-129](../development-pack/modules/33_organization_settings.md#L126) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0358: `resources/js/Pages/Settings/Email.vue`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0358). Complete every clause below before closing this section in the ledger.

- [ ] **e0358-c001** [prose, lines 139-140](../development-pack/modules/33_organization_settings.md#L139) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0358-c002** [prose, lines 142-142](../development-pack/modules/33_organization_settings.md#L142) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0358-c003** [source-code reference, lines 143-145](../development-pack/modules/33_organization_settings.md#L143) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0359: `resources/js/Pages/Settings/Index.vue`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0359). Complete every clause below before closing this section in the ledger.

- [ ] **e0359-c001** [prose, lines 155-156](../development-pack/modules/33_organization_settings.md#L155) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0359-c002** [prose, lines 158-158](../development-pack/modules/33_organization_settings.md#L158) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0359-c003** [source-code reference, lines 159-178](../development-pack/modules/33_organization_settings.md#L159) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0359-c004** [prose, lines 180-180](../development-pack/modules/33_organization_settings.md#L180) -- **Displayed data/value expressions:**
- [ ] **e0359-c005** [source-code reference, lines 181-185](../development-pack/modules/33_organization_settings.md#L181) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0360: `resources/js/Pages/Settings/Organization/Index.vue`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0360). Complete every clause below before closing this section in the ledger.

- [ ] **e0360-c001** [prose, lines 195-195](../development-pack/modules/33_organization_settings.md#L195) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0360-c002** [statement, lines 196-196](../development-pack/modules/33_organization_settings.md#L196) -- - resources/js/Pages/Settings/Organization/Index.vue:211: &lt;input id="organization-logo" ref="logoInput" type="file" accept="image/png,image/jpeg,image/webp" :disabled="logoForm.processing" @...
- [ ] **e0360-c003** [statement, lines 197-197](../development-pack/modules/33_organization_settings.md#L197) -- - resources/js/Pages/Settings/Organization/Index.vue:229: &lt;input id="name" v-model="generalForm.name" type="text" :disabled="!canManage" /&gt;
- [ ] **e0360-c004** [statement, lines 198-198](../development-pack/modules/33_organization_settings.md#L198) -- - resources/js/Pages/Settings/Organization/Index.vue:240: &lt;input id="email" v-model="generalForm.email" type="email" :disabled="!canManage" /&gt;
- [ ] **e0360-c005** [statement, lines 199-199](../development-pack/modules/33_organization_settings.md#L199) -- - resources/js/Pages/Settings/Organization/Index.vue:251: &lt;input id="phone" v-model="generalForm.phone" type="text" :disabled="!canManage" /&gt;
- [ ] **e0360-c006** [statement, lines 200-200](../development-pack/modules/33_organization_settings.md#L200) -- - resources/js/Pages/Settings/Organization/Index.vue:262: &lt;input id="address" v-model="generalForm.address" type="text" :disabled="!canManage" /&gt;
- [ ] **e0360-c007** [statement, lines 201-201](../development-pack/modules/33_organization_settings.md#L201) -- - resources/js/Pages/Settings/Organization/Index.vue:273: &lt;input id="city" v-model="generalForm.city" type="text" :disabled="!canManage" /&gt;
- [ ] **e0360-c008** [statement, lines 202-202](../development-pack/modules/33_organization_settings.md#L202) -- - resources/js/Pages/Settings/Organization/Index.vue:284: &lt;input id="state" v-model="generalForm.state" type="text" :disabled="!canManage" /&gt;
- [ ] **e0360-c009** [statement, lines 203-203](../development-pack/modules/33_organization_settings.md#L203) -- - resources/js/Pages/Settings/Organization/Index.vue:295: &lt;input id="zip" v-model="generalForm.zip" type="text" :disabled="!canManage" /&gt;
- [ ] **e0360-c010** [statement, lines 204-204](../development-pack/modules/33_organization_settings.md#L204) -- - resources/js/Pages/Settings/Organization/Index.vue:306: &lt;input id="country" v-model="generalForm.country" type="text" :disabled="!canManage" /&gt;
- [ ] **e0360-c011** [statement, lines 205-205](../development-pack/modules/33_organization_settings.md#L205) -- - resources/js/Pages/Settings/Organization/Index.vue:338: &lt;select id="currency" v-model="regionalForm.currency" :disabled="!canManage" &gt;
- [ ] **e0360-c012** [statement, lines 206-206](../development-pack/modules/33_organization_settings.md#L206) -- - resources/js/Pages/Settings/Organization/Index.vue:350: &lt;select id="timezone" v-model="regionalForm.timezone" :disabled="!canManage" &gt;
- [ ] **e0360-c013** [statement, lines 207-207](../development-pack/modules/33_organization_settings.md#L207) -- - resources/js/Pages/Settings/Organization/Index.vue:362: &lt;input id="date_format" v-model="regionalForm.date_format" type="text" :disabled="!canManage" placeholder="Y-m-d" /&gt;
- [ ] **e0360-c014** [statement, lines 208-208](../development-pack/modules/33_organization_settings.md#L208) -- - resources/js/Pages/Settings/Organization/Index.vue:374: &lt;input id="time_format" v-model="regionalForm.time_format" type="text" :disabled="!canManage" placeholder="H:i" /&gt;
- [ ] **e0360-c015** [statement, lines 209-209](../development-pack/modules/33_organization_settings.md#L209) -- - resources/js/Pages/Settings/Organization/Index.vue:408: &lt;input v-model="approvalsForm.purchase_orders_enabled" type="checkbox" :disabled="!canManage" /&gt;
- [ ] **e0360-c016** [statement, lines 210-210](../development-pack/modules/33_organization_settings.md#L210) -- - resources/js/Pages/Settings/Organization/Index.vue:416: &lt;input id="po_threshold" v-model="approvalsForm.purchase_orders_threshold" type="number" min="0" step="0.01" inputmode="decimal" :di...
- [ ] **e0360-c017** [statement, lines 211-211](../development-pack/modules/33_organization_settings.md#L211) -- - resources/js/Pages/Settings/Organization/Index.vue:424: &lt;input v-model="approvalsForm.stock_adjustments_enabled" type="checkbox" :disabled="!canManage" /&gt;
- [ ] **e0360-c018** [statement, lines 212-212](../development-pack/modules/33_organization_settings.md#L212) -- - resources/js/Pages/Settings/Organization/Index.vue:433: &lt;input id="adj_qty_threshold" v-model="approvalsForm.stock_adjustments_quantity_threshold" type="number" min="0" step="1" inputmode=...
- [ ] **e0360-c019** [statement, lines 213-213](../development-pack/modules/33_organization_settings.md#L213) -- - resources/js/Pages/Settings/Organization/Index.vue:438: &lt;input id="adj_value_threshold" v-model="approvalsForm.stock_adjustments_value_threshold" type="number" min="0" step="0.01" inputmod...
- [ ] **e0360-c020** [statement, lines 214-214](../development-pack/modules/33_organization_settings.md#L214) -- - resources/js/Pages/Settings/Organization/Index.vue:447: &lt;input v-model="approvalsForm.stock_transfers_enabled" type="checkbox" :disabled="!canManage" /&gt;
- [ ] **e0360-c021** [statement, lines 215-215](../development-pack/modules/33_organization_settings.md#L215) -- - resources/js/Pages/Settings/Organization/Index.vue:456: &lt;input v-model="approvalsForm.orders_enabled" type="checkbox" :disabled="!canManage" /&gt;
- [ ] **e0360-c022** [statement, lines 216-216](../development-pack/modules/33_organization_settings.md#L216) -- - resources/js/Pages/Settings/Organization/Index.vue:465: &lt;input v-model="approvalsForm.admins_can_self_approve" type="checkbox" :disabled="!canManage" /&gt;
- [ ] **e0360-c023** [prose, lines 218-218](../development-pack/modules/33_organization_settings.md#L218) -- **Form initial state/defaults:**
- [ ] **e0360-c024** [source-code reference, lines 219-247](../development-pack/modules/33_organization_settings.md#L219) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0360-c025** [prose, lines 249-249](../development-pack/modules/33_organization_settings.md#L249) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0360-c026** [source-code reference, lines 250-253](../development-pack/modules/33_organization_settings.md#L250) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0360-c027** [prose, lines 255-255](../development-pack/modules/33_organization_settings.md#L255) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0360-c028** [source-code reference, lines 256-269](../development-pack/modules/33_organization_settings.md#L256) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0360-c029** [prose, lines 271-271](../development-pack/modules/33_organization_settings.md#L271) -- **Displayed data/value expressions:**
- [ ] **e0360-c030** [source-code reference, lines 272-297](../development-pack/modules/33_organization_settings.md#L272) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0361: `resources/js/Pages/Settings/Partials/EmailConfiguration.vue`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0361). Complete every clause below before closing this section in the ledger.

- [ ] **e0361-c001** [prose, lines 307-307](../development-pack/modules/33_organization_settings.md#L307) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0361-c002** [statement, lines 308-308](../development-pack/modules/33_organization_settings.md#L308) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:87: &lt;select :id="fieldIdPrefix + '-1'" v-model="form.provider"&gt;
- [ ] **e0361-c003** [statement, lines 309-309](../development-pack/modules/33_organization_settings.md#L309) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:100: &lt;input :id="fieldIdPrefix + '-2'" v-model="form.from_address" type="email" required placeholder="noreply@yourcompany.com" /...
- [ ] **e0361-c004** [statement, lines 310-310](../development-pack/modules/33_organization_settings.md#L310) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:115: &lt;input :id="fieldIdPrefix + '-3'" v-model="form.from_name" type="text" required :placeholder="t('settings.email.fromNamePla...
- [ ] **e0361-c005** [statement, lines 311-311](../development-pack/modules/33_organization_settings.md#L311) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:134: &lt;input :id="fieldIdPrefix + '-4'" v-model="form.smtp.host" type="text" placeholder="smtp.gmail.com" /&gt;
- [ ] **e0361-c006** [statement, lines 312-312](../development-pack/modules/33_organization_settings.md#L312) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:146: &lt;input :id="fieldIdPrefix + '-5'" v-model.number="form.smtp.port" type="number" placeholder="587" /&gt;
- [ ] **e0361-c007** [statement, lines 313-313](../development-pack/modules/33_organization_settings.md#L313) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:159: &lt;input :id="fieldIdPrefix + '-6'" v-model="form.smtp.username" type="text" /&gt;
- [ ] **e0361-c008** [statement, lines 314-314](../development-pack/modules/33_organization_settings.md#L314) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:170: &lt;input :id="fieldIdPrefix + '-7'" v-model="form.smtp.password" type="password" :placeholder="emailConfig.smtp?.password_set...
- [ ] **e0361-c009** [statement, lines 315-315](../development-pack/modules/33_organization_settings.md#L315) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:183: &lt;select :id="fieldIdPrefix + '-8'" v-model="form.smtp.encryption"&gt;
- [ ] **e0361-c010** [statement, lines 316-316](../development-pack/modules/33_organization_settings.md#L316) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:199: &lt;input :id="fieldIdPrefix + '-9'" v-model="form.mailgun.domain" type="text" placeholder="mg.yourcompany.com" /&gt;
- [ ] **e0361-c011** [statement, lines 317-317](../development-pack/modules/33_organization_settings.md#L317) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:211: &lt;input :id="fieldIdPrefix + '-10'" v-model="form.mailgun.secret" type="password" :placeholder="emailConfig.mailgun?.secret_...
- [ ] **e0361-c012** [statement, lines 318-318](../development-pack/modules/33_organization_settings.md#L318) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:229: &lt;input :id="fieldIdPrefix + '-11'" v-model="form.sendgrid.api_key" type="password" :placeholder="emailConfig.sendgrid?.api_...
- [ ] **e0361-c013** [statement, lines 319-319](../development-pack/modules/33_organization_settings.md#L319) -- - resources/js/Pages/Settings/Partials/EmailConfiguration.vue:243: &lt;input v-model="testEmailAddress" type="email" placeholder="test@example.com" /&gt;
- [ ] **e0361-c014** [prose, lines 321-321](../development-pack/modules/33_organization_settings.md#L321) -- **Form initial state/defaults:**
- [ ] **e0361-c015** [source-code reference, lines 322-342](../development-pack/modules/33_organization_settings.md#L322) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0361-c016** [prose, lines 344-344](../development-pack/modules/33_organization_settings.md#L344) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0361-c017** [source-code reference, lines 345-353](../development-pack/modules/33_organization_settings.md#L345) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0361-c018** [prose, lines 355-355](../development-pack/modules/33_organization_settings.md#L355) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0361-c019** [source-code reference, lines 356-362](../development-pack/modules/33_organization_settings.md#L356) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0361-c020** [prose, lines 364-364](../development-pack/modules/33_organization_settings.md#L364) -- **Displayed data/value expressions:**
- [ ] **e0361-c021** [source-code reference, lines 365-371](../development-pack/modules/33_organization_settings.md#L365) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0362: `resources/js/Pages/Settings/Partials/NotificationPreferences.vue`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0362). Complete every clause below before closing this section in the ledger.

- [ ] **e0362-c001** [prose, lines 381-381](../development-pack/modules/33_organization_settings.md#L381) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0362-c002** [statement, lines 382-382](../development-pack/modules/33_organization_settings.md#L382) -- - resources/js/Pages/Settings/Partials/NotificationPreferences.vue:44: &lt;input v-model="form.email_notifications" type="checkbox" id="email_notifications" /&gt;
- [ ] **e0362-c003** [statement, lines 383-383](../development-pack/modules/33_organization_settings.md#L383) -- - resources/js/Pages/Settings/Partials/NotificationPreferences.vue:73: &lt;input v-model="form.email_low_stock" type="checkbox" id="email_low_stock" :disabled="!form.email_notifications" /&gt;
- [ ] **e0362-c004** [statement, lines 384-384](../development-pack/modules/33_organization_settings.md#L384) -- - resources/js/Pages/Settings/Partials/NotificationPreferences.vue:94: &lt;input v-model="form.email_orders" type="checkbox" id="email_orders" :disabled="!form.email_notifications" /&gt;
- [ ] **e0362-c005** [statement, lines 385-385](../development-pack/modules/33_organization_settings.md#L385) -- - resources/js/Pages/Settings/Partials/NotificationPreferences.vue:115: &lt;input v-model="form.email_approvals" type="checkbox" id="email_approvals" :disabled="!form.email_notifications" /&gt;
- [ ] **e0362-c006** [prose, lines 387-387](../development-pack/modules/33_organization_settings.md#L387) -- **Form initial state/defaults:**
- [ ] **e0362-c007** [source-code reference, lines 388-395](../development-pack/modules/33_organization_settings.md#L388) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0362-c008** [prose, lines 397-397](../development-pack/modules/33_organization_settings.md#L397) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0362-c009** [source-code reference, lines 398-400](../development-pack/modules/33_organization_settings.md#L398) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0362-c010** [prose, lines 402-402](../development-pack/modules/33_organization_settings.md#L402) -- **Displayed data/value expressions:**
- [ ] **e0362-c011** [source-code reference, lines 403-405](../development-pack/modules/33_organization_settings.md#L403) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0387: `app/Http/Controllers/Admin/OrganizationLogoController.php`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0387). Complete every clause below before closing this section in the ledger.

- [ ] **e0387-c001** [source-code reference, lines 414-430](../development-pack/modules/33_organization_settings.md#L414) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0388: `app/Http/Controllers/Admin/OrganizationSettingsController.php`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0388). Complete every clause below before closing this section in the ledger.

- [ ] **e0388-c001** [source-code reference, lines 439-480](../development-pack/modules/33_organization_settings.md#L439) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0408: `app/Http/Controllers/OrganizationSwitchController.php`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0408). Complete every clause below before closing this section in the ledger.

- [ ] **e0408-c001** [source-code reference, lines 489-494](../development-pack/modules/33_organization_settings.md#L489) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0423: `app/Http/Controllers/SettingsController.php`

Source: [exact contract](../development-pack/modules/33_organization_settings.md#e0423). Complete every clause below before closing this section in the ledger.

- [ ] **e0423-c001** [source-code reference, lines 503-537](../development-pack/modules/33_organization_settings.md#L503) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/34_notifications.md

### e0291: `resources/js/Components/Layout/NotificationDropdown.vue`

Source: [exact contract](../development-pack/modules/34_notifications.md#e0291). Complete every clause below before closing this section in the ledger.

- [ ] **e0291-c001** [prose, lines 85-86](../development-pack/modules/34_notifications.md#L85) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0291-c002** [prose, lines 88-88](../development-pack/modules/34_notifications.md#L88) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0291-c003** [source-code reference, lines 89-109](../development-pack/modules/34_notifications.md#L89) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0291-c004** [prose, lines 111-111](../development-pack/modules/34_notifications.md#L111) -- **Displayed data/value expressions:**
- [ ] **e0291-c005** [source-code reference, lines 112-117](../development-pack/modules/34_notifications.md#L112) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0323: `resources/js/Pages/Notifications/Index.vue`

Source: [exact contract](../development-pack/modules/34_notifications.md#e0323). Complete every clause below before closing this section in the ledger.

- [ ] **e0323-c001** [prose, lines 127-128](../development-pack/modules/34_notifications.md#L127) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0323-c002** [prose, lines 130-130](../development-pack/modules/34_notifications.md#L130) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0323-c003** [source-code reference, lines 131-143](../development-pack/modules/34_notifications.md#L131) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0323-c004** [prose, lines 145-145](../development-pack/modules/34_notifications.md#L145) -- **Displayed data/value expressions:**
- [ ] **e0323-c005** [source-code reference, lines 146-154](../development-pack/modules/34_notifications.md#L146) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0397: `app/Http/Controllers/Auth/EmailVerificationNotificationController.php`

Source: [exact contract](../development-pack/modules/34_notifications.md#e0397). Complete every clause below before closing this section in the ledger.

- [ ] **e0397-c001** [source-code reference, lines 163-165](../development-pack/modules/34_notifications.md#L163) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0407: `app/Http/Controllers/NotificationController.php`

Source: [exact contract](../development-pack/modules/34_notifications.md#e0407). Complete every clause below before closing this section in the ledger.

- [ ] **e0407-c001** [source-code reference, lines 174-187](../development-pack/modules/34_notifications.md#L174) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/35_shipping.md

### e0168: Shipping nested workflow

Source: [exact contract](../development-pack/modules/35_shipping.md#e0168). Complete every clause below before closing this section in the ledger.

- [ ] **e0168-c001** [prose, lines 89-89](../development-pack/modules/35_shipping.md#L89) -- Details → (manual save/optional shipped) OR (EasyPost pending shipment → rates → buy label → download/print). Existing pending carrier shipment can resume rates. External label purchase has ...
- [ ] **e0168-c002** [statement, lines 91-91](../development-pack/modules/35_shipping.md#L91) -- - Line quantities default all remaining per order item; only &gt;0 submitted. At least one selected in UI. Backend membership and remaining quantities remain authoritative.
- [ ] **e0168-c003** [statement, lines 92-92](../development-pack/modules/35_shipping.md#L92) -- - Carrier defaults EasyPost if available, else manual. Warehouse defaults configured defaultWarehouseId or blank. Parcel weight_oz/length_in/width_in/height_in from suggested parcel or blank...
- [ ] **e0168-c004** [statement, lines 93-93](../development-pack/modules/35_shipping.md#L93) -- - Manual carrier fields: carrier_name, service, tracking_number, tracking_url, cost, mark_shipped=true. Notify customer defaults enabled only when settings permit and customer email exists. ...
- [ ] **e0168-c005** [statement, lines 94-94](../development-pack/modules/35_shipping.md#L94) -- - EasyPost address fields: name, company, street1, street2, city, state, zip, country, phone; prefilled from shipping context. Rates returns selectable rate ID; buy submits rate_id.
- [ ] **e0168-c006** [statement, lines 95-95](../development-pack/modules/35_shipping.md#L95) -- - Validation: carrier from configured available carriers; carrier/service/tracking max100; tracking_url http/https max2048; nonnegative cost max999999; optional currency size3 (API-only; no ...
- [ ] **e0168-c007** [statement, lines 96-96](../development-pack/modules/35_shipping.md#L96) -- - ShipmentsPanel exposes mark shipped, cancel, rates/resume and label download conditionally by status/capability. Partial shipment changes order toward processing, full to shipped, carrier ...
- [ ] **e0168-c008** [prose, lines 98-98](../development-pack/modules/35_shipping.md#L98) -- Evidence: shipment request, shipping command, order synchronization.

### e0204: resources/js/Components/Shipping/ShipOrderModal.vue

Source: [exact contract](../development-pack/modules/35_shipping.md#e0204). Complete every clause below before closing this section in the ledger.

- [ ] **e0204-c001** [prose, lines 108-108](../development-pack/modules/35_shipping.md#L108) -- Source: resources/js/Components/Shipping/ShipOrderModal.vue:1.
- [ ] **e0204-c002** [prose, lines 111-111](../development-pack/modules/35_shipping.md#L111) -- **Named routes referenced:** orders.shipments.store, shipments.buy, shipments.label, shipments.rates.
- [ ] **e0204-c003** [prose, lines 114-114](../development-pack/modules/35_shipping.md#L114) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0204-c004** [prose, lines 117-117](../development-pack/modules/35_shipping.md#L117) -- **Sections / displayed fields / table columns:**
- [ ] **e0204-c005** [statement, lines 119-119](../development-pack/modules/35_shipping.md#L119) -- - h3: step === 'rates' ? Choose a rate : Ship items (L225)
- [ ] **e0204-c006** [prose, lines 122-122](../development-pack/modules/35_shipping.md#L122) -- **UI state/filter defaults:**
- [ ] **e0204-c007** [source-code reference, lines 124-134](../development-pack/modules/35_shipping.md#L124) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0204-c008** [table row, lines 137-137](../development-pack/modules/35_shipping.md#L137) -- Binding / key  /  Label  /  Control  /  Constraints / dependencies  /  Options  /  Evidence
- [ ] **e0204-c009** [table row, lines 140-140](../development-pack/modules/35_shipping.md#L140) -- form.carrier  /  option.label  /  input / radio  /  No extra control attribute; server rules below  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:255
- [ ] **e0204-c010** [table row, lines 142-142](../development-pack/modules/35_shipping.md#L142) -- form.quantities&#91;line.order_item_id&#93;  /  Qty  /  input / number  /  min=0; :max=line.remaining; :disabled=line.remaining === 0  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:27...
- [ ] **e0204-c011** [table row, lines 144-144](../development-pack/modules/35_shipping.md#L144) -- form.warehouse_id  /  Ship from  /  select  /  No extra control attribute; server rules below  /  : None; warehouse.id: warehouse.name &#91;repeat warehouse in shipping.warehouses&#93;  /  resources...
- [ ] **e0204-c012** [table row, lines 146-146](../development-pack/modules/35_shipping.md#L146) -- form.weight_oz  /  Weight (oz)  /  input / number  /  min=0; step=0.1  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:295
- [ ] **e0204-c013** [table row, lines 148-148](../development-pack/modules/35_shipping.md#L148) -- form&#91;field&#93;  /  t(shipping.${label})  /  input / number  /  min=0; step=0.1  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:302
- [ ] **e0204-c014** [table row, lines 150-150](../development-pack/modules/35_shipping.md#L150) -- form.to_address&#91;field&#93;  /  t(shipping.address.${field})  /  input / text  /  :maxlength=field === 'country' ? 2 : 255  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:312
- [ ] **e0204-c015** [table row, lines 152-152](../development-pack/modules/35_shipping.md#L152) -- form.carrier_name  /  Carrier  /  input / text  /  maxlength=100  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:322
- [ ] **e0204-c016** [table row, lines 154-154](../development-pack/modules/35_shipping.md#L154) -- form.service  /  Service  /  input / text  /  maxlength=100  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:326
- [ ] **e0204-c017** [table row, lines 156-156](../development-pack/modules/35_shipping.md#L156) -- form.tracking_number  /  Tracking number  /  input / text  /  maxlength=100  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:330
- [ ] **e0204-c018** [table row, lines 158-158](../development-pack/modules/35_shipping.md#L158) -- form.cost  /  Shipping cost  /  input / number  /  min=0; step=0.01  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:334
- [ ] **e0204-c019** [table row, lines 160-160](../development-pack/modules/35_shipping.md#L160) -- form.tracking_url  /  Tracking link  /  input / url  /  maxlength=2048  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:339
- [ ] **e0204-c020** [table row, lines 162-162](../development-pack/modules/35_shipping.md#L162) -- form.mark_shipped  /  Mark as shipped now  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Components/Shipping/ShipOrderModal.vue:344
- [ ] **e0204-c021** [table row, lines 164-164](../development-pack/modules/35_shipping.md#L164) -- form.notify_customer  /  Email tracking details to {email}  /  input / checkbox  /  No extra control attribute; server rules below  /  —  /  resources/js/Components/Shipping/ShipOrderModal.v...
- [ ] **e0204-c022** [table row, lines 166-166](../development-pack/modules/35_shipping.md#L166) -- selectedRate  /  rate.carrier rate.service Est. {count} day \\ /  Est. {count} days formatMoney(rate.amount, rate.currency)  /  input / radio  /  No extra control attribute; server rules bel...
- [ ] **e0204-c023** [prose, lines 169-169](../development-pack/modules/35_shipping.md#L169) -- **Exact form defaults / hydration / hidden payload** — resources/js/Components/Shipping/ShipOrderModal.vue:45
- [ ] **e0204-c024** [source-code reference, lines 171-174](../development-pack/modules/35_shipping.md#L171) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0204-c025** [table row, lines 178-178](../development-pack/modules/35_shipping.md#L178) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0204-c026** [table row, lines 181-181](../development-pack/modules/35_shipping.md#L181) -- t('shipping.close')  /  type=button; @click=close  /  resources/js/Components/Shipping/ShipOrderModal.vue:228
- [ ] **e0204-c027** [table row, lines 183-183](../development-pack/modules/35_shipping.md#L183) -- Cancel  /  :disabled=busy; @click=close  /  resources/js/Components/Shipping/ShipOrderModal.vue:355
- [ ] **e0204-c028** [table row, lines 185-185](../development-pack/modules/35_shipping.md#L185) -- isManual ? Save shipment : Create shipment and get rates  /  type=submit; :loading=busy; :disabled=busy \ / \ /  selectedTotal === 0  /  resources/js/Components/Shipping/ShipOrderModal.vue:3...
- [ ] **e0204-c029** [table row, lines 187-187](../development-pack/modules/35_shipping.md#L187) -- Get rates  /  :disabled=busy; @click=fetchRates  /  resources/js/Components/Shipping/ShipOrderModal.vue:385
- [ ] **e0204-c030** [table row, lines 189-189](../development-pack/modules/35_shipping.md#L189) -- Buy label  /  :loading=busy; :disabled=busy \ / \ /  !selectedRate; @click=buyLabel  /  resources/js/Components/Shipping/ShipOrderModal.vue:386
- [ ] **e0204-c031** [table row, lines 191-191](../development-pack/modules/35_shipping.md#L191) -- Download label  /  v-if=shipment?.has_label; :href=route('shipments.label', shipment.id)  /  resources/js/Components/Shipping/ShipOrderModal.vue:394
- [ ] **e0204-c032** [table row, lines 193-193](../development-pack/modules/35_shipping.md#L193) -- Close  /  @click=close  /  resources/js/Components/Shipping/ShipOrderModal.vue:405
- [ ] **e0204-c033** [prose, lines 196-196](../development-pack/modules/35_shipping.md#L196) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0204-c034** [source-code reference, lines 198-206](../development-pack/modules/35_shipping.md#L198) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0205: resources/js/Components/Shipping/ShipmentsPanel.vue

Source: [exact contract](../development-pack/modules/35_shipping.md#e0205). Complete every clause below before closing this section in the ledger.

- [ ] **e0205-c001** [prose, lines 217-217](../development-pack/modules/35_shipping.md#L217) -- Source: resources/js/Components/Shipping/ShipmentsPanel.vue:1.
- [ ] **e0205-c002** [prose, lines 220-220](../development-pack/modules/35_shipping.md#L220) -- **Named routes referenced:** shipments.label.
- [ ] **e0205-c003** [prose, lines 223-223](../development-pack/modules/35_shipping.md#L223) -- **Permission/route-capability checks:** Server-provided capability/status or parent authorization; routes below remain authoritative..
- [ ] **e0205-c004** [prose, lines 226-226](../development-pack/modules/35_shipping.md#L226) -- **Sections / displayed fields / table columns:**
- [ ] **e0205-c005** [statement, lines 228-228](../development-pack/modules/35_shipping.md#L228) -- - h3: Shipments (L69)
- [ ] **e0205-c006** [prose, lines 231-231](../development-pack/modules/35_shipping.md#L231) -- **UI state/filter defaults:**
- [ ] **e0205-c007** [source-code reference, lines 233-237](../development-pack/modules/35_shipping.md#L233) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0205-c008** [prose, lines 240-240](../development-pack/modules/35_shipping.md#L240) -- No editable model-bound controls in this file; navigation and action-only controls listed below.
- [ ] **e0205-c009** [table row, lines 244-244](../development-pack/modules/35_shipping.md#L244) -- Action label  /  Route / handler / visibility / busy condition  /  Evidence
- [ ] **e0205-c010** [table row, lines 247-247](../development-pack/modules/35_shipping.md#L247) -- Ship  /  v-if=canShip; @click=openShip()  /  resources/js/Components/Shipping/ShipmentsPanel.vue:70
- [ ] **e0205-c011** [table row, lines 249-249](../development-pack/modules/35_shipping.md#L249) -- Download label  /  v-if=shipment.has_label &amp;&amp; shipment.status !== 'cancelled'; :href=route('shipments.label', shipment.id)  /  resources/js/Components/Shipping/ShipmentsPanel.vue:130
- [ ] **e0205-c012** [table row, lines 251-251](../development-pack/modules/35_shipping.md#L251) -- Get rates  /  v-if=shipment.status === 'pending' &amp;&amp; shipment.carrier !== 'manual'; @click=openShip(shipment)  /  resources/js/Components/Shipping/ShipmentsPanel.vue:143
- [ ] **e0205-c013** [table row, lines 253-253](../development-pack/modules/35_shipping.md#L253) -- Mark shipped  /  v-if=&#91;'pending', 'label_created'&#93;.includes(shipment.status); :loading=acting === shipment.id; @click=post('shipments.ship', shipment)  /  resources/js/Components/Shipping/Sh...
- [ ] **e0205-c014** [table row, lines 255-255](../development-pack/modules/35_shipping.md#L255) -- Void label  /  v-if=shipment.status === 'label_created' &amp;&amp; shipment.carrier !== 'manual'; :disabled=acting === shipment.id; @click=post('shipments.cancel', shipment, t('shipping.confirmVoid'...
- [ ] **e0205-c015** [table row, lines 257-257](../development-pack/modules/35_shipping.md#L257) -- Cancel shipment  /  :disabled=acting === shipment.id; @click=post('shipments.cancel', shipment, t('shipping.confirmCancel'))  /  resources/js/Components/Shipping/ShipmentsPanel.vue:170
- [ ] **e0205-c016** [prose, lines 260-260](../development-pack/modules/35_shipping.md#L260) -- **Conditional sections / submit boundaries (source expressions):**
- [ ] **e0205-c017** [source-code reference, lines 262-272](../development-pack/modules/35_shipping.md#L262) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0249: app/Models/Shipping/Shipment.php

Source: [exact contract](../development-pack/modules/35_shipping.md#e0249). Complete every clause below before closing this section in the ledger.

- [ ] **e0249-c001** [prose, lines 283-283](../development-pack/modules/35_shipping.md#L283) -- app/Models/Shipping/Shipment.php:1
- [ ] **e0249-c002** [source-code reference, lines 286-320](../development-pack/modules/35_shipping.md#L286) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0249-c003** [source-code reference, lines 323-333](../development-pack/modules/35_shipping.md#L323) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0250: app/Models/Shipping/ShipmentItem.php

Source: [exact contract](../development-pack/modules/35_shipping.md#e0250). Complete every clause below before closing this section in the ledger.

- [ ] **e0250-c001** [prose, lines 344-344](../development-pack/modules/35_shipping.md#L344) -- app/Models/Shipping/ShipmentItem.php:1
- [ ] **e0250-c002** [source-code reference, lines 347-353](../development-pack/modules/35_shipping.md#L347) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0250-c003** [source-code reference, lines 356-359](../development-pack/modules/35_shipping.md#L356) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0363: `resources/js/Pages/Settings/Shipping.vue`

Source: [exact contract](../development-pack/modules/35_shipping.md#e0363). Complete every clause below before closing this section in the ledger.

- [ ] **e0363-c001** [prose, lines 370-370](../development-pack/modules/35_shipping.md#L370) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0363-c002** [statement, lines 371-371](../development-pack/modules/35_shipping.md#L371) -- - resources/js/Pages/Settings/Shipping.vue:105: &lt;input v-model="form.easypost_enabled" type="checkbox" /&gt;
- [ ] **e0363-c003** [statement, lines 372-372](../development-pack/modules/35_shipping.md#L372) -- - resources/js/Pages/Settings/Shipping.vue:111: &lt;input v-model="form.easypost_test_mode" type="checkbox" /&gt;
- [ ] **e0363-c004** [statement, lines 373-373](../development-pack/modules/35_shipping.md#L373) -- - resources/js/Pages/Settings/Shipping.vue:120: &lt;input id="easypost_test_api_key" v-model="form.easypost_test_api_key" type="password" autocomplete="new-password" :placeholder="settings.easy...
- [ ] **e0363-c005** [statement, lines 374-374](../development-pack/modules/35_shipping.md#L374) -- - resources/js/Pages/Settings/Shipping.vue:132: &lt;input id="easypost_api_key" v-model="form.easypost_api_key" type="password" autocomplete="new-password" :placeholder="settings.easypost_api_k...
- [ ] **e0363-c006** [statement, lines 375-375](../development-pack/modules/35_shipping.md#L375) -- - resources/js/Pages/Settings/Shipping.vue:164: &lt;input id="easypost_webhook_secret" v-model="form.easypost_webhook_secret" type="password" autocomplete="new-password" :placeholder="settings....
- [ ] **e0363-c007** [statement, lines 376-376](../development-pack/modules/35_shipping.md#L376) -- - resources/js/Pages/Settings/Shipping.vue:184: &lt;select id="default_warehouse_id" v-model="form.default_warehouse_id"&gt;
- [ ] **e0363-c008** [statement, lines 377-377](../development-pack/modules/35_shipping.md#L377) -- - resources/js/Pages/Settings/Shipping.vue:197: &lt;input :id="&amp;#96;from_${field}&amp;#96;" v-model="form.from_address&#91;field&#93;" :type="field === 'email' ? 'email' : 'text'" :maxlength="field === 'co...
- [ ] **e0363-c009** [statement, lines 378-378](../development-pack/modules/35_shipping.md#L378) -- - resources/js/Pages/Settings/Shipping.vue:214: &lt;input :id="&amp;#96;parcel_${field}&amp;#96;" v-model="form.default_parcel&#91;field&#93;" type="number" min="0" step="0.1" /&gt;
- [ ] **e0363-c010** [statement, lines 379-379](../development-pack/modules/35_shipping.md#L379) -- - resources/js/Pages/Settings/Shipping.vue:220: &lt;input v-model="form.notify_customers" type="checkbox" /&gt;
- [ ] **e0363-c011** [prose, lines 381-381](../development-pack/modules/35_shipping.md#L381) -- **Form initial state/defaults:**
- [ ] **e0363-c012** [source-code reference, lines 382-399](../development-pack/modules/35_shipping.md#L382) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0363-c013** [prose, lines 401-401](../development-pack/modules/35_shipping.md#L401) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0363-c014** [source-code reference, lines 402-405](../development-pack/modules/35_shipping.md#L402) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0363-c015** [prose, lines 407-407](../development-pack/modules/35_shipping.md#L407) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0363-c016** [source-code reference, lines 408-413](../development-pack/modules/35_shipping.md#L408) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0363-c017** [prose, lines 415-415](../development-pack/modules/35_shipping.md#L415) -- **Displayed data/value expressions:**
- [ ] **e0363-c018** [source-code reference, lines 416-424](../development-pack/modules/35_shipping.md#L416) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0424: `app/Http/Controllers/ShippingSettingsController.php`

Source: [exact contract](../development-pack/modules/35_shipping.md#e0424). Complete every clause below before closing this section in the ledger.

- [ ] **e0424-c001** [source-code reference, lines 433-454](../development-pack/modules/35_shipping.md#L433) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0509: `app/Enums/ShipmentStatus.php`

Source: [exact contract](../development-pack/modules/35_shipping.md#e0509). Complete every clause below before closing this section in the ledger.

- [ ] **e0509-c001** [prose, lines 464-464](../development-pack/modules/35_shipping.md#L464) -- Source evidence. SHA-256: 139d1a5f9da5c108bfd6c3f4062c9f473e7f871f12f1932195d4c23a6049ff6e.
- [ ] **e0509-c002** [source-code reference, lines 466-541](../development-pack/modules/35_shipping.md#L466) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/36_storage.md

### e0054: Components/ImageUploader

Source: [exact contract](../development-pack/modules/36_storage.md#e0054). Complete every clause below before closing this section in the ledger.

- [ ] **e0054-c001** [prose, lines 86-86](../development-pack/modules/36_storage.md#L86) -- Product form image collection. File chooser multiple image/*; accepts image file MIME, per-file 5MB and max 5 supplied by parent. Uses FileReader data URLs for previews; remove by index. Exi...
- [ ] **e0054-c002** [prose, lines 88-88](../development-pack/modules/36_storage.md#L88) -- Source: resources/js/Components/ImageUploader.vue:1.
- [ ] **e0054-c003** [prose, lines 90-90](../development-pack/modules/36_storage.md#L90) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0054-c004** [source-code reference, lines 92-101](../development-pack/modules/36_storage.md#L92) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0054-c005** [prose, lines 103-103](../development-pack/modules/36_storage.md#L103) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0054-c006** [table row, lines 105-105](../development-pack/modules/36_storage.md#L105) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0054-c007** [table row, lines 107-107](../development-pack/modules/36_storage.md#L107) -- (unbound) — resources/js/Components/ImageUploader.vue:116  /  No explicit label / see context  /  file; See :value / :checked and event handler; not a v-model field  /  ref="fileInput"; type...
- [ ] **e0054-c008** [prose, lines 109-109](../development-pack/modules/36_storage.md#L109) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0054-c009** [table row, lines 111-111](../development-pack/modules/36_storage.md#L111) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0054-c010** [table row, lines 113-113](../development-pack/modules/36_storage.md#L113) -- (icon-only; accessible label/title in attributes) — resources/js/Components/ImageUploader.vue:165  /  v-if="index &amp;gt; 0"; @click="moveImage(index, index - 1)"; type="button"; :title="t('com...
- [ ] **e0054-c011** [table row, lines 114-114](../development-pack/modules/36_storage.md#L114) -- (icon-only; accessible label/title in attributes) — resources/js/Components/ImageUploader.vue:178  /  @click="removeImage(index)"; type="button"; :title="t('components.imageUploader.remove')...
- [ ] **e0054-c012** [table row, lines 115-115](../development-pack/modules/36_storage.md#L115) -- (icon-only; accessible label/title in attributes) — resources/js/Components/ImageUploader.vue:190  /  v-if="index &amp;lt; images.length - 1"; @click="moveImage(index, index + 1)"; type="button"...

### e0154: 2026_10_21_230000_record_upload_storage_disks.php

Source: [exact contract](../development-pack/modules/36_storage.md#e0154). Complete every clause below before closing this section in the ledger.

- [ ] **e0154-c001** [prose, lines 124-124](../development-pack/modules/36_storage.md#L124) -- database/migrations/2026_10_21_230000_record_upload_storage_disks.php:1
- [ ] **e0154-c002** [source-code reference, lines 126-129](../development-pack/modules/36_storage.md#L126) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0364: `resources/js/Pages/Settings/Storage.vue`

Source: [exact contract](../development-pack/modules/36_storage.md#e0364). Complete every clause below before closing this section in the ledger.

- [ ] **e0364-c001** [prose, lines 139-140](../development-pack/modules/36_storage.md#L139) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0364-c002** [prose, lines 142-142](../development-pack/modules/36_storage.md#L142) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0364-c003** [source-code reference, lines 143-148](../development-pack/modules/36_storage.md#L143) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0364-c004** [prose, lines 150-150](../development-pack/modules/36_storage.md#L150) -- **Displayed data/value expressions:**
- [ ] **e0364-c005** [source-code reference, lines 151-158](../development-pack/modules/36_storage.md#L151) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0392: `app/Http/Controllers/Admin/StorageSettingsController.php`

Source: [exact contract](../development-pack/modules/36_storage.md#e0392). Complete every clause below before closing this section in the ledger.

- [ ] **e0392-c001** [source-code reference, lines 167-176](../development-pack/modules/36_storage.md#L167) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0458: Supplemental complete source `app/Support/StorageAdministration.php`

Source: [exact contract](../development-pack/modules/36_storage.md#e0458). Complete every clause below before closing this section in the ledger.

- [ ] **e0458-c001** [source-code reference, lines 185-205](../development-pack/modules/36_storage.md#L185) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/37_api_webhooks.md

### e0271: e0271

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0271). Complete every clause below before closing this section in the ledger.

- [ ] **e0271-c001** [prose, lines 96-96](../development-pack/modules/37_api_webhooks.md#L96) -- REST /api/v1 Sanctum bearer; GraphQL schema auth; MCP /mcp auth+throttle. Same user permissions and organization scopes; share workflow services, never privileged bypass. MCP selected identi...

### e0357: `resources/js/Pages/Settings/ApiTokens/Index.vue`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0357). Complete every clause below before closing this section in the ledger.

- [ ] **e0357-c001** [prose, lines 106-106](../development-pack/modules/37_api_webhooks.md#L106) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0357-c002** [statement, lines 107-107](../development-pack/modules/37_api_webhooks.md#L107) -- - resources/js/Pages/Settings/ApiTokens/Index.vue:227: &lt;input id="api-token-name" v-model="form.name" type="text" maxlength="255" :placeholder="t('settings.apiTokens.namePlaceholder')" requi...
- [ ] **e0357-c003** [statement, lines 108-108](../development-pack/modules/37_api_webhooks.md#L108) -- - resources/js/Pages/Settings/ApiTokens/Index.vue:268: &lt;input v-model="form.abilities" type="checkbox" :value="permission.value" /&gt;
- [ ] **e0357-c004** [prose, lines 110-110](../development-pack/modules/37_api_webhooks.md#L110) -- **Form initial state/defaults:**
- [ ] **e0357-c005** [source-code reference, lines 111-116](../development-pack/modules/37_api_webhooks.md#L111) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0357-c006** [prose, lines 118-118](../development-pack/modules/37_api_webhooks.md#L118) -- **Visible table headers:**
- [ ] **e0357-c007** [source-code reference, lines 119-125](../development-pack/modules/37_api_webhooks.md#L119) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0357-c008** [prose, lines 127-127](../development-pack/modules/37_api_webhooks.md#L127) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0357-c009** [source-code reference, lines 128-140](../development-pack/modules/37_api_webhooks.md#L128) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0357-c010** [prose, lines 142-142](../development-pack/modules/37_api_webhooks.md#L142) -- **Displayed data/value expressions:**
- [ ] **e0357-c011** [source-code reference, lines 143-155](../development-pack/modules/37_api_webhooks.md#L143) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0365: `resources/js/Pages/Settings/Webhooks/Index.vue`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0365). Complete every clause below before closing this section in the ledger.

- [ ] **e0365-c001** [prose, lines 165-165](../development-pack/modules/37_api_webhooks.md#L165) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0365-c002** [statement, lines 166-166](../development-pack/modules/37_api_webhooks.md#L166) -- - resources/js/Pages/Settings/Webhooks/Index.vue:305: &lt;input id="create-name" v-model="createForm.name" type="text" :placeholder="t('settings.webhooks.namePlaceholder')" /&gt;
- [ ] **e0365-c003** [statement, lines 167-167](../development-pack/modules/37_api_webhooks.md#L167) -- - resources/js/Pages/Settings/Webhooks/Index.vue:318: &lt;input id="create-url" v-model="createForm.url" type="url" placeholder="https://example.com/webhook" /&gt;
- [ ] **e0365-c004** [statement, lines 168-168](../development-pack/modules/37_api_webhooks.md#L168) -- - resources/js/Pages/Settings/Webhooks/Index.vue:371: &lt;input id="create-active" v-model="createForm.is_active" type="checkbox" /&gt;
- [ ] **e0365-c005** [statement, lines 169-169](../development-pack/modules/37_api_webhooks.md#L169) -- - resources/js/Pages/Settings/Webhooks/Index.vue:418: &lt;input id="edit-name" v-model="editForm.name" type="text" :placeholder="t('settings.webhooks.namePlaceholder')" /&gt;
- [ ] **e0365-c006** [statement, lines 170-170](../development-pack/modules/37_api_webhooks.md#L170) -- - resources/js/Pages/Settings/Webhooks/Index.vue:431: &lt;input id="edit-url" v-model="editForm.url" type="url" placeholder="https://example.com/webhook" /&gt;
- [ ] **e0365-c007** [statement, lines 171-171](../development-pack/modules/37_api_webhooks.md#L171) -- - resources/js/Pages/Settings/Webhooks/Index.vue:484: &lt;input id="edit-active" v-model="editForm.is_active" type="checkbox" /&gt;
- [ ] **e0365-c008** [prose, lines 173-173](../development-pack/modules/37_api_webhooks.md#L173) -- **Form initial state/defaults:**
- [ ] **e0365-c009** [source-code reference, lines 174-187](../development-pack/modules/37_api_webhooks.md#L174) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0365-c010** [prose, lines 189-189](../development-pack/modules/37_api_webhooks.md#L189) -- **Visible table headers:**
- [ ] **e0365-c011** [source-code reference, lines 190-197](../development-pack/modules/37_api_webhooks.md#L190) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0365-c012** [prose, lines 199-199](../development-pack/modules/37_api_webhooks.md#L199) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0365-c013** [source-code reference, lines 200-211](../development-pack/modules/37_api_webhooks.md#L200) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0365-c014** [prose, lines 213-213](../development-pack/modules/37_api_webhooks.md#L213) -- **Displayed data/value expressions:**
- [ ] **e0365-c015** [source-code reference, lines 214-232](../development-pack/modules/37_api_webhooks.md#L214) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0366: `resources/js/Pages/Settings/Webhooks/Show.vue`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0366). Complete every clause below before closing this section in the ledger.

- [ ] **e0366-c001** [prose, lines 242-242](../development-pack/modules/37_api_webhooks.md#L242) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0366-c002** [statement, lines 243-243](../development-pack/modules/37_api_webhooks.md#L243) -- - resources/js/Pages/Settings/Webhooks/Show.vue:524: &lt;input id="edit-name" v-model="editForm.name" type="text" :placeholder="t('settings.webhooks.namePlaceholder')" /&gt;
- [ ] **e0366-c003** [statement, lines 244-244](../development-pack/modules/37_api_webhooks.md#L244) -- - resources/js/Pages/Settings/Webhooks/Show.vue:537: &lt;input id="edit-url" v-model="editForm.url" type="url" placeholder="https://example.com/webhook" /&gt;
- [ ] **e0366-c004** [statement, lines 245-245](../development-pack/modules/37_api_webhooks.md#L245) -- - resources/js/Pages/Settings/Webhooks/Show.vue:590: &lt;input id="show-edit-active" v-model="editForm.is_active" type="checkbox" /&gt;
- [ ] **e0366-c005** [prose, lines 247-247](../development-pack/modules/37_api_webhooks.md#L247) -- **Form initial state/defaults:**
- [ ] **e0366-c006** [source-code reference, lines 248-255](../development-pack/modules/37_api_webhooks.md#L248) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0366-c007** [prose, lines 257-257](../development-pack/modules/37_api_webhooks.md#L257) -- **Visible table headers:**
- [ ] **e0366-c008** [source-code reference, lines 258-265](../development-pack/modules/37_api_webhooks.md#L258) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0366-c009** [prose, lines 267-267](../development-pack/modules/37_api_webhooks.md#L267) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0366-c010** [source-code reference, lines 268-281](../development-pack/modules/37_api_webhooks.md#L268) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0366-c011** [prose, lines 283-283](../development-pack/modules/37_api_webhooks.md#L283) -- **Displayed data/value expressions:**
- [ ] **e0366-c012** [source-code reference, lines 284-305](../development-pack/modules/37_api_webhooks.md#L284) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0380: `app/Http/Requests/Webhook/StoreWebhookRequest.php`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0380). Complete every clause below before closing this section in the ledger.

- [ ] **e0380-c001** [source-code reference, lines 314-355](../development-pack/modules/37_api_webhooks.md#L314) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0381: `app/Http/Requests/Webhook/UpdateWebhookRequest.php`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0381). Complete every clause below before closing this section in the ledger.

- [ ] **e0381-c001** [source-code reference, lines 364-404](../development-pack/modules/37_api_webhooks.md#L364) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0385: `app/Http/Controllers/Admin/ApiTokenController.php`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0385). Complete every clause below before closing this section in the ledger.

- [ ] **e0385-c001** [source-code reference, lines 413-428](../development-pack/modules/37_api_webhooks.md#L413) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0425: `app/Http/Controllers/WebhookController.php`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0425). Complete every clause below before closing this section in the ledger.

- [ ] **e0425-c001** [source-code reference, lines 437-451](../development-pack/modules/37_api_webhooks.md#L437) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0438: Contract appendix `routes/ai.php:1-23`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0438). Complete every clause below before closing this section in the ledger.

- [ ] **e0438-c001** [source-code reference, lines 460-484](../development-pack/modules/37_api_webhooks.md#L460) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0452: Complete source contract `app/Mcp/Servers/InventorosServer.php`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0452). Complete every clause below before closing this section in the ledger.

- [ ] **e0452-c001** [source-code reference, lines 493-655](../development-pack/modules/37_api_webhooks.md#L493) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0453: Complete source contract `routes/api.php`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0453). Complete every clause below before closing this section in the ledger.

- [ ] **e0453-c001** [source-code reference, lines 664-1057](../development-pack/modules/37_api_webhooks.md#L664) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0455: Complete source contract `app/Services/WebhookService.php`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0455). Complete every clause below before closing this section in the ledger.

- [ ] **e0455-c001** [source-code reference, lines 1066-1370](../development-pack/modules/37_api_webhooks.md#L1066) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0456: Complete source contract `config/graphql.php`

Source: [exact contract](../development-pack/modules/37_api_webhooks.md#e0456). Complete every clause below before closing this section in the ledger.

- [ ] **e0456-c001** [source-code reference, lines 1379-1724](../development-pack/modules/37_api_webhooks.md#L1379) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/38_customer_portal.md

### e0266: e0266

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0266). Complete every clause below before closing this section in the ledger.

- [ ] **e0266-c001** [prose, lines 109-109](../development-pack/modules/38_customer_portal.md#L109) -- /portal/{organization} dedicated customer guard/props; unknown/off org404; staff session isn't customer authority (bootstrap/app.php:49-52,108-127). Dashboard/login/forgot/reset/accept invit...
- [ ] **e0266-c002** [prose, lines 111-111](../development-pack/modules/38_customer_portal.md#L111) -- Login email/password; reset token/email/password/confirmation; invitation fixed email+password/confirmation and signed expiring URL checked GET/POST (routes/portal.php:20-45).
- [ ] **e0266-c003** [prose, lines 113-113](../development-pack/modules/38_customer_portal.md#L113) -- Orders columns number/date/status/items/total/view. Detail product/variant/SKU/quantity/unit-price/line-total, totals, controller-permitted address/shipment/payment facts, invoice download, ...
- [ ] **e0266-c004** [prose, lines 115-115](../development-pack/modules/38_customer_portal.md#L115) -- Return: type return|exchange(default return); reason required max1000; notes optional max2000; items1..200; distinct order_item_id integers; quantity integer1..1000000 further constrained by...

### e0325: `resources/js/Pages/Portal/Auth/AcceptInvitation.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0325). Complete every clause below before closing this section in the ledger.

- [ ] **e0325-c001** [prose, lines 125-125](../development-pack/modules/38_customer_portal.md#L125) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0325-c002** [statement, lines 126-126](../development-pack/modules/38_customer_portal.md#L126) -- - resources/js/Pages/Portal/Auth/AcceptInvitation.vue:51: &lt;TextInput id="password" v-model="form.password" type="password" required autofocus autocomplete="new-password" /&gt;
- [ ] **e0325-c003** [statement, lines 127-127](../development-pack/modules/38_customer_portal.md#L127) -- - resources/js/Pages/Portal/Auth/AcceptInvitation.vue:65: &lt;TextInput id="password_confirmation" v-model="form.password_confirmation" type="password" required autocomplete="new-password" /&gt;
- [ ] **e0325-c004** [prose, lines 129-129](../development-pack/modules/38_customer_portal.md#L129) -- **Form initial state/defaults:**
- [ ] **e0325-c005** [source-code reference, lines 130-135](../development-pack/modules/38_customer_portal.md#L130) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0325-c006** [prose, lines 137-137](../development-pack/modules/38_customer_portal.md#L137) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0325-c007** [source-code reference, lines 138-141](../development-pack/modules/38_customer_portal.md#L138) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0326: `resources/js/Pages/Portal/Auth/ForgotPassword.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0326). Complete every clause below before closing this section in the ledger.

- [ ] **e0326-c001** [prose, lines 151-151](../development-pack/modules/38_customer_portal.md#L151) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0326-c002** [statement, lines 152-152](../development-pack/modules/38_customer_portal.md#L152) -- - resources/js/Pages/Portal/Auth/ForgotPassword.vue:38: &lt;TextInput id="email" v-model="form.email" type="email" required autofocus autocomplete="username" /&gt;
- [ ] **e0326-c003** [prose, lines 154-154](../development-pack/modules/38_customer_portal.md#L154) -- **Form initial state/defaults:**
- [ ] **e0326-c004** [source-code reference, lines 155-159](../development-pack/modules/38_customer_portal.md#L155) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0326-c005** [prose, lines 161-161](../development-pack/modules/38_customer_portal.md#L161) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0326-c006** [source-code reference, lines 162-164](../development-pack/modules/38_customer_portal.md#L162) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0326-c007** [prose, lines 166-166](../development-pack/modules/38_customer_portal.md#L166) -- **Displayed data/value expressions:**
- [ ] **e0326-c008** [source-code reference, lines 167-169](../development-pack/modules/38_customer_portal.md#L167) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0327: `resources/js/Pages/Portal/Auth/Login.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0327). Complete every clause below before closing this section in the ledger.

- [ ] **e0327-c001** [prose, lines 179-179](../development-pack/modules/38_customer_portal.md#L179) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0327-c002** [statement, lines 180-180](../development-pack/modules/38_customer_portal.md#L180) -- - resources/js/Pages/Portal/Auth/Login.vue:44: &lt;TextInput id="email" v-model="form.email" type="email" required autofocus autocomplete="username" /&gt;
- [ ] **e0327-c003** [statement, lines 181-181](../development-pack/modules/38_customer_portal.md#L181) -- - resources/js/Pages/Portal/Auth/Login.vue:58: &lt;TextInput id="password" v-model="form.password" type="password" required autocomplete="current-password" /&gt;
- [ ] **e0327-c004** [prose, lines 183-183](../development-pack/modules/38_customer_portal.md#L183) -- **Form initial state/defaults:**
- [ ] **e0327-c005** [source-code reference, lines 184-189](../development-pack/modules/38_customer_portal.md#L184) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0327-c006** [prose, lines 191-191](../development-pack/modules/38_customer_portal.md#L191) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0327-c007** [source-code reference, lines 192-195](../development-pack/modules/38_customer_portal.md#L192) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0327-c008** [prose, lines 197-197](../development-pack/modules/38_customer_portal.md#L197) -- **Displayed data/value expressions:**
- [ ] **e0327-c009** [source-code reference, lines 198-200](../development-pack/modules/38_customer_portal.md#L198) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0328: `resources/js/Pages/Portal/Auth/ResetPassword.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0328). Complete every clause below before closing this section in the ledger.

- [ ] **e0328-c001** [prose, lines 210-210](../development-pack/modules/38_customer_portal.md#L210) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0328-c002** [statement, lines 211-211](../development-pack/modules/38_customer_portal.md#L211) -- - resources/js/Pages/Portal/Auth/ResetPassword.vue:40: &lt;TextInput id="email" v-model="form.email" type="email" required autocomplete="username" /&gt;
- [ ] **e0328-c003** [statement, lines 212-212](../development-pack/modules/38_customer_portal.md#L212) -- - resources/js/Pages/Portal/Auth/ResetPassword.vue:53: &lt;TextInput id="password" v-model="form.password" type="password" required autofocus autocomplete="new-password" /&gt;
- [ ] **e0328-c004** [statement, lines 213-213](../development-pack/modules/38_customer_portal.md#L213) -- - resources/js/Pages/Portal/Auth/ResetPassword.vue:67: &lt;TextInput id="password_confirmation" v-model="form.password_confirmation" type="password" required autocomplete="new-password" /&gt;
- [ ] **e0328-c005** [prose, lines 215-215](../development-pack/modules/38_customer_portal.md#L215) -- **Form initial state/defaults:**
- [ ] **e0328-c006** [source-code reference, lines 216-223](../development-pack/modules/38_customer_portal.md#L216) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0328-c007** [prose, lines 225-225](../development-pack/modules/38_customer_portal.md#L225) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0328-c008** [source-code reference, lines 226-228](../development-pack/modules/38_customer_portal.md#L226) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0329: `resources/js/Pages/Portal/Dashboard.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0329). Complete every clause below before closing this section in the ledger.

- [ ] **e0329-c001** [prose, lines 238-239](../development-pack/modules/38_customer_portal.md#L238) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0329-c002** [prose, lines 241-241](../development-pack/modules/38_customer_portal.md#L241) -- **Visible table headers:**
- [ ] **e0329-c003** [source-code reference, lines 242-247](../development-pack/modules/38_customer_portal.md#L242) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0329-c004** [prose, lines 249-249](../development-pack/modules/38_customer_portal.md#L249) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0329-c005** [source-code reference, lines 250-253](../development-pack/modules/38_customer_portal.md#L250) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0329-c006** [prose, lines 255-255](../development-pack/modules/38_customer_portal.md#L255) -- **Displayed data/value expressions:**
- [ ] **e0329-c007** [source-code reference, lines 256-260](../development-pack/modules/38_customer_portal.md#L256) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0330: `resources/js/Pages/Portal/Orders/Index.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0330). Complete every clause below before closing this section in the ledger.

- [ ] **e0330-c001** [prose, lines 270-271](../development-pack/modules/38_customer_portal.md#L270) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0330-c002** [prose, lines 273-273](../development-pack/modules/38_customer_portal.md#L273) -- **Visible table headers:**
- [ ] **e0330-c003** [source-code reference, lines 274-281](../development-pack/modules/38_customer_portal.md#L274) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0330-c004** [prose, lines 283-283](../development-pack/modules/38_customer_portal.md#L283) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0330-c005** [source-code reference, lines 284-286](../development-pack/modules/38_customer_portal.md#L284) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0330-c006** [prose, lines 288-288](../development-pack/modules/38_customer_portal.md#L288) -- **Displayed data/value expressions:**
- [ ] **e0330-c007** [source-code reference, lines 289-294](../development-pack/modules/38_customer_portal.md#L289) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0331: `resources/js/Pages/Portal/Orders/Show.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0331). Complete every clause below before closing this section in the ledger.

- [ ] **e0331-c001** [prose, lines 304-305](../development-pack/modules/38_customer_portal.md#L304) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0331-c002** [prose, lines 307-307](../development-pack/modules/38_customer_portal.md#L307) -- **Visible table headers:**
- [ ] **e0331-c003** [source-code reference, lines 308-313](../development-pack/modules/38_customer_portal.md#L308) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0331-c004** [prose, lines 315-315](../development-pack/modules/38_customer_portal.md#L315) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0331-c005** [source-code reference, lines 316-321](../development-pack/modules/38_customer_portal.md#L316) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0331-c006** [prose, lines 323-323](../development-pack/modules/38_customer_portal.md#L323) -- **Displayed data/value expressions:**
- [ ] **e0331-c007** [source-code reference, lines 324-358](../development-pack/modules/38_customer_portal.md#L324) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0332: `resources/js/Pages/Portal/Returns/Create.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0332). Complete every clause below before closing this section in the ledger.

- [ ] **e0332-c001** [prose, lines 368-368](../development-pack/modules/38_customer_portal.md#L368) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0332-c002** [statement, lines 369-369](../development-pack/modules/38_customer_portal.md#L369) -- - resources/js/Pages/Portal/Returns/Create.vue:105: &lt;input v-model.number="lines&#91;item.id&#93;.quantity" type="number" min="0" :max="item.returnable_quantity" :aria-label="&amp;#96;${t('portal.return...
- [ ] **e0332-c003** [statement, lines 370-370](../development-pack/modules/38_customer_portal.md#L370) -- - resources/js/Pages/Portal/Returns/Create.vue:116: &lt;select v-model="lines&#91;item.id&#93;.condition" :aria-label="&amp;#96;${t('portal.returnForm.condition')} ${item.product_name}&amp;#96;" &gt;
- [ ] **e0332-c004** [statement, lines 371-371](../development-pack/modules/38_customer_portal.md#L371) -- - resources/js/Pages/Portal/Returns/Create.vue:138: &lt;select id="type" v-model="form.type"&gt;
- [ ] **e0332-c005** [statement, lines 372-372](../development-pack/modules/38_customer_portal.md#L372) -- - resources/js/Pages/Portal/Returns/Create.vue:146: &lt;textarea id="reason" v-model="form.reason" rows="3" maxlength="1000" required :placeholder="t('portal.returnForm.reasonPlaceholder')" /&gt;
- [ ] **e0332-c006** [statement, lines 373-373](../development-pack/modules/38_customer_portal.md#L373) -- - resources/js/Pages/Portal/Returns/Create.vue:159: &lt;textarea id="notes" v-model="form.notes" rows="2" maxlength="2000" :placeholder="t('portal.returnForm.notesPlaceholder')" /&gt;
- [ ] **e0332-c007** [prose, lines 375-375](../development-pack/modules/38_customer_portal.md#L375) -- **Form initial state/defaults:**
- [ ] **e0332-c008** [source-code reference, lines 376-383](../development-pack/modules/38_customer_portal.md#L376) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0332-c009** [prose, lines 385-385](../development-pack/modules/38_customer_portal.md#L385) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0332-c010** [source-code reference, lines 386-392](../development-pack/modules/38_customer_portal.md#L386) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0332-c011** [prose, lines 394-394](../development-pack/modules/38_customer_portal.md#L394) -- **Visible table headers:**
- [ ] **e0332-c012** [source-code reference, lines 395-399](../development-pack/modules/38_customer_portal.md#L395) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0332-c013** [prose, lines 401-401](../development-pack/modules/38_customer_portal.md#L401) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0332-c014** [source-code reference, lines 402-407](../development-pack/modules/38_customer_portal.md#L402) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0332-c015** [prose, lines 409-409](../development-pack/modules/38_customer_portal.md#L409) -- **Displayed data/value expressions:**
- [ ] **e0332-c016** [source-code reference, lines 410-415](../development-pack/modules/38_customer_portal.md#L410) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0333: `resources/js/Pages/Portal/Returns/Index.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0333). Complete every clause below before closing this section in the ledger.

- [ ] **e0333-c001** [prose, lines 425-426](../development-pack/modules/38_customer_portal.md#L425) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0333-c002** [prose, lines 428-428](../development-pack/modules/38_customer_portal.md#L428) -- **Visible table headers:**
- [ ] **e0333-c003** [source-code reference, lines 429-436](../development-pack/modules/38_customer_portal.md#L429) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0333-c004** [prose, lines 438-438](../development-pack/modules/38_customer_portal.md#L438) -- **Displayed data/value expressions:**
- [ ] **e0333-c005** [source-code reference, lines 439-445](../development-pack/modules/38_customer_portal.md#L439) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0334: `resources/js/Pages/Portal/Returns/Show.vue`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0334). Complete every clause below before closing this section in the ledger.

- [ ] **e0334-c001** [prose, lines 455-456](../development-pack/modules/38_customer_portal.md#L455) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0334-c002** [prose, lines 458-458](../development-pack/modules/38_customer_portal.md#L458) -- **Visible table headers:**
- [ ] **e0334-c003** [source-code reference, lines 459-463](../development-pack/modules/38_customer_portal.md#L459) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0334-c004** [prose, lines 465-465](../development-pack/modules/38_customer_portal.md#L465) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0334-c005** [source-code reference, lines 466-469](../development-pack/modules/38_customer_portal.md#L466) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0334-c006** [prose, lines 471-471](../development-pack/modules/38_customer_portal.md#L471) -- **Displayed data/value expressions:**
- [ ] **e0334-c007** [source-code reference, lines 472-483](../development-pack/modules/38_customer_portal.md#L472) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0409: `app/Http/Controllers/Portal/Auth/PortalInvitationController.php`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0409). Complete every clause below before closing this section in the ledger.

- [ ] **e0409-c001** [source-code reference, lines 492-505](../development-pack/modules/38_customer_portal.md#L492) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0410: `app/Http/Controllers/Portal/Auth/PortalLoginController.php`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0410). Complete every clause below before closing this section in the ledger.

- [ ] **e0410-c001** [source-code reference, lines 514-538](../development-pack/modules/38_customer_portal.md#L514) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0411: `app/Http/Controllers/Portal/Auth/PortalPasswordResetController.php`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0411). Complete every clause below before closing this section in the ledger.

- [ ] **e0411-c001** [source-code reference, lines 547-571](../development-pack/modules/38_customer_portal.md#L547) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0412: `app/Http/Controllers/Portal/PortalController.php`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0412). Complete every clause below before closing this section in the ledger.

- [ ] **e0412-c001** [source-code reference, lines 580-589](../development-pack/modules/38_customer_portal.md#L580) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0413: `app/Http/Controllers/Portal/PortalDashboardController.php`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0413). Complete every clause below before closing this section in the ledger.

- [ ] **e0413-c001** [source-code reference, lines 598-601](../development-pack/modules/38_customer_portal.md#L598) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0414: `app/Http/Controllers/Portal/PortalOrderController.php`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0414). Complete every clause below before closing this section in the ledger.

- [ ] **e0414-c001** [source-code reference, lines 610-619](../development-pack/modules/38_customer_portal.md#L610) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0415: `app/Http/Controllers/Portal/PortalReturnController.php`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0415). Complete every clause below before closing this section in the ledger.

- [ ] **e0415-c001** [source-code reference, lines 628-652](../development-pack/modules/38_customer_portal.md#L628) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0437: Contract appendix `routes/portal.php:1-63`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0437). Complete every clause below before closing this section in the ledger.

- [ ] **e0437-c001** [source-code reference, lines 661-725](../development-pack/modules/38_customer_portal.md#L661) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0457: Supplemental complete source `app/Services/Portal/PortalInvitationService.php`

Source: [exact contract](../development-pack/modules/38_customer_portal.md#e0457). Complete every clause below before closing this section in the ledger.

- [ ] **e0457-c001** [source-code reference, lines 734-875](../development-pack/modules/38_customer_portal.md#L734) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/39_plugins_tax.md

### e0267: e0267

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0267). Complete every clause below before closing this section in the ledger.

- [ ] **e0267-c001** [prose, lines 101-101](../development-pack/modules/39_plugins_tax.md#L101) -- Installation-wide mutation needs manage_plugins AND plugin-administrator organization (routes/web/admin.php:49-72). Installed metadata/state, upload ZIP where enabled, activate/deactivate/de...
- [ ] **e0267-c002** [prose, lines 103-103](../development-pack/modules/39_plugins_tax.md#L103) -- Lifecycle manifest/version/slug/archive checks; activation hooks+assets then active row; deactivation persists inactive even if hook fails, reports failure; uninstall releases reservations/p...
- [ ] **e0267-c003** [prose, lines 105-105](../development-pack/modules/39_plugins_tax.md#L105) -- Extension points hooks/filters, menus/pages/runtime Vue bundles, tabs/widgets/page slots, validation/data, reports, webhooks, MCP. Hello-world demonstration UI not ERP functionality. All bun...

### e0268: Tax profile

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0268). Complete every clause below before closing this section in the ledger.

- [ ] **e0268-c001** [prose, lines 115-115](../development-pack/modules/39_plugins_tax.md#L115) -- mode generic(default)|india_gst; country required2 uppercase letters; issuer_name required max255; issuer_address required max2000; issuer_tax_id/region_code optional max80; tax_id_label req...

### e0269: Tax invoice

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0269). Complete every clause below before closing this section in the ledger.

- [ ] **e0269-c001** [prose, lines 125-125](../development-pack/modules/39_plugins_tax.md#L125) -- Issued snapshot OR issue form: confirmed false(must accepted); supply_country required2 uppercase; region_code optional max80; items keyed order item IDs, hsn_code optional max20 at controll...

### e0280: `plugins/hello-world/ui/src/HelloWorldBanner.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0280). Complete every clause below before closing this section in the ledger.

- [ ] **e0280-c001** [prose, lines 135-136](../development-pack/modules/39_plugins_tax.md#L135) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0280-c002** [prose, lines 138-138](../development-pack/modules/39_plugins_tax.md#L138) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0280-c003** [source-code reference, lines 139-141](../development-pack/modules/39_plugins_tax.md#L139) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0281: `plugins/hello-world/ui/src/HelloWorldPage.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0281). Complete every clause below before closing this section in the ledger.

- [ ] **e0281-c001** [prose, lines 151-152](../development-pack/modules/39_plugins_tax.md#L151) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0281-c002** [prose, lines 154-154](../development-pack/modules/39_plugins_tax.md#L154) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0281-c003** [source-code reference, lines 155-157](../development-pack/modules/39_plugins_tax.md#L155) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0281-c004** [prose, lines 159-159](../development-pack/modules/39_plugins_tax.md#L159) -- **Displayed data/value expressions:**
- [ ] **e0281-c005** [source-code reference, lines 160-163](../development-pack/modules/39_plugins_tax.md#L160) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0282: `plugins/hello-world/ui/src/HelloWorldTab.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0282). Complete every clause below before closing this section in the ledger.

- [ ] **e0282-c001** [prose, lines 173-174](../development-pack/modules/39_plugins_tax.md#L173) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0282-c002** [prose, lines 176-176](../development-pack/modules/39_plugins_tax.md#L176) -- **Displayed data/value expressions:**
- [ ] **e0282-c003** [source-code reference, lines 177-179](../development-pack/modules/39_plugins_tax.md#L177) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0283: `plugins/hello-world/ui/src/HelloWorldWidget.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0283). Complete every clause below before closing this section in the ledger.

- [ ] **e0283-c001** [prose, lines 189-190](../development-pack/modules/39_plugins_tax.md#L189) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0283-c002** [prose, lines 192-192](../development-pack/modules/39_plugins_tax.md#L192) -- **Displayed data/value expressions:**
- [ ] **e0283-c003** [source-code reference, lines 193-195](../development-pack/modules/39_plugins_tax.md#L193) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0284: `plugins/tax-billing/ui/src/CustomerFields.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0284). Complete every clause below before closing this section in the ledger.

- [ ] **e0284-c001** [prose, lines 205-205](../development-pack/modules/39_plugins_tax.md#L205) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0284-c002** [statement, lines 206-206](../development-pack/modules/39_plugins_tax.md#L206) -- - plugins/tax-billing/ui/src/CustomerFields.vue:10: &lt;input v-model="fields.region_code" :maxlength="mode === 'india_gst' ? 2 : 80" /&gt;
- [ ] **e0284-c003** [prose, lines 208-208](../development-pack/modules/39_plugins_tax.md#L208) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0284-c004** [source-code reference, lines 209-211](../development-pack/modules/39_plugins_tax.md#L209) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0284-c005** [prose, lines 213-213](../development-pack/modules/39_plugins_tax.md#L213) -- **Displayed data/value expressions:**
- [ ] **e0284-c006** [source-code reference, lines 214-217](../development-pack/modules/39_plugins_tax.md#L214) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0285: `plugins/tax-billing/ui/src/CustomerTaxDetails.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0285). Complete every clause below before closing this section in the ledger.

- [ ] **e0285-c001** [prose, lines 227-228](../development-pack/modules/39_plugins_tax.md#L227) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0285-c002** [prose, lines 230-230](../development-pack/modules/39_plugins_tax.md#L230) -- **Displayed data/value expressions:**
- [ ] **e0285-c003** [source-code reference, lines 231-233](../development-pack/modules/39_plugins_tax.md#L231) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0286: `plugins/tax-billing/ui/src/Invoice.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0286). Complete every clause below before closing this section in the ledger.

- [ ] **e0286-c001** [prose, lines 243-243](../development-pack/modules/39_plugins_tax.md#L243) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0286-c002** [statement, lines 244-244](../development-pack/modules/39_plugins_tax.md#L244) -- - plugins/tax-billing/ui/src/Invoice.vue:23: &lt;input v-model="form.supply_country" maxlength="2" @input="form.supply_country = form.supply_country.toUpperCase()" /&gt;
- [ ] **e0286-c003** [statement, lines 245-245](../development-pack/modules/39_plugins_tax.md#L245) -- - plugins/tax-billing/ui/src/Invoice.vue:24: &lt;input v-model="form.region_code" /&gt;
- [ ] **e0286-c004** [statement, lines 246-246](../development-pack/modules/39_plugins_tax.md#L246) -- - plugins/tax-billing/ui/src/Invoice.vue:33: &lt;input v-model="form.items&#91;item.id&#93;.hsn_code" :aria-label="t('hsnFor', { sku: item.sku })" /&gt;
- [ ] **e0286-c005** [statement, lines 247-247](../development-pack/modules/39_plugins_tax.md#L247) -- - plugins/tax-billing/ui/src/Invoice.vue:34: &lt;input v-model="form.items&#91;item.id&#93;.unit" :aria-label="t('unitFor', { sku: item.sku })" /&gt;
- [ ] **e0286-c006** [statement, lines 248-248](../development-pack/modules/39_plugins_tax.md#L248) -- - plugins/tax-billing/ui/src/Invoice.vue:39: &lt;input v-model="form.confirmed" type="checkbox" /&gt;
- [ ] **e0286-c007** [prose, lines 250-250](../development-pack/modules/39_plugins_tax.md#L250) -- **Form initial state/defaults:**
- [ ] **e0286-c008** [source-code reference, lines 251-253](../development-pack/modules/39_plugins_tax.md#L251) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0286-c009** [prose, lines 255-255](../development-pack/modules/39_plugins_tax.md#L255) -- **Displayed data/value expressions:**
- [ ] **e0286-c010** [source-code reference, lines 256-266](../development-pack/modules/39_plugins_tax.md#L256) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0287: `plugins/tax-billing/ui/src/InvoiceLink.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0287). Complete every clause below before closing this section in the ledger.

- [ ] **e0287-c001** [prose, lines 276-277](../development-pack/modules/39_plugins_tax.md#L276) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.

### e0288: `plugins/tax-billing/ui/src/Settings.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0288). Complete every clause below before closing this section in the ledger.

- [ ] **e0288-c001** [prose, lines 287-287](../development-pack/modules/39_plugins_tax.md#L287) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0288-c002** [statement, lines 288-288](../development-pack/modules/39_plugins_tax.md#L288) -- - plugins/tax-billing/ui/src/Settings.vue:19: &lt;select v-model="form.mode" @change="setMode"&gt;
- [ ] **e0288-c003** [statement, lines 289-289](../development-pack/modules/39_plugins_tax.md#L289) -- - plugins/tax-billing/ui/src/Settings.vue:20: &lt;input v-model="form.country" maxlength="2" placeholder="IN, GB, CA" @input="form.country = form.country.toUpperCase()" /&gt;
- [ ] **e0288-c004** [statement, lines 290-290](../development-pack/modules/39_plugins_tax.md#L290) -- - plugins/tax-billing/ui/src/Settings.vue:21: &lt;input v-model="form.issuer_name" autocomplete="organization" /&gt;
- [ ] **e0288-c005** [statement, lines 291-291](../development-pack/modules/39_plugins_tax.md#L291) -- - plugins/tax-billing/ui/src/Settings.vue:22: &lt;input v-model="form.issuer_tax_id" /&gt;
- [ ] **e0288-c006** [statement, lines 292-292](../development-pack/modules/39_plugins_tax.md#L292) -- - plugins/tax-billing/ui/src/Settings.vue:23: &lt;input v-model="form.region_code" /&gt;
- [ ] **e0288-c007** [statement, lines 293-293](../development-pack/modules/39_plugins_tax.md#L293) -- - plugins/tax-billing/ui/src/Settings.vue:24: &lt;input v-model="form.tax_id_label" :placeholder="t('taxIdentifierPlaceholder')" /&gt;
- [ ] **e0288-c008** [statement, lines 294-294](../development-pack/modules/39_plugins_tax.md#L294) -- - plugins/tax-billing/ui/src/Settings.vue:25: &lt;textarea v-model="form.issuer_address" rows="3" autocomplete="street-address" /&gt;
- [ ] **e0288-c009** [statement, lines 295-295](../development-pack/modules/39_plugins_tax.md#L295) -- - plugins/tax-billing/ui/src/Settings.vue:26: &lt;input v-model="form.size_option" /&gt;
- [ ] **e0288-c010** [statement, lines 296-296](../development-pack/modules/39_plugins_tax.md#L296) -- - plugins/tax-billing/ui/src/Settings.vue:28: &lt;input v-model="form.shipping_taxable" type="checkbox" /&gt;
- [ ] **e0288-c011** [statement, lines 297-297](../development-pack/modules/39_plugins_tax.md#L297) -- - plugins/tax-billing/ui/src/Settings.vue:34: &lt;input v-model="form.gst_rate" type="number" min="0" max="100" step="0.0001" /&gt;
- [ ] **e0288-c012** [statement, lines 298-298](../development-pack/modules/39_plugins_tax.md#L298) -- - plugins/tax-billing/ui/src/Settings.vue:35: &lt;select v-model="form.local_tax_label"&gt;
- [ ] **e0288-c013** [statement, lines 299-299](../development-pack/modules/39_plugins_tax.md#L299) -- - plugins/tax-billing/ui/src/Settings.vue:42: &lt;input v-model="component.label" /&gt;
- [ ] **e0288-c014** [statement, lines 300-300](../development-pack/modules/39_plugins_tax.md#L300) -- - plugins/tax-billing/ui/src/Settings.vue:43: &lt;input v-model="component.rate" type="number" min="0" max="100" step="0.0001" /&gt;
- [ ] **e0288-c015** [prose, lines 302-302](../development-pack/modules/39_plugins_tax.md#L302) -- **Form initial state/defaults:**
- [ ] **e0288-c016** [source-code reference, lines 303-305](../development-pack/modules/39_plugins_tax.md#L303) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0288-c017** [prose, lines 307-307](../development-pack/modules/39_plugins_tax.md#L307) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0288-c018** [source-code reference, lines 308-313](../development-pack/modules/39_plugins_tax.md#L308) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0288-c019** [prose, lines 315-315](../development-pack/modules/39_plugins_tax.md#L315) -- **Displayed data/value expressions:**
- [ ] **e0288-c020** [source-code reference, lines 316-318](../development-pack/modules/39_plugins_tax.md#L316) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0324: `resources/js/Pages/Plugins/Index.vue`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0324). Complete every clause below before closing this section in the ledger.

- [ ] **e0324-c001** [prose, lines 328-328](../development-pack/modules/39_plugins_tax.md#L328) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0324-c002** [statement, lines 329-329](../development-pack/modules/39_plugins_tax.md#L329) -- - resources/js/Pages/Plugins/Index.vue:201: &lt;Input v-model="connectForm.token" type="password" :invalid="!!connectForm.errors.token" /&gt;
- [ ] **e0324-c003** [statement, lines 330-330](../development-pack/modules/39_plugins_tax.md#L330) -- - resources/js/Pages/Plugins/Index.vue:327: &lt;input ref="fileInput" id="plugin-upload" type="file" accept=".zip" @change="handleFileSelect" /&gt;
- [ ] **e0324-c004** [prose, lines 332-332](../development-pack/modules/39_plugins_tax.md#L332) -- **Form initial state/defaults:**
- [ ] **e0324-c005** [source-code reference, lines 333-338](../development-pack/modules/39_plugins_tax.md#L333) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0324-c006** [prose, lines 340-340](../development-pack/modules/39_plugins_tax.md#L340) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0324-c007** [source-code reference, lines 341-357](../development-pack/modules/39_plugins_tax.md#L341) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0324-c008** [prose, lines 359-359](../development-pack/modules/39_plugins_tax.md#L359) -- **Displayed data/value expressions:**
- [ ] **e0324-c009** [source-code reference, lines 360-375](../development-pack/modules/39_plugins_tax.md#L360) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0389: `app/Http/Controllers/Admin/PluginController.php`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0389). Complete every clause below before closing this section in the ledger.

- [ ] **e0389-c001** [source-code reference, lines 384-396](../development-pack/modules/39_plugins_tax.md#L384) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0390: `app/Http/Controllers/Admin/PluginMarketplaceController.php`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0390). Complete every clause below before closing this section in the ledger.

- [ ] **e0390-c001** [source-code reference, lines 405-421](../development-pack/modules/39_plugins_tax.md#L405) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0426: `plugins/tax-billing/src/Controller.php`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0426). Complete every clause below before closing this section in the ledger.

- [ ] **e0426-c001** [source-code reference, lines 430-447](../development-pack/modules/39_plugins_tax.md#L430) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0427: `plugins/tax-billing/src/Invoices.php`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0427). Complete every clause below before closing this section in the ledger.

- [ ] **e0427-c001** [source-code reference, lines 456-467](../development-pack/modules/39_plugins_tax.md#L456) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0428: `plugins/tax-billing/src/Profile.php`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0428). Complete every clause below before closing this section in the ledger.

- [ ] **e0428-c001** [source-code reference, lines 476-512](../development-pack/modules/39_plugins_tax.md#L476) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0439: Contract appendix `plugins/tax-billing/Plugin.php:1-88`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0439). Complete every clause below before closing this section in the ledger.

- [ ] **e0439-c001** [source-code reference, lines 521-610](../development-pack/modules/39_plugins_tax.md#L521) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0449: `plugins/tax-billing/src/Invoices.php`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0449). Complete every clause below before closing this section in the ledger.

- [ ] **e0449-c001** [source-code reference, lines 620-797](../development-pack/modules/39_plugins_tax.md#L620) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0459: Supplemental complete source `app/Support/PluginAdministration.php`

Source: [exact contract](../development-pack/modules/39_plugins_tax.md#e0459). Complete every clause below before closing this section in the ledger.

- [ ] **e0459-c001** [source-code reference, lines 806-862](../development-pack/modules/39_plugins_tax.md#L806) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/40_operations.md

### e0270: e0270

Source: [exact contract](../development-pack/modules/40_operations.md#e0270). Complete every clause below before closing this section in the ledger.

- [ ] **e0270-c001** [prose, lines 94-94](../development-pack/modules/40_operations.md#L94) -- Installer welcome→requirements→DB→organization/admin→complete. driver mysql|pgsql,host(localhost),port(3306/5432),database,username required;password optional. Connection test then installat...
- [ ] **e0270-c002** [prose, lines 96-96](../development-pack/modules/40_operations.md#L96) -- Update view current/latest/release info;check,backup,list,perform,restore/delete backup. Table filename/size/created/actions. restore/delete backup_file required basename /^&#91;A-Za-z0-9._-&#93;+\....

### e0302: `resources/js/Pages/Admin/Update/Index.vue`

Source: [exact contract](../development-pack/modules/40_operations.md#e0302). Complete every clause below before closing this section in the ledger.

- [ ] **e0302-c001** [prose, lines 106-107](../development-pack/modules/40_operations.md#L106) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0302-c002** [prose, lines 109-109](../development-pack/modules/40_operations.md#L109) -- **Visible table headers:**
- [ ] **e0302-c003** [source-code reference, lines 110-115](../development-pack/modules/40_operations.md#L110) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0302-c004** [prose, lines 117-117](../development-pack/modules/40_operations.md#L117) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0302-c005** [source-code reference, lines 118-139](../development-pack/modules/40_operations.md#L118) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0302-c006** [prose, lines 141-141](../development-pack/modules/40_operations.md#L141) -- **Displayed data/value expressions:**
- [ ] **e0302-c007** [source-code reference, lines 142-156](../development-pack/modules/40_operations.md#L142) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0318: `resources/js/Pages/Install/Admin.vue`

Source: [exact contract](../development-pack/modules/40_operations.md#e0318). Complete every clause below before closing this section in the ledger.

- [ ] **e0318-c001** [prose, lines 166-166](../development-pack/modules/40_operations.md#L166) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0318-c002** [statement, lines 167-167](../development-pack/modules/40_operations.md#L167) -- - resources/js/Pages/Install/Admin.vue:88: &lt;input id="organization_name" v-model="form.organization_name" type="text" required :placeholder="t('install.admin.orgNamePlaceholder')" /&gt;
- [ ] **e0318-c003** [statement, lines 168-168](../development-pack/modules/40_operations.md#L168) -- - resources/js/Pages/Install/Admin.vue:107: &lt;input id="admin_name" v-model="form.admin_name" type="text" required :placeholder="t('install.admin.fullNamePlaceholder')" /&gt;
- [ ] **e0318-c004** [statement, lines 169-169](../development-pack/modules/40_operations.md#L169) -- - resources/js/Pages/Install/Admin.vue:122: &lt;input id="admin_email" v-model="form.admin_email" type="email" required placeholder="admin@example.com" /&gt;
- [ ] **e0318-c005** [statement, lines 170-170](../development-pack/modules/40_operations.md#L170) -- - resources/js/Pages/Install/Admin.vue:137: &lt;input id="admin_password" v-model="form.admin_password" type="password" required minlength="8" :placeholder="t('install.admin.passwordHint')" /&gt;
- [ ] **e0318-c006** [statement, lines 171-171](../development-pack/modules/40_operations.md#L171) -- - resources/js/Pages/Install/Admin.vue:153: &lt;input id="admin_password_confirmation" v-model="form.admin_password_confirmation" type="password" required minlength="8" :placeholder="t('install...
- [ ] **e0318-c007** [prose, lines 173-173](../development-pack/modules/40_operations.md#L173) -- **Form initial state/defaults:**
- [ ] **e0318-c008** [source-code reference, lines 174-182](../development-pack/modules/40_operations.md#L174) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0318-c009** [prose, lines 184-184](../development-pack/modules/40_operations.md#L184) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0318-c010** [source-code reference, lines 185-190](../development-pack/modules/40_operations.md#L185) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0318-c011** [prose, lines 192-192](../development-pack/modules/40_operations.md#L192) -- **Displayed data/value expressions:**
- [ ] **e0318-c012** [source-code reference, lines 193-195](../development-pack/modules/40_operations.md#L193) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0319: `resources/js/Pages/Install/Complete.vue`

Source: [exact contract](../development-pack/modules/40_operations.md#e0319). Complete every clause below before closing this section in the ledger.

- [ ] **e0319-c001** [prose, lines 205-206](../development-pack/modules/40_operations.md#L205) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.

### e0320: `resources/js/Pages/Install/Database.vue`

Source: [exact contract](../development-pack/modules/40_operations.md#e0320). Complete every clause below before closing this section in the ledger.

- [ ] **e0320-c001** [prose, lines 216-216](../development-pack/modules/40_operations.md#L216) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0320-c002** [statement, lines 217-217](../development-pack/modules/40_operations.md#L217) -- - resources/js/Pages/Install/Database.vue:160: &lt;input v-model="confirmReset" type="checkbox" /&gt;
- [ ] **e0320-c003** [statement, lines 218-218](../development-pack/modules/40_operations.md#L218) -- - resources/js/Pages/Install/Database.vue:185: &lt;select id="driver" v-model="form.driver" required &gt;
- [ ] **e0320-c004** [statement, lines 219-219](../development-pack/modules/40_operations.md#L219) -- - resources/js/Pages/Install/Database.vue:201: &lt;input id="host" v-model="form.host" type="text" required placeholder="localhost" /&gt;
- [ ] **e0320-c005** [statement, lines 220-220](../development-pack/modules/40_operations.md#L220) -- - resources/js/Pages/Install/Database.vue:216: &lt;input id="port" v-model.number="form.port" type="number" required :placeholder="String(DEFAULT_PORTS&#91;form.driver&#93;)" /&gt;
- [ ] **e0320-c006** [statement, lines 221-221](../development-pack/modules/40_operations.md#L221) -- - resources/js/Pages/Install/Database.vue:231: &lt;input id="database" v-model="form.database" type="text" required placeholder="inventoros" /&gt;
- [ ] **e0320-c007** [statement, lines 222-222](../development-pack/modules/40_operations.md#L222) -- - resources/js/Pages/Install/Database.vue:246: &lt;input id="username" v-model="form.username" type="text" required placeholder="root" /&gt;
- [ ] **e0320-c008** [statement, lines 223-223](../development-pack/modules/40_operations.md#L223) -- - resources/js/Pages/Install/Database.vue:261: &lt;input id="password" v-model="form.password" type="password" :placeholder="t('install.database.passwordHint')" /&gt;
- [ ] **e0320-c009** [prose, lines 225-225](../development-pack/modules/40_operations.md#L225) -- **Form initial state/defaults:**
- [ ] **e0320-c010** [source-code reference, lines 226-235](../development-pack/modules/40_operations.md#L226) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0320-c011** [prose, lines 237-237](../development-pack/modules/40_operations.md#L237) -- **Select option values/labels (dynamic options retain their source):**
- [ ] **e0320-c012** [source-code reference, lines 238-241](../development-pack/modules/40_operations.md#L238) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0320-c013** [prose, lines 243-243](../development-pack/modules/40_operations.md#L243) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0320-c014** [source-code reference, lines 244-252](../development-pack/modules/40_operations.md#L244) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0320-c015** [prose, lines 254-254](../development-pack/modules/40_operations.md#L254) -- **Displayed data/value expressions:**
- [ ] **e0320-c016** [source-code reference, lines 255-259](../development-pack/modules/40_operations.md#L255) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0321: `resources/js/Pages/Install/Requirements.vue`

Source: [exact contract](../development-pack/modules/40_operations.md#e0321). Complete every clause below before closing this section in the ledger.

- [ ] **e0321-c001** [prose, lines 269-270](../development-pack/modules/40_operations.md#L269) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0321-c002** [prose, lines 272-272](../development-pack/modules/40_operations.md#L272) -- **Displayed data/value expressions:**
- [ ] **e0321-c003** [source-code reference, lines 273-277](../development-pack/modules/40_operations.md#L273) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0322: `resources/js/Pages/Install/Welcome.vue`

Source: [exact contract](../development-pack/modules/40_operations.md#e0322). Complete every clause below before closing this section in the ledger.

- [ ] **e0322-c001** [prose, lines 287-288](../development-pack/modules/40_operations.md#L287) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.

### e0393: `app/Http/Controllers/Admin/UpdateController.php`

Source: [exact contract](../development-pack/modules/40_operations.md#e0393). Complete every clause below before closing this section in the ledger.

- [ ] **e0393-c001** [source-code reference, lines 297-314](../development-pack/modules/40_operations.md#L297) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0406: `app/Http/Controllers/Install/InstallerController.php`

Source: [exact contract](../development-pack/modules/40_operations.md#e0406). Complete every clause below before closing this section in the ledger.

- [ ] **e0406-c001** [source-code reference, lines 323-434](../development-pack/modules/40_operations.md#L323) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## modules/41_replenishment.md

### e0013: Replenishment and warehouse thresholds

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0013). Complete every clause below before closing this section in the ledger.

- [ ] **e0013-c001** [statement, lines 91-91](../development-pack/modules/41_replenishment.md#L91) -- - Product-level warehouse table shows warehouse/on-hand plus min_stock/reorder_point/reorder_quantity/max_stock; blanks inherit product defaults; max cannot be below a provided min/reorder p...
- [ ] **e0013-c002** [statement, lines 92-92](../development-pack/modules/41_replenishment.md#L92) -- - Variant policy requires active non-kit variant parent, active warehouse/supplier/receiving location; receiving location belongs to chosen warehouse. Variant and warehouse cannot change on ...
- [ ] **e0013-c003** [statement, lines 93-93](../development-pack/modules/41_replenishment.md#L93) -- - Policy forecast = on-hand bins plus outstanding eligible draft/sent/partial PO quantity. Generates a **draft PO**, not automatically received inventory. Target must exceed reorder point; m...

### e0019: Inventory/VariantReplenishment

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0019). Complete every clause below before closing this section in the ledger.

- [ ] **e0019-c001** [prose, lines 103-103](../development-pack/modules/41_replenishment.md#L103) -- GET /variant-replenishment; view_products. Search paginated policy cards. Show product/variant, warehouse/location/supplier and forecast values on_hand, incoming, projected, suggested. New/E...
- [ ] **e0019-c002** [prose, lines 105-105](../development-pack/modules/41_replenishment.md#L105) -- Source: resources/js/Pages/Inventory/VariantReplenishment.vue:1.
- [ ] **e0019-c003** [prose, lines 107-107](../development-pack/modules/41_replenishment.md#L107) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0019-c004** [source-code reference, lines 109-134](../development-pack/modules/41_replenishment.md#L109) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0019-c005** [prose, lines 136-136](../development-pack/modules/41_replenishment.md#L136) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0019-c006** [table row, lines 138-138](../development-pack/modules/41_replenishment.md#L138) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0019-c007** [table row, lines 140-140](../development-pack/modules/41_replenishment.md#L140) -- search — resources/js/Pages/Inventory/VariantReplenishment.vue:109  /  Search  /  search; props.filters.search  /  v-model="search"; type="search"; maxlength="200"  /  Always within this vie...
- [ ] **e0019-c008** [table row, lines 141-141](../development-pack/modules/41_replenishment.md#L141) -- variantSearch — resources/js/Pages/Inventory/VariantReplenishment.vue:148  /  Variant  /  search; ''  /  v-model="variantSearch"; type="search"; maxlength="100"; :disabled="Boolean(editing)"...
- [ ] **e0019-c009** [table row, lines 142-142](../development-pack/modules/41_replenishment.md#L142) -- form.product_variant_id — resources/js/Pages/Inventory/VariantReplenishment.vue:149  /  Variant  /  select; ''  /  ; v-model.number="form.product_variant_id"; required; :disabled="Boolean(ed...
- [ ] **e0019-c010** [table row, lines 143-143](../development-pack/modules/41_replenishment.md#L143) -- form.warehouse_id — resources/js/Pages/Inventory/VariantReplenishment.vue:152  /  Warehouses  /  select; ''  /  ; v-model.number="form.warehouse_id"; required; :disabled="Boolean(editing) \ ...
- [ ] **e0019-c011** [table row, lines 144-144](../development-pack/modules/41_replenishment.md#L144) -- locationSearch — resources/js/Pages/Inventory/VariantReplenishment.vue:155  /  Location  /  search; ''  /  v-model="locationSearch"; type="search"; maxlength="100"; @change="loadOptions"  / ...
- [ ] **e0019-c012** [table row, lines 145-145](../development-pack/modules/41_replenishment.md#L145) -- form.location_id — resources/js/Pages/Inventory/VariantReplenishment.vue:156  /  Location  /  select; ''  /  ; v-model.number="form.location_id"; required; :disabled="loading"  /  Always wit...
- [ ] **e0019-c013** [table row, lines 146-146](../development-pack/modules/41_replenishment.md#L146) -- supplierSearch — resources/js/Pages/Inventory/VariantReplenishment.vue:159  /  Supplier  /  search; ''  /  v-model="supplierSearch"; type="search"; maxlength="100"; @change="loadOptions"  / ...
- [ ] **e0019-c014** [table row, lines 147-147](../development-pack/modules/41_replenishment.md#L147) -- form.supplier_id — resources/js/Pages/Inventory/VariantReplenishment.vue:160  /  Supplier  /  select; ''  /  ; v-model.number="form.supplier_id"; required; :disabled="loading"; @change="supp...
- [ ] **e0019-c015** [table row, lines 148-148](../development-pack/modules/41_replenishment.md#L148) -- form&#91;field.key&#93; — resources/js/Pages/Inventory/VariantReplenishment.vue:163  /  t(field.label)  /  number; Derived/repeating value; see initial payload / owning child notes  /  v-model.numbe...
- [ ] **e0019-c016** [table row, lines 149-149](../development-pack/modules/41_replenishment.md#L149) -- form.unit_cost — resources/js/Pages/Inventory/VariantReplenishment.vue:166  /  Unit Cost ( form.currency )  /  number; ''  /  v-model="form.unit_cost"; type="number"; min="0"; max="999999999...
- [ ] **e0019-c017** [table row, lines 150-150](../development-pack/modules/41_replenishment.md#L150) -- form.supplier_sku — resources/js/Pages/Inventory/VariantReplenishment.vue:169  /  Supplier SKU  /  input; ''  /  v-model="form.supplier_sku"; maxlength="255"  /  Always within this view/dial...
- [ ] **e0019-c018** [table row, lines 151-151](../development-pack/modules/41_replenishment.md#L151) -- form.auto_reorder — resources/js/Pages/Inventory/VariantReplenishment.vue:172  /  Create drafts automatically each day  /  checkbox; false  /  v-model="form.auto_reorder"; type="checkbox"  /...
- [ ] **e0019-c019** [prose, lines 153-153](../development-pack/modules/41_replenishment.md#L153) -- **Select options and labels (exact source, including remote lists):**
- [ ] **e0019-c020** [statement, lines 155-155](../development-pack/modules/41_replenishment.md#L155) -- - form.product_variant_id (resources/js/Pages/Inventory/VariantReplenishment.vue:149): &amp;lt;option value="" disabled&amp;gt;-&amp;lt;/option&amp;gt;&amp;lt;option v-for="v in options.variants" :key="v.id" :v...
- [ ] **e0019-c021** [statement, lines 156-156](../development-pack/modules/41_replenishment.md#L156) -- - form.warehouse_id (resources/js/Pages/Inventory/VariantReplenishment.vue:152): &amp;lt;option value="" disabled&amp;gt;-&amp;lt;/option&amp;gt;&amp;lt;option v-for="w in options.warehouses" :key="w.id" :value...
- [ ] **e0019-c022** [statement, lines 157-157](../development-pack/modules/41_replenishment.md#L157) -- - form.location_id (resources/js/Pages/Inventory/VariantReplenishment.vue:156): &amp;lt;option value="" disabled&amp;gt;-&amp;lt;/option&amp;gt;&amp;lt;option v-for="l in options.locations" :key="l.id" :value="...
- [ ] **e0019-c023** [statement, lines 158-158](../development-pack/modules/41_replenishment.md#L158) -- - form.supplier_id (resources/js/Pages/Inventory/VariantReplenishment.vue:160): &amp;lt;option value="" disabled&amp;gt;-&amp;lt;/option&amp;gt;&amp;lt;option v-for="s in options.suppliers" :key="s.id" :value="...
- [ ] **e0019-c024** [prose, lines 160-160](../development-pack/modules/41_replenishment.md#L160) -- **Read fields, columns and section headings:**
- [ ] **e0019-c025** [statement, lines 162-162](../development-pack/modules/41_replenishment.md#L162) -- - h2: policy.product_name · policy.variant?.title — resources/js/Pages/Inventory/VariantReplenishment.vue:117 — v-for="policy in policies.data"
- [ ] **e0019-c026** [statement, lines 163-163](../development-pack/modules/41_replenishment.md#L163) -- - dt: t(variantReplenishment.${key}) — resources/js/Pages/Inventory/VariantReplenishment.vue:121 — v-for="policy in policies.data" → v-for="key in &#91;'on_hand', 'incoming', 'position', 'sugges...
- [ ] **e0019-c027** [statement, lines 164-164](../development-pack/modules/41_replenishment.md#L164) -- - h2: Add replenishment rule — resources/js/Pages/Inventory/VariantReplenishment.vue:144
- [ ] **e0019-c028** [prose, lines 166-166](../development-pack/modules/41_replenishment.md#L166) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0019-c029** [table row, lines 168-168](../development-pack/modules/41_replenishment.md#L168) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0019-c030** [table row, lines 170-170](../development-pack/modules/41_replenishment.md#L170) -- Add replenishment rule — resources/js/Pages/Inventory/VariantReplenishment.vue:103  /  v-if="hasPermission('edit_products')"; @click="open()"  /  No ancestor condition
- [ ] **e0019-c031** [table row, lines 171-171](../development-pack/modules/41_replenishment.md#L171) -- Create draft PO — resources/js/Pages/Inventory/VariantReplenishment.vue:131  /  v-if="hasPermission('create_purchase_orders')"; size="sm"; :disabled="!policy.available \ / \ /  !policy.forec...
- [ ] **e0019-c032** [table row, lines 172-172](../development-pack/modules/41_replenishment.md#L172) -- Edit — resources/js/Pages/Inventory/VariantReplenishment.vue:132  /  v-if="hasPermission('edit_products')"; size="sm"; variant="secondary"; @click="open(policy)"  /  v-for="policy in policie...
- [ ] **e0019-c033** [table row, lines 173-173](../development-pack/modules/41_replenishment.md#L173) -- Delete — resources/js/Pages/Inventory/VariantReplenishment.vue:133  /  v-if="hasPermission('edit_products')"; size="sm"; variant="danger"; @click="remove(policy)"  /  v-for="policy in polici...
- [ ] **e0019-c034** [table row, lines 174-174](../development-pack/modules/41_replenishment.md#L174) -- Previous — resources/js/Pages/Inventory/VariantReplenishment.vue:138  /  v-if="policies.prev_page_url"; :href="policies.prev_page_url"  /  v-if="policies.last_page &amp;gt; 1"
- [ ] **e0019-c035** [table row, lines 175-175](../development-pack/modules/41_replenishment.md#L175) -- Next — resources/js/Pages/Inventory/VariantReplenishment.vue:140  /  v-if="policies.next_page_url"; :href="policies.next_page_url"  /  v-if="policies.last_page &amp;gt; 1"
- [ ] **e0019-c036** [table row, lines 176-176](../development-pack/modules/41_replenishment.md#L176) -- Search options — resources/js/Pages/Inventory/VariantReplenishment.vue:173  /  variant="secondary"; :loading="loading"; @click="loadOptions"  /  No ancestor condition
- [ ] **e0019-c037** [table row, lines 177-177](../development-pack/modules/41_replenishment.md#L177) -- Cancel — resources/js/Pages/Inventory/VariantReplenishment.vue:176  /  variant="secondary"; :disabled="form.processing"; @click="show = false"  /  No ancestor condition
- [ ] **e0019-c038** [table row, lines 178-178](../development-pack/modules/41_replenishment.md#L178) -- Save — resources/js/Pages/Inventory/VariantReplenishment.vue:176  /  type="submit"; :disabled="form.processing \ / \ /  loading"; :loading="form.processing"  /  No ancestor condition
- [ ] **e0019-c039** [prose, lines 180-180](../development-pack/modules/41_replenishment.md#L180) -- **Script endpoint names:** variant-replenishment.options, variant-replenishment.update, variant-replenishment.store, variant-replenishment.draft, variant-replenishment.destroy. Match these t...

### e0051: Components/WarehouseStockLevels

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0051). Complete every clause below before closing this section in the ledger.

- [ ] **e0051-c001** [prose, lines 190-190](../development-pack/modules/41_replenishment.md#L190) -- Per-product warehouse thresholds with optional editing. Dynamic field loop expands min_stock/reorder_point/reorder_quantity/max_stock for every warehouse row. Blank transforms to null (inher...
- [ ] **e0051-c002** [prose, lines 192-192](../development-pack/modules/41_replenishment.md#L192) -- Source: resources/js/Components/WarehouseStockLevels.vue:1.
- [ ] **e0051-c003** [prose, lines 194-194](../development-pack/modules/41_replenishment.md#L194) -- **Initial payload and local-state defaults (exact source expressions):**
- [ ] **e0051-c004** [source-code reference, lines 196-207](../development-pack/modules/41_replenishment.md#L196) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0051-c005** [prose, lines 209-209](../development-pack/modules/41_replenishment.md#L209) -- **Every input/bound component, including dialogs and row fields:**
- [ ] **e0051-c006** [table row, lines 211-211](../development-pack/modules/41_replenishment.md#L211) -- Key / source  /  Visible label  /  Control and initial value  /  Required / constraints / dependencies (exact UI attributes)  /  Ancestor condition / repetition
- [ ] **e0051-c007** [table row, lines 213-213](../development-pack/modules/41_replenishment.md#L213) -- form.levels&#91;index&#93;&#91;field&#93; — resources/js/Components/WarehouseStockLevels.vue:84  /  No explicit label / see context  /  number; Derived/repeating value; see initial payload / owning child no...
- [ ] **e0051-c008** [prose, lines 215-215](../development-pack/modules/41_replenishment.md#L215) -- **Read fields, columns and section headings:**
- [ ] **e0051-c009** [statement, lines 217-217](../development-pack/modules/41_replenishment.md#L217) -- - h3: Stock by warehouse — resources/js/Components/WarehouseStockLevels.vue:53
- [ ] **e0051-c010** [statement, lines 218-218](../development-pack/modules/41_replenishment.md#L218) -- - th: Warehouse — resources/js/Components/WarehouseStockLevels.vue:64 — v-else
- [ ] **e0051-c011** [statement, lines 219-219](../development-pack/modules/41_replenishment.md#L219) -- - th: On hand — resources/js/Components/WarehouseStockLevels.vue:65 — v-else
- [ ] **e0051-c012** [statement, lines 220-220](../development-pack/modules/41_replenishment.md#L220) -- - th: t(warehouses.stockLevels.${field}) — resources/js/Components/WarehouseStockLevels.vue:66 — v-else
- [ ] **e0051-c013** [prose, lines 222-222](../development-pack/modules/41_replenishment.md#L222) -- **Actions/navigation, visibility and disabling conditions:**
- [ ] **e0051-c014** [table row, lines 224-224](../development-pack/modules/41_replenishment.md#L224) -- Label / source  /  Handler / route / exact constraints  /  Conditional ancestry
- [ ] **e0051-c015** [table row, lines 226-226](../development-pack/modules/41_replenishment.md#L226) -- Save warehouse levels — resources/js/Components/WarehouseStockLevels.vue:103  /  type="submit"; variant="default"; size="sm"; :loading="form.processing"; :disabled="form.processing"  /  v-el...
- [ ] **e0051-c016** [prose, lines 228-228](../development-pack/modules/41_replenishment.md#L228) -- **Script endpoint names:** products.warehouse-levels.update. Match these to verb/path/permission in the route annex.

### e0061: Product/UpdateWarehouseStockLevelsRequest.php

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0061). Complete every clause below before closing this section in the ledger.

- [ ] **e0061-c001** [prose, lines 238-238](../development-pack/modules/41_replenishment.md#L238) -- Source app/Http/Requests/Product/UpdateWarehouseStockLevelsRequest.php:1
- [ ] **e0061-c002** [source-code reference, lines 240-312](../development-pack/modules/41_replenishment.md#L240) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0084: VariantReplenishmentService.php — 30-81

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0084). Complete every clause below before closing this section in the ledger.

- [ ] **e0084-c001** [prose, lines 322-322](../development-pack/modules/41_replenishment.md#L322) -- Source app/Services/VariantReplenishmentService.php:30
- [ ] **e0084-c002** [source-code reference, lines 324-377](../development-pack/modules/41_replenishment.md#L324) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0101: WarehouseReorderPoint

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0101). Complete every clause below before closing this section in the ledger.

- [ ] **e0101-c001** [prose, lines 386-386](../development-pack/modules/41_replenishment.md#L386) -- app/Models/Inventory/WarehouseReorderPoint.php:1
- [ ] **e0101-c002** [source-code reference, lines 388-413](../development-pack/modules/41_replenishment.md#L388) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0114: VariantReplenishmentPolicy

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0114). Complete every clause below before closing this section in the ledger.

- [ ] **e0114-c001** [prose, lines 422-422](../development-pack/modules/41_replenishment.md#L422) -- app/Models/Inventory/VariantReplenishmentPolicy.php:1
- [ ] **e0114-c002** [source-code reference, lines 424-440](../development-pack/modules/41_replenishment.md#L424) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0129: 2026_03_12_000001_add_reorder_columns_to_products_table.php

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0129). Complete every clause below before closing this section in the ledger.

- [ ] **e0129-c001** [prose, lines 449-449](../development-pack/modules/41_replenishment.md#L449) -- database/migrations/2026_03_12_000001_add_reorder_columns_to_products_table.php:1
- [ ] **e0129-c002** [source-code reference, lines 451-457](../development-pack/modules/41_replenishment.md#L451) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0145: 2026_09_28_000003_create_warehouse_reorder_points_table.php

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0145). Complete every clause below before closing this section in the ledger.

- [ ] **e0145-c001** [prose, lines 466-466](../development-pack/modules/41_replenishment.md#L466) -- database/migrations/2026_09_28_000003_create_warehouse_reorder_points_table.php:1
- [ ] **e0145-c002** [source-code reference, lines 468-481](../development-pack/modules/41_replenishment.md#L468) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0160: 2026_10_27_000003_create_variant_replenishment_policies.php

Source: [exact contract](../development-pack/modules/41_replenishment.md#e0160). Complete every clause below before closing this section in the ledger.

- [ ] **e0160-c001** [prose, lines 490-490](../development-pack/modules/41_replenishment.md#L490) -- database/migrations/2026_10_27_000003_create_variant_replenishment_policies.php:1
- [ ] **e0160-c002** [source-code reference, lines 492-513](../development-pack/modules/41_replenishment.md#L492) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

## shared/additional-contracts.md

### e0473: e0473

Source: [exact contract](../development-pack/shared/additional-contracts.md#e0473). Complete every clause below before closing this section in the ledger.

- [ ] **e0473-c001** [prose, lines 15-15](../development-pack/shared/additional-contracts.md#L15) -- The source page inventory was complete before this appendix. A final independent path comparison identified the following API request subclasses and enum files not explicitly named by full r...
- [ ] **e0473-c002** [prose, lines 17-17](../development-pack/shared/additional-contracts.md#L17) -- Inventory: **76 request files; 11 enum files**. Supplemented here: **36 files**.

## shared/commerce.md

### e0162: e0162

Source: [exact contract](../development-pack/shared/commerce.md#e0162). **Reference-only heading:** no body clauses in the supplied pack. Preserve this traceability anchor; it supplies no implementation or acceptance proof.


### e0163: e0163

Source: [exact contract](../development-pack/shared/commerce.md#e0163). Complete every clause below before closing this section in the ledger.

- [ ] **e0163-c001** [statement, lines 37-37](../development-pack/shared/commerce.md#L37) -- - Audit date: 2026-11-06. Source checkout: C:\Users\proj\Inventoros, commit 1f78e818d9aee025020fe7489955f4f0c448c53a.
- [ ] **e0163-c002** [statement, lines 38-38](../development-pack/shared/commerce.md#L38) -- - **Source-derived specification, not runtime acceptance.** This audit did not run the app, transactions, tests, carriers or email. Parent browser evidence is a separate layer. No source cha...
- [ ] **e0163-c003** [statement, lines 39-39](../development-pack/shared/commerce.md#L39) -- - Owns all 25 Vue pages in Customers (4), Suppliers (4), Orders (4), PurchaseOrders (5), Returns (4), WorkOrders (3), Approvals (1), plus nested customer picker, portal-contact invite, payme...
- [ ] **e0163-c004** [statement, lines 40-40](../development-pack/shared/commerce.md#L40) -- - Target Taruvi-native datatable schemas must be confirmed independently. Source keys below are authoritative **source contracts**, not instructions to blindly create target tables. Server-g...
- [ ] **e0163-c005** [statement, lines 41-41](../development-pack/shared/commerce.md#L41) -- - Read the human workflow rules first, then each page's control inventory and exact initializer, then server rules and relationships. Initializers distinguish create defaults from edit hydra...
- [ ] **e0163-c006** [statement, lines 42-42](../development-pack/shared/commerce.md#L42) -- - English labels resolve from resources/js/i18n/locales/en.json. Dynamic labels/loop expressions are retained, not invented. Repeated item bindings (item.quantity) mean the relevant items&#91;&#93; ...

### e0164: e0164

Source: [exact contract](../development-pack/shared/commerce.md#e0164). **Reference-only heading:** no body clauses in the supplied pack. Preserve this traceability anchor; it supplies no implementation or acceptance proof.


### e0165: Customers and suppliers

Source: [exact contract](../development-pack/shared/commerce.md#e0165). Complete every clause below before closing this section in the ledger.

- [ ] **e0165-c001** [prose, lines 60-60](../development-pack/shared/commerce.md#L60) -- Customers have 22 core editable fields plus plugin-defined fields: name, code, company/contact identity, email/phone, billing and shipping addresses (five each), tax ID, payment terms, credi...
- [ ] **e0165-c002** [prose, lines 62-62](../development-pack/shared/commerce.md#L62) -- Create defaults: strings blank, active true, currency from organization; supplier rating null; customer credit limit blank. SupplierRating offers 1..5 stars and clicking the selected rating ...
- [ ] **e0165-c003** [prose, lines 64-64](../development-pack/shared/commerce.md#L64) -- Customer “same as billing” switch copies five billing values into shipping once on toggle. It is not a continuously linked address; toggling off must not erase values. Edit initializes switc...
- [ ] **e0165-c004** [prose, lines 66-66](../development-pack/shared/commerce.md#L66) -- Customer Show includes recent orders, total spend derived from supplied orders, business detail and portal access. Portal invitation fields are name and email; both required/max255, email no...

### e0173: e0173

Source: [exact contract](../development-pack/shared/commerce.md#e0173). Complete every clause below before closing this section in the ledger.

- [ ] **e0173-c001** [prose, lines 76-76](../development-pack/shared/commerce.md#L76) -- For each page below implement: accessible layout, actual data loading, server filters/paging, empty/no-result/denied/error/loading states, exact form semantics, backend-enforced ownership an...
- [ ] **e0173-c002** [prose, lines 78-78](../development-pack/shared/commerce.md#L78) -- Acceptance scenarios (not executed by this source audit):
- [ ] **e0173-c003** [statement, lines 80-80](../development-pack/shared/commerce.md#L80) -- 1. Customer/Supplier create/edit/reload, null/zero values, duplicate code across orgs, same record code update, address copy on toggle only, invalid email/rating/currency/credit; portal invi...
- [ ] **e0173-c004** [statement, lines 81-81](../development-pack/shared/commerce.md#L81) -- 2. Order customer selection/unlink and currency repricing, missing foreign-currency price, same product two variants, inactive saved variant edit, duplicate merged line, decimal/percent/fixe...
- [ ] **e0173-c005** [statement, lines 82-82](../development-pack/shared/commerce.md#L82) -- 3. Two orders competing for last units; single-winner stock or clean rollback. Cancel/reject/delete retry must not double-restock. Shipping then cancellation/returns must preserve exact elig...
- [ ] **e0173-c006** [statement, lines 83-83](../development-pack/shared/commerce.md#L83) -- 4. Partial/full payment, explicit overpayment, invalid decimal, payment on cancelled order, refund beyond receipts, void receipt after refund, concurrent payment/refund, audit preservation. ...
- [ ] **e0173-c007** [statement, lines 84-84](../development-pack/shared/commerce.md#L84) -- 5. PO create supplier/variant defaults, expected date validation, approval submit/edit invalidation, queued vs delivered email, split receipts, overreceipt capped, wrong PO line not credited...
- [ ] **e0173-c008** [statement, lines 85-85](../development-pack/shared/commerce.md#L85) -- 6. Return only shipped/available quantity, mixed restock flags, damaged default, discounted refund rounding, duplicate line, edit pre-receive and reject-after-approve refusal, double receive...
- [ ] **e0173-c009** [statement, lines 86-86](../development-pack/shared/commerce.md#L86) -- 7. WO assembly/kit rejection, nested kit explosion, variant identity, stale availability between start and complete, serial duplication, expired/foreign lot, exact partial-output proportiona...
- [ ] **e0173-c010** [statement, lines 87-87](../development-pack/shared/commerce.md#L87) -- 8. Shipment manual/quoted route, no lines, over-shipment, wrong order-item, approval denial, multiple partial shipments, no second stock deduction, rate resume, failure preserving pending sh...
- [ ] **e0173-c011** [statement, lines 88-88](../development-pack/shared/commerce.md#L88) -- 9. Viewer/editor/approver/warehouse-restricted/foreign-org cases through both UI and direct API; stale permission revoked during draft, hidden protected totals, server-generated ownership fi...
- [ ] **e0173-c012** [statement, lines 89-89](../development-pack/shared/commerce.md#L89) -- 10. Each accepted operation must demonstrate reload persistence, expected stock/payment ledger deltas, corresponding audit metadata, exact final status and browser evidence. Source-only tabl...

### e0174: List/filter/pagination contracts

Source: [exact contract](../development-pack/shared/commerce.md#e0174). Complete every clause below before closing this section in the ledger.

- [ ] **e0174-c001** [table row, lines 99-99](../development-pack/shared/commerce.md#L99) -- Page  /  Submitted filter keys  /  Source paging  /  Behavior
- [ ] **e0174-c002** [table row, lines 101-101](../development-pack/shared/commerce.md#L101) -- Customers Index  /  search; controller also accepts is_active though core page exposes search only  /  default15  /  explicit search/clear, retain query on page navigation
- [ ] **e0174-c003** [table row, lines 102-102](../development-pack/shared/commerce.md#L102) -- Suppliers Index  /  search; backend is_active not a visible core filter  / 15 /  explicit search/clear
- [ ] **e0174-c004** [table row, lines 103-103](../development-pack/shared/commerce.md#L103) -- Orders Index  /  search, status, source, payment_status only if canViewPayments  / default15 /  explicit search/clear; hide payment data/filter/column when denied
- [ ] **e0174-c005** [table row, lines 104-104](../development-pack/shared/commerce.md#L104) -- PurchaseOrders Index  /  search, status, supplier_id  / 15 /  explicit search/clear; supplier selection from scoped props
- [ ] **e0174-c006** [table row, lines 105-105](../development-pack/shared/commerce.md#L105) -- Returns Index  /  search, status, type  / default15 /  search debounce300ms, status/type immediately requery
- [ ] **e0174-c007** [table row, lines 106-106](../development-pack/shared/commerce.md#L106) -- Returns SelectOrder  /  search  / default15 /  debounce300ms; only eligible order result links enter creation
- [ ] **e0174-c008** [table row, lines 107-107](../development-pack/shared/commerce.md#L107) -- WorkOrders Index  /  search, status  / 20 /  explicit search/clear; active warehouse filters backend query
- [ ] **e0174-c009** [table row, lines 108-108](../development-pack/shared/commerce.md#L108) -- Approvals Index  /  local tab pending/mine  /  supplied arrays, no paginated table in this Vue  /  tab affects displayed request list, not independent authority
- [ ] **e0174-c010** [prose, lines 110-110](../development-pack/shared/commerce.md#L110) -- All filter refs initialize incoming server filters or blank. Source backend page-size configuration is config/limits.php:19-22; controller pagination call sites: CustomerController.php:45, I...

### e0175: e0175

Source: [exact contract](../development-pack/shared/commerce.md#e0175). Complete every clause below before closing this section in the ledger.

- [ ] **e0175-c001** [prose, lines 120-120](../development-pack/shared/commerce.md#L120) -- Each row provides actual model binding, resolved label, control type, HTML constraints/events and option evidence. Server request tables later override weak client checks. Initializer blocks...

### e0210: e0210

Source: [exact contract](../development-pack/shared/commerce.md#e0210). Complete every clause below before closing this section in the ledger.

- [ ] **e0210-c001** [prose, lines 131-131](../development-pack/shared/commerce.md#L131) -- Every rule block below is source evidence. Rules inherited by ValidatesVariantLines, service state guards, organization/warehouse authorization and database uniqueness still apply. A rule al...

### e0227: ValidatesVariantLines.php

Source: [exact contract](../development-pack/shared/commerce.md#e0227). Complete every clause below before closing this section in the ledger.

- [ ] **e0227-c001** [prose, lines 142-142](../development-pack/shared/commerce.md#L142) -- app/Http/Requests/Concerns/ValidatesVariantLines.php:1
- [ ] **e0227-c002** [source-code reference, lines 144-186](../development-pack/shared/commerce.md#L144) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0228: Nested endpoint rules not in dedicated request classes

Source: [exact contract](../development-pack/shared/commerce.md#e0228). Complete every clause below before closing this section in the ledger.

- [ ] **e0228-c001** [prose, lines 198-198](../development-pack/shared/commerce.md#L198) -- app/Http/Controllers/CustomerContactController.php:22
- [ ] **e0228-c002** [source-code reference, lines 200-227](../development-pack/shared/commerce.md#L200) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0228-c003** [prose, lines 230-230](../development-pack/shared/commerce.md#L230) -- app/Http/Controllers/Order/ShipmentController.php:36
- [ ] **e0228-c004** [source-code reference, lines 232-262](../development-pack/shared/commerce.md#L232) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0228-c005** [prose, lines 265-265](../development-pack/shared/commerce.md#L265) -- app/Http/Controllers/Order/ShipmentController.php:115
- [ ] **e0228-c006** [source-code reference, lines 267-276](../development-pack/shared/commerce.md#L267) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0228-c007** [prose, lines 279-279](../development-pack/shared/commerce.md#L279) -- app/Http/Controllers/Order/OrderPaymentController.php:40
- [ ] **e0228-c008** [source-code reference, lines 281-295](../development-pack/shared/commerce.md#L281) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0228-c009** [prose, lines 298-298](../development-pack/shared/commerce.md#L298) -- app/Http/Controllers/Order/OrderPaymentController.php:63
- [ ] **e0228-c010** [source-code reference, lines 300-309](../development-pack/shared/commerce.md#L300) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0228-c011** [prose, lines 312-312](../development-pack/shared/commerce.md#L312) -- app/Http/Controllers/Order/OrderController.php:442
- [ ] **e0228-c012** [source-code reference, lines 314-330](../development-pack/shared/commerce.md#L314) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0228-c013** [prose, lines 333-333](../development-pack/shared/commerce.md#L333) -- app/Http/Controllers/Order/OrderController.php:474
- [ ] **e0228-c014** [source-code reference, lines 335-351](../development-pack/shared/commerce.md#L335) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0228-c015** [prose, lines 354-354](../development-pack/shared/commerce.md#L354) -- app/Http/Controllers/ApprovalController.php:35
- [ ] **e0228-c016** [source-code reference, lines 356-374](../development-pack/shared/commerce.md#L356) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0228-c017** [prose, lines 377-377](../development-pack/shared/commerce.md#L377) -- app/Services/WorkOrderService.php:68
- [ ] **e0228-c018** [source-code reference, lines 379-416](../development-pack/shared/commerce.md#L379) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0230: routes/web/sales.php

Source: [exact contract](../development-pack/shared/commerce.md#e0230). Complete every clause below before closing this section in the ledger.

- [ ] **e0230-c001** [prose, lines 427-427](../development-pack/shared/commerce.md#L427) -- routes/web/sales.php:1
- [ ] **e0230-c002** [source-code reference, lines 429-497](../development-pack/shared/commerce.md#L429) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0232: routes/web/inventory.php

Source: [exact contract](../development-pack/shared/commerce.md#e0232). Complete every clause below before closing this section in the ledger.

- [ ] **e0232-c001** [prose, lines 508-508](../development-pack/shared/commerce.md#L508) -- routes/web/inventory.php:1
- [ ] **e0232-c002** [source-code reference, lines 510-515](../development-pack/shared/commerce.md#L510) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0233: e0233

Source: [exact contract](../development-pack/shared/commerce.md#e0233). Complete every clause below before closing this section in the ledger.

- [ ] **e0233-c001** [prose, lines 526-526](../development-pack/shared/commerce.md#L526) -- Source model fields/casts and relation declarations below identify storage concepts. Do not copy fillable as a browser allowlist: it includes server-owned identifiers/totals/state. Soft dele...

### e0251: e0251

Source: [exact contract](../development-pack/shared/commerce.md#e0251). Complete every clause below before closing this section in the ledger.

- [ ] **e0251-c001** [prose, lines 537-537](../development-pack/shared/commerce.md#L537) --  means source controls/initializers/action/validation mapping recorded in this document, **not browser-tested or implemented**. Every module acceptance remains open until the stated end-to-e...
- [ ] **e0251-c002** [table row, lines 539-539](../development-pack/shared/commerce.md#L539) -- Source surface  /  Source-mapped  /  Editable control bindings  /  Lines  /  SHA256
- [ ] **e0251-c003** [table row, lines 542-542](../development-pack/shared/commerce.md#L542) -- resources/js/Pages/Customers/Create.vue  /    /  23  /  276  /  47a6002eef2311350e349c74ddfc507b67b0a96c0b6b71f9782b7fc52333781f
- [ ] **e0251-c004** [table row, lines 544-544](../development-pack/shared/commerce.md#L544) -- resources/js/Pages/Customers/Edit.vue  /    /  23  /  260  /  ab612bb7af2386452fabc083d4e4c59bd5ed5eae099e526fd7bcb8e25a46eeb8
- [ ] **e0251-c005** [table row, lines 546-546](../development-pack/shared/commerce.md#L546) -- resources/js/Pages/Customers/Index.vue  /    /  1  /  185  /  f1ba7c1e6998a1c2815c8534c758d033d89c2801da13da9377061b0316aeb487
- [ ] **e0251-c006** [table row, lines 548-548](../development-pack/shared/commerce.md#L548) -- resources/js/Pages/Customers/Show.vue  /    /  2  /  446  /  f330f3aad7fe328dd3ad778fa587b60f852a7a4286049660947a7d811dc03c72
- [ ] **e0251-c007** [table row, lines 550-550](../development-pack/shared/commerce.md#L550) -- resources/js/Pages/Suppliers/Create.vue  /    /  16  /  214  /  bc5edddbabc6aec8b0a2edd6fd2efe4ea55b314650102e863c14472a0dfed322
- [ ] **e0251-c008** [table row, lines 552-552](../development-pack/shared/commerce.md#L552) -- resources/js/Pages/Suppliers/Edit.vue  /    /  16  /  217  /  2a659faec4fa83dc859027ef2ef4ee46d1a9d138e444d4038ff36582fddd4b95
- [ ] **e0251-c009** [table row, lines 554-554](../development-pack/shared/commerce.md#L554) -- resources/js/Pages/Suppliers/Index.vue  /    /  1  /  190  /  fa0b481bb033c5b68080716ec7e4e93b8476a7c4cc0fe5ea174c36185db3c9fa
- [ ] **e0251-c010** [table row, lines 556-556](../development-pack/shared/commerce.md#L556) -- resources/js/Pages/Suppliers/Show.vue  /    /  0  /  228  /  6edd525493667fae0e13b91710e9c1798ce5be876955803860c4783e48d0f951
- [ ] **e0251-c011** [table row, lines 558-558](../development-pack/shared/commerce.md#L558) -- resources/js/Pages/Orders/Create.vue  /    /  18  /  515  /  7b3fc70af5aae790f62a32da49448c7123992f406b47a85a8a7e811623cf1d01
- [ ] **e0251-c012** [table row, lines 560-560](../development-pack/shared/commerce.md#L560) -- resources/js/Pages/Orders/Edit.vue  /    /  16  /  409  /  e06532251c63257d3c62d8ebc8f31a55eb689b14552113012b6bb710e603f476
- [ ] **e0251-c013** [table row, lines 562-562](../development-pack/shared/commerce.md#L562) -- resources/js/Pages/Orders/Index.vue  /    /  5  /  293  /  5145cc1b9614d3c09c8ac7705ae8ced490b7dd25f27bba65176228896c013ba8
- [ ] **e0251-c014** [table row, lines 564-564](../development-pack/shared/commerce.md#L564) -- resources/js/Pages/Orders/Show.vue  /    /  8  /  864  /  07ebbfcdb738a2d505f2683dd28ca1397d6d081fabc3daff7f2a145ea3ea4a15
- [ ] **e0251-c015** [table row, lines 566-566](../development-pack/shared/commerce.md#L566) -- resources/js/Pages/PurchaseOrders/Create.vue  /    /  14  /  385  /  b41b7a756ba27d522f288e5f1c5f610ce3aed7c68aed75f0ff679c04b485e3d7
- [ ] **e0251-c016** [table row, lines 568-568](../development-pack/shared/commerce.md#L568) -- resources/js/Pages/PurchaseOrders/Edit.vue  /    /  15  /  425  /  680ac4ac1b679b4da19f933bfcf14a3fe95988a378b588056a356853925a5fae
- [ ] **e0251-c017** [table row, lines 570-570](../development-pack/shared/commerce.md#L570) -- resources/js/Pages/PurchaseOrders/Index.vue  /    /  3  /  234  /  f3fd0ba51b3aa01f75f631784f2b2fcec339645d906e4c3ea8a1f0d1292bebc8
- [ ] **e0251-c018** [table row, lines 572-572](../development-pack/shared/commerce.md#L572) -- resources/js/Pages/PurchaseOrders/Receive.vue  /    /  1  /  302  /  1abe7abaea56d5145483f3b6d5cff95a1de8bec7edcdc02ccbec40f5ac9c7e80
- [ ] **e0251-c019** [table row, lines 574-574](../development-pack/shared/commerce.md#L574) -- resources/js/Pages/PurchaseOrders/Show.vue  /    /  0  /  500  /  32a4cc90534901543441bcbaa5f1e0ac135bf043faf2056571f49e6e57786f07
- [ ] **e0251-c020** [table row, lines 576-576](../development-pack/shared/commerce.md#L576) -- resources/js/Pages/Returns/Create.vue  /    /  7  /  295  /  6c485483b5963a0b61a6b8a383c7cd469c8f3be9d917d6e64cc1f52ea302c63e
- [ ] **e0251-c021** [table row, lines 578-578](../development-pack/shared/commerce.md#L578) -- resources/js/Pages/Returns/Index.vue  /    /  3  /  219  /  2b34165c72c961403e3f1c1caddda0381e84e5199a16bfde7d9f654e9dbaaade
- [ ] **e0251-c022** [table row, lines 580-580](../development-pack/shared/commerce.md#L580) -- resources/js/Pages/Returns/SelectOrder.vue  /    /  1  /  140  /  8139d2b6fcc890871672465f62ce909a20a8067d19e62b8fa013edbfed9e51b1
- [ ] **e0251-c023** [table row, lines 582-582](../development-pack/shared/commerce.md#L582) -- resources/js/Pages/Returns/Show.vue  /    /  3  /  440  /  069082103e5924e94e0176657db344407c17727c44eefd5e8faca25ac1daaa6a
- [ ] **e0251-c024** [table row, lines 584-584](../development-pack/shared/commerce.md#L584) -- resources/js/Pages/WorkOrders/Create.vue  /    /  6  /  325  /  f85f85b83d3e218546e49f94649f1354b68aa9264243e7cfcc1aa1feee82fe39
- [ ] **e0251-c025** [table row, lines 586-586](../development-pack/shared/commerce.md#L586) -- resources/js/Pages/WorkOrders/Index.vue  /    /  2  /  226  /  9857464f0aa42d81d9e717383c7780ff4076efcb1daa4af7a7ff48c857493099
- [ ] **e0251-c026** [table row, lines 588-588](../development-pack/shared/commerce.md#L588) -- resources/js/Pages/WorkOrders/Show.vue  /    /  6  /  633  /  499fefeb1d350c52c94772c4ea532128efdc1381057aabe697b33a19c6c4d162
- [ ] **e0251-c027** [table row, lines 590-590](../development-pack/shared/commerce.md#L590) -- resources/js/Pages/Approvals/Index.vue  /    /  1  /  185  /  f78d3400c19e564a44e9862ff824f36346bc5dd0bbabdcc757c4cee4d3bb58da
- [ ] **e0251-c028** [table row, lines 592-592](../development-pack/shared/commerce.md#L592) -- resources/js/Components/ApprovalPanel.vue  /    /  1  /  151  /  81d95a50bde716584f40f010e23d1ca1aeb84193d80d7edb8b8e2bd2cc07e425
- [ ] **e0251-c029** [table row, lines 594-594](../development-pack/shared/commerce.md#L594) -- resources/js/Components/CustomerPicker.vue  /    /  1  /  157  /  be4b78123094961254bcadec4e0edbc23675c4870e78899b906e4672b8a26108
- [ ] **e0251-c030** [table row, lines 596-596](../development-pack/shared/commerce.md#L596) -- resources/js/Components/SendDocumentModal.vue  /    /  3  /  147  /  de94dde1bea912f9c4733bd4e33a298df9f6c4bac22f201fd9e9a3edfe5a8049
- [ ] **e0251-c031** [table row, lines 598-598](../development-pack/shared/commerce.md#L598) -- resources/js/Components/Shipping/ShipOrderModal.vue  /    /  14  /  411  /  ff3dd4ae9ab0a3f5981892c796790e034c937ec2f593afd40e5bbf71c1a0412d
- [ ] **e0251-c032** [table row, lines 600-600](../development-pack/shared/commerce.md#L600) -- resources/js/Components/Shipping/ShipmentsPanel.vue  /    /  0  /  199  /  076d15612449d09800c211f5b8554af937fa65fadf976856830019ec46294104
- [ ] **e0251-c033** [table row, lines 602-602](../development-pack/shared/commerce.md#L602) -- resources/js/Components/TaxInput.vue  /    /  2  /  70  /  8b0f406def37b284cbec2efe25e841abeaff2f996c19b0ad3ff99c583916078c
- [ ] **e0251-c034** [table row, lines 604-604](../development-pack/shared/commerce.md#L604) -- resources/js/Components/DiscountInput.vue  /    /  2  /  52  /  2bc38679c785be9281966ff28da443ac686f05a1134cbce74cc04854caba0062
- [ ] **e0251-c035** [table row, lines 606-606](../development-pack/shared/commerce.md#L606) -- resources/js/Components/SupplierRating.vue  /    /  0  /  70  /  b656c7de02ef1a25786191b330d05455aba67e7cf41cafd5f04edecc6e14b471
- [ ] **e0251-c036** [table row, lines 608-608](../development-pack/shared/commerce.md#L608) -- resources/js/Components/CurrencySelect.vue  /    /  1  /  17  /  f45a07ec144d85dd9f3dbaa09c636dd18588b7057caddc79319f76805b33cd84

### e0252: e0252

Source: [exact contract](../development-pack/shared/commerce.md#e0252). Complete every clause below before closing this section in the ledger.

- [ ] **e0252-c001** [statement, lines 619-619](../development-pack/shared/commerce.md#L619) -- - Browser interaction and live create/edit/receipt/shipment/refund/production evidence must be supplied separately; no claim here that any transaction succeeded live.
- [ ] **e0252-c002** [statement, lines 620-620](../development-pack/shared/commerce.md#L620) -- - Plugin-defined fields/tabs/actions depend on installed/enabled plugins and remain explicitly external to the 25 core pages. Core PluginSlot/PluginTabs extension locations appear in the sou...
- [ ] **e0252-c003** [statement, lines 621-621](../development-pack/shared/commerce.md#L621) -- - Carrier contracts, email delivery and PDF rendering need provider/render verification. Source presence is not configured availability, successful purchase or delivered email.
- [ ] **e0252-c004** [statement, lines 622-622](../development-pack/shared/commerce.md#L622) -- - Model excerpts identify source fields/relations, not exhaustive SQL DDL or verified target RLS. Audit target migrations/indexes/constraints separately; preserve exact-money arithmetic and ...
- [ ] **e0252-c005** [statement, lines 623-623](../development-pack/shared/commerce.md#L623) -- - No new HMG names, table migrations, policies or service credentials are authorized by this report. All frontend checks must be backed by command-side authorization/integrity. For multi-row...

## shared/inventory.md

### e0001: e0001

Source: [exact contract](../development-pack/shared/inventory.md#e0001). **Reference-only heading:** no body clauses in the supplied pack. Preserve this traceability anchor; it supplies no implementation or acceptance proof.


### e0002: e0002

Source: [exact contract](../development-pack/shared/inventory.md#e0002). Complete every clause below before closing this section in the ledger.

- [ ] **e0002-c001** [prose, lines 37-37](../development-pack/shared/inventory.md#L37) -- This section is a **source-confirmed implementation specification**, not a claim that workflows passed in a browser or that the current database matches migrations. Source root: C:\Users\pro...
- [ ] **e0002-c002** [prose, lines 39-39](../development-pack/shared/inventory.md#L39) -- **Current task authorization: read-only audit/report; no new records or application mutations.** Acceptance scenarios are a future implementation checklist, not permission to execute them no...
- [ ] **e0002-c003** [prose, lines 41-41](../development-pack/shared/inventory.md#L41) -- The page register below covers all 28 Vue pages in the assigned inventory areas and 12 relevant nested components. Each page includes its exact bound field keys, visible English labels where...
- [ ] **e0002-c004** [prose, lines 43-43](../development-pack/shared/inventory.md#L43) -- **Reading defaults:** props.product.* / props.warehouse.* / props.audit.* means the saved server-provided value. ref values are local UI state; useForm objects are submission payloads. requi...

### e0003: e0003

Source: [exact contract](../development-pack/shared/inventory.md#e0003). Complete every clause below before closing this section in the ledger.

- [ ] **e0003-c001** [statement, lines 53-53](../development-pack/shared/inventory.md#L53) -- 1. **Do not treat products.stock as the only stock record.** Products and variants have independent on-hand totals; location bins distribute those quantities. The shared stock view combines ...
- [ ] **e0003-c002** [statement, lines 54-54](../development-pack/shared/inventory.md#L54) -- 2. **One transactional stock ledger boundary.** StockAdjustment::adjust / adjustVariant lock product then variant rows, validate stock/reservations, record before/change/after, synchronize b...
- [ ] **e0003-c003** [statement, lines 55-55](../development-pack/shared/inventory.md#L55) -- 3. **Identity persists across edits.** Variant updates match existing records rather than regenerate IDs; a removed variant with stock/history is deactivated, otherwise soft-deleted. Existin...
- [ ] **e0003-c004** [statement, lines 56-56](../development-pack/shared/inventory.md#L56) -- 4. **Organization and warehouse access are distinct.** Validate tenant ownership of every selected object, then warehouse action authority. UI hiding is not authorization. Reproduce route mi...
- [ ] **e0003-c005** [statement, lines 57-57](../development-pack/shared/inventory.md#L57) -- 5. **Opening stock is an accounting event.** New product/variant stock writes create opening_stock ledger records; existing stock changes use adjustments. ProductService:192-239.
- [ ] **e0003-c006** [statement, lines 58-58](../development-pack/shared/inventory.md#L58) -- 6. **Quantities are integers.** UI prices generally use decimal steps; server monetary constraints differ by feature. Preserve nullable inherited prices/thresholds rather than converting eve...

### e0004: e0004

Source: [exact contract](../development-pack/shared/inventory.md#e0004). Complete every clause below before closing this section in the ledger.

- [ ] **e0004-c001** [table row, lines 68-68](../development-pack/shared/inventory.md#L68) -- Model / table  /  Key relationships and operational columns
- [ ] **e0004-c002** [table row, lines 70-70](../development-pack/shared/inventory.md#L70) -- Product / products  /  organization_id, category_id, primary location_id; SKU/name/description/price/purchase_price/currency/price_in_currencies/stock/min_stock/max_stock/reorder_point/reord...
- [ ] **e0004-c003** [table row, lines 71-71](../development-pack/shared/inventory.md#L71) -- ProductCategory / product_categories  /  Organization; name/description/is_active; products reference category_id.
- [ ] **e0004-c004** [table row, lines 72-72](../development-pack/shared/inventory.md#L72) -- Warehouse / warehouses  /  Organization; name/code/address/contact/manager/timezone/currency/priority/capacity/is_active/is_default; locations through warehouse_id; assigned users via wareho...
- [ ] **e0004-c005** [table row, lines 73-73](../development-pack/shared/inventory.md#L73) -- ProductLocation / product_locations  /  Organization; nullable warehouse_id; name/code/description/is_active/capacity.
- [ ] **e0004-c006** [table row, lines 74-74](../development-pack/shared/inventory.md#L74) -- ProductOption / product_options  /  Product and organization; name, values, position.
- [ ] **e0004-c007** [table row, lines 75-75](../development-pack/shared/inventory.md#L75) -- ProductVariant / product_variants  /  Product and organization; option_values/title/SKU/barcode/price/purchase_price/stock/min_stock/is_active/position.
- [ ] **e0004-c008** [table row, lines 76-76](../development-pack/shared/inventory.md#L76) -- ProductLocationStock / product_location_stocks  /  Organization, product_id, location_id, quantity; unique product/location.
- [ ] **e0004-c009** [table row, lines 77-77](../development-pack/shared/inventory.md#L77) -- VariantLocationStock / variant_location_stocks  /  Organization, product_variant_id, location_id, quantity; unique variant/location.
- [ ] **e0004-c010** [table row, lines 78-78](../development-pack/shared/inventory.md#L78) -- WarehouseReorderPoint / warehouse_reorder_points  /  Product/warehouse/org with nullable min_stock/reorder_point/reorder_quantity/max_stock overrides.
- [ ] **e0004-c011** [table row, lines 79-79](../development-pack/shared/inventory.md#L79) -- ProductBatch / product_batches  /  Organization/product, batch_number, quantity, manufactured_date, expiry_date, notes.
- [ ] **e0004-c012** [table row, lines 80-80](../development-pack/shared/inventory.md#L80) -- ProductSerial / product_serials  /  Organization/product, serial_number, status, notes, order_item_id. Serial numbers unique per organization. Order association is not mass-assignable.
- [ ] **e0004-c013** [table row, lines 81-81](../development-pack/shared/inventory.md#L81) -- StockAdjustment / stock_adjustments  /  Organization/product/optional product_variant_id/location_id/user_id; type, adjustment_quantity, quantity_before, quantity_after, reason, notes, refer...
- [ ] **e0004-c014** [table row, lines 82-82](../development-pack/shared/inventory.md#L82) -- StockAdjustmentRequest / stock_adjustment_requests  /  Pending approval document; requested product/variant/delta/location and submitter/approval data; does not mean stock has already moved.
- [ ] **e0004-c015** [table row, lines 83-83](../development-pack/shared/inventory.md#L83) -- StockReservation / stock_reservations  /  Organization/product/optional variant/location/serial/batch; positive quantity; owner_type/owner_reference/scope_key; expires_at/consumed_at/release...
- [ ] **e0004-c016** [table row, lines 84-84](../development-pack/shared/inventory.md#L84) -- StockTransfer / stock_transfers  /  Organization; from/to location and warehouse IDs; status, is_inter_warehouse, approval status, prepared/shipped/dispatch/completion timestamps, completer;...
- [ ] **e0004-c017** [table row, lines 85-85](../development-pack/shared/inventory.md#L85) -- StockTransferItem / stock_transfer_items  /  Transfer/product/optional variant, quantity, notes.
- [ ] **e0004-c018** [table row, lines 86-86](../development-pack/shared/inventory.md#L86) -- StockAudit / stock_audits  /  Organization; number/name/type/status; warehouse_id and warehouse_location_id; creator/assignee/schedule; timestamps; require_variance_approval.
- [ ] **e0004-c019** [table row, lines 87-87](../development-pack/shared/inventory.md#L87) -- StockAuditItem / stock_audit_items  /  Audit/product/variant/location, system/count quantities, discrepancy/status/count actor/time/notes, review state.
- [ ] **e0004-c020** [table row, lines 88-88](../development-pack/shared/inventory.md#L88) -- StockAuditCount / stock_audit_counts  /  Append-only count evidence linked to audit item; system/count quantities and actor/time/notes.
- [ ] **e0004-c021** [table row, lines 89-89](../development-pack/shared/inventory.md#L89) -- StockAuditReview / stock_audit_reviews  /  Review decisions against specific count evidence; approver/recount-request notes and timestamps.
- [ ] **e0004-c022** [table row, lines 90-90](../development-pack/shared/inventory.md#L90) -- CycleCountSchedule / cycle_count_schedules  /  Organization/name/frequency/scope_type/scope_id/products_per_run/assigned_to/is_active/next_run_at/last_run_at/last_audit_id/created_by.
- [ ] **e0004-c023** [table row, lines 91-91](../development-pack/shared/inventory.md#L91) -- VariantReplenishmentPolicy / variant_replenishment_policies  /  Organization/variant/warehouse/location/supplier; reorder_point/target_stock/reorder_quantity/minimum_order_quantity/unit_cost...
- [ ] **e0004-c024** [table row, lines 92-92](../development-pack/shared/inventory.md#L92) -- InventoryResetRun / inventory_reset_runs  /  Organization/public_id/actor_id/status/signature/reason/counts/error_code/timestamps.
- [ ] **e0004-c025** [prose, lines 94-94](../development-pack/shared/inventory.md#L94) -- Exact model fillable/cast/relation and migration declaration evidence is indexed in the final schema annex. This register is a relationship map, not an assertion that a row is present or a m...

### e0005: e0005

Source: [exact contract](../development-pack/shared/inventory.md#e0005). **Reference-only heading:** no body clauses in the supplied pack. Preserve this traceability anchor; it supplies no implementation or acceptance proof.


### e0014: Administrator stock reset (destructive, do not execute as an audit convenience)

Source: [exact contract](../development-pack/shared/inventory.md#e0014). Complete every clause below before closing this section in the ledger.

- [ ] **e0014-c001** [statement, lines 112-112](../development-pack/shared/inventory.md#L112) -- - Preview counts affected product/variant/bin/batch/available-serial rows; not simply sum of units. Blocks active holds, reserved serials, pending/prepared/in-transit transfers, in-progress ...
- [ ] **e0014-c002** [statement, lines 113-113](../development-pack/shared/inventory.md#L113) -- - Requires admin + manage_stock, reason 3..500, current password, exact ZERO STOCK, session preview UUID/token with 10-minute expiry, and unchanged inventory signature. Queue rechecks previe...
- [ ] **e0014-c003** [statement, lines 114-114](../development-pack/shared/inventory.md#L114) -- - It is an audited write-off, not delete-products: zero balances/batches, available serials become written_off, retain catalogue/history. Dedicated queue inventory-resets; status pending/run...

### e0015: e0015

Source: [exact contract](../development-pack/shared/inventory.md#e0015). Complete every clause below before closing this section in the ledger.

- [ ] **e0015-c001** [statement, lines 124-124](../development-pack/shared/inventory.md#L124) -- 1. Create category/location/warehouse with unique audit prefix; exercise required/overlength errors and foreign-organization selection rejection.
- [ ] **e0015-c002** [statement, lines 125-125](../development-pack/shared/inventory.md#L125) -- 2. Create standard product with opening stock; verify one opening ledger row and correct bin total. Edit name/price and confirm stock does not move. Try direct edit-stock payload and confirm...
- [ ] **e0015-c003** [statement, lines 126-126](../development-pack/shared/inventory.md#L126) -- 3. Create two option dimensions and resulting combinations; edit preserving variant IDs and existing stock; deactivate omitted referenced variant; validate price inheritance.
- [ ] **e0015-c004** [statement, lines 127-127](../development-pack/shared/inventory.md#L127) -- 4. Add supplier links, reject duplicate supplier and two primaries; confirm first primary fallback and blank optional costs preserve intended semantics.
- [ ] **e0015-c005** [statement, lines 128-128](../development-pack/shared/inventory.md#L128) -- 5. Adjust +/− quantity; verify reason/user/location/before/after; insufficient available stock and held stock rejected; approval request does not change balance until approved.
- [ ] **e0015-c006** [statement, lines 129-129](../development-pack/shared/inventory.md#L129) -- 6. Reserve stock via authorized core workflow; verify on-hand unchanged, available reduced; consume/release/expire and owner audit evidence correctly reflected.
- [ ] **e0015-c007** [statement, lines 130-130](../development-pack/shared/inventory.md#L130) -- 7. Transfer pending→prepared→shipped→completed; verify held source, source deduction once, in-transit separately, destination receipt once; duplicate completion rejected; shipped cancel reje...
- [ ] **e0015-c008** [statement, lines 131-131](../development-pack/shared/inventory.md#L131) -- 8. Transfer variant scan must retain exact variant; scan checklist cannot be claimed as saved proof after reload.
- [ ] **e0015-c009** [statement, lines 132-132](../development-pack/shared/inventory.md#L132) -- 9. Audit draft/start; change stock before start and verify refreshed snapshot; count zero/nonzero with note; conflict using stale revision; retain local draft offline and reject false HTML a...
- [ ] **e0015-c010** [statement, lines 133-133](../development-pack/shared/inventory.md#L133) -- 10. Mandatory variance approval: reject self-approval when disabled, require recount reason, invalidate stale review, complete only resolved counts. Uncounted explicit completion skips them ...
- [ ] **e0015-c011** [statement, lines 134-134](../development-pack/shared/inventory.md#L134) -- 11. Cycle schedule scoped to location/category/warehouse; run twice and verify prior open audit suppresses second, manual run doesn't advance next run; least-recently-counted selection.
- [ ] **e0015-c012** [statement, lines 135-135](../development-pack/shared/inventory.md#L135) -- 12. Batch/serial uniqueness/status/date validations; held serial mutation rejected; tracked coverage default vs strict setting demonstrated separately.
- [ ] **e0015-c013** [statement, lines 136-136](../development-pack/shared/inventory.md#L136) -- 13. Stock filters/export show equivalent permission-scoped rows and formula-safe CSV; page sorting and include-zero/out-of-stock combinations.
- [ ] **e0015-c014** [statement, lines 137-137](../development-pack/shared/inventory.md#L137) -- 14. Variant replenishment excludes duplicate outstanding demand, respects currency/cost change and receiving location, creates draft PO only.
- [ ] **e0015-c015** [statement, lines 138-138](../development-pack/shared/inventory.md#L138) -- 15. Reset **preview only** in normal audit. In isolated explicitly authorized disposable organization, test wrong phrase/password/expired preview/changed signature/blockers and queue failure...

### e0016: e0016

Source: [exact contract](../development-pack/shared/inventory.md#e0016). Complete every clause below before closing this section in the ledger.

- [ ] **e0016-c001** [statement, lines 148-148](../development-pack/shared/inventory.md#L148) -- -  Source fields/actions inspected: resources/js/Pages/Categories/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c002** [statement, lines 149-149](../development-pack/shared/inventory.md#L149) -- -  Source fields/actions inspected: resources/js/Pages/Inventory/VariantReplenishment.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c003** [statement, lines 150-150](../development-pack/shared/inventory.md#L150) -- -  Source fields/actions inspected: resources/js/Pages/Locations/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c004** [statement, lines 151-151](../development-pack/shared/inventory.md#L151) -- -  Source fields/actions inspected: resources/js/Pages/Products/Create.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c005** [statement, lines 152-152](../development-pack/shared/inventory.md#L152) -- -  Source fields/actions inspected: resources/js/Pages/Products/Edit.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c006** [statement, lines 153-153](../development-pack/shared/inventory.md#L153) -- -  Source fields/actions inspected: resources/js/Pages/Products/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c007** [statement, lines 154-154](../development-pack/shared/inventory.md#L154) -- -  Source fields/actions inspected: resources/js/Pages/Products/ResetStock.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c008** [statement, lines 155-155](../development-pack/shared/inventory.md#L155) -- -  Source fields/actions inspected: resources/js/Pages/Products/ResetStockStatus.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c009** [statement, lines 156-156](../development-pack/shared/inventory.md#L156) -- -  Source fields/actions inspected: resources/js/Pages/Products/Show.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c010** [statement, lines 157-157](../development-pack/shared/inventory.md#L157) -- -  Source fields/actions inspected: resources/js/Pages/Reservations/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c011** [statement, lines 158-158](../development-pack/shared/inventory.md#L158) -- -  Source fields/actions inspected: resources/js/Pages/Stock/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c012** [statement, lines 159-159](../development-pack/shared/inventory.md#L159) -- -  Source fields/actions inspected: resources/js/Pages/StockAdjustments/Create.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c013** [statement, lines 160-160](../development-pack/shared/inventory.md#L160) -- -  Source fields/actions inspected: resources/js/Pages/StockAdjustments/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c014** [statement, lines 161-161](../development-pack/shared/inventory.md#L161) -- -  Source fields/actions inspected: resources/js/Pages/StockAdjustments/Show.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c015** [statement, lines 162-162](../development-pack/shared/inventory.md#L162) -- -  Source fields/actions inspected: resources/js/Pages/StockAudits/CountHistory.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c016** [statement, lines 163-163](../development-pack/shared/inventory.md#L163) -- -  Source fields/actions inspected: resources/js/Pages/StockAudits/Create.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c017** [statement, lines 164-164](../development-pack/shared/inventory.md#L164) -- -  Source fields/actions inspected: resources/js/Pages/StockAudits/CycleCounts/Form.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c018** [statement, lines 165-165](../development-pack/shared/inventory.md#L165) -- -  Source fields/actions inspected: resources/js/Pages/StockAudits/CycleCounts/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c019** [statement, lines 166-166](../development-pack/shared/inventory.md#L166) -- -  Source fields/actions inspected: resources/js/Pages/StockAudits/Edit.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c020** [statement, lines 167-167](../development-pack/shared/inventory.md#L167) -- -  Source fields/actions inspected: resources/js/Pages/StockAudits/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c021** [statement, lines 168-168](../development-pack/shared/inventory.md#L168) -- -  Source fields/actions inspected: resources/js/Pages/StockAudits/Show.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c022** [statement, lines 169-169](../development-pack/shared/inventory.md#L169) -- -  Source fields/actions inspected: resources/js/Pages/StockTransfers/Create.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c023** [statement, lines 170-170](../development-pack/shared/inventory.md#L170) -- -  Source fields/actions inspected: resources/js/Pages/StockTransfers/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c024** [statement, lines 171-171](../development-pack/shared/inventory.md#L171) -- -  Source fields/actions inspected: resources/js/Pages/StockTransfers/Show.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c025** [statement, lines 172-172](../development-pack/shared/inventory.md#L172) -- -  Source fields/actions inspected: resources/js/Pages/Warehouses/Create.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c026** [statement, lines 173-173](../development-pack/shared/inventory.md#L173) -- -  Source fields/actions inspected: resources/js/Pages/Warehouses/Edit.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c027** [statement, lines 174-174](../development-pack/shared/inventory.md#L174) -- -  Source fields/actions inspected: resources/js/Pages/Warehouses/Index.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c028** [statement, lines 175-175](../development-pack/shared/inventory.md#L175) -- -  Source fields/actions inspected: resources/js/Pages/Warehouses/Show.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c029** [statement, lines 176-176](../development-pack/shared/inventory.md#L176) -- -  Source fields/actions inspected: resources/js/Components/BarcodeScannerModal.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c030** [statement, lines 177-177](../development-pack/shared/inventory.md#L177) -- -  Source fields/actions inspected: resources/js/Components/BatchList.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c031** [statement, lines 178-178](../development-pack/shared/inventory.md#L178) -- -  Source fields/actions inspected: resources/js/Components/SerialList.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c032** [statement, lines 179-179](../development-pack/shared/inventory.md#L179) -- -  Source fields/actions inspected: resources/js/Components/ProductVariantManager.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c033** [statement, lines 180-180](../development-pack/shared/inventory.md#L180) -- -  Source fields/actions inspected: resources/js/Components/VariantStockAdjuster.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c034** [statement, lines 181-181](../development-pack/shared/inventory.md#L181) -- -  Source fields/actions inspected: resources/js/Components/WarehouseStockLevels.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c035** [statement, lines 182-182](../development-pack/shared/inventory.md#L182) -- -  Source fields/actions inspected: resources/js/Components/SKUGeneratorModal.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c036** [statement, lines 183-183](../development-pack/shared/inventory.md#L183) -- -  Source fields/actions inspected: resources/js/Components/ProductSupplierManager.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c037** [statement, lines 184-184](../development-pack/shared/inventory.md#L184) -- -  Source fields/actions inspected: resources/js/Components/ImageUploader.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c038** [statement, lines 185-185](../development-pack/shared/inventory.md#L185) -- -  Source fields/actions inspected: resources/js/Components/VariantsTable.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c039** [statement, lines 186-186](../development-pack/shared/inventory.md#L186) -- -  Source fields/actions inspected: resources/js/Components/BarcodeScanner.vue:1. Browser: **not verified by this investigator**.
- [ ] **e0016-c040** [statement, lines 187-187](../development-pack/shared/inventory.md#L187) -- -  Source fields/actions inspected: resources/js/Components/StockAuditReviewEvidence.vue:1. Browser: **not verified by this investigator**.

### e0017: e0017

Source: [exact contract](../development-pack/shared/inventory.md#e0017). **Reference-only heading:** no body clauses in the supplied pack. Preserve this traceability anchor; it supplies no implementation or acceptance proof.


### e0058: e0058

Source: [exact contract](../development-pack/shared/inventory.md#e0058). Complete every clause below before closing this section in the ledger.

- [ ] **e0058-c001** [prose, lines 206-206](../development-pack/shared/inventory.md#L206) -- These are source rules, not proof of deployment. Browser required marks may be stricter or weaker; preserve both. IDs require service ownership/warehouse checks in addition to exists rules. ...

### e0093: e0093

Source: [exact contract](../development-pack/shared/inventory.md#e0093). Complete every clause below before closing this section in the ledger.

- [ ] **e0093-c001** [prose, lines 216-216](../development-pack/shared/inventory.md#L216) -- Selected exact model declarations provide field spellings and relations. A fillable list is not the full SQL schema. Migration definitions below establish table/column changes in source; the...

### e0137: 2026_05_18_000001_make_inventory_numbers_unique_per_organization.php

Source: [exact contract](../development-pack/shared/inventory.md#e0137). Complete every clause below before closing this section in the ledger.

- [ ] **e0137-c001** [prose, lines 225-225](../development-pack/shared/inventory.md#L225) -- database/migrations/2026_05_18_000001_make_inventory_numbers_unique_per_organization.php:1
- [ ] **e0137-c002** [source-code reference, lines 227-240](../development-pack/shared/inventory.md#L227) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0138: 2026_05_18_000002_add_composite_indexes_for_hot_query_paths.php

Source: [exact contract](../development-pack/shared/inventory.md#e0138). Complete every clause below before closing this section in the ledger.

- [ ] **e0138-c001** [prose, lines 249-249](../development-pack/shared/inventory.md#L249) -- database/migrations/2026_05_18_000002_add_composite_indexes_for_hot_query_paths.php:1
- [ ] **e0138-c002** [source-code reference, lines 251-260](../development-pack/shared/inventory.md#L251) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0142: 2026_09_27_000001_widen_columns_rejected_by_mysql_and_postgres.php

Source: [exact contract](../development-pack/shared/inventory.md#e0142). Complete every clause below before closing this section in the ledger.

- [ ] **e0142-c001** [prose, lines 269-269](../development-pack/shared/inventory.md#L269) -- database/migrations/2026_09_27_000001_widen_columns_rejected_by_mysql_and_postgres.php:1
- [ ] **e0142-c002** [source-code reference, lines 271-276](../development-pack/shared/inventory.md#L271) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0161: e0161

Source: [exact contract](../development-pack/shared/inventory.md#e0161). Complete every clause below before closing this section in the ledger.

- [ ] **e0161-c001** [statement, lines 286-286](../development-pack/shared/inventory.md#L286) -- - app/Services/StockAuditReadService.php:1
- [ ] **e0161-c002** [statement, lines 287-287](../development-pack/shared/inventory.md#L287) -- - app/Services/StockAuditReviewService.php:1
- [ ] **e0161-c003** [statement, lines 288-288](../development-pack/shared/inventory.md#L288) -- - app/Services/StockAuditSnapshot.php:1
- [ ] **e0161-c004** [statement, lines 289-289](../development-pack/shared/inventory.md#L289) -- - resources/js/composables/useAuditCountDrafts.js:1
- [ ] **e0161-c005** [statement, lines 290-290](../development-pack/shared/inventory.md#L290) -- - resources/js/lib/auditCountDrafts.js:1
- [ ] **e0161-c006** [statement, lines 291-291](../development-pack/shared/inventory.md#L291) -- - resources/js/composables/useBarcodeWedge.js:1
- [ ] **e0161-c007** [statement, lines 292-292](../development-pack/shared/inventory.md#L292) -- - app/Services/WarehouseAccessService.php:1
- [ ] **e0161-c008** [statement, lines 293-293](../development-pack/shared/inventory.md#L293) -- - app/Services/WarehouseDeletionService.php:1
- [ ] **e0161-c009** [statement, lines 294-294](../development-pack/shared/inventory.md#L294) -- - app/Services/ProductLocationStockService.php:1
- [ ] **e0161-c010** [statement, lines 295-295](../development-pack/shared/inventory.md#L295) -- - app/Services/TrackedStockAllocationService.php:1
- [ ] **e0161-c011** [statement, lines 296-296](../development-pack/shared/inventory.md#L296) -- - app/Services/InventoryResetService.php:1
- [ ] **e0161-c012** [statement, lines 298-298](../development-pack/shared/inventory.md#L298) -- - All listed page/component templates and source-defined inputs/actions are covered. Source confirmation does not prove each dynamic plugin slot, remote selector option, permission combinati...
- [ ] **e0161-c013** [statement, lines 299-299](../development-pack/shared/inventory.md#L299) -- - Generic UI shell/dialog/notification behavior is owned by platform section. Purchasing, BOM server execution/work orders and import-export standalone screens are owned by commerce/platform...
- [ ] **e0161-c014** [statement, lines 300-300](../development-pack/shared/inventory.md#L300) -- - Backend-only fields are explicitly distinguished from form inputs. Public API validation may differ from web validators; API rules for embedded inventory controls are included, but this is...
- [ ] **e0161-c015** [statement, lines 301-301](../development-pack/shared/inventory.md#L301) -- - Suggested acceptance scenarios above are **pending**, not passed tests.

## shared/platform-source-catalog.md

### e0278: e0278

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0278). Complete every clause below before closing this section in the ledger.

- [ ] **e0278-c001** [prose, lines 27-27](../development-pack/shared/platform-source-catalog.md#L27) -- Source root: C:/Users/proj/Inventoros. Audit is source-derived; no mutation, backend test, provider test or browser verification by this agent. Browser observations are supplied separately b...

### e0279: e0279

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0279). Complete every clause below before closing this section in the ledger.

- [ ] **e0279-c001** [prose, lines 37-37](../development-pack/shared/platform-source-catalog.md#L37) -- Includes every platform-owned Vue page, platform shared controls, both bundled plugin UIs. A page with no editable control is deliberately retained. Inventory and commerce pages belong to th...

### e0289: `resources/js/Components/LanguageSwitcher.vue`

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0289). Complete every clause below before closing this section in the ledger.

- [ ] **e0289-c001** [prose, lines 47-48](../development-pack/shared/platform-source-catalog.md#L47) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0289-c002** [prose, lines 50-50](../development-pack/shared/platform-source-catalog.md#L50) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0289-c003** [source-code reference, lines 51-59](../development-pack/shared/platform-source-catalog.md#L51) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0289-c004** [prose, lines 61-61](../development-pack/shared/platform-source-catalog.md#L61) -- **Displayed data/value expressions:**
- [ ] **e0289-c005** [source-code reference, lines 62-66](../development-pack/shared/platform-source-catalog.md#L62) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0290: `resources/js/Components/Layout/GlobalSearch.vue`

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0290). Complete every clause below before closing this section in the ledger.

- [ ] **e0290-c001** [prose, lines 76-76](../development-pack/shared/platform-source-catalog.md#L76) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):**
- [ ] **e0290-c002** [statement, lines 77-77](../development-pack/shared/platform-source-catalog.md#L77) -- - resources/js/Components/Layout/GlobalSearch.vue:238: &lt;input ref="searchInput" :aria-label="$t('nav.globalSearch.placeholder')" v-model="query" type="text" :placeholder="$t('nav.globalSearc...
- [ ] **e0290-c003** [prose, lines 79-79](../development-pack/shared/platform-source-catalog.md#L79) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0290-c004** [source-code reference, lines 80-97](../development-pack/shared/platform-source-catalog.md#L80) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.
- [ ] **e0290-c005** [prose, lines 99-99](../development-pack/shared/platform-source-catalog.md#L99) -- **Displayed data/value expressions:**
- [ ] **e0290-c006** [source-code reference, lines 100-114](../development-pack/shared/platform-source-catalog.md#L100) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0292: `resources/js/Components/Layout/ThemeToggle.vue`

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0292). Complete every clause below before closing this section in the ledger.

- [ ] **e0292-c001** [prose, lines 124-125](../development-pack/shared/platform-source-catalog.md#L124) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.
- [ ] **e0292-c002** [prose, lines 127-127](../development-pack/shared/platform-source-catalog.md#L127) -- **View filters, permission/action and navigation anchors:**
- [ ] **e0292-c003** [source-code reference, lines 128-130](../development-pack/shared/platform-source-catalog.md#L128) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0316: `resources/js/Pages/Errors/403.vue`

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0316). Complete every clause below before closing this section in the ledger.

- [ ] **e0316-c001** [prose, lines 140-141](../development-pack/shared/platform-source-catalog.md#L140) -- **Editable controls (binding, HTML/component type, required/limits/disabled conditions):** No bound editable control found in this page; actions/data may be delegated to imported components.

### e0367: e0367

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0367). **Reference-only heading:** no body clauses in the supplied pack. Preserve this traceability anchor; it supplies no implementation or acceptance proof.


### e0382: e0382

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0382). Complete every clause below before closing this section in the ledger.

- [ ] **e0382-c001** [prose, lines 159-159](../development-pack/shared/platform-source-catalog.md#L159) -- Each validation block retains source context. Method signatures and concrete mutation/response anchors identify operations for implementation. These excerpts complement, not replace, the exp...

### e0422: `app/Http/Controllers/SearchController.php`

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0422). Complete every clause below before closing this section in the ledger.

- [ ] **e0422-c001** [source-code reference, lines 168-172](../development-pack/shared/platform-source-catalog.md#L168) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0432: Contract appendix `app/Http/Middleware/SetLocale.php:17-36`

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0432). Complete every clause below before closing this section in the ledger.

- [ ] **e0432-c001** [source-code reference, lines 181-202](../development-pack/shared/platform-source-catalog.md#L181) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0433: Contract appendix `routes/web/admin.php:1-160`

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0433). Complete every clause below before closing this section in the ledger.

- [ ] **e0433-c001** [source-code reference, lines 211-372](../development-pack/shared/platform-source-catalog.md#L211) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0434: Contract appendix `routes/web/account.php:1-67`

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0434). Complete every clause below before closing this section in the ledger.

- [ ] **e0434-c001** [source-code reference, lines 381-449](../development-pack/shared/platform-source-catalog.md#L381) -- Review and implement the applicable defaults / validators / state behavior in this reference block; do not copy source code.

### e0443: e0443

Source: [exact contract](../development-pack/shared/platform-source-catalog.md#e0443). **Reference-only heading:** no body clauses in the supplied pack. Preserve this traceability anchor; it supplies no implementation or acceptance proof.


## shared/platform.md

### e0253: e0253

Source: [exact contract](../development-pack/shared/platform.md#e0253). **Reference-only heading:** no body clauses in the supplied pack. Preserve this traceability anchor; it supplies no implementation or acceptance proof.


### e0254: e0254

Source: [exact contract](../development-pack/shared/platform.md#e0254). Complete every clause below before closing this section in the ledger.

- [ ] **e0254-c001** [prose, lines 34-34](../development-pack/shared/platform.md#L34) -- Source root: C:/Users/proj/Inventoros. Use this explanation WITH the platform source contracts distributed across this pack, inventory and commerce specifications. The catalog is required: i...
- [ ] **e0254-c002** [prose, lines 36-36](../development-pack/shared/platform.md#L36) -- Evidence: source-derived only in this section. No source edits, tests/builds, server launches, imports, sends, backups, plugin mutations or tax issuance performed. Parent browser evidence is...

### e0255: e0255

Source: [exact contract](../development-pack/shared/platform.md#e0255). Complete every clause below before closing this section in the ledger.

- [ ] **e0255-c001** [prose, lines 46-46](../development-pack/shared/platform.md#L46) -- Laravel/PHP controllers/services/Eloquent, Vue3/Inertia, Vite/Tailwind (composer.json:12-27, package.json:22-45, resources/js/app.js:20-82). React/TypeScript/Taruvi + Python-services rebuild...
- [ ] **e0255-c002** [prose, lines 48-48](../development-pack/shared/platform.md#L48) -- Shell: organization/warehouse switchers, global search, notification dropdown, language, theme, account/logout, responsive sidebar/mobile focus-contained drawer. Menu Layouts/AppLayout.vue:1...
- [ ] **e0255-c003** [prose, lines 50-50](../development-pack/shared/platform.md#L50) -- Locales: en/es/fr/de/pt-BR/it/ja/ko/zh-CN/ar/ru/nl/tr/pl (Http/Middleware/SetLocale.php:22-25), including RTL. Organization regional settings own money/date formatting. Search, downloads and...

### e0258: e0258

Source: [exact contract](../development-pack/shared/platform.md#e0258). Complete every clause below before closing this section in the ledger.

- [ ] **e0258-c001** [prose, lines 60-60](../development-pack/shared/platform.md#L60) -- Users pages Index/Create/Edit/Show. Index columns name,email,role,actions; exact filters in catalog. Show effective-permission search, role details, edit and delete confirmation; own-account...
- [ ] **e0258-c002** [prose, lines 62-62](../development-pack/shared/platform.md#L62) -- Create: name required string max255; email required email max255 globally unique users.email; password required confirmed Password::defaults(); password_confirmation; role required admin|man...
- [ ] **e0258-c003** [prose, lines 64-64](../development-pack/shared/platform.md#L64) -- Role create: name required string max255; description nullable string; permissions nullable string array(default &#91;&#93;); permission_set_ids nullable integer array referencing permission_sets(de...

### e0260: e0260

Source: [exact contract](../development-pack/shared/platform.md#e0260). Complete every clause below before closing this section in the ledger.

- [ ] **e0260-c001** [prose, lines 74-74](../development-pack/shared/platform.md#L74) -- Token: name required max255(default''),abilities required nonempty distinct array of held permissions(default&#91;&#93;). Show newly created token ONCE with copy affordance; lists thereafter metadat...
- [ ] **e0260-c002** [prose, lines 76-76](../development-pack/shared/platform.md#L76) -- Webhook: name required max255; url required URL max2048; events required nonempty allowed-event array; is_active boolean(defaulttrue). Request validator rejects local/metadata/private/reserv...
- [ ] **e0260-c003** [prose, lines 78-78](../development-pack/shared/platform.md#L78) -- Shipping settings: easypost_enabled/easypost_test_mode/notify_customers required booleans; easypost_api_key/easypost_test_api_key/easypost_webhook_secret optional max255 initialized blank. d...
- [ ] **e0260-c004** [prose, lines 80-80](../development-pack/shared/platform.md#L80) -- Storage: status/purpose mapping and check disk required string from FileStorageService purposes (Admin/StorageSettingsController.php:18-29). Not arbitrary filesystem access. Existing config ...

### e0261: e0261

Source: [exact contract](../development-pack/shared/platform.md#e0261). Complete every clause below before closing this section in the ledger.

- [ ] **e0261-c001** [prose, lines 90-90](../development-pack/shared/platform.md#L90) -- Notification stats/read-unread filters, type/title/message/time/read state/action link. Mark-one-read redirects to target only after successful write; confirm mark-all/delete/clear-read. Pen...
- [ ] **e0261-c002** [prose, lines 92-92](../development-pack/shared/platform.md#L92) -- Activity filters search,user_id,category,action,subject_type,date_from,date_to; security shortcut; expanded before/after values and recorded security context. Warning actions auth.failed/aut...

### e0264: Schedules

Source: [exact contract](../development-pack/shared/platform.md#e0264). Complete every clause below before closing this section in the ledger.

- [ ] **e0264-c001** [prose, lines 102-102](../development-pack/shared/platform.md#L102) -- frequency required daily|weekly|monthly; day_of_week nullable/required weekly integer0..6; day_of_month nullable/required monthly1..31; time_of_day required H:i; format csv|xlsx|pdf; recipie...

### e0272: e0272

Source: [exact contract](../development-pack/shared/platform.md#e0272). Complete every clause below before closing this section in the ledger.

- [ ] **e0272-c001** [statement, lines 112-112](../development-pack/shared/platform.md#L112) -- 1. Login invalid/valid/throttle/session;2FA enable/challenge/recovery once;reset/verify with mail fixture.
- [ ] **e0272-c002** [statement, lines 113-113](../development-pack/shared/platform.md#L113) -- 2. Two organizations, same-looking records: detail/list/search/export/API/MCP scoped. Stale tab write rejected on org switch.
- [ ] **e0272-c003** [statement, lines 114-114](../development-pack/shared/platform.md#L114) -- 3. Permission-limited dashboard payload excludes money/PII; token cannot grant unheld ability; direct backend denial beyond hidden UI.
- [ ] **e0272-c004** [statement, lines 115-115](../development-pack/shared/platform.md#L115) -- 4. User uniqueness/roles/escalation/self-delete;protected role guards;edit blank password retention.
- [ ] **e0272-c005** [statement, lines 116-116](../development-pack/shared/platform.md#L116) -- 5. Independent settings saves retain unrelated keys;blank secret safe;locale/RTL/date/currency persist.
- [ ] **e0272-c006** [statement, lines 117-117](../development-pack/shared/platform.md#L117) -- 6. Widget preferences persist but do not grant data;currency totals isolated.
- [ ] **e0272-c007** [statement, lines 118-118](../development-pack/shared/platform.md#L118) -- 7. Webhook private/unreachable/failure/retry/postcommit delivery;attempt evidence accurate.
- [ ] **e0272-c008** [statement, lines 119-119](../development-pack/shared/platform.md#L119) -- 8. Reports filter/sort/chart/preview/save/share/export;revoked access;missing/backfilled cost;empty/capped/full datasets;ABC boundaries.
- [ ] **e0272-c009** [statement, lines 120-120](../development-pack/shared/platform.md#L120) -- 9. Schedule bad time/day/outsider/permission recipient rejected;send-time revocation enforced.
- [ ] **e0272-c010** [statement, lines 121-121](../development-pack/shared/platform.md#L121) -- 10. Imports MIME/size/malformed/missing headers/row conflicts/foreign SKU or role/partial failures/queue failure;historical zero stock+zero integration side effects.
- [ ] **e0272-c011** [statement, lines 122-122](../development-pack/shared/platform.md#L122) -- 11. Portal cross-customer/org access denied;non-delivered/excess/repeated return rejected;pending no stock;staff receipt expected effects.
- [ ] **e0272-c012** [statement, lines 123-123](../development-pack/shared/platform.md#L123) -- 12. Tax generic/India invalid GSTIN/region/HSN/totals/duplicate issue;issued snapshot PDF stable after master-data changes.
- [ ] **e0272-c013** [statement, lines 124-124](../development-pack/shared/platform.md#L124) -- 13. Plugin hook failure/deactivation/uninstall/update rollback/inactive-route denial/no orphan reservations;marketplace auth failure explicit.
- [ ] **e0272-c014** [statement, lines 125-125](../development-pack/shared/platform.md#L125) -- 14. Installer already-installed/nonempty reset/wrong DB/recovery;backup failure not success;restore traversal rejected.
- [ ] **e0272-c015** [statement, lines 126-126](../development-pack/shared/platform.md#L126) -- 15. Desktop/mobile/focus/table overflow/empty/loading/error/i18n/validation accessibility, separate screenshot and functional evidence.

### e0273: e0273

Source: [exact contract](../development-pack/shared/platform.md#e0273). Complete every clause below before closing this section in the ledger.

- [ ] **e0273-c001** [prose, lines 136-136](../development-pack/shared/platform.md#L136) -- This handoff is narrative+exact source catalog+sibling modules, not a menu mockup. All mutation/permission/provider/queue/backup/API transport acceptance requires dedicated validation. No ex...

### e0275: Schedule detail not captured by simple validation-list reading

Source: [exact contract](../development-pack/shared/platform.md#e0275). Complete every clause below before closing this section in the ledger.

- [ ] **e0275-c001** [prose, lines 146-146](../development-pack/shared/platform.md#L146) -- Schedule creation sets is_active=true. Update reads is_active boolean(default existing), recomputes next_run_at from now after timing change/resume so missed paused slots do not immediately ...

### e0276: e0276

Source: [exact contract](../development-pack/shared/platform.md#e0276). Complete every clause below before closing this section in the ledger.

- [ ] **e0276-c001** [prose, lines 156-156](../development-pack/shared/platform.md#L156) -- User-selected destination is **Taruvi native datatables and native storage, with Python backend services**, not a separate Supabase backend. Laravel tables/models/services are evidence of bu...

### e0277: e0277

Source: [exact contract](../development-pack/shared/platform.md#e0277). Complete every clause below before closing this section in the ledger.

- [ ] **e0277-c001** [prose, lines 166-166](../development-pack/shared/platform.md#L166) -- Platform page files: **70** (Dashboard1,Admin10,Auth8,Profile4,Settings11,Install5,ImportExport1,Reports17,Portal10,Plugins1,Notifications1,Errors1), plus **8** shared platform controls and ...
- [ ] **e0277-c002** [prose, lines 168-168](../development-pack/shared/platform.md#L168) -- Coverage is **exhaustive file/control inventory for the owned platform page set**, NOT a claim every runtime branch, plugin extension supplied in future, derived SQL formula, external provid...

## shared/shared-gaps.md

### e0461: e0461

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0461). **Reference-only heading:** no body clauses in the supplied pack. Preserve this traceability anchor; it supplies no implementation or acceptance proof.


### e0462: e0462

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0462). Complete every clause below before closing this section in the ledger.

- [ ] **e0462-c001** [prose, lines 33-33](../development-pack/shared/shared-gaps.md#L33) -- Read-only final comparison against the platform source contracts distributed across this pack, the commerce contracts distributed across this pack, the original inventory extraction (its con...
- [ ] **e0462-c002** [prose, lines 35-35](../development-pack/shared/shared-gaps.md#L35) -- **All123 Vue Page paths appear across the three reports. No missing Page paths.** The scan is path coverage, not a claim of behavioral completeness. Below closes omitted shared-control owner...

### e0463: e0463

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0463). Complete every clause below before closing this section in the ledger.

- [ ] **e0463-c001** [prose, lines 45-45](../development-pack/shared/shared-gaps.md#L45) -- Source resources/js/Components/ImportExport/FileDrop.vue:10-48,61-98.
- [ ] **e0463-c002** [statement, lines 47-47](../development-pack/shared/shared-gaps.md#L47) -- - Props modelValue: Object|null, default null; inputId:String, required.
- [ ] **e0463-c003** [statement, lines 48-48](../development-pack/shared/shared-gaps.md#L48) -- - Native file input type=file, id=inputId, accept .csv,.xlsx,.xls; no multiple attribute. Browse invokes native picker; selection or drop uses ONLY first File. Drop accept is not enforced by...
- [ ] **e0463-c004** [statement, lines 49-49](../development-pack/shared/shared-gaps.md#L49) -- - Emit update:modelValue(File|null) on change/drop/clear. No endpoint submission or business validation; parent import form owns send and backend rule.
- [ ] **e0463-c005** [statement, lines 50-50](../development-pack/shared/shared-gaps.md#L50) -- - Internal input ref null/isDragging false. Dragover true, dragleave/drop false. Existing selection displays modelValue.name and ready-to-import message; remove emits null.
- [ ] **e0463-c006** [statement, lines 51-51](../development-pack/shared/shared-gaps.md#L51) -- - Watch clearing parent model resets native input.value so same file can be selected again.
- [ ] **e0463-c007** [statement, lines 52-52](../development-pack/shared/shared-gaps.md#L52) -- - **Intentional evidence distinction:** backend import rules also allow txt, whereas browse accept does not list txt. UI accept is not MIME/size validation. Source backend app/Http/Controlle...
- [ ] **e0463-c008** [statement, lines 53-53](../development-pack/shared/shared-gaps.md#L53) -- - Acceptance: select/drop first of several; clear/reselect same file; spoof extension rejected backend; failed upload retains actionable error; no server record is created merely by selectio...

### e0464: e0464

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0464). Complete every clause below before closing this section in the ledger.

- [ ] **e0464-c001** [prose, lines 63-63](../development-pack/shared/shared-gaps.md#L63) -- Source resources/js/Components/ImportExport/ImportResult.vue:3-9,16-36,40-95.
- [ ] **e0464-c002** [statement, lines 65-65](../development-pack/shared/shared-gaps.md#L65) -- - Required result:Object: {type,message,stats:{imported,updated?,skipped?,failed?,errors:&#91;{row,errors}&#93;,warnings:&#91;{row,warnings}&#93;}}.
- [ ] **e0464-c003** [statement, lines 66-66](../development-pack/shared/shared-gaps.md#L66) -- - stats fallback {},errors/warnings fallback &#91;&#93;. Render counts only if corresponding value is numeric (zero is valid), not truthy-only.
- [ ] **e0464-c004** [statement, lines 67-67](../development-pack/shared/shared-gaps.md#L67) -- - Render result.message; imported/updated/skipped/failed summary; separate scrollable row-error and row-warning lists with original row numbers; errors/warnings arrays joined for display.
- [ ] **e0464-c005** [statement, lines 68-68](../development-pack/shared/shared-gaps.md#L68) -- - Emit dismiss from close button; no database deletion. Global flash strings are not a substitute for this structured partial-result view.
- [ ] **e0464-c006** [statement, lines 69-69](../development-pack/shared/shared-gaps.md#L69) -- - Acceptance: zero counts, mixed successes/errors, warnings-only duplicate SKU skips, dismiss without losing persisted import results elsewhere.

### e0466: e0466

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0466). Complete every clause below before closing this section in the ledger.

- [ ] **e0466-c001** [prose, lines 79-79](../development-pack/shared/shared-gaps.md#L79) -- Source resources/js/Components/ui/TableFilters.vue:7-41,48-74.
- [ ] **e0466-c002** [statement, lines 81-81](../development-pack/shared/shared-gaps.md#L81) -- - Props padded:Boolean true,label:String null,enabled:Boolean true; expanded false,panel null.
- [ ] **e0466-c003** [statement, lines 82-82](../development-pack/shared/shared-gaps.md#L82) -- - Named quick slot and default filter-content slot. Does NOT own business search/date/status bindings; parent pages already specify them.
- [ ] **e0466-c004** [statement, lines 83-83](../development-pack/shared/shared-gaps.md#L83) -- - Active count from page.props.filters excludes per_page/page/sort_by/sort_dir and null/undefined/empty/'all'. Boolean-like out_of_stock/include_zero/low_stock count only true,1,'1','true'. ...
- [ ] **e0466-c005** [statement, lines 84-84](../development-pack/shared/shared-gaps.md#L84) -- - Details toggle synchronizes expanded; submit closes; Escape closes and focuses summary; outside pointer closes; listener removed on unmount. enabled=false hides disclosure, not quick slot.
- [ ] **e0466-c006** [statement, lines 85-85](../development-pack/shared/shared-gaps.md#L85) -- - Acceptance: count switches correctly; Escape/focus; outside click; form submit closes without changing submitted values.

### e0467: e0467

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0467). Complete every clause below before closing this section in the ledger.

- [ ] **e0467-c001** [statement, lines 95-95](../development-pack/shared/shared-gaps.md#L95) -- - resources/js/Components/Checkbox.vue:4-24,28-33: required checked:Array|Boolean; value defaultnull; proxy native checkbox emits **update:checked**, not update:modelValue. Parent array sele...
- [ ] **e0467-c002** [statement, lines 96-96](../development-pack/shared/shared-gaps.md#L96) -- - resources/js/Components/TextInput.vue:4-17,21-24: defineModel String required; native input inherits caller attributes; mounted autofocus honored; exposes focus(). Required component model...
- [ ] **e0467-c003** [statement, lines 97-97](../development-pack/shared/shared-gaps.md#L97) -- - resources/js/Components/ui/Input.vue:4-19,33-40: modelValue:String|Number default'',type=text,placeholder='',disabled=false,invalid=false,size=md validator sm|md|lg. Explicit attrs forward...

### e0468: e0468

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0468). Complete every clause below before closing this section in the ledger.

- [ ] **e0468-c001** [statement, lines 107-107](../development-pack/shared/shared-gaps.md#L107) -- - resources/js/Components/QuickAddModal.vue:5-38,42-95: show=false,title required String,loading=false,maxWidth=md (mapped sm/md/lg/xl/2xl); emits close via backdrop/header/cancel; content/a...
- [ ] **e0468-c002** [statement, lines 108-108](../development-pack/shared/shared-gaps.md#L108) -- - resources/js/Components/ui/DataTable.vue:17-41,65-104: required columns/rows arrays; columns shape key,label,align?,class?,width?; rowHref optional function; rowKey String|Function default...

### e0469: e0469

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0469). Complete every clause below before closing this section in the ledger.

- [ ] **e0469-c001** [prose, lines 118-118](../development-pack/shared/shared-gaps.md#L118) -- These hosts do not own fixed input schemas; plugin implementations supply them. Existing bundled plugin controls already cataloged; future arbitrary plugins cannot be exhaustively specified ...
- [ ] **e0469-c002** [statement, lines 120-120](../development-pack/shared/shared-gaps.md#L120) -- - resources/js/Components/PluginSlot.vue:6-50,55-60: required slot:String,context:Object default{},components:Array default&#91;&#93;,page:String null default current Inertia-derived page ID. Merge ...
- [ ] **e0469-c003** [statement, lines 121-121](../development-pack/shared/shared-gaps.md#L121) -- - resources/js/Components/PluginTabs.vue:20-77: components&#91;&#93;/page null; Overview active by default. Resolve+merge server/runtime tab definitions, label via localization fallback, order by po...
- [ ] **e0469-c004** [statement, lines 122-122](../development-pack/shared/shared-gaps.md#L122) -- - resources/js/Components/PluginWidgets.vue:15-39,44-55: widgets&#91;&#93;; resolve runtime component, omit unavailable until loaded; localized heading; widths full/half/third/quarter,unknown→full; ...

### e0470: e0470

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0470). Complete every clause below before closing this section in the ledger.

- [ ] **e0470-c001** [prose, lines 132-132](../development-pack/shared/shared-gaps.md#L132) -- Source resources/js/Components/ImageGallery.vue:6-72,79-212. images:Array default&#91;&#93;,productName:String default''; currentIndex0/showLightboxfalse; no images→current null. Thumbnail changes c...

### e0471: e0471

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0471). Complete every clause below before closing this section in the ledger.

- [ ] **e0471-c001** [prose, lines 142-142](../development-pack/shared/shared-gaps.md#L142) -- No tests executed. These gap notes add field/state/emission fidelity without creating records or altering source. Generic presentational primitives below are inventoried but are not addition...

### e0472: e0472

Source: [exact contract](../development-pack/shared/shared-gaps.md#e0472). Complete every clause below before closing this section in the ledger.

- [ ] **e0472-c001** [prose, lines 152-152](../development-pack/shared/shared-gaps.md#L152) -- 67 components: 29 previously referenced; 13 supplemental contracts above; 25 remaining primitives. All123 Page paths present; missing list: &#91;&#93;. Exact-path coverage is deliberately distinct f...
- [ ] **e0472-c002** [table row, lines 154-154](../development-pack/shared/shared-gaps.md#L154) -- Component  /  Coverage disposition
- [ ] **e0472-c003** [table row, lines 156-156](../development-pack/shared/shared-gaps.md#L156) -- resources/js/Components/ActionError.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c004** [table row, lines 157-157](../development-pack/shared/shared-gaps.md#L157) -- resources/js/Components/ActivityTimeline.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c005** [table row, lines 158-158](../development-pack/shared/shared-gaps.md#L158) -- resources/js/Components/ApplicationLogo.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c006** [table row, lines 159-159](../development-pack/shared/shared-gaps.md#L159) -- resources/js/Components/ApprovalPanel.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c007** [table row, lines 160-160](../development-pack/shared/shared-gaps.md#L160) -- resources/js/Components/BarcodeScanner.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c008** [table row, lines 161-161](../development-pack/shared/shared-gaps.md#L161) -- resources/js/Components/BarcodeScannerModal.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c009** [table row, lines 162-162](../development-pack/shared/shared-gaps.md#L162) -- resources/js/Components/BatchList.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c010** [table row, lines 163-163](../development-pack/shared/shared-gaps.md#L163) -- resources/js/Components/Checkbox.vue  /  Gap contract added above
- [ ] **e0472-c011** [table row, lines 164-164](../development-pack/shared/shared-gaps.md#L164) -- resources/js/Components/CurrencySelect.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c012** [table row, lines 165-165](../development-pack/shared/shared-gaps.md#L165) -- resources/js/Components/CustomerPicker.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c013** [table row, lines 166-166](../development-pack/shared/shared-gaps.md#L166) -- resources/js/Components/DangerButton.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c014** [table row, lines 167-167](../development-pack/shared/shared-gaps.md#L167) -- resources/js/Components/Dashboard/MetricCard.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c015** [table row, lines 168-168](../development-pack/shared/shared-gaps.md#L168) -- resources/js/Components/DialogSurface.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c016** [table row, lines 169-169](../development-pack/shared/shared-gaps.md#L169) -- resources/js/Components/DiscountInput.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c017** [table row, lines 170-170](../development-pack/shared/shared-gaps.md#L170) -- resources/js/Components/Dropdown.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c018** [table row, lines 171-171](../development-pack/shared/shared-gaps.md#L171) -- resources/js/Components/ImageGallery.vue  /  Gap contract added above
- [ ] **e0472-c019** [table row, lines 172-172](../development-pack/shared/shared-gaps.md#L172) -- resources/js/Components/ImageUploader.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c020** [table row, lines 173-173](../development-pack/shared/shared-gaps.md#L173) -- resources/js/Components/ImportExport/FileDrop.vue  /  Gap contract added above
- [ ] **e0472-c021** [table row, lines 174-174](../development-pack/shared/shared-gaps.md#L174) -- resources/js/Components/ImportExport/ImportResult.vue  /  Gap contract added above
- [ ] **e0472-c022** [table row, lines 175-175](../development-pack/shared/shared-gaps.md#L175) -- resources/js/Components/InputError.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c023** [table row, lines 176-176](../development-pack/shared/shared-gaps.md#L176) -- resources/js/Components/InputLabel.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c024** [table row, lines 177-177](../development-pack/shared/shared-gaps.md#L177) -- resources/js/Components/LanguageSwitcher.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c025** [table row, lines 178-178](../development-pack/shared/shared-gaps.md#L178) -- resources/js/Components/Layout/FlashMessages.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c026** [table row, lines 179-179](../development-pack/shared/shared-gaps.md#L179) -- resources/js/Components/Layout/GlobalSearch.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c027** [table row, lines 180-180](../development-pack/shared/shared-gaps.md#L180) -- resources/js/Components/Layout/NotificationDropdown.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c028** [table row, lines 181-181](../development-pack/shared/shared-gaps.md#L181) -- resources/js/Components/Layout/ThemeToggle.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c029** [table row, lines 182-182](../development-pack/shared/shared-gaps.md#L182) -- resources/js/Components/LegalFooter.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c030** [table row, lines 183-183](../development-pack/shared/shared-gaps.md#L183) -- resources/js/Components/Modal.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c031** [table row, lines 184-184](../development-pack/shared/shared-gaps.md#L184) -- resources/js/Components/OrganizationSwitcher.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c032** [table row, lines 185-185](../development-pack/shared/shared-gaps.md#L185) -- resources/js/Components/PluginSlot.vue  /  Gap contract added above
- [ ] **e0472-c033** [table row, lines 186-186](../development-pack/shared/shared-gaps.md#L186) -- resources/js/Components/PluginTabs.vue  /  Gap contract added above
- [ ] **e0472-c034** [table row, lines 187-187](../development-pack/shared/shared-gaps.md#L187) -- resources/js/Components/PluginWidgets.vue  /  Gap contract added above
- [ ] **e0472-c035** [table row, lines 188-188](../development-pack/shared/shared-gaps.md#L188) -- resources/js/Components/Portal/PortalAuthCard.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c036** [table row, lines 189-189](../development-pack/shared/shared-gaps.md#L189) -- resources/js/Components/Portal/PortalPagination.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c037** [table row, lines 190-190](../development-pack/shared/shared-gaps.md#L190) -- resources/js/Components/Portal/PortalStatusBadge.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c038** [table row, lines 191-191](../development-pack/shared/shared-gaps.md#L191) -- resources/js/Components/PrimaryButton.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c039** [table row, lines 192-192](../development-pack/shared/shared-gaps.md#L192) -- resources/js/Components/ProductSupplierManager.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c040** [table row, lines 193-193](../development-pack/shared/shared-gaps.md#L193) -- resources/js/Components/ProductVariantManager.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c041** [table row, lines 194-194](../development-pack/shared/shared-gaps.md#L194) -- resources/js/Components/QuickAddModal.vue  /  Gap contract added above
- [ ] **e0472-c042** [table row, lines 195-195](../development-pack/shared/shared-gaps.md#L195) -- resources/js/Components/Reports/ExportMenu.vue  /  Gap contract added above
- [ ] **e0472-c043** [table row, lines 196-196](../development-pack/shared/shared-gaps.md#L196) -- resources/js/Components/Reports/PeriodFilter.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c044** [table row, lines 197-197](../development-pack/shared/shared-gaps.md#L197) -- resources/js/Components/Reports/ReportSchedules.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c045** [table row, lines 198-198](../development-pack/shared/shared-gaps.md#L198) -- resources/js/Components/SecondaryButton.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c046** [table row, lines 199-199](../development-pack/shared/shared-gaps.md#L199) -- resources/js/Components/SendDocumentModal.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c047** [table row, lines 200-200](../development-pack/shared/shared-gaps.md#L200) -- resources/js/Components/SerialList.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c048** [table row, lines 201-201](../development-pack/shared/shared-gaps.md#L201) -- resources/js/Components/Shipping/ShipmentsPanel.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c049** [table row, lines 202-202](../development-pack/shared/shared-gaps.md#L202) -- resources/js/Components/Shipping/ShipOrderModal.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c050** [table row, lines 203-203](../development-pack/shared/shared-gaps.md#L203) -- resources/js/Components/SKUGeneratorModal.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c051** [table row, lines 204-204](../development-pack/shared/shared-gaps.md#L204) -- resources/js/Components/StockAuditReviewEvidence.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c052** [table row, lines 205-205](../development-pack/shared/shared-gaps.md#L205) -- resources/js/Components/SupplierRating.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c053** [table row, lines 206-206](../development-pack/shared/shared-gaps.md#L206) -- resources/js/Components/TaxInput.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c054** [table row, lines 207-207](../development-pack/shared/shared-gaps.md#L207) -- resources/js/Components/TextInput.vue  /  Gap contract added above
- [ ] **e0472-c055** [table row, lines 208-208](../development-pack/shared/shared-gaps.md#L208) -- resources/js/Components/ui/Badge.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c056** [table row, lines 209-209](../development-pack/shared/shared-gaps.md#L209) -- resources/js/Components/ui/Button.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c057** [table row, lines 210-210](../development-pack/shared/shared-gaps.md#L210) -- resources/js/Components/ui/Card.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c058** [table row, lines 211-211](../development-pack/shared/shared-gaps.md#L211) -- resources/js/Components/ui/CardHeader.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c059** [table row, lines 212-212](../development-pack/shared/shared-gaps.md#L212) -- resources/js/Components/ui/DataTable.vue  /  Gap contract added above
- [ ] **e0472-c060** [table row, lines 213-213](../development-pack/shared/shared-gaps.md#L213) -- resources/js/Components/ui/Input.vue  /  Gap contract added above
- [ ] **e0472-c061** [table row, lines 214-214](../development-pack/shared/shared-gaps.md#L214) -- resources/js/Components/ui/PageHeader.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c062** [table row, lines 215-215](../development-pack/shared/shared-gaps.md#L215) -- resources/js/Components/ui/Pagination.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c063** [table row, lines 216-216](../development-pack/shared/shared-gaps.md#L216) -- resources/js/Components/ui/StatTile.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c064** [table row, lines 217-217](../development-pack/shared/shared-gaps.md#L217) -- resources/js/Components/ui/TableFilters.vue  /  Gap contract added above
- [ ] **e0472-c065** [table row, lines 218-218](../development-pack/shared/shared-gaps.md#L218) -- resources/js/Components/ui/TableViewport.vue  /  Presentational/layout/status primitive; no additional owned domain form found by control-marker scan
- [ ] **e0472-c066** [table row, lines 219-219](../development-pack/shared/shared-gaps.md#L219) -- resources/js/Components/VariantsTable.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c067** [table row, lines 220-220](../development-pack/shared/shared-gaps.md#L220) -- resources/js/Components/VariantStockAdjuster.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c068** [table row, lines 221-221](../development-pack/shared/shared-gaps.md#L221) -- resources/js/Components/WarehouseStockLevels.vue  /  Referenced in prior domain/platform evidence
- [ ] **e0472-c069** [table row, lines 222-222](../development-pack/shared/shared-gaps.md#L222) -- resources/js/Components/WarehouseSwitcher.vue  /  Referenced in prior domain/platform evidence

