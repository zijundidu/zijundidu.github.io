import { h } from "hastscript";
import { SKIP, visit } from "unist-util-visit";

/**
 * 本站实际支持的自定义元素指令（rehypeComponents 注册的组件等）。
 * 不在名单内的指令一律还原为普通文本——remark-directive 会把正文中
 * 任意"半角冒号+文字"吞成指令名（如 9:16开车 → :16开车、TODO:finish → :finish），
 * 再转成 <16开车> 这类非法标签，导致页面显示错乱。
 */
const CUSTOM_ELEMENT_DIRECTIVES = new Set(["github", "code-group"]);

/**
 * 把未知指令还原为原文文本，返回应继续遍历的下标（供 visit 的 [SKIP, index] 使用）。
 * - textDirective 还原为行内文本（:name / :name[label]）
 * - leafDirective 还原为段落（::name + 原行内内容）
 * - containerDirective 还原为段落（:::name）+ 原块级内容
 */
function restoreUnknownDirective(node, index, parent) {
	const marker =
		node.type === "textDirective"
			? ":"
			: node.type === "leafDirective"
				? "::"
				: ":::";
	const source = marker + (node.name || "");

	if (node.type === "textDirective") {
		const children = [{ type: "text", value: source }];
		const label = node.children.find((c) => c.data?.directiveLabel);
		if (label) {
			children.push(
				{ type: "text", value: "[" },
				...label.children,
				{ type: "text", value: "]" },
			);
		}
		parent.children.splice(index, 1, ...children);
		return index + children.length - 1;
	}

	const paragraphs = [
		{ type: "paragraph", children: [{ type: "text", value: source }] },
	];
	if (node.type === "leafDirective") {
		paragraphs[0].children.push(
			...node.children.filter((c) => !c.data?.directiveLabel),
		);
	} else {
		paragraphs.push(...node.children);
	}
	parent.children.splice(index, 1, ...paragraphs);
	return index + paragraphs.length - 1;
}

const ADMONITION_TYPES = [
	"note",
	"tip",
	"important",
	"warning",
	"caution",
	"abstract",
	"summary",
	"tldr",
	"info",
	"todo",
	"success",
	"check",
	"done",
	"question",
	"help",
	"faq",
	"attention",
	"failure",
	"missing",
	"fail",
	"danger",
	"error",
	"bug",
	"example",
	"quote",
	"cite",
];

export function parseDirectiveNode() {
	return (tree) => {
		visit(tree, (node, index, parent) => {
			if (
				node.type === "containerDirective" ||
				node.type === "leafDirective" ||
				node.type === "textDirective"
			) {
				const name = node.name ? node.name.toLowerCase() : "";

				// 检查是否是 Admonition 类型
				// 仅对 containerDirective 进行 Admonition 转换
				if (
					node.type === "containerDirective" &&
					ADMONITION_TYPES.includes(name)
				) {
					const type = name.toUpperCase();

					// 处理 label (自定义标题)
					const firstChild = node.children[0];
					if (firstChild?.data?.directiveLabel) {
						// 如果有 label，注入 [!TYPE] 到 label 开头
						if (
							firstChild.children.length > 0 &&
							firstChild.children[0].type === "text"
						) {
							firstChild.children[0].value = `[!${type}] ${firstChild.children[0].value}`;
						} else {
							firstChild.children.unshift({
								type: "text",
								value: `[!${type}] `,
							});
						}
					} else {
						// 没有 label，插入包含 [!TYPE] 的新段落作为第一个子节点
						node.children.unshift({
							type: "paragraph",
							children: [{ type: "text", value: `[!${type}]` }],
						});
					}

					// 转换为 Blockquote
					node.type = "blockquote";
					node.data = node.data || {};
					node.data.hName = "blockquote";
					// 关键：清除可能存在的 hProperties，防止变为自定义标签
					delete node.data.hProperties;
				} else if (!CUSTOM_ELEMENT_DIRECTIVES.has(name)) {
						// 未知指令（正文里的 9:16、TODO:finish 等"假指令"）还原为普通文本
						return [SKIP, restoreUnknownDirective(node, index, parent)];
				} else {
					// 其他 Directive，保留原有逻辑：转换为自定义 HTML 标签
					const data = node.data || {};
					node.data = data;
					node.attributes = node.attributes || {};

					// Add specific attributes for directive labels
					if (
						node.children.length > 0 &&
						node.children[0].data &&
						node.children[0].data.directiveLabel
					) {
						node.attributes["has-directive-label"] = true;
					}

					const hast = h(node.name, node.attributes);
					data.hName = hast.tagName;
					data.hProperties = hast.properties;
				}
			}
		});
	};
}
