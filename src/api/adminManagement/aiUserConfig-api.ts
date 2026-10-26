import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  AiUserConfigCurrentData,
  AiUserConfigGlobalStatus,
  AiUserConfigSaveParams,
  AiUserConfigStatusData,
  AiUserConfigTestResult
} from '@/types/adminManagement/aiUserConfig'

const aiUserConfigBaseUrl = '/system/aiUserConfig'

/** 当前登录人配置（掩码视图） */
export const getAiUserConfigCurrentAPI = () =>
  request.get<DataResponse<AiUserConfigCurrentData>>({
    url: `${aiUserConfigBaseUrl}/current`
  })

/** 保存/更新当前登录人密钥 */
export const saveAiUserConfigCurrentAPI = (data: AiUserConfigSaveParams) =>
  request.post<BaseResponse>({ url: `${aiUserConfigBaseUrl}/current`, data })

/** 清除当前登录人密钥（回退使用全局密钥） */
export const clearAiUserConfigCurrentAPI = () =>
  request.delete<BaseResponse>({ url: `${aiUserConfigBaseUrl}/current` })

/** 用填写中的密钥测试连通性（不落库） */
export const testAiUserConfigCurrentAPI = (data: AiUserConfigSaveParams) =>
  request.post<DataResponse<AiUserConfigTestResult>>({
    url: `${aiUserConfigBaseUrl}/current/test`,
    data
  })

/** 管理页：全量用户密钥状态（无搜索条件、不分页） */
export const getAiUserConfigListAPI = createListAPI<never, AiUserConfigStatusData>(
  `${aiUserConfigBaseUrl}/list`
)

/** 管理页：全局兜底密钥配置状态 */
export const getAiUserConfigGlobalStatusAPI = () =>
  request.get<DataResponse<AiUserConfigGlobalStatus>>({
    url: `${aiUserConfigBaseUrl}/globalStatus`
  })

/** 管理页：重置指定用户密钥 */
export const resetAiUserConfigAPI = (userId: string) =>
  request.post<BaseResponse>({ url: `${aiUserConfigBaseUrl}/reset`, data: { userId } })
