import { getErrorMessage, putAccessToken, removeAccessToken } from "@/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { setPost, setPosts } from "@/features/posts/states/action";
import { setFlag as setUserFlag, setProfile } from "@/features/users/states/action";
import type { AppThunk, AuthFlag } from "@/types/action";
import { login, register } from "../api/authApi";

export const ActionType = {
  SET_FLAG: "auth/SET_FLAG",
} as const;

export const setFlag = (flag: AuthFlag, value: boolean) => ({
  type: ActionType.SET_FLAG,
  payload: { flag, value },
});

/** Mengembalikan true jika login berhasil. Token disimpan di localStorage. */
export const asyncLogin =
  (email: string, password: string): AppThunk<boolean> =>
  async (dispatch) => {
    dispatch(setFlag("isAuthLogin", false));
    try {
      const result = await login(email, password);
      putAccessToken(result.data.token);
      dispatch(setFlag("isAuthLogin", true));
      return true;
    } catch (error) {
      void showErrorDialog(getErrorMessage(error));
      return false;
    }
  };

export const asyncRegister =
  (name: string, email: string, password: string): AppThunk<boolean> =>
  async (dispatch) => {
    dispatch(setFlag("isAuthRegister", false));
    try {
      const result = await register(name, email, password);
      dispatch(setFlag("isAuthRegister", true));
      void showSuccessDialog(result.message);
      return true;
    } catch (error) {
      void showErrorDialog(getErrorMessage(error));
      return false;
    }
  };

/** Menghapus token dan membersihkan data sesi dari store. */
export const asyncLogout = (): AppThunk => async (dispatch) => {
  removeAccessToken();
  dispatch(setProfile(null));
  dispatch(setUserFlag("isProfile", false));
  dispatch(setPosts([]));
  dispatch(setPost(null));
  dispatch(setFlag("isAuthLogin", false));
  dispatch(setFlag("isAuthLogout", true));
};
