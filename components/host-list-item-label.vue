<script setup lang="ts">
const props = defineProps<{
  connected?: boolean
  connectionPending?: boolean
}>()
const emit = defineEmits<{
  toggleConnection: []
  edit: []
  delete: []
}>()

const contextMenuState = ref(false)
const contextMenu = useContextMenu(contextMenuState)
</script>

<template>
  <div class="w-full" @contextmenu.prevent="contextMenu.show">
    <span
      class="w-full inline-flex pl-3 py-1.5 text-left truncate relative"
      :class="{
        'text-primary': props.connected,
        'cursor-wait opacity-50': props.connectionPending,
      }"
    >
      <slot />
    </span>
    <UContextMenu v-model="contextMenuState" :virtual-element="contextMenu.virtualElement">
      <HostListItemMenu
        :connected="props.connected"
        :connection-pending="props.connectionPending"
        @toggle-connection="emit('toggleConnection')"
        @edit="emit('edit')"
        @delete="emit('delete')"
      />
    </UContextMenu>
  </div>
</template>
