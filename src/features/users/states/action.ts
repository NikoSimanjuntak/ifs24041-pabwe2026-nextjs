import { getErrorMessage, removeAccessToken } from "@/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import type { User } from "@/types";
import type { AppThunk, UserFlag } from "@/types/action";
import { changePassword, changePhoto, getProfile, getUsers, updateProfile } from "../api/userApi";

export const ActionType = {
  SET_USERS: "users/SET_USERS",
  SET_USER: "users/SET_USER",
  SET_PROFILE: "users/SET_PROFILE",
  SET_FLAG: "users/SET_FLAG",
} as const;

export const setUsers = (users: User[]) => ({ type: ActionType.SET_USERS, payload: users });
export const setUser = (user: User | null) => ({ type: ActionType.SET_USER, payload: user });
export const setProfile = (profile: User | null) => ({ type: ActionType.SET_PROFILE, payload: profile });
export const setFlag = (flag: UserFlag, value: boolean) => ({
  type: ActionType.SET_FLAG,
  payload: { flag, value },
});

export const asyncGetUsers = (): AppThunk<boolean> => async (dispatch) => {
  try {
    dispatch(setUsers(await getUsers()));
    return true;
  } catch (error) {
    void showErrorDialog(getErrorMessage(error));
    return false;
  }
};

/** Memuat profil sesi aktif. Jika gagal (mis. token kedaluwarsa), profil dikosongkan. */
export const asyncPreloadProfile = (): AppThunk => async (dispatch) => {
  dispatch(setFlag("isProfile", false));
  try {
    dispatch(setProfile(await getProfile()));
  } catch {
    dispatch(setProfile(null));
    removeAccessToken();
  } finally {
    dispatch(setFlag("isProfile", true));
  }
};

function mutation(
  loading: UserFlag,
  job: () => Promise<{ message: string; user?: User }>,
  refreshProfile = false,
): AppThunk<boolean> {
  return async (dispatch) => {
    dispatch(setFlag(loading, true));
    let success = true;
    try {
      const result = await job();
      if (result.user) dispatch(setProfile(result.user));
      if (refreshProfile) dispatch(setProfile(await getProfile()));
      void showSuccessDialog(result.message);
    } catch (error) {
      void showErrorDialog(getErrorMessage(error));
      success = false;
    }
    dispatch(setFlag(loading, false));
    return success;
  };
}

export const asyncChangeProfile = (name: string, email: string) =>
  mutation("isChangeProfile", async () => {
    const result = await updateProfile({ name, email });
    return { message: result.message, user: result.data.user };
  });

export const asyncChangePhoto = (file: File) =>
  mutation("isChangeProfilePhoto", async () => ({ message: (await changePhoto(file)).message }), true);

export const asyncChangePassword = (password: string, newPassword: string, confirmation: string) =>
  mutation("isChangeProfilePassword", async () => ({
    message: (
      await changePassword({
        password,
        new_password: newPassword,
        new_password_confirmation: confirmation,
      })
    ).message,
  }));