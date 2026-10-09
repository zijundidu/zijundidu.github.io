// 构建时从 GitHub Discussions API 拉取全站评论总数（Giscus 的评论都存这里）
// 匿名调用限流 60 次/小时，构建只发 1-3 个请求；结果在同一构建进程内缓存复用
const REPO = "zijundidu/zijundidu.github.io";

let cached: Promise<number> | null = null;

async function fetchTotalComments(): Promise<number> {
	let total = 0;
	let page = 1;

	try {
		// 讨论数量超过 100 才需要翻页，个人博客按年计都不会触发
		while (page <= 5) {
			const res = await fetch(
				`https://api.github.com/repos/${REPO}/discussions?per_page=100&page=${page}`,
			);
			if (!res.ok) return total;

			const data: unknown = await res.json();
			if (!Array.isArray(data) || data.length === 0) break;

			for (const d of data) {
				if (
					typeof d === "object" &&
					d !== null &&
					"comments" in d &&
					typeof (d as { comments: unknown }).comments === "number"
				) {
					total += (d as { comments: number }).comments;
				}
			}

			if (data.length < 100) break;
			page += 1;
		}
	} catch {
		// 网络失败时静默降级为 0，不影响构建
	}

	return total;
}

export function getTotalComments(): Promise<number> {
	cached ??= fetchTotalComments();
	return cached;
}
