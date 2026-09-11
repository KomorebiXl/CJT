import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  SoftwareTestObjectData,
  SoftwareTestObjectFormData,
  SoftwareTestObjectSearchParams
} from '@/types/projectProcess/homeInfo/softwareTestObject'

const softwareTestObjectBaseUrl = '/asset/system'

/** 软件被测对象列表 */
export const getSoftwareTestObjectListAPI = createListAPI<
  SoftwareTestObjectSearchParams,
  SoftwareTestObjectData
>(`${softwareTestObjectBaseUrl}/list`)

/** 软件被测对象删除 */
export const deleteSoftwareTestObjectAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({
    url: `${softwareTestObjectBaseUrl}/delete`,
    data
  })

/** 软件被测对象新增 */
export const addSoftwareTestObjectAPI = (data: SoftwareTestObjectFormData) =>
  request.post<BaseResponse>({ url: `${softwareTestObjectBaseUrl}`, data })

/** 软件被测对象详情 */
export const getSoftwareTestObjectDetailAPI = (id: string) =>
  request.get<DataResponse<SoftwareTestObjectData>>({
    url: `${softwareTestObjectBaseUrl}/${id}`
  })

/** 软件被测对象编辑（源接口地址带尾斜杠，照源迁移） */
export const updateSoftwareTestObjectAPI = (
  data: SoftwareTestObjectFormData & { id: string }
) => request.put<BaseResponse>({ url: `${softwareTestObjectBaseUrl}/`, data })
