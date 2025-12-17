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

      <!-- Workflow Wizard -->
      <div v-else>
        <WorkflowWizard>
          <template #default="{ step }">
            <component :is="getStepComponent(step.key)" />
          </template>
        </WorkflowWizard>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useProjectStore } from '@/stores/project'
import { useWorkflowStore } from '@/stores/workflow'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import WorkflowWizard from '@/components/WorkflowWizard.vue'
import StepUpload from '@/components/steps/StepUpload.vue'
import StepDiarization from '@/components/steps/StepDiarization.vue'
import StepSubtitles from '@/components/steps/StepSubtitles.vue'
import StepTranslation from '@/components/steps/StepTranslation.vue'
import StepVoicing from '@/components/steps/StepVoicing.vue'
import StepConversion from '@/components/steps/StepConversion.vue'
import StepExport from '@/components/steps/StepExport.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const themeStore = useThemeStore()
const projectStore = useProjectStore()
const workflowStore = useWorkflowStore()

const loading = ref(false)

const stepComponents = {
  upload: StepUpload,
  diarization: StepDiarization,
  subtitles: StepSubtitles,
  translation: StepTranslation,
  voicing: StepVoicing,
  conversion: StepConversion,
  export: StepExport,
}

onMounted(async () => {
  await loadProjectData()
})

async function loadProjectData() {
  loading.value = true
  try {
    // Завантажуємо поточний проект
    if (!projectStore.currentProject) {
      await projectStore.fetchCurrentProject()
    }
  } catch (error) {
    console.error('Error loading project data:', error)
  } finally {
    loading.value = false
  }
}

function getStepComponent(stepKey) {
  return stepComponents[stepKey] || null
}
</script>
