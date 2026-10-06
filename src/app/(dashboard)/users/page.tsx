import type { Metadata } from "next";
import UsersPage from "@/features/users/pages/UsersPage";

export const metadata: Metadata = { title: "Daftar pengguna" };

export default function Page() {
  return <UsersPage />;
}
