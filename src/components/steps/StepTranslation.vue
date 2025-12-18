<template>
  <div class="step-translation">
    <h2 class="text-2xl font-bold mb-6">{{ $t('workflow.steps.translation.title') }}</h2>
    <p class="mb-8" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
      {{ $t('workflow.steps.translation.description') }}
    </p>

    <!-- Language Selection -->
    <div class="mb-8">
      <label class="block text-sm font-medium mb-2">
        {{ $t('workflow.steps.translation.targetLanguage') }}
      </label>
      <select
        v-model="targetLanguage"
        class="w-full px-4 py-3 rounded-lg border transition-colors"
        :class="[
          themeStore.isDark
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-300 text-gray-900',
        ]"
      >
        <option value="">{{ $t('workflow.steps.translation.selectLanguage') }}</option>
        <option value="en">English</option>
        <option value="uk">Українська</option>
        <option value="ru">Русский</option>
        <option value="pl">Polski</option>
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
        <option value="es">Español</option>
      </select>
    </div>

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
            {{ translatedLanguages.size }} {{ $t('workflow.steps.translation.translations') }}
          </p>
        </div>
      </div>
    </div>

    <!-- Translate Button -->
    <button
      @click="translateSubtitles"
      :disabled="!targetLanguage || !currentAudio || processing"
      class="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 mb-8"
      :class="[
        targetLanguage && currentAudio && !processing
          ? 'bg-violet-600 hover:bg-violet-700 text-white'
          : 'bg-gray-700 text-gray-500 cursor-not-allowed',
      ]"
    >
      <svg v-if="processing" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span v-if="processing">{{ $t('workflow.steps.translation.processing') }}...</span>
      <span v-else>{{ $t('workflow.steps.translation.translate') }}</span>
    </button>

    <!-- Translations Preview -->
    <div v-if="hasTranslations">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.translation.results') }}</h3>
      <p class="mb-4" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
        {{ $t('workflow.steps.translation.resultsDescription') }}
      </p>

      <!-- Translations by Language -->
      <div class="space-y-6 mb-8">
        <div
          v-for="lang in Array.from(translatedLanguages)"
          :key="lang"
          class="p-6 rounded-lg border"
          :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
        >
          <div class="flex justify-between items-center mb-4">
            <h4 class="font-semibold">{{ lang.toUpperCase() }}</h4>
            <span class="text-sm px-3 py-1 rounded-full bg-violet-600 text-white">
              {{ allSubtitles.filter((s) => s.language === lang).length }} субтитрів
            </span>
          </div>

          <!-- Audio Player with Regions for this language -->
          <div v-if="audioUrl" class="mb-4">
            <AudioPlayerWithRegions
              :ref="(el) => { if (el) audioPlayerRefs[lang] = el }"
              :audio-url="audioUrl"
              :file-name="currentAudio?.name"
              :regions="prepareRegions(lang)"
              :active-region-id="activeSubtitleId"
              @region-click="handleRegionClick"
            />
          </div>

          <!-- Subtitles List -->
          <div class="space-y-2 max-h-64 overflow-y-auto">
            <div
              v-for="subtitle in allSubtitles.filter((s) => s.language === lang)"
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
                <span class="text-xs" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                  {{ formatTime(subtitle.startTime) }} - {{ formatTime(subtitle.endTime) }}
                </span>
                <div v-if="editingSubtitleId === subtitle.id" class="flex gap-2">
                  <button
                    @click.stop="saveSubtitle(subtitle.id)"
                    :disabled="savingSubtitle"
                    class="p-1 rounded bg-green-600 hover:bg-green-700 disabled:bg-gray-500 transition-colors"
                    title="Зберегти"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </button>
                  <button
                    @click.stop="cancelEdit"
                    :disabled="savingSubtitle"
                    class="p-1 rounded bg-gray-600 hover:bg-gray-700 disabled:bg-gray-500 transition-colors"
                    title="Скасувати"
                  >
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  @click.stop="editSubtitle(subtitle)"
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
      </div>

      <!-- Complete Step Button -->
      <button
        @click="completeStep"
        class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        {{ $t('workflow.steps.translation.complete') }}
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

const currentAudio = ref(null)
const targetLanguage = ref('')
const processing = ref(false)
const allSubtitles = ref([])
const translatedLanguages = ref(new Set())
const audioUrl = ref('')
const activeSubtitleId = ref(null)
const editingSubtitleId = ref(null)
const editingSubtitleText = ref('')
const savingSubtitle = ref(false)
const audioPlayerRefs = ref({})

const hasTranslations = computed(() => translatedLanguages.value.size > 0)

onMounted(async () => {
  // Отримуємо перший аудіофайл з попереднього кроку
  const uploadData = workflowStore.getStepData('upload')
  if (uploadData?.audioFiles && uploadData.audioFiles.length > 0) {
    currentAudio.value = uploadData.audioFiles[0]
  }

  await loadSubtitles()

  // Завантажуємо аудіофайл для плеєра
  await loadAudioFile()
})

onBeforeUnmount(() => {
  // Очищаємо URL
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
})

async function loadSubtitles() {
  try {
    if (!currentAudio.value) return

    const allSubs = await subtitlesApi.getAll()

    // Фільтруємо субтитри для поточного аудіофайлу
    allSubtitles.value = allSubs.filter((s) => s.forAudio === currentAudio.value.id)

    // Визначаємо мови, які вже перекладені
    const languages = new Set(allSubtitles.value.map((s) => s.language))
    translatedLanguages.value = languages

    if (languages.size > 1) {
      workflowStore.completeStep('translation', { languages: Array.from(languages) })
    }
  } catch (error) {
    console.error('Error loading subtitles:', error)
  }
}

async function translateSubtitles() {
  if (!targetLanguage.value || !currentAudio.value) return

  processing.value = true
  try {
    await subtitlesApi.translate(targetLanguage.value, [currentAudio.value.id])
    await loadSubtitles()
  } catch (error) {
    console.error('Error translating subtitles:', error)
  } finally {
    processing.value = false
  }
}

function completeStep() {
  workflowStore.completeStep('translation', {
    languages: Array.from(translatedLanguages.value),
    targetLanguage: targetLanguage.value,
  })
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

function prepareRegions(language) {
  const subs = allSubtitles.value.filter((s) => s.language === language)
  return subs.map((subtitle, index) => ({
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
      const lang = subtitle.language
      const player = audioPlayerRefs.value[lang]
      if (player && player.seekTo) {
        player.seekTo(subtitle.startTime)
      }
    }
  }
}

function handleRegionClick(region) {
  setActiveSubtitle(region.id)
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
</script>
