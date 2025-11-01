<template>
  <div class="w-full max-w-2xl">
    <div
      @click="triggerFileInput"
      @drop.prevent="handleDrop"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      :class="[
        'relative border-2 border-dashed rounded-xl p-12 transition-all cursor-pointer',
        isDragging
          ? 'border-violet-500 bg-violet-500/10'
          : themeStore.isDark
            ? 'border-gray-700 hover:border-gray-600 bg-gray-800/30 hover:bg-gray-800/50'
            : 'border-gray-300 hover:border-violet-400 bg-violet-50/30 hover:bg-violet-50/50',
      ]"
    >
      <input
        ref="fileInputRef"
        type="file"
        accept="audio/*,.mp3,.wav,.m4a,.ogg"
        @change="handleFileInput"
        class="hidden"
      />

      <div class="flex flex-col items-center space-y-4">
        <div
          :class="[
            'w-16 h-16 rounded-full flex items-center justify-center transition-colors',
            isDragging ? 'bg-violet-600' : themeStore.isDark ? 'bg-gray-700' : 'bg-violet-100',
          ]"
        >
          <svg
            :class="[
              'w-8 h-8 transition-colors',
              isDragging || !themeStore.isDark ? 'text-violet-600' : 'text-gray-300',
            ]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        <div class="text-center">
          <p
            :class="[
              'text-lg font-medium mb-1 transition-colors',
              themeStore.isDark ? 'text-gray-200' : 'text-gray-700',
            ]"
          >
            {{ isDragging ? t('upload.dropHere') : t('upload.dragFile') }}
          </p>
          <p
            :class="[
              'text-sm transition-colors',
              themeStore.isDark ? 'text-gray-400' : 'text-gray-500',
            ]"
          >
            {{ t('upload.clickToSelect') }}
          </p>
        </div>

        <div class="flex flex-wrap justify-center gap-2">
          <span
            v-for="format in supportedFormats"
            :key="format"
            :class="[
              'px-3 py-1 text-xs font-medium rounded-full transition-colors',
              themeStore.isDark ? 'bg-gray-800 text-gray-300' : 'bg-violet-100 text-violet-700',
            ]"
          >
            {{ format }}
          </span>
        </div>
      </div>

      <div
        v-if="errorMessage"
        :class="[
          'mt-4 p-3 border rounded-lg transition-colors',
          themeStore.isDark
            ? 'bg-red-900/20 border-red-800 text-red-400'
            : 'bg-red-50 border-red-200 text-red-600',
        ]"
      >
        <p class="text-sm text-center">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'

const { t } = useI18n()
const themeStore = useThemeStore()

const emit = defineEmits(['file-selected'])

const fileInputRef = ref(null)
const isDragging = ref(false)
const errorMessage = ref('')

const supportedFormats = ['MP3', 'WAV', 'M4A', 'OGG']
const maxFileSize = 100 * 1024 * 1024

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const validateFile = (file) => {
  errorMessage.value = ''

  if (!file) {
    return false
  }

  if (!file.type.startsWith('audio/')) {
    errorMessage.value = t('upload.errors.notAudio')
    return false
  }

  if (file.size > maxFileSize) {
    errorMessage.value = t('upload.errors.tooLarge')
    return false
  }

  return true
}

const handleFileInput = (event) => {
  const file = event.target.files?.[0]
  if (file && validateFile(file)) {
    emit('file-selected', file)
  }
}

const handleDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file && validateFile(file)) {
    emit('file-selected', file)
  }
}
</script>
