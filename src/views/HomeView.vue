<template>
  <div class="min-h-screen bg-gray-950">
    <!-- Header -->
    <header class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <h1 class="text-xl font-semibold text-gray-100">MultiDub</h1>
          </div>
          <div class="text-sm text-gray-400">AI-Powered Audio Dubbing</div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Upload Section -->
      <div v-if="!audioFile" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-100 mb-3">Завантажте аудіофайл</h2>
          <p class="text-gray-400 text-lg">Підтримуються формати: MP3, WAV, M4A, OGG</p>
        </div>

        <FileUpload @file-selected="handleFileSelected" />
      </div>

      <!-- Player Section -->
      <div v-else class="space-y-6 animate-in fade-in duration-500">
        <!-- File Info -->
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div
                class="w-14 h-14 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center"
              >
                <svg
                  class="w-7 h-7 text-white"
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
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-100">{{ audioFileName }}</h3>
                <p class="text-sm text-gray-400">{{ formatFileSize(audioFileSize) }}</p>
              </div>
            </div>
            <button
              @click="clearAudio"
              class="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
            >
              Змінити файл
            </button>
          </div>
        </div>

        <!-- Audio Player -->
        <AudioPlayer :audio-url="audioUrl" :file-name="audioFileName" />

        <!-- Actions -->
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-100 mb-4">Налаштування дублювання</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
            >
              Розпочати дублювання
            </button>
            <button
              class="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 font-medium rounded-lg transition-colors"
            >
              Налаштування мови
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-800 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p class="text-center text-sm text-gray-500">MultiDub - AI Audio Dubbing Platform</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import FileUpload from '../components/FileUpload.vue'
import AudioPlayer from '../components/AudioPlayer.vue'

const audioFile = ref(null)
const audioUrl = ref('')
const audioFileName = ref('')
const audioFileSize = ref(0)

const handleFileSelected = (file) => {
  audioFile.value = file
  audioFileName.value = file.name
  audioFileSize.value = file.size
  audioUrl.value = URL.createObjectURL(file)
}

const clearAudio = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  audioFile.value = null
  audioUrl.value = ''
  audioFileName.value = ''
  audioFileSize.value = 0
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-in {
  animation: fade-in 0.3s ease-out;
}
</style>
