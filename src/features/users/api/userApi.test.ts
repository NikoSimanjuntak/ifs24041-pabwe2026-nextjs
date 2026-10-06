import { apiFetch } from "@/helpers/apiHelper";
import { makeUser } from "@/test-utils";
import { changePassword, changePhoto, getProfile, getUsers, updateProfile } from "./userApi";

vi.mock("@/helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

describe("userApi", () => {
  it("getUsers mengambil daftar pengguna", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ status: "success", message: "", data: { users: [makeUser()] } });
    await expect(getUsers()).resolves.toEqual([makeUser()]);
    expect(apiFetch).toHaveBeenCalledWith("/users");
  });

  it("getProfile mengambil profil aktif", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ status: "success", message: "", data: { user: makeUser({ id: 7 }) } });
    await expect(getProfile()).resolves.toMatchObject({ id: 7 });
    expect(apiFetch).toHaveBeenCalledWith("/users/me");
  });

  it("updateProfile memanggil PUT /users/me", async () => {
    await updateProfile({ name: "A", email: "a@b.co" });
    expect(apiFetch).toHaveBeenCalledWith("/users/me", { method: "PUT", body: { name: "A", email: "a@b.co" } });
  });

  it("changePhoto mengunggah berkas sebagai FormData", async () => {
    const file = new File(["x"], "foto.png", { type: "image/png" });
    await changePhoto(file);
    const [path, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(path).toBe("/users/me/photo");
    expect(options?.method).toBe("POST");
    expect((options?.body as FormData).get("photo")).toBe(file);
  });

  it("changePassword memanggil PUT /users/password", async () => {
    const payload = { password: "lama12", new_password: "baru12", new_password_confirmation: "baru12" };
    await changePassword(payload);
    expect(apiFetch).toHaveBeenCalledWith("/users/password", { method: "PUT", body: payload });
  });
});
