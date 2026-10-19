import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import glycoMSGuideLogo from "@/assets/glycomsguide-logo.png";
import { FeedbackButton } from "@/components/FeedbackButton";

export function AppHeader() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const tabs = [
    { path: "/", label: "Welcome" },
    { path: "/getting-started", label: "Getting Started" },
    { path: "/nomenclature", label: "Nomenclature Guide" },
    { path: "/monosaccharides-modifications", label: "Monosaccharides & Modifications" },
    { path: "/diagnostic-ions", label: "Diagnostic Ions" },
    {
      path: "/applications",
      label: "Diagnostic Ions by Experimental Goal",
    },
    { path: "/challenges", label: "Challenging Compositions" },
    { path: "/monoisotopic-peak-selection", label: "Monoisotopic Peak Selection & Off-by-One Errors" },
    { path: "/unexpected-observations", label: "Investigating Unexpected Observations" },
    { path: "/software", label: "MS Software" },
    { path: "/resources", label: "Resources & Tools" },
    { path: "/references", label: "References" },
    { path: "/downloads", label: "Downloads" },
    { path: "/revision-history", label: "Revision History" },
    { path: "/scope-limitations", label: "Scope & Limitations" },
    {
      path: "/suggestions",
      label: "Suggest a software tool, resource, or diagnostic ion",
    },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 bg-sidebar px-4 h-14 border-b border-sidebar-border shadow-sm">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          aria-controls="app-sidebar-nav"
          className="text-sidebar-foreground/70 hover:text-sidebar-foreground p-1 -ml-1 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/" className="block overflow-hidden">
          <img
            src={glycoMSGuideLogo}
            alt="GlycoMSGuide"
            className="h-9 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Vertical sidebar navigation */}
      <aside
        id="app-sidebar-nav"
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden transition-transform duration-200 border-r border-sidebar-border ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="px-4 py-4 border-b border-sidebar-border flex items-start justify-between bg-sidebar/50">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="block flex-1 overflow-hidden"
          >
            <img
              src={glycoMSGuideLogo}
              alt="GlycoMSGuide"
              className="h-auto w-full object-contain"
            />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation menu"
            className="md:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground p-1 -mr-1 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {tabs.map((tab) => {
            const isActive = tab.path === "/" ? location === "/" : location.startsWith(tab.path);
            return (
              <Link
                key={tab.path}
                href={tab.path}
                onClick={() => setOpen(false)}
                className={`block rounded-md px-3 py-2 text-sm font-medium border-l-2 transition-all ${
                  isActive
                    ? "border-primary bg-sidebar-accent text-sidebar-accent-foreground"
                    : "border-transparent text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 hover:border-sidebar-foreground/20"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
          <FeedbackButton />
        </div>
      </aside>
    </>
  );
}
