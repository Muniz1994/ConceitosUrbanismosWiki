# Design

## Context

See proposal.md for motivation, and specs/site-appearance/spec.md for the required behaviour.

Current state:

- **Colour variables.** `src/styles/global.css` holds one set of shadcn colour variables in `:root` and `.dark`. Tailwind v4 exposes them as utilities through `@theme inline`. Components outside `components/ui` use only these variables, with no hard-coded colours. The graph SVG also draws with `var(--…)`.
- **Mode.** An inline script in `Base.astro` sets `html.dark` and `html[data-tema]` from `localStorage['tema']` before first paint. `AlternarTema.tsx` cycles claro → escuro → sistema.
- **Hover and selected states** use `bg-accent`. The current concept in the sidebar and the active search filter pair `bg-accent` with `text-foreground`.
- **Focus** comes from two systems:
  - a base-layer `:focus-visible` outline in `outline-ring`;
  - the shadcn `components/ui` controls, which set `outline-none` and draw `focus-visible:ring-ring/50` instead.
- **Annex colours** `--anexo-i/ii` live alongside the theme variables.
- **Fonts.** Geist, loaded from `@fontsource-variable/geist`.

Measurements taken during exploration, with WCAG contrast computed from the oklch values:

- Soft Pop as published:
  - its focus ring is 1.88:1 in light mode;
  - `bg-accent` with `text-foreground` is 1.44:1 in dark mode.
- Vintage Paper as published: white button text on its primary is 3.73:1 in light mode.

## Goals / Non-Goals

**Goals:**
- Palette files can be replaced with a fresh tweakcn export with no other code changes, apart from re-checking the fixes block.
- Adding a fifth palette means: one CSS file, one entry in the palette list, its font packages, and passing the contrast test.
- The site's colour adjustments (hover and selected tints, focus, annex colours) are written once and apply to every palette.

**Non-Goals:**
- Readers creating or editing their own palettes.
- Using tweakcn's spacing, letter-spacing or shadows to change layout. They are mapped where they are harmless, but layout is not re-tuned per palette.
- Giving graph nodes a shape that differs by annex. That would be a non-colour cue; the colour contrast rules already cover the requirement, so it is left as a possible follow-up.
- Following the device's dark preference when scripts are disabled.

## Decisions

### D1. One CSS file per palette, keyed by `data-paleta`, verbatim plus a fixes block

Files: `src/styles/paletas/{soft-pop,vercel,nature,vintage-paper}.css`. Each file has three sections, in this order:

1. **tweakcn values, unchanged**, under the selectors `[data-paleta="x"]` (light) and `.dark[data-paleta="x"], .dark [data-paleta="x"]` (dark). These hold the colour variables, `--radius` and the shadow variables.
2. **Font stack**: `--font-sans` and `--font-mono`, pointing to the Fontsource family names (e.g. `'DM Sans Variable', 'DM Sans', sans-serif`). The font is the one tweakcn names. Only the family name differs, because Fontsource registers fonts under its own names.
3. **Fixes** (optional): each override carries a comment with its reason and the before → after ratio. The only fixes in this change are in Vintage Paper light mode:
   - `--primary` and `--sidebar-primary` go from `oklch(0.618 0.0778 65.5444)` to `oklch(0.54 0.0778 65.5444)`. White text on the primary goes from 3.73 to 5.15:1, and the primary against the background from 3.31 to 4.57:1.
   - `--muted-foreground` goes from `oklch(0.5391 0.0387 71.1655)` to `oklch(0.50 0.0387 71.1655)`. Muted text on the hover tint goes from 4.13 to 4.88:1, and on the background from 4.53 to 5.35:1. Making the tint lighter instead would not be enough: even at 12% it only reaches 4.33:1.

The palette selectors are attribute selectors, not `:root`. Any element can then carry `data-paleta`, which lets the swatches in the picker (D6) show other palettes' real colours without duplicating values.

`global.css` imports the four files and no longer defines the theme variables itself.

*Alternatives:*
- **A single file with all palettes.** Harder to re-paste a palette from tweakcn.
- **Generating CSS from the registry JSON at build time.** Adds a network or vendored-data dependency for little gain with only four palettes.

### D2. A single source for the list of palettes

`src/lib/aparencia.ts` exports the palette list (id, display name, default flag), the default id `soft-pop`, and the storage keys `tema` and `paleta`. The following all read from it:

- the pre-paint script (D4);
- the `Aparência` component (D6);
- the contrast test (D8).

### D3. A site layer in `@theme inline` that reads the palette

Everything that adapts palettes to this site lives in `global.css` and only reads palette variables:

- **Hover:**
  - `--color-accent: color-mix(in oklch, var(--accent) 25%, var(--background))`
  - `--color-accent-foreground: var(--foreground)`
  - Every existing `hover:bg-accent`, including in `components/ui`, picks this up with no class changes.
- **Selected:** a new `--color-selecionado: color-mix(in oklch, var(--accent) 45%, var(--background))`. Selected states switch from `bg-accent` to `bg-selecionado` in:
  - `BarraLateral.astro`
  - `MenuMovel.tsx`
  - `pesquisa/comum.tsx`
  - `indice.astro` (the `aria-pressed` filters)

  They keep `font-medium` and `aria-current` / `aria-pressed`, so the selected state isn't shown by colour alone.
- **Focus:** `--foco: var(--primary)`, and `--color-ring: var(--foco)`, so any remaining `ring-ring` or `outline-ring` matches.
- **Annex colours:** `--anexo-i/ii` stay in `:root` and `.dark` with today's blue and orange values. A palette file may override them: its selectors are as specific as `:root` (or more, in dark mode) and are imported later, so the override wins.
- **Mappings:** shadow variables (`--shadow-*`) and `--font-mono`. `--font-heading` keeps following `--font-sans`.

The palette's own `--accent` and `--ring` are never redefined. Only the Tailwind colour mappings change. This keeps the palette files verbatim.

*Alternative considered:* overriding `--accent` inside each palette's fixes block. Rejected: it would have to be repeated for every palette, and it defeats the "verbatim" rule.

### D4. Pre-paint script applies the mode and the palette

The existing inline script in `<head>` is extended to:

- read `localStorage['paleta']`;
- check it against the palette ids, which are injected as a JSON array from D2;
- set `document.documentElement.dataset.paleta`.

Unknown or missing values fall back to `soft-pop`. `Base.astro` also renders `<html data-paleta="soft-pop">` server-side, so the page has a palette even without scripts. The script stays the first `<script>` in `<head>`; the existing e2e test checks this.

### D5. Fonts: import every palette's fonts, the browser downloads only those in use

`global.css` imports the Fontsource CSS for:

- DM Sans (variable) and Space Mono, for Soft Pop;
- Geist (variable, already installed) and Geist Mono (variable), for Vercel;
- Montserrat (variable) and Source Code Pro (variable), for Nature;
- Libre Baskerville (variable) and IBM Plex Mono, for Vintage Paper.

A browser only downloads a `@font-face` file when the page actually uses that font, so each visitor pays only for the active palette. The extra cost is a few kilobytes of `@font-face` declarations. tweakcn's serif fonts (e.g. Nature's Merriweather) are not imported, because the site never uses `font-serif`.

*Trade-off:* with `font-display: swap`, the first visit to a palette briefly shows the fallback font.

### D6. `Aparência`: a popover with two radio groups

A new React component `Aparencia.tsx`, hydrated with `client:load`, replaces `AlternarTema.tsx` in the header.

- **Trigger:** an icon button (lucide `Palette`), the same size as today's toggle, so the header width at 360 px doesn't change. Its accessible name is `Aparência`, followed by the current mode and palette.
- **Panel:** a shadcn `Popover` (new) containing two shadcn `RadioGroup`s (new):
  - `Modo`: `Claro`, `Escuro`, `Sistema`;
  - `Paleta`: the four palettes. Each option shows three swatches (background, primary, accent), drawn inside an element with that option's `data-paleta`, using D1.
- **Behaviour:** a choice applies immediately, using the same logic as the pre-paint script, and is saved to `localStorage`. While the mode is `Sistema`, a `matchMedia` listener updates the page when the device's preference changes, as today.
- **Keyboard and screen readers:** Radix provides arrow-key movement inside each group, Escape to close, return of focus to the trigger, and the checked state for screen readers.

Strings go in `src/i18n/pt-PT.ts`, under the existing `tema` key, which is renamed `aparencia`.

### D7. One focus style, outside the layers

An **unlayered** rule in `global.css`:

```css
:focus-visible { outline: 2px solid var(--foco); outline-offset: 2px }
```

Unlayered CSS beats Tailwind's `utilities` layer, so it overrides `outline-none` in `components/ui` without editing every component. The `focus-visible:ring-*` classes are removed from `components/ui`, about 6 places, so each control has one indicator, not an outline plus a faint ring.

The palette's primary meets 3:1 against the background in all four palettes (Vintage Paper after its fix). D8 enforces it.

### D8. Contrast test over the real CSS

A Vitest unit test, `tests/unit/contraste.test.ts`, does the following:

1. Reads each palette file and resolves light and dark values. Fixes override the tweakcn values, in file order.
2. Applies the D3 formulas, with an oklch `color-mix` that interpolates the hue the short way round, as Chrome does. A grey written with an explicit hue (e.g. `oklch(0 0 0)`) still counts in the hue interpolation; only `none` would be ignored.
3. Converts to sRGB and computes WCAG ratios for the pairs the spec requires:

| pair | minimum |
|---|---|
| foreground / background | 7 |
| muted-foreground / background | 4.5 |
| primary-foreground / primary | 4.5 |
| foreground / hover tint | 4.5 |
| muted-foreground / hover tint | 4.5 |
| foreground / selected tint | 4.5 |
| focus colour / background | 3 |
| each annex colour / background | 3 |
| each annex colour / card | 3 |

Any checked value that is not in `oklch()` fails the test, so the measurements can't be skipped. Failure messages name the palette, mode, colour pair and ratio. The test runs in `npm test`, the first step of `npm run ci`, so it blocks deployment. The colour maths lives in a small module, `src/lib/contraste.ts`, so the test can also check it against known reference values.

### D9. Tests in the browser

- **Rewrite** the theme test in `estrutura.spec.ts`:
  1. open `Aparência`, choose `Escuro` and `Vintage Paper`;
  2. open another page;
  3. check `html.dark` and `data-paleta="vintage-paper"` before any script other than the pre-paint one runs.
- **New:** an unknown saved palette falls back to `soft-pop`.
- **New:** keyboard-only, open `Aparência`, use arrow keys and Escape, and check that focus returns to the button.
- **New:** with JavaScript disabled, the page renders `data-paleta="soft-pop"` in light mode.
- The existing 360 px checks keep covering the header.

## Risks / Trade-offs

- [A future tweakcn re-export drifts, e.g. Vintage Paper's primary changes] → The fix is a full replacement value with its ratio recorded, and D8 re-checks every palette in CI.
- [Black Soft Pop borders and 1rem radius look heavy in dense lists (sidebar, index)] → Accepted as the palette's character. If it doesn't work, a fix can adjust `--border` with a recorded reason. The spec allows this.
- [`color-mix` in oklch is not supported in old browsers] → It's supported in every current evergreen browser. Older ones fall back to no tint on hover, which is cosmetic only.
- [Font flash on first use of a palette] → `swap` keeps text visible. Each palette's fonts download once and are then cached.
- [Removing `focus-visible:ring-*` from `components/ui` makes a future `shadcn add` or update bring them back] → D7's unlayered outline still shows. The worst case is a faint extra ring, and the e2e focus check still passes.

## Migration Plan

- No data migration. Readers' existing `localStorage['tema']` values keep working unchanged.
- Readers with no `paleta` saved get Soft Pop, so **the site's look changes for everyone** on deploy. That's intended.
- **Rollback:** revert the commit. Leftover `paleta` keys are ignored by the old code.
