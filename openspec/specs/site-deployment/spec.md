# site-deployment Specification

## Purpose

Builds the DR 5/2019 concepts wiki as a static site and publishes it automatically to GitHub Pages under the repository's project path.

## Requirements

### Requirement: Static output
The build SHALL produce a fully static site that needs no server-side code. Every concept, index, graph and about page SHALL be a pre-rendered HTML file.

#### Scenario: Concept page is pre-rendered
- **WHEN** the site is built
- **THEN** the output contains an HTML file for each of the 101 concepts, holding its definition text

### Requirement: Project-path hosting
The site SHALL work when served from `https://<user>.github.io/<repo>/`. Every internal link, asset, search data file and figure SHALL resolve under that path.

#### Scenario: Internal links under the base path
- **WHEN** the built site is served under `/<repo>/`
- **THEN** no internal link or asset request returns 404

### Requirement: Link integrity check
The build pipeline SHALL check every internal link and asset reference in the built output. If any is broken, the pipeline SHALL fail and list them.

#### Scenario: Broken link blocks publishing
- **WHEN** a built page links to an address that does not exist in the output
- **THEN** the pipeline fails, names the page and the broken address, and publishes nothing

### Requirement: Automatic publishing from main
Every push to the `main` branch SHALL build, test and publish the site to GitHub Pages. If any step fails, the previously published site SHALL stay online.

#### Scenario: Successful push
- **WHEN** a commit that edits a concept's commentary is pushed to `main`
- **THEN** the updated commentary is live on GitHub Pages once the workflow finishes

#### Scenario: Failing build
- **WHEN** a pushed commit introduces an unresolved `[[...]]` reference
- **THEN** the workflow fails and the published site is unchanged

### Requirement: Local preview
A documented command SHALL run the site locally with live reload. A second documented command SHALL build and serve the production output under the same base path used on GitHub Pages.

#### Scenario: Previewing a production build
- **WHEN** the author runs the documented preview command
- **THEN** the site is served locally under `/<repo>/` and behaves as it will on GitHub Pages
