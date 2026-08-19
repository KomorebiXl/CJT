/** 从 component 字符串里拆出真实组件路径和参数
 *  "adminManagement/test/index?id=1&type=2"
 *  → { componentPath: "adminManagement/test/index", query: { id: '1', type: '2' } }
 */
export const parseComponentPath = (raw: string) => {
  if (!raw) return { componentPath: raw as string, query: undefined }
  const [componentPath, queryStr] = raw.split('?')
  const query = queryStr
    ? Object.fromEntries(new URLSearchParams(queryStr))
    : undefined
  return { componentPath, query }
}

/** 把 query 对象拼回路径末尾，菜单跳转拼 index 用 */
export const appendQuery = (path: string, query?: Record<string, string>) => {
  if (!query || !Object.keys(query).length) return path
  return `${path}?${new URLSearchParams(query).toString()}`
}
