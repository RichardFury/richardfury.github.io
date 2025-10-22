<template>
  <div class="section-container photography-section">
    <div class="section-header">
      <h2 class="section-title">摄影作品</h2>
      <p class="section-subtitle">用镜头记录生活中的美好瞬间</p>
    </div>
    <div class="photo-grid">
      <div 
        v-for="(photo, index) in photos" 
        :key="index" 
        class="photo-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="photo-image-container">
          <img 
            :src="photo.image" 
            :alt="photo.title" 
            class="photo-image" 
            @load="imageLoaded(photo.id)"
          />
          <div class="photo-overlay">
            <span class="photo-category">{{ photo.category }}</span>
          </div>
        </div>
        <div class="photo-info">
          <h3 class="photo-title">{{ photo.title }}</h3>
          <p class="photo-description">{{ photo.description }}</p>
          <div class="photo-meta">
            <span class="photo-date">{{ photo.date }}</span>
            <span class="photo-location">{{ photo.location }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { initWaterfall } from '../../utils/waterfall'

const loadedImages = ref(new Set())
let waterfall = null

const photos = [
  {
    id: 1,
    image: '/images/photography1.jpg',
    title: '城市夜景',
    description: '捕捉城市夜晚的璀璨灯光，感受都市的脉动与活力',
    category: '城市',
    date: '2023.10',
    location: '上海'
  },
  {
    id: 2,
    image: '/images/photography2.jpg',
    title: '自然风光',
    description: '展现大自然的壮丽景色，探索地球的奇妙景观',
    category: '自然',
    date: '2023.08',
    location: '黄山'
  },
  {
    id: 3,
    image: '/images/photography3.jpg',
    title: '人文纪实',
    description: '记录普通人的生活瞬间，传递人间真情',
    category: '人文',
    date: '2023.06',
    location: '成都'
  },
  {
    id: 4,
    image: '/images/photography4.jpg',
    title: '静物特写',
    description: '通过微距镜头发现微观世界的美丽细节',
    category: '静物',
    date: '2023.04',
    location: '工作室'
  }
]

const imageLoaded = (id) => {
  loadedImages.value.add(id)
}

const initGallery = () => {
  if (loadedImages.value.size === photos.length && !waterfall) {
    waterfall = initWaterfall('.photography-section', '.photo-card')
  }
}

watchEffect(() => {
  if (loadedImages.value.size === photos.length) {
    setTimeout(initGallery, 100)
  }
})

onMounted(() => {
  // 检查是否所有图片已经加载完成
  const checkImages = () => {
    if (loadedImages.value.size === photos.length) {
      initGallery()
    } else {
      setTimeout(checkImages, 100)
    }
  }
  checkImages()
})

onUnmounted(() => {
  waterfall?.destroy()
})
</script>

<style scoped>
.section-container {
  position: relative;
  margin: 1rem 0;
  background: transparent;
  border-radius: 16px;
  border: none;
  transition: all 0.3s ease;
  overflow: hidden;
}

.section-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 48%,
    rgba(var(--accent-rgb), 0.05) 49%,
    rgba(var(--accent-rgb), 0.05) 51%,
    transparent 52%
  );
  animation: patternMove 20s linear infinite;
  pointer-events: none;
}

.section-header {
  position: relative;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.4em;
  font-weight: 700;
  color: var(--text-color);
  margin-bottom: 0.5rem;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 0;
  width: 60px;
  height: 4px;
  background: var(--accent-color);
  border-radius: 2px;
}

.section-subtitle {
  font-size: 1em;
  color: var(--text-secondary-color);
  margin: 0;
}

.photo-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.photo-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  transform: translateY(20px);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.photo-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.photo-image-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/3;
}

.photo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.photo-card:hover .photo-image {
  transform: scale(1.05);
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 70%, rgba(0, 0, 0, 0.6));
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  padding: 1rem;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
}

.photo-category {
  background: var(--accent-color);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.photo-info {
  padding: 1.5rem;
}

.photo-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.7rem;
}

.photo-description {
  font-size: 0.95rem;
  color: var(--text-secondary-color);
  margin: 0 0 1rem;
  line-height: 1.6;
}

.photo-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-tertiary-color);
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

@keyframes patternMove {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .section-container {
    padding: 1.5rem;
  }
  
  .section-title {
    font-size: 1.3em;
  }
  
  .section-subtitle {
    font-size: 0.95em;
  }
  
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.2rem;
  }
  
  .photo-info {
    padding: 1.2rem;
  }
}

@media (max-width: 480px) {
  .section-container {
    padding: 1.2rem;
    margin: 0.8rem 0;
  }
  
  .section-title {
    font-size: 1.2em;
  }
  
  .section-subtitle {
    font-size: 0.9em;
  }
  
  .photo-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

[data-theme="dark"] .photo-card {
  background: rgba(40, 40, 40, 0.8);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .photo-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}
</style>