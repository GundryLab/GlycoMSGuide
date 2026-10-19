import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import {
  diagnosticIons,
  categories,
  references,
  getGlytoucanIdsForIon,
  getGlytoucanContext,
  withdrawnDiagnosticIons,
} from "../src/data/glycanData";
import {
  applicationGuides,
  applicationCategories,
} from "../src/data/applicationGuides";
import {
  challengingCompositions,
  challengeCategories,
} from "../src/data/challengingCompositions";
import {
  glycomicsTools,
  glycoproteomicsTools,
  type SoftwareTool,
} from "@workspace/glyco-tools";

const lines: string[] = [];
const w = (s = "") => lines.push(s);

const today = new Date().toISOString().slice(0, 10);

w("# GlycoMSGuide — Full Content Export");
w();
w("> A Practical Guide to Glycan MS/MS Interpretation — https://glycomsguide.net");
w(">");
w("> This document consolidates the diagnostic-ion, application-guide, challenging-composition,");
w("> software and reference content (the Monosaccharides & Modifications dataset is exported separately) for");
w("> accuracy review. It is generated directly from the site's data files, so it");
w("> always matches what is published. Please verify m/z values, chemical");
w("> formulas, citations (DOI/PMID/PMCID), and interpretive claims.");
w(">");
w(`> Generated: ${today}`);
w();
w("## Contents");
w();
w(`1. Diagnostic Ions (${diagnosticIons.length})`);
w(`2. Application Guides (${applicationGuides.length})`);
w(`3. Challenging Compositions (${challengingCompositions.length})`);
w(`4. MS Software — Glycomics (${glycomicsTools.length}) and Glycoproteomics (${glycoproteomicsTools.length})`);
w(`5. References (${references.length})`);
w();
w("---");
w();

// ============ 1. DIAGNOSTIC IONS ============
w("## 1. Diagnostic Ions");
w();
w(`Total: ${diagnosticIons.length} ions. m/z values are monoisotopic, reported to 4 decimal places.`);
w();

const refById = new Map(references.map((r) => [r.id, r]));

function evidenceReference(sourceKey: string): string {
  const ref = refById.get(sourceKey);
  return ref ? `${ref.authors} (${ref.year})` : sourceKey;
}

for (const cat of categories) {
  if (cat.id === "all") continue;
  const ions = diagnosticIons.filter((i) => i.category === cat.id);
  if (ions.length === 0) continue;
  w(`### ${cat.label} (${ions.length})`);
  w();
  for (const ion of ions) {
    const polarity = ion.polarity === "positive" ? "[+] positive" : "[−] negative";
    w(`#### m/z ${ion.mz.toFixed(4)} — ${ion.description}`);
    w();
    w(`- **Composition:** ${ion.composition}`);
    w(`- **Formula:** ${ion.formula}`);
    w(`- **Charge:** ${ion.charge > 0 ? `+${ion.charge}` : ion.charge}`);
    w(`- **Verification:** ${ion.verification === "source" ? "Source-verified" : "Calculated composition"}`);
    w(`- **Polarity:** ${polarity}`);
    if (ion.ionType) w(`- **Ion type:** ${ion.ionType}`);
    if (ion.subCategory) w(`- **Sub-category:** ${ion.subCategory}`);
    if (ion.monosaccharides?.length) w(`- **Monosaccharides:** ${ion.monosaccharides.join(", ")}`);
    if (ion.notes) w(`- **Notes:** ${ion.notes}`);
    const gtc = getGlytoucanIdsForIon(ion);
    if (gtc.length) {
      const ctx = getGlytoucanContext(ion);
      w(`- **GlyTouCan (${ctx}):** ${gtc.map((g) => `${g.name} = ${g.id}`).join("; ")}`);
    }
    const src = refById.get(ion.source);
    w(`- **Source:** ${src ? `${src.authors} (${src.year})` : ion.source}`);
    w(`- **Evidence records:**`);
    if (ion.evidence.length === 0) {
      w(`  - None (calculated composition; no primary source located).`);
    } else {
      for (const evidence of ion.evidence) {
        const evidenceType = evidence.evidenceType === "compilation" ? "compilation" : "primary observation";
        w(`  - ${evidenceReference(evidence.sourceKey)} [${evidenceType}] — ${evidence.locator}; reported m/z ${evidence.reportedMz}; "${evidence.reportedAssignment}"; ${evidence.context}`);
        if (evidence.evidenceType === "compilation" && evidence.primaryReferences?.length) {
          w(`    - Primary references: ${evidence.primaryReferences.join("; ")}`);
        }
      }
    }
    w(`- **Evidence note:** ${ion.evidenceNote ?? "Not applicable to source-verified ions."}`);
    w();
  }
}
const withdrawnCount = withdrawnDiagnosticIons.length;
w(`### Withdrawn ions (${withdrawnCount}; not active diagnostic ions)`);
w();
w("These entries were withdrawn from the active diagnostic-ion table and are retained here separately for review.");
w();
for (const ion of withdrawnDiagnosticIons) {
  w(`- **m/z ${ion.mz.toFixed(4)} (${ion.polarity}) — ${ion.description}**`);
  w(`  - Original source: ${ion.originalSource}`);
  w(`  - Withdrawal reason: ${ion.reason}`);
}
w();
w("---");
w();

// ============ 2. APPLICATION GUIDES ============
w("## 2. Application Guides");
w();
w(`Total: ${applicationGuides.length} task-oriented guides.`);
w();

for (const cat of applicationCategories) {
  if (cat.id === "all") continue;
  const guides = applicationGuides.filter((g) => g.appCategory === cat.id);
  if (guides.length === 0) continue;
  w(`### ${cat.label} (${guides.length})`);
  w();
  for (const g of guides) {
    const pol =
      g.polarity === "positive" ? "[+] positive" : g.polarity === "negative" ? "[−] negative" : "[±] both";
    w(`#### ${g.title}`);
    w();
    w(`- **Polarity:** ${pol}`);
    w(`- **Description:** ${g.description}`);
    if (g.workflow) w(`- **Workflow:** ${g.workflow}`);
    w(`- **Diagnostic ions:**`);
    for (const ion of g.ions) {
      w(`  - m/z ${ion.mz.toFixed(4)} — ${ion.role}`);
    }
    if (g.tips?.length) {
      w(`- **Tips:**`);
      for (const t of g.tips) w(`  - ${t}`);
    }
    w();
  }
}
w("---");
w();

// ============ 3. CHALLENGING COMPOSITIONS ============
w("## 3. Challenging Compositions");
w();
w(`Total: ${challengingCompositions.length} entries.`);
w();

for (const cat of challengeCategories) {
  if (cat.id === "all") continue;
  const items = challengingCompositions.filter((c) => c.category === cat.id);
  if (items.length === 0) continue;
  w(`### ${cat.label} (${items.length})`);
  w();
  for (const c of items) {
    w(`#### ${c.title}`);
    w();
    w(`- **Severity:** ${c.severity}`);
    w(`- **Description:** ${c.description}`);
    if (c.massPair) {
      const m = c.massPair;
      w(`- **Mass comparison:** ${m.label1} = ${m.mass1} vs ${m.label2} = ${m.mass2} (Δ ${m.delta})`);
    }
    w(`- **Diagnostic strategy:** ${c.diagnosticStrategy}`);
    if (c.examples?.length) {
      w(`- **Examples:**`);
      for (const e of c.examples) w(`  - ${e}`);
    }
    if (c.relevantIons?.length) {
      w(`- **Relevant ions:** ${c.relevantIons.map((i) => `m/z ${i.mz.toFixed(4)} (${i.label})`).join("; ")}`);
    }
    if (c.monosaccharides?.length) w(`- **Monosaccharides:** ${c.monosaccharides.join(", ")}`);
    w();
  }
}
w("---");
w();

// ============ 4. SOFTWARE TOOLS ============
w("## 4. MS Data Analysis Software");
w();

const writeTool = (t: SoftwareTool) => {
  w(`#### ${t.name} (${t.year})`);
  w();
  w(`- **Platform:** ${t.platform}`);
  w(`- **MS data:** ${t.msData}`);
  w(`- **Scope:** ${t.scope}`);
  w(`- **Glycan type:** ${t.glycanType}`);
  w(`- **Search space:** ${t.searchSpace}`);
  w(`- **Usage:** ${t.usage}`);
  w(`- **Availability:** ${t.availability}`);
  if (t.language) w(`- **Language:** ${t.language}`);
  if (t.license) w(`- **License:** ${t.license}`);
  if (t.searchStrategy) w(`- **Search strategy:** ${t.searchStrategy}`);
  if (t.localization) w(`- **Site localization:** ${t.localization}`);
  if (t.fdrControl) w(`- **FDR control:** ${t.fdrControl}`);
  w(`- **Description:** ${t.description}`);
  if (t.pmid) w(`- **PMID:** ${t.pmid} (https://pubmed.ncbi.nlm.nih.gov/${t.pmid}/)`);
  if (t.url) w(`- **Website:** ${t.url}`);
  w();
};

w(`### Glycomics Data Tools (${glycomicsTools.length})`);
w();
for (const t of glycomicsTools) writeTool(t);

w(`### Glycoproteomics Data Tools (${glycoproteomicsTools.length})`);
w();
for (const t of glycoproteomicsTools) writeTool(t);

w("---");
w();

// ============ 5. REFERENCES ============
w("## 5. References");
w();
for (const r of references) {
  const bits: string[] = [];
  bits.push(`**${r.authors}**`);
  bits.push(`${r.title}.`);
  const cite = [r.journal, r.year, r.volume, r.pages].filter(Boolean).join(" ");
  if (cite) bits.push(`*${cite}*.`);
  w(`- ${bits.join(" ")}`);
  const links: string[] = [];
  if (r.doi) links.push(`DOI: ${r.doi}`);
  if ((r as { pmid?: string }).pmid) links.push(`PMID: ${(r as { pmid?: string }).pmid}`);
  if ((r as { pmcid?: string }).pmcid) links.push(`PMCID: ${(r as { pmcid?: string }).pmcid}`);
  if (r.url) links.push(r.url);
  if (links.length) w(`  - ${links.join(" · ")}`);
  if ("ionListUrl" in r && r.ionListUrl) {
    w(`  - Versioned default ion list (curated support, not proof of measurement): ${r.ionListUrl}`);
  }
}
w();

const outPath = resolve(process.cwd(), "exports", "GlycoMSGuide-content.md");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, lines.join("\n"), "utf8");
console.log(`Wrote ${outPath}`);
console.log(
  `Ions: ${diagnosticIons.length}, Applications: ${applicationGuides.length}, Challenges: ${challengingCompositions.length}, Glycomics: ${glycomicsTools.length}, Glycoproteomics: ${glycoproteomicsTools.length}, References: ${references.length}`,
);
