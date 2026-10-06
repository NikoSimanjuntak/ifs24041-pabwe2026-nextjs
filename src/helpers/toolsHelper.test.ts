import Swal, { type SweetAlertResult } from "sweetalert2";
import {
  formatDate,
  showConfirmDialog,
  showErrorDialog,
  showSuccessDialog,
  showWarningDialog,
} from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));

describe("dialog helpers", () => {
  it.each([
    ["success", showSuccessDialog, "Berhasil"],
    ["error", showErrorDialog, "Terjadi kesalahan"],
    ["warning", showWarningDialog, "Perhatian"],
  ] as const)("menampilkan dialog %s", (icon, show, title) => {
    show("Pesan uji");
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ icon, title, text: "Pesan uji" }));
  });

  it("showConfirmDialog mengembalikan true saat dikonfirmasi", async () => {
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: true } as SweetAlertResult);
    await expect(showConfirmDialog("Judul", "Teks")).resolves.toBe(true);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ confirmButtonText: "Ya, lanjutkan", showCancelButton: true }));
  });

  it("showConfirmDialog mengembalikan false saat dibatalkan dan mendukung teks tombol kustom", async () => {
    vi.mocked(Swal.fire).mockResolvedValue({ isConfirmed: false } as SweetAlertResult);
    await expect(showConfirmDialog("Judul", "Teks", "Hapus")).resolves.toBe(false);
    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({ confirmButtonText: "Hapus" }));
  });
});

describe("formatDate", () => {
  it("memformat tanggal ISO ke bahasa Indonesia", () => {
    const text = formatDate("2024-10-05T03:07:11.000000Z");
    expect(text).toContain("Oktober");
    expect(text).toContain("2024");
  });
});
