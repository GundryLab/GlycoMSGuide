# GlycoMSGuide

GlycoMSGuide is a companion web resource for glycan and glycopeptide MS/MS interpretation, covering diagnostic ions, monosaccharides and modifications, nomenclature, challenging compositions, software, and resources. Visit [GlycoMSGuide](https://www.glycomsguide.net). The website is built with React and Vite in a pnpm workspace; its curated scientific content is maintained in TypeScript datasets and downloadable data files.

Repository: https://github.com/GundryLab/GlycoMSGuide

## Uploading this source package to GitHub

Extract the GitHub source ZIP and add its contents directly to the repository root. Do not upload only the ZIP or place everything inside an extra enclosing folder.

Include `artifacts/`, `lib/`, `scripts/`, `.github/`, and all supplied root files, including this `README.md`, `LICENSE`, `LICENSE-DATA`, `CITATION.cff`, package manifests, the pnpm lockfile, TypeScript configuration, `.gitignore`, `.nvmrc`, and `.env.example`. Make sure your file picker includes hidden files and folders.

The package deliberately excludes installed dependencies, build outputs, local credentials, Replit-only configuration, and review artifacts. Do not add `node_modules/`, `dist/`, real `.env` files, uploads, or generated review ZIPs. `.env.example` is a configuration template, not a credentials file.

## Citation

**Community-Developed Best Practices for Mass Spectrometry-Based Mammalian N- and O-linked Glycomics and Glycoproteomics Analysis and Reporting**

Rebekah L. Gundry; Kiyoko F. Aoki-Kinoshita; Gad Armony; Robert J. Chalkley; Daniel Kolarich; Klaus Lindpaintner; Frédérique Lisacek; Karina Martinez; Sriram Neelamegham; Nicolle H. Packer; Daniel A. Polasky; Rene Ranzinger; Erdmann Rapp; Sabarinath Peruvemba Subramanian; Morten Thaysen-Andersen; Lilla Turiák; Sergey Y. Vakhrushev; Hans J.C.T. Wessels.

See [CITATION.cff](CITATION.cff) for machine-readable citation metadata and the preferred article citation. **DOI to be added on publication.**

## Repository layout

| Path | Purpose |
| --- | --- |
| `artifacts/glycan-msms/` | Website, using Vite and React |
| `artifacts/glycan-msms/src/data/` | Curated datasets |
| `artifacts/glycan-msms/public/data/` | Downloadable JSON and XLSX |
| `artifacts/glycan-msms/scripts/` | Scientific validators, exporters, and source-review tools |
| `scripts/figures/` | Reproducible figure generators, including `make_offbyone_figure.py` |
| `lib/glyco-tools/` | Shared software inventory |
| `artifacts/api-server/` | Optional maintainer API server |
| `lib/db/` | Optional PostgreSQL schema and access |
| `lib/api-spec/`, `lib/api-zod/`, `lib/api-client-react/` | API specification, generated validation schemas, and React client |
| `scripts/src/checkToolUpdates.ts` | Optional monthly tool-update checker |

The browser application uses the shared software inventory and API client. Database persistence and the monthly update checker are optional maintainer infrastructure, not prerequisites for the static site. Shared TypeScript packages use project references; run the root type check to build their declarations in dependency order.

## Requirements

- Node.js ≥ 22
- pnpm 10
- Python 3 with `numpy` and `matplotlib` only if regenerating figures

## Quick start

```sh
pnpm install
pnpm --filter @workspace/glycan-msms dev
```

Open http://localhost:5173. No environment variables are required for local website development.

The repository URL is configured as `https://github.com/GundryLab/GlycoMSGuide` in `artifacts/glycan-msms/src/config/repository.ts`, this README, and `CITATION.cff`. A Vite build-start check rejects production builds if the repository URL is reset to the template placeholder. It does not block development.

```sh
pnpm --filter @workspace/glycan-msms build
pnpm run typecheck
```

Website build output: `artifacts/glycan-msms/dist/public`. Serve this directory with a static host that routes application paths to `index.html`. Set `BASE_PATH=/sub/path/` when building for sub-path hosting. The Vite host allowlist uses its safe default outside Replit and accepts the Replit proxy when `REPL_ID` is present.

The individual verification commands are:

```sh
pnpm --filter @workspace/glycan-msms run test:diagnostic-ions
pnpm --filter @workspace/glycan-msms run test:composition-confusions
pnpm --filter @workspace/glycan-msms run test:snfg
pnpm --filter @workspace/glycan-msms run test:exports
pnpm --filter @workspace/glycan-msms run test:sources:monosaccharides
pnpm --filter @workspace/glycan-msms exec tsx --test src/data/glycanDrawingTools.test.ts
```

Run `pnpm test` from the repository root to run all seven test files together. The individual commands above remain available. GitHub Actions runs the combined tests, typecheck, both scientific validators and the production build on pushes and pull requests to `main`.

## Data files

- `artifacts/glycan-msms/public/data/diagnostic-ions.json`: 156 diagnostic ions, including formula, charge, polarity, provenance, evidence records where applicable, and dataset `lastUpdated` metadata. Withdrawn entries are separately documented rather than displayed as current ions.
- `artifacts/glycan-msms/public/data/glycan-first-isotope-confusions.xlsx`: the composition-confusion table covering 70 compositions and 39 distinct comparison pairs.

Regenerate the diagnostic-ion JSON:

```sh
pnpm --filter @workspace/glycan-msms run build:diagnostic-ions-json
```

It is also regenerated when Vite starts or builds. Validate the curated records:

```sh
pnpm --filter @workspace/glycan-msms run validate:diagnostic-ions
pnpm --filter @workspace/glycan-msms run validate:monosaccharides
```

The diagnostic-ion validator creates its output directory automatically. Source updates produce review candidates and never automatically replace curated monosaccharide records.

To reproduce the off-by-one figure:

```sh
python3 scripts/figures/make_offbyone_figure.py off-by-one-composition-example
```

This writes a 3548 × 1774 PNG and an SVG to the chosen output basename. The website's supplied figure is a higher-resolution raster of the same calculated example; rasterization can differ across rendering environments.

## Optional maintainer infrastructure

The API server and monthly tool-update checker require PostgreSQL via `DATABASE_URL`. Optional checker settings are `NCBI_API_KEY`, `GITHUB_TOKEN`, and `CHECK_TOOL_UPDATES_RECIPIENT`. See `.env.example` for the variable names and local website defaults; never commit actual credentials.

```sh
pnpm --filter @workspace/api-server dev
pnpm --filter @workspace/scripts run check-tool-updates
```

The API server also requires its own `PORT` setting. Relevant routes:

- `GET /api/healthz`: health check.
- `GET /api/tool-updates`: software names, last-check timestamps, and update flags.

The monthly checker is flag-only. It queries PubMed for matching publications and GitHub for repository activity or releases, stores per-tool check state, and reports changes for manual review. Its first run establishes a baseline without alerts. Schedule the checker monthly using the maintainer's scheduler.

`scripts/src/email.ts` optionally sends the digest through the Replit Gmail connector. Outside Replit, or when the connector is unavailable, it prints the digest to the console. The static website does not require the database, checker credentials, or email integration.

## Contributing / corrections

Use the website's **Suggest an update** form or open an issue at https://github.com/GundryLab/GlycoMSGuide/issues. Provide primary references or reproducible calculations for scientific corrections. Changes to scientific content require author review.

## Licence

Code: [MIT License](LICENSE). Curated data: [Creative Commons Attribution 4.0 International, CC BY 4.0](LICENSE-DATA). Cite the accompanying article and original sources when reusing data. Third-party content remains subject to its original terms.

## AI assistance

Parts of the website code and content were drafted with AI tools and reviewed, verified and edited by the authors. The site logo was generated with OpenAI's image model. Scientific values were checked against primary sources or calculated from elemental formulas (see the scripts).

<!-- TODO: authors to confirm the list of AI tools used and the wording above. -->
