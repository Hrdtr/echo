<script setup lang="ts">
const props = defineProps<{ open?: boolean }>()
const emit = defineEmits<{
  edit: []
  delete: []
}>()

const contextMenuState = ref(false)
const contextMenu = useContextMenu(contextMenuState)
</script>

<template>
  <div class="w-full" @contextmenu.prevent="contextMenu.show">
    <UButton
      block
      color="gray"
      variant="ghost"
      class="font-medium text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
    >
      <span class="truncate">
        <slot />
      </span>

      <template #trailing>
        <UIcon
          name="i-heroicons-chevron-right-20-solid"
          class="w-5 h-5 ms-auto transform transition-transform duration-200 -mr-1 opacity-75 group-hover:opacity-100"
          :class="[props.open && 'rotate-90']"
        />
      </template>
    </UButton>
    <UContextMenu v-model="contextMenuState" :virtual-element="contextMenu.virtualElement">
      <GroupAccordionTiggerMenu
        @edit="emit('edit')"
        @delete="emit('delete')"
      />
    </UContextMenu>
  </div>
</template>
