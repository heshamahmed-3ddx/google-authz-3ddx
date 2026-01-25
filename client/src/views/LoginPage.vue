<template>
  <div ref="pageRef" class="login-page" role="main">
    <!-- Top-right controls: Theme -->
    <div class="page-controls">
      <ThemeToggle class="control-item" />
    </div>

    <!-- Centered login content -->
    <div class="login-content">
      <div
        ref="logoWrapper"
        class="logo-wrapper"
        :class="{ 'fade-in': logoAnimated }"
        :style="
          logoAnimated
            ? {}
            : { opacity: 0, transform: 'translateY(-20px) scale(0.95)' }
        "
      >
        <img
          ref="logoImg"
          :src="logoSrc"
          alt="Logo"
          class="login-logo"
          :class="{ 'fade-in-img': logoAnimated }"
          @error="onLogoError"
        />
      </div>

      <v-btn
        ref="signInBtn"
        class="sign-in-btn"
        :class="{ 'fade-in': buttonAnimated }"
        style="background-color: #ef9043 !important; color: white !important"
        size="default"
        variant="flat"
        aria-label="Sign in with Google"
        :loading="authLoading"
        @click="login"
      >
        {{ $t("auth.signInGoogle") || "Sign in with Google" }}
      </v-btn>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <span class="footer-version">v{{ appVersion }}</span>
      <span class="footer-divider">•</span>
      <span class="footer-powered">Powered by 3DDX</span>
      <span class="footer-divider">•</span>
      <span class="footer-year">{{ new Date().getFullYear() }}</span>
    </div>

    <!-- Error message snackbar -->
    <v-snackbar
      v-model="showError"
      :timeout="6000"
      color="error"
      location="top"
      multi-line
    >
      {{ errorMessage }}
      <template #actions>
        <v-btn color="white" variant="text" @click="showError = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { onMounted, onUnmounted, ref, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import ThemeToggle from "@/components/ThemeToggle.vue";
import pkg from "../../../package.json";

const { t: $t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const appVersion = pkg.version || "1.0.0";

const logoSrc = ref("/logo.png");
const authLoading = ref(false);
const pageRef = ref(null);
const logoAnimated = ref(false);
const buttonAnimated = ref(false);
const logoWrapper = ref(null);
const logoImg = ref(null);
const signInBtn = ref(null);
const showError = ref(false);
const errorMessage = ref("");

// Error message mappings
const errorMessages = {
  access_denied:
    "Access Denied: You are not authorized to access this application. Please contact your administrator.",
  oauth_failed: "Authentication failed. Please try again.",
  session_error: "Session error occurred. Please try signing in again.",
  default: "An error occurred during authentication. Please try again.",
};

function checkForErrors() {
  const error = router.currentRoute.value.query.error;
  if (error) {
    errorMessage.value = errorMessages[error] || errorMessages.default;
    showError.value = true;
    // Clean up URL
    router.replace({ query: {} });
  }
}

function generateBinaryPatternSVG(
  width = 800,
  height = 600,
  color = "#ef9043",
  fontSize = 20,
  spacing = 30,
) {
  // Create a simple SVG with spaced random 0/1 characters across full page
  const cols = Math.ceil(width / spacing);
  const rows = Math.ceil(height / spacing);

  let text = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Alternate pattern: 1s and 0s opposite to each other (checkerboard-like)
      // If row + column is even, use "1", if odd, use "0"
      const bit = (r + c) % 2 === 0 ? "1" : "0";
      const x = c * spacing + spacing * 0.5;
      const y = r * spacing + spacing * 0.5;
      // Small random rotation between -15 and 15 degrees
      const angle = Math.random() * 30 - 15;
      const cx = x;
      const cy = y;
      text += `<text x="${x}" y="${y}" transform="rotate(${angle} ${cx} ${cy})" font-family="monospace" font-size="${fontSize}" fill="${color}" opacity="0.16" text-anchor="middle" dominant-baseline="middle">${bit}</text>`;
    }
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${text}</svg>`;
  return svg;
}

function onLogoError() {
  logoSrc.value =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="120" viewBox="0 0 220 120"><rect width="100%" height="100%" fill="#ffffff"/><circle cx="110" cy="60" r="40" fill="#146e9c"/></svg>`,
    );
}

const login = async () => {
  if (authLoading.value) return;
  authLoading.value = true;
  try {
    await authStore.login();
    router.push("/home");
  } catch (e) {
    window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/auth/google`;
  } finally {
    authLoading.value = false;
  }
};

let _prevHtmlOverflow = null;
let _prevBodyOverflow = null;
// worker and pattern state refs (module-scoped for cleanup within lifecycle)
let _patternWorker = null;
let _patternObjectUrl = null;
let _idleHandle = null;

let _animeModule = null;

async function animateLogo() {
  if (!_animeModule) {
    try {
      const mod = await import("animejs");
      _animeModule = mod.default || mod;
    } catch (e) {
      // animejs not available
      return;
    }
  }

  const anime = _animeModule;
  try {
    // Wait for DOM updates so refs are populated
    await nextTick();
    const lw = logoWrapper.value;
    const li = logoImg.value;
    const btn = signInBtn.value;

    if (!lw && !li) return; // nothing to animate

    // Honor reduced-motion preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      if (lw) {
        lw.style.opacity = "1";
        lw.style.transform = "none";
      }
      if (li) li.style.opacity = "1";
      if (btn) btn.style.opacity = "1";
      return;
    }

    // Set initial hidden state then animate to visible
    if (lw) {
      lw.style.opacity = "0";
      lw.style.transform = "translateY(-20px) scale(0.95)";
    }
    if (li) li.style.opacity = "0";
    if (btn) btn.style.opacity = "0";

    const tl = anime.timeline();
    let _failSafe = null;
    _failSafe = setTimeout(() => {
      try {
        if (lw) {
          lw.style.opacity = "";
          lw.style.transform = "";
        }
        if (li) li.style.opacity = "";
        if (btn) btn.style.opacity = "";
      } catch (e) {
        // ignore
      }
    }, 1500);
    tl.add({
      targets: lw || li,
      opacity: [0, 1],
      translateY: lw ? [-20, 0] : undefined,
      scale: lw ? [0.95, 1] : undefined,
      duration: 720,
      easing: "easeOutCubic",
    })
      .add(
        {
          targets: li,
          opacity: [0, 1],
          duration: 360,
          easing: "linear",
        },
        "-=420",
      )
      .add(
        {
          targets: btn,
          opacity: [0, 1],
          translateY: [-10, 0],
          duration: 640,
          easing: "easeOutCubic",
        },
        "+=160",
      );

    // Ensure we clear inline styles after animation so CSS rules take over
    if (tl.finished && typeof tl.finished.then === "function") {
      tl.finished
        .then(() => {
          try {
            if (_failSafe) {
              clearTimeout(_failSafe);
              _failSafe = null;
            }
            if (lw) {
              lw.style.opacity = "";
              lw.style.transform = "";
            }
            if (li) li.style.opacity = "";
            if (btn) btn.style.opacity = "";
          } catch (e) {
            // ignore
          }
        })
        .catch(() => {
          if (_failSafe) {
            clearTimeout(_failSafe);
            _failSafe = null;
          }
        });
    }
  } catch (e) {
    // On any error, reveal elements so they don't stay hidden
    try {
      if (logoWrapper.value) {
        logoWrapper.value.style.opacity = "1";
        logoWrapper.value.style.transform = "none";
      }
      if (logoImg.value) logoImg.value.style.opacity = "1";
      if (signInBtn.value) signInBtn.value.style.opacity = "1";
    } catch (err) {
      // ignore
    }
  }
}

onMounted(async () => {
  // Check for error query parameters
  checkForErrors();

  // Double-check authentication (router guard should handle this, but this is a safety net)
  if (authStore.isAuthenticated) {
    router.push("/home");
    return;
  }

  // Also check with server if not cached
  const isAuthenticated = await authStore.checkAuth();
  if (isAuthenticated) {
    router.push("/home");
    return;
  }

  // Generate pattern for full page size with proper spacing
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  // Use brand orange color for both light and dark modes
  const color = "#ef9043";
  // Smaller font size and tighter spacing for more characters
  const fontSize = 12;
  const spacing = 18; // Space between characters (reduced for more density)

  const applySvgString = (svgString) => {
    if (!pageRef.value) return;
    const targetEl = pageRef.value;
    // Revoke old pattern URL if it exists before creating new one
    if (_patternObjectUrl) {
      URL.revokeObjectURL(_patternObjectUrl);
      _patternObjectUrl = null;
    }
    // start from hidden so the transition can run when we flip to visible
    targetEl.style.setProperty("--login-pattern-visible", "0");
    try {
      const blob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8",
      });
      _patternObjectUrl = URL.createObjectURL(blob);
      targetEl.style.setProperty(
        "--login-pattern",
        `url(${_patternObjectUrl})`,
      );
      // Use full page size, no repeat needed as it covers entire page
      targetEl.style.setProperty("--login-pattern-size", "100% 100%");
      targetEl.style.setProperty("--login-pattern-repeat", "no-repeat");
      // next frame, reveal with fade-in
      requestAnimationFrame(() =>
        targetEl.style.setProperty("--login-pattern-visible", "1"),
      );
    } catch (err) {
      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      targetEl.style.setProperty("--login-pattern", `url(${dataUri})`);
      targetEl.style.setProperty("--login-pattern-size", "100% 100%");
      targetEl.style.setProperty("--login-pattern-repeat", "no-repeat");
      requestAnimationFrame(() =>
        targetEl.style.setProperty("--login-pattern-visible", "1"),
      );
    }
  };

  // Generate pattern directly for full page (no worker needed for simplicity)
  const run = () => {
    const svgString = generateBinaryPatternSVG(
      viewportWidth,
      viewportHeight,
      color,
      fontSize,
      spacing,
    );
    applySvgString(svgString);
  };
  if ("requestIdleCallback" in window) {
    _idleHandle = window.requestIdleCallback(run, { timeout: 500 });
  } else {
    _idleHandle = window.setTimeout(run, 50);
  }

  // hide page scrollbars while login view is visible to avoid layout shifts
  _prevHtmlOverflow = document.documentElement.style.overflow;
  _prevBodyOverflow = document.body.style.overflow;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  // Trigger animations after DOM is ready
  nextTick(() => {
    // Start logo animation immediately
    setTimeout(() => {
      logoAnimated.value = true;
      console.log("Logo animation triggered:", logoAnimated.value);

      // trigger Anime.js animation (if available)
      animateLogo().catch(() => {
        /* ignore - fallback CSS handles visibility */
      });

      // Wait for Vue to update DOM, then check and force class
      nextTick(() => {
        const logoEl = document.querySelector(".logo-wrapper");
        if (logoEl) {
          console.log("Logo element found, class before:", logoEl.className);
          // Force add the class directly if Vue didn't apply it
          if (!logoEl.classList.contains("fade-in")) {
            logoEl.classList.add("fade-in");
            console.log("Manually added fade-in class");
          }
          logoEl.offsetHeight; // Force reflow
          console.log("Logo element found, class after:", logoEl.className);
        }
      });
    }, 100);

    // Start button animation after logo
    setTimeout(() => {
      buttonAnimated.value = true;
    }, 800);
  });
});

onUnmounted(() => {
  // restore previous overflow values
  if (_prevHtmlOverflow !== null)
    document.documentElement.style.overflow = _prevHtmlOverflow;
  if (_prevBodyOverflow !== null)
    document.body.style.overflow = _prevBodyOverflow;
  // cleanup any scheduled idle callback and revoke object URL
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
  try {
    if (_patternWorker) {
      _patternWorker.terminate();
      _patternWorker = null;
    }
  } catch (e) {
    // ignore
  }
});
</script>

<style scoped>
/* Full-page login layout (theme-aware via CSS variables) */
.login-page {
  /* color tokens (can be overridden by theme classes) */
  --login-bg: #ffffff;
  --login-foreground: #111827;
  --login-accent: #ef9043; /* brand orange */
  --login-control: #146e9c; /* brand blue */
  --login-accent-contrast: #ffffff;
  --login-footer: rgba(0, 0, 0, 0.45);
  /* no logo drop shadow by default */
  --login-logo-filter: none;

  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--login-bg);
  color: var(--login-foreground);
  transition:
    background 0.25s ease,
    color 0.25s ease;
  z-index: 0;
}

/* decorative patterned background (light theme) rendered in a pseudo-element so
   content opacity isn't affected */
.login-page::before {
  content: "";
  position: absolute;
  /* extend past the viewport so the drifting animation never exposes the page bg */
  inset: -12%;
  z-index: 0; /* sit above the page background but below content */
  pointer-events: none;
  /* make the base background white again */
  background-color: #ffffff;
  opacity: 1;
  /* Ensure pattern is visible */
  --login-pattern-visible: 1;
  /* use generated SVG pattern when available; JS will set --login-pattern to a URL and
    --login-pattern-repeat / --login-pattern-size when using a small tile. Fall back to
    decorative gradients for browsers without JS or failure modes. */
  background-image: var(
    --login-pattern,
    radial-gradient(
      circle,
      transparent 20%,
      #e5e5f7 20%,
      #e5e5f7 80%,
      transparent 80%,
      transparent
    ),
    radial-gradient(
        circle,
        transparent 20%,
        #e5e5f7 20%,
        #e5e5f7 80%,
        transparent 80%,
        transparent
      )
      25px 25px,
    linear-gradient(#444cf7 2px, transparent 2px) 0 -1px,
    linear-gradient(90deg, #444cf7 2px, #e5e5f7 2px) -1px 0
  );
  background-repeat: var(--login-pattern-repeat, no-repeat);
  background-position: center center;
  background-size: var(--login-pattern-size, cover);
  /* visibility helper: default to visible so fallback gradients are shown when JS fails.
     JS will toggle this value briefly to produce a fade-in when replacing the background. */
  --login-pattern-visible: 1;
  opacity: var(--login-pattern-visible);
  transition:
    opacity 320ms ease,
    background-image 250ms ease;
}

/* subtle parallax movement for the pattern */
@keyframes loginPatternDrift {
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

.login-page::before {
  animation: loginPatternDrift 18s linear infinite;
  will-change: transform;
}

/* make sure the content is painted above the decorative layer */
.login-content {
  position: relative;
  z-index: 1;
}

/* Top-right controls container */
.page-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  z-index: 10;
}

.control-item {
  opacity: 0.85;
  transition: opacity 0.2s ease;
  color: var(--login-control);
}

.control-item:hover {
  opacity: 1;
}

/* ensure icons inherit the control color (svg or font icons) */
.control-item svg,
.control-item .v-icon {
  color: inherit;
  fill: currentColor;
}

/* Centered login content */
.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0px;
  position: relative;
  width: 100%;
  height: 100%;
}

.logo-wrapper {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
  transition:
    opacity 1s cubic-bezier(0.4, 0, 0.2, 1),
    transform 1s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: opacity, transform;
}

.logo-wrapper.fade-in {
  /* Use a keyframe animation for a smoother, more reliable entrance across
     browsers and to avoid cases where inline styles or class toggles don't
     trigger the transition. The `forwards` fill mode keeps the final state. */
  animation: fadeInUp 820ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
  /* Fallback in case keyframes/animation are prevented by other styles or
     user agent limitations. This ensures the logo becomes visible. */
  opacity: 1;
  transform: translateY(0) scale(1);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Image-level fallback animation: animates the <img> directly for robustness */
.fade-in-img {
  animation: fadeInImage 600ms ease-out forwards;
}

@keyframes fadeInImage {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Respect users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .logo-wrapper {
    transition: none !important;
    animation: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
  .sign-in-btn {
    transition: none !important;
    transform: none !important;
    opacity: 1 !important;
  }
}

.login-logo {
  max-width: 280px;
  max-height: 140px;
  width: auto;
  height: auto;
  display: block;
  filter: var(--login-logo-filter);
}

.sign-in-btn {
  text-transform: none !important;
  border-radius: 8px !important;
  margin-left: 0;
  margin-top: 12px; /* Spacing below logo */
  opacity: 0;
  transform: translateY(-10px);
  transition:
    opacity 2.5s cubic-bezier(0.4, 0, 0.2, 1),
    transform 2.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.sign-in-btn.fade-in {
  opacity: 1;
  transform: translateY(0);
}

/* Accessibility: visible focus for keyboard users */
.sign-in-btn:focus-visible {
  outline: 3px solid rgba(66, 153, 225, 0.5);
  outline-offset: 3px;
  border-radius: 6px;
}

/* Footer */
.login-footer {
  position: fixed;
  bottom: 16px;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: var(--login-footer);
  z-index: 1;
}

.footer-version {
  font-weight: 400;
  color: #ef9043 !important; /* Brand orange for light mode */
  transition: color 0.2s;
}

.v-theme--dark .footer-version {
  color: #ef9043 !important; /* Brand orange for dark mode */
}

.footer-powered {
  font-weight: 400;
}

.footer-divider {
  opacity: 0.6;
}
</style>

/* Minimal unscoped theme override */
<style>
/* When Vuetify applies the dark theme class to the app root, override tokens here. */
.v-theme--dark .login-page {
  --login-bg: #0f1720; /* very dark slate */
  --login-foreground: #e6eef8;
  --login-accent: #ef9043; /* brand orange for dark bg */
  --login-accent-contrast: #111827;
  --login-footer: rgba(255, 255, 255, 0.55);
  --login-logo-filter: none;
  /* prefer accent color in dark mode (use accent so icons can be orange) */
  --login-control: #ef9043; /* brand orange */
}

/* Ensure pattern is visible in dark theme */
.v-theme--dark .login-page::before {
  /* keep pattern visible in dark mode with brand orange pattern */
  background-color: var(--login-bg) !important;
  opacity: 1 !important;
  /* Ensure pattern is visible */
  --login-pattern-visible: 1 !important;
}

/* Ensure the top-right activator buttons and icons inherit the control token
   (unscoped so it can reach inside child component templates) */
.page-controls .v-btn {
  background-color: transparent !important;
  color: var(--login-control) !important;
  box-shadow: none !important;
}

.page-controls .v-btn .v-icon,
.page-controls .v-icon,
.page-controls svg {
  color: var(--login-control) !important;
  fill: currentColor !important;
}

/* Stronger overrides to reach into child components' specific classes */
.page-controls .theme-btn,
.page-controls .language-btn,
.page-controls .theme-btn .theme-icon,
.page-controls .language-btn .lang-icon,
.page-controls :is(.v-btn, .v-icon, svg, .theme-icon, .lang-icon) * {
  color: var(--login-control) !important;
  fill: currentColor !important;
}

.page-controls .v-btn,
.page-controls .v-btn * {
  transition: color 0.18s ease !important;
}
</style>

<style scoped>
@media (max-width: 768px) {
  .login-logo {
    max-width: 220px;
    max-height: 110px;
  }

  .sign-in-btn {
    margin-left: 0;
    margin-top: 10px; /* Spacing below logo */
  }
}

@media (max-width: 500px) {
  .login-content {
    gap: 0px;
  }

  .login-logo {
    max-width: 180px;
    max-height: 90px;
  }

  .sign-in-btn {
    margin-left: 0;
    margin-top: 8px; /* Spacing below logo */
  }
}
</style>
