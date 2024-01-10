import { io } from 'socket.io-client'

const socket = io()
export default defineNuxtPlugin(() => {
  return {
    provide: { socket },
  }
})
