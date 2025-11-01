export default (httpClient) => ({
  async uploadAudio(file) {
    const formData = new FormData()
    formData.append('audio', file)

    const { data } = await httpClient.post('/audio/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  async trimAudio(audioId, startTime, endTime) {
    const { data } = await httpClient.post(`/audio/${audioId}/trim`, {
      startTime,
      endTime,
    })
    return data
  },

  async mergeAudio(audioIds) {
    const { data } = await httpClient.post('/audio/merge', { audioIds })
    return data
  },

  async normalizeAudio(audioId) {
    const { data } = await httpClient.post(`/audio/${audioId}/normalize`)
    return data
  },

  async applyFade(audioId, fadeIn, fadeOut) {
    const { data } = await httpClient.post(`/audio/${audioId}/fade`, {
      fadeIn,
      fadeOut,
    })
    return data
  },

  async exportAudio(audioId, format = 'mp3') {
    const { data } = await httpClient.get(`/audio/${audioId}/export`, {
      params: { format },
      responseType: 'blob',
    })
    return data
  },
})
