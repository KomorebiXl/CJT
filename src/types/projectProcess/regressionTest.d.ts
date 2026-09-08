import type { InitialTestSystemDetailResult } from './initialTest'
import type { DynamicFileListResponse } from './projectProcessCommon'
import type { FileItem } from '@/types/common'

export type RegressionTestStatisticsData = {
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
  /** 环境不具备（本页统计矩阵未消费，仅契约保留） */
  envNoDo: number
}

/** 回归测试功能性-子系统结果搜索参数 */
export type RegressionTestFnSubsystemSearchParams = {
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
}

/** 回归测试功能性-子系统结果行（在首轮功能性行基础上增加回归测试截图；动态文件字段运行时存在，不在类型内声明） */
export type RegressionTestFnSubsystemResult = InitialTestSystemDetailResult & {
  /** 回归测试截图文本 */
  regressionScreenshot: string
  /** 回归测试截图文件 */
  regressionScreenshotFiles: Array<FileItem>
}

/** 回归测试功能性-子系统列表响应 */
export type RegressionTestFnSubsystemListResponse =
  DynamicFileListResponse<RegressionTestFnSubsystemResult>

/** 回归测试功能性-子系统表单（动态文件字段经索引签名回填/提交） */
export type RegressionTestFnSubsystemFormData = Omit<
  RegressionTestFnSubsystemResult,
  'id' | 'enable'
> & {
  /** 是否删除测试项（回填为字符串，开关切换后为数值 0/1） */
  enable: string | number
} & Record<string, unknown>
