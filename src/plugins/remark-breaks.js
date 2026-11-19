import { SKIP, visit } from "unist-util-visit";

/**
 * 把段落/列表项内的单个换行渲染为 <br>（对齐 Obsidian 阅读视图的默认行为）。
 * CommonMark 规定源码中的单个换行只是"软换行"（渲染为空格），Obsidian 却默认显示为
 * 换行——作者在 Obsidian 里按一次回车的排版，博客上全被合并成一行。
 * 本插件等价于 remark-breaks：把 text 节点里的 \n 拆成 break 节点（零依赖，本地实现）。
 * 注意：代码块/行内代码不是 text 节点，不受影响。
 */
export function remarkBreaks() {
	return (tree) => {
		visit(tree, "text", (node, index, parent) => {
			if (!parent || index == null || !node.value.includes("\n")) return;
			const parts = node.value.split("\n");
			const children = [];
			parts.forEach((part, i) => {
				if (i > 0) children.push({ type: "break" });
				if (part) children.push({ type: "text", value: part });
			});
			parent.children.splice(index, 1, ...children);
			return [SKIP, index + children.length - 1];
		});
	};
}
