import { useHttpClient } from './useHTTPClient'

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
    const name = kebabToCamel(filename)

    API[name] = handlers[key](httpClient)
  }

  return {
    API: Object.freeze(API),
  }
}
