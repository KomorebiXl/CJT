import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  WebScanData,
  WebScanSearchParams
} from '@/types/projectProcess/webScan'

const webScanBaseUrl = '/asset/web'

export const getWebScanDataAPI = createListAPI<
  WebScanSearchParams,
  WebScanData
>(`${webScanBaseUrl}/list`)

/** 新增web扫描 */
export const createWebScanAPI = (data: WebScanFormData) =>
  request.post<BaseResponse>({ url: webScanBaseUrl, data })

/** web扫描详情 */
export const getWebScanDetailAPI = (id: string) =>
  request.get<DataResponse<WebScanData>>({ url: `${webScanBaseUrl}/${id}` })

/** 编辑web扫描 */
export const updateWebScanAPI = (data: WebScanFormData & { id: string }) =>
  request.put<BaseResponse>({ url: webScanBaseUrl, data })

/** 删除web扫描 */
export const deleteWebScanAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${webScanBaseUrl}/delete`, data })

/** 生成测试日志 */
export { generateSubjectLogAPI } from './baselineCheck-api.ts'
