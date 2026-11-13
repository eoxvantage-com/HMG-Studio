import {parsePendingCommand,type LedgerCommand} from "./ledgerCommands";
export {parsePendingCommand,type LedgerCommand} from "./ledgerCommands";
/** Ledger function boundaries. Legacy QA projection remains for compatibility; commerce is scoped separately. */
export const QA_LEDGER_ORGANIZATION = '5d61a85e-d8e4-5a2a-a861-0c1dabe2a352';
export const LEDGER_FUNCTION = 'hmg-stock-ledger-v1';
export * from './commerceLedger';
export type Entitlement = {order_item_id:string;product_id:string;location_id:string;condition:'new'|'used'|'damaged';quantity:number;returned:number};
export type LedgerState = {organization_id:string;sequence:number;head:string;balances:{product_id:string;location_id:string;quantity:number;reserved:number}[];entitlements:Record<string,Entitlement>;requests:Record<string,{status:'pending'|'posted'|'rejected'|'reversed';command:LedgerCommand}>;reservations:Record<string,Record<string,number>>};
export type LedgerResponse = {ok:true;code:string;state:LedgerState;committed?:boolean;replay?:boolean;request_id?:string|null};
const record = (v:unknown):v is Record<string,unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v:unknown):v is string => typeof v === 'string' && !!v.trim() && v.trim()===v && v.length<=200;
const quantity = (v:unknown):v is number => typeof v === 'number' && Number.isInteger(v) && v>=0 && v<=2147483647;
export function parseLedger(value:unknown, organization:string):LedgerResponse|null {
 if (!record(value) || value.ok!==true || !['STATE','COMMITTED'].includes(String(value.code)) || !record(value.state)) return null;
 const s=value.state;
 if(s.organization_id!==organization || !quantity(s.sequence) || typeof s.head!=='string' || !/^[a-f0-9]{64}$/.test(s.head))return null;
 if(!Array.isArray(s.balances)||!s.balances.every(b=>record(b)&&id(b.product_id)&&id(b.location_id)&&quantity(b.quantity)&&quantity(b.reserved)&&b.reserved<=b.quantity))return null;
 if(new Set(s.balances.map(b=>JSON.stringify([b.product_id,b.location_id]))).size!==s.balances.length)return null;
 if(!record(s.entitlements)||!Object.entries(s.entitlements).every(([k,e])=>record(e)&&e.order_item_id===k&&id(k)&&id(e.product_id)&&id(e.location_id)&&['new','used','damaged'].includes(String(e.condition))&&quantity(e.quantity)&&quantity(e.returned)&&e.returned<=e.quantity))return null;
 if(!record(s.requests)||!Object.entries(s.requests).every(([k,r])=>id(k)&&record(r)&&['pending','posted','rejected','reversed'].includes(String(r.status))&&record(r.command)&&r.command.request_id===k&&['submit','direct'].includes(String(r.command.action))&&['movement','adjustment','return'].includes(String(r.command.kind))&&Array.isArray(r.command.lines)&&typeof r.command.reason==='string'))return null;
 if(!record(s.reservations)||!Object.values(s.reservations).every(r=>record(r)&&Object.values(r).every(quantity)))return null;
 if(value.committed!==undefined&&typeof value.committed!=='boolean'||value.replay!==undefined&&typeof value.replay!=='boolean'||value.request_id!=null&&!id(value.request_id))return null;
 return value as LedgerResponse;
}
export function makeReturnLine(e:Entitlement, amount:number, restock:boolean):Record<string,unknown>{
 if(!quantity(amount)||!amount||amount>e.quantity-e.returned||(e.condition==='damaged'&&restock))throw new Error('Check return quantity and restock condition.');
 return {order_item_id:e.order_item_id,product_id:e.product_id,location_id:e.location_id,condition:e.condition,quantity:amount,restock};
}
type NewCommand = Omit<Extract<LedgerCommand,{action:'submit'}>,'request_id'> | Omit<Extract<LedgerCommand,{action:'approve'|'reject'|'reverse'}>,'request_id'>;
export function createPendingCommand(input:NewCommand):LedgerCommand {
 const result=structuredClone({...input,request_id:crypto.randomUUID()}) as LedgerCommand;
 if('lines' in result){result.lines.forEach(Object.freeze);Object.freeze(result.lines);}
 return Object.freeze(result);
}

/** Only correlated adapter terminal responses release the exact retained request.
 * Unknown/denied/unavailable outcomes may follow a previous committed attempt.
 */
/** Codes the ledger returns before anything is written, so a corrected request is safe to send. */
export const PRE_WRITE_REJECTIONS = ['COMMAND_REJECTED','VALIDATION_ERROR','REQUEST_CONFLICT','REFERENCE_FORBIDDEN','VARIANT_UNSUPPORTED','TRACKING_UNSUPPORTED','HISTORY_CAPACITY_REACHED','OUTPUT_CAPACITY_REACHED'];
export function isDefinitiveLedgerRejection(value:unknown, requestId:string):boolean {
 return record(value) && value.ok===false && value.committed===false && value.replay===false
  && value.state===null && value.request_id===requestId
  && PRE_WRITE_REJECTIONS.includes(String(value.code));
}
