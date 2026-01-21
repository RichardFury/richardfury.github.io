import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'
import './styles/hero-variables.css'
import HomePage from './components/HomePage/HomePage.vue'
import BlogPage from './components/BlogPage/BlogPage.vue'
import BlogDetailComponent from './components/BlogPage/BlogDetailComponent.vue'
import ContactPage from './components/ContactPage/ContactPage.vue'
import ResearchPage from './components/ResearchPage/ResearchPage.vue'
import GalleryPage from './components/GalleryPage/GalleryPage.vue'
import CVPage from './components/CVPage/CVPage.vue'
import InfiniteCarouselPreview from './components/InfiniteCarouselPreview.vue'
import AnalyticsPage from './components/AnalyticsPage/AnalyticsPage.vue'
import LoginPage from './components/AnalyticsPage/LoginPage.vue'
import NotFoundPage from './components/NotFoundPage.vue'

// 创建路由实例
// 使用 createWebHashHistory 而不是 createWebHistory 以支持 GitHub Pages
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: HomePage, name: 'home' },
    { path: '/cv', redirect: '/', name: 'cv' },
    { path: '/blog', component: BlogPage, name: 'blog' },
    { path: '/blog/:id', component: BlogDetailComponent, name: 'blog-detail' },
    { path: '/contact', component: ContactPage, name: 'contact' },
    { path: '/research', component: ResearchPage, name: 'research' },
    { path: '/gallery', component: GalleryPage, name: 'gallery' },
    { path: '/infinite-carousel-preview', component: InfiniteCarouselPreview, name: 'infinite-carousel-preview' },
    { path: '/analytics', component: AnalyticsPage, name: 'analytics', meta: { requiresAuth: true } },
    { path: '/analytics/login', component: LoginPage, name: 'analytics-login' },
    { path: '/:pathMatch(.*)*', component: NotFoundPage, name: 'not-found' }
  ]
});

// 路由守卫：保护需要认证的页面
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('analytics_token')
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!token) {
      // 没有token，跳转到登录页
      next('/analytics/login')
      return
    }
    
    // 验证token有效性
    try {
      const payload = JSON.parse(atob(token))
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp <= now) {
        // Token已过期，清除并跳转到登录页
        localStorage.removeItem('analytics_token')
        next('/analytics/login')
        return
      }
    } catch (error) {
      // Token格式错误，清除并跳转到登录页
      localStorage.removeItem('analytics_token')
      next('/analytics/login')
      return
    }
  }
  
  // 如果用户已登录且访问登录页，重定向到analytics页面
  if (to.path === '/analytics/login' && token) {
    try {
      const payload = JSON.parse(atob(token))
      const now = Math.floor(Date.now() / 1000)
      if (payload.exp > now) {
        next('/analytics')
        return
      }
    } catch (error) {
      // Token无效，继续到登录页
    }
  }
  
  next()
})

const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')
