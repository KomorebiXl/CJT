import type { FileItem } from '@/types/common'

/** 测试环境分类搜索参数 */
export type TestEnvironmentSearchParams = {
  /** 名称 */
  name: string
}

/** 测试环境分类行（/ras/category 树形 rows） */
export type TestEnvironmentData = {
  id: string
  /** 名称 */
  name: string
  /** 上级节点 id */
  parentId?: string
  /** 子级分类 */
  child?: Array<TestEnvironmentData>
  /** 环境数量（源类型未声明，按后端返回补齐，列直出待抓包复核） */
  envTotal?: number | string
  /** 网络拓扑图 id（有无决定按钮文案与状态列展示） */
  topologyId?: string
}

/** 测试环境分类表单 */
export type TestEnvironmentFormData = {
  /** 名称 */
  name: string
  /** 上级节点 id */
  parentId: string
}

/** 软件环境搜索参数（categoryId 走 pageExtraParams，不进搜索类型） */
export type TestEnvironmentDetailsSearchParams = {
  /** 名称 */
  name: string
}

/** 软件环境行 */
export type TestEnvironmentDetailsData = {
  id: string
  /** 名称 */
  name: string
  /** 配置 */
  system?: string
  /** 所属分类 id */
  categoryId: string
  /** 主体 id（后端返回，非请求参数） */
  subjectId?: string
  /** 软件环境明细（环境数量列读取长度，源类型未声明按后端返回补齐） */
  riskSubjectEnvSoftwareVos?: Array<TestEnvironmentDetailsDynamicForm>
}

/** 软件环境表单 */
export type TestEnvironmentDetailsFormData = {
  /** 名称 */
  name: string
  /** 配置 */
  system: string
  /** 软件环境明细 */
  riskSubjectEnvSoftwareList: Array<TestEnvironmentDetailsDynamicForm>
  /** 所属分类 id（随表单提交，不在弹窗内编辑） */
  categoryId: string
}

/** 软件环境动态表单子项 */
export type TestEnvironmentDetailsDynamicForm = {
  /** 软件名称版本号 */
  name: string
  /** 生产商/来源 */
  producer: string
  /** 用途 */
  purpose: string
  /** 软件环境类型（字典 software_environment_types） */
  type: string
}

/** 网络拓扑图表单（复用 /asset/topology 契约，type 由当前分类行 id 注入提交） */
export type TestEnvironmentTopologyFormData = {
  /** 描述内容 */
  content: string
  /** 图片文件及占位符元数据 */
  files: Array<FileItem>
}
