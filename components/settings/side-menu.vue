<script setup lang="ts">
import Fuse from 'fuse.js'

const searchInputRef = ref<{ $el?: HTMLElement }>()
defineShortcuts({
  meta_f: () => searchInputRef.value?.$el?.querySelector('input')?.focus(),
})

const settings = useSettings()

const items = computed(() => {
  const result: {
    'data-id': string
    'label': string
    'section': string
  }[] = []

  for (const [section, subsections] of Object.entries(settings)) {
    for (const [key, value] of Object.entries(subsections)) {
      result.push({
        'data-id': `${section}.${key}`,
        'label': value.title,
        'section': section,
      })
    }
  }

  return result
})

const searchKeyword = ref('')
const searchResult = ref<typeof items.value>([])
const searchFuse = computed(() => new Fuse(items.value, {
  keys: ['section', 'label'],
}))
watch(searchKeyword, (val) => {
  if (val.length > 0) searchResult.value = searchFuse.value.search(searchKeyword.value).map(i => i.item)
  else searchResult.value = []
})

function groupItemsBySection(data: typeof items.value) {
  return data.reduce((acc, menu) => {
    if (menu.section) acc[menu.section] = [...(acc[menu.section] ?? []), menu]
    else acc._ = [...(acc._ ?? []), menu]
    return acc
  }, {} as Record<string, typeof data>)
}

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    window.scrollTo({
      top: el.getBoundingClientRect().top - document.body.getBoundingClientRect().top - 105 /* <- Offset */,
      behavior: 'smooth',
    })
  }
}

const visibleItemsContent = ref<string[]>([])
const observersStopFn = ref<(() => void)[]>([])
onMounted(() => {
  for (const [sectionName, section] of Object.entries(settings)) {
    for (const [key] of Object.entries(section)) {
      const { stop } = useIntersectionObserver(
        document.getElementById(`${sectionName}.${key}`),
        ([{ isIntersecting }]) => {
          if (!isIntersecting) {
            visibleItemsContent.value = visibleItemsContent.value.filter(i => i !== `${sectionName}.${key}`)
          }
          else {
            if (visibleItemsContent.value.includes(`${sectionName}.${key}`)) return
            visibleItemsContent.value.push(`${sectionName}.${key}`)
          }
        },
      )
      observersStopFn.value.push(stop)
    }
  }
})
onBeforeUnmount(() => observersStopFn.value.forEach(fn => fn()))
</script>

<template>
  <SideMenuContainer v-model:search-keyword="searchKeyword">
    <div
      v-for="([sectionName, sectionItems], i) in Object.entries(groupItemsBySection(searchKeyword.length > 0 ? searchResult : items))"
      :key="i"
    >
      <span v-if="sectionName !== '_'" class="inline-block mb-2 text-xs uppercase opacity-50 tracking-wider">{{ sectionName }}</span>
      <UVerticalNavigation
        :links="sectionItems.map(item => ({
          ...item,
          active: visibleItemsContent.includes(item['data-id']),
          click: () => scrollTo(item['data-id']),
        }))"
      />
    </div>
  </SideMenuContainer>
</template>
