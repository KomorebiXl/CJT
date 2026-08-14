import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  AssetAssignmentData,
  AssetAssignmentFormData,
  AssetAssignmentSearchParams,
  AssetSystemOption
} from '@/types/projectProcess/assetAssignment'

const assetAssignmentBaseUrl = '/asset/business'

export const getAssetAssignmentDataAPI = createListAPI<
  AssetAssignmentSearchParams,
  AssetAssignmentData
>(`${assetAssignmentBaseUrl}/list`)

export const createAssetAssignmentAPI = (data: AssetAssignmentFormData) =>
  request.post<BaseResponse>({ url: `${assetAssignmentBaseUrl}`, data })

export const getAssetAssignmentDetailAPI = (id: string) =>
  request.get<DataResponse<AssetAssignmentData>>({
    url: `${assetAssignmentBaseUrl}/${id}`
  })

export const updateAssetAssignmentAPI = (
  data: AssetAssignmentFormData & { id: string }
) => request.put<BaseResponse>({ url: `${assetAssignmentBaseUrl}`, data })

export const deleteAssetAssignmentAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${assetAssignmentBaseUrl}/delete`, data })

/** 系统资产选项 */
export const getAssetSystemOptionsAPI = (params?: Record<string, any>) =>
  request.get<DataResponse<Array<AssetSystemOption>>>({
    url: '/asset/system/option',
    params
  })
