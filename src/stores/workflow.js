import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useWorkflowStore = defineStore('workflow', () => {
  // Кроки процесу дубляжу
  const steps = [
    { id: 1, key: 'upload', name: 'Завантаження аудіо', completed: false },
    { id: 2, key: 'diarization', name: 'Діаризація', completed: false },
    { id: 3, key: 'subtitles', name: 'Генерація субтитрів', completed: false },
    { id: 4, key: 'translation', name: 'Переклад субтитрів', completed: false },
    { id: 5, key: 'voicing', name: 'Озвучення', completed: false },
    { id: 6, key: 'export', name: 'Експорт проекту', completed: false },
  ]

  const currentStep = ref(1)
  const stepStatuses = ref({
    upload: { completed: false, data: null },
    diarization: { completed: false, data: null },
    subtitles: { completed: false, data: null },
    translation: { completed: false, data: null },
    voicing: { completed: false, data: null },
    export: { completed: false, data: null },
  })

  // Computed
  const currentStepInfo = computed(() => {
    return steps.find((step) => step.id === currentStep.value)
  })

  const canGoNext = computed(() => {
    const current = steps.find((step) => step.id === currentStep.value)
    return current && stepStatuses.value[current.key].completed
  })

  const canGoPrevious = computed(() => {
    return currentStep.value > 1
  })

  const progress = computed(() => {
    const completedSteps = Object.values(stepStatuses.value).filter((s) => s.completed).length
    return Math.round((completedSteps / steps.length) * 100)
  })

  // Actions
  function nextStep() {
    if (currentStep.value < steps.length && canGoNext.value) {
      currentStep.value++
    }
  }

  function previousStep() {
    if (currentStep.value > 1) {
      currentStep.value--
    }
  }

  function goToStep(stepId) {
    if (stepId >= 1 && stepId <= steps.length) {
      currentStep.value = stepId
    }
  }

  function completeStep(stepKey, data = null) {
    if (stepStatuses.value[stepKey]) {
      stepStatuses.value[stepKey].completed = true
      stepStatuses.value[stepKey].data = data
    }
  }

  function uncompleteStep(stepKey) {
    if (stepStatuses.value[stepKey]) {
      stepStatuses.value[stepKey].completed = false
      stepStatuses.value[stepKey].data = null
    }
  }

  function resetWorkflow() {
    currentStep.value = 1
    Object.keys(stepStatuses.value).forEach((key) => {
      stepStatuses.value[key].completed = false
      stepStatuses.value[key].data = null
    })
  }

  function getStepData(stepKey) {
    return stepStatuses.value[stepKey]?.data
  }

  function isStepCompleted(stepKey) {
    return stepStatuses.value[stepKey]?.completed || false
  }

  return {
    steps,
    currentStep,
    stepStatuses,
    currentStepInfo,
    canGoNext,
    canGoPrevious,
    progress,
    nextStep,
    previousStep,
    goToStep,
    completeStep,
    uncompleteStep,
    resetWorkflow,
    getStepData,
    isStepCompleted,
  }
})
