import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { updatePost } from "../api/postApi";
import ChangeModal from "./ChangeModal";

vi.mock("../api/postApi");
vi.mock("@/helpers/toolsHelper");

const setup = (props: Partial<React.ComponentProps<typeof ChangeModal>> = {}, preloadedState = {}) =>
  renderWithProviders(
    <ChangeModal postId={3} description="Awal" onClose={vi.fn()} onSuccess={vi.fn()} {...props} />,
    { preloadedState },
  );

describe("ChangeModal", () => {
  it("menampilkan deskripsi saat ini", () => {
    setup();
    expect(screen.getByLabelText("Deskripsi")).toHaveValue("Awal");
  });

  it("menolak deskripsi kosong", async () => {
    const { user } = setup();
    await user.clear(screen.getByLabelText("Deskripsi"));
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    expect(screen.getByText("Deskripsi wajib diisi")).toBeInTheDocument();
    expect(updatePost).not.toHaveBeenCalled();
  });

  it("menyimpan perubahan dan memanggil onSuccess", async () => {
    vi.mocked(updatePost).mockResolvedValue({ status: "success", message: "ok", data: null });
    const onSuccess = vi.fn();
    const { user } = setup({ onSuccess });
    await user.clear(screen.getByLabelText("Deskripsi"));
    await user.type(screen.getByLabelText("Deskripsi"), "Baru");
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(updatePost).toHaveBeenCalledWith(3, "Baru");
  });

  it("tidak memanggil onSuccess jika gagal", async () => {
    vi.mocked(updatePost).mockRejectedValue(new Error("gagal"));
    const onSuccess = vi.fn();
    const { user } = setup({ onSuccess });
    await user.click(screen.getByRole("button", { name: "Simpan perubahan" }));
    await waitFor(() => expect(updatePost).toHaveBeenCalled());
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("menonaktifkan tombol saat proses berjalan dan menutup lewat Batal", async () => {
    const onClose = vi.fn();
    const { user } = setup({ onClose }, { posts: { isPostChange: true } });
    expect(screen.getByRole("button", { name: "Simpan perubahan" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
