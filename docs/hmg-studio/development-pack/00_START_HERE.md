# HMG-Studio: Complete Taruvi + Python Development Pack

> **Binding target:** React/TypeScript + existing Refine template; Taruvi-native datatables, storage and authentication/access controls; **Python backend services**. **No Laravel, PHP runtime, Eloquent, Artisan or separate Supabase backend.** PHP/Vue excerpts below explain the old product only. The Python hosting model and Taruvi transaction/API capabilities must be verified before implementation.

This folder is the modular replacement for the large Inventoros handoff. It includes a separate specification for **every one of the 20 visible sidebar modules**, plus administration, account, integrations, portal, operations and replenishment. Each module contains its exact audited contracts—not merely a generic feature checklist.

## Start here

1. [Architecture: Taruvi + Python, no Laravel](01_ARCHITECTURE_TARUVI_PYTHON.md)
2. [Phased execution plan](02_EXECUTION_PLAN.md)
3. [Schema and service contract gates](03_SCHEMA_AND_SERVICE_CONTRACTS.md)
4. [End-to-end acceptance](04_END_TO_END_ACCEPTANCE.md)
5. [Persistent parity/resume ledger](05_PARITY_AND_RESUME_LEDGER.md)
6. [Copyable agent execution prompt](06_AGENT_EXECUTION_PROMPT.md)
7. [Evidence and limitations](07_EVIDENCE_AND_LIMITATIONS.md)

## Screenshot sidebar modules — all required

| Module | Specification | Source page count |
|---|---|---|
| Dashboard | [10_dashboard.md](modules/10_dashboard.md) | 1 |
| Inventory / Products | [11_inventory.md](modules/11_inventory.md) | 6 |
| Orders, Payments and Documents | [12_orders.md](modules/12_orders.md) | 4 |
| Customers | [13_customers.md](modules/13_customers.md) | 4 |
| Returns / RMA | [14_returns.md](modules/14_returns.md) | 4 |
| Purchase Orders | [15_purchase_orders.md](modules/15_purchase_orders.md) | 5 |
| Suppliers | [16_suppliers.md](modules/16_suppliers.md) | 4 |
| Approvals | [17_approvals.md](modules/17_approvals.md) | 1 |
| Categories | [18_categories.md](modules/18_categories.md) | 1 |
| Locations | [19_locations.md](modules/19_locations.md) | 1 |
| Warehouses | [20_warehouses.md](modules/20_warehouses.md) | 4 |
| Stock Adjustments | [21_stock_adjustments.md](modules/21_stock_adjustments.md) | 3 |
| Stock by Warehouse | [22_stock_by_warehouse.md](modules/22_stock_by_warehouse.md) | 1 |
| Stock Transfers | [23_stock_transfers.md](modules/23_stock_transfers.md) | 3 |
| Stock Audits and Cycle Counts | [24_stock_audits.md](modules/24_stock_audits.md) | 7 |
| Work Orders / Assembly | [25_work_orders.md](modules/25_work_orders.md) | 3 |
| Reservations | [26_reservations.md](modules/26_reservations.md) | 1 |
| Import / Export | [27_import_export.md](modules/27_import_export.md) | 1 |
| Reports, Builder and Schedules | [28_reports.md](modules/28_reports.md) | 17 |
| Activity Log | [29_activity_log.md](modules/29_activity_log.md) | 1 |

## Additional required surfaces and nested workflows

These were source-inventoried even when not visible in the screenshot. Native equivalents require an explicit parity decision; they are not optional omissions.

| Module | Specification | Source page count |
|---|---|---|
| Admin Users | [30_users.md](modules/30_users.md) | 4 |
| Roles and Permission Sets | [31_roles_permissions.md](modules/31_roles_permissions.md) | 4 |
| Authentication, Profile and Account | [32_auth_account.md](modules/32_auth_account.md) | 14 |
| Organization, Email and Preferences | [33_organization_settings.md](modules/33_organization_settings.md) | 5 |
| Notifications | [34_notifications.md](modules/34_notifications.md) | 1 |
| Shipping and Carrier Services | [35_shipping.md](modules/35_shipping.md) | 1 |
| Storage, Uploads and Downloads | [36_storage.md](modules/36_storage.md) | 1 |
| API Tokens, Webhooks and External Interfaces | [37_api_webhooks.md](modules/37_api_webhooks.md) | 3 |
| Customer Portal | [38_customer_portal.md](modules/38_customer_portal.md) | 10 |
| Extensions, Plugins and Tax Documents | [39_plugins_tax.md](modules/39_plugins_tax.md) | 1 |
| Provisioning, Updates, Backups and Recovery | [40_operations.md](modules/40_operations.md) | 6 |
| Replenishment and Reorder Policies | [41_replenishment.md](modules/41_replenishment.md) | 1 |

## Shared evidence — read relevant owners, do not duplicate

- [inventory.md](shared/inventory.md)
- [commerce.md](shared/commerce.md)
- [platform.md](shared/platform.md)
- [platform-source-catalog.md](shared/platform-source-catalog.md)
- [shared-gaps.md](shared/shared-gaps.md)
- [additional-contracts.md](shared/additional-contracts.md)

## How to use the pack

Give the **whole folder or ZIP** to the development agent, not only one module file. Tell it to start with `06_AGENT_EXECUTION_PROMPT.md`, complete Phase 0, then execute the sequence. Root files define the target; modules define behavior; shared files own common contracts; the ledger prevents skipped work.

**Source coverage is not implementation completion.** All target implementation and runtime acceptance start pending. This pack does not authorize creating records or changing your apps in the current documentation task.

Large module files intentionally retain exact field/validation/source evidence. Read the module index first, then retrieve the needed section; do not discard the detailed evidence to fit a summary into context.