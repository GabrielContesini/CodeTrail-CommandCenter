import { describe, expect, it } from "vitest";
import { canEditOps, canManageAdmins } from "@/lib/auth";

describe("auth role helpers", () => {
  it("allows owners, admins and operators to edit operational data", () => {
    expect(canEditOps("owner")).toBe(true);
    expect(canEditOps("admin")).toBe(true);
    expect(canEditOps("operator")).toBe(true);
    expect(canEditOps("viewer")).toBe(false);
  });

  it("allows only owners to manage admins", () => {
    expect(canManageAdmins("owner")).toBe(true);
    expect(canManageAdmins("admin")).toBe(false);
    expect(canManageAdmins("operator")).toBe(false);
    expect(canManageAdmins("viewer")).toBe(false);
  });
});
