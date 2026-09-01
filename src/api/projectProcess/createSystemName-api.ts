import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  CreateSystemNameData,
  CreateSystemNameFormData,
  CreateSystemNameSearchParams
} from '@/types/projectProcess/createSystemName'

const createSystemNameBaseUrl = '/ras/subsystem'

/** 新建系统名称列表 */
export const getCreateSystemNameDataAPI = createListAPI<
  CreateSystemNameSearchParams,
  CreateSystemNameData
>(`${createSystemNameBaseUrl}/list`)

/** 新增系统名称 */
export const addCreateSystemNameAPI = (data: CreateSystemNameFormData) =>
  request.post<BaseResponse>({ url: `${createSystemNameBaseUrl}`, data })

/** 系统名称详情 */
export const getCreateSystemNameDetailAPI = (id: string) =>
  request.get<DataResponse<CreateSystemNameData>>({
    url: `${createSystemNameBaseUrl}/${id}`
  })

/** 更新系统名称 */
export const updateCreateSystemNameAPI = (
  data: CreateSystemNameFormData & { id: string }
) => request.put<BaseResponse>({ url: `${createSystemNameBaseUrl}`, data })

/** 删除系统名称 */
export const deleteCreateSystemNameAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${createSystemNameBaseUrl}/delete`,
    data
  })
