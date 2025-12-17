<template>
  <div class="step-conversion">
    <h2 class="text-2xl font-bold mb-6">{{ $t('workflow.steps.conversion.title') }}</h2>
    <p class="mb-8" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
      {{ $t('workflow.steps.conversion.description') }}
    </p>

    <!-- Dubbed Audio Files Selection -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.conversion.selectFiles') }}</h3>
      <div v-if="dubbedAudioFiles.length > 0" class="space-y-3">
        <label
          v-for="audio in dubbedAudioFiles"
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
              {{ $t('workflow.steps.conversion.dubbedAudio') }} • {{ formatFileSize(audio.size) }}
            </p>
          </div>
          <span
            v-if="convertedAudio[audio.id]"
            class="text-sm px-3 py-1 rounded-full bg-green-600 text-white"
          >
            {{ $t('workflow.steps.conversion.converted') }}
          </span>
        </label>
      </div>
      <div
        v-else
        class="text-center py-12 rounded-lg border-2 border-dashed"
        :class="[themeStore.isDark ? 'border-gray-700' : 'border-gray-300']"
      >
        <svg
          class="mx-auto h-12 w-12 mb-3"
          :class="[themeStore.isDark ? 'text-gray-600' : 'text-gray-400']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
          />
        </svg>
        <p :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
          {{ $t('workflow.steps.conversion.noFiles') }}
        </p>
      </div>
    </div>

    <!-- Conversion Model Settings -->
    <div v-if="dubbedAudioFiles.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">
        {{ $t('workflow.steps.conversion.modelSettings') }}
      </h3>
      <div
        class="p-4 rounded-lg border"
        :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
      >
        <div class="flex items-center justify-between mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">
              {{ $t('workflow.steps.conversion.model') }}
            </label>
            <p class="text-xs" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
              {{ $t('workflow.steps.conversion.modelDescription') }}
            </p>
          </div>
          <select
            v-model="selectedModel"
            class="px-4 py-2 rounded-lg border transition-colors"
            :class="[
              themeStore.isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900',
            ]"
          >
            <option v-for="model in availableModels" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
        </div>

        <!-- Conversion Quality Settings -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ $t('workflow.steps.conversion.quality') }}
            </label>
            <select
              v-model="conversionSettings.quality"
              class="w-full px-4 py-2 rounded-lg border transition-colors"
              :class="[
                themeStore.isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900',
              ]"
            >
              <option value="draft">{{ $t('workflow.steps.conversion.qualityDraft') }}</option>
              <option value="standard">
                {{ $t('workflow.steps.conversion.qualityStandard') }}
              </option>
              <option value="high">{{ $t('workflow.steps.conversion.qualityHigh') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">
              {{ $t('workflow.steps.conversion.preservePitch') }}
            </label>
            <div class="flex items-center h-full">
              <input
                v-model="conversionSettings.preservePitch"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span
                class="ml-3 text-sm"
                :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
              >
                {{ $t('workflow.steps.conversion.preservePitchDesc') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Run Conversion Button -->
    <button
      v-if="dubbedAudioFiles.length > 0"
      @click="runConversion"
      :disabled="selectedAudioIds.length === 0 || processing"
      class="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 mb-8"
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
      <span v-if="processing">{{ $t('workflow.steps.conversion.processing') }}...</span>
      <span v-else>{{ $t('workflow.steps.conversion.run') }}</span>
    </button>

    <!-- Conversion Results -->
    <div v-if="Object.keys(convertedAudio).length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.conversion.results') }}</h3>
      <div class="space-y-3">
        <div
          v-for="(converted, audioId) in convertedAudio"
          :key="audioId"
          class="p-4 rounded-lg border"
          :class="[
            themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50',
          ]"
        >
          <div class="flex justify-between items-center">
            <div>
              <h4 class="font-medium">{{ converted.name }}</h4>
              <p class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                {{ $t('workflow.steps.conversion.convertedWith') }} {{ selectedModel }} •
                {{ formatFileSize(converted.size) }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                @click="playConverted(converted)"
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
      </div>

      <!-- Complete Step Button -->
      <button
        @click="completeStep"
        class="mt-6 w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        {{ $t('workflow.steps.conversion.complete') }}
      </button>
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
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { audioApi, mappingsApi } from '@/api/handlers'
import AudioPlayer from '@/components/AudioPlayer.vue'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const dubbedAudioFiles = ref([])
const selectedAudioIds = ref([])
const selectedModel = ref('chatterbox')
const conversionSettings = ref({
  quality: 'standard',
  preservePitch: true,
})
const processing = ref(false)
const convertedAudio = ref({})
const selectedAudio = ref(null)
const audioUrl = ref(null)

const availableModels = [
  { id: 'chatterbox', name: 'Chatterbox (Default)' },
  { id: 'rvc', name: 'RVC (Retrieval-based Voice Conversion)' },
  { id: 'so-vits-svc', name: 'So-VITS-SVC' },
]

onMounted(async () => {
  await loadDubbedAudio()
})

onBeforeUnmount(() => {
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
})

async function loadDubbedAudio() {
  try {
    // Завантажуємо озвучені файли з попереднього кроку
    const voicingData = workflowStore.getStepData('voicing')
    if (voicingData?.voicing) {
      dubbedAudioFiles.value = voicingData.voicing
    } else {
      // Або завантажуємо з API
      dubbedAudioFiles.value = await audioApi.getAllDubbed()
    }

    // Перевіряємо чи є вже конвертовані файли
    const conversionData = workflowStore.getStepData('conversion')
    if (conversionData?.converted) {
      convertedAudio.value = conversionData.converted
    }
  } catch (error) {
    console.error('Error loading dubbed audio:', error)
  }
}

async function runConversion() {
  if (selectedAudioIds.value.length === 0) return

  processing.value = true
  try {
    for (const audioId of selectedAudioIds.value) {
      const audio = dubbedAudioFiles.value.find((a) => a.id === audioId)
      if (audio) {
        convertedAudio.value[audioId] = {
          id: audioId,
          name: `${audio.name}_converted`,
          size: audio.size * 1.1,
          model: selectedModel.value,
          quality: conversionSettings.value.quality,
        }
      }
    }

    workflowStore.completeStep('conversion', {
      converted: convertedAudio.value,
      settings: {
        model: selectedModel.value,
        ...conversionSettings.value,
      },
    })
  } catch (error) {
    console.error('Error running conversion:', error)
  } finally {
    processing.value = false
  }
}

async function playConverted(converted) {
  try {
    selectedAudio.value = converted
    // Тут має бути завантаження реального файлу
    // const blob = await audioApi.getFile(converted.fileName)
    // audioUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error playing converted audio:', error)
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
  workflowStore.completeStep('conversion', {
    converted: convertedAudio.value,
    settings: {
      model: selectedModel.value,
      ...conversionSettings.value,
    },
  })
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
)
