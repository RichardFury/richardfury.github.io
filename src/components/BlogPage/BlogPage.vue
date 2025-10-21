<template>
  <div class="thought-container">
    <!-- 博客列表视图 -->
    <div v-if="!selectedPostId" class="main-grid">
      <div class="content-section">
        <ContentComponent :posts="currentPagePosts" @selectPost="viewPost" />
        <!-- 分页控件 -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            class="pagination-btn" 
            @click="goToPage(currentPage - 1)" 
            :disabled="currentPage === 1"
          >
            上一页
          </button>
          
          <span class="pagination-info">
            第 {{ currentPage }} 页 / 共 {{ totalPages }} 页
          </span>
          
          <button 
            class="pagination-btn" 
            @click="goToPage(currentPage + 1)" 
            :disabled="currentPage === totalPages"
          >
            下一页
          </button>
        </div>
      </div>
      <ArticleListComponent :posts="posts" @selectPost="viewPost" />
    </div>
    
    <!-- 博客详情视图 -->
    <div v-else class="post-detail">
      <button class="back-button" @click="backToList">&larr; 返回列表</button>
      <BlogDetailComponent 
        :post="selectedPost" 
        :comments="postComments" 
        @add-comment="handleAddComment" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import ArticleListComponent from './ArticleListComponent.vue';
import ContentComponent from './ContentComponent.vue';
import BlogDetailComponent from './BlogDetailComponent.vue';
import { getBlogPosts, getBlogPost, getComments, addComment } from '../../services/blogService.js';

const posts = ref([]);
const selectedPostId = ref(null);
const postComments = ref([]);
const currentPage = ref(1);
const postsPerPage = ref(5); // 每页显示的文章数量

// 当前选中的博客文章
const selectedPost = computed(() => {
  if (!selectedPostId.value) return null;
  return posts.value.find(post => post.id === selectedPostId.value) || null;
});

// 总页数
const totalPages = computed(() => {
  return Math.ceil(posts.value.length / postsPerPage.value);
});

// 当前页的文章
const currentPagePosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage.value;
  const end = start + postsPerPage.value;
  return posts.value.slice(start, end);
});

// 跳转到指定页
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
};

// 获取所有博客文章
onMounted(async () => {
  try {
    posts.value = await getBlogPosts();
  } catch (error) {
    console.error('Failed to load blog posts:', error);
  }
});

// 查看博客详情
const viewPost = async (postId) => {
  selectedPostId.value = postId;
  // 加载评论
  try {
    postComments.value = await getComments(postId);
  } catch (error) {
    console.error('Failed to load comments:', error);
    postComments.value = [];
  }
};

// 返回博客列表
const backToList = () => {
  selectedPostId.value = null;
};

// 添加评论
const handleAddComment = async (comment) => {
  if (!selectedPostId.value || !comment.content) return;
  
  try {
    const newComment = await addComment(selectedPostId.value, comment);
    postComments.value.push(newComment);
  } catch (error) {
    console.error('Failed to add comment:', error);
  }
};
</script>

<style scoped>
.thought-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.main-grid {
  display: grid;
  grid-template-columns: 1fr 250px;
  gap: 40px;
  align-items: start;
  min-height: calc(100vh - 160px);
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 分页控件样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
  padding: 20px 0;
}

.pagination-btn {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary-hover-color);
}

.pagination-btn:disabled {
  background: var(--disabled-bg-color);
  cursor: not-allowed;
}

.pagination-info {
  color: var(--text-color);
  font-size: 0.9em;
}

/* 博客详情页面样式 */
.post-detail {
  max-width: 800px;
  margin: 0 auto;
}

.back-button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1em;
  cursor: pointer;
  margin-bottom: 30px;
  transition: background 0.3s ease;
}

.back-button:hover {
  background: var(--primary-color-dark);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .thought-container {
    padding: 20px;
  }
  
  .main-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}
</style>