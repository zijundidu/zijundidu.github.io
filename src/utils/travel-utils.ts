// 诗与远方：省份映射 + 旅行记录统计工具

export interface ProvinceInfo {
	slug: string; // URL 用，如 sichuan
	geoName: string; // GeoJSON 里的全称，如"四川省"
	shortName: string; // 常用名，frontmatter 里写的，如"四川"
}

// 34 个省级行政区（不含南海诸岛）
export const PROVINCES: ProvinceInfo[] = [
	{ slug: "beijing", geoName: "北京市", shortName: "北京" },
	{ slug: "tianjin", geoName: "天津市", shortName: "天津" },
	{ slug: "hebei", geoName: "河北省", shortName: "河北" },
	{ slug: "shanxi", geoName: "山西省", shortName: "山西" },
	{ slug: "neimenggu", geoName: "内蒙古自治区", shortName: "内蒙古" },
	{ slug: "liaoning", geoName: "辽宁省", shortName: "辽宁" },
	{ slug: "jilin", geoName: "吉林省", shortName: "吉林" },
	{ slug: "heilongjiang", geoName: "黑龙江省", shortName: "黑龙江" },
	{ slug: "shanghai", geoName: "上海市", shortName: "上海" },
	{ slug: "jiangsu", geoName: "江苏省", shortName: "江苏" },
	{ slug: "zhejiang", geoName: "浙江省", shortName: "浙江" },
	{ slug: "anhui", geoName: "安徽省", shortName: "安徽" },
	{ slug: "fujian", geoName: "福建省", shortName: "福建" },
	{ slug: "jiangxi", geoName: "江西省", shortName: "江西" },
	{ slug: "shandong", geoName: "山东省", shortName: "山东" },
	{ slug: "henan", geoName: "河南省", shortName: "河南" },
	{ slug: "hubei", geoName: "湖北省", shortName: "湖北" },
	{ slug: "hunan", geoName: "湖南省", shortName: "湖南" },
	{ slug: "guangdong", geoName: "广东省", shortName: "广东" },
	{ slug: "guangxi", geoName: "广西壮族自治区", shortName: "广西" },
	{ slug: "hainan", geoName: "海南省", shortName: "海南" },
	{ slug: "sichuan", geoName: "四川省", shortName: "四川" },
	{ slug: "guizhou", geoName: "贵州省", shortName: "贵州" },
	{ slug: "yunnan", geoName: "云南省", shortName: "云南" },
	{ slug: "xizang", geoName: "西藏自治区", shortName: "西藏" },
	{ slug: "shaanxi", geoName: "陕西省", shortName: "陕西" },
	{ slug: "gansu", geoName: "甘肃省", shortName: "甘肃" },
	{ slug: "qinghai", geoName: "青海省", shortName: "青海" },
	{ slug: "ningxia", geoName: "宁夏回族自治区", shortName: "宁夏" },
	{ slug: "xinjiang", geoName: "新疆维吾尔自治区", shortName: "新疆" },
	{ slug: "taiwan", geoName: "台湾省", shortName: "台湾" },
	{ slug: "hongkong", geoName: "香港特别行政区", shortName: "香港" },
	{ slug: "macau", geoName: "澳门特别行政区", shortName: "澳门" },
];

export const provinceBySlug = (slug: string): ProvinceInfo | undefined =>
	PROVINCES.find((p) => p.slug === slug);

export const provinceByShort = (short: string): ProvinceInfo | undefined =>
	PROVINCES.find((p) => p.shortName === short);

// GeoJSON name → ProvinceInfo："四川省"/"内蒙古自治区"等都能命中
export const provinceByGeoName = (geoName: string): ProvinceInfo | undefined =>
	PROVINCES.find((p) => geoName.startsWith(p.shortName));

// ---- 旅行记录统计 ----

export const TRAVEL_TYPES = ["旅行", "徒步", "登山", "自驾"] as const;

export interface TravelStats {
	places: number; // 游览地方数（location 去重，不含空值）
	travel: number;
	hike: number;
	climb: number;
	drive: number;
	total: number;
}

export function emptyStats(): TravelStats {
	return { places: 0, travel: 0, hike: 0, climb: 0, drive: 0, total: 0 };
}

interface TravelLike {
	data: {
		type: string;
		location: string;
	};
}

export function calcStats<T extends TravelLike>(records: T[]): TravelStats {
	const s = emptyStats();
	const places = new Set<string>();
	for (const r of records) {
		s.total++;
		if (r.data.type === "旅行") s.travel++;
		else if (r.data.type === "徒步") s.hike++;
		else if (r.data.type === "登山") s.climb++;
		else if (r.data.type === "自驾") s.drive++;
		const loc = r.data.location.trim();
		if (loc) places.add(loc);
	}
	s.places = places.size;
	return s;
}

// 记录类型的徽标配色（Tailwind 工具类）
export const TRAVEL_TYPE_STYLE: Record<string, string> = {
	旅行: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
	徒步: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
	登山: "bg-orange-500/15 text-orange-600 dark:text-orange-400",
	自驾: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
};
