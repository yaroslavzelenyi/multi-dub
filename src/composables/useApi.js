import { useHttpClient } from './useHttpClientMiddleware'

function kebabToCamel(filename) {
  return filename.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
}

export const useApi = () => {
  const httpClient = useHttpClient()

  const handlers = import.meta.glob('../api/handlers/**/*.js', {
    eager: true,
    import: 'default',
  })

  const API = {}

  for (const key in handlers) {
    if (!Object.hasOwn(handlers, key)) {
      continue
    }

    const match = key.match(/([^/\\]+)\.js$/)

    if (!match) {
      continue
    }

    const [, filename] = match
    if (filename === 'index') {
      continue
    }

    const name = kebabToCamel(filename)

    const handler = handlers[key]
    API[name] = typeof handler === 'function' ? handler(httpClient) : handler
  }

  return {
    API: Object.freeze(API),
  }
}
