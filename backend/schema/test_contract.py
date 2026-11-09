"""Pure contract tests: no network, credentials or live mutations."""
import copy
import importlib.util
import json
from pathlib import Path
import unittest

ROOT=Path(__file__).resolve().parents[2]
spec=importlib.util.spec_from_file_location('provision_erp', ROOT/'backend/scripts/provision_erp.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)


class ContractTests(unittest.TestCase):
    def setUp(self):
        self.manifest=json.loads((ROOT/'backend/schema/erp-manifest.json').read_text())

    def test_all_modules_and_no_duplicate_identity(self):
        resources=module.validate_manifest(self.manifest)
        self.assertEqual(62,len(resources));self.assertEqual(32,len(self.manifest['modules']))
        names={r['name'] for r in resources}
        for section in self.manifest['modules']:
            self.assertTrue(set(section['resources'])<=names)

    def test_additive_preserves_unknown_fields_constraints_and_indexes(self):
        current={'fields':[{'name':'id','type':'string'},{'name':'legacy','type':'integer','constraints':{'minimum':7}}], 'primaryKey':['id'],'indexes':[{'fields':['legacy'],'unique':True}]}
        desired={'fields':[{'name':'id','type':'integer'},{'name':'new','type':'string'}],'primaryKey':['id']}
        merged=module.additive_schema(current,desired)
        self.assertEqual(current['fields'],merged['fields'][:2]);self.assertEqual(current['indexes'],merged['indexes'])
        self.assertEqual(merged,module.additive_schema(merged,desired))

    def test_required_addition_without_default_rejected(self):
        with self.assertRaises(ValueError):
            module.additive_schema({'fields':[]},{'fields':[{'name':'x','type':'string','constraints':{'required':True}}]})

    def test_creation_order_and_cycle_deferral(self):
        resources=module.validate_manifest(self.manifest)
        known={r['name'] for r in resources if r.get('existing')}|{'auth_user','storage_objects'}
        plan,deferred=module.creation_plan(resources,known)
        self.assertEqual(58,len(plan));self.assertTrue(deferred)
        for resource in plan:
            for fk in resource['schema'].get('foreignKeys',[]):
                self.assertIn(module.logical(fk['reference']['resource']),known|{resource['name']})
            known.add(resource['name'])

    def test_manifest_rejects_wrong_scope_and_credentials(self):
        m=copy.deepcopy(self.manifest);m['app_slug']='other-app'
        with self.assertRaises(ValueError):module.validate_manifest(m)
        m=copy.deepcopy(self.manifest);m['resources'][0]['schema']['fields'].append({'name':'api_key','type':'string'})
        with self.assertRaises(ValueError):module.validate_manifest(m)

    def test_native_authority_tables_and_system_policy_bypass_are_rejected(self):
        m=copy.deepcopy(self.manifest);m['resources'][0]['name']='permission_sets'
        with self.assertRaises(ValueError):module.validate_manifest(m)
        m=copy.deepcopy(self.manifest);m['resources'][0]['schema']['x-system-table']=True
        with self.assertRaises(ValueError):module.validate_manifest(m)

    def test_reviewed_index_supplement_uses_only_existing_business_columns(self):
        supplement=json.loads((ROOT/'backend/schema/index-supplement.json').read_text())
        resources={r['name']:r for r in self.manifest['resources']}
        self.assertEqual(5,sum(len(v) for v in supplement['indexes'].values()))
        for name,indexes in supplement['indexes'].items():
            columns={f['name'] for f in resources[name]['schema']['fields']}
            self.assertNotIn(name,module.FORBIDDEN)
            for index in indexes:
                self.assertTrue(set(index['fields'])<=columns)
                self.assertFalse(index.get('unique',False))

    def test_live_master_fields_are_preserved(self):
        baseline=json.loads((ROOT/'backend/schema/live-baseline.json').read_text())
        resources={r['name']:r for r in self.manifest['resources']}
        for r in baseline['data']:
            actual={f['name']:f for f in resources[r['name']]['schema']['fields']}
            for field in r['json_schema']['fields']:
                self.assertEqual(field,actual[field['name']])


if __name__=='__main__':unittest.main()
