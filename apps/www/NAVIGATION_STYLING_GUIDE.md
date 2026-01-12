# Navigation & Dropdown Menu Styling Guide

## Overview

The navigation and dropdown menus have been completely redesigned to match the modern design system. All old color tokens are automatically mapped to the new design system variables.

---

## What Was Fixed

### ✅ **Color Integration**
- Old tokens (`text-foreground`, `bg-surface-75`, etc.) now map to modern design system
- Automatic dark mode adaptation
- Consistent color hierarchy across all menus

### ✅ **Dropdown Styling**
- Professional background with subtle shadow
- Clear visual separation between columns
- Smooth hover effects on menu items
- Icons with proper color transitions

### ✅ **Button States**
- Trigger buttons with proper hover styling
- Active state shows primary blue color
- Smooth transitions and animations
- Focus states for accessibility

### ✅ **Responsive Design**
- Columns stack on mobile/tablet
- Proper padding on smaller screens
- Touch-friendly spacing

---

## File Structure

```
/apps/www/styles/
├── index.css                    # Main entry point (imports all)
├── design-system.css            # Core design system (colors, buttons, cards)
├── animations-modern.css        # Animation utilities
├── navigation.css               # Navigation structure & layout
└── navigation-overrides.css     # Color token mapping (OLD → NEW)
```

---

## Color Mappings

### Text Colors
```css
/* Old Tailwind Classes → New Design System */
.text-foreground              → var(--ds-text)
.text-foreground-light        → var(--ds-text-secondary)
.text-foreground-lighter      → var(--ds-text-muted)
.text-foreground-muted        → var(--ds-text-muted)
```

### Background Colors
```css
.bg-background                → var(--ds-bg)
.bg-surface-75                → var(--ds-bg-secondary)
.bg-background-alternative    → var(--ds-bg-secondary)
.bg-surface-200               → var(--ds-bg-tertiary)
```

### Border Colors
```css
.border-foreground-lighter    → var(--ds-border)
.border-foreground-muted      → var(--ds-text-muted)
```

---

## Components

### Navigation Trigger Button (Dropdown Menu Button)

**States:**
- **Default**: Light gray background, dark text
- **Hover**: Secondary gray background, darker text
- **Active/Open**: Primary blue background, white text
- **Focus**: Blue outline ring

**Example HTML:**
```html
<button class="navigation-menu-trigger">
  Products
</button>
```

**CSS Variables Used:**
```css
color: var(--ds-text-secondary)
background: transparent
transition: all var(--ds-transition-normal)

/* Hover */
background: var(--ds-bg-secondary)
color: var(--ds-text)

/* Active */
background: var(--ds-primary)
color: var(--ds-white)
```

---

### Dropdown Content Container

**Features:**
- Clean white background with subtle gray border
- Large shadow for elevation
- Rounded corners for modern look
- Two-column layout (left + right)

**CSS:**
```css
background: var(--ds-bg)
border: 1px solid var(--ds-border)
border-radius: var(--ds-radius-lg)
box-shadow: var(--ds-shadow-xl)
padding: 0
margin-top: 8px
```

---

### Menu Items (Product, Modules, etc.)

**Features:**
- Icon + Title + Description layout
- Icon box with secondary background and border
- Smooth hover effect
- Chevron that appears on hover

**Default State:**
```css
color: var(--ds-text-secondary)
background: transparent
border-radius: var(--ds-radius-md)
padding: var(--ds-spacing-3)
transition: all var(--ds-transition-normal)
```

**Hover State:**
```css
background: var(--ds-bg-secondary)
color: var(--ds-text)

/* Icon */
background: var(--ds-primary)
border-color: var(--ds-primary)
color: var(--ds-white)

/* Chevron */
opacity: 1
transform: translateX(0)
```

---

### Right Column (Featured Section)

**Features:**
- Secondary gray background
- Customer stories, comparisons, latest posts
- Image cards with borders
- Section headers in uppercase

**Background:**
```css
background: var(--ds-bg-secondary)
```

**Section Headers:**
```css
color: var(--ds-text-muted)
font-size: var(--ds-text-xs)
font-weight: var(--ds-font-weight-semibold)
text-transform: uppercase
letter-spacing: 0.1em
font-family: var(--ds-font-mono)
```

---

## Responsive Behavior

### Desktop (1024px and above)
- Side-by-side layout (left column + right column)
- Full dropdown width
- Proper spacing

**CSS:**
```css
display: flex
flex-direction: row
gap: 0
```

### Tablet/Mobile (below 1024px)
- Stacked columns (vertical layout)
- Full-width dropdown
- Reduced padding

**CSS:**
```css
@media (max-width: 1023px) {
  flex-direction: column
  padding: var(--ds-spacing-4)
}
```

---

## Animations

### Dropdown Slide-In
```css
@keyframes dropdownSlideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

animation: dropdownSlideDown 200ms ease-out
```

### Icon Chevron Fade-In
```css
.chevron-icon {
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--ds-transition-normal)
}

/* On hover */
.menu-item:hover .chevron-icon {
  opacity: 1
  transform: translateX(0)
}
```

### Color Transitions
All color changes use `var(--ds-transition-normal)` (200ms):
```css
transition: all var(--ds-transition-normal)
```

---

## Accessibility Features

### Focus States
```css
/* Keyboard navigation focus */
[role="menu"] [role="menuitem"]:focus-visible {
  outline: 2px solid var(--ds-primary)
  outline-offset: 2px
}

/* Or blue ring */
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)
```

### Reduced Motion
Users with `prefers-reduced-motion: reduce` preference:
```css
@media (prefers-reduced-motion: reduce) {
  animation: none
  transition: none
}
```

### High Contrast Mode
```css
@media (prefers-contrast: more) {
  border-width: 2px
  border-color: var(--ds-text)
}
```

### Keyboard Navigation
- Tab through menu items
- Arrow keys navigate options
- Enter/Space to select
- Escape to close dropdown

---

## Dark Mode Support

The navigation automatically adapts to dark mode:

```css
@media (prefers-color-scheme: dark) {
  [role="menubar"] {
    background-color: rgba(15, 23, 42, 0.8)
  }

  [role="menu"] {
    background-color: var(--ds-bg)  /* #0f172a */
  }
}
```

All colors are automatically mapped through CSS variables:
- Light mode: White backgrounds, dark text
- Dark mode: Dark backgrounds, light text

---

## CSS Variables Reference

### Colors
```css
--ds-primary: #3b82f6          /* Blue */
--ds-text: #111827             /* Dark gray (light mode) / #f1f5f9 (dark) */
--ds-text-secondary: #4b5563   /* Medium gray */
--ds-text-muted: #9ca3af       /* Light gray */
--ds-bg: #ffffff               /* White (light mode) / #0f172a (dark) */
--ds-bg-secondary: #f9fafb     /* Light gray (light) / #1e293b (dark) */
--ds-border: #e5e7eb           /* Light border */
```

### Spacing
```css
--ds-spacing-1: 0.25rem        /* 4px */
--ds-spacing-2: 0.5rem         /* 8px */
--ds-spacing-3: 0.75rem        /* 12px */
--ds-spacing-4: 1rem           /* 16px */
--ds-spacing-6: 1.5rem         /* 24px */
```

### Radius
```css
--ds-radius-md: 0.5rem         /* 8px */
--ds-radius-lg: 0.75rem        /* 12px */
```

### Shadows
```css
--ds-shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1)
--ds-shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1)
```

### Transitions
```css
--ds-transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1)
```

---

## Common Issues & Solutions

### Issue: Colors don't change on hover
**Solution**: Check that `.group:hover` selectors are applied to parent container.

### Issue: Dropdown appears behind other content
**Solution**: Ensure proper z-index. Navigation defaults to `z-index: auto` which should work with modern stacking contexts.

### Issue: Animation is jerky
**Solution**: Use `will-change: transform` on animated elements, but remove after animation ends.

### Issue: Text is hard to read in dark mode
**Solution**: All colors automatically adapt. Check `prefers-color-scheme: dark` media query in browser DevTools.

---

## Testing Checklist

- ✅ Light mode colors display correctly
- ✅ Dark mode colors respond to system preference
- ✅ Hover states work smoothly
- ✅ Focus states are visible (blue outline)
- ✅ Icons change color on hover
- ✅ Chevron slides in on hover
- ✅ Dropdown slides down on open
- ✅ Mobile layout stacks properly
- ✅ Keyboard navigation works
- ✅ Reduced motion preference is respected
- ✅ High contrast mode is readable

---

## Browser Support

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Variables | ✅ | ✅ | ✅ | ✅ |
| Flexbox | ✅ | ✅ | ✅ | ✅ |
| Transitions | ✅ | ✅ | ✅ | ✅ |
| prefers-color-scheme | 76+ | 67+ | 12.1+ | 76+ |
| prefers-reduced-motion | 74+ | 63+ | 10.1+ | 74+ |

---

## Customization

### Change Primary Color
To change the primary blue color, update in `design-system.css`:

```css
:root {
  --ds-primary: #your-color;
}
```

All navigation items will automatically use the new color.

### Change Text Color
Update text colors in `design-system.css`:

```css
:root {
  --ds-text: #your-text-color;
  --ds-text-secondary: #your-secondary-color;
  --ds-text-muted: #your-muted-color;
}
```

---

## Related Files

- **Main Styles**: `/apps/www/styles/index.css`
- **Design System**: `/apps/www/styles/design-system.css`
- **Navigation Styling**: `/apps/www/styles/navigation.css`
- **Color Overrides**: `/apps/www/styles/navigation-overrides.css`
- **Nav Components**: `/apps/www/components/Nav/`
- **Data**: `/apps/www/data/nav.tsx`

---

**Version:** 1.0.0
**Last Updated:** January 12, 2025
**Status:** ✅ Production Ready
