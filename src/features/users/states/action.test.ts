import { getAccessToken, putAccessToken } from "@/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { makeStore } from "@/store";
import { makeUser } from "@/test-utils";
import { changePassword, changePhoto, getProfile, getUsers, updateProfile } from "../api/userApi";
import {
  ActionType,
  asyncChangePassword,
  asyncChangePhoto,
  asyncChangeProfile,
  asyncGetUsers,
  asyncPreloadProfile,
  setFlag,
  setProfile,
  setUser,
  setUsers,
} from "./action";

vi.mock("../api/userApi");
vi.mock("@/helpers/toolsHelper");

const ok = (message = "Berhasil", data: unknown = null) => ({ status: "success", message, data });

describe("users actions", () => {
  it("action creator membentuk action yang benar", () => {
    const user = makeUser();
    expect(setUsers([user])).toEqual({ type: ActionType.SET_USERS, payload: [user] });
    expect(setUser(user)).toEqual({ type: ActionType.SET_USER, payload: user });
    expect(setProfile(null)).toEqual({ type: ActionType.SET_PROFILE, payload: null });
    expect(setFlag("isProfile", true)).toEqual({ type: ActionType.SET_FLAG, payload: { flag: "isProfile", value: true } });
  });

  it("asyncGetUsers menyimpan daftar pengguna", async () => {
    vi.mocked(getUsers).mockResolvedValue([makeUser({ id: 2 })]);
    const store = makeStore();
    await expect(store.dispatch(asyncGetUsers())).resolves.toBe(true);
    expect(store.getState().users.users).toHaveLength(1);
  });

  it("asyncGetUsers menampilkan error saat gagal", async () => {
    vi.mocked(getUsers).mockRejectedValue(new Error("gagal"));
    await expect(makeStore().dispatch(asyncGetUsers())).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("gagal");
  });

  it("asyncPreloadProfile memuat profil", async () => {
    vi.mocked(getProfile).mockResolvedValue(makeUser({ id: 9 }));
    const store = makeStore();
    await store.dispatch(asyncPreloadProfile());
    expect(store.getState().users.profile?.id).toBe(9);
    expect(store.getState().users.isProfile).toBe(true);
  });

  it("asyncPreloadProfile menghapus token jika sesi tidak valid", async () => {
    putAccessToken("kedaluwarsa");
    vi.mocked(getProfile).mockRejectedValue(new Error("Unauthenticated."));
    const store = makeStore();
    await store.dispatch(asyncPreloadProfile());
    expect(store.getState().users.profile).toBeNull();
    expect(store.getState().users.isProfile).toBe(true);
    expect(getAccessToken()).toBeNull();
  });

  it("asyncChangeProfile memperbarui profil di store", async () => {
    vi.mocked(updateProfile).mockResolvedValue(ok("Berhasil mengubah data", { user: makeUser({ name: "Baru" }) }));
    const store = makeStore();
    await expect(store.dispatch(asyncChangeProfile("Baru", "a@b.co"))).resolves.toBe(true);
    expect(updateProfile).toHaveBeenCalledWith({ name: "Baru", email: "a@b.co" });
    expect(store.getState().users.profile?.name).toBe("Baru");
    expect(store.getState().users.isChangeProfile).toBe(false);
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mengubah data");
  });

  it("asyncChangeProfile menampilkan error saat gagal", async () => {
    vi.mocked(updateProfile).mockRejectedValue(new Error("Email dipakai"));
    const store = makeStore();
    await expect(store.dispatch(asyncChangeProfile("A", "a@b.co"))).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Email dipakai");
    expect(store.getState().users.isChangeProfile).toBe(false);
  });

  it("asyncChangePhoto memuat ulang profil setelah unggah", async () => {
    const file = new File(["x"], "f.png", { type: "image/png" });
    vi.mocked(changePhoto).mockResolvedValue(ok("Foto diubah"));
    vi.mocked(getProfile).mockResolvedValue(makeUser({ photo: "img/profile/1.png" }));
    const store = makeStore();
    await expect(store.dispatch(asyncChangePhoto(file))).resolves.toBe(true);
    expect(changePhoto).toHaveBeenCalledWith(file);
    expect(store.getState().users.profile?.photo).toBe("img/profile/1.png");
  });

  it("asyncChangePhoto gagal bila unggah ditolak", async () => {
    vi.mocked(changePhoto).mockRejectedValue(new Error("Berkas terlalu besar"));
    const store = makeStore();
    await expect(store.dispatch(asyncChangePhoto(new File(["x"], "f.png")))).resolves.toBe(false);
    expect(getProfile).not.toHaveBeenCalled();
  });

  it("asyncChangePassword mengirim konfirmasi kata sandi", async () => {
    vi.mocked(changePassword).mockResolvedValue(ok("Kata sandi diubah"));
    await expect(makeStore().dispatch(asyncChangePassword("lama12", "baru12", "baru12"))).resolves.toBe(true);
    expect(changePassword).toHaveBeenCalledWith({
      password: "lama12",
      new_password: "baru12",
      new_password_confirmation: "baru12",
    });
  });

  it("asyncChangePassword menampilkan error saat gagal", async () => {
    vi.mocked(changePassword).mockRejectedValue(new Error("Kata sandi salah"));
    await expect(makeStore().dispatch(asyncChangePassword("x", "y", "y"))).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Kata sandi salah");
  });
});
