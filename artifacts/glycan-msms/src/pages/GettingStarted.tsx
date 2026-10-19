import { Link } from "wouter";
import { AppHeader } from "@/components/AppHeader";
import { MonosaccharideSymbol } from "@/components/SNFGSymbols";

function SectionCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="tech-card bg-white p-5 sm:p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{title}</h3>
      {children}
    </div>
  );
}

function Callout({ type, children }: { type: "tip" | "note" | "important"; children: React.ReactNode }) {
  const styles = {
    tip: "bg-green-50 border-green-200 text-green-800",
    note: "bg-blue-50 border-blue-200 text-blue-800",
    important: "bg-amber-50 border-amber-200 text-amber-800",
  };
  const labels = { tip: "Tip", note: "Note", important: "Important" };
  return (
    <div className={`rounded-lg border p-3 my-3 text-sm ${styles[type]}`}>
      <span className="font-semibold">{labels[type]}:</span> {children}
    </div>
  );
}

function AnnotatedSpectrumSection() {
  const priorityColors = {
    essential: { stroke: "#2563eb", fill: "#2563eb", label: "Essential", bg: "bg-blue-100 text-blue-800" },
    important: { stroke: "#7c3aed", fill: "#7c3aed", label: "Important", bg: "bg-purple-100 text-purple-800" },
    useful:    { stroke: "#d97706", fill: "#d97706", label: "Useful",    bg: "bg-amber-100 text-amber-800" },
    supporting:{ stroke: "#6b7280", fill: "#6b7280", label: "Supporting",bg: "bg-slate-100 text-slate-700" },
  };

  const peaks: { mz: number; shortLabel: string; priority: keyof typeof priorityColors; h: number; labelY?: number; labelAnchor?: string }[] = [
    { mz: 138.055, shortLabel: "HexNAc − CH₆O₃",          priority: "supporting", h: 18 },
    { mz: 163.060, shortLabel: "Hex⁺",               priority: "supporting", h: 14 },
    { mz: 168.066, shortLabel: "HexNAc − 2H₂O",        priority: "supporting", h: 16 },
    { mz: 186.076, shortLabel: "HexNAc − H₂O",            priority: "supporting", h: 22 },
    { mz: 204.087, shortLabel: "HexNAc⁺",                 priority: "essential",  h: 90 },
    { mz: 274.092, shortLabel: "Neu5Ac − H₂O",            priority: "important",  h: 60 },
    { mz: 292.103, shortLabel: "Neu5Ac⁺",                 priority: "important",  h: 45 },
    { mz: 366.139, shortLabel: "HexHexNAc⁺",              priority: "essential",  h: 65 },
    { mz: 512.197, shortLabel: "HexHexNAcdHex⁺",          priority: "useful",     h: 30 },
    { mz: 657.235, shortLabel: "Neu5AcHexHexNAc⁺",        priority: "important",  h: 42 },
  ];

  const svgW = 680;
  const svgH = 260;
  const baseY = 200;
  const axisY = baseY + 5;
  const plotLeft = 50;
  const plotRight = svgW - 30;
  const mzMin = 100;
  const mzMax = 750;

  const mzToX = (mz: number) => plotLeft + ((mz - mzMin) / (mzMax - mzMin)) * (plotRight - plotLeft);

  const labelledPeaks: { mz: number; shortLabel: string; priority: keyof typeof priorityColors; h: number; lx: number; ly: number; anchor: "start" | "middle" | "end" }[] = [];
  const mainPeaks = [204.087, 366.139, 274.092, 292.103, 657.235, 512.197, 138.055];
  for (const p of peaks) {
    if (!mainPeaks.includes(p.mz)) continue;
    const px = mzToX(p.mz);
    const peakTop = baseY - (p.h / 100) * (baseY - 30);
    let ly = peakTop - 18;
    let lx = px;
    let anchor: "start" | "middle" | "end" = "middle";
    if (p.mz === 138.055)  { lx = px + 4; ly = peakTop - 10; anchor = "start"; }
    if (p.mz === 274.092)  { lx = px - 4; anchor = "end"; }
    if (p.mz === 292.103)  { lx = px + 4; ly = peakTop - 30; anchor = "start"; }
    if (p.mz === 657.235)  { lx = px + 4; anchor = "start"; }
    labelledPeaks.push({ ...p, lx, ly, anchor });
  }

  return (
    <SectionCard title="Annotated Example Spectrum">
      <p className="text-sm text-slate-700 mb-3">
        Below is a schematic representation of what a typical glycan MS/MS spectrum looks like in <strong>positive ion mode</strong>.
        The most important diagnostic ions are labeled. Peak colors match the priority categories in the table below.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 overflow-x-auto">
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-3xl mx-auto" xmlns="http://www.w3.org/2000/svg">
          <text x={svgW / 2} y="14" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#374151">
            Schematic Glycan MS/MS Spectrum (Positive Mode)
          </text>

          <line x1={plotLeft} y1={axisY} x2={plotRight} y2={axisY} stroke="#333" strokeWidth="1.5" />
          <line x1={plotLeft} y1={axisY} x2={plotLeft} y2="22" stroke="#333" strokeWidth="1.5" />

          <text x={(plotLeft + plotRight) / 2} y={axisY + 20} textAnchor="middle" fontSize="10" fill="#333" fontWeight="bold" fontStyle="italic">m/z</text>
          <text x="14" y={(baseY + 22) / 2} textAnchor="middle" fontSize="9" fill="#333" fontWeight="bold" transform={`rotate(-90, 14, ${(baseY + 22) / 2})`}>
            Relative Intensity
          </text>

          {[200, 300, 400, 500, 600, 700].map((tick) => {
            const tx = mzToX(tick);
            return (
              <g key={tick}>
                <line x1={tx} y1={axisY} x2={tx} y2={axisY + 4} stroke="#333" strokeWidth="1" />
                <text x={tx} y={axisY + 14} textAnchor="middle" fontSize="9" fill="#666">{tick}</text>
              </g>
            );
          })}

          {peaks.map((p, i) => {
            const px = mzToX(p.mz);
            const peakH = (p.h / 100) * (baseY - 30);
            const c = priorityColors[p.priority];
            const isMain = mainPeaks.includes(p.mz);
            return (
              <g key={i}>
                <line x1={px} y1={baseY} x2={px} y2={baseY - peakH} stroke={c.stroke} strokeWidth={isMain ? 2 : 1.2} />
                {isMain && <circle cx={px} cy={baseY - peakH} r={2} fill={c.fill} />}
              </g>
            );
          })}

          {labelledPeaks.map((p, i) => {
            const px = mzToX(p.mz);
            const peakTop = baseY - (p.h / 100) * (baseY - 30);
            const c = priorityColors[p.priority];
            return (
              <g key={`label-${i}`}>
                <line x1={px} y1={peakTop - 3} x2={p.lx === px ? px : p.lx - (p.anchor === "start" ? -2 : 2)} y2={p.ly + 4} stroke={c.stroke} strokeWidth="0.5" strokeDasharray="2,1" />
                <text x={p.lx} y={p.ly} textAnchor={p.anchor} fontSize="8.5" fill={c.fill} fontWeight="600">
                  {p.shortLabel}
                </text>
                <text x={p.lx} y={p.ly - 10} textAnchor={p.anchor} fontSize="7.5" fill={c.fill} fontStyle="italic">
                  m/z {p.mz.toFixed(3)}
                </text>
              </g>
            );
          })}

          <g transform={`translate(${plotRight - 150}, 26)`}>
            {(Object.keys(priorityColors) as (keyof typeof priorityColors)[]).map((key, i) => {
              const c = priorityColors[key];
              return (
                <g key={key} transform={`translate(${i < 2 ? 0 : 80}, ${i % 2 === 0 ? 0 : 12})`}>
                  <line x1="0" y1="4" x2="12" y2="4" stroke={c.stroke} strokeWidth="2" />
                  <text x="15" y="7" fontSize="7" fill={c.fill}>{c.label}</text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Key peaks to look for</h4>
      <div className="overflow-x-auto mb-4">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-2 border border-slate-200 font-semibold"><em>m/z</em></th>
              <th className="text-left p-2 border border-slate-200 font-semibold">Ion</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">What it tells you</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">Priority</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-2 border border-slate-200 font-mono">204.087</td><td className="p-2 border border-slate-200">HexNAc⁺</td><td className="p-2 border border-slate-200">Supports HexNAc; not sufficient alone to assign a glycopeptide</td><td className="p-2 border border-slate-200"><span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-medium">Essential</span></td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-mono">366.139</td><td className="p-2 border border-slate-200">HexHexNAc⁺</td><td className="p-2 border border-slate-200">Hex-HexNAc fragment composition; a LacNAc or complex-type assignment needs more context</td><td className="p-2 border border-slate-200"><span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-xs font-medium">Essential</span></td></tr>
            <tr><td className="p-2 border border-slate-200 font-mono">274.092<br/>292.103</td><td className="p-2 border border-slate-200">Neu5Ac − H₂O<br/>Neu5Ac⁺</td><td className="p-2 border border-slate-200">Support Neu5Ac, but cannot alone place it on the assigned precursor; check precursor-associated evidence.</td><td className="p-2 border border-slate-200"><span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs font-medium">Important</span></td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-mono">657.235</td><td className="p-2 border border-slate-200">Neu5Ac-Hex-HexNAc⁺</td><td className="p-2 border border-slate-200">Supports a sialylated Hex-HexNAc fragment, not a unique linkage or antenna assignment</td><td className="p-2 border border-slate-200"><span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-xs font-medium">Important</span></td></tr>
            <tr><td className="p-2 border border-slate-200 font-mono">512.197</td><td className="p-2 border border-slate-200">HexHexNAc-dHex⁺</td><td className="p-2 border border-slate-200">Supports a fucosylated Hex-HexNAc fragment; does not alone establish a Lewis epitope</td><td className="p-2 border border-slate-200"><span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-xs font-medium">Useful</span></td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-mono">138.055</td><td className="p-2 border border-slate-200">HexNAc − CH₆O₃</td><td className="p-2 border border-slate-200">Secondary fragment of the HexNAc oxonium ion; its abundance relative to <em>m/z</em> 126 and 144 helps distinguish GlcNAc from GalNAc (Halim et al. 2014)</td><td className="p-2 border border-slate-200"><span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-xs font-medium">Supporting</span></td></tr>
          </tbody>
        </table>
      </div>

      <Callout type="tip">
        The <strong><em>m/z</em> 204.087</strong> (HexNAc oxonium ion) is the single most important peak for glycoproteomics.
        A prominent <em>m/z</em> 204.087 in an HCD spectrum strongly suggests a HexNAc-containing glycopeptide, although a
        co-isolated glycopeptide can also contribute. Many glycoproteomics workflows use this and other oxonium ions to
        trigger additional scans (e.g. oxonium-ion-triggered EThcD) or to filter spectra before searching.
      </Callout>

      <Callout type="note">
        In <strong>negative ion mode</strong>, the diagnostic ions are different. You will see deprotonated species and
        cross-ring fragments become more prominent, while oxonium ions (which are positively charged) are absent.
        The Diagnostic Ions tab covers both modes in detail.
      </Callout>
    </SectionCard>
  );
}

function InterpretationFlowchartSection() {
  const steps = [
    {
      number: "1",
      title: "Is it a glycopeptide?",
      color: "bg-blue-50 border-blue-200",
      content: (
        <>
          <p className="text-sm text-slate-700 mb-2">Look for the <strong><em>m/z</em> 204.087</strong> (HexNAc oxonium ion) in the MS/MS spectrum.</p>
          <div className="flex gap-4 text-sm">
            <div className="flex-1 bg-green-50 rounded p-2 border border-green-200">
              <strong className="text-green-700">Yes → Present prominently</strong>
              <p className="text-xs text-green-700 mt-1">Supports a HexNAc-containing glycopeptide; confirm with Y ions and the precursor mass. Continue to step 2.</p>
            </div>
            <div className="flex-1 bg-red-50 rounded p-2 border border-red-200">
              <strong className="text-red-700">No → Absent or very weak</strong>
              <p className="text-xs text-red-700 mt-1">Probably not N-glycosylated or mucin-type O-glycosylated. O-Man, O-Fuc and O-Glc glycans can lack HexNAc, so check for Hex (<em>m/z</em> 163.06) and other oxonium ions before ruling out glycosylation.</p>
            </div>
          </div>
        </>
      ),
    },
    {
      number: "2",
      title: "What type of glycan?",
      color: "bg-indigo-50 border-indigo-200",
      content: (
        <>
          <p className="text-sm text-slate-700 mb-2">Check for <strong><em>m/z</em> 366.139</strong> (HexHexNAc) to distinguish glycan classes:</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
            <div className="bg-white rounded p-2 border border-slate-200">
              <strong className="text-slate-800">366.14 present</strong>
              <p className="text-xs text-slate-600 mt-1">Hex-HexNAc unit: a complex/hybrid antenna (e.g. LacNAc) or a core 1 O-glycan (Gal-GalNAc)</p>
            </div>
            <div className="bg-white rounded p-2 border border-slate-200">
              <strong className="text-slate-800">366.14 absent; Hex ions (163.06, 325.11) present</strong>
              <p className="text-xs text-slate-600 mt-1">Possibly oligomannose (no Gal-GlcNAc units); check for Y ions with successive −162 Da losses</p>
            </div>
            <div className="bg-white rounded p-2 border border-slate-200">
              <strong className="text-slate-800">Only 204.09 + its fragments (126, 138, 144, 168, 186)</strong>
              <p className="text-xs text-slate-600 mt-1">May be a single HexNAc (Tn antigen or O-GlcNAc) or a HexNAc-only O-glycan (core 3/4; check <em>m/z</em> 407.166); the (138 + 168)/(126 + 144) ratio and the Y₁ ion help decide</p>
            </div>
          </div>
        </>
      ),
    },
    {
      number: "3",
      title: "Is it sialylated?",
      color: "bg-purple-50 border-purple-200",
      content: (
        <>
          <p className="text-sm text-slate-700 mb-2">Look for sialic acid markers:</p>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse w-full">
              <tbody>
                <tr><td className="p-2 border border-slate-200 font-mono w-24">274.092</td><td className="p-2 border border-slate-200">Neu5Ac − H₂O → usually the most abundant sialic acid marker</td></tr>
                <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-mono">292.103</td><td className="p-2 border border-slate-200">Neu5Ac oxonium → supports Neu5Ac; check precursor association</td></tr>
                <tr><td className="p-2 border border-slate-200 font-mono">657.235</td><td className="p-2 border border-slate-200">Neu5Ac-Hex-HexNAc → sialylated antenna (e.g. sialyl-LacNAc) or sialylated core 1/core 2 O-glycan</td></tr>
              </tbody>
            </table>
          </div>
        </>
      ),
    },
    {
      number: "4",
      title: "Is it fucosylated?",
      color: "bg-red-50 border-red-200",
      content: (
        <>
          <p className="text-sm text-slate-700 mb-2">Check for fucose-containing fragments:</p>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse w-full">
              <tbody>
                <tr><td className="p-2 border border-slate-200 font-mono w-24">512.197</td><td className="p-2 border border-slate-200">Hex-HexNAc-dHex → outer-arm fucose (Lewis or H epitopes); fucose migration can create false positives</td></tr>
                <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-mono">350.145</td><td className="p-2 border border-slate-200">Fuc-HexNAc, observed for both core and antenna fucosylation; <strong>not specific</strong> to core fucose</td></tr>
              </tbody>
            </table>
          </div>
          <Callout type="tip">
            The <em>m/z</em> 512.20 (Fuc-Hex-HexNAc) oxonium ion suggests outer-arm (Lewis- or H-type) fucosylation, subject to fucose-migration caveats. Core fucosylation cannot be diagnosed from oxonium ions alone; it is identified through Y-ion shifts (e.g., Y₁ at peptide + GlcNAc + Fuc vs Y₁ at peptide + GlcNAc).
          </Callout>
        </>
      ),
    },
    {
      number: "5",
      title: "Determine the composition",
      color: "bg-green-50 border-green-200",
      content: (
        <>
          <p className="text-sm text-slate-700 mb-2">Use the <strong>Y-ion series</strong> (sequential sugar losses from the precursor) to count monosaccharides:</p>
          <div className="overflow-x-auto">
            <table className="text-sm border-collapse w-full">
              <thead>
                <tr className="bg-slate-50">
                  <th className="text-left p-2 border border-slate-200 font-semibold">Loss (Da)</th>
                  <th className="text-left p-2 border border-slate-200 font-semibold">Sugar lost</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2 border border-slate-200 font-mono">−162.053</td><td className="p-2 border border-slate-200">Hex (mannose, galactose, or glucose)</td></tr>
                <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-mono">−203.079</td><td className="p-2 border border-slate-200">HexNAc (GlcNAc or GalNAc)</td></tr>
                <tr><td className="p-2 border border-slate-200 font-mono">−146.058</td><td className="p-2 border border-slate-200">dHex (fucose)</td></tr>
                <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-mono">−291.095</td><td className="p-2 border border-slate-200">Neu5Ac (sialic acid)</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-600 mt-2">Count each successive loss from the precursor ion to build the full composition.</p>
        </>
      ),
    },
  ];

  return (
    <SectionCard title="Step-by-Step Interpretation Flowchart">
      <p className="text-sm text-slate-700 mb-4">
        Follow this decision tree when you encounter a new MS/MS spectrum that might contain a glycopeptide.
        Each step builds on the previous one to narrow down the glycan identity.
      </p>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.number} className={`rounded-lg border p-4 ${step.color}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-7 h-7 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center text-sm font-bold text-slate-700">
                {step.number}
              </span>
              <h4 className="font-semibold text-sm text-slate-800">{step.title}</h4>
            </div>
            {step.content}
          </div>
        ))}
      </div>

      <Callout type="important">
        This flowchart covers the most common positive-mode HCD scenario. Negative-mode spectra, ECD/ETD spectra,
        and unusual glycan types (e.g., GAGs, GPI anchors) require additional expertise.
        Always cross-reference with the <strong>Diagnostic Ions</strong> table for the complete list of diagnostic peaks.
      </Callout>
    </SectionCard>
  );
}

function GlycanClassesSection() {
  return (
    <SectionCard title={<>Common N-Glycan Classes</>}>
      <p className="text-sm text-slate-700 mb-4">
        N-glycans are classified into three main types based on which sugars extend beyond the conserved core.
        Recognizing these classes is one of the first skills in glycan interpretation, since each class produces
        a characteristic pattern of diagnostic ions.
      </p>

      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0">
              <svg width={200} height={180} viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Man9GlcNAc2, 6-arm on the right">
                {/* Mirrored so the α1-6 arm is drawn on the right, as in the Nomenclature Guide */}
                <g transform="matrix(-1 0 0 1 200 0)">
                {/* Chitobiose core: GlcNAc-GlcNAc */}
                <MonosaccharideSymbol name="GlcNAc" x={100} y={165} size={18} showLabel={false} />
                <line x1={100} y1={155} x2={100} y2={140} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="GlcNAc" x={100} y={135} size={18} showLabel={false} />
                {/* β-Man (trimannosyl core) */}
                <line x1={100} y1={125} x2={100} y2={112} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={100} y={107} size={18} showLabel={false} />
                {/* Branch into 6-arm (branched) and 3-arm (linear); the group is mirrored so the 6-arm renders on the right */}
                <line x1={93} y1={100} x2={60} y2={85} stroke="#555" strokeWidth={1.2} />
                <line x1={107} y1={100} x2={140} y2={85} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={55} y={80} size={18} showLabel={false} />
                <MonosaccharideSymbol name="Man" x={145} y={80} size={18} showLabel={false} />
                {/* 6-arm: α1-6 Man branches into two α1-3 / α1-6 sub-arms, each terminating in α1-2 Man */}
                <line x1={55} y1={70} x2={40} y2={55} stroke="#555" strokeWidth={1.2} />
                <line x1={55} y1={70} x2={70} y2={55} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={35} y={50} size={18} showLabel={false} />
                <MonosaccharideSymbol name="Man" x={75} y={50} size={18} showLabel={false} />
                <line x1={35} y1={40} x2={35} y2={28} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={35} y={24} size={18} showLabel={false} />
                <line x1={75} y1={40} x2={75} y2={28} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={75} y={24} size={18} showLabel={false} />
                {/* 3-arm: linear chain α1-3 Man → α1-2 Man → α1-2 Man */}
                <line x1={145} y1={70} x2={145} y2={58} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={145} y={52} size={18} showLabel={false} />
                <line x1={145} y1={42} x2={145} y2={28} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={145} y={24} size={18} showLabel={false} />
                </g>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 mb-1">Oligomannose <span className="font-normal text-xs text-slate-600">(formerly "high-mannose")</span></h4>
              <p className="text-sm text-slate-700 mb-2">
                Contains only mannose residues beyond the core. Named Man₅ through Man₉ based on the total number of mannoses.
                The example shown is Man₉GlcNAc₂. <em>Oligomannose</em> is the preferred term in the current Essentials of Glycobiology nomenclature; older literature calls these "high-mannose" glycans.
              </p>
              <div className="text-sm text-slate-600 mb-2">
                <strong>Composition:</strong> HexNAc(2)Hex(5–9)
              </div>
              <div className="text-sm mb-2">
                <strong className="text-slate-700">Key diagnostic clues:</strong>
                <ul className="list-disc ml-4 mt-1 text-slate-600 space-y-0.5">
                  <li><em>m/z</em> 204.087 (HexNAc) present but <em>m/z</em> 366.14 (LacNAc) <strong>absent</strong></li>
                  <li>Y-ion series shows only −162 Da (Hex) losses after the chitobiose core</li>
                  <li>Precursor mass matches HexNAc(2)Hex(n) formula</li>
                </ul>
              </div>
              <div className="text-xs text-slate-600">Common in: ER-resident proteins, viral glycoproteins. Insect cell expression often yields paucimannosidic (Man₂–₃GlcNAc₂) structures alongside oligomannose forms.</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0">
              <svg width={200} height={200} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <MonosaccharideSymbol name="GlcNAc" x={100} y={185} size={18} showLabel={false} />
                <line x1={100} y1={175} x2={100} y2={162} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="GlcNAc" x={100} y={155} size={18} showLabel={false} />
                <line x1={100} y1={145} x2={100} y2={132} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={100} y={127} size={18} showLabel={false} />
                <line x1={93} y1={120} x2={50} y2={100} stroke="#555" strokeWidth={1.2} />
                <line x1={107} y1={120} x2={150} y2={100} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={45} y={95} size={18} showLabel={false} />
                <MonosaccharideSymbol name="Man" x={155} y={95} size={18} showLabel={false} />
                <line x1={45} y1={85} x2={45} y2={72} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="GlcNAc" x={45} y={67} size={18} showLabel={false} />
                <line x1={45} y1={57} x2={45} y2={45} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Gal" x={45} y={40} size={18} showLabel={false} />
                <line x1={45} y1={30} x2={45} y2={22} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Neu5Ac" x={45} y={18} size={14} showLabel={false} />
                <line x1={155} y1={85} x2={155} y2={72} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="GlcNAc" x={155} y={67} size={18} showLabel={false} />
                <line x1={155} y1={57} x2={155} y2={45} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Gal" x={155} y={40} size={18} showLabel={false} />
                <line x1={155} y1={30} x2={155} y2={22} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Neu5Ac" x={155} y={18} size={14} showLabel={false} />
                <line x1={100} y1={185} x2={130} y2={185} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Fuc" x={138} y={185} size={14} showLabel={false} />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 mb-1">Complex</h4>
              <p className="text-sm text-slate-700 mb-2">
                Has antennae initiated by GlcNAc on both core mannoses, typically extended to LacNAc (Galβ1-4GlcNAc) and often capped with sialic acid
                and/or fucose. Biantennary (2 arms) is most common; tri- and tetra-antennary also occur.
              </p>
              <div className="text-sm text-slate-600 mb-2">
                <strong>Composition example:</strong> HexNAc(4)Hex(5)Fuc(1)Neu5Ac(2): e.g. a disialylated biantennary glycan with one fucose (typically core)
              </div>
              <div className="text-sm mb-2">
                <strong className="text-slate-700">Key diagnostic clues:</strong>
                <ul className="list-disc ml-4 mt-1 text-slate-600 space-y-0.5">
                  <li><em>m/z</em> 366.14 (Hex-HexNAc) <strong>present</strong>: consistent with galactosylated complex or hybrid antennae</li>
                  <li><em>m/z</em> 292.10 (Neu5Ac) if sialylated</li>
                  <li><em>m/z</em> 512.20 (Fuc-Hex-HexNAc) suggests outer-arm fucosylation (subject to fucose-migration caveats); core fucosylation is identified via Y-ion shifts (e.g., Y₁ + Fuc vs Y₁), not a unique oxonium ion</li>
                  <li>Y-ion series shows alternating −203 (HexNAc) and −162 (Hex) losses from antenna disassembly; if sialylated, −291 (Neu5Ac) loss typically appears first</li>
                </ul>
              </div>
              <div className="text-xs text-slate-600">Common in: serum proteins (IgG, transferrin), membrane glycoproteins, secreted proteins</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-shrink-0">
              <svg width={200} height={180} viewBox="0 0 200 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Hybrid N-glycan, oligomannose 6-arm on the right">
                {/* Mirrored so the α1-6 (oligomannose) arm is drawn on the right */}
                <g transform="matrix(-1 0 0 1 200 0)">
                <MonosaccharideSymbol name="GlcNAc" x={100} y={165} size={18} showLabel={false} />
                <line x1={100} y1={155} x2={100} y2={140} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="GlcNAc" x={100} y={135} size={18} showLabel={false} />
                <line x1={100} y1={125} x2={100} y2={112} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={100} y={107} size={18} showLabel={false} />
                <line x1={93} y1={100} x2={55} y2={82} stroke="#555" strokeWidth={1.2} />
                <line x1={107} y1={100} x2={145} y2={82} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={50} y={78} size={18} showLabel={false} />
                <MonosaccharideSymbol name="Man" x={150} y={78} size={18} showLabel={false} />
                <line x1={50} y1={68} x2={35} y2={52} stroke="#555" strokeWidth={1.2} />
                <line x1={50} y1={68} x2={65} y2={52} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Man" x={30} y={48} size={18} showLabel={false} />
                <MonosaccharideSymbol name="Man" x={70} y={48} size={18} showLabel={false} />
                <line x1={150} y1={68} x2={150} y2={55} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="GlcNAc" x={150} y={50} size={18} showLabel={false} />
                <line x1={150} y1={40} x2={150} y2={28} stroke="#555" strokeWidth={1.2} />
                <MonosaccharideSymbol name="Gal" x={150} y={24} size={18} showLabel={false} />
                </g>
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 mb-1">Hybrid</h4>
              <p className="text-sm text-slate-700 mb-2">
                One arm retains mannose residues (like oligomannose), while the other has a processed LacNAc antenna
                (like complex). These result from incomplete Golgi processing (α-mannosidase II has not acted) and are less common than the other two types, but can be stable end-products on specific glycoproteins.
              </p>
              <div className="text-sm text-slate-600 mb-2">
                <strong>Composition example:</strong> HexNAc(3)Hex(5) for the simplest hybrid; Hex(6) if the complex arm is galactosylated. Bisected hybrids can have HexNAc(4).
              </div>
              <div className="text-sm mb-2">
                <strong className="text-slate-700">Key diagnostic clues:</strong>
                <ul className="list-disc ml-4 mt-1 text-slate-600 space-y-0.5">
                  <li><em>m/z</em> 366.14 (LacNAc) present: from the complex arm</li>
                  <li>More Hex residues than expected for fully complex type (elevated Hex:HexNAc ratio)</li>
                  <li>HexNAc(3) can suggest hybrid, but is not definitive: monoantennary complex glycans also have HexNAc(3), and bisected hybrids have HexNAc(4)</li>
                </ul>
              </div>
              <div className="text-xs text-slate-600">Common in: some recombinant proteins, cells with processing enzyme deficiencies</div>
            </div>
          </div>
        </div>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mt-6 mb-3">Quick comparison</h4>
      <div className="overflow-x-auto mb-4">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-2 border border-slate-200 font-semibold">Feature</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">Oligomannose</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">Complex</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">Hybrid</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-2 border border-slate-200 font-medium"><em>m/z</em> 366 (LacNAc)</td><td className="p-2 border border-slate-200 text-red-600">Absent</td><td className="p-2 border border-slate-200 text-green-600 font-medium">Present</td><td className="p-2 border border-slate-200 text-green-600 font-medium">Present</td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-medium">Sialic acid possible</td><td className="p-2 border border-slate-200 text-red-600">No</td><td className="p-2 border border-slate-200 text-green-600">Yes</td><td className="p-2 border border-slate-200 text-green-600">Yes (one arm)</td></tr>
            <tr><td className="p-2 border border-slate-200 font-medium">Fucose possible</td><td className="p-2 border border-slate-200 text-red-600">Essentially absent (FUT8 requires prior GnT-I action); fucosylated paucimannose is a separate truncated class</td><td className="p-2 border border-slate-200 text-green-600">Core + antenna</td><td className="p-2 border border-slate-200 text-green-600">Core + antenna</td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-medium">HexNAc count</td><td className="p-2 border border-slate-200">2</td><td className="p-2 border border-slate-200">3+ (4 biantennary; 5 triantennary or bisected)<sup>*</sup></td><td className="p-2 border border-slate-200">3 (4 if bisected)<sup>*</sup></td></tr>
            <tr><td className="p-2 border border-slate-200 font-medium">Hex count</td><td className="p-2 border border-slate-200">5–9</td><td className="p-2 border border-slate-200">3–7 typical (more with poly-LacNAc)</td><td className="p-2 border border-slate-200">4–6 typical</td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-medium">Where found</td><td className="p-2 border border-slate-200">ER-resident proteins, viral glycoproteins</td><td className="p-2 border border-slate-200">Serum, secreted proteins</td><td className="p-2 border border-slate-200">Some recombinant proteins, enzyme-deficient cells</td></tr>
          </tbody>
        </table>
        <p className="text-xs text-slate-600 mt-2">
          <sup>*</sup> HexNAc count alone does not assign a class: monoantennary complex glycans also have HexNAc(3),
          bisected hybrids have HexNAc(4), and triantennary complex glycans have an odd count (5). Always
          combine with diagnostic-ion evidence (e.g., presence/absence of <em>m/z</em> 366.14) before assigning a class.
        </p>
      </div>

      <Callout type="note">
        All three types share the same <strong>trimannosyl core</strong>: Man₃GlcNAc₂ (two GlcNAc + three Man).
        The differences are in what extends beyond this core. The core is always: GlcNAc-GlcNAc-Man with two Man branches.
        Core fucosylation is most commonly associated with processed N-glycans, but it should not be treated as categorically incompatible with oligomannose or paucimannose structures.
      </Callout>
    </SectionCard>
  );
}

function OGlycanCoreCard({
  title,
  alias,
  description,
  children,
}: {
  title: React.ReactNode;
  alias?: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col items-center text-center">
      <div className="h-[120px] flex items-end justify-center mb-2">{children}</div>
      <h5 className="font-semibold text-sm text-slate-800">
        {title}
        {alias ? <span className="font-normal text-xs text-slate-600"> ({alias})</span> : null}
      </h5>
      <p className="text-xs text-slate-600 mt-1">{description}</p>
    </div>
  );
}

function OGlycanSection() {
  return (
    <SectionCard title={<>O-Glycans: A Different Core</>}>
      <p className="text-sm text-slate-700 mb-4">
        <strong>Mucin-type O-glycans</strong> are the most abundant and best-studied class of O-glycosylation
        in mammals. They take their name from mucins, the large, heavily glycosylated proteins that form protective gels on
        mucosal surfaces, but the same modification is found on many other secreted and cell-surface glycoproteins. They are
        defined by an initiating <strong>GalNAc</strong> attached through an α-linkage to the hydroxyl group of a serine or
        threonine residue (the Tn antigen), which is then elaborated into a small set of characteristic core structures.
      </p>
      <p className="text-sm text-slate-700 mb-4">
        Unlike N-glycans, mucin-type O-glycans are not built on a single conserved core and follow no
        consensus sequon. A single <strong>GalNAc</strong> is added directly (α-linked) to the hydroxyl group of a
        <strong> serine or threonine</strong>, and the chain is then extended into one of several small "cores." This is
        the key difference a newcomer needs to recognize: an N-glycan always starts with the same large
        chitobiose + trimannosyl core on an asparagine, while an O-glycan starts with a lone GalNAc on Ser/Thr.
      </p>

      {/* Side-by-side core comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-slate-800 mb-1 text-center">N-Glycan core</h4>
          <p className="text-xs text-slate-600 mb-2 text-center">GlcNAc β-linked to <strong>Asn</strong> in an N-X-S/T sequon</p>
          <div className="flex justify-center">
            <svg width={200} height={170} viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg">
              {/* Asn attachment */}
              <text x={100} y={162} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#374151">Asn</text>
              <line x1={100} y1={150} x2={100} y2={138} stroke="#555" strokeWidth={1.2} />
              {/* Chitobiose */}
              <MonosaccharideSymbol name="GlcNAc" x={100} y={133} size={18} showLabel={false} />
              <line x1={100} y1={123} x2={100} y2={110} stroke="#555" strokeWidth={1.2} />
              <MonosaccharideSymbol name="GlcNAc" x={100} y={105} size={18} showLabel={false} />
              {/* β-Man */}
              <line x1={100} y1={95} x2={100} y2={82} stroke="#555" strokeWidth={1.2} />
              <MonosaccharideSymbol name="Man" x={100} y={77} size={18} showLabel={false} />
              {/* Two Man branches */}
              <line x1={93} y1={70} x2={60} y2={52} stroke="#555" strokeWidth={1.2} />
              <line x1={107} y1={70} x2={140} y2={52} stroke="#555" strokeWidth={1.2} />
              <MonosaccharideSymbol name="Man" x={55} y={48} size={18} showLabel={false} />
              <MonosaccharideSymbol name="Man" x={145} y={48} size={18} showLabel={false} />
            </svg>
          </div>
          <p className="text-xs text-slate-600 mt-1 text-center">Shared trimannosyl core: Man₃GlcNAc₂</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-slate-800 mb-1 text-center">O-Glycan core</h4>
          <p className="text-xs text-slate-600 mb-2 text-center">GalNAc α-linked to <strong>Ser / Thr</strong>: no sequon</p>
          <div className="flex justify-center">
            <svg width={200} height={170} viewBox="0 0 200 170" xmlns="http://www.w3.org/2000/svg">
              {/* Ser/Thr attachment */}
              <text x={100} y={162} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#374151">Ser / Thr</text>
              <line x1={100} y1={150} x2={100} y2={120} stroke="#555" strokeWidth={1.2} />
              {/* Single GalNAc (Tn) */}
              <MonosaccharideSymbol name="GalNAc" x={100} y={113} size={18} showLabel={false} />
              {/* Optional Gal to show Core 1 extension */}
              <line x1={100} y1={103} x2={100} y2={90} stroke="#555" strokeWidth={1.2} />
              <MonosaccharideSymbol name="Gal" x={100} y={85} size={18} showLabel={false} />
            </svg>
          </div>
          <p className="text-xs text-slate-600 mt-1 text-center">Starts as a single GalNAc; here extended to Core 1 (Gal-GalNAc)</p>
        </div>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mb-3">Common mucin-type O-glycan cores</h4>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <OGlycanCoreCard
          title="Tn antigen"
          alias="GalNAc only"
          description={<>A single GalNAc on Ser/Thr. The starting point for all mucin-type O-glycans.</>}
        >
          <svg width={70} height={110} viewBox="0 0 70 110" xmlns="http://www.w3.org/2000/svg">
            <text x={35} y={104} textAnchor="middle" fontSize="9" fill="#374151">Ser/Thr</text>
            <line x1={35} y1={93} x2={35} y2={62} stroke="#555" strokeWidth={1.2} />
            <MonosaccharideSymbol name="GalNAc" x={35} y={55} size={18} showLabel={false} />
          </svg>
        </OGlycanCoreCard>

        <OGlycanCoreCard
          title="Sialyl-Tn"
          alias="STn"
          description={<>Neu5Acα2-6GalNAcα1-Ser/Thr. A common tumor-associated antigen.</>}
        >
          <svg width={70} height={110} viewBox="0 0 70 110" xmlns="http://www.w3.org/2000/svg">
            <text x={35} y={104} textAnchor="middle" fontSize="9" fill="#374151">Ser/Thr</text>
            <line x1={35} y1={93} x2={35} y2={75} stroke="#555" strokeWidth={1.2} />
            <MonosaccharideSymbol name="GalNAc" x={35} y={68} size={18} showLabel={false} />
            <line x1={35} y1={58} x2={35} y2={44} stroke="#555" strokeWidth={1.2} />
            <MonosaccharideSymbol name="Neu5Ac" x={35} y={38} size={14} showLabel={false} />
          </svg>
        </OGlycanCoreCard>

        <OGlycanCoreCard
          title="Core 1"
          alias="T antigen"
          description={<>Galβ1-3GalNAcα1-Ser/Thr. One of the most common O-glycan cores in humans.</>}
        >
          <svg width={70} height={110} viewBox="0 0 70 110" xmlns="http://www.w3.org/2000/svg">
            <text x={35} y={104} textAnchor="middle" fontSize="9" fill="#374151">Ser/Thr</text>
            <line x1={35} y1={93} x2={35} y2={75} stroke="#555" strokeWidth={1.2} />
            <MonosaccharideSymbol name="GalNAc" x={35} y={68} size={18} showLabel={false} />
            <line x1={35} y1={58} x2={35} y2={45} stroke="#555" strokeWidth={1.2} />
            <MonosaccharideSymbol name="Gal" x={35} y={40} size={18} showLabel={false} />
          </svg>
        </OGlycanCoreCard>

        <OGlycanCoreCard
          title="Core 2"
          description={<>Core 1 with GlcNAcβ1-6 added to the GalNAc, allowing two extended antennae.</>}
        >
          <svg width={80} height={110} viewBox="0 0 80 110" xmlns="http://www.w3.org/2000/svg">
            <text x={40} y={104} textAnchor="middle" fontSize="9" fill="#374151">Ser/Thr</text>
            <line x1={40} y1={93} x2={40} y2={78} stroke="#555" strokeWidth={1.2} />
            <MonosaccharideSymbol name="GalNAc" x={40} y={71} size={18} showLabel={false} />
            <line x1={33} y1={64} x2={20} y2={48} stroke="#555" strokeWidth={1.2} />
            <line x1={47} y1={64} x2={60} y2={48} stroke="#555" strokeWidth={1.2} />
            <MonosaccharideSymbol name="Gal" x={18} y={42} size={18} showLabel={false} />
            <MonosaccharideSymbol name="GlcNAc" x={62} y={42} size={18} showLabel={false} />
          </svg>
        </OGlycanCoreCard>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mt-6 mb-3">N- vs O-glycan at a glance</h4>
      <div className="overflow-x-auto mb-4">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-2 border border-slate-200 font-semibold">Feature</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">N-glycan</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">O-glycan (mucin-type)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-2 border border-slate-200 font-medium">Attachment residue</td><td className="p-2 border border-slate-200">Asparagine (Asn)</td><td className="p-2 border border-slate-200">Serine / Threonine (Ser/Thr)</td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-medium">First sugar</td><td className="p-2 border border-slate-200">GlcNAc (β-linked)</td><td className="p-2 border border-slate-200">GalNAc (α-linked)</td></tr>
            <tr><td className="p-2 border border-slate-200 font-medium">Consensus sequon</td><td className="p-2 border border-slate-200">Yes: N-X-S/T (X ≠ Pro)</td><td className="p-2 border border-slate-200 text-red-600">No defined sequon</td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-medium">Conserved core</td><td className="p-2 border border-slate-200">Man₃GlcNAc₂ (shared by all)</td><td className="p-2 border border-slate-200">Cores 1–8 (cores 1–4 most common)</td></tr>
            <tr><td className="p-2 border border-slate-200 font-medium">Mannose present</td><td className="p-2 border border-slate-200 text-green-600">Yes</td><td className="p-2 border border-slate-200 text-red-600">No</td></tr>
          </tbody>
        </table>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mt-6 mb-2">Not all O-glycans are the same: mucin-type vs O-GlcNAc</h4>
      <p className="text-sm text-slate-700 mb-3">
        The term "O-glycosylation" covers several distinct modifications. The most common confusion is between
        <strong> mucin-type O-glycans</strong> and <strong>O-GlcNAc</strong>. Despite both attaching a
        HexNAc to a Ser/Thr hydroxyl, they are biologically and structurally unrelated: different enzymes, different
        sugars, different compartments, and very different functions.
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left p-2 border border-slate-200 font-semibold">Feature</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">O-GlcNAc</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">Mucin-type O-glycan</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-2 border border-slate-200 font-medium">First sugar linked</td><td className="p-2 border border-slate-200"><em>N-</em>acetylglucosamine (GlcNAc)</td><td className="p-2 border border-slate-200"><em>N-</em>acetylgalactosamine (GalNAc)</td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-medium">Cellular location</td><td className="p-2 border border-slate-200">Cytoplasm, nucleus, mitochondria</td><td className="p-2 border border-slate-200">Golgi, secreted extracellularly, cell surface</td></tr>
            <tr><td className="p-2 border border-slate-200 font-medium">Structure size</td><td className="p-2 border border-slate-200">A single GlcNAc (intracellular O-GlcNAc is not extended; extracellular EOGT-type O-GlcNAc can be)</td><td className="p-2 border border-slate-200">Complex, elongated, branched chains</td></tr>
            <tr className="bg-slate-50"><td className="p-2 border border-slate-200 font-medium">Function</td><td className="p-2 border border-slate-200">Signaling, metabolic sensor (like phosphorylation)</td><td className="p-2 border border-slate-200">Diverse: protein conformation and stability, protection from proteolysis, recognition (e.g. selectin ligands), mucosal barrier and hydration</td></tr>
            <tr><td className="p-2 border border-slate-200 font-medium">Reversibility</td><td className="p-2 border border-slate-200">Highly dynamic (rapidly added and removed)</td><td className="p-2 border border-slate-200">Generally stable; not cycled on and off like O-GlcNAc</td></tr>
          </tbody>
        </table>
      </div>

      <Callout type="note">
        In MS/MS, both glycan types give the <strong><em>m/z</em> 204.087</strong> HexNAc oxonium ion, but their
        building blocks differ. O-glycans lack the mannose ladder of N-glycans; instead look for a
        Gal-GalNAc (HexHexNAc, <em>m/z</em> 366.14) Core 1 signature, sialyl-Tn (Neu5Ac-GalNAc), and a Y₁ ion
        corresponding to peptide + a single HexNAc. Because there is no sequon, site localization on Ser/Thr usually
        requires electron-based fragmentation (ETD/EThcD).
      </Callout>
    </SectionCard>
  );
}

export default function GettingStarted() {
  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Getting Started with Glycan MS/MS</h2>
          <p className="text-sm text-slate-600">
            New to glycoproteomics or glycomics data? Start here. This section introduces the key concepts you need to read
            and interpret glycan fragmentation spectra.
          </p>
        </div>
        <div className="space-y-6">
          <GlycanClassesSection />
          <OGlycanSection />
          <AnnotatedSpectrumSection />
          <InterpretationFlowchartSection />
        </div>
        <section className="tech-card mt-6 border-l-2 border-l-primary bg-slate-50 p-5" aria-labelledby="unexpected-observations-guide">
          <h3 id="unexpected-observations-guide" className="text-base font-bold text-slate-900">
            When an observation does not fit
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            An unfamiliar mass, fragment, glycosylation site, or biological context is a reason to investigate,
            not to discard an assignment. The{" "}
            <Link href="/unexpected-observations" className="font-semibold text-primary hover:underline">
              Investigating Unexpected Observations
            </Link>{" "}
            guide helps you check analytical and structural alternatives, consider less-common features, and match
            the strength of a claim to its supporting evidence.
          </p>
        </section>
        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-5 text-center">
          <p className="text-sm text-slate-700 mb-2">
            Now that you know the major glycan classes and key diagnostic ions, learn how glycan structures are named and drawn.
          </p>
          <Link href="/nomenclature" className="inline-flex items-center gap-1.5 text-indigo-700 font-medium text-sm hover:text-indigo-900 transition-colors">
            Continue to Nomenclature Guide →
          </Link>
        </div>
      </div>
    </div>
  );
}
