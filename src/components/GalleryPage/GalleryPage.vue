<template>
  <div class="gallery-container">
    <h1>Gallery</h1>
    <div id="waterfall-container">
      <div v-for="image in images" :key="image.id" class="gallery-item" @click="openModal(image)">
        <div class="image-wrapper">
          <img 
            :src="image.path" 
            :alt="image.description" 
            class="gallery-image" 
            @load="handleImageLoad"
          />
        </div>
      </div>
      <div v-if="loading" class="loading">加载中...</div>
    </div>

    <!-- 图片详情模态窗口组件 -->
    <ImageModal 
      v-model="isModalOpen" 
      :image="selectedImage" 
      :images="images"
      v-if="selectedImage"
      @close="resetSelectedImage"
      @update:image="updateSelectedImage"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { getGalleryImages } from '../../services/galleryService.js';
import { initWaterfall } from '../../utils/waterfall.js';
import ImageModal from './ImageModal.vue';

const images = ref([]);
const loading = ref(true);
const selectedImage = ref(null);
const isModalOpen = ref(false);
let waterfallInstance = null;
let imagesLoaded = 0;

// 处理图片加载完成事件
const handleImageLoad = () => {
  imagesLoaded++;
  // 当所有图片加载完成后，初始化瀑布流
  if (imagesLoaded === images.value.length) {
    initWaterfallLayout();
    loading.value = false;
  }
};

// 初始化瀑布流布局
const initWaterfallLayout = () => {
  // 先销毁之前的实例（如果存在）
  if (waterfallInstance) {
    waterfallInstance.destroy();
  }
  
  // 创建新的瀑布流实例
  waterfallInstance = initWaterfall('#waterfall-container', '.gallery-item');
};

// 打开图片详情模态窗口
const openModal = (image) => {
  selectedImage.value = image;
  isModalOpen.value = true;
};

// 关闭图片详情模态窗口
const closeModal = () => {
  isModalOpen.value = false;
};

// 重置选中的图片
const resetSelectedImage = () => {
  selectedImage.value = null;
};

// 更新选中的图片（用于键盘导航）
const updateSelectedImage = (newImage) => {
  selectedImage.value = newImage;
};

onMounted(async () => {
  try {
    loading.value = true;
    imagesLoaded = 0;
    // 从Google Drive获取图片
    images.value = await getGalleryImages();
    
    // 如果没有图片，模拟一些延迟后初始化瀑布流
    if (images.value.length === 0) {
      setTimeout(() => {
        loading.value = false;
      }, 1000);
    }
    
    // 无需添加ESC键事件监听，已在ImageModal组件中处理
  } catch (error) {
    console.error('Error loading gallery:', error);
    loading.value = false;
  }
});

onUnmounted(() => {
  // 清理瀑布流实例
  if (waterfallInstance) {
    waterfallInstance.destroy();
    waterfallInstance = null;
  }
  
  // 无需移除ESC键事件监听，已在ImageModal组件中处理
  
  // 确保恢复背景滚动
  document.body.style.overflow = '';
});
</script>

<style scoped>
.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

#waterfall-container {
  position: relative;
  width: 100%;
  margin-top: 20px;
}

.gallery-item {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 16px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.image-wrapper {
  width: 100%;
  overflow: hidden;
}

.gallery-image {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.05);
}

.loading {
  text-align: center;
  padding: 40px;
  color: var(--text-color);
  font-size: 16px;
}


</style>