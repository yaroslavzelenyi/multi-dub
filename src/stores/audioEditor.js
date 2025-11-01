import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAudioEditorStore = defineStore('audioEditor', () => {
  const audioTracks = ref([])
  const currentTrack = ref(null)
  const isEditing = ref(false)
  const selectionStart = ref(0)
  const selectionEnd = ref(0)
  const zoom = ref(1)

  const history = ref([])
  const historyIndex = ref(-1)

  const hasSelection = computed(() => selectionEnd.value > selectionStart.value)
  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  const addTrack = (track) => {
    const newTrack = {
      id: Date.now(),
      name: track.name || `Track ${audioTracks.value.length + 1}`,
      buffer: track.buffer,
      file: track.file,
      duration: track.buffer?.duration || 0,
      visible: true,
      volume: 1,
      muted: false,
    }
    audioTracks.value.push(newTrack)
    currentTrack.value = newTrack
    return newTrack
  }

  const removeTrack = (trackId) => {
    const index = audioTracks.value.findIndex((t) => t.id === trackId)
    if (index !== -1) {
      audioTracks.value.splice(index, 1)
      if (currentTrack.value?.id === trackId) {
        currentTrack.value = audioTracks.value[0] || null
      }
    }
  }

  const updateTrack = (trackId, updates) => {
    const track = audioTracks.value.find((t) => t.id === trackId)
    if (track) {
      Object.assign(track, updates)
    }
  }

  const setSelection = (start, end) => {
    selectionStart.value = Math.max(0, start)
    selectionEnd.value = Math.max(selectionStart.value, end)
  }

  const clearSelection = () => {
    selectionStart.value = 0
    selectionEnd.value = 0
  }

  const saveToHistory = (audioBlob) => {
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    history.value.push({
      blob: audioBlob,
      timestamp: Date.now(),
      selectionStart: selectionStart.value,
      selectionEnd: selectionEnd.value,
      tracks: audioTracks.value.length > 0 ? JSON.parse(JSON.stringify(audioTracks.value)) : [],
    })

    historyIndex.value++

    if (history.value.length > 20) {
      history.value.shift()
      historyIndex.value--
    }

    console.log('History saved:', {
      index: historyIndex.value,
      total: history.value.length,
      canUndo: canUndo.value,
      canRedo: canRedo.value,
    })
  }

  const undo = () => {
    if (canUndo.value) {
      historyIndex.value--
      const state = history.value[historyIndex.value]
      console.log('Undo to index:', historyIndex.value)
      return state
    }
    return null
  }

  const redo = () => {
    if (canRedo.value) {
      historyIndex.value++
      const state = history.value[historyIndex.value]
      console.log('Redo to index:', historyIndex.value)
      return state
    }
    return null
  }

  const getCurrentHistoryItem = () => {
    if (historyIndex.value >= 0 && historyIndex.value < history.value.length) {
      return history.value[historyIndex.value]
    }
    return null
  }

  const setZoom = (level) => {
    zoom.value = Math.max(1, Math.min(10, level))
  }

  const reset = () => {
    audioTracks.value = []
    currentTrack.value = null
    isEditing.value = false
    selectionStart.value = 0
    selectionEnd.value = 0
    history.value = []
    historyIndex.value = -1
    zoom.value = 1
  }

  return {
    audioTracks,
    currentTrack,
    isEditing,
    selectionStart,
    selectionEnd,
    hasSelection,
    canUndo,
    canRedo,
    zoom,
    history,
    historyIndex,
    addTrack,
    removeTrack,
    updateTrack,
    setSelection,
    clearSelection,
    saveToHistory,
    undo,
    redo,
    getCurrentHistoryItem,
    setZoom,
    reset,
  }
})
