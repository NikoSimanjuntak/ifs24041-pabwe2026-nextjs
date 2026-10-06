"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { TbLoader2 } from "react-icons/tb";
import { useAppDispatch } from "@/hooks/redux";
import useInput from "@/hooks/useInput";
import { ui } from "@/lib/ui";
import { asyncRegister } from "../states/action";

type Errors = Partial<Record<"name" | "email" | "password" | "confirmation", string>>;

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [name, onNameChange] = useInput();
  const [email, onEmailChange] = useInput();
  const [password, onPasswordChange] = useInput();
  const [confirmation, onConfirmationChange] = useInput();
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {};
    if (!name.trim()) found.name = "Nama wajib diisi";
    if (!email.trim()) found.email = "Email wajib diisi";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) found.email = "Format email tidak valid";
    if (password.length < 6) found.password = "Kata sandi minimal 6 karakter";
    if (confirmation !== password) found.confirmation = "Konfirmasi kata sandi tidak sama";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const success = await dispatch(asyncRegister(name.trim(), email.trim(), password));
    setLoading(false);
    if (success) router.replace("/auth/login");
  };

  return (
    <>
      <h2 className="text-2xl font-extrabold">Buat akun</h2>
      <p className="mt-1 text-sm text-muted">Gratis dan hanya butuh satu menit.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="name" className={ui.label}>Nama lengkap</label>
          <input id="name" type="text" autoComplete="name" className={ui.field} value={name} onChange={onNameChange} aria-invalid={Boolean(errors.name)} />
          {errors.name && <p className={ui.error} role="alert">{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="email" className={ui.label}>Email</label>
          <input id="email" type="email" autoComplete="email" className={ui.field} value={email} onChange={onEmailChange} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className={ui.error} role="alert">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="password" className={ui.label}>Kata sandi</label>
          <input id="password" type="password" autoComplete="new-password" className={ui.field} value={password} onChange={onPasswordChange} aria-invalid={Boolean(errors.password)} />
          {errors.password && <p className={ui.error} role="alert">{errors.password}</p>}
        </div>
        <div>
          <label htmlFor="confirmation" className={ui.label}>Ulangi kata sandi</label>
          <input id="confirmation" type="password" autoComplete="new-password" className={ui.field} value={confirmation} onChange={onConfirmationChange} aria-invalid={Boolean(errors.confirmation)} />
          {errors.confirmation && <p className={ui.error} role="alert">{errors.confirmation}</p>}
        </div>
        <button type="submit" className={`${ui.btnPrimary} w-full`} disabled={loading}>
          {loading && <TbLoader2 aria-hidden="true" className="size-4 animate-spin" />}
          {loading ? "Memproses…" : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Sudah punya akun?{" "}
        <Link href="/auth/login" className="font-semibold text-brand-strong hover:underline">Masuk</Link>
      </p>
    </>
  );
}
