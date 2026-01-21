/**
 * SQLite Comment Service
 * 使用sql.js在浏览器中运行SQLite数据库
 * 专门用于Blog评论存储，与Analytics数据库完全隔离
 */

import initSqlJs from 'sql.js';

class SQLiteCommentService {
  constructor() {
    this.dbName = 'BlogCommentsDB'
    this.dbVersion = 1
    this.db = null
    this.SQL = null
    this.isInitialized = false
    this.localStorageKey = 'blog_comments_db'
    this.pendingWrites = []
    this.maxPendingWrites = 50
    this.isSyncing = false
  }

  /**
   * 初始化服务
   * @returns {Promise<void>}
   */
  async init() {
    if (this.isInitialized) {
      logger.info('[SQLiteCommentService] 服务已初始化')
      return
    }

    try {
      logger.info('[SQLiteCommentService] 开始初始化...')

      // 初始化sql.js
      this.SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.13.0/${file}`
      })

      // 加载数据库
      await this.loadDatabase()

      // 初始化表结构
      await this.initializeSchema()

      this.isInitialized = true
      logger.info('[SQLiteCommentService] 初始化成功')
    } catch (error) {
      logger.error('[SQLiteCommentService] 初始化失败:', error)
      throw error
    }
  }

  /**
   * 加载数据库
   * @returns {Promise<void>}
   */
  async loadDatabase() {
    try {
      // 尝试从localStorage加载数据库
      const savedDb = localStorage.getItem(this.localStorageKey)
      if (savedDb) {
        const uint8Array = new Uint8Array(JSON.parse(savedDb))
        this.db = new this.SQL.Database(uint8Array)
        logger.info('[SQLiteCommentService] 从localStorage加载数据库成功')
      } else {
        // 创建新数据库
        this.db = new this.SQL.Database()
        logger.info('[SQLiteCommentService] 创建新数据库成功')
      }
    } catch (error) {
      logger.error('[SQLiteCommentService] 加载数据库失败:', error)
      // 如果加载失败，创建新数据库
      this.db = new this.SQL.Database()
    }
  }

  /**
   * 保存数据库到localStorage
   * 使用setTimeout避免阻塞主线程
   * @returns {Promise<void>}
   */
  async saveDatabase() {
    const startTime = Date.now()
    return new Promise((resolve, reject) => {
      // 使用setTimeout将操作延迟到下一个事件循环,避免阻塞UI
      setTimeout(() => {
        try {
          const data = this.db.export()
          const array = Array.from(data)
          const jsonString = JSON.stringify(array)
          
          // 检查数据大小,避免超过localStorage限制
          const dataSize = new Blob([jsonString]).size
          const maxSize = 5 * 1024 * 1024 // 5MB
          
          if (dataSize > maxSize) {
            const error = new Error(`数据库大小超过限制 (${(dataSize / 1024 / 1024).toFixed(2)}MB > 5MB)`)
            logger.error('[SQLiteCommentService] 保存数据库失败:', error)
            reject(error)
            return
          }
          
          localStorage.setItem(this.localStorageKey, jsonString)
          
          const endTime = Date.now()
          logger.info(`[SQLiteCommentService] 数据库保存成功 (耗时: ${endTime - startTime}ms, 大小: ${(dataSize / 1024).toFixed(2)}KB)`)
          resolve()
        } catch (error) {
          const endTime = Date.now()
          logger.error(`[SQLiteCommentService] 保存数据库失败 (耗时: ${endTime - startTime}ms):`, error)
          reject(error)
        }
      }, 0) // 立即执行,但在下一个事件循环
    })
  }

  /**
   * 初始化表结构
   * @returns {Promise<void>}
   */
  async initializeSchema() {
    const schema = `
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
    `

    try {
      this.db.run(schema)
      logger.info('[SQLiteCommentService] 数据库schema初始化成功')
    } catch (error) {
      logger.error('[SQLiteCommentService] 数据库schema初始化失败:', error)
      throw error
    }
  }

  /**
   * 生成唯一的评论ID
   * @returns {string} 唯一ID
   */
  generateCommentId() {
    return 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  /**
   * 生成用户头像URL
   * @param {string} name - 用户名
   * @returns {string} 头像URL
   */
  generateAvatarUrl(name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  }

  /**
   * 添加新评论
   * @param {Object} commentData - 评论数据
   * @returns {Promise<Object>} 新添加的评论
   */
  async addComment(commentData) {
    const startTime = Date.now()
    const timeout = 10000 // 10秒超时
    
    try {
      const { author, content, parentId, postId, avatar } = commentData

      const newComment = {
        id: this.generateCommentId(),
        author: author.trim(),
        content: content.trim(),
        date: Date.now(),
        parent_id: parentId || null,
        post_id: postId || 1,
        avatar: avatar || this.generateAvatarUrl(author)
      }

      const stmt = this.db.prepare(`
        INSERT INTO comments (
          id, author, content, date, parent_id, post_id, avatar
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)

      stmt.run([
        newComment.id,
        newComment.author,
        newComment.content,
        newComment.date,
        newComment.parent_id,
        newComment.post_id,
        newComment.avatar
      ])

      stmt.free()

      // 立即保存数据库到localStorage,带超时
      await Promise.race([
        this.saveDatabase(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('保存数据库超时')), timeout)
        )
      ])

      const endTime = Date.now()
      const duration = endTime - startTime
      logger.info(`[SQLiteCommentService] 添加评论成功: ${newComment.id} (耗时: ${duration}ms)`)
      
      // 如果操作时间过长,发出警告
      if (duration > 3000) {
        logger.warn(`[SQLiteCommentService] 警告: 添加评论耗时较长 (${duration}ms), 可能影响用户体验`)
      }
      
      return newComment
    } catch (error) {
      const endTime = Date.now()
      const duration = endTime - startTime
      logger.error(`[SQLiteCommentService] 添加评论失败 (耗时: ${duration}ms):`, error)
      throw error
    }
  }

  /**
   * 删除评论及其所有回复
   * @param {string} commentId - 要删除的评论ID
   * @returns {Promise<Array>} 删除的评论ID数组
   */
  async deleteComment(commentId) {
    try {
      // 获取所有评论
      const allComments = await this.getAllComments()

      // 找到所有要删除的评论ID（包括回复）
      const idsToDelete = new Set()
      idsToDelete.add(commentId)

      const findReplies = (parentId) => {
        allComments.forEach(comment => {
          if (comment.parent_id === parentId) {
            idsToDelete.add(comment.id)
            findReplies(comment.id)
          }
        })
      }

      findReplies(commentId)

      // 执行删除操作
      const deletedIds = Array.from(idsToDelete)
      for (const id of deletedIds) {
        this.db.run('DELETE FROM comments WHERE id = ?', [id])
      }

      // 保存数据库
      await this.saveDatabase()

      logger.info('[SQLiteCommentService] 删除评论:', deletedIds.length, '条')
      return deletedIds
    } catch (error) {
      logger.error('[SQLiteCommentService] 删除评论失败:', error)
      return []
    }
  }

  /**
   * 更新评论
   * @param {string} commentId - 评论ID
   * @param {Object} updates - 更新内容
   * @returns {Promise<Object>} 更新后的评论
   */
  async updateComment(commentId, updates) {
    try {
      const updateFields = []
      const updateValues = []

      if (updates.author) {
        updateFields.push('author = ?')
        updateValues.push(updates.author.trim())
      }
      if (updates.content) {
        updateFields.push('content = ?')
        updateValues.push(updates.content.trim())
      }
      if (updates.avatar) {
        updateFields.push('avatar = ?')
        updateValues.push(updates.avatar)
      }

      if (updateFields.length === 0) {
        throw new Error('没有提供有效的更新字段')
      }

      updateValues.push(commentId)

      const sql = `UPDATE comments SET ${updateFields.join(', ')} WHERE id = ?`
      this.db.run(sql, updateValues)

      // 保存数据库
      await this.saveDatabase()

      // 返回更新后的评论
      const comment = await this.getCommentById(commentId)
      logger.info('[SQLiteCommentService] 更新评论:', commentId)
      return comment
    } catch (error) {
      logger.error('[SQLiteCommentService] 更新评论失败:', error)
      throw error
    }
  }

  /**
   * 根据ID获取评论
   * @param {string} commentId - 评论ID
   * @returns {Promise<Object|null>} 评论对象或null
   */
  async getCommentById(commentId) {
    try {
      const stmt = this.db.prepare('SELECT * FROM comments WHERE id = ?')
      stmt.bind([commentId])

      let comment = null
      if (stmt.step()) {
        comment = stmt.getAsObject()
      }

      stmt.free()
      return comment
    } catch (error) {
      logger.error('[SQLiteCommentService] 获取评论失败:', error)
      return null
    }
  }

  /**
   * 根据文章ID获取评论
   * @param {number} postId - 文章ID
   * @returns {Promise<Array>} 评论数组
   */
  async getCommentsByPostId(postId) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM comments
        WHERE post_id = ?
        ORDER BY date DESC
      `)
      stmt.bind([postId])

      const comments = []
      while (stmt.step()) {
        comments.push(stmt.getAsObject())
      }

      stmt.free()
      return comments
    } catch (error) {
      logger.error('[SQLiteCommentService] 获取评论失败:', error)
      return []
    }
  }

  /**
   * 根据父评论ID获取回复
   * @param {string} parentId - 父评论ID
   * @returns {Promise<Array>} 回复数组
   */
  async getCommentsByParentId(parentId) {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM comments
        WHERE parent_id = ?
        ORDER BY date ASC
      `)
      stmt.bind([parentId])

      const comments = []
      while (stmt.step()) {
        comments.push(stmt.getAsObject())
      }

      stmt.free()
      return comments
    } catch (error) {
      logger.error('[SQLiteCommentService] 获取回复失败:', error)
      return []
    }
  }

  /**
   * 获取所有评论
   * @returns {Promise<Array>} 所有评论数组
   */
  async getAllComments() {
    try {
      const stmt = this.db.prepare('SELECT * FROM comments ORDER BY date DESC')
      const comments = []

      while (stmt.step()) {
        comments.push(stmt.getAsObject())
      }

      stmt.free()
      return comments
    } catch (error) {
      logger.error('[SQLiteCommentService] 获取所有评论失败:', error)
      return []
    }
  }

  /**
   * 获取评论总数
   * @returns {Promise<number>} 评论总数
   */
  async getCommentCount() {
    try {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM comments')
      const result = stmt.getAsObject()
      stmt.free()
      return result.count
    } catch (error) {
      logger.error('[SQLiteCommentService] 获取评论总数失败:', error)
      return 0
    }
  }

  /**
   * 获取指定文章的评论数
   * @param {number} postId - 文章ID
   * @returns {Promise<number>} 评论数
   */
  async getCommentCountByPostId(postId) {
    try {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?')
      stmt.bind([postId])
      const result = stmt.getAsObject()
      stmt.free()
      return result.count
    } catch (error) {
      logger.error('[SQLiteCommentService] 获取文章评论数失败:', error)
      return 0
    }
  }

  /**
   * 同步数据到SQLite
   * @returns {Promise<void>}
   */
  async syncToSQLite() {
    if (this.isSyncing) {
      logger.info('[SQLiteCommentService] 同步正在进行中，跳过')
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

      logger.info('[SQLiteCommentService] 数据同步成功')
    } catch (error) {
      logger.error('[SQLiteCommentService] 数据同步失败:', error)
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * 批量写入待处理的数据
   * @returns {Promise<void>}
   */
  async flushPendingWrites() {
    const writes = [...this.pendingWrites]
    this.pendingWrites = []

    try {
      // 批量插入数据
      for (const write of writes) {
        const { table, data } = write

        const stmt = this.db.prepare(`
          INSERT INTO comments (
            id, author, content, date, parent_id, post_id, avatar
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `)

        stmt.run([
          data.id,
          data.author,
          data.content,
          data.date,
          data.parent_id,
          data.post_id,
          data.avatar
        ])

        stmt.free()
      }

      logger.info(`[SQLiteCommentService] 批量写入成功: ${writes.length} 条记录`)
    } catch (error) {
      // 如果写入失败，将数据重新放回队列
      this.pendingWrites = [...writes, ...this.pendingWrites]
      throw error
    }
  }

  /**
   * 导出所有评论数据为JSON文件
   * @returns {Promise<void>}
   */
  async exportComments() {
    try {
      const comments = await this.getAllComments()

      // 按文章ID分组评论
      const groupedComments = comments.reduce((acc, comment) => {
        const postId = comment.post_id || 1
        if (!acc[postId]) {
          acc[postId] = []
        }
        acc[postId].push(comment)
        return acc
      }, {})

      // 转换为JSON字符串
      const jsonData = JSON.stringify(groupedComments, null, 2)

      // 创建下载链接
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `blog-comments-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      logger.info('[SQLiteCommentService] 评论导出成功')
    } catch (error) {
      logger.error('[SQLiteCommentService] 导出评论失败:', error)
      throw error
    }
  }

  /**
   * 从JSON文件导入评论数据
   * @param {File} file - JSON文件对象
   * @returns {Promise<number>} 导入的评论数量
   */
  async importComments(file) {
    try {
      const text = await file.text()
      const groupedComments = JSON.parse(text)

      // 将分组的评论转换为数组
      let comments = []
      for (const postId in groupedComments) {
        if (groupedComments.hasOwnProperty(postId)) {
          comments = comments.concat(groupedComments[postId])
        }
      }

      let importedCount = 0
      for (const comment of comments) {
        // 确保评论有必要的字段
        if (comment.author && comment.content) {
          // 生成新的ID，避免冲突
          const newComment = {
            id: this.generateCommentId(),
            author: comment.author,
            content: comment.content,
            date: comment.date || Date.now(),
            parent_id: comment.parent_id || null,
            post_id: comment.post_id || 1,
            avatar: comment.avatar || this.generateAvatarUrl(comment.author)
          }

          await this.addComment(newComment)
          importedCount++
        }
      }

      // 立即同步
      await this.syncToSQLite()

      logger.info('[SQLiteCommentService] 评论导入成功:', importedCount, '条')
      return importedCount
    } catch (error) {
      logger.error('[SQLiteCommentService] 导入评论失败:', error)
      throw error
    }
  }

  /**
   * 从外部JSON文件同步评论
   * @param {string} url - JSON文件的URL
   * @returns {Promise<Object>} 同步结果
   */
  async syncFromJsonFile(url = '/data/comments.json') {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        logger.info('[SQLiteCommentService] 无外部评论文件')
        return { fromJsonCount: 0, conflicts: [] }
      }

      const groupedComments = await response.json()

      let fromJsonCount = 0
      let conflicts = []

      for (const postId in groupedComments) {
        if (groupedComments.hasOwnProperty(postId)) {
          const existingComments = await this.getCommentsByPostId(postId)
          const newComments = groupedComments[postId]

          for (const newComment of newComments) {
            const exists = existingComments.some(c =>
              c.author === newComment.author &&
              c.content === newComment.content
            )

            if (!exists) {
              const comment = {
                id: this.generateCommentId(),
                author: newComment.author,
                content: newComment.content,
                date: newComment.date || Date.now(),
                parent_id: newComment.parent_id || null,
                post_id: newComment.post_id || postId,
                avatar: newComment.avatar || this.generateAvatarUrl(newComment.author)
              }
              await this.addComment(comment)
              fromJsonCount++
            } else {
              conflicts.push({
                postId,
                author: newComment.author,
                content: newComment.content
              })
            }
          }
        }
      }

      // 立即同步
      await this.syncToSQLite()

      logger.info('[SQLiteCommentService] 同步完成:', { fromJsonCount, conflicts })
      return { fromJsonCount, conflicts }
    } catch (error) {
      logger.error('[SQLiteCommentService] 同步失败:', error)
      return { fromJsonCount: 0, conflicts: [] }
    }
  }

  /**
   * 清除所有评论数据
   * @returns {Promise<void>}
   */
  async clearAllComments() {
    try {
      this.db.run('DELETE FROM comments')
      localStorage.removeItem(this.localStorageKey)
      logger.info('[SQLiteCommentService] 清除所有评论成功')
    } catch (error) {
      logger.error('[SQLiteCommentService] 清除所有评论失败:', error)
      throw error
    }
  }

  /**
   * 销毁服务
   * @returns {Promise<void>}
   */
  async destroy() {
    if (this.db) {
      // 保存数据库
      await this.saveDatabase()
      this.db.close()
      this.db = null
    }
    this.isInitialized = false
    logger.info('[SQLiteCommentService] 服务已销毁')
  }
}

export default new SQLiteCommentService()
