// 数据库服务 - 使用IndexedDB进行浏览器端持久化存储

class CommentDatabase {
  constructor() {
    this.dbName = 'blog-comments-db';
    this.storeName = 'comments';
    this.db = null;
  }

  // 打开数据库连接
  async openDatabase() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      const request = indexedDB.open(this.dbName, 1);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建评论对象存储空间
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          // 创建索引以提高按postId查询的性能
          store.createIndex('by_postId', 'postId', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('打开数据库失败:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  // 获取指定文章的所有评论
  async getComments(postId) {
    try {
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const index = store.index('by_postId');
        const request = index.getAll(postId);

        request.onsuccess = () => {
          // 按日期降序排序
          const sortedComments = request.result.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          resolve(sortedComments);
        };

        request.onerror = () => {
          console.error('获取评论失败:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('获取评论失败:', error);
      return [];
    }
  }

  // 添加新评论
  async addComment(postId, comment) {
    try {
      const db = await this.openDatabase();
      const newComment = {
        id: Date.now().toString(),
        postId,
        content: comment.content,
        author: comment.author || '匿名用户',
        date: new Date().toISOString()
      };

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(newComment);

        request.onsuccess = () => {
          resolve(newComment);
        };

        request.onerror = () => {
          console.error('添加评论失败:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('添加评论失败:', error);
      throw error;
    }
  }
}

// 创建单例实例
const commentDB = new CommentDatabase();

// 导出方法
export const getComments = (postId) => commentDB.getComments(postId);
export const addComment = (postId, comment) => commentDB.addComment(postId, comment);

export default commentDB;