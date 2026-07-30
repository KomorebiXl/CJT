import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  ExecutionLogData,
  ExecutionLogSearchParams,
  RunScheduledTaskPayload,
  ScheduledTaskData,
  ScheduledTaskFormData,
  ScheduledTaskSearchParams,
  ScheduledTaskStatusPayload
} from '@/types/systemMonitor/scheduledTasks'

const scheduledTaskBaseUrl = '/monitor/job'
const executionLogBaseUrl = '/monitor/jobLog'

export const getScheduledTaskListAPI = createListAPI<
  ScheduledTaskSearchParams,
  ScheduledTaskData
>(`${scheduledTaskBaseUrl}/list`)

export const getScheduledTaskDetailAPI = (jobId: string | number) =>
  request.get<DataResponse<ScheduledTaskData>>({
    url: `${scheduledTaskBaseUrl}/${jobId}`
  })

export const createScheduledTaskAPI = (data: ScheduledTaskFormData) =>
  request.post<BaseResponse>({ url: scheduledTaskBaseUrl, data })

export const updateScheduledTaskAPI = (
  data: ScheduledTaskFormData & { jobId: string | number }
) => request.put<BaseResponse>({ url: scheduledTaskBaseUrl, data })

export const deleteScheduledTasksAPI = (ids: string[]) =>
  request.post<BaseResponse>({
    url: `${scheduledTaskBaseUrl}/delete`,
    data: { ids }
  })

export const changeScheduledTaskStatusAPI = (
  data: ScheduledTaskStatusPayload
) =>
  request.put<BaseResponse>({
    url: `${scheduledTaskBaseUrl}/changeStatus`,
    data
  })

export const runScheduledTaskAPI = (data: RunScheduledTaskPayload) =>
  request.put<BaseResponse>({ url: `${scheduledTaskBaseUrl}/run`, data })

export const getExecutionLogListAPI = (params: ListQuery<ExecutionLogSearchParams>) => {
  const { dateRange, ...rest } = params
  return request.get<ListResponse<ExecutionLogData>>({
    url: `${executionLogBaseUrl}/list`,
    params: {
      ...rest,
      ...(dateRange
        ? { 'params[beginTime]': dateRange[0], 'params[endTime]': dateRange[1] }
        : {})
    }
  })
}
