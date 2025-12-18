<template>
  <div class="step-export">
    <h2 class="text-2xl font-bold mb-6">{{ $t('workflow.steps.export.title') }}</h2>
    <p class="mb-8" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
      {{ $t('workflow.steps.export.description') }}
    </p>

    <!-- Audio Files Selection -->
    <div class="mb-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('workflow.steps.export.selectFiles') }}</h3>
      <div class="space-y-3">
        <div
          v-for="audio in audioFiles"
          :key="audio.id"
          class="p-4 rounded-lg border"
          :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
        >
          <div class="flex justify-between items-center mb-4">
            <div>
              <h4 class="font-medium">{{ audio.name }}</h4>
              <p class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                {{ formatFileSize(audio.size) }}
              </p>
            </div>
          </div>

          <!-- Export Button -->
          <button
            @click="exportAudio(audio.id)"
            :disabled="processing[audio.id]"
            class="w-full px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="processing[audio.id]">{{ $t('workflow.steps.export.processing') }}...</span>
            <span v-else>{{ $t('workflow.steps.export.audio') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Complete Step Button -->
    <button
      @click="completeStep"
      class="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
    >
      {{ $t('workflow.steps.export.complete') }}
    </button>

    <!-- Success Message -->
    <div
      v-if="exportedFiles.length > 0"
      class="mt-6 p-4 rounded-lg bg-green-600/10 border border-green-600"
    >
      <div class="flex items-start gap-3">
        <svg class="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div class="flex-1">
          <h4 class="font-semibold text-green-600 mb-1">
            {{ $t('workflow.steps.export.success') }}
          </h4>
          <ul class="text-sm text-green-600 space-y-1">
            <li v-for="(file, index) in exportedFiles" :key="index">{{ file }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { audioApi, mappingsApi } from '@/api/handlers'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const audioFiles = ref([])
const processing = reactive({})
const exportedFiles = ref([])

onMounted(async () => {
  // Отримуємо вихідні файли з кроку voicing
  const voicingData = workflowStore.getStepData('voicing')
  if (voicingData?.outputs && voicingData.outputs.length > 0) {
    audioFiles.value = voicingData.outputs
  } else {
    // Якщо немає файлів з voicing, пробуємо завантажити з API
    const uploadData = workflowStore.getStepData('upload')
    if (uploadData?.audioFiles && uploadData.audioFiles.length > 0) {
      try {
        const outputs = await mappingsApi.getOutputsForAudio(uploadData.audioFiles[0].id)
        if (outputs && outputs.length > 0) {
          audioFiles.value = outputs
        }
      } catch (error) {
        console.error('Error loading outputs:', error)
      }
    }
  }
})

async function exportAudio(audioId) {
  processing[audioId] = true
  try {
    const audio = audioFiles.value.find((a) => a.id === audioId)
    if (!audio) {
      console.error('Audio file not found')
      return
    }

    // Завантажуємо аудіофайл з API
    const fileName = audio.fileName || audio.name
    const blob = await audioApi.getFile(fileName)

    // Створюємо посилання для завантаження
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    exportedFiles.value.push(fileName)
  } catch (error) {
    console.error('Error exporting audio:', error)
    alert('Помилка при завантаженні аудіофайлу. Спробуйте ще раз.')
  } finally {
    processing[audioId] = false
  }
}

function completeStep() {
  workflowStore.completeStep('export', { exportedFiles: exportedFiles.value })
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
