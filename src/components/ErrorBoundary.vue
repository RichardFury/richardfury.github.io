<script setup>
import { ref, onErrorCaptured } from 'vue';
import { logger } from '../utils/logger';

const hasError = ref(false);
const errorMessage = ref('');
const errorInfo = ref('');

onErrorCaptured((err, instance, info) => {
  hasError.value = true;
  errorMessage.value = err.message;
  errorInfo.value = info;

  logger.error('Error captured by ErrorBoundary:', err);
  logger.error('Error info:', info);
  logger.error('Component instance:', instance);

  return false;
});

function resetError() {
  hasError.value = false;
  errorMessage.value = '';
  errorInfo.value = '';
}
</script>

<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-boundary-content">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div v-if="errorInfo" class="error-info">
        <details>
          <summary>Error Details</summary>
          <pre>{{ errorInfo }}</pre>
        </details>
      </div>
      <button @click="resetError" class="error-retry-btn">Try Again</button>
    </div>
  </div>
  <slot v-else></slot>
</template>

<style scoped>
.error-boundary {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background-color: var(--bg-primary);
}

.error-boundary-content {
  max-width: 600px;
  text-align: center;
  padding: var(--spacing-3xl);
  background: var(--glass-bg);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 4rem;
  margin-bottom: var(--spacing-lg);
}

.error-title {
  font-size: 2rem;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.error-message {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
  line-height: 1.6;
}

.error-info {
  margin-bottom: var(--spacing-xl);
  text-align: left;
}

.error-info details {
  background: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.error-info summary {
  cursor: pointer;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.error-info pre {
  margin: 0;
  padding: var(--spacing-md);
  background: var(--bg-primary);
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.error-retry-btn {
  background-color: var(--accent-primary);
  color: var(--bg-primary);
  border: none;
  padding: var(--spacing-md) var(--spacing-2xl);
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.error-retry-btn:hover {
  background-color: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.error-retry-btn:active {
  transform: translateY(0);
}
</style>
