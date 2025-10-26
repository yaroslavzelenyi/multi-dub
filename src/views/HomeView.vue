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
            <h1 class="text-xl font-semibold text-gray-100">{{ $t('app.title') }}</h1>
          </div>
          <div class="text-sm text-gray-400">{{ $t('app.subtitle') }}</div>
          <LanguageSwitcher />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Upload/Record Selection -->
      <div v-if="!audioFile" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-100 mb-3">{{ $t('main.selectMethod') }}</h2>
          <p class="text-gray-400 text-lg">{{ $t('main.selectMethodDesc') }}</p>
        </div>

        <!-- Tab Selection -->
        <div class="flex space-x-2 mb-8 bg-gray-900 rounded-lg p-1">
          <button
            @click="activeTab = 'upload'"
            :class="[
              'px-6 py-2.5 rounded-md font-medium transition-colors',
              activeTab === 'upload'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-gray-200',
            ]"
          >
            {{ $t('main.uploadFile') }}
          </button>
          <button
            @click="activeTab = 'record'"
            :class="[
              'px-6 py-2.5 rounded-md font-medium transition-colors',
              activeTab === 'record'
                ? 'bg-violet-600 text-white'
                : 'text-gray-400 hover:text-gray-200',
            ]"
          >
            {{ $t('main.recordVoice') }}
          </button>
        </div>

        <!-- Upload Section -->
        <div v-if="activeTab === 'upload'" class="w-full max-w-2xl">
          <FileUpload @file-selected="handleFileSelected" />
        </div>

        <!-- Record Section -->
        <div v-else class="w-full max-w-2xl">
          <VoiceRecorder @recording-complete="handleRecordingComplete" />
        </div>
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
                <p class="text-sm text-gray-400">
                  {{ formatFileSize(audioFileSize) }}
                  <span v-if="isFromRecording" class="text-violet-400 ml-2"
                    >• {{ $t('player.fromRecording') }}</span
                  >
                </p>
              </div>
            </div>
            <button
              @click="clearAudio"
              class="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 border border-gray-700 hover:border-gray-600 rounded-lg transition-colors"
            >
              {{ $t('player.changeFile') }}
            </button>
          </div>
        </div>

        <!-- Audio Player -->
        <AudioPlayer :audio-url="audioUrl" :file-name="audioFileName" />

        <!-- Actions -->
        <div class="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
          <h3 class="text-lg font-semibold text-gray-100 mb-4">{{ $t('settings.title') }}</h3>

          <!-- Analysis Section -->
          <div class="mb-6 p-4 bg-gray-950 rounded-lg">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center space-x-2">
                <svg
                  class="w-5 h-5 text-violet-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <span class="text-sm font-medium text-gray-300">{{ $t('analysis.title') }}</span>
              </div>
              <span
                v-if="analysisStatus"
                :class="[
                  'text-xs px-2 py-1 rounded',
                  analysisStatus === 'completed'
                    ? 'bg-green-900/30 text-green-400'
                    : analysisStatus === 'analyzing'
                      ? 'bg-blue-900/30 text-blue-400'
                      : 'bg-red-900/30 text-red-400',
                ]"
              >
                {{ analysisStatusText }}
              </span>
            </div>

            <div class="space-y-3">
              <div class="text-sm text-gray-400">
                <p class="mb-2">{{ $t('analysis.readyForAnalysis') }}:</p>
                <div class="bg-gray-900 rounded p-3 font-mono text-xs">
                  <div>
                    <span class="text-gray-500">{{ $t('analysis.type') }}:</span>
                    <span class="text-violet-400">{{ audioFile?.type || 'audio/webm' }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">{{ $t('analysis.size') }}:</span>
                    <span class="text-violet-400">{{ formatFileSize(audioFileSize) }}</span>
                  </div>
                  <div>
                    <span class="text-gray-500">{{ $t('analysis.name') }}:</span>
                    <span class="text-violet-400">{{ audioFileName }}</span>
                  </div>
                </div>
              </div>

              <button
                @click="analyzeAudio"
                :disabled="isAnalyzing"
                class="w-full px-4 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <svg
                  v-if="!isAnalyzing"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
                <span>{{
                  isAnalyzing ? $t('analysis.analyzing') : $t('analysis.analyzeButton')
                }}</span>
              </button>
            </div>
          </div>

          <!-- Other Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
            >
              {{ $t('settings.startDubbing') }}
            </button>
            <button
              class="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-gray-100 font-medium rounded-lg transition-colors"
            >
              {{ $t('settings.languageSettings') }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-800 mt-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p class="text-center text-sm text-gray-500">{{ $t('footer.description') }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import FileUpload from '../components/FileUpload.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import VoiceRecorder from '../components/VoiceRecorder.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'

const { t } = useI18n()

const activeTab = ref('upload')
const audioFile = ref(null)
const audioUrl = ref('')
const audioFileName = ref('')
const audioFileSize = ref(0)
const isFromRecording = ref(false)
const audioBlob = ref(null)

// Analysis status
const analysisStatus = ref(null)
const isAnalyzing = ref(false)
const analysisStatusText = ref('')

const handleFileSelected = (file) => {
  audioFile.value = file
  audioFileName.value = file.name
  audioFileSize.value = file.size
  audioUrl.value = URL.createObjectURL(file)
  isFromRecording.value = false
  audioBlob.value = file
  analysisStatus.value = null
}

const handleRecordingComplete = (file, blob) => {
  audioFile.value = file
  audioFileName.value = file.name
  audioFileSize.value = file.size
  audioUrl.value = URL.createObjectURL(file)
  isFromRecording.value = true
  audioBlob.value = blob
  analysisStatus.value = null
}

const clearAudio = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  audioFile.value = null
  audioUrl.value = ''
  audioFileName.value = ''
  audioFileSize.value = 0
  isFromRecording.value = false
  audioBlob.value = null
  analysisStatus.value = null
}

const analyzeAudio = async () => {
  if (!audioFile.value) return

  isAnalyzing.value = true
  analysisStatus.value = 'analyzing'
  analysisStatusText.value = t('analysis.analyzing')

  try {
    // Simulate analysis
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log('Analyzing audio:', {
      name: audioFileName.value,
      size: audioFileSize.value,
      type: audioFile.value.type,
      isRecording: isFromRecording.value,
    })

    analysisStatus.value = 'completed'
    analysisStatusText.value = t('analysis.completed')
    isAnalyzing.value = false

    alert(
      t('analysis.completedAlert') +
        '\n\n' +
        t('analysis.info') +
        '\n' +
        `${t('analysis.name')}: ${audioFileName.value}\n` +
        `${t('analysis.size')}: ${formatFileSize(audioFileSize.value)}\n` +
        `${t('analysis.type')}: ${audioFile.value.type}\n` +
        `${t('analysis.source')}: ${isFromRecording.value ? t('analysis.fromRecording') : t('analysis.fromUpload')}`,
    )
  } catch (error) {
    console.error('Error analyzing audio:', error)
    analysisStatus.value = 'error'
    analysisStatusText.value = t('analysis.error')
    isAnalyzing.value = false
    alert(t('analysis.errorAlert'))
  }
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
