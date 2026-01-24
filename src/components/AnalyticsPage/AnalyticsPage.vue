<template>
  <div v-if="isAuthenticated" class="analytics-page">
    <!-- 错误提示 -->
    <transition name="fade">
      <div v-if="showError" class="error-message">
        <div class="error-content">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 2.502-3.215V8.007c0-1.558-1.962-2.502-3.215L12 3.7c-.975-.567-2-1.714-2-3.215V8.007c0-1.558 1.025-2.502 2-3.215l8-4.215c0 1.558 1.962 2.502 3.215V16.93c0 1.558-1.962 2.502-3.215L12 20.3c-.975.567-2 1.714-2 3.215v-4.215c0 1.558 1.025 2.502 2 3.215z" />
          </svg>
          <span class="error-text">{{ errorMessage }}</span>
        </div>
      </div>
    </transition>

    <!-- 顶部导航栏 -->
    <header class="analytics-header">
      <div class="header-container">
        <div class="header-left">
          <h1 class="header-title">数据实验室</h1>
          <span class="header-subtitle">Analytics Dashboard</span>
        </div>
        <div class="header-right">
          <div class="header-actions">
            <button
              @click="refreshData"
              class="action-button"
              :disabled="isRefreshing"
              title="刷新数据"
            >
              <svg
                class="action-icon"
                :class="{ 'rotating': isRefreshing }"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
            <button
              @click="exportData"
              class="action-button"
              title="导出数据"
            >
              <svg
                class="action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </button>
            <button
              @click="logout"
              class="action-button logout-button"
              title="退出登录"
            >
              <svg
                class="action-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区域 -->
    <main class="analytics-main">
      <div class="main-container">
        <!-- 时间范围选择器 -->
        <div class="time-selector">
          <button
            v-for="range in timeRanges"
            :key="range.value"
            @click="selectTimeRange(range.value)"
            class="time-range-button"
            :class="{ active: selectedTimeRange === range.value }"
          >
            {{ range.label }}
          </button>
        </div>

        <!-- 关键指标卡片 -->
        <div class="metrics-grid">
          <div class="metric-card" v-for="metric in metrics" :key="metric.key">
            <div class="metric-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  :d="metric.icon"
                />
              </svg>
            </div>
            <div class="metric-content">
              <div class="metric-label">{{ metric.label }}</div>
              <div class="metric-value">{{ metric.value }}</div>
              <div class="metric-trend" :class="metric.trendClass">
                <svg class="trend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    :d="metric.trendIcon"
                  />
                </svg>
                <span>{{ metric.trend }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 世界地图和访问趋势 -->
        <div class="dashboard-row">
          <div class="dashboard-card map-card">
            <div class="card-header">
              <h2 class="card-title">全球访问分布</h2>
            </div>
            <div class="card-content">
              <WorldMap />
            </div>
          </div>

          <div class="dashboard-card trend-card">
            <div class="card-header">
              <h2 class="card-title">访问趋势</h2>
            </div>
            <div class="card-content">
              <TrendChart :time-range="selectedTimeRange" />
            </div>
          </div>
        </div>

        <!-- 设备分析和页面排行 -->
        <div class="dashboard-row">
          <div class="dashboard-card device-card">
            <div class="card-header">
              <h2 class="card-title">设备分析</h2>
            </div>
            <div class="card-content">
              <DeviceAnalysis :time-range="selectedTimeRange" />
            </div>
          </div>

          <div class="dashboard-card pages-card">
            <div class="card-header">
              <h2 class="card-title">页面排行</h2>
            </div>
            <div class="card-content">
              <PageRanking :time-range="selectedTimeRange" />
            </div>
          </div>
        </div>

        <!-- 用户行为分析 -->
        <div class="dashboard-row">
          <div class="dashboard-card behavior-card">
            <div class="card-header">
              <h2 class="card-title">用户行为分析</h2>
            </div>
            <div class="card-content">
              <UserBehavior :time-range="selectedTimeRange" />
            </div>
          </div>
        </div>

    
      </div>
    </main>

    <!-- 底部信息 -->
    <footer class="analytics-footer">
      <div class="footer-container">
        <div class="footer-info">
          <span class="footer-text">最后更新: {{ lastUpdateTime }}</span>
          <span class="footer-divider">|</span>
          <span class="footer-text">数据准确性: 99.9%</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import WorldMap from './WorldMap.vue'
import TrendChart from './TrendChart.vue'
import DeviceAnalysis from './DeviceAnalysis.vue'
import PageRanking from './PageRanking.vue'
import UserBehavior from './UserBehavior.vue'
import SQLiteAnalyticsService from '../../services/SQLiteAnalyticsService.js'
import { logger } from '../../utils/logger'

const router = useRouter()

// 检查登录状态
const isAuthenticated = ref(false)

// 主题 - 使用全局主题系统
const theme = computed(() => {
  // 从全局获取当前主题
  return document.documentElement.getAttribute('data-theme') || 'dark'
})

// 时间范围
const timeRanges = [
  { label: '今日', value: 'today' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' },
  { label: '全部', value: 'all' }
]
const selectedTimeRange = ref('today')

// 错误状态
const errorMessage = ref('')
const showError = ref(false)

// 地图视图模式
const mapView = ref('scatter')

// 刷新状态
const isRefreshing = ref(false)

// 最后更新时间
const lastUpdateTime = ref(new Date().toLocaleString('zh-CN'))

// 关键指标数据
const metrics = ref([
  {
    key: 'pv',
    label: '总访问量',
    value: '0',
    trend: '+0%',
    trendClass: 'trend-up',
    trendIcon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
  },
  {
    key: 'uv',
    label: '独立访客',
    value: '0',
    trend: '+0%',
    trendClass: 'trend-up',
    trendIcon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
  },
  {
    key: 'duration',
    label: '平均时长',
    value: '0m 0s',
    trend: '+0%',
    trendClass: 'trend-up',
    trendIcon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    key: 'bounce',
    label: '跳出率',
    value: '0%',
    trend: '-0%',
    trendClass: 'trend-down',
    trendIcon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
  }
])

// 选择时间范围
const selectTimeRange = async (range) => {
  selectedTimeRange.value = range
  await loadMetricsData()
}

// 加载指标数据
const loadMetricsData = async () => {
  try {
    const data = await SQLiteAnalyticsService.getMetrics(selectedTimeRange.value)

    metrics.value[0].value = data.totalVisits.toLocaleString()
    metrics.value[1].value = data.uniqueVisitors.toLocaleString()

    const minutes = Math.floor(data.avgDuration / 60)
    const seconds = data.avgDuration % 60
    metrics.value[2].value = `${minutes}m ${seconds}s`

    metrics.value[3].value = `${data.bounceRate}%`

    // 计算趋势（基于历史数据对比）
    const previousMetrics = await SQLiteAnalyticsService.getPreviousMetrics()
    if (previousMetrics) {
      metrics.value[0].trend = previousMetrics.totalVisits > 0 ? `+${((data.totalVisits - previousMetrics.totalVisits) / previousMetrics.totalVisits * 100).toFixed(1)}%` : '+0%'
      metrics.value[0].trendClass = data.totalVisits >= previousMetrics.totalVisits ? 'trend-up' : 'trend-down'

      metrics.value[1].trend = previousMetrics.uniqueVisitors > 0 ? `+${((data.uniqueVisitors - previousMetrics.uniqueVisitors) / previousMetrics.uniqueVisitors * 100).toFixed(1)}%` : '+0%'
      metrics.value[1].trendClass = data.uniqueVisitors >= previousMetrics.uniqueVisitors ? 'trend-up' : 'trend-down'

      metrics.value[2].trend = previousMetrics.avgDuration > 0 ? `+${((data.avgDuration - previousMetrics.avgDuration) / previousMetrics.avgDuration * 100).toFixed(1)}%` : '+0%'
      metrics.value[2].trendClass = data.avgDuration >= previousMetrics.avgDuration ? 'trend-up' : 'trend-down'

      metrics.value[3].trend = previousMetrics.bounceRate > 0 ? `${((data.bounceRate - previousMetrics.bounceRate) / previousMetrics.bounceRate * 100).toFixed(1)}%` : '+0%'
      metrics.value[3].trendClass = data.bounceRate <= previousMetrics.bounceRate ? 'trend-up' : 'trend-down'
    }
  } catch (error) {
    logger.error('[AnalyticsPage] 加载指标数据失败:', error)
    showError.value = true
    errorMessage.value = `加载指标数据失败：${error.message || '未知错误'}`
    setTimeout(() => {
      showError.value = false
      errorMessage.value = ''
    }, 5000)
  }
}

// 刷新数据
const refreshData = async () => {
  isRefreshing.value = true
  try {
    await SQLiteAnalyticsService.syncToSQLite()
    await loadMetricsData()
    lastUpdateTime.value = new Date().toLocaleString('zh-CN')
  } catch (error) {
    logger.error('[AnalyticsPage] 刷新数据失败:', error)
    showError.value = true
    errorMessage.value = `刷新数据失败：${error.message || '未知错误'}`
    setTimeout(() => {
      showError.value = false
      errorMessage.value = ''
    }, 5000)
  } finally {
    isRefreshing.value = false
  }
}

// 导出数据
const exportData = async () => {
  try {
    const data = await SQLiteAnalyticsService.exportData()
    
    // 创建JSON文件
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    // 创建下载链接
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    alert('数据导出成功！')
  } catch (error) {
    logger.error('[AnalyticsPage] 导出数据失败:', error)
    showError.value = true
    errorMessage.value = `导出数据失败：${error.message || '未知错误'}`
    setTimeout(() => {
      showError.value = false
      errorMessage.value = ''
    }, 5000)
  }
}

// 退出登录
const logout = () => {
  localStorage.removeItem('analytics_token')
  isAuthenticated.value = false
  router.push('/analytics/login')
}

// 处理位置点击
const handleLocationClick = (location) => {
  logger.debug('点击位置:', location)
  // 这里可以实现位置筛选逻辑
}

// 检查登录状态
const checkAuth = () => {
  const token = localStorage.getItem('analytics_token')
  if (!token) {
    router.push('/analytics/login')
  } else {
    isAuthenticated.value = true
  }
}

// 生命周期
onMounted(async () => {
  // 检查登录状态
  checkAuth()
  
  // 初始化数据
  if (isAuthenticated.value) {
    await loadMetricsData()
  }
})
</script>

<style scoped>
/* ========================================
   数据可视化页面主样式
   使用全局主题变量系统
======================================== */

.analytics-page {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 主题类已移除，直接使用全局主题系统
   全局主题通过 [data-theme="dark"] 和 [data-theme="light"] 控制
   所有颜色变量自动继承自全局样式
*/

/* 顶部导航栏 */
.analytics-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--glass-border);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 1.5rem;
  font-weight: 300;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin: 0;
}

.header-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background-color: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover:not(:disabled) {
  background-color: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  transform: translateY(-2px);
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-button.logout-button:hover {
  border-color: var(--error);
  color: var(--error);
}

.action-icon {
  width: 20px;
  height: 20px;
}

.action-icon.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 主内容区域 */
.analytics-main {
  padding: 2rem 0;
}

.main-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* 时间选择器 */
.time-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.time-range-button {
  padding: 0.625rem 1.25rem;
  background-color: transparent;
  border: 1px solid var(--glass-border);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-range-button:hover {
  background-color: var(--bg-secondary);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.time-range-button.active {
  background-color: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--bg-primary);
}

/* 关键指标卡片 */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: var(--accent-primary);
  box-shadow: var(--glass-shadow-hover);
  transform: translateY(-2px);
}

.metric-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: var(--bg-secondary);
  border-radius: 10px;
  color: var(--accent-primary);
  flex-shrink: 0;
}

.metric-icon svg {
  width: 24px;
  height: 24px;
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-label {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.metric-trend.trend-up {
  color: var(--accent-secondary);
}

.metric-trend.trend-down {
  color: var(--error);
}

.trend-icon {
  width: 14px;
  height: 14px;
}

/* 仪表板行 */
.dashboard-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

@media (min-width: 1024px) {
  .dashboard-row {
    grid-template-columns: 1.5fr 1fr;
  }
}

.dashboard-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  border-color: var(--accent-primary);
  box-shadow: var(--glass-shadow-hover);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--glass-border);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.card-content {
  padding: 1.5rem;
  min-height: 300px;
}

/* 特殊卡片 */
.map-card {
  min-height: 500px;
  display: flex;
  flex-direction: column;
}

.map-card .card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  min-height: 400px;
}

.trend-card {
  min-height: 400px;
}

.device-card {
  min-height: 350px;
}

.pages-card {
  min-height: 350px;
}

.behavior-card {
  min-height: 450px;
}

.geo-card {
  min-height: 400px;
}

/* 底部信息 */
.analytics-footer {
  margin-top: 3rem;
  padding: 1.5rem 0;
  border-top: 1px solid var(--glass-border);
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: center;
}

.footer-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.footer-divider {
  color: var(--text-tertiary);
}

/* 响应式设计 */
@media (max-width: 1023px) {
  .header-container {
    padding: 0.75rem 1rem;
  }

  .header-title {
    font-size: 1.25rem;
  }

  .header-subtitle {
    font-size: 0.75rem;
  }

  .main-container {
    padding: 0 1rem;
  }

  .metric-card {
    padding: 1.25rem;
  }

  .metric-value {
    font-size: 1.25rem;
  }

  .card-header {
    padding: 1rem 1.25rem;
  }

  .card-content {
    padding: 1.25rem;
    min-height: 250px;
  }
}

@media (max-width: 767px) {
  .header-container {
    flex-direction: column;
    gap: 0.75rem;
  }

  .header-left {
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    justify-content: flex-end;
  }

  .time-selector {
    gap: 0.375rem;
  }

  .time-range-button {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
  }

  .metric-card {
    padding: 1rem;
  }

  .metric-icon {
    width: 40px;
    height: 40px;
  }

  .metric-icon svg {
    width: 20px;
    height: 20px;
  }

  .metric-value {
    font-size: 1.125rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .card-content {
    padding: 1rem;
    min-height: 200px;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .action-button,
  .metric-card,
  .dashboard-card,
  .time-range-button,
  .map-toggle-button {
    transition: none;
  }

  .action-icon.rotating {
    animation: none;
  }
}

/* 打印样式 */
@media print {
  .analytics-header,
  .time-selector,
  .header-actions,
  .analytics-footer {
    display: none;
  }

  .dashboard-card {
    break-inside: avoid;
    box-shadow: none;
    border: 1px solid #ccc;
  }
}

/* 错误提示 */
.error-message {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  padding: 16px 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--error-color);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.error-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.error-icon {
  width: 24px;
  height: 24px;
  color: var(--error-color);
  flex-shrink: 0;
}

.error-text {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
}

/* 错误提示动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
