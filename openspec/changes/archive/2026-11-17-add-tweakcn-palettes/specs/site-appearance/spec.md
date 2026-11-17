# Spec Delta

## Purpose

Lets readers choose how the DR 5/2019 concepts wiki looks: a light, dark or system mode and one of several colour palettes. Every combination must remain readable and usable by keyboard.

## ADDED Requirements

### Requirement: Mode setting
The site SHALL offer three modes: `Claro`, `Escuro` and `Sistema`. The default SHALL be `Sistema`, which follows the device's light or dark preference and SHALL update when that preference changes while a page is open.

#### Scenario: Default mode follows the device
- **WHEN** a reader with no saved choice opens the site on a device set to dark
- **THEN** the page renders in dark mode

#### Scenario: Device preference changes while reading
- **GIVEN** the mode is `Sistema`
- **WHEN** the device switches from light to dark
- **THEN** the open page switches to dark without reloading

### Requirement: Palette setting
The site SHALL offer exactly four palettes: `Soft Pop`, `Vercel`, `Nature` and `Vintage Paper`. The default SHALL be `Soft Pop`. The palette SHALL be chosen independently of the mode, and every palette SHALL have both a light and a dark version.

#### Scenario: Default palette
- **WHEN** a reader with no saved choice opens the site
- **THEN** the page uses the `Soft Pop` palette

#### Scenario: Palette and mode combine
- **GIVEN** the palette is `Nature`
- **WHEN** the reader switches the mode to `Escuro`
- **THEN** the page shows the dark version of `Nature`

### Requirement: Palette fidelity to tweakcn
Each palette SHALL use the colours, radius and fonts that tweakcn publishes for it. A palette MAY depart from its tweakcn values only where needed to meet the contrast requirements, and each such departure SHALL be recorded with its reason and the contrast it achieves.

#### Scenario: Vintage Paper buttons
- **WHEN** a primary button is shown in `Vintage Paper` light mode
- **THEN** its text has a contrast of at least 4.5:1 against the button, although tweakcn's published colours give 3.73:1

### Requirement: Remembered appearance choices
The reader's mode and palette choices SHALL be remembered on that device and apply to every page. A missing or unrecognised saved value SHALL fall back to the default for that setting.

#### Scenario: Choice persists across pages
- **WHEN** a reader selects `Vintage Paper` and `Escuro`, then opens another page
- **THEN** that page uses dark `Vintage Paper`

#### Scenario: Unknown saved palette
- **GIVEN** the device has a saved palette name that the site does not offer
- **WHEN** a page loads
- **THEN** it uses `Soft Pop`

### Requirement: No flash of the wrong appearance
Pages SHALL render in the reader's saved mode and palette from their first paint. Pages SHALL NOT briefly show a different mode or palette while loading.

#### Scenario: First paint after navigation
- **GIVEN** the saved choice is dark `Nature`
- **WHEN** the reader opens another page
- **THEN** that page's first paint is already dark `Nature`

### Requirement: Usable without scripts
If scripts are unavailable, pages SHALL render legibly with the default palette in light mode. The `Aparência` control MAY be unavailable in that case.

#### Scenario: Scripts disabled
- **WHEN** a page is loaded with scripts disabled
- **THEN** it renders in light `Soft Pop`, with all content readable

### Requirement: Appearance control
Every page header SHALL contain one control labelled `Aparência`. It SHALL open a panel with the mode choice (`Claro`, `Escuro`, `Sistema`) and the palette choice. Each palette option SHALL show its name and samples of its colours. A choice SHALL take effect immediately, without reloading.

#### Scenario: Changing the palette
- **WHEN** a reader opens `Aparência` and selects `Vercel`
- **THEN** the page switches to `Vercel` at once and the panel shows `Vercel` as selected

#### Scenario: Header at phone width
- **WHEN** a page is shown 360 px wide
- **THEN** the `Aparência` control and the search control are both visible and the page does not scroll sideways

### Requirement: Keyboard and screen-reader access to the appearance control
The `Aparência` control and its panel SHALL be fully usable by keyboard. Assistive technology SHALL be able to identify the current mode and palette. Closing the panel SHALL return focus to the `Aparência` control.

#### Scenario: Keyboard-only change
- **WHEN** a keyboard user opens `Aparência`, moves to `Nature` with arrow keys and confirms
- **THEN** `Nature` is applied and announced as selected

#### Scenario: Closing with Escape
- **WHEN** the panel is open and the reader presses Escape
- **THEN** the panel closes and focus returns to the `Aparência` control

### Requirement: Readable text in every palette
In every palette, in both modes, body text SHALL have a contrast of at least 7:1 against the page background. Secondary (muted) text and text on primary buttons SHALL have a contrast of at least 4.5:1.

#### Scenario: Muted text
- **WHEN** secondary text is shown in any palette and mode
- **THEN** its contrast against the page background is at least 4.5:1

### Requirement: Readable hover and selected states
Hover and selected states SHALL be visibly different from the surrounding surface. Text on them SHALL keep a contrast of at least 4.5:1 in every palette and mode. A selected item SHALL also be shown in a way that doesn't rely on colour alone.

#### Scenario: Current concept in the sidebar
- **WHEN** a concept page is shown in dark `Soft Pop`
- **THEN** the current concept in the sidebar is highlighted, shown in bolder type, and its text contrast is at least 4.5:1

### Requirement: Visible focus in every palette
Every focusable control SHALL show a focus indicator with a contrast of at least 3:1 against the adjacent background, in every palette and mode. The indicator SHALL look the same on every control.

#### Scenario: Focus in Soft Pop light
- **WHEN** a keyboard user focuses a link in light `Soft Pop`
- **THEN** a focus indicator with at least 3:1 contrast is visible around it

### Requirement: Annex colours independent of palette
Concepts from Anexo I and Anexo II SHALL keep distinct, consistent colours, which are not taken from the palette's own colours. Each annex colour SHALL have a contrast of at least 3:1 against the page and card backgrounds in every palette and mode. A palette MAY override the annex colours only if the overrides still meet these conditions.

#### Scenario: Annex colours after switching palette
- **WHEN** the reader switches from `Soft Pop` to `Vercel`
- **THEN** Anexo I concepts remain blue and Anexo II concepts remain orange in the graph and in the lists

### Requirement: Contrast is verified automatically
The build pipeline SHALL check the contrast requirements for every palette in both modes, and SHALL fail if any of them is not met. A palette that fails SHALL NOT be published.

#### Scenario: Adding an unreadable palette
- **WHEN** a palette whose muted text has 3.6:1 contrast is added
- **THEN** the pipeline fails, names the palette, mode, colour pair and measured ratio, and the published site is unchanged
