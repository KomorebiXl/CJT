import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  BaselineCheckData,
  BaselineCheckSearchParams
} from '@/types/projectProcess/baselineCheck'

const baselineCheckBaseUrl = '/asset/baseline'

export const getBaselineCheckDataAPI = createListAPI<
  BaselineCheckSearchParams,
  BaselineCheckData
>(`${baselineCheckBaseUrl}/list`)

/** 新增基线核查（FormData：表单字段与 resultDescription_files 附件整体扁平化） */
export const createBaselineCheckAPI = (data: FormData) =>
  request.post<BaseResponse>({ url: baselineCheckBaseUrl, data })

/** 基线核查详情 */
export const getBaselineCheckDetailAPI = (id: string) =>
  request.get<DataResponse<BaselineCheckData>>({
    url: `${baselineCheckBaseUrl}/${id}`
  })

/** 编辑基线核查（FormData：id 与表单字段、附件一起扁平化） */
export const updateBaselineCheckAPI = (data: FormData) =>
  request.put<BaseResponse>({ url: baselineCheckBaseUrl, data })

/** 删除基线核查 */
export const deleteBaselineCheckAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${baselineCheckBaseUrl}/delete`, data })

/**
 * 生成测试日志
 */
export const generateSubjectLogAPI = (data: { step: string; type: string }) =>
  request.post<BaseResponse>({ url: '/subject/log', data })
