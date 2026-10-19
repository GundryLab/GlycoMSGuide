import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { diagnosticIons } from "../src/data/glycanData";

export interface DiagnosticIonRecord {
  mz: number;
  description: string;
  composition: string;
  polarity: "positive" | "negative";
  ionType?: string;
  source?: string;
  notes?: string;
  formula?: string;
  /** Signed charge of the resulting ion. Without an adduct, formula describes the ion's atoms. */
  charge?: number;
  /** Explicit ionization/adduct notation when formula describes the neutral molecule. */
  adduct?: string;
}

export interface DiagnosticIonValidationRow {
  currentMz: number;
  assignment: string;
  polarity: string;
  ionType: string;
  formula: string;
  theoreticalMz: number | null;
  theoreticalMinusStoredMz: number | null;
  reference: string;
  status: "PASS" | "REVIEW";
  reason: string;
}

const ELEMENT_MASSES: Record<string, number> = {
  C: 12,
  H: 1.00782503223,
  N: 14.00307400443,
  O: 15.99491461957,
  P: 30.97376199842,
  S: 31.9720711744,
  Na: 22.989769282,
  K: 38.9637064864,
  Cl: 34.968852682,
};
const ELECTRON_MASS = 0.000548579909065;
const FORMULA_ROUNDING_TOLERANCE_DA = 0.00015;
const SUBSCRIPT_DIGITS: Record<string, string> = {
  "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4",
  "₅": "5", "₆": "6", "₇": "7", "₈": "8", "₉": "9",
};

interface FormulaParse {
  normalized: string;
  atoms: Map<string, number>;
}

interface ExplicitIonDefinition {
  formula: FormulaParse;
  formulaForReport: string;
  charge: number;
  atomMassAdjustment: number;
}

function normalizeSubscripts(value: string): string {
  return [...value].map((character) => SUBSCRIPT_DIGITS[character] ?? character).join("");
}

export function parseElementalFormula(value: string): FormulaParse | null {
  const normalized = normalizeSubscripts(value).replace(/\s/g, "");
  if (!normalized) return null;

  const atoms = new Map<string, number>();
  const tokenPattern = /([A-Z][a-z]?)(\d*)/g;
  let cursor = 0;
  for (const match of normalized.matchAll(tokenPattern)) {
    if (match.index !== cursor) return null;
    const element = match[1];
    if (!(element in ELEMENT_MASSES)) return null;
    const count = match[2] ? Number(match[2]) : 1;
    if (!Number.isSafeInteger(count) || count < 1) return null;
    atoms.set(element, (atoms.get(element) ?? 0) + count);
    cursor += match[0].length;
  }
  if (cursor !== normalized.length || atoms.size < 2) return null;
  return { normalized, atoms };
}

function formulaFromRecord(record: DiagnosticIonRecord): {
  formula: FormulaParse | null;
  original: string;
  suffix: string;
} {
  if (record.formula) {
    return {
      formula: parseElementalFormula(record.formula),
      original: record.formula,
      suffix: "",
    };
  }

  const text = normalizeSubscripts(record.composition ?? "")
    .replace(/⁺/g, "+")
    .replace(/⁻|−/g, "-");
  const formulaPattern = "C(?:\\d+)?(?:[A-Z][a-z]?\\d*)+";
  const molecularAdduct = new RegExp(`^\\s*(${formulaPattern})(?=\\s*\\[\\s*M\\s*[+-])`).exec(text);
  if (molecularAdduct) {
    const formulaText = molecularAdduct[1];
    const start = molecularAdduct.index + molecularAdduct[0].lastIndexOf(formulaText);
    const suffix = text.slice(start + formulaText.length);
    return { formula: parseElementalFormula(formulaText), original: formulaText, suffix };
  }

  const chargedParenthesis = new RegExp(`\\(\\s*(${formulaPattern})([+-])\\s*\\)`).exec(text);
  if (chargedParenthesis) {
    const formulaText = chargedParenthesis[1];
    return {
      formula: parseElementalFormula(formulaText),
      original: formulaText,
      suffix: chargedParenthesis[2],
    };
  }

  const standaloneCharged = new RegExp(`^\\s*(${formulaPattern})([+-])\\s*(?:\\([^)]*\\))?\\s*$`).exec(text);
  if (standaloneCharged) {
    const formulaText = standaloneCharged[1];
    return {
      formula: parseElementalFormula(formulaText),
      original: formulaText,
      suffix: standaloneCharged[2],
    };
  }
  return { formula: null, original: "", suffix: "" };
}

function explicitIonDefinition(record: DiagnosticIonRecord): ExplicitIonDefinition | null {
  const extracted = formulaFromRecord(record);
  if (!extracted.formula) return null;

  const adductText = record.adduct ?? extracted.suffix;
  const normalizedAdduct = adductText
    .replace(/−/g, "-")
    .replace(/⁺/g, "+")
    .replace(/⁻/g, "-");
  const adductMatch = normalizedAdduct.match(/\[\s*M\s*([^\]]+)\s*\]\s*([+-])/i);

  if (adductMatch) {
    const afterAdduct = normalizedAdduct.slice(adductMatch.index! + adductMatch[0].length);
    if (!/^\s*(?:\([^)]*\)\s*)?$/.test(afterAdduct)) return null;

    const operations = adductMatch[1].replace(/\s/g, "");
    const operationPattern = /([+-])(\d*)(Na|K|H)/g;
    let cursor = 0;
    let atomMassAdjustment = 0;
    for (const match of operations.matchAll(operationPattern)) {
      if (match.index !== cursor) return null;
      const count = match[2] ? Number(match[2]) : 1;
      const direction = match[1] === "+" ? 1 : -1;
      atomMassAdjustment += direction * count * ELEMENT_MASSES[match[3]];
      cursor += match[0].length;
    }
    if (cursor !== operations.length) return null;

    const charge = adductMatch[2] === "+" ? 1 : -1;
    if (record.charge !== undefined && record.charge !== charge) return null;
    return {
      formula: extracted.formula,
      formulaForReport: extracted.original,
      charge,
      atomMassAdjustment,
    };
  }

  if (record.adduct) return null;
  const suffix = extracted.suffix.replace(/−/g, "-").replace(/⁺/g, "+").replace(/⁻/g, "-");
  const directIon = suffix.match(/^\s*([+-])(?:$|\b|[^A-Za-z])/);
  const chargeFromSuffix = directIon ? (directIon[1] === "+" ? 1 : -1) : null;
  const charge = record.charge ?? chargeFromSuffix;
  if (charge === null || !Number.isInteger(charge) || charge === 0) return null;
  if (chargeFromSuffix !== null && charge !== chargeFromSuffix) return null;
  return {
    formula: extracted.formula,
    formulaForReport: extracted.original,
    charge,
    atomMassAdjustment: 0,
  };
}

/**
 * m/z implied by the human-readable `composition` string alone (ignoring the
 * structured `formula`/`charge` fields), or null when the string does not state
 * an explicit elemental formula with an unambiguous charge.
 */
export function compositionStringMz(record: DiagnosticIonRecord): number | null {
  const definition = explicitIonDefinition({
    ...record,
    formula: undefined,
    charge: undefined,
    adduct: undefined,
  });
  return definition ? calculateTheoreticalMz(definition) : null;
}

/** m/z computed from the structured `formula` + `charge` fields. */
export function structuredFormulaMz(record: DiagnosticIonRecord): number | null {
  if (!record.formula || record.charge === undefined) return null;
  const definition = explicitIonDefinition(record);
  return definition ? calculateTheoreticalMz(definition) : null;
}

export { ELEMENT_MASSES, ELECTRON_MASS };

function calculateTheoreticalMz(definition: ExplicitIonDefinition): number {
  let neutralAtomMass = 0;
  for (const [element, count] of definition.formula.atoms) {
    neutralAtomMass += ELEMENT_MASSES[element] * count;
  }
  neutralAtomMass += definition.atomMassAdjustment;
  const ionicMass = neutralAtomMass - definition.charge * ELECTRON_MASS;
  return ionicMass / Math.abs(definition.charge);
}

function addReason(reasons: string[], reason: string): void {
  if (!reasons.includes(reason)) reasons.push(reason);
}

function validateOne(
  record: DiagnosticIonRecord,
  allRecords: DiagnosticIonRecord[],
): DiagnosticIonValidationRow {
  const reasons: string[] = [];
  const extracted = formulaFromRecord(record);
  const definition = explicitIonDefinition(record);
  const assignment = `${record.description}${record.composition ? ` | ${record.composition}` : ""}`;

  if (!extracted.formula) addReason(reasons, "No explicit elemental formula is available: composition shorthand was not converted into one.");
  if (!definition) addReason(reasons, "Charge/adduct is not unambiguously specified with the elemental formula: theoretical m/z cannot be calculated.");

  if (definition) {
    const chargePolarity = definition.charge > 0 ? "positive" : "negative";
    if (record.polarity !== chargePolarity) {
      addReason(reasons, `Polarity conflict: ${record.polarity} metadata disagrees with the explicit ${definition.charge > 0 ? "+" : "−"} charge.`);
    }
  }

  // Heteroatom checks apply to glycosidic fragments (which retain intact residues).
  // Cross-ring (A/X) and small "fragment" ions can legitimately lose the N-acetyl
  // group, phosphate or sulfate, so they are exempt.
  const retainsIntactResidues = !/^(?:a|x)-ion$|^fragment$/i.test(record.ionType ?? "");
  if (extracted.formula && retainsIntactResidues) {
    const atoms = extracted.formula.atoms;
    if (/\bhexnac\b/i.test(assignment) && !atoms.has("N")) {
      addReason(reasons, "HexNAc assignment has an explicit formula with no nitrogen.");
    }
    if (/\bneu5(?:ac|gc)\b/i.test(assignment) && !atoms.has("N")) {
      addReason(reasons, "Neu5Ac/Neu5Gc assignment has an explicit formula with no nitrogen.");
    }
    if (/\bphosph(?:ate|o|oryl(?:ated|ation)?)\b|HPO₃|HPO3/i.test(assignment) && !atoms.has("P")) {
      addReason(reasons, "Phosphate assignment has an explicit formula with no phosphorus.");
    }
    if (/\bsulf(?:ate|ated|o|ation|ated)\b|SO₃|SO3|HSO₄|HSO4/i.test(assignment) && !atoms.has("S")) {
      addReason(reasons, "Sulfate assignment has an explicit formula with no sulfur.");
    }
  }

  // Judged on the assignment itself (description + composition); cautionary
  // notes that merely mention glycopeptides should not trigger this rule.
  const assignmentOnly = `${record.description} ${record.composition}`.toLowerCase();
  if (/y[- ]?ion/i.test(record.ionType ?? "") &&
      /peptide[- ]dependent|peptide[- ]retaining|retains? (?:the )?(?:peptide|peptide portion)|glycopeptide/i.test(assignmentOnly) &&
      !/\b(?:peptide|protein)\s*(?:sequence|formula|mass)\b/i.test(assignmentOnly)) {
    addReason(reasons, "Peptide-dependent Y-ion has no specified peptide composition: a fixed universal m/z is not defined.");
  }

  const key = Number.isFinite(record.mz) ? record.mz.toFixed(4) : String(record.mz);
  // Several structurally distinct assignments may legitimately share one ion
  // (e.g., a B-ion and a dehydrated Y-ion with the same formula). They are only
  // flagged when the ions differ in elemental formula or polarity, or when a
  // formula is missing so that identity cannot be established.
  const duplicates = allRecords.filter((other) => other.mz.toFixed(4) === key);
  if (duplicates.length > 1) {
    const formulaSignatures = new Set(
      duplicates.map((other) => {
        const parsed = formulaFromRecord(other).formula;
        return parsed ? `${parsed.normalized}|${other.polarity}` : `missing:${other.description}`;
      }),
    );
    if (formulaSignatures.size > 1) {
      addReason(reasons, `Stored m/z ${key} has multiple distinct assignments: review the isobaric entries.`);
    }
  }

  const theoreticalMz = definition ? calculateTheoreticalMz(definition) : null;
  const theoreticalMinusStoredMz = theoreticalMz === null ? null : theoreticalMz - record.mz;
  if (theoreticalMinusStoredMz !== null && Math.abs(theoreticalMinusStoredMz) > FORMULA_ROUNDING_TOLERANCE_DA) {
    addReason(reasons, `Calculated m/z differs from stored m/z by ${theoreticalMinusStoredMz.toFixed(6)} Da, beyond the ${FORMULA_ROUNDING_TOLERANCE_DA.toFixed(5)} Da display-rounding tolerance.`);
  }

  return {
    currentMz: record.mz,
    assignment,
    polarity: record.polarity,
    ionType: record.ionType ?? "",
    formula: extracted.original,
    theoreticalMz,
    theoreticalMinusStoredMz,
    reference: record.source ?? "",
    status: reasons.length ? "REVIEW" : "PASS",
    reason: reasons.join("; "),
  };
}

export function validateDiagnosticIons(
  records: DiagnosticIonRecord[],
): DiagnosticIonValidationRow[] {
  return records.map((record) => validateOne(record, records));
}

function csvCell(value: string | number | null): string {
  if (value === null) return "";
  const text = typeof value === "number" ? value.toFixed(6) : value;
  return `"${text.replace(/"/g, '""')}"`;
}

export function validationReportCsv(rows: DiagnosticIonValidationRow[]): string {
  const header = [
    "current_mz",
    "assignment",
    "polarity",
    "ion_type",
    "formula",
    "theoretical_mz",
    "theoretical_minus_stored_mz",
    "reference",
    "status",
    "reason",
  ];
  const lines = rows.map((row) => [
    row.currentMz,
    row.assignment,
    row.polarity,
    row.ionType,
    row.formula,
    row.theoreticalMz,
    row.theoreticalMinusStoredMz,
    row.reference,
    row.status,
    row.reason,
  ].map(csvCell).join(","));
  return [header.join(","), ...lines].join("\n") + "\n";
}

export function summarizeValidation(rows: DiagnosticIonValidationRow[]): {
  total: number;
  pass: number;
  review: number;
  reasons: Record<string, number>;
} {
  const reasons: Record<string, number> = {};
  for (const row of rows) {
    if (row.status !== "REVIEW") continue;
    for (const sentence of row.reason.split("; ")) {
      const normalized = sentence.trim();
      if (normalized) reasons[normalized] = (reasons[normalized] ?? 0) + 1;
    }
  }
  return {
    total: rows.length,
    pass: rows.filter((row) => row.status === "PASS").length,
    review: rows.filter((row) => row.status === "REVIEW").length,
    reasons,
  };
}

async function main(): Promise<void> {
  const records = diagnosticIons as DiagnosticIonRecord[];
  const rows = validateDiagnosticIons(records);
  const outputPath = resolve(dirname(fileURLToPath(import.meta.url)), "../../../exports/diagnostic-ions-validation.csv");
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, validationReportCsv(rows), "utf8");
  console.log(JSON.stringify({
    report: outputPath,
    summary: summarizeValidation(rows),
  }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}