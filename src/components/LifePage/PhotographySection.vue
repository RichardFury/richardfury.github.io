<template>
  <div class="section-container photography-section">
    <h2 class="section-title">摄影</h2>
    <div class="section-grid">
      <div v-for="(photo, index) in photos" :key="index" class="photo-card">
        <img :src="photo.image" :alt="photo.title" class="photo-image" />
        <div class="photo-info">
          <h3 class="photo-title">{{ photo.title }}</h3>
          <p class="photo-description">{{ photo.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { initWaterfall } from '../../utils/waterfall'

const photos = [
  {
    image: '/images/photography1.jpg',
    title: '城市夜景',
    description: '捕捉城市夜晚的璀璨灯光'
  },
  {
    image: '/images/photography2.jpg',
    title: '自然风光',
    description: '展现大自然的壮丽景色'
  }
];

let waterfall = null;

onMounted(() => {
  waterfall = initWaterfall('.photography-section', '.photo-card')
})

onUnmounted(() => {
  waterfall?.destroy()
})
</script>

<style scoped>
.section-container {
  margin: 40px 0;
}

.section-title {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: var(--text-color);
}

.section-grid {
  position: relative;
  margin: 0 auto;
  min-height: 100vh;
}

.photo-card {
  background: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.photo-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.photo-info {
  padding: 15px;
}

.photo-title {
  margin: 0 0 10px;
  font-size: 1.1em;
  color: var(--text-color);
}

.photo-description {
  margin: 0;
  font-size: 0.9em;
  color: var(--text-color);
}
</style>