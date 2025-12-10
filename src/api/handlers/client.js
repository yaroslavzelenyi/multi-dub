import axios from 'axios'

// Використовуємо відносний шлях /api, який буде проксований через Vite
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true, // Важливо для роботи з cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor для обробки помилок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  },
)

export default apiClient
export { apiClient }
