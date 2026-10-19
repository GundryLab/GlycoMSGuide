# Monosaccharide source export adapters

The generator reads documented source exports directly and writes only a manual-review report. It never edits `src/data/monosaccharidesData.ts`.

```sh
pnpm sources:monosaccharides -- --format glycosmos glycosmos_glycans_list.csv candidates.json
pnpm sources:monosaccharides -- --format glygen glygen-details.json candidates.json
pnpm sources:monosaccharides -- --format normalized snapshot.json candidates.json
```

## GlyCosmos CSV

Use the **GlyCosmos Glycans — List of all GlyCosmos Glycans data** CSV published at:

- Download page: <https://glycosmos.org/download>
- Current file URL: <https://download.glycosmos.org/glycosmos_glycans_list.csv>

The adapter requires the documented header, in order:

`Accession Number,IUPAC Condensed,WURCS,Monoisotopic mass,Motif name(s),Subsumption,ChEBI,PubChem CID,Taxonomy,GlycomeAtlas`

`Accession Number`, `ChEBI`, and `PubChem CID` are used as stable identifiers. The WURCS residue count is used to select single-residue records; multi-residue glycans are outside this reference and are skipped. IUPAC, mass, motif, subsumption, taxonomy, and atlas fields are recognized source context but are not mapped to curated comparison fields because they do not have equivalent meanings in the local monosaccharide schema.

## GlyGen glycan-detail JSON

Use responses from GlyGen’s documented `GET /glycan/detail/{glytoucan_ac}/` endpoint:

- API definition: <https://api.glygen.org/swagger.json>
- Endpoint example: <https://api.glygen.org/glycan/detail/G76685HR/>

The input may be one detail object or an array of detail objects. The adapter reads:

- `glytoucan.glytoucan_ac` as the stable GlyTouCan identifier
- `number_monosaccharides`, which must be exactly `1`
- the sole `composition` record’s `cid` as a PubChem Compound identifier

Other documented detail sections are accepted as source context but not mapped. Multi-residue glycans fail explicitly because their composition cannot identify one curated monosaccharide record without ambiguity.

## Stable matching and review boundary

Source records are matched to curated records using GlyTouCan, ChEBI, and PubChem identifiers. They never need GlycoMSGuide’s local IDs. GlyCosmos cells containing multiple identifiers are normalized as lists. If one is the current curated identifier, it is retained for comparison; otherwise the complete list is surfaced in the candidate report for expert resolution. If supplied identifiers point to multiple curated records, generation stops with an ambiguity error. Formula, mass, and names are never identity keys because isomers can share them and source nomenclature differs.

An unmatched source record is emitted with a source-qualified candidate ID such as `glycosmos:G00000ZZ`; it is never inserted automatically. Unknown fields, malformed CSV, wrong types, duplicate source records, empty or duplicate identifiers, and ambiguous mappings fail explicitly.

The normalized JSON format remains available for curated intermediate snapshots. Missing optional fields mean “not supplied”; explicit `null` is invalid. In all formats, an expert must review and manually apply any accepted change.