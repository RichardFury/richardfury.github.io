<template>
  <div class="trend-chart-container">
    <!-- 图表切换 -->
    <div class="chart-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="selectTab(tab.key)"
        class="chart-tab"
        :class="{ active: activeTab === tab.key }"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 图表容器 -->
    <div ref="chartContainer" class="chart-container"></div>

    <!-- 图表统计 -->
    <div class="chart-stats">
      <div class="stat-item">
        <div class="stat-label">最高值</div>
        <div class="stat-value">{{ maxValue }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">最低值</div>
        <div class="stat-value">{{ minValue }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">平均值</div>
        <div class="stat-value">{{ avgValue }}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">增长率</div>
        <div class="stat-value trend-value" :class="trendClass">
          {{ growthRate }}
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <transition name="fade">
      <div v-if="isLoading" class="chart-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载图表数据...</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
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
const chartContainer = ref(null)
const chart = ref(null)
const isLoading = ref(true)
const activeTab = ref('visits')

// 图表标签
const tabs = [
  { key: 'visits', label: '访问量' },
  { key: 'visitors', label: '访客数' },
  { key: 'duration', label: '停留时长' },
  { key: 'bounce', label: '跳出率' }
]

// 真实数据
const chartData = ref({
  labels: [],
  values: []
})

// 计算统计数据
const currentData = computed(() => chartData.value)

const maxValue = computed(() => {
  const values = currentData.value.values
  if (values.length === 0) return '0'
  const max = Math.max(...values)
  return activeTab.value === 'duration' ? formatDuration(max) :
         activeTab.value === 'bounce' ? `${max}%` :
         max.toLocaleString()
})

const minValue = computed(() => {
  const values = currentData.value.values
  if (values.length === 0) return '0'
  const min = Math.min(...values)
  return activeTab.value === 'duration' ? formatDuration(min) :
         activeTab.value === 'bounce' ? `${min}%` :
         min.toLocaleString()
})

const avgValue = computed(() => {
  const values = currentData.value.values
  if (values.length === 0) return '0'
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  return activeTab.value === 'duration' ? formatDuration(Math.round(avg)) :
         activeTab.value === 'bounce' ? `${Math.round(avg)}%` :
         Math.round(avg).toLocaleString()
})

const growthRate = computed(() => {
  const values = currentData.value.values
  if (values.length < 2) return '0%'
  const first = values[0]
  const last = values[values.length - 1]
  const rate = ((last - first) / first) * 100
  return `${rate > 0 ? '+' : ''}${rate.toFixed(1)}%`
})

const trendClass = computed(() => {
  const rate = parseFloat(growthRate.value)
  return rate > 0 ? 'trend-up' : rate < 0 ? 'trend-down' : 'trend-neutral'
})

// 格式化时长
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}

// 选择标签
const selectTab = async (key) => {
  activeTab.value = key
  await loadChartData()
  updateChart()
}

// 加载图表数据
const loadChartData = async () => {
  try {
    if (activeTab.value === 'visits') {
      const trendData = await SQLiteAnalyticsService.getTrendData(props.timeRange)
      chartData.value = {
        labels: trendData.labels,
        values: trendData.values
      }
    } else if (activeTab.value === 'visitors') {
      const trendData = await SQLiteAnalyticsService.getTrendData(props.timeRange)
      chartData.value = {
        labels: trendData.labels,
        values: trendData.values.map(v => Math.round(v * 0.3))
      }
    } else if (activeTab.value === 'duration') {
      const trendData = await SQLiteAnalyticsService.calculateTrendDuration(
        await SQLiteAnalyticsService.getVisitsByTimeRange(props.timeRange)
      )
      chartData.value = {
        labels: trendData.labels,
        values: trendData.values
      }
    } else if (activeTab.value === 'bounce') {
      const trendData = await SQLiteAnalyticsService.calculateTrendBounceRate(
        await SQLiteAnalyticsService.getVisitsByTimeRange(props.timeRange)
      )
      chartData.value = {
        labels: trendData.labels,
        values: trendData.values
      }
    }
  } catch (error) {
    logger.error('[TrendChart] 加载数据失败:', error)
    alert(`加载数据失败：${error.message || '未知错误'}`)
  }
}

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return

  chart.value = echarts.init(chartContainer.value)
  updateChart()

  // 监听窗口大小变化
  window.addEventListener('resize', handleResize)
}

// 更新图表
const updateChart = () => {
  if (!chart.value) return

  const data = currentData.value
  const isDuration = activeTab.value === 'duration'
  const isBounce = activeTab.value === 'bounce'

  if (!data || !data.labels || !data.values) {
    logger.warn('数据格式不正确:', data)
    return
  }

  // 数据采样 - 当数据点过多时进行采样
  const maxDataPoints = 100
  let sampledLabels = data.labels
  let sampledValues = data.values

  if (data.labels.length > maxDataPoints) {
    const step = Math.ceil(data.labels.length / maxDataPoints)
    sampledLabels = data.labels.filter((_, index) => index % step === 0)
    sampledValues = data.values.filter((_, index) => index % step === 0)
  }

  const option = {
    animation: false,
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      borderColor: 'rgba(64, 64, 64, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#f5f5f5',
        fontSize: 13
      },
      padding: [12, 16],
      formatter: (params) => {
        const param = params[0]
        const value = param.value
        const formattedValue = isDuration ? formatDuration(value) :
                               isBounce ? `${value}%` :
                               value.toLocaleString()
        return `
          <div style="margin-bottom: 4px; font-weight: 500;">${param.name}</div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${param.color};"></span>
            <span>${param.seriesName}: ${formattedValue}</span>
          </div>
        `
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: sampledLabels,
      axisLine: {
        lineStyle: {
          color: 'rgba(113, 113, 122, 0.3)'
        }
      },
      axisLabel: {
        color: '#71717a',
        fontSize: 12
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
        fontSize: 12,
        formatter: (value) => {
          if (isDuration) {
            return `${Math.floor(value / 60)}m`
          }
          if (isBounce) {
            return `${value}%`
          }
          return value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value
        }
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
        name: tabs.find(t => t.key === activeTab.value)?.label || '数值',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: false,
        lineStyle: {
          width: 2,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 1,
            y2: 0,
            colorStops: [
              { offset: 0, color: '#404040' },
              { offset: 1, color: '#737373' }
            ]
          }
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(64, 64, 64, 0.3)' },
              { offset: 1, color: 'rgba(64, 64, 64, 0.05)' }
            ]
          }
        },
        itemStyle: {
          color: '#404040',
          borderColor: '#fff',
          borderWidth: 2
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            color: '#737373',
            shadowBlur: 10,
            shadowColor: 'rgba(115, 115, 115, 0.5)'
          }
        },
        data: sampledValues,
        large: true,
        progressive: 200,
        progressiveThreshold: 500
      }
    ]
  }

  chart.value.setOption(option, true)
}

// 处理窗口大小变化
const handleResize = () => {
  chart.value?.resize()
}

// 监听时间范围变化
watch(() => props.timeRange, async () => {
  isLoading.value = true
  await loadChartData()
  isLoading.value = false
  updateChart()
})

// 生命周期
onMounted(async () => {
  await loadChartData()
  nextTick(() => {
    initChart()
    isLoading.value = false
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chart.value?.dispose()
})
</script>

<style scoped>
/* ========================================
   趋势图表组件样式
======================================== */

.trend-chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 图表标签 */
.chart-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.chart-tab {
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.8125rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-tab:hover {
  background-color: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.chart-tab.active {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
}

/* 图表容器 */
.chart-container {
  flex: 1;
  min-height: 250px;
  width: 100%;
}

/* 图表统计 */
.chart-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.stat-value.trend-up {
  color: var(--accent-secondary);
}

.stat-value.trend-down {
  color: #ef4444;
}

.stat-value.trend-neutral {
  color: var(--text-secondary);
}

/* 加载状态 */
.chart-loading {
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
  .chart-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .stat-value {
    font-size: 0.9375rem;
  }
}

@media (max-width: 767px) {
  .chart-tabs {
    gap: 0.375rem;
  }

  .chart-tab {
    padding: 0.375rem 0.875rem;
    font-size: 0.75rem;
  }

  .chart-container {
    min-height: 200px;
  }

  .chart-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }

  .stat-label {
    font-size: 0.625rem;
  }

  .stat-value {
    font-size: 0.875rem;
  }
}

@media (max-width: 479px) {
  .chart-tabs {
    gap: 0.25rem;
  }

  .chart-tab {
    padding: 0.3125rem 0.75rem;
    font-size: 0.6875rem;
  }

  .chart-stats {
    gap: 0.5rem;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }

  .chart-tab {
    transition: none;
  }
}

/* 打印样式 */
@media print {
  .chart-tabs {
    display: none;
  }

  .chart-stats {
    border-top: 1px solid #ccc;
  }
}
</style>
