import { makeStore } from "@/store";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { getAccessToken, putAccessToken } from "@/helpers/apiHelper";
import { initialState as postsInitial } from "@/features/posts/states/reducer";
import { initialState as usersInitial } from "@/features/users/states/reducer";
import { makePost, makeUser } from "@/test-utils";
import { login, register } from "../api/authApi";
import { ActionType, asyncLogin, asyncLogout, asyncRegister, setFlag } from "./action";

vi.mock("../api/authApi");
vi.mock("@/helpers/toolsHelper");

describe("auth actions", () => {
  it("setFlag membentuk action yang benar", () => {
    expect(setFlag("isAuthLogin", true)).toEqual({ type: ActionType.SET_FLAG, payload: { flag: "isAuthLogin", value: true } });
  });

  it("asyncLogin menyimpan token saat berhasil", async () => {
    vi.mocked(login).mockResolvedValue({ status: "success", message: "ok", data: { token: "jwt" } });
    const store = makeStore();
    await expect(store.dispatch(asyncLogin("a@b.co", "123456"))).resolves.toBe(true);
    expect(getAccessToken()).toBe("jwt");
    expect(store.getState().auth.isAuthLogin).toBe(true);
  });

  it("asyncLogin menampilkan dialog error saat gagal", async () => {
    vi.mocked(login).mockRejectedValue(new Error("Email atau kata sandi salah"));
    const store = makeStore();
    await expect(store.dispatch(asyncLogin("a@b.co", "salah"))).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Email atau kata sandi salah");
    expect(getAccessToken()).toBeNull();
    expect(store.getState().auth.isAuthLogin).toBe(false);
  });

  it("asyncRegister menampilkan dialog sukses", async () => {
    vi.mocked(register).mockResolvedValue({ status: "success", message: "Berhasil mendaftar", data: null });
    const store = makeStore();
    await expect(store.dispatch(asyncRegister("Budi", "a@b.co", "123456"))).resolves.toBe(true);
    expect(showSuccessDialog).toHaveBeenCalledWith("Berhasil mendaftar");
    expect(store.getState().auth.isAuthRegister).toBe(true);
  });

  it("asyncRegister menampilkan dialog error saat gagal", async () => {
    vi.mocked(register).mockRejectedValue(new Error("Email sudah terdaftar"));
    const store = makeStore();
    await expect(store.dispatch(asyncRegister("Budi", "a@b.co", "123456"))).resolves.toBe(false);
    expect(showErrorDialog).toHaveBeenCalledWith("Email sudah terdaftar");
    expect(store.getState().auth.isAuthRegister).toBe(false);
  });

  it("asyncLogout menghapus token dan membersihkan data sesi", async () => {
    putAccessToken("jwt");
    const store = makeStore({
      users: { ...usersInitial, profile: makeUser(), isProfile: true },
      posts: { ...postsInitial, posts: [makePost()], post: makePost() },
    });
    await store.dispatch(asyncLogout());
    const state = store.getState();
    expect(getAccessToken()).toBeNull();
    expect(state.users.profile).toBeNull();
    expect(state.users.isProfile).toBe(false);
    expect(state.posts.posts).toEqual([]);
    expect(state.posts.post).toBeNull();
    expect(state.auth.isAuthLogout).toBe(true);
  });
});
