import apiClient from './client'

export const mappingsApi = {
  /**
   * Отримати всі маппінги проекту
   * GET /mappings/all
   */
  async getAll() {
    const response = await apiClient.get('/mappings/all')
    return response.data
  },

  /**
   * Отримати маппінги для конкретного аудіофайлу
   * GET /mappings/all/file/:id
   * @param {number} audioId - ID аудіофайлу
   */
  async getAllForFile(audioId) {
    const response = await apiClient.get(`/mappings/all/file/${audioId}`)
    return response.data
  },

  /**
   * Отримати один маппінг
   * GET /mappings/:id
   */
  async getOne(id) {
    const response = await apiClient.get(`/mappings/${id}`)
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
   * POST /audio/separate/:id
   * @param {number} audioId - ID аудіофайлу для сепарації
   */
  async separateAudio(audioId) {
    const response = await apiClient.post(`/audio/separate/${audioId}`)
    return response.data
  },

  /**
   * Конвертувати голос (voice conversion)
   * POST /audio/convert/:id
   * @param {number} audioId - ID аудіофайлу для конвертації
   */
  async convertAudio(audioId) {
    const response = await apiClient.post(`/audio/convert/${audioId}`)
    return response.data
  },

  /**
   * Створити фінальний вихідний файл
   * POST /audio/produce/:id
   * @param {number} audioId - ID аудіофайлу
   */
  async produceOutput(audioId) {
    const response = await apiClient.post(`/audio/produce/${audioId}`)
    return response.data
  },
}

export default mappingsApi
