<template>
  <v-container fluid class="surgical-guide-report">
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <div
          class="d-flex justify-space-between align-center mb-4 header-container page-header-sticky"
        >
          <div class="header-text">
            <h1 class="text-h4 pt-4 header-title">
              <v-icon class="mr-2" color="primary">mdi-file-chart</v-icon>
              Surgical Guide Report
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis header-subtitle">
              Comprehensive surgical guide cases and financial analytics
            </p>
          </div>

          <!-- Swagger API Docs Link (Developers22 only) -->
          <v-btn
            v-if="accessInfo.hasSwaggerAccess"
            color="secondary"
            variant="outlined"
            prepend-icon="mdi-api"
            :href="swaggerUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            API Documentation
            <v-icon class="ml-2">mdi-open-in-new</v-icon>
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Access Denied Message -->
    <v-row v-if="!accessInfo.hasReportAccess && !loading.access">
      <v-col cols="12">
        <v-alert
          type="error"
          prominent
          variant="tonal"
          border="start"
          icon="mdi-lock"
        >
          <!-- Project Documentation Button (Dev only) -->
          <v-btn
            v-if="isDevelopment"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-file-document"
            class="ml-2"
            @click="openProjectDoc"
          >
            Report Feature Doc
            <v-icon class="ml-2">mdi-open-in-new</v-icon>
          </v-btn>
          <v-alert-title class="text-h6">Access Denied</v-alert-title>
          <p class="mb-2">
            You do not have permission to view the Surgical Guide Report.
          </p>
          <p class="text-body-2">
            Required: <strong>Finance22</strong> or <strong>admin</strong> group
            membership
          </p>
          <p class="text-caption text-medium-emphasis mt-2">
            Your current groups:
            {{ accessInfo.userGroups.join(", ") || "None" }}
          </p>
        </v-alert>

        <!-- Development Mode Helper -->
        <v-alert
          v-if="isDevelopment"
          type="info"
          prominent
          variant="tonal"
          border="start"
          icon="mdi-information"
          class="mt-4"
        >
          <v-alert-title class="text-h6">
            <v-icon class="mr-2">mdi-developer-board</v-icon>
            Development Mode Tip
          </v-alert-title>
          <p class="mb-3">
            You're in development mode. To access this report, you can:
          </p>
          <ol class="mb-3">
            <li class="mb-2">
              <strong>Navigate to Dashboard</strong> (top-left in navigation)
            </li>
            <li class="mb-2">
              <strong>Click "Groups (0)" chip</strong> at the top-left of the
              page
            </li>
            <li class="mb-2">
              <strong>Check "Finance22"</strong> in the dropdown menu
            </li>
            <li class="mb-2">
              <strong>Return to this page</strong> - you'll now have access!
            </li>
          </ol>
          <p class="text-caption text-medium-emphasis">
            Alternatively, click "Admin View: OFF" to enable admin mode and
            access all routes.
          </p>
          <div class="mt-4">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-view-dashboard"
              size="large"
              @click="navigateToDashboard"
            >
              Go to Dashboard
            </v-btn>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Main Report Interface (Finance22 only) -->
    <template v-if="accessInfo.hasReportAccess">
      <!-- Date Range Filters -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title>
              <v-icon class="mr-2">mdi-filter</v-icon>
              Report Filters
            </v-card-title>
            <v-card-text>
              <!-- Search Row -->
              <v-row class="mb-4">
                <v-col cols="12">
                  <v-text-field
                    v-model="searchQuery"
                    label="Search Cases"
                    placeholder="Search by Case ID, Patient Name, Doctor, or Scan Center..."
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-magnify"
                    clearable
                    hint="Press Enter or wait to search"
                    persistent-hint
                    @click:clear="clearSearch"
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Date Range Row -->
              <v-row class="filter-row">
                <v-col cols="12" md="4" class="d-flex align-start">
                  <v-text-field
                    v-model="filters.startDate"
                    label="Start Date"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar-start"
                    :min="'2005-01-01'"
                    :max="'2025-12-31'"
                    :rules="[rules.required]"
                    hint="YYYY-MM-DD format"
                    class="full-width-input"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-start">
                  <v-text-field
                    v-model="filters.endDate"
                    label="End Date"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar-end"
                    :min="'2005-01-01'"
                    :max="'2025-12-31'"
                    :rules="[rules.required]"
                    hint="YYYY-MM-DD format"
                    class="full-width-input"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4" class="d-flex align-start">
                  <div class="filter-actions-horizontal">
                    <v-btn
                      color="primary"
                      size="large"
                      prepend-icon="mdi-refresh"
                      :loading="loading.report"
                      :disabled="!isDateRangeValid"
                      block
                      @click="fetchReport(true)"
                    >
                      Reload
                    </v-btn>
                    <v-btn
                      color="success"
                      size="large"
                      prepend-icon="mdi-download"
                      variant="outlined"
                      :loading="loading.export"
                      :disabled="!filteredReportData.length"
                      block
                      class="ml-2"
                      @click="exportToCSV"
                    >
                      Export
                    </v-btn>
                  </div>
                </v-col>
              </v-row>

              <!-- Date Range Validation Message -->
              <v-alert
                v-if="!isDateRangeValid && filters.startDate && filters.endDate"
                type="warning"
                density="compact"
                variant="tonal"
                class="mt-2"
              >
                Invalid date range. Start date must be before end date, and
                range cannot exceed 1 year.
              </v-alert>

              <!-- Pagination Info -->

              <!-- Single Page Info -->
              <v-alert
                v-if="reportData.length > 0 && pagination.totalPages === 1"
                type="success"
                density="compact"
                variant="tonal"
                icon="mdi-check-circle"
                class="mt-2"
              >
                <span class="font-weight-medium">All data loaded:</span>
                Showing all {{ pagination.total }} records in this date range.
                <span v-if="pagination.total >= filters.limit" class="ml-2">
                  💡 Tip: Expand your date range or reduce items per page to see
                  pagination in action.
                </span>
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading Progress (minimal UI for performance) -->
      <v-row v-if="loading.report && reportData.length === 0">
        <v-col cols="12">
          <v-progress-linear
            indeterminate
            color="primary"
            height="3"
          ></v-progress-linear>
        </v-col>
      </v-row>

      <!-- Order Statistics Skeleton Loader -->
      <v-row v-if="loading.summary" class="summary-cards">
        <v-col v-for="i in 6" :key="i" cols="12" md="2" sm="4">
          <v-card elevation="2" class="summary-card">
            <v-card-text class="text-center py-4">
              <v-skeleton-loader
                type="avatar"
                class="mb-2 mx-auto"
                width="48"
              ></v-skeleton-loader>
              <v-skeleton-loader
                type="heading"
                class="mb-2"
              ></v-skeleton-loader>
              <v-skeleton-loader type="text"></v-skeleton-loader>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Order Statistics - 5 Cards Per Row -->
      <v-row v-if="summary && !loading.summary" class="summary-cards five-col-row">
        <!-- Row 1: Total Orders + 4 Payment Status Cards -->
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'all' }" hover @click="filterByOrderType('all')">
            <div class="card-top-bar" style="background:#1976d2"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#1976d2" class="mb-2">mdi-cart</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#1976d2">{{ formatNumber(summary.totalOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">Total Orders</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'free' }" hover @click="filterByOrderType('free')">
            <div class="card-top-bar" style="background:#43a047"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#43a047" class="mb-2">mdi-gift</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#43a047">{{ formatNumber(summary.freeOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">Free Orders</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'fullyPrepaid' }" hover @click="filterByOrderType('fullyPrepaid')">
            <div class="card-top-bar" style="background:#1565c0"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#1565c0" class="mb-2">mdi-ticket-confirmation</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#1565c0">{{ formatNumber(summary.fullyPrepaidOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">Fully Prepaid</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'fullyPostpaid' }" hover @click="filterByOrderType('fullyPostpaid')">
            <div class="card-top-bar" style="background:#e53935"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#e53935" class="mb-2">mdi-cash-clock</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#e53935">{{ formatNumber(summary.fullyPostpaidOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">Fully Postpaid</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'partiallyPostpaid' }" hover @click="filterByOrderType('partiallyPostpaid')">
            <div class="card-top-bar" style="background:#8e24aa"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#8e24aa" class="mb-2">mdi-cash-multiple</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#8e24aa">{{ formatNumber(summary.partiallyPostpaidOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">Partially Postpaid</div>
            </v-card-text>
          </v-card>
        </v-col>
        
        <!-- Row 2: Vouchers Used + 4 Workflow Status Cards (All Clickable) -->
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'vouchers' }" hover @click="filterByOrderType('vouchers')">
            <div class="card-top-bar" style="background:#00bcd4"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#00bcd4" class="mb-2">mdi-ticket-percent-outline</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#00bcd4">{{ formatNumber(vouchersUsedCount) }}</div>
              <div class="text-caption text-medium-emphasis">Vouchers Used</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'rush' }" hover @click="filterByOrderType('rush')">
            <div class="card-top-bar" style="background:#e65100"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#e65100" class="mb-2">mdi-fire</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#e65100">{{ formatNumber(summary.rushOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">Rush Orders</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'onHold' }" hover @click="filterByOrderType('onHold')">
            <div class="card-top-bar" style="background:#f44336"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#f44336" class="mb-2">mdi-pause-circle</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#f44336">{{ formatNumber(summary.onHoldOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">On Hold Orders</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'confirmed' }" hover @click="filterByOrderType('confirmed')">
            <div class="card-top-bar" style="background:#616161"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#616161" class="mb-2">mdi-check-circle</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#616161">{{ formatNumber(summary.confirmedOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">Confirmed Orders</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'active' }" hover @click="filterByOrderType('active')">
            <div class="card-top-bar" style="background:#43a047"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#43a047" class="mb-2">mdi-play-circle</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#43a047">{{ formatNumber(summary.activeOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">Active Orders</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Data Table -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="2">
            <v-card-title class="d-flex justify-space-between align-center">
              <div>
                <v-icon class="mr-2">mdi-table</v-icon>
                Report Data
                <v-chip
                  v-if="searchQuery"
                  color="orange"
                  size="small"
                  class="ml-2"
                >
                  Search: "{{ searchQuery }}"
                </v-chip>
              </div>
              <div class="d-flex align-center gap-2">
                <v-chip
                  v-if="pagination.total"
                  color="primary"
                  variant="outlined"
                >
                  {{ pagination.total }}
                  {{ searchQuery ? "matching" : "total" }}
                </v-chip>
              </div>
            </v-card-title>

            <!-- Legend -->
            <div class="payment-legend px-4 py-2">
              <div class="d-flex align-center flex-wrap" style="gap: 24px;">
                <!-- Payment Status Legend -->
                <div class="d-flex align-center flex-wrap" style="gap: 12px;">
                  <span class="text-caption text-medium-emphasis font-weight-bold">Payment:</span>
                  <span class="legend-item">
                    <v-icon size="28" color="#43a047" class="mr-1">mdi-gift</v-icon>
                    <span class="text-caption">Free</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="28" color="#1565c0" class="mr-1">mdi-ticket-confirmation</v-icon>
                    <span class="text-caption">Fully Prepaid</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="28" color="#e53935" class="mr-1">mdi-cash-clock</v-icon>
                    <span class="text-caption">Fully Postpaid</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="28" color="#8e24aa" class="mr-1">mdi-cash-multiple</v-icon>
                    <span class="text-caption">Partially Postpaid</span>
                  </span>
                </div>
                
                <!-- Workflow Status Legend -->
                <div class="d-flex align-center flex-wrap" style="gap: 12px;">
                  <span class="text-caption text-medium-emphasis font-weight-bold">Workflow:</span>
                  <span class="legend-item">
                    <v-icon size="small" color="orange" class="mr-1">mdi-fire</v-icon>
                    <span class="text-caption">Rush</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="small" color="red" class="mr-1">mdi-pause-circle</v-icon>
                    <span class="text-caption">On Hold</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="small" color="grey-darken-2" class="mr-1">mdi-check-circle</v-icon>
                    <span class="text-caption">Confirmed</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="small" color="green" class="mr-1">mdi-play-circle</v-icon>
                    <span class="text-caption">Active</span>
                  </span>
                </div>
              </div>
            </div>

            <v-data-table-server
              :headers="tableHeaders"
              :items="filteredReportData"
              :loading="loading.report"
              loading-text="Loading... Please wait"
              :items-length="pagination.total"
              :items-per-page="50"
              :items-per-page-options="[25, 50, 100]"
              class="elevation-1 enhanced-table payment-status-table"
              density="compact"
              hover
              fixed-header
              height="2200"
              show-current-page
              :mobile-breakpoint="0"
              show-expand
              v-model:expanded="expanded"
              item-value="orderSGID"
              color="orange"
              @update:options="loadItems"
              @update:expanded="handleExpandedChange"
            >
              <!-- No Data State -->
              <template #no-data>
                <div class="text-center py-8">
                  <!-- Search returned no results -->
                  <template v-if="searchQuery">
                    <v-icon size="64" color="orange">mdi-magnify-close</v-icon>
                    <p class="text-h6 mt-4">No Results Found</p>
                    <p class="text-body-2 text-medium-emphasis mb-2">
                      No cases match your search:
                      <strong>"{{ searchQuery }}"</strong>
                    </p>
                    <p class="text-caption text-medium-emphasis mb-4">
                      Try a different search term or adjust the date range.
                    </p>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-close"
                      @click="clearSearch"
                    >
                      Clear Search
                    </v-btn>
                  </template>

                  <!-- No data loaded at all -->
                  <template v-else>
                    <v-icon size="64" color="grey">mdi-file-search</v-icon>
                    <p class="text-h6 mt-4">No Data Available</p>
                    <p class="text-body-2 text-medium-emphasis">
                      Select a date range and click "Reload" to view data.
                    </p>
                  </template>
                </div>
              </template>

              <!-- Custom Column Templates -->
              <template
                v-for="header in tableHeaders"
                :key="header.value"
                #[`header.${header.value}`]="slotProps"
              >
                <div
                  style="
                    white-space: normal;
                    word-break: break-word;
                    font-weight: 600;
                  "
                >
                  <v-tooltip
                    v-if="
                      slotProps.header.key === 'designer' ||
                      slotProps.header.key === 'hasExtraction'
                    "
                    :text="getHeaderTooltip(slotProps.header.key)"
                  >
                    <template #activator="{ props }">
                      <span v-bind="props">{{ slotProps.header.title }}</span>
                    </template>
                  </v-tooltip>
                  <span v-else>{{ slotProps.header.title }}</span>
                </div>
              </template>
              <!-- Scan Center Column with Icon -->
              <template #[`item.scanCenterFullName`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-2" color="info"
                    >mdi-hospital-building</v-icon
                  >
                  <a
                    v-if="item.scanCenterFullName && item.scanCenterFullName !== 'Not Specified'"
                    href="javascript:void(0)"
                    class="order-id-link"
                    @click.prevent="() => {}"
                  >
                    {{ item.scanCenterFullName }}
                  </a>
                  <span v-else class="text-body-2">{{ item.scanCenterFullName || 'Not Specified' }}</span>
                </div>
              </template>

              <!-- Doctor Column with Icon -->
              <template #[`item.doctorFullName`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-2" color="primary"
                    >mdi-doctor</v-icon
                  >
                  <a
                    v-if="item.doctorFullName && item.doctorFullName !== 'Not Specified'"
                    href="javascript:void(0)"
                    class="order-id-link"
                    @click.prevent="() => {}"
                  >
                    {{ item.doctorFullName }}
                  </a>
                  <span v-else class="text-body-2">{{ item.doctorFullName || 'Not Specified' }}</span>
                </div>
              </template>

              <!-- Patient Column -->
              <template #[`item.patientName`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon size="small" class="mr-2" color="purple"
                    >mdi-account</v-icon
                  >
                  <a
                    v-if="item.patientName && item.patientName !== 'Not Specified'"
                    href="javascript:void(0)"
                    class="order-id-link"
                    @click.prevent="() => {}"
                  >
                    {{ item.patientName }}
                  </a>
                  <span v-else class="text-body-2">{{ item.patientName || 'Not Specified' }}</span>
                </div>
              </template>

              <!-- Order ID Column - Payment Icon + ID + Workflow Icon -->
              <template #[`item.orderSGID`]="{ item }">
                <div class="d-flex align-center" style="gap: 12px;">
                  <v-tooltip location="top">
                    <template #activator="{ props }">
                      <v-icon
                        v-bind="props"
                        size="28"
                        :color="getPaymentStatusColor(item)"
                        class="payment-status-icon"
                      >
                        {{ getPaymentStatusIcon(item) }}
                      </v-icon>
                    </template>
                    <span>{{ getPaymentStatusLabel(item) }}</span>
                  </v-tooltip>
                  <a
                    href="javascript:void(0)"
                    class="order-id-link"
                    @click.prevent="() => {}"
                  >
                    #{{ item.orderSGID }}
                  </a>
                  <v-icon
                    v-if="getWorkflowIcon(item)"
                    size="30"
                    :color="getWorkflowIconColor(item)"
                    class="workflow-status-icon"
                  >
                    {{ getWorkflowIcon(item) }}
                  </v-icon>
                </div>
              </template>

              <!-- Cost Column with Currency -->
              <template #[`item.cost`]="{ item }">
                <v-chip
                  class="font-weight-bold"
                  :color="formatCurrency(item.cost) === 'Free' ? 'primary' : 'success'"
                  size="small"
                  variant="flat"
                >
                  {{ formatCurrency(item.cost) }}
                </v-chip>
              </template>

              <!-- Type Column with Color Mapping -->
              <template #[`item.typeLabel`]="{ item }">
                <v-chip
                  :color="getTypeColor(item.typeLabel)"
                  :theme="shouldUseWhiteText(item.typeLabel) ? 'dark' : 'light'"
                  size="small"
                  variant="flat"
                >
                  {{ item.typeLabel }}
                </v-chip>
              </template>

              <!-- Created Time Column -->
              <template #[`item.createdTime`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon size="x-small" class="mr-1" color="grey"
                    >mdi-calendar</v-icon
                  >
                  <span class="text-body-2">{{ item.createdTime }}</span>
                </div>
              </template>

              <!-- Status Column with Background Color Logic -->
              <template #[`item.status`]="{ item }">
                <v-chip
                  :style="{ backgroundColor: getStatusBgColor(item) }"
                  size="small"
                  variant="flat"
                >
                  {{ getStatusLabel(item) }}
                </v-chip>
              </template>

              <!-- Expanded Row Content -->
              <template #expanded-row="{ columns, item }">
                <tr>
                  <td :colspan="columns.length" class="pa-0">
                    <v-card flat class="expanded-row-card">
                      <v-card-text>
                        <v-row>
                          <!-- Left Column -->
                          <v-col cols="12" md="6">
                            <v-list density="compact" class="bg-transparent">
                              <v-list-subheader
                                class="text-orange font-weight-bold"
                              >
                                <v-icon class="mr-2" color="orange"
                                  >mdi-information</v-icon
                                >
                                Case Details
                              </v-list-subheader>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="primary"
                                    >mdi-identifier</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Case ID</v-list-item-title
                                >
                                <v-list-item-subtitle
                                  class="text-body-2 font-weight-bold"
                                >
                                  <a
                                    href="javascript:void(0)"
                                    class="order-id-link"
                                    @click.prevent="() => {}"
                                  >
                                    #{{ item.orderSGID }}
                                  </a>
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="info"
                                    >mdi-hospital-building</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Scan Center</v-list-item-title
                                >
                                <v-list-item-subtitle class="text-body-2">
                                  <a
                                    v-if="item.scanCenterFullName && item.scanCenterFullName !== 'Not Specified'"
                                    href="javascript:void(0)"
                                    class="order-id-link"
                                    @click.prevent="() => {}"
                                  >
                                    {{ item.scanCenterFullName }}
                                  </a>
                                  <span v-else>{{ item.scanCenterFullName || 'Not Specified' }}</span>
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="success"
                                    >mdi-doctor</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Doctor</v-list-item-title
                                >
                                <v-list-item-subtitle class="text-body-2">
                                  <a
                                    v-if="item.doctorFullName && item.doctorFullName !== 'Not Specified'"
                                    href="javascript:void(0)"
                                    class="order-id-link"
                                    @click.prevent="() => {}"
                                  >
                                    {{ item.doctorFullName }}
                                  </a>
                                  <span v-else>{{ item.doctorFullName || 'Not Specified' }}</span>
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="purple"
                                    >mdi-account</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Patient</v-list-item-title
                                >
                                <v-list-item-subtitle class="text-body-2">
                                  <a
                                    v-if="item.patientName && item.patientName !== 'Not Specified'"
                                    href="javascript:void(0)"
                                    class="order-id-link"
                                    @click.prevent="() => {}"
                                  >
                                    {{ item.patientName }}
                                  </a>
                                  <span v-else>{{ item.patientName || 'Not Specified' }}</span>
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="green"
                                    >mdi-currency-usd</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Cost</v-list-item-title
                                >
                                <v-list-item-subtitle
                                  class="text-h6 text-success font-weight-bold"
                                >
                                  {{ formatCurrency(item.cost) }}
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="orange"
                                    >mdi-shape</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Type</v-list-item-title
                                >
                                <v-list-item-subtitle>
                                  <v-chip
                                    :color="getTypeColor(item.typeLabel)"
                                    :theme="
                                      shouldUseWhiteText(item.typeLabel)
                                        ? 'dark'
                                        : 'light'
                                    "
                                    size="small"
                                    variant="flat"
                                  >
                                    {{ item.typeLabel }}
                                  </v-chip>
                                </v-list-item-subtitle>
                              </v-list-item>
                            </v-list>
                          </v-col>

                          <!-- Right Column -->
                          <v-col cols="12" md="6">
                            <v-list density="compact" class="bg-transparent">
                              <v-list-subheader
                                class="text-orange font-weight-bold"
                              >
                                <v-icon class="mr-2" color="orange"
                                  >mdi-clock-outline</v-icon
                                >
                                Timeline & Details
                              </v-list-subheader>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="blue"
                                    >mdi-calendar-plus</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Created</v-list-item-title
                                >
                                <v-list-item-subtitle class="text-body-2">
                                  {{ item.createdTime }}
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="indigo"
                                    >mdi-pencil-ruler</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Designed</v-list-item-title
                                >
                                <v-list-item-subtitle class="text-body-2">
                                  {{ item.designTime }}
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="teal"
                                    >mdi-cash-check</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Charged</v-list-item-title
                                >
                                <v-list-item-subtitle class="text-body-2">
                                  {{ item.chargeTime }}
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="pink"
                                    >mdi-account-hard-hat</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Designer</v-list-item-title
                                >
                                <v-list-item-subtitle class="text-body-2">
                                  {{ item.designer }}
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="red"
                                    >mdi-tooth</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Extraction</v-list-item-title
                                >
                                <v-list-item-subtitle>
                                  <v-chip
                                    :color="
                                      item.extracted === 'Yes'
                                        ? 'success'
                                        : 'default'
                                    "
                                    size="x-small"
                                  >
                                    {{ item.extracted }}
                                  </v-chip>
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="brown"
                                    >mdi-bone</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Bone Reduction</v-list-item-title
                                >
                                <v-list-item-subtitle>
                                  <v-chip
                                    :color="
                                      item.boneReduction === 'Yes'
                                        ? 'success'
                                        : 'default'
                                    "
                                    size="x-small"
                                  >
                                    {{ item.boneReduction }}
                                  </v-chip>
                                </v-list-item-subtitle>
                              </v-list-item>

                              <v-list-item>
                                <template #prepend>
                                  <v-icon size="small" color="cyan"
                                    >mdi-medical-bag</v-icon
                                  >
                                </template>
                                <v-list-item-title
                                  class="text-caption text-medium-emphasis"
                                  >Support Type</v-list-item-title
                                >
                                <v-list-item-subtitle class="text-body-2">
                                  {{ getSupportTypeLabel(item.typeOfSupport) }}
                                </v-list-item-subtitle>
                              </v-list-item>
                            </v-list>
                          </v-col>
                        </v-row>

                        <!-- Payment & Voucher Details Section -->
                        <v-divider class="my-4"></v-divider>
                        <v-row>
                          <v-col cols="12">
                            <v-list density="compact" class="bg-transparent">
                              <v-list-subheader
                                class="text-orange font-weight-bold"
                              >
                                <v-icon class="mr-2" color="orange"
                                  >mdi-cash-multiple</v-icon
                                >
                                Payment Information
                              </v-list-subheader>

                              <v-row class="px-4">
                                <v-col cols="12" md="4">
                                  <v-list-item>
                                    <template #prepend>
                                      <v-icon size="small" color="green"
                                        >mdi-currency-usd</v-icon
                                      >
                                    </template>
                                    <v-list-item-title
                                      class="text-caption text-medium-emphasis"
                                      >Total Cost</v-list-item-title
                                    >
                                    <v-list-item-subtitle
                                      class="text-h6 text-success font-weight-bold"
                                    >
                                      ${{
                                        parseFloat(item.cost || 0).toFixed(2)
                                      }}
                                    </v-list-item-subtitle>
                                  </v-list-item>
                                </v-col>

                                <v-col cols="12" md="4">
                                  <v-list-item>
                                    <template #prepend>
                                      <v-icon size="small" color="blue"
                                        >mdi-ticket-percent</v-icon
                                      >
                                    </template>
                                    <v-list-item-title
                                      class="text-caption text-medium-emphasis"
                                      >Voucher Payment</v-list-item-title
                                    >
                                    <v-list-item-subtitle
                                      class="text-h6 font-weight-bold"
                                      :class="
                                        item.amountPaid > 0
                                          ? 'text-primary'
                                          : 'text-medium-emphasis'
                                      "
                                    >
                                      ${{
                                        parseFloat(
                                          item.amountPaid || 0,
                                        ).toFixed(2)
                                      }}
                                    </v-list-item-subtitle>
                                  </v-list-item>
                                </v-col>

                                <v-col cols="12" md="4">
                                  <v-list-item>
                                    <template #prepend>
                                      <v-icon
                                        size="small"
                                        :color="getRemainingBalanceColor(item)"
                                        >mdi-cash-minus</v-icon
                                      >
                                    </template>
                                    <v-list-item-title
                                      class="text-caption text-medium-emphasis"
                                      >Remaining Balance</v-list-item-title
                                    >
                                    <v-list-item-subtitle
                                      class="text-h6 font-weight-bold"
                                      :class="getRemainingBalanceColor(item)"
                                    >
                                      ${{ getRemainingBalance(item) }}
                                    </v-list-item-subtitle>
                                  </v-list-item>
                                </v-col>
                              </v-row>

                              <!-- Payment Status Badge -->
                              <v-row class="px-4 mt-2">
                                <v-col cols="12">
                                  <v-chip
                                    :color="getPaymentStatusColor(item)"
                                    :prepend-icon="getPaymentStatusIcon(item)"
                                    variant="tonal"
                                    size="small"
                                  >
                                    {{ getPaymentStatusLabel(item) }}
                                  </v-chip>
                                </v-col>
                              </v-row>

                              <!-- Voucher Details (if vouchers exist) -->
                              <v-row
                                v-if="item.vouchers && item.vouchers.length > 0"
                                class="px-4 mt-4"
                              >
                                <v-col cols="12">
                                  <v-expansion-panels>
                                    <v-expansion-panel>
                                      <v-expansion-panel-title>
                                        <template #default>
                                          <v-row no-gutters align="center">
                                            <v-col cols="auto">
                                              <v-icon
                                                class="mr-2"
                                                color="primary"
                                                >mdi-ticket-account</v-icon
                                              >
                                            </v-col>
                                            <v-col>
                                              <span
                                                class="font-weight-bold text-primary"
                                              >
                                                Voucher Details ({{
                                                  item.vouchers.length
                                                }}
                                                {{
                                                  item.vouchers.length === 1
                                                    ? "voucher"
                                                    : "vouchers"
                                                }})
                                              </span>
                                            </v-col>
                                          </v-row>
                                        </template>
                                      </v-expansion-panel-title>
                                      <v-expansion-panel-text>
                                        <v-list
                                          density="compact"
                                          class="bg-grey-lighten-5 rounded"
                                        >
                                          <v-list-item
                                            v-for="(
                                              voucher, index
                                            ) in item.vouchers"
                                            :key="index"
                                            class="my-1"
                                          >
                                            <template #prepend>
                                              <v-avatar
                                                color="primary"
                                                size="32"
                                              >
                                                <v-icon size="small"
                                                  >mdi-ticket</v-icon
                                                >
                                              </v-avatar>
                                            </template>
                                            <v-list-item-title
                                              class="font-weight-bold"
                                            >
                                              Voucher ID: 
                                              <a
                                                href="javascript:void(0)"
                                                class="order-id-link"
                                                @click.prevent="() => {}"
                                              >
                                                #{{ voucher.id }}
                                              </a>
                                            </v-list-item-title>
                                            <v-list-item-subtitle
                                              class="text-success font-weight-bold text-h6"
                                            >
                                              ${{ voucher.amount.toFixed(2) }}
                                            </v-list-item-subtitle>
                                          </v-list-item>

                                          <!-- Total -->
                                          <v-divider class="my-2"></v-divider>
                                          <v-list-item
                                            class="bg-primary-lighten-5"
                                          >
                                            <template #prepend>
                                              <v-icon color="primary"
                                                >mdi-sigma</v-icon
                                              >
                                            </template>
                                            <v-list-item-title
                                              class="font-weight-bold"
                                            >
                                              Total Voucher Amount
                                            </v-list-item-title>
                                            <v-list-item-subtitle
                                              class="text-primary font-weight-bold text-h6"
                                            >
                                              ${{
                                                parseFloat(
                                                  item.amountPaid || 0,
                                                ).toFixed(2)
                                              }}
                                            </v-list-item-subtitle>
                                          </v-list-item>
                                        </v-list>
                                      </v-expansion-panel-text>
                                    </v-expansion-panel>
                                  </v-expansion-panels>
                                </v-col>
                              </v-row>
                            </v-list>
                          </v-col>
                        </v-row>

                        <!-- Workflow Status Section (only show if there's a status) -->
                        <template v-if="item.isRush === 1 || item.Q11_Val_1 || item.Q11_Val_2 || item.Q11_Val_4">
                          <v-divider class="my-4"></v-divider>
                          <v-row>
                            <v-col cols="12">
                              <v-list density="compact" class="bg-transparent">
                                <v-list-subheader
                                  class="text-orange font-weight-bold"
                                >
                                  <v-icon class="mr-2" color="orange"
                                    >mdi-timeline-clock</v-icon
                                  >
                                  Workflow Status
                                </v-list-subheader>

                              <v-row class="px-4">
                                <v-col cols="12">
                                  <v-list-item class="pa-0">
                                    <template #prepend>
                                      <v-icon 
                                        size="40" 
                                        :color="getWorkflowIconColor(item)"
                                        class="workflow-status-icon"
                                      >
                                        {{ getWorkflowIcon(item) }}
                                      </v-icon>
                                    </template>
                                    <v-list-item-title class="text-h6 font-weight-bold mb-1">
                                      {{ getWorkflowStatusLabel(item) }}
                                    </v-list-item-title>
                                    <v-list-item-subtitle class="text-body-2">
                                      <template v-if="item.isRush === 1">
                                        🔥 Priority Rush Order
                                      </template>
                                      <template v-else-if="item.Q11_Val_4">
                                        Status: On Hold
                                      </template>
                                      <template v-else-if="item.Q11_Val_2">
                                        Status: Confirmed
                                      </template>
                                      <template v-else-if="item.Q11_Val_1">
                                        Status: Active
                                      </template>
                                    </v-list-item-subtitle>
                                  </v-list-item>
                                </v-col>
                              </v-row>
                            </v-list>
                          </v-col>
                        </v-row>
                        </template>
                      </v-card-text>
                    </v-card>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Footer with Version -->
    <v-row>
      <v-col cols="12">
        <v-footer class="text-center py-3" elevation="0">
          <v-chip
            size="small"
            variant="outlined"
            prepend-icon="mdi-information"
          >
            Surgical Guide Report v1.0.0
          </v-chip>
        </v-footer>
      </v-col>
    </v-row>

    <!-- Snackbar for notifications -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="bottom"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
// Tooltip helper for key columns
function getHeaderTooltip(key) {
  switch (key) {
    case "designer":
      return "Designer assigned to the case";
    case "hasExtraction":
      return "Indicates if extraction was performed";
    case "extComp_BoneReduction_selected":
      return "Indicates if bone reduction was selected";
    default:
      return "";
  }
}
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useDevModeStore } from "@/stores/devMode";
import api from "@/services/api";

const router = useRouter();
const devModeStore = useDevModeStore();

// =====================================
// STATE
// =====================================

// Track expanded rows - using array to allow Vuetify to control single expansion
const expanded = ref([]);

const accessInfo = reactive({
  hasReportAccess: false,
  hasSwaggerAccess: false,
  userGroups: [],
});

const filters = reactive({
  startDate: "2014-01-01",
  endDate: "2020-12-31",
  page: 1,
  limit: 100,
  sortBy: "date",
  sortOrder: "desc",
});

const searchQuery = ref("");
const reportData = ref([]);
const filteredReportData = ref([]);
const summary = ref(null);
const activeFilter = ref("all"); // Track active filter type

const pagination = reactive({
  page: 1,
  limit: 100,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

const loading = reactive({
  access: true,
  report: false,
  summary: false,
  export: false,
});

const snackbar = reactive({
  show: false,
  message: "",
  color: "success",
});

// =====================================
// COMPUTED
// =====================================

const swaggerUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
  return `${baseUrl}/docs`;
});

const isDateRangeValid = computed(() => {
  if (!filters.startDate || !filters.endDate) return false;
  const start = new Date(filters.startDate);
  const end = new Date(filters.endDate);
  if (start > end) return false;
  return true;
});

const isDevelopment = computed(() => {
  return import.meta.env.DEV;
});

// Workflow status counts computed from reportData
const workflowStatusCounts = computed(() => {
  const data = filteredReportData.value || [];
  return {
    rushOrders: data.filter(item => item.isRush === 1).length,
    onHoldOrders: data.filter(item => item.Q11_Val_4 !== 0 && item.Q11_Val_4 != null).length,
    confirmedOrders: data.filter(item => item.Q11_Val_2 !== 0 && item.Q11_Val_2 != null).length,
    activeOrders: data.filter(item => item.Q11_Val_1 !== 0 && item.Q11_Val_1 != null).length,
  };
});

// Computed property for vouchers used (orders with prepayment/partial prepayment)
const vouchersUsedCount = computed(() => {
  return (summary.value?.fullyPrepaidOrders || 0) + (summary.value?.partiallyPostpaidOrders || 0);
});

// =====================================
// TABLE CONFIGURATION
// =====================================

// Main table headers (compact view - details in expandable row)
const tableHeaders = [
  { title: "", key: "data-table-expand", sortable: false, width: "48px" },
  { title: "ID", key: "orderSGID", sortable: true, width: "140px" },
  {
    title: "Scan Center",
    key: "scanCenterFullName",
    sortable: true,
    width: "180px",
  },
  { title: "Doctor", key: "doctorFullName", sortable: true, width: "180px" },
  { title: "Patient", key: "patientName", sortable: true, width: "180px" },
  {
    title: "Cost",
    key: "cost",
    sortable: true,
    align: "center",
    width: "110px",
  },
  { title: "Type", key: "typeLabel", sortable: true, width: "140px" },
  { title: "Created", key: "createdTime", sortable: true, width: "130px" },
];

const rules = {
  required: (value) => !!value || "Required field",
};

// =====================================
// METHODS
// =====================================

/**
 * Handle expanded row change - ensure only one row is expanded at a time
 */
function handleExpandedChange(newExpanded) {
  // Only keep the last expanded item (most recent)
  if (newExpanded.length > 1) {
    expanded.value = [newExpanded[newExpanded.length - 1]];
  } else {
    expanded.value = newExpanded;
  }
}

/**
 * Navigate to dashboard
 */
function navigateToDashboard() {
  router.push("/dashboard");
}

/**
 * Check user access permissions
 */
async function checkAccess() {
  try {
    loading.access = true;
    const response = await api.get("/api/reports/surgical_guide/access");

    if (response.data.success) {
      const accessData = response.data.data;

      // In development mode, merge with simulated groups
      if (import.meta.env.DEV) {
        const mergedGroups = devModeStore.getMergedGroups(
          accessData.userGroups,
        );

        // Check if merged groups include required groups
        const hasReportAccess =
          devModeStore.adminViewEnabled ||
          mergedGroups.includes("Finance22") ||
          mergedGroups.includes("admin");

        const hasSwaggerAccess =
          devModeStore.adminViewEnabled ||
          mergedGroups.includes("Developers22") ||
          mergedGroups.includes("admin") ||
          mergedGroups.includes("SWD") ||
          mergedGroups.includes("developers");

        Object.assign(accessInfo, {
          hasReportAccess,
          hasSwaggerAccess,
          userGroups: mergedGroups,
        });
      } else {
        Object.assign(accessInfo, accessData);
      }
    }
  } catch (error) {
    showSnackbar("Failed to verify access permissions", "error");
  } finally {
    loading.access = false;
  }
}

/**
 * Fetch main report data (called from manual refresh button)
 */
async function fetchReport() {
  await fetchReportData();
}

/**
 * Internal function to fetch report data
 */
async function fetchReportData() {
  try {
    loading.report = true;
    loading.summary = true;

    const params = {
      startDate: filters.startDate || "1900-01-01",
      endDate: filters.endDate || "2100-01-01",
      page: filters.page,
      limit: Math.min(filters.limit, 50), // Limit to 50 for better performance
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      searchQuery: searchQuery.value || "", // Add search query parameter
      orderTypeFilter: activeFilter.value || "all", // Add order type filter
    };

    // Fetch report data (always paginated) with timeout
    const reportResponse = await Promise.race([
      api.get("/api/reports/surgical_guide", { params }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 15000),
      ),
    ]);

    if (reportResponse.data.success) {
      // Use data directly from backend (already formatted and filtered by search)
      reportData.value = reportResponse.data.data;
      filteredReportData.value = reportResponse.data.data; // Server-side search, no client filtering needed

      // Update pagination from server response
      const serverPagination = reportResponse.data.pagination;
      pagination.page = serverPagination.page;
      pagination.limit = serverPagination.limit;
      pagination.total = serverPagination.total;
      pagination.totalPages = serverPagination.totalPages;
      pagination.hasNextPage = serverPagination.hasNextPage;
      pagination.hasPrevPage = serverPagination.hasPrevPage;
    }

    // Only fetch summary on first page or manual reload
    if (filters.page === 1) {
      const summaryResponse = await api.get(
        "/api/reports/surgical_guide/summary",
        {
          params: { startDate: filters.startDate, endDate: filters.endDate },
        },
      );

      if (summaryResponse.data.success) {
        summary.value = summaryResponse.data.data;
      }
    }

    // Only show success message on manual reload, not on pagination
    if (filters.page === 1) {
      showSnackbar(`Loaded ${reportData.value.length} records`, "success");
    }
  } catch (error) {
    const message =
      error.response?.data?.error?.message || "Failed to load report data";
    showSnackbar(message, "error");
  } finally {
    loading.report = false;
    loading.summary = false;
  }
}

/**
 * Apply search filter to report data (now triggers server-side search)
 */
async function applySearchFilter() {
  // Reset to page 1 when searching
  filters.page = 1;
  // Fetch data with search query from server
  await fetchReportData();
}

/**
 * Clear search and reset filter
 */
async function clearSearch() {
  searchQuery.value = "";
  filters.page = 1;
  await fetchReportData();
}

/**
 * Filter data by order type based on card click (server-side filtering)
 * @param {string} type - Filter type: 'all', 'postpaid', 'fullyPrepaid', 'free', 'fullyPostpaid', 'partiallyPostpaid'
 */
async function filterByOrderType(type) {
  activeFilter.value = type;

  // Reset to page 1 and fetch filtered data from server
  filters.page = 1;
  
  // Note: Backend should handle these new filter types (vouchers, rush, onHold, confirmed, active)
  // If backend doesn't support them yet, they will default to 'all' and show all records
  await fetchReportData();
}

/**
 * Load items based on table options (Vuetify server-side pagination pattern)
 */
async function loadItems({ page, itemsPerPage, sortBy }) {
  // Update filters
  filters.page = page;
  filters.limit = itemsPerPage;

  // Handle sorting
  if (sortBy && sortBy.length > 0) {
    filters.sortBy = sortBy[0].key;
    filters.sortOrder = sortBy[0].order || "asc";
  }

  // Fetch data with updated filters
  await fetchReportData();
}

/**
 * Export report to CSV
 */
async function exportToCSV() {
  try {
    loading.export = true;

    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/reports/surgical_guide/export?${params}`,
      {
        method: "GET",
        credentials: "include", // Include cookies for authentication
      },
    );

    if (!response.ok) {
      throw new Error("Export failed");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;

    // Generate filename in format: OSG_YYYYMMDD.csv
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    a.download = `OSG_${today}.csv`;

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    showSnackbar("Report exported successfully", "success");
  } catch (error) {
    showSnackbar("Failed to export report", "error");
  } finally {
    loading.export = false;
  }
}

/**
 * Format large numbers with K suffix
 */
function formatNumber(value) {
  if (!value && value !== 0) return "0";
  const num = parseFloat(value);
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Format currency values
 */
function formatCurrency(value) {
  if (!value && value !== 0) return "N/A";
  if (parseFloat(value) === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

/**
 * Get support type label from numeric value
 */
function getSupportTypeLabel(typeValue) {
  const typeMap = {
    0: "Teeth",
    1: "Tissue",
    2: "Bone",
  };
  return typeMap[typeValue] || "N/A";
}

/**
 * Get payment status class for bullet indicator
 */
function getPaymentStatusClass(item) {
  const cost = parseFloat(item.cost || 0);
  const amountPaid = parseFloat(item.amountPaid || 0);
  if (cost === 0) return 'bullet-free-order';
  if (amountPaid === 0) return 'bullet-fully-postpaid';
  if (amountPaid >= cost) return 'bullet-fully-prepaid';
  return 'bullet-partially-postpaid';
}

/**
 * Get workflow status icon
 */
function getWorkflowIcon(item) {
  if (item.isRush === 1) return 'mdi-fire';
  if (item.Q11_Val_4 !== 0 && item.Q11_Val_4 != null) return 'mdi-pause-circle';
  if (item.Q11_Val_2 !== 0 && item.Q11_Val_2 != null) return 'mdi-check-circle';
  if (item.Q11_Val_1 !== 0 && item.Q11_Val_1 != null) return 'mdi-play-circle';
  return null;
}

/**
 * Get workflow status icon color
 */
function getWorkflowIconColor(item) {
  if (item.isRush === 1) return 'orange';
  if (item.Q11_Val_4 !== 0 && item.Q11_Val_4 != null) return 'red';
  if (item.Q11_Val_2 !== 0 && item.Q11_Val_2 != null) return 'grey-darken-2';
  if (item.Q11_Val_1 !== 0 && item.Q11_Val_1 != null) return 'green';
  return '';
}

/**
 * Get workflow status label for expanded row
 */
function getWorkflowStatusLabel(item) {
  if (item.isRush === 1) return 'Rush Order';
  if (item.Q11_Val_4 !== 0 && item.Q11_Val_4 != null) return 'On Hold';
  if (item.Q11_Val_2 !== 0 && item.Q11_Val_2 != null) return 'Confirmed';
  if (item.Q11_Val_1 !== 0 && item.Q11_Val_1 != null) return 'Active';
  return 'No Status Set';
}

/**
 * Get workflow status chip color for expanded row
 */
function getWorkflowStatusChipColor(item) {
  if (item.isRush === 1) return 'deep-orange';
  if (item.Q11_Val_4 !== 0 && item.Q11_Val_4 != null) return 'red';
  if (item.Q11_Val_2 !== 0 && item.Q11_Val_2 != null) return 'grey';
  if (item.Q11_Val_1 !== 0 && item.Q11_Val_1 != null) return 'green';
  return 'default';
}

/**
 * Calculate remaining balance (Cost - Amount Paid)
 */
function getRemainingBalance(item) {
  const cost = parseFloat(item.cost || 0);
  const amountPaid = parseFloat(item.amountPaid || 0);
  return (cost - amountPaid).toFixed(2);
}

/**
 * Get color for remaining balance
 */
function getRemainingBalanceColor(item) {
  const remaining = parseFloat(getRemainingBalance(item));
  if (remaining === 0) return "text-success";
  if (remaining > 0) return "text-warning";
  return "text-error"; // Overpaid (shouldn't happen but handle it)
}

/**
 * Get payment status label
 */
function getPaymentStatusLabel(item) {
  const cost = parseFloat(item.cost || 0);
  const amountPaid = parseFloat(item.amountPaid || 0);

  if (cost === 0) return "Free Order";
  if (amountPaid === 0) return "Fully Postpaid (No Voucher)";
  if (amountPaid >= cost) return "Fully Prepaid (Voucher)";
  return "Partially Postpaid (Partial Voucher)";
}

/**
 * Get payment status color
 */
function getPaymentStatusColor(item) {
  const cost = parseFloat(item.cost || 0);
  const amountPaid = parseFloat(item.amountPaid || 0);

  // Distinct colors for payment status
  if (cost === 0) return "#43a047"; // Free - Green
  if (amountPaid === 0) return "#e53935"; // Fully Postpaid - Red
  if (amountPaid >= cost) return "#1565c0"; // Fully Prepaid - Deep Blue
  return "#8e24aa"; // Partially Postpaid - Purple
}

/**
 * Get payment status icon
 */
function getPaymentStatusIcon(item) {
  const cost = parseFloat(item.cost || 0);
  const amountPaid = parseFloat(item.amountPaid || 0);

  if (cost === 0) return "mdi-gift";
  if (amountPaid === 0) return "mdi-cash-clock";
  if (amountPaid >= cost) return "mdi-ticket-confirmation";
  return "mdi-cash-multiple";
}

/**
 * Show snackbar notification
 */
function showSnackbar(message, color = "success") {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
}

/**
 * Get color for Type column
 */
function getTypeColor(typeLabel) {
  const colorMap = {
    Simplant: "grey-lighten-2", // Type 0: default/grey
    coDiagnostiX: "orange", // Type 3: orange
    BSB: "green", // Type 4: green
    "Real Guide": "orange", // Type 6: orange
    "Implant Studio": "orange", // Type 7: orange
    "Not Specified": "red", // Default: red
  };
  return colorMap[typeLabel] || "red";
}

/**
 * Check if type chip should use dark text
 */
function shouldUseWhiteText(typeLabel) {
  // BSB (green) and Not Specified (red) need white text
  return typeLabel === "BSB" || typeLabel === "Not Specified";
}

/**
 * Get status label based on Q11_Val_* logic
 */
function getStatusLabel(item) {
  const Q11_max = item.Q11_max;
  if (item.Q11_Val_5 > Q11_max) return "QC+Shipping";
  if (item.Q11_Val_2 > Q11_max) return "Confirmed by OEM";
  if (item.Q11_Val_4 > Q11_max) return "On Hold";
  if (item.Q11_Val_3 > Q11_max) return "Multiple";
  if (item.Q11_Val_1 > Q11_max) return "Active";
  if (item.Q11_Val_20 > Q11_max) return "In Process";
  return "Inactive";
}

/**
 * Get background color for status chip
 */
function getStatusBgColor(item) {
  const Q11_max = item.Q11_max;
  if (item.Q11_Val_2 > Q11_max) return "#BDBDBD"; // Confirmed by OEM (Grey)
  if (item.Q11_Val_4 > Q11_max) return "#F5A9A9"; // On Hold (Light Red)
  if (item.Q11_Val_3 > Q11_max) return "#F9B7FF"; // Multiple (Pink/Purple)
  if (item.Q11_Val_1 > Q11_max) return "";
  if (item.Q11_Val_5 > Q11_max) return "";
  if (item.Q11_Val_20 > Q11_max) return "";
  return "#A9F5A9"; // Inactive (Green)
}

// =====================================
// WATCHERS
// =====================================

/**
 * Watch search query with debounce
 */
let searchTimeout;
watch(searchQuery, () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applySearchFilter();
  }, 300); // 300ms debounce
});

// =====================================
// LIFECYCLE
// =====================================

onMounted(async () => {
  // Fast initial render - defer non-critical work
  await checkAccess();

  // Use requestIdleCallback to defer heavy operations
  if ("requestIdleCallback" in window) {
    requestIdleCallback(() => {
      // The v-data-table will automatically call loadItems when it mounts
    });
  }

  // The v-data-table will automatically call loadItems when it mounts
  // and has access to render
});
</script>

<style scoped>
/* Performance Optimizations - Fix CLS & LCP */
.header-container {
  min-height: 80px; /* Reserve space to prevent layout shift */
}

.header-title {
  font-size: 2rem;
  line-height: 2.5rem;
  min-height: 2.5rem;
  will-change: auto; /* Remove expensive will-change */
}

.header-subtitle {
  font-size: 1rem;
  line-height: 1.5rem;
  min-height: 1.5rem;
  contain: layout style; /* Isolate layout calculations */
  font-display: swap; /* Optimize font loading */
}

/* Prevent layout shifts from cards */
.v-card {
  contain: layout style paint;
}

/* Reserve space for summary cards to prevent CLS */
.summary-cards {
  min-height: 160px;
}

.summary-card {
  height: 100%;
  min-height: 110px;
  contain: layout style paint;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: white !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.card-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  width: 100%;
}

.primary-bar { background: rgb(var(--v-theme-primary)); }
.success-bar { background: rgb(var(--v-theme-success)); }
.info-bar { background: rgb(var(--v-theme-info)); }
.warning-bar { background: #ff9800; }
.amber-bar { background: #ffa726; }
.orange-bar { background: #e65100; }
.error-bar { background: rgb(var(--v-theme-error)); }
.grey-bar { background: #616161; }
.success-alt-bar { background: rgb(var(--v-theme-success)); }

.summary-card .v-card-text {
  min-height: 106px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding-top: 16px !important;
}

.summary-card .v-icon {
  opacity: 0.9;
}

.summary-card .text-h5 {
  font-size: 1.75rem !important;
  line-height: 1.2;
  margin: 8px 0 4px 0;
}

.summary-card .text-caption {
  font-size: 0.75rem !important;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  font-weight: 500;
}

/* Optimize table rendering */
.enhanced-table {
  contain: layout style paint;
  content-visibility: auto; /* Lazy render off-screen content */
}

/* Optimize initial page load - reduce blocking */
.surgical-guide-report {
  content-visibility: auto;
  contain-intrinsic-size: auto 1000px;
}

/* Optimize icon rendering */
.v-icon {
  will-change: auto;
  transform: translateZ(0); /* GPU acceleration */
}

/* Reduce paint operations */
.v-btn {
  will-change: auto;
}

/* Optimize card animations */
.v-card {
  backface-visibility: hidden;
  transform: translateZ(0);
}

/* Expandable Row Styles */
/* Expandable Row Styles */
.expanded-row-card {
  background: linear-gradient(135deg, #fff9f5 0%, #ffffff 100%);
  border-left: 4px solid #ff6b35;
  margin: 8px 0;
}

/* Dark mode support for expanded row */
.v-theme--dark .expanded-row-card {
  background: #181a20 !important;
  color: #f5f6fa !important;
}

.v-theme--dark .expanded-row-card .v-list,
.v-theme--dark .expanded-row-card .v-list.bg-transparent,
.v-theme--dark .expanded-row-card .v-list-item,
.v-theme--dark .expanded-row-card .v-list-item__underlay,
.v-theme--dark .expanded-row-card .v-list-item__content,
.v-theme--dark .expanded-row-card .v-list-item-title,
.v-theme--dark .expanded-row-card .v-list-item-subtitle,
.v-theme--dark .expanded-row-card .v-list-subheader,
.v-theme--dark .expanded-row-card .v-list-subheader__text {
  background: #181a20 !important;
  color: #f5f6fa !important;
}

@keyframes expanded-row-glow {
  0% {
    box-shadow: 0 0 0 0 var(--v-theme-primary, #347cac), 0 0 0 0 rgba(52,124,172,0.0);
  }
  60% {
    box-shadow: 0 0 0 4px var(--v-theme-primary, #347cac), 0 8px 32px 0 rgba(52,124,172,0.18);
  }
  100% {
    box-shadow: 0 0 0 2px var(--v-theme-primary, #347cac), 0 4px 24px 0 rgba(52,124,172,0.15);
  }
}

.expanded-row-card .v-list-item {
  padding: 4px 8px;
  min-height: 40px;
}

.expanded-row-card .v-list-item-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.expanded-row-card .v-list-item-subtitle {
  margin-top: 2px;
  font-size: 0.875rem;
}

.expanded-row-card .v-list-subheader {
  font-size: 0.9rem;
  padding: 8px 8px;
  margin-bottom: 4px;
  border-bottom: 2px solid #ff6b35;
}

/* Expand icon color */
.enhanced-table :deep(.v-data-table__expand-icon) {
  color: #ff6b35 !important;
}

/* Hover effect on expandable rows */
.enhanced-table :deep(tr:hover .v-data-table__expand-icon) {
  transform: scale(1.2);
  transition: transform 0.2s ease;
}

.filter-row {
  display: flex;
  align-items: flex-start;
}
.full-width-input {
  width: 100%;
}
.filter-actions-horizontal {
  display: flex;
  flex-direction: row;
  gap: 12px;
  align-items: center;
  width: 100%;
}
.filter-actions-horizontal .v-btn {
  flex: 1 1 0;
  min-width: 120px;
}
@media (max-width: 600px) {
  .filter-actions-horizontal {
    flex-direction: column;
    gap: 8px;
  }
  .filter-actions-horizontal .v-btn {
    width: 100%;
    min-width: unset;
  }
}

/* Workflow icon animation */
.workflow-status-icon {
  display: inline-block !important;
  animation: workflow-icon-pulse 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite !important;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
@keyframes workflow-icon-pulse {
  0% {
    transform: scale(1) rotate(0deg);
  }
  20% {
    transform: scale(1.12) rotate(-4deg);
  }
  40% {
    transform: scale(1) rotate(2deg);
  }
  60% {
    transform: scale(1.08) rotate(-2deg);
  }
  80% {
    transform: scale(1) rotate(0deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
</style>

<style scoped>
.enhanced-table .v-data-table__wrapper {
  background: #fafbfc;
  transform: translateZ(0); /* GPU acceleration */
  will-change: scroll-position;
}
/* Table header styling with orange brand color */
.enhanced-table :deep(.v-data-table__th),
.enhanced-table .v-data-table__th,
.enhanced-table :deep(thead th),
.enhanced-table thead th {
  position: sticky;
  top: 0;
  background: #ffa100 !important; /* Brand orange background */
  z-index: 2;
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff !important; /* White text */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 3px solid #ff8c00;
  padding: 12px 10px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  contain: layout style paint; /* Performance isolation */
}

.enhanced-table :deep(.v-data-table__th:hover),
.enhanced-table .v-data-table__th:hover,
.enhanced-table :deep(thead th:hover),
.enhanced-table thead th:hover {
  background: #ff8c00 !important;
  color: #ffffff !important;
}
.enhanced-table .v-data-table__tr {
  contain: layout style; /* Isolate row rendering */
}

/* Workflow status indicated by icons only - no background colors */

/* Payment Status Bullet Indicator - Clean & Professional */
.payment-status-bullet {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  cursor: help;
  transition: transform 0.2s ease;
}

.payment-status-bullet:hover {
  transform: scale(1.2);
}

.bullet-free-order {
  background-color: #4caf50; /* Green - Free */
}

.bullet-fully-prepaid {
  background-color: #2196f3; /* Blue - Fully Prepaid */
}

.bullet-fully-postpaid {
  background-color: #ff9800; /* Orange - Fully Postpaid */
}

.bullet-partially-postpaid {
  background-color: #ffc107; /* Amber - Partially Postpaid */
}

/* Payment Status Legend */
.payment-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  background-color: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  flex-wrap: wrap;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.v-theme--dark .payment-legend {
  background-color: rgba(255, 255, 255, 0.05);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

/* No row background colors for payment status - using bullets instead for cleaner look */

/* Default alternating row colors - clean and simple */
.enhanced-table .v-data-table__tr:nth-child(even) {
  background: #f5f5f5;
}
.enhanced-table .v-data-table__tr:nth-child(odd) {
  background: #ffffff;
}

.enhanced-table .v-data-table__td {
  font-size: 0.98rem;
  padding: 10px 8px;
}
</style>

<style scoped>
.surgical-guide-report {
  max-width: 100%;
  width: 100%;
  padding: 0 16px;
}

/* Make container fluid take full width */
:deep(.v-container) {
  max-width: 100% !important;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .surgical-guide-report {
    padding: 0 8px;
  }

  .text-h4 {
    font-size: 1.5rem !important;
  }

  .v-card-title {
    font-size: 1.1rem !important;
  }
}


/* Table row hover effect */
.v-data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}

/* Dark mode support */
.v-theme--dark .v-data-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* No dark mode payment status row colors - using bullets instead for cleaner look */

/* Glow effect for expanded/selected row in table */

/* Summary card clickable styles */
:deep(.v-card.hover) {
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.v-card.hover:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Active filter card styling */
:deep(.v-card.active-filter) {
  box-shadow: 0 6px 16px rgba(255, 161, 0, 0.4) !important;
  transform: translateY(-3px);
  border: 2px solid #ffa100 !important;
}

:deep(.v-card.active-filter .card-top-bar) {
  height: 6px;
  background: #ffa100 !important;
}

.clickable-card {
  cursor: pointer;
}

/* Clickable Order ID styling */
.order-id-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s ease;
}

.order-id-link:hover {
  color: #1565c0;
  text-decoration: none;
}

.v-theme--dark .order-id-link {
  color: #64b5f6;
}

.v-theme--dark .order-id-link:hover {
  color: #90caf9;
  text-decoration: none;
}

/* Force exactly 5 cards per row for statistics cards using a custom flex class */
@media (min-width: 960px) {
  .five-col-row {
    display: flex;
    flex-wrap: wrap;
    margin-left: -8px;
    margin-right: -8px;
  }
  .five-col-row > .v-col {
    flex: 0 0 20%;
    max-width: 20%;
    padding-left: 8px;
    padding-right: 8px;
  }
}

/* Hide all scrollbars */
* {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

*::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

/* Specifically target table and card scrollbars */
.v-data-table,
.v-card,
.v-list,
.expanded-row-card,
.enhanced-table {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.v-data-table::-webkit-scrollbar,
.v-card::-webkit-scrollbar,
.v-list::-webkit-scrollbar,
.expanded-row-card::-webkit-scrollbar,
.enhanced-table::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}
</style>
