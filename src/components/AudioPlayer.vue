<template>
  <div class="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
    <!-- Waveform Container -->
    <div class="p-6 pb-4">
      <div ref="waveformRef" class="waveform-container h-32 mb-4"></div>

      <!-- Time Display -->
      <div class="flex justify-between text-sm text-gray-400 mb-4">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>

    <!-- Controls -->
    <div class="bg-gray-900 border-t border-gray-800 px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Left Controls -->
        <div class="flex items-center space-x-3">
          <!-- Play/Pause Button -->
          <button
            @click="togglePlayPause"
            :disabled="!isReady"
            class="w-12 h-12 flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full transition-colors"
          >
            <svg
              v-if="!isPlaying"
              class="w-5 h-5 text-white ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
            <svg v-else class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          </button>

          <!-- Stop Button -->
          <button
            @click="stop"
            :disabled="!isReady"
            class="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>

          <!-- Skip Backward -->
          <button
            @click="skipBackward"
            :disabled="!isReady"
            class="w-10 h-10 flex items-center justify-center hover:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
            </svg>
          </button>

          <!-- Skip Forward -->
          <button
            @click="skipForward"
            :disabled="!isReady"
            class="w-10 h-10 flex items-center justify-center hover:bg-gray-800 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            <svg class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
            </svg>
          </button>
        </div>

        <!-- Right Controls -->
        <div class="flex items-center space-x-4">
          <!-- Playback Speed -->
          <div class="flex items-center space-x-2">
            <button
              v-for="speed in playbackSpeeds"
              :key="speed"
              @click="setPlaybackSpeed(speed)"
              :class="[
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                playbackSpeed === speed
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700',
              ]"
            >
              {{ speed }}x
            </button>
          </div>

          <!-- Volume Control -->
          <div class="flex items-center space-x-2">
            <button
              @click="toggleMute"
              class="w-9 h-9 flex items-center justify-center hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg
                v-if="!isMuted && volume > 0.5"
                class="w-5 h-5 text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                />
              </svg>
              <svg
                v-else-if="!isMuted && volume > 0"
                class="w-5 h-5 text-gray-300"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M7 9v6h4l5 5V4l-5 5H7zm11.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
                />
              </svg>
              <svg v-else class="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                />
              </svg>
            </button>
            <input
              v-model.number="volume"
              @input="updateVolume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              class="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-400"
      >
        <svg
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>{{ t('player.loading') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import WaveSurfer from 'wavesurfer.js'

const { t } = useI18n()

const props = defineProps({
  audioUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    default: 'audio.mp3',
  },
})

const waveformRef = ref(null)
const wavesurfer = ref(null)
const isPlaying = ref(false)
const isReady = ref(false)
const isLoading = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)
const isMuted = ref(false)
const playbackSpeed = ref(1)
const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

const initWaveSurfer = () => {
  if (!waveformRef.value) return

  wavesurfer.value = WaveSurfer.create({
    container: waveformRef.value,
    waveColor: '#6b7280',
    progressColor: '#8b5cf6',
    cursorColor: '#3b82f6',
    barWidth: 2,
    barRadius: 3,
    cursorWidth: 2,
    height: 128,
    barGap: 2,
    normalize: true,
    backend: 'WebAudio',
  })

  // Event listeners
  wavesurfer.value.on('ready', () => {
    isLoading.value = false
    isReady.value = true
    duration.value = wavesurfer.value.getDuration()
    wavesurfer.value.setVolume(volume.value)
  })

  wavesurfer.value.on('play', () => {
    isPlaying.value = true
  })

  wavesurfer.value.on('pause', () => {
    isPlaying.value = false
  })

  wavesurfer.value.on('finish', () => {
    isPlaying.value = false
  })

  wavesurfer.value.on('audioprocess', () => {
    currentTime.value = wavesurfer.value.getCurrentTime()
  })

  wavesurfer.value.on('seek', () => {
    currentTime.value = wavesurfer.value.getCurrentTime()
  })

  wavesurfer.value.on('error', (error) => {
    console.error('WaveSurfer error:', error)
    isLoading.value = false
  })

  // Load audio
  wavesurfer.value.load(props.audioUrl)
}

const togglePlayPause = () => {
  if (wavesurfer.value) {
    wavesurfer.value.playPause()
  }
}

const stop = () => {
  if (wavesurfer.value) {
    wavesurfer.value.stop()
    isPlaying.value = false
  }
}

const skipBackward = () => {
  if (wavesurfer.value) {
    wavesurfer.value.skip(-5)
  }
}

const skipForward = () => {
  if (wavesurfer.value) {
    wavesurfer.value.skip(5)
  }
}

const updateVolume = () => {
  if (wavesurfer.value) {
    wavesurfer.value.setVolume(volume.value)
    isMuted.value = volume.value === 0
  }
}

const toggleMute = () => {
  if (wavesurfer.value) {
    if (isMuted.value) {
      volume.value = 0.7
      wavesurfer.value.setVolume(0.7)
      isMuted.value = false
    } else {
      volume.value = 0
      wavesurfer.value.setVolume(0)
      isMuted.value = true
    }
  }
}

const setPlaybackSpeed = (speed) => {
  if (wavesurfer.value) {
    playbackSpeed.value = speed
    wavesurfer.value.setPlaybackRate(speed)
  }
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

watch(
  () => props.audioUrl,
  () => {
    if (wavesurfer.value && props.audioUrl) {
      isLoading.value = true
      isReady.value = false
      wavesurfer.value.load(props.audioUrl)
    }
  },
)

onMounted(() => {
  initWaveSurfer()
})

onBeforeUnmount(() => {
  if (wavesurfer.value) {
    wavesurfer.value.destroy()
  }
})
</script>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
}

input[type='range']::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #8b5cf6;
  cursor: pointer;
  border: none;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
