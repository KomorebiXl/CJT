import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
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

/** 测试用例-测试项列表（功能性传 subFeature+subsystem；六特性仅 feature，整特性平铺数据） */
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

/** 测试用例-AI 批量生成任务（外层全量=增量；里层子系统 mode=overwrite） */
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

/** 测试用例-AI 复杂版用例 Word 下载 */
export const downloadAiTestCaseAPI = (params: TestCaseAiDownloadParams) =>
  request.download({
    url: `${testCaseResultBaseUrl}/aiTestCase/download`,
    params,
    method: 'GET'
  })
