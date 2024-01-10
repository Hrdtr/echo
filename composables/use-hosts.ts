export function useHosts() {
  const { $hosts } = useNuxtApp()
  return useState('hosts', () => $hosts)
}
