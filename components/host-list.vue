<script setup lang="ts">
const props = defineProps<{
  hosts: typeof hosts.value
}>()
defineEmits<{
  'clickEdit': [host: typeof hosts.value[number]]
}>()

const activeView = useActiveView()
const toast = useToast()

const hosts = useHosts()
const connections = useConnections()
const terminalTabs = useTerminalTabs()
const shellSessions = useShellSessions()

async function toggleHostStar(hostId: number) {
  const starred = hosts.value.find(host => host.id === hostId)?.starred
  await $fetch(`/api/hosts/${hostId}`, {
    method: 'PATCH',
    body: { starred: !starred },
  })
  hosts.value = hosts.value.map(host => host.id === hostId ? { ...host, starred: !starred } : host)
}

const { $socket } = useNuxtApp()

function toggleHostConnection(hostId: number) {
  const connection = connections.value.find(connection => connection.hostId === hostId)
  return new Promise<NonNullable<typeof connection>>((resolve, reject) => {
    if (!connection) {
      const createId = () => `${hostId}:${new Date().valueOf()}`
      const connection = { id: createId(), hostId, pending: true }
      connections.value.push(connection)

      const listener = (data: string) => {
        $socket.off(connection.id, listener)
        const error = data.trim().startsWith('error:')
        const message = error ? data.replace('error:', '').trim() : data.replace('info:', '').trim()
        toast.add({
          color: error ? 'red' : 'green',
          title: error ? 'Error' : hosts.value.find(host => connection.hostId === host.id)?.name,
          description: message,
        })
        if (error) {
          connections.value = connections.value.filter(c => c.id !== connection.id)
          reject(new Error(data.replace('error:', '').trim()))
        }
        else {
          connections.value = connections.value.map(c => c.id === connection.id ? { ...c, pending: false } : c)
          resolve(connection)
        }
      }
      $socket.emit('open', connection.id)
      $socket.on(connection.id, listener)
    }
    else {
      $socket.emit(`${connection.id}:close`)
      connections.value = connections.value.filter(connection => connection.hostId !== hostId)
      toast.add({
        color: 'gray',
        title: hosts.value.find(host => connection.hostId === host.id)?.name,
        description: 'Connection closed',
      })
      resolve(connection)
    }
  })
}

async function onHostClick(host: typeof hosts.value[number]) {
  let connection = connections.value.find(connection => connection.hostId === host.id)
  if (!connection) connection = await toggleHostConnection(host.id)

  if (activeView.value === 'terminal') {
    const createId = () => `${new Date().valueOf()}`
    const terminalTab = { id: createId(), label: host.name, active: true }
    terminalTabs.value = [terminalTab, ...terminalTabs.value.map(tab => ({ ...tab, active: false }))]
    shellSessions.value.push({
      id: createId(),
      connectionId: connection.id,
      tabId: terminalTab.id,
    })
  }
}
</script>

<template>
  <UVerticalNavigation
    :links="props.hosts.map((link) => ({
      label: link.name,
      id: link.id,
      starred: link.starred,
      connected: connections.find(connection => connection.hostId === link.id) && !connections.find(connection => connection.hostId === link.id)?.pending,
      pending: connections.find(connection => connection.hostId === link.id)?.pending,
      click: () => onHostClick(link),
    }))"
  >
    <template #default="{ link }">
      <span class="truncate relative" :class="link.connected ? 'text-primary' : ''">
        {{ link.label }}
      </span>
    </template>
    <template #badge="{ link }">
      <ClientOnly>
        <div class="flex-1 flex flex-row justify-end space-x-1 opacity-0 group-hover:opacity-75 -mr-1">
          <UTooltip text="Edit Host" :popper="{ arrow: true }">
            <UButton
              icon="i-heroicons-pencil-square"
              variant="link"
              color="gray"
              size="xs"
              :padded="false"
              @click="(e) => {
                e.preventDefault()
                e.stopPropagation()
                const host = hosts.find((host) => host.id === link.id)
                if (host) $emit('clickEdit', host)
              }"
            />
          </UTooltip>
          <UTooltip :text="link.connected ? 'Disconnect' : 'Connect'" :popper="{ arrow: true }">
            <UButton
              :icon="link.connected ? 'i-heroicons-signal-slash' : 'i-heroicons-signal'"
              variant="link"
              color="gray"
              size="xs"
              :padded="false"
              :loading="link.pending"
              @click="(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleHostConnection(link.id)
              }"
            />
          </UTooltip>
          <UTooltip :text="link.starred ? 'Remove from Starred' : 'Add to Starred'" :popper="{ arrow: true }">
            <UButton
              :icon="link.starred ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
              variant="link"
              color="gray"
              size="xs"
              :padded="false"
              @click="(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleHostStar(link.id)
              }"
            />
          </UTooltip>
        </div>
      </ClientOnly>
    </template>
  </UVerticalNavigation>
</template>
