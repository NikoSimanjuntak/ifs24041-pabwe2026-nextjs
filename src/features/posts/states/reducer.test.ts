import { makePost } from "@/test-utils";
import { setFlag, setPost, setPosts } from "./action";
import postsReducer, { initialState } from "./reducer";

describe("postsReducer", () => {
  it("mengembalikan state awal", () => {
    expect(postsReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("menyimpan posts dan post", () => {
    const post = makePost();
    expect(postsReducer(initialState, setPosts([post])).posts).toEqual([post]);
    expect(postsReducer(initialState, setPost(post)).post).toEqual(post);
    expect(postsReducer({ ...initialState, post }, setPost(null)).post).toBeNull();
  });

  it.each(Object.keys(initialState).filter((key) => key.startsWith("isPost")))("mengubah flag %s", (flag) => {
    const next = postsReducer(initialState, setFlag(flag as Parameters<typeof setFlag>[0], true));
    expect(next[flag as keyof typeof next]).toBe(true);
  });

  it("mengabaikan action lain", () => {
    expect(postsReducer(initialState, { type: "lain" })).toBe(initialState);
  });
});
