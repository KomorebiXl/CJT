export type InitialTestStatisticsData = {
  /** 关联 parent_property 字典值的分类标识 */
  feature: string
  /** 总量 */
  total: number
  /** 未完成 */
  unFinish: number
  /** 符合 */
  conformity: number
  /** 不符合 */
  unconformity: number
  /** 支持性文件问题数 */
  supportiveClosingQuestions: number
  /** 环境不具备 */
  envNoDo: number
}
