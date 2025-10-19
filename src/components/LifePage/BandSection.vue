<template>
  <div class="section-container band-section">
    <h2 class="section-title">乐队</h2>
    <div class="section-grid">
      <div v-for="(band, index) in bands" :key="index" class="band-card">
        <img :src="band.image" :alt="band.name" class="band-image" />
        <div class="band-info">
          <h3 class="band-name">{{ band.name }}</h3>
          <p class="band-description">{{ band.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'
import { initWaterfall } from '../../utils/waterfall'

const bands = [
  {
    image: '/images/band1.jpg',
    name: '摇滚乐队',
    description: '激情四射的摇滚演出'
  },
  {
    image: '/images/band2.jpg',
    name: '爵士乐队',
    description: '轻松愉悦的爵士旋律'
  }
];

let waterfall = null;

onMounted(() => {
  nextTick(() => {
    const images = Array.from(document.querySelectorAll('.band-image'));
    const loadPromises = images.map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve()
        } else {
          img.addEventListener('load', resolve, { once: true })
          img.addEventListener('error', resolve, { once: true })
        }
      })
    })

    Promise.all(loadPromises).then(() => {
      waterfall = initWaterfall('.band-section', '.band-card')
    })
  })
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
}

.band-card {
  background: var(--card-bg-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.band-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.band-info {
  padding: 15px;
}

.band-name {
  margin: 0 0 10px;
  font-size: 1.1em;
  color: var(--text-color);
}

.band-description {
  margin: 0;
  font-size: 0.9em;
  color: var(--text-color);
}
</style>