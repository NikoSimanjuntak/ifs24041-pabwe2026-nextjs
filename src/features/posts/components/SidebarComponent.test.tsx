import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { navigation } from "@/test-utils";
import SidebarComponent from "./SidebarComponent";

const labels = ["Semua Postingan", "Postingan Saya", "Daftar Pengguna", "Profil Saya"];

describe("SidebarComponent", () => {
  it("menampilkan empat rute utama", () => {
    render(<SidebarComponent open={false} onClose={vi.fn()} />);
    expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual(labels);
    expect(screen.getByRole("link", { name: "Postingan Saya" })).toHaveAttribute("href", "/?tab=me");
  });

  it.each([
    ["/", "", "Semua Postingan"],
    ["/", "tab=me", "Postingan Saya"],
    ["/users", "", "Daftar Pengguna"],
    ["/profile", "", "Profil Saya"],
  ])("menandai rute aktif untuk %s?%s", (pathname, search, active) => {
    navigation.pathname = pathname;
    navigation.search = search;
    render(<SidebarComponent open={false} onClose={vi.fn()} />);
    const current = screen.getAllByRole("link").filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.map((link) => link.textContent)).toEqual([active]);
  });

  it("tidak menandai rute apa pun pada halaman lain", () => {
    navigation.pathname = "/posts/1";
    render(<SidebarComponent open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole("link", { current: "page" })).not.toBeInTheDocument();
  });

  it("menyembunyikan drawer dan latar saat tertutup", () => {
    render(<SidebarComponent open={false} onClose={vi.fn()} />);
    expect(screen.queryByTestId("sidebar-backdrop")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Navigasi utama")).toHaveClass("-translate-x-full");
  });

  it("menampilkan drawer dan menutupnya lewat latar atau tombol tutup", async () => {
    const onClose = vi.fn();
    render(<SidebarComponent open onClose={onClose} />);
    expect(screen.getByLabelText("Navigasi utama")).toHaveClass("translate-x-0");
    await userEvent.click(screen.getByTestId("sidebar-backdrop"));
    await userEvent.click(screen.getByRole("button", { name: "Tutup menu" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("menutup drawer saat tautan dipilih", async () => {
    const onClose = vi.fn();
    render(<SidebarComponent open onClose={onClose} />);
    await userEvent.click(screen.getByRole("link", { name: "Daftar Pengguna" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
