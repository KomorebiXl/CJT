import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  NetworkDeviceData,
  NetworkDeviceFormData,
  NetworkDeviceSearchParams
} from '@/types/informationCollection/networkDevice'

const networkDeviceBaseUrl = '/asset/system'

export const getNetworkDeviceDataAPI = createListAPI<
  NetworkDeviceSearchParams,
  NetworkDeviceData
>(`${networkDeviceBaseUrl}/list`)

export const createNetworkDeviceAPI = (data: NetworkDeviceFormData) =>
  request.post<BaseResponse>({ url: `${networkDeviceBaseUrl}`, data })

export const getNetworkDeviceDetailAPI = (id: string) =>
  request.get<DataResponse<NetworkDeviceData>>({
    url: `${networkDeviceBaseUrl}/${id}`
  })

export const updateNetworkDeviceAPI = (
  data: NetworkDeviceFormData & { id: string }
) => request.put<BaseResponse>({ url: `${networkDeviceBaseUrl}`, data })

export const deleteNetworkDeviceAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${networkDeviceBaseUrl}/delete`, data })
