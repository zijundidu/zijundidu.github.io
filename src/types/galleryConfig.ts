// 相册元信息（用户在配置文件中填写）
export type GalleryAlbum = {
	id: string; // URL slug + 目录名，如 "japan-2025"
	name: string; // 相册名称
	description?: string; // 相册描述
	date?: string; // 日期
	location?: string; // 拍摄地点
	tags?: string[]; // 标签（用于首页筛选）
	cover?: string; // 手动指定封面（可选，省略则自动取 cover.* 或第一张）
	password?: string; // 加密密码（非空时启用加密）
	passwordHint?: string; // 密码提示
};

// 相册配置
export type GalleryConfig = {
	albums: GalleryAlbum[
		{
  			id: "gannan-260715",              # 必须和目录名一致
  			name: "甘南自驾",
  			description: "2026 年甘南自驾精彩瞬间",
    		location: "甘南藏族自治州",
    		date: "2026-07-15",            # 用于排序
  			tags: ["旅行", "自驾"],         # 相册页可按标签筛选
  			# password: "123",             # 可选，加密相册
  			# passwordHint: "提示语",
},
	];
	columnWidth?: number; // 瀑布流最小列宽(px)，默认 240，浏览器根据容器宽度自动计算列数
};
