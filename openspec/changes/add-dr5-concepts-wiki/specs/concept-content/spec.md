# Spec Delta

## Purpose

Defines how each DR 5/2019 concept is stored as an editable Markdown file, how those files are seeded once from the source CSV, and the validation that keeps official text, figures and links consistent.

## ADDED Requirements

### Requirement: One content file per concept
The site SHALL take its content from one Markdown file per concept. Each file SHALL hold these official fields:
- concept name
- annex (`I` or `II`)
- ficha identifier (e.g. `I-1`)
- abbreviation (optional)
- units (optional)
- definition
- complementary notes, as an ordered list
- "ver também" references
- aliases
- figure identifiers

The Markdown body SHALL hold optional personal commentary.

#### Scenario: Concept file with commentary
- **WHEN** a concept file has official fields and a non-empty body
- **THEN** the site shows the official fields as the decree's text and the body as a separate commentary section

#### Scenario: Concept file without commentary
- **WHEN** a concept file has an empty body
- **THEN** the site builds and the concept page shows no commentary section

### Requirement: Concept identity and addresses
Every concept SHALL have a unique address made from its name, in lowercase, with accents removed and words separated by hyphens. Addresses SHALL stay the same across builds.

#### Scenario: Accented name
- **WHEN** a concept is named `Área de implantação do edifício`
- **THEN** its page address ends in `/conceitos/area-de-implantacao-do-edificio/`

#### Scenario: Duplicate address
- **WHEN** two concept files would produce the same address
- **THEN** the build fails with a message naming both files

### Requirement: Content validation at build time
The build SHALL fail with a message naming the file and field when:
- a required official field is missing or empty
- the annex value is invalid
- two concepts share a ficha identifier

#### Scenario: Missing definition
- **WHEN** a concept file has no definition
- **THEN** the build fails and the message names that file and the `definicao` field

### Requirement: Link references resolve by name or alias
A reference to another concept, whether in "ver também" or as a `[[...]]` link in the commentary, SHALL resolve to the concept whose name or alias matches it, ignoring case, accents and punctuation. A reference that matches no concept SHALL fail the build. A reference that matches more than one concept SHALL also fail the build.

#### Scenario: Reference by alias
- **WHEN** a concept lists `Piso` in "ver também" and `Piso (de um edifício)` has the alias `Piso`
- **THEN** the link points to `Piso (de um edifício)`

#### Scenario: Case and accent differences
- **WHEN** a reference reads `Altura da Edificação` and the concept is named `Altura da edificação`
- **THEN** the reference resolves to that concept

#### Scenario: Unknown reference
- **WHEN** a commentary contains `[[Conceito inexistente]]`
- **THEN** the build fails and the message names the file and the unresolved reference

### Requirement: One-off import from the source CSV
An import command SHALL create one content file per CSV row:
- copy the official text word for word
- split complementary notes on ` | ` into an ordered list
- split "ver também" on `;`, and also on `,` when the whole entry does not match a concept

The command SHALL NOT overwrite existing content files unless explicitly forced.

#### Scenario: First import
- **WHEN** the import runs and no content files exist
- **THEN** 101 content files are created: 73 for Anexo I and 28 for Anexo II

#### Scenario: Content already exists
- **WHEN** the import runs, content files already exist and it is not forced
- **THEN** it changes no file and reports that the content already exists

#### Scenario: Comma-joined references
- **WHEN** a CSV "ver também" entry reads `Catálogo de objetos, Modelo de dados`
- **THEN** the content file lists `Catálogo de objetos` and `Modelo de dados` as two references

### Requirement: Import clean-up rules
The import SHALL:
- resolve known name variants through aliases added to the target concepts
- drop the unresolvable reference `Zona`
- move `Dhab` and `D` from units to abbreviation for the two density concepts

It SHALL print a report listing every alias added, every reference dropped and every field moved.

#### Scenario: Unresolvable reference dropped
- **WHEN** the import processes `Área de solo`, whose "ver também" includes `Zona`
- **THEN** `Zona` is left out of that concept's references and the report lists it as dropped

#### Scenario: Misplaced abbreviation
- **WHEN** the import processes `Densidade habitacional` with units `Dhab` and no abbreviation
- **THEN** the content file has abbreviation `Dhab`, no units, and the report lists the move

### Requirement: Figures from the decree
The decree's figures (1a, 1b, 2, 3a, 3b, 4a, 4b) SHALL be available as image files. Each SHALL have an identifier, the decree's caption, alternative text and its source page. A concept SHALL show every figure listed in its figure field. A figure identifier that does not exist SHALL fail the build.

#### Scenario: Figure referenced by caption
- **WHEN** the import seeds figure fields
- **THEN** each concept named in a figure's caption, or whose notes cite that figure, lists that figure's identifier

#### Scenario: Unknown figure
- **WHEN** a concept lists figure `figura-9`
- **THEN** the build fails naming the file and `figura-9`

### Requirement: Source documents kept for provenance
The source CSV and the decree PDF SHALL stay in the repository and SHALL NOT be published on the site.

#### Scenario: Built site contents
- **WHEN** the site is built
- **THEN** the output contains neither the CSV nor the PDF
