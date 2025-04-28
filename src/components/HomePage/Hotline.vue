<template>
  <div class="hotline">
    <img :src="photoSrc" alt="Hotline Photo">
    <div class="calligraphy" :style="{ color: textColor }">
      {{ text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';

const theme = ref(document.documentElement.getAttribute('data-theme') || 'light');
const photoSrc = computed(() => theme.value === 'dark' ? '/assets/fig/photo-dark.JPG' : '/assets/fig/photo-light.JPG');
const textColor = computed(() => theme.value === 'dark' ? 'white' : 'black');
const text = computed(() => theme.value === 'dark' ? '而今迈步从头越' : '雄关漫道真如铁')

const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
      theme.value = document.documentElement.getAttribute('data-theme') || 'light';
    }
  }
});

onMounted(() => {
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
});

onUnmounted(() => {
  observer.disconnect();
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

.hotline img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  mask-image: linear-gradient(to right, transparent 0%, black 100%);
  backdrop-filter: blur(8px);
}

.calligraphy {
  position: absolute;
  top: 10%;
  left: 20%;
  writing-mode: vertical-rl;
  font-family: 'Liu Jian Mao Cao', cursive;
  font-size: 4em;
  color: white;
  text-shadow: 1px 1px 2px black;
  padding: 10px;
  z-index: 1;
  background-color: transparent;
}
</style>