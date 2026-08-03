export type PersonnelStatisticsRawRow = {
  测试人员: string
  [key: string]: string | number
}

export type PersonnelStatisticsRow = {
  name: string
  total: number
  [key: string]: string | number
}

export type PersonnelStatisticsSearchParams = {
  year: string
}
