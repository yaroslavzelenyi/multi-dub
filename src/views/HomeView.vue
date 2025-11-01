<template>
  <div
    class="min-h-screen transition-colors duration-200"
    :class="[themeStore.isDark ? 'bg-gray-950' : 'bg-gray-50']"
  >
    <header
      class="border-b backdrop-blur-sm sticky top-0 z-10 transition-colors duration-200"
      :class="[
        themeStore.isDark ? 'border-gray-800 bg-gray-900/50' : 'border-gray-200 bg-white/50',
      ]"
    >
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
            <h1
              class="text-xl font-semibold transition-colors duration-200"
              :class="[themeStore.isDark ? 'text-gray-100' : 'text-gray-900']"
            >
              {{ $t('app.title') }}
            </h1>
          </div>

          <div class="flex items-center space-x-4">
            <div
              class="text-sm transition-colors duration-200"
              :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
            >
              {{ $t('app.subtitle') }}
            </div>
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div v-if="!audioFile" class="flex flex-col items-center justify-center min-h-[60vh]">
        <div class="text-center mb-8">
          <h2
            class="text-3xl font-bold mb-3 transition-colors duration-200"
            :class="[themeStore.isDark ? 'text-gray-100' : 'text-gray-900']"
          >
            {{ $t('main.selectMethod') }}
          </h2>
          <p
            class="text-lg transition-colors duration-200"
            :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
          >
            {{ $t('main.selectMethodDesc') }}
          </p>
        </div>

        <div
          class="flex space-x-2 mb-8 rounded-lg p-1 transition-colors duration-200"
          :class="[themeStore.isDark ? 'bg-gray-900' : 'bg-gray-200']"
        >
          <button
            @click="activeTab = 'upload'"
            :class="[
              'px-6 py-2.5 rounded-md font-medium transition-colors',
              activeTab === 'upload'
                ? 'bg-violet-600 text-white'
                : themeStore.isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900',
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
                : themeStore.isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            {{ $t('main.recordVoice') }}
          </button>
        </div>

        <div class="w-full max-w-2xl">
          <FileUpload v-if="activeTab === 'upload'" @file-selected="handleFileSelected" />
          <VoiceRecorder v-else @recording-complete="handleRecordingComplete" />
        </div>
      </div>

      <div v-else class="space-y-6">
        <div
          class="flex items-center justify-between p-4 rounded-lg"
          :class="[themeStore.isDark ? 'bg-gray-800' : 'bg-white border border-gray-200']"
        >
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-violet-600/20 rounded-lg flex items-center justify-center">
              <svg
                class="w-5 h-5 text-violet-500"
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
              <h3 :class="['font-medium', themeStore.isDark ? 'text-gray-100' : 'text-gray-900']">
                {{ audioFileName }}
              </h3>
              <p :class="['text-sm', themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                {{ formatFileSize(audioFileSize) }}
                <span v-if="isFromRecording" class="ml-2">
                  • {{ $t('analysis.fromRecording') }}
                </span>
              </p>
            </div>
          </div>
          <button
            @click="clearAudio"
            :class="[
              'p-2 rounded-lg transition-colors',
              themeStore.isDark
                ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
                : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900',
            ]"
            :title="$t('player.changeFile')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <AudioEditor
          :audioUrl="audioUrl"
          :audioFile="audioFile"
          @audio-updated="handleAudioUpdated"
        />

        <div
          class="rounded-lg p-6 transition-colors duration-200"
          :class="[themeStore.isDark ? 'bg-gray-800' : 'bg-white border border-gray-200']"
        >
          <h3
            class="text-lg font-semibold mb-4 transition-colors duration-200"
            :class="[themeStore.isDark ? 'text-gray-100' : 'text-gray-900']"
          >
            {{ $t('settings.title') }}
          </h3>

          <div
            class="mb-6 p-4 rounded-lg transition-colors duration-200"
            :class="[themeStore.isDark ? 'bg-gray-950' : 'bg-gray-50']"
          >
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
                <span
                  class="text-sm font-medium transition-colors duration-200"
                  :class="[themeStore.isDark ? 'text-gray-300' : 'text-gray-700']"
                >
                  {{ $t('analysis.title') }}
                </span>
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
              <div
                class="text-sm transition-colors duration-200"
                :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
              >
                <p class="mb-2">{{ $t('analysis.readyForAnalysis') }}:</p>
                <div
                  class="rounded p-3 font-mono text-xs transition-colors duration-200"
                  :class="[themeStore.isDark ? 'bg-gray-900' : 'bg-white border border-gray-200']"
                >
                  <div>
                    <span
                      class="transition-colors duration-200"
                      :class="[themeStore.isDark ? 'text-gray-500' : 'text-gray-500']"
                    >
                      {{ $t('analysis.type') }}:
                    </span>
                    <span class="text-violet-400">{{ audioFile?.type || 'audio/webm' }}</span>
                  </div>
                  <div>
                    <span
                      class="transition-colors duration-200"
                      :class="[themeStore.isDark ? 'text-gray-500' : 'text-gray-500']"
                    >
                      {{ $t('analysis.size') }}:
                    </span>
                    <span class="text-violet-400">{{ formatFileSize(audioFileSize) }}</span>
                  </div>
                  <div>
                    <span
                      class="transition-colors duration-200"
                      :class="[themeStore.isDark ? 'text-gray-500' : 'text-gray-500']"
                    >
                      {{ $t('analysis.name') }}:
                    </span>
                    <span class="text-violet-400">{{ audioFileName }}</span>
                  </div>
                  <div v-if="isFromRecording">
                    <span
                      class="transition-colors duration-200"
                      :class="[themeStore.isDark ? 'text-gray-500' : 'text-gray-500']"
                    >
                      {{ $t('analysis.source') }}:
                    </span>
                    <span class="text-violet-400">{{ $t('analysis.fromRecording') }}</span>
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
            >
              {{ $t('settings.startDubbing') }}
            </button>
            <button
              class="px-6 py-3 font-medium rounded-lg transition-colors"
              :class="[
                themeStore.isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
              ]"
            >
              {{ $t('settings.languageSettings') }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <footer
      class="border-t mt-20 transition-colors duration-200"
      :class="[themeStore.isDark ? 'border-gray-800' : 'border-gray-200']"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p
          class="text-center text-sm transition-colors duration-200"
          :class="[themeStore.isDark ? 'text-gray-500' : 'text-gray-600']"
        >
          {{ $t('footer.description') }}
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import FileUpload from '../components/FileUpload.vue'
import AudioEditor from '../components/AudioEditor.vue'
import VoiceRecorder from '../components/VoiceRecorder.vue'
import LanguageSwitcher from '../components/LanguageSwitcher.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

const { t } = useI18n()
const themeStore = useThemeStore()

const activeTab = ref('upload')
const audioFile = ref(null)
const audioUrl = ref('')
const audioFileName = ref('')
const audioFileSize = ref(0)
const isFromRecording = ref(false)
const audioBlob = ref(null)

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

const handleAudioUpdated = (blob) => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }

  const timestamp = Date.now()
  const originalName = audioFileName.value.replace(/\.[^/.]+$/, '')
  const file = new File([blob], `${originalName}-edited-${timestamp}.wav`, {
    type: 'audio/wav',
  })

  audioFile.value = file
  audioFileName.value = file.name
  audioFileSize.value = file.size
  audioUrl.value = URL.createObjectURL(file)
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
  isAnalyzing.value = true
  analysisStatus.value = 'analyzing'
  analysisStatusText.value = t('analysis.analyzing')

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000))

    analysisStatus.value = 'completed'
    analysisStatusText.value = t('analysis.completed')
    isAnalyzing.value = false
  } catch (error) {
    console.error('Analysis error:', error)
    analysisStatus.value = 'error'
    analysisStatusText.value = t('analysis.error')
    isAnalyzing.value = false
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
