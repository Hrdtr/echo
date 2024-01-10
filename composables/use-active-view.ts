export function useActiveView() {
  return useState<'terminal' | 'settings'>('active-view', () => 'terminal')
}
