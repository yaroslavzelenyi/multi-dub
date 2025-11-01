import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useNotification } from './useNotification'
import { Base64Encode } from '../utils/crypto'
import { useHttpClient } from './useHTTPClient'

export const useHttpClientMiddleware = () => {
  const httpClient = useHttpClient()
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()
  const { error: showError } = useNotification()
  const { locale } = useI18n()

  function requestMiddleware() {
    httpClient.interceptors.request.use(
      (config) => {
        config.headers['X-Site-Language'] = locale.value

        if (authStore.token) {
          config.headers.Authorization = `Bearer ${authStore.token}`
        }

        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )
  }

  function responseMiddleware() {
    httpClient.interceptors.response.use(
      (response) => {
        return response
      },
      (error) => {
        const authRequired = !['login'].includes(route.name)

        if (error?.message && authRequired) {
          showError(error.message)
        }

        if (error.response?.status === 401 && authRequired) {
          console.log('401 Unauthorized - clearing token and redirecting to login')

          authStore.logout()

          const query = {}

          if (route.name !== 'not-found' && router.resolve(route.fullPath)?.name !== 'not-found') {
            query.redirect = Base64Encode({
              name: route.name,
              params: route.params,
              query: route.query,
              hash: route.hash,
            })
          }

          const { fullPath } = router.resolve({
            name: 'Login',
            query,
          })

          router.replace({ path: fullPath })
        }

        return Promise.reject(error)
      },
    )
  }

  return {
    requestMiddleware,
    responseMiddleware,
  }
}
