import { ref, computed } from 'vue'
import { subtitlesApi } from '@/api/handlers'

export function useSubtitles() {
  const subtitles = ref([])
  const loading = ref(false)
  const error = ref(null)
  const generating = ref(false)
  const translating = ref(false)

  const languages = computed(() => {
    const langs = new Set(subtitles.value.map((s) => s.language))
    return Array.from(langs)
  })

  const originalSubtitles = computed(() => {
    return subtitles.value.filter((s) => !s.translationOf)
  })

  const translatedSubtitles = computed(() => {
    return subtitles.value.filter((s) => s.translationOf)
  })

  function getSubtitlesForAudio(audioId) {
    return subtitles.value.filter((s) => s.forAudio === audioId)
  }

  function getSubtitlesByLanguage(language) {
    return subtitles.value.filter((s) => s.language === language)
  }

  function getTranslationsOf(subtitleId) {
    return subtitles.value.filter((s) => s.translationOf === subtitleId)
  }

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      subtitles.value = await subtitlesApi.getAll()
      return subtitles.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadForFile(audioId) {
    loading.value = true
    error.value = null
    try {
      const fileSubtitles = await subtitlesApi.getAllForFile(audioId)
      return fileSubtitles
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function create(data) {
    loading.value = true
    error.value = null
    try {
      const subtitle = await subtitlesApi.create(data)
      subtitles.value.push(subtitle)
      return subtitle
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function generate(audioIds, language = 'en') {
    generating.value = true
    error.value = null
    try {
      // generate приймає forAudio (масив або число)
      const count = await subtitlesApi.generate(
        Array.isArray(audioIds) ? audioIds : [audioIds]
      )
      // Перезавантажуємо субтитри після генерації
      await loadAll()
      return count
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      generating.value = false
    }
  }

  async function translate(subtitleIds, targetLanguage) {
    translating.value = true
    error.value = null
    try {
      // translate приймає (language, forAudio?, forSubtitle?)
      const count = await subtitlesApi.translate(
        targetLanguage,
        undefined,
        Array.isArray(subtitleIds) ? subtitleIds : [subtitleIds]
      )
      // Перезавантажуємо субтитри після перекладу
      await loadAll()
      return count
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      translating.value = false
    }
  }

  async function update(id, data) {
    loading.value = true
    error.value = null
    try {
      const updated = await subtitlesApi.update(id, data)
      const index = subtitles.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        subtitles.value[index] = { ...subtitles.value[index], ...data }
      }
      return updated
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    error.value = null
    try {
      await subtitlesApi.delete(id)
      subtitles.value = subtitles.value.filter((s) => s.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function removeForFile(audioId) {
    loading.value = true
    error.value = null
    try {
      await subtitlesApi.deleteForFile(audioId)
      subtitles.value = subtitles.value.filter((s) => s.forAudio !== audioId)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  function parseTime(timeString) {
    const [mins, rest] = timeString.split(':')
    const [secs, ms] = rest.split('.')
    return parseInt(mins) * 60 + parseInt(secs) + parseInt(ms) / 100
  }

  return {
    subtitles,
    loading,
    error,
    generating,
    translating,
    languages,
    originalSubtitles,
    translatedSubtitles,
    getSubtitlesForAudio,
    getSubtitlesByLanguage,
    getTranslationsOf,
    loadAll,
    loadForFile,
    create,
    generate,
    translate,
    update,
    remove,
    removeForFile,
    formatTime,
    parseTime,
  }
}
