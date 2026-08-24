import request from '@/utils/request'
import type {
  TestLogData,
  TestLogSearchParams
} from '@/types/projectProcess/testLog'

const testLogBaseUrl = '/subject/log'

/** 测试日志列表 */
export const getTestLogDataAPI = (params: ListQuery<TestLogSearchParams>) =>
  request.get<DataResponse<Array<TestLogData>>>({
    url: `${testLogBaseUrl}/list`,
    params
  })

/** 下载测试日志 */
export const getTestLogBlobAPI = (params: { id: string }) =>
  request.download({
    url: `${testLogBaseUrl}/download`,
    method: 'POST',
    params
  })

/** 删除测试日志 */
export const deleteTestLogAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${testLogBaseUrl}/delete`, data })
