<script setup>
import { onMounted, ref } from 'vue';
import TheHeader from './components/TheHeader.vue';
import ThemeToggle from './components/ThemeToggle.vue';
import ThePreloader from './components/ThePreloader.vue';
import TheFooter from './components/TheFooter.vue';

const theme = ref('light');

function applyTheme(newTheme) {
  document.documentElement.setAttribute('data-theme', newTheme);
  theme.value = newTheme;
}

onMounted(() => {
  // 初始化主题
  const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(systemTheme);
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    applyTheme(e.matches ? 'dark' : 'light');
  });
});
</script>

<template>
  <div class="app-container">
    <div class="app-body">
      <ThePreloader />
      <ThemeToggle @theme-change="applyTheme" />
      <TheHeader />
      <router-view></router-view>
    </div>
    <TheFooter />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.app-body {
  color: var(--text-color);
  flex: 1;
  width: 100%;
  position: relative;
}

/* 确保在内容不足时，body占据足够空间 */
.app-body {
  min-height: calc(100vh - 80px); /* 80px是估计的footer高度，可根据实际调整 */
}

/* 确保TheFooter在文档流中正确显示 */
/* 页面切换动画 */
.router-view {
  transition: all 0.3s ease;
}
</style>
