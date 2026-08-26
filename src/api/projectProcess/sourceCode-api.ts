import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  SourceCodeData,
  SourceCodeFormData,
  SourceCodeSearchParams,
  SubjectLoopholeOption
} from '@/types/projectProcess/sourceCode'

const sourceCodeBaseUrl = '/asset/code'

export const getSourceCodeDataAPI = createListAPI<
  SourceCodeSearchParams,
  SourceCodeData
>(`${sourceCodeBaseUrl}/list`)

/** 新增源代码 */
export const createSourceCodeAPI = (data: SourceCodeFormData) =>
  request.post<BaseResponse>({ url: `${sourceCodeBaseUrl}`, data })

/** 源代码详情 */
export const getSourceCodeDetailAPI = (id: string) =>
  request.get<DataResponse<SourceCodeData>>({
    url: `${sourceCodeBaseUrl}/${id}`
  })

/** 编辑源代码 */
export const updateSourceCodeAPI = (
  data: SourceCodeFormData & { id: string }
) => request.put<BaseResponse>({ url: `${sourceCodeBaseUrl}`, data })

/** 删除源代码 */
export const deleteSourceCodeAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${sourceCodeBaseUrl}/delete`, data })

/** 漏洞类型选项 */
export const getSubjectLoopholeOptionsAPI = (params: Record<string, any>) =>
  request.get<DataResponse<Array<SubjectLoopholeOption>>>({
    url: '/asset/standard/option',
    params
  })

/** 生成测试日志 */
export { generateSubjectLogAPI } from './baselineCheck-api.ts'
