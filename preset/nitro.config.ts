import { fileURLToPath } from 'node:url'
import type { NitroPreset } from 'nitropack'

export default <NitroPreset>{
  extends: 'node', // You can extend existing presets
  entry: fileURLToPath(new URL('./entry.ts', import.meta.url)),
  serveStatic: true,
  hooks: {
    compiled() {
      // ...
    },
  },
  commands: {
    preview: 'node ./server/index.mjs',
  },
}
