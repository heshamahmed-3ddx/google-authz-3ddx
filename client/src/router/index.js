import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/callback',
    name: 'Callback',
    component: () => import('@/views/CallbackView.vue')
  },
  // Redirect old routes to dashboard
  {
    path: '/user-details',
    redirect: '/dashboard'
  },
  {
    path: '/user-rights',
    redirect: '/dashboard'
  },
  {
    path: '/profile',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    // Special handling for dashboard route - always check auth from server
    // This ensures OAuth redirects work properly
    console.log('🔍 Router guard: Checking auth for protected route:', to.name)
    
    const isAuthenticated = await authStore.checkAuth()
    
    console.log('🔍 Router guard: Auth check result:', isAuthenticated)
    
    if (!isAuthenticated) {
      console.log('❌ Router guard: Not authenticated, redirecting to Home')
      next({ name: 'Home' })
    } else {
      console.log('✅ Router guard: Authenticated, allowing navigation')
      next()
    }
  } else {
    next()
  }
})

export default router