import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { AppHeader } from "@/components/AppHeader";
import { MonosaccharideSymbol } from "@/components/SNFGSymbols";
import {
  monosaccharidesAndModifications,
  monosaccharideCategories,
  monosaccharideDatasetLastUpdated,
  type MonosaccharideModification
} from "@/data/monosaccharidesData";
import {
  buildMonosaccharideCsv,
  buildMonosaccharideJson,
} from "@/data/monosaccharideExports";

const datasetLastUpdatedLabel = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
}).format(new Date(`${monosaccharideDatasetLastUpdated}T00:00:00Z`));

function ScopeBadge({ scope }: { scope: MonosaccharideModification["glycoMSGuideStatus"] }) {
  const isCore = scope === "Core mammalian";
  return (
    <span className={`tech-badge ${
      isCore ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-orange-50 text-orange-700 border-orange-200"
    }`}>
      {scope}
    </span>
  );
}

function LinkedReference({ reference }: { reference: string }) {
  const match = reference.match(/^(.*?)(PMID:\s*(\d+)|DOI:\s*(\S+))\.?$/);
  if (!match) return <span>{reference}</span>;

  const [, citation, identifier, pmid, doi] = match;
  const href = pmid
    ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
    : `https://doi.org/${doi?.replace(/\.$/, "")}`;

  return (
    <span>
      {citation}
      <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
        {identifier.replace(/\.$/, "")}
      </a>
      .
    </span>
  );
}
function ItemCard({ item }: { item: MonosaccharideModification }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="tech-card transition-shadow hover:shadow-md hover:border-slate-300">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 sm:p-5 focus:outline-none focus-visible:bg-slate-50"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{item.shortName}</h3>
              <span className="text-sm text-slate-600 font-medium">{item.name}</span>
              <ScopeBadge scope={item.glycoMSGuideStatus} />
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 font-mono">
              {item.recordType === "monosaccharide" && item.monoisotopicMass !== undefined && (
                <span><strong className="font-sans text-slate-500 uppercase tracking-wider text-[10px]">Free mass: </strong>{item.monoisotopicMass.toFixed(4)} Da</span>
              )}
              {item.recordType === "monosaccharide" && item.monoisotopicMass !== undefined && (
                <span><strong className="font-sans text-slate-500 uppercase tracking-wider text-[10px]">Residue mass: </strong>{(item.monoisotopicMass - 18.01056).toFixed(4)} Da</span>
              )}
              {item.recordType === "modification" && item.massShift !== undefined && (
                <span>
                  <strong className="font-sans text-slate-500 uppercase tracking-wider text-[10px]">Net shift: </strong>
                  {item.massShift > 0 ? "+" : ""}
                  {item.massShift.toFixed(4)} Da
                </span>
              )}
              <span><strong className="font-sans text-slate-500 uppercase tracking-wider text-[10px]">Mammalian: </strong>{item.mammalianRelevance}</span>
            </div>
            
            {item.synonyms.length > 0 && (
              <p className="text-xs text-slate-500 mt-2 truncate max-w-xl" title={item.synonyms.join(", ")}>
                <span className="font-semibold text-slate-400">AKA:</span> {item.synonyms.join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            {item.snfgSymbol && (
              <div className="hidden sm:flex bg-slate-50 border border-slate-100 rounded p-1 items-center justify-center">
                <svg width={32} height={32} viewBox="0 0 32 32">
                  <MonosaccharideSymbol name={item.snfgSymbol} x={16} y={16} size={20} showLabel={false} />
                </svg>
              </div>
            )}
            <svg
              className={`w-5 h-5 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
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
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-slate-100 pt-4 space-y-5 bg-slate-50/30">
          <p className="text-sm text-slate-800 leading-relaxed font-medium">{item.description}</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Chemistry</h4>
              <dl className="text-xs text-slate-700 space-y-1.5">
                {item.formula && <div className="flex gap-2"><dt className="font-medium text-slate-500 w-20">Formula</dt><dd className="font-mono">{item.formula}</dd></div>}
                <div className="flex gap-2"><dt className="font-medium text-slate-500 w-20">Category</dt><dd>{item.category}</dd></div>
                {item.recordType === "modification" && item.commonTargets && item.commonTargets.length > 0 && (
                  <div className="flex gap-2"><dt className="font-medium text-slate-500 w-20">Targets</dt><dd>{item.commonTargets.join(", ")}</dd></div>
                )}
              </dl>
            </div>
            
            <div>
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Biological Context</h4>
              <dl className="text-xs text-slate-700 space-y-1.5">
                <div className="flex gap-2"><dt className="font-medium text-slate-500 w-12">Scope</dt><dd>{item.biologicalScope.join(", ")}</dd></div>
                {item.organismNotes && (
                  <div className="flex gap-2"><dt className="font-medium text-slate-500 w-12">Notes</dt><dd>{item.organismNotes}</dd></div>
                )}
              </dl>
            </div>
          </div>
          
          {item.msConsiderations && (
            <div className="border-l-2 border-primary pl-3 py-1">
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">MS Considerations</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{item.msConsiderations}</p>
            </div>
          )}
          
          {item.stability || item.samplePreparationConsiderations ? (
            <div className="text-xs text-slate-700 space-y-1.5 border-t border-slate-100 pt-3">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Sample Preparation</h4>
              {item.stability && <p><strong className="font-medium text-slate-500 mr-2">Stability</strong>{item.stability}</p>}
              {item.samplePreparationConsiderations && <p><strong className="font-medium text-slate-500 mr-2">Notes</strong>{item.samplePreparationConsiderations}</p>}
            </div>
          ) : null}

          {item.primaryReferences && item.primaryReferences.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">Primary references</h4>
              <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
                {item.primaryReferences.map((reference) => (
                  <li key={reference}><LinkedReference reference={reference} /></li>
                ))}
              </ol>
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 mt-2">
            <div className="text-[11px] text-slate-500 space-y-1.5">
              <div className="flex gap-2">
                <strong className="font-medium text-slate-600 uppercase tracking-wider">IDs</strong>
                {item.glyTouCanIds?.map(id => (
                  <a key={id} href={`https://glytoucan.org/Structures/Glycans/${id}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">GTC:{id}</a>
                ))}
                {item.chebiId && (
                  <a href={`https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:${item.chebiId}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">ChEBI:{item.chebiId}</a>
                )}
                {item.pubChemCid && (
                  <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${item.pubChemCid}`} target="_blank" rel="noreferrer" className="text-primary hover:underline">PubChem:{item.pubChemCid}</a>
                )}
                {!item.glyTouCanIds && !item.chebiId && !item.pubChemCid && <span>None</span>}
              </div>
              <div className="flex gap-2 flex-wrap">
                <strong className="font-medium text-slate-600 uppercase tracking-wider">Sources</strong>
                {item.sourceResources.map((src, i) => (
                  <span key={i}>
                    {src.url ? <a href={src.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">{src.resource}</a> : src.resource}
                    {" "}<span className="text-slate-400">({src.accessed})</span>{i < item.sourceResources.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            </div>
            
            {item.relatedDiagnosticIons && item.relatedDiagnosticIons.length > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-2">
                {item.relatedDiagnosticIons.map((ion) => (
                  <span
                    key={`${ion.mz}-${ion.specificity}`}
                    className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2 py-1 text-[10px] text-slate-600"
                  >
                    <span className="font-mono font-semibold text-slate-800">{ion.mz.toFixed(4)}</span>
                    <span>{ion.specificity}</span>
                  </span>
                ))}
                <Link
                  href={`/diagnostic-ions?mz=${encodeURIComponent(
                    item.relatedDiagnosticIons.map((ion) => ion.mz.toFixed(4)).join(","),
                  )}`}
                  className="btn-outline text-xs h-8 px-3"
                >
                  View ions
                  <svg className="w-3.5 h-3.5 ml-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MonosaccharidesModifications() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeScope, setActiveScope] = useState<"all" | "Core mammalian" | "Extended biological context">("all");
  const [activeContext, setActiveContext] = useState<string>("all");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeMsRelevance, setActiveMsRelevance] = useState<"all" | "has_ion" | "no_ion">("all");

  const biologicalContexts = ["Mammalian", "Vertebrate", "Invertebrate", "Microbial", "Plant", "Fungal"];

  const filteredItems = useMemo(() => {
    let items = monosaccharidesAndModifications;

    if (activeScope !== "all") {
      items = items.filter(item => item.glycoMSGuideStatus === activeScope);
    }
    
    if (activeContext !== "all") {
      // "Broadly distributed" residues occur in every context, including mammals.
      items = items.filter(item => item.biologicalScope.includes(activeContext as any) || item.biologicalScope.includes("Broadly distributed" as any));
    }
    
    if (activeCategory !== "all") {
      items = items.filter(item => item.category === activeCategory);
    }
    
    if (activeMsRelevance !== "all") {
      if (activeMsRelevance === "has_ion") {
        items = items.filter(item => item.relatedDiagnosticIons && item.relatedDiagnosticIons.length > 0);
      } else {
        items = items.filter(item => !item.relatedDiagnosticIons || item.relatedDiagnosticIons.length === 0);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.shortName.toLowerCase().includes(q) ||
        item.synonyms.some(s => s.toLowerCase().includes(q)) ||
        (item.formula || "").toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }

    return items;
  }, [activeScope, activeContext, activeCategory, activeMsRelevance, searchQuery]);

  const exportCSV = useCallback(() => {
    const csv = buildMonosaccharideCsv(filteredItems);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `glycomsguide-monosaccharides-${monosaccharideDatasetLastUpdated}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredItems]);

  const exportJSON = useCallback(() => {
    const output = buildMonosaccharideJson(filteredItems);
    const blob = new Blob([JSON.stringify(output, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `glycomsguide-monosaccharides-${monosaccharideDatasetLastUpdated}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredItems]);

  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Monosaccharides & Modifications</h2>
            <p className="text-sm text-slate-600 mt-1">
              Reference for monosaccharides, derivatives, and chemical modifications relevant to glycan MS interpretation.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono text-right shrink-0">
            <div className="font-semibold text-slate-700">{monosaccharidesAndModifications.length} ENTRIES</div>
            Updated: <time dateTime={monosaccharideDatasetLastUpdated}>{datasetLastUpdatedLabel}</time>
          </div>
        </div>

        <div className="selection-panel mb-6">
          <div className="mb-4 flex gap-3 p-3 text-sm text-slate-700 bg-white border border-slate-200 rounded-md shadow-sm">
            <svg className="h-5 w-5 flex-shrink-0 text-primary mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="space-y-2">
              <p>
                <strong>Reference scope:</strong> Includes common mammalian monosaccharides and selected non-mammalian residues for mixed-species contexts. <strong>Inclusion does not imply that a corresponding diagnostic ion has been validated.</strong>
              </p>
              <ul className="grid md:grid-cols-3 gap-2 text-xs text-slate-600 font-medium">
                <li><strong className="text-slate-800">Presence in this list</strong> ≠ occurrence in a sample</li>
                <li><strong className="text-slate-800">Absence from this list</strong> ≠ impossible to occur</li>
                <li><strong className="text-slate-800">Unexpected in a sample</strong> = requires validation</li>
              </ul>
              <p className="text-xs">
                <Link href="/unexpected-observations" className="font-semibold text-primary hover:underline">
                  How to investigate unexpected observations
                </Link>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <input
                type="search"
                placeholder="Search by name, abbreviation, synonym, formula…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-input rounded-md text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="flex gap-2">
              <button onClick={exportCSV} className="btn-outline">
                <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                CSV
              </button>
              <button onClick={exportJSON} className="btn-outline">
                <svg className="w-4 h-4 mr-1.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                JSON
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="selection-label">Scope:</span>
              {(["all", "Core mammalian", "Extended biological context"] as const).map((scope) => (
                <button
                  key={scope}
                  onClick={() => setActiveScope(scope)}
                  className={`selection-option ${
                    activeScope === scope
                      ? "selection-option-active"
                      : ""
                  }`}
                >
                  {scope === "all" ? "All" : scope}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="selection-label">MS Link:</span>
              {[
                { id: "all", label: "All" },
                { id: "has_ion", label: "Has related/supporting ion" },
                { id: "no_ion", label: "No related/supporting ion" }
              ].map((rel) => (
                <button
                  key={rel.id}
                  onClick={() => setActiveMsRelevance(rel.id as any)}
                  className={`selection-option ${
                    activeMsRelevance === rel.id
                      ? "selection-option-active"
                      : ""
                  }`}
                >
                  {rel.label}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="selection-label">Context:</span>
              <button
                onClick={() => setActiveContext("all")}
                className={`selection-option ${
                  activeContext === "all" ? "selection-option-active" : ""
                }`}
              >
                All
              </button>
              {biologicalContexts.map((ctx) => (
                <button
                  key={ctx}
                  onClick={() => setActiveContext(ctx)}
                  className={`selection-option ${
                    activeContext === ctx ? "selection-option-active" : ""
                  }`}
                >
                  {ctx}
                </button>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="selection-label">Category:</span>
              <button
                onClick={() => setActiveCategory("all")}
                className={`selection-option ${
                  activeCategory === "all" ? "selection-option-active" : ""
                }`}
              >
                All
              </button>
              {monosaccharideCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`selection-option ${
                    activeCategory === cat.id ? "selection-option-active" : ""
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 pb-8">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
          {filteredItems.length === 0 && (
            <div className="tech-card py-12 text-center bg-white">
              <p className="text-slate-500 font-medium mb-3">No items found matching your filters.</p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setActiveScope("all");
                  setActiveContext("all");
                  setActiveCategory("all");
                  setActiveMsRelevance("all");
                }}
                className="btn-outline text-xs h-8"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
