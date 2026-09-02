import type { DynamicFileListResponse } from './projectProcessCommon'

/** 系统详情列表搜索参数 */
export type SystemDetailSearchParams = {
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
}

/** 系统详情行（动态文件字段运行时存在，不在类型内声明） */
export type SystemDetailResult = {
  id: string
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 测试项说明 */
  itemDescription: string
  /** 相关测试项 */
  relatedItem: string
  /** 备注 */
  remark: string
  /** 所属系统（后端字段名 subsystem） */
  subsystem: string
  /** 所属特性 */
  feature: string
}

/** 系统详情列表响应 */
export type SystemDetailListResponse = DynamicFileListResponse<SystemDetailResult>

/** 系统详情表单（动态文件字段经索引签名回填/提交） */
export type SystemDetailFormData = {
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 测试项说明 */
  itemDescription: string
  /** 备注 */
  remark: string
  /** 所属系统（后端字段名 subsystem） */
  subsystem: string
  /** 所属特性 */
  feature: string
} & Record<string, unknown>

/** 特性方案列表搜索参数（feature='2'~'9'） */
export type FeatureReviewSearchParams = {
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 子特性 */
  subFeature: string
}

/** 特性行（动态文件字段运行时存在，不在类型内声明） */
export type FeatureReviewResult = {
  id: string
  /** 子特性值 */
  subFeature: string
  /** 子特性（后端已翻 Label） */
  subFeatureLabel: string
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 测试项说明 */
  itemDescription: string
  /** 测试项结果 */
  itemResult: string
  /** 相关测试项 */
  relatedItem: string
  /** 是否为测试用例：'1' 是，其它否 */
  hasTestCase: string
  /** 备注 */
  remark: string
  /** 所属特性 */
  feature: string
}

/** 特性方案列表响应 */
export type FeatureReviewListResponse = DynamicFileListResponse<FeatureReviewResult>

/** 特性方案表单（动态/详情附带字段经索引签名回填/提交） */
export type FeatureReviewFormData = {
  /** 子特性 */
  subFeature: string
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 测试项结果 */
  itemResult: string
  /** 相关核查项 */
  relatedItem: string
  /** 是否为测试用例 */
  hasTestCase: string
  /** 测试项说明 */
  itemDescription: string
  /** 备注 */
  remark: string
} & Record<string, unknown>
