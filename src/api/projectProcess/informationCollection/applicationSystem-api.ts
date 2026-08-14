import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  ApplicationSystemData,
  ApplicationSystemFormData,
  ApplicationSystemSearchParams,
} from '@/types/projectProcess/informationCollection/applicationSystem'

const applicationSystemBaseUrl = '/asset/system'

export const getApplicationSystemDataAPI = createListAPI<
  ApplicationSystemSearchParams,
  ApplicationSystemData
>(`${applicationSystemBaseUrl}/list`)

export const createApplicationSystemAPI = (data: ApplicationSystemFormData) =>
  request.post<BaseResponse>({ url: `${applicationSystemBaseUrl}`, data })

export const getApplicationSystemDetailAPI = (id: string) =>
  request.get<DataResponse<ApplicationSystemData>>({
    url: `${applicationSystemBaseUrl}/${id}`
  })

export const updateApplicationSystemAPI = (
  data: ApplicationSystemFormData & { id: string }
) => request.put<BaseResponse>({ url: `${applicationSystemBaseUrl}`, data })

export const deleteApplicationSystemAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${applicationSystemBaseUrl}/delete`,
    data
  })
