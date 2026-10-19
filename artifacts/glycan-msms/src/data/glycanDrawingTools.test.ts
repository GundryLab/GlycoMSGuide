import assert from "node:assert/strict";
import test from "node:test";
import { glycanDrawingTools } from "./glycanDrawingTools";

test("all eight drawing tools have a unique website, citation, and description", () => {
  assert.equal(glycanDrawingTools.length, 8);
  for (const key of ["name", "url"] as const) {
    assert.equal(new Set(glycanDrawingTools.map(tool => tool[key])).size, 8);
  }
  assert.equal(new Set(glycanDrawingTools.map(tool => tool.pub.doi)).size, 8);
  for (const tool of glycanDrawingTools) {
    assert.equal(new URL(tool.url).protocol, "https:");
    assert.match(tool.pub.doi, /^10\.\d{4,9}\/\S+$/);
    assert.match(tool.pub.cite, /\b(?:2008|2016|2017|2018|2020|2021|2023)\b/);
    assert.ok(tool.desc.length > 50);
    assert.deepEqual(tool.biologicalContexts, ["Multi-organism"]);
  }
});

test("GlycoWorkbench remains discoverable as a drawing and fragment-annotation tool", () => {
  const tool = glycanDrawingTools.find(tool => tool.name === "GlycoWorkbench");
  assert.ok(tool);
  assert.equal(tool.url, "https://code.google.com/archive/p/glycoworkbench/downloads");
  assert.equal(tool.pub.doi, "10.1021/pr7008252");
  assert.match(tool.pub.cite, /Ceroni et al\..*2008, 7 \(4\), 1650–1659/);
  assert.ok(tool.relevanceTags.includes("Glycan drawing"));
  assert.ok(tool.displayTags.includes("Fragment annotation"));
  assert.match(tool.desc, /glycan editor/);
});

test("fragment-annotation tools come first and 3D visualization remains distinct", () => {
  assert.deepEqual(glycanDrawingTools.slice(0, 2).map(tool => tool.name), [
    "DrawGlycan-SNFG", "GlycoDraw (glycowork)",
  ]);
  const threeD = glycanDrawingTools.find(tool => tool.name === "3D-SNFG");
  assert.ok(threeD);
  assert.ok(threeD.displayTags.includes("3D visualization"));
  assert.match(threeD.desc, /existing atomic models/);
  assert.equal(threeD.pub.doi, "10.1093/glycob/cww076");
});
