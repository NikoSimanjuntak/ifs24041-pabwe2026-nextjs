import type { UnknownAction } from "@reduxjs/toolkit";
import type { User } from "@/types";
import type { FlagPayload, UserFlag, UsersState } from "@/types/action";
import { ActionType } from "./action";

export const initialState: UsersState = {
  users: [],
  user: null,
  profile: null,
  isProfile: false,
  isChangeProfile: false,
  isChangeProfilePhoto: false,
  isChangeProfilePassword: false,
};

export default function usersReducer(state: UsersState = initialState, action: UnknownAction): UsersState {
  switch (action.type) {
    case ActionType.SET_USERS:
      return { ...state, users: action.payload as User[] };
    case ActionType.SET_USER:
      return { ...state, user: action.payload as User | null };
    case ActionType.SET_PROFILE:
      return { ...state, profile: action.payload as User | null };
    case ActionType.SET_FLAG: {
      const { flag, value } = action.payload as FlagPayload<UserFlag>;
      return { ...state, [flag]: value };
    }
    default:
      return state;
  }
}
