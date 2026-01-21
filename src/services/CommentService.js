/**
 * 统一评论服务类
 * 使用SQLite + localStorage混合存储架构
 * SQLite: 主存储，用于持久化所有评论（独立的blog-comments.db数据库）
 * localStorage: 缓存层，用于快速访问最近评论
 */

import SQLiteCommentService from './SQLiteCommentService.js'
import { logger } from '../utils/logger'

class CommentService {
  constructor() {
    this.CACHE_KEY_PREFIX = 'comments:cache:'
    this.PREFERENCES_KEY = 'comments:preferences'
    this.DRAFTS_KEY = 'comments:drafts'
    this.CACHE_MAX_POSTS = 10
    this.CACHE_MAX_AGE = 5 * 60 * 1000 // 5分钟
    this.sqliteService = SQLiteCommentService
  }

  /**
   * 初始化服务
   * @returns {Promise<void>}
   */
  async init() {
    await this.sqliteService.init()
    logger.info('[CommentService] 服务已初始化')
  }

  /**
   * 加载评论（优先从缓存读取）
   * @param {number} postId - 文章ID
   * @returns {Promise<Array>} 评论数组
   */
  async loadComments(postId) {
    try {
      const cacheKey = this.CACHE_KEY_PREFIX + postId
      const cached = this.getFromCache(cacheKey)

      if (cached && Date.now() - cached.timestamp < this.CACHE_MAX_AGE) {
        logger.info('[CommentService] 从缓存加载评论:', postId)
        return cached.comments
      }

      logger.info('[CommentService] 从SQLite加载评论:', postId)
      const comments = await this.sqliteService.getCommentsByPostId(postId)
      
      this.setCache(cacheKey, comments)
      return comments
    } catch (error) {
      logger.error('[CommentService] 加载评论失败:', error)
      return []
    }
  }

  /**
   * 添加新评论
   * @param {Object} commentData - 评论数据
   * @returns {Promise<Object>} 新添加的评论
   */
  async addComment(commentData) {
    try {
      const comment = await this.sqliteService.addComment(commentData)
      
      const cacheKey = this.CACHE_KEY_PREFIX + commentData.postId
      this.invalidateCache(cacheKey)
      
      return comment
    } catch (error) {
      logger.error('[CommentService] 添加评论失败:', error)
      throw error
    }
  }

  /**
   * 删除评论
   * @param {string} commentId - 评论ID
   * @returns {Promise<Array>} 删除的评论ID数组
   */
  async deleteComment(commentId) {
    try {
      const deletedIds = await this.sqliteService.deleteComment(commentId)

      // 清除所有缓存，因为删除可能影响多个文章
      this.clearCache()

      return deletedIds
    } catch (error) {
      logger.error('[CommentService] 删除评论失败:', error)
      return []
    }
  }

  /**
   * 更新评论
   * @param {number} commentId - 评论ID
   * @param {Object} updates - 更新内容
   * @returns {Promise<Object>} 更新后的评论
   */
  async updateComment(commentId, updates) {
    try {
      const comment = await this.sqliteService.updateComment(commentId, updates)
      
      const cacheKey = this.CACHE_KEY_PREFIX + comment.postId
      this.invalidateCache(cacheKey)
      
      return comment
    } catch (error) {
      logger.error('[CommentService] 更新评论失败:', error)
      throw error
    }
  }

  /**
   * 获取指定评论的直接回复
   * @param {Array} comments - 所有评论
   * @param {string} parentId - 父评论ID
   * @returns {Array} 直接回复数组
   */
  getReplies(comments, parentId) {
    return comments.filter(comment => comment.parent_id === parentId)
  }

  /**
   * 获取指定评论的所有回复（包括嵌套回复）
   * @param {Array} comments - 所有评论
   * @param {string} parentId - 父评论ID
   * @returns {Array} 所有回复数组
   */
  getAllReplies(comments, parentId) {
    const allReplies = []
    const directReplies = this.getReplies(comments, parentId)

    directReplies.forEach(reply => {
      allReplies.push(reply)
      const nestedReplies = this.getAllReplies(comments, reply.id)
      allReplies.push(...nestedReplies)
    })

    return allReplies
  }

  /**
   * 检查用户是否为作者
   * @param {string} name - 用户名
   * @returns {boolean} 是否为作者
   */
  isAuthor(name) {
    const preferences = this.getPreferences()
    return preferences.authorName === name
  }

  /**
   * 获取父评论的作者
   * @param {Array} comments - 所有评论
   * @param {number} parentId - 父评论ID
   * @returns {string} 父评论作者名
   */
  getParentAuthor(comments, parentId) {
    const parent = comments.find(comment => comment.id === parentId)
    return parent ? parent.author : ''
  }

  /**
   * 格式化日期为相对时间
   * @param {number|string} date - 时间戳（整数）或ISO格式的日期字符串
   * @returns {string} 格式化后的相对时间
   */
  formatDate(date) {
    const timestamp = typeof date === 'number' ? date : new Date(date).getTime()
    const now = Date.now()
    const diff = now - timestamp

    if (diff < 60000) {
      return 'Just now'
    } else if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000)
      return `${minutes}m ago`
    } else if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000)
      return `${hours}h ago`
    } else {
      const days = Math.floor(diff / 86400000)
      return `${days}d ago`
    }
  }

  /**
   * 从JSON文件导入评论
   * @param {File} file - JSON文件对象
   * @returns {Promise<number>} 导入的评论数量
   */
  async importFromJsonFile(file) {
    try {
      const text = await file.text()
      const groupedComments = JSON.parse(text)
      
      let comments = []
      for (const postId in groupedComments) {
        if (groupedComments.hasOwnProperty(postId)) {
          comments = comments.concat(groupedComments[postId])
        }
      }
      
      let importedCount = 0
      for (const comment of comments) {
        await this.sqliteService.addComment(comment)
        importedCount++
      }
      
      const cacheKey = this.CACHE_KEY_PREFIX + 'all'
      this.clearCache()
      
      return importedCount
    } catch (error) {
      logger.error('[CommentService] 导入评论失败:', error)
      throw error
    }
  }

  /**
   * 导出评论到JSON文件
   * @returns {Promise<void>}
   */
  async exportToJsonFile() {
    try {
      const comments = await this.sqliteService.getAllComments()

      const groupedComments = comments.reduce((acc, comment) => {
        const postId = comment.post_id || 1
        if (!acc[postId]) {
          acc[postId] = []
        }
        acc[postId].push(comment)
        return acc
      }, {})

      const jsonData = JSON.stringify(groupedComments, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `blog-comments-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      logger.info('[CommentService] 评论导出成功')
    } catch (error) {
      logger.error('[CommentService] 导出评论失败:', error)
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
        logger.info('[CommentService] 无外部评论文件')
        return { fromJsonCount: 0, conflicts: [] }
      }
      
      const groupedComments = await response.json()
      
      let fromJsonCount = 0
      let conflicts = []
      
      for (const postId in groupedComments) {
        if (groupedComments.hasOwnProperty(postId)) {
          const existingComments = await this.sqliteService.getCommentsByPostId(postId)
          const newComments = groupedComments[postId]
          
          for (const newComment of newComments) {
            const exists = existingComments.some(c => 
              c.author === newComment.author && 
              c.content === newComment.content
            )
            
            if (!exists) {
              await this.sqliteService.addComment(newComment)
              fromJsonCount++
            } else {
              conflicts.push({
                postId,
                author: newComment.author,
                content: newComment.content
              })
            }
          }
          
          const cacheKey = this.CACHE_KEY_PREFIX + postId
          this.invalidateCache(cacheKey)
        }
      }
      
      logger.info('[CommentService] 同步完成:', { fromJsonCount, conflicts })
      return { fromJsonCount, conflicts }
    } catch (error) {
      logger.error('[CommentService] 同步失败:', error)
      return { fromJsonCount: 0, conflicts: [] }
    }
  }

  /**
   * 获取用户偏好设置
   * @returns {Object} 用户偏好设置
   */
  getPreferences() {
    try {
      const preferences = localStorage.getItem(this.PREFERENCES_KEY)
      return preferences ? JSON.parse(preferences) : {
        authorName: 'Richard Fury',
        autoExpand: true,
        showAvatars: true,
        dateFormat: 'relative'
      }
    } catch (error) {
      logger.error('[CommentService] 获取偏好设置失败:', error)
      return {
        authorName: 'Richard Fury',
        autoExpand: true,
        showAvatars: true,
        dateFormat: 'relative'
      }
    }
  }

  /**
   * 保存用户偏好设置
   * @param {Object} preferences - 用户偏好设置
   */
  setPreferences(preferences) {
    try {
      localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences))
    } catch (error) {
      logger.error('[CommentService] 保存偏好设置失败:', error)
    }
  }

  /**
   * 获取草稿评论
   * @param {number} postId - 文章ID
   * @returns {string} 草稿内容
   */
  getDraft(postId) {
    try {
      const draftsData = localStorage.getItem(this.DRAFTS_KEY)
      const drafts = draftsData ? JSON.parse(draftsData) : {}
      return drafts[postId] || ''
    } catch (error) {
      logger.error('[CommentService] 获取草稿失败:', error)
      return ''
    }
  }

  /**
   * 保存草稿评论
   * @param {number} postId - 文章ID
   * @param {string} content - 草稿内容
   */
  setDraft(postId, content) {
    try {
      const drafts = localStorage.getItem(this.DRAFTS_KEY)
      const parsedDrafts = drafts ? JSON.parse(drafts) : {}
      parsedDrafts[postId] = content
      
      localStorage.setItem(this.DRAFTS_KEY, JSON.stringify(parsedDrafts))
    } catch (error) {
      logger.error('[CommentService] 保存草稿失败:', error)
    }
  }

  /**
   * 从缓存读取评论
   * @param {string} cacheKey - 缓存键
   * @returns {Object|null} 缓存的评论数据
   */
  getFromCache(cacheKey) {
    try {
      const cached = localStorage.getItem(cacheKey)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      logger.error('[CommentService] 读取缓存失败:', error)
      return null
    }
  }

  /**
   * 设置缓存
   * @param {string} cacheKey - 缓存键
   * @param {Array} comments - 评论数组
   */
  setCache(cacheKey, comments) {
    try {
      const cached = {
        comments,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cached))
      
      this.cleanOldCache()
    } catch (error) {
      logger.error('[CommentService] 设置缓存失败:', error)
    }
  }

  /**
   * 使缓存失效
   * @param {string} cacheKey - 缓存键
   */
  invalidateCache(cacheKey) {
    try {
      localStorage.removeItem(cacheKey)
    } catch (error) {
      logger.error('[CommentService] 使缓存失效失败:', error)
    }
  }

  /**
   * 清理旧缓存
   */
  cleanOldCache() {
    try {
      const keys = Object.keys(localStorage)
      const now = Date.now()
      
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY_PREFIX)) {
          const cached = localStorage.getItem(key)
          if (cached) {
            const data = JSON.parse(cached)
            if (now - data.timestamp > this.CACHE_MAX_AGE) {
              localStorage.removeItem(key)
            }
          }
        }
      })
      
      this.cleanCacheKeys()
    } catch (error) {
      logger.error('[CommentService] 清理旧缓存失败:', error)
    }
  }

  /**
   * 清理缓存键（保持最多CACHE_MAX_POSTS个文章的缓存）
   */
  cleanCacheKeys() {
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX))
      
      if (cacheKeys.length > this.CACHE_MAX_POSTS) {
        const keyTimestamps = cacheKeys.map(key => {
          const cached = localStorage.getItem(key)
          const data = cached ? JSON.parse(cached) : { timestamp: 0 }
          return { key, timestamp: data.timestamp }
        })
        
        keyTimestamps.sort((a, b) => b.timestamp - a.timestamp)
        
        const keysToRemove = keyTimestamps.slice(this.CACHE_MAX_POSTS)
        keysToRemove.forEach(({ key }) => {
          localStorage.removeItem(key)
        })
      }
    } catch (error) {
      logger.error('[CommentService] 清理缓存键失败:', error)
    }
  }

  /**
   * 清除所有缓存
   */
  clearCache() {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      logger.error('[CommentService] 清除缓存失败:', error)
    }
  }
}

export default new CommentService()
