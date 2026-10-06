"use client";

import { useRouter } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useState } from "react";
import { TbLoader2 } from "react-icons/tb";
import { asyncPreloadProfile } from "@/features/users/states/action";
import { getAccessToken } from "@/helpers/apiHelper";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import NavbarComponent from "../components/NavbarComponent";
import SidebarComponent from "../components/SidebarComponent";

/** Shell dashboard + penjaga rute: memverifikasi token dan memuat profil sesi. */
export default function PostLayout({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const profile = useAppSelector((state) => state.users.profile);
  const isProfile = useAppSelector((state) => state.users.isProfile);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!getAccessToken()) {
      router.replace("/auth/login");
      return;
    }
    if (!isProfile) dispatch(asyncPreloadProfile());
  }, [dispatch, router, isProfile]);

  if (!isProfile || !profile) {
    return (
      <>
        <h1 className="sr-only">Linimasa</h1>
        <div role="status" className="flex min-h-dvh items-center justify-center gap-3 text-muted">
          <TbLoader2 aria-hidden="true" className="size-6 animate-spin text-brand" />
          Memuat sesi…
        </div>
      </>
    );
  }

  return (
    <div className="min-h-dvh">
      <NavbarComponent onMenuClick={() => setDrawerOpen(true)} />
      <div className="mx-auto flex max-w-6xl gap-6 px-4 pb-12 pt-24 lg:px-6">
        {/* useSearchParams pada sidebar wajib berada di dalam Suspense agar build statis berhasil. */}
        <Suspense fallback={null}>
          <SidebarComponent open={drawerOpen} onClose={() => setDrawerOpen(false)} />
        </Suspense>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}