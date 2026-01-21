<template>
  <div class="user-behavior-container">
    <!-- 行为分析标签 -->
    <div class="behavior-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        @click="selectTab(tab.key)"
        class="behavior-tab"
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
    <div class="behavior-content">
      <!-- 访问路径分析 -->
      <div v-if="activeTab === 'path'" class="path-analysis">
        <div ref="pathChart" class="chart-container"></div>
      </div>

      <!-- 滚动深度分析 -->
      <div v-else-if="activeTab === 'scroll'" class="scroll-analysis">
        <div ref="scrollChart" class="chart-container"></div>
        <div class="scroll-stats">
          <div class="stat-item">
            <div class="stat-label">平均滚动深度</div>
            <div class="stat-value">{{ avgScrollDepth }}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">完成率</div>
            <div class="stat-value">{{ completionRate }}%</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">中途退出</div>
            <div class="stat-value">{{ dropOffRate }}%</div>
          </div>
        </div>
      </div>

      <!-- 点击热力图 -->
      <div v-else-if="activeTab === 'heatmap'" class="heatmap-analysis">
        <div class="heatmap-visualization">
          <div class="heatmap-page-preview">
            <div class="preview-header">
              <div class="preview-title">页面预览</div>
              <select class="page-selector" v-model="selectedPage">
                <option v-for="page in pages" :key="page.value" :value="page.value">
                  {{ page.label }}
                </option>
              </select>
            </div>
            <div class="preview-content">
              <div class="heatmap-overlay">
                <div
                  v-for="hotspot in hotspots"
                  :key="hotspot.id"
                  class="hotspot"
                  :style="{
                    left: hotspot.x + '%',
                    top: hotspot.y + '%',
                    width: hotspot.size + 'px',
                    height: hotspot.size + 'px',
                    opacity: hotspot.intensity
                  }"
                >
                  <div class="hotspot-tooltip">
                    <div class="tooltip-title">{{ hotspot.title }}</div>
                    <div class="tooltip-value">{{ hotspot.clicks }} 次点击</div>
                  </div>
                </div>
              </div>
              <div class="preview-skeleton">
                <div class="skeleton-header"></div>
                <div class="skeleton-hero"></div>
                <div class="skeleton-content">
                  <div class="skeleton-block"></div>
                  <div class="skeleton-block"></div>
                  <div class="skeleton-block"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="heatmap-legend">
            <div class="legend-title">点击密度</div>
            <div class="legend-gradient"></div>
            <div class="legend-labels">
              <span>低</span>
              <span>高</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 交互事件统计 -->
      <div v-else-if="activeTab === 'events'" class="events-analysis">
        <div class="events-list">
          <div
            v-for="event in eventsData"
            :key="event.type"
            class="event-item"
          >
            <div class="event-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="event.icon"
                />
              </svg>
            </div>
            <div class="event-info">
              <div class="event-name">{{ event.name }}</div>
              <div class="event-description">{{ event.description }}</div>
            </div>
            <div class="event-stats">
              <div class="event-count">{{ event.count.toLocaleString() }}</div>
              <div class="event-trend" :class="event.trendClass">
                {{ event.trend }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <transition name="fade">
      <div v-if="isLoading" class="behavior-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载行为数据...</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
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
const pathChart = ref(null)
const scrollChart = ref(null)
const isLoading = ref(true)
const activeTab = ref('path')
const selectedPage = ref('home')

// 图表实例
let pathChartInstance = null
let scrollChartInstance = null

// 标签页
const tabs = [
  {
    key: 'path',
    label: '访问路径',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6M3 21h6M3 21l-2-2m2 2l2-2M3 10h6m-6 0l2-2m-2 2l-2-2M13 3h8m0 0v8m0-8l-8 8-4-4-6 6M3 17h6m-6 0l2-2m-2 2l-2-2'
  },
  {
    key: 'scroll',
    label: '滚动深度',
    icon: 'M19 14l-7 7m0 0l-7-7m7 7V3'
  },
  {
    key: 'heatmap',
    label: '点击热力图',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
  },
  {
    key: 'events',
    label: '交互事件',
    icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122'
  }
]

// 页面选项
const pages = [
  { label: '首页', value: 'home' },
  { label: '博客', value: 'blog' },
  { label: '图库', value: 'gallery' },
  { label: '研究', value: 'research' }
]

// 热点数据
const hotspots = ref([])
const pathFlowData = ref({ nodes: [], links: [] })

// 滚动统计数据
const avgScrollDepth = ref(0)
const completionRate = ref(0)
const dropOffRate = ref(0)

// 交互事件数据
const eventsData = ref([
  {
    type: 'click',
    name: '点击事件',
    description: '用户点击次数',
    count: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122'
  },
  {
    type: 'scroll',
    name: '滚动事件',
    description: '页面滚动次数',
    count: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    icon: 'M19 14l-7 7m0 0l-7-7m7 7V3'
  },
  {
    type: 'hover',
    name: '悬停事件',
    description: '元素悬停次数',
    count: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
  },
  {
    type: 'form',
    name: '表单提交',
    description: '表单提交次数',
    count: 0,
    trend: '-0%',
    trendClass: 'trend-down',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    type: 'download',
    name: '文件下载',
    description: '文件下载次数',
    count: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
  }
])

// 加载行为数据
const loadBehaviorData = async () => {
  try {
    const behaviorData = await SQLiteAnalyticsService.getBehaviorData(props.timeRange)

    eventsData.value[0].count = behaviorData.clicks
    eventsData.value[1].count = behaviorData.scrolls
    eventsData.value[2].count = behaviorData.hovers
    eventsData.value[3].count = behaviorData.forms
    eventsData.value[4].count = behaviorData.downloads

    // 更新滚动深度数据
    avgScrollDepth.value = behaviorData.avgScrollDepth || 0
    completionRate.value = behaviorData.completionRate || 0
    dropOffRate.value = behaviorData.dropOffRate || 0

    // 加载热点数据
    hotspots.value = await SQLiteAnalyticsService.getHotspots(props.timeRange)
    
    // 加载访问路径数据
    pathFlowData.value = await SQLiteAnalyticsService.getPathFlowData(props.timeRange)

    // 计算趋势（基于历史数据对比）
    const previousBehavior = await SQLiteAnalyticsService.getPreviousBehaviorData()
    eventsData.value.forEach((event, index) => {
      const previousCount = previousBehavior[event.type] || 0
      const currentCount = event.count
      const trend = currentCount - previousCount
      const trendPercent = previousCount > 0 ? ((trend / previousCount) * 100).toFixed(1) : 0

      event.trend = `${trendPercent > 0 ? '+' : ''}${trendPercent}%`
      event.trendClass = trendPercent > 0 ? 'trend-up' : 'trend-down'
    })
  } catch (error) {
    logger.error('[UserBehavior] 加载数据失败:', error)
    alert(`加载数据失败：${error.message || '未知错误'}`)
  }
}

// 选择标签
const selectTab = (key) => {
  activeTab.value = key
  // 延迟初始化图表以确保DOM已更新
  setTimeout(() => {
    if (key === 'path') {
      initPathChart()
    } else if (key === 'scroll') {
      initScrollChart()
    }
  }, 100)
}

// 初始化访问路径图表
const initPathChart = () => {
  if (!pathChart.value) return

  if (pathChartInstance) {
    pathChartInstance.dispose()
  }

  pathChartInstance = echarts.init(pathChart.value)

  // 数据采样 - 当节点过多时进行采样
  const maxNodes = 20
  let sampledNodes = pathFlowData.value.nodes
  let sampledLinks = pathFlowData.value.links

  if (pathFlowData.value.nodes.length > maxNodes) {
    // 按连接数排序，保留前maxNodes个节点
    const nodeConnections = new Map()
    pathFlowData.value.links.forEach(link => {
      nodeConnections.set(link.source, (nodeConnections.get(link.source) || 0) + 1)
      nodeConnections.set(link.target, (nodeConnections.get(link.target) || 0) + 1)
    })

    const topNodes = Array.from(nodeConnections.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxNodes)
      .map(entry => entry[0])

    const nodeSet = new Set(topNodes)
    sampledNodes = pathFlowData.value.nodes.filter(node => nodeSet.has(node.name))
    sampledLinks = pathFlowData.value.links.filter(link => 
      nodeSet.has(link.source) && nodeSet.has(link.target)
    )
  }

  const option = {
    animation: false,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 10, 10, 0.9)',
      borderColor: 'rgba(64, 64, 64, 0.3)',
      borderWidth: 1,
      textStyle: {
        color: '#f5f5f5',
        fontSize: 13
      },
      formatter: '{b}: {c}'
    },
    series: [
      {
        type: 'sankey',
        layout: 'none',
        emphasis: {
          focus: 'adjacency'
        },
        data: sampledNodes,
        links: sampledLinks,
        lineStyle: {
          color: 'gradient',
          curveness: 0.5
        },
        itemStyle: {
          color: '#404040',
          borderColor: '#141414'
        },
        label: {
          color: '#f5f5f5',
          fontSize: 12
        }
      }
    ]
  }

  pathChartInstance.setOption(option)
}

// 初始化滚动深度图表
const initScrollChart = () => {
  if (!scrollChart.value) return

  if (scrollChartInstance) {
    scrollChartInstance.dispose()
  }

  scrollChartInstance = echarts.init(scrollChart.value)

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
      formatter: (params) => {
        const param = params[0]
        return `
          <div style="margin-bottom: 4px; font-weight: 500;">${param.name}</div>
          <div>用户占比: ${param.value}%</div>
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
      data: ['0-25%', '25-50%', '50-75%', '75-100%'],
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
      max: 100,
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#71717a',
        fontSize: 12,
        formatter: '{value}%'
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
        data: [15, 25, 35, 25],
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
    ]
  }

  scrollChartInstance.setOption(option)
}

// 处理窗口大小变化
const handleResize = () => {
  pathChartInstance?.resize()
  scrollChartInstance?.resize()
}

// 监听时间范围变化
watch(() => props.timeRange, async () => {
  isLoading.value = true
  await loadBehaviorData()
  isLoading.value = false
})

// 生命周期
onMounted(async () => {
  await loadBehaviorData()
  setTimeout(() => {
    initPathChart()
    isLoading.value = false
  }, 100)

  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  pathChartInstance?.dispose()
  scrollChartInstance?.dispose()
})
</script>

<style scoped>
/* ========================================
   用户行为分析组件样式
======================================== */

.user-behavior-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标签页 */
.behavior-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.behavior-tab {
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

.behavior-tab:hover {
  background-color: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.behavior-tab.active {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
}

.tab-icon {
  width: 18px;
  height: 18px;
}

/* 内容区域 */
.behavior-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 访问路径分析 */
.path-analysis {
  flex: 1;
}

.chart-container {
  width: 100%;
  height: 100%;
  min-height: 350px;
}

/* 滚动深度分析 */
.scroll-analysis {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.scroll-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--accent-primary);
}

/* 点击热力图 */
.heatmap-visualization {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.heatmap-page-preview {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.preview-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.page-selector {
  padding: 0.375rem 0.75rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 0.8125rem;
  cursor: pointer;
  outline: none;
}

.page-selector:focus {
  border-color: var(--accent-primary);
}

.preview-content {
  position: relative;
  padding: 2rem;
  min-height: 400px;
}

.heatmap-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.hotspot {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(64, 64, 64, 0.8), rgba(64, 64, 64, 0));
  transform: translate(-50%, -50%);
  cursor: pointer;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.hotspot:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.hotspot-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.hotspot:hover .hotspot-tooltip {
  opacity: 1;
  visibility: visible;
}

.tooltip-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.tooltip-value {
  font-size: 0.6875rem;
  color: var(--text-secondary);
}

.preview-skeleton {
  background-color: var(--bg-primary);
  border-radius: 6px;
  padding: 1.5rem;
}

.skeleton-header {
  height: 40px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.skeleton-hero {
  height: 200px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s infinite;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-block {
  height: 20px;
  background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-secondary) 50%, var(--bg-tertiary) 75%);
  background-size: 200% 100%;
  animation: skeleton 1.5s infinite;
  border-radius: 4px;
}

.skeleton-block:nth-child(2) {
  width: 80%;
}

.skeleton-block:nth-child(3) {
  width: 60%;
}

@keyframes skeleton {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.heatmap-legend {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem 1rem;
  background-color: var(--bg-secondary);
  border-radius: 6px;
}

.legend-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.legend-gradient {
  width: 120px;
  height: 12px;
  background: linear-gradient(to right,
    rgba(64, 64, 64, 0.2),
    rgba(64, 64, 64, 0.5),
    rgba(64, 64, 64, 0.8),
    rgba(64, 64, 64, 1)
  );
  border-radius: 6px;
}

.legend-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.6875rem;
  color: var(--text-tertiary);
}

/* 交互事件统计 */
.events-analysis {
  flex: 1;
}

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.event-item:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--accent-primary);
  transform: translateX(4px);
}

.event-icon {
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

.event-icon svg {
  width: 20px;
  height: 20px;
}

.event-info {
  flex: 1;
  min-width: 0;
}

.event-name {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.event-description {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.event-stats {
  text-align: right;
}

.event-count {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.event-trend {
  font-size: 0.8125rem;
  font-weight: 500;
}

.event-trend.trend-up {
  color: var(--accent-secondary);
}

.event-trend.trend-down {
  color: #ef4444;
}

/* 加载状态 */
.behavior-loading {
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
  .scroll-stats {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .event-item {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .event-stats {
    width: 100%;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
}

@media (max-width: 767px) {
  .behavior-tabs {
    gap: 0.375rem;
  }

  .behavior-tab {
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
  }

  .tab-icon {
    width: 16px;
    height: 16px;
  }

  .scroll-stats {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .stat-value {
    font-size: 1.125rem;
  }

  .preview-content {
    min-height: 300px;
    padding: 1rem;
  }

  .event-item {
    padding: 0.875rem;
  }

  .event-icon {
    width: 36px;
    height: 36px;
  }

  .event-icon svg {
    width: 18px;
    height: 18px;
  }
}

@media (max-width: 479px) {
  .behavior-tabs {
    gap: 0.25rem;
  }

  .behavior-tab {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }

  .behavior-tab span {
    display: none;
  }

  .behavior-tab.active span {
    display: inline;
  }

  .preview-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .page-selector {
    width: 100%;
  }

  .event-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .event-stats {
    width: 100%;
    justify-content: space-between;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .behavior-tab,
  .event-item,
  .hotspot,
  .skeleton-block {
    transition: none;
    animation: none;
  }

  .loading-spinner {
    animation: none;
  }
}

/* 打印样式 */
@media print {
  .behavior-tabs {
    display: none;
  }

  .heatmap-page-preview {
    border: 1px solid #ccc;
  }

  .event-item {
    break-inside: avoid;
    border: 1px solid #ccc;
  }
}
</style>
