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

    <!-- Audio Files Selection -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.translation.selectFiles') }}</h3>
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
              {{ getTranslationCount(audio.id) }} {{ $t('workflow.steps.translation.translations') }}
            </p>
          </div>
        </label>
      </div>
    </div>

    <!-- Translate Button -->
    <button
      @click="translateSubtitles"
      :disabled="!targetLanguage || selectedAudioIds.length === 0 || processing"
      class="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 mb-8"
      :class="[
        targetLanguage && selectedAudioIds.length > 0 && !processing
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
import { ref, onMounted, computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { subtitlesApi } from '@/api/handlers'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const audioFiles = ref([])
const selectedAudioIds = ref([])
const targetLanguage = ref('')
const processing = ref(false)
const allSubtitles = ref([])
const translatedLanguages = ref(new Set())

const hasTranslations = computed(() => translatedLanguages.value.size > 0)

onMounted(async () => {
  const uploadData = workflowStore.getStepData('upload')
  if (uploadData?.audioFiles) {
    audioFiles.value = uploadData.audioFiles
  }

  await loadSubtitles()
})

async function loadSubtitles() {
  try {
    allSubtitles.value = await subtitlesApi.getAll()

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
  if (!targetLanguage.value || selectedAudioIds.value.length === 0) return

  processing.value = true
  try {
    await subtitlesApi.translate(targetLanguage.value, selectedAudioIds.value)
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

function getTranslationCount(audioId) {
  const subs = allSubtitles.value.filter((s) => s.forAudio === audioId)
  const languages = new Set(subs.map((s) => s.language))
  return languages.size
}
</script>
