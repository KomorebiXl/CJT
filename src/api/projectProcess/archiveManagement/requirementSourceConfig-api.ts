import request from '@/utils/request'
import type {
  RequirementSourceConfigData,
  RequirementSourceConfigFormData,
  RequirementSourceConfigSearchParams
} from '@/types/projectProcess/archiveManagement/requirementSourceConfig'
import { createListAPI } from '@/utils/pageRequest.ts'

const requirementSourceConfigBaseUrl = '/background/config'

/** 需求来源配置列表 */
export const getRequirementSourceConfigDataAPI = createListAPI<
  RequirementSourceConfigSearchParams,
  RequirementSourceConfigData
>(`${requirementSourceConfigBaseUrl}/list`)

/** 需求来源配置详情 */
export const getRequirementSourceConfigDetailAPI = (id: string) =>
  request.get<DataResponse<RequirementSourceConfigData>>({
    url: `${requirementSourceConfigBaseUrl}/${id}`
  })

/** 更新需求来源配置 */
export const updateRequirementSourceConfigAPI = (
  data:
    | (RequirementSourceConfigFormData & { id: string })
    | { id: string; enable: string }
) =>
  request.put<BaseResponse>({
    url: `${requirementSourceConfigBaseUrl}`,
    data
  })
