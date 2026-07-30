import request from '@/utils/request'
import type {
  CacheNameItem,
  CacheValueDetail,
  RedisOverview
} from '@/types/systemMonitor/cache'

const cacheBaseUrl = '/monitor/cache'

export const getRedisOverviewAPI = () =>
  request.get<DataResponse<RedisOverview>>({ url: cacheBaseUrl })

export const listCacheNamesAPI = () =>
  request.get<DataResponse<CacheNameItem[]>>({
    url: `${cacheBaseUrl}/getNames`
  })

export const listCacheKeysAPI = (cacheName: string) =>
  request.get<DataResponse<string[]>>({
    url: `${cacheBaseUrl}/getKeys/${encodeURIComponent(cacheName)}`
  })

export const getCacheValueAPI = (cacheName: string, cacheKey: string) =>
  request.get<DataResponse<CacheValueDetail>>({
    url: `${cacheBaseUrl}/getValue/${encodeURIComponent(cacheName)}/${encodeURIComponent(cacheKey)}`
  })

export const clearCacheNameAPI = (cacheName: string) =>
  request.delete<BaseResponse>({
    url: `${cacheBaseUrl}/clearCacheName/${encodeURIComponent(cacheName)}`
  })

export const clearCacheKeyAPI = (cacheKey: string) =>
  request.delete<BaseResponse>({
    url: `${cacheBaseUrl}/clearCacheKey/${encodeURIComponent(cacheKey)}`
  })

export const clearAllCacheAPI = () =>
  request.delete<BaseResponse>({ url: `${cacheBaseUrl}/clearCacheAll` })
