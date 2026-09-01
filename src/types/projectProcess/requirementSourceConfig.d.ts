/** 需求来源配置搜索参数 */
export type RequirementSourceConfigSearchParams = {
  /** 字段名称 */
  name?: string
  /** 验收测试类型 */
  type?: string
}

/** 需求来源配置行 */
export type RequirementSourceConfigData = {
  /** 字段名称 */
  name: string
  /** 对应字段 */
  field: string
  /** 验收测试类型 */
  type?: string
  /** 是否启用 */
  enable: string
  /** 验收测试类型名称 */
  typeLabel: string
  /** 备注 */
  remark: string
} & CommonTableData

/** 需求来源配置表单 */
export type RequirementSourceConfigFormData = {
  /** 验收测试类型 */
  type: string
  /** 对应字段 */
  field: string
  /** 字段名称 */
  name: string
  /** 是否启用 */
  enable: string
  /** 序号 */
  sort: number
  /** 备注 */
  remark: string
}
