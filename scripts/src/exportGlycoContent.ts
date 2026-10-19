import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  diagnosticIons,
  references,
  categories,
  getGlytoucanIdsForIon,
  withdrawnDiagnosticIons,
} from "../../artifacts/glycan-msms/src/data/glycanData.ts";
import { applicationGuides, applicationCategories } from "../../artifacts/glycan-msms/src/data/applicationGuides.ts";
import { challengingCompositions, challengeCategories } from "../../artifacts/glycan-msms/src/data/challengingCompositions.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "../..");
const pagesDir = resolve(repoRoot, "artifacts/glycan-msms/src/pages");
const referenceById = new Map(references.map((reference) => [reference.id, reference]));

function markdownCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function evidenceReference(sourceKey: string): string {
  const reference = referenceById.get(sourceKey);
  return reference ? `${reference.authors} (${reference.year})` : sourceKey;
}

const TAILWIND_PREFIXES = /^(?:hover:|focus:|active:|disabled:|sm:|md:|lg:|xl:|2xl:|dark:|group-|peer-|first:|last:|odd:|even:|placeholder:|file:|marker:|selection:|aria-|data-)?(?:bg|text|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|w|h|min|max|rounded|border|borders?|outline|ring|shadow|opacity|flex|grid|inline|block|hidden|visible|table|absolute|relative|fixed|sticky|static|inset|top|bottom|left|right|z|order|col|row|gap|space|justify|items|content|self|place|font|leading|tracking|whitespace|break|truncate|underline|italic|antialiased|capitalize|uppercase|lowercase|normal|tabular|list|cursor|pointer|select|object|overflow|scroll|sr|not|aspect|appearance|caret|accent|fill|stroke|backdrop|saturate|brightness|contrast|hue|invert|sepia|grayscale|blur|drop|filter|transition|transform|translate|scale|rotate|skew|origin|duration|delay|ease|animate|divide|stroke|fill|h-screen|w-screen|h-full|w-full|container|prose)\b/;

function looksLikeClassNames(s: string): boolean {
  const trimmed = s.trim();
  if (!trimmed) return true;
  const words = trimmed.split(/\s+/);
  if (words.length === 0) return false;
  let twHits = 0;
  for (const w of words) {
    if (TAILWIND_PREFIXES.test(w)) twHits++;
  }
  // If majority of "words" look like Tailwind class atoms, treat as classes
  return twHits / words.length >= 0.5 && twHits >= 1 && words.every(w => !/[A-Z]/.test(w) || /^[a-z]+:/.test(w));
}

function looksLikeIdentifier(s: string): boolean {
  return /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s.trim());
}

function looksLikeCssValue(s: string): boolean {
  const t = s.trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(t) || /^rgb/.test(t) || /^\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw|deg)$/.test(t) || /^[\d.]+$/.test(t);
}

function looksLikeHtmlTagOrAttr(s: string): boolean {
  const t = s.trim();
  return /^(?:none|currentColor|round|true|false|button|submit|text|url|http[s]?|target|noreferrer|noopener|_blank|_self|nofollow|stylesheet|UTF-8|utf-8|en|application\/[a-z]+|image\/[a-z]+|0 0 \d+ \d+|\d+(?:\.\d+)?\s+\d+(?:\.\d+)?(?:\s+\d+(?:\.\d+)?)*)$/.test(t);
}

function looksLikeImportPath(s: string): boolean {
  const t = s.trim();
  return /^(?:@\/|\.\.?\/|@?[a-z0-9-]+\/[a-z0-9/_.-]+|wouter|react|react-dom|node:)/.test(t);
}

function looksLikeSvgPath(s: string): boolean {
  const t = s.trim();
  // SVG path data: starts with M/m/L/H/V/C/Z and has lots of numbers
  if (/^[MmLlHhVvCcSsQqTtAaZz][\s\d.-]/.test(t) && /\d/.test(t) && t.length > 20) return true;
  // SVG transform/viewBox style strings
  if (/^[\d.\s,-]+$/.test(t) && t.length > 5) return true;
  return false;
}

function isInteresting(s: string): boolean {
  const t = s.trim();
  if (t.length < 2) return false;
  if (looksLikeIdentifier(t)) return false;
  if (looksLikeClassNames(t)) return false;
  if (looksLikeCssValue(t)) return false;
  if (looksLikeHtmlTagOrAttr(t)) return false;
  if (looksLikeImportPath(t)) return false;
  if (looksLikeSvgPath(t)) return false;
  // URL-only paths (route-only) — drop short slash-prefixed ids
  if (/^\/[a-z-]+$/.test(t)) return false;
  // Pure punctuation
  if (/^[\s\p{P}\p{S}]+$/u.test(t)) return false;
  // Single-line of mostly symbols (e.g., "({})", arrows)
  if (t.length <= 4 && !/[a-zA-Z]/.test(t)) return false;
  return true;
}

function extractStrings(src: string): string[] {
  const out: string[] = [];
  // Strip imports first
  let s = src.replace(/^import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, "");
  // Strip single/multi-line comments
  s = s.replace(/\/\*[\s\S]*?\*\//g, "");
  s = s.replace(/^\s*\/\/[^\n]*$/gm, "");

  // 1) Double-quoted strings (no escapes, simple)
  const dq = /"([^"\\\n]+(?:\\.[^"\\\n]*)*)"/g;
  // 2) Single-quoted strings
  const sq = /'([^'\\\n]+(?:\\.[^'\\\n]*)*)'/g;
  // 3) Backtick template literals (single line, no ${}) — keep simple ones
  const tq = /`([^`$\n]+)`/g;
  // 4) JSX text content between > and < (no braces)
  const jsxText = />([^<>{}\n]{2,})</g;

  for (const re of [dq, sq, tq, jsxText]) {
    let m;
    while ((m = re.exec(s))) {
      const t = m[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\'/g, "'").trim();
      if (isInteresting(t)) out.push(t);
    }
  }

  // De-dup adjacent duplicates while preserving order
  const dedup: string[] = [];
  for (const x of out) {
    if (dedup[dedup.length - 1] !== x) dedup.push(x);
  }
  return dedup;
}

function pageMarkdown(file: string, title: string): string {
  const tsx = readFileSync(resolve(pagesDir, file), "utf8");
  const strings = extractStrings(tsx);
  const body = strings.map((s) => `- ${s}`).join("\n");
  return `\n\n## ${title}\n\n_Source: \`artifacts/glycan-msms/src/pages/${file}\`. The list below is every user-visible text fragment (JSX text, string literals) in the order they appear in the source. CSS classes, identifiers, and code-only strings are filtered out._\n\n${body}\n`;
}

function ionsMarkdown(): string {
  const lines: string[] = [];
  lines.push("\n\n## Diagnostic Ions Reference\n");
  lines.push(`Active diagnostic ions: **${diagnosticIons.length}**. Withdrawn entries are listed separately below and are not active ions.\n`);

  for (const cat of categories) {
    if (cat.id === "all") continue;
    const ions = diagnosticIons.filter((i) => i.category === cat.id);
    if (ions.length === 0) continue;
    lines.push(`\n### ${cat.label} (${ions.length})\n`);
    lines.push("| m/z | Formula | Charge | Verification | Polarity | Ion type | Description | Composition | Source | Evidence records | Primary references | Evidence note | Notes | GlyTouCan |");
    lines.push("|---|---|---|---|---|---|---|---|---|---|---|---|---|---|");
    for (const ion of ions) {
      const gt = getGlytoucanIdsForIon(ion).map((g) => `${g.id} (${g.name})`).join("; ") || "";
      const evidence = ion.evidence.map((record) =>
        `${evidenceReference(record.sourceKey)} [${record.evidenceType === "compilation" ? "compilation" : "primary observation"}] — ${record.locator}; reported m/z ${record.reportedMz}; "${record.reportedAssignment}"; ${record.context}`,
      ).join("<br>") || "None (calculated composition)";
      const primaryReferences = ion.evidence
        .flatMap((record) => record.evidenceType === "compilation" ? record.primaryReferences ?? [] : [])
        .join("<br>");
      const cells = [
        ion.mz.toFixed(4),
        ion.formula,
        ion.charge > 0 ? `+${ion.charge}` : String(ion.charge),
        ion.verification === "source" ? "Source-verified" : "Calculated composition",
        ion.polarity,
        ion.ionType ?? "",
        (ion.subCategory ? `**${ion.subCategory}** — ` : "") + ion.description,
        "`" + ion.composition.replace(/\|/g, "\\|") + "`",
        ion.source,
        evidence,
        primaryReferences,
        ion.evidenceNote ?? "Not applicable to source-verified ions.",
        (ion.notes ?? "").replace(/\n/g, " ").replace(/\|/g, "\\|"),
        gt.replace(/\|/g, "\\|"),
      ].map(markdownCell);
      lines.push("| " + cells.join(" | ") + " |");
    }
  }
  lines.push("\n### Withdrawn ions (not active diagnostic ions)\n");
  lines.push("These withdrawn entries are retained separately for provenance and review; they are excluded from the active ion table above.\n");
  lines.push("| m/z | Polarity | Description | Original source | Withdrawal reason |");
  lines.push("|---|---|---|---|---|");
  for (const ion of withdrawnDiagnosticIons) {
    lines.push("| " + [
      ion.mz.toFixed(4),
      ion.polarity,
      ion.description,
      ion.originalSource,
      ion.reason,
    ].map(markdownCell).join(" | ") + " |");
  }
  return lines.join("\n");
}

function applicationsMarkdown(): string {
  const lines: string[] = ["\n\n## Application Guides\n", `Total guides: **${applicationGuides.length}**\n`];
  for (const cat of applicationCategories) {
    if (cat.id === "all") continue;
    const guides = applicationGuides.filter((g) => g.appCategory === cat.id);
    if (guides.length === 0) continue;
    lines.push(`\n### ${cat.label} (${guides.length})\n`);
    for (const g of guides) {
      lines.push(`\n#### ${g.title}`);
      lines.push(`*Polarity: ${g.polarity}*\n`);
      lines.push(g.description);
      if (g.workflow) lines.push(`\n**Workflow:** ${g.workflow}`);
      if (g.ions.length) {
        lines.push(`\n**Diagnostic ions:**`);
        for (const ion of g.ions) lines.push(`- *m/z* ${ion.mz.toFixed(4)} — ${ion.role}`);
      }
      if (g.tips?.length) {
        lines.push(`\n**Tips:**`);
        for (const t of g.tips) lines.push(`- ${t}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

function challengesMarkdown(): string {
  const lines: string[] = ["\n\n## Challenging Compositions\n", `Total entries: **${challengingCompositions.length}**\n`];
  for (const cat of challengeCategories) {
    const entries = challengingCompositions.filter((c) => c.category === cat.id);
    if (entries.length === 0) continue;
    lines.push(`\n### ${cat.label} (${entries.length})\n`);
    for (const c of entries) {
      lines.push(`\n#### ${c.title}`);
      lines.push(`*Severity: ${c.severity}*\n`);
      lines.push(c.description);
      if (c.massPair) {
        lines.push(`\n**Mass pair:** ${c.massPair.label1} (${c.massPair.mass1}) vs ${c.massPair.label2} (${c.massPair.mass2}) — Δ ${c.massPair.delta}`);
      }
      if (c.diagnosticStrategy) lines.push(`\n**Diagnostic strategy:** ${c.diagnosticStrategy}`);
      if (c.examples?.length) {
        lines.push(`\n**Examples:**`);
        for (const e of c.examples) lines.push(`- ${e}`);
      }
      if (c.relevantIons?.length) {
        lines.push(`\n**Relevant ions:**`);
        for (const i of c.relevantIons) lines.push(`- *m/z* ${i.mz.toFixed(4)} — ${i.label}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

function referencesMarkdown(): string {
  const lines: string[] = ["\n\n## References\n"];
  for (const r of references as any[]) {
    const bits = [r.authors, `"${r.title}"`, r.journal, String(r.year), r.volume, r.pages].filter(Boolean).join(", ");
    const ids = [r.doi && `doi:${r.doi}`, r.pmid && `PMID:${r.pmid}`, r.pmcid && `PMCID:${r.pmcid}`].filter(Boolean).join(" · ");
    lines.push(`- ${bits}${ids ? ` (${ids})` : ""}${r.url ? ` — ${r.url}` : ""}`);
    if (r.ionListUrl) {
      lines.push(`  - Versioned default ion list (curated support, not proof of measurement): ${r.ionListUrl}`);
    }
  }
  return lines.join("\n");
}

function build(): string {
  const header = `# GlycoMSGuide — Full Content Export

_Auto-generated for scientific accuracy review. Source: \`artifacts/glycan-msms\`._

This export contains every user-visible scientific content element in the app:

1. **Page text** — every visible text fragment from each page (Welcome, Getting Started, Nomenclature Guide, Applications, Challenges, Diagnostic Ions, References), extracted directly from the JSX. CSS classes and code-only strings are filtered out. Each fragment is listed in source order so you can locate it in context.
2. **Diagnostic-ion reference table** — all ${diagnosticIons.length} active ions with m/z, formula, charge, verification, evidence records, composition, polarity, source citation, notes, and GlyTouCan IDs; withdrawn ions are listed separately.
3. **Application guides** — all ${applicationGuides.length} task-oriented guides with workflows, diagnostic ions, and tips.
4. **Challenging compositions** — all ${challengingCompositions.length} entries (isobaric confusions, false positives, pitfalls) with diagnostic strategies and relevant ions.
5. **References** — all source citations with DOI / PMID / PMCID.

Suggested fact-check passes:
- **m/z values**: verify against published values (cite source paper given in each row).
- **Compositions / formulas**: confirm chemical formulas match the m/z within ±0.005 Da.
- **Biological claims**: scrutinize statements about biosynthesis, biological origin, and tissue specificity.
- **Linkage assignments** (α1-3, β1-4, etc.): confirm against IUPAC standard for cited motif.
- **Diagnostic strategies**: confirm the ions listed actually distinguish the isobars described.

---
`;

  return [
    header,
    pageMarkdown("Welcome.tsx", "Welcome Page"),
    pageMarkdown("GettingStarted.tsx", "Getting Started Page"),
    pageMarkdown("NomenclatureGuide.tsx", "Nomenclature Guide Page"),
    pageMarkdown("Home.tsx", "Diagnostic Ions Page (UI prose)"),
    pageMarkdown("ApplicationsGuide.tsx", "Applications Page (UI prose)"),
    pageMarkdown("Challenges.tsx", "Challenges Page (UI prose)"),
    pageMarkdown("ReferencesPage.tsx", "References Page (UI prose)"),
    ionsMarkdown(),
    applicationsMarkdown(),
    challengesMarkdown(),
    referencesMarkdown(),
  ].join("\n");
}

const out = resolve(repoRoot, "exports/glycomsguide_content.md");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, build(), "utf8");
console.log(`Wrote ${out}`);
