# Spec Delta

## Purpose

Lets readers find any DR 5/2019 concept immediately by name, abbreviation, or words in its definition, notes or commentary, and go straight to it from the keyboard.

## ADDED Requirements

### Requirement: Search available from every page
Every page SHALL have a search control. It SHALL open from the header button, the `/` key, or `Ctrl+K` (`⌘K` on macOS). The `/` key SHALL NOT open search while the reader is typing in a text field.

#### Scenario: Keyboard shortcut
- **WHEN** a reader presses `Ctrl+K` on a concept page
- **THEN** the search dialog opens with the cursor in the search field

#### Scenario: Slash while typing
- **WHEN** a reader types `/` inside a text field
- **THEN** the character is typed and search does not open

### Requirement: Searched fields and ranking
Search SHALL cover:
- concept name
- aliases
- abbreviation
- definition
- complementary notes
- commentary

An exact abbreviation or name match SHALL rank first. After that, matches SHALL rank by field, in this order: name and aliases, then definition, then notes and commentary.

#### Scenario: Abbreviation lookup
- **WHEN** a reader searches `Af`
- **THEN** `Afastamento` is the first result

#### Scenario: Abbreviation shared by two concepts
- **WHEN** a reader searches `Ai`
- **THEN** both `Área de implantação do edifício` and `Área total de implantação` appear above any result that only matches in text

#### Scenario: Name outranks text
- **WHEN** a reader searches `recuo`
- **THEN** `Recuo` ranks above concepts that only mention recuo in their notes

### Requirement: Tolerant matching
Matching SHALL ignore case and accents. It SHALL match word prefixes, and SHALL tolerate a one-character typo in search words of four or more characters.

#### Scenario: Accent-free search
- **WHEN** a reader searches `area implantacao`
- **THEN** `Área de implantação do edifício` appears among the first results

#### Scenario: Prefix while typing
- **WHEN** a reader has typed `afast`
- **THEN** `Afastamento` is shown

#### Scenario: Typo
- **WHEN** a reader searches `fachda`
- **THEN** `Fachada` appears among the results

### Requirement: Instant results
Results SHALL update as the reader types, without a page load or server request after the search data has loaded. The search data SHALL load no later than the first time search opens.

#### Scenario: Typing updates results
- **WHEN** a reader types each character of a query
- **THEN** results update after each keystroke with no network request

### Requirement: Result presentation
Each result SHALL show:
- the concept name
- the abbreviation and annex, when present
- the field that matched (`Nome`, `Abreviatura`, `Definição`, `Notas complementares` or `Comentário`)
- for text fields, a short snippet with the matched words highlighted

#### Scenario: Match in notes only
- **WHEN** a reader searches a phrase that appears only in `Alinhamento`'s notes
- **THEN** that result is labelled `Notas complementares` and shows a snippet with the words highlighted

### Requirement: Keyboard navigation of results
Arrow keys SHALL move between results. Enter SHALL open the selected concept. Escape SHALL close search.

#### Scenario: Open with Enter
- **WHEN** a reader searches `recuo`, moves to the first result and presses Enter
- **THEN** the `Recuo` page opens

### Requirement: Empty and no-result states
With an empty query, search SHALL suggest how to search and list recently visited concepts, if any. When nothing matches, it SHALL show `Sem resultados` and the query.

#### Scenario: No match
- **WHEN** a reader searches `xyzzy`
- **THEN** search shows `Sem resultados para «xyzzy»`

### Requirement: Annex filter in search
Search SHALL let the reader limit results to `Anexo I` or `Anexo II`.

#### Scenario: Filter by annex
- **WHEN** a reader searches `planta` and limits to `Anexo II`
- **THEN** only Anexo II concepts are listed
