import type { Metadata } from "next";
import { Suspense } from "react";
import HomePage from "@/features/posts/pages/HomePage";

export const metadata: Metadata = { title: "Linimasa" };

export default function Page() {
  // HomePage membaca query string (?tab=me) sehingga perlu Suspense.
  return (
    <Suspense fallback={null}>
      <HomePage />
    </Suspense>
  );
}
