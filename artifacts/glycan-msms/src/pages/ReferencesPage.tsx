import { references } from "@/data/glycanData";
import { AppHeader } from "@/components/AppHeader";
import { renderMzText } from "@/utils/renderMz";

const snfgTitle = "Symbol nomenclature for graphical representations of glycans";

const sortedReferences = [
  ...references.map((ref) => ({
    ref,
    sortName: ref.authors.split(",")[0].trim().split(/\s+/)[0],
    year: ref.year,
    title: ref.title,
  })),
  { ref: null, sortName: "Varki", year: 2015, title: snfgTitle },
].sort(
  (a, b) =>
    a.sortName.localeCompare(b.sortName, undefined, { sensitivity: "base" }) ||
    a.year - b.year ||
    a.title.localeCompare(b.title),
);

export default function ReferencesPage() {
  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">References</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Publications and sources cited throughout the diagnostic ions and guides.
          </p>
        </div>
        
        <div className="tech-card p-6 bg-white">
          <div className="space-y-5">
            {sortedReferences.map(({ ref }) => (
              <div key={ref?.id ?? "snfg"} className="text-sm border-l-[3px] border-slate-200 pl-4 py-0.5 hover:border-primary transition-colors">
                {ref ? (
                  <>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {ref.authors}. {renderMzText(ref.title)}.{" "}
                      <em>{ref.journal}</em> <span className="font-semibold">{ref.year}</span>, {ref.volume}, {ref.pages.replace(/(\d)-(\d)/g, "$1–$2")}.
                    </p>
                    <div className="mt-1">
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 hover:underline text-[11px] font-mono tracking-wide"
                      >
                        DOI: {ref.doi}
                      </a>
                      {ref.id === "glycounter" && "ionListUrl" in ref && (
                        <div className="mt-1">
                          <a
                            href={ref.ionListUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 hover:underline text-xs"
                          >
                            GlyCounter default ion list (versioned)
                          </a>
                          <p className="text-xs text-slate-600 mt-1">
                            GlyCounter’s built-in search list at the cited commit. Being on this list does not show that an ion was observed; see each ion’s evidence. Labels in the list are not always consistent with the m/z (e.g. 964.3251 is labelled NeuGc₂ but corresponds to one Neu5Ac and one Neu5Gc).
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      Varki A, Cummings RD, Aebi M, et al. {snfgTitle}.{" "}
                      <em>Glycobiology</em> <span className="font-semibold">2015</span>, 25(12), 1323–1324.
                    </p>
                    <a
                      href="https://doi.org/10.1093/glycob/cwv091"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 hover:underline text-[11px] font-mono tracking-wide"
                    >
                      DOI: 10.1093/glycob/cwv091
                    </a>
                    <p className="mt-2 text-slate-800 leading-relaxed font-medium">
                      Update: Neelamegham S, Aoki-Kinoshita K, Bolton E, et al. Updates to the Symbol Nomenclature for Glycans guidelines.{" "}
                      <em>Glycobiology</em> <span className="font-semibold">2019</span>, 29(9), 620–624.
                    </p>
                    <a
                      href="https://doi.org/10.1093/glycob/cwz045"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 hover:underline text-[11px] font-mono tracking-wide"
                    >
                      DOI: 10.1093/glycob/cwz045
                    </a>
                    <div className="mt-1">
                      <a
                        href="https://www.ncbi.nlm.nih.gov/glycans/snfg.html"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 hover:underline text-[11px] font-mono tracking-wide"
                      >
                        NCBI SNFG Reference Page
                      </a>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
