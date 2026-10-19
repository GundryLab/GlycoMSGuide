import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  monosaccharideDatasetFieldDefinitions,
  monosaccharideDatasetLastUpdated,
  monosaccharidesAndModifications,
} from "../src/data/monosaccharidesData";

const outputDirectory = resolve(process.cwd(), "../../exports");
const jsonPath = resolve(
  outputDirectory,
  "glycomsguide-monosaccharides-modifications-review.json",
);
const markdownPath = resolve(
  outputDirectory,
  "glycomsguide-monosaccharides-modifications-review.md",
);

const reviewInstructions =
  "Review every record for scientific and bibliographic accuracy. Do not infer a correction without a reliable source. For each issue, report the record ID, field name, current value, proposed value, rationale, source URL or DOI, confidence level, and whether human expert review is required. Distinguish factual errors from wording improvements and missing context. Check formulas and masses independently. Check that identifiers resolve to the named compound. Flag claims that are too broad, organism-specific statements that need qualification, unsupported MS behavior, and references that do not support the associated claim. Each relatedDiagnosticIons object contains an m/z value and a specificity classification. Verify that each classification accurately describes what the linked ion can support.";

const requestedResponse = {
  recordId: "string",
  field: "string",
  issueType: "identifier | formula | mass | nomenclature | biological-context | MS-interpretation | reference | wording | other",
  currentValue: "any",
  proposedValue: "any",
  rationale: "string",
  evidence: ["DOI or authoritative URL"],
  confidence: "high | medium | low",
  requiresHumanExpertReview: "boolean",
};

const reviewPackage = {
  datasetName: "GlycoMSGuide Monosaccharides & Modifications",
  datasetLastUpdated: monosaccharideDatasetLastUpdated,
  exportedForReviewOn: "2026-09-13",
  recordCount: monosaccharidesAndModifications.length,
  exportPurpose: "External AI-assisted accuracy review",
  fieldDefinitions: monosaccharideDatasetFieldDefinitions,
  reviewInstructions,
  requestedResponseFormat: [requestedResponse],
  records: monosaccharidesAndModifications,
};

const markdownRecords = monosaccharidesAndModifications
  .map(
    (record, index) =>
      `### ${index + 1}. ${record.name} (${record.shortName})\n\n` +
      "```json\n" +
      `${JSON.stringify(record, null, 2)}\n` +
      "```",
  )
  .join("\n\n");

const markdown = `# GlycoMSGuide Monosaccharides & Modifications: Accuracy Review Package

- Dataset last updated: ${monosaccharideDatasetLastUpdated}
- Exported for review: 2026-09-13
- Records: ${monosaccharidesAndModifications.length}
- Purpose: External AI-assisted accuracy review

## Instructions for the reviewer

${reviewInstructions}

### Requested response format

Return a JSON array with objects using these fields: \`recordId\`, \`field\`, \`issueType\`, \`currentValue\`, \`proposedValue\`, \`rationale\`, \`evidence\`, \`confidence\`, and \`requiresHumanExpertReview\`. Use an empty array if no corrections are found.

Example schema:

\`\`\`json
${JSON.stringify([requestedResponse], null, 2)}
\`\`\`

## Important interpretation note

The \`relatedDiagnosticIons\` field contains objects with an \`mz\` value and a \`specificity\` classification. A listed ion is not necessarily specific to the named monosaccharide. Verify each classification using these meanings:

- \`residue-specific\`: supports the named residue with substantially greater specificity than a generic composition ion
- \`composition-supporting\`: supports a residue composition or mass class but does not distinguish structural or stereochemical isomers
- \`motif-associated\`: supports a larger glycan motif or multi-residue feature associated with the record
- \`context-dependent\`: supports the assignment only when additional analytical or biological context is considered

## Modification mass convention

The \`massShift\` field is the net elemental and monoisotopic mass change after covalent attachment to the glycan or residue, including the loss of any leaving group. For modification records, \`formula\` is the signed net elemental composition corresponding to \`massShift\`. Neither field describes the free reagent.

## Records

${markdownRecords}
`;

await mkdir(outputDirectory, { recursive: true });
await Promise.all([
  writeFile(jsonPath, `${JSON.stringify(reviewPackage, null, 2)}\n`, "utf8"),
  writeFile(markdownPath, markdown, "utf8"),
]);

console.log(`Exported ${monosaccharidesAndModifications.length} records.`);
console.log(jsonPath);
console.log(markdownPath);