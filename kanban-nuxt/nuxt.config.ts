// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    configPath: '~/tailwind.config.js',
    exposeConfig: false,
    viewer: false,
  },

  app: {
    head: {
      title: 'Kanban Board - Nuxt',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        {
          rel: 'dns-prefetch',
          href: 'https://cdn.jsdelivr.net'
        },
        {
          rel: 'preconnect',
          href: 'https://cdn.jsdelivr.net',
          crossorigin: 'anonymous'
        },
      ],
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: [],
    },
    compressPublicAssets: true,
    experimental: {
      asyncContext: true,
    },
  },

  routeRules: {
    '/api/**': {
      cors: true,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
    '/_nuxt/**': {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    },
    '/**': {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    },
  },

  vite: {
    build: {
      rollupOptions: {
        treeshake: {
          preset: 'recommended', // Enable aggressive tree-shaking
        },
        output: {
          manualChunks: {
            'vuedraggable': ['vuedraggable'],
            'auto-animate': ['@formkit/auto-animate'],
          },
        },
      },
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        treeShaking: true,
      },
      include: ['vuedraggable', '@formkit/auto-animate/vue'],
    },
  },

  experimental: {
    payloadExtraction: false,
    viewTransition: true,
    headNext: true,
    componentIslands: true, // Enable code-splitting for components
  },

  features: {
    inlineStyles: false,
  },
})
