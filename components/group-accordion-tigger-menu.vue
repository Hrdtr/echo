<script setup lang="ts">
const emit = defineEmits<{
  edit: []
  delete: []
}>()

const deleteConfirmationVisible = ref(false)
</script>

<template>
  <div class="divide-y divide-gray-200 dark:divide-gray-800 rounded-md">
    <div class="p-1">
      <UVerticalNavigation
        :links="[
          {
            label: 'Edit',
            icon: 'i-heroicons-pencil-square',
            click: (e: any) => {
              e.preventDefault()
              e.stopPropagation()
              emit('edit')
            },
          },
          {
            label: 'Delete',
            icon: 'i-heroicons-trash',
            click: (e: any) => {
              e.preventDefault()
              e.stopPropagation()
              deleteConfirmationVisible = !deleteConfirmationVisible
            },
          },
        ]"
        :ui="{ font: 'font-normal', width: 'min-w-40' }"
      >
        <template #icon>
          <span class="hidden" />
        </template>
        <template #default="{ link }">
          <span v-if="link.label.toLowerCase() === 'delete'" class="flex flex-col relative w-full" :class="{ 'group-hover:text-red-400': !deleteConfirmationVisible }">
            <span class="truncate text-left">{{ deleteConfirmationVisible ? 'Are you sure?' : link.label }}</span>
            <span v-if="deleteConfirmationVisible" class="flex flex-row items-center space-x-1">
              <UIcon name="i-heroicons-arrow-long-right" />
              <UButton
                size="sm"
                variant="link"
                color="red"
                label="Delete"
                class="font-normal"
                :padded="false"
                @click="(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  emit('delete')
                }"
              />
              <span class="text-sm opacity-80">/</span>
              <UButton
                size="sm"
                variant="link"
                color="gray"
                label="Cancel"
                class="font-normal"
                :padded="false"
                @click.prevent.stop="deleteConfirmationVisible = false"
              />
            </span>
          </span>
          <div v-else class="truncate relative">
            {{ link.label }}
          </div>
        </template>
        <template #badge="{ link }">
          <template v-if="link.label.toLowerCase() === 'delete'">
            <UIcon
              v-if="!deleteConfirmationVisible"
              :name="link.icon"
              class="ml-auto flex-shrink-50 w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200"
            />
          </template>
          <UIcon
            v-else
            :name="link.icon"
            class="ml-auto flex-shrink-50 w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200"
          />
        </template>
      </UVerticalNavigation>
    </div>
  </div>
</template>
