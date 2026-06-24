# DESIGN.md

> Opportunity Atlas should feel like a quiet education SaaS tool: trustworthy, structured, and easy to scan.

## 1. Visual Theme & Atmosphere

**Style**: Clean education SaaS dashboard  
**Keywords**: trustworthy, structured, calm, editorial, data-aware, restrained, navigable  
**Tone**: professional and focused — NOT decorative, over-animated, or marketing-heavy  
**Feel**: a well-organized admissions research atlas with clear paths and reliable records.

**Interaction Tier**: L1 精致静态  
**Dependencies**: CSS only

## 2. Color Palette & Roles

```css
:root {
  --color-bg-page: 218 43% 97%;
  --color-bg-surface: 0 0% 100%;
  --color-bg-soft: 214 50% 98%;
  --color-bg-hover: 218 60% 96%;
  --color-border: 215 28% 88%;
  --color-border-hover: 221 83% 70%;
  --color-text-main: 222 47% 11%;
  --color-text-secondary: 215 20% 38%;
  --color-text-muted: 215 16% 58%;
  --color-primary: 221 83% 53%;
  --color-cyan: 188 86% 43%;
  --color-success: 160 84% 39%;
  --color-warning: 38 92% 50%;
  --color-danger: 0 84% 60%;
  --color-navy: 224 64% 14%;
  --color-bg-page-rgb: 242, 246, 252;
  --color-primary-rgb: 37, 99, 235;
}
```

**Color Rules:**
- All UI colors must reference CSS variables or Tailwind tokens derived from them.
- Use blue only for navigation, links, primary actions, and selected states.
- Admin surfaces may use navy for orientation, but content panels remain white.

## 3. Typography Rules

**Font Stack:**
```css
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Sans+SC:wght@400;500;600;700;800&display=swap");
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---:|---:|---:|---:|
| Hero H1 | Noto Sans SC / Inter | 56px | 800 | 1.05 | 0 |
| Page H1 | Noto Sans SC / Inter | 32px | 800 | 1.2 | 0 |
| Section H2 | Noto Sans SC / Inter | 24px | 700 | 1.3 | 0 |
| H3 | Noto Sans SC / Inter | 18px | 700 | 1.4 | 0 |
| Body | Noto Sans SC / Inter | 15px | 400 | 1.75 | 0.02em |
| Label | Noto Sans SC / Inter | 12px | 700 | 1.4 | 0.02em |
| Table | Noto Sans SC / Inter | 14px | 500 | 1.6 | 0 |

**Typography Rules:**
- Keep dashboard and card headings compact; reserve hero-scale type for the home brand.
- Chinese body text uses line-height >= 1.7 and includes a Chinese font before Inter.
- **NEVER use**: cursive novelty fonts, condensed display fonts, or negative letter spacing.

**Text Decoration:**
- Hero h1: no gradient and no shadow; brand clarity is the point.
- Section headings: plain ink color.
- Links: subtle underline on hover only.

## 4. Component Stylings

### Buttons
```css
.btn {
  border-radius: var(--radius-sm);
  min-height: 40px;
  padding: 0 16px;
  font-weight: 700;
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
  border-radius: var(--radius-md);
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
- Max width: 1180px
- Padding: 24px desktop, 16px mobile
- Admin content max width: none, with dense tables and panels

**Spacing Scale:**
- Section padding: 56px desktop, 32px mobile
- Component gap: 16px to 24px
- Card internal padding: 20px to 28px

**Grid:**
```css
.content-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 24px; }
.detail-grid { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; }
```

## 6. Depth & Elevation

| Level | Treatment | Use |
|---|---|---|
| Flat | no shadow, thin border | filters, form controls |
| Subtle | `0 8px 24px hsl(222 47% 11% / 0.06)` | list cards |
| Elevated | `0 18px 48px hsl(222 47% 11% / 0.1)` | hero, admin panels |

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
Use only `opacity` and `transform` entrance animation on first render.

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
- Use anonymous case identifiers everywhere.
- Make admin pages dense but legible.
- Prefer text links and compact buttons over oversized CTAs.
- Keep all role-gated admin access visible only to admin users.

### Don't
- Do not include smart matching, AI analysis, recommendation scores, or `/match`.
- Do not use nested cards inside cards.
- Do not use decorative gradient blobs or orbs.
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

