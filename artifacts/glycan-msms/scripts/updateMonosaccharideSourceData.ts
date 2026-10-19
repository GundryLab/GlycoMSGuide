/**
 * Review-only source ingest utility.
 *
 * Usage:
 *   pnpm run update-monosaccharide-source-data -- \
 *     --input ./path/to/normalized-candidates.json \
 *     --output-dir ./review-output
 *
 * The input may be either an array of normalized records or an object with a
 * `records` array. This utility compares candidates with the live curated
 * TypeScript dataset and writes review artifacts only. It never edits
 * src/data/monosaccharidesData.ts and does not fetch or trust external data.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { z } from "zod";
import {
  monosaccharidesAndModifications,
  type MonosaccharideModification,
} from "../src/data/monosaccharidesData";

interface ChangedSourceRecord {
  id: string;
  current: MonosaccharideModification;
  candidate: MonosaccharideModification;
}

const biologicalScopeSchema = z.enum([
  "Mammalian",
  "Vertebrate",
  "Invertebrate",
  "Microbial",
  "Plant",
  "Fungal",
  "Broadly distributed",
  "Other / context-dependent",
]);

const sourceResourceSchema = z
  .object({
    resource: z.string().trim().min(1),
    url: z.string().url().optional(),
    accessed: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  })
  .strict();

const candidateRecordSchema = z
  .object({
    id: z.string().trim().min(1),
    recordType: z.enum(["monosaccharide", "modification"]),
    name: z.string().trim().min(1),
    shortName: z.string().trim().min(1),
    synonyms: z.array(z.string()),
    category: z.enum([
      "Hexose",
      "HexNAc",
      "Deoxyhexose",
      "Dideoxyhexose",
      "Pentose",
      "Uronic acid",
      "Sialic acid",
      "Nonulosonic acid",
      "Modification/substituent",
      "Other",
    ]),
    formula: z.string().trim().min(1).optional(),
    monoisotopicMass: z.number().finite().positive().optional(),
    massShift: z.number().finite().optional(),
    snfgSymbol: z.string().trim().min(1).optional(),
    description: z.string().trim().min(1),
    biologicalScope: z.array(biologicalScopeSchema).min(1),
    mammalianRelevance: z.enum([
      "Common",
      "Known but uncommon",
      "Context-dependent",
      "Exogenous / dietary possible",
      "Not typically expected",
      "Not established",
    ]),
    organismNotes: z.string().trim().min(1).optional(),
    commonTargets: z.array(z.string()).optional(),
    stability: z.string().trim().min(1).optional(),
    samplePreparationConsiderations: z.string().trim().min(1).optional(),
    msConsiderations: z.string().trim().min(1).optional(),
    glyTouCanIds: z.array(z.string().trim().min(1)).optional(),
    chebiId: z.string().trim().min(1).optional(),
    pubChemCid: z.string().trim().min(1).optional(),
    sourceResources: z.array(sourceResourceSchema).min(1),
    primaryReferences: z.array(z.string().trim().min(1)).optional(),
    glycoMSGuideStatus: z.enum([
      "Core mammalian",
      "Extended biological context",
    ]),
    curationNotes: z.string().trim().min(1).optional(),
    lastUpdated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    relatedDiagnosticIons: z.array(
      z.object({
        mz: z.number().finite().positive(),
        specificity: z.enum([
          "residue-specific",
          "composition-supporting",
          "motif-associated",
          "context-dependent",
        ]),
      }).strict(),
    ).optional(),
  })
  .strict()
  .superRefine((record, context) => {
    if (record.recordType === "monosaccharide" && record.massShift !== undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["massShift"],
        message: "Monosaccharide records cannot define massShift.",
      });
    }
    if (record.recordType === "modification") {
      if (record.monoisotopicMass !== undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["monoisotopicMass"],
          message: "Modification records cannot define monoisotopicMass.",
        });
      }
      if (record.massShift === undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["massShift"],
          message: "Modification records must define massShift.",
        });
      }
    }
  });

const candidateInputSchema = z.union([
  z.array(candidateRecordSchema),
  z.object({ records: z.array(candidateRecordSchema) }).strict(),
]);

function usage(): string {
  return [
    "Review-only normalized source ingest",
    "",
    "Options:",
    "  --input <file>       JSON array or { records: [] } of normalized candidates (required)",
    "  --output-dir <dir>   Review output directory (default: ./review-output)",
    "  --dry-run            Compare and print totals without writing files",
    "  --help               Show this help",
  ].join("\n");
}

function getOption(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index >= 0) return args[index + 1];
  const prefix = `${name}=`;
  const inline = args.find((arg) => arg.startsWith(prefix));
  return inline?.slice(prefix.length);
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((sorted, key) => {
        sorted[key] = stableValue((value as Record<string, unknown>)[key]);
        return sorted;
      }, {});
  }
  return value;
}

function sameRecord(left: MonosaccharideModification, right: MonosaccharideModification): boolean {
  return JSON.stringify(stableValue(left)) === JSON.stringify(stableValue(right));
}

function parseCandidates(value: unknown): MonosaccharideModification[] {
  const input = candidateInputSchema.parse(value);
  const records = Array.isArray(input) ? input : input.records;

  const ids = new Set<string>();
  for (const record of records) {
    if (!record || typeof record !== "object" || typeof record.id !== "string" || !record.id.trim()) {
      throw new Error("Every candidate record must be an object with a non-empty string id.");
    }
    if (ids.has(record.id)) throw new Error(`Duplicate candidate id: ${record.id}`);
    ids.add(record.id);
  }
  return records.map((record) => {
    if (record.formula === undefined) {
      throw new Error(`Candidate record "${record.id}" is missing a required elemental formula.`);
    }
    return { ...record, formula: record.formula };
  });
}

function deepCloneAndFreeze(
  record: MonosaccharideModification,
): MonosaccharideModification {
  const clone = structuredClone(record);
  const freeze = (value: unknown): void => {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) return;
    Object.freeze(value);
    for (const nested of Object.values(value)) freeze(nested);
  };
  freeze(clone);
  return clone;
}

export async function compareMonosaccharideCandidates(
  candidates: MonosaccharideModification[],
) {
  const liveById = new Map(monosaccharidesAndModifications.map((record) => [record.id, record]));
  const candidateIds = new Set(candidates.map((record) => record.id));
  const newCandidates = candidates.filter((record) => !liveById.has(record.id));
  const changedSourceRecords: ChangedSourceRecord[] = candidates
    .filter((record) => {
      const current = liveById.get(record.id);
      return current !== undefined && !sameRecord(current, record);
    })
    .map((candidate) => ({
      id: candidate.id,
      current: deepCloneAndFreeze(liveById.get(candidate.id)!),
      candidate,
    }));
  const unmatchedExistingRecords = monosaccharidesAndModifications.filter(
    (record) => !candidateIds.has(record.id),
  ).map(deepCloneAndFreeze);

  return { newCandidates, changedSourceRecords, unmatchedExistingRecords };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    console.log(usage());
    return;
  }

  const inputPath = getOption(args, "--input");
  if (!inputPath) {
    throw new Error(`--input is required.\n\n${usage()}`);
  }

  const parsed = JSON.parse(await readFile(resolve(inputPath), "utf8")) as unknown;
  const candidates = parseCandidates(parsed);
  const result = await compareMonosaccharideCandidates(candidates);
  const outputDir = resolve(getOption(args, "--output-dir") ?? "./review-output");

  if (!args.includes("--dry-run")) {
    await mkdir(outputDir, { recursive: true });
    await Promise.all([
      writeFile(resolve(outputDir, "new_candidates.json"), `${JSON.stringify(result.newCandidates, null, 2)}\n`),
      writeFile(resolve(outputDir, "changed_source_records.json"), `${JSON.stringify(result.changedSourceRecords, null, 2)}\n`),
      writeFile(resolve(outputDir, "unmatched_existing_records.json"), `${JSON.stringify(result.unmatchedExistingRecords, null, 2)}\n`),
    ]);
  }

  console.log(JSON.stringify({
    input: resolve(inputPath),
    outputDir: args.includes("--dry-run") ? null : outputDir,
    liveRecords: monosaccharidesAndModifications.length,
    candidateRecords: candidates.length,
    newCandidates: result.newCandidates.length,
    changedSourceRecords: result.changedSourceRecords.length,
    unmatchedExistingRecords: result.unmatchedExistingRecords.length,
    dryRun: args.includes("--dry-run"),
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});