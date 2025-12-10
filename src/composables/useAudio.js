import { ref, computed } from 'vue'
import { audioApi } from '@/api/handlers'

export function useAudio() {
  const audioFiles = ref([])
  const loading = ref(false)
  const error = ref(null)
  const uploadProgress = ref(0)

  const rawAudioFiles = computed(() => audioFiles.value.filter((a) => a.type === 'raw'))
  const dubbedAudioFiles = computed(() => audioFiles.value.filter((a) => a.type === 'dubbed'))

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      audioFiles.value = await audioApi.getAll()
      return audioFiles.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadRaw() {
    loading.value = true
    error.value = null
    try {
      const files = await audioApi.getAllRaw()
      audioFiles.value = files
      return files
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadDubbed() {
    loading.value = true
    error.value = null
    try {
      const files = await audioApi.getAllDubbed()
      audioFiles.value = files
      return files
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function uploadRaw(file) {
    loading.value = true
    error.value = null
    uploadProgress.value = 0
    try {
      const uploaded = await audioApi.uploadRaw(file)
      audioFiles.value.push(uploaded)
      uploadProgress.value = 100
      return uploaded
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function uploadDubbed(file) {
    loading.value = true
    error.value = null
    uploadProgress.value = 0
    try {
      const uploaded = await audioApi.uploadDubbed(file)
      audioFiles.value.push(uploaded)
      uploadProgress.value = 100
      return uploaded
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function getFile(fileName) {
    try {
      const blob = await audioApi.getFile(fileName)
      return URL.createObjectURL(blob)
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  async function updateName(id, name) {
    loading.value = true
    error.value = null
    try {
      const updated = await audioApi.updateName(id, name)
      const index = audioFiles.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        audioFiles.value[index] = { ...audioFiles.value[index], name }
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
      await audioApi.delete(id)
      audioFiles.value = audioFiles.value.filter((a) => a.id !== id)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return {
    audioFiles,
    rawAudioFiles,
    dubbedAudioFiles,
    loading,
    error,
    uploadProgress,
    loadAll,
    loadRaw,
    loadDubbed,
    uploadRaw,
    uploadDubbed,
    getFile,
    updateName,
    remove,
    formatFileSize,
  }
}
