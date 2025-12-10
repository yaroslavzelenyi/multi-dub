import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

export const useProjectStore = defineStore('project', () => {
  const { API } = useApi()

  // State
  const projects = ref([])
  const currentProject = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Getters
  const hasProjects = computed(() => projects.value.length > 0)
  const currentProjectId = computed(() => currentProject.value?.id)
  const isProjectSelected = computed(() => currentProject.value !== null)

  // Actions
  async function fetchProjects() {
    loading.value = true
    error.value = null
    try {
      projects.value = await API.projects.getAll()
      return projects.value
    } catch (err) {
      error.value = err.message
      console.error('Error fetching projects:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function selectProject(projectId) {
    loading.value = true
    error.value = null
    try {
      await API.projects.select(projectId)
      currentProject.value = await API.projects.getCurrent()
      return currentProject.value
    } catch (err) {
      error.value = err.message
      console.error('Error selecting project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentProject() {
    loading.value = true
    error.value = null
    try {
      currentProject.value = await API.projects.getCurrent()
      return currentProject.value
    } catch (err) {
      error.value = err.message
      console.error('Error fetching current project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProject(data) {
    loading.value = true
    error.value = null
    try {
      const project = await API.projects.create(data)
      projects.value.unshift(project)
      return project
    } catch (err) {
      error.value = err.message
      console.error('Error creating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProject(data) {
    loading.value = true
    error.value = null
    try {
      const updatedProject = await API.projects.update(data)
      currentProject.value = updatedProject
      // Оновлюємо проект у списку
      const index = projects.value.findIndex((p) => p.id === updatedProject.id)
      if (index !== -1) {
        projects.value[index] = updatedProject
      }
      return updatedProject
    } catch (err) {
      error.value = err.message
      console.error('Error updating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function undoLastAction() {
    loading.value = true
    error.value = null
    try {
      currentProject.value = await API.projects.undo()
    } catch (err) {
      error.value = err.message
      console.error('Error undoing action:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function redoLastAction() {
    loading.value = true
    error.value = null
    try {
      currentProject.value = await API.projects.redo()
    } catch (err) {
      error.value = err.message
      console.error('Error redoing action:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearCurrentProject() {
    currentProject.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    projects,
    currentProject,
    loading,
    error,
    // Getters
    hasProjects,
    currentProjectId,
    isProjectSelected,
    // Actions
    fetchProjects,
    selectProject,
    fetchCurrentProject,
    createProject,
    updateProject,
    undoLastAction,
    redoLastAction,
    clearCurrentProject,
    clearError,
  }
})
