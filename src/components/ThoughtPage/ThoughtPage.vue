<template>
  <div class="thought-container">
    <div class="main-grid">
      <ArticleListComponent :posts="posts" @selectPost="scrollToPost" />
      <ContentComponent :posts="posts" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ArticleListComponent from './ArticleListComponent.vue';
import ContentComponent from './ContentComponent.vue';

const posts = ref([]);

// TODO: 添加获取博客内容的逻辑
</script>

<style scoped>
.sidebar {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  background: var(--card-bg-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-header {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 15px;
  color: var(--text-color);
}

.sidebar-content {
  max-height: 60vh;
  overflow-y: auto;
}

.sidebar-item {
  padding: 8px 12px;
  margin: 5px 0;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-color);
  transition: background 0.3s ease;
}

.sidebar-item:hover {
  background: var(--hover-bg-color);
}

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

.content {
  max-width: 800px;
}

.thought-list {
  margin-top: 30px;
}

.thought-item {
  background: var(--card-bg-color);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.post-date {
  color: var(--text-secondary-color);
  font-size: 0.9em;
  margin: 5px 0 15px;
}

.post-content {
  line-height: 1.6;
  color: var(--text-color);
}
</style>