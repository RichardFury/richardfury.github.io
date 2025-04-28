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
  <div class="app-body">
    <ThePreloader />
    <TheHeader />
    <ThemeToggle @theme-change="applyTheme" />
    <router-view></router-view>
    <TheFooter />
  </div>
</template>

<style scoped>
.app-body {
  color: var(--text-color);
}
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
