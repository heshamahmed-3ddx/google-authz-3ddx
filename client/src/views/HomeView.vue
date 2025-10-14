<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="10" lg="8" xl="6">
        <v-card class="pa-8" elevation="3">
          <v-card-title class="text-h4 text-center mb-6">
            <v-icon size="large" color="primary" class="mr-2">mdi-google</v-icon>
            {{ $t('home.title') || 'Google Authorization Demo' }}
          </v-card-title>

          <v-card-text class="text-center">
            <p class="text-h6 mb-4">{{ $t('home.subtitle') || 'Secure access with Google OAuth' }}</p>
            
            <p class="text-body-1 mb-6">{{ $t('home.description') || 'Click below to login with your Google account and access the dashboard.' }}</p>

            <v-divider class="my-6"></v-divider>

            <div>
              <v-btn
                @click="login"
                size="large"
                color="primary"
                prepend-icon="mdi-google"
                :loading="authStore.loading"
                class="mb-4"
              >
                {{ $t('auth.loginWithGoogle') || 'Login with Google' }}
              </v-btn>
            </div>

            <v-divider class="my-6"></v-divider>

            <!-- API Documentation Links -->
            <div class="mb-6">
              <p class="text-h6 mb-4">{{ $t('dashboard.apiDocumentation') || 'API Documentation' }}</p>
              <v-row class="justify-center">
                <v-col cols="12" md="6">
                  <v-card class="h-100 pa-4" elevation="1">
                    <v-card-title class="text-center">
                      <v-icon color="success" size="large" class="mb-2">mdi-api</v-icon>
                      <br>
                      {{ $t('dashboard.swaggerDocs') || 'Swagger API' }}
                    </v-card-title>
                    <v-card-text class="text-center">
                      <p class="text-body-2 mb-4">{{ $t('dashboard.swaggerDescription') || 'Explore and test the API endpoints using interactive Swagger documentation.' }}</p>
                      <v-btn
                        :href="swaggerUrl"
                        target="_blank"
                        variant="outlined"
                        color="success"
                        prepend-icon="mdi-api"
                        class="w-100"
                      >
                        {{ $t('dashboard.viewSwaggerDocs') || 'View Swagger Docs' }}
                        <v-icon size="small" class="ml-2">mdi-open-in-new</v-icon>
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
                <v-col cols="12" md="6">
                  <v-card class="h-100 pa-4" elevation="1">
                    <v-card-title class="text-center">
                      <v-icon color="info" size="large" class="mb-2">mdi-book-open-variant</v-icon>
                      <br>
                      {{ $t('dashboard.jsdocDocs') || 'JSDoc Documentation' }}
                    </v-card-title>
                    <v-card-text class="text-center">
                      <p class="text-body-2 mb-4">{{ $t('dashboard.jsdocDescription') || 'Browse detailed code documentation generated from JSDoc comments in the codebase.' }}</p>
                      <v-btn
                        :href="jsdocUrl"
                        target="_blank"
                        variant="outlined"
                        color="info"
                        prepend-icon="mdi-book-open-variant"
                        class="w-100"
                      >
                        {{ $t('dashboard.viewJSDocDocs') || 'View JSDoc' }}
                        <v-icon size="small" class="ml-2">mdi-open-in-new</v-icon>
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </div>
          </v-card-text>
        </v-card>

        <!-- Features Section -->
        <v-row class="mt-8">
          <v-col
            v-for="feature in features"
            :key="feature.title"
            cols="12"
            md="4"
          >
            <v-card class="h-100" elevation="2">
              <v-card-text class="text-center">
                <v-icon
                  :icon="feature.icon"
                  size="48"
                  :color="feature.color"
                  class="mb-3"
                ></v-icon>
                <h3 class="text-h6 mb-2">{{ feature.title }}</h3>
                <p class="text-body-2">{{ feature.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const router = useRouter()
const { t } = useI18n()

// API Documentation URLs
const baseApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const swaggerUrl = computed(() => `${baseApiUrl}/docs`)
const jsdocUrl = computed(() => `${baseApiUrl}/jsdoc`)

// Features for display - using computed for reactivity
const features = computed(() => [
  {
    title: t('home.features.oauth.title'),
    description: t('home.features.oauth.description'),
    icon: 'mdi-shield-check',
    color: 'success'
  },
  {
    title: t('home.features.api.title'),
    description: t('home.features.api.description'),
    icon: 'mdi-api',
    color: 'green'
  },
  {
    title: t('home.features.session.title'),
    description: t('home.features.session.description'),
    icon: 'mdi-account-clock',
    color: 'warning'
  }
])

const login = async () => {
  try {
    await authStore.login()
    // Navigate to dashboard after login
    router.push('/dashboard')
  } catch (e) {
    // fallback to redirect
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/auth/google`
  }
}

// If already authenticated, redirect to dashboard
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px);
}

.features-section {
  margin-top: 2rem;
}

/* RTL-specific styles for HomeView */
[dir="rtl"] .v-card-title {
  text-align: center !important;
}

[dir="rtl"] .v-card-text {
  text-align: right;
}

[dir="rtl"] .text-center {
  text-align: center !important;
}

/* RTL adjustments for documentation cards */
[dir="rtl"] .v-card-text .text-body-2 {
  text-align: right;
}

/* Ensure buttons remain centered in RTL */
[dir="rtl"] .w-100 {
  text-align: center;
}

/* RTL icon adjustments in cards */
[dir="rtl"] .v-card-title .v-icon {
  margin-left: 0;
  margin-right: 0;
}
</style>