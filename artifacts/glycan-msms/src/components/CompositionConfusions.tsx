import { useState } from "react";
import { Download, Search } from "lucide-react";
import {
  compositionConfusions,
  confusionCompositions,
  filterCompositionConfusions,
  formatIsotopeOffset,
  type OffsetMagnitude,
} from "@/data/compositionConfusions";

function CompositionLink({ index }: { index: number }) {
  const entry = confusionCompositions[index];
  return (
    <div>
      <span className="font-mono font-semibold text-slate-800">{entry.composition}</span>
      <a
        href={`https://glytoucan.org/Structures/Glycans/${entry.glytoucanId}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${entry.composition} on GlyTouCan, ${entry.glytoucanId}`}
        className="mt-1 block w-fit text-xs font-medium text-primary hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {entry.glytoucanId} ↗
      </a>
    </div>
  );
}

export function CompositionConfusions() {
  const [query, setQuery] = useState("");
  const [magnitude, setMagnitude] = useState<OffsetMagnitude>("all");
  const filtered = filterCompositionConfusions(query, magnitude);

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <h3 className="text-base font-bold text-slate-900">
          Human N-glycan composition confusions in glycan-first glycopeptide identification
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          In glycan-first glycopeptide identification, an incorrect isotope peak can be selected as
          monoisotopic for both the precursor in MS and the Y₀ or Y₁ ion in MS/MS. Because the glycan mass
          is inferred from the difference between the precursor and Y₀ (the peptide after loss of the entire
          glycan) or Y₁ (the peptide plus one HexNAc, which is then added back), its isotope offset depends
          on both selected peaks. One isotope step is the ¹³C–¹²C spacing, 1.00335 Da in neutral mass
          (1.00335/<em>z</em> in <em>m/z</em>).
          Selecting isotope indices 0, 1, or 2 at each stage can produce glycan-mass offsets
          from −2 to +2 isotope steps.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="overflow-x-auto rounded border border-slate-200">
            <table className="w-full text-center text-sm">
              <caption className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-semibold text-slate-700">
                Glycan isotope offset = precursor isotope index − Y₀/Y₁ isotope index
              </caption>
              <thead className="bg-slate-50 text-xs text-slate-600">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left">Y₀/Y₁ isotope index</th>
                  {[0, 1, 2].map((value) => <th key={value} scope="col" className="px-3 py-2">Precursor {value}</th>)}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((fragment) => (
                  <tr key={fragment} className="border-t border-slate-200">
                    <th scope="row" className="bg-slate-50 px-3 py-2 text-left font-medium text-slate-700">{fragment}</th>
                    {[0, 1, 2].map((precursor) => (
                      <td key={precursor} className="px-3 py-2 font-mono text-slate-800">{formatIsotopeOffset(precursor - fragment)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-l-2 border-slate-300 pl-4 text-sm leading-relaxed text-slate-600">
            <p>Index 0 denotes the monoisotopic peak; 1 and 2 denote M+1 and M+2.</p>
            <p className="mt-2">
              For example, precursor index 2 with Y₀/Y₁ index 0 gives +2; precursor index 0 with
              Y₀/Y₁ index 2 gives −2. Equal indices give 0 even if both peaks were selected incorrectly.
            </p>
            <p className="mt-2 font-medium text-slate-800">
              These integers are isotope offsets, not exact mass differences in Da.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Composition-confusion lookup</h3>
            <p className="mt-1 text-xs text-slate-600">
              {confusionCompositions.length} compositions · {compositionConfusions.length} distinct pairs · source workbook values
            </p>
          </div>
          <a
            href={`${import.meta.env.BASE_URL}data/glycan-first-isotope-confusions.xlsx`}
            download="glycan-first-isotope-confusions.xlsx"
            className="inline-flex w-fit items-center gap-2 rounded border border-slate-300 px-3 py-2 text-xs font-semibold text-primary hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Download original Excel table
          </a>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          The supplied lookup was calculated using{" "}
          <a href="https://github.com/Wessels-Lab" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Myriad software functions ↗</a>
          {" "}over a composition space of 1–25 monosaccharide residues: 1–7 HexNAc (N), 0–12 Hex (H),
          0–2 dHex (F), and 0–4 Neu5Ac (S). The {confusionCompositions.length} human N-glycan compositions
          listed here are taken from that space.
        </p>
        <p id="composition-lookup-help" className="mt-2 text-xs leading-relaxed text-slate-600">
          Each pair is shown once; self-comparisons are omitted. A − B reproduces the workbook cell
          for row A and column B; B − A is its reverse. If the true glycan is A, a glycan-mass offset
          equal to the B − A value makes it appear as B (and vice versa). The offsets are whole isotope
          steps; the real mass differences they stand in for are not exact multiples of 1.00335 Da
          (for example, 2 × dHex vs Neu5Ac differ by 1.0204 Da, 17 mDa from one step), so a narrow
          mass tolerance can reject some confusions. Across the 70 compositions, every listed pair lies within 46.7 mDa (19.7 ppm) of a whole number of isotope steps, and no unlisted pair falls within that window. A zero offset denotes a distinct composition
          pair with a small non-zero mass difference and no isotope-index difference, not identical exact masses.
          GlyTouCan identifiers are supplied for compositions and do not establish linkage or topology.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor="composition-confusion-search" className="mb-1 block text-xs font-semibold text-slate-700">
              Search either composition or GlyTouCan ID
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                id="composition-confusion-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="e.g. H4N3F0S1 or G12456LJ"
                aria-describedby="composition-lookup-help"
                className="w-full rounded border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          <div>
            <label htmlFor="composition-confusion-offset" className="mb-1 block text-xs font-semibold text-slate-700">Isotope offset magnitude</label>
            <select
              id="composition-confusion-offset"
              value={magnitude}
              onChange={(event) => setMagnitude(event.target.value as OffsetMagnitude)}
              className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">All offsets</option>
              <option value="0">0 isotope steps</option>
              <option value="1">±1 isotope step</option>
              <option value="2">±2 isotope steps</option>
            </select>
          </div>
        </div>
        <p className="my-3 text-xs text-slate-500" role="status" aria-live="polite">
          Showing {filtered.length} of {compositionConfusions.length} pairs
        </p>
        <div role="region" aria-label="Composition-confusion pairs, scroll to view more" tabIndex={0} className="max-h-[28rem] overflow-auto rounded border border-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <table className="w-full min-w-[560px] text-left text-sm">
            <caption className="sr-only">Composition pairs and signed isotope offsets from the supplied confusion table</caption>
            <thead className="sticky top-0 z-10 bg-slate-100 text-xs text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3">Composition A (row)</th>
                <th scope="col" className="px-4 py-3">Composition B (column)</th>
                <th scope="col" className="px-4 py-3 text-center">A − B</th>
                <th scope="col" className="px-4 py-3 text-center">B − A</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ row, column, offset }) => (
                <tr key={`${row}-${column}`} className="border-t border-slate-200 even:bg-slate-50/70">
                  <td className="px-4 py-3"><CompositionLink index={row} /></td>
                  <td className="px-4 py-3"><CompositionLink index={column} /></td>
                  <td className="px-4 py-3 text-center font-mono font-semibold text-slate-700">{formatIsotopeOffset(offset)}</td>
                  <td className="px-4 py-3 text-center font-mono font-semibold text-slate-700">{formatIsotopeOffset(-offset)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-600">No pairs match these filters. Try another composition, ID, or offset.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600">
          Calculated candidates within the supplied search space, not a catalogue of experimentally
          established human glycan structures. Absence from this lookup does not exclude other
          compositions or other sources of mass-assignment error.
        </p>
      </div>
    </div>
  );
}
