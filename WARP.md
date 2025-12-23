# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

- Static single-page marketing site for **AL JYNOM Technical Services EST.**
- Pure front-end stack: HTML5, CSS, and vanilla JavaScript only.
- No build tooling, package manager configuration, or automated tests are defined; the deployed output is the raw contents of `index.html`, `styles.css`, and `script.js`.

## High-level structure and responsibilities

### `index.html`

- Defines all user-facing content and sections:
  - Sticky header with logo and primary navigation.
  - Hero/"Home" section with primary CTAs ("Get a Free Quote" anchor and direct `tel:` link).
  - Informational sections: **About**, **Services**, **Why Us**, **Projects/Portfolio**, and **Contact**.
  - A quote request form in the Contact section and a simple footer.
- Key ids and classes are used as contracts with `styles.css` and `script.js`:
  - Section anchors: `#home`, `#about`, `#services`, `#why-us`, `#projects`, `#contact`.
  - Header/nav: `.site-header`, `.nav-toggle`, `.main-nav`.
  - Quote form: `#quote-form`, `.form-message`, and form field `name` attributes (`name`, `phone`, `email`, `service`, `details`).

### `styles.css`

- Centralizes design tokens with CSS custom properties in `:root` (colors, radius, shadows).
- Provides layout primitives used across the page:
  - `.container` for content width and horizontal padding.
  - `.section` for vertical rhythm between major sections.
- Implements section-specific styling that relies on the HTML structure:
  - `.site-header`, `.hero`, `.about`, `.services`, `.why-us`, `.projects`, `.contact`, `.site-footer`.
  - Card/grid components such as `.about-grid`, `.services-grid`, `.service-card`, `.why-grid`, `.gallery-grid`, `.gallery-item`, `.contact-layout`.
- Controls navigation behavior on small screens via media queries:
  - Below `768px`, `.main-nav` becomes an off-canvas dropdown that is shown/hidden with the `.open` class.
  - `.nav-toggle` is hidden on desktop and shown only under the mobile breakpoint; JS toggles `.main-nav.open` instead of manipulating inline styles.
- Defines responsive layout breakpoints that other changes should respect:
  - `@media (max-width: 768px)` – mobile nav and stacked layouts.
  - `@media (min-width: 640px)` – multi-column grids for about/services/gallery.
  - `@media (min-width: 900px)` – wider hero spacing, 3-column services, 4-column gallery, and side-by-side contact layout.

### `script.js`

Implements all page behavior in three main blocks:

1. **Smooth scrolling for internal links**
   - Selects `a[href^="#"]` and, on click, scrolls to the corresponding element `document.querySelector(targetId)` with `scrollIntoView({ behavior: 'smooth' })`.
   - Skips bare `#` links and anchors whose targets are missing, avoiding JavaScript errors.
2. **Mobile navigation toggle**
   - Looks up `.nav-toggle` and `.main-nav` and, if present, attaches a click handler that toggles the `.open` class on `.main-nav`.
   - This relies on CSS to animate/show the menu; if the nav markup is refactored, keep these class names or update both JS and CSS together.
3. **Quote form validation and messaging**
   - Targets the form with `id="quote-form"` and the status text element `.form-message`.
   - On submit, prevents default submission, inspects a fixed list of required fields: `['name', 'phone', 'email', 'service', 'details']` using `FormData`.
   - If any required field is empty, shows an error message and applies the `.error` class; otherwise shows a success message, applies `.success`, and resets the form.
   - There is **no backend integration**; the form is purely client-side feedback. Any future backend submission should be added here.

### Cross-file contracts to preserve

When editing markup, styles, or behavior, keep these relationships in mind:

- Navigation:
  - `.nav-toggle` (button) and `.main-nav` (menu container) are coupled across HTML, CSS, and JS.
  - The `.open` class on `.main-nav` is the single source of truth for the mobile menu open/closed state.
- Section anchors:
  - Navigation links use `href="#section-id"` to scroll to sections; the section `id` attributes in `index.html` must match for smooth scrolling to work.
- Contact form:
  - The form must retain `id="quote-form"` and have a sibling element with class `.form-message` for validation messages.
  - Input/select/textarea `name` attributes must match the `requiredFields` array in `script.js` for validation to behave as expected.

## Running and developing locally

Because this is a plain static site, there is no build step; browsers can load `index.html` directly.

### Quick preview (macOS)

- Open the site in the default browser:
  - `open index.html`

### Run a local HTTP server (recommended for consistent behavior)

From the project root (`/Users/nbh/Workspace/aljynom-website`):

- Start a simple static server on port 8000 using Python 3:
  - `python3 -m http.server 8000`
- Then open `http://localhost:8000/` in your browser.

## Linting, formatting, and tests

- There are **no repository-defined** linting, formatting, or test commands (no `package.json`, config files, or test harnesses are present).
- If you introduce tooling (e.g., ESLint, Stylelint, Prettier, or a test runner), also update this `WARP.md` with the canonical commands for running them.