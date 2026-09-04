import type { DynamicFileListResponse } from './projectProcessCommon'
import type { FileItem } from '@/types/common'

export type InitialTestStatisticsData = {
  /** 关联 parent_property 字典值的分类标识 */
  feature: string
  /** 总量 */
  total: number
  /** 未完成 */
  unFinish: number
  /** 符合 */
  conformity: number
  /** 不符合 */
  unconformity: number
  /** 支持性文件问题数 */
  supportiveClosingQuestions: number
  /** 环境不具备 */
  envNoDo: number
}

/** 首轮测试功能性-系统详情列表搜索参数 */
export type InitialTestSystemDetailSearchParams = {
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
}

/** 首轮测试功能性-系统详情行（动态文件字段运行时存在，不在类型内声明） */
export type InitialTestSystemDetailResult = {
  id: string
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 测试项说明 */
  itemDescription: string
  /** 是否删除测试项（行样式标记：0 时置灰；列表实际返回数值） */
  enable: string | number
  /** 备注 */
  remark: string
  /** 所属系统（后端字段名 subsystem） */
  subsystem: string
  /** 所属特性 */
  feature: string
  /** 所属子特性 */
  subFeature: string
  /** 相关测试项 */
  relatedItem: string
  /** 前提条件 */
  precondition: string
  /** 测试步骤 */
  step: string
  /** 首轮测试结果 */
  firstResult: string
  /** 首轮问题描述 */
  firstProblem: string
  /** 首次测试人员 */
  firstTester: string
  /** 首次测试时间 */
  firstTestTime: string
  /** 缺陷严重等级 */
  defectLevel: string
  /** 回归验证结果 */
  regressionResult: string
  /** 回归验证问题描述 */
  regressionProblem: string
  /** 回归测试人员 */
  regressionTester: string
  /** 回归测试时间 */
  regressionTestTime: string
  /** 测试环境 */
  env: string
  /** 首轮测试截图文本 */
  firstScreenshot: string
  /** 首轮测试截图文件 */
  firstScreenshotFiles: Array<FileItem>
}

/** 首轮测试功能性-系统详情列表响应 */
export type InitialTestSystemDetailListResponse =
  DynamicFileListResponse<InitialTestSystemDetailResult>

/** 首轮测试功能性-系统详情表单（动态文件字段经索引签名回填/提交） */
export type InitialTestSystemDetailFormData = Omit<
  InitialTestSystemDetailResult,
  'id' | 'enable'
> & {
  /** 是否删除测试项（回填为字符串，开关切换后为数值 0/1） */
  enable: string | number
} & Record<string, unknown>

/** 首轮测试功能性-重构序号参数 */
export type InitialTestRebuildSerialParams = {
  feature: string
  subFeature: string
  subsystem: string
}

/** 首轮测试功能性-回归（未通过记录）导出参数 */
export type InitialTestRegressExportParams = {
  feature: string
  subFeature: string
  subsystem: string
  dataType: string
}
