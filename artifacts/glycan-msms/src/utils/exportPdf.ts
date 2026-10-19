import jsPDF from "jspdf";
import { getGlytoucanIdsForIon, references, type DiagnosticIon } from "../data/glycanData";
import { SNFG_COLORS } from "../components/SNFGSymbols";

const SNFG_SHAPE_MAP: Record<string, { shape: "square" | "circle" | "triangle" | "diamond" | "star"; color: string }> = {
  GlcNAc: { shape: "square", color: SNFG_COLORS.blue },
  GalNAc: { shape: "square", color: SNFG_COLORS.yellow },
  HexNAc: { shape: "square", color: SNFG_COLORS.white },
  Man: { shape: "circle", color: SNFG_COLORS.green },
  Gal: { shape: "circle", color: SNFG_COLORS.yellow },
  Glc: { shape: "circle", color: SNFG_COLORS.blue },
  Hex: { shape: "circle", color: SNFG_COLORS.white },
  Fuc: { shape: "triangle", color: SNFG_COLORS.red },
  Neu5Ac: { shape: "diamond", color: SNFG_COLORS.purple },
  Neu5Gc: { shape: "diamond", color: SNFG_COLORS.lightBlue },
  Xyl: { shape: "star", color: SNFG_COLORS.orange },
};

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function drawPolygon(doc: jsPDF, pts: number[][]) {
  const deltas = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
  doc.lines(deltas, pts[0][0], pts[0][1], [1, 1], "FD", true);
}

function drawSNFGSymbol(doc: jsPDF, name: string, cx: number, cy: number, size: number) {
  const info = SNFG_SHAPE_MAP[name];
  if (!info) {
    doc.setFillColor(200, 200, 200);
    doc.setDrawColor(80, 80, 80);
    doc.circle(cx, cy, size / 2, "FD");
    return;
  }

  const [r, g, b] = hexToRgb(info.color);
  doc.setFillColor(r, g, b);
  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.3);

  const half = size / 2;

  switch (info.shape) {
    case "square":
      doc.rect(cx - half, cy - half, size, size, "FD");
      break;
    case "circle":
      doc.circle(cx, cy, half, "FD");
      break;
    case "triangle": {
      const h = size * 0.866;
      const triPts: number[][] = [
        [cx, cy - h / 2],
        [cx + half, cy + h / 2],
        [cx - half, cy + h / 2],
      ];
      drawPolygon(doc, triPts);
      break;
    }
    case "diamond": {
      const dPts: number[][] = [
        [cx, cy - half],
        [cx + half, cy],
        [cx, cy + half],
        [cx - half, cy],
      ];
      drawPolygon(doc, dPts);
      break;
    }
    case "star": {
      const outerR = half;
      const innerR = half * 0.4;
      const starPts: number[][] = [];
      for (let i = 0; i < 5; i++) {
        const outerAngle = (Math.PI / 2) + (2 * Math.PI * i / 5);
        starPts.push([cx + outerR * Math.cos(outerAngle), cy - outerR * Math.sin(outerAngle)]);
        const innerAngle = outerAngle + Math.PI / 5;
        starPts.push([cx + innerR * Math.cos(innerAngle), cy - innerR * Math.sin(innerAngle)]);
      }
      drawPolygon(doc, starPts);
      break;
    }
  }
}

function drawMonosaccharideRow(doc: jsPDF, monosaccharides: string[], x: number, y: number, maxWidth: number): number {
  const symbolSize = 4;
  const spacing = 7;
  const labelFontSize = 5;
  const totalSymbols = monosaccharides.length;
  const totalDrawWidth = totalSymbols * spacing;

  const startX = x + Math.min(maxWidth, totalDrawWidth) / 2 - ((totalSymbols - 1) * spacing) / 2;
  const centerY = y + symbolSize / 2 + 1;

  for (let i = 0; i < totalSymbols - 1; i++) {
    const sx = startX + i * spacing + symbolSize / 2;
    const nx = startX + (i + 1) * spacing - symbolSize / 2;
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.2);
    doc.line(sx, centerY, nx, centerY);
  }

  for (let i = 0; i < totalSymbols; i++) {
    const sx = startX + i * spacing;
    drawSNFGSymbol(doc, monosaccharides[i], sx, centerY, symbolSize);
    doc.setFontSize(labelFontSize);
    doc.setTextColor(80, 80, 80);
    doc.text(monosaccharides[i], sx, centerY + symbolSize / 2 + 3, { align: "center" });
  }

  return symbolSize + 6;
}

function cleanText(text: string): string {
  return text
    .replace(/₀/g, "0").replace(/₁/g, "1").replace(/₂/g, "2")
    .replace(/₃/g, "3").replace(/₄/g, "4").replace(/₅/g, "5")
    .replace(/₆/g, "6").replace(/₇/g, "7").replace(/₈/g, "8")
    .replace(/₉/g, "9")
    .replace(/⁰/g, "0").replace(/¹/g, "1").replace(/²/g, "2")
    .replace(/³/g, "3").replace(/⁴/g, "4").replace(/⁵/g, "5")
    .replace(/⁶/g, "6").replace(/⁷/g, "7").replace(/⁸/g, "8")
    .replace(/⁹/g, "9")
    .replace(/⁺/g, "+").replace(/⁻/g, "-")
    .replace(/·/g, ",");
}

export function exportPdf(ions: DiagnosticIon[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginL = 12;
  const marginR = 12;
  const marginT = 16;
  const marginB = 14;
  const contentW = pageW - marginL - marginR;
  const refById = new Map(references.map((reference) => [reference.id, reference]));
  let y = marginT;
  let pageNum = 1;

  const addPageFooter = () => {
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${pageNum}`, pageW / 2, pageH - 6, { align: "center" });
    doc.text("GlycoMSGuide: A Practical Guide to Glycan MS/MS Interpretation", marginL, pageH - 6);
  };

  const checkNewPage = (needed: number) => {
    if (y + needed > pageH - marginB) {
      addPageFooter();
      doc.addPage();
      pageNum++;
      y = marginT;
    }
  };

  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.text("GlycoMSGuide: A Practical Guide to Glycan MS/MS Interpretation", marginL, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Structural features and diagnostic ions for glycan composition, topology, and structure assignment", marginL, y);
  y += 3;
  doc.text(`${ions.length} diagnostic ions | Generated ${new Date().toLocaleDateString()}`, marginL, y);
  y += 5;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, pageW - marginR, y);
  y += 2;

  const legendY = y;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(50, 50, 50);
  doc.text("SNFG Symbol Legend", marginL, y);
  y += 4;

  const legendSymbols = [
    "GlcNAc", "GalNAc", "HexNAc", "Man", "Gal", "Glc", "Hex", "Fuc", "Neu5Ac", "Neu5Gc", "Xyl"
  ];
  const colCount = 6;
  const colW = contentW / colCount;
  legendSymbols.forEach((name, i) => {
    const col = i % colCount;
    const row = Math.floor(i / colCount);
    const lx = marginL + col * colW;
    const ly = y + row * 7;
    drawSNFGSymbol(doc, name, lx + 3, ly + 1.5, 3.5);
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(name, lx + 7, ly + 2.5);
  });
  y += Math.ceil(legendSymbols.length / colCount) * 7 + 2;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(marginL, y, pageW - marginR, y);
  y += 5;

  ions.forEach((ion, idx) => {
    const hasMonos = ion.monosaccharides && ion.monosaccharides.length > 0;
    const gtcIds = getGlytoucanIdsForIon(ion);
    const hasGtc = gtcIds.length > 0;
    const evidenceLines = ion.verification === "source"
      ? ion.evidence.flatMap((evidence) => {
          const reference = refById.get(evidence.sourceKey);
          const shortReference = reference ? `${reference.authors} (${reference.year})` : evidence.sourceKey;
          const primaryReferences = evidence.evidenceType === "compilation" && evidence.primaryReferences?.length
            ? `; primary references: ${evidence.primaryReferences.join("; ")}`
            : "";
          const evidenceType = evidence.evidenceType === "compilation" ? "compilation" : "primary observation";
          const text = `Evidence (${evidenceType}): ${shortReference} — ${evidence.locator}; reported m/z ${evidence.reportedMz}; "${evidence.reportedAssignment}"; ${evidence.context}${primaryReferences}`;
          doc.setFontSize(5.5);
          return doc.splitTextToSize(cleanText(text), contentW - 8) as string[];
        })
      : [];
    const baseCardHeight = hasMonos ? (hasGtc ? 27 : 24) : (hasGtc ? 19 : 16);
    const cardHeight = baseCardHeight + 3 + (ion.verification === "source" ? Math.max(1, evidenceLines.length) * 2.5 : 0);
    checkNewPage(cardHeight);

    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(252, 252, 253);
    doc.roundedRect(marginL, y - 1, contentW, cardHeight, 1.5, 1.5, "FD");

    const textX = marginL + 3;
    let lineY = y + 3;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text(`m/z ${ion.mz.toFixed(4)}`, textX, lineY);

    const mzWidth = doc.getTextWidth(`m/z ${ion.mz.toFixed(4)}`);
    let badgeX = textX + mzWidth + 3;

    doc.setFontSize(6);
    const catLabel = ion.category.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    const catW = doc.getTextWidth(catLabel) + 4;
    doc.setFillColor(230, 230, 250);
    doc.roundedRect(badgeX, lineY - 3, catW, 4, 1, 1, "F");
    doc.setTextColor(80, 80, 130);
    doc.setFont("helvetica", "normal");
    doc.text(catLabel, badgeX + 2, lineY - 0.5);
    badgeX += catW + 2;

    if (ion.ionType) {
      const itW = doc.getTextWidth(ion.ionType) + 4;
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(badgeX, lineY - 3, itW, 4, 1, 1, "F");
      doc.setTextColor(100, 100, 100);
      doc.text(ion.ionType, badgeX + 2, lineY - 0.5);
      badgeX += itW + 2;
    }

    const polLabel = ion.polarity === "positive" ? "[+]" : "[-]";
    const polW = doc.getTextWidth(polLabel) + 3;
    if (ion.polarity === "positive") {
      doc.setFillColor(254, 226, 226);
      doc.setTextColor(180, 50, 50);
    } else {
      doc.setFillColor(219, 234, 254);
      doc.setTextColor(50, 50, 180);
    }
    doc.roundedRect(badgeX, lineY - 3, polW, 4, 1, 1, "F");
    doc.text(polLabel, badgeX + 1.5, lineY - 0.5);

    lineY += 4.5;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const descText = cleanText(ion.description);
    const maxDescW = hasMonos ? contentW - 55 : contentW - 8;
    const descLines = doc.splitTextToSize(descText, maxDescW);
    doc.text(descLines[0], textX, lineY);

    lineY += 3;
    doc.setFontSize(6.5);
    doc.setTextColor(120, 120, 120);
    const compText = cleanText(ion.composition);
    doc.text(compText, textX, lineY);

    lineY += 3;
    doc.setFontSize(6);
    doc.setTextColor(100, 100, 100);
    const charge = ion.charge > 0 ? `+${ion.charge}` : String(ion.charge);
    doc.text(`Formula: ${ion.formula} | Charge: ${charge} | ${ion.verification === "source" ? "Source-verified" : "Calculated composition"}`, textX, lineY);

    if (ion.subCategory) {
      lineY += 3;
      doc.setFontSize(6);
      doc.setTextColor(150, 150, 150);
      doc.text(ion.subCategory, textX, lineY);
    }

    if (hasGtc) {
      lineY += 3;
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 100, 180);
      const gtcText = "GlyTouCan: " + gtcIds.map(e => `${e.name} (${e.id})`).join(" | ");
      doc.textWithLink(gtcText, textX, lineY, { url: `https://glytoucan.org/Structures/Glycans/${gtcIds[0].id}` });
    }

    if (ion.verification === "source") {
      lineY += 3;
      doc.setFontSize(5.5);
      doc.setTextColor(70, 70, 70);
      for (const evidenceLine of evidenceLines) {
        doc.text(evidenceLine, textX, lineY);
        lineY += 2.5;
      }
    } else {
      lineY += 3;
      doc.setFontSize(6);
      doc.setTextColor(110, 110, 110);
      doc.text("Calculated composition", textX, lineY);
    }

    if (hasMonos) {
      const monoX = marginL + contentW - 50;
      drawMonosaccharideRow(doc, ion.monosaccharides!, monoX, y + 2, 45);
    }

    y += cardHeight + 2;
  });

  addPageFooter();
  doc.save("glycan_diagnostic_ions.pdf");
}
