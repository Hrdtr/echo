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

const colorMode = useColorMode()
const isDark = computed({
  get: () => colorMode.value === 'dark',
  set: () =>
    (colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'),
})
</script>

<template>
  <ClientOnly>
    <UButton
      v-bind="{ ...props }"
      aria-label="Theme"
      :icon="isDark ? 'i-heroicons-moon' : 'i-heroicons-sun'"
      @click="isDark = !isDark"
    />

    <template #fallback>
      <div class="w-8 h-8" />
    </template>
  </ClientOnly>
</template>
