"use client";

import { type ReactNode, useEffect } from "react";
import { TbX } from "react-icons/tb";
import { ui } from "@/lib/ui";

interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ title, onClose, children }: Readonly<ModalProps>) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      {/* Latar: tombol asli agar klik di luar dialog menutupnya; pengguna keyboard memakai Escape/tombol Tutup. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        aria-label="Tutup latar"
        className="absolute inset-0 cursor-default bg-ink/50"
        onClick={onClose}
      />
      <dialog open aria-modal="true" aria-label={title} className={`${ui.card} relative w-full max-w-lg p-5 text-ink shadow-xl`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button type="button" aria-label="Tutup" className={ui.iconBtn} onClick={onClose}>
            <TbX aria-hidden="true" className="size-5" />
          </button>
        </div>
        {children}
      </dialog>
    </div>
  );
}