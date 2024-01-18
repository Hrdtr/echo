export function useSettings() {
  const colorMode = useColorMode()

  return {
    appearance: {
      theme: {
        title: 'Theme',
        description: 'Switch between light and dark mode.',
        component: defineAsyncComponent(() => import('~/components/settings/appearance/theme.vue')),
        state: { colorMode },
      },
    },
    keys: {
      generate: {
        title: 'Generate Key Pair',
        description: 'Generate an RSA or ED25519 key pair.',
        component: defineAsyncComponent(() => import('~/components/settings/keys/generate.vue')),
        state: {},
      },
    },
    about: {
      echo: {
        title: 'Echo',
        description: null,
        component: defineAsyncComponent(() => import('~/components/settings/about/echo.vue')),
        state: {},
      },
      version: {
        title: 'Version Information',
        description: null,
        component: defineAsyncComponent(() => import('~/components/settings/about/version.vue')),
        state: {},
      },
      acknowledgments: {
        title: 'Acknowledgments',
        description: null,
        component: defineAsyncComponent(() => import('~/components/settings/about/acknowledgments.vue')),
        state: {},
      },
      feedbackAndSupport: {
        title: 'Feedback and Support',
        description: null,
        component: defineAsyncComponent(() => import('~/components/settings/about/feedback-and-support.vue')),
        state: {},
      },
    },
  }
}
