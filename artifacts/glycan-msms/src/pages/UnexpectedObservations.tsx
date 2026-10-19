import { useState } from "react";
import { Link } from "wouter";
import { AppHeader } from "@/components/AppHeader";

type Observation = {
  id: string;
  number: string;
  title: string;
  prompt: string;
  considerations: string[];
  next: string;
  links: { label: string; href: string }[];
  note?: string;
};

const observations: Observation[] = [
  {
    id: "composition",
    number: "01",
    title: "Unexpected composition or mass",
    prompt: "A precursor does not fit the composition you anticipated.",
    considerations: [
      "Alternative monosaccharide identity or isomeric/isobaric compositions",
      "Monosaccharide modification or substitution, including unusual sialic acid chemistry",
      "Sulfation, phosphorylation, acetylation, methylation, or another modification",
      "Adducts or incorrect charge assignment",
    ],
    next: "Check residue and modification chemistry, evaluate fragmentation, search beyond the initial reference, then seek orthogonal evidence where needed.",
    links: [
      { label: "Monosaccharides & Modifications", href: "/monosaccharides-modifications" },
      { label: "Challenging Compositions", href: "/challenges" },
    ],
  },
  {
    id: "fragment",
    number: "02",
    title: "Unexpected fragment ion",
    prompt: "A product ion is not explained by your working assignment.",
    considerations: [
      "An alternative fragment assignment or a modified monosaccharide",
      "Rearrangement or secondary fragmentation",
      "Instrument and fragmentation-method dependence",
      "A fragment not represented in the current Diagnostic Ions library",
    ],
    next: "Review the precursor and neighboring fragments, compare plausible pathways and acquisition conditions, and consult the ion reference without treating it as exhaustive.",
    links: [{ label: "Diagnostic Ions", href: "/diagnostic-ions" }],
    note: "Absence from the GlycoMSGuide Diagnostic Ions library does not mean that an ion cannot occur.",
  },
  {
    id: "site",
    number: "03",
    title: "Unexpected site or amino acid modification",
    prompt: "The proposed glycosylation site or attachment chemistry is unusual.",
    considerations: [
      "Less common forms of protein glycosylation and alternative glycosylated amino acids",
      "Modified monosaccharides at established glycosylation sites",
      "Evidence for site localization versus evidence for glycan composition alone",
      "Whether the fragmentation method gives sufficient site-localization evidence",
    ],
    next: "Separate composition evidence from localization evidence; review site-determining fragments and consider a complementary method before making a site-specific claim.",
    links: [{ label: "Diagnostic Ions", href: "/diagnostic-ions" }],
  },
  {
    id: "context",
    number: "04",
    title: "Unexpected biological context",
    prompt: "The chemistry seems unfamiliar for this sample or organism.",
    considerations: [
      "Tissue- or cell-specific biology and developmental or disease-associated changes",
      "Dietary or environmental incorporation",
      "Host–microbe, host–pathogen, or mixed-species contributions",
      "Biology established in another organism but not demonstrated in the system under study",
    ],
    next: "Confirm sample provenance and search the relevant organism and biological context before deciding whether the occurrence itself is new.",
    links: [{ label: "Resources & Tools", href: "/resources?context=microbial" }],
  },
];

const explanations = [
  {
    number: "01",
    title: "Analytical explanation?",
    body: "Check sample preparation, derivatization, contaminants, adducts, isotope assignment, charge state, in-source fragmentation, co-isolation, and fragmentation artifacts.",
  },
  {
    number: "02",
    title: "Alternative structure?",
    body: "Could the same precursor mass or fragments arise from another composition, monosaccharide identity, modification, linkage, or positional isomer?",
  },
  {
    number: "03",
    title: "Known, uncommon biology?",
    body: "Look for reports in another tissue, species, developmental state, disease context, or glycoconjugate class.",
  },
  {
    number: "04",
    title: "Outside current databases?",
    body: "A missing entry is not negative experimental evidence. Broaden the search to organism-specific literature and resources.",
  },
  {
    number: "05",
    title: "Potentially novel biology?",
    body: "If plausible analytical and structural alternatives cannot explain it, increase the level of evidence rather than excluding the assignment.",
  },
];

const features = [
  ["Sialic acid variation", "Established; context dependent", "Chemical variants can alter mass and fragmentation."],
  ["O-acetylation", "Established", "Labile; may be affected by sample preparation."],
  ["Sulfation", "Established", "Labile modification requiring appropriate MS interpretation."],
  ["Phosphorylation", "Established", "Relevant to specific glycan classes and pathways."],
  ["Methylation", "Not established on mammalian glycans; reported in invertebrates, plants, fungi and bacteria", "Do not assume impossibility from biosynthetic expectation alone."],
  ["Unusual monosaccharide substitution", "Context dependent; limited mammalian evidence", "Requires stronger structural evidence."],
  ["C-mannosylation", "Established", "Expands searches beyond conventional N- and O-glycosylation."],
  ["O-fucosylation / O-glucosylation", "Established", "Examples of less conventional protein glycosylation."],
  ["Noncanonical residues", "Context dependent", "Consider mixed-species and host–microbe settings."],
];

const evidenceTiers = [
  {
    number: "01",
    title: "Composition supported",
    support: "Elemental or glycan composition.",
    limit: "Does not necessarily establish monosaccharide identity, linkage, topology, or site.",
  },
  {
    number: "02",
    title: "Structural feature supported",
    support: "Presence of a particular residue or modification.",
    limit: "Location and structural context may still require additional evidence.",
  },
  {
    number: "03",
    title: "Structure or site supported",
    support: "Localization or a defined structural assignment.",
    limit: "Assess the fragmentation method and, where appropriate, standards, enzymes, retention behavior, or other orthogonal evidence.",
  },
  {
    number: "04",
    title: "Novel biological assignment",
    support: "A previously unreported structure, modification, or biological occurrence.",
    limit: "Highest evidentiary threshold: support the claim sufficiently to exclude plausible analytical and structural alternatives.",
  },
];

const resourceCards = [
  { name: "GlyTouCan", description: "Search registered glycan structures across biological contexts.", href: "/resources#resource-glytoucan" },
  { name: "GlyGen", description: "Explore glycans, glycoproteins, genes, and supporting biological context.", href: "/resources#resource-glygen" },
  { name: "GlyCosmos", description: "Broaden searches across integrated glycoscience resources.", href: "/resources#resource-glycosmos" },
  { name: "GlyConnect", description: "Explore relationships among glycans, proteins, species, tissues, and literature.", href: "/resources#resource-glyconnect" },
  { name: "MicroGlycoDB / ProGlycProt", description: "Investigate microbial glycosylation in host–microbe or mixed-species settings.", href: "/resources?context=microbial#resource-microglycodb" },
];

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 sm:mb-5">
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>}
    </div>
  );
}

export default function UnexpectedObservations() {
  const [activeId, setActiveId] = useState("composition");
  const active = observations.find((item) => item.id === activeId) ?? observations[0];

  return (
    <div className="min-h-[100dvh] pt-14 md:pl-64 md:pt-0">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Investigating Unexpected Observations</h1>
          <p className="mt-1 text-base font-medium text-slate-700">When the data do not fit established expectations</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Glycan and glycopeptide assignments can fall outside established biosynthetic expectations, commonly reported mammalian structures, or existing database annotations. An unexpected observation should not be excluded solely because it is unfamiliar or absent from a reference resource. At the same time, additional evidence is needed to distinguish novel biology from alternative structural assignments or analytical artifacts.
          </p>
        </header>

        <div role="note" className="mb-9 border-l-[3px] border-primary bg-slate-100/80 px-4 py-3.5 sm:px-5">
          <p className="font-semibold text-slate-900">Unexpected ≠ incorrect, but unexpected requires evidence.</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">Biosynthetic plausibility should guide the level of validation required, not define what is possible.</p>
        </div>

        <section aria-labelledby="observation-heading" className="mb-10">
          <div id="observation-heading">
            <SectionHeading title="Start with the observation" description="Select what you see to focus the first checks. These are starting points, not mutually exclusive diagnoses." />
          </div>
          <div className="selection-panel p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Observation type">
              {observations.map((item) => {
                const selected = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    aria-pressed={selected}
                    aria-controls="observation-detail"
                    data-testid={`button-observation-${item.id}`}
                    className={`min-h-28 rounded-md border p-3.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                      selected
                        ? "border-slate-800 bg-slate-800 text-white"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <span className={`block font-mono text-[11px] font-semibold ${selected ? "text-slate-300" : "text-slate-500"}`}>{item.number} / OBSERVATION</span>
                    <span className="mt-2 block text-sm font-semibold leading-snug">{item.title}</span>
                    <span className={`mt-1 block text-xs leading-relaxed ${selected ? "text-slate-300" : "text-slate-500"}`}>{item.prompt}</span>
                  </button>
                );
              })}
            </div>
            <div id="observation-detail" role="region" aria-live="polite" aria-label={`${active.title} considerations`} data-testid="panel-observation-detail" className="mt-3 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(250px,0.8fr)] lg:gap-8">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{active.title}</h3>
                  <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Consider</p>
                  <ul className="mt-2 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                    {active.considerations.map((point) => (
                      <li key={point} className="flex gap-2 text-sm leading-relaxed text-slate-700">
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  {active.note && <p className="mt-4 border-l-2 border-slate-300 pl-3 text-sm font-medium leading-relaxed text-slate-800">{active.note}</p>}
                </div>
                <div className="border-t border-slate-200 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Useful next step</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">{active.next}</p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                    {active.links.map((link) => (
                      <Link key={link.href} href={link.href} data-testid={`link-observation-${active.id}-${link.href.split("?")[0].slice(1)}`} className="text-sm font-semibold text-primary underline-offset-2 hover:underline focus-visible:underline">
                        {link.label} <span aria-hidden="true">↗</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="alternatives-heading" className="mb-10">
          <div id="alternatives-heading"><SectionHeading title="What else could explain it?" description="Work from measurement and assignment toward biological interpretation. A database gap is a reason to investigate, not a verdict." /></div>
          <div className="rounded-md border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">Unexpected observation <span className="mx-2 text-slate-400" aria-hidden="true">→</span> Test competing explanations <span className="mx-2 text-slate-400" aria-hidden="true">→</span> Calibrate the claim</p>
            </div>
            <ol className="grid divide-y divide-slate-200 md:grid-cols-2 md:divide-y-0 xl:grid-cols-5">
              {explanations.map((item, index) => (
                <li key={item.number} className={`p-4 sm:p-5 ${index > 0 ? "md:border-l border-slate-200" : ""} ${index === 2 || index === 4 ? "md:border-l-0 xl:border-l" : ""} ${index >= 2 ? "md:border-t xl:border-t-0 border-slate-200" : ""}`}>
                  <span className="font-mono text-xs font-semibold text-primary">{item.number}</span>
                  <h3 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="features-heading" className="mb-10">
          <div id="features-heading"><SectionHeading title="Less-common features to consider" description="Illustrative examples, not an exhaustive inventory or a list of validated assignments." /></div>
          <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Less-common glycan features, mammalian context, and interpretation considerations</caption>
              <thead className="bg-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                <tr>
                  <th scope="col" className="w-[27%] px-4 py-3">Feature</th>
                  <th scope="col" className="w-[30%] px-4 py-3">Mammalian context</th>
                  <th scope="col" className="px-4 py-3">Why it matters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {features.map(([feature, context, importance]) => (
                  <tr key={feature} className="align-top">
                    <th scope="row" className="px-4 py-2.5 font-semibold text-slate-800">{feature}</th>
                    <td className="px-4 py-2.5 text-slate-600">{context}</td>
                    <td className="px-4 py-2.5 text-slate-600">{importance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 border-l-2 border-slate-300 pl-3 text-sm leading-relaxed text-slate-600">
            <strong className="text-slate-800">Across organisms:</strong> Glycan features established in non-mammalian systems, such as additional substitution of fucose, should not automatically be considered impossible in vertebrate samples. An assignment not previously established in the relevant biological context requires correspondingly stronger evidence.
          </p>
        </section>

        <section aria-labelledby="evidence-heading" className="mb-10">
          <div id="evidence-heading"><SectionHeading title="Match the claim to the evidence" description="Report the narrowest claim the data support. Increasing specificity or novelty raises the evidentiary threshold." /></div>
          <ol className="overflow-hidden rounded-md border border-slate-200 bg-white divide-y divide-slate-200">
            {evidenceTiers.map((tier) => (
              <li key={tier.number} className="grid gap-2 px-4 py-3.5 sm:grid-cols-[2.5rem_minmax(160px,0.8fr)_minmax(0,1.3fr)] sm:items-start sm:gap-4 sm:px-5">
                <span className="font-mono text-xs font-semibold text-primary">{tier.number}</span>
                <h3 className="text-sm font-semibold text-slate-900">{tier.title}</h3>
                <div className="space-y-1 text-sm leading-relaxed text-slate-600">
                  <p><strong className="font-semibold text-slate-700">Evidence may support:</strong> {tier.support}</p>
                  <p><strong className="font-semibold text-slate-700">{tier.number === "04" ? "Requirement:" : "Keep in mind:"}</strong> {tier.limit}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="resources-heading" className="mb-10">
          <div id="resources-heading"><SectionHeading title="Didn't find it here? Broaden the search." /></div>
          <p className="mb-4 max-w-4xl text-sm leading-relaxed text-slate-600">
            GlycoMSGuide primarily focuses on mammalian glycomics and glycoproteomics. It is not a comprehensive catalog of glycoconjugates across all organisms. Broader or organism-specific resources can help establish whether similar chemistry has been reported elsewhere, but a matching database entry alone does not validate your sample assignment.
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {resourceCards.map((resource) => (
              <Link key={resource.name} href={resource.href} data-testid={`link-resource-${resource.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="group flex min-h-24 flex-col justify-between rounded-md border border-slate-200 bg-white p-4 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <span className="flex items-center justify-between gap-3 text-sm font-semibold text-primary">
                  {resource.name}<span className="text-slate-400 group-hover:text-primary" aria-hidden="true">↗</span>
                </span>
                <span className="mt-2 text-xs leading-relaxed text-slate-600">{resource.description}</span>
              </Link>
            ))}
          </div>
          <Link href="/resources" data-testid="link-all-resources" className="btn-outline mt-4 inline-flex text-sm">
            Explore all Resources &amp; Tools <span className="ml-2" aria-hidden="true">→</span>
          </Link>
        </section>

        <aside aria-labelledby="take-home-heading" className="rounded-md border border-slate-300 bg-slate-800 p-5 text-slate-100 sm:p-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">Take-home</p>
          <h2 id="take-home-heading" className="mt-1 text-lg font-bold tracking-tight text-white sm:text-xl">Do not use a database as a boundary for biology.</h2>
          <div className="mt-4 grid gap-4 border-t border-slate-600 pt-4 md:grid-cols-3 md:gap-6">
            <div><h3 className="text-sm font-semibold text-white">Found in a database</h3><p className="mt-1 text-xs leading-relaxed text-slate-300">Existing information can support interpretation, but presence alone does not validate an assignment.</p></div>
            <div><h3 className="text-sm font-semibold text-white">Not found in a database</h3><p className="mt-1 text-xs leading-relaxed text-slate-300">Absence does not establish that an observation is incorrect or biologically impossible.</p></div>
            <div><h3 className="text-sm font-semibold text-white">Unexpected observation</h3><p className="mt-1 text-xs leading-relaxed text-slate-300">Consider alternatives, then increase validation in proportion to the novelty of the claim.</p></div>
          </div>
        </aside>
      </main>
    </div>
  );
}