import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { buildDiagnosticIonsExport } from "./scripts/buildDiagnosticIonsJson";
import { REPO_URL } from "./src/config/repository";

function emitDiagnosticIonsJson() {
  return {
    name: "emit-diagnostic-ions-json",
    buildStart() {
      const dir = path.resolve(import.meta.dirname, "public", "data");
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.resolve(dir, "diagnostic-ions.json"),
        JSON.stringify(buildDiagnosticIonsExport(), null, 2) + "\n",
      );
    },
  };
}

const port = Number(process.env.PORT ?? 5173);
if (!Number.isInteger(port) || port <= 0) throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
const basePath = process.env.BASE_PATH ?? "/";
const onReplit = process.env.REPL_ID !== undefined;

export default defineConfig(({ command, mode }) => ({
  base: basePath,
  plugins: [
    emitDiagnosticIonsJson(),
    {
      name: "require-repository-url",
      buildStart() {
        if (command === "build" && mode === "production" && REPO_URL.includes("OWNER/REPO")) {
          throw new Error("Set REPO_URL in src/config/repository.ts before publishing: OWNER/REPO is still a placeholder.");
        }
      },
    },
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: onReplit ? true : undefined,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: onReplit ? true : undefined,
  },
}));
