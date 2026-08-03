import type { PersonnelStatisticsRawRow } from '@/types/dataStatistics/personnelStatistics'
import request from '@/utils/request'

const personnelStatisticsBaseUrl =
  'asset/acceptance/statistics/statisticsTesterMonth'

export const getPersonnelStatisticsAPI = (year: string) => {
  if (!/^\d{4}$/.test(year)) {
    throw new Error('统计年份必须为四位数字')
  }

  return request.get<DataResponse<PersonnelStatisticsRawRow[]>>({
    url: `${personnelStatisticsBaseUrl}/${year}`
  })
}
