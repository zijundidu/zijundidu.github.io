# Kraken 的个人主页

基于 [Astro](https://astro.build) + [Firefly](https://github.com/CuteLeaf/Firefly) 主题构建的静态个人博客，部署于 GitHub Pages。

**访问地址**：https://zijundidu.github.io

---

## 功能特性

- 📝 **文章系统**：Markdown 写作，分类/标签/系列/归档，全文搜索（Pagefind），RSS/Atom 订阅；`/posts/maintenance/` 由构建时自动渲染根目录 `MAINTENANCE.md`
- 💬 **评论系统**：Giscus + GitHub Discussions，GitHub 登录即可评论
- 🌓 **主题切换**：亮/暗色，跟随系统
- 📊 **站点统计**：运行天数、文章/字数统计、Vercount 访问量与访客数、累计评论实时统计（只计现存页面）
- 🕒 **站点时间线**：关于页自动汇总所有文章、动态与旅行记录的发布记录
- 📷 **动态/相册**：生活碎片随手记，带位置和照片
- 🗺️ **诗与远方**：中国地图旅行足迹（旅行/徒步/登山/自驾，按省份聚合）
- 💻 **项目展示**：项目卡片页，自动拉取 GitHub 仓库信息
- 🔗 **友链 + 留言板**
- 🚀 **CI/CD**：推送 main 自动构建部署
- 🔀 **404 自动跳转**：404 页 5 秒倒计时后自动返回首页
- 🎵 **背景音乐**：首页背景音乐（可开关）

## 技术栈

| 技术 | 用途 |
|:---|:---|
| [Astro](https://astro.build) | 静态站点生成器 |
| [Firefly](https://github.com/CuteLeaf/Firefly) | 博客主题（基于 Fuwari 二开，MIT） |
| [pnpm](https://pnpm.io) | 包管理（强制） |
| [Tailwind CSS](https://tailwindcss.com) | 样式 |
| [Giscus](https://giscus.app) | 评论系统 |
| [Vercount](https://vercount.one) | 访问统计（不蒜子兼容） |
| GitHub Pages + Actions | 托管与自动部署 |

## 本地开发

```bash
# 要求 Node >= 22.23，使用 pnpm
pnpm install
pnpm dev        # 开发服务器
pnpm build      # 构建（含搜索索引）
pnpm preview    # 预览构建产物
```

## 写作与维护

详见 MAINTENANCE.md

## 许可证

站点源码基于 [Fuwari](https://github.com/saicaca/fuwari)（MIT）及其二次开发 [Firefly](https://github.com/CuteLeaf/Firefly）（MIT）。
