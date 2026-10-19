import type { ComponentType } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  ChevronRight,
  CircleHelp,
  Download,
  FlaskConical,
  Gauge,
  History,
  Library,
  MessageSquarePlus,
  Microscope,
  Settings2,
  SlidersHorizontal,
  Tags,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";

type Section = "core" | "interpretation" | "practice";

type DirectoryEntry = {
  title: string;
  path: string;
  description: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  section: Section;
};

const directoryEntries: DirectoryEntry[] = [
  {
    title: "Getting Started",
    path: "/getting-started",
    description: "A short route from spectrum to confident interpretation.",
    icon: BookOpen,
    section: "core",
  },
  {
    title: "Nomenclature Guide",
    path: "/nomenclature",
    description: "SNFG, composition names, IUPAC condensed notation, and drawings.",
    icon: Tags,
    section: "core",
  },
  {
    title: "Monosaccharides & Modifications",
    path: "/monosaccharides-modifications",
    description: "Reference masses, residue abbreviations, and common modifications.",
    icon: FlaskConical,
    section: "core",
  },
  {
    title: "Diagnostic Ions",
    path: "/diagnostic-ions",
    description: "Exact m/z, structures, assignments, and evidence for interpretation.",
    icon: Gauge,
    section: "interpretation",
  },
  {
    title: "Diagnostic Ions by Experimental Goal",
    path: "/applications",
    description: "Start with the biological question, then follow mapped ion evidence.",
    icon: Microscope,
    section: "interpretation",
  },
  {
    title: "Challenging Compositions",
    path: "/challenges",
    description: "Isobaric confusions and practical strategies to separate them.",
    icon: SlidersHorizontal,
    section: "interpretation",
  },
  {
    title: "Investigating Unexpected Observations",
    path: "/unexpected-observations",
    description: "Evaluate surprising assignments and match the claim to the evidence.",
    icon: CircleHelp,
    section: "interpretation",
  },
  {
    title: "MS Software",
    path: "/software",
    description: "Curated tools for annotation, quantification, and visualization.",
    icon: Settings2,
    section: "practice",
  },
  {
    title: "Resources & Tools",
    path: "/resources",
    description: "Databases, standards, prediction tools, and reporting guidance.",
    icon: Library,
    section: "practice",
  },
  {
    title: "References",
    path: "/references",
    description: "Primary sources, direct DOIs, and evidence mapped to this guide.",
    icon: BookOpen,
    section: "practice",
  },
  {
    title: "Downloads",
    path: "/downloads",
    description: "Tables, structures, and review-ready reference material.",
    icon: Download,
    section: "practice",
  },
  {
    title: "Revision History",
    path: "/revision-history",
    description: "Dated summaries of changes to the guide.",
    icon: History,
    section: "practice",
  },
  {
    title: "Suggestions",
    path: "/suggestions",
    description: "Suggest a software tool, resource, or diagnostic ion.",
    icon: MessageSquarePlus,
    section: "practice",
  },
];

const sectionLabels: Record<Section, string> = {
  core: "01 / orient",
  interpretation: "02 / interpret",
  practice: "03 / apply & cite",
};

function DirectoryRow({ entry }: { entry: DirectoryEntry }) {
  const Icon = entry.icon;

  return (
    <Link
      href={entry.path}
      className="group grid grid-cols-[2rem_minmax(0,1fr)_0.875rem] items-center gap-3 border-b border-slate-200/80 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-sky-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
    >
      <span className="flex h-7 w-7 items-center justify-center border border-slate-200 bg-slate-50 text-slate-500 transition-colors group-hover:border-sky-300 group-hover:bg-white group-hover:text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-semibold leading-4 tracking-[-0.01em] text-slate-800 transition-colors group-hover:text-primary">
          {entry.title}
        </span>
        <span className="mt-0.5 hidden text-[11px] leading-4 text-slate-500 sm:block">
          {entry.description}
        </span>
      </span>
      <ChevronRight className="h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden />
    </Link>
  );
}

export default function Welcome() {
  return (
    <div className="min-h-screen bg-[#f4f7f9] md:pl-64 pt-14 md:pt-0">
      <AppHeader />

      <main>
        <section className="border-b border-sidebar-border bg-sidebar">
          <div className="max-w-6xl mx-auto px-4 py-7 sm:px-6 md:py-8 lg:px-8">
            <h1 className="max-w-5xl text-2xl font-bold tracking-tight text-white md:text-3xl">
              A Practical Guide to N- and O-Glycan and Glycopeptide MS/MS Interpretation
            </h1>
            <p className="mt-3 max-w-5xl text-sm font-medium leading-6 text-slate-300">
              A companion resource for glycan and glycopeptide MS/MS spectrum interpretation, organized for beginners and experienced glycoproteomics researchers. This accompanies the publication “Community-Developed Best Practices for Mass Spectrometry-Based Mammalian N- and O-linked Glycomics and Glycoproteomics Analysis and Reporting,” from Dagstuhl Seminars 21271, 23301, and 25351.
            </p>
            <div className="mt-3 border-l-2 border-sky-400/60 pl-4 text-sm leading-6 text-slate-300">
              <strong className="font-semibold text-white">The Review and its online companion:</strong>{" "}
              The Review captures community-developed recommendations current at the time of publication. GlycoMSGuide provides an evolving home for practical resources, examples, software tools, and interpretation guidance that can be updated as new evidence and approaches emerge, serving as a curated reference to support interpretation and reporting rather than an exhaustive catalog.
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-lg font-semibold tracking-[-0.02em] text-slate-900">
            Select a reference area
          </h2>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {(["core", "interpretation", "practice"] as const).map((section) => {
              const entries = directoryEntries.filter((entry) => entry.section === section);
              if (!entries.length) return null;

              return (
                <div
                  key={section}
                  className="overflow-hidden border border-slate-300 bg-white shadow-[0_2px_8px_rgb(15_23_42/0.06)]"
                >
                  <div className="border-b border-slate-200 bg-[#f8fafb] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    {sectionLabels[section]}
                  </div>
                  {entries.map((entry) => (
                    <DirectoryRow key={entry.path} entry={entry} />
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}