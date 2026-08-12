import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  GuideOption,
  SystemComponentAndUnitAssetData,
  SystemComponentAndUnitAssetFormData,
  SystemComponentAndUnitAssetSearchParams
} from '@/types/projectProcess/systemComponentAndUnitAsset'

const systemComponentAndUnitAssetBaseUrl = '/asset/system'

export const getSystemComponentAndUnitAssetDataAPI = createListAPI<
  SystemComponentAndUnitAssetSearchParams,
  SystemComponentAndUnitAssetData
>(`${systemComponentAndUnitAssetBaseUrl}/list`)

export const createSystemComponentAndUnitAssetAPI = (
  data: SystemComponentAndUnitAssetFormData
) =>
  request.post<BaseResponse>({
    url: `${systemComponentAndUnitAssetBaseUrl}`,
    data
  })

export const getSystemComponentAndUnitAssetDetailAPI = (id: string) =>
  request.get<DataResponse<SystemComponentAndUnitAssetData>>({
    url: `${systemComponentAndUnitAssetBaseUrl}/${id}`
  })

export const updateSystemComponentAndUnitAssetAPI = (
  data: SystemComponentAndUnitAssetFormData & { id: string }
) =>
  request.put<BaseResponse>({
    url: `${systemComponentAndUnitAssetBaseUrl}`,
    data
  })

export const deleteSystemComponentAndUnitAssetAPI = (data: {
  ids: Array<string>
}) =>
  request.post<BaseResponse>({
    url: `${systemComponentAndUnitAssetBaseUrl}/delete`,
    data
  })

/** 指导书下拉选项 */
// TODO 后续需要将该API迁移至指导书api
export const getGuideOptionAPI = () =>
  request.get<DataResponse<Array<GuideOption>>>({
    url: '/background/guide/option'
  })
