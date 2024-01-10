export function useGroups() {
  const { $groups } = useNuxtApp()
  return useState('groups', () => $groups)
}
