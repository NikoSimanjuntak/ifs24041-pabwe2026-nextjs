import { setFlag, setPost, setPosts } from "@/features/posts/states/action";
import { makePost } from "@/test-utils";
import { makeStore, store } from "./store";

describe("store", () => {
  it("menggabungkan reducer auth, users, dan posts", () => {
    expect(Object.keys(store.getState()).sort()).toEqual(["auth", "posts", "users"]);
  });

  it("menerima state awal sebagian lewat makeStore", () => {
    const custom = makeStore({ posts: { ...makeStore().getState().posts, posts: [makePost()] } });
    expect(custom.getState().posts.posts).toHaveLength(1);
  });

  it("memproses action", () => {
    const local = makeStore();
    local.dispatch(setPosts([makePost({ id: 5 })]));
    local.dispatch(setPost(makePost({ id: 5 })));
    local.dispatch(setFlag("isPost", true));
    expect(local.getState().posts.posts[0].id).toBe(5);
    expect(local.getState().posts.post?.id).toBe(5);
    expect(local.getState().posts.isPost).toBe(true);
  });
});
