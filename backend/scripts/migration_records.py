"""Pure dependency planning and readback checks; no implicit site or writes."""
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
import re


def ordered_rows(schemas, records, native_ids=None):
    native_ids=native_ids or {}
    pending={};all_rows={}
    for table,rows in records.items():
        if table not in schemas:raise ValueError('Unknown schema: '+table)
        for row in rows:
            key=(table,row.get('id'))
            if not key[1] or key in pending:raise ValueError('Invalid or duplicate record ID')
            pending[key]=row
        all_rows[table]=rows
    dependencies={}
    for key,row in pending.items():
        dependencies[key]=set()
        for fk in schemas[key[0]].get('foreignKeys',[]):
            values=tuple(row.get(f) for f in fk['fields'])
            if any(v is None for v in values):continue
            target=fk['reference']['resource'];fields=fk['reference']['fields']
            if target in native_ids:
                if fields!=['id'] or len(values)!=1 or values[0] not in native_ids[target]:
                    raise ValueError('Unverified native identity: '+target)
                continue
            matches=[r for r in all_rows.get(target,[]) if tuple(r.get(f) for f in fields)==values]
            if len(matches)!=1:raise ValueError('Unresolved or ambiguous dependency: '+key[0]+' -> '+target)
            dependencies[key].add((target,matches[0]['id']))
    result=[];done=set()
    while pending:
        ready=[key for key in pending if dependencies[key]<=done]
        if not ready:raise ValueError('Cyclic record dependencies')
        for key in ready:
            result.append((key[0],pending.pop(key)));done.add(key)
    return result


def strict_equal(a,b):
    if type(a) is not type(b):return False
    if isinstance(a,dict):return a.keys()==b.keys() and all(strict_equal(v,b[k]) for k,v in a.items())
    if isinstance(a,list):return len(a)==len(b) and all(strict_equal(x,y) for x,y in zip(a,b))
    return a==b


def equivalent(expected, actual, schema):
    if not isinstance(actual,dict):return False
    types={f['name']:f['type'] for f in schema.get('fields',[])}
    for key,value in expected.items():
        if key not in actual:return False
        saved=actual[key]
        if value is None or saved is None:
            if value is not saved:return False
        elif types.get(key) in ('number','integer'):
            if isinstance(value,bool) or isinstance(saved,bool):return False
            try:
                a,b=Decimal(str(value)),Decimal(str(saved))
                if not a.is_finite() or not b.is_finite() or a!=b:return False
            except (InvalidOperation,ValueError):return False
        elif types.get(key)=='datetime':
            try:
                def instant(v):
                    if not isinstance(v,str) or not re.match(r'^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}',v):raise ValueError('Full timestamp required')
                    dt=datetime.fromisoformat(v.replace('Z','+00:00'))
                    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)
                if instant(value)!=instant(saved):return False
            except (ValueError,TypeError,AttributeError):return False
        elif not strict_equal(value,saved):return False
    return True
