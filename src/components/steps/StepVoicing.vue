<template>
  <div class="step-voicing">
    <h2 class="text-2xl font-bold mb-6">{{ $t('workflow.steps.voicing.title') }}</h2>
    <p class="mb-8" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
      {{ $t('workflow.steps.voicing.description') }}
    </p>

    <!-- Language Selection -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.voicing.selectLanguage') }}</h3>
      <select
        v-model="selectedLanguage"
        @change="loadSubtitlesForLanguage"
        class="w-full px-4 py-3 rounded-lg border transition-colors"
        :class="[
          themeStore.isDark
            ? 'bg-gray-800 border-gray-700 text-white'
            : 'bg-white border-gray-300 text-gray-900',
        ]"
      >
        <option value="">{{ $t('workflow.steps.voicing.chooseLanguage') }}</option>
        <option v-for="lang in availableLanguages" :key="lang" :value="lang">
          {{ getLanguageName(lang) }}
        </option>
      </select>
    </div>

    <!-- Speaker Mapping -->
    <div v-if="selectedLanguage && speakers.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.voicing.speakerMapping') }}</h3>
      <p class="text-sm mb-4" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
        {{ $t('workflow.steps.voicing.speakerMappingDesc') }}
      </p>

      <div class="space-y-4">
        <div
          v-for="speaker in speakers"
          :key="speaker"
          class="p-4 rounded-lg border"
          :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                :style="{ backgroundColor: getSpeakerColor(speaker) }"
              >
                {{ speaker }}
              </div>
              <div>
                <h4 class="font-semibold">{{ $t('workflow.steps.voicing.speaker') }} {{ speaker }}</h4>
                <p class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                  {{ getSpeakerSubtitlesCount(speaker) }} {{ $t('workflow.steps.voicing.segments') }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <select
                v-model="speakerVoices[speaker]"
                class="px-4 py-2 rounded-lg border transition-colors"
                :class="[
                  themeStore.isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900',
                ]"
              >
                <option value="">{{ $t('workflow.steps.voicing.selectVoice') }}</option>
                <option v-for="voice in availableVoices" :key="voice.id" :value="voice.id">
                  {{ voice.name }} ({{ voice.gender }})
                </option>
              </select>
              <button
                v-if="speakerVoices[speaker]"
                @click="previewVoice(speaker)"
                class="p-2 rounded-lg transition-colors"
                :class="[
                  themeStore.isDark
                    ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                    : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900',
                ]"
                :title="$t('workflow.steps.voicing.preview')"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Voicing Settings -->
    <div v-if="selectedLanguage && allSpeakersHaveVoices" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.voicing.settings') }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-2">
            {{ $t('workflow.steps.voicing.speed') }}
          </label>
          <input
            v-model.number="voicingSettings.speed"
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            class="w-full"
          />
          <div class="text-sm text-center mt-1" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
            {{ voicingSettings.speed }}x
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium mb-2">
            {{ $t('workflow.steps.voicing.pitch') }}
          </label>
          <input
            v-model.number="voicingSettings.pitch"
            type="range"
            min="-12"
            max="12"
            step="1"
            class="w-full"
          />
          <div class="text-sm text-center mt-1" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
            {{ voicingSettings.pitch > 0 ? '+' : '' }}{{ voicingSettings.pitch }}
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Voicing Button -->
    <button
      v-if="selectedLanguage && allSpeakersHaveVoices"
      @click="generateVoicing"
      :disabled="processing"
      class="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 mb-8"
      :class="[
        !processing
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
      <span v-if="processing">{{ $t('workflow.steps.voicing.generating') }}...</span>
      <span v-else>{{ $t('workflow.steps.voicing.generate') }}</span>
    </button>

    <!-- Generated Voicing Results -->
    <div v-if="generatedVoicing.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.voicing.results') }}</h3>
      <div class="space-y-3">
        <div
          v-for="voicing in generatedVoicing"
          :key="voicing.id"
          class="p-4 rounded-lg border flex justify-between items-center"
          :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
              :style="{ backgroundColor: getSpeakerColor(voicing.speaker) }"
            >
              {{ voicing.speaker }}
            </div>
            <div>
              <h4 class="font-medium">{{ voicing.name }}</h4>
              <p class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                {{ $t('workflow.steps.voicing.speaker') }} {{ voicing.speaker }} • {{ formatFileSize(voicing.size) }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="playVoicing(voicing)"
              class="p-2 rounded-lg transition-colors"
              :class="[
                themeStore.isDark
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900',
              ]"
              :title="$t('common.play')"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Complete Step Button -->
      <button
        @click="completeStep"
        class="mt-6 w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        {{ $t('workflow.steps.voicing.complete') }}
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="!selectedLanguage"
      class="text-center py-12"
      :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
    >
      <svg
        class="mx-auto h-16 w-16 mb-4"
        :class="[themeStore.isDark ? 'text-gray-700' : 'text-gray-300']"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
        />
      </svg>
      <p>{{ $t('workflow.steps.voicing.selectLanguageFirst') }}</p>
    </div>

    <!-- Audio Player Modal -->
    <div
      v-if="selectedAudio"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeAudioPlayer"
    >
      <div
        class="rounded-lg w-full max-w-2xl"
        :class="[themeStore.isDark ? 'bg-gray-900' : 'bg-white']"
      >
        <div
          class="flex items-center justify-between p-4 border-b"
          :class="[themeStore.isDark ? 'border-gray-700' : 'border-gray-200']"
        >
          <h3 class="text-lg font-semibold">{{ selectedAudio.name }}</h3>
          <button
            @click="closeAudioPlayer"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div class="p-6">
          <AudioPlayer v-if="audioUrl" :audio-url="audioUrl" :file-name="selectedAudio.name" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { subtitlesApi, diarizationApi, voicingApi, audioApi } from '@/api/handlers'
import AudioPlayer from '@/components/AudioPlayer.vue'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const selectedLanguage = ref('')
const availableLanguages = ref([])
const speakers = ref([])
const speakerVoices = ref({})
const voicingSettings = ref({
  speed: 1.0,
  pitch: 0,
})
const processing = ref(false)
const generatedVoicing = ref([])
const selectedAudio = ref(null)
const audioUrl = ref(null)
const allSubtitles = ref([])

const speakerColors = [
  '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
  '#3B82F6', '#EF4444', '#14B8A6', '#F97316',
]

const availableVoices = [
  { id: 'voice-1', name: 'Олена', gender: 'Ж' },
  { id: 'voice-2', name: 'Андрій', gender: 'Ч' },
  { id: 'voice-3', name: 'Марія', gender: 'Ж' },
  { id: 'voice-4', name: 'Дмитро', gender: 'Ч' },
  { id: 'voice-5', name: 'Наталія', gender: 'Ж' },
  { id: 'voice-6', name: 'Сергій', gender: 'Ч' },
]

const allSpeakersHaveVoices = computed(() => {
  return speakers.value.every((speaker) => speakerVoices.value[speaker])
})

onMounted(async () => {
  await loadData()
})

onBeforeUnmount(() => {
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
})

async function loadData() {
  try {
    // Завантажуємо перекладені субтитри
    const translationData = workflowStore.getStepData('translation')
    if (translationData?.languages) {
      availableLanguages.value = translationData.languages
    }

    // Завантажуємо всі субтитри
    allSubtitles.value = await subtitlesApi.getAll()

    // Якщо є тільки одна мова, вибираємо її автоматично
    if (availableLanguages.value.length === 1) {
      selectedLanguage.value = availableLanguages.value[0]
      await loadSubtitlesForLanguage()
    }

    // Завантажуємо вже згенеровані озвучені файли якщо є
    const dubbedFiles = await audioApi.getAllDubbed()
    if (dubbedFiles.length > 0) {
      generatedVoicing.value = dubbedFiles
      workflowStore.completeStep('voicing', { voicing: generatedVoicing.value })
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

async function loadSubtitlesForLanguage() {
  try {
    // Завантажуємо діаризацію
    const diarizations = await diarizationApi.getAll()
    const uniqueSpeakers = new Set(diarizations.map((d) => d.speaker))
    speakers.value = Array.from(uniqueSpeakers).sort()

    // Ініціалізуємо голоси для спікерів
    speakers.value.forEach((speaker, index) => {
      if (!speakerVoices.value[speaker]) {
        speakerVoices.value[speaker] = availableVoices[index % availableVoices.length].id
      }
    })
  } catch (error) {
    console.error('Error loading subtitles:', error)
  }
}

function getSpeakerSubtitlesCount(speaker) {
  return allSubtitles.value.filter((s) => s.language === selectedLanguage.value).length
}

function getSpeakerColor(speaker) {
  const speakerNum = parseInt(speaker.replace(/\D/g, '')) || 0
  return speakerColors[speakerNum % speakerColors.length]
}

function getLanguageName(code) {
  const names = {
    en: 'English',
    uk: 'Українська',

  }
  return names[code] || code.toUpperCase()
}

async function generateVoicing() {
  processing.value = true
  try {
    // Тут має бути логіка генерації озвучення через TTS API
    // Поки що створюємо mock дані
    const mockVoicing = speakers.value.map((speaker, index) => ({
      id: Date.now() + index,
      name: `${getLanguageName(selectedLanguage.value)}_${speaker}.wav`,
      speaker: speaker,
      voice: speakerVoices.value[speaker],
      size: Math.random() * 1000000 + 500000,
      type: 'dubbed',
    }))

    generatedVoicing.value = mockVoicing

    // Тут має бути реальний API виклик для генерації озвучення
    // await voicingApi.generateVoicing({ ... })
  } catch (error) {
    console.error('Error generating voicing:', error)
  } finally {
    processing.value = false
  }
}

function previewVoice(speaker) {
  console.log('Preview voice for speaker:', speaker, speakerVoices.value[speaker])
  // Тут має бути логіка попереднього прослуховування голосу
}

async function playVoicing(voicing) {
  try {
    selectedAudio.value = voicing
    // Тут має бути завантаження реального аудіофайлу
    // const blob = await audioApi.getFile(voicing.fileName)
    // audioUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error playing voicing:', error)
  }
}

function closeAudioPlayer() {
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
  selectedAudio.value = null
  audioUrl.value = null
}

function completeStep() {
  workflowStore.completeStep('voicing', {
    voicing: generatedVoicing.value,
    settings: voicingSettings.value,
    speakerVoices: speakerVoices.value,
  })
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
