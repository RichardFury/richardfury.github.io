<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  theme: {
    type: String,
    default: 'light'
  }
});

const emit = defineEmits(['toggle-theme']);
const router = useRouter();
const isMobileMenuOpen = ref(false);
const isScrolled = ref(false);

// 导航链接数据
const navLinks = [
  { name: 'Home', path: '/' },
  // { name: 'CV', path: '/cv' }, // 暂时注释掉CV导航项
  { name: 'Research', path: '/research' },
  { name: 'Blog', path: '/blog' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Contact', path: '/contact' }
];

// 切换主题
function handleToggleTheme() {
  emit('toggle-theme');
}

// 切换移动菜单
function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
}

// 导航到指定路径
function navigateTo(path) {
  router.push(path);
  isMobileMenuOpen.value = false;
}

// 计算当前激活的导航项
const activeNavItem = computed(() => {
  return router.currentRoute.value.path;
});

// 监听滚动事件
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// 组件挂载
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

// 组件卸载
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header 
    class="nav glass-effect"
    :class="{ 'scrolled': isScrolled }"
  >
    <div class="container">
      <div class="nav-content">
        <!-- Logo -->
        <div class="nav-logo">
          <router-link to="/" class="logo-link">
            <h1 class="logo-text">Richard Fury</h1>
          </router-link>
        </div>
        
        <!-- 桌面导航 -->
        <nav class="nav-desktop">
          <ul class="nav-list">
            <li 
              v-for="link in navLinks" 
              :key="link.path"
              class="nav-item"
            >
              <router-link
                :to="link.path"
                @click="isMobileMenuOpen = false"
                :class="{ 'nav-link-active': activeNavItem === link.path }"
                class="nav-link"
              >
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </nav>
        
        <!-- 主题切换 -->
        <div class="theme-toggle" @click="handleToggleTheme" aria-label="Toggle theme">
          <svg v-if="theme === 'light'" class="theme-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg v-else class="theme-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        
        <!-- 移动菜单按钮 -->
        <button 
          class="mobile-menu-btn"
          @click="toggleMobileMenu"
          aria-label="Toggle menu"
        >
          <span class="menu-icon">{{ isMobileMenuOpen ? '✕' : '☰' }}</span>
        </button>
      </div>
      
      <!-- 移动导航菜单 -->
        <div 
          v-if="isMobileMenuOpen"
          class="nav-mobile glass-effect"
        >
          <ul class="nav-list-mobile">
            <li 
              v-for="link in navLinks" 
              :key="link.path"
              class="nav-item-mobile"
            >
              <router-link
                :to="link.path"
                @click="isMobileMenuOpen = false"
                :class="{ 'nav-link-active': activeNavItem === link.path }"
                class="nav-link-mobile"
              >
                {{ link.name }}
              </router-link>
            </li>
          </ul>
        </div>
    </div>
  </header>
</template>

<style scoped>
.nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: var(--spacing-md) 0;
  transition: all var(--transition-normal);
  background: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.nav.scrolled {
  background: rgba(255, 255, 255, 0.50);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

[data-theme="dark"] .nav.scrolled {
  background: rgba(0, 0, 0, 0.50);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-logo {
  cursor: pointer;
  transition: transform var(--transition-normal);
}

.nav-logo:hover {
  transform: scale(1.05);
}

.logo-text {
  font-family: 'Whisper', serif;
  font-size: 3rem;
  font-weight: 550;
  letter-spacing: 0.05em;
  margin: 0;
  color: var(--text-primary);
}

/* 桌面导航样式 */
.nav-desktop {
  display: none;
}

@media (min-width: 768px) {
  .nav-desktop {
    display: block;
  }
}

.nav-list {
  display: flex;
  list-style: none;
  gap: var(--spacing-xl);
  margin: 0;
  padding: 0;
}

.nav-item {
  position: relative;
}

.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  font-size: 1.05rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  transition: all var(--transition-normal);
  padding: var(--spacing-sm) 0;
  position: relative;
}

.nav-link:hover {
  color: var(--accent-primary);
}

.nav-link-active {
  color: var(--accent-primary);
}

.nav-link-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--accent-primary);
  border-radius: 1px;
}

/* 主题切换按钮 */
.theme-toggle {
  cursor: pointer;
  transition: all var(--transition-normal);
  padding: var(--spacing-sm);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: var(--spacing-md);
}

.theme-icon {
  width: 24px;
  height: 24px;
  color: var(--text-primary);
  transition: all var(--transition-normal);
}

.theme-toggle:hover {
  background-color: rgba(107, 114, 128, 0.15);
}

[data-theme="dark"] .theme-toggle:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

.theme-toggle:hover .theme-icon {
  transform: rotate(180deg);
  color: var(--accent-primary);
}

[data-theme="dark"] .theme-toggle:hover .theme-icon {
  color: var(--accent-secondary);
}

/* 移动菜单按钮 */
.mobile-menu-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-primary);
  cursor: pointer;
  padding: var(--spacing-sm);
  transition: all var(--transition-normal);
}

.mobile-menu-btn:hover {
  transform: scale(1.1);
}

@media (min-width: 768px) {
  .mobile-menu-btn {
    display: none;
  }
}

/* 移动导航菜单 */
.nav-mobile {
  margin-top: var(--spacing-md);
  padding: var(--spacing-lg);
  border-radius: 12px;
  animation: slideDown var(--transition-normal) ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-list-mobile {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item-mobile {
  margin-bottom: var(--spacing-md);
}

.nav-item-mobile:last-child {
  margin-bottom: 0;
}

.nav-link-mobile {
  color: var(--text-primary);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 300;
  transition: all var(--transition-normal);
  display: block;
  padding: var(--spacing-sm) 0;
}

.nav-link-mobile:hover {
  color: var(--accent-primary);
  transform: translateX(5px);
}

.nav-link-active {
  color: var(--accent-primary);
}
</style>