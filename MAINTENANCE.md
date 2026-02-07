# 个人主页维护指南

## 项目结构

```bash
zijundidu.github.io/
├── public/                    # 静态资源
│   └── images/               # 图片文件
├── src/
│   ├── components/           # 可复用组件
│   ├── content/              # 内容集合（核心）
│   │   ├── config.ts        # 内容集合配置
│   │   ├── life/            # 生活记录
│   │   └── posts/           # 文章
│   ├── layouts/              # 页面布局
│   └── pages/                # 页面路由
└── .github/workflows/        # 自动部署
```

## 日常维护

### 写文章

位置：src/content/posts/

1. 创建 .md 文件，文件名即 URL
2. 填写 frontmatter：

```bash
---
title: 文章标题
description: 文章描述
pubDate: 2025-02-04
tags: ['标签1', '标签2']
draft: false
---
```

正文内容，支持 Markdown 语法。

3. 提交部署：

git add .
git commit -m "add: 新文章标题"
git push

### 发生活记录

位置：src/content/life/

```bash
---
title: 记录标题
description: 简短描述
pubDate: 2025-02-04
location: 地点
cover: /images/xxx.jpg
---
```

正文内容。

图片放到 public/images/

## 新增分类（如旅行）

1. 创建文件夹 src/content/travel/
2. 更新 src/content/config.ts 添加集合配置
3. 创建列表页 src/pages/travel.astro
4. 创建详情页 src/pages/travel/[slug].astro
5. 在 BaseLayout.astro 添加导航链接

## 常用命令

npm run dev      # 本地预览
npm run build    # 构建检查
git add .        # 暂存更改
git commit -m "描述"  # 提交更改
git push         # 推送到 GitHub（自动部署）

## 查看评论

访问 https://github.com/zijundidu/zijundidu.github.io/discussions