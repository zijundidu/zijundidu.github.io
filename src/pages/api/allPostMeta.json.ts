import { getCollection } from "astro:content";
import { getSortedPosts } from "@/utils/content-utils";
import { provinceByShort } from "@/utils/travel-utils";

// 动态没有标题，取正文纯文本前 40 字作为日历里的摘要
function dynamicSummary(body: string): string {
	const text = body
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 图片
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // 链接只保留锚文本
		.replace(/[#*>`|-]/g, "") // 行内 Markdown 标记
		.replace(/\s+/g, " ")
		.trim();
	return text.slice(0, 40) + (text.length > 40 ? "…" : "");
}

export async function GET(): Promise<Response> {
	const [posts, dynamics, travels] = await Promise.all([
		getSortedPosts(),
		getCollection("dynamic"),
		getCollection("travel"),
	]);

	const allPostsData = [
		...posts.map((post) => ({
			id: post.id,
			type: "post",
			title: post.data.title,
			description: post.data.description,
			published: post.data.published.getTime(),
			category: post.data.category || "",
			password: !!post.data.password,
			url: `/posts/${post.id}/`,
		})),
		...dynamics.map((d) => ({
			id: d.id,
			type: "dynamic",
			title: dynamicSummary(d.body || ""),
			description: "",
			published: d.data.published.getTime(),
			category: "",
			password: false,
			url: "/dynamic/",
		})),
		// 诗与远方的记录计入"文章"类别：在日历中显示为文章，点击直达详情页
		...travels.map((t) => ({
			id: t.id,
			type: "post",
			title: t.data.title,
			description: t.data.description,
			published: t.data.date.getTime(),
			category: "",
			password: false,
			url: `/travel/${provinceByShort(t.data.province)?.slug ?? t.data.province}/${t.id}/`,
		})),
		// 日历按纯日期排序，忽略置顶
	].sort((a, b) => b.published - a.published);

	return new Response(JSON.stringify(allPostsData));
}
