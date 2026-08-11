import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { HTTP_ERROR_CODE } from '@/constant/errorCode.ts'
import { handleBusinessError } from './handler/errorHandler'
import { getToken } from '../auth'
import { PROCESS_PROJECT_ID_KEY } from '@/constant/globalVariables'
import { sessionStorage } from '@/utils/storage'

/**
 * 将 subjectId 注入请求：GET 合并进 params，POST/PUT/DELETE 合并进 data（含 FormData）
 * 仅当处于项目流程作用域（PROCESS_PROJECT_ID_KEY 存在）时注入，常规页面不携带
 */
const injectSubjectId = (config: InternalAxiosRequestConfig) => {
  const subjectId = sessionStorage.get<string>(PROCESS_PROJECT_ID_KEY)
  if (!subjectId) return config
  const method = (config.method ?? 'get').toLowerCase()
  if (method === 'get') {
    config.params = { ...(config.params || {}), subjectId }
  } else if (config.data instanceof FormData) {
    if (!config.data.has('subjectId')) {
      config.data.append('subjectId', subjectId)
    }
  } else if (config.data && typeof config.data === 'object') {
    config.data = { ...config.data, subjectId }
  } else if (config.data === undefined || config.data === null) {
    config.data = { subjectId }
  }
  return config
}

/** 全局请求拦截：统一注入 token */
export const globalRequestInterceptor = (
  config: InternalAxiosRequestConfig
) => {
  const token = getToken()
  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  // 项目流程作用域内自动携带 subjectId；单次请求可通过 needSubjectId: false 跳过
  if (
    (config as unknown as { needSubjectId?: boolean }).needSubjectId !== false
  ) {
    injectSubjectId(config)
  }
  return config
}

/** 全局请求错误拦截 */
export const globalRequestInterceptorCatch = (error: unknown) => {
  console.error('[Request Error]', error)
  return Promise.reject(error)
}

/** 全局响应拦截：统一解构 data 层 */
export const globalResponseInterceptor = async (
  res: AxiosResponse<BaseResponse | Blob>
): Promise<any> => {
  if (res.data instanceof Blob) {
    // 尝试解析是否为 JSON 错误
    try {
      const text = await res.data.text()
      const json = JSON.parse(text) as BaseResponse
      handleBusinessError(json.code, json.msg)
      return Promise.reject(json)
    } catch {
      return res
    }
  }
  const { code, msg } = res.data as BaseResponse
  if (code == 200) return res.data
  handleBusinessError(code, msg)
  return Promise.reject({ code, msg })
}

/** 全局响应错误拦截：统一 HTTP 错误提示 */
export const globalResponseInterceptorCatch = (error: any) => {
  const status = error?.response?.status
  const msg = HTTP_ERROR_CODE[status] ?? `未知错误(${status ?? '网络错误'})`
  console.error('错误的响应', msg, error)
  return Promise.reject(error)
}
