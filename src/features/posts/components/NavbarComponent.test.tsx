import { screen, waitFor } from "@testing-library/react";
import { getAccessToken, putAccessToken } from "@/helpers/apiHelper";
import { showConfirmDialog } from "@/helpers/toolsHelper";
import { makeUser, navigation, renderWithProviders } from "@/test-utils";
import NavbarComponent from "./NavbarComponent";

vi.mock("@/helpers/toolsHelper");

const preloaded = { users: { profile: makeUser({ name: "Budi", email: "budi@del.ac.id" }), isProfile: true } };

describe("NavbarComponent", () => {
  it("tidak merender apa pun tanpa profil", () => {
    const { container } = renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("menampilkan identitas pengguna aktif", () => {
    renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, { preloadedState: preloaded });
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("budi@del.ac.id")).toBeInTheDocument();
  });

  it("memanggil onMenuClick saat tombol menu ditekan", async () => {
    const onMenuClick = vi.fn();
    const { user } = renderWithProviders(<NavbarComponent onMenuClick={onMenuClick} />, { preloadedState: preloaded });
    await user.click(screen.getByRole("button", { name: "Buka menu" }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });

  it("membuka dan menutup dropdown", async () => {
    const { user } = renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, { preloadedState: preloaded });
    const trigger = screen.getByRole("button", { name: /Budi/ });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.click(trigger);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("menutup dropdown setelah memilih Profil saya", async () => {
    const { user } = renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, { preloadedState: preloaded });
    await user.click(screen.getByRole("button", { name: /Budi/ }));
    await user.click(screen.getByRole("menuitem", { name: /Profil saya/ }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("keluar dari akun setelah dikonfirmasi", async () => {
    putAccessToken("jwt");
    vi.mocked(showConfirmDialog).mockResolvedValue(true);
    const { user, store } = renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, { preloadedState: preloaded });
    await user.click(screen.getByRole("button", { name: /Budi/ }));
    await user.click(screen.getByRole("menuitem", { name: /Keluar/ }));
    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/auth/login"));
    expect(getAccessToken()).toBeNull();
    expect(store.getState().users.profile).toBeNull();
  });

  it("tetap masuk jika konfirmasi keluar dibatalkan", async () => {
    putAccessToken("jwt");
    vi.mocked(showConfirmDialog).mockResolvedValue(false);
    const { user } = renderWithProviders(<NavbarComponent onMenuClick={vi.fn()} />, { preloadedState: preloaded });
    await user.click(screen.getByRole("button", { name: /Budi/ }));
    await user.click(screen.getByRole("menuitem", { name: /Keluar/ }));
    await waitFor(() => expect(showConfirmDialog).toHaveBeenCalled());
    expect(getAccessToken()).toBe("jwt");
    expect(navigation.replace).not.toHaveBeenCalled();
  });
});
