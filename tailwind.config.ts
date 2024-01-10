import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

export default <Partial<Config>>{
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.min-h-dvh': generate('minHeight'),
        '.h-dvh': generate('height'),
      })

      function generate(property: string) {
        return {
          [property]: [
            'calc(100vh - env(safe-area-inset-bottom, 0) - env(safe-area-inset-top, 0))',
            '100dvh',
          ],
          '@supports (-webkit-touch-callout: none)': {
            [property]: ['-webkit-fill-available', '100dvh'],
          },
        }
      }
    }),
  ],
}
