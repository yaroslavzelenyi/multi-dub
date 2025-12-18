<template>
  <div class="step-upload">
    <h2 class="text-2xl font-bold mb-6">{{ $t('workflow.steps.upload.title') }}</h2>
    <p class="mb-8" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
      {{ $t('workflow.steps.upload.description') }}
    </p>

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
    <div v-if="activeTab === 'upload'" class="mb-8">
      <div v-if="!pendingFile">
        <FileUpload @file-selected="handleFileSelected" />
      </div>
      <div v-else class="space-y-4">
        <!-- Audio Editor -->
        <AudioEditor
          :audio-url="pendingFileUrl"
          :audio-file="pendingFile"
          @audio-updated="handleFileAudioUpdated"
        />

        <!-- Upload Actions -->
        <div class="flex justify-end gap-3">
          <button
            @click="cancelPendingFile"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-colors',
              themeStore.isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="uploadPendingFile"
            :disabled="isUploading"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            <span v-if="isUploading">{{ $t('workflow.uploading') }}</span>
            <span v-else>{{ $t('workflow.upload') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Record Content -->
    <div v-else-if="activeTab === 'record'" class="mb-8">
      <div v-if="!pendingRecording">
        <VoiceRecorder @recording-complete="handleRecordingComplete" />
      </div>
      <div v-else class="space-y-4">
        <!-- Audio Editor -->
        <AudioEditor
          :audio-url="pendingRecordingUrl"
          :audio-file="pendingRecording"
          @audio-updated="handleRecordingAudioUpdated"
        />

        <!-- Upload Actions -->
        <div class="flex justify-end gap-3">
          <button
            @click="cancelPendingRecording"
            :class="[
              'px-6 py-3 rounded-lg font-medium transition-colors',
              themeStore.isDark
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="uploadPendingRecording"
            :disabled="isUploading"
            class="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
          >
            <span v-if="isUploading">{{ $t('workflow.uploading') }}</span>
            <span v-else>{{ $t('workflow.upload') }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Audio List -->
    <div v-if="audioFiles.length > 0" class="mt-8">
      <h3 class="text-lg font-semibold mb-4">{{ $t('project.uploadedFiles') }}</h3>
      <div class="space-y-3">
        <div
          v-for="audio in audioFiles"
          :key="audio.id"
          class="p-4 rounded-lg border flex justify-between items-center"
          :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 rounded-lg flex items-center justify-center"
              :class="[themeStore.isDark ? 'bg-gray-700' : 'bg-gray-200']"
            >
              <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div>
              <h4 class="font-medium">{{ audio.name }}</h4>
              <p class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                {{ formatFileSize(audio.size) }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <button
              @click="handlePlayAudio(audio)"
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
            <button
              @click="handleDeleteAudio(audio.id)"
              class="p-2 rounded-lg transition-colors text-red-600 hover:bg-red-600/10"
              :title="$t('common.delete')"
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

      <!-- Complete Step Button -->
      <button
        @click="completeStep"
        class="mt-6 w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        {{ $t('workflow.steps.upload.complete') }}
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-else
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
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
        />
      </svg>
      <p>{{ $t('workflow.steps.upload.empty') }}</p>
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
          <AudioPlayer
            v-if="audioUrl"
            ref="audioPlayerRef"
            :audio-url="audioUrl"
            :file-name="selectedAudio.name"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { audioApi } from '@/api/handlers'
import FileUpload from '@/components/FileUpload.vue'
import VoiceRecorder from '@/components/VoiceRecorder.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import AudioEditor from '@/components/AudioEditor.vue'

const { t } = useI18n()
const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const activeTab = ref('upload')
const audioFiles = ref([])
const selectedAudio = ref(null)
const audioUrl = ref(null)
const audioPlayerRef = ref(null)

// Pending file states
const pendingFile = ref(null)
const pendingFileUrl = ref(null)
const pendingRecording = ref(null)
const pendingRecordingUrl = ref(null)
const isUploading = ref(false)

onMounted(async () => {
  await loadAudioFiles()
})

onBeforeUnmount(() => {
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
  if (pendingFileUrl.value && pendingFileUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(pendingFileUrl.value)
  }
  if (pendingRecordingUrl.value && pendingRecordingUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(pendingRecordingUrl.value)
  }
})

async function loadAudioFiles() {
  try {
    audioFiles.value = await audioApi.getAllRaw()

    // Якщо є файли і крок ще не завершений, можна автоматично завершити
    if (audioFiles.value.length > 0 && !workflowStore.isStepCompleted('upload')) {
      workflowStore.completeStep('upload', { audioFiles: audioFiles.value })
    }
  } catch (error) {
    console.error('Error loading audio files:', error)
  }
}

function handleFileSelected(file) {
  pendingFile.value = file
  pendingFileUrl.value = URL.createObjectURL(file)
}

function handleRecordingComplete(file) {
  pendingRecording.value = file
  pendingRecordingUrl.value = URL.createObjectURL(file)
}

function cancelPendingFile() {
  if (pendingFileUrl.value && pendingFileUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(pendingFileUrl.value)
  }
  pendingFile.value = null
  pendingFileUrl.value = null
}

function cancelPendingRecording() {
  if (pendingRecordingUrl.value && pendingRecordingUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(pendingRecordingUrl.value)
  }
  pendingRecording.value = null
  pendingRecordingUrl.value = null
}

function handleFileAudioUpdated(blob) {
  // Оновлюємо файл на відредаговану версію (WAV)
  const originalName = pendingFile.value?.name || 'edited-audio.wav'
  const fileName = originalName.replace(/\.[^/.]+$/, '.wav')
  pendingFile.value = new File([blob], fileName, { type: 'audio/wav' })

  // Оновлюємо URL для waveform
  if (pendingFileUrl.value && pendingFileUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(pendingFileUrl.value)
  }
  pendingFileUrl.value = URL.createObjectURL(blob)
}

function handleRecordingAudioUpdated(blob) {
  // Оновлюємо запис на відредаговану версію (WAV)
  const originalName = pendingRecording.value?.name || 'edited-recording.wav'
  const fileName = originalName.replace(/\.[^/.]+$/, '.wav')
  pendingRecording.value = new File([blob], fileName, { type: 'audio/wav' })

  // Оновлюємо URL для waveform
  if (pendingRecordingUrl.value && pendingRecordingUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(pendingRecordingUrl.value)
  }
  pendingRecordingUrl.value = URL.createObjectURL(blob)
}

async function uploadPendingFile() {
  if (!pendingFile.value) return

  try {
    isUploading.value = true

    console.log(
      `${t('upload.uploadingFile')}: ${pendingFile.value.name}, ${t('analysis.size')}: ${(pendingFile.value.size / 1024 / 1024).toFixed(2)} MB`,
    )

    const uploaded = await audioApi.uploadRaw(pendingFile.value)
    audioFiles.value.push(uploaded)

    // Clean up
    cancelPendingFile()
  } catch (error) {
    console.error('Error uploading file:', error)
  } finally {
    isUploading.value = false
  }
}

async function uploadPendingRecording() {
  if (!pendingRecording.value) return

  try {
    isUploading.value = true

    console.log(
      `${t('upload.uploadingRecording')}: ${pendingRecording.value.name}, ${t('analysis.size')}: ${(pendingRecording.value.size / 1024 / 1024).toFixed(2)} MB`,
    )

    const uploaded = await audioApi.uploadRaw(pendingRecording.value)
    audioFiles.value.push(uploaded)

    // Clean up
    cancelPendingRecording()
  } catch (error) {
    console.error('Error uploading recording:', error)
  } finally {
    isUploading.value = false
  }
}

async function handlePlayAudio(audio) {
  try {
    selectedAudio.value = audio
    let fileName = audio.fileName

    if (!fileName) {
      const audioInfo = await audioApi.getInfo(audio.id)
      fileName = audioInfo.fileName
    }

    if (!fileName) {
      throw new Error('Could not determine file name')
    }

    const blob = await audioApi.getFile(fileName)
    audioUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error loading audio:', error)
  }
}

function closeAudioPlayer() {
  // Зупиняємо відтворення перед закриттям
  if (audioPlayerRef.value && audioPlayerRef.value.stop) {
    audioPlayerRef.value.stop()
  }

  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
  selectedAudio.value = null
  audioUrl.value = null
}

async function handleDeleteAudio(audioId) {
  if (confirm(t('upload.confirmDelete'))) {
    try {
      await audioApi.delete(audioId)
      audioFiles.value = audioFiles.value.filter((a) => a.id !== audioId)
    } catch (error) {
      console.error('Error deleting audio:', error)
    }
  }
}

function completeStep() {
  workflowStore.completeStep('upload', { audioFiles: audioFiles.value })
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
