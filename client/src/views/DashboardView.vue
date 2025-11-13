<template>
  <!-- Loading Skeleton -->
  <v-container v-if="isPageLoading" class="fill-height">
    <v-row>
      <v-col cols="12">
        <v-skeleton-loader type="heading" class="mb-4"></v-skeleton-loader>
        <v-skeleton-loader type="chip" class="mb-4"></v-skeleton-loader>
        <v-row>
          <v-col v-for="i in 4" :key="i" cols="12" sm="6" md="3">
            <v-skeleton-loader type="card"></v-skeleton-loader>
          </v-col>
        </v-row>
        <v-skeleton-loader type="table" class="mt-4"></v-skeleton-loader>
      </v-col>
    </v-row>
  </v-container>

  <!-- Main Content -->
  <v-container v-else>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center mb-2">
        <!-- DevToolbar floating controls are now the only dev mode UI -->
        <div></div>
      </v-col>
    </v-row>

    <!-- DevToolbar floating controls are now the only dev mode UI -->

    <v-row>
      <v-col cols="12">
        <PageHeader
          :title="$t('dashboard.title') || 'Dashboard'"
          :subtitle="$t('dashboard.subtitle') || 'Overview of your account and system status'"
          icon="mdi-view-dashboard"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">

        <v-alert
          type="info"
          variant="tonal"
          class="mb-6 stable-card"
          style="min-height: 110px; height: 110px"
        >
          <v-alert-title style="min-height: 24px">
            <template v-if="!loadingDetails">
              {{ $t("dashboard.welcomeTitle") || "Welcome!" }}
            </template>
            <template v-else>
              <v-skeleton-loader type="heading" width="120px" height="24px" />
            </template>
          </v-alert-title>
          <div style="min-height: 24px">
            <template v-if="!loadingDetails">
              {{
                $t("dashboard.welcomeMessage") ||
                "You are successfully authenticated with Google OAuth 2.0"
              }}
            </template>
            <template v-else>
              <v-skeleton-loader type="text" width="320px" height="24px" />
            </template>
          </div>
        </v-alert>

        <!-- User Info Card -->
        <v-card
          class="mb-6 stable-card"
          elevation="3"
          style="min-height: 280px"
        >
          <v-card-title>
            <v-icon class="mr-2">mdi-account-details</v-icon>
            {{ $t("dashboard.userDetailsOrganization") }}
          </v-card-title>
          <v-card-text>
            <template v-if="loadingDetails">
              <!-- Global loader will display for API calls; local inline spinner removed -->
            </template>
            <template v-else-if="userDetails">
              <v-row>
                <v-col cols="12" md="6">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title>{{
                        $t("dashboard.fullName")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        userDetails.fullName || $t("dashboard.notProvided")
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        $t("dashboard.email") || "Email"
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        userDetails.email ||
                        userDetails.primaryEmail ||
                        $t("dashboard.notProvided")
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        $t("dashboard.organizationUnit")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        userDetails.orgUnit || $t("dashboard.none")
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        $t("dashboard.department")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>{{
                        userDetails.department || $t("dashboard.none")
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title>{{
                        $t("dashboard.twoFactorAuthentication")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip
                          :color="
                            userDetails.isEnrolledIn2Sv ? 'success' : 'warning'
                          "
                          size="small"
                        >
                          {{
                            userDetails.isEnrolledIn2Sv
                              ? $t("dashboard.tfaEnabled")
                              : $t("dashboard.tfaDisabled")
                          }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>{{
                        $t("dashboard.accountStatus")
                      }}</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip
                          :color="userDetails.suspended ? 'error' : 'success'"
                          size="small"
                        >
                          {{
                            userDetails.suspended
                              ? $t("dashboard.suspended") || "Suspended"
                              : $t("dashboard.active")
                          }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="userDetails.isAdmin">
                      <v-list-item-title>Admin Status</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip color="primary" size="small">
                          {{ userDetails.isAdmin ? "Administrator" : "User" }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item v-if="userDetails.lastLoginTime">
                      <v-list-item-title>Last Login</v-list-item-title>
                      <v-list-item-subtitle>{{
                        formatDate(userDetails.lastLoginTime)
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>

              <!-- Employee Information Section -->
              <v-divider class="my-6"></v-divider>
              <v-row>
                <v-col cols="12" class="pb-0">
                  <h4 class="text-subtitle-1 font-weight-bold mb-4">
                    <v-icon class="mr-2" size="20">mdi-badge-account</v-icon>
                    Employee Information
                  </h4>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list density="compact" class="bg-transparent">
                    <v-list-item class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Employee ID</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        userDetails.employeeId || "Not set"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Job Title</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        userDetails.jobTitle || "Not set"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Type of Employee</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        userDetails.type || "Not set"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Manager's Email</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        userDetails.managerEmail || "Not set"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list density="compact" class="bg-transparent">
                    <v-list-item class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Department</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        userDetails.department || "Not set"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Cost Center</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        userDetails.costCenter || "Not set"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Building ID</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">{{
                        userDetails.buildingId || "Not set"
                      }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Floor</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2">
                        {{ userDetails.floorName || "Not set"
                        }}{{
                          userDetails.floorSection
                            ? ` - ${userDetails.floorSection}`
                            : ""
                        }}
                      </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>

              <!-- Contact Information Section -->
              <v-divider class="my-6"></v-divider>
              <v-row>
                <v-col cols="12" class="pb-0">
                  <h4 class="text-subtitle-1 font-weight-bold mb-4">
                    <v-icon class="mr-2" size="20"
                      >mdi-card-account-phone</v-icon
                    >
                    Contact Information
                  </h4>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list density="compact" class="bg-transparent">
                    <!-- Phones -->
                    <template v-if="userDetails.phones?.length > 0">
                      <v-list-item
                        v-for="(phone, index) in userDetails.phones"
                        :key="`phone-${index}`"
                        class="px-0"
                      >
                        <v-list-item-title
                          class="text-body-2 font-weight-medium mb-1"
                        >
                          Phone ({{ phone.type }})
                          <v-chip
                            v-if="phone.primary"
                            size="x-small"
                            color="primary"
                            class="ml-2"
                            >Primary</v-chip
                          >
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-2">{{
                          phone.value
                        }}</v-list-item-subtitle>
                      </v-list-item>
                    </template>
                    <v-list-item v-else class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Phone</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2"
                        >Not set</v-list-item-subtitle
                      >
                    </v-list-item>

                    <!-- Secondary Emails -->
                    <template v-if="userDetails.secondaryEmails?.length > 0">
                      <v-list-item
                        v-for="(email, index) in userDetails.secondaryEmails"
                        :key="`email-${index}`"
                        class="px-0"
                      >
                        <v-list-item-title
                          class="text-body-2 font-weight-medium mb-1"
                        >
                          Email ({{ email.type }})
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-body-2">{{
                          email.address
                        }}</v-list-item-subtitle>
                      </v-list-item>
                    </template>
                    <v-list-item v-else class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Alternate Email</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2"
                        >Not set</v-list-item-subtitle
                      >
                    </v-list-item>
                  </v-list>
                </v-col>
                <v-col cols="12" md="6">
                  <v-list density="compact" class="bg-transparent">
                    <!-- Addresses -->
                    <template v-if="userDetails.addresses?.length > 0">
                      <v-list-item
                        v-for="(address, index) in userDetails.addresses"
                        :key="`address-${index}`"
                        class="px-0"
                      >
                        <v-list-item-title
                          class="text-body-2 font-weight-medium mb-1"
                        >
                          Address ({{ address.type }})
                          <v-chip
                            v-if="address.primary"
                            size="x-small"
                            color="primary"
                            class="ml-2"
                            >Primary</v-chip
                          >
                        </v-list-item-title>
                        <v-list-item-subtitle
                          v-if="address.formatted"
                          class="text-body-2"
                        >
                          {{ address.formatted }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle
                          v-else-if="address.streetAddress"
                          class="text-body-2"
                        >
                          {{ address.streetAddress }}, {{ address.locality }},
                          {{ address.region }} {{ address.postalCode }},
                          {{ address.country }}
                        </v-list-item-subtitle>
                        <v-list-item-subtitle v-else class="text-body-2">
                          Not set
                        </v-list-item-subtitle>
                      </v-list-item>
                    </template>
                    <v-list-item v-else class="px-0">
                      <v-list-item-title
                        class="text-body-2 font-weight-medium mb-1"
                        >Address</v-list-item-title
                      >
                      <v-list-item-subtitle class="text-body-2"
                        >Not set</v-list-item-subtitle
                      >
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>

              <!-- Groups Section -->
              <v-divider class="my-6"></v-divider>
              <v-row>
                <v-col cols="12">
                  <h4 class="text-subtitle-1 font-weight-bold mb-4">
                    <v-icon class="mr-2" size="20">mdi-account-group</v-icon>
                    {{ $t("dashboard.groups") }}
                  </h4>

                  <!-- Groups Table -->
                  <v-card
                    v-if="
                      userDetails.groupRoles &&
                      userDetails.groupRoles.length > 0
                    "
                    variant="outlined"
                  >
                    <v-table density="comfortable">
                      <thead>
                        <tr class="groups-table-header">
                          <th class="text-left">
                            <span
                              class="text-subtitle-2 font-weight-bold text-uppercase"
                              >Group</span
                            >
                          </th>
                          <th class="text-left">
                            <span
                              class="text-subtitle-2 font-weight-bold text-uppercase"
                              >Role in Group</span
                            >
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="groupRole in userDetails.groupRoles"
                          :key="groupRole.groupEmail"
                        >
                          <td>
                            <div class="d-flex align-center">
                              <v-icon size="18" class="mr-2" color="primary"
                                >mdi-google-circles-communities</v-icon
                              >
                              <div>
                                <div class="text-body-2 font-weight-medium">
                                  {{ groupRole.groupName }}
                                </div>
                                <div class="text-caption text-medium-emphasis">
                                  {{ groupRole.groupEmail }}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <v-chip
                              :color="getRoleColor(groupRole.userRole)"
                              size="small"
                              variant="flat"
                            >
                              {{ formatRole(groupRole.userRole) }}
                            </v-chip>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card>

                  <!-- Fallback for old format or no groups -->
                  <div
                    v-else-if="
                      userDetails.groups && userDetails.groups.length > 0
                    "
                  >
                    <v-chip
                      v-for="group in userDetails.groups"
                      :key="group"
                      class="mr-3 mb-2"
                      color="primary"
                      variant="flat"
                      size="small"
                    >
                      {{ group }}
                    </v-chip>
                  </div>

                  <p v-else class="text-body-2 text-medium-emphasis">
                    {{ $t("dashboard.none") || "none" }}
                  </p>
                </v-col>
              </v-row>
            </template>
            <template v-else>
              <div class="text-center py-4">
                <span class="dots-loader" aria-label="Loading"></span>
                <p class="mt-2 text-body-2">
                  {{ $t("dashboard.loadingUserDetails") }}
                </p>
              </div>
            </template>
          </v-card-text>
        </v-card>

        <!-- Access Restriction Notice for Users with Limited Access -->
        <v-alert
          v-if="hasRestrictedAccess && userRights"
          type="info"
          variant="tonal"
          class="mb-6"
          prominent
          border="start"
        >
          <v-alert-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-shield-lock-outline</v-icon>
            Limited Access
          </v-alert-title>
          <div class="mt-2">
            <p class="text-body-1 mb-2">
              Your account has access to basic user information. The following
              sections are restricted:
            </p>
            <ul class="text-body-2 mb-3 ml-4">
              <li v-for="section in restrictedSections" :key="section">
                {{ section }}
              </li>
            </ul>
            <p class="text-body-2 text-medium-emphasis">
              To access these sections, contact your administrator to be added
              to one of the following groups:
              <strong>{{ requiredGroups.join(", ") }}</strong>
            </p>
          </div>
        </v-alert>

        <!-- User Rights & Permissions -->
        <v-card
          v-if="canViewUserRights"
          class="mb-6 stable-card"
          elevation="3"
          style="min-height: 320px"
        >
          <v-card-title>
            <v-icon class="mr-2">mdi-shield-account</v-icon>
            {{ $t("dashboard.userRightsPermissions") }}
          </v-card-title>
          <v-card-text v-if="userRights">
            <div class="mb-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="tonal" color="primary">
                    <v-card-text class="text-center py-3">
                      <v-icon size="32" class="mb-2">mdi-account</v-icon>
                      <div class="text-h6">{{ userRights.userEmail }}</div>
                      <div class="text-body-2">
                        {{ $t("dashboard.authorizationSubject") }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="tonal" color="success">
                    <v-card-text class="text-center py-3">
                      <v-icon size="32" class="mb-2">mdi-shield-check</v-icon>
                      <div class="text-h6">
                        {{ userRights.rights.length }}
                        {{ $t("dashboard.resources") }}
                      </div>
                      <div class="text-body-2">
                        {{ $t("dashboard.accessGranted") }}
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Permissions Matrix -->
            <div
              v-if="loadingRights"
              style="text-align: center; padding: 60px 0"
            >
              <!-- local spinner removed; rely on global loader -->
            </div>
            <div
              v-else-if="userRights.rights.length === 0"
              class="text-center py-8"
            >
              <v-icon size="64" color="warning">mdi-shield-off</v-icon>
              <p class="text-h6 mt-4">
                {{ $t("dashboard.noPermissionsGranted") }}
              </p>
              <p class="text-body-2 text-medium-emphasis">
                {{ $t("dashboard.noResourcesAccessible") }}
              </p>
            </div>

            <!-- User Rights as Cards -->
            <v-row v-else class="mb-4">
              <v-col
                v-for="right in userRights.rights"
                :key="right.resource"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card class="mb-4" elevation="2">
                  <v-card-title class="d-flex align-center">
                    <v-icon class="mr-2" color="primary">mdi-shield-key</v-icon>
                    <span class="text-subtitle-1 font-weight-bold">{{
                      right.resource
                    }}</span>
                  </v-card-title>
                  <v-card-text>
                    <div class="mb-2">
                      <span class="font-weight-medium">Allowed Actions:</span>
                      <div class="mt-2">
                        <v-chip
                          v-for="action in right.actions"
                          :key="action"
                          class="mr-2 mb-2"
                          :color="getActionColor(action)"
                          variant="flat"
                          prepend-icon="mdi-check"
                          size="small"
                        >
                          {{ action }}
                        </v-chip>
                      </div>
                    </div>
                    <v-divider class="my-3"></v-divider>
                    <div>
                      <span class="font-weight-medium">Test Access:</span>
                      <div class="mt-2">
                        <v-btn
                          v-for="action in right.actions"
                          :key="`test-${action}`"
                          class="mr-2 mb-2"
                          size="small"
                          variant="outlined"
                          :loading="testingAuth[`${right.resource}-${action}`]"
                          @click="testAuthorization(right.resource, action)"
                        >
                          Test {{ action }}
                        </v-btn>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div class="text-center">
              <v-btn
                color="primary"
                variant="outlined"
                prepend-icon="mdi-refresh"
                :loading="loadingRights"
                class="mr-3"
                @click="fetchUserRights"
              >
                {{ $t("dashboard.refreshRights") }}
              </v-btn>
            </div>
          </v-card-text>
          <v-card-text v-else-if="loadingRights">
            <div class="text-center py-8">
              <!-- local spinner removed; rely on global loader -->
              <p class="mt-4 text-body-1">
                {{ $t("dashboard.evaluatingUserPermissions") }}
              </p>
            </div>
          </v-card-text>
          <v-card-text v-else-if="rightsError">
            <div class="text-center py-8">
              <v-alert type="error" variant="tonal" class="mb-4">
                <v-alert-title>{{
                  $t("dashboard.errorLoadingUserRights")
                }}</v-alert-title>
                {{ rightsError }}
              </v-alert>
              <v-btn
                color="primary"
                prepend-icon="mdi-refresh"
                @click="fetchUserRights"
              >
                {{ $t("dashboard.retry") }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Technical Section: Raw User Info -->
        <v-card
          v-if="canViewTechnicalInfo"
          class="mb-6 stable-card"
          elevation="3"
          style="min-height: 180px"
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <div>
              <v-icon class="mr-2">mdi-code-tags</v-icon>
              Technical User Info
            </div>
            <v-btn
              :icon="showTechnicalInfo ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              variant="text"
              size="small"
              @click="showTechnicalInfo = !showTechnicalInfo"
            ></v-btn>
          </v-card-title>
          <v-expand-transition>
            <v-card-text>
              <template v-if="showTechnicalInfo">
                <div v-if="loadingDetails">
                  <v-skeleton-loader type="text" width="100%" height="80px" />
                </div>
                <div v-else-if="userDetails" class="position-relative">
                  <v-btn
                    icon="mdi-content-copy"
                    size="small"
                    variant="text"
                    class="copy-btn"
                    title="Copy to clipboard"
                    @click="copyUserDetails"
                  ></v-btn>
                  <pre
                    style="
                      background: #1e1e1e;
                      color: #d4d4d4;
                      padding: 16px;
                      border-radius: 8px;
                      overflow-x: auto;
                    "
                    >{{ JSON.stringify(userDetails, null, 2) }}
                  </pre>

                  <!-- Field Descriptions Table -->
                  <v-divider class="my-6"></v-divider>
                  <h4 class="text-subtitle-1 font-weight-bold mb-4">
                    <v-icon class="mr-2" size="20">mdi-table-edit</v-icon>
                    Field Descriptions
                  </h4>
                  <v-card variant="outlined">
                    <v-table density="comfortable">
                      <thead>
                        <tr class="field-descriptions-header">
                          <th class="text-left">
                            <span
                              class="text-subtitle-2 font-weight-bold text-uppercase"
                              >Key</span
                            >
                          </th>
                          <th class="text-left">
                            <span
                              class="text-subtitle-2 font-weight-bold text-uppercase"
                              >Description</span
                            >
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="field in userDetailFields" :key="field.key">
                          <td>
                            <code class="field-key">{{ field.key }}</code>
                          </td>
                          <td>
                            <span class="text-body-2">{{
                              field.description
                            }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </v-table>
                  </v-card>
                </div>
              </template>
              <template v-else>
                <div class="text-center py-8 text-body-2 text-medium-emphasis">
                  <v-icon size="32" color="primary" class="mb-2"
                    >mdi-eye-off-outline</v-icon
                  >
                  Technical User Info section is collapsed.
                </div>
              </template>
            </v-card-text>
          </v-expand-transition>
        </v-card>

        <!-- API Documentation -->
        <v-card
          v-if="canViewApiDocs"
          class="mb-6 stable-card"
          elevation="3"
          style="min-height: 200px"
        >
          <v-card-title>
            <v-icon class="mr-2">mdi-book-open</v-icon>
            {{ $t("dashboard.apiDocumentation") }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="h-100">
                  <v-card-text class="text-center py-6">
                    <v-icon size="48" color="primary" class="mb-4"
                      >mdi-api</v-icon
                    >
                    <h3 class="text-h6 mb-3">
                      {{ $t("dashboard.swaggerDocs") || "Swagger API Docs" }}
                    </h3>
                    <p class="text-body-2 mb-4">
                      {{
                        $t("dashboard.swaggerDescription") ||
                        "Interactive API documentation with live testing capabilities"
                      }}
                    </p>
                    <a
                      :href="swaggerUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="text-decoration: none"
                    >
                      <v-btn
                        color="primary"
                        variant="elevated"
                        prepend-icon="mdi-open-in-new"
                        class="mb-2"
                        block
                      >
                        {{
                          $t("dashboard.viewSwaggerDocs") || "View Swagger Docs"
                        }}
                      </v-btn>
                    </a>
                    <br />
                    <small class="text-caption text-medium-emphasis">{{
                      $t("dashboard.openInNewTab") || "Opens in new tab"
                    }}</small>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="h-100">
                  <v-card-text class="text-center py-6">
                    <v-icon size="48" color="secondary" class="mb-4"
                      >mdi-file-document-outline</v-icon
                    >
                    <h3 class="text-h6 mb-3">
                      {{ $t("dashboard.jsdocDocs") || "JSDoc Documentation" }}
                    </h3>
                    <p class="text-body-2 mb-4">
                      {{
                        $t("dashboard.jsdocDescription") ||
                        "Detailed code documentation and API references"
                      }}
                    </p>
                    <a
                      :href="jsdocUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="text-decoration: none"
                    >
                      <v-btn
                        color="secondary"
                        variant="elevated"
                        prepend-icon="mdi-open-in-new"
                        class="mb-2"
                        block
                      >
                        {{ $t("dashboard.viewJSDocDocs") || "View JSDoc Docs" }}
                      </v-btn>
                    </a>
                    <br />
                    <small class="text-caption text-medium-emphasis">{{
                      $t("dashboard.openInNewTab") || "Opens in new tab"
                    }}</small>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Toast notification -->
        <div
          v-if="toast.show"
          :class="['simple-toast', `toast-${toast.color}`]"
          @click="toast.show = false"
        >
          {{ toast.message }}
          <v-icon class="toast-close" size="small">mdi-close</v-icon>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
// --- Performance timing log ---
const renderStart = performance.now();
onMounted(() => {
  const renderEnd = performance.now();
  // eslint-disable-next-line no-console
  console.log(
    "DashboardView render time:",
    (renderEnd - renderStart).toFixed(2),
    "ms",
  );
});
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useDevModeStore } from "@/stores/devMode";
import api from "@/services/api";
import PageHeader from "@/components/PageHeader.vue";
import {
  DASHBOARD_ACCESS_CONFIG,
  getRequiredGroupsForRestrictedAccess,
} from "@/config/dashboardAccess";

// AdminPanel, defineAsyncComponent, useI18n removed as unused
const router = useRouter();
const authStore = useAuthStore();
const devModeStore = useDevModeStore();

// Toast notification state
const toast = reactive({
  show: false,
  message: "",
  color: "success",
});

// loading removed as unused

// Page loading state for initial load
const isPageLoading = ref(true);

// User details and rights data
const userDetails = ref(null);
const userRights = ref(null);
const loadingDetails = ref(false);
const loadingRights = ref(false);
const rightsError = ref(null);
const testingAuth = reactive({});
const showTechnicalInfo = ref(true); // Expanded by default

/**
 * Toggle simulated group membership
 * @param {string} group - Group name to toggle
 */
function toggleSimulatedGroup(group) {
  if (devModeStore.hasSimulatedGroup(group)) {
    devModeStore.removeSimulatedGroup(group);
    showToast(`Removed from ${group} group`, "info");
  } else {
    devModeStore.addSimulatedGroup(group);
    showToast(`Added to ${group} group`, "success");
  }
}

// API Documentation URLs
const baseApiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
const swaggerUrl = computed(() => `${baseApiUrl}/docs`);
const jsdocUrl = computed(() => `${baseApiUrl}/jsdoc`); // Placeholder for future JSDoc endpoint

// userAgent, isAdmin removed as unused

// Dashboard section access configuration
const DASHBOARD_ACCESS = DASHBOARD_ACCESS_CONFIG;

/**
 * Check if user has access to a specific dashboard section
 * @param {string} section - The section name from DASHBOARD_ACCESS
 * @returns {boolean} - Whether user has access
 */
const hasAccessToSection = (section) => {
  // In development mode with admin toggle, grant access to all sections
  if (devModeStore.isDevelopment && devModeStore.adminViewEnabled) {
    return true;
  }

  if (!DASHBOARD_ACCESS[section]) return false;

  // If section allows all users
  if (DASHBOARD_ACCESS[section].includes("*")) return true;

  // Check if user's groups include any of the allowed groups
  if (!userRights.value || !userRights.value.groups) return false;

  // Get effective groups (actual + simulated in dev mode)
  const effectiveGroups = devModeStore.getMergedGroups(userRights.value.groups);

  return DASHBOARD_ACCESS[section].some((allowedGroup) =>
    effectiveGroups.includes(allowedGroup),
  );
};

// Computed properties for section access
const canViewUserRights = computed(() => hasAccessToSection("userRights"));
const canViewTechnicalInfo = computed(() =>
  hasAccessToSection("technicalInfo"),
);
const canViewApiDocs = computed(() => hasAccessToSection("apiDocumentation"));

// Check if user has any restricted access (for showing the notice)
const hasRestrictedAccess = computed(() => {
  return (
    !canViewUserRights.value ||
    !canViewTechnicalInfo.value ||
    !canViewApiDocs.value
  );
});

// Get list of restricted sections for user
const restrictedSections = computed(() => {
  const sections = [];
  if (!canViewUserRights.value) sections.push("User Rights & Permissions");
  if (!canViewTechnicalInfo.value) sections.push("Technical Information");
  if (!canViewApiDocs.value) sections.push("API Documentation");
  return sections;
});

// Get required groups for access (for showing in notice)
const requiredGroups = computed(() => getRequiredGroupsForRestrictedAccess());

// isSwdMember removed as unused

// User detail field descriptions
const userDetailFields = computed(() => [
  { key: "id", description: "Unique Google user identifier" },
  {
    key: "primaryEmail",
    description: "Primary email address associated with the Google account",
  },
  {
    key: "fullName",
    description: "Complete user name (first and last name combined)",
  },
  { key: "givenName", description: "First name of the user" },
  { key: "familyName", description: "Last name of the user" },
  {
    key: "orgUnit",
    description: "Organizational unit or department path in Google Workspace",
  },
  { key: "department", description: "Department where the user works" },
  {
    key: "isEnrolledIn2Sv",
    description: "Two-step verification enrollment status (boolean)",
  },
  { key: "suspended", description: "Account suspension status (boolean)" },
  { key: "isAdmin", description: "Administrative privileges status (boolean)" },
  {
    key: "lastLoginTime",
    description: "Timestamp of the last successful login",
  },
  { key: "employeeId", description: "Company employee identification number" },
  { key: "jobTitle", description: "Official job title or position" },
  {
    key: "type",
    description: "Employee type (full-time, part-time, contractor, etc.)",
  },
  { key: "managerEmail", description: "Email address of the direct manager" },
  {
    key: "costCenter",
    description: "Cost center code for accounting purposes",
  },
  {
    key: "buildingId",
    description: "Building identifier where the user is located",
  },
  { key: "floorName", description: "Floor name or number in the building" },
  { key: "floorSection", description: "Specific section or area on the floor" },
  {
    key: "phones",
    description: "Array of phone numbers with types (work, mobile, home)",
  },
  { key: "secondaryEmails", description: "Array of alternate email addresses" },
  {
    key: "addresses",
    description: "Array of physical addresses (work, home, etc.)",
  },
  {
    key: "groups",
    description: "Legacy groups array (deprecated, use groupRoles instead)",
  },
  {
    key: "groupRoles",
    description:
      "Array of groups with role information (group name, email, user role)",
  },
  {
    key: "customSchemas",
    description: "Custom schema fields defined in Google Workspace",
  },
]);

// Show toast notification
/**
 * Display a toast notification message to the user
 * @param {string} message - The message to display
 * @param {string} [color='success'] - The color theme of the toast (success, error, warning, info)
 */
function showToast(message, color = "success") {
  toast.message = message;
  toast.color = color;
  toast.show = true;
  setTimeout(() => {
    toast.show = false;
  }, 3000);
}

// copyUserId and refreshProfile removed as unused

// Fetch user details
async function fetchUserDetails() {
  // Check cache first
  if (authStore.cachedUserDetails) {
    userDetails.value = authStore.cachedUserDetails;
    loadingDetails.value = false;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("User details from cache:", userDetails.value);
    }
    return;
  }

  loadingDetails.value = true;
  try {
    const response = await api.get("/api/user/details");
    userDetails.value = response.data.data;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log("User details from API:", userDetails.value);
      // eslint-disable-next-line no-console
      console.log("Employee ID:", userDetails.value.employeeId);
      // eslint-disable-next-line no-console
      console.log("Job Title:", userDetails.value.jobTitle);
      // eslint-disable-next-line no-console
      console.log("Type:", userDetails.value.type);
      // eslint-disable-next-line no-console
      console.log("Custom Schemas:", userDetails.value.customSchemas);
    }
  } catch (error) {
    // Error logging disabled
    showToast("Failed to fetch user details", "error");
  } finally {
    loadingDetails.value = false;
  }
}

// Fetch user rights
async function fetchUserRights() {
  // Check cache first
  if (authStore.cachedUserRights) {
    userRights.value = authStore.cachedUserRights;
    loadingRights.value = false;
    return;
  }

  loadingRights.value = true;
  rightsError.value = null;
  try {
    const response = await api.get("/api/user/rights");
    userRights.value = response.data.data;
  } catch (error) {
    // Error logging disabled
    rightsError.value =
      error.response?.data?.error?.message || "Failed to load user rights";
  } finally {
    loadingRights.value = false;
  }
}

// Test authorization for specific resource and action
async function testAuthorization(resource, action) {
  const testKey = `${resource}-${action}`;
  testingAuth[testKey] = true;

  try {
    const response = await api.post("/api/authorize", {
      resource,
      action,
    });

    const allowed = response.data.data.allowed;
    showToast(
      `${action.toUpperCase()} on ${resource}: ${allowed ? "ALLOWED" : "DENIED"}`,
      allowed ? "success" : "error",
    );
  } catch (error) {
    // Error logging disabled
    showToast(
      `Authorization test failed: ${error.response?.data?.error?.message || "Unknown error"}`,
      "error",
    );
  } finally {
    testingAuth[testKey] = false;
  }
}

// Format date helper
function formatDate(dateString) {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return dateString;
  }
}

// Get color for action chips
function getActionColor(action) {
  const colorMap = {
    read: "info",
    create: "success",
    update: "warning",
    delete: "error",
    approve: "purple",
    manage: "primary",
  };
  return colorMap[action] || "grey";
}

// Get color for group role chips
function getRoleColor(role) {
  const colorMap = {
    OWNER: "error",
    MANAGER: "warning",
    MEMBER: "success",
  };
  return colorMap[role] || "primary";
}

// Format role text to capitalize only first letter
function formatRole(role) {
  if (!role) return "";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

// Copy user details to clipboard
async function copyUserDetails() {
  if (userDetails.value) {
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(userDetails.value, null, 2),
      );
      showToast("User details copied to clipboard!", "success");
    } catch (err) {
      showToast("Failed to copy user details", "error");
    }
  }
}

// Logout function
async function doLogout() {
  try {
    await authStore.logout();
    router.push("/");
  } catch (error) {
    // Error logging disabled
    showToast("Logout failed", "error");
  }
}

// Initialize dashboard
onMounted(async () => {
  try {
    // Check if user is authenticated
    if (!authStore.user) {
      router.push("/");
      return;
    }

    // Small delay to ensure skeleton is visible before starting API calls
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Only fetch if not already loaded (avoid duplicate API calls)
    const promises = [];
    if (!userDetails.value || !userDetails.value.email) {
      promises.push(fetchUserDetails());
    }
    if (!userRights.value || !userRights.value.groups) {
      promises.push(fetchUserRights());
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    // Small delay to ensure content is painted before hiding skeleton
    await new Promise((resolve) => setTimeout(resolve, 100));
  } finally {
    // Hide loading skeleton
    isPageLoading.value = false;
  }
});
</script>

<style scoped>
.simple-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3000;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  max-width: 400px;
  animation: slideUp 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.toast-success {
  background: #4caf50;
}

.toast-error {
  background: #f44336;
}

.toast-info {
  background: #2196f3;
}

.toast-warning {
  background: #ff9800;
}

.toast-close {
  margin-left: auto;
  opacity: 0.8;
}

.toast-close:hover {
  opacity: 1;
}

@keyframes slideUp {
  from {
    transform: translateX(-50%) translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

/* RTL-specific styles for DashboardView */
[dir="rtl"] .toast-close {
  margin-left: 0;
  margin-right: auto;
}

[dir="rtl"] .v-card-title,
[dir="rtl"] .text-h4,
[dir="rtl"] .text-h6 {
  text-align: right !important;
}

[dir="rtl"] .v-list-item-title,
[dir="rtl"] .v-list-item-subtitle {
  text-align: right !important;
}

[dir="rtl"] .v-alert-title {
  text-align: right !important;
}

/* Groups Table Header Styling */
.groups-table-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.groups-table-header th {
  padding: 12px 16px !important;
  border-bottom: none !important;
  height: auto !important;
}

.groups-table-header th span {
  color: white !important;
  letter-spacing: 0.5px;
  font-size: 0.8125rem;
}

/* Field Descriptions Table Header Styling */
.field-descriptions-header {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.field-descriptions-header th {
  padding: 12px 16px !important;
  border-bottom: none !important;
  height: auto !important;
}

.field-descriptions-header th span {
  color: white !important;
  letter-spacing: 0.5px;
  font-size: 0.8125rem;
}

/* Field key styling */
.field-key {
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 0.875rem;
  color: #1976d2;
  font-weight: 500;
}

/* Copy button for technical info */
.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.copy-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Cursor pointer for clickable elements */
.cursor-pointer {
  cursor: pointer;
  user-select: none;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.cursor-pointer:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.cursor-pointer:active {
  transform: translateY(0);
}

.dev-mode-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-left: 4px solid #ff9800;
}

.v-theme--dark .dev-mode-card {
  background: linear-gradient(135deg, #2d2d2d 0%, #3a3a3a 100%);
  border-left: 4px solid #ff9800;
}

.dev-mode-content {
  padding: 8px 0;
}
</style>
/* Minimal animated dots loader */ .dots-loader { display: inline-block; width:
2.5em; height: 1em; position: relative; } .dots-loader::before,
.dots-loader::after, .dots-loader { content: ''; display: inline-block; width:
0.6em; height: 0.6em; border-radius: 50%; background: #1976d2; position:
absolute; animation: dots-bounce 1.2s infinite ease-in-out both; } .dots-loader
{ left: 0; animation-delay: -0.24s; } .dots-loader::before { left: 1em;
animation-delay: -0.12s; } .dots-loader::after { left: 2em; animation-delay: 0s;
} @keyframes dots-bounce { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.7;
} 40% { transform: scale(1); opacity: 1; } }
