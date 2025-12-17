import apiClient from './client'

export const mappingsApi = {
  /**
   * Отримати всі маппінги проекту
   * GET /mappings
   */
  async getAll() {
    const response = await apiClient.get('/mappings')
    return response.data
  },

  /**
   * Отримати маппінги для конкретного аудіофайлу
   * GET /mappings/:id (де id - це ID аудіофайлу)
   * @param {number} audioId - ID аудіофайлу
   */
  async getAllForFile(audioId) {
    const response = await apiClient.get(`/mappings/${audioId}`)
    return response.data
  },

  /**
   * Створити маппінг між аудіофайлами
   * POST /mappings
   * @param {Object} data - Дані маппінгу
   * @param {number} data.fromAudio - ID дубльованого аудіофайлу (джерело)
   * @param {number} data.fromStartTime - Початок сегменту в дубльованому аудіо (секунди)
   * @param {number} data.fromEndTime - Кінець сегменту в дубльованому аудіо (секунди)
   * @param {number} data.toAudio - ID оригінального аудіофайлу (призначення)
   * @param {number} data.toStartTime - Час вставки в оригінальне аудіо (секунди)
   */
  async create(data) {
    const response = await apiClient.post('/mappings', data)
    return response.data
  },

  /**
   * Оновити маппінг
   * PATCH /mappings/:id
   * @param {number} id - ID маппінгу
   * @param {Object} data - Дані для оновлення
   */
  async update(id, data) {
    const response = await apiClient.patch(`/mappings/${id}`, data)
    return response.data
  },

  /**
   * Видалити маппінг
   * DELETE /mappings/:id
   */
  async delete(id) {
    const response = await apiClient.delete(`/mappings/${id}`)
    return response.data
  },

  /**
   * Відокремити аудіо (audio separation)
   * POST /audio/:id/separation
   * @param {number} audioId - ID аудіофайлу для сепарації (тільки для type='raw')
   */
  async separateAudio(audioId) {
    const response = await apiClient.post(`/audio/${audioId}/separation`)
    return response.data
  },

  /**
   * Конвертувати голос (voice conversion)
   * POST /audio/:id/conversion
   * @param {number} audioId - ID аудіофайлу для конвертації (тільки для type='dubbed')
   */
  async convertAudio(audioId) {
    const response = await apiClient.post(`/audio/${audioId}/conversion`)
    return response.data
  },

  /**
   * Отримати всі вихідні аудіофайли
   * GET /audio/output
   */
  async getOutputs() {
    const response = await apiClient.get('/audio/output')
    return response.data
  },

  /**
   * Отримати вихідні файли для конкретного аудіо
   * GET /audio/:id/output
   * @param {number} audioId - ID аудіофайлу (тільки для type='raw')
   */
  async getOutputsForAudio(audioId) {
    const response = await apiClient.get(`/audio/${audioId}/output`)
    return response.data
  },

  /**
   * Створити фінальний вихідний файл
   * POST /audio/:id/produce
   * @param {number} audioId - ID аудіофайлу (тільки для type='raw')
   */
  async produceOutput(audioId) {
    const response = await apiClient.post(`/audio/${audioId}/produce`)
    return response.data
  },
}

export default mappingsApi
