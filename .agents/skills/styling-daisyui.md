---
trigger: always_on
---

# Styling with DaisyUI and Tailwind CSS

## Core Principle

**Priority: DaisyUI > Tailwind CSS**

Use DaisyUI classes first. Only use Tailwind for:

- Spacing (margin, padding)
- Layout (flex, grid)
- Sizing (width, height)
- Things that don't exist in DaisyUI

## DaisyUI Classes

### DaisyUI Components

Always use DaisyUI components rather than recreating with Tailwind.

```html
<!-- ✅ GOOD - DaisyUI components -->
<button class="btn btn-primary">Click me</button>
<div class="card bg-base-100 shadow-xl">...</div>
<input type="text" class="input input-bordered" />
<div class="alert alert-success">Success!</div>

<!-- ❌ BAD - Recreating with Tailwind -->
<button class="bg-blue-500 text-white px-4 py-2 rounded">Click me</button>
<div class="bg-white rounded-lg shadow-xl p-4">...</div>
```

### DaisyUI Modifiers

```html
<!-- Sizes -->
<button class="btn btn-xs">Extra Small</button>
<button class="btn btn-sm">Small</button>
<button class="btn btn-md">Medium</button>
<button class="btn btn-lg">Large</button>

<!-- Variants -->
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-accent">Accent</button>
<button class="btn btn-ghost">Ghost</button>
<button class="btn btn-link">Link</button>

<!-- States -->
<button class="btn btn-primary btn-active">Active</button>
<button class="btn btn-primary" disabled>Disabled</button>
<button class="btn btn-primary btn-loading">Loading</button>
```

### Semantic Colors

Use DaisyUI semantic colors, not Tailwind.

```html
<!-- ✅ GOOD - DaisyUI semantic colors -->
<div class="bg-base-100">Base background</div>
<div class="bg-base-200">Secondary background</div>
<div class="bg-base-300">Tertiary background</div>
<p class="text-base-content">Base text</p>
<button class="btn btn-primary">Primary action</button>
<button class="btn btn-secondary">Secondary action</button>
<div class="alert alert-error">Error message</div>
<div class="alert alert-success">Success message</div>

<!-- ❌ BAD - Tailwind colors -->
<div class="bg-white">...</div>
<div class="bg-gray-100">...</div>
<p class="text-gray-900">...</p>
<button class="bg-blue-500">...</button>
```

## BEM CSS Naming

For custom styles that cannot be handled by DaisyUI.

### BEM Structure

```
Block__Element--Modifier
```

- **Block**: Main component
- **Element**: Part of the component
- **Modifier**: Variation of the component/element

### Examples

```vue
<template>
  <div class="product-card product-card--featured">
    <div class="product-card__header">
      <h2 class="product-card__title">{{ name }}</h2>
      <span class="product-card__badge product-card__badge--new">New</span>
    </div>
    <div class="product-card__body">
      <p class="product-card__description">{{ description }}</p>
      <span class="product-card__price">{{ price }}€</span>
    </div>
    <div class="product-card__footer">
      <button class="btn btn-primary">Add to Cart</button>
    </div>
  </div>
</template>

<style scoped>
/* Block */
.product-card {
  position: relative;
}

/* Modifier */
.product-card--featured {
  border: 2px solid var(--color-primary);
}

/* Element */
.product-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-card__title {
  font-size: 1.25rem;
  font-weight: 600;
}

.product-card__badge {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* Element Modifier */
.product-card__badge--new {
  background-color: var(--color-success);
  color: white;
}

.product-card__price {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
}
</style>
```

## Style Organization

### 1. Styles Close to Components

**Dumb Components (Design System):**

```
presentation/components/ui/
  Button/
    Button.vue
    button.css (if custom styles needed)
  Card/
    Card.vue
    card.css
```

### 2. Scoped Styles

Always use `scoped` to avoid conflicts.

```vue
<style scoped>
.product-card {
  /* Styles scoped to this component */
}
</style>
```

### 3. DaisyUI CSS Variables

Use DaisyUI CSS variables for consistency.

```css
.custom-element {
  background-color: hsl(var(--p)); /* primary */
  color: hsl(var(--pc)); /* primary-content */
  border-color: hsl(var(--b1)); /* base-100 */
}
```

### Available Variables

```css
/* Colors */
--p    /* primary */
--pc   /* primary-content */
--s    /* secondary */
--sc   /* secondary-content */
--a    /* accent */
--ac   /* accent-content */
--n    /* neutral */
--nc   /* neutral-content */
--b1   /* base-100 */
--b2   /* base-200 */
--b3   /* base-300 */
--bc   /* base-content */
--in   /* info */
--su   /* success */
--wa   /* warning */
--er   /* error */

/* Border radius */
--rounded-box
--rounded-btn
--rounded-badge

/* Animations */
--animation-btn
--animation-input
```

## DaisyUI + Tailwind Composition

### Combined Usage

```html
<!-- ✅ GOOD - DaisyUI for component, Tailwind for layout/spacing -->
<div class="flex gap-4 p-4">
  <button class="btn btn-primary">Action 1</button>
  <button class="btn btn-secondary">Action 2</button>
</div>

<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div class="card bg-base-100 shadow-xl">...</div>
  <div class="card bg-base-100 shadow-xl">...</div>
  <div class="card bg-base-100 shadow-xl">...</div>
</div>
```

### Allowed Tailwind Utility Classes

```html
<!-- Layout -->
<div class="flex flex-col items-center justify-between">
  <div class="grid grid-cols-3 gap-4">
    <!-- Spacing -->
    <div class="p-4 m-2 px-6 py-3">
      <div class="space-y-4 space-x-2">
        <!-- Sizing -->
        <div class="w-full h-screen max-w-4xl min-h-[200px]">
          <!-- Display -->
          <div class="hidden md:block">
            <div class="relative absolute top-0 left-0">
              <!-- Typography (if not in DaisyUI) -->
              <p class="text-sm font-medium leading-tight"></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

## DaisyUI Themes

### Configuration

```javascript
// tailwind.config.js
module.exports = {
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "dark"],
    // Or custom themes
    themes: [
      {
        mytheme: {
          primary: "#570df8",
          secondary: "#f000b8",
          accent: "#37cdbe",
          neutral: "#3d4451",
          "base-100": "#ffffff",
        },
      },
    ],
  },
};
```

### Usage in Components

```vue
<template>
  <!-- Theme applies automatically -->
  <div class="bg-base-100 text-base-content">
    <button class="btn btn-primary">Themed Button</button>
  </div>
</template>
```

## Responsive Design

### Tailwind Breakpoints

```html
<!-- Mobile first approach -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  <!-- Responsive grid -->
</div>

<button class="btn btn-sm md:btn-md lg:btn-lg">Responsive Button</button>

<div class="hidden md:block">
  <!-- Hidden on mobile, visible on tablet+ -->
</div>
```

## Animations

### DaisyUI Loading

```html
<span class="loading loading-spinner loading-xs"></span>
<span class="loading loading-spinner loading-sm"></span>
<span class="loading loading-spinner loading-md"></span>
<span class="loading loading-spinner loading-lg"></span>

<span class="loading loading-dots loading-lg"></span>
<span class="loading loading-ring loading-lg"></span>
```

### Vue Transitions

```vue
<template>
  <Transition name="fade">
    <div v-if="show">Content</div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

## Accessibility

### Use DaisyUI Components

DaisyUI components already include accessibility.

```html
<!-- ✅ GOOD - Accessible by default -->
<button class="btn btn-primary">Click me</button>

<!-- ✅ Add aria labels when needed -->
<button class="btn btn-ghost btn-circle" aria-label="Open menu">
  <svg>...</svg>
</button>
```

## Global CSS Structure

```
src/
  styles/
    main.css          # Global styles, imports
    variables.css     # Custom CSS variables
    utilities.css     # Custom utility classes
```

### main.css

```css
/* src/styles/main.css */
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";

/* Custom global styles */
@layer base {
  body {
    @apply bg-base-200 text-base-content;
  }
}

@layer components {
  /* Custom component classes if needed */
  .page {
    @apply min-h-screen;
  }

  .page__header {
    @apply bg-base-100 shadow-lg p-4;
  }
}
```

## Complete Examples

### Dumb Component with DaisyUI

```vue
<!-- ui/ProductCard.vue -->
<script setup lang="ts">
interface Props {
  name: string;
  price: number;
  imageUrl?: string;
  isNew?: boolean;
}

defineProps<Props>();
defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <div class="card card--product bg-base-100 shadow-xl">
    <figure v-if="imageUrl" class="card__figure">
      <img :src="imageUrl" :alt="name" />
    </figure>
    <div class="card-body">
      <div class="card__header">
        <h2 class="card-title">{{ name }}</h2>
        <div v-if="isNew" class="badge badge-secondary">New</div>
      </div>
      <p class="card__price text-2xl font-bold text-primary">{{ price }}€</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary btn-sm" @click="$emit('click')">View Details</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* BEM for custom styles only */
.card--product {
  transition: transform 0.2s ease;
}

.card--product:hover {
  transform: translateY(-4px);
}

.card__figure {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.card__header {
  display: flex;
  justify-content: space-between;
  align-items: start;
}
</style>
```

### Page with DaisyUI Layout

```vue
<!-- pages/ProductsPage.vue -->
<template>
  <div class="page page--products min-h-screen bg-base-200">
    <!-- Navbar -->
    <div class="navbar bg-base-100 shadow-lg">
      <div class="flex-1">
        <a class="btn btn-ghost text-xl">Products</a>
      </div>
      <div class="flex-none">
        <button class="btn btn-ghost btn-circle">
          <svg class="h-5 w-5">...</svg>
        </button>
      </div>
    </div>

    <!-- Breadcrumbs -->
    <div class="container mx-auto p-4">
      <div class="text-sm breadcrumbs">
        <ul>
          <li><a>Home</a></li>
          <li>Products</li>
        </ul>
      </div>
    </div>

    <!-- Content -->
    <div class="container mx-auto p-4">
      <!-- Loading -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <span class="loading loading-spinner loading-lg"></span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="alert alert-error">
        <svg class="stroke-current shrink-0 h-6 w-6">...</svg>
        <span>{{ error.message }}</span>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProductCard v-for="product in products" :key="product.id" v-bind="product" />
      </div>
    </div>
  </div>
</template>
```

## DaisyUI Forms

```html
<!-- Form components -->
<div class="form-control w-full max-w-xs">
  <label class="label">
    <span class="label-text">Product name</span>
  </label>
  <input type="text" placeholder="Type here" class="input input-bordered w-full" />
  <label class="label">
    <span class="label-text-alt">Helper text</span>
  </label>
</div>

<!-- Select -->
<select class="select select-bordered w-full max-w-xs">
  <option disabled selected>Pick one</option>
  <option>Option 1</option>
  <option>Option 2</option>
</select>

<!-- Checkbox -->
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Remember me</span>
    <input type="checkbox" class="checkbox" />
  </label>
</div>

<!-- Radio -->
<div class="form-control">
  <label class="label cursor-pointer">
    <span class="label-text">Option 1</span>
    <input type="radio" name="radio" class="radio" />
  </label>
</div>
```

## Modals and Overlays

```html
<!-- Modal -->
<dialog class="modal" :class="{ 'modal-open': isOpen }">
  <div class="modal-box">
    <h3 class="font-bold text-lg">Modal Title</h3>
    <p class="py-4">Modal content</p>
    <div class="modal-action">
      <button class="btn" @click="close">Close</button>
      <button class="btn btn-primary" @click="confirm">Confirm</button>
    </div>
  </div>
  <form method="dialog" class="modal-backdrop">
    <button @click="close">close</button>
  </form>
</dialog>

<!-- Drawer -->
<div class="drawer">
  <input id="my-drawer" type="checkbox" class="drawer-toggle" />
  <div class="drawer-content">
    <label for="my-drawer" class="btn btn-primary drawer-button"> Open drawer </label>
  </div>
  <div class="drawer-side">
    <label for="my-drawer" class="drawer-overlay"></label>
    <ul class="menu p-4 w-80 min-h-full bg-base-200">
      <li><a>Item 1</a></li>
      <li><a>Item 2</a></li>
    </ul>
  </div>
</div>
```

## Tables and Lists

```html
<!-- Table -->
<div class="overflow-x-auto">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Price</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in products" :key="product.id">
        <td>{{ product.name }}</td>
        <td>{{ product.price }}€</td>
        <td>
          <button class="btn btn-ghost btn-xs">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>

<!-- List with dividers -->
<ul class="menu bg-base-100 w-56 rounded-box">
  <li><a>Item 1</a></li>
  <li><a>Item 2</a></li>
  <li class="divider"></li>
  <li><a>Item 3</a></li>
</ul>
```

## Badges and Indicators

```html
<!-- Badges -->
<div class="badge">Default</div>
<div class="badge badge-primary">Primary</div>
<div class="badge badge-secondary">Secondary</div>
<div class="badge badge-accent">Accent</div>
<div class="badge badge-ghost">Ghost</div>

<!-- Indicator -->
<div class="indicator">
  <span class="indicator-item badge badge-secondary">New</span>
  <button class="btn">Inbox</button>
</div>

<!-- Avatar with indicator -->
<div class="avatar online">
  <div class="w-24 rounded-full">
    <img src="avatar.jpg" />
  </div>
</div>
```

## Spacing and Layout

### Use Tailwind for Spacing

```html
<!-- Padding/Margin -->
<div class="p-4 m-2">
  <div class="px-6 py-3">
    <div class="mt-4 mb-2">
      <!-- Gap -->
      <div class="flex gap-4">
        <div class="grid grid-cols-3 gap-6">
          <!-- Space between -->
          <div class="space-y-4">
            <!-- Vertical spacing -->
            <div class="space-x-2"><!-- Horizontal spacing --></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Container and Centering

```html
<!-- Container -->
<div class="container mx-auto">
  <!-- Content centered with max-width -->
</div>

<!-- Centering -->
<div class="flex items-center justify-center min-h-screen">
  <!-- Centered content -->
</div>
```

## Dark Mode

DaisyUI automatically handles dark mode via themes.

```html
<!-- Automatic theme switching -->
<html data-theme="light">
  <html data-theme="dark"></html>
</html>
```

```typescript
// Toggle theme
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  html.setAttribute("data-theme", currentTheme === "light" ? "dark" : "light");
}
```

## Styling Checklist

Before styling a component:

- [ ] Check if a DaisyUI component exists
- [ ] Use DaisyUI classes first
- [ ] Tailwind only for layout/spacing
- [ ] BEM for custom styles
- [ ] Scoped styles
- [ ] DaisyUI CSS variables for colors
- [ ] Responsive with Tailwind breakpoints
- [ ] Test in light and dark mode

## Anti-Patterns

### ❌ Recreating DaisyUI Components

```html
<!-- BAD -->
<div class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Button</div>

<!-- GOOD -->
<button class="btn btn-primary">Button</button>
```

### ❌ Inline Styles

```vue
<!-- BAD -->
<div :style="{ backgroundColor: '#fff', padding: '16px' }">

<!-- GOOD -->
<div class="bg-base-100 p-4">
```

### ❌ Tailwind Classes for Colors

```html
<!-- BAD -->
<div class="bg-blue-500 text-white">
  <!-- GOOD -->
  <div class="bg-primary text-primary-content"></div>
</div>
```

### ❌ BEM Without Necessity

```html
<!-- BAD - BEM for everything -->
<button class="button button--primary button__text">
  <!-- GOOD - DaisyUI classes -->
  <button class="btn btn-primary"></button>
</button>
```

## References

- [DaisyUI Components](https://daisyui.com/components/)
- [DaisyUI Themes](https://daisyui.com/docs/themes/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [BEM Methodology](http://getbem.com/)
