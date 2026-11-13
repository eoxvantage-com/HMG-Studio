"""Generate a temporary Taruvi function that backfills HMG Stones order history (Jun-Sep 2026).

Requested by the workspace owner on 2026-11-13 so monthly reporting has history.
Every order goes through hmg-stock-ledger-v1 (create -> approve -> fulfill) with the
caller's authorization, so stock, reservations and entitlements stay consistent.
Request IDs are deterministic: re-running replays instead of duplicating.
Each order's notes state that it was backfilled. Output: .cache/history-orders-function.py
"""
import json
import sys
from decimal import Decimal
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_ledger_seed_orders import C, FACTORY, ORG, P, money  # noqa: E402
from uuid import UUID, uuid5  # noqa: E402

NS = UUID("0b6c7d52-9a4e-5f31-8c2d-20261113a0f1")
BACKFILL_NOTE = "Backfilled historical order (entered 13 Nov 2026) for reporting history."
# (key, customer, order date, [(product, qty)], shipping, notes)
ORDERS = [
    ("hist-01", "atrium", "2026-06-09", [("carrara", 5), ("bianco_carrara", 6)], "4000.00", "Guest-room vanities and corridor inlay, phase 0."),
    ("hist-02", "vista", "2026-06-23", [("steel_grey", 6), ("galena", 5)], "3000.00", "Sample flat kitchen and bath counters."),
    ("hist-03", "northlight", "2026-07-04", [("calacatta_gold", 2), ("carrara", 3)], "3500.00", "Studio reception desk and display plinths."),
    ("hist-04", "garden", "2026-07-16", [("absolute_black", 8), ("silver_grey", 6)], "4500.00", "Tower A lobby skirting and stair risers."),
    ("hist-05", "terrace", "2026-07-28", [("rainforest", 3), ("sg_vanity", 1)], "2000.00", "Powder room feature wall and vanity."),
    ("hist-06", "pavilion", "2026-08-07", [("absolute_black", 6), ("steel_grey", 5)], "5000.00", "Block B lift-lobby flooring."),
    ("hist-07", "crescent", "2026-08-21", [("honey_onyx", 1), ("ivory_travertine", 3)], "3500.00", "Resort reception backdrop sample and planters."),
    ("hist-08", "courtyard", "2026-09-03", [("golden_eagle", 6), ("galena", 4)], "3000.00", "Villa 3 kitchen and utility counters."),
    ("hist-09", "meridian", "2026-09-15", [("taj_mahal", 2), ("bianco_carrara", 4)], "3500.00", "Client residence island and bath ledges."),
    ("hist-10", "atrium", "2026-09-26", [("silver_grey", 5), ("rainforest", 3)], "2500.00", "Spa wet-area cladding, lot 1."),
]


def rid(*parts):
    return str(uuid5(NS, ":".join(parts)))


def build():
    steps = []
    for key, cust, day, lines, shipping, notes in ORDERS:
        cid, name, email, address = C[cust]
        items = [{"line_id": rid(key, "line", str(i)), "product_id": P[p][0], "product_variant_id": None,
                  "quantity": q, "unit_price": P[p][1]} for i, (p, q) in enumerate(lines)]
        subtotal = sum(Decimal(i["unit_price"]) * i["quantity"] for i in items)
        doc_id = rid(key, "create")
        steps.append({"label": key + " create", "command": {"request_id": doc_id, "action": "create_order",
            "reason": "Backfilled historical order " + key.upper() + " for " + name, "document": {
                "customer_id": cid, "customer_name": name, "customer_email": email, "customer_address": address,
                "order_date": day, "currency": "INR", "notes": notes + " GST 18% included in tax. " + BACKFILL_NOTE,
                "tax": money(subtotal * Decimal("0.18")), "shipping": shipping, "items": items}}})
        alloc = [{"line_id": i["line_id"], "location_id": FACTORY, "quantity": i["quantity"]} for i in items]
        steps.append({"label": key + " approve", "command": {"request_id": rid(key, "approve"), "action": "approve_document",
            "reason": "Backfill: approved and reserved at Factory Stone Yard Rack A", "document_id": doc_id,
            "expected_revision": 1, "allocations": alloc}})
        steps.append({"label": key + " fulfill", "command": {"request_id": rid(key, "fulfill"), "action": "fulfill_order",
            "reason": "Backfill: dispatched with delivery challan", "document_id": doc_id,
            "expected_revision": 2, "lines": alloc}})
    return steps


TEMPLATE = '''"""TEMPORARY history backfill (2026-11-13). Replays fixed HMG Stones ledger commands via hmg-stock-ledger-v1.
Idempotent: fixed request IDs replay instead of duplicating. Disable after use."""
ORG = '%(org)s'
STEPS = %(steps)s

def main(params, user_data, sdk_client):
    start = int(params.get('start', 0)) if isinstance(params, dict) else 0
    count = min(int(params.get('count', 6)) if isinstance(params, dict) else 6, 9)
    out = []
    for step in STEPS[start:start + count]:
        try:
            reply = sdk_client.functions.execute('hmg-stock-ledger-v1', params={
                'action': 'command', 'organization_id': ORG, 'command': step['command']}, is_async=False)
            data = reply.get('data') if isinstance(reply, dict) else None
            ok = isinstance(data, dict) and data.get('ok') is True
            out.append({'step': step['label'], 'ok': ok, 'code': data.get('code') if isinstance(data, dict) else None,
                        'detail': data.get('detail') if isinstance(data, dict) else None,
                        'replay': data.get('replay') if isinstance(data, dict) else None,
                        'sequence': (data.get('state') or {}).get('sequence') if isinstance(data, dict) else None})
            if not ok:
                break
        except Exception as error:
            out.append({'step': step['label'], 'ok': False, 'error': type(error).__name__})
            break
    return {'total_steps': len(STEPS), 'start': start, 'results': out}
'''

if __name__ == "__main__":
    steps = build()
    root = Path(__file__).resolve().parents[2]
    code = TEMPLATE % {"org": ORG, "steps": repr(steps)}
    compile(code, "<history>", "exec")
    (root / ".cache" / "history-orders-function.py").write_text(code, encoding="utf-8")
    print(json.dumps({"steps": len(steps), "bytes": len(code), "orders": len(ORDERS)}))
