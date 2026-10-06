import { screen, waitFor, within } from "@testing-library/react";
import { showConfirmDialog, showErrorDialog } from "@/helpers/toolsHelper";
import { makePost, navigation, renderWithProviders } from "@/test-utils";
import { addPost, deleteAllPosts, getPosts } from "../api/postApi";
import HomePage from "./HomePage";

vi.mock("../api/postApi");
vi.mock("@/helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/helpers/toolsHelper")>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const posts = [
  makePost({ id: 1, description: "Belajar Next.js", author: { name: "Budi", photo: null }, likes: [1, 2], comments: [5] }),
  makePost({ id: 2, description: "Resep nasi goreng", author: { name: "Ani", photo: "https://cdn.test/ani.png" }, cover: "https://cdn.test/c.png" }),
];

describe("HomePage", () => {
  beforeEach(() => {
    vi.mocked(getPosts).mockResolvedValue(posts);
  });

  it("memuat semua postingan dan menampilkan kartu", async () => {
    renderWithProviders(<HomePage />);
    expect(await screen.findByText("Belajar Next.js")).toBeInTheDocument();
    expect(getPosts).toHaveBeenCalledWith(false);
    expect(screen.getByRole("heading", { name: "Linimasa" })).toBeInTheDocument();
    const card = screen.getByRole("link", { name: /Belajar Next.js/ });
    expect(card).toHaveAttribute("href", "/posts/1");
    expect(within(card).getByLabelText("2 suka")).toBeInTheDocument();
    expect(within(card).getByLabelText("1 komentar")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Hapus semua/ })).not.toBeInTheDocument();
  });

  it("menampilkan gambar sampul bila tersedia", async () => {
    const { container } = renderWithProviders(<HomePage />);
    await screen.findByText("Resep nasi goreng");
    expect(container.querySelectorAll('img[src="https://cdn.test/c.png"]')).toHaveLength(1);
  });

  it("menampilkan indikator saat memuat", () => {
    vi.mocked(getPosts).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<HomePage />);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat postingan");
  });

  it("memuat postingan milik saya pada tab ?tab=me", async () => {
    navigation.search = "tab=me";
    renderWithProviders(<HomePage />);
    expect(await screen.findByText("Belajar Next.js")).toBeInTheDocument();
    expect(getPosts).toHaveBeenCalledWith(true);
    expect(screen.getByRole("heading", { name: "Postingan saya" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Milik saya" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: /Hapus semua/ })).toBeInTheDocument();
  });

  it("menampilkan keadaan kosong", async () => {
    vi.mocked(getPosts).mockResolvedValue([]);
    renderWithProviders(<HomePage />);
    expect(await screen.findByText("Belum ada postingan")).toBeInTheDocument();
  });

  it("menyembunyikan tombol hapus semua jika tab saya kosong", async () => {
    navigation.search = "tab=me";
    vi.mocked(getPosts).mockResolvedValue([]);
    renderWithProviders(<HomePage />);
    await screen.findByText("Belum ada postingan");
    expect(screen.queryByRole("button", { name: /Hapus semua/ })).not.toBeInTheDocument();
  });

  it("menyaring postingan berdasarkan deskripsi atau nama pembuat", async () => {
    const { user } = renderWithProviders(<HomePage />);
    await screen.findByText("Belajar Next.js");
    const search = screen.getByRole("searchbox", { name: "Cari postingan" });

    await user.type(search, "nasi");
    expect(screen.queryByText("Belajar Next.js")).not.toBeInTheDocument();
    expect(screen.getByText("Resep nasi goreng")).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "budi");
    expect(screen.getByText("Belajar Next.js")).toBeInTheDocument();
    expect(screen.queryByText("Resep nasi goreng")).not.toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "tidak ada");
    expect(screen.getByText("Tidak ada postingan yang cocok")).toBeInTheDocument();
  });

  it("menampilkan error jika postingan gagal dimuat", async () => {
    vi.mocked(getPosts).mockRejectedValue(new Error("Server mati"));
    renderWithProviders(<HomePage />);
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Server mati"));
  });

  it("menambah postingan lalu memuat ulang daftar", async () => {
    vi.mocked(addPost).mockResolvedValue({ status: "success", message: "ok", data: { post_id: 3 } });
    const { user } = renderWithProviders(<HomePage />);
    await screen.findByText("Belajar Next.js");
    await user.click(screen.getByRole("button", { name: /Tulis postingan/ }));
    await user.type(screen.getByLabelText("Deskripsi"), "Cerita baru");
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(addPost).toHaveBeenCalledWith("Cerita baru");
    expect(getPosts).toHaveBeenCalledTimes(2);
  });

  it("menutup modal tambah lewat Batal", async () => {
    const { user } = renderWithProviders(<HomePage />);
    await screen.findByText("Belajar Next.js");
    await user.click(screen.getByRole("button", { name: /Tulis postingan/ }));
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  describe("hapus semua postingan", () => {
    beforeEach(() => {
      navigation.search = "tab=me";
    });

    it("tidak menghapus jika dibatalkan", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(false);
      const { user } = renderWithProviders(<HomePage />);
      await screen.findByText("Belajar Next.js");
      await user.click(screen.getByRole("button", { name: /Hapus semua/ }));
      expect(deleteAllPosts).not.toHaveBeenCalled();
    });

    it("menghapus lalu memuat ulang jika dikonfirmasi", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(deleteAllPosts).mockResolvedValue({ status: "success", message: "ok", data: null });
      const { user } = renderWithProviders(<HomePage />);
      await screen.findByText("Belajar Next.js");
      await user.click(screen.getByRole("button", { name: /Hapus semua/ }));
      await waitFor(() => expect(getPosts).toHaveBeenCalledTimes(2));
      expect(deleteAllPosts).toHaveBeenCalledTimes(1);
    });

    it("tidak memuat ulang jika penghapusan gagal", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(deleteAllPosts).mockRejectedValue(new Error("gagal"));
      const { user } = renderWithProviders(<HomePage />);
      await screen.findByText("Belajar Next.js");
      await user.click(screen.getByRole("button", { name: /Hapus semua/ }));
      await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("gagal"));
      expect(getPosts).toHaveBeenCalledTimes(1);
    });
  });
});
