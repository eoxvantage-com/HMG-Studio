import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { useInventoryAuthority } from "./useInventoryAuthority";
const mocks=vi.hoisted(()=>({owner:"11111111-1111-4111-8111-111111111111",getList:vi.fn(),custom:vi.fn()}));
vi.mock("@refinedev/core",()=>({useGetIdentity:()=>({data:{id:mocks.owner},isLoading:false,isFetching:false,isError:false}),useDataProvider:()=> (name?:string)=>name==="app"?{custom:mocks.custom}:{getList:mocks.getList}}));
const org="22222222-2222-4222-8222-222222222222";
const reply={ok:true,code:"STATE",capabilities:["commerce_v2"],state:{organization_id:org,sequence:0,head:"a".repeat(64),balances:[],documents:{},entitlements:{},requests:{},reservations:{}}};
beforeEach(()=>{mocks.owner="11111111-1111-4111-8111-111111111111";mocks.getList.mockReset();mocks.custom.mockReset();mocks.getList.mockResolvedValue({data:[{id:org,is_active:true,deleted_at:null,settings:{stock_authority:"ledger_v2"}}]});mocks.custom.mockResolvedValue({data:reply});});
it("reads the caller-scoped function without command or stock writes",async()=>{
 const {result}=renderHook(()=>useInventoryAuthority([org]));
 await waitFor(()=>expect(result.current.authorities[org]?.kind).toBe("ledger"));
 expect(mocks.custom).toHaveBeenCalledWith({url:"hmg-stock-ledger-v1",method:"post",payload:{action:"state",organization_id:org},meta:{kind:"function",async:false}});
});
it("removes old identity projection immediately and ignores late results",async()=>{
 let resolve!:(v:unknown)=>void;
 mocks.custom.mockImplementationOnce(()=>new Promise(r=>resolve=r));
 const {result,rerender}=renderHook(()=>useInventoryAuthority([org]));
 await waitFor(()=>expect(mocks.custom).toHaveBeenCalledTimes(1));
 mocks.owner="";rerender();
 expect(result.current.authorities).toEqual({});
 await act(async()=>{resolve({data:reply});await Promise.resolve();});
 expect(result.current.authorities).toEqual({});
});
it("refresh masks old quantities before fetching and failed refresh stays unavailable",async()=>{
 const {result}=renderHook(()=>useInventoryAuthority([org]));
 await waitFor(()=>expect(result.current.authorities[org]?.kind).toBe("ledger"));
 mocks.custom.mockRejectedValue(new Error("403"));
 act(()=>result.current.refresh());
 expect(result.current.authorities).toEqual({});
 await waitFor(()=>expect(result.current.authorities[org]?.kind).toBe("unavailable"));
});
