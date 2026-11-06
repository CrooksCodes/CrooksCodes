import { describe, expect, it } from "vitest";
import { readAdminEnv } from "./env";

const jwt = (payload: object) =>
  ["e30", Buffer.from(JSON.stringify(payload)).toString("base64url"), "sig"].join(".");

const OK = {
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc",
  ADMIN_OWNER_USER_ID: "11111111-2222-4333-8444-555555555555",
} as unknown as NodeJS.ProcessEnv;

describe("readAdminEnv fails closed", () => {
  it("accepts a complete config", () => {
    expect(readAdminEnv(OK)).toEqual({
      supabaseUrl: OK.SUPABASE_URL,
      supabaseKey: OK.SUPABASE_PUBLISHABLE_KEY,
      ownerId: OK.ADMIN_OWNER_USER_ID,
    });
  });

  it("accepts a legacy anon JWT", () => {
    expect(readAdminEnv({ ...OK, SUPABASE_PUBLISHABLE_KEY: jwt({ role: "anon" }) })).not.toBeNull();
  });

  it.each(["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "ADMIN_OWNER_USER_ID"])("refuses when %s is missing", (key) => {
    expect(readAdminEnv({ ...OK, [key]: undefined })).toBeNull();
    expect(readAdminEnv({ ...OK, [key]: "   " })).toBeNull();
  });

  it("refuses a malformed owner id", () => {
    expect(readAdminEnv({ ...OK, ADMIN_OWNER_USER_ID: "jeremy" })).toBeNull();
  });

  it("refuses plain http to a remote host", () => {
    expect(readAdminEnv({ ...OK, SUPABASE_URL: "http://example.supabase.co" })).toBeNull();
    expect(readAdminEnv({ ...OK, SUPABASE_URL: "not a url" })).toBeNull();
  });

  it("refuses keys that would bypass RLS", () => {
    expect(readAdminEnv({ ...OK, SUPABASE_PUBLISHABLE_KEY: "sb_secret_abc" })).toBeNull();
    expect(readAdminEnv({ ...OK, SUPABASE_PUBLISHABLE_KEY: jwt({ role: "service_role" }) })).toBeNull();
  });
});
