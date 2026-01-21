<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { parseExif } from '../../utils/exifParser';
import { initWaterfall, updateWaterfall, addWaterfallResizeListener } from '../../utils/waterfall';
import photos from '../../data/photos.json';
import { logger } from '../../utils/logger';

// 摄影作品数据 - 从JSON文件加载
const galleryImages = ref(photos);

// 筛选分类 - 马格南风格分类更简洁
const categories = ['All', 'Nature', 'Architecture', 'Abstract'];
const selectedCategory = ref('All');
const selectedImage = ref(null);
const isModalOpen = ref(false);

// 筛选图片
const filteredImages = ref(galleryImages.value);

// 筛选函数
function filterImages(category) {
  selectedCategory.value = category;
  if (category === 'All') {
    filteredImages.value = galleryImages.value;
  } else {
    filteredImages.value = galleryImages.value.filter(image => image.category === category);
  }
}

// 打开图片详情
async function openImageModal(image) {
  // 确保直接设置模态框状态，不依赖EXIF解析
  selectedImage.value = image;
  isModalOpen.value = true;
  
  // 添加ESC键监听
  const handleEscKey = (event) => {
    if (event.key === 'Escape') {
      closeImageModal();
    }
  };
  
  document.addEventListener('keydown', handleEscKey);
  
  // 保存事件监听器引用，以便后续移除
  closeImageModal.handleEscKey = handleEscKey;
  
  // 阻止背景滚动
  // 使用更可靠的方式阻止滚动
  const html = document.documentElement;
  const body = document.body;
  
  // 保存原始滚动位置
  body.dataset.scrollY = window.pageYOffset;
  
  // 应用固定定位来阻止滚动
  html.style.position = 'fixed';
  html.style.top = `-${window.pageYOffset}px`;
  html.style.width = '100%';
  html.style.overflowY = 'scroll';
  
  // 同时设置body的overflow以确保兼容性
  body.style.overflow = 'hidden';
  
  // 解析EXIF数据（异步，不影响模态框显示）
  try {
    const exifData = await parseExif(image.image);
    selectedImage.value.exif = exifData;
  } catch (error) {
    logger.error('Failed to parse EXIF data:', error);
    selectedImage.value.exif = null;
  }
}

// 关闭图片详情
function closeImageModal() {
  isModalOpen.value = false;
  selectedImage.value = null;
  
  // 移除ESC键监听
  if (closeImageModal.handleEscKey) {
    document.removeEventListener('keydown', closeImageModal.handleEscKey);
    delete closeImageModal.handleEscKey;
  }
  
  // 恢复背景滚动
  const html = document.documentElement;
  const body = document.body;
  
  // 恢复原始滚动位置
  const scrollY = body.dataset.scrollY;
  
  // 移除固定定位和恢复滚动
  html.style.position = '';
  html.style.top = '';
  html.style.width = '';
  html.style.overflowY = '';
  
  // 恢复body的原始样式
  body.style.overflow = '';
  
  // 恢复到原始滚动位置
  window.scrollTo(0, parseInt(scrollY, 10));
}

// 初始化瀑布流
async function initGallery() {
  await nextTick();
  
  // 检查是否所有图片都已加载完成
  const images = document.querySelectorAll('.gallery-image');
  const allLoaded = Array.from(images).every(img => img.complete);
  
  if (allLoaded) {
    initWaterfall('.gallery-grid', '.gallery-item', 45);
  } else {
    // 如果有图片未加载完成，等待所有图片加载完成后再初始化
    let loadedCount = 0;
    const totalImages = images.length;
    
    const handleImageLoad = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        initWaterfall('.gallery-grid', '.gallery-item', 45);
      }
    };
    
    images.forEach(img => {
      if (img.complete) {
        handleImageLoad();
      } else {
        img.addEventListener('load', handleImageLoad);
      }
    });
  }
}

// 监听筛选后的图片变化，重新初始化瀑布流
watch(filteredImages, () => {
  initGallery();
}, { deep: true });
// 页面加载完成后初始化瀑布流
onMounted(() => {
  initGallery();
  addWaterfallResizeListener('.gallery-grid', '.gallery-item', 45); // 增大间距
});
</script>

<template>
  <section class="gallery-page">
    <div class="container">
      <!-- Page Header - 马格南风格：简洁、专业 -->
      <div class="page-header">
        <h1 class="page-title">Photography Collection</h1>
        <p class="page-subtitle">Documentary & Fine Art Photography</p>
      </div>
      
      <!-- Filter Categories - 简洁的分类筛选 -->
      <div class="filter-section">
        <div class="filter-categories">
          <button 
            v-for="category in categories" 
            :key="category"
            class="filter-btn"
            :class="{ active: selectedCategory === category }"
            @click="filterImages(category)"
          >
            {{ category }}
          </button>
        </div>
      </div>
      
      <!-- Gallery Grid - 马格南风格：大图展示，突出图片本身 -->
      <div class="gallery-grid">
        <article 
          v-for="image in filteredImages" 
          :key="image.id"
          class="gallery-item"
          @click="openImageModal(image)"
        >
          <figure class="gallery-item-inner">
            <div class="gallery-image-wrapper">
              <img :src="image.image" :alt="image.title" class="gallery-image" loading="lazy">
            </div>
            <figcaption class="gallery-item-info">
              <h3 class="gallery-item-title">{{ image.title }}</h3>
              <p class="gallery-item-meta">
                <span class="meta-category">{{ image.category }}</span>
                <span class="meta-separator">•</span>
                <span class="meta-location">{{ image.location }}</span>
              </p>
            </figcaption>
          </figure>
        </article>
      </div>
      
      <!-- Image Modal - 马格南风格：详细信息展示 -->
      <div v-if="isModalOpen && selectedImage" class="modal-overlay" @click="closeImageModal">
        <div class="modal-container" @click.stop>
          <!-- Modal Image Section -->
          <div class="modal-image-section">
            <img :src="selectedImage.image" :alt="selectedImage.title" class="modal-main-image">
          </div>
          
          <!-- Modal Info Section -->
          <div class="modal-info-section">
            <div class="modal-info-content">
              <!-- 标题和基本信息 -->
              <div class="modal-header">
                <h2 class="modal-title">{{ selectedImage.title }}</h2>
                <div class="modal-basic-info">
                  <span class="info-item">{{ selectedImage.category }}</span>
                  <span class="info-separator">•</span>
                  <span class="info-item">{{ selectedImage.location }}</span>
                  <span class="info-separator">•</span>
                  <span class="info-item">{{ selectedImage.date }}</span>
                </div>
              </div>
              
              <!-- 描述 -->
              <div class="modal-description">
                <p>{{ selectedImage.description }}</p>
              </div>
              
              <!-- 技术参数 - 马格南风格：详细的拍摄参数 -->
              <div v-if="selectedImage.camera || selectedImage.lens || selectedImage.exif" class="modal-technical-info">
                <h3 class="section-title">Technical Information</h3>
                <div class="technical-details">
                  <div v-if="selectedImage.camera" class="detail-row">
                    <span class="detail-label">Camera:</span>
                    <span class="detail-value">{{ selectedImage.camera }}</span>
                  </div>
                  <div v-else-if="selectedImage.exif?.cameraModel" class="detail-row">
                    <span class="detail-label">Camera:</span>
                    <span class="detail-value">{{ selectedImage.exif.cameraModel }}</span>
                  </div>
                  <div v-if="selectedImage.lens" class="detail-row">
                    <span class="detail-label">Lens:</span>
                    <span class="detail-value">{{ selectedImage.lens }}</span>
                  </div>
                  <div v-else-if="selectedImage.exif?.lensModel" class="detail-row">
                    <span class="detail-label">Lens:</span>
                    <span class="detail-value">{{ selectedImage.exif.lensModel }}</span>
                  </div>
                  <div v-if="selectedImage.exif?.focalLength" class="detail-row">
                    <span class="detail-label">Focal Length:</span>
                    <span class="detail-value">{{ selectedImage.exif.focalLength }}</span>
                  </div>
                  <div v-if="selectedImage.exif?.aperture" class="detail-row">
                    <span class="detail-label">Aperture:</span>
                    <span class="detail-value">{{ selectedImage.exif.aperture }}</span>
                  </div>
                  <div v-if="selectedImage.exif?.shutterSpeed" class="detail-row">
                    <span class="detail-label">Shutter Speed:</span>
                    <span class="detail-value">{{ selectedImage.exif.shutterSpeed }}</span>
                  </div>
                  <div v-if="selectedImage.exif?.iso" class="detail-row">
                    <span class="detail-label">ISO:</span>
                    <span class="detail-value">{{ selectedImage.exif.iso }}</span>
                  </div>
                </div>
              </div>
              

              
              <!-- 标签 -->
              <div class="modal-tags">
                <h3 class="section-title">Tags</h3>
                <div class="tags-list">
                  <span 
                    v-for="(tag, index) in selectedImage.tags" 
                    :key="index" 
                    class="tag-item"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 全局样式 - 马格南风格：简洁、专业、突出图片 */
.gallery-page {
  padding: 6rem 0 8rem;
  background-color: var(--bg-primary);
}

/* Page Header - 马格南风格：简洁的标题 */
.page-header {
  text-align: center;
  margin-bottom: 6rem;
  padding: 0 1.5rem;
}

.page-title {
  font-size: 3.25rem;
  font-weight: 300;
  margin: 0 0 0.75rem;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 300;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Filter Section - 简洁的筛选区域 */
.filter-section {
  margin-bottom: 5rem;
  padding: 0 1.5rem;
  text-align: center;
}

.filter-categories {
  display: inline-flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-btn {
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--text-secondary);
  border-radius: 0;
  background-color: transparent;
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-btn:hover {
  background-color: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

.filter-btn.active {
  background-color: var(--text-primary);
  color: var(--bg-primary);
  border-color: var(--text-primary);
}

/* Gallery Grid - 瀑布流布局 */
.gallery-grid {
  position: relative;
  padding: 0 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 600px;
}

@media (max-width: 768px) {
  .gallery-grid {
    padding: 0 1rem;
  }
}

/* Gallery Item - 瀑布流项目 */
.gallery-item {
  cursor: pointer;
  transition: transform 0.3s ease;
  overflow: hidden;
  width: calc(33.333% - 30px); /* 默认3列布局，增大间距 */
  display: flex;
  flex-direction: column;
}

@media (max-width: 1200px) {
  .gallery-item {
    width: calc(50% - 20px); /* 中等屏幕2列布局 */
  }
}

@media (max-width: 768px) {
  .gallery-item {
    width: 100%; /* 移动端1列布局 */
  }
}

.gallery-item:hover {
  transform: translateY(-5px);
}

.gallery-item-inner {
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  width: 100%;
}

.gallery-image-wrapper {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.gallery-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: block;
}

.gallery-item:hover .gallery-image {
  transform: scale(1.02);
}

/* Gallery Item Info - 专业的图片信息展示 */
.gallery-item-info {
  padding: 1rem 0;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-primary);
}

.gallery-item-title {
  font-size: 1.25rem;
  font-weight: 300;
  margin: 0 0 0.5rem;
  color: var(--text-primary);
  line-height: 1.4;
}

.gallery-item-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 300;
}

.meta-category, .meta-location {
  display: inline-block;
}

.meta-separator {
  margin: 0 0.5rem;
  opacity: 0.5;
}

/* Modal Styles - 马格南风格：详细信息展示 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease;
}

.modal-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 0;
  width: 80%;
  height: 80vh;
  max-width: 1400px;
  max-height: 900px;
  overflow: hidden;
  border-radius: 0;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  background-color: var(--bg-primary);
}

@media (max-width: 1200px) {
  .modal-container {
    grid-template-columns: 1fr;
    grid-template-rows: 60vh 1fr;
  }
}

/* Modal Image Section */
.modal-image-section {
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
}

.modal-main-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0;
}

/* Modal Info Section */
.modal-info-section {
  height: 100%;
  overflow-y: auto;
  background-color: var(--bg-primary);
  padding: 2rem;
}

@media (max-width: 768px) {
  .modal-info-section {
    padding: 1.5rem 1rem;
  }
}

/* Modal Header */
.modal-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: 2rem;
  font-weight: 300;
  margin: 0 0 0.75rem;
  color: var(--text-primary);
  line-height: 1.2;
}

.modal-basic-info {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 300;
}

.info-item {
  display: inline-block;
}

.info-separator {
  margin: 0 0.5rem;
  opacity: 0.5;
}

/* Modal Description */
.modal-description {
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.7;
  color: var(--text-primary);
}

/* Section Title */
.section-title {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0 0 0.625rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Technical Details */
.modal-technical-info {
  margin-bottom: 0.875rem;
}

.technical-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding: 0.1875rem 0;
  line-height: 1.4;
}

.detail-row:last-child {
  padding-bottom: 0;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 400;
}

.detail-value {
  color: var(--text-primary);
  font-weight: 500;
  text-align: right;
}

/* Modal Tags */
.modal-tags {
  margin-bottom: 0.5rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

.tag-item {
  background-color: var(--border-color);
  color: var(--text-primary);
  padding: 0.25rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 300;
  text-transform: lowercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.tag-item:hover {
  background-color: var(--text-primary);
  color: var(--bg-primary);
}

/* 简单的动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
