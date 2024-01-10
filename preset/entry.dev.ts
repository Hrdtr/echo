import '#internal/nitro/virtual/polyfill'
import { Server } from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { parentPort, threadId } from 'node:worker_threads'
import { Server as SocketServer } from 'socket.io'
import { isWindows, provider } from 'std-env'
import { toNodeListener } from 'h3'
import { trapUnhandledNodeErrors } from '#internal/nitro/utils'
import { socketHandler } from '~/server/socket-handler'

const nitroApp = useNitroApp()

const server = new Server(toNodeListener(nitroApp.h3App))

function getAddress() {
  if (
    provider === 'stackblitz'
    || process.env.NITRO_NO_UNIX_SOCKET
    || process.versions.bun
  )
    return 0

  const socketName = `worker-${process.pid}-${threadId}.sock`
  if (isWindows) {
    return join('\\\\.\\pipe\\nitro', socketName)
  }
  else {
    const socketDir = join(tmpdir(), 'nitro')
    mkdirSync(socketDir, { recursive: true })
    return join(socketDir, socketName)
  }
}

const listenAddress = getAddress()

// eslint-disable-next-line unused-imports/no-unused-vars
const listener = server.listen(listenAddress, () => {
  const _address = server.address()
  parentPort?.postMessage({
    event: 'listen',
    address:
      typeof _address === 'string'
        ? { socketPath: _address }
        : { host: 'localhost', port: _address?.port },
  })
})

const io = new SocketServer(server)
socketHandler(io)
nitroApp.hooks.beforeEach((event) => {
  if (event.name === 'request')
    // @ts-expect-error ...
    if (event.args.length > 1) event.args[1]._socket = io
})

// Trap unhandled errors
trapUnhandledNodeErrors()

// Graceful shutdown
async function onShutdown(_signal?: NodeJS.Signals) {
  await nitroApp.hooks.callHook('close')
}

parentPort?.on('message', async (msg) => {
  if (msg && msg.event === 'shutdown') {
    await onShutdown()
    parentPort?.postMessage({ event: 'exit' })
  }
})
