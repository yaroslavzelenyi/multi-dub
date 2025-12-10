<template>
  <TransitionRoot :show="open" as="template">
    <Dialog as="div" class="relative z-50" @close="closeDialog">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/70" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-lg p-6 shadow-xl transition-all"
              :class="[themeStore.isDark ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900']"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-semibold mb-4"
                :class="[themeStore.isDark ? 'text-gray-100' : 'text-gray-900']"
              >
                {{ $t('projects.createNew') }}
              </DialogTitle>

              <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                  <label
                    for="name"
                    class="block text-sm font-medium mb-1"
                    :class="[themeStore.isDark ? 'text-gray-300' : 'text-gray-700']"
                  >
                    {{ $t('projects.projectName') }}
                  </label>
                  <input
                    id="name"
                    v-model="formData.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
                    :class="[
                      themeStore.isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900',
                    ]"
                    :placeholder="$t('projects.projectNamePlaceholder')"
                  />
                </div>

                <div>
                  <label
                    for="description"
                    class="block text-sm font-medium mb-1"
                    :class="[themeStore.isDark ? 'text-gray-300' : 'text-gray-700']"
                  >
                    {{ $t('projects.projectDescription') }}
                  </label>
                  <textarea
                    id="description"
                    v-model="formData.description"
                    rows="3"
                    class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none transition-colors"
                    :class="[
                      themeStore.isDark
                        ? 'bg-gray-800 border-gray-700 text-gray-100'
                        : 'bg-white border-gray-300 text-gray-900',
                    ]"
                    :placeholder="$t('projects.projectDescriptionPlaceholder')"
                  />
                </div>

                <div
                  v-if="error"
                  class="p-3 rounded-lg text-sm"
                  :class="[
                    themeStore.isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600',
                  ]"
                >
                  {{ error }}
                </div>

                <div class="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    @click="closeDialog"
                    class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                    :class="[
                      themeStore.isDark
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700',
                    ]"
                    :disabled="loading"
                  >
                    {{ $t('projects.cancel') }}
                  </button>
                  <button
                    type="submit"
                    class="px-4 py-2 text-sm font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    :disabled="loading"
                  >
                    <svg
                      v-if="loading"
                      class="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
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
                    <span>{{ loading ? $t('projects.creating') : $t('projects.create') }}</span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useProjectStore } from '@/stores/project'
import { useThemeStore } from '@/stores/theme'
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from '@headlessui/vue'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:open', 'created'])

const projectStore = useProjectStore()
const themeStore = useThemeStore()

const formData = ref({
  name: '',
  description: '',
})

const loading = ref(false)
const error = ref(null)

watch(
  () => props.open,
  (newValue) => {
    if (newValue) {
      formData.value = {
        name: '',
        description: '',
      }
      error.value = null
    }
  },
)

function closeDialog() {
  if (!loading.value) {
    emit('update:open', false)
  }
}

async function handleSubmit() {
  loading.value = true
  error.value = null

  try {
    const project = await projectStore.createProject(formData.value)
    emit('created', project)
    closeDialog()
  } catch (err) {
    error.value = err.message || 'Failed to create project'
  } finally {
    loading.value = false
  }
}
</script>
