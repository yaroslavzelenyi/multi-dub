import apiClient from './client'

export const voicingApi = {
  /**
   * Отримати всі моделі озвучення
   * GET /models
   */
  async getVoicingModels() {
    const response = await apiClient.get('/models')
    return response.data.voiceConversion || { model: 'chatterbox' }
  },

  /**
   * Оновити модель озвучення
   * PATCH /models/voiceConversion
   * @param {Object} data
   * @param {string} data.model - Назва моделі
   */
  async updateVoicingModel(data) {
    const response = await apiClient.patch('/models/voiceConversion', data)
    return response.data
  },

  /**
   * Створити дубльований аудіофайл для озвучення
   * POST /audio/dubbed
   * @param {File} file - Аудіофайл
   */
  async uploadDubbedAudio(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post('/audio/dubbed', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  /**
   * Створити mapping між оригінальним та озвученим аудіо
   * POST /mappings
   * @param {Object} data
   * @param {number} data.fromAudio - ID озвученого аудіо
   * @param {number} data.fromStartTime - Початок сегменту
   * @param {number} data.fromEndTime - Кінець сегменту
   * @param {number} data.toAudio - ID оригінального аудіо
   * @param {number} data.toStartTime - Час вставки
   */
  async createMapping(data) {
    const response = await apiClient.post('/mappings', data)
    return response.data
  },

  /**
   * Отримати всі mappings
   * GET /mappings
   */
  async getAllMappings() {
    const response = await apiClient.get('/mappings')
    return response.data
  },

  /**
   * Отримати mappings для аудіофайлу
   * GET /mappings/:id
   * @param {number} audioId - ID аудіофайлу
   */
  async getMappingsForAudio(audioId) {
    const response = await apiClient.get(`/mappings/${audioId}`)
    return response.data
  },

  /**
   * Видалити mapping
   * DELETE /mappings/:id
   * @param {number} id - ID mapping
   */
  async deleteMapping(id) {
    const response = await apiClient.delete(`/mappings/${id}`)
    return response.data
  },
}

export default voicingApi
