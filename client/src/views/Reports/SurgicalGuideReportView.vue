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
              <v-icon style="margin-inline-end:8px;" color="primary">mdi-file-chart</v-icon>
              {{ t('reports.surgicalGuide.title') }}
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis header-subtitle">
              {{ t('reports.surgicalGuide.subtitle') }}
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
            {{ t('reports.surgicalGuide.apiDocs') }}
            <v-icon style="margin-inline-start:8px;">mdi-open-in-new</v-icon>
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
            style="margin-inline-start:8px;"
            @click="openProjectDoc"
          >
            {{ t('reports.surgicalGuide.reportFeatureDoc') }}
            <v-icon style="margin-inline-start:8px;">mdi-open-in-new</v-icon>
          </v-btn>
          <v-alert-title class="text-h6">{{ t('reports.surgicalGuide.accessDenied') }}</v-alert-title>
          <p class="mb-2">
            {{ t('reports.surgicalGuide.noPermission') }}
          </p>
          <p class="text-body-2" v-html="t('reports.surgicalGuide.requiredGroups')"></p>
          <p class="text-caption text-medium-emphasis mt-2">
            {{ t('reports.surgicalGuide.currentGroups') }}
            {{ accessInfo.userGroups.join(', ') || t('reports.surgicalGuide.none') }}
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
            <v-icon style="margin-inline-end:8px;">mdi-developer-board</v-icon>
            {{ t('reports.surgicalGuide.devModeTip') }}
          </v-alert-title>
          <p class="mb-3">
            {{ t('reports.surgicalGuide.devModeInstructions') }}
          </p>
          <ol class="mb-3">
            <li class="mb-2">
              <strong>{{ t('reports.surgicalGuide.devStepDashboard') }}</strong>
            </li>
            <li class="mb-2">
              <strong v-html="t('reports.surgicalGuide.devStepGroupsChip')"></strong>
            </li>
            <li class="mb-2">
              <strong v-html="t('reports.surgicalGuide.devStepFinance22')"></strong>
            </li>
            <li class="mb-2">
              <strong>{{ t('reports.surgicalGuide.devStepReturn') }}</strong>
            </li>
          </ol>
          <p class="text-caption text-medium-emphasis">
            {{ t('reports.surgicalGuide.devStepAdminView') }}
          </p>
          <div class="mt-4">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-view-dashboard"
              size="large"
              @click="navigateToDashboard"
            >
              {{ t('reports.surgicalGuide.goToDashboard') }}
            </v-btn>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Main Report Interface (Finance22 only) -->
    <template v-if="accessInfo.hasReportAccess">
      <!-- Date Range Filters -->
      <v-row>
        <v-col cols="4">
          <v-card elevation="2">
            <v-card-title>
              <v-icon style="margin-inline-end:8px;">mdi-filter</v-icon>
              {{ t('reports.surgicalGuide.filters') }}
            </v-card-title>
            <v-card-text>
              <!-- Search Row -->
              <v-row class="mb-4">
                <v-col cols="12">
                  <v-text-field
                    v-model="searchQuery"
                    :label="t('reports.surgicalGuide.searchCases')"
                    :placeholder="t('reports.surgicalGuide.searchPlaceholder')"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-magnify"
                    :append-inner-icon="loading.report && searchQuery ? 'mdi-loading' : ''"
                    :loading="loading.report && searchQuery"
                    clearable
                    :hint="loading.report && searchQuery ? t('reports.surgicalGuide.searching') : t('reports.surgicalGuide.searchHint')"
                    persistent-hint
                    :disabled="loading.summary"
                    @click:clear="clearSearch"
                  >
                    <template #append-inner v-if="loading.report && searchQuery">
                      <v-progress-circular
                        indeterminate
                        color="orange"
                        size="20"
                        width="2"
                      ></v-progress-circular>
                    </template>
                  </v-text-field>
                </v-col>
              </v-row>

              <!-- Date Range Row -->
              <v-row class="filter-row">
                <v-col cols="12" md="6" class="d-flex align-start">
                  <v-text-field
                    v-model="filters.startDate"
                    :label="t('reports.surgicalGuide.startDate')"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar-start"
                    :min="'2005-01-01'"
                    :max="'2025-12-31'"
                    :rules="[rules.required]"
                    :hint="t('reports.surgicalGuide.dateFormat')"
                    class="full-width-input"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-start">
                  <v-text-field
                    v-model="filters.endDate"
                    :label="t('reports.surgicalGuide.endDate')"
                    type="date"
                    variant="outlined"
                    density="comfortable"
                    prepend-inner-icon="mdi-calendar-end"
                    :min="'2005-01-01'"
                    :max="'2025-12-31'"
                    :rules="[rules.required]"
                    :hint="t('reports.surgicalGuide.dateFormat')"
                    class="full-width-input"
                  ></v-text-field>
                </v-col>
              </v-row>
              <row class="filter-row">
                <v-col cols="12" md="6">
                    <v-btn
                      color="primary"
                      size="large"
                      prepend-icon="mdi-refresh"
                      :loading="loading.report"
                      :disabled="!isDateRangeValid || loading.report || loading.summary"
                      block
                      @click="fetchReport(true)"
                    >
                      <template v-if="loading.report">
                        {{ t('reports.surgicalGuide.loading') || 'Loading...' }}
                      </template>
                      <template v-else>
                        {{ t('reports.surgicalGuide.reload') }}
                      </template>
                    </v-btn>
                </v-col>
                <v-col cols="12" md="6">
                <v-btn
                      color="success"
                      size="large"
                      prepend-icon="mdi-download"
                      variant="outlined"
                      :loading="loading.export"
                      :disabled="!filteredReportData.length || loading.report || loading.summary || loading.export"
                      block
                      style="margin-inline-start:8px;"
                      @click="exportToCSV"
                    >
                      <template v-if="loading.export">
                        {{ t('reports.surgicalGuide.exporting') || 'Exporting...' }}
                      </template>
                      <template v-else>
                        {{ t('reports.surgicalGuide.exportCSV') }}
                      </template>
                    </v-btn>
                  </v-col>
              </row>

              <!-- Date Range Validation Message -->
              <v-alert
                v-if="!isDateRangeValid && filters.startDate && filters.endDate"
                type="warning"
                density="compact"
                variant="tonal"
                class="mt-2"
              >
                {{ t('reports.surgicalGuide.invalidDateRange') }}
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
                <span class="font-weight-medium">{{ t('reports.surgicalGuide.allDataLoaded') }}</span>
                {{ t('reports.surgicalGuide.showingAllRecords', { total: pagination.total }) }}
                <span v-if="pagination.total >= filters.limit" style="margin-inline-start:8px;">
                  {{ t('reports.surgicalGuide.paginationTip') }}
                </span>
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading Progress with Enhanced UI -->
      <v-row v-if="loading.report || loading.summary">
        <v-col cols="12">
          <v-card elevation="2" class="loading-card">
            <v-progress-linear
              indeterminate
              color="orange"
              height="4"
              class="mb-0"
            ></v-progress-linear>
            <v-card-text class="text-center py-6">
              <v-progress-circular
                indeterminate
                color="orange"
                size="48"
                width="4"
                class="mb-4"
              ></v-progress-circular>
              <div class="text-h6 text-medium-emphasis mb-2">
                <template v-if="loading.summary">
                  {{ t('reports.surgicalGuide.loadingSummary') }}
                </template>
                <template v-else-if="loading.report">
                  <template v-if="searchQuery">
                    {{ t('reports.surgicalGuide.searchingFor', { query: searchQuery }) }}
                  </template>
                  <template v-else>
                    {{ t('reports.surgicalGuide.loadingReportData') }}
                  </template>
                </template>
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ t('reports.surgicalGuide.pleaseWait') }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Order Statistics Skeleton Loader (10 cards for both rows) -->
      <v-row v-if="loading.summary" class="summary-cards five-col-row">
        <v-col v-for="i in 10" :key="`skeleton-${i}`">
          <v-card elevation="1" class="summary-card skeleton-card">
            <div class="card-top-bar skeleton-shimmer" style="background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;"></div>
            <v-card-text class="text-center py-3">
              <v-skeleton-loader
                type="avatar"
                class="mb-2 mx-auto"
                width="40"
                height="40"
              ></v-skeleton-loader>
              <v-skeleton-loader
                type="heading"
                class="mb-2"
                width="60px"
              ></v-skeleton-loader>
              <v-skeleton-loader 
                type="text" 
                width="90px"
                class="mx-auto"
              ></v-skeleton-loader>
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
              <div class="text-caption text-medium-emphasis">{{ t('reports.surgicalGuide.totalOrders') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'free' }" hover @click="filterByOrderType('free')">
            <div class="card-top-bar" style="background:#43a047"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#43a047" class="mb-2">mdi-gift</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#43a047">{{ formatNumber(summary.freeOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('reports.surgicalGuide.freeOrders') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'fullyPrepaid' }" hover @click="filterByOrderType('fullyPrepaid')">
            <div class="card-top-bar" style="background:#1565c0"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#1565c0" class="mb-2">mdi-ticket-confirmation</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#1565c0">{{ formatNumber(summary.fullyPrepaidOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('reports.surgicalGuide.fullyPrepaid') }}</div>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col>
          <v-card elevation="1" class="summary-card clickable-card" :class="{ 'active-filter': activeFilter === 'fullyPostpaid' }" hover @click="filterByOrderType('fullyPostpaid')">
            <div class="card-top-bar" style="background:#e53935"></div>
            <v-card-text class="text-center py-3">
              <v-icon size="40" color="#e53935" class="mb-2">mdi-cash-clock</v-icon>
              <div class="text-h5 font-weight-bold" style="color:#e53935">{{ formatNumber(summary.fullyPostpaidOrders || 0) }}</div>
              <div class="text-caption text-medium-emphasis">{{ t('reports.surgicalGuide.fullyPostpaid') }}</div>
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
                <v-icon style="margin-inline-end:8px;">mdi-table</v-icon>
                {{ t('reports.surgicalGuide.reportData') }}
                <v-chip
                  v-if="searchQuery"
                  color="orange"
                  size="small"
                  style="margin-inline-start:8px;"
                >
                  {{ t('reports.surgicalGuide.searchLabel') }} "{{ searchQuery }}"
                </v-chip>
              </div>
              <div class="d-flex align-center gap-2">
                <v-chip
                  v-if="pagination.total"
                  color="primary"
                  variant="outlined"
                >
                  {{ pagination.total }}
                  {{ searchQuery ? t('reports.surgicalGuide.matching') : t('reports.surgicalGuide.total') }}
                </v-chip>
              </div>
            </v-card-title>

            <!-- Legend -->
            <div class="payment-legend px-4 py-2">
              <div class="d-flex align-center flex-wrap" style="gap: 24px;">
                <!-- Payment Status Legend -->
                <div class="d-flex align-center flex-wrap" style="gap: 12px;">
                  <span class="text-caption text-medium-emphasis font-weight-bold">{{ t('reports.surgicalGuide.payment') }}:</span>
                  <span class="legend-item">
                    <v-icon size="28" color="#43a047" style="margin-inline-end:4px;">mdi-gift</v-icon>
                    <span class="text-caption">{{ t('reports.surgicalGuide.free') }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="28" color="#1565c0" style="margin-inline-end:4px;">mdi-ticket-confirmation</v-icon>
                    <span class="text-caption">{{ t('reports.surgicalGuide.fullyPrepaid') }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="28" color="#e53935" style="margin-inline-end:4px;">mdi-cash-clock</v-icon>
                    <span class="text-caption">{{ t('reports.surgicalGuide.fullyPostpaid') }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="28" color="#8e24aa" style="margin-inline-end:4px;">mdi-cash-multiple</v-icon>
                    <span class="text-caption">{{ t('reports.surgicalGuide.partiallyPostpaid') }}</span>
                  </span>
                </div>
                
                <!-- Workflow Status Legend -->
                <div class="d-flex align-center flex-wrap" style="gap: 12px;">
                  <span class="text-caption text-medium-emphasis font-weight-bold">{{ t('reports.surgicalGuide.workflow') }}:</span>
                  <span class="legend-item">
                    <v-icon size="small" color="orange" style="margin-inline-end:4px;">mdi-fire</v-icon>
                    <span class="text-caption">{{ t('reports.surgicalGuide.rushOrders') }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="small" color="red" style="margin-inline-end:4px;">mdi-pause-circle</v-icon>
                    <span class="text-caption">{{ t('reports.surgicalGuide.onHold') }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="small" color="grey-darken-2" style="margin-inline-end:4px;">mdi-check-circle</v-icon>
                    <span class="text-caption">{{ t('reports.surgicalGuide.confirmed') }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon size="small" color="green" style="margin-inline-end:4px;">mdi-play-circle</v-icon>
                    <span class="text-caption">{{ t('reports.surgicalGuide.active') }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Table Skeleton Loader (when loading with no data) -->
            <v-card v-if="loading.report && filteredReportData.length === 0" elevation="0" class="table-skeleton-loader">
              <v-card-text class="pa-0">
                <v-skeleton-loader
                  type="table-heading, table-tbody, table-tfoot"
                  :types="{
                    'table-heading': 'heading@8',
                    'table-tbody': 'table-row@5',
                    'table-row': 'text@8',
                    'table-tfoot': 'text'
                  }"
                ></v-skeleton-loader>
              </v-card-text>
            </v-card>

            <!-- Data Table -->
            <v-data-table-server
              v-if="!loading.report || filteredReportData.length > 0"
              :headers="computedTableHeaders"
              :items="filteredReportData"
              :loading="loading.report"
              loading-text="🔄 Fetching data..."
              :items-length="pagination.total"
              v-model:page="pagination.page"
              :items-per-page="50"
              :items-per-page-options="[25, 50, 100]"
              :class="['elevation-1', 'enhanced-table', 'payment-status-table', 'highlighted-expanded-table', isCurrentlyRTL ? 'rtl-table' : 'ltr-table']"
              density="compact"
              hover
              show-current-page
              :mobile-breakpoint="0"
              show-expand
              v-model:expanded="expanded"
              item-value="orderSGID"
              color="orange"
              @update:options="loadItems"
              @update:expanded="handleExpandedChange"
            >
              <!-- Loading Slot with Custom Progress -->
              <template #loading>
                <div class="text-center py-8">
                  <v-progress-circular
                    indeterminate
                    color="orange"
                    size="48"
                    width="4"
                    class="mb-3"
                  ></v-progress-circular>
                    <div class="text-body-1 text-medium-emphasis">
                    {{ t('reports.surgicalGuide.loadingMessage') }}
                  </div>
                </div>
              </template> 
              <!-- No Data State -->
              <template #no-data>
                <div class="text-center py-8">
  
                  <template v-if="searchQuery">
                    <v-icon size="64" color="orange">mdi-magnify-close</v-icon>
                    <p class="text-h6 mt-4">{{ t('reports.surgicalGuide.noResultsFound') }}</p>
                    <p class="text-body-2 text-medium-emphasis mb-2">
                      {{ t('reports.surgicalGuide.noResultsMessage') }}
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
                      {{ t('reports.surgicalGuide.clearSearch') }}
                    </v-btn>
                  </template>

                  <!-- No data loaded at all -->
                  <template v-else>
                    <v-icon size="64" color="grey">mdi-file-search</v-icon>
                    <p class="text-h6 mt-4">{{ t('reports.surgicalGuide.noDataAvailable') }}</p>
                    <p class="text-body-2 text-medium-emphasis">
                      {{ t('reports.surgicalGuide.selectDateAndReload') }}
                    </p>
                  </template>
                </div>
              </template>

              <!-- Custom Column Templates -->
              <template
                v-for="header in computedTableHeaders"
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
                  <!-- Use the `header` loop variable for stable access during initial renders. slotProps.header may be undefined briefly -->
                  <v-tooltip
                    v-if="header && (header.value === 'designer' || header.value === 'hasExtraction')"
                    :text="getHeaderTooltip(header.value)"
                  >
                    <template #activator="{ props }">
                      <span v-bind="props">{{ header.title }}</span>
                    </template>
                  </v-tooltip>
                  <span v-else>{{ header.title }}</span>
                </div>
              </template>
              <!-- Scan Center Column with Icon -->
              <template #[`item.scanCenterFullName`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon size="small" style="margin-inline-end:8px;" color="info"
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
                  <v-icon size="small" style="margin-inline-end:8px;" color="primary"
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
                  <v-icon size="small" style="margin-inline-end:8px;" color="purple"
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
                <div class="d-flex align-center order-id-cell" style="gap: 12px;">
                  <v-tooltip class="payment-status-wrapper" location="top">
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
                  <span class="workflow-status-wrapper">
                    <v-icon
                      v-if="getWorkflowIcon(item)"
                      size="30"
                      :color="getWorkflowIconColor(item)"
                      class="workflow-status-icon"
                    >
                      {{ getWorkflowIcon(item) }}
                    </v-icon>
                  </span>
                </div>
              </template>

              <!-- Cost Column with Currency -->
              <template #[`item.cost`]="{ item }">
                <span class="font-weight-bold">
                  {{ formatCurrency(item.cost) }}
                </span>
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
                <tr class="expanded-row-minimal">
                  <td :colspan="columns.length" class="expanded-cell">
                    <!-- Stacked Tables Layout -->
                    <div class="minimal-expanded-container">
                      <!-- Main Details Table -->
                      <table class="professional-details-table">
                        <tbody>
                          <!-- Payment Status -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" :color="getPaymentStatusColor(item)" class="mr-1">{{ getPaymentStatusIcon(item) }}</v-icon>
                              {{ t('reports.surgicalGuide.payment') }}
                            </td>
                            <td class="detail-value" :style="{ color: getPaymentStatusColor(item) }">
                              {{ getPaymentStatusLabel(item) }}
                            </td>
                          </tr>
                          
                          <!-- Workflow Status -->
                          <tr>
                            <td class="detail-label">
                              <v-icon v-if="getWorkflowIcon(item)" size="16" :color="getWorkflowIconColor(item)" class="mr-1">{{ getWorkflowIcon(item) }}</v-icon>
                              <v-icon v-else size="16" color="#757575" class="mr-1">mdi-cog</v-icon>
                              {{ t('reports.surgicalGuide.workflow') }}
                            </td>
                            <td class="detail-value" :style="{ color: getWorkflowIconColor(item) || '#757575' }">
                              {{ getWorkflowIcon(item) ? getWorkflowStatusLabel(item) : t('reports.surgicalGuide.standard') }}
                            </td>
                          </tr>
                          
                          <!-- Created -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#2196f3" class="mr-1">mdi-calendar-plus</v-icon>
                              {{ t('reports.surgicalGuide.created') }}
                            </td>
                            <td class="detail-value">{{ item.createdTime }}</td>
                          </tr>
                          
                          <!-- Designed -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#4caf50" class="mr-1">mdi-calendar-check</v-icon>
                              {{ t('reports.surgicalGuide.designed') }}
                            </td>
                            <td class="detail-value">{{ item.designTime }}</td>
                          </tr>
                          
                          <!-- Designer -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#ff9800" class="mr-1">mdi-account-hard-hat</v-icon>
                              {{ t('reports.surgicalGuide.designer') }}
                            </td>
                            <td class="detail-value">
                              <a
                                href="javascript:void(0)"
                                class="detail-link"
                                @click.prevent="() => {}"
                              >
                                {{ item.designer }}
                              </a>
                            </td>
                          </tr>
                          
                          <!-- Support Type -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#9c27b0" class="mr-1">mdi-pillar</v-icon>
                              {{ t('reports.surgicalGuide.support') }}
                            </td>
                            <td class="detail-value">{{ getSupportTypeLabel(item.typeOfSupport) }}</td>
                          </tr>
                          
                          <!-- Cost -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#43a047" class="mr-1">mdi-currency-usd</v-icon>
                              {{ t('reports.surgicalGuide.cost') }}
                            </td>
                            <td class="detail-value font-weight-bold">${{ parseFloat(item.cost || 0).toFixed(2) }}</td>
                          </tr>
                          
                          <!-- Extraction -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#00bcd4" class="mr-1">mdi-tooth</v-icon>
                              {{ t('reports.surgicalGuide.extraction') }}
                            </td>
                            <td class="detail-value">
                              <span :style="{ color: item.extracted === 'Yes' ? '#4caf50' : '#757575' }">{{ item.extracted }}</span>
                            </td>
                          </tr>
                          
                          <!-- Bone Reduction -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#795548" class="mr-1">mdi-bone</v-icon>
                              {{ t('reports.surgicalGuide.boneReduction') }}
                            </td>
                            <td class="detail-value">
                              <span :style="{ color: item.boneReduction === 'Yes' ? '#4caf50' : '#757575' }">{{ item.boneReduction }}</span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      <!-- Voucher Details Table (Below Main Table) -->
                      <table v-if="item.vouchers && item.vouchers.length > 0" class="voucher-details-table">
                        <tbody>
                          <tr v-for="(voucher, index) in item.vouchers" :key="index" class="voucher-row">
                            <td class="detail-label">
                              <v-icon size="16" color="#1976d2" class="mr-1">mdi-ticket-confirmation</v-icon>
                              {{ t('reports.surgicalGuide.vouchers') }} 
                              <a
                                href="javascript:void(0)"
                                class="detail-link"
                                @click.prevent="() => {}"
                              >
                                #{{ voucher.id }}
                              </a>
                            </td>
                            <td class="detail-value voucher-amount">${{ voucher.amount.toFixed(2) }}</td>
                            <td class="detail-value voucher-status">
                              <v-chip size="x-small" color="success" variant="flat" class="sharp-chip">{{ t('reports.surgicalGuide.applied') }}</v-chip>
                            </td>
                          </tr>
                          <tr class="voucher-total-row">
                            <td class="detail-label">
                              <v-icon size="16" color="#1976d2" class="mr-1">mdi-ticket-percent</v-icon>
                              {{ t('reports.surgicalGuide.totalVoucherPaid') }}
                            </td>
                            <td class="detail-value voucher-total-amount" colspan="2">${{ parseFloat(item.amountPaid || 0).toFixed(2) }}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
            </v-data-table-server>
            <!-- using native Vuetify pagination/footer -->
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
      return t('reports.surgicalGuide.tooltips.designer');
    case "hasExtraction":
      return t('reports.surgicalGuide.tooltips.hasExtraction');
    case "extComp_BoneReduction_selected":
      return t('reports.surgicalGuide.tooltips.boneReduction');
    default:
      return "";
  }
}
import { ref, reactive, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useDevModeStore } from "@/stores/devMode";
import api from "@/services/api";
import { useI18n } from 'vue-i18n';
import { isRTL } from '@/i18n';

const router = useRouter();
const devModeStore = useDevModeStore();
const { t, locale } = useI18n();

// Computed reactive RTL flag tied to the current i18n locale for this component
const isCurrentlyRTL = computed(() => {
  try {
    return isRTL(locale.value);
  } catch (e) {
    return false;
  }
});

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
  limit: 50,
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
  limit: 50,
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

// Document direction for debugging/sync checks
const docDir = computed(() => (typeof document !== 'undefined' ? document.documentElement.dir || 'ltr' : 'unknown'));

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
  { title: "", key: "data-table-expand", value: "data-table-expand", sortable: false, width: "48px" },
  { title: "ID", key: "orderSGID", value: "orderSGID", sortable: true, width: "140px" },
  {
    title: "Scan Center",
    key: "scanCenterFullName",
    value: "scanCenterFullName",
    sortable: true,
    width: "180px",
  },
  { title: "Doctor", key: "doctorFullName", value: "doctorFullName", sortable: true, width: "180px" },
  { title: "Patient", key: "patientName", value: "patientName", sortable: true, width: "180px" },
  {
    title: "Cost",
    key: "cost",
    value: "cost",
    sortable: true,
    align: "center",
    width: "110px",
  },
  { title: "Type", key: "typeLabel", value: "typeLabel", sortable: true, width: "140px" },
  { title: "Created", key: "createdTime", value: "createdTime", sortable: true, width: "130px" },
];

// Computed headers - rely on CSS direction (RTL) instead of reversing headers in JS
// Reversing headers in JS combined with setting direction can cause confusing layouts
// so we keep a stable header order and use CSS to present RTL correctly.
const computedTableHeaders = computed(() => tableHeaders);

const rules = {
  required: (value) => !!value || "Required field",
};

// Track last options received from v-data-table-server to avoid duplicate fetch loops
// initialize to null so the first incoming options always trigger a load
const lastTableOptions = reactive({ page: null, itemsPerPage: null, sortKey: null });

// (native Vuetify pagination will be used)

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
    showSnackbar(t('reports.surgicalGuide.verifyAccessFailed') || "Failed to verify access permissions", "error");
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
      showSnackbar(t('reports.surgicalGuide.loadedRecords', { count: reportData.value.length }) || `Loaded ${reportData.value.length} records`, "success");
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
  // Normalize incoming options
  const incomingSortKey = sortBy && sortBy.length > 0 ? `${sortBy[0].key}:${sortBy[0].order || 'asc'}` : '';

  // If options didn't change, ignore to prevent fetch loops
  if (
    lastTableOptions.page === page &&
    lastTableOptions.itemsPerPage === itemsPerPage &&
    lastTableOptions.sortKey === incomingSortKey
  ) {
    return;
  }

  // Update last seen options
  lastTableOptions.page = page;
  lastTableOptions.itemsPerPage = itemsPerPage;
  lastTableOptions.sortKey = incomingSortKey;

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
      throw new Error(t('reports.surgicalGuide.exportFailed') || "Export failed");
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

    showSnackbar(t('reports.surgicalGuide.reportExported') || "Report exported successfully", "success");
  } catch (error) {
    showSnackbar(t('reports.surgicalGuide.exportFailed') || "Failed to export report", "error");
  } finally {
    loading.export = false;
  }
}

/**
 * Collapse expanded row
 */
function collapseRow(item) {
  const index = expanded.value.findIndex(exp => exp === item.orderSGID);
  if (index > -1) {
    expanded.value.splice(index, 1);
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
  if (!value && value !== 0) return t('reports.surgicalGuide.notSpecified') || "N/A";
  if (parseFloat(value) === 0) return t('reports.surgicalGuide.freeOrders') || "Free";
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
    0: t('reports.surgicalGuide.supportTypes.teeth'),
    1: t('reports.surgicalGuide.supportTypes.tissue'),
    2: t('reports.surgicalGuide.supportTypes.bone'),
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
  if (item.isRush === 1) return t('reports.surgicalGuide.rushOrders');
  if (item.Q11_Val_4 !== 0 && item.Q11_Val_4 != null) return t('reports.surgicalGuide.onHold');
  if (item.Q11_Val_2 !== 0 && item.Q11_Val_2 != null) return t('reports.surgicalGuide.confirmed');
  if (item.Q11_Val_1 !== 0 && item.Q11_Val_1 != null) return t('reports.surgicalGuide.active');
  return t('reports.surgicalGuide.noStatusSet');
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

  if (cost === 0) return t('reports.surgicalGuide.freeOrders');
  if (amountPaid === 0) return t('reports.surgicalGuide.fullyPostpaid');
  if (amountPaid >= cost) return t('reports.surgicalGuide.fullyPrepaid');
  return t('reports.surgicalGuide.partiallyPostpaid');
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
  if (item.Q11_Val_5 > Q11_max) return t('reports.surgicalGuide.status.qcShipping');
  if (item.Q11_Val_2 > Q11_max) return t('reports.surgicalGuide.status.confirmedByOEM');
  if (item.Q11_Val_4 > Q11_max) return t('reports.surgicalGuide.status.onHold');
  if (item.Q11_Val_3 > Q11_max) return t('reports.surgicalGuide.status.multiple');
  if (item.Q11_Val_1 > Q11_max) return t('reports.surgicalGuide.status.active');
  if (item.Q11_Val_20 > Q11_max) return t('reports.surgicalGuide.status.inProcess');
  return t('reports.surgicalGuide.status.inactive');
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
  // Ensure at least one initial load (some environments don't trigger table options)
  if (accessInfo.hasReportAccess) {
    // Use current pagination and no sort to trigger initial fetch
    loadItems({ page: pagination.page, itemsPerPage: pagination.limit, sortBy: [] }).catch(() => {});
  }
});
</script>

<style scoped>
/* Expanded row styling - minimal padding */
/* Enforce explicit LTR/RTL styles at the table level to avoid mixed-direction cells.
   Use `.rtl-table` and `.ltr-table` classes applied on the v-data-table-server element.
   These rules flip flex direction, text alignment, and icon margins inside table cells
   so inline icon+text items appear naturally in both directions. */

.rtl-table {
  direction: rtl;
}

/* .rtl-table .v-data-table__wrapper,
.rtl-table table,
.rtl-table thead,
.rtl-table tbody,
.rtl-table tfoot {
  direction: rtl;
} */

/* Align all table header and cell text to the right in RTL, left in LTR */
/* .rtl-table th,
.rtl-table td {
  text-align: right !important;
}

.ltr-table th,
.ltr-table td {
  text-align: left !important;
}

/* Flip inline icon + text order for RTL: use row-reverse on the container that holds the icon and the text.
   Many cells use `d-flex align-center` with an icon using `mr-*`; we override those here. */
/* .rtl-table .d-flex.align-center {
  flex-direction: row-reverse;
} */ 

/* Replace margin-right used for icons with margin-left in RTL, and vice-versa in LTR to keep spacing consistent. */
.rtl-table .mr-2 { margin-right: 0 !important; margin-left: 8px !important; }
.rtl-table .mr-1 { margin-right: 0 !important; margin-left: 4px !important; }
.rtl-table .ml-2 { margin-left: 0 !important; margin-right: 8px !important; }
.rtl-table .ml-1 { margin-left: 0 !important; margin-right: 4px !important; }

.ltr-table .mr-2 { margin-right: 8px !important; margin-left: 0 !important; }
.ltr-table .mr-1 { margin-right: 4px !important; margin-left: 0 !important; }
.ltr-table .ml-2 { margin-left: 8px !important; margin-right: 0 !important; }
.ltr-table .ml-1 { margin-left: 4px !important; margin-right: 0 !important; }

/* Ensure link order and arrow icons in cells read naturally in RTL */
.rtl-table .order-id-link { direction: rtl; }
.ltr-table .order-id-link { direction: ltr; }

/* For expanded-row tables inside the expanded cell, inherit table direction explicitly */
.rtl-table .professional-details-table,
.rtl-table .voucher-details-table {
  direction: rtl;
  text-align: right;
}

.ltr-table .professional-details-table,
.ltr-table .voucher-details-table {
  direction: ltr;
  text-align: left;
}

/* Keep chip/icon visual order consistent in legends */
.rtl-table .legend-item { flex-direction: row-reverse; }

/* Explicit ordering for common inline cell groups so we don't rely solely on row-reverse.
   This keeps spacing/gap predictable and makes the icon/text order deterministic.
   Rule targets the templates that render an icon followed by a link/span. */
.rtl-table .d-flex.align-center .v-icon {
  order: 2; /* icon after text */
}
.rtl-table .d-flex.align-center a.order-id-link,
.rtl-table .d-flex.align-center span.text-body-2 {
  order: 1; /* text before icon */
}

.ltr-table .d-flex.align-center .v-icon {
  order: 1; /* icon before text */
}
.ltr-table .d-flex.align-center a.order-id-link,
.ltr-table .d-flex.align-center span.text-body-2 {
  order: 2; /* text after icon */
}

/* Clean, self-contained Order ID cell rules
   - The template renders: payment-status-wrapper, order-id-link, workflow-status-wrapper (in that DOM order)
   - We use explicit `order` values per-direction so the visual sequence becomes:
       LTR: Payment -> ID -> Workflow
       RTL: Payment -> ID -> Workflow (anchored to the right edge of the cell)
   - We avoid row-reverse to prevent double-reversal when combined with `order` rules. */

/* Base layout for the ID cell */
.order-id-cell {
  display: flex !important;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

/* Make wrappers inline-flex and non-growing */
.order-id-cell > .payment-status-wrapper,
.order-id-cell > .workflow-status-wrapper,
.order-id-cell > .order-id-link {
  display: inline-flex !important;
  align-items: center !important;
  flex: 0 0 auto !important;
}

/* Ensure the #ID doesn't wrap and numbers render LTR */
.order-id-cell > .order-id-link {
  white-space: nowrap;
  direction: ltr; /* keep numbers left-to-right */
}

/* LTR ordering (natural DOM matching visual order) */
.ltr-table .order-id-cell > .payment-status-wrapper { order: 1 !important; }
.ltr-table .order-id-cell > .order-id-link { order: 2 !important; }
.ltr-table .order-id-cell > .workflow-status-wrapper { order: 3 !important; }

/* RTL ordering: keep group anchored to the right but rely on order values for sequence */
.rtl-table .order-id-cell { justify-content: flex-end !important; text-align: right !important; }
.rtl-table .order-id-cell > .payment-status-wrapper { order: 3 !important; }
.rtl-table .order-id-cell > .order-id-link { order: 2 !important; }
.rtl-table .order-id-cell > .workflow-status-wrapper { order: 1 !important; }

/* Stronger target inside Vuetify wrapper to ensure alignment wins */
.rtl-table :deep(td) .order-id-cell,
.rtl-table :deep(.v-data-table__wrapper) .order-id-cell {
  justify-content: flex-end !important;
}
.ltr-table :deep(td) .order-id-cell,
.ltr-table :deep(.v-data-table__wrapper) .order-id-cell {
  justify-content: flex-start !important;
}

.expanded-row-card {
  margin: 2px 0 !important;
  padding: 8px 8px 4px 8px !important;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  border-radius: 6px;
  overflow: visible !important;
}

/* ===================================== */
/* PREVENT SCROLLBAR FLASH - CRITICAL */
/* ===================================== */

/* Force no scrollbars on table and all children */
.enhanced-table,
/* Small helper to reverse footer layout in RTL locales */
/* RTL table pagination support */
.rtl-table {
  /* Make the whole table area RTL so native Vuetify footer and table respect direction */
  direction: rtl !important;
}

.rtl-table :deep(.v-data-table__wrapper),
.rtl-table :deep(.v-table__wrapper) {
  direction: rtl !important;
}

.rtl-table :deep(table),
.rtl-table :deep(.v-data-table) {
  direction: rtl !important;
}

/* Align header and cell content to the right for RTL */
.rtl-table :deep(th),
.rtl-table :deep(td) {
  text-align: right !important;
}

/* Stronger RTL alignment for inline flex containers inside table cells
   Some Vuetify cells use flex containers; ensure their content aligns right
   and icons/text are pushed to the visual end in RTL. */
.rtl-table :deep(td) .d-flex.align-center,
.rtl-table :deep(td) .d-flex {
  justify-content: flex-end !important;
  text-align: right !important;
}

/* Ensure links and inline text inside cells are right aligned in RTL */
.rtl-table :deep(td) a,
.rtl-table :deep(td) span,
.rtl-table :deep(td) .order-id-link {
  text-align: right !important;
}

/* Flip left/right margins on icons inside table cells to keep spacing natural */
.rtl-table :deep(.mr-2) { margin-right: 0 !important; margin-left: 8px !important; }
.rtl-table :deep(.mr-1) { margin-right: 0 !important; margin-left: 4px !important; }
.rtl-table :deep(.ml-2) { margin-left: 0 !important; margin-right: 8px !important; }

/* Footer tweaks: ensure items-per-page and pagination are laid out in a natural RTL order */

/* Explicit LTR overrides to guard against global document.dir being out-of-sync */
.ltr-table {
  direction: ltr !important;
}

.ltr-table :deep(.v-data-table__wrapper),
.ltr-table :deep(.v-table__wrapper) {
  direction: ltr !important;
}

.ltr-table :deep(table),
.ltr-table :deep(.v-data-table) {
  direction: ltr !important;
}

.ltr-table :deep(th),
.ltr-table :deep(td) {
  text-align: left !important;
}

/* Restore normal icon margins in LTR */
.ltr-table :deep(.mr-2) { margin-right: 8px !important; margin-left: 0 !important; }
.ltr-table :deep(.mr-1) { margin-right: 4px !important; margin-left: 0 !important; }
.ltr-table :deep(.ml-2) { margin-left: 8px !important; margin-right: 0 !important; }

.ltr-table :deep(.v-data-table-footer) {
  display: flex !important;
  flex-direction: row !important;
  align-items: center !important;
}

.ltr-table :deep(.v-data-table-footer .v-btn--icon) {
  transform: scaleX(1) !important;
}

.rtl-table :deep(.v-data-table-footer__items-per-page),
.rtl-table :deep(.v-data-table-footer__pagination) {
  flex-direction: row-reverse !important;
}

/* Flip icon buttons (previous/next) horizontally so arrows point correctly */
.rtl-table :deep(.v-data-table-footer .v-btn--icon) {
  transform: scaleX(-1) !important;
}

.enhanced-table * {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  overflow-x: visible !important;
}

.enhanced-table::-webkit-scrollbar,
.enhanced-table *::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
  background: transparent !important;
}

/* Target Vuetify table internals */
.enhanced-table :deep(.v-data-table__wrapper),
.enhanced-table :deep(.v-table__wrapper),
.enhanced-table :deep(.v-data-table),
.enhanced-table :deep(.v-table),
.enhanced-table :deep(table) {
  overflow: visible !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.enhanced-table :deep(.v-data-table__wrapper)::-webkit-scrollbar,
.enhanced-table :deep(.v-table__wrapper)::-webkit-scrollbar,
.enhanced-table :deep(.v-data-table)::-webkit-scrollbar,
.enhanced-table :deep(.v-table)::-webkit-scrollbar,
.enhanced-table :deep(table)::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}

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

/* Optimize icon rendering - removed GPU acceleration to prevent freezing */
.v-icon {
  will-change: auto;
}

/* Reduce paint operations */
.v-btn {
  will-change: auto;
}

/* Optimize card animations - removed GPU acceleration to prevent freezing */
.v-card {
  backface-visibility: hidden;
}

/* Expandable Row Styles - Enhanced UX */

/* Expanded row wrapper with animation */
.expanded-row-wrapper {
  animation: expandRowFade 0.3s ease-out;
}

@keyframes expandRowFade {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Container for expanded row with border highlight */
.expanded-row-container {
  background: linear-gradient(90deg, #ffa100 0%, #ff8c00 100%);
  padding: 3px;
  border-radius: 12px;
  margin: 8px 0;
  animation: expandRowGlow 0.5s ease-out;
}

@keyframes expandRowGlow {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 161, 0, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(255, 161, 0, 0.3);
  }
  100% {
    box-shadow: 0 4px 16px rgba(255, 161, 0, 0.15);
  }
}

/* Highlight Expanded Row */
.highlighted-expanded-table :deep(tr.v-data-table__tr--clickable[aria-expanded="true"]) {
  background: #fff3e0 !important;
  border-left: 4px solid #ff9800 !important;
}

.highlighted-expanded-table :deep(tr.v-data-table__tr--clickable[aria-expanded="true"]:hover) {
  background: #ffe0b2 !important;
}

/* Professional Minimal Expanded Row */
.expanded-row-minimal {
  background: #fff3e0 !important;
  border-left: 4px solid #ff9800 !important;
}

.expanded-cell {
  padding: 0 !important;
  background: #fff3e0 !important;
}

.minimal-expanded-container {
  position: relative;
  padding: 8px 16px;
  background: #fff9f0;
  border-top: 1px solid #ff9800;
}

/* Professional Details Table - Main Table */
.professional-details-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

.professional-details-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
}

.professional-details-table tbody tr:last-child {
  border-bottom: none;
}

.detail-label {
  padding: 6px 12px;
  font-weight: 600;
  color: #616161;
  background: #fafafa;
  white-space: nowrap;
  width: 100px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  padding: 6px 12px;
  color: #212121;
  background: white;
  font-size: 0.8125rem;
}

/* Clickable Links in Detail Values */
.detail-link {
  color: #1976d2;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.detail-link:hover {
  color: #1565c0;
  text-decoration: underline;
}

/* Voucher Inline Display */
.voucher-inline {
  display: inline;
  color: #1976d2;
  font-weight: 500;
}

/* Voucher Details Table - Below Main Table (Exact Match) */
.voucher-details-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.8125rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-top: 12px;
}

.voucher-details-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
}

.voucher-details-table tbody tr:last-child {
  border-bottom: none;
}

.voucher-row {
  border-bottom: 1px solid #f0f0f0;
}

.voucher-amount {
  font-weight: 600;
}

.voucher-status {
  text-align: center;
}

.voucher-total-row {
  border-top: 1px solid #f0f0f0;
}

.voucher-total-amount {
  font-weight: 700;
}

/* Sharp Chip for Voucher Status */
.sharp-chip {
  border-radius: 2px !important;
}

/* No Voucher Placeholder */
.no-voucher-placeholder {
  border: 1px dashed #e0e0e0;
  border-radius: 4px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.placeholder-content {
  text-align: center;
  padding: 24px;
}

/* Remove any overlay effects */
.expanded-row-card::before,
.expanded-row-card::after {
  display: none !important;
}

/* Ensure all child elements are fully opaque */
.expanded-row-card * {
  opacity: 1 !important;
}

/* Light mode text - full black for maximum clarity */
.expanded-row-card .v-list,
.expanded-row-card .v-list-item,
.expanded-row-card .v-list-item-title,
.expanded-row-card .v-list-item-subtitle {
  background: transparent !important;
  color: rgba(0, 0, 0, 0.87) !important;
  opacity: 1 !important;
}

/* Dark mode support for expanded row */
.v-theme--dark .expanded-row-card {
  background: #1e1e1e !important;
  color: #ffffff !important;
}

.v-theme--dark .expanded-row-header {
  background: #252525 !important;
  border-bottom-color: rgba(255, 161, 0, 0.3);
}

.v-theme--dark .expanded-row-container {
  box-shadow: 0 4px 20px rgba(255, 161, 0, 0.25);
}

.v-theme--dark .details-section-card,
.v-theme--dark .payment-section-card,
.v-theme--dark .workflow-section-card {
  background: #252525 !important;
  border-color: rgba(255, 161, 0, 0.2);
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
  background: transparent !important;
  color: #ffffff !important;
  opacity: 1 !important;
}

/* Compact Vouchers Inline Display */
.compact-vouchers {
  padding: 6px 0;
  border-top: 1px solid #e0e0e0;
}

.vouchers-inline {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

/* Workflow Note - Minimal */
.workflow-note {
  padding: 4px 0;
  border-top: 1px solid #e0e0e0;
  color: rgba(0, 0, 0, 0.7);
}

/* Expanded row table cell - no overlay */
.enhanced-table :deep(tr td.pa-0) {
  background: transparent !important;
  opacity: 1 !important;
  padding: 0 !important;
}

/* Remove any hover effects on expanded rows */
.enhanced-table :deep(tr:has(td.pa-0)) {
  background: transparent !important;
  opacity: 1 !important;
}

.enhanced-table :deep(tr:has(td.pa-0):hover) {
  background: transparent !important;
}

/* Expand icon color */
.enhanced-table :deep(.v-data-table__expand-icon) {
  color: #ffa100 !important;
}

/* Hover effect on expandable rows */
.enhanced-table :deep(tr:hover .v-data-table__expand-icon) {
  transform: scale(1.2);
  transition: transform 0.2s ease;
  color: #ff8c00 !important;
}

/* Dark mode for compact tables */
.v-theme--dark .expanded-row-card {
  background: #1e1e1e !important;
}

.v-theme--dark .expanded-row-header {
  background: #252525 !important;
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .compact-expanded-content {
  background: #1e1e1e !important;
}

.v-theme--dark .compact-details-table,
.v-theme--dark .compact-payment-table {
  border-color: rgba(255, 255, 255, 0.1);
}

.v-theme--dark .compact-details-table td,
.v-theme--dark .compact-payment-table td {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

.v-theme--dark .compact-label {
  color: rgba(255, 255, 255, 0.6) !important;
}

.v-theme--dark .compact-value {
  color: #ffffff !important;
}

.v-theme--dark .compact-vouchers,
.v-theme--dark .workflow-note {
  border-top-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

/* Removed old voucher expansion panel styles - now using inline chips */

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

/* Workflow icon - simple static styling */
.workflow-status-icon {
  display: inline-block !important;
  transition: transform 0.2s ease;
}

.workflow-status-icon:hover {
  transform: scale(1.1);
}
</style>

<style scoped>
.enhanced-table .v-data-table__wrapper {
  background: #fafbfc;
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
  transition: box-shadow 0.2s ease;
}

:deep(.v-card.hover:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Active filter card styling */
:deep(.v-card.active-filter) {
  box-shadow: 0 6px 16px rgba(255, 161, 0, 0.4) !important;
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

/* ===================================== */
/* REMOVE SCROLLBAR FLASH */
/* ===================================== */

/* Hide all scrollbars globally to prevent flash */
.enhanced-table,
.enhanced-table *,
.enhanced-table :deep(*) {
  scrollbar-width: none !important; /* Firefox */
  -ms-overflow-style: none !important; /* IE and Edge */
}

.enhanced-table::-webkit-scrollbar,
.enhanced-table *::-webkit-scrollbar,
.enhanced-table :deep(*)::-webkit-scrollbar {
  display: none !important; /* Chrome, Safari, Opera */
  width: 0 !important;
  height: 0 !important;
}

/* Specifically target table wrapper and body */
.enhanced-table :deep(.v-data-table__wrapper) {
  overflow: visible !important;
  scrollbar-width: none !important;
}

.enhanced-table :deep(.v-data-table__wrapper)::-webkit-scrollbar {
  display: none !important;
}

.enhanced-table :deep(.v-table__wrapper) {
  overflow: visible !important;
  scrollbar-width: none !important;
}

.enhanced-table :deep(.v-table__wrapper)::-webkit-scrollbar {
  display: none !important;
}

/* Hide scrollbars on table body */
.enhanced-table :deep(tbody) {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.enhanced-table :deep(tbody)::-webkit-scrollbar {
  display: none !important;
}

/* Prevent overflow that causes scrollbar flash */
.enhanced-table :deep(.v-data-table) {
  overflow: visible !important;
}

.enhanced-table :deep(.v-table) {
  overflow: visible !important;
}

/* Ensure pagination footer is visible and styled */
.enhanced-table :deep(.v-data-table-footer) {
  border-top: 2px solid #ffa100;
  padding: 12px 16px;
  overflow: visible !important;
}

/* ===================================== */
/* ENHANCED LOADING STATES */
/* ===================================== */

/* Loading overlay card */
.loading-overlay-card {
  background: white !important;
  border-radius: 16px !important;
  min-width: 300px;
  box-shadow: 0 8px 32px rgba(255, 161, 0, 0.2) !important;
}

.v-theme--dark .loading-overlay-card {
  background: #1e1e1e !important;
}

/* Loading card styling */
.loading-card {
  background: linear-gradient(135deg, #fff9f5 0%, #ffffff 100%);
  border-left: 4px solid #ffa100;
  overflow: hidden;
}

.v-theme--dark .loading-card {
  background: linear-gradient(135deg, #1a1a1a 0%, #242424 100%);
}

/* Shimmer animation for skeleton cards */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton-shimmer {
  animation: shimmer 1.5s infinite;
}

/* Skeleton card styling */
.skeleton-card {
  position: relative;
  overflow: hidden;
}

.skeleton-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.4),
    transparent
  );
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Table skeleton loader */
.table-skeleton-loader {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.v-theme--dark .table-skeleton-loader {
  border-color: rgba(255, 255, 255, 0.12);
}

/* Enhanced skeleton loader colors */
:deep(.v-skeleton-loader__bone) {
  background: linear-gradient(
    90deg,
    rgba(255, 161, 0, 0.08) 0%,
    rgba(255, 161, 0, 0.15) 50%,
    rgba(255, 161, 0, 0.08) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Loading progress circular pulse */
.v-progress-circular {
  animation: progress-pulse 2s ease-in-out infinite;
}

@keyframes progress-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Smooth fade-in for loaded content */
.summary-cards:not(.skeleton-card),
.enhanced-table {
  animation: fade-in 0.4s ease-in;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
