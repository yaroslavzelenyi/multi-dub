<template>
  <div class="step-diarization">
    <h2 class="text-2xl font-bold mb-6">{{ $t('workflow.steps.diarization.title') }}</h2>
    <p class="mb-8" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
      {{ $t('workflow.steps.diarization.description') }}
    </p>

    <!-- Current Audio File Info -->
    <div v-if="currentAudio" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Аудіофайл</h3>
      <div
        class="flex items-center p-4 rounded-lg border"
        :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
      >
        <div class="flex-1">
          <h4 class="font-medium">{{ currentAudio.name }}</h4>
          <p class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
            {{ formatFileSize(currentAudio.size) }}
          </p>
        </div>
        <span
          v-if="diarizationSegments.length > 0"
          class="text-sm px-3 py-1 rounded-full bg-green-600 text-white"
        >
          {{ $t('workflow.steps.diarization.completed') }}
        </span>
      </div>
    </div>

    <!-- Run Diarization Button -->
    <button
      @click="runDiarization"
      :disabled="!currentAudio || processing"
      class="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 mb-4"
      :class="[
        currentAudio && !processing
          ? 'bg-violet-600 hover:bg-violet-700 text-white'
          : 'bg-gray-700 text-gray-500 cursor-not-allowed',
      ]"
    >
      <svg v-if="processing" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
      <span v-if="processing">{{ $t('workflow.steps.diarization.processing') }}...</span>
      <span v-else>{{ $t('workflow.steps.diarization.run') }}</span>
    </button>

    <!-- Processing Spinner -->
    <div
      v-if="processing"
      class="p-4 rounded-lg border flex items-center gap-3"
      :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
    >
      <svg class="animate-spin h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24">
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
      <span :class="[themeStore.isDark ? 'text-gray-300' : 'text-gray-700']">
        Обробка діаризації...
      </span>
    </div>

    <!-- Diarization Results -->
    <div v-if="diarizationSegments.length > 0" class="mt-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.diarization.results') }}</h3>

      <div
        class="mb-6 p-6 rounded-lg border"
        :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
      >
        <h4 class="font-semibold mb-4">{{ currentAudio?.name }}</h4>

        <!-- Audio Player with Regions -->
        <div v-if="audioUrl" class="mb-6">
          <AudioPlayerWithRegions
            ref="audioPlayerRef"
            :audio-url="audioUrl"
            :file-name="currentAudio?.name"
            :regions="prepareRegions()"
            :active-region-id="activeSegmentId"
            @region-click="handleRegionClick"
          />
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="segment in diarizationSegments"
            :key="segment.id"
            @click="setActiveSegment(segment.id)"
            class="flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all"
            :class="[
              activeSegmentId === segment.id
                ? 'bg-violet-600/30 border-2 border-violet-500 shadow-lg shadow-violet-500/50'
                : themeStore.isDark
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-white hover:bg-gray-50',
            ]"
          >
            <div class="flex items-center gap-4 flex-1">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                :style="{
                  backgroundColor: getSpeakerColor(segment.speaker),
                }"
              ></div>
              <div>
                <span class="text-sm font-medium"
                  >{{ $t('workflow.steps.diarization.speaker') }} {{ segment.speaker }}</span
                >
                <p class="text-xs" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                  {{ formatTime(segment.startTime) }} - {{ formatTime(segment.endTime) }}
                </p>
              </div>
            </div>
            <button
              @click.stop="editSegment(segment)"
              class="p-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Complete Step Button -->
      <button
        @click="completeStep"
        class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        {{ $t('workflow.steps.diarization.complete') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { diarizationApi, audioApi } from '@/api/handlers'
import AudioPlayerWithRegions from '@/components/AudioPlayerWithRegions.vue'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const currentAudio = ref(null)
const processing = ref(false)
const diarizationSegments = ref([])
const audioUrl = ref('')
const activeSegmentId = ref(null)
const pollingInterval = ref(null)
const audioPlayerRef = ref(null)

const speakerColors = [
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#10B981', // green
  '#F59E0B', // amber
  '#3B82F6', // blue
  '#EF4444', // red
  '#14B8A6', // teal
  '#F97316', // orange
]

onMounted(async () => {
  // Отримуємо перший аудіофайл з попереднього кроку
  const uploadData = workflowStore.getStepData('upload')
  if (uploadData?.audioFiles && uploadData.audioFiles.length > 0) {
    currentAudio.value = uploadData.audioFiles[0]
  }

  // Завантажуємо існуючу діаризацію
  await loadExistingDiarization()

  // Завантажуємо аудіофайл для плеєра
  await loadAudioFile()
})

onBeforeUnmount(() => {
  // Очищаємо інтервал при знищенні компонента
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }

  // Очищаємо URL
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
})

async function loadExistingDiarization() {
  try {
    if (!currentAudio.value) return

    const allDiarization = await diarizationApi.getAll()

    // Фільтруємо діаризацію для поточного аудіофайлу
    const segments = allDiarization.filter((d) => d.forAudio === currentAudio.value.id)
    diarizationSegments.value = segments

    // Якщо є результати, позначити крок як завершений
    if (segments.length > 0) {
      workflowStore.completeStep('diarization', { segments: segments })
    }
  } catch (error) {
    console.error('Error loading diarization:', error)
  }
}

async function pollDiarization() {
  try {
    // Перевіряємо чи з'явились результати діаризації
    const allDiarization = await diarizationApi.getAll()
    const segments = allDiarization.filter((d) => d.forAudio === currentAudio.value.id)

    if (segments.length > diarizationSegments.value.length) {
      // Знайдено нові сегменти, оновлюємо і зупиняємо поллінг
      diarizationSegments.value = segments
      stopPolling()
      processing.value = false

      // Завантажуємо аудіофайл якщо потрібно
      if (!audioUrl.value) {
        await loadAudioFile()
      }
    }
  } catch (error) {
    console.error('Error polling diarization:', error)
  }
}

function startPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
  pollingInterval.value = setInterval(pollDiarization, 10000) // Кожні 10 секунд
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

async function runDiarization() {
  if (!currentAudio.value) return

  processing.value = true
  try {
    // Викликаємо API для діаризації
    await diarizationApi.apply({ forAudio: [currentAudio.value.id] })

    // Запускаємо поллінг для перевірки появи результатів
    startPolling()

    // Також одразу перевіряємо
    await pollDiarization()
  } catch (error) {
    console.error('Error running diarization:', error)
    processing.value = false
    stopPolling()
  }
}

function completeStep() {
  workflowStore.completeStep('diarization', { segments: diarizationSegments.value })
}

async function loadAudioFile() {
  try {
    if (!currentAudio.value) return

    let fileName = currentAudio.value.fileName

    if (!fileName) {
      const audioInfo = await audioApi.getInfo(currentAudio.value.id)
      fileName = audioInfo.fileName
    }

    if (!fileName) {
      console.error('Could not determine file name for audio')
      return
    }

    const blob = await audioApi.getFile(fileName)
    audioUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error loading audio file:', error)
  }
}

function prepareRegions() {
  return diarizationSegments.value.map((segment, index) => {
    const speakerColor = getSpeakerColor(segment.speaker)
    // Конвертуємо hex в rgba з більшою непрозорістю
    const hex = speakerColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    return {
      id: segment.id,
      startTime: segment.startTime,
      endTime: segment.endTime,
      label: `Speaker ${segment.speaker}`,
      speaker: segment.speaker,
      color: `rgba(${r}, ${g}, ${b}, 0.5)`,
    }
  })
}

function setActiveSegment(segmentId) {
  activeSegmentId.value = activeSegmentId.value === segmentId ? null : segmentId

  // Знаходимо сегмент і переходимо до його часу
  if (segmentId) {
    const segment = diarizationSegments.value.find((s) => s.id === segmentId)
    if (segment && audioPlayerRef.value && audioPlayerRef.value.seekTo) {
      audioPlayerRef.value.seekTo(segment.startTime)
    }
  }
}

function handleRegionClick(region) {
  setActiveSegment(region.id)
}

function getSpeakerColor(speaker) {
  // Перетворюємо speaker на індекс для кольору
  const speakerNum = parseInt(speaker.replace(/\D/g, '')) || 0
  return speakerColors[speakerNum % speakerColors.length]
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

function editSegment(segment) {
  // TODO: Відкрити модальне вікно для редагування
  console.log('Edit segment:', segment)
}
</script>
