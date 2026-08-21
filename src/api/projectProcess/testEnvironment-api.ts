import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  TestEnvironmentData,
  TestEnvironmentFormData,
  TestEnvironmentSearchParams
} from '@/types/projectProcess/testEnvironment'

const testEnvironmentBaseUrl = '/asset/env'

export const getTestEnvironmentDataAPI = createListAPI<
  TestEnvironmentSearchParams,
  TestEnvironmentData
>(`${testEnvironmentBaseUrl}/list`)

/** 新增测试环境 */
export const createTestEnvironmentAPI = (data: TestEnvironmentFormData) =>
  request.post<BaseResponse>({ url: `${testEnvironmentBaseUrl}`, data })

/** 测试环境详情 */
export const getTestEnvironmentDetailAPI = (id: string) =>
  request.get<DataResponse<TestEnvironmentData>>({
    url: `${testEnvironmentBaseUrl}/${id}`
  })

/** 编辑测试环境 */
export const updateTestEnvironmentAPI = (
  data: TestEnvironmentFormData & { id: string }
) =>
  request.put<BaseResponse>({ url: `${testEnvironmentBaseUrl}`, data })

/** 删除测试环境 */
export const deleteTestEnvironmentAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${testEnvironmentBaseUrl}/delete`, data })
