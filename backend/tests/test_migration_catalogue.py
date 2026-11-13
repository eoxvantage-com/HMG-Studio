import sys
from pathlib import Path
import pytest
sys.path.insert(0,str(Path(__file__).parents[1]/'scripts'))
from migration_catalogue import plan_stones_catalogue

ORG='55dcee2a-dea1-4dfc-83ee-9474f7b5815b'
def option():
    return {'id':'02f429be-75e5-525b-be5b-bdf457f809ae','status':'Official reference','data':{'kind':'official_stone','material':{
        'id':'hmg-stone-verdi-fushion','sku':'QUA-VF','title':'Verdi Fushion','category':'Quartzite',
        'description':'Polished quartzite','sourcePageUrl':'https://www.hmgstones.com/product/verdi-fushion/',
        'sha256':'a'*64}}}
def test_stable_reference_only_catalogue_with_private_app_owned_images():
    plan=plan_stones_catalogue([option()],ORG,{'a'*64:'storage://products/stones-ref/a.jpg'},[])
    assert plan==plan_stones_catalogue([option()],ORG,{'a'*64:'storage://products/stones-ref/a.jpg'},[])
    row=plan['products'][0]
    assert row['stock']==0 and row['selling_price'] is None and not row['is_active']
    assert row['organization_id']==ORG and row['image'].startswith('storage://products/')
    assert row['category_id']==plan['product_categories'][0]['id']
    assert option()['id'] in row['notes'] and 'REFERENCE ONLY' in row['notes']
def test_missing_verified_media_blocks_entire_plan():
    with pytest.raises(ValueError):plan_stones_catalogue([option()],ORG,{},[])
def test_existing_identity_is_not_overwritten_or_name_merged():
    rows=plan_stones_catalogue([option()],ORG,{'a'*64:'storage://products/x.jpg'},[])['products']
    with pytest.raises(ValueError):plan_stones_catalogue([option()],ORG,{'a'*64:'storage://products/x.jpg'},rows)
def test_duplicate_source_identity_fails():
    with pytest.raises(ValueError):plan_stones_catalogue([option(),option()],ORG,{'a'*64:'storage://products/x.jpg'},[])
def test_draft_reference_fails():
    row=option();row['status']='Draft'
    with pytest.raises(ValueError):plan_stones_catalogue([row],ORG,{'a'*64:'storage://products/x.jpg'},[])
def test_duplicate_provenance_or_category_slug_fails():
    other=option();other['id']='12f429be-75e5-525b-be5b-bdf457f809ae'
    with pytest.raises(ValueError):plan_stones_catalogue([option(),other],ORG,{'a'*64:'storage://products/x.jpg'},[])
    existing=[{'organization_id':ORG,'slug':'stones-quartzite'}]
    with pytest.raises(ValueError):plan_stones_catalogue([option()],ORG,{'a'*64:'storage://products/x.jpg'},[],existing)
