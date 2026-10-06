import { vi } from "vitest";

/** Pengganti next/navigation untuk pengujian. Ubah `navigation` pada tiap test sesuai kebutuhan. */
export const navigation = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  pathname: "/",
  search: "",
  params: {} as Record<string, string>,
  reset() {
    this.push.mockReset();
    this.replace.mockReset();
    this.back.mockReset();
    this.pathname = "/";
    this.search = "";
    this.params = {};
  },
};

const router = { push: navigation.push, replace: navigation.replace, back: navigation.back };

export const useRouter = () => router;
export const usePathname = () => navigation.pathname;
export const useSearchParams = () => new URLSearchParams(navigation.search);
export const useParams = () => navigation.params;
