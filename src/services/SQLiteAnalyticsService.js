/**
 * SQLite Analytics Service
 * 使用sql.js在浏览器中运行SQLite数据库
 * 实现localStorage缓存层和定期同步机制
 */

import initSqlJs from 'sql.js';
import { logger } from '../utils/logger';

class SQLiteAnalyticsService {
  constructor() {
    this.dbName = 'AnalyticsDB'
    this.dbVersion = 1
    this.db = null
    this.SQL = null
    this.syncInterval = 60000 // 1分钟同步一次
    this.syncTimer = null
    this.isInitialized = false
    this.sessionId = this.generateSessionId()
    this.localStorageKey = 'analytics_cache'
    this.dbFileName = 'analytics.db'
    this.dbFilePath = `/src/database/${this.dbFileName}`
    this.pendingWrites = [] // 待写入的数据队列
    this.maxPendingWrites = 100 // 最大待写入数量
    this.isSyncing = false
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  async init() {
    if (this.isInitialized) return

    try {
      logger.info('[SQLiteAnalytics] 开始初始化...')

      // 初始化sql.js
      this.SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`
      })

      // 加载数据库
      await this.loadDatabase()

      // 初始化表结构
      await this.initializeSchema()

      // 第一次启动时，确保数据从数据库同步到localStorage
      await this.syncToLocalStorage()

      // 加载localStorage缓存
      await this.loadFromLocalStorage()

      // 启动定期同步
      this.startSync()

      this.isInitialized = true
      logger.info('[SQLiteAnalytics] 初始化成功')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 初始化失败:', error)
      throw error
    }
  }

  async loadDatabase() {
    try {
      // 1. 优先从localStorage加载数据库（保持原有逻辑）
      const savedDb = localStorage.getItem('analytics_db')
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb))
        this.db = new this.SQL.Database(uint8Array)
        logger.info('[SQLiteAnalytics] 从localStorage加载数据库成功')
        return
      }
      
      // 2. 尝试从静态资源加载数据库文件
      try {
        const response = await fetch(this.dbFilePath)
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          const uint8Array = new Uint8Array(arrayBuffer)
          this.db = new this.SQL.Database(uint8Array)
          logger.info('[SQLiteAnalytics] 从静态资源加载数据库成功')
          return
        }
      } catch (fetchError) {
        logger.warn('[SQLiteAnalytics] 从静态资源加载数据库失败:', fetchError)
      }
      
      // 3. 如果以上都失败，创建新数据库
      this.db = new this.SQL.Database()
      logger.info('[SQLiteAnalytics] 创建新数据库成功')
      
      // 4. 初始化完成后，将新数据库保存到静态资源（仅在开发环境下）
      if (import.meta.env.DEV) {
        await this.exportDatabaseToStaticResource()
      }
    } catch (error) {
      logger.error('[SQLiteAnalytics] 加载数据库失败:', error)
      // 如果加载失败，创建新数据库
      this.db = new this.SQL.Database()
    }
  }

  /**
   * 将数据库导出到静态资源文件
   * 仅在开发环境下使用，用于初始化数据库文件
   * @returns {Promise<void>}
   */
  async exportDatabaseToStaticResource() {
    try {
      // 仅在开发环境下执行
      if (!import.meta.env.DEV) {
        return
      }
      
      // 导出数据库为二进制数据
      const data = this.db.export()
      const array = Array.from(data)
      
      logger.info('[SQLiteAnalytics] 数据库导出到localStorage，可通过开发工具手动保存到文件系统')
      logger.info('[SQLiteAnalytics] 导出数据大小:', (data.byteLength / 1024).toFixed(2), 'KB')
      
      // 在浏览器环境下，我们无法直接写入文件系统
      // 但可以将数据保存到localStorage，方便开发者手动下载
      localStorage.setItem('analytics_db_export', JSON.stringify(array))
    } catch (error) {
      logger.error('[SQLiteAnalytics] 导出数据库到静态资源失败:', error)
    }
  }

  async saveDatabase() {
    try {
      // 导出数据库为二进制数据
      const data = this.db.export()
      // 转换为可序列化的数组
      const array = Array.from(data)
      // 保存到localStorage
      localStorage.setItem('analytics_db', JSON.stringify(array))
      logger.info('[SQLiteAnalytics] 数据库保存成功')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 保存数据库失败:', error)
    }
  }

  async initializeSchema() {
    const schema = `
      -- Enable foreign keys
      PRAGMA foreign_keys = ON;

      -- VISITS TABLE
      CREATE TABLE IF NOT EXISTS visits (
        id TEXT PRIMARY KEY NOT NULL,
        timestamp INTEGER NOT NULL,
        session_id TEXT NOT NULL,
        path TEXT NOT NULL,
        title TEXT,
        referrer TEXT,
        duration INTEGER DEFAULT 0,
        entry_type TEXT DEFAULT 'direct',
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- EVENTS TABLE
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY NOT NULL,
        timestamp INTEGER NOT NULL,
        session_id TEXT NOT NULL,
        type TEXT NOT NULL,
        element TEXT,
        page_path TEXT,
        data TEXT,
        scroll_percent INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- DEVICES TABLE
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY NOT NULL,
        timestamp INTEGER NOT NULL,
        session_id TEXT NOT NULL,
        device_type TEXT NOT NULL,
        os TEXT NOT NULL,
        browser TEXT NOT NULL,
        browser_version TEXT,
        screen_width INTEGER,
        screen_height INTEGER,
        resolution TEXT,
        user_agent TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- GEOS TABLE
      CREATE TABLE IF NOT EXISTS geos (
        id TEXT PRIMARY KEY NOT NULL,
        timestamp INTEGER NOT NULL,
        session_id TEXT NOT NULL,
        country TEXT,
        country_code TEXT,
        city TEXT,
        region TEXT,
        latitude REAL,
        longitude REAL,
        timezone TEXT,
        language TEXT,
        ip_address TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- SUMMARY TABLE
      CREATE TABLE IF NOT EXISTS summary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- MIGRATION TABLE
      CREATE TABLE IF NOT EXISTS migration (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source TEXT NOT NULL,
        target TEXT NOT NULL,
        status TEXT NOT NULL,
        records_migrated INTEGER DEFAULT 0,
        error_message TEXT,
        started_at INTEGER,
        completed_at INTEGER,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_visits_timestamp ON visits(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_visits_session_id ON visits(session_id);
      CREATE INDEX IF NOT EXISTS idx_visits_path ON visits(path);
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
      CREATE INDEX IF NOT EXISTS idx_devices_timestamp ON devices(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_devices_session_id ON devices(session_id);
      CREATE INDEX IF NOT EXISTS idx_geos_timestamp ON geos(timestamp DESC);
      CREATE INDEX IF NOT EXISTS idx_geos_session_id ON geos(session_id);
      CREATE INDEX IF NOT EXISTS idx_geos_country ON geos(country);

      -- Performance optimization
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA cache_size = -10000;
      PRAGMA temp_store = MEMORY;
    `

    try {
      this.db.run(schema)
      logger.info('[SQLiteAnalytics] 数据库schema初始化成功')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 数据库schema初始化失败:', error)
      throw error
    }
  }

  // ========================================
  // LOCALSTORAGE CACHE LAYER
  // ========================================

  async loadFromLocalStorage() {
    try {
      const cache = localStorage.getItem(this.localStorageKey)
      if (cache) {
        const data = JSON.parse(cache)
        logger.info('[SQLiteAnalytics] 从localStorage加载缓存:', Object.keys(data))
        return data
      }
      return null
    } catch (error) {
      logger.error('[SQLiteAnalytics] 加载localStorage缓存失败:', error)
      return null
    }
  }

  async saveToLocalStorage(data) {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(data))
      logger.info('[SQLiteAnalytics] 保存到localStorage成功')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 保存到localStorage失败:', error)
    }
  }

  // ========================================
  // SYNC MECHANISM
  // ========================================

  startSync() {
    this.syncTimer = setInterval(() => {
      this.syncToSQLite()
    }, this.syncInterval)
  }

  stopSync() {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  async syncToSQLite() {
    if (this.isSyncing) {
      logger.info('[SQLiteAnalytics] 同步正在进行中，跳过')
      return
    }

    this.isSyncing = true

    try {
      // 处理待写入的数据
      if (this.pendingWrites.length > 0) {
        await this.flushPendingWrites()
      }

      // 保存数据库到localStorage
      await this.saveDatabase()

      // 同步摘要数据
      await this.syncSummary()

      logger.info('[SQLiteAnalytics] 数据同步成功')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 数据同步失败:', error)
    } finally {
      this.isSyncing = false
    }
  }

  async flushPendingWrites() {
    const writes = [...this.pendingWrites]
    this.pendingWrites = []

    try {
      // 批量插入数据
      for (const write of writes) {
        await this.executeWrite(write)
      }

      logger.info(`[SQLiteAnalytics] 批量写入成功: ${writes.length} 条记录`)
    } catch (error) {
      // 如果写入失败，将数据重新放回队列
      this.pendingWrites = [...writes, ...this.pendingWrites]
      throw error
    }
  }

  async executeWrite(write) {
    const { table, data } = write

    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO ${table} (
          id, timestamp, session_id, ${Object.keys(data).join(', ')}
        ) VALUES (?, ?, ?, ${Object.keys(data).map(() => '?').join(', ')})
      `)

      stmt.run([
        write.id,
        write.timestamp,
        write.sessionId,
        ...Object.values(data)
      ])

      stmt.free()
    } catch (error) {
      logger.error(`[SQLiteAnalytics] 写入失败 [${table}]:`, error)
      throw error
    }
  }

  async syncSummary() {
    try {
      const summary = await this.getSummary()
      await this.saveToLocalStorage(summary)
    } catch (error) {
      logger.error('[SQLiteAnalytics] 同步摘要失败:', error)
    }
  }

  /**
   * 将数据库数据同步到localStorage
   * 确保首次启动时数据从数据库加载到localStorage
   * @returns {Promise<void>}
   */
  async syncToLocalStorage() {
    try {
      logger.info('[SQLiteAnalytics] 开始从数据库同步到localStorage...')
      
      // 1. 导出数据库到localStorage
      await this.saveDatabase()
      
      // 2. 同步摘要数据到localStorage
      await this.syncSummary()
      
      logger.info('[SQLiteAnalytics] 数据库同步到localStorage成功')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 从数据库同步到localStorage失败:', error)
    }
  }

  // ========================================
  // DATA OPERATIONS
  // ========================================

  async addVisit(visit) {
    const record = {
      id: 'visit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...visit
    }

    // 添加到待写入队列
    this.pendingWrites.push({
      table: 'visits',
      id: record.id,
      timestamp: record.timestamp,
      sessionId: record.sessionId,
      data: {
        path: record.path,
        title: record.title || null,
        referrer: record.referrer || null,
        duration: record.duration || 0,
        entry_type: record.entryType || 'direct'
      }
    })

    // 如果待写入数量超过阈值，立即同步
    if (this.pendingWrites.length >= this.maxPendingWrites) {
      await this.syncToSQLite()
    }

    logger.info('[SQLiteAnalytics] 添加访问记录:', record.path)
  }

  async addEvent(event) {
    const record = {
      id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...event
    }

    this.pendingWrites.push({
      table: 'events',
      id: record.id,
      timestamp: record.timestamp,
      sessionId: record.sessionId,
      data: {
        type: record.type,
        element: record.element || null,
        page_path: record.pagePath || null,
        data: record.data ? JSON.stringify(record.data) : null,
        scroll_percent: record.scrollPercent || null
      }
    })

    if (this.pendingWrites.length >= this.maxPendingWrites) {
      await this.syncToSQLite()
    }
  }

  async addDevice(device) {
    const record = {
      id: 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...device
    }

    this.pendingWrites.push({
      table: 'devices',
      id: record.id,
      timestamp: record.timestamp,
      sessionId: record.sessionId,
      data: {
        device_type: record.deviceType,
        os: record.os,
        browser: record.browser,
        browser_version: record.browserVersion || null,
        screen_width: record.screenWidth || null,
        screen_height: record.screenHeight || null,
        resolution: record.resolution || null,
        user_agent: record.userAgent || null
      }
    })

    if (this.pendingWrites.length >= this.maxPendingWrites) {
      await this.syncToSQLite()
    }

    logger.info('[SQLiteAnalytics] 添加设备记录:', record)
  }

  async addGeo(geo) {
    const record = {
      id: 'geo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      ...geo
    }

    this.pendingWrites.push({
      table: 'geos',
      id: record.id,
      timestamp: record.timestamp,
      sessionId: record.sessionId,
      data: {
        country: geo.country || null,
        country_code: geo.countryCode || null,
        city: geo.city || null,
        region: geo.region || null,
        latitude: geo.latitude || null,
        longitude: geo.longitude || null,
        timezone: geo.timezone || null,
        language: geo.language || null,
        ip_address: geo.ipAddress || null
      }
    })

    if (this.pendingWrites.length >= this.maxPendingWrites) {
      await this.syncToSQLite()
    }
  }

  // ========================================
  // QUERY OPERATIONS
  // ========================================

  async getVisits() {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init()
      }
      
      const stmt = this.db.prepare('SELECT * FROM visits ORDER BY timestamp DESC')
      
      // 获取所有结果
      const visits = []
      while (stmt.step()) {
        visits.push(stmt.getAsObject())
      }
      stmt.free()
      
      return visits
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取访问记录失败:', error)
      return []
    }
  }

  async getEvents() {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      const stmt = this.db.prepare('SELECT * FROM events ORDER BY timestamp DESC')
      const events = []
      
      while (stmt.step()) {
        const event = stmt.getAsObject()
        // 解析JSON数据
        if (event.data) {
          event.data = JSON.parse(event.data)
        }
        events.push(event)
      }
      
      stmt.free()
      return events
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取事件记录失败:', error)
      return []
    }
  }
  
  async getEventsByTimeRange(timeRange = 'all') {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      const now = Date.now()
      const dayAgo = now - 24 * 60 * 60 * 1000
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000
      
      let startTime
      switch (timeRange) {
        case 'today':
          startTime = dayAgo
          break
        case 'week':
          startTime = weekAgo
          break
        case 'month':
          startTime = monthAgo
          break
        default:
          startTime = 0
      }
      
      let stmt
      if (startTime > 0) {
        stmt = this.db.prepare(`
          SELECT * FROM events
          WHERE timestamp >= ?
          ORDER BY timestamp DESC
        `)
        stmt.bind([startTime])
      } else {
        stmt = this.db.prepare('SELECT * FROM events ORDER BY timestamp DESC')
      }
      
      const events = []
      while (stmt.step()) {
        const event = stmt.getAsObject()
        // 解析JSON数据
        if (event.data) {
          event.data = JSON.parse(event.data)
        }
        events.push(event)
      }
      
      stmt.free()
      return events
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取时间范围内的事件记录失败:', error)
      return []
    }
  }

  async getDevices() {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      const stmt = this.db.prepare('SELECT * FROM devices ORDER BY timestamp DESC')
      const devices = []
      
      while (stmt.step()) {
        devices.push(stmt.getAsObject())
      }
      
      stmt.free()
      return devices
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取设备记录失败:', error)
      return []
    }
  }
  
  async getDevicesByTimeRange(timeRange = 'all') {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      const now = Date.now()
      const dayAgo = now - 24 * 60 * 60 * 1000
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000
      
      let startTime
      switch (timeRange) {
        case 'today':
          startTime = dayAgo
          break
        case 'week':
          startTime = weekAgo
          break
        case 'month':
          startTime = monthAgo
          break
        default:
          startTime = 0
      }
      
      let stmt
      if (startTime > 0) {
        stmt = this.db.prepare(`
          SELECT * FROM devices
          WHERE timestamp >= ?
          ORDER BY timestamp DESC
        `)
        stmt.bind([startTime])
      } else {
        stmt = this.db.prepare('SELECT * FROM devices ORDER BY timestamp DESC')
      }
      
      const devices = []
      while (stmt.step()) {
        devices.push(stmt.getAsObject())
      }
      
      stmt.free()
      return devices
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取时间范围内的设备记录失败:', error)
      return []
    }
  }

  async getGeos() {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      const stmt = this.db.prepare('SELECT * FROM geos ORDER BY timestamp DESC')
      const geos = []
      
      while (stmt.step()) {
        geos.push(stmt.getAsObject())
      }
      
      stmt.free()
      return geos
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取地理位置记录失败:', error)
      return []
    }
  }
  
  async getGeosByTimeRange(timeRange = 'all') {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      const now = Date.now()
      const dayAgo = now - 24 * 60 * 60 * 1000
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000
      
      let startTime
      switch (timeRange) {
        case 'today':
          startTime = dayAgo
          break
        case 'week':
          startTime = weekAgo
          break
        case 'month':
          startTime = monthAgo
          break
        default:
          startTime = 0
      }
      
      let stmt
      if (startTime > 0) {
        stmt = this.db.prepare(`
          SELECT * FROM geos
          WHERE timestamp >= ?
          ORDER BY timestamp DESC
        `)
        stmt.bind([startTime])
      } else {
        stmt = this.db.prepare('SELECT * FROM geos ORDER BY timestamp DESC')
      }
      
      const geos = []
      while (stmt.step()) {
        geos.push(stmt.getAsObject())
      }
      
      stmt.free()
      return geos
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取时间范围内的地理位置记录失败:', error)
      return []
    }
  }

  async getVisitsByTimestampRange(startTime, endTime) {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      // 参数验证
      if (startTime === undefined || endTime === undefined) {
        logger.error('[SQLiteAnalytics] getVisitsByTimestampRange: 缺少必需参数 startTime 或 endTime')
        return []
      }

      const stmt = this.db.prepare(`
        SELECT * FROM visits
        WHERE timestamp >= ? AND timestamp <= ?
        ORDER BY timestamp DESC
      `)
      stmt.bind([startTime, endTime])

      const visits = []
      while (stmt.step()) {
        visits.push(stmt.getAsObject())
      }

      stmt.free()
      return visits
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取时间范围内的访问记录失败:', error)
      return []
    }
  }
  
  async getVisitsByTimeRange(timeRange = 'all') {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      const now = Date.now()
      const dayAgo = now - 24 * 60 * 60 * 1000
      const weekAgo = now - 7 * 24 * 60 * 60 * 1000
      const monthAgo = now - 30 * 24 * 60 * 60 * 1000
      
      let startTime
      switch (timeRange) {
        case 'today':
          startTime = dayAgo
          break
        case 'week':
          startTime = weekAgo
          break
        case 'month':
          startTime = monthAgo
          break
        default:
          startTime = 0
      }
      
      let stmt
      if (startTime > 0) {
        stmt = this.db.prepare(`
          SELECT * FROM visits
          WHERE timestamp >= ?
          ORDER BY timestamp DESC
        `)
        stmt.bind([startTime])
      } else {
        stmt = this.db.prepare('SELECT * FROM visits ORDER BY timestamp DESC')
      }
      
      const visits = []
      while (stmt.step()) {
        visits.push(stmt.getAsObject())
      }
      
      stmt.free()
      return visits
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取时间范围内的访问记录失败:', error)
      return []
    }
  }

  async getEventsByType(type) {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      const stmt = this.db.prepare(`
        SELECT * FROM events
        WHERE type = ?
        ORDER BY timestamp DESC
      `)
      stmt.bind([type])

      const events = []
      while (stmt.step()) {
        const event = stmt.getAsObject()
        if (event.data) {
          event.data = JSON.parse(event.data)
        }
        events.push(event)
      }

      stmt.free()
      return events
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取指定类型的事件失败:', error)
      return []
    }
  }

  async getEventsByTimestampRange(startTime, endTime) {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      // 参数验证
      if (startTime === undefined || endTime === undefined) {
        logger.error('[SQLiteAnalytics] getEventsByTimestampRange: 缺少必需参数 startTime 或 endTime')
        return []
      }

      const stmt = this.db.prepare(`
        SELECT * FROM events
        WHERE timestamp >= ? AND timestamp <= ?
        ORDER BY timestamp DESC
      `)
      stmt.bind([startTime, endTime])

      const events = []
      while (stmt.step()) {
        const event = stmt.getAsObject()
        if (event.data) {
          event.data = JSON.parse(event.data)
        }
        events.push(event)
      }

      stmt.free()
      return events
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取时间范围内的事件失败:', error)
      return []
    }
  }

  // ========================================
  // STATISTICS CALCULATIONS
  // ========================================

  async getSummary(timeRange = 'all') {
    const now = Date.now()
    const dayAgo = now - 24 * 60 * 60 * 1000
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000
    const monthAgo = now - 30 * 24 * 60 * 60 * 1000

    const visits = await this.getVisitsByTimeRange(timeRange)
    const events = await this.getEventsByTimeRange(timeRange)
    const devices = await this.getDevicesByTimeRange(timeRange)
    const geos = await this.getGeosByTimeRange(timeRange)

    const todayVisits = visits.filter(v => v.timestamp >= dayAgo)
    const weekVisits = visits.filter(v => v.timestamp >= weekAgo)
    const monthVisits = visits.filter(v => v.timestamp >= monthAgo)

    const todayEvents = events.filter(e => e.timestamp >= dayAgo)
    const weekEvents = events.filter(e => e.timestamp >= weekAgo)
    const monthEvents = events.filter(e => e.timestamp >= monthAgo)

    // 计算总访问量：同一用户在同一会话期间多次访问同一页面只会被计数一次
    const calculateUniqueVisits = (visitList) => {
      const sessionPageVisits = new Map()
      let totalVisits = 0
      
      visitList.forEach(v => {
        if (!sessionPageVisits.has(v.session_id)) {
          sessionPageVisits.set(v.session_id, new Set())
        }
        const sessionVisitedPages = sessionPageVisits.get(v.session_id)
        
        if (!sessionVisitedPages.has(v.path)) {
          totalVisits++
          sessionVisitedPages.add(v.path)
        }
      })
      
      return totalVisits
    }

    // 计算独立访客（UV）：同一用户24小时内多次访问仅计为1次
    // 基于IP地址+UserAgent+屏幕尺寸作为用户标识
    const calculateUniqueVisitors = (visitList) => {
      // 按session_id分组，获取每个session的用户标识
      const sessionUserMap = new Map()
      
      // 构建session到设备信息的映射
      const deviceMap = new Map()
      devices.forEach(d => {
        deviceMap.set(d.session_id, d)
      })
      
      // 构建session到地理信息的映射
      const geoMap = new Map()
      geos.forEach(g => {
        geoMap.set(g.session_id, g)
      })
      
      // 为每个session生成唯一用户标识
      visitList.forEach(v => {
        if (!sessionUserMap.has(v.session_id)) {
          const device = deviceMap.get(v.session_id) || {}
          const geo = geoMap.get(v.session_id) || {}
          
          // 基于IP+UserAgent+屏幕尺寸生成用户标识
          const userIdentifier = `${geo.ip_address || ''}|${device.user_agent || ''}|${device.screen_width || ''}x${device.screen_height || ''}`
          sessionUserMap.set(v.session_id, {
            userIdentifier,
            timestamp: v.timestamp
          })
        }
      })
      
      // 按24小时时间段分组，统计每个时间段内的唯一用户数
      const dailyUsers = new Map()
      sessionUserMap.forEach((sessionData, sessionId) => {
        // 将时间戳转换为24小时起始时间（当天0点）
        const dayStart = new Date(sessionData.timestamp)
        dayStart.setHours(0, 0, 0, 0)
        const dayKey = dayStart.getTime()
        
        if (!dailyUsers.has(dayKey)) {
          dailyUsers.set(dayKey, new Set())
        }
        dailyUsers.get(dayKey).add(sessionData.userIdentifier)
      })
      
      // 统计总UV：每个24小时时间段内的唯一用户数之和
      let totalUV = 0
      dailyUsers.forEach(users => {
        totalUV += users.size
      })
      
      return totalUV
    }

    // 计算会话数
    const uniqueSessions = new Set(visits.map(v => v.session_id)).size
    const todayUniqueSessions = new Set(todayVisits.map(v => v.session_id)).size
    const weekUniqueSessions = new Set(weekVisits.map(v => v.session_id)).size
    const monthUniqueSessions = new Set(monthVisits.map(v => v.session_id)).size
    
    // 计算UV
    const uniqueVisitors = calculateUniqueVisitors(visits)
    const todayUniqueVisitors = calculateUniqueVisitors(todayVisits)
    const weekUniqueVisitors = calculateUniqueVisitors(weekVisits)
    const monthUniqueVisitors = calculateUniqueVisitors(monthVisits)
    
    // 使用新的访问量计算方式
    const totalVisits = calculateUniqueVisits(visits)
    const totalTodayVisits = calculateUniqueVisits(todayVisits)
    const totalWeekVisits = calculateUniqueVisits(weekVisits)
    const totalMonthVisits = calculateUniqueVisits(monthVisits)
    
    const totalDuration = visits.reduce((sum, v) => sum + (v.duration || 0), 0)
    const avgDuration = uniqueSessions > 0 ? totalDuration / uniqueSessions : 0
    const bounceRate = this.calculateBounceRate(visits)
    const pageRanking = this.calculatePageRanking(visits)
    const deviceStats = this.calculateDeviceStats(devices)
    const geoStats = this.calculateGeoStats(geos)
    const trendData = this.calculateTrendData(visits)

    return {
      total: {
        visits: totalVisits,
        uniqueVisitors: uniqueSessions,
        events: events.length,
        avgDuration: Math.round(avgDuration),
        bounceRate: bounceRate
      },
      today: {
        visits: totalTodayVisits,
        uniqueVisitors: todayUniqueSessions,
        events: todayEvents.length
      },
      week: {
        visits: totalWeekVisits,
        uniqueVisitors: weekUniqueSessions,
        events: weekEvents.length
      },
      month: {
        visits: totalMonthVisits,
        uniqueVisitors: monthUniqueSessions,
        events: monthEvents.length
      },
      pageRanking,
      deviceStats,
      geoStats,
      trendData,
      lastSync: now
    }
  }

  calculateBounceRate(visits) {
    const sessions = new Map()
    visits.forEach(v => {
      if (!sessions.has(v.session_id)) {
        sessions.set(v.session_id, [])
      }
      sessions.get(v.session_id).push(v)
    })

    let bounceCount = 0
    sessions.forEach((sessionVisits) => {
      if (sessionVisits.length === 1) {
        bounceCount++
      }
    })

    return sessions.size > 0 ? Math.round((bounceCount / sessions.size) * 100) : 0
  }

  calculatePageRanking(visits) {
    const pageStats = new Map()
    const sessionPages = new Map()
    // 用于跟踪每个会话访问的页面，确保同一会话多次访问同一页面只计数一次
    const sessionPageVisits = new Map()

    visits.forEach(v => {
      // 初始化会话数据
      if (!sessionPageVisits.has(v.session_id)) {
        sessionPageVisits.set(v.session_id, new Set())
      }
      const sessionVisitedPages = sessionPageVisits.get(v.session_id)
      
      // 初始化页面统计
      if (!pageStats.has(v.path)) {
        pageStats.set(v.path, { visits: 0, totalDuration: 0, uniqueSessions: new Set() })
      }
      const stats = pageStats.get(v.path)
      
      // 同一会话多次访问同一页面只计数一次
      if (!sessionVisitedPages.has(v.path)) {
        stats.visits++
        sessionVisitedPages.add(v.path)
      }
      
      stats.totalDuration += v.duration || 0
      stats.uniqueSessions.add(v.session_id)

      if (!sessionPages.has(v.session_id)) {
        sessionPages.set(v.session_id, new Set())
      }
      sessionPages.get(v.session_id).add(v.path)
    })

    const ranking = Array.from(pageStats.entries()).map(([path, stats]) => {
      let bounceRate = 0
      stats.uniqueSessions.forEach(sessionId => {
        const pages = sessionPages.get(sessionId)
        if (pages && pages.size === 1 && pages.has(path)) {
          bounceRate++
        }
      })
      bounceRate = stats.uniqueSessions.size > 0 ? Math.round((bounceRate / stats.uniqueSessions.size) * 100) : 0

      return {
        path,
        title: this.getPageTitle(path),
        visits: stats.visits,
        avgDuration: stats.uniqueSessions.size > 0 ? Math.round(stats.totalDuration / stats.uniqueSessions.size) : 0,
        bounceRate
      }
    })

    ranking.sort((a, b) => b.visits - a.visits)
    return ranking.slice(0, 20)
  }

  getPageTitle(path) {
    const titles = {
      '/': '首页',
      '/blog': '博客',
      '/gallery': '图库',
      '/research': '研究',
      '/contact': '联系',
      '/cv': '简历',
      '/about': '关于',
      '/projects': '项目'
    }
    return titles[path] || path
  }

  calculateDeviceStats(devices) {
    const deviceTypes = new Map()
    const osTypes = new Map()
    const browserTypes = new Map()
    const resolutions = new Map()

    devices.forEach(d => {
      deviceTypes.set(d.device_type, (deviceTypes.get(d.device_type) || 0) + 1)
      osTypes.set(d.os, (osTypes.get(d.os) || 0) + 1)
      browserTypes.set(d.browser, (browserTypes.get(d.browser) || 0) + 1)
      if (d.resolution) {
        resolutions.set(d.resolution, (resolutions.get(d.resolution) || 0) + 1)
      }
    })

    return {
      deviceTypes: Array.from(deviceTypes.entries()).map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / devices.length) * 100)
      })),
      osTypes: Array.from(osTypes.entries()).map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / devices.length) * 100)
      })),
      browserTypes: Array.from(browserTypes.entries()).map(([name, value]) => ({
        name,
        value,
        percent: Math.round((value / devices.length) * 100)
      })),
      resolutions: Array.from(resolutions.entries()).map(([name, value]) => ({
        name,
        value
      }))
    }
  }

  calculateGeoStats(geos) {
    // 使用新的访问量计算方式：同一用户在同一会话期间多次访问同一地区只计数一次
    const sessionCountryVisits = new Map()
    const sessionCityVisits = new Map()
    const sessionLanguageVisits = new Map()
    const sessionTimezoneVisits = new Map()
    
    // 用于存储最终统计结果
    const countries = new Map()
    const cities = new Map()
    const languages = new Map()
    const timezones = new Map()

    geos.forEach(g => {
      // 初始化会话数据
      if (!sessionCountryVisits.has(g.session_id)) {
        sessionCountryVisits.set(g.session_id, new Set())
      }
      if (!sessionCityVisits.has(g.session_id)) {
        sessionCityVisits.set(g.session_id, new Set())
      }
      if (!sessionLanguageVisits.has(g.session_id)) {
        sessionLanguageVisits.set(g.session_id, new Set())
      }
      if (!sessionTimezoneVisits.has(g.session_id)) {
        sessionTimezoneVisits.set(g.session_id, new Set())
      }
      
      const sessionCountries = sessionCountryVisits.get(g.session_id)
      const sessionCities = sessionCityVisits.get(g.session_id)
      const sessionLanguages = sessionLanguageVisits.get(g.session_id)
      const sessionTimezones = sessionTimezoneVisits.get(g.session_id)
      
      // 国家统计：同一会话多次访问同一国家只计数一次
      if (g.country && !sessionCountries.has(g.country)) {
        countries.set(g.country, {
          count: (countries.get(g.country)?.count || 0) + 1,
          latitude: g.latitude,
          longitude: g.longitude
        })
        sessionCountries.add(g.country)
      }
      
      // 城市统计：同一会话多次访问同一城市只计数一次
      if (g.city && !sessionCities.has(g.city)) {
        cities.set(g.city, {
          count: (cities.get(g.city)?.count || 0) + 1,
          country: g.country,
          latitude: g.latitude,
          longitude: g.longitude
        })
        sessionCities.add(g.city)
      }
      
      // 语言统计：同一会话多次访问同一语言地区只计数一次
      if (g.language && !sessionLanguages.has(g.language)) {
        languages.set(g.language, (languages.get(g.language) || 0) + 1)
        sessionLanguages.add(g.language)
      }
      
      // 时区统计：同一会话多次访问同时区只计数一次
      if (g.timezone && !sessionTimezones.has(g.timezone)) {
        timezones.set(g.timezone, (timezones.get(g.timezone) || 0) + 1)
        sessionTimezones.add(g.timezone)
      }
    })

    const countryRanking = Array.from(countries.entries()).map(([name, data]) => ({
      code: this.getCountryCode(name),
      name,
      flag: this.getCountryFlag(name),
      visits: data.count,
      latitude: data.latitude,
      longitude: data.longitude,
      percent: geos.length > 0 ? Math.round((data.count / geos.length) * 100) : 0
    }))

    const cityRanking = Array.from(cities.entries()).map(([name, data]) => ({
      name,
      country: data.country,
      visits: data.count,
      latitude: data.latitude,
      longitude: data.longitude,
      percent: geos.length > 0 ? Math.round((data.count / geos.length) * 100) : 0
    }))

    const languageData = Array.from(languages.entries()).map(([name, value]) => ({
      code: name,
      name: this.getLanguageName(name),
      flag: this.getLanguageFlag(name),
      visits: value,
      percent: geos.length > 0 ? Math.round((value / geos.length) * 100) : 0
    }))

    const timezoneData = Array.from(timezones.entries()).map(([name, value]) => ({
      name,
      visits: value,
      percent: geos.length > 0 ? Math.round((value / geos.length) * 100) : 0
    }))

    countryRanking.sort((a, b) => b.visits - a.visits)
    cityRanking.sort((a, b) => b.visits - a.visits)
    languageData.sort((a, b) => b.visits - a.visits)
    timezoneData.sort((a, b) => b.visits - a.visits)

    return {
      countries: countryRanking.slice(0, 10),
      cities: cityRanking.slice(0, 10),
      languages: languageData.slice(0, 7),
      timezones: timezoneData.slice(0, 10)
    }
  }

  getCountryCode(name) {
    const codes = {
      '美国': 'US', '中国': 'CN', '英国': 'GB', '德国': 'DE',
      '日本': 'JP', '法国': 'FR', '加拿大': 'CA', '澳大利亚': 'AU',
      '巴西': 'BR', '印度': 'IN'
    }
    return codes[name] || 'XX'
  }

  getCountryFlag(name) {
    const flags = {
      '美国': '🇺🇸', '中国': '🇨🇳', '英国': '🇬🇧', '德国': '🇩🇪',
      '日本': '🇯🇵', '法国': '🇫🇷', '加拿大': '🇨🇦', '澳大利亚': '🇦🇺',
      '巴西': '🇧🇷', '印度': '🇮🇳'
    }
    return flags[name] || '🌍'
  }

  getCityCountry(name) {
    const countries = {
      'San Francisco': '美国', 'New York': '美国', 'London': '英国',
      'Tokyo': '日本', 'Beijing': '中国', 'Shanghai': '中国',
      'Berlin': '德国', 'Paris': '法国', 'Sydney': '澳大利亚', 'Toronto': '加拿大'
    }
    return countries[name] || '未知'
  }

  getLanguageName(code) {
    const names = {
      'en': '英语', 'zh': '中文', 'es': '西班牙语',
      'fr': '法语', 'de': '德语', 'ja': '日语', 'ko': '韩语'
    }
    return names[code] || code
  }

  getLanguageFlag(code) {
    const flags = {
      'en': '🇬🇧', 'zh': '🇨🇳', 'es': '🇪🇸',
      'fr': '🇫🇷', 'de': '🇩🇪', 'ja': '🇯🇵', 'ko': '🇰🇷'
    }
    return flags[code] || '🌐'
  }

  calculateTrendData(visits) {
    const now = Date.now()
    const days = 30
    const labels = []
    const values = []

    // 计算每日访问量：同一用户在同一会话期间多次访问同一页面只会被计数一次
    const calculateDailyVisits = (dayStart, dayEnd) => {
      const dayVisits = visits.filter(v => v.timestamp >= dayStart && v.timestamp < dayEnd)
      const sessionPageVisits = new Map()
      let dailyVisits = 0
      
      dayVisits.forEach(v => {
        if (!sessionPageVisits.has(v.session_id)) {
          sessionPageVisits.set(v.session_id, new Set())
        }
        const sessionVisitedPages = sessionPageVisits.get(v.session_id)
        
        if (!sessionVisitedPages.has(v.path)) {
          dailyVisits++
          sessionVisitedPages.add(v.path)
        }
      })
      
      return dailyVisits
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      labels.push(dateStr)

      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000
      const dailyVisits = calculateDailyVisits(dayStart, dayEnd)
      values.push(dailyVisits)
    }

    return { labels, values }
  }

  calculateTrendDuration(visits) {
    const now = Date.now()
    const days = 30
    const labels = []
    const values = []

    // 计算每日访问量：同一用户在同一会话期间多次访问同一页面只会被计数一次
    const calculateDailyVisits = (dayStart, dayEnd) => {
      const dayVisits = visits.filter(v => v.timestamp >= dayStart && v.timestamp < dayEnd)
      const sessionPageVisits = new Map()
      let dailyVisits = 0
      
      dayVisits.forEach(v => {
        if (!sessionPageVisits.has(v.session_id)) {
          sessionPageVisits.set(v.session_id, new Set())
        }
        const sessionVisitedPages = sessionPageVisits.get(v.session_id)
        
        if (!sessionVisitedPages.has(v.path)) {
          dailyVisits++
          sessionVisitedPages.add(v.path)
        }
      })
      
      return dailyVisits
    }

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      labels.push(dateStr)

      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000
      const dayVisits = visits.filter(v => v.timestamp >= dayStart && v.timestamp < dayEnd)
      
      // 使用新的访问量计算方式
      const dailyVisits = calculateDailyVisits(dayStart, dayEnd)
      
      const totalDuration = dayVisits.reduce((sum, v) => sum + (v.duration || 0), 0)
      const avgDuration = dailyVisits > 0 ? Math.round(totalDuration / dailyVisits) : 0
      values.push(avgDuration)
    }

    return { labels, values }
  }

  calculateTrendBounceRate(visits) {
    const now = Date.now()
    const days = 30
    const labels = []
    const values = []

    const sessionPages = new Map()
    visits.forEach(v => {
      if (!sessionPages.has(v.session_id)) {
        sessionPages.set(v.session_id, new Set())
      }
      sessionPages.get(v.session_id).add(v.path)
    })

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
      labels.push(dateStr)

      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000
      const dayVisits = visits.filter(v => v.timestamp >= dayStart && v.timestamp < dayEnd)

      const daySessions = new Set(dayVisits.map(v => v.session_id))
      let totalBounceRate = 0
      daySessions.forEach(sessionId => {
        const pages = sessionPages.get(sessionId)
        if (pages && pages.size === 1) {
          totalBounceRate++
        }
      })
      const avgBounceRate = daySessions.size > 0 ? Math.round((totalBounceRate / daySessions.size) * 100) : 0
      values.push(avgBounceRate)
    }

    return { labels, values }
  }

  // ========================================
  // API METHODS (Backward Compatibility)
  // ========================================

  async getDeviceStats(timeRange = 'all') {
    const devices = await this.getDevicesByTimeRange(timeRange)
    return this.calculateDeviceStats(devices)
  }

  async getGeoStats(timeRange = 'all') {
    const geos = await this.getGeosByTimeRange(timeRange)
    return this.calculateGeoStats(geos)
  }

  async getPageRanking(timeRange = 'all') {
    const visits = await this.getVisitsByTimeRange(timeRange)
    return this.calculatePageRanking(visits)
  }

  async getTrendData(timeRange = 'all') {
    const visits = await this.getVisitsByTimeRange(timeRange)
    return this.calculateTrendData(visits)
  }

  async getSummaryFromStorage() {
    try {
      const cache = await this.loadFromLocalStorage()
      if (cache) {
        return cache
      }
    } catch (error) {
      logger.error('[SQLiteAnalytics] 读取localStorage失败:', error)
    }
    return null
  }

  async getMetrics(timeRange = 'all') {
    const summary = await this.getSummaryFromStorage() || await this.getSummary()

    switch (timeRange) {
      case 'today':
        return {
          totalVisits: summary.today.visits,
          uniqueVisitors: summary.today.uniqueVisitors,
          avgDuration: summary.total.avgDuration,
          bounceRate: summary.total.bounceRate
        }
      case 'week':
        return {
          totalVisits: summary.week.visits,
          uniqueVisitors: summary.week.uniqueVisitors,
          avgDuration: summary.total.avgDuration,
          bounceRate: summary.total.bounceRate
        }
      case 'month':
        return {
          totalVisits: summary.month.visits,
          uniqueVisitors: summary.month.uniqueVisitors,
          avgDuration: summary.total.avgDuration,
          bounceRate: summary.total.bounceRate
        }
      default:
        return {
          totalVisits: summary.total.visits,
          uniqueVisitors: summary.total.uniqueVisitors,
          avgDuration: summary.total.avgDuration,
          bounceRate: summary.total.bounceRate
        }
    }
  }

  async getBehaviorData(timeRange = 'all') {
    const events = await this.getEvents()
    const now = Date.now()
    let startTime = 0

    switch (timeRange) {
      case 'today':
        startTime = now - 24 * 60 * 60 * 1000
        break
      case 'week':
        startTime = now - 7 * 24 * 60 * 60 * 1000
        break
      case 'month':
        startTime = now - 30 * 24 * 60 * 60 * 1000
        break
    }

    const filteredEvents = startTime > 0 ? events.filter(e => e.timestamp >= startTime) : events

    const clickEvents = filteredEvents.filter(e => e.type === 'click')
    const scrollEvents = filteredEvents.filter(e => e.type === 'scroll')
    const hoverEvents = filteredEvents.filter(e => e.type === 'hover')
    const formEvents = filteredEvents.filter(e => e.type === 'form')
    const downloadEvents = filteredEvents.filter(e => e.type === 'download')

    return {
      clicks: clickEvents.length,
      scrolls: scrollEvents.length,
      hovers: hoverEvents.length,
      forms: formEvents.length,
      downloads: downloadEvents.length,
      avgScrollDepth: this.calculateAvgScrollDepth(scrollEvents),
      completionRate: this.calculateCompletionRate(scrollEvents),
      dropOffRate: this.calculateDropOffRate(scrollEvents)
    }
  }

  calculateAvgScrollDepth(scrollEvents) {
    if (scrollEvents.length === 0) return 0

    const scrollDepths = scrollEvents.map(e => e.scroll_percent || 0)
    const avgDepth = scrollDepths.reduce((sum, depth) => sum + depth, 0) / scrollEvents.length
    return Math.round(avgDepth)
  }

  calculateCompletionRate(scrollEvents) {
    if (scrollEvents.length === 0) return 0

    const completedEvents = scrollEvents.filter(e => e.scroll_percent >= 90)
    const completionRate = (completedEvents.length / scrollEvents.length) * 100
    return Math.round(completionRate)
  }

  calculateDropOffRate(scrollEvents) {
    if (scrollEvents.length === 0) return 0

    const dropOffEvents = scrollEvents.filter(e => e.scroll_percent < 25)
    const dropOffRate = (dropOffEvents.length / scrollEvents.length) * 100
    return Math.round(dropOffRate)
  }
  
  async getHotspots(timeRange = 'all') {
    const events = await this.getEventsByTimeRange(timeRange)
    const clickEvents = events.filter(e => e.type === 'click')
    
    // 统计每个元素的点击次数
    const elementClicks = new Map()
    clickEvents.forEach(event => {
      const element = event.element || 'unknown'
      elementClicks.set(element, (elementClicks.get(element) || 0) + 1)
    })
    
    // 转换为热点数据
    const hotspots = Array.from(elementClicks.entries())
      .map(([element, clicks], index) => {
        // 根据元素名称生成坐标和标题
        const position = this.getElementPosition(element)
        const intensity = Math.min(clicks / 1000, 1)
        const size = Math.max(30, Math.min(80, clicks / 10))
        
        return {
          id: index + 1,
          x: position.x,
          y: position.y,
          size: size,
          intensity: intensity,
          clicks: clicks,
          title: element
        }
      })
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10) // 只取前10个热点
    
    return hotspots
  }
  
  getElementPosition(element) {
    // 根据元素名称返回坐标
    const elementPositions = {
      '导航栏': { x: 50, y: 15 },
      '主要内容': { x: 25, y: 35 },
      '侧边栏': { x: 75, y: 45 },
      '图片区域': { x: 50, y: 65 },
      '底部链接': { x: 30, y: 80 },
      '页脚': { x: 70, y: 85 }
    }
    
    return elementPositions[element] || { x: 50, y: 50 }
  }
  
  async getPathFlowData(timeRange = 'all') {
    const visits = await this.getVisitsByTimeRange(timeRange)
    
    if (visits.length === 0) {
      return { nodes: [], links: [] }
    }
    
    // 按session_id分组
    const sessionVisits = new Map()
    visits.forEach(visit => {
      const sessionId = visit.session_id
      if (!sessionVisits.has(sessionId)) {
        sessionVisits.set(sessionId, [])
      }
      sessionVisits.get(sessionId).push(visit)
    })
    
    // 统计页面跳转路径
    const pathTransitions = new Map()
    const pageNames = new Map()
    
    sessionVisits.forEach((sessionVisitsList) => {
      // 按时间排序
      sessionVisitsList.sort((a, b) => a.timestamp - b.timestamp)
      
      // 提取页面名称，并去重连续重复的页面（避免A→A→B这样的路径）
      const pages = []
      sessionVisitsList.forEach(v => {
        const path = v.path || 'unknown'
        const name = this.getPageName(path)
        // 只添加与上一个页面不同的页面
        if (pages.length === 0 || pages[pages.length - 1] !== name) {
          pages.push(name)
          pageNames.set(name, true)
        }
      })
      
      // 统计页面跳转，确保没有循环（避免A→B→A这样的路径）
      for (let i = 0; i < pages.length - 1; i++) {
        const source = pages[i]
        const target = pages[i + 1]
        
        // 跳过自循环（A→A）
        if (source === target) continue
        
        // 跳过直接循环（A→B→A）
        if (i > 0 && pages[i - 1] === target) continue
        
        const key = `${source}->${target}`
        pathTransitions.set(key, (pathTransitions.get(key) || 0) + 1)
      }
    })
    
    // 转换为sankey图表数据格式
    const nodes = Array.from(pageNames.keys()).map(name => ({ name }))
    let links = Array.from(pathTransitions.entries())
      .map(([key, value]) => {
        const [source, target] = key.split('->')
        return { source, target, value }
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 20) // 只取前20个路径
    
    // 进一步处理：检测并移除循环
    links = this.removeCyclesFromLinks(links)
    
    return { nodes, links }
  }
  
  /**
   * 从链接中移除循环，确保桑基图数据是DAG
   * @param {Array} links - 原始链接数组
   * @returns {Array} - 无循环的链接数组
   */
  removeCyclesFromLinks(links) {
    // 构建邻接表
    const adjacency = new Map()
    const allNodes = new Set()
    
    // 初始化邻接表
    links.forEach(link => {
      allNodes.add(link.source)
      allNodes.add(link.target)
      
      if (!adjacency.has(link.source)) {
        adjacency.set(link.source, new Set())
      }
      adjacency.get(link.source).add(link.target)
    })
    
    // 找出所有循环路径
    const cycles = []
    const visited = new Set()
    const recStack = new Set()
    const path = []
    
    // DFS检测循环
    const detectCycle = (node) => {
      if (!visited.has(node)) {
        visited.add(node)
        recStack.add(node)
        path.push(node)
        
        const neighbors = adjacency.get(node) || []
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor) && detectCycle(neighbor)) {
            return true
          } else if (recStack.has(neighbor)) {
            // 找到循环，记录路径
            const cycleStartIndex = path.indexOf(neighbor)
            if (cycleStartIndex !== -1) {
              cycles.push([...path.slice(cycleStartIndex), neighbor])
            }
            return true
          }
        }
      }
      
      recStack.delete(node)
      path.pop()
      return false
    }
    
    // 对所有节点执行DFS
    for (const node of allNodes) {
      detectCycle(node)
    }
    
    // 如果没有循环，直接返回
    if (cycles.length === 0) {
      return links
    }
    
    // 移除参与循环的链接，优先保留值大的链接
    const linksToRemove = new Set()
    
    cycles.forEach(cycle => {
      // 找到循环中的所有链接
      for (let i = 0; i < cycle.length - 1; i++) {
        const source = cycle[i]
        const target = cycle[i + 1]
        
        // 找到对应的链接索引
        const linkIndex = links.findIndex(link => link.source === source && link.target === target)
        if (linkIndex !== -1) {
          linksToRemove.add(linkIndex)
        }
      }
    })
    
    // 移除参与循环的链接
    return links.filter((_, index) => !linksToRemove.has(index))
  }
  
  getPageName(path) {
    // 根据路径返回页面名称
    const pathMap = {
      '/': '首页',
      '/blog': '博客',
      '/gallery': '图库',
      '/research': '研究',
      '/contact': '联系',
      '/resume': '简历',
      '/about': '关于'
    }
    
    return pathMap[path] || path
  }

  // ========================================
  // DATA EXPORT/IMPORT
  // ========================================

  async exportData() {
    const visits = await this.getVisits()
    const events = await this.getEvents()
    const devices = await this.getDevices()
    const geos = await this.getGeos()

    const data = {
      exportDate: new Date().toISOString(),
      visits,
      events,
      devices,
      geos
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async importData(jsonData) {
    try {
      const data = JSON.parse(jsonData)

      if (data.visits) {
        for (const visit of data.visits) {
          this.pendingWrites.push({
            table: 'visits',
            id: visit.id,
            timestamp: visit.timestamp,
            sessionId: visit.session_id,
            data: {
              path: visit.path,
              title: visit.title || null,
              referrer: visit.referrer || null,
              duration: visit.duration || 0,
              entry_type: visit.entry_type || 'direct'
            }
          })
        }
      }

      if (data.events) {
        for (const event of data.events) {
          this.pendingWrites.push({
            table: 'events',
            id: event.id,
            timestamp: event.timestamp,
            sessionId: event.session_id,
            data: {
              type: event.type,
              element: event.element || null,
              page_path: event.page_path || null,
              data: event.data || null,
              scroll_percent: event.scroll_percent || null
            }
          })
        }
      }

      if (data.devices) {
        for (const device of data.devices) {
          this.pendingWrites.push({
            table: 'devices',
            id: device.id,
            timestamp: device.timestamp,
            sessionId: device.session_id,
            data: {
              device_type: device.device_type,
              os: device.os,
              browser: device.browser,
              browser_version: device.browser_version || null,
              screen_width: device.screen_width || null,
              screen_height: device.screen_height || null,
              resolution: device.resolution || null,
              user_agent: device.user_agent || null
            }
          })
        }
      }

      if (data.geos) {
        for (const geo of data.geos) {
          this.pendingWrites.push({
            table: 'geos',
            id: geo.id,
            timestamp: geo.timestamp,
            sessionId: geo.session_id,
            data: {
              country: geo.country || null,
              country_code: geo.country_code || null,
              city: geo.city || null,
              region: geo.region || null,
              latitude: geo.latitude || null,
              longitude: geo.longitude || null,
              timezone: geo.timezone || null,
              language: geo.language || null,
              ip_address: geo.ip_address || null
            }
          })
        }
      }

      await this.syncToSQLite()
      logger.info('[SQLiteAnalytics] 数据导入成功')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 数据导入失败:', error)
      throw error
    }
  }

  async clearData() {
    try {
      // 确保数据库已初始化
      if (!this.db) {
        await this.init();
      }
      
      this.db.run('DELETE FROM visits')
      this.db.run('DELETE FROM events')
      this.db.run('DELETE FROM devices')
      this.db.run('DELETE FROM geos')
      this.db.run('DELETE FROM summary')

      localStorage.removeItem('analytics_db')
      localStorage.removeItem('analytics_cache')

      logger.info('[SQLiteAnalytics] 数据清除成功')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 数据清除失败:', error)
      throw error
    }
  }

  // ========================================
  // HISTORICAL DATA METHODS
  // ========================================

  async getPreviousMetrics() {
    try {
      const summaryStr = localStorage.getItem('analytics_previous_summary')
      if (summaryStr) {
        return JSON.parse(summaryStr)
      }
      return null
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取历史数据失败:', error)
      return null
    }
  }

  async saveCurrentAsPrevious() {
    try {
      const currentSummary = await this.getSummary()
      localStorage.setItem('analytics_previous_summary', JSON.stringify(currentSummary))
      logger.info('[SQLiteAnalytics] 当前数据已保存为历史数据')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 保存历史数据失败:', error)
    }
  }

  async getPreviousPageRanking() {
    try {
      const rankingStr = localStorage.getItem('analytics_previous_ranking')
      if (rankingStr) {
        return JSON.parse(rankingStr)
      }
      return []
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取历史排名数据失败:', error)
      return []
    }
  }

  async saveCurrentPageRanking(ranking) {
    try {
      localStorage.setItem('analytics_previous_ranking', JSON.stringify(ranking))
      logger.info('[SQLiteAnalytics] 当前排名已保存为历史数据')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 保存排名数据失败:', error)
    }
  }

  async getPreviousBehaviorData() {
    try {
      const behaviorStr = localStorage.getItem('analytics_previous_behavior')
      if (behaviorStr) {
        return JSON.parse(behaviorStr)
      }
      return {
        clicks: 0,
        scrolls: 0,
        hovers: 0,
        forms: 0,
        downloads: 0,
        avgScrollDepth: 0,
        completionRate: 0,
        dropOffRate: 0
      }
    } catch (error) {
      logger.error('[SQLiteAnalytics] 获取历史行为数据失败:', error)
      return {
        clicks: 0,
        scrolls: 0,
        hovers: 0,
        forms: 0,
        downloads: 0,
        avgScrollDepth: 0,
        completionRate: 0,
        dropOffRate: 0
      }
    }
  }

  async saveCurrentBehaviorData(behavior) {
    try {
      localStorage.setItem('analytics_previous_behavior', JSON.stringify(behavior))
      logger.info('[SQLiteAnalytics] 当前行为数据已保存为历史数据')
    } catch (error) {
      logger.error('[SQLiteAnalytics] 保存行为数据失败:', error)
    }
  }

  // ========================================
  // CLEANUP
  // ========================================

  async destroy() {
    this.stopSync()
    if (this.db) {
      this.db.close()
      this.db = null
    }
    this.isInitialized = false
    logger.info('[SQLiteAnalytics] 服务已销毁')
  }
}

export default new SQLiteAnalyticsService()
