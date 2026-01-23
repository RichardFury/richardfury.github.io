<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBlogPosts } from '../../composables/useBlogPosts';
import { logger } from '../../utils/logger';

const { blogPosts, loading, error, fetchBlogPosts } = useBlogPosts();

const postsPerPage = 4;
const currentPage = ref(1);

const totalPages = computed(() => {
  return Math.ceil(blogPosts.value.length / postsPerPage);
});

const displayedPosts = computed(() => {
  const startIndex = (currentPage.value - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  return blogPosts.value.slice(startIndex, endIndex);
});

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

function goToPage(page) {
  currentPage.value = page;
}

function handleReadMore(postId) {
  logger.debug('[BlogPage] Read More clicked for post ID:', postId);
  logger.debug('[BlogPage] Post object:', postId);
}

onMounted(() => {
  fetchBlogPosts();
  logger.debug('[BlogPage] Blog posts loaded:', blogPosts.value.length);
});
</script>

<template>
  <section class="blog-page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header glass-effect">
        <h1 class="page-title">Blog</h1>
        <p class="page-subtitle">Thoughts, insights, and creative explorations</p>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <p>Loading blog posts...</p>
      </div>
      
      <!-- Error State -->
      <div v-else-if="error" class="error-state">
        <p>Error loading blog posts: {{ error }}</p>
      </div>
      
      <!-- Empty State -->
      <div v-else-if="blogPosts.length === 0" class="empty-state">
        <p>No blog posts available.</p>
      </div>
      
      <!-- Blog Posts Grid -->
      <template v-else>
        <div class="blog-posts grid grid-2">
          <article 
            v-for="post in displayedPosts" 
            :key="post.id"
            class="blog-post card"
          >
            <div class="blog-post-image">
              <img :src="post.image" :alt="post.title" class="post-image">
            </div>
            <div class="blog-post-content">
              <div class="blog-post-meta">
                <span class="post-category">{{ post.category }}</span>
                <span class="post-date">{{ post.date }}</span>
                <span class="post-read-time">{{ post.readTime }}</span>
              </div>
              <h2 class="blog-post-title">{{ post.title }}</h2>
              <p class="blog-post-excerpt">{{ post.excerpt }}</p>
              <div class="blog-post-footer">
                <router-link :to="`/blog/${post.id}`" class="btn btn-secondary" @click="handleReadMore(post.id)">Read More</router-link>
              </div>
            </div>
          </article>
        </div>
        
        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            class="btn btn-secondary" 
            @click="prevPage" 
            :disabled="currentPage === 1"
          >
            Previous
          </button>
          <button 
            v-for="page in totalPages" 
            :key="page"
            class="btn" 
            :class="{ 'active': page === currentPage }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button 
            class="btn btn-secondary" 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
          >
            Next
          </button>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.blog-page {
  padding: var(--spacing-2xl) 0;
}

/* Page Header */
.page-header {
  padding: var(--spacing-3xl) var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
  text-align: center;
  animation: fadeIn var(--transition-slow) ease;
}

.page-title {
  font-size: 3rem;
  margin-bottom: var(--spacing-sm);
  font-weight: 200;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }
}

.page-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  margin: 0;
  font-weight: 300;
}

/* Blog Posts Grid */
.blog-posts {
  margin-bottom: var(--spacing-3xl);
}

/* Blog Post Card */
.blog-post {
  overflow: hidden;
  transition: all var(--transition-normal);
  animation: fadeIn var(--transition-slow) ease forwards;
}

.blog-post:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.blog-post-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  margin-bottom: var(--spacing-lg);
}

.post-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.blog-post:hover .post-image {
  transform: scale(1.05);
}

/* Blog Post Content */
.blog-post-meta {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.post-category {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.blog-post-title {
  font-size: 1.5rem;
  margin-bottom: var(--spacing-md);
  font-weight: 400;
  transition: color var(--transition-normal);
}

.blog-post:hover .blog-post-title {
  color: var(--accent-primary);
}

.blog-post-excerpt {
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  line-height: 1.6;
}

.blog-post-footer {
  display: flex;
  justify-content: flex-start;
}

/* Loading, Error, and Empty States */
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

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.pagination .btn {
  min-width: 40px;
  text-align: center;
  padding: var(--spacing-sm) var(--spacing-md);
}

.pagination .btn.active {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.pagination .btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination .btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* Animation Delay */
.blog-post:nth-child(1) {
  animation-delay: 0.1s;
}

.blog-post:nth-child(2) {
  animation-delay: 0.2s;
}

.blog-post:nth-child(3) {
  animation-delay: 0.3s;
}

.blog-post:nth-child(4) {
  animation-delay: 0.4s;
}
</style>
