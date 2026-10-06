# Linimasa — Aplikasi Postingan (Next.js + TypeScript)

Studi kasus 2.2 PABWER 2026. Sumber data: [Delcom Open API](https://open-api.delcom.org/docs/1.0/api-posts).
Stack: Bun, Next.js (App Router, Turbopack), TypeScript, Tailwind CSS v4, Redux Toolkit, SweetAlert2, react-icons (Tabler), Google Font Plus Jakarta Sans, Vitest.

## Menjalankan

```bash
# ganti "username" dengan username kamu, mis. ifs18005-pabwer2026-nextjs
bun install
cp .env.example .env     # NEXT_PUBLIC_DELCOM_BASEURL dan APP_PORT
bun run dev              # menjalankan src/server.ts (port dari APP_PORT)
bun run build && bun run start
bun run lint
bun run test             # vitest + coverage v8 (threshold 100%)
```

## Struktur singkat

- `src/server.ts` — launcher; membaca `APP_PORT` dari env/.env/.env.example.
- `src/helpers`, `src/hooks`, `src/lib` — apiHelper, toolsHelper, useInput, redux hooks, config.
- `src/features/{auth,users,posts}` — `api/`, `states/` (action types, creators, thunk, reducer), `pages/`, dst.
- `src/store.ts`, `src/types`, `src/components` (Providers, Avatar, Modal).
- `src/app` — rute App Router: `auth/*`, dan grup `(dashboard)` (`/`, `/posts/[postId]`, `/users`, `/profile`).

## Catatan

- Endpoint ubah kata sandi mengikuti dokumentasi Delcom: `PUT /users/password`
  (soal menulis `/users/me/password`; ubah satu konstanta di `userApi.ts` bila server berbeda).
- Respons login diasumsikan `data.token` (halaman dokumentasi Auth tidak dapat diakses saat pembuatan).
- Pengecualian coverage: `src/server.ts`, `src/app/**` (pembungkus rute), `src/types/**`, dan berkas helper pengujian.
- Berkas tes dikecualikan dari typecheck build; cek tipe tes dengan `bunx tsc -p tsconfig.test.json`.
