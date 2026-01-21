<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { processMarkdown } from '../../utils/markdownProcessor';
import { useBlogPosts } from '../../composables/useBlogPosts';
import CommentsSection from './CommentsSection.vue';
import { logger } from '../../utils/logger';

const route = useRoute();
const postId = route.params.id;
const { getBlogPostById, fetchBlogPosts } = useBlogPosts();

const post = ref(null);
const processedContent = ref('');
const loading = ref(true);
const error = ref(null);

onMounted(async () => {
  try {
    await fetchBlogPosts();
    const postData = await getBlogPostById(postId);
    logger.debug('Post data received:', postData);
    if (postData) {
      post.value = postData;
      logger.debug('Post content:', postData.content);
      processedContent.value = processMarkdown(postData.content);
      logger.debug('Processed content:', processedContent.value);
    } else {
      logger.debug('Post not found for ID:', postId);
    }
  } catch (err) {
    error.value = err.message;
    logger.error('Error loading blog post:', err);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <section class="blog-detail">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-button">
        <router-link to="/blog" class="btn btn-secondary">← Back to Blog</router-link>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <p>Loading blog post...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p>Error loading blog post: {{ error }}</p>
      </div>
      
      <!-- 文章标题区域 -->
      <div v-if="post" class="blog-detail-header glass-effect">
        <h1 class="blog-detail-title">{{ post.title }}</h1>
        <div class="blog-detail-meta">
          <span class="post-category">{{ post.category }}</span>
          <span class="post-date">{{ post.date }}</span>
          <span class="post-read-time">{{ post.readTime }}</span>
        </div>
        <div class="blog-detail-image">
          <img :src="post.image" :alt="post.title" class="detail-image">
        </div>
      </div>
      
      <!-- 文章内容 -->
      <div v-if="post" class="blog-detail-content card">
        <div class="markdown-content" v-html="processedContent"></div>
      </div>
      
      <!-- 文章不存在状态 -->
      <div v-else class="empty-state">
        <p>Blog post not found.</p>
      </div>
      
      <!-- 作者信息 -->
      <div v-if="post" class="author-info glass-effect">
        <div class="author-avatar">
          <img src="https://picsum.photos/id/1005/100/100" alt="Richard Fury" class="avatar-img">
        </div>
        <div class="author-details">
          <h3 class="author-name">About Author</h3>
          <p class="author-bio">Richard Fury is a science researcher and landscape shutter exploring intersection of art, technology, and science.</p>
        </div>
      </div>
      
      <!-- 评论区 -->
      <CommentsSection v-if="post" :post-id="post.id" />
    </div>
  </section>
</template>

<style scoped>
.blog-detail {
  padding: var(--spacing-2xl) 0;
}

/* 返回按钮 */
.back-button {
  margin-bottom: var(--spacing-xl);
}

/* 加载和错误状态 */
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: var(--spacing-2xl);
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.error-state {
  color: var(--error-color);
}

/* 文章标题区域 */
.blog-detail-header {
  padding: var(--spacing-3xl) var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
  text-align: center;
}

.blog-detail-title {
  font-size: 2.5rem;
  margin-bottom: var(--spacing-lg);
  font-weight: 300;
}

.blog-detail-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-2xl);
  font-size: 0.9rem;
}

.blog-detail-image {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.detail-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

/* 文章内容 */
.blog-detail-content {
  max-width: 800px;
  margin: 0 auto var(--spacing-3xl);
  padding: var(--spacing-3xl);
}

/* Markdown内容样式 */
.markdown-content {
  line-height: 1.8;
  color: var(--text-primary);
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin-top: var(--spacing-2xl);
  margin-bottom: var(--spacing-lg);
  font-weight: 400;
  color: var(--text-primary);
}

.markdown-content h1 {
  font-size: 2rem;
}

.markdown-content h2 {
  font-size: 1.75rem;
  border-bottom: 1px solid var(--glass-border);
  padding-bottom: var(--spacing-sm);
}

.markdown-content h3 {
  font-size: 1.5rem;
}

.markdown-content p {
  margin-bottom: var(--spacing-lg);
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: var(--spacing-lg);
  padding-left: var(--spacing-2xl);
}

.markdown-content li {
  margin-bottom: var(--spacing-sm);
}

.markdown-content a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color var(--transition-normal);
}

.markdown-content a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.markdown-content blockquote {
  border-left: 4px solid var(--accent-color);
  padding-left: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  font-style: italic;
  color: var(--text-secondary);
}

.markdown-content code {
  background-color: var(--glass-bg);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
}

.markdown-content pre {
  background-color: var(--glass-bg);
  padding: var(--spacing-lg);
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: var(--spacing-lg);
}

.markdown-content pre code {
  padding: 0;
  background-color: transparent;
}

/* 作者信息 */
.author-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-2xl);
  max-width: 800px;
  margin: 0 auto;
}

@media (max-width: 768px) {
  .author-info {
    flex-direction: column;
    text-align: center;
  }
}

.author-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.author-name {
  margin-bottom: var(--spacing-sm);
  font-size: 1.25rem;
}

.author-bio {
  margin: 0;
  color: var(--text-secondary);
}
</style>
