# Spec Delta

## MODIFIED Requirements

### Requirement: Header navigation
Every page SHALL have a header with:
- the site name, linking home
- the search control
- links to `Índice`, `Grafo` and `Sobre`
- the `Aparência` control (see `site-appearance`)

#### Scenario: Reaching the graph
- **WHEN** a reader activates `Grafo` in the header
- **THEN** the full graph page opens

## REMOVED Requirements

### Requirement: Light and dark themes
**Reason**: Replaced by `site-appearance`. Its "Mode setting", "Remembered appearance choices" and "No flash of the wrong appearance" requirements cover the light, dark and system modes, and add the palette alongside them.
**Migration**: None for readers. A dark/light choice already saved on a device keeps working. For spec readers: see `site-appearance`.
