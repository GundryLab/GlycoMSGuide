import { Download, Github } from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { renderMzText } from "@/utils/renderMz";
import { REPO_URL } from "@/config/repository";

export default function Downloads() {
  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Downloads</h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Download the full diagnostic ion dataset for use in your own tools.
          </p>
        </div>

        <div className="tech-card p-6 bg-white">
          <h2 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
            Data for Developers
          </h2>
          <p className="text-sm text-slate-700 mb-5 leading-relaxed">
            The complete diagnostic ion dataset is available as a structured JSON
            file so you can use it directly in your own software and analysis
            tools. Each entry includes the {renderMzText("m/z")} value,
            composition, category, polarity, source citation, and associated
            GlyTouCan accessions. The file is regenerated on every build, so it
            always matches what you see on this site.
          </p>
          <a
            href={`${import.meta.env.BASE_URL}data/diagnostic-ions.json`}
            download="glycomsguide-diagnostic-ions.json"
            className="btn-primary inline-flex gap-2"
            data-testid="link-download-json"
          >
            <Download className="h-4 w-4" />
            Download dataset (JSON)
          </a>
          <p className="mt-3 text-xs leading-relaxed text-slate-600">
            Each ion includes its formula, charge and provenance: source-verified ions carry evidence records; calculated-composition ions carry a note on what has been checked. Withdrawn entries are listed separately (<code>withdrawn</code>) and are not shown on the site.
          </p>
          
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Stable URL for programmatic access
            </p>
            <pre className="overflow-x-auto rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800">
              <code>{`fetch("https://glycomsguide.net/data/diagnostic-ions.json")
  .then((r) => r.json())
  .then((data) => console.log(data.ions));`}</code>
            </pre>
          </div>
          
          <p className="text-xs text-slate-600 mt-4 leading-relaxed">
            <strong className="font-semibold text-slate-800">Free to use with attribution (CC BY 4.0):</strong> please cite the GlycoMSGuide companion
            publication and the original sources listed on the{" "}
            <a
              href={`${import.meta.env.BASE_URL}references`}
              className="text-primary hover:text-primary/80 hover:underline"
            >
              References
            </a>{" "}
            tab. A filtered CSV export is also available on the{" "}
            <a
              href={`${import.meta.env.BASE_URL}diagnostic-ions`}
              className="text-primary hover:text-primary/80 hover:underline"
            >
              Diagnostic Ions
            </a>{" "}
            tab.
          </p>
        </div>

        <section className="tech-card mt-6 bg-white p-6" aria-labelledby="github-repository-heading">
          <div className="mb-3 flex items-center gap-2">
            <Github className="h-5 w-5 text-slate-600" aria-hidden="true" />
            <h2 id="github-repository-heading" className="text-lg font-bold tracking-tight text-slate-900">
              Site source and data on GitHub
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-700">
            The website source files and supporting data are available in the GitHub repository.
          </p>
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-primary hover:underline">
            Source code and data on GitHub
          </a>
        </section>
      </div>
    </div>
  );
}
