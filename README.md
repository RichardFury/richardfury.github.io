# Personal Portfolio Website

这是一个个人作品集网站，使用Vue 3和Vite构建，包含多个功能模块展示个人信息、作品、研究、生活和博客内容。

## 📋 项目概述

本项目是一个现代化的个人网站，旨在全面展示个人信息、作品集、研究成果、生活点滴和博客文章。网站采用响应式设计，支持明暗主题切换，并提供了丰富的交互功能。

## 🚀 主要功能

- **首页展示** - 个人简介和快速导航
- **作品集展示** - 项目成果和案例展示
- **研究页面** - 学术研究和技术探索内容
- **生活页面** - 个人生活分享和兴趣爱好
- **联系方式** - 提供多种联系方式
- **博客系统** - 文章发布和评论功能
  - Markdown格式的博客文章
  - 评论系统（使用IndexedDB持久化存储）
- **图片画廊** - 照片展示和浏览
- **主题切换** - 支持明暗两种主题，并可跟随系统设置
- **响应式设计** - 适配各种设备屏幕

## 🛠 技术栈

- **前端框架**: Vue 3 + Vite
- **路由管理**: Vue Router 4
- **动画效果**: GSAP
- **图标库**: FontAwesome
- **存储方案**: IndexedDB（浏览器端持久化）
- **开发工具**: Vite, ESLint

## 📁 项目结构

```
src/
├── components/          # Vue组件
│   ├── ContactPage/     # 联系页面组件
│   ├── GalleryPage/     # 画廊页面组件
│   ├── HomePage/        # 首页组件
│   ├── LifePage/        # 生活页面组件
│   ├── PortfolioPage/   # 作品集页面组件
│   ├── ResearchPage/    # 研究页面组件
│   ├── ThoughtPage/     # 博客页面组件
│   ├── TheFooter.vue    # 页脚组件
│   ├── TheHeader.vue    # 页眉组件
│   ├── ThePreloader.vue # 预加载组件
│   └── ThemeToggle.vue  # 主题切换组件
├── data/                # 静态数据
│   ├── blog/            # 博客文章(Markdown格式)
│   └── galleryData.json # 画廊数据
├── services/            # 服务层
│   ├── blogService.js   # 博客服务
│   ├── dbService.js     # 数据库服务
│   └── galleryService.js # 画廊服务
├── utils/               # 工具函数
├── App.vue              # 根组件
├── main.js              # 入口文件
└── style.css            # 全局样式
```

## 📦 安装和运行

### 前置要求

- Node.js >= 16.x
- npm >= 7.x

### 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd newprofile
```

2. 安装依赖
```bash
npm install
```

3. 开发环境运行
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

5. 预览生产构建
```bash
npm run preview
```

## 📝 博客功能使用

### 添加新博客文章

1. 在 `src/data/blog/` 目录下创建新的Markdown文件
2. 使用以下格式添加文章内容：
```markdown
---
title: 文章标题
date: 2024-01-01
category: 分类
tags: [标签1, 标签2]
---

这里是文章内容...
```

### 评论系统

评论系统使用IndexedDB在浏览器端进行持久化存储，确保页面刷新后评论不会丢失。

## 🎨 主题定制

网站支持自动跟随系统主题设置，也可以手动切换明暗主题。主题样式定义在全局CSS变量中，可以在`style.css`中进行自定义。

## 📄 许可证

本项目采用MIT许可证 - 查看 <mcfile name="LICENSE" path="/Users/storm/Codespace/newprofile/LICENSE"></mcfile> 文件了解详情

## 👨‍💻 作者

Richard Fury
