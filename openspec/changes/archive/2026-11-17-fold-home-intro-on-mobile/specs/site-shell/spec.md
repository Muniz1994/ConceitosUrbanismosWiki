# Spec Delta

## ADDED Requirements

### Requirement: Home page introduction folded on narrow screens
Below 640 px wide, the home page introduction SHALL start folded behind an info icon next to the title, on every visit. Activating the icon SHALL show the introduction in place, and activating it again SHALL hide it. From 640 px up, the introduction SHALL always be shown. Folding SHALL work without scripts.

#### Scenario: Folded at phone width
- **WHEN** a reader opens the home page 360 px wide
- **THEN** the introduction is hidden, the info icon is visible next to the title, and the search field follows the title directly

#### Scenario: Opening and closing
- **GIVEN** the home page is shown 360 px wide
- **WHEN** the reader taps the info icon
- **THEN** the introduction appears under the title
- **AND WHEN** the reader taps the icon again
- **THEN** the introduction is hidden again

#### Scenario: Wide screens unchanged
- **WHEN** the home page is shown 1280 px wide
- **THEN** the introduction is shown under the title and there is no info icon

#### Scenario: Starts folded again
- **GIVEN** the reader opened the introduction on a phone
- **WHEN** they return to the home page later
- **THEN** the introduction is folded again

### Requirement: Accessible info control
The info icon SHALL be operable by keyboard, SHALL have an accessible name in European Portuguese, and SHALL expose whether the introduction is expanded or collapsed. Its touch target SHALL be at least 40 by 40 px. Assistive technology SHALL not read the introduction twice.

#### Scenario: Keyboard use
- **WHEN** a keyboard user focuses the info icon at phone width and presses Enter
- **THEN** the introduction opens and the control is announced as expanded

#### Scenario: Read once
- **WHEN** a screen reader reads the home page at any width
- **THEN** the introduction text is read at most once
