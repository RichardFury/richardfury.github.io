<template>
  <div class="world-map-container">
    <!-- 加载状态 -->
    <div v-if="isLoading" class="map-loading">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载地图...</p>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="map-error">
      <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <p class="error-text">{{ error }}</p>
      <button @click="retryInit" class="retry-button">重试</button>
    </div>

    <!-- 地图容器 -->
    <div
      ref="mapContainer"
      class="map-container"
      :style="{ opacity: isMapReady ? 1 : 0 }"
      role="region"
      aria-label="全球访问分布地图"
      aria-describedby="map-description"
    ></div>

    <!-- 视图切换器 -->
    <div v-if="isMapReady" class="map-view-toggle">
      <button
        class="map-toggle-button"
        :class="{ active: mapView === 'scatter' }"
        @click="switchView('scatter')"
        role="button"
        :aria-pressed="mapView === 'scatter'"
        aria-label="散点图视图"
        tabindex="0"
      >
        <svg class="map-toggle-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="3" cy="5" r="1.5" />
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="13" cy="6" r="1.5" />
          <circle cx="5" cy="10" r="1.5" />
          <circle cx="11" cy="11" r="1.5" />
        </svg>
        <span>散点</span>
      </button>
      <button
        class="map-toggle-button"
        :class="{ active: mapView === 'heatmap' }"
        @click="switchView('heatmap')"
        role="button"
        :aria-pressed="mapView === 'heatmap'"
        aria-label="热力图视图"
        tabindex="0"
      >
        <svg class="map-toggle-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="8" cy="8" r="5" fill="currentColor" opacity="0.2" />
          <circle cx="8" cy="8" r="3.5" fill="currentColor" opacity="0.4" />
          <circle cx="8" cy="8" r="2" fill="currentColor" opacity="0.6" />
          <circle cx="8" cy="8" r="0.8" fill="currentColor" opacity="0.8" />
        </svg>
        <span>热力</span>
      </button>
    </div>

    <!-- 图例 -->
    <div v-if="isMapReady" class="map-legend" :class="mapView + '-legend'">
      <!-- 散点图图例 -->
      <template v-if="mapView === 'scatter'">
        <div class="legend-title">访问量分布</div>
        <div class="legend-items">
          <div class="legend-item">
            <div class="legend-dot size-small"></div>
            <span class="legend-label">&lt; 100</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot size-medium"></div>
            <span class="legend-label">100-500</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot size-large"></div>
            <span class="legend-label">500-1000</span>
          </div>
          <div class="legend-item">
            <div class="legend-dot size-xlarge"></div>
            <span class="legend-label">&gt; 1000</span>
          </div>
        </div>
      </template>

      <!-- 热力图图例 -->
      <template v-else>
        <div class="legend-title">访问密度</div>
        <div class="legend-gradient">
          <div class="gradient-bar"></div>
          <div class="gradient-labels">
            <span>低</span>
            <span>中</span>
            <span>高</span>
          </div>
        </div>
      </template>

      <!-- 统计信息 -->
      <div class="legend-stats">
        <div class="stat-item">
          <span class="stat-label">{{ mapView === 'scatter' ? '总访问点' : '总访问量' }}</span>
          <span class="stat-value">{{ mapView === 'scatter' ? totalVisits.toLocaleString() : totalAnalyticsVisits.toLocaleString() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">覆盖地区</span>
          <span class="stat-value">{{ uniqueCountries }}</span>
        </div>
      </div>
    </div>

    <!-- 屏幕阅读器描述 -->
    <div id="map-description" class="sr-only">
      显示全球访问分布的交互式地图，支持散点图和热力图两种视图模式
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.heat'
import SQLiteAnalyticsService from '../../services/SQLiteAnalyticsService.js'
import { logger } from '../../utils/logger'

// Refs
const mapContainer = ref(null)
const map = ref(null)
const isLoading = ref(true)
const error = ref(null)
const isMapReady = ref(false)
const mapView = ref('heatmap') // 'scatter' | 'heatmap'
const containerSize = ref({ width: 0, height: 0 })
const isDarkMode = ref(false) // 主题检测

// 图层引用
const scatterLayer = ref(null)
const heatmapLayer = ref(null)
const tileLayer = ref(null) // 地图瓦片层引用

// MutationObserver引用
let observer = null

// MapTiler API Key
const MAPTILER_API_KEY = 'afcEIJlhkTPJSB6xilyS'

// 主题检测
const checkTheme = () => {
  isDarkMode.value = document.documentElement.getAttribute('data-theme') === 'dark'
  logger.debug('[WorldMap] 当前主题:', isDarkMode.value ? 'dark' : 'light')
}

// 更新地图瓦片层
const updateMapTileLayer = () => {
  if (!map.value) return
  
  logger.debug('[WorldMap] 更新地图瓦片层，当前主题:', isDarkMode.value ? 'dark' : 'light')
  
  // 移除旧的地图瓦片层
  map.value.eachLayer(layer => {
    if (layer._url && layer._url.includes('maptiler.com')) {
      logger.debug('[WorldMap] 移除旧地图瓦片层:', layer)
      map.value.removeLayer(layer)
    }
  })
  
  // 添加新的地图瓦片层
  const mapStyle = isDarkMode.value ? 'dataviz-v4-dark' : 'dataviz-v4-light'
  const tileUrl = `https://api.maptiler.com/maps/${mapStyle}/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`
  
  tileLayer.value = L.tileLayer(tileUrl, {
    tileSize: 512,
    zoomOffset: -1,
    attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
    crossOrigin: true
  }).addTo(map.value)
  
  // 强制刷新地图
  setTimeout(() => {
    if (map.value) {
      map.value.invalidateSize()
      logger.debug('[WorldMap] 地图已刷新')
    }
  }, 100)
  
  logger.debug('[WorldMap] 地图瓦片层已更新')
}

// 更新热力图颜色
const updateHeatmapGradient = () => {
  if (!heatmapLayer.value) return
  
  logger.debug('[WorldMap] 更新热力图颜色，当前主题:', isDarkMode.value ? 'dark' : 'light')
  
  // 根据主题更新热力图渐变（深色）
  const gradient = isDarkMode.value ? {
    // 深色模式：橙色渐变（更深）
    0.0: 'rgba(255, 165, 0, 0.0)',  // 透明
    0.3: 'rgba(255, 165, 0, 0.6)',  // 浅橙色
    0.5: 'rgba(255, 140, 0, 0.8)',  // 橙色
    0.7: 'rgba(255, 69, 0, 0.9)',   // 深橙色
    1.0: 'rgba(255, 215, 0, 1.0)'   // 金黄色（最热）
  } : {
    // 浅色模式：深蓝色渐变（更深）
    0.0: 'rgba(0, 0, 139, 0.0)',    // 透明
    0.3: 'rgba(0, 0, 139, 0.5)',    // 浅深蓝
    0.5: 'rgba(0, 0, 205, 0.7)',    // 中深蓝
    0.7: 'rgba(0, 0, 255, 0.9)',    // 蓝色
    1.0: 'rgba(65, 105, 225, 1.0)'  // 皇家蓝（最热）
  }
  
  heatmapLayer.value.setOptions({ gradient })
  logger.debug('[WorldMap] 热力图颜色已更新')
}

// 热力图渐变配置
const heatmapGradient = {
  0.0: 'rgba(64, 64, 64, 0.0)',
  0.2: 'rgba(64, 64, 64, 0.1)',
  0.4: 'rgba(64, 64, 64, 0.3)',
  0.6: 'rgba(64, 64, 64, 0.5)',
  0.8: 'rgba(64, 64, 64, 0.7)',
  1.0: 'rgba(64, 64, 64, 0.9)'
}

// 地理数据
const locations = ref([])
const totalVisits = ref(0)
const totalHeatmapVisits = ref(0)
const uniqueCountries = ref(0)
const totalAnalyticsVisits = ref(0)

// 加载地理数据
const loadGeoData = async () => {
  try {
    const geoStats = await SQLiteAnalyticsService.getGeoStats(props.timeRange)
    const summary = await SQLiteAnalyticsService.getSummaryFromStorage() || await SQLiteAnalyticsService.getSummary()

    // 使用AnalyticsPage一致的总访问量
    totalAnalyticsVisits.value = summary.total.visits

    // 将地理数据转换为地图坐标点
    const locationPoints = []
    
    // 使用城市数据
    if (geoStats.cities && geoStats.cities.length > 0) {
      geoStats.cities.forEach(city => {
        if (city.latitude && city.longitude) {
          locationPoints.push({
            lat: city.latitude,
            lng: city.longitude,
            name: city.name,
            value: city.visits
          })
        }
      })
    }
    
    // 如果城市数据不足，使用国家数据
    if (locationPoints.length < 5 && geoStats.countries && geoStats.countries.length > 0) {
      geoStats.countries.forEach(country => {
        if (country.latitude && country.longitude) {
          locationPoints.push({
            lat: country.latitude,
            lng: country.longitude,
            name: country.name,
            value: country.visits
          })
        }
      })
    }
    
    locations.value = locationPoints
    
    // 计算统计数据
    totalVisits.value = locationPoints.reduce((sum, loc) => sum + loc.value, 0)
    totalHeatmapVisits.value = totalVisits.value
    
    // 计算唯一的国家数量（从cityCoordinates映射中推断国家）
    const countrySet = new Set()
    locationPoints.forEach(loc => {
      // 从cityCoordinates中查找城市对应的国家
      for (const [city, coords] of Object.entries(cityCoordinates)) {
        if (loc.name === city) {
          // 从countryCoordinates中查找这个坐标对应的国家
          for (const [country, countryCoords] of Object.entries(countryCoordinates)) {
            if (Math.abs(coords.lat - countryCoords.lat) < 0.1 && 
                Math.abs(coords.lng - countryCoords.lng) < 0.1) {
              countrySet.add(country)
            }
          }
          break
        }
      }
    })
    
    uniqueCountries.value = countrySet.size
    
    logger.debug('[WorldMap] 加载地理数据成功:', locationPoints.length, '个点，总访问量:', totalVisits.value, '覆盖地区:', uniqueCountries.value)
  } catch (error) {
    logger.error('[WorldMap] 加载地理数据失败:', error)
    alert(`加载地理数据失败：${error.message || '未知错误'}`)
    // 使用默认数据
    locations.value = [
      { lat: 39.9042, lng: 116.4074, name: '北京', value: 1 },
      { lat: 31.2304, lng: 121.4737, name: '上海', value: 1 },
      { lat: 40.7128, lng: -74.0060, name: '纽约', value: 1 },
      { lat: 51.5074, lng: -0.1278, name: '伦敦', value: 1 },
      { lat: 35.6762, lng: 139.6503, name: '东京', value: 1 }
    ]
    totalVisits.value = 5
    totalHeatmapVisits.value = 5
    uniqueCountries.value = 5
    totalAnalyticsVisits.value = 5
  }
}

// 初始化地图
const initMap = async () => {
  logger.debug('[WorldMap] 开始初始化地图')
  isLoading.value = true
  error.value = null

  try {
    await nextTick()

    if (!mapContainer.value) {
      throw new Error('地图容器未找到')
    }

    const rect = mapContainer.value.getBoundingClientRect()
    containerSize.value = {
      width: rect.width,
      height: rect.height
    }

    if (rect.width === 0 || rect.height === 0) {
      throw new Error('地图容器尺寸无效: ' + rect.width + 'x' + rect.height)
    }

    if (map.value) {
      logger.debug('[WorldMap] 清理旧地图实例')
      map.value.remove()
      map.value = null
    }

    logger.debug('[WorldMap] 创建地图实例')
    map.value = L.map(mapContainer.value, {
      center: [30, 0],
      zoom: 2,
      minZoom: 1,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: true
    })

    logger.debug('[WorldMap] 地图实例已创建:', map.value)

    // 检测当前主题
    checkTheme()

    // 添加地图瓦片层
    updateMapTileLayer()

    map.value.on('load', () => {
      logger.debug('[WorldMap] 地图加载完成')
      isMapReady.value = true
      isLoading.value = false
    })

    map.value.on('tileload', (event) => {
      if (!isMapReady.value) {
        logger.debug('[WorldMap] 瓦片加载完成，设置地图为就绪状态')
        isMapReady.value = true
        isLoading.value = false
      }
    })

    setTimeout(() => {
      if (isLoading.value) {
        logger.debug('[WorldMap] 地图加载超时，强制设置为就绪状态')
        isMapReady.value = true
        isLoading.value = false
      }
    }, 5000)
    
    // 添加MapTiler地图瓦片层
    const mapStyle = isDarkMode.value ? 'dataviz-v4-dark' : 'dataviz-v4-light'
    const tileUrl = `https://api.maptiler.com/maps/${mapStyle}/{z}/{x}/{y}.png?key=${MAPTILER_API_KEY}`
    logger.debug('[WorldMap] 地图瓦片URL:', tileUrl)

    L.tileLayer(tileUrl, {
      tileSize: 512,
      zoomOffset: -1,
      attribution: '&copy; <a href="https://www.maptiler.com/">MapTiler</a>',
      crossOrigin: true
    }).addTo(map.value)

    logger.debug('[WorldMap] 地图瓦片层已添加')

    // 初始化散点图层
    initScatterLayer()

    // 初始化热力图层
    initHeatmapLayer()

    // 显示默认视图
    switchView('heatmap')

    setTimeout(() => {
      if (map.value) {
        map.value.invalidateSize()
        logger.debug('[WorldMap] 地图尺寸已更新')
      }
    }, 100)

  } catch (err) {
    logger.error('[WorldMap] 地图初始化失败:', err)
    error.value = `地图加载失败: ${err.message}`
    isLoading.value = false
    isMapReady.value = false
  }
}

// 初始化散点图层
const initScatterLayer = () => {
  logger.debug('[WorldMap] 初始化散点图层')

  // 创建标记组
  const markers = L.markerClusterGroup({
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    spiderfyOnMaxZoom: true,
    removeOutsideVisibleBounds: true,
    animate: true,
    animateAddingMarkers: true,
    disableClusteringAtZoom: 8,
    maxClusterRadius: 50,
    spiderfyDistanceMultiplier: 1.5,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount()
      let size = 'size-small'
      if (count >= 10) size = 'size-medium'
      if (count >= 50) size = 'size-large'
      if (count >= 100) size = 'size-xlarge'

      return L.divIcon({
        className: `cluster-marker ${size}`,
        html: `<span>${count}</span>`,
        iconSize: null,
        iconAnchor: null
      })
    }
  })

  // 添加标记
  locations.value.forEach(loc => {
    const size = getDotSize(loc.value)
    const marker = L.marker([loc.lat, loc.lng], {
      icon: L.divIcon({
        className: `scatter-marker`,
        html: `<div class="scatter-dot ${size}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })
    })

    marker.bindPopup(`
      <div class="scatter-popup">
        <div class="popup-header">${loc.name}</div>
        <div class="popup-body">
          <div class="popup-stat">
            <span class="stat-label">访问量</span>
            <span class="stat-value">${loc.value.toLocaleString()}</span>
          </div>
          <div class="popup-stat">
            <span class="stat-label">占比</span>
            <span class="stat-value">${((loc.value / totalVisits.value) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    `, {
      className: 'scatter-popup-wrapper',
      maxWidth: 200
    })

    markers.addLayer(marker)
  })

  scatterLayer.value = markers
  logger.debug('[WorldMap] 散点图层已创建')
}

// 初始化热力图层
const initHeatmapLayer = () => {
  logger.debug('[WorldMap] 初始化热力图层')

  const heatData = locations.value.map(loc => [loc.lat, loc.lng, loc.value / 100])

  // 根据主题获取热力图渐变（使用updateHeatmapGradient函数）
  const gradient = isDarkMode.value ? {
    // 深色模式：橙色渐变（更深）
    0.0: 'rgba(255, 165, 0, 0.0)',  // 透明
    0.3: 'rgba(255, 165, 0, 0.6)',  // 浅橙色
    0.5: 'rgba(255, 140, 0, 0.8)',  // 橙色
    0.7: 'rgba(255, 69, 0, 0.9)',   // 深橙色
    1.0: 'rgba(255, 215, 0, 1.0)'   // 金黄色（最热）
  } : {
    // 浅色模式：深蓝色渐变（更深）
    0.0: 'rgba(0, 0, 139, 0.0)',    // 透明
    0.3: 'rgba(0, 0, 139, 0.5)',    // 浅深蓝
    0.5: 'rgba(0, 0, 205, 0.7)',    // 中深蓝
    0.7: 'rgba(0, 0, 255, 0.9)',    // 蓝色
    1.0: 'rgba(65, 105, 225, 1.0)'  // 皇家蓝（最热）
  }

  const heat = L.heatLayer(heatData, {
    radius: 25,
    blur: 15,
    maxZoom: 10,
    maxOpacity: 0.8,
    minOpacity: 0.1,
    gradient
  })

  heatmapLayer.value = heat
  logger.debug('[WorldMap] 热力图层已创建，当前主题:', isDarkMode.value ? 'dark' : 'light')
}

// 获取散点大小
const getDotSize = (value) => {
  if (value < 100) return 'size-small'
  if (value < 500) return 'size-medium'
  if (value < 1000) return 'size-large'
  return 'size-xlarge'
}

// 切换视图
const switchView = (view) => {
  logger.debug('[WorldMap] 切换视图:', view)
  mapView.value = view

  if (!map.value) return

  // 移除所有图层
  if (scatterLayer.value) {
    map.value.removeLayer(scatterLayer.value)
  }
  if (heatmapLayer.value) {
    map.value.removeLayer(heatmapLayer.value)
  }

  // 添加选中的图层
  if (view === 'scatter' && scatterLayer.value) {
    map.value.addLayer(scatterLayer.value)
  } else if (view === 'heatmap' && heatmapLayer.value) {
    map.value.addLayer(heatmapLayer.value)
  }
}

// 重试初始化
const retryInit = () => {
  logger.debug('[WorldMap] 重试初始化')
  initMap()
}

// 生命周期
onMounted(async () => {
  logger.debug('[WorldMap] 组件已挂载')
  await loadGeoData()
  setTimeout(() => {
    initMap()
  }, 300)
  
  // 监听主题变化
  let observer = new MutationObserver(() => {
    checkTheme()
    updateMapTileLayer()
    updateHeatmapGradient()
  })
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  })
})

onUnmounted(() => {
  if (map.value) {
    logger.debug('[WorldMap] 清理地图实例')
    map.value.remove()
    map.value = null
  }
  
  // 断开MutationObserver连接，防止内存泄漏
  if (observer) {
    observer.disconnect()
    observer = null
  }
})
</script>

<style scoped>
/* ========================================
   世界地图组件样式
======================================== */

.world-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--bg-secondary);
}

.map-container {
  width: 100%;
  height: 100%;
  z-index: 1;
  transition: opacity 0.3s ease;
}

/* 加载状态 */
.map-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--glass-border);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* 错误状态 */
.map-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  z-index: 10;
  padding: 2rem;
  text-align: center;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: var(--error);
  margin-bottom: 1rem;
}

.error-text {
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
  max-width: 300px;
}

.retry-button {
  padding: 0.5rem 1.5rem;
  background-color: var(--accent-primary);
  border: none;
  border-radius: 6px;
  color: var(--bg-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-button:hover {
  background-color: var(--accent-secondary);
  transform: translateY(-2px);
}

/* 视图切换器 */
.map-view-toggle {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--glass-border);
  z-index: 100;
  backdrop-filter: blur(12px);
}

.map-toggle-button {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 0.875rem;
  background-color: transparent;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal) ease;
  position: relative;
  overflow: hidden;
}

.map-toggle-button.active {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(64, 64, 64, 0.2);
}

.map-toggle-button:hover:not(.active) {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}

.map-toggle-button.active:hover {
  background-color: var(--accent-secondary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 64, 64, 0.3);
}

.map-toggle-button:active {
  transform: scale(0.98);
}

.map-toggle-button:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.map-toggle-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  transition: transform var(--transition-fast) ease;
}

.map-toggle-button:hover .map-toggle-icon {
  transform: scale(1.1);
}

/* 图例 */
.map-legend {
  position: absolute;
  bottom: 2rem;
  right: 2rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 1rem;
  box-shadow: var(--glass-shadow-hover);
  backdrop-filter: blur(12px);
  z-index: 100;
  max-width: 200px;
}

.legend-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

/* 热力图图例 */
.heatmap-legend .legend-gradient {
  margin-bottom: 0.75rem;
}

.heatmap-legend .gradient-bar {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(
    to right,
    rgba(64, 64, 64, 0.1),
    rgba(64, 64, 64, 0.3),
    rgba(64, 64, 64, 0.5),
    rgba(64, 64, 64, 0.7),
    rgba(64, 64, 64, 0.9)
  );
}

.heatmap-legend .gradient-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.375rem;
  font-size: 0.6875rem;
  color: var(--text-secondary);
}

/* 散点图图例 */
.scatter-legend .legend-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.scatter-legend .legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.scatter-legend .legend-dot {
  background-color: var(--accent-primary);
  border: 2px solid var(--bg-primary);
  border-radius: 50%;
  flex-shrink: 0;
}

/* 深色主题下的legend散点边缘 */
[data-theme="dark"] .scatter-legend .legend-dot {
  border-color: #ffffff ;
}

/* 浅色主题下的legend散点边缘 */
[data-theme="light"] .scatter-legend .legend-dot {
  border-color: #404040 ;
}

.scatter-legend .legend-dot.size-small {
  width: 8px;
  height: 8px;
}

.scatter-legend .legend-dot.size-medium {
  width: 12px;
  height: 12px;
}

.scatter-legend .legend-dot.size-large {
  width: 16px;
  height: 16px;
}

.scatter-legend .legend-dot.size-xlarge {
  width: 20px;
  height: 20px;
}

.scatter-legend .legend-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* 图例统计 */
.legend-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--glass-border);
}

.legend-stats .stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.legend-stats .stat-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.legend-stats .stat-value {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-primary);
}

/* Leaflet 样式覆盖 */
:deep(.leaflet-container) {
  background-color: var(--bg-secondary);
  font-family: inherit;
}

:deep(.leaflet-control-attribution) {
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 10px;
}

/* 散点标记 */
:deep(.scatter-marker) {
  background: transparent;
  border: none;
}

:deep(.scatter-dot) {
  width: 12px;
  height: 12px;
  background-color: var(--accent-primary);
  border: 2px solid;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(64, 64, 64, 0.3);
  transition: all var(--transition-normal) ease;
}

/* 深色主题下的散点边缘 */
[data-theme="dark"] :deep(.scatter-dot) {
  border-color: #ffffff ;
}

/* 浅色主题下的散点边缘 */
[data-theme="light"] :deep(.scatter-dot) {
  border-color: #404040 ;
}

:deep(.scatter-dot.size-small) {
  width: 8px;
  height: 8px;
}

:deep(.scatter-dot.size-medium) {
  width: 12px;
  height: 12px;
}

:deep(.scatter-dot.size-large) {
  width: 16px;
  height: 16px;
}

:deep(.scatter-dot.size-xlarge) {
  width: 20px;
  height: 20px;
}

:deep(.scatter-marker:hover .scatter-dot) {
  transform: scale(1.3);
  background-color: var(--accent-secondary);
  box-shadow: 0 4px 12px rgba(64, 64, 64, 0.4);
}

/* 聚合标记 */
:deep(.cluster-marker) {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-primary);
  border: 2px solid;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(64, 64, 64, 0.3);
  transition: all var(--transition-normal) ease;
  cursor: pointer;
}

/* 浅色主题下的聚合标记背景 */
[data-theme="light"] :deep(.cluster-marker) {
  background-color: rgba(64, 64, 64, 0.3) ;
}

/* 深色主题下的聚合标记边缘 */
[data-theme="dark"] :deep(.cluster-marker) {
  border: 2px solid #ffffff ;
  color: #ffffff ;
}

/* 浅色主题下的聚合标记边缘 */
[data-theme="light"] :deep(.cluster-marker) {
  border: 2px solid #404040 ;
  color: #404040 ;
}

:deep(.cluster-marker:hover) {
  transform: scale(1.1);
  background-color: var(--accent-secondary);
  box-shadow: 0 4px 12px rgba(64, 64, 64, 0.4);
}

:deep(.cluster-marker.size-small) {
  width: 32px;
  height: 32px;
  font-size: 0.6875rem;
}

:deep(.cluster-marker.size-medium) {
  width: 40px;
  height: 40px;
  font-size: 0.75rem;
}

:deep(.cluster-marker.size-large) {
  width: 48px;
  height: 48px;
  font-size: 0.8125rem;
}

:deep(.cluster-marker.size-xlarge) {
  width: 56px;
  height: 56px;
  font-size: 0.875rem;
}

/* 散点弹窗 */
:deep(.scatter-popup-wrapper) {
  background-color: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  box-shadow: var(--glass-shadow-hover);
  backdrop-filter: blur(12px);
}

:deep(.scatter-popup) {
  min-width: 200px;
}

:deep(.scatter-popup .popup-header) {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--glass-border);
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.scatter-popup .popup-body) {
  padding: 1rem;
}

:deep(.scatter-popup .popup-stat) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

:deep(.scatter-popup .popup-stat:last-child) {
  margin-bottom: 0;
}

:deep(.scatter-popup .stat-label) {
  color: var(--text-secondary);
}

:deep(.scatter-popup .stat-value) {
  font-weight: 600;
  color: var(--text-primary);
}

/* 屏幕阅读器 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 响应式设计 */
/* 大屏幕 (≥ 1280px) */
@media (min-width: 1280px) {
  .map-legend {
    bottom: 2rem;
    right: 2rem;
    max-width: 200px;
  }
}

/* 中等屏幕 (1024px - 1279px) */
@media (min-width: 1024px) and (max-width: 1279px) {
  .map-legend {
    bottom: 1.5rem;
    right: 1.5rem;
    max-width: 180px;
  }
}

/* 平板 (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .map-legend {
    bottom: 1rem;
    right: 1rem;
    max-width: 160px;
    padding: 0.75rem;
  }

  .map-view-toggle {
    gap: 0.375rem;
  }

  .map-toggle-button {
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
  }
}

/* 手机 (≤ 767px) */
@media (max-width: 767px) {
  .map-view-toggle {
    top: 0.5rem;
    right: 0.5rem;
    gap: 0.25rem;
  }

  .map-toggle-button {
    padding: 0.375rem 0.5rem;
    font-size: 0.6875rem;
  }

  .map-toggle-icon {
    width: 14px;
    height: 14px;
  }

  .map-legend {
    bottom: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
    padding: 0.75rem;
  }

  :deep(.scatter-dot.size-xlarge) {
    width: 16px;
    height: 16px;
  }

  :deep(.scatter-dot.size-large) {
    width: 14px;
    height: 14px;
  }
}

/* 触摸优化 */
@media (hover: none) and (pointer: coarse) {
  .map-toggle-button {
    min-width: 44px;
    min-height: 44px;
    padding: 0.5rem;
  }

  :deep(.scatter-dot) {
    width: 16px;
    height: 16px;
  }

  :deep(.cluster-marker) {
    min-width: 44px;
    min-height: 44px;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .map-toggle-button,
  :deep(.scatter-dot),
  :deep(.cluster-marker),
  .map-legend {
    transition: none;
  }
}

@media (prefers-contrast: high) {
  .map-toggle-button {
    border-width: 2px;
  }

  .map-toggle-button.active {
    box-shadow: 0 0 0 2px var(--accent-primary);
  }

  :deep(.scatter-dot) {
    border-width: 3px;
  }

  :deep(.cluster-marker) {
    border-width: 3px;
  }

  .map-legend {
    border-width: 2px;
  }
}
</style>
