"""Build (never write) the opening ledger event for the HMG synthetic workspace.

Opening balances are the verified native product_location_stocks rows read on
2026-11-12, plus zero-quantity bins at every active location so transfers and
returns have a registered destination. Output: the native row and its pinned hash.
"""
import json
import sys
from pathlib import Path
from uuid import UUID, uuid5

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "functions"))
import stock_ledger_domain as domain  # noqa: E402

ORG = "913d46eb-585d-5a5c-b1d4-b9d22052a8d6"
ROW_NAMESPACE = UUID("e22d81ca-1ba9-5ce9-a314-77abc7696203")  # same as stock_ledger.event_row
FACTORY, SHOWROOM, DISPATCH = ("8ef60f84-c37d-5855-a14d-5ba0731fceab",
                               "fe8df783-41fc-5905-ae9a-f3311669c0f0",
                               "69a67d61-71bc-581b-8bb9-86475f4dd1a0")
# product_id -> {location_id: quantity} from native product_location_stocks.
STOCK = {
    "3462e7e3-65f5-5437-855f-0cd756834762": {FACTORY: 48},            # Carrara White
    "4efcab59-a327-5471-a43a-0eb53f6304f3": {FACTORY: 18},            # Calacatta Gold
    "5fba772a-c300-509b-b4c7-82c5e3a7f82f": {FACTORY: 85},            # Absolute Black
    "c4b2a80e-9d1b-5138-8138-bbefae9112d3": {FACTORY: 62},            # Steel Grey
    "000d5e7a-043e-50fb-a79e-f2bfb119b505": {FACTORY: 7},             # Honey Onyx
    "18091870-0863-5bf3-828b-6811c00628ed": {FACTORY: 24},            # Ivory Travertine
    "f5050d29-d686-5416-8445-ed234098f7f5": {FACTORY: 9},             # Taj Mahal
    "0dcce33c-f276-561a-8e0a-3bb61754f9b7": {FACTORY: 36},            # Rainforest Green
    "674791b7-19c6-5098-be9a-5154e7a8a421": {FACTORY: 48, SHOWROOM: 3},  # Silver Grey
    "3b609029-5b0a-57c4-95de-cdf2df54b94f": {FACTORY: 49, SHOWROOM: 3},  # Calacatta Galena
    "a4c9848d-b4e0-5710-8a84-8153599ce0fc": {FACTORY: 54, SHOWROOM: 3},  # Golden Eagle
    "f949147a-8c25-5ce2-a9c6-5db6a1b8ebd7": {FACTORY: 58, SHOWROOM: 3},  # Bianco Carrara
    "99a10c63-b0a1-5fdd-916f-da4eacf788a0": {FACTORY: 5},             # Silver Grey Vanity
    "f2e984e0-7a5b-54e0-93da-0b2e04d14b61": {FACTORY: 3},             # Golden Eagle Vanity
    "88b1d3f2-a94f-5464-9e8f-82d34308b2c5": {},                       # Carrara Vanity (0)
}


def build():
    balances = []
    for product, bins in STOCK.items():
        for location in (FACTORY, SHOWROOM, DISPATCH):
            balances.append({"product_id": product, "location_id": location,
                             "quantity": bins.get(location, 0), "reserved": 0})
    balances.sort(key=lambda b: (b["product_id"], b["location_id"]))
    request_id = str(uuid5(ROW_NAMESPACE, ORG + ":opening-20261112"))
    event = domain.opening_event(ORG, request_id, balances, [], "verified-opening-balance-20261112")
    row = {"id": str(uuid5(ROW_NAMESPACE, ORG + ":" + request_id)), "organization_id": ORG,
           "sequence": 0, "predecessor_key": ORG + ":GENESIS", "request_key": ORG + ":" + request_id,
           "event": event, "created_at": "2026-11-12T12:30:00+00:00"}
    domain.project([event], ORG)  # verifies the genesis replays cleanly
    return row


if __name__ == "__main__":
    row = build()
    out = ROOT.parent / ".cache" / "synthetic-ledger-genesis.json"
    out.write_text(json.dumps(row, separators=(",", ":")), encoding="utf-8")
    print(json.dumps({"event_hash": row["event"]["event_hash"], "bins": len(row["event"]["command"]["balances"]),
                      "units": sum(b["quantity"] for b in row["event"]["command"]["balances"]), "bytes": out.stat().st_size}))
