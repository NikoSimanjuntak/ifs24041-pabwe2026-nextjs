"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { TbHeart, TbMessageCircle, TbPhoto, TbPlus, TbSearch, TbTrash } from "react-icons/tb";
import Avatar from "@/components/Avatar";
import { assetUrl } from "@/helpers/apiHelper";
import { formatDate, showConfirmDialog } from "@/helpers/toolsHelper";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import useInput from "@/hooks/useInput";
import { ui } from "@/lib/ui";
import type { Post } from "@/types";
import AddModal from "../modals/AddModal";
import { asyncDeleteAllPosts, asyncGetPosts } from "../states/action";

const matchesKeyword = (post: Post, keyword: string) =>
  !keyword || post.description.toLowerCase().includes(keyword) || post.author.name.toLowerCase().includes(keyword);

function TabLink({ href, active, children }: Readonly<{ href: string; active: boolean; children: ReactNode }>) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`rounded-md px-3.5 py-1.5 ${active ? "bg-brand text-white" : "hover:bg-brand-soft"}`}
    >
      {children}
    </Link>
  );
}

function PostCard({ post }: Readonly<{ post: Post }>) {
  const cover = assetUrl(post.cover);
  return (
    <li>
      <Link href={`/posts/${post.id}`} className={`${ui.card} group flex h-full flex-col overflow-hidden transition-colors hover:border-brand`}>
        <div className="flex aspect-video items-center justify-center bg-brand-soft">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="size-full object-cover" />
          ) : (
            <TbPhoto aria-hidden="true" className="size-10 text-brand/50" />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-center gap-2.5">
            <Avatar name={post.author.name} photo={post.author.photo} className="size-8" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{post.author.name}</p>
              <p className="text-xs text-muted">{formatDate(post.created_at)}</p>
            </div>
          </div>
          <p className="line-clamp-3 text-sm leading-relaxed">{post.description}</p>
          <div className="mt-auto flex items-center gap-4 pt-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1" aria-label={`${post.likes.length} suka`}>
              <TbHeart aria-hidden="true" className="size-4" /> {post.likes.length}
            </span>
            <span className="inline-flex items-center gap-1" aria-label={`${post.comments.length} komentar`}>
              <TbMessageCircle aria-hidden="true" className="size-4" /> {post.comments.length}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

function PostList({ isLoading, posts, keyword }: Readonly<{ isLoading: boolean; posts: Post[]; keyword: string }>) {
  if (isLoading) {
    return <output className="block py-12 text-center text-sm text-muted">Memuat postingan…</output>;
  }

  if (posts.length === 0) {
    return (
      <div className={`${ui.card} px-6 py-14 text-center`}>
        <p className="font-semibold">{keyword ? "Tidak ada postingan yang cocok" : "Belum ada postingan"}</p>
        <p className="mt-1 text-sm text-muted">{keyword ? "Coba kata kunci lain." : "Jadilah yang pertama menulis cerita."}</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </ul>
  );
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const tab = useSearchParams().get("tab") === "me" ? "me" : "all";
  const posts = useAppSelector((state) => state.posts.posts);
  const isLoading = useAppSelector((state) => state.posts.isPost);
  const isDeletingAll = useAppSelector((state) => state.posts.isPostDeleteAll);
  const [query, onQueryChange] = useInput();
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    dispatch(asyncGetPosts(tab === "me"));
  }, [dispatch, tab]);

  const keyword = query.trim().toLowerCase();
  const visible = posts.filter((post) => matchesKeyword(post, keyword));
  const copy =
    tab === "me"
      ? { title: "Postingan saya", subtitle: "Semua yang pernah kamu bagikan." }
      : { title: "Linimasa", subtitle: "Cerita terbaru dari semua pengguna." };

  const onAddSuccess = () => {
    setShowAdd(false);
    dispatch(asyncGetPosts(tab === "me"));
  };

  const onDeleteAll = async () => {
    const confirmed = await showConfirmDialog(
      "Hapus semua postingan?",
      "Seluruh postingan milikmu beserta sampul, suka, dan komentarnya akan dihapus permanen.",
      "Ya, hapus semua",
    );
    if (!confirmed) return;
    if (await dispatch(asyncDeleteAllPosts())) dispatch(asyncGetPosts(true));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{copy.title}</h1>
          <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tab === "me" && posts.length > 0 && (
            <button type="button" className={ui.btnGhost} onClick={onDeleteAll} disabled={isDeletingAll}>
              <TbTrash aria-hidden="true" className="size-4" /> Hapus semua
            </button>
          )}
          <button type="button" className={ui.btnPrimary} onClick={() => setShowAdd(true)}>
            <TbPlus aria-hidden="true" className="size-4" /> Tulis postingan
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Filter postingan" className="inline-flex rounded-lg border border-line bg-surface p-1 text-sm font-medium">
          <TabLink href="/" active={tab === "all"}>Semua</TabLink>
          <TabLink href="/?tab=me" active={tab === "me"}>Milik saya</TabLink>
        </nav>
        <div className="relative w-full sm:w-72">
          <TbSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input type="search" aria-label="Cari postingan" placeholder="Cari deskripsi atau nama pembuat" className={`${ui.field} pl-9`} value={query} onChange={onQueryChange} />
        </div>
      </div>

      <PostList isLoading={isLoading} posts={visible} keyword={keyword} />

      {showAdd && <AddModal onClose={() => setShowAdd(false)} onSuccess={onAddSuccess} />}
    </section>
  );
}