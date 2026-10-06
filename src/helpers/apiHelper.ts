import { DELCOM_BASEURL } from "@/lib/config";
import type { ApiResult } from "@/types";

const TOKEN_KEY = "delcom_access_token";

export const getAccessToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const putAccessToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const removeAccessToken = (): void => localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui";

/** Mengubah path relatif dari API (mis. "img/profile/1.png") menjadi URL absolut. */
export const assetUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${new URL(DELCOM_BASEURL).origin}/${path.replace(/^\//, "")}`;
};

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  query?: Record<string, string | number | undefined>;
  /** Objek biasa dikirim sebagai JSON, FormData dikirim sebagai multipart. */
  body?: unknown;
}

const describeFields = (data: unknown): string => {
  const fields = (data as { field?: Record<string, string[]> } | null | undefined)?.field;
  return fields ? ` (${Object.values(fields).flat().join(", ")})` : "";
};

export async function apiFetch<T = unknown>(
  path: string,
  { method = "GET", query, body }: RequestOptions = {},
): Promise<ApiResult<T>> {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined) params.set(key, String(value));
  });
  const queryString = params.toString();

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const response = await fetch(`${DELCOM_BASEURL}${path}${queryString ? `?${queryString}` : ""}`, {
    method,
    headers,
    body: payload,
  });
  const json = (await response.json().catch(() => ({}))) as Partial<ApiResult<T>>;

  if (!response.ok || json.status !== "success") {
    throw new ApiError(`${json.message ?? "Permintaan ke server gagal"}${describeFields(json.data)}`);
  }
  return json as ApiResult<T>;
}
