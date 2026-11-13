import { expect, it, vi } from "vitest";
import { readInventoryAuthority } from "./inventory";
const org="11111111-1111-4111-8111-111111111111";
const state={ok:true,code:"STATE",capabilities:["commerce_v2"],state:{organization_id:org,sequence:0,head:"a".repeat(64),balances:[],documents:{},entitlements:{},requests:{},reservations:{}}};
it("reads only the exact caller org then activated ledger",async()=>{
 const organizations=vi.fn().mockResolvedValue([{id:org,is_active:true,deleted_at:null,settings:{stock_authority:"ledger_v2"}}]);
 const ledger=vi.fn().mockResolvedValue(state);
 expect((await readInventoryAuthority([org],organizations,ledger))[org]).toMatchObject({kind:"ledger",balances:[]});
 expect(organizations).toHaveBeenCalledWith([org]);expect(ledger).toHaveBeenCalledWith(org);
});
it("rejects missing, foreign, frozen or inaccessible organizations before ledger",async()=>{
 const ledger=vi.fn();
 for(const rows of [[],[{id:"foreign",settings:{}}],[{id:org,is_active:true,deleted_at:null,settings:{stock_authority:"freeze"}}]]){
  expect((await readInventoryAuthority([org],async()=>rows,ledger))[org]).toMatchObject({kind:"unavailable"});
 }
 expect(ledger).not.toHaveBeenCalled();
});
it("never falls back when activated projection scope or capability is wrong",async()=>{
 const organizations=async()=>[{id:org,is_active:true,deleted_at:null,settings:{stock_authority:"ledger_v2"}}];
 for(const reply of [{...state,capabilities:[]},{...state,state:{...state.state,organization_id:"foreign"}},null]){
  expect((await readInventoryAuthority([org],organizations,async()=>reply))[org]).toMatchObject({kind:"unavailable"});
 }
});
it("preserves legacy only after explicit readable organization",async()=>{
 const ledger=vi.fn();
 expect((await readInventoryAuthority([org],async()=>[{id:org,is_active:true,deleted_at:null,settings:{}}],ledger))[org]).toMatchObject({kind:"legacy"});
 expect(ledger).not.toHaveBeenCalled();
});
