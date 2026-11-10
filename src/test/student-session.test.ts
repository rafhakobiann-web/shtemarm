import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { verifiedStudentId } from "@/lib/student-session.server";

const state = vi.hoisted(() => ({ header: "", getUser: vi.fn() }));
vi.mock("@tanstack/react-start/server", () => ({
  getRequest: () => new Request("https://shtemarm.example", {
    headers: state.header ? { authorization: state.header } : {},
  }),
}));
vi.mock("@/integrations/supabase/client.server", () => ({
  supabaseAdmin: { auth: { getUser: state.getUser } },
}));
beforeEach(() => {
  state.header = "Bearer " + "a".repeat(40);
  state.getUser.mockReset().mockResolvedValue({ data: { user: { id: "student-a" } }, error: null });
});
afterEach(() => vi.restoreAllMocks());

describe("authenticated student server session", () => {
  it.each(["", "Bearer short", "Basic aaa"])("rejects unauthenticated headers (%s)", async h => {
    state.header = h;
    await expect(verifiedStudentId()).resolves.toBeNull();
    expect(state.getUser).not.toHaveBeenCalled();
  });
  it("accepts only an Auth-verified user, never an asserted browser identity", async () => {
    await expect(verifiedStudentId()).resolves.toBe("student-a");
    expect(state.getUser).toHaveBeenCalledWith("a".repeat(40));
  });
  it("rejects forged or expired tokens before any data access", async () => {
    state.getUser.mockResolvedValue({ data: { user: null }, error: { message: "expired" } });
    await expect(verifiedStudentId()).resolves.toBeNull();
  });
  it("fails closed if the authentication backend is unavailable", async () => {
    state.getUser.mockRejectedValue(new Error("temporary outage"));
    await expect(verifiedStudentId()).resolves.toBeNull();
  });
});
