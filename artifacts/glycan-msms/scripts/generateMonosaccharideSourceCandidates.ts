import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  monosaccharidesAndModifications,
  monosaccharideDatasetLastUpdated,
  type MonosaccharideModification,
} from "../src/data/monosaccharidesData";

export type SourceFormat = "normalized" | "glycosmos" | "glygen";

export type SourceSnapshotRecord = {
  id: string;
  sourceIdentity?: string;
  name?: string;
  formula?: string;
  chebiId?: string | string[];
  pubChemCid?: string | string[];
  glyTouCanIds?: string[];
};

export type CandidateChange = {
  id: string;
  status: "candidate-change" | "candidate-new-record";
  sourceIdentity?: string;
  differences: Record<string, { curated?: unknown; source?: unknown }>;
};

type JsonRecord = Record<string, unknown>;
type ExternalIdentifiers = {
  chebiIds?: string[];
  pubChemCids?: string[];
  glyTouCanIds?: string[];
};

const comparableFields = ["name", "formula", "chebiId", "pubChemCid", "glyTouCanIds"] as const;
const normalizedFields = new Set(["id", ...comparableFields]);
const glyCosmosHeaders = [
  "Accession Number",
  "IUPAC Condensed",
  "WURCS",
  "Monoisotopic mass",
  "Motif name(s)",
  "Subsumption",
  "ChEBI",
  "PubChem CID",
  "Taxonomy",
  "GlycomeAtlas",
] as const;
const glyGenFields = new Set([
  "glytoucan", "mass", "number_monosaccharides", "wurcs", "glycoct", "species",
  "classification", "crossref", "mass_pme", "tool_support", "missing_score",
  "glycan_type", "byonic", "gwb", "publication", "composition",
  "composition_expanded", "expression", "subsumption", "names", "structures",
  "section_stats", "history",
]);

function objectAt(value: unknown, location: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${location} must be an object.`);
  }
  return value as JsonRecord;
}

function rejectUnknownFields(record: JsonRecord, allowed: Set<string>, location: string) {
  const unsupported = Object.keys(record).filter((field) => !allowed.has(field));
  if (unsupported.length) {
    throw new Error(`${location} contains unsupported field(s): ${unsupported.join(", ")}.`);
  }
}

function requiredString(value: unknown, location: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${location} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalString(value: unknown, location: string): string | undefined {
  if (value === undefined) return undefined;
  return requiredString(value, location);
}

function optionalStringArray(value: unknown, location: string): string[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) throw new Error(`${location} must be an array of strings.`);
  const normalized = value.map((entry, index) => requiredString(entry, `${location}[${index}]`));
  if (new Set(normalized).size !== normalized.length) {
    throw new Error(`${location} contains duplicate identifiers.`);
  }
  return normalized.sort();
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      if (field) throw new Error(`Malformed CSV: unexpected quote at character ${index}.`);
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("Malformed CSV: unterminated quoted field.");
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows.filter((candidate) => candidate.some((value) => value !== ""));
}

function sourceMatches(
  identifiers: ExternalIdentifiers,
  curated: MonosaccharideModification,
): boolean {
  return Boolean(
    identifiers.glyTouCanIds?.some((id) => curated.glyTouCanIds?.includes(id))
    || identifiers.chebiIds?.includes(curated.chebiId ?? "")
    || identifiers.pubChemCids?.includes(curated.pubChemCid ?? ""),
  );
}

function mapByStableIdentifiers(
  identifiers: ExternalIdentifiers,
  sourceIdentity: string,
  curatedRecords: MonosaccharideModification[],
): { id: string; glyTouCanIds?: string[] } {
  const matches = curatedRecords.filter((record) => sourceMatches(identifiers, record));
  if (matches.length > 1) {
    throw new Error(
      `${sourceIdentity} maps ambiguously to curated records: ${matches.map(({ id }) => id).join(", ")}.`,
    );
  }
  const matched = matches[0];
  if (!matched) return { id: sourceIdentity, glyTouCanIds: identifiers.glyTouCanIds };
  const glyTouCanIds = identifiers.glyTouCanIds
    ? [...new Set([...(matched.glyTouCanIds ?? []), ...identifiers.glyTouCanIds])].sort()
    : undefined;
  return { id: matched.id, glyTouCanIds };
}

function parseNormalized(text: string): SourceSnapshotRecord[] {
  const input: unknown = JSON.parse(text);
  if (!Array.isArray(input)) throw new Error("Normalized source snapshot must be a JSON array.");
  return input.map((value, index) => {
    const location = `records[${index}]`;
    const record = objectAt(value, location);
    rejectUnknownFields(record, normalizedFields, location);
    return {
      id: requiredString(record.id, `${location}.id`),
      name: optionalString(record.name, `${location}.name`),
      formula: optionalString(record.formula, `${location}.formula`),
      chebiId: optionalString(record.chebiId, `${location}.chebiId`),
      pubChemCid: optionalString(record.pubChemCid, `${location}.pubChemCid`),
      glyTouCanIds: optionalStringArray(record.glyTouCanIds, `${location}.glyTouCanIds`),
    };
  });
}

function csvIdentifiers(value: string, location: string): string[] | undefined {
  const normalized = value.trim();
  if (!normalized) return undefined;
  const identifiers = normalized.split(",").map((entry) => entry.trim().replace(/^CHEBI:/i, ""));
  if (identifiers.some((entry) => !entry)) {
    throw new Error(`${location} contains an empty identifier.`);
  }
  if (new Set(identifiers).size !== identifiers.length) {
    throw new Error(`${location} contains duplicate identifiers.`);
  }
  return identifiers;
}

function comparisonIdentifier(
  identifiers: string[] | undefined,
  curatedIdentifier: string | undefined,
): string | string[] | undefined {
  if (!identifiers?.length) return undefined;
  if (identifiers.length === 1) return identifiers[0];
  if (curatedIdentifier && identifiers.includes(curatedIdentifier)) return curatedIdentifier;
  return identifiers;
}

function parseGlyCosmos(
  text: string,
  curatedRecords: MonosaccharideModification[],
): SourceSnapshotRecord[] {
  const rows = parseCsv(text);
  if (!rows.length) throw new Error("GlyCosmos CSV export is empty.");
  const headers = rows[0];
  if (
    headers.length !== glyCosmosHeaders.length
    || headers.some((header, index) => header !== glyCosmosHeaders[index])
  ) {
    throw new Error(
      `Unsupported GlyCosmos CSV header. Expected: ${glyCosmosHeaders.join(",")}.`,
    );
  }
  return rows.slice(1).flatMap((row, index) => {
    const location = `GlyCosmos row ${index + 2}`;
    if (row.length !== headers.length) {
      throw new Error(`${location} has ${row.length} columns; expected ${headers.length}.`);
    }
    const wurcs = requiredString(row[2], `${location}.WURCS`);
    const wurcsCounts = /^WURCS=2\.0\/[^,/]+,(\d+),[^/]+\//.exec(wurcs);
    if (!wurcsCounts) throw new Error(`${location}.WURCS has an unsupported structure format.`);
    if (Number(wurcsCounts[1]) !== 1) return [];
    const accession = requiredString(row[0], `${location}.Accession Number`);
    const sourceIdentity = `glycosmos:${accession}`;
    const identifiers: ExternalIdentifiers = {
      glyTouCanIds: [accession],
      chebiIds: csvIdentifiers(row[6], `${location}.ChEBI`),
      pubChemCids: csvIdentifiers(row[7], `${location}.PubChem CID`),
    };
    const mapped = mapByStableIdentifiers(identifiers, sourceIdentity, curatedRecords);
    const curated = curatedRecords.find(({ id }) => id === mapped.id);
    return [{
      id: mapped.id,
      sourceIdentity,
      chebiId: comparisonIdentifier(identifiers.chebiIds, curated?.chebiId),
      pubChemCid: comparisonIdentifier(identifiers.pubChemCids, curated?.pubChemCid),
      glyTouCanIds: mapped.glyTouCanIds,
    }];
  });
}

function numberAt(value: unknown, location: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${location} must be a finite number.`);
  }
  return value;
}

function parseGlyGenRecord(
  value: unknown,
  index: number,
  curatedRecords: MonosaccharideModification[],
): SourceSnapshotRecord {
  const location = `GlyGen records[${index}]`;
  const record = objectAt(value, location);
  rejectUnknownFields(record, glyGenFields, location);
  const glytoucan = objectAt(record.glytoucan, `${location}.glytoucan`);
  rejectUnknownFields(glytoucan, new Set(["glytoucan_ac", "glytoucan_url"]), `${location}.glytoucan`);
  const accession = requiredString(glytoucan.glytoucan_ac, `${location}.glytoucan.glytoucan_ac`);
  optionalString(glytoucan.glytoucan_url, `${location}.glytoucan.glytoucan_url`);
  const residueCount = numberAt(record.number_monosaccharides, `${location}.number_monosaccharides`);
  if (residueCount !== 1) {
    throw new Error(`${location} is not a single-residue glycan; found ${residueCount} residues.`);
  }
  if (!Array.isArray(record.composition) || record.composition.length !== 1) {
    throw new Error(`${location}.composition must contain exactly one residue.`);
  }
  const composition = objectAt(record.composition[0], `${location}.composition[0]`);
  rejectUnknownFields(
    composition,
    new Set(["name", "residue", "count", "cid", "url"]),
    `${location}.composition[0]`,
  );
  if (numberAt(composition.count, `${location}.composition[0].count`) !== 1) {
    throw new Error(`${location}.composition[0].count must be 1.`);
  }
  requiredString(composition.name, `${location}.composition[0].name`);
  requiredString(composition.residue, `${location}.composition[0].residue`);
  const pubChemCid = optionalString(composition.cid, `${location}.composition[0].cid`);
  optionalString(composition.url, `${location}.composition[0].url`);

  const sourceIdentity = `glygen:${accession}`;
  const identifiers: ExternalIdentifiers = {
    glyTouCanIds: [accession],
    pubChemCids: pubChemCid ? [pubChemCid] : undefined,
  };
  const mapped = mapByStableIdentifiers(identifiers, sourceIdentity, curatedRecords);
  return {
    id: mapped.id,
    sourceIdentity,
    pubChemCid,
    glyTouCanIds: mapped.glyTouCanIds,
  };
}

function parseGlyGen(
  text: string,
  curatedRecords: MonosaccharideModification[],
): SourceSnapshotRecord[] {
  const input: unknown = JSON.parse(text);
  const records = Array.isArray(input) ? input : [input];
  return records.map((record, index) => parseGlyGenRecord(record, index, curatedRecords));
}

export function parseSourceExport(
  text: string,
  format: SourceFormat,
  curatedRecords = monosaccharidesAndModifications,
): SourceSnapshotRecord[] {
  const records = format === "normalized"
    ? parseNormalized(text)
    : format === "glycosmos"
      ? parseGlyCosmos(text, curatedRecords)
      : format === "glygen"
        ? parseGlyGen(text, curatedRecords)
        : (() => { throw new Error(`Unsupported source format: ${String(format)}.`); })();
  const identities = new Set<string>();
  for (const record of records) {
    const identity = record.sourceIdentity ?? record.id;
    if (identities.has(identity)) throw new Error(`Source export contains duplicate record "${identity}".`);
    identities.add(identity);
  }
  return records;
}

export function generateCandidates(
  snapshot: SourceSnapshotRecord[],
  curatedRecords = monosaccharidesAndModifications,
): CandidateChange[] {
  const curatedById = new Map(curatedRecords.map((record) => [record.id, record]));
  const candidates: CandidateChange[] = [];
  for (const sourceRecord of snapshot) {
    const curated = curatedById.get(sourceRecord.id);
    const differences: CandidateChange["differences"] = {};
    if (!curated) {
      for (const field of comparableFields) {
        if (sourceRecord[field] !== undefined) differences[field] = { source: sourceRecord[field] };
      }
      candidates.push({
        id: sourceRecord.id,
        sourceIdentity: sourceRecord.sourceIdentity,
        status: "candidate-new-record",
        differences,
      });
      continue;
    }
    for (const field of comparableFields) {
      const sourceValue = sourceRecord[field];
      if (sourceValue === undefined) continue;
      const curatedValue = curated[field];
      const comparableCurated = field === "glyTouCanIds" && curatedValue
        ? [...curatedValue].sort()
        : curatedValue;
      if (JSON.stringify(comparableCurated) !== JSON.stringify(sourceValue)) {
        differences[field] = { curated: curatedValue, source: sourceValue };
      }
    }
    if (Object.keys(differences).length) {
      candidates.push({
        id: sourceRecord.id,
        sourceIdentity: sourceRecord.sourceIdentity,
        status: "candidate-change",
        differences,
      });
    }
  }
  return candidates;
}

async function main() {
  const args = process.argv.slice(2).filter((argument) => argument !== "--");
  let format: SourceFormat = "normalized";
  const formatIndex = args.indexOf("--format");
  if (formatIndex !== -1) {
    const requested = args[formatIndex + 1];
    if (!requested || !["normalized", "glycosmos", "glygen"].includes(requested)) {
      throw new Error("--format must be normalized, glycosmos, or glygen.");
    }
    format = requested as SourceFormat;
    args.splice(formatIndex, 2);
  }
  const [inputArg, outputArg] = args;
  if (!inputArg) {
    console.error(
      "Usage: pnpm sources:monosaccharides -- --format <normalized|glycosmos|glygen> <source-export> [candidate-report.json]",
    );
    console.error("This command only writes a candidate report. It never edits src/data/monosaccharidesData.ts.");
    process.exitCode = 1;
    return;
  }
  const inputPath = resolve(inputArg);
  const outputPath = resolve(outputArg ?? "monosaccharide-source-candidates.json");
  if (outputPath.endsWith("/src/data/monosaccharidesData.ts")) {
    throw new Error("Refusing to write to the live curated dataset.");
  }
  const snapshot = parseSourceExport(await readFile(inputPath, "utf8"), format);
  const candidates = generateCandidates(snapshot);
  const report = {
    reportType: "manual-review candidates",
    sourceFormat: format,
    curatedDatasetLastUpdated: monosaccharideDatasetLastUpdated,
    generatedAt: new Date().toISOString(),
    inputSnapshot: inputPath,
    safetyNotice: "No curated records were modified. An expert must review and manually apply accepted changes.",
    sourceRecordCount: snapshot.length,
    candidateCount: candidates.length,
    unchangedCount: snapshot.length - candidates.length,
    candidates,
  };
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Wrote ${candidates.length} candidate changes to ${outputPath}.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();