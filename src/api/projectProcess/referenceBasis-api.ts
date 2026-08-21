import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  ReferenceBasisData,
  ReferenceBasisFormData,
  ReferenceBasisSearchParams
} from '@/types/projectProcess/referenceBasis'

const referenceBasisBaseUrl = '/asset/standard'

export const getReferenceBasisDataAPI = createListAPI<
  ReferenceBasisSearchParams,
  ReferenceBasisData
>(`${referenceBasisBaseUrl}/list`)

/** 新增参考依据 */
export const createReferenceBasisAPI = (data: ReferenceBasisFormData) =>
  request.post<BaseResponse>({ url: `${referenceBasisBaseUrl}`, data })

/** 参考依据详情 */
export const getReferenceBasisDetailAPI = (id: string) =>
  request.get<DataResponse<ReferenceBasisData>>({
    url: `${referenceBasisBaseUrl}/${id}`
  })

/** 编辑参考依据 */
export const updateReferenceBasisAPI = (
  data: ReferenceBasisFormData & { id: string }
) => request.put<BaseResponse>({ url: `${referenceBasisBaseUrl}`, data })

/** 删除参考依据 */
export const deleteReferenceBasisAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${referenceBasisBaseUrl}/delete`, data })
