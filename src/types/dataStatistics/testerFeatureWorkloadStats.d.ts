export type TesterFeatureWorkloadStatsValue = string | number

export type TesterFeatureWorkloadStatsRawRow = {
  测试人员: string
  功能性: TesterFeatureWorkloadStatsValue
  信息安全性: TesterFeatureWorkloadStatsValue
  兼容性: TesterFeatureWorkloadStatsValue
  可靠性: TesterFeatureWorkloadStatsValue
  易用性: TesterFeatureWorkloadStatsValue
  可移植性: TesterFeatureWorkloadStatsValue
  维护性: TesterFeatureWorkloadStatsValue
  用户文档集: TesterFeatureWorkloadStatsValue
  性能效率: TesterFeatureWorkloadStatsValue
  总测试项条数: TesterFeatureWorkloadStatsValue
  [key: string]: TesterFeatureWorkloadStatsValue
}

export type TesterFeatureWorkloadStatsSearchParams = {
  dateRangeValue: [string, string] | []
}
