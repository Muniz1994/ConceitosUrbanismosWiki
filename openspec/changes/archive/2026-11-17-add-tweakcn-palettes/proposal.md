# Proposal

## Why

The site has a single neutral grey look. Its only appearance setting is light, dark or system. tweakcn publishes ready-made shadcn themes that would give the wiki more character and let readers pick a look they find comfortable for long reading sessions. But tweakcn themes aren't checked for accessibility: of its 42 themes, only 7 pass this site's contrast checks. Adopting them safely needs a structure that keeps the themes as published and adapts them to the site in one place. It also needs an automated check that stops an unreadable theme from being published.

## What Changes

- New **palette** setting, chosen independently of the existing light/dark/system **mode**. Four palettes, taken from tweakcn:
  - **Soft Pop** (default)
  - **Vercel**
  - **Nature**
  - **Vintage Paper**
- Each palette is stored as tweakcn publishes it, in its own file. Changes to a palette are allowed only in a separate "fixes" block in that file, each with its reason and the contrast it achieves. Vintage Paper needs two fixes, both in light mode: a darker primary, so that button text reaches 4.5:1, and slightly darker muted text, so that it stays readable on hover surfaces.
- A site-level colour layer, written once and applied to every palette:
  - **Hover and selected states** use a light tint of the palette's accent, with text in the palette's normal text colour. Applied verbatim, Soft Pop's accent puts white text on bright yellow in dark mode (1.44:1).
  - **Annex colours** (Anexo I blue, Anexo II orange) belong to the site, not the palette. A palette may override them.
  - **Focus indicator**: one colour taken from the palette's primary, shown as a solid outline with a gap, the same on every control. Some palettes' own focus ring colour is too faint, e.g. Soft Pop's at 1.88:1.
- **BREAKING (UI):** the header's light/dark/system cycling button is replaced by a single «Aparência» button. It opens a panel with the mode (Claro / Escuro / Sistema) and the palette, each palette option showing samples of its colours.
- The chosen palette is remembered on the device. Like the mode, it's applied before the first paint, so pages never flash the wrong palette.
- Each palette brings its own fonts (e.g. DM Sans and Space Mono for Soft Pop). Fonts are loaded only for the palette in use.
- A contrast test runs in CI for every palette in both modes. A palette that makes text, buttons, focus or annex colours unreadable fails the build.

## Capabilities

### New Capabilities

- `site-appearance`: How readers control the site's look (mode and palette), which palettes exist and the default, how choices persist and apply without flashing, the «Aparência» control, and the minimum contrast every palette must meet in both modes.

### Modified Capabilities

- `site-shell`: the header lists the «Aparência» control instead of "the theme switch". The "Light and dark themes" requirement is removed, because `site-appearance` now owns it.

## Impact

- **Styles:**
  - `src/styles/global.css`: the current colour variables move out, and the site colour layer and font mappings are added.
  - New `src/styles/paletas/*.css`, one file per palette.
- **Layout:** `src/layouts/Base.astro`: the pre-paint script also applies the palette, the page renders with the default palette, and the header gets the new control.
- **Components:**
  - `AlternarTema.tsx` is replaced by an «Aparência» component.
  - Selected-state classes change in `BarraLateral.astro`, `MenuMovel.tsx`, `pesquisa/comum.tsx` and `indice.astro`.
  - The shadcn `components/ui` focus styles are overridden.
  - New shadcn `popover` and `radio-group` components.
- **i18n:** new interface text in `src/i18n/pt-PT`.
- **Dependencies:** font packages for DM Sans, Space Mono, Montserrat, Source Code Pro, Libre Baskerville and IBM Plex Mono. Geist is already installed.
- **Tests:**
  - New contrast unit test.
  - The e2e theme test in `tests/e2e/estrutura.spec.ts` is rewritten for the new control, covering mode and palette.
- No change to content, search, links or deployment.
