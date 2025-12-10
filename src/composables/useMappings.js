import { ref } from 'vue'
import { mappingsApi } from '@/api'

export function useMappings() {
  const mappings = ref([])
  const loading = ref(false)
  const error = ref(null)
  const separating = ref(false)
  const converting = ref(false)
  const producing = ref(false)

  function getMappingsForAudio(audioId) {
    return mappings.value.filter((m) => m.toAudio === audioId || m.fromAudio === audioId)
  }

  function getMappingsFrom(audioId) {
    return mappings.value.filter((m) => m.fromAudio === audioId)
  }

  function getMappingsTo(audioId) {
    return mappings.value.filter((m) => m.toAudio === audioId)
  }

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      mappings.value = await mappingsApi.getAll()
      return mappings.value
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
      const fileMappings = await mappingsApi.getAllForFile(audioId)
      return fileMappings
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
      const mapping = await mappingsApi.create(data)
      mappings.value.push(mapping)
      return mapping
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function update(id, data) {
    loading.value = true
    error.value = null
    try {
      const updated = await mappingsApi.update(id, data)
      const index = mappings.value.findIndex((m) => m.id === id)
      if (index !== -1) {
        mappings.value[index] = { ...mappings.value[index], ...data }
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
      await mappingsApi.delete(id)
      mappings.value = mappings.value.filter((m) => m.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function separateAudio(audioId) {
    separating.value = true
    error.value = null
    try {
      const result = await mappingsApi.separateAudio(audioId)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      separating.value = false
    }
  }

  async function convertAudio(audioId) {
    converting.value = true
    error.value = null
    try {
      const result = await mappingsApi.convertAudio(audioId)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      converting.value = false
    }
  }

  async function produceOutput(audioId) {
    producing.value = true
    error.value = null
    try {
      const result = await mappingsApi.produceOutput(audioId)
      return result
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      producing.value = false
    }
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 100)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
  }

  function getDuration(mapping) {
    return mapping.fromEndTime - mapping.fromStartTime
  }

  function validateMapping(data) {
    if (data.fromStartTime >= data.fromEndTime) {
      throw new Error('Start time must be less than end time')
    }
    if (data.fromStartTime < 0 || data.fromEndTime < 0 || data.toStartTime < 0) {
      throw new Error('Times cannot be negative')
    }
    return true
  }

  return {
    mappings,
    loading,
    error,
    separating,
    converting,
    producing,
    getMappingsForAudio,
    getMappingsFrom,
    getMappingsTo,
    loadAll,
    loadForFile,
    create,
    update,
    remove,
    separateAudio,
    convertAudio,
    produceOutput,
    formatTime,
    getDuration,
    validateMapping,
  }
}
