import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { AppHeader } from "@/components/AppHeader";
import { glycanDrawingTools } from "@/data/glycanDrawingTools";

type BiologicalContext =
  | "Mammalian"
  | "Microbial / Host–microbe"
  | "Multi-organism";

interface Resource {
  name: string;
  url: string;
  desc: ReactNode;
  pub?: { cite: string; doi: string };
  relevanceTags?: string[];
  biologicalContexts?: BiologicalContext[];
  displayTags?: string[];
}

interface ResourceGroup {
  id: string;
  heading: string;
  blurb: string;
  items: Resource[];
}

const resourceGroups: ResourceGroup[] = [
  {
    id: "databases",
    heading: "Glycan Databases & Repositories",
    blurb: "Assign, retrieve, and deposit glycan structures and MS data with persistent identifiers.",
    items: [
      {
        name: "GlyTouCan",
        url: "https://glytoucan.org",
        biologicalContexts: ["Multi-organism"],
        desc: (
          <>
            The glycan structure repository. Assigns unique accession numbers to glycans at every level of ambiguity,
            from monosaccharide compositions to glycosidic topologies to fully-defined structures, providing a consensus
            identifier for reporting glycan data in databases and publications.
          </>
        ),
        pub: {
          cite: "Tiemeyer et al. GlyTouCan: An Accessible Glycan Structure Repository. Glycobiology 2017, 27 (10), 915–919.",
          doi: "10.1093/glycob/cwx066",
        },
      },
      {
        name: "GNOme",
        url: "https://gnome.glyomics.org",
        biologicalContexts: ["Multi-organism"],
        desc: (
          <>
            The Glycan Naming and Subsumption Ontology. The entire GlyTouCan database is mapped to its subsumption graph,
            letting you navigate from a base composition (e.g., G80475RE) up to more-defined structures that share the same mass.
          </>
        ),
        pub: {
          cite: "Zhang, Vesser & Edwards. GNOme, an ontology for glycan naming and subsumption. Anal Bioanal Chem 2025, 417 (10), 1961–1973.",
          doi: "10.1007/s00216-025-05757-8",
        },
      },
      {
        name: "GlyCosmos",
        url: "https://glycosmos.org",
        relevanceTags: ["Glycomics", "Glycan structures", "Identifiers", "Taxonomy"],
        biologicalContexts: ["Mammalian", "Microbial / Host–microbe", "Multi-organism"],
        displayTags: ["Glycan structures", "Identifiers", "Multi-organism", "Microbial"],
        desc: (
          <>
            A glycoscience web portal in the GlySpace Alliance that integrates glycan structures, genes, pathways, and
            literature, appending information to GlyTouCan-registered glycans.
          </>
        ),
        pub: {
          cite: "Yamada et al. The GlyCosmos Portal: a unified and comprehensive web resource for the glycosciences. Nat Methods 2020, 17 (7), 649–650.",
          doi: "10.1038/s41592-020-0879-8",
        },
      },
      {
        name: "GlyGen",
        url: "https://glygen.org",
        relevanceTags: ["Glycomics", "Glycoproteomics", "Biological context"],
        biologicalContexts: ["Mammalian", "Multi-organism"],
        displayTags: ["Glycans & glycoproteins", "Biological context", "Multi-organism"],
        desc: (
          <>
            Computational and informatics resources for glycoscience, integrating glycan, glycoprotein, and gene data
            across the GlySpace Alliance for cross-database querying.
          </>
        ),
        pub: {
          cite: "York et al. GlyGen: Computational and Informatics Resources for Glycoscience. Glycobiology 2020, 30 (2), 72–73.",
          doi: "10.1093/glycob/cwz080",
        },
      },
      {
        name: "MicroGlycoDB",
        url: "https://microglycodb.glycosmos.org",
        relevanceTags: ["Glycomics", "Glycan structures"],
        biologicalContexts: ["Microbial / Host–microbe", "Multi-organism"],
        displayTags: ["Microbial", "Glycan structures", "Glycomics"],
        desc: (
          <>
            A database project that integrates glycan information for important
            model microorganisms using Semantic Web technologies, supporting
            standardized exploration of microbial glycan structures and
            biological context.
          </>
        ),
        pub: {
          cite: "Lee et al. MicroGlycoDB: A database of microbial glycans using Semantic Web technologies. BBA Adv 2024, 6, 100126.",
          doi: "10.1016/j.bbadva.2024.100126",
        },
      },
      {
        name: "ProGlycProt",
        url: "https://pubmed.ncbi.nlm.nih.gov/22039152/",
        relevanceTags: ["Glycoproteomics", "Glycosites"],
        biologicalContexts: ["Microbial / Host–microbe", "Multi-organism"],
        displayTags: ["Microbial", "Glycoproteomics", "Glycosites"],
        desc: (
          <>
            A manually curated resource describing experimentally characterized
            bacterial and archaeal glycoproteins and glycosites, with supporting
            organism, glycan, and publication information.
          </>
        ),
        pub: {
          cite: "Bhat et al. ProGlycProt: a repository of experimentally characterized prokaryotic glycoproteins. Nucleic Acids Res 2012, 40 (D1), D388–D393.",
          doi: "10.1093/nar/gkr911",
        },
      },
      {
        name: "GlyConnect",
        url: "https://glyconnect.expasy.org",
        biologicalContexts: ["Mammalian", "Multi-organism"],
        desc: (
          <>
            A curated glycoprotein database. Useful for building biologically informed glycan search spaces from prior
            identifications when sample-specific N- and O-glycan data are unavailable.
          </>
        ),
        pub: {
          cite: "Alocci et al. GlyConnect: Glycoproteomics Goes Visual, Interactive, and Analytical. J Proteome Res 2019, 18 (2), 664–677.",
          doi: "10.1021/acs.jproteome.8b00766",
        },
      },
      {
        name: "GlycoPOST",
        url: "https://glycopost.glycosmos.org",
        biologicalContexts: ["Multi-organism"],
        desc: (
          <>
            A repository for glycomics MS data (raw and processed) recommended by MIRAGE for FAIR-compliant deposition,
            supporting a variety of glycan types.
          </>
        ),
        pub: {
          cite: "Watanabe et al. GlycoPOST realizes FAIR principles for glycomics mass spectrometry data. Nucleic Acids Res 2021, 49 (D1), D1523–D1528.",
          doi: "10.1093/nar/gkaa1012",
        },
      },
      {
        name: "GlyComb",
        url: "https://glycomb.glycosmos.org/",
        biologicalContexts: ["Multi-organism"],
        desc: (
          <>
            A glycoconjugate data repository that bridges glycomics and proteomics. It assigns identifiers to
            glycoconjugates (e.g., glycopeptides and glycoproteins) by combining GlyTouCan glycan structures with their
            peptide or protein attachment information, linking glycan and protein data in a single registered entity.
          </>
        ),
        pub: {
          cite: "Takahashi et al. GlyComb: A novel glycoconjugate data repository that bridges glycomics and proteomics. J Biol Chem 2024, 300 (2), 105624.",
          doi: "10.1016/j.jbc.2023.105624",
        },
      },
    ],
  },
  {
    id: "analysis",
    heading: "Analysis & Prediction Tools",
    blurb: "Explore structures, biosynthetic context, and the plausibility of candidate glycans.",
    items: [
      {
        name: "GlycoMaple",
        url: "https://glycosmos.org/glycomaple",
        biologicalContexts: ["Mammalian"],
        desc: (
          <>
            Visualizes gene expression across glycosylation pathways to predict which glycans a sample could express.
            Pre-loaded with human (Human Protein Atlas) and mouse (Haemopedia) expression data, useful clues for what
            glycans are plausible in a given tissue or cell line.
          </>
        ),
        pub: {
          cite: "Huang et al. Global Mapping of Glycosylation Pathways in Human-Derived Cells. Dev Cell 2021, 56 (8), 1195–1209.",
          doi: "10.1016/j.devcel.2021.02.023",
        },
      },
      {
        name: "GlyGen Sandbox",
        url: "https://sandbox.glyomics.org",
        biologicalContexts: ["Mammalian"],
        desc: (
          <>
            An interactive interface, built on GlycoTree, for exploring N- and O-glycan structures and their biochemistry.
            It can filter glycans by residues that a specified glycosyltransferase could have added, supporting
            hypothetical biosynthetic pathways.
          </>
        ),
      },
      {
        name: "Compozitor",
        url: "https://glyconnect.expasy.org/compozitor",
        biologicalContexts: ["Multi-organism"],
        desc: (
          <>
            Builds a directed graph from a set of glycan compositions (nodes = compositions, edges = a single
            monosaccharide addition). Because a real glycome is highly connected through shared biosynthetic enzymes,
            Compozitor helps assess whether a set of compositions is internally consistent.
          </>
        ),
        pub: {
          cite: "Robin, Mariethoz & Lisacek. Examining and Fine-Tuning the Selection of Glycan Compositions with GlyConnect Compozitor. Mol Cell Proteomics 2020, 19 (10), 1602–1618.",
          doi: "10.1074/mcp.RA120.002041",
        },
      },
    ],
  },
  {
    id: "drawing",
    heading: "Glycan Drawing & Visualization",
    blurb: "Create 2D SNFG figures, depict fragment assignments, or visualize glycans in 3D atomic models. Drawings represent the supplied structural information; they do not establish linkage or topology from MS evidence.",
    items: glycanDrawingTools,
  },
  {
    id: "standards",
    heading: "Standards & Reporting",
    blurb: "Report glycomics experiments transparently and make data FAIR.",
    items: [
      {
        name: "MIRAGE Guidelines",
        url: "https://www.beilstein-institut.de/en/projects/mirage/",
        biologicalContexts: ["Multi-organism"],
        desc: (
          <>
            Minimum Information Required for A Glycomics Experiment. The MS guidelines define the minimum metadata and
            experimental details to include when publishing or sharing glycomics MS data; they standardize reporting
            rather than how experiments are performed.
          </>
        ),
        pub: {
          cite: "Lisacek et al. Update and New Implementation of the MIRAGE Reporting Guidelines for Mass Spectrometry Experiments in Glycoscience. Mol Cell Proteomics 2026, 25 (2), 101473.",
          doi: "10.1016/j.mcpro.2025.101473",
        },
      },
      {
        name: "FAIR Principles",
        url: "https://www.go-fair.org/fair-principles/",
        biologicalContexts: ["Multi-organism"],
        desc: (
          <>
            The guiding principles for making scientific data Findable, Accessible, Interoperable, and Reusable. In
            glycomics this means depositing data in supporting repositories (e.g., GlycoPOST) and reporting GlyTouCan
            identifiers alongside results.
          </>
        ),
        pub: {
          cite: "Wilkinson et al. The FAIR Guiding Principles for Scientific Data Management and Stewardship. Sci Data 2016, 3, 160018.",
          doi: "10.1038/sdata.2016.18",
        },
      },
    ],
  },
];

const resourcesPageLastUpdated = "2026-10-18";
const resourcesLastUpdatedLabel = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
}).format(new Date(`${resourcesPageLastUpdated}T00:00:00Z`));
const totalResources = resourceGroups.reduce((total, group) => total + group.items.length, 0);

export default function ResourcesPage() {
  useEffect(() => {
    const resourceId = window.location.hash.slice(1);
    if (!resourceId.startsWith("resource-")) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(resourceId)?.scrollIntoView({ block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const [biologicalContext, setBiologicalContext] =
    useState<"All" | BiologicalContext>(() => {
      if (typeof window === "undefined") return "All";
      const value = new URLSearchParams(window.location.search).get("context");
      return value === "microbial"
        ? "Microbial / Host–microbe"
        : value === "mammalian"
          ? "Mammalian"
          : value === "multi-organism"
            ? "Multi-organism"
            : "All";
    });

  const contextOptions: Array<"All" | BiologicalContext> = [
    "All",
    "Mammalian",
    "Microbial / Host–microbe",
    "Multi-organism",
  ];

  const [resourceType, setResourceType] = useState(() => {
    if (typeof window === "undefined") return "all";
    const value = new URLSearchParams(window.location.search).get("type");
    return resourceGroups.some(group => group.id === value) ? value! : "all";
  });

  const updateFilterQuery = (key: string, value: string) => {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    url.hash = "";
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  const filteredGroups = resourceGroups
    .filter(group => resourceType === "all" || group.id === resourceType)
    .map((group) => ({
      ...group,
      items:
        biologicalContext === "All"
          ? group.items
          : group.items.filter((resource) =>
              resource.biologicalContexts?.includes(biologicalContext),
            ),
    }))
    .filter((group) => group.items.length > 0);

  const selectContext = (context: "All" | BiologicalContext) => {
    setBiologicalContext(context);
    const queryValue =
      context === "Microbial / Host–microbe"
        ? "microbial"
        : context === "Multi-organism"
          ? "multi-organism"
          : context === "Mammalian"
            ? "mammalian"
            : "";
    updateFilterQuery("context", queryValue);
  };

  const selectResourceType = (type: string) => {
    setResourceType(type);
    updateFilterQuery("type", type === "all" ? "" : type);
  };

  const clearFilters = () => {
    setResourceType("all");
    setBiologicalContext("All");
    const url = new URL(window.location.href);
    url.searchParams.delete("type");
    url.searchParams.delete("context");
    url.hash = "";
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
  };

  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Resources &amp; Tools</h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Key resources for glycan annotation, analysis, and integration into the broader glycoscience knowledge base.
              Integrating these, especially GlyTouCan identifiers and the MIRAGE reporting guidelines, improves data
              interoperability and reproducibility.
            </p>
          </div>
          <div className="shrink-0 text-right font-mono text-xs text-slate-500">
            <div className="font-semibold text-slate-700">{totalResources} RESOURCES TOTAL</div>
            Updated: <time dateTime={resourcesPageLastUpdated}>{resourcesLastUpdatedLabel}</time>
          </div>
        </div>

        <div className="selection-panel mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Resource type">
            <span className="selection-label">Resource type:</span>
            {[{ id: "all", heading: "All" }, ...resourceGroups].map(group => (
              <button
                key={group.id}
                type="button"
                onClick={() => selectResourceType(group.id)}
                aria-pressed={resourceType === group.id}
                className={`selection-option max-w-full px-3 py-1.5 text-left ${
                  resourceType === group.id ? "selection-option-active" : ""
                }`}
              >
                {group.heading}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Biological context">
            <span className="selection-label">
              Biological context:
            </span>
            {contextOptions.map((context) => (
              <button
                key={context}
                type="button"
                onClick={() => selectContext(context)}
                aria-pressed={biologicalContext === context}
                className={`selection-option px-3 py-1.5 ${
                  biologicalContext === context
                    ? "selection-option-active"
                    : ""
                }`}
              >
                {context}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-4 text-xs text-slate-500" role="status" aria-live="polite">
          Showing {filteredGroups.reduce((total, group) => total + group.items.length, 0)} of {totalResources} resources.
        </p>

        <div className="space-y-6 pb-8">
          {filteredGroups.length === 0 && (
            <div className="tech-card bg-white p-6 text-sm text-slate-600">
              <p>No resources match this resource type and biological context.</p>
              <button type="button" onClick={clearFilters} className="btn-outline mt-3">
                Clear filters
              </button>
            </div>
          )}
          {filteredGroups.map((group) => (
            <section key={group.heading} className="tech-card p-6 bg-white">
              <div className="mb-4 border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">{group.heading}</h3>
                <p className="text-sm text-slate-500 mt-1">{group.blurb}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.items.map((res) => (
                  <div
                    key={res.name}
                    id={`resource-${res.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                    className="scroll-mt-6 border border-slate-200 rounded-md p-4 hover:border-slate-300 transition-colors"
                  >
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 font-semibold text-base inline-flex items-center gap-1.5 group"
                    >
                      {res.name}
                      <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                    {res.displayTags && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {res.displayTags.slice(0, 4).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-500">{tag}</span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-slate-700 mt-2 leading-relaxed">{res.desc}</p>
                    {res.pub && (
                      <div className="mt-3 pt-3 border-t border-slate-100/60">
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          {res.pub.cite}{" "}
                          <a
                            href={`https://doi.org/${res.pub.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 hover:underline inline-block mt-0.5"
                          >
                            DOI: {res.pub.doi}
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
          {biologicalContext === "Microbial / Host–microbe" && (
            <div className="mt-6 tech-card p-4 bg-slate-50 border-dashed text-sm text-slate-600 text-center">
              Know another relevant resource?{" "}
              <Link
                href="/suggestions"
                className="font-medium text-primary hover:text-primary/80 hover:underline"
              >
                Suggest a software tool, resource, or diagnostic ion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
