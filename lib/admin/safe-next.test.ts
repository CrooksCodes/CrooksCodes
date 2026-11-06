import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it.each([
    ["/admin", "/admin"],
    ["/admin/money", "/admin/money"],
    ["/admin/clients/abc?tab=1", "/admin/clients/abc?tab=1"],
  ])("keeps %s", (input, expected) => {
    expect(safeNext(input)).toBe(expected);
  });

  it.each([
    "//evil.com",
    "/\\evil.com",
    "/\\/evil.com",
    "\\\\evil.com",
    "/%5Cevil.com",
    "/%2F%2Fevil.com",
    "/%2f/evil.com",
    "https://evil.com/admin",
    "http:/evil.com",
    "javascript:alert(1)",
    "/admin\t/x",
    "/admin\n/x",
    "/admin%0d%0aSet-Cookie:x",
    "/",
    "/about",
    "/administrator",
    "/admin/../about",
    "/admin/%2e%2e/about",
    "/admin/login",
    "/admin/mfa?next=/admin",
    "admin",
    "",
    "/admin/" + "a".repeat(600),
  ])("rejects %j", (input) => {
    expect(safeNext(input)).toBe("/admin");
  });

  it("rejects non-strings", () => {
    expect(safeNext(null)).toBe("/admin");
    expect(safeNext(undefined)).toBe("/admin");
    expect(safeNext(["/admin/money"])).toBe("/admin");
  });

  it("drops the hash", () => {
    expect(safeNext("/admin/money#x")).toBe("/admin/money");
  });
});
