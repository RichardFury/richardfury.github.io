<script setup>
// 个人信息数据 - 极简专业艺术风格
const personalInfo = {
  name: 'Richard Fury',
  title: 'Minimalist Artist & Cosmologist',
  bio: 'Bridging the gap between cosmic exploration and minimalist aesthetics, seeking beauty in simplicity and the unknown.',
  avatar: 'https://picsum.photos/id/1005/400/400',
  location: 'San Francisco, CA',
  email: 'richard@example.com',
  website: 'https://richardfury.com'
};

// 技能数据 - 专业细分
const skills = [
  { name: 'Minimalist Digital Art', level: 92 },
  { name: 'Fine Art Photography', level: 88 },
  { name: 'Cosmological Research', level: 95 },
  { name: 'Web Design & Development', level: 85 },
  { name: 'Scientific Writing', level: 82 },
  { name: 'Creative Direction', level: 87 }
];

// 经历数据 - 详细专业经历
const experiences = [
  {
    year: '2022 - Present',
    title: 'Independent Artist & Researcher',
    organization: 'Self-Employed',
    description: 'Creating minimalist digital artworks and photography projects inspired by cosmic phenomena. Collaborating with galleries and scientific institutions to bridge art and science.'
  },
  {
    year: '2020 - 2022',
    title: 'Postdoctoral Research Fellow',
    organization: 'Stanford University, Department of Physics',
    description: 'Conducted research on dark matter and cosmology, analyzing cosmic microwave background data. Published 3 peer-reviewed papers in leading scientific journals.'
  },
  {
    year: '2018 - 2020',
    title: 'Research Assistant',
    organization: 'UC Berkeley, Center for Cosmological Physics',
    description: 'Worked on the Planck satellite data analysis project, focusing on early universe inflation models and dark energy constraints.'
  },
  {
    year: '2016 - 2018',
    title: 'Teaching Assistant',
    organization: 'UC Berkeley, Department of Physics',
    description: 'Instructed undergraduate courses in physics and astronomy, developed educational materials for cosmology workshops.'
  }
];

// 教育数据 - 完整教育背景
const education = [
  {
    degree: 'Master of Fine Arts (MFA)',
    school: 'California College of the Arts',
    year: '2022',
    field: 'Digital Arts & New Media',
    thesis: '"Cosmic Minimalism: Art Inspired by the Universe"'
  },
  {
    degree: 'Doctor of Philosophy (PhD)',
    school: 'University of California, Berkeley',
    year: '2020',
    field: 'Physics & Astronomy',
    thesis: '"Constraining Dark Matter Models Using Cosmic Microwave Background Observations"'
  },
  {
    degree: 'Bachelor of Science (BS)',
    school: 'University of California, Berkeley',
    year: '2014',
    field: 'Physics & Mathematics',
    honors: 'Summa Cum Laude'
  }
];
</script>

<template>
  <section class="cv-page">
    <div class="container">
      <!-- CV Header -->
      <div class="cv-header card glass-effect">
        <h1 class="cv-title">{{ personalInfo.name }}</h1>
        <p class="cv-subtitle">{{ personalInfo.title }}</p>
        <p class="cv-bio">{{ personalInfo.bio }}</p>
      </div>
      
      <!-- About Section -->
      <div class="about-section">
        <h2 class="section-title">About Me</h2>
        <div class="about-content grid grid-2">
          <div class="about-text card">
            <p>
              I'm a minimalist artist and researcher with a background in physics and astronomy. 
              My work explores the beauty of simplicity, focusing on clean lines, negative space, 
              and subtle color palettes. I believe that less is more, and that true beauty lies 
              in the essence of things.
            </p>
            <p>
              As a researcher, I've worked on cosmology and dark matter projects, which has 
              deeply influenced my artistic perspective. I see art and science as complementary 
              ways of understanding the world, both seeking to uncover underlying patterns and 
              truths.
            </p>
          </div>
          <div class="about-details card">
            <div class="detail-item">
              <span class="detail-label">Location:</span>
              <span class="detail-value">{{ personalInfo.location }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{ personalInfo.email }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Fields:</span>
              <span class="detail-value">Digital Art, Photography, Research</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">Languages:</span>
              <span class="detail-value">English, Spanish, French</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Skills Section -->
      <div class="skills-section">
        <h2 class="section-title">Skills</h2>
        <div class="skills-content card">
          <div 
            v-for="skill in skills" 
            :key="skill.name"
            class="skill-item"
          >
            <div class="skill-header">
              <span class="skill-name">{{ skill.name }}</span>
              <span class="skill-level">{{ skill.level }}%</span>
            </div>
            <div class="skill-bar">
              <div 
                class="skill-progress"
                :style="{ width: `${skill.level}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Experience Section -->
      <div class="experience-section">
        <h2 class="section-title">Professional Experience</h2>
        <div class="experience-content">
          <div 
            v-for="(experience, index) in experiences" 
            :key="index"
            class="experience-item card"
          >
            <div class="experience-header">
              <div class="experience-meta">
                <span class="experience-year">{{ experience.year }}</span>
                <span class="experience-organization">{{ experience.organization }}</span>
              </div>
              <h3 class="experience-title">{{ experience.title }}</h3>
            </div>
            <p class="experience-description">{{ experience.description }}</p>
          </div>
        </div>
      </div>
      
      <!-- Education Section -->
      <div class="education-section">
        <h2 class="section-title">Education</h2>
        <div class="education-content">
          <div 
            v-for="(edu, index) in education" 
            :key="index"
            class="education-item card"
          >
            <div class="education-header">
              <h3 class="education-degree">{{ edu.degree }}</h3>
              <div class="education-meta">
                <span class="education-school">{{ edu.school }}</span>
                <span class="education-year">{{ edu.year }}</span>
              </div>
            </div>
            <div class="education-details">
              <p class="education-field"><strong>Field:</strong> {{ edu.field }}</p>
              <p class="education-thesis" v-if="edu.thesis"><strong>Thesis:</strong> {{ edu.thesis }}</p>
              <p class="education-honors" v-if="edu.honors"><strong>Honors:</strong> {{ edu.honors }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cv-page {
  padding: var(--spacing-2xl) 0;
}

/* CV Header */
.cv-header {
  padding: var(--spacing-3xl) var(--spacing-lg);
  margin-bottom: var(--spacing-3xl);
  text-align: center;
  animation: fadeIn var(--transition-slow) ease;
}

.cv-title {
  font-size: 3.5rem;
  margin-bottom: var(--spacing-sm);
  font-weight: 300;
  font-family: 'Playfair Display', 'Georgia', serif;
  letter-spacing: -0.02em;
}

@media (max-width: 768px) {
  .cv-title {
    font-size: 2.75rem;
  }
}

.cv-subtitle {
  font-size: 1.5rem;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  font-weight: 300;
  font-family: 'Playfair Display', 'Georgia', serif;
  letter-spacing: -0.01em;
}

.cv-bio {
  margin-bottom: var(--spacing-xl);
  line-height: 1.8;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  font-size: 1.125rem;
  letter-spacing: 0.005em;
  font-weight: 300;
}

/* Section Common Styles */
.section-title {
  font-size: 2.25rem;
  margin-bottom: var(--spacing-2xl);
  text-align: center;
  font-weight: 300;
  font-family: 'Playfair Display', 'Georgia', serif;
  letter-spacing: -0.015em;
}

/* About Section */
.about-section {
  margin-bottom: var(--spacing-3xl);
}

.about-text {
  line-height: 1.8;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--glass-border);
}

.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.detail-value {
  color: var(--text-primary);
}

/* Skills Section */
.skills-section {
  margin-bottom: var(--spacing-3xl);
}

.skill-item {
  margin-bottom: var(--spacing-lg);
}

.skill-item:last-child {
  margin-bottom: 0;
}

.skill-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.skill-name {
  font-weight: 500;
}

.skill-level {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.skill-bar {
  width: 100%;
  height: 8px;
  background-color: var(--glass-border);
  border-radius: 4px;
  overflow: hidden;
}

.skill-progress {
  height: 100%;
  background-color: var(--accent-primary);
  border-radius: 4px;
  transition: width 1s ease;
}

/* Experience Section */
.experience-section {
  margin-bottom: var(--spacing-3xl);
}

.experience-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
}

.experience-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

@media (min-width: 768px) {
  .experience-meta {
    flex-direction: row;
    gap: var(--spacing-lg);
    align-items: center;
  }
}

.experience-year {
  font-size: 0.9rem;
  color: var(--accent-primary);
  font-weight: 500;
}

.experience-organization {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-style: italic;
}

.experience-title {
  font-size: 1.5rem;
  margin: 0;
  font-weight: 400;
  line-height: 1.4;
  font-family: 'Playfair Display', 'Georgia', serif;
  letter-spacing: -0.01em;
}

.experience-description {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 1.05rem;
  letter-spacing: 0.005em;
  font-weight: 300;
}

/* Education Section */
.education-section {
  margin-bottom: var(--spacing-3xl);
}

.education-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.education-item {
  padding: var(--spacing-lg);
}

.education-header {
  margin-bottom: var(--spacing-md);
}

.education-degree {
  font-size: 1.5rem;
  margin: 0 0 var(--spacing-xs) 0;
  font-weight: 400;
  font-family: 'Playfair Display', 'Georgia', serif;
  letter-spacing: -0.01em;
}

.education-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

@media (min-width: 768px) {
  .education-meta {
    flex-direction: row;
    gap: var(--spacing-lg);
    align-items: center;
  }
}

.education-school {
  margin: 0;
  color: var(--text-secondary);
  font-style: italic;
  font-size: 1.05rem;
}

.education-year {
  margin: 0;
  font-size: 0.95rem;
  color: var(--accent-primary);
  font-weight: 500;
  letter-spacing: 0.01em;
}

.education-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: 1.05rem;
}

.education-field, .education-thesis, .education-honors {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.7;
  letter-spacing: 0.005em;
  font-weight: 300;
}

.education-details strong {
  color: var(--text-primary);
  font-weight: 500;
}

/* Animation Delay */
.card {
  animation: fadeIn var(--transition-slow) ease forwards;
}

.card:nth-child(1) {
  animation-delay: 0.1s;
}

.card:nth-child(2) {
  animation-delay: 0.2s;
}

.card:nth-child(3) {
  animation-delay: 0.3s;
}
</style>