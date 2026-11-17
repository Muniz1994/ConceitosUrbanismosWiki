# Tasks

## 1. Contrast checker and palette list

- [x] 1.1 Create `src/lib/contraste.ts`: oklch parsing, oklch → sRGB conversion, WCAG ratio, and oklch `color-mix` (short-way hue, matching Chrome: an explicit hue on a grey still counts), per D8. Add Vitest tests against reference values: white/black = 21, Soft Pop light `--ring` on `--background` ≈ 1.88, Vintage Paper light primary-foreground on primary ≈ 3.73. Verify `npm test` passes.
- [x] 1.2 Create `src/lib/aparencia.ts`, per D2: palette ids and display names (`soft-pop` Soft Pop, `vercel` Vercel, `nature` Nature, `vintage-paper` Vintage Paper), the default `soft-pop`, the storage keys `tema` / `paleta`, and a function that turns a stored value into a valid palette id. Add a Vitest test that unknown, empty and missing values return `soft-pop`.

## 2. Palette files and site colour layer

- [x] 2.1 Add the font packages and verify `npm ci` installs them:
  - `@fontsource-variable/dm-sans`
  - `@fontsource/space-mono`
  - `@fontsource-variable/geist-mono`
  - `@fontsource-variable/montserrat`
  - `@fontsource-variable/source-code-pro`
  - `@fontsource-variable/libre-baskerville`
  - `@fontsource/ibm-plex-mono`
- [x] 2.2 Create `src/styles/paletas/{soft-pop,vercel,nature,vintage-paper}.css`, per D1:
  - the tweakcn light and dark values, copied unchanged from `https://tweakcn.com/r/themes/<id>.json`, under `[data-paleta="<id>"]` and `.dark[data-paleta="<id>"], .dark [data-paleta="<id>"]`;
  - the font stack section;
  - in `vintage-paper.css`, a fixes block that sets the light `--primary` and `--sidebar-primary` to `oklch(0.54 0.0778 65.5444)`, with its reason and ratios (3.73 → 5.15), and the light `--muted-foreground` set to `oklch(0.50 0.0387 71.1655)` (muted text on the hover tint 4.13 → 4.88).

  Verify each file's tweakcn section matches the registry JSON value for value.
- [x] 2.3 Rework `src/styles/global.css`, per D3 and D5:
  - remove the old colour variables;
  - import the font CSS and the four palette files;
  - keep `--anexo-i/ii` in `:root` / `.dark`;
  - in `@theme inline`, add the hover tint (`--color-accent`, `--color-accent-foreground`), `--color-selecionado`, `--foco`, `--color-ring`, the shadow variables and `--font-mono`.

  Verify `npm run build` passes, and that in `npm run dev` each palette renders when `data-paleta` is set by hand in devtools.
- [x] 2.4 Write `tests/unit/contraste.test.ts`, per D8: read the four palette files (fixes applied), apply the D3 formulas, and assert every pair in the spec's contrast requirements for light and dark mode, with failure messages naming palette, mode, pair and ratio. Verify it passes, then temporarily remove the Vintage Paper fix and confirm the test fails with a message naming `vintage-paper`, `light` and `primary-foreground/primary`.
- [x] 2.5 Switch the selected states from `bg-accent` to `bg-selecionado`, keeping `font-medium` and `aria-current` / `aria-pressed`:
  - `BarraLateral.astro`
  - `MenuMovel.tsx`
  - `pesquisa/comum.tsx`
  - `indice.astro`

  Verify by checking in `npm run dev` that the current concept in the sidebar is readable in dark Soft Pop.

## 3. Focus indicator

- [x] 3.1 Add the unlayered `:focus-visible` outline rule (D7) to `global.css`, and remove the base-layer `outline-ring` focus rule it replaces. Verify the rule is outside every `@layer`.
- [x] 3.2 Remove the `focus-visible:ring-*` classes from `src/components/ui` (button, input, input-group, toggle and any others found with `grep focus-visible:ring`). Verify the grep finds nothing.
- [x] 3.3 Add a Playwright test: in light Soft Pop, tab to a header link and to a shadcn button, and check that both show a computed `outline-style: solid` and `outline-color` matching `--primary`. Verify `npm run test:e2e` passes.

## 4. Applying the palette before paint

- [x] 4.1 In `Base.astro`:
  - render `<html data-paleta="soft-pop">`;
  - extend the inline `<head>` script to read `localStorage['paleta']`, check it against the palette ids injected from `aparencia.ts`, and set `dataset.paleta`;
  - keep the script the first in `<head>`, and keep the `tema` handling unchanged.

  Verify the existing check for `localStorage.getItem('tema')` still passes.
- [x] 4.2 Add Playwright tests:
  - a saved `paleta` of `nature` is on `<html>` at first paint after navigation;
  - an unknown saved value gives `soft-pop`;
  - with JavaScript disabled, the page has `data-paleta="soft-pop"` and no `dark` class.

  Verify `npm run test:e2e` passes.

## 5. The «Aparência» control

- [x] 5.1 Add the shadcn `popover` and `radio-group` components with the shadcn CLI, and remove any `focus-visible:ring-*` classes they bring (D7). Verify they build and the grep from 3.2 still finds nothing.
- [x] 5.2 Update `src/i18n/pt-PT.ts`: rename `tema` to `aparencia` and add the button label (including the current mode and palette), the group headings `Modo` and `Paleta`, `Claro`/`Escuro`/`Sistema` and the palette names. Verify `astro check` passes.
- [x] 5.3 Implement `src/components/Aparencia.tsx`, per D6, and replace `AlternarTema` with it in `Base.astro`; delete `AlternarTema.tsx`. It has:
  - an icon trigger;
  - a popover with the `Modo` and `Paleta` radio groups;
  - swatches drawn inside a `data-paleta` element for each option;
  - choices that apply immediately and are saved;
  - the `matchMedia` listener while the mode is `Sistema`.

  Verify by hand in `npm run dev` that every mode/palette combination applies without reloading.
- [x] 5.4 Rewrite the theme test in `tests/e2e/estrutura.spec.ts`, per D9: choose `Escuro` and `Vintage Paper` through `Aparência`, navigate, and assert `html.dark` and `data-paleta="vintage-paper"` from first paint. Add a keyboard test: open with Enter, use arrow keys to select `Nature`, close with Escape, and check that focus is back on the trigger. Verify `npm run test:e2e` passes.
- [x] 5.5 Check the header at 360 px in all four palettes, since the fonts are wider in some of them. The existing no-horizontal-scroll test must pass, and the search control and `Aparência` must both be visible. Extend the 360 px test to loop over the palettes. Verify `npm run test:e2e` passes.

## 6. Documentation and integration

- [x] 6.1 Update `README.md`:
  - describe the «Aparência» setting and the four palettes;
  - add a section "Adicionar uma paleta": copy from tweakcn, add the font packages and the id in `aparencia.ts`, run `npm test`, and record any fix with its reason and ratio.

  Verify the steps against the files as built.
- [x] 6.2 Run `npm run ci` from `D:\` and confirm all steps pass. Review every page in each palette and mode at 360 px and at desktop width (home, index, a concept with figures, graph, search open, 404), and note any visual problem as a fix or a follow-up.

## Workflow follow-up

- Archive `add-tweakcn-palettes` once implemented and reviewed, syncing both specs: `site-appearance` (new) and `site-shell` (header item changed, "Light and dark themes" removed).
- After archiving, consider rewording the `site-shell` Purpose ("…theming…") to "appearance control" by editing `openspec/specs/site-shell/spec.md` directly, since deltas can't change a Purpose.
- Possible follow-up: give Anexo II graph nodes a different shape, so annex identity doesn't depend on colour.
- Follow-ups noted in the 6.2 review (none blocks this change):
  - In palettes with a pure black or white background (Soft Pop, Vercel), Chrome mixes towards that colour's explicit hue 0, so the dark-mode hover and selected tints drift towards red-brown. Mixing `in oklab` instead of `in oklch` would keep the accent's hue; `src/lib/contraste.ts` would need the same change.
  - Figure images stay white in dark mode (predates this change).
  - `astro check` reports errors because `@types/node` is not installed. 34 of them predate this change, and the new test helper `tests/unit/apoio/paletas.ts` adds 3 of the same kind. `npm run ci` does not run `astro check`.
