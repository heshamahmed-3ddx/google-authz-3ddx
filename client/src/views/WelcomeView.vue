<template>
  <div ref="pageRef" class="welcome-view">
    <v-container class="fill-height">
      <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6">
        <!-- Welcome Card -->
        <v-card elevation="0" class="welcome-card">
          <!-- Header -->
          <div class="welcome-header">
            <div class="welcome-header-content">
              <!-- Avatar -->
              <v-avatar
                size="56"
                color="white"
                class="mb-3 avatar-glow"
              >
                <img
                  v-if="userProfilePicture && !imageError"
                  :src="userProfilePicture"
                  :alt="userDisplayName || userFullName"
                  @error="imageError = true"
                  @load="imageError = false"
                >
                <span v-else class="text-body-1 font-weight-bold" style="color: rgb(var(--v-theme-primary))">
                  {{ userInitials }}
                </span>
              </v-avatar>

              <!-- User Name -->
              <h2 v-if="displayName" class="text-subtitle-1 font-weight-medium mb-1" style="color: #f08a4a">
                {{ displayName }}
              </h2>

              <!-- Welcome Message -->
              <p class="text-caption mb-0 text-medium-emphasis">
                Welcome to InsightHub
              </p>
            </div>
          </div>

          <v-card-text class="pa-4">

            <!-- User Details -->
            <div v-if="userDetails" class="user-details mb-3">
              <div v-if="userDetails.department || userDetails.jobTitle" class="detail-row mb-2">
                <div v-if="userDetails.jobTitle" class="detail-item">
                  <v-icon size="16" style="color: #f08a4a" class="mr-2">mdi-briefcase</v-icon>
                  <span class="text-body-2">{{ userDetails.jobTitle }}</span>
                </div>
                <div v-if="userDetails.department" class="detail-item">
                  <v-icon size="16" style="color: #f08a4a" class="mr-2">mdi-office-building</v-icon>
                  <span class="text-body-2">{{ userDetails.department }}</span>
                </div>
              </div>

              <div v-if="userDetails.orgUnit" class="detail-row mb-2">
                <v-icon size="16" style="color: #f08a4a" class="mr-2">mdi-domain</v-icon>
                <span class="text-body-2">{{ userDetails.orgUnit }}</span>
              </div>

              <div v-if="userDetails.groups && userDetails.groups.length > 0" class="detail-row">
                <div class="d-flex align-center flex-wrap gap-1">
                  <v-icon size="16" style="color: #f08a4a" class="mr-1">mdi-account-group</v-icon>
                  <v-chip
                    v-for="group in userDetails.groups.slice(0, 2)"
                    :key="group"
                    size="x-small"
                    style="background-color: rgba(240, 138, 74, 0.1); color: #f08a4a; border: 1px solid rgba(240, 138, 74, 0.2)"
                  >
                    {{ group }}
                  </v-chip>
                  <v-chip
                    v-if="userDetails.groups.length > 2"
                    size="x-small"
                    style="background-color: rgba(240, 138, 74, 0.1); color: #f08a4a; border: 1px solid rgba(240, 138, 74, 0.2)"
                  >
                    +{{ userDetails.groups.length - 2 }}
                  </v-chip>
                </div>
              </div>
            </div>

            <!-- Action Button -->
            <v-btn
              size="small"
              prepend-icon="mdi-apps"
              variant="elevated"
              block
              class="mt-2"
              style="background-color: #f08a4a !important; color: white !important; width: 100%"
              @click="openNavigation"
            >
              Open Navigation
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useThemeStore } from '@/stores/theme';

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const userDisplayName = ref(null);
const userFullName = ref(null);
const userDetails = ref(null);
const imageError = ref(false);
const pageRef = ref(null);

// Pattern generation state
let _patternObjectUrl = null;
let _idleHandle = null;

// Generate binary pattern SVG (same as login page)
function generateBinaryPatternSVG(
  width = 800,
  height = 600,
  color = "#ef9043",
  fontSize = 12,
  spacing = 18,
) {
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);

  let text = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bit = (r + c) % 2 === 0 ? "1" : "0";
      const x = c * spacing + spacing * 0.5;
      const y = r * spacing + spacing * 0.5;
      const angle = Math.random() * 30 - 15;
      const cx = x;
      const cy = y;
      text += `<text x="${x}" y="${y}" transform="rotate(${angle} ${cx} ${cy})" font-family="monospace" font-size="${fontSize}" fill="${color}" opacity="0.22" text-anchor="middle" dominant-baseline="middle">${bit}</text>`;
    }
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${text}</svg>`;
  return svg;
}

// Get user profile picture from multiple sources
const userProfilePicture = computed(() => {
  // Try userDetails first (from API)
  if (userDetails.value?.picture) {
    return userDetails.value.picture;
  }
  // Fallback to authStore user picture
  if (authStore.user?.picture) {
    return authStore.user.picture;
  }
  return null;
});

// Safely extract display name as string
const displayName = computed(() => {
  // First try userFullName
  if (userFullName.value) {
    return typeof userFullName.value === 'string' ? userFullName.value : String(userFullName.value);
  }
  // Then try userDisplayName
  if (userDisplayName.value) {
    return typeof userDisplayName.value === 'string' ? userDisplayName.value : String(userDisplayName.value);
  }
  // Fallback to authStore user name
  if (authStore.user?.name) {
    const name = authStore.user.name;
    return typeof name === 'string' ? name : (name.fullName || name.firstName || String(name));
  }
  // Try email as last resort
  if (authStore.user?.email) {
    return authStore.user.email.split('@')[0];
  }
  return null;
});

// Compute user initials for avatar fallback
const userInitials = computed(() => {
  const name = displayName.value;
  if (!name) return '?';
  const nameStr = typeof name === 'string' ? name : String(name);
  const parts = nameStr.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return nameStr.substring(0, 2).toUpperCase();
});

// Load user info
onMounted(async () => {
  // Get user display name from auth store (for welcome message)
  if (authStore.user) {
    // Safely extract name as string
    const name = authStore.user.name;
    if (name) {
      if (typeof name === 'string') {
        userDisplayName.value = name;
      } else if (typeof name === 'object' && name.fullName) {
        userDisplayName.value = name.fullName;
      } else if (typeof name === 'object' && name.firstName) {
        userDisplayName.value = name.firstName;
      } else {
        userDisplayName.value = String(name);
      }
    } else {
      userDisplayName.value = authStore.user.email?.split('@')[0] || null;
    }
  }

  // Load user details (department, orgUnit, fullName, picture, etc.)
  try {
    // Try to use cached details first
    if (authStore.cachedUserDetails) {
      userDetails.value = authStore.cachedUserDetails;
      // Set full name from cached details (ensure it's a string)
      if (authStore.cachedUserDetails.fullName) {
        userFullName.value = typeof authStore.cachedUserDetails.fullName === 'string' 
          ? authStore.cachedUserDetails.fullName 
          : String(authStore.cachedUserDetails.fullName);
      } else if (authStore.cachedUserDetails.name) {
        const name = authStore.cachedUserDetails.name;
        userFullName.value = typeof name === 'string' ? name : String(name);
      }
    } else {
      // Fetch from API
      const { apiService } = await import('@/services/api');
      const response = await apiService.get('/api/user/details');
      if (response.data?.data) {
        userDetails.value = response.data.data;
        authStore.cachedUserDetails = response.data.data;
        // Set full name from API response (ensure it's a string)
        if (response.data.data.fullName) {
          userFullName.value = typeof response.data.data.fullName === 'string'
            ? response.data.data.fullName
            : String(response.data.data.fullName);
        } else if (response.data.data.name) {
          const name = response.data.data.name;
          userFullName.value = typeof name === 'string' ? name : String(name);
        }
      }
    }

    // Fallback: If we still don't have full name, use from authStore
    if (!userFullName.value && authStore.user?.name) {
      const name = authStore.user.name;
      if (typeof name === 'string') {
        userFullName.value = name;
      } else if (typeof name === 'object' && name.fullName) {
        userFullName.value = name.fullName;
      } else {
        userFullName.value = String(name);
      }
    }
  } catch (error) {
    // Non-blocking - continue without details
    // Fallback to authStore data
    if (!userFullName.value && authStore.user?.name) {
      const name = authStore.user.name;
      if (typeof name === 'string') {
        userFullName.value = name;
      } else if (typeof name === 'object' && name.fullName) {
        userFullName.value = name.fullName;
      } else {
        userFullName.value = String(name);
      }
    }
  }

  // Generate pattern background (same as login page)
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const color = "#ef9043";
  const fontSize = 12;
  const spacing = 18;

  const applySvgString = (svgString) => {
    if (!pageRef.value) return;
    const targetEl = pageRef.value;
    if (_patternObjectUrl) {
      URL.revokeObjectURL(_patternObjectUrl);
      _patternObjectUrl = null;
    }
    targetEl.style.setProperty("--welcome-pattern-visible", "0");
    try {
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      _patternObjectUrl = URL.createObjectURL(blob);
      targetEl.style.setProperty(
        "--welcome-pattern",
        `url(${_patternObjectUrl})`,
      );
      targetEl.style.setProperty("--welcome-pattern-size", "100% 100%");
      targetEl.style.setProperty("--welcome-pattern-repeat", "no-repeat");
      requestAnimationFrame(() =>
        targetEl.style.setProperty("--welcome-pattern-visible", "1"),
      );
    } catch (err) {
      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      targetEl.style.setProperty("--welcome-pattern", `url(${dataUri})`);
      targetEl.style.setProperty("--welcome-pattern-size", "100% 100%");
      targetEl.style.setProperty("--welcome-pattern-repeat", "no-repeat");
      requestAnimationFrame(() =>
        targetEl.style.setProperty("--welcome-pattern-visible", "1"),
      );
    }
  };

  const run = () => {
    const svgString = generateBinaryPatternSVG(viewportWidth, viewportHeight, color, fontSize, spacing);
    applySvgString(svgString);
  };

  if ("requestIdleCallback" in window) {
    _idleHandle = window.requestIdleCallback(run, { timeout: 500 });
  } else {
    _idleHandle = window.setTimeout(run, 50);
  }
});

onUnmounted(() => {
  // Cleanup pattern resources
  try {
    if (typeof _idleHandle === "number") window.clearTimeout(_idleHandle);
    else if (typeof _idleHandle === "object" && "cancel" in _idleHandle)
      _idleHandle.cancel();
  } catch (e) {
    // ignore
  }
  try {
    if (_patternObjectUrl) URL.revokeObjectURL(_patternObjectUrl);
  } catch (e) {
    // ignore
  }
});

const openNavigation = () => {
  // Dispatch custom event to open overlay sidebar
  window.dispatchEvent(new CustomEvent('openOverlaySidebar'));
};
</script>

<style scoped>
.welcome-view {
  position: fixed;
  inset: 0;
  background-color: rgb(var(--v-theme-background));
  overflow: auto;
  min-height: 100vh;
  padding-top: 64px; /* Account for app bar */
  transition: background-color 0.3s ease;
}

.welcome-view .fill-height {
  min-height: calc(100vh - 64px);
}

/* Pattern background (same as login page) */
.welcome-view::before {
  content: "";
  position: absolute;
  inset: -12%;
  z-index: 0;
  pointer-events: none;
  background-color: rgb(var(--v-theme-background));
  opacity: 1;
  --welcome-pattern-visible: 1;
  /* Theme-aware pattern colors */
  --pattern-color-1: rgba(var(--v-theme-on-surface), 0.08);
  --pattern-color-2: rgba(var(--v-theme-on-surface), 0.04);
  background-image: var(
    --welcome-pattern,
    radial-gradient(
      circle,
      transparent 20%,
      var(--pattern-color-1) 20%,
      var(--pattern-color-1) 80%,
      transparent 80%,
      transparent
    ),
    radial-gradient(
        circle,
        transparent 20%,
        var(--pattern-color-1) 20%,
        var(--pattern-color-1) 80%,
        transparent 80%,
        transparent
      )
      25px 25px,
    linear-gradient(var(--pattern-color-2) 2px, transparent 2px) 0 -1px,
    linear-gradient(90deg, var(--pattern-color-2) 2px, var(--pattern-color-1) 2px) -1px 0
  );
  background-repeat: var(--welcome-pattern-repeat, no-repeat);
  background-position: center center;
  background-size: var(--welcome-pattern-size, cover);
  --welcome-pattern-visible: 1;
  opacity: var(--welcome-pattern-visible);
  transition:
    opacity 320ms ease,
    background-image 250ms ease,
    background-color 0.3s ease;
  animation: welcomePatternDrift 18s linear infinite;
  will-change: transform;
}

@keyframes welcomePatternDrift {
  0% {
    transform: translateY(-6%);
  }
  50% {
    transform: translateY(6%);
  }
  100% {
    transform: translateY(-6%);
  }
}

/* Ensure content is above pattern */
.welcome-view .container {
  position: relative;
  z-index: 1;
  height: 100%;
}

.fill-height {
  min-height: calc(100vh - 64px);
}

.welcome-card {
  border-radius: 16px !important;
  max-width: 420px;
  margin: 0 auto;
  overflow: hidden;
  background: rgb(var(--v-theme-surface)) !important;
  border: 2px solid transparent !important;
  background-image: 
    linear-gradient(rgb(var(--v-theme-surface)), rgb(var(--v-theme-surface))),
    linear-gradient(135deg, #f08a4a 0%, #ffb74d 50%, #f08a4a 100%);
  background-origin: border-box;
  background-clip: padding-box, border-box;
  box-shadow: 
    0 8px 24px rgba(240, 138, 74, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.08) !important;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-theme--dark .welcome-card {
  box-shadow: 
    0 8px 24px rgba(240, 138, 74, 0.2),
    0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.welcome-card::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 16px;
  background: linear-gradient(135deg, #f08a4a 0%, #ffb74d 50%, #f08a4a 100%);
  opacity: 0.6;
  z-index: -1;
  filter: blur(8px);
  transition: opacity 0.3s ease;
}

.welcome-card:hover {
  box-shadow: 
    0 12px 32px rgba(240, 138, 74, 0.2),
    0 4px 12px rgba(0, 0, 0, 0.12) !important;
  transform: translateY(-4px);
}

.welcome-card:hover::after {
  opacity: 0.9;
  filter: blur(12px);
}

.welcome-header {
  background: rgb(var(--v-theme-surface));
  border: none;
  border-bottom: 1px solid rgba(240, 138, 74, 0.2);
  border-radius: 0;
  padding: 20px 20px 18px;
  transition: background-color 0.3s ease;
  text-align: center;
  position: relative;
}

.welcome-header::before {
  display: none;
}

.welcome-header-content {
  position: relative;
  z-index: 1;
}

.avatar-glow {
  box-shadow: 0 2px 12px rgba(240, 138, 74, 0.25);
  border: 2px solid #f08a4a;
  background: rgb(var(--v-theme-surface)) !important;
}

/* Compact spacing */
.welcome-card :deep(.v-card-text) {
  padding: 16px 20px 20px !important;
  background: rgb(var(--v-theme-surface)) !important;
}

.welcome-card :deep(.v-card) {
  background: rgb(var(--v-theme-surface)) !important;
}

.user-details {
  text-align: left;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(240, 138, 74, 0.15);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-item {
  display: flex;
  align-items: center;
  flex: 1;
}

.detail-item + .detail-item {
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid rgba(240, 138, 74, 0.15);
}

/* Responsive */
@media (max-width: 600px) {
  .welcome-card {
    margin: 0 16px;
    max-width: 100%;
  }
  
  .welcome-header {
    padding: 16px 16px 14px;
  }
  
  .welcome-card :deep(.v-card-text) {
    padding: 14px 16px 16px !important;
  }
  
  .detail-row {
    padding: 4px 0;
  }
}
</style>
