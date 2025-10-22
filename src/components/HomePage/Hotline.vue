<template>
  <div class="hotline" ref="hotlineRef">
    <img :src="photoSrc" alt="Hotline Photo">
    <div class="calligraphy" :style="{ color: textColor, fontSize: fontSize }">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, nextTick } from 'vue';

const theme = ref(document.documentElement.getAttribute('data-theme') || 'light');
const hotlineRef = ref(null);
const photoHeight = ref(0);

const photoSrc = computed(() => theme.value === 'dark' ? '/assets/fig/photo-dark.JPG' : '/assets/fig/photo-light.JPG');
const textColor = computed(() => theme.value === 'dark' ? 'white' : 'black');
const text = computed(() => theme.value === 'dark' ? '而今迈步从头越' : '雄关漫道真如铁');

// 计算字体大小，基于照片高度的百分比
const fontSize = computed(() => {
  // 使用照片高度的20%作为字体大小，可根据需要调整这个比例
  return `${photoHeight.value * 0.1}px`;
});

// 更新照片高度
const updatePhotoHeight = () => {
  if (hotlineRef.value) {
    photoHeight.value = hotlineRef.value.offsetHeight;
  }
};

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
      theme.value = document.documentElement.getAttribute('data-theme') || 'light';
    }
  }
});

onMounted(async () => {
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
  
  // 等待DOM更新完成后计算高度
  await nextTick();
  updatePhotoHeight();
  
  // 监听窗口大小变化，重新计算高度
  window.addEventListener('resize', updatePhotoHeight);
});

onUnmounted(() => {
  observer.disconnect();
  window.removeEventListener('resize', updatePhotoHeight);
});
</script>

<style scoped>
.hotline {
  width: 100%;
  margin: 0;
  padding: 0;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
  position: relative;
  overflow: hidden;
}

.hotline {
  /* 添加渐变遮罩容器 */
  position: relative;
}

.hotline::before,
.hotline::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 100px;
  pointer-events: none;
  z-index: 1;
}

.hotline::before {
  top: 0;
  background: linear-gradient(to bottom, var(--bg-color-light), transparent);
}

.hotline::after {
  bottom: 0;
  background: linear-gradient(to top, var(--bg-color-light), transparent);
}

[data-theme='dark'] .hotline::before {
  background: linear-gradient(to bottom, var(--bg-color-dark), transparent);
}

[data-theme='dark'] .hotline::after {
  background: linear-gradient(to top, var(--bg-color-dark), transparent);
}

.hotline img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  mask-image: linear-gradient(to right, transparent -10%, black 100%);
  backdrop-filter: blur(8px);
}

.calligraphy {
  position: absolute;
  top: 10%;
  left: 20%;
  writing-mode: vertical-rl;
  font-family: 'Liu Jian Mao Cao', cursive;
  color: white;
  text-shadow: 1px 1px 2px black;
  padding: 10px;
  z-index: 1;
  background-color: transparent;
  /* 字体大小将通过动态计算设置 */
}
</style>