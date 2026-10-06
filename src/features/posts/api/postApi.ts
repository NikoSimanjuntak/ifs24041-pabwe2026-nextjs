import { apiFetch } from "@/helpers/apiHelper";
import type { Post } from "@/types";

export const getPosts = async (isMe = false): Promise<Post[]> =>
  (await apiFetch<{ posts: Post[] }>("/posts", { query: { is_me: isMe ? 1 : undefined } })).data.posts;

export const getPost = async (id: number): Promise<Post> =>
  (await apiFetch<{ post: Post }>(`/posts/${id}`)).data.post;

export const addPost = (description: string) =>
  apiFetch<{ post_id: number }>("/posts", { method: "POST", body: { description } });

export const updatePost = (id: number, description: string) =>
  apiFetch(`/posts/${id}`, { method: "PUT", body: { description } });

export const changeCover = (id: number, file: File) => {
  const form = new FormData();
  form.append("cover", file);
  return apiFetch(`/posts/${id}/cover`, { method: "POST", body: form });
};

export const deletePost = (id: number) => apiFetch(`/posts/${id}`, { method: "DELETE" });

export const toggleLike = (id: number, like: boolean) =>
  apiFetch(`/posts/${id}/likes`, { method: "POST", body: { like: like ? 1 : 0 } });

export const addComment = (id: number, comment: string) =>
  apiFetch(`/posts/${id}/comments`, { method: "POST", body: { comment } });

export const deleteComment = (id: number) => apiFetch(`/posts/${id}/comments`, { method: "DELETE" });

export const deleteAllPosts = () => apiFetch("/posts", { method: "DELETE" });
