// 全站评论计数（Giscus 的评论都存放在 GitHub Discussions）
// 统计口径：只计入 giscus 机器人创建、且路径仍存在于站内的 discussion——
// 文章删除后其 discussion 成为孤儿，构建时与前端实时统计都会自动排除，
// 实现"删除文章后评论计数同步"。GitHub 上的 discussion 本身保留（评论存档）。
// 前端（SiteStats.astro）在页面加载后会用 GitHub API 实时重算并覆盖此处的后备值。
import { getCollection } from "astro:content";
import { dynamicConfig, siteConfig } from "../config";

const REPO = "zijundidu/zijundidu.github.io";

// 有评论功能的固定页面（路径即 giscus 按 pathname 映射的 discussion 标题）
const STATIC_PATHS: string[] = [
	...(siteConfig.pages.dynamic && dynamicConfig.showComment !== false
		? ["dynamic/"]
		: []),
	...(siteConfig.pages.guestbook ? ["guestbook/"] : []),
	...(siteConfig.pages.friends ? ["friends/"] : []),
	...(siteConfig.pages.sponsor ? ["sponsor/"] : []),
];

// 现存可评论页面的路径集合：posts/{id}/ + 固定页面
async function buildAllowedPaths(): Promise<Set<string>> {
	const posts = await getCollection("posts", ({ data }) =>
		import.meta.env.PROD ? data.draft !== true : true,
	);
	const allowed = new Set<string>(STATIC_PATHS);
	for (const p of posts) {
		if (p.data.comment !== false) allowed.add(`posts/${p.id}/`);
	}
	return allowed;
}

function sumMatchedComments(discussions: unknown, allowed: Set<string>): number {
	if (!Array.isArray(discussions)) return 0;
	let total = 0;
	for (const d of discussions) {
		if (
			typeof d === "object" &&
			d !== null &&
			"title" in d &&
			"comments" in d &&
			typeof (d as { comments: unknown }).comments === "number" &&
			allowed.has((d as { title: string }).title) &&
			(d as { user?: { login?: string } }).user?.login === "giscus[bot]"
		) {
			total += (d as { comments: number }).comments;
		}
	}
	return total;
}

let cached: Promise<number> | null = null;

async function fetchTotalComments(): Promise<number> {
	let total = 0;
	let page = 1;

	try {
		const allowed = await buildAllowedPaths();

		// 讨论数量超过 100 才需要翻页，个人博客按年计都不会触发
		while (page <= 5) {
			const res = await fetch(
				`https://api.github.com/repos/${REPO}/discussions?per_page=100&page=${page}`,
			);
			if (!res.ok) return total;

			const data: unknown = await res.json();
			if (!Array.isArray(data) || data.length === 0) break;

			total += sumMatchedComments(data, allowed);

			if (data.length < 100) break;
			page += 1;
		}
	} catch {
		// 网络失败时静默降级为 0，不影响构建；前端实时统计会再次尝试
	}

	return total;
}

export function getTotalComments(): Promise<number> {
	cached ??= fetchTotalComments();
	return cached;
}

// 供前端内联脚本使用的同口径统计（避免重复实现）
export const COMMENT_COUNTER_SNIPPET_INFO = {
	repo: REPO,
	staticPaths: STATIC_PATHS,
};
