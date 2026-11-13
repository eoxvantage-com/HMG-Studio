import { cleanup, render, screen } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import { act, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Home } from "./index";
import { MemoryRouter } from "react-router";
const rate = vi.hoisted(() => vi.fn());
vi.mock("../../services/dashboardCurrency", () => ({ getDashboardRate: rate }));
const custom=vi.fn();
const summary={ok:true,currency:"INR",dataset:"all",unclassified_organizations:0,generated_at:"2026-11-06T09:00:00Z",product_count:8,category_count:5,location_count:3,inventory_value:"2345000.00",pending_orders:3,order_count:3,revenue_month:"0.00",receivables:"235000.00",stock_by_category:[{name:"Marble",value:"2345000.00"}],low_stock:[],low_stock_count:0,recent_orders:[],recent_products:[]};
const provider={custom,getApiUrl:()=>"https://qa.invalid"} as unknown as DataProvider;
function mount(){return render(<Refine dataProvider={{default:provider,app:provider}} notificationProvider={()=>({open:vi.fn(),close:vi.fn()})} options={{disableTelemetry:true}}><MemoryRouter><Home/></MemoryRouter></Refine>);}
describe("live ERP dashboard",()=>{
 beforeEach(()=>{custom.mockResolvedValue({data:summary});rate.mockResolvedValue({date:"2026-11-06",base:"INR",quote:"USD",rate:0.01});});
 afterEach(cleanup);
 it("renders the server projection and reference panels without hardcoded screenshot numbers",async()=>{
  mount();await screen.findByText("8");
  expect(screen.getByText("Stock Value by Category")).toBeTruthy();
  expect(screen.getByText("Financial watch")).toBeTruthy();
  expect(screen.getByText("Recent Orders")).toBeTruthy();
  expect(screen.getByRole("link",{name:"View inventory"}).getAttribute("href")).toBe("/inventory");
  expect(custom.mock.calls[0][0]).toMatchObject({url:"hmg-dashboard-v1",method:"post",meta:{kind:"function",async:false}});
  expect(screen.queryByText("$15B")).toBeNull();
  expect(screen.getByRole("link",{name:/Total Products: 8/}).getAttribute("href")).toBe("/inventory");
  expect(screen.getByRole("heading",{name:"Recent Orders",level:2})).toBeTruthy();
  expect(screen.getByRole("progressbar",{name:"Marble share of stock value"})).toBeTruthy();
  expect(screen.getByText("No recent products in the INR ledger yet.")).toBeTruthy();
  expect(rate).not.toHaveBeenCalled();
 });
 it("shows ledger fulfillment value and unknown receivables without fabricating cash",async()=>{
  custom.mockResolvedValue({data:{...summary,receivables:null,receivables_reason:"Ledger payments are not recorded.",sales_basis:"fulfilled_order_value"}});
  mount();await screen.findByText("Fulfilled Order Value");
  expect(screen.getByText("Not available")).toBeTruthy();
  expect(screen.getByText("Ledger payments are not recorded.")).toBeTruthy();
 });
 it("shows all-time fulfilled value with this month as context, not a single month's total",async()=>{
  custom.mockResolvedValue({data:{...summary,sales_basis:"fulfilled_order_value",fulfilled_value:"556776.00",fulfilled_count:4,revenue_month:"44.00",open_orders:6,recent_orders:[{id:"o1",organization_id:"org-1",order_number:"SO-e63735b3-83f0-5443-87d6-f880fc789fc4",customer_name:"Meridian",status:"pending",order_date:"2026-11-11",total:"48256.00",currency:"INR"}]}});
  mount();
  const tile=await screen.findByRole("link",{name:/Fulfilled Order Value: ₹5\.6L\. 4 orders, all time · ₹44 this month/});
  expect(tile.getAttribute("href")).toBe("/orders");
  expect(screen.getByRole("link",{name:/Open orders: 6/})).toBeTruthy();
  expect(screen.getByText("SO-FC789FC4")).toBeTruthy();
  expect(screen.getByRole("link",{name:"SO-e63735b3-83f0-5443-87d6-f880fc789fc4"}).getAttribute("href")).toBe("/orders/show/o1?organization=org-1");
 });
 it("never substitutes zero on denied or failed source queries",async()=>{
  custom.mockResolvedValue({data:{ok:false,code:"DATA_UNAVAILABLE"}});
  mount();await screen.findByText("Dashboard data unavailable");
  expect(screen.queryByText("8")).toBeNull();
  expect(screen.queryByText("All products are well stocked")).toBeNull();
 });
 it("always reads the single HMG Stones workspace without a dataset selector",async()=>{
  custom.mockResolvedValue({data:summary});
  mount();await screen.findByText("8");
  expect(screen.queryByRole("combobox",{name:"Dashboard data"})).toBeNull();
  expect(screen.queryByText(/QA data only/)).toBeNull();
  expect(custom.mock.calls.every(([request])=>(request.payload??request.config?.payload)?.dataset==="all")).toBe(true);
 });
 it("renders verified analytics panels and rejects malformed extra metrics",async()=>{
  custom.mockResolvedValue({data:{...summary,order_pipeline:[{status:"pending",count:3,value:"120.00"}],monthly_sales:[{month:"2026-11",count:2,revenue:"100.00"}],catalogue_quality:{total:10,inactive:2,missing_selling_price:1,missing_image:3}}});
  mount();await screen.findByText("Order pipeline");
  expect(screen.getByText("Monthly shipped / delivered sales")).toBeTruthy();
  expect(screen.getByText("Catalogue readiness")).toBeTruthy();
  cleanup();custom.mockResolvedValue({data:{...summary,order_pipeline:[{status:"pending",count:-1,value:"120.00"}]}});
  mount();await screen.findByText("Dashboard data unavailable");
 });
 it.each([["0.20","100"],["0.00","0"]])("scales monthly revenue %s against its actual peak",async(revenue,percentage)=>{
  custom.mockResolvedValue({data:{...summary,monthly_sales:[{month:"2026-11",count:1,revenue}]}});
  mount();const bar=await screen.findByRole("progressbar",{name:"2026-11 shipped sales relative to peak month"});
  expect(bar.getAttribute("aria-valuenow")).toBe(percentage);
 });
 it.each([
  {low_stock:undefined}, {recent_products:null}, {generated_at:"invalid"},
  {product_count:-1}, {inventory_value:"NaN"}, {currency:"USD"},
  {dataset:["production"]}, {dataset:{}}, {dataset:undefined}, {unclassified_organizations:-1},
  {recent_orders:[{id:"o",order_number:"1",customer_name:"Test",status:"pending",order_date:"bad-date",total:"1.00",currency:"INR"}]},
 ])("rejects malformed projections without crashing (%j)",async patch=>{
  custom.mockResolvedValue({data:{...summary,...patch}});
  mount();await screen.findByText("Dashboard data unavailable");
  expect(screen.queryByText("All products are well stocked")).toBeNull();
 });
 it("does not claim healthy stock when there are no products",async()=>{
  custom.mockResolvedValue({data:{...summary,product_count:0,inventory_value:"0.00",stock_by_category:[]}});
  mount();await screen.findByText("No products in the INR ledger yet");
  expect(screen.queryByText("All products are well stocked")).toBeNull();
 });
 async function choose(currency:string){fireEvent.mouseDown(screen.getByRole("combobox",{name:"Display currency"}));fireEvent.click(await screen.findByRole("option",{name:currency}));}
 it("converts display amounts without changing the INR request, counts or record rows",async()=>{
  custom.mockResolvedValue({data:{...summary,recent_orders:[{id:"order-1",order_number:"SO-1",customer_name:"Buyer",status:"pending",order_date:"2026-11-06",total:"100.00",currency:"INR"}]}});
  mount();await screen.findByText("8");await choose("USD");
  expect(await screen.findByText("$1.00")).toBeTruthy();
  expect(screen.getByText("SO-1")).toBeTruthy();expect(screen.getByText("8")).toBeTruthy();
  expect(custom).toHaveBeenCalledTimes(1);
  expect(custom.mock.calls[0][0].payload ?? custom.mock.calls[0][0].config?.payload).toEqual({currency:"INR",dataset:"all"});
  expect(screen.getByText(/2026-11-06.*Indicative/i)).toBeTruthy();
  expect(screen.getByRole("link",{name:/Frankfurter/}).getAttribute("href")).toBe("https://frankfurter.dev/");
 });
 it("keeps counts and rows but never relabels INR amounts during FX failure, and permits retry",async()=>{
  rate.mockRejectedValueOnce(new Error("offline"));
  mount();await screen.findByText("8");await choose("USD");
  expect(await screen.findByText(/USD reference rate unavailable/)).toBeTruthy();
  expect(screen.getByText("8")).toBeTruthy();expect(screen.getAllByText("Amount unavailable").length).toBeGreaterThan(0);
  expect(screen.queryByText("$2,345,000.00")).toBeNull();
  fireEvent.click(screen.getByRole("button",{name:"Retry rate"}));
  await waitFor(()=>expect(rate).toHaveBeenCalledTimes(2));
  await screen.findByText(/2026-11-06.*Indicative/i);expect(custom).toHaveBeenCalledTimes(1);
 });
 it("ignores a late prior-currency response and aborts on selection changes and unmount",async()=>{
  let resolveUsd!: (value:unknown)=>void;
  rate.mockImplementationOnce(()=>new Promise(resolve=>{resolveUsd=resolve;})).mockResolvedValueOnce({date:"2026-11-06",base:"INR",quote:"EUR",rate:0.02});
  const view=mount();await screen.findByText("8");await choose("USD");
  expect(screen.getAllByText("Amount unavailable").length).toBeGreaterThan(0);
  const firstSignal=rate.mock.calls[0][1] as AbortSignal;
  await choose("EUR");expect(firstSignal.aborted).toBe(true);
  await screen.findByText(/2026-11-06.*Indicative/i);
  await act(async()=>resolveUsd({date:"2026-11-06",base:"INR",quote:"USD",rate:10}));
  expect(screen.getByRole("combobox",{name:"Display currency"}).textContent).toContain("EUR");
  expect(screen.getAllByText(/€46,900.00/).length).toBeGreaterThan(0);
  const lastSignal=rate.mock.calls.at(-1)?.[1] as AbortSignal;view.unmount();expect(lastSignal.aborted).toBe(true);
 });
});
