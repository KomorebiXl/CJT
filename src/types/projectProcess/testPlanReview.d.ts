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
