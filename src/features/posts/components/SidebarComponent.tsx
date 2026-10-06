"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { TbHome, TbNotebook, TbUser, TbUsers, TbX } from "react-icons/tb";
import { ui } from "@/lib/ui";

const items = [
  { href: "/", label: "Semua Postingan", icon: TbHome, match: (path: string, tab: string | null) => path === "/" && tab !== "me" },
  { href: "/?tab=me", label: "Postingan Saya", icon: TbNotebook, match: (path: string, tab: string | null) => path === "/" && tab === "me" },
  { href: "/users", label: "Daftar Pengguna", icon: TbUsers, match: (path: string) => path.startsWith("/users") },
  { href: "/profile", label: "Profil Saya", icon: TbUser, match: (path: string) => path.startsWith("/profile") },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function SidebarComponent({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const tab = useSearchParams().get("tab");

  return (
    <>
      {open && <div data-testid="sidebar-backdrop" className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={onClose} />}
      <aside
        aria-label="Navigasi utama"
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-line bg-surface p-4 transition-transform lg:sticky lg:top-20 lg:z-0 lg:h-fit lg:w-56 lg:shrink-0 lg:translate-x-0 lg:rounded-xl lg:border ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <span className="text-lg font-extrabold text-brand-strong">Menu</span>
          <button type="button" aria-label="Tutup menu" className={ui.iconBtn} onClick={onClose}>
            <TbX aria-hidden="true" className="size-5" />
          </button>
        </div>
        <nav>
          <ul className="space-y-1">
            {items.map(({ href, label, icon: Icon, match }) => {
              const active = match(pathname, tab);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active ? "bg-brand text-white" : "text-ink hover:bg-brand-soft"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
