import request from '@/utils/request'
import type { ServerStatusResponse } from '@/types/systemMonitor/serverStatus'

const serverStatusBaseUrl = '/monitor/server'

export const getServerStatusAPI = () => {
  return request.get<ServerStatusResponse>({ url: serverStatusBaseUrl })
}
