# Compact UI Style Guide

This document describes the global compact UI design system used throughout the application.

## Overview

The compact UI style provides a consistent, space-efficient design pattern that maximizes information density while maintaining readability and usability. All styles are globally available and can be applied using CSS classes.

## Design Philosophy

### Static Design Approach

The application follows a **static design philosophy** with no animations or hover effects:

- **No animations** - All components use static styling without transitions
- **No hover effects** - Clean, minimal interaction without visual changes on hover
- **Flat design** - No shadows, gradients, or visual effects
- **Immediate feedback** - State changes are instant, not animated
- **Performance focused** - Reduced CSS complexity and better performance

This approach ensures:
- Faster rendering
- Reduced motion for accessibility
- Cleaner, more professional appearance
- Consistent behavior across all devices

## Quick Start

The compact UI styles are automatically imported in `main.js` and available throughout the application. Simply use the provided CSS classes to apply compact styling.

## Global Styles Location

- **File:** `client/src/styles/compact-ui.css`
- **Imported in:** `client/src/main.js`
- **Vuetify Defaults:** Updated in `client/src/main.js`

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

## Tables

### Ultra-Compact Table Style

All tables automatically use the compact style. The table headers have an orange background (#FF8C00) with white text.

```vue
<template>
  <v-card elevation="1" class="table-card">
    <v-card-title class="table-card-title compact-title">
      Table Title
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="items"
      density="compact"
      class="ultra-compact-table"
    />
  </v-card>
</template>
```

**Table Features:**
- Orange header background (#FF8C00) with white text
- Compact cell padding (2px 8px)
- Font size: 0.8rem for cells, 0.75rem for headers
- Row height: 32px
- Sticky headers
- Compact footer with pagination
- RTL support

**Table Card Classes:**
- `.table-card` - Table container card
- `.table-card-title` - Table title styling
- `.ultra-compact-table` - Applied automatically to all tables

## Buttons

### Compact Buttons

All buttons automatically use compact styling:

```vue
<template>
  <!-- Small button -->
  <v-btn size="small" variant="outlined">Button</v-btn>
  
  <!-- Default button -->
  <v-btn variant="elevated">Button</v-btn>
  
  <!-- Icon button -->
  <v-btn icon="mdi-plus" size="small" />
</template>
```

**Button Sizes:**
- **Small:** 32px height, 64px min-width, 0.8125rem font
- **Default:** 36px height, 80px min-width, 0.875rem font
- **Icon buttons:** 32px × 32px (28px for small)

**Button Variants:**
- `variant="outlined"` - Outlined with border
- `variant="elevated"` - Elevated with shadow
- `variant="text"` - Text button

## Input Fields

### Compact Form Fields

All form fields automatically use compact density, outlined variant, and hide details:

```vue
<template>
  <!-- Text field -->
  <v-text-field
    v-model="value"
    label="Label"
    density="compact"
    variant="outlined"
    hide-details
  />
  
  <!-- Select -->
  <v-select
    v-model="value"
    :items="items"
    density="compact"
    variant="outlined"
    hide-details
  />
  
  <!-- Textarea -->
  <v-textarea
    v-model="value"
    label="Label"
    density="compact"
    variant="outlined"
    hide-details
  />
</template>
```

**Default Settings (Automatic):**
- `density="compact"`
- `variant="outlined"`
- `hideDetails: true`
- Font size: 0.875rem
- Compact padding: 8px top/bottom

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

    <!-- Table -->
    <v-card elevation="1" class="table-card">
      <v-card-title class="table-card-title compact-title">
        Data Table
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="items"
        density="compact"
      />
    </v-card>
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
7. **Tables**: All tables automatically use ultra-compact styling with orange headers

## Migration Guide

To migrate existing pages to compact UI:

1. Add `page-container` class to main container
2. Replace `elevation="2"` or `elevation="3"` with `elevation="1"`
3. Update card titles to use `compact-title` class
4. Change `mb-6` to `mb-3`, `mb-4` to `mb-3`
5. Update text sizes: `text-h5` → `text-subtitle-2`, `text-body-2` → `text-caption`
6. Update icons to `size="small"` with proper spacing
7. Add `density="compact"` to alerts if not already present
8. Tables automatically get compact styling - no changes needed

## Static Design Principles

The application follows a **static design philosophy** with no animations or hover effects:

- **No animations** - All components use static styling without transitions
- **No hover effects** - Clean, minimal interaction without visual changes on hover
- **Flat design** - No shadows, gradients, or visual effects
- **Immediate feedback** - State changes are instant, not animated
- **Performance focused** - Reduced CSS complexity and better performance

**Benefits:**
- Faster rendering and better performance
- Reduced motion for accessibility
- Cleaner, more professional appearance
- Consistent behavior across all devices
- Lower CSS complexity

**Implementation:**
- No `transition` properties in CSS
- No `:hover` selectors with visual changes
- No `animation` or `@keyframes`
- Static colors and borders
- Instant state changes

## RTL Support

All compact UI styles support RTL (Right-to-Left) languages automatically. Icons and spacing adjust based on the document direction.

**RTL Best Practices:**
- Use `text-align: start` instead of `left` or `right`
- Use `margin-inline-start` and `margin-inline-end` instead of `margin-left` and `margin-right`
- Use `padding-inline-start` and `padding-inline-end` for padding
- Use `direction: rtl` on containers for RTL languages

## Dark Mode Support

Compact UI styles work seamlessly with dark mode. Cards, tables, and surfaces automatically adapt to the current theme.

## Vuetify Defaults

The following Vuetify defaults are configured globally:

```javascript
{
  VCard: { elevation: 1 },
  VTextField: { 
    density: "compact",
    variant: "outlined",
    hideDetails: true
  },
  VSelect: { 
    density: "compact",
    variant: "outlined",
    hideDetails: true
  },
  VTextarea: { 
    density: "compact",
    variant: "outlined",
    hideDetails: true
  },
  VAlert: { density: "compact" },
  VList: { density: "compact" },
  VDataTable: { 
    density: "compact",
    class: "ultra-compact-table"
  }
}
```

## OverlaySidebar Styling

### Full-Screen Overlay Pattern

The `OverlaySidebar` component uses a full-screen overlay pattern:

```vue
<template>
  <v-overlay :model-value="showOverlay">
    <v-card class="overlay-card">
      <!-- Content -->
    </v-card>
  </v-overlay>
</template>
```

**Key Styling:**
- Full viewport width and height
- Backdrop with 50% opacity
- Centered content with max-width: 1200px
- Single scrollbar on right edge
- Safe area support for mobile devices (48px bottom padding minimum)

### Grid Navigation Layout

Navigation items are displayed in a responsive grid:

```css
/* Mobile: 1 column */
grid-template-columns: 1fr;

/* Tablet: 2-3 columns */
grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));

/* Desktop: 3-4 columns */
grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
```

**Navigation Item Styling:**
- Compact padding: 8px 10px
- Border radius: 6px
- Border: 1px solid (no hover changes)
- Icon wrapper: 28px × 28px
- Icon size: 18px
- Text: 0.8125rem, normal weight
- **No hover effects or animations** (static design)

### Profile Section

User profile display at the top:

```vue
<v-list-item class="user-profile-section">
  <template #prepend>
    <v-avatar size="40">
      <!-- Profile picture or initials -->
    </v-avatar>
  </template>
  <v-list-item-title>{{ user.name }}</v-list-item-title>
  <v-list-item-subtitle>{{ user.jobTitle }}</v-list-item-subtitle>
  <template #append>
    <v-btn>Logout</v-btn>
  </template>
</v-list-item>
```

**Styling:**
- Avatar: 40px with brand orange background
- Name: 0.8125rem, font-weight 600
- Job title: 0.6875rem, muted color
- Logout button: Compact, inline with profile

### Search Input

Search field styling:

```vue
<v-text-field
  v-model="searchQuery"
  prepend-inner-icon="mdi-magnify"
  variant="outlined"
  density="compact"
  class="search-input"
/>
```

**Styling:**
- Fixed height: 40px (prevents layout shifts)
- Border radius: 8px
- Compact padding
- Orange accent on focus
- No hover effects

### Section Headers

Navigation section headers:

```vue
<v-list-subheader class="section-header">
  <v-icon size="16">{{ section.icon }}</v-icon>
  <span class="section-title">{{ section.title }}</span>
  <v-divider class="section-separator-line" />
</v-list-subheader>
```

**Styling:**
- Font size: 0.6875rem
- Uppercase text
- Icon + title on left, separator line extending right
- Muted colors
- Compact spacing

## Related Documentation

- [Settings Page Guide](./settings-page-guide.md)
- [Vue Components Reference](./vue-components.md)
- [Usage Guides](./usage-guides.md)

