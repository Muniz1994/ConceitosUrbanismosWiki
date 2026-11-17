# Tasks

## 1. Info colour

- [x] 1.1 In `src/styles/global.css`, per D3: add `--info: oklch(0.55 0.13 225)` to `:where(:root)`, `--info: oklch(0.78 0.11 225)` to `:where(.dark)`, and `--color-info: var(--info)` to `@theme inline`. Verify `npm run build` passes and the built CSS contains a `.text-info` rule once it is used (task 2.2).
- [x] 1.2 Add the pairs `info/background` and `info/card` (minimum 3:1) to `tests/unit/contraste.test.ts`, per D5. Verify `npm test` passes. Then temporarily set the light `--info` to `oklch(0.80 0.13 225)` and confirm the test fails with a message naming the palette, `claro` and `info/background`; restore the value.

## 2. Folded introduction on the home page

- [x] 2.1 Add `mostrarIntroducao: 'Introdução'` under `inicio` in `src/i18n/pt-PT.ts`. Verify the build passes.
- [x] 2.2 In `src/pages/index.astro`, per D1, D2 and D4:
  - wrap the `<h1>` and a new `<details class="sm:hidden">` in a `relative` container;
  - the `<summary>` is a 40 px round target on the title row, with the lucide `Info` icon in `text-info` and a `sr-only` label;
  - the introduction paragraph goes inside the `<details>`;
  - keep the current paragraph with `hidden sm:block`;
  - give the `<h1>` `pr-12 sm:pr-0`.

  Verify by hand at 360 px and at 1280 px in `npm run dev` or the preview.
- [x] 2.3 Write `tests/e2e/inicio.spec.ts`, per D6:
  - at 360 px: folded by default, with the search directly under the title; opens and closes with clicks; opens with Tab and Enter; folded again after reloading;
  - at 1280 px: the introduction is visible and there is no icon;
  - at both widths, the text appears once in the main region's accessibility snapshot.

  Verify `npm run test:e2e` passes.

## 3. Integration

- [x] 3.1 Run `npm run ci` from `D:\` and confirm every step passes. Check the home page at 360 px, open and closed, in all four palettes in light and dark mode. The icon must be clearly blue, sit on the title row without overlapping the title, and show the focus outline when reached with the keyboard.

## Workflow follow-up

- Archive `fold-home-intro-on-mobile` once implemented and reviewed, syncing the two added requirements into `site-shell` and `site-appearance`.
