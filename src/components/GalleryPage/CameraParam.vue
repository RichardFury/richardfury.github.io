<template>
  <div class="camera-param">
    <span class="param-label">{{ label }}:</span>
    <span class="param-value">{{ value || '未知' }}</span>
  </div>
</template>

<script setup>
// 定义组件的props
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    default: null
  }
});
</script>

<style scoped>
.camera-param {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
}

.param-label {
  font-weight: 500;
  color: #777;
  font-size: 14px;
}

[data-theme='dark'] .param-label {
  color: rgba(255, 255, 255, 0.7);
}

.param-value {
  color: var(--text-color);
  font-size: 14px;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

/* 确保参数值在深色主题下也能清晰显示 */
[data-theme='dark'] .param-value {
  color: var(--text-color);
}
</style>