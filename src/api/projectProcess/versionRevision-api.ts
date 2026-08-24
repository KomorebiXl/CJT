import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  VersionRevisionData,
  VersionRevisionFormData
} from '@/types/projectProcess/versionRevision'

const versionRevisionBaseUrl = '/asset/version'

export const getVersionRevisionDataAPI = createListAPI<{}, VersionRevisionData>(
  `${versionRevisionBaseUrl}/list`
)

/** 新增版本修订 */
export const createVersionRevisionAPI = (data: VersionRevisionFormData) =>
  request.post<BaseResponse>({ url: `${versionRevisionBaseUrl}`, data })

/** 版本修订详情 */
export const getVersionRevisionDetailAPI = (id: string) =>
  request.get<DataResponse<VersionRevisionData>>({
    url: `${versionRevisionBaseUrl}/${id}`
  })

/** 编辑版本修订 */
export const updateVersionRevisionAPI = (
  data: VersionRevisionFormData & { id: string }
) => request.put<BaseResponse>({ url: `${versionRevisionBaseUrl}`, data })

/** 删除版本修订 */
export const deleteVersionRevisionAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${versionRevisionBaseUrl}/delete`, data })
