"""Offline authorization/transport boundary tests; no native service or stock writes."""
import importlib.util
from pathlib import Path
from types import SimpleNamespace
from copy import deepcopy
import pytest

ORG="616d839b-e107-4511-b12f-fd6ed301d999"
ID="1597fb11-31a3-4858-861e-e804b6191538"
FOREIGN="913d0000-0000-4000-8000-000000000000"

@pytest.fixture
def env(monkeypatch):
    spec=importlib.util.spec_from_file_location("metadata_master",Path(__file__).parents[1]/"functions/contact_master.py")
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    state=SimpleNamespace(rows={"organizations":[{"id":ORG,"is_active":True,"deleted_at":None}]}, calls=[], secrets=[], policies=[], denied=False, fail_after=False, fail_before=False, wrong_identity=False, service_row=None, mutate_readback=None)
    class Query:
        def __init__(self,table):self.table=table;self.filters={}
        def filter(self,key,op,value):assert op=="eq";self.filters[key]=value;return self
        def page_size(self,size):assert size==1;return self
        def execute(self):return {"data":[dict(row) for row in state.rows.get(self.table,[]) if all(row.get(k)==v for k,v in self.filters.items())][:1]}
    def policy(resources,principal):
        assert principal is None
        state.policies.append(resources[0])
        return {"results":[{"actions":{"execute":"EFFECT_DENY" if state.denied else "EFFECT_ALLOW"}}]}
    def secret(name):
        state.secrets.append(name)
        return {"value":{"username":module.METADATA_USER,"password":"not-a-real-password"}}
    sdk=SimpleNamespace(database=SimpleNamespace(from_=Query),policy=SimpleNamespace(check_resources=policy),secrets=SimpleNamespace(get=secret))
    class Response:
        def __init__(self,body,status=200):self.body=body;self.status_code=status;self.content=b"bounded"
        def json(self):return deepcopy(self.body)
    class Client:
        def __init__(self,**kwargs):assert kwargs==dict(follow_redirects=False,trust_env=False,verify=True)
        def __enter__(self):return self
        def __exit__(self,*args):pass
        def request(self,method,url,headers,json,timeout):
            assert url.startswith(module.METADATA_ORIGIN+"/") and 0<timeout<=3
            state.calls.append((method,url,deepcopy(json)))
            if url.endswith("/jwt/token/"):return Response({"access":"opaque"})
            assert headers=={"Authorization":"Bearer opaque","X-App-Slug":"hmg-studio"}
            if url.endswith("/users/me/"):return Response({"data":{"username":"wrong" if state.wrong_identity else module.METADATA_USER}})
            table=url.split("/datatables/")[1].split("/")[0]
            rows=state.rows.setdefault(table,[])
            if method=="GET":
                row=state.service_row or next((r for r in rows if r["id"]==ID),None)
                return Response({"data":row},200 if row else 403)
            if state.fail_before:raise TimeoutError("private")
            if method=="POST":
                if any(r["id"]==json["id"] for r in rows):return Response({"error":"conflict"},409)
                rows.append(dict(json))
            elif method=="PATCH":next(r for r in rows if r["id"]==ID).update(json)
            else:raise AssertionError("Unexpected verb")
            if state.mutate_readback:state.mutate_readback(rows[-1])
            if state.fail_after:raise TimeoutError("private")
            return Response({"data":rows[-1]})
    monkeypatch.setattr(module.httpx,"Client",Client)
    def invoke(table="product_locations",action="create",values=None,**overrides):
        payload={"resource":table,"action":action,"organization_id":ORG,"request_id":ID}
        if action in ("create","update"):payload["values"]={"name":"Yard","is_active":True} if values is None else values
        payload.update(overrides)
        return module.main(payload,{"id":"ordinary-admin"},sdk)
    return module,state,invoke

@pytest.mark.parametrize("table",["product_locations","warehouses"])
def test_metadata_create_replay_and_caller_readback_without_second_secret(env,table):
    module,state,invoke=env
    assert invoke(table)["verified"]
    assert state.secrets==["hmg_metadata_writer_v1"]
    assert invoke(table)["replayed"]
    assert invoke(table,"readback")["verified"]
    assert len(state.secrets)==1
    assert invoke(table,values={"name":"changed"})["code"]=="CONFLICT"
    assert len(state.secrets)==1
    assert all(call["resource"]["kind"]=="function:hmg-contact-master-v1" for call in state.policies)
    assert all(call["resource"]["attr"]["metadata_resource"]==table and "resource" not in call["resource"]["attr"] for call in state.policies)

@pytest.mark.parametrize("values",[{"name":"x","organization_id":FOREIGN},{"name":"x","is_default":True},{"name":"x","stock":9},{"name":"x","capacity":True},{"name":"x","capacity":-1},{"name":"x","capacity":2147483648},{"name":"x","description":"x"*33000}])
def test_invalid_metadata_never_accesses_secret(env,values):
    _,state,invoke=env
    assert invoke(values=values)["code"]=="VALIDATION_ERROR"
    assert not state.secrets and not state.calls

@pytest.mark.parametrize("scenario",["policy","inactiveorg","foreignorg","foreignwarehouse"])
def test_authorization_reference_denial_precedes_secret(env,scenario):
    _,state,invoke=env
    values={"name":"x"};extra={}
    if scenario=="policy":state.denied=True
    if scenario=="inactiveorg":state.rows["organizations"][0]["is_active"]=False
    if scenario=="foreignorg":extra["organization_id"]=FOREIGN
    if scenario=="foreignwarehouse":
        state.rows["warehouses"]=[{"id":ID,"organization_id":FOREIGN,"is_active":True,"deleted_at":None}];values["warehouse_id"]=ID
    assert not invoke(values=values,**extra)["ok"]
    assert not state.secrets


def test_update_preserves_organization_and_default_and_uses_single_patch(env):
    _,state,invoke=env
    assert invoke("warehouses")["ok"]
    state.calls.clear();state.rows["warehouses"][0]["is_default"]=True
    result=invoke("warehouses","update",{"name":"Revised","priority":3})
    assert result["record"]["is_default"] is True
    patches=[payload for method,url,payload in state.calls if method=="PATCH"]
    assert len(patches)==1 and "organization_id" not in patches[0] and "id" not in patches[0] and "is_default" not in patches[0]

@pytest.mark.parametrize("after,expected",[(True,True),(False,False)])
def test_ambiguous_write_requires_caller_readback(env,after,expected):
    _,state,invoke=env
    state.fail_after=after;state.fail_before=not after
    result=invoke()
    assert result["ok"] is expected
    if not expected:assert result["code"]=="WRITE_UNCONFIRMED"

@pytest.mark.parametrize("scenario",["wrongidentity","foreignservice"])
def test_service_identity_or_scope_mismatch_never_writes(env,scenario):
    _,state,invoke=env
    if scenario=="wrongidentity":state.wrong_identity=True
    else:
        state.rows["product_locations"]=[{"id":ID,"organization_id":ORG,"deleted_at":None,"name":"Yard","is_active":True}]
        state.service_row={"id":ID,"organization_id":FOREIGN,"deleted_at":None}
    assert not invoke(action="update" if scenario=="foreignservice" else "create",values={"name":"Changed"})["ok"]
    assert not [call for call in state.calls if call[0] in ("PATCH","POST") and "/datatables/" in call[1]]


def test_metadata_delete_denied_without_secret(env):
    _,state,invoke=env
    assert invoke(action="delete")["code"]=="VALIDATION_ERROR"
    assert not state.secrets


@pytest.mark.parametrize("bad",[True,0,"false",None])
def test_warehouse_create_readback_rejects_wrong_or_malformed_default(env,bad):
    _,state,invoke=env
    state.mutate_readback=lambda row:row.update(is_default=bad)
    assert invoke("warehouses")["code"]=="READBACK_FAILED"


def test_warehouse_update_readback_must_preserve_default(env):
    _,state,invoke=env
    assert invoke("warehouses")["ok"]
    state.rows["warehouses"][0]["is_default"]=True
    state.mutate_readback=lambda row:row.update(is_default=False)
    assert invoke("warehouses","update",{"name":"Changed"})["code"]=="READBACK_FAILED"


def test_update_readback_includes_requested_unchanged_fields(env):
    _,state,invoke=env
    assert invoke()["ok"]
    state.mutate_readback=lambda row:row.update(name="unexpected")
    assert invoke(action="update",values={"name":"Yard","code":"NEW"})["code"]=="READBACK_FAILED"

@pytest.mark.parametrize("field,bad",[("is_active",1),("capacity",True)])
def test_readback_requires_exact_boolean_and_integer_types(env,field,bad):
    _,state,invoke=env
    state.mutate_readback=lambda row:row.update({field:bad})
    assert invoke(values={"name":"Yard","is_active":True,"capacity":1})["code"]=="READBACK_FAILED"


def test_warehouse_create_replay_checks_default_without_secret(env):
    _,state,invoke=env
    assert invoke("warehouses")["ok"]
    state.rows["warehouses"][0]["is_default"]=True
    assert invoke("warehouses")["code"]=="CONFLICT"
    assert len(state.secrets)==1


def test_create_skips_policy_denied_absent_detail_get(env):
    _,state,invoke=env
    assert invoke()["ok"]
    assert not [call for call in state.calls if call[0]=="GET" and "/datatables/" in call[1]]
    assert len([call for call in state.calls if call[0]=="POST" and "/datatables/" in call[1]])==1


def test_create_uuid_collision_cannot_upsert_foreign_record(env):
    _,state,invoke=env
    state.rows["product_locations"]=[{"id":ID,"organization_id":FOREIGN,"name":"Foreign","is_active":True,"deleted_at":None}]
    before=deepcopy(state.rows)
    assert invoke()["code"]=="WRITE_UNCONFIRMED"
    assert state.rows==before
    assert not [call for call in state.calls if call[0]=="PATCH"]
