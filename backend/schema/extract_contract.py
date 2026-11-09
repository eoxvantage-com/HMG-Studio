"""Extract declarative schema facts, never execute or import the legacy application.

This one-time audit utility reads migration declarations into an independent
Frictionless contract. Source implementation code is not included in output.
"""
import argparse
import hashlib
import json
from pathlib import Path
import re

EXCLUDED = set('users roles role_user permission_sets role_permission_set organization_user warehouse_user personal_access_tokens password_reset_tokens sessions customer_contact_password_reset_tokens cache cache_locks jobs job_batches failed_jobs'.split())
SECRET_FIELDS = {'password', 'remember_token', 'secret', 'api_key', 'api_secret', 'marketplace_token', 'token', 'credential', 'credentials'}


def quoted(value):
    return re.findall(r"'([^']*)'", value)


def extract(source, baseline):
    tables, evidence, warnings = {}, {}, []
    for path in sorted((source / 'database/migrations').glob('*.php')):
        text = path.read_text(encoding='utf-8').split('function down')[0]
        text = re.sub(r'/\*.*?\*/|//[^\n]*', '', text, flags=re.S)
        for match in re.finditer(r"Schema::(?:create|table)\((('[^']+')|\$\w+),\s*(?:function|fn)\s*\(Blueprint \$table\)[^{=]*(\{|=>)", text):
            target = match.group(1)
            names = quoted(target)
            if not names:
                const = re.search(r'const TABLES\s*=\s*\[([^]]+)\]', text)
                if const:
                    names = quoted(const.group(1))
                else:
                    loops = list(re.finditer(r'foreach\s*\(\s*\[([^]]+)\]\s+as\s+\$\w+\)', text[:match.start()]))
                    if loops:
                        names = quoted(loops[-1].group(1))
            if not names:
                warnings.append({'file': path.name, 'reason': 'dynamic table declaration requires review'})
                continue
            start = match.end()
            if match.group(3) == '=>':
                body = text[start:text.index(';', start)] + ';'
            else:
                depth, end = 1, start
                while depth and end < len(text):
                    depth += (text[end] == '{') - (text[end] == '}')
                    end += 1
                body = text[start:end - 1]
            for name in names:
                if name in EXCLUDED:
                    continue
                table = tables.setdefault(name, {'fields': {}, 'primaryKey': ['id'], 'foreignKeys': [], 'indexes': []})
                evidence.setdefault(name, []).append(path.name)
                for statement in re.findall(r'\$table->(.*?);', body, flags=re.S):
                    m = re.match(r'(\w+)\((.*?)\)(.*)', statement, re.S)
                    if not m:
                        continue
                    method, args, chain = m.groups()
                    names_ = quoted(args)
                    field = names_[0] if names_ else 'id'
                    if method in ('timestamps', 'softDeletes'):
                        for n in (['created_at', 'updated_at'] if method == 'timestamps' else ['deleted_at']):
                            table['fields'][n] = {'name': n, 'type': 'datetime'}
                        continue
                    if method in ('index', 'unique'):
                        cols = quoted(args.split(']')[0]) if args.strip().startswith('[') else names_[:1]
                        if cols:
                            table['indexes'].append({'fields': cols, 'unique': method == 'unique'})
                        continue
                    if method == 'dropUnique':
                        cols = names_ if args.strip().startswith('[') else []
                        if not cols and names_:
                            cols = [n for n in table['fields'] if names_[0] == name + '_' + n + '_unique']
                        for col in cols:
                            table['fields'].get(col, {}).get('constraints', {}).pop('unique', None)
                        table['indexes'] = [i for i in table['indexes'] if not (i.get('unique') and i['fields'] == cols)]
                        continue
                    if method == 'renameColumn':
                        if names_[0] in table['fields']:
                            old = table['fields'].pop(names_[0]); old['name'] = names_[1]; table['fields'][names_[1]] = old
                        continue
                    if method in ('nullableMorphs', 'morphs'):
                        for suffix, typ in [('type', 'string'), ('id', 'string')]:
                            table['fields'][field + '_' + suffix] = {'name': field + '_' + suffix, 'type': typ}
                        continue
                    if method in ('dropIndex', 'dropForeign', 'foreign', 'rememberToken'):
                        continue
                    types = {'id':'string','uuid':'string','foreignId':'string','string':'string','char':'string','text':'string','longText':'string','mediumText':'string','enum':'string','boolean':'boolean','decimal':'number','double':'number','float':'number','date':'date','timestamp':'datetime','dateTime':'datetime','json':'any','jsonb':'any','integer':'integer','unsignedInteger':'integer','unsignedBigInteger':'integer','bigInteger':'integer','unsignedTinyInteger':'integer','unsignedSmallInteger':'integer'}
                    if method not in types:
                        warnings.append({'file': path.name, 'table': name, 'method': method})
                        continue
                    if field in SECRET_FIELDS or any(k in field for k in ('password', 'token', 'api_key', 'api_secret', 'webhook_secret', 'private_key')):
                        continue
                    info = {'name': field, 'type': types[method]}
                    constraints = {}
                    if 'nullable(' not in chain:
                        constraints['required'] = True
                    if method in ('id', 'uuid', 'foreignId'):
                        info['format'] = 'uuid'
                    if method.startswith('unsigned'):
                        constraints['minimum'] = 0
                    if method in ('string', 'char'):
                        length = re.search(r',\s*(\d+)', args)
                        constraints['maxLength'] = int(length.group(1)) if length else 255
                    if method == 'enum':
                        constraints['enum'] = names_[1:]
                    if '->unique(' in chain:
                        constraints['unique'] = True
                    if '->index(' in chain:
                        table['indexes'].append({'fields':[field]})
                    default = re.search(r"->default\(([^)]*)\)", chain)
                    if default:
                        val = default.group(1).strip()
                        if val.startswith("'"):
                            info['default'] = val.strip("'")
                        elif val in ('true', 'false', 'null'):
                            info['default'] = json.loads(val)
                        else:
                            try: info['default'] = json.loads(val)
                            except ValueError: warnings.append({'file': path.name, 'field': field, 'reason': 'computed default omitted'})
                    if constraints:
                        info['constraints'] = constraints
                    if 'change(' in chain and field in table['fields']:
                        previous = table['fields'][field]
                        previous.update(info)
                    else:
                        table['fields'][field] = info
                    if method == 'foreignId' and 'constrained(' in chain:
                        ref = re.search(r"->constrained\((.*?)\)", chain)
                        target_ = quoted(ref.group(1))
                        target_ = target_[0] if target_ else field.removesuffix('_id') + 's'
                        if target_ == 'product_batchs': target_ = 'product_batches'
                        if target_ == 'users': target_ = 'auth_user'
                        action = 'SET NULL' if 'nullOnDelete' in chain else 'RESTRICT'
                        table['foreignKeys'] = [f for f in table['foreignKeys'] if f['fields'] != [field]]
                        table['foreignKeys'].append({'fields':[field], 'reference':{'resource': target_, 'fields':['id']}, 'x-actions':{'onDelete':action}})
    for name, table in tables.items():
        # Polymorphic references are UUID identifiers, never integer source IDs.
        for f in table['fields'].values():
            if f['name'].endswith('_id') and f['type'] == 'integer':
                f['type'] = 'string'; f['format'] = 'uuid'; f.get('constraints', {}).pop('minimum', None)
        if 'id' not in table['fields']:
            table['fields']['id'] = {'name':'id','type':'string','format':'uuid','constraints':{'required':True}}
        # FK columns get indexes even when the source omitted them.
        for fk in table['foreignKeys']:
            if fk['reference']['resource'] not in tables and fk['reference']['resource'] != 'auth_user':
                warnings.append({'table':name,'fk':fk,'reason':'missing target'})
            table['indexes'].append({'fields':fk['fields']})
        table['indexes'] = [i for i in table['indexes'] if all(c in table['fields'] for c in i['fields'])]
        dedup = {}
        for idx in table['indexes']:
            key = (tuple(idx['fields']), bool(idx.get('unique')))
            idx['name'] = 'erp_' + hashlib.sha256((name+str(key)).encode()).hexdigest()[:20]
            dedup[key] = idx
        table['indexes'] = list(dedup.values())
        table['fields'] = list(table['fields'].values())
    resources = []
    for name, schema in sorted(tables.items()):
        resources.append({'name':name,'title':name.replace('_',' ').title(),'description':'HMG Studio ERP business schema; source declaration facts independently mapped to Taruvi.','schema':schema,'audit_enabled':True,'schema_format':'frictionless','provider_type':'flat_table','source_evidence':sorted(set(evidence[name]))})
    for existing in baseline['data']:
        r = next(r for r in resources if r['name'] == existing['name'])
        additions = [f for f in r['schema']['fields'] if f['name'] not in {v['name'] for v in existing['json_schema']['fields']}]
        for f in additions:
            if 'default' not in f:
                f.get('constraints', {}).pop('required', None)
        r['schema'] = existing['json_schema']; r['schema']['fields'].extend(additions); r['existing'] = True
    return {'name':'hmg_studio_erp','app_slug':'hmg-studio','resources':resources,'excluded_native_or_infrastructure':sorted(EXCLUDED),'extraction_warnings':warnings}


if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('source', type=Path); p.add_argument('--output', type=Path); args=p.parse_args()
    root=Path(__file__).parent
    result=extract(args.source, json.loads((root/'live-baseline.json').read_text()))
    # Never overwrite the reviewed/live manifest with an unreviewed extraction.
    output = args.output or root/'erp-manifest.draft.json'
    if output.resolve() == (root/'erp-manifest.json').resolve():
        raise SystemExit('Refusing to replace the reviewed ERP manifest; write a draft and review the diff.')
    output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'resources':len(result['resources']),'warnings':result['extraction_warnings']}))
