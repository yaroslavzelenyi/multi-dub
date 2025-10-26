<template>
  <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-100">Запис голосу</h3>
      <div class="flex items-center space-x-2">
        <div v-if="isRecording" class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span v-if="isRecording" class="text-sm text-red-500 font-medium">
          {{ formatTime(recordingTime) }}
        </span>
        <span v-else-if="audioBlob" class="text-sm text-green-500 font-medium">
          Готово ({{ formatTime(recordingDuration) }})
        </span>
      </div>
    </div>

    <!-- Recording Controls -->
    <div class="flex flex-col items-center space-y-4">
      <!-- Visualizer -->
      <div
        v-if="isRecording"
        class="w-full h-24 bg-gray-950 rounded-lg overflow-hidden flex items-center justify-center"
      >
        <canvas ref="visualizerCanvas" class="w-full h-full"></canvas>
      </div>

      <!-- Waveform Preview -->
      <div v-if="audioBlob && !isRecording" class="w-full">
        <div ref="recordedWaveformRef" class="waveform-container h-24"></div>
      </div>

      <!-- Control Buttons -->
      <div class="flex items-center space-x-3">
        <!-- Start Recording Button -->
        <button
          v-if="!isRecording && !audioBlob"
          @click="startRecording"
          class="w-16 h-16 flex items-center justify-center bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          :disabled="!isSupported"
        >
          <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
            />
            <path
              d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
            />
          </svg>
        </button>

        <!-- Stop Recording Button -->
        <button
          v-if="isRecording"
          @click="stopRecording"
          class="w-16 h-16 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
        >
          <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>

        <!-- Play Recorded Audio -->
        <button
          v-if="audioBlob && !isRecording"
          @click="togglePlayback"
          class="w-16 h-16 flex items-center justify-center bg-violet-600 hover:bg-violet-700 rounded-full transition-colors"
        >
          <svg
            v-if="!isPlayingRecorded"
            class="w-7 h-7 text-white ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
          <svg v-else class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        </button>

        <!-- Delete Recording -->
        <button
          v-if="audioBlob && !isRecording"
          @click="deleteRecording"
          class="w-12 h-12 flex items-center justify-center bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>

        <!-- Use Recording -->
        <button
          v-if="audioBlob && !isRecording"
          @click="useRecording"
          class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Використати запис</span>
        </button>
      </div>

      <!-- Error/Info Messages -->
      <div v-if="!isSupported" class="text-sm text-red-400 text-center">
        Ваш браузер не підтримує запис аудіо
      </div>
      <div v-if="error" class="text-sm text-red-400 text-center">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import WaveSurfer from 'wavesurfer.js'

const emit = defineEmits(['recording-complete'])

const isSupported = ref(false)
const isRecording = ref(false)
const isPlayingRecorded = ref(false)
const audioBlob = ref(null)
const recordingTime = ref(0)
const recordingDuration = ref(0)
const error = ref('')

const mediaRecorder = ref(null)
const audioChunks = ref([])
const recordingTimer = ref(null)
const audioContext = ref(null)
const analyser = ref(null)
const visualizerCanvas = ref(null)
const animationId = ref(null)
const recordedWaveformRef = ref(null)
const wavesurfer = ref(null)

onMounted(() => {
  isSupported.value = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
})

const startRecording = async () => {
  try {
    error.value = ''
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

    const options = { mimeType: 'audio/webm' }
    mediaRecorder.value = new MediaRecorder(stream, options)
    audioChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      const blob = new Blob(audioChunks.value, { type: 'audio/webm' })
      audioBlob.value = blob
      recordingDuration.value = recordingTime.value

      stream.getTracks().forEach((track) => track.stop())

      if (animationId.value) {
        cancelAnimationFrame(animationId.value)
      }

      setTimeout(() => loadRecordedAudio(), 100)
    }

    setupVisualizer(stream)

    mediaRecorder.value.start()
    isRecording.value = true
    recordingTime.value = 0

    recordingTimer.value = setInterval(() => {
      recordingTime.value++
    }, 1000)
  } catch (err) {
    console.error('Error starting recording:', err)
    error.value = 'Не вдалося отримати доступ до мікрофону'
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false

    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
    }
  }
}

const setupVisualizer = (stream) => {
  audioContext.value = new (window.AudioContext || window.webkitAudioContext)()
  analyser.value = audioContext.value.createAnalyser()
  const source = audioContext.value.createMediaStreamSource(stream)
  source.connect(analyser.value)
  analyser.value.fftSize = 2048

  drawVisualizer()
}

const drawVisualizer = () => {
  if (!visualizerCanvas.value || !isRecording.value) return

  const canvas = visualizerCanvas.value
  const ctx = canvas.getContext('2d')
  const width = (canvas.width = canvas.offsetWidth)
  const height = (canvas.height = canvas.offsetHeight)

  const bufferLength = analyser.value.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)

  const draw = () => {
    if (!isRecording.value) return

    animationId.value = requestAnimationFrame(draw)
    analyser.value.getByteTimeDomainData(dataArray)

    ctx.fillStyle = '#030712'
    ctx.fillRect(0, 0, width, height)

    ctx.lineWidth = 2
    ctx.strokeStyle = '#8b5cf6'
    ctx.beginPath()

    const sliceWidth = width / bufferLength
    let x = 0

    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = (v * height) / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }

  draw()
}

const loadRecordedAudio = () => {
  if (!recordedWaveformRef.value || !audioBlob.value) return

  wavesurfer.value = WaveSurfer.create({
    container: recordedWaveformRef.value,
    waveColor: '#6b7280',
    progressColor: '#8b5cf6',
    cursorColor: '#3b82f6',
    barWidth: 2,
    barRadius: 3,
    cursorWidth: 2,
    height: 96,
    barGap: 2,
    normalize: true,
  })

  wavesurfer.value.on('play', () => {
    isPlayingRecorded.value = true
  })

  wavesurfer.value.on('pause', () => {
    isPlayingRecorded.value = false
  })

  wavesurfer.value.on('finish', () => {
    isPlayingRecorded.value = false
  })

  const url = URL.createObjectURL(audioBlob.value)
  wavesurfer.value.load(url)
}

const togglePlayback = () => {
  if (wavesurfer.value) {
    wavesurfer.value.playPause()
  }
}

const deleteRecording = () => {
  if (wavesurfer.value) {
    wavesurfer.value.destroy()
    wavesurfer.value = null
  }
  audioBlob.value = null
  recordingTime.value = 0
  recordingDuration.value = 0
  isPlayingRecorded.value = false
}

const useRecording = () => {
  if (audioBlob.value) {
    const file = new File([audioBlob.value], `recording-${Date.now()}.webm`, {
      type: 'audio/webm',
    })

    emit('recording-complete', file, audioBlob.value)
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

onBeforeUnmount(() => {
  if (mediaRecorder.value && isRecording.value) {
    stopRecording()
  }
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
  }
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
  if (wavesurfer.value) {
    wavesurfer.value.destroy()
  }
})
</script>

<style scoped>
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
