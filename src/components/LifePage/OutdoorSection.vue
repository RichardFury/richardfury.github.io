<template>
  <div class="section-container outdoor-section">
    <div class="section-header">
      <h2 class="section-title">户外探险</h2>
      <p class="section-subtitle">拥抱自然，探索未知的世界</p>
    </div>
    <div class="activity-grid">
      <div 
        v-for="(activity, index) in activities" 
        :key="index" 
        class="activity-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="activity-image-container">
          <img 
            :src="activity.image" 
            :alt="activity.title" 
            class="activity-image" 
            @load="imageLoaded(activity.id)"
          />
          <div class="activity-overlay">
            <div class="activity-stats">
              <span class="stat-item">{{ activity.difficulty }}</span>
              <span class="stat-item">{{ activity.duration }}</span>
            </div>
          </div>
        </div>
        <div class="activity-info">
          <h3 class="activity-title">{{ activity.title }}</h3>
          <p class="activity-description">{{ activity.description }}</p>
          <div class="activity-details">
            <span class="detail-item"><i class="icon-location"></i> {{ activity.location }}</span>
            <span class="detail-item"><i class="icon-date"></i> {{ activity.date }}</span>
            <span class="detail-item"><i class="icon-people"></i> {{ activity.participants }}人</span>
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

const activities = [
  {
    id: 1,
    image: '/images/outdoor1.jpg',
    title: '高山攀登',
    description: '挑战海拔3000米的高峰，突破自我极限，感受大自然的壮丽与震撼',
    difficulty: '中等',
    duration: '2天',
    location: '黄山',
    date: '2023.09',
    participants: 5
  },
  {
    id: 2,
    image: '/images/outdoor2.jpg',
    title: '森林露营',
    description: '在原始森林中搭建帐篷，夜晚观赏星空，清晨聆听鸟鸣，体验与自然的和谐共处',
    difficulty: '简单',
    duration: '1晚',
    location: '莫干山',
    date: '2023.07',
    participants: 3
  },
  {
    id: 3,
    image: '/images/outdoor3.jpg',
    title: '海岸线徒步',
    description: '沿着崎岖的海岸线徒步，感受海浪拍打岩石的力量，探索隐秘的海滩',
    difficulty: '中等',
    duration: '1天',
    location: '厦门',
    date: '2023.06',
    participants: 8
  },
  {
    id: 4,
    image: '/images/outdoor4.jpg',
    title: '峡谷探险',
    description: '深入峡谷内部，探索奇特的岩石地貌，体验惊险刺激的户外活动',
    difficulty: '高',
    duration: '1天',
    location: '张家界',
    date: '2023.05',
    participants: 4
  }
]

const imageLoaded = (id) => {
  loadedImages.value.add(id)
}

const initGallery = () => {
  if (loadedImages.value.size === activities.length && !waterfall) {
    waterfall = initWaterfall('.outdoor-section', '.activity-card')
  }
}

watchEffect(() => {
  if (loadedImages.value.size === activities.length) {
    setTimeout(initGallery, 100)
  }
})

onMounted(() => {
  const checkImages = () => {
    if (loadedImages.value.size === activities.length) {
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
    135deg,
    transparent 48%,
    rgba(var(--accent-rgb), 0.05) 49%,
    rgba(var(--accent-rgb), 0.05) 51%,
    transparent 52%
  );
  animation: patternMove 15s linear infinite;
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

.activity-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  background: var(--card-bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  transform: translateY(20px);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.activity-image-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.activity-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.activity-card:hover .activity-image {
  transform: scale(1.05);
}

.activity-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 40%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 1rem;
}

.activity-card:hover .activity-overlay {
  opacity: 1;
}

.activity-stats {
  display: flex;
  gap: 1rem;
}

.stat-item {
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-color);
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.activity-info {
  padding: 1.5rem;
}

.activity-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 0.7rem;
}

.activity-description {
  font-size: 0.95rem;
  color: var(--text-secondary-color);
  margin: 0 0 1rem;
  line-height: 1.6;
}

.activity-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.85rem;
  color: var(--text-tertiary-color);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.icon-location::before {
  content: '📍';
}

.icon-date::before {
  content: '📅';
}

.icon-people::before {
  content: '👥';
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
  
  .activity-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.2rem;
  }
  
  .activity-info {
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
  
  .activity-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .activity-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
[data-theme="dark"] .activity-card {
  background: rgba(40, 40, 40, 0.8);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .activity-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .stat-item {
  background: rgba(60, 60, 60, 0.9);
  color: var(--light-text-color);
}

.activity-card {
  background: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.activity-info {
  padding: 15px;
}

.activity-title {
  margin: 0 0 10px;
  font-size: 1.1em;
  color: var(--text-color);
}

.activity-description {
  margin: 0;
  font-size: 0.9em;
  color: var(--text-color);
}
</style>