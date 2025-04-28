<template>
  <div class="gallery-container">
    <h1>Gallery</h1>
    <div class="gallery-grid">
      <div v-for="image in images" :key="image.id" class="gallery-item">
        <img :src="image.path" :alt="image.description" class="gallery-image" />
        <div class="image-info">
          <p class="image-description">{{ image.description }}</p>
          <div class="image-tags">
            <span v-for="(tag, index) in image.tags" :key="index" class="tag">{{ tag }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getGalleryImages } from '../../services/galleryService.js';

const images = ref([]);

onMounted(async () => {
  images.value = await getGalleryImages();
});
</script>

<style scoped>
.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.gallery-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.image-info {
  padding: 15px;
}

.image-description {
  margin: 0 0 10px;
  color: #333;
}

.image-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.tag {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
}
</style>