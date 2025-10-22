<template>
  <!-- 图片详情模态窗口 -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-content" @click.stop>
          <!-- 导航功能通过键盘操作实现 -->
          
          <div class="modal-layout">
            <!-- 左侧照片区域 -->
            <div class="photo-section">
              <img 
                :src="image.path" 
                :alt="image.description" 
                class="modal-photo" 
                @load="handleImageLoad"
              />
              
              <!-- 键盘导航功能保留，移除提示 -->
              
              <!-- 加载指示器 -->
              <div class="loading-indicator" v-if="isLoading">
                <div class="spinner"></div>
              </div>
            </div>
            
            <!-- 右侧详情区域 -->
            <div class="info-section">
              <div class="info-scroll-wrapper">
                <!-- 标题区域 -->
                <div class="title-area">
                  <h3 class="photo-title">{{ image.description || '未命名照片' }}</h3>
                  <!-- 图片索引 -->
                  <div class="image-index" v-if="images.length > 1">
                    {{ currentIndex + 1 }} / {{ images.length }}
                  </div>
                </div>
                
                <!-- 详细内容区域 -->
                <div class="content-area">
                  <p class="photo-description">{{ image.description || '暂无描述' }}</p>
                </div>
                
                <!-- 相机参数区域 -->
                <div class="camera-area">
                  <h4 class="camera-title">相机参数</h4>
                  <div class="camera-params-list">
                    <CameraParam label="相机" :value="image.camera" />
                    <CameraParam label="光圈" :value="image.aperture" />
                    <CameraParam label="快门" :value="image.shutterSpeed" />
                    <CameraParam label="ISO" :value="image.iso" />
                    <CameraParam label="焦距" :value="image.focalLength" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { watch, computed, ref, onMounted, onUnmounted } from 'vue';
import CameraParam from './CameraParam.vue';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  image: {
    type: Object,
    required: true
  },
  images: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'close', 'update:image']);

// 响应式数据
const isLoading = ref(false);

// 计算属性
const currentIndex = computed(() => {
  return props.images.findIndex(img => img.id === props.image.id);
});

// 方法
const handleOverlayClick = () => {
  closeModal();
};

const closeModal = () => {
  emit('update:modelValue', false);
  emit('close');
};

const navigateToPrevImage = () => {
  if (props.images.length <= 1) return;
  
  isLoading.value = true;
  const prevIndex = currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1;
  emit('update:image', props.images[prevIndex]);
};

const navigateToNextImage = () => {
  if (props.images.length <= 1) return;
  
  isLoading.value = true;
  const nextIndex = (currentIndex.value + 1) % props.images.length;
  emit('update:image', props.images[nextIndex]);
};

const handleImageLoad = () => {
  isLoading.value = false;
};

const handleKeydown = (event) => {
  // 阻止页面滚动等默认行为
  if (['ArrowLeft', 'ArrowRight', 'Escape'].includes(event.key)) {
    event.preventDefault();
  }
  
  switch (event.key) {
    case 'Escape':
      closeModal();
      break;
    case 'ArrowLeft':
      navigateToPrevImage();
      break;
    case 'ArrowRight':
      navigateToNextImage();
      break;
  }
};

// 生命周期钩子
onMounted(() => {
  // 确保模态窗口打开时添加键盘事件监听
  if (props.modelValue) {
    document.addEventListener('keydown', handleKeydown);
  }
});

onUnmounted(() => {
  // 清理事件监听
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = '';
});

// 监听显示状态变化
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    // 模态窗口打开
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeydown);
    // 聚焦到模态窗口以便键盘操作立即生效
    setTimeout(() => {
      const modal = document.querySelector('.modal-overlay');
      if (modal) modal.focus();
    }, 100);
  } else {
    // 模态窗口关闭
    document.body.style.overflow = '';
    document.removeEventListener('keydown', handleKeydown);
  }
});

// 监听图片切换，重置加载状态
watch(() => props.image, () => {
  isLoading.value = true;
});
</script>

<style scoped>
/* 过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content {
  transform: scale(0.9);
}

.modal-leave-to .modal-content {
  transform: scale(0.9);
}

/* 模态窗口样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  outline: none; /* 移除聚焦轮廓 */
}

/* 固定大小的模态窗口 */
.modal-content {
  background-color: #fff;
  border-radius: 32px;
  width: 90vw;
  height: 90vh;
  max-width: none;
  max-height: none;
  overflow: hidden;
  position: relative;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  transition: box-shadow 0.3s ease;
}

.modal-content:hover {
  box-shadow: 0 15px 60px rgba(0, 0, 0, 0.4);
}

/* 导航功能通过键盘实现，保留相关CSS占位 */

/* 主布局容器 */
.modal-layout {
  display: flex;
  height: 100%;
}

/* 左侧照片区域 */
.photo-section {
  width: 70%;
  height: 100%;
  background-color: #000;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 模态窗口中的照片 */
.modal-photo {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: opacity 0.3s ease;
}

/* 键盘导航功能保留，但移除视觉提示 */

/* 加载指示器 */
.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 右侧详情区域 */
.info-section {
  width: 30%;
  height: 100%;
  background-color: #ffffff;
  border-left: 1px solid #e0e0e0;
  overflow: hidden; /* 确保右侧区域不溢出 */
}

/* 深色主题下的右侧详情区域 */
[data-theme='dark'] .info-section {
  background-color: #1a1a1a;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

/* 可滚动内容包装器 */
.info-scroll-wrapper {
  height: 100%;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* 防止被压缩 */
  overflow-y: auto; /* 允许相机参数区域内部滚动（如果需要） */
}

/* 浅色主题滚动条 */
.info-scroll-wrapper::-webkit-scrollbar {
  width: 6px;
}

.info-scroll-wrapper::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.info-scroll-wrapper::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 3px;
}

.info-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* 深色主题滚动条 */
[data-theme='dark'] .info-scroll-wrapper::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

[data-theme='dark'] .info-scroll-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
}

[data-theme='dark'] .info-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 标题区域 */
.title-area {
  padding: 30px 25px 15px;
  border-bottom: 1px solid #f0f0f0;
}

[data-theme='dark'] .title-area {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.photo-title {
  margin: 0 0 10px 0;
  font-size: 22px;
  color: var(--text-color);
  font-weight: 600;
  line-height: 1.3;
}

/* 图片索引 */
.image-index {
  font-size: 14px;
  color: #888;
  font-weight: 500;
}

[data-theme='dark'] .image-index {
  color: rgba(255, 255, 255, 0.6);
}

/* 详细内容区域 */
.content-area {
  flex: 1;
  padding: 25px;
  display: flex;
  align-items: flex-start;
}

.photo-description {
  margin: 0;
  font-size: 16px;
  line-height: 1.7;
  color: #555;
}

[data-theme='dark'] .photo-description {
  color: var(--text-color);
}

/* 相机参数区域 */
.camera-area {
  padding: 25px;
  background-color: #fafafa;
  border-top: 1px solid #f0f0f0;
}

[data-theme='dark'] .camera-area {
  background-color: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.camera-title {
  margin: 0 0 15px 0;
  font-size: 16px;
  color: var(--text-color);
  font-weight: 500;
}

/* 深色主题下的模态窗口内容 */
[data-theme='dark'] .modal-content {
  background-color: #1a1a1a;
}

.camera-params-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .modal-content {
    width: 92vw;
    height: 85vh;
  }
  
  .photo-section {
    width: 65%;
  }
  
  .info-section {
    width: 35%;
  }
}

@media (max-width: 1024px) {
  .modal-content {
    width: 95vw;
    height: 90vh;
  }
  
  .modal-layout {
    flex-direction: column;
  }
  
  .photo-section,
  .info-section {
    width: 100%;
  }
  
  .photo-section {
    height: 50%;
  }
  
  .info-section {
    height: 50%;
    border-left: none;
    border-top: 1px solid #e0e0e0;
  }
  
  /* 响应式调整：键盘导航功能保留 */
}

@media (max-width: 768px) {
  .modal-content {
    width: 100vw;
    height: 100vh;
    max-width: 100%;
    max-height: 100%;
    border-radius: 0;
  }
  
  /* 响应式调整：键盘导航功能保留 */
  
  .title-area,
  .content-area,
  .camera-area {
    padding: 20px;
  }
  
  .photo-title {
    font-size: 20px;
  }
  
  .photo-description {
    font-size: 15px;
  }
  
  /* 响应式调整：键盘导航功能保留 */
}

@media (max-width: 480px) {
  .photo-section {
    height: 60%;
  }
  
  .info-section {
    height: 40%;
  }
  
  /* 响应式调整：键盘导航功能保留 */
  
  .loading-indicator .spinner {
    width: 30px;
    height: 30px;
  }
}

/* 无障碍支持 */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-content,
  .modal-leave-active .modal-content,
  .modal-content,
  .nav-btn,
  .hint-text,
  .modal-photo {
    transition: none;
  }
  
  .spinner {
    animation-duration: 2s;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .modal-content {
    border: 2px solid #000;
  }
  
  .info-section {
    border-left: 2px solid #000;
  }
}
</style>
