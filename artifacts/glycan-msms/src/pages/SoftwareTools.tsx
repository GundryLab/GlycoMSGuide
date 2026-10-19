import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useListToolUpdates } from "@workspace/api-client-react";
import {
  glycomicsTools,
  glycoproteomicsTools,
  type SoftwareTool,
  type ToolScope,
  type ToolAvailability,
} from "@workspace/glyco-tools";

type SubTab = "all" | "glycomics" | "glycoproteomics";

const softwarePageLastUpdated = "2026-10-15";
const softwareLastUpdatedLabel = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
}).format(new Date(`${softwarePageLastUpdated}T00:00:00Z`));

const allTools = Array.from(
  new Map(
    [...glycomicsTools, ...glycoproteomicsTools].map((tool) => [tool.name, tool]),
  ).values(),
).sort((a, b) => a.name.localeCompare(b.name));

function formatLastChecked(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ScopeBadge({ scope }: { scope: ToolScope }) {
  const isAnnotation = scope.includes("Annotation");
  const isQuant = scope.includes("Quantification");
  return (
    <span className="inline-flex flex-wrap gap-1.5">
      {isAnnotation && (
        <span className="tech-badge bg-blue-50 text-blue-700 border-blue-200">
          Annotation
        </span>
      )}
      {isQuant && (
        <span className="tech-badge bg-teal-50 text-teal-700 border-teal-200">
          Quantification
        </span>
      )}
    </span>
  );
}

function AvailabilityBadge({ availability }: { availability: ToolAvailability }) {
  const style =
    availability === "Free"
      ? "bg-slate-100 text-slate-700 border-slate-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  return (
    <span className={`tech-badge ${style}`}>
      {availability}
    </span>
  );
}

function pubmedUrl(pmid?: string) {
  return pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : undefined;
}

function MetaItem({ label, value }: { label: string; value: string }) {
  if (!value || value === String.fromCharCode(0x2014)) return null;
  return (
    <div className="py-1">
      <dt className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-0.5">{label}</dt>
      <dd className="text-xs text-slate-700 font-medium">{value}</dd>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  );
}

function ToolCard({ tool, lastChecked }: { tool: SoftwareTool; lastChecked?: string }) {
  const [expanded, setExpanded] = useState(false);
  const pubUrl = pubmedUrl(tool.pmid);
  const nameUrl = tool.url ?? pubUrl;
  const checkedOn = formatLastChecked(lastChecked);
  const detailsId = `software-details-${tool.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;

  return (
    <article className="tech-card bg-white hover:border-slate-300">
      <div className="flex items-start gap-4 p-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold tracking-tight text-slate-900">
              {nameUrl ? (
                <a
                  href={nameUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={
                    tool.url
                      ? "Opens the tool's website / homepage"
                      : "Opens the publication describing this software"
                  }
                  className="group inline-flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline"
                >
                  {tool.name}
                  <ExternalLinkIcon />
                </a>
              ) : (
                tool.name
              )}
            </h3>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-500" title={tool.pmid ? "Publication year" : "Year listed"}>
              {tool.year}
            </span>
            <ScopeBadge scope={tool.scope} />
            <AvailabilityBadge availability={tool.availability} />
          </div>
          <p className="text-sm leading-relaxed text-slate-700">{tool.description}</p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={detailsId}
          className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          title={expanded ? "Hide software details" : "Show software details"}
        >
          <svg
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="sr-only">{expanded ? "Hide" : "Show"} details for {tool.name}</span>
        </button>
      </div>

      {expanded && (
        <div id={detailsId} className="border-t border-slate-100 px-4 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)]">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
              <MetaItem label="Glycan types" value={tool.glycanType} />
              <MetaItem label="MS data" value={tool.msData} />
              <MetaItem label="Platform" value={tool.platform} />
              <MetaItem label="Interface" value={tool.usage} />
              <MetaItem label="Language" value={tool.language ?? ""} />
              <MetaItem label="License" value={tool.license ?? ""} />
            </dl>

            <div className="space-y-3 border-slate-100 md:border-l md:pl-4">
              {pubUrl && (
                <div className="text-[11px] font-medium">
                  <a
                    href={pubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={
                      tool.pmidIsApplication
                        ? "Opens PubMed: a study that used this software"
                        : "Opens PubMed: the publication describing this software"
                    }
                    className="group inline-flex items-center gap-1 text-slate-500 hover:text-primary hover:underline"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    PubMed Reference
                    <ExternalLinkIcon />
                  </a>
                  {tool.pmidIsApplication ? (
                    <span className="mt-1 block italic text-slate-400">
                      Note: Linked paper used this tool; it does not describe the software itself.
                    </span>
                  ) : null}
                </div>
              )}

              {checkedOn && (
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400" title="Automated monthly check">
                  Update Checked: {checkedOn}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

function ToolsPanel({
  tools,
  noun,
  lastCheckedByName,
}: {
  tools: SoftwareTool[];
  noun: string;
  lastCheckedByName: Map<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"all" | "annotation" | "quantification">("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | ToolAvailability>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      const matchesQuery =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.glycanType.toLowerCase().includes(q) ||
        (t.language ?? "").toLowerCase().includes(q);
      const matchesScope =
        scopeFilter === "all" ||
        (scopeFilter === "annotation" && t.scope.includes("Annotation")) ||
        (scopeFilter === "quantification" && t.scope.includes("Quantification"));
      const matchesAvailability =
        availabilityFilter === "all" || t.availability === availabilityFilter;
      return matchesQuery && matchesScope && matchesAvailability;
    });
  }, [tools, query, scopeFilter, availabilityFilter]);

  return (
    <div>
      <div className="tech-card p-4 mb-6 bg-slate-50/50">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools by name, glycan type, or language…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={scopeFilter}
              onChange={(e) => setScopeFilter(e.target.value as typeof scopeFilter)}
              className="text-sm bg-white border border-input rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-700"
            >
              <option value="all">All scopes</option>
              <option value="annotation">Annotation</option>
              <option value="quantification">Quantification</option>
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as typeof availabilityFilter)}
              className="text-sm bg-white border border-input rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-700"
            >
              <option value="all">All availability</option>
              <option value="Free">Free</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
        </div>
        <p className="text-xs text-slate-500 font-medium mt-3 border-t border-slate-200/60 pt-3">
          Showing <strong className="text-slate-700">{filtered.length}</strong> of {tools.length} maintained tools for {noun} MS data analysis.
        </p>
      </div>

      <div className="grid gap-3 pb-8">
        {filtered.map((tool) => (
          <ToolCard key={tool.name} tool={tool} lastChecked={lastCheckedByName.get(tool.name)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="tech-card py-12 text-center bg-white">
          <p className="text-slate-500 font-medium">No tools match your filters.</p>
        </div>
      )}
    </div>
  );
}


export default function SoftwareTools() {
  const [subTab, setSubTab] = useState<SubTab>("all");
  const { data: updates } = useListToolUpdates();

  const lastCheckedByName = useMemo(() => {
    const m = new Map<string, string>();
    for (const u of updates ?? []) m.set(u.toolName, u.lastCheckedAt);
    return m;
  }, [updates]);

  const subTabs: { id: SubTab; label: string }[] = [
    { id: "all", label: "All Software" },
    { id: "glycomics", label: "Glycomics" },
    { id: "glycoproteomics", label: "Glycoproteomics" },
  ];

  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">MS Data Analysis Software</h2>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Software tools for mass spectrometry data analysis. This list emphasizes tools that are
              currently maintained or actively used, rather than an exhaustive catalog of every tool ever
              published. Listings are provided to help the community find relevant options; inclusion does not
              indicate a preference for any particular software package.
            </p>
          </div>
          <div className="shrink-0 text-right font-mono text-xs text-slate-500">
            <div className="font-semibold text-slate-700">{allTools.length} TOOLS TOTAL</div>
            Updated: <time dateTime={softwarePageLastUpdated}>{softwareLastUpdatedLabel}</time>
          </div>
        </div>

        <div className="selection-panel mb-6">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="selection-label">Analysis:</span>
            {subTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                aria-pressed={subTab === tab.id}
                className={`selection-option px-4 py-1.5 text-sm ${
                  subTab === tab.id ? "selection-option-active" : ""
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {subTab === "all" ? (
          <ToolsPanel
            key="all"
            tools={allTools}
            noun="glycomics and glycoproteomics"
            lastCheckedByName={lastCheckedByName}
          />
        ) : subTab === "glycomics" ? (
          <ToolsPanel
            key="glycomics"
            tools={[...glycomicsTools].sort((a, b) => a.name.localeCompare(b.name))}
            noun="glycomics"
            lastCheckedByName={lastCheckedByName}
          />
        ) : (
          <ToolsPanel
            key="glycoproteomics"
            tools={glycoproteomicsTools}
            noun="glycoproteomics (intact glycopeptide)"
            lastCheckedByName={lastCheckedByName}
          />
        )}
      </div>
    </div>
  );
}
