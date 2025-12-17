<template>
  <div class="step-subtitles">
    <h2 class="text-2xl font-bold mb-6">{{ $t('workflow.steps.subtitles.title') }}</h2>
    <p class="mb-8" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
      {{ $t('workflow.steps.subtitles.description') }}
    </p>

    <!-- Audio Files Selection -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.subtitles.selectFiles') }}</h3>
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
              {{ subtitleCounts[audio.id] || 0 }} {{ $t('workflow.steps.subtitles.subtitlesCount') }}
            </p>
          </div>
          <span
            v-if="subtitleCounts[audio.id] > 0"
            class="text-sm px-3 py-1 rounded-full bg-green-600 text-white"
          >
            {{ $t('workflow.steps.subtitles.generated') }}
          </span>
        </label>
      </div>
    </div>

    <!-- Generate Button -->
    <button
      @click="generateSubtitles"
      :disabled="selectedAudioIds.length === 0 || processing"
      class="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
      :class="[
        selectedAudioIds.length > 0 && !processing
          ? 'bg-violet-600 hover:bg-violet-700 text-white'
          : 'bg-gray-700 text-gray-500 cursor-not-allowed',
      ]"
    >
      <svg
        v-if="processing"
        class="animate-spin h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span v-if="processing">{{ $t('workflow.steps.subtitles.processing') }}...</span>
      <span v-else>{{ $t('workflow.steps.subtitles.generate') }}</span>
    </button>

    <!-- Subtitles List -->
    <div v-if="Object.keys(subtitlesByAudio).length > 0" class="mt-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.subtitles.results') }}</h3>

      <div
        v-for="(subs, audioId) in subtitlesByAudio"
        :key="audioId"
        class="mb-6 p-6 rounded-lg border"
        :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
      >
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-semibold">{{ getAudioName(audioId) }}</h4>
          <span class="text-sm px-3 py-1 rounded-full bg-violet-600 text-white">
            {{ subs.length }} {{ $t('workflow.steps.subtitles.subtitlesCount') }}
          </span>
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="subtitle in subs"
            :key="subtitle.id"
            class="p-3 rounded-lg"
            :class="[themeStore.isDark ? 'bg-gray-700' : 'bg-white']"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xs px-2 py-1 rounded bg-violet-600 text-white">
                  {{ subtitle.language.toUpperCase() }}
                </span>
                <span class="text-xs" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                  {{ formatTime(subtitle.startTime) }} - {{ formatTime(subtitle.endTime) }}
                </span>
              </div>
              <button
                @click="editSubtitle(subtitle)"
                class="p-1 rounded hover:bg-gray-600 transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            </div>
            <p class="text-sm">{{ subtitle.text }}</p>
          </div>
        </div>
      </div>

      <!-- Complete Step Button -->
      <button
        @click="completeStep"
        class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        {{ $t('workflow.steps.subtitles.complete') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { subtitlesApi } from '@/api/handlers'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const audioFiles = ref([])
const selectedAudioIds = ref([])
const processing = ref(false)
const allSubtitles = ref([])

const subtitlesByAudio = computed(() => {
  const grouped = {}
  allSubtitles.value.forEach((sub) => {
    if (!grouped[sub.forAudio]) {
      grouped[sub.forAudio] = []
    }
    grouped[sub.forAudio].push(sub)
  })
  return grouped
})

const subtitleCounts = computed(() => {
  const counts = {}
  Object.keys(subtitlesByAudio.value).forEach((audioId) => {
    counts[audioId] = subtitlesByAudio.value[audioId].length
  })
  return counts
})

onMounted(async () => {
  // Отримуємо аудіофайли з попереднього кроку
  const uploadData = workflowStore.getStepData('upload')
  if (uploadData?.audioFiles) {
    audioFiles.value = uploadData.audioFiles
  }

  // Завантажуємо існуючі субтитри
  await loadExistingSubtitles()
})

async function loadExistingSubtitles() {
  try {
    allSubtitles.value = await subtitlesApi.getAll()

    // Якщо є субтитри, позначити крок як завершений
    if (allSubtitles.value.length > 0) {
      workflowStore.completeStep('subtitles', { subtitles: allSubtitles.value })
    }
  } catch (error) {
    console.error('Error loading subtitles:', error)
  }
}

async function generateSubtitles() {
  if (selectedAudioIds.value.length === 0) return

  processing.value = true
  try {
    // Генеруємо субтитри для вибраних файлів
    await subtitlesApi.generate(selectedAudioIds.value)

    // Перезавантажуємо субтитри
    await loadExistingSubtitles()
  } catch (error) {
    console.error('Error generating subtitles:', error)
  } finally {
    processing.value = false
  }
}

function completeStep() {
  workflowStore.completeStep('subtitles', { subtitles: allSubtitles.value })
}

function getAudioName(audioId) {
  const audio = audioFiles.value.find((a) => a.id === parseInt(audioId))
  return audio?.name || 'Unknown'
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

function editSubtitle(subtitle) {
  // TODO: Відкрити модальне вікно для редагування
  console.log('Edit subtitle:', subtitle)
}
</script>
