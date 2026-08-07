import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/** 拦截器钩子 */
export interface SCRequestInterceptors<T = AxiosResponse> {
  requestInterceptor?: (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig
  requestInterceptorCatch?: (err: any) => any
  responseInterceptor?: (res: T) => T
  responseInterceptorCatch?: (error: any) => any
}

/* 实例化配置 基于AxiosRequestConfig基础上进行扩展 */
export interface SCRequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: SCRequestInterceptors<T>
  /** 是否自动注入 subjectId（项目流程作用域内请求默认注入，个别接口可设 false 跳过） */
  needSubjectId?: boolean
}

/* 错误码响应中间层类型 */
export type BusinessErrorHandler = (message: string) => void
