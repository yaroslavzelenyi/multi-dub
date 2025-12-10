import apiClient from './client'

export const diarizationApi = {
  /**
   * Отримати всю діаризацію проекту
   * GET /diarization/all
   */
  async getAll() {
    const response = await apiClient.get('/diarization/all')
    return response.data
  },

  /**
   * Отримати діаризацію для конкретного аудіофайлу
   * GET /diarization/all/file/:id
   * @param {number} audioId - ID аудіофайлу
   */
  async getAllForFile(audioId) {
    const response = await apiClient.get(`/diarization/all/file/${audioId}`)
    return response.data
  },

  /**
   * Отримати один запис діаризації
   * GET /diarization/:id
   */
  async getOne(id) {
    const response = await apiClient.get(`/diarization/${id}`)
    return response.data
  },

  /**
   * Створити запис діаризації
   * POST /diarization
   * @param {Object} data - Дані діаризації
   * @param {number} data.forAudio - ID аудіофайлу
   * @param {number} data.startTime - Час початку (секунди)
   * @param {number} data.endTime - Час закінчення (секунди)
   * @param {string} data.speaker - Номер або ім'я диктора
   */
  async create(data) {
    const response = await apiClient.post('/diarization', data)
    return response.data
  },

  /**
   * Застосувати діаризацію (автоматично розпізнати дикторів)
   * POST /diarization/apply
   * @param {Object} data
   * @param {number[]} data.forAudio - Масив ID аудіофайлів для діаризації
   */
  async apply(data) {
    const response = await apiClient.post('/diarization/apply', data)
    return response.data
  },

  /**
   * Оновити запис діаризації
   * PATCH /diarization/:id
   * @param {number} id - ID запису діаризації
   * @param {Object} data - Дані для оновлення
   */
  async update(id, data) {
    const response = await apiClient.patch(`/diarization/${id}`, data)
    return response.data
  },

  /**
   * Видалити запис діаризації
   * DELETE /diarization/:id
   */
  async delete(id) {
    const response = await apiClient.delete(`/diarization/${id}`)
    return response.data
  },

  /**
   * Видалити всю діаризацію для аудіофайлу
   * DELETE /diarization/batch/file/:id
   */
  async deleteForFile(audioId) {
    const response = await apiClient.delete(`/diarization/batch/file/${audioId}`)
    return response.data
  },
}

export default diarizationApi
