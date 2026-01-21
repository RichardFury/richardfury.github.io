<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import Swiper from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';

const router = useRouter();

// Props定义
const props = defineProps({
  slides: {
    type: Array,
    required: true,
    default: () => []
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 5000
  },
  showNavigation: {
    type: Boolean,
    default: false
  },
  showIndicators: {
    type: Boolean,
    default: true
  }
});

// Emits定义
const emit = defineEmits(['slideChange', 'click']);

// Swiper实例
const swiperRef = ref(null);

// 响应式状态
const currentIndex = ref(0);
const isTransitioning = ref(false);

// 获取当前主题
const theme = ref(document.documentElement.getAttribute('data-theme') || 'light');

// 监听主题变化
const updateTheme = () => {
  theme.value = document.documentElement.getAttribute('data-theme') || 'light';
};

// 计算属性
const totalSlides = computed(() => props.slides.length);
const currentSlide = computed(() => props.slides[currentIndex.value]);

// 根据主题获取背景图片
const getBackgroundImage = (slide) => {
  if (theme.value === 'dark' && slide.backgroundImageDark) {
    return slide.backgroundImageDark;
  } else if (theme.value === 'light' && slide.backgroundImageLight) {
    return slide.backgroundImageLight;
  }
  return slide.backgroundImageDark || slide.backgroundImageLight;
};

// 导航到指定幻灯片
const goToSlide = (index) => {
  if (swiperRef.value) {
    swiperRef.value.slideTo(index);
  }
};

// 导航到上一个幻灯片
const goToPrevSlide = () => {
  if (swiperRef.value) {
    swiperRef.value.slidePrev();
  }
};

// 导航到下一个幻灯片
const goToNextSlide = () => {
  if (swiperRef.value) {
    swiperRef.value.slideNext();
  }
};

// 处理卡片点击
const handleCardClick = (slide, index) => {
  emit('click', slide, index);
};

// 处理按钮点击，进行路由导航
const handleButtonClick = (event, link) => {
  event.preventDefault();
  if (link && link.startsWith('/')) {
    router.push(link);
  } else if (link) {
    window.open(link, '_blank');
  }
};

// 处理键盘事件
const handleKeyDown = (e) => {
  const keyMap = {
    'ArrowLeft': goToPrevSlide,
    'ArrowRight': goToNextSlide,
    'Home': () => goToSlide(0),
    'End': () => goToSlide(totalSlides.value - 1),
    'Enter': () => handleCardClick(currentSlide.value, currentIndex.value)
  };

  const action = keyMap[e.key];
  if (action) {
    e.preventDefault();
    action();
  }
};

// Swiper初始化
const initSwiper = () => {
  nextTick(() => {
    if (swiperRef.value) return;

    swiperRef.value = new Swiper('.hero-carousel', {
      modules: [Navigation, Autoplay],
      loop: true,
      speed: 500,
      effect: 'slide',
      grabCursor: true,
      navigation: {
        nextEl: '.hero-navigation-next',
        prevEl: '.hero-navigation-prev',
      },
      autoplay: props.autoplay ? {
        delay: props.interval,
        disableOnInteraction: true,
        pauseOnMouseEnter: true,
      } : false,
      on: {
        slideChange: (swiper) => {
          currentIndex.value = swiper.realIndex;
          emit('slideChange', swiper.realIndex);
        },
      },
    });
  });
};

// 监听幻灯片数量变化
watch(() => props.slides.length, () => {
  if (swiperRef.value) {
    swiperRef.value.destroy();
    initSwiper();
  }
});

// 监听主题变化，更新背景图片
watch(theme, () => {
  // 强制重新渲染幻灯片以更新背景图片
  const slides = document.querySelectorAll('.hero-slide-bg img');
  slides.forEach((img, index) => {
    const slide = props.slides[index];
    if (slide) {
      img.src = getBackgroundImage(slide);
    }
  });
});

// 组件挂载
onMounted(() => {
  // 初始化主题
  updateTheme();
  
  // 添加事件监听
  document.addEventListener('themeChange', updateTheme);
  document.addEventListener('keydown', handleKeyDown);
  
  // 初始化Swiper
  initSwiper();
});

// 组件卸载
onUnmounted(() => {
  // 移除事件监听
  document.removeEventListener('themeChange', updateTheme);
  document.removeEventListener('keydown', handleKeyDown);

  // 销毁Swiper实例
  if (swiperRef.value) {
    swiperRef.value.destroy();
    swiperRef.value = null;
  }
});
</script>

<template>
  <section
    class="hero-carousel swiper"
    :class="theme"
    aria-label="Highlight moments carousel"
  >
    <!-- 跳过链接 -->
    <a href="#main-content" class="skip-to-content">Skip to main content</a>

    <!-- Swiper容器 -->
    <div class="swiper-wrapper">
      <!-- 幻灯片 -->
      <div
        v-for="(slide, index) in slides"
        :key="`${slide.id}-${theme}`"
        class="swiper-slide"
        role="group"
        :aria-roledescription="`slide ${index + 1} of ${totalSlides}`"
        :aria-label="slide.title"
      >
        <!-- 背景图片 -->
        <div class="hero-slide-bg">
          <img
            :src="getBackgroundImage(slide)"
            :alt="slide.title"
            loading="lazy"
            decoding="async"
          >
        </div>

        <!-- 渐变叠加层 -->
        <div class="hero-slide-overlay"></div>

        <!-- 文字内容 -->
        <div class="hero-content">
          <!-- 标签 -->
          <span v-if="slide.tag" class="hero-tag">
            <span class="hero-tag-dot"></span>
            {{ slide.tag }}
          </span>

          <!-- 标题 -->
          <h2 class="hero-title">
            <span class="hero-title-text">{{ slide.title }}</span>
          </h2>

          <!-- 副标题 -->
          <p v-if="slide.subtitle" class="hero-subtitle">{{ slide.subtitle }}</p>

          <!-- 描述 -->
          <p v-if="slide.description" class="hero-description">{{ slide.description }}</p>

          <!-- 按钮组 -->
          <div v-if="slide.link || slide.secondaryLink" class="hero-buttons">
            <a
              v-if="slide.link"
              :href="slide.link"
              class="hero-button"
              :aria-label="'Learn more about ' + slide.title"
              @click="handleButtonClick($event, slide.link)"
            >
              <span>{{ slide.buttonText || 'Learn More' }}</span>
              <svg class="hero-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </a>
            <a
              v-if="slide.secondaryLink"
              :href="slide.secondaryLink"
              class="hero-button-secondary"
              :aria-label="'View details for ' + slide.title"
              @click="handleButtonClick($event, slide.secondaryLink)"
            >
              <span>{{ slide.secondaryButtonText || 'View Details' }}</span>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 导航按钮（无禁用状态，保持半透明） -->
    <template v-if="showNavigation && totalSlides > 1">
      <button
        class="hero-navigation hero-navigation-prev"
        aria-label="Previous slide"
        @click="goToPrevSlide"
      >
        <svg class="hero-navigation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <button
        class="hero-navigation hero-navigation-next"
        aria-label="Next slide"
        @click="goToNextSlide"
      >
        <svg class="hero-navigation-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </template>

    <!-- 滚动指示器（极简设计） -->
    <div v-if="showIndicators && totalSlides > 1" class="hero-indicators" role="tablist" aria-label="Carousel navigation">
      <button
        v-for="(slide, index) in slides"
        :key="slide.id"
        class="hero-indicator"
        :class="{ active: index === currentIndex }"
        role="tab"
        :aria-selected="index === currentIndex"
        :aria-label="'Go to slide ' + (index + 1)"
        @click="goToSlide(index)"
      >
        <span class="sr-only">Slide {{ index + 1 }}</span>
      </button>
    </div>
  </section>
</template>

<style src="../../styles/hero-carousel.css"></style>