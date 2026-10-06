"use client";

import { type FormEvent, useState } from "react";
import { TbLoader2 } from "react-icons/tb";
import Modal from "@/components/Modal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import useInput from "@/hooks/useInput";
import { ui } from "@/lib/ui";
import { asyncChangePost } from "../states/action";

interface ChangeModalProps {
  postId: number;
  description: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ChangeModal({ postId, description: initial, onClose, onSuccess }: ChangeModalProps) {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.posts.isPostChange);
  const [description, onDescriptionChange] = useInput(initial);
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!description.trim()) {
      setError("Deskripsi wajib diisi");
      return;
    }
    setError("");
    if (await dispatch(asyncChangePost(postId, description.trim()))) onSuccess();
  };

  return (
    <Modal title="Ubah postingan" onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="change-description" className={ui.label}>Deskripsi</label>
          <textarea id="change-description" rows={5} className={ui.field} value={description} onChange={onDescriptionChange} />
          {error && <p className={ui.error} role="alert">{error}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button type="button" className={ui.btnGhost} onClick={onClose}>Batal</button>
          <button type="submit" className={ui.btnPrimary} disabled={loading}>
            {loading && <TbLoader2 aria-hidden="true" className="size-4 animate-spin" />}
            Simpan perubahan
          </button>
        </div>
      </form>
    </Modal>
  );
}
