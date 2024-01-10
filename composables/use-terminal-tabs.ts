export function useTerminalTabs() {
  return useState<{ id: string, label: string, active: boolean }[]>('terminal-tabs', () => [])
}
