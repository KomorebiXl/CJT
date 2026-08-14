import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  MiddlewareData,
  MiddlewareFormData,
  MiddlewareSearchParams
} from '@/types/projectProcess/informationCollection/middleware'

const middlewareBaseUrl = '/asset/system'

export const getMiddlewareDataAPI = createListAPI<
  MiddlewareSearchParams,
  MiddlewareData
>(`${middlewareBaseUrl}/list`)

export const createMiddlewareAPI = (data: MiddlewareFormData) =>
  request.post<BaseResponse>({ url: `${middlewareBaseUrl}`, data })

export const getMiddlewareDetailAPI = (id: string) =>
  request.get<DataResponse<MiddlewareData>>({
    url: `${middlewareBaseUrl}/${id}`
  })

export const updateMiddlewareAPI = (
  data: MiddlewareFormData & { id: string }
) => request.put<BaseResponse>({ url: `${middlewareBaseUrl}`, data })

export const deleteMiddlewareAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${middlewareBaseUrl}/delete`, data })
