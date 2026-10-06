import { fireEvent, screen, waitFor } from "@testing-library/react";
import { makeUser, renderWithProviders } from "@/test-utils";
import { changePassword, changePhoto, getProfile, updateProfile } from "../api/userApi";
import ProfilePage from "./ProfilePage";

vi.mock("../api/userApi");
vi.mock("@/helpers/toolsHelper");

const okResult = { status: "success", message: "ok", data: null };
const profile = makeUser({ id: 1, name: "Budi", email: "budi@del.ac.id" });
const preloaded = { users: { profile, isProfile: true } };
const image = (type = "image/png") => new File(["x"], "foto.png", { type });
const choosePhoto = (file: File) => fireEvent.change(screen.getByLabelText("Pilih foto"), { target: { files: [file] } });

describe("ProfilePage", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:foto");
    URL.revokeObjectURL = vi.fn();
  });

  it("tidak merender apa pun tanpa profil", () => {
    const { container } = renderWithProviders(<ProfilePage />);
    expect(container).toBeEmptyDOMElement();
  });

  it("menampilkan tiga bagian pengelolaan akun", () => {
    renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
    expect(screen.getByRole("heading", { name: "Profil saya" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nama")).toHaveValue("Budi");
    expect(screen.getByLabelText("Email")).toHaveValue("budi@del.ac.id");
    expect(screen.getByRole("heading", { name: "Foto profil" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Kata sandi" })).toBeInTheDocument();
  });

  describe("data diri", () => {
    it("memvalidasi nama dan email", async () => {
      const { user } = renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      await user.clear(screen.getByLabelText("Nama"));
      await user.clear(screen.getByLabelText("Email"));
      await user.click(screen.getByRole("button", { name: "Simpan data diri" }));
      expect(screen.getByText("Nama wajib diisi")).toBeInTheDocument();
      expect(screen.getByText("Format email tidak valid")).toBeInTheDocument();
      expect(updateProfile).not.toHaveBeenCalled();
    });

    it("menyimpan perubahan dan memperbarui profil di store", async () => {
      vi.mocked(updateProfile).mockResolvedValue({ status: "success", message: "ok", data: { user: { ...profile, name: "Budi Baru" } } });
      const { user, store } = renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      await user.clear(screen.getByLabelText("Nama"));
      await user.type(screen.getByLabelText("Nama"), " Budi Baru ");
      await user.click(screen.getByRole("button", { name: "Simpan data diri" }));
      await waitFor(() => expect(store.getState().users.profile?.name).toBe("Budi Baru"));
      expect(updateProfile).toHaveBeenCalledWith({ name: "Budi Baru", email: "budi@del.ac.id" });
    });

    it("menampilkan spinner dan menonaktifkan tombol saat menyimpan", () => {
      renderWithProviders(<ProfilePage />, { preloadedState: { users: { ...preloaded.users, isChangeProfile: true } } });
      expect(screen.getByRole("button", { name: "Simpan data diri" })).toBeDisabled();
    });
  });

  describe("foto profil", () => {
    it("meminta foto dipilih terlebih dahulu", async () => {
      const { user } = renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      await user.click(screen.getByRole("button", { name: "Unggah foto" }));
      expect(screen.getByText("Pilih foto terlebih dahulu")).toBeInTheDocument();
      expect(changePhoto).not.toHaveBeenCalled();
    });

    it("mengabaikan pemilihan tanpa berkas", () => {
      renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      fireEvent.change(screen.getByLabelText("Pilih foto"), { target: { files: [] } });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("menolak berkas non-gambar dan foto lebih dari 2 MB", () => {
      renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      choosePhoto(image("application/pdf"));
      expect(screen.getByText("Berkas harus berupa gambar")).toBeInTheDocument();
      choosePhoto(new File([new ArrayBuffer(2 * 1024 * 1024 + 1)], "besar.png", { type: "image/png" }));
      expect(screen.getByText("Ukuran foto maksimal 2 MB")).toBeInTheDocument();
    });

    it("menampilkan pratinjau lalu mengunggah dan membersihkannya", async () => {
      vi.mocked(changePhoto).mockResolvedValue(okResult);
      vi.mocked(getProfile).mockResolvedValue({ ...profile, photo: "img/profile/1.png" });
      const { user, store } = renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      const file = image();
      choosePhoto(file);
      expect(screen.getByAltText("Pratinjau foto profil")).toHaveAttribute("src", "blob:foto");
      await user.click(screen.getByRole("button", { name: "Unggah foto" }));
      await waitFor(() => expect(screen.queryByAltText("Pratinjau foto profil")).not.toBeInTheDocument());
      expect(changePhoto).toHaveBeenCalledWith(file);
      expect(store.getState().users.profile?.photo).toBe("img/profile/1.png");
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:foto");
    });

    it("mempertahankan pratinjau jika unggahan gagal", async () => {
      vi.mocked(changePhoto).mockRejectedValue(new Error("gagal"));
      const { user } = renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      choosePhoto(image());
      await user.click(screen.getByRole("button", { name: "Unggah foto" }));
      await waitFor(() => expect(changePhoto).toHaveBeenCalled());
      expect(screen.getByAltText("Pratinjau foto profil")).toBeInTheDocument();
    });

    it("menonaktifkan tombol saat mengunggah", () => {
      renderWithProviders(<ProfilePage />, { preloadedState: { users: { ...preloaded.users, isChangeProfilePhoto: true } } });
      expect(screen.getByRole("button", { name: "Unggah foto" })).toBeDisabled();
    });
  });

  describe("kata sandi", () => {
    const fill = async (user: ReturnType<typeof renderWithProviders>["user"], values: [string, string, string]) => {
      const labels = ["Kata sandi saat ini", "Kata sandi baru", "Ulangi kata sandi baru"];
      for (const [index, value] of values.entries()) {
        if (value) await user.type(screen.getByLabelText(labels[index]), value);
      }
      await user.click(screen.getByRole("button", { name: "Ubah kata sandi" }));
    };

    it("memvalidasi seluruh kolom", async () => {
      const { user } = renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      await fill(user, ["", "123", "456"]);
      expect(screen.getByText("Kata sandi saat ini wajib diisi")).toBeInTheDocument();
      expect(screen.getByText("Kata sandi baru minimal 6 karakter")).toBeInTheDocument();
      expect(screen.getByText("Konfirmasi kata sandi tidak sama")).toBeInTheDocument();
      expect(changePassword).not.toHaveBeenCalled();
    });

    it("mengubah kata sandi lalu mengosongkan kolom", async () => {
      vi.mocked(changePassword).mockResolvedValue(okResult);
      const { user } = renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      await fill(user, ["lama123", "baru123", "baru123"]);
      await waitFor(() => expect(screen.getByLabelText("Kata sandi baru")).toHaveValue(""));
      expect(changePassword).toHaveBeenCalledWith({
        password: "lama123",
        new_password: "baru123",
        new_password_confirmation: "baru123",
      });
      expect(screen.getByLabelText("Kata sandi saat ini")).toHaveValue("");
      expect(screen.getByLabelText("Ulangi kata sandi baru")).toHaveValue("");
    });

    it("mempertahankan isian jika perubahan gagal", async () => {
      vi.mocked(changePassword).mockRejectedValue(new Error("Kata sandi salah"));
      const { user } = renderWithProviders(<ProfilePage />, { preloadedState: preloaded });
      await fill(user, ["lama123", "baru123", "baru123"]);
      await waitFor(() => expect(changePassword).toHaveBeenCalled());
      expect(screen.getByLabelText("Kata sandi baru")).toHaveValue("baru123");
    });

    it("menonaktifkan tombol saat proses berjalan", () => {
      renderWithProviders(<ProfilePage />, { preloadedState: { users: { ...preloaded.users, isChangeProfilePassword: true } } });
      expect(screen.getByRole("button", { name: "Ubah kata sandi" })).toBeDisabled();
    });
  });
});
