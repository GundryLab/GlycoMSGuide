import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { MonosaccharideSymbol, SNFG_COLORS } from "@/components/SNFGSymbols";

type Section = "snfg" | "composition" | "structure" | "reading" | "fragments" | "examples" | "glossary";

const sectionLabels: { id: Section; label: string }[] = [
  { id: "snfg", label: "SNFG Symbols" },
  { id: "composition", label: "Composition Naming" },
  { id: "structure", label: "Structure Naming" },
  { id: "reading", label: "Reading a Drawing" },
  { id: "examples", label: "Worked Examples" },
  { id: "fragments", label: "Fragment Types" },
  { id: "glossary", label: "Quick Reference" },
];

function SymbolDemo({ name, fullName, shape, color, colorHex }: {
  name: string; fullName: React.ReactNode; shape: string; color: string; colorHex: string;
}) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
      <svg width="36" height="36" viewBox="-18 -18 36 36">
        <MonosaccharideSymbol name={name} x={0} y={0} size={26} showLabel={false} />
      </svg>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-slate-900">{name}</div>
        <div className="text-xs text-slate-600">{fullName}</div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-slate-600">{shape}</span>
          <span className="text-xs text-slate-600">/</span>
          <span className="inline-block w-3 h-3 rounded-sm border border-gray-300" style={{ backgroundColor: colorHex }} />
          <span className="text-xs text-slate-600">{color}</span>
        </div>
      </div>
    </div>
  );
}

function InlineSym({ name, size = 18 }: { name: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox={`${-size/2} ${-size/2} ${size} ${size}`} className="inline-block align-middle mx-0.5">
      <MonosaccharideSymbol name={name} x={0} y={0} size={size - 2} showLabel={false} />
    </svg>
  );
}

function StructureDiagram({ monosaccharides, labels, linkages, title, vertical }: {
  monosaccharides: string[];
  labels?: string[];
  linkages?: string[];
  title?: React.ReactNode;
  vertical?: boolean;
}) {
  if (vertical) {
    const symSize = 24;
    const spacing = 50;
    const w = 160;
    const h = monosaccharides.length * spacing + 30;
    const cx = w / 2;
    const startY = 20;
    return (
      <div className="flex flex-col items-center">
        {title && <div className="text-sm font-medium text-slate-600 mb-1">{title}</div>}
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
          {monosaccharides.map((_, i) => {
            if (i < monosaccharides.length - 1) {
              const y1 = startY + i * spacing + symSize / 2;
              const y2 = startY + (i + 1) * spacing - symSize / 2;
              return (
                <g key={`link-${i}`}>
                  <line x1={cx} y1={y1} x2={cx} y2={y2} stroke="#555" strokeWidth={1.5} />
                  {linkages && linkages[i] && (
                    <text x={cx + 18} y={(y1 + y2) / 2 + 3} fontSize="11" fill="#666" fontFamily="sans-serif">
                      {linkages[i]}
                    </text>
                  )}
                </g>
              );
            }
            return null;
          })}
          {monosaccharides.map((mono, i) => {
            const y = startY + i * spacing;
            return (
              <g key={`sym-${i}`}>
                <MonosaccharideSymbol name={mono} x={cx} y={y} size={symSize} showLabel={false} />
                {labels && labels[i] && (
                  <text x={cx - 22} y={y + 4} textAnchor="end" fontSize="11" fill="#333" fontFamily="sans-serif">
                    {labels[i]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  const symSize = 24;
  const spacing = 55;
  const totalWidth = monosaccharides.length * spacing + 30;
  const h = 90;
  const startX = 25;
  const cy = 22;
  const lastX = startX + (monosaccharides.length - 1) * spacing;
  return (
    <div className="flex flex-col items-center">
      {title && <div className="text-sm font-medium text-slate-600 mb-1">{title}</div>}
      <svg width={totalWidth} height={h} viewBox={`0 0 ${totalWidth} ${h}`}>
        {monosaccharides.map((_, i) => {
          if (i < monosaccharides.length - 1) {
            const x1 = startX + i * spacing + symSize / 2;
            const x2 = startX + (i + 1) * spacing - symSize / 2;
            return (
              <g key={`link-${i}`}>
                <line x1={x1} y1={cy} x2={x2} y2={cy} stroke="#555" strokeWidth={1.5} />
                {linkages && linkages[i] && (
                  <text x={(x1 + x2) / 2} y={cy - 8} textAnchor="middle" fontSize="11" fill="#666" fontFamily="sans-serif">
                    {linkages[i]}
                  </text>
                )}
              </g>
            );
          }
          return null;
        })}
        {monosaccharides.map((mono, i) => {
          const x = startX + i * spacing;
          return (
            <g key={`sym-${i}`}>
              <MonosaccharideSymbol name={mono} x={x} y={cy} size={symSize} showLabel={true} />
            </g>
          );
        })}
        <text x={2} y={h - 4} fontSize="10" fill="#999" fontFamily="sans-serif" textAnchor="start">
          non-reducing
        </text>
        <text x={lastX} y={h - 4} fontSize="10" fill="#0369a1" fontFamily="sans-serif" textAnchor="middle" fontWeight="bold">
          reducing end
        </text>
        <line x1={startX + 35} y1={h - 8} x2={lastX - 35} y2={h - 8} stroke="#ccc" strokeWidth={0.5} markerEnd="url(#arrowRight)" />
      </svg>
    </div>
  );
}

function BranchedNGlycanCore() {
  const w = 360;
  const h = 270;
  const symSize = 24;

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-medium text-slate-600 mb-1">Complex-type N-glycan (biantennary)</div>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        <line x1={170} y1={235} x2={170} y2={200} stroke="#555" strokeWidth={1.5} />
        <text x={182} y={220} fontSize="11" fill="#666">{"β1-4"}</text>
        <MonosaccharideSymbol name="GlcNAc" x={170} y={240} size={symSize} showLabel={false} />
        <text x={200} y={243} fontSize="11" fill="#333">GlcNAc-1</text>

        <line x1={170} y1={180} x2={170} y2={150} stroke="#555" strokeWidth={1.5} />
        <text x={182} y={168} fontSize="11" fill="#666">{"β1-4"}</text>
        <MonosaccharideSymbol name="GlcNAc" x={170} y={190} size={symSize} showLabel={false} />
        <text x={200} y={193} fontSize="11" fill="#333">GlcNAc-2</text>

        <line x1={170} y1={140} x2={100} y2={90} stroke="#555" strokeWidth={1.5} />
        <text x={136} y={128} fontSize="11" fill="#666" textAnchor="end">{"α1-3"}</text>
        <line x1={170} y1={140} x2={240} y2={90} stroke="#555" strokeWidth={1.5} />
        <text x={204} y={128} fontSize="11" fill="#666">{"α1-6"}</text>
        <MonosaccharideSymbol name="Man" x={170} y={140} size={symSize} showLabel={false} />
        <text x={200} y={146} fontSize="11" fill="#333">{"Man-3 (β)"}</text>

        <MonosaccharideSymbol name="Man" x={100} y={90} size={symSize} showLabel={false} />
        <text x={84} y={94} fontSize="11" fill="#333" textAnchor="end">{"α1-3 arm"}</text>
        <MonosaccharideSymbol name="Man" x={240} y={90} size={symSize} showLabel={false} />
        <text x={256} y={94} fontSize="11" fill="#333">{"α1-6 arm"}</text>

        <line x1={100} y1={90} x2={100} y2={40} stroke="#555" strokeWidth={1.5} />
        <text x={108} y={68} fontSize="11" fill="#666">{"β1-2"}</text>
        <MonosaccharideSymbol name="GlcNAc" x={100} y={40} size={symSize} showLabel={false} />

        <line x1={240} y1={90} x2={240} y2={40} stroke="#555" strokeWidth={1.5} />
        <text x={248} y={68} fontSize="11" fill="#666">{"β1-2"}</text>
        <MonosaccharideSymbol name="GlcNAc" x={240} y={40} size={symSize} showLabel={false} />

        <rect x={5} y={225} width={150} height={38} rx={6} fill="#f0f9ff" stroke="#bae6fd" strokeWidth={1} />
        <text x={80} y={240} textAnchor="middle" fontSize="11" fill="#0369a1" fontWeight="bold">Reducing end</text>
        <text x={80} y={254} textAnchor="middle" fontSize="10" fill="#0369a1">(attached to protein)</text>

        <line x1={155} y1={244} x2={160} y2={244} stroke="#0369a1" strokeWidth={1} strokeDasharray="3,2" />
      </svg>
    </div>
  );
}

function SectionCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-gray-100">{title}</h3>
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

function SNFGSection() {
  const monosaccharides = [
    { name: "GlcNAc", fullName: <><em>N</em>-Acetylglucosamine</>, shape: "Square", color: "Blue", colorHex: SNFG_COLORS.blue },
    { name: "GalNAc", fullName: <><em>N</em>-Acetylgalactosamine</>, shape: "Square", color: "Yellow", colorHex: SNFG_COLORS.yellow },
    { name: "Man", fullName: "Mannose", shape: "Circle", color: "Green", colorHex: SNFG_COLORS.green },
    { name: "Gal", fullName: "Galactose", shape: "Circle", color: "Yellow", colorHex: SNFG_COLORS.yellow },
    { name: "Glc", fullName: "Glucose", shape: "Circle", color: "Blue", colorHex: SNFG_COLORS.blue },
    { name: "Fuc", fullName: "Fucose", shape: "Triangle", color: "Red", colorHex: SNFG_COLORS.red },
    { name: "Neu5Ac", fullName: <><em>N</em>-Acetylneuraminic acid (a sialic acid)</>, shape: "Diamond", color: "Purple", colorHex: SNFG_COLORS.purple },
    { name: "Neu5Gc", fullName: <><em>N</em>-Glycolylneuraminic acid (a sialic acid)</>, shape: "Diamond", color: "Light Blue", colorHex: SNFG_COLORS.lightBlue },
    { name: "Xyl", fullName: "Xylose", shape: "Star", color: "Orange", colorHex: SNFG_COLORS.orange },
    { name: "Hex", fullName: "Hexose (generic/unresolved)", shape: "Circle", color: "White", colorHex: SNFG_COLORS.white },
    { name: "HexNAc", fullName: <><em>N</em>-Acetylhexosamine (generic/unresolved)</>, shape: "Square", color: "White", colorHex: SNFG_COLORS.white },
  ];

  return (
    <SectionCard title="SNFG Symbol Nomenclature">
      <p className="text-sm text-slate-700 mb-4">
        The <strong>Symbol Nomenclature for Glycans (SNFG)</strong> is the standard system for drawing glycan structures.
        Each monosaccharide (sugar building block) is represented by a specific <strong>shape</strong> and <strong>color</strong> combination.
        This makes it possible to read a glycan drawing at a glance without memorizing chemical structures.
      </p>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">The shape tells you the sugar class:</h4>
      <ul className="text-sm text-slate-700 mb-4 space-y-1 ml-4 list-disc">
        <li><strong>Circles</strong> = hexoses (6-carbon sugars like mannose, galactose, glucose)</li>
        <li><strong>Squares</strong> = <em>N</em>-acetylhexosamines (2-acetamido-2-deoxyhexoses)</li>
        <li><strong>Diamonds</strong> = sialic acids and related nonulosonic acids (9-carbon acidic sugars; e.g. Neu5Ac, Neu5Gc, Kdn)</li>
        <li><strong>Triangles</strong> = 6-deoxyhexoses (like fucose)</li>
        <li><strong>Stars</strong> = pentoses (5-carbon sugars like xylose)</li>
        <li>Other shapes cover the remaining classes (e.g. divided diamonds for uronic acids, flat hexagons for Kdo and heptoses); see the full table linked below.</li>
      </ul>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">The color tells you exactly which sugar:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        {monosaccharides.map((m) => (
          <SymbolDemo key={m.name} {...m} />
        ))}
      </div>

      <Callout type="note">
        White/empty symbols (<InlineSym name="Hex" /> Hex, <InlineSym name="HexNAc" /> HexNAc) indicate a
        <strong> generic or unresolved</strong> identity. When the exact sugar is known, the specific colored symbol is used instead.
        You will see white symbols in composition-level assignments where the exact identity has not been determined.
      </Callout>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <h4 className="font-semibold text-sm text-slate-800 mb-2">SNFG Color Definitions</h4>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs mb-3">
          {[
            { name: "Blue", hex: "#0072BC" },
            { name: "Green", hex: "#00A651" },
            { name: "Yellow", hex: "#FFD400" },
            { name: "Orange", hex: "#F47920" },
            { name: "Pink", hex: "#F69EA1" },
            { name: "Purple", hex: "#A54399" },
            { name: "Light Blue", hex: "#8FCCE9" },
            { name: "Brown", hex: "#A17A4D" },
            { name: "Red", hex: "#ED1C24" },
            { name: "White", hex: "#FFFFFF" },
          ].map((c) => (
            <div key={c.name} className="flex items-center gap-2 p-1.5 rounded bg-gray-50">
              <div
                className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                style={{ backgroundColor: c.hex }}
              />
              <div>
                <div className="font-medium text-slate-700">{c.name}</div>
                <div className="text-slate-600">{c.hex}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-slate-600">
          See{" "}
          <a
            href="https://www.ncbi.nlm.nih.gov/glycans/snfg.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 underline"
          >
            NCBI SNFG reference
          </a>{" "}
          for full details and the complete symbol set.
        </p>
      </div>
    </SectionCard>
  );
}

function CompositionSection() {
  return (
    <SectionCard title="Composition Naming">
      <p className="text-sm text-slate-700 mb-3">
        A glycan <strong>composition</strong> tells you <em>how many of each sugar type</em> are present,
        but <strong>not</strong> how they are connected. Think of it as a list of ingredients without the recipe.
      </p>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Standard format</h4>
      <p className="text-sm text-slate-700 mb-3">
        Compositions are written by listing each monosaccharide type followed by its count in parentheses:
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm">
        <div className="mb-2"><strong>HexNAc(4)Hex(5)Fuc(1)Neu5Ac(2)</strong></div>
        <div className="text-xs text-slate-600 font-sans">
          = 4 <em>N</em>-acetylhexosamines + 5 hexoses + 1 deoxyhexose (fucose) + 2 sialic acids
        </div>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Conventional order</h4>
      <p className="text-sm text-slate-700 mb-2">
        Components are listed in a standard order:
      </p>
      <ol className="text-sm text-slate-700 mb-4 space-y-1 ml-4 list-decimal">
        <li><strong>HexNAc</strong> (<em>N</em>-acetylhexosamines), first in the convention used on this site</li>
        <li><strong>Hex</strong> (hexoses), second</li>
        <li><strong>dHex</strong> or <strong>Fuc</strong> (fucose/deoxyhexose), third</li>
        <li><strong>Neu5Ac</strong> and/or <strong>Neu5Gc</strong> (sialic acids), fourth</li>
        <li>Other modifications (sulfate, phosphate, etc.), last</li>
      </ol>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Generic vs specific names</h4>
      <div className="overflow-x-auto mb-4">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 border border-slate-200 font-semibold">Generic name</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">Includes</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">When specific identity is known</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2 border border-slate-200 font-mono">Hex</td>
              <td className="p-2 border border-slate-200">Man, Gal, Glc (all have same mass)</td>
              <td className="p-2 border border-slate-200">Use Man, Gal, or Glc</td>
            </tr>
            <tr className="bg-gray-50">
              <td className="p-2 border border-slate-200 font-mono">HexNAc</td>
              <td className="p-2 border border-slate-200">GlcNAc, GalNAc (same mass)</td>
              <td className="p-2 border border-slate-200">Use GlcNAc or GalNAc</td>
            </tr>
            <tr>
              <td className="p-2 border border-slate-200 font-mono">dHex</td>
              <td className="p-2 border border-slate-200">Deoxyhexoses (in mammalian glycans almost always Fuc)</td>
              <td className="p-2 border border-slate-200">Use Fuc</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Callout type="important">
        Composition-level data uses generic names (Hex, HexNAc) because mass spectrometry alone cannot distinguish
        isomers like mannose vs galactose; they have the exact same mass. Specific names (Man, Gal, GlcNAc, GalNAc)
        are only used when the identity is confirmed by diagnostic ions, retention time, or other evidence.
        Many search tools (e.g. Byonic) nevertheless write Fuc for a deoxyhexose in compositions; the examples below
        follow that common usage, but the mass alone defines only dHex.
      </Callout>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Example compositions</h4>
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="font-mono text-sm mb-1">HexNAc(2)Hex(5)</div>
          <div className="text-xs text-slate-600">Oligomannose N-glycan (Man₅): 2 core GlcNAc + 5 mannoses</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="font-mono text-sm mb-1">HexNAc(4)Hex(5)Fuc(1)Neu5Ac(2)</div>
          <div className="text-xs text-slate-600">Consistent with a complex biantennary N-glycan with one fucose (typically core) and 2 sialic acids</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="font-mono text-sm mb-1">HexNAc(1)Hex(1)Neu5Ac(1)</div>
          <div className="text-xs text-slate-600">Consistent with a monosialylated core 1 O-glycan (sialyl-T antigen)</div>
        </div>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mt-4 mb-2">Abbreviated notation</h4>
      <p className="text-sm text-slate-700 mb-2">
        In many glycoproteomics tools and publications, compositions are written in a <strong>compact single-letter</strong> format
        for brevity. Each monosaccharide type is represented by a single letter followed by its count:
      </p>

      <div className="overflow-x-auto mb-3">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1.5 pr-4 font-semibold text-slate-700">Letter</th>
              <th className="text-left py-1.5 pr-4 font-semibold text-slate-700">Monosaccharide</th>
              <th className="text-left py-1.5 font-semibold text-slate-700">Full name</th>
            </tr>
          </thead>
          <tbody className="text-slate-600">
            <tr className="border-b border-gray-100"><td className="py-1.5 pr-4 font-mono font-bold">N</td><td className="py-1.5 pr-4">HexNAc</td><td className="py-1.5"><em>N</em>-Acetylhexosamine (GlcNAc or GalNAc)</td></tr>
            <tr className="border-b border-gray-100"><td className="py-1.5 pr-4 font-mono font-bold">H</td><td className="py-1.5 pr-4">Hex</td><td className="py-1.5">Hexose (Man, Gal, or Glc)</td></tr>
            <tr className="border-b border-gray-100"><td className="py-1.5 pr-4 font-mono font-bold">F</td><td className="py-1.5 pr-4">Fuc (dHex)</td><td className="py-1.5">Deoxyhexose (usually fucose)</td></tr>
            <tr className="border-b border-gray-100"><td className="py-1.5 pr-4 font-mono font-bold">S</td><td className="py-1.5 pr-4">Neu5Ac (NeuAc)</td><td className="py-1.5"><em>N</em>-Acetylneuraminic acid (sialic acid)</td></tr>
            <tr className="border-b border-gray-100"><td className="py-1.5 pr-4 font-mono font-bold">G</td><td className="py-1.5 pr-4">Neu5Gc (NeuGc)</td><td className="py-1.5"><em>N</em>-Glycolylneuraminic acid</td></tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-3 mb-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono text-sm font-bold">H5N2</span>
            <span className="text-slate-600">=</span>
            <span className="font-mono text-sm">HexNAc(2)Hex(5)</span>
          </div>
          <div className="text-xs text-slate-600">Oligomannose N-glycan (5 hexoses + 2 HexNAc)</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono text-sm font-bold">H5N4F1S2</span>
            <span className="text-slate-600">=</span>
            <span className="font-mono text-sm">HexNAc(4)Hex(5)Fuc(1)Neu5Ac(2)</span>
          </div>
          <div className="text-xs text-slate-600">Consistent with a complex biantennary glycan with one fucose (typically core) and 2 sialic acids</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-baseline gap-3 mb-1">
            <span className="font-mono text-sm font-bold">H3N5F1</span>
            <span className="text-slate-600">=</span>
            <span className="font-mono text-sm">HexNAc(5)Hex(3)Fuc(1)</span>
          </div>
          <div className="text-xs text-slate-600">e.g. agalactosylated bisected biantennary, also consistent with agalactosylated triantennary; one fucose (3 hexoses + 5 HexNAc + 1 dHex)</div>
        </div>
      </div>

      <Callout type="note">
        The letter order varies by software and publication: <strong>H5N4F1S2</strong> and <strong>N4H5F1S2</strong> mean the same
        thing. Some tools use <strong>A</strong> for Neu5Ac instead of <strong>S</strong>. Always check which convention
        a given tool or paper uses.
      </Callout>
    </SectionCard>
  );
}

function StructureSection() {
  return (
    <SectionCard title="Structure Naming (IUPAC Condensed)">
      <p className="text-sm text-slate-700 mb-3">
        A glycan <strong>structure</strong> tells you not only which sugars are present, but <em>exactly how they are
        connected</em>. The standard text format is called <strong>IUPAC condensed nomenclature</strong>.
      </p>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Anatomy of a linkage</h4>
      <p className="text-sm text-slate-700 mb-2">
        Each connection between two sugars is described by a <strong>linkage</strong> that encodes three things:
      </p>

      <div className="bg-indigo-50 rounded-lg p-4 mb-4">
        <div className="font-mono text-center text-lg mb-2">
          {"Gal"}<span className="text-indigo-600 font-bold">{"β1-4"}</span>{"GlcNAc"}
        </div>
        <div className="grid grid-cols-3 gap-2 text-xs text-center mt-3">
          <div>
            <div className="font-semibold text-indigo-700">{"β (beta)"}</div>
            <div className="text-slate-600">Anomeric configuration: orientation of the bond at carbon 1</div>
          </div>
          <div>
            <div className="font-semibold text-indigo-700">{"1"}</div>
            <div className="text-slate-600">Carbon position on the first sugar (usually C1)</div>
          </div>
          <div>
            <div className="font-semibold text-indigo-700">{"4"}</div>
            <div className="text-slate-600">Carbon position on the second sugar where the bond attaches</div>
          </div>
        </div>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Carbon positions on a sugar ring</h4>
      <p className="text-sm text-slate-700 mb-2">
        Linkage numbers refer to specific <strong>carbon positions</strong> on the sugar ring. Most glycan sugars are six-membered
        (pyranose) rings with carbons numbered 1 through 5 in the ring, plus carbon 6 extending off the ring:
      </p>

      <div className="bg-amber-50 rounded-lg p-4 mb-4 flex flex-col items-center">
        <svg viewBox="0 0 540 220" className="w-full max-w-lg" xmlns="http://www.w3.org/2000/svg">
          <polygon
            points="170,30 260,75 260,155 170,200 80,155 80,75"
            fill="none"
            stroke="#92400e"
            strokeWidth="2"
          />
          <line x1="80" y1="75" x2="50" y2="55" stroke="#92400e" strokeWidth="2" />

          <circle cx="170" cy="30" r="14" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
          <text x="170" y="34" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">O</text>

          <circle cx="260" cy="75" r="14" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
          <text x="260" y="79" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">C1</text>

          <circle cx="260" cy="155" r="14" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
          <text x="260" y="159" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">C2</text>

          <circle cx="170" cy="200" r="14" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
          <text x="170" y="204" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">C3</text>

          <circle cx="80" cy="155" r="14" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
          <text x="80" y="159" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">C4</text>

          <circle cx="80" cy="75" r="14" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
          <text x="80" y="79" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">C5</text>

          <circle cx="50" cy="55" r="14" fill="#fef3c7" stroke="#92400e" strokeWidth="1.5" />
          <text x="50" y="59" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#92400e">C6</text>

          <text x="295" y="79" fontSize="10" fill="#78350f">← Anomeric carbon (linkage starts here)</text>
          <text x="20" y="40" fontSize="10" fill="#78350f">CH₂OH</text>
        </svg>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 mt-3 text-xs text-slate-700 w-full max-w-md">
          <div><strong className="text-amber-800">C1</strong>: Anomeric carbon; defines α/β configuration</div>
          <div><strong className="text-amber-800">C2</strong>: Site of the <em>N</em>-acetyl group in GlcNAc/GalNAc</div>
          <div><strong className="text-amber-800">C3</strong>: Common sialic acid linkage site (e.g., α2-3)</div>
          <div><strong className="text-amber-800">C4</strong>: Gal–GlcNAc linkage (β1-4); Glc and Gal differ only here (C4 epimers)</div>
          <div><strong className="text-amber-800">C5</strong>: Ring carbon bearing C6; its configuration defines D/L</div>
          <div><strong className="text-amber-800">C6</strong>: Off ring; sialylation (α2-6), branching point</div>
        </div>
      </div>

      <Callout type="tip">
        The linkage number tells you <strong>which carbon on the accepting sugar</strong> is involved. For example,
        "β1-4" means the bond goes from C1 of the donor sugar to <strong>C4</strong> of the acceptor.
        Common linkages: 1-2 (Man branching), 1-3 (Lewis epitopes), 1-4 (LacNAc; bisecting GlcNAc), 1-6 (core fucose; 6-arm mannose; GlcNAcβ1-6 branches), 2-3 and 2-6 (sialic acid).
      </Callout>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Common linkages on a glycan tree</h4>
      <p className="text-sm text-slate-700 mb-3">
        The diagram below shows a sialylated, core-fucosylated biantennary N-glycan with every bond labeled by its linkage type.
        Each linkage connects C1 of the donor (or C2 for sialic acid) to the numbered carbon on the acceptor sugar.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 overflow-x-auto">
        <svg viewBox="0 0 640 420" className="w-full max-w-2xl mx-auto" xmlns="http://www.w3.org/2000/svg">
          {/* --- Linkage color legend --- */}
          <text x="290" y="16" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#374151">{"Linkage Map: Biantennary "}
            <tspan>N</tspan>
            {"-Glycan"}</text>

          {/* ---- REDUCING END: GlcNAc-β-Asn (bottom) ---- */}
          {/* GlcNAc #1 (reducing end) */}
          <rect x="272" y="355" width="16" height="16" fill="#0072BC" stroke="#333" strokeWidth="1.2" />
          <text x="280" y="385" textAnchor="middle" fontSize="10" fill="#555">GlcNAc</text>

          {/* Core fucose attached α1-6 to GlcNAc #1 */}
          <line x1="272" y1="363" x2="230" y2="363" stroke="#333" strokeWidth="1.2" />
          <polygon points="222,358 222,368 230,363" fill="#ED1C24" stroke="#333" strokeWidth="1.2" />
          <text x="206" y="367" textAnchor="middle" fontSize="10" fill="#555">Fuc</text>
          <text x="250" y="357" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#b91c1c">α1-6</text>

          {/* Bond: GlcNAc #1 → GlcNAc #2 (β1-4) */}
          <line x1="280" y1="355" x2="280" y2="325" stroke="#333" strokeWidth="1.2" />
          <text x="293" y="343" fontSize="10" fontWeight="bold" fill="#1d4ed8">β1-4</text>

          {/* GlcNAc #2 */}
          <rect x="272" y="309" width="16" height="16" fill="#0072BC" stroke="#333" strokeWidth="1.2" />
          <text x="280" y="303" textAnchor="middle" fontSize="10" fill="#555">GlcNAc</text>

          {/* Bond: GlcNAc #2 → β-Man (β1-4) */}
          <line x1="280" y1="309" x2="280" y2="279" stroke="#333" strokeWidth="1.2" />
          <text x="293" y="297" fontSize="10" fontWeight="bold" fill="#1d4ed8">β1-4</text>

          {/* β-Mannose (branching point) */}
          <circle cx="280" cy="267" r="8" fill="#00A651" stroke="#333" strokeWidth="1.2" />
          <text x="280" y="258" textAnchor="middle" fontSize="10" fill="#555">Man</text>

          {/* ---- α1-3 BRANCH (left arm) ---- */}
          <line x1="274" y1="261" x2="190" y2="225" stroke="#333" strokeWidth="1.2" />
          <text x="224" y="237" fontSize="10" fontWeight="bold" fill="#059669">α1-3</text>

          {/* α1-3 Man */}
          <circle cx="183" cy="218" r="8" fill="#00A651" stroke="#333" strokeWidth="1.2" />

          {/* Man → GlcNAc (β1-2) on 3-arm */}
          <line x1="183" y1="210" x2="183" y2="182" stroke="#333" strokeWidth="1.2" />
          <text x="196" y="199" fontSize="10" fontWeight="bold" fill="#7c3aed">β1-2</text>

          {/* GlcNAc on 3-arm */}
          <rect x="175" y="159" width="16" height="16" fill="#0072BC" stroke="#333" strokeWidth="1.2" />

          {/* GlcNAc → Gal (β1-4) on 3-arm */}
          <line x1="183" y1="159" x2="183" y2="131" stroke="#333" strokeWidth="1.2" />
          <text x="196" y="148" fontSize="10" fontWeight="bold" fill="#1d4ed8">β1-4</text>

          {/* Gal on 3-arm */}
          <circle cx="183" cy="119" r="8" fill="#FFD400" stroke="#333" strokeWidth="1.2" />

          {/* Gal → NeuAc (α2-3) on 3-arm */}
          <line x1="183" y1="111" x2="183" y2="83" stroke="#333" strokeWidth="1.2" />
          <text x="196" y="100" fontSize="10" fontWeight="bold" fill="#be185d">α2-3</text>

          {/* NeuAc on 3-arm (diamond) */}
          <polygon points="183,63 193,73 183,83 173,73" fill="#A54399" stroke="#333" strokeWidth="1.2" />
          <text x="183" y="55" textAnchor="middle" fontSize="10" fill="#555">Neu5Ac</text>

          {/* ---- α1-6 BRANCH (right arm) ---- */}
          <line x1="286" y1="261" x2="370" y2="225" stroke="#333" strokeWidth="1.2" />
          <text x="336" y="237" fontSize="10" fontWeight="bold" fill="#059669">α1-6</text>

          {/* α1-6 Man */}
          <circle cx="377" cy="218" r="8" fill="#00A651" stroke="#333" strokeWidth="1.2" />

          {/* Man → GlcNAc (β1-2) on 6-arm */}
          <line x1="377" y1="210" x2="377" y2="182" stroke="#333" strokeWidth="1.2" />
          <text x="390" y="199" fontSize="10" fontWeight="bold" fill="#7c3aed">β1-2</text>

          {/* GlcNAc on 6-arm */}
          <rect x="369" y="159" width="16" height="16" fill="#0072BC" stroke="#333" strokeWidth="1.2" />

          {/* GlcNAc → Gal (β1-4) on 6-arm */}
          <line x1="377" y1="159" x2="377" y2="131" stroke="#333" strokeWidth="1.2" />
          <text x="390" y="148" fontSize="10" fontWeight="bold" fill="#1d4ed8">β1-4</text>

          {/* Gal on 6-arm */}
          <circle cx="377" cy="119" r="8" fill="#FFD400" stroke="#333" strokeWidth="1.2" />

          {/* Gal → NeuAc (α2-6) on 6-arm */}
          <line x1="377" y1="111" x2="377" y2="83" stroke="#333" strokeWidth="1.2" />
          <text x="390" y="100" fontSize="10" fontWeight="bold" fill="#be185d">α2-6</text>

          {/* NeuAc on 6-arm (diamond) */}
          <polygon points="377,63 387,73 377,83 367,73" fill="#A54399" stroke="#333" strokeWidth="1.2" />
          <text x="377" y="55" textAnchor="middle" fontSize="10" fill="#555">Neu5Ac</text>

          {/* ---- LABELS ---- */}
          <text x="280" y="398" textAnchor="middle" fontSize="10" fill="#888">↓ reducing end (to Asn)</text>

          {/* ---- LINKAGE KEY ---- */}
          <rect x="420" y="50" width="200" height="160" rx="6" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
          <text x="520" y="68" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#374151">Linkage Key</text>
          <text x="435" y="86" fontSize="10" fontWeight="bold" fill="#1d4ed8">β1-4</text>
          <text x="468" y="86" fontSize="10" fill="#555">LacNAc, chitobiose core</text>
          <text x="435" y="102" fontSize="10" fontWeight="bold" fill="#7c3aed">β1-2</text>
          <text x="468" y="102" fontSize="10" fill="#555">GlcNAc → Man (antenna start)</text>
          <text x="435" y="118" fontSize="10" fontWeight="bold" fill="#059669">α1-3</text>
          <text x="468" y="118" fontSize="10" fill="#555">3-arm Man branch</text>
          <text x="435" y="134" fontSize="10" fontWeight="bold" fill="#059669">α1-6</text>
          <text x="468" y="134" fontSize="10" fill="#555">6-arm Man / core Fuc</text>
          <text x="435" y="150" fontSize="10" fontWeight="bold" fill="#be185d">α2-3</text>
          <text x="468" y="150" fontSize="10" fill="#555">Sialic acid (3-linked)</text>
          <text x="435" y="166" fontSize="10" fontWeight="bold" fill="#be185d">α2-6</text>
          <text x="468" y="166" fontSize="10" fill="#555">Sialic acid (6-linked)</text>
          <text x="435" y="182" fontSize="10" fontWeight="bold" fill="#b91c1c">α1-6</text>
          <text x="468" y="182" fontSize="10" fill="#555">Core fucose → GlcNAc</text>
          <line x1="432" y1="192" x2="612" y2="192" stroke="#e5e7eb" strokeWidth="0.5" />
          <text x="520" y="204" textAnchor="middle" fontSize="9" fill="#9ca3af">Bond donor C → acceptor C</text>

          {/* ---- SUGAR KEY ---- */}
          <rect x="420" y="220" width="200" height="125" rx="6" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="1" />
          <text x="520" y="238" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#374151">Sugar Symbols</text>
          <rect x="438" y="248" width="10" height="10" fill="#0072BC" stroke="#333" strokeWidth="1" />
          <text x="456" y="257" fontSize="10" fill="#555">GlcNAc (blue square)</text>
          <circle cx="443" cy="271" r="5" fill="#00A651" stroke="#333" strokeWidth="1" />
          <text x="456" y="275" fontSize="10" fill="#555">Man (green circle)</text>
          <circle cx="443" cy="289" r="5" fill="#FFD400" stroke="#333" strokeWidth="1" />
          <text x="456" y="293" fontSize="10" fill="#555">Gal (yellow circle)</text>
          <polygon points="443,301 448,307 443,313 438,307" fill="#A54399" stroke="#333" strokeWidth="1" />
          <text x="456" y="310" fontSize="10" fill="#555">Neu5Ac (purple diamond)</text>
          <polygon points="438,321 438,331 446,326" fill="#ED1C24" stroke="#333" strokeWidth="1" />
          <text x="456" y="329" fontSize="10" fill="#555">Fuc (red triangle)</text>
        </svg>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Reading order: non-reducing end first</h4>
      <p className="text-sm text-slate-700 mb-3">
        In IUPAC condensed text, structures are written from <strong>left to right</strong>, starting at the <strong>non-reducing end</strong> (the
        outermost sugars, farthest from the protein) and ending at the <strong>reducing end</strong> (the sugar attached
        to the protein or the free end of a free glycan). This is the same direction shown in horizontal SNFG drawings,
        where the non-reducing end is on the left and the reducing end is on the right.
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="font-mono text-sm mb-2">
          <span className="text-emerald-700">Neu5Ac</span>
          <span className="text-slate-600">{"α2-3"}</span>
          <span className="text-emerald-700">Gal</span>
          <span className="text-slate-600">{"β1-4"}</span>
          <span className="text-emerald-700">GlcNAc</span>
          <span className="text-slate-600">{"β1-2"}</span>
          <span className="text-emerald-700">Man</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
          <span>{"← Non-reducing end (outermost)"}</span>
          <span className="flex-1 border-t border-dashed border-gray-300" />
          <span>{"Reducing end (attached to core) →"}</span>
        </div>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Branches</h4>
      <p className="text-sm text-slate-700 mb-3">
        When a sugar has more than one sugar attached to it, the structure branches. Branches are shown with
        square brackets. Each branch is written on its own, ending at the shared branching sugar:
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 font-mono text-sm">
        <div className="mb-1">
          Gal<span className="text-slate-600">{"β1-4"}</span>
          <span className="text-indigo-600 font-bold">[</span>
          Fuc<span className="text-slate-600">{"α1-3"}</span>
          <span className="text-indigo-600 font-bold">]</span>
          GlcNAc
        </div>
        <div className="text-xs text-slate-600 font-sans mt-2">
          This is Lewis X: Gal is attached at position 4, and Fuc is attached at position 3, both to the same GlcNAc.
          The branch (Fuc) goes inside square brackets.
        </div>
      </div>

      <Callout type="tip">
        The shorthand rule: <strong>the part inside brackets [] is always the branch</strong> (typically the shorter chain or
        modification), while the part outside is the main chain continuing leftward.
      </Callout>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Common linkage types in mammalian glycans</h4>
      <div className="overflow-x-auto">
        <table className="text-sm border-collapse w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2 border border-slate-200 font-semibold">Linkage</th>
              <th className="text-left p-2 border border-slate-200 font-semibold">Where you see it</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="p-2 border border-slate-200 font-mono">{"β1-4"}</td><td className="p-2 border border-slate-200">GlcNAc-GlcNAc core; Gal-GlcNAc (LacNAc)</td></tr>
            <tr className="bg-gray-50"><td className="p-2 border border-slate-200 font-mono">{"α1-3"}</td><td className="p-2 border border-slate-200">Core Man branching; Lewis X fucose (Galβ1-4GlcNAc)</td></tr>
            <tr><td className="p-2 border border-slate-200 font-mono">{"α1-4"}</td><td className="p-2 border border-slate-200">Lewis A fucose (Galβ1-3GlcNAc)</td></tr>
            <tr><td className="p-2 border border-slate-200 font-mono">{"α1-6"}</td><td className="p-2 border border-slate-200">Core Man branching; core fucose</td></tr>
            <tr className="bg-gray-50"><td className="p-2 border border-slate-200 font-mono">{"α2-3"}</td><td className="p-2 border border-slate-200">Sialic acid on type 1/2 chains</td></tr>
            <tr><td className="p-2 border border-slate-200 font-mono">{"α2-6"}</td><td className="p-2 border border-slate-200">Sialic acid on N-glycans (common in human IgG)</td></tr>
            <tr className="bg-gray-50"><td className="p-2 border border-slate-200 font-mono">{"β1-2"}</td><td className="p-2 border border-slate-200">GlcNAc on Man branches (antennae)</td></tr>
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

function ReadingDrawingsSection() {
  return (
    <SectionCard title="Reading an SNFG Drawing">
      <p className="text-sm text-slate-700 mb-4">
        SNFG drawings use a consistent orientation. Here is how to read any glycan drawing you encounter:
      </p>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Step 1: Find the reducing end</h4>
      <p className="text-sm text-slate-700 mb-3">
        The <strong>reducing end</strong> is usually drawn at the <strong>bottom</strong> (in vertical drawings) or <strong>right side</strong> (in horizontal drawings).
        In N-glycans, this is always the first GlcNAc <InlineSym name="GlcNAc" /> attached to the protein.
        In vertical drawings, read from the bottom up, following the trunk before the branches.
        In horizontal drawings, read from right to left.
      </p>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Step 2: Follow the core</h4>
      <p className="text-sm text-slate-700 mb-2">
        For N-glycans, the core is always the same:
      </p>

      <div className="flex flex-col sm:flex-row items-start gap-6 mb-4">
        <StructureDiagram
          monosaccharides={["Man", "GlcNAc", "GlcNAc"]}
          linkages={["β1-4", "β1-4"]}
          title={<>N-glycan core (reducing end on right)</>}
        />
        <div className="text-sm text-slate-700">
          <p className="mb-2">In this horizontal drawing, the reducing end is on the right. Starting there and reading left, the N-glycan core is:</p>
          <ol className="list-decimal ml-4 space-y-1 text-sm">
            <li><InlineSym name="GlcNAc" /> GlcNAc-1 (rightmost, attached to Asn on the protein)</li>
            <li><InlineSym name="GlcNAc" /> GlcNAc-2 (linked β1-4 to the first)</li>
            <li><InlineSym name="Man" /> Man (branching mannose, leftmost in the core)</li>
          </ol>
        </div>
      </div>

      <Callout type="note">
        <strong>Drawings and text share one orientation.</strong> Horizontal SNFG drawings and IUPAC condensed text
        (like "Galβ1-4GlcNAc") both place the non-reducing end on the left and the reducing end on the right. When
        interpreting a drawing it is often easiest to start at the reducing end and trace outward, following the
        biosynthetic order; IUPAC text is written starting from the non-reducing end.
      </Callout>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Step 3: Read the branches</h4>
      <p className="text-sm text-slate-700 mb-3">
        From the branching mannose, two arms extend upward. By convention:
      </p>
      <ul className="text-sm text-slate-700 mb-4 space-y-1 ml-4 list-disc">
        <li>The <strong>left arm</strong> is the <strong>{"α1-3 arm"}</strong> (3-arm)</li>
        <li>The <strong>right arm</strong> is the <strong>{"α1-6 arm"}</strong> (6-arm). In horizontal drawings (reducing end on the right) the 6-arm is drawn above the 3-arm.</li>
      </ul>

      <div className="flex justify-center mb-4">
        <BranchedNGlycanCore />
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mb-2">Step 4: Identify extensions and modifications</h4>
      <ul className="text-sm text-slate-700 space-y-2 ml-4 list-disc">
        <li>
          <strong>Antennae</strong>: Each arm can extend with <InlineSym name="GlcNAc" /><InlineSym name="Gal" /> (LacNAc) units
        </li>
        <li>
          <strong>Sialylation</strong>: <InlineSym name="Neu5Ac" /> diamonds at the tips of antennae (capping)
        </li>
        <li>
          <strong>Core fucose</strong>: <InlineSym name="Fuc" /> triangle attached to the innermost GlcNAc (at reducing end)
        </li>
        <li>
          <strong>Bisecting GlcNAc</strong>: A <InlineSym name="GlcNAc" /> square attached β1-4 to the branching Man
        </li>
      </ul>

      <Callout type="tip">
        To convert a drawing to text: start at each non-reducing end tip, write down each sugar and its linkage as you
        travel toward the reducing end. Use brackets for branches. This gives you the IUPAC condensed name.
      </Callout>
    </SectionCard>
  );
}

function FragmentTypesSection() {
  const ionTypes = [
    { ion: "B", end: "Non-reducing", cleavage: "Glycosidic", description: "Cleaves the C1–O glycosidic bond, retaining the charge on the non-reducing side. Forms an oxocarbenium (oxonium) ion. The most common positive-mode fragment.", color: "#2563eb" },
    { ion: "C", end: "Non-reducing", cleavage: "Glycosidic", description: "Arises from glycosidic-bond cleavage and retains the non-reducing portion. Complement of Z.", color: "#2563eb" },
    { ion: "Y", end: "Reducing", cleavage: "Glycosidic", description: "Cleaves the C1–O glycosidic bond, retaining the charge on the reducing side. Gives sequential sugar losses from the precursor. Complement of B.", color: "#059669" },
    { ion: "Z", end: "Reducing", cleavage: "Glycosidic", description: "Arises from glycosidic-bond cleavage and retains the reducing portion. Complement of C.", color: "#059669" },
    { ion: "A", end: "Non-reducing", cleavage: "Cross-ring", description: "Two bonds within the sugar ring are broken. Superscripts (e.g., ⁰·²A) indicate which ring bonds are cleaved. Provides linkage position information.", color: "#9333ea" },
    { ion: "X", end: "Reducing", cleavage: "Cross-ring", description: "Two bonds within the sugar ring are broken, charge retained on the reducing side. Complement of A. Superscripts follow the same convention.", color: "#9333ea" },
  ];

  return (
    <SectionCard title="MS/MS Fragment Ion Types (Domon–Costello Nomenclature)">
      <p className="text-sm text-slate-700 mb-3">
        When glycans fragment during MS/MS, bonds break in two fundamentally different ways.
        The <strong>Domon–Costello nomenclature</strong> (1988) provides a systematic naming system for all resulting fragment ions.
        Understanding these fragment types is essential for interpreting glycan spectra.
      </p>

      <Callout type="note">
        The naming convention is analogous to peptide fragmentation (Roepstorff–Fohlman): <strong>A, B, C</strong> ions
        retain the <strong>non-reducing end</strong>, while <strong>X, Y, Z</strong> ions retain the <strong>reducing end</strong>.
        Subscript numbers count from the respective terminus; superscripts on A/X ions specify which ring bonds are cleaved.
      </Callout>

      <h4 className="font-semibold text-sm text-slate-800 mt-4 mb-2">1. Glycosidic bond cleavage (B, C, Y, Z ions)</h4>
      <p className="text-sm text-slate-700 mb-3">
        The bond <strong>between</strong> two sugar residues is broken. This gives you <strong>sequence information</strong>, which
        sugars are present and in what order, but does not reveal how the sugars are linked within their rings.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 overflow-x-auto">
        <svg viewBox="0 0 640 320" className="w-full max-w-3xl mx-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrBlue" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#2563eb" />
            </marker>
            <marker id="arrGreen" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#059669" />
            </marker>
          </defs>

          <text x="320" y="18" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#374151">
            Glycosidic Bond Cleavage: B/C and Y/Z Ion Pairs
          </text>

          {/*
            Three chair-conformation pyranose rings centered at:
              Sugar 1: cx=110, Sugar 2: cx=320, Sugar 3: cx=530   (cy = 165)
            Same vertices and bold front-edge convention as the cross-ring diagram.
          */}

          {/* ============================ Sugar 1 (non-reducing end) ============================ */}
          <line x1="70" y1="163" x2="88"  y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="88" y1="143" x2="132" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="132" y1="143" x2="150" y2="163" stroke="#111" strokeWidth="1.2" />
          <line x1="150" y1="163" x2="132" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="132" y1="183" x2="88"  y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="88"  y1="183" x2="70"  y2="163" stroke="#111" strokeWidth="2.6" />
          <text x="139" y="138" textAnchor="middle" fontSize="11" fill="#111">O</text>
          <line x1="88" y1="143" x2="78" y2="125" stroke="#111" strokeWidth="1.2" />
          <text x="60" y="120" textAnchor="middle" fontSize="10" fill="#111">CH₂OH</text>
          <line x1="70" y1="163" x2="56" y2="172" stroke="#111" strokeWidth="1.2" />
          <text x="42" y="178" textAnchor="middle" fontSize="10" fill="#111">HO</text>
          <line x1="88" y1="183" x2="82" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="78" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>
          <line x1="132" y1="183" x2="138" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="142" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>

          {/* Glycosidic bond 1: C1 of sugar 1 → C4 of sugar 2 with bridging O */}
          <line x1="150" y1="163" x2="190" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="190" y1="143" x2="240" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="240" y1="143" x2="280" y2="163" stroke="#111" strokeWidth="1.2" />
          <text x="215" y="136" textAnchor="middle" fontSize="11" fill="#111">O</text>

          {/* B₁ / Y₂ cleavage at C1–O bond of bond 1 (cleavage point ≈ 170,153) */}
          <polyline points="170,153 170,230 148,230" fill="none" stroke="#2563eb" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrBlue)" />
          <polyline points="170,153 170,80  192,80"  fill="none" stroke="#059669" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrGreen)" />
          <text x="138" y="246" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#2563eb">B₁</text>
          <text x="202" y="73"  textAnchor="middle" fontSize="13" fontWeight="bold" fill="#059669">Y₂</text>

          {/* C₁ / Z₂ cleavage at O–C bond of bond 1 (cleavage point ≈ 260,153) */}
          <polyline points="260,153 260,230 238,230" fill="none" stroke="#2563eb" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrBlue)" />
          <polyline points="260,153 260,80  282,80"  fill="none" stroke="#059669" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrGreen)" />
          <text x="228" y="246" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#2563eb">C₁</text>
          <text x="292" y="73"  textAnchor="middle" fontSize="13" fontWeight="bold" fill="#059669">Z₂</text>

          {/* ============================ Sugar 2 ============================ */}
          <line x1="280" y1="163" x2="298" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="298" y1="143" x2="342" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="342" y1="143" x2="360" y2="163" stroke="#111" strokeWidth="1.2" />
          <line x1="360" y1="163" x2="342" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="342" y1="183" x2="298" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="298" y1="183" x2="280" y2="163" stroke="#111" strokeWidth="2.6" />
          <text x="349" y="138" textAnchor="middle" fontSize="11" fill="#111">O</text>
          <line x1="298" y1="143" x2="288" y2="125" stroke="#111" strokeWidth="1.2" />
          <text x="270" y="120" textAnchor="middle" fontSize="10" fill="#111">CH₂OH</text>
          <line x1="298" y1="183" x2="292" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="288" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>
          <line x1="342" y1="183" x2="348" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="352" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>

          {/* Glycosidic bond 2 */}
          <line x1="360" y1="163" x2="400" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="400" y1="143" x2="450" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="450" y1="143" x2="490" y2="163" stroke="#111" strokeWidth="1.2" />
          <text x="425" y="136" textAnchor="middle" fontSize="11" fill="#111">O</text>

          {/* B₂ / Y₁ cleavage at C1–O bond of bond 2 (cleavage point ≈ 380,153) */}
          <polyline points="380,153 380,230 358,230" fill="none" stroke="#2563eb" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrBlue)" />
          <polyline points="380,153 380,80  402,80"  fill="none" stroke="#059669" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrGreen)" />
          <text x="348" y="246" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#2563eb">B₂</text>
          <text x="412" y="73"  textAnchor="middle" fontSize="13" fontWeight="bold" fill="#059669">Y₁</text>

          {/* C₂ / Z₁ cleavage at O–C bond of bond 2 (cleavage point ≈ 470,153) */}
          <polyline points="470,153 470,230 448,230" fill="none" stroke="#2563eb" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrBlue)" />
          <polyline points="470,153 470,80  492,80"  fill="none" stroke="#059669" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrGreen)" />
          <text x="438" y="246" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#2563eb">C₂</text>
          <text x="502" y="73"  textAnchor="middle" fontSize="13" fontWeight="bold" fill="#059669">Z₁</text>

          {/* ============================ Sugar 3 (reducing end) ============================ */}
          <line x1="490" y1="163" x2="508" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="508" y1="143" x2="552" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="552" y1="143" x2="570" y2="163" stroke="#111" strokeWidth="1.2" />
          <line x1="570" y1="163" x2="552" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="552" y1="183" x2="508" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="508" y1="183" x2="490" y2="163" stroke="#111" strokeWidth="2.6" />
          <text x="559" y="138" textAnchor="middle" fontSize="11" fill="#111">O</text>
          <line x1="508" y1="143" x2="498" y2="125" stroke="#111" strokeWidth="1.2" />
          <text x="480" y="120" textAnchor="middle" fontSize="10" fill="#111">CH₂OH</text>
          <line x1="508" y1="183" x2="502" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="498" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>
          <line x1="552" y1="183" x2="558" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="562" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>
          <line x1="570" y1="163" x2="586" y2="172" stroke="#111" strokeWidth="1.2" />
          <text x="600" y="178" textAnchor="middle" fontSize="10" fill="#111">OH</text>

          {/* End labels */}
          <text x="110" y="284" textAnchor="middle" fontSize="9" fill="#6b7280">non-reducing end</text>
          <text x="530" y="284" textAnchor="middle" fontSize="9" fill="#6b7280">reducing end</text>

          {/* Footnote */}
          <text x="320" y="302" textAnchor="middle" fontSize="9" fill="#555">
            B, C ions retain the non-reducing end · Y, Z ions retain the reducing end · B/Y cleave the C1–O bond, C/Z cleave the O–C bond
          </text>
          <text x="320" y="315" textAnchor="middle" fontSize="8" fill="#9ca3af">
            Subscripts count from the non-reducing end (B, C) or reducing end (Y, Z)
          </text>
        </svg>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mt-4 mb-2">2. Cross-ring cleavage (A, X ions)</h4>
      <p className="text-sm text-slate-700 mb-3">
        Two bonds <strong>within</strong> a single sugar ring are broken, cutting across the pyranose ring.
        This reveals <strong>linkage position</strong>, which carbon atoms are involved in the glycosidic bond.
        The two broken bonds are indicated by superscript numbers (e.g., <strong>⁰·²A</strong> means ring bonds 0 (O–C1) and 2 (C2–C3) are cleaved).
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 overflow-x-auto">
        <svg viewBox="0 0 640 320" className="w-full max-w-3xl mx-auto" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrEnd" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill="#9333ea" />
            </marker>
          </defs>

          <text x="320" y="18" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#374151">
            Cross-Ring Cleavage: A and X Ions (Domon–Costello)
          </text>

          {/*
            Three chair-conformation pyranose rings centered at:
              Sugar 1: cx=110, Sugar 2: cx=320, Sugar 3: cx=530   (cy = 165)
            Chair vertices (relative to cx, cy):
              C4 left      (cx-40, cy-2)
              C5 top-left  (cx-22, cy-22)
              O  top-right (cx+22, cy-22)
              C1 right     (cx+40, cy-2)
              C2 front-rt  (cx+22, cy+18)   bold front
              C3 front-lt  (cx-22, cy+18)   bold front
            Front edges (C1-C2, C2-C3, C3-C4) drawn with strokeWidth=3 to convey chair perspective.
          */}

          {/* ============================ Sugar 1 ============================ */}
          {/* Back edges (thin) */}
          <line x1="70" y1="163" x2="88"  y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="88" y1="143" x2="132" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="132" y1="143" x2="150" y2="163" stroke="#111" strokeWidth="1.2" />
          {/* Front edges (bold) */}
          <line x1="150" y1="163" x2="132" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="132" y1="183" x2="88"  y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="88"  y1="183" x2="70"  y2="163" stroke="#111" strokeWidth="2.6" />
          {/* Ring-O label */}
          <text x="139" y="138" textAnchor="middle" fontSize="11" fill="#111">O</text>
          {/* CH2OH on C5 */}
          <line x1="88" y1="143" x2="78" y2="125" stroke="#111" strokeWidth="1.2" />
          <text x="60" y="120" textAnchor="middle" fontSize="10" fill="#111">CH₂OH</text>
          {/* HO on C4 (only sugar 1) */}
          <line x1="70" y1="163" x2="56" y2="172" stroke="#111" strokeWidth="1.2" />
          <text x="42" y="178" textAnchor="middle" fontSize="10" fill="#111">HO</text>
          {/* OH on C3 */}
          <line x1="88" y1="183" x2="82" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="78" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>
          {/* OH on C2 */}
          <line x1="132" y1="183" x2="138" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="142" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>

          {/* ²·⁵A₁ cross-ring cleavage on Sugar 1
              bonds 2 (C2-C3) and 5 (C5-O): vertical line from C2-C3 mid to C5-O mid */}
          <line x1="110" y1="183" x2="110" y2="143" stroke="#9333ea" strokeWidth="1.4" strokeDasharray="5,3" />
          <polyline points="110,183 110,230 88,230" fill="none" stroke="#9333ea" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrEnd)" />
          <text x="78"  y="246" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#9333ea">²·⁵A₁</text>

          {/* Glycosidic bond 1: C1 of sugar 1 → C4 of sugar 2 with bridging O */}
          <line x1="150" y1="163" x2="190" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="190" y1="143" x2="240" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="240" y1="143" x2="280" y2="163" stroke="#111" strokeWidth="1.2" />
          <text x="215" y="136" textAnchor="middle" fontSize="11" fill="#111">O</text>

          {/* ============================ Sugar 2 ============================ */}
          {/* Back edges (thin) */}
          <line x1="280" y1="163" x2="298" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="298" y1="143" x2="342" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="342" y1="143" x2="360" y2="163" stroke="#111" strokeWidth="1.2" />
          {/* Front edges (bold) */}
          <line x1="360" y1="163" x2="342" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="342" y1="183" x2="298" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="298" y1="183" x2="280" y2="163" stroke="#111" strokeWidth="2.6" />
          <text x="349" y="138" textAnchor="middle" fontSize="11" fill="#111">O</text>
          <line x1="298" y1="143" x2="288" y2="125" stroke="#111" strokeWidth="1.2" />
          <text x="270" y="120" textAnchor="middle" fontSize="10" fill="#111">CH₂OH</text>
          <line x1="298" y1="183" x2="292" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="288" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>
          <line x1="342" y1="183" x2="348" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="352" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>

          {/* ²·⁴A₂ / X₁ cross-ring cleavage on Sugar 2
              bonds 2 (C2-C3) and 4 (C4-C5): from C2-C3 mid (320,183) to C4-C5 mid (289,153) */}
          <line x1="320" y1="183" x2="289" y2="153" stroke="#9333ea" strokeWidth="1.4" strokeDasharray="5,3" />
          <polyline points="320,183 320,230 298,230" fill="none" stroke="#9333ea" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrEnd)" />
          <polyline points="289,153 289,80  311,80"  fill="none" stroke="#9333ea" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrEnd)" />
          <text x="288" y="246" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#9333ea">²·⁴A₂</text>
          <text x="321" y="73"  textAnchor="middle" fontSize="13" fontWeight="bold" fill="#9333ea">²·⁴X₁</text>

          {/* Glycosidic bond 2 */}
          <line x1="360" y1="163" x2="400" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="400" y1="143" x2="450" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="450" y1="143" x2="490" y2="163" stroke="#111" strokeWidth="1.2" />
          <text x="425" y="136" textAnchor="middle" fontSize="11" fill="#111">O</text>

          {/* ============================ Sugar 3 ============================ */}
          {/* Back edges (thin) */}
          <line x1="490" y1="163" x2="508" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="508" y1="143" x2="552" y2="143" stroke="#111" strokeWidth="1.2" />
          <line x1="552" y1="143" x2="570" y2="163" stroke="#111" strokeWidth="1.2" />
          {/* Front edges (bold) */}
          <line x1="570" y1="163" x2="552" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="552" y1="183" x2="508" y2="183" stroke="#111" strokeWidth="2.6" />
          <line x1="508" y1="183" x2="490" y2="163" stroke="#111" strokeWidth="2.6" />
          <text x="559" y="138" textAnchor="middle" fontSize="11" fill="#111">O</text>
          <line x1="508" y1="143" x2="498" y2="125" stroke="#111" strokeWidth="1.2" />
          <text x="480" y="120" textAnchor="middle" fontSize="10" fill="#111">CH₂OH</text>
          <line x1="508" y1="183" x2="502" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="498" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>
          <line x1="552" y1="183" x2="558" y2="200" stroke="#111" strokeWidth="1.2" />
          <text x="562" y="212" textAnchor="middle" fontSize="10" fill="#111">OH</text>
          {/* OH on C1 (reducing end) */}
          <line x1="570" y1="163" x2="586" y2="172" stroke="#111" strokeWidth="1.2" />
          <text x="600" y="178" textAnchor="middle" fontSize="10" fill="#111">OH</text>

          {/* ²·⁴A₃ cross-ring cleavage on Sugar 3
              bonds 2 (C2-C3) and 4 (C4-C5): from C2-C3 mid (530,183) to C4-C5 mid (499,153) */}
          <line x1="530" y1="183" x2="499" y2="153" stroke="#9333ea" strokeWidth="1.4" strokeDasharray="5,3" />
          <polyline points="530,183 530,230 508,230" fill="none" stroke="#9333ea" strokeWidth="1.4" strokeDasharray="5,3" markerEnd="url(#arrEnd)" />
          <text x="498" y="246" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#9333ea">²·⁴A₃</text>

          {/* End labels */}
          <text x="110" y="284" textAnchor="middle" fontSize="9" fill="#6b7280">non-reducing end</text>
          <text x="530" y="284" textAnchor="middle" fontSize="9" fill="#6b7280">reducing end</text>

          {/* Footnote */}
          <text x="320" y="302" textAnchor="middle" fontSize="9" fill="#555">
            A ions retain the non-reducing end · X ions retain the reducing end · Superscripts indicate which two ring bonds are cleaved
          </text>
          <text x="320" y="315" textAnchor="middle" fontSize="8" fill="#9ca3af">
            Bond numbering: 0 = O–C1, 1 = C1–C2, 2 = C2–C3, 3 = C3–C4, 4 = C4–C5, 5 = C5–O
          </text>
        </svg>
      </div>

      <h4 className="font-semibold text-sm text-slate-800 mt-4 mb-2">Summary of all fragment ion types</h4>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Ion</th>
              <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">End Retained</th>
              <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">Cleavage Type</th>
              <th className="border border-slate-200 px-3 py-2 text-left font-semibold text-slate-700">What It Tells You</th>
            </tr>
          </thead>
          <tbody>
            {ionTypes.map((row) => (
              <tr key={row.ion} className="hover:bg-gray-50">
                <td className="border border-slate-200 px-3 py-2 font-mono font-bold" style={{ color: row.color }}>{row.ion}</td>
                <td className="border border-slate-200 px-3 py-2 text-slate-700">{row.end}</td>
                <td className="border border-slate-200 px-3 py-2">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                    row.cleavage === "Glycosidic"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-purple-50 text-purple-700 border border-purple-200"
                  }`}>
                    {row.cleavage}
                  </span>
                </td>
                <td className="border border-slate-200 px-3 py-2 text-slate-600 text-xs">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout type="tip">
        <strong>B/Y ions</strong> can constrain glycan <strong>sequence and composition</strong>, but are not sufficient alone to establish topology.{" "}
        <strong>A/X ions</strong> can provide <strong>linkage</strong> evidence in the right fragmentation context.
        In positive-mode HCD, B and Y ions dominate. In negative-mode CID, C ions and cross-ring A ions become much more abundant,
        making negative mode particularly informative for linkage analysis.
      </Callout>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600">
          <strong>References:</strong> Domon, B. & Costello, C.E. (1988). A systematic nomenclature for carbohydrate fragmentations in FAB-MS/MS spectra of glycoconjugates.{" "}
          <em>Glycoconjugate Journal</em>, 5, 397–409.
          {" "}| Everest-Dass, A.V., Abrahams, J.L., Kolarich, D., Packer, N.H. & Campbell, M.P. (2013). Structural feature ions for distinguishing <em>N</em>- and <em>O</em>-linked glycan isomers by LC-ESI-IT MS/MS.{" "}
          <em>J. Am. Soc. Mass Spectrom.</em>, 24, 895–906.
        </p>
      </div>
    </SectionCard>
  );
}

function WorkedExamplesSection() {
  return (
    <SectionCard title="Worked Examples">
      <p className="text-sm text-slate-700 mb-4">
        Here are common glycan structures with both their drawing and text names, showing how to convert between them.
      </p>

      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-slate-800 mb-2">Example 1: LacNAc (a disaccharide)</h4>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
            <StructureDiagram monosaccharides={["Gal", "GlcNAc"]} linkages={["β1-4"]} />
            <div>
              <div className="font-mono text-sm mb-1">{"Galβ1-4GlcNAc"}</div>
              <div className="text-xs text-slate-600">Read the text left to right: Galactose linked β1-4 to GlcNAc (non-reducing → reducing end)</div>
            </div>
          </div>
          <div className="text-xs text-slate-600">
            <strong>Composition:</strong> HexNAc(1)Hex(1): the composition cannot tell you it is specifically Gal+GlcNAc vs Man+GalNAc.
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-slate-800 mb-2">Example 2: Lewis X (a branched trisaccharide)</h4>
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-3">
            <div className="flex flex-col items-center">
              <svg width={180} height={130} viewBox="0 0 180 130">
                <line x1={70} y1={80} x2={70} y2={48} stroke="#555" strokeWidth={1.5} />
                <text x={50} y={68} fontSize="11" fill="#666" textAnchor="end">{"β1-4"}</text>
                <line x1={70} y1={80} x2={125} y2={48} stroke="#555" strokeWidth={1.5} />
                <text x={112} y={72} fontSize="11" fill="#666">{"α1-3"}</text>
                <MonosaccharideSymbol name="GlcNAc" x={70} y={90} size={22} showLabel={true} />
                <MonosaccharideSymbol name="Gal" x={70} y={35} size={22} showLabel={true} />
                <MonosaccharideSymbol name="Fuc" x={125} y={35} size={22} showLabel={true} />
              </svg>
            </div>
            <div>
              <div className="font-mono text-sm mb-1">{"Galβ1-4[Fucα1-3]GlcNAc"}</div>
              <div className="text-xs text-slate-600 mb-2">
                Gal at position 4 (main chain) and Fuc at position 3 (branch, in brackets), both on GlcNAc.
              </div>
              <div className="text-xs text-slate-600">
                <strong>Composition:</strong> HexNAc(1)Hex(1)dHex(1): same composition as Lewis A, only structure tells them apart.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-slate-800 mb-2">Example 3: Sialyl LacNAc (a linear trisaccharide)</h4>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
            <StructureDiagram monosaccharides={["Neu5Ac", "Gal", "GlcNAc"]} linkages={["α2-3", "β1-4"]} />
            <div>
              <div className="font-mono text-sm mb-1">{"Neu5Acα2-3Galβ1-4GlcNAc"}</div>
              <div className="text-xs text-slate-600">
                A sialic acid caps the Gal at position 3. Read left to right: Neu5Ac → Gal → GlcNAc.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-sm text-slate-800 mb-2">Example 4: Core-fucosylated N-glycan fragment</h4>
          <div className="flex flex-col sm:flex-row items-start gap-4 mb-3">
            <div className="flex flex-col items-center">
              <svg width={180} height={130} viewBox="0 0 180 130">
                <line x1={70} y1={80} x2={70} y2={48} stroke="#555" strokeWidth={1.5} />
                <text x={50} y={68} fontSize="11" fill="#666" textAnchor="end">{"β1-4"}</text>
                <line x1={80} y1={90} x2={110} y2={90} stroke="#555" strokeWidth={1.5} />
                <text x={95} y={84} fontSize="11" fill="#666" textAnchor="middle">{"α1-6"}</text>
                <MonosaccharideSymbol name="GlcNAc" x={70} y={90} size={22} showLabel={true} />
                <MonosaccharideSymbol name="GlcNAc" x={70} y={35} size={22} showLabel={true} />
                <MonosaccharideSymbol name="Fuc" x={120} y={90} size={22} showLabel={true} />
              </svg>
            </div>
            <div>
              <div className="font-mono text-sm mb-1">{"GlcNAcβ1-4[Fucα1-6]GlcNAc"}</div>
              <div className="text-xs text-slate-600 mb-2">
                In mammalian N-glycans, core fucose is typically α1-6-linked to the reducing-end GlcNAc. Other core-fucose linkages, including α1-3, occur in other organisms.
                The Fuc branch goes in brackets because GlcNAc-2 (main chain) is the primary connection.
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function GlossarySection() {
  const terms = [
    { term: "Reducing end", def: <>The end of the glycan chain that can be free or attached to a protein. In N-glycans, this is the innermost GlcNAc linked to asparagine. Drawn at the bottom or right of SNFG diagrams.</> },
    { term: "Non-reducing end", def: "The outermost sugars of the glycan, farthest from the protein attachment. Drawn at the top or left. Named structures start from this end." },
    { term: "Antenna", def: <>A branch extending from the core mannose residues of an N-glycan. Biantennary = 2 branches, triantennary = 3, tetra = 4.</> },
    { term: "Core", def: <>The conserved inner portion of canonical N-glycans, written from non-reducing to reducing end as Manβ1-4GlcNAcβ1-4GlcNAc, with α1-3 and α1-6 Man branches.</> },
    { term: "Oxonium ion", def: <>A positively charged glycan fragment produced during MS/MS. Most diagnostic ions on this site are oxonium ions (e.g., <em>m/z</em> 204.0866 for HexNAc).</> },
    { term: "Isobaric", def: "Having the same mass. Man, Gal, and Glc are isobaric; they cannot be distinguished by mass alone." },
    { term: "Composition", def: "The count of each monosaccharide type in a glycan, without linkage or sequence information (e.g., HexNAc(2)Hex(5))." },
    { term: "Structure", def: "The full specification including which sugars are present, how they are linked (linkage positions and anomeric configuration), and branching pattern." },
    { term: "Anomer", def: <>One of the two stereoisomers (α or β) differing in configuration at the anomeric carbon, the carbon derived from the carbonyl group during ring closure (C1 in aldoses such as Glc/Gal/Man, C2 in ketoses such as sialic acid). After release from protein (e.g., PNGase F digest), the reducing end spontaneously forms both α and β anomers unless reduced. Written as "?" when the anomeric state is unknown.</> },
    { term: "Epimer", def: "A monosaccharide differing from another only in the configuration of a single hydroxyl group. Galactose and glucose are epimers at C-4; mannose and glucose differ at C-2. Epimers share the same molecular formula and mass but are structurally distinct, so they cannot be distinguished by mass alone." },
    { term: "Topology", def: "A structural resolution level where the order and connectivity of the monosaccharides is defined (often from fragmentation spectra) but the linkage positions and anomeric configurations remain unknown." },
    { term: "Assumed structure features", def: <>Features not directly measured but inferred from biosynthetic context or database priors, e.g., the conserved N-glycan core Man₃GlcNAc₂, the β-anomeric GlcNAc–Asn linkage, or the Galβ1-4 linkage in LacNAc. Software often applies these silently, which can affect downstream interpretation.</> },
    { term: "Linkage-defined structure", def: "A structure in which at least one linkage (attachment position or anomeric configuration) is explicitly specified. Many levels exist depending on how much linkage information is available." },
    { term: "Fully-defined structure", def: "A structure in which all structural elements are defined: every glycosidic linkage, the topology, and all glycan modifications." },
    { term: "Subsumption", def: <>The hierarchical relationship by which a single mass or base composition (e.g., GlyTouCan G80475RE) can be specified to progressively more-defined structures at "higher" levels. MS often identifies glycans only at the base-composition level, so subsumption enumerates the candidate structures sharing that mass; confirming a specific one usually requires orthogonal techniques. The GlyTouCan database is mapped to the subsumption graph in GNOme.</> },
    { term: "Archetype", def: "A representative form that encompasses glycans considered biologically the same but registered with different GlyTouCan IDs because they vary at the reducing end (e.g., from reduction or slide attachment during analysis). GlyTouCan automatically computes archetypes (e.g., G00026MO) for all registered glycans." },
    { term: "SNFG", def: "Symbol Nomenclature for Glycans: the standardized colored-shape system for drawing glycan structures." },
    { term: "Linkage", def: "The bond connecting two sugars, specified as anomeric configuration (α or β), carbon position on the donor, and carbon position on the acceptor (e.g., β1-4)." },
    { term: "Sialylation", def: "Addition of sialic acid (e.g. Neu5Ac or Neu5Gc) to a glycan, typically at the non-reducing end. Sialic acids add negative charge and strongly influence biological recognition." },
    { term: "Fucosylation", def: "Addition of fucose to a glycan. In mammals, core fucose is α1-6 linked to the reducing-end GlcNAc of N-glycans; plants and invertebrates also make α1-3 core fucose. Outer-arm fucose can be α1-2 (to Gal), α1-3 or α1-4 (to GlcNAc) linked. Fucose can also be attached directly to Ser/Thr (O-fucose)." },
    { term: "Glycosidic cleavage", def: "Fragmentation of the bond between two sugar residues. Produces B/C ions (non-reducing side) and Y/Z ions (reducing side). Reveals glycan sequence." },
    { term: "Cross-ring cleavage", def: "Fragmentation that breaks two bonds within a single sugar ring. Produces A ions (non-reducing side) and X ions (reducing side). Reveals linkage position. Noted with superscripts (e.g., ⁰·²A)." },
    { term: "B-ion", def: "Non-reducing end fragment from glycosidic cleavage at C1–O. Forms an oxocarbenium (oxonium) ion. Most common positive-mode glycan fragment." },
    { term: "Y-ion", def: "Reducing end fragment from glycosidic cleavage at C1–O. Complement of B-ion. Shows sequential sugar losses from the precursor." },
    { term: "C-ion", def: "Non-reducing end fragment retaining the glycosidic oxygen. More abundant in negative mode. Complement of Z-ion." },
    { term: "A-ion", def: "Non-reducing end fragment from cross-ring cleavage. Superscripts indicate which ring bonds are broken (e.g., ⁰·²A = bonds 0 and 2). Provides linkage information." },
  ];

  return (
    <SectionCard title="Quick Reference Glossary">
      <div className="space-y-0 divide-y divide-gray-100">
        {terms.map((t) => (
          <div key={t.term} className="py-2.5">
            <dt className="font-semibold text-sm text-slate-900">{t.term}</dt>
            <dd className="text-sm text-slate-600 mt-0.5">{t.def}</dd>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

export default function NomenclatureGuide() {
  const [activeSection, setActiveSection] = useState<Section | "all">("all");

  const sections: Record<Section, React.ReactNode> = {
    snfg: <SNFGSection />,
    composition: <CompositionSection />,
    structure: <StructureSection />,
    reading: <ReadingDrawingsSection />,
    examples: <WorkedExamplesSection />,
    fragments: <FragmentTypesSection />,
    glossary: <GlossarySection />,
  };

  return (
    <div className="min-h-screen md:pl-64 pt-14 md:pt-0">
      <AppHeader />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900 mb-1">Glycan Nomenclature Guide</h2>
          <p className="text-sm text-slate-600">
            A beginner-friendly introduction to how glycan structures and compositions are named, drawn, and read.
          </p>
          <div className="mt-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-slate-700">
            This site follows, and we recommend keeping nomenclature consistent with,{" "}
            <a
              href="https://www.ncbi.nlm.nih.gov/books/NBK579918/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-700 underline hover:text-indigo-900"
            >
              <em>Essentials of Glycobiology</em>
            </a>{" "}
            (Cold Spring Harbor Laboratory Press), the standard reference for glycan terminology, and the{" "}
            <a
              href="https://www.ncbi.nlm.nih.gov/glycans/snfg.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-700 underline hover:text-indigo-900"
            >
              Symbol Nomenclature for Glycans (SNFG)
            </a>{" "}
            for symbol usage.
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            <strong className="text-slate-800">Formatting N- and O-:</strong>{" "}
            The{" "}
            <a
              href="https://iubmb.qmul.ac.uk/newsletter/misc/Nglycan.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              JCBN/NC-IUB Newsletter (1992)
            </a>{" "}
            recommends italicizing these prefixes only when used as locants, as in{" "}
            <em>N-</em>acetyl-, <em>O-</em>acetyl-, and <em>N-</em>glycolyl.
            In N-linked, O-substituted, N-glycan, and O-glycan, the letters remain upright.
          </p>
        </div>

        <div className="selection-panel mb-6">
          <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-600">Section:</span>
          <div className="grid grid-cols-2 gap-1.5 md:grid-cols-4">
            <button
              onClick={() => setActiveSection("all")}
              className={`selection-option px-3 py-1.5 whitespace-nowrap ${
                activeSection === "all"
                  ? "selection-option-active"
                  : ""
              }`}
            >
              All Sections
            </button>
            {sectionLabels.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`selection-option px-3 py-1.5 whitespace-nowrap ${
                  activeSection === s.id
                    ? "selection-option-active"
                    : ""
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {activeSection === "all"
            ? sectionLabels.map((s) => <div key={s.id}>{sections[s.id]}</div>)
            : sections[activeSection]
          }
        </div>
      </div>
    </div>
  );
}
