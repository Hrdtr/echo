<script setup lang="ts">
import type { Terminal } from 'xterm'
import type { FitAddon } from '@xterm/addon-fit'

const props = defineProps<{
  sessionId: string
}>()
const sessions = useShellSessions()
const session = computed(() => sessions.value.find(s => props.sessionId === s.id))

const container = ref<HTMLDivElement>()
const term = ref<Terminal | null>(null)
const fitAddon = ref<FitAddon | null>(null)
const loaded = ref(false)

const debouncedFit = debounce(() => {
  fitAddon.value?.fit()
}, 100)
onMounted(() => {
  window.addEventListener('resize', debouncedFit)
})
onBeforeMount(() => {
  window.removeEventListener('resize', debouncedFit)
})

watch(container, async (value) => {
  if (loaded.value || !value) return
  loaded.value = true
  try {
    const [
      { Terminal },
      { FitAddon },
      { WebglAddon },
      { WebLinksAddon },
    ] = await Promise.all([
      import('xterm'),
      import('@xterm/addon-fit'),
      import('@xterm/addon-webgl'),
      import('@xterm/addon-web-links'),
    ])

    term.value = new Terminal({
      cursorBlink: true,
      cursorInactiveStyle: 'underline',
      fontSize: 14,
    })

    /* Fit */
    fitAddon.value = new FitAddon()
    term.value.loadAddon(fitAddon.value)
    /* WebGL */
    const webglAddon = new WebglAddon()
    webglAddon.onContextLoss(() => { webglAddon.dispose() })
    term.value.loadAddon(webglAddon)
    /* WebLinks */
    term.value.loadAddon(new WebLinksAddon())

    term.value.open(value)
    fitAddon.value.fit()
  }
  catch (error) {
    term.value = null
    fitAddon.value = null
    loaded.value = false
  }
})

const { $socket } = useNuxtApp()
watch(term, (val) => {
  if (!val || !session.value) return

  $socket.emit(`${session.value.connectionId}:shell`, `${session.value.id}`)
  const eventName = `${session.value.connectionId}:${session.value.id}`
  val.onData(data => $socket.emit(eventName, data)) // Browser -> Backend
  $socket.on(eventName, data => term.value?.write(data)) // Backend -> Browser

  /* Socket connection disconnected */
  $socket.on('disconnect', () => term.value?.write('\r\nDisconnected.\r\n'))
})
onBeforeUnmount(() => {
  if (!session.value) return
  $socket.emit(`${session.value.connectionId}:${session.value.id}:close`)
})
</script>

<template>
  <div ref="container" class="flex-1" />
</template>

<style src="xterm/css/xterm.css" />

<style lang="postcss">
/* https://github.com/xtermjs/xtermjs.org/blob/master/_includes/demo.html */
.xterm-viewport.xterm-viewport {
  scrollbar-width: thin;
}
.xterm-viewport::-webkit-scrollbar {
  width: 10px;
}
.xterm-viewport::-webkit-scrollbar-track {
  opacity: 0;
}
.xterm-viewport::-webkit-scrollbar-thumb {
  min-height: 20px;
  background-color: #ffffff20;
}
</style>
