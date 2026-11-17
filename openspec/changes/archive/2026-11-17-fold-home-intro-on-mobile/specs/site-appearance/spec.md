# Spec Delta

## ADDED Requirements

### Requirement: Info colour independent of palette
Informational icons SHALL use a site-owned info colour: a conventional blue, the same in every palette, with a lighter version in dark mode. It SHALL stay visibly distinct from the Anexo I colour. It SHALL have a contrast of at least 3:1 against the page and card backgrounds in every palette and mode, and the automated contrast check SHALL cover it.

#### Scenario: Same blue in every palette
- **WHEN** the reader switches from `Soft Pop` to `Nature`
- **THEN** the home page info icon keeps the same blue

#### Scenario: Visible in every palette and mode
- **WHEN** the info icon is shown in light `Vintage Paper`
- **THEN** its contrast against the page background is at least 3:1
