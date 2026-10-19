import {
  monosaccharideDatasetFieldDefinitions,
  monosaccharideDatasetLastUpdated,
  type MonosaccharideModification,
} from "./monosaccharidesData";

export const monosaccharideExportCsvHeaders = [
  "ID",
  "Type",
  "Name",
  "Short Name",
  "Synonyms",
  "Category",
  "Formula",
  "Monoisotopic Mass / Net Mass Shift",
  "Scope",
  "Mammalian Relevance",
  "Biological Contexts",
  "Primary References",
  "Sources",
  "Related/Supporting Ions",
  "Dataset Last Updated",
  "Record Last Updated",
] as const;

function escapeCsv(value: string | number): string {
  const text = String(value);
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildMonosaccharideCsv(
  visibleRecords: readonly MonosaccharideModification[],
): string {
  const rows = visibleRecords.map((item) =>
    [
      item.id,
      item.recordType,
      item.name,
      item.shortName,
      item.synonyms.join("; "),
      item.category,
      item.formula,
      item.monoisotopicMass ?? item.massShift ?? "",
      item.glycoMSGuideStatus,
      item.mammalianRelevance,
      item.biologicalScope.join("; "),
      (item.primaryReferences ?? []).join("; "),
      item.sourceResources
        .map((source) =>
          [source.resource, source.url, source.accessed].filter(Boolean).join(" | "),
        )
        .join("; "),
      (item.relatedDiagnosticIons ?? [])
        .map((ion) => `${ion.mz.toFixed(4)} [${ion.specificity}]`)
        .join("; "),
      monosaccharideDatasetLastUpdated,
      item.lastUpdated,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [monosaccharideExportCsvHeaders.join(","), ...rows].join("\n");
}

export interface MonosaccharideJsonExport {
  datasetName: string;
  lastUpdated: string;
  entryCount: number;
  fieldDefinitions: typeof monosaccharideDatasetFieldDefinitions;
  sources: Array<{ resource: string; role: string; license?: string }>;
  licenseNotes: string;
  records: readonly MonosaccharideModification[];
}

export function buildMonosaccharideJson(
  visibleRecords: readonly MonosaccharideModification[],
): MonosaccharideJsonExport {
  return {
    datasetName: "GlycoMSGuide Monosaccharides and Modifications",
    lastUpdated: monosaccharideDatasetLastUpdated,
    entryCount: visibleRecords.length,
    fieldDefinitions: monosaccharideDatasetFieldDefinitions,
    sources: [
      {
        resource: "GlyCosmos",
        role: "Structural and identifier reference",
        license: "CC BY 4.0",
      },
      { resource: "GlyGen", role: "Biological-context reference" },
    ],
    licenseNotes:
      "Source attribution is retained. GlycoMSGuide-authored descriptions, MS considerations, and curation labels are distinct from imported source metadata.",
    records: visibleRecords,
  };
}