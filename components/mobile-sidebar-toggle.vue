<script setup lang="ts">
import { UButton } from '#components'

type ButtonProps = InstanceType<typeof UButton>['$props']
const props = defineProps<{
  // https://ui.nuxt.com/elements/button#props
  ui?: ButtonProps['ui']
  size?: ButtonProps['size']
  type?: ButtonProps['type']
  color?: ButtonProps['color']
  variant?: ButtonProps['variant']
  // icon?: ButtonProps['icon'] // Omitted
  label?: ButtonProps['label']
  loadingIcon?: ButtonProps['loadingIcon']
  leadingIcon?: ButtonProps['leadingIcon']
  trailingIcon?: ButtonProps['trailingIcon']
  disabled?: ButtonProps['disabled']
  truncate?: ButtonProps['truncate']
  block?: ButtonProps['block']
  square?: ButtonProps['square']
  loading?: ButtonProps['loading']
  padded?: ButtonProps['padded']
  trailing?: ButtonProps['trailing']
  leading?: ButtonProps['leading']
  // Additional
  class?: ButtonProps['class']
}>()

const mobileSidebarVisible = useState('mobile-sidebar-visible', () => false)
</script>

<template>
  <ClientOnly>
    <UButton
      v-bind="{ ...props }"
      aria-label="Theme"
      icon="i-heroicons-bars-3-bottom-left"
      @click="mobileSidebarVisible = true"
    />

    <template #fallback>
      <div class="w-8 h-8" />
    </template>
  </ClientOnly>
</template>
