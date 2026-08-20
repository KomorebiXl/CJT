import type {
  ToolListData,
  ToolListFormData,
  ToolListSearchParams,
  ToolTreeOption
} from '@/types/projectProcess/toolList'
import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'

const toolListBaseUrl = '/asset/tool'

export const getToolListDataAPI = createListAPI<
  ToolListSearchParams,
  ToolListData
>(`${toolListBaseUrl}/list`)

/** 新增工具 */
export const createToolListAPI = (data: ToolListFormData) =>
  request.post<BaseResponse>({ url: toolListBaseUrl, data })

/** 工具详情 */
export const getToolListDetailAPI = (id: string | number) =>
  request.get<DataResponse<ToolListData>>({ url: `${toolListBaseUrl}/${id}` })

/** 编辑工具 */
export const updateToolListAPI = (
  data: ToolListFormData & { id: string | number }
) => request.put<BaseResponse>({ url: toolListBaseUrl, data })

/** 删除工具 */
export const deleteToolListAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${toolListBaseUrl}/delete`, data })

/** 工具 / 版本 / 安全规则版本三级选项树 */
export const getToolTreeOptionsAPI = () =>
  request.get<DataResponse<Array<ToolTreeOption>>>({
    url: '/background/tool/tree/option'
  })
