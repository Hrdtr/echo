<script setup lang="ts">
const sessions = useShellSessions()
const tabs = useTerminalTabs()
const activeTabId = computed(() => tabs.value.find(tab => tab.active)?.id)
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div v-if="sessions.length > 0" class="overflow-x-auto border-b border-gray-200/50 dark:border-gray-800/50">
      <div class="flex flex-row space-x-3 p-3">
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
    <data v-for="session in sessions" :key="session.id" class="flex-1" :class="activeTabId === session.tabId ? 'flex' : 'hidden'">
      <Shell :session-id="session.id" />
    </data>
  </div>
</template>
