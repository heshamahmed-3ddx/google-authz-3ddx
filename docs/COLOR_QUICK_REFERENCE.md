# Color System Quick Reference

## Primary Colors (Orange Brand)

| Usage | Light Mode | Dark Mode | Contrast Text |
|-------|------------|-----------|---------------|
| Main | `#FF8C00` | `#FFB74D` | White / Dark |
| Dark | `#E65100` | `#FF9800` | White |
| Light | `#FFB74D` | `#FFCC80` | Dark |

**Usage**: Headers, primary buttons, brand elements, CTAs

## Secondary Colors (Blue)

| Usage | Light Mode | Dark Mode | Contrast Text |
|-------|------------|-----------|---------------|
| Main | `#1976D2` | `#64B5F6` | White / Dark |
| Dark | `#1565C0` | `#42A5F5` | White |
| Light | `#42A5F5` | `#90CAF9` | Dark |

**Usage**: Secondary actions, links, informational elements

## Semantic Colors

### Success
- **Light**: `#43A047` | **Dark**: `#66BB6A`
- **Usage**: Success messages, positive indicators

### Warning
- **Light**: `#FFA000` | **Dark**: `#FFCA28`
- **Usage**: Warnings, caution states

### Error
- **Light**: `#E53935` | **Dark**: `#EF5350`
- **Usage**: Errors, destructive actions

### Info
- **Light**: `#00897B` | **Dark**: `#4DB6AC`
- **Usage**: Informational messages

## Background Colors

### Light Mode
- Default: `#FAFAFA`
- Paper/Surface: `#FFFFFF`
- Elevated: `#FFFFFF`
- Hover: `#F0F0F0`

### Dark Mode
- Default: `#121212`
- Paper/Surface: `#1E1E1E`
- Elevated: `#252525`
- Hover: `#333333`

## Text Colors

### Light Mode
- Primary: `#212121`
- Secondary: `#616161`
- Disabled: `#9E9E9E`
- On Primary: `#FFFFFF`

### Dark Mode
- Primary: `#FFFFFF`
- Secondary: `#B0B0B0`
- Disabled: `#616161`
- On Primary: `#212121`

## Payment Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Free | Green | `#43A047` |
| Fully Prepaid | Blue | `#1565C0` |
| Fully Postpaid | Red | `#E53935` |
| Partially Postpaid | Purple | `#8E24AA` |

## Workflow Status Colors

| Status | Color | Hex |
|--------|-------|-----|
| Rush | Deep Orange | `#E65100` |
| On Hold | Red | `#F44336` |
| Confirmed | Grey | `#616161` |
| Active | Green | `#43A047` |

## Icon Style

- **Type**: Outline (preferred)
- **Sizes**: 16px (small), 20px (default), 24px (medium), 32px (large)
- **Stroke**: 1.5px
- **Library**: Material Design Icons (MDI)

## Vuetify Usage

```vue
<!-- Primary Button -->
<v-btn color="primary">Action</v-btn>

<!-- Secondary Button -->
<v-btn color="secondary" variant="outlined">Secondary</v-btn>

<!-- Status Chip -->
<v-chip color="success" size="small">Active</v-chip>

<!-- Card -->
<v-card :elevation="2">
  <!-- Content -->
</v-card>
```

## CSS Variables

```css
/* Primary */
--color-primary: #FF8C00;
--color-primary-dark: #E65100;

/* Secondary */
--color-secondary: #1976D2;
--color-secondary-dark: #1565C0;

/* Semantic */
--color-success: #43A047;
--color-warning: #FFA000;
--color-error: #E53935;
--color-info: #00897B;
```

