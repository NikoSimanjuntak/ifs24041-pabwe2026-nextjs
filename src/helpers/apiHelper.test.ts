import {
  ApiError,
  apiFetch,
  assetUrl,
  getAccessToken,
  getErrorMessage,
  putAccessToken,
  removeAccessToken,
} from "./apiHelper";
import { DELCOM_BASEURL } from "@/lib/config";

const mockFetch = (body: unknown, ok = true) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok, json: async () => body } as Response);

const success = { status: "success", message: "ok", data: { value: 1 } };

describe("token storage", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getAccessToken()).toBeNull();
    putAccessToken("abc");
    expect(getAccessToken()).toBe("abc");
    removeAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});

describe("apiFetch", () => {
  afterEach(() => vi.restoreAllMocks());

  it("mengirim GET tanpa Authorization saat token belum ada", async () => {
    const fetchSpy = mockFetch(success);
    const result = await apiFetch("/posts");
    expect(result.data).toEqual({ value: 1 });
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(`${DELCOM_BASEURL}/posts`);
    expect(init).toMatchObject({ method: "GET", body: undefined });
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("menambahkan query parameter dan melewati nilai undefined", async () => {
    const fetchSpy = mockFetch(success);
    await apiFetch("/posts", { query: { is_me: 1, skip: undefined } });
    expect(fetchSpy.mock.calls[0][0]).toBe(`${DELCOM_BASEURL}/posts?is_me=1`);
  });

  it("menyertakan bearer token dan body JSON", async () => {
    putAccessToken("secret");
    const fetchSpy = mockFetch(success);
    await apiFetch("/posts", { method: "POST", body: { description: "hai" } });
    const init = fetchSpy.mock.calls[0][1]!;
    expect(init.headers).toMatchObject({
      Authorization: "Bearer secret",
      "Content-Type": "application/json",
    });
    expect(init.body).toBe(JSON.stringify({ description: "hai" }));
  });

  it("mengirim FormData apa adanya tanpa Content-Type manual", async () => {
    const fetchSpy = mockFetch(success);
    const form = new FormData();
    form.append("cover", new File(["x"], "c.png"));
    await apiFetch("/posts/1/cover", { method: "POST", body: form });
    const init = fetchSpy.mock.calls[0][1]!;
    expect(init.body).toBe(form);
    expect((init.headers as Record<string, string>)["Content-Type"]).toBeUndefined();
  });

  it("melempar ApiError dengan detail validasi field", async () => {
    mockFetch({ status: "fail", message: "Data tidak valid", data: { field: { email: ["Email salah"], name: ["Nama kosong"] } } }, false);
    await expect(apiFetch("/x")).rejects.toThrow("Data tidak valid (Email salah, Nama kosong)");
  });

  it("melempar ApiError tanpa detail jika field tidak ada", async () => {
    mockFetch({ status: "fail", message: "Unauthenticated." }, false);
    const error = await apiFetch("/x").catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error.name).toBe("ApiError");
    expect(error.message).toBe("Unauthenticated.");
  });

  it("memakai pesan bawaan jika respons bukan JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);
    await expect(apiFetch("/x")).rejects.toThrow("Permintaan ke server gagal");
  });

  it("menolak respons HTTP 200 yang status-nya bukan success", async () => {
    mockFetch({ status: "fail", message: "Gagal", data: null });
    await expect(apiFetch("/x")).rejects.toThrow("Gagal");
  });
});

describe("getErrorMessage", () => {
  it("mengambil pesan dari Error", () => expect(getErrorMessage(new Error("boom"))).toBe("boom"));
  it("memakai pesan bawaan untuk nilai lain", () =>
    expect(getErrorMessage("oops")).toBe("Terjadi kesalahan yang tidak diketahui"));
});

describe("assetUrl", () => {
  it("mengembalikan null jika path kosong", () => {
    expect(assetUrl(null)).toBeNull();
    expect(assetUrl(undefined)).toBeNull();
  });
  it("mempertahankan URL absolut", () => expect(assetUrl("https://cdn.test/a.png")).toBe("https://cdn.test/a.png"));
  it("menggabungkan path relatif dengan origin API", () => {
    expect(assetUrl("img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
    expect(assetUrl("/img/profile/1.png")).toBe("https://open-api.delcom.org/img/profile/1.png");
  });
});
