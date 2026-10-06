"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { TbLoader2 } from "react-icons/tb";
import { useAppDispatch } from "@/hooks/redux";
import useInput from "@/hooks/useInput";
import { ui } from "@/lib/ui";
import { asyncLogin } from "../states/action";

type Errors = Partial<Record<"email" | "password", string>>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [email, onEmailChange] = useInput();
  const [password, onPasswordChange] = useInput();
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {};
    if (!email.trim()) found.email = "Email wajib diisi";
    else if (!/^\S+@\S+\.\S+$/.test(email.trim())) found.email = "Format email tidak valid";
    if (!password) found.password = "Kata sandi wajib diisi";
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    const success = await dispatch(asyncLogin(email.trim(), password));
    setLoading(false);
    if (success) router.replace("/");
  };

  return (
    <>
      <h2 className="text-2xl font-extrabold">Masuk</h2>
      <p className="mt-1 text-sm text-muted">Lanjutkan ke linimasa kamu.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
        <div>
          <label htmlFor="login-email-input" className={ui.label}>Email</label>
          <input
            id="login-email-input"
            type="email"
            autoComplete="email"
            className={ui.field}
            value={email}
            onChange={onEmailChange}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className={ui.error} role="alert">{errors.email}</p>}
        </div>
        <div>
          <label htmlFor="login-password-input" className={ui.label}>Kata sandi</label>
          <input
            id="login-password-input"
            type="password"
            autoComplete="current-password"
            className={ui.field}
            value={password}
            onChange={onPasswordChange}
            aria-invalid={Boolean(errors.password)}
          />
          {errors.password && <p className={ui.error} role="alert">{errors.password}</p>}
        </div>
        <button id="login-submit-button" type="submit" className={`${ui.btnPrimary} w-full`} disabled={loading}>
          {loading && <TbLoader2 aria-hidden="true" className="size-4 animate-spin" />}
          {loading ? "Memproses…" : "Masuk"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link href="/auth/register" className="font-semibold text-brand-strong hover:underline">Daftar sekarang</Link>
      </p>
    </>
  );
}