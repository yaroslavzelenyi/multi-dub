const audiofilesApi = (httpClient) => {
  // Отримати всі raw аудіофайли
  // GET /audio?name=...
  const getAllRaw = async (name) => {
    const { data } = await httpClient.get('/audio', {
      params: name ? { name } : {},
    })
    return data
  }

  // Отримати всі дубльовані аудіофайли
  // GET /audio/dubbed?name=...
  const getAllDubbed = async (name) => {
    const { data } = await httpClient.get('/audio/dubbed', {
      params: name ? { name } : {},
    })
    return data
  }

  return {
    // Отримати всі raw аудіофайли
    getAllRaw,

    // Отримати всі дубльовані аудіофайли
    getAllDubbed,

    // Отримати всі аудіофайли (raw + dubbed) - об'єднуємо обидва запити
    async getAll(name) {
      const [raw, dubbed] = await Promise.all([getAllRaw(name), getAllDubbed(name)])
      return [...raw, ...dubbed]
    },

    // Завантажити raw аудіо
    // POST /audio (file в FormData як 'file')
    async uploadRaw(file) {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await httpClient.post('/audio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },

    // Завантажити дубльоване аудіо
    // POST /audio/dubbed (file в FormData як 'file')
    async uploadDubbed(file) {
      const formData = new FormData()
      formData.append('file', file)

      const { data } = await httpClient.post('/audio/dubbed', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    },

    // Отримати інформацію про аудіофайл
    // GET /audio/info/:id
    async getInfo(audioId) {
      const { data } = await httpClient.get(`/audio/info/${audioId}`)
      return data
    },

    // Отримати аудіофайл (stream)
    // GET /audio/:fileName - повертає stream файлу
    async getFile(fileName) {
      const { data } = await httpClient.get(`/audio/${encodeURIComponent(fileName)}`, {
        responseType: 'blob',
      })
      return data
    },

    // Оновити назву аудіофайлу
    // PATCH /audio/:id (body: { name: string })
    async updateName(audioId, name) {
      const { data } = await httpClient.patch(`/audio/${audioId}`, { name })
      return data
    },

    // Видалити аудіофайл
    // DELETE /audio/:id
    async delete(audioId) {
      const { data } = await httpClient.delete(`/audio/${audioId}`)
      return data
    },
  }
}

export default audiofilesApi
export { audiofilesApi }
