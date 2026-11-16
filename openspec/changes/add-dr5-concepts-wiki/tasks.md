# Tasks

## 1. Repository and project setup

- [x] 1.1 Move `fichas_conceitos_tecnicos_DR5_2019.csv` and the DR 5/2019 PDF into `fontes/`, add `.gitignore` (node_modules, dist, .astro, test reports), and rename the local branch to `main`; verify with `git status` and `git branch --show-current`
- [x] 1.2 Scaffold an Astro project (TypeScript strict) at the repository root with the React and Tailwind v4 integrations; set `site`, `base: '/ConceitosUrbanismosWiki'` and `trailingSlash: 'always'` in `astro.config.mjs`; verify `npm run build` succeeds on the starter page
- [x] 1.3 Initialise shadcn/ui for Astro (neutral base colour, CSS variables) and add the components the specs need: button, badge, card, command, dialog, hover-card, sheet, separator, toggle, tooltip, scroll-area; verify a test page renders a Button and Badge in both themes
- [x] 1.4 Add Vitest and Playwright (Chromium only) with `npm test` and `npm run test:e2e` scripts; verify both run, with one placeholder test each

## 2. Content model and shared text utilities

- [x] 2.1 Implement `src/lib/texto.ts` (NFD normalisation, accent stripping, `slugify`, typographic units formatting, `[[...]]` parsing) with Vitest tests for `Área de implantação do edifício` → `area-de-implantacao-do-edificio`, `Piso (de um edifício)`, `[m2]` → m², `[m3/m2]` → m³/m²
- [x] 2.2 Define the `conceitos` content collection and Zod schema (D2), plus `src/content/figuras.yaml` with its schema; verify with a two-file fixture that a missing `definicao`, an invalid `anexo` and a duplicate `ficha` each fail `astro check`/build with a message naming the file and field
- [x] 2.3 Implement the reference index and resolution in `src/lib/grafo.ts` (name and alias lookup by normalised form, errors for unresolved and ambiguous references, duplicate-address detection), with Vitest tests for alias resolution, case/accent differences, an unknown `[[...]]` reference and an ambiguous alias

## 3. One-off import and figures

- [x] 3.1 Write `scripts/importar-csv.ts` (`npm run importar`) per D8, with the clean-up rules (alias table, drop `Zona`, move `Dhab`/`D`, report the `ơ` glyph), the refuse-to-overwrite guard and `--force`; add Vitest tests on fixture rows covering note splitting, comma-joined references, the alias mapping and the guard
- [x] 3.2 Write `scripts/extrair_figuras.py` (PyMuPDF, run with `python -I`) to crop figures 1a, 1b, 2, 3a, 3b, 4a and 4b from PDF pages 81–84 at 300 dpi into `src/assets/figuras/`; fill in `figuras.yaml` with the captions, alternative text in pt-PT and DR pages; verify by inspecting each PNG once
- [x] 3.3 Run the import; check the report (8 aliases added, `Zona` dropped, 2 fields moved), that 101 files were created (73 Anexo I, 28 Anexo II) and that figure fields are seeded per D7 (including `Polígono de implantação`, `Cota de soleira` and `Elevação da soleira` from captions); check `ơ` against the PDF; commit the generated content
- [x] 3.4 Verify that the full build passes on the imported content, and that the resolved graph has 177 explicit links and 12 isolated concepts (a Vitest test over the real collection)

## 4. Site shell

- [x] 4.1 Create `src/i18n/pt-PT.ts` with all interface strings and a `url()` base-path helper; add a Vitest test that `url('/conceitos/recuo/')` includes the base path
- [x] 4.2 Build the base layout: `lang="pt-PT"`, skip link `Saltar para o conteúdo`, header (site name, search button, `Índice`/`Grafo`/`Sobre`, theme switch), responsive mobile menu (Sheet), and a light/dark/system theme script inline in `<head>` so there is no flash; verify with Playwright: skip link focus, theme persists across navigation with no flash, no horizontal scroll at 360 px
- [x] 4.3 Build the home page (source, large search field, annex counts from the collection, links to the index and graph), the `Sobre` page (citation, official DRE link, the statement that the official text prevails, explanation of the three kinds of content) and the pt-PT 404 page; verify the counts read 73 and 28, and a Playwright check of `/conceitos/nao-existe/`

## 5. Concept pages and browsing

- [ ] 5.1 Build `/conceitos/[slug]/`: header (annex and ficha, abbreviation and units badges), definition block, notes list, commentary section with rendered `[[...]]` links, previous/next within the annex, and a GitHub edit link; verify with Playwright on `Afastamento` (I-1, `Af`, `m`) and `Alçado` (no badges), and on the last Anexo I ficha (no next link)
- [ ] 5.2 Add figures: an `<Image>` with caption and alternative text, an enlarge Dialog closing on Escape, and "Ver Figura N" in notes linked to the on-page anchor; verify with Playwright on `Altura da fachada` (Figura 3a enlarges and closes) and on `Afastamento` (the `Figura 1` link jumps to 1a)
- [ ] 5.3 Build the annex sidebar (grouped `Anexo I`/`Anexo II`, ficha order, current concept highlighted and scrolled into view, Sheet on narrow screens); verify with Playwright at desktop and 360 px widths
- [ ] 5.4 Build the `Índice` page (A–Z with pt-PT collation and accent-free grouping, name/abbreviation/annex/start of definition, combinable `Anexo` and `com abreviatura` filters); add a Vitest test for the collation order `Altura entre pisos` < `Área total de construção` < `Atualização cartográfica`, and a Playwright test of the combined filters

## 6. Connections

- [ ] 6.1 Implement mention detection in `src/lib/grafo.ts` per D3 (longest match first, whole words, aliases included, abbreviations excluded, self and ver-também pairs excluded), keeping positions in the original text; add Vitest tests for `altura da fachada` vs `Fachada`, the ver-também exclusion and word boundaries
- [ ] 6.2 Render the `Ver também`, `Referido por`, `Menciona` and `Mencionado em` sections on concept pages (alphabetical where specified, hidden when empty); verify that `Afastamento` lists its four references, that `Recuo` shows `Afastamento` under `Referido por` and that `Edifício` shows `Afastamento` under `Mencionado em`
- [ ] 6.3 Add the rehype step that links the first occurrence of each mentioned concept per section in the definition and notes without altering the text; verify with a Vitest snapshot that the text content before and after is identical, and that only the first `edifício` is linked
- [ ] 6.4 Add hover previews (one HoverCard component for the whole page, driven by `data-conceito`, opening on hover and focus, disabled on `(hover: none)`); verify with Playwright: hovering `Recuo` on `Afastamento` shows `Anexo I · Ficha I-57` and `Re`, and on a touch device a tap goes straight to the page

## 7. Search

- [ ] 7.1 Generate the `search.json` endpoint (fields per concept plus the serialised MiniSearch index with the D4 configuration); add Vitest ranking tests on the real index: `Af` → `Afastamento` first, `Ai` → both concepts above text matches, `recuo` → `Recuo` first, `area implantacao`, `afast` and `fachda`
- [ ] 7.2 Build the search dialog (CommandDialog; `/` outside text fields, `Ctrl/⌘+K`, header button; loading while idle; result rows with matched-field label and highlighted snippet; Anexo filter; empty state with recent visits kept safely in localStorage; `Sem resultados para «…»`); verify with Playwright: Ctrl+K, type `recuo`, arrow, Enter opens `Recuo`; `/` typed in an input does not open search; `xyzzy` shows the no-results message; no network requests while typing
- [ ] 7.3 Wire the home page's large search field to the same dialog and engine; verify with Playwright that typing on the home page shows results

## 8. Graphs

- [ ] 8.1 Compute deterministic layouts at build time (graphology + d3-force with a seeded start) for the full graph and for each concept's 2-hop neighbourhood; add a Vitest test that two runs give identical positions
- [ ] 8.2 Render the local graph SVG on concept pages (current node emphasised, explicit and mention links styled differently, nodes as links, a "no links" note for isolated concepts, plus a list of links for screen readers); verify with Playwright that the `Fachada` node on `Afastamento` opens `Fachada`, and that `RGB` shows the note
- [ ] 8.3 Build the `Grafo` page (SVG coloured by annex through theme variables; a React component for zoom and pan, link-type toggles and neighbour highlighting on hover and focus); verify with Playwright that turning off `Menções` hides the dashed links, that hovering `Edificação` dims non-neighbours, and that with JavaScript disabled the page shows the laid-out graph with working links

## 9. Deployment and integration

- [ ] 9.1 Write `scripts/verificar-ligacoes.mjs`, which walks `dist/` and checks every internal `href`/`src` under the base path; verify that it passes on the real build and fails with page and address listed when a broken link is injected into a fixture
- [ ] 9.2 Add `.github/workflows/deploy.yml` (on push to `main`: npm ci → test → build → link check → Playwright against `astro preview` → upload-pages-artifact; a separate deploy job that runs only if the build succeeds); validate the YAML locally, and verify that the steps run in order with `npm run ci` (a local script mirroring the workflow)
- [ ] 9.3 Write `README.md` in pt-PT (how to edit a concept, add commentary and `[[...]]` links, `npm run dev`, `npm run preview` under the base path, the one-off scripts, deployment setup); verify by following the preview steps from a clean clone
- [ ] 9.4 Final integration check: run `npm run ci` locally; confirm that `dist/` holds 101 concept pages and contains neither the CSV nor the PDF; run Lighthouse on a concept page and the graph page (accessibility ≥ 95, no horizontal scroll at 360 px)

## Workflow follow-up

- Create the GitHub repository, add it as `origin`, set Pages → Source: GitHub Actions, push `main`, and confirm that the site is live at `https://<user>.github.io/ConceitosUrbanismosWiki/`.
- Archive this change after review (`openspec-archive-change`).
