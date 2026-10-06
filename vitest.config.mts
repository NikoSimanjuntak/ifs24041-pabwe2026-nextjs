import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: false,
    testTimeout: 20000,
    hookTimeout: 20000,
    setupFiles: ["./src/setupTests.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/**/*.test.{ts,tsx}",
        "src/**/*Mock.{ts,tsx}",
        "src/setupTests.ts",
        "src/test-utils.tsx",
        "src/server.ts", // launcher proses Node, bukan logika aplikasi
        "src/app/**", // pembungkus rute tipis (render halaman fitur)
        "src/types/**", // deklarasi tipe saja
      ],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
});