"use client";

import Link from "next/link";

import { useParams, useRouter } from "next/navigation";

import { type FormEvent, useEffect, useState } from "react";

import {
  TbArrowLeft,
  TbHeart,
  TbMessageCircle,
  TbPencil,
  TbPhoto,
  TbTrash,
} from "react-icons/tb";

import Avatar from "@/components/Avatar";

import { assetUrl } from "@/helpers/apiHelper";

import { formatDate, showConfirmDialog } from "@/helpers/toolsHelper";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";

import useInput from "@/hooks/useInput";

import { ui } from "@/lib/ui";

import type { PostComment } from "@/types";

import ChangeCoverModal from "../modals/ChangeCoverModal";

import ChangeModal from "../modals/ChangeModal";

import {
  asyncAddComment,
  asyncDeleteComment,
  asyncDeletePost,
  asyncGetPost,
  asyncToggleLike,
} from "../states/action";

const isComment = (
  value: number | PostComment,
): value is PostComment => typeof value !== "number";

export default function DetailPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const postId = Number(useParams<{ postId: string }>().postId);

  const post = useAppSelector((state) => state.posts.post);
  const profile = useAppSelector((state) => state.users.profile);
  const isLiking = useAppSelector((state) => state.posts.isPostLike);
  const isCommenting = useAppSelector(
    (state) => state.posts.isPostAddComment,
  );

  const [fetched, setFetched] = useState(false);
  const [comment, onCommentChange, setComment] = useInput();
  const [commentError, setCommentError] = useState("");
  const [modal, setModal] = useState<"edit" | "cover" | null>(null);

  useEffect(() => {
    dispatch(asyncGetPost(postId)).then(() => setFetched(true));
  }, [dispatch, postId]);

  const refresh = () => dispatch(asyncGetPost(postId));

  if (!post || post.id !== postId) {
    return (
      <>
        <h1 className="sr-only">Detail postingan</h1>
        <p
          role="status"
          className="py-16 text-center text-sm text-muted"
        >
          {fetched
            ? "Postingan tidak ditemukan."
            : "Memuat postingan…"}
        </p>
      </>
    );
  }

  const cover = assetUrl(post.cover);

  const isOwner =
    profile !== null && profile.id === post.user_id;

  const liked =
    profile !== null && post.likes.includes(profile.id);

  const comments = post.comments.filter(isComment);

  const onToggleLike = async () => {
    if (await dispatch(asyncToggleLike(post.id, !liked))) {
      refresh();
    }
  };

  const onSubmitComment = async (event: FormEvent) => {
    event.preventDefault();

    if (!comment.trim()) {
      setCommentError("Komentar tidak boleh kosong");
      return;
    }

    setCommentError("");

    if (
      await dispatch(
        asyncAddComment(post.id, comment.trim()),
      )
    ) {
      setComment("");
      refresh();
    }
  };

  const onDeleteComment = async () => {
    const confirmed = await showConfirmDialog(
      "Hapus komentar?",
      "Komentarmu akan dihapus dari postingan ini.",
      "Ya, hapus",
    );

    if (
      confirmed &&
      (await dispatch(asyncDeleteComment(post.id)))
    ) {
      refresh();
    }
  };

  const onDeletePost = async () => {
    const confirmed = await showConfirmDialog(
      "Hapus postingan?",
      "Postingan ini akan dihapus permanen.",
      "Ya, hapus",
    );

    if (
      confirmed &&
      (await dispatch(asyncDeletePost(post.id)))
    ) {
      router.replace("/");
    }
  };

  return (
    <article className="space-y-6">
      <h1 className="sr-only">
        Postingan oleh {post.author.name}
      </h1>

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand-strong"
      >
        <TbArrowLeft
          aria-hidden="true"
          className="size-4"
        />
        Kembali ke linimasa
      </Link>

      <div className={`${ui.card} overflow-hidden`}>
        <div className="flex aspect-video max-h-[26rem] w-full items-center justify-center bg-brand-soft">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt="Sampul postingan"
              className="size-full object-cover"
            />
          ) : (
            <TbPhoto
              aria-hidden="true"
              className="size-14 text-brand/40"
            />
          )}
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar
                name={post.author.name}
                photo={post.author.photo}
                className="size-11"
              />

              <div>
                <p className="font-semibold">
                  {post.author.name}
                </p>

                <p className="text-xs text-muted">
                  {formatDate(post.created_at)}
                </p>
              </div>
            </div>

            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={ui.btnGhost}
                  onClick={() => setModal("cover")}
                >
                  <TbPhoto
                    aria-hidden="true"
                    className="size-4"
                  />
                  Ubah cover
                </button>

                <button
                  type="button"
                  className={ui.btnGhost}
                  onClick={() => setModal("edit")}
                >
                  <TbPencil
                    aria-hidden="true"
                    className="size-4"
                  />
                  Ubah postingan
                </button>

                <button
                  type="button"
                  className={ui.btnDanger}
                  onClick={onDeletePost}
                >
                  <TbTrash
                    aria-hidden="true"
                    className="size-4"
                  />
                  Hapus postingan
                </button>
              </div>
            )}
          </div>

          <p className="whitespace-pre-line leading-relaxed">
            {post.description}
          </p>

          <button
            type="button"
            aria-pressed={liked}
            onClick={onToggleLike}
            disabled={isLiking}
            className={`${
              liked
                ? "border-brand bg-brand-soft text-brand-strong"
                : "border-line bg-white text-ink"
            } inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors disabled:opacity-60`}
          >
            <TbHeart
              aria-hidden="true"
              className={`size-5 ${
                liked ? "fill-current" : ""
              }`}
            />

            {liked ? "Disukai" : "Suka"} · {post.likes.length}
          </button>
        </div>
      </div>

      <section
        aria-labelledby="comments-title"
        className={`${ui.card} space-y-5 p-5 sm:p-6`}
      >
        <h2
          id="comments-title"
          className="flex items-center gap-2 text-lg font-bold"
        >
          <TbMessageCircle
            aria-hidden="true"
            className="size-5"
          />
          Komentar ({comments.length})
        </h2>

        <form
          onSubmit={onSubmitComment}
          noValidate
          className="space-y-2"
        >
          <label
            htmlFor="comment"
            className="sr-only"
          >
            Tulis komentar
          </label>

          <textarea
            id="comment"
            rows={3}
            className={ui.field}
            placeholder="Tulis komentar…"
            value={comment}
            onChange={onCommentChange}
          />

          {commentError && (
            <p
              className={ui.error}
              role="alert"
            >
              {commentError}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className={ui.btnPrimary}
              disabled={isCommenting}
            >
              Kirim komentar
            </button>
          </div>
        </form>

        {comments.length === 0 ? (
          <p className="text-sm text-muted">
            Belum ada komentar. Mulai percakapan.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {comments.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-4 py-3"
              >
                <div>
                  <p className="text-sm leading-relaxed">
                    {item.comment}
                  </p>

                  <p className="mt-1 text-xs text-muted">
                    {formatDate(item.created_at)}
                  </p>
                </div>

                {post.my_comment?.id === item.id && (
                  <button
                    type="button"
                    aria-label="Hapus komentar saya"
                    className={ui.iconBtn}
                    onClick={onDeleteComment}
                  >
                    <TbTrash
                      aria-hidden="true"
                      className="size-4"
                    />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {modal === "edit" && (
        <ChangeModal
          postId={post.id}
          description={post.description}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            refresh();
          }}
        />
      )}

      {modal === "cover" && (
        <ChangeCoverModal
          postId={post.id}
          onClose={() => setModal(null)}
          onSuccess={() => {
            setModal(null);
            refresh();
          }}
        />
      )}
    </article>
  );
}