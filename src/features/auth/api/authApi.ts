import { apiFetch } from "@/helpers/apiHelper";

export const login = (email: string, password: string) =>
  apiFetch<{ token: string }>("/auth/login", { method: "POST", body: { email, password } });

export const register = (name: string, email: string, password: string) =>
  apiFetch("/auth/register", { method: "POST", body: { name, email, password } });
