/**
 * Analytics Performance Tests
 * 性能测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import SQLiteAnalyticsService from '../SQLiteAnalyticsService.js'

describe('Analytics Performance Tests', () => {
  beforeEach(async () => {
    await SQLiteAnalyticsService.init()
  })

  afterEach(async () => {
    await SQLiteAnalyticsService.clearData()
  })

  describe('写入性能', () => {
    it('应该能够在合理时间内写入100条访问记录', async () => {
      const startTime = Date.now()

      for (let i = 0; i < 100; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i}`,
          title: `页面 ${i}`,
          duration: Math.random() * 60000
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const endTime = Date.now()
      const duration = endTime - startTime

      // 应该在2秒内完成
      expect(duration).toBeLessThan(2000)
    })

    it('应该能够在合理时间内写入1000条事件记录', async () => {
      const startTime = Date.now()

      for (let i = 0; i < 1000; i++) {
        await SQLiteAnalyticsService.addEvent({
          type: ['click', 'scroll', 'hover'][Math.floor(Math.random() * 3)],
          element: `element-${i}`,
          pagePath: '/',
          scrollPercent: Math.floor(Math.random() * 100)
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const endTime = Date.now()
      const duration = endTime - startTime

      // 应该在5秒内完成
      expect(duration).toBeLessThan(5000)
    })

    it('应该能够处理批量写入', async () => {
      const batchSize = 100
      const startTime = Date.now()

      for (let i = 0; i < batchSize; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i}`,
          title: `页面 ${i}`,
          duration: Math.random() * 60000
        })
      }

      // 批量同步
      await SQLiteAnalyticsService.syncToSQLite()

      const endTime = Date.now()
      const duration = endTime - startTime

      // 批量写入应该更快
      expect(duration).toBeLessThan(1000)
    })
  })

  describe('读取性能', () => {
    it('应该能够在合理时间内读取1000条访问记录', async () => {
      // 先写入数据
      for (let i = 0; i < 1000; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i}`,
          title: `页面 ${i}`,
          duration: Math.random() * 60000
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      // 测试读取性能
      const startTime = Date.now()
      const visits = await SQLiteAnalyticsService.getVisits()
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(visits.length).toBe(1000)
      expect(duration).toBeLessThan(1000) // 应该在1秒内完成
    })

    it('应该能够在合理时间内读取1000条事件记录', async () => {
      // 先写入数据
      for (let i = 0; i < 1000; i++) {
        await SQLiteAnalyticsService.addEvent({
          type: 'click',
          element: `element-${i}`,
          pagePath: '/'
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      // 测试读取性能
      const startTime = Date.now()
      const events = await SQLiteAnalyticsService.getEvents()
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(events.length).toBe(1000)
      expect(duration).toBeLessThan(1000)
    })

    it('应该能够在合理时间内根据时间范围查询', async () => {
      const now = Date.now()
      const day = 24 * 60 * 60 * 1000

      // 写入不同时间的数据
      for (let i = 0; i < 1000; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i}`,
          title: `页面 ${i}`,
          duration: Math.random() * 60000
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      // 测试时间范围查询性能
      const startTime = Date.now()
      const visits = await SQLiteAnalyticsService.getVisitsByTimeRange(
        now - 7 * day,
        now
      )
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(duration).toBeLessThan(500) // 应该在500ms内完成
    })
  })

  describe('统计计算性能', () => {
    it('应该能够在合理时间内计算跳出率', async () => {
      // 写入数据
      for (let i = 0; i < 1000; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i % 10}`,
          title: `页面 ${i % 10}`,
          duration: Math.random() * 60000
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const visits = await SQLiteAnalyticsService.getVisits()

      // 测试计算性能
      const startTime = Date.now()
      const bounceRate = SQLiteAnalyticsService.calculateBounceRate(visits)
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(typeof bounceRate).toBe('number')
      expect(duration).toBeLessThan(500)
    })

    it('应该能够在合理时间内计算页面排名', async () => {
      // 写入数据
      for (let i = 0; i < 1000; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i % 20}`,
          title: `页面 ${i % 20}`,
          duration: Math.random() * 60000
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const visits = await SQLiteAnalyticsService.getVisits()

      // 测试计算性能
      const startTime = Date.now()
      const ranking = SQLiteAnalyticsService.calculatePageRanking(visits)
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(ranking.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(1000)
    })

    it('应该能够在合理时间内计算设备统计', async () => {
      // 写入数据
      const deviceTypes = ['desktop', 'mobile', 'tablet']
      const osTypes = ['Windows', 'macOS', 'iOS', 'Android']
      const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge']

      for (let i = 0; i < 1000; i++) {
        await SQLiteAnalyticsService.addDevice({
          deviceType: deviceTypes[i % 3],
          os: osTypes[i % 4],
          browser: browsers[i % 4],
          screenWidth: 1920,
          screenHeight: 1080
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const devices = await SQLiteAnalyticsService.getDevices()

      // 测试计算性能
      const startTime = Date.now()
      const stats = SQLiteAnalyticsService.calculateDeviceStats(devices)
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(stats.deviceTypes.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(500)
    })

    it('应该能够在合理时间内计算地理统计', async () => {
      // 写入数据
      const countries = ['中国', '美国', '英国', '日本', '德国']
      const cities = ['北京', '上海', 'New York', 'London', 'Tokyo', 'Berlin']

      for (let i = 0; i < 1000; i++) {
        await SQLiteAnalyticsService.addGeo({
          country: countries[i % 5],
          city: cities[i % 6],
          language: ['zh', 'en', 'ja', 'de'][i % 4]
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const geos = await SQLiteAnalyticsService.getGeos()

      // 测试计算性能
      const startTime = Date.now()
      const stats = SQLiteAnalyticsService.calculateGeoStats(geos)
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(stats.countries.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(1000)
    })

    it('应该能够在合理时间内计算趋势数据', async () => {
      // 写入30天的数据
      const now = Date.now()
      const day = 24 * 60 * 60 * 1000

      for (let i = 0; i < 30; i++) {
        const dayVisits = Math.floor(Math.random() * 100) + 10
        for (let j = 0; j < dayVisits; j++) {
          await SQLiteAnalyticsService.addVisit({
            path: '/',
            title: '首页',
            duration: Math.random() * 60000
          })
        }
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const visits = await SQLiteAnalyticsService.getVisits()

      // 测试计算性能
      const startTime = Date.now()
      const trendData = SQLiteAnalyticsService.calculateTrendData(visits)
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(trendData.labels.length).toBe(30)
      expect(trendData.values.length).toBe(30)
      expect(duration).toBeLessThan(1000)
    })
  })

  describe('摘要生成性能', () => {
    it('应该能够在合理时间内生成摘要', async () => {
      // 写入大量数据
      for (let i = 0; i < 1000; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i % 20}`,
          title: `页面 ${i % 20}`,
          duration: Math.random() * 60000
        })

        await SQLiteAnalyticsService.addEvent({
          type: ['click', 'scroll', 'hover'][i % 3],
          element: `element-${i}`,
          pagePath: '/'
        })

        await SQLiteAnalyticsService.addDevice({
          deviceType: ['desktop', 'mobile'][i % 2],
          os: ['Windows', 'macOS'][i % 2],
          browser: 'Chrome'
        })

        await SQLiteAnalyticsService.addGeo({
          country: ['中国', '美国'][i % 2],
          city: ['北京', 'New York'][i % 2],
          language: ['zh', 'en'][i % 2]
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      // 测试摘要生成性能
      const startTime = Date.now()
      const summary = await SQLiteAnalyticsService.getSummary()
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(summary.total).toBeDefined()
      expect(duration).toBeLessThan(2000) // 应该在2秒内完成
    })
  })

  describe('同步性能', () => {
    it('应该能够在合理时间内同步数据', async () => {
      // 写入数据但不同步
      for (let i = 0; i < 100; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i}`,
          title: `页面 ${i}`,
          duration: Math.random() * 60000
        })
      }

      // 测试同步性能
      const startTime = Date.now()
      await SQLiteAnalyticsService.syncToSQLite()
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(duration).toBeLessThan(1000)
    })

    it('应该能够在合理时间内保存数据库', async () => {
      // 写入数据
      for (let i = 0; i < 100; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i}`,
          title: `页面 ${i}`,
          duration: Math.random() * 60000
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      // 测试数据库保存性能
      const startTime = Date.now()
      await SQLiteAnalyticsService.saveDatabase()
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(duration).toBeLessThan(2000)
    })
  })

  describe('内存使用', () => {
    it('应该能够处理大量数据而不导致内存溢出', async () => {
      // 写入大量数据
      const largeCount = 10000

      for (let i = 0; i < largeCount; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: `/page-${i}`,
          title: `页面 ${i}`,
          duration: Math.random() * 60000
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      // 读取所有数据
      const visits = await SQLiteAnalyticsService.getVisits()

      expect(visits.length).toBe(largeCount)
    })
  })

  describe('并发性能', () => {
    it('应该能够处理并发写入', async () => {
      const concurrentWrites = 100
      const promises = []

      for (let i = 0; i < concurrentWrites; i++) {
        promises.push(
          SQLiteAnalyticsService.addVisit({
            path: `/page-${i}`,
            title: `页面 ${i}`,
            duration: Math.random() * 60000
          })
        )
      }

      const startTime = Date.now()
      await Promise.all(promises)
      await SQLiteAnalyticsService.syncToSQLite()
      const endTime = Date.now()

      const duration = endTime - startTime

      expect(duration).toBeLessThan(3000)
    })
  })
})
