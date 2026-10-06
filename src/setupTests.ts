import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { navigation } from "./navigationMock";

vi.mock("next/navigation", async () => await import("./navigationMock"));
vi.mock("next/link", async () => await import("./linkMock"));

beforeEach(() => {
  vi.resetAllMocks();
  navigation.reset();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});
