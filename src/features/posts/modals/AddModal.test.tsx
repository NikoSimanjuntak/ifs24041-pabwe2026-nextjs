import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { addPost } from "../api/postApi";
import AddModal from "./AddModal";

vi.mock("../api/postApi");
vi.mock("@/helpers/toolsHelper");

describe("AddModal", () => {
  it("menolak deskripsi kosong", async () => {
    const onSuccess = vi.fn();
    const { user } = renderWithProviders(<AddModal onClose={vi.fn()} onSuccess={onSuccess} />);
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));
    expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
    expect(addPost).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("menerbitkan postingan dan memanggil onSuccess", async () => {
    vi.mocked(addPost).mockResolvedValue({ status: "success", message: "Berhasil", data: { post_id: 9 } });
    const onSuccess = vi.fn();
    const { user } = renderWithProviders(<AddModal onClose={vi.fn()} onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText("Deskripsi"), "  Halo dunia ");
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(addPost).toHaveBeenCalledWith("Halo dunia");
  });

  it("menghapus pesan error setelah deskripsi diisi", async () => {
    vi.mocked(addPost).mockResolvedValue({ status: "success", message: "ok", data: { post_id: 1 } });
    const { user } = renderWithProviders(<AddModal onClose={vi.fn()} onSuccess={vi.fn()} />);
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));
    await user.type(screen.getByLabelText("Deskripsi"), "isi");
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));
    await waitFor(() => expect(screen.queryByText("Deskripsi wajib diisi")).not.toBeInTheDocument());
  });

  it("tidak memanggil onSuccess jika penerbitan gagal", async () => {
    vi.mocked(addPost).mockRejectedValue(new Error("gagal"));
    const onSuccess = vi.fn();
    const { user } = renderWithProviders(<AddModal onClose={vi.fn()} onSuccess={onSuccess} />);
    await user.type(screen.getByLabelText("Deskripsi"), "isi");
    await user.click(screen.getByRole("button", { name: "Terbitkan" }));
    await waitFor(() => expect(addPost).toHaveBeenCalled());
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("menonaktifkan tombol saat proses berjalan dan menutup lewat Batal", async () => {
    const onClose = vi.fn();
    const { user } = renderWithProviders(<AddModal onClose={onClose} onSuccess={vi.fn()} />, {
      preloadedState: { posts: { isPostAdd: true } },
    });
    expect(screen.getByRole("button", { name: "Terbitkan" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
