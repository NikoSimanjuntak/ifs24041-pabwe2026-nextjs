import { apiFetch } from "@/helpers/apiHelper";
import { login, register } from "./authApi";

vi.mock("@/helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

describe("authApi", () => {
  it("login memanggil POST /auth/login", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ status: "success", message: "ok", data: { token: "t" } });
    await expect(login("a@b.co", "123456")).resolves.toMatchObject({ data: { token: "t" } });
    expect(apiFetch).toHaveBeenCalledWith("/auth/login", { method: "POST", body: { email: "a@b.co", password: "123456" } });
  });

  it("register memanggil POST /auth/register", async () => {
    await register("Budi", "a@b.co", "123456");
    expect(apiFetch).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: { name: "Budi", email: "a@b.co", password: "123456" },
    });
  });
});
