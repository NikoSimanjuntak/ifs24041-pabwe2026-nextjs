import { existsSync, readFileSync } from "node:fs";
import { createServer } from "node:http";
import { resolve } from "node:path";
import next from "next";

// Port dibaca dari APP_PORT: environment proses (termasuk .env yang dimuat Bun),
// lalu berkas .env, lalu .env.example, dan terakhir 3000.
function readPortFromFile(file: string): string | undefined {
  const path = resolve(process.cwd(), file);
  if (!existsSync(path)) return undefined;
  return readFileSync(path, "utf8").match(/^\s*APP_PORT\s*=\s*"?(\d+)"?\s*$/m)?.[1];
}

const port = Number(
  process.env.APP_PORT ?? readPortFromFile(".env") ?? readPortFromFile(".env.example") ?? 3000,
);
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, turbopack: dev, hostname: "0.0.0.0", port });
const handle = app.getRequestHandler();

await app.prepare();

createServer((req, res) => handle(req, res)).listen(port, () => {
  console.log(`> Linimasa siap di http://localhost:${port} (${dev ? "development" : "production"})`);
});
