import { useState, useMemo } from "react";
import {
  challengingCompositions,
  challengeCategories,
  type ChallengingComposition,
  type ChallengeCategory,
} from "@/data/challengingCompositions";
import { MonosaccharideSymbol } from "@/components/SNFGSymbols";
import { renderMzText } from "@/utils/renderMz";
import { AppHeader } from "@/components/AppHeader";
import { Link } from "wouter";

const severityTooltips: Record<string, string> = {
  high: "Frequently encountered; can significantly impact glycan/glycopeptide identification accuracy",
  medium: "Moderately common; may affect results under specific experimental conditions",
  low: "Less common; typically arises in specialized analyses or unusual sample types",
};

function SeverityBadge({ severity }: { severity: ChallengingComposition["severity"] }) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-amber-100 text-amber-700 border-amber-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[severity]}`}
      title={severityTooltips[severity]}
    >
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

function CategoryLabel({ category }: { category: ChallengeCategory }) {
  const labels: Record<ChallengeCategory, { text: string; style: string }> = {
    isobaric: { text: "Isobaric", style: "bg-purple-100 text-purple-700 border-purple-200" },
    false_positive: { text: "Potential Misassignment", style: "bg-orange-100 text-orange-700 border-orange-200" },
    pitfall: { text: "Pitfall", style: "bg-blue-100 text-blue-700 border-blue-200" },
  };
  const info = labels[category];
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${info.style}`}>
      {info.text}
    </span>
  );
}

function ChallengeCard({ challenge }: { challenge: ChallengingComposition }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="tech-card bg-white overflow-hidden transition-shadow hover:shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 sm:p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">{renderMzText(challenge.title)}</h3>
              <CategoryLabel category={challenge.category} />
              <SeverityBadge severity={challenge.severity} />
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{renderMzText(challenge.description)}</p>
            {challenge.massPair && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-slate-700">
                  {challenge.massPair.label1}: {challenge.massPair.mass1.toFixed(4)}
                </span>
                <span className="text-slate-600">vs</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-slate-700">
                  {challenge.massPair.label2}: {challenge.massPair.mass2.toFixed(4)}
                </span>
                <span className="text-slate-600 font-medium">
                  (Δ {challenge.massPair.delta})
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {challenge.monosaccharides && challenge.monosaccharides.length > 0 && (
              <svg
                width={challenge.monosaccharides.length * 60}
                height={42}
                viewBox={`0 0 ${challenge.monosaccharides.length * 60} 42`}
                className="hidden sm:block"
                role="img"
                aria-label={challenge.monosaccharides.join(", ")}
              >
                {challenge.monosaccharides.map((mono, i) => (
                  <MonosaccharideSymbol
                    key={i}
                    name={mono}
                    x={30 + i * 60}
                    y={12}
                    size={16}
                    showLabel={true}
                  />
                ))}
              </svg>
            )}
            <svg
              className={`w-5 h-5 text-slate-600 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-gray-100 pt-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{renderMzText(challenge.description)}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Diagnostic Strategy</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{renderMzText(challenge.diagnosticStrategy)}</p>
            {challenge.id === "two-dhex-vs-neuac" && (
              <Link href="/monoisotopic-peak-selection" className="mt-2 inline-flex text-sm font-medium text-primary hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                How an off-by-one isotope assignment causes this ambiguity <span className="ml-1" aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {challenge.examples.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Examples</h4>
              <ul className="space-y-1.5">
                {challenge.examples.map((ex, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-slate-600 flex-shrink-0">•</span>
                    <span>{renderMzText(ex)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {challenge.relevantIons && challenge.relevantIons.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Relevant Diagnostic Ions</h4>
              <div className="flex flex-wrap gap-2">
                {challenge.relevantIons.map((ion, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 border border-indigo-100 rounded-lg text-xs">
                    <span className="font-mono font-semibold text-indigo-700"><em>m/z</em> {ion.mz.toFixed(4)}</span>
                    <span className="text-indigo-500">{ion.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Challenges() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | ChallengeCategory>("all");
  const [activeSeverity, setActiveSeverity] = useState<"all" | "high" | "medium" | "low">("all");

  const filtered = useMemo(() => {
    let result = challengingCompositions;
    if (activeCategory !== "all") {
      result = result.filter((c) => c.category === activeCategory);
    }
    if (activeSeverity !== "all") {
      result = result.filter((c) => c.severity === activeSeverity);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.diagnosticStrategy.toLowerCase().includes(q) ||
          c.examples.some((e) => e.toLowerCase().includes(q)) ||
          (c.monosaccharides || []).some((m) => m.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeCategory, activeSeverity, searchQuery]);

  const categoryCounts = useMemo(() => {
    const base = activeSeverity === "all"
      ? challengingCompositions
      : challengingCompositions.filter((c) => c.severity === activeSeverity);
    const counts: Record<string, number> = { all: base.length };
    for (const c of base) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return counts;
  }, [activeSeverity]);

  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="mb-4 pt-2">
          <h2 className="text-xl font-bold text-slate-900">Challenging Compositions</h2>
          <p className="text-sm text-slate-600 mt-1">
            Common pitfalls, isobaric confusions, and unexpected observations in
            mammalian glycan and glycopeptide MS analysis, each with a diagnostic
            strategy.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Encountered something beyond these examples?{" "}
            <Link href="/unexpected-observations" className="font-medium text-primary hover:underline">
              Investigate an unexpected observation
            </Link>.
          </p>
        </div>
        <aside aria-label="Monoisotopic peak selection guidance" className="mb-4 rounded-md border border-sky-200 bg-sky-50 px-4 py-3.5 text-slate-800">
          <h3 className="text-sm font-semibold">Could this be an isotope-selection error?</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            Some apparent composition ambiguities originate upstream, when an isotope peak rather than the true monoisotopic precursor is selected.
          </p>
          <Link href="/monoisotopic-peak-selection" className="mt-2 inline-flex items-center text-sm font-semibold text-primary hover:underline focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
            Learn about monoisotopic peak selection &amp; off-by-one errors <span className="ml-1" aria-hidden="true">→</span>
          </Link>
        </aside>
        <div
          role="note"
          className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950"
        >
          <div className="flex items-start gap-2.5">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
              />
            </svg>
            <div>
              <p className="font-semibold">Unexpected ≠ incorrect</p>
              <p className="mt-1 text-sm leading-relaxed">
                Biosynthetic plausibility should be used to guide the level of
                validation required, not to exclude observations solely because
                they are unexpected. Unexpected findings can represent artefact,
                misassignment, or novel biology; unexpected assignments therefore
                require additional evidence.{" "}
                <Link
                  href="/resources?context=microbial"
                  className="font-medium underline decoration-amber-500 underline-offset-2 hover:text-amber-800"
                >
                  Working with microbial or mixed-species samples? Explore
                  relevant resources.
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className="selection-panel mb-6 flex flex-col gap-3">
          <div className="relative flex-1">
            <input
              type="search"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="selection-label">Challenge:</span>
            {challengeCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`selection-option whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "selection-option-active"
                    : ""
                }`}
              >
                {cat.label}
                <span className="ml-1 opacity-70">({categoryCounts[cat.id] || 0})</span>
              </button>
            ))}
            <span className="w-px h-5 bg-gray-300 mx-1" />
            <span
              className="text-xs text-slate-600 font-medium cursor-help"
              title="Severity reflects how commonly this issue is encountered and how much it can affect glycan identification. High = frequently encountered with significant impact; Medium = moderately common under specific conditions; Low = less common, arises in specialized analyses."
            >Severity:</span>
            {(["all", "high", "medium", "low"] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setActiveSeverity(sev)}
                className={`px-2 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  activeSeverity === sev
                    ? sev === "high" ? "bg-red-600 text-white shadow-sm"
                      : sev === "medium" ? "bg-amber-500 text-white shadow-sm"
                      : sev === "low" ? "bg-green-600 text-white shadow-sm"
                      : "selection-option-active"
                    : "selection-option"
                }`}
              >
                {sev === "all" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
            <span className="w-px h-5 bg-gray-300 mx-1" />
            <span className="text-xs text-slate-600">{filtered.length} of {challengingCompositions.length}</span>
            <span className="text-xs text-slate-600 italic hidden sm:inline">
              Click any card to expand for diagnostic strategies and examples
            </span>
          </div>
        </div>

        <div className="grid gap-3">
          {filtered.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-600">No challenges found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
