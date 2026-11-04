import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requireVerifiedAdminSession } from "@/lib/admin-session.server";

const mocks = vi.hoisted(() => ({ authorization: "", getUser: vi.fn() }));
vi.mock("@tanstack/react-start/server", () => ({ getRequest: () => new Request("https://shtemarm.example", {headers:{authorization:mocks.authorization}}) }));
vi.mock("@/integrations/supabase/client.server", () => ({ supabaseAdmin: {auth:{getUser:mocks.getUser}} }));
beforeEach(() => {
  vi.stubEnv("ADMIN_ALLOWED_USER_IDS", "");
  mocks.authorization = "Bearer " + "a".repeat(40);
  mocks.getUser.mockReset().mockResolvedValue({data:{user:{id:"owner"}},error:null});
});
afterEach(() => vi.unstubAllEnvs());

describe("server-verified admin identity", () => {
  it.each(["", "Basic secret", "Bearer short"])("rejects missing or malformed credentials before contacting Auth: %s", async token => {
    mocks.authorization = token;
    await expect(requireVerifiedAdminSession()).rejects.toThrow("unauthorized");
    expect(mocks.getUser).not.toHaveBeenCalled();
  });
  it("rejects an expired or forged session even if it looks like a token", async () => {
    mocks.getUser.mockResolvedValue({data:{user:null},error:{message:"expired"}});
    await expect(requireVerifiedAdminSession()).rejects.toThrow("unauthorized");
  });
  it("uses the Auth-verified identity and applies the configured admin allowlist", async () => {
    await expect(requireVerifiedAdminSession()).resolves.toBe("owner");
    expect(mocks.getUser).toHaveBeenCalledWith("a".repeat(40));
    vi.stubEnv("ADMIN_ALLOWED_USER_IDS", "different-admin");
    await expect(requireVerifiedAdminSession()).rejects.toThrow("unauthorized");
    vi.stubEnv("ADMIN_ALLOWED_USER_IDS", "second-admin, owner");
    await expect(requireVerifiedAdminSession()).resolves.toBe("owner");
  });
});
