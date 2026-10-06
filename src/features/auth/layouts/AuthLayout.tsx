"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, useEffect } from "react";
import { TbMessageCircle, TbPhoto, TbHeart } from "react-icons/tb";
import { getAccessToken } from "@/helpers/apiHelper";

const highlights = [
  { icon: TbPhoto, text: "Bagikan cerita lengkap dengan gambar sampul" },
  { icon: TbHeart, text: "Beri suka pada postingan yang menginspirasi" },
  { icon: TbMessageCircle, text: "Diskusikan ide lewat kolom komentar" },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Pengguna yang sudah punya sesi tidak perlu melihat halaman masuk/daftar.
  useEffect(() => {
    if (getAccessToken()) router.replace("/");
  }, [router]);

  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <aside className="flex flex-col justify-between bg-brand-strong px-6 py-8 text-white sm:px-10 lg:px-14 lg:py-14">
        <p className="text-2xl font-extrabold tracking-tight">Linimasa</p>
        <div className="my-10 max-w-md lg:my-0">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            Tempat cerita kampus bertemu tanggapan.
          </h1>
          <ul className="mt-8 hidden space-y-4 sm:block">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/85">
                <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="hidden text-xs text-white/60 lg:block">Ditenagai Delcom Open API</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-sm">{children}</div>
      </main>
    </div>
  );
}