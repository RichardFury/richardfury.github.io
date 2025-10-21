<template>
  <div class="theme-toggle" @click="toggleTheme">
    <div class="slider" :class="theme"></div>
    <svg class="light-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/></svg>
    <svg class="dark-icon" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/></svg>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['theme-change']);
const theme = ref('light');

function getSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const toggleTheme = () => {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme.value);
  emit('theme-change', theme.value);
};

onMounted(() => {
  // 初始化主题
  theme.value = getSystemTheme();
  emit('theme-change', theme.value);
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    theme.value = e.matches ? 'dark' : 'light';
    emit('theme-change', theme.value);
  });
});
</script>

<style scoped>
.theme-toggle {
  position: absolute;
  display: inline-block;
  width: 60px;
  height: 24px;
  top: 20px;
  right: 20px;
  border-radius: 34px;
  background-color: #808080;
  cursor: pointer;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  width: 47%;
  height: 20px;
  background-color: var(--slider-bg);
  border-radius: 34px;
  transition: 0.4s;
  z-index: 1;
}

.light {
  transform: translateX(0);
  background-color: #000;
  color: #fff;
  z-index: 1;
  content: 'Dark';
}

.dark {
  transform: translateX(100%);
  background-color: #fff;
  z-index: 1;
  color: #000;
  content: 'Light';
}

.dark-label {
  color: var(--label-color);
}

.light-icon, .dark-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  fill: #FFD700;
}

.light-icon {
  left: 10px;
}

.dark-icon {
  right: 10px;
}
</style>