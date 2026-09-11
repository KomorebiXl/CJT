import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  TestEnvironmentData,
  TestEnvironmentFormData,
  TestEnvironmentSearchParams,
  TestEnvironmentDetailsData,
  TestEnvironmentDetailsFormData,
  TestEnvironmentDetailsSearchParams
} from '@/types/projectProcess/homeInfo/testEnvironment'

const testEnvironmentBaseUrl = '/ras/category'
const testEnvironmentDetailsBaseUrl = '/asset/env'

/** 测试环境分类列表（树形 rows，child 嵌套） */
export const getTestEnvironmentListAPI = createListAPI<
  TestEnvironmentSearchParams,
  TestEnvironmentData
>(`${testEnvironmentBaseUrl}/list`)

/** 测试环境分类删除 */
export const deleteTestEnvironmentAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${testEnvironmentBaseUrl}/delete`, data })

/** 测试环境分类新增 */
export const addTestEnvironmentAPI = (data: TestEnvironmentFormData) =>
  request.post<BaseResponse>({ url: `${testEnvironmentBaseUrl}`, data })

/** 测试环境分类详情 */
export const getTestEnvironmentDetailAPI = (id: string) =>
  request.get<DataResponse<TestEnvironmentData>>({
    url: `${testEnvironmentBaseUrl}/${id}`
  })

/** 测试环境分类编辑 */
export const updateTestEnvironmentAPI = (
  data: TestEnvironmentFormData & { id: string }
) => request.put<BaseResponse>({ url: `${testEnvironmentBaseUrl}`, data })

/** 软件环境列表 */
export const getTestEnvironmentDetailsAPI = createListAPI<
  TestEnvironmentDetailsSearchParams,
  TestEnvironmentDetailsData
>(`${testEnvironmentDetailsBaseUrl}/list`)

/** 软件环境删除 */
export const deleteTestEnvironmentDetailsAPI = (data: {
  ids: Array<string>
}) =>
  request.post<BaseResponse>({
    url: `${testEnvironmentDetailsBaseUrl}/delete`,
    data
  })

/** 软件环境新增 */
export const addTestEnvironmentDetailsAPI = (
  data: TestEnvironmentDetailsFormData
) =>
  request.post<BaseResponse>({
    url: `${testEnvironmentDetailsBaseUrl}`,
    data
  })

/** 软件环境详情 */
export const getTestEnvironmentDetailsDetailAPI = (id: string) =>
  request.get<DataResponse<TestEnvironmentDetailsData>>({
    url: `${testEnvironmentDetailsBaseUrl}/${id}`
  })

/** 软件环境编辑 */
export const updateTestEnvironmentDetailsAPI = (
  data: TestEnvironmentDetailsFormData & { id: string }
) =>
  request.put<BaseResponse>({
    url: `${testEnvironmentDetailsBaseUrl}`,
    data
  })
