export function useContextMenu(stateRef: Ref<boolean>) {
  const states = useState<Ref<boolean>[]>('context-menu-states', () => [])
  states.value.push(stateRef)

  const { x, y } = useMouse()
  const { y: windowY } = useWindowScroll()

  const virtualElement = useState('context-menu-virtual-element', () => ({
    getBoundingClientRect: null as (() => void) | null,
  }))

  function show() {
    for (const state of states.value) state.value = false

    const top = unref(y) - unref(windowY)
    const left = unref(x)

    virtualElement.value.getBoundingClientRect = () => ({
      width: 0,
      height: 0,
      top,
      left,
    })
    stateRef.value = true
  }
  function hide() {
    stateRef.value = false
  }

  return { show, hide, virtualElement }
}
