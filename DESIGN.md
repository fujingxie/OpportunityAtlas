# DESIGN.md

> Opportunity Atlas follows the supplied high-fidelity HTML design language while keeping the MVP scope narrow: activity library, case library, admin-only data management, and no smart matching.

## 1. Visual Theme & Atmosphere

**Style**: High-fidelity education SaaS workspace  
**Keywords**: bright, structured, atlas-like, data-aware, credible, rounded, layered  
**Tone**: professional and polished, with the visual density of `activity_case_hifi_design.html`  
**Feel**: a 1440px desktop-first planning board with white surfaces, blue navigation, large rounded panels, deep navy hero blocks, and clear activity/case relationship paths.

**Interaction Tier**: L1 精致静态  
**Dependencies**: CSS only

## 2. Color Palette & Roles

```css
:root {
  --color-bg-page: 218 55% 96%;
  --color-bg-surface: 0 0% 100%;
  --color-bg-soft: 216 72% 98%;
  --color-bg-hover: 218 86% 96%;
  --color-border: 215 28% 88%;
  --color-border-hover: 221 83% 70%;
  --color-text-main: 222 47% 11%;
  --color-text-secondary: 215 20% 38%;
  --color-text-muted: 215 16% 58%;
  --color-primary: 230 100% 59%;
  --color-cyan: 186 81% 43%;
  --color-success: 160 84% 39%;
  --color-warning: 38 92% 50%;
  --color-danger: 0 84% 60%;
  --color-navy: 224 64% 14%;
  --color-violet: 262 83% 58%;
  --color-bg-page-rgb: 238, 243, 251;
  --color-primary-rgb: 47, 91, 255;
}
```

**Color Rules:**
- All UI colors must reference CSS variables or Tailwind tokens derived from them.
- Use blue for navigation, links, primary actions, selected states, and relation indicators.
- Use cyan only as part of the primary gradient or small data accents.
- Admin surfaces may use navy for orientation, but content panels remain white.

## 3. Typography Rules

**Font Stack:**
```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap");
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---:|---:|---:|---:|
| Hero H1 | Noto Sans SC / Inter | 56-64px | 900 | 1.05 | 0 |
| Page H1 | Noto Sans SC / Inter | 32-36px | 900 | 1.16 | 0 |
| Section H2 | Noto Sans SC / Inter | 24px | 700 | 1.3 | 0 |
| H3 | Noto Sans SC / Inter | 18px | 700 | 1.4 | 0 |
| Body | Noto Sans SC / Inter | 15px | 400 | 1.75 | 0.02em |
| Label | Noto Sans SC / Inter | 12px | 700 | 1.4 | 0.02em |
| Table | Noto Sans SC / Inter | 14px | 500 | 1.6 | 0 |

**Typography Rules:**
- Keep dashboard and card headings compact; reserve hero-scale type for the home brand and dark detail heroes.
- Chinese body text uses line-height >= 1.7 and includes a Chinese font before Inter.
- **NEVER use**: cursive novelty fonts, condensed display fonts, or negative letter spacing.

**Text Decoration:**
- Home hero can use the supplied blue/cyan/violet title gradient for the second line only.
- Section headings: plain ink color.
- Links: subtle underline on hover only.

## 4. Component Stylings

### Buttons
```css
.btn {
  border-radius: var(--radius-sm);
  min-height: 48px;
  padding: 0 20px;
  font-weight: 800;
  transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn:focus-visible { outline: 3px solid hsl(var(--color-primary) / 0.2); outline-offset: 2px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
```

### Cards
```css
.card {
  background: hsl(var(--color-bg-surface));
  border: 1px solid hsl(var(--color-border));
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}
.card:hover { border-color: hsl(var(--color-border-hover) / 0.55); }
.card:focus-within { outline: 3px solid hsl(var(--color-primary) / 0.14); }
```

### Navigation
```css
.nav-link {
  min-height: 44px;
  border-radius: var(--radius-sm);
  color: hsl(var(--color-text-secondary));
}
.nav-link:hover,
.nav-link:focus-visible {
  background: hsl(var(--color-bg-hover));
  color: hsl(var(--color-primary));
}
.nav-link[data-active="true"] {
  color: hsl(var(--color-primary));
  background: hsl(var(--color-primary) / 0.08);
}
```

### Links
```css
.text-link { color: hsl(var(--color-primary)); text-underline-offset: 4px; }
.text-link:hover { text-decoration: underline; }
.text-link:focus-visible { outline: 3px solid hsl(var(--color-primary) / 0.2); outline-offset: 3px; }
```

### Tags / Badges
```css
.badge {
  border-radius: 999px;
  border: 1px solid hsl(var(--color-border));
  background: hsl(var(--color-bg-soft));
  color: hsl(var(--color-text-secondary));
  font-size: 12px;
  font-weight: 700;
}
```

### Form Controls
```css
.field {
  border-radius: var(--radius-sm);
  border: 1px solid hsl(var(--color-border));
  background: hsl(var(--color-bg-surface));
  min-height: 44px;
}
.field:hover { border-color: hsl(var(--color-border-hover)); }
.field:focus { outline: 3px solid hsl(var(--color-primary) / 0.16); border-color: hsl(var(--color-primary)); }
```

## 5. Layout Principles

**Container:**
- Max width: 1440px
- Padding: 32px desktop, 16px mobile
- Public list pages use a large white rounded board with left filters and a soft-blue content area.
- Admin uses a dark navy sidebar with dense white data panels.

**Spacing Scale:**
- Section padding: 64px desktop, 32px mobile
- Component gap: 16px to 24px
- Card internal padding: 20px to 28px

**Grid:**
```css
.content-grid { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: 26px; }
.detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 26px; }
```

## 6. Depth & Elevation

| Level | Treatment | Use |
|---|---|---|
| Flat | no shadow, thin border | filters, form controls |
| Subtle | `0 14px 42px hsl(224 65% 10% / 0.08)` | list cards |
| Elevated | `0 28px 80px hsl(224 65% 10% / 0.13)` | hero, admin panels |

## 7. Animation & Interaction

**Motion Philosophy**: small movements should clarify state, never decorate the workflow.  
**Tier**: L1

### Dependencies
```html
<!-- CSS only -->
```

### Base Setup
```js
// No JavaScript animation library.
```

### Entrance Animation
```css
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-enter { animation: fade-in-up 420ms ease both; }
```

### Scroll Behavior
```js
// Native browser scrolling only.
```

### Hover & Focus States
```css
a, button, input, select { transition: border-color 160ms ease, background 160ms ease, color 160ms ease, transform 160ms ease; }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible {
  outline: 3px solid hsl(var(--color-primary) / 0.2);
  outline-offset: 2px;
}
```

### Special Effects
Use only `opacity` and `transform` entrance animation on first render. Avoid decorative moving backgrounds.

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 8. Do's and Don'ts

### Do
- Keep public pages scannable with clear filters and concise record cards.
- Match the high-fidelity structure: centered topbar, selected underline, white boards, left filter column, right related-content panel.
- Use "related cases", "participated activities", and "linked activities" language for relationships.
- Use anonymous case identifiers everywhere.
- Make admin pages dense but legible.
- Prefer text links and compact buttons over oversized CTAs.
- Keep all role-gated admin access visible only to admin users.

### Don't
- Do not include smart matching, AI analysis, recommendation scores, or `/match`.
- Do not use nested cards inside cards.
- Do not use decorative gradient blobs or orbs.
- Do not copy the old high-fidelity content labels for smart matching, matching score, or AI recommendations.
- Do not use the existing watermarked `logo.png` directly in production UI.
- Do not expose real student names, contact information, or precise schools.
- Do not make the home page a marketing landing page.
- Do not introduce hardcoded color literals in components.
- Do not add backend persistence in the frontend MVP.

## 9. Responsive Behavior

**Breakpoints:**
| Name | Width | Key Changes |
|---|---:|---|
| Desktop | > 1024px | two-column lists/details, horizontal nav |
| Tablet | 768-1024px | filters stack above results |
| Mobile | < 768px | nav wraps, cards single column, admin tables scroll horizontally |

**Touch Targets:** minimum 44px  
**Collapsing Strategy:** public filters become stacked panels; admin keeps horizontal overflow for tables.

```css
@media (max-width: 768px) {
  .content-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
```
