export function useConfirmationDialog() {
  const state = useState(() => ({
    visible: false,
    pending: false,
  }))

  interface Payload {
    title: string
    description: string
    danger?: boolean
    onConfirm?: (resolve: () => void, pending: (value: boolean) => void) => void
  }
  const data = useState<Payload>(() => ({
    title: 'Confirmation',
    description: '',
  }))

  watch(() => state.value.visible, (val) => {
    setTimeout(() => {
      if (!val) {
        data.value = {
          title: 'Confirmation',
          description: '',
        }
      }
    }, 250)
  })

  const reveal = (payload: Payload) => {
    data.value = {
      title: payload.title,
      description: payload.description,
      danger: payload.danger,
      onConfirm: payload.onConfirm ?? (resolve => resolve()),
    }
    state.value = {
      visible: true,
      pending: false,
    }
  }

  return { reveal, state, data }
}
