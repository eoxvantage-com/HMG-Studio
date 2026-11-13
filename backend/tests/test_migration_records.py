import sys
from pathlib import Path
import pytest
sys.path.insert(0,str(Path(__file__).parents[1]/'scripts'))
from migration_records import ordered_rows, equivalent

def test_orders_children_after_parents_and_refuses_missing_references():
    schemas={'parents':{'fields':[]},'children':{'fields':[], 'foreignKeys':[{'fields':['parent'],'reference':{'resource':'parents','fields':['id']}}]}}
    assert [t for t,r in ordered_rows(schemas,{'children':[{'id':'c','parent':'p'}],'parents':[{'id':'p'}]})]==['parents','children']
    with pytest.raises(ValueError):ordered_rows(schemas,{'children':[{'id':'c','parent':'missing'}]})

def test_self_reference_and_cycles():
    s={'nodes':{'foreignKeys':[{'fields':['parent'],'reference':{'resource':'nodes','fields':['id']}}]}}
    rows=ordered_rows(s,{'nodes':[{'id':'child','parent':'root'},{'id':'root','parent':None}]})
    assert [r['id'] for t,r in rows]==['root','child']
    with pytest.raises(ValueError):ordered_rows(s,{'nodes':[{'id':'a','parent':'b'},{'id':'b','parent':'a'}]})

def test_requires_explicit_native_identity_mapping():
    s={'notes':{'foreignKeys':[{'fields':['user_id'],'reference':{'resource':'auth_user','fields':['id']}}]}}
    data={'notes':[{'id':'n','user_id':'u'}]}
    with pytest.raises(ValueError):ordered_rows(s,data)
    assert len(ordered_rows(s,data,{'auth_user':{'u'}}))==1

def test_duplicates_and_unknown_tables_fail():
    with pytest.raises(ValueError):ordered_rows({'x':{}},{'x':[{'id':'a'},{'id':'a'}]})
    with pytest.raises(ValueError):ordered_rows({}, {'unknown':[{'id':'a'}]})

def test_readback_normalizes_only_schema_numeric_and_datetime_types():
    s={'fields':[{'name':'n','type':'number'},{'name':'d','type':'datetime'},{'name':'name','type':'string'}]}
    assert equivalent({'n':'1.00','d':'2026-11-10T00:00:00Z','name':'A'},{'n':1,'d':'2026-11-10T00:00:00','name':'A'},s)
    assert not equivalent({'n':True},{'n':1},s)
    assert not equivalent({'name':'A'},{'name':'B'},s)
    assert not equivalent({'n':'NaN'},{'n':'NaN'},s)
    assert not equivalent({'d':'2026-11-10'},{'d':'2026-11-10T00:00:00'},s)
    assert not equivalent({'meta':{'a':[True]}},{'meta':{'a':[1]}},s)
