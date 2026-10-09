# AGENTS.md — 给 AI 编码代理的项目说明

本文件面向不了解本项目的 AI 编码代理，描述项目的架构、命令与约定。项目本身的中文文档见 `README.md`（项目简介）和 `MAINTENANCE.md`（站长维护指南）。

## 项目概述

这是 Kraken 的个人主页（`my-portfolio`），一个基于 **Astro 5** 的静态个人博客，部署在 GitHub Pages，访问地址 https://zijundidu.github.io。

功能特性：

- 📝 文章系统：Markdown 写作、标签分类、RSS 订阅
- 💻 项目展示：构建时从 GitHub API 拉取仓库列表
- 📷 生活记录：照片展示、位置标记
- 💬 评论系统：Giscus + GitHub Discussions
- 🌓 深色/浅色主题切换
- 🔍 标签云、📊 阅读进度条、🔎 图片灯箱

## 技术栈

| 技术 | 用途 |
|:---|:---|
| [Astro](https://astro.build) ^5.17.1 | 静态站点生成器（无 UI 框架，无 React/Vue） |
| [@astrojs/rss](https://docs.astro.build/en/guides/rss/) ^4.0.15 | RSS 订阅生成 |
| Zod（内置于 `astro:content`） | 内容集合 frontmatter 校验 |
| [GitHub Pages](https://pages.github.com) | 托管 |
| [GitHub Actions](https://github.com/features/actions) | 自动部署 |
| [Giscus](https://giscus.app) | 评论系统 |

## 常用命令

```bash
npm install       # 安装依赖
npm run dev       # 启动开发服务器（本地预览）
npm run build     # 构建静态站点到 dist/
npm run preview   # 预览构建产物
```

**项目没有配置测试框架、linter 或格式化工具**（无 vitest/eslint/prettier，无 `test` 脚本）。代码正确性的验证方式就是 `npm run build` 能成功构建、`npm run dev` 能正常预览。

提交即部署：推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动执行 `npm ci` → `npm run build`，并把 `dist/` 发布到 GitHub Pages。

## 项目结构

```text
zijundidu.github.io/
├── .gitignore                  # 忽略 node_modules/、dist/、.astro/
├── astro.config.mjs            # Astro 配置（仅设置 site，无 base 路径）
├── package.json                # 脚本与依赖（type: commonjs）
├── public/
│   ├── favicon.svg             # 站点图标
│   └── images/                 # 静态图片资源（正文中以 /images/xxx.jpg 引用）
├── src/
│   ├── content/
│   │   ├── config.ts           # 内容集合定义（Zod schema，核心配置）
│   │   ├── posts/              # 文章集合（Markdown，文件名即 URL slug）
│   │   └── life/               # 生活记录集合
│   ├── layouts/
│   │   └── BaseLayout.astro    # 全站布局：导航、页脚、主题、进度条、SEO 标签
│   ├── styles/
│   │   └── global.css          # 全局样式：主题变量、.prose 排版、导航/页脚
│   ├── lib/
│   │   └── content.ts          # 内容集合公共工具（publishedOnly 草稿过滤）
│   ├── components/
│   │   ├── Giscus.astro        # 评论组件（动态加载 giscus.app）
│   │   └── ImageLightbox.astro # 图片灯箱（点击正文图片放大）
│   └── pages/
│       ├── index.astro         # 首页（含热门标签云）
│       ├── posts.astro         # 文章列表
│       ├── posts/[slug].astro  # 文章详情（静态生成，含结构化数据）
│       ├── life.astro          # 生活记录列表
│       ├── life/[slug].astro   # 生活记录详情
│       ├── projects.astro      # 项目页（构建时拉取 GitHub 仓库）
│       ├── about.astro         # 关于页
│       ├── tags.astro          # 全部标签
│       ├── tags/[tag].astro    # 按标签筛选文章
│       ├── 404.astro           # 自定义 404 页
│       └── rss.xml.js          # RSS 订阅
└── .github/workflows/deploy.yml  # GitHub Pages 自动部署
```

## 内容模型（src/content/config.ts）

项目使用 Astro Content Collections 管理内容，frontmatter 由 Zod schema 校验：

**posts 集合**（`src/content/posts/`）：

```yaml
---
title: 文章标题           # 必填
description: 文章描述      # 必填
pubDate: 2025-02-04      # 必填，日期
updatedDate: 2025-02-05  # 可选
tags: ['标签1', '标签2']  # 可选，默认 []
draft: false             # 可选，默认 false；生产构建时会隐藏 draft 文章
---
```

**life 集合**（`src/content/life/`）：

```yaml
---
title: 记录标题
description: 简短描述      # 可选
pubDate: 2025-02-04
location: 地点            # 可选
cover: /images/xxx.jpg   # 可选，封面图路径（指向 public/images/）
draft: false
---
```

新增内容类别（如旅行）的步骤：新建集合目录 → 在 `config.ts` 注册集合 → 创建列表页和 `[slug].astro` 详情页 → 在 `BaseLayout.astro` 导航中加入链接。

## 代码风格约定

- **语言**：站点面向中文用户，页面文案、注释、提交信息均使用中文；`<html lang="zh-CN">`。
- **组件**：`.astro` 单文件组件，`<style>` 默认 scoped；正文排版类名统一为 `.prose`。
- **样式**：无 Tailwind / CSS 框架。全局样式与主题变量集中定义在 `src/styles/global.css`：基础变量 `--bg`、`--text`、`--accent`、`--secondary`、`--border`，辅助文字色 `--text-secondary`、`--text-muted`、`--text-faint`，浅色主题由 `html[data-theme="light"]` 统一覆盖。正文排版 `.prose` 也在这里统一定义，详情页不要再重复声明。页面大量使用内联 `style` 属性，取色一律用上述 CSS 变量，不要在页面里硬编码 `#666`/`#888` 等色值，以保证两套主题下都可读。
- **主题机制**：主题偏好存 `localStorage`（键 `theme`，默认 `dark`）。防闪烁的内联脚本必须在任何渲染之前执行；`color-scheme` 跟随主题变化；`Giscus.astro` 通过 `MutationObserver` 监听 `data-theme` 变化同步评论主题。
- **数据获取**：页面在 frontmatter（组件脚本）中用顶层 `await` 取数，如 `projects.astro` 构建时请求 GitHub API（用户名硬编码为 `zijundidu`，过滤 fork 仓库，取最近 10 个）。外部 API 调用必须有 try/catch 容错，失败时降级为空数据并提示，不能让构建中断。
- **路由**：动态路由用 `getStaticPaths()` 静态生成（`posts/[slug].astro`、`life/[slug].astro`、`tags/[tag].astro`）。
- **草稿过滤**：统一使用 `src/lib/content.ts` 的 `publishedOnly()`（生产构建排除草稿、开发环境全量可见）。**列表页和 `getStaticPaths()` 都必须用它**，否则草稿页会被静态生成、通过直链访问到。
- **SEO**：`BaseLayout` 支持 `title` / `description` / `ogType` 参数，输出 meta description、canonical、Open Graph 标签；文章和生活详情页额外输出 JSON-LD 结构化数据。新页面应随手传入 description。

## 部署

- 推送到 `main` 分支（或手动触发 `workflow_dispatch`）触发 `.github/workflows/deploy.yml`。
- CI 环境：ubuntu-latest + Node 20，执行 `npm ci` 和 `npm run build`，产物 `dist/` 经 `actions/upload-pages-artifact` → `actions/deploy-pages` 发布。
- `astro.config.mjs` 只设置了 `site: 'https://zijundidu.github.io'`，因为是 `username.github.io` 仓库，**没有配置 `base` 路径**。若迁移到项目页面（非用户名仓库），需要加 `base: '/仓库名'`。

## 注意事项

- **已配置 `.gitignore`**：`node_modules/`、`.astro/` 等已从 git 跟踪中移除（`dist/` 本就不在跟踪范围内）。这是历史遗留修复——早期曾把依赖目录提交进仓库。现在 clone 后需先 `npm install`；`.astro/` 是构建时自动生成的类型文件，不要手动提交。
- **硬编码标识符**：Giscus 的 `data-repo-id`、`data-category-id`，GitHub 用户名、站点 URL 等均硬编码在源码中（`src/components/Giscus.astro`、`src/pages/projects.astro`、`astro.config.mjs`）。换仓库或换评论系统时需要同步修改。
- **无环境变量/密钥**：项目不依赖任何 `.env` 或 secret，GitHub API 以匿名方式调用。
- **外部依赖**：页面引用了 Google Fonts 和 giscus.app 的第三方脚本，国内网络环境下可能加载缓慢或失败，属预期行为。
- **评论数据**：评论托管在 GitHub Discussions（https://github.com/zijundidu/zijundidu.github.io/discussions），不在代码库中。
