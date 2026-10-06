import type { UnknownAction } from "@reduxjs/toolkit";
import type { AuthFlag, AuthState, FlagPayload } from "@/types/action";
import { ActionType } from "./action";

export const initialState: AuthState = {
  isAuthLogin: false,
  isAuthRegister: false,
  isAuthLogout: false,
};

export default function authReducer(state: AuthState = initialState, action: UnknownAction): AuthState {
  if (action.type === ActionType.SET_FLAG) {
    const { flag, value } = action.payload as FlagPayload<AuthFlag>;
    return { ...state, [flag]: value };
  }
  return state;
}
