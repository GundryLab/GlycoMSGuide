import { useState, useMemo } from "react";
import {
  applicationGuides,
  applicationCategories,
  type ApplicationCategory,
  type ApplicationGuide,
} from "@/data/applicationGuides";
import { AppHeader } from "@/components/AppHeader";
import { renderMzText } from "@/utils/renderMz";
import { Link } from "wouter";

function PolarityBadge({ polarity }: { polarity: ApplicationGuide["polarity"] }) {
  const styles: Record<string, string> = {
    positive: "bg-red-50 text-red-700 border-red-200",
    negative: "bg-blue-50 text-blue-700 border-blue-200",
    both: "bg-purple-50 text-purple-700 border-purple-200",
  };
  const labels: Record<string, string> = {
    positive: "[+] Positive",
    negative: "[−] Negative",
    both: "[±] Both",
  };
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${styles[polarity]}`}>
      {labels[polarity]}
    </span>
  );
}

function formatMz(mz: number): string {
  return mz.toFixed(4);
}

function ApplicationCard({ guide }: { guide: ApplicationGuide & { appCategory: ApplicationCategory } }) {
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
              <h3 className="text-sm sm:text-base font-semibold text-slate-900">{renderMzText(guide.title)}</h3>
              <PolarityBadge polarity={guide.polarity} />
            </div>
            <p className="text-sm text-slate-600 line-clamp-2">{renderMzText(guide.description)}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {guide.ions.slice(0, 4).map((ion) => (
                <span
                  key={ion.mz}
                  className="inline-block px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-xs font-mono text-indigo-700"
                >
                  <em>m/z</em> {formatMz(ion.mz)}
                </span>
              ))}
              {guide.ions.length > 4 && (
                <span className="inline-block px-2 py-0.5 bg-gray-50 border border-slate-200 rounded text-xs text-slate-600">
                  +{guide.ions.length - 4} more
                </span>
              )}
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-slate-600 transition-transform flex-shrink-0 mt-1 ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-slate-100 pt-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed">{renderMzText(guide.description)}</p>
          </div>

          {guide.workflow && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Workflow guidance
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                {renderMzText(guide.workflow!)}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
              Key Diagnostic Ions ({guide.ions.length})
            </h4>
            <div className="space-y-2">
              {guide.ions.map((ion) => (
                <div key={ion.mz} className="flex gap-3 p-2.5 bg-gray-50 rounded-lg border border-slate-100">
                  <span className="font-mono text-sm font-semibold text-indigo-700 whitespace-nowrap flex-shrink-0">
                    <em>m/z</em> {formatMz(ion.mz)}
                  </span>
                  <span className="text-sm text-slate-600">{renderMzText(ion.role)}</span>
                </div>
              ))}
            </div>
          </div>

          {guide.tips && guide.tips.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">Practical Tips</h4>
              <ul className="space-y-1.5">
                {guide.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-amber-500 flex-shrink-0">!</span>
                    <span>{renderMzText(tip)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ApplicationsGuide() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<ApplicationCategory>("all");

  const filtered = useMemo(() => {
    let result = applicationGuides;
    if (activeCategory !== "all") {
      result = result.filter((g) => g.appCategory === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.shortTitle.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          (g.workflow || "").toLowerCase().includes(q) ||
          g.ions.some((ion) => ion.role.toLowerCase().includes(q) || formatMz(ion.mz).includes(q)) ||
          (g.tips || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: applicationGuides.length };
    for (const g of applicationGuides) {
      counts[g.appCategory] = (counts[g.appCategory] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="mb-4 pt-2">
          <h2 className="text-xl font-bold text-slate-900">
            Diagnostic Ions by Experimental Goal
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Find the right diagnostic ions for your analytical goal. Each
            guide lists the key <em>m/z</em> values, explains what they
            tell you, and provides workflow guidance, noting where results depend on the method.
          </p>
          <div className="mt-3 border-l-2 border-primary/60 bg-primary/5 px-3 py-2 text-sm leading-5 text-slate-700">
            <strong className="font-semibold text-slate-900">Scope note:</strong>{" "}
            These guides illustrate how diagnostic-ion evidence can be applied
            to particular biological questions. They do not define the range
            of glycoconjugates that can occur.{" "}
            <Link href="/unexpected-observations" className="font-medium text-primary hover:underline">
              Investigate an unexpected observation
            </Link>.
          </div>
        </div>

        <div className="selection-panel mb-6">
        <div className="relative mb-3">
          <input
            type="search"
            placeholder="Search by biological question, ion, or keyword (e.g., fucose, linkage, M6P)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
          <span className="selection-label">Question:</span>
          {applicationCategories.map((cat) => (
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
          <span className="text-xs text-slate-600">{filtered.length} of {applicationGuides.length}</span>
          <span className="text-xs text-slate-600 italic hidden sm:inline">
            Click any card for workflow, full ion list, and tips
          </span>
        </div>
        </div>

        <div className="grid gap-3">
          {filtered.map((guide) => (
            <ApplicationCard key={guide.id} guide={guide} />
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <p className="text-slate-600">
                No biological-question guides found matching your criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
