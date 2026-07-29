import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  OnlineUserData,
  OnlineUserSearchParams
} from '@/types/systemMonitor/onlineUsers'

const onlineUserBaseUrl = '/monitor/online'

export const getOnlineUserDataAPI = createListAPI<
  OnlineUserSearchParams,
  OnlineUserData
>(`${onlineUserBaseUrl}/list`)

export const forceLogoutOnlineUserAPI = (tokenId: string) => {
  return request.delete<BaseResponse>({
    url: `${onlineUserBaseUrl}/${encodeURIComponent(tokenId)}`
  })
}
