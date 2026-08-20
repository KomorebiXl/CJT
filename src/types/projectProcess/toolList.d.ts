/** 工具树选项） */
export type ToolTreeOption = {
  label: string
  id: string | number
  children?: Array<ToolTreeOption>
}

export type ToolListSearchParams = {}

export type ToolListData = {
  /** 名称 */
  name: string
  /** 版本 */
  version: string
  /** 安全规则版本 */
  secureVersion: string | null
  /** 生厂商/来源 */
  source: string
  /** 用途 */
  purpose: string
  /** 工具 id */
  toolId: string
  /** 版本 id */
  versionId: string
  /** 安全规则版本 */
  secureVersionId: string | null
  /** 工具级联路径 */
  tools: Array<string>
} & CommonTableData

export type ToolListFormData = {
  /** 工具级联路径 */
  tools: Array<string | number>
  /** 工具 id */
  toolId: string | number
  /** 版本 id） */
  versionId: string | number
  /** 安全规则版本 id */
  secureVersionId: string | number
}
