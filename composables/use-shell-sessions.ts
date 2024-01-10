export function useShellSessions() {
  return useState<{ id: string, connectionId: string, tabId: string }[]>('shell-sessions', () => ([]))
}
