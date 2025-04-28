<template>
  <div class="content">
    <h1 style="font-family: 'SimSun', serif;">随笔</h1>
    <div class="thought-list">
      <div v-for="post in posts" :key="post.id" class="thought-item">
        <h2>{{ post.title }}</h2>
        <p class="post-date">{{ post.date }}</p>
        <p class="post-content">{{ post.content }}</p>
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