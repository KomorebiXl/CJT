export type IssueLogSearchParams = {
  /** 日志名称 */
  logName: string
}

export type IssueLogData = {
  /** 日志名称（作为下载文件名） */
  logName: string
  /** 日志文件路径（本页不直接展示） */
  logPath: string
} & CommonTableData
