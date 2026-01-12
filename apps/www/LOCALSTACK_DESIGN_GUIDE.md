# LocalStack Design System Guide

A comprehensive design system for your Next.js application, inspired by LocalStack's modern, purple-toned aesthetic with clean typography and smooth animations.

## Overview

This design system provides:
- **Color Palette**: LocalStack's signature purples, grays, and semantic colors
- **Typography**: Aeonik font family with structured size scale
- **Components**: Pre-styled card, button, input, badge, and divider components
- **Animations**: Smooth fade, slide, scale, and pulse animations
- **Design Tokens**: CSS variables for spacing, radius, shadows, and transitions

---

## Installation & Setup

### 1. **Fonts Setup**

The system uses the **Aeonik** font family from a CDN. Two options:

#### Option A: CDN (Default)
Fonts are loaded from `jsdelivr.net` in `/apps/www/styles/localstack-fonts.css`. No additional setup needed.

#### Option B: Self-Hosted
1. Download fonts from [Aeonik GitHub](https://github.com/philzook/aeonik)
2. Place in `/apps/www/public/fonts/`
3. Uncomment the self-hosted section in `localstack-fonts.css`

### 2. **CSS Files**

The following files are already imported in `/apps/www/styles/index.css`:
- `localstack-fonts.css` - Font declarations
- `localstack-theme.css` - Color variables, components, utilities
- `localstack-animations.css` - Animation keyframes and utilities

### 3. **Tailwind Config**

Extended in `/apps/www/tailwind.config.js` with:
- Aeonik font family
- LocalStack color palette
- CSS custom properties support

---

## Color System

### Primary Colors

```css
/* Purple (Brand) */
--ls-purple-primary: #4d0dcf;      /* Main brand color */
--ls-purple-accent: #6e3ae8;       /* Hover/accent state */
--ls-purple-accent-low: #241b47;   /* Light purple background */
--ls-purple-accent-high: #c6c1fa;  /* Bright purple text */
```

### Gray Scale

```css
--ls-gray-100: #eceef2;   /* Lightest */
--ls-gray-200: #c0c2c7;
--ls-gray-300: #888b96;
--ls-gray-400: #545861;
--ls-gray-500: #353841;
--ls-gray-600: #24272f;
--ls-gray-700: #17181c;   /* Darkest */
```

### Semantic Colors

```css
--ls-success: #3ecf8e;    /* Green */
--ls-warning: #f4af41;    /* Orange */
--ls-error: #ff6b6b;      /* Red */
--ls-info: #00d4ff;       /* Cyan */
```

### Using Colors

#### CSS Custom Properties:
```css
.my-element {
  color: var(--ls-text-primary);
  background-color: var(--ls-bg-primary);
  border-color: var(--ls-border-accent);
}
```

#### Tailwind Classes:
```html
<!-- Using extended color names -->
<div class="bg-ls-purple-primary text-ls-gray-100">
  Purple background with light gray text
</div>

<button class="bg-ls-purple-accent hover:bg-ls-purple-primary">
  Primary Button
</button>
```

---

## Typography

### Heading Classes

```html
<!-- Aeonik font, bold, tight line height -->
<h1 class="ls-h1">Heading 1 - 48px</h1>  <!-- 48px, weight 700 -->
<h2 class="ls-h2">Heading 2 - 36px</h2>  <!-- 36px, weight 700 -->
<h3 class="ls-h3">Heading 3 - 30px</h3>  <!-- 30px, weight 600 -->
<h4 class="ls-h4">Heading 4 - 24px</h4>  <!-- 24px, weight 600 -->
<h5 class="ls-h5">Heading 5 - 20px</h5>  <!-- 20px, weight 600 -->
<h6 class="ls-h6">Heading 6 - 18px</h6>  <!-- 18px, weight 600 -->
```

### Body Text Classes

```html
<!-- Large body text (18px) -->
<p class="ls-body-lg">
  Large paragraph with relaxed line height for long-form content.
</p>

<!-- Default body text (16px) -->
<p class="ls-body">
  Standard paragraph with normal line height.
</p>

<!-- Small body text (14px) -->
<p class="ls-body-sm">
  Small paragraph for secondary information.
</p>

<!-- Captions (12px uppercase) -->
<span class="ls-caption">Label or Caption Text</span>

<!-- Code/Monospace -->
<code class="ls-code">npm install localstack</code>
```

### Font Family Usage

```html
<!-- Using Aeonik font family in Tailwind -->
<div class="font-aeonik">Aeonik regular text</div>

<!-- Using Aeonik Mono for code -->
<code class="font-aeonik-mono">monospace code</code>
```

---

## Components

### Card Component

```html
<!-- Basic card -->
<div class="ls-card">
  <h3 class="ls-h3">Card Title</h3>
  <p class="ls-body">Card content goes here</p>
</div>

<!-- Elevated card (more shadow) -->
<div class="ls-card ls-card--elevated">
  <h3 class="ls-h3">Elevated Card</h3>
</div>

<!-- Interactive card (hover lift effect) -->
<div class="ls-card ls-card--interactive">
  <h3 class="ls-h3">Click Me</h3>
</div>
```

**Styles Applied:**
- 12px border radius
- 1px border in primary color
- Soft shadow on default, medium shadow on hover
- Purple accent border on hover
- Lift effect on hover (translateY)

### Button Component

```html
<!-- Primary button -->
<button class="ls-button ls-button--primary">
  Primary Action
</button>

<!-- Secondary button -->
<button class="ls-button ls-button--secondary">
  Secondary Action
</button>

<!-- Ghost button -->
<button class="ls-button ls-button--ghost">
  Ghost Action
</button>

<!-- Disabled state -->
<button class="ls-button ls-button--primary" disabled>
  Disabled Button
</button>
```

**Features:**
- Aeonik font at 14px
- Smooth transitions
- Glow effect on primary hover
- Disabled opacity at 50%

### Input Component

```html
<input
  type="text"
  class="ls-input"
  placeholder="Enter text..."
/>

<textarea class="ls-input" placeholder="Multi-line..."></textarea>
```

**Features:**
- 6px border radius
- Focus: purple accent border + glow shadow
- Full width
- 12px placeholder color

### Badge Component

```html
<!-- Default badge -->
<span class="ls-badge">Default Badge</span>

<!-- Success -->
<span class="ls-badge ls-badge--success">Success</span>

<!-- Warning -->
<span class="ls-badge ls-badge--warning">Warning</span>

<!-- Error -->
<span class="ls-badge ls-badge--error">Error</span>
```

### Divider Component

```html
<!-- Horizontal divider -->
<div class="ls-divider"></div>

<!-- Vertical divider -->
<div class="ls-divider ls-divider--vertical" style="height: 100px;"></div>
```

---

## Animations

### Animation Utilities

```html
<!-- Fade in -->
<div class="ls-animate-fade">Fades in over 600ms</div>

<!-- Fade in from below -->
<div class="ls-animate-fade-in-up">Slides up while fading</div>

<!-- Fade in from above -->
<div class="ls-animate-fade-in-down">Slides down while fading</div>

<!-- Slide from right -->
<div class="ls-animate-slide-in-right">Slides from right</div>

<!-- Slide from left -->
<div class="ls-animate-slide-in-left">Slides from left</div>

<!-- Scale in -->
<div class="ls-animate-scale-in">Scales up smoothly</div>

<!-- Pulse (breathing) -->
<div class="ls-animate-pulse">Pulses continuously</div>

<!-- Glow effect -->
<div class="ls-animate-glow">Purple glow animation</div>

<!-- Shimmer loading effect -->
<div class="ls-animate-shimmer">Loading shimmer</div>

<!-- Float (up/down movement) -->
<div class="ls-animate-float">Floats smoothly</div>
```

### Hover Effects

```html
<!-- Lift on hover -->
<div class="ls-hover-lift">Lifts up on hover with shadow</div>

<!-- Glow on hover -->
<div class="ls-hover-glow">Glows purple on hover</div>

<!-- Scale on hover -->
<div class="ls-hover-scale">Scales 1.05x on hover</div>

<!-- Rotate on hover -->
<div class="ls-hover-rotate">Rotates 2deg on hover</div>
```

### Stagger Animation

```html
<!-- Each child fades in with 100ms delay -->
<div class="ls-animate-stagger">
  <div>First (0ms delay)</div>
  <div>Second (100ms delay)</div>
  <div>Third (200ms delay)</div>
  <div>Fourth (300ms delay)</div>
</div>
```

### Scroll-Triggered Animations

```html
<!-- Fade in when scrolled to -->
<div class="ls-fade-in-on-scroll">Content fades in on scroll</div>

<!-- Slide in when scrolled to -->
<div class="ls-slide-in-on-scroll">Content slides up on scroll</div>

<!-- Custom reveal animation -->
<div class="ls-reveal">Custom reveal effect</div>
```

**Note:** For scroll animations, you'll need JavaScript to add the `.ls-in-view` class:

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('ls-in-view');
    }
  });
});

document.querySelectorAll('.ls-fade-in-on-scroll, .ls-slide-in-on-scroll').forEach(el => {
  observer.observe(el);
});
```

---

## Design Tokens Reference

### Spacing Scale

```css
--ls-space-xs:    0.25rem;   /* 4px */
--ls-space-sm:    0.5rem;    /* 8px */
--ls-space-md:    1rem;      /* 16px */
--ls-space-lg:    1.5rem;    /* 24px */
--ls-space-xl:    2rem;      /* 32px */
--ls-space-2xl:   3rem;      /* 48px */
--ls-space-3xl:   4rem;      /* 64px */
```

### Border Radius

```css
--ls-radius-xs:    4px;
--ls-radius-sm:    6px;
--ls-radius-md:    8px;
--ls-radius-lg:    12px;      /* Cards, modals */
--ls-radius-xl:    16px;
--ls-radius-full:  9999px;    /* Pills, circles */
```

### Shadows

```css
--ls-shadow-xs:  0 1px 2px 0 rgba(0, 0, 0, 0.05);
--ls-shadow-sm:  0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
--ls-shadow-md:  0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--ls-shadow-lg:  0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--ls-shadow-xl:  0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
```

### Transitions

```css
--ls-transition-fast:    150ms cubic-bezier(0.4, 0, 0.2, 1);
--ls-transition-normal:  250ms cubic-bezier(0.4, 0, 0.2, 1);
--ls-transition-slow:    350ms cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Utility Classes

### Text Color

```html
<p class="ls-text-primary">Primary text (dark/black)</p>
<p class="ls-text-secondary">Secondary text (medium gray)</p>
<p class="ls-text-tertiary">Tertiary text (light gray)</p>
```

### Background

```html
<div class="ls-bg-surface">Secondary background color</div>
```

### Border

```html
<div class="border-2 ls-border-primary">Primary border</div>
<div class="border-2 ls-border-accent">Accent border (purple)</div>
```

### Rounded

```html
<div class="ls-rounded-xs">4px radius</div>
<div class="ls-rounded-sm">6px radius</div>
<div class="ls-rounded-md">8px radius</div>
<div class="ls-rounded-lg">12px radius</div>
<div class="ls-rounded-xl">16px radius</div>
<div class="ls-rounded-full">Full radius (circle)</div>
```

### Shadows

```html
<div class="ls-shadow-sm">Small shadow</div>
<div class="ls-shadow-md">Medium shadow</div>
<div class="ls-shadow-lg">Large shadow</div>
<div class="ls-shadow-xl">Extra large shadow</div>
```

### Gradients

```html
<!-- Gradient background (purple primary to accent) -->
<div class="ls-gradient-primary p-8 rounded">
  Purple gradient background
</div>

<!-- Gradient text -->
<h2 class="ls-gradient-text text-4xl">
  Gradient Text Effect
</h2>
```

---

## Dark Mode

The design system automatically adapts colors for dark mode using `prefers-color-scheme: dark`.

Light mode colors:
- Background: white
- Text: black/dark gray

Dark mode colors:
- Background: #1a1a1a
- Text: white/light gray

No additional configuration needed - just use `@media (prefers-color-scheme: dark)` in custom CSS.

---

## Best Practices

### 1. **Use Design Tokens**
Always use CSS variables instead of hardcoded colors:
```css
/* ❌ Avoid hardcoded colors */
color: #4d0dcf;

/* ✅ Use tokens */
color: var(--ls-purple-primary);
```

### 2. **Maintain Font Hierarchy**
Use heading classes in order:
```html
<!-- ✅ Correct hierarchy -->
<h1 class="ls-h1">Main Title</h1>
<h2 class="ls-h2">Section Title</h2>
<h3 class="ls-h3">Subsection</h3>

<!-- ❌ Avoid skipping levels -->
<h1 class="ls-h1">Main Title</h1>
<h3 class="ls-h3">Should be h2</h3>
```

### 3. **Combine Classes**
Mix LocalStack classes with Tailwind utilities:
```html
<div class="ls-card p-6 lg:p-8 flex flex-col gap-4">
  <h2 class="ls-h2">Title</h2>
  <p class="ls-body-lg">Content</p>
</div>
```

### 4. **Respect Motion Preferences**
Animations automatically respect `prefers-reduced-motion`:
```css
/* Animations reduce to 1ms when user prefers reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
  }
}
```

### 5. **Component-First Approach**
Create reusable components:
```tsx
// Example React component
export function Card({ children, elevated = false }) {
  return (
    <div className={`ls-card ${elevated ? 'ls-card--elevated' : ''}`}>
      {children}
    </div>
  );
}

// Usage
<Card elevated>
  <h3 className="ls-h3">Title</h3>
  <p className="ls-body">Content</p>
</Card>
```

---

## File Structure

```
/apps/www/
├── styles/
│   ├── index.css                    # Main entry point
│   ├── localstack-fonts.css         # Font declarations
│   ├── localstack-theme.css         # Colors, components, tokens
│   ├── localstack-animations.css    # Animations & effects
│   ├── realtime.module.css
│   ├── career.module.css
│   └── ...
├── tailwind.config.js               # Extended with LS colors & fonts
└── LOCALSTACK_DESIGN_GUIDE.md       # This file
```

---

## Browser Support

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ CSS Custom Properties support (IE 11 limited)
- ✅ CSS Grid & Flexbox
- ✅ CSS Animations
- ✅ `prefers-color-scheme` (dark mode)
- ✅ `prefers-reduced-motion` (accessibility)

---

## Performance Tips

1. **Use CSS Custom Properties** - Zero runtime overhead
2. **Leverage Tailwind** - Purges unused classes in production
3. **Animations** - GPU-accelerated with `transform` and `opacity`
4. **Font Loading** - `font-display: swap` for no layout shift
5. **Media Queries** - Mobile-first, progressive enhancement

---

## Troubleshooting

### Fonts Not Loading
- Check browser DevTools → Network tab
- Ensure `localstack-fonts.css` is imported first
- Verify CDN URL is correct or fonts exist in `/public/fonts/`

### Colors Not Applying
- Ensure `localstack-theme.css` is imported
- Check specificity - LocalStack utility classes may need `!important`
- Verify dark mode preference in browser settings

### Animations Not Playing
- Check `prefers-reduced-motion` setting
- Ensure element has proper dimensions for animation
- Verify CSS file is loaded without errors

---

## Contributing

To extend the design system:

1. **Add new colors** in `localstack-theme.css` `:root`
2. **Add new components** with `ls-` prefix
3. **Add new animations** in `localstack-animations.css`
4. **Update Tailwind config** if adding new tokens
5. **Update this guide** with usage examples

---

## License

Same as the main project.

---

**Last Updated:** January 2025
**Version:** 1.0.0
