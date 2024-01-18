<script setup lang="ts">
const mobileSidebarVisible = useState('mobile-sidebar-visible', () => false)
const activeView = useActiveView()

const sideMenuComponent = computed(() => {
  switch (activeView.value) {
    case 'settings':
      return resolveComponent('SettingsSideMenu')
    default:
      return resolveComponent('SideMenu')
  }
})
const viewComponent = computed(() => {
  switch (activeView.value) {
    case 'settings':
      return resolveComponent('SettingsView')
    case 'terminal':
      return resolveComponent('TerminalView')
    default:
      return null
  }
})
</script>

<template>
  <div class="w-full min-h-dvh flex flex-col">
    <Sidebar />

    <KeepAlive>
      <component :is="sideMenuComponent" />
    </KeepAlive>

    <!-- sidebar overlay -->
    <div v-if="mobileSidebarVisible" class="z-[19] w-screen h-dvh fixed inset-0 md:hidden" @click="mobileSidebarVisible = false" />

    <div class="flex-1 min-h-dvh flex flex-col pl-0 md:pl-64 lg:pl-72">
      <!-- main content -->
      <KeepAlive>
        <component :is="viewComponent" />
      </KeepAlive>
    </div>

    <UNotifications />
    <ConfirmationDialog />
  </div>
</template>
