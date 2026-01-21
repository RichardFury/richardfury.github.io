<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import 'leaflet/dist/leaflet.css';
import { logger } from '../../utils/logger';

// 表单数据
const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

// 提交状态
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref('');

// 地图容器引用
const mapContainer = ref(null);
let mapInstance = null;

// 检测主题模式
const isDarkMode = ref(false);

// 监听主题变化
const checkTheme = () => {
  isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark';
  
  // 如果地图已初始化，更新地图样式
  if (mapInstance) {
    const mapStyle = isDarkMode.value ? 'streets-v4-dark' : 'streets-v4';
    const tileUrl = `https://api.maptiler.com/maps/${mapStyle}/{z}/{x}/{y}.png?key=afcEIJlhkTPJSB6xilyS`;

    // 移除旧的地图图层
    mapInstance.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        mapInstance.removeLayer(layer);
      }
    });
    
    // 添加新的地图图层
    L.tileLayer(tileUrl, {
      tileSize: 512,
      zoomOffset: -1,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
    }).addTo(mapInstance);
  }
};

// 联系信息数据 - 极简主义设计
  const contactInfo = {
    location: 'Hong Kong SAR, China',
    address: 'The Chinese University of Hong Kong, Shatin, New Territories, Hong Kong SAR, China',
    social: [
      { name: 'Bilibili', icon: 'Bilibili', link: 'https://space.bilibili.com/richardfury', handle: '@richardfury', category: 'Social Media' },
      { name: 'GitHub', icon: 'GitHub', link: 'https://github.com/richardfury', handle: '@richardfury', category: 'Code & Development' },
      { name: 'LinkedIn', icon: 'LinkedIn', link: 'https://linkedin.com/in/richardfury', handle: 'Richard Fury', category: 'Professional Network' },
      { name: 'Instagram', icon: 'Instagram', link: 'https://instagram.com/richardfury_art', handle: '@richardfury_art', category: 'Art & Photography' }
    ]
  };

// Formspree端点 - 请替换为您的实际表单ID
// 在 https://formspree.io 注册账号并创建表单后，将 'your-form-id' 替换为实际的表单ID
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xreeprnn';

// 表单验证
function validateForm() {
  const errors = [];

  if (!formData.value.name.trim()) {
    errors.push('请输入您的姓名');
  }

  if (!formData.value.email.trim()) {
    errors.push('请输入您的邮箱');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.push('请输入有效的邮箱地址');
  }

  if (!formData.value.subject.trim()) {
    errors.push('请输入主题');
  }

  if (!formData.value.message.trim()) {
    errors.push('请输入消息内容');
  } else if (formData.value.message.trim().length < 10) {
    errors.push('消息内容至少需要10个字符');
  }

  return errors;
}

// 表单提交处理
async function handleSubmit() {
  submitError.value = '';

  // 表单验证
  const errors = validateForm();
  if (errors.length > 0) {
    submitError.value = errors.join('<br>');
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData.value)
    });

    if (response.ok) {
      submitSuccess.value = true;

      // 重置表单
      formData.value = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };

      // 3秒后重置成功状态
      setTimeout(() => {
        submitSuccess.value = false;
      }, 3000);
    } else {
      const data = await response.json();
      throw new Error(data.error || '提交失败，请稍后重试');
    }
  } catch (error) {
    submitError.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
}

// 初始化地图
  const initMap = async () => {
    if (!mapContainer.value) return;

    try {
      // 动态加载Leaflet
      const L = await import('leaflet');

      // 初始化地图
      mapInstance = L.map(mapContainer.value, {
        center: [22.417663, 114.212345], // Hong Kong坐标
        zoom: 13,
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false
      });

      // 根据主题模式选择地图样式
      // 注意：尝试dark-matter样式（暗色物质主题）
      const mapStyle = isDarkMode.value ? 'streets-v4-dark' : 'streets-v4';
      const tileUrl = `https://api.maptiler.com/maps/${mapStyle}/{z}/{x}/{y}.png?key=afcEIJlhkTPJSB6xilyS`;
      
      // 使用MapTiler地图图层（与主题色保持一致）
      // 注意：URL必须包含.png扩展名
      L.tileLayer(tileUrl, {
        tileSize: 512,
        zoomOffset: -1,
        attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>'
      }).addTo(mapInstance);

      // 添加自定义SVG标记
      L.marker([22.417663, 114.212345], {
        icon: L.divIcon({
          className: 'custom-svg-marker',
          html: `
            <div class="marker-wrapper">
              <svg class="marker-svg" width="50" height="75" viewBox="0 0 24 24">
                <path d="M11 16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16H11ZM8.21567 14.3922C8.75496 14.2731 9.09558 13.7394 8.97647 13.2001C8.85735 12.6608 8.32362 12.3202 7.78433 12.4393L8.21567 14.3922ZM16.2157 12.4393C15.6764 12.3202 15.1426 12.6608 15.0235 13.2001C14.9044 13.7394 15.245 14.2731 15.7843 14.3922L16.2157 12.4393ZM15 7C15 8.65685 13.6569 10 12 10V12C14.7614 12 17 9.76142 17 7H15ZM12 10C10.3431 10 9 8.65685 9 7H7C7 9.76142 9.23858 12 12 12V10ZM9 7C9 5.34315 10.3431 4 12 4V2C9.23858 2 7 4.23858 7 7H9ZM12 4C13.6569 4 15 5.34315 15 7H17C17 4.23858 14.7614 2 12 2V4ZM11 11V16H13V11H11ZM20 17C20 17.2269 19.9007 17.5183 19.5683 17.8676C19.2311 18.222 18.6958 18.5866 17.9578 18.9146C16.4844 19.5694 14.3789 20 12 20V22C14.5917 22 16.9861 21.5351 18.7701 20.7422C19.6608 20.3463 20.4435 19.8491 21.0171 19.2463C21.5956 18.6385 22 17.8777 22 17H20ZM12 20C9.62114 20 7.51558 19.5694 6.04218 18.9146C5.30422 18.5866 4.76892 18.222 4.43166 17.8676C4.0993 17.5183 4 17.2269 4 17H2C2 17.8777 2.40438 18.6385 2.98287 19.2463C3.55645 19.8491 4.33918 20.3463 5.2299 20.7422C7.01386 21.5351 9.40829 22 12 22V20ZM4 17C4 16.6824 4.20805 16.2134 4.96356 15.6826C5.70129 15.1644 6.81544 14.7015 8.21567 14.3922L7.78433 12.4393C6.22113 12.7846 4.83528 13.3285 3.81386 14.0461C2.81023 14.7512 2 15.747 2 17H4ZM15.7843 14.3922C17.1846 14.7015 18.2987 15.1644 19.0364 15.6826C19.792 16.2134 20 16.6824 20 17H22C22 15.747 21.1898 14.7512 20.1861 14.0461C19.1647 13.3285 17.7789 12.7846 16.2157 12.4393L15.7843 14.3922Z" fill="currentColor"/>
              </svg>
            </div>
          `,
          iconSize: [80, 80],
          iconAnchor: [55, 50],
          popupAnchor: [0, -60]
        })
      }).addTo(mapInstance);

      // 确保地图正确渲染
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100);

      // 强制地图刷新以修复可能的渲染问题
      setTimeout(() => {
        mapInstance.invalidateSize();
      }, 100);

    } catch (error) {
      logger.error('地图加载失败:', error);
    }
  };

// 生命周期
onMounted(() => {
  checkTheme();
  initMap();
  
  // 监听主题变化
  const observer = new MutationObserver(() => {
    checkTheme();
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<template>
  <section class="contact-page">
    <div class="contact-container">
      <!-- 极简页面头部 -->
      <header class="contact-header">
        <h1 class="contact-title">Contact</h1>
        <p class="contact-subtitle">Let's create something meaningful together</p>
      </header>
      
      <!-- 极简网格模块化布局 -->
      <div class="contact-grid">
        <!-- 表单区域 - 占4fr -->
        <div class="contact-form-section">
          <div class="glass-card form-card">
            <h2 class="section-title">Send a Message</h2>

            <!-- 错误消息 -->
            <div v-if="submitError" class="error-message">
              <p v-html="submitError"></p>
            </div>

            <!-- 成功消息 -->
            <div v-if="submitSuccess" class="success-message">
              <p>Thank you for your message. I'll get back to you soon.</p>
            </div>
            
            <!-- 极简表单 -->
            <form @submit.prevent="handleSubmit" class="minimal-form">
              <div class="form-row">
                <div class="form-field">
                  <label for="name" class="form-label">Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    v-model="formData.name"
                    required
                    class="minimal-input"
                    placeholder="Your name"
                  >
                </div>
                
                <div class="form-field">
                  <label for="email" class="form-label">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    v-model="formData.email"
                    required
                    class="minimal-input"
                    placeholder="Your email"
                  >
                </div>
              </div>
              
              <div class="form-field">
                <label for="subject" class="form-label">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  v-model="formData.subject"
                  required
                  class="minimal-input"
                  placeholder="What's this about?"
                >
              </div>
              
              <div class="form-field">
                <label for="message" class="form-label">Message</label>
                <textarea 
                  id="message" 
                  v-model="formData.message"
                  required
                  rows="5"
                  class="minimal-textarea"
                  placeholder="Your message..."
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                class="minimal-button"
                :disabled="isSubmitting"
              >
                {{ isSubmitting ? 'Sending...' : 'Send Message' }}
              </button>
            </form>
          </div>
        </div>
        
        <!-- 联系信息区域 - 占2fr -->
        <div class="contact-info-section">
          <!-- 联系信息卡片 -->
          <div class="glass-card info-card">
            <h2 class="section-title">Get in Touch</h2>
            
            <div class="contact-modules">
              <!-- 位置模块 -->
              <div class="contact-module">
                <div class="module-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div class="module-content">
                  <span class="module-label">Location</span>
                  <p class="module-text">{{ contactInfo.location }}</p>
                  <p class="module-subtext">{{ contactInfo.address }}</p>
                </div>
              </div>
              
              <!-- 地图模块 -->
              <div class="contact-module">
                <div class="module-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                  </div>
                <div class="module-content">
                    <span class="module-label">Map</span>
                </div>
              </div>
              <div class="map-module">
                <div class="map-container" ref="mapContainer"></div>
              </div>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ========================================
   极简网格模块化布局 - 方案四
   设计原则：极简主义、大量留白、液体玻璃效果
======================================== */

/* 页面容器 */
.contact-page {
  padding: var(--spacing-3xl) 0;
  min-height: 100vh;
  background-color: var(--bg-primary);
}

.contact-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
}

/* ========================================
   极简页面头部
======================================== */
.contact-header {
  text-align: center;
  padding: var(--spacing-3xl) 0 var(--spacing-2xl);
  animation: fadeIn 0.6s ease-out;
}

.contact-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 3.5rem;
  font-weight: 300;
  letter-spacing: -0.02em;
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
  line-height: 1.1;
}

.contact-subtitle {
  font-size: 1.25rem;
  font-weight: 300;
  color: var(--text-secondary);
  letter-spacing: 0.005em;
  margin: 0;
}

/* ========================================
   极简网格模块化布局
   响应式设计：
   - 移动端（<768px）：单列布局
   - 平板端（768px-1024px）：8fr:4fr
   - 桌面端（>1024px）：4fr:2fr
======================================== */
.contact-grid {
  display: grid;
  gap: var(--spacing-2xl);
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
  /* 确保两栏高度一致 */
  align-items: stretch;
}

/* 移动端：单列布局 */
@media (max-width: 767px) {
  .contact-grid {
    grid-template-columns: 1fr;
    /* 移动端不需要拉伸对齐 */
    align-items: start;
  }
  
  .contact-title {
    font-size: 2.5rem;
  }
  
  .contact-subtitle {
    font-size: 1.1rem;
  }
  
  /* 移动端卡片不需要强制高度 */
  .glass-card {
    height: auto;
  }
  
  /* 移动端表单不需要填充 */
  .minimal-form {
    flex: auto;
  }
  
  /* 移动端联系模块不需要填充 */
  .contact-modules {
    flex: auto;
  }
  
  /* 移动端地图模块不需要填充 */
  .map-module {
    flex: auto;
    min-height: auto;
  }

  /* 移动端地图容器使用固定高度和宽高比 */
  .map-container {
    aspect-ratio: 1 / 1;
    height: 250px;
    min-height: 250px;
    max-height: 250px;
  }
}

/* 平板端：8fr:4fr (66.7%:33.3%) */
@media (min-width: 768px) and (max-width: 1024px) {
  .contact-grid {
    grid-template-columns: 8fr 4fr;
    gap: var(--spacing-xl);
  }

  .contact-title {
    font-size: 3rem;
  }

  /* 平板端地图容器优化 */
  .map-container {
    aspect-ratio: 1 / 1;
    max-height: 350px;
  }
}

/* 桌面端：4fr:2fr (67%:33%) */
@media (min-width: 1025px) {
  .contact-grid {
    grid-template-columns: 4fr 2fr;
    gap: var(--spacing-2xl);
  }

  /* 桌面端地图容器优化 */
  .map-container {
    aspect-ratio: 1 / 1;
    max-height: 400px;
  }
}

/* ========================================
   液体玻璃效果卡片
======================================== */
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-backdrop);
  -webkit-backdrop-filter: var(--glass-backdrop);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
  padding: var(--spacing-2xl);
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--glass-shadow-hover);
}

/* 表单卡片 */
.form-card {
  animation: fadeInUp 0.6s ease-out 0.4s backwards;
}

/* 信息卡片 */
.info-card {
  animation: fadeInUp 0.6s ease-out 0.4s backwards;
}

/* 社交卡片 */
.social-card {
  animation: fadeInUp 0.6s ease-out 0.5s backwards;
}

/* ========================================
   极简表单样式
======================================== */
.minimal-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  /* 让表单填充卡片剩余空间 */
  flex: 1;
}

/* 表单行 - 用于并排显示字段 */
.form-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

@media (min-width: 640px) {
  .form-row {
    grid-template-columns: 1fr 1fr;
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-label {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: 0.01em;
  text-transform: uppercase;
}

.minimal-input,
.minimal-textarea {
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 1rem;
  font-family: inherit;
  line-height: 1.5;
  transition: all var(--transition-normal);
}

.minimal-input:focus,
.minimal-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--focus-ring);
  background-color: var(--bg-primary);
}

.minimal-input::placeholder,
.minimal-textarea::placeholder {
  color: var(--text-tertiary);
  font-weight: 300;
}

.minimal-textarea {
  resize: vertical;
  min-height: 120px;
}

/* 极简按钮 */
.minimal-button {
  display: inline-block;
  padding: var(--spacing-md) var(--spacing-2xl);
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  border: 2px solid var(--accent-primary);
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 400;
  letter-spacing: 0.005em;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-align: center;
  text-decoration: none;
}

.minimal-button:hover:not(:disabled) {
  background-color: transparent;
  color: var(--accent-primary);
  transform: translateY(-2px);
}

.minimal-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 成功消息 */
.success-message {
  background-color: var(--success-bg);
  color: var(--success);
  padding: var(--spacing-lg);
  border-radius: 8px;
  text-align: center;
  font-size: 0.95rem;
  animation: fadeIn 0.3s ease-out;
  border: 1px solid var(--success);
}

/* 错误消息 */
.error-message {
  background-color: var(--error-bg);
  color: var(--error);
  padding: var(--spacing-lg);
  border-radius: 8px;
  text-align: center;
  font-size: 0.95rem;
  animation: fadeIn 0.3s ease-out;
  border: 1px solid var(--error);
  margin-bottom: var(--spacing-lg);
}

.error-message p {
  margin: 0;
  line-height: 1.5;
}

/* ========================================
   极简联系模块
======================================== */
.contact-modules {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  /* 让联系模块填充卡片剩余空间 */
  flex: 1;
}

.contact-module {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  transition: all var(--transition-normal);
}

.contact-module:first-child {
  border-bottom: 1px solid var(--glass-border);
}

.module-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  transition: all var(--transition-normal);
}

.contact-module:hover .module-icon {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
}

.module-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.module-label {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.module-link {
  font-size: 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: all var(--transition-normal);
  border-bottom: 1px solid var(--accent-tertiary);
}

.module-link:hover {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.module-text {
  font-size: 1rem;
  color: var(--text-primary);
  margin: 0;
  font-weight: 400;
}

.module-subtext {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  font-style: italic;
}

/* ========================================
   Module Content Wrapper - 并排布局
======================================== */
.module-content-wrapper {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  width: 100%;
}

.module-content-wrapper .module-icon {
  flex-shrink: 0;
}

.module-content-wrapper .module-label-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
}

/* ========================================
   极简社交媒体网格
======================================== */
.social-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

@media (min-width: 640px) {
  .social-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.social-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  text-decoration: none;
  transition: all var(--transition-normal);
  text-align: center;
}

.social-link:hover {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.social-icon-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-normal);
}

.social-name {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.01em;
}

/* ========================================
   极简地图样式 - MapTiler风格（与主题色保持一致）
======================================== */
.map-module {
  border-bottom: none;
  /* 让地图模块填充剩余空间 */
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 300px;
  align-items: center;
  justify-content: center;
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  background: var(--bg-tertiary);
  /* justify-content: center; */
}

/* Leaflet地图样式覆盖 */
.map-container :deep(.leaflet-container) {
  width: 100%;
  height: 100%;
  z-index: 1;
}

.map-container :deep(.leaflet-control-attribution) {
  display: none;
}

.map-container :deep(.leaflet-control-zoom) {
  display: none;
}

/* 自定义SVG标记图标 */
.custom-svg-marker {
  background: transparent;
  border: none;
}

.marker-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.marker-svg {
  width: 40px;
  height: 60px;
  color: var(--accent-primary);
  display: block;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  transition: transform 0.3s ease, color 0.3s ease;
}

.marker-svg:hover {
  transform: scale(1.1);
}

/* 脉冲动画 */
.pulse-ring {
  animation: pulse 2s ease-in-out infinite;
  opacity: 0.6;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* Pin形状 */
.pin-shape {
  transition: fill 0.3s ease;
}

/* 内部圆点 */
.pin-dot {
  transition: fill 0.3s ease;
}

.pin-center {
  transition: fill 0.3s ease;
}

/* 深色主题优化 */
[data-theme="dark"] .marker-svg {
  color: var(--accent-primary);
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.4));
}

[data-theme="dark"] .pulse-ring {
  stroke: var(--accent-primary);
}

[data-theme="dark"] .pin-shape {
  fill: var(--accent-primary);
}

[data-theme="dark"] .pin-center {
  fill: var(--bg-primary-dark);
}

/* ========================================
   极简标题样式
======================================== */
.section-title {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.75rem;
  font-weight: 300;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.3;
}

.section-title-sm {
  font-family: 'Playfair Display', 'Georgia', serif;
  font-size: 1.25rem;
  font-weight: 300;
  letter-spacing: -0.005em;
  color: var(--text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.3;
}

/* ========================================
   极简动画效果
======================================== */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ========================================
   响应式优化
======================================== */
@media (max-width: 640px) {
  .contact-page {
    padding: var(--spacing-xl) 0;
  }

  .contact-header {
    padding: var(--spacing-xl) 0 var(--spacing-lg);
  }

  .glass-card {
    padding: var(--spacing-xl);
  }

  .social-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-title {
    font-size: 1.5rem;
  }

  .section-title-sm {
    font-size: 1.1rem;
  }

  /* 移动端优化 module-content-wrapper */
  .module-content-wrapper {
    gap: var(--spacing-sm);
  }

  .module-content-wrapper .module-icon {
    width: 32px;
    height: 32px;
  }

  .module-content-wrapper .module-label-wrapper .module-label {
    font-size: 0.75rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  /* 平板端优化 module-content-wrapper */
  .module-content-wrapper {
    gap: var(--spacing-md);
  }
}

@media (min-width: 1025px) {
  /* 桌面端优化 module-content-wrapper */
  .module-content-wrapper {
    gap: var(--spacing-lg);
  }
}

/* ========================================
   可访问性增强
======================================== */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 焦点可见性 */
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* ========================================
   深色主题优化
======================================== */
[data-theme="dark"] .glass-card {
  background: var(--glass-bg-dark);
  border-color: var(--glass-border-dark);
  box-shadow: var(--glass-shadow-dark);
}

[data-theme="dark"] .glass-card:hover {
  box-shadow: var(--glass-shadow-hover-dark);
}

[data-theme="dark"] .minimal-input,
[data-theme="dark"] .minimal-textarea {
  background-color: var(--bg-primary-dark);
  border-color: var(--glass-border-dark);
}

[data-theme="dark"] .contact-module {
  border-bottom-color: var(--glass-border-dark);
}

[data-theme="dark"] .module-icon {
  background-color: var(--bg-tertiary-dark);
}

[data-theme="dark"] .social-link {
  background-color: var(--bg-tertiary-dark);
  border-color: var(--glass-border-dark);
}
</style>
