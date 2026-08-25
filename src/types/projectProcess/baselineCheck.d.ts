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
  /** 资产三级类型（为 6 或 7 时拼接品牌型号，常规形态） */
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
  /** 风险级别（字典 label，国网形态） */
  levelLabel?: string
  /** 测评项 */
  item: string
  /** 检查结果（常规）/ 测试结果内容（国网） */
  resultDescription?: string
  /** 单项结论（字典 label，国网形态） */
  checkResultLabel?: string
  /** 是否符合规范（常规）/ 结论（国网）（字典 label） */
  resultLabel?: string
  /** 整改建议（常规形态） */
  suggestion?: string
  /** 复测结果（常规）/ 测试结果内容（国网） */
  regressionDescription?: string
  /** 回归单项结论（字典 label，国网形态） */
  regressionCheckResultLabel?: string
  /** 回归是否符合规范（常规）/ 回归结论（国网）（字典 label） */
  regressionResultLabel?: string
  /** 回归整改建议（常规形态） */
  regressionSuggestion?: string
} & CommonTableData

export type BaselineCheckFormData = {
  /** 资产 id */
  assetId: string
  /** 属性（常规形态表单） */
  attribute?: string
  /** 等级 */
  level: string
  /** 测评指标 */
  point: string
  /** 测评项 */
  item: string
} & Partial<BaselineCheckFirstTestFormData> &
  Partial<BaselineCheckRegressionTestFormData>

export type BaselineCheckFirstTestFormData = {
  /** 首轮检查结果（常规）/ 测试结果内容（国网） */
  resultDescription: string
  /** 首轮结果附件列表 */
  resultDescription_files: FileItem[]
  /** 首轮单项结论（国网形态） */
  checkResult: string
  /** 首轮是否符合规范（常规）/ 结论（国网） */
  result: string
  /** 首轮整改建议（常规形态） */
  suggestion: string
}

export type BaselineCheckRegressionTestFormData = {
  /** 回归检查结果（常规）/ 测试结果内容（国网） */
  regressionDescription: string
  /** 回归结果附件列表 */
  regressionDescription_files: FileItem[]
  /** 回归单项结论（国网形态） */
  regressionCheckResult: string
  /** 回归是否符合规范（常规）/ 回归结论（国网） */
  regressionResult: string
  /** 回归整改建议（常规形态） */
  regressionSuggestion: string
}
