// 内容集合的公共工具函数

/**
 * 草稿过滤：生产构建只保留已发布内容，开发环境全部可见。
 * 列表页查询和 getStaticPaths 都应使用，避免草稿被静态生成。
 */
export function publishedOnly<T extends { data: { draft?: boolean } }>(entries: T[]): T[] {
  return import.meta.env.PROD ? entries.filter((entry) => !entry.data.draft) : entries;
}
