export type ScheduledTaskSearchParams = {
  jobName?: string
  jobGroup?: string
  status?: string | number
}

export type ScheduledTaskData = {
  jobId: number
  jobName: string
  jobGroup: string
  invokeTarget: string
  cronExpression: string
  status: string | number
  misfirePolicy?: string | number
  concurrent?: string | number
  nextValidTime?: string | null
  createTime?: string | null
  createBy?: string | null
  updateBy?: string | null
  updateTime?: string | null
  remark?: string | null
}

export type ScheduledTaskFormData = {
  jobName: string
  jobGroup: string
  invokeTarget: string
  cronExpression: string
  status: string
  misfirePolicy: string
  concurrent: string
}

export type ScheduledTaskStatusPayload = {
  jobId: string | number
  status: string | number
}

export type RunScheduledTaskPayload = {
  jobId: string | number
  jobGroup: string
}

export type ExecutionLogSearchParams = {
  jobId?: string | number
  jobName?: string
  jobGroup?: string
  status?: string | number
  dateRange?: [string, string]
}

export type ExecutionLogData = {
  jobLogId: string | number
  jobName?: string
  jobGroup?: string
  invokeTarget?: string
  jobMessage?: string
  status?: string | number
  createTime?: string | null
  exceptionInfo?: string | null
}
