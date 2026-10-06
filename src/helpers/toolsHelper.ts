import Swal from "sweetalert2";

const theme = { confirmButtonColor: "#0d7a63", cancelButtonColor: "#5b716c" };

export const showSuccessDialog = (message: string) =>
  Swal.fire({
    ...theme,
    icon: "success",
    title: "Berhasil",
    text: message,
    timer: 1800,
    timerProgressBar: true,
    showConfirmButton: false,
  });

export const showErrorDialog = (message: string) =>
  Swal.fire({ ...theme, icon: "error", title: "Terjadi kesalahan", text: message, confirmButtonText: "Tutup" });

export const showWarningDialog = (message: string) =>
  Swal.fire({ ...theme, icon: "warning", title: "Perhatian", text: message, confirmButtonText: "Mengerti" });

export const showConfirmDialog = async (
  title: string,
  text: string,
  confirmText = "Ya, lanjutkan",
): Promise<boolean> => {
  const result = await Swal.fire({
    ...theme,
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Batal",
    reverseButtons: true,
  });
  return result.isConfirmed;
};

export const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
