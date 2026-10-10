// 文章字数 / 阅读时长统计。
// 字数口径与首页"站点统计"看板的总字数一致：
//   CJK 文字、全角标点逐字符计数，连续英文按 1 个单词计数，连续数字按 1 个计数；
//   代码块、行内代码、图片、HTML 块、MDX 表达式不计入；
//   链接只保留锚文本，URL（含自动链接的裸 URL）剔除。
// 阅读时长按中文约 400 字/分钟、英文约 200 词/分钟估算，最低 1 分钟。

const COUNT_RE = /[一-鿿㐀-䶿豈-﫿　-〿＀-￯]|[a-zA-Z]+|\d+/g;
const URL_RE = /https?:\/\/\S+/g;
const SKIP_TYPES = new Set([
	"code",
	"inlineCode",
	"image",
	"html",
	"yaml",
	"mdxjsEsm",
	"mdxFlowExpression",
	"mdxTextExpression",
]);

// 收集纯文本（跳过代码/图片/HTML/MDX 表达式节点，链接只留锚文本，URL 剔除）
function collectText(node, buf) {
	if (SKIP_TYPES.has(node.type)) return;
	if (typeof node.value === "string") {
		buf.push(node.value.replace(URL_RE, " "));
	}
	if (node.children) {
		for (const child of node.children) collectText(child, buf);
	}
}

export function remarkReadingTime() {
	return (tree, { data }) => {
		const buf = [];
		collectText(tree, buf);
		const tokens = buf.join(" ").match(COUNT_RE) || [];

		const enWords = tokens.filter((t) => /^[a-zA-Z]+$/.test(t)).length;
		const cjkTokens = tokens.length - enWords;

		data.astro.frontmatter.minutes = Math.max(
			1,
			Math.round(cjkTokens / 400 + enWords / 200),
		);
		data.astro.frontmatter.words = tokens.length;
	};
}
