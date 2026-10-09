# 个人主页维护指南

## 快速开始

```bash
pnpm install     # 安装依赖（Node >= 22.23）
pnpm dev         # 本地预览
pnpm build       # 构建检查
git push         # 推送到 GitHub（自动部署）
```

## 项目结构

```bash
src/
├── config/          # 全部站点配置（见下）
├── content/
│   ├── posts/       # 文章（长文）
│   ├── dynamic/     # 动态/生活碎片（进时间线）
│   ├── projects/    # 项目卡片
│   └── spec/        # 关于 / 友链 / 留言板文案
├── components/
│   ├── widget/SiteStats.astro      # 首页统计（含访问量/评论数）
│   ├── widget/SiteTimeline.astro   # 关于页自动时间线
│   └── analytics/BusuanziAnalytics.astro  # 不蒜子统计
└── pages/           # 页面路由
```

## 写文章

位置：`src/content/posts/`，或直接 `pnpm new-post` 脚手架。

```yaml
---
title: 文章标题            # 必填
published: 2026-10-09    # 必填，发布时间
description: 文章描述     # 列表页摘要
tags: [标签1, 标签2]
category: 分类名
draft: false             # true = 草稿（生产构建隐藏）
pinned: false            # true = 置顶
image: ./images/cover.jpg # 封面图（可选）
---
```

正文支持 GitHub 风格 Markdown、代码高亮、数学公式（KaTeX）、Mermaid 图表、图片灯箱。

## 发生活动态

位置：`src/content/dynamic/`，文件名格式 `YYYY-MM-DD-HHMMSS.md`：

```yaml
---
published: 2026-10-09 10:30:00
location: 上海           # 可选
---
```

正文随便写，图片放 `public/images/` 后以 `/images/xxx.jpg` 引用。动态会出现在：动态页、关于页时间线、首页侧边栏「最新动态」。

## 加项目

位置：`src/content/projects/`，frontmatter：`title`、`published`、`description`、`tags`、`status`（如"维护中"）、`link: [{ label, icon, value }]`。

## 常用配置速查（src/config/）

| 文件 | 改什么 |
|:---|:---|
| `siteConfig.ts` | 站点标题/描述/主题色/页面开关/每页文章数 |
| `profileConfig.ts` | 头像、昵称、签名、社交链接 |
| `navBarConfig.ts` | 导航栏菜单 |
| `sidebarConfig.ts` | 侧边栏组件（公告/音乐/统计/日历等） |
| `commentConfig.ts` | 评论系统（当前 Giscus） |
| `announcementConfig.ts` | 公告内容（需在 sidebarConfig 启用公告组件） |

## 统计说明

- **访问量/访客数**：不蒜子，浏览器加载时计数，数据存第三方，零配置零后端
- **评论总数**：构建时自动从 GitHub Discussions 拉取；发布新评论后需重新部署才会更新显示数字
- **时间线**：构建时生成，同理随部署自动更新

## 查看与管理评论

评论托管在 GitHub Discussions：https://github.com/zijundidu/zijundidu.github.io/discussions
