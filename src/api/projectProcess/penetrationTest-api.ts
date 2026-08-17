import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  PenetrationTestData,
  PenetrationTestSearchParams
} from '@/types/projectProcess/penetrationTest'

const penetrationTestBaseUrl = '/asset/penetrate'

export const getPenetrationTestDataAPI = createListAPI<
  PenetrationTestSearchParams,
  PenetrationTestData
>(`${penetrationTestBaseUrl}/list`)

/** 新增渗透测试（FormData：表单字段与 result_files 附件整体扁平化） */
export const createPenetrationTestAPI = (data: FormData) =>
  request.post<BaseResponse>({ url: penetrationTestBaseUrl, data })

/** 渗透测试详情 */
export const getPenetrationTestDetailAPI = (id: string) =>
  request.get<DataResponse<PenetrationTestData>>({
    url: `${penetrationTestBaseUrl}/${id}`
  })

/** 编辑渗透测试（FormData：id 与表单字段、附件一起扁平化） */
export const updatePenetrationTestAPI = (data: FormData) =>
  request.put<BaseResponse>({ url: penetrationTestBaseUrl, data })

/** 生成测试日志（复用已有日志 API 封装，type=1 为渗透测试） */
export { generateSubjectLogAPI } from './baselineCheck-api.ts'
