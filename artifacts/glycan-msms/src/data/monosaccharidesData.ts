export const monosaccharideDatasetLastUpdated = "2026-10-15";

export const monosaccharideDatasetFieldDefinitions = {
  massShift: {
    appliesTo: "modification records",
    definition:
      "The net elemental and monoisotopic mass change after covalent attachment to the glycan or residue, including the loss of any leaving group.",
    formulaDefinition:
      "For modification records, formula is the signed net elemental composition corresponding to massShift. It is not the molecular formula or mass of the free reagent.",
    unit: "Da",
  },
  relatedDiagnosticIons: {
    definition:
      "Ion links associated with a record. Each link includes an m/z value and a specificity classification that states what the ion can support.",
    specificity: {
      "residue-specific":
        "Supports the named residue with substantially greater specificity than a generic composition ion.",
      "composition-supporting":
        "Supports a residue composition or mass class but does not distinguish structural or stereochemical isomers.",
      "motif-associated":
        "Supports a larger glycan motif or multi-residue feature that contains or is associated with the named record.",
      "context-dependent":
        "Supports the assignment only when ion mode, derivatization, organism, sample type, or other analytical context is also considered.",
    },
  },
} as const;

export type RecordType = "monosaccharide" | "modification";
export type BiologicalScope = "Mammalian" | "Vertebrate" | "Invertebrate" | "Microbial" | "Plant" | "Fungal" | "Broadly distributed" | "Other / context-dependent";
export type MammalianRelevance = "Common" | "Known but uncommon" | "Context-dependent" | "Exogenous / dietary possible" | "Not typically expected" | "Not established";
export type GlycoMSGuideStatus = "Core mammalian" | "Extended biological context";
export type IonSpecificity =
  | "residue-specific"
  | "composition-supporting"
  | "motif-associated"
  | "context-dependent";

export interface RelatedDiagnosticIon {
  mz: number;
  specificity: IonSpecificity;
}

export interface SourceResource {
  resource: string;
  url?: string;
  accessed: string;
}

export interface MonosaccharideModification {
  id: string;
  recordType: RecordType;
  name: string;
  shortName: string;
  synonyms: string[];
  category: string;
  formula: string;
  monoisotopicMass?: number;
  /**
   * Net monoisotopic mass change after covalent attachment, including the
   * loss of any leaving group. This is not the mass of the free reagent.
   */
  massShift?: number;
  snfgSymbol?: string;
  description: string;
  
  biologicalScope: BiologicalScope[];
  mammalianRelevance: MammalianRelevance;
  organismNotes?: string;
  
  commonTargets?: string[];
  stability?: string;
  samplePreparationConsiderations?: string;
  msConsiderations?: string;
  
  glyTouCanIds?: string[];
  chebiId?: string;
  pubChemCid?: string;
  
  sourceResources: SourceResource[];
  primaryReferences?: string[];
  
  glycoMSGuideStatus: GlycoMSGuideStatus;
  curationNotes?: string;
  lastUpdated: string;
  
  relatedDiagnosticIons?: RelatedDiagnosticIon[];
}

const glycosmosSource = (path = ""): SourceResource => ({
  resource: "GlyCosmos",
  url: `https://glycosmos.org${path}`,
  accessed: monosaccharideDatasetLastUpdated,
});

const glygenSource: SourceResource = {
  resource: "GlyGen",
  url: "https://glygen.org/",
  accessed: monosaccharideDatasetLastUpdated,
};

const expandedReviewedRecords: MonosaccharideModification[] = [
  {
    id: "glc", recordType: "monosaccharide", name: "Glucose", shortName: "Glc", synonyms: ["Dextrose"],
    category: "Hexose", formula: "C6H12O6", monoisotopicMass: 180.06339, snfgSymbol: "Glc",
    description: "A hexose found in glycogen and glycolipids and as the transient terminal residue of the N-glycan precursor before ER glucosidase trimming.",
    biologicalScope: ["Broadly distributed"], mammalianRelevance: "Common",
    msConsiderations: "Isobaric with Gal and Man; composition-level Hex evidence does not identify the epimer.",
    chebiId: "17634", pubChemCid: "5793", sourceResources: [glycosmosSource()],
    primaryReferences: ["Helenius A, Aebi M. Intracellular functions of N-linked glycans. Science. 2001;291:2364-2369. DOI: 10.1126/science.291.5512.2364."],
    glycoMSGuideStatus: "Core mammalian", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [
      { mz: 163.0601, specificity: "composition-supporting" },
    ],
  },
  {
    id: "glca", recordType: "monosaccharide", name: "Glucuronic acid", shortName: "GlcA", synonyms: ["D-Glucuronic acid"],
    category: "Uronic acid", formula: "C6H10O7", monoisotopicMass: 194.04265, snfgSymbol: "GlcA",
    description: "A uronic acid in glycosaminoglycans, the proteoglycan linkage region, and glucuronide conjugates.",
    biologicalScope: ["Broadly distributed"], mammalianRelevance: "Common", organismNotes: "Common in hyaluronan, chondroitin sulfate, and heparan sulfate.",
    msConsiderations: "Acidic glycans are favored in negative-ion analysis; decarboxylation can produce a 44 Da neutral loss.",
    chebiId: "4178", pubChemCid: "65092", sourceResources: [glycosmosSource()],
    primaryReferences: ["Moremen KW, Tiemeyer M, Nairn AV. Vertebrate protein glycosylation: diversity, synthesis and function. Nat Rev Mol Cell Biol. 2012;13:448-462. DOI: 10.1038/nrm3383."],
    glycoMSGuideStatus: "Core mammalian", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "idoa", recordType: "monosaccharide", name: "Iduronic acid", shortName: "IdoA", synonyms: ["L-Iduronic acid"],
    category: "Uronic acid", formula: "C6H10O7", monoisotopicMass: 194.04265, snfgSymbol: "IdoA",
    description: "The C5 epimer of GlcA, generated after polymerization in dermatan sulfate and heparin/heparan sulfate.",
    biologicalScope: ["Mammalian", "Vertebrate"], mammalianRelevance: "Common",
    msConsiderations: "Isobaric with GlcA; assignment requires linkage-aware fragmentation, standards, or orthogonal evidence.",
    chebiId: "27856", sourceResources: [glycosmosSource()],
    primaryReferences: ["Malmström A, Fransson LA. Biosynthesis of dermatan sulfate. I. Formation of L-iduronic acid residues. J Biol Chem. 1975;250:3419-3425. DOI: 10.1016/S0021-9258(19)41532-9."],
    glycoMSGuideStatus: "Core mammalian", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "kdn", recordType: "monosaccharide", name: "3-Deoxy-D-glycero-D-galacto-non-2-ulosonic acid", shortName: "Kdn", synonyms: ["Deaminoneuraminic acid"],
    category: "Sialic acid", formula: "C9H16O9", monoisotopicMass: 268.07943, snfgSymbol: "Kdn",
    description: "A deaminated sialic acid occurring widely in vertebrates and prominent in some fish and amphibian glycoconjugates.",
    biologicalScope: ["Vertebrate", "Mammalian"], mammalianRelevance: "Known but uncommon",
    organismNotes: "Detected in human and other mammalian tissues at low or context-dependent abundance.",
    msConsiderations: "The Kdn residue (C₉H₁₄O₈, 250.0689 Da) is 41.0265 Da (C₂H₃N) lighter than Neu5Ac. Kdn-derived oxonium ions contain no nitrogen, so they fall 41.0265 Da below the corresponding Neu5Ac ions; confirm with exact mass, precursor composition and contextual fragments.",
    chebiId: "61120", sourceResources: [glycosmosSource()],
    primaryReferences: ["Inoue S, Kitajima K. KDN (deaminated neuraminic acid): dreamful past and exciting future of the newest member of the sialic acid family. Glycoconj J. 2006;23:277-290. DOI: 10.1007/s10719-006-6484-y."],
    glycoMSGuideStatus: "Core mammalian", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "gala", recordType: "monosaccharide", name: "Galacturonic acid", shortName: "GalA", synonyms: ["D-Galacturonic acid"],
    category: "Uronic acid", formula: "C6H10O7", monoisotopicMass: 194.04265, snfgSymbol: "GalA",
    description: "The principal acidic residue of plant pectins and a component of some microbial polysaccharides.",
    biologicalScope: ["Plant", "Microbial"], mammalianRelevance: "Exogenous / dietary possible",
    msConsiderations: "Isobaric with GlcA and IdoA; source context and orthogonal structural evidence are required.",
    chebiId: "4156", pubChemCid: "439215", sourceResources: [glycosmosSource()],
    primaryReferences: ["Mohnen D. Pectin structure and biosynthesis. Curr Opin Plant Biol. 2008;11:266-277. DOI: 10.1016/j.pbi.2008.03.006."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "rha", recordType: "monosaccharide", name: "Rhamnose", shortName: "Rha", synonyms: ["6-Deoxy-L-mannose"],
    category: "Deoxyhexose", formula: "C6H12O5", monoisotopicMass: 164.06847, snfgSymbol: "Rha",
    description: "A deoxyhexose common in plants and bacteria and present in some fungal and protist glycans.",
    biologicalScope: ["Plant", "Microbial", "Fungal"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Isobaric with fucose; a dHex composition or m/z 147 ion alone cannot distinguish Rha from Fuc.",
    chebiId: "26546", pubChemCid: "25310", sourceResources: [glycosmosSource()],
    primaryReferences: ["Giraud MF, Naismith JH. The rhamnose pathway. Curr Opin Struct Biol. 2000;10:687-696. DOI: 10.1016/S0959-440X(00)00145-7."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [
    ],
  },
  {
    id: "qui", recordType: "monosaccharide", name: "Quinovose", shortName: "Qui", synonyms: ["6-Deoxy-D-glucose"],
    category: "Deoxyhexose", formula: "C6H12O5", monoisotopicMass: 164.06847, snfgSymbol: "Qui",
    description: "A deoxyhexose reported in bacterial, algal, plant, and marine-invertebrate glycans.",
    biologicalScope: ["Microbial", "Plant", "Invertebrate"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Isobaric with Fuc and Rha; do not assign from dHex mass alone.",
    chebiId: "75905", sourceResources: [glycosmosSource()],
    primaryReferences: ["Toukach PV, Egorova KS. Carbohydrate structure database merged from bacterial, archaeal, plant and fungal parts. Nucleic Acids Res. 2016;44:D1229-D1236. DOI: 10.1093/nar/gkv840."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [
    ],
  },
  {
    id: "murNAc", recordType: "monosaccharide", name: "N-Acetylmuramic acid", shortName: "MurNAc", synonyms: ["NAM"],
    category: "Other", formula: "C11H19NO8", monoisotopicMass: 293.11107, snfgSymbol: "MurNAc",
    description: "A lactylated amino sugar that alternates with GlcNAc in bacterial peptidoglycan.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Useful as evidence of bacterial peptidoglycan, but confirm against peptide-linked muramyl fragments and sample context.",
    chebiId: "47966", pubChemCid: "82756", sourceResources: [glycosmosSource()],
    primaryReferences: ["Vollmer W, Blanot D, de Pedro MA. Peptidoglycan structure and architecture. FEMS Microbiol Rev. 2008;32:149-167. DOI: 10.1111/j.1574-6976.2007.00094.x."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "bac", recordType: "monosaccharide", name: "N,N'-Diacetylbacillosamine", shortName: "diNAcBac", synonyms: ["2,4-Diacetamido-2,4,6-trideoxy-D-glucose"],
    category: "Other", formula: "C10H18N2O5", monoisotopicMass: 246.12157, snfgSymbol: "Bac",
    description: "A bacterial diamino trideoxy sugar used at the reducing end of several bacterial N-linked glycans. In SNFG it is drawn with the Bac symbol (blue flat hexagon, bacillosamine); the two N-acetyl groups may be annotated (e.g. 2,4Ac₂), though figures often leave them implicit.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Bac-containing glycopeptides require organism-aware composition rules; mammalian search spaces generally omit this residue.",
    sourceResources: [glycosmosSource()],
    primaryReferences: ["Young NM et al. Structure of the N-linked glycan present on multiple glycoproteins in the Gram-negative bacterium, Campylobacter jejuni. J Biol Chem. 2002;277:42530-42539. DOI: 10.1074/jbc.M206114200."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "pse", recordType: "monosaccharide", name: "Pseudaminic acid (5,7-di-N-acetyl form)", shortName: "Pse", synonyms: ["Pse5Ac7Ac", "5,7-Diacetamido-3,5,7,9-tetradeoxy-L-glycero-L-manno-non-2-ulosonic acid"],
    snfgSymbol: "Pse",
    category: "Nonulosonic acid", formula: "C13H22N2O8", monoisotopicMass: 334.13762,
    description: "A bacterial nonulosonic acid frequently decorating flagellins and other cell-surface glycoconjugates. Formula and mass are given for the common 5,7-di-N-acetylated form (Pse5Ac7Ac); other N-acyl forms (e.g. acetamidino, Pse5Am7Ac) differ in mass.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Nonulosonic-acid derivatives vary in acylation; use exact precursor and fragment masses rather than a generic sialic-acid assignment.",
    chebiId: "86311", sourceResources: [glycosmosSource()],
    primaryReferences: ["Thibault P et al. Identification of the carbohydrate moieties and glycosylation motifs in Campylobacter jejuni flagellin. J Biol Chem. 2001;276:34862-34870. DOI: 10.1074/jbc.M104529200."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "leg", recordType: "monosaccharide", name: "Legionaminic acid (5,7-di-N-acetyl form)", shortName: "Leg", synonyms: ["Leg5Ac7Ac", "5,7-Diacetamido-3,5,7,9-tetradeoxy-D-glycero-D-galacto-non-2-ulosonic acid"],
    snfgSymbol: "Leg",
    category: "Nonulosonic acid", formula: "C13H22N2O8", monoisotopicMass: 334.13762,
    description: "A bacterial nonulosonic acid related to pseudaminic acid and found in cell-surface glycoconjugates. Formula and mass are given for the common 5,7-di-N-acetylated form (Leg5Ac7Ac).",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Isomeric with Pse in common forms; stereochemistry cannot be established by composition alone.",
    chebiId: "61284", sourceResources: [glycosmosSource()],
    primaryReferences: ["Schoenhofen IC et al. The CMP-legionaminic acid pathway in Campylobacter: biosynthesis involving novel GDP-linked precursors. Glycobiology. 2009;19:715-725. DOI: 10.1093/glycob/cwp039."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "heptose", recordType: "monosaccharide", name: "L-glycero-D-manno-Heptose", shortName: "Hep", synonyms: ["L,D-Heptose", "LDmanHep"],
    category: "Other", formula: "C7H14O7", monoisotopicMass: 210.07395, snfgSymbol: "LDmanHep",
    description: "A seven-carbon sugar in the inner core of many Gram-negative bacterial lipopolysaccharides.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Interpret together with Kdo and lipid A evidence when evaluating lipopolysaccharide.",
    sourceResources: [glycosmosSource()],
    primaryReferences: ["Raetz CRH, Whitfield C. Lipopolysaccharide endotoxins. Annu Rev Biochem. 2002;71:635-700. DOI: 10.1146/annurev.biochem.71.110601.135414."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "fru", recordType: "monosaccharide", name: "Fructose", shortName: "Fru", synonyms: ["Levulose"],
    category: "Hexose", formula: "C6H12O6", monoisotopicMass: 180.06339, snfgSymbol: "Fru",
    description: "A ketohexose prominent in plant fructans and dietary carbohydrates rather than mammalian protein glycans.",
    biologicalScope: ["Plant", "Broadly distributed"], mammalianRelevance: "Exogenous / dietary possible",
    msConsiderations: "Isobaric with aldohexoses; distinguish by chromatography, derivatization behavior, or diagnostic cross-ring fragmentation.",
    chebiId: "28757", pubChemCid: "5984", sourceResources: [glycosmosSource()],
    primaryReferences: ["Vijn I, Smeekens S. Fructan: more than a reserve carbohydrate? Plant Physiol. 1999;120:351-360. DOI: 10.1104/pp.120.2.351."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [
      { mz: 163.0601, specificity: "composition-supporting" },
    ],
  },
  {
    id: "tyv", recordType: "monosaccharide", name: "Tyvelose", shortName: "Tyv", synonyms: ["3,6-Dideoxy-D-arabino-hexose"],
    category: "Dideoxyhexose", formula: "C6H12O4", monoisotopicMass: 148.07356, snfgSymbol: "Tyv",
    description: "A dideoxyhexose in O-antigens of selected Salmonella serogroups and other bacterial polysaccharides.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Use only in organism-informed searches; distinguish from other dideoxyhexoses by structural evidence.",
    sourceResources: [glycosmosSource()],
    primaryReferences: ["Samuel G, Reeves P. Biosynthesis of O-antigens: genes and pathways involved in nucleotide sugar precursor synthesis and O-antigen assembly. Carbohydr Res. 2003;338:2503-2519. DOI: 10.1016/j.carres.2003.07.009."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "abe", recordType: "monosaccharide", name: "Abequose", shortName: "Abe", synonyms: ["3,6-Dideoxy-D-xylo-hexose"],
    category: "Dideoxyhexose", formula: "C6H12O4", monoisotopicMass: 148.07356, snfgSymbol: "Abe",
    description: "A dideoxyhexose in the O-antigen of several Salmonella serogroups.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Isomeric with several bacterial dideoxyhexoses; composition alone is insufficient.",
    sourceResources: [glycosmosSource()],
    primaryReferences: ["Samuel G, Reeves P. Biosynthesis of O-antigens: genes and pathways involved in nucleotide sugar precursor synthesis and O-antigen assembly. Carbohydr Res. 2003;338:2503-2519. DOI: 10.1016/j.carres.2003.07.009."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "col", recordType: "monosaccharide", name: "Colitose", shortName: "Col", synonyms: ["3,6-Dideoxy-L-xylo-hexose"],
    category: "Dideoxyhexose", formula: "C6H12O4", monoisotopicMass: 148.07356, snfgSymbol: "Col",
    description: "A bacterial dideoxyhexose found in selected O-antigens and capsular polysaccharides.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected",
    msConsiderations: "Do not distinguish bacterial dideoxyhexose stereoisomers from exact mass alone.",
    sourceResources: [glycosmosSource()],
    primaryReferences: ["Samuel G, Reeves P. Biosynthesis of O-antigens: genes and pathways involved in nucleotide sugar precursor synthesis and O-antigen assembly. Carbohydr Res. 2003;338:2503-2519. DOI: 10.1016/j.carres.2003.07.009."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "n-glycolylation", recordType: "modification", name: "N-Glycolylation", shortName: "N-Gc", synonyms: ["Glycolyl substitution"],
    category: "Modification/substituent", formula: "O", massShift: 15.99491,
    description: "Replacement of an N-acetyl group by N-glycolyl, most prominently converting Neu5Ac to Neu5Gc.",
    biologicalScope: ["Mammalian", "Vertebrate"], mammalianRelevance: "Context-dependent", commonTargets: ["Neu5Ac"],
    msConsiderations: "Neu5Gc is 15.9949 Da above Neu5Ac because N-glycolyl replaces N-acetyl; use the complete residue mass rather than applying this formal group shift blindly.",
    sourceResources: [glygenSource],
    primaryReferences: ["Chou HH et al. Inactivation of CMP-N-acetylneuraminic acid hydroxylase occurred prior to brain expansion during human evolution. Proc Natl Acad Sci USA. 2002;99:11736-11741. DOI: 10.1073/pnas.182257399."],
    glycoMSGuideStatus: "Core mammalian", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [
      { mz: 290.0870, specificity: "context-dependent" },
      { mz: 308.0976, specificity: "context-dependent" },
    ],
  },
  {
    id: "deacetylation", recordType: "modification", name: "N-Deacetylation", shortName: "deAc", synonyms: ["De-N-acetylation"],
    category: "Modification/substituent", formula: "-C2H2O", massShift: -42.01056,
    description: "Loss or enzymatic removal of an N-acetyl group from an amino sugar.",
    biologicalScope: ["Microbial", "Mammalian", "Vertebrate"], mammalianRelevance: "Context-dependent", commonTargets: ["GlcNAc"],
    stability: "Can arise biologically or during harsh sample handling.",
    msConsiderations: "A −42.0106 Da shift is not specific by itself; distinguish biology from in-source or preparation artefacts.",
    sourceResources: [glygenSource],
    primaryReferences: ["Vollmer W, Tomasz A. The pgdA gene encodes for a peptidoglycan N-acetylglucosamine deacetylase in Streptococcus pneumoniae. J Biol Chem. 2000;275:20496-20501. DOI: 10.1074/jbc.M910189199."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "amidation", recordType: "modification", name: "Carboxyl amidation", shortName: "Amide", synonyms: ["Amidated uronic acid"],
    category: "Modification/substituent", formula: "+NH-O", massShift: -0.98402,
    description: "Conversion of a carboxylic acid to an amide. Amidation is also used analytically to derivatize and stabilize acidic glycan groups.",
    biologicalScope: ["Other / context-dependent"], mammalianRelevance: "Not established", commonTargets: ["Uronic acids", "sialic acids"],
    msConsiderations: "Separate endogenous amidation from deliberate amidation used to stabilize acidic glycans during analysis.",
    sourceResources: [glygenSource],
    primaryReferences: ["Gil GC, Iliff B, Cerny R, Velander WH, Van Cott KE. High throughput quantification of N-glycans using one-pot sialic acid modification and matrix assisted laser desorption ionization time-of-flight mass spectrometry. Anal Chem. 2010;82:6613-6620. DOI: 10.1021/ac1011377."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "pyruvylation", recordType: "modification", name: "Pyruvylation", shortName: "Pyr", synonyms: ["Pyruvate ketal"],
    category: "Modification/substituent", formula: "C3H2O2", massShift: 70.00548,
    description: "Formation of a cyclic pyruvate ketal on adjacent hydroxyls, common in bacterial and fungal extracellular polysaccharides.",
    biologicalScope: ["Microbial", "Fungal"], mammalianRelevance: "Not typically expected", commonTargets: ["Gal", "Man", "Glc"],
    msConsiderations: "The acidic substituent affects ionization and may be labile; confirm localization with fragment evidence.",
    sourceResources: [glygenSource],
    primaryReferences: ["Garegg PJ, Jansson PE, Lindberg B, Lindh F, Lönngren J, Kvarnström I, Nimmich W. Configuration of the acetal carbon atom of pyruvic acid acetals in some bacterial polysaccharides. Carbohydr Res. 1980;78:127-132. DOI: 10.1016/S0008-6215(00)83666-6."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "succinylation", recordType: "modification", name: "O-Succinylation", shortName: "Suc", synonyms: ["Succinyl ester"],
    category: "Modification/substituent", formula: "C4H4O3", massShift: 100.01604,
    description: "Addition of a succinyl ester, documented in bacterial polysaccharides and selected specialized glycoconjugates.",
    biologicalScope: ["Microbial", "Other / context-dependent"], mammalianRelevance: "Not typically expected", commonTargets: ["Hex", "HexNAc"],
    stability: "Ester-linked succinyl groups may be lost under alkaline conditions.",
    msConsiderations: "Confirm the +100.0160 Da shift with acidic behavior and substituent-retaining fragments.",
    sourceResources: [glygenSource],
    primaryReferences: ["Reuber TL, Walker GC. Biosynthesis of succinoglycan, a symbiotically important exopolysaccharide of Rhizobium meliloti. Cell. 1993;74:269-280. DOI: 10.1016/0092-8674(93)90418-P."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "formylation", recordType: "modification", name: "N-Formylation", shortName: "N-Formyl", synonyms: ["Formyl substitution"],
    category: "Modification/substituent", formula: "CO", massShift: 27.99491,
    description: "Formyl substitution of an amino group in selected bacterial and invertebrate monosaccharides.",
    biologicalScope: ["Microbial", "Invertebrate"], mammalianRelevance: "Not typically expected", commonTargets: ["Amino sugars"],
    msConsiderations: "A +27.9949 Da difference is not unique; require residue-specific fragment support.",
    sourceResources: [glygenSource],
    primaryReferences: ["Knirel YA et al. 5,7-Diamino-3,5,7,9-tetradeoxynon-2-ulosonic acids in bacterial glycopolymers. Adv Carbohydr Chem Biochem. 2003;58:371-417. DOI: 10.1016/S0065-2318(03)58007-6."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "ethanolamine-phosphate", recordType: "modification", name: "Phosphoethanolamine", shortName: "PEtN", synonyms: ["Ethanolamine phosphate"],
    category: "Modification/substituent", formula: "C2H6NO3P", massShift: 123.00853,
    description: "A zwitterionic substituent on bacterial lipopolysaccharides, capsules, and some eukaryotic glycoconjugates.",
    biologicalScope: ["Microbial", "Invertebrate", "Mammalian", "Vertebrate"], mammalianRelevance: "Context-dependent", commonTargets: ["Kdo", "heptose", "GalNAc", "Man"],
    msConsiderations: "Can yield characteristic phosphoethanolamine fragments; interpret with organism and lipid-linked context.",
    sourceResources: [glygenSource],
    primaryReferences: ["Needham BD, Trent MS. Fortifying the barrier: the impact of lipid A remodelling on bacterial pathogenesis. Nat Rev Microbiol. 2013;11:467-481. DOI: 10.1038/nrmicro3047."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "aminoethylphosphonate", recordType: "modification", name: "2-Aminoethylphosphonate", shortName: "AEP", synonyms: ["Ciliatine"],
    category: "Modification/substituent", formula: "C2H6NO2P", massShift: 107.01362,
    description: "A phosphonate substituent found in selected protozoan, microbial, and marine glycoconjugates.",
    biologicalScope: ["Microbial", "Invertebrate"], mammalianRelevance: "Not typically expected", commonTargets: ["Man", "GlcNAc", "GalNAc"],
    msConsiderations: "The carbon–phosphorus bond distinguishes AEP from phosphate esters and changes fragmentation behavior.",
    sourceResources: [glygenSource],
    primaryReferences: ["Horiguchi M, Kandatsu M. Isolation of 2-aminoethane phosphonic acid from rumen protozoa. Nature. 1959;184:901-902. DOI: 10.1038/184901b0."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "lactylation", recordType: "modification", name: "O-Lactylation", shortName: "Lac", synonyms: ["Lactyl substituent"],
    category: "Modification/substituent", formula: "C3H4O2", massShift: 72.02113,
    description: "Addition of a lactyl group; the defining substitution in muramic acid links the sugar to peptidoglycan stem peptides.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected", commonTargets: ["GlcNAc"],
    msConsiderations: "MurNAc should generally be modeled as a complete residue rather than inferred solely from a +72.0211 Da shift.",
    sourceResources: [glygenSource],
    primaryReferences: ["Vollmer W, Blanot D, de Pedro MA. Peptidoglycan structure and architecture. FEMS Microbiol Rev. 2008;32:149-167. DOI: 10.1111/j.1574-6976.2007.00094.x."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "anhydro", recordType: "modification", name: "1,6-Anhydro formation", shortName: "Anhydro", synonyms: ["Anhydromuramyl terminus"],
    category: "Modification/substituent", formula: "-H2O", massShift: -18.01056,
    description: "Intramolecular dehydration producing 1,6-anhydro residues, especially at bacterial peptidoglycan glycan-chain termini.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected", commonTargets: ["MurNAc"],
    msConsiderations: "A water loss is common in MS/MS and is not sufficient evidence for a biological anhydro terminus.",
    sourceResources: [glygenSource],
    primaryReferences: ["Glauner B. Separation and quantification of muropeptides with high-performance liquid chromatography. Anal Biochem. 1988;172:451-464. DOI: 10.1016/0003-2697(88)90468-X."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
  {
    id: "acetimidoylation", recordType: "modification", name: "N-Acetimidoylation", shortName: "Am", synonyms: ["Acetimido group"],
    category: "Modification/substituent", formula: "C2H3N", massShift: 41.02655,
    description: "An acetimido substitution found in certain bacterial nonulosonic acids and surface glycans.",
    biologicalScope: ["Microbial"], mammalianRelevance: "Not typically expected", commonTargets: ["Pseudaminic acid", "legionaminic acid"],
    msConsiderations: "Acetimidoyl (C₂H₃N, +41.0265 Da) differs from acetyl (C₂H₂O, +42.0106 Da) by 0.9840 Da (NH vs O). This is close to the ¹³C isotope spacing (1.0034 Da), so correct monoisotopic-peak selection and adequate mass accuracy are required to tell the two apart.",
    sourceResources: [glygenSource],
    primaryReferences: ["Knirel YA et al. 5,7-Diamino-3,5,7,9-tetradeoxynon-2-ulosonic acids in bacterial glycopolymers. Adv Carbohydr Chem Biochem. 2003;58:371-417. DOI: 10.1016/S0065-2318(03)58007-6."],
    glycoMSGuideStatus: "Extended biological context", lastUpdated: monosaccharideDatasetLastUpdated, relatedDiagnosticIons: [],
  },
];

export const monosaccharidesAndModifications: MonosaccharideModification[] = [
  {
    id: "neu5ac",
    recordType: "monosaccharide",
    name: "N-acetylneuraminic acid",
    shortName: "Neu5Ac",
    synonyms: ["NANA"],
    category: "Sialic acid",
    formula: "C11H19NO9",
    monoisotopicMass: 309.10598,
    snfgSymbol: "Neu5Ac",
    description: "The most common sialic acid in humans. Typically found at the non-reducing termini of N- and O-glycans.",
    biologicalScope: ["Mammalian", "Vertebrate"],
    mammalianRelevance: "Common",
    organismNotes: "Predominant sialic acid in humans.",
    commonTargets: [],
    msConsiderations: "Sialic acids are labile during MS/MS. Neu5Ac commonly produces diagnostic ions at m/z 274.09 and 292.10 in positive-ion mode.",
    glyTouCanIds: ["G76685HR"],
    chebiId: "17012",
    pubChemCid: "439197",
    sourceResources: [
      { resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }
    ],
    primaryReferences: ["Varki A. Glycan-based interactions involving vertebrate sialic-acid-recognizing proteins. Nature. 2007;446:1023-1029. DOI: 10.1038/nature05816."],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: [
      { mz: 274.0921, specificity: "residue-specific" },
      { mz: 292.1027, specificity: "residue-specific" },
      { mz: 454.1555, specificity: "motif-associated" },
      { mz: 657.2349, specificity: "motif-associated" },
      { mz: 803.2928, specificity: "motif-associated" },
    ]
  },
  {
    id: "neu5gc",
    recordType: "monosaccharide",
    name: "N-glycolylneuraminic acid",
    shortName: "Neu5Gc",
    synonyms: [],
    category: "Sialic acid",
    formula: "C11H19NO10",
    monoisotopicMass: 325.10090,
    snfgSymbol: "Neu5Gc",
    description: "A sialic acid common in many non-human mammals. Humans cannot synthesize Neu5Gc because CMAH is inactive, but trace amounts can occur in normal human tissues through exogenous uptake and metabolic incorporation.",
    biologicalScope: ["Mammalian", "Vertebrate"],
    mammalianRelevance: "Context-dependent",
    organismNotes: "Common in non-human mammals (e.g., porcine, bovine, murine). Can be metabolically incorporated into human tissues from dietary sources (red meat).",
    msConsiderations: "Yields diagnostic oxonium ions at m/z 290.087 and 308.098. Has a 16 Da mass difference from Neu5Ac.",
    glyTouCanIds: ["G26366JF"],
    chebiId: "146193",
    pubChemCid: "440001",
    sourceResources: [
      { resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }
    ],
    primaryReferences: ["Chou HH et al. Inactivation of CMP-N-acetylneuraminic acid hydroxylase occurred prior to brain expansion during human evolution. Proc Natl Acad Sci USA. 2002;99:11736-11741. DOI: 10.1073/pnas.182257399."],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: [
      { mz: 290.0870, specificity: "residue-specific" },
      { mz: 308.0976, specificity: "residue-specific" },
      { mz: 470.1504, specificity: "motif-associated" },
    ]
  },
  {
    id: "glcnac",
    recordType: "monosaccharide",
    name: "N-acetylglucosamine",
    shortName: "GlcNAc",
    synonyms: [],
    category: "HexNAc",
    formula: "C8H15NO6",
    monoisotopicMass: 221.08994,
    snfgSymbol: "GlcNAc",
    description: "An N-acetylhexosamine found as the core residue in N-glycans, in antenna branches, and as O-GlcNAc.",
    biologicalScope: ["Broadly distributed"],
    mammalianRelevance: "Common",
    msConsiderations: "Cannot be easily distinguished from GalNAc by mass alone. Diagnostic HexNAc oxonium ions: m/z 138, 144, 168, 186, 204.",
    glyTouCanIds: ["G14843DJ"],
    chebiId: "50810",
    pubChemCid: "439174",
    sourceResources: [{ resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Moremen KW, Tiemeyer M, Nairn AV. Vertebrate protein glycosylation: diversity, synthesis and function. Nat Rev Mol Cell Biol. 2012;13:448-462. DOI: 10.1038/nrm3383."],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: [
      { mz: 138.0550, specificity: "composition-supporting" },
      { mz: 144.0655, specificity: "composition-supporting" },
      { mz: 168.0655, specificity: "composition-supporting" },
      { mz: 186.0761, specificity: "composition-supporting" },
      { mz: 204.0866, specificity: "composition-supporting" },
    ]
  },
  {
    id: "galnac",
    recordType: "monosaccharide",
    name: "N-acetylgalactosamine",
    shortName: "GalNAc",
    synonyms: [],
    category: "HexNAc",
    formula: "C8H15NO6",
    monoisotopicMass: 221.08994,
    snfgSymbol: "GalNAc",
    description: "An N-acetylhexosamine commonly found forming the core of mucin-type O-glycans, and at termini in structures like LacdiNAc and blood group A.",
    biologicalScope: ["Broadly distributed"],
    mammalianRelevance: "Common",
    msConsiderations: "Isobaric with GlcNAc. The core GalNAc is the characteristic reducing-end residue of mucin-type O-glycans. In glycopeptide HCD spectra, the HexNAc oxonium-ion ratio (m/z 138 + 168)/(m/z 126 + 144) can indicate GalNAc vs GlcNAc (Halim et al. 2014); otherwise negative-mode fragmentation, standards, or orthogonal separation are required.",
    glyTouCanIds: ["G39738WL"],
    chebiId: "28022",
    pubChemCid: "3577328",
    sourceResources: [{ resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Bennett EP et al. Control of mucin-type O-glycosylation: a classification of the polypeptide GalNAc-transferase gene family. Glycobiology. 2012;22:736-756. DOI: 10.1093/glycob/cwr182."],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: [
      { mz: 204.0866, specificity: "composition-supporting" },
      { mz: 407.1660, specificity: "motif-associated" },
    ]
  },
  {
    id: "man",
    recordType: "monosaccharide",
    name: "Mannose",
    shortName: "Man",
    synonyms: [],
    category: "Hexose",
    formula: "C6H12O6",
    monoisotopicMass: 180.06339,
    snfgSymbol: "Man",
    description: "A hexose that forms the conserved core of N-glycans. Oligomannose glycans contain mannose-rich branches.",
    biologicalScope: ["Broadly distributed"],
    mammalianRelevance: "Common",
    msConsiderations: "Isobaric with Gal and Glc (m/z 163 oxonium). Linkage/structural confirmation requires retention time matching or specialized MS/MS. Forms diagnostic [Hex - H2O + H]+ and related fragments.",
    glyTouCanIds: ["G76001GO"],
    chebiId: "14575",
    sourceResources: [{ resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Moremen KW, Tiemeyer M, Nairn AV. Vertebrate protein glycosylation: diversity, synthesis and function. Nat Rev Mol Cell Biol. 2012;13:448-462. DOI: 10.1038/nrm3383."],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: [
      { mz: 163.0601, specificity: "composition-supporting" },
    ]
  },
  {
    id: "gal",
    recordType: "monosaccharide",
    name: "Galactose",
    shortName: "Gal",
    synonyms: [],
    category: "Hexose",
    formula: "C6H12O6",
    monoisotopicMass: 180.06339,
    snfgSymbol: "Gal",
    description: "A hexose frequently found extending N-glycan and O-glycan antennae, usually forming LacNAc (Gal-GlcNAc) or core 1 (Gal-GalNAc) motifs.",
    biologicalScope: ["Broadly distributed"],
    mammalianRelevance: "Common",
    msConsiderations: "Isobaric with Man and Glc. Can be part of LacNAc (m/z 366.14) or Blood group motifs.",
    glyTouCanIds: ["G43523TH"],
    chebiId: "28260",
    sourceResources: [{ resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Moremen KW, Tiemeyer M, Nairn AV. Vertebrate protein glycosylation: diversity, synthesis and function. Nat Rev Mol Cell Biol. 2012;13:448-462. DOI: 10.1038/nrm3383."],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: [
      { mz: 163.0601, specificity: "composition-supporting" },
      { mz: 366.1395, specificity: "motif-associated" },
    ]
  },
  {
    id: "fuc",
    recordType: "monosaccharide",
    name: "Fucose",
    shortName: "Fuc",
    synonyms: ["6-Deoxy-L-galactose"],
    category: "Deoxyhexose",
    formula: "C6H12O5",
    monoisotopicMass: 164.06847,
    snfgSymbol: "Fuc",
    description: "A deoxyhexose often modifying the N-glycan core (core fucosylation) or terminating antennae (Lewis antigens, blood group antigens).",
    biologicalScope: ["Broadly distributed"],
    mammalianRelevance: "Common",
    msConsiderations: "Labile in MS/MS and readily lost as a neutral (−146.0579 Da). The dHex oxonium ion (m/z 147.0652, calculated) is usually weak; fucose is more often evidenced by neutral losses and by fucose-containing oxonium ions (e.g. m/z 350.1446, 512.1974). Fucose migration in protonated ions can complicate interpretation; look for complementary Y-ions.",
    glyTouCanIds: ["G49112ZN"],
    chebiId: "28373",
    sourceResources: [{ resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Becker DJ, Lowe JB. Fucose: biosynthesis and biological function in mammals. Glycobiology. 2003;13:41R-53R. DOI: 10.1093/glycob/cwg054."],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: [
      { mz: 350.1446, specificity: "motif-associated" },
      { mz: 512.1974, specificity: "motif-associated" },
    ]
  },
  {
    id: "xyl",
    recordType: "monosaccharide",
    name: "Xylose",
    shortName: "Xyl",
    synonyms: [],
    category: "Pentose",
    formula: "C5H10O5",
    monoisotopicMass: 150.05282,
    snfgSymbol: "Xyl",
    description: "A pentose that is O-linked to serine in the canonical proteoglycan linkage region that initiates many glycosaminoglycan chains. Xylose is also common in plant N-glycans.",
    biologicalScope: ["Broadly distributed"],
    mammalianRelevance: "Common",
    organismNotes: "Core residue in mammalian glycosaminoglycans (GAG–protein linkage region) and in O-glucose glycans of EGF repeats; not expected on mammalian N-glycans.",
    msConsiderations: "Yields a +132 Da mass shift (residue mass). Observation on N-glycans in a purportedly mammalian sample can indicate plant glycoprotein presence or contamination.",
    glyTouCanIds: ["G75592IR"],
    chebiId: "37402",
    sourceResources: [{ resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Moremen KW, Tiemeyer M, Nairn AV. Vertebrate protein glycosylation: diversity, synthesis and function. Nat Rev Mol Cell Biol. 2012;13:448-462. DOI: 10.1038/nrm3383."],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: []
  },
  {
    id: "o-acetylation",
    recordType: "modification",
    name: "O-acetylation",
    shortName: "O-Ac",
    synonyms: ["Acetyl group"],
    category: "Modification/substituent",
    formula: "C2H2O",
    massShift: 42.01056,
    description: "Esterification of a hydroxyl group with an acetyl group.",
    biologicalScope: ["Mammalian", "Vertebrate", "Microbial"],
    mammalianRelevance: "Known but uncommon",
    organismNotes: "Particularly common on sialic acids (Neu5,9Ac2). Important in modulating pathogen recognition and immune responses.",
    commonTargets: ["Neu5Ac", "Neu5Gc", "Sialic acids"],
    stability: "Highly labile.",
    samplePreparationConsiderations: "Prone to migration or loss during standard sample preparation (especially basic pH). Use mild/controlled conditions if preserving O-acetylation is desired.",
    msConsiderations: "Yields diagnostic mass shifts (+42 Da) on oxonium ions (e.g., m/z 334.11 for Neu5Ac[Ac]).",
    sourceResources: [{ resource: "GlyGen", url: "https://glygen.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Schauer R, Kamerling JP. Exploration of the sialic acid world. Adv Carbohydr Chem Biochem. 2018;75:1-213. DOI: 10.1016/bs.accb.2018.09.001."],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: [
      { mz: 316.1027, specificity: "context-dependent" },
      { mz: 334.1133, specificity: "context-dependent" },
      { mz: 332.0976, specificity: "context-dependent" },
      { mz: 350.1082, specificity: "context-dependent" },
    ]
  },
  {
    id: "sulfation",
    recordType: "modification",
    name: "Sulfation",
    shortName: "Sulfo",
    synonyms: ["O-sulfate"],
    category: "Modification/substituent",
    formula: "SO3",
    massShift: 79.95681,
    description: "Addition of a sulfate group to a hydroxyl (O-sulfate ester) or, in heparin and heparan sulfate, to the amino group of glucosamine (N-sulfate).",
    biologicalScope: ["Mammalian", "Vertebrate", "Invertebrate"],
    mammalianRelevance: "Context-dependent",
    organismNotes: "Common on mucins, glycosaminoglycans, and specific hormones (e.g., LH).",
    commonTargets: ["Gal", "GalNAc", "GlcNAc"],
    stability: "Moderately labile.",
    msConsiderations: "Best analyzed in negative ion mode, where sulfated fragments form strong [M-H]- ions. The ions at m/z 241.0024 and 282.0289 support sulfated Hex and sulfated HexNAc classes, respectively, but do not distinguish their constituent epimers. Near isobaric with phosphorylation (mass diff ~0.0095 Da), requiring high resolution MS to distinguish.",
    sourceResources: [{ resource: "GlyGen", url: "https://glygen.org/", accessed: "2026-09-12" }],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-13",
    primaryReferences: [
      "Harvey DJ. Fragmentation of negative ions from carbohydrates: Part 3. Fragmentation of hybrid and complex N-linked glycans. J Am Soc Mass Spectrom. 2005;16(5):647-659. DOI: 10.1016/j.jasms.2005.01.006.",
      "Wedepohl S, Kaup M, Riese SB, Berger M, Dernedde J, Tauber R, Blanchard V. N-Glycan analysis of recombinant L-selectin reveals sulfated GalNAc and GalNAc-GalNAc motifs. J Proteome Res. 2010;9(7):3403-3411. DOI: 10.1021/pr100170c."
    ],
    relatedDiagnosticIons: [
      { mz: 241.0024, specificity: "residue-specific" },
      { mz: 282.0289, specificity: "residue-specific" },
      { mz: 444.0817, specificity: "motif-associated" },
    ]
  },
  {
    id: "phosphorylation",
    recordType: "modification",
    name: "Phosphorylation",
    shortName: "Phospho",
    synonyms: ["O-phosphate"],
    category: "Modification/substituent",
    formula: "HPO3",
    massShift: 79.96633,
    description: "Addition of a phosphate group.",
    biologicalScope: ["Broadly distributed"],
    mammalianRelevance: "Context-dependent",
    organismNotes: "Mannose-6-phosphate is crucial for lysosomal targeting.",
    commonTargets: ["Man"],
    stability: "Stable under typical conditions.",
    msConsiderations: "Near isobaric with sulfation. In positive-mode HCD spectra of mannose-6-phosphate-modified N-glycopeptides, Man-P at m/z 243.0264 and Man2-P at m/z 405.0793 are signature fragment ions. These ions indicate the lysosomal mannose-6-phosphate context and are not markers of general protein-backbone phosphorylation. A neutral loss of H3PO4 (98 Da) may also occur.",
    sourceResources: [{ resource: "GlyGen", url: "https://glygen.org/", accessed: "2026-09-12" }],
    primaryReferences: [
      "Braulke T, Bonifacino JS. Sorting of lysosomal proteins. Biochim Biophys Acta. 2009;1793:605-614. DOI: 10.1016/j.bbamcr.2008.10.016.",
      "Čaval T, Zhu J, Tian W, et al. Targeted analysis of lysosomal directed proteins and their sites of mannose-6-phosphate modification. Mol Cell Proteomics. 2019;18(1):16-27. DOI: 10.1074/mcp.RA118.000967."
    ],
    glycoMSGuideStatus: "Core mammalian",
    lastUpdated: "2026-09-13",
    relatedDiagnosticIons: [
      { mz: 243.0264, specificity: "composition-supporting" },
      { mz: 405.0793, specificity: "motif-associated" },
    ]
  },
  {
    id: "methylation",
    recordType: "modification",
    name: "Methylation",
    shortName: "Methyl",
    synonyms: ["O-methyl"],
    category: "Modification/substituent",
    formula: "CH2",
    massShift: 14.01565,
    description: "Addition of a methyl group to a hydroxyl.",
    biologicalScope: ["Invertebrate", "Microbial", "Plant", "Fungal"],
    mammalianRelevance: "Not typically expected",
    organismNotes: "Common in nematodes (e.g., C. elegans) and certain bacteria/fungi. Rare/absent in endogenous mammalian glycans.",
    commonTargets: ["Fuc", "Man", "Gal"],
    stability: "Stable.",
    msConsiderations: "O-methylation produces a +14.0157 Da net shift. This mass difference alone is not specific for biological O-methylation. Derivatization history and fragment or localization evidence should be considered to distinguish O-methylation from other isobaric changes, including methyl-ester formation where applicable.",
    sourceResources: [{ resource: "GlyGen", url: "https://glygen.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Staudacher E. Methylation—an uncommon modification of glycans. Biol Chem. 2012;393:675-685. DOI: 10.1515/hsz-2012-0132."],
    glycoMSGuideStatus: "Extended biological context",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: []
  },
  {
    id: "phosphorylcholine",
    recordType: "modification",
    name: "Phosphorylcholine",
    shortName: "PC",
    synonyms: ["Choline phosphate"],
    category: "Modification/substituent",
    formula: "C5H12NO3P",
    massShift: 165.05548,
    description: "A zwitterionic modification commonly attached to glycans in parasitic nematodes.",
    biologicalScope: ["Invertebrate", "Microbial"],
    mammalianRelevance: "Not typically expected",
    organismNotes: "Present in nematodes (e.g., Ascaris) and some pathogenic bacteria. Serves as an immunomodulatory epitope.",
    commonTargets: ["GlcNAc"],
    msConsiderations: "Yields a highly diagnostic and intensely abundant fragment at m/z 184.0733 (phosphocholine ion, C₅H₁₅NO₄P⁺) in positive ion MS/MS.",
    sourceResources: [{ resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Harnett W, Harnett MM. Phosphorylcholine: friend or foe of the immune system? Immunol Today. 1999;20:125-129. DOI: 10.1016/S0167-5699(98)01419-4."],
    glycoMSGuideStatus: "Extended biological context",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: []
  },
  {
    id: "kdo",
    recordType: "monosaccharide",
    name: "3-Deoxy-D-manno-oct-2-ulosonic acid",
    shortName: "Kdo",
    snfgSymbol: "Kdo",
    synonyms: ["2-Keto-3-deoxyoctonate"],
    category: "Other",
    formula: "C8H14O8",
    monoisotopicMass: 238.06887,
    description: "An eight-carbon acidic sugar commonly found in the inner core of many Gram-negative bacterial lipopolysaccharides and also present in plant rhamnogalacturonan II.",
    biologicalScope: ["Microbial", "Plant"],
    mammalianRelevance: "Not typically expected",
    organismNotes: "Hallmark of Gram-negative bacterial LPS.",
    msConsiderations: "Kdo is not expected as a conventional endogenous mammalian protein-glycan residue. In mammalian sample preparations, its detection should prompt consideration of bacterial material, mixed-species biology, plant-derived material, or other non-mammalian sources, with assignment supported by orthogonal evidence.",
    chebiId: "24933",
    sourceResources: [{ resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Raetz CRH, Whitfield C. Lipopolysaccharide endotoxins. Annu Rev Biochem. 2002;71:635-700. DOI: 10.1146/annurev.biochem.71.110601.135414."],
    glycoMSGuideStatus: "Extended biological context",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: []
  },
  {
    id: "arabinose",
    recordType: "monosaccharide",
    name: "Arabinose",
    shortName: "Ara",
    snfgSymbol: "Ara",
    synonyms: [],
    category: "Pentose",
    formula: "C5H10O5",
    monoisotopicMass: 150.05282,
    description: "A pentose sugar commonly found in plant cell wall polysaccharides and some bacterial lipoarabinomannans.",
    biologicalScope: ["Plant", "Microbial"],
    mammalianRelevance: "Not typically expected",
    msConsiderations: "Produces oxonium ions typical of pentoses. Observation in mammalian analysis might reflect plant-derived dietary compounds or contaminants.",
    chebiId: "22606",
    sourceResources: [{ resource: "GlyCosmos", url: "https://glycosmos.org/", accessed: "2026-09-12" }],
    primaryReferences: ["Seifert GJ. Nucleotide sugar interconversions and cell wall biosynthesis: how to bring the inside to the outside. Curr Opin Plant Biol. 2004;7:277-284. DOI: 10.1016/j.pbi.2004.03.004."],
    glycoMSGuideStatus: "Extended biological context",
    lastUpdated: "2026-09-12",
    relatedDiagnosticIons: []
  },
  ...expandedReviewedRecords
];

export const monosaccharideCategories = [
  { id: "Hexose", label: "Hexose" },
  { id: "HexNAc", label: "HexNAc" },
  { id: "Deoxyhexose", label: "Deoxyhexose" },
  { id: "Dideoxyhexose", label: "Dideoxyhexose" },
  { id: "Pentose", label: "Pentose" },
  { id: "Uronic acid", label: "Uronic acid" },
  { id: "Sialic acid", label: "Sialic acid" },
  { id: "Nonulosonic acid", label: "Nonulosonic acid" },
  { id: "Modification/substituent", label: "Modification/substituent" },
  { id: "Other", label: "Other" }
];
