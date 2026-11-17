# Proposal

## Why

On a phone (360 px wide), the home page introduction takes about six lines between the title and the search field. That pushes search, the main thing readers come for, down the screen. The text is useful the first time but not on every visit, so on narrow screens it should be one tap away instead of always in the way.

## What Changes

- Below 640 px wide, the home page introduction («Definições, notas complementares e ligações…») starts folded. An info icon next to the title opens it in place, pushing the content below it down. Tapping the icon again closes it. It starts folded on every visit; the choice is not remembered.
- From 640 px up, the introduction shows as it does today.
- It works without JavaScript. Screen readers announce whether it is open or closed.
- New site-level **info colour** for the icon: the same conventional blue in every palette, slightly towards cyan so it stays distinct from the Anexo I blue, with a lighter version for dark mode. Like the annex colours, it belongs to the site, not to the palette.
- The contrast test also checks the info colour (at least 3:1 against the page and card backgrounds, in every palette and mode).
- Out of scope: the descriptions on Índice, Grafo and Sobre, and the `<meta>` description, which stay unchanged.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `site-shell`: adds a requirement for how the home page introduction behaves on narrow screens.
- `site-appearance`: adds a requirement for the site-owned info colour and its minimum contrast in every palette.

## Impact

- **Page:** `src/pages/index.astro`: the introduction is rendered as a disclosure below 640 px and as the current paragraph from 640 px up.
- **Styles:** `src/styles/global.css`: a new `--info` colour (light and dark) and its Tailwind mapping.
- **i18n:** `src/i18n/pt-PT.ts`: the accessible name of the info control.
- **Tests:**
  - `tests/unit/contraste.test.ts` gains the info-colour pairs.
  - New browser tests for the folded state at 360 px, opening and closing, keyboard use, and the unfolded state at desktop width.
- No new dependencies. No change to content, search, links or deployment.
