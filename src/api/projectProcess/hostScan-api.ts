import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  HostScanData,
  HostScanFormData,
  HostScanSearchParams
} from '@/types/projectProcess/hostScan'

const hostScanBaseUrl = '/asset/host'

export const getHostScanDataAPI = createListAPI<
  HostScanSearchParams,
  HostScanData
>(`${hostScanBaseUrl}/list`)

/** 新增主机扫描 */
export const createHostScanAPI = (data: HostScanFormData) =>
  request.post<BaseResponse>({ url: hostScanBaseUrl, data })

/** 主机扫描详情 */
export const getHostScanDetailAPI = (id: string) =>
  request.get<DataResponse<HostScanData>>({ url: `${hostScanBaseUrl}/${id}` })

/** 编辑主机扫描 */
export const updateHostScanAPI = (data: HostScanFormData & { id: string }) =>
  request.put<BaseResponse>({ url: hostScanBaseUrl, data })

/** 生成测试日志（复用已有日志 API 封装，type=3 为主机扫描） */
export { generateSubjectLogAPI } from './baselineCheck-api.ts'
