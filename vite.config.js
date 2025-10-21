import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages部署的base路径配置
  // 如果你的仓库名称是'newprofile'，则保持这个配置
  // 如果你使用自定义域名，可以设置为'/'
  base: '/newprofile/'
})
