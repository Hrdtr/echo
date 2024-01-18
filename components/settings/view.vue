<script setup lang="ts">
const settings = useSettings()
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="flex flex-row items-center p-3 bg-gray-100 dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-800/50 sticky top-0 z-10">
      <MobileSidebarToggle
        square
        variant="soft"
        class="mr-3 md:hidden flex-shrink-0"
      />
      <h1 class="text-2xl font-semibold">
        Settings
      </h1>
    </div>

    <div class="p-3 max-w-3xl flex flex-col divide-y divide-gray-100/50 dark:divide-gray-900 space-y-3">
      <div v-for="([sectionName, section], i) in Object.entries(settings)" :key="i" :class="{ 'pt-3': i !== 0 }">
        <h2 class="opacity-50 mb-3">
          {{ sectionName.charAt(0).toUpperCase() + sectionName.slice(1) }}
        </h2>
        <div class="flex flex-col space-y-2">
          <div v-for="([title, setting], i2) in Object.entries(section)" :id="`${sectionName}.${title}`" :key="title" class="flex flex-row space-x-4">
            <div class="w-[max(100px,30%)] flex-shrink-0">
              <h3 class="font-semibold mb-2" style="overflow-wrap: break-word; hyphens: auto">
                {{ setting.title }}
              </h3>
              <p v-if="setting.description" class="text-sm opacity-75">
                {{ setting.description }}
              </p>
            </div>
            <div class="flex-1 pb-3" :class="{ 'border-b border-gray-100/50 dark:border-gray-900': i2 !== Object.entries(section).length - 1 }">
              <component :is="setting.component" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
