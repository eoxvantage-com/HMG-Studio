import { cleanup, render, screen } from "@testing-library/react";
import { Refine, type DataProvider } from "@refinedev/core";
import { act, fireEvent, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Home } from "./index";
const rate = vi.hoisted(() => vi.fn());
vi.mock("../../services/dashboardCurrency", () => ({ getDashboardRate: rate }));
const custom=vi.fn();
const summary={ok:true,currency:"INR",generated_at:"2026-11-06T09:00:00Z",product_count:8,category_count:5,location_count:3,inventory_value:"2345000.00",pending_orders:3,order_count:3,revenue_month:"0.00",receivables:"235000.00",stock_by_category:[{name:"Marble",value:"2345000.00"}],low_stock:[],low_stock_count:0,recent_orders:[],recent_products:[]};
const provider={custom,getApiUrl:()=>"https://qa.invalid"} as unknown as DataProvider;
function mount(){return render(<Refine dataProvider={{default:provider,app:provider}} notificationProvider={()=>({open:vi.fn(),close:vi.fn()})} options={{disableTelemetry:true}}><Home/></Refine>);}
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
 it("never substitutes zero on denied or failed source queries",async()=>{
  custom.mockResolvedValue({data:{ok:false,code:"DATA_UNAVAILABLE"}});
  mount();await screen.findByText("Dashboard data unavailable");
  expect(screen.queryByText("8")).toBeNull();
  expect(screen.queryByText("All products are well stocked")).toBeNull();
 });
 it.each([
  {low_stock:undefined}, {recent_products:null}, {generated_at:"invalid"},
  {product_count:-1}, {inventory_value:"NaN"}, {currency:"USD"},
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
  expect(custom.mock.calls[0][0].payload ?? custom.mock.calls[0][0].config?.payload).toEqual({currency:"INR"});
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
