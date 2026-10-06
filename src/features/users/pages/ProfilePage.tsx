"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { TbLoader2 } from "react-icons/tb";
import Avatar from "@/components/Avatar";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import useInput from "@/hooks/useInput";
import { ui } from "@/lib/ui";
import type { User } from "@/types";
import { asyncChangePassword, asyncChangePhoto, asyncChangeProfile } from "../states/action";

const MAX_SIZE = 2 * 1024 * 1024;
const emailPattern = /^\S+@\S+\.\S+$/;

function Spinner({ show }: { show: boolean }) {
  return show ? <TbLoader2 aria-hidden="true" className="size-4 animate-spin" /> : null;
}

function ProfileForm({ profile }: { profile: User }) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.users.isChangeProfile);
  const [name, onNameChange] = useInput(profile.name);
  const [email, onEmailChange] = useInput(profile.email);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found: typeof errors = {};
    if (!name.trim()) found.name = "Nama wajib diisi";
    if (!emailPattern.test(email.trim())) found.email = "Format email tidak valid";
    setErrors(found);
    if (Object.keys(found).length === 0) await dispatch(asyncChangeProfile(name.trim(), email.trim()));
  };

  return (
    <form onSubmit={onSubmit} noValidate className={`${ui.card} space-y-4 p-5`}>
      <h2 className="text-lg font-bold">Data diri</h2>
      <div>
        <label htmlFor="profile-name" className={ui.label}>Nama</label>
        <input id="profile-name" className={ui.field} value={name} onChange={onNameChange} />
        {errors.name && <p className={ui.error} role="alert">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="profile-email" className={ui.label}>Email</label>
        <input id="profile-email" type="email" className={ui.field} value={email} onChange={onEmailChange} />
        {errors.email && <p className={ui.error} role="alert">{errors.email}</p>}
      </div>
      <button type="submit" className={ui.btnPrimary} disabled={loading}>
        <Spinner show={loading} /> Simpan data diri
      </button>
    </form>
  );
}

function PhotoForm({ profile }: { profile: User }) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.users.isChangeProfilePhoto);
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const url = picked?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [picked]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Berkas harus berupa gambar");
    if (file.size > MAX_SIZE) return setError("Ukuran foto maksimal 2 MB");
    setError("");
    setPicked({ file, url: URL.createObjectURL(file) });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!picked) return setError("Pilih foto terlebih dahulu");
    if (await dispatch(asyncChangePhoto(picked.file))) setPicked(null);
  };

  return (
    <form onSubmit={onSubmit} noValidate className={`${ui.card} space-y-4 p-5`}>
      <h2 className="text-lg font-bold">Foto profil</h2>
      <div className="flex items-center gap-4">
        {picked ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={picked.url} alt="Pratinjau foto profil" className="size-20 rounded-full object-cover" />
        ) : (
          <Avatar name={profile.name} photo={profile.photo} className="size-20" />
        )}
        <div className="min-w-0 flex-1">
          <label htmlFor="profile-photo" className={ui.label}>Pilih foto</label>
          <input id="profile-photo" type="file" accept="image/*" className={ui.field} onChange={onFileChange} />
        </div>
      </div>
      {error && <p className={ui.error} role="alert">{error}</p>}
      <button type="submit" className={ui.btnPrimary} disabled={loading}>
        <Spinner show={loading} /> Unggah foto
      </button>
    </form>
  );
}

function PasswordForm() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.users.isChangeProfilePassword);
  const [current, onCurrentChange, setCurrent] = useInput();
  const [next, onNextChange, setNext] = useInput();
  const [confirmation, onConfirmationChange, setConfirmation] = useInput();
  const [errors, setErrors] = useState<Partial<Record<"current" | "next" | "confirmation", string>>>({});

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found: typeof errors = {};
    if (!current) found.current = "Kata sandi saat ini wajib diisi";
    if (next.length < 6) found.next = "Kata sandi baru minimal 6 karakter";
    if (confirmation !== next) found.confirmation = "Konfirmasi kata sandi tidak sama";
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (await dispatch(asyncChangePassword(current, next, confirmation))) {
      setCurrent("");
      setNext("");
      setConfirmation("");
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className={`${ui.card} space-y-4 p-5`}>
      <h2 className="text-lg font-bold">Kata sandi</h2>
      <div>
        <label htmlFor="password-current" className={ui.label}>Kata sandi saat ini</label>
        <input id="password-current" type="password" autoComplete="current-password" className={ui.field} value={current} onChange={onCurrentChange} />
        {errors.current && <p className={ui.error} role="alert">{errors.current}</p>}
      </div>
      <div>
        <label htmlFor="password-new" className={ui.label}>Kata sandi baru</label>
        <input id="password-new" type="password" autoComplete="new-password" className={ui.field} value={next} onChange={onNextChange} />
        {errors.next && <p className={ui.error} role="alert">{errors.next}</p>}
      </div>
      <div>
        <label htmlFor="password-confirmation" className={ui.label}>Ulangi kata sandi baru</label>
        <input id="password-confirmation" type="password" autoComplete="new-password" className={ui.field} value={confirmation} onChange={onConfirmationChange} />
        {errors.confirmation && <p className={ui.error} role="alert">{errors.confirmation}</p>}
      </div>
      <button type="submit" className={ui.btnPrimary} disabled={loading}>
        <Spinner show={loading} /> Ubah kata sandi
      </button>
    </form>
  );
}

export default function ProfilePage() {
  const profile = useAppSelector((state) => state.users.profile);
  if (!profile) return null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Profil saya</h1>
        <p className="mt-1 text-sm text-muted">Kelola data diri, foto, dan keamanan akunmu.</p>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <ProfileForm profile={profile} />
        <PhotoForm profile={profile} />
        <div className="xl:col-span-2">
          <PasswordForm />
        </div>
      </div>
    </section>
  );
}
