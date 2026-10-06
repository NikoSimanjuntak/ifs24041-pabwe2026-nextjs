import { assetUrl } from "@/helpers/apiHelper";

interface AvatarProps {
  name: string;
  photo?: string | null;
  className?: string;
}

/** Foto pengguna; jika belum ada, tampilkan huruf pertama nama. */
export default function Avatar({ name, photo, className = "size-9" }: AvatarProps) {
  const src = assetUrl(photo);
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className={`${className} shrink-0 rounded-full object-cover`} />;
  }
  return (
    <span
      aria-hidden="true"
      className={`${className} inline-flex shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand-strong`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  );
}
