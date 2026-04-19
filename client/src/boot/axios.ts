import { boot } from 'quasar/wrappers'
import { useAuthStore } from '@/app/stores/auth.store'
import { useThemeStore } from '@/app/stores/theme.store'

export default boot(async ({ router }) => {
  const authStore = useAuthStore()
  const themeStore = useThemeStore()

  authStore.init()
  themeStore.init()

  router.beforeEach(async (to, _from, next) => {
    const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)

    if (!requiresAuth) {
      if (to.path.startsWith('/auth') && authStore.isAuthenticated) {
        return next('/dashboard')
      }
      return next()
    }

    if (authStore.isAuthenticated) return next()

    const restored = await authStore.restoreSession()
    if (restored) return next()

    next({ path: '/auth/login', query: { redirect: to.fullPath } })
  })
})
