"""Bounded ordinary-session advisory checks only; never creates a record.

Root injects its ephemeral client: run(base, c, h). Credentials are never written.
`base` must identify insurance.taruvi.cloud; paths are fixed to hmg-studio.
"""
import copy
from datetime import datetime, timezone
import json
from pathlib import Path
from urllib.parse import urlsplit


def run(base, c, h):
    site = urlsplit(base)
    if site.scheme != "https" or site.netloc != "insurance.taruvi.cloud":
        raise ValueError("Unexpected site")
    if any(k.lower() == "authorization" for k in h):
        raise ValueError("Use ordinary session only, never API-key Authorization")
    if not any(k.lower() == "x-session-token" and v for k, v in h.items()):
        raise ValueError("An ordinary session token is required")
    origin = site.scheme + "://" + site.netloc
    evidence = Path("docs/hmg-studio/evidence")
    baseline = json.loads((evidence / "erp-normal-create-v3.json").read_text())["payload"]
    cases = []
    def add(label, resource_id, attrs):
        cases.append({"label": label, "resource_id": resource_id, "attributes": attrs})
    add("documented_new_raw", "new", copy.deepcopy(baseline))
    add("documented_batch_new_raw", "new:0", copy.deepcopy(baseline))
    add("previous_concrete_uuid_raw", baseline["id"], copy.deepcopy(baseline))
    add("explicit_null_optional", "new:1", {**baseline, "credit_limit": None, "deleted_at": None})
    add("explicit_numeric_zero", "new:2", {**baseline, "credit_limit": 0, "deleted_at": None})
    add("numeric_string_zero", "new:3", {**baseline, "credit_limit": "0", "deleted_at": None})
    add("empty_string_numeric", "new:4", {**baseline, "credit_limit": "", "deleted_at": None})
    add("blank_name_denial", "new:5", {**baseline, "name": "   "})
    add("foreign_org_denial", "new:6", {**baseline, "organization_id": "00000000-0000-0000-0000-000000000001"})
    add("soft_deleted_denial", "new:7", {**baseline, "deleted_at": "2026-11-06T00:00:00Z"})
    add("missing_name_denial", "new:8", {k: v for k, v in baseline.items() if k != "name"})
    # One documented policy request; no datatable POST, no principal override.
    request = {"resources": [{"resource": {"kind": "datatable:customers", "id": x["resource_id"], "attr": x["attributes"]},
                               "actions": ["create"]} for x in cases]}
    response = c.post(origin + "/api/apps/hmg-studio/check/resources/", headers=h, json=request)
    report = {"at": datetime.now(timezone.utc).isoformat(), "app": "hmg-studio", "read_only": True,
              "cases": cases, "http": response.status_code, "response": response.json(),
              "no_datatable_mutation": True}
    path = evidence / "native-create-advisory-normalization.json"
    path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"evidence": str(path), "http": response.status_code, "cases": len(cases)}))
    return report
