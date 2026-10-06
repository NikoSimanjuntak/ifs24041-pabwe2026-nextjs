"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { TbChevronDown, TbLogout, TbMenu2, TbUser } from "react-icons/tb";
import Avatar from "@/components/Avatar";
import { asyncLogout } from "@/features/auth/states/action";
import { showConfirmDialog } from "@/helpers/toolsHelper";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { ui } from "@/lib/ui";

export default function NavbarComponent({ onMenuClick }: { onMenuClick: () => void }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const profile = useAppSelector((state) => state.users.profile);
  const [open, setOpen] = useState(false);

  if (!profile) return null;

  const onLogout = async () => {
    setOpen(false);
    const confirmed = await showConfirmDialog("Keluar dari akun?", "Sesi kamu akan diakhiri di perangkat ini.", "Ya, keluar");
    if (!confirmed) return;
    await dispatch(asyncLogout());
    router.replace("/auth/login");
  };

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 lg:px-6">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Buka menu" className={`${ui.iconBtn} lg:hidden`} onClick={onMenuClick}>
            <TbMenu2 aria-hidden="true" className="size-5" />
          </button>
          <Link href="/" className="text-xl font-extrabold tracking-tight text-brand-strong">Linimasa</Link>
        </div>

        <div className="relative">
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-lg p-1.5 pr-2 hover:bg-brand-soft"
            onClick={() => setOpen((value) => !value)}
          >
            <Avatar name={profile.name} photo={profile.photo} />
            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold leading-tight">{profile.name}</span>
              <span className="block text-xs leading-tight text-muted">{profile.email}</span>
            </span>
            <TbChevronDown aria-hidden="true" className="size-4 text-muted" />
          </button>

          {open && (
            <div role="menu" className={`${ui.card} absolute right-0 mt-2 w-52 p-1.5 shadow-lg`}>
              <Link role="menuitem" href="/profile" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-brand-soft">
                <TbUser aria-hidden="true" className="size-4" /> Profil saya
              </Link>
              <button type="button" role="menuitem" onClick={onLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-brand-soft">
                <TbLogout aria-hidden="true" className="size-4" /> Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
