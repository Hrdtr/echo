<script setup lang="ts">
const { data } = useFetch<any[]>('https://api.github.com/repos/Hrdtr/echo/releases')
const release = computed(() => !data.value ? null : data.value[0])
</script>

<template>
  <div class="pt-0.5 flex-1 flex flex-col prose prose-sm dark:prose-invert -mt-1.5">
    <ul>
      <li><strong>Current Version:</strong> {{ release.name }}</li>
      <li><strong>Release Date:</strong> {{ new Date(release.published_at).toLocaleString() }}</li>
      <li><strong>Release Notes:</strong> <div class="whitespace-pre-line" v-html="release.body" /></li>
      <li><strong>GitHub Repository:</strong> <a href="https://github.com/Hrdtr/echo">Hrdtr/echo</a></li>
    </ul>
  </div>
</template>
