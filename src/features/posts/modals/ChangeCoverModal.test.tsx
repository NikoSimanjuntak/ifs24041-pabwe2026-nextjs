import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/test-utils";
import { changeCover } from "../api/postApi";
import ChangeCoverModal from "./ChangeCoverModal";

vi.mock("../api/postApi");
vi.mock("@/helpers/toolsHelper");

const image = (name = "cover.png", type = "image/png") => new File(["x"], name, { type });
const choose = (file: File | null) =>
  fireEvent.change(screen.getByLabelText("Pilih gambar"), { target: { files: file ? [file] : [] } });

const setup = (props: Partial<React.ComponentProps<typeof ChangeCoverModal>> = {}, preloadedState = {}) =>
  renderWithProviders(<ChangeCoverModal postId={4} onClose={vi.fn()} onSuccess={vi.fn()} {...props} />, { preloadedState });

describe("ChangeCoverModal", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:preview");
    URL.revokeObjectURL = vi.fn();
  });

  it("meminta gambar dipilih sebelum mengunggah", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Unggah sampul" }));
    expect(screen.getByText("Pilih gambar terlebih dahulu")).toBeInTheDocument();
    expect(changeCover).not.toHaveBeenCalled();
  });

  it("mengabaikan pemilihan tanpa berkas", () => {
    setup();
    choose(null);
    expect(screen.getByText("Pratinjau muncul di sini")).toBeInTheDocument();
  });

  it("menolak berkas yang bukan gambar", () => {
    setup();
    choose(image("dok.pdf", "application/pdf"));
    expect(screen.getByText("Berkas harus berupa gambar")).toBeInTheDocument();
  });

  it("menolak gambar lebih dari 5 MB", () => {
    setup();
    choose(new File([new ArrayBuffer(5 * 1024 * 1024 + 1)], "besar.png", { type: "image/png" }));
    expect(screen.getByText("Ukuran gambar maksimal 5 MB")).toBeInTheDocument();
  });

  it("menampilkan pratinjau, mengganti berkas, dan melepas URL lama", () => {
    const { unmount } = setup();
    choose(image("a.png"));
    expect(screen.getByAltText("Pratinjau sampul")).toHaveAttribute("src", "blob:preview");
    URL.createObjectURL = vi.fn(() => "blob:kedua");
    choose(image("b.png"));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
    unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:kedua");
  });

  it("mengunggah sampul lalu memanggil onSuccess", async () => {
    vi.mocked(changeCover).mockResolvedValue({ status: "success", message: "ok", data: null });
    const onSuccess = vi.fn();
    const { user } = setup({ onSuccess });
    const file = image();
    choose(file);
    await user.click(screen.getByRole("button", { name: "Unggah sampul" }));
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(changeCover).toHaveBeenCalledWith(4, file);
  });

  it("menghapus pesan error setelah memilih gambar yang valid", () => {
    setup();
    choose(image("dok.pdf", "application/pdf"));
    choose(image());
    expect(screen.queryByText("Berkas harus berupa gambar")).not.toBeInTheDocument();
  });

  it("tidak memanggil onSuccess jika unggahan gagal", async () => {
    vi.mocked(changeCover).mockRejectedValue(new Error("gagal"));
    const onSuccess = vi.fn();
    const { user } = setup({ onSuccess });
    choose(image());
    await user.click(screen.getByRole("button", { name: "Unggah sampul" }));
    await waitFor(() => expect(changeCover).toHaveBeenCalled());
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("menonaktifkan tombol saat proses berjalan dan menutup lewat Batal", async () => {
    const onClose = vi.fn();
    const { user } = setup({ onClose }, { posts: { isPostChangeCover: true } });
    expect(screen.getByRole("button", { name: "Unggah sampul" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Batal" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
