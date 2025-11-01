import { useHttpClient } from './useHTTPClient'

/**
 * @typedef {object} ApiHandlers
 * @property {ReturnType<typeof import('../api/handlers/customers.js').default>} users - "Users based API handlers."
 * @property {ReturnType<typeof import('../api/handlers/admin.js').default>} admin - "Admin based API handlers."
 */

/**
 * Converts kebab-case filename to camelCase
 * @param {string} filename - The filename to convert
 * @returns {string} - The camelCase version
 */
function kebabToCamel(filename) {
  return filename.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
}

/**
 * API handlers.
 *
 * @returns {{ API: Readonly<ApiHandlers> }} - "API handlers."
 */
export const useApi = () => {
  const httpClient = useHttpClient()

  const handlers = import.meta.glob('../api/handlers/**/*.js', {
    eager: true,
    import: 'default',
  })

  /** @type {ApiHandlers} */
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
