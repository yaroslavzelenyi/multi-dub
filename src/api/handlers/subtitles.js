const subtitlesApi = (httpClient) => ({
  // Отримати всі субтитри (з опціональними query параметрами)
  // GET /subtitles?forAudio=:id&language=:lang
  async getAll(forAudio, language) {
    const params = {}
    if (forAudio !== undefined) params.forAudio = forAudio
    if (language !== undefined) params.language = language

    const { data } = await httpClient.get('/subtitles', {
      params: Object.keys(params).length > 0 ? params : {},
    })
    return data
  },

  // Отримати всі мови для аудіофайлу
  // GET /subtitles/languages?For audio=:id
  async getAllLanguages(forAudio) {
    const { data } = await httpClient.get('/subtitles/languages', {
      params: forAudio ? { 'For audio': forAudio } : {},
    })
    return data
  },

  // Отримати субтитри для конкретного аудіофайлу
  // GET /subtitles/:forAudio
  async getForAudio(audioId) {
    const { data } = await httpClient.get(`/subtitles/${audioId}`)
    return data
  },

  // Аліас для сумісності
  getAllForFile(audioId) {
    return this.getForAudio(audioId)
  },

  // Створити субтитри
  // POST /subtitles
  async create(data) {
    const { data: result } = await httpClient.post('/subtitles', data)
    return result
  },

  // Згенерувати субтитри
  // POST /subtitles/generate (body: { forAudio: number[] })
  async generate(forAudio) {
    const { data } = await httpClient.post('/subtitles/generate', {
      forAudio: Array.isArray(forAudio) ? forAudio : [forAudio],
    })
    return data
  },

  // Перекласти субтитри
  // POST /subtitles/translate (body: { forAudio?: number[], forSubtitle?: number[], language: string })
  async translate(language, forAudio, forSubtitle) {
    const body = { language }
    if (forAudio !== undefined) {
      body.forAudio = Array.isArray(forAudio) ? forAudio : [forAudio]
    }
    if (forSubtitle !== undefined) {
      body.forSubtitle = Array.isArray(forSubtitle) ? forSubtitle : [forSubtitle]
    }

    const { data } = await httpClient.post('/subtitles/translate', body)
    return data
  },

  // Оновити субтитри
  // PATCH /subtitles/:id
  async update(subtitleId, updates) {
    const { data } = await httpClient.patch(`/subtitles/${subtitleId}`, updates)
    return data
  },

  // Видалити субтитри
  // DELETE /subtitles/:id
  async delete(subtitleId) {
    const { data } = await httpClient.delete(`/subtitles/${subtitleId}`)
    return data
  },
})

export default subtitlesApi
export { subtitlesApi }
