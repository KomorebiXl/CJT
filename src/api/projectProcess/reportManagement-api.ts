import request from '@/utils/request'
import type {
  GenerateReportResponse,
  ReportManagementData,
  ReportManagementSearchParams
} from '@/types/projectProcess/reportManagement'

const reportManagementBaseUrl = '/system/report'

/** 报告列表（返回 data 数组，不分页） */
export const getReportManagementDataAPI = (
  params: ListQuery<ReportManagementSearchParams>
) =>
  request.get<DataResponse<Array<ReportManagementData>>>({
    url: `${reportManagementBaseUrl}/list`,
    params
  })

/** 下载报告 */
export const getReportManagementBlobAPI = (params: {
  id: string
  subjectId: string
}) =>
  request.download({
    url: `${reportManagementBaseUrl}/download`,
    method: 'POST',
    params
  })

/** 生成报告（POST，body 为 params 包装；响应含更高 confirmStep 时需带新步骤再次调用） */
export const generateSubjectReportAPI = (data: {
  params: {
    id: string
    confirmStep: number
    acceptanceType?: number
  }
}) =>
  request.post<GenerateReportResponse>({
    url: `${reportManagementBaseUrl}/export`,
    data
  })

/** 删除报告（后端 @RequestBody 单对象 { id }，非同域 { ids } 形态） */
export const deleteReportManagementAPI = (data: { id: string }) =>
  request.post<BaseResponse>({ url: `${reportManagementBaseUrl}/delete`, data })

/** 重构序号（subjectId 由项目流程拦截器自动注入） */
export const batchRebuildOrderAPI = () =>
  request.post<BaseResponse>({
    url: '/asset/acceptance/result/batchRebuildSerial'
  })
