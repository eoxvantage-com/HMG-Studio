import { describe, expect, it } from 'vitest';
import { parseLedger, makeReturnLine, createPendingCommand } from './stockLedger';
const state = { organization_id: 'org', sequence: 0, head: 'a'.repeat(64), balances: [{product_id:'p',location_id:'l',quantity:5,reserved:1}], entitlements:{},requests:{},reservations:{} };
describe('QA ledger contract', () => {
 it('rejects wrong organization, malformed balances and unknown success', () => {
  expect(parseLedger({ok:true,code:'STATE',state},'org')?.state).toEqual(state);
  expect(parseLedger({ok:true,code:'STATE',state},'other')).toBeNull();
  expect(parseLedger({ok:true,code:'STATE',state:{...state,balances:[{product_id:'p',location_id:'l',quantity:1,reserved:2}]}},'org')).toBeNull();
  expect(parseLedger({ok:true,code:'SURPRISE',state},'org')).toBeNull();
 });
 it('preserves the exact command for repeated retries', () => {
  const pending = createPendingCommand({action:'approve',target_request_id:'t',reason:'Checked'});
  expect(pending.request_id).toMatch(/^[a-f0-9-]{36}$/);
  expect(Object.isFrozen(pending)).toBe(true);
  expect(JSON.stringify(pending)).toEqual(JSON.stringify(pending));
 });
 it('non-restock returns preserve the verified snapshot', () => {
  const e = {order_item_id:'i',product_id:'p',location_id:'l',quantity:4,returned:1,condition:'damaged' as const};
  expect(makeReturnLine(e,2,false)).toEqual({order_item_id:'i',product_id:'p',location_id:'l',condition:'damaged',quantity:2,restock:false});
  expect(()=>makeReturnLine(e,2,true)).toThrow();
  expect(()=>makeReturnLine(e,4,false)).toThrow();
 });
});

