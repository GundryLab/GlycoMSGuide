import React from "react";

export const SNFG_COLORS = {
  white: "#FFFFFF",
  blue: "#0072BC",
  green: "#00A651",
  yellow: "#FFD400",
  lightBlue: "#8FCCE9",
  pink: "#F69EA1",
  purple: "#A54399",
  brown: "#A17A4D",
  orange: "#F47920",
  red: "#ED1C24",
} as const;

const SYMBOL_SIZE = 20;
const STROKE_WIDTH = 1.5;

interface SymbolProps {
  x?: number;
  y?: number;
  size?: number;
  label?: string;
  showLabel?: boolean;
}

export function GlcNAc({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  return (
    <g>
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill={SNFG_COLORS.blue}
        stroke="#333"
        strokeWidth={STROKE_WIDTH}
      />
      {showLabel && (
        <text x={x} y={y + size / 2 + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "GlcNAc"}
        </text>
      )}
    </g>
  );
}

export function GalNAc({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  return (
    <g>
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill={SNFG_COLORS.yellow}
        stroke="#333"
        strokeWidth={STROKE_WIDTH}
      />
      {showLabel && (
        <text x={x} y={y + size / 2 + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "GalNAc"}
        </text>
      )}
    </g>
  );
}

export function HexNAc({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  return (
    <g>
      <rect
        x={x - size / 2}
        y={y - size / 2}
        width={size}
        height={size}
        fill={SNFG_COLORS.white}
        stroke="#333"
        strokeWidth={STROKE_WIDTH}
      />
      {showLabel && (
        <text x={x} y={y + size / 2 + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "HexNAc"}
        </text>
      )}
    </g>
  );
}

export function Glc({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  return (
    <g>
      <circle cx={x} cy={y} r={size / 2} fill={SNFG_COLORS.blue} stroke="#333" strokeWidth={STROKE_WIDTH} />
      {showLabel && (
        <text x={x} y={y + size / 2 + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "Glc"}
        </text>
      )}
    </g>
  );
}

export function Man({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  return (
    <g>
      <circle cx={x} cy={y} r={size / 2} fill={SNFG_COLORS.green} stroke="#333" strokeWidth={STROKE_WIDTH} />
      {showLabel && (
        <text x={x} y={y + size / 2 + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "Man"}
        </text>
      )}
    </g>
  );
}

export function Gal({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  return (
    <g>
      <circle cx={x} cy={y} r={size / 2} fill={SNFG_COLORS.yellow} stroke="#333" strokeWidth={STROKE_WIDTH} />
      {showLabel && (
        <text x={x} y={y + size / 2 + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "Gal"}
        </text>
      )}
    </g>
  );
}

export function Hex({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  return (
    <g>
      <circle cx={x} cy={y} r={size / 2} fill={SNFG_COLORS.white} stroke="#333" strokeWidth={STROKE_WIDTH} />
      {showLabel && (
        <text x={x} y={y + size / 2 + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "Hex"}
        </text>
      )}
    </g>
  );
}

export function Fuc({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  const h = size * 0.866;
  const points = `${x},${y - h / 2} ${x + size / 2},${y + h / 2} ${x - size / 2},${y + h / 2}`;
  return (
    <g>
      <polygon points={points} fill={SNFG_COLORS.red} stroke="#333" strokeWidth={STROKE_WIDTH} />
      {showLabel && (
        <text x={x} y={y + h / 2 + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "Fuc"}
        </text>
      )}
    </g>
  );
}

export function Neu5Ac({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  const r = size / 2;
  const points = `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;
  return (
    <g>
      <polygon points={points} fill={SNFG_COLORS.purple} stroke="#333" strokeWidth={STROKE_WIDTH} />
      {showLabel && (
        <text x={x} y={y + r + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "Neu5Ac"}
        </text>
      )}
    </g>
  );
}

export function Neu5Gc({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  const r = size / 2;
  const points = `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;
  return (
    <g>
      <polygon points={points} fill={SNFG_COLORS.lightBlue} stroke="#333" strokeWidth={STROKE_WIDTH} />
      {showLabel && (
        <text x={x} y={y + r + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "Neu5Gc"}
        </text>
      )}
    </g>
  );
}

function starPoints(x: number, y: number, radius: number) {
  return Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 === 0 ? radius : radius * 0.4;
    return `${x + Math.cos(angle) * r},${y + Math.sin(angle) * r}`;
  }).join(" ");
}

export function Xyl({ x = 0, y = 0, size = SYMBOL_SIZE, label, showLabel = true }: SymbolProps) {
  const points = starPoints(x, y, size * 0.6);
  return (
    <g>
      <polygon points={points} fill={SNFG_COLORS.orange} stroke="#333" strokeWidth={STROKE_WIDTH} />
      {showLabel && (
        <text x={x} y={y + size / 2 + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || "Xyl"}
        </text>
      )}
    </g>
  );
}

// Shapes and colors follow the NCBI SNFG chart:
// https://www.ncbi.nlm.nih.gov/glycans/snfg.html
const additionalSymbols = {
  GlcA: { shape: "splitDiamondTop", color: SNFG_COLORS.blue },
  GalA: { shape: "splitDiamondTop", color: SNFG_COLORS.yellow },
  IdoA: { shape: "splitDiamondBottom", color: SNFG_COLORS.brown },
  Qui: { shape: "triangle", color: SNFG_COLORS.blue },
  Rha: { shape: "triangle", color: SNFG_COLORS.green },
  Tyv: { shape: "rectangle", color: SNFG_COLORS.green },
  Abe: { shape: "rectangle", color: SNFG_COLORS.orange },
  Col: { shape: "rectangle", color: SNFG_COLORS.lightBlue },
  Kdn: { shape: "diamond", color: SNFG_COLORS.green },
  Bac: { shape: "hexagon", color: SNFG_COLORS.blue },
  MurNAc: { shape: "hexagon", color: SNFG_COLORS.purple },
  Fru: { shape: "pentagon", color: SNFG_COLORS.green },
  Ara: { shape: "star", color: SNFG_COLORS.green },
  Pse: { shape: "flatDiamond", color: SNFG_COLORS.green },
  Leg: { shape: "flatDiamond", color: SNFG_COLORS.yellow },
  Kdo: { shape: "hexagon", color: SNFG_COLORS.yellow },
  LDmanHep: { shape: "hexagon", color: SNFG_COLORS.green },
} as const;

function AdditionalSymbol({
  name,
  x = 0,
  y = 0,
  size = SYMBOL_SIZE,
  label,
  showLabel = true,
}: SymbolProps & { name: keyof typeof additionalSymbols }) {
  const { shape, color } = additionalSymbols[name];
  const r = size / 2;
  const diamond = `${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`;
  const stroke = { stroke: "#333", strokeWidth: STROKE_WIDTH };

  return (
    <g>
      {shape === "triangle" && (
        <polygon
          points={`${x},${y - size * 0.433} ${x + r},${y + size * 0.433} ${x - r},${y + size * 0.433}`}
          fill={color}
          {...stroke}
        />
      )}
      {shape === "rectangle" && (
        <rect x={x - r} y={y - size * 0.289} width={size} height={size * 0.578} fill={color} {...stroke} />
      )}
      {shape === "diamond" && <polygon points={diamond} fill={color} {...stroke} />}
      {shape === "star" && <polygon points={starPoints(x, y, r)} fill={color} {...stroke} />}
      {shape === "flatDiamond" && (
        <polygon
          points={`${x - r},${y} ${x},${y - r * 0.6} ${x + r},${y} ${x},${y + r * 0.6}`}
          fill={color}
          {...stroke}
        />
      )}
      {(shape === "splitDiamondTop" || shape === "splitDiamondBottom") && (
        <>
          <polygon points={diamond} fill={SNFG_COLORS.white} {...stroke} />
          <polygon
            points={shape === "splitDiamondTop"
              ? `${x - r},${y} ${x},${y - r} ${x + r},${y}`
              : `${x - r},${y} ${x},${y + r} ${x + r},${y}`}
            fill={color}
            stroke="none"
          />
          <line x1={x - r} y1={y} x2={x + r} y2={y} {...stroke} />
        </>
      )}
      {shape === "hexagon" && (
        <polygon
          points={`${x - r},${y} ${x - r / 2},${y - r * 0.612} ${x + r / 2},${y - r * 0.612} ${x + r},${y} ${x + r / 2},${y + r * 0.612} ${x - r / 2},${y + r * 0.612}`}
          fill={color}
          {...stroke}
        />
      )}
      {shape === "pentagon" && (
        <polygon
          points={`${x},${y - r} ${x + r},${y - r * 0.23} ${x + r * 0.62},${y + r} ${x - r * 0.62},${y + r} ${x - r},${y - r * 0.23}`}
          fill={color}
          {...stroke}
        />
      )}
      {showLabel && (
        <text x={x} y={y + r + 12} textAnchor="middle" fontSize="11" fill="#333" fontFamily="sans-serif">
          {label || name}
        </text>
      )}
    </g>
  );
}

const symbolMap: Record<string, React.FC<SymbolProps>> = {
  GlcNAc,
  GalNAc,
  HexNAc,
  Glc,
  Man,
  Gal,
  Hex,
  Fuc,
  Neu5Ac,
  Neu5Gc,
  Xyl,
};

interface MonosaccharideSymbolProps {
  name: string;
  x?: number;
  y?: number;
  size?: number;
  showLabel?: boolean;
}

export function MonosaccharideSymbol({ name, ...props }: MonosaccharideSymbolProps) {
  const Component = symbolMap[name];
  if (Component) return <Component {...props} />;
  if (name in additionalSymbols) {
    return <AdditionalSymbol name={name as keyof typeof additionalSymbols} {...props} />;
  }
  return (
    <g>
      <circle cx={props.x || 0} cy={props.y || 0} r={(props.size || SYMBOL_SIZE) / 2} fill="#ccc" stroke="#333" strokeWidth={STROKE_WIDTH} />
      {props.showLabel !== false && (
        <text x={props.x || 0} y={(props.y || 0) + (props.size || SYMBOL_SIZE) / 2 + 12} textAnchor="middle" fontSize="11" fill="#333">
          {name}
        </text>
      )}
    </g>
  );
}

interface GlycanStructureProps {
  monosaccharides: string[];
  bonds: { from: number; to: number; linkage: string }[];
  width?: number;
  height?: number;
}

type CompositionSymbolsProps = Omit<GlycanStructureProps, "bonds">;

function SymbolSequence({ monosaccharides, width, height, bonds = [] }: CompositionSymbolsProps & { bonds?: GlycanStructureProps["bonds"] }) {
  if (!monosaccharides || monosaccharides.length === 0) return null;

  const symbolSize = 18;
  const longestLabel = monosaccharides.reduce((m, s) => Math.max(m, s.length), 0);
  const spacing = longestLabel >= 6 ? 46 : longestLabel >= 4 ? 36 : 28;
  const totalWidth = width || Math.max(monosaccharides.length * spacing + 20, 60);
  const totalHeight = height || 55;
  const startX = totalWidth / 2 - ((monosaccharides.length - 1) * spacing) / 2;
  const centerY = 16;

  return (
    <svg width={totalWidth} height={totalHeight} viewBox={`0 0 ${totalWidth} ${totalHeight}`} role="img" aria-label={bonds.length ? `Linkage-defined structure: ${monosaccharides.join(", ")}` : `Composition symbols, connections unspecified: ${monosaccharides.join(", ")}`}>
      {bonds.map(({ from, to, linkage }, i) => (
        <line
          key={`bond-${i}`}
          x1={startX + from * spacing + symbolSize / 2}
          y1={centerY}
          x2={startX + to * spacing - symbolSize / 2}
          y2={centerY}
          stroke="#555"
          strokeWidth={1.5}
          aria-label={linkage}
        />
      ))}
      {monosaccharides.map((mono, i) => {
        const x = startX + i * spacing;
        return (
          <MonosaccharideSymbol
            key={`sym-${i}`}
            name={mono}
            x={x}
            y={centerY}
            size={symbolSize}
            showLabel={true}
          />
        );
      })}
    </svg>
  );
}

/** Use for residue lists whose order and linkages have not been established. */
export function CompositionSymbols(props: CompositionSymbolsProps) {
  return <SymbolSequence {...props} />;
}

/** Use only with explicit topology and linkage assignments. */
export function GlycanStructureSVG({ bonds, ...props }: GlycanStructureProps) {
  return <SymbolSequence {...props} bonds={bonds} />;
}

export function SNFGLegend() {
  const legendItems: { name: string; fullName: React.ReactNode; shape: string; color: string }[] = [
    { name: "GlcNAc", fullName: <><em>N</em>-Acetylglucosamine</>, shape: "Square", color: "Blue" },
    { name: "GalNAc", fullName: <><em>N</em>-Acetylgalactosamine</>, shape: "Square", color: "Yellow" },
    { name: "HexNAc", fullName: <><em>N</em>-Acetylhexosamine (generic)</>, shape: "Square", color: "White" },
    { name: "Man", fullName: "Mannose", shape: "Circle", color: "Green" },
    { name: "Gal", fullName: "Galactose", shape: "Circle", color: "Yellow" },
    { name: "Glc", fullName: "Glucose", shape: "Circle", color: "Blue" },
    { name: "Hex", fullName: "Hexose (generic)", shape: "Circle", color: "White" },
    { name: "Fuc", fullName: "Fucose", shape: "Triangle", color: "Red" },
    { name: "Neu5Ac", fullName: <><em>N</em>-Acetylneuraminic acid</>, shape: "Diamond", color: "Purple" },
    { name: "Neu5Gc", fullName: <><em>N</em>-Glycolylneuraminic acid</>, shape: "Diamond", color: "Light Blue" },
    { name: "Xyl", fullName: "Xylose", shape: "Star", color: "Orange" },
    { name: "Ara", fullName: "Arabinose", shape: "Star", color: "Green" },
    { name: "Pse", fullName: "Pseudaminic acid", shape: "Flat diamond", color: "Green" },
    { name: "Leg", fullName: "Legionaminic acid", shape: "Flat diamond", color: "Yellow" },
    { name: "Kdo", fullName: <>3-Deoxy-<span style={{ fontVariant: "small-caps" }}>d</span>-<em>manno</em>-oct-2-ulosonic acid</>, shape: "Flat hexagon", color: "Yellow" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {legendItems.map((item) => (
        <div key={item.name} className="flex items-center gap-3 p-2 rounded-lg bg-white border border-gray-100">
          <svg width="32" height="32" viewBox="-16 -16 32 32">
            <MonosaccharideSymbol name={item.name} x={0} y={0} size={22} showLabel={false} />
          </svg>
          <div>
            <div className="font-semibold text-sm text-gray-900">{item.name}</div>
            <div className="text-xs text-gray-600">{item.fullName}</div>
            <div className="text-xs text-gray-600">{item.shape} / {item.color}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
