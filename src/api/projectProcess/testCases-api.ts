import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  AiFunctionPoint,
  AiFunctionPointReviewParams,
  TestCaseAiDocSetGenerateParams,
  TestCaseAiDocSetRecord,
  TestCaseAiDownloadParams,
  TestCaseAiGenerateParams,
  TestCaseAiRegenerateItem,
  TestCaseAiRegenerateParams,
  TestCaseAiTaskProgress,
  TestCaseFnItemListResponse,
  TestCaseFnItemSearchParams,
  TestCaseFnSystemData,
  TestCaseFnSystemSearchParams
} from '@/types/projectProcess/testCases'

/** 测试用例-系统名称树（与新建系统名称共用 /ras/subsystem 资源） */
const testCaseSubsystemBaseUrl = '/ras/subsystem'

/** 测试用例-测试项基地址 */
const testCaseResultBaseUrl = '/asset/acceptance/result'

/** 测试用例功能性-系统名称列表 */
export const getTestCaseFnSystemListAPI = createListAPI<
  TestCaseFnSystemSearchParams,
  TestCaseFnSystemData
>(`${testCaseSubsystemBaseUrl}/list`)

/** 测试用例-测试项列表（功能性传 subFeature+subsystem；六个特性仅 feature，整体特性平铺数据） */
export const getTestCaseFnItemListAPI = (
  params: ListQuery<
    TestCaseFnItemSearchParams & {
      feature: string
      subFeature?: string
      subsystem?: string
      dataType: string
    }
  >
) =>
  request.get<TestCaseFnItemListResponse>({
    url: `${testCaseResultBaseUrl}/list`,
    params
  })

/** 测试用例-AI 扩写重新生成（单项/小批量 ≤10，同步接口） */
export const regenerateAiTestCaseAPI = (data: TestCaseAiRegenerateParams) =>
  request.post<DataResponse<TestCaseAiRegenerateItem[]>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/regenerate`,
    data
  })

/** 测试用例-AI 批量生成任务（外层全量=增量；里层子系统 mode=overwrite；caseType=simple 生成常规版） */
export const generateAiTestCaseAPI = (data: TestCaseAiGenerateParams) =>
  request.post<DataResponse<TestCaseAiTaskProgress>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/generate`,
    data
  })

/** 测试用例-AI 任务进度查询 */
export const getAiTestCaseProgressAPI = (subjectId: string) =>
  request.get<DataResponse<TestCaseAiTaskProgress>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/progress`,
    params: { subjectId }
  })

/** 测试用例-AI 任务停止（剩余项跳过、本批已生成记录作废；再次生成=全新一轮） */
export const stopAiTestCaseAPI = (data: TestCaseAiDocSetGenerateParams) =>
  request.post<DataResponse<TestCaseAiTaskProgress>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/stop`,
    data
  })

/** 测试用例-用户文档集核查步骤生成任务（整特性一次 AI 调用，异步） */
export const generateDocSetAPI = (data: TestCaseAiDocSetGenerateParams) =>
  request.post<DataResponse<TestCaseAiTaskProgress>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/generateDocSet`,
    data
  })

/** 测试用例-用户文档集核查步骤查询（整特性一份；无记录返回 null） */
export const getDocSetAPI = (subjectId: string) =>
  request.get<DataResponse<TestCaseAiDocSetRecord | null>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/docSet`,
    params: { subjectId }
  })

/** 测试用例-AI 复杂版用例 Word 下载（caseType=simple 导出常规版记录） */
export const downloadAiTestCaseAPI = (params: TestCaseAiDownloadParams) =>
  request.download({
    url: `${testCaseResultBaseUrl}/aiTestCase/download`,
    params,
    method: 'GET'
  })

// ---- 两段式：功能点提取与评审 ----

/** 功能点-AI 批量提取任务（异步；已有清单且素材未变更的项自动跳过） */
export const extractFunctionPointsAPI = (data: TestCaseAiGenerateParams) =>
  request.post<DataResponse<TestCaseAiTaskProgress>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/extractFunctionPoints`,
    data
  })

/** 功能点-AI 单项/小批量提取（同步，≤10；详情页单项提取用） */
export const extractFunctionPointsSyncAPI = (data: TestCaseAiRegenerateParams) =>
  request.post<DataResponse<TestCaseAiRegenerateItem[]>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/functionPoints/extractSync`,
    data
  })

/** 功能点-清单查询（功能点在前、剔除区在后） */
export const getFunctionPointsAPI = (resultId: string) =>
  request.get<DataResponse<AiFunctionPoint[]>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/functionPoints`,
    params: { resultId }
  })

/** 功能点-评审保存（按测试项全量置换） */
export const saveFunctionPointsAPI = (data: AiFunctionPointReviewParams) =>
  request.put<DataResponse<number>>({
    url: `${testCaseResultBaseUrl}/aiTestCase/functionPoints`,
    data
  })
