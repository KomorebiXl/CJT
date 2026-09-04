import request from '@/utils/request'

/**
 * 列表请求函数
 */
export const createListAPI = <TSearch, TData>(url: string) => {
  return (params: ListQuery<TSearch> | unknown) => {
    return request.get<ListResponse<TData>>({ url, params })
  }
}
