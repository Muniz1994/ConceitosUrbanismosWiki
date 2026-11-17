# Proposal

## Why

The 101 technical concepts in Decreto Regulamentar n.º 5/2019 (Anexos I and II) are only available as a long PDF and a flat CSV. That makes it slow to find a term, read its definition and complementary notes, and follow how the concepts relate to each other. A static wiki on GitHub Pages, with fast search and explicit navigation between linked concepts, makes the decree usable as a day-to-day research reference. It also gives a place for personal annotations that stay separate from the official text.

## What Changes

- New static website (Astro + shadcn/ui), with all interface text in European Portuguese (pt-PT), published to GitHub Pages at `<user>.github.io/<repo>`.
- One Markdown file per concept becomes the editable source of truth (option B). A one-off import seeds these files from `fichas_conceitos_tecnicos_DR5_2019.csv`, and from then on they are edited by hand. The decree's text lives in structured header fields; the Markdown body is free space for personal commentary.
- Import clean-up of the CSV:
  - "ver também" references are resolved by normalised name plus an alias list (e.g. `Piso` → `Piso (de um edifício)`). The unresolvable reference `Zona` is dropped.
  - The density abbreviations misplaced in the units column (`Dhab`, `D`) are moved to the abbreviation field.
- The decree's figures (1a, 1b, 2, 3a, 3b, 4a, 4b, on DR pp. 87–90) are extracted from the PDF as images and shown on the concepts they illustrate.
- Instant, accent-insensitive search over concept names, aliases, abbreviations, definitions, complementary notes and commentary. It opens from the keyboard and shows which field matched, with a snippet.
- Navigation between concepts:
  - official "Ver também" links
  - automatic backlinks ("Referido por")
  - derived "Mencionado em" links, found where one concept's name appears in another's official text
  - hover previews of linked concepts
  - a small graph on each concept page and a full graph page
- An A–Z index, a sidebar grouped by annex, an "about the source" page, light and dark themes, and automated deployment through GitHub Actions.
- The PDF and CSV move to a `fontes/` folder for provenance. They are not published on the site.

## Capabilities

### New Capabilities

- `concept-content`: The per-concept content model (fields, aliases, figures, commentary), the one-off CSV import and its clean-up rules, and the build-time validation that guarantees every link resolves.
- `concept-pages`: How a single concept is presented (definition, notes, badges, figures, commentary, previous/next), plus the A–Z index and the sidebar grouped by annex.
- `concept-search`: Instant search across concepts: which fields are searched and how they are ranked, accent and case insensitivity, typo tolerance, keyboard access and how results are shown.
- `concept-connections`: The kinds of link between concepts (official "ver também", backlinks, derived mentions), inline linking of mentions, hover previews, and the per-concept and full graph views.
- `site-shell`: The site frame: European Portuguese interface, header and navigation, home and about pages, theme switching, responsive layout and the 404 page.
- `site-deployment`: Building and publishing the static site to GitHub Pages under the repository path, triggered from the main branch.

### Modified Capabilities

(none, since there are no existing specs)

## Impact

- **New code:**
  - Astro project at the repository root (`src/`, `astro.config.mjs`, `package.json`)
  - import and figure-extraction scripts in `scripts/`
  - 101 content files in `src/content/conceitos/`
  - figure images in `src/assets/figuras/`
  - a GitHub Actions workflow in `.github/workflows/`
- **Moved files:** the CSV and the PDF move to `fontes/`.
- **New dependencies:** Node 22 / npm, Astro, React (for interactive components only), Tailwind CSS, shadcn/ui (Radix), MiniSearch, graph-layout libraries, Vitest and Playwright. The one-off figure extraction uses Python with PyMuPDF, which is already installed on this machine.
- **External setup:**
  - create the GitHub repository and set Pages to deploy from GitHub Actions
  - the default branch must be `main`; the local branch is currently `master` with no commits
