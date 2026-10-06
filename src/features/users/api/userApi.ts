import { apiFetch } from "@/helpers/apiHelper";
import type { User } from "@/types";

export const getUsers = async (): Promise<User[]> =>
  (await apiFetch<{ users: User[] }>("/users")).data.users;

export const getProfile = async (): Promise<User> =>
  (await apiFetch<{ user: User }>("/users/me")).data.user;

export const updateProfile = (payload: { name: string; email: string }) =>
  apiFetch<{ user: User }>("/users/me", { method: "PUT", body: payload });

export const changePhoto = (file: File) => {
  const form = new FormData();
  form.append("photo", file);
  return apiFetch("/users/me/photo", { method: "POST", body: form });
};

// Mengikuti dokumentasi Delcom Open API: PUT /users/password.
export const changePassword = (payload: {
  password: string;
  new_password: string;
  new_password_confirmation: string;
}) => apiFetch("/users/password", { method: "PUT", body: payload });
