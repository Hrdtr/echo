import { spawn } from 'node:child_process'
import type { UnimportOptions } from 'unimport'

const importPresets: UnimportOptions['presets'] = [
  {
    from: 'zod',
    imports: [
      'z',
      {
        name: 'z',
        as: 'zType',
        type: true,
      },
    ],
  },
]

let electronProcess: ReturnType<typeof spawn>

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@vueuse/nuxt'],
  devtools: {
    enabled: true,
  },
  hooks: {
    listen: () => {
      console.info('Starting electron dev process...')
      if (!electronProcess) {
        electronProcess = spawn('electron', ['lib/electron/dev.mjs'])
        electronProcess.stdout?.on('data', (data) => {
          console.info(`electron: ${data}`)
        })
        electronProcess.stderr?.on('data', (data) => {
          console.error(`electron: ${data}`)
        })
        electronProcess.on('close', (code) => {
          console.info(`Electron process exited with code ${code}`)
        })
      }
    },
    close: () => {
      if (electronProcess) electronProcess?.kill()
    },
  },
  nitro: {
    entry: process.env.NODE_ENV === 'production' ? undefined : '../preset/entry.dev',
    preset: './preset',
    imports: {
      presets: [
        ...importPresets,
        {
          from: 'drizzle-zod',
          imports: [
            'createInsertSchema',
            'createSelectSchema',
          ],
        },
        {
          from: 'drizzle-orm',
          imports: ['eq'],
        },
      ],
    },
  },
  imports: {
    presets: [
      ...importPresets,
      {
        from: '#ui/types',
        imports: ['FormSubmitEvent'],
        type: true,
      },
    ],
  },
})
