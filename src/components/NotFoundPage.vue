<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <div class="not-found-content">
        <h1 class="error-code">404</h1>
        <h2 class="error-title">Page Not Found</h2>
        <p class="error-message">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div class="error-actions">
          <router-link to="/" class="home-button">
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </router-link>
        </div>
      </div>
      
      <div class="not-found-illustration">
        <svg class="illustration" viewBox="0 0 400 300" fill="none">
          <circle cx="200" cy="150" r="100" fill="var(--bg-secondary)" opacity="0.5"/>
          <circle cx="200" cy="150" r="80" fill="var(--bg-tertiary)" opacity="0.3"/>
          <text x="200" y="160" text-anchor="middle" font-size="60" fill="var(--text-tertiary)" opacity="0.3">?</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { logger } from '../utils/logger'

onMounted(() => {
  logger.warn('[NotFound] User accessed non-existent route')
})
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  padding: 2rem;
}

.not-found-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  max-width: 1000px;
  width: 100%;
  align-items: center;
}

.not-found-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  margin: 0;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.error-message {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.error-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.home-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: var(--bg-primary);
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
}

.button-icon {
  width: 20px;
  height: 20px;
}

.not-found-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration {
  width: 100%;
  height: auto;
  max-width: 400px;
}

@media (max-width: 767px) {
  .not-found-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }

  .error-code {
    font-size: 6rem;
  }

  .error-title {
    font-size: 1.5rem;
  }

  .error-message {
    font-size: 1rem;
  }

  .error-actions {
    justify-content: center;
  }

  .not-found-illustration {
    order: -1;
  }
}

@media (max-width: 479px) {
  .not-found-page {
    padding: 1rem;
  }

  .error-code {
    font-size: 5rem;
  }

  .home-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>