import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  TestObjectDocumentData,
  TestObjectDocumentFormData,
  TestObjectDocumentSearchParams,
  TestObjectDocumentUpdatePayload
} from '@/types/projectProcess/homeInfo/testObjectDocument'

const testObjectDocumentBaseUrl = '/asset/document'

/** 测试对象文档列表 */
export const getTestObjectDocumentListAPI = createListAPI<
  TestObjectDocumentSearchParams,
  TestObjectDocumentData
>(`${testObjectDocumentBaseUrl}/list`)

/** 测试对象文档删除 */
export const deleteTestObjectDocumentAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${testObjectDocumentBaseUrl}/delete`,
    data
  })

/** 测试对象文档新增 */
export const addTestObjectDocumentAPI = (data: TestObjectDocumentFormData) =>
  request.post<BaseResponse>({ url: `${testObjectDocumentBaseUrl}`, data })

/** 测试对象文档详情 */
export const getTestObjectDocumentDetailAPI = (id: string) =>
  request.get<DataResponse<TestObjectDocumentData>>({
    url: `${testObjectDocumentBaseUrl}/${id}`
  })

/** 测试对象文档编辑（弹窗表单提交或排序失焦传整行） */
export const updateTestObjectDocumentAPI = (
  data: TestObjectDocumentUpdatePayload
) => request.put<BaseResponse>({ url: `${testObjectDocumentBaseUrl}`, data })
