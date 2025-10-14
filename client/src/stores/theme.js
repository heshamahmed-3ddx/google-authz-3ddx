import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import colorsDefault from '@/config/colors.json'

// Theme configuration
const themeConfig = {
  light: {
    name: 'light',
    displayName: 'Light Theme',
    colors: {
      ...colorsDefault,
      background: '#FFFFFF',
      surface: '#FFFFFF',
      'on-background': '#212121',
      'on-surface': '#212121',
      text: '#212121'
    }
  },
  dark: {
    name: 'dark',
    displayName: 'Dark Theme',
    colors: {
      ...colorsDefault,
      background: '#121212',
      surface: '#1E1E1E',
      'on-background': '#FFFFFF',
      'on-surface': '#FFFFFF',
      text: '#FFFFFF',
      primary: '#1E88E5',
      secondary: '#546E7A'
    }
  }
}

// Helper: Apply theme colors to CSS variables
function applyThemeToCSS(colors) {
  if (typeof window === 'undefined') return
  
  const root = document.documentElement
  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value)
  })
  
  // Apply common theme variables for Vuetify
  root.style.setProperty('--v-theme-background', colors.background)
  root.style.setProperty('--v-theme-surface', colors.surface)
  root.style.setProperty('--v-theme-on-background', colors['on-background'])
  root.style.setProperty('--v-theme-on-surface', colors['on-surface'])
}

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref('light')
  
  const isDark = computed(() => currentTheme.value === 'dark')
  const isLight = computed(() => currentTheme.value === 'light')
  
  // Get current theme colors
  const palette = computed(() => {
    return themeConfig[currentTheme.value]?.colors || colorsDefault
  })
  
  const setTheme = (theme) => {
    if (themeConfig[theme]) {
      currentTheme.value = theme
      localStorage.setItem('theme', theme)
      
      // Apply theme to CSS variables
      applyThemeToCSS(palette.value)
      
      console.log(`🎨 Theme changed to: ${theme}`)
    }
  }
  
  const toggleTheme = () => {
    setTheme(currentTheme.value === 'light' ? 'dark' : 'light')
  }
  
  return {
    currentTheme,
    palette,
    isDark,
    isLight,
    setTheme,
    toggleTheme
  }
})

export async function initializeThemeStore(store) {
  const saved = localStorage.getItem('theme')
  if (saved) {
    store.currentTheme = saved
  }
}

// Export theme configuration for external use
export { themeConfig }
