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
  if (connection && connection.pending) return

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

function isConnected(id: number) {
  return connections.value.find(connection => connection.hostId === id) && !connections.value.find(connection => connection.hostId === id)?.pending
}
function isPending(id: number) {
  return connections.value.find(connection => connection.hostId === id)?.pending
}
</script>

<template>
  <UVerticalNavigation
    :links="props.hosts.map((host) => ({
      ...host,
      label: host.name,
      click: () => onHostClick(host),
    }))"
    :ui="{ padding: 'pl-0 py-0' }"
  >
    <template #default="{ link: host }">
      <HostListItemLabel
        :connected="isConnected(host.id)"
        :connection-pending="isPending(host.id)"
        @toggle-connection="toggleHostConnection(host.id)"
        @edit="() => {
          const host = hosts.find((host) => host.id === host.id)
          if (host) $emit('clickEdit', host)
        }"
        @delete="() => {}"
      >
        {{ host.label }}
      </HostListItemLabel>
    </template>
    <template #badge="{ link: host }">
      <ClientOnly>
        <div class="flex-1 flex flex-row justify-end space-x-1 opacity-0 group-hover:opacity-75 focus-within:opacity-75 -mr-1">
          <UTooltip :text="host.starred ? 'Remove from Starred' : 'Add to Starred'" :popper="{ arrow: true }">
            <UButton
              :icon="host.starred ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
              variant="link"
              color="gray"
              size="xs"
              :padded="false"
              @click="(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleHostStar(host.id)
              }"
            />
          </UTooltip>
        </div>
      </ClientOnly>
    </template>
  </UVerticalNavigation>
</template>
