<template>
  <div class="research-container">
    <!-- About Me 区域 -->
    <section class="about-me-section">
      <div class="about-me-content">
        <h2 class="section-heading about-heading">About Me</h2>
        <div class="about-me-layout">
          <div class="about-me-photo">
            <!-- 个人照片占位区域 -->
            <div class="photo-placeholder">
              <div class="photo-icon">👤</div>
              <div class="photo-text">Personal Photo</div>
            </div>
          </div>
          <div class="about-me-text">
            <p>
              I am a theoretical physicist specializing in cosmology, dark matter, and neutrino physics. 
              My research focuses on understanding the fundamental nature of the universe and its mysterious 
              components. Through theoretical modeling, data analysis, and numerical simulations, I aim to 
              contribute to our understanding of cosmic phenomena that continue to challenge our current 
              understanding of physics.
            </p>
            <p>
              My approach combines rigorous mathematical frameworks with innovative computational methods 
              to explore the boundaries of our knowledge about the cosmos and its fundamental particles.
            </p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Research Interests 区域 -->
    <section class="research-interests-section">
      <!-- 宇宙学板块 - 标题靠左 -->
      <div class="research-section">
        <div class="section-header text-left">
          <h2>Cosmology</h2>
        </div>
        <div class="section-content">
          <div class="section-text-with-image">
            <div class="section-image float-left">
              <img src="/src/data/research/cosmology.svg" alt="Cosmology Illustration" class="research-image" />
            </div>
            <p>
              My research in cosmology focuses on understanding the large-scale structure of the universe,
              cosmic microwave background radiation, and the nature of cosmic inflation. I'm particularly interested
              in developing theoretical models that can explain the accelerating expansion of the universe
              and the observed distribution of galaxies and dark matter.
            </p>
            <p>
              Recent work has involved studying gravitational lensing effects as a probe for dark energy,
              and analyzing numerical simulations of structure formation in various cosmological models.
            </p>
          </div>
        </div>
      </div>
      
      <!-- 暗物质板块 - 标题靠右 -->
      <div class="research-section">
        <div class="section-header text-right">
          <h2>Dark Matter</h2>
        </div>
        <div class="section-content">
          <div class="section-text-with-image">
            <div class="section-image float-right">
                <img src="/src/data/research/dark_matter.svg" alt="Dark Matter Illustration" class="research-image" />
              </div>
            <p>
              The nature of dark matter remains one of the most compelling mysteries in modern physics. 
              My research explores various dark matter candidates, including WIMPs, axions, and sterile neutrinos.
              I develop theoretical frameworks to understand how these particles might interact with ordinary matter
              and propose experimental strategies to detect them.
            </p>
            <p>
              I am particularly interested in indirect detection methods through gamma-ray and neutrino astronomy,
              as well as direct detection experiments sensitive to low-mass dark matter particles.
            </p>
          </div>
        </div>
      </div>
      
      <!-- 无菌中微子板块 - 标题靠左 -->
      <div class="research-section">
        <div class="section-header text-left">
            <h2>Sterile Neutrino</h2>
          </div>
        <div class="section-content">
          <div class="section-text-with-image">
            <div class="section-image float-left" style="margin-top: 10px; margin-bottom: 10px;">
                <img src="/src/data/research/sterile_neutrino.svg" alt="Sterile Neutrino Illustration" class="research-image" />
              </div>
            <p>
              Sterile neutrinos represent a potential extension to the Standard Model of particle physics.
              My research investigates the theoretical implications of sterile neutrinos, including their role
              in neutrino oscillations, dark matter, and baryogenesis. I analyze experimental data from neutrino
              oscillation experiments and cosmological observations to constrain sterile neutrino parameters.
            </p>
            <p>
              Current projects involve developing models of resonant sterile neutrino production in the early universe
              and exploring connections between neutrino mass hierarchies and sterile neutrino properties.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
// 脚本逻辑将在这里添加
</script>

<style scoped>
/* 主容器样式 */
.research-container {
  max-width: 1200px;
  margin: 0 50px;
  padding: 40px;
  position: relative;
}

/* About Me 区域样式 - 只有大板块有边框 */
.about-me-section {
  margin: 60px 0 80px;
  position: relative;
}

.about-me-content {
  background-color: var(--card-bg-color);
  border-radius: 12px;
  padding: 40px;
  position: relative;
  overflow: hidden;
  border: 1px solid transparent;
}

[data-theme='dark'] .about-me-content {
  background-color: rgba(30, 30, 30, 0.8);
  box-shadow: none;
}
[data-theme='light'] .about-me-content {
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 1px rgba(210, 210, 210, 0.5) inset;
}

/* 关于我布局样式 */
.about-me-layout {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 20px;
}

/* 照片区域占20%宽度 */
.about-me-photo {
  width: 20%;
  flex-shrink: 0;
}

.photo-placeholder {
  width: 100%;
  aspect-ratio: 3/4;
  background-color: var(--hover-bg-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--text-secondary-color);
}

.photo-icon {
  font-size: 3rem;
  margin-bottom: 10px;
}

.photo-text {
  color: var(--text-secondary-color);
  font-size: 0.9rem;
  text-align: center;
}

/* 文字区域占80%宽度，实现环绕效果 */
.about-me-text {
  width: calc(80% - 20px);
  color: var(--text-color);
  line-height: 1.7;
}

/* 研究兴趣区域样式 - 只有大板块有边框 */
.research-interests-section {
  position: relative;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 20px;
  background-color: var(--card-bg-color);
}

[data-theme='dark'] .research-interests-section {
  background-color: rgba(30, 30, 30, 0.8);
  box-shadow: none;
}

[data-theme='light'] .research-interests-section {
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 1px rgba(210, 210, 210, 0.5) inset;
}

/* 通用标题样式 */
.section-heading {
  color: var(--text-color);
  font-family: 'Comic Sans MS', cursive, sans-serif;
  font-size: 1.8em;
  margin-bottom: 30px;
  font-weight: 700;
  position: relative;
  display: inline-block;
  letter-spacing: -0.5px;
}

.about-heading {
  margin-bottom: 25px;
  color: var(--text-color);
}

/* 研究板块样式 - 内部板块无边框、无悬停效果、无投影 */
.research-section {
  background-color: var(--card-bg-color);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 15px;
  position: relative;
  overflow: hidden;
}

/* 移除最后一个研究板块的底部margin */
.research-section:last-child {
  margin-bottom: 0;
}

/* 标题交替对齐 */
.section-header.text-left h2 {
  text-align: left;
}

.section-header.text-right h2 {
  text-align: right;
}

.section-header h2 {
  color: var(--text-color);
  font-family: 'Comic Sans MS', cursive, sans-serif;
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 1.8em;
  font-weight: 600;
  letter-spacing: -0.3px;
}

/* 移除下划线样式 */
.section-header h2::after {
  display: none;
}

/* 内容区域样式 */
.section-content {
  line-height: 1.7;
  color: var(--text-secondary-color);
  display: flex;
  flex-direction: column;
  position: relative;
}

/* 文字环绕图片样式 */
.section-text-with-image {
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* 浮动图片样式 - 无投影、无过渡效果 */
.float-left {
  float: left;
  margin-right: 25px;
  margin-bottom: 20px;
  width: 200px;
}

.float-right {
  float: right;
  margin-left: 25px;
  margin-bottom: 20px;
  width: 200px;
}

.research-image {
  width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
}

/* 文字样式调整 */
.section-text-with-image p {
  margin-bottom: 20px;
  line-height: 1.7;
  text-align: justify;
  font-size: 1.05rem;
  position: relative;
  z-index: 1;
}

.section-text-with-image p:last-child {
  margin-bottom: 0;
}

/* 确保段落不受图片浮动影响 */
.section-text-with-image::after {
  content: "";
  display: table;
  clear: both;
}

/* 装饰性元素 - 已移除蓝色分界线 */

/* 抽象装饰背景元素 */
.about-me-content::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: var(--primary-color);
  opacity: 0.03;
  z-index: 0;
  bottom: -150px;
  right: -150px;
}

.research-interests-section::after {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background-color: var(--primary-color);
  opacity: 0.03;
  z-index: 0;
  bottom: -150px;
  left: -150px;
}

/* 响应式设计 - 768px断点 */
@media (max-width: 768px) {
  .research-container {
    padding: 0 15px 40px;
  }
  
  .about-me-section {
    margin: 40px 0 60px;
  }
  
  .about-me-content {
    padding: 30px 20px;
  }
  
  .research-interests-section {
    padding: 15px;
  }
  
  .research-section {
    padding: 30px 20px;
    margin-bottom: 40px;
  }
  
  .section-heading {
    font-size: 1.8rem;
  }
  
  .section-header h2 {
    font-size: 1.5rem;
    text-align: center !important;
    margin-bottom: 20px;
  }
  
  .float-left,
  .float-right {
    float: none;
    display: block;
    margin: 0 auto 20px;
    width: 160px;
  }
  
  .section-text-with-image p {
    text-align: left;
    font-size: 1rem;
  }
  
  .about-me-content::after,
  .research-interests-section::after {
    width: 200px;
    height: 200px;
  }
}

/* 响应式设计 - 480px断点 */
@media (max-width: 480px) {
  .about-me-section {
    margin: 30px 0 50px;
  }
  
  .about-me-content {
    padding: 25px 15px;
  }
  
  .research-section {
    padding: 25px 15px;
    margin-bottom: 30px;
  }
  
  .section-heading {
    font-size: 1.6rem;
  }
  
  .section-header h2 {
    font-size: 1.4rem;
  }
  
  .float-left,
  .float-right {
    width: 140px;
  }
  
  .about-me-content::after,
  .research-interests-section::after {
    width: 150px;
    height: 150px;
  }
}
</style>