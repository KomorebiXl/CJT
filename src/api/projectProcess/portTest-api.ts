import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  PortTestData,
  PortTestSearchParams
} from '@/types/projectProcess/portTest'

/** 端口测试与基线核查共用 */
const portTestBaseUrl = '/asset/baseline'

export const getPortTestDataAPI = createListAPI<
  PortTestSearchParams,
  PortTestData
>(`${portTestBaseUrl}/list`)

/** 新增端口测试 */
export const createPortTestAPI = (data: FormData) =>
  request.post<BaseResponse>({ url: portTestBaseUrl, data })

/** 端口测试详情 */
export const getPortTestDetailAPI = (id: string) =>
  request.get<DataResponse<PortTestData>>({
    url: `${portTestBaseUrl}/${id}`
  })

/** 编辑端口测试） */
export const updatePortTestAPI = (data: FormData) =>
  request.put<BaseResponse>({ url: portTestBaseUrl, data })

/** 删除端口测试 */
export const deletePortTestAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${portTestBaseUrl}/delete`, data })

/** 生成测试日志 */
export { generateSubjectLogAPI } from './baselineCheck-api.ts'
