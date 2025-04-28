import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./components/HomePage/HomePage.vue') },
    { path: '/gallery', component: () => import('./components/GalleryPage/GalleryPage.vue') },
    { path: '/research', component: () => import('./components/ResearchPage/ResearchPage.vue') },
    { path: '/life', component: () => import('./components/LifePage/LifePage.vue') },
    { path: '/contact', component: () => import('./components/ContactPage/ContactPage.vue') },
    { path: '/thought', component: () => import('./components/ThoughtPage/ThoughtPage.vue') }
  ]
})

const app = createApp(App)
app.use(router)
app.mount('#app')
