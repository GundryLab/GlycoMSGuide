/**
 * Strict integrity tests for the diagnostic-ion dataset and every place on the
 * site that cites an ion by m/z.
 *
 * Unlike validateDiagnosticIons.ts (which produces a review report), these
 * tests FAIL the build whenever the data are inconsistent. Run with:
 *
 *   pnpm --filter @workspace/glycan-msms run test:diagnostic-ions
 *
 * Rules enforced
 *  1. Every ion declares an elemental `formula` (of the ion itself) and a `charge`.
 *  2. The stored m/z equals the m/z computed from formula + charge, rounded to
 *     4 decimals (proton/electron mass handled explicitly).
 *  3. The charge sign agrees with `polarity`.
 *  4. The formula is chemically possible: RDBE >= 0 and an even number of
 *     valence electrons (all listed ions are even-electron).
 *  5. Glycosidic fragments (B/C/Y/Z/oxonium) that contain HexNAc or a sialic
 *     acid must contain N; phospho/sulfo ions must contain P/S.
 *  6. Ions that share an m/z (same polarity) must share the same formula; the
 *     same ion may carry several structural interpretations, different ions may not.
 *  7. When the human-readable `composition` string states an explicit formula,
 *     it must agree with the structured formula.
 *  8. No fixed-m/z "peptide-dependent" Y-ions.
 *  9. Every m/z cited in application guides, challenging compositions,
 *     monosaccharide records and GlyTouCan override rules must exist in the
 *     dataset (or in the small, formula-verified allowlist below).
 * 10. The published JSON download is in sync with the source dataset.
 * 11. Every source-verified ion carries at least one evidence record naming a reference,
 *     a table/figure/page locator, the m/z as printed (within the source's precision)
 *     and the source's assignment. Ions without a located source are shown as
 *     calculated compositions (verification "calculated", empty evidence, evidenceNote)
 *     and are never cited by guides, challenge cards or monosaccharide records.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  diagnosticIons,
  glytoucanOverrideRules,
  withdrawnDiagnosticIons,
  calculatedCompositionIons,
  references,
} from "../src/data/glycanData";
import { applicationGuides, allApplicationGuides } from "../src/data/applicationGuides";
import { challengingCompositions } from "../src/data/challengingCompositions";
import { monosaccharidesAndModifications as monosaccharideRecords } from "../src/data/monosaccharidesData";
import {
  ELECTRON_MASS,
  ELEMENT_MASSES,
  compositionStringMz,
  parseElementalFormula,
  type DiagnosticIonRecord,
} from "./validateDiagnosticIons";

const here = dirname(fileURLToPath(import.meta.url));

/** Valence electrons used for the even-electron (parity) check. */
const VALENCE_ELECTRONS: Record<string, number> = { C: 4, H: 1, N: 5, O: 6, P: 5, S: 6 };

/**
 * Ions cited on the site that are intentionally not rows in the diagnostic-ion
 * table. Each one is verified from its formula here, so a typo still fails.
 */
// Only hidden (evidenceStatus: "pending") guides may cite these; published pages may not.
const CITED_ONLY_IONS: { mz: number; formula: string; charge: 1 | -1; label: string }[] = [
  { mz: 79.9574, formula: "O3S", charge: -1, label: "SO₃•⁻ (sulfate radical anion; hidden sulfation guide)" },
];

function atomsOf(formula: string): Map<string, number> {
  const parsed = parseElementalFormula(formula);
  assert.ok(parsed, `unparseable formula "${formula}"`);
  return parsed.atoms;
}

function mzFromFormula(formula: string, charge: number): number {
  let mass = 0;
  for (const [element, count] of atomsOf(formula)) mass += ELEMENT_MASSES[element] * count;
  return (mass - charge * ELECTRON_MASS) / Math.abs(charge);
}

function rdbe(atoms: Map<string, number>): number {
  const c = atoms.get("C") ?? 0;
  const h = atoms.get("H") ?? 0;
  const n = atoms.get("N") ?? 0;
  // P treated as trivalent (as in a P=O counted double bond); only used as a
  // lower-bound sanity check.
  const p = atoms.get("P") ?? 0;
  return c - h / 2 + (n + p) / 2 + 1;
}

function valenceElectronCount(atoms: Map<string, number>, charge: number): number {
  let total = 0;
  for (const [element, count] of atoms) total += (VALENCE_ELECTRONS[element] ?? 0) * count;
  return total - charge;
}

const key = (mz: number) => mz.toFixed(4);
const datasetKeys = new Set(diagnosticIons.map((ion) => key(ion.mz)));
/** Only source-verified ions may be cited by guides, challenge cards and monosaccharide records. */
const citableKeys = new Set(diagnosticIons.filter((ion) => ion.verification === "source").map((ion) => key(ion.mz)));
const citedOnlyKeys = new Set(CITED_ONLY_IONS.map((ion) => key(ion.mz)));

test("1–3: every ion has a formula and charge, and its stored m/z is the computed value", () => {
  const problems: string[] = [];
  for (const ion of diagnosticIons) {
    if (!ion.formula || !parseElementalFormula(ion.formula)) {
      problems.push(`${ion.mz}: missing or unparseable formula`);
      continue;
    }
    if (ion.charge !== 1 && ion.charge !== -1) {
      problems.push(`${ion.mz}: charge must be +1 or -1`);
      continue;
    }
    const computed = mzFromFormula(ion.formula, ion.charge);
    if (computed.toFixed(4) !== ion.mz.toFixed(4)) {
      problems.push(`${ion.mz}: ${ion.formula} (${ion.charge > 0 ? "+" : "−"}) computes to ${computed.toFixed(5)}`);
    }
    const expectedPolarity = ion.charge > 0 ? "positive" : "negative";
    if (ion.polarity !== expectedPolarity) {
      problems.push(`${ion.mz}: polarity "${ion.polarity}" conflicts with charge ${ion.charge}`);
    }
  }
  assert.deepEqual(problems, []);
});

test("4: formulas are chemically possible even-electron ions", () => {
  const problems: string[] = [];
  for (const ion of diagnosticIons) {
    const atoms = atomsOf(ion.formula);
    if (rdbe(atoms) < 0) problems.push(`${ion.mz}: ${ion.formula} has negative RDBE`);
    if (valenceElectronCount(atoms, ion.charge) % 2 !== 0) {
      problems.push(`${ion.mz}: ${ion.formula} is odd-electron; add it deliberately if a radical ion is intended`);
    }
  }
  assert.deepEqual(problems, []);
});

test("5: glycosidic fragments contain the heteroatoms their assignment requires", () => {
  const problems: string[] = [];
  const glycosidic = /^(?:b|c|y|z)-ion$|^oxonium$/i;
  for (const ion of diagnosticIons) {
    if (!glycosidic.test(ion.ionType ?? "")) continue;
    const atoms = atomsOf(ion.formula);
    const residues = new Set(ion.monosaccharides ?? []);
    const text = `${ion.description} ${ion.composition}`;
    const needsN =
      ["HexNAc", "GlcNAc", "GalNAc", "Neu5Ac", "Neu5Gc"].some((r) => residues.has(r)) ||
      /\bHexNAc|GlcNAc|GalNAc|Neu5Ac|Neu5Gc/.test(text);
    if (needsN && !atoms.has("N")) problems.push(`${ion.mz}: HexNAc/sialic acid assignment without N`);
    if (/phospho|Man-6-P|-P\b|HPO₃/i.test(text) && !atoms.has("P")) problems.push(`${ion.mz}: phosphate assignment without P`);
    if (/sulfo|sulfat|HSO₃|SO₃/i.test(text) && !atoms.has("S")) problems.push(`${ion.mz}: sulfate assignment without S`);
  }
  assert.deepEqual(problems, []);
});

test("6: ions that share an m/z share a formula", () => {
  const byKey = new Map<string, Set<string>>();
  for (const ion of diagnosticIons) {
    const k = `${key(ion.mz)}|${ion.polarity}`;
    if (!byKey.has(k)) byKey.set(k, new Set());
    byKey.get(k)!.add(ion.formula);
  }
  const conflicts = [...byKey.entries()].filter(([, formulas]) => formulas.size > 1);
  assert.deepEqual(conflicts.map(([k, f]) => `${k}: ${[...f].join(" vs ")}`), []);
});

test("7: explicit formulas in composition strings agree with the structured formula", () => {
  const problems: string[] = [];
  for (const ion of diagnosticIons) {
    const fromText = compositionStringMz(ion as DiagnosticIonRecord);
    if (fromText === null) continue;
    if (Math.abs(fromText - ion.mz) > 0.00006) {
      problems.push(`${ion.mz}: composition "${ion.composition}" implies m/z ${fromText.toFixed(4)}`);
    }
  }
  assert.deepEqual(problems, []);
});

test("8: no fixed-m/z peptide-dependent Y-ions", () => {
  const offenders = diagnosticIons.filter(
    (ion) => /y-ion/i.test(ion.ionType ?? "") && /peptide[- ]dependent/i.test(`${ion.description} ${ion.composition}`),
  );
  assert.deepEqual(offenders.map((ion) => ion.mz), []);
});

test("9a: allow-listed ions (hidden guides only) are themselves correct", () => {
  for (const ion of CITED_ONLY_IONS) {
    assert.equal(mzFromFormula(ion.formula, ion.charge).toFixed(4), ion.mz.toFixed(4), ion.label);
    assert.ok(!datasetKeys.has(key(ion.mz)), `${ion.mz} is now in the dataset; remove it from CITED_ONLY_IONS`);
  }
});

function unknownCitations(citations: { where: string; mz: number }[]): string[] {
  return citations
    .filter(({ mz }) => !citableKeys.has(key(mz)))
    .map(({ where, mz }) => `${where}: m/z ${mz} is not a dataset ion`);
}

test("9b: published application guides cite only source-verified ions", () => {
  const citations = applicationGuides.flatMap((guide) =>
    guide.ions.map((ion) => ({ where: `guide "${guide.id}"`, mz: ion.mz })),
  );
  assert.deepEqual(unknownCitations(citations), []);
});

test("9c: challenging compositions cite only dataset ions", () => {
  const citations = challengingCompositions.flatMap((challenge) =>
    (challenge.relevantIons ?? []).map((ion) => ({ where: `challenge "${challenge.id}"`, mz: ion.mz })),
  );
  assert.deepEqual(unknownCitations(citations), []);
});

test("9d: monosaccharide records cite only dataset ions", () => {
  const citations = monosaccharideRecords.flatMap((record) =>
    (record.relatedDiagnosticIons ?? []).map((ion) => ({ where: `monosaccharide "${record.id}"`, mz: ion.mz })),
  );
  assert.deepEqual(unknownCitations(citations), []);
});

test("9e: every GlyTouCan override rule matches at least one ion", () => {
  const unmatched = glytoucanOverrideRules.filter(
    (rule) =>
      !diagnosticIons.some(
        (ion) =>
          key(ion.mz) === key(rule.mz) &&
          ion.polarity === rule.polarity &&
          (!rule.descriptionMatch || rule.descriptionMatch.test(ion.description)),
      ),
  );
  assert.deepEqual(unmatched.map((rule) => rule.mz), []);
});

test("10: the published JSON download matches the source dataset", () => {
  const jsonPath = resolve(here, "../public/data/diagnostic-ions.json");
  const published = JSON.parse(readFileSync(jsonPath, "utf8")) as {
    count: number;
    ions: { mz: number; formula?: string; charge?: number }[];
  };
  assert.equal(published.count, diagnosticIons.length, "regenerate public/data/diagnostic-ions.json");
  assert.deepEqual(
    published.ions.map((ion) => `${ion.mz}|${ion.formula}|${ion.charge}`),
    diagnosticIons.map((ion) => `${ion.mz}|${ion.formula}|${ion.charge}`),
    "regenerate public/data/diagnostic-ions.json",
  );
});

const REFERENCE_KEYS = new Set(references.map((r) => r.id));
const calculatedKeys = new Set(calculatedCompositionIons().map((ion) => key(ion.mz)));

/** Tolerance for comparing a source's printed m/z with the formula-computed value, by printed precision. */
function tolerance(reported: string): number {
  const decimals = reported.includes(".") ? reported.split(".")[1].length : 0;
  const value = Number(reported);
  // 3–4 decimal values may be calculated (DeBono drifts up to ~1 mDa) or measured (e.g. Darula 2019, Orbitrap): allow 10 ppm.
  if (decimals >= 4) return Math.max(0.0015, 10e-6 * value);
  if (decimals === 3) return Math.max(0.003, 10e-6 * value);
  if (decimals >= 1) return 0.3; // Q-TOF (Harvey) and ion-trap (Ashwood) nominal-accuracy reports
  return 0.5; // integer values (Harvey 2005c Table 1)
}

const CALC_SOURCE = "Calculated composition (primary source not yet located)";

test("11a: every source-verified ion has at least one specific, checkable evidence record", () => {
  const problems: string[] = [];
  for (const ion of diagnosticIons) {
    if (ion.verification !== "source") continue;
    if (!ion.source.trim()) problems.push(`${ion.mz}: missing source label`);
    if (!ion.evidence || ion.evidence.length === 0) { problems.push(`${ion.mz}: no evidence`); continue; }
    for (const ev of ion.evidence) {
      if (!REFERENCE_KEYS.has(ev.sourceKey)) problems.push(`${ion.mz}: evidence sourceKey "${ev.sourceKey}" not in references`);
      if (!/(Table|Fig|p\.|pp\.|slide|ESM)/.test(ev.locator)) problems.push(`${ion.mz}: locator "${ev.locator}" is not a table/figure/page`);
      if (!ev.reportedAssignment) problems.push(`${ion.mz}: evidence lacks the source's assignment`);
      if (ev.evidenceType === "compilation" && (!ev.primaryReferences || ev.primaryReferences.length === 0)) {
        problems.push(`${ion.mz}: compilation evidence must name its primary references`);
      }
      const reported = Number(ev.reportedMz);
      if (Number.isFinite(reported) && Math.abs(reported - ion.mz) > tolerance(ev.reportedMz)) {
        problems.push(`${ion.mz}: source reports ${ev.reportedMz}, outside tolerance`);
      }
      const polarityWord = ion.polarity === "positive" ? "positive" : "negative";
      if (!ev.context.toLowerCase().includes(polarityWord)) problems.push(`${ion.mz}: evidence context does not state ${polarityWord} ion mode`);
    }
  }
  assert.deepEqual(problems, []);
});

test("11c: calculated-composition ions are labelled as such and say what evidence is needed", () => {
  const problems: string[] = [];
  for (const ion of diagnosticIons) {
    if (ion.verification !== "source" && ion.verification !== "calculated") problems.push(`${ion.mz}: invalid verification`);
    if (ion.verification !== "calculated") continue;
    if (ion.evidence.length !== 0) problems.push(`${ion.mz}: calculated ion must not carry evidence records`);
    if (!ion.evidenceNote || ion.evidenceNote.length < 20) problems.push(`${ion.mz}: missing evidenceNote`);
    if (ion.source !== CALC_SOURCE) problems.push(`${ion.mz}: source must read "${CALC_SOURCE}"`);
  }
  assert.deepEqual(problems, []);
});

test("11d: hidden guides cite only known ions (in the table or allow-listed)", () => {
  const known = new Set([...datasetKeys, ...calculatedKeys, ...citedOnlyKeys]);
  const bad = allApplicationGuides
    .filter((g) => g.evidenceStatus === "pending")
    .flatMap((g) => g.ions.filter((ion) => !known.has(key(ion.mz))).map((ion) => `${g.id}: ${ion.mz}`));
  assert.deepEqual(bad, []);
});

test("11b: withdrawn entries have reasons and are not cited as live ions", () => {
  const problems: string[] = [];
  const liveKeys = new Set(diagnosticIons.map((ion) => `${key(ion.mz)}|${ion.polarity}|${ion.description}`));
  for (const w of withdrawnDiagnosticIons) {
    if (!w.reason || w.reason.length < 20) problems.push(`${w.mz}: withdrawn without a substantive reason`);
    if (liveKeys.has(`${key(w.mz)}|${w.polarity}|${w.description}`)) problems.push(`${w.mz}: withdrawn entry still present in diagnosticIons`);
  }
  assert.deepEqual(problems, []);
  assert.equal(
    diagnosticIons.length + withdrawnDiagnosticIons.length,
    154 + 40,
    "154 original entries + 40 added ions must all be accounted for",
  );
});
