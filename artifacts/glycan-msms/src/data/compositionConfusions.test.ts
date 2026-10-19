import assert from "node:assert/strict";
import test from "node:test";
import {
  compositionConfusions,
  confusionCompositions,
  filterCompositionConfusions,
  formatIsotopeOffset,
} from "./compositionConfusions";

test("retains all 70 source compositions and their distinct GlyTouCan IDs", () => {
  assert.equal(confusionCompositions.length, 70);
  assert.equal(new Set(confusionCompositions.map((entry) => entry.composition)).size, 70);
  assert.equal(new Set(confusionCompositions.map((entry) => entry.glytoucanId)).size, 70);
  for (const { composition, glytoucanId } of confusionCompositions) {
    assert.match(composition, /^H\d+N\d+F\d+S\d+$/);
    assert.match(glytoucanId, /^G\d{5}[A-Z]{2}$/);
    const counts = [...composition.matchAll(/[HNFS](\d+)/g)].map((match) => Number(match[1]));
    const [hex, hexnac, dhex, neu5ac] = counts;
    assert.ok(hex <= 12 && hexnac >= 1 && hexnac <= 7 && dhex <= 2 && neu5ac <= 4);
    assert.ok(counts.reduce((sum, count) => sum + count, 0) <= 25);
  }
});

test("retains 39 unique non-self pairs and the workbook offset distribution", () => {
  assert.equal(compositionConfusions.length, 39);
  const seen = new Set<string>();
  for (const { row, column, offset } of compositionConfusions) {
    assert.ok(row >= 0 && row < column && column < confusionCompositions.length);
    const key = `${row}:${column}`;
    assert.ok(!seen.has(key));
    seen.add(key);
    assert.ok([-2, -1, 0, 1, 2].includes(offset));
  }
  assert.equal(filterCompositionConfusions("", "0").length, 1);
  assert.equal(filterCompositionConfusions("", "1").length, 26);
  assert.equal(filterCompositionConfusions("", "2").length, 12);
  assert.equal(new Set(compositionConfusions.flatMap(({ row, column }) => [row, column])).size, 70);
});

test("preserves source orientation for the Neu5Ac versus two dHex pair", () => {
  const [pair] = filterCompositionConfusions("H4N3F0S1", "all");
  assert.equal(confusionCompositions[pair.row].glytoucanId, "G12456LJ");
  assert.equal(confusionCompositions[pair.column].composition, "H4N3F2S0");
  assert.equal(pair.offset, -1);
  assert.equal(formatIsotopeOffset(pair.offset), "−1");
  assert.equal(formatIsotopeOffset(-pair.offset), "+1");
});

test("retains the distinct zero-offset pair without adding diagonal comparisons", () => {
  const [pair] = filterCompositionConfusions("", "0");
  assert.equal(confusionCompositions[pair.row].composition, "H12N2F0S0");
  assert.equal(confusionCompositions[pair.column].composition, "H5N4F1S2");
  assert.equal(formatIsotopeOffset(pair.offset), "0");
  assert.equal(formatIsotopeOffset(-pair.offset), "0");
});

test("search matches either composition or ID, case-insensitively and ignoring spaces", () => {
  const byFirst = filterCompositionConfusions(" h4 n3 f0 s1 ", "all");
  const bySecond = filterCompositionConfusions("g92597ck", "all");
  assert.deepEqual(byFirst, bySecond);
  assert.equal(byFirst.length, 1);
  assert.equal(filterCompositionConfusions("G59324HL", "all").length, 2);
});

test("combines search and isotope filters and returns no unrelated results", () => {
  assert.equal(filterCompositionConfusions("G59324HL", "2").length, 1);
  assert.equal(filterCompositionConfusions("G59324HL", "1").length, 0);
  assert.equal(filterCompositionConfusions("not-a-composition", "all").length, 0);
});
