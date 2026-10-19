import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import {
  diagnosticIonDatasetLastUpdated,
  diagnosticIons,
  categories,
  references,
  getGlytoucanIdsForIon,
  getGlytoucanContext,
  getGlytoucanLabel,
  getGlytoucanTooltip,
  type DiagnosticIon,
} from "@/data/glycanData";
import { CompositionSymbols } from "@/components/SNFGSymbols";
import { AppHeader } from "@/components/AppHeader";
import { exportPdf } from "@/utils/exportPdf";
import { renderMzText } from "@/utils/renderMz";

function formatMz(mz: number): string {
  return mz.toFixed(4);
}

function ionTypeFilterLabel(type?: string): string {
  const label = (type || "Unspecified").trim();
  if (label.toLowerCase() === "oxonium") return "Oxonium";
  if (label.toLowerCase() === "fragment") return "Fragment";
  return label;
}

function referenceLabel(sourceKey: string): string {
  const ref = references.find((entry) => entry.id === sourceKey);
  if (!ref) return sourceKey;
  // "Surname" for one author, "Surname & Surname" for two, "Surname et al." for three or more.
  const surnames = ref.authors.split(",").map((author) => author.trim().split(/\s+/)[0]).filter(Boolean);
  const author =
    surnames.length <= 1 ? surnames[0] ?? sourceKey
    : surnames.length === 2 ? `${surnames[0]} & ${surnames[1]}`
    : `${surnames[0]} et al.`;
  const suffix = sourceKey.match(/(?:19|20)\d{2}([a-z])$/)?.[1] || "";
  return `${author} ${ref.year}${suffix}`;
}

function Formula({ formula, charge }: { formula: string; charge: 1 | -1 }) {
  return <>{formula.split(/(\d+)/).map((part, index) => /^\d+$/.test(part) ? <sub key={index}>{part}</sub> : part)}<sup>{charge === 1 ? "+" : "−"}</sup></>;
}

const diagnosticIonLastUpdatedLabel = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
}).format(new Date(`${diagnosticIonDatasetLastUpdated}T00:00:00Z`));

function CategoryBadge({ category }: { category: DiagnosticIon["category"] }) {
  const labels: Record<string, string> = {
    monosaccharide: "Monosaccharide",
    glycan_type: "Glycan Type",
    motif: "Motif",
    modification: "Modification",
    glycopeptide: "Glycopeptide",
    oxonium: "Oxonium Ion",
  };
  return (
    <span className="tech-badge bg-slate-100 text-slate-700 border-slate-200">
      {labels[category] || category}
    </span>
  );
}

function IonCard({ ion }: { ion: DiagnosticIon }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="tech-card p-4 hover:shadow-md hover:border-slate-300 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span
              className="font-mono text-lg font-bold text-slate-900 tracking-tight cursor-help"
              title={`Theoretical monoisotopic m/z for ${ion.polarity === "positive" ? "[M+H]⁺" : "[M−H]⁻"} — neutral mass (M): ${(ion.mz - (ion.polarity === "positive" ? 1.007276 : -1.007276)).toFixed(4)} Da`}
            >
              <em>m/z</em> {formatMz(ion.mz)}
            </span>
            <CategoryBadge category={ion.category} />
            {ion.ionType && (
              <span className="tech-badge bg-white text-slate-600 border-slate-200">
                {ion.ionType}
              </span>
            )}
            <span className={`tech-badge ${
              ion.polarity === "positive"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}>
              {ion.polarity === "positive" ? "[+]" : "[−]"} Mode
            </span>
            <span className="tech-badge bg-slate-50 text-slate-600 border-slate-200 normal-case tracking-normal">
              {ion.verification === "source" ? "Source-verified" : "Calculated composition"}
            </span>
          </div>
          <p className="text-sm text-slate-800 font-medium mb-0.5">{renderMzText(ion.description)}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 font-mono">
            <span className="text-slate-700" aria-label={`Formula ${ion.formula}, charge ${ion.charge > 0 ? "plus one" : "minus one"}`}>
              <Formula formula={ion.formula} charge={ion.charge} />
            </span>
            <span>{renderMzText(ion.composition)}</span>
            {ion.subCategory && (
              <span>• {ion.subCategory}</span>
            )}
          </div>
        </div>
        {ion.monosaccharides && ion.monosaccharides.length > 0 && (
          <div className="flex-shrink-0 bg-slate-50 border border-slate-100 rounded p-1">
            <CompositionSymbols monosaccharides={ion.monosaccharides} />
          </div>
        )}
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            {ion.notes && (
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Notes</dt>
                <dd className="text-xs text-slate-700">{renderMzText(ion.notes!)}</dd>
              </div>
            )}
              {ion.verification === "source" ? (
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Evidence</dt>
                  <dd className="space-y-2 text-xs leading-relaxed text-slate-700">
                    {ion.evidence.map((ev, index) => {
                      const ref = references.find((entry) => entry.id === ev.sourceKey);
                      return (
                        <div key={`${ev.sourceKey}-${ev.locator}-${index}`} className="border-l-2 border-slate-200 pl-2.5">
                          {ref?.doi ? (
                            <a href={`https://doi.org/${ref.doi}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline" onClick={(event) => event.stopPropagation()}>
                              {referenceLabel(ev.sourceKey)}
                            </a>
                          ) : <span className="font-semibold">{referenceLabel(ev.sourceKey)}</span>}
                          {" — "}{ev.locator} · reported <em>m/z</em> {ev.reportedMz} · “{renderMzText(ev.reportedAssignment)}” · {ev.context}
                          {ev.evidenceType === "compilation" && ev.primaryReferences?.length ? (
                            <details className="mt-1 text-slate-600" onClick={(event) => event.stopPropagation()}>
                              <summary className="w-fit cursor-pointer font-medium text-primary hover:underline">Primary studies</summary>
                              <ul className="mt-1 list-disc space-y-0.5 pl-5">
                                {ev.primaryReferences.map((study, studyIndex) => <li key={`${study}-${studyIndex}`}>{study}</li>)}
                              </ul>
                            </details>
                          ) : null}
                        </div>
                      );
                    })}
                  </dd>
                </div>
              ) : (
                <div className="text-xs leading-relaxed text-slate-600">
                  <dt className="font-semibold text-slate-700">Calculated composition</dt>
                  <dd>Formula and <em>m/z</em> are calculated; a primary source has not yet been located.</dd>
                  {ion.evidenceNote && (
                    <details className="mt-1" onClick={(event) => event.stopPropagation()}>
                      <summary className="w-fit cursor-pointer font-medium text-primary hover:underline">What has been checked</summary>
                      <p className="mt-1">{renderMzText(ion.evidenceNote)}</p>
                    </details>
                  )}
                </div>
              )}
              <p className="text-[11px] leading-relaxed text-slate-500"><em>m/z</em> values are calculated from the elemental formula; reported <em>m/z</em> is the value printed in the source.</p>
          </div>
          <div>
            {(() => {
              const gtcIds = getGlytoucanIdsForIon(ion);
              if (gtcIds.length === 0) return null;
              const context = getGlytoucanContext(ion);
              const label = getGlytoucanLabel(context);
              const tooltip = getGlytoucanTooltip(context);
              return (
                <div>
                  <dt className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5 flex items-center gap-1 cursor-help" title={tooltip}>
                    {label}
                    <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </dt>
                  <dd className="text-xs text-slate-700 space-y-1">
                    {gtcIds.map((entry) => (
                      <div key={entry.id} className="truncate">
                        <a
                          href={`https://glytoucan.org/Structures/Glycans/${entry.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline hover:text-primary/80 inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {entry.name} <span className="text-slate-400">({entry.id})</span>
                        </a>
                      </div>
                    ))}
                  </dd>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activePolarity, setActivePolarity] = useState<"all" | "positive" | "negative">("all");
  const [activeIonType, setActiveIonType] = useState<string>("all");
  const [sourceVerifiedOnly, setSourceVerifiedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("search") || "";
    }
    return "";
  });
  const [sortBy, setSortBy] = useState<"mz" | "category">("mz");
  const relatedMzValues = useMemo(() => {
    if (typeof window === "undefined") return new Set<string>();
    const values = new URLSearchParams(window.location.search).get("mz");
    return new Set(
      (values || "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => Number(value).toFixed(4)),
    );
  }, []);

  const ionTypeOptions = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const ion of diagnosticIons) {
      const t = ionTypeFilterLabel(ion.ionType);
      counts[t] = (counts[t] || 0) + 1;
    }
    const order = ["B-ion", "A-ion", "C-ion", "Y-ion", "Z-ion", "D-ion", "Oxonium", "Fragment"];
    const sorted = Object.keys(counts).sort((a, b) => {
      const ia = order.indexOf(a);
      const ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return { counts, sorted };
  }, []);

  const filteredIons = useMemo(() => {
    let ions = [...diagnosticIons];

    if (activeCategory !== "all") {
      ions = ions.filter((ion) => ion.category === activeCategory);
    }

    if (activePolarity !== "all") {
      ions = ions.filter((ion) => ion.polarity === activePolarity);
    }

    if (activeIonType !== "all") {
      ions = ions.filter((ion) => ionTypeFilterLabel(ion.ionType) === activeIonType);
    }

    if (sourceVerifiedOnly) {
      ions = ions.filter((ion) => ion.verification === "source");
    }

    if (relatedMzValues.size > 0) {
      ions = ions.filter((ion) => relatedMzValues.has(formatMz(ion.mz)));
    }

    if (searchQuery) {
      const q = searchQuery.trim().toLowerCase();
      // Numeric queries look up listed or source-reported masses, not values
      // mentioned only as withdrawn or hypothetical in an ion's notes.
      if (/^\d+(?:\.\d+)?$/.test(q)) {
        ions = ions.filter((ion) =>
          formatMz(ion.mz).includes(q) ||
          ion.evidence.some((ev) => ev.reportedMz.includes(q)),
        );
      } else {
        ions = ions.filter(
        (ion) =>
          ion.description.toLowerCase().includes(q) ||
          ion.composition.toLowerCase().includes(q) ||
          ion.formula.toLowerCase().includes(q) ||
          ion.evidenceNote?.toLowerCase().includes(q) ||
          ion.evidence.some((ev) => [ev.sourceKey, referenceLabel(ev.sourceKey), ev.locator, ev.reportedMz, ev.reportedAssignment, ev.context, ...(ev.primaryReferences || [])].some((value) => value.toLowerCase().includes(q))) ||
          ion.subCategory?.toLowerCase().includes(q) ||
          ion.notes?.toLowerCase().includes(q) ||
          ion.source?.toLowerCase().includes(q) ||
          ion.polarity.toLowerCase().includes(q) ||
          formatMz(ion.mz).includes(q) ||
          ion.monosaccharides?.some((m) => m.toLowerCase().includes(q))
        );
      }
    }

    if (sortBy === "mz") {
      ions.sort((a, b) => a.mz - b.mz);
    } else {
      ions.sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return a.mz - b.mz;
      });
    }

    return ions;
  }, [activeCategory, activePolarity, activeIonType, sourceVerifiedOnly, searchQuery, sortBy, relatedMzValues]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: diagnosticIons.length };
    for (const ion of diagnosticIons) {
      counts[ion.category] = (counts[ion.category] || 0) + 1;
    }
    return counts;
  }, []);

  const exportCSV = useCallback(() => {
    const headers = ["m/z", "Description", "Composition", "Category", "Sub-Category", "Ion Type", "Polarity", "Source", "Monosaccharides", "Notes", "GlyTouCan IDs", "Formula", "Charge", "Verification", "Evidence", "Primary references", "Evidence note"];
    const escapeCSV = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };
    const rows = filteredIons.map((ion) => {
      const gtcIds = getGlytoucanIdsForIon(ion);
      const gtcStr = gtcIds.map(e => `${e.name}:${e.id}`).join("; ");
      return [
        formatMz(ion.mz),
        escapeCSV(ion.description),
        escapeCSV(ion.composition),
        ion.category,
        escapeCSV(ion.subCategory || ""),
        ion.ionType || "",
        ion.polarity,
        escapeCSV(ion.source),
        (ion.monosaccharides || []).join("; "),
        escapeCSV(ion.notes || ""),
        escapeCSV(gtcStr),
        escapeCSV(ion.formula),
        String(ion.charge),
        ion.verification === "source" ? "Source-verified" : "Calculated composition",
        escapeCSV(ion.evidence.map((ev) => `${referenceLabel(ev.sourceKey)} — ${ev.locator} — reported m/z ${ev.reportedMz} — ${ev.reportedAssignment}`).join(" | ")),
        escapeCSV(ion.evidence.flatMap((ev) => ev.primaryReferences || []).filter((study, index, studies) => studies.indexOf(study) === index).join(" | ")),
        escapeCSV(ion.evidenceNote || ""),
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "glycan_diagnostic_ions.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredIons]);

  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Diagnostic Ions</h2>
            <p className="text-sm text-slate-600 mt-1">
              Searchable reference of diagnostic ions for glycan MS/MS interpretation. Filter by class, search by <em>m/z</em>, name, formula, or evidence.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono text-right shrink-0">
            <div className="font-semibold text-slate-700">{diagnosticIons.length} IONS TOTAL</div>
            Updated: <time dateTime={diagnosticIonDatasetLastUpdated}>{diagnosticIonLastUpdatedLabel}</time>
          </div>
        </div>

        <div className="selection-panel mb-6">
          <div className="mb-4 flex gap-2 p-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-md shadow-sm">
            <svg className="h-5 w-5 flex-shrink-0 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              <strong>Mammalian-focused scope:</strong> Curated for mammalian glycans and glycopeptides. The absence of an ion does not mean it cannot occur.{" "}
              <Link href="/resources?context=microbial" className="font-medium text-primary hover:underline">
                Working with microbial or mixed-species samples?
              </Link>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="search"
                placeholder="Search m/z, name, formula, composition, or evidence…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-input rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "mz" | "category")}
              className="px-3 py-2 bg-white border border-input rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-700"
            >
              <option value="mz">Sort by m/z ↕</option>
              <option value="category">Sort by Category</option>
            </select>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="btn-outline">
                <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
              <button onClick={() => exportPdf(filteredIons)} className="btn-outline">
                <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                PDF
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="selection-label">Class:</span>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`selection-option ${
                    activeCategory === cat.id
                      ? "selection-option-active"
                      : ""
                  }`}
                >
                  {cat.label} <span className="opacity-70 font-mono ml-1">{categoryCounts[cat.id] || 0}</span>
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="selection-label">Mode:</span>
              {([
                { id: "all" as const, label: "Both" },
                { id: "positive" as const, label: "[+] Positive" },
                { id: "negative" as const, label: "[−] Negative" },
              ]).map((pol) => (
                <button
                  key={pol.id}
                  onClick={() => setActivePolarity(pol.id)}
                  className={`selection-option ${
                    activePolarity === pol.id
                      ? "selection-option-active"
                      : ""
                  }`}
                >
                  {pol.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="selection-label">Type:</span>
              <button
                onClick={() => setActiveIonType("all")}
                className={`selection-option ${
                  activeIonType === "all"
                    ? "selection-option-active"
                    : ""
                }`}
              >
                All <span className="opacity-70 font-mono ml-1">{diagnosticIons.length}</span>
              </button>
              {ionTypeOptions.sorted.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveIonType(t)}
                  className={`selection-option ${
                    activeIonType === t
                      ? "selection-option-active"
                      : ""
                  }`}
                >
                  {t} <span className="opacity-70 font-mono ml-1">{ionTypeOptions.counts[t]}</span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="selection-label">Evidence:</span>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                <input type="checkbox" checked={sourceVerifiedOnly} onChange={(event) => setSourceVerifiedOnly(event.target.checked)} className="accent-slate-800" data-testid="checkbox-source-verified-only" />
                Source-verified only
              </label>
            </div>
          </div>
        </div>

        <div className="grid gap-3 pb-8">
          {filteredIons.map((ion, index) => (
            <IonCard key={`${ion.mz}-${ion.description}-${index}`} ion={ion} />
          ))}
          {filteredIons.length === 0 && (
            <div className="tech-card py-12 text-center bg-white">
              <p className="text-slate-500 font-medium">No diagnostic ions found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
