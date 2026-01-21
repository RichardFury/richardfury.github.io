# Richard Fury Home Page - 极简主义UI设计规范

## 设计概述

本文档定义了Richard Fury个人网站首页的极简主义UI设计规范。基于现有设计风格，我们创建了一个简化但优雅的4核心区域布局，强调大量留白、统一排版和简化动画。

---

## 1. 简化后的4个核心区域

### 1.1 Hero Section - 英雄区域

**设计目标**：创造强烈的第一印象，展示个人身份和核心理念

**布局结构**：
- 垂直居中布局
- 最大宽度：800px
- 最小高度：80vh
- 大量留白，营造呼吸感

**内容层次**：
```
1. 主标题（Richard Fury）
   - 字体：Playfair Display
   - 字号：4.5rem（桌面）
   - 字重：300（极细）
   - 字间距：-0.02em

2. 副标题（Minimalist Artist & Cosmologist）
   - 字体：Playfair Display
   - 字号：1.5rem
   - 字重：300
   - 颜色：text-secondary

3. 分隔线
   - 宽度：40px
   - 高度：1px
   - 颜色：accent-tertiary
   - 透明度：50%

4. 描述文本
   - 字号：1.125rem
   - 行高：1.8
   - 最大宽度：600px
   - 字重：300
```

**视觉特点**：
- 极简主义风格，无装饰元素
- 统一的垂直间距系统
- 柔和的淡入动画（0.6s ease-out）
- 完美居中对齐

**交互行为**：
- 无悬停效果
- 无复杂动画
- 保持静态优雅

---

### 1.2 Concepts Section - 核心概念区域

**设计目标**：展示三个核心概念，采用统一卡片设计

**布局结构**：
- 网格布局（响应式）
- 桌面：3列
- 平板：2列
- 移动：1列
- 间距：var(--spacing-2xl)（桌面）

**卡片设计规范**：
```
尺寸：
- 内边距：var(--spacing-2xl)
- 圆角：8px
- 边框：1px solid var(--glass-border)

内容：
- 标题：1.5rem，Playfair Display
- 描述：1rem，Inter，行高1.8
- 字重：300-400

颜色：
- 背景：var(--bg-primary)
- 边框：var(--glass-border)
- 文本：var(--text-primary)
- 次要文本：var(--text-secondary)
```

**交互效果**：
- 悬停：translateY(-4px)
- 边框颜色变化：accent-tertiary
- 阴影：0 4px 20px rgba(0, 0, 0, 0.05)
- 过渡时间：0.3s ease

**动画时序**：
- 卡片1：延迟0.1s
- 卡片2：延迟0.2s
- 卡片3：延迟0.3s
- 动画：fadeInUp 0.6s ease-out

---

### 1.3 Works Preview Section - 作品预览区域

**设计目标**：展示三个主要作品类别，引导用户探索

**布局结构**：
- 标题区域居中
- 网格布局（响应式）
- 桌面：3列
- 平板：2列
- 移动：1列

**标题区域**：
```
主标题：
- 字号：2.25rem
- 字重：300
- 字体：Playfair Display
- 字间距：-0.015em

描述文本：
- 字号：1.125rem
- 行高：1.7
- 最大宽度：600px
- 字重：300
```

**作品卡片设计**：
```
尺寸：
- 宽高比：1:1（正方形）
- 圆角：8px
- 边框：1px solid var(--glass-border)

内容区域：
- 图片区域：100%宽高
- 信息区域：底部渐变叠加
- 内边距：var(--spacing-xl)

文本样式：
- 标题：1.5rem，Playfair Display
- 类别：0.9rem，Inter，大写
- 字重：300-400
```

**渐变背景**：
- 深色主题：rgba(0, 0, 0, 0.7) → transparent
- 浅色主题：rgba(255, 255, 255, 0.95) → transparent

**交互效果**：
- 悬停：translateY(-6px)
- 阴影：0 8px 30px rgba(0, 0, 0, 0.08)
- 边框：accent-tertiary
- 过渡时间：0.3s ease

**可访问性**：
- 每个卡片都有aria-label
- 焦点状态：2px solid accent-primary
- 焦点偏移：2px

---

### 1.4 Contact Section - 联系区域

**设计目标**：简洁的CTA（Call to Action），鼓励用户联系

**布局结构**：
- 居中对齐
- 最大宽度：600px
- 大量留白

**内容层次**：
```
1. 标题（Get In Touch）
   - 字号：2.25rem
   - 字重：300
   - 字体：Playfair Display
   - 字间距：-0.015em

2. 描述文本
   - 字号：1.125rem
   - 行高：1.8
   - 字重：300
   - 颜色：text-secondary

3. 按钮（Contact Me）
   - 内边距：var(--spacing-md) var(--spacing-2xl)
   - 背景：accent-primary
   - 文本：bg-primary
   - 圆角：6px
   - 边框：2px solid accent-primary
```

**按钮交互**：
- 悬停：背景透明，文本accent-primary
- 位移：translateY(-2px)
- 过渡时间：0.3s ease
- 焦点：2px solid accent-primary

---

## 2. 移除的复杂元素

### 2.1 已移除的组件

1. **时间轴组件（TimelineSection）**
   - 移除原因：过于复杂，不符合极简主义原则
   - 替代方案：简化为概念卡片展示

2. **技能进度条（SkillsSection）**
   - 移除原因：视觉噪音过多，分散注意力
   - 替代方案：在概念区域间接体现技能

3. **统计数据（StatsSection）**
   - 移除原因：数字展示过于商业化
   - 替代方案：通过作品展示实力

4. **推荐阅读（RecommendedReadingSection）**
   - 移除原因：增加页面复杂度
   - 替代方案：在博客页面展示

5. **最新动态（LatestUpdatesSection）**
   - 移除原因：信息过载
   - 替代方案：简化为联系区域

6. **横向滚动展示（highlight-scroll-section）**
   - 移除原因：交互复杂，影响用户体验
   - 替代方案：静态英雄区域

### 2.2 简化的动画效果

**移除的动画**：
- 复杂的滚动指示器
- 箭头脉冲动画
- 图片缩放动画
- 多重阴影效果

**保留的动画**：
- 简单的fadeInUp（0.6s ease-out）
- 柔和的悬停位移（translateY）
- 统一的过渡效果（0.3s ease）

---

## 3. 极简主义设计规范

### 3.1 大量留白原则

**垂直间距系统**：
```
--spacing-xs: 0.25rem    (4px)
--spacing-sm: 0.5rem     (8px)
--spacing-md: 1rem       (16px)
--spacing-lg: 1.5rem     (24px)
--spacing-xl: 2rem       (32px)
--spacing-2xl: 3rem      (48px)
--spacing-3xl: 4rem      (64px)
--spacing-4xl: 6rem      (96px)
```

**区域内边距**：
- Hero区域：var(--spacing-3xl) 上下
- Concepts区域：var(--spacing-4xl) 上下
- Works区域：var(--spacing-4xl) 上下
- Contact区域：var(--spacing-4xl) 上下

**内容间距**：
- 标题与副标题：var(--spacing-md)
- 副标题与分隔线：var(--spacing-xl)
- 分隔线与描述：var(--spacing-xl)
- 描述与按钮：var(--spacing-2xl)

### 3.2 统一排版系统

**字体家族**：
```
标题字体：'Playfair Display', 'Georgia', serif
正文字体：'Inter', -apple-system, BlinkMacSystemFont, sans-serif
代码字体：'SF Mono', 'Fira Code', monospace
```

**字重规范**：
```
极细（300）：主标题、副标题
常规（400）：卡片标题、按钮
中等（500）：强调文本（极少使用）
```

**字号系统**：
```
H1（主标题）：4.5rem（桌面）
H2（区域标题）：2.25rem
H3（卡片标题）：1.5rem
正文：1.125rem
小文本：0.9rem
```

**字间距**：
```
标题：-0.02em（紧凑）
副标题：0.01em（标准）
正文：0.005em（自然）
小文本：0.02em（宽松）
```

**行高系统**：
```
标题：1.1-1.2（紧凑）
副标题：1.2-1.3（标准）
正文：1.7-1.8（舒适）
```

### 3.3 简化动画规范

**动画时长**：
```
快速：0.15s（极少使用）
标准：0.3s（悬停效果）
慢速：0.6s（入场动画）
```

**缓动函数**：
```
ease-out：入场动画（自然减速）
ease：悬停效果（平滑过渡）
```

**动画类型**：
```
fadeInUp：从下淡入（主要）
translateY：垂直位移（悬停）
```

**动画原则**：
- 只保留必要的动画
- 所有动画都应支持prefers-reduced-motion
- 动画时长不超过0.6s
- 避免多重动画叠加

---

## 4. 响应式设计规范

### 4.1 断点系统

```
小屏（Mobile）：    < 480px
中屏（Mobile-L）：  480px - 767px
平板（Tablet）：    768px - 1023px
桌面（Desktop）：   1024px - 1439px
大屏（Large）：    ≥ 1440px
```

### 4.2 响应式字体

**Hero标题**：
```
≥ 1440px：5rem
1024-1439px：4rem
768-1023px：3.5rem
480-767px：2.75rem
< 480px：2.25rem
```

**区域标题**：
```
桌面：2.25rem
平板：2rem
移动：1.75rem
小屏：1.5rem
```

**正文**：
```
桌面：1.125rem
平板：1rem
移动：0.95rem
小屏：0.9rem
```

### 4.3 响应式布局

**网格布局**：
```
桌面（≥768px）：
- Concepts：3列
- Works：3列

平板（768-1023px）：
- Concepts：2列
- Works：2列

移动（< 768px）：
- Concepts：1列
- Works：1列
```

**区域高度**：
```
桌面：80vh
平板：70vh
移动：60vh
```

**内边距**：
```
桌面：var(--spacing-4xl)
平板：var(--spacing-3xl)
移动：var(--spacing-2xl)
```

### 4.4 触摸优化

**触摸目标**：
- 最小尺寸：44x44px
- 按钮内边距：var(--spacing-sm) var(--spacing-xl)
- 链接间距：var(--spacing-md)

**触摸反馈**：
- 悬停效果在触摸设备上禁用
- 使用:active状态提供反馈
- 避免复杂的触摸手势

---

## 5. 可访问性要求

### 5.1 WCAG 2.1 AA级合规

**颜色对比度**：
- 正常文本：至少4.5:1
- 大文本（18pt+）：至少3:1
- 图形元素：至少3:1

**焦点可见性**：
- 焦点指示器：2px solid accent-primary
- 焦点偏移：2px
- 焦点样式：outline

**键盘导航**：
- 所有交互元素可通过键盘访问
- Tab顺序符合逻辑
- 焦点陷阱在模态框中

### 5.2 语义化HTML

**正确的元素使用**：
```
<section>：主要区域
<article>：独立内容块
<h1>-<h6>：标题层次
<nav>：导航区域
<header>：页面头部
<footer>：页面底部
<button>：交互按钮
<a>：链接
```

**ARIA属性**：
```
aria-label：描述性标签
aria-labelledby：关联标签
aria-describedby：关联描述
role：角色定义（必要时）
```

### 5.3 屏幕阅读器支持

**文本替代**：
- 图片：alt文本
- 图标：aria-label
- 装饰元素：aria-hidden="true"

**结构标记**：
- 正确的标题层次
- 列表使用<ul>/<ol>
- 表格使用<th>/<td>

### 5.4 用户偏好支持

**减少动画**：
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**高对比度**：
```css
@media (prefers-contrast: high) {
  .concept-card,
  .work-card {
    border-width: 2px;
  }
}
```

**深色模式**：
- 使用CSS变量
- 支持系统偏好
- 平滑过渡

### 5.5 表单可访问性

**标签关联**：
- 每个输入框都有label
- 使用for/id关联
- 必填字段标记

**错误提示**：
- 清晰的错误消息
- 关联到输入框
- 提供修正建议

**验证反馈**：
- 即时验证
- 视觉和文本反馈
- ARIA live区域

---

## 6. 与现有设计风格的完美融合

### 6.1 色彩系统兼容性

**使用现有CSS变量**：
```css
--bg-primary: var(--bg-primary-light)
--bg-secondary: var(--bg-secondary-light)
--bg-tertiary: var(--bg-tertiary-light)
--text-primary: var(--text-primary-light)
--text-secondary: var(--text-secondary-light)
--text-tertiary: var(--text-tertiary-light)
--accent-primary: #404040
--accent-secondary: #737373
--accent-tertiary: #a3a3a3
```

**主题切换支持**：
- 浅色主题：[data-theme="light"]
- 深色主题：[data-theme="dark"]
- 平滑过渡：var(--transition-normal)

### 6.2 字体系统一致性

**保持现有字体**：
- Playfair Display：标题
- Inter：正文
- SF Mono：代码

**字重保持一致**：
- 300：标题
- 400：正文
- 500：强调（极少使用）

### 6.3 间距系统统一

**使用现有间距变量**：
```css
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem
--spacing-2xl: 3rem
--spacing-3xl: 4rem
--spacing-4xl: 6rem
```

### 6.4 玻璃效果兼容

**使用现有玻璃变量**：
```css
--glass-bg: var(--glass-bg-light)
--glass-border: var(--glass-border-light)
--glass-shadow: var(--glass-shadow-light)
--glass-shadow-hover: var(--glass-shadow-hover-light)
--glass-backdrop: blur(12px)
```

**应用方式**：
- 卡片边框：var(--glass-border)
- 悬停阴影：var(--glass-shadow)
- 背景模糊：var(--glass-backdrop)

### 6.5 过渡效果统一

**使用现有过渡变量**：
```css
--transition-fast: 0.15s ease
--transition-normal: 0.25s ease
--transition-slow: 0.4s ease
```

**应用原则**：
- 悬停效果：0.3s ease
- 入场动画：0.6s ease-out
- 主题切换：var(--transition-normal)

### 6.6 组件复用

**复用现有组件**：
- TheHeader：保持不变
- TheFooter：保持不变
- 主题切换：保持不变

**样式继承**：
- 使用全局CSS变量
- 遵循全局样式规则
- 保持视觉一致性

### 6.7 响应式策略一致

**使用现有断点**：
```css
--breakpoint-sm: 640px
--breakpoint-md: 768px
--breakpoint-lg: 1024px
--breakpoint-xl: 1280px
```

**响应式模式**：
- 移动优先
- 渐进增强
- 优雅降级

---

## 7. 实施指南

### 7.1 文件结构

```
src/components/HomePage/
├── HomePage.vue          # 主组件（已更新）
├── HeroSection.vue       # 英雄区域（可选拆分）
├── ConceptsSection.vue   # 概念区域（可选拆分）
├── WorksSection.vue      # 作品区域（可选拆分）
└── ContactSection.vue    # 联系区域（可选拆分）
```

### 7.2 组件使用

**完整组件**：
```vue
<template>
  <HomePage />
</template>

<script setup>
import HomePage from '@/components/HomePage/HomePage.vue';
</script>
```

**独立组件**（如需拆分）：
```vue
<template>
  <div class="home-page">
    <HeroSection />
    <ConceptsSection />
    <WorksSection />
    <ContactSection />
  </div>
</template>
```

### 7.3 自定义配置

**修改颜色**：
```css
/* 在style.css中修改CSS变量 */
:root {
  --accent-primary: #your-color;
  --accent-secondary: #your-color;
  --accent-tertiary: #your-color;
}
```

**修改字体**：
```css
/* 在style.css中修改字体变量 */
:root {
  --font-heading: 'Your Font', serif;
  --font-body: 'Your Font', sans-serif;
}
```

**修改间距**：
```css
/* 在style.css中修改间距变量 */
:root {
  --spacing-2xl: 4rem; /* 默认3rem */
  --spacing-3xl: 5rem; /* 默认4rem */
  --spacing-4xl: 7rem; /* 默认6rem */
}
```

### 7.4 性能优化

**图片优化**：
- 使用WebP格式
- 响应式图片（srcset）
- 懒加载（loading="lazy"）

**CSS优化**：
- 使用CSS变量
- 避免深层嵌套
- 使用transform和opacity动画

**JavaScript优化**：
- 按需加载组件
- 避免不必要的响应式数据
- 使用computed缓存

---

## 8. 测试清单

### 8.1 视觉测试

- [ ] 所有断点下布局正确
- [ ] 浅色/深色主题切换正常
- [ ] 动画流畅无卡顿
- [ ] 字体渲染清晰
- [ ] 颜色对比度符合标准

### 8.2 功能测试

- [ ] 所有链接可点击
- [ ] 按钮交互正常
- [ ] 键盘导航流畅
- [ ] 触摸交互响应
- [ ] 表单提交正常

### 8.3 可访问性测试

- [ ] 屏幕阅读器测试
- [ ] 键盘导航测试
- [ ] 焦点可见性测试
- [ ] 颜色对比度测试
- [ ] 减少动画测试

### 8.4 性能测试

- [ ] 页面加载速度
- [ ] 动画帧率
- [ ] 内存使用
- [ ] 网络请求优化
- [ ] 图片加载优化

### 8.5 跨浏览器测试

- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] 移动浏览器
- [ ] 旧版浏览器

---

## 9. 维护指南

### 9.1 内容更新

**更新概念卡片**：
```vue
<article class="concept-card">
  <h3 class="concept-title">新标题</h3>
  <p class="concept-description">新描述文本</p>
</article>
```

**更新作品卡片**：
```vue
<a href="/new-path" class="work-card" aria-label="描述">
  <div class="work-image">
    <div class="work-overlay"></div>
  </div>
  <div class="work-info">
    <h4 class="work-title">新作品</h4>
    <p class="work-category">类别</p>
  </div>
</a>
```

### 9.2 样式调整

**调整间距**：
```css
.concepts-section {
  padding: var(--spacing-4xl) 0; /* 修改这里 */
}
```

**调整字体**：
```css
.hero-title {
  font-size: 4.5rem; /* 修改这里 */
}
```

**调整动画**：
```css
.concept-card {
  animation: fadeInUp 0.6s ease-out; /* 修改这里 */
}
```

### 9.3 版本控制

**Git提交规范**：
```
feat: 添加新功能
fix: 修复bug
style: 样式调整
refactor: 重构代码
docs: 文档更新
perf: 性能优化
test: 测试相关
chore: 构建/工具相关
```

**发布流程**：
1. 创建feature分支
2. 开发和测试
3. 提交Pull Request
4. 代码审查
5. 合并到主分支
6. 部署到生产环境

---

## 10. 附录

### 10.1 设计资源

**字体**：
- Playfair Display: https://fonts.google.com/specimen/Playfair+Display
- Inter: https://fonts.google.com/specimen/Inter

**图标**：
- Heroicons: https://heroicons.com/
- Phosphor Icons: https://phosphoricons.com/

**色彩工具**：
- Coolors: https://coolors.co/
- Adobe Color: https://color.adobe.com/

### 10.2 参考资源

**设计灵感**：
- Awwwards: https://www.awwwards.com/
- SiteInspire: https://www.siteinspire.com/
- Minimalism: https://minimalism.com/

**可访问性**：
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- A11Y Project: https://www.a11yproject.com/
- WebAIM: https://webaim.org/

**性能优化**：
- Web.dev: https://web.dev/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- PageSpeed Insights: https://pagespeed.web.dev/

### 10.3 技术栈

**前端框架**：
- Vue 3
- Vite

**样式方案**：
- CSS Variables
- Scoped CSS
- CSS Grid
- Flexbox

**开发工具**：
- VS Code
- Chrome DevTools
- Vue DevTools

### 10.4 联系方式

**设计团队**：
- UI/UX Designer: [Your Name]
- Email: [your.email@example.com]

**开发团队**：
- Frontend Developer: [Your Name]
- Email: [your.email@example.com]

---

## 结语

本UI设计规范旨在为Richard Fury的个人网站创建一个极简主义、优雅且功能完善的首页。通过大量留白、统一排版和简化动画，我们创造了一个既美观又实用的用户体验。

该设计完全符合现有的设计风格，同时移除了所有不必要的复杂元素，专注于核心内容的展示。通过响应式设计和可访问性优化，确保所有用户都能获得良好的浏览体验。

如有任何问题或建议，请随时联系设计团队。
