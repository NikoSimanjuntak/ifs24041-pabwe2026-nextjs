import { screen, waitFor } from "@testing-library/react";
import { showConfirmDialog } from "@/helpers/toolsHelper";
import { makePost, makeUser, navigation, renderWithProviders } from "@/test-utils";
import type { PostComment } from "@/types";
import {
  addComment,
  changeCover,
  deleteComment,
  deletePost,
  getPost,
  toggleLike,
  updatePost,
} from "../api/postApi";
import DetailPage from "./DetailPage";

vi.mock("../api/postApi");
vi.mock("@/helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/helpers/toolsHelper")>()),
  showConfirmDialog: vi.fn(),
  showErrorDialog: vi.fn(),
  showSuccessDialog: vi.fn(),
}));

const okResult = { status: "success", message: "ok", data: null };
const comment = (id: number, text: string): PostComment => ({
  id,
  comment: text,
  created_at: "2024-10-05T03:49:59.000000Z",
  updated_at: "2024-10-05T03:49:59.000000Z",
});

const owner = { users: { profile: makeUser({ id: 1 }), isProfile: true } };
const visitor = { users: { profile: makeUser({ id: 9 }), isProfile: true } };

describe("DetailPage", () => {
  beforeEach(() => {
    navigation.params = { postId: "1" };
    vi.mocked(getPost).mockResolvedValue(
      makePost({
        id: 1,
        user_id: 1,
        description: "Isi postingan",
        cover: "https://cdn.test/c.png",
        likes: [2],
        comments: [comment(10, "Komentar saya"), comment(11, "Komentar teman"), 12],
        my_comment: comment(10, "Komentar saya"),
      }),
    );
  });

  it("menampilkan indikator lalu rincian postingan", async () => {
    renderWithProviders(<DetailPage />, { preloadedState: owner });
    expect(screen.getByRole("status")).toHaveTextContent("Memuat postingan");
    expect(await screen.findByText("Isi postingan")).toBeInTheDocument();
    expect(getPost).toHaveBeenCalledWith(1);
    expect(screen.getByAltText("Sampul postingan")).toHaveAttribute("src", "https://cdn.test/c.png");
    expect(screen.getByRole("heading", { name: /Komentar \(2\)/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Kembali ke linimasa/ })).toHaveAttribute("href", "/");
  });

  it("menampilkan placeholder saat sampul belum ada", async () => {
    vi.mocked(getPost).mockResolvedValue(makePost({ id: 1 }));
    renderWithProviders(<DetailPage />, { preloadedState: owner });
    await screen.findByText("Terus belajar apapun rintangannya!");
    expect(screen.queryByAltText("Sampul postingan")).not.toBeInTheDocument();
    expect(screen.getByText("Belum ada komentar. Mulai percakapan.")).toBeInTheDocument();
  });

  it("menampilkan pesan jika postingan tidak ditemukan", async () => {
    vi.mocked(getPost).mockRejectedValue(new Error("Data tidak ditemukan"));
    renderWithProviders(<DetailPage />, { preloadedState: owner });
    expect(await screen.findByText("Postingan tidak ditemukan.")).toBeInTheDocument();
  });

  it("tidak menampilkan postingan lain yang masih tersimpan di store", async () => {
    vi.mocked(getPost).mockReturnValue(new Promise(() => {}));
    renderWithProviders(<DetailPage />, { preloadedState: { ...owner, posts: { post: makePost({ id: 2, description: "Lama" }) } } });
    expect(screen.queryByText("Lama")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Memuat postingan");
  });

  describe("hak akses", () => {
    it("pemilik melihat tombol kelola", async () => {
      renderWithProviders(<DetailPage />, { preloadedState: owner });
      await screen.findByText("Isi postingan");
      expect(screen.getByRole("button", { name: /Ubah cover/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Ubah postingan/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Hapus postingan/ })).toBeInTheDocument();
    });

    it("pengguna lain tidak melihat tombol kelola", async () => {
      renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Isi postingan");
      expect(screen.queryByRole("button", { name: /Ubah cover/ })).not.toBeInTheDocument();
    });

    it("tanpa profil tidak dianggap pemilik maupun penyuka", async () => {
      renderWithProviders(<DetailPage />);
      await screen.findByText("Isi postingan");
      expect(screen.queryByRole("button", { name: /Ubah postingan/ })).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Suka/ })).toHaveAttribute("aria-pressed", "false");
    });
  });

  describe("suka", () => {
    it("memberi suka lalu memuat ulang", async () => {
      vi.mocked(toggleLike).mockResolvedValue(okResult);
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: /Suka · 1/ }));
      await waitFor(() => expect(getPost).toHaveBeenCalledTimes(2));
      expect(toggleLike).toHaveBeenCalledWith(1, true);
    });

    it("membatalkan suka jika sudah menyukai", async () => {
      vi.mocked(toggleLike).mockResolvedValue(okResult);
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: { users: { profile: makeUser({ id: 2 }), isProfile: true } } });
      await screen.findByText("Isi postingan");
      const button = screen.getByRole("button", { name: /Disukai/ });
      expect(button).toHaveAttribute("aria-pressed", "true");
      await user.click(button);
      await waitFor(() => expect(toggleLike).toHaveBeenCalledWith(1, false));
    });

    it("tidak memuat ulang jika gagal", async () => {
      vi.mocked(toggleLike).mockRejectedValue(new Error("gagal"));
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: /Suka/ }));
      await waitFor(() => expect(toggleLike).toHaveBeenCalled());
      expect(getPost).toHaveBeenCalledTimes(1);
    });
  });

  describe("komentar", () => {
    it("menolak komentar kosong", async () => {
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: "Kirim komentar" }));
      expect(screen.getByText("Komentar tidak boleh kosong")).toBeInTheDocument();
      expect(addComment).not.toHaveBeenCalled();
    });

    it("mengirim komentar, mengosongkan kolom, dan memuat ulang", async () => {
      vi.mocked(addComment).mockResolvedValue(okResult);
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Isi postingan");
      const box = screen.getByLabelText("Tulis komentar");
      await user.type(box, " Mantap ");
      await user.click(screen.getByRole("button", { name: "Kirim komentar" }));
      await waitFor(() => expect(getPost).toHaveBeenCalledTimes(2));
      expect(addComment).toHaveBeenCalledWith(1, "Mantap");
      expect(box).toHaveValue("");
    });

    it("mempertahankan teks jika pengiriman gagal", async () => {
      vi.mocked(addComment).mockRejectedValue(new Error("gagal"));
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Isi postingan");
      await user.type(screen.getByLabelText("Tulis komentar"), "Halo");
      await user.click(screen.getByRole("button", { name: "Kirim komentar" }));
      await waitFor(() => expect(addComment).toHaveBeenCalled());
      expect(screen.getByLabelText("Tulis komentar")).toHaveValue("Halo");
      expect(getPost).toHaveBeenCalledTimes(1);
    });

    it("hanya menampilkan tombol hapus pada komentar milik sendiri", async () => {
      renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Komentar saya");
      expect(screen.getAllByRole("button", { name: "Hapus komentar saya" })).toHaveLength(1);
    });

    it("tidak menampilkan tombol hapus jika tidak punya komentar", async () => {
      vi.mocked(getPost).mockResolvedValue(makePost({ id: 1, comments: [comment(11, "Komentar teman")] }));
      renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Komentar teman");
      expect(screen.queryByRole("button", { name: "Hapus komentar saya" })).not.toBeInTheDocument();
    });

    it("tidak menghapus jika konfirmasi dibatalkan", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(false);
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Komentar saya");
      await user.click(screen.getByRole("button", { name: "Hapus komentar saya" }));
      expect(deleteComment).not.toHaveBeenCalled();
    });

    it("menghapus komentar lalu memuat ulang", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(deleteComment).mockResolvedValue(okResult);
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Komentar saya");
      await user.click(screen.getByRole("button", { name: "Hapus komentar saya" }));
      await waitFor(() => expect(getPost).toHaveBeenCalledTimes(2));
      expect(deleteComment).toHaveBeenCalledWith(1);
    });

    it("tidak memuat ulang jika penghapusan komentar gagal", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(deleteComment).mockRejectedValue(new Error("gagal"));
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: visitor });
      await screen.findByText("Komentar saya");
      await user.click(screen.getByRole("button", { name: "Hapus komentar saya" }));
      await waitFor(() => expect(deleteComment).toHaveBeenCalled());
      expect(getPost).toHaveBeenCalledTimes(1);
    });
  });

  describe("kelola postingan", () => {
    it("menghapus postingan lalu kembali ke linimasa", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(deletePost).mockResolvedValue(okResult);
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: owner });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: /Hapus postingan/ }));
      await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/"));
      expect(deletePost).toHaveBeenCalledWith(1);
    });

    it("tidak menghapus jika dibatalkan", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(false);
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: owner });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: /Hapus postingan/ }));
      expect(deletePost).not.toHaveBeenCalled();
    });

    it("tetap di halaman jika penghapusan gagal", async () => {
      vi.mocked(showConfirmDialog).mockResolvedValue(true);
      vi.mocked(deletePost).mockRejectedValue(new Error("gagal"));
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: owner });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: /Hapus postingan/ }));
      await waitFor(() => expect(deletePost).toHaveBeenCalled());
      expect(navigation.replace).not.toHaveBeenCalled();
    });

    it("mengubah deskripsi lewat modal lalu memuat ulang", async () => {
      vi.mocked(updatePost).mockResolvedValue(okResult);
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: owner });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: /Ubah postingan/ }));
      expect(screen.getByLabelText("Deskripsi")).toHaveValue("Isi postingan");
      await user.type(screen.getByLabelText("Deskripsi"), " baru");
      await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(updatePost).toHaveBeenCalledWith(1, "Isi postingan baru");
      expect(getPost).toHaveBeenCalledTimes(2);
    });

    it("menutup modal ubah lewat Batal", async () => {
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: owner });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: /Ubah postingan/ }));
      await user.click(screen.getByRole("button", { name: "Batal" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("mengganti cover lewat modal lalu memuat ulang", async () => {
      URL.createObjectURL = vi.fn(() => "blob:x");
      URL.revokeObjectURL = vi.fn();
      vi.mocked(changeCover).mockResolvedValue(okResult);
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: owner });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: /Ubah cover/ }));
      await user.upload(screen.getByLabelText("Pilih gambar"), new File(["x"], "baru.png", { type: "image/png" }));
      await user.click(screen.getByRole("button", { name: "Unggah sampul" }));
      await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
      expect(changeCover).toHaveBeenCalledWith(1, expect.any(File));
      expect(getPost).toHaveBeenCalledTimes(2);
    });

    it("menutup modal cover lewat Batal", async () => {
      const { user } = renderWithProviders(<DetailPage />, { preloadedState: owner });
      await screen.findByText("Isi postingan");
      await user.click(screen.getByRole("button", { name: /Ubah cover/ }));
      await user.click(screen.getByRole("button", { name: "Batal" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
