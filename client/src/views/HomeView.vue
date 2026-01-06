<template>
  <v-container class="fill-height d-flex align-center justify-center home-container">
    <v-row justify="center" align="center" class="text-center home-row">
      <v-col cols="12" md="8" lg="6">
        <!-- Logo -->
        <div class="mb-8">
          <img
            src="/logo.png"
            alt="InsightHub Logo"
            class="home-logo"
            @error="onLogoError"
          />
        </div>

        <!-- Welcome Message -->
        <h1 class="text-h3 mb-4 font-weight-bold">
          {{ $t("home.welcome") || "Welcome to InsightHub" }}
        </h1>
        <p class="text-h6 text-medium-emphasis mb-8">
          {{ $t("home.tagline") || "Your centralized hub for insights and analytics" }}
        </p>

        <!-- CTA Buttons -->
        <div class="d-flex gap-4 justify-center flex-wrap">
          <v-btn
            v-if="!authStore.isAuthenticated"
            color="black"
            size="large"
            variant="flat"
            prepend-icon="mdi-login"
            @click="goToLogin"
          >
            {{ $t("home.signIn") || "Sign In" }}
          </v-btn>
          <v-btn
            v-else
            color="black"
            size="large"
            variant="flat"
            prepend-icon="mdi-view-dashboard"
            @click="goToDashboard"
          >
            {{ $t("home.goToDashboard") || "Go to Dashboard" }}
          </v-btn>
        </div>

        <!-- Footer -->
        <div class="mt-12 pt-8">
          <p class="text-caption text-medium-emphasis">
            {{ $t("home.version") || "Version" }} {{ appVersion }} • {{ $t("home.poweredBy") || "Powered by" }} 3DDX
          </p>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "vue-i18n";
import pkg from "../../../package.json";

const router = useRouter();
const authStore = useAuthStore();
const { t: $t } = useI18n();
const appVersion = pkg.version || "1.0.0";

const logoSrc = ref("/logo.png");

function onLogoError() {
  logoSrc.value =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="120" viewBox="0 0 220 120"><rect width="100%" height="100%" fill="#ffffff"/><circle cx="110" cy="60" r="40" fill="#146e9c"/></svg>`,
    );
}

function goToLogin() {
  router.push("/");
}

function goToDashboard() {
  router.push("/dashboard");
}
</script>

<style scoped>
.home-container {
  max-width: 100%;
  overflow-x: hidden;
}

.home-row {
  max-width: 100%;
  margin: 0;
}

.home-logo {
  max-width: 300px;
  max-height: 150px;
  width: auto;
  height: auto;
  display: block;
  margin: 0 auto;
}

.fill-height {
  min-height: calc(100vh - 64px);
}

@media (max-width: 600px) {
  .home-logo {
    max-width: 200px;
    max-height: 100px;
  }
}
</style>
