import { defineConfig } from '#q-app/wrappers'
import { fileURLToPath } from 'node:url'

export default defineConfig((_ctx) => {
  return {
    boot: ['pinia', 'axios'],

    css: ['app.scss'],

    extras: ['material-icons', 'roboto-font'],

    build: {
      target: {
        // es2022+: necessário para o pipeline Vite/esbuild (ex.: pinia boot) sem falha de transpile
        browser: ['es2022', 'edge91', 'firefox90', 'chrome92', 'safari15.4'],
        node: 'node20',
      },
      typescript: {
        strict: true,
        vueShim: true,
      },
      vueRouterMode: 'hash',
      extendViteConf(viteConf) {
        viteConf.resolve ??= {}
        Object.assign(viteConf.resolve.alias ??= {}, {
          '@': fileURLToPath(new URL('./src', import.meta.url)),
        })
      },
    },

    devServer: {
      port: 3000,
      open: false,
    },

    framework: {
      config: {
        dark: 'auto',
        notify: { position: 'top-right', timeout: 3000 },
      },
      iconSet: 'material-icons',
      lang: 'pt-BR',
      plugins: ['Dialog', 'Notify', 'Dark', 'Loading', 'LocalStorage'],
    },

    animations: [],

    ssr: { pwa: false, prodPort: 3000, middlewares: ['render'] },
    pwa: {
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
    },
  }
})
