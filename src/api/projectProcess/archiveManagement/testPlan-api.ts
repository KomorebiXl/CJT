import request from '@/utils/request'
import type {
  GenerateTestPlanResponse,
  TestPlanData,
  TestPlanListResponse,
  TestPlanSearchParams,
  UpdateSubjectPlanLanguageParams
} from '@/types/projectProcess/archiveManagement/testPlan'

const testPlanBaseUrl = '/subject/plan'

/** 测试方案列表 */
export const getTestPlanDataAPI = (
  params: ListQuery<TestPlanSearchParams> & { id: string }
) =>
  request.get<TestPlanListResponse>({
    url: `${testPlanBaseUrl}/list`,
    params
  })

/** 下载测试方案 */
export const getTestPlanBlobAPI = (params: TestPlanData) =>
  request.download({
    url: `${testPlanBaseUrl}/download`,
    method: 'POST',
    params
  })

/** 生成测试方案 */
export const generateSubjectPlanAPI = (params: {
  confirmStep: number
  id: number | string
}) =>
  request.get<GenerateTestPlanResponse>({
    url: `${testPlanBaseUrl}/generate`,
    params
  })

/** 删除测试方案 */
export const deleteSubjectPlanAPI = (data: TestPlanData) =>
  request.post<BaseResponse>({ url: `${testPlanBaseUrl}/delete`, data })

/** 语言类型设置 */
export const updateSubjectPlanLanguageAPI = (
  data: UpdateSubjectPlanLanguageParams
) => request.post<BaseResponse>({ url: `${testPlanBaseUrl}/language`, data })
