export type Role = "owner" | "admin" | "manager" | "buyer" | "planner" | "viewer";

export const ROLES: Role[] = ["owner", "admin", "manager", "buyer", "planner", "viewer"];

export type Permission =
  | "org.manage"
  | "members.manage"
  | "products.read" | "products.write"
  | "suppliers.read" | "suppliers.write"
  | "warehouses.read" | "warehouses.write"
  | "inventory.read" | "inventory.write"
  | "purchasing.read" | "purchasing.write"
  | "shipments.inbound.read" | "shipments.inbound.write"
  | "orders.read" | "orders.write"
  | "shipments.outbound.read" | "shipments.outbound.write"
  | "planning.read" | "planning.write"
  | "reports.read"
  | "collaboration.write"
  | "audit.read";

export const ROLE_PERMISSIONS: Record<Role, Permission[] | "*"> = {
  owner: "*",
  admin: [
    "org.manage", "members.manage",
    "products.read", "products.write",
    "suppliers.read", "suppliers.write",
    "warehouses.read", "warehouses.write",
    "inventory.read", "inventory.write",
    "purchasing.read", "purchasing.write",
    "shipments.inbound.read", "shipments.inbound.write",
    "orders.read", "orders.write",
    "shipments.outbound.read", "shipments.outbound.write",
    "planning.read", "planning.write",
    "reports.read",
    "collaboration.write",
    "audit.read"
  ],
  manager: [
    "products.read", "products.write",
    "suppliers.read",
    "warehouses.read", "warehouses.write",
    "inventory.read", "inventory.write",
    "purchasing.read",
    "shipments.inbound.read", "shipments.inbound.write",
    "orders.read", "orders.write",
    "shipments.outbound.read", "shipments.outbound.write",
    "planning.read",
    "reports.read",
    "collaboration.write"
  ],
  buyer: [
    "products.read", "products.write",
    "suppliers.read", "suppliers.write",
    "warehouses.read",
    "inventory.read",
    "purchasing.read", "purchasing.write",
    "shipments.inbound.read", "shipments.inbound.write",
    "orders.read",
    "planning.read", "planning.write",
    "reports.read",
    "collaboration.write"
  ],
  planner: [
    "products.read", "products.write",
    "suppliers.read",
    "warehouses.read",
    "inventory.read",
    "purchasing.read",
    "shipments.inbound.read",
    "orders.read",
    "planning.read", "planning.write",
    "reports.read",
    "collaboration.write"
  ],
  viewer: [
    "products.read", "suppliers.read", "warehouses.read", "inventory.read",
    "purchasing.read", "shipments.inbound.read", "orders.read",
    "shipments.outbound.read", "planning.read", "reports.read"
  ]
};

export function hasPermission(role: Role, permission: Permission): boolean {
  const granted = ROLE_PERMISSIONS[role];
  return granted === "*" || granted.includes(permission);
}

export function canWriteModule(role: Role, module: string): boolean {
  return hasPermission(role, `${module}.write` as Permission);
}
