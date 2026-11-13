import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { cleanup,fireEvent,render,screen,waitFor } from "@testing-library/react";
import { Refine,type DataProvider } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import { MemoryRouter,Routes,Route } from "react-router";
import { afterEach,beforeEach,describe,expect,it,vi } from "vitest";
import { ErpModulePage } from "./index";
vi.mock("jsbarcode",()=>({default:vi.fn()}));
const f=vi.hoisted(()=>({resource:"product_locations",verified:true,functionAllowed:true}));
const row={id:"11111111-1111-4111-8111-111111111111",organization_id:"22222222-2222-4222-8222-222222222222",warehouse_id:null,name:"Original name",code:"LOC-1",description:"",capacity:0,is_active:true,is_default:false,priority:0,country:"CA",currency:"INR",timezone:"UTC"};
vi.mock("../../services/erp",async original=>{
 const actual=await original<typeof import("../../services/erp")>();
 return {...actual,initialValues:(fields:Parameters<typeof actual.initialValues>[0],record?:Record<string,unknown>)=>actual.initialValues(fields,record??row),getErpResource:(name:string)=>{
  const resource=actual.getErpResource(name);
  return resource&&["product_locations","warehouses"].includes(resource.name)?{...resource,liveVerified:true,writeAuthorizationVerified:f.verified,verifiedWriteActions:["create","update"],verifiedCommand:"hmg-contact-master-v1"}:resource;
 }};
});
const custom=vi.fn(),create=vi.fn(),update=vi.fn(),getOne=vi.fn();
const can=vi.fn(async (request:{resource?:string;action?:string})=>({can:f.functionAllowed&&request.resource==="function:hmg-contact-master-v1"&&request.action==="execute"}));
const provider={getApiUrl:()=>"https://example.invalid",getList:vi.fn(async()=>({data:[],total:0})),getMany:vi.fn(async()=>({data:[{id:row.organization_id,name:"HMG Studio"}]})),getOne,create,update,deleteOne:vi.fn(),custom} as unknown as DataProvider;
let cache:ReturnType<typeof createCache>;
function mount(action:"create"|"edit"|"show"){
 const moduleKey=f.resource==="warehouses"?"warehouses":"locations";const path=`/${moduleKey}`;
 return render(<CacheProvider value={cache}><MemoryRouter initialEntries={[action==="create"?`${path}/create`:`${path}/${action}/${row.id}`]}><Refine routerProvider={routerProvider} dataProvider={{default:provider,app:provider}} accessControlProvider={{can}} notificationProvider={()=>({open:vi.fn(),close:vi.fn()})} options={{disableTelemetry:true}} resources={[{name:f.resource,list:path,create:`${path}/create`,edit:`${path}/edit/:id`,show:`${path}/show/:id`}]}><Routes><Route path={`${path}/create`} element={<ErpModulePage moduleKey={moduleKey} action="create"/>}/><Route path={`${path}/edit/:id`} element={<ErpModulePage moduleKey={moduleKey} action="edit"/>}/><Route path={`${path}/show/:id`} element={action==="show"?<ErpModulePage moduleKey={moduleKey} action="show"/>:<h1>Verified metadata record</h1>}/></Routes></Refine></MemoryRouter></CacheProvider>);
}
beforeEach(()=>{cache=createCache({key:"metadata-test"});f.verified=true;f.functionAllowed=true;can.mockClear();getOne.mockReset();getOne.mockResolvedValue({data:row});custom.mockReset();create.mockReset();update.mockReset();window.matchMedia=vi.fn().mockImplementation(()=>({matches:false,addListener:vi.fn(),removeListener:vi.fn(),addEventListener:vi.fn(),removeEventListener:vi.fn()}));custom.mockImplementation(async({payload})=>({data:{ok:true,verified:true,record:{...row,...payload.values,id:payload.request_id,organization_id:payload.organization_id}}}));});
afterEach(()=>{cleanup();cache.sheet.flush();});
describe("private location and warehouse metadata command integration",()=>{
 it.each([ ["product_locations","create"],["product_locations","edit"],["warehouses","create"],["warehouses","edit"] ] as const)("saves %s %s through the verified command without direct table writes",async(resource,action)=>{
  f.resource=resource;mount(action);fireEvent.change(await screen.findByDisplayValue("Original name"),{target:{value:"Verified metadata"}});fireEvent.click(screen.getByRole("button",{name:"Save record"}));
  await screen.findByRole("heading",{name:"Verified metadata record"});expect(custom).toHaveBeenCalledTimes(1);
  const request=custom.mock.calls[0][0];expect(request.url).toBe("hmg-contact-master-v1");expect(request.payload).toMatchObject({resource,action:action==="edit"?"update":"create",organization_id:row.organization_id,values:{name:"Verified metadata"}});
  expect(request.payload.request_id).toMatch(/^[0-9a-f-]{36}$/i);for(const name of ["organization_id","is_default","stock","quantity","deleted_at"])expect(request.payload.values).not.toHaveProperty(name);
  expect(create).not.toHaveBeenCalled();expect(update).not.toHaveBeenCalled();
  expect(can).toHaveBeenCalledWith(expect.objectContaining({resource:"function:hmg-contact-master-v1",action:"execute",params:expect.objectContaining({organization_id:row.organization_id,metadata_resource:resource,action:action==="edit"?"update":"create",name:"Verified metadata"})}));
  expect(can.mock.calls.some(([request])=>request.resource?.startsWith("datatable:"))).toBe(false);
 });
 it("retains a timed-out warehouse create and only sends readback with the same identity",async()=>{
  f.resource="warehouses";let sent:Record<string,any>|undefined;custom.mockImplementation(async({payload})=>{if(payload.action!=="readback"){sent=payload;throw new Error("lost reply");}return {data:{ok:true,verified:true,record:{...row,...sent!.values,id:sent!.request_id,organization_id:sent!.organization_id}}};});
  mount("create");fireEvent.change(await screen.findByDisplayValue("Original name"),{target:{value:"Verified metadata"}});fireEvent.click(screen.getByRole("button",{name:"Save record"}));fireEvent.click(await screen.findByRole("button",{name:"Check saved record"}));
  await screen.findByRole("heading",{name:"Verified metadata record"});expect(custom).toHaveBeenCalledTimes(2);expect(custom.mock.calls[1][0].payload).toEqual({resource:"warehouses",action:"readback",organization_id:row.organization_id,request_id:sent!.request_id});expect(create).not.toHaveBeenCalled();
 });
 it("checks scoped function execution before showing metadata Edit",async()=>{
  f.resource="product_locations";let resolve!:(value:unknown)=>void;getOne.mockReturnValueOnce(new Promise(done=>{resolve=done;}));mount("show");
  expect(can).not.toHaveBeenCalled();resolve({data:row});
  expect(await screen.findByRole("link",{name:"Edit"})).toBeTruthy();
  expect(can).toHaveBeenCalledWith(expect.objectContaining({resource:"function:hmg-contact-master-v1",action:"execute",params:expect.objectContaining({organization_id:row.organization_id,metadata_resource:"product_locations",action:"update",id:row.id})}));
  expect(can.mock.calls.some(([request])=>request.resource?.startsWith("datatable:"))).toBe(false);
 });
 it("does not call the metadata command when function execution is denied",async()=>{
  f.resource="warehouses";f.functionAllowed=false;mount("create");fireEvent.change(await screen.findByDisplayValue("Original name"),{target:{value:"Denied metadata"}});fireEvent.click(screen.getByRole("button",{name:"Save record"}));
  expect(await screen.findByText(/You do not have permission to save/)).toBeTruthy();expect(custom).not.toHaveBeenCalled();expect(create).not.toHaveBeenCalled();
  expect(can).toHaveBeenCalledWith(expect.objectContaining({resource:"function:hmg-contact-master-v1",action:"execute"}));
 });
 it("keeps saving blocked before live authorization verification",async()=>{
  f.resource="product_locations";f.verified=false;mount("create");expect((await screen.findByRole("button",{name:"Save record"})).hasAttribute("disabled")).toBe(true);expect(custom).not.toHaveBeenCalled();expect(create).not.toHaveBeenCalled();
 });
});
