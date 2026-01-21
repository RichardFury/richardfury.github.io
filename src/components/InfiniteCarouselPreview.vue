<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const slides = [
  {
    id: 1,
    title: 'Minimalism in Design',
    subtitle: 'Finding beauty in simplicity',
    description: 'Explore the principles of minimalist design and how it transforms our perception of beauty.',
    image: 'https://picsum.photos/id/1067/1920/1080',
    tag: 'Design'
  },
  {
    id: 2,
    title: 'The Art of Code',
    subtitle: 'Elegant solutions for complex problems',
    description: 'Discover how clean code architecture leads to better maintainability and performance.',
    image: 'https://picsum.photos/id/1015/1920/1080',
    tag: 'Technology'
  },
  {
    id: 3,
    title: 'Nature\'s Patterns',
    subtitle: 'Learning from the world around us',
    description: 'Observe how natural systems achieve balance through simplicity and efficiency.',
    image: 'https://picsum.photos/id/1016/1920/1080',
    tag: 'Philosophy'
  }
];

const currentTab = ref('方案一');

function setTab(tab) {
  currentTab.value = tab;
}

onMounted(() => {
  document.title = '无限轮播方案预览 - Richard Fury';
});

onUnmounted(() => {
  document.title = 'Richard Fury - Minimalist Artist & Researcher';
});
</script>

<template>
  <div class="preview-page">
    <div class="container">
      <h1 class="page-title">无限轮播方案预览</h1>
      <p class="page-subtitle">选择最适合您的实现方案</p>

      <div class="tabs">
        <button
          v-for="tab in ['方案一', '方案二', '方案三']"
          :key="tab"
          :class="{ active: currentTab === tab }"
          @click="setTab(tab)"
          class="tab-btn"
        >
          {{ tab }}
        </button>
      </div>

      <div class="tab-content">
        <div v-if="currentTab === '方案一'" class="scheme-info">
          <h2>方案一：CSS动画 + DOM复制</h2>
          <div class="scheme-details">
            <div class="scheme-features">
              <h3>✅ 优点</h3>
              <ul>
                <li>视觉上完美的无限循环</li>
                <li>保持CSS Scroll Snap的流畅性</li>
                <li>触摸手势自然流畅</li>
                <li>性能开销小（仅复制4个幻灯片）</li>
              </ul>
            </div>
            <div class="scheme-features">
              <h3>⚠️ 缺点</h3>
              <ul>
                <li>需要精确计算滚动位置</li>
                <li>需要处理滚动事件监听</li>
                <li>自动播放逻辑需要调整</li>
              </ul>
            </div>
          </div>
          <div class="scheme-demo">
            <div class="carousel-container">
              <div class="carousel-track">
                <div v-for="(slide, index) in [...slides.slice(-2), ...slides, ...slides.slice(0, 2)]" 
                     :key="`${slide.id}-${index}`" 
                     class="carousel-slide">
                  <div class="slide-image">
                    <img :src="slide.image" :alt="slide.title">
                  </div>
                  <div class="slide-content">
                    <span class="slide-tag">{{ slide.tag }}</span>
                    <h3>{{ slide.title }}</h3>
                    <p>{{ slide.subtitle }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="carousel-controls">
              <button class="control-btn prev-btn">←</button>
              <button class="control-btn next-btn">→</button>
            </div>
          </div>
          <div class="scheme-code">
            <h3>核心技术</h3>
            <pre><code>const extendedSlides = computed(() => {
  return [
    ...props.slides.slice(-2),
    ...props.slides,
    ...props.slides.slice(0, 2)
  ];
});</code></pre>
          </div>
        </div>

        <div v-if="currentTab === '方案二'" class="scheme-info">
          <h2>方案二：Vue Transition + 绝对定位</h2>
          <div class="scheme-details">
            <div class="scheme-features">
              <h3>✅ 优点</h3>
              <ul>
                <li>完全控制过渡效果</li>
                <li>易于实现自定义动画</li>
                <li>Vue生态原生支持</li>
              </ul>
            </div>
            <div class="scheme-features">
              <h3>❌ 缺点</h3>
              <ul>
                <li>失去CSS Scroll Snap的原生流畅性</li>
                <li>触摸手势需要手动实现</li>
                <li>代码复杂度较高</li>
                <li>性能开销较大（所有幻灯片同时渲染）</li>
              </ul>
            </div>
          </div>
          <div class="scheme-demo">
            <div class="carousel-container transition-demo">
              <div class="transition-slide">
                <div class="slide-image">
                  <img :src="slides[0].image" :alt="slides[0].title">
                </div>
                <div class="slide-content">
                  <span class="slide-tag">{{ slides[0].tag }}</span>
                  <h3>{{ slides[0].title }}</h3>
                  <p>{{ slides[0].subtitle }}</p>
                </div>
              </div>
            </div>
            <div class="carousel-controls">
              <button class="control-btn prev-btn">←</button>
              <button class="control-btn next-btn">→</button>
            </div>
          </div>
          <div class="scheme-code">
            <h3>核心技术</h3>
            <pre><code>&lt;transition name="slide"&gt;
  &lt;div v-for="slide in slides" 
        v-show="index === currentIndex"
        :key="slide.id"
        class="slide"&gt;
    &lt;/div&gt;
&lt;/transition&gt;</code></pre>
          </div>
        </div>

        <div v-if="currentTab === '方案三'" class="scheme-info">
          <h2>方案三：Swiper.js库</h2>
          <div class="scheme-details">
            <div class="scheme-features">
              <h3>✅ 优点</h3>
              <ul>
                <li>成熟稳定，功能完善</li>
                <li>开箱即用的无限循环</li>
                <li>丰富的配置选项</li>
                <li>良好的移动端支持</li>
              </ul>
            </div>
            <div class="scheme-features">
              <h3>❌ 缺点</h3>
              <ul>
                <li>增加项目依赖（~50KB）</li>
                <li>可能与现有样式冲突</li>
                <li>定制化需要额外配置</li>
                <li>违背极简主义的"轻量化"原则</li>
              </ul>
            </div>
          </div>
          <div class="scheme-demo">
            <div class="carousel-container swiper-demo">
              <div class="swiper-slide">
                <div class="slide-image">
                  <img :src="slides[0].image" :alt="slides[0].title">
                </div>
                <div class="slide-content">
                  <span class="slide-tag">{{ slides[0].tag }}</span>
                  <h3>{{ slides[0].title }}</h3>
                  <p>{{ slides[0].subtitle }}</p>
                </div>
              </div>
            </div>
            <div class="carousel-controls">
              <button class="control-btn prev-btn">←</button>
              <button class="control-btn next-btn">→</button>
            </div>
          </div>
          <div class="scheme-code">
            <h3>核心技术</h3>
            <pre><code>import Swiper from 'swiper';
import { Navigation, Autoplay } from 'swiper/modules';

const swiper = new Swiper('.hero-carousel', {
  modules: [Navigation, Autoplay],
  loop: true,
  navigation: {
    nextEl: '.hero-navigation-next',
    prevEl: '.hero-navigation-prev',
  },
  autoplay: {
    delay: 5000,
  },
});</code></pre>
          </div>
        </div>
      </div>

      <div class="recommendation">
        <h2>💡 推荐方案</h2>
        <p>基于极简主义设计原则和用户体验考虑，我们<strong>强烈推荐方案一（CSS动画 + DOM复制）</strong>。</p>
        <div class="recommendation-reasons">
          <div class="reason">
            <h4>✅ 完美的无限循环</h4>
            <p>用户永远不会到达"终点"，提供流畅的浏览体验</p>
          </div>
          <div class="reason">
            <h4>✅ 保持极简主义</h4>
            <p>代码结构简洁清晰，无额外依赖</p>
          </div>
          <div class="reason">
            <h4>✅ 性能开销最小</h4>
            <p>仅复制4个幻灯片，使用虚拟滚动</p>
          </div>
          <div class="reason">
            <h4>✅ 与现有架构完美融合</h4>
            <p>基于现有的CSS Scroll Snap实现，改动最小</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.preview-page {
  padding: 4rem 2rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
}

.page-title {
  font-size: 3rem;
  font-weight: 300;
  color: #ffffff;
  text-align: center;
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-bottom: 3rem;
  font-weight: 300;
}

.tabs {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 1rem 2rem;
  font-size: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 400;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}

.tab-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 3rem;
  backdrop-filter: blur(10px);
}

.scheme-info h2 {
  font-size: 2rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
}

.scheme-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.scheme-features h3 {
  font-size: 1.25rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
}

.scheme-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.scheme-features li {
  padding: 0.75rem 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.scheme-features li:last-child {
  border-bottom: none;
}

.scheme-demo {
  margin-bottom: 3rem;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.3);
}

.carousel-track {
  display: flex;
  height: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  scrollbar-width: none;
}

.carousel-track::-webkit-scrollbar {
  display: none;
}

.carousel-slide {
  flex: 0 0 100%;
  scroll-snap-align: center;
  position: relative;
  height: 100%;
}

.slide-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.slide-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.85);
}

.slide-content {
  position: absolute;
  bottom: 15%;
  left: 10%;
  right: 10%;
  z-index: 2;
  text-align: left;
}

.slide-tag {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 1.5rem;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.slide-content h3 {
  font-size: 2.5rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 1rem;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.slide-content p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.75);
  line-height: 1.6;
  margin: 0;
}

.carousel-controls {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: rgba(0, 0, 0, 0.5);
}

.control-btn {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.95);
  transform: scale(1.1);
}

.scheme-code {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 3rem;
}

.scheme-code h3 {
  font-size: 1rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1rem;
}

.scheme-code pre {
  margin: 0;
  overflow-x: auto;
}

.scheme-code code {
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

.recommendation {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 3rem;
  margin-top: 3rem;
  backdrop-filter: blur(10px);
}

.recommendation h2 {
  font-size: 1.75rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.recommendation p {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 2rem;
}

.recommendation strong {
  color: #ffffff;
  font-weight: 500;
}

.recommendation-reasons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.reason h4 {
  font-size: 1.125rem;
  font-weight: 400;
  color: #ffffff;
  margin-bottom: 0.75rem;
  letter-spacing: -0.01em;
}

.reason p {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0;
}

.transition-demo,
.swiper-demo {
  display: flex;
  align-items: center;
  justify-content: center;
}

.transition-slide,
.swiper-slide {
  width: 100%;
  height: 100%;
  position: relative;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }

  .scheme-details {
    grid-template-columns: 1fr;
  }

  .slide-content h3 {
    font-size: 2rem;
  }

  .recommendation-reasons {
    grid-template-columns: 1fr;
  }
}
</style>