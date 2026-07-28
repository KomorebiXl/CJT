import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  OperlogData,
  OperlogSearchParams
} from '@/types/system/logManagement/operlog'

const operlogBaseUrl = '/monitor/operlog'

export const getOperlogDataAPI = createListAPI<
  OperlogSearchParams,
  OperlogData
>(`${operlogBaseUrl}/list`)
