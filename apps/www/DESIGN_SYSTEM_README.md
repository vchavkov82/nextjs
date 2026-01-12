# Modern Design System

A clean, professional design system inspired by Supabase and LocalStack. Fully functional with gradients, smooth animations, and dark mode support.

## Quick Start

### File Locations
```
/apps/www/styles/
├── design-system.css       # Core styles (colors, buttons, cards, typography)
└── animations-modern.css   # Animations and transitions

/apps/www/components/
└── DesignSystemShowcase.tsx # Interactive component showcase
```

### CSS Variables

All styles use CSS custom properties that automatically adapt to light/dark mode:

```css
/* Colors */
--ds-primary: #3b82f6
--ds-secondary: #8b5cf6
--ds-accent: #06b6d4
--ds-accent-green: #10b981
--ds-danger: #ef4444

/* Dark backgrounds (auto in dark mode) */
--ds-bg: #ffffff (light) / #0f172a (dark)
--ds-text: #111827 (light) / #f1f5f9 (dark)

/* Spacing, Radius, Shadows, Transitions */
--ds-spacing-* (1-20)
--ds-radius-* (sm, md, lg, xl, 2xl, full)
--ds-shadow-* (xs, sm, md, lg, xl, 2xl)
--ds-transition-* (fast, normal, slow)
```

---

## Components

### Buttons

All buttons automatically respond to hover with gradient shifts and elevation changes.

#### Primary Button (Blue Gradient)
```html
<button class="btn btn-primary">Click Me</button>
<button class="btn btn-primary btn-lg">Large Button</button>
<button class="btn btn-primary btn-sm">Small Button</button>
<button class="btn btn-primary btn-block">Full Width</button>
<button class="btn btn-primary" disabled>Disabled</button>
```

#### Success Button (Green Gradient) ✓
```html
<button class="btn btn-success">Success Action</button>
<button class="btn btn-success btn-lg">Confirm</button>
```

#### Danger Button (Red Gradient)
```html
<button class="btn btn-danger">Delete</button>
<button class="btn btn-danger btn-lg">Remove</button>
```

#### Secondary Button (Outlined)
```html
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-secondary btn-lg">Learn More</button>
```

#### Ghost Button (Minimal)
```html
<button class="btn btn-ghost">Ghost</button>
```

#### Link Button
```html
<button class="btn btn-link">Link Text →</button>
```

**Button Features:**
- ✓ Gradient backgrounds with smooth hover animations
- ✓ Automatic elevation on hover with shadow increase
- ✓ Subtle upward translate on hover (`-1px`)
- ✓ Disabled state with reduced opacity
- ✓ Multiple sizes: default, sm (small), lg (large)
- ✓ Full width option with `btn-block`

---

### Cards

```html
<!-- Default Card -->
<div class="card">
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</div>

<!-- Elevated Card -->
<div class="card card-elevated">
  <h3>Featured Card</h3>
  <p>Stronger shadow for emphasis</p>
</div>

<!-- Interactive Card (with hover lift) -->
<div class="card hover-lift">
  <h3>Clickable Card</h3>
  <p>Lifts up on hover with shadow increase</p>
</div>
```

**Card Features:**
- ✓ Border with theme-aware color
- ✓ Subtle shadow that increases on hover
- ✓ Border color changes to primary blue on hover
- ✓ Optional `card-elevated` variant for stronger emphasis
- ✓ `hover-lift` class for interactive effect

---

### Badges

```html
<span class="badge">Default Badge</span>
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Success</span>
<span class="badge badge-warning">Warning</span>
<span class="badge badge-danger">Danger</span>
```

**Badge Features:**
- ✓ Pill-shaped with rounded corners
- ✓ Color-coded variants with subtle backgrounds
- ✓ Semantic colors for status indication
- ✓ Small, uppercase text for labeling

---

### Forms

```html
<!-- Text Input -->
<input
  type="text"
  placeholder="Enter text..."
  style="padding: var(--ds-spacing-2); border: 1px solid var(--ds-border);"
/>

<!-- Textarea -->
<textarea
  placeholder="Enter message..."
  style="padding: var(--ds-spacing-3); border: 1px solid var(--ds-border);"
></textarea>

<!-- Select -->
<select style="padding: var(--ds-spacing-2); border: 1px solid var(--ds-border);">
  <option>Choose an option</option>
</select>
```

**Form Features:**
- ✓ Blue focus state with glow shadow
- ✓ Smooth transitions on focus
- ✓ Muted placeholder text
- ✓ Full width responsive inputs

---

## Typography

### Headings

```html
<h1>Heading 1 - 48px, Bold</h1>      <!-- 700px weight -->
<h2>Heading 2 - 36px, Bold</h2>      <!-- 700px weight -->
<h3>Heading 3 - 30px, Semibold</h3>  <!-- 600px weight -->
<h4>Heading 4 - 24px, Semibold</h4>  <!-- 600px weight -->
<h5>Heading 5 - 18px, Semibold</h5>  <!-- 600px weight -->
<h6>Heading 6 - 16px, Semibold</h6>  <!-- 600px weight -->
```

### Body Text

```html
<p class="body">Regular paragraph text</p>
<p class="body-sm">Small paragraph text</p>
<p class="text-muted">Muted text (lighter color)</p>
<p class="text-secondary">Secondary text</p>
```

**Typography Features:**
- ✓ Automatic light/dark mode text colors
- ✓ Semantic class names (`.text-primary`, `.text-secondary`)
- ✓ Proper line heights for readability
- ✓ Responsive font sizes

---

## Colors

### Using Color Classes

```html
<!-- Text Colors -->
<p class="text-primary">Primary text (dark gray in light mode)</p>
<p class="text-secondary">Secondary text (medium gray)</p>
<p class="text-muted">Muted text (light gray)</p>

<!-- Background Colors -->
<div class="bg-primary">Primary background</div>
<div class="bg-secondary">Secondary background</div>
<div class="bg-tertiary">Tertiary background</div>

<!-- Border Colors -->
<div class="border-primary" style="border: 1px solid;">Primary border</div>
<div class="border-light" style="border: 1px solid;">Light border</div>
```

### Color Palette

| Color | Value | Usage |
|-------|-------|-------|
| Primary | #3b82f6 | CTA buttons, focus states |
| Secondary | #8b5cf6 | Accents, hover states |
| Accent (Cyan) | #06b6d4 | Highlights |
| Success (Green) | #10b981 | Positive actions ✓ |
| Warning (Amber) | #f59e0b | Alerts ⚠️ |
| Danger (Red) | #ef4444 | Destructive actions ✗ |

---

## Animations

### Entrance Animations

```html
<!-- Fade in -->
<div class="animate-fade">Fades in smoothly</div>

<!-- Fade in from below -->
<div class="animate-fade-in-up">Slides up while fading</div>

<!-- Fade in from above -->
<div class="animate-fade-in-down">Slides down while fading</div>

<!-- Slide from right -->
<div class="animate-slide-in-right">Slides from right</div>

<!-- Slide from left -->
<div class="animate-slide-in-left">Slides from left</div>

<!-- Scale in -->
<div class="animate-scale-in">Scales up smoothly</div>
```

### Continuous Animations

```html
<div class="animate-pulse">Pulsing effect</div>
<div class="animate-spin">Rotating spinner</div>
```

### Hover Effects

```html
<!-- Lift effect -->
<div class="hover-lift">Lifts up on hover (-4px)</div>

<!-- Scale effect -->
<div class="hover-scale">Scales to 1.05x on hover</div>

<!-- Glow effect -->
<div class="hover-glow">Purple glow on hover</div>
```

### Stagger Animation

```html
<div class="stagger-children">
  <div>Item 1 (0ms delay)</div>
  <div>Item 2 (75ms delay)</div>
  <div>Item 3 (150ms delay)</div>
  <div>Item 4 (225ms delay)</div>
</div>
```

---

## Spacing & Utilities

### Padding

```html
<div class="p-2">4px padding on all sides</div>
<div class="p-4">16px padding on all sides</div>
<div class="p-6">24px padding on all sides</div>
<div class="p-8">32px padding on all sides</div>

<div class="px-4">16px horizontal padding</div>
<div class="py-4">16px vertical padding</div>
```

### Margin

```html
<div class="mt-4">16px margin-top</div>
<div class="mb-4">16px margin-bottom</div>
<div class="mt-6 mb-6">24px top and bottom margin</div>
```

### Gap

```html
<div style="display: flex; gap: var(--ds-spacing-4);">
  Item 1
  Item 2
  Item 3
</div>
```

### Border Radius

```html
<div class="rounded-sm">6px border radius</div>
<div class="rounded-md">8px border radius</div>
<div class="rounded-lg">12px border radius</div>
<div class="rounded-full">Circle (9999px)</div>
```

### Shadows

```html
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
```

---

## Common Patterns

### Hero Section

```html
<section style="padding: 80px 24px; background: var(--ds-bg);">
  <div style="max-width: 800px; margin: 0 auto; text-align: center;">
    <h1 style="font-size: 48px; font-weight: 700; margin-bottom: 16px;">
      Main Headline
    </h1>
    <p style="font-size: 18px; color: var(--ds-text-secondary); margin-bottom: 32px;">
      Supporting subheading text
    </p>
    <div style="display: flex; gap: 12px; justify-content: center;">
      <button class="btn btn-primary btn-lg">Get Started</button>
      <button class="btn btn-secondary btn-lg">Learn More</button>
    </div>
  </div>
</section>
```

### Feature Cards

```html
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px;">
  <div class="card hover-lift">
    <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px;">Feature 1</h3>
    <p style="color: var(--ds-text-secondary); margin-bottom: 16px;">
      Description of feature
    </p>
    <button class="btn btn-primary btn-sm">Learn More</button>
  </div>

  <div class="card hover-lift">
    <h3 style="font-size: 20px; font-weight: 600; margin-bottom: 12px;">Feature 2</h3>
    <p style="color: var(--ds-text-secondary); margin-bottom: 16px;">
      Description of feature
    </p>
    <button class="btn btn-primary btn-sm">Learn More</button>
  </div>
</div>
```

### CTA Section

```html
<section class="card card-elevated" style="text-align: center; padding: 48px;">
  <h2 style="font-size: 36px; font-weight: 700; margin-bottom: 16px;">
    Ready to get started?
  </h2>
  <p style="font-size: 18px; color: var(--ds-text-secondary); margin-bottom: 32px;">
    Join thousands of developers using our platform
  </p>
  <button class="btn btn-primary btn-lg">Start Free Trial</button>
</section>
```

---

## Dark Mode

The design system automatically adapts to the user's system preference:

```css
/* Light mode (default) */
:root {
  --ds-bg: #ffffff;
  --ds-text: #111827;
}

/* Dark mode (auto-applied) */
@media (prefers-color-scheme: dark) {
  :root {
    --ds-bg: #0f172a;
    --ds-text: #f1f5f9;
  }
}
```

No additional configuration needed - just use the variables!

---

## Accessibility

### Reduced Motion

The design system respects user motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* All animations reduced to minimal duration */
}
```

Users with motion sensitivity will see instant interactions instead of animations.

### Color Contrast

All colors meet WCAG AA standards:
- ✓ 4.5:1 contrast ratio for text
- ✓ 3:1 contrast ratio for UI components
- ✓ Semantic color names for clarity

### Focus States

All interactive elements have clear focus indicators:
- ✓ Blue border on inputs
- ✓ Glow shadow on buttons
- ✓ High contrast on hover

---

## Browser Support

| Feature | Support |
|---------|---------|
| CSS Custom Properties | All modern browsers |
| Gradients | All modern browsers |
| Flexbox / Grid | All modern browsers |
| Transitions | All modern browsers |
| prefers-color-scheme | Chrome 76+, Firefox 67+, Safari 12.1+ |
| prefers-reduced-motion | Chrome 74+, Firefox 63+, Safari 10.1+ |

---

## Usage Examples

### React Component

```tsx
export function MyComponent() {
  return (
    <section style={{ padding: '40px', background: 'var(--ds-bg)' }}>
      <div className="card hover-lift">
        <h2 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>
          Feature Title
        </h2>
        <p style={{ color: 'var(--ds-text-secondary)', marginBottom: '16px' }}>
          Feature description goes here
        </p>
        <button className="btn btn-primary">Action</button>
      </div>
    </section>
  )
}
```

### Page Layout

```html
<div style="background: var(--ds-bg); color: var(--ds-text);">
  <!-- Header -->
  <header style="padding: '24px'; border-bottom: '1px solid'; borderColor: 'var(--ds-border)';">
    <h1>My App</h1>
  </header>

  <!-- Main Content -->
  <main style="max-width: '1200px'; margin: '0 auto'; padding: '40px 24px';">
    <div class="card">
      <h2>Welcome</h2>
      <button class="btn btn-primary">Get Started</button>
    </div>
  </main>

  <!-- Footer -->
  <footer style="padding: '40px'; borderTop: '1px solid'; borderTopColor: 'var(--ds-border)';">
    <p class="text-muted">© 2025 My App</p>
  </footer>
</div>
```

---

## Need Help?

See the `DesignSystemShowcase.tsx` component for an interactive demo of all features!

```tsx
import { DesignSystemShowcase } from '@/components/DesignSystemShowcase'

export default function Page() {
  return <DesignSystemShowcase />
}
```

---

**Version:** 1.0.0
**Last Updated:** January 12, 2025
**Status:** ✅ Production Ready
