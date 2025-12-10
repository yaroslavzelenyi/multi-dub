<template>
  <div
    class="min-h-screen transition-colors duration-200"
    :class="[themeStore.isDark ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-900']"
  >
    <!-- Header -->
    <header
      class="border-b transition-colors duration-200"
      :class="[themeStore.isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white']"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-4">
            <button
              @click="router.push({ name: 'projects' })"
              class="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 class="text-2xl font-bold">
                {{ projectStore.currentProject?.name || $t('app.title') }}
              </h1>
              <p
                v-if="projectStore.currentProject?.description"
                class="mt-1 text-sm"
                :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
              >
                {{ projectStore.currentProject.description }}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>

      <div v-else>
        <!-- Audio Upload Section -->
        <div class="rounded-lg p-8 mb-8" :class="[themeStore.isDark ? 'bg-gray-900' : 'bg-white']">
          <h2 class="text-xl font-semibold mb-6">{{ $t('project.audioFiles') }}</h2>

          <!-- Upload Tabs -->
          <div class="flex gap-4 mb-6">
            <button
              @click="activeTab = 'upload'"
              class="px-6 py-3 rounded-lg font-medium transition-colors"
              :class="[
                activeTab === 'upload'
                  ? 'bg-violet-600 text-white'
                  : themeStore.isDark
                    ? 'bg-gray-800 text-gray-400 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900',
              ]"
            >
              {{ $t('main.uploadFile') }}
            </button>
            <button
              @click="activeTab = 'record'"
              class="px-6 py-3 rounded-lg font-medium transition-colors"
              :class="[
                activeTab === 'record'
                  ? 'bg-violet-600 text-white'
                  : themeStore.isDark
                    ? 'bg-gray-800 text-gray-400 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-gray-900',
              ]"
            >
              {{ $t('main.recordVoice') }}
            </button>
          </div>

          <!-- Upload Content -->
          <div v-if="activeTab === 'upload'">
            <FileUpload @file-selected="handleFileSelected" />
          </div>

          <!-- Record Content -->
          <div v-else-if="activeTab === 'record'">
            <VoiceRecorder @recording-complete="handleRecordingComplete" />
          </div>
        </div>

        <!-- Audio List -->
        <div
          v-if="audioFiles.length > 0"
          class="rounded-lg p-8 mb-8"
          :class="[themeStore.isDark ? 'bg-gray-900' : 'bg-white']"
        >
          <h2 class="text-xl font-semibold mb-6">{{ $t('project.uploadedFiles') }}</h2>
          <div class="space-y-4">
            <div
              v-for="audio in audioFiles"
              :key="audio.id"
              class="p-4 rounded-lg border"
              :class="[themeStore.isDark ? 'border-gray-800' : 'border-gray-200']"
            >
              <div class="flex justify-between items-center">
                <div>
                  <h3 class="font-medium">{{ audio.name }}</h3>
                  <p
                    class="text-sm"
                    :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
                  >
                    {{ audio.type === 'raw' ? $t('project.rawAudio') : $t('project.dubbedAudio') }}
                    -
                    {{ formatFileSize(audio.size) }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="handleEditAudio(audio)"
                    class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                  >
                    {{ $t('project.editAudio') }}
                  </button>
                  <button
                    @click="handleGenerateSubtitles(audio.id)"
                    class="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm"
                  >
                    {{ $t('project.generateSubtitles') }}
                  </button>
                  <button
                    @click="handleDeleteAudio(audio.id)"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    {{ $t('common.delete') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subtitles Section -->
        <div
          v-if="subtitles.length > 0"
          class="rounded-lg p-8"
          :class="[themeStore.isDark ? 'bg-gray-900' : 'bg-white']"
        >
          <h2 class="text-xl font-semibold mb-6">{{ $t('project.subtitles') }}</h2>
          <div class="space-y-4">
            <div
              v-for="subtitle in subtitles"
              :key="subtitle.id"
              class="p-4 rounded-lg border"
              :class="[themeStore.isDark ? 'border-gray-800' : 'border-gray-200']"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs px-2 py-1 rounded bg-violet-600 text-white">
                      {{ subtitle.language.toUpperCase() }}
                    </span>
                    <span
                      class="text-xs"
                      :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
                    >
                      {{ subtitle.startTime }}s - {{ subtitle.endTime }}s
                    </span>
                  </div>
                  <p>{{ subtitle.text }}</p>
                </div>
                <button
                  @click="handleDeleteSubtitle(subtitle.id)"
                  class="ml-4 text-red-600 hover:text-red-700"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Audio Player Modal -->
      <div
        v-if="selectedAudio"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeAudioPlayer"
      >
        <div
          class="rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          :class="[themeStore.isDark ? 'bg-gray-900' : 'bg-white']"
        >
          <div
            class="sticky top-0 flex items-center justify-between p-4 border-b"
            :class="[
              themeStore.isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white',
            ]"
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
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useProjectStore } from '@/stores/project'
import { audioApi, subtitlesApi } from '@/api/handlers'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import FileUpload from '@/components/FileUpload.vue'
import VoiceRecorder from '@/components/VoiceRecorder.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const projectStore = useProjectStore()

const activeTab = ref('upload')
const loading = ref(false)
const audioFiles = ref([])
const subtitles = ref([])
const selectedAudio = ref(null)
const audioUrl = ref(null)

onMounted(async () => {
  await loadProjectData()
})

onBeforeUnmount(() => {
  // Очищаємо blob URL при видаленні компонента
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
})

async function loadProjectData() {
  loading.value = true
  try {
    // Завантажуємо поточний проект
    if (!projectStore.currentProject) {
      await projectStore.fetchCurrentProject()
    }

    // Завантажуємо аудіофайли
    audioFiles.value = await audioApi.getAll()

    // Завантажуємо субтитри
    subtitles.value = await subtitlesApi.getAll()
  } catch (error) {
    console.error('Error loading project data:', error)
  } finally {
    loading.value = false
  }
}

async function handleFileSelected(file) {
  try {
    const uploaded = await audioApi.uploadRaw(file)
    audioFiles.value.push(uploaded)
  } catch (error) {
    console.error('Error uploading file:', error)
  }
}

async function handleRecordingComplete(file, blob) {
  try {
    const uploaded = await audioApi.uploadRaw(file)
    audioFiles.value.push(uploaded)
  } catch (error) {
    console.error('Error uploading recording:', error)
  }
}

async function handleGenerateSubtitles(audioId) {
  try {
    await subtitlesApi.generate(audioId) // Генерує субтитри для аудіофайлу
    // Перезавантажуємо субтитри
    subtitles.value = await subtitlesApi.getAll()
  } catch (error) {
    console.error('Error generating subtitles:', error)
  }
}

async function handleDeleteAudio(audioId) {
  if (confirm(t('project.confirmDeleteAudio'))) {
    try {
      await audioApi.delete(audioId)
      audioFiles.value = audioFiles.value.filter((a) => a.id !== audioId)
    } catch (error) {
      console.error('Error deleting audio:', error)
    }
  }
}

async function handleDeleteSubtitle(subtitleId) {
  if (confirm(t('project.confirmDeleteSubtitle'))) {
    try {
      await subtitlesApi.delete(subtitleId)
      subtitles.value = subtitles.value.filter((s) => s.id !== subtitleId)
    } catch (error) {
      console.error('Error deleting subtitle:', error)
    }
  }
}

async function handleEditAudio(audio) {
  try {
    selectedAudio.value = audio

    // Використовуємо fileName з об'єкта audio (це UUID ім'я файлу, наприклад: 1d8e69f9-2772-4483-93bb-f54079365125.wav)
    let fileName = audio.fileName

    // Якщо fileName відсутнє, отримуємо інформацію про файл
    if (!fileName) {
      const audioInfo = await audioApi.getInfo(audio.id)
      fileName = audioInfo.fileName
    }

    if (!fileName) {
      throw new Error('Could not determine file name (fileName field is missing)')
    }

    // Завантажуємо файл як blob через API
    // Це обходить проблеми з проксі та stream
    const blob = await audioApi.getFile(fileName)
    audioUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error loading audio for player:', error)
    // Якщо не вдалося завантажити через API, спробуємо прямий URL
    const fileName = audio.fileName
    if (fileName) {
      audioUrl.value = `/api/audio/${encodeURIComponent(fileName)}`
    } else {
      console.error('No fileName available in audio object')
    }
  }
}

function closeAudioPlayer() {
  // Очищаємо blob URL, щоб звільнити пам'ять
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
  selectedAudio.value = null
  audioUrl.value = null
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
