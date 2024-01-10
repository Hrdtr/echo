import '#internal/nitro/virtual/polyfill'
import { Server as HttpServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { Server as HttpsServer } from 'node:https'
import { Server as SocketServer } from 'socket.io'
import destr from 'destr'
import { toNodeListener } from 'h3'
import { setupGracefulShutdown } from '#internal/nitro/shutdown'
import { trapUnhandledNodeErrors } from '#internal/nitro/utils'
import { socketHandler } from '~/server/socket-handler'

const nitroApp = useNitroApp()

const cert = process.env.NITRO_SSL_CERT
const key = process.env.NITRO_SSL_KEY

const server = cert && key
  ? new HttpsServer({ key, cert }, toNodeListener(nitroApp.h3App))
  : new HttpServer(toNodeListener(nitroApp.h3App))

const port = (destr(process.env.NITRO_PORT || process.env.PORT) || 3000) as number
const host = process.env.NITRO_HOST || process.env.HOST

const path = process.env.NITRO_UNIX_SOCKET

// @ts-expect-error ...
const listener = server.listen(path ? { path } : { port, host }, (err) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  const protocol = cert && key ? 'https' : 'http'
  const addressInfo = listener.address() as AddressInfo
  if (typeof addressInfo === 'string') {
    console.info(`Listening on unix socket ${addressInfo}`)
    return
  }
  const baseURL = (useRuntimeConfig().app.baseURL || '').replace(/\/$/, '')
  const url = `${protocol}://${
    addressInfo.family === 'IPv6'
      ? `[${addressInfo.address}]`
      : addressInfo.address
  }:${addressInfo.port}${baseURL}`
  console.info(`Listening on ${url}`)
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
setupGracefulShutdown(listener, nitroApp)

export default {}
