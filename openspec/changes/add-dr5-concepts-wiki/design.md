# Design

## Context

The repository currently holds only three things: the source CSV (101 rows, 8 columns, UTF-8 with BOM), the decree PDF (115 pages, 12 MB) and OpenSpec scaffolding. There are no commits and no remote yet.

Findings from inspecting the data, which shape the design:

- **Cross-references.** "Ver também" has 176 raw references. With accent-, case- and punctuation-insensitive matching, plus splitting entries joined by commas, 161 resolve directly. Eight more resolve through aliases:
  - `Piso` and `Piso ou pavimento` → `Piso (de um edifício)`
  - `Utilização do edifício` → `Utilizações do edifício`
  - `Uso do solo` → `Usos do solo`
  - `Área de construção` → `Área de construção do edifício`
  - `Folha de planta` → `Folha da planta`
  - `Conjuntos de dados geográficos` → `Conjunto de dados geográficos`
  - `Serviços de dados geográficos` → `Serviço de dados geográficos`

  `Zona` is dropped. The result is 177 unique explicit links, all within a single annex.
- **Isolated concepts.** Twelve concepts have no explicit links, among them `RGB`, `Morfotipologia` and `Tecido urbano`.
- **Mentions.** About 145 additional mention pairs come from concept names appearing in other concepts' official text.
- **Data quirks.** `Dhab` and `D` sit in the units column of the two density concepts. Abbreviations are case-sensitive in the source (`H`/`h`) and `Ai` is shared by two concepts. One abbreviation is the odd glyph `ơ`.
- **Figures.** They are raster images on PDF pages 81–84 (DR pp. 87–90), and their captions are inside the images. There are seven sub-figures: 1a, 1b, 2, 3a, 3b, 4a, 4b.
- **Fichas.** Within each annex, ficha order is already alphabetical.

## Goals / Non-Goals

**Goals:**
- Search that feels instant, and navigation from one concept to another in a single action (link, preview or graph).
- Official text kept word for word and visually separate from derived links and personal commentary.
- Content that is pleasant to edit by hand, and ideally also opens cleanly in Obsidian.
- Close to zero JavaScript on reading pages beyond search, previews and graphs.

**Non-Goals:**
- Multi-user editing, comments or accounts. Editing is through git or the GitHub web editor.
- Other legislation, versioning of the decree, or an English interface.
- Re-syncing from the CSV after the initial import, since the Markdown files become the source of truth.
- Server-side search or analytics.

## Decisions

### D1. Astro (static) with React components only where interaction is needed
Pages render to HTML at build time. React is loaded only for the search dialog, hover previews, theme switch, mobile menu and graphs. shadcn/ui components are added with the shadcn command-line tool, on Tailwind v4.
- *Alternatives:*
  - Next.js static export, which ships React on every page and makes the base path more fiddly
  - Fumadocs, whose look and layout are already set by the framework
  - a single-page Vite app, which gives no real per-concept pages
  - Quartz, which has every feature built in but not the shadcn look

  Astro was chosen by the user.

### D2. Content model: Astro content collection, official fields in the header, commentary in the body
- **Files:** `src/content/conceitos/<Nome do conceito>.md`, named exactly after the concept. This keeps the files Obsidian-friendly, because `[[Nome]]` resolves by file name there.
- **Header fields:**
  - `conceito`, `anexo` (`I`/`II`) and `ficha` (`I-1`)
  - `abreviatura?` and `unidades?`, kept in their raw form (e.g. `[m2]`), with typographic formatting only at render time
  - `definicao`
  - `notas: string[]`
  - `ver_tambem: string[]`, written as `"[[Nome]]"` so Obsidian treats them as links
  - `aliases: string[]`, Obsidian's standard field
  - `figuras: string[]`
- **Validation:** a Zod schema checks every field.
- **Addresses:** `slugify(conceito)` performs NFD normalisation, strips diacritics, lowercases, and replaces runs of non-alphanumeric characters with `-`. It does not depend on the file name, so renaming a file does not change the address.
- *Alternatives:* official text in the Markdown body under headings. That is harder to validate and to search field by field, and easier to edit by accident. Slug-named files were also considered, but they break readable `[[Nome]]` links in Obsidian.

### D3. Build-time link graph as a single module
`src/lib/grafo.ts` loads the collection once and builds:
- a name/alias index, keyed by the normalised form
- explicit edges (ver também plus body `[[...]]`)
- backlinks
- mention edges
- 2-hop neighbourhoods

It throws descriptive errors for unresolved or ambiguous references, which fails the build. Every page and the search and graph data files read from this one module, so all views agree.

**Mention detection:**
1. Normalise both the text and the names, keeping a map from normalised positions back to the original text.
2. Scan with all names and aliases sorted longest first, consuming characters that have already matched, with whole-word boundaries.
3. Skip the concept itself and its "ver também" targets.
4. Never match abbreviations.

The same positions drive the inline links ("first occurrence per section"). Because the definition and notes are plain header fields rather than Markdown, a small segmenter (`src/lib/segmentos.ts`) splits each text into plain-text, figure-link and concept-link segments instead of a rehype step. It wraps text in links only; it never edits the text, and a test checks this for all 101 concepts.

- *Alternatives:* computing links in the browser, which is slower and duplicates logic. Plural/stem matching was rejected for now because it risks false positives; aliases cover the needed variants.

### D4. Search with MiniSearch and a prebuilt index
A static endpoint `search.json` is generated at build time. It contains the concepts, already split into fields, plus a serialised MiniSearch index (about 30 KB gzipped). The search dialog fetches it while the browser is idle after page load, and on demand at the latest.

**Search configuration:**
- `processTerm` lowercases and strips diacritics.
- `prefix: true`.
- `fuzzy`: 0.2 for terms of four or more characters, otherwise 0.
- Field boosts: nome/aliases ×4, definição ×2, notas/comentário ×1.
- An exact match on abbreviation (case-insensitive) or name is pinned to the top before MiniSearch results.
- The matched field comes from MiniSearch's `match` info. Snippets are cut around the first matched term in that field.
- Recently visited concepts are kept in `localStorage` (the last 5). Failures are caught, so search still works if storage is unavailable.

**UI:** shadcn `CommandDialog` (cmdk) with MiniSearch filtering; cmdk's own filtering is disabled.

- *Alternatives:* Pagefind, which has slower first results and coarse field ranking, and is aimed at large sites. Fuse.js gives weaker field weighting and no prefix-plus-fuzzy combination. FlexSearch is less ergonomic for per-field match info.

### D5. Graph layout computed at build time, rendered as SVG
- **Layout:** graphology holds the graph, and `d3-force` runs for a fixed number of steps from a seeded starting position, so positions are deterministic. This is done for the full graph and for each concept's 2-hop neighbourhood.
- **Rendering:** Astro outputs SVG with nodes as `<a>` links, which satisfies the "readable without JavaScript" requirement.
- **Interactivity:** a small React component adds zoom and pan (`d3-zoom`), link-type toggles (via CSS classes), and neighbour highlighting on hover and focus.
- **Theming:** colours come from the shadcn CSS variables (`--chart-1`/`--chart-2` for the annexes; muted solid lines for explicit links, dashed lines for mentions), so both themes work automatically.
- *Alternatives:* `react-force-graph` (canvas: not themable through CSS, no links without JavaScript, heavier) and sigma.js (WebGL, overkill for 101 nodes).

### D6. Hover previews use the same data as search
shadcn `HoverCard`. Concept links carry a `data-conceito` slug, and one small component attached to the page handles previews for all of them, reading from the search JSON. That keeps the per-link markup small. It opens on hover with a short delay and on keyboard focus. It is disabled when the `(hover: none)` media query matches.

### D7. Figures extracted once with PyMuPDF
`scripts/extrair_figuras.py` renders fixed crop rectangles from PDF pages 81–84 at 300 dpi. It is run with `python -I` and writes `src/assets/figuras/figura-<id>.png`. A file `src/content/figuras.yaml` holds the identifier, the caption (typed from the images), the alternative text and the DR page.

Astro's `<Image>` produces resized WebP versions, and enlarging uses a shadcn `Dialog`. The import seeds `figuras` from the caption-to-concept map, and from "Ver Figura N" in the notes, which resolves to the sub-figures whose captions name the concept, or to all sub-figures of N otherwise. Figura 1b's `Área de implantação` maps to `Área de implantação do edifício`.

### D8. One-off import script in TypeScript
`scripts/importar-csv.ts`, run with `npm run importar`. It reads `fontes/fichas_conceitos_tecnicos_DR5_2019.csv` with `csv-parse`, using the same `slugify` and normalisation helpers as the site (shared from `src/lib/texto.ts`). It applies the D2 field mapping and the clean-up rules (an alias table, dropping `Zona`, moving `Dhab`/`D`), writes YAML with `yaml` (block style for long text), and prints the clean-up report. It refuses to write if any content file exists, unless `--force` is given.

### D9. European Portuguese strings and collation
All interface strings live in `src/i18n/pt-PT.ts`, with no hard-coded labels in components. Sorting uses `Intl.Collator('pt-PT', { sensitivity: 'base' })`, and index grouping uses the first letter with accents removed.

### D10. Deployment
- `astro.config.mjs` sets `site: https://<user>.github.io` and `base: '/ConceitosUrbanismosWiki'`, with `trailingSlash: 'always'`.
- All internal URLs go through a `url()` helper that prefixes `import.meta.env.BASE_URL`.
- GitHub Actions on push to `main` runs, in order:
  1. `npm ci`
  2. `npm test` (Vitest)
  3. `npm run build`
  4. the link checker (a script that walks `dist/` and verifies every `href`/`src` under the base path)
  5. Playwright smoke tests against `astro preview`
  6. `actions/upload-pages-artifact` and `actions/deploy-pages`

  Because deployment is a separate job that runs only if the build succeeds, a failure leaves the live site unchanged.
- `fontes/` sits outside `public/` and is never copied into `dist/`.

### D11. Testing approach
- **Vitest** for pure logic: slugify and normalisation, reference resolution (including the alias and ambiguity errors), mention detection (longest match, word boundaries, exclusions), import transforms on fixture rows, unit formatting, and search ranking against the real index (`Af`, `Ai`, `recuo`, `area implantacao`, `fachda`).
- **Playwright** (Chromium only) for the integration flows:
  - keyboard search to a concept
  - hover preview
  - theme persistence with no flash
  - mobile sidebar
  - graph node navigation
  - 404 page

## Risks / Trade-offs

- [Derived mentions produce false positives for generic words (`Edifício`, `Piso`)] → They are always labelled as derived and never mixed with "ver também". A per-concept `ignorar_mencoes: string[]` header field can suppress specific pairs if needed. It is not added up front.
- [Obsidian compatibility is best-effort] → Header links as `"[[...]]"` strings work in Obsidian. The site does not depend on Obsidian, and nothing breaks if the content is never opened there.
- [Editing long official text in YAML is fiddly] → Block style (`>-`) for long text. The official text is expected to change rarely, and commentary goes in the body.
- [The figure crop rectangles are fixed coordinates tied to this PDF] → It is a one-off script whose output is committed. Crops are checked by eye once, and the script is not part of the build.
- [The 12 MB PDF in git history] → It is accepted for provenance, given a single document. It can be moved to Git LFS later without affecting the site.
- [`ơ` abbreviation glyph may be a CSV extraction error] → It is listed in the import report for the author to check against the PDF. It is imported as is.
- [Base path mistakes show up only when deployed] → The `url()` helper, the link checker and the Playwright run against `astro preview` all use the production base path.

## Migration Plan

This is a greenfield site.
1. Move the CSV and PDF to `fontes/`.
2. Scaffold the site.
3. Run the import and figure extraction once, and commit their output.
4. Rename the local `master` branch to `main`, create the GitHub repository, and set Pages to deploy from "GitHub Actions".
5. Push.

Rollback means reverting the commit on `main`; the workflow republishes the previous state.

## Open Questions

- The GitHub username (for `site`) and the exact official DRE URL for the about page. Both are filled in during implementation and do not affect the design.

## Implementation notes

Changes made during implementation, with the same observable behaviour unless stated otherwise:

- **D5:** graphology was not needed. `d3-force` alone runs with a seeded random source. Interactivity is a plain Astro `<script>` (d3-zoom and d3-selection) rather than a React component.
- **Local graph scope:** direct neighbours include both link types, but the second step follows only explicit links. Following mentions pulled most of Anexo I into every local graph through hub concepts such as *Edifício*. The concept-connections spec was updated to match.
- **Home search (task 7.3):** the large field on the home page uses the same engine and results list as the dialog, but shows results inline below the field. Handing focus over to the dialog while the user was typing lost keystrokes.
- **Hover previews (D6):** these use a single Radix Popover anchored to the hovered link with `virtualRef`, styled like the shadcn HoverCard. HoverCard itself cannot be anchored to arbitrary elements.
- **Data fix:** the abbreviation of *Inclinação da cobertura* is «α» in the decree's table (DR p. 11). The PDF's text layer and the CSV have «ơ» (U+01A1), and the import corrects it.
