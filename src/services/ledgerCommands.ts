/** Shared immutable legacy stock-command validator; native boundary adds UUID scope checks. */
export type LedgerCommand = {request_id:string;action:'submit';kind:'movement'|'adjustment'|'return';lines:Record<string,unknown>[];reason:string} | {request_id:string;action:'approve'|'reject'|'reverse';target_request_id:string;reason:string};
const record = (v:unknown):v is Record<string,unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const id = (v:unknown):v is string => typeof v === 'string' && !!v.trim() && v.trim()===v && v.length<=200;
const quantity = (v:unknown):v is number => typeof v === 'number' && Number.isInteger(v) && v>=0 && v<=2147483647;
export function parsePendingCommand(value:unknown):LedgerCommand|null {
 if(!record(value)||!id(value.request_id)||typeof value.reason!=='string'||!value.reason.trim()||value.reason.length>2000)return null;
 const exact=(v:Record<string,unknown>,keys:string[])=>Object.keys(v).sort().join('|')===keys.sort().join('|');
 if(['approve','reject','reverse'].includes(String(value.action))){
  if(!exact(value,['request_id','action','target_request_id','reason'])||!id(value.target_request_id))return null;
 }else if(value.action==='submit'){
  if(!exact(value,['request_id','action','kind','lines','reason'])||!Array.isArray(value.lines)||!value.lines.length||value.lines.length>1000)return null;
  for(const l of value.lines){
   if(!record(l)||!id(l.product_id))return null;
   if(value.kind==='movement'){
    if(!exact(l,['product_id','source','destination','quantity'])||!id(l.source)||!id(l.destination)||l.source===l.destination||!quantity(l.quantity)||l.quantity===0)return null;
   }else if(value.kind==='adjustment'){
    if(!exact(l,['product_id','location_id','delta'])||!id(l.location_id)||typeof l.delta!=='number'||!Number.isInteger(l.delta)||!l.delta||Math.abs(l.delta)>2147483647)return null;
   }else if(value.kind==='return'){
    if(!exact(l,['order_item_id','product_id','location_id','condition','quantity','restock'])||!id(l.order_item_id)||!id(l.location_id)||!['new','used','damaged'].includes(String(l.condition))||!quantity(l.quantity)||!l.quantity||typeof l.restock!=='boolean'||(l.condition==='damaged'&&l.restock))return null;
   }else return null;
  }
 }else return null;
 const command=structuredClone(value) as LedgerCommand;
 if('lines' in command){command.lines.forEach(Object.freeze);Object.freeze(command.lines);}
 return Object.freeze(command);
}
