import { render, screen } from "@testing-library/react";
import { putAccessToken } from "@/helpers/apiHelper";
import { navigation } from "@/test-utils";
import AuthLayout from "./AuthLayout";

describe("AuthLayout", () => {
  it("menampilkan banner dan konten anak", () => {
    render(<AuthLayout><p>Formulir</p></AuthLayout>);
    expect(screen.getByText("Formulir")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(navigation.replace).not.toHaveBeenCalled();
  });

  it("mengalihkan ke dashboard jika sesi sudah aktif", () => {
    putAccessToken("jwt");
    render(<AuthLayout><p>Formulir</p></AuthLayout>);
    expect(navigation.replace).toHaveBeenCalledWith("/");
  });
});
