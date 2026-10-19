// Publication metadata and capabilities checked against the cited publications,
// official tool pages, and NCBI's SNFG tools directory on 2026-10-15.
// GlycoWorkbench's publication metadata was checked on 2026-10-18.
// 3D-SNFG links to a documented implementation; its citation describes the
// representation standard, not the ChimeraX application.
export const glycanDrawingTools = [
  {
    name: "DrawGlycan-SNFG",
    url: "https://virtualglycome.org/DrawGlycan/",
    desc: "Draws glycans and glycopeptides from IUPAC-condensed text using SNFG symbols, with options to mark glycan and peptide fragmentation sites. Available through a web interface and as downloadable software.",
    pub: {
      cite: "Cheng, Zhou & Neelamegham. DrawGlycan-SNFG: a robust tool to render glycans and glycopeptides with fragmentation information. Glycobiology 2017, 27 (3), 200–205.",
      doi: "10.1093/glycob/cww115",
    },
    relevanceTags: ["Glycan drawing", "SNFG", "Fragment annotation"],
    biologicalContexts: ["Multi-organism" as const],
    displayTags: ["2D drawing", "SNFG", "Fragment annotation"],
  },
  {
    name: "GlycoDraw (glycowork)",
    url: "https://github.com/BojarLab/glycowork",
    desc: "A Python-based tool in glycowork for generating SNFG figures from IUPAC-condensed glycan strings. Exports PDF and SVG, supports Domon–Costello fragment-ion drawings, and is useful for scripted, reproducible figure generation.",
    pub: {
      cite: "Lundstrøm et al. GlycoDraw: a python implementation for generating high-quality glycan figures. Glycobiology 2023, 33 (11), 927–934.",
      doi: "10.1093/glycob/cwad063",
    },
    relevanceTags: ["Glycan drawing", "SNFG", "Fragment annotation", "Python"],
    biologicalContexts: ["Multi-organism" as const],
    displayTags: ["2D drawing", "Python", "Fragment annotation"],
  },
  {
    name: "GlycoWorkbench",
    url: "https://code.google.com/archive/p/glycoworkbench/downloads",
    desc: "A desktop application with an integrated graphical glycan editor for drawing structures and annotating MS and MS/MS spectra. Compares theoretical fragment masses from user-proposed structures with experimental peaks to support expert-guided interpretation.",
    pub: {
      cite: "Ceroni et al. GlycoWorkbench: a tool for the computer-assisted annotation of mass spectra of glycans. J Proteome Res 2008, 7 (4), 1650–1659.",
      doi: "10.1021/pr7008252",
    },
    relevanceTags: ["Glycan drawing", "Fragment annotation", "MS/MS"],
    biologicalContexts: ["Multi-organism" as const],
    displayTags: ["2D drawing", "Desktop app", "Fragment annotation"],
  },
  {
    name: "GlycoGlyph",
    url: "https://glycotoolkit.com/Tools/GlycoGlyph/",
    desc: "A browser-based glycan drawing and naming application. Build a structure interactively or enter its condensed name, then export an SVG figure or GlycoCT representation and look up GlyTouCan identifiers.",
    pub: {
      cite: "Mehta & Cummings. GlycoGlyph: a glycan visualizing, drawing and naming application. Bioinformatics 2020, 36 (11), 3613–3614.",
      doi: "10.1093/bioinformatics/btaa190",
    },
    relevanceTags: ["Glycan drawing", "SNFG", "Identifiers"],
    biologicalContexts: ["Multi-organism" as const],
    displayTags: ["2D drawing", "Web app", "SNFG"],
  },
  {
    name: "SugarSketcher",
    url: "https://glycoproteome.expasy.org/sugarsketcher/",
    desc: "An interactive SNFG editor in Glycomics@ExPASy for drawing glycans from scratch or from core templates. Quick and comprehensive symbol menus support figure preparation, with SVG and GlycoCT export.",
    pub: {
      cite: "Alocci et al. SugarSketcher: Quick and Intuitive Online Glycan Drawing. Molecules 2018, 23 (12), 3206.",
      doi: "10.3390/molecules23123206",
    },
    relevanceTags: ["Glycan drawing", "SNFG"],
    biologicalContexts: ["Multi-organism" as const],
    displayTags: ["2D drawing", "Web app", "SNFG"],
  },
  {
    name: "SugarDrawer",
    url: "https://glycoinfo.gitlab.io/sugardrawer/sugar-drawer-pages/",
    desc: "A web-based editor and database-search tool that supports partially defined glycans, including uncertain linkages and possible attachment sites. Imports and exports WURCS and GlycoCT and searches GlyTouCan using the drawn structure.",
    pub: {
      cite: "Tsuchiya et al. SugarDrawer: A Web-Based Database Search Tool with Editing Glycan Structures. Molecules 2021, 26 (23), 7149.",
      doi: "10.3390/molecules26237149",
    },
    relevanceTags: ["Glycan drawing", "SNFG", "Identifiers", "Structural ambiguity"],
    biologicalContexts: ["Multi-organism" as const],
    displayTags: ["2D drawing", "Web app", "Ambiguous structures"],
  },
  {
    name: "GlycanBuilder2-SNFG",
    url: "https://github.com/glycoinfo/Executable/tree/master/GlycanBuilder2",
    desc: "A desktop glycan editor supporting SNFG symbols, ambiguous structures, cyclic glycans, and cross-linked substituents. Supports WURCS 2.0 input and output for exchanging structural representations.",
    pub: {
      cite: "Tsuchiya et al. Implementation of GlycanBuilder to draw a wide variety of ambiguous glycans. Carbohydr Res 2017, 445, 104–116.",
      doi: "10.1016/j.carres.2017.04.015",
    },
    relevanceTags: ["Glycan drawing", "SNFG", "Structural ambiguity"],
    biologicalContexts: ["Multi-organism" as const],
    displayTags: ["2D drawing", "Desktop app", "Ambiguous structures"],
  },
  {
    name: "3D-SNFG",
    url: "https://plato.cgl.ucsf.edu/chimerax/docs/user/commands/snfg.html",
    desc: "Represents carbohydrate residues in existing atomic models with three-dimensional SNFG symbols, useful for glycan and glycoprotein structure figures. The linked ChimeraX snfg command is one implementation; it visualizes an atomic model rather than inferring a structure from MS data.",
    pub: {
      cite: "Thieker et al. 3D implementation of the symbol nomenclature for graphical representation of glycans. Glycobiology 2016, 26 (8), 786–787.",
      doi: "10.1093/glycob/cww076",
    },
    relevanceTags: ["Glycan drawing", "SNFG", "3D visualization"],
    biologicalContexts: ["Multi-organism" as const],
    displayTags: ["3D visualization", "Atomic models", "SNFG"],
  },
];
