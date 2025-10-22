import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages部署的base路径配置
  // 对于username.github.io格式的仓库，base路径设置为'/'
  base: '/'
})
