import { type RenderOptions, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { Provider } from "react-redux";
import { initialState as authInitialState } from "@/features/auth/states/reducer";
import { initialState as postsInitialState } from "@/features/posts/states/reducer";
import { initialState as usersInitialState } from "@/features/users/states/reducer";
import { makeStore } from "@/store";
import type { Post, User } from "@/types";
import type { AuthState, PostsState, UsersState } from "@/types/action";

export { navigation } from "./navigationMock";

interface PreloadedState {
  auth?: Partial<AuthState>;
  users?: Partial<UsersState>;
  posts?: Partial<PostsState>;
}

/** Render komponen yang terhubung ke Redux store (state awal dapat diganti sebagian). */
export function renderWithProviders(
  ui: ReactElement,
  { preloadedState = {}, ...options }: { preloadedState?: PreloadedState } & Omit<RenderOptions, "wrapper"> = {},
) {
  const store = makeStore({
    auth: { ...authInitialState, ...preloadedState.auth },
    users: { ...usersInitialState, ...preloadedState.users },
    posts: { ...postsInitialState, ...preloadedState.posts },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;
  return { store, user: userEvent.setup(), ...render(ui, { wrapper: Wrapper, ...options }) };
}

export const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  name: "Delcom Testing",
  email: "testing@delcom.org",
  photo: null,
  created_at: "2024-10-05T03:07:11.000000Z",
  ...overrides,
});

export const makePost = (overrides: Partial<Post> = {}): Post => ({
  id: 1,
  user_id: 1,
  cover: null,
  description: "Terus belajar apapun rintangannya!",
  created_at: "2024-10-05T03:07:11.000000Z",
  updated_at: "2024-10-05T03:07:11.000000Z",
  author: { name: "Delcom Testing", photo: null },
  likes: [],
  comments: [],
  ...overrides,
});
