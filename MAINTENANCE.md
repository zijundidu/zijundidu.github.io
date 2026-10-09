# 个人主页维护指南（Kraken）

基于 Astro 7 + Firefly 主题。所有内容都是 **Markdown 文件 + 配置文件**，本地改完 `git push` 自动部署。

## 0. 快速开始

```bash
pnpm install      # 安装依赖（Node >= 22.23，只用 pnpm 不用 npm）
pnpm dev          # 本地预览（http://localhost:4321）
pnpm build        # 完整构建检查
git add -A && git commit -m "说明" && git push   # 部署
```

**发布任何东西的完整流程**：改文件 → `pnpm dev` 本地看效果 → `git push` → 等 1-2 分钟（Actions 构建）→ 线上生效。GitHub Actions 进度：https://github.com/zijundidu/zijundidu.github.io/actions

---

## 1. 修改主页背景图片

配置文件：`src/config/backgroundWallpaper.ts`

**四种模式**（`mode` 字段）：
- `"banner"`（当前）：首页顶部横幅背景，文章页是纯色
- `"fullscreen"`：全屏壁纸
- `"overlay"`：透明覆盖层
- `"none"`：纯色背景，无图

**换图步骤**：
1. 把图片放到 `public/assets/images/`（建议压缩到 500KB 以内，avif/webp 格式最佳）
2. 修改 `src.desktop` 和 `src.mobile`：

```ts
// 单张固定图
desktop: "/assets/images/my-banner.avif",
mobile: "/assets/images/my-banner-mobile.avif",

// 多张随机（每次刷新随机显示一张）
desktop: [
  "/assets/images/banner1.avif",
  "/assets/images/banner2.avif",
],

// 随机图 API（懒人方案，每次刷新一张网络图）
desktop: "https://t.alcy.cc/pc",
mobile: "https://t.alcy.cc/mp",
```

注意：远程 URL 和 public 目录的图片不会做压缩优化，务必控制体积。

**背景视频**（可选）：`playerEnable: true` 时导航栏出现视频按钮，`src.video` 填视频地址（mp4/webm），不填则只有按钮无视频。

## 2. 修改主页背景音乐

配置文件：`src/config/musicConfig.ts`。**音乐组件当前是关闭的**，要显示还需两个开关。

**启用步骤**：
1. `src/config/sidebarConfig.ts` 里搜索 `type: "music"`，把 `enable: false` 改成 `true`（桌面侧边栏）；移动端在下方 `mobileBottomComponents` 里也有，按需开
2. 配置 `src/config/musicConfig.ts`，两种方式二选一：

**方式 A：网易云歌单（推荐）**
```ts
mode: "meting",
meting: {
  server: "netease",     // netease=网易云, tencent=QQ音乐, kugou=酷狗
  type: "playlist",      // playlist=歌单, song=单曲, album=专辑
  id: "你的歌单ID",       // 网页版打开歌单，URL 最后那串数字
}
```
歌单 ID 获取：网页版 music.163.com 打开歌单 → 地址栏 `playlist?id=123456` → 取数字。

**方式 B：本地音乐**
```ts
mode: "local",
local: {
  playlist: [
    { name: "歌名", artist: "歌手", url: "/assets/music/song.mp3", cover: "/assets/music/cover.webp", lrc: "" },
  ],
}
```
把 mp3 放到 `public/assets/music/`。

其他常用项：`volume` 音量（0-1）、`playMode: "list" | "one" | "random"`、`showInNavbar` 是否在导航栏显示播放器入口。

## 3. 手动新增文章

**方式一（推荐）**：命令行脚手架，自动带模板
```bash
pnpm new-post        # 交互式创建 src/content/posts/ 下的新文章
```

**方式二（手动）**：在 `src/content/posts/` 新建 `.md` 文件，文件名即 URL（如 `my-first-post.md` → `/posts/my-first-post/`）。

```yaml
---
title: 文章标题              # 必填
published: 2026-10-09      # 必填，发布时间
description: 列表页显示的摘要
tags: [标签1, 标签2]
category: 分类名            # 一个分类，如：技术 / 随笔
image: ./images/cover.jpg  # 封面图（可选；填 "api" 用随机图）
draft: false               # true=草稿，本地可见，线上隐藏
pinned: false              # true=置顶
updated: 2026-10-10        # 更新时间（可选）
series: 系列名             # 系列文章（可选）
seriesOrder: 1             # 系列内顺序
password: ""               # 文章密码，填了则加密
comment: true              # false 关闭本文评论
---
```

正文就是标准 Markdown，主题自带：代码高亮+折叠+复制、数学公式（`$...$`）、Mermaid 图表（```mermaid 代码块）、提示框（`> [!NOTE]` GitHub 语法）、图片点击放大灯箱。

**正文图片**：放 `public/images/`，正文里写 `![说明](/images/xxx.jpg)`。

## 4. 相册管理与新增

配置文件：`src/config/galleryConfig.ts` + 图片目录 `public/gallery/`。**相册页面当前无任何相册**，按下面步骤添加。

**新增一个相册的步骤**：
1. 在 `public/gallery/` 下建目录，目录名 = 相册 id（如 `public/gallery/tokyo-2026/`），把照片丢进去（jpg/png/webp/avif/gif）
2. 封面规则：目录里放一张名叫 `cover.jpg`（或 cover.webp 等）的图作为封面；不放则用第一张图
3. 在 `galleryConfig.ts` 的 `albums` 数组里加一项：

```ts
{
  id: "tokyo-2026",              # 必须和目录名一致
  name: "东京之行",
  description: "2026 年春天的旅行记录",
  location: "东京",
  date: "2026-04-05",            # 用于排序
  tags: ["旅行", "摄影"],         # 相册页可按标签筛选
  # password: "123",             # 可选，加密相册
  # passwordHint: "提示语",
},
```

4. `git push` 部署。完事——照片不用一张张登记，构建时自动扫描目录。

**管理能力**：标签筛选（页面上方）、密码加密、瀑布流列宽（`columnWidth`，默认 240）、相册按日期排序。删除相册 = 删配置项 + 删目录。

## 5. 其他必知用法

### 5.1 动态（生活碎片/时间线）
- 位置 `src/content/dynamic/`，文件名 `YYYY-MM-DD-HHMMSS.md`（或 `pnpm new-dynamic`）
- frontmatter 只有 `published`（必填）、`location`（可选，显示 📍）
- 会同时出现在：动态页、关于页时间线、首页侧边栏"最新动态"
- 适合：一句话感悟、照片随手发。长文请用文章

### 5.2 项目页
- 手写精选项目：`src/content/projects/`（frontmatter 见 `blog.md` 示例，`link` 数组是按钮）
- "GitHub 仓库"区块：**构建时自动拉取**，无需维护；想改用户名改 `src/pages/projects/index.astro` 顶部的 `GITHUB_USERNAME`

### 5.3 配置速查（src/config/）
| 文件 | 管什么 |
|:---|:---|
| `siteConfig.ts` | 站点标题/描述/关键词/主题色(hue)/页面开关/每页文章数/导航栏样式 |
| `profileConfig.ts` | 头像、昵称、签名、GitHub/邮箱/RSS 链接 |
| `navBarConfig.ts` | 导航栏菜单（增减在 `getDynamicNavBarConfig` 里改） |
| `sidebarConfig.ts` | 侧边栏组件开关（公告/音乐/分类/标签/统计/日历等，每项有 `enable`） |
| `commentConfig.ts` | 评论系统（当前 Giscus，勿动 repo id） |
| `announcementConfig.ts` | 公告内容（要在 sidebarConfig 启用 `announcement` 组件才显示） |
| `galleryConfig.ts` | 相册 |
| `musicConfig.ts` | 背景音乐 |
| `backgroundWallpaper.ts` | 主页背景图/视频 |
| `friends.mdx`（在 content/spec/） | 友链页：改 `site` 对象（自己站点信息）+ 下方友链列表数组 |

### 5.4 页面开关
`siteConfig.ts` 里 `pages` 段：每个页面（友链/留言板/动态/项目/相册/书签/打赏等）`true/false`。设为 `false` 会自动 404 并隐藏导航项。

### 5.5 评论管理
- 评论数据在 GitHub Discussions：https://github.com/zijundidu/zijundidu.github.io/discussions （可删除/回复）
- 首页"累计评论"数字是**构建时**拉取的：新评论出现后，要再次 push 部署才更新
- 同理，关于页时间线也是构建时生成，随部署自动更新

### 5.6 访问统计
- 累计访问/访客数由 **Vercount** 提供（不蒜子的现代兼容替代；不蒜子官方域名已被 DNS 污染，国内完全不可达，勿改回）
- 计算方式：累计访问 = 页面完整加载次数（站内无刷新跳转不计）；访客数 = cookie 去重的独立人数
- 数字由浏览器端 JS 异步填充，已配置 preconnect 预热，通常 1 秒内显示，慢网络 1-2 秒属正常；计数从接入日开始，无历史数据
- 展示位置：首页"站点统计"组件，桌面右侧栏与移动端底部都显示（移动端数值由页面脚本从统计锚点复制，站内有刷新跳转后显示缓存值，完整加载后刷新为最新）

### 5.7 站点外观微调
- 主题色：`siteConfig.ts` 的 `themeColor.hue`（0-360，当前 222 青蓝；主色锚点已按定制色卡写死在 `src/styles/variables.styl`，改 hue 只影响背景/标签等派生色）
- 深浅色默认：`themeColor.defaultMode`（"light"/"dark"/"system"）
- 卡片立体边框：`card.border`；页面宽度：`pageWidth`
- 文章列表样式：`postListLayout`（list/grid、封面位置、简介行数）

### 5.8 常见问题
| 现象 | 原因/解决 |
|:---|:---|
| `pnpm dev` 起不来 | Node 版本要 >= 22.23（`node -v` 查看） |
| 本地项目页显示"GitHub 拉取失败" | 正常——本地代理拦截，CI 上没问题 |
| 新评论没出现在计数里 | 需要 push 一次触发重新部署 |
| 搜索不到新文章 | 索引随构建生成，push 后即更新 |
| 改了配置没变化 | `pnpm dev` 有时需重启；确认 push 成功且 Actions 变绿；线上页面有最长约 10 分钟的缓存，强刷或稍等 |
| 发布后归档/时间线/最后活动没立刻更新 | 同上：GitHub Pages 对 HTML 设了约 10 分钟的缓存（max-age=600），部署后稍等或 Ctrl+F5 强刷，属正常现象 |
| 想换回纯色无背景 | `backgroundWallpaper.ts` 的 `mode: "none"` |
| 访问统计数字不显示 | 多刷新几次；数字异步填充有 1-2 秒延迟；广告拦截插件可能拦截 vercount.one |
