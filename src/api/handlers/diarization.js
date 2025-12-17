import apiClient from './client'

export const diarizationApi = {
  /**
   * Отримати всю діаризацію проекту
   * GET /diarisation
   */
  async getAll() {
    const response = await apiClient.get('/diarisation')
    return response.data
  },

  /**
   * Отримати діаризацію для конкретного аудіофайлу
   * GET /diarisation/:id (де id - це ID аудіофайлу)
   * @param {number} audioId - ID аудіофайлу
   */
  async getAllForFile(audioId) {
    const response = await apiClient.get(`/diarisation/${audioId}`)
    return response.data
  },

  /**
   * Отримати всіх спікерів
   * GET /diarisation/speakers
   */
  async getAllSpeakers() {
    const response = await apiClient.get('/diarisation/speakers')
    return response.data
  },

  /**
   * Отримати один запис діаризації
   * GET /diarisation/:id
   */
  async getOne(id) {
    const response = await apiClient.get(`/diarisation/${id}`)
    return response.data
  },

  /**
   * Створити запис діаризації
   * POST /diarisation
   * @param {Object} data - Дані діаризації
   * @param {number} data.forAudio - ID аудіофайлу
   * @param {number} data.startTime - Час початку (секунди)
   * @param {number} data.endTime - Час закінчення (секунди)
   * @param {string} data.speaker - Номер або ім'я диктора
   */
  async create(data) {
    const response = await apiClient.post('/diarisation', data)
    return response.data
  },

  /**
   * Застосувати діаризацію (автоматично розпізнати дикторів)
   * POST /diarisation/use
   * @param {Object} data
   * @param {number[]} data.forAudio - Масив ID аудіофайлів для діаризації
   */
  async apply(data) {
    const response = await apiClient.post('/diarisation/use', data)
    return response.data
  },

  /**
   * Оновити запис діаризації
   * PATCH /diarisation/:id
   * @param {number} id - ID запису діаризації
   * @param {Object} data - Дані для оновлення
   */
  async update(id, data) {
    const response = await apiClient.patch(`/diarisation/${id}`, data)
    return response.data
  },

  /**
   * Видалити запис діаризації
   * DELETE /diarisation/:id
   */
  async delete(id) {
    const response = await apiClient.delete(`/diarisation/${id}`)
    return response.data
  },
}

export default diarizationApi
