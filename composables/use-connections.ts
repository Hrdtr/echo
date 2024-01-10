export function useConnections() {
  return useState<{
    id: string
    hostId: number
    pending: boolean
  }[]>('connections', () => ([]))
}
