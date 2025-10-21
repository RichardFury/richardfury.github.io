<template>
  <div class="sidebar">
    <div class="sidebar-header">Articles</div>
    <div class="sidebar-content">
      <div v-for="post in posts" :key="post.id" class="sidebar-item" @click="$emit('selectPost', post.id)">
        {{ post.title }}
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
.sidebar {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  background: var(--card-bg-color);
  border-radius: 16px;
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
}
</style>