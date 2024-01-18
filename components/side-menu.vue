<script setup lang="ts">
import Fuse from 'fuse.js'

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
async function deleteGroup(id: number) {
  await $fetch(`/api/groups/${id}`, { method: 'DELETE' })
  hosts.value = hosts.value.map(host => host.groupId !== id ? { ...host } : { ...host, groupId: null })
  groups.value = groups.value.filter(group => group.id !== id)
}
</script>

<template>
  <SideMenuContainer v-model:search-keyword="searchKeyword">
    <template #action>
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
    </template>

    <div v-if="searchKeyword.length === 0 && starredHosts.length > 0">
      <span class="inline-block mb-2 text-xs uppercase opacity-50 tracking-wider">Starred</span>
      <HostList :hosts="starredHosts" @edit="(id) => selectedHostForEdit = hosts.find(i => i.id === id)" />
    </div>

    <div v-if="groupedHosts.length > 0">
      <span v-if="searchKeyword.length === 0 || searchGroupedHostsResult.length > 0" class="inline-block mb-2 text-xs uppercase opacity-50 tracking-wider">Groups</span>
      <!-- hydration mismatch happened on UAccordion component below -->
      <UAccordion
        multiple
        :items="(searchKeyword.length > 0 && searchGroupedHostsResult ? searchGroupedHostsResult : groupedHosts).map((item) => ({ id: item.id, label: item.name, hosts: item.hosts }))"
        :ui="{
          item: { padding: 'pt-0 pb-0 mb-2.5 mt-1 ml-2.5 rounded-md bg-gray-200/25 dark:bg-gray-800/25 border border-gray-200/50 dark:border-gray-800/50' },
        }"
      >
        <template #default="{ item, open }">
          <GroupAccordionTrigger
            :open="open"
            @edit="selectedGroupForEdit = groupedHosts.find(group => group.id === item.id)"
            @delete="deleteGroup(item.id)"
          >
            {{ item.label }}
          </GroupAccordionTrigger>
        </template>
        <template #item="{ item }">
          <template v-if="item.hosts.length === 0">
            <span class="inline-block pl-2.5 text-xs opacity-50 py-1">This group is empty</span>
          </template>
          <HostList :hosts="item.hosts" @edit="(id) => selectedHostForEdit = hosts.find(i => i.id === id)" />
        </template>
      </UAccordion>
    </div>

    <div v-if="hosts.length > 0">
      <span v-if="searchKeyword.length === 0 || searchHostsResult.length > 0" class="inline-block mb-2 text-xs uppercase opacity-50 tracking-wider">Hosts</span>
      <HostList :hosts="searchKeyword.length > 0 && searchHostsResult ? searchHostsResult : hosts" @edit="(id) => selectedHostForEdit = hosts.find(i => i.id === id)" />
    </div>

    <USlideover v-model="hostFormVisible" side="left" prevent-close>
      <UCard class="h-dvh flex flex-col flex-1" :ui="{ body: { base: 'flex-1 overflow-y-auto' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
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
            <UInput v-model="hostState.name" autofocus />
          </UFormGroup>

          <UFormGroup label="Group" name="groupId">
            <!--
            Enabling searchable makes build output throws:
            RangeError: Maximum call stack size exceeded
            TypeError: Cannot read properties of null (reading 'value')
            TypeError: Cannot destructure property 'bum' of 'k' as it is null.
          -->
            <!-- <USelectMenu
            v-model="hostState.groupId"
            searchable
            searchable-placeholder="Search by name or color"
            value-attribute="id"
            option-attribute="name"
            :options="[{ id: null, name: '-' }, ...(groups ?? [])]"
            :search-attributes="['name']"
          >
            <template #label>
              <span v-if="hostState.groupId" class="truncate">{{ groups.find(group => group.id === hostState.groupId as any)?.name || '-' }}</span>
            </template>
          </USelectMenu> -->

            <USelectMenu
              v-model="hostState.groupId"
              value-attribute="id"
              option-attribute="name"
              :options="[{ id: null, name: '-' }, ...(groups ?? [])]"
              :search-attributes="['name']"
            >
              <template #label>
                <span v-if="hostState.groupId" class="truncate">{{ groups.find(group => group.id === hostState.groupId as any)?.name || '-' }}</span>
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
              Save
            </UButton>
          </div>
        </UForm>
      </UCard>
    </USlideover>

    <USlideover v-model="groupFormVisible" side="left" prevent-close>
      <UCard class="h-dvh flex flex-col flex-1" :ui="{ body: { base: 'flex-1 overflow-y-auto' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
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
            <UInput v-model="groupState.name" autofocus />
          </UFormGroup>

          <div class="flex flex-row justify-between space-x-2 pt-4">
            <div />
            <div class="flex flex-row justify-end space-x-2">
              <UButton type="button" variant="ghost" color="gray" size="lg" @click="groupFormVisible = false">
                Cancel
              </UButton>
              <UButton type="submit" variant="soft" size="lg" :loading="groupFormPending">
                Save
              </UButton>
            </div>
          </div>
        </UForm>
      </UCard>
    </USlideover>
  </SideMenuContainer>
</template>
