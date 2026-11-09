import type { IResourceItem } from "@refinedev/core";

export type ErpModule = {
  key: string; label: string; path: string;
  group: "Workspace" | "Catalog" | "Stock" | "Insights" | "Admin" | "Integrations";
  resource?: string;
  kind: "data" | "dashboard" | "platform" | "workflow";
  description: string;
};
export const ERP_MODULES: ErpModule[] = [
  {key:"dashboard",label:"Dashboard",path:"/",group:"Workspace",kind:"dashboard",description:"Inventory, sales and purchasing overview."},
  {key:"inventory",label:"Inventory",path:"/inventory",group:"Workspace",resource:"products",kind:"data",description:"Natural stone slabs, finishes, variants and replenishment."},
  {key:"orders",label:"Orders",path:"/orders",group:"Workspace",resource:"orders",kind:"workflow",description:"Customer orders, payments and documents."},
  {key:"customers",label:"Customers",path:"/customers",group:"Workspace",resource:"customers",kind:"data",description:"Architects, project buyers and customer accounts."},
  {key:"returns",label:"Returns",path:"/returns",group:"Workspace",resource:"return_orders",kind:"workflow",description:"Returns, inspections, refunds and restocking."},
  {key:"purchase-orders",label:"Purchase Orders",path:"/purchase-orders",group:"Workspace",resource:"purchase_orders",kind:"workflow",description:"Supplier purchasing and receiving."},
  {key:"suppliers",label:"Suppliers",path:"/suppliers",group:"Workspace",resource:"suppliers",kind:"data",description:"Quarries, stone suppliers and purchasing contacts."},
  {key:"approvals",label:"Approvals",path:"/approvals",group:"Workspace",kind:"workflow",description:"Read-only pending sales, purchasing, transfer and adjustment approval records."},
  {key:"categories",label:"Categories",path:"/categories",group:"Catalog",resource:"product_categories",kind:"data",description:"Marble, granite, onyx and other stone families."},
  {key:"locations",label:"Locations",path:"/locations",group:"Catalog",resource:"product_locations",kind:"data",description:"Yards, aisles, racks and slab storage locations."},
  {key:"warehouses",label:"Warehouses",path:"/warehouses",group:"Catalog",resource:"warehouses",kind:"data",description:"Factory, showroom and experience-centre inventory."},
  {key:"stock-adjustments",label:"Stock Adjustments",path:"/stock-adjustments",group:"Stock",resource:"stock_adjustments",kind:"workflow",description:"Stock correction requests and committed movement history."},
  {key:"stock-by-warehouse",label:"Stock by warehouse",path:"/stock-by-warehouse",group:"Stock",resource:"product_location_stocks",kind:"workflow",description:"Inventory across warehouses and storage locations."},
  {key:"stock-transfers",label:"Stock Transfers",path:"/stock-transfers",group:"Stock",resource:"stock_transfers",kind:"workflow",description:"Move stone between yards, warehouses and showrooms."},
  {key:"stock-audits",label:"Stock Audits",path:"/stock-audits",group:"Stock",resource:"stock_audits",kind:"workflow",description:"Cycle counts, discrepancy reviews and reconciliation."},
  {key:"work-orders",label:"Work Orders",path:"/work-orders",group:"Stock",resource:"work_orders",kind:"workflow",description:"Stone fabrication, component consumption and finished output."},
  {key:"reservations",label:"Reservations",path:"/reservations",group:"Stock",resource:"stock_reservations",kind:"workflow",description:"Stock allocated to projects and customer orders."},
  {key:"replenishment",label:"Replenishment",path:"/replenishment",group:"Stock",resource:"warehouse_reorder_points",kind:"workflow",description:"Reorder points, suppliers and replenishment policies."},
  {key:"import-export",label:"Import / Export",path:"/import-export",group:"Insights",resource:"data_exports",kind:"workflow",description:"Validated import previews and export history."},
  {key:"reports",label:"Reports",path:"/reports",group:"Insights",resource:"saved_reports",kind:"data",description:"Saved reports, report builder and delivery schedules."},
  {key:"activity-log",label:"Activity Log",path:"/activity-log",group:"Insights",resource:"activity_logs",kind:"data",description:"Auditable business changes and operation history."},
  {key:"users",label:"Users",path:"/users",group:"Admin",kind:"platform",description:"Native Taruvi user management."},
  {key:"roles",label:"Roles & Permissions",path:"/roles",group:"Admin",kind:"platform",description:"Native Taruvi roles and permission sets."},
  {key:"organization",label:"Organization Settings",path:"/organization",group:"Admin",resource:"organizations",kind:"data",description:"Organization profile, currencies and preferences."},
  {key:"notifications",label:"Notifications",path:"/notifications",group:"Admin",resource:"notifications",kind:"data",description:"Operational notifications and delivery preferences."},
  {key:"account",label:"My Account",path:"/settings/account",group:"Admin",kind:"platform",description:"Your native date, time and timezone preferences."},
  {key:"operations",label:"Operations",path:"/operations",group:"Admin",resource:"inventory_reset_runs",kind:"platform",description:"System health, schedules and controlled operations."},
  {key:"shipping",label:"Shipping",path:"/shipping",group:"Integrations",resource:"shipments",kind:"workflow",description:"Shipments, labels and tracking."},
  {key:"storage",label:"File Storage",path:"/storage",group:"Integrations",kind:"platform",description:"Native Taruvi buckets and protected documents."},
  {key:"api-webhooks",label:"API & Webhooks",path:"/api-webhooks",group:"Integrations",resource:"webhooks",kind:"data",description:"Integration subscriptions and delivery history."},
  {key:"customer-portal",label:"Customer Portal",path:"/customer-portal",group:"Integrations",resource:"customer_contacts",kind:"platform",description:"Customer contacts, invitations and portal access."},
  {key:"plugins",label:"Plugins & Tax",path:"/plugins",group:"Integrations",resource:"plugins",kind:"platform",description:"Installed integrations, plugins and tax configuration."},
];
export const getErpModule = (key: string) => ERP_MODULES.find(module => module.key === key);
export const buildErpResources = (): IResourceItem[] => ERP_MODULES.filter(module => module.resource).map(module => ({
  name: module.resource!, identifier: module.key, list: module.path,
  ...(module.key === "categories" ? {} : module.key === "notifications" ? { show: `${module.path}/show/:id` } : {
    create: `${module.path}/create`, edit: `${module.path}/edit/:id`, show: `${module.path}/show/:id`,
  }),
  meta: { label: module.label, aclResource: `datatable:${module.resource}`, canDelete: false },
}));
