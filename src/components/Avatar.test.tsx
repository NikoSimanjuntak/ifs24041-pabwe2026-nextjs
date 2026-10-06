import { render, screen } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
  it("menampilkan foto jika tersedia", () => {
    const { container } = render(<Avatar name="Budi" photo="https://cdn.test/budi.png" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "https://cdn.test/budi.png");
  });

  it("menampilkan inisial jika foto kosong", () => {
    render(<Avatar name="  budi" photo={null} className="size-20" />);
    const initial = screen.getByText("B");
    expect(initial).toHaveClass("size-20");
  });

  it("memakai ukuran bawaan dan foto tidak wajib", () => {
    render(<Avatar name="Ani" />);
    expect(screen.getByText("A")).toHaveClass("size-9");
  });
});
