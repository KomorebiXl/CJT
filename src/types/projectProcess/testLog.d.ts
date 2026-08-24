export type TestLogSearchParams = {
  /** 测试日志名称 */
  name: string
}

export type TestLogData = {
  /** 测试日志名称 */
  name: string
  /** 生成人 */
  createByName: string
} & CommonTableData
