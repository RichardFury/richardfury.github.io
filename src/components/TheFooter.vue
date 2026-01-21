<script setup>
import '@fortawesome/fontawesome-free/css/all.min.css';

const socialLinks = [
  { name: 'Bilibili', icon: 'fab fa-bilibili', path: 'https://space.bilibili.com/275999748?spm_id_from=333.1007.0.0' },
  { name: 'GitHub', icon: 'fab fa-github', path: 'https://github.com/RichardFury' },
  { name: 'LinkedIn', icon: 'fab fa-linkedin', path: 'https://www.linkedin.com/in/richardfury007/' }
];
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer-content">
        <!-- 品牌信息 -->
        <div class="footer-brand">
          <h2 class="footer-logo">Richard Fury</h2>
          <p class="footer-description">
            Cosmology Researcher & Photophile
          </p>
        </div>

        <!-- 版权信息 -->
        <div class="footer-copyright">
          &copy; {{ new Date().getFullYear() }} Richard Fury. All rights reserved.
        </div>
        
        <!-- 社交媒体 -->
        <div class="footer-social">
          <h3 class="footer-title">Connect</h3>
          <div class="footer-social-links">
            <a 
              v-for="link in socialLinks" 
              :key="link.name"
              :href="link.path"
              :aria-label="link.name"
              class="footer-social-link"
              target="_blank"
            >
              <i :class="link.icon"></i>
            </a>
          </div>
        </div>
        
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: var(--bg-primary);
  padding: var(--spacing-2xl) 0 var(--spacing-xl);
  border-top: 1px solid var(--glass-border);
  margin-top: auto;
}

.footer-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr 1fr 1fr;
  }
  
  .footer-social {
    margin-left: 0;
  }
}

.footer-brand {
  text-align: center;
}

@media (min-width: 768px) {
  .footer-brand {
    text-align: left;
  }
}

.footer-logo {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: var(--spacing-sm);
  color: var(--text-primary);
}

.footer-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 400;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
  text-align: center;
}

@media (min-width: 768px) {
  .footer-title {
    text-align: left;
  }
}

.footer-social-links {
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.footer-social-link {
  font-size: 1.5rem;
  color: var(--text-secondary);
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--glass-bg);
}

.footer-social-link:hover {
  color: var(--accent-primary);
  transform: translateY(-3px);
  background-color: var(--glass-border);
}

.footer-copyright {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin: 0;
  margin-top: auto;
  width: 100%;
  text-align: center;
}

@media (min-width: 768px) {
  .footer-copyright {
    width: auto;
    text-align: center;
  }
  
  .footer-social {
    margin-left: auto;
  }
}
</style>
