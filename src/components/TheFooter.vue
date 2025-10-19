<template>
  <footer class="footer-container">
    <div class="footer-content">
      <p class="copyright">&copy; 2025 Richard Fury. All rights reserved.</p>
      <div class="social-links">
        <a href="https://github.com/RichardFury" class="social-link" target="_blank"><i class="fab fa-github"></i></a>
        <a href="https://space.bilibili.com/275999748?spm_id_from=333.1007.0.0" class="social-link" target="_blank"><i class="fab fa-bilibili"></i></a>
        <a href="https://www.linkedin.com/in/richardfury007/" class="social-link" target="_blank"><i class="fab fa-linkedin"></i></a>
      </div>
    </div>
  </footer>
</template>

<script setup>
// Footer component logic
</script>

<style scoped>
.footer-container {
  background-color: var(--bg-color);
  color: var(--text-color);
  padding: 20px 0;
  width: 100%;
  flex-shrink: 0; /* 确保footer不会被压缩 */
}

.footer-content {
  max-width: 90%;
  margin: 0 auto;
  padding: 0 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  margin: 0;
}

.social-links {
  display: flex;
  gap: 20px;
}

.social-link {
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.3s;
}

.social-link:hover {
  opacity: 0.7;
}
</style>