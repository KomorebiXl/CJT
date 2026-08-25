export type ReportManagementSearchParams = {
  /** 报告名称 */
  reportName: string
  /** 生成人 */
  createByName: string
}

export type ReportManagementData = {
  /** 报告名称（作为下载文件名） */
  reportName: string
  /** 生成人 */
  createByName: string
  /** 项目 id */
  subjectId: string
  /** 报告存放地址 */
  reportPath: string
} & CommonTableData

/** 生成报告响应：confirmStep 存在表示服务端要求二次确认，msg 为确认提示 */
export type GenerateReportResponse = BaseResponse & {
  confirmStep?: number
}
