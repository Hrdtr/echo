<script setup lang="ts">
const settings = useSettings()

const label = computed(() => {
  const preference = settings.appearance.theme.state.colorMode.preference
  return preference.charAt(0).toUpperCase() + preference.slice(1)
})
</script>

<template>
  <div class="pt-0.5 flex-1 flex flex-col">
    <div class="flex flex-row">
      <USelectMenu
        v-model="settings.appearance.theme.state.colorMode.preference"
        option-attribute="label"
        value-attribute="value"
        :options="[
          { label: 'System', value: 'system' },
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' }]
        "
      >
        <template #label>
          <span class="truncate">{{ label }}</span>
        </template>
      </USelectMenu>
    </div>
  </div>
</template>
