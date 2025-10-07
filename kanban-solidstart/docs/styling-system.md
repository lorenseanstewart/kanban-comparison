# Styling System

This document explains the styling approach using Tailwind CSS and DaisyUI.

## Tech Stack

- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library built on Tailwind
- **Theme** - `pastel` theme (light, soft colors)

## Configuration

### tailwind.config.js

```javascript
export default {
  darkMode: 'media', // Use system preference
  content: [
    "./src/**/*.{ts,tsx,js,jsx,html,css}",
    "./app.tsx",
    "./index.html"
  ],
  plugins: [daisyui],
  daisyui: {
    themes: ["pastel"],
    logs: false
  }
};
```

### Theme Application

```tsx
// src/app.tsx
<div data-theme="pastel" class="min-h-screen bg-base-300">
  {children}
</div>
```

## DaisyUI Components

### Used Components

1. **card** - Board cards, lists, modals
2. **badge** - Tags, status indicators
3. **btn** - Buttons with variants
4. **modal** - Dialog overlays
5. **alert** - Error messages
6. **loading** - Spinner animations
7. **breadcrumbs** - Navigation trail

### Example Usage

```tsx
<div class="card bg-base-200 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">Title</h2>
    <p>Content</p>
    <div class="card-actions">
      <button class="btn btn-primary">Action</button>
    </div>
  </div>
</div>
```

## Color System

### Theme Colors

DaisyUI's pastel theme provides semantic colors:

```
primary     - Purple (#a78bfa)
secondary   - Pink (#f472b6)
accent      - Teal (auto-generated)
neutral     - Gray (auto-generated)
base-100    - White background
base-200    - Light gray
base-300    - Medium gray
info        - Blue
success     - Green
warning     - Yellow
error       - Red
```

### Usage in Components

```tsx
<button class="btn btn-primary">Primary Action</button>
<div class="bg-base-200 text-base-content">Content</div>
<span class="badge badge-secondary">Tag</span>
```

## Dark Mode

```javascript
darkMode: 'media' // Respects system preference
```

### Dark Mode Classes

```tsx
<div class="bg-base-100 dark:bg-base-200">
  <p class="text-base-content">Auto-adjusts in dark mode</p>
</div>
```

## Custom Styling

### Rounded Corners

```tsx
<main class="rounded-3xl">  {/* 1.5rem */}
<div class="rounded-xl">    {/* 0.75rem */}
<div class="rounded-2xl">   {/* 1rem */}
```

### Shadows

```tsx
<div class="shadow-xl">     {/* Large shadow */}
<div class="shadow-2xl">    {/* Extra large */}
<div class="shadow-inner">  {/* Inset shadow */}
```

### Spacing

```tsx
<div class="space-y-6">     {/* Vertical spacing */}
<div class="gap-4">         {/* Grid/flex gap */}
<div class="p-8">           {/* Padding */}
```

## Tag Colors

Custom colors for tags use inline styles:

```tsx
<span
  class="badge text-white"
  style={`background-color: ${tag.color};`}
>
  {tag.name}
</span>
```

**Tag Colors:**
- Design: `#8B5CF6` (purple)
- Product: `#EC4899` (pink)
- Engineering: `#3B82F6` (blue)
- Marketing: `#10B981` (green)
- QA: `#F59E0B` (amber)

## Charts

Charts use CSS-only library (charts.css):

```tsx
<div class="charts-css column">
  <div style={`--size: ${percentage};`} />
</div>
```

**Benefits:**
- No JavaScript for rendering
- Accessible (semantic HTML)
- Small bundle size

## Responsive Design

### Breakpoints

```
sm: 640px   (mobile)
md: 768px   (tablet)
lg: 1024px  (laptop)
xl: 1280px  (desktop)
```

### Usage

```tsx
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column on mobile, 2 on tablet, 3 on laptop+ */}
</div>
```

## Animation

### Transitions

```tsx
<div class="transition-all duration-300 ease-in-out">
  {/* Smooth transitions */}
</div>
```

### Hover Effects

```tsx
<a class="hover:shadow-2xl hover:scale-[1.02]">
  {/* Scale and shadow on hover */}
</a>
```

### Loading States

```tsx
<span class="loading loading-spinner loading-lg text-primary" />
```

## Best Practices

1. **Use semantic color names** - `btn-primary` not `btn-purple`
2. **Leverage DaisyUI components** - Don't reinvent the wheel
3. **Keep custom CSS minimal** - Prefer Tailwind utilities
4. **Use dark mode classes** - `dark:bg-base-200`
5. **Maintain consistent spacing** - Stick to Tailwind scale
