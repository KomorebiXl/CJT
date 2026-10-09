import type { DynamicFileListResponse } from './projectProcessCommon'
import type { FileItem } from '@/types/common'

/** 测试用例功能性-系统名称搜索参数 */
export type TestCaseFnSystemSearchParams = {
  /** 名称 */
  name: string
}

/** 测试用例功能性-系统名称行（系统树） */
export type TestCaseFnSystemData = {
  id: string
  /** 名称 */
  name: string
  /** 上级节点 id */
  parentId: string
  /** 子节点 */
  child?: Array<TestCaseFnSystemData>
}

/** 测试用例功能性-测试项搜索参数 */
export type TestCaseFnItemSearchParams = {
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
}

/** 测试用例功能性-测试项行（含回归列与回归测试截图；动态文件字段运行时存在，不在类型内声明） */
export type TestCaseFnItemResult = {
  id: string
  /** 序号 */
  serialNumber: string
  /** 测试项 */
  item: string
  /** 测试项说明 */
  itemDescription: string
  /** 是否删除测试项（行样式标记：0 时置灰；列表实际返回数值） */
  enable: string | number
  /** 是否分类行（1=分类行，无扩写内容） */
  titleFlag: string | number
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
  /** 回归测试截图文本 */
  regressionScreenshot: string
  /** 回归测试截图文件 */
  regressionScreenshotFiles: Array<FileItem>
  /** AI 扩写结果（无数据为 null） */
  aiExpansion?: TestCaseAiExpansion | null
}

/** 测试用例功能性-测试项列表响应 */
export type TestCaseFnItemListResponse =
  DynamicFileListResponse<TestCaseFnItemResult>

/** AI 扩写-测试数据行（复杂版用例表 001/002/... 行） */
export type TestCaseAiDataRow = {
  /** 编号 */
  no: string
  /** 输入 */
  input: string
  /** 预期结果 */
  expected: string
}

/** AI 扩写结果（复杂版测试用例结构） */
export type TestCaseAiExpansion = {
  /** 依据（与产品说明书的追踪关系） */
  basis: string
  /** 需求描述 */
  requirementDesc: string
  /** 前提条件（初始化） */
  precondition: string
  /** 步骤 */
  step: string
  /** 优先级别（高/中/低） */
  priority: string
  /** 测试数据行 */
  dataRows: Array<TestCaseAiDataRow>
}

/** AI 扩写-重新生成参数（单项/小批量 ≤10，同步接口） */
export type TestCaseAiRegenerateParams = {
  resultIds: string[]
}

/** AI 扩写-单条生成结果（status：1 成功 2 降级-原文回填 3 失败） */
export type TestCaseAiRegenerateItem = {
  /** 验收测试结果 id */
  resultId: string
  status: number
  expansion?: TestCaseAiExpansion
  /** 失败原因（status=3 时存在） */
  message?: string
}

/** AI 批量生成任务参数（subsystem 空=全部子系统增量；mode=overwrite 覆盖范围内全部） */
export type TestCaseAiGenerateParams = {
  subjectId: string
  feature: string
  subFeature: string
  subsystem?: string
  mode?: 'increment' | 'overwrite'
}

/** AI 任务进度（status：idle 无任务 running 进行中 success 成功 failed 失败） */
export type TestCaseAiTaskProgress = {
  subjectId?: string
  status: 'idle' | 'running' | 'success' | 'failed'
  total?: number
  processed?: number
  success?: number
  degraded?: number
  failed?: number
  message?: string | null
  startTime?: string | null
  endTime?: string | null
}

/** AI 用例 Word 下载参数（subsystem 空=全项目合并文档，传值=仅该子系统） */
export type TestCaseAiDownloadParams = {
  subjectId: string
  feature: string
  subFeature: string
  subsystem?: string
}
