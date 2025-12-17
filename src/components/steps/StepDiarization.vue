<template>
  <div class="step-diarization">
    <h2 class="text-2xl font-bold mb-6">{{ $t('workflow.steps.diarization.title') }}</h2>
    <p class="mb-8" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
      {{ $t('workflow.steps.diarization.description') }}
    </p>

    <!-- Audio Files Selection -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.diarization.selectFiles') }}</h3>
      <div class="space-y-3">
        <label
          v-for="audio in audioFiles"
          :key="audio.id"
          class="flex items-center p-4 rounded-lg border cursor-pointer transition-all"
          :class="[
            selectedAudioIds.includes(audio.id)
              ? 'border-violet-600 bg-violet-600/10'
              : themeStore.isDark
                ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                : 'border-gray-200 bg-gray-50 hover:border-gray-300',
          ]"
        >
          <input
            type="checkbox"
            :value="audio.id"
            v-model="selectedAudioIds"
            class="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
          />
          <div class="ml-4 flex-1">
            <h4 class="font-medium">{{ audio.name }}</h4>
            <p class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
              {{ formatFileSize(audio.size) }}
            </p>
          </div>
          <span
            v-if="diarizationResults[audio.id]"
            class="text-sm px-3 py-1 rounded-full bg-green-600 text-white"
          >
            {{ $t('workflow.steps.diarization.completed') }}
          </span>
        </label>
      </div>
    </div>

    <!-- Run Diarization Button -->
    <button
      @click="runDiarization"
      :disabled="selectedAudioIds.length === 0 || processing"
      class="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
      :class="[
        selectedAudioIds.length > 0 && !processing
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

    <!-- Diarization Results -->
    <div v-if="Object.keys(diarizationResults).length > 0" class="mt-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.diarization.results') }}</h3>

      <div
        v-for="(result, audioId) in diarizationResults"
        :key="audioId"
        class="mb-6 p-6 rounded-lg border"
        :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
      >
        <h4 class="font-semibold mb-4">{{ getAudioName(audioId) }}</h4>

        <div class="space-y-2">
          <div
            v-for="segment in result"
            :key="segment.id"
            class="flex items-center justify-between p-3 rounded-lg"
            :class="[themeStore.isDark ? 'bg-gray-700' : 'bg-white']"
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
              @click="editSegment(segment)"
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
import { ref, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { diarizationApi } from '@/api/handlers'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const audioFiles = ref([])
const selectedAudioIds = ref([])
const processing = ref(false)
const diarizationResults = ref({})

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
  // Отримуємо аудіофайли з попереднього кроку
  const uploadData = workflowStore.getStepData('upload')
  if (uploadData?.audioFiles) {
    audioFiles.value = uploadData.audioFiles
  }

  // Завантажуємо існуючу діаризацію
  await loadExistingDiarization()
})

async function loadExistingDiarization() {
  try {
    const allDiarization = await diarizationApi.getAll()

    // Групуємо діаризацію по аудіофайлах
    audioFiles.value.forEach((audio) => {
      const segments = allDiarization.filter((d) => d.forAudio === audio.id)
      if (segments.length > 0) {
        diarizationResults.value[audio.id] = segments
      }
    })

    // Якщо є результати, позначити крок як завершений
    if (Object.keys(diarizationResults.value).length > 0) {
      workflowStore.completeStep('diarization', { results: diarizationResults.value })
    }
  } catch (error) {
    console.error('Error loading diarization:', error)
  }
}

async function runDiarization() {
  if (selectedAudioIds.value.length === 0) return

  processing.value = true
  try {
    // Викликаємо API для діаризації
    await diarizationApi.apply({ forAudio: selectedAudioIds.value })

    // Перезавантажуємо результати
    await loadExistingDiarization()
  } catch (error) {
    console.error('Error running diarization:', error)
  } finally {
    processing.value = false
  }
}

function completeStep() {
  workflowStore.completeStep('diarization', { results: diarizationResults.value })
}

function getAudioName(audioId) {
  const audio = audioFiles.value.find((a) => a.id === parseInt(audioId))
  return audio?.name || 'Unknown'
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
