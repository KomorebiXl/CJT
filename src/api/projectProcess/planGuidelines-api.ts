import request from '@/utils/request'
import type { PlanGuidelinesStatisticsData } from '@/types/projectProcess/planGuidelines'

const planBaseUrl = '/asset/plan'
const acceptanceResultBaseUrl = '/asset/acceptance/result'

/** 项目总体统计（按 parent_property 字典值维度聚合，不分页） */
export const getPlanGuidelinesStatisticsAPI = () =>
  request.get<DataResponse<Array<PlanGuidelinesStatisticsData>>>({
    url: `${acceptanceResultBaseUrl}/globalCount`
  })

/** 验收测试方案批量导入（FormData 键为所选字典值、值为对应 Excel 文件；subjectId 由流程拦截器注入） */
export const batchImportTestPlanAPI = (data: FormData) =>
  request.post<DataResponse<string>>({
    url: `${planBaseUrl}/batchImportPlan`,
    data
  })

/** 方案模板（压缩包）下载 */
export const downloadPlanTemplateAPI = (params: { allTem: boolean }) =>
  request.download({
    url: `${planBaseUrl}/template`,
    params
  })
