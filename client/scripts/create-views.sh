#!/bin/bash

# Script to create all placeholder views for the navigation structure
# This will create the directory structure and symlink to the PlaceholderView

BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)/src/views"
PLACEHOLDER="$BASE_DIR/PlaceholderView.vue"

echo "Creating view directories and files..."
echo "Base directory: $BASE_DIR"
echo "Placeholder: $PLACEHOLDER"

# Create directories
mkdir -p "$BASE_DIR/UserManagement"
mkdir -p "$BASE_DIR/Organization"
mkdir -p "$BASE_DIR/Finance"
mkdir -p "$BASE_DIR/Development"
mkdir -p "$BASE_DIR/Projects"
mkdir -p "$BASE_DIR/Documentation"
mkdir -p "$BASE_DIR/Reports"
mkdir -p "$BASE_DIR/System"
mkdir -p "$BASE_DIR/Help"

# User Management views
for view in UsersView GroupsView RolesView PoliciesView; do
  cp "$PLACEHOLDER" "$BASE_DIR/UserManagement/$view.vue"
  echo "Created: UserManagement/$view.vue"
done

# Organization views
for view in StructureView DepartmentsView CostCentersView UnitsView; do
  cp "$PLACEHOLDER" "$BASE_DIR/Organization/$view.vue"
  echo "Created: Organization/$view.vue"
done

# Finance views
for view in InvoicesView BudgetsView ReportsView ApprovalsView; do
  cp "$PLACEHOLDER" "$BASE_DIR/Finance/$view.vue"
  echo "Created: Finance/$view.vue"
done

# Development views
for view in RepositoriesView DeploymentsView ApiKeysView WebhooksView; do
  cp "$PLACEHOLDER" "$BASE_DIR/Development/$view.vue"
  echo "Created: Development/$view.vue"
done

# Projects views
for view in ProjectsView MyTasksView TimesheetsView ReportsView; do
  cp "$PLACEHOLDER" "$BASE_DIR/Projects/$view.vue"
  echo "Created: Projects/$view.vue"
done

# Documentation views
for view in ApiDocsView JSDocView GuidesView TechnicalView; do
  cp "$PLACEHOLDER" "$BASE_DIR/Documentation/$view.vue"
  echo "Created: Documentation/$view.vue"
done

# Reports views
for view in DashboardsView UserActivityView LogsView AuditView; do
  cp "$PLACEHOLDER" "$BASE_DIR/Reports/$view.vue"
  echo "Created: Reports/$view.vue"
done

# System views
for view in SettingsView IntegrationsView NotificationsView SecurityView BackupView; do
  cp "$PLACEHOLDER" "$BASE_DIR/System/$view.vue"
  echo "Created: System/$view.vue"
done

# Help views
for view in FAQView ContactView TutorialsView WhatsNewView; do
  cp "$PLACEHOLDER" "$BASE_DIR/Help/$view.vue"
  echo "Created: Help/$view.vue"
done

# Create ProfileView if it doesn't exist
if [ ! -f "$BASE_DIR/ProfileView.vue" ]; then
  cp "$PLACEHOLDER" "$BASE_DIR/ProfileView.vue"
  echo "Created: ProfileView.vue"
fi

echo ""
echo "✅ All view files created successfully!"
echo "Total directories: 9"
echo "Total view files: 41"
