import { AppHeader } from "@/components/AppHeader";

const revisions = [
  {
    date: "2026-10",
    label: "October 2026",
    changes: [
      "Added licence information (code: MIT; data: CC BY 4.0) and linked the GitHub source repository",
      "Added a Glycan Drawing & Visualization section to Resources & Tools, with eight tools, website links, publication citations, and descriptions of 2D, fragment-annotation, and 3D capabilities",
      "Corrected the Hex-HexNAc oxonium ion to m/z 366.139 and the drawing-tool count, clarified a withdrawn-ion reason and the reported Ashwood et al. m/z values, and stated the composition-confusion mass window",
      "Added the author-supplied glycan-first composition-confusion lookup, with 70 compositions, 39 distinct comparison pairs, precursor and Y₀/Y₁ isotope-offset guidance, GlyTouCan links, and the original Excel table",
      "Corrected the SNFG purple to the official #A54399 (165/67/153), added the L-glycero-D-manno-heptose (LDmanHep) symbol, cited the 2015 and 2019 SNFG papers, and added tests that check every drawn residue against the official SNFG shapes and colours",
      "Corrected the biantennary N-glycan drawing in the Nomenclature Guide (an extra mannose had been drawn), placed the 6-arm on the right in the Getting Started oligomannose and hybrid drawings, and replaced an incorrect citation with Everest-Dass et al. 2013",
      "Reviewed guide and challenge text for accuracy: HexNAc fragment labels, polarity badges, sialyl Lewis fragment roles, reducing-end ion values, Lewis a/x negative-mode ions, adduct arithmetic, PEG cleanup, deamidation and paucimannose statements, and N-glycan class heuristics",
      "Corrected monosaccharide records: dideoxyhexose category for Tyv/Abe/Col, di-N-acetyl forms for Pse and Leg, Kdn and acetimidoyl mass notes, and the phosphocholine ion (m/z 184.0733)",
      "Corrected ion-card labels that disagreed with their formulas (the 964.3252 card now draws one Neu5Ac and one Neu5Gc; several negative-mode cross-ring and B/C-ion labels), and fixed reference metadata and citations, including the Harvey 2005 Part 3 DOI and two monosaccharide references",
      "Corrected software listings (PMIDs for pGlyco3, pGlycoQuant, GlycoWorkbench and GlycReSoft; GlycoDeNovo2; licences for GlycoHunter, Glyco-Decipher, GproDIA and pGlyco3) and resource details (MicroGlycoDB link, GlyGen Sandbox, MIRAGE, GNOme citation)",
      "The Mammalian filter on Monosaccharides & Modifications now includes broadly distributed residues such as Glc, Man, Gal, GlcNAc, GalNAc and Fuc",
      "Added the guide Distinguishing O-GlcNAc from O-GalNAc, based on the m/z 138/144 oxonium-ion ratio (Halim et al. 2014; Maynard & Chalkley 2021), and linked it from the N- vs O-glycopeptide guide and the O-GlcNAc vs O-GalNAc challenge card",
    ],
  },
  {
    date: "2026-09",
    label: "September 2026",
    changes: [
      "Expanded the diagnostic-ion reference to 156 visible ions: 120 source-verified with cited evidence and 36 clearly labelled calculated compositions",
      "Strengthened interpretation guides for blood-group, reducing-end, sulfation, Neu5Gc and other ion assignments, with clearer limits on what fragment evidence can establish",
      "Updated ion cards and downloadable JSON to make evidence and structural uncertainty easier to assess",
      "Added Monoisotopic Peak Selection & Off-by-One Errors, with isotope-envelope checks, composition-versus-structure guidance, references, and a link to Challenging Compositions",
      "Updated the Neu5Ac versus two Fuc example and replaced its illustration; clarified that the +1.0204 Da residue-mass difference is close to, but not identical to, the approximately 1.00335 Da carbon-13 isotope shift",
      "Revised Neu5Gc, ABO, LacdiNAc, oligomannose, and other ion guidance so composition evidence is not presented as proof of a motif, linkage, or biological type",
      "Standardized displayed Neu5Ac and Neu5Gc terminology and qualified method-dependent negative-mode claims",
      "Changed diagnostic-ion cards to show unconnected SNFG symbols when linkage and topology are not established",
      "Added the Monosaccharides & Modifications resource",
      "Revised the MS Software interface",
      "Added GlycoScape to the software listings",
      "Added Investigating Unexpected Observations and linked it from Getting Started and related interpretation guides",
      "Added Revision History to document substantive changes to the resource",
      "Explained how community suggestions and corrections are reviewed on a rolling basis",
      "Added content totals and last-updated dates to MS Software and Resources & Tools",
      "Corrected SNFG symbols for extended monosaccharides, including Rha and Abe",
      "Documented N- and O- prefix formatting and aligned site typography with nomenclature guidance",
      "Added a Scope & Limitations page clarifying the resource's coverage, evidence context, and intended use",
    ],
  },
];

export default function RevisionHistory() {
  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
          Revision History
        </h1>
        <div className="tech-card overflow-hidden bg-white">
          <div className="hidden border-b border-slate-200 bg-slate-50 px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-[12rem_1fr]">
            <span>Date</span>
            <span>What changed</span>
          </div>
          {revisions.map((revision) => (
            <section
              key={revision.date}
              className="border-b border-slate-200 px-5 py-5 last:border-b-0 sm:grid sm:grid-cols-[12rem_1fr] sm:gap-4"
            >
              <h2 className="mb-3 text-sm font-semibold text-slate-900 sm:mb-0">
                <time dateTime={revision.date}>{revision.label}</time>
              </h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-slate-700">
                {revision.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}