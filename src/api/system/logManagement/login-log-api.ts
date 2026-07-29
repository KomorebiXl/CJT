import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  LoginLogData,
  LoginLogSearchParams
} from '@/types/system/logManagement/login-log'

const loginLogBaseUrl = '/monitor/logininfor'

export const getLoginLogDataAPI = createListAPI<
  LoginLogSearchParams,
  LoginLogData
>(`${loginLogBaseUrl}/list`)
