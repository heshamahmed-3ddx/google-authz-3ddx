<template>
  <v-overlay
    :model-value="isActive"
    scrim
    class="global-loader-overlay"
    z-index="99999"
    role="status"
    aria-live="polite"
  >
    <v-scale-transition>
      <div v-if="isActive" class="custom-loader" aria-hidden="false">
        <div class="loader-card">
            <div class="loader-visual">
              <img src="/lamp.png" alt="Loading" class="loader-lamp" />
            </div>
            <div class="loader-title">Be patient…</div>
            <div class="loader-caption" aria-live="polite">
              We're preparing your data
              <span class="dot-anim" aria-hidden="true">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
              </span>
            </div>
            <div class="loader-bar-wrapper" aria-hidden="true">
              <v-progress-linear
                indeterminate
                height="6"
                :color="primaryHex"
                class="loader-progress"
              />
              <!-- Fallback bar in case Vuetify linear isn't visible in some environments -->
              <div
                class="fallback-loader-bar"
                :style="{ '--primary-hex': primaryHex }"
                aria-hidden="true"
              ></div>
            </div>
        </div>
      </div>
    </v-scale-transition>
  </v-overlay>
</template>

<script setup>
import { computed } from "vue";
import { isLoading } from "@/plugins/global-loader";
import colors from "@/config/colors.json";

const isActive = computed(() => isLoading.value);
const primaryHex = colors?.primary || "#146c9c";
</script>

<style>
.custom-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.loader-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 22px 30px;
  border-radius: 14px;
  backdrop-filter: blur(10px);
  background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,250,255,0.98));
  border: 1px solid rgba(20,108,156,0.12);
  box-shadow: 0 12px 40px rgba(20,108,156,0.10);
  text-align: center;
  min-width: 360px;
}

.loader-lamp {
  width: 160px;
  height: 160px;
  object-fit: contain;
  animation: lamp-pulse 1.4s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(20,108,156,0.12));
}

.loader-caption {
  color: var(--report-accent); /* brand orange */
  font-size: 14px;
  font-weight: 600;
}

.loader-title {
  color: var(--color-primary); /* primary brand color */
  font-size: 20px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.dot-anim {
  display: inline-flex;
  gap: 2px;
  margin-left: 8px;
}

.dot-anim .dot {
  color: var(--color-primary);
  font-weight: 700;
  opacity: 0.2;
  transform: translateY(0);
  animation: dotPulse 1s linear infinite;
}

.dot-anim .dot:nth-child(1) { animation-delay: 0s; }
.dot-anim .dot:nth-child(2) { animation-delay: 0.12s; }
.dot-anim .dot:nth-child(3) { animation-delay: 0.24s; }

.loader-visual {
  position: relative;
  width: 180px;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Loader progress bar (indeterminate) */

@keyframes dots {
  0%,
  20% {
    content: "•";
    opacity: 0;
  }
  40% {
    content: "•";
    opacity: 1;
  }
  60% {
    content: "••";
  }
  80%,
  100% {
    content: "•••";
  }
}

@keyframes lamp-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.06);
  }
  100% {
    transform: scale(1);
  }
}

/* Vuetify's v-progress-linear (indeterminate) handles the animation; no custom keyframes needed */

.loader-progress {
  width: 100%;
  max-width: 320px;
  border-radius: 4px;
}

/* Fallback bar: a slim track and animated block using the primary hex CSS variable */
.fallback-loader-bar {
  width: 100%;
  max-width: 320px;
  height: 6px;
  margin-top: 8px;
  background: rgba(0,0,0,0.06);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.fallback-loader-bar::before {
  content: "";
  position: absolute;
  left: -40%;
  top: 0;
  height: 100%;
  width: 40%;
  background: linear-gradient(90deg, var(--primary-hex), rgba(255,255,255,0.15));
  animation: fallback-indeterminate 1.3s linear infinite;
}

@keyframes fallback-indeterminate {
  0% { transform: translateX(0%); }
  50% { transform: translateX(120%); }
  100% { transform: translateX(240%); }
}

@keyframes dotPulse {
  0% { opacity: 0.2; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-4px); }
  60% { opacity: 0.6; transform: translateY(-2px); }
  100% { opacity: 0.2; transform: translateY(0); }
}

/* Ensure the SVG ring rotates around its center */
.loader-ring {
  transform-origin: 50% 50%;
  will-change: transform;
}

@keyframes spin {
  0% { transform: rotate(0deg); stroke-dashoffset: 94; }
  50% { transform: rotate(180deg); stroke-dashoffset: 30; }
  100% { transform: rotate(360deg); stroke-dashoffset: 94; }
}
</style>
