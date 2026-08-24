import request from '@/utils/request'
import { createListAPI } from '@/utils/pageRequest.ts'
import type {
  TopologyDiagramCategoryData,
  TopologyDiagramData,
  TopologyDiagramSearchParams
} from '@/types/projectProcess/topologyDiagram'

const topologyDiagramBaseUrl = '/asset/topology'

export const getTopologyDiagramDataAPI = createListAPI<
  TopologyDiagramSearchParams,
  TopologyDiagramData
>(`${topologyDiagramBaseUrl}/list`)

/** 新增拓扑图 */
export const createTopologyDiagramAPI = (data: FormData) =>
  request.post<BaseResponse>({ url: `${topologyDiagramBaseUrl}`, data })

/** 拓扑图详情 */
export const getTopologyDiagramDetailAPI = (id: string) =>
  request.get<DataResponse<TopologyDiagramData>>({
    url: `${topologyDiagramBaseUrl}/${id}`
  })

/** 编辑拓扑图 */
export const updateTopologyDiagramAPI = (data: FormData) =>
  request.put<BaseResponse>({ url: `${topologyDiagramBaseUrl}`, data })

/** 删除拓扑图 */
export const deleteTopologyDiagramAPI = (data: { ids: Array<string> }) =>
  request.post<BaseResponse>({ url: `${topologyDiagramBaseUrl}/delete`, data })

/** 测试环境分类树选项 */
export const getEnvironmentCategoryOptionsAPI = () =>
  request.get<ListResponse<TopologyDiagramCategoryData>>({
    url: '/ras/category/list'
  })
