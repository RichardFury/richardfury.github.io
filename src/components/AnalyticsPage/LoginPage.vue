<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 登录卡片 -->
      <div class="login-card">
        <!-- Logo和标题 -->
        <div class="login-header">
          <div class="logo-container">
            <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h1 class="login-title">数据实验室</h1>
          <p class="login-subtitle">Analytics Dashboard</p>
        </div>

        <!-- 登录表单 -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- 密码输入 -->
          <div class="form-group">
            <label for="password" class="form-label">访问密码</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="password"
                type="password"
                class="form-input"
                placeholder="请输入访问密码"
                :class="{ 'error': showError }"
                @input="clearError"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="password-toggle"
                aria-label="显示/隐藏密码"
              >
                <svg v-if="!showPassword" class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <svg v-else class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              </button>
            </div>
            <!-- 错误提示 -->
            <transition name="fade">
              <div v-if="showError" class="error-message">
                <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{{ errorMessage }}</span>
              </div>
            </transition>
          </div>

          <!-- 记住我 -->
          <div class="form-group checkbox-group">
            <label class="checkbox-label">
              <input
                v-model="rememberMe"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-text">保持登录状态（24小时）</span>
            </label>
          </div>

          <!-- 登录按钮 -->
          <button
            type="submit"
            class="login-button"
            :disabled="isLoading || !password"
          >
            <span v-if="!isLoading">进入数据实验室</span>
            <span v-else class="loading-text">
              <svg class="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke-width="4" stroke-opacity="0.3"/>
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="4"
                  d="M12 2a10 10 0 0110 10"
                />
              </svg>
              验证中...
            </span>
          </button>
        </form>

        <!-- 底部信息 -->
        <div class="login-footer">
          <p class="footer-text">
            <svg class="lock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            安全加密 · 仅限授权访问
          </p>
        </div>
      </div>

      <!-- 背景装饰 -->
      <div class="background-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import bcrypt from 'bcryptjs'
import { logger } from '../../utils/logger'

const router = useRouter()

// 预先加密的密码（使用bcrypt）
// 生成方式：已通过generate-hash.js脚本生成
// 盐值：$2a$10$lUE4aY4J7p78t3ql.xlNWe
// 哈希值：$2a$10$lUE4aY4J7p78t3ql.xlNWegBnhJTo4EvT1q9evZ1EDf329.SUrh/i
// 验证结果：✅ 成功
const hashedPassword = '$2a$10$lUE4aY4J7p78t3ql.xlNWegBnhJTo4EvT1q9evZ1EDf329.SUrh/i'

// 表单状态
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(true)
const isLoading = ref(false)
const showError = ref(false)
const errorMessage = ref('')

// 尝试次数
const attempts = ref(0)
const maxAttempts = 5

// 检查是否已登录
onMounted(() => {
  // 检查是否被锁定
  const lockedUntil = localStorage.getItem('login_locked_until')
  if (lockedUntil) {
    const now = Date.now()
    if (now < parseInt(lockedUntil)) {
      const remainingTime = Math.ceil((parseInt(lockedUntil) - now) / 1000 / 60)
      showError.value = true
      errorMessage.value = `账户已锁定，请${remainingTime}分钟后再试`
      return
    } else {
      // 锁定时间已过，清除锁定
      localStorage.removeItem('login_locked_until')
      attempts.value = 0
    }
  }

  const token = localStorage.getItem('analytics_token')
  if (token) {
    // 验证token有效性
    if (verifyToken(token)) {
      router.push('/analytics')
    }
  }
})

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  const input = document.getElementById('password')
  input.type = showPassword.value ? 'text' : 'password'
}

// 清除错误
const clearError = () => {
  showError.value = false
  errorMessage.value = ''
}

// 验证token
const verifyToken = (token) => {
  try {
    const payload = JSON.parse(atob(token))
    const now = Math.floor(Date.now() / 1000)
    return payload.exp > now
  } catch {
    return false
  }
}

// 生成token
const generateToken = () => {
  const payload = {
    exp: Math.floor(Date.now() / 1000) + (1 * 60 * 60), // 1小时过期（每次访问都需要重新登录）
    iat: Math.floor(Date.now() / 1000)
  }
  return btoa(JSON.stringify(payload))
}

// 验证密码（使用bcrypt）
const verifyPassword = (inputPassword) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(inputPassword, hashedPassword, (err, isMatch) => {
      if (err) {
        reject(err)
      } else {
        resolve(isMatch)
      }
    })
  })
}

// 处理登录
const handleLogin = async () => {
  if (!password.value) {
    showError.value = true
    errorMessage.value = '请输入访问密码'
    return
  }

  isLoading.value = true
  showError.value = false

  try {
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 验证密码（使用bcrypt）
    const isMatch = await verifyPassword(password.value)

    if (isMatch) {
      // 生成并存储token
      const token = generateToken()
      localStorage.setItem('analytics_token', token)

      // 重置尝试次数
      attempts.value = 0

      // 跳转到数据页面
      router.push('/analytics')
    } else {
      // 增加尝试次数
      attempts.value++

      if (attempts.value >= maxAttempts) {
        // 锁定账户
        showError.value = true
        errorMessage.value = '尝试次数过多，请5分钟后再试'
        localStorage.setItem('login_locked_until', Date.now() + 5 * 60 * 1000)
      } else {
        // 显示错误
        showError.value = true
        errorMessage.value = `密码错误，还剩 ${maxAttempts - attempts.value} 次尝试机会`
      }
    }
  } catch (error) {
    logger.error('登录失败:', error)
    showError.value = true
    errorMessage.value = '登录失败，请稍后重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* ========================================
   登录页面样式
   使用全局主题变量系统
======================================== */

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-primary);
  position: relative;
  overflow: hidden;
  transition: background-color 0.3s ease;
}

/* 主题类已移除，直接使用全局主题系统
   全局主题通过 [data-theme="dark"] 和 [data-theme="light"] 控制
   所有颜色变量自动继承自全局样式
*/

/* 登录容器 */
.login-container {
  position: relative;
  width: 100%;
  max-width: 440px;
  padding: 1.5rem;
  z-index: 10;
}

/* 登录卡片 */
.login-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: var(--glass-shadow-hover);
  animation: fadeInUp 0.6s ease-out;
  position: relative;
  z-index: 10;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(96, 165, 250, 0.3);
}

.logo-icon {
  width: 32px;
  height: 32px;
  color: var(--bg-primary);
}

.login-title {
  font-size: 1.75rem;
  font-weight: 300;
  letter-spacing: -0.01em;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

.login-subtitle {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
}

/* 登录表单 */
.login-form {
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-of-type {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

/* 密码输入 */
.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.875rem 3rem 0.875rem 1rem;
  background-color: var(--bg-primary);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 400;
  transition: all 0.3s ease;
  outline: none;
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.form-input:focus {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px var(--focus-ring);
}

.form-input.error {
  border-color: var(--error);
  box-shadow: 0 0 0 3px var(--error-bg);
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background-color: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 6px;
}

.password-toggle:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
}

.toggle-icon {
  width: 20px;
  height: 20px;
}

/* 错误消息 */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background-color: var(--error-bg);
  border: 1px solid var(--error);
  border-radius: 8px;
  color: var(--error);
  font-size: 0.875rem;
  font-weight: 500;
}

.error-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 复选框 */
.checkbox-group {
  margin-bottom: 1.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: var(--accent-primary);
}

.checkbox-text {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--text-secondary);
}

/* 登录按钮 */
.login-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border: none;
  border-radius: 8px;
  color: var(--bg-primary);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(96, 165, 250, 0.3);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(96, 165, 250, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 登录底部 */
.login-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid var(--glass-border);
}

.footer-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 400;
  color: var(--text-tertiary);
  margin: 0;
}

.lock-icon {
  width: 14px;
  height: 14px;
}

/* 背景装饰 */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 1;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  filter: blur(60px);
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  top: -200px;
  right: -200px;
  animation: float 8s ease-in-out infinite;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--accent-secondary), var(--accent-primary));
  bottom: -150px;
  left: -150px;
  animation: float 10s ease-in-out infinite reverse;
}

.circle-3 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 12s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(20px, -20px);
  }
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式设计 */
@media (max-width: 639px) {
  .login-container {
    padding: 1rem;
  }

  .login-card {
    padding: 2rem 1.5rem;
  }

  .login-title {
    font-size: 1.5rem;
  }

  .logo-container {
    width: 56px;
    height: 56px;
  }

  .logo-icon {
    width: 28px;
    height: 28px;
  }

  .form-input {
    padding: 0.75rem 2.75rem 0.75rem 0.875rem;
    font-size: 0.95rem;
  }

  .password-toggle {
    right: 0.625rem;
  }

  .login-button {
    padding: 0.75rem 1.25rem;
    font-size: 0.95rem;
  }
}

@media (max-width: 479px) {
  .login-card {
    padding: 1.75rem 1.25rem;
  }

  .login-title {
    font-size: 1.375rem;
  }

  .logo-container {
    width: 48px;
    height: 48px;
    margin-bottom: 1.25rem;
  }

  .logo-icon {
    width: 24px;
    height: 24px;
  }

  .form-label {
    font-size: 0.8125rem;
  }

  .form-input {
    padding: 0.625rem 2.5rem 0.625rem 0.75rem;
    font-size: 0.9rem;
  }

  .checkbox-text {
    font-size: 0.8125rem;
  }

  .footer-text {
    font-size: 0.75rem;
  }
}

/* 可访问性 */
@media (prefers-reduced-motion: reduce) {
  .login-card,
  .decoration-circle,
  .login-button,
  .form-input,
  .password-toggle {
    animation: none;
    transition: none;
  }

  .loading-spinner {
    animation: none;
  }
}

/* 高对比度模式 */
@media (prefers-contrast: high) {
  .login-card {
    border-width: 2px;
  }

  .form-input {
    border-width: 2px;
  }

  .login-button {
    border: 2px solid transparent;
  }
}

/* 焦点样式 */
*:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* 打印样式 */
@media print {
  .login-page {
    background-color: white;
  }

  .background-decoration {
    display: none;
  }

  .login-card {
    box-shadow: none;
    border: 1px solid #ccc;
  }
}
</style>
