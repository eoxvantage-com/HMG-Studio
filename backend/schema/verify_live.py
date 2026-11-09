"""Read back the complete ERP contract and optionally apply reviewed extra indexes.

No row or policy writes. The optional index pass always preserves the full live
schema and refuses any table/field absent from the reviewed ERP manifest.
"""
import argparse
import asyncio
from datetime import datetime, timezone
import importlib.util
import json
import logging
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SPEC = importlib.util.spec_from_file_location('provision_erp', ROOT / 'backend/scripts/provision_erp.py')
P = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(P)


async def main(apply_indexes):
    from mcp import ClientSession
    from mcp.client.streamable_http import streamablehttp_client
    logging.disable(logging.CRITICAL)
    env = P.environment()
    manifest = json.loads(P.MANIFEST.read_text(encoding='utf-8'))
    resources = {r['name']: r for r in P.validate_manifest(manifest)}
    report = {'app_slug': 'hmg-studio', 'at': datetime.now(timezone.utc).isoformat(),
              'verified': [], 'failed': [], 'index_updates': [], 'policies_modified': False,
              'data_modified': False, 'rls_verified': False, 'normal_role_verified': False}
    supplement = json.loads((Path(__file__).parent / 'index-supplement.json').read_text())
    async with streamablehttp_client(env['TARUVI_SITE_URL'] + '/mcp/', headers={
            'Authorization': 'Api-Key ' + env['TARUVI_API_KEY'], 'X-App-Slug': 'hmg-studio'}) as (read, write, _):
        async with ClientSession(read, write) as session:
            await session.initialize()
            async def call(name, arguments):
                return P.unwrap(await session.call_tool(name, arguments))
            if apply_indexes:
                for name, indexes in supplement['indexes'].items():
                    desired = resources[name]['schema']
                    columns = {f['name'] for f in desired['fields']}
                    for index in indexes:
                        if not set(index['fields']) <= columns:
                            raise ValueError('Unknown index field')
                        if not any(i.get('fields') == index['fields'] for i in desired.get('indexes', [])):
                            desired.setdefault('indexes', []).append(index)
                    current = (await call('get_datatable_schema', {'table_name': name}))['data']['json_schema']
                    merged = P.additive_schema(current, desired)
                    if current != merged:
                        payload = {k: resources[name][k] for k in ('name', 'title', 'description', 'schema_format', 'provider_type', 'audit_enabled')}
                        payload['schema'] = merged
                        await call('create_update_schema', {'datapackage': {'resources': [payload]}})
                        report['index_updates'].append(name)
            snapshot = (await call('get_datatable_schema', {}))['data']
            live = {r['name']: r for r in snapshot if r['name'] in resources}
            for name, resource in resources.items():
                issues = []
                row = live.get(name, {})
                if not row.get('is_materialized') or row.get('physical_table_name') != 'hmg_studio_' + name:
                    issues.append('materialized physical table mismatch')
                actual = row.get('json_schema', {})
                fields = {f['name']: f for f in actual.get('fields', [])}
                desired = resource['schema']
                for f in desired['fields']:
                    if f['name'] not in fields:
                        issues.append('missing field ' + f['name'])
                        continue
                    a = fields[f['name']]
                    for key in ('type', 'format', 'default'):
                        if key in f and f[key] != a.get(key):
                            issues.append('field ' + f['name'] + ' ' + key + ' mismatch')
                    for key, value in f.get('constraints', {}).items():
                        if a.get('constraints', {}).get(key) != value:
                            issues.append('field ' + f['name'] + ' constraint ' + key + ' mismatch')
                expected_fks = {(tuple(f['fields']), P.logical(f['reference']['resource'])) for f in desired.get('foreignKeys', [])}
                actual_fks = {(tuple(f['fields']), P.logical(f['reference']['resource'])) for f in actual.get('foreignKeys', [])}
                if not expected_fks <= actual_fks:
                    issues.append('missing FK')
                expected_indexes = {(tuple(i.get('fields', [])), bool(i.get('unique'))) for i in desired.get('indexes', []) if i.get('fields')}
                actual_indexes = {(tuple(i.get('fields', [])), bool(i.get('unique'))) for i in actual.get('indexes', []) if i.get('fields')}
                if not expected_indexes <= actual_indexes:
                    issues.append('missing index')
                resource['liveVerified'] = not issues
                if issues:
                    report['failed'].append({'table': name, 'issues': issues})
                else:
                    report['verified'].append(name)
            report['created_since_baseline'] = len(set(live) - {'organizations', 'product_categories', 'product_locations', 'warehouses'})
            report['reused_baseline'] = len(set(live) & {'organizations', 'product_categories', 'product_locations', 'warehouses'})
            report['table_count'] = len(live)
            report['field_count'] = sum(len(r['schema']['fields']) for r in resources.values())
            report['fk_count'] = sum(len(r['schema'].get('foreignKeys', [])) for r in resources.values())
            report['index_count'] = sum(len(r['schema'].get('indexes', [])) for r in resources.values())
            report['historical_retry_evidence'] = ['purchase-order-retry-evidence.json', 'supplier-history-retry-evidence.json']
            manifest['live_verification'] = {'at': report['at'], 'verified_tables': len(report['verified']), 'normal_role_authorization': False, 'transactional_workflows': False}
            P.MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n', encoding='utf-8')
            (Path(__file__).parent / 'final-live-schema.json').write_text(json.dumps({'data': list(live.values())}, indent=2) + '\n', encoding='utf-8')
            (Path(__file__).parent / 'final-verification.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
            print(json.dumps({k: report[k] for k in ('created_since_baseline', 'reused_baseline', 'table_count', 'field_count', 'fk_count', 'index_count', 'failed')}))
            return report


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply-indexes', action='store_true')
    args = parser.parse_args()
    outcome = asyncio.run(main(args.apply_indexes))
    if outcome['failed']:
        raise SystemExit(1)
