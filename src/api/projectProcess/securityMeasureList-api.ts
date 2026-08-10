import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  SecurityMeasureListData,
  SecurityMeasureListFormData,
  SecurityMeasureListSearchParams
} from '@/types/projectProcess/securityMeasureList'

const securityMeasureListBaseUrl = '/asset/measure'

export const getSecurityMeasureListDataAPI = createListAPI<
  SecurityMeasureListSearchParams,
  SecurityMeasureListData
>(`${securityMeasureListBaseUrl}/list`)

export const createSecurityMeasureListAPI = (
  data: SecurityMeasureListFormData
) => request.post<BaseResponse>({ url: `${securityMeasureListBaseUrl}`, data })

export const getSecurityMeasureListDetailAPI = (id: string) =>
  request.get<DataResponse<SecurityMeasureListData>>({
    url: `${securityMeasureListBaseUrl}/${id}`
  })

export const updateSecurityMeasureListAPI = (
  data: SecurityMeasureListFormData & { id: string }
) => request.put<BaseResponse>({ url: `${securityMeasureListBaseUrl}`, data })

export const deleteSecurityMeasureListAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${securityMeasureListBaseUrl}/delete`,
    data
  })
