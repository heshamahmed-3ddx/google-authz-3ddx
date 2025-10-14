<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-6">{{ $t('dashboard.title') || 'Dashboard' }}</h1>
        
        <v-alert type="info" variant="tonal" class="mb-6">
          <v-alert-title>{{ $t('dashboard.welcomeTitle') || 'Welcome!' }}</v-alert-title>
          {{ $t('dashboard.welcomeMessage') || 'You are successfully authenticated with Google OAuth 2.0' }}
        </v-alert>

        <!-- User Info Card -->
        <v-card class="mb-6" elevation="3">
          <v-card-title>
            <v-icon class="mr-2">mdi-account</v-icon>
            {{ $t('dashboard.userInformation') || 'User Information' }}
          </v-card-title>
          <v-card-text v-if="authStore.user">
            <v-row>
              <v-col cols="12" md="6">
                <div class="d-flex align-center mb-4">
                  <v-avatar size="64" class="mr-4">
                    <img :src="authStore.user.picture" alt="User avatar" />
                  </v-avatar>
                  <div>
                    <div class="text-h6">{{ authStore.user.name }}</div>
                    <div class="text-subtitle-2">{{ authStore.user.email }}</div>
                    <div class="d-flex align-center mt-2">
                      <span class="text-body-2 mr-2">ID: {{ authStore.user.id }}</span>
                      <v-btn icon size="small" @click="copyUserId" :title="$t('dashboard.copyUserId')">
                        <v-icon>mdi-content-copy</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>{{ $t('dashboard.verifiedEmail') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ authStore.user.email_verified ? $t('dashboard.yes') : $t('dashboard.no') }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>{{ $t('dashboard.locale') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ authStore.user.locale || $t('dashboard.notProvided') }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>{{ $t('dashboard.accountType') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ $t('dashboard.googleAccount') }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>
            
            <v-divider class="my-4"></v-divider>
            
            <div class="d-flex flex-wrap gap-3">
              <v-btn @click="refreshProfile" variant="outlined" prepend-icon="mdi-refresh" :loading="loading.refreshing" class="mr-2">
                {{ $t('dashboard.refreshProfile') || 'Refresh Profile' }}
              </v-btn>
              <v-btn @click="doLogout" variant="outlined" color="error" prepend-icon="mdi-logout">
                {{ $t('dashboard.logout') || 'Logout' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Detailed User Information -->
        <v-card class="mb-6" elevation="3">
          <v-card-title>
            <v-icon class="mr-2">mdi-account-details</v-icon>
            {{ $t('dashboard.userDetailsOrganization') }}
          </v-card-title>
          <v-card-text v-if="userDetails">
            <v-row>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>{{ $t('dashboard.fullName') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ userDetails.fullName || $t('dashboard.notProvided') }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>{{ $t('dashboard.organizationUnit') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ userDetails.orgUnit || $t('dashboard.unknown') }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>{{ $t('dashboard.department') }}</v-list-item-title>
                    <v-list-item-subtitle>{{ userDetails.department || $t('dashboard.unknown') }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
              <v-col cols="12" md="6">
                <v-list density="compact">
                  <v-list-item>
                    <v-list-item-title>{{ $t('dashboard.twoFactorAuthentication') }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip :color="userDetails.twoStepEnabled ? 'success' : 'warning'" size="small">
                        {{ userDetails.twoStepEnabled ? $t('dashboard.tfaEnabled') : $t('dashboard.tfaDisabled') }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-title>{{ $t('dashboard.accountStatus') }}</v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip color="success" size="small">{{ $t('dashboard.active') }}</v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-col>
            </v-row>

            <!-- Groups and Roles -->
            <v-divider class="my-4"></v-divider>
            <v-row>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3">
                  <v-icon class="mr-2">mdi-account-group</v-icon>
                  {{ $t('dashboard.groups') }}
                </h4>
                <div v-if="userDetails.groups && userDetails.groups.length > 0">
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
                <p v-else class="text-medium-emphasis">{{ $t('dashboard.noGroupsAssigned') }}</p>
              </v-col>
              <v-col cols="12" md="6">
                <h4 class="text-subtitle-1 mb-3">
                  <v-icon class="mr-2">mdi-account-star</v-icon>
                  {{ $t('dashboard.rolesGroups') }}
                </h4>
                <div v-if="userDetails.roles && userDetails.roles.length > 0">
                  <v-chip
                    v-for="role in userDetails.roles"
                    :key="role"
                    class="mr-3 mb-2"
                    color="secondary"
                    variant="flat"
                    size="small"
                  >
                    {{ role }}
                  </v-chip>
                </div>
                <p v-else class="text-medium-emphasis">{{ $t('dashboard.noRolesAssigned') }}</p>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-text v-else-if="loadingDetails">
            <div class="text-center py-4">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
              <p class="mt-2 text-body-2">{{ $t('dashboard.loadingUserDetails') }}</p>
            </div>
          </v-card-text>
        </v-card>

        <!-- User Rights & Permissions -->
        <v-card class="mb-6" elevation="3">
          <v-card-title>
            <v-icon class="mr-2">mdi-shield-account</v-icon>
            {{ $t('dashboard.userRightsPermissions') }}
          </v-card-title>
          <v-card-text v-if="userRights">
            <div class="mb-4">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card variant="tonal" color="primary">
                    <v-card-text class="text-center py-3">
                      <v-icon size="32" class="mb-2">mdi-account</v-icon>
                      <div class="text-h6">{{ userRights.userEmail }}</div>
                      <div class="text-body-2">{{ $t('dashboard.authorizationSubject') }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card variant="tonal" color="success">
                    <v-card-text class="text-center py-3">
                      <v-icon size="32" class="mb-2">mdi-shield-check</v-icon>
                      <div class="text-h6">{{ userRights.rights.length }} {{ $t('dashboard.resources') }}</div>
                      <div class="text-body-2">{{ $t('dashboard.accessGranted') }}</div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <!-- Permissions Matrix -->
            <div v-if="userRights.rights.length === 0" class="text-center py-8">
              <v-icon size="64" color="warning">mdi-shield-off</v-icon>
              <p class="text-h6 mt-4">{{ $t('dashboard.noPermissionsGranted') }}</p>
              <p class="text-body-2 text-medium-emphasis">
                {{ $t('dashboard.noResourcesAccessible') }}
              </p>
            </div>

            <v-expansion-panels v-else variant="accordion" class="mb-4">
              <v-expansion-panel
                v-for="(right, index) in userRights.rights"
                :key="right.resource"
                :title="right.resource"
              >
                <template v-slot:text>
                  <v-row>
                    <v-col cols="12">
                      <h4 class="text-subtitle-1 mb-3">Allowed Actions:</h4>
                      <v-chip
                        v-for="action in right.actions"
                        :key="action"
                        class="mr-3 mb-2"
                        :color="getActionColor(action)"
                        variant="flat"
                        prepend-icon="mdi-check"
                        size="small"
                      >
                        {{ action }}
                      </v-chip>
                    </v-col>
                  </v-row>

                  <v-divider class="my-4"></v-divider>

                  <v-row>
                    <v-col cols="12">
                      <h4 class="text-subtitle-1 mb-3">Test Access:</h4>
                      <v-btn
                        v-for="action in right.actions"
                        :key="`test-${action}`"
                        @click="testAuthorization(right.resource, action)"
                        class="mr-3 mb-2"
                        size="small"
                        variant="outlined"
                        :loading="testingAuth[`${right.resource}-${action}`]"
                      >
                        Test {{ action }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </template>
              </v-expansion-panel>
            </v-expansion-panels>

            <div class="text-center">
              <v-btn
                @click="fetchUserRights"
                color="primary"
                variant="outlined"
                prepend-icon="mdi-refresh"
                :loading="loadingRights"
                class="mr-3"
              >
                {{ $t('dashboard.refreshRights') }}
              </v-btn>
            </div>
          </v-card-text>
          <v-card-text v-else-if="loadingRights">
            <div class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
              <p class="mt-4 text-body-1">{{ $t('dashboard.evaluatingUserPermissions') }}</p>
            </div>
          </v-card-text>
          <v-card-text v-else-if="rightsError">
            <div class="text-center py-8">
              <v-alert type="error" variant="tonal" class="mb-4">
                <v-alert-title>{{ $t('dashboard.errorLoadingUserRights') }}</v-alert-title>
                {{ rightsError }}
              </v-alert>
              <v-btn @click="fetchUserRights" color="primary" prepend-icon="mdi-refresh">
                {{ $t('dashboard.retry') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>

        <!-- Admin Panel (Admin Users Only) -->
        <AdminPanel v-if="isAdmin" />

        <!-- Session Information -->
        <v-card class="mb-6" elevation="3">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            {{ $t('dashboard.sessionInformation') }}
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>{{ $t('dashboard.authenticationStatus') }}</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip color="success" size="small">{{ $t('dashboard.authenticated') }}</v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t('dashboard.loginTime') }}</v-list-item-title>
                <v-list-item-subtitle>{{ new Date().toLocaleString() }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t('dashboard.userAgent') }}</v-list-item-title>
                <v-list-item-subtitle class="text-wrap">{{ userAgent }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- API Documentation -->
        <v-card class="mb-6" elevation="3">
          <v-card-title>
            <v-icon class="mr-2">mdi-api</v-icon>
            {{ $t('dashboard.apiDocumentation') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="h-100">
                  <v-card-text class="text-center py-6">
                    <v-icon size="48" color="primary" class="mb-4">mdi-swagger</v-icon>
                    <h3 class="text-h6 mb-3">{{ $t('dashboard.swaggerDocs') }}</h3>
                    <p class="text-body-2 mb-4">{{ $t('dashboard.swaggerDescription') }}</p>
                    <a
                      :href="swaggerUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="text-decoration: none;"
                    >
                      <v-btn
                        color="primary"
                        variant="elevated"
                        prepend-icon="mdi-open-in-new"
                        class="mb-2"
                        block
                      >
                        {{ $t('dashboard.viewSwaggerDocs') }}
                      </v-btn>
                    </a>
                    <br>
                    <small class="text-caption text-medium-emphasis">{{ $t('dashboard.openInNewTab') }}</small>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="outlined" class="h-100">
                  <v-card-text class="text-center py-6">
                    <v-icon size="48" color="secondary" class="mb-4">mdi-file-document-outline</v-icon>
                    <h3 class="text-h6 mb-3">{{ $t('dashboard.jsdocDocs') }}</h3>
                    <p class="text-body-2 mb-4">{{ $t('dashboard.jsdocDescription') }}</p>
                    <a
                      :href="jsdocUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="text-decoration: none;"
                    >
                      <v-btn
                        color="secondary"
                        variant="elevated"
                        prepend-icon="mdi-open-in-new"
                        class="mb-2"
                        block
                      >
                        {{ $t('dashboard.viewJSDocDocs') }}
                      </v-btn>
                    </a>
                    <br>
                    <small class="text-caption text-medium-emphasis">{{ $t('dashboard.openInNewTab') }}</small>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Toast notification -->
    <div 
      v-if="toast.show"
      :class="['simple-toast', `toast-${toast.color}`]"
      @click="toast.show = false"
    >
      {{ toast.message }}
      <v-icon class="toast-close" size="small">mdi-close</v-icon>
    </div>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import AdminPanel from '@/components/AdminPanel.vue'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

// Toast notification state
const toast = reactive({
  show: false,
  message: '',
  color: 'success'
})

// Loading states for basic operations
const loading = reactive({
  refreshing: false
})

// User details and rights data
const userDetails = ref(null)
const userRights = ref(null)
const loadingDetails = ref(false)
const loadingRights = ref(false)
const rightsError = ref(null)
const testingAuth = reactive({})

// API Documentation URLs
const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const swaggerUrl = computed(() => `${baseApiUrl}/docs`)
const jsdocUrl = computed(() => `${baseApiUrl}/jsdoc`) // Placeholder for future JSDoc endpoint

// Safe access to navigator
const userAgent = computed(() => {
  if (typeof window !== 'undefined' && window.navigator) {
    return window.navigator.userAgent
  }
  return 'N/A'
})

// Check if current user is admin
const isAdmin = computed(() => {
  if (!userRights.value || !userRights.value.groups) return false
  
  return userRights.value.groups.includes('admin') || 
         userRights.value.roles?.includes('admin') ||
         userRights.value.roles?.includes('system-admin')
})

// Show toast notification
/**
 * Display a toast notification message to the user
 * @param {string} message - The message to display
 * @param {string} [color='success'] - The color theme of the toast (success, error, warning, info)
 */
function showToast(message, color = 'success') {
  toast.message = message
  toast.color = color
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

/**
 * Copy the current user's ID to the system clipboard
 * Shows a success/error toast based on the operation result
 * @async
 * @function copyUserId
 * @returns {Promise<void>}
 */
async function copyUserId() {
  if (authStore.user?.id) {
    try {
      await navigator.clipboard.writeText(authStore.user.id)
      showToast(t('dashboard.userIdCopied') || 'User ID copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy user ID:', err)
      showToast('Failed to copy user ID', 'error')
    }
  }
}

/**
 * Refresh the user's profile data from the authentication store
 * Updates the UI with a loading state and success/error feedback
 * @async
 * @function refreshProfile
 * @returns {Promise<void>}
 */
async function refreshProfile() {
  loading.refreshing = true
  try {
    await authStore.refreshProfile()
    showToast(t('dashboard.profileRefreshed') || 'Profile refreshed successfully!')
  } catch (error) {
    console.error('Failed to refresh profile:', error)
    showToast('Failed to refresh profile', 'error')
  } finally {
    loading.refreshing = false
  }
}

// Test Google Drive API
async function testGoogleDrive() {
  loading.drive = true
  try {
    const response = await api.get('/api/google/drive/files')
    addApiResult('Google Drive', true, `Found ${response.data.files?.length || 0} files`)
    showToast('Google Drive API test successful!')
  } catch (error) {
    console.error('Google Drive API test failed:', error)
    const errorMsg = error.response?.data?.error?.details || error.response?.data?.error?.message || error.message
    
    if (error.response?.status === 403) {
      needsReauth.value = true
      addApiResult('Google Drive', false, 'Insufficient permissions - requires Drive scope')
      showToast('Google Drive: Permission required. Please re-authenticate.', 'warning')
    } else {
      addApiResult('Google Drive', false, 'API test failed: ' + errorMsg)
      showToast('Google Drive API test failed', 'error')
    }
  } finally {
    loading.drive = false
  }
}

// Test Google Sheets API
async function testGoogleSheets() {
  loading.sheets = true
  try {
    const response = await api.get('/api/google/sheets/list')
    addApiResult('Google Sheets', true, `Found ${response.data.sheets?.length || 0} spreadsheets`)
    showToast('Google Sheets API test successful!')
  } catch (error) {
    console.error('Google Sheets API test failed:', error)
    const errorMsg = error.response?.data?.error?.details || error.response?.data?.error?.message || error.message
    
    if (error.response?.status === 403) {
      needsReauth.value = true
      addApiResult('Google Sheets', false, 'Insufficient permissions - requires Drive scope')
      showToast('Google Sheets: Permission required. Please re-authenticate.', 'warning')
    } else {
      addApiResult('Google Sheets', false, 'API test failed: ' + errorMsg)
      showToast('Google Sheets API test failed', 'error')
    }
  } finally {
    loading.sheets = false
  }
}

// Test Google Calendar API
async function testGoogleCalendar() {
  loading.calendar = true
  try {
    const response = await api.get('/api/google/calendar/events')
    addApiResult('Google Calendar', true, `Found ${response.data.events?.length || 0} upcoming events`)
    showToast('Google Calendar API test successful!')
  } catch (error) {
    console.error('Google Calendar API test failed:', error)
    const errorMsg = error.response?.data?.error?.details || error.response?.data?.error?.message || error.message
    
    if (error.response?.status === 403) {
      needsReauth.value = true
      addApiResult('Google Calendar', false, 'Insufficient permissions - requires Calendar scope')
      showToast('Google Calendar: Permission required. Please re-authenticate.', 'warning')
    } else {
      addApiResult('Google Calendar', false, 'API test failed: ' + errorMsg)
      showToast('Google Calendar API test failed', 'error')
    }
  } finally {
    loading.calendar = false
  }
}

// Add API test result
function addApiResult(api, success, message) {
  apiResults.value.unshift({
    api,
    success,
    message,
    timestamp: new Date().toLocaleTimeString()
  })
  
  // Keep only last 10 results
  if (apiResults.value.length > 10) {
    apiResults.value = apiResults.value.slice(0, 10)
  }
}

// Fetch user details
async function fetchUserDetails() {
  loadingDetails.value = true
  try {
    const response = await api.get('/api/user/details')
    userDetails.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch user details:', error)
    showToast('Failed to load user details', 'error')
  } finally {
    loadingDetails.value = false
  }
}

// Fetch user rights
async function fetchUserRights() {
  loadingRights.value = true
  rightsError.value = null
  try {
    const response = await api.get('/api/user/rights')
    userRights.value = response.data.data
  } catch (error) {
    console.error('Failed to fetch user rights:', error)
    rightsError.value = error.response?.data?.error?.message || 'Failed to load user rights'
  } finally {
    loadingRights.value = false
  }
}

// Test authorization for specific resource and action
async function testAuthorization(resource, action) {
  const testKey = `${resource}-${action}`
  testingAuth[testKey] = true
  
  try {
    const response = await api.post('/api/authorize', {
      resource,
      action
    })
    
    const allowed = response.data.data.allowed
    showToast(`${action.toUpperCase()} on ${resource}: ${allowed ? 'ALLOWED' : 'DENIED'}`, allowed ? 'success' : 'error')
    
  } catch (error) {
    console.error('Authorization test failed:', error)
    showToast(`Authorization test failed: ${error.response?.data?.error?.message || 'Unknown error'}`, 'error')
  } finally {
    testingAuth[testKey] = false
  }
}

// Get color for action chips
function getActionColor(action) {
  const colorMap = {
    'read': 'info',
    'create': 'success', 
    'update': 'warning',
    'delete': 'error',
    'approve': 'purple',
    'manage': 'primary'
  }
  return colorMap[action] || 'grey'
}

// Logout function
async function doLogout() {
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('Logout failed:', error)
    showToast('Logout failed', 'error')
  }
}

// Initialize dashboard
onMounted(async () => {
  // Check if user is authenticated
  if (!authStore.user) {
    router.push('/')
    return
  }
  
  // Load user details and rights
  await Promise.all([
    fetchUserDetails(),
    fetchUserRights()
  ])
})
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
</style>