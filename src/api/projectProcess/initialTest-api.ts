import request from '@/utils/request'
import type { InitialTestStatisticsData } from '@/types/projectProcess/initialTest'

const acceptanceResultBaseUrl = '/asset/acceptance/result'
const planBaseUrl = '/asset/plan'
const testLogBaseUrl = '/asset/acceptance/test/log'

/** 首轮测试统计（按 parent_property 字典值维度聚合，不分页） */
export const getInitialTestStatisticsAPI = () =>
  request.get<DataResponse<Array<InitialTestStatisticsData>>>({
    url: `${acceptanceResultBaseUrl}/count`
  })

/** 生成并下载执行记录表（成功返回文件流，JSON 错误响应由响应拦截器解析后抛出） */
export const exportExecutionRecordAPI = () =>
  request.download({
    url: `${planBaseUrl}/resultBatchExportSoftWare`,
    method: 'POST',
    params: {}
  })

/** 生成测试日志前检查（msg 为服务端确认提示信息） */
export const checkGenerateTestlogAPI = (projectId: string) =>
  request.get<BaseResponse>({
    url: `${acceptanceResultBaseUrl}/checkFirstNODO/${projectId}`
  })

/** 生成测试日志 */
export const generateTestlogAPI = (params: { flgFirst: boolean }) =>
  request.get<BaseResponse>({
    url: `${testLogBaseUrl}/export`,
    params
  })
