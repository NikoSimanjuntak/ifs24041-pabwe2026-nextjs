import type { ThunkAction, UnknownAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store";
import type { Post, User } from "@/types";

export type AppThunk<R = void> = ThunkAction<Promise<R>, RootState, unknown, UnknownAction>;

export interface FlagPayload<F extends string> {
  flag: F;
  value: boolean;
}

export type AuthFlag = "isAuthLogin" | "isAuthRegister" | "isAuthLogout";
export type UserFlag =
  | "isProfile"
  | "isChangeProfile"
  | "isChangeProfilePhoto"
  | "isChangeProfilePassword";
export type PostFlag =
  | "isPost"
  | "isPostAdd"
  | "isPostAdded"
  | "isPostChange"
  | "isPostChanged"
  | "isPostChangeCover"
  | "isPostChangedCover"
  | "isPostDelete"
  | "isPostDeleted"
  | "isPostLike"
  | "isPostLiked"
  | "isPostAddComment"
  | "isPostAddedComment"
  | "isPostDeleteComment"
  | "isPostDeletedComment"
  | "isPostDeleteAll"
  | "isPostDeletedAll";

export type AuthState = Record<AuthFlag, boolean>;
export type UsersState = { users: User[]; user: User | null; profile: User | null } & Record<
  UserFlag,
  boolean
>;
export type PostsState = { posts: Post[]; post: Post | null } & Record<PostFlag, boolean>;
