import {render,screen,cleanup,fireEvent,waitFor} from "@testing-library/react";
import {MemoryRouter} from "react-router";
import {afterEach,beforeEach,expect,it,vi} from "vitest";
import {CommerceDocumentsWorkspace} from "./commerceDocuments";
const f=vi.hoisted(()=>({notify:vi.fn(),enabled:false,api:vi.fn(),execute:vi.fn(),state:null as any}));
const org="22222222-2222-4222-8222-222222222222",id="33333333-3333-4333-8333-333333333333",product="44444444-4444-4444-8444-444444444444",line="55555555-5555-4555-8555-555555555555";
const document={id,kind:"sales_order",number:"SO-001",revision:1,status:"pending",approval_status:"pending",draft:{customer_id:null,customer_name:"Buyer",customer_email:"",customer_address:"",order_date:"2026-11-11",currency:"INR",notes:"",tax:"0.00",shipping:"0.00",items:[{line_id:line,product_id:product,product_variant_id:null,quantity:1,unit_price:"10.00"}]},snapshots:{products:{[product]:{name:"Granite",sku:"G1"}},customers:{},suppliers:{},locations:{}},subtotal:"10.00",total:"10.00",created_by:"11111111-1111-4111-8111-111111111111",created_at:"2026-11-11T00:00:00Z",updated_at:"2026-11-11T00:00:00Z",allocations:[],fulfilled:{},received:{}};
vi.mock("@refinedev/core",()=>({useNotification:()=>({open:f.notify}),useWarnAboutChange:()=>({warnWhen:false,setWarnWhen:vi.fn()}),useGetIdentity:()=>({data:{id:"11111111-1111-4111-8111-111111111111"}}),useList:(args:{resource:string})=>({result:{data:f.enabled?(args.resource==="organizations"?[{id:org,name:"HMG",settings:{stock_authority:"ledger_v2"}}]:args.resource==="products"?[{id:product,organization_id:org,name:"Granite",sku:"G1",type:"standard",tracking_type:"none",selling_price:"10.00",currency:"INR",is_active:true}]:args.resource==="product_locations"?[{id:"77777777-7777-4777-8777-777777777777",organization_id:org,name:"Main yard",is_active:true}]:[]):[],total:f.enabled&&["organizations","products"].includes(args.resource)?1:0},query:{isLoading:false,isFetching:false,isError:false}}),useCustomMutation:()=>({mutateAsync:f.api})}));
vi.mock("../../hooks/useCommerceLedger",()=>({useCommerceLedger:()=>({state:f.state,enabled:f.enabled,locked:!f.enabled,pending:null,busy:false,owner:"11111111-1111-4111-8111-111111111111",refresh:vi.fn(),execute:f.execute})}));
beforeEach(()=>{f.enabled=false;f.state=null;f.api.mockReset();f.execute.mockReset();});
afterEach(cleanup);
it("shows the normal sales document workspace without enabling unverified actions",()=>{render(<MemoryRouter><CommerceDocumentsWorkspace kind="sales_order" /></MemoryRouter>);expect(screen.getByRole("heading",{name:"Sales orders"})).toBeTruthy();expect(screen.getByRole("textbox",{name:"Search documents"})).toBeTruthy();expect(screen.getByText(/Select an organization with/)).toBeTruthy();});
it("does not fall back to a legacy row when the ledger document is missing",()=>{render(<MemoryRouter><CommerceDocumentsWorkspace kind="purchase_order" documentId="22222222-2222-4222-8222-222222222222" edit /></MemoryRouter>);expect(screen.getByText(/No verified document is available/)).toBeTruthy();expect(screen.queryByRole("button",{name:"Save changes"})).toBeNull();});

it("allows another standard product line in a pending document draft",async()=>{
 f.enabled=true;f.state={organization_id:org,head:"a".repeat(64),documents:{[id]:document},balances:[],entitlements:{},requests:{},reservations:{}};
 render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id} edit/></MemoryRouter>);
 fireEvent.mouseDown(await screen.findByRole("combobox",{name:"Add product"}));
 fireEvent.click(await screen.findByRole("option",{name:"Granite · G1"}));
 fireEvent.click(screen.getByRole("button",{name:"Add product line"}));
 expect(await screen.findByLabelText("Quantity 2")).toBeTruthy();
});
it("retains a dirty draft when the workflow becomes unavailable",async()=>{
 f.enabled=true;f.state={organization_id:org,head:"a".repeat(64),documents:{[id]:document},balances:[],entitlements:{},requests:{},reservations:{}};
 const {rerender}=render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id} edit/></MemoryRouter>);
 fireEvent.change(screen.getByLabelText("Notes"),{target:{value:"Keep my edit"}});
 f.state=null;f.enabled=false;
 rerender(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id} edit/></MemoryRouter>);
 expect(screen.getByDisplayValue("Keep my edit")).toBeTruthy();
 expect(screen.getByRole("button",{name:"Save changes"}).hasAttribute("disabled")).toBe(true);
});

it("uses the saved customer snapshot instead of caller-entered identity",()=>{
 const customer="66666666-6666-4666-8666-666666666666";
 f.enabled=true;f.state={organization_id:org,head:"a".repeat(64),documents:{[id]:{...document,draft:{...document.draft,customer_id:customer,customer_name:"Spoofed name"},snapshots:{...document.snapshots,customers:{[customer]:{name:"Canonical customer",email:"real@example.invalid"}}}}},balances:[],entitlements:{},requests:{},reservations:{}};
 render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id}/></MemoryRouter>);
 expect(screen.getAllByText("Canonical customer").length).toBeGreaterThan(0);expect(screen.queryByText("Spoofed name")).toBeNull();expect(screen.getByText("real@example.invalid")).toBeTruthy();
 render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id} edit/></MemoryRouter>);
 expect(screen.getByDisplayValue("Canonical customer")).toBeTruthy();expect(screen.queryByDisplayValue("Spoofed name")).toBeNull();
});
it("submits the original amendment revision when another read advances the document",async()=>{
 f.enabled=true;f.state={organization_id:org,head:"a".repeat(64),documents:{[id]:document},balances:[],entitlements:{},requests:{},reservations:{}};f.execute.mockResolvedValue(null);
 const {rerender}=render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id} edit/></MemoryRouter>);
 fireEvent.change(screen.getByLabelText("Notes"),{target:{value:"My draft"}});
 f.state={...f.state,documents:{[id]:{...document,revision:2}}};
 rerender(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id} edit/></MemoryRouter>);
 fireEvent.change(screen.getByLabelText(/Workflow reason/),{target:{value:"Correct quote"}});
 fireEvent.click(screen.getByRole("button",{name:"Save changes"}));fireEvent.click(await screen.findByRole("button",{name:"Confirm and save"}));
 await waitFor(()=>expect(f.execute).toHaveBeenCalledTimes(1));expect(f.execute.mock.calls[0][0]).toMatchObject({action:"amend_document",reason:"Correct quote",expected_revision:1,document:{notes:"My draft"}});
});
it("pins page two and restarts after HEAD_CHANGED instead of mixing rows",async()=>{
 f.enabled=true;f.state={organization_id:org,head:"a".repeat(64),documents:{},balances:[],entitlements:{},requests:{},reservations:{}};
 const page={ok:true,code:"DOCUMENTS",organization_id:org,data:[document],total:21,head:"a".repeat(64),capabilities:["commerce_v2"]};
 f.api.mockResolvedValueOnce({data:page}).mockResolvedValueOnce({data:{ok:false,code:"HEAD_CHANGED"}}).mockResolvedValue({data:page});
 render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order"/></MemoryRouter>);
 await screen.findByText("SO-001");fireEvent.click(screen.getByRole("button",{name:"Go to next page"}));
 await waitFor(()=>expect(f.api.mock.calls.some(call=>call[0].values.page===2)).toBe(true));
 expect(f.api.mock.calls.find(call=>call[0].values.page===2)?.[0].values.expected_head).toBe("a".repeat(64));
 await waitFor(()=>expect(f.api).toHaveBeenCalledTimes(3));expect(f.api.mock.calls[2][0].values.page).toBe(1);expect(f.api.mock.calls[2][0].values.expected_head).toBeUndefined();
});
it("locks a retained draft if a verified response omits its document",()=>{
 f.enabled=true;f.state={organization_id:org,head:"a".repeat(64),documents:{[id]:document},balances:[],entitlements:{},requests:{},reservations:{}};
 const {rerender}=render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id} edit/></MemoryRouter>);
 fireEvent.change(screen.getByLabelText("Notes"),{target:{value:"Still here"}});f.state={...f.state,documents:{}};
 rerender(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id} edit/></MemoryRouter>);
 expect(screen.getByDisplayValue("Still here")).toBeTruthy();expect(screen.getByRole("button",{name:"Save changes"}).hasAttribute("disabled")).toBe(true);
});

const yard="77777777-7777-4777-8777-777777777777";
it("prefills the approval with the location that has free stock and reserves it in one step",async()=>{
 f.enabled=true;f.state={organization_id:org,head:"a".repeat(64),documents:{[id]:document},balances:[{product_id:product,location_id:yard,quantity:5,reserved:1}],entitlements:{},requests:{},reservations:{}};f.execute.mockResolvedValue(null);
 render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id}/></MemoryRouter>);
 fireEvent.click(screen.getByRole("button",{name:"Approve"}));
 const dialog=await screen.findByRole("dialog");
 expect(screen.getByRole("combobox",{name:/Location 1/})).toHaveProperty("value","Main yard");expect(screen.getByText("4 free at this location")).toBeTruthy();expect(screen.getByText("1 of 1 allocated")).toBeTruthy();
 expect(f.execute).not.toHaveBeenCalled();
 fireEvent.click(screen.getByRole("button",{name:"Approve and reserve stock"}));await waitFor(()=>expect(f.execute).toHaveBeenCalledTimes(1));
 expect(dialog).toBeTruthy();
 expect(f.execute.mock.calls[0][0]).toMatchObject({action:"approve_document",document_id:id,expected_revision:1,reason:"Approved; stock reserved for the customer.",allocations:[{line_id:line,location_id:yard,quantity:1}]});
});
it("blocks an approval the ledger would reject and says why",async()=>{
 f.enabled=true;f.state={organization_id:org,head:"a".repeat(64),documents:{[id]:{...document,draft:{...document.draft,items:[{...document.draft.items[0],quantity:6}]}}},balances:[{product_id:product,location_id:yard,quantity:2,reserved:0}],entitlements:{},requests:{},reservations:{}};
 render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="sales_order" documentId={id}/></MemoryRouter>);
 fireEvent.click(screen.getByRole("button",{name:"Approve"}));
 expect(await screen.findByText("Only 2 free at Main yard (requested 6).")).toBeTruthy();
 expect(screen.getByRole("button",{name:"Approve and reserve stock"}).hasAttribute("disabled")).toBe(true);
 fireEvent.click(screen.getByRole("button",{name:"Add another location"}));
 expect(screen.getByText("Allocate exactly 6 (currently 7).")).toBeTruthy();
 expect(f.execute).not.toHaveBeenCalled();
});
it("posts a purchase receipt only through its explicit reviewed command",async()=>{
 const purchase={...document,kind:"purchase_order",status:"approved",approval_status:"approved",draft:{supplier_id:"88888888-8888-4888-8888-888888888888",order_date:"2026-11-11",expected_date:null,currency:"INR",notes:"",tax:"0.00",shipping:"0.00",items:[{line_id:line,product_id:product,product_variant_id:null,quantity:1,unit_cost:"10.00",supplier_sku:null}]}};
 f.enabled=true;f.state={organization_id:org,head:"a".repeat(64),documents:{[id]:purchase},balances:[],entitlements:{},requests:{},reservations:{}};f.execute.mockResolvedValue(null);
 render(<MemoryRouter initialEntries={[`/?organization=${org}`]}><CommerceDocumentsWorkspace kind="purchase_order" documentId={id}/></MemoryRouter>);
 fireEvent.click(screen.getByRole("button",{name:"Receive stock"}));
 fireEvent.mouseDown(await screen.findByRole("combobox",{name:/Location 1/}));fireEvent.click(await screen.findByRole("option",{name:/Main yard/}));
 fireEvent.change(screen.getByLabelText(/Workflow reason/),{target:{value:"Goods arrived"}});
 fireEvent.click(screen.getByRole("button",{name:"Post receipt"}));await waitFor(()=>expect(f.execute).toHaveBeenCalledTimes(1));
 expect(f.execute.mock.calls[0][0]).toMatchObject({action:"receive_purchase_order",reason:"Goods arrived",document_id:id,lines:[{line_id:line,location_id:"77777777-7777-4777-8777-777777777777",quantity:1}]});
});
