import request from '@/utils/request'
import type { RegressionTestStatisticsData } from '@/types/projectProcess/regressionTest'

const acceptanceResultBaseUrl = '/asset/acceptance/result'

/** 回归测试统计（按 parent_property 字典值维度聚合，不分页） */
export const getRegressionTestStatisticsAPI = () =>
  request.get<DataResponse<Array<RegressionTestStatisticsData>>>({
    url: `${acceptanceResultBaseUrl}/regressCount`
  })
