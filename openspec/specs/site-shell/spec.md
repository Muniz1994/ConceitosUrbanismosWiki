# site-shell Specification

## Purpose

Provides the frame shared by every page of the DR 5/2019 concepts wiki: European Portuguese language, navigation (including where the appearance control sits; its behaviour is in `site-appearance`), home and about pages, and responsive behaviour.

## Requirements

### Requirement: European Portuguese interface
All interface text SHALL be in European Portuguese (pt-PT), including labels, buttons, headings, empty states and accessibility labels. Pages SHALL declare the language `pt-PT`. Brazilian Portuguese forms SHALL NOT be used (e.g. `Pesquisar`, not `Buscar`; `Transferir`, not `Baixar`).

#### Scenario: Page language
- **WHEN** any page is loaded
- **THEN** its root element declares `lang="pt-PT"`

#### Scenario: Interface wording
- **WHEN** a reader opens search
- **THEN** the placeholder reads `Pesquisar conceitos…`

### Requirement: Alphabetical order follows Portuguese rules
Alphabetical lists SHALL sort with Portuguese collation, so accented initials sort with their base letter.

#### Scenario: Accented names sorted
- **WHEN** concepts are listed alphabetically
- **THEN** `Área total de construção` comes after `Altura entre pisos` and before `Atualização cartográfica`

### Requirement: Header navigation
Every page SHALL have a header with:
- the site name, linking home
- the search control
- links to `Índice`, `Grafo` and `Sobre`
- the `Aparência` control (see `site-appearance`)

#### Scenario: Reaching the graph
- **WHEN** a reader activates `Grafo` in the header
- **THEN** the full graph page opens

### Requirement: Home page
The home page SHALL:
- identify the source (Decreto Regulamentar n.º 5/2019, Anexos I and II)
- offer a large search field
- show the number of concepts in each annex
- link to the index and the graph

#### Scenario: Counts shown
- **WHEN** a reader opens the home page
- **THEN** it shows 73 concepts in Anexo I and 28 in Anexo II, taken from the content

### Requirement: About page
The about page SHALL:
- give the full citation of DR 5/2019, with a link to its official publication
- state that the decree's published text prevails over this site
- explain the difference between official text, derived mentions and personal commentary

#### Scenario: Disclaimer present
- **WHEN** a reader opens `Sobre`
- **THEN** it states that the official text published in the Diário da República prevails

### Requirement: Responsive layout
Every page SHALL work from 360 px wide to desktop widths without horizontal scrolling. At 360 px wide, the header SHALL keep the search control visible, and the other navigation SHALL move into a menu.

#### Scenario: Phone width
- **WHEN** a concept page is shown 360 px wide
- **THEN** the page does not scroll sideways and the search control is visible

### Requirement: Accessible navigation
All interactive controls SHALL be reachable and usable by keyboard, with a visible focus indicator. Every page SHALL offer a "skip to content" link as its first focusable element.

#### Scenario: Skip link
- **WHEN** a keyboard user presses Tab once on a fresh page
- **THEN** a visible `Saltar para o conteúdo` link receives focus

### Requirement: Not-found page
An unknown address SHALL show a European Portuguese not-found page with the search control and a link to the index.

#### Scenario: Unknown concept address
- **WHEN** a reader opens `/conceitos/nao-existe/`
- **THEN** a page reading `Página não encontrada` is shown, with search and a link to `Índice`
