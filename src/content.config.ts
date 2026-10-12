import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { defineCollection } from "astro:content";
import type { CollectionConfig } from "astro/content/config";
import { glob, type Loader } from "astro/loaders";
import { type ZodType, z } from "astro/zod";

type PostData = {
	title: string;
	published: Date;
	updated?: Date;
	draft: boolean;
	description: string;
	image: string;
	tags: string[];
	category: string | null;
	lang: string;
	pinned: boolean;
	author: string;
	sourceLink: string;
	licenseName: string;
	licenseUrl: string;
	comment: boolean;
	password: string;
	passwordHint: string;
	series: string;
	seriesOrder?: number;
	prevTitle: string;
	prevSlug: string;
	nextTitle: string;
	nextSlug: string;
};

type DynamicData = {
	published: Date;
	pinned: boolean;
	location: string;
};

type TravelData = {
	title: string;
	province: string;
	type: string;
	date: Date;
	location: string;
	description: string;
	image: string;
};

type ProjectLink = {
	label: string;
	icon: string;
	value: string;
};

type ProjectData = {
	title: string;
	published: Date;
	draft: boolean;
	order?: number;
	description: string;
	image: string;
	tags: string[];
	link: ProjectLink[];
	status: string;
	lang: string;
};

type ContentCollection<T> = CollectionConfig<
	ZodType<T>,
	ReturnType<typeof glob>
>;

// posts 集合加载器：先用 glob 常规加载 src/content/posts 下的文章，
// 再注入一个由仓库根目录 MAINTENANCE.md 生成的"维护指南"合成条目。
// 这样 /posts/maintenance/ 在每次构建时都与 MAINTENANCE.md 保持同步，无需手动复制。
const MAINTENANCE_GUIDE_PATH = fileURLToPath(
	new URL("../MAINTENANCE.md", import.meta.url),
);

const postsLoader: Loader = {
	name: "posts",
	load: async (context) => {
		await glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }).load(
			context,
		);

		let body: string;
		try {
			body = await readFile(MAINTENANCE_GUIDE_PATH, "utf-8");
		} catch {
			context.logger.warn("未找到 MAINTENANCE.md，跳过维护指南合成条目");
			return;
		}

		const data = await context.parseData({
			id: "maintenance",
			data: {
				title: "个人主页维护指南",
				published: new Date("2026-10-09"),
				description: "简单指导你进行项目上线后的使用",
				tags: ["Github", "开始"],
				category: "技术",
				comment: true,
				pinned: true,
			},
		});

		// 与 glob 加载器行为一致：在内容同步阶段渲染 Markdown（含 remark 插件，
		// 如阅读时长/字数统计），否则页面拿不到渲染产物，正文会渲染为空
		const rendered = await context.renderMarkdown(body);

		context.store.set({
			id: "maintenance",
			data,
			body,
			rendered: { html: rendered.html, metadata: rendered.metadata },
			digest: context.generateDigest(body),
		});
	},
};

const postsCollection: CollectionConfig<
	ZodType<PostData>,
	Loader
> = defineCollection({
	loader: postsLoader,
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		lang: z.string().optional().default(""),
		pinned: z.boolean().optional().default(false),
		author: z.string().optional().default(""),
		sourceLink: z.string().optional().default(""),
		licenseName: z.string().optional().default(""),
		licenseUrl: z.string().optional().default(""),
		comment: z.boolean().optional().default(true),
		password: z.string().optional().default(""),
		passwordHint: z.string().optional().default(""),
		series: z.string().optional().default(""),
		seriesOrder: z.number().optional(),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});

const specCollection: ContentCollection<Record<string, never>> =
	defineCollection({
		loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/spec" }),
		schema: z.object({}),
	});

const dynamicCollection: ContentCollection<DynamicData> = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/dynamic" }),
	schema: z.object({
		published: z.date(),
		pinned: z.boolean().optional().default(false),
		location: z.string().optional().default(""),
	}),
});

// 诗与远方：旅行/徒步/登山/自驾记录，按省份聚合
const travelCollection: ContentCollection<TravelData> = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/travel" }),
	schema: z.object({
		title: z.string(),
		province: z.string(), // 常用名，如"四川"，见 src/utils/travel-utils.ts
		type: z.enum(["旅行", "徒步", "登山", "自驾"]),
		date: z.date(),
		location: z.string().default(""),
		description: z.string().default(""),
		image: z.string().default(""),
	}),
});

const projectsCollection: ContentCollection<ProjectData> = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/projects" }),
	schema: z.object({
		title: z.string(),
		published: z.date(),
		draft: z.boolean().optional().default(false),
		order: z.number().optional(),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		link: z
			.array(
				z.object({
					label: z.string(),
					icon: z.string().optional().default(""),
					value: z.string(),
				}),
			)
			.optional()
			.default([]),
		status: z.string().optional().default(""),
		lang: z.string().optional().default(""),
	}),
});

export const collections: {
	dynamic: typeof dynamicCollection;
	posts: typeof postsCollection;
	spec: typeof specCollection;
	projects: typeof projectsCollection;
	travel: typeof travelCollection;
} = {
	dynamic: dynamicCollection,
	posts: postsCollection,
	spec: specCollection,
	projects: projectsCollection,
	travel: travelCollection,
};
