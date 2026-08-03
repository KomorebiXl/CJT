import type { TesterFeatureWorkloadStatsRawRow } from '@/types/dataStatistics/testerFeatureWorkloadStats'
import request from '@/utils/request'

const testerFeatureWorkloadStatsBaseUrl =
  'asset/acceptance/statistics/statisticsTesterByFeature'

export const getTesterFeatureWorkloadStatsData = (
  dateRange?: [string, string]
) => {
  const url =
    dateRange?.length === 2
      ? `${testerFeatureWorkloadStatsBaseUrl}/${dateRange[0]}/${dateRange[1]}`
      : testerFeatureWorkloadStatsBaseUrl

  return request.get<DataResponse<TesterFeatureWorkloadStatsRawRow[]>>({ url })
}
