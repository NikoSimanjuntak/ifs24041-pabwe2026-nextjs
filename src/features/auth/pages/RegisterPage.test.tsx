import { screen, waitFor } from "@testing-library/react";
import { showErrorDialog, showSuccessDialog } from "@/helpers/toolsHelper";
import { navigation, renderWithProviders } from "@/test-utils";
import { register } from "../api/authApi";
import RegisterPage from "./RegisterPage";

vi.mock("../api/authApi");
vi.mock("@/helpers/toolsHelper");

async function fill(user: ReturnType<typeof renderWithProviders>["user"], values: Record<string, string>) {
  for (const [label, value] of Object.entries(values)) {
    if (value) await user.type(screen.getByLabelText(label), value);
  }
  await user.click(screen.getByRole("button", { name: "Daftar" }));
}

describe("RegisterPage", () => {
  it("menampilkan semua pesan validasi untuk formulir kosong", async () => {
    const { user } = renderWithProviders(<RegisterPage />);
    await fill(user, {});
    expect(screen.getByText("Nama wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi minimal 6 karakter")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("memeriksa format email dan konfirmasi kata sandi", async () => {
    const { user } = renderWithProviders(<RegisterPage />);
    await fill(user, { "Nama lengkap": "Budi", Email: "salah", "Kata sandi": "123456", "Ulangi kata sandi": "654321" });
    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(screen.getByText("Konfirmasi kata sandi tidak sama")).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it("mendaftar lalu mengarahkan ke halaman masuk", async () => {
    vi.mocked(register).mockResolvedValue({ status: "success", message: "Akun dibuat", data: null });
    const { user } = renderWithProviders(<RegisterPage />);
    await fill(user, { "Nama lengkap": " Budi ", Email: "budi@del.ac.id", "Kata sandi": "123456", "Ulangi kata sandi": "123456" });
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/auth/login"));
    expect(register).toHaveBeenCalledWith("Budi", "budi@del.ac.id", "123456");
    expect(showSuccessDialog).toHaveBeenCalledWith("Akun dibuat");
  });

  it("tetap di halaman jika pendaftaran gagal", async () => {
    vi.mocked(register).mockRejectedValue(new Error("Email sudah terdaftar"));
    const { user } = renderWithProviders(<RegisterPage />);
    await fill(user, { "Nama lengkap": "Budi", Email: "budi@del.ac.id", "Kata sandi": "123456", "Ulangi kata sandi": "123456" });
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Email sudah terdaftar"));
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Daftar" })).toBeEnabled();
  });

  it("menyediakan tautan ke halaman masuk", () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/auth/login");
  });
});
