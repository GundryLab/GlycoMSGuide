import { AppHeader } from "@/components/AppHeader";

export default function ScopeLimitations() {
  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-slate-900">
          Scope &amp; Limitations
        </h1>
        <div className="tech-card max-w-4xl space-y-5 bg-white p-5 sm:p-7 text-sm leading-7 text-slate-700">
          <p>
            GlycoMSGuide is a practical companion to the associated Review and is intended to support interpretation and reporting of mass spectrometry-based glycomics and glycoproteomics data. The resource is primarily focused on mammalian glycosylation, while selected non-mammalian examples and external resources are included when relevant to host–microbe, mixed-species, or broader biological studies.
          </p>
          <p>
            GlycoMSGuide is not intended to be an exhaustive catalog of glycans, monosaccharides, modifications, diagnostic ions, software, or analytical approaches. The absence of a structure, residue, modification, ion, or software tool from GlycoMSGuide should not be interpreted as evidence that it is invalid or cannot occur.
          </p>
          <p>
            Diagnostic ions and other analytical evidence are context dependent. Their interpretation can be influenced by sample preparation, derivatization, ionization, fragmentation method, instrument platform, acquisition settings, and other experimental conditions. Diagnostic ions should therefore be interpreted together with precursor information, complementary fragments, biological context, and orthogonal evidence where appropriate.
          </p>
          <p>
            Every <em>m/z</em> in the Diagnostic Ions list is calculated from an elemental formula. Most ions are also linked to at least one specific table, figure or page in a published source, showing the value and assignment as reported there; where guide text quotes a value as reported in a publication (often at lower precision), it is attributed to that source. Ions marked "Calculated composition" have been reviewed but not yet traced to a specific published observation; they are shown for completeness and are not used as evidence in the application guides or challenge cards.
          </p>
          <p>
            Biosynthetic plausibility should guide the level of validation required, not define what is biologically possible. Unexpected observations may reflect analytical artefacts, alternative structural assignments, contamination, or previously unrecognized biology and should be investigated accordingly.
          </p>
          <p>
            GlycoMSGuide provides guidance rather than prescriptive standard operating procedures. The appropriate experimental design, analytical workflow, software, and level of validation depend on the biological question and the level of structural information being claimed.
          </p>
          <p>
            GlycoMSGuide is a living resource. Content will evolve as new evidence, analytical approaches, software, and community feedback become available. Revision dates and the Revision History provide information about when substantive updates have been made.
          </p>
        </div>
      </main>
    </div>
  );
}