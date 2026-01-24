#!/usr/bin/env node

/**
 * 初始化数据库脚本
 * 在服务器端生成SQLite数据库文件并保存到指定目录
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import initSqlJs from 'sql.js';

// 获取当前脚本的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 数据库目录
const dbDir = join(__dirname, 'src', 'database');

// 确保目录存在
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
  console.log(`Created directory: ${dbDir}`);
}

// 初始化SQLite数据库
async function initDatabase() {
  try {
    console.log('Initializing SQLite databases...');
    
    // 初始化sql.js
    const SQL = await initSqlJs({
      // 在Node.js环境中，sql.js需要从文件系统加载wasm文件
      locateFile: file => join(__dirname, 'node_modules', 'sql.js', 'dist', file)
    });
    
    // =======================
    // 初始化Analytics数据库
    // =======================
    console.log('\n1. Initializing Analytics Database...');
    
    // 创建新的Analytics数据库
    const analyticsDb = new SQL.Database();
    
    // Analytics数据库schema
    const analyticsSchema = `
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
    `;
    
    // 执行schema
    analyticsDb.run(analyticsSchema);
    
    // 导出数据库到文件
    const analyticsDbBuffer = analyticsDb.export();
    const analyticsDbPath = join(dbDir, 'analytics.db');
    writeFileSync(analyticsDbPath, Buffer.from(analyticsDbBuffer));
    console.log(`✓ Created Analytics database: ${analyticsDbPath}`);
    
    // =======================
    // 初始化Comments数据库
    // =======================
    console.log('\n2. Initializing Comments Database...');
    
    // 创建新的Comments数据库
    const commentsDb = new SQL.Database();
    
    // Comments数据库schema
    const commentsSchema = `
      -- Enable foreign keys
      PRAGMA foreign_keys = ON;

      -- COMMENTS TABLE
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY NOT NULL,
        author TEXT NOT NULL,
        content TEXT NOT NULL,
        date INTEGER NOT NULL,
        parent_id TEXT,
        post_id INTEGER NOT NULL,
        avatar TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );

      -- Indexes for better query performance
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
      CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
      CREATE INDEX IF NOT EXISTS idx_comments_date ON comments(date DESC);

      -- Performance optimization
      PRAGMA journal_mode = WAL;
      PRAGMA synchronous = NORMAL;
      PRAGMA cache_size = -5000;
      PRAGMA temp_store = MEMORY;
    `;
    
    // 执行schema
    commentsDb.run(commentsSchema);
    
    // 导出数据库到文件
    const commentsDbBuffer = commentsDb.export();
    const commentsDbPath = join(dbDir, 'comments.db');
    writeFileSync(commentsDbPath, Buffer.from(commentsDbBuffer));
    console.log(`✓ Created Comments database: ${commentsDbPath}`);
    
    console.log('\n✅ Database initialization completed successfully!');
    console.log('\nThe following files have been created:');
    console.log(`- ${analyticsDbPath}`);
    console.log(`- ${commentsDbPath}`);
    console.log('\nThese database files will be loaded by the frontend application.');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// 运行初始化
initDatabase();
