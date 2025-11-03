# Surgical Guide Report Documentation

## Overview

The Surgical Guide Report provides filtered, sortable, and exportable data on surgical guide cases, including payment and voucher details. It supports server-side filtering, color-coded type labels, and CSV export with all lookup/payment/voucher info.

---

## Architecture

- **Frontend:** Vue.js (Vuetify), main view in `client/src/views/Reports/SurgicalGuideReportView.vue`
- **Backend:** Node.js/Express, main logic in `server/src/models/surgicalGuideReport.model.js`, API endpoints in `server/src/controllers/surgicalGuideReport.controller.js`
- **Database:** MySQL, main tables: `surgical_guides`, `voucher_transaction`, lookup tables

---

## Data Flow

1. **User Interaction (Frontend)**
   - User applies filters, sorts, or requests CSV export.
   - UI displays voucher breakdown, color-coded type labels, and payment status.

2. **API Request (Frontend → Backend)**
   - Filters and export requests sent via API endpoints.
   - Example: `/api/surgical-guide-report?orderTypeFilter=...`

3. **Data Processing (Backend)**
   - Server-side filtering and sorting.
   - Voucher aggregation via SQL subquery (`GROUP_CONCAT`).
   - Payment status calculated using `transaction_amount` from `voucher_transaction`.
   - Lookup values mapped for display/export.

4. **Database Query**
   - SQL queries join `surgical_guides` with voucher/payment/lookup tables.
   - Aggregates voucher details and payment info.

5. **Response (Backend → Frontend)**
   - Returns filtered/sorted data, including voucher/payment/lookup info.
   - For export, returns CSV data with all relevant fields.

6. **UI Rendering (Frontend)**
   - Displays data in table with expandable voucher details.
   - Type labels use color mapping (`getTypeColor`, `shouldUseWhiteText`).
   - CSV export uses filename format `OSG_YYYYMMDD.csv`.

---

## Key Features

- **Server-Side Filtering:** All filters (including order type) are processed in backend for performance and pagination consistency.
- **Voucher Aggregation:** Voucher details are aggregated in SQL and parsed for UI/export.
- **Payment Calculation:** Uses `transaction_amount` from `voucher_transaction` for payment status.
- **Type Color Mapping:** Type labels are color-coded for clarity.
- **CSV Export:** Includes all lookup values, payment/voucher info, and uses formatted filename.

---

## Main Files

- **Frontend:**
  - `client/src/views/Reports/SurgicalGuideReportView.vue`: Main report UI, filter logic, voucher breakdown, type color mapping, CSV export trigger.
- **Backend:**
  - `server/src/models/surgicalGuideReport.model.js`: Data aggregation, filtering, voucher/payment logic, CSV export.
  - `server/src/controllers/surgicalGuideReport.controller.js`: API endpoints, CSV filename logic.
  - `server/src/services/surgicalGuideReport.service.js`: Passes filter/export params.
- **Database:**
  - `database/surgical_guides_schema.sql`: Table definitions.
  - `voucher_transaction`: Used for payment calculations.

---

## Extending/Modifying

- **Add new filters:** Update backend model/controller to accept new filter params, update frontend filter UI.
- **Change voucher/payment logic:** Update SQL in model, ensure frontend parses new format.
- **Add new lookup values:** Update backend mapping, ensure frontend displays new fields.
- **Change export format:** Update backend CSV logic, adjust frontend download trigger if needed.

---

## Best Practices

- Always confirm database schema before coding.
- Use server-side filtering for large datasets.
- Keep frontend and backend export logic in sync.
- Use color mapping functions for UI consistency.

---

## References

- Backend logic: `getReportData`, `exportToCSV` in `surgicalGuideReport.model.js`
- Frontend logic: filter/export in `SurgicalGuideReportView.vue`
- Database schema: `surgical_guides_schema.sql`, `voucher_transaction`

---

For further work, follow this structure to add new features, update logic, or onboard new team members.
