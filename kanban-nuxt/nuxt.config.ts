// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  future: {
    compatibilityVersion: 4,
  },
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxt/fonts'],

  css: ['~/assets/css/main.css', 'charts.css'],

  fonts: {
    defaults: {
      fallbacks: {
        'sans-serif': ['Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },

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
    },
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  nitro: {
    preset: 'cloudflare-pages',
    prerender: {
      crawlLinks: false,
      routes: [],
      autoSubfolderIndex: false, // Required for Cloudflare Pages
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
    '/': {
      swr: 60, // Cache homepage for 60 seconds with stale-while-revalidate
    },
    '/board/**': {
      swr: 60, // Cache board pages for 60 seconds with stale-while-revalidate
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
      include: ['@formkit/auto-animate/vue'],
    },
  },

  experimental: {
    payloadExtraction: false,
    viewTransition: true,
    headNext: true,
    componentIslands: true, // Enable code-splitting for components
  },

  features: {
    inlineStyles: true, // Inline styles to improve LCP by avoiding render-blocking CSS
  },
})
