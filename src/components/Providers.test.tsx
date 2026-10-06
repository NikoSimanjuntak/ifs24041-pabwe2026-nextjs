import { render, screen } from "@testing-library/react";
import { useAppSelector } from "@/hooks/redux";
import Providers from "./Providers";

function Probe() {
  const isPost = useAppSelector((state) => state.posts.isPost);
  return <p>isPost: {String(isPost)}</p>;
}

describe("Providers", () => {
  it("menyediakan Redux store bagi komponen anak", () => {
    render(
      <Providers>
        <Probe />
      </Providers>,
    );
    expect(screen.getByText("isPost: false")).toBeInTheDocument();
  });
});
