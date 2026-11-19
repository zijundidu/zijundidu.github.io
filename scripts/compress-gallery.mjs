// 相册图片压缩：长边超过 2560 才缩放，JPEG q85 + mozjpeg 渐进式编码，自动按 EXIF 摆正并剥离元数据。
// 视觉上接近无损，体积通常降到原来的 1/5～1/10。
// 幂等：scripts/.gallery-compressed.json 记录每个文件压缩后的大小，大小没变就跳过。
// 用法：
//   node scripts/compress-gallery.mjs        # 只处理新增/变更的图片
//   node scripts/compress-gallery.mjs --all  # 强制重压全部（再次有损，一般用不到）
import { existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const GALLERY_ROOT = "public/gallery";
const STATE_FILE = new URL("./.gallery-compressed.json", import.meta.url);
const MAX_EDGE = 2560;
const MIN_SIZE = 500 * 1024; // 已经小于 500KB 的不动
const JPEG_QUALITY = 85;

const force = process.argv.includes("--all");

function loadState() {
	try {
		return JSON.parse(readFileSync(STATE_FILE, "utf8"));
	} catch {
		return {};
	}
}

const isPhoto = (name) => /\.(jpe?g|webp|png)$/i.test(name);

async function compressFile(filePath) {
	const before = statSync(filePath).size;
	const isPng = /\.png$/i.test(filePath);
	const isWebp = /\.webp$/i.test(filePath);
	// 照片类 PNG（如无人机导出）转 JPEG，体积差异巨大；透明区域铺白底
	const finalPath = isPng ? filePath.replace(/\.png$/i, ".jpg") : filePath;
	const tmp = `${finalPath}.tmp`;
	let pipeline = sharp(filePath)
		.rotate() // 按 EXIF 自动摆正（同时剥离原 EXIF）
		.resize({
			width: MAX_EDGE,
			height: MAX_EDGE,
			fit: "inside",
			withoutEnlargement: true,
		});
	if (isPng) pipeline = pipeline.flatten({ background: "#ffffff" });
	if (isWebp) {
		await pipeline.webp({ quality: JPEG_QUALITY }).toFile(tmp);
	} else {
		await pipeline
			.jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true })
			.toFile(tmp);
	}
	rmSync(filePath);
	renameSync(tmp, finalPath);
	return { before, after: statSync(finalPath).size, finalPath };
}

const state = loadState();
let processed = 0;
let skipped = 0;
let saved = 0;

if (!existsSync(GALLERY_ROOT)) {
	console.log("public/gallery 不存在，无需处理");
	process.exit(0);
}

for (const album of readdirSync(GALLERY_ROOT, { withFileTypes: true })) {
	if (!album.isDirectory()) continue;
	const dir = path.join(GALLERY_ROOT, album.name);
	for (const name of readdirSync(dir)) {
		if (!isPhoto(name)) continue;
		const filePath = path.join(dir, name);
		const key = filePath.replaceAll("\\", "/"); // 统一键格式，本地 Windows 与 CI Linux 一致
		const size = statSync(filePath).size;
		if (!force && state[key] === size) {
			skipped++;
			continue;
		}
		if (size <= MIN_SIZE) {
			state[key] = size;
			skipped++;
			continue;
		}
		const { before, after, finalPath: out } = await compressFile(filePath);
		state[out.replaceAll("\\", "/")] = after;
		processed++;
		saved += before - after;
		console.log(`${filePath}: ${(before / 1e6).toFixed(1)}MB → ${(after / 1e6).toFixed(2)}MB`);
	}
}

writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
console.log(`完成：压缩 ${processed} 张，跳过 ${skipped} 张，共节省 ${(saved / 1e6).toFixed(1)}MB`);
