import request from '@/utils/request'
import type {
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
