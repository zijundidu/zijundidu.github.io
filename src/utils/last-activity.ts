import { execSync } from "node:child_process";

/**
 * 获取最近一次 git 提交时间（构建时执行）。
 *
 * 「最后活动」以提交时间为准：任何改动（文章/动态/诗与远方/配置）提交部署后都会刷新，
 * 不受内容自身日期影响——例如补录一条 2017 年的旅行记录，最后活动仍显示为今天。
 * 取不到 git 信息（如解压的源码包）时返回 null，调用方需自行回退。
 */
export function getLastCommitTime(): Date | null {
	try {
		const out = execSync("git log -1 --format=%cI", {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		const d = new Date(out);
		return Number.isNaN(d.getTime()) ? null : d;
	} catch {
		return null;
	}
}
