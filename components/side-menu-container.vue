<script setup lang="ts">
const searchKeyword = defineModel<string>('searchKeyword')

const mobileSidebarVisible = useState('mobile-sidebar-visible', () => false)
const searchInputRef = ref<{ $el?: HTMLElement }>()
defineShortcuts(searchKeyword.value !== undefined
  ? { meta_f: () => searchInputRef.value?.$el?.querySelector('input')?.focus() }
  : {})
</script>

<template>
  <div
    class="z-20 w-48 lg:w-56 h-dvh fixed top-0 left-16 flex flex-col items-start gap-2 bg-gray-100 dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300"
    :class="mobileSidebarVisible ? 'translate-x-0' : '-translate-x-64 md:translate-x-0'"
  >
    <div class="w-full flex-1 flex flex-col space-y-3 py-3 overflow-hidden">
      <div class="flex flex-row items-center justify-between space-x-2 px-3">
        <UInput
          v-if="searchKeyword !== undefined"
          ref="searchInputRef"
          v-model="searchKeyword"
          icon="i-heroicons-magnifying-glass-20-solid"
          size="sm"
          color="white"
          placeholder="Search..."
        />
        <slot name="action" />
      </div>

      <div class="flex-1 flex flex-col space-y-3 overflow-y-auto px-3">
        <slot />
      </div>
    </div>
  </div>
</template>
