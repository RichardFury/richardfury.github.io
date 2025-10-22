<template>
  <div class="life-page-container">
    <h1 class="page-title">我的生活片段</h1>
    <div class="page-description">
      除了科学研究，我还有丰富多彩的兴趣爱好和生活经历。
    </div>
    <PhotographySection />
    <OutdoorSection />
    <BandSection />
  </div>
</template>

<script setup>
import PhotographySection from './PhotographySection.vue';
import OutdoorSection from './OutdoorSection.vue';
import BandSection from './BandSection.vue';
</script>

<style scoped>
.life-page-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.page-title {
  font-size: 1.8em;
  font-weight: 700;
  color: var(--text-color);
  text-align: left;
  margin-bottom: 0.5rem;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
}

.page-description {
  font-size: 1em;
  color: var(--text-secondary-color);
  text-align: left;
  max-width: 800px;
  margin: 0 0 1rem 0;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out 0.2s forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .life-page-container {
    padding: 0 1.5rem;
    gap: 1.5rem;
  }
  
  .page-title {
    font-size: 1.6em;
  }
  
  .page-description {
    font-size: 0.95em;
  }
}

@media (max-width: 480px) {
  .life-page-container {
    padding: 0 1rem;
  }
  
  .page-title {
    font-size: 1.4em;
  }
  
  .page-description {
    font-size: 0.9em;
  }
}

/* 深色主题优化 */
[data-theme="dark"] .page-title {
  color: var(--light-text-color);
}
</style>