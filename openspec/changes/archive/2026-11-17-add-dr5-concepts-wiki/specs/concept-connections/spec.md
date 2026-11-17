# Spec Delta

## Purpose

Makes the relationships between DR 5/2019 concepts visible and easy to follow: the decree's official cross-references, links derived from the text, previews, and graph views.

## ADDED Requirements

### Requirement: Link types
The site SHALL distinguish three kinds of link between concepts:
- **explicit**: listed in "ver também" in the decree, or added by the author as a `[[...]]` link in the commentary
- **backlink**: the reverse of any explicit link
- **mention**: derived from the decree's own text (see "Derived mentions")

Mentions SHALL never be presented as part of the decree's official cross-references.

#### Scenario: Official and derived links shown apart
- **WHEN** a reader opens a concept that has both "ver também" links and mentions
- **THEN** they appear in separately labelled groups

### Requirement: "Ver também" section
Each concept page SHALL list its "ver também" references as links, in source order, under the heading `Ver também`.

#### Scenario: Afastamento cross-references
- **WHEN** a reader opens `Afastamento`
- **THEN** `Ver também` lists `Alçado`, `Empena`, `Fachada` and `Recuo`, each linking to its page

### Requirement: Backlinks section
Each concept page SHALL list, under `Referido por`, every concept that links to it explicitly, in alphabetical order. A concept with no incoming explicit links SHALL show no such section.

#### Scenario: Backlink appears
- **WHEN** `Afastamento` lists `Recuo` in "ver também"
- **THEN** the `Recuo` page shows `Afastamento` under `Referido por`

### Requirement: Derived mentions
Concept B is mentioned by concept A when B's name, or one of B's aliases, appears as whole words in A's definition or notes. Matching SHALL ignore case and accents. Where names overlap, the longest name SHALL win. Self-matches SHALL be ignored, as SHALL pairs already linked through "ver também". Abbreviations SHALL NOT trigger mentions.

#### Scenario: Longest match wins
- **WHEN** a definition contains `altura da fachada`
- **THEN** that text counts as a mention of `Altura da fachada` only, not of `Fachada`

#### Scenario: Already an official link
- **WHEN** `Afastamento` lists `Fachada` in "ver também" and its definition also contains `fachada`
- **THEN** `Fachada` is not listed again under `Afastamento`'s mentions

### Requirement: Mention sections
Each concept page SHALL list:
- under `Menciona`, the concepts that its official text mentions
- under `Mencionado em`, the concepts whose official text mentions it

Each list SHALL be in alphabetical order and SHALL be omitted when empty.

#### Scenario: Reverse mention listed
- **WHEN** `Afastamento`'s definition contains `edifício`
- **THEN** the `Edifício` page lists `Afastamento` under `Mencionado em`

### Requirement: Inline links in official text
In the definition and notes, the first appearance of each mentioned concept in each section SHALL link to that concept, styled subtly so the official text stays readable. The words of the decree's text SHALL NOT change.

#### Scenario: First occurrence linked
- **WHEN** a concept's definition contains `edifício` twice
- **THEN** only the first occurrence is a link to `Edifício`

### Requirement: Hover previews
On devices with a pointer, resting on any link to a concept SHALL show a preview with the concept's name, annex and ficha, abbreviation, and the start of its definition. The preview SHALL also show for keyboard focus. On touch devices a tap SHALL follow the link without a preview.

#### Scenario: Preview on hover
- **WHEN** a reader rests the pointer on the `Recuo` link on `Afastamento`
- **THEN** a preview shows `Recuo`, `Anexo I · Ficha I-57`, `Re`, and the start of its definition

#### Scenario: Touch device
- **WHEN** a reader taps the `Recuo` link on a touch screen
- **THEN** the `Recuo` page opens directly

### Requirement: Local graph on concept pages
Each concept page SHALL show a small graph of the concept, all its direct neighbours (explicit links and mentions), and the concepts one further explicit link away. The concept itself SHALL be emphasised, explicit links and mentions SHALL be drawn differently, and selecting a node SHALL open that concept. A concept with no links SHALL show a short note instead of a graph.

#### Scenario: Navigating from the local graph
- **WHEN** a reader selects the `Fachada` node in `Afastamento`'s local graph
- **THEN** the `Fachada` page opens

#### Scenario: Isolated concept
- **WHEN** a reader opens `RGB`, which has no links of either type
- **THEN** the page says the concept has no links instead of showing a graph

### Requirement: Full graph page
The site SHALL have a graph page showing all concepts and links, coloured by annex. The reader SHALL be able to zoom and pan, and to show or hide each link type. Hovering or focusing a node SHALL highlight its direct neighbours, and selecting a node SHALL open that concept.

#### Scenario: Hide mentions
- **WHEN** a reader turns off `Menções` on the graph page
- **THEN** only explicit links are drawn

#### Scenario: Neighbour highlight
- **WHEN** a reader hovers over `Edificação`
- **THEN** `Edificação`, its direct neighbours and the links between them are highlighted, and everything else is dimmed

### Requirement: Graph readable without interactivity
Both graph views SHALL show readable, laid-out content before any JavaScript runs. The concepts in each graph SHALL also be reachable as an ordinary list of links, for screen-reader and keyboard users.

#### Scenario: JavaScript disabled
- **WHEN** a reader opens the graph page with JavaScript disabled
- **THEN** the graph is shown laid out, and each node links to its concept
