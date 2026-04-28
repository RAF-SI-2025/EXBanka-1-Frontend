import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      __API_HOST__: JSON.stringify(env.VITE_API_HOST ?? 'http://localhost:8080'),
      __API_VERSION__: JSON.stringify(env.VITE_API_VERSION ?? 'v3'),
    },
  }
})
