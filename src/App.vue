<script setup>
import { ref } from 'vue';
const currentPage = ref('home');
const theme = ref(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(theme.value);

function applyTheme(newTheme) {
  document.documentElement.setAttribute('data-theme', newTheme);
  theme.value = newTheme;
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  const newTheme = e.matches ? 'dark' : 'light';
  applyTheme(newTheme);
});

import TheHeader from './components/TheHeader.vue';
import ThemeToggle from './components/ThemeToggle.vue';
import ThePreloader from './components/ThePreloader.vue';
import HomePage from './components/HomePage/HomePage.vue';
import GalleryPage from './components/GalleryPage/GalleryPage.vue';
import ResearchPage from './components/ResearchPage/ResearchPage.vue';
import LifePage from './components/LifePage/LifePage.vue';
import TheFooter from './components/TheFooter.vue';
</script>

<template>
  <div class="app-container">
    <div class="app-body">
      <ThePreloader />
      <TheHeader />
      <ThemeToggle @theme-change="applyTheme" />
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
