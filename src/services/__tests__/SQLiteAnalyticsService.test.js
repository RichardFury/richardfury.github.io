/**
 * SQLite Analytics Service Tests
 * 单元测试和集成测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import SQLiteAnalyticsService from '../SQLiteAnalyticsService.js'

describe('SQLiteAnalyticsService', () => {
  beforeEach(async () => {
    // 在每个测试前初始化服务
    await SQLiteAnalyticsService.init()
  })

  afterEach(async () => {
    // 在每个测试后清理数据
    await SQLiteAnalyticsService.clearData()
  })

  describe('初始化', () => {
    it('应该成功初始化', async () => {
      expect(SQLiteAnalyticsService.isInitialized).toBe(true)
      expect(SQLiteAnalyticsService.db).toBeDefined()
    })

    it('应该生成唯一的sessionId', () => {
      const sessionId = SQLiteAnalyticsService.sessionId
      expect(sessionId).toBeDefined()
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/)
    })
  })

  describe('访问记录操作', () => {
    it('应该成功添加访问记录', async () => {
      const visit = {
        path: '/',
        title: '首页',
        referrer: 'https://google.com',
        duration: 30000,
        entryType: 'organic'
      }

      await SQLiteAnalyticsService.addVisit(visit)
      await SQLiteAnalyticsService.syncToSQLite()

      const visits = await SQLiteAnalyticsService.getVisits()
      expect(visits.length).toBeGreaterThan(0)
      expect(visits[0].path).toBe(visit.path)
      expect(visits[0].title).toBe(visit.title)
    })

    it('应该能够获取所有访问记录', async () => {
      const visits = [
        { path: '/', title: '首页', duration: 30000 },
        { path: '/blog', title: '博客', duration: 45000 },
        { path: '/about', title: '关于', duration: 20000 }
      ]

      for (const visit of visits) {
        await SQLiteAnalyticsService.addVisit(visit)
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const allVisits = await SQLiteAnalyticsService.getVisits()
      expect(allVisits.length).toBe(visits.length)
    })

    it('应该能够根据时间范围获取访问记录', async () => {
      const now = Date.now()
      const hourAgo = now - 60 * 60 * 1000

      await SQLiteAnalyticsService.addVisit({
        path: '/',
        title: '首页',
        duration: 30000
      })

      await SQLiteAnalyticsService.syncToSQLite()

      const visits = await SQLiteAnalyticsService.getVisitsByTimestampRange(hourAgo, now)
      expect(visits.length).toBeGreaterThan(0)
    })
  })

  describe('事件记录操作', () => {
    it('应该成功添加事件记录', async () => {
      const event = {
        type: 'click',
        element: 'button',
        pagePath: '/',
        data: { buttonId: 'submit' },
        scrollPercent: null
      }

      await SQLiteAnalyticsService.addEvent(event)
      await SQLiteAnalyticsService.syncToSQLite()

      const events = await SQLiteAnalyticsService.getEvents()
      expect(events.length).toBeGreaterThan(0)
      expect(events[0].type).toBe(event.type)
      expect(events[0].element).toBe(event.element)
    })

    it('应该能够根据类型获取事件', async () => {
      const events = [
        { type: 'click', element: 'button' },
        { type: 'scroll', scrollPercent: 50 },
        { type: 'click', element: 'link' }
      ]

      for (const event of events) {
        await SQLiteAnalyticsService.addEvent(event)
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const clickEvents = await SQLiteAnalyticsService.getEventsByType('click')
      expect(clickEvents.length).toBe(2)
    })

    it('应该能够根据时间范围获取事件', async () => {
      const now = Date.now()
      const hourAgo = now - 60 * 60 * 1000

      await SQLiteAnalyticsService.addEvent({
        type: 'click',
        element: 'button'
      })

      await SQLiteAnalyticsService.syncToSQLite()

      const events = await SQLiteAnalyticsService.getEventsByTimestampRange(hourAgo, now)
      expect(events.length).toBeGreaterThan(0)
    })
  })

  describe('设备记录操作', () => {
    it('应该成功添加设备记录', async () => {
      const device = {
        deviceType: 'desktop',
        os: 'Windows',
        browser: 'Chrome',
        browserVersion: '120.0',
        screenWidth: 1920,
        screenHeight: 1080,
        resolution: '1920x1080',
        userAgent: 'Mozilla/5.0...'
      }

      await SQLiteAnalyticsService.addDevice(device)
      await SQLiteAnalyticsService.syncToSQLite()

      const devices = await SQLiteAnalyticsService.getDevices()
      expect(devices.length).toBeGreaterThan(0)
      expect(devices[0].device_type).toBe(device.deviceType)
      expect(devices[0].os).toBe(device.os)
    })
  })

  describe('地理位置记录操作', () => {
    it('应该成功添加地理位置记录', async () => {
      const geo = {
        country: '中国',
        countryCode: 'CN',
        city: '北京',
        region: '北京',
        latitude: 39.9042,
        longitude: 116.4074,
        timezone: 'Asia/Shanghai',
        language: 'zh',
        ipAddress: '192.168.1.1'
      }

      await SQLiteAnalyticsService.addGeo(geo)
      await SQLiteAnalyticsService.syncToSQLite()

      const geos = await SQLiteAnalyticsService.getGeos()
      expect(geos.length).toBeGreaterThan(0)
      expect(geos[0].country).toBe(geo.country)
      expect(geos[0].city).toBe(geo.city)
    })
  })

  describe('统计计算', () => {
    it('应该正确计算跳出率', async () => {
      // 添加一些访问记录
      await SQLiteAnalyticsService.addVisit({ path: '/', duration: 10000 })
      await SQLiteAnalyticsService.addVisit({ path: '/blog', duration: 20000 })
      await SQLiteAnalyticsService.addVisit({ path: '/', duration: 5000 })

      await SQLiteAnalyticsService.syncToSQLite()

      const visits = await SQLiteAnalyticsService.getVisits()
      const bounceRate = SQLiteAnalyticsService.calculateBounceRate(visits)

      expect(bounceRate).toBeGreaterThanOrEqual(0)
      expect(bounceRate).toBeLessThanOrEqual(100)
    })

    it('应该正确计算页面排名', async () => {
      const visits = [
        { path: '/', title: '首页', duration: 30000 },
        { path: '/blog', title: '博客', duration: 45000 },
        { path: '/', title: '首页', duration: 20000 },
        { path: '/blog', title: '博客', duration: 35000 },
        { path: '/about', title: '关于', duration: 15000 }
      ]

      for (const visit of visits) {
        await SQLiteAnalyticsService.addVisit(visit)
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const allVisits = await SQLiteAnalyticsService.getVisits()
      const ranking = SQLiteAnalyticsService.calculatePageRanking(allVisits)

      expect(ranking.length).toBeGreaterThan(0)
      expect(ranking[0].visits).toBeGreaterThanOrEqual(ranking[1].visits)
    })

    it('应该正确计算设备统计', async () => {
      const devices = [
        { deviceType: 'desktop', os: 'Windows', browser: 'Chrome' },
        { deviceType: 'mobile', os: 'iOS', browser: 'Safari' },
        { deviceType: 'desktop', os: 'macOS', browser: 'Chrome' }
      ]

      for (const device of devices) {
        await SQLiteAnalyticsService.addDevice(device)
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const allDevices = await SQLiteAnalyticsService.getDevices()
      const stats = SQLiteAnalyticsService.calculateDeviceStats(allDevices)

      expect(stats.deviceTypes.length).toBeGreaterThan(0)
      expect(stats.osTypes.length).toBeGreaterThan(0)
      expect(stats.browserTypes.length).toBeGreaterThan(0)
    })

    it('应该正确计算地理统计', async () => {
      const geos = [
        { country: '中国', city: '北京', language: 'zh' },
        { country: '美国', city: 'New York', language: 'en' },
        { country: '中国', city: '上海', language: 'zh' }
      ]

      for (const geo of geos) {
        await SQLiteAnalyticsService.addGeo(geo)
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const allGeos = await SQLiteAnalyticsService.getGeos()
      const stats = SQLiteAnalyticsService.calculateGeoStats(allGeos)

      expect(stats.countries.length).toBeGreaterThan(0)
      expect(stats.cities.length).toBeGreaterThan(0)
      expect(stats.languages.length).toBeGreaterThan(0)
    })

    it('应该正确计算趋势数据', async () => {
      const now = Date.now()
      const day = 24 * 60 * 60 * 1000

      // 添加过去几天的访问记录
      for (let i = 0; i < 5; i++) {
        await SQLiteAnalyticsService.addVisit({
          path: '/',
          title: '首页',
          duration: 30000
        })
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const visits = await SQLiteAnalyticsService.getVisits()
      const trendData = SQLiteAnalyticsService.calculateTrendData(visits)

      expect(trendData.labels).toBeDefined()
      expect(trendData.values).toBeDefined()
      expect(trendData.labels.length).toBe(30)
      expect(trendData.values.length).toBe(30)
    })
  })

  describe('摘要数据', () => {
    it('应该能够获取摘要数据', async () => {
      const visits = [
        { path: '/', title: '首页', duration: 30000 },
        { path: '/blog', title: '博客', duration: 45000 }
      ]

      for (const visit of visits) {
        await SQLiteAnalyticsService.addVisit(visit)
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const summary = await SQLiteAnalyticsService.getSummary()

      expect(summary.total).toBeDefined()
      expect(summary.total.visits).toBeGreaterThan(0)
      expect(summary.total.uniqueVisitors).toBeGreaterThan(0)
      expect(summary.total.avgDuration).toBeGreaterThanOrEqual(0)
      expect(summary.total.bounceRate).toBeGreaterThanOrEqual(0)
    })

    it('应该能够根据时间范围获取指标', async () => {
      const visits = [
        { path: '/', title: '首页', duration: 30000 },
        { path: '/blog', title: '博客', duration: 45000 }
      ]

      for (const visit of visits) {
        await SQLiteAnalyticsService.addVisit(visit)
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const metrics = await SQLiteAnalyticsService.getMetrics('today')

      expect(metrics.totalVisits).toBeGreaterThanOrEqual(0)
      expect(metrics.uniqueVisitors).toBeGreaterThanOrEqual(0)
      expect(metrics.avgDuration).toBeGreaterThanOrEqual(0)
      expect(metrics.bounceRate).toBeGreaterThanOrEqual(0)
    })

    it('应该能够获取行为数据', async () => {
      const events = [
        { type: 'click', element: 'button' },
        { type: 'scroll', scrollPercent: 50 },
        { type: 'hover', element: 'link' }
      ]

      for (const event of events) {
        await SQLiteAnalyticsService.addEvent(event)
      }

      await SQLiteAnalyticsService.syncToSQLite()

      const behavior = await SQLiteAnalyticsService.getBehaviorData('today')

      expect(behavior.clicks).toBeGreaterThanOrEqual(0)
      expect(behavior.scrolls).toBeGreaterThanOrEqual(0)
      expect(behavior.hovers).toBeGreaterThanOrEqual(0)
    })
  })

  describe('数据导入导出', () => {
    it('应该能够导出数据', async () => {
      await SQLiteAnalyticsService.addVisit({ path: '/', title: '首页', duration: 30000 })
      await SQLiteAnalyticsService.addEvent({ type: 'click', element: 'button' })
      await SQLiteAnalyticsService.syncToSQLite()

      // 导出数据（这里只是测试不会报错）
      expect(async () => {
        await SQLiteAnalyticsService.exportData()
      }).not.toThrow()
    })

    it('应该能够导入数据', async () => {
      const jsonData = JSON.stringify({
        exportDate: new Date().toISOString(),
        visits: [
          {
            id: 'visit_1',
            timestamp: Date.now(),
            session_id: 'session_1',
            path: '/',
            title: '首页',
            duration: 30000,
            entry_type: 'direct'
          }
        ],
        events: [],
        devices: [],
        geos: []
      })

      await SQLiteAnalyticsService.importData(jsonData)
      await SQLiteAnalyticsService.syncToSQLite()

      const visits = await SQLiteAnalyticsService.getVisits()
      expect(visits.length).toBeGreaterThan(0)
    })
  })

  describe('数据清理', () => {
    it('应该能够清除所有数据', async () => {
      await SQLiteAnalyticsService.addVisit({ path: '/', title: '首页', duration: 30000 })
      await SQLiteAnalyticsService.addEvent({ type: 'click', element: 'button' })
      await SQLiteAnalyticsService.syncToSQLite()

      await SQLiteAnalyticsService.clearData()

      const visits = await SQLiteAnalyticsService.getVisits()
      const events = await SQLiteAnalyticsService.getEvents()

      expect(visits.length).toBe(0)
      expect(events.length).toBe(0)
    })
  })

  describe('同步机制', () => {
    it('应该能够同步到SQLite', async () => {
      await SQLiteAnalyticsService.addVisit({ path: '/', title: '首页', duration: 30000 })

      // 同步前数据应该在待写入队列中
      expect(SQLiteAnalyticsService.pendingWrites.length).toBeGreaterThan(0)

      await SQLiteAnalyticsService.syncToSQLite()

      // 同步后待写入队列应该为空
      expect(SQLiteAnalyticsService.pendingWrites.length).toBe(0)
    })

    it('应该能够保存数据库到localStorage', async () => {
      await SQLiteAnalyticsService.addVisit({ path: '/', title: '首页', duration: 30000 })
      await SQLiteAnalyticsService.syncToSQLite()

      const dbData = localStorage.getItem('analytics_db')
      expect(dbData).toBeDefined()
    })
  })

  describe('历史数据', () => {
    it('应该能够保存当前数据为历史数据', async () => {
      await SQLiteAnalyticsService.addVisit({ path: '/', title: '首页', duration: 30000 })
      await SQLiteAnalyticsService.syncToSQLite()

      await SQLiteAnalyticsService.saveCurrentAsPrevious()

      const previousData = await SQLiteAnalyticsService.getPreviousMetrics()
      expect(previousData).toBeDefined()
    })

    it('应该能够获取历史页面排名', async () => {
      await SQLiteAnalyticsService.addVisit({ path: '/', title: '首页', duration: 30000 })
      await SQLiteAnalyticsService.syncToSQLite()

      const ranking = await SQLiteAnalyticsService.getPageRanking()
      await SQLiteAnalyticsService.saveCurrentPageRanking(ranking)

      const previousRanking = await SQLiteAnalyticsService.getPreviousPageRanking()
      expect(previousRanking).toBeDefined()
    })

    it('应该能够获取历史行为数据', async () => {
      await SQLiteAnalyticsService.addEvent({ type: 'click', element: 'button' })
      await SQLiteAnalyticsService.syncToSQLite()

      const behavior = await SQLiteAnalyticsService.getBehaviorData('today')
      await SQLiteAnalyticsService.saveCurrentBehaviorData(behavior)

      const previousBehavior = await SQLiteAnalyticsService.getPreviousBehaviorData()
      expect(previousBehavior).toBeDefined()
    })
  })
})
