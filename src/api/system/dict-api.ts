import request from '@/utils/request'
import type {
  DictData,
  DictDataFormData,
  DictDataSearchParams,
  DictTypeData,
  DictTypeFormData,
  DictTypeSearchParams
} from '@/types/system/dict'
import { createListAPI } from '@/utils/pageRequest.ts'

const dictTypeBaseUrl = '/system/dict/type'
const dictDataBaseUrl = '/system/dict/data'

export const getDictTypeDataAPI = createListAPI<
  DictTypeSearchParams,
  DictTypeData
>(`${dictTypeBaseUrl}/list`)

export const getDictTypeDetailAPI = (dictId: string | number) =>
  request.get<DataResponse<DictTypeData>>({
    url: `${dictTypeBaseUrl}/${dictId}`
  })

export const createDictTypeAPI = (data: DictTypeFormData) =>
  request.post<BaseResponse>({ url: dictTypeBaseUrl, data })

export const updateDictTypeAPI = (
  data: DictTypeFormData & { dictId: string | number }
) => request.put<BaseResponse>({ url: dictTypeBaseUrl, data })

export const deleteDictTypeAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${dictTypeBaseUrl}/delete`, data })

export const refreshDictTypeCacheAPI = () =>
  request.delete<BaseResponse>({ url: `${dictTypeBaseUrl}/refreshCache` })

export const getDictTypeOptionsAPI = () =>
  request.get<DataResponse<Array<DictTypeData>>>({
    url: `${dictTypeBaseUrl}/optionselect`
  })

/**
 * @description 查询字典数据列表
 */
export const getDictListData = createListAPI<DictDataSearchParams, DictData>(
  `${dictDataBaseUrl}/list`
)

/**
 * @description 查询字典详情数据
 */
export const getDictDetailData = (dictCode: string | number) =>
  request.get<DataResponse<DictData>>({ url: `${dictDataBaseUrl}/${dictCode}` })

/**
 * @description 根据字典类型查询字典数据信息
 */
export const getDictDataByDictType = (dictType: string) => {
  return request.get<DataResponse<Array<DictData>>>({
    url: `${dictDataBaseUrl}/type/${dictType}`
  })
}

export const createDictDataAPI = (data: DictDataFormData) =>
  request.post<BaseResponse>({ url: dictDataBaseUrl, data })

export const updateDictDataAPI = (
  data: DictDataFormData & { dictCode: string | number }
) => request.put<BaseResponse>({ url: dictDataBaseUrl, data })

export const deleteDictDataAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${dictDataBaseUrl}/delete`, data })
