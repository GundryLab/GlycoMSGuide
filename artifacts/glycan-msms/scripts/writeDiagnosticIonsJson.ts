/**
 * Regenerates public/data/diagnostic-ions.json outside of Vite (the Vite plugin
 * does the same on dev start and build). Useful before running the integrity tests.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDiagnosticIonsExport } from "./buildDiagnosticIonsJson";

const dir = resolve(dirname(fileURLToPath(import.meta.url)), "../public/data");
mkdirSync(dir, { recursive: true });
writeFileSync(resolve(dir, "diagnostic-ions.json"), JSON.stringify(buildDiagnosticIonsExport(), null, 2) + "\n");
console.log("wrote", resolve(dir, "diagnostic-ions.json"));
