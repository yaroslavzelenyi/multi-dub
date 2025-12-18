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
              {{ subtitleCounts[audio.id] || 0 }}
              {{ $t('workflow.steps.subtitles.subtitlesCount') }}
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
      <span v-if="processing">{{ $t('workflow.steps.subtitles.processing') }}...</span>
      <span v-else>{{ $t('workflow.steps.subtitles.generate') }}</span>
    </button>

    <!-- Processing Spinner -->
    <div
      v-if="processing"
      class="mt-4 p-4 rounded-lg border flex items-center gap-3"
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
        Генерація субтитрів...
      </span>
    </div>

    <!-- Subtitles List -->
    <div v-if="Object.keys(subtitlesByAudio).length > 0" class="mt-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">{{ $t('workflow.steps.subtitles.results') }}</h3>

        <!-- Language Filter -->
        <div class="flex items-center gap-2">
          <label
            class="text-sm font-medium"
            :class="[themeStore.isDark ? 'text-gray-300' : 'text-gray-700']"
          >
            Фільтр по мові:
          </label>
          <select
            v-model="selectedLanguage"
            class="px-3 py-2 rounded-lg border text-sm transition-colors"
            :class="[
              themeStore.isDark
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-gray-900',
            ]"
          >
            <option value="">Всі мови</option>
            <option v-for="lang in availableLanguages" :key="lang" :value="lang">
              {{ lang.toUpperCase() }}
            </option>
          </select>
        </div>
      </div>

      <div
        v-for="(subs, audioId) in filteredSubtitlesByAudio"
        :key="audioId"
        class="mb-6 p-6 rounded-lg border"
        :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
      >
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-semibold">{{ getAudioName(audioId) }}</h4>
          <span class="text-sm px-3 py-1 rounded-full bg-violet-600 text-white">
            {{ subs.length }} субтитрів
          </span>
        </div>

        <!-- Audio Player with Regions -->
        <div v-if="audioUrls[audioId]" class="mb-6">
          <AudioPlayerWithRegions
            :ref="
              (el) => {
                if (el) audioPlayerRefs[audioId] = el
              }
            "
            :audio-url="audioUrls[audioId]"
            :file-name="getAudioName(audioId)"
            :regions="prepareRegions(subs)"
            :active-region-id="activeSubtitleId"
            @region-click="handleRegionClick"
          />
        </div>

        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="subtitle in subs"
            :key="subtitle.id"
            @click="setActiveSubtitle(subtitle.id)"
            class="p-3 rounded-lg cursor-pointer transition-all"
            :class="[
              activeSubtitleId === subtitle.id
                ? 'bg-violet-600/30 border-2 border-violet-500 shadow-lg shadow-violet-500/50'
                : themeStore.isDark
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-white hover:bg-gray-50',
            ]"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <span class="text-xs px-2 py-1 rounded bg-violet-600 text-white">
                  {{ subtitle.language.toUpperCase() }}
                </span>
                <span
                  class="text-xs"
                  :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
                >
                  {{ formatTime(subtitle.startTime) }} - {{ formatTime(subtitle.endTime) }}
                </span>
              </div>
              <div v-if="editingSubtitleId === subtitle.id" class="flex gap-2">
                <button
                  @click="saveSubtitle(subtitle.id)"
                  :disabled="savingSubtitle"
                  class="p-1 rounded bg-green-600 hover:bg-green-700 disabled:bg-gray-500 transition-colors"
                  title="Зберегти"
                >
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </button>
                <button
                  @click="cancelEdit"
                  :disabled="savingSubtitle"
                  class="p-1 rounded bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 transition-colors"
                  title="Скасувати"
                >
                  <svg
                    class="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <button
                v-else
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
            <input
              v-if="editingSubtitleId === subtitle.id"
              v-model="editingSubtitleText"
              type="text"
              class="w-full px-3 py-2 text-sm rounded border transition-colors"
              :class="[
                themeStore.isDark
                  ? 'bg-gray-800 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900',
              ]"
              @keyup.enter="saveSubtitle(subtitle.id)"
              @keyup.esc="cancelEdit"
            />
            <p v-else class="text-sm">{{ subtitle.text }}</p>
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
import { ref, onMounted, computed, onBeforeUnmount } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { subtitlesApi, audioApi } from '@/api/handlers'
import AudioPlayerWithRegions from '@/components/AudioPlayerWithRegions.vue'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const audioFiles = ref([])
const selectedAudioIds = ref([])
const processing = ref(false)
const allSubtitles = ref([])
const pollingInterval = ref(null)
const selectedLanguage = ref('')
const editingSubtitleId = ref(null)
const editingSubtitleText = ref('')
const savingSubtitle = ref(false)
const audioUrls = ref({})
const activeSubtitleId = ref(null)
const audioPlayerRefs = ref({})

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

const filteredSubtitlesByAudio = computed(() => {
  if (!selectedLanguage.value) {
    return subtitlesByAudio.value
  }

  const filtered = {}
  Object.keys(subtitlesByAudio.value).forEach((audioId) => {
    const subs = subtitlesByAudio.value[audioId].filter(
      (sub) => sub.language === selectedLanguage.value,
    )
    if (subs.length > 0) {
      filtered[audioId] = subs
    }
  })
  return filtered
})

const availableLanguages = computed(() => {
  const languages = new Set()
  allSubtitles.value.forEach((sub) => {
    languages.add(sub.language)
  })
  return Array.from(languages).sort()
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

  // Завантажуємо аудіофайли для плеєра
  await loadAudioFiles()
})

onBeforeUnmount(() => {
  // Очищаємо інтервал при знищенні компонента
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }

  // Очищаємо URLs
  Object.values(audioUrls.value).forEach((url) => {
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url)
    }
  })
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

async function pollSubtitles() {
  try {
    // Перевіряємо чи з'явились субтитри для вибраних файлів
    const subtitles = await subtitlesApi.getAll()
    const hasNewSubtitles = selectedAudioIds.value.some((audioId) => {
      const audioSubtitles = subtitles.filter((s) => s.forAudio === audioId)
      const oldCount = subtitleCounts.value[audioId] || 0
      return audioSubtitles.length > oldCount
    })

    if (hasNewSubtitles) {
      // Знайдено нові субтитри, оновлюємо і зупиняємо поллінг
      allSubtitles.value = subtitles
      stopPolling()
      processing.value = false
      await loadAudioFiles()
    }
  } catch (error) {
    console.error('Error polling subtitles:', error)
  }
}

function startPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
  }
  pollingInterval.value = setInterval(pollSubtitles, 10000) // Кожні 10 секунд
}

function stopPolling() {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
}

async function generateSubtitles() {
  if (selectedAudioIds.value.length === 0) return

  processing.value = true
  try {
    // Генеруємо субтитри для вибраних файлів
    await subtitlesApi.generate(selectedAudioIds.value)

    // Запускаємо поллінг для перевірки появи субтитрів
    startPolling()

    // Також одразу перевіряємо
    await pollSubtitles()
  } catch (error) {
    console.error('Error generating subtitles:', error)
    processing.value = false
    stopPolling()
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
  editingSubtitleId.value = subtitle.id
  editingSubtitleText.value = subtitle.text
}

function cancelEdit() {
  editingSubtitleId.value = null
  editingSubtitleText.value = ''
}

async function saveSubtitle(subtitleId) {
  if (!editingSubtitleText.value.trim()) {
    return
  }

  savingSubtitle.value = true
  try {
    await subtitlesApi.update(subtitleId, { text: editingSubtitleText.value })

    // Оновлюємо локальні дані
    const subtitle = allSubtitles.value.find((s) => s.id === subtitleId)
    if (subtitle) {
      subtitle.text = editingSubtitleText.value
    }

    cancelEdit()
  } catch (error) {
    console.error('Error saving subtitle:', error)
  } finally {
    savingSubtitle.value = false
  }
}

async function loadAudioFiles() {
  // Завантажуємо аудіофайли для тих, у яких є субтитри
  const audioIds = Object.keys(subtitlesByAudio.value)

  for (const audioId of audioIds) {
    try {
      const audio = audioFiles.value.find((a) => a.id === parseInt(audioId))
      if (!audio) continue

      let fileName = audio.fileName

      if (!fileName) {
        const audioInfo = await audioApi.getInfo(audio.id)
        fileName = audioInfo.fileName
      }

      if (!fileName) {
        console.error('Could not determine file name for audio', audioId)
        continue
      }

      const blob = await audioApi.getFile(fileName)
      audioUrls.value[audioId] = URL.createObjectURL(blob)
    } catch (error) {
      console.error(`Error loading audio file ${audioId}:`, error)
    }
  }
}

function prepareRegions(subtitles) {
  return subtitles.map((subtitle, index) => ({
    id: subtitle.id,
    startTime: subtitle.startTime,
    endTime: subtitle.endTime,
    label: subtitle.text,
    text: subtitle.text,
    color: 'rgba(139, 92, 246, 0.5)', // Фіолетовий колір для всіх субтитрів
  }))
}

function setActiveSubtitle(subtitleId) {
  activeSubtitleId.value = activeSubtitleId.value === subtitleId ? null : subtitleId

  // Знаходимо субтитр і переходимо до його часу
  if (subtitleId) {
    const subtitle = allSubtitles.value.find((s) => s.id === subtitleId)
    if (subtitle) {
      const audioId = subtitle.forAudio
      const player = audioPlayerRefs.value[audioId]
      if (player && player.seekTo) {
        player.seekTo(subtitle.startTime)
      }
    }
  }
}

function handleRegionClick(region) {
  setActiveSubtitle(region.id)
}
</script>
