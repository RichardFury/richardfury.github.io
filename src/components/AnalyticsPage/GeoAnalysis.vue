<template>
  <div class="geo-analysis-container">
    <!-- 地理位置分析标签 -->
    <div class="geo-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="selectTab(tab.key)"
        class="geo-tab"
        :class="{ active: activeTab === tab.key }"
      >
        <svg class="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            :d="tab.icon"
          />
        </svg>
        <span>{{ tab.label }}</span>
      </button>
    </div>

    <!-- 内容区域 -->
    <div class="geo-content">
      <!-- 国家排行 -->
      <div v-if="activeTab === 'countries'" class="countries-analysis">
        <div ref="countriesChart" class="chart-container"></div>
        <div class="ranking-list">
          <div
            v-for="(country, index) in countryRanking"
            :key="country.code"
            class="ranking-item"
            :class="{ 'top-three': index < 3 }"
          >
            <div class="rank-badge" :class="`rank-${index + 1}`">
              {{ index + 1 }}
            </div>
            <div class="country-info">
              <div class="country-flag">{{ country.flag }}</div>
              <div class="country-name">{{ country.name }}</div>
            </div>
            <div class="country-stats">
              <div class="stat-value">{{ country.visits.toLocaleString() }}</div>
              <div class="stat-percent">{{ country.percent }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 城市排行 -->
      <div v-else-if="activeTab === 'cities'" class="cities-analysis">
        <div ref="citiesChart" class="chart-container"></div>
        <div class="ranking-list">
          <div
            v-for="(city, index) in cityRanking"
            :key="city.id"
            class="ranking-item"
            :class="{ 'top-three': index < 3 }"
          >
            <div class="rank-badge" :class="`rank-${index + 1}`">
              {{ index + 1 }}
            </div>
            <div class="city-info">
              <div class="city-name">{{ city.name }}</div>
              <div class="city-country">{{ city.country }}</div>
            </div>
            <div class="city-stats">
              <div class="stat-value">{{ city.visits.toLocaleString() }}</div>
              <div class="stat-percent">{{ city.percent }}%</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 时区分布 -->
      <div v-else-if="activeTab === 'timezone'" class="timezone-analysis">
        <div ref="timezoneChart" class="chart-container"></div>
        <div class="timezone-stats">
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-label">主要时区</div>
              <div class="stat-value">UTC+8</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-label">覆盖时区</div>
              <div class="stat-value">24</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-label">活跃用户</div>
              <div class="stat-value">{{ activeUsers.toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 语言分布 -->
      <div v-else-if="activeTab === 'language'" class="language-analysis">
        <div ref="languageChart" class="chart-container"></div>
        <div class="language-list">
          <div
            v-for="lang in languageData"
            :key="lang.code"
            class="language-item"
          >
            <div class="lang-flag">{{ lang.flag }}</div>
            <div class="lang-info">
              <div class="lang-name">{{ lang.name }}</div>
              <div class="lang-code">{{ lang.code }}</div>
            </div>
            <div class="lang-stats">
              <div class="stat-value">{{ lang.visits.toLocaleString() }}</div>
              <div class="stat-percent">{{ lang.percent }}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <transition name="fade">
      <div v-if="isLoading" class="geo-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载地理数据...</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import SQLiteAnalyticsService from '../../services/SQLiteAnalyticsService.js'
import { logger } from '../../utils/logger'

// Props
const props = defineProps({
  timeRange: {
    type: String,
    default: 'today'
  }
})

// Refs
const countriesChart = ref(null)
const citiesChart = ref(null)
const timezoneChart = ref(null)
const languageChart = ref(null)
const isLoading = ref(true)
const activeTab = ref('countries')
const activeUsers = ref(0)

// 图表实例
let countriesChartInstance = null
let citiesChartInstance = null
let timezoneChartInstance = null
let languageChartInstance = null

// 标签页
const tabs = [
  {
    key: 'countries',
    label: '国家排行',
    icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    key: 'cities',
    label: '城市排行',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
  },
  {
    key: 'timezone',
    label: '时区分布',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    key: 'language',
    label: '语言分布',
    icon: 'M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.4 5.012M6 12a1 1 0 001-1V7a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1zm0 0h6m-6 0a1 1 0 001-1v-4a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1zm0 0v6m0-6a1 1 0 001-1v-4a1 1 0 00-1-1H4a1 1 0 00-1 1v4a1 1 0 001 1zm0 0h6'
  }
]

// 国家排行数据
const countryRanking = ref([
  { code: 'US', name: '美国', flag: '🇺🇸', visits: 0, percent: 0 },
  { code: 'CN', name: '中国', flag: '🇨🇳', visits: 0, percent: 0 },
  { code: 'GB', name: '英国', flag: '🇬🇧', visits: 0, percent: 0 },
  { code: 'DE', name: '德国', flag: '🇩🇪', visits: 0, percent: 0 },
  { code: 'JP', name: '日本', flag: '🇯🇵', visits: 0, percent: 0 },
  { code: 'FR', name: '法国', flag: '🇫🇷', visits: 0, percent: 0 },
  { code: 'CA', name: '加拿大', flag: '🇨🇦', visits: 0, percent: 0 },
  { code: 'AU', name: '澳大利亚', flag: '🇦🇺', visits: 0, percent: 0 },
  { code: 'BR', name: '巴西', flag: '🇧🇷', visits: 0, percent: 0 },
  { code: 'IN', name: '印度', flag: '🇮🇳', visits: 0, percent: 0 }
])

// 城市排行数据
const cityRanking = ref([
  { id: 1, name: 'San Francisco', country: '美国', visits: 0, percent: 0 },
  { id: 2, name: 'New York', country: '美国', visits: 0, percent: 0 },
  { id: 3, name: 'London', country: '英国', visits: 0, percent: 0 },
  { id: 4, name: 'Tokyo', country: '日本', visits: 0, percent: 0 },
  { id: 5, name: 'Beijing', country: '中国', visits: 0, percent: 0 },
  { id: 6, name: 'Shanghai', country: '中国', visits: 0, percent: 0 },
  { id: 7, name: 'Berlin', country: '德国', visits: 0, percent: 0 },
  { id: 8, name: 'Paris', country: '法国', visits: 0, percent: 0 },
  { id: 9, name: 'Sydney', country: '澳大利亚', visits: 0, percent: 0 },
  { id: 10, name: 'Toronto', country: '加拿大', visits: 0, percent: 0 }
])

// 语言数据
const languageData = ref([
  { code: 'en', name: '英语', flag: '🇬🇧', visits: 0, percent: 0 },
  { code: 'zh', name: '中文', flag: '🇨🇳', visits: 0, percent: 0 },
  { code: 'es', name: '西班牙语', flag: '🇪🇸', visits: 0, percent: 0 },
  { code: 'fr', name: '法语', flag: '🇫🇷', visits: 0, percent: 0 },
  { code: 'de', name: '德语', flag: '🇩🇪', visits: 0, percent: 0 },
  { code: 'ja', name: '日语', flag: '🇯🇵', visits: 0, percent: 0 },
  { code: 'ko', name: '韩语', flag: '🇰🇷', visits: 0, percent: 0 }
])

// 时区数据
const timezoneData = ref([
  { name: 'UTC+8', value: 0, percent: 0 },
  { name: 'UTC-5', value: 0, percent: 0 },
  { name: 'UTC+0', value: 0, percent: 0 },
  { name: 'UTC+1', value: 0, percent: 0 },
  { name: 'UTC+9', value: 0, percent: 0 },
  { name: 'UTC-8', value: 0, percent: 0 },
  { name: 'UTC+2', value: 0, percent: 0 },
  { name: '其他', value: 0, percent: 0 }
])

// 加载地理数据
const loadGeoData = async () => {
  try {
    const geoStats = await SQLiteAnalyticsService.getGeoStats(props.timeRange)

    // 更新国家排行数据
    if (geoStats.countries && geoStats.countries.length > 0) {
      geoStats.countries.forEach((item, index) => {
        if (index < countryRanking.value.length) {
          countryRanking.value[index].visits = item.visits
          countryRanking.value[index].percent = item.percent
        }
      })
    }

    // 更新城市排行数据
    if (geoStats.cities && geoStats.cities.length > 0) {
      geoStats.cities.forEach((item, index) => {
        if (index < cityRanking.value.length) {
          cityRanking.value[index].visits = item.visits
          cityRanking.value[index].percent = item.percent
        }
      })
    }

    // 更新语言数据
    if (geoStats.languages && geoStats.languages.length > 0) {
      geoStats.languages.forEach((item, index) => {
        if (index < languageData.value.length) {
          languageData.value[index].visits = item.visits
          languageData.value[index].percent = item.percent
        }
      })
    }
    
    // 更新时区数据
    if (geoStats.timezones && geoStats.timezones.length > 0) {
      geoStats.timezones.forEach((item, index) => {
        if (index < timezoneData.value.length) {
          timezoneData.value[index].value = item.value
          timezoneData.value[index].percent = item.percent
        }
      })
    }
    
    // 计算活跃用户数（所有地理记录的总和）
    const totalGeoVisits = geoStats.countries.reduce((sum, country) => sum + country.visits, 0)
    activeUsers.value = totalGeoVisits
  } catch (error) {
    logger.error('[GeoAnalysis] 加载数据失败:', error)
    alert(`加载数据失败：${error.message || '未知错误'}`)
  }
}

// 选择标签
const selectTab = (key) => {
  activeTab.value = key
  // 延迟初始化图表以确保DOM已更新
  setTimeout(() => {
    if (key === 'countries') {
      initCountriesChart()
    } else if (key === 'cities') {
      initCitiesChart()
    } else if (key === 'timezone') {
      initTimezoneChart()
    } else if (key === 'language') {
      initLanguageChart()
    }
  }, 100)
}

// 初始化国家图表
const initCountriesChart = () => {
  if (!countriesChart.value) return

  if (countriesChartInstance) {
    countriesChartInstance.dispose()
  }

  countriesChartInstance = echarts.init(countriesChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      borderColor: 'rgba(64, 64, 64, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#f5f5f5',
        fontSize: 13
      },
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const param = params[0]
        return `
          <div style="margin-bottom: 4px; font-weight: 500;">${param.name}</div>
          <div>访问量: ${param.value.toLocaleString()}</div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: countryRanking.value.map(c => c.name),
      axisLine: {
        lineStyle: {
          color: 'rgba(113, 113, 122, 0.3)'
        }
      },
      axisLabel: {
        color: '#71717a',
        fontSize: 11,
        interval: 0,
        rotate: 30
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#71717a',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(113, 113, 122, 0.1)',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: countryRanking.value.map(c => c.visits),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#404040' },
              { offset: 1, color: '#737373' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: '#a3a3a3'
          }
        }
      }
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }

  countriesChartInstance.setOption(option)
}

// 初始化城市图表
const initCitiesChart = () => {
  if (!citiesChart.value) return

  if (citiesChartInstance) {
    citiesChartInstance.dispose()
  }

  citiesChartInstance = echarts.init(citiesChart.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      borderColor: 'rgba(64, 64, 64, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#f5f5f5',
        fontSize: 13
      },
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const param = params[0]
        return `
          <div style="margin-bottom: 4px; font-weight: 500;">${param.name}</div>
          <div>访问量: ${param.value.toLocaleString()}</div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: cityRanking.value.map(c => c.name),
      axisLine: {
        lineStyle: {
          color: 'rgba(113, 113, 122, 0.3)'
        }
      },
      axisLabel: {
        color: '#71717a',
        fontSize: 10,
        interval: 0,
        rotate: 45
      },
      axisTick: {
        show: false
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#71717a',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(113, 113, 122, 0.1)',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: cityRanking.value.map(c => c.visits),
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#404040' },
              { offset: 1, color: '#737373' }
            ]
          }
        },
        emphasis: {
          itemStyle: {
            color: '#a3a3a3'
          }
        }
      }
    ],
    animationDuration: 1000,
    animationEasing: 'cubicOut'
  }

  citiesChartInstance.setOption(option)
}

// 初始化时区图表
const initTimezoneChart = () => {
  if (!timezoneChart.value) return

  if (timezoneChartInstance) {
    timezoneChartInstance.dispose()
  }

  timezoneChartInstance = echarts.init(timezoneChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      borderColor: 'rgba(64, 64, 64, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#f5f5f5',
        fontSize: 13
      },
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      show: false
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#141414',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          color: '#f5f5f5',
          fontSize: 11,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold'
          }
        },
        data: timezoneData.value.map(item => ({
          name: item.name,
          value: item.value
        }))
      }
    ],
    color: ['#404040', '#737373', '#a3a3a3', '#d4d4d4', '#52525b', '#71717a', '#a1a1aa', '#d4d4d8']
  }

  timezoneChartInstance.setOption(option)
}

// 初始化语言图表
const initLanguageChart = () => {
  if (!languageChart.value) return

  if (languageChartInstance) {
    languageChartInstance.dispose()
  }

  languageChartInstance = echarts.init(languageChart.value)

  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      borderColor: 'rgba(64, 64, 64, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#f5f5f5',
        fontSize: 13
      },
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      show: false
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#141414',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 13,
            fontWeight: 'bold',
            color: '#f5f5f5'
          }
        },
        data: languageData.value.map(item => ({
          name: item.name,
          value: item.visits
        }))
      }
    ],
    color: ['#404040', '#737373', '#a3a3a3', '#d4d4d4', '#52525b', '#71717a', '#a1a1aa']
  }

  languageChartInstance.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  countriesChartInstance?.resize()
  citiesChartInstance?.resize()
  timezoneChartInstance?.resize()
  languageChartInstance?.resize()
}

// 监听时间范围变化
watch(() => props.timeRange, async () => {
  isLoading.value = true
  await loadGeoData()
  isLoading.value = false
})

// 生命周期
onMounted(async () => {
  await loadGeoData()
  setTimeout(() => {
    initCountriesChart()
    isLoading.value = false
  }, 100)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  countriesChartInstance?.dispose()
  citiesChartInstance?.dispose()
  timezoneChartInstance?.dispose()
  languageChartInstance?.dispose()
})
</script>

<style scoped>
/* ========================================
   地理位置分析组件样式
======================================== */

.geo-analysis-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标签页 */
.geo-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.geo-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
}

.geo-tab:hover {
  background-color: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.geo-tab.active {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* 内容区域 */
.geo-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 图表容器 */
.chart-container {
  width: 100%;
  height: 300px;
  margin-bottom: 1.5rem;
}

/* 排行列表 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  max-height: 250px;
  padding-right: 0.5rem;
}

/* 自定义滚动条 */
.ranking-list::-webkit-scrollbar {
  width: 6px;
}

.ranking-list::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 3px;
}

.ranking-list::-webkit-scrollbar-thumb {
  background: var(--accent-tertiary);
  border-radius: 3px;
}

.ranking-list::-webkit-scrollbar-thumb:hover {
  background: var(--accent-secondary);
}

/* 排行项 */
.ranking-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.ranking-item:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: translateX(4px);
}

.ranking-item.top-three {
  background: linear-gradient(135deg, rgba(64, 64, 64, 0.1), rgba(115, 115, 115, 0.1));
  border-color: rgba(64, 64, 64, 0.3);
}

.ranking-item.top-three:hover {
  background: linear-gradient(135deg, rgba(64, 64, 64, 0.2), rgba(115, 115, 115, 0.2));
  border-color: var(--accent-primary);
}

/* 排名徽章 */
.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--bg-tertiary);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  flex-shrink: 0;
}

.rank-badge.rank-1 {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(251, 191, 36, 0.3);
}

.rank-badge.rank-2 {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(156, 163, 175, 0.3);
}

.rank-badge.rank-3 {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: var(--bg-primary);
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
}

/* 国家信息 */
.country-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
  min-width: 0;
}

.country-flag {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.country-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 国家统计 */
.country-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.stat-value {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-percent {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--accent-primary);
}

/* 城市信息 */
.city-info {
  flex: 1;
  min-width: 0;
}

.city-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-country {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* 城市统计 */
.city-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

/* 时区统计 */
.timezone-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--accent-primary);
  border-radius: 8px;
  color: var(--bg-primary);
  flex-shrink: 0;
}

.stat-icon svg {
  width: 20px;
  height: 20px;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 语言列表 */
.language-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  max-height: 250px;
  padding-right: 0.5rem;
}

.language-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.language-item:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: translateX(4px);
}

.lang-flag {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.lang-info {
  flex: 1;
  min-width: 0;
}

.lang-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.lang-code {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.lang-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

/* 加载状态 */
.geo-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
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
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 1023px) {
  .chart-container {
    height: 250px;
  }

  .timezone-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-card {
    padding: 0.625rem;
  }

  .stat-value {
    font-size: 1rem;
  }
}

@media (max-width: 767px) {
  .geo-tabs {
    gap: 0.375rem;
  }

  .geo-tab {
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }

  .tab-icon {
    width: 16px;
    height: 16px;
  }

  .chart-container {
    height: 200px;
    margin-bottom: 1rem;
  }

  .ranking-item,
  .language-item {
    padding: 0.625rem 0.875rem;
  }

  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 0.8125rem;
  }

  .country-flag,
  .lang-flag {
    font-size: 1.25rem;
  }

  .country-name,
  .city-name,
  .lang-name {
    font-size: 0.875rem;
  }

  .stat-value {
    font-size: 0.875rem;
  }

  .stat-percent {
    font-size: 0.75rem;
  }
}

@media (max-width: 479px) {
  .geo-tabs {
    gap: 0.25rem;
  }

  .geo-tab {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .geo-tab span {
    display: none;
  }

  .geo-tab.active span {
    display: inline;
  }

  .ranking-item,
  .language-item {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .country-info,
  .city-info,
  .lang-info {
    width: 100%;
  }

  .country-stats,
  .city-stats,
  .lang-stats {
    width: 100%;
    justify-content: space-between;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .geo-tab,
  .ranking-item,
  .language-item,
  .stat-card {
    transition: none;
  }

  .loading-spinner {
    animation: none;
  }
}

/* 打印样式 */
@media print {
  .geo-tabs {
    display: none;
  }

  .chart-container {
    background-color: white;
    border: 1px solid #ccc;
  }

  .ranking-item,
  .language-item {
    break-inside: avoid;
    border: 1px solid #ccc;
  }
}
</style>
