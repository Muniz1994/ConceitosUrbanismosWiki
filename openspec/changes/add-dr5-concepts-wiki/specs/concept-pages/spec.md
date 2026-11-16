# Spec Delta

## Purpose

Defines how a single DR 5/2019 concept is presented and how readers browse the full set of concepts by annex and alphabetically.

## ADDED Requirements

### Requirement: Concept page header
Each concept page SHALL show:
- the concept name as the page title
- the annex and ficha identifier (e.g. `Anexo I · Ficha I-1`)
- the abbreviation and the units as labelled badges, when present

Units SHALL be shown in typographic form: `[m2]` as m², `[m3/m2]` as m³/m².

#### Scenario: Concept with abbreviation and units
- **WHEN** a reader opens `Afastamento`
- **THEN** the header shows `Anexo I · Ficha I-1`, an abbreviation badge `Af` and a units badge `m`

#### Scenario: Concept without abbreviation or units
- **WHEN** a reader opens `Alçado`
- **THEN** the header shows no abbreviation or units badges

### Requirement: Official text presentation
The definition SHALL appear first, visually set apart as the decree's text. Complementary notes SHALL follow as a list, in source order. A "Ver Figura N" mention in a note SHALL link to that figure on the same page.

#### Scenario: Notes with a figure mention
- **WHEN** a reader opens `Afastamento`, whose notes say `Ver Figura 1`
- **THEN** the notes appear as a list and `Figura 1` jumps to Figura 1a on that page

#### Scenario: Concept without notes
- **WHEN** a concept has no complementary notes
- **THEN** the page shows no notes section

### Requirement: Figures on concept pages
Each figure linked to a concept SHALL show with its caption and alternative text. Activating a figure SHALL open it enlarged, and the enlarged view SHALL close with Escape or a close button.

#### Scenario: Enlarging a figure
- **WHEN** a reader activates Figura 3a on `Altura da fachada`
- **THEN** the figure opens enlarged, and Escape closes it

### Requirement: Commentary section
When a concept has commentary, the page SHALL show it under a heading marking it as the author's annotation, visually distinct from the official text. `[[...]]` references in the commentary SHALL render as links to the referenced concepts.

#### Scenario: Commentary with a wiki link
- **WHEN** a concept's commentary contains `[[Recuo]]`
- **THEN** the commentary section shows a link labelled `Recuo` to the `Recuo` page

### Requirement: Sequential navigation
Each concept page SHALL link to the previous and next concepts in ficha order within its annex.

#### Scenario: Last concept of an annex
- **WHEN** a reader opens the last ficha of Anexo I
- **THEN** the page offers a link to the previous concept and no link to a next one

### Requirement: Edit link
Each concept page SHALL link to its content file in the GitHub repository for editing.

#### Scenario: Following the edit link
- **WHEN** a reader activates the edit link on `Recuo`
- **THEN** the browser opens the GitHub editor for that concept's content file

### Requirement: Annex sidebar
On wide screens, every page SHALL show a sidebar listing all concepts grouped under `Anexo I` and `Anexo II`, in ficha order, with the current concept highlighted. On narrow screens the sidebar SHALL be available through a menu button.

#### Scenario: Current concept highlighted
- **WHEN** a reader is on `Recuo`
- **THEN** `Recuo` is highlighted in the sidebar under `Anexo I` and scrolled into view

#### Scenario: Narrow screen
- **WHEN** the viewport is narrower than the sidebar breakpoint
- **THEN** the sidebar is hidden, and a menu button opens it as a panel

### Requirement: A–Z index
The site SHALL have an index page listing every concept alphabetically, grouped by first letter with accents ignored (e.g. `Área` under `A`). Each entry SHALL show the name, abbreviation, annex and the start of the definition. The index SHALL offer filters for annex and for "com abreviatura", which can be combined.

#### Scenario: Accented initial
- **WHEN** a reader opens the index
- **THEN** `Área de construção do edifício` is listed under `A`, in alphabetical order with the other `A` concepts

#### Scenario: Combined filters
- **WHEN** a reader selects `Anexo I` and `com abreviatura`
- **THEN** only Anexo I concepts that have an abbreviation are listed
