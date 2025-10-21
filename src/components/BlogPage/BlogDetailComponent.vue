<template>
  <div v-if="post" class="blog-detail">
    <!-- 博客正文 -->
    <div class="post-content">
      <h1>{{ post.title }}</h1>
      <div class="post-meta">
        <span class="post-date">{{ formatDate(post.date) }}</span>
        <span class="post-category">分类：{{ post.category }}</span>
        <div class="post-tags">
          标签：
          <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
      <div class="markdown-content" v-html="renderedContent"></div>
    </div>
    
    <!-- 评论区域 -->
    <div class="comments-section">
      <h2>评论 ({{ comments.length }})</h2>
      
      <!-- 评论表单 -->
      <div class="comment-form">
        <h3>发表评论</h3>
        <div class="form-group">
          <label for="author">昵称：</label>
          <input 
            id="author" 
            v-model="commentForm.author" 
            type="text" 
            placeholder="请输入昵称" 
          />
        </div>
        <div class="form-group">
          <label for="content">评论内容：</label>
          <textarea 
            id="content" 
            v-model="commentForm.content" 
            rows="4" 
            placeholder="请输入评论内容..." 
          ></textarea>
        </div>
        <button 
          class="submit-comment" 
          @click="submitComment" 
          :disabled="!commentForm.content.trim()"
        >
          提交评论
        </button>
      </div>
      
      <!-- 评论列表 -->
      <div class="comments-list">
        <div v-if="comments.length === 0" class="no-comments">暂无评论，来发表第一条评论吧！</div>
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author }}</span>
            <span class="comment-date">{{ formatDate(comment.date) }}</span>
          </div>
          <div class="comment-body">{{ comment.content }}</div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">加载中...</div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  comments: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['add-comment']);

const commentForm = ref({
  author: '',
  content: ''
});

// 简单的markdown渲染（在实际项目中可以使用markdown-it等库）
const renderedContent = computed(() => {
  if (!props.post || !props.post.content) return '';
  
  let html = props.post.content;
  
  // 处理标题
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  
  // 处理段落
  html = html.replace(/^(?!<h[1-6]|```|$)(.*$)/gm, '<p>$1</p>');
  
  // 处理代码块
  html = html.replace(/```([\s\S]*?)```/gm, '<pre><code>$1</code></pre>');
  
  // 处理行内代码
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // 处理列表
  html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');
  html = html.replace(/<\/li>\s*<li>/g, '</li><li>');
  html = html.replace(/<li>(.*)<\/li>/g, '<ul>$&</ul>');
  
  return html;
});

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 提交评论
const submitComment = () => {
  if (!commentForm.value.content.trim()) return;
  
  emit('add-comment', {
    author: commentForm.value.author || '匿名用户',
    content: commentForm.value.content.trim()
  });
  
  // 重置表单
  commentForm.value.content = '';
};
</script>

<style scoped>
.blog-detail {
  max-width: 800px;
  margin: 0 auto;
}

.post-content {
  background: var(--card-bg-color);
  border-radius: 8px;
  padding: 40px;
  margin-bottom: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-content h1 {
  font-size: 2.5em;
  margin-bottom: 20px;
  color: var(--text-color);
}

.post-meta {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.post-date,
.post-category {
  display: inline-block;
  margin-right: 20px;
  color: var(--text-secondary-color);
  font-size: 0.9em;
}

.post-tags {
  margin-top: 10px;
}

.tag {
  display: inline-block;
  background: var(--primary-color-light);
  color: var(--primary-color);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.85em;
  margin-right: 8px;
  margin-top: 5px;
}

.markdown-content {
  line-height: 1.8;
  color: var(--text-color);
}

.markdown-content h2 {
  font-size: 1.8em;
  margin: 30px 0 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.markdown-content h3 {
  font-size: 1.4em;
  margin: 25px 0 15px;
}

.markdown-content p {
  margin-bottom: 20px;
}

.markdown-content pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 6px;
  overflow-x: auto;
  margin-bottom: 20px;
}

.markdown-content code {
  background: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', Courier, monospace;
}

.markdown-content pre code {
  background: none;
  padding: 0;
}

.markdown-content ul {
  margin-bottom: 20px;
  padding-left: 20px;
}

.markdown-content li {
  margin-bottom: 8px;
}

.comments-section {
  background: var(--card-bg-color);
  border-radius: 8px;
  padding: 40px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comments-section h2 {
  font-size: 1.8em;
  margin-bottom: 30px;
}

.comment-form {
  margin-bottom: 40px;
  padding-bottom: 30px;
  border-bottom: 1px solid var(--border-color);
}

.comment-form h3 {
  font-size: 1.3em;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-color);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--input-bg-color);
  color: var(--text-color);
  font-size: 1em;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.submit-comment {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-comment:hover:not(:disabled) {
  background: var(--primary-color-dark);
}

.submit-comment:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.comments-list {
  margin-top: 30px;
}

.no-comments {
  text-align: center;
  color: var(--text-secondary-color);
  padding: 40px 0;
}

.comment-item {
  padding: 20px 0;
  border-bottom: 1px solid var(--border-color);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.comment-author {
  font-weight: bold;
  color: var(--text-color);
}

.comment-date {
  color: var(--text-secondary-color);
  font-size: 0.9em;
}

.comment-body {
  line-height: 1.6;
  color: var(--text-color);
}

.loading {
  text-align: center;
  padding: 100px;
  color: var(--text-secondary-color);
}
</style>