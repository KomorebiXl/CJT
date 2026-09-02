import request from '@/utils/request'
import type {
  FeatureReviewFormData,
  FeatureReviewListResponse,
  FeatureReviewSearchParams,
  SystemDetailFormData,
  SystemDetailListResponse,
  SystemDetailResult,
  SystemDetailSearchParams
} from '@/types/projectProcess/testPlanReview'

const planBaseUrl = '/asset/plan'

/** 系统详情列表 */
export const getSystemDetailListAPI = (
  params: ListQuery<SystemDetailSearchParams & { feature: string; subsystem: string }>
) => request.get<SystemDetailListResponse>({ url: `${planBaseUrl}/list`, params })

/** 系统详情单条（详情对象嵌套于 data.result） */
export const getSystemDetailDetailAPI = (id: string) =>
  request.get<DataResponse<{ result: SystemDetailResult }>>({
    url: `${planBaseUrl}/${id}`
  })

/** 新增系统详情记录 */
export const addSystemDetailAPI = (data: SystemDetailFormData) =>
  request.post<BaseResponse>({ url: planBaseUrl, data })

/** 更新系统详情记录 */
export const updateSystemDetailAPI = (data: SystemDetailFormData & { id: string }) =>
  request.put<BaseResponse>({ url: planBaseUrl, data })

/** 删除系统详情记录 */
export const deleteSystemDetailAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${planBaseUrl}/delete`, data })

/** 特性方案列表（feature='2'~'9'，不带 subsystem） */
export const getFeatureReviewListAPI = (
  params: ListQuery<FeatureReviewSearchParams & { feature: string }>
) => request.get<FeatureReviewListResponse>({ url: `${planBaseUrl}/list`, params })

/** 新增特性方案记录 */
export const addFeatureReviewAPI = (data: FeatureReviewFormData) =>
  request.post<BaseResponse>({ url: planBaseUrl, data })

/** 更新特性方案记录 */
export const updateFeatureReviewAPI = (data: FeatureReviewFormData & { id: string }) =>
  request.put<BaseResponse>({ url: planBaseUrl, data })
