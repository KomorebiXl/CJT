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

/** 首轮测试特性页搜索参数 */
export type InitialTestFeatureSearchParams = {
  /** 测试项 */
  item: string
  /** 首次测试人员 */
  firstTester: string
  /** 子特性 */
  subFeature: string
  /** 是否删除测试项 */
  enable: string
  /** 首轮测试结果 */
  firstResult: string
}

/** 首轮测试特性页行（子特性/测试环境为列表接口返回的标签字段） */
export type InitialTestFeatureResult = InitialTestSystemDetailResult & {
  /** 子特性标签 */
  subFeatureLabel?: string
  /** 测试环境标签 */
  envLabel?: string
}

/** 首轮测试特性页列表响应 */
export type InitialTestFeatureListResponse =
  DynamicFileListResponse<InitialTestFeatureResult>

/** 性能效率-时间特性分析表行（测试结果表格1/表格2 双形态） */
export type InitialTestTimeAnalysisRow =
  | {
      /** 用户数 */
      userCount: string | number
      /** 响应时间-最小值 */
      minimum: string | number
      /** 响应时间-平均值 */
      average: string | number
      /** 响应时间-最大值 */
      maximum: string | number
      /** 事务通过率-成功 */
      successRate: string
      /** 事务通过率-失败 */
      failureRate: string
    }
  | {
      /** 次数 */
      testCount: string | number
      /** 用户数 */
      userCount: string | number
      /** 响应时间 */
      responseTime: string | number
      /** 测试结果（通过/不通过） */
      testResult: string
    }

/** 首轮测试特性页表单（动态文件字段经索引签名回填/提交） */
export type InitialTestFeatureFormData = {
  /** 子特性 */
  subFeature: string
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 是否删除测试项（回填字符串，开关切换后为数值 0/1） */
  enable: string | number
  /** 相关测试项 */
  relatedItem: string
  /** 首轮测试结果 */
  firstResult: string
  /** 首次测试人员 */
  firstTester: string
  /** 首次测试时间 */
  firstTestTime: string
  /** 缺陷严重等级 */
  defectLevel: string
  /** 测试环境 */
  env: string
  /** 测试项说明 */
  itemDescription: string
  /** 前提条件 */
  precondition: string
  /** 测试步骤 */
  step: string
  /** 首轮问题描述 */
  firstProblem: string
  /** 备注 */
  remark: string
  /** 测试用例（用例组） */
  testCase: string
  /** 测试准备（用例组） */
  preparation: string
  /** 测试策略（用例组） */
  strategy: string
  /** 事务说明（用例组） */
  transactionDescription: string
  /** 详细结果（用例组） */
  resultDetail: string
  /** 测试截图文本 */
  firstScreenshot: string
  /** 测试截图文件 */
  firstScreenshotFiles: Array<FileItem>
  /** 过程截图文本（可靠性/性能效率） */
  processScreenshot: string
  /** 过程截图文件（可靠性/性能效率；源 otherProp 字段名为 files） */
  files: Array<FileItem>
  /** 时间特性分析表类型（性能效率：'1' | '2'） */
  caseTableType: string | number
  /** 时间特性分析表数据（性能效率；详情字段 timeAnalysisList 回填至此） */
  assetAcceptanceTimeAnalysisList: Array<InitialTestTimeAnalysisRow>
} & Record<string, unknown>
