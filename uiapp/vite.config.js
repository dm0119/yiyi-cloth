import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import Uni from '@uni-helper/plugin-uni'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5175,
    strictPort: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('代理请求:', req.method, req.url, '->', options.target + proxyReq.path)
          })
        }
      }
    }
  },
  plugins: [
    Uni({
      uniAppJsx:true,
      vite: {
        optimizeDeps: {
          include: ['vant']
        }
      }
    }),
  ],
  optimizeDeps: {
    include: ['vant']
  },
})


