<template>
  <div class="section-container band-section">
    <div class="section-header">
      <h2 class="section-title">音乐世界</h2>
      <p class="section-subtitle">用音符传递情感，用节奏连接心灵</p>
    </div>
    <div class="band-grid">
      <div 
        v-for="(band, index) in bands" 
        :key="index" 
        class="band-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="band-image-container">
          <img 
            :src="band.image" 
            :alt="band.name" 
            class="band-image" 
            @load="imageLoaded(band.id)"
          />
          <div class="band-overlay">
            <button class="play-btn">
              <span class="play-icon">▶</span>
            </button>
          </div>
        </div>
        <div class="band-info">
          <h3 class="band-name">{{ band.name }}</h3>
          <p class="band-description">{{ band.description }}</p>
          <div class="band-details">
            <span class="genre-tag" v-for="(genre, gIndex) in band.genres" :key="gIndex">{{ genre }}</span>
            <div class="band-stats">
              <span class="stat-item">{{ band.members }}人</span>
              <span class="stat-item">{{ band.experience }}年</span>
            </div>
          </div>
          <div class="social-links">
            <a href="#" class="social-link">🎵</a>
            <a href="#" class="social-link">🎸</a>
            <a href="#" class="social-link">🎤</a>
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

const bands = [
  {
    id: 1,
    image: '/images/band1.jpg',
    name: '极光摇滚',
    description: '融合现代摇滚与电子音乐元素，创造出充满未来感的音乐体验，让每一场演出都成为难忘的视听盛宴',
    genres: ['摇滚', '电子'],
    members: 4,
    experience: 5
  },
  {
    id: 2,
    image: '/images/band2.jpg',
    name: '蓝调爵士',
    description: '以传统爵士乐为基础，融入蓝调元素，营造出慵懒而深情的音乐氛围，让听众沉浸在音乐的世界里',
    genres: ['爵士', '蓝调'],
    members: 3,
    experience: 8
  },
  {
    id: 3,
    image: '/images/band3.jpg',
    name: '民谣原声',
    description: '用简单的乐器和真诚的声音讲述生活故事，传递温暖与感动，让音乐回归最纯粹的本质',
    genres: ['民谣', '原声'],
    members: 2,
    experience: 3
  },
  {
    id: 4,
    image: '/images/band4.jpg',
    name: '电子实验',
    description: '突破传统音乐边界，探索声音的无限可能，创造出富有实验性和创新性的音乐作品',
    genres: ['电子', '实验'],
    members: 1,
    experience: 6
  }
]

const imageLoaded = (id) => {
  loadedImages.value.add(id)
}

const initGallery = () => {
  if (loadedImages.value.size === bands.length && !waterfall) {
    waterfall = initWaterfall('.band-section', '.band-card')
  }
}

watchEffect(() => {
  if (loadedImages.value.size === bands.length) {
    setTimeout(initGallery, 100)
  }
})

onMounted(() => {
  const checkImages = () => {
    if (loadedImages.value.size === bands.length) {
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
    90deg,
    transparent 48%,
    rgba(var(--accent-rgb), 0.05) 49%,
    rgba(var(--accent-rgb), 0.05) 51%,
    transparent 52%
  );
  animation: patternMove 10s linear infinite;
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

.band-grid {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.band-card {
  background: var(--card-bg-color);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  transform: translateY(20px);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;
}

.band-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.band-image-container {
  position: relative;
  overflow: hidden;
  aspect-ratio: 1/1;
}

.band-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.band-card:hover .band-image {
  transform: scale(1.1);
}

.band-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease, background 0.3s ease;
}

.band-card:hover .band-overlay {
  opacity: 1;
  background: rgba(0, 0, 0, 0.6);
}

.play-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--accent-color);
  border: none;
  color: white;
  cursor: pointer;
  transition: transform 0.3s ease, background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.play-btn:hover {
  transform: scale(1.1);
  background: var(--accent-hover-color, var(--accent-color));
}

.play-icon {
  font-size: 1.5rem;
  margin-left: 4px;
}

.band-info {
  padding: 1.5rem;
}

.band-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-color);
  margin: 0 0 0.7rem;
}

.band-description {
  font-size: 0.95rem;
  color: var(--text-secondary-color);
  margin: 0 0 1rem;
  line-height: 1.6;
}

.band-details {
  margin-bottom: 1rem;
}

.genre-tag {
  display: inline-block;
  background: rgba(var(--accent-rgb), 0.1);
  color: var(--accent-color);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.band-stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.stat-item {
  font-size: 0.85rem;
  color: var(--text-tertiary-color);
}

.social-links {
  display: flex;
  gap: 0.8rem;
}

.social-link {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(var(--border-rgb), 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  text-decoration: none;
  color: var(--text-color);
}

.social-link:hover {
  background: var(--accent-color);
  color: white;
  transform: translateY(-3px);
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
  
  .band-grid {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1.2rem;
  }
  
  .band-info {
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
  
  .band-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .band-info {
    padding: 1.2rem;
  }
}

[data-theme="dark"] .band-card {
  background: rgba(40, 40, 40, 0.8);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .band-card:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

[data-theme="dark"] .social-link {
  background: rgba(80, 80, 80, 0.3);
}
</style>