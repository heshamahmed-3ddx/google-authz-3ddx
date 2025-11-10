# RTL Logic Detection Report

## Files and Snippets with RTL/Direction Logic

### client/src/views/Reports/SurgicalGuideReportView.vue
- Usage of `isCurrentlyRTL` computed property to toggle table classes between `rtl-table` and `ltr-table`.
- Custom CSS classes `.rtl-table`, `.ltr-table` with direction, margin, and flex overrides.
- Manual document direction checks and computed property `docDir`.
- Inline style and class logic for icon/text alignment and margin flipping.
- Comments and code blocks referencing explicit LTR/RTL handling for table, icons, and expanded rows.

### client/src/i18n/index.js
- `rtlLanguages` array and `isRTL` helper function.
- `setLocale` function manually sets `document.documentElement.dir`, toggles CSS classes, and updates Vuetify RTL flag.
- Comments and logic for global RTL styles and syncing with Vuetify.

### Other Detected Patterns
- Margin and direction overrides in CSS: `.mr-2`, `.ml-2`, etc.
- Usage of `document.documentElement.dir` and class toggling for RTL/LTR.
- Table header and cell alignment logic based on direction.
- No destructive changes made; originals are backed up in `migrations/backup-rtl-20251110/`.

---

**Next Steps:**
- Proceed with Vite config verification and Vuetify plugin setup.
- All changes will be non-destructive and originals preserved.
