# Data Model

The central rule: **never duplicate concepts** across modules.

## Core entities

| Entity | Schema table | Notes |
| ------ | ------------ | ----- |
| Tenant | `tenant` | Top-level owner of all data |
| OrganizationUnit | `organization_unit` | Hierarchy node (group, BU, dept, branch, warehouse, team, project) |
| LegalEntity | `legal_entity` | Company/subsidiary with country & default currency |
| Location | `location` | Physical place; can be a warehouse |
| Party | `party` | Person or organization |
| PartyRole | `party_role` | customer / supplier / partner / employee / lead / contact / vendor |
| Contact | `contact` | A counterparty person |
| Employee | `employee` | An employee of the operating org |
| Product | `product` | Canonical catalog item |
| ProductConfig | `product_config` | sellable / stockable / service / accounting hooks |
| PriceList / PriceListEntry | `price_list(_entry)` | Pricing per context |
| User | `app_user` | Login identity |
| Role / UserRole | `role` / `user_role` | RBAC + scoping |
| Invoice / InvoiceLine | `invoice(_line)` | Universal invoice |
| Payment | `payment` | Payment against an invoice |
| Account / Transaction | `account` / `transaction` | General ledger hooks |
| Quote / SalesOrder / Lead / Opportunity | crm tables | Sales lifecycle |
| InventoryItem / StockMovement | inventory tables | Stock per product/location |
| PurchaseOrder | `purchase_order` | Procurement |
| PosOrder | `pos_order` | Point of sale |
| WorkflowDefinition / Instance | `workflow_*` | Reusable engine |
| AuditLog | `audit_log` | Immutable trail |
| Document / FileRef | `document` / `file_ref` | Centralized docs |
| Notification | `notification` | Notification hub |

## Why Party instead of Customer tables

Consider three modules that need "a customer": CRM, helpdesk, POS. If each made
its own `Customer`, keeping them in sync is a nightmare. BUSINEX has one `party`
table; each module adds a `party_role` entry instead. A single Party can be a
customer to Sales, a supplier to Procurement, and an employee to HR — without
any duplication.

## Why Product instead of Product tables

Sales needs `isSellable`, POS needs `isService`, Inventory needs `isStockable`,
Procurement needs a supplier. BUSINEX keeps one `product` row and one
`product_config` row with additive flags rather than N product tables.
