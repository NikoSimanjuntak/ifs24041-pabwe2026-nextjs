import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "./Modal";

describe("Modal", () => {
  it("menampilkan judul dan isi", () => {
    render(<Modal title="Judul" onClose={vi.fn()}><p>Isi</p></Modal>);
    expect(screen.getByRole("dialog", { name: "Judul" })).toBeInTheDocument();
    expect(screen.getByText("Isi")).toBeInTheDocument();
  });

  it("menutup lewat tombol Tutup", async () => {
    const onClose = vi.fn();
    render(<Modal title="Judul" onClose={onClose}>x</Modal>);
    await userEvent.click(screen.getByRole("button", { name: "Tutup" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menutup dengan Escape tetapi mengabaikan tombol lain", () => {
    const onClose = vi.fn();
    render(<Modal title="Judul" onClose={onClose}>x</Modal>);
    fireEvent.keyDown(document, { key: "Enter" });
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menutup saat latar diklik, bukan saat isi dialog diklik", () => {
    const onClose = vi.fn();
    render(<Modal title="Judul" onClose={onClose}>x</Modal>);
    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
