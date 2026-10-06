import { screen, waitFor } from "@testing-library/react";
import { getAccessToken } from "@/helpers/apiHelper";
import { showErrorDialog } from "@/helpers/toolsHelper";
import { navigation, renderWithProviders } from "@/test-utils";
import { login } from "../api/authApi";
import LoginPage from "./LoginPage";

vi.mock("../api/authApi");
vi.mock("@/helpers/toolsHelper");

describe("LoginPage", () => {
  it("menampilkan pesan validasi untuk formulir kosong", async () => {
    const { user } = renderWithProviders(<LoginPage />);
    await user.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getByText("Email wajib diisi")).toBeInTheDocument();
    expect(screen.getByText("Kata sandi wajib diisi")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("menolak format email yang tidak valid", async () => {
    const { user } = renderWithProviders(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "bukan-email");
    await user.type(screen.getByLabelText("Kata sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it("masuk, menyimpan token, lalu menuju dashboard", async () => {
    vi.mocked(login).mockResolvedValue({ status: "success", message: "ok", data: { token: "jwt" } });
    const { user } = renderWithProviders(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "  a@b.co ");
    await user.type(screen.getByLabelText("Kata sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/"));
    expect(login).toHaveBeenCalledWith("a@b.co", "123456");
    expect(getAccessToken()).toBe("jwt");
  });

  it("menampilkan status memproses selama permintaan berjalan", async () => {
    let resolve!: (value: Awaited<ReturnType<typeof login>>) => void;
    vi.mocked(login).mockReturnValue(new Promise((r) => (resolve = r)));
    const { user } = renderWithProviders(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "a@b.co");
    await user.type(screen.getByLabelText("Kata sandi"), "123456");
    await user.click(screen.getByRole("button", { name: "Masuk" }));
    expect(await screen.findByRole("button", { name: "Memproses…" })).toBeDisabled();
    resolve({ status: "success", message: "ok", data: { token: "t" } });
    await waitFor(() => expect(navigation.replace).toHaveBeenCalled());
  });

  it("tetap di halaman dan menampilkan error saat login gagal", async () => {
    vi.mocked(login).mockRejectedValue(new Error("Email atau kata sandi salah"));
    const { user } = renderWithProviders(<LoginPage />);
    await user.type(screen.getByLabelText("Email"), "a@b.co");
    await user.type(screen.getByLabelText("Kata sandi"), "salah");
    await user.click(screen.getByRole("button", { name: "Masuk" }));
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Email atau kata sandi salah"));
    expect(navigation.replace).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Masuk" })).toBeEnabled();
  });

  it("menyediakan tautan ke halaman daftar", () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByRole("link", { name: "Daftar sekarang" })).toHaveAttribute("href", "/auth/register");
  });
});
