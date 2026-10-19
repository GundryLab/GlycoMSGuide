import { REPO_URL } from "@/config/repository";

export function AppFooter() {
  return (
    <footer className="bg-[#111827] md:pl-64">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-white/50">
        <p>GlycoMSGuide: A Practical Guide to Glycan MS/MS Interpretation</p>
        <p className="mt-1">
          © 2026 The GlycoMSGuide authors. Code:{" "}
          <a href={`${REPO_URL}/blob/main/LICENSE`} className="underline" target="_blank" rel="noopener noreferrer">MIT License</a>.
          {" "}Data:{" "}
          <a href="https://creativecommons.org/licenses/by/4.0/" className="underline" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>.
        </p>
      </div>
    </footer>
  );
}
