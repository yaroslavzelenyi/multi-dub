import apiClient from './client'

export const modelsApi = {
  /**
   * Отримати всі налаштування моделей
   * GET /models/all
   */
  async getAll() {
    const response = await apiClient.get('/models/all')
    return response.data
  },

  /**
   * Отримати налаштування конкретної моделі
   * GET /models/:type
   * @param {string} type - Тип моделі: 'diarization', 'recognition', 'separation', 'translation', 'voiceConversion'
   */
  async getOne(type) {
    const response = await apiClient.get(`/models/${type}`)
    return response.data
  },

  /**
   * Оновити налаштування моделі
   * PATCH /models/:type
   * @param {string} type - Тип моделі
   * @param {Object} data - Нові налаштування моделі
   * @param {string} data.model - Назва моделі (наприклад, 'whisper', 'pyannote3.1', 'demucs')
   */
  async update(type, data) {
    const response = await apiClient.patch(`/models/${type}`, data)
    return response.data
  },
}

export default modelsApi

/**
 * Доступні моделі по типам:
 *
 * Diarization (розпізнавання дикторів):
 * - pyannote3.1
 *
 * Recognition (розпізнавання мови):
 * - whisper
 *
 * Separation (відокремлення звуку):
 * - demucs
 *
 * Translation (переклад):
 * - deepl
 *
 * Voice Conversion (конвертація голосу):
 * - chatterbox
 */
