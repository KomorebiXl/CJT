import type { FileItem } from '@/types/common'

export type PortTestSearchParams = {
  /** 资产名称 */
  assetName?: string
  /** 测评指标 */
  point?: string
  /** 测评项 */
  item?: string
}

export type PortTestData = {
  /** 资产名称 */
  assetName: string
  /** IP 地址 */
  ipAddress?: string
  /** 测评指标（类别） */
  point: string
  /** 属性（类别列括号拼接） */
  attribute?: string
  /** 等级（类别列括号拼接） */
  level?: string
  /** 风险级别（字典 label） */
  levelLabel?: string
  /** 测评项 */
  item: string
  /** 测试结果内容（首次测试） */
  resultDescription?: string
  /** 单项结论（首次测试，字典 label） */
  checkResultLabel?: string
  /** 结论（首次测试，字典 label） */
  resultLabel?: string
  /** 测试结果内容（回归测试） */
  regressionDescription?: string
  /** 单项结论（回归测试，字典 label） */
  regressionCheckResultLabel?: string
  /** 结论（回归测试，字典 label） */
  regressionResultLabel?: string
} & CommonTableData

export type PortTestFirstFormData = {
  /** 测试结果内容（首次测试） */
  resultDescription: string
  /** 测试结果附件列表 */
  resultDescription_files: FileItem[]
  /** 单项结论（首次测试） */
  checkResult: string
  /** 结论（首次测试） */
  result: string
}

export type PortTestRegressionFormData = {
  /** 测试结果内容（回归测试） */
  regressionDescription: string
  /** 回归结果附件列表 */
  regressionDescription_files: FileItem[]
  /** 单项结论（回归测试） */
  regressionCheckResult: string
  /** 结论（回归测试） */
  regressionResult: string
}

export type PortTestFormData = {
  /** 资产 id */
  assetId: string
  /** 级别（字典 background_point_grade） */
  level: string
  /** 类别 */
  point: string
  /** 技术要求 */
  item: string
  /** 测试阶段固定参数：'1' 首次测试 / '2' 回归测试（源弹窗恒携带） */
  step: string
} & Partial<PortTestFirstFormData> &
  Partial<PortTestRegressionFormData>
