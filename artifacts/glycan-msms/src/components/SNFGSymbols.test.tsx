import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MonosaccharideSymbol, SNFG_COLORS } from "./SNFGSymbols";
import { monosaccharidesAndModifications } from "../data/monosaccharidesData";

function renderSymbol(name: string) {
  return renderToStaticMarkup(
    <svg>
      <MonosaccharideSymbol name={name} x={16} y={16} size={20} showLabel={false} />
    </svg>,
  );
}

test("Rha and Abe use their defined SNFG shapes and colors", () => {
  const rha = renderSymbol("Rha");
  const abe = renderSymbol("Abe");
  assert.match(rha, /<polygon /);
  assert.ok(rha.includes(`fill="${SNFG_COLORS.green}"`));
  assert.match(abe, /<rect /);
  assert.ok(abe.includes(`fill="${SNFG_COLORS.orange}"`));
});

test("every listed SNFG residue has a defined symbol instead of a grey fallback", () => {
  for (const name of [
    "Glc", "GlcA", "Gal", "GalA", "Man", "IdoA", "GlcNAc", "GalNAc",
    "Neu5Ac", "Neu5Gc", "Fuc", "Qui", "Rha", "Xyl", "Kdn", "Fru",
    "Tyv", "Abe", "Col", "Bac", "MurNAc", "Ara", "Pse", "Leg", "Kdo", "LDmanHep",
  ]) {
    assert.doesNotMatch(renderSymbol(name), /fill="#ccc"/, name);
  }
});

function polygonPoints(name: string) {
  const markup = renderSymbol(name);
  const match = markup.match(/<polygon points="([^"]+)"/);
  assert.ok(match, `${name} should render a polygon`);
  return match[1].split(" ").map(point => point.split(",").map(Number));
}

test("Xyl and Ara use five-pointed stars in orange and green", () => {
  for (const [name, color] of [["Xyl", SNFG_COLORS.orange], ["Ara", SNFG_COLORS.green]]) {
    assert.ok(renderSymbol(name).includes(`fill="${color}"`));
    const points = polygonPoints(name);
    assert.equal(points.length, 10, `${name} needs alternating outer and inner vertices`);
    const radii = points.map(([x, y]) => Math.hypot(x - 16, y - 16));
    for (let i = 1; i < radii.length; i += 2) {
      assert.ok(Math.abs(radii[i] / radii[i - 1] - 0.4) < 1e-10);
    }
  }
});

test("Pse and Leg use green and yellow horizontally flattened diamonds", () => {
  for (const [name, color] of [["Pse", SNFG_COLORS.green], ["Leg", SNFG_COLORS.yellow]]) {
    assert.ok(renderSymbol(name).includes(`fill="${color}"`));
    assert.deepEqual(polygonPoints(name), [[6, 16], [16, 10], [26, 16], [16, 22]]);
  }
});

test("Kdo uses a yellow flat hexagon", () => {
  assert.ok(renderSymbol("Kdo").includes(`fill="${SNFG_COLORS.yellow}"`));
  const points = polygonPoints("Kdo");
  assert.equal(points.length, 6);
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  assert.ok(Math.max(...xs) - Math.min(...xs) > Math.max(...ys) - Math.min(...ys));
  assert.equal(points[1][1], points[2][1]);
  assert.equal(points[4][1], points[5][1]);
});

test("all five corrected reference records expose their SNFG symbol on cards", () => {
  for (const name of ["Xyl", "Ara", "Pse", "Leg", "Kdo"]) {
    const record = monosaccharidesAndModifications.find(item => item.shortName === name);
    assert.ok(record, `${name} record must exist`);
    assert.equal(record.snfgSymbol, name);
  }
});

// Official SNFG palette (Neelamegham et al. 2019, Glycobiology 29:620; NCBI SNFG table).
test("SNFG palette matches the official RGB values", () => {
  assert.deepEqual(SNFG_COLORS, {
    white: "#FFFFFF",
    blue: "#0072BC", // 0/114/188
    green: "#00A651", // 0/166/81
    yellow: "#FFD400", // 255/212/0
    lightBlue: "#8FCCE9", // 143/204/233
    pink: "#F69EA1", // 246/158/161
    purple: "#A54399", // 165/67/153
    brown: "#A17A4D", // 161/122/77
    orange: "#F47920", // 244/121/32
    red: "#ED1C24", // 237/28/36
  });
});

// Shape element and fill for each residue drawn on the site, from the NCBI SNFG table.
const officialSnfg: [string, "rect" | "circle" | "polygon", keyof typeof SNFG_COLORS][] = [
  ["Glc", "circle", "blue"], ["Man", "circle", "green"], ["Gal", "circle", "yellow"], ["Hex", "circle", "white"],
  ["GlcNAc", "rect", "blue"], ["GalNAc", "rect", "yellow"], ["HexNAc", "rect", "white"],
  ["GlcA", "polygon", "blue"], ["GalA", "polygon", "yellow"], ["IdoA", "polygon", "brown"],
  ["Fuc", "polygon", "red"], ["Qui", "polygon", "blue"], ["Rha", "polygon", "green"],
  ["Tyv", "rect", "green"], ["Abe", "rect", "orange"], ["Col", "rect", "lightBlue"],
  ["Xyl", "polygon", "orange"], ["Ara", "polygon", "green"],
  ["Kdn", "polygon", "green"], ["Neu5Ac", "polygon", "purple"], ["Neu5Gc", "polygon", "lightBlue"],
  ["Pse", "polygon", "green"], ["Leg", "polygon", "yellow"],
  ["Bac", "polygon", "blue"], ["LDmanHep", "polygon", "green"], ["Kdo", "polygon", "yellow"], ["MurNAc", "polygon", "purple"],
  ["Fru", "polygon", "green"],
];

test("each drawn residue uses the official SNFG shape element and colour", () => {
  for (const [name, element, color] of officialSnfg) {
    const markup = renderSymbol(name);
    assert.ok(markup.includes(`<${element} `), `${name} should be drawn with <${element}>`);
    assert.ok(markup.includes(`fill="${SNFG_COLORS[color]}"`), `${name} should be ${color}`);
  }
});

test("GlcA/GalA colour the top half and IdoA the bottom half of the divided diamond", () => {
  for (const [name, top] of [["GlcA", true], ["GalA", true], ["IdoA", false]] as const) {
    const filled = renderSymbol(name).match(/<polygon points="([^"]+)" fill="(?!#FFFFFF)[^"]+" stroke="none"/);
    assert.ok(filled, `${name} needs a coloured half`);
    const ys = filled[1].split(" ").map(p => Number(p.split(",")[1]));
    assert.ok(top ? Math.min(...ys) < 16 : Math.max(...ys) > 16, name);
  }
});

test("every monosaccharide record with an SNFG symbol renders that symbol", () => {
  for (const record of monosaccharidesAndModifications) {
    if (record.recordType !== "monosaccharide" || !record.snfgSymbol) continue;
    assert.doesNotMatch(renderSymbol(record.snfgSymbol), /fill="#ccc"/, record.snfgSymbol);
  }
});
