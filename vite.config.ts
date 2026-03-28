import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'copy-404',
      closeBundle() {
        const indexPath = path.resolve(__dirname, 'dist/index.html')
        const html = fs.readFileSync(indexPath, 'utf-8')
        fs.writeFileSync(path.resolve(__dirname, 'dist/404.html'), html)
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  base: '/Worktools/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild'
  }
})
