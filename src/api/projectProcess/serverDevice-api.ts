import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  ServerDeviceData,
  ServerDeviceFormData,
  ServerDeviceSearchParams
} from '@/types/projectProcess/serverDevice'

const serverDeviceBaseUrl = '/asset/system'

export const getServerDeviceDataAPI = createListAPI<
  ServerDeviceSearchParams,
  ServerDeviceData
>(`${serverDeviceBaseUrl}/list`)

export const createServerDeviceAPI = (data: ServerDeviceFormData) =>
  request.post<BaseResponse>({ url: `${serverDeviceBaseUrl}`, data })

export const getServerDeviceDetailAPI = (id: string) =>
  request.get<DataResponse<ServerDeviceData>>({
    url: `${serverDeviceBaseUrl}/${id}`
  })

export const updateServerDeviceAPI = (
  data: ServerDeviceFormData & { id: string }
) => request.put<BaseResponse>({ url: `${serverDeviceBaseUrl}`, data })

export const deleteServerDeviceAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${serverDeviceBaseUrl}/delete`, data })
