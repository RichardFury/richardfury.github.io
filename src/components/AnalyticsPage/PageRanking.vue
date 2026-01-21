<template>
  <div class="page-ranking-container">
    <!-- 页面排行列表 -->
    <div class="ranking-list">
      <div
        v-for="(page, index) in pageRanking"
        :key="page.path"
        class="ranking-item"
        :class="{ 'top-three': index < 3 }"
      >
        <div class="rank-badge" :class="`rank-${index + 1}`">
          {{ index + 1 }}
        </div>
        <div class="page-info">
          <div class="page-path">{{ page.path }}</div>
          <div class="page-title">{{ page.title }}</div>
        </div>
        <div class="page-stats">
          <div class="stat-group">
            <div class="stat-label">访问量</div>
            <div class="stat-value">{{ page.visits.toLocaleString() }}</div>
          </div>
          <div class="stat-group">
            <div class="stat-label">停留时长</div>
            <div class="stat-value">{{ formatDuration(page.avgDuration) }}</div>
          </div>
          <div class="stat-group">
            <div class="stat-label">跳出率</div>
            <div class="stat-value">{{ page.bounceRate }}%</div>
          </div>
        </div>
        <div class="trend-indicator" :class="page.trendClass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              :d="page.trendIcon"
            />
          </svg>
          <span>{{ page.trend }}</span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <transition name="fade">
      <div v-if="isLoading" class="ranking-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载页面数据...</div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
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
const isLoading = ref(true)

// 页面排行数据
const pageRanking = ref([
  {
    path: '/',
    title: '首页',
    visits: 0,
    avgDuration: 0,
    bounceRate: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    trendIcon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    path: '/blog',
    title: '博客',
    visits: 0,
    avgDuration: 0,
    bounceRate: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    trendIcon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    path: '/gallery',
    title: '图库',
    visits: 0,
    avgDuration: 0,
    bounceRate: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    trendIcon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    path: '/research',
    title: '研究',
    visits: 0,
    avgDuration: 0,
    bounceRate: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    trendIcon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    path: '/contact',
    title: '联系',
    visits: 0,
    avgDuration: 0,
    bounceRate: 0,
    trend: '-0%',
    trendClass: 'trend-down',
    trendIcon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
  },
  {
    path: '/cv',
    title: '简历',
    visits: 0,
    avgDuration: 0,
    bounceRate: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    trendIcon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  },
  {
    path: '/about',
    title: '关于',
    visits: 0,
    avgDuration: 0,
    bounceRate: 0,
    trend: '-0%',
    trendClass: 'trend-down',
    trendIcon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
  },
  {
    path: '/projects',
    title: '项目',
    visits: 0,
    avgDuration: 0,
    bounceRate: 0,
    trend: '+0%',
    trendClass: 'trend-up',
    trendIcon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
  }
])

// 加载页面排名数据
const loadPageRanking = async () => {
  try {
    const ranking = await SQLiteAnalyticsService.getPageRanking(props.timeRange)

    // 更新页面排名数据
    ranking.forEach((item, index) => {
      if (index < pageRanking.value.length) {
        pageRanking.value[index].visits = item.visits
        pageRanking.value[index].avgDuration = item.avgDuration
        pageRanking.value[index].bounceRate = item.bounceRate
      }
    })

    // 计算趋势（基于历史数据对比）
    const previousRanking = await SQLiteAnalyticsService.getPreviousPageRanking()
    ranking.forEach((item, index) => {
      const previousItem = previousRanking.find(p => p.path === item.path)
      const previousVisits = previousItem ? previousItem.visits : 0
      const currentVisits = item.visits
      const trend = currentVisits - previousVisits
      const trendPercent = previousVisits > 0 ? ((trend / previousVisits) * 100).toFixed(1) : 0

      pageRanking.value[index].trend = `${trendPercent > 0 ? '+' : ''}${trendPercent}%`
      pageRanking.value[index].trendClass = trendPercent > 0 ? 'trend-up' : 'trend-down'
    })
  } catch (error) {
    logger.error('[PageRanking] 加载数据失败:', error)
    alert(`加载数据失败：${error.message || '未知错误'}`)
  }
}

// 格式化时长
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes}m ${secs}s`
}

// 监听时间范围变化
watch(() => props.timeRange, async () => {
  isLoading.value = true
  await loadPageRanking()
  isLoading.value = false
})

// 生命周期
onMounted(async () => {
  await loadPageRanking()
  isLoading.value = false
})
</script>

<style scoped>
/* ========================================
   页面排行组件样式
======================================== */

.page-ranking-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 排行列表 */
.ranking-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  max-height: 400px;
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

/* 页面信息 */
.page-info {
  flex: 1;
  min-width: 0;
}

.page-path {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--accent-primary);
  margin-bottom: 0.125rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.page-title {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 页面统计 */
.page-stats {
  display: flex;
  gap: 1rem;
}

.stat-group {
  text-align: center;
}

.stat-label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--text-tertiary);
  margin-bottom: 0.125rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* 趋势指示器 */
.trend-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.625rem;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  flex-shrink: 0;
}

.trend-indicator.trend-up {
  background-color: rgba(52, 211, 153, 0.1);
  color: var(--accent-secondary);
}

.trend-indicator.trend-down {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.trend-indicator svg {
  width: 14px;
  height: 14px;
}

/* 加载状态 */
.ranking-loading {
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
  .ranking-item {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding: 0.625rem 0.875rem;
  }

  .page-stats {
    gap: 0.75rem;
  }

  .stat-label {
    font-size: 0.625rem;
  }

  .stat-value {
    font-size: 0.8125rem;
  }
}

@media (max-width: 767px) {
  .ranking-item {
    padding: 0.5rem 0.75rem;
  }

  .rank-badge {
    width: 28px;
    height: 28px;
    font-size: 0.8125rem;
  }

  .page-path {
    font-size: 0.75rem;
  }

  .page-title {
    font-size: 0.8125rem;
  }

  .page-stats {
    gap: 0.5rem;
  }

  .stat-label {
    font-size: 0.625rem;
  }

  .stat-value {
    font-size: 0.75rem;
  }

  .trend-indicator {
    padding: 0.3125rem 0.5rem;
    font-size: 0.75rem;
  }

  .trend-indicator svg {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 479px) {
  .ranking-item {
    flex-direction: column;
    align-items: stretch;
  }

  .page-info {
    margin-bottom: 0.5rem;
  }

  .page-stats {
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .trend-indicator {
    align-self: flex-start;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .ranking-item {
    transition: none;
  }

  .loading-spinner {
    animation: none;
  }
}

/* 打印样式 */
@media print {
  .ranking-list {
    overflow: visible;
    max-height: none;
  }

  .ranking-item {
    break-inside: avoid;
    border: 1px solid #ccc;
  }
}
</style>
