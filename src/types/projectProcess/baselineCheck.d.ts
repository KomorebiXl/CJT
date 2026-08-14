import type { FileItem } from '@/types/common'

export type BaselineCheckSearchParams = {
  /** 资产名称 */
  assetName?: string
  /** 测评指标 */
  point?: string
  /** 测评项 */
  item?: string
}

export type BaselineCheckData = {
  /** 资产名称 */
  assetName: string
  /** 资产三级类型（为 6 或 7 时拼接品牌型号） */
  assetThirdType?: string | number
  /** 品牌型号 */
  brandModel?: string
  /** IP 地址 */
  ipAddress?: string
  /** 测评指标 */
  point: string
  /** 属性 */
  attribute?: string
  /** 等级 */
  level?: string
  /** 测评项 */
  item: string
  /** 检查结果 */
  resultDescription: string
  /** 是否符合规范（字典 label） */
  resultLabel: string
  /** 整改建议 */
  suggestion: string
} & CommonTableData

export type BaselineCheckFormData = {
  /** 资产 id */
  assetId: string
  /** 属性 */
  attribute: string
  /** 等级 */
  level: string
  /** 测评指标 */
  point: string
  /** 测评项 */
  item: string
  /** 检查结果 */
  resultDescription: string
  /** 检查结果附件列表 */
  resultDescription_files: FileItem[]
  /** 是否符合规范 */
  result: string
  /** 整改建议 */
  suggestion: string
}
