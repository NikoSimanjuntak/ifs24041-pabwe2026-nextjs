import { getErrorMessage } from "@/helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import type { Post } from "@/types";
import type { AppThunk, PostFlag } from "@/types/action";
import {
  addComment,
  addPost,
  changeCover,
  deleteAllPosts,
  deleteComment,
  deletePost,
  getPost,
  getPosts,
  toggleLike,
  updatePost,
} from "../api/postApi";

export const ActionType = {
  SET_POSTS: "posts/SET_POSTS",
  SET_POST: "posts/SET_POST",
  SET_FLAG: "posts/SET_FLAG",
} as const;

export const setPosts = (posts: Post[]) => ({ type: ActionType.SET_POSTS, payload: posts });
export const setPost = (post: Post | null) => ({ type: ActionType.SET_POST, payload: post });
export const setFlag = (flag: PostFlag, value: boolean) => ({
  type: ActionType.SET_FLAG,
  payload: { flag, value },
});

export const asyncGetPosts =
  (isMe = false): AppThunk<boolean> =>
  async (dispatch) => {
    dispatch(setFlag("isPost", true));
    let success = true;
    try {
      dispatch(setPosts(await getPosts(isMe)));
    } catch (error) {
      void showErrorDialog(getErrorMessage(error));
      success = false;
    }
    dispatch(setFlag("isPost", false));
    return success;
  };

export const asyncGetPost =
  (id: number): AppThunk<boolean> =>
  async (dispatch) => {
    dispatch(setFlag("isPost", true));
    let success = true;
    try {
      dispatch(setPost(await getPost(id)));
    } catch (error) {
      void showErrorDialog(getErrorMessage(error));
      success = false;
    }
    dispatch(setFlag("isPost", false));
    return success;
  };

/**
 * Pola umum untuk aksi yang mengubah data:
 * flag `loading` menyala selama request, flag `done` menyala jika berhasil.
 * Mengembalikan true/false agar komponen dapat menentukan langkah berikutnya.
 */
function mutation(
  loading: PostFlag,
  done: PostFlag,
  job: () => Promise<string>,
  notify = true,
): AppThunk<boolean> {
  return async (dispatch) => {
    dispatch(setFlag(done, false));
    dispatch(setFlag(loading, true));
    let success = true;
    try {
      const message = await job();
      dispatch(setFlag(done, true));
      if (notify) void showSuccessDialog(message);
    } catch (error) {
      void showErrorDialog(getErrorMessage(error));
      success = false;
    }
    dispatch(setFlag(loading, false));
    return success;
  };
}

export const asyncAddPost = (description: string) =>
  mutation("isPostAdd", "isPostAdded", async () => (await addPost(description)).message);

export const asyncChangePost = (id: number, description: string) =>
  mutation("isPostChange", "isPostChanged", async () => (await updatePost(id, description)).message);

export const asyncChangeCover = (id: number, file: File) =>
  mutation("isPostChangeCover", "isPostChangedCover", async () => (await changeCover(id, file)).message);

export const asyncDeletePost = (id: number) =>
  mutation("isPostDelete", "isPostDeleted", async () => (await deletePost(id)).message);

// Like/unlike tidak menampilkan dialog agar interaksi terasa instan.
export const asyncToggleLike = (id: number, like: boolean) =>
  mutation("isPostLike", "isPostLiked", async () => (await toggleLike(id, like)).message, false);

export const asyncAddComment = (id: number, comment: string) =>
  mutation("isPostAddComment", "isPostAddedComment", async () => (await addComment(id, comment)).message);

export const asyncDeleteComment = (id: number) =>
  mutation("isPostDeleteComment", "isPostDeletedComment", async () => (await deleteComment(id)).message);

export const asyncDeleteAllPosts = () =>
  mutation("isPostDeleteAll", "isPostDeletedAll", async () => (await deleteAllPosts()).message);