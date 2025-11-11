<template>
  <v-container fluid class="surgical-guide-report">
    <!-- Header Section -->
    <v-row>
      <v-col cols="12">
        <div
          class="d-flex justify-space-between  mb-2 header-container  compact-header"
        >
          <div class="">
            <h1 class="text-h6 pt-2  compact-header-title">
              <v-icon size="small" style="margin-inline-end: 6px" color="primary"
                >mdi-file-chart-outline</v-icon
              >
              {{ t("reports.surgicalGuide.title") }}
            </h1>
            <p class="text-caption text-medium-emphasis header-subtitle compact-header-subtitle">
              {{ t("reports.surgicalGuide.subtitle") }}
            </p>
          </div>

          <!-- Swagger API Docs Link (Developers22 only) -->
          <v-btn
            v-if="accessInfo.hasSwaggerAccess"
            color="secondary"
            variant="outlined"
            size="small"
            prepend-icon="mdi-api-outline"
            :href="swaggerUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ t("reports.surgicalGuide.apiDocs") }}
            <v-icon size="small" style="margin-inline-start: 4px">mdi-open-in-new-outline</v-icon>
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
          icon="mdi-lock-outline"
        >
          <!-- Project Documentation Button (Dev only) -->
          <v-btn
            v-if="isDevelopment"
            color="primary"
            variant="outlined"
            prepend-icon="mdi-file-document-outline"
            style="margin-inline-start: 8px"
            @click="openProjectDoc"
          >
            {{ t("reports.surgicalGuide.reportFeatureDoc") }}
            <v-icon style="margin-inline-start: 8px">mdi-open-in-new-outline</v-icon>
          </v-btn>
          <v-alert-title class="text-h6">{{
            t("reports.surgicalGuide.accessDenied")
          }}</v-alert-title>
          <p class="mb-2">
            {{ t("reports.surgicalGuide.noPermission") }}
          </p>
          <p
            class="text-body-2"
            v-html="t('reports.surgicalGuide.requiredGroups')"
          ></p>
          <p class="text-caption text-medium-emphasis mt-2">
            {{ t("reports.surgicalGuide.currentGroups") }}
            {{
              accessInfo.userGroups.join(", ") ||
              t("reports.surgicalGuide.none")
            }}
          </p>
        </v-alert>

        <!-- Development Mode Helper -->
        <v-alert
          v-if="isDevelopment"
          type="info"
          prominent
          variant="tonal"
          border="start"
          icon="mdi-information-outline"
          class="mt-4"
        >
          <v-alert-title class="text-h6">
            <v-icon style="margin-inline-end: 8px">mdi-developer-board-outline</v-icon>
            {{ t("reports.surgicalGuide.devModeTip") }}
          </v-alert-title>
          <p class="mb-3">
            {{ t("reports.surgicalGuide.devModeInstructions") }}
          </p>
          <ol class="mb-3">
            <li class="mb-2">
              <strong>{{ t("reports.surgicalGuide.devStepDashboard") }}</strong>
            </li>
            <li class="mb-2">
              <strong
                v-html="t('reports.surgicalGuide.devStepGroupsChip')"
              ></strong>
            </li>
            <li class="mb-2">
              <strong
                v-html="t('reports.surgicalGuide.devStepFinance22')"
              ></strong>
            </li>
            <li class="mb-2">
              <strong>{{ t("reports.surgicalGuide.devStepReturn") }}</strong>
            </li>
          </ol>
          <p class="text-caption text-medium-emphasis">
            {{ t("reports.surgicalGuide.devStepAdminView") }}
          </p>
          <div class="mt-4">
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-view-dashboard-outline"
              size="large"
              @click="navigateToDashboard"
            >
              {{ t("reports.surgicalGuide.goToDashboard") }}
            </v-btn>
          </div>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Main Report Interface (Finance22 only) -->
    <template v-if="accessInfo.hasReportAccess">
      <!-- Filters and Table Side by Side -->
      <v-row no-gutters>
        <!-- Filters Section - 3 columns -->
        <v-col cols="12" md="3" class="compact-filters-col">
          <v-card elevation="1" class="compact-filters-card" style="height: 100%;">
            <v-card-text class="compact-filters-content pa-3">
              <!-- Search -->
                  <v-text-field
                    v-model="searchQuery"
                    :label="t('reports.surgicalGuide.searchCases')"
                    variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-magnify-outline"
                    clearable
                hide-details
                class="mb-3"
                    @click:clear="clearSearch"
              ></v-text-field>

              <!-- Date Range -->
              <v-row dense class="mb-3">
                <v-col cols="6">
                  <v-menu location="bottom" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field
                        v-model="filters.startDate"
                        label="Start Date"
                        variant="outlined"
                        density="compact"
                        hide-details
                        prepend-inner-icon="mdi-calendar-outline"
                        readonly
                        v-bind="props"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="filters.startDate"
                      :max="filters.endDate"
                      color="primary"
                      show-expand
                    ></v-date-picker>
                  </v-menu>
                </v-col>
                <v-col cols="6">
                  <v-menu location="bottom" :close-on-content-click="false">
                    <template #activator="{ props }">
                      <v-text-field
                        v-model="filters.endDate"
                        label="End Date"
                        variant="outlined"
                        density="compact"
                        hide-details
                        prepend-inner-icon="mdi-calendar-outline"
                        readonly
                        v-bind="props"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="filters.endDate"
                      :min="filters.startDate"
                      color="primary"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
                
              <!-- Action Buttons -->
              <div class="d-flex gap-2 mb-3">
                <v-btn
                  color="primary"
                  size="default"
                  prepend-icon="mdi-refresh-outline"
                  :disabled="!isDateRangeValid"
                  variant="elevated"
                  class="flex-1"
                  @click="fetchReport"
                >
                  {{ t("reports.surgicalGuide.reload") }}
                </v-btn>
                <v-btn
                  color="success"
                  size="default"
                  prepend-icon="mdi-download-outline"
                  variant="outlined"
                  :disabled="!filteredReportData.length"
                  class="flex-1"
                  @click="exportToCSV"
                >
                  Export
                </v-btn>
              </div>

              <!-- Enhanced Statistics Cards -->
              <div v-if="summary" class="enhanced-stats-section">
                <div class="stats-section-title">
                  <v-icon size="16" class="mr-1">mdi-chart-box-outline</v-icon>
                  <span class="text-caption font-weight-medium">{{ t("reports.surgicalGuide.summary") || "Summary" }}</span>
                </div>
                <div class="enhanced-stats-grid">
                  <div
                    v-for="stat in compactStats"
                    :key="stat.key"
                    class="enhanced-stat-card"
                    :class="{ 'stat-card-active': activeFilter === stat.key }"
                    @click="filterByOrderType(stat.key)"
                  >
                    <div class="stat-card-icon" :class="`stat-icon-${stat.color}`">
                      <v-icon size="18">{{ stat.icon }}</v-icon>
              </div>
                    <div class="stat-card-content">
                      <div class="stat-card-label">{{ stat.label }}</div>
                      <div class="stat-card-value">{{ stat.value }}</div>
              </div>
              </div>
              </div>
              </div>

              <!-- Date Range Validation -->
              <v-alert
                v-if="!isDateRangeValid && filters.startDate && filters.endDate"
                type="warning"
                density="compact"
                variant="tonal"
                class="mt-2"
              >
                {{ t("reports.surgicalGuide.invalidDateRange") }}
              </v-alert>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Table Section - 9 columns -->
        <v-col cols="12" md="9" class="table-col pl-2">
          <v-card elevation="1" class="table-card">
            <v-card-title class="d-flex justify-space-between align-center table-card-title compact-title">
              <div class="d-flex align-center">
                <v-icon size="small" style="margin-inline-end: 6px">mdi-table</v-icon>
                <span class="text-subtitle-2 font-weight-medium">{{ t("reports.surgicalGuide.reportData") }}</span>
                <v-chip
                  v-if="filterNotificationText"
                  color="orange"
                  size="x-small"
                  style="margin-inline-start: 6px"
                >
                  {{ filterNotificationText }}
                </v-chip>
              </div>
              <div class="d-flex align-center">
                <v-chip
                  v-if="pagination.total"
                  :color="isDarkMode ? 'white' : 'grey'"
                  variant="text"
                  size="small"
                >
                  {{ pagination.total }}
                  {{
                    hasActiveFilters
                      ? t("reports.surgicalGuide.matching")
                      : t("reports.surgicalGuide.total")
                  }}
                </v-chip>
              </div>
            </v-card-title>

            <!-- Legend - Compact -->
            <div class="payment-legend compact-legend px-3 py-2">
              <div class="d-flex align-center flex-wrap" style="gap: 24px">
                <!-- Payment Status Legend -->
                <div class="d-flex align-center flex-wrap" style="gap: 12px">
                  <span
                    class="text-caption text-medium-emphasis font-weight-bold"
                    >{{ t("reports.surgicalGuide.payment") }}:</span
                  >
                  <span class="legend-item">
                    <v-icon
                      size="18"
                      color="#43A047"
                      style="margin-inline-end: 3px"
                      >mdi-gift-outline</v-icon
                    >
                    <span class="text-caption" style="font-size: 0.7rem">{{
                      t("reports.surgicalGuide.free")
                    }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon
                      size="18"
                      color="#1565C0"
                      style="margin-inline-end: 3px"
                      >mdi-ticket-confirmation-outline</v-icon
                    >
                    <span class="text-caption" style="font-size: 0.7rem">{{
                      t("reports.surgicalGuide.fullyPrepaid")
                    }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon
                      size="18"
                      color="#E53935"
                      style="margin-inline-end: 3px"
                      >mdi-clock-outline</v-icon
                    >
                    <span class="text-caption" style="font-size: 0.7rem">{{
                      t("reports.surgicalGuide.fullyPostpaid")
                    }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon
                      size="18"
                      color="#8E24AA"
                      style="margin-inline-end: 3px"
                      >mdi-cash-multiple</v-icon
                    >
                    <span class="text-caption" style="font-size: 0.7rem">{{
                      t("reports.surgicalGuide.partiallyPostpaid")
                    }}</span>
                  </span>
                </div>

                <!-- Workflow Status Legend -->
                <div class="d-flex align-center flex-wrap" style="gap: 10px">
                  <span
                    class="text-caption text-medium-emphasis font-weight-bold"
                    style="font-size: 0.7rem"
                    >{{ t("reports.surgicalGuide.workflow") }}:</span
                  >
                  <span class="legend-item">
                    <v-icon
                      size="16"
                      color="#E65100"
                      style="margin-inline-end: 3px"
                      >mdi-fire</v-icon
                    >
                    <span class="text-caption" style="font-size: 0.7rem">{{
                      t("reports.surgicalGuide.rushOrders")
                    }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon
                      size="16"
                      color="#F44336"
                      style="margin-inline-end: 3px"
                      >mdi-pause-circle-outline</v-icon
                    >
                    <span class="text-caption" style="font-size: 0.7rem">{{
                      t("reports.surgicalGuide.onHold")
                    }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon
                      size="16"
                      color="#616161"
                      style="margin-inline-end: 3px"
                      >mdi-check-circle-outline</v-icon
                    >
                    <span class="text-caption" style="font-size: 0.7rem">{{
                      t("reports.surgicalGuide.confirmed")
                    }}</span>
                  </span>
                  <span class="legend-item">
                    <v-icon
                      size="16"
                      color="#43A047"
                      style="margin-inline-end: 3px"
                      >mdi-play-circle-outline</v-icon
                    >
                    <span class="text-caption" style="font-size: 0.7rem">{{
                      t("reports.surgicalGuide.active")
                    }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Data Table -->
            <v-data-table-server
              :headers="computedTableHeaders"
              :items="filteredReportData"
              v-model:expanded="expanded"
              :items-length="pagination.total"
              :items-per-page="10"
              :items-per-page-options="[10, 25, 50]"
              :class="[
                'elevation-1',

                'ultra-compact-table',
                isCurrentlyRTL ? 'rtl-table' : 'ltr-table',
              ]"
              density="compact"
              hover
              fixed-header
              fixed-footer
              height="450"
              show-current-page
              :mobile-breakpoint="0"
              show-expand
              item-value="orderSGID"
              color="orange"
              @update:options="loadItems"
              @update:expanded="handleExpandedChange"
            >
              <!-- No Data State -->
              <template #no-data>
                <div class="text-center py-8">
                  <template v-if="searchQuery">
                    <v-icon size="64" color="orange">mdi-magnify-close-outline</v-icon>
                    <p class="text-h6 mt-4">
                      {{ t("reports.surgicalGuide.table.noResultsFound") }}
                    </p>
                    <p class="text-body-2 text-medium-emphasis mb-2">
                      {{ t("reports.surgicalGuide.table.noResultsMessage") }}
                      <strong>"{{ searchQuery }}"</strong>
                    </p>
                    <p class="text-caption text-medium-emphasis mb-4">
                      {{ t("reports.surgicalGuide.table.tryDifferent") }}
                    </p>
                    <v-btn
                      color="primary"
                      variant="outlined"
                      prepend-icon="mdi-close-outline"
                      @click="clearSearch"
                    >
                      {{ t("reports.surgicalGuide.clearSearch") }}
                    </v-btn>
                  </template>

                  <!-- No data loaded at all -->
                  <template v-else>
                    <v-icon size="64" color="grey">mdi-file-search-outline</v-icon>
                    <p class="text-h6 mt-4">
                      {{ t("reports.surgicalGuide.table.noDataAvailable") }}
                    </p>
                    <p class="text-body-2 text-medium-emphasis">
                      {{ t("reports.surgicalGuide.table.selectDateAndReload") }}
                    </p>
                  </template>
                </div>
              </template>

              <!-- Custom Column Templates -->
              <template
                v-for="header in computedTableHeaders"
                :key="header.value"
                #[`header.${header.value}`]="{}"
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
                    v-if="
                      header &&
                      (header.value === 'designer' ||
                        header.value === 'hasExtraction')
                    "
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
                  <v-icon
                    size="small"
                    style="margin-inline-end: 8px"
                    color="info"
                    >mdi-hospital-box-outline</v-icon
                  >
                  <a
                    v-if="
                      item.scanCenterFullName &&
                      item.scanCenterFullName !== 'Not Specified'
                    "
                    href="javascript:void(0)"
                    class="order-id-link"
                    @click.prevent="() => {}"
                  >
                    {{ item.scanCenterFullName }}
                  </a>
                  <span v-else class="text-body-2">{{
                    item.scanCenterFullName || "Not Specified"
                  }}</span>
                </div>
              </template>

              <!-- Doctor Column with Icon -->
              <template #[`item.doctorFullName`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon
                    size="small"
                    style="margin-inline-end: 8px"
                    color="primary"
                    >mdi-account-circle-outline</v-icon
                  >
                  <a
                    v-if="
                      item.doctorFullName &&
                      item.doctorFullName !== 'Not Specified'
                    "
                    href="javascript:void(0)"
                    class="order-id-link"
                    @click.prevent="() => {}"
                  >
                    {{ item.doctorFullName }}
                  </a>
                  <span v-else class="text-body-2">{{
                    item.doctorFullName || "Not Specified"
                  }}</span>
                </div>
              </template>

              <!-- Patient Column -->
              <template #[`item.patientName`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon
                    size="small"
                    style="margin-inline-end: 8px"
                    color="purple"
                    >mdi-account-outline</v-icon
                  >
                  <a
                    v-if="
                      item.patientName && item.patientName !== 'Not Specified'
                    "
                    href="javascript:void(0)"
                    class="order-id-link"
                    @click.prevent="() => {}"
                  >
                    {{ item.patientName }}
                  </a>
                  <span v-else class="text-body-2">{{
                    item.patientName || "Not Specified"
                  }}</span>
                </div>
              </template>

              <!-- Order ID Column - Payment Icon + ID + Workflow Icon -->
              <template #[`item.orderSGID`]="{ item }">
                <div
                  class="d-flex align-center order-id-cell"
                  style="gap: 12px"
                >
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
                    >mdi-calendar-outline</v-icon
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
                              <v-icon
                                size="14"
                                :color="getPaymentStatusColor(item)"
                                class="mr-1"
                                >{{ getPaymentStatusIcon(item) }}</v-icon
                              >
                              {{ t("reports.surgicalGuide.payment") }}
                            </td>
                            <td
                              class="detail-value"
                              :style="{ color: getPaymentStatusColor(item) }"
                            >
                              {{ getPaymentStatusLabel(item) }}
                            </td>
                          </tr>

                          <!-- Workflow Status -->
                          <tr>
                            <td class="detail-label">
                              <v-icon
                                v-if="getWorkflowIcon(item)"
                                size="14"
                                :color="getWorkflowIconColor(item)"
                                class="mr-1"
                                >{{ getWorkflowIcon(item) }}</v-icon
                              >
                              <v-icon
                                v-else
                                size="14"
                                color="#757575"
                                class="mr-1"
                                >mdi-cog-outline</v-icon
                              >
                              {{ t("reports.surgicalGuide.workflow") }}
                            </td>
                            <td
                              class="detail-value"
                              :style="{
                                color: getWorkflowIconColor(item) || '#757575',
                              }"
                            >
                              {{
                                getWorkflowIcon(item)
                                  ? getWorkflowStatusLabel(item)
                                  : t("reports.surgicalGuide.standard")
                              }}
                            </td>
                          </tr>

                          <!-- Created -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#2196F3" class="mr-1"
                                >mdi-calendar-plus-outline</v-icon
                              >
                              {{ t("reports.surgicalGuide.created") }}
                            </td>
                            <td class="detail-value">{{ item.createdTime }}</td>
                          </tr>

                          <!-- Designed -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#4CAF50" class="mr-1"
                                >mdi-calendar-check-outline</v-icon
                              >
                              {{ t("reports.surgicalGuide.designed") }}
                            </td>
                            <td class="detail-value">{{ item.designTime }}</td>
                          </tr>

                          <!-- Designer -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#ff9800" class="mr-1"
                                >mdi-account-wrench-outline</v-icon
                              >
                              {{ t("reports.surgicalGuide.designer") }}
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
                              <v-icon size="16" color="#9c27b0" class="mr-1"
                                >mdi-view-column-outline</v-icon
                              >
                              {{ t("reports.surgicalGuide.support") }}
                            </td>
                            <td class="detail-value">
                              {{ getSupportTypeLabel(item.typeOfSupport) }}
                            </td>
                          </tr>

                          <!-- Cost -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#43A047" class="mr-1"
                                >mdi-currency-usd</v-icon
                              >
                              {{ t("reports.surgicalGuide.cost") }}
                            </td>
                            <td class="detail-value font-weight-bold">
                              ${{ parseFloat(item.cost || 0).toFixed(2) }}
                            </td>
                          </tr>

                          <!-- Extraction -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#00bcd4" class="mr-1"
                                >mdi-tooth-outline</v-icon
                              >
                              {{ t("reports.surgicalGuide.extraction") }}
                            </td>
                            <td class="detail-value">
                              <span
                                :style="{
                                  color:
                                    item.extracted === 'Yes'
                                      ? '#4caf50'
                                      : '#757575',
                                }"
                                >{{ item.extracted }}</span
                              >
                            </td>
                          </tr>

                          <!-- Bone Reduction -->
                          <tr>
                            <td class="detail-label">
                              <v-icon size="16" color="#795548" class="mr-1"
                                >mdi-bone</v-icon
                              >
                              {{ t("reports.surgicalGuide.boneReduction") }}
                            </td>
                            <td class="detail-value">
                              <span
                                :style="{
                                  color:
                                    item.boneReduction === 'Yes'
                                      ? '#4caf50'
                                      : '#757575',
                                }"
                                >{{ item.boneReduction }}</span
                              >
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <!-- Voucher Details Table (Below Main Table) -->
                      <table
                        v-if="item.vouchers && item.vouchers.length > 0"
                        class="voucher-details-table"
                      >
                        <tbody>
                          <tr
                            v-for="(voucher, index) in item.vouchers"
                            :key="index"
                            class="voucher-row"
                          >
                            <td class="detail-label">
                              <v-icon size="16" color="#1976D2" class="mr-1"
                                >mdi-ticket-confirmation-outline</v-icon
                              >
                              {{ t("reports.surgicalGuide.vouchers") }}
                              <a
                                href="javascript:void(0)"
                                class="detail-link"
                                @click.prevent="() => {}"
                              >
                                #{{ voucher.id }}
                              </a>
                            </td>
                            <td class="detail-value voucher-amount">
                              ${{ voucher.amount.toFixed(2) }}
                            </td>
                            <td class="detail-value voucher-status">
                              <v-chip
                                size="x-small"
                                color="success"
                                variant="flat"
                                class="sharp-chip"
                                >{{
                                  t("reports.surgicalGuide.applied")
                                }}</v-chip
                              >
                            </td>
                          </tr>
                          <tr class="voucher-total-row">
                            <td class="detail-label">
                              <v-icon size="16" color="#1976D2" class="mr-1"
                                >mdi-ticket-percent-outline</v-icon
                              >
                              {{ t("reports.surgicalGuide.totalVoucherPaid") }}
                            </td>
                            <td
                              class="detail-value voucher-total-amount"
                              colspan="2"
                            >
                              ${{ parseFloat(item.amountPaid || 0).toFixed(2) }}
                            </td>
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

    <!-- Footer with Version - Compact -->
    <v-row>
      <v-col cols="12">
        <v-footer class="text-center py-1 compact-footer" elevation="0">
          <v-chip
            size="x-small"
            variant="outlined"
            prepend-icon="mdi-information-outline"
            style="font-size: 0.7rem"
          >
            Surgical Guide Report v1.1.0
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
      return t("reports.surgicalGuide.tooltips.designer");
    case "hasExtraction":
      return t("reports.surgicalGuide.tooltips.hasExtraction");
    case "extComp_BoneReduction_selected":
      return t("reports.surgicalGuide.tooltips.boneReduction");
    default:
      return "";
  }
}
import { ref, reactive, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useDevModeStore } from "@/stores/devMode";
import api from "@/services/api";
import { useI18n } from "vue-i18n";
import { isRTL } from "@/i18n";

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

// Guard to prevent multiple simultaneous API calls
let isFetching = false;
let isInitialLoad = true; // Track if this is the first load
let tableOptionsDisabled = false; // Flag to disable table auto-updates
let searchTimeout = null; // Timeout for search debounce

const pagination = reactive({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
});

// Simplified loading state - only for access check (before global loader is available)
const loading = reactive({
  access: true,
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

// Computed property to get active filter label
const activeFilterLabel = computed(() => {
  if (activeFilter.value === "all") return null;
  const stat = compactStats.value.find((s) => s.key === activeFilter.value);
  return stat ? stat.label : null;
});

// Computed property to check if any filters are active
const hasActiveFilters = computed(() => {
  return (
    searchQuery.value ||
    activeFilter.value !== "all" ||
    filters.startDate !== "2014-01-01" ||
    filters.endDate !== "2020-12-31"
  );
});

// Computed property to generate filter notification text
const filterNotificationText = computed(() => {
  const parts = [];

  if (searchQuery.value) {
    parts.push(
      t("reports.surgicalGuide.searchLabel") + ` "${searchQuery.value}"`,
    );
  }

  if (activeFilter.value !== "all" && activeFilterLabel.value) {
    parts.push(
      t("reports.surgicalGuide.filterLabel") + `: ${activeFilterLabel.value}`,
    );
  }

  if (
    filters.startDate !== "2014-01-01" ||
    filters.endDate !== "2020-12-31"
  ) {
    const startFormatted = new Date(filters.startDate).toLocaleDateString();
    const endFormatted = new Date(filters.endDate).toLocaleDateString();
    parts.push(
      t("reports.surgicalGuide.dateRangeLabel") +
        `: ${startFormatted} - ${endFormatted}`,
    );
  }

  return parts.length > 0 ? parts.join(" • ") : null;
});


// Computed property for vouchers used (orders with prepayment/partial prepayment)
const vouchersUsedCount = computed(() => {
  return (
    (summary.value?.fullyPrepaidOrders || 0) +
    (summary.value?.partiallyPostpaidOrders || 0)
  );
});

// Computed property for compact statistics chips
const compactStats = computed(() => {
  if (!summary.value) return [];
  
  return [
    {
      key: 'all',
      label: 'Total',
      value: formatNumber(summary.value.totalOrders || 0),
      icon: 'mdi-cart-outline',
      color: 'primary'
    },
    {
      key: 'free',
      label: 'Free',
      value: formatNumber(summary.value.freeOrders || 0),
      icon: 'mdi-gift-outline',
      color: 'success'
    },
    {
      key: 'fullyPrepaid',
      label: 'Prepaid',
      value: formatNumber(summary.value.fullyPrepaidOrders || 0),
      icon: 'mdi-ticket-confirmation-outline',
      color: 'info'
    },
    {
      key: 'fullyPostpaid',
      label: 'Postpaid',
      value: formatNumber(summary.value.fullyPostpaidOrders || 0),
      icon: 'mdi-clock-outline',
      color: 'error'
    },
    {
      key: 'partiallyPostpaid',
      label: 'Partial',
      value: formatNumber(summary.value.partiallyPostpaidOrders || 0),
      icon: 'mdi-cash-multiple',
      color: 'purple'
    },
    {
      key: 'vouchers',
      label: 'Vouchers',
      value: formatNumber(vouchersUsedCount.value),
      icon: 'mdi-ticket-percent-outline',
      color: 'cyan'
    },
    {
      key: 'rush',
      label: 'Rush',
      value: formatNumber(summary.value.rushOrders || 0),
      icon: 'mdi-fire',
      color: 'orange'
    },
    {
      key: 'onHold',
      label: 'On Hold',
      value: formatNumber(summary.value.onHoldOrders || 0),
      icon: 'mdi-pause-circle-outline',
      color: 'error'
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      value: formatNumber(summary.value.confirmedOrders || 0),
      icon: 'mdi-check-circle-outline',
      color: 'grey'
    },
    {
      key: 'active',
      label: 'Active',
      value: formatNumber(summary.value.activeOrders || 0),
      icon: 'mdi-play-circle-outline',
      color: 'success'
    }
  ];
});

// =====================================
// TABLE CONFIGURATION
// =====================================

// Main table headers (compact view - details in expandable row)
const tableHeaders = [
  {
    title: "",
    key: "data-table-expand",
    value: "data-table-expand",
    sortable: false,
    width: "48px",
  },
  {
    title: "ID",
    key: "orderSGID",
    value: "orderSGID",
    sortable: true,
    width: "140px",
  },
  {
    title: "Scan Center",
    key: "scanCenterFullName",
    value: "scanCenterFullName",
    sortable: true,
    width: "240px",
  },
  {
    title: "Doctor",
    key: "doctorFullName",
    value: "doctorFullName",
    sortable: true,
    width: "240px",
  },
  {
    title: "Patient",
    key: "patientName",
    value: "patientName",
    sortable: true,
    width: "180px",
  },
  {
    title: "Cost",
    key: "cost",
    value: "cost",
    sortable: true,
    align: "center",
    width: "110px",
  },
  {
    title: "Type",
    key: "typeLabel",
    value: "typeLabel",
    sortable: true,
    width: "100px",
  },
  {
    title: "Created",
    key: "createdTime",
    value: "createdTime",
    sortable: true,
    width: "130px",
  },
];

// Computed headers - rely on CSS direction (RTL) instead of reversing headers in JS
// Reversing headers in JS combined with setting direction can cause confusing layouts
// so we keep a stable header order and use CSS to present RTL correctly.
const computedTableHeaders = computed(() => tableHeaders);


// Track last options received from v-data-table-server to avoid duplicate fetch loops
// initialize to null so the first incoming options always trigger a load
const lastTableOptions = reactive({
  page: null,
  itemsPerPage: null,
  sortKey: null,
});

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
    showSnackbar(
      t("reports.surgicalGuide.verifyAccessFailed") ||
        "Failed to verify access permissions",
      "error",
    );
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
 * Uses global loader instead of local loading states
 * Has guard to prevent multiple simultaneous calls
 */
async function fetchReportData() {
  // Prevent multiple simultaneous calls
  if (isFetching) {
    return;
  }

  try {
    isFetching = true;
    // Show global loader

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

    // Fetch report and summary in parallel for better performance
    const promises = [
    // Fetch report data (always paginated) with timeout
      Promise.race([
      api.get("/api/reports/surgical_guide", { params }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 15000),
      ),
      ]),
    ];

    // Only fetch summary on first page or manual reload
    if (filters.page === 1) {
      promises.push(
        api.get("/api/reports/surgical_guide/summary", {
          params: { startDate: filters.startDate, endDate: filters.endDate },
        }),
      );
    }

    // Execute all API calls in parallel
    const responses = await Promise.all(promises);
    const reportResponse = responses[0];

    if (reportResponse.data.success) {
      // Use data directly from backend (already formatted and filtered by search)
      // Update data in a way that doesn't trigger excessive reactivity
      const newData = reportResponse.data.data || [];
      reportData.value = newData;
      filteredReportData.value = newData; // Server-side search, no client filtering needed

      // Disable table options to prevent it from re-triggering during our updates
      tableOptionsDisabled = true;

      // Update pagination from server response
      // Use Object.assign to update pagination without triggering reactivity loops
      const serverPagination = reportResponse.data.pagination;
      
      // Only update if values actually changed to prevent loops
      if (
        pagination.page !== serverPagination.page ||
        pagination.limit !== serverPagination.limit ||
        pagination.total !== serverPagination.total
      ) {
        Object.assign(pagination, {
          page: serverPagination.page,
          limit: serverPagination.limit,
          total: serverPagination.total,
          totalPages: serverPagination.totalPages,
          hasNextPage: serverPagination.hasNextPage,
          hasPrevPage: serverPagination.hasPrevPage,
        });
      }
      
      // Update lastTableOptions to prevent infinite loop when pagination updates
      // This ensures loadItems() won't trigger again when table detects pagination change
      lastTableOptions.page = serverPagination.page;
      lastTableOptions.itemsPerPage = serverPagination.limit;
      const currentSortKey = filters.sortBy && filters.sortOrder
        ? `${filters.sortBy}:${filters.sortOrder}`
        : "";
      lastTableOptions.sortKey = currentSortKey;
      
      // Mark initial load as complete
      isInitialLoad = false;
      
      // Re-enable table options after Vue finishes all reactive updates
      // Use nextTick + small delay to ensure Vuetify has also finished updating
      await nextTick();
      setTimeout(() => {
        tableOptionsDisabled = false;
      }, 50);
    }

    // Handle summary response if fetched
    if (filters.page === 1 && responses.length > 1) {
      const summaryResponse = responses[1];
      if (summaryResponse.data.success) {
        summary.value = summaryResponse.data.data;
      }
    }

  } catch (error) {
    const message =
      error.response?.data?.error?.message || "Failed to load report data";
    showSnackbar(message, "error");
    // Ensure flag is reset on error
    tableOptionsDisabled = false;
  } finally {
    // Hide global loader
    isFetching = false;
  }
}

/**
 * Apply search filter to report data (now triggers server-side search)
 * Called by watch() on searchQuery - no need for additional debouncing here
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
  // Clear any pending search timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
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
 * Has multiple guards to prevent infinite loops
 */
async function loadItems({ page, itemsPerPage, sortBy }) {
  // Guard: Prevent if table options are disabled (during programmatic updates)
  if (tableOptionsDisabled) {
    return;
  }

  // Guard: Prevent if already fetching
  if (isFetching) {
    return;
  }

  // Normalize incoming options
  const incomingSortKey =
    sortBy && sortBy.length > 0
      ? `${sortBy[0].key}:${sortBy[0].order || "asc"}`
      : "";

  // Guard: If options didn't change, ignore to prevent fetch loops
  if (
    lastTableOptions.page === page &&
    lastTableOptions.itemsPerPage === itemsPerPage &&
    lastTableOptions.sortKey === incomingSortKey
  ) {
    return;
  }

  // Guard: Prevent initial load from triggering multiple times
  if (isInitialLoad && page === 1 && itemsPerPage === 50 && !incomingSortKey) {
    // This is likely the initial mount trigger, let it through once
    isInitialLoad = false;
  } else if (isInitialLoad) {
    // Skip other initial triggers
    return;
  }

  // Update last seen options BEFORE updating filters to prevent loops
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
 * Uses global loader instead of local loading state
 */
async function exportToCSV() {
  try {
    // Show global loader

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
      throw new Error(
        t("reports.surgicalGuide.exportFailed") || "Export failed",
      );
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

    showSnackbar(
      t("reports.surgicalGuide.reportExported") ||
        "Report exported successfully",
      "success",
    );
  } catch (error) {
    showSnackbar(
      t("reports.surgicalGuide.exportFailed") || "Failed to export report",
      "error",
    );
  } finally {
    // Hide global loader
  }
}


/**
 * Format large numbers with K suffix
 */
function formatNumber(value) {
  if (!value && value !== 0) return "0";
  const num = parseFloat(value);
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
}

/**
 * Format currency values
 */
function formatCurrency(value) {
  if (!value && value !== 0)
    return t("reports.surgicalGuide.notSpecified") || "N/A";
  if (parseFloat(value) === 0)
    return t("reports.surgicalGuide.freeOrders") || "Free";
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
    0: t("reports.surgicalGuide.supportTypes.teeth"),
    1: t("reports.surgicalGuide.supportTypes.tissue"),
    2: t("reports.surgicalGuide.supportTypes.bone"),
  };
  return typeMap[typeValue] || "N/A";
}


/**
 * Get workflow status icon
 */
function getWorkflowIcon(item) {
  if (item.isRush === 1) return "mdi-fire";
  if (item.Q11_Val_4 !== 0 && item.Q11_Val_4 != null) return "mdi-pause-circle-outline";
  if (item.Q11_Val_2 !== 0 && item.Q11_Val_2 != null) return "mdi-check-circle-outline";
  if (item.Q11_Val_1 !== 0 && item.Q11_Val_1 != null) return "mdi-play-circle-outline";
  return null;
}

/**
 * Get workflow status icon color
 */
function getWorkflowIconColor(item) {
  if (item.isRush === 1) return "#E65100"; // Deep Orange
  if (item.Q11_Val_4 !== 0 && item.Q11_Val_4 != null) return "#F44336"; // Red/Error
  if (item.Q11_Val_2 !== 0 && item.Q11_Val_2 != null) return "#616161"; // Grey
  if (item.Q11_Val_1 !== 0 && item.Q11_Val_1 != null) return "#43A047"; // Green/Success
  return "";
}

/**
 * Get workflow status label for expanded row
 */
function getWorkflowStatusLabel(item) {
  if (item.isRush === 1) return t("reports.surgicalGuide.rushOrders");
  if (item.Q11_Val_4 !== 0 && item.Q11_Val_4 != null)
    return t("reports.surgicalGuide.onHold");
  if (item.Q11_Val_2 !== 0 && item.Q11_Val_2 != null)
    return t("reports.surgicalGuide.confirmed");
  if (item.Q11_Val_1 !== 0 && item.Q11_Val_1 != null)
    return t("reports.surgicalGuide.active");
  return t("reports.surgicalGuide.noStatusSet");
}




/**
 * Get payment status label
 */
function getPaymentStatusLabel(item) {
  const cost = parseFloat(item.cost || 0);
  const amountPaid = parseFloat(item.amountPaid || 0);

  if (cost === 0) return t("reports.surgicalGuide.freeOrders");
  if (amountPaid === 0) return t("reports.surgicalGuide.fullyPostpaid");
  if (amountPaid >= cost) return t("reports.surgicalGuide.fullyPrepaid");
  return t("reports.surgicalGuide.partiallyPostpaid");
}

/**
 * Get payment status color
 */
function getPaymentStatusColor(item) {
  const cost = parseFloat(item.cost || 0);
  const amountPaid = parseFloat(item.amountPaid || 0);

  // Distinct colors for payment status
  if (cost === 0) return "#43A047"; // Free - Green
  if (amountPaid === 0) return "#E53935"; // Fully Postpaid - Red
  if (amountPaid >= cost) return "#1565C0"; // Fully Prepaid - Deep Blue
  return "#8E24AA"; // Partially Postpaid - Purple
}

/**
 * Get payment status icon
 */
function getPaymentStatusIcon(item) {
  const cost = parseFloat(item.cost || 0);
  const amountPaid = parseFloat(item.amountPaid || 0);

  if (cost === 0) return "mdi-gift-outline";
  if (amountPaid === 0) return "mdi-clock-outline";
  if (amountPaid >= cost) return "mdi-ticket-confirmation-outline";
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
  if (item.Q11_Val_5 > Q11_max)
    return t("reports.surgicalGuide.status.qcShipping");
  if (item.Q11_Val_2 > Q11_max)
    return t("reports.surgicalGuide.status.confirmedByOEM");
  if (item.Q11_Val_4 > Q11_max) return t("reports.surgicalGuide.status.onHold");
  if (item.Q11_Val_3 > Q11_max)
    return t("reports.surgicalGuide.status.multiple");
  if (item.Q11_Val_1 > Q11_max) return t("reports.surgicalGuide.status.active");
  if (item.Q11_Val_20 > Q11_max)
    return t("reports.surgicalGuide.status.inProcess");
  return t("reports.surgicalGuide.status.inactive");
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
 * Automatically triggers search when query changes
 */
watch(
  searchQuery,
  (newVal, oldVal) => {
    // Skip if value hasn't actually changed (prevents unnecessary calls)
    if (newVal === oldVal) return;
    
    // Clear any pending timeout
  clearTimeout(searchTimeout);
    
    // Debounce the search to avoid excessive API calls
  searchTimeout = setTimeout(() => {
      // Only trigger search if not already fetching
      if (!isFetching) {
    applySearchFilter();
      }
  }, 300); // 300ms debounce
  },
  { immediate: false } // Don't trigger on initial mount
);

// =====================================
// LIFECYCLE
// =====================================

onMounted(async () => {
  // Disable table auto-updates during initial mount
  tableOptionsDisabled = true;
  
  // Fast initial render - defer non-critical work
  await checkAccess();

  // Ensure at least one initial load (some environments don't trigger table options)
  // But only if we have access and haven't loaded yet
  if (accessInfo.hasReportAccess && isInitialLoad) {
    // Use setTimeout to defer initial load and prevent race conditions
    setTimeout(() => {
      if (isInitialLoad && !isFetching) {
        isInitialLoad = false;
        // Temporarily enable table options for the initial load
        tableOptionsDisabled = false;
    loadItems({
      page: pagination.page,
      itemsPerPage: pagination.limit,
      sortBy: [],
        }).catch(() => {
          isInitialLoad = true; // Reset on error
          tableOptionsDisabled = false; // Ensure flag is reset
        });
      }
    }, 100); // Small delay to ensure component is fully mounted
  } else {
    // If no access, re-enable table options
    tableOptionsDisabled = false;
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
.rtl-table .mr-2 {
  margin-right: 0 !important;
  margin-left: 8px !important;
}
.rtl-table .mr-1 {
  margin-right: 0 !important;
  margin-left: 4px !important;
}
.rtl-table .ml-2 {
  margin-left: 0 !important;
  margin-right: 8px !important;
}
.rtl-table .ml-1 {
  margin-left: 0 !important;
  margin-right: 4px !important;
}

.ltr-table .mr-2 {
  margin-right: 8px !important;
  margin-left: 0 !important;
}
.ltr-table .mr-1 {
  margin-right: 4px !important;
  margin-left: 0 !important;
}
.ltr-table .ml-2 {
  margin-left: 8px !important;
  margin-right: 0 !important;
}
.ltr-table .ml-1 {
  margin-left: 4px !important;
  margin-right: 0 !important;
}

/* Ensure link order and arrow icons in cells read naturally in RTL */
.rtl-table .order-id-link {
  direction: rtl;
}
.ltr-table .order-id-link {
  direction: ltr;
}

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
.rtl-table .legend-item {
  flex-direction: row-reverse;
}

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
.ltr-table .order-id-cell > .payment-status-wrapper {
  order: 1 !important;
}
.ltr-table .order-id-cell > .order-id-link {
  order: 2 !important;
}
.ltr-table .order-id-cell > .workflow-status-wrapper {
  order: 3 !important;
}

/* RTL ordering: keep group anchored to the right but rely on order values for sequence */
.rtl-table .order-id-cell {
  justify-content: flex-end !important;
  text-align: right !important;
}
.rtl-table .order-id-cell > .payment-status-wrapper {
  order: 3 !important;
}
.rtl-table .order-id-cell > .order-id-link {
  order: 2 !important;
}
.rtl-table .order-id-cell > .workflow-status-wrapper {
  order: 1 !important;
}

/* Stronger target inside Vuetify wrapper to ensure alignment wins */
.rtl-table :deep(td) .order-id-cell,
.rtl-table :deep(.v-data-table__wrapper) .order-id-cell {
  justify-content: flex-end !important;
}
.ltr-table :deep(td) .order-id-cell,
.ltr-table :deep(.v-data-table__wrapper) .order-id-cell {
  justify-content: flex-start !important;
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
.rtl-table :deep(.mr-2) {
  margin-right: 0 !important;
  margin-left: 8px !important;
}
.rtl-table :deep(.mr-1) {
  margin-right: 0 !important;
  margin-left: 4px !important;
}
.rtl-table :deep(.ml-2) {
  margin-left: 0 !important;
  margin-right: 8px !important;
}

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
.ltr-table :deep(.mr-2) {
  margin-right: 8px !important;
  margin-left: 0 !important;
}
.ltr-table :deep(.mr-1) {
  margin-right: 4px !important;
  margin-left: 0 !important;
}
.ltr-table :deep(.ml-2) {
  margin-left: 8px !important;
  margin-right: 0 !important;
}

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

/* Professional pagination styling for RTL */
.rtl-table.ultra-compact-table :deep(.v-data-table-footer) {
  flex-direction: row-reverse;
}

.rtl-table.ultra-compact-table :deep(.v-data-table-footer__items-per-page) {
  order: 3;
}

.rtl-table.ultra-compact-table :deep(.v-data-table-footer__pagination) {
  order: 2;
}

.rtl-table.ultra-compact-table :deep(.v-data-table-footer__info) {
  order: 1;
  margin-left: 0;
  margin-right: auto;
}

/* Flip icon buttons (previous/next) horizontally so arrows point correctly */
.rtl-table :deep(.v-data-table-footer .v-btn--icon) {
  transform: scaleX(-1) !important;
}



/* Performance Optimizations - Fix CLS & LCP */
.header-container {
  min-height: 80px; /* Reserve space to prevent layout shift */
}

.compact-header {
  min-height: 50px !important;
}

.header-title {
  font-size: 2rem;
  line-height: 2.5rem;
  min-height: 2.5rem;
 
}

.compact-header-title {
  font-size: 1.25rem !important;
  line-height: 1.5rem !important;
  min-height: 1.5rem !important;
  margin-bottom: 2px !important;
}

.header-subtitle {
  font-size: 1rem;
  line-height: 1.5rem;
  min-height: 1.5rem;
  contain: layout style; /* Isolate layout calculations */
  font-display: swap; /* Optimize font loading */
}

.compact-header-subtitle {
  font-size: 0.75rem !important;
  line-height: 1rem !important;
  min-height: 1rem !important;
  margin-top: 0 !important;
}

/* Prevent layout shifts from cards */
.v-card {
  contain: layout style paint;
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
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
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

.primary-bar {
  background: rgb(var(--v-theme-primary));
}
.success-bar {
  background: rgb(var(--v-theme-success));
}
.info-bar {
  background: rgb(var(--v-theme-info));
}
.warning-bar {
  background: #ff9800;
}
.amber-bar {
  background: #ffa726;
}
.orange-bar {
  background: #e65100;
}
.error-bar {
  background: rgb(var(--v-theme-error));
}
.grey-bar {
  background: #616161;
}
.success-alt-bar {
  background: rgb(var(--v-theme-success));
}

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

/* Highlight Expanded Row */


.expanded-cell {
  padding: 0 !important;
  background: rgb(var(--v-theme-surface)) !important;
  border-top: 1px solid #ff9800 !important;
}

.v-theme--dark .expanded-cell {
  background: rgb(var(--v-theme-surface)) !important;
  border-top-color: #ff9800 !important;
}

.minimal-expanded-container {
  position: relative;
  padding: 4px 8px;
}

/* Professional Details Table - Main Table */
.professional-details-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  border-radius: 0;
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.professional-details-table tbody tr {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.v-theme--dark .professional-details-table {
  background: rgb(var(--v-theme-surface)) !important;
  border-color: rgba(255, 255, 255, 0.12);
}

.v-theme--dark .professional-details-table tbody tr {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.professional-details-table tbody tr:last-child {
  border-bottom: none;
}

.detail-label {
  padding: 3px 8px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.6);
  background: rgba(var(--v-theme-on-surface), 0.04);
  white-space: nowrap;
  width: 100px;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1.3;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.v-theme--dark .detail-label {
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.12);
}

.detail-value {
  padding: 3px 8px;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  font-size: 0.75rem;
  line-height: 1.3;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.v-theme--dark .detail-value {
  color: rgba(255, 255, 255, 0.87);
  background: rgb(var(--v-theme-surface));
  border-color: rgba(255, 255, 255, 0.12);
}

/* Clickable Links in Detail Values */
.detail-link {
  color: rgb(var(--v-theme-primary));
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.detail-link:hover {
  color: rgb(var(--v-theme-primary));
  opacity: 0.8;
  text-decoration: underline;
}

.v-theme--dark .detail-link {
  color: rgb(var(--v-theme-primary));
}

.v-theme--dark .detail-link:hover {
  opacity: 0.9;
}

/* Voucher Inline Display */
.voucher-inline {
  display: inline;
  color: rgb(var(--v-theme-primary));
  font-weight: 500;
}

.v-theme--dark .voucher-inline {
  color: rgb(var(--v-theme-primary));
}

/* Voucher Details Table - Below Main Table (Exact Match) */
.voucher-details-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  border-radius: 0;
  margin-top: 6px;
}

.voucher-details-table tbody tr {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.v-theme--dark .voucher-details-table {
  background: rgb(var(--v-theme-surface)) !important;
  border-color: rgba(255, 255, 255, 0.12);
}

.v-theme--dark .voucher-details-table tbody tr {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.voucher-details-table tbody tr:last-child {
  border-bottom: none;
}

.voucher-row {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.v-theme--dark .voucher-row {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.voucher-amount {
  font-weight: 600;
}

.voucher-status {
  text-align: center;
}

.voucher-total-row {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.v-theme--dark .voucher-total-row {
  border-top-color: rgba(255, 255, 255, 0.08);
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

/* Hover effect on expandable rows */
.enhanced-table :deep(tr:hover .v-data-table__expand-icon) {
  transform: scale(1.2);
  transition: transform 0.2s ease;
}

/* Removed old voucher expansion panel styles - now using inline chips */


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
/* Override CSS variables for this component's tables */
.surgical-guide-report :deep(.v-data-table),
.surgical-guide-report :deep(.v-table),
.surgical-guide-report :deep(.v-data-table__wrapper),
.surgical-guide-report :deep(.v-table__wrapper) {
  --border-radius-lg: 0 !important;
  --border-radius-md: 0 !important;
  --border-radius-sm: 0 !important;
}

.enhanced-table .v-data-table__wrapper {
  background: #fafbfc;
}
/* Remove border-radius from all table elements */
.enhanced-table :deep(.v-data-table__wrapper),
.enhanced-table :deep(.v-table__wrapper),
.enhanced-table :deep(.v-data-table),
.enhanced-table :deep(.v-table),
.enhanced-table :deep(thead),
.enhanced-table :deep(thead tr) {
  border-radius: 0 !important;
}

/* Table header styling with primary brand color */
.enhanced-table :deep(.v-data-table__th),
.enhanced-table .v-data-table__th,
.enhanced-table :deep(thead th),
.enhanced-table thead th {
  position: sticky;
  top: 0;
  z-index: 2;
  font-size: 0.95rem;
  font-weight: 700;
  color: #FFFFFF !important; /* White text */
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 3px solid #E65100;
  padding: 12px 10px !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  contain: layout style paint; /* Performance isolation */
  border-radius: 0 !important;
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
  font-size: 0.85rem;
  padding: 2px 8px;
}

/* Ultra compact overrides */
.ultra-compact-table .v-data-table__td {
  font-size: 0.8rem !important;
  padding: 2px 8px !important;
  height: 32px !important;
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

/* ===================================== */
/* ENHANCED GRID LAYOUT */
/* ===================================== */


.compact-filters-col {
  padding: 0;
  padding-right: 16px;
}

.compact-filters-card {
  border-radius: 0;
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.v-theme--dark .compact-filters-card {
  background: rgb(var(--v-theme-surface)) !important;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
}

.compact-filters-content {
  padding: 16px !important;
  background: transparent !important;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}

.flex-1 {
  flex: 1 1 0;
}

/* Compact Statistics Tags - Horizontal Layout */
/* Enhanced Statistics Section */
.enhanced-stats-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.v-theme--dark .enhanced-stats-section {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.stats-section-title {
    display: flex;
  align-items: center;
  margin-bottom: 12px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.v-theme--dark .stats-section-title {
  color: rgba(255, 255, 255, 0.7);
}

.enhanced-stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.enhanced-stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 56px;
}

.v-theme--dark .enhanced-stat-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.enhanced-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-color: rgba(var(--v-theme-primary), 0.3);
}

.v-theme--dark .enhanced-stat-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  border-color: rgba(255, 140, 0, 0.4);
}

.enhanced-stat-card.stat-card-active {
  background: rgba(var(--v-theme-primary), 0.1);
  border: 2px solid rgb(var(--v-theme-primary));
  box-shadow: 0 2px 8px rgba(var(--v-theme-primary), 0.2);
}

.v-theme--dark .enhanced-stat-card.stat-card-active {
  background: rgba(255, 140, 0, 0.15);
  border-color: rgb(var(--v-theme-primary));
}

.stat-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  flex-shrink: 0;
  background: rgba(var(--v-theme-on-surface), 0.05);
}

.v-theme--dark .stat-card-icon {
  background: rgba(255, 255, 255, 0.08);
}

.stat-icon-primary {
  background: rgba(255, 140, 0, 0.1) !important;
  color: #ff8c00;
}

.stat-icon-success {
  background: rgba(67, 160, 71, 0.1) !important;
  color: #43a047;
}

.stat-icon-info {
  background: rgba(25, 118, 210, 0.1) !important;
  color: #1976d2;
}

.stat-icon-error {
  background: rgba(229, 57, 53, 0.1) !important;
  color: #e53935;
}

.stat-icon-purple {
  background: rgba(142, 36, 170, 0.1) !important;
  color: #8e24aa;
}

.stat-icon-cyan {
  background: rgba(0, 188, 212, 0.1) !important;
  color: #00bcd4;
}

.stat-icon-orange {
  background: rgba(230, 81, 0, 0.1) !important;
  color: #e65100;
}

.stat-icon-grey {
  background: rgba(97, 97, 97, 0.1) !important;
  color: #616161;
}

.stat-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.stat-card-label {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 500;
  line-height: 1.2;
}

.v-theme--dark .stat-card-label {
  color: rgba(255, 255, 255, 0.6);
}

.stat-card-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  line-height: 1.2;
}

.v-theme--dark .stat-card-value {
  color: rgba(255, 255, 255, 0.9);
}

.enhanced-stat-card.stat-card-active .stat-card-value {
  color: rgb(var(--v-theme-primary));
}

.v-theme--dark .enhanced-stat-card.stat-card-active .stat-card-value {
  color: rgb(var(--v-theme-primary));
}

/* Responsive adjustments for enhanced layout */
@media (max-width: 959px) {
  .compact-filters-content {
    padding: 12px !important;
  }
  
  .enhanced-stats-grid {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .enhanced-stat-card {
    padding: 8px 10px;
    min-height: 52px;
  }
  
  .stat-card-icon {
    width: 32px;
    height: 32px;
  }
  
  .stat-card-value {
    font-size: 1rem;
  }
}

.filters-col {
  padding: 8px;
}

.filters-card {
  height: 100%;
    display: flex;
  flex-direction: column;
}



.filters-card-title .v-icon {
  color: white !important;
}

/* Dark mode support for filter card */
.v-theme--dark .filters-card-title {
  background: linear-gradient(135deg, #ff8c00 0%, #ff7700 100%);
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

.filters-card-content {
  flex: 1;
  padding: 20px;
}

/* Compact Summary Cards Section */
.compact-summary-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 2px solid rgba(0, 0, 0, 0.08);
}

.compact-summary-title {
  display: flex;
  align-items: center;
  color: rgba(0, 0, 0, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.compact-summary-cards {
  gap: 8px;
}

.compact-card-col {
  padding: 4px !important;
}

.compact-summary-card {
  height: 100%;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 6px;
}

.compact-summary-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}


.compact-card-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  width: 100%;
}

.compact-card-content {
  padding: 8px 6px !important;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 4px;
  min-height: 80px;
}

.compact-card-icon {
  margin-bottom: 2px;
}

.compact-card-value {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0;
}

.compact-card-label {
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
  text-align: center;
  line-height: 1.2;
}

/* Dark mode support for compact cards */
.v-theme--dark .compact-summary-section {
  border-top-color: rgba(255, 255, 255, 0.12);
}

.v-theme--dark .compact-summary-title {
  color: rgba(255, 255, 255, 0.7);
}

.v-theme--dark .compact-card-label {
  color: rgba(255, 255, 255, 0.6);
}



.table-col {
  padding: 0;
  padding-left: 16px;
}

.table-card {
  width: 100%;
  overflow: hidden;
  border-radius: 0;
  background: rgb(var(--v-theme-surface)) !important;
}

.v-theme--dark .table-card {
  background: rgb(var(--v-theme-surface)) !important;
}

.table-card-title {
  padding: 8px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  min-height: 40px;
}

.table-card-title.compact-title {
  padding: 6px 12px;
  min-height: 36px;
}

.table-card :deep(.v-card-text) {
  padding: 8px !important;
  background: transparent !important;
}

/* Dark mode support for table card */
.v-theme--dark .table-card-title {
  border-bottom-color: rgba(255, 255, 255, 0.12);
}

/* Ultra Compact Table Styling */
.ultra-compact-table {
  font-size: 0.85rem;
}

/* Compact Legend */
.compact-legend {
  padding: 6px 12px !important;
  min-height: 32px;
}

.compact-legend .legend-item {
  gap: 4px;
}

/* Ultra Compact Table Headers */
.ultra-compact-table :deep(.v-data-table__th),
.ultra-compact-table :deep(thead th),
.ultra-compact-table :deep(thead tr),
.ultra-compact-table :deep(thead),
.ultra-compact-table :deep(.v-data-table__wrapper),
.ultra-compact-table :deep(.v-table__wrapper),
.ultra-compact-table :deep(.v-data-table),
.ultra-compact-table :deep(.v-table) {
  border-radius: 0 !important;
}

.ultra-compact-table :deep(.v-data-table__th),
.ultra-compact-table :deep(thead th) {
  padding: 4px 8px !important;
  font-size: 0.75rem !important;
  font-weight: 600;
  height: 30px !important;
  line-height: 1.2;
  background: #FF8C00 !important; /* Primary orange background */
  color: #FFFFFF !important; /* White text */
  border-radius: 0 !important;
}

/* Ultra Compact Table Cells */
.ultra-compact-table :deep(.v-data-table__td),
.ultra-compact-table :deep(tbody td) {
  padding: 2px 8px !important;
  font-size: 0.8rem !important;
  height: 32px !important;
  line-height: 1.2;
}

/* Compact Icons in Table */
.ultra-compact-table :deep(.v-icon) {
  font-size: 16px !important;
  width: 16px !important;
  height: 16px !important;
}

.ultra-compact-table :deep(.v-icon[size="small"]) {
  font-size: 14px !important;
  width: 14px !important;
  height: 14px !important;
}

.ultra-compact-table :deep(.v-icon[size="x-small"]) {
  font-size: 12px !important;
  width: 12px !important;
  height: 12px !important;
}

/* Compact Chips in Table */
.ultra-compact-table :deep(.v-chip) {
  height: 18px !important;
  font-size: 0.65rem !important;
  padding: 0 4px !important;
}

/* Compact Expand Icon */
.ultra-compact-table :deep(.v-data-table__expand-icon) {
  width: 20px !important;
  height: 20px !important;
  font-size: 16px !important;
}

/* Professional Compact Table Footer */
.ultra-compact-table :deep(.v-data-table-footer) {
  padding: 6px 16px !important;
  min-height: 40px;
  max-height: 40px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  background: rgb(var(--v-theme-surface)) !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: nowrap;
}

.v-theme--dark .ultra-compact-table :deep(.v-data-table-footer) {
  border-top-color: rgba(255, 255, 255, 0.08);
}

/* Items per page selector - compact and properly positioned */
.ultra-compact-table :deep(.v-data-table-footer__items-per-page) {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: auto;
  flex-shrink: 0;
  order: 1;
}

.ultra-compact-table :deep(.v-data-table-footer__items-per-page > span) {
  white-space: nowrap;
  color: rgba(var(--v-theme-on-surface), 0.7);
  font-size: 0.75rem;
}

.v-theme--dark .ultra-compact-table :deep(.v-data-table-footer__items-per-page > span) {
  color: rgba(255, 255, 255, 0.7);
}

.ultra-compact-table :deep(.v-data-table-footer__items-per-page .v-select) {
  font-size: 0.75rem;
  min-width: 60px;
  max-width: 80px;
}

.ultra-compact-table :deep(.v-data-table-footer__items-per-page .v-field) {
  padding: 2px 8px !important;
  min-height: 28px !important;
  height: 28px !important;
}

.ultra-compact-table :deep(.v-data-table-footer__items-per-page .v-field__input) {
  min-height: 24px !important;
  padding: 0 4px !important;
  font-size: 0.75rem !important;
}

.ultra-compact-table :deep(.v-data-table-footer__items-per-page .v-field__append-inner) {
  padding: 0 4px !important;
}

.ultra-compact-table :deep(.v-data-table-footer__items-per-page .v-icon) {
  font-size: 16px !important;
  width: 16px !important;
  height: 16px !important;
}

/* Pagination controls - compact and professional, centered */
.ultra-compact-table :deep(.v-data-table-footer__pagination) {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  flex: 1;
  justify-content: center;
  order: 2;
  margin: 0 auto;
}

.ultra-compact-table :deep(.v-data-table-footer__pagination .v-btn) {
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  font-size: 0.75rem !important;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.ultra-compact-table :deep(.v-data-table-footer__pagination .v-btn--icon) {
  min-width: 28px !important;
  width: 28px !important;
  height: 28px !important;
}

.ultra-compact-table :deep(.v-data-table-footer__pagination .v-btn .v-icon) {
  font-size: 18px !important;
  width: 18px !important;
  height: 18px !important;
}

.ultra-compact-table :deep(.v-data-table-footer__pagination .v-btn:hover) {
  background: rgba(var(--v-theme-on-surface), 0.08) !important;
}

.v-theme--dark .ultra-compact-table :deep(.v-data-table-footer__pagination .v-btn:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
}

.ultra-compact-table :deep(.v-data-table-footer__pagination .v-btn--disabled) {
  opacity: 0.3;
  cursor: not-allowed;
}

/* Page info text - compact and properly positioned */
.ultra-compact-table :deep(.v-data-table-footer__info) {
  font-size: 0.75rem;
  color: rgba(var(--v-theme-on-surface), 0.7);
  padding: 0;
  white-space: nowrap;
  min-width: auto;
  flex-shrink: 0;
  order: 3;
  margin-left: auto;
}

.v-theme--dark .ultra-compact-table :deep(.v-data-table-footer__info) {
  color: rgba(255, 255, 255, 0.7);
}

/* Compact chip for page numbers */
.ultra-compact-table :deep(.v-data-table-footer__pagination .v-chip) {
  height: 24px !important;
  font-size: 0.7rem !important;
  padding: 0 6px !important;
  min-width: 24px !important;
  border-radius: 4px;
  font-weight: 500;
}

/* Responsive pagination - better mobile layout */
@media (max-width: 960px) {
  .ultra-compact-table :deep(.v-data-table-footer) {
    flex-wrap: wrap;
    gap: 12px;
    padding: 8px 12px !important;
    min-height: auto;
    max-height: none;
    justify-content: center;
  }

  .ultra-compact-table :deep(.v-data-table-footer__items-per-page) {
    order: 1;
    width: 100%;
    justify-content: center;
    margin-bottom: 4px;
  }

  .ultra-compact-table :deep(.v-data-table-footer__pagination) {
    order: 2;
    width: 100%;
    justify-content: center;
    flex: none;
    margin: 0;
  }

  .ultra-compact-table :deep(.v-data-table-footer__info) {
    order: 3;
    width: 100%;
    text-align: center;
    margin: 4px 0 0 0;
  }
}

/* Reduce row spacing */
.ultra-compact-table :deep(tbody tr) {
  height: 32px !important;
}

/* Compact expanded row content */
.ultra-compact-table :deep(.expanded-row-minimal) {
  padding: 2px 0 !important;
}

.ultra-compact-table :deep(.minimal-expanded-container) {
  padding: 4px 8px !important;
}

.ultra-compact-table :deep(.professional-details-table),
.ultra-compact-table :deep(.voucher-details-table) {
  font-size: 0.7rem;
}

.ultra-compact-table :deep(.detail-label),
.ultra-compact-table :deep(.detail-value) {
  padding: 2px 6px !important;
  font-size: 0.7rem;
  line-height: 1.2;
}

.ultra-compact-table :deep(.detail-label) {
  font-size: 0.65rem;
}

.ultra-compact-table :deep(.professional-details-table .v-icon),
.ultra-compact-table :deep(.voucher-details-table .v-icon) {
  font-size: 14px !important;
  width: 14px !important;
  height: 14px !important;
}

/* Container spacing improvements - Compact for maximum table visibility */
.surgical-guide-report {
  padding: 8px;
}

@media (min-width: 960px) {
  .surgical-guide-report {
    padding: 12px;
  }
}

@media (min-width: 1264px) {
  .surgical-guide-report {
    padding: 16px;
  }
}




/* Improved responsive behavior for filters */
@media (max-width: 959px) {
  .filters-col {
    margin-bottom: 16px;
  }
  
  .filters-card {
    margin-bottom: 0;
  }
}

/* Better grid alignment - Remove gaps between filters and table */
.v-row.no-gutters {
  margin-left: 0;
  margin-right: 0;
}

.v-row.no-gutters > .compact-filters-col {
  padding-left: 0;
  padding-right: 16px;
}

.v-row.no-gutters > .table-col {
  padding-left: 16px;
  padding-right: 0;
}
.compact-footer{
  background: none !important;
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
