import { screen, waitFor } from "@testing-library/react";
import { getAccessToken, putAccessToken } from "@/helpers/apiHelper";
import { getProfile } from "@/features/users/api/userApi";
import { makeUser, navigation, renderWithProviders } from "@/test-utils";
import PostLayout from "./PostLayout";

vi.mock("@/features/users/api/userApi");
vi.mock("@/helpers/toolsHelper");

describe("PostLayout", () => {
  it("mengalihkan ke halaman masuk jika token tidak ada", async () => {
    renderWithProviders(<PostLayout><p>Konten</p></PostLayout>);
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/auth/login"));
    expect(screen.getByRole("status")).toHaveTextContent("Memuat sesi");
    expect(screen.queryByText("Konten")).not.toBeInTheDocument();
    expect(getProfile).not.toHaveBeenCalled();
  });

  it("memuat profil lalu menampilkan shell dashboard", async () => {
    putAccessToken("jwt");
    vi.mocked(getProfile).mockResolvedValue(makeUser({ name: "Budi" }));
    renderWithProviders(<PostLayout><p>Konten</p></PostLayout>);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(await screen.findByText("Konten")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByLabelText("Navigasi utama")).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("tidak memuat ulang profil yang sudah tersedia", () => {
    putAccessToken("jwt");
    renderWithProviders(<PostLayout><p>Konten</p></PostLayout>, {
      preloadedState: { users: { profile: makeUser(), isProfile: true } },
    });
    expect(screen.getByText("Konten")).toBeInTheDocument();
    expect(getProfile).not.toHaveBeenCalled();
  });

  it("menghapus token dan keluar jika sesi tidak valid", async () => {
    putAccessToken("kedaluwarsa");
    vi.mocked(getProfile).mockRejectedValue(new Error("Unauthenticated."));
    renderWithProviders(<PostLayout><p>Konten</p></PostLayout>);
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/auth/login"));
    expect(getAccessToken()).toBeNull();
    expect(screen.queryByText("Konten")).not.toBeInTheDocument();
  });

  it("membuka dan menutup drawer navigasi di perangkat mobile", async () => {
    putAccessToken("jwt");
    const { user } = renderWithProviders(<PostLayout><p>Konten</p></PostLayout>, {
      preloadedState: { users: { profile: makeUser(), isProfile: true } },
    });
    await user.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(screen.getByTestId("sidebar-backdrop")).toBeInTheDocument();
    await user.click(screen.getByTestId("sidebar-backdrop"));
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
  });
});
