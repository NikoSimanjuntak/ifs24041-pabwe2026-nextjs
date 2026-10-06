import { screen, waitFor } from "@testing-library/react";
import { showErrorDialog } from "@/helpers/toolsHelper";
import { makeUser, renderWithProviders } from "@/test-utils";
import { getUsers } from "../api/userApi";
import UsersPage from "./UsersPage";

vi.mock("../api/userApi");
vi.mock("@/helpers/toolsHelper", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/helpers/toolsHelper")>()),
  showErrorDialog: vi.fn(),
}));

const users = [
  makeUser({ id: 1, name: "Budi Santoso", email: "budi@del.ac.id" }),
  makeUser({ id: 2, name: "Ani Lestari", email: "ani@del.ac.id", created_at: undefined }),
];

describe("UsersPage", () => {
  beforeEach(() => {
    vi.mocked(getUsers).mockResolvedValue(users);
  });

  it("menampilkan indikator lalu daftar pengguna", async () => {
    renderWithProviders(<UsersPage />);
    expect(screen.getByRole("status")).toHaveTextContent("Memuat pengguna");
    expect(await screen.findByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.getByText("ani@del.ac.id")).toBeInTheDocument();
    expect(screen.getAllByText(/Bergabung/)).toHaveLength(1);
  });

  it("menyaring berdasarkan nama atau email", async () => {
    const { user } = renderWithProviders(<UsersPage />);
    await screen.findByText("Budi Santoso");
    const search = screen.getByRole("searchbox", { name: "Cari pengguna" });

    await user.type(search, "lestari");
    expect(screen.queryByText("Budi Santoso")).not.toBeInTheDocument();
    expect(screen.getByText("Ani Lestari")).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, "budi@");
    expect(screen.getByText("Budi Santoso")).toBeInTheDocument();
    expect(screen.queryByText("Ani Lestari")).not.toBeInTheDocument();
  });

  it("menampilkan keadaan kosong saat tidak ada yang cocok", async () => {
    const { user } = renderWithProviders(<UsersPage />);
    await screen.findByText("Budi Santoso");
    await user.type(screen.getByRole("searchbox"), "zzz");
    expect(screen.getByText("Pengguna tidak ditemukan")).toBeInTheDocument();
  });

  it("menampilkan error jika gagal memuat", async () => {
    vi.mocked(getUsers).mockRejectedValue(new Error("Server mati"));
    renderWithProviders(<UsersPage />);
    await waitFor(() => expect(showErrorDialog).toHaveBeenCalledWith("Server mati"));
    expect(await screen.findByText("Pengguna tidak ditemukan")).toBeInTheDocument();
  });
});
