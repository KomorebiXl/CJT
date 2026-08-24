import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  InformationSecurityData,
  InformationSecuritySearchParams
} from '@/types/projectProcess/informationSecurity'

const informationSecurityBaseUrl = '/asset/security'

export const getInformationSecurityDataAPI = createListAPI<
  InformationSecuritySearchParams,
  InformationSecurityData
>(`${informationSecurityBaseUrl}/list`)

/** 新增信息安全性 */
export const createInformationSecurityAPI = (data: FormData) =>
  request.post<BaseResponse>({ url: `${informationSecurityBaseUrl}`, data })

/** 信息安全性详情 */
export const getInformationSecurityDetailAPI = (id: string) =>
  request.get<DataResponse<InformationSecurityData>>({
    url: `${informationSecurityBaseUrl}/${id}`
  })

/** 编辑信息安全性 */
export const updateInformationSecurityAPI = (data: FormData) =>
  request.put<BaseResponse>({ url: `${informationSecurityBaseUrl}`, data })
