<template>
  <div class="workflow-wizard">
    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-lg font-semibold">{{ $t('workflow.progress') }}</h3>
        <span class="text-sm" :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']">
          {{ workflowStore.progress }}%
        </span>
      </div>
      <div
        class="w-full h-2 rounded-full overflow-hidden"
        :class="[themeStore.isDark ? 'bg-gray-800' : 'bg-gray-200']"
      >
        <div
          class="h-full bg-gradient-to-r from-violet-600 to-purple-600 transition-all duration-500"
          :style="{ width: workflowStore.progress + '%' }"
        ></div>
      </div>
    </div>

    <!-- Steps Navigation -->
    <div class="grid grid-cols-6 gap-2 mb-8">
      <button
        v-for="step in workflowStore.steps"
        :key="step.id"
        @click="workflowStore.goToStep(step.id)"
        class="relative p-3 rounded-lg border-2 transition-all text-center"
        :class="[
          step.id === workflowStore.currentStep
            ? 'border-violet-600 bg-violet-600/10'
            : workflowStore.isStepCompleted(step.key)
              ? themeStore.isDark
                ? 'border-green-600 bg-green-600/10'
                : 'border-green-500 bg-green-500/10'
              : themeStore.isDark
                ? 'border-gray-700 bg-gray-800 hover:border-gray-600'
                : 'border-gray-300 bg-gray-100 hover:border-gray-400',
        ]"
      >
        <div class="flex flex-col items-center gap-1">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            :class="[
              step.id === workflowStore.currentStep
                ? 'bg-violet-600 text-white'
                : workflowStore.isStepCompleted(step.key)
                  ? 'bg-green-600 text-white'
                  : themeStore.isDark
                    ? 'bg-gray-700 text-gray-400'
                    : 'bg-gray-300 text-gray-600',
            ]"
          >
            <svg
              v-if="workflowStore.isStepCompleted(step.key)"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span v-else>{{ step.id }}</span>
          </div>
          <span
            class="text-xs font-medium"
            :class="[
              step.id === workflowStore.currentStep
                ? 'text-violet-600'
                : workflowStore.isStepCompleted(step.key)
                  ? 'text-green-600'
                  : themeStore.isDark
                    ? 'text-gray-400'
                    : 'text-gray-600',
            ]"
          >
            {{ step.name }}
          </span>
        </div>
      </button>
    </div>

    <!-- Step Content -->
    <div
      class="rounded-lg p-8 min-h-[400px]"
      :class="[themeStore.isDark ? 'bg-gray-900' : 'bg-white']"
    >
      <slot :step="workflowStore.currentStepInfo"></slot>
    </div>

    <!-- Navigation Buttons -->
    <div class="flex justify-between mt-6">
      <button
        @click="workflowStore.previousStep"
        :disabled="!workflowStore.canGoPrevious"
        class="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
        :class="[
          workflowStore.canGoPrevious
            ? themeStore.isDark
              ? 'bg-gray-800 hover:bg-gray-700 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50',
        ]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {{ $t('workflow.previous') }}
      </button>

      <button
        v-if="workflowStore.currentStep < workflowStore.steps.length"
        @click="workflowStore.nextStep"
        :disabled="!workflowStore.canGoNext"
        class="px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2"
        :class="[
          workflowStore.canGoNext
            ? 'bg-violet-600 hover:bg-violet-700 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50',
        ]"
      >
        {{ $t('workflow.next') }}
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useWorkflowStore } from '@/stores/workflow'
import { useThemeStore } from '@/stores/theme'

const workflowStore = useWorkflowStore()
const themeStore = useThemeStore()
</script>
