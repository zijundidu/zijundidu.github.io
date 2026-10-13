# AGENTS.md — 给 AI 编码代理的项目说明

Kraken 的个人主页，基于 **Astro 7 + Firefly 主题**（[CuteLeaf/Firefly](https://github.com/CuteLeaf/Firefly)，源自 saicaca/fuwari，MIT 协议）的静态博客，部署在 GitHub Pages：https://zijundidu.github.io

## 技术栈与命令

- **包管理必须用 pnpm**（`preinstall` 强制拦截 npm），Node ≥ 22.23，CI 用 Node 24
- `pnpm install` / `pnpm dev` / `pnpm build` / `pnpm preview`
- `pnpm build` = `astro build` + pagefind 搜索索引；**不需要** lqips/字体子集等重型预处理脚本（产物已预生成在 `src/constants/`）
- 无测试框架；验证方式 = `pnpm build` 成功 + `pnpm preview` 抽查页面

## 内容模型（src/content/）

| 集合 | 用途 | frontmatter |
|:---|:---|:---|
| `posts/` | 长文章（维护指南文章由 postsLoader 构建时从根目录 MAINTENANCE.md 合成，目录可为空） | `title`、`published`（必填），`description`/`tags`/`category`/`image`/`draft`/`updated`/`pinned`/`series` 可选 |
| `dynamic/` | 动态/生活碎片（时间线） | `published`（必填，**必须带时区偏移**如 `+08:00`），`location`/`pinned` 可选，文件名建议 `YYYY-MM-DD-HHMMSS.md` |
| `travel/` | 诗与远方旅行记录 | `title`、`province`（省常用名）、`type`（旅行/徒步/登山/自驾）、`date`、`location`/`description`/`image` 可选 |
| `projects/` | 项目卡片 | `title`、`published`（必填），`description`/`tags`/`link[]`/`status` 可选 |
| `spec/` | 关于/友链/留言板文案 | about.md / friends.mdx / guestbook.md |

新增文章：`pnpm new-post`；发动态：`pnpm new-dynamic <内容>`。发布后推 main 即自动部署。

## 定制功能（改动主题时留意）

- **访问量/访客数**：Vercount 纯前端统计（组件沿用旧名 `src/components/analytics/BusuanziAnalytics.astro`，锚点兼容不蒜子）。数字填充到 `#busuanzi_value_site_pv` / `#busuanzi_value_uv`；展示行在 `src/components/widget/SiteStats.astro`
- **累计评论数**：双层口径——构建时 `src/utils/comment-stats.ts` 拉 GitHub Discussions 作后备；页面加载后浏览器实时重算（只统计 giscus 机器人创建且路径仍存在于站内的 discussion），删除文章后自动剔除孤儿
- **站点时间线**：`src/components/widget/SiteTimeline.astro`，合并 posts + dynamic + travel 按时间倒序，构建时静态生成；已挂载到 `src/pages/about.astro`
- **评论**：Giscus，配置在 `src/config/commentConfig.ts`（repo `zijundidu/zijundidu.github.io`，`mapping: "pathname"`，与历史 discussion 标题一致，勿改）
- **时间口径**：全站北京时间。`siteConfig.timezone`（Asia/Shanghai）控制显示；动态 frontmatter 时间必须带 `+08:00`，无偏移会被 YAML 按 UTC 解析
- **导航栏切图按钮**：`#bg-wallpaper-next` 派发 `bannerCarouselNext` 事件，壁纸轮播脚本（WallpaperSection）监听并切下一张；背景视频功能已移除

## 已删除的功能（2026-10-13 多轮清理，git 历史可找回）

哔哩哔哩/Bangumi/VNDB/MyAnimeList/书签导航整页、看板娘 Live2D/Spine、樱花特效、背景视频、SiteInfo 组件、GreatVibes 示例字体、i18n 多语言（现中文单语）。完整清单见 MAINTENANCE.md 5.9。

## 主要配置入口（src/config/）

`siteConfig.ts`（标题/URL/页面开关/发帖布局）、`profileConfig.ts`（头像/昵称/签名/社交链接）、`navBarConfig.ts`（导航）、`sidebarConfig.ts`（侧边栏组件）、`commentConfig.ts`、`analyticsConfig.ts`。页面开关在 siteConfig 置 false 会自动 404 并隐藏导航项。

## 部署

推 `main` → `.github/workflows/deploy.yml`：pnpm + Node 24 → `pnpm build` → `dist/` 上传 Pages。`username.github.io` 仓库，**无 base 路径**。

## 注意事项

- `src/constants/`（lqips.json、github-card-data.json 等）是预生成产物，内容里没有 `::github{repo=...}` 指令时无需重新生成
- 不蒜子和 GitHub API 都是匿名第三方服务，国内网络下偶发加载慢属正常
- 主题版权要求保留页脚 "Powered by Astro & Firefly"，勿删
- 仓库历史里保留有迁移前旧版手写 Astro 站点的提交，检索历史时注意区分
