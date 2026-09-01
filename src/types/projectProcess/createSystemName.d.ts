/** 新建系统名称搜索参数 */
export type CreateSystemNameSearchParams = {
  /** 名称 */
  name: string
}

/** 新建系统名称行 */
export type CreateSystemNameData = {
  id: string
  /** 名称 */
  name: string
  /** 上级节点 id */
  parentId: string
  /** 子节点 */
  child?: Array<CreateSystemNameData>
}

/** 新建系统名称表单 */
export type CreateSystemNameFormData = {
  /** 名称 */
  name: string
  /** 上级节点 id */
  parentId: string
}
