import { ref, computed } from 'vue'
import { diarizationApi } from '@/api/handlers'

export function useDiarization() {
  const diarizations = ref([])
  const loading = ref(false)
  const error = ref(null)
  const applying = ref(false)

  const speakers = computed(() => {
    const speakersSet = new Set(diarizations.value.map((d) => d.speaker))
    return Array.from(speakersSet).sort()
  })

  function getDiarizationsForAudio(audioId) {
    return diarizations.value.filter((d) => d.forAudio === audioId)
  }

  function getDiarizationsBySpeaker(speaker) {
    return diarizations.value.filter((d) => d.speaker === speaker)
  }

  function getSpeakerSegments(audioId, speaker) {
    return diarizations.value
      .filter((d) => d.forAudio === audioId && d.speaker === speaker)
      .sort((a, b) => a.startTime - b.startTime)
  }

  async function loadAll() {
    loading.value = true
    error.value = null
    try {
      diarizations.value = await diarizationApi.getAll()
      return diarizations.value
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
      const fileDiarizations = await diarizationApi.getAllForFile(audioId)
      return fileDiarizations
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
      const diarization = await diarizationApi.create(data)
      diarizations.value.push(diarization)
      return diarization
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function apply(audioIds) {
    applying.value = true
    error.value = null
    try {
      const count = await diarizationApi.apply({
        forAudio: audioIds,
      })
      // Перезавантажуємо діаризацію після застосування
      await loadAll()
      return count
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      applying.value = false
    }
  }

  async function update(id, data) {
    loading.value = true
    error.value = null
    try {
      const updated = await diarizationApi.update(id, data)
      const index = diarizations.value.findIndex((d) => d.id === id)
      if (index !== -1) {
        diarizations.value[index] = { ...diarizations.value[index], ...data }
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
      await diarizationApi.delete(id)
      diarizations.value = diarizations.value.filter((d) => d.id !== id)
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
      await diarizationApi.deleteForFile(audioId)
      diarizations.value = diarizations.value.filter((d) => d.forAudio !== audioId)
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
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  function getDuration(diarization) {
    return diarization.endTime - diarization.startTime
  }

  function getOverlaps(audioId) {
    const segments = getDiarizationsForAudio(audioId).sort((a, b) => a.startTime - b.startTime)
    const overlaps = []

    for (let i = 0; i < segments.length - 1; i++) {
      for (let j = i + 1; j < segments.length; j++) {
        const seg1 = segments[i]
        const seg2 = segments[j]

        if (seg1.endTime > seg2.startTime && seg1.startTime < seg2.endTime) {
          overlaps.push({
            segment1: seg1,
            segment2: seg2,
            overlapStart: Math.max(seg1.startTime, seg2.startTime),
            overlapEnd: Math.min(seg1.endTime, seg2.endTime),
          })
        }
      }
    }

    return overlaps
  }

  return {
    diarizations,
    loading,
    error,
    applying,
    speakers,
    getDiarizationsForAudio,
    getDiarizationsBySpeaker,
    getSpeakerSegments,
    loadAll,
    loadForFile,
    create,
    apply,
    update,
    remove,
    removeForFile,
    formatTime,
    getDuration,
    getOverlaps,
  }
}
