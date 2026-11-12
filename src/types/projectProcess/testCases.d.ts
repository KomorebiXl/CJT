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
  /** 子节点（树形列表 child 字段） */
  child?: Array<TestCaseFnItemResult>
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
  /** 首次结论（通过/不通过） */
  firstConclusion: string
  /** 回归结论（通过/不通过） */
  regressionConclusion: string
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

/** AI 扩写-单条用例（问题6 功能点拆分：一个测试项按功能点出多条用例） */
export type TestCaseAiCase = {
  /** 用例名称（取自功能点名称；空回落测试项名称） */
  caseName: string
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

/** AI 扩写结果（复杂版测试用例结构；cases 为新结构，顶层单用例字段系旧数据兼容） */
export type TestCaseAiExpansion = {
  /** 依据（与产品说明书的追踪关系） */
  basis: string
  /** 需求描述（旧单用例结构） */
  requirementDesc: string
  /** 前提条件（初始化）（旧单用例结构） */
  precondition: string
  /** 步骤（旧单用例结构） */
  step: string
  /** 优先级别（高/中/低）（旧单用例结构） */
  priority: string
  /** 测试数据行（旧单用例结构） */
  dataRows: Array<TestCaseAiDataRow>
  /** 按功能点拆分的用例列表（新结构；旧数据为空） */
  cases?: Array<TestCaseAiCase>
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
  /** 子特性码（功能性固定 1；六个特性不传=整特性范围） */
  subFeature?: string
  subsystem?: string
  mode?: 'increment' | 'overwrite'
  /** 用例版本（detail 详细-功能点拆分成例，默认；simple 常规-一测试项一用例含正反用例；两版各自落库互不覆盖） */
  caseType?: 'detail' | 'simple'
}

/** AI 任务进度（status：idle 无任务 running 进行中 success 成功 failed 失败；taskType：generate 生成 extract 功能点提取） */
export type TestCaseAiTaskProgress = {
  subjectId?: string
  taskType?: 'generate' | 'extract'
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

/** 功能点（两段式：提取→评审→按清单生成；pointType：1 功能点 0 非功能剔除区；status：0 待评审 1 已确认 2 已剔除） */
export type AiFunctionPoint = {
  id?: string
  resultId?: string
  /** 功能点名称（剔除区行为剔除原文） */
  name: string
  /** 功能点描述（可独立执行验证的操作） */
  description?: string
  /** 提取来源原文片段 */
  sourceText?: string
  /** 提取时素材指纹（后端用于说明变更阻断，保存时原样带回） */
  sourceHash?: string
  pointType: '0' | '1'
  /** 剔除理由（pointType=0） */
  removeReason?: string
  status: '0' | '1' | '2'
  sort?: number
}

/** 功能点评审保存参数（按测试项全量置换） */
export type AiFunctionPointReviewParams = {
  resultId: string
  items: AiFunctionPoint[]
}

/** AI 用例 Word 下载参数（feature 空=全部特性合并一个文档；subsystem 空=范围内全部子系统；subFeature 空=按子特性分组渲染） */
export type TestCaseAiDownloadParams = {
  subjectId: string
  /** 特性码（空=全部特性 1-7 合并文档） */
  feature?: string
  /** 子特性码（功能性固定 1；六个特性不传=整体特性导出） */
  subFeature?: string
  subsystem?: string
  /** 用例版本（detail 详细-默认；simple 常规版，导出常规版落库记录） */
  caseType?: 'detail' | 'simple'
}
