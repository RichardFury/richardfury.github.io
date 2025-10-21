<template>
  <header class="header">
    <div class="container">
      <h1 class="title" style="font-family: 'Corinthia', cursive; font-size: 48px;"><router-link to="/">Richard Fury</router-link></h1>
      <nav class="nav">
        <ul>
          <li><router-link to="/">Home</router-link></li>
          <li><router-link to="/research">Research</router-link></li>
          <li><router-link to="/life">Life</router-link></li>
          <li><router-link to="/gallery">Gallery</router-link></li>
          <li><router-link to="/blog">Blog</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li>
        </ul>
      </nav>
    </div>
  </header>
</template>
<script setup>
import { onMounted } from 'vue';

// 主题管理已由App.vue统一处理，此处不再重复实现
onMounted(() => {
  // 确保主题已正确应用
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
});
</script>

<style scoped>
.title {
  font-family: 'Corinthia', cursive;
  font-size: 48px;
  margin: 0;
}

.title a {
  text-decoration: none;
  color: inherit;
}

.nav a {
  text-decoration: none;
  color: var(--text-color);
  font-family: 'DM Serif Text', serif;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .container {
      flex-direction: column;
      gap: 1rem;
    }
    
    .nav ul {
      flex-wrap: wrap;
      justify-content: center;
      gap: 1rem;
    }
  }
  
  .slider {
  position: absolute;
  cursor: pointer;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  width: 100%;
  height: 30px;
  background-color: var(--slider-bg);
  border-radius: 34px;
  transition: 0.4s;
  z-index: 1;
}

.light {
  transform: translateX(0);
  background-color: var(--light-bg);
  color: var(--light-color);
  z-index: 1;
  content: 'Dark';
}

.dark {
  transform: translateX(100%);
  background-color: var(--dark-bg);
  z-index: 1;
  color: var(--dark-color);
  content: 'Light';
}

.dark-label {
  color: var(--label-color);
}

.light-label, .dark-label {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
}
.light-label {
  color: var(--label-color);
}

.light-label {
  left: 10px;
}

.dark-label {
  right: 10px;
}
.header {
  padding: 40px 0 20px 0;
  position: flex;
  top: 0;
  z-index: 1000;
  background-color: var(--bg-color);
  width: 80%;
  margin: 0 auto;
  border-radius: 12px;
}

.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin: 0 auto;
    padding: 0 20px;
  }

  .title {
    margin-left: 10%;
  }

  .nav {
    margin-right: 10%;
  }

@media (max-width: 768px) {
  .container {
    max-width: 95%;
    flex-direction: column;
    padding: 10px;
  }

  .title {
    margin-bottom: 15px;
  }
}

.title {
  font-size: 32px;
  margin: 0;
  color: var(--text-color);
  font-family: 'Plus Jakarta Sans', sans-serif; /* 修改字体为Jakarta */
  text-align: left;
}

.nav ul {
  list-style: none;
  display: flex;
  margin: 0;
  padding: 0;
}

.nav a {
  padding-left: 10px;
  padding-right: 10px;
  color: var(--nav-text-color);
  text-decoration: none;
  font-family: 'DM Serif Text', serif;
}

.title a {
  text-decoration: none;
  color: inherit;
}



.nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--text-color);
  transition: all 0.3s ease;
}
</style>