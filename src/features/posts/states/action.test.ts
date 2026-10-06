import type { Mock } from "vitest";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { makeStore } from "@/store";
import { makePost } from "@/test-utils";
import type { PostFlag } from "@/types/action";
import * as postApi from "../api/postApi";
import {
  ActionType,
  asyncAddComment,
  asyncAddPost,
  asyncChangeCover,
  asyncChangePost,
  asyncDeleteAllPosts,
  asyncDeleteComment,
  asyncDeletePost,
  asyncGetPost,
  asyncGetPosts,
  asyncToggleLike,
  setFlag,
  setPost,
  setPosts,
} from "./action";

vi.mock("../api/postApi");
vi.mock("@/helpers/toolsHelper");

const file = new File(["x"], "c.png", { type: "image/png" });

describe("posts actions", () => {
  it("action creator membentuk action yang benar", () => {
    const post = makePost();
    expect(setPosts([post])).toEqual({ type: ActionType.SET_POSTS, payload: [post] });
    expect(setPost(null)).toEqual({ type: ActionType.SET_POST, payload: null });
    expect(setFlag("isPost", true)).toEqual({ type: ActionType.SET_FLAG, payload: { flag: "isPost", value: true } });
  });

  describe("pengambilan data", () => {
    it("asyncGetPosts menyimpan daftar postingan", async () => {
      vi.mocked(postApi.getPosts).mockResolvedValue([makePost()]);
      const store = makeStore();
      await expect(store.dispatch(asyncGetPosts())).resolves.toBe(true);
      expect(postApi.getPosts).toHaveBeenCalledWith(false);
      expect(store.getState().posts.posts).toHaveLength(1);
      expect(store.getState().posts.isPost).toBe(false);
    });

    it("asyncGetPosts(true) meneruskan filter is_me", async () => {
      vi.mocked(postApi.getPosts).mockResolvedValue([]);
      await makeStore().dispatch(asyncGetPosts(true));
      expect(postApi.getPosts).toHaveBeenCalledWith(true);
    });

    it("asyncGetPosts menampilkan error saat gagal", async () => {
      vi.mocked(postApi.getPosts).mockRejectedValue(new Error("gagal muat"));
      const store = makeStore();
      await expect(store.dispatch(asyncGetPosts())).resolves.toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("gagal muat");
      expect(store.getState().posts.isPost).toBe(false);
    });

    it("asyncGetPost menyimpan detail postingan", async () => {
      vi.mocked(postApi.getPost).mockResolvedValue(makePost({ id: 8 }));
      const store = makeStore();
      await expect(store.dispatch(asyncGetPost(8))).resolves.toBe(true);
      expect(store.getState().posts.post?.id).toBe(8);
    });

    it("asyncGetPost menampilkan error saat gagal", async () => {
      vi.mocked(postApi.getPost).mockRejectedValue(new Error("tidak ada"));
      await expect(makeStore().dispatch(asyncGetPost(8))).resolves.toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("tidak ada");
    });
  });

  describe("aksi yang mengubah data", () => {
    const cases: Array<[string, () => ReturnType<typeof asyncAddPost>, Mock, PostFlag, PostFlag, boolean]> = [
      ["asyncAddPost", () => asyncAddPost("isi"), postApi.addPost as Mock, "isPostAdd", "isPostAdded", true],
      ["asyncChangePost", () => asyncChangePost(1, "isi"), postApi.updatePost as Mock, "isPostChange", "isPostChanged", true],
      ["asyncChangeCover", () => asyncChangeCover(1, file), postApi.changeCover as Mock, "isPostChangeCover", "isPostChangedCover", true],
      ["asyncDeletePost", () => asyncDeletePost(1), postApi.deletePost as Mock, "isPostDelete", "isPostDeleted", true],
      ["asyncToggleLike", () => asyncToggleLike(1, true), postApi.toggleLike as Mock, "isPostLike", "isPostLiked", false],
      ["asyncAddComment", () => asyncAddComment(1, "halo"), postApi.addComment as Mock, "isPostAddComment", "isPostAddedComment", true],
      ["asyncDeleteComment", () => asyncDeleteComment(1), postApi.deleteComment as Mock, "isPostDeleteComment", "isPostDeletedComment", true],
      ["asyncDeleteAllPosts", () => asyncDeleteAllPosts(), postApi.deleteAllPosts as Mock, "isPostDeleteAll", "isPostDeletedAll", true],
    ];

    it.each(cases)("%s berhasil", async (_name, make, api, loading, done, notify) => {
      api.mockResolvedValue({ status: "success", message: "Selesai", data: {} });
      const store = makeStore();
      await expect(store.dispatch(make())).resolves.toBe(true);
      expect(store.getState().posts[done]).toBe(true);
      expect(store.getState().posts[loading]).toBe(false);
      expect(showSuccessDialog).toHaveBeenCalledTimes(notify ? 1 : 0);
      if (notify) expect(showSuccessDialog).toHaveBeenCalledWith("Selesai");
    });

    it.each(cases)("%s gagal", async (_name, make, api, loading, done) => {
      api.mockRejectedValue(new Error("ditolak"));
      const store = makeStore();
      await expect(store.dispatch(make())).resolves.toBe(false);
      expect(store.getState().posts[done]).toBe(false);
      expect(store.getState().posts[loading]).toBe(false);
      expect(showErrorDialog).toHaveBeenCalledWith("ditolak");
      expect(showSuccessDialog).not.toHaveBeenCalled();
    });

    it("mereset flag selesai pada percobaan berikutnya", async () => {
      const addPost = postApi.addPost as Mock;
      addPost.mockResolvedValueOnce({ status: "success", message: "ok", data: {} });
      addPost.mockRejectedValueOnce(new Error("gagal"));
      const store = makeStore();
      await store.dispatch(asyncAddPost("a"));
      expect(store.getState().posts.isPostAdded).toBe(true);
      await store.dispatch(asyncAddPost("b"));
      expect(store.getState().posts.isPostAdded).toBe(false);
    });
  });
});
