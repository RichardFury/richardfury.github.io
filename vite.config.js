import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  // GitHub Pages 配置
  // 对于用户名.github.io类型的仓库，base路径为根目录
  base: '/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    // 优化静态资源加载
    rollupOptions: {
      output: {
        // 静态资源分类打包
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      }
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 压缩代码
    minify: 'terser',
    // 移除console和debugger
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
