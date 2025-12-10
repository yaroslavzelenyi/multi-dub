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
          <div>
            <h1
              class="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent"
            >
              {{ $t('app.title') }}
            </h1>
            <p
              class="mt-1 text-sm transition-colors duration-200"
              :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
            >
              {{ $t('app.subtitle') }}
            </p>
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
      <!-- Error Message -->
      <div
        v-if="projectStore.error"
        class="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg"
      >
        <p class="text-red-500">{{ projectStore.error }}</p>
      </div>

      <!-- Create Project Button -->
      <div class="mb-8 flex justify-between items-center">
        <h2 class="text-2xl font-semibold">{{ $t('projects.myProjects') }}</h2>
        <button
          @click="showCreateModal = true"
          class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          {{ $t('projects.createNew') }}
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="projectStore.loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="!projectStore.hasProjects"
        class="text-center py-20"
        :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
      >
        <svg
          class="mx-auto h-24 w-24 mb-4"
          :class="[themeStore.isDark ? 'text-gray-700' : 'text-gray-300']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 class="text-xl font-medium mb-2">{{ $t('projects.noProjects') }}</h3>
        <p class="mb-6">{{ $t('projects.createFirst') }}</p>
        <button
          @click="showCreateModal = true"
          class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
        >
          {{ $t('projects.createNew') }}
        </button>
      </div>

      <!-- Projects Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="project in projectStore.projects"
          :key="project.id"
          @click="handleSelectProject(project.id)"
          class="p-6 rounded-lg border cursor-pointer transition-all hover:shadow-lg"
          :class="[
            themeStore.isDark
              ? 'bg-gray-900 border-gray-800 hover:border-violet-600'
              : 'bg-white border-gray-200 hover:border-violet-600',
          ]"
        >
          <h3 class="text-xl font-semibold mb-2">{{ project.name }}</h3>
          <p
            class="text-sm mb-4 line-clamp-2"
            :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
          >
            {{ project.description || $t('projects.noDescription') }}
          </p>
          <div
            class="flex items-center justify-between text-xs"
            :class="[themeStore.isDark ? 'text-gray-500' : 'text-gray-500']"
          >
            <span>{{ $t('projects.created') }}: {{ formatDate(project.creationTime) }}</span>
            <span>{{ $t('projects.edited') }}: {{ formatDate(project.editedTime) }}</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Project Modal -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showCreateModal = false"
    >
      <div
        class="p-6 rounded-lg max-w-md w-full mx-4"
        :class="[themeStore.isDark ? 'bg-gray-900' : 'bg-white']"
      >
        <h3 class="text-xl font-semibold mb-4">{{ $t('projects.createNew') }}</h3>
        <form @submit.prevent="handleCreateProject">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">{{ $t('projects.projectName') }}</label>
            <input
              v-model="newProject.name"
              type="text"
              required
              class="w-full px-4 py-2 rounded-lg border transition-colors"
              :class="[
                themeStore.isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900',
              ]"
              :placeholder="$t('projects.projectNamePlaceholder')"
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium mb-2">{{
              $t('projects.projectDescription')
            }}</label>
            <textarea
              v-model="newProject.description"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border transition-colors"
              :class="[
                themeStore.isDark
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-300 text-gray-900',
              ]"
              :placeholder="$t('projects.projectDescriptionPlaceholder')"
            ></textarea>
          </div>
          <div class="flex gap-3">
            <button
              type="button"
              @click="showCreateModal = false"
              class="flex-1 px-4 py-2 rounded-lg transition-colors"
              :class="[
                themeStore.isDark
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-100'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900',
              ]"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
            >
              {{ $t('common.create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/stores/theme'
import { useProjectStore } from '@/stores/project'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'

const { t } = useI18n()
const router = useRouter()
const themeStore = useThemeStore()
const projectStore = useProjectStore()

const showCreateModal = ref(false)
const newProject = ref({
  name: '',
  description: '',
})

onMounted(async () => {
  await projectStore.fetchProjects()
})

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

async function handleSelectProject(projectId) {
  try {
    await projectStore.selectProject(projectId)
    router.push({ name: 'project', params: { id: projectId } })
  } catch (error) {
    console.error('Error selecting project:', error)
  }
}

async function handleCreateProject() {
  try {
    const project = await projectStore.createProject(newProject.value)
    showCreateModal.value = false
    newProject.value = { name: '', description: '' }
    // Відразу вибираємо новий проект
    await handleSelectProject(project.id)
  } catch (error) {
    console.error('Error creating project:', error)
  }
}
</script>
