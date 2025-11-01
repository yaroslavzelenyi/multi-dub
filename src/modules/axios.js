import axios from 'axios'

export const HTTP_CLIENT_KEY = Symbol('httpClient')

export const install = async (context) => {
  const { app, router } = context
  let abortController = new AbortController()

  const httpClient = axios.create({
    /* Base config */
    baseURL: import.meta.env.VITE_API_URL,

    /* Custom config */
    abortable: true,
  })

  httpClient.abortRequestController = () => {
    abortController.abort()
    abortController = new AbortController()
  }

  httpClient.interceptors.request.use(
    (config) => {
      if (config?.abortable && config?.url && !config.signal) {
        config.signal = abortController.signal
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  httpClient.interceptors.response.use(
    (response) => {
      return response
    },
    (error) => {
      if (error?.code === 'ERR_CANCELED') {
        return null
      }

      return Promise.reject(error)
    },
  )

  router.beforeEach((to, from) => {
    if (from.path !== to.path) {
      httpClient.abortRequestController()
    }
  })

  context.httpClient = httpClient
  app.provide(HTTP_CLIENT_KEY, httpClient)
}
