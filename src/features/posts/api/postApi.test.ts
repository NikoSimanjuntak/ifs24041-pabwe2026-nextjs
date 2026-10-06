import { apiFetch } from "@/helpers/apiHelper";
import { makePost } from "@/test-utils";
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
} from "./postApi";

vi.mock("@/helpers/apiHelper", () => ({ apiFetch: vi.fn() }));

describe("postApi", () => {
  it("getPosts mengambil semua postingan", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ status: "success", message: "", data: { posts: [makePost()] } });
    await expect(getPosts()).resolves.toHaveLength(1);
    expect(apiFetch).toHaveBeenCalledWith("/posts", { query: { is_me: undefined } });
  });

  it("getPosts(true) memakai filter is_me=1", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ status: "success", message: "", data: { posts: [] } });
    await getPosts(true);
    expect(apiFetch).toHaveBeenCalledWith("/posts", { query: { is_me: 1 } });
  });

  it("getPost mengambil detail postingan", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ status: "success", message: "", data: { post: makePost({ id: 4 }) } });
    await expect(getPost(4)).resolves.toMatchObject({ id: 4 });
    expect(apiFetch).toHaveBeenCalledWith("/posts/4");
  });

  it("addPost memanggil POST /posts", async () => {
    await addPost("isi");
    expect(apiFetch).toHaveBeenCalledWith("/posts", { method: "POST", body: { description: "isi" } });
  });

  it("updatePost memanggil PUT /posts/:id", async () => {
    await updatePost(3, "baru");
    expect(apiFetch).toHaveBeenCalledWith("/posts/3", { method: "PUT", body: { description: "baru" } });
  });

  it("changeCover mengunggah FormData ke /posts/:id/cover", async () => {
    const file = new File(["x"], "c.png", { type: "image/png" });
    await changeCover(3, file);
    const [path, options] = vi.mocked(apiFetch).mock.calls[0];
    expect(path).toBe("/posts/3/cover");
    expect((options?.body as FormData).get("cover")).toBe(file);
  });

  it("deletePost memanggil DELETE /posts/:id", async () => {
    await deletePost(3);
    expect(apiFetch).toHaveBeenCalledWith("/posts/3", { method: "DELETE" });
  });

  it("toggleLike mengirim 1 untuk suka dan 0 untuk batal suka", async () => {
    await toggleLike(3, true);
    await toggleLike(3, false);
    expect(apiFetch).toHaveBeenNthCalledWith(1, "/posts/3/likes", { method: "POST", body: { like: 1 } });
    expect(apiFetch).toHaveBeenNthCalledWith(2, "/posts/3/likes", { method: "POST", body: { like: 0 } });
  });

  it("addComment dan deleteComment memakai /posts/:id/comments", async () => {
    await addComment(3, "halo");
    await deleteComment(3);
    expect(apiFetch).toHaveBeenNthCalledWith(1, "/posts/3/comments", { method: "POST", body: { comment: "halo" } });
    expect(apiFetch).toHaveBeenNthCalledWith(2, "/posts/3/comments", { method: "DELETE" });
  });

  it("deleteAllPosts memanggil DELETE /posts", async () => {
    await deleteAllPosts();
    expect(apiFetch).toHaveBeenCalledWith("/posts", { method: "DELETE" });
  });
});
