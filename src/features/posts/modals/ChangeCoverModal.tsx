"use client";

import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { TbLoader2, TbPhoto } from "react-icons/tb";
import Modal from "@/components/Modal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { ui } from "@/lib/ui";
import { asyncChangeCover } from "../states/action";

const MAX_SIZE = 5 * 1024 * 1024;

interface ChangeCoverModalProps {
  postId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeCoverModal({ postId, onClose, onSuccess }: ChangeCoverModalProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.posts.isPostChangeCover);
  const [picked, setPicked] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState("");

  // Lepaskan URL pratinjau saat berganti berkas atau modal ditutup.
  useEffect(() => {
    const url = picked?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [picked]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Berkas harus berupa gambar");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Ukuran gambar maksimal 5 MB");
      return;
    }
    setError("");
    setPicked({ file, url: URL.createObjectURL(file) });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!picked) {
      setError("Pilih gambar terlebih dahulu");
      return;
    }
    if (await dispatch(asyncChangeCover(postId, picked.file))) onSuccess();
  };

  return (
    <Modal title="Ganti gambar sampul" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-lg border border-dashed border-line bg-canvas">
          {picked ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={picked.url} alt="Pratinjau sampul" className="size-full object-cover" />
          ) : (
            <span className="flex flex-col items-center gap-2 text-sm text-muted">
              <TbPhoto aria-hidden="true" className="size-8" />
              Pratinjau muncul di sini
            </span>
          )}
        </div>
        <div>
          <label htmlFor="cover-file" className={ui.label}>Pilih gambar</label>
          <input id="cover-file" type="file" accept="image/*" className={ui.field} onChange={onFileChange} />
          {error && <p className={ui.error} role="alert">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className={ui.btnGhost} onClick={onClose}>Batal</button>
          <button type="submit" className={ui.btnPrimary} disabled={loading}>
            {loading && <TbLoader2 aria-hidden="true" className="size-4 animate-spin" />}
            Unggah sampul
          </button>
        </div>
      </form>
    </Modal>
  );
}
