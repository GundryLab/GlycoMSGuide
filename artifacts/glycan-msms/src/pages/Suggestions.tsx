import { AppHeader } from "@/components/AppHeader";
import { FeedbackForm } from "@/components/FeedbackForm";

export default function Suggestions() {
  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Suggest a software tool, resource, or diagnostic ion
          </h1>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Help keep GlycoMSGuide current by sharing a tool, resource, diagnostic
            ion, correction, or other useful observation.
          </p>
        </div>

        <section aria-labelledby="curation-heading" className="tech-card mb-6 border-l-2 border-l-primary bg-slate-50 p-5">
          <h2 id="curation-heading" className="text-sm font-semibold text-slate-900">
            How suggestions are reviewed
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            A designated group of glycoscience stakeholders will oversee its ongoing curation, maintenance, and evolution.
            Proposed additions will be evaluated for relevance to the scope of the resource and for supporting
            documentation or evidence. Community-submitted suggestions and corrections will be reviewed on a
            rolling basis, with updates made as warranted by new evidence, software, and analytical approaches.
            Users can submit feedback, suggest additions, or request corrections through a dedicated page
            accessible from the main navigation or through a persistent feedback button available throughout
            the site. Revision dates are provided for curated datasets and software entries to indicate
            when content was last updated. In addition, a Revision History page documents substantive
            changes to the resource over time, providing a transparent record of additions, updates,
            and revisions.
          </p>
        </section>

        <div className="tech-card p-6 bg-white">
          <FeedbackForm />
        </div>
      </div>
    </div>
  );
}
