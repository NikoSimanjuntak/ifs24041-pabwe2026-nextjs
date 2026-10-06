"use client";

import { type FormEvent, useState } from "react";
import { TbLoader2 } from "react-icons/tb";
import Modal from "@/components/Modal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import useInput from "@/hooks/useInput";
import { ui } from "@/lib/ui";
import { asyncAddPost } from "../states/action";

interface AddModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddModal({ onClose, onSuccess }: AddModalProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.posts.isPostAdd);
  const [description, onDescriptionChange] = useInput();
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!description.trim()) {
      setError("Deskripsi wajib diisi");
      return;
    }
    setError("");
    if (await dispatch(asyncAddPost(description.trim()))) onSuccess();
  };

  return (
    <Modal title="Tulis postingan" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="add-description" className={ui.label}>Deskripsi</label>
          <textarea id="add-description" rows={5} className={ui.field} placeholder="Apa yang ingin kamu bagikan?" value={description} onChange={onDescriptionChange} />
          {error && <p className={ui.error} role="alert">{error}</p>}
          <p className="mt-1 text-xs text-muted">Gambar sampul dapat ditambahkan dari halaman detail setelah postingan terbit.</p>
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className={ui.btnGhost} onClick={onClose}>Batal</button>
          <button type="submit" className={ui.btnPrimary} disabled={loading}>
            {loading && <TbLoader2 aria-hidden="true" className="size-4 animate-spin" />}
            Terbitkan
          </button>
        </div>
      </form>
    </Modal>
  );
}
