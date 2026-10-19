import assert from "node:assert/strict";
import test from "node:test";
import { parse } from "csv-parse/sync";
import { monosaccharidesAndModifications } from "./monosaccharidesData";
import {
  buildMonosaccharideCsv,
  buildMonosaccharideJson,
  monosaccharideExportCsvHeaders,
} from "./monosaccharideExports";

const recordWithRelatedIons = monosaccharidesAndModifications.find(
  (record) =>
    record.relatedDiagnosticIons?.length &&
    record.primaryReferences?.length &&
    record.sourceResources.length,
);

assert.ok(recordWithRelatedIons, "fixture dataset must include a fully linked record");

function parseCsv(csv: string): string[][] {
  return parse(csv, {
    bom: true,
    relax_column_count: false,
  });
}

test("JSON export preserves publication metadata and record contracts", () => {
  const output = buildMonosaccharideJson(monosaccharidesAndModifications);

  assert.equal("version" in output, false);
  assert.equal(output.entryCount, monosaccharidesAndModifications.length);
  assert.match(output.fieldDefinitions.massShift.definition, /after covalent attachment/);
  assert.match(output.fieldDefinitions.massShift.definition, /leaving group/);
  assert.match(output.fieldDefinitions.massShift.formulaDefinition, /not the molecular formula or mass of the free reagent/);
  assert.ok(output.sources.some((source) => source.resource === "GlyCosmos"));
  assert.ok(output.licenseNotes.includes("Source attribution"));

  const exportedRecord = output.records.find(
    (record) => record.id === recordWithRelatedIons.id,
  );
  assert.deepEqual(exportedRecord?.sourceResources, recordWithRelatedIons.sourceResources);
  assert.deepEqual(exportedRecord?.primaryReferences, recordWithRelatedIons.primaryReferences);
  assert.deepEqual(
    exportedRecord?.relatedDiagnosticIons,
    recordWithRelatedIons.relatedDiagnosticIons,
  );
});

test("CSV export includes update date, provenance, references, and related ions", () => {
  const csv = buildMonosaccharideCsv([recordWithRelatedIons]);
  const rows = parseCsv(csv);

  assert.equal(rows.length, 2);
  assert.deepEqual(rows[0], [...monosaccharideExportCsvHeaders]);
  assert.equal(rows[1].length, monosaccharideExportCsvHeaders.length);
  assert.ok(rows[1][12].includes(recordWithRelatedIons.sourceResources[0].resource));
  assert.ok(rows[1][12].includes(recordWithRelatedIons.sourceResources[0].accessed));
  assert.ok(rows[1][11].includes(recordWithRelatedIons.primaryReferences![0]));
  assert.ok(rows[1][13].includes(recordWithRelatedIons.relatedDiagnosticIons![0].mz.toFixed(4)));
  assert.ok(rows[1][13].includes(recordWithRelatedIons.relatedDiagnosticIons![0].specificity));
});

test("generic Hex ion links are composition-supporting", () => {
  for (const recordId of ["glc", "man", "gal"]) {
    const record = monosaccharidesAndModifications.find((item) => item.id === recordId);
    const hexIon = record?.relatedDiagnosticIons?.find((ion) => ion.mz === 163.0601);
    assert.equal(hexIon?.specificity, "composition-supporting");
  }

  // dHex oxonium (m/z 147.0652) is pending primary evidence and is not linked from monosaccharide records.
});

test("reviewed sulfation and phosphorylation evidence remains source-qualified", () => {
  const sulfation = monosaccharidesAndModifications.find((item) => item.id === "sulfation");
  const phosphorylation = monosaccharidesAndModifications.find((item) => item.id === "phosphorylation");

  assert.equal(
    sulfation?.relatedDiagnosticIons?.find((ion) => ion.mz === 241.0024)?.specificity,
    "residue-specific",
  );
  assert.equal(
    sulfation?.relatedDiagnosticIons?.find((ion) => ion.mz === 282.0289)?.specificity,
    "residue-specific",
  );
  assert.ok(
    sulfation?.primaryReferences?.every(
      (reference) => !reference.includes("10.1093/glycob/cws112"),
    ),
  );
  assert.ok(
    phosphorylation?.primaryReferences?.some((reference) =>
      reference.toLowerCase().includes("10.1074/mcp.ra118.000967"),
    ),
  );
  assert.match(phosphorylation?.msConsiderations ?? "", /positive-mode HCD/);
  assert.match(phosphorylation?.msConsiderations ?? "", /not markers of general protein-backbone phosphorylation/);
});

test("CSV values with commas, quotes, and line breaks round-trip unchanged", () => {
  const punctuationFixture = {
    ...recordWithRelatedIons,
    name: 'N-acetyl, "reviewed"\nmonosaccharide',
    primaryReferences: [
      'Doe, J. "Quoted title"\nJournal of Glycomics 12, 34–56',
    ],
    sourceResources: [
      {
        resource: 'Curated, "Primary"\nDatabase',
        url: "https://example.test/source?fields=name,reference",
        accessed: "2026-09-13",
      },
    ],
  };

  const rows = parseCsv(buildMonosaccharideCsv([punctuationFixture]));

  assert.equal(rows.length, 2);
  assert.ok(rows.every((row) => row.length === monosaccharideExportCsvHeaders.length));
  assert.equal(rows[1][2], punctuationFixture.name);
  assert.equal(rows[1][11], punctuationFixture.primaryReferences[0]);
  assert.equal(
    rows[1][12],
    `${punctuationFixture.sourceResources[0].resource} | ${punctuationFixture.sourceResources[0].url} | ${punctuationFixture.sourceResources[0].accessed}`,
  );
});

test("both builders export only the records supplied by the visible filter", () => {
  const visibleRecords = monosaccharidesAndModifications.filter(
    (record) => record.glycoMSGuideStatus === "Core mammalian",
  );

  const json = buildMonosaccharideJson(visibleRecords);
  const csv = buildMonosaccharideCsv(visibleRecords);
  const rows = parseCsv(csv);

  assert.equal(json.entryCount, visibleRecords.length);
  assert.deepEqual(
    json.records.map((record) => record.id),
    visibleRecords.map((record) => record.id),
  );
  assert.equal(rows.length - 1, visibleRecords.length);
  assert.ok(rows.every((row) => row.length === monosaccharideExportCsvHeaders.length));
  assert.ok(
    visibleRecords.every((record) => csv.includes(record.id)),
    "every visible record should be exported",
  );
  assert.ok(
    monosaccharidesAndModifications
      .filter((record) => !visibleRecords.includes(record))
      .every((record) => !json.records.includes(record)),
    "filtered-out records should not be exported",
  );
});