<template>
  <div class="login-page" role="main" ref="pageRef">
    <!-- Top-right controls: Theme + Language -->
    <div class="page-controls">
      <LanguageSwitcher class="control-item" />
      <ThemeToggle class="control-item" />
    </div>

    <!-- Centered login content -->
    <div class="login-content">
      <div class="horizontal-layout">
        <!-- Logo and button section (centered) -->
        <div class="logo-section content-section">
          <img
            :src="logoSrc"
            alt="Logo"
            class="login-logo"
            @error="onLogoError"
          />

          <v-btn
            class="sign-in-btn"
            color="orange darken-2"
            depressed
            small
            aria-label="Sign in with Google"
            @click="login"
            :loading="authLoading"
          >
            {{ $t('auth.signInGoogle') || 'Sign in with Google' }}
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <span class="footer-version">v{{ appVersion }}</span>
      <span class="footer-divider">•</span>
      <span class="footer-powered">Powered by 3DDX</span>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import { onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import ThemeToggle from "@/components/ThemeToggle.vue";
import LanguageSwitcher from "@/components/LanguageSwitcher.vue";
import pkg from "../../../package.json";

const { t: $t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const appVersion = pkg.version || "1.0.0";

const logoSrc = ref('/logo.png');
const authLoading = ref(false);
const pageRef = ref(null);

function generateBinaryPatternSVG(width = 800, height = 600, color = '#ff9800') {
  // Create a simple SVG with repeated random 0/1 characters
  const fontSize = 14;
  const cols = Math.ceil(width / fontSize);
  const rows = Math.ceil(height / fontSize);

  let text = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const bit = Math.random() < 0.5 ? '0' : '1';
      const x = c * fontSize;
      const y = (r + 1) * fontSize;
      // random rotation between -25 and 25 degrees
      const angle = (Math.random() * 50) - 25;
      // rotation center (approx center of the character)
      const cx = x + fontSize * 0.5;
      const cy = y - fontSize * 0.35;
      text += `<text x="${x}" y="${y}" transform="rotate(${angle} ${cx} ${cy})" font-family="monospace" font-size="${fontSize}" fill="${color}" opacity="0.12">${bit}</text>`;
    }
  }

  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>${text}</svg>`;
  return svg;
}

function onLogoError() {
  logoSrc.value = 'data:image/svg+xml;utf8,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="220" height="120" viewBox="0 0 220 120"><rect width="100%" height="100%" fill="#ffffff"/><circle cx="110" cy="60" r="40" fill="#146c9c"/></svg>`
  );
}

const login = async () => {
  if (authLoading.value) return;
  authLoading.value = true;
  try {
    await authStore.login();
    router.push('/dashboard');
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

onMounted(() => {
  if (authStore.isAuthenticated) router.push('/dashboard');
  // Try to use a Web Worker to generate the SVG off the main thread. If a
  // worker can't be created (e.g., CSP or older browsers), fall back to the
  // deferred Blob approach using requestIdleCallback.
  const el = pageRef.value;
  const tileW = 200;
  const tileH = 200;
  const isDark = document.documentElement.classList.contains('v-theme--dark');
  const color = isDark ? 'rgba(255,255,255,0.08)' : '#ff9800';

  const applySvgString = (svgString) => {
    if (!pageRef.value) return;
    const targetEl = pageRef.value;
    // start from hidden so the transition can run when we flip to visible
    targetEl.style.setProperty('--login-pattern-visible', '0');
    try {
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      _patternObjectUrl = URL.createObjectURL(blob);
      targetEl.style.setProperty('--login-pattern', `url(${_patternObjectUrl})`);
      targetEl.style.setProperty('--login-pattern-size', `${tileW}px ${tileH}px`);
      targetEl.style.setProperty('--login-pattern-repeat', 'repeat');
      // next frame, reveal with fade-in
      requestAnimationFrame(() => targetEl.style.setProperty('--login-pattern-visible', '1'));
    } catch (err) {
      const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
      targetEl.style.setProperty('--login-pattern', `url(${dataUri})`);
      requestAnimationFrame(() => targetEl.style.setProperty('--login-pattern-visible', '1'));
    }
  };

  try {
    // create worker using a module script path; bundlers like Vite will handle this source file
    _patternWorker = new Worker(new URL('@/workers/binaryPatternWorker.js', import.meta.url), { type: 'module' });
    _patternWorker.addEventListener('message', (ev) => {
      if (ev.data && ev.data.svg) {
        applySvgString(ev.data.svg);
      } else if (ev.data && ev.data.error) {
        // fall back to main-thread generation
        const svgString = generateBinaryPatternSVG(tileW, tileH, color);
        applySvgString(svgString);
      }
    });
    _patternWorker.postMessage({ tileW, tileH, color });
  } catch (e) {
    // worker failed to instantiate; defer generation on main thread instead
    const run = () => {
      const svgString = generateBinaryPatternSVG(tileW, tileH, color);
      applySvgString(svgString);
    };
    if ('requestIdleCallback' in window) {
      _idleHandle = window.requestIdleCallback(run, { timeout: 500 });
    } else {
      _idleHandle = window.setTimeout(run, 50);
    }
  }

  // hide page scrollbars while login view is visible to avoid layout shifts
  _prevHtmlOverflow = document.documentElement.style.overflow;
  _prevBodyOverflow = document.body.style.overflow;
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
});

onUnmounted(() => {
  // restore previous overflow values
  if (_prevHtmlOverflow !== null) document.documentElement.style.overflow = _prevHtmlOverflow;
  if (_prevBodyOverflow !== null) document.body.style.overflow = _prevBodyOverflow;
  // cleanup any scheduled idle callback and revoke object URL
  try {
    if (typeof _idleHandle === 'number') window.clearTimeout(_idleHandle);
    else if (typeof _idleHandle === 'object' && 'cancel' in _idleHandle) _idleHandle.cancel();
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
  --login-accent: #f57c00; /* default orange */
  --login-control: var(--v-theme-primary, #1976d2);
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
  transition: background 0.25s ease, color 0.25s ease;
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
  /* use generated SVG pattern when available; JS will set --login-pattern to a URL and
    --login-pattern-repeat / --login-pattern-size when using a small tile. Fall back to
    decorative gradients for browsers without JS or failure modes. */
  background-image: var(--login-pattern, radial-gradient(circle, transparent 20%, #e5e5f7 20%, #e5e5f7 80%, transparent 80%, transparent), radial-gradient(circle, transparent 20%, #e5e5f7 20%, #e5e5f7 80%, transparent 80%, transparent) 25px 25px, linear-gradient(#444cf7 2px, transparent 2px) 0 -1px, linear-gradient(90deg, #444cf7 2px, #e5e5f7 2px) -1px 0);
  background-repeat: var(--login-pattern-repeat, no-repeat);
  background-position: center center;
  background-size: var(--login-pattern-size, cover);
  /* visibility helper: default to visible so fallback gradients are shown when JS fails.
     JS will toggle this value briefly to produce a fade-in when replacing the background. */
  --login-pattern-visible: 1;
  opacity: var(--login-pattern-visible);
  transition: opacity 320ms ease, background-image 250ms ease;
}

/* subtle parallax movement for the pattern */
@keyframes loginPatternDrift {
  0% { transform: translateY(-6%); }
  50% { transform: translateY(6%); }
  100% { transform: translateY(-6%); }
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
  max-width: 900px;
  width: 90%;
  padding: 32px 16px;
  text-align: center;
}

/* Horizontal layout container */
.horizontal-layout {
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  justify-content: center;
}

/* Content section */
.content-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Logo section */
.logo-section {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.logo-section .sign-in-btn {
  margin-top: -18px;
  z-index: 5;
  position: relative;
  padding: 6px 10px;
  font-size: 13px;
  min-width: 160px;
  height: 36px;
  /* use the accent tokens so the button follows the active theme */
  background-color: var(--login-accent) !important;
  color: var(--login-accent-contrast) !important;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.login-logo {
  max-width: 320px;
  max-height: 30vh;
  width: auto;
  height: auto;
  display: block;
  transition: transform 0.2s ease, filter 0.2s ease;
  transform: translateX(-0.5rem);
  filter: var(--login-logo-filter);
}

.login-logo:hover,
.login-logo:focus {
  transform: translateX(-0.5rem) scale(1.02);
  outline: none;
}

/* Accessibility: visible focus for keyboard users */
.sign-in-btn:focus-visible {
  outline: 3px solid rgba(66,153,225,0.5);
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

.footer-version,
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
  --login-accent: #ff9800; /* slightly brighter orange for dark bg */
  --login-accent-contrast: #111827;
  --login-footer: rgba(255,255,255,0.55);
  --login-logo-filter: none;
  /* prefer accent color in dark mode (use accent so icons can be orange) */
  --login-control: var(--login-accent, #ff9800);
}

/* hide decorative pattern in dark theme */
.v-theme--dark .login-page::before {
  /* keep pattern visible in dark mode but we will generate a light-colored SVG for contrast */
  /* use the dark background token so the pseudo-element matches the dark page bg */
  background-color: var(--login-bg) !important;
  opacity: 1 !important;
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
@media (max-width: 500px) {
  .login-logo {
    transform: translateX(-0.25rem);
    max-width: 240px;
    max-height: 28vh;
  }
  .logo-section .sign-in-btn {
    margin-top: -8px;
    padding: 6px 8px;
    font-size: 12px;
    min-width: 140px;
    height: 34px;
  }
}
</style>


