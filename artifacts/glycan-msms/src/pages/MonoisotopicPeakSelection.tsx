import { Link } from "wouter";
import { AppHeader } from "@/components/AppHeader";
import { CompositionConfusions } from "@/components/CompositionConfusions";
import { references } from "@/data/glycanData";
import { renderMzText } from "@/utils/renderMz";
import offByOneCompositionFigure from "@/assets/off-by-one-composition-example.png";

const furtherReadingIds = ["polasky-multiattribute", "adams-ppmfixer", "ye-monoisotopic"];
const furtherReading = furtherReadingIds.map((id) => references.find((reference) => reference.id === id)!);
const adamsReference = furtherReading.find((reference) => reference.id === "adams-ppmfixer")!;

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 sm:mb-5">
      <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">{title}</h2>
      {description && <p className="mt-1 text-sm leading-relaxed text-slate-600">{description}</p>}
    </div>
  );
}

const envelopes = [
  { title: "Correct monoisotopic assignment", selected: 0, label: "M selected", description: "The lowest-mass isotopic peak belonging to the precursor envelope is correctly assigned as M." },
  { title: "+1 isotope selected", selected: 1, label: "M+1 selected", description: "The M+1 isotope is incorrectly selected as the monoisotopic precursor, shifting the inferred neutral mass by approximately +1.00335 Da." },
  { title: "+2 isotope selected", selected: 2, label: "M+2 selected", description: "The second isotope after M is selected instead." },
  { title: "Apparent M−1 / interfering signal", selected: -1, label: "Lower-mass signal", description: "A lower-mass signal may indicate interference, incorrect charge assignment, or that the selected peak is not the true monoisotopic precursor." },
] as const;

function IsotopeEnvelope({ selected, label }: { selected: number; label: string }) {
  const peaks = [
    { x: 50, height: 43, text: "M", index: 0 },
    { x: 103, height: 65, text: "M+1", index: 1 },
    { x: 156, height: 53, text: "M+2", index: 2 },
    { x: 209, height: 27, text: "M+3", index: 3 },
  ];
  return (
    <svg
      viewBox="0 0 250 124"
      className="h-auto w-full"
      role="img"
      aria-label={`Conceptual isotope envelope, not an experimental spectrum. ${label}.`}
    >
      <line x1="15" x2="235" y1="95" y2="95" stroke="#94a3b8" strokeWidth="1.5" />
      {selected === -1 && (
        <g>
          <line x1="23" x2="23" y1="95" y2="69" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
          <rect x="13" y="63" width="20" height="38" rx="3" fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="23" y="115" textAnchor="middle" fill="#334155" fontSize="10" fontFamily="monospace">M−1</text>
        </g>
      )}
      {peaks.map((peak) => {
        const isSelected = peak.index === selected;
        return (
          <g key={peak.text}>
            <line x1={peak.x} x2={peak.x} y1="95" y2={95 - peak.height} stroke={isSelected ? "#0f766e" : "#64748b"} strokeWidth="4" strokeLinecap="round" />
            {isSelected && <rect x={peak.x - 10} y={89 - peak.height} width="20" height={peak.height + 12} rx="3" fill="none" stroke="#0f766e" strokeWidth="1.5" strokeDasharray="3 2" />}
            <text x={peak.x} y="115" textAnchor="middle" fill="#334155" fontSize="10" fontFamily="monospace">{peak.text}</text>
          </g>
        );
      })}
    </svg>
  );
}

const recognition = [
  { title: "Inspect the full isotope envelope", text: "Inspect the complete precursor isotope envelope rather than relying on a single extracted m/z." },
  { title: "Confirm isotope spacing and charge", text: "Confirm that isotope spacing is consistent with the assigned precursor charge and that the observed isotope distribution is consistent with the proposed composition." },
  { title: "Look backward", text: "Check whether an earlier peak could represent the true monoisotopic precursor." },
  { title: "Compare observed and theoretical envelopes", text: "Determine whether the complete isotope distribution supports the proposed molecular formula." },
  { title: "Test isotope alternatives", text: "Ask whether a ±1 or ±2 isotope assignment produces another plausible composition, particularly when MS/MS evidence conflicts with the proposed assignment." },
  { title: "Require supporting evidence", text: "Use MS/MS, retention behavior, ion mobility, derivatization, enzymatic treatment, standards, or other orthogonal evidence appropriate to the claimed assignment." },
];

const contexts = [
  {
    title: "Released glycans",
    points: [
      "Inspect the complete precursor isotope envelope.",
      "Confirm expected M, M+1, M+2… behavior.",
      "Look for an apparent M−1 or other interfering signal.",
      "Verify the assigned charge state.",
      "Consider overlapping glycans or contaminating ions.",
      "Use MS/MS and retention behavior where available.",
    ],
  },
  {
    title: "Glycopeptides",
    points: [
      "The monoisotopic peak may not be the most intense isotope.",
      "Larger molecular size increases isotope-envelope complexity.",
      "Verify precursor charge and isotope assignment.",
      "Examine glycan-supporting fragment ions.",
      "Test plausible isotope alternatives when the proposed composition conflicts with MS/MS evidence.",
    ],
  },
];

const related = [
  { title: "Challenging Compositions", description: "Evaluate alternative compositions that may explain a measured mass.", href: "/challenges" },
  { title: "Diagnostic Ions", description: "Examine fragment-ion evidence for a proposed assignment.", href: "/diagnostic-ions" },
  { title: "Investigating Unexpected Observations", description: "Test competing analytical, structural, and biological explanations.", href: "/unexpected-observations" },
];

export default function MonoisotopicPeakSelection() {
  return (
    <div className="min-h-[100dvh] pt-14 md:pl-64 md:pt-0">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="mb-6 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Monoisotopic Peak Selection &amp; Off-by-One Errors</h1>
          <p className="mt-1 text-base font-medium text-slate-700">Recognizing precursor-selection errors that can lead to incorrect glycan and glycopeptide assignments</p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Correct assignment of the monoisotopic precursor is fundamental to glycan and glycopeptide identification. Selection of an isotope peak rather than the true monoisotopic peak can shift the inferred neutral mass and lead to an alternative composition that appears to be a good mass match. These errors may propagate through downstream identification and quantification if the full isotope envelope and supporting evidence are not evaluated.
          </p>
        </header>

        <section aria-labelledby="off-by-one-heading" className="mb-10">
          <div id="off-by-one-heading">
            <SectionHeading title="What is an off-by-one error?" description="An off-by-one error occurs when the M+1 isotope is incorrectly interpreted as the monoisotopic precursor. A lower-mass signal may have other causes and requires separate assessment." />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {envelopes.map((item, index) => (
              <figure key={item.title} className="rounded-md border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <figcaption className="text-sm font-semibold text-slate-900">{item.title}</figcaption>
                  <span className="shrink-0 font-mono text-[11px] text-slate-500">0{index + 1}</span>
                </div>
                <div className="mt-3 rounded border border-slate-200 bg-slate-50 px-2 py-2">
                  <IsotopeEnvelope selected={item.selected} label={item.label} />
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-700">{item.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.description}</p>
              </figure>
            ))}
          </div>
          <p className="mt-2 text-xs italic text-slate-500">Conceptual schematics only; these are not experimental spectra. Peak heights and spacing are illustrative, not measured data.</p>
          <div role="note" className="mt-5 border-l-[3px] border-primary bg-slate-100/80 px-4 py-3.5 sm:px-5">
            <p className="text-sm font-semibold leading-relaxed text-slate-900">{renderMzText("The isotope number and the observed m/z shift are not the same thing. A ~1 Da neutral-mass error corresponds to ~1 Th for z=1, ~0.5 Th for z=2, and ~0.33 Th for z=3.")}</p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-slate-600"><strong className="text-slate-800">Related terminology:</strong> isotope error, monoisotopic peak-selection error, off-by-X error.</p>
        </section>

        <section aria-labelledby="why-heading" className="mb-10">
          <div id="why-heading"><SectionHeading title="Why can the error look correct?" /></div>
          <ol className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr] md:items-stretch">
            {["Wrong isotope selected", "Incorrect neutral mass", "Alternative composition fits", "Low apparent mass error", "Potential false identification"].map((step, index) => (
              <li key={step} className="contents">
                <div className="flex min-h-16 items-center gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 md:flex-col md:items-start md:justify-between">
                  <span className="font-mono text-xs font-semibold text-primary">0{index + 1}</span>
                  <span className="text-sm font-semibold leading-snug text-slate-800">{step}</span>
                </div>
                {index < 4 && <span aria-hidden="true" className="px-3 text-center text-lg leading-none text-slate-500 md:self-center md:px-0"><span className="md:hidden">↓</span><span className="hidden md:inline">→</span></span>}
              </li>
            ))}
          </ol>
          <div role="note" className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm font-semibold leading-relaxed text-amber-950 sm:px-5">
            A low precursor mass error does not establish that the correct monoisotopic peak or composition was selected.
          </div>
          <div className="mt-5 rounded-md border border-slate-200 bg-white p-4 sm:p-5">
            <h3 className="text-sm font-bold text-slate-900">Example: Neu5Ac versus 2 Fuc</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">Some composition differences are close to the mass shift produced by an isotope-selection error. A well-described example is the relationship between one Neu5Ac residue and two Fuc residues. Two Fuc residues have a combined monoisotopic residue mass of 292.1158 Da, compared with 291.0954 Da for Neu5Ac, a difference of +1.0204 Da. This is close to the ~1.00335 Da mass shift associated with one ¹³C isotope. Incorrect monoisotopic peak assignment can therefore cause the alternative composition to appear to have a very small precursor mass error.</p>
            <p className="mt-2 text-xs text-slate-600">
              Source: <a href={adamsReference.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">Adams et al., ppmFixer (2024) ↗</a>
            </p>
            <figure className="mt-4">
              <a
                href={offByOneCompositionFigure}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the Neu5Ac versus two Fuc off-by-one error figure at full size"
                className="block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <img
                  src={offByOneCompositionFigure}
                  alt="Calculated neutral-mass example comparing HexNAc(4)Hex(5)Neu5Ac(1) with HexNAc(4)Hex(5)Fuc(2). Selecting the M+1 isotope-cluster centroid at 1932.6909 Da instead of the monoisotopic peak at 1931.6876 Da gives an apparent match within 8.9 ppm of the alternative composition at 1932.7080 Da. Structures are illustrative; isotope-envelope and MS/MS evidence are needed to distinguish the assignments."
                  width={3548}
                  height={1774}
                  loading="lazy"
                  className="h-auto w-full rounded-md border border-slate-200"
                />
              </a>
              <figcaption className="mt-2 text-xs text-slate-600">
                Calculated example of an off-by-one isotope-selection error. Simulated isotope envelopes for
                HexNAc(4)Hex(5)Neu5Ac(1) (C₇₃H₁₂₁N₅O₅₄; neutral monoisotopic mass 1931.6876 Da) and
                HexNAc(4)Hex(5)Fuc(2) (C₇₄H₁₂₄N₄O₅₄; 1932.7080 Da). Both are shown as neutral, underivatized
                glycans with a free reducing end. If the M+1 peak of the Neu5Ac-containing glycan (1932.6909 Da)
                is taken as monoisotopic, the inferred mass is 17.1 mDa (8.9 ppm) from the two-fucose
                composition. That falls inside a ±10 ppm search window. At this mass the monoisotopic peak is
                still the most intense (M+1 ≈ 84%). Masses were calculated from elemental formulas using exact
                atomic masses. Isotope distributions use natural (IUPAC) abundances of C, H, N and O and are
                plotted at isotope-cluster centroids. Structures are illustrative isomers; composition alone
                does not establish linkage or branching. Open the figure for a full-size view.
                Generated by scripts/figures/make_offbyone_figure.py.
              </figcaption>
            </figure>
          </div>
        </section>

        <section aria-labelledby="composition-heading" className="mb-10">
          <div id="composition-heading">
            <SectionHeading title="Composition changes that can mimic isotope errors" description="Some substitutions among monosaccharides or modifications produce mass differences close to one or more isotope shifts. As a result, incorrect monoisotopic peak selection can transform an incorrect composition into an apparently high-quality precursor mass match." />
          </div>
          <CompositionConfusions />
          <p className="mt-3 border-l-2 border-slate-300 pl-3 text-sm leading-relaxed text-slate-600">These relationships identify compositions that warrant additional scrutiny; they do not indicate that either composition is inherently incorrect.</p>
        </section>

        <section aria-labelledby="contexts-heading" className="mb-10">
          <div id="contexts-heading"><SectionHeading title="Where can these errors occur?" /></div>
          <div className="grid gap-3 md:grid-cols-2">
            {contexts.map((context, index) => (
              <div key={context.title} className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex items-baseline gap-3 border-b border-slate-200 pb-3">
                  <span className="font-mono text-xs font-semibold text-primary">0{index + 1}</span>
                  <h3 className="text-base font-semibold text-slate-900">{context.title}</h3>
                </div>
                <ul className="mt-4 space-y-2.5">
                  {context.points.map((point) => <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-slate-700"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" /><span>{point}</span></li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="recognize-heading" className="mb-10">
          <div id="recognize-heading"><SectionHeading title="How to recognize a possible peak-selection error" /></div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recognition.map((item, index) => (
              <li key={item.title} className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
                <span className="font-mono text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-2 text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{renderMzText(item.text)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="levels-heading" className="mb-10">
          <div id="levels-heading"><SectionHeading title="Three different problems: don't confuse them" /></div>
          <ol className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:items-stretch">
            {[
              ["Peak-selection error", "Did I select the correct monoisotopic precursor?"],
              ["Composition ambiguity", "Which composition explains the precursor mass?"],
              ["Structural ambiguity", "Which isomer, topology, or linkage is present?"],
            ].map(([title, question], index) => (
              <li key={title} className="contents">
                <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
                  <span className="font-mono text-xs font-semibold text-primary">0{index + 1} / LEVEL</span>
                  <h3 className="mt-2 text-sm font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{question}</p>
                </div>
                {index < 2 && <span aria-hidden="true" className="px-3 text-center text-lg leading-none text-slate-500 md:self-center md:px-0"><span className="md:hidden">↓</span><span className="hidden md:inline">→</span></span>}
              </li>
            ))}
          </ol>
          <p className="mt-4 border-l-2 border-slate-300 pl-3 text-sm leading-relaxed text-slate-600">Resolving one level does not necessarily resolve the next. Correct monoisotopic peak selection establishes the precursor mass; it does not by itself establish composition or structure.</p>
        </section>

        <section aria-labelledby="take-home-heading" className="mb-10 rounded-md border border-slate-300 bg-slate-800 p-5 text-slate-100 sm:p-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">Take-home message</p>
          <h2 id="take-home-heading" className="mt-1 text-lg font-bold tracking-tight text-white sm:text-xl">Correct precursor assignment requires more than a good ppm match.</h2>
          <p className="mt-3 border-t border-slate-600 pt-4 text-sm leading-relaxed text-slate-300">Evaluate the isotope envelope and charge state first. A small precursor mass error does not establish that the correct monoisotopic peak or composition was selected. Determine whether the proposed composition is also supported by MS/MS and other evidence appropriate to the level of structural assignment being reported.</p>
        </section>

        <section aria-labelledby="related-heading" className="mb-10">
          <div id="related-heading"><SectionHeading title="Related GlycoMSGuide resources" /></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((resource) => (
              <Link key={resource.href} href={resource.href} data-testid={`link-related-${resource.href.slice(1)}`} className="group flex min-h-28 flex-col justify-between rounded-md border border-slate-200 bg-white p-4 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <span className="flex items-start justify-between gap-3 text-sm font-semibold text-primary">{resource.title}<span aria-hidden="true" className="text-slate-500 group-hover:text-primary">↗</span></span>
                <span className="mt-3 text-xs leading-relaxed text-slate-600">{resource.description}</span>
              </Link>
            ))}
          </div>
        </section>

        <section aria-labelledby="references-heading" className="border-t border-slate-200 pt-5">
          <h2 id="references-heading" className="text-sm font-bold text-slate-900">References &amp; further reading</h2>
          <div className="mt-4 space-y-4">
            {furtherReading.map((reference) => (
              <div key={reference.id} className="border-l-[3px] border-slate-200 py-0.5 pl-4 text-sm">
                <p className="font-medium leading-relaxed text-slate-800">
                  {reference.authors}. {reference.title}.{" "}
                  <em>{reference.journal}</em> <span className="font-semibold">{reference.year}</span>, {reference.volume}, {reference.pages}.
                </p>
                <a href={reference.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-mono text-[11px] tracking-wide text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                  DOI: {reference.doi}
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}