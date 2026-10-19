import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  generateCandidates,
  parseSourceExport,
  type SourceFormat,
} from "./generateMonosaccharideSourceCandidates";

const fixtures = fileURLToPath(new URL("./fixtures/monosaccharide-sources/", import.meta.url));
const extension = (format: SourceFormat) => format === "glycosmos" ? "csv" : "json";
const fixture = (name: string) => readFile(`${fixtures}${name}`, "utf8");

for (const format of ["glycosmos", "glygen"] as SourceFormat[]) {
  test(`${format} source export produces changed, new, and unchanged results`, async () => {
    const records = parseSourceExport(await fixture(`${format}.${extension(format)}`), format);
    const candidates = generateCandidates(records);
    assert.equal(records.length, 3);
    assert.deepEqual(candidates.map(({ id, status }) => ({ id, status })), [
      { id: "neu5ac", status: "candidate-change" },
      { id: `${format}:G00000ZZ`, status: "candidate-new-record" },
    ]);
    assert.deepEqual(candidates[0].differences, {
      pubChemCid: { curated: "439197", source: "999999" },
    });
  });

  test(`${format} malformed source export fails explicitly`, async () => {
    const malformed = await fixture(`${format}-malformed.${extension(format)}`);
    assert.throws(
      () => parseSourceExport(malformed, format),
      /Unsupported GlyCosmos CSV header|unsupported field\(s\)/,
    );
  });

  test(`${format} conflicting stable identifiers fail as ambiguous`, async () => {
    const ambiguous = await fixture(`${format}-ambiguous.${extension(format)}`);
    assert.throws(
      () => parseSourceExport(ambiguous, format),
      /maps ambiguously/,
    );
  });
}

test("GlyGen rejects multi-residue glycan records", async () => {
  const multiResidue = await fixture("glygen-multi-residue.json");
  assert.throws(
    () => parseSourceExport(multiResidue, "glygen"),
    /is not a single-residue glycan/,
  );
});

test("GlyCosmos accepts uncertain WURCS link counts and skips the multi-residue row", async () => {
  const uncertainLinks = await fixture("glycosmos-uncertain-links.csv");
  assert.deepEqual(parseSourceExport(uncertainLinks, "glycosmos"), []);
});