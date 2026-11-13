"""Delivery dates for the 14 fulfilled HMG Stones ledger sales orders (requested 13 Nov 2026).

The ledger records when a shipment was entered, not when it reached the customer. For orders
entered after the fact, these rows give each one a delivery date so delivery-time reporting has
history. Every row is source='backfill' and says so in its notes. Output: .cache/order-deliveries.json
"""
import json, sys
from datetime import date, timedelta
from pathlib import Path
from uuid import UUID, uuid5
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build_ledger_seed_orders as seed  # noqa: E402
import build_ledger_history_orders as history  # noqa: E402

ORG = seed.ORG
NS = UUID("5d1c0f7e-2b6a-5e9d-8f13-20261113d0e1")
# Days from order date to delivery, chosen per order (stone slabs: templating + dispatch).
DAYS = {"hist-01": 5, "hist-02": 9, "hist-03": 4, "hist-04": 6, "hist-05": 3, "hist-06": 8, "hist-07": 11,
        "hist-08": 5, "hist-09": 7, "hist-10": 6, "so-01": 6, "so-02": 10, "so-03": 4, "so-04": 5}
NOTE = "Backfilled delivery date (entered 13 Nov 2026) for reporting history; not a carrier record."

def rows():
    out = []
    orders = [(k, d, history.rid(k, "create")) for k, _c, d, *_ in history.ORDERS]
    orders += [(k, d, seed.rid(k, "create")) for k, _c, d, _l, _s, target, _n in seed.ORDERS if target == "fulfilled"]
    for key, day, doc_id in orders:
        ordered = date.fromisoformat(day); delivered = ordered + timedelta(days=DAYS[key])
        assert delivered <= date(2026, 11, 13)
        out.append({"id": str(uuid5(NS, ORG + ":" + doc_id)), "organization_id": ORG, "document_id": doc_id,
                    "order_number": "SO-" + doc_id, "order_date": day,
                    "shipped_on": (delivered - timedelta(days=1)).isoformat(), "delivered_on": delivered.isoformat(),
                    "source": "backfill", "notes": NOTE})
    return out

if __name__ == "__main__":
    data = rows()
    (Path(__file__).resolve().parents[2] / ".cache" / "order-deliveries.json").write_text(json.dumps(data, indent=1), encoding="utf-8")
    days = [DAYS[k] for k in DAYS]
    print(len(data), "rows; average", round(sum(days) / len(days), 1), "days; on time", sum(d <= 7 for d in days))
