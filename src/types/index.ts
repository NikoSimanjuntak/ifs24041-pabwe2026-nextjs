export interface ApiResult<T = unknown> {
  status: string;
  message: string;
  data: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  photo: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PostAuthor {
  name: string;
  photo: string | null;
}

export interface PostComment {
  id: number;
  comment: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  cover: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  author: PostAuthor;
  /** ID pengguna yang menyukai postingan. */
  likes: number[];
  /** Daftar postingan hanya memuat ID komentar; detail memuat objek komentar. */
  comments: Array<number | PostComment>;
  my_comment?: PostComment | null;
}
