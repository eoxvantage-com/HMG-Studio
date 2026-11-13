"""Generate a temporary Taruvi function that seeds HMG Stones demo orders through the ledger.

The generated function only calls hmg-stock-ledger-v1 (caller-authorized) with fixed,
deterministic commands, so re-running is idempotent (same request IDs replay).
Output: .cache/seed-orders-function.py
"""
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path
from uuid import UUID, uuid5

ORG = "913d46eb-585d-5a5c-b1d4-b9d22052a8d6"
NS = UUID("6f1f2c1e-4b8a-5d0e-9a51-20261112a0f0")
FACTORY = "8ef60f84-c37d-5855-a14d-5ba0731fceab"
P = {  # product_id, unit selling price (INR) from the catalogue
    "carrara": ("3462e7e3-65f5-5437-855f-0cd756834762", "12500.00"),
    "calacatta_gold": ("4efcab59-a327-5471-a43a-0eb53f6304f3", "28500.00"),
    "absolute_black": ("5fba772a-c300-509b-b4c7-82c5e3a7f82f", "6800.00"),
    "steel_grey": ("c4b2a80e-9d1b-5138-8138-bbefae9112d3", "5400.00"),
    "honey_onyx": ("000d5e7a-043e-50fb-a79e-f2bfb119b505", "32000.00"),
    "ivory_travertine": ("18091870-0863-5bf3-828b-6811c00628ed", "11800.00"),
    "taj_mahal": ("f5050d29-d686-5416-8445-ed234098f7f5", "24500.00"),
    "rainforest": ("0dcce33c-f276-561a-8e0a-3bb61754f9b7", "9800.00"),
    "silver_grey": ("674791b7-19c6-5098-be9a-5154e7a8a421", "1000.00"),
    "galena": ("3b609029-5b0a-57c4-95de-cdf2df54b94f", "1500.00"),
    "golden_eagle": ("a4c9848d-b4e0-5710-8a84-8153599ce0fc", "1250.00"),
    "bianco_carrara": ("f949147a-8c25-5ce2-a9c6-5db6a1b8ebd7", "1750.00"),
    "sg_vanity": ("99a10c63-b0a1-5fdd-916f-da4eacf788a0", "2000.00"),
    "ge_vanity": ("f2e984e0-7a5b-54e0-93da-0b2e04d14b61", "2250.00"),
}
C = {  # customer_id, name, email, shipping address (prefilled from the customer record)
    "meridian": ("4de49414-e750-5ec3-882a-3fc9c374db1f", "Meridian Architecture Studio", "project1@example.invalid", "Residence project, 12th Main Road, Indiranagar, Bengaluru, 560038"),
    "courtyard": ("02a2b8ef-ba15-5826-9bff-ddc613bc02a3", "Courtyard Villa Project", "project2@example.invalid", "Courtyard Villa site, Sarjapur Road, Bengaluru, 560035"),
    "atrium": ("5ece296a-7e46-51f7-8c6a-bcf3fa2e4934", "Atrium Hospitality Interiors", "project3@example.invalid", "Hotel fit-out site, Whitefield Main Road, Bengaluru, 560066"),
    "northlight": ("f2ad4025-eb9e-5170-a8bd-2612f1537e49", "Northlight Design Studio", "historical-client-1@example.invalid", "Penthouse project, Koramangala 4th Block, Bengaluru, 560034"),
    "garden": ("072c1bb2-cdc9-5510-8bab-88b8e8b4d2b5", "Garden Court Residences", "historical-client-2@example.invalid", "Garden Court Residences Tower B, Hennur Road, Bengaluru, 560043"),
    "crescent": ("08140a22-2652-5132-9f35-36cab181820c", "Crescent Hospitality Design", "historical-client-3@example.invalid", "Resort project site, Nandi Hills Road, Bengaluru, 562103"),
    "terrace": ("92b836f2-a37a-57e7-b5ed-31b80e1fe63c", "Terrace House Interiors", "historical-client-4@example.invalid", "Client residence, Jayanagar 4th Block, Bengaluru, 560011"),
    "pavilion": ("d3c91b26-f87e-553e-8baf-e70e058cbd9d", "Pavilion Commercial Spaces", "historical-client-5@example.invalid", "Pavilion Tech Park Block C lobby, Bellandur, Bengaluru, 560103"),
    "vista": ("3b678dd5-7885-5dbe-8a82-e5bbfad88715", "Vista Residential Projects", "historical-client-6@example.invalid", "Vista Heights site, Bannerghatta Road, Bengaluru, 560076"),
}
S = {  # supplier_id for purchase orders
    "continental": "3535a472-fdf7-5b33-a07f-c393094f12fa",
    "marble_avenue": "8ad2b991-1813-5165-a61c-817984cf5c0b",
}
# (key, customer, date, [(product, qty)], shipping, target state, notes)
ORDERS = [
    ("so-01", "meridian", "2026-10-06", [("calacatta_gold", 4), ("carrara", 6)], "4500.00", "fulfilled", "Kitchen island book-match and master bath flooring."),
    ("so-02", "courtyard", "2026-10-14", [("honey_onyx", 2), ("absolute_black", 8)], "3500.00", "fulfilled", "Backlit onyx bar and granite kitchen counters."),
    ("so-03", "garden", "2026-10-21", [("steel_grey", 20), ("silver_grey", 15)], "6000.00", "fulfilled", "Tower B lobby and staircase treads, phase 1."),
    ("so-04", "vista", "2026-10-28", [("golden_eagle", 18), ("ge_vanity", 2)], "3000.00", "fulfilled", "Show-flat kitchens and two vanity tops."),
    ("so-05", "atrium", "2026-11-03", [("ivory_travertine", 10), ("bianco_carrara", 12)], "5500.00", "approved", "Hotel lobby cladding and washroom vanities; dispatch in two lots."),
    ("so-06", "northlight", "2026-11-05", [("taj_mahal", 3)], "2500.00", "approved", "Penthouse kitchen counters; templating scheduled."),
    ("so-07", "pavilion", "2026-11-07", [("absolute_black", 25), ("steel_grey", 10)], "7500.00", "approved", "Block C lobby flooring and lift-lobby cladding."),
    ("so-08", "crescent", "2026-11-09", [("honey_onyx", 1), ("ivory_travertine", 6)], "4000.00", "pending", "Resort bar front and pool-deck sample lot; awaiting design sign-off."),
    ("so-09", "terrace", "2026-11-10", [("galena", 4), ("sg_vanity", 2)], "1500.00", "pending", "Jayanagar residence bathrooms; client to confirm finish."),
    ("so-10", "meridian", "2026-11-11", [("rainforest", 4)], "2000.00", "pending", "Feature wall for second residence; quote revision 2."),
]
# (key, supplier, date, expected, [(product, qty, unit_cost)], notes)
PURCHASES = [
    ("po-01", "continental", "2026-10-20", "2026-11-04", [("honey_onyx", 6, "24000.00")], "Iranian honey onyx container lot, resin-backed slabs."),
    ("po-02", "marble_avenue", "2026-10-25", "2026-11-08", [("taj_mahal", 6, "18000.00")], "Brazilian Taj Mahal quartzite, 20 mm polished."),
]


def rid(*parts):
    return str(uuid5(NS, ":".join(parts)))


def money(value):
    return str(Decimal(value).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))


def build():
    steps = []
    for key, cust, day, lines, shipping, target, notes in ORDERS:
        cid, name, email, address = C[cust]
        items = [{"line_id": rid(key, "line", str(i)), "product_id": P[p][0], "product_variant_id": None,
                  "quantity": q, "unit_price": P[p][1]} for i, (p, q) in enumerate(lines)]
        subtotal = sum(Decimal(i["unit_price"]) * i["quantity"] for i in items)
        doc_id = rid(key, "create")
        steps.append({"label": key + " create", "command": {"request_id": doc_id, "action": "create_order",
            "reason": "Customer order " + key.upper() + " for " + name, "document": {
                "customer_id": cid, "customer_name": name, "customer_email": email, "customer_address": address,
                "order_date": day, "currency": "INR", "notes": notes + " GST 18% included in tax.",
                "tax": money(subtotal * Decimal("0.18")), "shipping": shipping, "items": items}}})
        alloc = [{"line_id": i["line_id"], "location_id": FACTORY, "quantity": i["quantity"]} for i in items]
        if target in ("approved", "fulfilled"):
            steps.append({"label": key + " approve", "command": {"request_id": rid(key, "approve"), "action": "approve_document",
                "reason": "Credit and stock checked; reserved at Factory Stone Yard Rack A", "document_id": doc_id,
                "expected_revision": 1, "allocations": alloc}})
        if target == "fulfilled":
            steps.append({"label": key + " fulfill", "command": {"request_id": rid(key, "fulfill"), "action": "fulfill_order",
                "reason": "Dispatched to site with delivery challan", "document_id": doc_id,
                "expected_revision": 2, "lines": alloc}})
    for key, sup, day, expected, lines, notes in PURCHASES:
        items = [{"line_id": rid(key, "line", str(i)), "product_id": P[p][0], "product_variant_id": None,
                  "quantity": q, "unit_cost": cost, "supplier_sku": None} for i, (p, q, cost) in enumerate(lines)]
        subtotal = sum(Decimal(i["unit_cost"]) * i["quantity"] for i in items)
        doc_id = rid(key, "create")
        steps.append({"label": key + " create", "command": {"request_id": doc_id, "action": "create_purchase_order",
            "reason": "Replenishment purchase " + key.upper(), "document": {
                "supplier_id": S[sup], "expected_date": expected, "order_date": day, "currency": "INR",
                "notes": notes, "tax": money(subtotal * Decimal("0.18")), "shipping": "8500.00", "items": items}}})
        steps.append({"label": key + " approve", "command": {"request_id": rid(key, "approve"), "action": "approve_document",
            "reason": "Purchase approved by stores manager", "document_id": doc_id, "expected_revision": 1, "allocations": []}})
        steps.append({"label": key + " receive", "command": {"request_id": rid(key, "receive"), "action": "receive_purchase_order",
            "reason": "Received and inspected at Factory Stone Yard", "document_id": doc_id, "expected_revision": 2,
            "lines": [{"line_id": i["line_id"], "location_id": FACTORY, "quantity": i["quantity"]} for i in items]}})
    return steps


TEMPLATE = '''"""TEMPORARY demo seeder (2026-11-12). Replays fixed HMG Stones ledger commands via hmg-stock-ledger-v1.
Idempotent: fixed request IDs replay instead of duplicating. Disable after use."""
ORG = '%(org)s'
STEPS = %(steps)s

def main(params, user_data, sdk_client):
    start = int(params.get('start', 0)) if isinstance(params, dict) else 0
    count = int(params.get('count', 6)) if isinstance(params, dict) else 6
    out = []
    for step in STEPS[start:start + count]:
        try:
            reply = sdk_client.functions.execute('hmg-stock-ledger-v1', params={
                'action': 'command', 'organization_id': ORG, 'command': step['command']}, is_async=False)
            data = reply.get('data') if isinstance(reply, dict) else None
            ok = isinstance(data, dict) and data.get('ok') is True
            out.append({'step': step['label'], 'ok': ok, 'code': data.get('code') if isinstance(data, dict) else None,
                        'replay': data.get('replay') if isinstance(data, dict) else None,
                        'sequence': (data.get('state') or {}).get('sequence') if isinstance(data, dict) else None})
            if not ok:
                break
        except Exception as error:
            out.append({'step': step['label'], 'ok': False, 'error': str(error)[:200]})
            break
    return {'total_steps': len(STEPS), 'start': start, 'results': out}
'''

if __name__ == "__main__":
    steps = build()
    root = Path(__file__).resolve().parents[2]
    code = TEMPLATE % {"org": ORG, "steps": repr(steps)}
    compile(code, "<seed>", "exec")
    (root / ".cache" / "seed-orders-function.py").write_text(code, encoding="utf-8")
    print(json.dumps({"steps": len(steps), "bytes": len(code)}))
