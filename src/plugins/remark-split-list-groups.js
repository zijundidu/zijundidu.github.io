import { SKIP, visit } from "unist-util-visit";

/**
 * 把"松散列表"按条目之间的空行拆成多个紧凑列表。
 *
 * CommonMark 规定：列表中任意两处条目之间有空行，整个列表就是 loose（松散）的，
 * 所有条目都会被包上 <p>（段落间距）——结果"条目间写了空行分组"变成"所有条目都像分段"，
 * 与 Obsidian 的阅读视图观感不一致。
 * 本插件把松散列表在空行边界处拆开，每个子列表 spread=false（紧凑条目），
 * 相邻列表之间的自然外边距形成组间空隙：组内紧凑、组间留白，正是空行排版的原意。
 * 判断依赖源码行号（position），需在 parse 之后、其他改写结构的重插件之前尽早运行。
 */
export function remarkSplitListGroups() {
	return (tree) => {
		// 嵌套的松散列表可能位于被拆分列表的前若干个子列表里，循环至不再变化
		let dirty = true;
		while (dirty) {
			dirty = false;
			visit(tree, "list", (node, index, parent) => {
				if (!parent || index == null || !node.spread) return;

				const items = node.children;
				if (items.length < 2) return;

				const groups = [];
				let groupStart = 0;
				for (let i = 1; i < items.length; i++) {
					// 条目间有空行 → 行号差 ≥ 2
					const blankBetween =
						items[i].position.start.line -
							items[i - 1].position.end.line >=
						2;
					if (blankBetween) {
						groups.push({ first: groupStart, items: items.slice(groupStart, i) });
						groupStart = i;
					}
				}
				// 松散是条目内部多段落导致的，条目间没有空行，不拆
				if (groups.length === 0) return;
				groups.push({ first: groupStart, items: items.slice(groupStart) });

				const fragments = groups.map((g) => ({
					type: "list",
					ordered: node.ordered,
					spread: false,
					start: node.ordered ? (node.start ?? 1) + g.first : node.start,
					children: g.items,
					position: {
						start: g.items[0].position.start,
						end: g.items[g.items.length - 1].position.end,
					},
				}));
				parent.children.splice(index, 1, ...fragments);
				dirty = true;
				return [SKIP, index + fragments.length - 1];
			});
		}
	};
}
