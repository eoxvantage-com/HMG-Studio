import { describe, expect, it } from "vitest";
import { ERP_MODULES, buildErpResources } from "./modules";
describe("complete ERP navigation", () => {
  it("does not advertise missing category form or detail routes", () => {
    const category=buildErpResources().find(item=>item.identifier==="categories")!;
    expect(category.list).toBe("/categories");
    expect(category).not.toHaveProperty("create");
    expect(category).not.toHaveProperty("edit");
    expect(category).not.toHaveProperty("show");
    expect(buildErpResources().find(item=>item.identifier==="inventory")?.create).toBe("/inventory/create");
  });
  it("keeps all 32 specified modules reachable without duplicate routes", () => {
    expect(ERP_MODULES).toHaveLength(32);
    expect(new Set(ERP_MODULES.map(item => item.path)).size).toBe(32);
    expect(ERP_MODULES.map(item => item.label)).toEqual(expect.arrayContaining(["Dashboard","Inventory","Orders","Stock Transfers","Customer Portal","Operations"]));
    expect(ERP_MODULES.find(item => item.key === "account")?.path).toBe("/settings/account");
  });
  it("registers personal notifications as read-only rather than advertising unavailable mutations", () => {
    const item = buildErpResources().find(resource => resource.identifier === "notifications")!;
    expect(item.show).toBe("/notifications/show/:id");
    expect(item).not.toHaveProperty("create"); expect(item).not.toHaveProperty("edit");
    expect(item.meta?.canDelete).toBe(false);
  });
});
