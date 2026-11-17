# Design

## Context

See proposal.md for motivation, and the two spec deltas for the required behaviour.

Current state:

- `src/pages/index.astro` renders, in this order: the source line, the `<h1>`, a `<p>` with `t.inicio.introducao`, then the search block.
- **Site-owned colours** (`--anexo-i`, `--anexo-ii`, `--foco`) live in `src/styles/global.css`, in `:where(:root)` and `:where(.dark)`, and are exposed to Tailwind through `@theme inline`.
- **Contrast test.** `tests/unit/contraste.test.ts` already reads those two blocks (through `tests/unit/apoio/paletas.ts`) and checks fixed pairs for every palette and mode.
- **Focus.** The unlayered `:focus-visible` rule gives every focusable element the same outline, including a `<summary>`.
- **Breakpoint.** Tailwind's `sm` is 640 px, the boundary in the spec.

## Goals / Non-Goals

**Goals:**
- Folding works with no JavaScript and no hydration delay. The home page doesn't gain a client island.
- One source for the introduction text.
- The info colour is added the same way as the annex colours, and the existing contrast test covers it.

**Non-Goals:**
- Folding the descriptions on other pages, or making this a general component. With one use, a component would be premature.
- Remembering the open/closed state.
- Animating the expand.

## Decisions

### D1. Two renderings, one shown per width

- **Below 640 px:** a `<details>` element with `sm:hidden`. Its `<summary>` is the info icon, and its content is the introduction paragraph.
- **From 640 px up:** the current `<p>`, with `hidden sm:block`.

Both read the same `t.inicio.introducao`. Content with `display: none` is not in the accessibility tree, so at any width assistive technology reads the text once. That meets "read once".

*Alternatives:*
- **A single `<details>` forced open on wide screens with CSS** (`::details-content`). Rejected: browser support is uneven, and a closed `<details>` hides its content regardless of most CSS.
- **A single `<details>` with `open` set by a script on wide screens.** Rejected: it needs JavaScript and causes a visible jump after load.
- **A JavaScript disclosure button.** Rejected: `<details>` already gives the expanded/collapsed state, keyboard support, and no-JS behaviour.

### D2. Icon on the title row, text below the title

`<summary>` must be the first child of `<details>`, and the content follows it. So the `<details>` element sits in normal flow right after the `<h1>`, and the `<summary>` is placed on the title row with absolute positioning:

```
<div class="relative">                      wrapper: <h1> + <details>
  <h1 class="pr-12 sm:pr-0">…</h1>          room for the icon below 640 px
  <details class="sm:hidden">
    <summary class="absolute top-0 right-0 size-10 …">
      <Info class="text-info" aria-hidden />  + sr-only name
    </summary>
    <p class="mt-4 …">{introducao}</p>
  </details>
</div>
<p class="hidden sm:block mt-4 …">{introducao}</p>
```

- **When closed,** the `<details>` element takes up no height, since its only child in flow is the hidden content. The search block follows the title directly.
- **When open,** the paragraph appears under the title and pushes the search down.
- The `<summary>` hides the default disclosure triangle (`list-none`, plus `[&::-webkit-details-marker]:hidden` for Safari). It's a 40 px round target (`size-10`).

*Alternative:* `details { display: contents }`, to put the summary and the content in different grid cells. Rejected: support for `display: contents` on `<details>` is inconsistent, and it has accessibility bugs in some browsers.

### D3. The info colour is a site token next to the annex colours

In `global.css`:

- `:where(:root)` gets `--info: oklch(0.55 0.13 225)`.
- `:where(.dark)` gets `--info: oklch(0.78 0.11 225)`.
- `@theme inline` gets `--color-info: var(--info)`, which gives the `text-info` class.

The hue, 225, is 25° away from the Anexo I hue of 250. Measured during exploration:

| | against the page background |
|---|---|
| light mode, all four palettes | 4.0–4.4:1 |
| dark mode, all four palettes | 7.6–10.8:1 |

Palettes do not override it: the spec requires the same blue everywhere. The zero specificity of `:where()` would technically allow an override, as it does for the annex colours, but no palette file sets it.

### D4. Accessible name

The `<summary>` contains a `sr-only` label from `t.inicio.mostrarIntroducao`, set to «Introdução». The name stays the same in both states, because the native expanded/collapsed state is announced separately. The icon itself is `aria-hidden`. The global focus outline applies to it unchanged.

### D5. Contrast test pairs

`tests/unit/contraste.test.ts` gains:

| pair | minimum |
|---|---|
| `info/background` | 3 |
| `info/card` | 3 |

`camadaSite()` already merges the `:where(:root)` and `:where(.dark)` variables into each palette's resolved colours, so `--info` is picked up without changing the helper.

### D6. Browser tests

A new file, `tests/e2e/inicio.spec.ts`:

- **At 360 px:**
  - the `<details>` is closed, the introduction is not visible, the icon is visible, and the search field's top edge sits directly under the title (no introduction between them);
  - clicking the icon shows the introduction, and clicking again hides it;
  - with the keyboard, Tab to the icon and press Enter: the introduction opens and the `<details>` has `open`;
  - after reloading, it's folded again.
- **At 1280 px:** the introduction is visible and the icon is not.
- **Read once:** at both widths, the introduction text appears once in the main region's accessibility snapshot.

The existing 360 px no-horizontal-scroll test already covers the home page in every palette.

## Risks / Trade-offs

- [The introduction text exists twice in the HTML] → It's a single sentence, and only one copy is displayed and exposed at a time. The cost is negligible next to the alternatives.
- [Hidden content isn't searchable with the browser's find-in-page on phones] → Chrome does open closed `<details>` on find (auto-expand), and other browsers may not. Accepted: the text is introductory, not reference content.
- [A long title on narrow screens could run under the icon] → `pr-12` on the `<h1>` below 640 px reserves the space.
- [The info blue sits near the Anexo I dots on the home cards] → The hues are 25° apart and the shapes differ (a circled "i" next to the title, dots inside cards).

## Migration Plan

None. This is a static markup and CSS change; reverting the commit restores the current behaviour.
