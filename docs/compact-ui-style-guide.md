# Compact UI Style Guide

This document describes the global compact UI design system used throughout the application.

## Overview

The compact UI style provides a consistent, space-efficient design pattern that maximizes information density while maintaining readability and usability. All styles are globally available and can be applied using CSS classes.

## Quick Start

The compact UI styles are automatically imported in `main.js` and available throughout the application. Simply use the provided CSS classes to apply compact styling.

## Page Containers

### Standard Page Container

Use the `page-container` class for consistent page padding:

```vue
<template>
  <v-container fluid class="page-container">
    <!-- Your content -->
  </v-container>
</template>
```

**Available classes:**
- `.page-container` - Generic page container
- `.dashboard-page` - Dashboard-specific container
- `.settings-page` - Settings page container
- `.surgical-guide-report` - Report page container

**Responsive padding:**
- Mobile (< 600px): 8px
- Tablet (600px - 960px): 12px
- Desktop (> 960px): 16px

## Headers

### Compact Header

```vue
<template>
  <div class="compact-header">
    <h1 class="compact-header-title">
      <v-icon size="small" style="margin-inline-end: 6px" color="primary">
        mdi-icon-name
      </v-icon>
      Page Title
    </h1>
    <p class="compact-header-subtitle">
      Page subtitle or description
    </p>
  </div>
</template>
```

**Classes:**
- `.compact-header` - Header container (min-height: 50px)
- `.compact-header-title` - Title styling (1.25rem, bold)
- `.compact-header-subtitle` - Subtitle styling (0.75rem)

## Cards

### Compact Card

```vue
<template>
  <v-card elevation="1" class="compact-card">
    <v-card-title class="compact-title">
      <v-icon size="small" style="margin-inline-end: 6px" color="primary">
        mdi-icon-name
      </v-icon>
      <span class="text-subtitle-2 font-weight-medium">Card Title</span>
    </v-card-title>
    <v-card-text class="compact-card-text">
      <!-- Card content -->
    </v-card-text>
  </v-card>
</template>
```

**Classes:**
- `.compact-card` - Card with elevation 1
- `.compact-title` - Card title (padding: 6px 12px, min-height: 36px)
- `.compact-card-text` - Card text (padding: 12px)

## Typography

### Section Headings

```vue
<h4 class="compact-section-title">
  <v-icon size="small" style="margin-inline-end: 6px" color="primary">
    mdi-icon-name
  </v-icon>
  Section Title
</h4>
```

**Classes:**
- `.compact-section-title` - Section heading (0.875rem, font-weight: 500)
- `.text-compact` - Compact text (0.875rem)
- `.text-compact-small` - Small compact text (0.75rem)

## Spacing

### Margin Utilities

```vue
<div class="compact-mb-3">Content with bottom margin</div>
```

**Available classes:**
- `.compact-mb-1` - Margin bottom: 4px
- `.compact-mb-2` - Margin bottom: 8px
- `.compact-mb-3` - Margin bottom: 12px
- `.compact-mt-1` - Margin top: 4px
- `.compact-mt-2` - Margin top: 8px
- `.compact-mt-3` - Margin top: 12px

### Padding Utilities

```vue
<div class="compact-pa-3">Content with padding</div>
```

**Available classes:**
- `.compact-pa-1` - Padding: 4px
- `.compact-pa-2` - Padding: 8px
- `.compact-pa-3` - Padding: 12px

## Forms & Inputs

### Compact Form Fields

Form fields automatically use compact density via Vuetify defaults. You can also explicitly apply:

```vue
<v-text-field
  density="compact"
  variant="outlined"
  label="Field Label"
/>
```

**Classes:**
- `.compact-field` - Compact form field
- `.compact-btn` - Compact button (size: small)

## Alerts

### Compact Alerts

```vue
<v-alert
  type="info"
  variant="tonal"
  density="compact"
  class="compact-alert"
>
  Alert message
</v-alert>
```

**Note:** Alerts automatically use compact density via Vuetify defaults.

## Tables

### Compact Tables

```vue
<v-card variant="outlined" elevation="0">
  <v-card-title class="compact-table-title">
    Table Title
  </v-card-title>
  <v-data-table
    density="comfortable"
    :headers="headers"
    :items="items"
  />
</v-card>
```

**Classes:**
- `.compact-table` - Compact table
- `.compact-table-title` - Table title styling

## Lists

### Compact Lists

```vue
<v-list density="compact" class="compact-list">
  <v-list-item>Item 1</v-list-item>
  <v-list-item>Item 2</v-list-item>
</v-list>
```

**Note:** Lists automatically use compact density via Vuetify defaults.

## Icons

### Compact Icons

Icons in compact headers and titles should use:

```vue
<v-icon size="small" style="margin-inline-end: 6px" color="primary">
  mdi-icon-name
</v-icon>
```

**Classes:**
- `.compact-icon` - Compact icon styling

## Complete Example

Here's a complete example of a page using compact UI styles:

```vue
<template>
  <v-container fluid class="page-container">
    <!-- Header -->
    <div class="compact-header mb-3">
      <h1 class="compact-header-title">
        <v-icon size="small" style="margin-inline-end: 6px" color="primary">
          mdi-cog
        </v-icon>
        Settings
      </h1>
      <p class="compact-header-subtitle">
        Manage your application settings
      </p>
    </div>

    <!-- Content Cards -->
    <v-row no-gutters>
      <v-col cols="12">
        <v-card elevation="1" class="mb-3">
          <v-card-title class="compact-title">
            <v-icon size="small" style="margin-inline-end: 6px" color="primary">
              mdi-security
            </v-icon>
            <span class="text-subtitle-2 font-weight-medium">Security</span>
          </v-card-title>
          <v-card-text class="compact-card-text">
            <!-- Card content -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
```

## Best Practices

1. **Consistent Spacing**: Use the compact spacing utilities (mb-3, pa-3) instead of custom values
2. **Card Elevation**: Use `elevation="1"` for standard cards, `elevation="0"` for outlined cards
3. **Typography**: Use `text-subtitle-2` for card titles, `text-caption` for descriptions
4. **Icons**: Always use `size="small"` with `margin-inline-end: 6px` for consistency
5. **Density**: Form fields, alerts, and lists automatically use compact density
6. **Responsive**: Page containers automatically adjust padding based on screen size

## Migration Guide

To migrate existing pages to compact UI:

1. Add `page-container` class to main container
2. Replace `elevation="2"` or `elevation="3"` with `elevation="1"`
3. Update card titles to use `compact-title` class
4. Change `mb-6` to `mb-3`, `mb-4` to `mb-3`
5. Update text sizes: `text-h5` → `text-subtitle-2`, `text-body-2` → `text-caption`
6. Update icons to `size="small"` with proper spacing
7. Add `density="compact"` to alerts if not already present

## RTL Support

All compact UI styles support RTL (Right-to-Left) languages automatically. Icons and spacing adjust based on the document direction.

## Dark Mode Support

Compact UI styles work seamlessly with dark mode. Cards and surfaces automatically adapt to the current theme.

## File Location

The compact UI styles are defined in:
- `client/src/styles/compact-ui.css`

And imported in:
- `client/src/main.js`

