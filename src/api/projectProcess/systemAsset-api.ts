import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  SystemAssetData,
  SystemAssetFormData,
  SystemAssetSearchParams
} from '@/types/projectProcess/systemAsset'

const systemAssetBaseUrl = '/asset/system'

export const getSystemAssetDataAPI = createListAPI<
  SystemAssetSearchParams,
  SystemAssetData
>(`${systemAssetBaseUrl}/list`)

export const createSystemAssetAPI = (data: SystemAssetFormData) =>
  request.post<BaseResponse>({ url: `${systemAssetBaseUrl}`, data })

export const getSystemAssetDetailAPI = (id: string) =>
  request.get<DataResponse<SystemAssetData>>({
    url: `${systemAssetBaseUrl}/${id}`
  })

export const updateSystemAssetAPI = (
  data: SystemAssetFormData & { id: string }
) => request.put<BaseResponse>({ url: `${systemAssetBaseUrl}`, data })

export const deleteSystemAssetAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${systemAssetBaseUrl}/delete`, data })
