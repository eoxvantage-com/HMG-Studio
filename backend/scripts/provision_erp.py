"""Additive HMG Studio schema provisioning over the authenticated Taruvi MCP.

Default is an offline dry run. --inspect reads live schema; --apply creates only
missing tables/columns/FKs. Existing columns, constraints and policies are never
replaced by manifest definitions. Secrets stay in process memory.
"""
import argparse
import asyncio
import copy
from datetime import datetime, timezone
import json
import logging
import os
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / 'backend/schema/erp-manifest.json'
FORBIDDEN = {'auth_user','users','roles','role_user','organization_user','warehouse_user','sessions','passwords','auth_users','user_roles','storage_objects','personal_access_tokens','permission_sets','role_permission_set','password_reset_tokens','customer_contact_password_reset_tokens','cache','cache_locks','jobs','job_batches','failed_jobs'}


def logical(name):
    return name.removeprefix('hmg_studio_')


def validate_manifest(manifest):
    if manifest.get('app_slug') != 'hmg-studio':
        raise ValueError('Only the explicitly scoped hmg-studio app is allowed')
    resources = manifest['resources']
    names = [r['name'] for r in resources]
    if len(names) != len(set(names)):
        raise ValueError('Duplicate resource')
    for resource in resources:
        name = resource['name']; schema = resource['schema']
        if name in FORBIDDEN or not re.fullmatch(r'[a-z][a-z0-9_]{0,45}', name):
            raise ValueError('Forbidden resource: '+name)
        if not resource.get('existing') and any(schema.get(key) for key in ('x-system-table','x-read-only','x-source-app')):
            raise ValueError('Business resources cannot masquerade as system/reference resources')
        fields = {f['name']:f for f in schema['fields']}
        if len(fields) != len(schema['fields']) or not schema.get('primaryKey'):
            raise ValueError('Invalid fields or primary key: '+name)
        for f in fields.values():
            if not re.fullmatch('[a-z][a-z0-9_]*',f['name']):
                raise ValueError('Invalid field name')
            if any(s in f['name'] for s in ('password','api_key','private_key','access_token','webhook_secret')):
                raise ValueError('Credentials must use native secret storage')
        for fk in schema.get('foreignKeys',[]):
            if logical(fk['reference']['resource']) not in set(names)|{'auth_user','storage_objects'}:
                raise ValueError('Unknown FK target: '+name)
            if not all(f in fields for f in fk['fields']):
                raise ValueError('Unknown FK column: '+name)
    return resources


def additive_schema(current, desired):
    """Preserve every live column and constraint, append only absent definitions."""
    result = copy.deepcopy(current)
    fields = {f['name'] for f in result['fields']}
    for f in desired['fields']:
        if f['name'] not in fields:
            if f.get('constraints',{}).get('required') and 'default' not in f:
                raise ValueError('Cannot add NOT NULL field without a default: '+f['name'])
            result['fields'].append(copy.deepcopy(f))
    for key in ('foreignKeys','indexes'):
        existing = result.setdefault(key,[])
        for entry in desired.get(key,[]):
            if key == 'foreignKeys':
                matches = any(e['fields']==entry['fields'] for e in existing)
            else:
                matches = any(e.get('fields')==entry.get('fields') and bool(e.get('unique'))==bool(entry.get('unique')) for e in existing)
            if not matches: existing.append(copy.deepcopy(entry))
    return result


def creation_plan(resources, existing):
    pending={r['name']:copy.deepcopy(r) for r in resources if r['name'] not in existing}
    known=set(existing)|{'auth_user','storage_objects'}; plan=[]; deferred={}
    while pending:
        ready=[name for name,r in pending.items() if all(logical(f['reference']['resource']) in known|{name} for f in r['schema'].get('foreignKeys',[]))]
        if not ready:
            # Break one cycle by deferring only not-yet-materialized references.
            name=min(pending,key=lambda n:len(pending[n]['schema'].get('foreignKeys',[])))
            r=pending[name]; fks=r['schema'].get('foreignKeys',[])
            deferred[name]=[f for f in fks if logical(f['reference']['resource']) not in known|{name}]
            r['schema']['foreignKeys']=[f for f in fks if f not in deferred[name]]
            ready=[name]
        for name in ready:
            plan.append(pending.pop(name));known.add(name)
    return plan,deferred


def unwrap(result):
    if result.isError: raise RuntimeError('MCP tool reported an error')
    for item in result.content:
        if item.type=='text':
            data=json.loads(item.text)
            if data.get('success') is False or data.get('error_count',0):
                raise RuntimeError(json.dumps(data)[:1400])
            return data
    raise RuntimeError('MCP response has no structured text')


def environment():
    env={}
    for file in (ROOT/'.env',ROOT/'.env.local'):
        if file.exists():
            for line in file.read_text().splitlines():
                if '=' in line and not line.lstrip().startswith('#'):
                    k,v=line.split('=',1);env[k.strip()]=v.strip().strip('"').strip("'")
    env.update({k:v for k,v in os.environ.items() if k.startswith('TARUVI_')})
    if env.get('TARUVI_APP_SLUG')!='hmg-studio': raise ValueError('App scope mismatch')
    if env.get('TARUVI_SITE_URL','').rstrip('/')!='https://insurance.taruvi.cloud': raise ValueError('Site scope mismatch')
    return env


async def run_live(manifest, apply):
    from mcp import ClientSession
    from mcp.client.streamable_http import streamablehttp_client
    logging.disable(logging.CRITICAL)
    env=environment(); resources=validate_manifest(manifest)
    report={'app_slug':'hmg-studio','site':'insurance.taruvi.cloud','started_at':datetime.now(timezone.utc).isoformat(),'created':[],'existing':[],'updated':[],'failed':[],'verified':[],'policies_changed':False,'rls_verified':False}
    output=ROOT/'backend/schema'/('provision-report.json' if apply else 'inspect-report.json')
    def save(): output.write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    async with streamablehttp_client(env['TARUVI_SITE_URL'].rstrip('/')+'/mcp/',headers={'Authorization':'Api-Key '+env['TARUVI_API_KEY'],'X-App-Slug':'hmg-studio'}) as (read,write,_):
        async with ClientSession(read,write) as session:
            await session.initialize()
            async def call(name,arguments):
                return unwrap(await session.call_tool(name,arguments))
            discovered=(await call('get_datatable_schema',{}))['data']
            live={r['name']:r for r in discovered if r['name'] not in FORBIDDEN}
            report['existing']=sorted(set(live)&{r['name'] for r in resources})
            plan,deferred=creation_plan(resources,live)
            report['planned']=[r['name'] for r in plan];report['deferred_fk_tables']=list(deferred)
            save()
            if not apply:
                print(json.dumps(report));return report
            async def upsert(resource,schema):
                payload={k:resource[k] for k in ('name','title','description','schema_format','provider_type','audit_enabled') if k in resource}
                payload['schema']=schema
                response=await call('create_update_schema',{'datapackage':{'resources':[payload]}})
                inner=response.get('data',response)
                if isinstance(inner,dict) and inner.get('error_count',0): raise RuntimeError(json.dumps(inner)[:1400])
                return response
            for r in plan:
                try:
                    await upsert(r,r['schema']);report['created'].append(r['name'])
                    print('Created '+r['name'],flush=True)
                except Exception as error:
                    report['failed'].append({'table':r['name'],'phase':'create','error':str(error)[:1400]});print('FAILED '+r['name'],flush=True)
                save()
            # Re-read before each additive update, never use a stale schema payload.
            for r in resources:
                name=r['name']
                if name not in set(report['existing'])|set(report['created']): continue
                try:
                    detail=await call('get_datatable_schema',{'table_name':name})
                    row=detail['data'];row=row[0] if isinstance(row,list) else row
                    current=row.get('json_schema',row.get('schema',row))
                    merged=additive_schema(current,r['schema'])
                    if merged!=current:
                        await upsert(r,merged);report['updated'].append(name)
                    detail=await call('get_datatable_schema',{'table_name':name})
                    row=detail['data'];row=row[0] if isinstance(row,list) else row
                    schema=row.get('json_schema',row.get('schema',row))
                    if row.get('is_materialized') is not True:
                        raise RuntimeError('Readback table is not materialized')
                    missing=set(f['name'] for f in r['schema']['fields'])-set(f['name'] for f in schema['fields'])
                    if missing: raise RuntimeError('Readback missing columns: '+str(sorted(missing)))
                    actual_fields={f['name']:f for f in schema['fields']}
                    for field in r['schema']['fields']:
                        actual=actual_fields[field['name']]
                        if field['type']!=actual['type']:
                            raise RuntimeError('Readback type mismatch: '+field['name'])
                        if field.get('format')=='uuid' and actual.get('format')!='uuid':
                            raise RuntimeError('Readback UUID mismatch: '+field['name'])
                    wanted={(tuple(f['fields']),logical(f['reference']['resource'])) for f in r['schema'].get('foreignKeys',[])}
                    got={(tuple(f['fields']),logical(f['reference']['resource'])) for f in schema.get('foreignKeys',[])}
                    if wanted-got: raise RuntimeError('Readback missing foreign keys')
                    desired_indexes={(tuple(i.get('fields',[])),bool(i.get('unique'))) for i in r['schema'].get('indexes',[]) if i.get('fields')}
                    actual_indexes={(tuple(i.get('fields',[])),bool(i.get('unique'))) for i in schema.get('indexes',[]) if i.get('fields')}
                    if desired_indexes-actual_indexes: raise RuntimeError('Readback missing indexes')
                    report['verified'].append(name);r['liveVerified']=True
                    print('Verified '+name,flush=True)
                except Exception as error:
                    report['failed'].append({'table':name,'phase':'verify','error':str(error)[:1400]});print('FAILED VERIFY '+name,flush=True)
                save()
            manifest['live_verification']={'at':datetime.now(timezone.utc).isoformat(),'verified_tables':len(report['verified']),'normal_role_authorization':False,'transactional_workflows':False}
            MANIFEST.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
            report['completed_at']=datetime.now(timezone.utc).isoformat();save()
            print(json.dumps({k:len(report[k]) for k in ('created','existing','updated','failed','verified')}))
            return report


if __name__=='__main__':
    parser=argparse.ArgumentParser();group=parser.add_mutually_exclusive_group();group.add_argument('--apply',action='store_true');group.add_argument('--inspect',action='store_true');args=parser.parse_args()
    manifest=json.loads(MANIFEST.read_text(encoding='utf-8'));resources=validate_manifest(manifest)
    if args.apply or args.inspect:
        result=asyncio.run(run_live(manifest,args.apply))
        if result and result['failed']:raise SystemExit(1)
    else:
        plan,deferred=creation_plan(resources,{r['name'] for r in resources if r.get('existing') or r.get('liveVerified')})
        print(json.dumps({'mode':'offline-dry-run','basis':'manifest snapshot; use --inspect for current live state','resources':len(resources),'new_tables':[r['name'] for r in plan],'deferred_fk_tables':list(deferred)}))
