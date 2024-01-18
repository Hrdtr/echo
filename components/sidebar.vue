<script setup lang="ts">
const mobileSidebarVisible = useState('mobile-sidebar-visible', () => false)
const activeView = useActiveView()
</script>

<template>
  <div>
    <div
      class="z-20 w-16 h-dvh fixed top-0 left-0 flex flex-col items-center gap-2 bg-gray-100 dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-800/50 transition-transform duration-300"
      :class="mobileSidebarVisible ? 'translate-x-0' : '-translate-x-16 md:translate-x-0'"
    >
      <div
        class="inline-flex h-16 w-16 items-center justify-center flex-shrink-0"
      >
        <img src="/icon-rounded.png" class="w-10 h-10">
      </div>
      <div
        class="flex-1 w-full flex flex-col items-center justify-between gap-2 overflow-hidden"
      >
        <div class="flex flex-col items-center gap-2 w-full overflow-y-auto">
          <UButton
            square
            variant="link"
            :color="activeView === 'terminal' ? 'primary' : 'gray'"
            size="lg"
            icon="i-heroicons-command-line"
            @click="activeView = 'terminal'"
          />
          <UButton
            square
            variant="link"
            :color="activeView === 'settings' ? 'primary' : 'gray'"
            size="lg"
            icon="i-heroicons-cog"
            @click="activeView = 'settings'"
          />
        </div>
        <div
          class="flex flex-col items-center gap-2 pt-4 pb-2 border-t border-gray-200/50 dark:border-gray-800/50 flex-shrink-0"
        >
          <ColorModeToggle
            square
            variant="link"
            color="gray"
            size="lg"
            class="opacity-70 hover:opacity-100"
          />
        </div>
      </div>
    </div>
  </div>
</template>
