<script setup lang="ts">
const mobileSidebarVisible = useState('mobile-sidebar-visible', () => false)
const activeView = useActiveView()
</script>

<template>
  <div class="w-screen h-dvh flex flex-col overflow-hidden">
    <Sidebar />

    <!-- sidebar overlay -->
    <div
      v-if="mobileSidebarVisible"
      class="z-[9] w-screen h-dvh fixed inset-0 md:hidden"
      @click="mobileSidebarVisible = false"
    />

    <div
      class="flex-1 flex flex-col transition-all duration-300 ml-0 md:ml-64 lg:ml-72 bg-gray-100 dark:bg-gray-900"
      :class="mobileSidebarVisible ? 'scale-95' : ''"
    >
      <!-- small screen topbar  -->
      <div class="w-full flex md:hidden px-4 py-2 items-center justify-between border-b border-gray-200/50 dark:border-gray-800/50">
        <UButton
          square
          variant="link"
          color="gray"
          size="xl"
          :padded="false"
          icon="i-heroicons-bars-3"
          class="-ml-0.5"
          @click="mobileSidebarVisible = true"
        />
      </div>
      <!-- main content -->
      <div class="w-full h-full flex-1 flex-col" :class="activeView === 'terminal' ? 'flex' : 'hidden'">
        <TerminalView />
      </div>
    </div>

    <UNotifications />
    <ConfirmationDialog />
  </div>
</template>
