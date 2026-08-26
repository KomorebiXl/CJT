/** 漏洞类型选项（/asset/standard/option，源 getSubjectLoopholeOption） */
export type SubjectLoopholeOption = {
  id: string
  /** 标准大类标签 */
  typeLabel: string
  /** 漏洞类型名称 */
  name: string
}

/** 回归测试明细行扩展字段 */
export type SourceCodeRegressionDetail = {
  /** 状态（字典 background_code_status） */
  status: string
  /** 修复后内容 */
  repairContent: string
}

/** 漏洞明细行 */
export type SourceCodeDetail = {
  /** 内容 */
  content: string
  /** 入口点 */
  entryPoint: string
} & Partial<SourceCodeRegressionDetail>

export type SourceCodeSearchParams = {
  /** 漏洞名称 */
  loopholeName?: string
  /** 资产名称 */
  assetName?: string
  /** 漏洞等级 */
  level?: string
  /** 漏洞状态 */
  detailStatus?: string
}

export type SourceCodeData = {
  /** 资产名称 */
  assetName: string
  /** 标准大类 */
  languageTypeLabel: string
  /** 类型 */
  categoryName: string
  /** 漏洞名称 */
  loopholeName: string
  /** 漏洞等级（字典 label） */
  levelLabel: string
  /** 缺陷描述 */
  description: string
  /** 详细描述 */
  detail: string
  /** 个数 */
  loopholeNum: number
  /** 已修复数量 */
  repairNum: number
  /** 解决方案 */
  suggestion: string
} & CommonTableData

/** 回归测试表单扩展字段 */
export type SourceCodeRegressionFormData = {
  /** 修复个数 */
  repairNum: number
}

export type SourceCodeFormData = {
  /** 资产 id */
  assetId: string
  /** 漏洞类型 id */
  categoryId: string
  /** 漏洞等级 */
  level: string
  /** 漏洞个数 */
  loopholeNum: number
  /** 漏洞名称 */
  loopholeName: string
  /** 缺陷描述 */
  description: string
  /** 解决方案 */
  suggestion: string
  /** 详细描述 */
  detail: string
  /** 详细描述内容（动态明细行） */
  details: Array<SourceCodeDetail>
  /**
   * 测试阶段固定参数：首次测试恒为 '1'；回归测试新增为 '2'，
   * 编辑时源契约不携带（提交前置 null）
   */
  step: string | null
} & Partial<SourceCodeRegressionFormData>
