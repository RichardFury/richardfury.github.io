<template>
  <div class="content">
    <h1 style="font-family: 'SimSun', serif;">Thoughts</h1>
    <div class="thought-list">
      <div v-for="post in posts" :key="post.id" class="thought-item">
        <div class="post-header">
          <h2 @click="selectPost(post.id)" class="post-title">{{ post.title }}</h2>
          <span v-if="post.pinned" class="pinned-badge">置顶</span>
        </div>
        <p class="post-date">{{ formatDate(post.date) }}</p>
        <div class="post-excerpt">{{ getExcerpt(post.content) }}</div>
        <button @click="selectPost(post.id)" class="read-more">阅读全文</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  posts: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['selectPost']);

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 获取摘要
const getExcerpt = (content) => {
  // 移除markdown标记
  const plainText = content.replace(/#{1,6}\s+/g, '').replace(/```[\s\S]*?```/g, '').replace(/`([^`]+)`/g, '$1');
  // 返回前150个字符作为摘要
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
};

// 选择文章
const selectPost = (postId) => {
  emit('selectPost', postId);
};
</script>

<style scoped>
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

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.pinned-badge {
  background: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8em;
  font-weight: bold;
}

.post-date {
  color: var(--text-secondary-color);
  font-size: 0.9em;
  margin: 5px 0 15px;
}

.post-title {
  font-size: 1.8em;
  margin-bottom: 10px;
  color: var(--text-color);
  cursor: pointer;
  transition: color 0.3s ease;
}

.post-title:hover {
  color: var(--primary-color);
}

.post-excerpt {
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 15px;
}

.read-more {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.9em;
  cursor: pointer;
  transition: background 0.3s ease;
}

.read-more:hover {
  background: var(--primary-color-dark);
}
</style>