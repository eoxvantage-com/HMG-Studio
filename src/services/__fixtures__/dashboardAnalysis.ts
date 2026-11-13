import type { Analysis } from "../dashboardAnalysis";

const m = (label: string, kind: "count" | "money" | "percent" | "days", value: string | null) => ({ label, kind, value });

/** Shape of hmg-dashboard-v1 `analysis` (v8), trimmed from a real response. */
export function analysisFixture(): Analysis {
  return {
    targets: { delivery_days: 7, approval_days: 2, return_days: 3 },
    status: "watch",
    segments: [
      { key: "orders", label: "Orders", value: m("Open orders", "count", "6"), caption: "open orders", status: "good", link: "/orders", metrics: [m("Open order value", "money", "717430.00"), m("Waiting for approval", "count", "2")] },
      { key: "fulfilment", label: "Fulfilment", value: m("Fill rate", "percent", "71.3"), caption: "of confirmed units shipped", status: "watch", link: "/orders", metrics: [m("Units confirmed", "count", "223"), m("Units shipped", "count", "159")] },
      { key: "delivery", label: "Days to deliver", value: m("Average", "days", null), caption: "average · target 7 days", status: "watch", link: "/orders", metrics: [m("Late orders", "count", "2"), m("Orders measured", "count", "0"), m("Backfilled, not measured", "count", "14")] },
      { key: "returns", label: "Returns", value: m("Return rate", "percent", "0.0"), caption: "of shipped units returned", status: "good", link: "/returns", metrics: [m("Pending returns", "count", "1")] },
      { key: "stock", label: "Stock health", value: m("Out of stock", "count", "5"), caption: "products out of stock", status: "watch", link: "/replenishment", metrics: [m("Low stock", "count", "3")] },
      { key: "inventory", label: "Inventory", value: m("Value at selling price", "money", "2773350.00"), caption: "at selling price", status: "good", link: "/stock-by-warehouse", metrics: [m("Value at cost", "money", "1890400.00"), m("Reserved share", "percent", "17.3")] },
      { key: "purchasing", label: "Purchasing", value: m("Open purchase orders", "count", "1"), caption: "open purchase orders", status: "good", link: "/purchase-orders", metrics: [m("Overdue deliveries", "count", "0")] },
      { key: "alerts", label: "Alerts", value: m("Open alerts", "count", "3"), caption: "need attention", status: "risk", link: "/", metrics: [m("Critical", "count", "1"), m("Warnings", "count", "1"), m("For information", "count", "1")] },
    ],
    alerts: [
      { severity: "critical", kind: "purchase_overdue", title: "PO-a1b2c3d4-0000-4000-8000-1234567890ab delivery overdue", detail: "Continental Stone Trading · expected 2026-11-08, 5 days late", link: "/purchase-orders/show/po1?organization=org", age_days: 5 },
      { severity: "warning", kind: "late_shipment", title: "SO-b0646aef-4672-5715-8cc8-43e3e77b0c59 not shipped", detail: "Atrium Hospitality Interiors · 10 days since order (target 7)", link: "/orders/show/b0646aef-4672-5715-8cc8-43e3e77b0c59?organization=org", age_days: 10 },
      { severity: "info", kind: "low_stock", title: "3 products at or below minimum", detail: "Honey Onyx Slab", link: "/replenishment", age_days: 0 },
    ],
    alert_counts: { critical: 1, warning: 1, info: 1 },
    trend: [
      { month: "2026-06", revenue: "140222.00", orders: 2, units_shipped: 22, units_returned: 0 },
      { month: "2026-07", revenue: "229834.00", orders: 3, units_shipped: 23, units_returned: 0 },
      { month: "2026-08", revenue: "168036.00", orders: 2, units_shipped: 15, units_returned: 0 },
      { month: "2026-09", revenue: "131602.00", orders: 3, units_shipped: 24, units_returned: 0 },
      { month: "2026-10", revenue: "556732.00", orders: 4, units_shipped: 75, units_returned: 0 },
      { month: "2026-11", revenue: "0.00", orders: 6, units_shipped: 0, units_returned: 2 },
    ],
    delivery: {
      samples: 0, excluded: 14, average_days: null, median_days: null, on_time_rate: null,
      buckets: ["0-2 days", "3-5 days", "6-7 days", "8-14 days", "15+ days"].map(label => ({ label, count: 0 })),
      late: [{ id: "b0646aef-4672-5715-8cc8-43e3e77b0c59", organization_id: "org", number: "SO-b0646aef-4672-5715-8cc8-43e3e77b0c59", customer: "Atrium Hospitality Interiors", age_days: 10, total: "169520.00" }],
    },
    top_products: [{ id: "p1", name: "Carrara White Slab", units: 14, revenue: "175000.00" }],
    shortfalls: [],
    capacity: { used: 61, max: 200 },
    basis: "Ledger documents, return requests and stock bins.",
  };
}
