# LocalStack Design System - Quick Reference

A one-page cheat sheet for using the LocalStack design system.

---

## Colors

### Purple (Brand)
```html
<div class="bg-ls-purple-primary">Primary</div>        <!-- #4d0dcf -->
<div class="bg-ls-purple-accent">Accent</div>          <!-- #6e3ae8 -->
<button class="bg-ls-purple-accent hover:bg-ls-purple-primary">Button</button>
```

### Grays
```html
<!-- Tailwind: bg-ls-gray-100 to bg-ls-gray-700 -->
<div class="bg-ls-gray-100">Lightest</div>
<div class="bg-ls-gray-700">Darkest</div>
```

### Semantic
```html
<span class="bg-green-100 text-ls-success">Success</span>
<span class="bg-yellow-100 text-ls-warning">Warning</span>
<span class="bg-red-100 text-ls-error">Error</span>
<span class="bg-cyan-100 text-ls-info">Info</span>
```

---

## Typography

### Headings
```html
<h1 class="ls-h1">Heading 1 - 48px</h1>
<h2 class="ls-h2">Heading 2 - 36px</h2>
<h3 class="ls-h3">Heading 3 - 30px</h3>
<h4 class="ls-h4">Heading 4 - 24px</h4>
<h5 class="ls-h5">Heading 5 - 20px</h5>
<h6 class="ls-h6">Heading 6 - 18px</h6>
```

### Body Text
```html
<p class="ls-body-lg">Large - 18px</p>
<p class="ls-body">Regular - 16px</p>
<p class="ls-body-sm">Small - 14px</p>
<span class="ls-caption">Caption - 12px uppercase</span>
<code class="ls-code">npm install</code>
```

### Font Families
```html
<div class="font-aeonik">Aeonik Regular</div>
<div class="font-aeonik font-bold">Aeonik Bold</div>
<code class="font-aeonik-mono">Monospace Code</code>
```

---

## Components

### Cards
```html
<!-- Basic -->
<div class="ls-card p-6">Content</div>

<!-- Elevated -->
<div class="ls-card ls-card--elevated">Important</div>

<!-- Interactive -->
<div class="ls-card ls-card--interactive">Click me</div>
```

### Buttons
```html
<button class="ls-button ls-button--primary">Primary</button>
<button class="ls-button ls-button--secondary">Secondary</button>
<button class="ls-button ls-button--ghost">Ghost</button>
<button class="ls-button ls-button--primary" disabled>Disabled</button>
```

### Badges
```html
<span class="ls-badge">Default</span>
<span class="ls-badge ls-badge--success">Success</span>
<span class="ls-badge ls-badge--warning">Warning</span>
<span class="ls-badge ls-badge--error">Error</span>
```

### Inputs
```html
<input class="ls-input" type="text" placeholder="Text..." />
<textarea class="ls-input" placeholder="Message..."></textarea>
```

### Dividers
```html
<div class="ls-divider"></div>                    <!-- Horizontal -->
<div class="ls-divider ls-divider--vertical"></div> <!-- Vertical -->
```

---

## Animations

### Entrance (600ms)
```html
<div class="ls-animate-fade">Fade in</div>
<div class="ls-animate-fade-in-up">Slide + fade from bottom</div>
<div class="ls-animate-fade-in-down">Slide + fade from top</div>
<div class="ls-animate-slide-in-right">Slide from right</div>
<div class="ls-animate-slide-in-left">Slide from left</div>
<div class="ls-animate-scale-in">Scale up</div>
```

### Continuous
```html
<div class="ls-animate-pulse">Breathing</div>
<div class="ls-animate-glow">Purple glow</div>
<div class="ls-animate-float">Floating motion</div>
<div class="ls-animate-spin">Rotating</div>
<div class="ls-animate-shimmer">Loading shimmer</div>
```

### Hover Effects
```html
<div class="ls-hover-lift">Lift on hover</div>
<div class="ls-hover-glow">Glow on hover</div>
<div class="ls-hover-scale">Scale on hover</div>
<div class="ls-hover-rotate">Rotate on hover</div>
```

### Stagger (100ms delays)
```html
<div class="ls-animate-stagger">
  <div>Item 1 (0ms)</div>
  <div>Item 2 (100ms)</div>
  <div>Item 3 (200ms)</div>
</div>
```

---

## Spacing (CSS Variables)

```html
<!-- Use in CSS -->
<div style="padding: var(--ls-space-md); gap: var(--ls-space-lg);">
  Content
</div>

<!-- Or with Tailwind -->
<div class="p-6 gap-6">Content</div>
```

### Scale
- `--ls-space-xs`: 4px
- `--ls-space-sm`: 8px
- `--ls-space-md`: 16px
- `--ls-space-lg`: 24px
- `--ls-space-xl`: 32px
- `--ls-space-2xl`: 48px
- `--ls-space-3xl`: 64px

---

## Border Radius

```html
<div class="ls-rounded-xs">4px</div>      <!-- xs -->
<div class="ls-rounded-sm">6px</div>      <!-- sm -->
<div class="ls-rounded-md">8px</div>      <!-- md -->
<div class="ls-rounded-lg">12px</div>     <!-- lg (default for cards) -->
<div class="ls-rounded-xl">16px</div>     <!-- xl -->
<div class="ls-rounded-full">9999px</div> <!-- full (circle) -->
```

---

## Shadows

```html
<div class="ls-shadow-sm">Small</div>
<div class="ls-shadow-md">Medium</div>
<div class="ls-shadow-lg">Large</div>
<div class="ls-shadow-xl">Extra large</div>
```

---

## Text Colors

```html
<p class="ls-text-primary">Primary text</p>
<p class="ls-text-secondary">Secondary text</p>
<p class="ls-text-tertiary">Tertiary text</p>
```

---

## Gradients

```html
<!-- Gradient background -->
<div class="ls-gradient-primary p-8">
  Purple gradient background
</div>

<!-- Gradient text -->
<h2 class="ls-gradient-text text-4xl font-bold">
  Gradient text effect
</h2>
```

---

## Common Patterns

### Hero Section
```html
<section class="py-20 bg-ls-bg-primary">
  <div class="max-w-4xl mx-auto px-6">
    <h1 class="ls-h1 mb-6">Headline</h1>
    <p class="ls-body-lg text-ls-text-secondary mb-8">Subheading</p>
    <div class="flex gap-4">
      <button class="ls-button ls-button--primary">Primary</button>
      <button class="ls-button ls-button--secondary">Secondary</button>
    </div>
  </div>
</section>
```

### Card Grid
```html
<div class="grid md:grid-cols-3 gap-6">
  {items.map(item => (
    <div key={item.id} class="ls-card ls-hover-lift ls-animate-fade-in-up">
      <h3 class="ls-h3 mb-3">{item.title}</h3>
      <p class="ls-body text-ls-text-secondary">{item.desc}</p>
    </div>
  ))}
</div>
```

### Feature Section
```html
<section class="py-16">
  <div class="ls-card ls-card--elevated p-12">
    <h2 class="ls-h2 mb-6">Feature Title</h2>
    <div class="ls-animate-stagger space-y-4">
      <p class="ls-body">Benefit 1</p>
      <p class="ls-body">Benefit 2</p>
      <p class="ls-body">Benefit 3</p>
    </div>
  </div>
</section>
```

### Form
```html
<form class="space-y-4">
  <div>
    <label class="ls-caption block mb-2">Email</label>
    <input class="ls-input" type="email" />
  </div>
  <div>
    <label class="ls-caption block mb-2">Message</label>
    <textarea class="ls-input" rows={4}></textarea>
  </div>
  <button class="ls-button ls-button--primary">Submit</button>
</form>
```

---

## CSS Variables (All Available)

### Colors
```css
--ls-purple-primary: #4d0dcf;
--ls-purple-accent: #6e3ae8;
--ls-purple-accent-low: #241b47;
--ls-purple-accent-high: #c6c1fa;
--ls-gray-100 through --ls-gray-700
--ls-success: #3ecf8e;
--ls-warning: #f4af41;
--ls-error: #ff6b6b;
--ls-info: #00d4ff;
--ls-text-primary / secondary / tertiary
--ls-bg-primary / secondary / tertiary
--ls-border-primary / secondary / accent
```

### Typography
```css
--ls-text-xs through --ls-text-5xl
--ls-font-light: 300;
--ls-font-normal: 400;
--ls-font-medium: 500;
--ls-font-semibold: 600;
--ls-font-bold: 700;
--ls-leading-tight: 1.2;
--ls-leading-normal: 1.5;
--ls-leading-relaxed: 1.75;
```

### Spacing
```css
--ls-space-xs: 0.25rem;   /* 4px */
--ls-space-sm: 0.5rem;    /* 8px */
--ls-space-md: 1rem;      /* 16px */
--ls-space-lg: 1.5rem;    /* 24px */
--ls-space-xl: 2rem;      /* 32px */
--ls-space-2xl: 3rem;     /* 48px */
--ls-space-3xl: 4rem;     /* 64px */
```

### Other
```css
--ls-radius-xs through --ls-radius-full
--ls-shadow-xs through --ls-shadow-xl
--ls-transition-fast / normal / slow
```

---

## Tips & Tricks

### 💡 Combine Classes
```html
<!-- Stack multiple utility classes -->
<div class="ls-card p-6 ls-animate-fade-in-up ls-hover-lift">
  Content
</div>
```

### 💡 Mix Tailwind
```html
<!-- Use Tailwind with LocalStack -->
<div class="ls-card md:grid-cols-2 gap-8 py-12">
  Content
</div>
```

### 💡 CSS Variables in JS
```tsx
const spacing = 'var(--ls-space-lg)'; // 24px
const color = 'var(--ls-purple-primary)'; // #4d0dcf
```

### 💡 Dark Mode
```html
<!-- Automatically responds to system preference -->
<div class="bg-ls-bg-primary text-ls-text-primary">
  Adapts to dark mode automatically
</div>
```

### 💡 Animations on Scroll
```tsx
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) el.target.classList.add('ls-in-view');
  });
});
document.querySelectorAll('.ls-fade-in-on-scroll').forEach(el => {
  observer.observe(el);
});
```

---

## File Reference

- **Guide**: `LOCALSTACK_DESIGN_GUIDE.md` (comprehensive)
- **Demo**: `components/LocalStackExamples.tsx` (interactive)
- **Colors**: `styles/localstack-theme.css` (variables)
- **Animations**: `styles/localstack-animations.css` (keyframes)
- **Fonts**: `styles/localstack-fonts.css` (declarations)

---

## Common Questions

**Q: How do I change the brand color?**
A: Update `--ls-purple-primary` in `localstack-theme.css` `:root`

**Q: Can I use with existing Tailwind classes?**
A: Yes! Mix LocalStack and Tailwind freely.

**Q: Do animations work on mobile?**
A: Yes, but respect `prefers-reduced-motion` on accessibility-focused devices.

**Q: How do I add dark mode?**
A: It's already built-in! Uses system `prefers-color-scheme`.

**Q: What about IE 11 support?**
A: CSS variables not supported. Use Tailwind classes as fallback.

---

**Last Updated**: January 12, 2025
**Design System Version**: 1.0.0
