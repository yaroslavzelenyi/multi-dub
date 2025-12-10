<template>
  <div
    @click="$emit('select', project.id)"
    class="cursor-pointer group border rounded-lg p-6 transition-all duration-200 hover:shadow-lg"
    :class="[
      themeStore.isDark
        ? 'bg-gray-900 border-gray-800 hover:border-violet-500'
        : 'bg-white border-gray-200 hover:border-violet-500',
    ]"
  >
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1 min-w-0">
        <h3
          class="text-lg font-semibold truncate group-hover:text-violet-500 transition-colors"
          :class="[themeStore.isDark ? 'text-gray-100' : 'text-gray-900']"
        >
          {{ project.name }}
        </h3>
        <p
          class="text-sm mt-1 line-clamp-2"
          :class="[themeStore.isDark ? 'text-gray-400' : 'text-gray-600']"
        >
          {{ project.description || $t('projects.noDescription') }}
        </p>
      </div>
      <FolderOpenIcon
        class="w-6 h-6 flex-shrink-0 ml-3 transition-transform group-hover:scale-110"
        :class="[themeStore.isDark ? 'text-gray-600' : 'text-gray-400']"
      />
    </div>

    <div
      class="flex items-center justify-between text-xs border-t pt-3"
      :class="[
        themeStore.isDark ? 'text-gray-500 border-gray-800' : 'text-gray-500 border-gray-200',
      ]"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-1">
          <CalendarIcon class="w-4 h-4" />
          <span>{{ formatDate(project.creationTime) }}</span>
        </div>
        <div class="flex items-center gap-1">
          <ClockIcon class="w-4 h-4" />
          <span>{{ formatDate(project.editedTime) }}</span>
        </div>
      </div>
      <ArrowRightIcon class="w-4 h-4 transition-transform group-hover:translate-x-1" />
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'
import { FolderOpenIcon, CalendarIcon, ClockIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

const themeStore = useThemeStore()

defineProps({
  project: {
    type: Object,
    required: true,
  },
})

defineEmits(['select'])

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}
</script>
