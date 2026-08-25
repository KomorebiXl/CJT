import request from '@/utils/request'
import type {
  ArchiveMaterialsData,
  ArchiveMaterialsSearchParams,
  GenerateArchiveResponse
} from '@/types/projectProcess/archiveMaterials'

const archiveMaterialsBaseUrl = '/subject/archive'

/** 归档资料列表（返回 data 数组，不分页；id 为当前项目 ID） */
export const getArchiveMaterialsDataAPI = (
  params: ListQuery<ArchiveMaterialsSearchParams> & { id: string }
) =>
  request.get<DataResponse<Array<ArchiveMaterialsData>>>({
    url: `${archiveMaterialsBaseUrl}/list`,
    params
  })

/** 下载归档资料（参数为当前行数据，文件名取 row.name） */
export const getArchiveMaterialsBlobAPI = (params: ArchiveMaterialsData) =>
  request.download({
    url: `${archiveMaterialsBaseUrl}/download`,
    method: 'POST',
    params
  })

/** 生成归档资料（GET；响应含更高 confirmStep 时需带新步骤再次调用） */
export const generateSubjectArchiveAPI = (params: {
  confirmStep: number
  id: string
}) =>
  request.get<GenerateArchiveResponse>({
    url: `${archiveMaterialsBaseUrl}/generate`,
    params
  })

/** 删除归档资料（源契约传整行数据，非 id 数组） */
export const deleteArchiveMaterialsAPI = (data: ArchiveMaterialsData) =>
  request.post<BaseResponse>({ url: `${archiveMaterialsBaseUrl}/delete`, data })
