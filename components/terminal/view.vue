<script setup lang="ts">
const sessions = useShellSessions()
const tabs = useTerminalTabs()
const activeTabId = computed(() => tabs.value.find(tab => tab.active)?.id)
</script>

<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <div class="overflow-x-auto bg-gray-100 dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-800/50" :class="{ 'md:hidden': sessions.length === 0 }">
      <div class="flex flex-row p-3">
        <MobileSidebarToggle
          square
          variant="soft"
          class="mr-3 md:hidden flex-shrink-0"
        />
        <div v-if="sessions.length > 0" class="flex-1 flex flex-row space-x-3 overflow-y-auto">
          <UButtonGroup v-for="tab in tabs" :key="tab.id">
            <UButton
              :color="activeTabId === tab.id ? 'primary' : 'gray'"
              @click="() => {
                tabs = tabs.map(t => ({ ...t, active: t.id === tab.id }))
              }"
            >
              {{ tab.label }}
            </UButton>
            <UButton
              icon="i-heroicons-x-mark"
              :color="activeTabId === tab.id ? 'primary' : 'gray'"
              @click="() => {
                sessions = sessions.filter(s => s.tabId !== tab.id)
                tabs = tabs.filter(t => t.id !== tab.id)
              }"
            />
          </UButtonGroup>
        </div>
      </div>
    </div>
    <data v-for="session in sessions" :key="session.id" class="flex-1 bg-black p-3" :class="activeTabId === session.tabId ? 'flex' : 'hidden'">
      <TerminalShell :session-id="session.id" />
    </data>
  </div>
</template>
