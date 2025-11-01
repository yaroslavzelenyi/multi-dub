<template>
  <div
    :class="[
      'rounded-lg overflow-hidden transition-colors duration-200 relative',
      themeStore.isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200',
    ]"
  >
    <div
      :class="[
        'border-b px-4 py-3 flex items-center justify-between transition-colors',
        themeStore.isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200',
      ]"
    >
      <div class="flex items-center space-x-2">
        <button
          @click="handleUndo"
          :disabled="!editorStore.canUndo"
          :class="buttonClass"
          :title="t('editor.undo')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
            />
          </svg>
        </button>

        <button
          @click="handleRedo"
          :disabled="!editorStore.canRedo"
          :class="buttonClass"
          :title="t('editor.redo')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
            />
          </svg>
        </button>

        <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

        <button
          @click="handleTrim"
          :disabled="!editorStore.hasSelection"
          :class="buttonClass"
          :title="t('editor.trimTooltip')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
            />
          </svg>
          <span class="ml-1 text-sm">{{ t('editor.trim') }}</span>
        </button>

        <button
          @click="handleCut"
          :disabled="!editorStore.hasSelection"
          :class="buttonClass"
          :title="t('editor.cutTooltip')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          <span class="ml-1 text-sm">{{ t('editor.cut') }}</span>
        </button>

        <button @click="handleNormalize" :class="buttonClass" :title="t('editor.normalize')">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
          <span class="ml-1 text-sm">{{ t('editor.normalize') }}</span>
        </button>

        <button
          @click="showFadeDialog = true"
          :disabled="!editorStore.hasSelection"
          :class="buttonClass"
          :title="t('editor.fade')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <span class="ml-1 text-sm">{{ t('editor.fade') }}</span>
        </button>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="handleZoomOut"
          :disabled="zoomLevel <= 1"
          :class="buttonClass"
          :title="t('editor.zoomOut')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
            />
          </svg>
        </button>

        <span
          :class="[
            'text-sm px-2 min-w-[60px] text-center',
            themeStore.isDark ? 'text-gray-400' : 'text-gray-600',
          ]"
        >
          {{ Math.round(zoomLevel * 100) }}%
        </span>

        <button
          @click="handleZoomIn"
          :disabled="zoomLevel >= 10"
          :class="buttonClass"
          :title="t('editor.zoomIn')"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
        </button>

        <div class="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-2"></div>

        <button
          @click="handleExport"
          :class="buttonClass + ' !text-violet-600 hover:!text-violet-700'"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          <span class="ml-2">{{ t('editor.export') }}</span>
        </button>
      </div>
    </div>

    <div class="p-6">
      <div
        ref="waveformContainer"
        class="relative rounded-lg overflow-hidden"
        :class="[themeStore.isDark ? 'bg-gray-950' : 'bg-gray-900']"
        style="height: 200px"
      >
        <div ref="waveformRef" class="w-full h-full"></div>
      </div>

      <div
        :class="[
          'flex justify-between text-sm mt-2',
          themeStore.isDark ? 'text-gray-400' : 'text-gray-600',
        ]"
      >
        <span>{{ formatTime(currentTime) }}</span>
        <span v-if="editorStore.hasSelection" class="text-violet-400 font-medium">
          {{ t('editor.selection') }}: {{ formatTime(editorStore.selectionStart) }} -
          {{ formatTime(editorStore.selectionEnd) }}
        </span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>

    <div
      :class="[
        'border-t px-6 py-4 transition-colors duration-200',
        themeStore.isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200',
      ]"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <button
            @click="togglePlayPause"
            :disabled="!isReady"
            class="w-12 h-12 flex items-center justify-center bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-full transition-colors"
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

          <button
            @click="stop"
            :disabled="!isReady"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed',
              themeStore.isDark
                ? 'bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800'
                : 'bg-white hover:bg-gray-100 disabled:bg-gray-100 border border-gray-300',
            ]"
          >
            <svg
              :class="[
                'w-4 h-4 transition-colors',
                themeStore.isDark ? 'text-gray-300' : 'text-gray-600',
              ]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 6h12v12H6z" />
            </svg>
          </button>

          <button
            @click="skipBackward"
            :disabled="!isReady"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed',
              themeStore.isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200',
            ]"
          >
            <svg
              :class="[
                'w-5 h-5 transition-colors',
                themeStore.isDark ? 'text-gray-300' : 'text-gray-600',
              ]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z" />
            </svg>
          </button>

          <button
            @click="skipForward"
            :disabled="!isReady"
            :class="[
              'w-10 h-10 flex items-center justify-center rounded-lg transition-colors disabled:cursor-not-allowed',
              themeStore.isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200',
            ]"
          >
            <svg
              :class="[
                'w-5 h-5 transition-colors',
                themeStore.isDark ? 'text-gray-300' : 'text-gray-600',
              ]"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z" />
            </svg>
          </button>
        </div>

        <div class="flex items-center space-x-2">
          <button
            v-for="speed in playbackSpeeds"
            :key="speed"
            @click="setPlaybackSpeed(speed)"
            :class="[
              'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
              playbackSpeed === speed
                ? 'bg-violet-600 text-white'
                : themeStore.isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-300',
            ]"
          >
            {{ speed }}x
          </button>
        </div>

        <div class="flex items-center space-x-3">
          <div class="flex items-center space-x-2">
            <button
              @click="toggleMute"
              :class="[
                'w-10 h-10 flex items-center justify-center rounded-lg transition-colors',
                themeStore.isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-200',
              ]"
            >
              <svg
                v-if="!isMuted && volume > 0.5"
                :class="[
                  'w-5 h-5 transition-colors',
                  themeStore.isDark ? 'text-gray-300' : 'text-gray-600',
                ]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                />
              </svg>
              <svg
                v-else-if="!isMuted && volume > 0"
                :class="[
                  'w-5 h-5 transition-colors',
                  themeStore.isDark ? 'text-gray-300' : 'text-gray-600',
                ]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M7 9v6h4l5 5V4l-5 5H7z" />
              </svg>
              <svg
                v-else
                :class="[
                  'w-5 h-5 transition-colors',
                  themeStore.isDark ? 'text-gray-300' : 'text-gray-600',
                ]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
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
              :class="[
                'w-24 h-1 rounded-lg appearance-none cursor-pointer accent-violet-600 transition-colors',
                themeStore.isDark ? 'bg-gray-700' : 'bg-gray-300',
              ]"
            />
          </div>
        </div>
      </div>

      <div
        v-if="isLoading"
        :class="[
          'mt-4 flex items-center justify-center space-x-2 text-sm transition-colors',
          themeStore.isDark ? 'text-gray-400' : 'text-gray-600',
        ]"
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

    <div
      v-if="showFadeDialog"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click.self="showFadeDialog = false"
    >
      <div
        :class="[
          'rounded-lg p-6 max-w-md w-full mx-4',
          themeStore.isDark ? 'bg-gray-800' : 'bg-white',
        ]"
      >
        <h3
          :class="[
            'text-lg font-semibold mb-4',
            themeStore.isDark ? 'text-gray-100' : 'text-gray-900',
          ]"
        >
          {{ t('editor.applyFade') }}
        </h3>

        <div class="space-y-4">
          <div>
            <label
              :class="[
                'block text-sm font-medium mb-2',
                themeStore.isDark ? 'text-gray-300' : 'text-gray-700',
              ]"
            >
              {{ t('editor.fadeIn') }} ({{ t('editor.seconds') }})
            </label>
            <input
              v-model.number="fadeInDuration"
              type="number"
              min="0"
              max="10"
              step="0.1"
              :class="[
                'w-full px-3 py-2 rounded border',
                themeStore.isDark
                  ? 'bg-gray-900 border-gray-700 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900',
              ]"
            />
          </div>

          <div>
            <label
              :class="[
                'block text-sm font-medium mb-2',
                themeStore.isDark ? 'text-gray-300' : 'text-gray-700',
              ]"
            >
              {{ t('editor.fadeOut') }} ({{ t('editor.seconds') }})
            </label>
            <input
              v-model.number="fadeOutDuration"
              type="number"
              min="0"
              max="10"
              step="0.1"
              :class="[
                'w-full px-3 py-2 rounded border',
                themeStore.isDark
                  ? 'bg-gray-900 border-gray-700 text-gray-100'
                  : 'bg-white border-gray-300 text-gray-900',
              ]"
            />
          </div>

          <div class="flex space-x-3">
            <button
              @click="applyFade"
              class="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg"
            >
              {{ t('editor.apply') }}
            </button>
            <button
              @click="showFadeDialog = false"
              :class="[
                'flex-1 px-4 py-2 rounded-lg',
                themeStore.isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-100'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
              ]"
            >
              {{ t('editor.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="isProcessing"
      class="absolute inset-0 bg-black/50 flex items-center justify-center z-40 rounded-lg"
    >
      <div class="bg-gray-900 rounded-lg p-6 flex flex-col items-center space-y-3">
        <svg class="animate-spin h-8 w-8 text-violet-500" fill="none" viewBox="0 0 24 24">
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
        <span class="text-gray-100">{{ t('editor.processing') }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useAudioEditorStore } from '@/stores/audioEditor'
import { useAudioEditor } from '@/composables/useAudioEditor'
import WaveSurfer from 'wavesurfer.js'
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.js'

const { t } = useI18n()
const themeStore = useThemeStore()
const editorStore = useAudioEditorStore()
const audioEditor = useAudioEditor()

const props = defineProps({
  audioUrl: String,
  audioFile: Object,
})

const emit = defineEmits(['audio-updated'])

const waveformRef = ref(null)
const waveformContainer = ref(null)
const wavesurfer = ref(null)
const regionsPlugin = ref(null)
const currentRegion = ref(null)
const lastLoadedUrl = ref('')

const isPlaying = ref(false)
const isReady = ref(false)
const isLoading = ref(true)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(0.7)
const isMuted = ref(false)
const playbackSpeed = ref(1)
const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

const zoomLevel = ref(1)
const isProcessing = ref(false)
const showFadeDialog = ref(false)
const fadeInDuration = ref(1)
const fadeOutDuration = ref(1)

const buttonClass = computed(() => [
  'p-2 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center',
  themeStore.isDark
    ? 'hover:bg-gray-700 text-gray-300 disabled:text-gray-600'
    : 'hover:bg-gray-200 text-gray-700 disabled:text-gray-400',
])

const getWaveformColors = () => {
  if (themeStore.isDark) {
    return {
      waveColor: '#4b5563',
      progressColor: '#8b5cf6',
      cursorColor: '#3b82f6',
    }
  } else {
    return {
      waveColor: '#6b7280',
      progressColor: '#8b5cf6',
      cursorColor: '#3b82f6',
    }
  }
}

const initWaveSurfer = async () => {
  if (!waveformRef.value) return

  const colors = getWaveformColors()

  regionsPlugin.value = RegionsPlugin.create()

  wavesurfer.value = WaveSurfer.create({
    container: waveformRef.value,
    waveColor: colors.waveColor,
    progressColor: colors.progressColor,
    cursorColor: colors.cursorColor,
    barWidth: 2,
    barRadius: 3,
    height: 200,
    normalize: true,
    plugins: [regionsPlugin.value],
    backend: 'WebAudio',
  })

  wavesurfer.value.on('ready', async () => {
    isLoading.value = false
    isReady.value = true
    duration.value = wavesurfer.value.getDuration()
    wavesurfer.value.setVolume(volume.value)

    if (props.audioFile && editorStore.history.length === 0) {
      const blob = props.audioFile
      editorStore.saveToHistory(blob)
    }
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

  regionsPlugin.value.on('region-created', (region) => {
    if (currentRegion.value && currentRegion.value !== region) {
      currentRegion.value.remove()
    }
    currentRegion.value = region
    editorStore.setSelection(region.start, region.end)
  })

  regionsPlugin.value.on('region-updated', (region) => {
    editorStore.setSelection(region.start, region.end)
  })

  regionsPlugin.value.on('region-removed', () => {
    currentRegion.value = null
    editorStore.clearSelection()
  })

  regionsPlugin.value.enableDragSelection({
    color: 'rgba(139, 92, 246, 0.2)',
  })

  if (props.audioUrl) {
    await wavesurfer.value.load(props.audioUrl)

    if (props.audioFile) {
      await audioEditor.loadAudioFile(props.audioFile)
    }
  }
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

const handleUndo = async () => {
  const prevState = editorStore.undo()
  if (prevState) {
    isProcessing.value = true
    try {
      if (currentRegion.value) {
        currentRegion.value.remove()
        currentRegion.value = null
      }
      regionsPlugin.value.clearRegions()

      const url = URL.createObjectURL(prevState.blob)

      isLoading.value = true
      isReady.value = false

      await wavesurfer.value.load(url)

      const file = new File([prevState.blob], 'audio.wav', { type: 'audio/wav' })
      await audioEditor.loadAudioFile(file)

      if (prevState.selectionStart !== prevState.selectionEnd) {
        editorStore.setSelection(prevState.selectionStart, prevState.selectionEnd)
      }

      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      console.error('Undo error:', error)
    } finally {
      isProcessing.value = false
    }
  }
}

const handleRedo = async () => {
  const nextState = editorStore.redo()
  if (nextState) {
    isProcessing.value = true
    try {
      if (currentRegion.value) {
        currentRegion.value.remove()
        currentRegion.value = null
      }
      regionsPlugin.value.clearRegions()

      const url = URL.createObjectURL(nextState.blob)

      isLoading.value = true
      isReady.value = false

      await wavesurfer.value.load(url)

      const file = new File([nextState.blob], 'audio.wav', { type: 'audio/wav' })
      await audioEditor.loadAudioFile(file)

      if (nextState.selectionStart !== nextState.selectionEnd) {
        editorStore.setSelection(nextState.selectionStart, nextState.selectionEnd)
      }

      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)
    } catch (error) {
      console.error('Redo error:', error)
    } finally {
      isProcessing.value = false
    }
  }
}

const handleTrim = async () => {
  if (!editorStore.hasSelection || !audioEditor.audioBuffer.value) {
    return
  }

  isProcessing.value = true

  try {
    const trimmedBuffer = await audioEditor.trimAudio(
      editorStore.selectionStart,
      editorStore.selectionEnd,
    )

    const blob = audioEditor.exportToWav(trimmedBuffer)
    const url = URL.createObjectURL(blob)

    editorStore.saveToHistory(blob)

    if (currentRegion.value) {
      currentRegion.value.remove()
      currentRegion.value = null
    }
    regionsPlugin.value.clearRegions()

    isLoading.value = true
    isReady.value = false

    await wavesurfer.value.load(url)

    const file = new File([blob], 'trimmed.wav', { type: 'audio/wav' })
    await audioEditor.loadAudioFile(file)

    editorStore.clearSelection()
    emit('audio-updated', blob)
  } catch (error) {
    console.error('Trim error:', error)
    alert(t('editor.trimError') || 'Помилка при обрізанні аудіо: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

const handleCut = async () => {
  if (!editorStore.hasSelection || !audioEditor.audioBuffer.value) {
    return
  }

  const audioDuration = audioEditor.audioBuffer.value.duration
  if (editorStore.selectionStart === 0 && editorStore.selectionEnd >= audioDuration) {
    alert(t('editor.cannotCutEntireFile') || 'Неможливо вирізати весь аудіофайл')
    return
  }

  isProcessing.value = true

  try {
    const cutBuffer = await audioEditor.cutAudio(
      editorStore.selectionStart,
      editorStore.selectionEnd,
    )

    const blob = audioEditor.exportToWav(cutBuffer)
    const url = URL.createObjectURL(blob)

    editorStore.saveToHistory(blob)

    if (currentRegion.value) {
      currentRegion.value.remove()
      currentRegion.value = null
    }
    regionsPlugin.value.clearRegions()

    isLoading.value = true
    isReady.value = false

    await wavesurfer.value.load(url)

    const file = new File([blob], 'cut.wav', { type: 'audio/wav' })
    await audioEditor.loadAudioFile(file)

    editorStore.clearSelection()
    emit('audio-updated', blob)
  } catch (error) {
    console.error('Cut error:', error)
    alert(t('editor.cutError') || 'Помилка при вирізанні аудіо: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

const handleNormalize = async () => {
  if (!audioEditor.audioBuffer.value) return

  isProcessing.value = true
  try {
    const normalizedBuffer = audioEditor.normalizeAudio(audioEditor.audioBuffer.value)
    const blob = audioEditor.exportToWav(normalizedBuffer)
    const url = URL.createObjectURL(blob)

    editorStore.saveToHistory(blob)

    isLoading.value = true
    await wavesurfer.value.load(url)

    const file = new File([blob], 'normalized.wav', { type: 'audio/wav' })
    await audioEditor.loadAudioFile(file)

    emit('audio-updated', blob)
  } catch (error) {
    console.error('Normalize error:', error)
    alert(t('editor.normalizeError') || 'Помилка при нормалізації аудіо: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

// Виправлена функція applyFade для AudioEditor.vue
// Замініть існуючу функцію applyFade на цю:

const applyFade = async () => {
  if (!audioEditor.audioBuffer.value) return

  isProcessing.value = true
  showFadeDialog.value = false

  try {
    let buffer = audioEditor.audioBuffer.value

    if (editorStore.hasSelection) {
      if (fadeInDuration.value > 0) {
        buffer = audioEditor.applyFadeIn(
          buffer,
          fadeInDuration.value,
          editorStore.selectionStart,
          editorStore.selectionEnd,
        )
      }

      if (fadeOutDuration.value > 0) {
        buffer = audioEditor.applyFadeOut(
          buffer,
          fadeOutDuration.value,
          editorStore.selectionStart,
          editorStore.selectionEnd,
        )
      }
    } else {
      if (fadeInDuration.value > 0) {
        buffer = audioEditor.applyFadeIn(buffer, fadeInDuration.value)
      }

      if (fadeOutDuration.value > 0) {
        buffer = audioEditor.applyFadeOut(buffer, fadeOutDuration.value)
      }
    }

    const blob = audioEditor.exportToWav(buffer)
    const url = URL.createObjectURL(blob)

    editorStore.saveToHistory(blob)

    if (currentRegion.value) {
      currentRegion.value.remove()
      currentRegion.value = null
    }
    regionsPlugin.value.clearRegions()

    isLoading.value = true
    isReady.value = false

    await wavesurfer.value.load(url)

    const file = new File([blob], 'faded.wav', { type: 'audio/wav' })
    await audioEditor.loadAudioFile(file)

    editorStore.clearSelection()
    emit('audio-updated', blob)
  } catch (error) {
    console.error('Fade error:', error)
    alert(t('editor.fadeError') || 'Помилка при застосуванні згасання: ' + error.message)
  } finally {
    isProcessing.value = false
  }
}

const handleZoomIn = () => {
  const newZoom = Math.min(10, zoomLevel.value * 1.2)
  zoomLevel.value = newZoom
  editorStore.setZoom(newZoom)

  if (wavesurfer.value) {
    const minPxPerSec = Math.round(newZoom * 100)
    wavesurfer.value.zoom(minPxPerSec)
  }
}

const handleZoomOut = () => {
  const newZoom = Math.max(1, zoomLevel.value / 1.2)
  zoomLevel.value = newZoom
  editorStore.setZoom(newZoom)

  if (wavesurfer.value) {
    const minPxPerSec = Math.round(newZoom * 100)
    wavesurfer.value.zoom(minPxPerSec)
  }
}

const handleExport = async () => {
  if (!audioEditor.audioBuffer.value) return

  try {
    const blob = audioEditor.exportToWav(audioEditor.audioBuffer.value)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `edited-audio-${Date.now()}.wav`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  } catch (error) {
    console.error('Export error:', error)
    alert(t('editor.exportError') || 'Помилка при експорті аудіо: ' + error.message)
  }
}

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 100)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`
}

const updateWaveformColors = () => {
  if (wavesurfer.value) {
    const colors = getWaveformColors()
    wavesurfer.value.setOptions({
      waveColor: colors.waveColor,
      progressColor: colors.progressColor,
      cursorColor: colors.cursorColor,
    })
  }
}

watch(
  () => themeStore.isDark,
  () => {
    updateWaveformColors()
  },
)

watch(
  () => props.audioUrl,
  (newUrl, oldUrl) => {
    if (newUrl && newUrl !== lastLoadedUrl.value) {
      lastLoadedUrl.value = newUrl

      if (wavesurfer.value) {
        isLoading.value = true
        isReady.value = false
        wavesurfer.value.load(newUrl).then(() => {
          if (props.audioFile) {
            audioEditor.loadAudioFile(props.audioFile)
          }
        })
      } else {
        initWaveSurfer()
      }
    }
  },
)

onMounted(() => {
  if (props.audioUrl) {
    lastLoadedUrl.value = props.audioUrl
    initWaveSurfer()
  }
})

onBeforeUnmount(() => {
  if (wavesurfer.value) {
    wavesurfer.value.destroy()
  }
  audioEditor.cleanup()
  editorStore.reset()
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
</style>
