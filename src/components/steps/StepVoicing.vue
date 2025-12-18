<template>
  <div class="step-voicing">
    <h2 class="text-2xl font-bold mb-6">{{ $t('workflow.steps.voicing.title') }}</h2>
    <p class="mb-8" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
      Завантажте озвучені переклади субтитрів або запишіть їх через мікрофон, а потім прив'яжіть до потрібних місць у вихідному аудіо.
    </p>

    <!-- Current Audio Info -->
    <div v-if="currentAudio" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Оригінальне аудіо</h3>
      <div
        class="flex items-center p-4 rounded-lg border"
        :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
      >
        <div class="flex-1">
          <h4 class="font-medium">{{ currentAudio.name }}</h4>
          <p class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
            {{ formatFileSize(currentAudio.size) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Audio Player with Regions and Subtitles -->
    <div v-if="audioUrl && translatedSubtitles.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Перекладені субтитри</h3>
      <div
        class="p-6 rounded-lg border"
        :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
      >
        <!-- Audio Player with Regions -->
        <div class="mb-6">
          <AudioPlayerWithRegions
            ref="audioPlayerRef"
            :audio-url="audioUrl"
            :file-name="currentAudio?.name"
            :regions="prepareRegions()"
            :active-region-id="activeSubtitleId"
            @region-click="handleRegionClick"
          />
        </div>

        <!-- Subtitles List -->
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="subtitle in translatedSubtitles"
            :key="subtitle.id"
            @click="toggleSubtitleSelection(subtitle.id)"
            class="p-3 rounded-lg cursor-pointer transition-all"
            :class="[
              selectedSubtitle === subtitle.id
                ? 'bg-violet-600/30 border-2 border-violet-500 shadow-lg shadow-violet-500/50'
                : activeSubtitleId === subtitle.id
                  ? 'bg-blue-600/20 border-2 border-blue-500'
                  : themeStore.isDark
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-white hover:bg-gray-50',
            ]"
          >
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <input
                  type="radio"
                  :checked="selectedSubtitle === subtitle.id"
                  @click.stop="toggleSubtitleSelection(subtitle.id)"
                  class="w-4 h-4 border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <span class="text-xs" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                  {{ formatTime(subtitle.startTime) }} - {{ formatTime(subtitle.endTime) }}
                </span>
              </div>
              <span
                v-if="getSubtitleMappings(subtitle.id).length > 0"
                class="text-xs px-2 py-1 rounded-full bg-green-600 text-white"
              >
                {{ getSubtitleMappings(subtitle.id).length }} озвучок
              </span>
            </div>
            <p class="text-sm">{{ subtitle.text }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload or Record Audio -->
    <div v-if="selectedSubtitle" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Озвучка вибраного субтитру</h3>
      <div
        class="p-6 rounded-lg border"
        :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
      >
        <p class="mb-4" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
          Вибрано субтитр: {{ translatedSubtitles.find(s => s.id === selectedSubtitle)?.text }}
        </p>

        <div class="flex gap-4">
          <label
            class="flex-1 px-6 py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors cursor-pointer text-center"
          >
            <input
              type="file"
              accept="audio/*"
              @change="handleAudioUpload"
              class="hidden"
              :disabled="uploading"
            />
            <span v-if="uploading">Завантаження...</span>
            <span v-else>📁 Завантажити аудіо</span>
          </label>

          <button
            @click="startRecording"
            class="flex-1 px-6 py-4 rounded-lg font-medium transition-colors"
            :class="[
              recording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white',
            ]"
          >
            {{ recording ? '⏹️ Зупинити запис' : '🎤 Записати через мікрофон' }}
          </button>
        </div>

        <div v-if="recording" class="mt-4 p-4 bg-red-600/20 rounded-lg">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span class="text-red-600 font-medium">Запис... {{ recordingTime }}с</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Created Mappings -->
    <div v-if="mappings.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Створені маппінги ({{ mappings.length }})</h3>
      <div class="space-y-3">
        <div
          v-for="mapping in mappings"
          :key="mapping.id"
          class="p-4 rounded-lg border flex justify-between items-center"
          :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs px-2 py-1 rounded bg-violet-600 text-white">
                Dubbed Audio #{{ mapping.fromAudio }}
              </span>
              <span class="text-xs" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                {{ formatTime(mapping.fromStartTime) }} - {{ formatTime(mapping.fromEndTime) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs">→</span>
              <span class="text-xs px-2 py-1 rounded bg-blue-600 text-white">
                Original Audio
              </span>
              <span class="text-xs" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
                з {{ formatTime(mapping.toStartTime) }}
              </span>
            </div>
          </div>
          <button
            @click="deleteMapping(mapping.id)"
            class="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-500/20"
            title="Видалити"
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

    <!-- Produce Final Audio -->
    <div v-if="mappings.length > 0" class="mb-8">
      <button
        @click="produceOutput"
        :disabled="producing"
        class="w-full px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
        :class="[
          !producing
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed',
        ]"
      >
        <svg v-if="producing" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
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
        <span v-if="producing">Створення фінального аудіо...</span>
        <span v-else>🎬 Створити фінальне аудіо</span>
      </button>
    </div>

    <!-- Output Files -->
    <div v-if="outputFiles.length > 0" class="mb-8">
      <h3 class="text-lg font-semibold mb-4">Готові файли</h3>
      <div class="space-y-3">
        <div
          v-for="output in outputFiles"
          :key="output.id"
          class="p-4 rounded-lg border flex justify-between items-center"
          :class="[themeStore.isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50']"
        >
          <div>
            <h4 class="font-medium">{{ output.name }}</h4>
            <p class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
              {{ formatFileSize(output.size) }}
            </p>
          </div>
          <button
            @click="playOutput(output)"
            class="p-2 rounded-lg transition-colors"
            :class="[
              themeStore.isDark
                ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
                : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900',
            ]"
            title="Відтворити"
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

      <!-- Complete Step Button -->
      <button
        @click="completeStep"
        class="mt-6 w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
      >
        Завершити крок
      </button>
    </div>

    <!-- Audio Player Modal -->
    <div
      v-if="selectedOutput"
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
          <h3 class="text-lg font-semibold">{{ selectedOutput.name }}</h3>
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
          <AudioPlayerWithRegions
            v-if="outputAudioUrl"
            :audio-url="outputAudioUrl"
            :file-name="selectedOutput.name"
            :regions="[]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { useWorkflowStore } from '@/stores/workflow'
import { subtitlesApi, audioApi, mappingsApi } from '@/api/handlers'
import AudioPlayerWithRegions from '@/components/AudioPlayerWithRegions.vue'

const themeStore = useThemeStore()
const workflowStore = useWorkflowStore()

const currentAudio = ref(null)
const translatedSubtitles = ref([])
const selectedSubtitle = ref(null) // Змінено на одиночний вибір
const activeSubtitleId = ref(null)
const mappings = ref([])
const outputFiles = ref([])
const audioUrl = ref('')
const uploading = ref(false)
const recording = ref(false)
const recordingTime = ref(0)
const producing = ref(false)
const mediaRecorder = ref(null)
const recordedChunks = ref([])
const recordingInterval = ref(null)
const selectedOutput = ref(null)
const outputAudioUrl = ref('')
const audioPlayerRef = ref(null)

onMounted(async () => {
  await loadData()
})

onBeforeUnmount(() => {
  if (audioUrl.value && audioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(audioUrl.value)
  }
  if (outputAudioUrl.value && outputAudioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(outputAudioUrl.value)
  }
  if (recordingInterval.value) {
    clearInterval(recordingInterval.value)
  }
})

async function loadData() {
  try {
    // Отримуємо перший аудіофайл з попереднього кроку
    const uploadData = workflowStore.getStepData('upload')
    if (uploadData?.audioFiles && uploadData.audioFiles.length > 0) {
      currentAudio.value = uploadData.audioFiles[0]
    }

    // Завантажуємо всі субтитри
    const allSubtitles = await subtitlesApi.getAll()

    // Фільтруємо українські субтитри
    translatedSubtitles.value = allSubtitles.filter(
      (s) => s.language === 'uk' && s.forAudio === currentAudio.value?.id,
    )

    // Завантажуємо аудіофайл для плеєра
    await loadAudioFile()

    // Завантажуємо існуючі маппінги
    if (currentAudio.value) {
      mappings.value = await mappingsApi.getAllForFile(currentAudio.value.id)
    }

    // Завантажуємо вихідні файли
    if (currentAudio.value) {
      outputFiles.value = await mappingsApi.getOutputsForAudio(currentAudio.value.id)
      if (outputFiles.value.length > 0) {
        workflowStore.completeStep('voicing', { outputs: outputFiles.value })
      }
    }
  } catch (error) {
    console.error('Error loading data:', error)
  }
}

async function loadAudioFile() {
  try {
    if (!currentAudio.value) return

    let fileName = currentAudio.value.fileName

    if (!fileName) {
      const audioInfo = await audioApi.getInfo(currentAudio.value.id)
      fileName = audioInfo.fileName
    }

    if (!fileName) {
      console.error('Could not determine file name for audio')
      return
    }

    const blob = await audioApi.getFile(fileName)
    audioUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error loading audio file:', error)
  }
}

function prepareRegions() {
  return translatedSubtitles.value.map((subtitle) => {
    // Перевіряємо, чи є озвучка для цього субтитру
    const hasDubbing = getSubtitleMappings(subtitle.id).length > 0

    return {
      id: subtitle.id,
      startTime: subtitle.startTime,
      endTime: subtitle.endTime,
      label: subtitle.text,
      text: subtitle.text,
      // Зелений колір для озвучених, фіолетовий для неозвучених
      color: hasDubbing ? 'rgba(34, 197, 94, 0.5)' : 'rgba(139, 92, 246, 0.5)',
    }
  })
}

function handleRegionClick(region) {
  activeSubtitleId.value = activeSubtitleId.value === region.id ? null : region.id

  // Переходимо до часу регіону
  if (region.id && audioPlayerRef.value && audioPlayerRef.value.seekTo) {
    audioPlayerRef.value.seekTo(region.startTime)
  }
}

function toggleSubtitleSelection(subtitleId) {
  // Якщо клікнули на вже вибраний субтитр, знімаємо вибір
  if (selectedSubtitle.value === subtitleId) {
    selectedSubtitle.value = null
  } else {
    // Інакше вибираємо цей субтитр
    selectedSubtitle.value = subtitleId

    // Переходимо до часу субтитра
    const subtitle = translatedSubtitles.value.find((s) => s.id === subtitleId)
    if (subtitle && audioPlayerRef.value && audioPlayerRef.value.seekTo) {
      audioPlayerRef.value.seekTo(subtitle.startTime)
    }
  }
}

function getSubtitleMappings(subtitleId) {
  const subtitle = translatedSubtitles.value.find((s) => s.id === subtitleId)
  if (!subtitle) return []

  return mappings.value.filter(
    (m) => m.toStartTime >= subtitle.startTime && m.toStartTime < subtitle.endTime,
  )
}

async function handleAudioUpload(event) {
  const file = event.target.files[0]
  if (!file || !selectedSubtitle.value) return

  try {
    uploading.value = true

    // Завантажуємо файл як dubbed audio
    const dubbedAudio = await audioApi.uploadDubbed(file)

    // Створюємо маппінг для вибраного субтитру
    const subtitle = translatedSubtitles.value.find((s) => s.id === selectedSubtitle.value)
    if (subtitle) {
      const mapping = await mappingsApi.create({
        fromAudio: dubbedAudio.id,
        fromStartTime: 0,
        fromEndTime: dubbedAudio.duration || subtitle.endTime - subtitle.startTime,
        toAudio: currentAudio.value.id,
        toStartTime: subtitle.startTime,
      })

      mappings.value.push(mapping)
    }

    // Очищаємо вибір
    selectedSubtitle.value = null
    event.target.value = ''
  } catch (error) {
    console.error('Error uploading audio:', error)
  } finally {
    uploading.value = false
  }
}

async function startRecording() {
  if (recording.value) {
    stopRecording()
    return
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder.value = new MediaRecorder(stream)
    recordedChunks.value = []

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = async () => {
      const blob = new Blob(recordedChunks.value, { type: 'audio/webm' })
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' })

      // Завантажуємо запис
      await uploadRecordedAudio(file)

      // Зупиняємо всі треки
      stream.getTracks().forEach((track) => track.stop())
    }

    mediaRecorder.value.start()
    recording.value = true
    recordingTime.value = 0

    recordingInterval.value = setInterval(() => {
      recordingTime.value++
    }, 1000)
  } catch (error) {
    console.error('Error starting recording:', error)
  }
}

function stopRecording() {
  if (mediaRecorder.value && recording.value) {
    mediaRecorder.value.stop()
    recording.value = false
    if (recordingInterval.value) {
      clearInterval(recordingInterval.value)
    }
  }
}

async function uploadRecordedAudio(file) {
  if (!selectedSubtitle.value) return

  try {
    uploading.value = true

    // Завантажуємо файл як dubbed audio
    const dubbedAudio = await audioApi.uploadDubbed(file)

    // Створюємо маппінг для вибраного субтитру
    const subtitle = translatedSubtitles.value.find((s) => s.id === selectedSubtitle.value)
    if (subtitle) {
      const mapping = await mappingsApi.create({
        fromAudio: dubbedAudio.id,
        fromStartTime: 0,
        fromEndTime: dubbedAudio.duration || subtitle.endTime - subtitle.startTime,
        toAudio: currentAudio.value.id,
        toStartTime: subtitle.startTime,
      })

      mappings.value.push(mapping)
    }

    // Очищаємо вибір
    selectedSubtitle.value = null
  } catch (error) {
    console.error('Error uploading recorded audio:', error)
  } finally {
    uploading.value = false
  }
}

async function deleteMapping(mappingId) {
  try {
    await mappingsApi.delete(mappingId)
    mappings.value = mappings.value.filter((m) => m.id !== mappingId)
  } catch (error) {
    console.error('Error deleting mapping:', error)
  }
}

async function produceOutput() {
  if (!currentAudio.value) return

  try {
    producing.value = true
    await mappingsApi.produceOutput(currentAudio.value.id)

    // Перезавантажуємо вихідні файли
    outputFiles.value = await mappingsApi.getOutputsForAudio(currentAudio.value.id)
  } catch (error) {
    console.error('Error producing output:', error)
  } finally {
    producing.value = false
  }
}

async function playOutput(output) {
  try {
    selectedOutput.value = output

    // Завантажуємо аудіофайл
    const blob = await audioApi.getFile(output.fileName)
    outputAudioUrl.value = URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error playing output:', error)
  }
}

function closeAudioPlayer() {
  if (outputAudioUrl.value && outputAudioUrl.value.startsWith('blob:')) {
    URL.revokeObjectURL(outputAudioUrl.value)
  }
  selectedOutput.value = null
  outputAudioUrl.value = ''
}

function completeStep() {
  workflowStore.completeStep('voicing', {
    mappings: mappings.value,
    outputs: outputFiles.value,
  })
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}
</script>
