import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  CommonTestEnvironmentsData,
  CommonTestEnvironmentsSearchParams
} from '@/types/adminManagement/commonTestEnvironments'

const commonTestEnvironmentsBaseUrl = '/background/env'

export const getCommonTestEnvironmentsDataAPI = createListAPI<
  CommonTestEnvironmentsSearchParams,
  CommonTestEnvironmentsData
>(`${commonTestEnvironmentsBaseUrl}/list`)

export const createCommonTestEnvironmentsAPI = (
  data: Record<string, unknown>
) =>
  request.post<BaseResponse>({ url: `${commonTestEnvironmentsBaseUrl}`, data })

export const getCommonTestEnvironmentsDetailAPI = (id: string) =>
  request.get<DataResponse<CommonTestEnvironmentsData>>({
    url: `${commonTestEnvironmentsBaseUrl}/${id}`
  })

export const updateCommonTestEnvironmentsAPI = (
  data: Record<string, unknown>
) =>
  request.put<BaseResponse>({ url: `${commonTestEnvironmentsBaseUrl}`, data })

export const deleteCommonTestEnvironmentsAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${commonTestEnvironmentsBaseUrl}/delete`,
    data
  })

/** 常用测试环境选项 */
export const getCommonTestEnvironmentsOptionsAPI = () =>
  request.get<DataResponse<Array<CommonTestEnvironmentsData>>>({
    url: `${commonTestEnvironmentsBaseUrl}/option`
  })
