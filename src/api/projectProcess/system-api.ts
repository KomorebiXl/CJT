import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  SystemData,
  SystemFormData,
  SystemSearchParams
} from '@/types/projectProcess/system'

const systemBaseUrl = '/asset/system'

export const getSystemDataAPI = createListAPI<
  SystemSearchParams,
  SystemData
>(`${systemBaseUrl}/list`)

export const createSystemAPI = (data: SystemFormData) =>
  request.post<BaseResponse>({ url: `${systemBaseUrl}`, data })

export const getSystemDetailAPI = (id: string) =>
  request.get<DataResponse<SystemData>>({ url: `${systemBaseUrl}/${id}` })

export const updateSystemAPI = (data: SystemFormData & { id: string }) =>
  request.put<BaseResponse>({ url: `${systemBaseUrl}`, data })

export const deleteSystemAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${systemBaseUrl}/delete`, data })
