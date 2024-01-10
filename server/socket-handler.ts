import utf8 from 'utf8'
import { Client as SSHClient } from 'ssh2'
import type { Server } from 'socket.io'

export async function socketHandler(io: Server) {
  io.on('connection', (socket) => {
    socket.on('open', async (connectionId: string) => {
      try {
        const host = await db.query.host.findFirst({
          where: (data, { eq }) => eq(data.id, Number(connectionId.split(':')[0])),
        })
        if (!host) { socket.emit(connectionId, '\rerror: Host not found.\r\n') }
        else {
          let privateKey
          const passphrase = host.privateKeyPassphrase === null ? undefined : host.privateKeyPassphrase
          if (host.privateKey) {
            const key = sshpk.parsePrivateKey(host.privateKey, 'auto', { passphrase })
            privateKey = key.toString('pem')
          }

          const ssh = new SSHClient()

          ssh.on('ready', () => {
            socket.emit(connectionId, '\rinfo: Connection established.\r\n\n')
            socket.on(`${connectionId}:close`, () => ssh.end())

            // Shell Session Handler
            socket.on(`${connectionId}:shell`, (sessionId: string) => {
              ssh.shell((err, stream) => {
                if (err) return socket.emit(`${connectionId}:${sessionId}`, `\r\nshell_error: ${err.message}\r\n`)

                socket.on(`${connectionId}:${sessionId}`, data => stream.write(data))
                socket.on(`${connectionId}:${sessionId}:close`, () => stream.close())
                stream.on('data', (d: any) => socket.emit(`${connectionId}:${sessionId}`, utf8.decode(d.toString('binary'))))
                stream.on('close', () => socket.emit(`${connectionId}:${sessionId}`, '\rsession ended.\r\n'))
              })
            })

            // TODO: SFTP Session Handler
            socket.on(`${connectionId}:sftp`, (sessionId: string) => {
              socket.emit(`${connectionId}:${sessionId}`, '\rTBD\r\n')
            })
          })

          ssh.on('close', () => {
            socket.emit(connectionId, '\r\ninfo: Connection closed.\r\n')
          })

          ssh.on('error', (err) => {
            console.error(err)
            socket.emit(connectionId, `\rerror: ${err.message}\r\n`)
          })

          ssh.connect({
            host: host.host,
            port: host.port,
            username: host.username,
            password: host.password === null ? undefined : host.password,
            privateKey,
          })
        }
      }
      catch (err) {
        console.error(err)
        socket.emit(connectionId, `\r\nerror:${String(err)}\r\n`)
      }
    })
  })
}
