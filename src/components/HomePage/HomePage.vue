<script setup>
import { ref, onMounted } from 'vue';
import HeroCarousel from './HeroCarousel.vue';
import heroCarouselSlides from '../../data/hero-carousel.json';
import { logger } from '../../utils/logger';

// 获取当前主题
const theme = ref(document.documentElement.getAttribute('data-theme') || 'light');

// 监听主题变化
onMounted(() => {
  const updateTheme = () => {
    theme.value = document.documentElement.getAttribute('data-theme') || 'light';
  };

  // 添加事件监听
  document.addEventListener('themeChange', updateTheme);

  // 清理函数
  return () => {
    document.removeEventListener('themeChange', updateTheme);
  };
});

// 处理幻灯片变化
const handleSlideChange = (index) => {
  logger.debug('Slide changed to:', index);
};

// 处理卡片点击
const handleCardClick = (slide, index) => {
  logger.debug('Card clicked:', slide, index);
};
</script>

<template>
  <div class="home-page" :class="theme">
    <!-- Hero Carousel Section - 横向滚动高光时刻区域 -->
    <HeroCarousel
      :slides="heroCarouselSlides"
      :autoplay="true"
      :interval="5000"
      :show-navigation="true"
      :show-indicators="true"
      @slide-change="handleSlideChange"
      @click="handleCardClick"
    />

    <!-- Concepts Section - 核心概念区域 -->
    <section class="concepts-section" aria-labelledby="concepts-title">
      <div class="container">
        <div class="section-header">
          <h2 id="concepts-title" class="section-title">Core Concepts</h2>
          <p class="section-description">The intersection of science, art, and minimalism</p>
        </div>

        <div class="concepts-grid">
          <!-- 概念卡片 1 -->
          <article class="concept-card">
            <div class="concept-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                <path d="M2 12h20"/>
              </svg>
            </div>
            <h3 class="concept-title">Cosmic Exploration</h3>
            <p class="concept-description">Studying mysteries of dark matter and origins of universe through minimalist perspectives.</p>
          </article>

          <!-- 概念卡片 2 -->
          <article class="concept-card">
            <div class="concept-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="4"/>
                <line x1="21.17" y1="8" x2="12" y2="8"/>
                <line x1="3.95" y1="6.06" x2="8.54" y2="14"/>
                <line x1="10.88" y1="21.94" x2="15.46" y2="14"/>
              </svg>
            </div>
            <h3 class="concept-title">Wildness Photograph</h3>
            <p class="concept-description">Finding beauty in wildness and the unknown through lens.</p>
          </article>

          <!-- 概念卡片 3 -->
          <article class="concept-card">
            <div class="concept-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <h3 class="concept-title">Throughts</h3>
            <p class="concept-description">Je pense, donc je suis.</p>
          </article>
        </div>
      </div>
    </section>

    <!-- Contact Section - 联系区域 -->
    <section class="contact-section" aria-labelledby="contact-title">
      <div class="container">
        <div class="contact-content">
          <h2 id="contact-title" class="contact-title">Let's Connect</h2>
          <p class="contact-description">Interested in collaboration or have questions? Feel free to reach out.</p>
          <router-link to="/contact" class="contact-button" aria-label="Send a message">
            Contact Me
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ========================================
   极简主义设计规范 - Richard Fury Home Page
   设计原则：大量留白、统一排版、简化动画
   方案特点：使用横向滚动Hero Carousel替换静态Hero Section
======================================== */

/* 全局容器 */
.home-page {
  position: relative;
  width: 100%;
  overflow-x: hidden;
  background-color: var(--bg-primary);
  color: var(--text-primary);
}

/* ========================================
   Section Header - 统一的章节标题样式
======================================== */
.section-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 300;
  margin: var(--spacing-md) 0;
  color: var(--text-primary);
  font-family: 'Playfair Display', 'Georgia', serif;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.section-description {
  color: var(--text-secondary);
  max-width: 500px;
  margin: 0 auto;
  line-height: 1.7;
  font-weight: 300;
  letter-spacing: 0.005em;
}

/* ========================================
   Concepts Section - 核心概念区域
   设计重点：网格布局、统一间距、极简卡片
======================================== */
/*
.concepts-section {
  background-color: var(--bg-secondary);
}
*/

.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

.concepts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-2xl);
}

@media (min-width: 768px) {
  .concepts-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--spacing-3xl);
  }
}

.concept-card {
  background-color: var(--bg-primary);
  padding: var(--spacing-3xl) var(--spacing-2xl);
  border-radius: 4px;
  border: 1px solid var(--glass-border);
  transition: all 0.4s ease;
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
  text-align: center;
}

.concept-card:nth-child(1) {
  animation-delay: 0.1s;
}

.concept-card:nth-child(2) {
  animation-delay: 0.2s;
}

.concept-card:nth-child(3) {
  animation-delay: 0.3s;
}

.concept-card:hover {
  transform: translateY(-8px);
  border-color: var(--accent-tertiary);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
}

.concept-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  transition: all 0.4s ease;
}

.concept-card:hover .concept-icon {
  transform: scale(1.1);
  color: var(--accent-secondary);
}

.concept-icon svg {
  width: 100%;
  height: 100%;
}

.concept-title {
  font-size: 1.375rem;
  font-weight: 400;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  font-family: 'Playfair Display', 'Georgia', serif;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.concept-description {
  color: var(--text-secondary);
  line-height: 1.8;
  font-weight: 300;
  font-size: 0.95rem;
  letter-spacing: 0.005em;
}

/* ========================================
   Contact Section - 联系区域
   设计重点：居中对齐、简洁按钮、大量留白
======================================== */
.contact-section {
  padding: var(--spacing-4xl) 0;
  margin-top: var(--spacing-4xl) 0;
  /*
  background-color: var(--bg-secondary);
  */
  text-align: center;
}

.contact-content {
  max-width: 600px;
  margin: 0 auto;
  animation: fadeInUp 0.6s ease-out;
}

.contact-title {
  font-size: 2.5rem;
  font-weight: 300;
  color: var(--text-primary);
  font-family: 'Playfair Display', 'Georgia', serif;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: var(--spacing-md) 0;
}

.contact-description {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-2xl);
  line-height: 1.8;
  font-weight: 300;
  letter-spacing: 0.005em;
}

.contact-button {
  display: inline-block;
  padding: var(--spacing-md) var(--spacing-2xl);
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  text-decoration: none;
  font-weight: 400;
  font-size: 0.95rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  letter-spacing: 0.02em;
  border: 1px solid var(--accent-primary);
}

.contact-button:hover {
  background-color: transparent;
  color: var(--accent-primary);
  transform: translateY(-2px);
}

.contact-button:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* ========================================
   动画效果 - 简化版
======================================== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   响应式设计规范
======================================== */

/* 大屏幕优化 (1440px+) */
@media (min-width: 1440px) {
  .concepts-section,
  .contact-section {
    padding: calc(var(--spacing-4xl) * 1.5) 0;
  }

  .section-title {
    font-size: 2.75rem;
  }
}

/* 中等屏幕优化 (1024px - 1439px) */
@media (max-width: 1439px) and (min-width: 1024px) {
  /* 保持默认样式 */
}

/* 平板优化 (768px - 1023px) */
@media (max-width: 1023px) {
  .concepts-section,
  .contact-section {
    padding: var(--spacing-3xl) 0;
  }

  .section-title,
  .contact-title {
    font-size: 2rem;
  }

  .concepts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 移动设备优化 (480px - 767px) */
@media (max-width: 767px) {
  .concepts-section,
  .contact-section {
    padding: var(--spacing-2xl) 0;
  }

  .concepts-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-xl);
  }

  .concept-card {
    padding: var(--spacing-2xl) var(--spacing-xl);
  }

  .concept-title {
    font-size: 1.25rem;
  }

  .concept-description {
    font-size: 0.9rem;
  }

  .section-title,
  .contact-title {
    font-size: 1.75rem;
  }

  .section-description,
  .contact-description {
    font-size: 1rem;
  }

  .contact-button {
    padding: var(--spacing-sm) var(--spacing-xl);
    font-size: 0.9rem;
  }
}

/* 小屏幕优化 (最大 479px) */
@media (max-width: 479px) {
  .concept-card {
    padding: var(--spacing-xl);
  }

  .concept-icon {
    width: 56px;
    height: 56px;
  }

  .concept-title {
    font-size: 1.125rem;
  }

  .concept-description {
    font-size: 0.875rem;
  }

  .section-title,
  .contact-title {
    font-size: 1.5rem;
  }
}

/* ========================================
   可访问性优化
======================================== */

/* 减少动画效果（尊重用户偏好） */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .concept-card,
  .contact-content {
    animation: none;
    opacity: 1;
    transform: none;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .concept-card {
    border-width: 2px;
  }

  .contact-button {
    border-width: 2px;
  }
}

/* 焦点可见性增强 */
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* 文本选择样式 */
::selection {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
}

/* ========================================
   打印样式优化
======================================== */
@media print {
  .concepts-section,
  .contact-section {
    page-break-inside: avoid;
  }

  .contact-button {
    display: none;
  }

  .concept-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>
