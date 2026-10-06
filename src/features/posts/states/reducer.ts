import type { UnknownAction } from "@reduxjs/toolkit";
import type { Post } from "@/types";
import type { FlagPayload, PostFlag, PostsState } from "@/types/action";
import { ActionType } from "./action";

export const initialState: PostsState = {
  posts: [],
  post: null,
  isPost: false,
  isPostAdd: false,
  isPostAdded: false,
  isPostChange: false,
  isPostChanged: false,
  isPostChangeCover: false,
  isPostChangedCover: false,
  isPostDelete: false,
  isPostDeleted: false,
  isPostLike: false,
  isPostLiked: false,
  isPostAddComment: false,
  isPostAddedComment: false,
  isPostDeleteComment: false,
  isPostDeletedComment: false,
  isPostDeleteAll: false,
  isPostDeletedAll: false,
};

export default function postsReducer(state: PostsState = initialState, action: UnknownAction): PostsState {
  switch (action.type) {
    case ActionType.SET_POSTS:
      return { ...state, posts: action.payload as Post[] };
    case ActionType.SET_POST:
      return { ...state, post: action.payload as Post | null };
    case ActionType.SET_FLAG: {
      const { flag, value } = action.payload as FlagPayload<PostFlag>;
      return { ...state, [flag]: value };
    }
    default:
      return state;
  }
}
