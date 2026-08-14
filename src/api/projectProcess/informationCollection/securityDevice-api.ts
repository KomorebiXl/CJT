import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  SecurityDeviceData,
  SecurityDeviceFormData,
  SecurityDeviceSearchParams
} from '@/types/projectProcess/informationCollection/securityDevice'

const securityDeviceBaseUrl = '/asset/system'

export const getSecurityDeviceDataAPI = createListAPI<
  SecurityDeviceSearchParams,
  SecurityDeviceData
>(`${securityDeviceBaseUrl}/list`)

export const createSecurityDeviceAPI = (data: SecurityDeviceFormData) =>
  request.post<BaseResponse>({ url: `${securityDeviceBaseUrl}`, data })

export const getSecurityDeviceDetailAPI = (id: string) =>
  request.get<DataResponse<SecurityDeviceData>>({
    url: `${securityDeviceBaseUrl}/${id}`
  })

export const updateSecurityDeviceAPI = (
  data: SecurityDeviceFormData & { id: string }
) => request.put<BaseResponse>({ url: `${securityDeviceBaseUrl}`, data })

export const deleteSecurityDeviceAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${securityDeviceBaseUrl}/delete`, data })
