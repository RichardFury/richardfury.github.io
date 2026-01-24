<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import TheHeader from './components/TheHeader.vue';
import TheFooter from './components/TheFooter.vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
import SQLiteAnalyticsService from './services/SQLiteAnalyticsService.js';
import { logger } from './utils/logger';

// 主题管理
const theme = ref('light');

// 主题切换
function toggleTheme() {
  const newTheme = theme.value === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
}

// 应用主题并触发事件
function applyTheme(newTheme) {
  document.documentElement.setAttribute('data-theme', newTheme);
  theme.value = newTheme;
  localStorage.setItem('theme', newTheme);
  
  // 触发主题变化事件，让其他组件可以监听到
  document.dispatchEvent(new CustomEvent('themeChange', { detail: newTheme }));
}

// 初始化主题
onMounted(async () => {
  // 初始化分析服务
  await SQLiteAnalyticsService.init()
  
  // 收集设备信息
  collectDeviceInfo()
  
  // 收集地理信息
  collectGeoInfo()
  
  // 跟踪页面访问
  trackPageView()
  
  // 设置事件监听
  setupEventListeners()
  
  // 从本地存储获取主题，否则使用系统主题
  const savedTheme = localStorage.getItem('theme');
  const systemTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  applyTheme(savedTheme || systemTheme);
  
  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
  
  // 添加滚动事件监听，用于导航栏样式变化
  window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (nav) {
      if (window.scrollY > 50) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
  });
});

onUnmounted(() => {
  SQLiteAnalyticsService.stopSync()
  stopDurationSave()
})

function collectDeviceInfo() {
  const deviceType = getDeviceType()
  const os = getOS()
  const browser = getBrowser()
  const resolution = `${window.screen.width}x${window.screen.height}`
  
  logger.debug('[App.vue] 收集设备信息:', { deviceType, os, browser, resolution })
  
  SQLiteAnalyticsService.addDevice({
    deviceType,
    os,
    browser,
    resolution,
    userAgent: navigator.userAgent
  }).then(() => {
    logger.debug('[App.vue] 设备信息保存成功')
  }).catch(error => {
    logger.error('[App.vue] 设备信息保存失败:', error)
  })
}

function getDeviceType() {
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

function getOS() {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Windows')) return 'Windows'
  if (userAgent.includes('Mac')) return 'macOS'
  if (userAgent.includes('Linux')) return 'Linux'
  if (userAgent.includes('Android')) return 'Android'
  if (userAgent.includes('iOS')) return 'iOS'
  return 'Unknown'
}

function getBrowser() {
  const userAgent = navigator.userAgent
  if (userAgent.includes('Chrome')) return 'Chrome'
  if (userAgent.includes('Safari')) return 'Safari'
  if (userAgent.includes('Firefox')) return 'Firefox'
  if (userAgent.includes('Edge')) return 'Edge'
  return 'Unknown'
}

function collectGeoInfo() {
  const language = navigator.language || 'en'
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  
  // 国家到坐标的映射
  const countryToCoordinates = {
    '中国': { lat: 35.8617, lng: 104.1954 },
    '日本': { lat: 36.2048, lng: 138.2529 },
    '韩国': { lat: 35.9078, lng: 127.7669 },
    '新加坡': { lat: 1.3521, lng: 103.8198 },
    '印度': { lat: 20.5937, lng: 78.9629 },
    '阿联酋': { lat: 23.4241, lng: 53.8478 },
    '英国': { lat: 55.3781, lng: -3.4360 },
    '法国': { lat: 46.2276, lng: 2.2137 },
    '德国': { lat: 51.1657, lng: 10.4515 },
    '意大利': { lat: 41.8719, lng: 12.5674 },
    '西班牙': { lat: 40.4637, lng: -3.7492 },
    '荷兰': { lat: 52.1326, lng: 5.2913 },
    '比利时': { lat: 50.5039, lng: 4.4699 },
    '奥地利': { lat: 47.5162, lng: 14.5501 },
    '瑞士': { lat: 46.8182, lng: 8.2275 },
    '瑞典': { lat: 60.1282, lng: 18.6435 },
    '挪威': { lat: 60.4720, lng: 8.4689 },
    '丹麦': { lat: 56.2639, lng: 9.5018 },
    '芬兰': { lat: 61.9241, lng: 25.7482 },
    '波兰': { lat: 51.9194, lng: 19.1451 },
    '捷克': { lat: 49.8175, lng: 15.4730 },
    '匈牙利': { lat: 47.1625, lng: 19.5033 },
    '希腊': { lat: 39.0742, lng: 21.8243 },
    '俄罗斯': { lat: 61.5240, lng: 105.3188 },
    '土耳其': { lat: 38.9637, lng: 35.2433 },
    '美国': { lat: 37.0902, lng: -95.7129 },
    '加拿大': { lat: 56.1304, lng: -106.3468 },
    '巴西': { lat: -14.2350, lng: -51.9253 },
    '阿根廷': { lat: -38.4161, lng: -63.6167 },
    '墨西哥': { lat: 23.6345, lng: -102.5528 },
    '秘鲁': { lat: -9.1899, lng: -75.0152 },
    '哥伦比亚': { lat: 4.5709, lng: -74.2973 },
    '澳大利亚': { lat: -25.2744, lng: 133.7751 },
    '新西兰': { lat: -40.9006, lng: 174.8860 },
    '埃及': { lat: 26.8206, lng: 30.8025 },
    '南非': { lat: -30.5595, lng: 22.9375 },
    '尼日利亚': { lat: 9.0820, lng: 8.6753 },
    'Unknown': { lat: 0, lng: 0 }
  }
  
  // 使用IP地址获取地理位置
  fetch('https://ipapi.co/json/')
    .then(response => response.json())
    .then(data => {
      const country = data.country_name || 'Unknown'
      const city = data.city || 'Unknown'
      const coordinates = countryToCoordinates[country] || { lat: 0, lng: 0 }
      
      logger.debug('[App.vue] 通过IP获取地理位置:', { country, city, ip: data.ip, coordinates })

      SQLiteAnalyticsService.addGeo({
        country,
        countryCode: data.country_code || 'XX',
        city,
        latitude: data.latitude || coordinates.lat,
        longitude: data.longitude || coordinates.lng,
        language: language.split('-')[0],
        timezone,
        ipAddress: data.ip || 'Unknown'
      })
    })
    .catch(error => {
      logger.error('[App.vue] 获取IP地理位置失败:', error)
      
      // 失败时使用时区推断作为后备
      const timezoneToCountry = {
        'Asia/Shanghai': '中国',
        'Asia/Beijing': '中国',
        'Asia/Hong_Kong': '中国',
        'Asia/Taipei': '中国',
        'Asia/Tokyo': '日本',
        'Asia/Seoul': '韩国',
        'Asia/Singapore': '新加坡',
        'Asia/Kolkata': '印度',
        'Asia/Dubai': '阿联酋',
        'Europe/London': '英国',
        'Europe/Paris': '法国',
        'Europe/Berlin': '德国',
        'Europe/Rome': '意大利',
        'Europe/Madrid': '西班牙',
        'Europe/Amsterdam': '荷兰',
        'Europe/Brussels': '比利时',
        'Europe/Vienna': '奥地利',
        'Europe/Zurich': '瑞士',
        'Europe/Stockholm': '瑞典',
        'Europe/Oslo': '挪威',
        'Europe/Copenhagen': '丹麦',
        'Europe/Helsinki': '芬兰',
        'Europe/Warsaw': '波兰',
        'Europe/Prague': '捷克',
        'Europe/Budapest': '匈牙利',
        'Europe/Athens': '希腊',
        'Europe/Moscow': '俄罗斯',
        'Europe/Istanbul': '土耳其',
        'America/New_York': '美国',
        'America/Los_Angeles': '美国',
        'America/Chicago': '美国',
        'America/Houston': '美国',
        'America/Phoenix': '美国',
        'America/Denver': '美国',
        'America/Toronto': '加拿大',
        'America/Vancouver': '加拿大',
        'America/Montreal': '加拿大',
        'America/Sao_Paulo': '巴西',
        'America/Buenos_Aires': '阿根廷',
        'America/Mexico_City': '墨西哥',
        'America/Lima': '秘鲁',
        'America/Bogota': '哥伦比亚',
        'Australia/Sydney': '澳大利亚',
        'Australia/Melbourne': '澳大利亚',
        'Pacific/Auckland': '新西兰',
        'Africa/Cairo': '埃及',
        'Africa/Johannesburg': '南非',
        'Africa/Lagos': '尼日利亚'
      }
      
      const inferredCountry = timezoneToCountry[timezone] || 'Unknown'
      const coordinates = countryToCoordinates[inferredCountry] || { lat: 0, lng: 0 }
      
      const countryToCity = {
        '中国': '北京',
        '日本': '东京',
        '韩国': '首尔',
        '新加坡': '新加坡',
        '印度': '新德里',
        '阿联酋': '迪拜',
        '英国': '伦敦',
        '法国': '巴黎',
        '德国': '柏林',
        '意大利': '罗马',
        '西班牙': '马德里',
        '荷兰': '阿姆斯特丹',
        '比利时': '布鲁塞尔',
        '奥地利': '维也纳',
        '瑞士': '苏黎世',
        '瑞典': '斯德哥尔摩',
        '挪威': '奥斯陆',
        '丹麦': '哥本哈根',
        '芬兰': '赫尔辛基',
        '波兰': '华沙',
        '捷克': '布拉格',
        '匈牙利': '布达佩斯',
        '希腊': '雅典',
        '俄罗斯': '莫斯科',
        '土耳其': '伊斯坦布尔',
        '美国': '纽约',
        '加拿大': '多伦多',
        '巴西': '圣保罗',
        '阿根廷': '布宜诺斯艾利斯',
        '墨西哥': '墨西哥城',
        '秘鲁': '利马',
        '哥伦比亚': '波哥大',
        '澳大利亚': '悉尼',
        '新西兰': '奥克兰',
        '埃及': '开罗',
        '南非': '约翰内斯堡',
        '尼日利亚': '拉各斯'
      }
      
      const inferredCity = countryToCity[inferredCountry] || 'Unknown'
      
      logger.debug('[App.vue] 使用时区推断地理位置:', { country: inferredCountry, city: inferredCity, coordinates })

      SQLiteAnalyticsService.addGeo({
        country: inferredCountry,
        countryCode: 'XX',
        city: inferredCity,
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        language: language.split('-')[0],
        timezone,
        ipAddress: 'Unknown'
      })
    })
}

function trackPageView() {
  const path = window.location.pathname
  SQLiteAnalyticsService.addVisit({
    path,
    title: document.title,
    referrer: document.referrer,
    duration: 0
  })
}

function setupEventListeners() {
  // 点击事件
  document.addEventListener('click', (e) => {
    const target = e.target
    const tagName = target.tagName.toLowerCase()
    const className = target.className

    SQLiteAnalyticsService.addEvent({
      type: 'click',
      tagName,
      className,
      x: e.clientX,
      y: e.clientY,
      pageX: e.pageX,
      pageY: e.pageY
    })
  }, { passive: true })

  // 滚动事件
  let scrollTimeout
  document.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      )

      SQLiteAnalyticsService.addEvent({
        type: 'scroll',
        scrollPercent,
        scrollY: window.scrollY
      })
    }, 500)
  }, { passive: true })

  // 页面可见性变化（替代beforeunload）
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // 页面隐藏时，更新当前页面的停留时长
      const path = window.location.pathname
      const visits = SQLiteAnalyticsService.getVisits()
      visits.then(allVisits => {
        const lastVisit = allVisits.filter(v => v.path === path).pop()
        if (lastVisit) {
          const duration = Math.round((Date.now() - lastVisit.timestamp) / 1000)
          // 直接更新IndexedDB中的记录
          updateVisitDuration(lastVisit.id, duration)
        }
      })
    } else if (document.visibilityState === 'visible') {
      // 页面可见时，记录新的访问
      trackPageView()
    }
  })

  // 启动定期保存时长（每30秒）
  startDurationSave()
}

// 更新访问记录的时长
const updateVisitDuration = async (visitId, duration) => {
  try {
    const db = SQLiteAnalyticsService.db
    if (!db) return

    // 使用SQLite的UPDATE语句更新访问时长
    const stmt = db.prepare(`
      UPDATE visits
      SET duration = ?
      WHERE id = ?
    `)
    stmt.run([duration, visitId])
    stmt.free()

    logger.debug('[App.vue] 更新访问时长:', visitId, duration)
  } catch (error) {
    logger.error('[App.vue] 更新访问时长失败:', error)
  }
}

// 定期保存时长（每30秒）
let saveDurationInterval = null
const startDurationSave = () => {
  saveDurationInterval = setInterval(() => {
    const path = window.location.pathname
    const visits = SQLiteAnalyticsService.getVisits()
    visits.then(allVisits => {
      const lastVisit = allVisits.filter(v => v.path === path).pop()
      if (lastVisit) {
        const duration = Math.round((Date.now() - lastVisit.timestamp) / 1000)
        updateVisitDuration(lastVisit.id, duration)
      }
    })
  }, 30000) // 每30秒保存一次
}

const stopDurationSave = () => {
  if (saveDurationInterval) {
    clearInterval(saveDurationInterval)
    saveDurationInterval = null
  }
}
</script>

<template>
  <div class="app-container" :class="{ 'dark-theme': theme === 'dark' }">
    <TheHeader :theme="theme" @toggle-theme="toggleTheme" />
    <main class="main-content">
      <ErrorBoundary>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </ErrorBoundary>
    </main>
    <TheFooter />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-normal);
}/* 主内容区域 */
.main-content {
  flex: 1;
  padding-top: 80px; /* 为固定导航栏预留空间 */
  padding-bottom: var(--spacing-2xl);
}

/* 当主内容包含home-page时，移除padding-top以支持全屏设计 */
.main-content:has(.home-page) {
  padding-top: 0;
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-normal);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
