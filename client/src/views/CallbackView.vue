<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" md="6">
        <v-card elevation="3" class="pa-6 text-center">
          <v-card-title class="text-h4 mb-4">
            <v-icon size="large" color="primary" class="mr-2">mdi-sync</v-icon>
            {{ $t("auth.processingAuth") }}
            <span v-if="loading" class="ms-2 text-caption">{{
              $t("auth.completingAuth")
            }}</span>
          </v-card-title>

          <v-card-text>
            <p v-if="loading" class="text-h6 mb-4">
              {{ $t("auth.completingAuth") }}
            </p>

            <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
              <v-alert-title>{{ $t("auth.authFailed") }}</v-alert-title>
              {{ error }}
            </v-alert>

            <v-alert v-if="success" type="success" variant="tonal" class="mb-4">
              <v-alert-title>{{ $t("auth.authSuccess") }}</v-alert-title>
              {{ $t("auth.authSuccessMessage") }}
            </v-alert>

            <v-btn
              v-if="error"
              color="primary"
              prepend-icon="mdi-home"
              @click="goHome"
            >
              {{ $t("auth.returnHome") }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";

const { t: $t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(true);
const error = ref(null);
const success = ref(false);

const handleCallback = async () => {
  try {
    const code = route.query.code;
    const errorParam = route.query.error;

    if (errorParam) {
      throw new Error(`Authentication error: ${errorParam}`);
    }

    if (!code) {
      throw new Error("No authorization code received");
    }

    // Handle the OAuth callback
    await authStore.handleCallback(code);

    success.value = true;

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  } catch (err) {
    // console.error("Callback handling error:", err);
    error.value = err.message || "Authentication failed";
  } finally {
    loading.value = false;
  }
};

const goHome = () => {
  router.push("/");
};

onMounted(() => {
  handleCallback();
});
</script>

<style scoped>
.fill-height {
  min-height: calc(100vh - 64px);
}
</style>
