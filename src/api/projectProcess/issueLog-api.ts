import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  IssueLogData,
  IssueLogSearchParams
} from '@/types/projectProcess/issueLog'

const issueLogBaseUrl = '/asset/acceptance/test/log'

/** 问题日志列表（分页；流程作用域 subjectId 由全局拦截器自动注入） */
export const getIssueLogDataAPI = createListAPI<
  IssueLogSearchParams,
  IssueLogData
>(`${issueLogBaseUrl}/list`)

/** 下载问题日志（POST，文件名取行数据 logName） */
export const getIssueLogBlobAPI = (params: { id: string }) =>
  request.download({
    url: `${issueLogBaseUrl}/download`,
    method: 'POST',
    params
  })

/** 删除问题日志（源契约单条 { id }；地址照源无前导斜杠，axios 拼接结果一致） */
export const deleteIssueLogAPI = (data: { id: string }) =>
  request.post<BaseResponse>({
    url: 'asset/acceptance/test/log/delete',
    data
  })
