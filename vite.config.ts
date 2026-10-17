import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'

/** 浏览器端请求经由本地代理转发到 DeepSeek，规避 CORS 与密钥暴露在第三方页面的问题 */
const proxy: Record<string, ProxyOptions> = {
  '/deepseek-api': {
    target: 'https://api.deepseek.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/deepseek-api/, ''),
  },
}

export default defineConfig({
  // 相对路径：构建产物可部署在任意子路径下（如 GitHub Pages 的 /<仓库名>/）
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  css: {
    modules: { localsConvention: 'camelCaseOnly' },
  },
  server: { proxy },
  preview: { proxy },
})
