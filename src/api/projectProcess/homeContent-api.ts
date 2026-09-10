import request from '@/utils/request'
import type { HomeContentForm } from '@/types/projectProcess/homeContent'
import { subjectBaseUrl } from '@/api/projectManagement-api.ts'

/** 主页内容整体保存 */
export const updateHomeContentAPI = (data: HomeContentForm) =>
  request.put<BaseResponse>({ url: subjectBaseUrl, data })
