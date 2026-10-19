import assert from "node:assert/strict";
import test from "node:test";
import {
  parseElementalFormula,
  summarizeValidation,
  validateDiagnosticIons,
  type DiagnosticIonRecord,
} from "./validateDiagnosticIons";
import { diagnosticIons } from "../src/data/glycanData";

function ion(overrides: Partial<DiagnosticIonRecord> = {}): DiagnosticIonRecord {
  return {
    mz: 100,
    description: "Generic fragment",
    composition: "composition not specifying an elemental formula",
    polarity: "positive",
    ionType: "B-ion",
    source: "test fixture",
    ...overrides,
  };
}

test("formula parser accepts standard and subscripted elemental formulas only", () => {
  assert.equal(parseElementalFormula("C₂H₃O₂")?.normalized, "C2H3O2");
  assert.equal(parseElementalFormula("C8H15NO6")?.atoms.get("N"), 1);
  assert.equal(parseElementalFormula("HexNAc"), null);
  assert.equal(parseElementalFormula("C2H3Xx"), null);
});

test("calculates m/z only for explicit formula and unambiguous ion/adduct", () => {
  const ions = [
    ion({
      mz: 59.0139,
      description: "Acetate ion",
      composition: "C₂H₃O₂⁻",
      polarity: "negative",
    }),
    ion({
      mz: 220.0826,
      description: "HexNAc [M-H]⁻",
      composition: "C₈H₁₅NO₆ [M-H]⁻",
      polarity: "negative",
    }),
  ];
  const [acetate, hexnac] = validateDiagnosticIons(ions);
  assert.ok(acetate.theoreticalMz);
  assert.ok(Math.abs(acetate.theoreticalMinusStoredMz!) < 0.00015);
  assert.ok(hexnac.theoreticalMz);
  assert.ok(Math.abs(hexnac.theoreticalMinusStoredMz!) < 0.00015);

  const ambiguous = validateDiagnosticIons([
    ion({ formula: "C8H15NO6", polarity: "positive" }),
  ])[0];
  assert.equal(ambiguous.theoreticalMz, null);
  assert.match(ambiguous.reason, /Charge\/adduct is not unambiguously specified/);

  const adductRows = validateDiagnosticIons([
    ion({
      mz: 19.01784,
      formula: "H2O",
      adduct: "[M+H]+",
      polarity: "positive",
    }),
    ion({
      mz: 40.99955,
      formula: "H2O",
      adduct: "[M+Na]+",
      polarity: "positive",
    }),
  ]);
  assert.ok(adductRows.every((row) => row.theoreticalMz !== null));
});

test("does not extract a neutral-loss moiety as the whole-ion formula", () => {
  const row = validateDiagnosticIons([
    ion({
      mz: 247.0823,
      description: "H-antigen B − C₂H₄O₂ ion [M-H]⁻",
      composition: "dHex-Hex B-ion − C₂H₄O₂ [M-H]⁻",
      polarity: "negative",
    }),
  ])[0];
  assert.equal(row.formula, "");
  assert.equal(row.theoreticalMz, null);
  assert.match(row.reason, /No explicit elemental formula is available/);
});

test("flags HexNAc and sialic-acid formulas without nitrogen", () => {
  const rows = validateDiagnosticIons([
    ion({ description: "HexNAc fragment", composition: "C6H12O6 [M+H]⁺" }),
    ion({ description: "Neu5Ac fragment", composition: "C6H12O6 [M+H]⁺" }),
  ]);
  assert.match(rows[0].reason, /HexNAc assignment has an explicit formula with no nitrogen/);
  assert.match(rows[1].reason, /Neu5Ac\/Neu5Gc assignment has an explicit formula with no nitrogen/);
  assert.ok(rows.every((row) => row.status === "REVIEW"));
});

test("flags phosphate and sulfate formulas missing their diagnostic element", () => {
  const rows = validateDiagnosticIons([
    ion({ description: "Phospho-Hex fragment", composition: "C6H12O6 [M-H]⁻", polarity: "negative" }),
    ion({ description: "Sulfated HexNAc fragment", composition: "C8H15NO6 [M-H]⁻", polarity: "negative" }),
  ]);
  assert.match(rows[0].reason, /Phosphate assignment has an explicit formula with no phosphorus/);
  assert.match(rows[1].reason, /Sulfate assignment has an explicit formula with no sulfur/);
});

test("flags polarity conflict and incompatible explicit charge", () => {
  const row = validateDiagnosticIons([
    ion({ composition: "C₂H₃O₂⁻", polarity: "positive" }),
  ])[0];
  assert.ok(row.theoreticalMz);
  assert.match(row.reason, /Polarity conflict/);
});

test("flags formula-derived m/z outside the stored-value tolerance", () => {
  const row = validateDiagnosticIons([
    ion({
      mz: 60,
      description: "Acetate ion",
      composition: "C₂H₃O₂⁻",
      polarity: "negative",
    }),
  ])[0];
  assert.match(row.reason, /Calculated m\/z differs from stored m\/z/);
});

test("flags duplicate m/z values with different assignments for manual review", () => {
  const rows = validateDiagnosticIons([
    ion({ mz: 204.0867, description: "HexNAc oxonium", composition: "same nominal ion" }),
    ion({ mz: 204.0867, description: "A different assignment", composition: "different nominal ion" }),
  ]);
  assert.ok(rows.every((row) => row.status === "REVIEW"));
  assert.ok(rows.every((row) => row.reason.includes("multiple distinct assignments")));
});

test("flags fixed-mass peptide-dependent Y ions without a peptide specification", () => {
  const row = validateDiagnosticIons([
    ion({
      mz: 915.3197,
      description: "Bisecting GlcNAc Y4 + Fuc (peptide-dependent)",
      composition: "Core + bisecting GlcNAc + Fuc",
      ionType: "Y-ion",
    }),
  ])[0];
  assert.match(row.reason, /Peptide-dependent Y-ion has no specified peptide composition/);
});

test("does not flag shared m/z values when the ions have the same formula", () => {
  const rows = validateDiagnosticIons([
    ion({ mz: 350.1446, description: "HexNAc-dHex oxonium", formula: "C14H24NO9", charge: 1 }),
    ion({ mz: 350.1446, description: "Dehydrated core-fucose Y1", formula: "C14H24NO9", charge: 1, ionType: "Y-ion" }),
  ]);
  assert.ok(rows.every((row) => !row.reason.includes("multiple distinct assignments")));
});

test("does not apply the HexNAc nitrogen rule to cross-ring ions", () => {
  const row = validateDiagnosticIons([
    ion({
      mz: 221.0667,
      description: "Cross-ring ion of a HexNAc-containing disaccharide",
      formula: "C8H13O7",
      charge: -1,
      polarity: "negative",
      ionType: "A-ion",
    }),
  ])[0];
  assert.equal(row.status, "PASS");
});

test("current dataset passes validation with no records left for review", () => {
  const rows = validateDiagnosticIons(diagnosticIons as DiagnosticIonRecord[]);
  const summary = summarizeValidation(rows);
  assert.equal(summary.total, diagnosticIons.length);
  const failures = rows.filter((row) => row.status !== "PASS");
  assert.deepEqual(
    failures.map((row) => `${row.currentMz}: ${row.reason}`),
    [],
    "every diagnostic ion must have a formula, charge and matching m/z",
  );
});