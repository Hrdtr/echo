<script setup lang="ts">
import Fuse from 'fuse.js'

const mobileSidebarVisible = useState('mobile-sidebar-visible', () => false)
const activeView = useActiveView()
const toast = useToast()

const hosts = useHosts()
const groups = useGroups()

const groupedHosts = computed(() => {
  return groups.value.map(group => ({
    ...group,
    hosts: hosts.value.filter(host => group.id === host.groupId) ?? [],
  }))
})
const starredHosts = computed(() => {
  return hosts.value.filter(host => host.starred)
})

const searchKeyword = ref('')
const searchGroupedHostsResult = ref<typeof groupedHosts.value>([])
const searchGroupedHostsFuse = computed(() => new Fuse(groupedHosts.value, {
  keys: ['id', 'name'],
}))
const searchHostsResult = ref<typeof hosts.value>([])
const searchHostsFuse = computed(() => new Fuse(hosts.value, {
  keys: ['id', 'name', 'host'],
}))
watch(searchKeyword, (val) => {
  if (val.length > 0) {
    searchGroupedHostsResult.value = searchGroupedHostsFuse.value.search(searchKeyword.value).map(i => i.item)
    searchHostsResult.value = searchHostsFuse.value.search(searchKeyword.value).map(i => i.item)
  }
  else {
    searchGroupedHostsResult.value = []
    searchHostsResult.value = []
  }
})

const selectedHostForEdit = ref<typeof hosts.value[number]>()
const hostForm = ref()
const hostFormVisible = ref(false)
const hostSchema = z.object({
  name: z.string(),
  host: z.string(),
  port: z.number().positive().optional(),
  username: z.string(),
  password: z.string().optional(),
  privateKey: z.string().optional(),
  privateKeyPassphrase: z.string().optional(),
  groupId: z.number().nullable().optional(),
  tagIds: z.number().array().optional(),
})
type HostSchema = zType.output<typeof hostSchema>
const hostState = reactive({
  name: undefined,
  host: undefined,
  port: undefined,
  username: undefined,
  password: undefined,
  privateKey: undefined,
  privateKeyPassphrase: undefined,
  groupId: undefined,
  tagIds: undefined,
})
watch(selectedHostForEdit, (val) => {
  if (val) {
    selectedGroupForView.value = undefined // eslint-disable-line ts/no-use-before-define
    hostFormVisible.value = true
    hostState.name = (val.name === null ? undefined : val.name) as any
    hostState.host = (val.host === null ? undefined : val.host) as any
    hostState.port = (val.port === null ? undefined : val.port) as any
    hostState.username = (val.username === null ? undefined : val.username) as any
    hostState.password = (val.password === null ? undefined : val.password) as any
    hostState.privateKey = (val.privateKey === null ? undefined : val.privateKey) as any
    hostState.privateKeyPassphrase = (val.privateKeyPassphrase === null ? undefined : val.privateKeyPassphrase) as any
    hostState.groupId = (val.groupId === null ? undefined : val.groupId) as any
    hostState.tagIds = val.hostTags.map(hostTag => hostTag.tagId) as any
  }
  else {
    hostState.name = undefined
    hostState.host = undefined
    hostState.port = undefined
    hostState.username = undefined
    hostState.password = undefined
    hostState.privateKey = undefined
    hostState.privateKeyPassphrase = undefined
    hostState.groupId = undefined
    hostState.tagIds = undefined
  }
})
watch(hostFormVisible, (val) => {
  if (!val) selectedHostForEdit.value = undefined
})
const hostFormPending = ref(false)
async function onHostSubmit(event: FormSubmitEvent<HostSchema>) {
  hostFormPending.value = true
  try {
    if (selectedHostForEdit.value) {
      const res = await $fetch(`/api/hosts/${selectedHostForEdit.value.id}`, {
        method: 'PATCH',
        body: event.data,
      })
      hosts.value = hosts.value.map(host => host.id === res.id ? res : host)
    }
    else {
      const res = await $fetch('/api/hosts', {
        method: 'POST',
        body: event.data,
      })
      hosts.value = [...hosts.value, res]
    }
    hostFormPending.value = false
    hostFormVisible.value = false
    hostState.name = undefined
    hostState.host = undefined
    hostState.port = undefined
    hostState.username = undefined
    hostState.password = undefined
    hostState.privateKey = undefined
    hostState.privateKeyPassphrase = undefined
    hostState.groupId = undefined
    hostState.tagIds = undefined
  }
  catch (error) {
    if (error instanceof Error) {
      if ('response' in error) {
        if ('statusCode' in error && error.statusCode === 400) {
          const errData = JSON.parse((error.response as any)._data.message)
          hostForm.value.setErrors(errData.map((e: any) => ({ path: e.path.join('.'), message: e.message })))
        }
        else {
          toast.add({
            color: 'red',
            title: 'Error',
            description: (error.response as any)._data.message,
          })
        }
      }
      else {
        toast.add({
          color: 'red',
          title: 'Error',
          description: error.message,
        })
      }
    }
    else {
      toast.add({
        color: 'red',
        title: 'Error',
        description: 'Something went wrong',
      })
    }
    hostFormPending.value = false
  }
}

const selectedGroupForView = ref<typeof groupedHosts.value[number]>()
const selectedGroupForEdit = ref<typeof groupedHosts.value[number]>()
const groupFormVisible = ref(false)
const groupSchema = z.object({
  name: z.string(),
})
type GroupSchema = zType.output<typeof groupSchema>
const groupState = reactive({
  name: undefined,
})
watch(selectedGroupForEdit, (val) => {
  if (val) {
    selectedGroupForView.value = undefined
    groupFormVisible.value = true
    groupState.name = val.name as any
  }
  else {
    groupState.name = undefined
  }
})
watch(groupFormVisible, (val) => {
  if (!val) selectedGroupForEdit.value = undefined
})
const groupFormPending = ref(false)
async function onGroupSubmit(event: FormSubmitEvent<GroupSchema>) {
  groupFormPending.value = true
  if (selectedGroupForEdit.value) {
    const res = await $fetch(`/api/groups/${selectedGroupForEdit.value.id}`, {
      method: 'PATCH',
      body: event.data,
    })
    groups.value = groups.value.map(group => group.id === res.id ? res : group) ?? []
    selectedGroupForEdit.value = undefined
  }
  else {
    const res = await $fetch('/api/groups', {
      method: 'POST',
      body: event.data,
    })
    groups.value = [...groups.value, res]
  }
  groupFormPending.value = false
  groupFormVisible.value = false
  groupState.name = undefined
}
const groupDeletePending = ref(false)
async function groupDelete() {
  if (!selectedGroupForEdit.value) return
  groupDeletePending.value = true
  await $fetch(`/api/groups/${selectedGroupForEdit.value.id}`, {
    method: 'DELETE',
  })
  hosts.value = hosts.value.map(host => host.groupId !== selectedGroupForEdit.value?.id ? { ...host } : { ...host, groupId: null })
  groups.value = groups.value.filter(group => group.id !== selectedGroupForEdit.value?.id)
  groupDeletePending.value = false
  groupFormVisible.value = false
}
</script>

<template>
  <div>
    <div
      class="z-10 w-16 h-dvh fixed top-0 left-0 flex flex-col items-center gap-2 bg-gray-100 dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-800/50 transition-transform duration-300"
      :class="mobileSidebarVisible ? 'translate-x-0' : '-translate-x-16 md:translate-x-0'"
    >
      <div
        class="inline-flex h-16 w-16 items-center justify-center flex-shrink-0"
      >
        <img src="/icon-rounded.png" class="w-10 h-10">
      </div>
      <div
        class="flex-1 w-full flex flex-col items-center justify-between gap-2 overflow-hidden"
      >
        <div class="flex flex-col items-center gap-2 w-full overflow-y-auto">
          <UButton
            square
            variant="link"
            :color="activeView === 'terminal' ? 'primary' : 'gray'"
            size="lg"
            icon="i-heroicons-command-line"
          />
          <!-- <UButton
            square
            variant="link"
            color="gray"
            size="lg"
            icon="i-heroicons-cog"
          /> -->
        </div>
        <div
          class="flex flex-col items-center gap-2 pt-4 pb-2 border-t border-gray-200/50 dark:border-gray-800/50 flex-shrink-0"
        >
          <ColorModeToggle
            square
            variant="link"
            color="gray"
            size="lg"
            class="opacity-70 hover:opacity-100"
          />
        </div>
      </div>
    </div>

    <div
      class="z-10 w-48 lg:w-56 h-dvh fixed top-0 left-16 flex flex-col items-start gap-2 bg-gray-100 dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300"
      :class="mobileSidebarVisible ? 'translate-x-0' : '-translate-x-64 md:translate-x-0'
      "
    >
      <div class="w-full flex-1 flex flex-col space-y-3 py-3 overflow-hidden">
        <div class="flex flex-row items-center justify-between space-x-2 px-3">
          <UInput
            v-model="searchKeyword"
            icon="i-heroicons-magnifying-glass-20-solid"
            size="sm"
            color="white"
            :trailing="false"
            placeholder="Search..."
          />
          <ClientOnly>
            <UDropdown
              :popper="{ arrow: true }"
              :items="[
                [
                  { label: 'Host', icon: 'i-heroicons-link', click: () => hostFormVisible = true },
                  { label: 'Group', icon: 'i-heroicons-rectangle-group', click: () => groupFormVisible = true },
                ],
              ]"
            >
              <UButton icon="i-heroicons-plus" color="gray" />
            </UDropdown>
            <template #fallback>
              <UButton icon="i-heroicons-plus" color="gray" />
            </template>
          </ClientOnly>
        </div>

        <div class="flex-1 flex flex-col space-y-3 overflow-y-auto px-3">
          <div v-if="searchKeyword.length === 0 && starredHosts.length > 0">
            <span class="inline-block mb-2 text-xs uppercase opacity-50 tracking-wider">Starred</span>
            <HostList :hosts="starredHosts" @click-edit="(host) => selectedHostForEdit = host" />
          </div>

          <div v-if="groupedHosts.length > 0">
            <span v-if="searchKeyword.length === 0 || searchGroupedHostsResult.length > 0" class="inline-block mb-2 text-xs uppercase opacity-50 tracking-wider">Groups</span>
            <UVerticalNavigation
              :links="(searchKeyword.length > 0 && searchGroupedHostsResult ? searchGroupedHostsResult : groupedHosts).map((item) => ({
                label: item.name,
                click: () => selectedGroupForView = item,
                hostsCount: item.hosts.length,
              }))"
            >
              <template #badge="{ link }">
                <div class="flex-1 flex flex-row justify-end">
                  <p class="text-sm text-gray-400 dark:text-gray-500">
                    {{ link.hostsCount }}
                  </p>
                </div>
              </template>
            </UVerticalNavigation>
          </div>

          <div v-if="hosts.length > 0">
            <span v-if="searchKeyword.length === 0 || searchHostsResult.length > 0" class="inline-block mb-2 text-xs uppercase opacity-50 tracking-wider">Hosts</span>
            <HostList :hosts="searchKeyword.length > 0 && searchHostsResult ? searchHostsResult : hosts" @click-edit="(host) => selectedHostForEdit = host" />
          </div>
        </div>
      </div>
    </div>

    <USlideover v-model="hostFormVisible" side="left" prevent-close>
      <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1 overflow-y-auto' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ selectedHostForEdit ? 'Edit Host' : 'New Host' }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1 bg-gray-50/80 dark:bg-gray-800/80"
              @click="hostFormVisible = false"
            />
          </div>
        </template>

        <UForm ref="hostForm" :schema="hostSchema" :state="hostState" class="space-y-4" @submit="onHostSubmit">
          <UFormGroup label="Name" name="name">
            <UInput v-model="hostState.name" />
          </UFormGroup>

          <UFormGroup label="Group" name="groupId">
            <USelectMenu
              v-model="hostState.groupId"
              searchable
              searchable-placeholder="Search by name or color"
              value-attribute="id"
              option-attribute="name"
              :options="[{ id: null, name: '-' }, ...(groups ?? [])]"
              :search-attributes="['name']"
            >
              <template #label>
                <span v-if="hostState.groupId" class="truncate">{{ groups.find(group => group.id === hostState.groupId as any)?.name }}</span>
              </template>
            </USelectMenu>
          </UFormGroup>

          <div class="flex flex-row justify-between space-x-2">
            <UFormGroup label="Host" name="host">
              <UInput v-model="hostState.host" />
            </UFormGroup>
            <UFormGroup label="Port" name="port">
              <UInput v-model="hostState.port" type="number" />
            </UFormGroup>
          </div>

          <UFormGroup label="Username" name="username">
            <UInput v-model="hostState.username" />
          </UFormGroup>

          <UFormGroup label="Password" name="password">
            <UInput v-model="hostState.password" type="password" />
          </UFormGroup>
          <UFormGroup label="Private Key" name="privateKey">
            <UTextarea v-model="hostState.privateKey" />
          </UFormGroup>
          <UFormGroup label="Private Key Passphrase" name="privateKeyPassphrase">
            <UInput v-model="hostState.privateKeyPassphrase" type="password" />
          </UFormGroup>

          <div class="flex flex-row justify-end space-x-2 pt-4">
            <UButton type="button" variant="ghost" color="gray" size="lg" @click="hostFormVisible = false">
              Cancel
            </UButton>
            <UButton type="submit" variant="soft" size="lg">
              Submit
            </UButton>
          </div>
        </UForm>
      </UCard>
    </USlideover>

    <USlideover v-model="groupFormVisible" side="left" prevent-close>
      <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1 overflow-y-auto' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              {{ selectedGroupForEdit ? 'Edit Group' : 'New Group' }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1 bg-gray-50/80 dark:bg-gray-800/80"
              @click="groupFormVisible = false"
            />
          </div>
        </template>

        <UForm :schema="groupSchema" :state="groupState" class="space-y-4" @submit="onGroupSubmit">
          <UFormGroup label="Name" name="name">
            <UInput v-model="groupState.name" />
          </UFormGroup>

          <div class="flex flex-row justify-between space-x-2 pt-4">
            <UPopover v-if="selectedGroupForEdit" :popper="{ arrow: true, placement: 'bottom-start' }">
              <UButton
                type="button"
                variant="soft" color="red" size="lg"
                :loading="groupDeletePending"
              >
                Delete
              </UButton>
              <template #panel="{ close }">
                <div class="p-4 flex flex-row items-center space-x-2">
                  <span class="text-sm opacity-80">Are you sure?</span>
                  <div class="flex flex-row items-center space-x-1">
                    <UButton
                      size="sm"
                      variant="link"
                      color="red"
                      label="Yes"
                      tabindex="0"
                      :padded="false"
                      @click="() => {
                        close()
                        groupDelete()
                      }"
                    />
                    <span class="text-sm opacity-80">/</span>
                    <UButton size="sm" variant="link" color="gray" label="No" tabindex="0" :padded="false" @click="close" />
                  </div>
                </div>
              </template>
            </UPopover>
            <div v-else />
            <div class="flex flex-row justify-end space-x-2">
              <UButton type="button" variant="ghost" color="gray" size="lg" @click="groupFormVisible = false">
                Cancel
              </UButton>
              <UButton type="submit" variant="soft" size="lg" :loading="groupFormPending">
                Submit
              </UButton>
            </div>
          </div>
        </UForm>
      </UCard>
    </USlideover>

    <USlideover :model-value="selectedGroupForView !== undefined" side="left" prevent-close>
      <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1 overflow-y-auto' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex flex-row items-center space-x-2">
              <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                {{ selectedGroupForView?.name }}
              </h3>
              <UButton
                color="gray"
                variant="link"
                icon="i-heroicons-pencil-square"
                @click="selectedGroupForEdit = selectedGroupForView"
              />
            </div>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1 bg-gray-50/80 dark:bg-gray-800/80"
              @click="selectedGroupForView = undefined"
            />
          </div>
        </template>

        <template v-if="selectedGroupForView">
          <template v-if="selectedGroupForView.hosts.length > 0">
            <span class="inline-block mb-2 text-xs uppercase opacity-50 tracking-wider">Hosts</span>
            <HostList :hosts="selectedGroupForView.hosts" @click-edit="(host) => selectedHostForEdit = host" />
          </template>
          <p v-else class="text-sm text-gray-400 dark:text-gray-500">
            This group is empty
          </p>
        </template>
      </UCard>
    </USlideover>
  </div>
</template>
