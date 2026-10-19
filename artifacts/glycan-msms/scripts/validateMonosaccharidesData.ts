import { diagnosticIons } from "../src/data/glycanData";
import { monosaccharidesAndModifications } from "../src/data/monosaccharidesData";
import { verifiedReferenceByDoi } from "../src/data/verifiedReferenceMetadata";

const errors: string[] = [];
const canonicalMz = new Set(diagnosticIons.map((ion) => ion.mz.toFixed(4)));
const ids = new Set<string>();
const atomicMonoisotopicMass: Record<string, number> = {
  C: 12,
  H: 1.00782503223,
  N: 14.00307400443,
  O: 15.99491461957,
  P: 30.97376199842,
  S: 31.9720711744,
};

function calculateFormulaMass(formula: string): number {
  let index = 0;
  let sign = 1;
  let total = 0;

  while (index < formula.length) {
    if (formula[index] === "+") {
      sign = 1;
      index += 1;
      continue;
    }
    if (formula[index] === "-") {
      sign = -1;
      index += 1;
      continue;
    }

    const token = formula.slice(index).match(/^([A-Z][a-z]?)(\d*)/);
    if (!token) throw new Error(`Unsupported formula syntax: ${formula}`);
    const [, element, countText] = token;
    const elementMass = atomicMonoisotopicMass[element];
    if (elementMass === undefined) throw new Error(`Unsupported element ${element} in ${formula}`);
    total += sign * elementMass * (countText ? Number(countText) : 1);
    index += token[0].length;
  }

  return total;
}

if (monosaccharidesAndModifications.length < 40 || monosaccharidesAndModifications.length > 60) {
  errors.push(`Expected 40–60 records; found ${monosaccharidesAndModifications.length}.`);
}

for (const record of monosaccharidesAndModifications) {
  if (ids.has(record.id)) errors.push(`${record.id}: duplicate record ID.`);
  ids.add(record.id);

  if (record.sourceResources.length === 0) {
    errors.push(`${record.id}: missing source provenance.`);
  }
  if (!record.primaryReferences?.length) {
    errors.push(`${record.id}: missing primary reference.`);
  }
  for (const reference of record.primaryReferences ?? []) {
    const doi = reference.match(/DOI:\s*(10\.\d{4,9}\/\S+?)\.?$/)?.[1].replace(/\.$/, "").toLowerCase();
    if (!doi) {
      errors.push(`${record.id}: primary reference lacks a verified DOI.`);
      continue;
    }
    const verified = verifiedReferenceByDoi.get(doi);
    if (!verified) {
      errors.push(`${record.id}: DOI ${doi} is absent from the verified metadata manifest.`);
      continue;
    }
    if (!reference.toLowerCase().includes(verified.title.toLowerCase())) {
      errors.push(`${record.id}: citation title does not match verified DOI ${doi}.`);
    }
  }
  if (record.lastUpdated.length !== 10) {
    errors.push(`${record.id}: invalid lastUpdated date.`);
  }
  if (/\s/.test(record.formula)) {
    errors.push(`${record.id}: formula contains whitespace.`);
  }

  try {
    const calculatedMass = calculateFormulaMass(record.formula);
    const publishedMass = record.recordType === "monosaccharide"
      ? record.monoisotopicMass
      : record.massShift;
    if (publishedMass === undefined) {
      errors.push(`${record.id}: missing published mass for formula ${record.formula}.`);
    } else if (Math.abs(calculatedMass - publishedMass) > 0.0001) {
      errors.push(
        `${record.id}: formula ${record.formula} calculates to ${calculatedMass.toFixed(5)} Da, ` +
        `not ${publishedMass.toFixed(5)} Da.`,
      );
    }
  } catch (error) {
    errors.push(`${record.id}: ${(error as Error).message}.`);
  }

  for (const relatedIon of record.relatedDiagnosticIons ?? []) {
    const { mz, specificity } = relatedIon;
    const searchTarget = mz.toFixed(4);
    if (!canonicalMz.has(searchTarget)) {
      errors.push(`${record.id}: related diagnostic ion ${mz.toFixed(4)} is not canonical.`);
    }
    const searchMatches = diagnosticIons.filter((ion) => ion.mz.toFixed(4).includes(searchTarget));
    if (searchMatches.length === 0) {
      errors.push(`${record.id}: related-ion search ${searchTarget} returns no records.`);
    }
    if (!specificity) {
      errors.push(`${record.id}: related ion ${searchTarget} lacks a specificity classification.`);
    }
  }
}

if (errors.length) {
  console.error(`Monosaccharide dataset validation failed (${errors.length} issues):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `Validated ${monosaccharidesAndModifications.length} candidate records; ` +
  "formula masses, DOI metadata, and diagnostic-ion links are consistent.",
);