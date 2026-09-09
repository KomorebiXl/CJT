import type {
  InitialTestFeatureResult,
  InitialTestSystemDetailResult,
  InitialTestTimeAnalysisRow
} from './initialTest'
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

/** 回归测试特性页搜索参数 */
export type RegressionTestFeatureSearchParams = {
  /** 测试项 */
  item: string
  /** 首次测试人员 */
  firstTester: string
  /** 子特性 */
  subFeature: string
  /** 首轮测试结果 */
  firstResult: string
  /** 回归验证结果 */
  regressionResult: string
}

/** 回归测试特性页行（在首轮特性行基础上增加回归测试截图；动态文件字段运行时存在，不在类型内声明） */
export type RegressionTestFeatureResult = InitialTestFeatureResult & {
  /** 回归测试截图文本 */
  regressionScreenshot: string
  /** 回归测试截图文件 */
  regressionScreenshotFiles: Array<FileItem>
}

/** 回归测试特性页列表响应 */
export type RegressionTestFeatureListResponse =
  DynamicFileListResponse<RegressionTestFeatureResult>

/** 回归测试特性页表单（动态文件字段经索引签名回填/提交） */
export type RegressionTestFeatureFormData = Omit<
  RegressionTestFeatureResult,
  'id' | 'enable' | 'subFeatureLabel' | 'envLabel'
> & {
  /** 是否删除测试项（回填为字符串，开关切换后为数值 0/1） */
  enable: string | number
  /** 过程截图文本（可靠性/性能效率） */
  processScreenshot: string
  /** 过程截图文件（可靠性/性能效率；源 otherProp 字段名为 files） */
  files: Array<FileItem>
  /** 时间特性分析表类型（性能效率：'1' | '2'） */
  caseTableType: string | number
  /** 时间特性分析表数据（性能效率；详情字段 timeAnalysisList 回填至此） */
  assetAcceptanceTimeAnalysisList: Array<InitialTestTimeAnalysisRow>
} & Record<string, unknown>
