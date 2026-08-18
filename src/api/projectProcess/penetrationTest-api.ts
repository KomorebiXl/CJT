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

/** 新增渗透测试 */
export const createPenetrationTestAPI = (data: FormData) =>
  request.post<BaseResponse>({ url: penetrationTestBaseUrl, data })

/** 渗透测试详情 */
export const getPenetrationTestDetailAPI = (id: string) =>
  request.get<DataResponse<PenetrationTestData>>({
    url: `${penetrationTestBaseUrl}/${id}`
  })

/** 编辑渗透测试 */
export const updatePenetrationTestAPI = (data: FormData) =>
  request.put<BaseResponse>({ url: penetrationTestBaseUrl, data })

/** 生成测试日志 */
export { generateSubjectLogAPI } from './baselineCheck-api.ts'
