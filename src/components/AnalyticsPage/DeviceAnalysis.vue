<template>
  <div class="device-analysis-container">
    <!-- 操作按钮 -->
    <div class="action-bar">
      <button @click="exportData" class="export-button" title="导出数据">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        <span>导出数据</span>
      </button>
    </div>

    <!-- 设备类型分布 -->
    <div class="analysis-section">
      <h3 class="section-title">设备类型分布</h3>
      <div class="section-content">
        <div class="chart-wrapper">
          <div ref="deviceTypeChart" class="chart"></div>
        </div>
        <div class="stats-list">
          <div
            v-for="item in deviceTypeData"
            :key="item.name"
            class="stat-item"
          >
            <div class="stat-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="item.icon"
                />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-name">{{ item.name }}</div>
              <div class="stat-value">{{ item.value.toLocaleString() }}</div>
            </div>
            <div class="stat-percent">{{ item.percent }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 操作系统分布 -->
    <div class="analysis-section">
      <h3 class="section-title">操作系统分布</h3>
      <div class="section-content">
        <div class="chart-wrapper">
          <div ref="osChart" class="chart"></div>
        </div>
        <div class="stats-list">
          <div
            v-for="item in osData"
            :key="item.name"
            class="stat-item"
          >
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-name">{{ item.name }}</div>
              <div class="stat-value">{{ item.value.toLocaleString() }}</div>
            </div>
            <div class="stat-percent">{{ item.percent }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 浏览器分布 -->
    <div class="analysis-section">
      <h3 class="section-title">浏览器分布</h3>
      <div class="section-content">
        <div class="chart-wrapper">
          <div ref="browserChart" class="chart"></div>
        </div>
        <div class="stats-list">
          <div
            v-for="item in browserData"
            :key="item.name"
            class="stat-item"
          >
            <div class="stat-icon" :style="{ backgroundColor: item.color }">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
            </div>
            <div class="stat-info">
              <div class="stat-name">{{ item.name }}</div>
              <div class="stat-value">{{ item.value.toLocaleString() }}</div>
            </div>
            <div class="stat-percent">{{ item.percent }}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 屏幕分辨率分布 -->
    <div class="analysis-section">
      <h3 class="section-title">屏幕分辨率分布</h3>
      <div class="section-content">
        <div class="chart-wrapper full-width">
          <div ref="resolutionChart" class="chart"></div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <transition name="fade">
      <div v-if="isLoading" class="analysis-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载设备数据...</div>
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
const deviceTypeChart = ref(null)
const osChart = ref(null)
const browserChart = ref(null)
const resolutionChart = ref(null)
const isLoading = ref(true)

// 图表实例
let deviceTypeChartInstance = null
let osChartInstance = null
let browserChartInstance = null
let resolutionChartInstance = null

// 设备类型数据
const deviceTypeData = ref([
  {
    name: '桌面端',
    value: 0,
    percent: 0,
    icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
  },
  {
    name: '移动端',
    value: 0,
    percent: 0,
    icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z'
  },
  {
    name: '平板',
    value: 0,
    percent: 0,
    icon: 'M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
  }
])

// 操作系统数据
const osData = ref([
  { name: 'Windows', value: 0, percent: 0, color: '#404040' },
  { name: 'macOS', value: 0, percent: 0, color: '#737373' },
  { name: 'iOS', value: 0, percent: 0, color: '#a3a3a3' },
  { name: 'Android', value: 0, percent: 0, color: '#d4d4d4' },
  { name: 'Linux', value: 0, percent: 0, color: '#52525b' }
])

// 浏览器数据
const browserData = ref([
  { name: 'Chrome', value: 0, percent: 0, color: '#404040' },
  { name: 'Safari', value: 0, percent: 0, color: '#737373' },
  { name: 'Firefox', value: 0, percent: 0, color: '#a3a3a3' },
  { name: 'Edge', value: 0, percent: 0, color: '#d4d4d4' },
  { name: '其他', value: 0, percent: 0, color: '#52525b' }
])

// 屏幕分辨率数据
const resolutionData = ref([
  { name: '1920x1080', value: 0 },
  { name: '1366x768', value: 0 },
  { name: '1440x900', value: 0 },
  { name: '2560x1440', value: 0 },
  { name: '1536x864', value: 0 },
  { name: '1280x720', value: 0 },
  { name: '3840x2160', value: 0 },
  { name: '其他', value: 0 }
])

// 加载设备数据
const loadDeviceData = async () => {
  try {
    const deviceStats = await SQLiteAnalyticsService.getDeviceStats(props.timeRange)

    // 更新设备类型数据
    if (deviceStats.deviceTypes && deviceStats.deviceTypes.length > 0) {
      deviceStats.deviceTypes.forEach((item, index) => {
        if (index < deviceTypeData.value.length) {
          deviceTypeData.value[index].value = item.value
          deviceTypeData.value[index].percent = item.percent
        }
      })
    }

    // 更新操作系统数据
    if (deviceStats.osTypes && deviceStats.osTypes.length > 0) {
      // 首先将所有操作系统的数值重置为0
      osData.value.forEach(os => {
        os.value = 0
        os.percent = 0
      })
      
      // 然后根据操作系统名称进行匹配赋值
      deviceStats.osTypes.forEach(item => {
        const osIndex = osData.value.findIndex(os => os.name === item.name)
        if (osIndex !== -1) {
          // 如果找到匹配的操作系统，直接更新
          osData.value[osIndex].value = item.value
          osData.value[osIndex].percent = item.percent
        } else {
          // 如果没有找到匹配的操作系统，将其添加到其他类别
          osData.value[osData.value.length - 1].value += item.value
          osData.value[osData.value.length - 1].percent += item.percent
        }
      })
    }

    // 更新浏览器数据
    if (deviceStats.browserTypes && deviceStats.browserTypes.length > 0) {
      // 首先将所有浏览器的数值重置为0
      browserData.value.forEach(browser => {
        browser.value = 0
        browser.percent = 0
      })
      
      // 然后根据浏览器名称进行匹配赋值
      deviceStats.browserTypes.forEach(item => {
        const browserIndex = browserData.value.findIndex(browser => browser.name === item.name)
        if (browserIndex !== -1) {
          // 如果找到匹配的浏览器，直接更新
          browserData.value[browserIndex].value = item.value
          browserData.value[browserIndex].percent = item.percent
        } else {
          // 如果没有找到匹配的浏览器，将其添加到其他类别
          browserData.value[browserData.value.length - 1].value += item.value
          browserData.value[browserData.value.length - 1].percent += item.percent
        }
      })
    }

    // 更新屏幕分辨率数据
    if (deviceStats.resolutions && deviceStats.resolutions.length > 0) {
      // 首先将所有分辨率的数值重置为0
      resolutionData.value.forEach(res => {
        res.value = 0
      })
      
      // 然后根据分辨率名称进行匹配赋值
      deviceStats.resolutions.forEach(item => {
        const resIndex = resolutionData.value.findIndex(res => res.name === item.name)
        if (resIndex !== -1) {
          // 如果找到匹配的分辨率，直接更新
          resolutionData.value[resIndex].value = item.value
        } else {
          // 如果没有找到匹配的分辨率，将其添加到其他类别
          resolutionData.value[resolutionData.value.length - 1].value += item.value
        }
      })
    }
  } catch (error) {
    logger.error('[DeviceAnalysis] 加载数据失败:', error)
    alert(`加载数据失败：${error.message || '未知错误'}`)
  }
}

// 导出数据
const exportData = async () => {
  try {
    const data = {
      deviceType: deviceTypeData.value,
      os: osData.value,
      browser: browserData.value,
      resolution: resolutionData.value,
      timestamp: new Date().toISOString()
    }
    
    // 创建JSON文件
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = `device-analysis-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('设备数据导出成功！')
  } catch (error) {
    logger.error('[DeviceAnalysis] 导出数据失败:', error)
    alert(`导出数据失败：${error.message || '未知错误'}`)
  }
}

// 初始化设备类型图表
const initDeviceTypeChart = () => {
  if (!deviceTypeChart.value) return

  deviceTypeChartInstance = echarts.init(deviceTypeChart.value)

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
          borderRadius: 8,
          borderColor: '#141414',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          color: '#f5f5f5',
          fontSize: 12,
          formatter: '{b}\n{d}%'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        data: deviceTypeData.value.map(item => ({
          name: item.name,
          value: item.value
        }))
      }
    ],
    color: ['#404040', '#737373', '#a3a3a3']
  }

  deviceTypeChartInstance.setOption(option)
}

// 初始化操作系统图表
const initOSChart = () => {
  if (!osChart.value) return

  osChartInstance = echarts.init(osChart.value)

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
            fontSize: 14,
            fontWeight: 'bold',
            color: '#f5f5f5'
          }
        },
        data: osData.value.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color
          }
        }))
      }
    ]
  }

  osChartInstance.setOption(option)
}

// 初始化浏览器图表
const initBrowserChart = () => {
  if (!browserChart.value) return

  browserChartInstance = echarts.init(browserChart.value)

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
            fontSize: 14,
            fontWeight: 'bold',
            color: '#f5f5f5'
          }
        },
        data: browserData.value.map(item => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color
          }
        }))
      }
    ]
  }

  browserChartInstance.setOption(option)
}

// 初始化屏幕分辨率图表
const initResolutionChart = () => {
  if (!resolutionChart.value) return

  resolutionChartInstance = echarts.init(resolutionChart.value)

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
      data: resolutionData.value.map(item => item.name),
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
        data: resolutionData.value.map(item => item.value),
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

  resolutionChartInstance.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  deviceTypeChartInstance?.resize()
  osChartInstance?.resize()
  browserChartInstance?.resize()
  resolutionChartInstance?.resize()
}

// 监听时间范围变化
watch(() => props.timeRange, async () => {
  isLoading.value = true
  await loadDeviceData()
  isLoading.value = false
})

// 生命周期
onMounted(async () => {
  await loadDeviceData()
  setTimeout(() => {
    initDeviceTypeChart()
    initOSChart()
    initBrowserChart()
    initResolutionChart()
    isLoading.value = false
  }, 100)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  deviceTypeChartInstance?.dispose()
  osChartInstance?.dispose()
  browserChartInstance?.dispose()
  resolutionChartInstance?.dispose()
})
</script>

<style scoped>
/* ========================================
   设备分析组件样式
======================================== */

.device-analysis-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* 操作按钮栏 */
.action-bar {
  display: flex;
  justify-content: flex-end;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.export-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  color: var(--text-primary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-button:hover {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.export-button svg {
  width: 1rem;
  height: 1rem;
}

/* 分析部分 */
.analysis-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.section-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.chart-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.chart-wrapper.full-width {
  grid-column: 1 / -1;
}

.chart {
  width: 100%;
  height: 100%;
  min-height: 180px;
}

/* 统计列表 */
.stats-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  background-color: var(--bg-secondary);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  background-color: var(--bg-tertiary);
  transform: translateX(4px);
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: var(--accent-primary);
  border-radius: 8px;
  color: var(--bg-primary);
  flex-shrink: 0;
}

.stat-icon svg {
  width: 18px;
  height: 18px;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-value {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--text-secondary);
}

.stat-percent {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-primary);
  flex-shrink: 0;
}

/* 加载状态 */
.analysis-loading {
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
  .section-content {
    grid-template-columns: 1fr;
  }

  .chart-wrapper {
    min-height: 180px;
  }

  .chart {
    min-height: 160px;
  }
}

@media (max-width: 767px) {
  .device-analysis-container {
    gap: 1.25rem;
  }

  .section-title {
    font-size: 0.8125rem;
  }

  .section-content {
    gap: 0.75rem;
  }

  .chart-wrapper {
    min-height: 160px;
  }

  .chart {
    min-height: 140px;
  }

  .stat-item {
    padding: 0.5rem 0.625rem;
  }

  .stat-icon {
    width: 32px;
    height: 32px;
  }

  .stat-icon svg {
    width: 16px;
    height: 16px;
  }

  .stat-name {
    font-size: 0.75rem;
  }

  .stat-value {
    font-size: 0.6875rem;
  }

  .stat-percent {
    font-size: 0.8125rem;
  }
}

@media (max-width: 479px) {
  .stat-item {
    padding: 0.4375rem 0.5rem;
  }

  .stat-icon {
    width: 28px;
    height: 28px;
  }

  .stat-icon svg {
    width: 14px;
    height: 14px;
  }

  .stat-name {
    font-size: 0.6875rem;
  }

  .stat-value {
    font-size: 0.625rem;
  }

  .stat-percent {
    font-size: 0.75rem;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .stat-item {
    transition: none;
  }

  .loading-spinner {
    animation: none;
  }
}

/* 打印样式 */
@media print {
  .analysis-section {
    break-inside: avoid;
  }

  .chart-wrapper {
    background-color: white;
    border: 1px solid #ccc;
  }
}
</style>
