<template>
  <div class="section-container outdoor-section">
    <h2 class="section-title">户外</h2>
    <div class="section-grid">
      <div v-for="(activity, index) in activities" :key="index" class="activity-card">
        <img :src="activity.image" :alt="activity.title" class="activity-image" />
        <div class="activity-info">
          <h3 class="activity-title">{{ activity.title }}</h3>
          <p class="activity-description">{{ activity.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { initWaterfall } from '../../utils/waterfall'

const activities = [
  {
    image: '/images/outdoor1.jpg',
    title: '登山',
    description: '挑战高峰，感受自然的壮丽'
  },
  {
    image: '/images/outdoor2.jpg',
    title: '露营',
    description: '在星空下享受宁静的夜晚'
  }
];

let waterfall = null;

onMounted(() => {
  waterfall = initWaterfall('.outdoor-section', '.activity-card')
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