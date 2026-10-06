"use client";

import { useEffect, useState } from "react";
import { TbSearch } from "react-icons/tb";
import Avatar from "@/components/Avatar";
import { formatDate } from "@/helpers/toolsHelper";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import useInput from "@/hooks/useInput";
import { ui } from "@/lib/ui";
import { asyncGetUsers } from "../states/action";


export default function UsersPage() {
  const dispatch = useAppDispatch();
  const users = useAppSelector((state) => state.users.users);
  const [loading, setLoading] = useState(true);
  const [query, onQueryChange] = useInput();

  useEffect(() => {
    dispatch(asyncGetUsers()).then(() => setLoading(false));
  }, [dispatch]);

  const keyword = query.trim().toLowerCase();
  const visible = users.filter(
    (user) => !keyword || user.name.toLowerCase().includes(keyword) || user.email.toLowerCase().includes(keyword),
  );

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Daftar pengguna</h1>
        <p className="mt-1 text-sm text-muted">Semua orang yang sudah bergabung di Linimasa.</p>
      </div>

      <div className="relative w-full sm:w-80">
        <TbSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input type="search" aria-label="Cari pengguna" placeholder="Cari nama atau email" className={`${ui.field} pl-9`} value={query} onChange={onQueryChange} />
      </div>

      {loading ? (
        <p role="status" className="py-12 text-center text-sm text-muted">Memuat pengguna…</p>
      ) : visible.length === 0 ? (
        <div className={`${ui.card} px-6 py-14 text-center`}>
          <p className="font-semibold">Pengguna tidak ditemukan</p>
          <p className="mt-1 text-sm text-muted">Coba kata kunci lain.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((user) => (
            <li key={user.id} className={`${ui.card} flex items-center gap-4 p-4`}>
              <Avatar name={user.name} photo={user.photo} className="size-12" />
              <div className="min-w-0">
                <p className="truncate font-semibold">{user.name}</p>
                <p className="truncate text-sm text-muted">{user.email}</p>
                {user.created_at && <p className="mt-0.5 text-xs text-muted">Bergabung {formatDate(user.created_at)}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
