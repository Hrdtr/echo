export function useTags() {
  const { $tags } = useNuxtApp()
  return useState('tags', () => $tags)
}
