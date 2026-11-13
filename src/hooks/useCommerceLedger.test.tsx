import {act,cleanup,renderHook,waitFor} from "@testing-library/react";
import {afterEach,expect,it,vi} from "vitest";
import {useCommerceLedger} from "./useCommerceLedger";
const fixture=vi.hoisted(()=>({api:vi.fn(),open:vi.fn()}));
vi.mock("@refinedev/core",()=>({useGetIdentity:()=>({data:{id:"11111111-1111-4111-8111-111111111111"},isLoading:false,isFetching:false,isError:false}),useCustomMutation:()=>({mutateAsync:fixture.api}),useNotification:()=>({open:fixture.open})}));
const org="22222222-2222-4222-8222-222222222222";
const state={organization_id:org,sequence:0,head:"a".repeat(64),documents:{},balances:[],reservations:{},entitlements:{},requests:{}};
afterEach(()=>{cleanup();sessionStorage.clear();vi.clearAllMocks();});
it("does not permit a command before native capability verification",async()=>{
 fixture.api.mockImplementation(()=>new Promise(()=>{}));
 const {result}=renderHook(()=>useCommerceLedger(org,true));
 await act(async()=>{await result.current.execute({request_id:"33333333-3333-4333-8333-333333333333",action:"approve_return",reason:"Review",target_request_id:"44444444-4444-4444-8444-444444444444"});});
 expect(fixture.api).toHaveBeenCalledTimes(1);
 expect(result.current.enabled).toBe(false);
});
it("keeps an unconfirmed command immutable across retry",async()=>{
 fixture.api.mockResolvedValueOnce({data:{ok:true,code:"STATE",state,capabilities:["commerce_v2"]}}).mockRejectedValue(new Error("lost reply"));
 const {result}=renderHook(()=>useCommerceLedger(org,true));
 await waitFor(()=>expect(result.current.enabled).toBe(true));
 const command={request_id:"33333333-3333-4333-8333-333333333333",action:"approve_return",reason:"Review",target_request_id:"44444444-4444-4444-8444-444444444444"};
 await act(async()=>{await result.current.execute(command);});
 expect(result.current.pending).toEqual(command);
 await act(async()=>{await result.current.execute({...command,reason:"Changed"});});
 expect(fixture.api).toHaveBeenCalledTimes(2);
 expect(result.current.pending).toEqual(command);
});
it("explains a definitive rejection and reloads the workflow instead of locking it",async()=>{
 const command={request_id:"33333333-3333-4333-8333-333333333333",action:"approve_return",reason:"Review",target_request_id:"44444444-4444-4444-8444-444444444444"};
 fixture.api.mockResolvedValueOnce({data:{ok:true,code:"STATE",state,capabilities:["commerce_v2"]}})
  .mockResolvedValueOnce({data:{ok:false,code:"COMMAND_REJECTED",state:null,committed:false,replay:false,request_id:command.request_id,detail:"Insufficient available stock"}})
  .mockResolvedValueOnce({data:{ok:true,code:"STATE",state:{...state,sequence:1,head:"b".repeat(64)},capabilities:["commerce_v2"]}});
 const {result}=renderHook(()=>useCommerceLedger(org,true));
 await waitFor(()=>expect(result.current.enabled).toBe(true));
 let outcome:unknown="unset";
 await act(async()=>{outcome=await result.current.execute(command);});
 expect(outcome).toBeNull();
 expect(fixture.api).toHaveBeenCalledTimes(3);expect(fixture.api.mock.calls[2][0].values.action).toBe("state");
 expect(fixture.open).toHaveBeenCalledWith(expect.objectContaining({type:"error",description:"Not saved",message:expect.stringMatching(/Not enough free stock/)}));
 expect(result.current.enabled).toBe(true);expect(result.current.pending).toBeNull();expect(result.current.state?.head).toBe("b".repeat(64));
 expect(sessionStorage.length).toBe(0);
});
it("does not expose the old state during a new organization render",async()=>{
 fixture.api.mockResolvedValueOnce({data:{ok:true,code:"STATE",state,capabilities:["commerce_v2"]}}).mockImplementation(()=>new Promise(()=>{}));
 const observed:Array<string|null>=[];
 const {result,rerender}=renderHook(({id})=>{const ledger=useCommerceLedger(id,true);observed.push(ledger.state?.organization_id ?? null);return ledger;},{initialProps:{id:org}});
 await waitFor(()=>expect(result.current.enabled).toBe(true)); observed.length=0;
 rerender({id:"55555555-5555-4555-8555-555555555555"});
 expect(observed).not.toContain(org);
});

it("does not let an old A finally clear a new A flight after A-B-A",async()=>{
 const resolves:Array<(value:unknown)=>void>=[];
 fixture.api.mockImplementation(()=>new Promise(resolve=>resolves.push(resolve)));
 const {result,rerender}=renderHook(({id})=>useCommerceLedger(id,true),{initialProps:{id:org}});
 await act(async()=>resolves[0]({data:{ok:true,code:"STATE",state,capabilities:["commerce_v2"]}}));
 await waitFor(()=>expect(result.current.enabled).toBe(true));
 let oldRefresh:Promise<unknown>;
 act(()=>{oldRefresh=result.current.refresh();});
 rerender({id:"55555555-5555-4555-8555-555555555555"});rerender({id:org});
 expect(result.current.enabled).toBe(false);
 await act(async()=>{resolves[1]({data:{ok:true,code:"STATE",state,capabilities:["commerce_v2"]}});await oldRefresh;});
 await act(async()=>{await result.current.refresh();});
 expect(fixture.api).toHaveBeenCalledTimes(4);
 await act(async()=>resolves[3]({data:{ok:true,code:"STATE",state,capabilities:["commerce_v2"]}}));
 expect(result.current.enabled).toBe(true);
});

it("reconciles an approved request replay whose stock was later reversed",async()=>{
 const target="44444444-4444-4444-8444-444444444444";
 const request={request_id:target,action:"submit",kind:"adjustment",reason:"Count correction",lines:[{product_id:"55555555-5555-4555-8555-555555555555",location_id:"66666666-6666-4666-8666-666666666666",delta:1}]};
 fixture.api.mockResolvedValueOnce({data:{ok:true,code:"STATE",state:{...state,requests:{[target]:{status:"pending",command:request}}},capabilities:["commerce_v2"]}}).mockRejectedValueOnce(new Error("lost reply")).mockResolvedValueOnce({data:{ok:true,code:"COMMITTED",committed:true,replay:true,request_id:"33333333-3333-4333-8333-333333333333",state:{...state,requests:{[target]:{status:"reversed",command:request}}},capabilities:["commerce_v2"]}});
 const {result}=renderHook(()=>useCommerceLedger(org,true));await waitFor(()=>expect(result.current.enabled).toBe(true));
 const command={request_id:"33333333-3333-4333-8333-333333333333",action:"approve",target_request_id:target,reason:"Reviewed"};
 await act(async()=>{await result.current.execute(command);});expect(result.current.pending).toEqual(command);
 await act(async()=>{await result.current.execute(command);});expect(result.current.pending).toBeNull();expect(result.current.state?.stock_requests[target].status).toBe("reversed");
});
